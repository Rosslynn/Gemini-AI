
import React, { useRef, useEffect } from 'react';
import { Icons } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  onScreenshot: () => void;
  onAttach: () => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  onOpenTemplates: () => void;
  hasAttachments: boolean;
  onToggleMic?: () => void;
  isListening?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value, onChange, onSend, onStop, isLoading, 
  onScreenshot, onAttach, useSearch, onToggleSearch, onOpenTemplates, hasAttachments,
  onToggleMic, isListening
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
    }
  };

  const getPlaceholder = () => {
      if (isListening) return t('input.placeholder.listening');
      if (isLoading) return t('input.placeholder.loading');
      return t('input.placeholder');
  }

  return (
    <div className={`input-container ${isLoading ? 'loading' : ''} ${isListening ? 'listening-mode' : ''}`}>
        <div className="input-tools" role="toolbar" aria-label={t('aria.input_tools')}>
            <button className="tool-btn" onClick={onScreenshot} disabled={isLoading} title={t('input.tool.screenshot')} type="button" aria-label={t('input.tool.screenshot')}>
                <Icons.Image size={18} aria-hidden="true"/>
            </button>
            <button className="tool-btn" onClick={onAttach} disabled={isLoading} title={t('input.tool.attach')} type="button" aria-label={t('input.tool.attach')}>
                <Icons.Paperclip size={18} aria-hidden="true"/>
            </button>
            <button 
                className={`tool-btn ${useSearch ? 'active-tool' : ''}`} 
                onClick={onToggleSearch} 
                disabled={isLoading} 
                title={t('input.tool.search')}
                type="button"
                aria-label={t('input.tool.search')}
                aria-pressed={useSearch}
            >
                <Icons.Globe size={18} aria-hidden="true"/>
            </button>
            <button 
                className="tool-btn" 
                onClick={onOpenTemplates} 
                disabled={isLoading} 
                title={t('input.tool.templates')}
                type="button"
                aria-label={t('input.tool.templates')}
            >
                <Icons.Book size={18} aria-hidden="true"/>
            </button>

            {onToggleMic && (
                <div style={{width: 1, height: 16, background: 'var(--border)', margin: '0 4px', alignSelf: 'center'}} role="presentation" />
            )}
            
            {onToggleMic && (
                <button
                    className={`tool-btn ${isListening ? 'mic-active' : ''}`}
                    onClick={onToggleMic}
                    disabled={isLoading}
                    title={isListening ? t('input.tool.mic_stop') : t('input.tool.mic_start')}
                    type="button"
                    aria-label={isListening ? t('input.tool.mic_stop') : t('input.tool.mic_start')}
                    aria-pressed={isListening}
                >
                    <Icons.Mic size={18} aria-hidden="true"/>
                </button>
            )}
        </div>

        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="chat-input"
            rows={1}
            disabled={isLoading}
            aria-label={t('aria.message_input')}
        />
        
        <div className="send-wrapper">
            {isLoading ? (
                <button className="send-btn stop" onClick={onStop} title={t('btn.stop')} type="button" aria-label={t('btn.stop')}>
                    <Icons.Stop size={12} fill="currentColor" aria-hidden="true"/>
                </button>
            ) : (
                <button 
                    className="send-btn" 
                    onClick={onSend} 
                    disabled={!value.trim() && !hasAttachments} 
                    type="button"
                    aria-label={t('btn.send')}
                >
                    <Icons.MessageSquare size={16} fill={value.trim() ? "currentColor" : "none"} aria-hidden="true"/>
                </button>
            )}
        </div>
    </div>
  );
};
