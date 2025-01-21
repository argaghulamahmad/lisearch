import React, { useState, useCallback, useMemo, useRef } from "react";
import { Button, Divider, notification, Space, Progress } from "antd";
import { usePapaParse } from "react-papaparse";
import db from "../db";

const BATCH_SIZE = 1000;

const useCSVWorker = () => {
    const workerRef = useRef(null);

    const initializeWorker = useCallback((onProgress, onComplete, onError) => {
        workerRef.current = new Worker(new URL('../workers/csvWorker.js', import.meta.url));
        
        workerRef.current.onmessage = (e) => {
            const { type, data, error } = e.data;
            if (type === 'progress') {
                onProgress(data);
            } else if (type === 'complete') {
                onComplete(data);
            } else if (type === 'error') {
                onError(error);
            }
        };

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const postMessage = useCallback((data) => {
        if (workerRef.current) {
            workerRef.current.postMessage(data);
        }
    }, []);

    return { initializeWorker, postMessage };
};

const Uploader = React.memo(() => {
    const { readString } = usePapaParse();
    const [csvData, setCsvData] = useState("");
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { initializeWorker, postMessage } = useCSVWorker();

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

            const cleanup = initializeWorker(
                (progress) => setProgress(progress),
                async (data) => {
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
                },
                (error) => {
                    throw new Error(error);
                }
            );

            postMessage({ csv: result });

            return cleanup;
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
        }
    }, [csvData, readString, processBatch, initializeWorker, postMessage]);

    const textAreaStyle = useMemo(() => ({
        width: "100%",
        minHeight: "200px",
        marginBottom: "16px",
        padding: "8px",
        resize: "vertical"
    }), []);

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
