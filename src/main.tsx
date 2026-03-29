import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import './index.css';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans text-center">
      <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        ⚠️
      </div>
      <h1 className="text-2xl font-serif font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="py-3 px-6 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full font-medium transition-all shadow-md"
      >
        Try again
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
