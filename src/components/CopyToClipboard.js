import React, { useCallback } from "react";
import { Button, notification } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const CopyToClipboard = React.memo(({ value }) => {
    const handleCopyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            notification.success({
                message: "Copied to Clipboard",
                description: `${value} copied to clipboard!`,
                placement: 'bottomRight',
                duration: 2
            });
        } catch (error) {
            notification.error({
                message: "Copy Failed",
                description: "Failed to copy to clipboard",
                placement: 'bottomRight'
            });
        }
    }, [value]);

    if (!value) return null;

    return (
        <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={handleCopyToClipboard}
            size="small"
            title="Copy to clipboard"
        />
    );
});

CopyToClipboard.displayName = 'CopyToClipboard';

export default CopyToClipboard;
