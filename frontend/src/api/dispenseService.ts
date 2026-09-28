import api from './axiosConfig';
import { handleApiError } from './errorHandler';

import type { SimulationRequest, SimulationResponse } from '../models/Simulation';

// Service pour interroger l'API de simulation de dispenses (sans création de demande officielle)
export const dispenseService = {
    // Envoie une liste de cours pour vérifier s'ils couvrent l'UE demandée
    simulerPourUE: async (request: SimulationRequest): Promise<SimulationResponse> => {
        try {
            const response = await api.post<SimulationResponse>('/dispenses/simuler', request);
            return response.data;
        } catch (error) {
            handleApiError(error, 'la simulation de la demande de dispense');
        }
    }
};
