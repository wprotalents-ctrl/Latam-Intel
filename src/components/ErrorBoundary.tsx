import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let errorDetails = '';

      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = parsedError.error;
            errorDetails = `Operation: ${parsedError.operationType} on ${parsedError.path}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-red-500/30 p-8 rounded-sm text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-text mb-2">System Error Detected</h2>
            <p className="text-text/60 text-sm mb-6 leading-relaxed">
              {errorMessage}
              {errorDetails && <span className="block mt-2 opacity-50 mono text-[10px]">{errorDetails}</span>}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-text text-bg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
            >
              <RefreshCw size={14} /> Restart System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
