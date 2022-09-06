import React from "react";
import {Button, notification} from "antd";
import {CopyOutlined} from "@ant-design/icons";

export const CopyToClipboard = ({value}) => (
    value !== undefined && value !== "" ?
        <Button type="text" icon={<CopyOutlined/>} onClick={() => {
            navigator.clipboard.writeText(value);
            notification.success({
                message: "Copied to clipboard",
                description: `${value} copied to clipboard!`,
            });
        }} size="small"/> : <div/>
);
