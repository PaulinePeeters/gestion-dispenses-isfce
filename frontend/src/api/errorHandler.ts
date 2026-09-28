import { isAxiosError } from 'axios';

// Extrait un message d'erreur lisible depuis une erreur API
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.response) {
            const { status, data } = error.response;

            if (typeof data === 'string' && data) return data;
            if (typeof data?.message === 'string' && data.message) return data.message;

            // Message par défaut selon le code HTTP
            const messages: Record<number, string> = {
                400: 'Requête invalide.',
                401: 'Non autorisé. Veuillez vous reconnecter.',
                403: 'Accès refusé.',
                404: 'Ressource non trouvée.',
                409: 'Cette ressource existe déjà.',
                500: 'Erreur interne du serveur.'
            };

            return messages[status] || `Erreur ${status}`;
        }

        if (error.code === 'ECONNABORTED') return 'La requête a expiré.';
        if (error.request) return 'Impossible de contacter le serveur.';
    }

    return error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite.';
}

// Gère une erreur de manière standardisée et retourne un message utilisateur
export function handleApiError(error: unknown, context?: string): never {
    const message = getErrorMessage(error);
    console.error(context ? `Erreur lors de ${context}:` : 'Erreur:', error);
    throw new Error(context ? `Erreur lors de ${context}: ${message}` : message);
}