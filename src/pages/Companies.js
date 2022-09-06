import {useEffect, useState} from "react";
import {BackTop, Button, Card, Divider, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";

const Connections = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setCompanies(JSON.parse(localStorage.getItem('companies')))
    }, []);

    const getRandomCompany = () => {
        return companies[Math.floor(Math.random() * companies.length)];
    }

    const renderTableToolbar = () => {
        return <div style={{textAlign: "left"}}>
            <Space size="middle" style={{paddingBottom: "2%"}}>
                <KeywordSearch onSearch={(searchText) => {
                    let companiesFromLocalStorage = JSON.parse(localStorage.getItem('companies'));

                    const filteredCompanies = companiesFromLocalStorage.filter(({company}) => {
                        company = company.toLowerCase();
                        return company.includes(searchText.toLowerCase());
                    });

                    setCompanies(filteredCompanies);
                }}></KeywordSearch>
                <Button onClick={() => {
                    let visitedCompanies = JSON.parse(localStorage.getItem('visitedCompanies')) || [];
                    [...Array(5).keys()].reduce((acc, _) => {
                        let company = getRandomCompany();
                        while (company.id in visitedCompanies) {
                            company = getRandomCompany();
                        }

                        const {company: companyName, id} = company;
                        acc.push({
                            company: companyName,
                            id: id
                        })
                        return acc;
                    }, []).forEach(({company, id}) => {
                        visitedCompanies.push(id);
                        window.open(`https://www.google.com/search?q=${company}`, '_blank');
                    })
                    localStorage.setItem('visitedCompanies', JSON.stringify(visitedCompanies));
                }}>I feel lucky</Button>
            </Space>
        </div>
    }

    return (
        companies ? <div style={{width: "1200px"}}>
            <Divider orientation="left" orientationMargin="0">Companies</Divider>
            {
                lastUpdateAt !== "" ? null :
                    <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
            }
            {renderTableToolbar()}
            <Card>
                <Table
                    showHeader={true}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '200']
                    }}
                    style={{padding: "0 2% 0 2%"}}
                    columns={
                        [
                            {
                                title: 'Company',
                                dataIndex: 'company',
                                key: 'id',
                                render: item => <a href={`https://www.google.com/search?q=${item}`}
                                                   target="_blank" rel="noreferrer">{item}</a>,
                                sorter: (a, b) => {
                                    return a.localeCompare(b)
                                }
                            }
                        ]
                    }
                    expandable={{
                        expandedRowRender: record => <div>
                            <Space align="baseline" direction="vertical" style={{margin: "20px"}}>
                                <Button style={{width: "100%"}} onClick={() => {
                                    for (let i = 0; i < 5; i++) {
                                        console.log("test")
                                        const connection = record.connections[Math.floor(Math.random() * record.connections.length)];
                                        const {fullName, position} = connection;
                                        window.open(`https://www.google.com/search?q=${fullName + " " + position}`, '_blank');
                                    }
                                }}>I feel lucky</Button>
                            </Space>
                            <Table
                                columns={
                                    [
                                        {
                                            title: 'Full Name',
                                            dataIndex: 'fullName',
                                            key: 'id',
                                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                               target="_blank" rel="noreferrer">{text}</a>,
                                            sorter: (a, b) => {
                                                return a.fullName.localeCompare(b.fullName)
                                            },
                                        },
                                        {
                                            title: 'Position',
                                            dataIndex: 'position',
                                            key: 'id',
                                            render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                               target="_blank" rel="noreferrer">{text}</a>,

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