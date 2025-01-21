import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceStats = React.memo(({ stats, history }) => (
    <Card title="Performance Metrics" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
            <Col span={6}>
                <Statistic
                    title="Last Query Time"
                    value={stats.lastFetchDuration?.toFixed(2) || 0}
                    suffix="ms"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Average Query Time"
                    value={stats.averageFetchDuration?.toFixed(2) || 0}
                    suffix="ms"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Cache Hit Rate"
                    value={stats.cacheHitRate?.toFixed(1) || 0}
                    suffix="%"
                />
            </Col>
            <Col span={6}>
                <Statistic
                    title="Total Queries"
                    value={stats.totalQueries || 0}
                />
            </Col>
        </Row>
        <div style={{ height: 200, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="duration" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </Card>
));

PerformanceStats.displayName = 'PerformanceStats';

export default PerformanceStats;