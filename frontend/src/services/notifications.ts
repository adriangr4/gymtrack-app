import { collection, getDocs, addDoc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Notification {
    id: string;
    recipient_id: string;
    actor_id: string;
    actor_name: string;
    actor_avatar?: string;
    type: 'follow' | 'import_routine' | 'import_diet' | 'like' | 'comment';
    message: string;
    read: boolean;
    created_at: string;
    related_id?: string;
}

export const createNotification = async (data: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            ...data,
            read: false,
            created_at: new Date().toISOString(),
        });
    } catch (e) {
        console.error('createNotification error:', e);
    }
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const snap = await getDocs(query(
            collection(db, 'notifications'),
            where('recipient_id', '==', userId),
        ));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Notification))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (e) {
        console.error('getNotifications error:', e);
        return [];
    }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
    try {
        const snap = await getDocs(query(
            collection(db, 'notifications'),
            where('recipient_id', '==', userId),
            where('read', '==', false),
        ));
        return snap.size;
    } catch {
        return 0;
    }
};

export const markAllRead = async (userId: string): Promise<void> => {
    try {
        const snap = await getDocs(query(
            collection(db, 'notifications'),
            where('recipient_id', '==', userId),
            where('read', '==', false),
        ));
        if (snap.empty) return;
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.update(d.ref, { read: true }));
        await batch.commit();
    } catch (e) {
        console.error('markAllRead error:', e);
    }
};

export function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `hace ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `hace ${d}d`;
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
