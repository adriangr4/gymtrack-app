import { useState, useEffect, useRef } from 'react';
import { Heart, Star, Bookmark, ChefHat, Dumbbell, MessageCircle, X, Send, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getSocialFeed, toggleLike, ratePost, importContent,
    getComments, addComment, shareToCommunity,
    deletePost, deleteComment,
    type Post, type Comment
} from '../../services/social';
import api from '../../api/client';
import { getRoutines, clearRoutineCache } from '../../services/routines';
import { getRoutineImage, getDietImage, seedFrom } from '../../lib/imageUtils';
import { getDiets, clearDietsCache } from '../../services/diet';

/* ─── Comment drawer ────────────────────────────────── */
function CommentDrawer({ post, onClose }: { post: Post; onClose: () => void }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getComments(post.id).then(c => { setComments(c); setLoading(false); }).catch(() => setLoading(false));
    }, [post.id]);

    const handleSend = async () => {
        if (!text.trim() || !user) return;
        setSending(true);
        try {
            const c = await addComment(post.id, text.trim());
            setComments(prev => [...prev, c]);
            setText('');
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch {} finally { setSending(false); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try { await deleteComment(post.id, id); setComments(prev => prev.filter(c => c.id !== id)); } catch { alert('Error'); }
    };

    const sheet: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    };
    const panel: React.CSSProperties = {
        width: '100%', maxWidth: 480,
        background: 'var(--card)', border: '1px solid var(--line-2)',
        borderRadius: '24px 24px 0 0',
        display: 'flex', flexDirection: 'column', maxHeight: '80dvh',
    };

    return (
        <div style={sheet}>
            <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Comments</span>
                    <button onClick={onClose} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18}/></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>Loading…</p>}
                    {!loading && comments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>Be the first to comment 💬</p>}
                    {comments.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: c.author_avatar ? `url("${c.author_avatar}") center/cover` : 'var(--card-2)',
                                border: '1px solid var(--line)',
                            }}/>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ background: 'var(--card-2)', borderRadius: '4px 14px 14px 14px', padding: '8px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{c.author_name}</span>
                                        {user && (c.author_id === user.id || post.creator_id === user.id || user.is_admin) && (
                                            <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', padding: 0 }}><X size={11}/></button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--fg)', margin: 0 }}>{c.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef}/>
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--card-2)', border: '1px solid var(--line)' }}/>
                    <div style={{ flex: 1, height: 34, background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder="Add a comment…" style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: 'var(--fg)', fontSize: 12, fontFamily: 'inherit' }}/>
                    </div>
                    <button onClick={handleSend} disabled={!text.trim() || sending} style={{
                        width: 34, height: 34, borderRadius: 11, border: 0,
                        background: 'color-mix(in oklch, var(--accent) 18%, transparent)',
                        color: 'var(--accent)', display: 'grid', placeItems: 'center', cursor: 'pointer',
                        opacity: (!text.trim() || sending) ? 0.4 : 1,
                    }}>
                        {sending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Share selector ────────────────────────────────── */
type RatingModalState = { isOpen: boolean; postId: string | null; contentType: 'routine' | 'diet' | null; contentId: string | null; importAfterRating: boolean };

function ShareSelectorModal({ type, onClose, onShared }: { type: 'routine' | 'diet'; onClose: () => void; onShared: () => void }) {
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sharingId, setSharingId] = useState<string | null>(null);

    useEffect(() => {
        (type === 'routine' ? getRoutines() : getDiets()).then(setItems).catch(() => {}).finally(() => setLoading(false));
    }, [type]);

    const handleShare = async (item: any) => {
        if (!user) return;
        setSharingId(item.id);
        try {
            await shareToCommunity({ content_type: type, content_id: item.id, content_name: item.name || 'Plan', creator_id: user.id, creator_name: user.username, creator_avatar: user.profilePicture });
            alert('¡Compartido con éxito!');
            onShared(); onClose();
        } catch (e: any) { alert(e?.response?.data?.detail || 'Error al compartir'); }
        finally { setSharingId(null); }
    };

    const sheet: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' };
    const panel: React.CSSProperties = { width: '100%', maxWidth: 480, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', maxHeight: '80dvh' };

    return (
        <div style={sheet}>
            <div style={panel}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Share {type === 'routine' ? 'routine' : 'diet'}</span>
                    <button onClick={onClose} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18}/></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {loading && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>Loading…</p>}
                    {!loading && items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>No {type === 'routine' ? 'routines' : 'diets'} yet.</p>}
                    {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{item.name}</span>
                            <button onClick={() => handleShare(item)} disabled={sharingId === item.id} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: 'var(--accent)', color: 'var(--accent-ink)',
                                border: 0, borderRadius: 10, padding: '8px 14px',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                opacity: sharingId === item.id ? 0.5 : 1,
                            }}>
                                {sharingId === item.id ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>} Share
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Preview + import modal ────────────────────────── */
function ContentPreviewModal({ post, onClose, onImport, importing }: { post: Post; onClose: () => void; onImport: () => void; importing: boolean }) {
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/social/preview/${post.content_type}/${post.content_id}`)
            .then(r => setPreview(r.data)).catch(() => setPreview(null)).finally(() => setLoading(false));
    }, [post.content_id, post.content_type]);

    const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const byDay: Record<number, any[]> = {};
    if (preview?.exercises) for (const ex of preview.exercises) { const d = ex.day_of_week ?? 1; (byDay[d] = byDay[d] || []).push(ex); }

    const sheet: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' };
    const panel: React.CSSProperties = { width: '100%', maxWidth: 480, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', maxHeight: '85dvh' };

    return (
        <div style={sheet} onClick={onClose}>
            <div style={panel} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {post.content_type === 'routine' ? <Dumbbell size={18} color="var(--accent)"/> : <ChefHat size={18} color="var(--recovery)"/>}
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{post.content_name}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18}/></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>Loading…</p>}
                    {!loading && !preview && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '24px 0' }}>Could not load content.</p>}
                    {!loading && preview && post.content_type === 'routine' && (
                        Object.keys(byDay).length === 0
                            ? <p style={{ textAlign: 'center', color: 'var(--fg-mute)' }}>No exercises yet.</p>
                            : Object.entries(byDay).sort(([a], [b]) => Number(a) - Number(b)).map(([day, exs]) => (
                                <div key={day}>
                                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6 }}>{dayNames[Number(day)]}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {(exs as any[]).map((ex, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--card-2)', borderRadius: 12 }}>
                                                <Dumbbell size={14} color="var(--fg-dim)"/>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{ex.exercise?.name || 'Exercise'}</div>
                                                    <div className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>{ex.target_sets} × {ex.target_reps_min}–{ex.target_reps_max}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                    )}
                    {!loading && preview && post.content_type === 'diet' && (() => {
                        // Gather all meals: try weekly_plan first, fall back to meals[]
                        const allMeals: any[] = [];
                        if (preview.weekly_plan?.length > 0) {
                            preview.weekly_plan.forEach((day: any) => {
                                (day.meals || []).forEach((m: any) => allMeals.push({ ...m, day: day.day }));
                            });
                        } else {
                            (preview.meals || []).forEach((m: any) => allMeals.push(m));
                        }
                        if (allMeals.length === 0) return (
                            <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '16px 0' }}>No meals in this plan.</p>
                        );
                        // Group by meal name
                        const grouped: Record<string, any[]> = {};
                        allMeals.forEach(m => {
                            const key = m.name || 'Meal';
                            if (!grouped[key]) grouped[key] = [];
                            (m.foods || []).forEach((f: any) => grouped[key].push(f));
                        });
                        const MEAL_NAMES: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
                        return (
                            <>
                                {preview.daily_calories_target && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--card-2)', borderRadius: 12, marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>Daily target</span>
                                        <span className="num" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{preview.daily_calories_target} kcal</span>
                                    </div>
                                )}
                                {Object.entries(grouped).map(([mealKey, foods]) => (
                                    <div key={mealKey}>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase' }}>
                                            {MEAL_NAMES[mealKey.toLowerCase()] || mealKey}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {foods.map((food: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--card-2)', borderRadius: 12 }}>
                                                    <ChefHat size={13} color="var(--fg-dim)" style={{ flexShrink: 0 }}/>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
                                                        <div className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>
                                                            P {food.protein ?? 0}g · C {food.carbs ?? 0}g · F {food.fat ?? 0}g
                                                        </div>
                                                    </div>
                                                    <span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-mute)', whiteSpace: 'nowrap' }}>{Math.round(food.calories ?? 0)} kcal</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        );
                    })()}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
                    <button onClick={onImport} disabled={importing} style={{
                        width: '100%', height: 52, borderRadius: 16, border: 0,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.6 : 1,
                        boxShadow: '0 4px 20px color-mix(in oklch, var(--accent) 28%, transparent)',
                    }}>
                        {importing ? <Loader2 size={16} className="animate-spin"/> : <Bookmark size={16}/>}
                        {importing ? 'Importing…' : 'Import to library'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main page ─────────────────────────────────────── */

export function SocialPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'global' | 'friends'>('global');
    const [fabOpen, setFabOpen] = useState(false);
    const [ratingModal, setRatingModal] = useState<RatingModalState>({ isOpen: false, postId: null, contentType: null, contentId: null, importAfterRating: false });
    const [hoverScore, setHoverScore] = useState(0);
    const [commentDrawer, setCommentDrawer] = useState<Post | null>(null);
    const [importingId, setImportingId] = useState<string | null>(null);
    const [shareSelector, setShareSelector] = useState<'routine' | 'diet' | null>(null);
    const [previewPost, setPreviewPost] = useState<Post | null>(null);

    const fetchFeed = async (filter: 'global' | 'friends' = activeFilter) => {
        setLoading(true);
        try { const feed = await getSocialFeed(filter); setPosts(feed); } catch {} finally { setLoading(false); }
    };

    useEffect(() => { fetchFeed('global'); }, []);

    const handleLike = async (postId: string) => {
        if (!user) return;
        setPosts(cur => cur.map(p => {
            if (p.id !== postId) return p;
            const liked = p.likes.includes(user.id);
            return { ...p, likes: liked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id] };
        }));
        try { await toggleLike(postId); } catch { fetchFeed(); }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Delete this post?')) return;
        try { await deletePost(postId); setPosts(cur => cur.filter(p => p.id !== postId)); } catch { alert('Error'); }
    };

    const handleImport = async (post: Post) => {
        setImportingId(post.id);
        try {
            await importContent(post.id, post.content_type, post.content_id);
            if (post.content_type === 'diet') { clearDietsCache(); alert('¡Importado! Ya puedes verlo en tus dietas.'); }
            else { clearRoutineCache(); alert('¡Importado! Ya puedes verlo en tus rutinas.'); }
        } catch (e: any) {
            const detail = e?.response?.data?.detail;
            if (detail === 'rating_required') {
                setRatingModal({ isOpen: true, postId: post.id, contentType: post.content_type, contentId: post.content_id, importAfterRating: true });
            } else {
                alert(`Error: ${detail || 'Error al importar'}`);
            }
        } finally { setImportingId(null); }
    };

    const submitRating = async (score: number) => {
        const { postId, contentType, contentId, importAfterRating } = ratingModal;
        if (!postId || !contentType || !contentId) return;
        setRatingModal({ isOpen: false, postId: null, contentType: null, contentId: null, importAfterRating: false });
        setHoverScore(0);
        try {
            const res = await ratePost(postId, score, contentType, contentId);
            setPosts(cur => cur.map(p => p.id === postId ? { ...p, rating_sum: res.rating_sum, rating_count: res.rating_count } : p));
            if (importAfterRating) {
                try {
                    await importContent(postId, contentType, contentId);
                    if (contentType === 'diet') clearDietsCache(); else clearRoutineCache();
                    alert('¡Valorado e importado!');
                } catch { alert('Valoración guardada. Pulsa Importar de nuevo.'); }
            } else { alert('¡Valorado!'); }
        } catch (e: any) {
            const detail = e?.response?.data?.detail;
            if (detail === 'already_rated') {
                alert('Ya has valorado este contenido.');
                if (importAfterRating && contentType && contentId) {
                    try {
                        await importContent(postId, contentType, contentId);
                        if (contentType === 'diet') clearDietsCache(); else clearRoutineCache();
                        alert('¡Importado!');
                    } catch {}
                }
            } else { alert('Error al valorar'); }
        }
    };

    return (
        <div style={{ background: 'var(--bg)', paddingBottom: 90 }}>

            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg)',
                borderBottom: '1px solid var(--line)', padding: '10px 16px 0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                        <div className="eyebrow" style={{ marginBottom: 1 }}>COMMUNITY</div>
                        <div className="display" style={{ fontSize: 22, color: 'var(--fg)' }}>Feed</div>
                    </div>
                </div>
                {/* Tabs */}
                <div style={{ display: 'flex', padding: 4, borderRadius: 14, background: 'var(--card)', border: '1px solid var(--line)', marginBottom: 12 }}>
                    {(['global', 'friends'] as const).map(f => (
                        <button key={f} onClick={() => { setActiveFilter(f); fetchFeed(f); }} style={{
                            flex: 1, padding: '8px 12px', borderRadius: 11,
                            background: activeFilter === f ? 'var(--card-2)' : 'transparent',
                            color: activeFilter === f ? 'var(--fg)' : 'var(--fg-mute)',
                            border: `1px solid ${activeFilter === f ? 'var(--line-2)' : 'transparent'}`,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}>
                            {f === 'global' ? 'Global' : 'Friends'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed */}
            <div style={{ padding: '16px 14px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {loading && <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '40px 0' }}>Loading feed…</p>}
                {!loading && posts.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--fg-mute)', padding: '40px 0' }}>
                        No posts yet.<br/>Share your first routine!
                    </p>
                )}

                {posts.map((post) => {
                    const hasLiked = user ? post.likes.includes(user.id) : false;
                    const avgRating = post.rating_count > 0 ? (post.rating_sum / post.rating_count).toFixed(1) : null;
                    const postImg = post.content_image ||
                        (post.content_type === 'routine'
                            ? getRoutineImage(post.content_name, seedFrom(post.content_id))
                            : getDietImage(post.content_name, seedFrom(post.content_id)));
                    const nameInitials = (post.creator_name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                        <div key={post.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 22, overflow: 'hidden' }}>
                            {/* Creator row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px' }}>
                                <button onClick={() => navigate(`/community/user/${post.creator_id}`)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 0,
                                    cursor: 'pointer', flex: 1, minWidth: 0, textAlign: 'left',
                                }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0, position: 'relative',
                                        background: post.creator_avatar ? `url("${post.creator_avatar}") center/cover` : 'linear-gradient(135deg,#2a2a26,#141413)',
                                        display: 'grid', placeItems: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: 13,
                                    }}>
                                        {!post.creator_avatar && nameInitials}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{post.creator_name}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                                            {post.content_type === 'routine' ? 'shared a routine' : 'shared a meal plan'}
                                        </div>
                                    </div>
                                </button>
                                {user && (post.creator_id === user.id || user.is_admin) && (
                                    <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', padding: 6 }}>
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>

                            {/* Media */}
                            <div style={{
                                height: 200, padding: 14, position: 'relative',
                                backgroundImage: `url("${postImg}")`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                cursor: 'pointer',
                            }} onClick={() => setPreviewPost(post)}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }}/>
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 6 }}>
                                    <span className="pill" style={{ background: 'rgba(0,0,0,0.42)', borderColor: 'transparent', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        {post.content_type === 'routine' ? <Dumbbell size={10}/> : <ChefHat size={10}/>}
                                        {post.content_type.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                                    <div className="display" style={{ fontSize: 20, lineHeight: 1.1 }}>{post.content_name}</div>
                                </div>
                            </div>

                            {/* Rating row */}
                            {avgRating && (
                                <div style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ display: 'inline-flex', gap: 2 }}>
                                        {[1,2,3,4,5].map(i => (
                                            <Star key={i} size={12} fill={i <= Math.round(post.rating_sum / post.rating_count) ? 'var(--accent)' : 'none'} stroke="var(--accent)"/>
                                        ))}
                                    </div>
                                    <span className="num" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>{avgRating}</span>
                                    <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>({post.rating_count})</span>
                                    <button onClick={() => setPreviewPost(post)} style={{
                                        marginLeft: 'auto',
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: 'color-mix(in oklch, var(--accent) 16%, transparent)',
                                        color: 'var(--accent)', border: '1px solid color-mix(in oklch, var(--accent) 30%, transparent)',
                                        padding: '5px 12px', borderRadius: 999,
                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                    }}>
                                        Import <span style={{ fontSize: 10 }}>→</span>
                                    </button>
                                </div>
                            )}

                            {/* Interactions */}
                            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 14, color: 'var(--fg-mute)', fontSize: 12, fontWeight: 500 }}>
                                <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, color: hasLiked ? '#ef4444' : 'var(--fg-mute)' }}>
                                    <Heart size={18} fill={hasLiked ? '#ef4444' : 'none'}/> <span className="num">{post.likes.length}</span>
                                </button>
                                <button onClick={() => setCommentDrawer(post)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-mute)' }}>
                                    <MessageCircle size={18}/> <span className="num">{post.comment_count}</span>
                                </button>
                                <button onClick={() => setRatingModal({ isOpen: true, postId: post.id, contentType: post.content_type, contentId: post.content_id, importAfterRating: false })} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-mute)' }}>
                                    <Star size={18}/> Rate
                                </button>
                            </div>

                            {/* Comment input */}
                            <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'var(--card-2)', border: '1px solid var(--line)' }}/>
                                <button onClick={() => setCommentDrawer(post)} style={{
                                    flex: 1, height: 32, borderRadius: 12,
                                    background: 'var(--card-2)', border: '1px solid var(--line)',
                                    padding: '0 12px', color: 'var(--fg-dim)', fontSize: 12,
                                    cursor: 'pointer', textAlign: 'left',
                                }}>Add a comment…</button>
                                <button onClick={() => setCommentDrawer(post)} style={{
                                    width: 32, height: 32, borderRadius: 11, border: 0,
                                    background: 'color-mix(in oklch, var(--accent) 14%, transparent)',
                                    color: 'var(--accent)', display: 'grid', placeItems: 'center', cursor: 'pointer',
                                }}>
                                    <Send size={13}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FAB */}
            <div style={{ position: 'fixed', right: 18, bottom: 90, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                {fabOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                        <div>
                            <div className="eyebrow" style={{ marginBottom: 6 }}>Routines</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => { setShareSelector('routine'); setFabOpen(false); }} style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--card-2)', border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Share existing</button>
                                <button onClick={() => navigate('/workout/create')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 12, background: 'var(--accent)', color: 'var(--accent-ink)', border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Plus size={12}/> New</button>
                            </div>
                        </div>
                        <div>
                            <div className="eyebrow" style={{ marginBottom: 6 }}>Diets</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => { setShareSelector('diet'); setFabOpen(false); }} style={{ padding: '8px 14px', borderRadius: 12, background: 'var(--card-2)', border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Share existing</button>
                                <button onClick={() => navigate('/diet/create')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 12, background: 'var(--recovery)', color: 'var(--accent-ink)', border: 0, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Plus size={12}/> New</button>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={() => setFabOpen(v => !v)} style={{
                    width: 56, height: 56, borderRadius: 18, border: 0,
                    background: fabOpen ? 'var(--card-2)' : 'var(--accent)',
                    color: fabOpen ? 'var(--fg)' : 'var(--accent-ink)',
                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                    boxShadow: '0 8px 24px color-mix(in oklch, var(--accent) 32%, transparent)',
                    transform: fabOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s',
                }}>
                    <Plus size={22} strokeWidth={2.5}/>
                </button>
            </div>

            {/* Rating modal */}
            {ratingModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ width: '100%', maxWidth: 340, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: 24, padding: '24px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Rate this content</div>
                        <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginBottom: 24 }}>
                            {ratingModal.importAfterRating ? 'Rate before importing.' : 'Help the community.'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                            {[1,2,3,4,5].map(s => (
                                <button key={s} onMouseEnter={() => setHoverScore(s)} onMouseLeave={() => setHoverScore(0)} onClick={() => submitRating(s)} style={{
                                    background: 'none', border: 0, padding: 6, cursor: 'pointer',
                                    color: s <= hoverScore ? 'var(--accent)' : 'var(--fg-dim)',
                                    transform: s <= hoverScore ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s',
                                }}>
                                    <Star size={36} fill={s <= hoverScore ? 'var(--accent)' : 'none'}/>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { setRatingModal({ isOpen: false, postId: null, contentType: null, contentId: null, importAfterRating: false }); setHoverScore(0); }}
                            style={{ background: 'none', border: 0, color: 'var(--fg-mute)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 20px', borderRadius: 12 }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {shareSelector && <ShareSelectorModal type={shareSelector} onClose={() => setShareSelector(null)} onShared={() => fetchFeed(activeFilter)}/>}
            {commentDrawer && <CommentDrawer post={commentDrawer} onClose={() => setCommentDrawer(null)}/>}
            {previewPost && <ContentPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} importing={importingId === previewPost.id} onImport={() => { const p = previewPost; setPreviewPost(null); handleImport(p); }}/>}
        </div>
    );
}
