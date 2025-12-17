
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ToastProvider } from '../Toast';
import React from 'react';
import '@testing-library/jest-dom';

// Mocks necesarios para que App levante
vi.mock('../../hooks/useExtensionBridge', () => ({
  useExtensionBridge: () => ({ captureCodeFromPage: vi.fn(), takeScreenshot: vi.fn(), getPageContentText: vi.fn() })
}));

vi.mock('../../services/settingsService', () => ({
  getApiKey: vi.fn().mockResolvedValue('fake-key'),
  getSystemInstruction: vi.fn().mockResolvedValue(''),
  getContextConfig: vi.fn().mockResolvedValue({ limit: 100000, autoPrune: false }),
  setApiKey: vi.fn(),
  setSystemInstruction: vi.fn(),
  setContextConfig: vi.fn(),
  DEFAULT_CONTEXT_LIMIT: 100000
}));

vi.mock('../../services/storageService', () => ({
  loadChatHistory: vi.fn().mockResolvedValue([]),
  saveChatHistory: vi.fn(),
  clearChatHistory: vi.fn()
}));

const renderApp = () => {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  );
};

describe('App Internationalization', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza textos en Español por defecto (si el navegador es ES o default)', async () => {
    // Forzamos idioma del navegador mockeado
    Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
    
    renderApp();
    
    // Esperar a que la app inicialice y quite el splash screen (delay de 500ms en App.tsx)
    await waitFor(() => {
        expect(screen.queryByText('Flash')).toBeInTheDocument(); 
    }, { timeout: 2000 });

    // Verificar textos clave en español
    expect(screen.getByPlaceholderText('Escribe o pega código...')).toBeInTheDocument();
    
    // Verificar tooltips (aria-labels o titles) - Case Sensitive: 'Borrar Historial' en translations.ts
    expect(screen.getByLabelText('Borrar Historial')).toBeInTheDocument();
  });

  it('renderiza textos en Inglés si se configura', async () => {
    Object.defineProperty(window.navigator, 'language', { value: 'en-US', configurable: true });
    
    renderApp();

    await waitFor(() => {
        expect(screen.queryByText('Flash')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByPlaceholderText('Type or paste code...')).toBeInTheDocument();
    // Case Sensitive: 'Clear History' en translations.ts
    expect(screen.getByLabelText('Clear History')).toBeInTheDocument();
  });
});
