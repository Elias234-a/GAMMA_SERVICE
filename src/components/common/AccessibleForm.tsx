import React, { FormHTMLAttributes, ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

interface AccessibleFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  role?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Componente de formulario accesible que implementa las mejores prácticas de accesibilidad
 */
export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  title,
  description,
  onSubmit,
  className = '',
  role = 'form',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Aplicar navegación por teclado al formulario
  useKeyboardNavigation(formRef as React.RefObject<HTMLElement>);

  // Generar IDs únicos si no se proporcionan
  const titleId = ariaLabelledBy || `form-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description && !ariaDescribedBy 
    ? `form-description-${Math.random().toString(36).substr(2, 9)}` 
    : ariaDescribedBy;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      noValidate
      {...props}
    >
      <h2 id={titleId} className="text-2xl font-bold mb-4">
        {typeof title === 'string' ? t(title, title) : title}
      </h2>
      
      {description && (
        <p id={descriptionId} className="text-gray-600 mb-6">
          {typeof description === 'string' ? t(description, description) : description}
        </p>
      )}

      <div className="space-y-4">
        {children}
      </div>
    </form>
  );
};

export default AccessibleForm;
