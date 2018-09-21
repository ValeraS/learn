import { all } from 'redux-saga/effects';

import { sagas as appSagas } from './app';

export default function* rootSaga() {
  yield all([...appSagas]);
}
