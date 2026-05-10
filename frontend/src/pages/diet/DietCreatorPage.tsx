import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, Save } from 'lucide-react';
import { createDiet, clearDietsCache } from '../../services/diet';
import { useAuth } from '../../context/AuthContext';

import { useDebounce } from '../../hooks/useDebounce';

import { GoalCalculatorModal } from '../../components/diet/GoalCalculatorModal';
import { Calculator } from 'lucide-react';
import { ShareModal } from '../../components/social/ShareModal';

export function DietCreatorPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [targetCalories, setTargetCalories] = useState(2000);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [activeDay, setActiveDay] = useState('Monday');
    const [activeMeal, setActiveMeal] = useState('breakfast');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [shareModal, setShareModal] = useState<{ isOpen: boolean; dietId: string; dietName: string }>(
        { isOpen: false, dietId: '', dietName: '' }
    );
    const [makeSystem, setMakeSystem] = useState(false);
    const [prepTime, setPrepTime] = useState(30);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const [weeklyMeals, setWeeklyMeals] = useState<any>({
        Monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        Sunday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    });

    const days = [
        { id: 'Monday', label: 'L' },
        { id: 'Tuesday', label: 'M' },
        { id: 'Wednesday', label: 'X' },
        { id: 'Thursday', label: 'J' },
        { id: 'Friday', label: 'V' },
        { id: 'Saturday', label: 'S' },
        { id: 'Sunday', label: 'D' },
    ];

    useEffect(() => {
        const search = async () => {
            if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(debouncedSearchTerm)}&json=1&page_size=12&action=process&fields=product_name,product_name_es,brands,nutriments,image_front_small_url`
                );
                const data = await res.json();
                const mapped = (data.products ?? [])
                    .filter((p: any) => p.product_name)
                    .map((p: any) => ({
                        id: Math.random().toString(),
                        name: p.product_name_es || p.product_name,
                        brand: p.brands || '',
                        calories: Math.round(p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.['energy-kcal'] ?? 0),
                        protein:  Math.round((p.nutriments?.proteins_100g        ?? 0) * 10) / 10,
                        carbs:    Math.round((p.nutriments?.carbohydrates_100g   ?? 0) * 10) / 10,
                        fat:      Math.round((p.nutriments?.fat_100g             ?? 0) * 10) / 10,
                        image_url: p.image_front_small_url || '',
                    }));
                setSearchResults(mapped);
            } catch (error) {
                console.error('Error searching food:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };
        search();
    }, [debouncedSearchTerm]);

    const mealTabs = [
        { id: 'breakfast', label: 'Desayuno' },
        { id: 'lunch', label: 'Comida' },
        { id: 'dinner', label: 'Cena' },
        { id: 'snack', label: 'Snack' }
    ];

    const [addedId, setAddedId] = useState<string | null>(null);

    const addFoodToMeal = (food: any) => {
        const key = `${food.name}_${Date.now()}`;
        setWeeklyMeals((prev: any) => ({
            ...prev,
            [activeDay]: {
                ...prev[activeDay],
                [activeMeal]: [...prev[activeDay][activeMeal], { ...food, id: key }]
            }
        }));
        setAddedId(food.name);
        setTimeout(() => setAddedId(null), 1200);
        setSearchTerm('');
    };

    const removeFoodFromMeal = (_mealId: string, foodIndex: number) => {
        setWeeklyMeals((prev: any) => ({
            ...prev,
            [activeDay]: {
                ...prev[activeDay],
                [activeMeal]: prev[activeDay][activeMeal].filter((_: any, idx: number) => idx !== foodIndex)
            }
        }));
    };

    const calculateTotalCalories = () => {

        let totalDays = 0;
        let grandTotal = 0;

        Object.values(weeklyMeals).forEach((dayMeals: any) => {
            let dayTotal = 0;
            let hasFood = false;
            Object.values(dayMeals).forEach((mealList: any) => {
                if (mealList.length > 0) hasFood = true;
                mealList.forEach((food: any) => dayTotal += food.calories);
            });
            if (hasFood) {
                totalDays++;
                grandTotal += dayTotal;
            }
        });

        if (totalDays === 0) return 0;

        return Math.floor(grandTotal / totalDays);
    };

    const handleSaveDiet = async () => {
        if (!name) return alert("Ponle nombre a tu dieta!");

        const weeklyPlanPayload = Object.entries(weeklyMeals).map(([day, mealsObj]: [string, any]) => {
            const dayMeals = Object.entries(mealsObj).map(([key, foods]: [string, any]) => ({
                name: key,
                foods: foods
            })).filter(m => m.foods.length > 0);

            return {
                day: day,
                meals: dayMeals
            };
        }).filter(d => d.meals.length > 0);

        const randomImages = [
            'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop',
        ];
        const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

        try {
            const created = await createDiet({
                name,
                daily_calories_target: targetCalories,
                calories: targetCalories,
                protein: 0,
                carbs: 0,
                fats: 0,
                meals: [],
                weekly_plan: weeklyPlanPayload,
                image_url: randomImage,
                prep_time: prepTime,
                difficulty,
            } as any, (user?.is_admin && makeSystem) ? 'system' : (user?.id ?? ''));
            clearDietsCache();
            if (created?.id) {
                setShareModal({ isOpen: true, dietId: created.id, dietName: name });
            } else {
                navigate('/diet');
            }
        } catch (error) {
            console.error("Error saving diet", error);
            alert("Error al guardar la dieta");
        }
    };

    return (
        <div className="w-full bg-transparent text-foreground p-6 pt-8">
            <ShareModal
                isOpen={shareModal.isOpen}
                contentType="diet"
                contentId={shareModal.dietId}
                contentName={shareModal.dietName}
                onClose={() => {
                    setShareModal({ isOpen: false, dietId: '', dietName: '' });
                    navigate('/diet');
                }}
            />
            {}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full hover:bg-muted transition-colors">
                    <ArrowLeft className="size-6" />
                </button>
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Nombre de tu dieta..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent text-xl font-bold placeholder:text-muted-foreground w-full outline-none"
                    />
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Kcal</p>
                    <div className="flex items-center justify-end gap-2">
                        <p className={`text-xl font-black ${calculateTotalCalories() > targetCalories ? 'text-red-500' : 'text-green-500'}`}>
                            {calculateTotalCalories()} <span className="text-xs text-muted-foreground font-medium">/ {targetCalories}</span>
                        </p>
                        <button onClick={() => setIsCalculatorOpen(true)} className="p-1.5 bg-card border border-border rounded-lg text-primary hover:bg-primary hover:text-white transition-colors">
                            <Calculator className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            <GoalCalculatorModal
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                onApply={(cals) => setTargetCalories(cals)}
            />

            {}
            <div className="flex justify-between mb-6 bg-card/30 p-1 rounded-2xl">
                {days.map(day => (
                    <button
                        key={day.id}
                        onClick={() => setActiveDay(day.id)}
                        className={`size-10 rounded-xl flex items-center justify-center font-bold transition-all ${activeDay === day.id
                            ? 'bg-primary text-white shadow-lg scale-110'
                            : 'text-muted-foreground hover:bg-white/5'
                            }`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            {}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                <div style={{ flex:1, background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'10px 14px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-mute)', letterSpacing:'0.08em', marginBottom:4 }}>PREP (min)</div>
                    <input
                        type="number" min={5} max={240} step={5}
                        value={prepTime}
                        onChange={e => setPrepTime(Number(e.target.value))}
                        style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:16, fontWeight:700, color:'var(--fg)' }}
                    />
                </div>
                <div style={{ flex:2, background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'10px 14px' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-mute)', letterSpacing:'0.08em', marginBottom:6 }}>DIFICULTAD</div>
                    <div style={{ display:'flex', gap:6 }}>
                        {(['easy','medium','hard'] as const).map(d => (
                            <button key={d} onClick={() => setDifficulty(d)} style={{
                                flex:1, padding:'4px 0', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer',
                                border: difficulty === d ? '1px solid var(--accent)' : '1px solid var(--line)',
                                background: difficulty === d ? 'color-mix(in oklch,var(--accent) 18%,var(--card))' : 'var(--card-2)',
                                color: difficulty === d ? 'var(--accent)' : 'var(--fg-mute)',
                            }}>
                                {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Media' : 'Difícil'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {mealTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveMeal(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeMeal === tab.id ? 'bg-primary text-white' : 'bg-card text-muted-foreground border border-border'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar comida (ej. Avena, Hacendado...)"
                    className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                )}
            </div>

            {}
            {addedId && (
                <div style={{ display:'flex', alignItems:'center', gap:8, background:'color-mix(in oklch,var(--energy) 12%,var(--card))', border:'1px solid color-mix(in oklch,var(--energy) 35%,var(--line))', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                    <span style={{ fontSize:16 }}>✓</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--energy)' }}>"{addedId}" añadido</span>
                </div>
            )}
            {searchResults.length > 0 && (
                <div className="mb-8 space-y-2 max-h-60 overflow-y-auto bg-card/50 rounded-2xl p-2 border border-border">
                    <p className="text-xs font-bold text-muted-foreground px-2 mb-1">Resultados de búsqueda</p>
                    {searchResults.map((food, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl hover:bg-muted cursor-pointer" onClick={() => addFoodToMeal(food)}>
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-white rounded-md overflow-hidden shrink-0">
                                    {food.image_url ? (
                                        <img src={food.image_url} alt={food.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate w-40">{food.name}</p>
                                    <p className="text-xs text-muted-foreground">{food.brand} • {Math.round(food.calories)} kcal/100g</p>
                                </div>
                            </div>
                            <Plus className="size-5 text-primary" />
                        </div>
                    ))}
                </div>
            )}

            {}
            <div className="space-y-4 mb-24">
                <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                    {mealTabs.find(t => t.id === activeMeal)?.label}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-normal">
                        {weeklyMeals[activeDay][activeMeal].reduce((acc: number, f: any) => acc + f.calories, 0).toFixed(0)} kcal
                    </span>
                </h3>

                {weeklyMeals[activeDay][activeMeal].length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-muted rounded-2xl">
                        <p className="text-muted-foreground">No hay alimentos en esta comida</p>
                        <p className="text-xs text-muted-foreground/50 mt-1">Busca arriba para añadir</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {weeklyMeals[activeDay][activeMeal].map((food: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-white rounded-md overflow-hidden shrink-0">
                                        {food.image_url ? (
                                            <img src={food.image_url} alt={food.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200"></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm line-clamp-1">{food.name}</p>
                                        <p className="text-xs text-muted-foreground">{Math.round(food.calories)} kcal</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFoodFromMeal(activeMeal, idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 pt-0 bg-linear-to-t from-background via-background to-transparent md:static md:bg-none" style={{ paddingBottom: 100 }}>
                {user?.is_admin && (
                    <div
                        onClick={() => setMakeSystem(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: makeSystem ? 'color-mix(in oklch,var(--accent) 12%,var(--card))' : 'var(--card)',
                            border: `1px solid ${makeSystem ? 'color-mix(in oklch,var(--accent) 40%,var(--line))' : 'var(--line)'}`,
                            borderRadius: 14, padding: '10px 14px', marginBottom: 10, cursor: 'pointer',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>🛡️ Dieta predefinida del sistema</div>
                            <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>Visible para todos los usuarios</div>
                        </div>
                        <div style={{
                            width: 40, height: 22, borderRadius: 11,
                            background: makeSystem ? 'var(--accent)' : 'var(--line)',
                            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                        }}>
                            <div style={{
                                position: 'absolute', top: 3, left: makeSystem ? 21 : 3,
                                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                transition: 'left 0.2s',
                            }}/>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleSaveDiet}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(19,91,236,0.5)] hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                    <Save className="size-5" />
                    {makeSystem && user?.is_admin ? 'Publicar como predefinida' : 'Guardar Dieta'}
                </button>
            </div>
        </div>
    );
}
