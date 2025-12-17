
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '../useSpeechRecognition';

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe iniciar la escucha cuando se llama a startListening y hay permisos', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    
    await act(async () => {
      await result.current.startListening();
    });

    // getUserMedia debe haber sido llamado
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    
    // El estado debe reflejar que está escuchando
    expect(result.current.isListening).toBe(true);
  });

  it('debe detener la escucha', async () => {
      const { result } = renderHook(() => useSpeechRecognition());
      
      await act(async () => {
        await result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);

      act(() => {
          result.current.stopListening();
      });
      expect(result.current.isListening).toBe(false);
  });
});
