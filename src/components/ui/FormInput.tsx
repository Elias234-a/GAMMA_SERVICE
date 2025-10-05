import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: string;
  textOnly?: boolean; // Solo permite letras y espacios
  alphanumeric?: boolean; // Permite letras, números y espacios
  uppercase?: boolean; // Convierte a mayúsculas
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  min,
  max,
  maxLength,
  pattern,
  textOnly = false,
  alphanumeric = false,
  uppercase = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Validación para solo texto (letras, espacios, acentos)
    if (textOnly && type === 'text') {
      newValue = newValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    // Validación para alfanumérico (letras, números, espacios)
    if (alphanumeric && type === 'text') {
      newValue = newValue.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    // Convertir a mayúsculas si está habilitado
    if (uppercase) {
      newValue = newValue.toUpperCase();
    }

    onChange(newValue);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        maxLength={maxLength}
        pattern={pattern}
        className={`
          w-full px-4 py-3 rounded-lg text-white
          bg-white/10 border backdrop-blur-sm
          focus:outline-none focus:ring-2 transition-all
          placeholder-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
            : 'border-white/20 focus:ring-orange-500 focus:border-orange-500'
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
          {error}
        </p>
      )}
    </div>
  );
};

interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 3,
  maxLength
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg text-white
          bg-white/10 border backdrop-blur-sm
          focus:outline-none focus:ring-2 transition-all
          placeholder-gray-400 resize-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
            : 'border-white/20 focus:ring-orange-500 focus:border-orange-500'
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
          {error}
        </p>
      )}
    </div>
  );
};

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...'
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/90 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg text-white
          bg-white/10 border backdrop-blur-sm
          focus:outline-none focus:ring-2 transition-all
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
            : 'border-white/20 focus:ring-orange-500 focus:border-orange-500'
          }
        `}
      >
        <option value="" className="bg-gray-800 text-white">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800 text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
          {error}
        </p>
      )}
    </div>
  );
};
