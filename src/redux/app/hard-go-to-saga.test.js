/* global expect */

import { runSaga } from 'redux-saga';

import { hardGoToSaga } from './hard-go-to-saga';

describe('hard go to saga', () => {
  test('Go to HOME_PATH', async function() {
    global.HOME_PATH = 'HOME_PATH';

    const location = {};

    await runSaga({
      context: { location }
    }, hardGoToSaga, {});

    expect(location).toHaveProperty('href');
    expect(location.href).toStrictEqual(global.HOME_PATH);
  });

  test('Go to OTHER_PATH', async function() {
    const OTHER_PATH = 'OTHER_PATH';

    const location = {};

    await runSaga({
      context: { location }
    }, hardGoToSaga, { payload: OTHER_PATH });

    expect(location).toHaveProperty('href');
    expect(location.href).toStrictEqual(OTHER_PATH);
  });
});
