// formValidator.js - Form Validation and Input Handling Module
// Provides comprehensive form validation, input sanitization, and error handling

// Validation rules configuration
const VALIDATION_RULES = {
    required: {
        test: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
        message: 'This field is required'
    },
    email: {
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
    },
    minLength: {
        test: (value, minLength) => value.toString().length >= minLength,
        message: (minLength) => `Must be at least ${minLength} characters long`
    },
    maxLength: {
        test: (value, maxLength) => value.toString().length <= maxLength,
        message: (maxLength) => `Must be no more than ${maxLength} characters long`
    },
    pattern: {
        test: (value, pattern) => new RegExp(pattern).test(value),
        message: 'Invalid format'
    },
    numeric: {
        test: (value) => /^\d+$/.test(value),
        message: 'Must contain only numbers'
    },
    alphanumeric: {
        test: (value) => /^[a-zA-Z0-9]+$/.test(value),
        message: 'Must contain only letters and numbers'
    },
    phone: {
        test: (value) => /^\+?[\d\s\-\(\)]+$/.test(value),
        message: 'Please enter a valid phone number'
    },
    date: {
        test: (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date.getFullYear() >= 1900;
        },
        message: 'Please enter a valid date'
    },
    time: {
        test: (value) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
        message: 'Please enter a valid time (HH:MM)'
    },
    fileSize: {
        test: (file, maxSizeMB) => {
            if (!file || !file.size) return true;
            return file.size <= maxSizeMB * 1024 * 1024;
        },
        message: (maxSizeMB) => `File size must be less than ${maxSizeMB}MB`
    },
    fileType: {
        test: (file, allowedTypes) => {
            if (!file || !file.type) return true;
            return allowedTypes.includes(file.type);
        },
        message: (allowedTypes) => `File must be one of: ${allowedTypes.join(', ')}`
    }
};

