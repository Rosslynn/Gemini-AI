
import { Message } from "../types";

const STORAGE_KEY = 'gemini_sidecar_history';

declare const chrome: any;

export const saveChatHistory = async (messages: Message[]) => {
  // Optimizacion: Si hay muchas imágenes base64 grandes, podríamos llenar el storage rápido.
  // Para este MVP, guardamos todo, pero en el futuro moveremos adjuntos a IndexedDB.
  const serialized = JSON.stringify(messages);
  
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: serialized }, () => resolve());
    });
  } else {
    localStorage.setItem(STORAGE_KEY, serialized);
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
