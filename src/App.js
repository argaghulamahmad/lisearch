import React from "react";
import {Layout, Divider, Space, Tabs, Typography} from "antd";
import Connections from "./pages/Connections";
import Companies from "./pages/Companies";
import Uploader from "./pages/Uploader";
import Positions from "./pages/Positions";
import Stats from "./components/Stats";
import Config from "./pages/Config";

const {Header, Content} = Layout;
const {TabPane} = Tabs;
const {Title} = Typography;

function App() {
    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{background: "#fff", padding: 0}}>
                <Title level={1} style={{margin: "0", textAlign: "center"}}>Li Search</Title>
            </Header>
            <Content>
                <Space direction="vertical" style={{width: "100%", padding: "20px", height: "100%"}}>
                    <Stats/>
                    <Divider orientation="left" plain/>
                    <Tabs defaultActiveKey="1" style={{width: "100%"}}>
                        <TabPane tab="Home" key="1">
                            <Connections/>
                        </TabPane>
                        <TabPane tab="Companies" key="2">
                            <Companies/>
                        </TabPane>
                        <TabPane tab="Positions" key="3">
                            <Positions/>
                        </TabPane>
                        <TabPane tab="Upload" key="4">
                            <Uploader/>
                        </TabPane>
                        <TabPane tab="Config" key="5">
                            <Config/>
                        </TabPane>
                    </Tabs>
                </Space>
            </Content>
        </Layout>
    );
}

export default App;
