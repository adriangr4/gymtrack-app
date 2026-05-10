import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
    type: 'routine' | 'diet';
    onClose: () => void;
}

const ROUTINE_QUESTIONS = [
    { q: '¿Cuántos días a la semana puedes entrenar?', opts: ['1-2 días', '3-4 días', '5-6 días'] },
    { q: '¿Cuál es tu nivel de experiencia?', opts: ['Principiante (< 6 meses)', 'Intermedio (6m-2 años)', 'Avanzado (> 2 años)'] },
    { q: '¿Cuál es tu objetivo principal?', opts: ['Perder peso / tonificar', 'Ganar músculo', 'Mejorar fuerza y rendimiento'] },
];

const DIET_QUESTIONS = [
    { q: '¿Cuál es tu objetivo nutricional?', opts: ['Perder peso', 'Ganar músculo', 'Mantener peso saludable'] },
    { q: '¿Tienes restricciones alimentarias?', opts: ['Ninguna', 'Sin gluten o lácteos', 'Vegetariano o vegano'] },
    { q: '¿Cuántas calorías diarias buscas consumir?', opts: ['Menos de 1800 kcal', '1800–2200 kcal', 'Más de 2200 kcal'] },
];

function recommend(type: 'routine' | 'diet', answers: number[]) {
    if (type === 'routine') {
        if (answers[1] === 0) return { id: 'sys_routine_beginner',    name: 'Full Body Starter (Principiante)', path: '/library' };
        if (answers[1] === 1) return { id: 'sys_routine_intermediate', name: 'Push Pull Legs (Intermedio)',       path: '/library' };
        return                       { id: 'sys_routine_advanced',     name: 'Powerbuilding 5-Day (Avanzado)',    path: '/library' };
    }
    if (answers[2] === 0)       return { id: 'keto-basic',    name: 'Keto para Principiantes', path: '/diet/keto-basic' };
    if (answers[0] === 1)       return { id: 'high-protein',  name: 'Alta en Proteínas',       path: '/diet/high-protein' };
    return                             { id: 'mediterranean', name: 'Dieta Mediterránea',      path: '/diet/mediterranean' };
}

export function LevelQuizModal({ type, onClose }: Props) {
    const navigate = useNavigate();
    const questions = type === 'routine' ? ROUTINE_QUESTIONS : DIET_QUESTIONS;
    const [step, setStep]       = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult]   = useState<ReturnType<typeof recommend> | null>(null);

    const pick = (idx: number) => {
        const next = [...answers, idx];
        setAnswers(next);
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setResult(recommend(type, next));
        }
    };

    return (
        <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
            <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:380, background:'var(--card)', border:'1px solid var(--line-2)', borderRadius:24, padding:'24px 20px' }}>

                {!result ? (
                    <>
                        {/* Progress */}
                        <div style={{ fontSize:11, fontWeight:700, color:'var(--fg-mute)', letterSpacing:'0.08em', marginBottom:8 }}>
                            {type === 'routine' ? '🏋️' : '🥗'} PREGUNTA {step + 1} / {questions.length}
                        </div>
                        <div style={{ height:3, background:'var(--line)', borderRadius:3, marginBottom:20, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${((step + 1) / questions.length) * 100}%`, background:'var(--accent)', transition:'width 0.3s' }}/>
                        </div>
                        <div style={{ fontSize:17, fontWeight:700, color:'var(--fg)', marginBottom:20, lineHeight:1.4 }}>
                            {questions[step].q}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            {questions[step].opts.map((opt, i) => (
                                <button key={i} onClick={() => pick(i)} style={{
                                    padding:'14px 16px', borderRadius:14,
                                    border:'1px solid var(--line)', background:'var(--card-2)',
                                    color:'var(--fg)', fontSize:14, fontWeight:500,
                                    cursor:'pointer', textAlign:'left',
                                }}>{opt}</button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign:'center', marginBottom:20 }}>
                            <div style={{ fontSize:48, marginBottom:12 }}>{type === 'routine' ? '🏋️' : '🥗'}</div>
                            <div style={{ fontSize:18, fontWeight:800, color:'var(--fg)', marginBottom:8 }}>¡Recomendación lista!</div>
                            <p style={{ fontSize:14, color:'var(--fg-mute)', lineHeight:1.6, margin:0 }}>
                                Basándonos en tus respuestas, te recomendamos:
                            </p>
                        </div>
                        <div style={{ background:'color-mix(in oklch,var(--accent) 10%,var(--card-2))', border:'1px solid color-mix(in oklch,var(--accent) 35%,var(--line))', borderRadius:16, padding:16, marginBottom:20, textAlign:'center' }}>
                            <div style={{ fontSize:16, fontWeight:800, color:'var(--fg)' }}>{result.name}</div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            <button onClick={() => { navigate(result.path); onClose(); }} style={{
                                width:'100%', padding:14, borderRadius:16, border:0,
                                background:'var(--accent)', color:'var(--accent-ink)',
                                fontSize:14, fontWeight:700, cursor:'pointer',
                            }}>
                                Ver {type === 'routine' ? 'esta rutina' : 'este plan'} →
                            </button>
                            <button onClick={onClose} style={{
                                width:'100%', padding:12, borderRadius:14,
                                border:'1px solid var(--line-2)', background:'transparent',
                                color:'var(--fg-mute)', fontSize:13, fontWeight:600, cursor:'pointer',
                            }}>Explorar por mi cuenta</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
