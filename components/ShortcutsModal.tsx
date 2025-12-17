
import React from 'react';
import { Icons } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface ShortcutsModalProps {
    onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    
    const shortcuts = [
        { keys: ['Mod', 'Enter'], desc: t('shortcuts.send') },
        { keys: ['Esc'], desc: t('shortcuts.stop') },
        { keys: ['Mod', 'J'], desc: t('shortcuts.context') },
        { keys: ['Mod', '/'], desc: t('shortcuts.focus') },
        { keys: ['?'], desc: t('shortcuts.help') }
    ];

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return (
        <div className="template-modal-overlay" onClick={onClose}>
            <div className="template-modal shortcuts-modal" onClick={e => e.stopPropagation()} style={{height: 'auto', maxHeight: '80%'}}>
                <div className="template-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <Icons.Keyboard size={18} />
                        <h3>{t('shortcuts.title')}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="close-btn-simple" aria-label={t('btn.close')}>
                        <Icons.X size={18}/>
                    </button>
                </div>

                <div className="template-body">
                    <div className="shortcuts-list">
                        {shortcuts.map((s, i) => (
                            <div key={i} className="shortcut-row">
                                <span className="shortcut-desc">{s.desc}</span>
                                <div className="shortcut-keys">
                                    {s.keys.map((k, j) => (
                                        <kbd key={j} className="kbd-key">
                                            {k === 'Mod' ? (isMac ? '⌘' : 'Ctrl') : k}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
