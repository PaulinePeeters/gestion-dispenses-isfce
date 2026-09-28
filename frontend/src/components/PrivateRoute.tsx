import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

interface PrivateRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

// Composant PrivateRoute avec rôles autorisés
const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
    const { isAuthenticated, login, hasRole } = useAuth();
    const navigate = useNavigate();

    // Vérifie si l'utilisateur est connecté
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center bg-white p-12 border-2 border-gray-300 shadow-2xl max-w-md w-full">
                    <div className="w-16 h-16 bg-orange-600 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black mb-4 text-gray-900 uppercase tracking-tight">Accès Restreint</h2>
                    <p className="text-gray-600 mb-8 text-sm font-medium leading-relaxed">
                        Vous devez être connecté pour accéder à cette page.
                    </p>
                    <Button variant="primary" size="lg" onClick={login} className="w-full">
                        Se Connecter
                    </Button>
                </div>
            </div>
        );
    }

    // Vérifie si l'utilisateur a les rôles requis
    if (roles && !roles.some(role => hasRole(role))) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center bg-white p-12 border-2 border-red-300 shadow-2xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-600 mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black mb-4 text-gray-900 uppercase tracking-tight">Accès Refusé</h2>
                    <p className="text-gray-600 mb-8 text-sm font-medium leading-relaxed">
                        Vous n'avez pas les permissions requises pour voir cette page.
                    </p>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="w-full">
                        Retour
                    </Button>
                </div>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;