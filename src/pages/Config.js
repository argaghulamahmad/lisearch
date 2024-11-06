import React from 'react';
import {Button, Divider, Form, InputNumber, Space, notification} from 'antd';

const Config = () => {
    const handleConfigFormSubmit = (configValues) => {
        localStorage.setItem('config', JSON.stringify(configValues));
        notification.success({
            message: 'Success', description: 'Config updated!',
        });
    };

    const handleResetConnections = () => {
        localStorage.removeItem('visitedConnections');
        localStorage.removeItem('visitedCompanies');
        localStorage.removeItem('visitedPositions');

        notification.success({
            message: 'Success', description: 'All visited random profiles data has been reset!',
        });
    };

    const handleResetAllData = () => {
        localStorage.clear();
        notification.success({
            message: 'Success', description: 'All data cleared!',
        });
    };

    return (<div>
            <div style={{textAlign: "left",}}>
                Customize your settings here!
            </div>
            <div>
                <Divider orientation="left">Setup Config</Divider>
                <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                    <Form
                        name="configForm"
                        initialValues={{
                            'feelLuckyGeneratorCounts': JSON.parse(localStorage.getItem('config'))?.feelLuckyGeneratorCounts || 5,
                        }}
                        onFinish={handleConfigFormSubmit}
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
                    <Button type="danger" style={{width: '100%'}} onClick={handleResetConnections}>
                        Reset all feel lucky connections generator
                    </Button>
                    <Button type="danger" style={{width: '100%'}} onClick={handleResetAllData}>
                        Reset all data
                    </Button>
                </Space>
            </div>
        </div>);
}

export default Config;
