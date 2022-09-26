import {useEffect, useState} from "react";
import {BackTop, Button, Card, Divider, notification, Space, Table} from "antd";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";
import {CopyToClipboard} from "../components/CopyToClipboard";
import db from "../db";

const Positions = () => {
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        db.positions.toArray().then((positions) => {
            setPositions(positions)
        })
    }, []);

    const renderTableToolbar = () => {
        return <div style={{textAlign: "left"}}>
            <Divider orientation="left" orientationMargin="0">Positions</Divider>
            <Space size="middle" style={{paddingBottom: "2%"}}>
                <KeywordSearch onSearch={(searchText) => {
                    const filteredPosition = positions.filter(({title}) => {
                        title = title.toLowerCase();
                        return title.includes(searchText.toLowerCase());
                    });

                    setPositions(filteredPosition);
                }}></KeywordSearch>
                <Button onClick={() => {
                    let visitedPositions = JSON.parse(localStorage.getItem('visitedPositions')) || [];
                    const unvisitedPositions = positions.filter(({id}) => !visitedPositions.includes(id))
                    for (let i = 0; i < 5; i++) {
                        let {id, position, company} = unvisitedPositions[Math.floor(Math.random() * unvisitedPositions.length)];
                        visitedPositions.push(id);
                        notification.success({
                            message: "Opening position",
                            description: `Opening ${position} at ${company} in new tab!`,
                        });
                        window.open(`https://www.google.com/search?q=${position} at ${company}`, '_blank');
                    }
                    localStorage.setItem('visitedPositions', JSON.stringify(visitedPositions));
                }}>I feel lucky</Button>
            </Space>
        </div>
    }

    return (
        positions ? <div style={{width: "1200px"}}>
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
                                title: 'Position',
                                dataIndex: 'title',
                                key: 'id',
                                render: text => <div>
                                    <a href={`https://www.google.com/search?q=${text}`}
                                       target="_blank" rel="noreferrer">{text}</a>
                                    <CopyToClipboard value={text}/>
                                </div>,
                                sorter: (a, b) => {
                                    return a.title.localeCompare(b.title)
                                },
                            }
                        ]
                    }
                    dataSource={positions}
                />
            </Card>

            <BackTop/>
        </div> : <Uploader/>
    );
}

export default Positions;
