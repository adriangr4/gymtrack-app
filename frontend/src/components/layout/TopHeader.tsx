import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../services/notifications';

function BellIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10.3 21a1.94 1.94 0 003.4 0"/>
        </svg>
    );
}

function LevelRing({ size = 48, pct = 0.5, sw = 3 }: { size?: number; pct?: number; sw?: number }) {
    const r = (size - sw) / 2;
    const c = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={sw} fill="none" />
            <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--accent)" strokeWidth={sw} fill="none"
                strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" />
        </svg>
    );
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

export function TopHeader() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);

    const xp = (user as any)?.xp ?? 0;
    const xpForLevel = 2400;
    const xpPct = Math.min(xp / xpForLevel, 1);
    const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

    useEffect(() => {
        if (!user?.id) return;
        getUnreadCount(user.id).then(setUnread).catch(() => {});
        const iv = setInterval(() => getUnreadCount(user.id).then(setUnread).catch(() => {}), 60000);
        return () => clearInterval(iv);
    }, [user?.id]);

    return (
        <header className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3"
            style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>

            {/* Avatar with XP ring */}
            <Link to="/profile" style={{ position: 'relative', width: 48, height: 48, flexShrink: 0, textDecoration: 'none' }}>
                <LevelRing size={48} pct={xpPct} sw={3} />
                <div style={{
                    position: 'absolute', inset: 5, borderRadius: '50%',
                    overflow: 'hidden',
                    background: user?.profilePicture
                        ? `url("${user.profilePicture}") center/cover`
                        : 'linear-gradient(135deg, #2a2a26, #141413)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', fontWeight: 700, fontSize: 13,
                }}>
                    {!user?.profilePicture && initials}
                </div>
                <div style={{
                    position: 'absolute', right: 1, bottom: 1, width: 10, height: 10,
                    borderRadius: '50%', background: 'var(--accent)',
                    border: '2px solid var(--bg)',
                }} />
            </Link>

            {/* Greeting */}
            <Link to="/profile" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                <div className="eyebrow" style={{ marginBottom: 1 }}>{getGreeting()}</div>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.1, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username ?? 'Athlete'}
                </div>
            </Link>

            {/* Bell → /notifications */}
            <button
                onClick={() => navigate('/notifications')}
                style={{
                    width: 40, height: 40, borderRadius: 14,
                    background: 'var(--card)', border: '1px solid var(--line-2)',
                    color: 'var(--fg)', display: 'grid', placeItems: 'center',
                    cursor: 'pointer', position: 'relative',
                }}
            >
                <BellIcon size={18} />
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 18, height: 18, padding: '0 5px',
                        borderRadius: 9, background: '#ef4444', color: '#fff',
                        fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
                        border: '2px solid var(--bg)',
                    }}>{unread > 9 ? '9+' : unread}</span>
                )}
            </button>
        </header>
    );
}
