import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Popup, ScrollView, SpeedDialAction} from "devextreme-react";
import ValidationSummary from 'devextreme-react/validation-summary';
import Form, {AsyncRule, ButtonItem, GroupItem, RequiredRule, SimpleItem} from "devextreme-react/form";
import {Validator} from 'devextreme-react/validator';
import validationEngine from 'devextreme/ui/validation_engine';
import {useCategories} from "../../app-hooks";
import {useAuth} from "../../contexts/auth";
import DocumentUploader from "../document-uploader/DocumentUploader";

const UploadDocumentForm = ({handleFormSubmit}) => {
    const {user} = useAuth();
    const [formData, setFormData] = useState({title: '', categories: [], file: []});
    const popupRef = useRef(null);
    const formRef = useRef(null);
    const validationSummaryRef = useRef(null);
    const scrollViewRef = useRef(null);
    const timeoutRef = useRef(null);
    const {categories} = useCategories();
    const [sortedCategories, setSortedCategories] = useState([]);
    const [isUploaderReady, setUploaderReady] = useState(false);

    useEffect(() => {
        if (categories) {
            const sorted = [...categories].sort((a, b) => a.localeCompare(b));
            setSortedCategories(sorted);
        }
    }, [categories]);

    const scrollToValidationSummary = useCallback(() => {
        if (scrollViewRef.current) {
            const validationSummaryElement = document.getElementsByClassName('dx-validationsummary')[0];
            if (validationSummaryElement) {
                scrollViewRef.current.instance.scrollToElement(validationSummaryElement);
            }
        }
    }, []);

    const onFormInitialized = useCallback((e) => {
        formRef.current = e.component;
    }, []);

    const onPopupShown = useCallback(() => {
        setUploaderReady(true);
        timeoutRef.current = setTimeout(() => {
            if (formRef.current && formRef.current.getEditor) {
                const titleEditor = formRef.current.getEditor('title');
                if (titleEditor) {
                    titleEditor.focus();
                }
            }
        }, 500);
    }, []);

    const onPopupHidden = useCallback(() => {
        setFormData({title: '', categories: [], file: []});
        setUploaderReady(false);
        clearTimeout(timeoutRef.current);
    }, []);

    const titleExists = useCallback(async (title) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/validate_title?title=${title}&user_id=${user.id}`);
            const results = await response.json();
            return results.exists;
        } catch (error) {
            console.error("Error validating title:", error);
            return false;
        }
    }, [user.id]);

    const handleFileChange = useCallback((value) => {
        setFormData(prevState => ({...prevState, file: value || []}));
    }, []);

    const handleValidationAndSubmit = useCallback(async () => {

        const res = validationEngine.validateGroup('uploadDocumentGroup')
        res.status === "pending" && res.complete.then(async (result) => {
            console.log('status: ', res.status)
            console.log('result: ', result)
            if (result.isValid) {
                if (await handleFormSubmit(formData)) {
                    popupRef.current.instance.hide();
                }
            } else {
                // Scroll to validation errors summary
                scrollToValidationSummary();
            }
        });
        res.status === "invalid" && scrollToValidationSummary();
    }, [formData, handleFormSubmit, scrollToValidationSummary]);

    const titleEditorOptions = useMemo(() => ({
        labelMode: 'floating',
        label: 'Title',
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
        onClick: handleValidationAndSubmit,
        validationGroup: "uploadDocumentGroup",
    }), [handleValidationAndSubmit]);

    return (
        <Popup
            dragEnabled={true}
            hideOnOutsideClick={true}
            title="Document Details"
            width={600}
            height={600}
            ref={popupRef}
            showCloseButton={true}
            onShown={onPopupShown}
            onHidden={onPopupHidden}
        >
            <ScrollView width="100%" height="100%" ref={scrollViewRef}>
                <Form
                    formData={formData}
                    ref={formRef}
                    onInitialized={onFormInitialized}
                    showRequiredMark={true}
                    showValidationSummary={true}
                    validationGroup={"uploadDocumentGroup"}
                >
                    <ValidationSummary
                        ref={validationSummaryRef}
                        hoverStateEnabled={true}
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
                            type={"async"}
                            ignoreEmptyValue={true}
                            validationCallback={(params) => {
                                return new Promise(async (resolve) => {
                                    if (params.value) {
                                        const exists = await titleExists(params.value);
                                        resolve(!exists)
                                    }
                                    resolve(true)
                                })
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
                    >
                        <RequiredRule message="At least one category is required"/>
                    </SimpleItem>
                    <SimpleItem
                        name={"file"}
                        dataField={"file"}
                        render={() => isUploaderReady &&
                            <>
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
                                />
                            </>
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
            </ScrollView>
            <SpeedDialAction
                hint={'Upload documents'}
                icon={'upload'}
                label={'Upload'}
                onClick={() => {
                    popupRef.current.instance.show();
                }}
            />
        </Popup>
    );
};

export default UploadDocumentForm;
