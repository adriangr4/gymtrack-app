// Workout session — selection → warmup → active → completed (with level up overlay)

function WorkoutActiveScreen() {
  return (
    <div className="gt">
      {/* Top bar */}
      <div style={{ position:'absolute', top:60, left:0, right:0, padding:'0 16px', display:'flex', alignItems:'center', gap:8, zIndex:5 }}>
        <button style={iconBtn}><I.chevronLeft size={18}/></button>
        <div style={{ flex:1, textAlign:'center' }}>
          <div className="eyebrow" style={{ marginBottom:1 }}>HYPERTROPHY · PUSH</div>
          <div style={{ fontSize:13, fontWeight:600 }}>Exercise <span className="num">3</span> / <span className="num">7</span></div>
        </div>
        <button style={iconBtn}><I.x size={18}/></button>
      </div>

      <div className="gt-scroll" style={{ paddingTop: 110 }}>
        {/* Hero — exercise media + timer */}
        <div style={{ padding:'0 16px' }}>
          <Photo tone="hero" mesh meshA="oklch(0.78 0.20 128)" meshB="oklch(0.65 0.16 245)" label="incline bench press"
                 style={{ height:220, borderRadius:24, padding:14, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:2 }}>
              <span className="pill accent">CHEST · UPPER</span>
              <button style={{ ...iconBtn, background:'rgba(0,0,0,0.45)', borderColor:'transparent', color:'#fff' }}><I.more size={16}/></button>
            </div>
            <div style={{ position:'relative', zIndex:2 }}>
              <div style={{ color:'#fff', fontSize:22, fontWeight:700, lineHeight:1.05, letterSpacing:'-0.02em' }}>
                Incline<br/>Barbell Press
              </div>
              <div style={{ display:'flex', gap:14, marginTop:8, color:'rgba(255,255,255,0.85)', fontSize:11 }}>
                <span>4 × 8–10 reps</span>
                <span>·</span>
                <span>Rest 90s</span>
              </div>
            </div>
          </Photo>
        </div>

        {/* Live metrics row */}
        <div style={{ padding:'14px 16px 0', display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', gap:8 }}>
          <Metric label="Time" value="42:18" mono accent/>
          <Metric label="Calories" value="318" mono icon={<I.flame size={12}/>}/>
          <Metric label="Sets left" value="11" mono icon={<I.target size={12}/>}/>
        </div>

        {/* Set tracker */}
        <div style={{ padding:'18px 16px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>Sets</div>
            <div style={{ fontSize:11, color:'var(--fg-mute)' }}><span className="num" style={{ color:'var(--accent)' }}>2</span> of <span className="num">4</span> done</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <SetRow n={1} weight={60} reps={10} done/>
            <SetRow n={2} weight={70} reps={10} done/>
            <SetRow n={3} weight={75} reps={9} active/>
            <SetRow n={4} weight={75} reps={8}/>
          </div>
          <button style={{
            marginTop:10, width:'100%',
            border:'1px dashed var(--line-2)', background:'transparent',
            color:'var(--fg-mute)', borderRadius:14, padding:'10px',
            fontSize:12, fontWeight:500, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}><I.plus size={14}/> Add drop set</button>
        </div>

        {/* Rest timer card */}
        <div style={{ padding:'14px 16px 0' }}>
          <div className="card" style={{ padding:14, display:'flex', alignItems:'center', gap:12, borderColor:'color-mix(in oklch, var(--accent) 25%, var(--line))' }}>
            <div style={{ width:46, height:46, borderRadius:14, background:'color-mix(in oklch, var(--accent) 18%, transparent)', display:'grid', placeItems:'center', color:'var(--accent)' }}>
              <I.clock size={22}/>
            </div>
            <div style={{ flex:1 }}>
              <div className="eyebrow" style={{ color:'var(--accent)' }}>REST</div>
              <div className="num" style={{ fontSize:22, fontWeight:700, lineHeight:1.1 }}>00:47</div>
            </div>
            <button style={{ ...btnPrimary, padding:'8px 14px' }}>Skip <I.arrowRight size={12}/></button>
          </div>
        </div>

        {/* Up next */}
        <div style={{ padding:'18px 16px 0' }}>
          <div className="eyebrow" style={{ marginBottom:8 }}>Up next</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <UpNext idx={4} name="Cable Fly" muscle="Chest" sr="3 × 12"/>
            <UpNext idx={5} name="Overhead Press" muscle="Shoulders" sr="4 × 8"/>
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>

      {/* Sticky CTA */}
      <div style={stickyCta}>
        <button style={{ ...iconBtn, width:54, height:54, borderRadius:18 }}><I.pause size={18}/></button>
        <button style={{ ...btnPrimary, flex:1, height:54, borderRadius:18, justifyContent:'center', fontSize:14 }}>
          Complete set <I.check size={16}/>
        </button>
      </div>
    </div>
  );
}

const iconBtn = {
  width:40, height:40, borderRadius:14,
  background:'var(--card)', border:'1px solid var(--line)',
  color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
};

const stickyCta = {
  position:'absolute', left:14, right:14, bottom:18, zIndex:30,
  display:'flex', gap:8,
};

function Metric({ label, value, accent, icon }) {
  return (
    <div className="card" style={{
      padding:'10px 12px',
      borderColor: accent ? 'color-mix(in oklch, var(--accent) 40%, var(--line))' : 'var(--line)',
      background: accent ? 'color-mix(in oklch, var(--accent) 10%, var(--card))' : 'var(--card)',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, color: accent ? 'var(--accent)' : 'var(--fg-mute)', fontSize:10, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:600 }}>
        {icon}{label}
      </div>
      <div className="num" style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', marginTop:2 }}>{value}</div>
    </div>
  );
}

function SetRow({ n, weight, reps, done, active }) {
  const accent = done ? 'var(--accent)' : active ? 'var(--energy)' : 'var(--fg-dim)';
  return (
    <div className="card" style={{
      padding:'10px 12px', display:'flex', alignItems:'center', gap:10,
      background: active ? 'color-mix(in oklch, var(--energy) 10%, var(--card))' : 'var(--card)',
      borderColor: active ? 'color-mix(in oklch, var(--energy) 35%, var(--line))' : 'var(--line)',
      opacity: !done && !active ? 0.65 : 1,
    }}>
      <div style={{ width:28, height:28, borderRadius:9, background:`color-mix(in oklch, ${accent} 18%, transparent)`, color:accent, display:'grid', placeItems:'center', fontSize:11, fontWeight:700 }} className="num">
        {done ? <I.check size={14} sw={2.5}/> : n}
      </div>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <Field label="Weight" value={`${weight} kg`} muted={!done && !active}/>
        <Field label="Reps"   value={reps}            muted={!done && !active}/>
      </div>
      {active ? (
        <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--energy)' }}/>
      ) : done ? (
        <span className="eyebrow" style={{ color:'var(--accent)' }}>DONE</span>
      ) : null}
    </div>
  );
}

function Field({ label, value, muted }) {
  return (
    <div>
      <div style={{ fontSize:9, color:'var(--fg-dim)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</div>
      <div className="num" style={{ fontSize:14, fontWeight:600, color: muted ? 'var(--fg-mute)' : 'var(--fg)', marginTop:1 }}>{value}</div>
    </div>
  );
}

function UpNext({ idx, name, muscle, sr }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:38, height:38, borderRadius:11, background:'var(--card)', border:'1px solid var(--line)', display:'grid', placeItems:'center', color:'var(--fg-mute)', fontSize:11, fontWeight:600 }} className="num">
        {String(idx).padStart(2,'0')}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{name}</div>
        <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{muscle} · {sr}</div>
      </div>
      <I.chevronRight size={14} stroke="var(--fg-dim)"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Workout completed — with level-up overlay
// ─────────────────────────────────────────────────────────────
function WorkoutCompletedScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll" style={{ paddingTop: 80 }}>
        {/* Hero badge */}
        <div style={{ padding:'0 20px', textAlign:'center' }}>
          <div style={{
            margin:'0 auto 18px', width:88, height:88, borderRadius:'50%',
            background:'radial-gradient(circle at 30% 30%, color-mix(in oklch, var(--accent) 80%, transparent), color-mix(in oklch, var(--accent) 25%, transparent))',
            display:'grid', placeItems:'center', color:'var(--accent-ink)',
            boxShadow:'0 0 60px color-mix(in oklch, var(--accent) 40%, transparent)',
          }}>
            <I.trophy size={42} sw={2}/>
          </div>
          <div className="eyebrow" style={{ color:'var(--accent)' }}>SESSION COMPLETE</div>
          <div className="display" style={{ fontSize:30, lineHeight:1.05, margin:'4px 0 6px' }}>Hypertrophy<br/>Push · Day 3</div>
          <div style={{ fontSize:13, color:'var(--fg-mute)' }}>Friday, May 8 · 8:42 AM</div>
        </div>

        {/* Stats grid */}
        <div style={{ padding:'22px 16px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <BigStat label="DURATION" value="01:08:24" sub="+12% vs avg"/>
          <BigStat label="CALORIES" value="486" unit="kcal" sub="rest 7m total" tone="warm"/>
          <BigStat label="VOLUME" value="8,420" unit="kg" sub="new PR 🔥"/>
          <BigStat label="SETS" value="28" sub="all completed"/>
        </div>

        {/* XP earned card */}
        <div style={{ padding:'18px 16px 0' }}>
          <div className="card" style={{
            padding:16, position:'relative', overflow:'hidden',
            background:'linear-gradient(135deg, color-mix(in oklch, var(--accent) 22%, var(--card)), var(--card) 70%)',
            borderColor:'color-mix(in oklch, var(--accent) 35%, var(--line))',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'color-mix(in oklch, var(--accent) 25%, transparent)', display:'grid', placeItems:'center', color:'var(--accent)' }}>
                <I.bolt size={22}/>
              </div>
              <div style={{ flex:1 }}>
                <div className="eyebrow" style={{ color:'var(--accent)' }}>XP EARNED</div>
                <div className="num display" style={{ fontSize:28, color:'var(--accent)' }}>+72</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'var(--fg-mute)' }}>Lvl 17 → 18</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>SILVER III</div>
              </div>
            </div>
            <Bar pct={0.78} color="var(--accent)" h={6}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--fg-dim)' }} className="num">
              <span>1,820 / 2,400 XP</span>
              <span>580 to next rank</span>
            </div>
          </div>
        </div>

        {/* Rate session */}
        <div style={{ padding:'22px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Rate this session</div>
          <div className="card" style={{ padding:'14px', display:'flex', justifyContent:'center', gap:10 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} style={{
                width:40, height:40, borderRadius:12, border:'1px solid var(--line)',
                background: s <= 4 ? 'color-mix(in oklch, var(--accent) 18%, transparent)' : 'var(--card-2)',
                color: s <= 4 ? 'var(--accent)' : 'var(--fg-dim)',
                display:'grid', placeItems:'center', cursor:'pointer',
              }}><I.star size={18}/></button>
            ))}
          </div>
        </div>

        <div style={{ padding:'14px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Difficulty</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {['Easy','Moderate','Hard'].map((d,i) => (
              <button key={d} style={{
                padding:'12px 8px', borderRadius:14,
                background: i===1 ? 'color-mix(in oklch, var(--energy) 18%, transparent)' : 'var(--card)',
                border:`1px solid ${i===1 ? 'color-mix(in oklch, var(--energy) 35%, var(--line))' : 'var(--line)'}`,
                color: i===1 ? 'var(--energy)' : 'var(--fg-mute)',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}>{d}</button>
            ))}
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>

      <div style={stickyCta}>
        <button style={{ ...iconBtn, width:54, height:54, borderRadius:18 }}><I.share size={18}/></button>
        <button style={{ ...btnPrimary, flex:1, height:54, borderRadius:18, justifyContent:'center', fontSize:14 }}>
          Save session <I.check size={16}/>
        </button>
      </div>
    </div>
  );
}

function BigStat({ label, value, unit, sub, tone }) {
  return (
    <div className="card" style={{ padding:14 }}>
      <div className="eyebrow" style={{ color: tone === 'warm' ? 'var(--energy)' : 'var(--fg-dim)' }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4, marginTop:4 }}>
        <span className="num" style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>{value}</span>
        {unit && <span className="num" style={{ fontSize:11, color:'var(--fg-dim)' }}>{unit}</span>}
      </div>
      <div style={{ fontSize:10, color:'var(--fg-dim)', marginTop:4 }}>{sub}</div>
    </div>
  );
}

Object.assign(window, { WorkoutActiveScreen, WorkoutCompletedScreen });
