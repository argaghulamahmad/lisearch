import {InboxOutlined} from '@ant-design/icons';
import {Upload, notification} from "antd";
import {usePapaParse} from 'react-papaparse';

const {Dragger} = Upload;

const Uploader = () => {
        const {readString} = usePapaParse();

        const generateCompaniesDataList = connections => [...new Set(connections.map((item, idx) => {
            return {
                key: idx,
                company: item.company,
            }
        }).filter((x) => x !== "").filter((x, i, a) => a.indexOf(x) === i))];

        const generatePositionsDataList = connections => [...new Set(connections.map((item, idx) => {
            return {
                key: idx,
                item: item.position + " at " + item.company,
                position: item.position,
                company: item.company,
            }
        }).filter((x) => x !== "").filter((x, i, a) => a.indexOf(x) === i))];

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

                        clone.idx = idx

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

        const generateMapCompanyConnections = (companies, connections) => {
            return companies.reduce((accumulator, currentValue, idx) => {
                let connectionsAtCompany = connections.filter((connection) => {
                    return connection.company === currentValue
                })

                return [...accumulator, {
                    idx: idx,
                    company: currentValue,
                    connections: connectionsAtCompany,
                }]
            }, [])
        }

        return <div>
            <Dragger {...{
                name: 'file',
                multiple: true,

                onChange(e) {
                    Array.from(e.fileList).forEach(file => {
                        const reader = new FileReader();
                        const {originFileObj} = file;
                        reader.readAsText(originFileObj, "UTF-8");
                        if (file.name === "Connections.csv") {
                            reader.onload = function (evt) {
                                let result = evt.target.result;
                                switch (file.name) {
                                    case "Connections.csv":
                                        readString(result, {
                                            worker: true,
                                            complete: (csv) => {
                                                const connections = generateConnectionsDataList(csv);
                                                const companies = generateCompaniesDataList(connections);
                                                const connectionsAtCompany = generateMapCompanyConnections(companies, connections);
                                                const positions = generatePositionsDataList(connections);

                                                localStorage.setItem('connections', JSON.stringify(
                                                    connections
                                                ));
                                                localStorage.setItem('companies', JSON.stringify(
                                                    companies
                                                ));
                                                localStorage.setItem('connectionsAtCompany', JSON.stringify(
                                                    connectionsAtCompany
                                                ));
                                                localStorage.setItem('positions', JSON.stringify(
                                                    positions
                                                ));

                                                notification.success({
                                                    message: 'File Connections.csv valid',
                                                    description: 'Connections record updated!',
                                                });
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
        </div>
    }
;

export default Uploader;
