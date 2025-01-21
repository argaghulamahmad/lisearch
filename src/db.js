import Dexie from 'dexie';

// Database schema versions
const SCHEMA_VERSION = 2;

// Schema definitions
const SCHEMAS = {
    connections: '++id, firstName, lastName, emailAddress, company, position, connectedOn, fullName',
    companies: '++id, company, connections',
    positions: '++id, title, position, company'
};

// Schema validation rules
const VALIDATION_RULES = {
    connections: {
        firstName: (value) => typeof value === 'string' && value.length > 0,
        lastName: (value) => typeof value === 'string' && value.length > 0,
        emailAddress: (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        company: (value) => typeof value === 'string',
        position: (value) => typeof value === 'string',
        connectedOn: (value) => typeof value === 'string',
        fullName: (value) => typeof value === 'string' && value.length > 0
    }
};

class LiSearchDatabase extends Dexie {
    constructor() {
        super('LiSearch');
        this.version(SCHEMA_VERSION).stores(SCHEMAS);
        this.initializeHooks();
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
        for (const [field, validator] of Object.entries(rules)) {
            if (connection[field] !== undefined && !validator(connection[field])) {
                throw new Error(`Invalid ${field} in connection`);
            }
        }
    }

    async addConnection(connection) {
        try {
            return await this.connections.add(connection);
        } catch (error) {
            console.error('Error adding connection:', error);
            throw error;
        }
    }

    async addCompany(company) {
        try {
            return await this.companies.add(company);
        } catch (error) {
            console.error('Error adding company:', error);
            throw error;
        }
    }

    async addPosition(position) {
        try {
            return await this.positions.add(position);
        } catch (error) {
            console.error('Error adding position:', error);
            throw error;
        }
    }

    async searchConnections(query) {
        try {
            return await this.connections
                .where('fullName')
                .startsWithIgnoreCase(query)
                .or('company')
                .startsWithIgnoreCase(query)
                .toArray();
        } catch (error) {
            console.error('Error searching connections:', error);
            throw error;
        }
    }
}

const db = new LiSearchDatabase();
export default db;
