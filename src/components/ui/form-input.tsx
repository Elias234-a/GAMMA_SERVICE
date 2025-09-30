import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`form-input w-full px-4 py-3 rounded-lg transition-all duration-200 ${className}`}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  required = false,
  error,
  helpText,
  options,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`form-input w-full px-4 py-3 rounded-lg transition-all duration-200 dropdown-menu ${className}`}
      >
        {children || options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
            className="dropdown-option bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`form-input w-full px-4 py-3 rounded-lg transition-all duration-200 resize-vertical ${className}`}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-400">{helpText}</p>
      )}
    </div>
  );
};