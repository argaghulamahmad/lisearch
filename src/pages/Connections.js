import React, { useState, useCallback, useMemo } from "react";
import { BackTop, notification, Table, Spin } from "antd";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";
import { useDataFetching, useDebounce } from "../hooks/useDataFetching";

const Connections = React.memo(() => {
    const [searchText, setSearchText] = useState("");
    const debouncedSearchText = useDebounce(searchText, 300);
    const [visitedConnections, setVisitedConnections] = useState([]);

    const { data: connections, loading, error, refresh } = useDataFetching(
        async () => await db.connections.toArray(),
        'connections'
    );

    const filteredConnections = useMemo(() => {
        if (!debouncedSearchText) return connections;
        const searchLower = debouncedSearchText.toLowerCase();
        return connections.filter(({ fullName }) =>
            fullName.toLowerCase().includes(searchLower)
        );
    }, [connections, debouncedSearchText]);

    const handleLuckyButtonClick = useCallback(() => {
        const unvisitedConnections = filteredConnections.filter(({ id }) => !visitedConnections.includes(id));
        const numConnections = Math.min(5, unvisitedConnections.length);

        if (unvisitedConnections.length === 0) {
            notification.info({
                message: "No more unvisited connections",
                description: "All connections have been visited!"
            });
            return;
        }

        const newVisitedConnections = [...visitedConnections];

        for (let i = 0; i < numConnections; i++) {
            const { id, fullName } = unvisitedConnections[i];
            newVisitedConnections.push(id);

            notification.success({
                message: "Opening connection",
                description: `Opening ${fullName} in a new tab!`,
                placement: 'bottomRight'
            });

            window.open(`https://www.google.com/search?q=${encodeURIComponent(fullName)}`, '_blank');
        }

        setVisitedConnections(newVisitedConnections);
        localStorage.setItem('visitedConnections', JSON.stringify(newVisitedConnections));
    }, [filteredConnections, visitedConnections]);

    const handleSearch = useCallback((value) => {
        setSearchText(value);
    }, []);

    const columns = useMemo(() => [
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: text => (
                <div>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">{text}</a>
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
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">{text}</a>
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
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">{text}</a>
                    <CopyToClipboard value={text} />
                </div>
            ),
            sorter: (a, b) => a.company.localeCompare(b.company)
        }
    ], []);

    if (error) {
        return <div>Error loading connections: {error.message}</div>;
    }

    return (
        <div>
            <KeywordSearch onSearch={handleSearch} />
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    showHeader={true}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '250', '1000'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                    columns={columns}
                    dataSource={filteredConnections}
                    scroll={{ y: 600 }}
                    virtual={filteredConnections.length > 100}
                    onChange={(pagination, filters, sorter) => {
                        console.log('Table params:', { pagination, filters, sorter });
                    }}
                />
            )}
            <BackTop />
        </div>
    );
});

Connections.displayName = 'Connections';

export default Connections;
