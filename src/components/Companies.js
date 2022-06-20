import {useEffect, useState} from "react";
import {BackTop, Card, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setCompanies(JSON.parse(localStorage.getItem('connectionsAtCompany')))
    }, []);


    return (
        companies ? <div>
            <Card>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                <Table style={{padding: "0 5% 0 5%"}} rowkey={(record) => record.idx} columns={
                    [
                        {
                            title: 'Company',
                            dataIndex: 'company',
                            key: 'company',
                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                               target="_blank">{text}</a>,
                        }
                    ]
                }
                       expandable={{
                           expandedRowRender: record => <div>

                           </div>,
                           rowExpandable: record => record.connections.length !== 0,
                       }}
                       dataSource={companies}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Connections;