import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';
import { Provider } from 'react-redux';  // Import Provider from react-redux
import store from './store';  // Import your Redux store
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the AppRouter with the Provider */}
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>
);
