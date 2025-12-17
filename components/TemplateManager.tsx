
import React, { useEffect, useState } from 'react';
import { Icons } from './Icon';
import { Button } from './Button';
import { Template } from '../types';
import { getTemplates, saveTemplate, deleteTemplate } from '../services/templateService';
import { useToast } from './Toast';
import { useTranslation } from '../hooks/useTranslation';

interface TemplateManagerProps {
    onSelect: (content: string) => void;
    onClose: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelect, onClose }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [view, setView] = useState<'list' | 'create'>('list');
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');

    const { showToast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (e) {
            showToast(t('toast.load_error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newContent.trim()) return;

        const newTemplate: Template = {
            id: Date.now().toString(),
            name: newName,
            content: newContent
        };

        await saveTemplate(newTemplate);
        setTemplates(prev => [...prev, newTemplate]);
        setView('list');
        setNewName('');
        setNewContent('');
        showToast(t('toast.template_saved'), 'success');
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm(t('templates.confirm_delete'))) {
            await deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
            showToast(t('toast.template_deleted'), 'info');
        }
    };

    return (
        <div className="template-modal-overlay">
            <div className="template-modal">
                <div className="template-header">
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        {view === 'create' && (
                            <button 
                                type="button"
                                onClick={() => setView('list')} 
                                className="back-btn" 
                                aria-label={t('btn.back')}
                            >
                                <Icons.ArrowLeft size={16}/>
                            </button>
                        )}
                        <h3>{view === 'list' ? t('templates.title.list') : t('templates.title.create')}</h3>
                    </div>
                    
                    <div style={{display: 'flex', gap: 8}}>
                        {view === 'list' && (
                            <Button size="sm" onClick={() => setView('create')} aria-label={t('templates.title.create')}>
                                <Icons.Plus size={14} style={{marginRight: 4}}/> {t('templates.btn.new')}
                            </Button>
                        )}
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="close-btn-simple" 
                            aria-label={t('btn.close')}
                        >
                            <Icons.X size={18}/>
                        </button>
                    </div>
                </div>

                <div className="template-body">
                    {isLoading ? (
                        <div className="loading-state">{t('templates.loading')}</div>
                    ) : view === 'list' ? (
                        <div className="template-list">
                            {templates.length === 0 && <p className="empty-state">{t('templates.empty')}</p>}
                            {templates.map(tpl => (
                                <div 
                                    key={tpl.id} 
                                    className="template-item" 
                                    onClick={() => onSelect(tpl.content)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onSelect(tpl.content)}
                                >
                                    <div className="template-info">
                                        <span className="template-name">{tpl.name}</span>
                                        <span className="template-preview">{tpl.content.substring(0, 50)}...</span>
                                    </div>
                                    {!tpl.isDefault && (
                                        <button 
                                            type="button"
                                            className="template-delete" 
                                            onClick={(e) => handleDelete(e, tpl.id)}
                                            aria-label={`${t('aria.remove_file')} ${tpl.name}`}
                                        >
                                            <Icons.Trash size={14}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleCreate} className="template-form">
                            <div className="form-group">
                                <label htmlFor="tpl-name">{t('templates.form.name')}</label>
                                <input 
                                    id="tpl-name"
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)} 
                                    placeholder={t('templates.form.name_placeholder')}
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tpl-content">{t('templates.form.prompt')}</label>
                                <textarea 
                                    id="tpl-content"
                                    value={newContent} 
                                    onChange={e => setNewContent(e.target.value)} 
                                    placeholder={t('templates.form.prompt_placeholder')}
                                    rows={5}
                                />
                            </div>
                            <div className="form-actions">
                                <Button type="submit" disabled={!newName || !newContent}>{t('btn.save')}</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
