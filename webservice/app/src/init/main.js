import React from 'react';
import { render } from 'react-dom';
import Router from 'init/router'

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from 'reducers/rootReducer';
import { Provider } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.css';

function init() {
  const store = createStore(rootReducer, applyMiddleware(thunk));

  render((
    <Provider store={store}>
      <Router/>
    </Provider>),
      document.getElementById('app'));
}
/* eslint-enable max-statements */

document.addEventListener('DOMContentLoaded', function() {
  try {
    window.localStorage.test = 'Testing write write to localStorage..';
  } catch (e) {
    document.body.innerHTML = `
      <div class="mobile-incompatibility">
        <h4>Your browser is not able to write to local storage.</h4>
        <p>If you are using private mode please disable it.</p>
        <p>Otherwise your browser is not supported or you have local storage turned off in your browser preferences.</p>
      </div>
    `;
  }
  init();
});
