// Progress + Personal data screens

function ProgressScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        <div style={{ position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:8, zIndex:5 }}>
          <button style={iconBtn6}><I.chevronLeft size={18}/></button>
          <div style={{ flex:1, textAlign:'center', fontSize:14, fontWeight:600 }}>Progress · Today</div>
          <button style={iconBtn6}><I.calendar size={16}/></button>
        </div>

        <div style={{ padding:'46px 20px 0' }}>
          <div className="eyebrow">FRIDAY · MAY 9</div>
          <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Daily progress</div>
        </div>

        {/* Big calorie ring */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="card" style={{ padding:22, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
            <BigRing pct={0.63} value="412" sub="kcal burned" target="of 650 daily target"/>
            <div style={{ display:'flex', gap:24, marginTop:18 }}>
              <Mini label="Avg HR" value="118" unit="bpm"/>
              <Mini label="Active" value="74" unit="min"/>
              <Mini label="Zone 2+" value="48" unit="min"/>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding:'14px 20px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <BigTile icon={<I.steps size={16}/>} value="8,247" sub="of 10,000" pct={0.82} color="var(--data)" label="Steps"/>
          <BigTile icon={<I.ruler size={16}/>} value="6.2" unit="km" sub="of 8 km" pct={0.78} color="var(--recovery)" label="Distance"/>
        </div>
        <div style={{ padding:'10px 20px 0' }}>
          <div className="card" style={{ padding:16, display:'flex', alignItems:'center', gap:14, borderColor:'color-mix(in oklch, var(--accent) 25%, var(--line))', background:'linear-gradient(135deg, color-mix(in oklch, var(--accent) 10%, var(--card)), var(--card) 70%)' }}>
            <div style={{ width:46, height:46, borderRadius:14, background:'color-mix(in oklch, var(--accent) 22%, transparent)', color:'var(--accent)', display:'grid', placeItems:'center' }}>
              <I.clock size={22}/>
            </div>
            <div style={{ flex:1 }}>
              <div className="eyebrow" style={{ color:'var(--accent)' }}>WORKOUT TIME</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:5, marginTop:2 }}>
                <span className="num display" style={{ fontSize:24 }}>1h 14m</span>
                <span className="num" style={{ fontSize:11, color:'var(--fg-mute)' }}>of 1h 30m</span>
              </div>
            </div>
            <span className="num" style={{ fontSize:14, fontWeight:700, color:'var(--accent)' }}>82%</span>
          </div>
        </div>

        {/* Weekly chart */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>This week</div>
          <div className="card" style={{ padding:16 }}>
            <BarChart/>
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>
      <BottomNav active="home"/>
    </div>
  );
}

const iconBtn6 = {
  width:36, height:36, borderRadius:11,
  background:'var(--card)', border:'1px solid var(--line)',
  color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
};

function BigRing({ pct, value, sub, target }) {
  const r = 86, sw = 14, c = 2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:200, height:200 }}>
      <svg width={200} height={200} style={{ transform:'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.20 36)"/>
            <stop offset="100%" stopColor="oklch(0.88 0.20 128)"/>
          </linearGradient>
        </defs>
        <circle cx={100} cy={100} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={sw} fill="none"/>
        <circle cx={100} cy={100} r={r} stroke="url(#ringg)" strokeWidth={sw} fill="none"
                strokeDasharray={`${c*pct} ${c}`} strokeLinecap="round"/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center',
      }}>
        <div className="num" style={{ fontSize:48, fontWeight:700, letterSpacing:'-0.04em' }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--fg-mute)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>{sub}</div>
        <div style={{ fontSize:10, color:'var(--fg-dim)', marginTop:4 }}>{target}</div>
      </div>
    </div>
  );
}

function Mini({ label, value, unit }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div className="num" style={{ fontSize:18, fontWeight:700 }}>{value}<span style={{ fontSize:11, color:'var(--fg-dim)' }}> {unit}</span></div>
      <div style={{ fontSize:10, color:'var(--fg-dim)', textTransform:'uppercase', letterSpacing:'0.04em', marginTop:1 }}>{label}</div>
    </div>
  );
}

function BigTile({ icon, value, unit, sub, pct, color, label }) {
  return (
    <div className="card" style={{ padding:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, color, marginBottom:10 }}>
        <span style={{ width:30, height:30, borderRadius:9, background:`color-mix(in oklch, ${color} 18%, transparent)`, display:'grid', placeItems:'center' }}>{icon}</span>
        <span className="eyebrow" style={{ color }}>{label}</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <span className="num" style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>{value}</span>
        {unit && <span className="num" style={{ fontSize:11, color:'var(--fg-dim)' }}>{unit}</span>}
      </div>
      <div style={{ marginTop:8 }}><Bar pct={pct} color={color} h={4}/></div>
      <div className="num" style={{ fontSize:10, color:'var(--fg-dim)', marginTop:4 }}>{sub}</div>
    </div>
  );
}

