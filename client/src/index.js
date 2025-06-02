import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// google analytics
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XCERTKNM4E');
ReactGA.send('pageview');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);