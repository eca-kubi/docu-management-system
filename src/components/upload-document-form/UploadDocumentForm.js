import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Popup, ScrollView} from "devextreme-react";
import ValidationSummary from 'devextreme-react/validation-summary';
import Form, {AsyncRule, ButtonItem, GroupItem, RequiredRule, SimpleItem} from "devextreme-react/form";
import {Validator} from 'devextreme-react/validator';
import {useCategories} from "../../app-hooks";
import {useAuth} from "../../contexts/auth";
import DocumentUploader from "../document-uploader/DocumentUploader";

const UploadDocumentForm = ({
                                isPopupVisible,
                                handleFieldChange,
                                handleFormSubmit,
                                handlePopupShown,
                                handlePopupHidden
                            }) => {
    const {user} = useAuth();
    const [formData, setFormData] = useState({title: '', categories: [], file: []});
    const {categories} = useCategories();

    const popupRef = useRef(null);
    const formRef = useRef(null);
    const validationSummaryRef = useRef(null);
    const scrollViewRef = useRef(null);

    const [sortedCategories, setSortedCategories] = useState([]);
    const [isUploaderReady, setUploaderReady] = useState(false);

    useEffect(() => {
        if (categories) {
            const sorted = [...categories].sort((a, b) => a.localeCompare(b));
            setSortedCategories(sorted);
        }
        if (isPopupVisible) {
            setFormData({file: [], title: '', categories: []});
        }
    }, [categories, isPopupVisible]);

    const onFormInitialized = useCallback((e) => {
        formRef.current = e.component;
    }, []);

    const onPopupShown = useCallback(() => {
        setUploaderReady(true);
        if (formRef.current) {
            const titleEditor = formRef.current.getEditor('title');
            titleEditor.element().querySelector('input').focus();
        }
        handlePopupShown();
    }, [handlePopupShown]);

    const titleExists = useCallback(async (title) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/search?title=${title}&user_id=${user.id}`);
        const results = await response.json();
        return results.length > 0;
    }, [user.id]);

    const onFieldDataChanged = useCallback((e) => {
        handleFieldChange(e);
    }, [handleFieldChange]);

    const handleFileChange = useCallback((value) => {
        setFormData(prevState => ({...prevState, file: value || []}));
        onFieldDataChanged({dataField: 'file', value: value || []});
    }, [onFieldDataChanged]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        handleFormSubmit(formData);
    }, [handleFormSubmit, formData]);

    const scrollToValidationSummary = useCallback(() => {
        if (scrollViewRef.current && validationSummaryRef.current) {
            setTimeout(() => {
                scrollViewRef.current.instance.scrollToElement(document.getElementsByClassName('dx-validationsummary')[0]);
            }, 1000);
        }
    }, []);

    const titleEditorOptions = useMemo(() => ({
        labelMode: 'floating',
        label: 'Categories',
        stylingMode: 'underlined',
        placeholder: ''
    }), []);

    const categoriesEditorOptions = useMemo(() => ({
        items: sortedCategories,
        labelMode: 'floating',
        label: 'Categories',
        stylingMode: 'underlined',
        placeholder: '',
        showSelectionControls: true,
        acceptCustomValue: true,
        multiline: true,
        hideSelectedItems: false,
        applyValueMode: 'instantly',
        maxDisplayedTags: 5,
        showMultiTagOnly: false,
        dropDownOptions: {hideOnOutsideClick: true},
        searchEnabled: true
    }), [sortedCategories]);

    const submitButtonOptions = useMemo(() => ({
        text: "Submit",
        type: "success",
        useSubmitBehavior: true,
        validationGroup: "uploadDocumentGroup",
    }), []);

    const handleValidated = useCallback((e)=> {
        if(!e.isValid) scrollToValidationSummary();
    }, [scrollToValidationSummary])

    const validationSummaryAttr = useMemo(() => ({id: 'validationSummary'}), []);

    const handleValidationSummaryItemClick = useCallback((e) => {
        const elem = e.element;

    }, []);

    return (
        <Popup
            visible={isPopupVisible}
            dragEnabled={false}
            hideOnOutsideClick={true}
            title="Document Details"
            width={600}
            height={600}
            ref={popupRef}
            onShown={onPopupShown}
            onHidden={handlePopupHidden}
        >
            <ScrollView width="100%" height="100%" ref={scrollViewRef}>
                <form onSubmit={handleSubmit}>
                    <Form
                        formData={formData}
                        ref={formRef}
                        onFieldDataChanged={onFieldDataChanged}
                        onInitialized={onFormInitialized}
                        showRequiredMark={true}
                        showValidationSummary={true}
                        validationGroup={"uploadDocumentGroup"}
                    >
                        <ValidationSummary
                            //validationGroup="uploadDocumentGroup"
                            ref={validationSummaryRef}
                            hoverStateEnabled={true}
                            elementAttr={validationSummaryAttr}
                            onItemClick={handleValidationSummaryItemClick}
                            items={['file', 'title', 'categories']}
                        />
                        <SimpleItem
                            name="title"
                            dataField="title"
                            helpText="Provide the title for the document"
                            label={{visible: false}}
                            isRequired={true}
                            editorType="dxTextBox"
                            editorOptions={titleEditorOptions}
                        >
                            <RequiredRule message="Title is required"/>
                            <AsyncRule
                                message="Title already exists"
                                validationCallback={async (params) => {
                                    if (params.value) {
                                        const exists = await titleExists(params.value);
                                        return !exists;
                                    }
                                    return true;
                                }}
                            />
                        </SimpleItem>
                        <SimpleItem
                            name="categories"
                            dataField="categories"
                            isRequired={true}
                            editorType="dxTagBox"
                            editorOptions={categoriesEditorOptions}
                            label={{visible: false}}
                        />
                        <SimpleItem
                            name={"file"}
                            dataField={"file"}
                            isRequired={true}
                            render={() => isUploaderReady &&
                                <div>
                                    <DocumentUploader
                                        value={formData.file}
                                        handleValueChange={handleFileChange}
                                        dropZoneWidth={500}
                                    />
                                    <Validator
                                        validationGroup="uploadDocumentGroup"
                                        name={"file"}
                                        adapter={{
                                            getValue: () => formData.file,
                                            reset: () => setFormData(prevState => ({...prevState, file: []})),
                                            validationRequestsCallbacks: []
                                        }}
                                        validationRules={[{
                                            type: "custom",
                                            validationCallback: (params) => {
                                                return params.value && params.value.length > 0;
                                            },
                                            message: "File is required"
                                        }]}
                                        onValidated={handleValidated}
                                    />
                                </div>
                            }
                        />
                        <GroupItem colCount={2}>
                            <ButtonItem
                                horizontalAlignment="center"
                                buttonOptions={submitButtonOptions}
                            />
                            <ButtonItem
                                horizontalAlignment="center"
                                buttonOptions={{
                                    text: "Cancel",
                                    type: "normal",
                                    onClick: () => {
                                        popupRef.current.instance.hide();
                                    }
                                }}
                            />
                        </GroupItem>
                    </Form>
                </form>
            </ScrollView>
        </Popup>
    );
};

export default UploadDocumentForm;
