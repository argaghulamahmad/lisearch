import { useEffect, useState, useMemo, useCallback } from "react";
import { BackTop, Button, notification, Space, Table, Alert, Spin, Typography } from "antd";
import Uploader from "./Uploader";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";
import { useDebounce } from "../hooks/useDataFetching";
import { logger } from "../services/logger";

const { Text } = Typography;

// Constants
const PAGE_SIZE = 100;
const DEBOUNCE_DELAY = 300;

// Memoized components
const renderWithCopy = useMemo(() => (text) => (
    <div>
        <a href={`https://www.google.com/search?q=${text}`} target="_blank" rel="noreferrer">{text}</a>
        <CopyToClipboard value={text} />
    </div>
), []);

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
    },
    {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        render: timestamp => new Date(timestamp).toLocaleDateString(),
        width: 150,
    }
];

const Companies = () => {
    // State
    const [companiesData, setCompaniesData] = useState({ items: [], total: 0, page: 1 });
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortField, setSortField] = useState('company');
    const [sortOrder, setSortOrder] = useState('ascend');
    const [performanceStats, setPerformanceStats] = useState({});

    // Hooks
    const debouncedSearch = useDebounce(searchText, DEBOUNCE_DELAY);

    // Fetch companies with performance tracking
    const fetchCompanies = useCallback(async (page, searchTerm, options = {}) => {
        const fetchId = Date.now();
        logger.startTimer(`fetch_${fetchId}`);

        try {
            setLoading(true);
            setError(null);

            const result = await db.getCompaniesPaginated(page, PAGE_SIZE, searchTerm, {
                ...options,
                sortBy: sortField,
                sortOrder
            });

            setCompaniesData(result);

            // Update performance stats
            const duration = logger.endTimer(`fetch_${fetchId}`);
            setPerformanceStats(prev => ({
                ...prev,
                lastFetchDuration: duration,
                averageFetchDuration: prev.averageFetchDuration
                    ? (prev.averageFetchDuration + duration) / 2
                    : duration
            }));

            logger.info('Companies fetched', {
                page,
                searchTerm,
                count: result.items.length,
                total: result.total,
                duration
            });
        } catch (err) {
            const errorMessage = err.message;
            setError(errorMessage);
            logger.error('Error fetching companies', {
                error: errorMessage,
                page,
                searchTerm
            });
            notification.error({
                message: 'Error loading companies',
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    }, [sortField, sortOrder]);

    // Effects
    useEffect(() => {
        fetchCompanies(1, debouncedSearch);
    }, [debouncedSearch, fetchCompanies]);

    // Event handlers
    const handleTableChange = useCallback((pagination, filters, sorter) => {
        if (sorter.field) {
            setSortField(sorter.field);
            setSortOrder(sorter.order);
        }

        logger.trackEvent('navigation', 'changePage', 'companiesTable', pagination.current);
        fetchCompanies(pagination.current, debouncedSearch);
    }, [debouncedSearch, fetchCompanies]);

    const handleLuckyClick = useCallback((type, items, visitedKey) => {
        try {
            logger.startTimer('luckyClick');
            const visitedSet = new Set(JSON.parse(localStorage.getItem(visitedKey)) || []);
            const unvisitedItems = items.filter(({ id }) => !visitedSet.has(id));

            if (unvisitedItems.length === 0) {
                logger.info('No more unvisited items', { type });
                notification.info({
                    message: 'No more items',
                    description: 'You have visited all items in this list!',
                });
                return;
            }

            const selectedItems = new Set();
            for (let i = 0; i < Math.min(5, unvisitedItems.length); i++) {
                let item;
                do {
                    const randomIndex = Math.floor(Math.random() * unvisitedItems.length);
                    item = unvisitedItems[randomIndex];
                } while (selectedItems.has(item.id));

                selectedItems.add(item.id);
                visitedSet.add(item.id);

                logger.trackEvent('interaction', 'luckyClick', item.company);
                notification.success({
                    message: `Opening ${type}`,
                    description: `Opening ${item.company} in new tab!`,
                });
                window.open(`https://www.google.com/search?q=${item.company}`, '_blank');
            }

            localStorage.setItem(visitedKey, JSON.stringify([...visitedSet]));
        } catch (err) {
            logger.error('Error in lucky click', { error: err.message });
            notification.error({
                message: 'Error processing lucky click',
                description: err.message,
            });
        } finally {
            logger.endTimer('luckyClick');
        }
    }, []);

    const renderConnectionsTable = useMemo(() => (record) => (
        <div>
            <Space align="baseline" direction="vertical" style={{ margin: "20px", width: "100%" }}>
                <Button
                    type="primary"
                    style={{ width: "100%" }}
                    onClick={() => handleLuckyClick('connection', record.connections, 'visitedConnections')}
                >
                    I feel lucky
                </Button>
                {performanceStats.lastFetchDuration && (
                    <Text type="secondary">
                        Last fetch: {performanceStats.lastFetchDuration.toFixed(2)}ms
                        {performanceStats.averageFetchDuration &&
                            ` (avg: ${performanceStats.averageFetchDuration.toFixed(2)}ms)`}
                    </Text>
                )}
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
    ), [handleLuckyClick, performanceStats]);

    // Render loading state
    if (loading && !companiesData.items.length) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Loading companies..." />
            </div>
        );
    }

    // Render error state
    if (error && !companiesData.items.length) {
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

    // Render empty state
    if (!companiesData.total) return <Uploader />;

    // Main render
    return (
        <div>
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <KeywordSearch
                    onSearch={setSearchText}
                    placeholder="Search companies..."
                />
                {performanceStats.lastFetchDuration && (
                    <Text type="secondary">
                        Query time: {performanceStats.lastFetchDuration.toFixed(2)}ms
                        {performanceStats.averageFetchDuration &&
                            ` (avg: ${performanceStats.averageFetchDuration.toFixed(2)}ms)`}
                    </Text>
                )}
            </Space>

            {companiesData.items.length === 0 && searchText && (
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
                loading={loading}
                pagination={{
                    current: companiesData.page,
                    pageSize: PAGE_SIZE,
                    total: companiesData.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['50', '100', '250', '500'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
                columns={companyColumns}
                expandable={{
                    expandedRowRender: renderConnectionsTable,
                    rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
                }}
                dataSource={companiesData.items}
                scroll={{ x: 800, y: 'calc(100vh - 300px)' }}
                sticky
            />
            <BackTop />
        </div>
    );
}

export default Companies;
