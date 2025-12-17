
import { Message, Role } from "../types";

export const generateMarkdownExport = (messages: Message[]): string => {
  const date = new Date().toLocaleString();
  let markdown = `# Historial de Chat - Gemini Code Sidecar\n**Fecha:** ${date}\n\n---\n\n`;

  messages.forEach(msg => {
    if (msg.role === Role.SYSTEM) {
      markdown += `> **System**: ${msg.content}\n\n`;
      return;
    }

    const roleTitle = msg.role === Role.USER ? "👤 User" : "🤖 Model";
    
    markdown += `## ${roleTitle}\n\n`;
    
    // Listar adjuntos si existen
    if (msg.attachments && msg.attachments.length > 0) {
        markdown += `**Adjuntos:**\n`;
        msg.attachments.forEach(att => {
            markdown += `- [Adjunto: ${att.name}] (${att.mimeType})\n`;
        });
        markdown += `\n`;
    }

    markdown += `${msg.content}\n\n`;
    
    // Incluir metadatos de grounding si existen (fuentes)
    if (msg.groundingMetadata?.groundingChunks) {
       const links = msg.groundingMetadata.groundingChunks
           .filter(c => c.web?.uri)
           .map(c => `- [${c.web?.title || 'Fuente'}](${c.web?.uri})`)
           .join('\n');
       
       if (links) {
           markdown += `**Fuentes:**\n${links}\n\n`;
       }
    }

    markdown += `---\n\n`;
  });

  return markdown;
};

export const downloadMarkdown = (content: string, filename: string = 'chat-history.md') => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
