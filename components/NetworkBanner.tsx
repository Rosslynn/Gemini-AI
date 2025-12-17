
import React from 'react';
import { Icons } from './Icon';
import { useTranslation } from '../hooks/useTranslation';

export const NetworkBanner: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="network-banner" role="alert">
            <Icons.Globe size={14} />
            <span>{t('status.offline_desc')}</span>
        </div>
    );
};
