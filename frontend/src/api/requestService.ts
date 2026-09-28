import api from './axiosConfig';
import { handleApiError } from './errorHandler';
import type { Request } from '../models/Request';
import type { CoursExterneDemandeInput } from '../models/CoursExterneDemande';

export const requestService = {
    // Récupère toutes les demandes de l'utilisateur connecté
    getMyRequests: async (): Promise<Request[]> => {
        try {
            const response = await api.get<Request[]>('/requests');
            return response.data;
        } catch (error) {
            handleApiError(error, 'la récupération des demandes');
        }
    },

    // Crée une nouvelle demande de dispense
    createRequest: async (
        ueCode: string,
        sectionCode: string,
        motif: string,
        files?: File[],
        coursExternes?: CoursExterneDemandeInput[]
    ): Promise<Request> => {
        try {
            const formData = new FormData();
            formData.append('ueCode', ueCode);
            formData.append('sectionCode', sectionCode);
            formData.append('motif', motif);
            files?.forEach(file => formData.append('files', file));

            if (coursExternes && coursExternes.length > 0) {
                formData.append('coursExternes', JSON.stringify(coursExternes));
            }

            const response = await api.post<Request>('/requests', formData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'la création de la demande');
        }
    },

    // Récupère les détails d'une demande par son ID
    getRequestById: async (id: number): Promise<Request> => {
        try {
            const response = await api.get<Request>(`/requests/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'la récupération des détails de la demande');
        }
    },

    // Uploade des documents supplémentaires pour une demande existante
    uploadAdditionalDocuments: async (id: number, files: File[]): Promise<Request> => {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const response = await api.post<Request>(`/requests/${id}/documents`, formData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'l\'ajout de documents');
        }
    }
};