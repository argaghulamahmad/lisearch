import React from 'react';
import { Alert, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log the error to your error reporting service
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '24px' }}>
                    <Alert
                        message="Something went wrong"
                        description={
                            <div>
                                <p>An error occurred in this component. Details:</p>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    marginTop: '10px',
                                    padding: '10px',
                                    background: '#f5f5f5',
                                    borderRadius: '4px'
                                }}>
                                    {this.state.error && this.state.error.toString()}
                                </pre>
                                <Button
                                    type="primary"
                                    onClick={this.handleReset}
                                    style={{ marginTop: '16px' }}
                                >
                                    Try Again
                                </Button>
                            </div>
                        }
                        type="error"
                        showIcon
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;