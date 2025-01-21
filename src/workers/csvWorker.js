/* eslint-disable no-restricted-globals */

// Constants
const PROGRESS_STEPS = {
    CONNECTIONS: 33,
    COMPANIES: 66,
    COMPLETE: 100
};

// Utility functions
const toCamelCase = (key) => {
    return key
        .replace(/\s(.)/g, $1 => $1.toUpperCase())
        .replace(/\s/g, "")
        .replace(/^(.)/, $1 => $1.toLowerCase());
};

const createFullName = (firstName, lastName) => `${firstName} ${lastName}`;

const validateConnection = (firstName, lastName) => {
    if (!firstName || !firstName.trim()) {
        throw new Error('First name is required');
    }
    if (!lastName || !lastName.trim()) {
        throw new Error('Last name is required');
    }
    return true;
};

// Data processing functions
const processConnections = (csv) => {
    try {
        if (!csv || !csv.data || !Array.isArray(csv.data)) {
            throw new Error('Invalid CSV data format');
        }

        const csvKeys = csv.data.shift();
        if (!csvKeys || !Array.isArray(csvKeys)) {
            throw new Error('CSV headers not found');
        }

        const camelCaseKeys = csvKeys.map(toCamelCase);

        return csv.data.reduce((accumulator, currentValue) => {
            const [firstName, lastName, emailAddress, company, position, connectedOn] = currentValue;

            try {
                if (validateConnection(firstName, lastName)) {
                    const connection = {
                        ...Object.fromEntries(camelCaseKeys.map(key => [key, ""])),
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        emailAddress: emailAddress?.trim() || "",
                        company: company?.trim() || "",
                        position: position?.trim() || "",
                        connectedOn: connectedOn?.trim() || "",
                        fullName: createFullName(firstName.trim(), lastName.trim())
                    };
                    return [...accumulator, connection];
                }
            } catch (error) {
                console.error('Error processing connection:', error);
                // Skip invalid connections but continue processing
                return accumulator;
            }
            return accumulator;
        }, []);
    } catch (error) {
        console.error('Error in processConnections:', error);
        throw error;
    }
};

const processCompanies = (connections) => {
    try {
        if (!Array.isArray(connections)) {
            throw new Error('Invalid connections data');
        }

        const companiesMap = new Map();

        connections.forEach(({ company, firstName, lastName, position }) => {
            if (!company) return;

            const companyName = company.trim();
            if (!companiesMap.has(companyName)) {
                companiesMap.set(companyName, {
                    company: companyName,
                    connections: []
                });
            }

            companiesMap.get(companyName).connections.push({
                fullName: createFullName(firstName, lastName),
                position: position?.trim() || ""
            });
        });

        return Array.from(companiesMap.values());
    } catch (error) {
        console.error('Error in processCompanies:', error);
        throw error;
    }
};

const processPositions = (connections) => {
    try {
        if (!Array.isArray(connections)) {
            throw new Error('Invalid connections data');
        }

        const positionsMap = new Map();

        connections.forEach(({ position, company }) => {
            if (!position || !company) return;

            const title = `${position.trim()} at ${company.trim()}`;
            positionsMap.set(title, {
                title,
                position: position.trim(),
                company: company.trim()
            });
        });

        return Array.from(positionsMap.values());
    } catch (error) {
        console.error('Error in processPositions:', error);
        throw error;
    }
};

// Worker message handler
self.addEventListener('message', async (e) => {
    try {
        const { csv } = e.data;
        if (!csv) {
            throw new Error('No CSV data provided');
        }

        // Process data in chunks with progress updates
        const connections = processConnections(csv);
        self.postMessage({ type: 'progress', data: PROGRESS_STEPS.CONNECTIONS });

        const companies = processCompanies(connections);
        self.postMessage({ type: 'progress', data: PROGRESS_STEPS.COMPANIES });

        const positions = processPositions(connections);
        self.postMessage({ type: 'progress', data: PROGRESS_STEPS.COMPLETE });

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
            error: error.message || 'Unknown error occurred'
        });
    }
});