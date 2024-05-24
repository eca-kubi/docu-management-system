import Drawer from 'devextreme-react/drawer';
import ScrollView from 'devextreme-react/scroll-view';
import React, {useState, useCallback, useRef} from 'react';
import {useNavigate} from 'react-router';
import {Header, SideNavigationMenu, Footer} from '../../components';
import './side-nav-outer-toolbar.scss';
import {useScreenSize} from '../../utils/media-query';
import {Template} from 'devextreme-react/core/template';
import {useMenuPatch} from '../../utils/patches';


export default function SideNavOuterToolbar({title, children}) {
    const scrollViewRef = useRef(null);
    const treeViewRef = useRef(null);
    const navigate = useNavigate();
    const {isXSmall, isLarge} = useScreenSize();
    const [patchCssClass, onMenuReady] = useMenuPatch();
    const [menuStatus, setMenuStatus] = useState(
        isLarge ? MenuStatus.Opened : MenuStatus.Closed
    );
    //const [treeViewRef, setTreeViewRef] = useState(null)
    // Add these lines inside your SideNavOuterToolbar function, before the return statement
    const [selectedItem, setSelectedItem] = useState(null);

    const toggleMenu = useCallback(({event}) => {
        setMenuStatus(
            prevMenuStatus => prevMenuStatus === MenuStatus.Closed
                ? MenuStatus.Opened
                : MenuStatus.Closed
        );
        event.stopPropagation();
    }, []);

    const temporaryOpenMenu = useCallback(() => {
        setMenuStatus(
            prevMenuStatus => prevMenuStatus === MenuStatus.Closed
                ? MenuStatus.TemporaryOpened
                : prevMenuStatus
        );
    }, []);

    const onOutsideClick = useCallback(() => {
        setMenuStatus(
            prevMenuStatus => prevMenuStatus !== MenuStatus.Closed && !isLarge
                ? MenuStatus.Closed
                : prevMenuStatus
        );
        return menuStatus === MenuStatus.Closed;
    }, [isLarge, menuStatus]);

    const onNavigationChanged = useCallback(({itemData, event, node}) => {
        if (menuStatus === MenuStatus.Closed || !itemData.path || node.selected) {
            event.preventDefault();
            return;
        }

        navigate(itemData.path);
        //scrollViewRef.current.instance.scrollTo(0);

        if (!isLarge || menuStatus === MenuStatus.TemporaryOpened) {
            setMenuStatus(MenuStatus.Closed);
            event.stopPropagation();
        }
    }, [navigate, menuStatus, isLarge]);

    const handleOnOptionChanged = useCallback(() => {
        if(treeViewRef && treeViewRef.current){
            console.log('TreeView Repainted from Drawer')

            // Select the selectedItem after the TreeView is repainted
            if (selectedItem) {
                treeViewRef.current.instance.selectItem(selectedItem.keyFn());
                console.log('TreeView Item Selected')
            }
            //treeViewRef.current.instance.repaint()
        }
    }, [treeViewRef, selectedItem])

/*    const getTreeViewRef = useCallback((treeViewRef)=>{
        setTreeViewRef(treeViewRef)
        console.log('TreeView Ref set')
    },[])*/

    return (
        <div className={'side-nav-outer-toolbar'}>
            <Header
                menuToggleEnabled
                toggleMenu={toggleMenu}
                title={title}
            />
            <Drawer
                className={['drawer', patchCssClass].join(' ')}
                position={'before'}
                closeOnOutsideClick={onOutsideClick}
                openedStateMode={isLarge ? 'shrink' : 'overlap'}
                revealMode={isXSmall ? 'slide' : 'expand'}
                minSize={isXSmall ? 0 : 60}
                maxSize={350}
                shading={!isLarge}
                opened={menuStatus !== MenuStatus.Closed}
                template={'menu'}
                onOptionChanged={handleOnOptionChanged}
                onOpenedChange={handleOnOptionChanged}
            >
                <div className="container p-2" id={"#container"}>
                    <ScrollView ref={scrollViewRef} className='layout-body with-footer'>
                        <div className="container">
                            {React.Children.map(children, (item) => {
                                return item.type !== Footer && item;
                            })}
                        </div>
                        <div className={'content-block'}>
                            {React.Children.map(children, (item) => {
                                return item.type === Footer && item;
                            })}
                        </div>
                    </ScrollView>
                </div>
                <Template name={'menu'}>
                    <SideNavigationMenu
                        ref={treeViewRef}
                        compactMode={menuStatus === MenuStatus.Closed}
                        selectedItemChanged={onNavigationChanged}
                        openMenu={temporaryOpenMenu}
                        onMenuReady={onMenuReady}
                        //getTreeViewRef={getTreeViewRef}
                        setSelectedItem={setSelectedItem}
                    >
                    </SideNavigationMenu>
                </Template>
            </Drawer>
        </div>
    );
}

const MenuStatus = {
    Closed: 1,
    Opened: 2,
    TemporaryOpened: 3
};
