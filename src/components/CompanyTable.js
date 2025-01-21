import React, { useMemo, useCallback } from 'react';
import { Table } from "antd";
import CopyToClipboard from "./CopyToClipboard"; // Assuming this is the correct path

const CompanyTable = React.memo(({ companies }) => {
    const columns = useMemo(() => [
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
    ], []);

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        // Handle table changes if needed
        console.log('Table params:', { pagination, filters, sorter });
    }, []);

    const expandedRowRender = useCallback((record) => (
        <div>
            {/* Render connections table here */}
        </div>
    ), []);

    return (
        <Table
            showHeader={true}
            rowKey="id"
            pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '50', '100', '200']
            }}
            style={{ padding: "0 2% 0 2%" }}
            columns={columns}
            dataSource={companies}
            onChange={handleTableChange}
            expandable={{
                expandedRowRender,
                rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
            }}
            virtual={companies.length > 100} // Enable virtual scrolling for large datasets
            scroll={{ y: 500 }}
        />
    );
});

CompanyTable.displayName = 'CompanyTable';

export default CompanyTable;