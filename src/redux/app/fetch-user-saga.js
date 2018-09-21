
/* global HOME_PATH */
import { call, put, takeEvery, getContext } from 'redux-saga/effects';

import { fetchUserComplete, fetchUserError, hardGoTo, noUserFound } from './';
import { jwt } from '../cookieValues';

function* fetchSessionUser() {
  if (!jwt) {
    yield put(noUserFound());
  } else {
    try {
      const services = yield getContext('services');
      const response = yield call(services.readService, { service: 'user' });
      const {
        entities, result
      } = response;
      if (entities && !!result) {
        if (!entities.user[result].emailVerified) {
          yield put(hardGoTo(HOME_PATH));
        } else {
          yield put(fetchUserComplete(response));
        }
      } else {
        yield put(noUserFound());
      }
    } catch (e) {
      yield put(fetchUserError());
    }
  }
}

export function createFetchUserSaga(types) {
  return [takeEvery(types.fetchUser, fetchSessionUser)];
}
