import api from './axiosConfig';
import { handleApiError } from './errorHandler';
import { isAxiosError } from 'axios';

import type { DossierDto } from '../models/Dossier';

// Service pour les dossiers
export const dossierService = {
    // Récupère le dossier actuel
    getCurrentDossier: async (): Promise<DossierDto | null> => {
        try {
            const response = await api.get<DossierDto>('/dossier/current');
            return response.data ?? null;
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw new Error(handleApiError(error, 'la récupération du dossier actuel'));
        }
    }
};