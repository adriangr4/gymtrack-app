import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Clock, ChevronRight, Star } from 'lucide-react';
import { getDiets, getDietsCache } from '../../services/diet';
import { getRoutinesCache } from '../../services/routines';
import { useAuth } from '../../context/AuthContext';
import { getDietImage, seedFrom } from '../../lib/imageUtils';
import { getNutritionCache, setNutritionCache, getNutritionToday } from '../../services/nutrition';

// ─── Design tokens helpers ──────────────────────────────────────────────────
function Bar({ pct = 0.5, color = 'var(--accent)', h = 3 }: { pct?: number; color?: string; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'var(--line)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: color, borderRadius: h, transition: 'width 0.6s' }} />
        </div>
    );
}

function CalorieRing({ pct = 0 }: { pct?: number }) {
    const size = 88, sw = 7, r = (size - sw) / 2, c = 2 * Math.PI * r;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={sw} fill="none"/>
                <circle cx={size/2} cy={size/2} r={r} stroke="var(--energy)" strokeWidth={sw} fill="none"
                    strokeDasharray={`${c * Math.min(pct, 1)} ${c}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={14} color="var(--energy)"/>
                <div className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', lineHeight: 1, marginTop: 2 }}>
                    {Math.round(pct * 100)}%
                </div>
            </div>
        </div>
    );
}

// ─── Curated discover data ───────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'desayuno',  emoji: '🍳', label: 'Desayuno' },
    { id: 'almuerzo',  emoji: '🥗', label: 'Almuerzo' },
    { id: 'cena',      emoji: '🌙', label: 'Cena' },
    { id: 'vegana',    emoji: '🌱', label: 'Vegana' },
    { id: 'proteina',  emoji: '💪', label: 'Alta proteína' },
    { id: 'rapida',    emoji: '⚡', label: 'Rápida' },
    { id: 'keto',      emoji: '🥑', label: 'Keto' },
];

const CALORIC_RANGES = [
    { label: '< 300 kcal', emoji: '🍉', color: 'oklch(0.72 0.16 148)' },
    { label: '300–500 kcal', emoji: '🥞', color: 'oklch(0.72 0.16 55)' },
    { label: '500–700 kcal', emoji: '🍝', color: 'oklch(0.72 0.16 30)' },
    { label: '> 700 kcal',  emoji: '🍖', color: 'oklch(0.72 0.16 340)' },
];

const CURATED_SECTIONS = [
    {
        title: 'Nuestras favoritas',
        recipes: [
            { name: 'Pollo con verduras', kcal: 388, time: 45, img: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop' },
            { name: 'Bowl de salmón', kcal: 420, time: 20, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' },
            { name: 'Pasta con pesto', kcal: 510, time: 25, img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400&h=300&fit=crop' },
        ],
    },
    {
        title: 'Desayunos energéticos',
        recipes: [
            { name: 'Overnight oats', kcal: 310, time: 5, img: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=400&h=300&fit=crop' },
            { name: 'Tostada de aguacate', kcal: 280, time: 10, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop' },
            { name: 'Batido de proteínas', kcal: 250, time: 5, img: 'https://images.unsplash.com/photo-1553530666-ba11a90a3431?w=400&h=300&fit=crop' },
        ],
    },
    {
        title: 'Alta en proteínas',
        recipes: [
            { name: 'Pechuga a la plancha', kcal: 220, time: 20, img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop' },
            { name: 'Tortilla de claras', kcal: 180, time: 10, img: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=300&fit=crop' },
            { name: 'Atún con quinoa', kcal: 370, time: 15, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
        ],
    },
];

const TEMPLATES = [
    { id: 'keto-basic',    name: 'Keto',          kcal: 1800, desc: 'Bajo en carbohidratos, alto en grasa', img: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400&h=300&fit=crop' },
    { id: 'mediterranean', name: 'Mediterránea',   kcal: 2100, desc: 'Equilibrada y rica en grasas saludables', img: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=400&h=300&fit=crop' },
    { id: 'high-protein',  name: 'Alta proteína',  kcal: 2400, desc: 'Máximo músculo, mínima grasa', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export function DietPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<'hoy' | 'descubrir' | 'planes'>('hoy');
    const [activeCategory, setActiveCategory] = useState('desayuno');
    const [userDiets, setUserDiets] = useState<any[]>(() => getDietsCache() || []);
    const [nutrition, setNutrition] = useState<any>(() => getNutritionCache() || {
        total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, goal_calories: 2400,
    });

    const routines = getRoutinesCache() || [];
    const activeRoutine = routines.find((r: any) => r.id === user?.current_routine_id);
    const activeDiet = userDiets.find((d: any) => d.id === user?.current_diet_id);
    const goalKcal = nutrition?.goal_calories || activeRoutine?.daily_calories_target || activeDiet?.daily_calories_target || user?.daily_calorie_goal || 2400;
    const consumed = nutrition?.total_calories || 0;
    const pct = goalKcal > 0 ? consumed / goalKcal : 0;
    const remaining = Math.max(0, goalKcal - consumed);

    useEffect(() => {
        if (!user?.id) return;
        getDiets(user.id).then(setUserDiets).catch(console.error);
        getNutritionToday(user.id).then(d => { setNutrition(d); setNutritionCache(d); }).catch(console.error);
    }, [user?.id]);

    const macros = [
        { name: 'Proteína', value: Math.round(nutrition?.total_protein || 0), target: Math.round(goalKcal * 0.30 / 4), color: 'var(--energy)' },
        { name: 'Carbs',    value: Math.round(nutrition?.total_carbs   || 0), target: Math.round(goalKcal * 0.40 / 4), color: 'var(--data)' },
        { name: 'Grasas',   value: Math.round(nutrition?.total_fat     || 0), target: Math.round(goalKcal * 0.30 / 9), color: 'var(--recovery)' },
    ];

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 90 }}>

            {/* Header */}
            <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div className="eyebrow">NUTRITION</div>
                    <div className="display" style={{ fontSize: 22, color: 'var(--fg)' }}>Dieta</div>
                </div>
                <Link to="/diet/create" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}>
                    <Plus size={14}/> Nuevo plan
                </Link>
            </div>

            {/* Tabs */}
            <div style={{ padding: '14px 16px 0' }}>
                <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 4, gap: 4 }}>
                    {(['hoy', 'descubrir', 'planes'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: tab === t ? 'var(--card-2)' : 'transparent',
                            color: tab === t ? 'var(--fg)' : 'var(--fg-mute)',
                            fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                        }}>
                            {t === 'hoy' ? 'Hoy' : t === 'descubrir' ? 'Descubrir' : 'Mis planes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TAB: HOY ── */}
            {tab === 'hoy' && (
                <div style={{ padding: '16px 16px 0' }}>
                    {/* Calorie hero card */}
                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 22, padding: 18 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <CalorieRing pct={pct}/>
                            <div style={{ flex: 1 }}>
                                <div className="eyebrow" style={{ marginBottom: 4 }}>OBJETIVO DIARIO</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span className="num" style={{ fontSize: 30, fontWeight: 800, color: 'var(--fg)' }}>{consumed}</span>
                                    <span style={{ fontSize: 13, color: 'var(--fg-mute)' }}>/ {goalKcal} kcal</span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 4 }}>
                                    <span style={{ color: 'var(--energy)', fontWeight: 600 }}>{remaining} kcal</span> restantes hoy
                                </div>
                            </div>
                        </div>

                        {/* Macro bars */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 18 }}>
                            {macros.map(m => (
                                <div key={m.name} style={{ background: 'var(--card-2)', borderRadius: 14, padding: '10px 12px' }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: m.color, marginBottom: 6 }}>{m.name.toUpperCase()}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                        <span className="num" style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)' }}>{m.value}</span>
                                        <span style={{ fontSize: 10, color: 'var(--fg-dim)' }}>/{m.target}g</span>
                                    </div>
                                    <div style={{ marginTop: 6 }}>
                                        <Bar pct={m.target > 0 ? m.value / m.target : 0} color={m.color} h={3}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active diet shortcut */}
                    {activeDiet && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-mute)', marginBottom: 10, letterSpacing: '0.04em' }}>PLAN ACTIVO</div>
                            <Link to={`/diet/${activeDiet.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    background: 'var(--card)', border: '1px solid color-mix(in oklch, var(--accent) 30%, var(--line))',
                                    borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                                }}>
                                    <div style={{
                                        width: 110, flexShrink: 0,
                                        backgroundImage: `url("${getDietImage(activeDiet.name, seedFrom(activeDiet.id))}")`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                    }}/>
                                    <div style={{ flex: 1, padding: '14px 16px' }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '3px 7px', borderRadius: 5 }}>● ACTIVO</span>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginTop: 8 }}>{activeDiet.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 3 }}>{activeDiet.daily_calories_target || '—'} kcal · 7 días</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
                                        <ChevronRight size={16} color="var(--fg-dim)"/>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Quick log CTA */}
                    <Link to={activeDiet ? `/diet/${activeDiet.id}` : '/diet/create'} style={{ textDecoration: 'none', display: 'block', marginTop: 14 }}>
                        <div style={{
                            background: 'color-mix(in oklch, var(--energy) 12%, var(--card))',
                            border: '1px solid color-mix(in oklch, var(--energy) 30%, var(--line))',
                            borderRadius: 16, padding: '14px 16px',
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <Flame size={22} color="var(--energy)"/>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Registrar comida</div>
                                <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>Añade lo que has comido hoy</div>
                            </div>
                            <Plus size={18} color="var(--energy)"/>
                        </div>
                    </Link>
                </div>
            )}

            {/* ── TAB: DESCUBRIR ── */}
            {tab === 'descubrir' && (
                <div>
                    {/* Category chips */}
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 16px 0' }} className="no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                background: activeCategory === cat.id ? 'color-mix(in oklch, var(--accent) 14%, var(--card))' : 'var(--card)',
                                border: `1px solid ${activeCategory === cat.id ? 'color-mix(in oklch, var(--accent) 50%, var(--line))' : 'var(--line)'}`,
                                borderRadius: 16, padding: '12px 14px', cursor: 'pointer', minWidth: 68,
                            }}>
                                <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                                <span style={{ fontSize: 10, fontWeight: 600, color: activeCategory === cat.id ? 'var(--accent)' : 'var(--fg-mute)', letterSpacing: '0.02em' }}>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Caloric ranges */}
                    <div style={{ padding: '20px 16px 0' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>Por rango calórico</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {CALORIC_RANGES.map(r => (
                                <div key={r.label} style={{
                                    background: `color-mix(in oklch, ${r.color} 10%, var(--card))`,
                                    border: `1px solid color-mix(in oklch, ${r.color} 25%, var(--line))`,
                                    borderRadius: 18, padding: '18px 16px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <span style={{ fontSize: 28 }}>{r.emoji}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{r.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Curated sections */}
                    {CURATED_SECTIONS.map(section => (
                        <div key={section.title} style={{ padding: '20px 0 0' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', margin: '0 16px 12px' }}>{section.title}</div>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px' }} className="no-scrollbar">
                                {section.recipes.map((recipe, i) => (
                                    <div key={i} style={{ flexShrink: 0, width: 165, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
                                        <div style={{
                                            height: 110,
                                            backgroundImage: `url("${recipe.img}")`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            position: 'relative',
                                        }}>
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }}/>
                                            <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Star size={10} fill="#fff" stroke="#fff"/>
                                                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>4.{7 - i}</span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '10px 12px' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', lineHeight: 1.3 }}>{recipe.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--energy)' }}>
                                                    <Flame size={11}/>{recipe.kcal} kcal
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fg-mute)' }}>
                                                    <Clock size={11}/>{recipe.time} min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Diet plan templates */}
                    <div style={{ padding: '20px 16px 0' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>Planes completos</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {TEMPLATES.map(t => (
                                <Link key={t.id} to={`/diet/${t.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
                                        <div style={{ width: 120, flexShrink: 0, backgroundImage: `url("${t.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                                        <div style={{ flex: 1, padding: '14px 16px' }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{t.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                                                <Flame size={12} color="var(--energy)"/>
                                                <span className="num" style={{ fontSize: 12, color: 'var(--energy)', fontWeight: 600 }}>{t.kcal} kcal/día</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
                                            <ChevronRight size={16} color="var(--fg-dim)"/>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: MIS PLANES ── */}
            {tab === 'planes' && (
                <div style={{ padding: '16px 16px 0' }}>
                    {userDiets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🥗</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>Sin planes todavía</div>
                            <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginBottom: 24 }}>Crea tu primer plan de dieta personalizado</div>
                            <Link to="/diet/create" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'var(--accent)', color: 'var(--accent-ink)',
                                borderRadius: 14, padding: '12px 22px', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                            }}>
                                <Plus size={16}/> Crear plan
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {userDiets.map(diet => {
                                const isActive = user?.current_diet_id === diet.id;
                                return (
                                    <Link key={diet.id} to={`/diet/${diet.id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'var(--card)',
                                            border: `1px solid ${isActive ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)'}`,
                                            borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'stretch',
                                        }}>
                                            <div style={{
                                                width: 120, flexShrink: 0,
                                                backgroundImage: `url("${getDietImage(diet.name, seedFrom(diet.id || diet.name))}")`,
                                                backgroundSize: 'cover', backgroundPosition: 'center',
                                            }}/>
                                            <div style={{ flex: 1, padding: '14px 16px' }}>
                                                {isActive && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', background: 'var(--accent)', color: 'var(--accent-ink)', padding: '3px 7px', borderRadius: 5, display: 'inline-block', marginBottom: 8 }}>● ACTIVO</span>}
                                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>{diet.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 4 }}>
                                                    {diet.daily_calories_target || diet.total_calories || '—'} kcal · 7 días
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                                                    <Flame size={12} color="var(--energy)"/>
                                                    <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>Plan semanal</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 14 }}>
                                                <ChevronRight size={16} color="var(--fg-dim)"/>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
