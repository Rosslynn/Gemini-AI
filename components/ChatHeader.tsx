
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icon';
import { Button } from './Button';
import { ModelType } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
  selectedModel: ModelType;
  onModelChange: (m: ModelType) => void;
  onClear: () => void;
  onExport: () => void;
  onPopout: () => void;
  onToggleContext: () => void;
  isContextVisible: boolean;
  hasContext: boolean;
  onOpenSettings: () => void;
  isLoading: boolean;
  onShowShortcuts?: () => void;
  isPopout?: boolean;
}

export const ChatHeader: React.FC<HeaderProps> = ({
  selectedModel, onModelChange, onClear, onExport, onPopout, 
  onToggleContext, isContextVisible, hasContext, onOpenSettings, isLoading, onShowShortcuts,
  isPopout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Cerrar menú al seleccionar una opción
  const handleMenuAction = (action: () => void) => {
      action();
      setIsMenuOpen(false);
  }

  return (
    <header className="header" role="banner">
        <div className="header-brand">
            <div className="brand-icon-wrapper" aria-hidden="true"><Icons.Code size={16} /></div>
            <div className="brand-text">
                <h1>{t('app.title')}</h1>
                <span className="brand-badge">PRO</span>
            </div>
        </div>
        
        <div className="header-controls" role="toolbar" aria-label={t('aria.main_controls')}>
            {/* 1. Selector de Modelo (Siempre Visible) */}
             <div className="model-switch" role="radiogroup" aria-label={t('aria.model_selection')}>
                <button 
                  type="button"
                  onClick={() => onModelChange(ModelType.FAST)} 
                  className={`switch-btn ${selectedModel === ModelType.FAST ? 'active' : ''}`} 
                  disabled={isLoading}
                  role="radio"
                  aria-checked={selectedModel === ModelType.FAST}
                >{t('model.flash')}</button>
                <button 
                  type="button"
                  onClick={() => onModelChange(ModelType.SMART)} 
                  className={`switch-btn ${selectedModel === ModelType.SMART ? 'active' : ''}`} 
                  disabled={isLoading}
                  role="radio"
                  aria-checked={selectedModel === ModelType.SMART}
                >{t('model.pro')}</button>
            </div>
            
            {/* 2. Botones de Escritorio (Ocultos en móvil) */}
            <div className="header-actions-desktop">
                <Button variant="ghost" size="icon" onClick={onExport} title={t('header.export')} aria-label={t('header.export')}>
                    <Icons.Download size={16} aria-hidden="true"/>
                </Button>

                <Button variant="ghost" size="icon" onClick={onClear} title={t('header.clear')} aria-label={t('header.clear')}>
                    <Icons.Trash size={16} aria-hidden="true"/>
                </Button>
                
                {!isPopout && (
                    <Button variant="ghost" size="icon" onClick={onPopout} title={t('header.popout')} aria-label={t('header.popout')}>
                        <Icons.Maximize size={16} aria-hidden="true"/>
                    </Button>
                )}
                
                <Button variant="ghost" size="icon" onClick={onOpenSettings} title={t('settings.title')} aria-label={t('settings.title')}>
                    <Icons.Settings size={16} aria-hidden="true"/>
                </Button>

                {onShowShortcuts && (
                    <Button variant="ghost" size="icon" onClick={onShowShortcuts} title={t('header.shortcuts')} aria-label={t('header.shortcuts')}>
                        <Icons.Help size={16} aria-hidden="true"/>
                    </Button>
                )}
            </div>

            {/* 3. Toggle Contexto (Siempre visible para acceso rápido) */}
             <Button 
                variant={isContextVisible ? "secondary" : "ghost"} 
                size="icon" 
                onClick={onToggleContext} 
                title={t('header.context')}
                aria-label={t('header.context')}
                aria-pressed={isContextVisible}
                className={hasContext ? "has-context" : ""}
            >
                <Icons.FileText size={18} aria-hidden="true"/>
            </Button>

            {/* 4. Menú Móvil (Solo visible en móvil) */}
            <div className="header-actions-mobile" ref={menuRef}>
                <Button 
                    variant={isMenuOpen ? "secondary" : "ghost"} 
                    size="icon" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={t('aria.more_options')}
                    aria-expanded={isMenuOpen}
                >
                    <Icons.More size={18} />
                </Button>

                {isMenuOpen && (
                    <>
                        <div className="dropdown-backdrop" onClick={() => setIsMenuOpen(false)} />
                        <div className="header-dropdown-menu">
                             <button onClick={() => handleMenuAction(onExport)} className="dropdown-item">
                                <Icons.Download size={14} /> {t('header.export')}
                            </button>
                            {!isPopout && (
                                <button onClick={() => handleMenuAction(onPopout)} className="dropdown-item">
                                    <Icons.Maximize size={14} /> {t('header.popout')}
                                </button>
                            )}
                            <button onClick={() => handleMenuAction(onOpenSettings)} className="dropdown-item">
                                <Icons.Settings size={14} /> {t('settings.title')}
                            </button>
                            {onShowShortcuts && (
                                <button onClick={() => handleMenuAction(onShowShortcuts)} className="dropdown-item">
                                    <Icons.Help size={14} /> {t('header.shortcuts')}
                                </button>
                            )}
                            <div className="dropdown-divider" />
                            <button onClick={() => handleMenuAction(onClear)} className="dropdown-item danger">
                                <Icons.Trash size={14} /> {t('header.clear_all')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    </header>
  );
};
