import Dexie from 'dexie';
import { logger } from './services/logger';

// Custom error classes
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
    }
}

// Cache configuration
const CACHE_CONFIG = {
    DEFAULT_MAX_AGE: 5 * 60 * 1000, // 5 minutes
    EXTENDED_MAX_AGE: 30 * 60 * 1000, // 30 minutes
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
    CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
};

// Database schema versions
const SCHEMA_VERSION = 2;

// Required fields for each schema
const REQUIRED_FIELDS = {
    connections: ['firstName', 'lastName', 'emailAddress', 'fullName'],
    companies: ['company'],
    positions: ['title', 'company']
};

// Schema definitions
const SCHEMAS = {
    connections: '++id, firstName, lastName, emailAddress, company, position, connectedOn, fullName',
    companies: '++id, company, connections',
    positions: '++id, title, position, company'
};

// Schema validation rules
const VALIDATION_RULES = {
    connections: {
        firstName: (value) => typeof value === 'string' && value.trim().length > 0,
        lastName: (value) => typeof value === 'string' && value.trim().length > 0,
        emailAddress: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        company: (value) => !value || typeof value === 'string',
        position: (value) => !value || typeof value === 'string',
        connectedOn: (value) => !value || typeof value === 'string',
        fullName: (value) => typeof value === 'string' && value.trim().length > 0
    }
};

class LiSearchDatabase extends Dexie {
    constructor() {
        super('LiSearchDB');

        // Optimize indexes for common queries
        this.version(1).stores({
            companies: '++id, company, *tags, updatedAt',
            connections: '++id, fullName, position, companyId, *tags, updatedAt',
            positions: '++id, position, company, updatedAt',
            cache: 'key, data, timestamp, size'
        });

        this.initializeHooks();
        this.initializeCacheCleanup();
    }

    initializeCacheCleanup() {
        // Periodic cache cleanup
        setInterval(() => this.cleanupCache(), CACHE_CONFIG.CLEANUP_INTERVAL);
    }

    async cleanupCache() {
        try {
            logger.startTimer('cacheCleanup');
            const now = Date.now();

            // Remove expired entries
            await this.cache
                .where('timestamp')
                .below(now - CACHE_CONFIG.EXTENDED_MAX_AGE)
                .delete();

            // Check total cache size
            const totalSize = await this.getCacheSize();
            if (totalSize > CACHE_CONFIG.MAX_CACHE_SIZE) {
                // Remove oldest entries until under limit
                const entries = await this.cache
                    .orderBy('timestamp')
                    .toArray();

                let currentSize = totalSize;
                let deleteCount = 0;

                while (currentSize > CACHE_CONFIG.MAX_CACHE_SIZE && deleteCount < entries.length) {
                    currentSize -= entries[deleteCount].size || 0;
                    deleteCount++;
                }

                if (deleteCount > 0) {
                    const oldestTimestamp = entries[deleteCount - 1].timestamp;
                    await this.cache
                        .where('timestamp')
                        .below(oldestTimestamp)
                        .delete();

                    logger.info('Cache cleaned up', {
                        entriesRemoved: deleteCount,
                        newSize: currentSize
                    });
                }
            }
        } catch (error) {
            logger.error('Cache cleanup failed', { error: error.message });
        } finally {
            logger.endTimer('cacheCleanup');
        }
    }

