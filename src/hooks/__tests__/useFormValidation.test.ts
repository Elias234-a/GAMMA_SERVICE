import { renderHook } from '@testing-library/react';

// Mock simple de react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key // Simplemente devolvemos la clave como valor
  })
}));

// Importamos después del mock para que use el mock
import { useFormValidation } from '../useFormValidation';

describe('useFormValidation', () => {
  it('debería retornar null para una entrada válida', () => {
    const { result } = renderHook(() => useFormValidation());
    const { validateField } = result.current;
    
    // Solo probamos el caso más simple
    expect(validateField('test', { required: true })).toBeNull();
  });
});
