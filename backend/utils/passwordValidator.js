/**
 * Validador de contraseñas robustas
 * Implementa política de seguridad estricta
 */

const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommon: true,
  preventUserInfo: true
};

// Lista de contraseñas comunes prohibidas
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'abc123', 'monkey',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
  'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', 'superman', 'qazwsx', 'michael', 'Football',
  'admin', 'administrator', 'root', 'toor', 'pass'
];

/**
 * Valida si una contraseña cumple con la política de seguridad
 * @param {string} password - Contraseña a validar
 * @param {Object} userInfo - Información del usuario (opcional)
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password, userInfo = {}) => {
  const errors = [];

  // Verificar que existe
  if (!password) {
    return {
      valid: false,
      errors: ['La contraseña es requerida']
    };
  }

  // Longitud mínima
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`La contraseña debe tener al menos ${PASSWORD_CONFIG.minLength} caracteres`);
  }

  // Longitud máxima
  if (password.length > PASSWORD_CONFIG.maxLength) {
    errors.push(`La contraseña no puede exceder ${PASSWORD_CONFIG.maxLength} caracteres`);
  }

  // Letra mayúscula
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // Letra minúscula
  if (PASSWORD_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  // Número
  if (PASSWORD_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  // Carácter especial
  if (PASSWORD_CONFIG.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
  }

  // Prevenir contraseñas comunes
  if (PASSWORD_CONFIG.preventCommon) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
      errors.push('Esta contraseña es demasiado común. Por favor elige una más segura');
    }
  }

  // Prevenir uso de información del usuario
  if (PASSWORD_CONFIG.preventUserInfo && userInfo) {
    const lowerPassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts)) {
        errors.push('La contraseña no debe contener tu email');
      }
    }
    
    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(' ');
      if (nameParts.some(part => part.length > 2 && lowerPassword.includes(part))) {
        errors.push('La contraseña no debe contener tu nombre');
      }
    }
  }

  // Verificar patrones secuenciales
  if (/(.)\1{2,}/.test(password)) {
    errors.push('La contraseña no debe contener caracteres repetidos consecutivamente');
  }

  // Verificar secuencias numéricas
  if (/(?:012|123|234|345|456|567|678|789|890)/.test(password)) {
    errors.push('La contraseña no debe contener secuencias numéricas simples');
  }

  // Verificar secuencias de teclado
  if (/(?:qwerty|asdfgh|zxcvbn|qazwsx)/i.test(password)) {
    errors.push('La contraseña no debe contener secuencias de teclado');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calcula la fortaleza de la contraseña
 * @param {string} password
 * @returns {string} - 'weak', 'medium', 'strong', 'very-strong'
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;

  // Longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complejidad
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;

  // Diversidad de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 1;
  if (uniqueChars >= 12) score += 1;

  // Retornar nivel
  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
};

/**
 * Genera sugerencias para mejorar la contraseña
 * @param {string} password
 * @returns {string[]}
 */
export const getPasswordSuggestions = (password) => {
  const suggestions = [];

  if (password.length < 12) {
    suggestions.push('Usa al menos 12 caracteres para mayor seguridad');
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Agrega letras mayúsculas');
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Agrega letras minúsculas');
  }

  if (!/\d/.test(password)) {
    suggestions.push('Agrega números');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Agrega caracteres especiales (!@#$%...)');
  }

  const uniqueChars = new Set(password).size;
  if (uniqueChars < password.length * 0.7) {
    suggestions.push('Usa una mayor variedad de caracteres');
  }

  return suggestions;
};

/**
 * Verifica si la contraseña ha sido comprometida
 * (Integración con Have I Been Pwned API)
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export const checkIfPwned = async (password) => {
  // Por ahora retorna false, pero se puede integrar con la API de HIBP
  // https://haveibeenpwned.com/API/v3#PwnedPasswords
  return false;
};

export default {
  validatePassword,
  calculatePasswordStrength,
  getPasswordSuggestions,
  checkIfPwned,
  PASSWORD_CONFIG
};
