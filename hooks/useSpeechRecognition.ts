
import { useState, useEffect, useRef, useCallback } from 'react';

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
      recognitionRef.current.continuous = true; // Seguir escuchando aunque haya pausas
      recognitionRef.current.interimResults = true; // Mostrar resultados mientras habla
      recognitionRef.current.lang = 'es-ES'; // Default a español

      recognitionRef.current.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        
        // Actualizamos el transcript. 
        // Estrategia: Solo guardamos lo final acumulado en el estado `transcript` cuando ocurre.
        // Pero para dar feedback "vivo", concatenamos interim al final si existe.
        // Nota: React state updates pueden ser asíncronos, aquí simplificamos añadiendo el texto final.
        if (currentFinal) {
            setTranscript(prev => {
                // Evitar duplicar si el evento se dispara múltiple veces con el mismo final (raro pero posible)
                return prev ? `${prev} ${currentFinal}` : currentFinal;
            });
        }
        
        // TODO: Manejar interim para feedback visual inmediato si se desea en el futuro.
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
            setError('Permiso de micrófono denegado. Verifica la configuración.');
        } else if (event.error === 'no-speech') {
            // Ignorar silencio
        } else if (event.error === 'aborted') {
            setIsListening(false);
        } else {
            setError('Error en reconocimiento de voz: ' + event.error);
            setIsListening(false);
        }
      };
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    
    if (!recognitionRef.current) return;
    if (isListening) return;

    try {
        // 1. CRUCIAL: Solicitar permiso explícitamente vía getUserMedia.
        // Esto fuerza al navegador a mostrar el popup de permisos si no se ha concedido aún.
        // SpeechRecognition por sí solo a veces falla silenciosamente en contextos como SidePanel/Iframes.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Inmediatamente detenemos los tracks, ya que SpeechRecognition maneja su propio stream.
        // Solo queríamos el permiso.
        stream.getTracks().forEach(track => track.stop());

        // 2. Iniciar reconocimiento
        recognitionRef.current.start();
        setIsListening(true);
    } catch (err: any) {
        console.error('Error requesting microphone permission:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setError('Permiso de micrófono denegado. Por favor permítelo en el icono de la barra de dirección.');
        } else if (err.name === 'NotFoundError') {
             setError('No se detectó ningún micrófono.');
        } else {
             setError('No se pudo acceder al micrófono: ' + err.message);
        }
        setIsListening(false);
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
