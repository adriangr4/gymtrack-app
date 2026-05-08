// Diet — overview list + detail (week selector + meals)

function DietScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        <div style={{ padding:'8px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:1 }}>NUTRITION</div>
          <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em' }}>Diet</div>
        </div>

        {/* Calorie target hero */}
        <div style={{ padding:'14px 20px 0' }}>
          <div className="card" style={{ padding:18, position:'relative', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <CalorieRing kcal={1840} target={2400}/>
              <div style={{ flex:1 }}>
                <div className="eyebrow">DAILY TARGET</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:5, marginTop:4 }}>
                  <span className="num display" style={{ fontSize:30 }}>1,840</span>
                  <span className="num" style={{ fontSize:13, color:'var(--fg-mute)' }}>/ 2,400 kcal</span>
                </div>
                <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:4 }}>
                  <span style={{ color:'var(--accent)', fontWeight:600 }}>560 kcal</span> remaining today
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:16 }}>
              <MacroBlock name="Protein" value={142} target={180} unit="g" color="var(--energy)"/>
              <MacroBlock name="Carbs"   value={210} target={280} unit="g" color="var(--data)"/>
              <MacroBlock name="Fats"    value={58}  target={75}  unit="g" color="var(--recovery)"/>
            </div>
          </div>
        </div>

        {/* My plans */}
        <div style={{ padding:'22px 20px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
            <div style={{ fontSize:15, fontWeight:600 }}>My plans</div>
            <button style={{ background:'transparent', border:0, color:'var(--accent)', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ New plan</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <DietPlanCard title="High-Protein Cut" kcal={2200} active
              meshA="oklch(0.78 0.20 128)" meshB="oklch(0.65 0.16 245)"/>
            <DietPlanCard title="Off-Season Bulk" kcal={3100}
              meshA="oklch(0.78 0.20 36)" meshB="oklch(0.72 0.18 340)"/>
          </div>
        </div>

        {/* Popular */}
        <div style={{ padding:'22px 20px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
            <div style={{ fontSize:15, fontWeight:600 }}>Popular templates</div>
            <button style={{ background:'transparent', border:0, color:'var(--fg-mute)', fontSize:12, fontWeight:500, cursor:'pointer' }}>See all →</button>
          </div>
          <div style={{ display:'flex', gap:10, overflowX:'auto', margin:'0 -20px', padding:'0 20px 4px' }}>
            <TemplateCard title="Keto"          kcal={1800} ratio="5/20/75" tone="oklch(0.72 0.18 340)"/>
            <TemplateCard title="Mediterranean" kcal={2100} ratio="20/50/30" tone="oklch(0.78 0.20 128)"/>
            <TemplateCard title="Hyper-Protein" kcal={2400} ratio="35/40/25" tone="oklch(0.78 0.20 36)"/>
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>
      <BottomNav active="diet"/>
    </div>
  );
}

function CalorieRing({ kcal, target }) {
  const pct = Math.min(kcal/target, 1);
  const r = 38, c = 2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:96, height:96 }}>
      <svg width={96} height={96} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={48} cy={48} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={7} fill="none"/>
        <circle cx={48} cy={48} r={r} stroke="var(--accent)" strokeWidth={7} fill="none"
                strokeDasharray={`${c*pct} ${c}`} strokeLinecap="round"/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center',
      }}>
        <div className="num" style={{ fontSize:20, fontWeight:700, color:'var(--accent)' }}>{Math.round(pct*100)}%</div>
        <div style={{ fontSize:9, color:'var(--fg-dim)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>today</div>
      </div>
    </div>
  );
}

function MacroBlock({ name, value, target, unit, color }) {
  const pct = Math.min(value/target, 1);
  return (
    <div style={{ background:'var(--card-2)', borderRadius:12, padding:'10px 12px' }}>
      <div style={{ fontSize:10, color, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:600 }}>{name}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:3, marginTop:4 }}>
        <span className="num" style={{ fontSize:16, fontWeight:700 }}>{value}</span>
        <span className="num" style={{ fontSize:10, color:'var(--fg-dim)' }}>/{target}{unit}</span>
      </div>
      <div style={{ marginTop:6 }}>
        <Bar pct={pct} color={color} h={3}/>
      </div>
    </div>
  );
}

