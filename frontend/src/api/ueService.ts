import api from './axiosConfig';
import { handleApiError } from './errorHandler';
import type { Section } from '../models/Section';
import type { UE } from '../models/UE';

export const ueService = {
    // Récupère les sections
    getSections: async (): Promise<Section[]> => {
        try {
            const response = await api.get<Section[]>('/ue/sections');
            return response.data;
        } catch (error) {
            handleApiError(error, 'la récupération des sections');
        }
    },

    // Récupère les UEs filtrées par section
    getUEs: async (section?: string): Promise<UE[]> => {
        try {
            const response = await api.get<UE[]>('/ue/liste', {
                params: section ? { section } : undefined
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'la récupération des UEs');
        }
    }
};