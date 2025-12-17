
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from '../useTranslation';
import { LanguageProvider } from '../../contexts/LanguageContext';
import React from 'react';

// Wrapper para proveer el contexto en los tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('useTranslation', () => {
  const originalLanguage = window.navigator.language;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    // Restaurar idioma original después de cada test
    Object.defineProperty(window.navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
    localStorage.clear();
  });

  it('debe devolver el texto en el idioma por defecto (ES) cuando el navegador es ES', () => {
    // Forzar que el navegador reporte español para este test
    Object.defineProperty(window.navigator, 'language', {
      value: 'es-ES',
      configurable: true,
    });

    const { result } = renderHook(() => useTranslation(), { wrapper });
    
    expect(result.current.t('app.title')).toBe('Code Sidecar'); 
    expect(result.current.language).toBe('es');
  });

  it('debe cambiar de idioma correctamente', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });

  it('debe devolver la key si no encuentra la traducción (fallback)', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    // @ts-ignore - Forzamos una key que no existe para probar fallback
    expect(result.current.t('clave.inexistente')).toBe('clave.inexistente');
  });
});
