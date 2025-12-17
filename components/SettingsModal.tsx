
import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { Button } from './Button';
import { setApiKey, getApiKey, getSystemInstruction, setSystemInstruction, DEFAULT_SYSTEM_INSTRUCTION, getContextConfig, setContextConfig, DEFAULT_CONTEXT_LIMIT } from '../services/settingsService';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
  onSave: (key: string) => void;
  onCancel?: () => void;
  initialKey?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onSave, onCancel }) => {
  const [key, setKey] = useState('');
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [sysInstruction, setSysInstruction] = useState('');
  const [contextLimit, setContextLimit] = useState(DEFAULT_CONTEXT_LIMIT);
  const [autoPrune, setAutoPrune] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'context'>('general');
  const [error, setError] = useState('');
  
  const { t, language, setLanguage } = useTranslation();

  // Cargar configuración al montar
  useEffect(() => {
    // Verificar si ya existe una key guardada (sin exponerla en la UI si no es necesario)
    getApiKey().then(k => {
        if (k) {
            setHasSavedKey(true);
            setKey(k); // Mantenemos el valor interno por si guarda sin cambiar
        }
    });

    getSystemInstruction().then(setSysInstruction);
    getContextConfig().then(config => {
        setContextLimit(config.limit);
        setAutoPrune(config.autoPrune);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si tiene llave guardada y no la ha borrado, solo guardamos las otras configs
    if (hasSavedKey) {
        await setSystemInstruction(sysInstruction);
        await setContextConfig(contextLimit, autoPrune);
        onSave(key); // Pasamos la key existente
        return;
    }

    if (!key.startsWith('AIza')) {
      setError('La clave API parece inválida (debe empezar por AIza)');
      return;
    }
    await setApiKey(key);
    await setSystemInstruction(sysInstruction);
    await setContextConfig(contextLimit, autoPrune);
    onSave(key);
  };

  const handleResetInstruction = () => {
      setSysInstruction(DEFAULT_SYSTEM_INSTRUCTION);
  }

  const handleRemoveKey = () => {
      setHasSavedKey(false);
      setKey('');
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 0, width: '100%', maxWidth: 500,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden'
      }}>
        
        {/* TABS HEADER */}
        <div style={{padding: '20px 20px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)'}}>
             <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 16}}>
                <div style={{padding:8, background:'rgba(59, 130, 246, 0.1)', borderRadius:8, color:'var(--accent-blue)'}}>
                    <Icons.Settings size={20} />
                </div>
                <h2 style={{margin:0, fontSize:16}}>{t('settings.title')}</h2>
            </div>
            <div style={{display:'flex', gap: 16}}>
                <button 
                    type="button"
                    onClick={() => setActiveTab('general')}
                    style={{
                        background: 'transparent', border: 'none', 
                        borderBottom: activeTab === 'general' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'general' ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '8px 4px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                    }}
                >
                    {t('settings.tab.general')}
                </button>
                <button 
                     type="button"
                    onClick={() => setActiveTab('context')}
                    style={{
                        background: 'transparent', border: 'none', 
                        borderBottom: activeTab === 'context' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        color: activeTab === 'context' ? 'var(--text-main)' : 'var(--text-muted)',
                        padding: '8px 4px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                    }}
                >
                    {t('settings.tab.context')}
                </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} style={{overflowY: 'auto', padding: 20, flex: 1}}>
          
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                 <div>
                    <label style={{display:'block', fontSize:12, fontWeight:500, marginBottom:6, color: 'var(--text-muted)'}}>{t('settings.language')}</label>
                    <div style={{display: 'flex', gap: 8}}>
                        <button 
                            type="button"
                            onClick={() => setLanguage('es')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 6, border: '1px solid var(--border)',
                                background: language === 'es' ? 'var(--bg-hover)' : 'transparent',
                                color: language === 'es' ? 'var(--text-main)' : 'var(--text-dim)',
                                cursor: 'pointer'
                            }}
                        >
                            🇪🇸 Español
                        </button>
                        <button 
                            type="button"
                            onClick={() => setLanguage('en')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: 6, border: '1px solid var(--border)',
                                background: language === 'en' ? 'var(--bg-hover)' : 'transparent',
                                color: language === 'en' ? 'var(--text-main)' : 'var(--text-dim)',
                                cursor: 'pointer'
                            }}
                        >
                            🇺🇸 English
                        </button>
                    </div>
                </div>

                <div>
                  <label style={{display:'block', fontSize:12, fontWeight:500, marginBottom:6, color: 'var(--text-muted)'}}>{t('settings.apikey')}</label>
                  
                  {hasSavedKey ? (
                      <div style={{
                          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', 
                          borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8
                      }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 600, fontSize: 13}}>
                              <Icons.Check size={16} />
                              {t('settings.apikey.saved')}
                          </div>
                          <p style={{margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: '1.4'}}>
                              {t('settings.apikey.hidden')}
                          </p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleRemoveKey}
                            style={{alignSelf: 'flex-start', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', marginTop: 4}}
                          >
                              <Icons.Trash size={12} style={{marginRight: 6}} />
                              {t('settings.apikey.remove')}
                          </Button>
                      </div>
                  ) : (
                      <>
                          <input 
                            type="password" 
                            value={key}
                            onChange={(e) => {setKey(e.target.value); setError('');}}
                            placeholder="AIzaSy..."
                            style={{
                              width: '100%', padding: '10px', background: 'var(--bg-input)',
                              border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
                              borderRadius: 6, color: 'var(--text-main)', outline:'none'
                            }}
                          />
                          {error && <p style={{color:'#ef4444', fontSize:11, marginTop:4}}>{error}</p>}
                          <div style={{marginTop: 6, fontSize: 11, color: 'var(--text-dim)'}}>
                            {t('settings.apikey.help')} <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{color:'var(--accent-blue)'}}>Google AI Studio</a>.
                          </div>
                      </>
                  )}
                </div>

                <div>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6}}>
                        <label style={{display:'block', fontSize:12, fontWeight:500, color: 'var(--text-muted)'}}>{t('settings.behavior')}</label>
                        <button type="button" onClick={handleResetInstruction} style={{background:'none', border:'none', color:'var(--accent-blue)', fontSize:11, cursor:'pointer'}}>{t('settings.reset')}</button>
                     </div>
                     <textarea
                        value={sysInstruction}
                        onChange={(e) => setSysInstruction(e.target.value)}
                        placeholder={t('settings.behavior.placeholder')}
                        rows={5}
                        style={{
                            width: '100%', padding: '10px', background: 'var(--bg-input)',
                            border: '1px solid var(--border)', borderRadius: 6, 
                            color: 'var(--text-main)', outline: 'none', resize: 'vertical', fontSize: 13,
                            fontFamily: 'var(--font-mono)'
                        }}
                     />
                </div>
              </div>
          )}

          {/* TAB: CONTEXT & TOKENS */}
          {activeTab === 'context' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
                  
                  {/* Explanation Block */}
                  <div style={{padding: 12, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, border: '1px solid var(--border)'}}>
                      <h4 style={{margin: '0 0 8px', fontSize: 13, color: 'var(--accent-blue)'}}>{t('settings.context.title')}</h4>
                      <p style={{margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: '1.5'}}>
                          {t('settings.context.desc')}
                      </p>
                  </div>

                  {/* Limit Slider */}
                  <div>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom: 8}}>
                          <label style={{fontSize:12, fontWeight:500, color: 'var(--text-muted)'}}>{t('settings.tokens.limit')}</label>
                          <span style={{fontSize:12, fontWeight:600, color: 'var(--text-main)'}}>{(contextLimit/1000).toFixed(0)}k tk</span>
                      </div>
                      <input 
                          type="range" 
                          min="10000" 
                          max="1000000" 
                          step="10000" 
                          value={contextLimit} 
                          onChange={(e) => setContextLimit(Number(e.target.value))}
                          style={{width: '100%', cursor: 'pointer'}}
                      />
                      <div style={{display:'flex', justifyContent:'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-dim)'}}>
                          <span>{t('settings.tokens.low')}</span>
                          <span>{t('settings.tokens.high')}</span>
                      </div>
                      {contextLimit > 200000 && (
                          <p style={{fontSize: 11, color: '#eab308', marginTop: 6}}>{t('settings.tokens.warning')}</p>
                      )}
                  </div>

                  {/* Auto Prune Toggle */}
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)'}}>
                      <div style={{flex: 1, paddingRight: 10}}>
                          <span style={{display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-main)'}}>{t('settings.prune.title')}</span>
                          <span style={{display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2}}>
                              {t('settings.prune.desc')}
                          </span>
                      </div>
                      <button 
                          type="button"
                          onClick={() => setAutoPrune(!autoPrune)}
                          role="switch"
                          aria-checked={autoPrune}
                          style={{
                              width: 36, height: 20, borderRadius: 20, 
                              background: autoPrune ? 'var(--accent-blue)' : 'var(--border)',
                              position: 'relative', transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                          }}
                      >
                          <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: '#fff',
                              position: 'absolute', top: 2, left: autoPrune ? 18 : 2, transition: 'all 0.2s'
                          }} />
                      </button>
                  </div>
              </div>
          )}

          <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:24, borderTop: '1px solid var(--border)', paddingTop: 16}}>
            {onCancel && <Button variant="ghost" onClick={onCancel}>{t('btn.cancel')}</Button>}
            <Button type="submit" disabled={!key}>{t('settings.save')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
