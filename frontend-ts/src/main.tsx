import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';
import { Provider as ReduxProvider } from 'react-redux';
// import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import App from './App';
import { store } from './store/index';
// import rollbarConfig from './utils/rollbarConfig.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <RollbarProvider config={rollbarConfig}> */}
      {/* <ErrorBoundary> */}
        <ReduxProvider store={store}>
          <App />
        </ReduxProvider>
      {/* </ErrorBoundary> */}
    {/* </RollbarProvider> */}
  </React.StrictMode>,
);