
import { useState, useEffect, useRef, useCallback } from 'react';

declare const chrome: any;

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasSupport: boolean;
  error: string | null;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSupport, setHasSupport] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSupport(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        let currentFinal = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          }
        }
        if (currentFinal) {
            setTranscript(prev => prev ? `${prev} ${currentFinal}` : currentFinal);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            setError('Permiso denegado. Haz clic en el candado de la barra de direcciones o abre la extensión en una pestaña completa.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setError('Error de voz: ' + event.error);
        }
        setIsListening(false);
      };
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    if (!recognitionRef.current) return;
    if (isListening) return;

    try {
        // En extensiones (SidePanel), a veces el prompt no salta automáticamente con SpeechRecognition.
        // Forzamos getUserMedia para disparar la burbuja de permisos del navegador.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Si llegamos aquí, tenemos permiso. Cerramos el stream (SpeechRecog usa el suyo propio).
        stream.getTracks().forEach(track => track.stop());

        recognitionRef.current.start();
        setIsListening(true);
    } catch (err: any) {
        console.error('Mic Error:', err);
        setIsListening(false);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             // Si estamos en una extensión y falla, sugerimos abrir en pestaña nueva para configurar
             if (typeof chrome !== 'undefined' && chrome.tabs && confirm("El acceso al micrófono está bloqueado en el panel lateral.\n\n¿Quieres abrir la configuración en una nueva pestaña para permitirlo?")) {
                 chrome.tabs.create({ url: 'chrome://settings/content/microphone' });
             } else {
                 setError('Permiso denegado. Revisa el icono del candado en la barra superior.');
             }
        } else {
             setError('No se pudo acceder al micrófono: ' + err.message);
        }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport,
    error
  };
};