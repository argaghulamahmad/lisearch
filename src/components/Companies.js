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
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'company',
                                render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank">{text}</a>,
                                sorter: (a, b) => {
                                    return a.company.localeCompare(b.company)
                                },
                            },
                            {
                                title: 'Total Connections',
                                key: 'totalConnections',
                                render: record => <a>{record.connections.length}</a>,
                                sorter: (a, b) => {
                                    if (a > b) return 1
                                    else if (a < b) return -1
                                    else return 0
                                },
                            }
                        ]
                    }
                    expandable={{
                        expandedRowRender: record => <div>
                            <Table
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
                                dataSource={record.connections}
                            />
                        </div>,
                        rowExpandable: record => record.connections.length !== 0 && record.company !== undefined,
                    }}
                    dataSource={companies}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Connections;