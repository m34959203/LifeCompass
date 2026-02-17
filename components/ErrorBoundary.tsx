import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#1e272e] rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            {this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                  Подробности ошибки
                </summary>
                <pre className="mt-2 p-3 bg-slate-50 dark:bg-[#131b20] rounded-lg text-xs text-red-500 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-primary/20"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => window.location.hash = '#/dashboard'}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium text-sm transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
