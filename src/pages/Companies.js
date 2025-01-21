import React, { useEffect, useCallback } from "react";
import { BackTop, Button, Space, Table, Alert, Spin } from "antd";
import Uploader from "./Uploader";
import KeywordSearch from "../components/Search";
import { useDebounce } from "../hooks/useDataFetching";
import { usePerformanceTracking } from "../hooks/usePerformanceTracking";
import { useCompanyData } from "../hooks/useCompanyData";
import { useLuckyClick } from "../hooks/useLuckyClick";
import PerformanceStats from "../components/PerformanceStats";
import { connectionColumns, companyColumns } from "../components/TableColumns";
import { logger } from "../services/logger";

// Constants
const DEBOUNCE_DELAY = 300;

const Companies = () => {
    // Custom hooks
    const { performanceStats, performanceHistory, updatePerformanceStats } = usePerformanceTracking();
    const { companiesData, loading, error, handleTableChange, fetchCompanies } = useCompanyData(updatePerformanceStats);
    const handleLuckyClick = useLuckyClick();

    // State
    const [searchText, setSearchText] = React.useState("");
    const debouncedSearch = useDebounce(searchText, DEBOUNCE_DELAY);

    // Effects
    useEffect(() => {
        fetchCompanies(1, debouncedSearch);
    }, [debouncedSearch, fetchCompanies]);

    // Handlers
    const renderConnectionsTable = useCallback((record) => (
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

    // Loading state
    if (loading && !companiesData.items.length) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Loading companies..." />
            </div>
        );
    }

    // Error state
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

    // Empty state
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
                        pageSize: 100,
                        total: companiesData.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['50', '100', '250', '500'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    onChange={(pagination, filters, sorter) => handleTableChange(pagination, filters, sorter, debouncedSearch)}
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
};

export default React.memo(Companies);