function BarChart() {
  const days = [
    { d:'M', v:0.5 },
    { d:'T', v:0.8 },
    { d:'W', v:0.3 },
    { d:'T', v:0.92 },
    { d:'F', v:0.63, today:true },
    { d:'S', v:0.0 },
    { d:'S', v:0.0 },
  ];
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, marginBottom:10 }}>
        {days.map((day,i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }}>
              <div style={{
                width:'100%', height:`${Math.max(day.v*100, 4)}%`,
                background: day.today ? 'var(--accent)' : day.v > 0 ? 'color-mix(in oklch, var(--accent) 35%, var(--card-2))' : 'var(--card-2)',
                borderRadius:'8px 8px 0 0',
              }}/>
            </div>
            <div style={{ fontSize:10, color: day.today ? 'var(--accent)' : 'var(--fg-dim)', fontWeight:600 }}>{day.d}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
        <span style={{ color:'var(--fg-mute)' }}>Avg <span className="num" style={{ color:'var(--fg)', fontWeight:600 }}>54 min</span> / day</span>
        <span style={{ color:'var(--accent)', fontWeight:600 }}>+12% vs last week</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Personal data
// ─────────────────────────────────────────────────────────────
function PersonalDataScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        <div style={{ position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:8, zIndex:5 }}>
          <button style={iconBtn6}><I.chevronLeft size={18}/></button>
          <div style={{ flex:1, textAlign:'center', fontSize:14, fontWeight:600 }}>Personal data</div>
          <div style={{ width:36 }}/>
        </div>

        <div style={{ padding:'46px 20px 0' }}>
          <div className="eyebrow">BODY METRICS</div>
          <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Your stats</div>
        </div>

        {/* Grid: BMI + weight */}
        <div style={{ padding:'18px 20px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div className="card" style={{ padding:14 }}>
            <div className="eyebrow">BMI</div>
            <div className="num display" style={{ fontSize:30, marginTop:6 }}>24.1</div>
            <span className="pill accent" style={{ marginTop:8, padding:'3px 8px', fontSize:10 }}>● HEALTHY</span>
          </div>
          <div className="card" style={{ padding:14 }}>
            <div className="eyebrow">WEIGHT</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4, marginTop:6 }}>
              <span className="num display" style={{ fontSize:30 }}>76.4</span>
              <span className="num" style={{ fontSize:13, color:'var(--fg-dim)' }}>kg</span>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, color:'var(--accent)', fontWeight:600, marginTop:6 }}>
              <I.arrowUp size={11} sw={2.5}/>−1.2 kg / 30d
            </div>
          </div>
        </div>

        {/* Weight chart */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Weight history · 12 weeks</div>
          <div className="card" style={{ padding:16 }}>
            <WeightChart/>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding:'22px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Update measurements</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Input label="Weight" value="76.4" unit="kg" icon={<I.scale size={16}/>}/>
            <Input label="Height" value="178" unit="cm" icon={<I.ruler size={16}/>}/>
          </div>
          <button style={{ ...btnPrimary, width:'100%', justifyContent:'center', marginTop:14, height:48 }}>Save changes <I.check size={14}/></button>
        </div>

        <div className="nav-spacer"/>
      </div>
    </div>
  );
}

function Input({ label, value, unit, icon }) {
  return (
    <div className="card" style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ width:32, height:32, borderRadius:10, background:'var(--card-2)', color:'var(--fg-mute)', display:'grid', placeItems:'center' }}>{icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10, color:'var(--fg-dim)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>{label}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:5, marginTop:2 }}>
          <span className="num" style={{ fontSize:18, fontWeight:600 }}>{value}</span>
          <span className="num" style={{ fontSize:12, color:'var(--fg-dim)' }}>{unit}</span>
        </div>
      </div>
      <I.edit size={16} stroke="var(--fg-dim)"/>
    </div>
  );
}

function WeightChart() {
  // sparkline-ish line
  const pts = [78.2, 78.0, 77.8, 77.9, 77.5, 77.2, 77.0, 76.9, 76.7, 76.6, 76.5, 76.4];
  const min = 76, max = 78.5;
  const w = 320, h = 100;
  const xs = (i) => (i/(pts.length-1)) * w;
  const ys = (v) => h - ((v - min)/(max - min)) * h;
  const path = pts.map((v,i) => `${i===0?'M':'L'}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(' ');
  const fillPath = `${path} L${w} ${h} L0 ${h} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.88 0.20 128)" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="oklch(0.88 0.20 128)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#wfill)"/>
        <path d={path} fill="none" stroke="oklch(0.88 0.20 128)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={xs(pts.length-1)} cy={ys(pts[pts.length-1])} r="4" fill="oklch(0.88 0.20 128)"/>
        <circle cx={xs(pts.length-1)} cy={ys(pts[pts.length-1])} r="9" fill="oklch(0.88 0.20 128)" opacity="0.18"/>
      </svg>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--fg-dim)', marginTop:6 }} className="num">
        <span>78.2 kg · 12 wk ago</span>
        <span style={{ color:'var(--accent)', fontWeight:600 }}>76.4 kg · today</span>
      </div>
    </div>
  );
}

Object.assign(window, { ProgressScreen, PersonalDataScreen });
