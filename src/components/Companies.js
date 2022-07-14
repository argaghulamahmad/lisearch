import {useEffect, useState} from "react";
import {BackTop, Button, Card, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setCompanies(JSON.parse(localStorage.getItem('connectionsAtCompany')))
    }, []);

    const getRandomCompany = () => {
        return companies[Math.floor(Math.random() * companies.length)];
    }

    const renderAntdButtonToGetRandomCompany = () => {
        return <Space size="middle" style={{margin: "20px"}}>
            <Button onClick={() => {
                for (let i = 0; i < 5; i++) {
                    const company = getRandomCompany();
                    window.open(`https://www.google.com/search?q=${company.company}`, '_blank');
                }
            }}>I feel lucky</Button>
        </Space>
    }

    return (
        companies ? <div>
            <Card>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                {renderAntdButtonToGetRandomCompany()}
                <Table
                    showHeader={true}
                    rowKey="idx"
                    pagination={{
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '200']
                    }}
                    style={{padding: "0 5% 0 5%"}}
                    columns={
                        [
                            {
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'company',
                                render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank" rel="noreferrer">{text}</a>,
                                sorter: (a, b) => {
                                    return a.company.localeCompare(b.company)
                                },
                            },
                            {
                                title: 'Total Connections',
                                key: 'totalConnections',
                                render: record => <div>{record.connections.length}</div>,
                                sorter: (a, b) => {
                                    if (a.connections.length > b.connections.length) return 1
                                    else if (a.connections.length < b.connections.length) return -1
                                    else return 0
                                },
                            }
                        ]
                    }
                    expandable={{
                        expandedRowRender: record => <div>
                            <Space align="baseline" direction="vertical" style={{margin: "20px"}}>
                                <Button style={{width: "100%"}} onClick={() => {
                                    for (let i = 0; i < 5; i++) {
                                        const connection = record.connections[Math.floor(Math.random() * record.connections.length)];
                                        const {fullName, position} = connection;
                                        window.open(`https://www.google.com/search?q=${fullName + " " + position}`, '_blank');
                                    }
                                }}>I feel lucky</Button>
                            </Space>
                            <Table
                                columns={
                                    [
                                        {
                                            title: 'Full Name',
                                            dataIndex: 'fullName',
                                            key: 'fullName',
                                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                               target="_blank" rel="noreferrer">{text}</a>,
                                            sorter: (a, b) => {
                                                return a.fullName.localeCompare(b.fullName)
                                            },
                                        },
                                        {
                                            title: 'Position',
                                            dataIndex: 'position',
                                            key: 'position',
                                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                               target="_blank" rel="noreferrer">{text}</a>,

                                        }
                                    ]
                                }
                                dataSource={record.connections}
                            />
                        </div>,
                        rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
                    }}
                    dataSource={companies}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Connections;