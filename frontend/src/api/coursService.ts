import api from './axiosConfig';
import type { CoursExterne } from '../models/CoursExterne';

// Service pour les cours externes
export const coursService = {
    // Récupère les cours pour un établissement donné
    getByEtablissement: (codeEtablissement: string): Promise<CoursExterne[]> =>
        api.get<CoursExterne[]>(`/cours-externes/etablissement/${codeEtablissement}`).then(r => r.data),
};
