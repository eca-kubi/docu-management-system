import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='flex justify-content-center align-items-center vh-100'>
                    <div>
                        <h3>Something went wrong.<span className="animate-bounce">😢</span></h3>
                    </div>
                </div>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary;