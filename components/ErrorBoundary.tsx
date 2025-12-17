import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icons } from './Icon';
import { LanguageContext } from '../contexts/LanguageContext';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;
  declare props: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.context || { t: (k: string) => k };

      return (
        <div className="error-boundary-container">
          <div className="error-card">
            <div className="error-icon">
                <Icons.Bug size={48} />
            </div>
            <h2>{t('error.title')}</h2>
            <p>{t('error.desc')}</p>
            {this.state.error && (
                <pre className="error-details">{this.state.error.message}</pre>
            )}
            <button onClick={this.handleReload} className="reload-btn" aria-label={t('error.reload')}>
               <Icons.Zap size={16} /> {t('error.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}