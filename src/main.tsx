import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles } from 'lucide-react';
import App from './App.tsx';
import './index.css';
import { initServiceWorker } from './utils/pushManager';
import { safeGetStorage } from './utils/safeStorage';

// Global fetch override to inject Authorization token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const token = safeGetStorage<string | null>('loop_auth_token', null);
  if (token && typeof resource === 'string' && resource.startsWith('/api/')) {
    config = config || {};
    const headers = new Headers(config.headers || {});
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    config.headers = headers;
  }
  return originalFetch(resource, config);
};

// Auto-register service worker for Web Push & PWA
initServiceWorker().catch(() => {});

// Guard against cross-origin iframe sandbox and third-party script errors
if (typeof window !== 'undefined') {
  window.onerror = function (msg) {
    if (typeof msg === 'string' && (msg.includes('Script error') || !msg)) {
      return true; // suppresses cross-origin script error from triggering platform error overlay
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    if (!event.message || event.message === 'Script error.' || event.message.includes('Script error')) {
      event.preventDefault?.();
      event.stopImmediatePropagation?.();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global Safe Handler] Handled rejection:', event.reason);
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
  });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <Sparkles className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Loop • Гармония пары</h1>
          <p className="text-sm text-slate-300 max-w-sm mb-6">
            Произошла небольшая заминка при загрузке. Нажмите кнопку ниже для обновления.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg"
          >
            Перезагрузить приложение
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);



