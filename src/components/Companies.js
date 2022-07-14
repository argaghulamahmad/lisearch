import {useEffect, useState} from "react";
import {BackTop, Button, Card, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setCompanies(JSON.parse(localStorage.getItem('companies')))
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
                    rowKey="id"
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
                                key: 'id',
                                render: item => <a href={`https://www.google.com/search?q=${item}`}
                                                   target="_blank" rel="noreferrer">{item}</a>,
                                sorter: (a, b) => {
                                    return a.localeCompare(b)
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
                                            key: 'id',
                                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                               target="_blank" rel="noreferrer">{text}</a>,
                                            sorter: (a, b) => {
                                                return a.fullName.localeCompare(b.fullName)
                                            },
                                        },
                                        {
                                            title: 'Position',
                                            dataIndex: 'position',
                                            key: 'id',
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