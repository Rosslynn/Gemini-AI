
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateManager } from '../TemplateManager';
import { ToastProvider } from '../Toast';
import { LanguageProvider } from '../../contexts/LanguageContext';
import React from 'react';
import '@testing-library/jest-dom';

// Mocks
const mockTemplates = [
    { id: '1', name: 'Plantilla 1', content: 'Content 1' },
    { id: '2', name: 'Plantilla 2', content: 'Content 2' }
];

vi.mock('../../services/templateService', () => ({
    getTemplates: vi.fn(() => Promise.resolve(mockTemplates)),
    saveTemplate: vi.fn(() => Promise.resolve()),
    deleteTemplate: vi.fn(() => Promise.resolve())
}));

// Helper para envolver con providers
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            <ToastProvider>
                {ui}
            </ToastProvider>
        </LanguageProvider>
    );
};

describe('TemplateManager UI', () => {
    beforeEach(() => {
        // IMPORTANTE: JSDOM defaults a 'en-US'. Forzamos español para que coincida con las expectativas del test.
        Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
    });

    it('renderiza la lista de plantillas', async () => {
        renderWithProviders(<TemplateManager onSelect={() => {}} onClose={() => {}} />);
        
        await waitFor(() => {
            expect(screen.getByText('Plantilla 1')).toBeInTheDocument();
            expect(screen.getByText('Plantilla 2')).toBeInTheDocument();
        });
    });

    it('llama a onSelect cuando se hace click en una plantilla', async () => {
        const handleSelect = vi.fn();
        renderWithProviders(<TemplateManager onSelect={handleSelect} onClose={() => {}} />);
        
        await waitFor(() => screen.getByText('Plantilla 1'));
        
        fireEvent.click(screen.getByText('Plantilla 1'));
        expect(handleSelect).toHaveBeenCalledWith('Content 1');
    });

    it('cambia a vista de creación al pulsar Nuevo', async () => {
        renderWithProviders(<TemplateManager onSelect={() => {}} onClose={() => {}} />);
        
        // La traducción real es "Nueva Plantilla" (según locales/translations.ts: 'templates.title.create')
        const newBtn = await screen.findByLabelText('Nueva Plantilla');
        fireEvent.click(newBtn);
        
        expect(screen.getByPlaceholderText('Nombre de la plantilla')).toBeInTheDocument();
    });
});
