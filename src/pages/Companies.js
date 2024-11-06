import { useEffect, useState } from "react";
import { BackTop, Button, Card, Divider, notification, Space, Table } from "antd";
import Uploader from "./Uploader";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";

const Companies = () => {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        db.companies.toArray().then(setCompanies);
    }, []);

    const handleSearch = (searchText) => {
        const filteredCompanies = companies.filter(({ company }) => 
            company.toLowerCase().includes(searchText.toLowerCase())
        );
        setCompanies(filteredCompanies);
    };

    const handleLuckyClick = (type, items, visitedKey) => {
        let visitedItems = JSON.parse(localStorage.getItem(visitedKey)) || [];
        const unvisitedItems = items.filter(({ id }) => !visitedItems.includes(id));

        for (let i = 0; i < 5; i++) {
            const { id, company } = unvisitedItems[Math.floor(Math.random() * unvisitedItems.length)];
            visitedItems.push(id);
            notification.success({
                message: `Opening ${type}`,
                description: `Opening ${company} in new tab!`,
            });
            window.open(`https://www.google.com/search?q=${company}`, '_blank');
        }
        localStorage.setItem(visitedKey, JSON.stringify(visitedItems));
    };

    const renderTableToolbar = () => (
        <div style={{ textAlign: "left" }}>
            <Space size="middle" style={{ paddingBottom: "2%" }}>
                <KeywordSearch onSearch={handleSearch} />
                <Button onClick={() => handleLuckyClick('company', companies, 'visitedCompanies')}>
                    I feel lucky
                </Button>
            </Space>
        </div>
    );

    const renderConnectionsTable = (record) => (
        <Table
            columns={[
                {
                    title: 'Full Name',
                    dataIndex: 'fullName',
                    render: text => (
                        <div>
                            <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
                            <CopyToClipboard value={text} />
                        </div>
                    ),
                    sorter: (a, b) => a.fullName.localeCompare(b.fullName),
                },
                {
                    title: 'Position',
                    dataIndex: 'position',
                    render: text => (
                        <div>
                            <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
                            <CopyToClipboard value={text} />
                        </div>
                    ),
                }
            ]}
            dataSource={record.connections}
        />
    );

    return (
        companies.length > 0 ? (
            <div style={{ width: "1200px" }}>
                <Divider orientation="left" orientationMargin="0">Companies</Divider>
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
                        style={{ padding: "0 2% 0 2%" }}
                        columns={[
                            {
                                title: 'Company',
                                dataIndex: 'company',
                                render: companyName => (
                                    <div>
                                        <a href={`https://www.google.com/search?q=${companyName}`} target="_blank" rel="noreferrer">{companyName}</a>
                                        <CopyToClipboard value={companyName} />
                                    </div>
                                ),
                                sorter: (a, b) => a.company.localeCompare(b.company),
                            },
                            {
                                title: 'Number of Employee',
                                dataIndex: 'connections',
                                render: connections => <div>{connections.length}</div>,
                                sorter: (a, b) => a.connections.length - b.connections.length,
                            }
                        ]}
                        expandable={{
                            expandedRowRender: record => (
                                <div>
                                    <Space align="baseline" direction="vertical" style={{ margin: "20px" }}>
                                        <Button style={{ width: "100%" }} onClick={() => handleLuckyClick('connection', record.connections, 'visitedConnections')}>
                                            I feel lucky
                                        </Button>
                                    </Space>
                                    {renderConnectionsTable(record)}
                                </div>
                            ),
                            rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
                        }}
                        dataSource={companies}
                    />
                </Card>
                <BackTop />
            </div>
        ) : <Uploader />
    );
}

export default Companies;
