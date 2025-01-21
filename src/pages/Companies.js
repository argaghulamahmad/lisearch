import { useEffect, useState, useMemo, useCallback } from "react";
import { BackTop, Button, notification, Space, Table, Alert, Spin, Typography, Card, Statistic, Row, Col } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
const MAX_PERFORMANCE_HISTORY = 20;

// Performance tracking component
const PerformanceStats = ({ stats, history }) => (
    <Card title="Performance Metrics" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
            <Col span={6}>
                <Statistic
                    title="Last Query Time"
                    value={stats.lastFetchDuration?.toFixed(2) || 0}
                    suffix="ms"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Average Query Time"
                    value={stats.averageFetchDuration?.toFixed(2) || 0}
                    suffix="ms"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Cache Hit Rate"
                    value={stats.cacheHitRate?.toFixed(1) || 0}
                    suffix="%"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Total Queries"
                    value={stats.totalQueries || 0}
                />
            </Col>
        </Row>
        <div style={{ height: 200, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="duration" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </Card>
);

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
    const [performanceStats, setPerformanceStats] = useState({
        lastFetchDuration: 0,
        averageFetchDuration: 0,
        cacheHitRate: 0,
        totalQueries: 0,
    });
    const [performanceHistory, setPerformanceHistory] = useState([]);
    const [dbStats, setDbStats] = useState(null);

    // Hooks
    const debouncedSearch = useDebounce(searchText, DEBOUNCE_DELAY);

    // Update database stats periodically
    useEffect(() => {
        const updateStats = async () => {
            const stats = await db.getStats();
            setDbStats(stats);
        };

        updateStats();
        const interval = setInterval(updateStats, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

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
            const timestamp = new Date().toLocaleTimeString();

            setPerformanceStats(prev => {
                const newStats = {
                    lastFetchDuration: duration,
                    averageFetchDuration: prev.averageFetchDuration
                        ? (prev.averageFetchDuration * prev.totalQueries + duration) / (prev.totalQueries + 1)
                        : duration,
                    totalQueries: prev.totalQueries + 1,
                    cacheHitRate: result.fromCache
                        ? ((prev.cacheHitRate * prev.totalQueries + 100) / (prev.totalQueries + 1))
                        : ((prev.cacheHitRate * prev.totalQueries) / (prev.totalQueries + 1))
                };
                return newStats;
            });

            setPerformanceHistory(prev => {
                const newHistory = [...prev, { timestamp, duration }];
                return newHistory.slice(-MAX_PERFORMANCE_HISTORY);
            });

            logger.info('Companies fetched', {
                page,
                searchTerm,
                count: result.items.length,
                total: result.total,
                duration,
                fromCache: result.fromCache
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
    ), [handleLuckyClick]);

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
            <Space direction="vertical" style={{ width: '100%' }}>
                <KeywordSearch
                    onSearch={setSearchText}
                    placeholder="Search companies..."
                />

                <PerformanceStats
                    stats={performanceStats}
                    history={performanceHistory}
                />

                {dbStats && (
                    <Card size="small" title="Database Stats" style={{ marginBottom: 16 }}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Total Companies"
                                    value={dbStats.totalCompanies}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Total Connections"
                                    value={dbStats.totalConnections}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="DB Size"
                                    value={(dbStats.dbSize / (1024 * 1024)).toFixed(2)}
                                    suffix="MB"
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Cache Size"
                                    value={(dbStats.cacheSize / (1024 * 1024)).toFixed(2)}
                                    suffix="MB"
                                />
                            </Col>
                        </Row>
                    </Card>
                )}

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
                    scroll={{ x: 800, y: 'calc(100vh - 500px)' }}
                    sticky
                    virtual
                />
            </Space>
            <BackTop />
        </div>
    );
}

export default Companies;
