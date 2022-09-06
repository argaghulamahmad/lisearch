import {useEffect, useState} from "react";
import {BackTop, Button, Card, Divider, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";
import {CopyToClipboard} from "../components/CopyToClipboard";

const Positions = () => {
    const [lastUpdateAt, setLastUpdateAt] = useState("");
    const [positions, setPositions] = useState([]);

    useEffect(() => {
        setLastUpdateAt(localStorage.getItem('lastUpdateAt'))
        setPositions(JSON.parse(localStorage.getItem('positions')))
    }, []);

    const getRandomPosition = () => {
        return positions[Math.floor(Math.random() * positions.length)];
    }

    const renderTableToolbar = () => {
        return <div style={{textAlign: "left"}}>
            <Divider orientation="left" orientationMargin="0">Positions</Divider>
            <Space size="middle" style={{paddingBottom: "2%"}}>
                <KeywordSearch onSearch={(searchText) => {
                    let positionsFromLocalStorage = JSON.parse(localStorage.getItem('positions'));

                    const filteredPosition = positionsFromLocalStorage.filter(({title}) => {
                        title = title.toLowerCase();
                        return title.includes(searchText.toLowerCase());
                    });

                    setPositions(filteredPosition);
                }}></KeywordSearch>
                <Button onClick={() => {
                    let visitedPositions = JSON.parse(localStorage.getItem('visitedPositions')) || [];
                    [...Array(5).keys()].reduce((acc, _) => {
                        let position = getRandomPosition();
                        while (position.id in visitedPositions) {
                            position = getRandomPosition();
                        }

                        const {position: positionName, id} = position;
                        acc.push({
                            position: positionName,
                            id: id
                        })
                        return acc;
                    }, []).forEach(({position, id}) => {
                        visitedPositions.push(id);
                        window.open(`https://www.google.com/search?q=${position}`, '_blank');
                    })
                    localStorage.setItem('visitedPositions', JSON.stringify(visitedPositions));
                }}>I feel lucky</Button>
            </Space>
        </div>
    }

    return (
        positions ? <div style={{width: "1200px"}}>
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