import { useState, useEffect, type ReactNode, useCallback, useMemo, useRef } from 'react';
import keycloak, { keycloakConfig } from '../auth/keycloak';
import type { KeycloakTokenParsed } from 'keycloak-js';
import { AuthContext } from './AuthContext';
import Button from '../components/Button';

// Fournisseur d'authentification

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | undefined>(undefined); // Token d'accès
    const [user, setUser] = useState<KeycloakTokenParsed | undefined | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isRun = useRef(false);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (isRun.current) return;
        isRun.current = true;

        // Si Keycloak ne répond pas au bout de 5 secondes -> on affiche une erreur
        const timeoutId = setTimeout(() => {
            if (!isInitializedRef.current) {
                setError('Délai d\'attente dépassé pour Keycloak. Le serveur est-il démarré ?');
                setIsInitialized(true);
            }
        }, 5000);

        // Initialisation de Keycloak
        const initKeycloak = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso', // Vérifie si l'utilisateur est déjà connecté
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    checkLoginIframe: false,
                    enableLogging: import.meta.env.DEV
                });

                setIsAuthenticated(authenticated);
                if (authenticated) {
                    setToken(keycloak.token);
                    setUser(keycloak.tokenParsed);
                }
            } catch (err) {
                console.error('Erreur lors de l\'initialisation de Keycloak:', err);
                const message = err instanceof Error ? err.message : String(err);
                setError(message || 'Échec de l\'initialisation Keycloak.');
            } finally {
                isInitializedRef.current = true;
                setIsInitialized(true);
                clearTimeout(timeoutId);
            }
        };

        initKeycloak();
    }, []);

    const login = useCallback(() => keycloak.login().catch(e => console.error("Échec de la connexion", e)), []);
    const register = useCallback(() => keycloak.register().catch(e => console.error("Échec de l'inscription", e)), []);
    const logout = useCallback(() => keycloak.logout(), []);
    const hasRole = useCallback((role: string) => keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role), []);

    const contextValue = useMemo(() => ({ 
        isAuthenticated, token, user, login, register, logout, hasRole
    }), [isAuthenticated, token, user, login, register, logout, hasRole]);
    // Dit à React de ne pas recréer le contexte à chaque rendu

    if (!isInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 font-sans">
                <div className="text-xl font-semibold text-gray-600">Chargement de l'authentification...</div>
                <div className="text-sm text-gray-400">Connexion à {keycloakConfig.url}...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50 p-6 font-sans">
                <div className="text-xl font-bold text-red-600">Erreur d'authentification</div>
                <div className="text-gray-700 bg-white p-6 rounded-2xl shadow-lg border border-red-100 max-w-lg w-full">
                    <p className="mb-4 font-mono text-sm text-red-500 break-words bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
                    <p className="text-sm mb-4 font-medium text-gray-700">
                        Veuillez vérifier les points suivants :
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-600 font-normal">
                            <li>Keycloak tourne sur <strong>{keycloakConfig.url}</strong> ?</li>
                            <li>Realm <strong>{keycloakConfig.realm}</strong> correct ?</li>
                            <li>Client ID <strong>{keycloakConfig.clientId}</strong> correct ?</li>
                            <li>Origine <strong>{window.location.origin}</strong> autorisée ?</li>
                        </ul>
                    </p>
                    <div className="flex gap-3 mt-6">
                        <Button onClick={() => window.location.reload()} className="flex-1">
                            Réessayer
                        </Button>
                        <Button variant="ghost" onClick={() => keycloak.login()} className="flex-1">
                            Forcer la connexion
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};