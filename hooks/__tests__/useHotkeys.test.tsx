
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHotkeys } from '../useHotkeys';

describe('useHotkeys', () => {
  const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
  const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe registrar y eliminar el event listener', () => {
    const { unmount } = renderHook(() => useHotkeys([], []));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('debe ejecutar el callback cuando la combinación coincide', () => {
    const callback = vi.fn();
    renderHook(() => useHotkeys([
      { combo: 'ctrl+k', onTrigger: callback }
    ]));

    // Simular evento
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('no debe ejecutar si la combinación no coincide', () => {
    const callback = vi.fn();
    renderHook(() => useHotkeys([
      { combo: 'ctrl+k', onTrigger: callback }
    ]));

    // Simular evento incorrecto (solo 'k')
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: false, bubbles: true });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
  
  it('debe respetar la opción de preventDefault', () => {
      const callback = vi.fn();
      // El hook normaliza 'Escape' a 'esc', por lo que la config debe esperar 'esc'
      renderHook(() => useHotkeys([
        { combo: 'esc', onTrigger: callback, preventDefault: true }
      ]));
  
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      document.dispatchEvent(event);
  
      expect(callback).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
