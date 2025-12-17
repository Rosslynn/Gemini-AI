
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Role, Message, Attachment } from '../types';
import { Icons } from './Icon';
import { useToast } from './Toast';
import { useTranslation } from '../hooks/useTranslation';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const isUser = message.role === Role.USER;
  const isSystem = message.role === Role.SYSTEM;
  const { showToast } = useToast();
  const { t } = useTranslation();

  const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        showToast(t('toast.code_copied'), "success");
    } catch (err) {
        showToast(t('toast.code_copy_error'), "error");
    }
  };

  const renderAttachments = (attachments?: Attachment[]) => {
      if (!attachments || attachments.length === 0) return null;
      return (
          <div className="message-attachments">
              {attachments.map(att => (
                  <div key={att.id} className="attachment-display">
                      {att.mimeType.startsWith('image/') ? (
                          <div className="att-image-container">
                             <img src={att.previewUrl} alt={`${t('alt.thumbnail')}: ${att.name}`} className="att-image-full" />
                          </div>
                      ) : (
                          <div className="att-file-card">
                              {att.mimeType.startsWith('audio/') ? <Icons.Mic size={14} aria-hidden="true"/> : <Icons.FileText size={14} aria-hidden="true"/>}
                              <span>{att.name}</span>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      );
  };

  const renderGroundingSources = () => {
      if (!message.groundingMetadata?.groundingChunks) return null;
      const chunks = message.groundingMetadata.groundingChunks.filter(c => c.web);
      if (chunks.length === 0) return null;

      return (
          <div className="grounding-sources" aria-label={t('chat.sources')}>
              <div className="grounding-header">
                  <Icons.Globe size={12} aria-hidden="true" /> {t('chat.sources')}
              </div>
              <div className="grounding-list">
                  {chunks.map((chunk, i) => (
                    chunk.web?.uri && (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="grounding-chip" aria-label={`Fuente: ${chunk.web.title}`}>
                           <span className="link-title">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                           <Icons.ExternalLink size={10} style={{opacity:0.5}} aria-hidden="true"/>
                        </a>
                    )
                  ))}
              </div>
          </div>
      )
  };

  if (isSystem) {
      return (
          <div className="message-row system" role="alert">
              <span className="system-bubble">
                  {message.content.includes("Error") ? <Icons.X size={12} color="#ef4444" aria-hidden="true"/> : <Icons.Sparkles size={12} color="#eab308" aria-hidden="true"/>}
                  {message.content}
              </span>
          </div>
      )
  }

  return (
    <div className={`message-row ${isUser ? 'user' : 'model'}`}>
      {!isUser && <div className="avatar model" aria-hidden="true"><Icons.Cpu size={16} /></div>}
      
      <div className={`message-bubble ${isUser ? 'user-content' : 'model-content'}`}>
        {renderAttachments(message.attachments)}
        
        {/* MARKDOWN RENDERING */}
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Code Blocks con Syntax Highlighting
                    code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline && match) {
                            return (
                                <div className="code-block-wrapper">
                                    <div className="code-block-header">
                                        <span className="lang-tag">{language}</span>
                                        <button 
                                            className="copy-code-btn" 
                                            onClick={() => copyToClipboard(codeString)} 
                                            title={t('chat.copy_code')}
                                            aria-label={t('chat.copy_code')}
                                            type="button"
                                        >
                                            <Icons.Copy size={12} aria-hidden="true"/>
                                        </button>
                                    </div>
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={language}
                                        PreTag="div"
                                        customStyle={{margin: 0, padding: '16px', borderRadius: '0 0 8px 8px', fontSize: '12px', background: '#0e0e10'}}
                                        {...props}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }
                        // Inline Code
                        return <code className="inline-code" {...props}>{children}</code>;
                    },
                    // Tablas
                    table({children}) {
                        return <div className="table-wrapper"><table>{children}</table></div>
                    },
                    // Enlaces
                    a({node, ...props}) {
                        return <a target="_blank" rel="noopener noreferrer" {...props} />
                    }
                }}
            >
                {message.content}
            </ReactMarkdown>
        </div>

        {message.isThinking && (
           <div className="thinking-indicator" role="status" aria-label={t('chat.thinking')}>
              <span className="thinking-dot"></span><span className="thinking-dot"></span><span className="thinking-dot"></span>
           </div>
        )}
        
        {!isUser && renderGroundingSources()}
      </div>

      {isUser && <div className="avatar user" aria-hidden="true"><Icons.Terminal size={14} color="var(--bg-app)" strokeWidth={2.5}/></div>}
    </div>
  );
});
