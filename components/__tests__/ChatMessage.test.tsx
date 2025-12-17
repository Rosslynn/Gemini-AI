
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';
import { Role, Message } from '../../types';
import { ToastProvider } from '../Toast';
import { LanguageProvider } from '../../contexts/LanguageContext';
import React from 'react';
import '@testing-library/jest-dom';

// Mocks para librerías pesadas de renderizado
vi.mock('react-markdown', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>
}));
vi.mock('react-syntax-highlighter', () => ({
    Prism: ({ children }: { children: React.ReactNode }) => <pre data-testid="code-block">{children}</pre>
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <LanguageProvider>
            <ToastProvider>
                {ui}
            </ToastProvider>
        </LanguageProvider>
    );
};

describe('ChatMessage Component', () => {
    const originalLanguage = window.navigator.language;

    beforeEach(() => {
        // Forzamos español para coincidir con los textos esperados en los tests
        Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
    });

    afterEach(() => {
        Object.defineProperty(window.navigator, 'language', { value: originalLanguage, configurable: true });
    });

    const mockMessage: Message = {
        id: '123',
        role: Role.MODEL,
        content: 'Hola mundo'
    };

    it('renderiza el contenido del mensaje', () => {
        renderWithProviders(<ChatMessage message={mockMessage} />);
        expect(screen.getByText('Hola mundo')).toBeInTheDocument();
    });

    it('renderiza adjuntos de imagen y responde al click', () => {
        const onImageClick = vi.fn();
        const msgWithImg: Message = {
            ...mockMessage,
            role: Role.USER, // Los adjuntos se muestran diferente si es user
            attachments: [{
                id: 'att1',
                name: 'test.png',
                mimeType: 'image/png',
                data: 'base64...',
                previewUrl: 'http://test.com/img.png'
            }]
        };

        renderWithProviders(<ChatMessage message={msgWithImg} onImageClick={onImageClick} />);

        const img = screen.getByAltText(/Miniatura adjunta: test.png/i);
        expect(img).toBeInTheDocument();

        fireEvent.click(img);
        expect(onImageClick).toHaveBeenCalledWith('http://test.com/img.png');
    });

    it('muestra el indicador de "Thinking" cuando corresponde', () => {
        const thinkingMsg: Message = { ...mockMessage, isThinking: true };
        renderWithProviders(<ChatMessage message={thinkingMsg} />);
        
        // Buscamos por el aria-label definido en el componente
        expect(screen.getByLabelText('Gemini está pensando')).toBeInTheDocument();
    });

    it('renderiza fuentes de grounding si existen', () => {
        const groundingMsg: Message = {
            ...mockMessage,
            groundingMetadata: {
                groundingChunks: [{
                    web: { uri: 'https://google.com', title: 'Google Search' }
                }]
            }
        };

        renderWithProviders(<ChatMessage message={groundingMsg} />);
        expect(screen.getByText('Google Search')).toBeInTheDocument();
        expect(screen.getByText('Google Search').closest('a')).toHaveAttribute('href', 'https://google.com');
    });
});
