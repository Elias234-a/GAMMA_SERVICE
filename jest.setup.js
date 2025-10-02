import '@testing-library/jest-dom';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        'form.required': 'This field is required',
        'form.invalidEmail': 'Invalid email address',
        'form.minLength': `Must be at least ${options?.count} characters`,
        'form.maxLength': `Must not exceed ${options?.count} characters`,
      };
      return translations[key] || key;
    },
  }),
}));
