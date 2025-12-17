
import { describe, it, expect } from 'vitest';
import { estimateTokens, calculateContextUsage, MAX_CONTEXT_TOKENS } from '../tokenService';
import { Message, Role } from '../../types';

describe('TokenService', () => {
  it('estima correctamente los tokens basándose en caracteres (heurística)', () => {
    // Aproximación común: 1 token ~= 4 caracteres en inglés/código
    const text = "function hello() { return 'world'; }"; // 36 chars
    const tokens = estimateTokens(text);
    // 36 / 4 = 9. Permitimos un margen de error pequeño en el test
    expect(tokens).toBeGreaterThanOrEqual(8);
    expect(tokens).toBeLessThanOrEqual(10);
  });

  it('calcula el uso total del contexto incluyendo historial y adjuntos', () => {
    const messages: Message[] = [
      { id: '1', role: Role.USER, content: 'Hola' }, // ~1 token
      { id: '2', role: Role.MODEL, content: 'Mundo' } // ~1 token
    ];
    const contextCode = "const a = 1;"; // ~3 tokens
    
    // Total esperado: ~5 tokens + overhead de estructura
    const usage = calculateContextUsage(messages, contextCode);
    expect(usage.used).toBeGreaterThan(0);
    expect(usage.total).toBe(MAX_CONTEXT_TOKENS);
    expect(usage.percentage).toBeGreaterThan(0);
  });

  it('detecta estado crítico cuando nos acercamos al límite', () => {
    // Generamos un string gigante para superar el 95%
    // MAX_CONTEXT_TOKENS tokens ~= 4 * MAX chars.
    // Necesitamos > 95%. 3.5 * MAX_CONTEXT_TOKENS es ~87.5% de la capacidad en chars.
    // Usamos 3.9 para asegurar > 95%.
    const hugeText = 'a'.repeat(MAX_CONTEXT_TOKENS * 3.9); 
    const messages: Message[] = [{ id: '1', role: Role.USER, content: hugeText }];
    
    const usage = calculateContextUsage(messages, '');
    expect(usage.isCritical).toBe(true);
  });
});
