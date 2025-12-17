
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const Spinner: React.FC<{ size?: number }> = ({ size = 24 }) => {
    const { t } = useTranslation();
    return (
        <div 
            className="spinner-ring" 
            style={{ width: size, height: size }} 
            role="status" 
            aria-label={t('aria.loading')} 
        />
    );
};
