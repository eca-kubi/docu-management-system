import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css'
import './themes/generated/tailwind.css'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
//import {licenseKey} from "./devextreme-license"
//import config from 'devextreme/core/config'
//config({licenseKey})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
