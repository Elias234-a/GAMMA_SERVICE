import { useTranslation } from 'react-i18next';

type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
};

export const useFormValidation = () => {
  const { t } = useTranslation();

  const validateField = (value: string, rules: ValidationRules): string | null => {
    if (rules.required && !value.trim()) {
      return t('form.required');
    }

    if (rules.minLength && value.length < rules.minLength) {
      return t('form.minLength', { count: rules.minLength });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return t('form.maxLength', { count: rules.maxLength });
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return t('form.invalidEmail');
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  };

  return { validateField };
};

export default useFormValidation;
