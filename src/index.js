import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import "./react-snap-shim";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AppProviders } from './AppProviders';
import { BrowserRouter as Router } from 'react-router-dom';
import { FourSquare } from "react-loading-indicators";
import ReactGA from "react-ga4";


const root = ReactDOM.createRoot(document.getElementById('root'));
ReactGA.initialize("G-M1NJJ7NK8S");

root.render(
  <React.StrictMode>
    <Router>
      <Suspense
        fallback={
          <div className="loading">
            <FourSquare color={["#ff6f33"]} size="large" textColor="#3b0c0c" />
          </div>
        }
      >
        <AppProviders>
          <App />
        </AppProviders>
      </Suspense>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
