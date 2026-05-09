import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Sparkles, ScanLine, X, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Payment brand logos ───────────────────────────────────────────────────────
function MastercardLogo({ size = 38 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.65} viewBox="0 -11 70 70" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3945 34.7619C33.0114 36.8184 29.92 38.0599 26.5421 38.0599C19.0047 38.0599 12.8945 31.8788 12.8945 24.254C12.8945 16.6291 19.0047 10.448 26.5421 10.448C29.92 10.448 33.0114 11.6895 35.3945 13.7461C37.7777 11.6895 40.869 10.448 44.247 10.448C51.7843 10.448 57.8945 16.6291 57.8945 24.254C57.8945 31.8788 51.7843 38.0599 44.247 38.0599C40.869 38.0599 37.7777 36.8184 35.3945 34.7619Z" fill="#ED0006"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3945 34.7619C38.3289 32.2296 40.1896 28.4616 40.1896 24.254C40.1896 20.0463 38.3289 16.2783 35.3945 13.7461C37.7777 11.6895 40.869 10.448 44.247 10.448C51.7843 10.448 57.8945 16.6291 57.8945 24.254C57.8945 31.8788 51.7843 38.0599 44.247 38.0599C40.869 38.0599 37.7777 36.8184 35.3945 34.7619Z" fill="#F9A000"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M35.3946 13.7461C38.329 16.2784 40.1897 20.0463 40.1897 24.254C40.1897 28.4616 38.329 32.2295 35.3946 34.7618C32.4603 32.2295 30.5996 28.4616 30.5996 24.254C30.5996 20.0463 32.4603 16.2784 35.3946 13.7461Z" fill="#FF5E00"/>
        </svg>
    );
}

function ApplePayLogo({ height = 26 }: { height?: number }) {
    const w = height * 1.46;
    return (
        <svg width={w} height={height} viewBox="0 -9 58 58" fill="none">
            <rect x="0.5" y="0.5" width="57" height="39" rx="5" fill="white" stroke="#E5E5E5"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M17.5771 14.9265C17.1553 15.4313 16.4803 15.8294 15.8053 15.7725C15.7209 15.09 16.0513 14.3649 16.4381 13.9171C16.8599 13.3981 17.5982 13.0284 18.1959 13C18.2662 13.7109 17.992 14.4076 17.5771 14.9265ZM18.1888 15.9076C17.5942 15.873 17.0516 16.0884 16.6133 16.2624C16.3313 16.3744 16.0924 16.4692 15.9107 16.4692C15.7068 16.4692 15.4581 16.3693 15.1789 16.2571C14.813 16.1102 14.3947 15.9422 13.956 15.9502C12.9506 15.9645 12.0154 16.5403 11.5021 17.4573C10.4474 19.2915 11.2279 22.0071 12.2474 23.5C12.7467 24.2393 13.3443 25.0498 14.1318 25.0213C14.4783 25.0081 14.7275 24.9012 14.9854 24.7905C15.2823 24.6631 15.5908 24.5308 16.0724 24.5308C16.5374 24.5308 16.8324 24.6597 17.1155 24.7834C17.3847 24.9011 17.6433 25.014 18.0271 25.0071C18.8428 24.9929 19.356 24.2678 19.8553 23.5284C20.394 22.7349 20.6307 21.9605 20.6667 21.843L20.6709 21.8294C20.4715 21.7366 19.095 21.0995 19.0818 19.391C19.0686 17.957 20.1736 17.2304 20.3476 17.116C20.3685 17.1019 19.6654 16.0498 18.5685 15.936C18.1888 15.9076 18.1888 15.9076 18.1888 15.9076ZM23.8349 24.9289V13.846H27.9482C30.0717 13.846 31.5553 15.3246 31.5553 17.4858C31.5553 19.6469 30.0435 21.1398 27.892 21.1398H25.5365V24.9289H23.8349ZM25.5365 15.2962H27.4982C28.9748 15.2962 29.8185 16.0924 29.8185 17.4929C29.8185 18.8934 28.9748 19.6967 27.4912 19.6967H25.5365V15.2962ZM37.1732 23.5995C36.7232 24.4668 35.7318 25.0142 34.6631 25.0142C33.081 25.0142 31.9771 24.0616 31.9771 22.6256C31.9771 21.2038 33.0459 20.3863 35.0217 20.2654L37.1451 20.1374V19.5261C37.1451 18.6232 36.5615 18.1327 35.5209 18.1327C34.6631 18.1327 34.0373 18.5806 33.9107 19.263H32.3779C32.4271 17.827 33.7631 16.782 35.5701 16.782C37.5177 16.782 38.7834 17.8128 38.7834 19.4123V24.9289H37.2084V23.5995H37.1732ZM35.1201 23.6991C34.2131 23.6991 33.6365 23.2583 33.6365 22.5829C33.6365 21.8863 34.192 21.481 35.2537 21.4171L37.1451 21.2962V21.9218C37.1451 22.9597 36.2732 23.6991 35.1201 23.6991ZM44.0076 25.3626C43.3256 27.3033 42.5451 27.9431 40.8857 27.9431C40.7592 27.9431 40.3373 27.9289 40.2388 27.9005V26.5711C40.3443 26.5853 40.6045 26.5995 40.7381 26.5995C41.4904 26.5995 41.9123 26.2796 42.1724 25.4479L42.3271 24.9573L39.4443 16.8886H41.2232L43.2271 23.436H43.2623L45.2662 16.8886H46.9959L44.0076 25.3626Z" fill="#000000"/>
        </svg>
    );
}

