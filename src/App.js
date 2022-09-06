import Connections from "./pages/Connections";
import Companies from "./pages/Companies";
import Uploader from './pages/Uploader';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Card, Col, Divider, Menu, Row, Space, Statistic} from "antd";
import Positions from "./pages/Positions";

function App() {
    return (
        <div className="App" style={{textAlign: "center"}}>
            <Router>
                <div className="App">
                    <div className="AppContent">
                        <h1 style={{padding: "1% 3% 0 3%"}}>Li Search</h1>
                        <Divider orientation="left" plain style={{marginBottom: 0}}>
                        </Divider>
                        <Space size="middle" align="vertical">
                            <Menu mode="vertical">
                                <Menu.Item key="home">
                                    <Link to="/">Connections</Link>
                                </Menu.Item>
                                <Menu.Item key="positions">
                                    <Link to="/positions">Positions</Link>
                                </Menu.Item>
                                <Menu.Item key="companies">
                                    <Link to="/companies">Companies</Link>
                                </Menu.Item>
                                <Menu.Item key="uploadFile">
                                    <Link to="/upload">Upload</Link>
                                </Menu.Item>
                            </Menu>

                            <Switch>
                                <Route exact path="/">
                                    <Connections/>
                                </Route>
                                <Route path="/positions">
                                    <Positions/>
                                </Route>
                                <Route exact path="/companies">
                                    <Companies/>
                                </Route>
                                <Route exact path="/upload">
                                    <Uploader/>
                                </Route>
                            </Switch>
                        </Space>
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;
