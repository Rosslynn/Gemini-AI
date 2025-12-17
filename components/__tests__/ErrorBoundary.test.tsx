
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { LanguageProvider } from '../../contexts/LanguageContext';
import React from 'react';
import '@testing-library/jest-dom';

// Componente bomba para simular error
const Bomb = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('💥 BOOM');
  }
  return <div>Todo bien</div>;
};

// Helper para envolver con contexto
const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
};

describe('ErrorBoundary', () => {
  // Suprimir console.error para que el output del test sea limpio
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    // Forzar idioma español para que coincida con las expectativas "Algo salió mal"
    Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
    localStorage.clear();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it('renderiza los hijos cuando no hay error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('muestra la UI de fallback cuando hay un error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/💥 BOOM/i)).toBeInTheDocument();
  });

  it('permite intentar recuperar el estado', () => {
    renderWithProviders(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadBtn = screen.getByRole('button', { name: /Recargar Aplicación/i });
    expect(reloadBtn).toBeInTheDocument();
  });
});
