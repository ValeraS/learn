/* eslint-disable-next-line max-len */
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import {
  createStore as reduxCreateStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

import { reducer as app } from './app';
import {
  reducer as challenge,
  epics as challengeEpics,
  formReducer
} from '../templates/Challenges/redux';
import { reducer as map } from '../components/Map/redux';
import servicesCreator from './createServices';
import { _csrf } from './cookieValues';

import rootSaga from './rootSaga';

const serviceOptions = {
  context: _csrf ? { _csrf } : {},
  xhrPath: '/external/services',
  xhrTimeout: 15000
};

const rootReducer = combineReducers({
  app,
  challenge,
  form: formReducer,
  map
});

const sagaMiddleware = createSagaMiddleware({
  context: {
    location: typeof window !== 'undefined' ? window.location : {},
    services: servicesCreator(serviceOptions)
  }
});

const rootEpic = combineEpics(...challengeEpics);

const epicMiddleware = createEpicMiddleware(rootEpic, {
  dependencies: {
    window: typeof window !== 'undefined' ? window : {},
    document: typeof window !== 'undefined' ? document : {}
  }
});

const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});

export const createStore = () => {
  const store = reduxCreateStore(
    rootReducer,
    composeEnhancers(applyMiddleware(epicMiddleware, sagaMiddleware))
  );
  sagaMiddleware.run(rootSaga);
  return store;
};
