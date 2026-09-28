import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Composant ErrorBoundary pour capturer les erreurs React.
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Méthode pour réinitialiser l'état de l'erreur et tenter de rendre à nouveau les enfants
    public resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    return this.props.fallback (this.state.error!, this.resetError);
                }
                return this.props.fallback;
            }

            // Interface de secours par défaut
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center flex flex-col items-center justify-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-red-900 mb-2">
                        Une erreur est survenue
                    </h2>
                    <p className="text-red-700 mb-6 text-sm max-w-sm">
                        Le composant n'a pas pu s'afficher correctement. Vous pouvez essayer de le recharger.
                    </p>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={this.resetError}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm shadow-sm"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-white border border-red-300 text-red-700 hover:bg-red-50 font-medium py-2 px-4 rounded transition-colors text-sm"
                        >
                            Recharger la page
                        </button>
                    </div>

                    {this.state.error && (
                        <details className="mt-6 w-full max-w-lg text-left">
                            <summary className="cursor-pointer text-xs text-red-400 hover:text-red-600 font-medium select-none">
                                Détails techniques
                            </summary>
                            <pre className="mt-2 text-[10px] bg-white p-3 border border-red-100 rounded overflow-auto text-red-800 max-h-32 shadow-inner">
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
