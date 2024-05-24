import './home.scss';
import React from 'react';
import {Link} from "react-router-dom";
import {Button} from 'devextreme-react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons'

export default function Home() {
    return (
        <div className={"d-flex  flex-column justify-content-center align-items-center vh-100 text-center "}
        >
            <h3 className="mb-4">
                <span role="img" aria-label="Open folder emoji">📂</span>
                Docu Management System
                <hr/>
            </h3>
            <p className="lead mb-4">
                Effortlessly manage your documents with our powerful and user-friendly system.
                Upload,
                organize, and search for your files seamlessly.
            </p>
            <p>Key features:</p>
            <ul className="list-unstyled">
                <li>
                    <FontAwesomeIcon icon={faCheckCircle} className={"me-2 text-success"}/>
                    Secure file storage and retrieval
                </li>
                <li>
                    <FontAwesomeIcon icon={faCheckCircle} className={"me-2 text-success"}/>
                    Comprehensive file organization and tagging
                </li>
                <li>
                    <FontAwesomeIcon icon={faCheckCircle} className={"me-2 text-success"}/>
                    Streamline storage by avoiding storing duplicate files
                </li>
            </ul>
            <Link to="/documents">
                <Button className="mt-4" type={'success'} stylingMode={"contained"}>
                    Get Started
                </Button>
            </Link>
        </div>
    )
}
