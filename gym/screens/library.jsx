// Library — list view + detail view

function LibraryScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        <div style={{ padding:'8px 20px 0', display:'flex', alignItems:'flex-end', gap:10 }}>
          <div style={{ flex:1 }}>
            <div className="eyebrow" style={{ marginBottom:1 }}>LIBRARY</div>
            <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Routines</div>
          </div>
          <button style={{ ...pillBtn3 }}><I.plus size={14}/> New</button>
        </div>

        {/* Search */}
        <div style={{ padding:'14px 20px 0' }}>
          <div style={{
            height:42, borderRadius:14,
            background:'var(--card)', border:'1px solid var(--line)',
            display:'flex', alignItems:'center', padding:'0 14px', gap:10,
            color:'var(--fg-dim)', fontSize:13,
          }}>
            <I.search size={16}/>
            <span>Search routines, exercises…</span>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding:'12px 20px 0', display:'flex', gap:6, overflowX:'auto' }}>
          {['All','Push/Pull','Strength','Hypertrophy','Glute','Mobility','Cardio'].map((c,i) => (
            <span key={c} className={i===0 ? 'pill accent' : 'pill'} style={{ flexShrink:0, padding:'6px 12px', fontSize:12 }}>{c}</span>
          ))}
        </div>

        {/* Grid */}
        <div style={{ padding:'18px 16px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <RoutineCard title="Hypertrophy Push/Pull" days={5} weeks={6} rating={4.8} active
                       meshA="oklch(0.78 0.20 128)" meshB="oklch(0.65 0.16 245)"/>
          <RoutineCard title="5/3/1 Strength" days={4} weeks={8} rating={4.6}
                       meshA="oklch(0.78 0.20 36)" meshB="oklch(0.72 0.18 340)"/>
          <RoutineCard title="Glute Builder" days={3} weeks={4} rating={4.9}
                       meshA="oklch(0.72 0.18 340)" meshB="oklch(0.78 0.20 128)"/>
          <RoutineCard title="Upper / Lower" days={4} weeks={12} rating={4.5}
                       meshA="oklch(0.65 0.16 245)" meshB="oklch(0.78 0.20 128)"/>
          <RoutineCard title="Athlete Conditioning" days={5} weeks={8} rating={4.7}
                       meshA="oklch(0.78 0.20 128)" meshB="oklch(0.78 0.20 36)"/>
          <RoutineCard title="Hybrid Cardio" days={6} weeks={4} rating={4.3}
                       meshA="oklch(0.65 0.16 245)" meshB="oklch(0.72 0.18 340)"/>
        </div>

        <div className="nav-spacer"/>
      </div>
      <BottomNav active="lib"/>
    </div>
  );
}

const pillBtn3 = {
  background:'var(--accent)', color:'var(--accent-ink)', border:0,
  padding:'8px 14px', borderRadius:12, fontSize:13, fontWeight:600,
  cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5,
};