    async getCached(key, maxAge = CACHE_CONFIG.DEFAULT_MAX_AGE) {
        const cached = await this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < maxAge) {
            logger.debug('Cache hit', { key });
            return cached.data;
        }
        logger.debug('Cache miss', { key });
        return null;
    }

    async setCache(key, data) {
        const serialized = JSON.stringify(data);
        const size = new Blob([serialized]).size;

        // Don't cache if single entry is too large
        if (size > CACHE_CONFIG.MAX_CACHE_SIZE * 0.1) {
            logger.warn('Cache entry too large', { key, size });
            return;
        }

        await this.cache.put({
            key,
            data,
            timestamp: Date.now(),
            size
        });

        logger.debug('Cache set', { key, size });
    }

    // Optimized company queries
    async getCompaniesPaginated(page = 1, pageSize = 100, searchTerm = '', options = {}) {
        const cacheKey = `companies_${page}_${pageSize}_${searchTerm}_${JSON.stringify(options)}`;

        try {
            // Try cache first
            const cached = await this.getCached(cacheKey);
            if (cached) return cached;

            // Build query
            let query = this.companies;

            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                // Use compound index if available
                if (options.tags) {
                    query = query
                        .where('tags')
                        .anyOf(options.tags)
                        .filter(company =>
                            company.company.toLowerCase().includes(searchLower)
                        );
                } else {
                    query = query.filter(company =>
                        company.company.toLowerCase().includes(searchLower)
                    );
                }
            }

            // Add sorting
            if (options.sortBy) {
                query = query.orderBy(options.sortBy);
            }

            const offset = (page - 1) * pageSize;

            // Execute count and data queries in parallel
            const [total, items] = await Promise.all([
                query.count(),
                query.offset(offset).limit(pageSize).toArray()
            ]);

            const result = {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };

            // Cache the result
            await this.setCache(cacheKey, result);

            return result;
        } catch (error) {
            logger.error('Failed to fetch companies', { error: error.message });
            throw new DatabaseError('Failed to fetch companies: ' + error.message);
        }
    }

    // Bulk operations with optimized batching
    async bulkAddCompanies(companies, progressCallback) {
        const batchSize = 100;
        const total = companies.length;
        let processed = 0;

        try {
            logger.startTimer('bulkAddCompanies');

            // Process in batches
            for (let i = 0; i < total; i += batchSize) {
                const batch = companies.slice(i, i + batchSize).map(company => ({
                    ...company,
                    updatedAt: Date.now(),
                    tags: this.generateTags(company)
                }));

                await this.transaction('rw', this.companies, async () => {
                    await this.companies.bulkAdd(batch);
                });

                processed += batch.length;
                if (progressCallback) {
                    progressCallback(processed / total);
                }

                logger.debug('Batch processed', {
                    processed,
                    total,
                    progress: `${((processed / total) * 100).toFixed(1)}%`
                });
            }

            // Clear relevant caches
            await this.clearCacheByPrefix('companies_');

            logger.info('Bulk add completed', { total: processed });
        } catch (error) {
            logger.error('Bulk add failed', { error: error.message });
            throw new DatabaseError('Bulk add failed: ' + error.message);
        } finally {
            logger.endTimer('bulkAddCompanies');
        }
    }

    // Helper methods
    generateTags(company) {
        const tags = new Set();
        if (company.company) {
            // Add company name words as tags
            company.company.toLowerCase().split(/\W+/).forEach(tag => {
                if (tag.length > 2) tags.add(tag);
            });
        }
        return Array.from(tags);
    }

    async clearCacheByPrefix(prefix) {
        const keys = await this.cache
            .where('key')
            .startsWith(prefix)
            .keys();

        await this.cache.bulkDelete(keys);
        logger.debug('Cache cleared', { prefix, count: keys.length });
    }

    async handleUpgrade(tx) {
        // Handle schema upgrades here
        // Example: if (oldVersion < 2) { migrate data }
    }

    initializeHooks() {
        // Add validation hooks
        this.connections.hook('creating', (primKey, obj) => {
            this.validateConnection(obj);
        });

        this.connections.hook('updating', (mods, primKey, obj) => {
            this.validateConnection({ ...obj, ...mods });
        });
    }

    validateConnection(connection) {
        const rules = VALIDATION_RULES.connections;
        const required = REQUIRED_FIELDS.connections;

        // Check required fields
        for (const field of required) {
            if (!connection[field]) {
                throw new ValidationError(`Missing required field: ${field}`);
            }
        }

        // Validate fields
        for (const [field, validator] of Object.entries(rules)) {
            if (connection[field] !== undefined && !validator(connection[field])) {
                throw new ValidationError(`Invalid ${field} in connection`);
            }
        }
    }

    async addConnection(connection) {
        try {
            return await this.connections.add(connection);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new DatabaseError(`Failed to add connection: ${error.message}`);
        }
    }

    async addCompany(company) {
        try {
            if (!company.company || typeof company.company !== 'string') {
                throw new ValidationError('Invalid company name');
            }
            return await this.companies.add(company);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new DatabaseError(`Failed to add company: ${error.message}`);
        }
    }

    async addPosition(position) {
        try {
            if (!position.title || !position.company) {
                throw new ValidationError('Title and company are required for positions');
            }
            return await this.positions.add(position);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new DatabaseError(`Failed to add position: ${error.message}`);
        }
    }

    async searchConnections(query) {
        if (!query || typeof query !== 'string') {
            throw new ValidationError('Invalid search query');
        }

        try {
            const searchTerm = query.toLowerCase().trim();
            return await this.connections
                .filter(conn => {
                    return (
                        (conn.fullName && conn.fullName.toLowerCase().includes(searchTerm)) ||
                        (conn.company && conn.company.toLowerCase().includes(searchTerm)) ||
                        (conn.position && conn.position.toLowerCase().includes(searchTerm))
                    );
                })
                .toArray();
        } catch (error) {
            throw new DatabaseError(`Search failed: ${error.message}`);
        }
    }

    async cleanup() {
        try {
            await this.close();
        } catch (error) {
            console.error('Error during database cleanup:', error);
        }
    }

    // Analytics and monitoring
    async getStats() {
        const stats = {
            totalCompanies: await this.companies.count(),
            totalConnections: await this.connections.count(),
            totalPositions: await this.positions.count(),
            dbSize: await this.getDBSize(),
            cacheSize: await this.getCacheSize()
        };
        return stats;
    }

    async getDBSize() {
        const tables = ['companies', 'connections', 'positions', 'cache'];
        let totalSize = 0;

        for (const table of tables) {
            const items = await this[table].toArray();
            totalSize += new Blob([JSON.stringify(items)]).size;
        }

        return totalSize;
    }

    async getCacheSize() {
        const cacheItems = await this.cache.toArray();
        return new Blob([JSON.stringify(cacheItems)]).size;
    }

    // Performance monitoring
    async measureQueryTime(queryFn) {
        const start = performance.now();
        try {
            const result = await queryFn();
            const duration = performance.now() - start;
            console.log(`Query took ${duration}ms`);
            return result;
        } catch (error) {
            console.error(`Query failed after ${performance.now() - start}ms:`, error);
            throw error;
        }
    }
}

const db = new LiSearchDatabase();

// Handle cleanup on page unload
window.addEventListener('unload', () => {
    db.cleanup().catch(error => logger.error('Cleanup failed', { error: error.message }));
});

export default db;
