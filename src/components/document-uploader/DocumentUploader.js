import React, {useCallback, useEffect, useState} from 'react';
import FileUploader from 'devextreme-react/file-uploader';
import ProgressBar from 'devextreme-react/progress-bar';
import * as events from 'devextreme/events';
import "./DocumentUploader.css"
import {useAuth} from "../../contexts/auth";
import {useCategories} from "../../app-hooks";

//const allowedFileExtensions = ['.jpg', '.jpeg', '.gif', '.png', '.bmp', '.doc', '.docx', '.xls', '.xlsx', '.pdf', '.txt'];
const DocumentUploader = React.memo(function DocumentUploader({dropZoneWidth = 350}) {
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    const [imageSource, setImageSource] = useState('');
    const [textVisible, setTextVisible] = useState(true);
    const [progressVisible, setProgressVisible] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const {user} = useAuth()
    const docTitle = "Document Title"
    const docCategories = ["Category 1", "Category 2"]
    // eslint-disable-next-line no-undef
    const {categories} = useCategories()


    const onDropZoneEnter = useCallback((e) => {
        if (e.dropZoneElement.id === 'dropzone-external') {
            setIsDropZoneActive(true);
        }
    }, [setIsDropZoneActive]);

    const onDropZoneLeave = useCallback((e) => {
        if (e.dropZoneElement.id === 'dropzone-external') {
            setIsDropZoneActive(false);
        }
    }, [setIsDropZoneActive]);


    const onDropZoneClick = useCallback((e) => {
        e.stopPropagation();
    }, []);

    const onUploaded = useCallback((e) => {
        const {file} = e;
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setIsDropZoneActive(false);
            setImageSource(fileReader.result);
        };
        fileReader.readAsDataURL(file);
        setTextVisible(false);
        setProgressVisible(false);
        setProgressValue(0);
    }, [setImageSource, setIsDropZoneActive, setTextVisible, setProgressVisible, setProgressValue]);

    const onProgress = useCallback((e) => {
        setProgressValue((e.bytesLoaded / e.bytesTotal) * 100);
    }, [setProgressValue]);

    const onUploadStarted = useCallback(() => {
        setImageSource('');
        setProgressVisible(true);
    }, [setImageSource, setProgressVisible]);

    useEffect(() => {
        const fileUploaderButton = document.querySelector('.dx-fileuploader-button');
        if (fileUploaderButton) {
            events.on(fileUploaderButton, 'dxclick', onDropZoneClick);
        }
    }, [onDropZoneClick]);

    return (
        <div className="widget-container flex-box">
            <div id="dropzone-external" style={{width: dropZoneWidth}} onClick={onDropZoneClick}
                 className={`flex-box ${isDropZoneActive ?
                     'dx-theme-accent-as-border-color dropzone-active' : 'dx-theme-border-color'}`}>
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
                // allowedFileExtensions={allowedFileExtensions}
                uploadMode="instantly"
                uploadUrl={`${process.env.REACT_APP_API_URL}/upload?userId=${user.id}&title=${docTitle}
                &categories=${docCategories.join(',')}`}
                name={'file'}
                // visible={false}
                onDropZoneEnter={onDropZoneEnter}
                onDropZoneLeave={onDropZoneLeave}
                onUploaded={onUploaded}
                onProgress={onProgress}
                onUploadStarted={onUploadStarted}
            ></FileUploader>
        </div>
    );
})

export default DocumentUploader;