function RoutineCard({ title, days, weeks, rating, active, meshA, meshB }) {
  return (
    <div className="card" style={{ overflow:'hidden', padding:0,
      borderColor: active ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)' }}>
      <Photo tone="hero" mesh meshA={meshA} meshB={meshB} label=""
             style={{ height:120, padding:10, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        {active && (
          <span style={{ alignSelf:'flex-start', position:'relative', zIndex:2,
            fontSize:9, fontWeight:700, letterSpacing:'0.08em',
            background:'var(--accent)', color:'var(--accent-ink)',
            padding:'3px 7px', borderRadius:5,
          }}>● ACTIVE</span>
        )}
        <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', color:'#fff' }}>
          <div className="num" style={{ fontSize:11, fontWeight:600 }}>{days}d · {weeks}w</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:600 }}>
            <I.star size={11}/>{rating}
          </div>
        </div>
      </Photo>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>{title}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Library detail
// ─────────────────────────────────────────────────────────────
function LibraryDetailScreen() {
  return (
    <div className="gt">
      {/* Top bar */}
      <div style={{ position:'absolute', top:60, left:0, right:0, padding:'0 16px', display:'flex', alignItems:'center', gap:8, zIndex:5 }}>
        <button style={iconBtn4}><I.chevronLeft size={18}/></button>
        <div style={{ flex:1 }}/>
        <button style={iconBtn4}><I.share size={16}/></button>
        <button style={iconBtn4}><I.edit size={16}/></button>
      </div>

      <div className="gt-scroll" style={{ paddingTop: 0 }}>
        {/* Hero */}
        <Photo tone="hero" mesh meshA="oklch(0.78 0.20 128)" meshB="oklch(0.65 0.16 245)" label="hypertrophy push/pull"
               style={{ height:280, padding:'120px 20px 18px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              <span className="pill" style={{ background:'rgba(0,0,0,0.45)', color:'#fff', borderColor:'transparent' }}>● ACTIVE</span>
              <span className="pill" style={{ background:'rgba(0,0,0,0.45)', color:'#fff', borderColor:'transparent' }}>5 days · 6 weeks</span>
            </div>
            <div className="display" style={{ fontSize:30, color:'#fff', lineHeight:1.05 }}>Hypertrophy<br/>Push / Pull</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10, color:'rgba(255,255,255,0.85)', fontSize:12 }}>
              <Stars value={4.8} size={12} color="#fff"/>
              <span className="num" style={{ fontWeight:600, color:'#fff' }}>4.8</span>
              <span>(214)</span>
            </div>
          </div>
        </Photo>

        {/* Progress card */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="card" style={{ padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
              <span className="eyebrow">Progress · week 4 of 6</span>
              <span className="num" style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>62%</span>
            </div>
            <Bar pct={0.62} h={6}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'var(--fg-mute)' }} className="num">
              <span>14 / 22 sessions</span>
              <span>2 days · 3 sessions left this week</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding:'18px 20px 0' }}>
          <p style={{ margin:0, fontSize:13, color:'var(--fg-mute)', lineHeight:1.5 }}>
            A 6-week hypertrophy block built around moderate-rep compound work. Two push days, two pull days, and one accessory session to drive volume in lagging areas.
          </p>
        </div>

        {/* Day picker */}
        <div style={{ padding:'18px 20px 0' }}>
          <div style={{ display:'flex', gap:6, overflowX:'auto', margin:'0 -20px', padding:'0 20px' }}>
            {[
              { d:'Mon', n:'Push A',  active:true  },
              { d:'Tue', n:'Pull A'                },
              { d:'Wed', n:'Rest'                  },
              { d:'Thu', n:'Push B'                },
              { d:'Fri', n:'Pull B'                },
              { d:'Sat', n:'Access.'               },
              { d:'Sun', n:'Rest'                  },
            ].map(d => (
              <div key={d.d} style={{
                flexShrink:0, padding:'10px 14px', borderRadius:14,
                background: d.active ? 'color-mix(in oklch, var(--accent) 18%, transparent)' : 'var(--card)',
                border:`1px solid ${d.active ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)'}`,
                textAlign:'center', minWidth:64,
              }}>
                <div style={{ fontSize:10, color: d.active ? 'var(--accent)' : 'var(--fg-dim)', fontWeight:600, letterSpacing:'0.04em' }}>{d.d.toUpperCase()}</div>
                <div style={{ fontSize:12, fontWeight:600, color: d.active ? 'var(--accent)' : 'var(--fg)', marginTop:3 }}>{d.n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercises list */}
        <div style={{ padding:'18px 20px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
            <div style={{ fontSize:14, fontWeight:600 }}>Push A · 7 exercises</div>
            <span className="num" style={{ fontSize:11, color:'var(--fg-mute)' }}>~62 min</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <ExerciseRow n={1} name="Incline Barbell Press" muscle="Chest"      sr="4 × 8–10"/>
            <ExerciseRow n={2} name="Flat DB Press"          muscle="Chest"      sr="3 × 10"/>
            <ExerciseRow n={3} name="Cable Fly"              muscle="Chest"      sr="3 × 12"/>
            <ExerciseRow n={4} name="Seated Overhead Press"  muscle="Shoulders"  sr="4 × 8"/>
            <ExerciseRow n={5} name="Lateral Raise"          muscle="Shoulders"  sr="4 × 12"/>
            <ExerciseRow n={6} name="Tricep Pushdown"        muscle="Triceps"    sr="3 × 12"/>
            <ExerciseRow n={7} name="Overhead Tricep Ext."   muscle="Triceps"    sr="3 × 12"/>
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>

      <div style={{ position:'absolute', left:14, right:14, bottom:18, zIndex:30 }}>
        <button style={{ ...btnPrimary, width:'100%', height:56, borderRadius:18, justifyContent:'center', fontSize:14 }}>
          Start workout <I.play size={14}/>
        </button>
      </div>
    </div>
  );
}

const iconBtn4 = {
  width:36, height:36, borderRadius:11,
  background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)',
  color:'#fff', display:'grid', placeItems:'center', cursor:'pointer',
  backdropFilter:'blur(8px)',
};

function ExerciseRow({ n, name, muscle, sr }) {
  return (
    <div className="card" style={{ padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
      <Photo tone="warm" label="" style={{ width:42, height:42, borderRadius:11, flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff', opacity:0.65, fontSize:10, fontWeight:700 }} className="num">{String(n).padStart(2,'0')}</div>
      </Photo>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{name}</div>
        <div style={{ fontSize:11, color:'var(--fg-dim)' }}>{muscle}</div>
      </div>
      <div className="num" style={{ fontSize:12, color:'var(--fg-mute)', fontWeight:500 }}>{sr}</div>
    </div>
  );
}

Object.assign(window, { LibraryScreen, LibraryDetailScreen });
