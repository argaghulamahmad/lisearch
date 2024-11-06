import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import db from "../db";

const Stats = () => {
    const [counts, setCounts] = useState({
        connectionsCount: 0,
        companiesCount: 0,
        positionsCount: 0,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            const [connections, companies, positions] = await Promise.all([
                db.connections.toArray(),
                db.companies.toArray(),
                db.positions.toArray()
            ]);

            setCounts({
                connectionsCount: connections.length,
                companiesCount: companies.length,
                positionsCount: positions.length,
            });

            console.info("Connections", connections.length);
        };

        fetchCounts().then(r => console.info(r));
    }, []);

    const renderStatisticCard = (title, count) => (
        <Col span={8}>
            <Card hoverable>
                <Statistic title={title} value={count} />
            </Card>
        </Col>
    );

    return (
        <Row gutter={16}>
            {renderStatisticCard("Connections", counts.connectionsCount)}
            {renderStatisticCard("Companies", counts.companiesCount)}
            {renderStatisticCard("Positions", counts.positionsCount)}
        </Row>
    );
};

export default Stats;
