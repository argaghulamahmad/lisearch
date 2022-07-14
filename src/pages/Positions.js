import {useEffect, useState} from "react";
import {BackTop, Button, Card, Space, Table} from "antd";
import Text from "antd/es/typography/Text";
import Uploader from "./Uploader";
import {KeywordSearch} from "../components/Search";

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
        return <Space size="middle" style={{margin: "20px" }} >
            <KeywordSearch onSearch={(searchText) => {
                let positionsFromLocalStorage = JSON.parse(localStorage.getItem('positions'));

                const filteredPosition = positionsFromLocalStorage.filter(({ title }) => {
                    title = title.toLowerCase();
                    return title.includes(searchText);
                });

                setPositions(filteredPosition);
            }}></KeywordSearch>
            <Button onClick={() => {
                for (let i = 0; i < 5; i++) {
                    const position = getRandomPosition();
                    window.open(`https://www.google.com/search?q=${position.title}`, '_blank');
                }
            }}>I feel lucky</Button>
        </Space>
    }

    return (
        positions ? <div>
            <Card>
                {
                    lastUpdateAt !== "" ? null :
                        <Text type="secondary" level={5}> Last updated at {lastUpdateAt}.</Text>
                }
                {renderTableToolbar()}
                <Table
                    showHeader={true}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 100,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '50', '100', '200']
                    }}
                    style={{padding: "0 5% 0 5%"}}
                    columns={
                        [
                            {
                                title: 'Position',
                                dataIndex: 'title',
                                key: 'id',
                                render: text => <a href={`https://www.google.com/search?q=${text}`}
                                                   target="_blank" rel="noreferrer">{text}</a>,
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