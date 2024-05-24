import React, {useEffect, useRef, useCallback, useMemo, useState} from 'react';
import TreeView, {Item} from 'devextreme-react/tree-view';
import {navigation} from '../../app-navigation';
import {useNavigation} from '../../contexts/navigation';
import {useScreenSize} from '../../utils/media-query';
import './SideNavigationMenu.scss';
import DocumentUploader from "../document-uploader/DocumentUploader";
import * as events from 'devextreme/events';
import _ from "lodash";

export default React.forwardRef(function SideNavigationMenu(props, ref) {
    const {
        children,
        selectedItemChanged,
        openMenu,
        compactMode,
        onMenuReady,
        //getTreeViewRef,
        setSelectedItem
    } = props;

    const {isLarge} = useScreenSize();

    function normalizePath() {
        return navigation.map((item) => (
            {...item, expanded: isLarge, path: item.path && !(/^\//.test(item.path)) ? `/${item.path}` : item.path}
        ))
    }

    const items = useMemo(
        normalizePath, [isLarge]
    );

    const {navigationData: {currentPath}} = useNavigation();
    const [selectedPath, setSelectedPath] = useState(currentPath);

    const treeViewRef = ref;
    const wrapperRef = useRef();
    const getWrapperRef = useCallback((element) => {
        const prevElement = wrapperRef.current;
        if (prevElement) {
            events.off(prevElement, 'dxclick');
        }
        wrapperRef.current = element;
        events.on(element, 'dxclick', (e) => {
            openMenu(e);
        });
    }, [openMenu]);

    useEffect(() => {
        const treeView = treeViewRef.current && treeViewRef.current.instance;
        if (!treeView) {
            return;
        }

        // Merge treeViewRef items with navigation items
/*        const mergedItems = treeView.option('items').map((item) => {
            const navigationItem = items.find((navigationItem) =>
                navigationItem.key === item.keyFn());
            return {
                ...item,
                ...navigationItem
            };
        } );*/
        //treeView.option('items', mergedItems);

        console.log(currentPath)
        //getTreeViewRef(treeViewRef)
        const id = _.trimStart(currentPath, ['/']);

try {
    if (id) {
        treeView.selectItem(id);
        treeView.expandItem(id);
    }
} catch (e) {
    console.error(e);
}


        if (compactMode) {
            treeView.collapseAll();
        }

       // treeView.repaint();


    }, [currentPath, compactMode, selectedPath, treeViewRef, items]);

    const toggleItemVisibility = useCallback((item) => {
        // If the item should only be visible in compact mode, return the value of compactMode
        if (item.compactModeOnly) {
            // If the item should only be visible in compact mode, return the value of compactMode
            return compactMode;
        } else if (item.expandedModeOnly) {
            return !compactMode;
        } else {
            // If the item should be visible in all modes, return true
            return true;
        }

    }, [compactMode]);

    const renderDocumentUploader = useCallback(({dropZoneWidth}) => {
        return (
            <DocumentUploader
                dropZoneWidth={dropZoneWidth}
            />
        );
    }, []);

    const handleOnItemClick = useCallback((e) => {
        selectedItemChanged(e);
        //setSelectedPath(e.itemData?.path);
        setSelectedPath(e.itemData.keyFn());
        setSelectedItem(e.itemData);
    }, [selectedItemChanged, setSelectedItem]);

    const handleOnItemSelectionChanged = useCallback((e) => {
        //setSelectedPath(e.itemData?.path);
        setSelectedPath(e.itemData.keyFn());
        setSelectedItem(e.itemData);
    }, [setSelectedItem]);

    return (
        <div
            className={'dx-swatch-additional side-navigation-menu'}
            ref={getWrapperRef}
        >
            {children}
            <div className={'menu-container'}>
                <TreeView
                    key={compactMode} // Add this line
                    keyExpr={'keyFn'}
                   // items={items}
                    ref={treeViewRef}
                    selectionMode={'single'}
                    focusStateEnabled={false}
                    expandEvent={'click'}
                    onItemClick={handleOnItemClick}
                    onItemSelectionChanged={handleOnItemSelectionChanged}
                    onContentReady={onMenuReady}
                    width={'100%'}
                >
                    {
                        items.map((item) =>
                            item.key !== 'upload-document' ?
                                (
                                    <Item keyFn={() => item.key}
                                        key={item.key}
                                        icon={item.icon}
                                        text={item.text}
                                        path={item.path}
                                        expanded={false}
                                        items={item?.items}
                                        visible={toggleItemVisibility(item)}
                                    />
                                ) : (
                                    <Item keyFn={() => item.key}
                                        key={item.key}
                                        id={item.key}
                                        component={() => renderDocumentUploader({dropZoneWidth: 250})}
                                        visible={toggleItemVisibility(item)}
                                    />
                                )
                        )
                    }
                </TreeView>
            </div>
        </div>
    );
});
