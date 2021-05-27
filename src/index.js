import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { withAuthenticator } from 'aws-amplify-react'
const AppWithAuth = withAuthenticator(App, {includeGreetings: false});

ReactDOM.render(<AppWithAuth />, document.getElementById('root'));
registerServiceWorker();
