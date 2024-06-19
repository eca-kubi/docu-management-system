import React, { useCallback, useEffect, useMemo, useState } from "react";
import SelectBox, { DropDownOptions } from 'devextreme-react/select-box';
import FileCardGrid from "../../components/card-grid/FileCardGrid";
import { useAuth } from "../../contexts/auth";
import { get, patch, post } from "../../utils/api";
import notify from 'devextreme/ui/notify';
import { Button, SpeedDialAction, TagBox, TextBox } from "devextreme-react";
import LoadPanel from "devextreme-react/load-panel";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import _, { isNull } from "lodash";
import AutoSearchBox from "../../components/auto-searchbox/AutoSearchBox";
import { useCategories } from "../../app-hooks";
import UploadDocumentForm from "../../components/upload-document-form/UploadDocumentForm";
import axios from "axios";

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [, setSelectedDocIds] = useState([]);
    const [isLoadPanelVisible, setIsLoadPanelVisible] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([1]);
    const [totalPages, setTotalPages] = useState(pages.length);
    const [pageSize] = useState(9);
    const tagRef = React.createRef();
    const { user } = useAuth();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
    const [searchResults, setSearchResults] = useState([]);
    const { mutate: mutateCategories, categories } = useCategories();
    const [allCategories, setAllCategories] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleCategoryUpdate = useCallback(async (docId, category) => {
        const newCategories = [...new Set([...category, ...categories])];
        setAllCategories(newCategories);

        try {
            const response = await patch(`${process.env.REACT_APP_API_URL}/documents/${docId}`, { categories: category });
            if (response.isOk) {
                console.log('Document category updated successfully.');
                setLastUpdateTime(new Date());
            } else {
                console.log('Failed to update document category.');
                notify('Failed to update document category.', 'error', 3000);
            }

            await mutateCategories(async (currentCategories) => {
                return [...new Set([...category, ...currentCategories])];
            });

            const categoryResponse = await post(`${process.env.REACT_APP_API_URL}/categories`, { categories: category });
            if (categoryResponse.isOk) {
                console.log('Categories updated successfully.');
                await mutateCategories(categoryResponse.data);
            } else {
                console.log('Failed to update categories.');
                notify('Failed to update categories.', 'error', 3000);
            }
        } catch (e) {
            console.log('Failed to update document category.', e);
            notify('Failed to update document category.', 'error', 3000);
        }
    }, [categories, mutateCategories]);

    const handleDocumentSelection = useCallback((id, isDocSelected) => {
        setSelectedDocIds((prevState) => {
            if (isDocSelected) {
                return [...prevState, id];
            } else {
                return prevState.filter((docId) => docId !== id);
            }
        });
    }, []);

    const documentStore = useMemo(() => {
        console.log('Documents:', documents); // Debugging statement
        return new ArrayStore({
            data: documents,
            key: 'id',
            onLoading: () => {
                setIsLoadPanelVisible(true);
            },
            onLoaded: () => {
                setIsLoadPanelVisible(false);
            }
        });
    }, [documents]);

    const itemDatasource = useMemo(() => {
        const ds = new DataSource({
            store: documentStore,
            key: 'id',
            sort: { selector: 'uploadDate', desc: true },
            paginate: true,
            pageSize: pageSize,
            requireTotalCount: true,
            onLoadingChanged: (isLoading) => {
                setIsLoadPanelVisible(isLoading);
            }
        });
        console.log('DataSource initialized:', ds);
        return ds;
    }, [documentStore, pageSize]);

    function Field() {
        return <TextBox placeholder={totalPages ? "Page " + (itemDatasource.pageIndex() + 1) + " of " + totalPages : ""}
                        width={'100%'}/>;
    }

    const filterByCategories = useCallback((doc) => {
        return doc.categories.some((category) => {
            return _.isEmpty(selectedCategories) || selectedCategories.includes(category);
        });
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
        console.log('Search results:', data);
        setSearchResults(data);
    }, []);

    const handleDownload = useCallback(({ event }, id) => {
        console.log('Download document with id:', id);
        event.stopPropagation();
    }, []);

    const handleDelete = useCallback(({ event }, id) => {
        console.log('Delete document with id:', id);
        event.stopPropagation();
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
                            <Button onClick={(e) => handleDownload(e, item["hashValue"])} icon='download'/>
                            <Button onClick={(e) => handleDelete(e, item["hashValue"])} icon='trash'/>
                        </div>
                    </div>
                </div>
            );
        }
    }), [handleDelete, handleDownload, listDataSource]);

    const refreshDocuments = useCallback(() => {
        const fetchUpdatedDocuments = async () => {
            try {
                const response = await get(`${process.env.REACT_APP_API_URL}/users/${user.id}/documents`);
                if (response.isOk) {
                    console.log('Fetched documents:', response.data); // Debugging statement
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

        fetchUpdatedDocuments().then(() => console.log('Updated documents fetched successfully.'));
    }, [user.id]);

    useEffect(() => {
        refreshDocuments();
    }, [lastUpdateTime, refreshDocuments]);

    useEffect(() => {
        setAllCategories(categories);
    }, [categories]);

    const handleFormSubmit = useCallback(async (formData) => {
        console.log('Handle submit: ', formData);

        const file = formData.file[0];
        const title = formData.title;
        const categories = formData.categories;

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('title', title.trim());
        uploadData.append('categories', categories.join(','));
        uploadData.append('userId', user.id);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/documents/upload`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                console.log('File uploaded successfully:', response.data);

                setDocuments(prevDocuments => [...prevDocuments, response.data.document]);

                setIsPopupVisible(false);

                notify('Document uploaded successfully.', 'success', 3000);
            } else if (response.status === 400 && response.data.error === 'duplicate file') {
                const { title, uploadDate, categories } = response.data["existing_document"];
                const message = `A file with the same content already exists.\n\nTitle: ${title}\nUpload Date: ${uploadDate}\nCategories: ${categories.join(', ')}`;
                console.log('Duplicate file:', message);
                notify({ message, position: { at: 'center', my: 'center' }, width: 'auto' }, 'warning', 5000);
            } else {
                console.log('Failed to upload file:', response);
                notify('Failed to upload document.', 'error', 3000);
            }
        } catch (error) {
            console.log('Error uploading file:', error);
            notify('Error uploading document.', 'error', 3000);
        }
    }, [user.id, setDocuments, setIsPopupVisible]);

    const handleFieldChange = useCallback((e) => {
        if (e.dataField === 'title') {
            // Handle title change
        }
        if (e.dataField === 'categories') {
            const newCategories = e.value.filter(category => !categories.includes(category));

            if (newCategories.length > 0) {
                axios.post(`${process.env.REACT_APP_API_URL}/categories`, { categories: newCategories })
                    .then(response => {
                        console.log('New categories posted:', response.data);
                        mutateCategories([...categories, ...response.data]).then(r => console.log(r));
                    })
                    .catch(error => {
                        console.error('Error posting new categories:', error);
                    });
            }
        }
    }, [categories, mutateCategories]);

    const handlePopupShown = useCallback(() => {
        setIsPopupVisible(true);
    }, []);

    const handlePopupHidden = useCallback(() => {
        setIsPopupVisible(false);
    }, []);

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
                            const page = isNull(e.selectedItem) ? itemDatasource.pageIndex() : e.selectedItem - 1;
                            setCurrentPage(page);
                            itemDatasource.pageIndex(page);
                            itemDatasource.load();
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
                                        setCurrentPage(currentPage - 1);
                                        itemDatasource.pageIndex(currentPage - 1);
                                        itemDatasource.load();
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
                                        setCurrentPage(currentPage + 1);
                                        itemDatasource.pageIndex(currentPage + 1);
                                        itemDatasource.load();
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
                {/* Just spacing between the search box and the document grid */}
            </div>
            <div className='card-grid h-100' id="#cardGrid">
                <FileCardGrid itemDatasource={itemDatasource}
                              allCategories={allCategories}
                              onCategoryUpdate={handleCategoryUpdate}
                              onCardSelected={handleDocumentSelection}
                              refreshDocuments={refreshDocuments}
                />
            </div>
            <SpeedDialAction
                hint={'Upload documents'}
                icon={'upload'}
                label={'Upload'}
                onClick={() => {
                    setIsPopupVisible(true);
                }}
            />
            <LoadPanel container={'.card-grid'} visible={isLoadPanelVisible}/>
            <UploadDocumentForm
                isPopupVisible={isPopupVisible}
                handleFieldChange={handleFieldChange}
                handleFormSubmit={handleFormSubmit}
                handlePopupShown={handlePopupShown}
                handlePopupHidden={handlePopupHidden}
            />
        </div>
    );
};

export default Documents;
