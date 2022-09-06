import {useEffect, useState} from "react";
import {BackTop, Button, Card, Divider, notification, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";
import {CopyToClipboard} from "../components/CopyToClipboard";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setConnections(JSON.parse(localStorage.getItem('connections')))
    }, []);

    const renderAntdButtonToGetRandomConnection = () => {
        return <div style={{textAlign: "left"}}>
            <Space size="middle" style={{paddingBottom: "2%"}}>
                <KeywordSearch onSearch={(searchText) => {
                    let connectionsFromLocalStorage = JSON.parse(localStorage.getItem('connections'));

                    const filteredPosition = connectionsFromLocalStorage.filter(({fullName}) => {
                        fullName = fullName.toLowerCase();
                        return fullName.includes(searchText.toLowerCase());
                    });

                    setConnections(filteredPosition);
                }}></KeywordSearch>
                <Button onClick={() => {
                    let visitedConnections = JSON.parse(localStorage.getItem('visitedConnections')) || [];
                    const unvisitedConnections = connections.filter(({id}) => !visitedConnections.includes(id))
                    for (let i = 0; i < 5; i++) {
                        let {id, fullName} = unvisitedConnections[Math.floor(Math.random() * unvisitedConnections.length)];
                        visitedConnections.push(id);
                        notification.success({
                            message: "Opening connection",
                            description: `Opening ${fullName} in new tab!`,
                        });
                        window.open(`https://www.google.com/search?q=${fullName}`, '_blank');
                    }
                    localStorage.setItem('visitedConnections', JSON.stringify(visitedConnections));
                }}>I feel lucky</Button>
            </Space>
        </div>
    }


    return (
        connections ? <div style={{width: "1200px"}}>
            <Divider orientation="left" orientationMargin="0">Connections</Divider>
            {
                lastUpdateAt !== "" ? null :
                    <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
            }
            {renderAntdButtonToGetRandomConnection()}
            <Card>
                <Table
                    showHeader={true}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '200']
                    }}
                    style={{padding: "0 2% 0 2%"}}
                    columns={
                        [
                            {
                                title: 'Full Name',
                                dataIndex: 'fullName',
                                key: 'idx',
                                render: text => <div>
                                    <a href={`https://www.google.com/search?q=${text}`}
                                       target="_blank" rel="noreferrer">{text}</a>
                                    <CopyToClipboard value={text}/>
                                </div>,
                                sorter: (a, b) => {
                                    return a.fullName.localeCompare(b.fullName)
                                },
                            },
                            {
                                title: 'Position',
                                dataIndex: 'position',
                                key: 'idx',
                                render: text => <div>
                                    <a href={`https://www.google.com/search?q=${text}`}
                                       target="_blank" rel="noreferrer">{text}</a>
                                    <CopyToClipboard value={text}/>
                                </div>,
                                sorter: (a, b) => {
                                    return a.position.localeCompare(b.position)
                                },
                            },
                            {
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'idx',
                                render: text => <div>
                                    <a href={`https://www.google.com/search?q=${text}`}
                                       target="_blank" rel="noreferrer">{text}</a>
                                    <CopyToClipboard value={text}/>
                                </div>,
                                sorter: (a, b) => {
                                    return a.position.localeCompare(b.position)
                                },
                            }
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