function DietPlanCard({ title, kcal, active, meshA, meshB }) {
  return (
    <div className="card" style={{ overflow:'hidden', padding:0,
      borderColor: active ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)' }}>
      <div style={{ display:'flex', alignItems:'stretch' }}>
        <Photo tone="hero" mesh meshA={meshA} meshB={meshB} label=""
               style={{ width:120, flexShrink:0 }}/>
        <div style={{ flex:1, padding:'12px 14px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            {active && <span style={{
              display:'inline-block', fontSize:9, fontWeight:700, letterSpacing:'0.08em',
              background:'var(--accent)', color:'var(--accent-ink)',
              padding:'3px 7px', borderRadius:5, marginBottom:6,
            }}>● ACTIVE</span>}
            <div style={{ fontSize:14, fontWeight:600 }}>{title}</div>
            <div className="num" style={{ fontSize:11, color:'var(--fg-mute)', marginTop:2 }}>{kcal} kcal · 7 days</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
            <Stars value={4.7} size={11}/>
            <span className="num" style={{ fontSize:10, color:'var(--fg-dim)' }}>4.7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ title, kcal, ratio, tone }) {
  return (
    <div className="card" style={{ flexShrink:0, width:160, overflow:'hidden' }}>
      <Photo tone="hero" mesh meshA={tone} meshB={tone} label=""
             style={{ height:80 }}/>
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{title}</div>
        <div className="num" style={{ fontSize:11, color:'var(--fg-mute)', marginTop:2 }}>{kcal} kcal</div>
        <div style={{ fontSize:10, color:'var(--fg-dim)', marginTop:4 }}>P/C/F · {ratio}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Diet detail
// ─────────────────────────────────────────────────────────────
function DietDetailScreen() {
  return (
    <div className="gt">
      <div style={{ position:'absolute', top:60, left:0, right:0, padding:'0 16px', display:'flex', alignItems:'center', gap:8, zIndex:5 }}>
        <button style={iconBtn5}><I.chevronLeft size={18}/></button>
        <div style={{ flex:1, textAlign:'center' }}>
          <div className="eyebrow" style={{ marginBottom:1 }}>MEAL PLAN</div>
          <div style={{ fontSize:13, fontWeight:600 }}>High-Protein Cut</div>
        </div>
        <button style={iconBtn5}><I.edit size={16}/></button>
      </div>

      <div className="gt-scroll" style={{ paddingTop: 110 }}>
        {/* Week selector */}
        <div style={{ padding:'0 16px 0' }}>
          <div style={{ display:'flex', gap:6 }}>
            {['M','T','W','T','F','S','S'].map((d,i) => {
              const today = i === 4;
              return (
                <div key={i} style={{
                  flex:1, padding:'10px 0', borderRadius:14,
                  background: today ? 'color-mix(in oklch, var(--accent) 18%, transparent)' : 'var(--card)',
                  border:`1px solid ${today ? 'color-mix(in oklch, var(--accent) 35%, var(--line))' : 'var(--line)'}`,
                  textAlign:'center', position:'relative',
                }}>
                  <div style={{ fontSize:10, color: today ? 'var(--accent)' : 'var(--fg-dim)', fontWeight:600 }}>{d}</div>
                  <div className="num" style={{ fontSize:14, fontWeight:700, color: today ? 'var(--accent)' : 'var(--fg)', marginTop:2 }}>{i+5}</div>
                  {today && <div style={{ position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:'var(--accent)' }}/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calorie progress card */}
        <div style={{ padding:'14px 16px 0' }}>
          <div className="card" style={{ padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
              <div>
                <span className="eyebrow">FRIDAY · MAY 9</span>
                <div className="num display" style={{ fontSize:22, marginTop:2 }}>1,840 <span style={{ fontSize:13, color:'var(--fg-dim)', fontWeight:500 }}>/ 2,200 kcal</span></div>
              </div>
              <span className="num" style={{ fontSize:13, fontWeight:600, color:'var(--accent)' }}>83%</span>
            </div>
            <Bar pct={0.83} h={6}/>
          </div>
        </div>

        {/* Meals */}
        <Meal title="Breakfast" kcal={420} time="08:00" items={[
          { name:'Greek Yogurt 200g', brand:'Fage 5%', kcal:198 },
          { name:'Blueberries',       brand:'Fresh',   kcal:42  },
          { name:'Granola 40g',       brand:'Quaker',  kcal:180 },
        ]}/>
        <Meal title="Lunch" kcal={680} time="13:30" items={[
          { name:'Grilled Chicken 200g', brand:'',        kcal:330 },
          { name:'Brown Rice 120g',      brand:'',        kcal:148 },
          { name:'Mixed Vegetables',     brand:'',        kcal:80  },
          { name:'Olive Oil 1 tbsp',     brand:'EVOO',    kcal:120 },
        ]}/>
        <Meal title="Snack" kcal={240} time="17:00" items={[
          { name:'Whey Protein 30g', brand:'Optimum', kcal:120 },
          { name:'Banana',           brand:'',        kcal:120 },
        ]}/>
        <Meal title="Dinner" kcal={500} time="20:30" items={[
          { name:'Salmon 180g', brand:'', kcal:374 },
          { name:'Sweet Potato 150g', brand:'', kcal:128 },
        ]}/>

        <div className="nav-spacer"/>
      </div>
    </div>
  );
}

const iconBtn5 = {
  width:38, height:38, borderRadius:12,
  background:'var(--card)', border:'1px solid var(--line)',
  color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
};

function Meal({ title, kcal, time, items }) {
  return (
    <div style={{ padding:'18px 16px 0' }}>
      <div style={{ display:'flex', alignItems:'baseline', marginBottom:10, gap:8 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{title}</div>
        <span className="num" style={{ fontSize:11, color:'var(--fg-dim)' }}>{time}</span>
        <span className="num" style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:'var(--accent)' }}>{kcal} kcal</span>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        {items.map((it, i) => (
          <React.Fragment key={i}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px' }}>
              <Photo tone="warm" label="" style={{ width:36, height:36, borderRadius:10, flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{it.name}</div>
                {it.brand && <div style={{ fontSize:10, color:'var(--fg-dim)' }}>{it.brand}</div>}
              </div>
              <div className="num" style={{ fontSize:12, fontWeight:600, color:'var(--fg-mute)' }}>{it.kcal}</div>
              <button style={{ width:28, height:28, borderRadius:9, background:'color-mix(in oklch, var(--accent) 18%, transparent)', color:'var(--accent)', border:0, display:'grid', placeItems:'center', cursor:'pointer' }}>
                <I.plus size={14}/>
              </button>
            </div>
            {i < items.length-1 && <div style={{ height:1, background:'var(--line)', marginLeft:60 }}/>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DietScreen, DietDetailScreen });
