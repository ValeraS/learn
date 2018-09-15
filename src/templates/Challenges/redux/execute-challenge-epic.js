import {
  Subject,
  merge,
  of,
  from,
  concat
} from 'rxjs';

import {
  debounceTime,
  switchMap,
  map,
  filter,
  pluck,
  tap,
  catchError,
  ignoreElements,
  startWith,
  delay
} from 'rxjs/operators';
import { ofType, combineEpics } from 'redux-observable';
import { overEvery, isString } from 'lodash';

import {
  types,
  challengeMetaSelector,
  challengeTestsSelector,
  initConsole,
  updateConsole,
  initLogs,
  updateLogs,
  logsToConsole,
  checkChallenge,
  updateTests,
  disableJSOnError,
  isJSEnabledSelector
} from './';
import { buildFromFiles, buildBackendChallenge } from '../utils/build';
import {
  runTestsInTestFrame,
  createTestFramer,
  createMainFramer
} from '../utils/frame.js';

import { backend } from '../../../../utils/challengeTypes';

const executeDebounceTimeout = 750;

function updateMainEpic(actions, state$, { document }) {
  return of(document).pipe(
    filter(Boolean),
    switchMap(() => {
      const proxyLogger = new Subject();
      const frameMain = createMainFramer(document, state$, proxyLogger);
      const buildAndFrameMain = actions.pipe(
        ofType(types.updateFile, types.challengeMounted),
        debounceTime(executeDebounceTimeout),
        switchMap(() =>
          buildFromFiles(state$.value, true).pipe(
            map(frameMain),
            ignoreElements(),
            startWith(initConsole('')),
            catchError(err => of(disableJSOnError(err)))
          )
        )
      );
      return merge(buildAndFrameMain, proxyLogger.pipe(map(updateConsole)));
    })
  );
}

function executeChallengeEpic(action$, state$, { document }) {
  return of(document).pipe(
    filter(Boolean),
    switchMap(() => {
      const frameReady = new Subject();
      const proxyLogger = new Subject();
      const frameTests = createTestFramer(
        document,
        state$,
        frameReady,
        proxyLogger
      );
      const challengeResults = frameReady.pipe(
        pluck('checkChallengePayload'),
        map(checkChallengePayload => ({
          checkChallengePayload,
          tests: challengeTestsSelector(state$.value)
        })),
        switchMap(({ checkChallengePayload, tests }) => {
          const postTests = of(
            updateConsole('// tests completed'),
            logsToConsole('// console output'),
            checkChallenge(checkChallengePayload)
          ).pipe(delay(250));
          return concat(
            runTestsInTestFrame(document, tests).pipe(
              switchMap(tests => {
                return concat(
                  from(tests).pipe(
                    map(({ message }) => message),
                    filter(overEvery(isString, Boolean)),
                    map(updateConsole)
                  ),
                  of(updateTests(tests))
                );
              })
            ),
            postTests
          );
        })
      );
      const buildAndFrameChallenge = action$.pipe(
        ofType(types.executeChallenge),
        debounceTime(executeDebounceTimeout),
        filter(() => isJSEnabledSelector(state$.value)),
        switchMap(() => {
          const state = state$.value;
          const { challengeType } = challengeMetaSelector(state);
          const build =
            challengeType === backend
              ? buildBackendChallenge(state)
              : buildFromFiles(state, true);
          return build.pipe(
            tap(frameTests),
            ignoreElements(),
            startWith(initLogs()),
            startWith(initConsole('// running tests')),
            catchError(err => of(disableJSOnError(err)))
          );
        })
      );
      return merge(
        buildAndFrameChallenge,
        challengeResults,
        proxyLogger.pipe(map(updateLogs))
      );
    })
  );
}

export default combineEpics(updateMainEpic, executeChallengeEpic);
