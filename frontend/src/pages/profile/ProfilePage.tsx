import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Moon, Sun, Edit2, Camera, ChevronRight, Dumbbell, Clock, Flame, Zap, Trophy, Users, Scale, TrendingUp, Lock } from 'lucide-react';
import { WorkoutHistoryList } from '../../components/profile/WorkoutHistoryList';
import { RanksModal } from '../../components/profile/RanksModal';
import { getScheduledWorkouts, getScheduledWorkoutsCache } from '../../services/tracking';
import { getRoutines } from '../../services/routines';
import { getExercises } from '../../services/exercises';
import { getDashboardStats, getDashboardStatsCache } from '../../services/user';

function Bar({ pct = 0.5, h = 6 }: { pct?: number; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: 'var(--accent)', borderRadius: h, transition: 'width 0.6s ease' }} />
        </div>
    );
}

function LevelRing({ size = 64, pct = 0.62, sw = 5 }: { size?: number; pct?: number; sw?: number }) {
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.10)" strokeWidth={sw} fill="none"/>
            <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth={sw} fill="none"
                strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"/>
        </svg>
    );
}

export function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const settingsRef = useRef<HTMLDivElement>(null);

    const [stats, setStats] = useState<any>(getDashboardStatsCache());
    const [showRanks, setShowRanks] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [bannerImage, setBannerImage] = useState<string | null>(() => localStorage.getItem('lyfter_banner') || null);
    const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');
    const [workouts, setWorkouts] = useState<any[]>(() => getScheduledWorkoutsCache() || []);
    const [routinesMap, setRoutinesMap] = useState<Record<string, any>>({});
    const [exercisesMap, setExercisesMap] = useState<Record<string, any>>({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        getDashboardStats(user.id).then(setStats).catch(() => {});
    }, [user?.id]);

    useEffect(() => {
        if (activeTab !== 'history' || !user?.id) return;
        setLoadingHistory(true);
        Promise.all([getScheduledWorkouts(user?.id), getRoutines(user.id), getExercises()])
            .then(([w, r, e]) => {
                setWorkouts(w);
                const rMap: Record<string, any> = {};
                r.forEach(x => rMap[x.id || ''] = x);
                setRoutinesMap(rMap);
                const eMap: Record<string, any> = {};
                e.forEach((x: any) => eMap[x.id || ''] = x);
                setExercisesMap(eMap);
            })
            .catch(() => {})
            .finally(() => setLoadingHistory(false));
    }, [activeTab]);


    const level = stats?.level ?? (user as any)?.level ?? 1;
    const xp = stats?.xp ?? (user as any)?.xp ?? 0;
    const xpForNextLevel = level ** 2 * 100;
    const xpThisLevel = (level - 1) ** 2 * 100;
    const xpPct = xpForNextLevel > xpThisLevel ? Math.min((xp - xpThisLevel) / (xpForNextLevel - xpThisLevel), 1) : 1;
    const rank = stats?.rank ?? 'Bronze';
    const workoutCount = stats?.total_workouts ?? 0;
    const totalMinutes = stats?.total_time_minutes ?? 0;
    const totalTimeLabel = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    const kcalBurned = stats?.total_calories_burned ?? 0;
    const streak = stats?.streak_days ?? 0;
    const globalPosition = stats?.global_position ?? 0;
    const totalUsers = stats?.total_users ?? 0;
    const globalLabel = globalPosition > 0
        ? (globalPosition <= 100 ? `#${globalPosition} globally` : `Top ${Math.round((globalPosition / totalUsers) * 100)}% globally`)
        : null;
    const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

    return (
        <div style={{ background: 'var(--bg)', paddingBottom: 90 }}>

            {/* Header banner */}
            <div style={{ position: 'relative', height: 140, marginBottom: -50 }}>
                {bannerImage ? (
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${bannerImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                ) : (
                    <div className="mesh-hero" style={{
                        position: 'absolute', inset: 0,
                        '--mesh-a': 'oklch(0.72 0.18 340)', '--mesh-b': 'oklch(0.78 0.20 128)',
                    } as React.CSSProperties}/>
                )}
                {isEditing && (
                    <label style={{
                        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999,
                        padding: '6px 14px', color: '#fff', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', zIndex: 4,
                    }}>
                        <Camera size={13}/> Change banner
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const result = reader.result as string;
                                    setBannerImage(result);
                                    localStorage.setItem('lyfter_banner', result);
                                };
                                reader.readAsDataURL(f);
                            }}
                        />
                    </label>
                )}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 5 }} ref={settingsRef}>
                    <button onClick={toggleTheme} style={{
                        width: 34, height: 34, borderRadius: 11,
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                    }}>
                        {theme === 'dark' ? <Sun size={15}/> : <Moon size={15}/>}
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }} aria-label="logout" style={{
                        width: 34, height: 34, borderRadius: 11,
                        background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.35)',
                        color: '#fca5a5', display: 'grid', placeItems: 'center', cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <LogOut size={15}/>
                    </button>
                </div>
            </div>

            {/* Avatar + identity */}
            <div style={{ padding: '0 20px', position: 'relative', zIndex: 2 }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
                    <div style={{
                        width: 88, height: 88, borderRadius: 24,
                        border: '4px solid var(--bg)',
                        overflow: 'hidden', display: 'grid', placeItems: 'center',
                        background: user?.profilePicture
                            ? `url("${user.profilePicture}") center/cover`
                            : 'linear-gradient(135deg, #2a2a26, #141413)',
                        color: 'var(--accent)', fontWeight: 700, fontSize: 36,
                    }}>
                        {!user?.profilePicture && initials}
                    </div>
                    {isEditing && (
                        <label style={{
                            position: 'absolute', right: -4, bottom: -4,
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'var(--accent)', color: 'var(--accent-ink)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer',
                            border: '2px solid var(--bg)',
                        }}>
                            <Camera size={13}/>
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) { const r = new FileReader(); r.onloadend = () => updateUser({ profilePicture: r.result as string }); r.readAsDataURL(f); }
                                }}
                            />
                        </label>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div className="display" style={{ fontSize: 20, color: 'var(--fg)' }}>{user?.username ?? 'Athlete'}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 2 }}>{user?.email ?? ''}</div>
                    </div>
                    <button onClick={() => setIsEditing(v => !v)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'var(--card)', color: 'var(--fg)', border: '1px solid var(--line-2)',
                        padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                        <Edit2 size={12}/> {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
            </div>

            {/* Level card — tappable → opens RanksModal */}
            <div style={{ padding: '18px 16px 0' }}>
                <button onClick={() => setShowRanks(true)} style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                }}>
                <div style={{
                    padding: 16, borderRadius: 20, position: 'relative', overflow: 'hidden',
                    background: `linear-gradient(135deg, color-mix(in oklch, var(--accent) 16%, var(--card)), var(--card) 70%)`,
                    border: '1px solid color-mix(in oklch, var(--accent) 28%, var(--line))',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                            <LevelRing size={64} pct={xpPct} sw={5} />
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--fg)',
                            }}>{level}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="eyebrow" style={{ color: 'var(--accent)' }}>RANK · {rank.toUpperCase()}</div>
                            <div className="display" style={{ fontSize: 18, color: 'var(--fg)', marginTop: 2 }}>Level <span className="num">{level}</span></div>
                            {globalLabel && (
                                <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>{globalLabel}</div>
                            )}
                        </div>
                        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'color-mix(in oklch, var(--accent) 18%, transparent)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                            <Trophy size={22}/>
                        </div>
                    </div>
                    <Bar pct={xpPct} h={6} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--fg-dim)' }} className="num">
                        <span>{xp} / {xpForNextLevel} XP</span>
                        <span>{xpForNextLevel - xp} to next level</span>
                    </div>
                </div>
                </button>
            </div>

            {/* Tabs */}
            <div style={{ padding: '18px 16px 0' }}>
                <div style={{ display: 'flex', padding: 4, borderRadius: 14, background: 'var(--card)', border: '1px solid var(--line)' }}>
                    {(['summary', 'history'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            flex: 1, padding: '8px 12px', borderRadius: 11,
                            background: activeTab === tab ? 'var(--card-2)' : 'transparent',
                            color: activeTab === tab ? 'var(--fg)' : 'var(--fg-mute)',
                            border: `1px solid ${activeTab === tab ? 'var(--line-2)' : 'transparent'}`,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                        }}>{tab === 'summary' ? 'Summary' : 'History'}</button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {activeTab === 'summary' ? (
                <div style={{ padding: '18px 16px 0' }}>
                    {/* Stat grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                        {[
                            { icon: <Dumbbell size={16}/>, value: workoutCount, label: 'Workouts', tone: 'var(--accent)' },
                            { icon: <Clock size={16}/>,    value: totalTimeLabel, label: 'Total time', tone: 'var(--data)' },
                            { icon: <Flame size={16}/>,    value: kcalBurned.toLocaleString(), label: 'Kcal burned', tone: 'var(--energy)' },
                            { icon: <Zap size={16}/>,      value: `${streak}d`, label: 'Streak', tone: 'var(--accent)' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        width: 28, height: 28, borderRadius: 9,
                                        background: `color-mix(in oklch, ${s.tone} 16%, transparent)`,
                                        display: 'grid', placeItems: 'center', color: s.tone,
                                    }}>{s.icon}</span>
                                </div>
                                <div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Insignias */}
                    {(() => {
                        const RANK_ORDER = ['Bronze','Silver','Gold','Platinum','Diamond','Champion'];
                        const rankIdx = RANK_ORDER.indexOf(rank);
                        const badges = [
                            // Rango
                            { emoji: '🥉', label: 'Bronce',     desc: 'Rango Bronce',             earned: rankIdx >= 0 },
                            { emoji: '🥈', label: 'Plata',      desc: 'Rango Plata',              earned: rankIdx >= 1 },
                            { emoji: '🥇', label: 'Oro',        desc: 'Rango Oro',                earned: rankIdx >= 2 },
                            { emoji: '💎', label: 'Platino',    desc: 'Rango Platino',            earned: rankIdx >= 3 },
                            { emoji: '💠', label: 'Diamante',   desc: 'Rango Diamante',           earned: rankIdx >= 4 },
                            { emoji: '👑', label: 'Campeón',    desc: 'Rango más alto',           earned: rankIdx >= 5 },
                            // Actividad
                            { emoji: '⚡', label: 'Iniciado',   desc: '10 entrenamientos',        earned: workoutCount >= 10 },
                            { emoji: '💪', label: 'Dedicado',   desc: '50 entrenamientos',        earned: workoutCount >= 50 },
                            { emoji: '🔥', label: 'En racha',   desc: '7 días seguidos',          earned: streak >= 7 },
                            { emoji: '🌍', label: 'Top 100',    desc: 'Top 100 global',           earned: globalPosition > 0 && globalPosition <= 100 },
                            { emoji: '🏆', label: 'Top 10%',    desc: 'Top 10% global',           earned: globalPosition > 0 && totalUsers > 0 && (globalPosition / totalUsers) <= 0.10 },
                        ];
                        const earned = badges.filter(b => b.earned);
                        const locked = badges.filter(b => !b.earned);
                        return (
                            <div style={{ marginBottom: 18 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', letterSpacing: '0.08em', marginBottom: 10 }}>INSIGNIAS</div>
                                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                                    {[...earned, ...locked].map(b => (
                                        <div key={b.label} style={{
                                            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                            background: b.earned ? 'color-mix(in oklch, var(--accent) 10%, var(--card))' : 'var(--card)',
                                            border: `1px solid ${b.earned ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)'}`,
                                            borderRadius: 16, padding: '12px 10px', minWidth: 72, position: 'relative',
                                        }}>
                                            <span style={{ fontSize: 26, opacity: b.earned ? 1 : 0.25 }}>{b.emoji}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: b.earned ? 'var(--fg)' : 'var(--fg-dim)', textAlign: 'center', lineHeight: 1.2 }}>{b.label}</span>
                                            <span style={{ fontSize: 9, color: 'var(--fg-dim)', textAlign: 'center', lineHeight: 1.2 }}>{b.desc}</span>
                                            {!b.earned && (
                                                <div style={{ position: 'absolute', top: 6, right: 6, color: 'var(--fg-dim)', opacity: 0.4 }}>
                                                    <Lock size={10}/>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Quick links */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
                        {[
                            { icon: <Users size={18}/>, label: 'Public profile', sub: 'View your community page', to: `/community/user/${user?.id}` },
                            { icon: <Scale size={18}/>, label: 'Personal data', sub: 'Weight, height, BMI', to: '/profile/personal-data' },
                            { icon: <TrendingUp size={18}/>, label: 'Progress', sub: 'Daily activity & charts', to: '/progress' },
                        ].map((item, i, arr) => (
                            <Link key={item.label} to={item.to} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 16px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                                }}>
                                    <span style={{
                                        width: 36, height: 36, borderRadius: 11,
                                        background: 'var(--card-2)', color: 'var(--fg-mute)',
                                        display: 'grid', placeItems: 'center',
                                    }}>{item.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{item.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 1 }}>{item.sub}</div>
                                    </div>
                                    <ChevronRight size={14} color="var(--fg-dim)"/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '18px 16px 0' }}>
                    {loadingHistory ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                border: '3px solid var(--accent)', borderTopColor: 'transparent',
                                animation: 'spin 0.8s linear infinite',
                            }}/>
                        </div>
                    ) : (
                        <WorkoutHistoryList workouts={workouts} routines={routinesMap} exercises={exercisesMap}/>
                    )}
                </div>
            )}

            <div style={{ textAlign: 'center', padding: '24px 0 0', color: 'var(--fg-dim)', fontSize: 11 }}>
                Lyfter v1.1.0 · Gamified
            </div>

            {showRanks && (
                <RanksModal
                    level={level}
                    xp={xp}
                    globalPosition={globalPosition}
                    totalUsers={totalUsers}
                    onClose={() => setShowRanks(false)}
                />
            )}
        </div>
    );
}
