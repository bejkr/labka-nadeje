import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { PetProvider } from './contexts/PetContext';
import { AppProvider } from './contexts/AppContext';
import './index.css';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// Simple Error Boundary to catch crash on load
// FIX: Using React.Component and property initializer for state to fix TypeScript 'props' and 'state' not found errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Explicitly define props and state property to resolve "Property 'props' does not exist" and "Property 'state' does not exist" errors in specific TS environments
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // CRITICAL FIX: Do not log the full errorInfo object directly.
    // WebContainers/Sandboxes try to structure-clone console args, and React error objects 
    // often contain non-clonable data (like DOM nodes or functions), causing "The object can not be cloned".
    console.error("Uncaught error:", error?.message || error);
    if (errorInfo && errorInfo.componentStack) {
      console.error("Component Stack:", errorInfo.componentStack);
    }
  }

  render() {
    // FIX: Destructuring from this.props and this.state now correctly identified via explicit member definitions to resolve Property 'props' does not exist error on line 41
    const { children } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : (typeof error === 'object' ? 'Unknown error occurred' : String(error));

      return (
        <div style={{ padding: '40px', color: '#B91C1C', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Something went wrong</h1>
          <pre style={{ background: '#FEF2F2', padding: '20px', borderRadius: '8px', textAlign: 'left', overflow: 'auto', border: '1px solid #FECACA' }}>
            {errorMsg}
          </pre>
          <p style={{ marginTop: '20px', color: '#4B5563' }}>Check the console for more details.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        {/* PetProvider must wrap AppProvider because AppContext uses usePets() */}
        <PetProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </PetProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);