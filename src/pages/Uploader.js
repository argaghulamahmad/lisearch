import React, {useState} from "react";
import {Button, Divider, notification, Space} from "antd";
import {usePapaParse} from "react-papaparse";
import db from "../db";

const Uploader = () => {
    const {readString} = usePapaParse();
    const [csvData, setCsvData] = useState("");
    const [processing, setProcessing] = useState(false);

    const generateCompaniesDataList = connections => {
        const companiesMap = new Map();
        for (const connection of connections) {
            const {company} = connection;
            if (!companiesMap.has(company)) {
                companiesMap.set(company, {company, connections: []});
            }
            companiesMap.get(company).connections.push(connection);
        }
        return Array.from(companiesMap.values());
    };

    const generatePositionsDataList = connections => {
        const positionsMap = new Map();
        for (const connection of connections) {
            const title = `${connection.position} at ${connection.company}`;
            positionsMap.set(title, {
                title,
                position: connection.position,
                company: connection.company,
            });
        }
        return Array.from(positionsMap.values());
    };

    const generateConnectionsDataList = csv => {
        const csvKeys = csv.data.shift();
        const camelCaseKeys = csvKeys.map(key =>
            key
                .replace(/\s(.)/g, $1 => $1.toUpperCase())
                .replace(/\s/g, "")
                .replace(/^(.)/, $1 => $1.toLowerCase())
        );
        const connectionStub = Object.fromEntries(
            camelCaseKeys.map(key => [key, ""])
        );

        return csv.data.reduce((accumulator, currentValue) => {
            const [firstName, lastName, emailAddress, company, position, connectedOn] =
                currentValue;
            if (firstName !== undefined && lastName !== undefined) {
                if (firstName !== "" || lastName !== "") {
                    const clone = {
                        ...connectionStub,
                        firstName,
                        lastName,
                        emailAddress,
                        company,
                        position,
                        connectedOn,
                        fullName: `${firstName} ${lastName}`,
                    };
                    return [...accumulator, clone];
                }
            }
            return accumulator;
        }, []);
    };

    const handleProcessCsv = async () => {
        if (!csvData) {
            notification.error({
                message: "No CSV data provided.",
            });
            return;
        }

        setProcessing(true);

        try {
            const result = await readString(csvData, {
                worker: true,
                complete: async csv => {
                    const connections = generateConnectionsDataList(csv);
                    const companies = generateCompaniesDataList(connections);
                    const positions = generatePositionsDataList(connections);

                    await db.connections.clear();
                    await db.companies.clear();
                    await db.positions.clear();

                    await db.connections.bulkAdd(connections);
                    await db.companies.bulkAdd(companies);
                    await db.positions.bulkAdd(positions);

                    notification.success({
                        message: "File processed successfully!",
                        description: `Processed ${connections.length} connections, ${companies.length} companies, and ${positions.length} positions.`,
                    });

                    setTimeout(() => {
                        window.location.href = "../";
                    }, 2000);
                },
            });

            if (!result.data || !result.data.length) {
                notification.error({
                    message: "CSV data is empty or invalid.",
                });
            }
        } catch (error) {
            notification.error({
                message: "File processing failed.",
                description: error.message,
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{width: "1200px"}}>
            <Divider orientation="left" orientationMargin="0">
                Uploader
            </Divider>
            <Space style={{width: "100%"}} direction="vertical">
                <textarea
                    rows={10}
                    style={{width: "100%"}}
                    value={csvData}
                    onChange={e => setCsvData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                />
                <Button
                    type="primary"
                    onClick={handleProcessCsv}
                    disabled={processing}
                >
                    Process CSV Data
                </Button>
            </Space>
        </div>
    );
};

export default Uploader;
