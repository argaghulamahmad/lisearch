import React, { useState, useCallback, useMemo, useRef } from "react";
import { Button, Divider, notification, Space, Progress } from "antd";
import { usePapaParse } from "react-papaparse";
import db from "../db";

const BATCH_SIZE = 1000;

const Uploader = React.memo(() => {
    const { readString } = usePapaParse();
    const [csvData, setCsvData] = useState("");
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const workerRef = useRef(null);

    const generateCompaniesDataList = useCallback(connections => {
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
    }, []);

    const generatePositionsDataList = useCallback(connections => {
        const positionsMap = new Map();
        connections.forEach(({ position, company }) => {
            if (!position || !company) return;

            const title = `${position} at ${company}`;
            positionsMap.set(title, { title, position, company });
        });
        return Array.from(positionsMap.values());
    }, []);

    const generateConnectionsDataList = useCallback(csv => {
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
    }, []);

    const processBatch = useCallback(async (items, tableName, currentCount, totalCount) => {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);
            await db[tableName].bulkAdd(batch);
            const progress = Math.round(((currentCount + i + batch.length) / totalCount) * 100);
            setProgress(progress);
        }
    }, []);

    const handleProcessCsv = useCallback(async () => {
        if (!csvData) {
            notification.error({ message: "No CSV data provided." });
            return;
        }

        setProcessing(true);
        setProgress(0);

        try {
            const result = await new Promise((resolve, reject) => {
                readString(csvData, {
                    worker: true,
                    complete: resolve,
                    error: reject
                });
            });

            if (!result.data || !result.data.length) {
                throw new Error("CSV data is empty or invalid.");
            }

            // Initialize Web Worker
            workerRef.current = new Worker(new URL('../workers/csvWorker.js', import.meta.url));

            // Handle worker messages
            workerRef.current.onmessage = async (e) => {
                const { type, data, error } = e.data;

                if (type === 'progress') {
                    setProgress(data);
                } else if (type === 'complete') {
                    const { connections, companies, positions } = data;
                    const totalItems = connections.length + companies.length + positions.length;

                    try {
                        await Promise.all([
                            db.connections.clear(),
                            db.companies.clear(),
                            db.positions.clear(),
                        ]);

                        await processBatch(connections, 'connections', 0, totalItems);
                        await processBatch(companies, 'companies', connections.length, totalItems);
                        await processBatch(positions, 'positions', connections.length + companies.length, totalItems);

                        notification.success({
                            message: "File processed successfully!",
                            description: `Processed ${connections.length} connections, ${companies.length} companies, and ${positions.length} positions.`,
                            duration: 5
                        });

                        setTimeout(() => {
                            window.location.href = "../";
                        }, 2000);
                    } catch (error) {
                        throw error;
                    }
                } else if (type === 'error') {
                    throw new Error(error);
                }
            };

            // Start processing
            workerRef.current.postMessage({ csv: result });

        } catch (error) {
            console.error(error);
            notification.error({
                message: "File processing failed.",
                description: error.message,
                duration: 0
            });
        } finally {
            setProcessing(false);
            setProgress(0);
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        }
    }, [csvData, readString, processBatch]);

    const textAreaStyle = useMemo(() => ({
        width: "100%",
        minHeight: "200px",
        marginBottom: "16px",
        padding: "8px",
        resize: "vertical"
    }), []);

    // Cleanup worker on unmount
    React.useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    return (
        <div>
            <Divider orientation="left" orientationMargin="0">Uploader</Divider>
            <Space style={{ width: "100%" }} direction="vertical">
                <textarea
                    style={textAreaStyle}
                    value={csvData}
                    onChange={e => setCsvData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                    disabled={processing}
                />
                {processing && <Progress percent={progress} status="active" />}
                <Button
                    type="primary"
                    onClick={handleProcessCsv}
                    disabled={processing || !csvData}
                    loading={processing}
                >
                    {processing ? 'Processing...' : 'Process CSV Data'}
                </Button>
            </Space>
        </div>
    );
});

Uploader.displayName = 'Uploader';

export default Uploader;
