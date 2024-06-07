import React, { useCallback, useEffect, useRef, useState } from "react";
import { Popup, ScrollView } from "devextreme-react";
import Form, { ButtonItem, AsyncRule, GroupItem, RequiredRule, SimpleItem } from "devextreme-react/form";
import { useCategories } from "../../app-hooks";
import { useAuth } from "../../contexts/auth";
import DocumentUploader from "../document-uploader/DocumentUploader";

const UploadDocumentForm = ({
                                fieldErrors = [],
                                isPopupVisible,
                                handleFieldChange,
                                handleFormSubmit,
                                handlePopupShown,
                                handlePopupHidden
                            }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ title: 'Title', categories: [], file: null});
    const { categories } = useCategories();

    const popupRef = useRef(null);
    const formRef = useRef(null);

    const [sortedCategories, setSortedCategories] = useState([]);

    const [isUploaderReady, setUploaderReady] = useState(false);

    const categoriesEditorOptions = {
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
    };

    const submitButtonOptions = {
        text: "Submit",
        type: "success",
        useSubmitBehavior: true,
        disabled: fieldErrors.length > 0
    };

    useEffect(() => {
        if (categories) {
            const sorted = [...categories].sort((a, b) => a.localeCompare(b));
            setSortedCategories(sorted);
        }
        // Reset the FormData component when the popup is shown
        if (isPopupVisible) {
            setFormData({ file:null, title: 'Title', categories: [] }); // Clear previous form data
        }

    }, [categories, isPopupVisible]);

    const onFormInitialized = useCallback((e) => {
        formRef.current = e.component; // Save the form instance
    }, []);

    const onPopupShown = useCallback(() => {
        setUploaderReady(true);
        let titleEditor = null;
        if (formRef.current) {
            titleEditor = formRef.current.getEditor('title');
            titleEditor.element().querySelector('input').focus(); // Give the title input the focus
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
            <ScrollView width="100%" height="100%">
                <Form
                    formData={formData}
                    ref={formRef}
                    onFieldDataChanged={onFieldDataChanged}
                    onSubmit={handleFormSubmit}
                    onInitialized={onFormInitialized}
                >
                    <SimpleItem
                        name="title"
                        helpText="Provide the title for the document"
                        label={{ visible: false }}
                        dataField="title"
                        isRequired={true}
                        editorType="dxTextBox"
                    >
                        <RequiredRule message="Title is required" />
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
                        editorType="dxTagBox"
                        editorOptions={categoriesEditorOptions}
                        label={{ visible: false }}
                    />
                    <SimpleItem
                        name={"file"}
                        render={() => isUploaderReady && <DocumentUploader dropZoneWidth={500} />}
                    />
                    {fieldErrors.map((error, index) => (
                        <div key={index} className="dx-field-error">
                            {error}
                        </div>
                    ))}
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
