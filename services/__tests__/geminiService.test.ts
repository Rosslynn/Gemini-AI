
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamGeminiResponse } from '../geminiService';
import { ModelType, Role } from '../../types';

// Mock del SDK de Google
const mockSendMessageStream = vi.fn();
const mockChatsCreate = vi.fn(() => ({
    sendMessageStream: mockSendMessageStream
}));

vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn(() => ({
        chats: {
            create: mockChatsCreate
        }
    }))
}));

describe('GeminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('envía mensaje y procesa stream de texto correctamente', async () => {
        // Mock stream generator
        async function* streamGenerator() {
            yield { candidates: [{ content: { parts: [{ text: 'Hola' }] } }] };
            yield { candidates: [{ content: { parts: [{ text: ' Mundo' }] } }] };
        }
        mockSendMessageStream.mockReturnValue(streamGenerator());

        const onChunk = vi.fn();
        await streamGeminiResponse(
            'fake-key',
            'system instruction',
            'Hola',
            '', // context
            [], // attachments
            [], // history
            ModelType.FAST,
            false, // useSearch
            onChunk
        );

        expect(mockSendMessageStream).toHaveBeenCalled();
        expect(onChunk).toHaveBeenCalledWith('Hola', undefined, []);
        expect(onChunk).toHaveBeenCalledWith(' Mundo', undefined, []);
    });

    it('inyecta código de contexto en el prompt', async () => {
        mockSendMessageStream.mockReturnValue((async function* () {})());

        await streamGeminiResponse(
            'fake-key',
            '',
            'Explica',
            'const a = 1;',
            [],
            [],
            ModelType.FAST,
            false,
            vi.fn()
        );

        // Verificar arguments de sendMessageStream
        const callArgs = mockSendMessageStream.mock.calls[0][0];
        // El prompt final debe estar en parts
        const sentParts = callArgs.message;
        const textPart = sentParts.find((p: any) => p.text && p.text.includes('CONTEXTO TÉCNICO'));
        
        expect(textPart).toBeDefined();
        expect(textPart.text).toContain('const a = 1;');
    });

    it('extrae imágenes (inlineData) del stream manualmente', async () => {
        async function* streamGenerator() {
            yield { 
                candidates: [{ 
                    content: { 
                        parts: [
                            { text: 'Aquí tienes: ' },
                            { inlineData: { mimeType: 'image/png', data: 'fakebase64' } }
                        ] 
                    } 
                }] 
            };
        }
        mockSendMessageStream.mockReturnValue(streamGenerator());
        const onChunk = vi.fn();

        await streamGeminiResponse(
            'fake-key',
            '',
            'Dibuja algo',
            '',
            [],
            [],
            ModelType.SMART,
            false,
            onChunk
        );

        expect(onChunk).toHaveBeenCalled();
        const lastCall = onChunk.mock.calls[0];
        // text, grounding, images
        expect(lastCall[0]).toBe('Aquí tienes: ');
        expect(lastCall[2]).toHaveLength(1);
        expect(lastCall[2][0].mimeType).toBe('image/png');
    });

    it('lanza error si falta API Key', async () => {
        await expect(streamGeminiResponse(
            '', 
            '', '', '', [], [], ModelType.FAST, false, vi.fn()
        )).rejects.toThrow('API Key faltante');
    });
});
