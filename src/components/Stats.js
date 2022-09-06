import React from "react";
import {Card, Col, Row, Statistic} from "antd";

export const Stats = () => (
    <div>
        <Row gutter={16}>
            <Col span={8}>
                <Card>
                    <Statistic
                        title="Connections"
                        value={JSON.parse(localStorage.getItem('connections')).length}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Statistic
                        title="Companies"
                        value={JSON.parse(localStorage.getItem('companies')).length}
                    />
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Statistic
                        title="Positions"
                        value={JSON.parse(localStorage.getItem('positions')).length}
                    />
                </Card>
            </Col>
        </Row>
    </div>
);
