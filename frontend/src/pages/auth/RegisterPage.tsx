import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';

const inputStyle: React.CSSProperties = {
    flex: 1, background: 'transparent', border: 0, outline: 'none',
    color: 'var(--fg)', fontSize: 14, fontFamily: 'inherit',
};

export function RegisterPage() {
    const [username, setUsername] = useState('');
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
            await api.post('/users/', { username, email, password });
            const fd = new FormData();
            fd.append('username', email);
            fd.append('password', password);
            const { data } = await api.post('/login/access-token', fd);
            login(data.access_token, data.user || { username, email, id: 0 });
            navigate('/');
        } catch (err: any) {
            const msg = err.response?.data?.detail;
            setError(typeof msg === 'string' ? msg : 'Error al registrarse.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Mesh */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(70% 50% at 20% 0%, color-mix(in oklch, var(--accent) 25%, transparent), transparent 60%),
                    radial-gradient(50% 40% at 100% 100%, color-mix(in oklch, var(--recovery) 22%, transparent), transparent 60%)
                `,
            }}/>
            <svg style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', width: '100%', height: '100%' }}>
                {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 44} x2="100%" y2={i * 44} stroke="white"/>)}
                {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="100%" stroke="white"/>)}
            </svg>

            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 420, width: '100%', margin: '0 auto', padding: '0 28px' }}>

                <div style={{ paddingTop: 32, marginBottom: 32 }}>
                    <button onClick={() => navigate('/login')} style={{
                        width: 40, height: 40, borderRadius: 13,
                        background: 'var(--card)', border: '1px solid var(--line-2)',
                        color: 'var(--fg)', display: 'grid', placeItems: 'center',
                        cursor: 'pointer', marginBottom: 28,
                    }}>
                        <ChevronLeft size={18}/>
                    </button>
                    <div className="display" style={{ fontSize: 34, color: 'var(--fg)', marginBottom: 8 }}>
                        Start your<br/>streak.
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg-mute)' }}>
                        Free forever. Earn XP, <span style={{ color: 'var(--accent)', fontWeight: 600 }}>level up</span> your training.
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#f87171', fontSize: 13, fontWeight: 500,
                        }}>{error}</div>
                    )}

                    {[
                        { label: 'Username', type: 'text', value: username, set: setUsername, placeholder: '@yourusername' },
                        { label: 'Email', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com' },
                    ].map(({ label, type, value, set, placeholder }) => (
                        <div key={label}>
                            <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
                            <div style={{
                                height: 50, borderRadius: 14,
                                background: 'var(--card)', border: '1px solid var(--line-2)',
                                display: 'flex', alignItems: 'center', padding: '0 14px',
                            }}>
                                <input type={type} required value={value} onChange={e => set(e.target.value)}
                                    placeholder={placeholder} style={inputStyle}
                                    onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'color-mix(in oklch, var(--accent) 60%, var(--line))')}
                                    onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--line-2)')}
                                />
                            </div>
                        </div>
                    ))}

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
                                placeholder="At least 8 characters" style={inputStyle}
                                onFocus={e => (e.currentTarget.parentElement!.style.borderColor = 'color-mix(in oklch, var(--accent) 60%, var(--line))')}
                                onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--line-2)')}
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)}
                                style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', padding: 0, display: 'grid', placeItems: 'center' }}>
                                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        marginTop: 8, width: '100%', height: 54, borderRadius: 16, border: 0,
                        background: loading ? 'color-mix(in oklch, var(--accent) 50%, transparent)' : 'var(--accent)',
                        color: 'var(--accent-ink)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
                    }}>
                        {loading ? <Loader2 size={18} className="animate-spin"/> : <>Create account <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-mute)', marginTop: 28, paddingBottom: 40 }}>
                    Have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in →
                    </Link>
                </p>
            </div>
        </div>
    );
}
