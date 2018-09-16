import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { graphql } from 'gatsby';

import { randomCompliment } from '../utils/get-words';

import ChallengeTitle from '../components/Challenge-Title';
import ChallengeDescription from '../components/Challenge-Description';
import TestSuite from '../components/Test-Suite';
import Output from '../components/Output';
import CompletionModal from '../components/CompletionModal';
import HelpModal from '../components/HelpModal';
import ProjectToolPanel from '../project/Tool-Panel';
import {
  createFiles,
  executeChallenge,
  challengeTestsSelector,
  consoleOutputSelector,
  initTests,
  updateChallengeMeta,
  updateSuccessMessage,
  backendNS
} from '../redux';

import {
  Form
} from '../../../components/formHelpers';
import Spacer from '../../../components/util/Spacer';
import { createGuideUrl } from '../utils';

import '../components/tool-panel.css';
import '../components/preview.css';
import '../components/test-suite.css';
import '../classic/classic.css';

const propTypes = {
  createFiles: PropTypes.func.isRequired,
  data: PropTypes.object,
  description: PropTypes.arrayOf(PropTypes.string),
  executeChallenge: PropTypes.func.isRequired,
  id: PropTypes.string,
  initTests: PropTypes.func,
  output: PropTypes.string,
  pageContext: PropTypes.object,
  tests: PropTypes.array,
  title: PropTypes.string,
  updateChallengeMeta: PropTypes.func,
  updateSuccessMessage: PropTypes.func
};

const mapStateToProps = createSelector(
  consoleOutputSelector,
  challengeTestsSelector,
  (output, tests) => ({
    tests,
    output
  }),
);

const mapDispatchToProps = dispatch => (
  bindActionCreators(
    {
      createFiles,
      executeChallenge,
      initTests,
      updateChallengeMeta,
      updateSuccessMessage
    },
    dispatch
  )
);

const formFields = ['solution'];
const options = {
  required: ['solution'],
  types: {
    solution: 'url'
  }
};

export class BackEnd extends PureComponent {
  componentDidMount() {
    const {
      createFiles,
      initTests,
      updateChallengeMeta,
      updateSuccessMessage,
      data: { challengeNode: { fields: { tests }, challengeType } },
      pageContext: { challengeMeta }
    } = this.props;
    createFiles({});
    initTests(tests);
    updateChallengeMeta({ ...challengeMeta, challengeType });
    updateSuccessMessage(randomCompliment());
  }

  componentDidUpdate(prevProps) {
    const { data: { challengeNode: { title: prevTitle } } } = prevProps;
    const {
      createFiles,
      initTests,
      updateChallengeMeta,
      updateSuccessMessage,
      data: {
        challengeNode: { title: currentTitle, fields: { tests }, challengeType }
      },
      pageContext: { challengeMeta }
    } = this.props;
    if (prevTitle !== currentTitle) {
      createFiles({});
      initTests(tests);
      updateChallengeMeta({ ...challengeMeta, challengeType });
      updateSuccessMessage(randomCompliment());
    }
  }

  render() {
    const {
      data: {
        challengeNode: { fields: { blockName, slug }, title, description }
      },
      output,
      tests,
      executeChallenge
    } = this.props;

    // TODO: Should be tied to user.isSignedIn
    const buttonCopy = "I've completed this challenge";
    const blockNameTitle = `${blockName} - ${title}`;
    return (
      <Row>
        <Col xs={6} xsOffset={3}>
          <Spacer />
          <div>
            <ChallengeTitle>{blockNameTitle}</ChallengeTitle>
            <ChallengeDescription description={description} />
          </div>
          <div>
            <Form
              buttonText={buttonCopy + '(Ctrl + Enter)'}
              formFields={formFields}
              id={backendNS}
              onSubmit={executeChallenge}
              options={options}
            />
            <ProjectToolPanel guideUrl={createGuideUrl(slug)} />
          </div>
          <div>
            <br />
            <Output
              defaultOutput={`/**
  *
  * Test output will go here
  *
  *
  */`}
              height={150}
              output={output}
            />
          </div>
          <div>
            <TestSuite tests={tests} />
          </div>
          <Spacer />
        </Col>
        <CompletionModal />
        <HelpModal />
      </Row>
    );
  }
}

BackEnd.displayName = 'BackEnd';
BackEnd.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(BackEnd);

export const query = graphql`
  query BackendChallenge($slug: String!) {
    challengeNode(fields: { slug: { eq: $slug } }) {
      title
      guideUrl
      description
      challengeType
      fields {
        blockName
        slug
        tests {
          text
          testString
        }
      }
    }
  }
`;
