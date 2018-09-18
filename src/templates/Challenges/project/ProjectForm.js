import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  Form
} from '../../../components/formHelpers';

const propTypes = {
  isFrontEnd: PropTypes.bool,
  openModal: PropTypes.func.isRequired,
  updateProjectForm: PropTypes.func.isRequired
};

const frontEndFields = ['solution'];
const backEndFields = ['solution', 'githubLink'];

const options = {
  types: {
    solution: 'url',
    githubLink: 'url'
  }
};

export class ProjectForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      keysDown: {
        Control: false,
        Enter: false
      }
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    this.props.updateProjectForm({});
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  componentDidUpdate() {
    this.props.updateProjectForm({});
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyDown(e) {
    if (e.key === 'Control') {
      this.setState(state => ({
        ...state,
        keysDown: { ...state.keysDown, Control: true }
      }));
    }
    if (e.key === 'Enter') {
      this.setState(state => ({
        ...state,
        keysDown: { ...state.keysDown, Enter: true }
      }));
    }
  }
  handleKeyUp(e) {
    if (e.key === 'Control') {
      this.setState(state => ({
        ...state,
        keysDown: { ...state.keysDown, Control: false }
      }));
    }
    if (e.key === 'Enter') {
      this.setState(state => ({
        ...state,
        keysDown: { ...state.keysDown, Enter: false }
      }));
    }
  }
  handleSubmit(values) {
    const { keysDown: { Control, Enter } } = this.state;
    if ((Control && Enter) || !Enter) {
      this.props.openModal('completion');
      this.props.updateProjectForm(values);
    }
  }
  render() {
    const { isFrontEnd } = this.props;
    const buttonCopy = "I've completed this challenge";
    return (
      <Form
        buttonText={`${buttonCopy} (Ctrl + Enter)`}
        formFields={isFrontEnd ? frontEndFields : backEndFields}
        id={isFrontEnd ? 'front-end-form' : 'back-end-form'}
        onSubmit={this.handleSubmit}
        options={options}
      />
    );
  }
}

ProjectForm.propTypes = propTypes;

export default ProjectForm;
