import { useEffect } from 'react';

/**
 * Hook para manejar la navegación por teclado de manera accesible
 * @param ref - Referencia al elemento contenedor
 * @param selector - Selector CSS para los elementos navegables (por defecto: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
 */
export const useKeyboardNavigation = (
  ref: React.RefObject<HTMLElement>,
  selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Obtener todos los elementos enfocables dentro del contenedor
    const focusableElements = Array.from(
      element.querySelectorAll<HTMLElement>(selector)
    ).filter(el => {
      // Filtrar elementos visibles y no deshabilitados
      return !el.hasAttribute('disabled') && 
             !el.getAttribute('aria-hidden') &&
             getComputedStyle(el).display !== 'none';
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo manejamos la tecla Tab
      if (e.key !== 'Tab') return;

      // Si no hay elementos enfocables, no hacemos nada
      if (focusableElements.length === 0) return;

      const activeElement = document.activeElement as HTMLElement;
      const isTabPressed = e.key === 'Tab';

      if (!isTabPressed) return;

      // Si se presiona Shift + Tab
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } 
      // Si solo se presiona Tab
      else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Agregar el manejador de eventos al contenedor
    element.addEventListener('keydown', handleKeyDown);

    // Limpiar el manejador de eventos al desmontar
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, selector]);
};
