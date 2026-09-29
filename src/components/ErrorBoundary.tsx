import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.removeItem('potato-sim-storage');
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#09090b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Nunito, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{
            backgroundColor: '#18181b',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 0 50px rgba(0,0,0,0.8)',
          }}>
            <div style={{ fontSize: '54px', marginBottom: '16px' }}>🥔</div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase' }}>
              Что-то пошло не так
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '20px', lineHeight: 1.5 }}>
              Игра столкнулась с непредвиденной ошибкой. Вы можете перезагрузить игру или сбросить повреждённый кэш сессии.
            </p>
            {this.state.error?.message && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                marginBottom: '24px',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  backgroundColor: '#f59e0b',
                  color: '#18181b',
                  fontWeight: 900,
                  fontSize: '15px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Перезагрузить
              </button>
              <button
                onClick={this.handleClearAndReload}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              >
                Сбросить кэш
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
