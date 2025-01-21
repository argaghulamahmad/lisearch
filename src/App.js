import React, { Suspense } from "react";
import {Layout, Space, Tabs, Typography, Spin} from "antd";
import Stats from "./components/Stats";

// Lazy load components
const Connections = React.lazy(() => import("./pages/Connections"));
const Companies = React.lazy(() => import("./pages/Companies"));
const Positions = React.lazy(() => import("./pages/Positions"));
const Uploader = React.lazy(() => import("./pages/Uploader"));
const Config = React.lazy(() => import("./pages/Config"));

const {Header, Content} = Layout;
const {TabPane} = Tabs;
const {Title} = Typography;

// Loading fallback component
const LoadingFallback = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" />
    </div>
);

function App() {
    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{background: "#fff", padding: 0}}>
                <Title level={1} style={{margin: "0", textAlign: "center"}}>Li Search</Title>
            </Header>
            <Content>
                <Space direction="vertical" style={{width: "100%", padding: "20px", height: "100%"}}>
                    <Stats/>
                    <Tabs defaultActiveKey="1" style={{width: "100%"}} destroyInactiveTabPane>
                        <TabPane tab="Connections" key="1">
                            <Suspense fallback={<LoadingFallback />}>
                                <Connections/>
                            </Suspense>
                        </TabPane>
                        <TabPane tab="Companies" key="2">
                            <Suspense fallback={<LoadingFallback />}>
                                <Companies/>
                            </Suspense>
                        </TabPane>
                        <TabPane tab="Positions" key="3">
                            <Suspense fallback={<LoadingFallback />}>
                                <Positions/>
                            </Suspense>
                        </TabPane>
                        <TabPane tab="Upload" key="4">
                            <Suspense fallback={<LoadingFallback />}>
                                <Uploader/>
                            </Suspense>
                        </TabPane>
                        <TabPane tab="Config" key="5">
                            <Suspense fallback={<LoadingFallback />}>
                                <Config/>
                            </Suspense>
                        </TabPane>
                    </Tabs>
                </Space>
            </Content>
        </Layout>
    );
}

export default React.memo(App);
