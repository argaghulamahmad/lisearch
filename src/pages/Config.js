import {Button, Divider, Form, InputNumber, Space,} from 'antd';
import {notification} from 'antd';


const Config = () => {
    return (
        <div style={{width: "1200px"}}>
            <div>
                Customize your settings here!
            </div>
            <div>
                <Divider orientation="left">Setup Config</Divider>
                <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                    <Form
                        name="configForm"
                        initialValues={{
                            'feelLuckyGeneratorCounts': localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')).feelLuckyGeneratorCounts : 5,
                        }}
                        onFinish={(configValues   ) => {
                            localStorage.setItem('config', JSON.stringify(configValues));
                            notification.success({
                                message: 'Success',
                                description: 'Config updated!',
                            });}
                        }
                    >
                        <Form.Item label="Feel Lucky Generator Counts">
                            <Form.Item name="feelLuckyGeneratorCounts" noStyle>
                                <InputNumber min={1} max={20}/>
                            </Form.Item>
                            <span className="ant-form-text"> record</span>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" style={{width: '100%'}} htmlType="submit">
                                Save Config
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
                <Divider orientation="left">Reset Data</Divider>
                <Space direction="vertical" size="small" style={{display: 'flex'}}>
                    <Button type="danger" style={{width: '100%'}} onClick={
                        () => {
                            localStorage.removeItem('visitedConnections');
                            localStorage.removeItem('visitedCompanies');
                            localStorage.removeItem('visitedPositions');

                            notification.success({
                                message: 'Success',
                                description: 'All visited random profiles data has been reset!',
                            })
                        }
                    }>
                        Reset all feel lucky connections generator
                    </Button>
                    <Button type="danger" style={{width: '100%'}} onClick={
                        () => {
                            localStorage.clear();
                            notification.success({
                                message: 'Success',
                                description: 'All data cleared!',
                            })
                        }
                    }>
                        Reset all data
                    </Button>
                </Space>
            </div>
        </div>
    );
}

export default Config;