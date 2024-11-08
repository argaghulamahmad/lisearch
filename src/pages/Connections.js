import React, { useEffect, useState } from "react";
import { BackTop, Button, Card, Divider, notification, Space, Table } from "antd";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";

const Connections = () => {
    const [connections, setConnections] = useState([]);
    const [visitedConnections, setVisitedConnections] = useState([]);

    useEffect(() => {
        db.connections.toArray().then((res) => {
            setConnections(res);
        });

        const storedVisitedConnections = JSON.parse(localStorage.getItem('visitedConnections')) || [];
        setVisitedConnections(storedVisitedConnections);
    }, []);

    const handleLuckyButtonClick = () => {
        const unvisitedConnections = connections.filter(({ id }) => !visitedConnections.includes(id));
        const numConnections = Math.min(5, unvisitedConnections.length);

        for (let i = 0; i < numConnections; i++) {
            const { id, fullName } = unvisitedConnections[i];
            const newVisitedConnections = [...visitedConnections, id];

            notification.success({
                message: "Opening connection",
                description: `Opening ${fullName} in a new tab!`,
            });

            window.open(`https://www.google.com/search?q=${fullName}`, '_blank');
            setVisitedConnections(newVisitedConnections);
            localStorage.setItem('visitedConnections', JSON.stringify(newVisitedConnections));
        }
    };

    const handleSearch = (searchText) => {
        const filteredConnections = connections.filter(({ fullName }) => {
            return fullName.toLowerCase().includes(searchText.toLowerCase());
        });

        setConnections(filteredConnections);
    };

    return (
        <div>
            <Table
                showHeader={true}
                rowKey="id"
                pagination={{
                    defaultPageSize: 100,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '50', '100', '250', '1000']
                }}
                columns={[
                    {
                        title: 'Full Name',
                        dataIndex: 'fullName',
                        key: 'fullName',
                        render: text => (
                            <div>
                                <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
                                <CopyToClipboard value={text} />
                            </div>
                        ),
                        sorter: (a, b) => a.fullName.localeCompare(b.fullName)
                    },
                    {
                        title: 'Position',
                        dataIndex: 'position',
                        key: 'position',
                        render: text => (
                            <div>
                                <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
                                <CopyToClipboard value={text} />
                            </div>
                        ),
                        sorter: (a, b) => a.position.localeCompare(b.position)
                    },
                    {
                        title: 'Company',
                        dataIndex: 'company',
                        key: 'company',
                        render: text => (
                            <div>
                                <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
                                <CopyToClipboard value={text} />
                            </div>
                        ),
                        sorter: (a, b) => a.company.localeCompare(b.company)
                    }
                ]}
                dataSource={connections}
            />
            <BackTop />
        </div>
    );
};

export default Connections;