// Form validation class
export class FormValidator {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            validateOnBlur: true,
            validateOnInput: false,
            showErrorsInline: true,
            errorClass: 'form-error',
            successClass: 'form-success',
            ...options
        };
        
        this.errors = new Map();
        this.validators = new Map();
        this.isValid = true;
        
        this.initialize();
    }
    
    // Initialize form validation
    initialize() {
        if (!this.form) {
            console.error('FormValidator: Form element not found');
            return;
        }
        
        this.setupEventListeners();
        this.scanFormFields();
        
        console.log('📝 Form validator initialized for:', this.form.id || 'unnamed form');
    }
    
    // Set up event listeners
    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        if (this.options.validateOnBlur) {
            this.form.addEventListener('blur', this.handleBlur.bind(this), true);
        }
        
        if (this.options.validateOnInput) {
            this.form.addEventListener('input', this.handleInput.bind(this), true);
        }
        
        // Handle file inputs separately
        this.form.addEventListener('change', this.handleChange.bind(this), true);
    }
    
    // Scan form fields and extract validation rules
    scanFormFields() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            const rules = this.extractValidationRules(field);
            if (rules.length > 0) {
                this.validators.set(field.name || field.id, {
                    element: field,
                    rules: rules
                });
            }
        });
    }
    
    // Extract validation rules from field attributes
    extractValidationRules(field) {
        const rules = [];
        
        // Required
        if (field.hasAttribute('required')) {
            rules.push({ type: 'required' });
        }
        
        // Email
        if (field.type === 'email') {
            rules.push({ type: 'email' });
        }
        
        // Min/Max length
        if (field.hasAttribute('minlength')) {
            rules.push({ 
                type: 'minLength', 
                value: parseInt(field.getAttribute('minlength'))
            });
        }
        
        if (field.hasAttribute('maxlength')) {
            rules.push({ 
                type: 'maxLength', 
                value: parseInt(field.getAttribute('maxlength'))
            });
        }
        
        // Pattern
        if (field.hasAttribute('pattern')) {
            rules.push({ 
                type: 'pattern', 
                value: field.getAttribute('pattern')
            });
        }
        
        // Custom validation attributes
        if (field.hasAttribute('data-validate')) {
            const customRules = field.getAttribute('data-validate').split(',');
            customRules.forEach(rule => {
                const [type, value] = rule.trim().split(':');
                rules.push({ type, value });
            });
        }
        
        // File validation for file inputs
        if (field.type === 'file') {
            if (field.hasAttribute('data-max-size')) {
                rules.push({
                    type: 'fileSize',
                    value: parseFloat(field.getAttribute('data-max-size'))
                });
            }
            
            if (field.hasAttribute('accept')) {
                const acceptedTypes = field.getAttribute('accept').split(',').map(t => t.trim());
                rules.push({
                    type: 'fileType',
                    value: acceptedTypes
                });
            }
        }
        
        return rules;
    }
    
    // Handle form submission
    handleSubmit(event) {
        event.preventDefault();
        
        const isFormValid = this.validateForm();
        
        if (isFormValid) {
            this.onValidSubmit(event);
        } else {
            this.onInvalidSubmit(event);
        }
        
        return isFormValid;
    }
    
    // Handle field blur event
    handleBlur(event) {
        const field = event.target;
        if (this.validators.has(field.name || field.id)) {
            this.validateField(field);
        }
    }
    
    // Handle field input event
    handleInput(event) {
        const field = event.target;
        if (this.validators.has(field.name || field.id)) {
            // Clear previous errors on input
            this.clearFieldError(field);
        }
    }
    
    // Handle field change event (for file inputs)
    handleChange(event) {
        const field = event.target;
        if (field.type === 'file' && this.validators.has(field.name || field.id)) {
            this.validateField(field);
        }
    }
    
    // Validate entire form
    validateForm() {
        this.errors.clear();
        this.isValid = true;
        
        this.validators.forEach((validator, fieldName) => {
            const isFieldValid = this.validateField(validator.element);
            if (!isFieldValid) {
                this.isValid = false;
            }
        });
        
        return this.isValid;
    }
    
    // Validate single field
    validateField(field) {
        const fieldName = field.name || field.id;
        const validator = this.validators.get(fieldName);
        
        if (!validator) {
            return true;
        }
        
        this.clearFieldError(field);
        
        let value = field.type === 'file' ? field.files[0] : field.value;
        const errors = [];
        
        // Run validation rules
        validator.rules.forEach(rule => {
            const validationRule = VALIDATION_RULES[rule.type];
            if (!validationRule) {
                console.warn(`Unknown validation rule: ${rule.type}`);
                return;
            }
            
            let isValid;
            if (rule.value !== undefined) {
                isValid = validationRule.test(value, rule.value);
            } else {
                isValid = validationRule.test(value);
            }
            
            if (!isValid) {
                let message;
                if (typeof validationRule.message === 'function') {
                    message = validationRule.message(rule.value);
                } else {
                    message = validationRule.message;
                }
                errors.push(message);
            }
        });
        
        if (errors.length > 0) {
            this.setFieldError(field, errors);
            return false;
        } else {
            this.setFieldSuccess(field);
            return true;
        }
    }
    
    // Set field error state
    setFieldError(field, errors) {
        const fieldName = field.name || field.id;
        this.errors.set(fieldName, errors);
        
        field.classList.add(this.options.errorClass);
        field.classList.remove(this.options.successClass);
        
        if (this.options.showErrorsInline) {
            this.displayFieldErrors(field, errors);
        }
        
        // Add ARIA attributes for accessibility
        field.setAttribute('aria-invalid', 'true');
        
        const errorId = `${fieldName}-error`;
        field.setAttribute('aria-describedby', errorId);
    }
    
    // Set field success state
    setFieldSuccess(field) {
        const fieldName = field.name || field.id;
        this.errors.delete(fieldName);
        
        field.classList.remove(this.options.errorClass);
        field.classList.add(this.options.successClass);
        
        // Remove ARIA attributes
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        this.removeFieldErrors(field);
    }
    
    // Clear field error state
    clearFieldError(field) {
        field.classList.remove(this.options.errorClass, this.options.successClass);
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        this.removeFieldErrors(field);
    }
    
    // Display field errors inline
    displayFieldErrors(field, errors) {
        this.removeFieldErrors(field);
        
        const fieldName = field.name || field.id;
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-errors';
        errorContainer.id = `${fieldName}-error`;
        errorContainer.setAttribute('role', 'alert');
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error-message';
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });
        
        // Insert after the field or its parent container
        const insertTarget = field.closest('.form-field') || field.parentNode;
        insertTarget.appendChild(errorContainer);
    }
    
    // Remove field error messages
    removeFieldErrors(field) {
        const fieldName = field.name || field.id;
        const existingErrors = document.querySelectorAll(`#${fieldName}-error, .field-errors`);
        existingErrors.forEach(error => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        });
    }
    
    // Get form data as object
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    // Get validation errors
    getErrors() {
        const errorObj = {};
        this.errors.forEach((errors, fieldName) => {
            errorObj[fieldName] = errors;
        });
        return errorObj;
    }
    
    // Check if form has errors
    hasErrors() {
        return this.errors.size > 0;
    }
    
    // Add custom validator
    addValidator(fieldName, validatorFn, errorMessage) {
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (!field) {
            console.warn(`Field not found: ${fieldName}`);
            return;
        }
        
        const validator = this.validators.get(fieldName) || { element: field, rules: [] };
        validator.rules.push({
            type: 'custom',
            test: validatorFn,
            message: errorMessage
        });
        
        this.validators.set(fieldName, validator);
    }
    
    // Remove validator
    removeValidator(fieldName) {
        this.validators.delete(fieldName);
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (field) {
            this.clearFieldError(field);
        }
    }
    
    // Reset form validation state
    reset() {
        this.errors.clear();
        this.isValid = true;
        
        this.validators.forEach(validator => {
            this.clearFieldError(validator.element);
        });
    }
    
    // Event handlers (can be overridden)
    onValidSubmit(event) {
        console.log('✅ Form validation passed');
        // Override this method to handle valid form submission
    }
    
    onInvalidSubmit(event) {
        console.log('❌ Form validation failed:', this.getErrors());
        // Override this method to handle invalid form submission
    }
}

