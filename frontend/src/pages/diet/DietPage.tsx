import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { getDiets, getDietsCache } from '../../services/diet';
import { getRoutinesCache } from '../../services/routines';
import { useAuth } from '../../context/AuthContext';
import { getDietImage, seedFrom } from '../../lib/imageUtils';
import { getNutritionCache, setNutritionCache } from '../../services/nutrition';
import api from '../../api/client';

function Bar({ pct = 0.5, color = 'var(--accent)', h = 3 }: { pct?: number; color?: string; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'var(--line)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: color, borderRadius: h, transition: 'width 0.6s' }} />
        </div>
    );
}

function CalorieRing({ pct = 0 }: { pct?: number }) {
    const size = 96, sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={sw} fill="none"/>
                <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth={sw} fill="none"
                    strokeDasharray={`${c * Math.min(pct, 1)} ${c}`} strokeLinecap="round"/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="num" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                    {Math.round(pct * 100)}%
                </div>
                <div className="eyebrow">today</div>
            </div>
        </div>
    );
}

const TEMPLATES = [
    { id: 'keto-basic',    name: 'Keto',          kcal: 1800, ratio: '5/20/75',  tone: 'oklch(0.72 0.18 340)' },
    { id: 'mediterranean', name: 'Mediterranean', kcal: 2100, ratio: '20/50/30', tone: 'oklch(0.78 0.20 128)' },
    { id: 'high-protein',  name: 'Hyper-Protein', kcal: 2400, ratio: '35/40/25', tone: 'oklch(0.78 0.20 36)'  },
];

export function DietPage() {
    const { user } = useAuth();
    const [userDiets, setUserDiets] = useState<any[]>(() => getDietsCache() || []);
    const [nutrition, setNutrition] = useState<any>(() => getNutritionCache() || {
        total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, goal_calories: 2400,
    });

    const routines = getRoutinesCache() || [];
    const activeRoutine = routines.find((r: any) => r.id === user?.current_routine_id);
    const activeDiet = userDiets.find((d: any) => d.id === user?.current_diet_id);

    const goalKcal = nutrition?.goal_calories
        || activeRoutine?.daily_calories_target
        || activeDiet?.daily_calories_target
        || activeDiet?.total_calories
        || user?.daily_calorie_goal
        || 2400;

    const consumed = nutrition?.total_calories || 0;
    const pct = goalKcal > 0 ? consumed / goalKcal : 0;

    useEffect(() => {
        getDiets().then(setUserDiets).catch(console.error);
        api.get('/nutrition/today')
            .then(r => { setNutrition(r.data); setNutritionCache(r.data); })
            .catch(console.error);
    }, []);

    const macros = [
        { name: 'Protein', value: Math.round(nutrition?.total_protein || 0), target: Math.round(goalKcal * 0.30 / 4), unit: 'g', color: 'var(--energy)' },
        { name: 'Carbs',   value: Math.round(nutrition?.total_carbs   || 0), target: Math.round(goalKcal * 0.40 / 4), unit: 'g', color: 'var(--data)' },
        { name: 'Fats',    value: Math.round(nutrition?.total_fat     || 0), target: Math.round(goalKcal * 0.30 / 9), unit: 'g', color: 'var(--recovery)' },
    ];
    const remaining = Math.max(0, goalKcal - consumed);

    return (
        <div style={{ background: 'var(--bg)', paddingBottom: 90 }}>

            {/* Header */}
            <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ flex: 1 }}>
                    <div className="eyebrow" style={{ marginBottom: 1 }}>NUTRITION</div>
                    <div className="display" style={{ fontSize: 24, color: 'var(--fg)' }}>Diet</div>
                </div>
                <Link to="/diet/create" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    borderRadius: 12, padding: '8px 14px',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                }}>
                    <Plus size={14}/> New plan
                </Link>
            </div>

            {/* Calorie target hero */}
            <div style={{ padding: '14px 16px 0' }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <CalorieRing pct={pct} />
                        <div style={{ flex: 1 }}>
                            <div className="eyebrow">DAILY TARGET</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                                <span className="num display" style={{ fontSize: 28, color: 'var(--fg)' }}>{consumed}</span>
                                <span className="num" style={{ fontSize: 13, color: 'var(--fg-mute)' }}>/ {goalKcal} kcal</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 4 }}>
                                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{remaining} kcal</span> remaining today
                            </div>
                        </div>
                    </div>

                    {/* Macro blocks */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
                        {macros.map(m => (
                            <div key={m.name} style={{ background: 'var(--card-2)', borderRadius: 12, padding: '10px 12px' }}>
                                <div className="eyebrow" style={{ color: m.color }}>{m.name}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                                    <span className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>{m.value}</span>
                                    <span className="num" style={{ fontSize: 10, color: 'var(--fg-dim)' }}>/{m.target}{m.unit}</span>
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <Bar pct={m.target > 0 ? m.value / m.target : 0} color={m.color} h={3} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* My plans */}
            {userDiets.length > 0 && (
                <div style={{ padding: '22px 16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>My plans</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {userDiets.map((diet) => {
                            const isActive = user?.current_diet_id === diet.id;
                            return (
                                <Link key={diet.id} to={`/diet/${diet.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'var(--card)',
                                        border: `1px solid ${isActive ? 'color-mix(in oklch, var(--accent) 32%, var(--line))' : 'var(--line)'}`,
                                        borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                                    }}>
                                        <div style={{
                                            width: 120, flexShrink: 0,
                                            backgroundImage: `url("${getDietImage(diet.name, seedFrom(diet.id || diet.name))}")`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                        }}/>
                                        <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                {isActive && (
                                                    <span style={{
                                                        display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                                                        background: 'var(--accent)', color: 'var(--accent-ink)',
                                                        padding: '3px 7px', borderRadius: 5, marginBottom: 6,
                                                    }}>● ACTIVE</span>
                                                )}
                                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{diet.name}</div>
                                                <div className="num" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>
                                                    {diet.daily_calories_target || diet.total_calories || '—'} kcal · 7 days
                                                </div>
                                            </div>
                                            <ChevronRight size={14} color="var(--fg-dim)"/>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Popular templates */}
            <div style={{ padding: '22px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0 16px 10px' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)' }}>Popular templates</div>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 4px' }} className="no-scrollbar">
                    {TEMPLATES.map((t, i) => (
                        <Link key={t.id} to={`/diet/${t.id}`} style={{ textDecoration: 'none' }}>
                            <div style={{ flexShrink: 0, width: 160, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
                                <div style={{
                                    height: 80,
                                    backgroundImage: `url("${getDietImage(t.name, seedFrom(t.id + i))}")`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                }}/>
                                <div style={{ padding: '10px 12px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{t.name}</div>
                                    <div className="num" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>{t.kcal} kcal</div>
                                    <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 4 }}>P/C/F · {t.ratio}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
