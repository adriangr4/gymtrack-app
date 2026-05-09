import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';

import { getDashboardStats, getDashboardStatsCache, type DashboardStats } from '../../services/user';
import { getRoutines, getRoutinesCache } from '../../services/routines';
import { getNutritionCache, setNutritionCache, getNutritionToday } from '../../services/nutrition';
import { useAuth } from '../../context/AuthContext';
import { TopHeader } from '../../components/layout/TopHeader';
import { getRoutineImage, seedFrom } from '../../lib/imageUtils';

function Bar({ pct = 0.5, color = 'var(--accent)', h = 4 }: { pct?: number; color?: string; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: color, borderRadius: h, transition: 'width 0.6s ease' }} />
        </div>
    );
}

function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
    return (
        <div onClick={onClick} style={{
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 20, overflow: 'hidden', ...style,
        }}>
            {children}
        </div>
    );
}

export function HomePage() {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState<DashboardStats | null>(getDashboardStatsCache());
    const [nutrition, setNutrition] = useState<any>(getNutritionCache());
    const [featuredRoutineId, setFeaturedRoutineId] = useState<string | null>(null);
    const [routines, setRoutines] = useState<any[]>(() => getRoutinesCache() || []);

    useEffect(() => {
        if (routines.length > 0 && !featuredRoutineId) {
            const active = user?.current_routine_id ? routines.find(r => r.id === user.current_routine_id) : null;
            setFeaturedRoutineId(active?.id ?? routines[0]?.id ?? null);
        }

        if (!user?.id) return;
        const fetchData = async () => {
            try {
                const [statsRes, nutritionRes, routinesRes] = await Promise.allSettled([
                    getDashboardStats(user.id),
                    getNutritionToday(user.id),
                    getRoutines(user.id),
                ]);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value);
                if (nutritionRes.status === 'fulfilled') { setNutrition(nutritionRes.value); setNutritionCache(nutritionRes.value); }
                if (routinesRes.status === 'fulfilled') {
                    const list = routinesRes.value || [];
                    setRoutines(list);
                    const active = user?.current_routine_id ? list.find((r: any) => r.id === user.current_routine_id) : null;
                    setFeaturedRoutineId(active?.id ?? list[0]?.id ?? null);
                }
            } catch {}
        };
        fetchData();
    }, [user?.id, user?.current_routine_id, location.key]);

    const featuredRoutine = routines.find(r => r.id === featuredRoutineId);
    const totalCalories = nutrition?.total_calories || 0;
    const goalCalories = nutrition?.goal_calories || 2000;
    const steps = stats?.steps || 0;

    const xp = (user as any)?.xp || 0;
    const level = (user as any)?.level || 1;
    const streak = stats?.streak_days || 0;

    return (
        <div className="w-full" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
            <TopHeader />

            <main style={{ padding: '16px 16px 90px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── Streak / XP hero ─────────────────────────── */}
                <Card style={{
                    padding: '14px 16px',
                    background: `linear-gradient(135deg, color-mix(in oklch, var(--accent) 16%, var(--card)), var(--card) 70%)`,
                    borderColor: 'color-mix(in oklch, var(--accent) 22%, var(--line))',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                            background: 'color-mix(in oklch, var(--energy) 20%, transparent)',
                            display: 'grid', placeItems: 'center', color: 'var(--energy)',
                        }}>
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                <path d="M12 2c2 4 6 6 6 11a6 6 0 11-12 0c0-3 2-4 2-7 2 1 4 0 4-4z"/>
                            </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                                {streak > 0 ? `${streak}-day streak` : 'Start your streak'}
                                {streak > 0 && <span style={{ color: 'var(--fg-mute)', fontWeight: 400 }}> · keep it alive</span>}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }} className="num">
                                Level <span style={{ color: 'var(--accent)' }}>{level}</span> · {xp} XP earned
                            </div>
                        </div>
                        <Link to="/progress">
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--fg-dim)" strokeWidth={1.6} strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                        </Link>
                    </div>
                </Card>

                {/* ── Stats 2-col ───────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Link to="/progress" style={{ textDecoration: 'none' }}>
                        <Card style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--data)' }}>
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M5 4l3 7-3 1 1 8M14 6l-2 6 4 1-2 7"/></svg>
                                <span className="eyebrow" style={{ color: 'var(--data)' }}>Steps</span>
                            </div>
                            <div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg)' }}>
                                {steps.toLocaleString()}
                            </div>
                            <Bar pct={steps / 10000} color="var(--data)" h={4} />
                            <div className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>of 10,000</div>
                        </Card>
                    </Link>
                    <Card style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: 'var(--energy)' }}>
                                <path d="M12 2c2 4 6 6 6 11a6 6 0 11-12 0c0-3 2-4 2-7 2 1 4 0 4-4z"/>
                            </svg>
                            <span className="eyebrow" style={{ color: 'var(--energy)' }}>Calories</span>
                        </div>
                        <div className="num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg)' }}>
                            {totalCalories}
                        </div>
                        <Bar pct={totalCalories / goalCalories} color="var(--energy)" h={4} />
                        <div className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>of {goalCalories} kcal</div>
                    </Card>
                </div>

                {/* ── Today's mission ───────────────────────────── */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Today's mission</div>
                        <span className="num" style={{ fontSize: 11, color: 'var(--accent)' }}>+45 XP</span>
                    </div>
                    <Card>
                        <Link to={featuredRoutineId ? `/workout/${featuredRoutineId}` : '/workout/create'} style={{ textDecoration: 'none' }}>
                            {/* Hero image */}
                            <div style={{
                                height: 180, padding: 14, position: 'relative',
                                backgroundImage: `url("${getRoutineImage(featuredRoutine?.name || 'full body', seedFrom(featuredRoutineId || 'mission'), 800, 400)}")`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }}/>
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 6 }}>
                                    <span className="pill accent">TODAY</span>
                                    <span className="pill">WORKOUT</span>
                                </div>
                                <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
                                    <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>
                                        {featuredRoutine?.name || stats?.mission_name || 'Active Recovery'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                                        <span className="num"><span style={{ fontWeight: 600 }}>{stats?.mission_duration || 45}</span> min</span>
                                        <span>·</span>
                                        <span className="num"><span style={{ fontWeight: 600 }}>
                                            {featuredRoutine?.exercises?.length || 0}
                                        </span> exercises</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <div className="eyebrow">Today's pick</div>
                                    <div className="num" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>
                                        {featuredRoutineId ? 'Tap to start' : 'Create a routine first'}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'var(--accent)', color: 'var(--accent-ink)',
                                    border: 0, borderRadius: 14, padding: '10px 16px',
                                    fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
                                }}>
                                    Start
                                    <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l15 9-15 9V3z"/></svg>
                                </div>
                            </div>
                        </Link>
                    </Card>
                </div>

                {/* ── My routines ───────────────────────────────── */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>My routines</div>
                        <Link to="/workout/create" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'transparent', border: 0,
                            color: 'var(--fg-mute)', fontSize: 12, fontWeight: 500, textDecoration: 'none', cursor: 'pointer',
                        }}>
                            <Plus size={14}/> New
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {routines.length === 0 ? (
                            <Card style={{ padding: '24px 16px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--fg-mute)', fontSize: 14, marginBottom: 12 }}>No routines yet</p>
                                <Link to="/workout/create" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'var(--accent)', color: 'var(--accent-ink)',
                                    border: 0, borderRadius: 12, padding: '10px 16px',
                                    fontWeight: 700, fontSize: 13, textDecoration: 'none',
                                }}>
                                    <Plus size={14}/> Create routine
                                </Link>
                            </Card>
                        ) : routines.map(r => {
                            const dayCount = r.exercises
                                ? new Set(r.exercises.map((e: any) => e.day_of_week)).size
                                : r.weekly_plan?.filter((d: any) => d.exercises?.length > 0).length || 0;
                            const tags = (r.exercises || []).slice(0, 3).map((ex: any) => ex.exercise?.muscle_group || ex.exercise?.name || '').filter(Boolean);
                            const pct = featuredRoutineId === r.id ? 0.55 : 0.2;

                            return (
                                <Link key={r.id} to={`/workout/${r.id}`} style={{ textDecoration: 'none' }}>
                                    <Card style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {/* Thumb */}
                                        <div style={{
                                            width: 54, height: 54, borderRadius: 14, flexShrink: 0,
                                            backgroundImage: `url("${getRoutineImage(r.name, seedFrom(r.id || r.name), 120, 120)}")`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                        }}/>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: 'var(--fg)' }}>{r.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--fg-dim)', margin: '2px 0 6px' }}>{dayCount} days</div>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {tags.slice(0, 3).map((t: string, i: number) => (
                                                    <span key={i} className="pill" style={{ padding: '2px 7px', fontSize: 10 }}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ width: 38, textAlign: 'right' }}>
                                            <div className="num" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{Math.round(pct * 100)}%</div>
                                            <div style={{ marginTop: 4 }}><Bar pct={pct} h={3} /></div>
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ── Nutrition ─────────────────────────────────── */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Nutrition · today</div>
                        <Link to={user?.current_diet_id ? `/diet/${user.current_diet_id}` : '/diet'} style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                            Log meal <ChevronRight size={14}/>
                        </Link>
                    </div>
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -16px', padding: '0 16px 4px' }} className="no-scrollbar">
                        {[
                            { name: 'Protein',  value: Math.round(nutrition?.total_protein || 0), target: 180, unit: 'g', color: 'var(--energy)' },
                            { name: 'Carbs',    value: Math.round(nutrition?.total_carbs || 0),   target: 280, unit: 'g', color: 'var(--data)' },
                            { name: 'Fats',     value: Math.round(nutrition?.total_fat || 0),     target: 75,  unit: 'g', color: 'var(--recovery)' },
                            { name: 'Calories', value: totalCalories, target: goalCalories, unit: 'kcal', color: 'var(--accent)', wide: true },
                        ].map(m => (
                            <Card key={m.name} style={{
                                flexShrink: 0, width: (m as any).wide ? 178 : 132, padding: 14,
                                display: 'flex', flexDirection: 'column', gap: 10,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="eyebrow">{m.name}</span>
                                    <span style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: `color-mix(in oklch, ${m.color} 22%, transparent)`,
                                        color: m.color, fontSize: 10, fontWeight: 700,
                                        display: 'grid', placeItems: 'center',
                                    }}>●</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span className="num" style={{ fontSize: (m as any).wide ? 26 : 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fg)' }}>{m.value}</span>
                                    <span className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>/{m.target} {m.unit}</span>
                                </div>
                                <Bar pct={m.value / m.target} color={m.color} h={4} />
                            </Card>
                        ))}
                    </div>
                </div>

            {/* Ad banner — only non-Pro */}
            {!user?.is_pro && (
                <div style={{ margin: '20px 16px 0', borderRadius: 18, overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
                    <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 9, color: 'var(--fg-dim)', background: 'rgba(0,0,0,0.35)', borderRadius: 4, padding: '2px 5px', letterSpacing: '0.06em' }}>PUBLICIDAD</div>
                    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>💪</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Gymshark — Nueva colección SS25</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Ropa deportiva premium · Envío gratis +50€</div>
                        </div>
                        <Link to="/pro" style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap' }}>Sin anuncios →</div>
                        </Link>
                    </div>
                </div>
            )}

            </main>
        </div>
    );
}
