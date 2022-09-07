import Connections from "./pages/Connections";
import Companies from "./pages/Companies";
import Uploader from './pages/Uploader';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Divider, Menu, Space} from "antd";
import Positions from "./pages/Positions";
import {Stats} from "./components/Stats";
import Config from "./pages/Config";

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
                                    <Link to="/connections">Home</Link>
                                </Menu.Item>
                                <Menu.Item key="uploadFile">
                                    <Link to="/upload">Upload</Link>
                                </Menu.Item>
                                <Menu.Item key="config">
                                    <Link to="/config">Config</Link>
                                </Menu.Item>
                            </Menu>

                            <Switch>
                                <Route exact path="/">
                                    <Stats/>
                                </Route>
                                <Route exact path="/connections">
                                    <Stats/>
                                    <Connections/>
                                </Route>
                                <Route path="/positions">
                                    <Stats/>
                                    <Positions/>
                                </Route>
                                <Route exact path="/companies">
                                    <Stats/>
                                    <Companies/>
                                </Route>
                                <Route exact path="/upload">
                                    <Uploader/>
                                </Route>
                                <Route exact path="/config">
                                    <Config/>
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
