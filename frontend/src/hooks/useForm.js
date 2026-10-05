import { useState } from 'react';

/**
 * Simple form state hook - exported from here so components can import from one place.
 */
export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function setValue(name, value) {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValue(name, value);
  }

  function reset(newValues = initialValues) {
    setValues(newValues);
    setErrors({});
  }

  return { values, errors, setErrors, setValue, handleChange, setValues, reset };
}
