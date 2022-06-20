import {useEffect, useState} from "react";
import {BackTop, Card, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [connections, setConnections] = useState([]);

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
                <Table
                    showHeader={true}
                    rowKey="idx"
                    pagination={{
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '200']
                    }}
                    style={{padding: "0 5% 0 5%"}}
                    columns={
                        [
                            {
                                title: 'Full Name',
                                dataIndex: 'fullName',
                                key: 'fullName',
                                render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank">{text}</a>,
                                sorter: (a, b) => {
                                    return a.fullName.localeCompare(b.fullName)
                                },
                            }
                        ]
                    }
                    dataSource={connections}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Connections;