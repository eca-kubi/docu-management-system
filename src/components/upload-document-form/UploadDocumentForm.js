import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Popup, ScrollView } from "devextreme-react";
import ValidationSummary from 'devextreme-react/validation-summary';
import Form, { AsyncRule, ButtonItem, GroupItem, RequiredRule, SimpleItem } from "devextreme-react/form";
import { Validator } from 'devextreme-react/validator';
import validationEngine from 'devextreme/ui/validation_engine';
import { useCategories } from "../../app-hooks";
import { useAuth } from "../../contexts/auth";
import DocumentUploader from "../document-uploader/DocumentUploader";

const UploadDocumentForm = ({
                                isPopupVisible,
                                handleFieldChange,
                                handleFormSubmit,
                                handlePopupShown,
                                handlePopupHidden
                            }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ title: '', categories: [], file: [] });
    const { categories } = useCategories();

    const popupRef = useRef(null);
    const formRef = useRef(null);
    const validationSummaryRef = useRef(null);
    const scrollViewRef = useRef(null);

    const [sortedCategories, setSortedCategories] = useState([]);
    const [isUploaderReady, setUploaderReady] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (categories) {
            const sorted = [...categories].sort((a, b) => a.localeCompare(b));
            setSortedCategories(sorted);
        }
        if (isPopupVisible) {
            setFormData({ file: [], title: '', categories: [] });
        }
    }, [categories, isPopupVisible]);

    const scrollToValidationSummary = useCallback(() => {
        if (scrollViewRef.current) {
            const validationSummaryElement = document.getElementsByClassName('dx-validationsummary')[0];
            if (validationSummaryElement) {
                scrollViewRef.current.instance.scrollToElement(validationSummaryElement);
            }
        }
    }, []);

    const handleValidated = useCallback(async (e) => {
        if (!e.brokenRules.length) { // Check if there are any broken rules
            await handleFormSubmit(formData);
        } else {
            scrollToValidationSummary();
        }
    }, [formData, handleFormSubmit, scrollToValidationSummary]);

    useEffect(() => {
        const attachValidatedEvent = () => {
            const group = validationEngine.getGroupConfig('uploadDocumentGroup');
            if (group) {
                group.on('validated', handleValidated);
            }
        };

        if (isPopupVisible && formRef.current) {
            attachValidatedEvent(); // Attach only when the popup is visible and the form is ready
        }

        return () => {
            const group = validationEngine.getGroupConfig('uploadDocumentGroup');
            if (group) {
                group.off('validated', handleValidated);
            }
        };
    }, [isPopupVisible, handleValidated]); // Add handleValidated to dependency array


    const onFormInitialized = useCallback((e) => {
        formRef.current = e.component;
    }, []);

    const onPopupShown = useCallback(() => {
        setUploaderReady(true);
        timeoutRef.current = setTimeout(() => {
            if (formRef.current) {
                const titleEditor = formRef.current.getEditor('title');
                if (titleEditor) {
                    titleEditor.focus();
                }
            }
        }, 500);
        handlePopupShown();
    }, [handlePopupShown]);

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

    const onFieldDataChanged = useCallback((e) => {
        handleFieldChange(e);
    }, [handleFieldChange]);

    const handleFileChange = useCallback((value) => {
        setFormData(prevState => ({ ...prevState, file: value || [] }));
        onFieldDataChanged({ dataField: 'file', value: value || [] });
    }, [onFieldDataChanged]);

    const handleValidationAndSubmit = useCallback(async () => {
        await validationEngine.validateGroup('uploadDocumentGroup');
    }, []);

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
        dropDownOptions: { hideOnOutsideClick: true },
        searchEnabled: true
    }), [sortedCategories]);

    const submitButtonOptions = useMemo(() => ({
        text: "Submit",
        type: "success",
        onClick: handleValidationAndSubmit,
        validationGroup: "uploadDocumentGroup",
    }), [handleValidationAndSubmit]);

    const validationSummaryAttr = useMemo(() => ({ id: 'validationSummary' }), []);

    const handleValidationSummaryItemClick = useCallback(() => {
        console.log("Validation Item Clicked");
    }, []);

    const onPopupHidden = useCallback(() => {
        setFormData({ title: '', categories: [], file: [] });
        handlePopupHidden();
    }, [handlePopupHidden]);

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
            onHidden={onPopupHidden}
        >
            <ScrollView width="100%" height="100%" ref={scrollViewRef}>
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
                        ref={validationSummaryRef}
                        hoverStateEnabled={true}
                        elementAttr={validationSummaryAttr}
                        onItemClick={handleValidationSummaryItemClick}
                    />
                    <SimpleItem
                        name="title"
                        dataField="title"
                        helpText="Provide the title for the document"
                        label={{ visible: false }}
                        isRequired={true}
                        editorType="dxTextBox"
                        editorOptions={titleEditorOptions}
                    >
                        <RequiredRule message="Title is required" />
                        <AsyncRule
                            message="Title already exists"
                            type={"async"}
                            ignoreEmptyValue={true}
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
                        label={{ visible: false }}
                    >
                        <RequiredRule message="At least one category is required" />
                    </SimpleItem>
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
                                        reset: () => setFormData(prevState => ({ ...prevState, file: [] })),
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
            </ScrollView>
        </Popup>
    );
};

export default UploadDocumentForm;
