
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveChatHistory, loadChatHistory, clearChatHistory } from '../storageService';
import { Message, Role } from '../../types';

// Mock global chrome
const chromeMock = {
    storage: {
        local: {
            set: vi.fn(),
            get: vi.fn(),
            remove: vi.fn()
        }
    },
    runtime: {
        lastError: null as any
    }
};
vi.stubGlobal('chrome', chromeMock);

describe('StorageService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        chromeMock.runtime.lastError = null;
    });

    const mockMessages: Message[] = [
        { id: '1', role: Role.USER, content: 'Hola', attachments: [{ id: 'a1', name: 'img.png', mimeType: 'image/png', data: 'HUGE_BASE64_STRING', previewUrl: 'blob:...' }] }
    ];

    it('guarda el historial correctamente sin errores', async () => {
        chromeMock.storage.local.set.mockImplementation((data, cb) => cb());
        
        await saveChatHistory(mockMessages);
        
        expect(chromeMock.storage.local.set).toHaveBeenCalledWith(
            expect.objectContaining({ gemini_sidecar_history: expect.stringContaining('HUGE_BASE64_STRING') }),
            expect.any(Function)
        );
    });

    it('ejecuta fallback (borra imágenes) si hay error de cuota', async () => {
        // Primera llamada falla con error de cuota
        chromeMock.storage.local.set.mockImplementationOnce((data, cb) => {
            chromeMock.runtime.lastError = { message: 'QUOTA_BYTES quota exceeded' };
            cb();
        });
        
        // Segunda llamada (fallback) debe tener éxito
        chromeMock.storage.local.set.mockImplementationOnce((data, cb) => {
            chromeMock.runtime.lastError = null; // Éxito
            cb();
        });

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await saveChatHistory(mockMessages);

        // Se debió llamar 2 veces
        expect(chromeMock.storage.local.set).toHaveBeenCalledTimes(2);

        // La segunda llamada NO debe tener el string base64 pesado
        const fallbackCall = chromeMock.storage.local.set.mock.calls[1][0];
        const storedData = JSON.parse(fallbackCall.gemini_sidecar_history);
        
        expect(storedData[0].attachments[0].data).toBe(''); // Base64 borrado
        expect(storedData[0].attachments[0].previewUrl).toBe(''); // Preview borrada
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('quota exceeded'));
        
        consoleSpy.mockRestore();
    });

    it('carga el historial correctamente', async () => {
        const stored = JSON.stringify(mockMessages);
        chromeMock.storage.local.get.mockImplementation((keys, cb) => cb({ gemini_sidecar_history: stored }));

        const loaded = await loadChatHistory();
        expect(loaded).toHaveLength(1);
        expect(loaded?.[0].content).toBe('Hola');
    });
});
