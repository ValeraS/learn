/* global expect jest */
/* eslint-disable import/namespace */
/* eslint-disable no-undefined */

import { runSaga } from 'redux-saga';

import * as cookie from '../cookieValues';
import { fetchUserComplete, fetchUserError, hardGoTo, noUserFound } from './';
import { fetchSessionUser } from './fetch-user-saga';

describe('Fetch user saga', () => {
  test('User found, email verified', async function() {
    cookie.jwt = 'fake-jwt';
    const dispatched = [];

    const response = {
      entities: {
        user: {
          a: { emailVerified: true }
        }
      },
      result: 'a'
    };

    const readService = jest.fn(() => response);

    await runSaga({
      dispatch: (action) => dispatched.push(action),
      context: { services: { readService } }
    }, fetchSessionUser);

    expect(readService).toHaveBeenCalledTimes(1);
    expect(readService).toHaveBeenCalledWith({ service: 'user' });
    expect(dispatched).toStrictEqual([fetchUserComplete(response)]);
  });

  test('User found, email not verified', async function() {
    global.HOME_PATH = 'HOME_PATH';
    cookie.jwt = 'fake-jwt';
    const dispatched = [];

    const response = {
      entities: {
        user: {
          a: { emailVerified: false }
        }
      },
      result: 'a'
    };

    const readService = jest.fn(() => response);

    await runSaga({
      dispatch: (action) => dispatched.push(action),
      context: { services: { readService } }
    }, fetchSessionUser);

    expect(readService).toHaveBeenCalledTimes(1);
    expect(readService).toHaveBeenCalledWith({ service: 'user' });
    expect(dispatched).toStrictEqual([hardGoTo(global.HOME_PATH)]);
  });

  test('Wrong response', async function() {
    global.HOME_PATH = 'HOME_PATH';
    cookie.jwt = 'fake-jwt';
    const dispatched = [];

    const response = {};

    const readService = jest.fn(() => response);

    await runSaga({
      dispatch: (action) => dispatched.push(action),
      context: { services: { readService } }
    }, fetchSessionUser);

    expect(readService).toHaveBeenCalledTimes(1);
    expect(readService).toHaveBeenCalledWith({ service: 'user' });
    expect(dispatched).toStrictEqual([noUserFound()]);
  });

  test('Service error', async function() {
    cookie.jwt = 'fake-jwt';
    const dispatched = [];

    const readService = jest.fn(() => { throw new Error('Fake error'); });

    await runSaga({
      dispatch: (action) => dispatched.push(action),
      context: { services: { readService } }
    }, fetchSessionUser);

    expect(readService).toHaveBeenCalledTimes(1);
    expect(readService).toThrow();
    expect(dispatched).toStrictEqual([fetchUserError()]);
  });

  test('Not logged in', async function() {
    cookie.jwt = undefined;
    const dispatched = [];

    const readService = jest.fn();

    await runSaga({
      dispatch: (action) => dispatched.push(action),
      context: { services: { readService } }
    }, fetchSessionUser);

    expect(readService).toHaveBeenCalledTimes(0);
    expect(dispatched).toStrictEqual([noUserFound()]);
  });
});
