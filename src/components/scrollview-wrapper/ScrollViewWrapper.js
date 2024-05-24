import React from 'react';
import ScrollView from 'devextreme-react/scroll-view';
import { Footer } from '../../../components';

const ScrollViewWrapper = React.forwardRef((props, ref ) => {
    return (
        <ScrollView ref={ref} className='layout-body with-footer'>
            <div className='content p-2 h-100'>
                {React.Children.map(props.children, (item) => {
                    return item.type !== Footer && item;
                })}
            </div>
            <div className={'content-block'}>
                {React.Children.map(props.children, (item) => {
                    return item.type === Footer && item;
                })}
            </div>
        </ScrollView>
    );
});

export default ScrollViewWrapper;