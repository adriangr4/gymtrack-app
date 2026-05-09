import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const inputStyle: React.CSSProperties = {
    flex: 1, background: 'transparent', border: 0, outline: 'none',
    color: 'var(--fg)', fontSize: 14, fontFamily: 'inherit',
};

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            const code = err?.code ?? '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Email o contraseña incorrectos.');
            } else {
                setError('Error al iniciar sesión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Mesh background */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(70% 50% at 80% 0%, color-mix(in oklch, var(--accent) 25%, transparent), transparent 60%),
                    radial-gradient(60% 40% at 0% 100%, color-mix(in oklch, var(--energy) 22%, transparent), transparent 60%),
                    radial-gradient(50% 30% at 100% 100%, color-mix(in oklch, var(--data) 22%, transparent), transparent 60%)
                `,
            }}/>
            {/* Grid lines */}
            <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', width: '100%', height: '100%' }}>
                {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 44} x2="100%" y2={i * 44} stroke="white"/>)}
                {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="100%" stroke="white"/>)}
            </svg>

            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 420, width: '100%', margin: '0 auto', padding: '0 28px' }}>

                {/* Logo */}
                <div style={{ paddingTop: 64, marginBottom: 40 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        display: 'grid', placeItems: 'center', marginBottom: 32,
                        boxShadow: '0 0 32px color-mix(in oklch, var(--accent) 35%, transparent)',
                    }}>
                        <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                        </svg>
                    </div>
                    <div className="display" style={{ fontSize: 36, color: 'var(--fg)', marginBottom: 8 }}>
                        Welcome<br/>back.
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>
                        Sign in to continue your <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Lyfter</span> journey.
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171', fontSize: 13, fontWeight: 500,
                        }}>{error}</div>
                    )}

                    {/* Email */}
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 6 }}>Email</div>
                        <div style={{
                            height: 50, borderRadius: 14,
                            background: 'var(--card)', border: '1px solid var(--line-2)',
                            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
                        }}>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" style={inputStyle}
                                onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'color-mix(in oklch, var(--accent) 60%, var(--line))')}
                                onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--line-2)')}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="eyebrow" style={{ marginBottom: 6 }}>Password</div>
                        <div style={{
                            height: 50, borderRadius: 14,
                            background: 'var(--card)', border: '1px solid var(--line-2)',
                            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
                        }}>
                            <input type={showPw ? 'text' : 'password'} required value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" style={inputStyle}
                                onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'color-mix(in oklch, var(--accent) 60%, var(--line))')}
                                onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--line-2)')}
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                                style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center' }}>
                                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} style={{
                        marginTop: 8, width: '100%', height: 54, borderRadius: 16, border: 0,
                        background: loading ? 'color-mix(in oklch, var(--accent) 50%, transparent)' : 'var(--accent)',
                        color: 'var(--accent-ink)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
                        transition: 'opacity 0.15s',
                    }}>
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <>Sign in <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                    </button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--fg-dim)', fontSize: 11 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
                    <span>OR</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-mute)', paddingBottom: 40 }}>
                    New here?{' '}
                    <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        Create account →
                    </Link>
                </p>
            </div>
        </div>
    );
}
