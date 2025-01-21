import React, { useEffect, useState } from "react";
import { BackTop, Button, Card, Divider, notification, Space, Table } from "antd";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";

const TABLE_CONFIG = {
    pagination: {
        defaultPageSize: 100,
        showSizeChanger: true,
        pageSizeOptions: ['10', '50', '100', '250', '1000']
    },
    columns: [{
        title: 'Position',
        dataIndex: 'title',
        key: 'id',
        render: text => (
            <div>
                <a
                    href={`https://www.google.com/search?q=${text}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {text}
                </a>
                <CopyToClipboard value={text} />
            </div>
        ),
        sorter: (a, b) => a.title.localeCompare(b.title)
    }]
};

const Positions = React.memo(() => {
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        const loadPositions = async () => {
            try {
                const data = await db.positions.toArray();
                setPositions(data);
            } catch (error) {
                notification.error({
                    message: 'Error loading positions',
                    description: error.message
                });
            }
        };

        loadPositions();
    }, []);

    return (
        <div>
            <Table
                showHeader={true}
                rowKey="id"
                pagination={TABLE_CONFIG.pagination}
                columns={TABLE_CONFIG.columns}
                dataSource={positions}
            />
            <BackTop />
        </div>
    );
});

Positions.displayName = 'Positions';

export default Positions;
