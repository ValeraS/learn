import { empty, of, concat } from 'rxjs';
import {
  switchMap,
  retry,
  map,
  catchError,
  filter,
  tap
} from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { navigate } from 'gatsby';

import { _csrf as csrfToken } from '../../../redux/cookieVaules';

import {
  backendFormValuesSelector,
  projectFormVaulesSelector,
  submitComplete,
  types,
  challengeMetaSelector,
  challengeTestsSelector,
  closeModal,
  challengeFilesSelector
} from './';
import {
  userSelector,
  isSignedInSelector,
  openDonationModal,
  shouldShowDonationSelector
} from '../../../redux/app';

import { postJSON$ } from '../utils/ajax-stream';
import { challengeTypes, submitTypes } from '../../../../utils/challengeTypes';

function postChallenge(url, username, _csrf, challengeInfo) {
  const body = { ...challengeInfo, _csrf };
  const saveChallenge = postJSON$(url, body).pipe(
    retry(3),
    map(({ points }) =>
      submitComplete({
        username,
        points,
        ...challengeInfo
      })
    ),
    catchError(err => {
      console.error(err);
      return of({ type: 'here is an error' });
    })
  );
  return saveChallenge;
}

function submitModern(type, state) {
  const tests = challengeTestsSelector(state);
  if (tests.length > 0 && tests.every(test => test.pass && !test.err)) {
    if (type === types.checkChallenge) {
      return of({ type: 'this was a check challenge' });
    }

    if (type === types.submitChallenge) {
      const { id } = challengeMetaSelector(state);
      const files = challengeFilesSelector(state);
      const { username } = userSelector(state);
      return postChallenge(
        '/external/modern-challenge-completed',
        username,
        csrfToken,
        {
          id,
          files
        }
      );
    }
  }
  return empty();
}

function submitProject(type, state) {
  if (type === types.checkChallenge) {
    return empty();
  }

  const { solution, githubLink } = projectFormVaulesSelector(state);
  const { id, challengeType } = challengeMetaSelector(state);
  const { username } = userSelector(state);
  const challengeInfo = { id, challengeType, solution };
  if (challengeType === challengeTypes.backEndProject) {
    challengeInfo.githubLink = githubLink;
  }
  return postChallenge(
    '/external/project-completed',
    username,
    csrfToken,
    challengeInfo
  );
}

function submitBackendChallenge(type, state) {
  const tests = challengeTestsSelector(state);
  if (tests.length > 0 && tests.every(test => test.pass && !test.err)) {
    if (type === types.submitChallenge) {
      const { id } = challengeMetaSelector(state);
      const { username } = userSelector(state);
      const solution = backendFormValuesSelector(state, 'solution');
      const challengeInfo = { id, solution };
      return postChallenge(
        '/external/backend-challenge-completed',
        username,
        csrfToken,
        challengeInfo
      );
    }
  }
  return empty();
}

const submitters = {
  tests: submitModern,
  backend: submitBackendChallenge,
  'project.frontEnd': submitProject,
  'project.backEnd': submitProject
};

function shouldShowDonate(state) {
  return shouldShowDonationSelector(state) ? of(openDonationModal()) : empty();
}

export default function completionEpic(action$, state$) {
  return action$.pipe(
    ofType(types.submitChallenge),
    switchMap(({ type }) => {
      const state = state$.value;
      const meta = challengeMetaSelector(state);
      const { isDonating } = userSelector(state);
      const { nextChallengePath, introPath, challengeType } = meta;
      const showDonate = isDonating ? empty() : shouldShowDonate(state);
      const closeChallengeModal = of(closeModal('completion'));
      let submitter = () => of({ type: 'no-user-signed-in' });
      if (
        !(challengeType in submitTypes) ||
        !(submitTypes[challengeType] in submitters)
      ) {
        throw new Error(
          'Unable to find the correct submit function for challengeType ' +
            challengeType
        );
      }
      if (isSignedInSelector(state)) {
        submitter = submitters[submitTypes[challengeType]];
      }

      return concat(
        submitter(type, state).pipe(
          tap(() => navigate(introPath ? introPath : nextChallengePath))
        ),
        closeChallengeModal,
        showDonate
      ).pipe(
        filter(Boolean)
      );
    })
  );
}
