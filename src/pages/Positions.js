import React, { useEffect, useState } from "react";
import { BackTop, Button, Card, Divider, notification, Space, Table } from "antd";
import KeywordSearch from "../components/Search";
import CopyToClipboard from "../components/CopyToClipboard";
import db from "../db";

const Positions = () => {
    const [positions, setPositions] = useState([]);
    const [visitedPositions, setVisitedPositions] = useState([]);

    useEffect(() => {
        db.positions.toArray().then((positions) => {
            setPositions(positions);
        });

        const storedVisitedPositions = JSON.parse(localStorage.getItem('visitedPositions')) || [];
        setVisitedPositions(storedVisitedPositions);
    }, []);

    const handleLuckyButtonClick = () => {
        const unvisitedPositions = positions.filter(({ id }) => !visitedPositions.includes(id));
        const numOpenings = Math.min(5, unvisitedPositions.length);

        for (let i = 0; i < numOpenings; i++) {
            const { id, position, company } = unvisitedPositions[i];
            const newPosition = [...visitedPositions, id];

            notification.success({
                message: "Opening position", description: `Opening ${position} at ${company} in a new tab!`,
            });

            window.open(`https://www.google.com/search?q=${position} at ${company}`, '_blank');
            setVisitedPositions(newPosition);
            localStorage.setItem('visitedPositions', JSON.stringify(newPosition));
        }
    };

    const handleSearch = (searchText) => {
        const filteredPosition = positions.filter(({ title }) => {
            return title.toLowerCase().includes(searchText.toLowerCase());
        });

        setPositions(filteredPosition);
    };

    return (<div>
        <Table
            showHeader={true}
            rowKey="id"
            pagination={{
                defaultPageSize: 100, showSizeChanger: true, pageSizeOptions: ['10', '50', '100', '250', '1000']
            }}
            columns={[{
                title: 'Position', dataIndex: 'title', key: 'id', render: text => (<div>
                    <a href={`https://www.google.com/search?q=${text}`} target="_blank"
                        rel="noreferrer">{text}</a>
                    <CopyToClipboard value={text} />
                </div>), sorter: (a, b) => a.title.localeCompare(b.title)
            }]}
            dataSource={positions}
        />
        <BackTop />
    </div>);
};

export default Positions;
