import React from "react";
import {Card, Col, Empty, Row, Statistic} from "antd";
import {useHistory} from "react-router-dom";


export const Stats = () => {
    const history = useHistory();

    return (
        JSON.parse(localStorage.getItem('connections')) && JSON.parse(localStorage.getItem('companies')) && JSON.parse(localStorage.getItem('positions')) ?
            <div style={{width: "1200px"}}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Card hoverable={true}
                              onClick={() => {
                                  history.push('/connections');
                              }}>
                            <Statistic
                                title="Connections"
                                value={JSON.parse(localStorage.getItem('connections')).length}
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
                                value={JSON.parse(localStorage.getItem('companies')).length}
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
                                value={JSON.parse(localStorage.getItem('positions')).length}
                            />
                        </Card>
                    </Col>
                </Row>
            </div> : <div style={{width: "1200px"}}>
                <Empty/>
            </div>
    );
};
