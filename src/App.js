import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Divider, Space, Tabs } from "antd";
import Connections from "./pages/Connections";
import Companies from "./pages/Companies";
import Uploader from "./pages/Uploader";
import Positions from "./pages/Positions";
import Stats from "./components/Stats";
import Config from "./pages/Config";

const { TabPane } = Tabs;

function App() {
    return (
        <div className="App" style={{ textAlign: "center", width: "100%", padding: "0 20px" }}>
            <Router>
                <div className="AppContent" style={{ width: "100%" }}>
                    <h1 style={{ padding: "1% 0" }}>Li Search</h1>
                    <Divider orientation="left" plain style={{ marginBottom: 0 }} />
                    <Space size="middle" align="vertical" style={{ width: "100%" }}>
                        <Tabs defaultActiveKey="1" style={{ width: "100%" }}>
                            <TabPane tab="Home" key="1">
                                <Stats />
                                <Connections />
                            </TabPane>
                            <TabPane tab="Companies" key="2">
                                <Stats />
                                <Companies />
                            </TabPane>
                            <TabPane tab="Positions" key="3">
                                <Stats />
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
                </div>
            </Router>
        </div>
    );
}

export default App;
