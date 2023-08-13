import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import { useHistory } from "react-router-dom";
import db from "../db";

const Stats = () => {
    const history = useHistory();

    const [connectionsCount, setConnectionsCount] = useState(0);
    const [companiesCount, setCompaniesCount] = useState(0);
    const [positionsCount, setPositionsCount] = useState(0);

    useEffect(() => {
        async function fetchCounts() {
            const [connections, companies, positions] = await Promise.all([
                db.connections.toArray(),
                db.companies.toArray(),
                db.positions.toArray()
            ]);

            setConnectionsCount(connections.length);
            setCompaniesCount(companies.length);
            setPositionsCount(positions.length);

            console.info("Connections", connections.length);
        }

        fetchCounts().then(r => console.info(r));
    }, []);

    const renderStatisticCard = (title, count, route) => {
        return (
            <Col span={8}>
                <Card hoverable onClick={() => history.push(route)}>
                    <Statistic title={title} value={count} />
                </Card>
            </Col>
        );
    };

    return (
        <div style={{ width: "1200px" }}>
            <Row gutter={16}>
                {renderStatisticCard("Connections", connectionsCount, '/connections')}
                {renderStatisticCard("Companies", companiesCount, '/companies')}
                {renderStatisticCard("Positions", positionsCount, '/positions')}
            </Row>
        </div>
    );
};

export default Stats;
