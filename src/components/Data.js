import {useEffect, useState} from "react";
import {BackTop, Card, Divider, List, Select, Space} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Data = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [connections, setConnections] = useState([]);

    const {Option} = Select;

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))

        setConnections(JSON.parse(localStorage.getItem('connections')))

    }, []);


    return (
        connections ? <div>
            <Card>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                <List style={{padding: "0 5% 0 5%"}} dataSource={connections}
                      renderItem={connection => (
                          <List.Item>
                              <List.Item.Meta
                                  title={<a href={`https://instagram.com/${`${connection.firstName} ${connection.lastName}`}`} rel="noreferrer nofollow"
                                            target="_blank">{`${connection.firstName} ${connection.lastName}`}</a>}
                              />
                          </List.Item>
                      )}/>
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Data;