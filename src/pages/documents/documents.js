import './documents.scss';
import React, {useCallback, useEffect, useMemo, useState} from "react";
import SelectBox, {DropDownOptions} from 'devextreme-react/select-box'
import FileCardGrid from "../../components/card-grid/FileCardGrid"
import {useAuth} from "../../contexts/auth";
import {get, patch, post} from "../../utils/api";
import notify from 'devextreme/ui/notify';
import {Button, TagBox, TextBox} from "devextreme-react";
import LoadPanel from "devextreme-react/load-panel";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import _, {isNull} from "lodash";
import AutoSearchBox from "../../components/auto-searchbox/AutoSearchBox";
import {useCategories} from "../../app-hooks";

const Documents = () => {
    const [documents, setDocuments] = useState([])
    const [selectedDocIds, setSelectedDocIds] = useState([])
    const [isLoadPanelVisible, setIsLoadPanelVisible] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [pages, setPages] = useState([1])
    const [totalPages, setTotalPages] = useState(pages.length)
    const [pageSize] = useState(9)
    const tagRef = React.createRef()
    const {user} = useAuth()
    const [selectedCategories, setSelectedCategories] = useState([])
    const [lastCategoryUpdateTime, setLastCategoryUpdateTime] = useState(new Date())
    const [searchResults, setSearchResults] = useState([])
    const {mutate: mutateCategories, categories, isLoading, error}
        = useCategories()
    const [allCategories, setAllCategories] = useState([])

    useEffect(() => {
        setAllCategories(categories)
    }, [categories])

    const handleCategoryUpdate = useCallback(async (docId, category) => {
        //const categories = [...new Set([...category, ...allCategories])]
        const newCategories = [...new Set([...category, ...categories])];
        setAllCategories(newCategories)

        try {
            patch(`${process.env.REACT_APP_API_URL}/documents/${docId}`, {categories: category})
                .then((response) => {
                    if (response.isOk) {
                        console.log('Document category updated successfully.')
                        //setAllCategories(categories)
                        setLastCategoryUpdateTime(new Date())
                        //notify('Document category updated successfully.', 'success', 3000)
                    } else {
                        console.log('Failed to update document category.')
                        notify('Failed to update document category.', 'error', 3000)
                    }
                });
            // Optimistically update the cache
           // await mutateCategories(newCategories);
            await mutateCategories(async (currentCategories) => {
                return [...new Set([...category, ...currentCategories])];
            });

             post(`${process.env.REACT_APP_API_URL}/categories`, {categories: category})
                 .then( async (response) => {
                     if (response.isOk) {
                         console.log('Categories updated successfully.')
                         //notify('Categories updated successfully.', 'success', 3000)
                         await mutateCategories(response.data);
                     } else {
                         console.log('Failed to update categories.')
                         notify('Failed to update categories.', 'error', 3000)
                     }
                 });
        } catch (e) {
            console.log('Failed to update document category.', e)
            notify('Failed to update document category.', 'error', 3000)
        }
    }, [categories, mutateCategories]);

    const handleDocumentSelection = useCallback((id, isDocSelected) => {
        setSelectedDocIds((prevState) => {
            if (isDocSelected) {
                return [...prevState, id]
            } else {
                return prevState.filter((docId) => docId !== id)
            }
        })
    }, []);

    const documentStore = useMemo(() => {
        return new ArrayStore({
            data: documents,
            key: 'id',
            onLoading: () => {
                setIsLoadPanelVisible(true)
            },
            onLoaded: () => {
                setIsLoadPanelVisible(false)
            }
        })
    }, [documents]);

    const itemDatasource = useMemo(() => {
        return new DataSource({
            store: documentStore,
            key: 'id',
            sort: {selector: 'uploadDate', desc: true},
            paginate: true,
            pageSize: pageSize,
            requireTotalCount: true,
            onLoadingChanged: (isLoading) => {
                setIsLoadPanelVisible(isLoading)
            }
        })
    }, [documentStore, pageSize]);

    function Field() {
        return <TextBox placeholder={totalPages ? "Page " + (itemDatasource.pageIndex() + 1) + " of " + totalPages : ""}
                        width={'100%'}/>
    }

    const filterByCategories = useCallback((doc) => {
        return doc.categories.some((category) => {
            return _.isEmpty(selectedCategories) || selectedCategories.includes(category)
        })
    }, [selectedCategories]);

    const listDataSource = useMemo(() => {
        return new DataSource({
            store: new ArrayStore({
                data: _.sortBy(searchResults, 'title'),
                key: 'hash'
            })
        });
    }, [searchResults]);

    const handleSearchResults = useCallback((data) => {
        console.log('Search results:', data)
        setSearchResults(data);
    }, []);

    const handleDownload = useCallback(({event}, id) => {
        console.log('Download document with id:', id)
        // Todo: An api call to download the document
        event.stopPropagation()
    }, []);

    const handleDelete = useCallback(({event}, id) => {
        console.log('Delete document with id:', id)
        // Todo: An api call to delete the document
        event.stopPropagation()
    }, []);

    const listOptions = useMemo(() => ({
        keyExpr: 'hashValue',
        displayExpr: 'title',
        dataSource: listDataSource,
        itemRender: (item) => {
            return (
                <div className="flex justify-between items-center group">
                    <span>{item.title}</span>
                    <div className="group-hover:block action-buttons hidden">
                        <div className="flex gap-2">
                            <Button onClick={(e) => handleDownload(e, item.hashValue)} icon='download'>
                            </Button>
                            <Button onClick={(e) => handleDelete(e, item.hashValue)} icon='trash'>
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
    }), [handleDelete, handleDownload, listDataSource]);

    useEffect(() => {
        console.clear();
    }, []);

    useEffect(() => {
        itemDatasource.filter(filterByCategories);
        itemDatasource.load().then(() => {
            const filteredCount = itemDatasource.totalCount();
            console.log('Total count after specific filter:', filteredCount);
        });
        setTotalPages(Math.ceil(itemDatasource.totalCount() / pageSize));
        setPages([...Array(totalPages).keys()].map((i) => i + 1));
    }, [filterByCategories, itemDatasource, pageSize, selectedCategories, totalPages]);

    // Fetch updated documents whenever lastCategoryUpdateTime changes
    useEffect(() => {
        const fetchUpdatedDocuments = async () => {
            try {
                const response = await get(`${process.env.REACT_APP_API_URL}/users/${user.id}/documents`);
                if (response.isOk) {
                    setDocuments(response.data);
                } else {
                    console.log('Failed to fetch updated documents from server.');
                    notify('Failed to fetch updated documents from server.', 'error', 6000);
                }
            } catch (e) {
                console.log('Failed to fetch updated documents from server.', e);
                notify('Failed to fetch updated documents from server.', 'error', 6000);
            }
        };

        fetchUpdatedDocuments();
    }, [lastCategoryUpdateTime, user.id]);

    /*    useEffect(() => {
            (async () => {
                // Get all categories
                try {
                    const response = await get(`${process.env.REACT_APP_API_URL}/categories`)
                    if (response.isOk) {
                        const uniqueCategories = [...(new Set(response.data))]
                        setAllCategories(uniqueCategories)
                    } else {
                        console.log('Failed to fetch categories from server.')
                        // show notification using devextreme toaster
                        notify('Failed to fetch categories from server.', 'error', 3000)
                    }
                } catch (e) {
                    console.log('Failed to fetch categories from server.', e)
                }
            })();
        }, []);*/

    return (
        <div className="p-3 shadow rounded bg-secondary-subtle">
            <div className='row row-cols-md-2 mb-2 h-100'>
                <AutoSearchBox className='px-0 px-md-2 mb-md-0 mb-2'
                               placeholder={'Search by title'}
                               listOptions={listOptions}
                               onSearchResults={handleSearchResults}
                />

                <TagBox
                    ref={tagRef}
                    className='mb-2'
                    acceptCustomValue={true}
                    stylingMode={"filled"}
                    placeholder={'Filter by category'}
                    //dataSource={[...new Set([...selectedCategories, ..._.sortBy(allCategories)])]}
                    dataSource={[...new Set([...selectedCategories, ..._.sortBy(allCategories)])]}
                    value={selectedCategories}
                    searchEnabled={true}
                    showSelectionControls={true}
                    onValueChanged={(e) => {
                        setSelectedCategories(e.value);
                    }}
                    dropDownOptions={
                        {
                            hideOnOutsideClick: true,
                        }
                    }
                />
            </div>
            <hr className='mb-2 border-dashed'/>
            <div className={'pt-2 d-inline-flex'}>
                <SelectBox
                    searchEnabled={true}
                    stylingMode={"filled"}
                    items={pages}
                    showDataBeforeSearch={false}
                    value={currentPage + 1}
                    defaultValue={currentPage + 1}
                    fieldRender={Field}
                    onSelectionChanged={
                        (e) => {
                            const page = isNull(e.selectedItem) ? itemDatasource.pageIndex() : e.selectedItem - 1
                            setCurrentPage(page)
                            itemDatasource.pageIndex(page)
                            itemDatasource.load()
                        }
                    }
                    buttons={[
                        {
                            name: 'prev',
                            location: 'before',
                            options: {
                                icon: 'chevronleft',
                                onClick: () => {
                                    if (currentPage > 0) {
                                        setCurrentPage(currentPage - 1)
                                        itemDatasource.pageIndex(currentPage - 1)
                                        itemDatasource.load()
                                    }
                                },
                                disabled: currentPage === 0 || totalPages === 0
                            }
                        },
                        {
                            name: 'next',
                            location: 'after',
                            options: {
                                icon: 'chevronright',
                                onClick: () => {
                                    if (currentPage < totalPages) {
                                        setCurrentPage(currentPage + 1)
                                        itemDatasource.pageIndex(currentPage + 1)
                                        itemDatasource.load()
                                    }
                                },
                                disabled: currentPage + 1 === totalPages || totalPages === 0
                            }
                        }
                    ]}>
                    <DropDownOptions hideOnOutsideClick={true}/>
                </SelectBox>
            </div>
            <div style={{height: '40px'}}>
                {/*Just spacing between the search box and the document grid */}
            </div>
            <div className='card-grid h-100' id="#cardGrid">
                <FileCardGrid itemDatasource={itemDatasource}
                              allCategories={allCategories}
                    //allCategories={allCategories}
                              onCategoryUpdate={handleCategoryUpdate}
                              onCardSelected={handleDocumentSelection}
                />
            </div>
            {/*            <SpeedDialAction
                hint={'Search documents'}
                icon={'search'}
                label={'Search'}
                onClick={() => {

                }}
            />
            <SpeedDialAction
                hint={'Upload documents'}
                icon={'upload'}
                label={'Upload'}
            />
            <SpeedDialAction
                hint={'Download documents'}
                label={'Download'}
                icon={'download'}
                visible={selectedDocIds.length > 0}
            />
            <SpeedDialAction
                hint={'Delete documents'}
                icon={'trash'}
                label={'Delete'}
                visible={selectedDocIds.length > 0}
            />*/}
            <LoadPanel container={'.card-grid'} visible={isLoadPanelVisible}/>
        </div>
    )
}

export default Documents