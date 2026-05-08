import { useEffect, useState } from 'react';

interface Props {
    days: number;
    onClose: () => void;
}

export function StreakFireOverlay({ days, onClose }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const t1 = setTimeout(() => setVisible(true), 50);
        // Auto-dismiss after 3.5 s
        const t2 = setTimeout(onClose, 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s',
            opacity: visible ? 1 : 0,
        }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    textAlign: 'center',
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
                    transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Animated fire emoji rings */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                    {/* Outer glow ring */}
                    <div style={{
                        position: 'absolute', inset: -20,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,140,0,0.35) 0%, transparent 70%)',
                        animation: 'pulse-fire 1.2s ease-in-out infinite',
                    }}/>
                    <div style={{
                        fontSize: 90,
                        lineHeight: 1,
                        filter: 'drop-shadow(0 0 24px rgba(255,120,0,0.8))',
                        animation: 'bounce-fire 0.6s ease-in-out infinite alternate',
                        display: 'block',
                    }}>
                        🔥
                    </div>
                </div>

                <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,200,60,0.9)',
                    marginBottom: 8,
                }}>
                    STREAK ALIVE
                </div>

                <div style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1,
                    marginBottom: 6,
                    fontFamily: 'var(--font-mono)',
                    textShadow: '0 0 32px rgba(255,140,0,0.8)',
                }}>
                    {days}
                </div>

                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 24 }}>
                    {days === 1
                        ? "First day of your streak! 💪"
                        : `${days} days in a row — keep going!`}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        background: 'linear-gradient(135deg, #ff8c00, #ff4500)',
                        color: '#fff',
                        border: 0,
                        borderRadius: 16,
                        padding: '12px 32px',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 24px rgba(255,100,0,0.5)',
                    }}
                >
                    Keep it up! →
                </button>
            </div>

            <style>{`
                @keyframes pulse-fire {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50%       { transform: scale(1.2); opacity: 1; }
                }
                @keyframes bounce-fire {
                    from { transform: translateY(0) rotate(-5deg); }
                    to   { transform: translateY(-12px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
