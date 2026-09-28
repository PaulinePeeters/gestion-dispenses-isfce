import api from './axiosConfig';
import type { Etablissement } from '../models/Etablissement';

// Service pour les établissements
export const etablissementService = {
    // Récupère la liste des établissements
    getAll: (): Promise<Etablissement[]> =>
        api.get<Etablissement[]>('/etablissements').then(r => r.data),
};
