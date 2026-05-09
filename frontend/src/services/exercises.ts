import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    const snap = await getDocs(collection(db, 'exercises'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
};
