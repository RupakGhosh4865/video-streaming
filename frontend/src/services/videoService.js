import authService from './authService';

export const uploadVideo = async (formData, onProgress) => {
    try {
        const response = await authService.post('/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                if (onProgress) {
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getVideos = async () => {
    try {
        const response = await authService.get('/videos');
        return response.data;
    } catch (error) {
        throw error;
    }
};
