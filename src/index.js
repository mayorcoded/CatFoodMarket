import ReactDOM from 'react-dom';
import React from 'react';
import App from './containers/App';
import {HashRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App/>
        </Router>
    </Provider>,
    document.getElementById('root')
);