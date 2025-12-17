
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from '../SettingsModal';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { getApiKey } from '../../services/settingsService';
import React from 'react';
import '@testing-library/jest-dom';

vi.mock('../../services/settingsService', () => ({
    getSystemInstruction: vi.fn().mockResolvedValue(''),
    getContextConfig: vi.fn().mockResolvedValue({}),
    setApiKey: vi.fn(),
    setSystemInstruction: vi.fn(),
    setContextConfig: vi.fn(),
    DEFAULT_CONTEXT_LIMIT: 100000,
    getApiKey: vi.fn().mockResolvedValue(''), 
}));

const renderSettings = () => {
    return render(
        <LanguageProvider>
            <SettingsModal onSave={vi.fn()} onCancel={vi.fn()} />
        </LanguageProvider>
    );
};

describe('SettingsModal i18n', () => {
    beforeEach(() => {
        // IMPORTANTE: JSDOM defaults a 'en-US'. Forzamos español para que coincida con las expectativas del test.
        Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
        localStorage.clear();
    });

    it('permite cambiar el idioma y actualiza la UI al instante', async () => {
        renderSettings();

        // Esperar a que los efectos asíncronos iniciales (getApiKey, etc) terminen
        await waitFor(() => expect(getApiKey).toHaveBeenCalled());

        // Asumimos default español
        expect(screen.getByText('Configuración')).toBeInTheDocument();
        expect(screen.getByText('General')).toBeInTheDocument();

        // Cambiar a inglés
        const enBtn = screen.getByText('🇺🇸 English');
        fireEvent.click(enBtn);

        // Verificar cambio inmediato
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('General')).toBeInTheDocument(); // Coincide en ambos
        expect(screen.getByText('Context & Tokens')).toBeInTheDocument(); // Este cambia
    });
});