// Utility functions for standalone validation

// Validate single value against rules
export function validateValue(value, rules) {
    const errors = [];
    
    rules.forEach(rule => {
        const validationRule = VALIDATION_RULES[rule.type];
        if (!validationRule) {
            console.warn(`Unknown validation rule: ${rule.type}`);
            return;
        }
        
        let isValid;
        if (rule.value !== undefined) {
            isValid = validationRule.test(value, rule.value);
        } else {
            isValid = validationRule.test(value);
        }
        
        if (!isValid) {
            let message;
            if (typeof validationRule.message === 'function') {
                message = validationRule.message(rule.value);
            } else {
                message = validationRule.message;
            }
            errors.push(message);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Validate file input
export function validateFile(file, options = {}) {
    const {
        maxSizeMB = 20,
        allowedTypes = ['image/*', 'video/*'],
        required = false
    } = options;
    
    const rules = [];
    
    if (required) {
        rules.push({ type: 'required' });
    }
    
    if (maxSizeMB) {
        rules.push({ type: 'fileSize', value: maxSizeMB });
    }
    
    if (allowedTypes.length > 0) {
        rules.push({ type: 'fileType', value: allowedTypes });
    }
    
    return validateValue(file, rules);
}

// Sanitize input value
export function sanitizeInput(value, type = 'text') {
    if (typeof value !== 'string') {
        value = String(value);
    }
    
    switch (type) {
        case 'email':
            return value.toLowerCase().trim();
        case 'phone':
            return value.replace(/[^\d\+\-\(\)\s]/g, '');
        case 'numeric':
            return value.replace(/[^\d]/g, '');
        case 'alphanumeric':
            return value.replace(/[^a-zA-Z0-9]/g, '');
        case 'text':
        default:
            return value.trim();
    }
}

// Format validation error messages
export function formatErrorMessages(errors) {
    if (Array.isArray(errors)) {
        return errors.join(', ');
    }
    if (typeof errors === 'object') {
        return Object.values(errors).flat().join(', ');
    }
    return String(errors);
}

// Create form validator instance
export function createFormValidator(formSelector, options = {}) {
    const form = typeof formSelector === 'string' 
        ? document.querySelector(formSelector)
        : formSelector;
    
    if (!form) {
        console.error('Form not found:', formSelector);
        return null;
    }
    
    return new FormValidator(form, options);
}

// Initialize form validation for all forms with data-validate attribute
export function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    const validators = [];
    
    forms.forEach(form => {
        const options = {
            validateOnBlur: form.getAttribute('data-validate-on-blur') !== 'false',
            validateOnInput: form.getAttribute('data-validate-on-input') === 'true',
            showErrorsInline: form.getAttribute('data-show-errors-inline') !== 'false'
        };
        
        const validator = new FormValidator(form, options);
        validators.push(validator);
    });
    
    console.log(`📝 Initialized form validation for ${validators.length} forms`);
    return validators;
}