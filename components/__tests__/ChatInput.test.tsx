
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '../ChatInput';
import { LanguageProvider } from '../../contexts/LanguageContext';
import React from 'react';
import '@testing-library/jest-dom';

const renderInput = (props: any) => {
    return render(
        <LanguageProvider>
            <ChatInput 
                value="" 
                onChange={() => {}} 
                onSend={() => {}} 
                onStop={() => {}} 
                isLoading={false}
                onScreenshot={() => {}}
                onAttach={() => {}}
                useSearch={false}
                onToggleSearch={() => {}}
                onOpenTemplates={() => {}}
                hasAttachments={false}
                {...props} 
            />
        </LanguageProvider>
    );
};

describe('ChatInput Component', () => {
    const originalLanguage = window.navigator.language;

    beforeEach(() => {
        // Forzamos español para que los tests encuentren los textos hardcodeados (Enviar, Detener, etc)
        Object.defineProperty(window.navigator, 'language', { value: 'es-ES', configurable: true });
    });

    afterEach(() => {
        Object.defineProperty(window.navigator, 'language', { value: originalLanguage, configurable: true });
    });

    it('permite escribir texto', () => {
        const handleChange = vi.fn();
        renderInput({ onChange: handleChange, value: '' });

        const textarea = screen.getByPlaceholderText(/Escribe o pega código/i);
        fireEvent.change(textarea, { target: { value: 'Hola' } });

        expect(handleChange).toHaveBeenCalledWith('Hola');
    });

    it('deshabilita el botón de enviar si está vacío y sin adjuntos', () => {
        renderInput({ value: '', hasAttachments: false });
        const sendBtn = screen.getByLabelText('Enviar');
        expect(sendBtn).toBeDisabled();
    });

    it('habilita el botón de enviar si hay texto', () => {
        renderInput({ value: 'Hola', hasAttachments: false });
        const sendBtn = screen.getByLabelText('Enviar');
        expect(sendBtn).not.toBeDisabled();
    });

    it('muestra botón de stop cuando está cargando', () => {
        const handleStop = vi.fn();
        renderInput({ isLoading: true, onStop: handleStop });
        
        const stopBtn = screen.getByLabelText('Detener');
        expect(stopBtn).toBeInTheDocument();
        
        fireEvent.click(stopBtn);
        expect(handleStop).toHaveBeenCalled();
    });

    it('cambia el estilo visual cuando está escuchando (micrófono)', () => {
        renderInput({ isListening: true });
        // Verificamos que el contenedor tenga la clase de escucha (indirectamente via placeholder que cambia)
        expect(screen.getByPlaceholderText(/Escuchando/i)).toBeInTheDocument();
    });
});
