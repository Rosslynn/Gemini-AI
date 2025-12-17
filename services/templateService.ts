
import { Template } from "../types";

const STORAGE_KEY = 'gemini_sidecar_templates';

const DEFAULT_TEMPLATES: Template[] = [
    { id: 'def-1', name: '🔍 Explicar Complejidad', content: 'Explica la complejidad temporal y espacial (Big O) del siguiente código:', isDefault: true },
    { id: 'def-2', name: '🛡️ Auditoría de Seguridad', content: 'Analiza este código en busca de vulnerabilidades de seguridad comunes (OWASP):', isDefault: true },
    { id: 'def-3', name: '📚 Generar Documentación', content: 'Genera documentación JSDoc/TSDoc detallada para el siguiente código, incluyendo ejemplos de uso:', isDefault: true },
    { id: 'def-4', name: '⚡ Optimizar React', content: 'Identifica renderizados innecesarios o problemas de performance en este componente React y sugiere optimizaciones:', isDefault: true }
];

declare const chrome: any;

// Helper para abstraer el almacenamiento (podría extraerse a un shared)
const getStorage = (): Promise<Template[] | null> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result: any) => {
                resolve(result[STORAGE_KEY] ? JSON.parse(result[STORAGE_KEY]) : null);
            });
        });
    }
    const item = localStorage.getItem(STORAGE_KEY);
    return Promise.resolve(item ? JSON.parse(item) : null);
};

const setStorage = (templates: Template[]): Promise<void> => {
    const serialized = JSON.stringify(templates);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: serialized }, () => resolve());
        });
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return Promise.resolve();
};

export const getTemplates = async (): Promise<Template[]> => {
    const stored = await getStorage();
    if (!stored || stored.length === 0) {
        return DEFAULT_TEMPLATES;
    }
    // Fusionar defaults con guardados por si actualizamos la app y hay nuevos defaults
    // Para simplificar, devolvemos lo guardado, asumiendo que el usuario gestiona su lista.
    // Si el usuario borró todo, quizás quiera los defaults de nuevo.
    return stored;
};

export const saveTemplate = async (template: Template): Promise<void> => {
    const current = await getTemplates();
    const existingIndex = current.findIndex(t => t.id === template.id);
    
    let updated;
    if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = template;
    } else {
        updated = [...current, template];
    }
    await setStorage(updated);
};

export const deleteTemplate = async (id: string): Promise<void> => {
    const current = await getTemplates();
    const updated = current.filter(t => t.id !== id);
    await setStorage(updated);
};

export const resetTemplates = async (): Promise<void> => {
    await setStorage(DEFAULT_TEMPLATES);
};
