import React from 'react';
import { kebabCase, startCase } from 'lodash';
import { Field, fieldPropTypes } from 'redux-form';
import PropTypes from 'prop-types';
import {
  Alert,
  Col,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';

import './form-fields.css';

const propTypes = {
  ...fieldPropTypes,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  type: PropTypes.string
};

function renderField(props) {
  const {
    input: { name, value, onChange },
    meta: { pristine, error },
    placeholder,
    required,
    type
  } = props;
  const key = kebabCase(name);
  return (
    <div className='inline-form-field'>
      <Col sm={3} xs={12}>
        {type === 'hidden' ? null : (
          <ControlLabel htmlFor={key}>{startCase(name)}</ControlLabel>
        )}
      </Col>
      <Col sm={9} xs={12}>
        <FormControl
          bsSize='lg'
          componentClass={type === 'textarea' ? type : 'input'}
          id={key}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          type={type}
          value={value}
        />
        { !!error && !pristine ? (
          <HelpBlock>
            <Alert bsStyle='danger'>{error}</Alert>
          </HelpBlock>
        ) : null}
      </Col>
    </div>
  );
}

// renderField.displayName = 'Field';
renderField.propTypes = propTypes;

const formPropTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  options: PropTypes.shape({
    ignored: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.bool,
    required: PropTypes.arrayOf(PropTypes.string),
    types: PropTypes.objectOf(PropTypes.string)
  })
};

function FormFields(props) {
  const { fields, options = {} } = props;
  const {
    ignored = [],
    placeholder = true,
    required = [],
    types = {}
  } = options;
  return (
    <div>
      {fields
        .filter(field => !ignored.includes(field))
        .map(name => {
          const type = name in types ? types[name] : 'text';
          const key = kebabCase(name);
          return (
            <Field
              component={renderField}
              key={key}
              name={name}
              props={{
                placeholder: placeholder ? name : '',
                required: required.includes(name),
                type
              }}
            />
          );
        })}
    </div>
  );
}

FormFields.displayName = 'FormFields';
FormFields.propTypes = formPropTypes;

export default FormFields;
