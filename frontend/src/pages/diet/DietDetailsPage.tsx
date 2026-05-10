import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Trash2, Share2, Camera, Check, Flame, Clock,
    ChefHat, Star, Plus, BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNutritionCache, setNutritionCache, logFood } from '../../services/nutrition';
import { getDiet, deleteDiet } from '../../services/diet';
import { setActiveDiet } from '../../services/user';
import { shareToCommunity } from '../../services/social';
import { getDietImage, seedFrom, getImageOverride, setImageOverride, PRESET_DIET_PHOTOS } from '../../lib/imageUtils';
import { TEMPLATE_DIETS } from '../../data/dietTemplates';

export function DietDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [diet, setDiet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dietToDelete, setDietToDelete] = useState<string | null>(null);
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [, forceRender] = useState(0);
    const [toast, setToast] = useState<string | null>(null);
    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };
    // Persist logged foods per day using localStorage
    const todayStr = new Date().toISOString().slice(0, 10);
    const loggedKey = `lyfter_logged_${id}_${todayStr}`;
    const [loggedFoods, setLoggedFoodsState] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem(loggedKey) ?? '[]')); } catch { return new Set(); }
    });
    const setLoggedFoods = (updater: (prev: Set<string>) => Set<string>) => {
        setLoggedFoodsState(prev => {
            const next = updater(prev);
            localStorage.setItem(loggedKey, JSON.stringify([...next]));
            return next;
        });
    };
    const [todayMacros, setTodayMacros] = useState(() => getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });

    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [selectedDay, setSelectedDay] = useState(fullDays[new Date().getDay()]);

    useEffect(() => {
        const fetch = async () => {
            if (!id) return;
            try {
                if (TEMPLATE_DIETS[id]) {
                    setDiet({ id, ...TEMPLATE_DIETS[id] });
                } else {
                    setDiet(await getDiet(id));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleSetActive = async () => {
        if (!user?.id || !id) return;
        await setActiveDiet(user.id, id);
        if (updateUser) updateUser({ current_diet_id: id });
        showToast('¡Dieta seleccionada como principal!');
    };

    const handleLogFood = async (food: any, mealName: string, key: string) => {
        if (loggedFoods.has(key)) return;
        const cal = Math.round(food.calories || 0);
        setLoggedFoods(prev => new Set([...prev, key]));
        setTodayMacros((prev: any) => ({
            total_calories: (prev.total_calories || 0) + cal,
            total_protein:  (prev.total_protein  || 0) + (food.protein || 0),
            total_carbs:    (prev.total_carbs    || 0) + (food.carbs   || 0),
            total_fat:      (prev.total_fat      || 0) + (food.fat     || 0),
        }));
        const cache = getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
        setNutritionCache({ ...cache,
            total_calories: (cache.total_calories || 0) + cal,
            total_protein:  (cache.total_protein  || 0) + (food.protein || 0),
            total_carbs:    (cache.total_carbs    || 0) + (food.carbs   || 0),
            total_fat:      (cache.total_fat      || 0) + (food.fat     || 0),
        });
        if (user?.id) await logFood(user.id, { food_name: food.name, calories: cal, protein: food.protein || 0, carbs: food.carbs || 0, fat: food.fat || 0, meal_name: mealName }).catch(console.error);
    };

    if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--fg)' }}>Cargando…</div>;
    if (!diet)   return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--fg)' }}>No encontrada</div>;

    const isActive = user?.current_diet_id === id;
    const isOwn    = diet.user_id === user?.id;
    const heroImg  = getImageOverride(diet.id || diet.name) || getDietImage(diet.name, seedFrom(diet.id || diet.name), 800, 500);

    const isWeekly = diet?.weekly_plan?.length > 0;
    const dayPlan  = isWeekly ? diet.weekly_plan.find((d: any) => d.day === selectedDay) : null;
    const displayMeals: any[] = dayPlan?.meals || diet?.meals || [];

    const dayButtons = [
        { id: 'Monday', label: 'L' }, { id: 'Tuesday', label: 'M' }, { id: 'Wednesday', label: 'X' },
        { id: 'Thursday', label: 'J' }, { id: 'Friday', label: 'V' }, { id: 'Saturday', label: 'S' }, { id: 'Sunday', label: 'D' },
    ];

    const iconBtn: React.CSSProperties = {
        width: 36, height: 36, borderRadius: 11,
        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
        backdropFilter: 'blur(8px)',
    };

    const planCalories = (() => {
        if (!diet.weekly_plan?.length) return diet.daily_calories_target || 0;
        let totalDays = 0, grandTotal = 0;
        for (const day of diet.weekly_plan) {
            let dayTotal = 0, hasFood = false;
            for (const meal of (day.meals || [])) {
                for (const food of (meal.foods || [])) { dayTotal += food.calories || 0; hasFood = true; }
            }
            if (hasFood) { totalDays++; grandTotal += dayTotal; }
        }
        return totalDays ? Math.round(grandTotal / totalDays) : (diet.daily_calories_target || 0);
    })();

    const macros = diet.macros || {
        protein: Math.round((planCalories || 2000) * 0.30 / 4),
        carbs:   Math.round((planCalories || 2000) * 0.40 / 4),
        fat:     Math.round((planCalories || 2000) * 0.30 / 9),
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 90 }}>

            {toast && (
                <div style={{ position:'fixed', top:'calc(env(safe-area-inset-top, 0px) + 96px)', left:'50%', transform:'translateX(-50%)', zIndex:1000, background:'var(--card)', border:'1px solid var(--energy)', borderRadius:14, padding:'12px 20px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', whiteSpace:'nowrap' }}>
                    <span style={{ fontSize:16 }}>✓</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--energy)' }}>{toast}</span>
                </div>
            )}

            {/* Photo picker */}
            {showPhotoPicker && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 480, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '24px 24px 0 0', padding: '16px 16px 36px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Elegir foto de portada</span>
                            <button onClick={() => setShowPhotoPicker(false)} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', fontSize: 22 }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, overflowY: 'auto', maxHeight: '55vh' }}>
                            {PRESET_DIET_PHOTOS.map(p => (
                                <button key={p.id} onClick={() => { setImageOverride(diet.id || diet.name, p.url.replace('300','800').replace('200','500')); setShowPhotoPicker(false); forceRender(n=>n+1); }}
                                    style={{ padding:0, border:'2px solid transparent', borderRadius:12, overflow:'hidden', cursor:'pointer', aspectRatio:'3/2',
                                        backgroundImage:`url("${p.url}")`, backgroundSize:'cover', backgroundPosition:'center' }}>
                                    <div style={{ width:'100%',height:'100%',background:'rgba(0,0,0,0.25)',display:'flex',alignItems:'flex-end',padding:5 }}>
                                        <span style={{ fontSize:9,fontWeight:700,color:'#fff',textTransform:'uppercase',letterSpacing:'0.04em' }}>{p.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {dietToDelete && (
                <div style={{ position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
                    <div style={{ width:'100%',maxWidth:340,background:'var(--card)',border:'1px solid var(--line-2)',borderRadius:24,padding:'24px 20px' }}>
                        <div style={{ fontSize:17,fontWeight:700,color:'var(--fg)',marginBottom:8 }}>Eliminar dieta</div>
                        <div style={{ fontSize:13,color:'var(--fg-mute)',marginBottom:24 }}>Esta acción no se puede deshacer.</div>
                        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                            <button onClick={()=>setDietToDelete(null)} style={{ padding:'10px 18px',borderRadius:12,border:'1px solid var(--line-2)',background:'transparent',color:'var(--fg-mute)',fontWeight:600,fontSize:13,cursor:'pointer' }}>Cancelar</button>
                            <button onClick={async()=>{ await deleteDiet(dietToDelete); navigate('/diet'); }} style={{ padding:'10px 18px',borderRadius:12,border:0,background:'#ef4444',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer' }}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero image */}
            <div style={{ height: 280, position: 'relative', backgroundImage: `url("${heroImg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }}/>
                {/* Top bar */}
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, padding: '0 16px', display: 'flex', gap: 8, zIndex: 5 }}>
                    <button onClick={() => navigate(-1)} style={iconBtn}><ArrowLeft size={18}/></button>
                    <div style={{ flex: 1 }}/>
                    <button onClick={() => setShowPhotoPicker(true)} style={iconBtn}><Camera size={15}/></button>
                    {isOwn && (
                        <button onClick={async () => {
                            await shareToCommunity({ content_type: 'diet', content_id: diet.id, content_name: diet.name, content_image: diet.image_url, creator_id: user!.id, creator_name: user!.username, creator_avatar: user!.profilePicture, created_at: new Date().toISOString() });
                            showToast('¡Compartida con la comunidad!');
                        }} style={iconBtn}><Share2 size={15}/></button>
                    )}
                    {(isOwn || user?.is_admin) && (
                        <button onClick={() => setDietToDelete(diet.id)} style={{ ...iconBtn, color: '#fca5a5' }}><Trash2 size={15}/></button>
                    )}
                </div>
                {/* Bottom overlay */}
                <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 2 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.15 }}>{diet.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        {isActive ? (
                            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent)', color: 'var(--accent-ink)', padding: '4px 10px', borderRadius: 6 }}>● ACTIVO</span>
                        ) : (
                            <button onClick={handleSetActive} style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', padding: '6px 16px', borderRadius: 10, cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
                                Usar este plan
                            </button>
                        )}
                        {diet.rating && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8 }}>
                                <Star size={11} fill="#f59e0b" stroke="#f59e0b"/>{diet.rating}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 20px 0' }}>

                {/* Macro quick stats */}
                <div style={{ display: 'flex', gap: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
                    {[
                        { icon: <Flame size={18} color="var(--energy)"/>, value: planCalories || diet.daily_calories_target || '—', label: 'kcal/día' },
                        { icon: <Clock size={18} color="var(--data)"/>, value: diet.prep_time || '15-30', label: 'min/receta' },
                        { icon: <ChefHat size={18} color="var(--recovery)"/>, value: diet.difficulty === 'easy' ? 'Fácil' : diet.difficulty === 'medium' ? 'Media' : diet.difficulty === 'hard' ? 'Difícil' : 'Fácil', label: 'nivel' },
                    ].map((s, i) => (
                        <div key={i} style={{ flex: 1, padding: '14px 10px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
                            <div className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Description */}
                {diet.description && (
                    <p style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.65, marginBottom: 20 }}>{diet.description}</p>
                )}

                {/* Tags */}
                {diet.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {diet.tags.map((tag: string) => (
                            <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-mute)', background: 'var(--card-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '5px 12px' }}>{tag}</span>
                        ))}
                    </div>
                )}

                {/* Macro breakdown */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '16px', marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>Macronutrientes / día</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[
                            { label: 'Proteína', value: macros.protein, unit: 'g', color: 'var(--energy)' },
                            { label: 'Carbs',    value: macros.carbs,   unit: 'g', color: 'var(--data)' },
                            { label: 'Grasas',   value: macros.fat,     unit: 'g', color: 'var(--recovery)' },
                        ].map(m => (
                            <div key={m.label} style={{ background: 'var(--card-2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: m.color, marginBottom: 6 }}>{m.label.toUpperCase()}</div>
                                <div className="num" style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>{m.value}<span style={{ fontSize: 11, color: 'var(--fg-dim)', fontWeight: 400 }}>{m.unit}</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ingredients */}
                {diet.ingredients?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookOpen size={18} color="var(--accent)"/> Ingredientes
                        </div>
                        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
                            {diet.ingredients.map((ing: string, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderBottom: i < diet.ingredients.length - 1 ? '1px solid var(--line)' : 'none' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
                                    <span style={{ fontSize: 14, color: 'var(--fg)' }}>{ing}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Steps / Instructions */}
                {diet.steps?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ChefHat size={18} color="var(--accent)"/> Instrucciones
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {diet.steps.map((step: string, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                                    <p style={{ fontSize: 14, color: 'var(--fg-mute)', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Day selector (weekly plans) */}
                {isWeekly && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', marginBottom: 12 }}>Plan semanal</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 4, marginBottom: 16 }}>
                            {dayButtons.map(d => {
                                const isToday = fullDays[new Date().getDay()] === d.id;
                                return (
                                    <button key={d.id} onClick={() => setSelectedDay(d.id)} style={{
                                        flex: 1, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: selectedDay === d.id ? 'var(--accent)' : 'transparent',
                                        color: selectedDay === d.id ? 'var(--accent-ink)' : isToday ? 'var(--accent)' : 'var(--fg-mute)',
                                        fontWeight: 700, fontSize: 13,
                                    }}>{d.label}</button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Logged today summary */}
                {loggedFoods.size > 0 && (
                    <div style={{ background: 'color-mix(in oklch, var(--energy) 10%, var(--card))', border: '1px solid color-mix(in oklch, var(--energy) 30%, var(--line))', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--energy)', marginBottom: 6 }}>REGISTRADO HOY</div>
                        <div className="num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)' }}>
                            {todayMacros.total_calories} <span style={{ fontSize: 13, color: 'var(--fg-mute)', fontWeight: 400 }}>kcal totales</span>
                        </div>
                    </div>
                )}

                {/* Meals */}
                {displayMeals.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 14 }}>Comidas del día</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {displayMeals.map((meal: any, mIdx: number) => (
                                <div key={mIdx}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', background: 'color-mix(in oklch, var(--accent) 14%, transparent)', padding: '4px 10px', borderRadius: 6 }}>{(meal.name || '').toUpperCase()}</span>
                                    </div>
                                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
                                        {(meal.foods || []).map((food: any, fIdx: number) => {
                                            const key = `${mIdx}:${fIdx}`;
                                            const logged = loggedFoods.has(key);
                                            return (
                                                <div key={fIdx} style={{
                                                    display: 'flex', alignItems: 'center', gap: 12,
                                                    padding: '13px 16px',
                                                    borderBottom: fIdx < (meal.foods?.length || 0) - 1 ? '1px solid var(--line)' : 'none',
                                                    background: logged ? 'color-mix(in oklch, var(--energy) 8%, transparent)' : 'transparent',
                                                }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: logged ? 'var(--fg-mute)' : 'var(--fg)', textDecoration: logged ? 'line-through' : 'none' }}>{food.name}</div>
                                                        <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--energy)', display: 'flex', alignItems: 'center', gap: 3 }}><Flame size={10}/>{food.calories} kcal</span>
                                                            {food.protein > 0 && <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>P: {food.protein}g</span>}
                                                            {food.carbs > 0   && <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>C: {food.carbs}g</span>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleLogFood(food, meal.name, key)} style={{
                                                        width: 34, height: 34, borderRadius: 10, border: `1px solid ${logged ? 'var(--energy)' : 'var(--line-2)'}`,
                                                        background: logged ? 'var(--energy)' : 'transparent',
                                                        color: logged ? '#fff' : 'var(--fg-dim)', cursor: logged ? 'default' : 'pointer',
                                                        display: 'grid', placeItems: 'center', flexShrink: 0,
                                                    }}>
                                                        {logged ? <Check size={16}/> : <Plus size={16}/>}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
