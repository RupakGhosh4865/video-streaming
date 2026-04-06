import authService from './authService';

export const getUsers = async () => {
    try {
        const response = await authService.get('/admin/users');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const response = await authService.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteVideo = async (videoId) => {
    try {
        const response = await authService.delete(`/admin/videos/${videoId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
