import { createContext, useContext } from 'react';
import type { KeycloakTokenParsed } from 'keycloak-js';

export interface AuthContextType {
    isAuthenticated: boolean;
    token: string | undefined;
    user: KeycloakTokenParsed | undefined | null;
    login: () => void;
    register: () => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};
