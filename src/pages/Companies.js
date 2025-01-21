import { useEffect, useState, useMemo } from "react";
import { BackTop, Button, notification, Space, Table, Alert, Spin } from "antd";
import Uploader from "./Uploader";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";
import { useDebounce } from "../hooks/useDataFetching";

const renderWithCopy = (text) => (
    <div>
        <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
        <CopyToClipboard value={text} />
    </div>
);

const connectionColumns = [
    {
        title: 'Full Name',
        dataIndex: 'fullName',
        render: renderWithCopy,
        sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        width: 300,
    },
    {
        title: 'Position',
        dataIndex: 'position',
        render: renderWithCopy,
        width: 300,
    }
];

const companyColumns = [
    {
        title: 'Company',
        dataIndex: 'company',
        render: renderWithCopy,
        sorter: (a, b) => a.company.localeCompare(b.company),
        width: 300,
        fixed: 'left',
    },
    {
        title: 'Number of Employee',
        dataIndex: 'connections',
        render: connections => <div>{connections.length}</div>,
        sorter: (a, b) => a.connections.length - b.connections.length,
        width: 200,
    }
];

const PAGE_SIZE = 100;

const Companies = () => {
    const [allCompanies, setAllCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearch = useDebounce(searchText);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                setError(null);
                const companies = await db.companies.toArray();
                setAllCompanies(companies);
                setFilteredCompanies(companies);
            } catch (err) {
                setError(err.message);
                notification.error({
                    message: 'Error loading companies',
                    description: err.message,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    useEffect(() => {
        try {
            if (debouncedSearch) {
                const searchLower = debouncedSearch.toLowerCase();
                const filtered = allCompanies.filter(({ company }) =>
                    company.toLowerCase().includes(searchLower)
                );
                setFilteredCompanies(filtered);
                setCurrentPage(1); // Reset to first page on new search
            } else {
                setFilteredCompanies(allCompanies);
            }
        } catch (err) {
            notification.error({
                message: 'Error filtering companies',
                description: err.message,
            });
        }
    }, [debouncedSearch, allCompanies]);

    const handleLuckyClick = (type, items, visitedKey) => {
        try {
            const visitedSet = new Set(JSON.parse(localStorage.getItem(visitedKey)) || []);
            const unvisitedItems = items.filter(({ id }) => !visitedSet.has(id));

            if (unvisitedItems.length === 0) {
                notification.info({
                    message: 'No more items',
                    description: 'You have visited all items in this list!',
                });
                return;
            }

            for (let i = 0; i < Math.min(5, unvisitedItems.length); i++) {
                const randomIndex = Math.floor(Math.random() * unvisitedItems.length);
                const { id, company } = unvisitedItems[randomIndex];
                visitedSet.add(id);
                notification.success({
                    message: `Opening ${type}`,
                    description: `Opening ${company} in new tab!`,
                });
                window.open(`https://www.google.com/search?q=${company}`, '_blank');
                unvisitedItems.splice(randomIndex, 1);
            }
            localStorage.setItem(visitedKey, JSON.stringify([...visitedSet]));
        } catch (err) {
            notification.error({
                message: 'Error processing lucky click',
                description: err.message,
            });
        }
    };

    const renderConnectionsTable = useMemo(() => (record) => (
        <div>
            <Space align="baseline" direction="vertical" style={{ margin: "20px" }}>
                <Button
                    style={{ width: "100%" }}
                    onClick={() => handleLuckyClick('connection', record.connections, 'visitedConnections')}
                >
                    I feel lucky
                </Button>
            </Space>
            <Table
                columns={connectionColumns}
                dataSource={record.connections}
                scroll={{ x: 800, y: 300 }}
                pagination={{
                    defaultPageSize: 50,
                    showSizeChanger: true,
                }}
                rowKey="id"
            />
        </div>
    ), []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Loading companies..." />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error loading companies"
                description={error}
                type="error"
                showIcon
                style={{ margin: '50px' }}
            />
        );
    }

    if (!allCompanies.length) return <Uploader />;

    return (
        <div>
            <KeywordSearch
                onSearch={setSearchText}
                placeholder="Search companies..."
                style={{ marginBottom: 16 }}
            />
            {filteredCompanies.length === 0 && searchText && (
                <Alert
                    message="No results found"
                    description="Try adjusting your search terms"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}
            <Table
                showHeader={true}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    onChange: setCurrentPage,
                    pageSize: PAGE_SIZE,
                    showSizeChanger: true,
                    pageSizeOptions: ['50', '100', '250', '500'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                columns={companyColumns}
                expandable={{
                    expandedRowRender: renderConnectionsTable,
                    rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
                }}
                dataSource={filteredCompanies}
                scroll={{ x: 800, y: 'calc(100vh - 300px)' }}
                sticky
            />
            <BackTop />
        </div>
    );
}

export default Companies;
