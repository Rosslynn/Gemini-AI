
import { Message } from "../types";

const STORAGE_KEY = 'gemini_sidecar_history';

declare const chrome: any;

export const saveChatHistory = async (messages: Message[]) => {
  const serialize = (msgs: Message[]) => JSON.stringify(msgs);
  
  // Función auxiliar para guardar con manejo de errores
  const trySave = (key: string, data: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ [key]: data }, () => {
                  if (chrome.runtime.lastError) {
                      reject(chrome.runtime.lastError);
                  } else {
                      resolve();
                  }
              });
          } else {
              try {
                  localStorage.setItem(key, data);
                  resolve();
              } catch (e) {
                  reject(e);
              }
          }
      });
  };

  try {
      // 1. Intentar guardar historial completo (con imágenes)
      await trySave(STORAGE_KEY, serialize(messages));
  } catch (e: any) {
      const errorMsg = e.message || e.toString();
      // Detectar error de cuota (Chrome o LocalStorage)
      if (errorMsg.includes("quota") || errorMsg.includes("exceeded") || errorMsg.includes("MAX_WRITE_OPERATIONS")) {
          console.warn("Gemini Sidecar: Storage quota exceeded. Saving text-only history to prevent data loss.");
          
          // 2. Fallback: Guardar versión "Lite" (sin imágenes base64 pesadas)
          const textOnlyMessages = messages.map(m => {
              // Si tiene adjuntos, creamos una copia limpia sin la data pesada
              if (m.attachments && m.attachments.length > 0) {
                  return {
                      ...m,
                      attachments: m.attachments.map(att => ({
                          ...att,
                          data: '', // Borramos el base64 pesado
                          previewUrl: '' // Borramos la preview
                      }))
                  };
              }
              return m;
          });
          
          try {
              await trySave(STORAGE_KEY, serialize(textOnlyMessages));
          } catch (retryError) {
              console.error("Gemini Sidecar: Critical storage failure.", retryError);
          }
      }
  }
};

export const loadChatHistory = async (): Promise<Message[] | null> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result: any) => {
        if (result[STORAGE_KEY]) {
          try {
            resolve(JSON.parse(result[STORAGE_KEY]));
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  } else {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  }
};

export const clearChatHistory = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise<void>((resolve) => {
            chrome.storage.local.remove([STORAGE_KEY], () => resolve());
        });
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}
