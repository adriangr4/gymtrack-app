import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Flame, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyzeFoodImage, getMealByHour, type FoodAnalysis } from '../../services/foodAI';
import { logFood } from '../../services/nutrition';
import { getNutritionCache, setNutritionCache } from '../../services/nutrition';

type Phase = 'pick' | 'analyzing' | 'result' | 'done';

function MacroChip({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
    return (
        <div style={{ flex: 1, background: 'var(--card-2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color, marginBottom: 4 }}>{label.toUpperCase()}</div>
            <div className="num" style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>
                {value}<span style={{ fontSize: 11, color: 'var(--fg-dim)', fontWeight: 400 }}>{unit}</span>
            </div>
        </div>
    );
}

const CONFIDENCE_LABEL: Record<string, string> = { alta: 'Alta precisión', media: 'Precisión media', baja: 'Baja precisión' };
const CONFIDENCE_COLOR: Record<string, string> = { alta: 'var(--energy)', media: 'oklch(0.75 0.15 55)', baja: '#f87171' };

export function FoodScanPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement>(null);

    const [phase, setPhase] = useState<Phase>('pick');
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mealName] = useState(getMealByHour());

    const handleFile = (file: File) => {
        setError(null);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            setImgSrc(dataUrl);
            setPhase('analyzing');

            try {
                const result = await analyzeFoodImage(dataUrl);
                setAnalysis(result);
                setPhase('result');
            } catch (e: any) {
                if (e.message === 'NO_KEY') {
                    setError('Falta la API key de Groq. Añade VITE_GROQ_API_KEY en tu .env (gratis en console.groq.com)');
                } else {
                    setError(`No se pudo analizar la imagen: ${e.message}`);
                }
                setPhase('pick');
                setImgSrc(null);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleLog = async () => {
        if (!analysis || !user?.id) return;
        setPhase('done');
        try {
            const cache = getNutritionCache() || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 };
            setNutritionCache({
                ...cache,
                total_calories: (cache.total_calories || 0) + analysis.calories,
                total_protein:  (cache.total_protein  || 0) + analysis.protein,
                total_carbs:    (cache.total_carbs    || 0) + analysis.carbs,
                total_fat:      (cache.total_fat      || 0) + analysis.fat,
            });
            await logFood(user.id, {
                food_name: analysis.name,
                calories:  analysis.calories,
                protein:   analysis.protein,
                carbs:     analysis.carbs,
                fat:       analysis.fat,
                meal_name: mealName,
            });
        } catch {}
        setTimeout(() => navigate('/diet'), 1200);
    };

    const reset = () => {
        setPhase('pick');
        setImgSrc(null);
        setAnalysis(null);
        setError(null);
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--fg)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                    <ArrowLeft size={18}/>
                </button>
                <div style={{ flex: 1 }}>
                    <div className="eyebrow">IA · GEMINI VISION</div>
                    <div className="display" style={{ fontSize: 20, color: 'var(--fg)' }}>Escanear comida</div>
                </div>
                {(phase === 'result' || phase === 'analyzing') && (
                    <button onClick={reset} style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--card)', border: '1px solid var(--line-2)', color: 'var(--fg-dim)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                        <RotateCcw size={16}/>
                    </button>
                )}
            </div>

            <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingBottom: 40 }}>

                {/* Error */}
                {error && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)' }}>
                        <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }}/>
                        <p style={{ margin: 0, fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</p>
                    </div>
                )}

                {/* Image area */}
                <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--line)', aspectRatio: '4/3', maxHeight: 300, flexShrink: 0 }}>
                    {imgSrc ? (
                        <img src={imgSrc} alt="food" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                    ) : (
                        <label htmlFor="food-file" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', padding: 24 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'color-mix(in oklch, var(--accent) 14%, transparent)', border: '2px dashed color-mix(in oklch, var(--accent) 40%, var(--line))', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                                <Camera size={28}/>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', marginBottom: 4 }}>Fotografía tu comida</div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>Toca para abrir cámara o galería</div>
                            </div>
                        </label>
                    )}

                    {/* Analyzing overlay */}
                    {phase === 'analyzing' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }}/>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Analizando con IA…</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Gemini Vision está procesando tu foto</div>
                        </div>
                    )}

                    {/* Done overlay */}
                    {phase === 'done' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--energy)', display: 'grid', placeItems: 'center' }}>
                                <Check size={26} color="#fff"/>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>¡Registrado!</div>
                        </div>
                    )}
                </div>

                <input ref={fileRef} id="food-file" type="file" accept="image/*" capture="environment"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                {/* Pick CTA (visible only in pick state when no image) */}
                {phase === 'pick' && !imgSrc && (
                    <label htmlFor="food-file" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        borderRadius: 18, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 4px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
                    }}>
                        <Camera size={20}/> Abrir cámara / galería
                    </label>
                )}

                {/* Analysis result */}
                {phase === 'result' && analysis && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Food name + confidence */}
                        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg)', lineHeight: 1.2, flex: 1 }}>{analysis.name}</div>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 4,
                                    background: `color-mix(in oklch, ${CONFIDENCE_COLOR[analysis.confidence]} 14%, transparent)`,
                                    color: CONFIDENCE_COLOR[analysis.confidence],
                                    border: `1px solid color-mix(in oklch, ${CONFIDENCE_COLOR[analysis.confidence]} 35%, transparent)`,
                                    padding: '3px 9px', borderRadius: 999,
                                }}>{CONFIDENCE_LABEL[analysis.confidence]}</span>
                            </div>
                            {analysis.description && (
                                <p style={{ fontSize: 13, color: 'var(--fg-mute)', margin: 0, lineHeight: 1.6 }}>{analysis.description}</p>
                            )}
                        </div>

                        {/* Meal name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--fg-mute)' }}>Se registrará como:</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', padding: '3px 10px', borderRadius: 8 }}>{mealName}</span>
                        </div>

                        {/* Kcal highlight */}
                        <div style={{
                            background: 'color-mix(in oklch, var(--energy) 10%, var(--card))',
                            border: '1px solid color-mix(in oklch, var(--energy) 28%, var(--line))',
                            borderRadius: 18, padding: '14px 18px',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <Flame size={28} color="var(--energy)"/>
                            <div>
                                <div className="num" style={{ fontSize: 34, fontWeight: 900, color: 'var(--fg)', lineHeight: 1 }}>{analysis.calories}</div>
                                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 2 }}>kilocalorías estimadas</div>
                            </div>
                        </div>

                        {/* Macros */}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <MacroChip label="Proteína" value={analysis.protein} unit="g" color="var(--energy)"/>
                            <MacroChip label="Carbs"    value={analysis.carbs}   unit="g" color="var(--data)"/>
                            <MacroChip label="Grasas"   value={analysis.fat}     unit="g" color="var(--recovery)"/>
                        </div>

                        {/* Disclaimer */}
                        <p style={{ fontSize: 11, color: 'var(--fg-dim)', textAlign: 'center', margin: 0 }}>
                            Estimación generada por IA · Los valores pueden variar según la porción real
                        </p>

                        {/* Log button */}
                        <button onClick={handleLog} style={{
                            width: '100%', padding: '16px', borderRadius: 18, border: 0,
                            background: 'var(--accent)', color: 'var(--accent-ink)',
                            fontSize: 15, fontWeight: 700, cursor: 'pointer',
                            boxShadow: '0 4px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}>
                            <Check size={18}/> Me he comido esto
                        </button>

                        {/* Retry */}
                        <button onClick={reset} style={{
                            width: '100%', padding: '13px', borderRadius: 16, cursor: 'pointer',
                            background: 'transparent', border: '1px solid var(--line-2)',
                            color: 'var(--fg-mute)', fontSize: 13, fontWeight: 600,
                        }}>
                            Escanear otra foto
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
