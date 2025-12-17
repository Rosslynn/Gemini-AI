
import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { Icons } from './components/Icon';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput } from './components/ChatInput';
import { ChatList } from './components/ChatList';
import { TokenGauge } from './components/TokenGauge';
import { NetworkBanner } from './components/NetworkBanner';
import { Spinner } from './components/Spinner';
import { Message, Role, ModelType, Attachment } from './types';
import { streamGeminiResponse, generateQuickAction } from './services/geminiService';
import { useExtensionBridge } from './hooks/useExtensionBridge';
import { saveChatHistory, loadChatHistory, clearChatHistory } from './services/storageService';
import { getApiKey, getSystemInstruction, getContextConfig, DEFAULT_CONTEXT_LIMIT } from './services/settingsService'; 
import { useToast } from './components/Toast';
import { generateMarkdownExport, downloadMarkdown } from './services/exportService';
import { calculateContextUsage } from './services/tokenService';
import { useHotkeys } from './hooks/useHotkeys';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useTranslation } from './hooks/useTranslation';

const SettingsModal = lazy(() => import('./components/SettingsModal').then(m => ({ default: m.SettingsModal })));
const TemplateManager = lazy(() => import('./components/TemplateManager').then(m => ({ default: m.TemplateManager })));
const ShortcutsModal = lazy(() => import('./components/ShortcutsModal').then(m => ({ default: m.ShortcutsModal })));

type QuickActionType = 'explain' | 'refactor' | 'fix' | 'tests';

