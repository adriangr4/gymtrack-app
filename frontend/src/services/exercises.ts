import api from '../api/client';

export interface Exercise {
    id: string;
    name: string;
    description?: string;
    muscle_group?: string;
    type?: string;
    image_url?: string;
    video_url?: string;
}

export const getExercises = async (): Promise<Exercise[]> => {
    const response = await api.get<Exercise[]>('/exercises/');
    return response.data;
};
