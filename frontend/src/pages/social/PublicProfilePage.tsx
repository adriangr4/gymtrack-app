import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, UserCheck, UserPlus, Dumbbell, ChefHat, Loader2 } from 'lucide-react';
import {
    getPublicProfile, getUserPosts, followUser, unfollowUser,
    type PublicUserProfile, type Post
} from '../../services/social';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'routine' | 'diet'>('routine');
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (userId && currentUser?.id && userId === currentUser.id) {
            navigate('/profile', { replace: true });
            return;
        }
    }, [userId, currentUser?.id]);

    useEffect(() => {
        if (!userId || (currentUser?.id && userId === currentUser.id)) return;
        setLoading(true);
        getPublicProfile(userId, currentUser?.id)
            .then(p => setProfile(p))
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
        getUserPosts(userId)
            .then(setPosts)
            .catch(() => setPosts([]));
    }, [userId, currentUser?.id]);

    const handleFollow = async () => {
        if (!profile || !userId) return;
        setFollowLoading(true);
        try {
            if (profile.is_following) {
                await unfollowUser(userId, currentUser?.id ?? '');
                setProfile(p => p ? { ...p, is_following: false, followers_count: p.followers_count - 1 } : p);
            } else {
                await followUser(userId, currentUser?.id ?? '', currentUser?.username, currentUser?.profilePicture);
                setProfile(p => p ? { ...p, is_following: true, followers_count: p.followers_count + 1 } : p);
            }
        } catch (e) {
            console.error('Follow action failed', e);
        } finally {
            setFollowLoading(false);
        }
    };

    const filteredPosts = posts.filter(p => p.content_type === activeTab);

    if (loading) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16 }}>
                <div style={{ fontSize: 48 }}>👤</div>
                <p style={{ color: 'var(--fg-mute)', fontSize: 15, fontWeight: 600 }}>Usuario no encontrado</p>
                <button onClick={() => navigate(-1)} style={{ color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Volver</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">

            {}
            <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="size-6" />
                </button>
                <h1 className="font-bold text-lg flex-1 truncate">{profile.username}</h1>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

                {}
                <div className="bg-card rounded-3xl border border-border p-6 flex items-center gap-5">
                    <div
                        className="size-20 rounded-full ring-4 ring-primary ring-offset-2 ring-offset-background bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url("${profile.profile_picture || 'https://ui-avatars.com/api/?name=User&background=135bec&color=fff&size=100'}")` }}
                    />
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black truncate">{profile.username}</h2>

                        {}
                        <div className="flex gap-4 mt-1 mb-3">
                            <div className="text-center">
                                <p className="font-bold text-lg leading-tight">{profile.followers_count}</p>
                                <p className="text-xs text-muted-foreground">Seguidores</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg leading-tight">{profile.following_count}</p>
                                <p className="text-xs text-muted-foreground">Siguiendo</p>
                            </div>
                        </div>

                        {}
                        <button
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={cn(
                                'flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all active:scale-95 disabled:opacity-60',
                                profile.is_following
                                    ? 'bg-muted text-muted-foreground border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
                                    : 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90'
                            )}
                        >
                            {followLoading
                                ? <Loader2 className="size-4 animate-spin" />
                                : profile.is_following
                                    ? <><UserCheck className="size-4" /> Siguiendo</>
                                    : <><UserPlus className="size-4" /> Seguir</>
                            }
                        </button>
                    </div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Dumbbell className="size-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Media Rutinas</p>
                            <div className="flex items-center gap-1">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <p className="text-xl font-black">{profile.routine_avg_rating.toFixed(1)}</p>
                                <span className="text-xs text-muted-foreground">/5</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                        <div className="p-2.5 bg-green-500/10 rounded-xl">
                            <ChefHat className="size-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Media Dietas</p>
                            <div className="flex items-center gap-1">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <p className="text-xl font-black">{profile.diet_avg_rating.toFixed(1)}</p>
                                <span className="text-xs text-muted-foreground">/5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="flex gap-2 bg-muted/50 p-1 rounded-2xl">
                    {(['routine', 'diet'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all',
                                activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab === 'routine'
                                ? <><Dumbbell className="size-4" /> Rutinas</>
                                : <><ChefHat className="size-4" /> Dietas</>
                            }
                        </button>
                    ))}
                </div>

                {}
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-4xl mb-3">{activeTab === 'routine' ? '🏋️' : '🥗'}</p>
                        <p className="font-medium">No ha compartido {activeTab === 'routine' ? 'rutinas' : 'dietas'} todavía</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredPosts.map(post => {
                            const fallback = post.content_type === 'routine'
                                ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'
                                : 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop';
                            const avgRating = post.rating_count > 0 ? (post.rating_sum / post.rating_count).toFixed(1) : '−';

                            return (
                                <div key={post.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                                    <div
                                        className="aspect-square bg-cover bg-center"
                                        style={{ backgroundImage: `url("${post.content_image || fallback}")` }}
                                    />
                                    <div className="p-3">
                                        <p className="font-bold text-sm truncate">{post.content_name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                            <span className="text-xs text-muted-foreground">{avgRating} · {post.likes.length} ❤️</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
