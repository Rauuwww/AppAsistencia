import { useState, useCallback } from 'react';

const useValidation = (initialValues = {}) => {
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState(initialValues);

  // Validaciones comunes
  const validators = {
    required: (value) => value && value.trim().length > 0 ? null : 'Este campo es requerido',
    
    minLength: (min) => (value) => 
      value && value.length >= min ? null : `Mínimo ${min} caracteres`,
    
    maxLength: (max) => (value) => 
      value && value.length <= max ? null : `Máximo ${max} caracteres`,
    
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Email inválido';
    },
    
    phone: (value) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/\s/g, '')) ? null : 'Teléfono inválido';
    },
    
    number: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 ? null : 'Debe ser un número válido';
    },
    
    positiveNumber: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0 ? null : 'Debe ser un número positivo';
    }
  };

  // Validar un campo específico
  const validateField = useCallback((name, value, rules = []) => {
    for (const rule of rules) {
      let validator;
      let params;

      if (typeof rule === 'string') {
        validator = validators[rule];
      } else if (typeof rule === 'object') {
        validator = validators[rule.type];
        params = rule.params;
      }

      if (validator) {
        const error = params ? validator(params)(value) : validator(value);
        if (error) {
          return error;
        }
      }
    }
    return null;
  }, []);

  // Validar todo el formulario
  const validateForm = useCallback((validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field], validationRules[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Actualizar valor de un campo
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Actualizar múltiples valores
  const setValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Limpiar formulario
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    setValue,
    setValues,
    validateField,
    validateForm,
    clearErrors,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};

export default useValidation;