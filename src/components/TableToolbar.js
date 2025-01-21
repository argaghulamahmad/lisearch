import React, { useCallback, useMemo } from 'react';
import { Space, Button } from "antd";
import KeywordSearch from "./Search"; // Assuming this is the correct path

const TableToolbar = React.memo(({ companies, setCompanies }) => {
    const handleSearch = useCallback((searchText) => {
        if (!searchText) {
            setCompanies(companies);
            return;
        }

        const searchLower = searchText.toLowerCase();
        const filteredCompanies = companies.filter(({ company }) =>
            company.toLowerCase().includes(searchLower)
        );
        setCompanies(filteredCompanies);
    }, [companies, setCompanies]);

    const handleLuckyClick = useCallback(() => {
        if (companies.length === 0) return;

        const randomIndex = Math.floor(Math.random() * companies.length);
        setCompanies([companies[randomIndex]]);
    }, [companies, setCompanies]);

    const toolbarStyle = useMemo(() => ({
        textAlign: "left",
        position: "sticky",
        top: 0,
        zIndex: 1,
        backgroundColor: "#fff",
        padding: "10px 0"
    }), []);

    return (
        <div style={toolbarStyle}>
            <Space size="middle" style={{ width: "100%" }}>
                <KeywordSearch onSearch={handleSearch} />
                <Button onClick={handleLuckyClick} type="primary">
                    I feel lucky
                </Button>
            </Space>
        </div>
    );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;