function GooglePayLogo({ height = 24 }: { height?: number }) {
    const w = height * 2.52;
    return (
        <svg width={w} height={height} viewBox="0 0 2387.3 948">
            <path d="M1129.1,463.2V741h-88.2V54.8h233.8c56.4-1.2,110.9,20.2,151.4,59.4c41,36.9,64.1,89.7,63.2,144.8c1.2,55.5-21.9,108.7-63.2,145.7c-40.9,39-91.4,58.5-151.4,58.4L1129.1,463.2L1129.1,463.2z M1129.1,139.3v239.6h147.8c32.8,1,64.4-11.9,87.2-35.5c46.3-45,47.4-119.1,2.3-165.4c-0.8-0.8-1.5-1.6-2.3-2.3c-22.5-24.1-54.3-37.3-87.2-36.4L1129.1,139.3L1129.1,139.3z M1692.5,256.2c65.2,0,116.6,17.4,154.3,52.2c37.7,34.8,56.5,82.6,56.5,143.2V741H1819v-65.2h-3.8c-36.5,53.7-85.1,80.5-145.7,80.5c-51.7,0-95-15.3-129.8-46c-33.8-28.5-53-70.7-52.2-115c0-48.6,18.4-87.2,55.1-115.9c36.7-28.7,85.7-43.1,147.1-43.1c52.3,0,95.5,9.6,129.3,28.7v-20.2c0.2-30.2-13.2-58.8-36.4-78c-23.3-21-53.7-32.5-85.1-32.1c-49.2,0-88.2,20.8-116.9,62.3l-77.6-48.9C1545.6,286.8,1608.8,256.2,1692.5,256.2L1692.5,256.2z M1578.4,597.3c-0.1,22.8,10.8,44.2,29.2,57.5c19.5,15.3,43.7,23.5,68.5,23c37.2-0.1,72.9-14.9,99.2-41.2c29.2-27.5,43.8-59.7,43.8-96.8c-27.5-21.9-65.8-32.9-115-32.9c-35.8,0-65.7,8.6-89.6,25.9C1590.4,550.4,1578.4,571.7,1578.4,597.3L1578.4,597.3z M2387.3,271.5L2093,948h-91l109.2-236.7l-193.6-439.8h95.8l139.9,337.3h1.9l136.1-337.3L2387.3,271.5z" fill="#5F6368"/>
            <path d="M772.8,403.2c0-26.9-2.2-53.7-6.8-80.2H394.2v151.8h212.9c-8.8,49-37.2,92.3-78.7,119.8v98.6h127.1C729.9,624.7,772.8,523.2,772.8,403.2L772.8,403.2z" fill="#4285F4"/>
            <path d="M394.2,788.5c106.4,0,196-34.9,261.3-95.2l-127.1-98.6c-35.4,24-80.9,37.7-134.2,37.7c-102.8,0-190.1-69.3-221.3-162.7H42v101.6C108.9,704.5,245.2,788.5,394.2,788.5z" fill="#34A853"/>
            <path d="M172.9,469.7c-16.5-48.9-16.5-102,0-150.9V217.2H42c-56,111.4-56,242.7,0,354.1L172.9,469.7z" fill="#FBBC04"/>
            <path d="M394.2,156.1c56.2-0.9,110.5,20.3,151.2,59.1L658,102.7C586.6,35.7,492.1-1.1,394.2,0C245.2,0,108.9,84.1,42,217.2l130.9,101.6C204.1,225.4,291.4,156.1,394.2,156.1z" fill="#EA4335"/>
        </svg>
    );
}

