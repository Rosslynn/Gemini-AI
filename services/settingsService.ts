
// Este servicio maneja la persistencia segura de la API Key y configuraciones.
// Usa chrome.storage.sync para que la clave viaje cifrada con la cuenta de Google del usuario.

export interface UserSettings {
  apiKey: string;
  systemInstruction: string;
  contextLimit: number;
  autoPruneImages: boolean;
}

declare const chrome: any;

const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

// DEFAULT SYSTEM PROMPT
export const DEFAULT_SYSTEM_INSTRUCTION = `Actúa como un Arquitecto de Software Frontend de Clase Mundial. Eres un genio competitivo obsesionado con la excelencia técnica y el "State of the Art" (siempre estás estudiando lo último).

TUS SUPERPODERES:
1. **Dominio Total de Modyo**: Conoces la plataforma mejor que nadie. Eres experto en arquitectura de Micro-frontends en Modyo, Widgets, Liquid Markup, Content API y Modyo CLI. Integras React/Vue dentro de Modyo con elegancia absoluta.
2. **Frontend de Vanguardia**: React 19, TypeScript Avanzado, Performance (Core Web Vitals), CSS Moderno y Arquitectura Hexagonal en el cliente.
3. **Calidad Obsesiva**: Tu código es SOLID, Clean Code y testeable por defecto. Odias la deuda técnica.
4. **Capacidades Visuales**: Tienes habilitada la generación de imágenes. Si te piden un diagrama, un logo o una imagen, genérala visualmente.

TU PERSONALIDAD:
- Eres directo, técnico y extremadamente competente.
- No das soluciones "parche", das soluciones de arquitectura.
- Si ves código mediocre, lo refactorizas para que sea brillante.
- Respondes con autoridad y precisión. Eres el "Genio entre genios".

FORMATO:
- Usa Markdown.
- Si escribes código, especifica siempre el lenguaje y el path sugerido.`;

// Default Context Limit (100k es seguro para free tier y latencia UI)
export const DEFAULT_CONTEXT_LIMIT = 100000;

export const getApiKey = async (): Promise<string | null> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey'], (result: any) => {
        resolve(result.apiKey || null);
      });
    });
  }
  return localStorage.getItem('apiKey');
};

export const setApiKey = async (key: string): Promise<void> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ apiKey: key }, () => resolve());
    });
  }
  localStorage.setItem('apiKey', key);
};

export const getSystemInstruction = async (): Promise<string> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['systemInstruction'], (result: any) => {
        resolve(result.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION);
      });
    });
  }
  return localStorage.getItem('systemInstruction') || DEFAULT_SYSTEM_INSTRUCTION;
};

export const setSystemInstruction = async (instruction: string): Promise<void> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ systemInstruction: instruction }, () => resolve());
    });
  }
  localStorage.setItem('systemInstruction', instruction);
};

// --- Context Configuration ---

export const getContextConfig = async (): Promise<{ limit: number, autoPrune: boolean }> => {
    if (isExtension) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['contextLimit', 'autoPruneImages'], (result: any) => {
                resolve({
                    limit: result.contextLimit || DEFAULT_CONTEXT_LIMIT,
                    autoPrune: result.autoPruneImages !== undefined ? result.autoPruneImages : false // Default off para no sorprender
                });
            });
        });
    }
    const limit = localStorage.getItem('contextLimit');
    const autoPrune = localStorage.getItem('autoPruneImages');
    return {
        limit: limit ? parseInt(limit) : DEFAULT_CONTEXT_LIMIT,
        autoPrune: autoPrune === 'true'
    };
};

export const setContextConfig = async (limit: number, autoPrune: boolean): Promise<void> => {
    if (isExtension) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ contextLimit: limit, autoPruneImages: autoPrune }, () => resolve());
        });
    }
    localStorage.setItem('contextLimit', limit.toString());
    localStorage.setItem('autoPruneImages', autoPrune.toString());
};

export const removeApiKey = async (): Promise<void> => {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(['apiKey'], () => resolve());
    });
  }
  localStorage.removeItem('apiKey');
};