export default function App() {
  const { t } = useTranslation();

  const INITIAL_MESSAGE: Message = useMemo(() => ({
    id: 'init-1',
    role: Role.MODEL,
    content: `👋 **${t('app.title')}**\n\n${t('app.welcome')}`
  }), [t]);

  // --- STATE ---
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Image Preview State (Lightbox)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [contextCode, setContextCode] = useState<string>('');
  const [isContextVisible, setIsContextVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Default to SMART (Gemini 3 Pro) because users want the best by default
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.SMART);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [useSearch, setUseSearch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Settings Config
  const [contextLimit, setContextLimit] = useState(DEFAULT_CONTEXT_LIMIT);
  const [autoPrune, setAutoPrune] = useState(false);
  
  const { captureCodeFromPage, takeScreenshot, getPageContentText } = useExtensionBridge();
  const { showToast } = useToast();
  const isOnline = useNetworkStatus();
  
  const { isListening, transcript, startListening, stopListening, resetTranscript, hasSupport, error: voiceError } = useSpeechRecognition();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  // Detectar si estamos en modo popout (ventana externa)
  const isPopout = useMemo(() => {
      if (typeof window !== 'undefined') {
          return new URLSearchParams(window.location.search).get('mode') === 'popout';
      }
      return false;
  }, []);

  // --- MEMOIZED STATS ---
  const tokenStats = useMemo(() => {
      return calculateContextUsage(messages, contextCode, contextLimit);
  }, [messages, contextCode, contextLimit]);

  // --- INIT ---
  useEffect(() => {
      const init = async () => {
          const start = Date.now();
          
          const key = await getApiKey();
          const saved = await loadChatHistory();
          const config = await getContextConfig();

          setContextLimit(config.limit);
          setAutoPrune(config.autoPrune);
          
          if (key) {
              setApiKeyState(key);
              if (saved && saved.length > 0) {
                  setMessages(saved);
              } else {
                 setMessages([{...INITIAL_MESSAGE, content: t('app.desc')}]);
              }
          } else {
              setShowSettings(true);
          }

          const elapsed = Date.now() - start;
          if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));
          
          setIsInitialized(true);
      };
      init();
  }, []);

  // --- SAVE HISTORY (DEBOUNCED) ---
  useEffect(() => {
      if (isInitialized && messages.length > 0 && apiKey) {
          // Debounce: Esperamos 2 segundos sin actividad antes de guardar.
          // Esto evita errores de cuota de escritura y mejora performance durante el streaming.
          const timerId = setTimeout(() => {
              const messagesToSave = messages.filter(m => !m.isThinking);
              saveChatHistory(messagesToSave);
          }, 2000);

          return () => clearTimeout(timerId);
      }
  }, [messages, isInitialized, apiKey]);

  // Voice Input Logic
  useEffect(() => {
      if (transcript) {
          setInputValue(prev => transcript);
      }
  }, [transcript]);

  useEffect(() => {
      if (voiceError) {
          showToast(voiceError, 'error');
      }
  }, [voiceError, showToast]);

  // --- HANDLERS ---
  const handleSettingsSave = async (key: string) => {
      setApiKeyState(key);
      const config = await getContextConfig(); // Recargar config recién guardada
      setContextLimit(config.limit);
      setAutoPrune(config.autoPrune);
      setShowSettings(false);
      setMessages(prev => [...prev, {id: Date.now().toString(), role: Role.SYSTEM, content: "✅ " + t('toast.settings_saved')}]);
      showToast(t('toast.settings_saved'), "success");
  };

  const handleClearChat = async () => {
      if (confirm(t('alert.clear_history'))) {
          await clearChatHistory();
          setMessages([{...INITIAL_MESSAGE, content: t('toast.history_cleared')}]);
          setContextCode('');
          setAttachments([]);
          showToast(t('toast.history_cleared'), "info");
      }
  };

  const handleOptimizeHistory = () => {
      if (confirm(t('alert.optimize_history'))) {
          setMessages(prev => prev.map(msg => ({ ...msg, attachments: [] })));
          showToast(t('toast.images_cleared'), "info");
      }
  };

  const handleExport = () => {
     if (messages.length <= 1) {
         showToast(t('toast.no_history_export'), "info");
         return;
     }
     const md = generateMarkdownExport(messages);
     downloadMarkdown(md, `gemini-chat-${new Date().toISOString().slice(0,10)}.md`);
     showToast(t('toast.export_success'), "success");
  };

  const handlePopout = () => {
     // @ts-ignore
     if (typeof chrome !== 'undefined' && chrome.windows) {
         // @ts-ignore
         chrome.windows.create({
             // @ts-ignore
             url: chrome.runtime.getURL('index.html?mode=popout'),
             type: 'popup', width: 800, height: 600
         });
     }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsLoading(false);
        showToast(t('toast.generation_stopped'), "info");
        if (currentMessageIdRef.current) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === currentMessageIdRef.current) {
                    return { ...msg, isThinking: false, content: msg.content + `\n\n> ${t('chat.stopped')}` };
                }
                return msg;
            }));
            currentMessageIdRef.current = null;
        }
    }
  };

  // --- HOTKEYS ---
  useHotkeys([
      { 
          combo: 'esc', 
          onTrigger: () => {
              if (previewImage) setPreviewImage(null);
              else if (showSettings && apiKey) setShowSettings(false);
              else if (showTemplates) setShowTemplates(false);
              else if (showShortcuts) setShowShortcuts(false);
              else if (isLoading) handleStop();
          },
          preventDefault: true
      },
      {
          combo: 'mod+j',
          onTrigger: () => setIsContextVisible(prev => !prev),
          preventDefault: true
      },
      {
          combo: 'mod+/',
          onTrigger: () => {
              const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
              textarea?.focus();
          },
          preventDefault: true
      },
      {
          combo: '?',
          onTrigger: () => setShowShortcuts(true)
      }
  ], [showSettings, showTemplates, showShortcuts, isLoading, apiKey, previewImage]);

  // --- GEMINI EXECUTION ---
  const handleSendMessage = async (overridePrompt?: string, label?: string) => {
    if (!isOnline) { showToast(t('status.offline'), "error"); return; }
    if (!apiKey) { setShowSettings(true); return; }
    if (isLoading) return;
    
    if (isListening) stopListening();

    if (tokenStats.isCritical) {
        if (!confirm(t('alert.token_critical'))) {
            return;
        }
    }

    const content = overridePrompt || inputValue;
    if ((!content.trim() && attachments.length === 0)) return;

    // Smart Pruning
    let currentHistory = [...messages];
    if (autoPrune) {
        const thresholdIndex = currentHistory.length - 2;
        currentHistory = currentHistory.map((msg, index) => {
            if (index < thresholdIndex && msg.attachments && msg.attachments.length > 0) {
                return { ...msg, attachments: [] };
            }
            return msg;
        });
    }

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: Role.USER, 
        content: label || content,
        attachments: [...attachments] 
    };

    const newHistory = [...currentHistory, userMsg];
    setMessages(newHistory);
    
    setInputValue('');
    resetTranscript(); 
    setAttachments([]); 
    setIsLoading(true);
    
    abortControllerRef.current = new AbortController();

    // ERROR FIX: "Image part is missing a thought_signature"
    // Cuando el MODELO genera una imagen y la enviamos de vuelta en el historial como 'inlineData' simple,
    // la API rechaza la solicitud porque falta la firma de seguridad interna.
    // SOLUCIÓN: Filtramos las imágenes generadas por el modelo del historial que enviamos a la API.
    // El modelo recordará el contexto por el texto (prompts anteriores), pero no necesita los bytes de la imagen generada.
    const apiHistory = newHistory.filter(m => m.role !== Role.SYSTEM).map(m => {
        const parts: any[] = [];
        
        // Solo adjuntar imágenes si son del USUARIO.
        // Si son del MODELO, las omitimos para evitar el error 400.
        if (m.role === Role.USER && m.attachments) {
            m.attachments.forEach(att => parts.push({ inlineData: { mimeType: att.mimeType, data: att.data }}));
        }
        
        if (m.content) parts.push({ text: m.content });
        return { role: m.role === Role.USER ? 'user' : 'model', parts };
    });

    const tempId = (Date.now() + 1).toString();
    currentMessageIdRef.current = tempId;
    setMessages(prev => [...prev, { id: tempId, role: Role.MODEL, content: '', isThinking: true }]);

    try {
        let accumulatedText = '';
        
        const sysInstruction = await getSystemInstruction();

        await streamGeminiResponse(
            apiKey,
            sysInstruction,
            content,
            contextCode,
            userMsg.attachments || [],
            apiHistory,
            selectedModel,
            useSearch,
            (chunk, grounding, generatedImages) => {
                if (chunk) accumulatedText += chunk;
                
                setMessages(prev => prev.map(m => {
                    if (m.id === tempId) {
                        const currentAttachments = m.attachments || [];
                        const newAttachments = generatedImages || [];
                        const merged = [...currentAttachments, ...newAttachments];

                        return { 
                            ...m, 
                            content: accumulatedText, 
                            isThinking: true, 
                            groundingMetadata: grounding,
                            attachments: merged.length > 0 ? merged : undefined 
                        };
                    }
                    return m;
                }));
            },
            abortControllerRef.current.signal
        );
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isThinking: false } : m));
    } catch (e: any) {
        if (e.name !== 'AbortError') {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.SYSTEM, content: "❌ Error: " + e.message }]);
            showToast(t('status.offline'), "error");
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  // --- TOOLS HANDLERS ---
  const handleScreenshot = async () => {
      const dataUrl = await takeScreenshot();
      if (dataUrl) {
          setAttachments(prev => [...prev, {
              id: Date.now().toString(), name: "Screenshot.png", mimeType: "image/jpeg", data: dataUrl.split(',')[1], previewUrl: dataUrl
          }]);
          showToast(t('toast.screenshot_added'), "success");
      } else {
          showToast(t('toast.screenshot_error'), "error");
      }
  };

  const handleCapture = async () => {
    const code = await captureCodeFromPage();
    if (code) {
      setContextCode(code);
      setIsContextVisible(true);
      showToast(`${t('toast.context_captured')} (${code.length} chars)`, "success");
    } else {
      setMessages(p => [...p, {id:Date.now().toString(), role:Role.SYSTEM, content: "⚠️ " + t('toast.no_code_detected')}]);
      showToast(t('toast.no_code_detected'), "info");
    }
  };

  const handleAnalyzePage = async () => {
      const text = await getPageContentText();
      if (text) {
          handleSendMessage("Analiza esta página:\n\n" + text.substring(0, 15000), t('action.analyze'));
      } else {
          showToast(t('toast.page_read_error'), "error");
      }
  };

  const handleQuickAction = async (action: QuickActionType) => {
      if (!isOnline) { showToast(t('status.offline'), "error"); return; }
      if (!apiKey) { setShowSettings(true); return; }
      if (isLoading) return;
      
      let code = contextCode;
      if (!code) {
          code = await captureCodeFromPage();
          if (!code) {
              showToast(t('toast.no_code_analyze'), "info");
              return;
          }
      }
      
      setIsLoading(true);
      abortControllerRef.current = new AbortController();
      
      const prompts: Record<QuickActionType, string> = { 
          explain: t('prompts.explain'), 
          refactor: t('prompts.refactor'), 
          fix: t('prompts.fix'), 
          tests: t('prompts.tests') 
      };

      const labels: Record<QuickActionType, string> = { 
          explain: t('action.explain'), 
          refactor: t('action.refactor'), 
          fix: t('action.fix'), 
          tests: t('action.tests') 
      };

      setMessages(p => [...p, { id: Date.now().toString(), role: Role.USER, content: labels[action] }]);
      
      const tempId = (Date.now() + 1).toString();
      setMessages(p => [...p, { id: tempId, role: Role.MODEL, content: '', isThinking: true }]);

      try {
          let acc = "";
          await generateQuickAction(apiKey, code, prompts[action], (chunk) => {
              acc += chunk;
              setMessages(p => p.map(m => m.id === tempId ? { ...m, content: acc, isThinking: true } : m));
          }, abortControllerRef.current.signal);
          setMessages(p => p.map(m => m.id === tempId ? { ...m, isThinking: false } : m));
      } catch (e: any) {
         if (e.name !== 'AbortError') {
             setMessages(p => p.map(m => m.id === tempId ? { ...m, content: "Error.", isThinking: false } : m));
             showToast(t('toast.quick_action_error'), "error");
         }
      } finally { setIsLoading(false); abortControllerRef.current = null; }
  };

  const handleImageGen = () => {
      setInputValue(t('prompts.image_gen_prefix'));
  };

  const handleTemplateSelect = (content: string) => {
      setInputValue(content);
      setShowTemplates(false);
  };

  const toggleMic = () => {
      if (!hasSupport) {
          showToast(t('toast.mic_not_supported'), 'error');
          return;
      }
      if (isListening) stopListening();
      else startListening();
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault(); setIsDragging(false);
      if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
  };
  const processFiles = async (files: File[]) => {
      const newAtts: Attachment[] = [];
      let added = 0;
      for (const f of files) {
          try {
            const reader = new FileReader();
            reader.onload = () => setAttachments(p => [...p, {
                id: Date.now()+Math.random().toString(), name: f.name, mimeType: f.type, 
                data: (reader.result as string).split(',')[1], previewUrl: reader.result as string
            }]);
            reader.readAsDataURL(f);
            added++;
          } catch(e) { console.error(e) }
      }
      if (added > 0) showToast(`${added} ${t('toast.files_attached')}`, "success");
  };

  const renderModals = () => (
    <Suspense fallback={<div className="template-modal-overlay" style={{alignItems:'center'}}><Spinner size={32} /></div>}>
        {showSettings && <SettingsModal onSave={handleSettingsSave} onCancel={() => apiKey && setShowSettings(false)} />}
        {showTemplates && <TemplateManager onSelect={handleTemplateSelect} onClose={() => setShowTemplates(false)} />}
        {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </Suspense>
  );

  if (!isInitialized) {
      return (
          <div className="app-container splash-screen">
               <div className="brand-icon-wrapper" style={{width: 56, height: 56}}>
                  <Icons.Code size={32} />
               </div>
               <Spinner size={32} />
               <span style={{color: 'var(--text-muted)', fontSize: 12, fontWeight: 500}}>{t('app.title')}</span>
          </div>
      );
  }

  return (
    <div className={`app-container ${isDragging ? 'dragging-over' : ''}`} onDragOver={(e)=>{e.preventDefault(); setIsDragging(true)}} onDragLeave={(e)=>{e.preventDefault(); setIsDragging(false)}} onDrop={handleDrop}>
      {!isOnline && <NetworkBanner />}
      {renderModals()}
      
      {/* Lightbox / Preview Overlay */}
      {previewImage && (
          <div className="lightbox-overlay" onClick={() => setPreviewImage(null)}>
              <button className="lightbox-close" onClick={() => setPreviewImage(null)} aria-label={t('btn.close')}>
                  <Icons.X size={24} />
              </button>
              <img src={previewImage} className="lightbox-image" alt="Full size preview" onClick={(e) => e.stopPropagation()} />
          </div>
      )}
      
      {!apiKey ? (
          <div className="welcome-bg">
             <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 16}}>
                 <Icons.Code size={80} color="var(--bg-hover)" />
             </div>
          </div>
      ) : (
          <div className="fade-in-ui">
              <ChatHeader 
                  selectedModel={selectedModel} onModelChange={setSelectedModel}
                  onClear={handleClearChat} onExport={handleExport} onPopout={handlePopout}
                  onToggleContext={() => setIsContextVisible(!isContextVisible)} isContextVisible={isContextVisible} hasContext={!!contextCode}
                  onOpenSettings={() => setShowSettings(true)} isLoading={isLoading}
                  onShowShortcuts={() => setShowShortcuts(true)}
                  isPopout={isPopout}
              />

              <main className="chat-container">
                  {isDragging && <div className="drag-overlay"><Icons.Image size={48} aria-hidden="true" /><span>{t('drag.drop_files')}</span></div>}
                  
                  {isContextVisible && (
                      <section className="context-panel" aria-label={t('ctx.title')}>
                        <div className="context-header">
                           <span className="context-label"><Icons.FileText size={12} aria-hidden="true"/> {t('ctx.title')} ({Math.ceil(contextCode.length / 4)} tk)</span>
                           <div className="context-actions">
                               <button onClick={handleCapture} className="ctx-btn" type="button" aria-label={t('ctx.recapture')}><Icons.Zap size={12} aria-hidden="true"/> {t('ctx.recapture')}</button>
                               <button onClick={() => setContextCode('')} className="ctx-btn danger" type="button" aria-label={t('ctx.clear')}><Icons.Trash size={12} aria-hidden="true"/></button>
                           </div>
                        </div>
                        <textarea 
                            value={contextCode} 
                            onChange={(e) => setContextCode(e.target.value)} 
                            className="context-textarea" 
                            spellCheck={false}
                            aria-label={t('ctx.title')}
                        />
                      </section>
                  )}
                  
                  <ChatList messages={messages} onImageClick={(url) => setPreviewImage(url)} />
              </main>

              <footer className="footer">
                 <div className="quick-actions-scroll" role="toolbar" aria-label={t('aria.main_controls')}>
                    <button className="action-chip" onClick={() => handleQuickAction('explain')} disabled={isLoading || !isOnline} type="button"><Icons.Explain size={13} aria-hidden="true" /> {t('action.explain')}</button>
                    <button className="action-chip" onClick={() => handleQuickAction('refactor')} disabled={isLoading || !isOnline} type="button"><Icons.Zap size={13} aria-hidden="true" /> {t('action.refactor')}</button>
                    <button className="action-chip" onClick={() => handleQuickAction('fix')} disabled={isLoading || !isOnline} type="button"><Icons.Bug size={13} aria-hidden="true" /> {t('action.fix')}</button>
                    <button className="action-chip" onClick={() => handleQuickAction('tests')} disabled={isLoading || !isOnline} type="button"><Icons.Terminal size={13} aria-hidden="true" /> {t('action.tests')}</button>
                    <button className="action-chip" onClick={handleAnalyzePage} disabled={isLoading || !isOnline} style={{color: 'var(--accent-blue)', borderColor:'var(--accent-blue)'}} type="button"><Icons.FileText size={13} aria-hidden="true" /> {t('action.analyze')}</button>
                 </div>

                 <div style={{paddingBottom: 8}}>
                    <TokenGauge stats={tokenStats} onOptimize={handleOptimizeHistory} />
                 </div>

                 {attachments.length > 0 && (
                     <div className="attachments-preview-area" aria-label={t('aria.attachments')}>
                         <button className="att-remove" onClick={() => setAttachments([])} type="button" aria-label={t('aria.clear_attachments')}><Icons.Trash size={14} color="#ef4444" /></button>
                         {attachments.map(att => (
                             <div key={att.id} className="attachment-chip">
                                 {att.mimeType.startsWith('image/') ? (
                                    <img 
                                        src={att.previewUrl} 
                                        className="att-thumb clickable" 
                                        alt={att.name} 
                                        onClick={() => setPreviewImage(att.previewUrl)}
                                    />
                                 ) : <Icons.FileText size={14} aria-hidden="true"/>}
                                 <span className="att-name">{att.name}</span>
                                 <button className="att-remove" onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))} type="button" aria-label={`${t('aria.remove_file')} ${att.name}`}><Icons.X size={12} /></button>
                             </div>
                         ))}
                     </div>
                 )}

                 <ChatInput 
                    value={inputValue} onChange={setInputValue} onSend={() => handleSendMessage()} 
                    onStop={handleStop} isLoading={isLoading} onScreenshot={handleScreenshot}
                    onAttach={() => fileInputRef.current?.click()} useSearch={useSearch} onToggleSearch={() => setUseSearch(!useSearch)}
                    onOpenTemplates={() => setShowTemplates(true)}
                    hasAttachments={attachments.length > 0}
                    onToggleMic={toggleMic}
                    isListening={isListening}
                    onImageGen={handleImageGen}
                 />
                 <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.length && processFiles(Array.from(e.target.files))} style={{display: 'none'}} multiple/>
              </footer>
          </div>
      )}
    </div>
  );
}
