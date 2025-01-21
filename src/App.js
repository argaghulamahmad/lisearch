import React, { Suspense } from "react";
import { Layout, Space, Tabs, Typography, Spin } from "antd";
import ErrorBoundary from "./components/ErrorBoundary";
import Stats from "./components/Stats";

// Lazy loaded components
const Connections = React.lazy(() => import("./pages/Connections"));
const Companies = React.lazy(() => import("./pages/Companies"));
const Positions = React.lazy(() => import("./pages/Positions"));
const Uploader = React.lazy(() => import("./pages/Uploader"));
const Config = React.lazy(() => import("./pages/Config"));

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

// Styles
const styles = {
    layout: {
        minHeight: "100vh"
    },
    header: {
        background: "#fff",
        padding: 0
    },
    title: {
        margin: "0",
        textAlign: "center"
    },
    content: {
        width: "100%",
        padding: "20px",
        height: "100%"
    },
    tabs: {
        width: "100%"
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
    }
};

// Loading fallback component
const LoadingFallback = () => (
    <div style={styles.loadingContainer}>
        <Spin size="large" tip="Loading..." />
    </div>
);

// Header component
const AppHeader = () => (
    <Header style={styles.header}>
        <Title level={1} style={styles.title}>Li Search</Title>
    </Header>
);

// Tab configuration with error boundaries
const TAB_CONFIG = [
    {
        key: "1",
        title: "Connections",
        component: (props) => (
            <ErrorBoundary>
                <Connections {...props} />
            </ErrorBoundary>
        )
    },
    {
        key: "2",
        title: "Companies",
        component: (props) => (
            <ErrorBoundary>
                <Companies {...props} />
            </ErrorBoundary>
        )
    },
    {
        key: "3",
        title: "Positions",
        component: (props) => (
            <ErrorBoundary>
                <Positions {...props} />
            </ErrorBoundary>
        )
    },
    {
        key: "4",
        title: "Upload",
        component: (props) => (
            <ErrorBoundary>
                <Uploader {...props} />
            </ErrorBoundary>
        )
    },
    {
        key: "5",
        title: "Config",
        component: (props) => (
            <ErrorBoundary>
                <Config {...props} />
            </ErrorBoundary>
        )
    }
];

function App() {
    return (
        <ErrorBoundary>
            <Layout style={styles.layout}>
                <AppHeader />
                <Content>
                    <Space direction="vertical" style={styles.content}>
                        <ErrorBoundary>
                            <Stats />
                        </ErrorBoundary>
                        <Tabs defaultActiveKey="1" style={styles.tabs} destroyInactiveTabPane>
                            {TAB_CONFIG.map(({ key, title, component: Component }) => (
                                <TabPane tab={title} key={key}>
                                    <Suspense fallback={<LoadingFallback />}>
                                        <Component />
                                    </Suspense>
                                </TabPane>
                            ))}
                        </Tabs>
                    </Space>
                </Content>
            </Layout>
        </ErrorBoundary>
    );
}

export default App;
