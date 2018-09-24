/* global HOME_PATH */
import { takeEvery, getContext } from 'redux-saga/effects';

export function* hardGoToSaga({ payload = HOME_PATH }) {
  const location = yield getContext('location');
  location.href = payload;
}

export function createHardGoToSaga(types) {
  return [takeEvery(types.hardGoTo, hardGoToSaga)];
}
