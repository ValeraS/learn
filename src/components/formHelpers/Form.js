import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, propTypes as reduxFormPropTypes } from 'redux-form';

import { FormFields, BlockSaveButton, BlockSaveWrapper } from './';

const propTypes = {
  buttonText: PropTypes.string,
  enableSubmit: PropTypes.bool,
  formFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  hideButton: PropTypes.bool,
  id: PropTypes.string.isRequired,
  options: PropTypes.shape({
    ignored: PropTypes.arrayOf(PropTypes.string),
    required: PropTypes.arrayOf(PropTypes.string),
    types: PropTypes.objectOf(PropTypes.string)
  })
};

export function DynamicForm({
  // redux-form
  error,
  handleSubmit,
  pristine,
  submitting,
  invalid,

  // HOC
  buttonText,
  enableSubmit,
  hideButton,
  id,
  formFields,
  options
}) {
  return (
    <form
      id={`dynamic-${id}`}
      onSubmit={handleSubmit}
      style={{ width: '100%' }}
      >
      <FormFields fields={formFields} options={options} />
      <BlockSaveWrapper>
        {hideButton ? null : (
          <BlockSaveButton
            disabled={
              (pristine || submitting || invalid) && !enableSubmit ||
              !!error
            }
            >
            {buttonText ? buttonText : null}
          </BlockSaveButton>
        )}
      </BlockSaveWrapper>
    </form>
  );
}

DynamicForm.displayName = 'DynamicForm';
DynamicForm.propTypes = { ...propTypes, ...reduxFormPropTypes};

const DynamicFormWithRedux = reduxForm()(DynamicForm);

export default function Form(props) {
  return (
    <DynamicFormWithRedux
      {...props}
      form={props.id}
    />
  );
}

Form.propTypes = propTypes;
