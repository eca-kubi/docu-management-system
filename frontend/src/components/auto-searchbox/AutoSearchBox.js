import React, {forwardRef, useCallback, useEffect, useRef, useState} from 'react';
import {List, Popover, TextBox} from 'devextreme-react';
import _ from 'lodash';
import "./AutoSearchBox.scss";
import {useAuth} from "../../contexts/auth";

const AutoSearchBox = forwardRef(({
                                      placeholder = 'Search',
                                      className = '',
                                      listOptions = {},
                                      onSearchResults = (result) => {
                                          console.log(result)
                                      }
                                  }, listRef) => {
    const [inputValue, setInputValue] = useState('');
    const [textBoxWidth, setTextBoxWidth] = useState(0);
    const [popupVisible, setPopupVisible] = useState(false);
    const popoverRef = useRef(null);
    const textBoxRef = useRef(null);
    const [textBoxHasFocus, setTextBoxHasFocus] = useState(false);
    const {user} = useAuth();

    const handleOutsideClick = useCallback((e) => {
        // Check if the click is outside the popover
        if (popoverRef.current) {
            // Click is on a list item, or the popup's overlay content, or the search box, so return
            if (e.target.closest('.dx-list-item') || e.target.closest('.dx-overlay-content')
                || e.target.closest('#auto-search-box')) {
                // But first give focus back to the text box.
                // This is the only workaround I found to let the click event on the text box buttons fire
                //textBoxRef.current.instance.focus();
                return;
            }
            if (!popoverRef.current.instance.element().contains(e.target)) {
                setPopupVisible(false);
                popoverRef.current.instance.option('visible', false)
                popoverRef.current.instance.repaint()
            }
        }

    }, [popoverRef]);

    const computeWidth = useCallback(() => {
        const element = document.getElementById('auto-search-box');
        if (element) {
            setTextBoxWidth(element.offsetWidth);
        }
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(_.debounce(async (value) => {
        //const results = value ? generateFakeData(value) : generateFakeData('a')
        try {
            const response =
                await fetch(`${process.env.REACT_APP_API_URL}/search?user_id=${user.id}&title=${value}`)
            if (response.ok) {
                const data = await response.json();
                onSearchResults(data);
            }
        } catch (e) {
            console.log(e)
            onSearchResults([]);
        }
    }, 600), [onSearchResults, user.id]);

    const handleChange = ({event}) => {
        setInputValue(event.target.value);
        debouncedSearch(event.target.value);
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            computeWidth();
        });

        const element = document.getElementById('auto-search-box');
        if (element) {
            resizeObserver.observe(element);
        }

        return () => {
            if (element) {
                resizeObserver.unobserve(element);
            }
        };
    }, [computeWidth]);

    useEffect(() => {
        // Add the outside click listener when the component mounts
        document.addEventListener('mousedown', handleOutsideClick);

        // Clean up the listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    useEffect(() => {
        if (textBoxRef.current) {
            textBoxRef.current.instance.focus();
        }
    }, [textBoxRef]);

    useEffect(() => {
        if (textBoxHasFocus) {
            debouncedSearch(inputValue);
        }
    }, [debouncedSearch, inputValue, textBoxHasFocus]);

    return (
        <div className={className}>
            <TextBox
                ref={textBoxRef}
                id={'auto-search-box'}
                value={inputValue}
                placeholder={placeholder}
                valueChangeEvent={'input'}
                onValueChanged={handleChange}
                onKeyDown={({event}) => {
                    // If Escape key is pressed, close the popup
                    if (event.code === 'Escape') {
                        setPopupVisible(false);
                        return;
                    }
                    // Return if key is not Enter, alphanumeric, backspace, delete, or space
                    if (!(event.code === 'Enter' || event.code.match(/^Key[A-Z]$|^Digit[0-9]$|^Space$|^Backspace$|^Delete$/))) {
                        return;
                    }
                    setPopupVisible(true);
                }}
                onFocusIn={
                    () => {
                        setTextBoxHasFocus(true)
                    }}
                onFocusOut={
                    () => {
                        setTextBoxHasFocus(false)
                    }}
            />
            <Popover
                ref={popoverRef}
                wrapperAttr={{
                    class: 'auto-search-popover'
                }}
                hideOnOutsideClick={(e) => {
                    console.log(e.target)
                    return true
                }}
                width={textBoxWidth}
                visible={popupVisible}
                target={'#auto-search-box'}
                showEvent={'click'}
                onHidden={
                    () => {
                        setPopupVisible(false)
                        listRef?.current?.instance.unselectAll()
                    }
                }
                onShown={
                    () => {
                        setPopupVisible(true)
                    }
                }
                position={{
                    my: 'top',
                    at: 'bottom',
                    of: '#auto-search-box',
                    offset: {y: -10}
                }}

            >
                <List
                    ref={listRef}
                    keyExpr={listOptions.keyExpr}
                    displayExpr={listOptions.displayExpr}
                    elementAttr={
                        {className: 'auto-search-list'}
                    }
                    pageLoadMode={'nextButton'}
                    selectionMode={'single'}
                    showSelectionControls={true}
                    selectByClick={true}
                    dataSource={listOptions.dataSource}
                    itemRender={listOptions.itemRender}
                    noDataText={inputValue ? 'No results found' : 'Start typing to search'}
                    indicateLoading={true}
                />
            </Popover>
        </div>
    );
});

export default AutoSearchBox;