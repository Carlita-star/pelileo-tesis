import { Component } from 'react';
import { handleAppError } from '../services/errorService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    handleAppError(error, {
      modulo: 'react',
      path: window.location.pathname,
      metadata: { componentStack: info.componentStack },
    });
  }

  render() {
    const { hasError, error } = this.state;
    if (!hasError) return this.props.children;

    return (
      <div className="error-boundary-fallback" role="alert">
        <h2>Ocurrió un error en la interfaz</h2>
        <p>La pantalla no pudo cargarse correctamente. Intente recargar la página.</p>
        {process.env.NODE_ENV === 'development' && error && (
          <pre className="error-boundary-stack">{error.message}</pre>
        )}
        <button type="button" onClick={() => window.location.reload()}>
          Recargar página
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
