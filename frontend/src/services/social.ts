import {
    collection, getDocs, getDoc, doc, addDoc, deleteDoc, updateDoc,
    query, where, orderBy, arrayUnion, arrayRemove, increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Post {
    id: string;
    content_type: 'routine' | 'diet';
    content_id: string;
    content_name: string;
    content_image?: string;
    creator_id: string;
    creator_name: string;
    creator_avatar?: string;
    likes: string[];
    rating_sum: number;
    rating_count: number;
    comment_count: number;
    created_at: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    text: string;
    created_at: string;
}

export interface PublicUserProfile {
    id: string;
    username: string;
    profile_picture?: string;
    followers_count: number;
    following_count: number;
    is_following: boolean;
    routine_avg_rating: number;
    diet_avg_rating: number;
}

export const getMutualFollowIds = async (userId: string): Promise<string[]> => {
    const [followingSnap, followersSnap] = await Promise.all([
        getDocs(query(collection(db, 'follows'), where('follower_id', '==', userId))),
        getDocs(query(collection(db, 'follows'), where('following_id', '==', userId))),
    ]);
    const following = new Set(followingSnap.docs.map(d => (d.data() as any).following_id as string));
    const followers = new Set(followersSnap.docs.map(d => (d.data() as any).follower_id as string));
    return [...following].filter(id => followers.has(id));
};

export const getSocialFeed = async (filter: string = 'global', userId?: string): Promise<Post[]> => {
    try {
        const snap = await getDocs(query(collection(db, 'posts'), orderBy('created_at', 'desc')));
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
        if (filter === 'friends' && userId) {
            const mutualIds = await getMutualFollowIds(userId);
            return posts.filter(p => mutualIds.includes(p.creator_id));
        }
        return posts;
    } catch {
        // Fallback sin orderBy si falta índice
        const snap = await getDocs(collection(db, 'posts'));
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (filter === 'friends' && userId) {
            const mutualIds = await getMutualFollowIds(userId);
            return posts.filter(p => mutualIds.includes(p.creator_id));
        }
        return posts;
    }
};

export const shareToCommunity = async (payload: Omit<Post, 'id' | 'likes' | 'rating_sum' | 'rating_count' | 'comment_count'>): Promise<Post> => {
    const ref = await addDoc(collection(db, 'posts'), {
        ...payload,
        likes: [],
        rating_sum: 0,
        rating_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
    });
    return { id: ref.id, likes: [], rating_sum: 0, rating_count: 0, comment_count: 0, ...payload };
};

export const toggleLike = async (
    postId: string,
    userId: string,
    currentLikes: string[],
    actorName?: string,
    actorAvatar?: string,
): Promise<{ success: boolean; likes: string[] }> => {
    const ref = doc(db, 'posts', postId);
    const hasLiked = currentLikes.includes(userId);
    await updateDoc(ref, { likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId) });
    const newLikes = hasLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId];

    if (!hasLiked && actorName) {
        try {
            const postSnap = await getDoc(ref);
            const data: any = postSnap.data();
            const recipient = data?.creator_id;
            if (recipient && recipient !== userId) {
                const { createNotification } = await import('./notifications');
                await createNotification({
                    recipient_id: recipient,
                    actor_id: userId,
                    actor_name: actorName,
                    actor_avatar: actorAvatar,
                    type: 'like',
                    message: `${actorName} ha valorado tu publicación${data?.content_name ? ` "${data.content_name}"` : ''}`,
                    related_id: postId,
                });
            }
        } catch {}
    }

    return { success: true, likes: newLikes };
};

export const ratePost = async (postId: string, score: number): Promise<{ success: boolean }> => {
    await updateDoc(doc(db, 'posts', postId), {
        rating_sum: increment(score),
        rating_count: increment(1),
    });
    return { success: true };
};

export const importContent = async (
    contentType: 'routine' | 'diet',
    contentId: string,
    userId: string,
    actorName?: string,
    actorAvatar?: string,
): Promise<{ success: boolean; new_id: string; type: string }> => {
    const colName = contentType === 'routine' ? 'routines' : 'diets';
    const snap = await getDoc(doc(db, colName, contentId));
    if (!snap.exists()) throw new Error('Content not found');

    const data = snap.data();
    const originalCreatorId: string | undefined = (data as any).creator_id || (data as any).user_id;
    const contentName: string = (data as any).name || '';

    const { id: _id, creator_id: _c, user_id: _u, ...rest } = data as any;
    const ref = await addDoc(collection(db, colName), {
        ...rest,
        creator_id: userId,
        user_id: userId,
        imported_from: contentId,
        created_at: new Date().toISOString(),
    });

    if (contentType === 'routine') {
        const exSnap = await getDocs(query(
            collection(db, 'routine_exercises'),
            where('routine_id', '==', contentId),
        ));
        await Promise.all(exSnap.docs.map(d => {
            const { routine_id: _r, ...exData } = d.data();
            return addDoc(collection(db, 'routine_exercises'), { ...exData, routine_id: ref.id });
        }));
    }

    // Notify original creator
    if (actorName && originalCreatorId && originalCreatorId !== userId) {
        const { createNotification } = await import('./notifications');
        await createNotification({
            recipient_id: originalCreatorId,
            actor_id: userId,
            actor_name: actorName,
            actor_avatar: actorAvatar,
            type: contentType === 'routine' ? 'import_routine' : 'import_diet',
            message: `${actorName} ha importado tu ${contentType === 'routine' ? 'rutina' : 'dieta'}${contentName ? ` "${contentName}"` : ''}`,
            related_id: contentId,
        });
    }

    return { success: true, new_id: ref.id, type: contentType };
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    try {
        const snap = await getDocs(query(
            collection(db, 'comments'),
            where('post_id', '==', postId),
            orderBy('created_at', 'asc'),
        ));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    } catch {
        // Fallback without orderBy if composite index doesn't exist
        const snap = await getDocs(query(collection(db, 'comments'), where('post_id', '==', postId)));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Comment))
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
};

