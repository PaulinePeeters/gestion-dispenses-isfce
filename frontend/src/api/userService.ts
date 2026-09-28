import api from './axiosConfig';
import { handleApiError } from './errorHandler';
import type { UserDto } from '../models/User';

// Service pour gérer les utilisateurs
export const userService = {
    // Récupère un utilisateur par son username
    getUser: async (username: string): Promise<UserDto> => {
        try {
            const response = await api.get<UserDto>(`/user/profile/${username}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'la récupération de l\'utilisateur');
        }
    }
};
