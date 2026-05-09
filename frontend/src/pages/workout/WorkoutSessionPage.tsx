import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Timer, Flame, Dumbbell, CheckCircle2, RotateCw, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoutine, type Routine } from '../../services/routines';
import { logWorkoutSession, clearHistoryCache } from '../../services/tracking';
import { useAuth } from '../../context/AuthContext';
import { LevelUpOverlay } from '../../components/gamification/LevelUpOverlay';
import { StreakFireOverlay } from '../../components/gamification/StreakFireOverlay';

export function WorkoutSessionPage() {
    const { routineId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [routine, setRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);
    const [isActive, setIsActive] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

    const [setDetails, setSetDetails] = useState<Record<string, { weight: number, reps: number }>>({});

    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [streakDays, setStreakDays] = useState(0);
    const [showStreakFire, setShowStreakFire] = useState(false);

    const [rating, setRating] = useState(5);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [availableDays, setAvailableDays] = useState<string[]>([]);

    useEffect(() => {
        if (routineId) {
            getRoutine(routineId)
                .then(data => {
                    setRoutine(data);

                    const exercises = data.exercises || [];
                    const uniqueDays = Array.from(new Set(exercises.map((ex: any) => ex.day_of_week))).sort((a: any, b: any) => a - b);
                    const days = uniqueDays.map(d => `Día ${d}`);

                    setAvailableDays(days);

                    if (days.length === 1) {
                        setSelectedDay(days[0]);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [routineId]);

    useEffect(() => {
        if (routine && selectedDay !== null) {

            const exercises = routine.exercises || [];
            const dayNum = parseInt(selectedDay.split(' ')[1]);
            const sessionExercises = exercises
                .filter((ex: any) => ex.day_of_week === dayNum)
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

            const details: Record<string, { weight: number, reps: number }> = {};

            sessionExercises.forEach((ex: any, exIdx: number) => {
                const seriesCount = ex.target_sets || ex.series || 3;
                const targetRepsStr = ex.target_reps_min ? `${ex.target_reps_min}` : (ex.reps || "10");
                const targetReps = parseInt(targetRepsStr) || 10;

                for (let i = 0; i < seriesCount; i++) {
                    details[`${exIdx}-${i}`] = {
                        weight: 0,
                        reps: targetReps
                    };
                }
            });
            setSetDetails(details);

            setCurrentExerciseIndex(0);
            setCurrentSetIndex(0);
            setCompletedSets({});
        }
    }, [routine, selectedDay]);

    useEffect(() => {
        let interval: any;
        if (isActive && !isFinished) {
            interval = setInterval(() => {
                setElapsedSeconds(s => s + 1);

                setCaloriesBurned(c => c + 0.15);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isFinished]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFinish = () => {
        setIsActive(false);
        setIsFinished(true);
    };

    const updateSetDetail = (key: string, field: 'weight' | 'reps', value: number) => {
        setSetDetails(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const getSessionExercises = () => {
        if (!routine || !selectedDay) return [];

        const exercises = routine.exercises || [];
        const dayNum = parseInt(selectedDay.split(' ')[1]);
        return exercises
            .filter((ex: any) => ex.day_of_week === dayNum)
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
    };

    const sessionExercises = getSessionExercises();
    const currentExercise = sessionExercises[currentExerciseIndex];

    const handleStartWorkout = () => {
        if (selectedDay === null) return;
        setIsActive(true);
    };

    const handleCompleteSet = () => {
        const setKey = `${currentExerciseIndex}-${currentSetIndex}`;
        setCompletedSets(prev => ({ ...prev, [setKey]: true }));

        const seriesCount = currentExercise.target_sets || currentExercise.series || 3;

        if (currentSetIndex < seriesCount - 1) {
            setCurrentSetIndex(prev => prev + 1);
        } else {
            if (currentExerciseIndex < sessionExercises.length - 1) {
                setTimeout(() => {
                    setCurrentExerciseIndex(prev => prev + 1);
                    setCurrentSetIndex(0);
                }, 500);
            } else {
                handleFinish();
            }
        }
    };

    const [showLevelUp, setShowLevelUp] = useState(false);
    const [xpData, setXpData] = useState<{
        xpGained: number;
        currentLevel: number;
        initialXp: number;
        finalXp: number;
        nextLevelXp: number;
        prevLevelXp: number;
    } | null>(null);

    const handleSubmitLog = async () => {
        if (!routine) return;
        setIsSubmitting(true);

        const logs = Object.entries(setDetails).map(([key, details]) => {
            const [exIdx, setIdx] = key.split('-').map(Number);
            const exercise = sessionExercises[exIdx];
            if (!exercise) return null;

            return {
                exercise_id: exercise.exercise_id,
                set_number: setIdx + 1,
                reps: typeof details.reps === 'string' ? parseInt(details.reps) || 0 : details.reps,
                weight_kg: typeof details.weight === 'string' ? parseFloat(details.weight) || 0 : details.weight,
                notes: ""
            };
        }).filter((log): log is { exercise_id: string; set_number: number; reps: number; weight_kg: number; notes: string; } => log !== null);

        try {

            const response = await logWorkoutSession({
                routine_id: routine.id || "",
                duration_seconds: elapsedSeconds,
                calories_burned: Math.round(caloriesBurned),
                rating: rating,
                difficulty: difficulty,
                notes: `Completed ${routine.name}`,
                logs: logs
            }, user?.id ?? '');

            const data = response;
            clearHistoryCache();

            setXpData({
                xpGained: data.xp_gained,
                currentLevel: data.new_level,
                initialXp: data.new_total_xp - data.xp_gained,
                finalXp: data.new_total_xp,
                nextLevelXp: data.next_level_xp,
                prevLevelXp: data.prev_level_xp
            });

            // Fetch updated streak from dashboard
            try {
                const { getDashboardStats } = await import('../../services/user');
                const dashStats = await getDashboardStats(user?.id ?? '');
                if (dashStats.streak_days >= 1) {
                    setStreakDays(dashStats.streak_days);
                    setShowStreakFire(true);
                }
            } catch {}

            setShowLevelUp(true);
            setIsSubmitting(false);

        } catch (error: any) {
            console.error("Failed to save workout", error);

            const msg = error.response?.data?.detail || error.message || "Error desconocido";
            alert(`Error al guardar: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!routine) return <div className="min-h-screen flex items-center justify-center">Rutina no encontrada</div>;

    if (!isActive && !isFinished && availableDays.length > 1 && selectedDay === null) {
        return (
            <div className="min-h-screen bg-background p-6 flex flex-col justify-center gap-6">
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 hover:bg-muted rounded-full">
                    <ChevronLeft className="size-6" />
                </button>

                <div className="text-center">
                    <h1 className="text-3xl font-black mb-2">{routine.name}</h1>
                    <p className="text-muted-foreground">Selecciona el día de entrenamiento</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {availableDays.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className="bg-card hover:bg-muted border border-border p-6 rounded-2xl flex items-center justify-between group transition-all"
                        >
                            <div>
                                <h3 className="text-xl font-bold">{day}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {(routine.exercises || []).filter((e: any) => e.day_of_week === parseInt(day.split(' ')[1])).length} Ejercicios
                                </p>
                            </div>
                            <ChevronRight className="size-6 text-muted-foreground group-hover:text-primary" />
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    if (sessionExercises.length === 0) return <div>No exercises for this day</div>;

    if (isFinished) {
        return (
            <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="size-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle2 className="size-12" />
                </motion.div>
                <h1 className="text-3xl font-black mb-2 text-center">¡Entrenamiento Completado!</h1>
                <p className="text-muted-foreground text-center mb-8">Gran trabajo, {user?.username || 'Atleta'}. Así es como mejoras.</p>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                        <Timer className="size-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold">{formatTime(elapsedSeconds)}</p>
                        <p className="text-xs text-muted-foreground">Tiempo Total</p>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl text-center">
                        <Flame className="size-6 text-orange-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{Math.floor(caloriesBurned)}</p>
                        <p className="text-xs text-muted-foreground">Kcal Quemadas</p>
                    </div>
                </div>

                <div className="w-full space-y-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium mb-3">¿Cómo te has sentido?</label>
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`flex-1 h-12 rounded-lg font-bold transition-all ${rating >= star ? 'bg-yellow-500 text-black' : 'bg-muted text-muted-foreground'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Dificultad Percibida</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setDifficulty('easy')} className={`p-3 rounded-xl border-2 font-medium transition-all ${difficulty === 'easy' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-border bg-card'}`}>Fácil</button>
                            <button onClick={() => setDifficulty('medium')} className={`p-3 rounded-xl border-2 font-medium transition-all ${difficulty === 'medium' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-border bg-card'}`}>Media</button>
                            <button onClick={() => setDifficulty('hard')} className={`p-3 rounded-xl border-2 font-medium transition-all ${difficulty === 'hard' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-border bg-card'}`}>Difícil</button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmitLog}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Save className="size-5" />
                    {isSubmitting ? "Guardando..." : "Guardar en Historial"}
                </button>

                {}
                {xpData && (
                    <LevelUpOverlay
                        isVisible={showLevelUp}
                        onClose={() => navigate('/')}
                        xpGained={xpData.xpGained}
                        currentLevel={xpData.currentLevel}
                        initialXp={xpData.initialXp}
                        finalXp={xpData.finalXp}
                        nextLevelXp={xpData.nextLevelXp}
                        prevLevelXp={xpData.prevLevelXp}
                    />
                )}

                {/* Streak fire overlay */}
                {showStreakFire && !showLevelUp && (
                    <StreakFireOverlay days={streakDays} onClose={() => { setShowStreakFire(false); setShowLevelUp(true); }} />
                )}
            </div>
        )
    }

    if (!isActive) {

        return (
            <div className="min-h-screen bg-background p-6 flex flex-col justify-center gap-6">
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 hover:bg-muted rounded-full">
                    <ChevronLeft className="size-6" />
                </button>

                <div className="text-center relative">
                    <div className="aspect-video w-full rounded-3xl bg-muted relative overflow-hidden flex items-center justify-center border border-border shadow-inner mb-6">
                        {}
                        <Dumbbell className="size-20 text-muted-foreground/20" />
                    </div>
                    <h1 className="text-3xl font-black mb-2">{routine.name}</h1>
                    <p className="text-muted-foreground text-lg mb-8">{sessionExercises.length} Ejercicios • {selectedDay}</p>

                    <button onClick={handleStartWorkout} className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-3xl transition-all active:scale-[0.98] shadow-lg shadow-green-500/20">
                        <Play className="fill-current size-6" />
                        <span className="text-xl">Empezar Rutina</span>
                    </button>
                </div>
            </div>
        )
    }

    const setsLeft = (currentExercise.target_sets || currentExercise.series || 3) - currentSetIndex;

    return (
        <div className="min-h-screen bg-background flex flex-col pb-safe overflow-hidden">
            {}
            <div className="p-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full">
                    <ChevronLeft className="size-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">TIEMPO</span>
                    <span className="text-2xl font-black font-mono tracking-widest">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="p-2 opacity-0"><ChevronLeft className="size-6" /></div>
            </div>

            {}
            <div className="grid grid-cols-3 border-b border-border/50">
                <div className="p-3 flex flex-col items-center border-r border-border/50">
                    <Flame className="size-4 text-orange-500 mb-1" />
                    <span className="text-lg font-bold">{caloriesBurned.toFixed(0)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Kcal</span>
                </div>
                <div className="p-3 flex flex-col items-center border-r border-border/50">
                    <Dumbbell className="size-4 text-blue-500 mb-1" />
                    <span className="text-lg font-bold">{currentExerciseIndex + 1}/{sessionExercises.length}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Ejer</span>
                </div>
                <div className="p-3 flex flex-col items-center">
                    <RotateCw className="size-4 text-green-500 mb-1" />
                    <span className="text-lg font-bold">{setsLeft}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Series Rest.</span>
                </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentExerciseIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-6"
                    >
                        {}
                        {(() => {

                            const exName = currentExercise.exercise?.name || currentExercise.name || "Ejercicio";

                            const getExerciseImage = (name: string) => {
                                const n = name.toLowerCase();
                                if (n.includes('pecho') || n.includes('press') || n.includes('aperturas') || n.includes('push') || n.includes('fondos') || n.includes('pectoral')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop';
                                if (n.includes('espalda') || n.includes('remo') || n.includes('jalón') || n.includes('pull') || n.includes('dominadas') || n.includes('dorsal')) return 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&h=400&fit=crop';
                                if (n.includes('pierna') || n.includes('sentadilla') || n.includes('prensa') || n.includes('zancada') || n.includes('extension') || n.includes('curl femoral') || n.includes('gemelos')) return 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop';
                                if (n.includes('bíceps') || n.includes('curl')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop';
                                if (n.includes('tríceps') || n.includes('francés') || n.includes('polea') || n.includes('fondos')) return 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600&h=400&fit=crop';
                                if (n.includes('hombro') || n.includes('militar') || n.includes('elevaciones') || n.includes('pájaro') || n.includes('deltoides')) return 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop';
                                if (n.includes('abs') || n.includes('abdominal') || n.includes('plancha') || n.includes('crunch')) return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop';
                                return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop';
                            };
                            const bgImage = getExerciseImage(exName);

                            return (
                                <>
                                    <div className="aspect-video w-full rounded-3xl bg-muted relative overflow-hidden flex items-center justify-center border border-border shadow-inner group">
                                        <img
                                            src={bgImage}
                                            alt={exName}
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                        <div className="size-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 border border-white/30 shadow-2xl">
                                            <Play className="size-6 text-white fill-current ml-1" />
                                        </div>

                                        <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-lg z-10 shadow-lg border border-white/10">
                                            <p className="text-white font-bold text-sm flex items-center gap-1">
                                                <Play className="size-3 fill-current" /> Demo
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-black leading-tight mb-2">{exName}</h1>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {}
                                            <span className="bg-primary/20 text-primary px-2 py-1 rounded-md font-bold">Ejercicio</span>
                                            <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">{currentExercise.target_sets || currentExercise.series || 3} Series</span>
                                            <span className="bg-muted px-2 py-1 rounded-md text-muted-foreground">{currentExercise.target_reps_min ? `${currentExercise.target_reps_min}-${currentExercise.target_reps_max}` : (currentExercise.reps || "10")} Reps</span>
                                        </div>
                                    </div>

                                    {}
                                    <div className="space-y-3">
                                        {(() => {
                                            const seriesCount = currentExercise.target_sets || currentExercise.series || 3;
                                            const repsDisplay = currentExercise.target_reps_min ? `${currentExercise.target_reps_min}-${currentExercise.target_reps_max}` : (currentExercise.reps || "10");

                                            return Array.from({ length: seriesCount }).map((_, i) => {
                                                const setKey = `${currentExerciseIndex}-${i}`;
                                                const isCompleted = completedSets[setKey];
                                                const isCurrent = i === currentSetIndex;
                                                const details = setDetails[setKey] || { weight: 0, reps: 0 };

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={false}
                                                        animate={{
                                                            backgroundColor: isCompleted ? "rgba(34, 197, 94, 0.1)" : isCurrent ? "rgba(var(--primary), 0.1)" : "transparent",
                                                            borderColor: isCompleted ? "rgba(34, 197, 94, 0.5)" : isCurrent ? "rgba(var(--primary), 0.5)" : "rgba(var(--border), 0.5)",
                                                            scale: isCurrent ? 1.02 : 1
                                                        }}
                                                        className={`p-4 rounded-xl border transition-all ${isCompleted ? 'border-green-500/50' : 'border-border'}`}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                                                    {isCompleted ? <CheckCircle2 className="size-5" /> : i + 1}
                                                                </div>
                                                                <span className={`font-bold ${isCompleted ? 'text-green-500' : isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>Serie {i + 1}</span>
                                                            </div>
                                                            {(isCurrent || isCompleted) && (
                                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                                                    {isCompleted ? "COMPLETADO" : "EN CURSO"}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            <div className="relative">
                                                                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Peso (Kg)</label>
                                                                <input
                                                                    type="number"
                                                                    value={details.weight || ''}
                                                                    onChange={(e) => updateSetDetail(setKey, 'weight', parseFloat(e.target.value))}
                                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold focus:border-primary outline-none"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                            <div className="relative">
                                                                <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Reps ({repsDisplay})</label>
                                                                <input
                                                                    type="number"
                                                                    value={details.reps || ''}
                                                                    onChange={(e) => updateSetDetail(setKey, 'reps', parseFloat(e.target.value))}
                                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-bold focus:border-primary outline-none"
                                                                    placeholder={repsDisplay.split('-')[0] || ""}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        })()}
                                    </div>
                                </>
                            );
                        })()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {}
            <div className="p-4 bg-background border-t border-border mt-auto">
                <button
                    onClick={handleCompleteSet}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
                >
                    {currentSetIndex < (currentExercise.target_sets || currentExercise.series || 3) - 1 ? "Siguiente Serie" : "Siguiente Ejercicio"}
                    <ChevronLeft className="rotate-180 size-5" />
                </button>
            </div>
            {}
            {xpData && (
                <LevelUpOverlay
                    isVisible={showLevelUp}
                    onClose={() => navigate('/')}
                    xpGained={xpData.xpGained}
                    currentLevel={xpData.currentLevel}
                    initialXp={xpData.initialXp}
                    finalXp={xpData.finalXp}
                    nextLevelXp={xpData.nextLevelXp}
                    prevLevelXp={xpData.prevLevelXp}
                />
            )}
            {showStreakFire && !showLevelUp && (
                <StreakFireOverlay days={streakDays} onClose={() => { setShowStreakFire(false); setShowLevelUp(true); }} />
            )}
        </div>
    );
}
