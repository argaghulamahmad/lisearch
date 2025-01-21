/* eslint-disable no-restricted-globals */

const processConnections = (csv) => {
    const csvKeys = csv.data.shift();
    const camelCaseKeys = csvKeys.map(key =>
        key.replace(/\s(.)/g, $1 => $1.toUpperCase())
           .replace(/\s/g, "")
           .replace(/^(.)/, $1 => $1.toLowerCase())
    );

    return csv.data.reduce((accumulator, currentValue) => {
        const [firstName, lastName, emailAddress, company, position, connectedOn] = currentValue;
        if (firstName && lastName) {
            const connection = {
                ...Object.fromEntries(camelCaseKeys.map(key => [key, ""])),
                firstName,
                lastName,
                emailAddress,
                company,
                position,
                connectedOn,
                fullName: `${firstName} ${lastName}`,
            };
            return [...accumulator, connection];
        }
        return accumulator;
    }, []);
};

const processCompanies = (connections) => {
    const companiesMap = new Map();
    connections.forEach(({ company, firstName, lastName, position }) => {
        if (!company) return;

        if (!companiesMap.has(company)) {
            companiesMap.set(company, { company, connections: [] });
        }
        companiesMap.get(company).connections.push({
            fullName: `${firstName} ${lastName}`,
            position
        });
    });
    return Array.from(companiesMap.values());
};

const processPositions = (connections) => {
    const positionsMap = new Map();
    connections.forEach(({ position, company }) => {
        if (!position || !company) return;

        const title = `${position} at ${company}`;
        positionsMap.set(title, { title, position, company });
    });
    return Array.from(positionsMap.values());
};

self.addEventListener('message', async (e) => {
    try {
        const { csv } = e.data;

        // Process data in chunks
        const connections = processConnections(csv);
        self.postMessage({ type: 'progress', data: 33 });

        const companies = processCompanies(connections);
        self.postMessage({ type: 'progress', data: 66 });

        const positions = processPositions(connections);
        self.postMessage({ type: 'progress', data: 100 });

        // Send back processed data
        self.postMessage({
            type: 'complete',
            data: {
                connections,
                companies,
                positions
            }
        });
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error.message
        });
    }
});