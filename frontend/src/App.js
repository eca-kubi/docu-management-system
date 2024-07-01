//import 'devextreme/dist/css/dx.common.css';
import React from 'react';
import {HashRouter as Router} from 'react-router-dom';
import LoadPanel from 'devextreme-react/load-panel';
import {NavigationProvider} from './contexts/navigation';
import {AuthProvider, useAuth} from './contexts/auth';
import {useScreenSizeClass} from './utils/media-query';
import Content from './Content.js';
import UnauthenticatedContent from './UnauthenticatedContent';
import config from "devextreme/core/config";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
//import './dx-styles.scss';

function App() {
    const {user, loading} = useAuth();

    config(
        {
            floatingActionButtonConfig: {
                direction: 'auto',
                icon: 'menu',
                shading: false,
                position: {
                    of: 'body',
                    my: 'right bottom',
                    at: 'right bottom',
                    offset: '-90, -90',
                },
            }
        }
    )

    if (loading) {
        return <LoadPanel visible={true}/>;
    }

    if (user) {
        return <Content/>;
    }

    return <UnauthenticatedContent/>;
}

export default function Root() {
    const screenSizeClass = useScreenSizeClass();
/*    useEffect(() => {
        console.clear()
    }, []);*/
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <NavigationProvider>
                        <div className={`app ${screenSizeClass}`}>
                            <App/>
                        </div>
                    </NavigationProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}