function PayPalLogo({ height = 22 }: { height?: number }) {
    return (
        <svg width={height * 3.8} height={height} viewBox="0 0 114 30" fill="none">
            <text y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="26" fill="#003087">Pay</text>
            <text x="44" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="26" fill="#009cde">Pal</text>
        </svg>
    );
}

// ─── Card utils ───────────────────────────────────────────────────────────────
function detectCardType(num: string): 'visa' | 'mc' | 'amex' | 'default' {
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'mc';
    if (num.startsWith('3')) return 'amex';
    return 'default';
}
function cardGradient(type: string) {
    if (type === 'visa')    return 'linear-gradient(135deg,#1a1f71 0%,#2d3282 50%,#f7b600 100%)';
    if (type === 'mc')      return 'linear-gradient(135deg,#1c1c1c 0%,#2d2d2d 50%,#1c1c1c 100%)';
    if (type === 'amex')    return 'linear-gradient(135deg,#007B5E 0%,#00C9A7 100%)';
    return 'linear-gradient(135deg,oklch(0.28 0.16 280) 0%,oklch(0.18 0.10 260) 100%)';
}
function formatNum(raw: string) {
    return raw.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
}
function formatExpiry(raw: string) {
    const d = raw.replace(/\D/g,'').slice(0,4);
    return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d;
}

const BENEFITS = [
    { icon: <ScanLine size={18}/>, label: 'Escáner IA de comida',   desc: 'Fotografía cualquier plato y obtén sus macros al instante' },
    { icon: <X size={18}/>,        label: 'Sin anuncios',           desc: 'Experiencia limpia sin interrupciones' },
    { icon: <Sparkles size={18}/>, label: 'Funciones exclusivas',   desc: 'Acceso anticipado a todo lo nuevo' },
    { icon: <CreditCard size={18}/>, label: 'Soporte prioritario',  desc: 'Respuesta en menos de 24h' },
];

