import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Share2, ChefHat, Flame, Plus, Camera, Check } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { getNutritionCache, setNutritionCache } from '../../services/nutrition';
import { deleteDiet } from '../../services/diet';
import { shareToCommunity } from '../../services/social';
import { getDietImage, seedFrom, getImageOverride, setImageOverride, PRESET_DIET_PHOTOS } from '../../lib/imageUtils';

export function DietDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [diet, setDiet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dietToDelete, setDietToDelete] = useState<string | null>(null);
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [, forceRender] = useState(0);
    // Track logged foods: key = `${mealName}:${foodIndex}`
    const [loggedFoods, setLoggedFoods] = useState<Set<string>>(new Set());
    // Live macro totals for today (from cache initially)
    const [todayMacros, setTodayMacros] = useState(() => getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });

    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const [selectedDay, setSelectedDay] = useState(fullDays[todayIndex]);

    useEffect(() => {
        setSelectedDay(fullDays[new Date().getDay()]);
    }, []);

    useEffect(() => {
        const fetchDiet = async () => {
            if (!id) return;
            try {

                if (id === 'keto-basic') {
                    setDiet({
                        name: 'Keto para Principiantes',
                        daily_calories_target: 1800,
                        meals: [
                            { name: 'Breakfast', foods: [{ name: 'Huevos revueltos', calories: 300 }, { name: 'Aguacate', calories: 160 }] },
                            { name: 'Lunch', foods: [{ name: 'Ensalada de Pollo', calories: 450 }, { name: 'Aceite de Oliva', calories: 120 }] },
                            { name: 'Dinner', foods: [{ name: 'Salmón al horno', calories: 500 }, { name: 'Espárragos', calories: 50 }] }
                        ]
                    });
                } else if (id === 'mediterranean') {
                    setDiet({
                        name: 'Dieta Mediterránea',
                        daily_calories_target: 2000,
                        meals: [
                            { name: 'Breakfast', foods: [{ name: 'Tostada con Tomate', calories: 250 }, { name: 'Café', calories: 10 }] },
                            { name: 'Lunch', foods: [{ name: 'Lentejas guisadas', calories: 600 }, { name: 'Manzana', calories: 80 }] },
                        ]
                    });
                } else if (id === 'high-protein') {
                    setDiet({
                        id: 'high-protein',
                        name: 'Hiperproteica',
                        daily_calories_target: 2500,
                        description: 'Dieta rica en proteínas para el desarrollo muscular.',
                        meals: []
                    });
                }
                else {
                    const res = await api.get(`/diets/${id}`);
                    setDiet(res.data);
                }
            } catch (error) {
                console.error("Error fetching diet details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDiet();
    }, [id]);

    const handleSetActive = async () => {
        try {
            await api.put('/users/me/active_diet', { diet_id: id });
            alert("¡Dieta seleccionada como principal!");

            if (updateUser) {
                const userRes = await api.get('/users/me');
                updateUser(userRes.data);
            }
        } catch (e) {
            console.error("Error setting active diet", e);
        }
    };

    const handleLogFood = async (food: any, mealName: string, foodKey: string) => {
        if (loggedFoods.has(foodKey)) return; // already logged
        try {
            const cal = Math.round(food.calories || 0);
            const protein = food.protein || 0;
            const carbs = food.carbs || 0;
            const fat = food.fat || 0;

            // Optimistic UI update
            setLoggedFoods(prev => new Set([...prev, foodKey]));
            setTodayMacros((prev: any) => ({
                total_calories: (prev.total_calories || 0) + cal,
                total_protein:  (prev.total_protein  || 0) + protein,
                total_carbs:    (prev.total_carbs    || 0) + carbs,
                total_fat:      (prev.total_fat      || 0) + fat,
            }));

            // Also update nutrition cache so Home picks it up
            const cache = getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
            setNutritionCache({
                ...cache,
                total_calories: (cache.total_calories || 0) + cal,
                total_protein:  (cache.total_protein  || 0) + protein,
                total_carbs:    (cache.total_carbs    || 0) + carbs,
                total_fat:      (cache.total_fat      || 0) + fat,
            });

            const res = await api.post('/nutrition/log', { calories: cal, protein, carbs, fat, food_name: food.name, meal_type: mealName });
            if (res.data) { setNutritionCache(res.data); setTodayMacros(res.data); }
        } catch (e) {
            console.error(e);
            // Rollback optimistic update
            setLoggedFoods(prev => { const s = new Set(prev); s.delete(foodKey); return s; });
            alert('Error al registrar el alimento');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-foreground">Cargando...</div>;
    if (!diet) return <div className="min-h-screen flex items-center justify-center text-foreground">Dieta no encontrada</div>;

    const isActive = user?.current_diet_id === id;

    const days = [
        { id: 'Monday', label: 'L' },
        { id: 'Tuesday', label: 'M' },
        { id: 'Wednesday', label: 'X' },
        { id: 'Thursday', label: 'J' },
        { id: 'Friday', label: 'V' },
        { id: 'Saturday', label: 'S' },
        { id: 'Sunday', label: 'D' },
    ];

    const handleDeleteDietClick = () => {
        if (!diet?.id) {
            alert("Las plantillas del sistema no se pueden eliminar.");
            return;
        }
        setDietToDelete(diet.id);
    };

    const confirmDeleteDiet = async () => {
        if (!dietToDelete) return;
        try {
            await deleteDiet(dietToDelete);
            navigate('/diet');
        } catch (e) {
            console.error(e);
            alert("Error al eliminar la dieta");
        } finally {
            setDietToDelete(null);
        }
    };

    const handleShareDiet = async () => {
        if (!diet || !user) return;
        try {
            await shareToCommunity({
                content_type: 'diet',
                content_id: diet.id,
                content_name: diet.name,
                content_image: diet.image_url,
                creator_id: user.id,
                creator_name: user.username || user.email.split('@')[0],
                creator_avatar: user.profilePicture
            });
            alert("¡Dieta compartida con la comunidad!");
        } catch (e: any) {
            console.error("Failed to share", e);
            alert(e.response?.data?.detail || "Error al compartir la dieta. Quizás ya la has compartido.");
        }
    };

    const deleteModal = dietToDelete && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-2xl border border-border">
                <h3 className="text-xl font-bold mb-2 text-foreground">Eliminar Dieta</h3>
                <p className="text-muted-foreground mb-6">¿Estás seguro de que deseas eliminar esta dieta permanentemente?</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setDietToDelete(null)}
                        className="px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors text-foreground"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmDeleteDiet}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition-all"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );

    let displayMeals = diet?.meals || [];
    let isWeekly = false;

    if (diet?.weekly_plan && diet.weekly_plan.length > 0) {
        isWeekly = true;
        const dayPlan = diet.weekly_plan.find((d: any) => d.day === selectedDay);
        displayMeals = dayPlan?.meals || [];
    }

    const totalCalories = displayMeals.reduce((acc: number, meal: any) =>
        acc + (meal.foods?.reduce((fAcc: number, food: any) => fAcc + (food.calories || 0), 0) || 0), 0
    ) || 0;

    const heroImg = getImageOverride(diet.id || diet.name) ||
        getDietImage(diet.name, seedFrom(diet.id || diet.name), 800, 400);

    const iconBtnStyle: React.CSSProperties = {
        width: 36, height: 36, borderRadius: 11,
        background: 'rgba(0,0,0,0.42)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
        backdropFilter: 'blur(8px)',
    };

    return (
        <div className="w-full text-foreground" style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 80 }}>

            {/* Photo picker bottom sheet */}
            {showPhotoPicker && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: 480, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '24px 24px 0 0', padding: '16px 16px 32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Choose cover photo</span>
                            <button onClick={() => setShowPhotoPicker(false)} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {PRESET_DIET_PHOTOS.map(p => (
                                <button key={p.id} onClick={() => { setImageOverride(diet.id || diet.name, p.url.replace('300', '800').replace('200', '400')); setShowPhotoPicker(false); forceRender(n => n + 1); }} style={{
                                    padding: 0, border: '2px solid transparent', borderRadius: 12, overflow: 'hidden',
                                    cursor: 'pointer', aspectRatio: '3/2',
                                    backgroundImage: `url("${p.url}")`, backgroundSize: 'cover', backgroundPosition: 'center',
                                }}>
                                    <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero */}
            <div style={{
                height: 220, position: 'relative',
                backgroundImage: `url("${heroImg}")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }}/>
                {/* Action bar */}
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 5 }}>
                    <button onClick={() => navigate(-1)} style={iconBtnStyle}><ArrowLeft size={18}/></button>
                    <div style={{ flex: 1 }}/>
                    <button onClick={() => setShowPhotoPicker(true)} style={iconBtnStyle}><Camera size={15}/></button>
                    {diet.user_id === user?.id && <>
                        <button onClick={handleShareDiet} style={iconBtnStyle}><Share2 size={15}/></button>
                        <button onClick={handleDeleteDietClick} style={{ ...iconBtnStyle, color: '#fca5a5' }}><Trash2 size={15}/></button>
                    </>}
                </div>
                {/* Title overlay */}
                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>{diet.name}</h1>
                            {isWeekly && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Weekly plan</p>}
                        </div>
                        {isActive ? (
                            <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--accent)', color: 'var(--accent-ink)', padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>● ACTIVE</span>
                        ) : (
                            <button onClick={handleSetActive} style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', backdropFilter: 'blur(6px)' }}>
                                USE
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 20px 0' }}>

            {}
            {isWeekly && (
                <div className="flex justify-between mb-6 bg-card/30 p-1 rounded-2xl">
                    {days.map(day => {
                        const isToday = fullDays[new Date().getDay()] === day.id;
                        return (
                            <button
                                key={day.id}
                                onClick={() => setSelectedDay(day.id)}
                                className={`size-10 rounded-xl flex flex-col items-center justify-center transition-all relative ${selectedDay === day.id
                                    ? 'bg-primary text-white shadow-lg scale-110 z-10'
                                    : 'text-muted-foreground hover:bg-white/5'
                                    }`}
                            >
                                <span className="font-bold">{day.label}</span>
                                {isToday && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-70"></span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {}
            <div className="bg-card border border-border rounded-3xl p-6 mb-8 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">
                            Objetivo {isWeekly ? selectedDay : 'Diario'}
                        </p>
                        <p className="text-3xl font-black">{diet.daily_calories_target} <span className="text-lg text-muted-foreground font-normal">kcal</span></p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-orange-500 mb-1">
                            <Flame className="size-4 fill-orange-500" />
                            <span className="font-bold">{Math.round(totalCalories)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Planificado</p>
                    </div>
                </div>
                {}
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-primary to-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalCalories / diet.daily_calories_target) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Live macro tracker for today */}
            {(todayMacros.total_calories > 0 || loggedFoods.size > 0) && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: 'color-mix(in oklch, var(--accent) 8%, var(--card))', border: '1px solid color-mix(in oklch, var(--accent) 22%, var(--line))', borderRadius: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>TODAY LOGGED</span>
                        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(todayMacros.total_calories)} kcal</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {[
                            { label: 'Protein', val: Math.round(todayMacros.total_protein || 0), color: 'var(--energy)' },
                            { label: 'Carbs',   val: Math.round(todayMacros.total_carbs   || 0), color: 'var(--data)' },
                            { label: 'Fats',    val: Math.round(todayMacros.total_fat     || 0), color: 'var(--recovery)' },
                        ].map(m => (
                            <div key={m.label} style={{ textAlign: 'center', background: 'var(--card-2)', borderRadius: 10, padding: '6px 0' }}>
                                <div className="num" style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.val}g</div>
                                <div style={{ fontSize: 9, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {}
            <div className="space-y-6">
                {displayMeals.map((meal: any, idx: number) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h3 className="font-bold text-lg capitalize mb-3 flex items-center gap-2">
                            <ChefHat className="size-5 text-primary" />
                            {meal.name === 'breakfast' ? 'Desayuno' :
                                meal.name === 'lunch' ? 'Comida' :
                                    meal.name === 'dinner' ? 'Cena' :
                                        meal.name === 'snack' ? 'Snack' : meal.name}
                        </h3>
                        {meal.foods?.length > 0 ? (
                            <div className="space-y-3">
                                {meal.foods.map((food: any, fIdx: number) => {
                                    const foodKey = `${meal.name}:${fIdx}`;
                                    const logged = loggedFoods.has(foodKey);
                                    return (
                                        <div key={fIdx} style={{
                                            background: logged ? 'color-mix(in oklch, var(--accent) 8%, var(--card))' : 'var(--card)',
                                            border: `1px solid ${logged ? 'color-mix(in oklch, var(--accent) 28%, var(--line))' : 'var(--line)'}`,
                                            borderRadius: 14, padding: '10px 12px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            transition: 'all 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                {food.image_url ? (
                                                    <img src={food.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                                                ) : (
                                                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--card-2)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                                                        <ChefHat size={14} color="var(--fg-dim)"/>
                                                    </div>
                                                )}
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: logged ? 'var(--accent)' : 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</p>
                                                    <p className="num" style={{ fontSize: 10, color: 'var(--fg-dim)', margin: 0 }}>
                                                        P {Math.round(food.protein||0)}g · C {Math.round(food.carbs||0)}g · G {Math.round(food.fat||0)}g
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>{Math.round(food.calories)}</p>
                                                    <p style={{ fontSize: 9, color: 'var(--fg-dim)', margin: 0 }}>kcal</p>
                                                </div>
                                                <button
                                                    onClick={() => handleLogFood(food, meal.name, foodKey)}
                                                    disabled={logged}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: '50%', border: 0,
                                                        background: logged ? 'var(--accent)' : 'color-mix(in oklch, var(--accent) 16%, transparent)',
                                                        color: logged ? 'var(--accent-ink)' : 'var(--accent)',
                                                        display: 'grid', placeItems: 'center',
                                                        cursor: logged ? 'default' : 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {logged ? <Check size={14}/> : <Plus size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic pl-7 border-l-2 border-muted py-1">Sin alimentos para {isWeekly ? selectedDay : 'hoy'}</p>
                        )}
                    </div>
                ))}
            </div>
            {deleteModal}
            </div>{/* end padding wrapper */}
        </div>
    );
}
