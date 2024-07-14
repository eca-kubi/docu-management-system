import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import SelectBox, {DropDownOptions} from 'devextreme-react/select-box';
import FileCardGrid from "../../components/card-grid/FileCardGrid";
import {useAuth} from "../../contexts/auth";
import {patch, post} from "../../utils/api";
import notify from 'devextreme/ui/notify';
import {confirm} from 'devextreme/ui/dialog';
import {Button, TagBox, TextBox} from "devextreme-react";
import LoadPanel from "devextreme-react/load-panel";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import _, {isNull} from "lodash";
import AutoSearchBox from "../../components/auto-searchbox/AutoSearchBox";
import {useCategories, useDocuments} from "../../app-hooks";
import UploadDocumentForm from "../../components/upload-document-form/UploadDocumentForm";
import axios from "axios";

const downloadFileFromBlob = (blob, title, fileType) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', title + fileType);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const Documents = () => {
    const [gridItems, setGridItems] = useState([]);
    //const [selectedDocIds, setSelectedDocIds] = useState([]);
    const [isLoadPanelVisible, setIsLoadPanelVisible] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState([1]);
    const [totalPages, setTotalPages] = useState(pages.length);
    const [pageSize] = useState(6);
    const tagRef = React.createRef();
    const {user} = useAuth();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const {mutate: mutateCategories, categories} = useCategories();
    const {documents: swrDocuments, mutate: mutateDocuments} = useDocuments(user.id);
    const [documents, setDocuments] = useState(swrDocuments);
    const [allCategories, setAllCategories] = useState(categories || []);
    const listRef = useRef();


    useEffect(() => {
        setDocuments(swrDocuments);
    }, [swrDocuments]);

    useEffect(() => {
        setAllCategories(categories);
    }, [categories]);

    const documentStore = useMemo(() => {
        const filteredDocuments = selectedCategories.length === 0
            ? documents
            : documents.filter(doc => selectedCategories.some(cat => doc.categories.includes(cat)));

        return new ArrayStore({
            data: filteredDocuments,
            key: 'id',
            onLoading: () => {
                setIsLoadPanelVisible(true);
            },
            onLoaded: () => {
                setIsLoadPanelVisible(false);
                setGridItems(filteredDocuments);
            }
        });
    }, [documents, selectedCategories]);

    const itemDatasource = useMemo(() => {
        return new DataSource({
            store: documentStore,
            key: 'id',
            sort: {selector: 'uploadDate', desc: true},
            paginate: true,
            pageSize: pageSize,
            requireTotalCount: true,
            onLoadingChanged: (isLoading) => {
                setIsLoadPanelVisible(isLoading);
            }
        });
    }, [documentStore, pageSize]);

    useEffect(() => {
        const loadDataSource = async () => {
            itemDatasource.load().then(() => {
                console.log("Total count:", itemDatasource.totalCount()); // Check if totalCount is as expected
                setTotalPages(Math.ceil(itemDatasource.totalCount() / pageSize));
                setPages(Array.from({length: Math.ceil(itemDatasource.totalCount() / pageSize)}, (_, i) => i + 1));
                itemDatasource.pageIndex(0)
                setCurrentPage(0)
                setGridItems(itemDatasource.items());
            });
        };
        loadDataSource().then(() => {
            console.log("Datasource loaded successfully"); // Debugging statement
        });
    }, [itemDatasource, pageSize]);

    function Field() {
        return <TextBox placeholder={totalPages ? "Page " + (itemDatasource.pageIndex() + 1) + " of " + totalPages : ""}
                        width={'100%'}/>;
    }

    const listDataSource = useMemo(() => {
        return new DataSource({
            store: new ArrayStore({
                data: _.sortBy(searchResults, 'title'),
                key: 'id'
            })
        });
    }, [searchResults]);

    const categoryDataSource = useMemo(() => {
        return [...new Set([...selectedCategories, ..._.sortBy(allCategories)])]
    }, [allCategories, selectedCategories]);

    const handleCategoryUpdate = useCallback(async (docId, category) => {
        try {
            const response = await patch(`${process.env.REACT_APP_API_URL}/documents/${docId}`, {categories: category});
            if (response.isOk) {
                console.log('Document category updated successfully.');
                await mutateDocuments()
            } else {
                console.log('Failed to update document category.');
                notify('Failed to update document category.', 'error', 3000);
            }

            const categoryResponse = await post(`${process.env.REACT_APP_API_URL}/categories`, {categories: category});
            if (categoryResponse.isOk) {
                console.log('Categories updated successfully.');
                const newCategories = [...new Set([...category, ...categories])];
                setAllCategories(newCategories);
                await mutateCategories(newCategories);
            } else {
                console.log('Failed to update categories.');
                notify('Failed to update categories.', 'error', 3000);
            }
        } catch (e) {
            console.log('Failed to update document category.', e);
            notify('Failed to update document category.', 'error', 3000);
        }
    }, [categories, mutateCategories, mutateDocuments]);

    /*    const handleDocumentSelection = useCallback((id, isDocSelected) => {
            setSelectedDocIds((prevState) => {
                if (isDocSelected) {
                    return [...prevState, id];
                } else {
                    return prevState.filter((docId) => docId !== id);
                }
            });
        }, [setSelectedDocIds]);*/

    const handleSearchResults = useCallback((data) => {
        console.log('Search results:', data);
        setSearchResults(data);
    }, []);

    const handleDownload = useCallback(async (event, id, title, fileType) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/download/${id}`, {
                responseType: 'blob',
            });
            // Handle the case where the response is json
            if (response.headers['content-type'] === 'application/json') {
                const reader = new FileReader();
                reader.onload = async function () {
                    console.log('Result: ' + reader.result);
                    const jsonResponse = JSON.parse(reader.result + '');
                    const url = jsonResponse?.url;
                    if (url) {
                        const response = await axios.get(url, {
                            responseType: 'blob'
                        });
                        downloadFileFromBlob(new Blob([response.data]), title, fileType);
                    }
                };
                reader.readAsText(response.data);
            } else {
                downloadFileFromBlob(new Blob([response.data]), title, fileType);
            }
        } catch (error) {
            console.error('Error downloading the file', error);
        }
        event.stopPropagation();
    }, []);

    const handleDelete = useCallback(async (event, id) => {
        const dialogResult = await confirm('Are you sure you want to delete this file?', 'Delete File');
        if (dialogResult) {
            try {
                const response = await axios.delete(`${process.env.REACT_APP_API_URL}/delete/${id}`);
                if (response.status === 200) {
                    console.log('File successfully deleted');
                    await mutateDocuments();
                    const store = listRef.current?.instance.getDataSource().store();
                    store.remove(id);
                    listRef.current?.instance.reload();
                    return true;
                }
            } catch (error) {
                console.error('Error deleting the file', error);
                return false;
            }
        }
        event.stopPropagation();
        return true;
    }, [mutateDocuments]);

    const listOptions = useMemo(() => ({
        keyExpr: 'id',
        displayExpr: 'title',
        dataSource: listDataSource,
        itemRender: (item) => {
            const capitalize = (title) => title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            return (
                <div className="flex justify-between items-center group">
                    <span>{capitalize(item.title)}</span>
                    <div className="group-hover:block action-buttons hidden">
                        <div className="flex gap-2">
                            <Button
                                onClick={({event}) => handleDownload(event, item["id"], item["title"], item["fileExt"])}
                                icon='download'/>
                            <Button onClick={({event}) => handleDelete(event, item["id"])} icon='trash'/>
                        </div>
                    </div>
                </div>
            );
        }
    }), [handleDelete, handleDownload, listDataSource]);

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

                notify('Document uploaded successfully.', 'success', 3000);
                return true;
            }
        } catch (error) {
            const {response} = error
            if (response && response.status === 400 && response.data.error === 'duplicate file') {
                const message = 'This file already exists.';
                console.log('Duplicate file:', message);
                notify({message, position: {at: 'center', my: 'center'}, width: 'auto'}, 'error', 6000);
                return false;
            }
            console.log('Error uploading file:', error);
            notify('File upload has failed due to an error.', 'error', 3000);
            return false;
        }
    }, [user.id, setDocuments]);

    return (
        <div className="p-3 shadow rounded bg-secondary-subtle">
            <div className='row row-cols-md-2 mb-2 h-100'>
                <AutoSearchBox className='px-0 px-md-2 mb-md-0 mb-2'
                               placeholder={'Search by title'}
                               listOptions={listOptions}
                               onSearchResults={handleSearchResults}
                               ref={listRef}
                />
                <TagBox
                    ref={tagRef}
                    className='mb-2'
                    acceptCustomValue={true}
                    stylingMode={"filled"}
                    placeholder={'Filter by category'}
                    dataSource={categoryDataSource}
                    value={selectedCategories}
                    searchEnabled={true}
                    showSelectionControls={true}
                    onValueChanged={(e) => {
                        setSelectedCategories(e.value);
                    }}
                    dropDownOptions={{hideOnOutsideClick: true}}
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
                            itemDatasource.load().then(() => setGridItems(itemDatasource.items()));
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
                                        itemDatasource.load().then(() => setGridItems(itemDatasource.items()))
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
                                        itemDatasource.load().then(() => setGridItems(itemDatasource.items()))
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
                <FileCardGrid
                    items={gridItems}
                    allCategories={allCategories}
                    onCategoryUpdate={handleCategoryUpdate}
                    //onCardSelected={handleDocumentSelection}
                    onItemDeleted={handleDelete}
                    onItemDownload={handleDownload}
                />
            </div>
            <LoadPanel container={'.card-grid'} visible={isLoadPanelVisible}/>
            <UploadDocumentForm
                handleFormSubmit={handleFormSubmit}
            />
        </div>
    );
};

export default Documents;
