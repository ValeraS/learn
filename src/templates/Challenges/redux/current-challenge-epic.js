import { ofType } from 'redux-observable';

import { types } from './';
import { filter, switchMap, catchError, mapTo } from 'rxjs/operators';
import {
  isSignedInSelector,
  currentChallengeIdSelector
} from '../../../redux/app';
import { postJSON$ } from '../utils/ajax-stream';
import { _csrf } from '../../../redux/cookieVaules';
import { of } from 'rxjs';

function currentChallengeEpic(action$, state$) {
  return action$.pipe(
    ofType(types.challengeMounted),
    filter(() => isSignedInSelector(state$.value)),
    filter(({ payload }) => (
      payload !== currentChallengeIdSelector(state$.value)
    )),
    switchMap(({ payload }) =>
      postJSON$('/external/update-my-current-challenge', {
        currentChallengeId: payload,
        _csrf
      })
    ),
    mapTo({ type: 'currentChallengeUpdateComplete' }),
    catchError(() => of({ type: 'current-challenge-update-error' }))
  );
}

export default currentChallengeEpic;
