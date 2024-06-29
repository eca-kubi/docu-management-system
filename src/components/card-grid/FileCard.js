import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faEllipsisV,
    faFile,
    faFileAudio,
    faFilePdf,
    faFilePowerpoint,
    faFileWord
} from '@fortawesome/free-solid-svg-icons';
import {Dropdown} from 'react-bootstrap';
import {TagBox} from 'devextreme-react';
import './FileCard.scss';
import _ from "lodash";

const FileCard = ({
                      id, fileType, title, defaultCategorySelection, uploadDate, allCategories,
                      onCardSelected, onCategoryUpdate, downloadHandler, deleteHandler
                  }) => {
    const getFileIcon = (fileType) => {
        const fileTypes = {
            pdf: faFilePdf,
            docx: faFileWord,
            pptx: faFilePowerpoint,
            mp3: faFileAudio,
        };
        return fileType in fileTypes ? fileTypes[fileType] : faFile;
    };

    const [isSelected, setIsSelected] = useState(false);
    const toggleSelection = () => {
        setIsSelected(!isSelected);
        onCardSelected(id, !isSelected);
    };

    const sortedItems = [...new Set([...defaultCategorySelection, ..._.sortBy(allCategories)])]

    return (
        <div key={id} className="col mb-2">
            <div className="card h-100 hover:shadow-xl hover:outline hover:outline-red-300
        has-[.item-checkbox:checked]:outline has-[.item-checkbox:checked]:outline-red-700">
                <input type="checkbox" className="item-checkbox position-absolute top-0 start-0 mt-2 ms-2
          cursor-pointer d-none"
                       onChange={toggleSelection}
                       checked={isSelected}
                       id={`checkbox-${id}`}
                />
                <div className="card-body">
                    <FontAwesomeIcon icon={getFileIcon(fileType)} size="3x"/>
                    <h5 className="card-title mt-2">{title}</h5>
                    <TagBox
                        items={sortedItems}
                        labelMode={"floating"}
                        label={"categories"}
                        stylingMode={"underlined"}
                        placeholder={""}
                        showSelectionControls={true}
                        acceptCustomValue={true}
                        multiline={true}
                        hideSelectedItems={false}
                        applyValueMode={"instantly"}
                        defaultValue={defaultCategorySelection}
                        maxDisplayedTags={5}
                        showMultiTagOnly={false}
                        dropDownOptions={
                            {
                                hideOnOutsideClick: true,
                            }
                        }
                        onValueChanged={(e) => {
                            onCategoryUpdate(id, e.value);
                        }}
                        searchEnabled={true}
                    />
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Uploaded on {uploadDate}</small>
                        <Dropdown>
                            <Dropdown.Toggle variant="light" id="card-actions" className={"custom-dropdown-toggle"}
                                             style={{background: 'none', border: 'none'}}>
                                <FontAwesomeIcon icon={faEllipsisV}/>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={(e) => downloadHandler(e, id, title, fileType)}>Download</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => deleteHandler(e, id)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCard;
