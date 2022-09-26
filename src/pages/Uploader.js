import {InboxOutlined} from '@ant-design/icons';
import {Button, Divider, notification, Space, Upload} from "antd";
import {usePapaParse} from 'react-papaparse';
import db from "../db";
import {Dexie} from "dexie";

const {Dragger} = Upload;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const Uploader = () => {
        const {readString} = usePapaParse();

        const generateCompaniesDataList = connections => {
            const companiesMap = connections.reduce(function (map, connection, idx) {
                map.set(connection.company, {
                    company: connection.company,
                });
                return map;
            }, new Map());
            const uniqueCompanies = Array.from(companiesMap.values());

            return uniqueCompanies.map(company => {
                let connectionsAtCompany = connections.filter(connection => connection.company === company.company);
                return {
                    ...company,
                    connections: connectionsAtCompany,
                }
            });
        };

        const generatePositionsDataList = connections => {
            const positionsMap = connections.reduce(function (map, connection, idx) {
                map.set(connection.position + " at " + connection.company, {
                    title: connection.position + " at " + connection.company,
                    position: connection.position,
                    company: connection.company,
                });
                return map;
            }, new Map());

            return Array.from(positionsMap.values());
        };

        const generateConnectionsDataList = csv => {
            let csvKeys = csv.data.shift();
            let camelCaseKeys = csvKeys.map((key) => {
                return key.replace(/\s(.)/g, function ($1) {
                    return $1.toUpperCase();
                })
                    .replace(/\s/g, '')
                    .replace(/^(.)/, function ($1) {
                        return $1.toLowerCase();
                    });
            });
            let connectionStub = Object.assign({}, ...camelCaseKeys.map(key => ({[key]: ""})));

            return csv.data.reduce((accumulator, currentValue, idx) => {
                if (currentValue[0] !== undefined && currentValue[1] !== undefined) {
                    if (currentValue[0] !== "" || currentValue[1] !== "") {
                        const clone = {...connectionStub};

                        clone.firstName = currentValue[0]
                        clone.lastName = currentValue[1]

                        clone.emailAddress = currentValue[2]
                        clone.company = currentValue[3]
                        clone.position = currentValue[4]
                        clone.connectedOn = currentValue[5]

                        clone.fullName = currentValue[0] + ' ' + currentValue[1]

                        return [...accumulator, clone]
                    } else {
                        return [...accumulator]
                    }
                } else {
                    return [...accumulator]
                }
            }, []);
        };

        return <div style={{width: "1200px"}}>
            <Divider orientation="left" orientationMargin="0">Uploader</Divider>
            <Space style={{width: "100%"}} direction="vertical">
                <Button type="primary" style={{width: '100%'}} onClick={() => {
                    window.open('https://www.linkedin.com/mypreferences/d/download-my-data');
                }}>Request and Download Connections CSV File</Button>
                <Dragger {...{
                    name: 'file',
                    multiple: true,

                    onDrop(e) {
                        notification.info({
                            message: 'Please do not close or reload this window.',
                            description: 'Please do not close this window while the file is being processed.',
                        });

                        Array.from(e.dataTransfer.files).forEach(file => {
                            const reader = new FileReader();
                            reader.readAsText(file, "UTF-8");
                            if (file.name === "Connections.csv") {
                                reader.onload = function (evt) {
                                    let result = evt.target.result;
                                    switch (file.name) {
                                        case "Connections.csv":
                                            readString(result, {
                                                worker: true,
                                                complete: async (csv) => {
                                                    const connections = generateConnectionsDataList(csv);
                                                    const companies = generateCompaniesDataList(connections);
                                                    const positions = generatePositionsDataList(connections);

                                                    notification.success({
                                                        message: 'Start processing file',
                                                        description: 'File Connections.csv valid!',
                                                    });

                                                    const clearConnectionsRecordsPromise = db.connections.clear();
                                                    const clearCompaniesRecordsPromise = db.companies.clear();
                                                    const clearPositionsRecordsPromise = db.positions.clear();

                                                    const bulkAddConnectionsRecordsPromise = db.connections.bulkAdd(connections);
                                                    const bulkAddCompaniesRecordsPromise = db.companies.bulkAdd(companies);
                                                    const bulkAddPositionsRecordsPromise = db.positions.bulkAdd(positions);

                                                    let databaseProcessPromiseExecution = async () => {
                                                        await Promise.all([
                                                            clearConnectionsRecordsPromise,
                                                            clearCompaniesRecordsPromise,
                                                            clearPositionsRecordsPromise,
                                                            bulkAddConnectionsRecordsPromise.then(() => {
                                                                notification.success({
                                                                    message: 'Connections processed successfully!',
                                                                    description: 'Done adding ' + connections.length + ' connections to the database.',
                                                                });
                                                            }).catch(Dexie.BulkError, e => {
                                                                notification.error({
                                                                    message: 'Error processing connections!',
                                                                    description: 'There is an error when store connections to the database.',
                                                                })
                                                            }),
                                                            bulkAddCompaniesRecordsPromise.then(() => {
                                                                notification.success({
                                                                    message: 'Companies processed successfully!',
                                                                    description: 'Done adding ' + companies.length + ' companies to the database.',
                                                                });
                                                            }).catch(Dexie.BulkError, e => {
                                                                notification.error({
                                                                    message: 'Error processing companies!',
                                                                    description: 'There is an error when store companies to the database.',
                                                                })
                                                            }),
                                                            bulkAddPositionsRecordsPromise.then(() => {
                                                                notification.success({
                                                                    message: 'Positions processed successfully!',
                                                                    description: 'Done adding ' + positions.length + ' positions to the database.',
                                                                });
                                                            }).catch(Dexie.BulkError, e => {
                                                                notification.error({
                                                                    message: 'Error processing positions!',
                                                                    description: 'There is an error when store positions to the database.',
                                                                })
                                                            }),
                                                        ]);
                                                    }

                                                    await sleep(1000);

                                                    databaseProcessPromiseExecution().then(() => {
                                                        notification.success({
                                                            message: 'File processed successfully!',
                                                            description: 'Done processing file Connections.csv',
                                                        });

                                                        setInterval(() => {
                                                            window.location.href = '../';
                                                        }, 2000);

                                                        notification.info({
                                                            message: 'You will redirected to home page automatically.',
                                                            description: 'You will redirected to home page automatically after all process complete.',
                                                        })
                                                    })
                                                },
                                            });
                                            break;
                                        default:
                                            notification.error({
                                                message: 'Not a valid csv file',
                                            });
                                    }
                                }
                                reader.onerror = function (evt) {
                                    notification.error({
                                        message: 'Not valid CSV file',
                                    });
                                }
                            } else {
                                notification.error({
                                    message: 'Please drop Connections CSV file',
                                });
                            }
                        });
                    },
                }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Drop Connections CSV file</p>
                </Dragger>
            </Space>
        </div>
    }
;

export default Uploader;