// ─── Already Pro screen ────────────────────────────────────────────────────────
function AlreadyPro({ onClose }: { onClose: () => void }) {
    return (
        <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, gap:20 }}>
            <div style={{ width:80, height:80, borderRadius:28, background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'grid', placeItems:'center', boxShadow:'0 0 40px rgba(245,158,11,0.4)' }}>
                <Sparkles size={36} color="#fff"/>
            </div>
            <div style={{ textAlign:'center' }}>
                <div className="display" style={{ fontSize:28, color:'var(--fg)' }}>Ya eres Pro ✨</div>
                <p style={{ fontSize:14, color:'var(--fg-mute)', marginTop:8, lineHeight:1.6 }}>Tienes acceso completo a todas las funciones exclusivas.</p>
            </div>
            <div style={{ width:'100%', maxWidth:340, background:'var(--card)', border:'1px solid var(--line)', borderRadius:20, overflow:'hidden' }}>
                {BENEFITS.map((b,i) => (
                    <div key={b.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom: i<BENEFITS.length-1?'1px solid var(--line)':'none' }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:'color-mix(in oklch,var(--accent) 14%,transparent)', display:'grid', placeItems:'center', color:'var(--accent)', flexShrink:0 }}>{b.icon}</div>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--fg)', flex:1 }}>{b.label}</span>
                        <Check size={16} color="var(--energy)"/>
                    </div>
                ))}
            </div>
            <button onClick={onClose} style={{ background:'var(--accent)', color:'var(--accent-ink)', border:'none', borderRadius:16, padding:'14px 32px', fontWeight:700, fontSize:15, cursor:'pointer' }}>
                Continuar
            </button>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ProPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const isPro = user?.is_pro;
    const [method, setMethod]     = useState<'card'|'paypal'|'apple'|'google'>('card');
    const [phase, setPhase]       = useState<'form'|'processing'|'success'>('form');
    const [cardNum, setCardNum]   = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry]     = useState('');
    const [cvv, setCvv]           = useState('');
    const [showBack, setShowBack] = useState(false);

    if (isPro) return <AlreadyPro onClose={() => navigate('/')} />;

    const cardType  = detectCardType(cardNum.replace(/\s/g,''));
    const displayNum  = formatNum(cardNum)  || '•••• •••• •••• ••••';
    const displayName = cardName            || 'NOMBRE APELLIDO';
    const displayExp  = expiry              || 'MM/AA';

    const handlePay = async () => {
        setPhase('processing');
        await new Promise(r => setTimeout(r, 2400));
        await updateUser({ is_pro: true });
        setPhase('success');
        setTimeout(() => navigate('/'), 2800);
    };

    // ── Processing ────────────────────────────────────────────────────────────
    if (phase === 'processing') return (
        <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', border:'3px solid var(--accent)', borderTopColor:'transparent', animation:'spin 0.9s linear infinite' }}/>
            <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--fg)' }}>Procesando pago…</div>
                <div style={{ fontSize:13, color:'var(--fg-mute)', marginTop:4 }}>Un momento, por favor</div>
            </div>
        </div>
    );

    // ── Success ───────────────────────────────────────────────────────────────
    if (phase === 'success') return (
        <div style={{ minHeight:'100dvh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, gap:20 }}>
            <div style={{ width:88, height:88, borderRadius:28, background:'linear-gradient(135deg,#f59e0b,#f97316)', display:'grid', placeItems:'center', boxShadow:'0 0 48px rgba(245,158,11,0.5)' }}>
                <Sparkles size={42} color="#fff"/>
            </div>
            <div style={{ textAlign:'center' }}>
                <div className="display" style={{ fontSize:28, color:'var(--fg)' }}>¡Bienvenido a Pro! 🎉</div>
                <p style={{ fontSize:14, color:'var(--fg-mute)', marginTop:10, lineHeight:1.7 }}>Tu suscripción anual está activa.<br/>Ya tienes acceso a todo Lyfter Pro.</p>
            </div>
            <div style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:10 }}>
                {BENEFITS.map(b => (
                    <div key={b.label} style={{ display:'flex', alignItems:'center', gap:12, background:'color-mix(in oklch,var(--energy) 8%,var(--card))', border:'1px solid color-mix(in oklch,var(--energy) 25%,var(--line))', borderRadius:14, padding:'12px 14px' }}>
                        <Check size={18} color="var(--energy)"/>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--fg)' }}>{b.label}</span>
                    </div>
                ))}
            </div>
            <p style={{ fontSize:12, color:'var(--fg-dim)' }}>Redirigiendo…</p>
        </div>
    );

    // ── Form ──────────────────────────────────────────────────────────────────
    return (
        <div style={{ background:'var(--bg)', minHeight:'100dvh', paddingBottom:100 }}>

            {/* Hero */}
            <div style={{ position:'relative', padding:'48px 24px 28px', textAlign:'center', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 0%,color-mix(in oklch,#f59e0b 22%,transparent),transparent 70%)', pointerEvents:'none' }}/>
                <div style={{ position:'relative' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius:999, padding:'5px 14px', marginBottom:16 }}>
                        <Sparkles size={13} color="#fff"/>
                        <span style={{ fontSize:11, fontWeight:800, color:'#fff', letterSpacing:'0.1em' }}>LYFTER PRO</span>
                    </div>
                    <div className="display" style={{ fontSize:32, color:'var(--fg)', lineHeight:1.1, marginBottom:10 }}>
                        Lleva tu entrenamiento<br/>al siguiente nivel
                    </div>
                    <p style={{ fontSize:14, color:'var(--fg-mute)', lineHeight:1.6 }}>
                        Todo lo que necesitas para alcanzar tu máximo potencial.
                    </p>
                </div>
            </div>

            {/* Benefits */}
            <div style={{ padding:'0 16px 20px' }}>
                <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:22, overflow:'hidden' }}>
                    {BENEFITS.map((b,i) => (
                        <div key={b.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 18px', borderBottom:i<BENEFITS.length-1?'1px solid var(--line)':'none' }}>
                            <div style={{ width:38, height:38, borderRadius:12, background:'#f59e0b1a', display:'grid', placeItems:'center', color:'#f59e0b', flexShrink:0, border:'1px solid #f59e0b33' }}>
                                {b.icon}
                            </div>
                            <div style={{ flex:1 }}>
                                <div style={{ fontSize:14, fontWeight:700, color:'var(--fg)' }}>{b.label}</div>
                                <div style={{ fontSize:12, color:'var(--fg-mute)', marginTop:1 }}>{b.desc}</div>
                            </div>
                            <Check size={15} color="#f59e0b"/>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div style={{ padding:'0 16px 24px' }}>
                <div style={{ background:'linear-gradient(135deg,color-mix(in oklch,#f59e0b 12%,var(--card)),var(--card) 60%)', border:'1px solid color-mix(in oklch,#f59e0b 35%,var(--line))', borderRadius:22, padding:'20px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                        <div style={{ fontSize:12, color:'var(--fg-mute)', marginBottom:4 }}>Plan anual</div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                            <span className="num" style={{ fontSize:42, fontWeight:900, color:'var(--fg)', lineHeight:1 }}>30€</span>
                            <span style={{ fontSize:14, color:'var(--fg-mute)' }}>/año</span>
                        </div>
                        <div style={{ fontSize:12, color:'#f59e0b', fontWeight:600, marginTop:4 }}>Solo 2,50€ al mes · Cancela cuando quieras</div>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius:12, padding:'8px 14px', textAlign:'center' }}>
                        <div style={{ fontSize:10, fontWeight:800, color:'#fff', letterSpacing:'0.06em' }}>MEJOR</div>
                        <div style={{ fontSize:10, fontWeight:800, color:'#fff', letterSpacing:'0.06em' }}>OFERTA</div>
                    </div>
                </div>
            </div>

            {/* Payment method selector */}
            <div style={{ padding:'0 16px 20px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--fg-mute)', letterSpacing:'0.08em', marginBottom:12 }}>MÉTODO DE PAGO</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {/* Card */}
                    <button onClick={() => setMethod('card')} style={{
                        padding:'14px 12px', borderRadius:16, cursor:'pointer', border:`1.5px solid ${method==='card'?'#f59e0b':'var(--line)'}`,
                        background: method==='card'?'color-mix(in oklch,#f59e0b 10%,var(--card))':'var(--card)',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    }}>
                        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                            <MastercardLogo size={30}/>
                            <span style={{ fontSize:18, fontWeight:900, color:'#1a1f71', fontStyle:'italic' }}>VISA</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color: method==='card'?'#f59e0b':'var(--fg-mute)', letterSpacing:'0.04em' }}>Tarjeta</span>
                    </button>

                    {/* PayPal */}
                    <button onClick={() => setMethod('paypal')} style={{
                        padding:'14px 12px', borderRadius:16, cursor:'pointer', border:`1.5px solid ${method==='paypal'?'#009cde':'var(--line)'}`,
                        background: method==='paypal'?'color-mix(in oklch,#009cde 8%,var(--card))':'var(--card)',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    }}>
                        <PayPalLogo height={22}/>
                        <span style={{ fontSize:11, fontWeight:700, color: method==='paypal'?'#009cde':'var(--fg-mute)', letterSpacing:'0.04em' }}>PayPal</span>
                    </button>

                    {/* Apple Pay */}
                    <button onClick={() => setMethod('apple')} style={{
                        padding:'14px 12px', borderRadius:16, cursor:'pointer', border:`1.5px solid ${method==='apple'?'var(--fg)':'var(--line)'}`,
                        background: method==='apple'?'color-mix(in oklch,var(--fg) 6%,var(--card))':'var(--card)',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    }}>
                        <ApplePayLogo height={38}/>
                        <span style={{ fontSize:11, fontWeight:700, color: method==='apple'?'var(--fg)':'var(--fg-mute)', letterSpacing:'0.04em' }}>Apple Pay</span>
                    </button>

                    {/* Google Pay */}
                    <button onClick={() => setMethod('google')} style={{
                        padding:'14px 12px', borderRadius:16, cursor:'pointer', border:`1.5px solid ${method==='google'?'#4285F4':'var(--line)'}`,
                        background: method==='google'?'color-mix(in oklch,#4285F4 8%,var(--card))':'var(--card)',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    }}>
                        <GooglePayLogo height={22}/>
                        <span style={{ fontSize:11, fontWeight:700, color: method==='google'?'#4285F4':'var(--fg-mute)', letterSpacing:'0.04em' }}>Google Pay</span>
                    </button>
                </div>
            </div>

            {/* ── Card form ─────────────────────────────────────────────────── */}
            {method === 'card' && (
                <div style={{ padding:'0 16px' }}>
                    {/* 3D Card */}
                    <div style={{ perspective:'1200px', marginBottom:24 }}>
                        <div style={{
                            position:'relative', width:'100%', maxWidth:380, margin:'0 auto',
                            aspectRatio:'1.586', transformStyle:'preserve-3d',
                            transition:'transform 0.65s ease',
                            transform: showBack ? 'rotateY(180deg)' : 'rotateY(0)',
                        }}>
                            {/* Front */}
                            <div style={{
                                position:'absolute', inset:0, borderRadius:20,
                                padding:'22px 24px', background:cardGradient(cardType),
                                boxShadow:'0 25px 60px rgba(0,0,0,0.55)',
                                backfaceVisibility:'hidden',
                                display:'flex', flexDirection:'column', justifyContent:'space-between',
                            }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                    {/* Chip */}
                                    <div style={{ width:42, height:32, borderRadius:6, background:'linear-gradient(135deg,#ffd700,#b8860b)', display:'grid', placeItems:'center', overflow:'hidden' }}>
                                        <div style={{ width:'100%', height:'50%', borderTop:'1px solid rgba(0,0,0,0.2)', borderBottom:'1px solid rgba(0,0,0,0.2)', background:'linear-gradient(90deg,transparent 30%,rgba(0,0,0,0.15) 50%,transparent 70%)' }}/>
                                    </div>
                                    {/* Network logo */}
                                    {cardType === 'mc' ? (
                                        <MastercardLogo size={44}/>
                                    ) : cardType === 'visa' ? (
                                        <span style={{ fontSize:20, fontWeight:900, color:'#fff', fontStyle:'italic', letterSpacing:'-0.02em', textShadow:'0 2px 4px rgba(0,0,0,0.3)' }}>VISA</span>
                                    ) : cardType === 'amex' ? (
                                        <span style={{ fontSize:13, fontWeight:900, color:'#fff', letterSpacing:'0.06em' }}>AMEX</span>
                                    ) : (
                                        <Sparkles size={22} color="rgba(255,255,255,0.7)"/>
                                    )}
                                </div>
                                <div>
                                    <div className="num" style={{ fontSize:19, letterSpacing:'0.2em', color:'#fff', fontWeight:500, marginBottom:18, textShadow:'0 2px 6px rgba(0,0,0,0.4)' }}>
                                        {displayNum}
                                    </div>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                                        <div>
                                            <div style={{ fontSize:8, color:'rgba(255,255,255,0.6)', letterSpacing:'0.08em', marginBottom:3 }}>TITULAR</div>
                                            <div style={{ fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase' }}>{displayName.slice(0,20)}</div>
                                        </div>
                                        <div style={{ textAlign:'right' }}>
                                            <div style={{ fontSize:8, color:'rgba(255,255,255,0.6)', letterSpacing:'0.08em', marginBottom:3 }}>EXPIRA</div>
                                            <div className="num" style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{displayExp}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back */}
                            <div style={{
                                position:'absolute', inset:0, borderRadius:20,
                                background:cardGradient(cardType),
                                boxShadow:'0 25px 60px rgba(0,0,0,0.55)',
                                backfaceVisibility:'hidden',
                                transform:'rotateY(180deg)', overflow:'hidden',
                                display:'flex', flexDirection:'column', justifyContent:'center',
                            }}>
                                <div style={{ height:48, background:'rgba(0,0,0,0.6)', marginBottom:20 }}/>
                                <div style={{ padding:'0 24px', display:'flex', alignItems:'center', gap:12 }}>
                                    <div style={{ flex:1, height:40, background:'rgba(255,255,255,0.85)', borderRadius:6 }}/>
                                    <div style={{ textAlign:'center', minWidth:52 }}>
                                        <div style={{ fontSize:8, color:'rgba(255,255,255,0.65)', marginBottom:4, letterSpacing:'0.06em' }}>CVV</div>
                                        <div className="num" style={{ fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'0.25em' }}>{cvv||'•••'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form fields */}
                    {[
                        { label:'NÚMERO DE TARJETA', value:displayNum, onChange:(v:string)=>setCardNum(v.replace(/\D/g,'').slice(0,16)), placeholder:'1234 5678 9012 3456', type:'tel' },
                        { label:'TITULAR', value:cardName, onChange:(v:string)=>setCardName(v.toUpperCase()), placeholder:'NOMBRE APELLIDO', type:'text' },
                    ].map(f => (
                        <div key={f.label} style={{ marginBottom:12 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-dim)', letterSpacing:'0.08em', marginBottom:6 }}>{f.label}</div>
                            <div style={{ background:'var(--card)', border:'1px solid var(--line-2)', borderRadius:14, padding:'0 16px', height:52, display:'flex', alignItems:'center' }}>
                                <input type={f.type} value={f.value} onChange={e=>f.onChange(e.target.value)} placeholder={f.placeholder}
                                    style={{ flex:1, background:'transparent', border:0, outline:'none', color:'var(--fg)', fontSize:15, fontFamily:'inherit' }}/>
                            </div>
                        </div>
                    ))}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                        <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-dim)', letterSpacing:'0.08em', marginBottom:6 }}>CADUCIDAD</div>
                            <div style={{ background:'var(--card)', border:'1px solid var(--line-2)', borderRadius:14, padding:'0 16px', height:52, display:'flex', alignItems:'center' }}>
                                <input type="tel" value={expiry} onChange={e=>setExpiry(formatExpiry(e.target.value))} placeholder="MM/AA"
                                    style={{ flex:1, background:'transparent', border:0, outline:'none', color:'var(--fg)', fontSize:15, fontFamily:'inherit' }}/>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize:10, fontWeight:700, color:'var(--fg-dim)', letterSpacing:'0.08em', marginBottom:6 }}>CVV</div>
                            <div style={{ background:'var(--card)', border:'1px solid var(--line-2)', borderRadius:14, padding:'0 16px', height:52, display:'flex', alignItems:'center', gap:8 }}>
                                <input type="tel" value={cvv} onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                                    onFocus={()=>setShowBack(true)} onBlur={()=>setShowBack(false)}
                                    placeholder="•••"
                                    style={{ flex:1, background:'transparent', border:0, outline:'none', color:'var(--fg)', fontSize:15, fontFamily:'inherit' }}/>
                                <Lock size={14} color="var(--fg-dim)"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PayPal panel ─────────────────────────────────────────────── */}
            {method === 'paypal' && (
                <div style={{ padding:'0 16px 24px' }}>
                    <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:20, padding:'28px 20px', textAlign:'center' }}>
                        <div style={{ marginBottom:14, display:'flex', justifyContent:'center' }}><PayPalLogo height={32}/></div>
                        <p style={{ fontSize:13, color:'var(--fg-mute)', lineHeight:1.7, margin:0 }}>
                            Serás redirigido a PayPal para completar el pago de <strong style={{color:'var(--fg)'}}>30€</strong> de forma segura. Tras confirmar, tu suscripción anual se activará al instante.
                        </p>
                        <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:18, flexWrap:'wrap' }}>
                            {['Visa','Mastercard','Amex','Discover'].map(c => (
                                <span key={c} style={{ fontSize:11, color:'var(--fg-dim)', background:'var(--card-2)', border:'1px solid var(--line)', borderRadius:6, padding:'3px 8px' }}>{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Apple Pay panel ──────────────────────────────────────────── */}
            {method === 'apple' && (
                <div style={{ padding:'0 16px 24px' }}>
                    <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:20, padding:'28px 20px', textAlign:'center' }}>
                        <div style={{ marginBottom:14, display:'flex', justifyContent:'center' }}><ApplePayLogo height={52}/></div>
                        <p style={{ fontSize:13, color:'var(--fg-mute)', lineHeight:1.7, margin:'0 0 16px' }}>
                            Usa <strong style={{color:'var(--fg)'}}>Face ID</strong> o <strong style={{color:'var(--fg)'}}>Touch ID</strong> para confirmar el pago de 30€/año de forma instantánea y segura.
                        </p>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'var(--fg-dim)', fontSize:12 }}>
                            <ShieldCheck size={14}/> Protegido por Apple Pay
                        </div>
                    </div>
                </div>
            )}

            {/* ── Google Pay panel ─────────────────────────────────────────── */}
            {method === 'google' && (
                <div style={{ padding:'0 16px 24px' }}>
                    <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:20, padding:'28px 20px', textAlign:'center' }}>
                        <div style={{ marginBottom:14, display:'flex', justifyContent:'center' }}><GooglePayLogo height={30}/></div>
                        <p style={{ fontSize:13, color:'var(--fg-mute)', lineHeight:1.7, margin:'0 0 16px' }}>
                            Paga con tu cuenta de <strong style={{color:'var(--fg)'}}>Google</strong> de forma rápida y segura. 30€ anuales con los datos que ya tienes guardados.
                        </p>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'var(--fg-dim)', fontSize:12 }}>
                            <ShieldCheck size={14}/> Protegido por Google Pay
                        </div>
                    </div>
                </div>
            )}

            {/* Pay button */}
            <div style={{ padding:'0 16px' }}>
                <button onClick={handlePay} style={{
                    width:'100%', padding:'18px', borderRadius:20, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#f59e0b,#f97316)',
                    color:'#fff', fontSize:16, fontWeight:800,
                    boxShadow:'0 8px 32px rgba(245,158,11,0.45)',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                }}>
                    <Sparkles size={20}/>
                    {method==='card'   ? 'Pagar 30€ · Activar Pro' :
                     method==='paypal' ? 'Continuar con PayPal →'  :
                     method==='apple'  ? 'Pagar con Apple Pay'      :
                                        'Pagar con Google Pay'}
                </button>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12, color:'var(--fg-dim)', fontSize:11 }}>
                    <Lock size={11}/> Pago seguro · Sin renovación automática · Cancela cuando quieras
                </div>
            </div>

            {/* Legal */}
            <p style={{ textAlign:'center', fontSize:10, color:'var(--fg-dim)', padding:'14px 24px 0', lineHeight:1.6 }}>
                Al continuar aceptas los <Link to="#" style={{ color:'var(--accent)', textDecoration:'none' }}>Términos de servicio</Link> y la <Link to="#" style={{ color:'var(--accent)', textDecoration:'none' }}>Política de privacidad</Link> de Lyfter.
            </p>
        </div>
    );
}
