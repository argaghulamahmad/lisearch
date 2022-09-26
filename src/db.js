import Dexie from 'dexie';

const db = new Dexie('LiSearch');

db.version(2).stores({
    connections: '++id, firstName, lastName, emailAddress, company, position, connectedOn, fullName',
    companies: '++id, company, connections',
    positions: '++id, title, position, company'
});

export default db
