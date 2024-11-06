import React from "react";
import { Divider, Space, Tabs, Typography } from "antd";
import Connections from "./pages/Connections";
import Companies from "./pages/Companies";
import Uploader from "./pages/Uploader";
import Positions from "./pages/Positions";
import Stats from "./components/Stats";
import Config from "./pages/Config";

const { TabPane } = Tabs;
const { Title } = Typography;

function App() {
    return (
        <div className="App" style={{ textAlign: "center", width: "100%", padding: "0 20px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={1} style={{ margin: "1% 0" }}>Li Search</Title>
                <Stats />
                <Divider orientation="left" plain style={{ marginBottom: 0 }} />
                <Space size="middle" align="center" style={{ width: "100%" }}>
                    <Tabs defaultActiveKey="1" style={{ width: "100%" }}>
                        <TabPane tab="Home" key="1">
                            <Connections />
                        </TabPane>
                        <TabPane tab="Companies" key="2">
                            <Companies />
                        </TabPane>
                        <TabPane tab="Positions" key="3">
                            <Positions />
                        </TabPane>
                        <TabPane tab="Upload" key="4">
                            <Uploader />
                        </TabPane>
                        <TabPane tab="Config" key="5">
                            <Config />
                        </TabPane>
                    </Tabs>
                </Space>
            </Space>
        </div>
    );
}

export default App;
