
import { describe, it, expect } from 'vitest';
import { generateMarkdownExport } from '../exportService';
import { Message, Role } from '../../types';

describe('ExportService', () => {
  it('debe generar un string Markdown válido a partir del historial', () => {
    const mockMessages: Message[] = [
      { id: '1', role: Role.USER, content: 'Hola Gemini' },
      { id: '2', role: Role.MODEL, content: 'Hola Dev, ¿en qué puedo ayudarte?' },
      { id: '3', role: Role.SYSTEM, content: 'Error de conexión' } // System debería ignorarse o formatearse distinto
    ];

    const markdown = generateMarkdownExport(mockMessages);

    // Verificaciones
    expect(markdown).toContain('# Historial de Chat - Gemini Code Sidecar');
    expect(markdown).toContain('## 👤 User');
    expect(markdown).toContain('Hola Gemini');
    expect(markdown).toContain('## 🤖 Model');
    expect(markdown).toContain('Hola Dev, ¿en qué puedo ayudarte?');
    // Aseguramos que el contenido del sistema se maneja (o se omite según diseño, aquí lo incluiremos como nota)
    expect(markdown).toContain('> **System**: Error de conexión');
  });

  it('debe manejar mensajes con adjuntos en el texto', () => {
    const mockMessages: Message[] = [
      { 
        id: '1', 
        role: Role.USER, 
        content: 'Analiza esto', 
        attachments: [{ id: 'a1', name: 'foto.png', mimeType: 'image/png', data: '', previewUrl: '' }] 
      }
    ];

    const markdown = generateMarkdownExport(mockMessages);
    expect(markdown).toContain('[Adjunto: foto.png]');
  });
});
