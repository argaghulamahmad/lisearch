import './App.css';

import Connections from "./components/Connections";
import Companies from "./components/Companies";
import Uploader from './components/Uploader';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Divider, Menu} from "antd";
import Positions from "./components/Positions";

function App() {
  return (
      <div className="App">
        <Router>
          <div className="App">
            <div className="AppContent">
              <Divider orientation="center">
                <h1>Li Search</h1>
                <Menu mode="horizontal">
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
              </Divider>

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
            </div>
          </div>
        </Router>
      </div>
  );
}

export default App;
