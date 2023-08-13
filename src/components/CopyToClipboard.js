import React from "react";
import { Button, notification } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const CopyToClipboard = ({ value }) => {
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(value);
        notification.success({
            message: "Copied to Clipboard",
            description: `${value} copied to clipboard!`,
        });
    };

    return (
        value && (
            <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopyToClipboard}
                size="small"
            />
        )
    );
};

export default CopyToClipboard;