export const addComment = async (postId: string, text: string, userId: string, username: string, actorAvatar?: string): Promise<Comment> => {
    const ref = await addDoc(collection(db, 'comments'), {
        post_id: postId,
        author_id: userId,
        author_name: username,
        author_avatar: actorAvatar ?? '',
        text,
        created_at: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'posts', postId), { comment_count: increment(1) });

    try {
        const postSnap = await getDoc(doc(db, 'posts', postId));
        const data: any = postSnap.data();
        const recipient = data?.creator_id;
        if (recipient && recipient !== userId) {
            const { createNotification } = await import('./notifications');
            await createNotification({
                recipient_id: recipient,
                actor_id: userId,
                actor_name: username,
                actor_avatar: actorAvatar,
                type: 'comment',
                message: `${username} ha comentado tu publicación${data?.content_name ? ` "${data.content_name}"` : ''}: "${text.slice(0, 60)}"`,
                related_id: postId,
            });
        }
    } catch {}

    return { id: ref.id, post_id: postId, author_id: userId, author_name: username, author_avatar: actorAvatar ?? '', text, created_at: new Date().toISOString() };
};

export const getPublicProfile = async (userId: string, currentUserId?: string): Promise<PublicUserProfile | null> => {
    try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (!snap.exists()) return null;
        const d = snap.data();

        const [followersSnap, followingSnap] = await Promise.all([
            getDocs(query(collection(db, 'follows'), where('following_id', '==', userId))),
            getDocs(query(collection(db, 'follows'), where('follower_id', '==', userId))),
        ]);

        let is_following = false;
        if (currentUserId) {
            const isFollowSnap = await getDocs(query(
                collection(db, 'follows'),
                where('follower_id', '==', currentUserId),
                where('following_id', '==', userId),
            ));
            is_following = !isFollowSnap.empty;
        }

        return {
            id: userId,
            username: d.username,
            profile_picture: d.profile_picture,
            followers_count: followersSnap.size,
            following_count: followingSnap.size,
            is_following,
            routine_avg_rating: 0,
            diet_avg_rating: 0,
        };
    } catch (e) {
        console.error('getPublicProfile error:', e);
        return null;
    }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
    try {
        const snap = await getDocs(query(
            collection(db, 'posts'),
            where('creator_id', '==', userId),
            orderBy('created_at', 'desc'),
        ));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
    } catch {
        // Fallback sin orderBy si falta el índice compuesto
        const snap = await getDocs(query(
            collection(db, 'posts'),
            where('creator_id', '==', userId),
        ));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Post))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
};

export const followUser = async (
    targetId: string,
    userId: string,
    actorName?: string,
    actorAvatar?: string,
): Promise<{ success: boolean; action: string }> => {
    await addDoc(collection(db, 'follows'), {
        follower_id: userId,
        following_id: targetId,
        created_at: new Date().toISOString(),
    });
    if (actorName && targetId !== userId) {
        const { createNotification } = await import('./notifications');
        await createNotification({
            recipient_id: targetId,
            actor_id: userId,
            actor_name: actorName,
            actor_avatar: actorAvatar,
            type: 'follow',
            message: `${actorName} ha comenzado a seguirte`,
        });
    }
    return { success: true, action: 'followed' };
};

export const unfollowUser = async (targetId: string, userId: string): Promise<{ success: boolean; action: string }> => {
    const snap = await getDocs(query(
        collection(db, 'follows'),
        where('follower_id', '==', userId),
        where('following_id', '==', targetId),
    ));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    return { success: true, action: 'unfollowed' };
};

export const deletePost = async (postId: string): Promise<{ success: boolean }> => {
    await deleteDoc(doc(db, 'posts', postId));
    return { success: true };
};

export const deleteComment = async (postId: string, commentId: string): Promise<{ success: boolean }> => {
    await deleteDoc(doc(db, 'comments', commentId));
    await updateDoc(doc(db, 'posts', postId), { comment_count: increment(-1) });
    return { success: true };
};
