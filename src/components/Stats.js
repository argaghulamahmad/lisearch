import React, {useEffect, useState} from "react";
import {Card, Col, Empty, Row, Statistic} from "antd";
import {useHistory} from "react-router-dom";
import db from "../db";

export const Stats = () => {
    const history = useHistory();

    const [connections, setConnections] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        db.connections.toArray().then((connections) => {
            setConnections(connections)
        })
        db.companies.toArray().then((companies) => {
            setCompanies(companies)
        })
        db.positions.toArray().then((positions) => {
            setPositions(positions)
        })
    }, []);

    return (
        connections && companies && positions ?
            <div style={{width: "1200px"}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card hoverable={true}
                              onClick={() => {
                                  history.push('/connections');
                              }}>
                            <Statistic
                                title="Connections"
                                value={connections.length}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card hoverable={true}
                              onClick={() => {
                                  history.push('/companies');
                              }}>
                            <Statistic
                                title="Companies"
                                value={companies.length}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card hoverable={true}
                              onClick={() => {
                                  history.push('/positions');
                              }}>
                            <Statistic
                                title="Positions"
                                value={positions.length}
                            />
                        </Card>
                    </Col>
                </Row>
            </div> : <div style={{width: "1200px"}}>
                <Empty/>
            </div>
    );
};
