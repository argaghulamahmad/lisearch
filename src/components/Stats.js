import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Col, Row, Statistic } from "antd";
import db from "../db";

const Stats = React.memo(() => {
    const [counts, setCounts] = useState({
        connectionsCount: 0,
        companiesCount: 0,
        positionsCount: 0,
    });

    const fetchCounts = useCallback(async () => {
        try {
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
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    }, []);

    useEffect(() => {
        fetchCounts();

        // Subscribe to database changes
        const subscription = db.changes.subscribe({
            next: () => fetchCounts(),
        });

        return () => subscription.unsubscribe();
    }, [fetchCounts]);

    const renderStatisticCard = useMemo(() => (title, count) => (
        <Col span={8} key={title}>
            <Card hoverable>
                <Statistic title={title} value={count} />
            </Card>
        </Col>
    ), []);

    const statistics = useMemo(() => [
        { title: "Connections", count: counts.connectionsCount },
        { title: "Companies", count: counts.companiesCount },
        { title: "Positions", count: counts.positionsCount }
    ], [counts]);

    return (
        <Row gutter={16}>
            {statistics.map(({ title, count }) => renderStatisticCard(title, count))}
        </Row>
    );
});

Stats.displayName = 'Stats';

export default Stats;
