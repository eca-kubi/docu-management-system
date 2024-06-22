import React, {useCallback, useEffect, useState} from 'react';
import FileUploader from 'devextreme-react/file-uploader';
import ProgressBar from 'devextreme-react/progress-bar';
import notify from 'devextreme/ui/notify';
import "./DocumentUploader.css";

import imageIcon from "./../../images/image_icon.png";
import pdfIcon from "./../../images/pdf_icon.png";
import docxIcon from "./../../images/docx_icon.png";
import xlsxIcon from "./../../images/xlsx_icon.png";
import txtIcon from "./../../images/txt_icon.png";
import audioIcon from "./../../images/mp3_icon.png";
import zipIcon from "./../../images/zip_icon.png";
import documentIcon from "./../../images/document_icon.png";

const DocumentUploader = React.memo(function DocumentUploader({value = [], handleValueChange, dropZoneWidth = 350}) {
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    const [imageSource, setImageSource] = useState('');
    const [textVisible, setTextVisible] = useState(true);
    const [progressVisible, setProgressVisible] = useState(false);
    const [progressValue, setProgressValue] = useState(0);

    const onDropZoneEnter = useCallback((e) => {
        if (e.dropZoneElement && e.dropZoneElement.id === 'dropzone-external') {
            setIsDropZoneActive(true);
        }
    }, []);

    const onDropZoneLeave = useCallback((e) => {
        if (e.dropZoneElement && e.dropZoneElement.id === 'dropzone-external') {
            setIsDropZoneActive(false);
        }
    }, []);

    const onDropZoneClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const onProgress = useCallback((e) => {
        setProgressValue((e.bytesLoaded / e.bytesTotal) * 100);
    }, []);

    const showFilePreview = useCallback((file) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            const fileType = file.type.split('/')[0];
            const fileNameParts = file.name.split('.');
            const fileExtension = fileNameParts.length > 1 ? fileNameParts.pop().toLowerCase() : '';

            const iconMapping = {
                image: imageIcon,
                pdf: pdfIcon,
                docx: docxIcon,
                xlsx: xlsxIcon,
                txt: txtIcon,
                mp3: audioIcon,
                zip: zipIcon,
                rar: zipIcon,
                '7z': zipIcon
            };

            const fileTypeIcon = iconMapping[fileExtension] || documentIcon;
            const imgSource = fileType === 'image' ? fileReader.result : fileTypeIcon
            setImageSource(() => {
                return imgSource;
            });

        };
        fileReader.onerror = () => {
            notify({
                message: "Failed to read the file.",
                position: {at: 'center', my: 'center'}
            }, "error", 5000);
        };
        fileReader.readAsDataURL(file);
        setTextVisible(false);
        setProgressVisible(false);
        setProgressValue(0);

    }, []);

    const onValueChanged = useCallback((e) => {
        const {value} = e;
        handleValueChange(value);
    }, [handleValueChange]);

    useEffect(() => {
        if (value && value.length > 0) {
            showFilePreview(value[0]);
        } else {
            setImageSource('');
            setTextVisible(true);
            setIsDropZoneActive(false);
        }
    }, [showFilePreview, value]);

    return (
        <div className="widget-container flex-box">
            <div id="dropzone-external" style={{width: dropZoneWidth}}
                 className={`flex-box ${isDropZoneActive ? 'dx-theme-accent-as-border-color dropzone-active' : 'dx-theme-border-color'}`}
                 onClick={onDropZoneClick}>
                {imageSource && <img id="dropzone-image" src={imageSource} alt=""/>}
                {textVisible && (
                    <div id="dropzone-text" className="flex-box">
                        <span>Drag & Drop the desired file</span>
                        <span>…or click to browse for a file instead.</span>
                    </div>
                )}
                <ProgressBar
                    id="upload-progress"
                    min={0}
                    max={100}
                    width="30%"
                    showStatus={false}
                    visible={progressVisible}
                    value={progressValue}
                ></ProgressBar>
            </div>
            <FileUploader
                id="file-uploader"
                dialogTrigger="#dropzone-external"
                dropZone="#dropzone-external"
                multiple={false}
                uploadMode="useButtons"
                onDropZoneEnter={onDropZoneEnter}
                onDropZoneLeave={onDropZoneLeave}
                onProgress={onProgress}
                onValueChanged={onValueChanged}
                value={value || []}
            ></FileUploader>
        </div>
    );
});

export default DocumentUploader;
