
import { useState, useEffect } from 'react';

declare const chrome: any;

export const useExtensionBridge = () => {
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      setIsExtension(true);
    }
  }, []);

  /**
   * Captura el área visible de la pestaña activa como imagen Base64.
   */
  const takeScreenshot = async (): Promise<string | null> => {
      if (!isExtension) {
          alert("La captura de pantalla requiere ejecutar la extensión.");
          return null;
      }
      
      try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab) return null;

          const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 });
          return dataUrl; 
      } catch (error) {
          console.error("Error tomando screenshot:", error);
          return null;
      }
  };

  /**
   * Intenta obtener código (editores/selección).
   */
  const captureCodeFromPage = async (): Promise<string> => {
    if (!isExtension) {
      try {
        const text = await navigator.clipboard.readText();
        return text || "";
      } catch (e) {
        return "";
      }
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return "";

      const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_EDITOR_CONTENT" });
      return response?.code || "";
    } catch (msgError: any) {
       return "";
    }
  };

  /**
   * Obtiene el texto principal de la página (para resumir docs).
   */
  const getPageContentText = async (): Promise<string> => {
      if (!isExtension) return "";
      try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab?.id) return "";
          const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_PAGE_TEXT" });
          return response?.text || "";
      } catch (e) {
          return "";
      }
  }

  return { isExtension, captureCodeFromPage, takeScreenshot, getPageContentText };
};
