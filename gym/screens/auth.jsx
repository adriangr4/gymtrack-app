// Auth screens — Login + Register

function LoginScreen() {
  return (
    <div className="gt" style={{ background:'var(--bg)' }}>
      {/* Decorative mesh background */}
      <div style={{
        position:'absolute', inset:0,
        background:`
          radial-gradient(70% 50% at 80% 0%, color-mix(in oklch, var(--accent) 28%, transparent), transparent 60%),
          radial-gradient(60% 40% at 0% 100%, color-mix(in oklch, var(--energy) 25%, transparent), transparent 60%),
          radial-gradient(50% 30% at 100% 100%, color-mix(in oklch, var(--data) 25%, transparent), transparent 60%)
        `,
        pointerEvents:'none',
      }}/>
      {/* Decorative grid lines */}
      <svg style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none' }} width="100%" height="100%">
        {[...Array(20)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*40} x2="100%" y2={i*40} stroke="white"/>)}
        {[...Array(12)].map((_,i) => <line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="100%" stroke="white"/>)}
      </svg>

      <div className="gt-scroll" style={{ position:'relative' }}>
        <div style={{ padding:'36px 28px 0' }}>
          <div style={{
            width:48, height:48, borderRadius:14,
            background:'var(--accent)', color:'var(--accent-ink)',
            display:'grid', placeItems:'center', marginBottom:36,
            boxShadow:'0 0 30px color-mix(in oklch, var(--accent) 35%, transparent)',
          }}>
            <I.bolt size={24}/>
          </div>
          <div className="display" style={{ fontSize:36, lineHeight:1.0, marginBottom:8 }}>Welcome<br/>back.</div>
          <div style={{ fontSize:13, color:'var(--fg-mute)' }}>Sign in to keep your <span style={{ color:'var(--accent)', fontWeight:600 }}>12-day streak</span> alive.</div>
        </div>

        <div style={{ padding:'40px 28px 0', display:'flex', flexDirection:'column', gap:12 }}>
          <FormField label="Email" placeholder="you@example.com" value="marcos@example.com"/>
          <FormField label="Password" placeholder="••••••••" value="••••••••" type="password" trailing={<span style={{ color:'var(--fg-mute)', fontSize:11, fontWeight:500 }}>Show</span>}/>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-2 }}>
            <button style={{ background:'transparent', border:0, color:'var(--fg-mute)', fontSize:11, fontWeight:500, cursor:'pointer' }}>Forgot password?</button>
          </div>
        </div>

        <div style={{ padding:'24px 28px 0' }}>
          <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', height:54, fontSize:14, borderRadius:16 }}>
            Sign in <I.arrowRight size={14}/>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0', color:'var(--fg-dim)', fontSize:11 }}>
            <div style={{ flex:1, height:1, background:'var(--line)' }}/>
            <span>OR</span>
            <div style={{ flex:1, height:1, background:'var(--line)' }}/>
          </div>
          <button style={{
            width:'100%', height:48, borderRadius:14,
            background:'var(--card)', border:'1px solid var(--line)',
            color:'var(--fg)', fontSize:13, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>Continue with Apple</button>
        </div>

        <div style={{ padding:'40px 28px 32px', textAlign:'center', fontSize:12, color:'var(--fg-mute)' }}>
          New here? <span style={{ color:'var(--accent)', fontWeight:600 }}>Create an account →</span>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, placeholder, type, trailing }) {
  return (
    <div>
      <div style={{ fontSize:10, color:'var(--fg-dim)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600, marginBottom:6 }}>{label}</div>
      <div style={{
        height:48, borderRadius:14,
        background:'var(--card)', border:'1px solid var(--line)',
        display:'flex', alignItems:'center', padding:'0 14px', gap:10,
      }}>
        <input
          type={type === 'password' ? 'password' : 'text'}
          defaultValue={value} placeholder={placeholder}
          style={{
            flex:1, background:'transparent', border:0, outline:'none',
            color:'var(--fg)', fontSize:13, fontFamily:'inherit',
          }}
        />
        {trailing}
      </div>
    </div>
  );
}

function RegisterScreen() {
  return (
    <div className="gt" style={{ background:'var(--bg)' }}>
      <div style={{
        position:'absolute', inset:0,
        background:`
          radial-gradient(70% 50% at 20% 0%, color-mix(in oklch, var(--accent) 28%, transparent), transparent 60%),
          radial-gradient(50% 40% at 100% 100%, color-mix(in oklch, var(--recovery) 25%, transparent), transparent 60%)
        `,
        pointerEvents:'none',
      }}/>

      <div className="gt-scroll" style={{ position:'relative' }}>
        <div style={{ padding:'24px 28px 0' }}>
          <button style={{ ...iconBtn7, marginBottom:24 }}><I.chevronLeft size={18}/></button>
          <div className="display" style={{ fontSize:32, lineHeight:1.0, marginBottom:8 }}>Start your<br/>streak.</div>
          <div style={{ fontSize:13, color:'var(--fg-mute)' }}>Free forever. Earn XP, level up your training.</div>
        </div>

        <div style={{ padding:'32px 28px 0', display:'flex', flexDirection:'column', gap:12 }}>
          <FormField label="Username" placeholder="@marcosa" value=""/>
          <FormField label="Email" placeholder="you@example.com" value=""/>
          <FormField label="Password" placeholder="At least 8 characters" value="" type="password"/>
        </div>

        <div style={{ padding:'14px 28px 0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--fg-mute)' }}>
            <div style={{ width:18, height:18, borderRadius:5, background:'var(--accent)', display:'grid', placeItems:'center', color:'var(--accent-ink)' }}>
              <I.check size={12} sw={3}/>
            </div>
            I agree to the Terms & Privacy
          </div>
        </div>

        <div style={{ padding:'24px 28px 0' }}>
          <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', height:54, fontSize:14, borderRadius:16 }}>
            Create account <I.arrowRight size={14}/>
          </button>
        </div>

        <div style={{ padding:'24px 28px 32px', textAlign:'center', fontSize:12, color:'var(--fg-mute)' }}>
          Have an account? <span style={{ color:'var(--accent)', fontWeight:600 }}>Sign in →</span>
        </div>
      </div>
    </div>
  );
}

const iconBtn7 = {
  width:38, height:38, borderRadius:12,
  background:'var(--card)', border:'1px solid var(--line)',
  color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
};

// ─────────────────────────────────────────────────────────────
// Level-up overlay (used over Workout Completed)
// ─────────────────────────────────────────────────────────────
function LevelUpOverlay() {
  return (
    <div style={{
      position:'absolute', inset:0,
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:32, zIndex:50,
    }}>
      <div style={{
        width:'100%', maxWidth:320, padding:'32px 24px',
        background:'linear-gradient(180deg, color-mix(in oklch, var(--accent) 22%, var(--card)) 0%, var(--card) 100%)',
        borderRadius:28, border:'1px solid color-mix(in oklch, var(--accent) 40%, var(--line))',
        boxShadow:'0 0 80px color-mix(in oklch, var(--accent) 25%, transparent)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {/* Burst */}
        <svg style={{ position:'absolute', inset:0, opacity:0.18 }} viewBox="0 0 320 320">
          {[...Array(24)].map((_,i) => {
            const a = (i/24) * Math.PI * 2;
            return <line key={i} x1="160" y1="160"
                         x2={160 + Math.cos(a)*200} y2={160 + Math.sin(a)*200}
                         stroke="oklch(0.88 0.20 128)" strokeWidth="1.5"/>;
          })}
        </svg>
        <div style={{ position:'relative' }}>
          <div className="eyebrow" style={{ color:'var(--accent)' }}>LEVEL UP</div>
          <div className="display" style={{ fontSize:60, lineHeight:1, color:'var(--accent)', margin:'8px 0', fontFamily:'var(--font-mono)' }}>18</div>
          <div style={{ fontSize:13, color:'var(--fg-mute)' }}>Welcome to <span style={{ color:'var(--accent)', fontWeight:700 }}>Silver III</span></div>

          <div style={{ margin:'24px 0 8px', fontSize:11, color:'var(--fg-dim)' }}>YOU EARNED</div>
          <div className="num display" style={{ fontSize:28, color:'var(--accent)' }}>+72 XP</div>

          <div style={{ marginTop:18 }}>
            <Bar pct={0.32} h={6}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--fg-dim)' }} className="num">
              <span>720 / 2,400</span>
              <span>1,680 to Silver IV</span>
            </div>
          </div>

          <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', marginTop:24, height:48, borderRadius:14 }}>
            Continue <I.arrowRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen, LevelUpOverlay });
