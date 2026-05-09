import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Notification {
    id: string;
    type: string;
    message: string;
    actor_name: string;
    actor_avatar?: string;
    read: boolean;
    created_at: string;
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
}

function BellIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10.3 21a1.94 1.94 0 003.4 0"/>
        </svg>
    );
}

function CheckIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
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

export function TopHeader() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const xp = (user as any)?.xp ?? 0;
    const xpForLevel = 2400;
    const xpPct = Math.min(xp / xpForLevel, 1);

    useEffect(() => {
        if (!user) return;
        const fetch = async () => {
            try {
                const snap = await getDocs(query(
                    collection(db, 'notifications'),
                    where('user_id', '==', user.id),
                ));
                setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
            } catch {}
        };
        fetch();
        const iv = setInterval(fetch, 60000);
        return () => clearInterval(iv);
    }, [user]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { read: true });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch {}
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (!unread.length) return;
        try {
            await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {}
    };

    const unread = notifications.filter(n => !n.read).length;
    const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

    return (
        <header className="sticky top-0 z-50 flex items-center gap-3 px-5 py-3"
            style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>

            {/* Avatar with XP ring — tappable, goes to profile */}
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
                {/* Online dot */}
                <div style={{
                    position: 'absolute', right: 1, bottom: 1, width: 10, height: 10,
                    borderRadius: '50%', background: 'var(--accent)',
                    border: '2px solid var(--bg)',
                }} />
            </Link>

            {/* Greeting — also tappable */}
            <Link to="/profile" style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                <div className="eyebrow" style={{ marginBottom: 1 }}>{getGreeting()}</div>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.1, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username ?? 'Athlete'}
                </div>
            </Link>

            {/* Bell */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(o => !o)}
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
                        }} className="num">{unread > 9 ? '9+' : unread}</span>
                    )}
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: 320, background: 'var(--card)',
                        border: '1px solid var(--line-2)',
                        borderRadius: 20, overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        zIndex: 60,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', borderBottom: '1px solid var(--line)',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Notifications</span>
                            {unread > 0 && (
                                <button onClick={markAllAsRead} style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    background: 'transparent', border: 0,
                                    color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                }}>
                                    <CheckIcon size={12} /> Mark all read
                                </button>
                            )}
                        </div>
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13, padding: '32px 16px' }}>
                                    No notifications yet
                                </p>
                            ) : notifications.map(n => (
                                <div key={n.id} onClick={() => markAsRead(n.id)}
                                    style={{
                                        display: 'flex', gap: 10, padding: '12px 16px',
                                        borderBottom: '1px solid var(--line)',
                                        background: n.read ? 'transparent' : 'color-mix(in oklch, var(--accent) 6%, transparent)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: n.actor_avatar ? `url("${n.actor_avatar}") center/cover` : 'var(--card-2)',
                                        border: '1px solid var(--line)',
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 12, lineHeight: 1.4, margin: 0,
                                            color: n.read ? 'var(--fg-mute)' : 'var(--fg)',
                                            fontWeight: n.read ? 400 : 600,
                                        }}>{n.message}</p>
                                        <p style={{ fontSize: 10, color: 'var(--fg-dim)', margin: '4px 0 0' }} className="num">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
