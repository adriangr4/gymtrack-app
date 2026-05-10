import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, UserPlus, Dumbbell, ChefHat, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAllRead, timeAgo, type Notification } from '../../services/notifications';

function NotifIcon({ type }: { type: Notification['type'] }) {
    const s = 14;
    if (type === 'follow')         return <UserPlus size={s} />;
    if (type === 'import_routine') return <Dumbbell size={s} />;
    if (type === 'import_diet')    return <ChefHat size={s} />;
    if (type === 'like')           return <Heart size={s} />;
    if (type === 'comment')        return <MessageCircle size={s} />;
    return <Bell size={s} />;
}

function notifColor(type: Notification['type']): string {
    if (type === 'follow')         return 'var(--accent)';
    if (type === 'import_routine') return 'var(--energy)';
    if (type === 'import_diet')    return 'var(--recovery)';
    if (type === 'like')           return '#f43f5e';
    if (type === 'comment')        return 'var(--data)';
    return 'var(--fg-dim)';
}

export function NotificationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        getNotifications(user.id)
            .then(n => { setNotifications(n); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user?.id]);

    // Mark all as read when entering the page
    useEffect(() => {
        if (!user?.id) return;
        markAllRead(user.id).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        });
    }, [user?.id]);

    const today = notifications.filter(n => {
        const diff = Date.now() - new Date(n.created_at).getTime();
        return diff < 86400000;
    });
    const older = notifications.filter(n => {
        const diff = Date.now() - new Date(n.created_at).getTime();
        return diff >= 86400000;
    });

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 90 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--fg)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                    <ArrowLeft size={18} />
                </button>
                <div style={{ flex: 1 }}>
                    <div className="eyebrow">ACTIVIDAD</div>
                    <div className="display" style={{ fontSize: 20, color: 'var(--fg)' }}>Notificaciones</div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fg-mute)', fontSize: 14 }}>Cargando…</div>
            ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🔔</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Sin notificaciones</div>
                    <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>Aquí verás cuando alguien te siga o importe tu contenido</div>
                </div>
            ) : (
                <div style={{ padding: '16px 0' }}>
                    {today.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.08em', padding: '0 16px 10px' }}>HOY</div>
                            {today.map(n => <NotifRow key={n.id} n={n} />)}
                        </div>
                    )}
                    {older.length > 0 && (
                        <div style={{ marginTop: today.length > 0 ? 20 : 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.08em', padding: '0 16px 10px' }}>ANTES</div>
                            {older.map(n => <NotifRow key={n.id} n={n} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotifRow({ n }: { n: Notification }) {
    const navigate = useNavigate();
    const initials = n.actor_name.slice(0, 2).toUpperCase();
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 16px',
            borderBottom: '1px solid var(--line)',
            background: n.read ? 'transparent' : 'color-mix(in oklch, var(--accent) 5%, transparent)',
        }}>
            {/* Avatar — tappable → public profile */}
            <div style={{ position: 'relative', flexShrink: 0 }}
                onClick={() => navigate(`/community/user/${n.actor_id}`)}
            >
                <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: n.actor_avatar ? `url("${n.actor_avatar}") center/cover` : 'var(--card-2)',
                    border: '2px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: 'var(--fg-mute)',
                    cursor: 'pointer',
                }}>
                    {!n.actor_avatar && initials}
                </div>
                {/* Type badge */}
                <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 20, height: 20, borderRadius: '50%',
                    background: notifColor(n.type),
                    border: '2px solid var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                }}>
                    <NotifIcon type={n.type} />
                </div>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: n.read ? 'var(--fg-mute)' : 'var(--fg)', fontWeight: n.read ? 400 : 600 }}>
                    {n.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 3 }}>{timeAgo(n.created_at)}</div>
            </div>

            {/* Unread dot */}
            {!n.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            )}
        </div>
    );
}
