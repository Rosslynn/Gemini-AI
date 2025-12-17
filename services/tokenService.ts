import { Message } from "../types";

// Umbral de advertencia (80%)
const WARNING_THRESHOLD = 0.8;

export const MAX_CONTEXT_TOKENS = 100000;

export interface TokenUsageStats {
    used: number;
    total: number;
    percentage: number;
    isWarning: boolean;
    isCritical: boolean;
    imageCount: number;
}

/**
 * Estima tokens usando la heurística estándar:
 * 1 token ~= 4 caracteres para texto en inglés/código.
 */
export const estimateTokens = (text: string): number => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
};

/**
 * Calcula el uso de contexto basado en un límite dinámico.
 */
export const calculateContextUsage = (messages: Message[], contextCode: string, maxLimit: number = MAX_CONTEXT_TOKENS): TokenUsageStats => {
    let charCount = 0;
    let imageCount = 0;

    // Contar historial
    messages.forEach(msg => {
        charCount += msg.content.length;
        
        // Estimación: Las imágenes consumen 258 tokens (fijo en Gemini 1.5/2.5) 
        // más un pequeño overhead. Usamos ~1032 caracteres (258 * 4) como proxy.
        if (msg.attachments && msg.attachments.length > 0) {
            imageCount += msg.attachments.length;
            charCount += msg.attachments.length * 1100; 
        }
    });

    // Contar contexto capturado
    charCount += contextCode.length;

    // Agregar overhead de system prompt y estructura JSON (estimado)
    charCount += 1000; 

    const used = estimateTokens(' '.repeat(charCount)); // Hack para usar la fn de estimación
    const percentage = Math.min((used / maxLimit) * 100, 100);

    return {
        used,
        total: maxLimit,
        percentage,
        isWarning: percentage > (WARNING_THRESHOLD * 100),
        isCritical: percentage > 95,
        imageCount
    };
};