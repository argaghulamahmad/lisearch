import Dexie from 'dexie';

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
        super('LiSearch');
        this.version(SCHEMA_VERSION)
            .stores(SCHEMAS)
            .upgrade(tx => this.handleUpgrade(tx));
        this.initializeHooks();
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
}

const db = new LiSearchDatabase();

// Handle cleanup on page unload
window.addEventListener('unload', () => {
    db.cleanup().catch(console.error);
});

export default db;
