
import React, { useState } from 'react';
import { TokenUsageStats } from '../services/tokenService';
import { Icons } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

interface TokenGaugeProps {
    stats: TokenUsageStats;
    onOptimize?: () => void;
}

export const TokenGauge: React.FC<TokenGaugeProps> = ({ stats, onOptimize }) => {
    const [showInfo, setShowInfo] = useState(false);
    const { t } = useTranslation();

    // Determinar color
    let progressColor = 'var(--text-muted)'; // Normal
    if (stats.isWarning) progressColor = '#eab308'; // Amarillo
    if (stats.isCritical) progressColor = '#ef4444'; // Rojo

    const formattedUsed = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(stats.used);
    const formattedTotal = new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(stats.total);

    return (
        <div className="token-gauge-container" role="meter" aria-label={t('tokens.label')} aria-valuenow={stats.used} aria-valuemax={stats.total}>
            
            {/* Popover simple de información */}
            {showInfo && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: 0, right: 0, 
                    background: '#18181b', border: '1px solid #27272a', padding: 12, borderRadius: 8, 
                    fontSize: 11, color: '#a1a1aa', zIndex: 50, marginBottom: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom: 4}}>
                        <strong style={{color:'#f4f4f5'}}>{t('tokens.popover.title')}</strong>
                        <button onClick={() => setShowInfo(false)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer'}} aria-label={t('btn.close')}><Icons.X size={12}/></button>
                    </div>
                    {t('tokens.popover.desc')}
                </div>
            )}

            <div className="token-info">
                <div style={{display:'flex', alignItems:'center', gap: 6}}>
                    <button 
                        type="button" 
                        onClick={() => setShowInfo(!showInfo)} 
                        style={{background:'none', border:'none', cursor:'pointer', padding:0, color:'var(--text-muted)', display:'flex'}}
                        aria-label={t('shortcuts.help')}
                    >
                        <Icons.Help size={10} />
                    </button>
                    <span className="token-label">{t('tokens.label')}</span>
                    {stats.imageCount > 0 && onOptimize && (
                        <button 
                            onClick={onOptimize} 
                            className="token-optimize-btn" 
                            title={t('tokens.optimize.tooltip')}
                            aria-label={t('tokens.optimize.tooltip')}
                        >
                           <Icons.Clear size={10} />
                           <span>{stats.imageCount} {t('tokens.optimize.btn')}</span>
                        </button>
                    )}
                </div>
                <span className="token-values" style={{ color: stats.isCritical ? '#ef4444' : 'inherit' }}>
                    {formattedUsed} / {formattedTotal} tk
                </span>
            </div>
            <div className="progress-bg">
                <div 
                    className="progress-fill" 
                    style={{ 
                        width: `${stats.percentage}%`,
                        backgroundColor: progressColor
                    }} 
                />
            </div>
        </div>
    );
};
