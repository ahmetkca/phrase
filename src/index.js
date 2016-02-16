// ============================================================================
// GLOBAL SCRIPTS
// ============================================================================
require("css-element-queries/src/ResizeSensor.js");
require("css-element-queries/src/ElementQueries.js");

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
import './index.scss';
import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import STORE from './reducers/createStore.js'
import Layout from './components/Layout.js'

// Setup initial state - 2 tracks by default
import { phraseCreateTrack } from './actions/actionsPhrase.js'
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )

ReactDOM.render(
  <Provider store={STORE}>
    <Layout />
  </Provider>,
  document.getElementById('root')
)