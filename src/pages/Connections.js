import {useEffect, useState} from "react";
import {BackTop, Button, Card, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setConnections(JSON.parse(localStorage.getItem('connections')))
    }, []);

    const getRandomConnection = () => {
        return connections[Math.floor(Math.random() * connections.length)];
    }

    const renderAntdButtonToGetRandomConnection = () => {
        return <Space size="middle" style={{margin: "20px" }} >
            <Button onClick={() => {
                for (let i = 0; i < 5; i++) {
                    const connection = getRandomConnection();
                    const {fullName, position} = connection;
                    window.open(`https://www.google.com/search?q=${fullName + " " + position}`, '_blank');
                }
            }}>I feel lucky</Button>
        </Space>
    }


    return (
        connections ? <div>
            <Card>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                {renderAntdButtonToGetRandomConnection()}
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
                                sorter: (a, b) => {
                                    return a.position.localeCompare(b.position)
                                },
                            },
                            {
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'company',
                                render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank" rel="noreferrer">{text}</a>,
                                sorter: (a, b) => {
                                    return a.position.localeCompare(b.position)
                                },
                            },
                        ]
                    }
                    dataSource={connections}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Connections;