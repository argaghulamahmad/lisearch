import {useEffect, useState} from "react";
import {BackTop, Button, Card, Divider, notification, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";
import {CopyToClipboard} from "../components/CopyToClipboard";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setCompanies(JSON.parse(localStorage.getItem('companies')))
    }, []);

    const renderTableToolbar = () => {
        return <div style={{textAlign: "left"}}>
            <Space size="middle" style={{paddingBottom: "2%"}}>
                <KeywordSearch onSearch={(searchText) => {
                    let companiesFromLocalStorage = JSON.parse(localStorage.getItem('companies'));

                    const filteredCompanies = companiesFromLocalStorage.filter(({company}) => {
                        company = company.toLowerCase();
                        return company.includes(searchText.toLowerCase());
                    });

                    setCompanies(filteredCompanies);
                }}></KeywordSearch>
                <Button onClick={() => {
                    let visitedCompanies = JSON.parse(localStorage.getItem('visitedCompanies')) || [];
                    const unvisitedCompanies = companies.filter(({id}) => !visitedCompanies.includes(id))
                    for (let i = 0; i < 5; i++) {
                        let {id, company} = unvisitedCompanies[Math.floor(Math.random() * unvisitedCompanies.length)];
                        visitedCompanies.push(id);
                        notification.success({
                            message: "Opening company",
                            description: `Opening ${company} in new tab!`,
                        });
                        window.open(`https://www.google.com/search?q=${company}`, '_blank');
                    }
                    localStorage.setItem('visitedCompanies', JSON.stringify(visitedCompanies));
                }}>I feel lucky</Button>
            </Space>
        </div>
    }

    return (
        companies ? <div style={{width: "1200px"}}>
            <Divider orientation="left" orientationMargin="0">Companies</Divider>
            {
                lastUpdateAt !== "" ? null :
                    <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
            }
            {renderTableToolbar()}
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
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'id',
                                render: companyName => <div>
                                    <a href={`https://www.google.com/search?q=${companyName}`}
                                       target="_blank" rel="noreferrer">{companyName}</a>
                                    <CopyToClipboard value={companyName}></CopyToClipboard>
                                </div>,
                                sorter: (a, b) => {
                                    return a.company.localeCompare(b.company)
                                }
                            },
                            {
                                title: 'Number of Employee',
                                dataIndex: 'connections',
                                key: 'id',
                                defaultSortOrder: 'descend',
                                render: connections => <div>
                                    {connections.length}
                                </div>,
                                sorter: (a, b) => {
                                    return a.connections.length > b.connections.length ? 1 : a.connections.length < b.connections.length ? -1 : 0;
                                }
                            }
                        ]
                    }
                    expandable={{
                        expandedRowRender: record => <div>
                            <Space align="baseline" direction="vertical" style={{margin: "20px"}}>
                                <Button style={{width: "100%"}} onClick={() => {
                                    let visitedConnections = JSON.parse(localStorage.getItem('visitedConnections')) || [];
                                    const unvisitedConnections = record.connections.filter(({id}) => !visitedConnections.includes(id))
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
                            <Table
                                columns={
                                    [
                                        {
                                            title: 'Full Name',
                                            dataIndex: 'fullName',
                                            key: 'id',
                                            render: text => <div>
                                                <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank" rel="noreferrer">{text}</a>
                                                <CopyToClipboard value={text}></CopyToClipboard>
                                            </div>,
                                            sorter: (a, b) => {
                                                return a.fullName.localeCompare(b.fullName)
                                            },
                                        },
                                        {
                                            title: 'Position',
                                            dataIndex: 'position',
                                            key: 'id',
                                            render: text => <div>
                                                <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank" rel="noreferrer">{text}</a>
                                                <CopyToClipboard value={text}></CopyToClipboard>
                                            </div>,

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