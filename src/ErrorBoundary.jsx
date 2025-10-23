import { Component } from 'react';
import styled from 'styled-components';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    // Capture additional error information
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Extract component name from error info
    getComponentName = () => {
        const { errorInfo } = this.state;
        if (errorInfo?.componentStack) {
            // Extract the last component name in the stack
            const match = errorInfo.componentStack.match(/at (\w+)/);
            return match ? match[1] : 'Unknown';
        }
        return 'Unknown';
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorWrapper>
                    <ErrorContent>
                        <h1 className="text-5xl">Something went wrong!!!</h1>
                        <p>
                            <strong>Hint:</strong> {this.state.error?.message}
                        </p>
                        <p>
                            <strong>Component:</strong> {this.getComponentName()}
                        </p>
                    </ErrorContent>
                </ErrorWrapper>
            );
        }

        return this.props.children;
    }
}

const ErrorWrapper = styled.div`
    position: relative;
    width: 100vw;
    height: auto;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background-color: transparent;
    background: #f1f1f1;
    background-size: 40px 40px;
    color: #000;
`;

const ErrorContent = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: 800px;
    min-width: 300px;
    padding: 20px 30px;
    color: #f1f1f1;
    border-radius: 15px;
    backdrop-filter: blur(15px);
    transform: translate(-50%, -50%);
    background-color: #7e0b0b;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

export default ErrorBoundary;