import React from 'react';
import { Alert } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert
                    message="Error"
                    description="Something went wrong. Please try refreshing the page."
                    type="error"
                    showIcon
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;