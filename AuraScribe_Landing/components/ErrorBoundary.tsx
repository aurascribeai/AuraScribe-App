
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Fix: Use React.Component and property initialization for state to ensure the TypeScript compiler correctly identifies 'props' and 'state' from the React base class.
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle className="text-red-500 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-slate-400 max-w-md mb-8">
            An unexpected error has occurred. Our engineering team has been notified.
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 w-4 h-4" /> Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
