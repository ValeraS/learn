/* eslint-disable-next-line max-len */
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';

import {
  createStore as reduxCreateStore,
  combineReducers,
  applyMiddleware
} from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

import { reducer as formReducer } from 'redux-form';

import { reducer as app, epics as appEpics } from './app';
import {
  reducer as challenge,
  epics as challengeEpics,
  types
} from '../templates/Challenges/redux';
import { reducer as map } from '../components/Map/redux';
import servicesCreator from './createServices';
import { _csrf } from './cookieVaules';

const resetFormOnSubmit = (state, action) => {
  if (action.type === types.submitChallenge) {
    return undefined;
  }
  return state;
};

const rootReducer = combineReducers({
  app,
  challenge,
  form: formReducer.plugin({
    'front-end-form': resetFormOnSubmit,
    'back-end-form': resetFormOnSubmit
  }),
  map
});

const rootEpic = combineEpics(...appEpics, ...challengeEpics);

const serviceOptions = {
  context: _csrf ? { _csrf } : {},
  xhrPath: '/external/services',
  xhrTimeout: 15000
};

const epicMiddleware = createEpicMiddleware({
  dependencies: {
    window: typeof window !== 'undefined' ? window : {},
    location: typeof window !== 'undefined' ? window.location : {},
    document: typeof window !== 'undefined' ? document : {},
    services: servicesCreator(serviceOptions)
  }
});

const composeEnhancers = composeWithDevTools({
  // options like actionSanitizer, stateSanitizer
});

export const createStore = (storeWithEpics = true) => {
  if (!storeWithEpics) {
    return reduxCreateStore(rootReducer);
  }
  const store = reduxCreateStore(
    rootReducer,
    composeEnhancers(applyMiddleware(epicMiddleware))
  );
  epicMiddleware.run(rootEpic);
  return store;
};
