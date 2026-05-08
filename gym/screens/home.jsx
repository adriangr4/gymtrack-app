// Home screen — landing tab

function HomeScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        <TopHeader name="Marcos" level={17} xpPct={0.62} hour={9} unread={3}/>

        {/* Streak / XP hero */}
        <div style={{ padding:'14px 20px 0' }}>
          <div className="card" style={{
            padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
            background:'linear-gradient(135deg, color-mix(in oklch, var(--accent) 18%, var(--card)), var(--card) 70%)',
            borderColor: 'color-mix(in oklch, var(--accent) 25%, var(--line))',
          }}>
            <div style={{ width:38, height:38, borderRadius:12, background:'color-mix(in oklch, var(--energy) 22%, transparent)', display:'grid', placeItems:'center', color:'var(--energy)' }}>
              <I.flame size={20}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>12-day streak <span style={{ color:'var(--fg-mute)', fontWeight:400 }}>· keep it alive</span></div>
              <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:2 }}>Train today to reach <span className="num" style={{ color:'var(--accent)' }}>+45 XP</span> and rank up to Gold II.</div>
            </div>
            <I.chevronRight size={16} stroke="var(--fg-dim)"/>
          </div>
        </div>

        {/* Stats — steps + calories with progress arcs */}
        <div style={{ padding:'14px 20px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <StatTile icon={<I.steps size={16}/>} label="Steps" value="8,247" target="10,000" pct={0.82} color="var(--data)"/>
          <StatTile icon={<I.flame size={16}/>} label="Calories" value="412" target="650 kcal" pct={0.63} color="var(--energy)"/>
        </div>

        {/* Daily mission — featured workout */}
        <div style={{ padding:'18px 20px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
            <div className="eyebrow">Today's mission</div>
            <span className="num" style={{ fontSize:11, color:'var(--fg-mute)' }}>+45 XP</span>
          </div>
          <div className="card" style={{ overflow:'hidden', borderColor:'var(--line-2)' }}>
            <Photo tone="hero" mesh meshA="oklch(0.75 0.18 245)" meshB="oklch(0.78 0.20 128)" label="hero · push day"
                   style={{ height:180, padding:14, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:6, position:'relative', zIndex:2 }}>
                <span className="pill accent">PUSH</span>
                <span className="pill">CHEST · TRICEPS</span>
              </div>
              <div style={{ position:'relative', zIndex:2, color:'#fff' }}>
                <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>Hypertrophy<br/>Push · Day 3</div>
                <div style={{ display:'flex', gap:14, marginTop:8, fontSize:12, opacity:0.85 }}>
                  <span><span className="num" style={{ fontWeight:600 }}>62</span> min</span>
                  <span>·</span>
                  <span><span className="num" style={{ fontWeight:600 }}>7</span> exercises</span>
                  <span>·</span>
                  <span style={{ color:'var(--accent)' }}>● HIGH</span>
                </div>
              </div>
            </Photo>
            <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:'var(--fg-mute)' }}>Last attempt</div>
                <div className="num" style={{ fontSize:13, fontWeight:600, color:'var(--fg)' }}>2 days ago · 4★</div>
              </div>
              <button style={btnPrimary}>Start <I.play size={12}/></button>
            </div>
          </div>
        </div>

        {/* My routines */}
        <Section title="My routines" action="See all">
          {[
            { name:'Hypertrophy Push/Pull', days:'5 days · 6 weeks', tags:['Push','Pull','Legs','Upper','Lower'], pct:0.55 },
            { name:'5/3/1 Strength Block',  days:'4 days · 8 weeks', tags:['Bench','Squat','Deadlift','OHP'],   pct:0.20 },
            { name:'Glute Builder',        days:'3 days · 4 weeks', tags:['Hip','Glute','Hamstring'],          pct:0.85 },
          ].map(r => <RoutineRow key={r.name} {...r}/>)}
        </Section>

        {/* Nutrition — horizontal scroll macro cards */}
        <Section title="Nutrition · today" action="Log meal">
          <div style={{ display:'flex', gap:10, overflowX:'auto', margin:'0 -20px', padding:'0 20px 4px', scrollSnapType:'x mandatory' }}>
            <MacroCard name="Protein"  emoji="P" value={142} target={180} unit="g" color="var(--energy)"/>
            <MacroCard name="Carbs"    emoji="C" value={210} target={280} unit="g" color="var(--data)"/>
            <MacroCard name="Fats"     emoji="F" value={58}  target={75}  unit="g" color="var(--recovery)"/>
            <MacroCard name="Calories" emoji="K" value={1840} target={2400} unit="kcal" color="var(--accent)" wide/>
          </div>
        </Section>

        <div className="nav-spacer"/>
      </div>
      <BottomNav active="home"/>
    </div>
  );
}

const btnPrimary = {
  background:'var(--accent)', color:'var(--accent-ink)',
  border:0, borderRadius:14, padding:'10px 16px',
  fontWeight:700, fontSize:13, letterSpacing:'-0.01em',
  display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer',
};

function Section({ title, action, children }) {
  return (
    <div style={{ padding:'22px 20px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
        <div style={{ fontSize:15, fontWeight:600 }}>{title}</div>
        {action && <button style={{ background:'transparent', border:0, color:'var(--fg-mute)', fontSize:12, fontWeight:500, cursor:'pointer' }}>{action} →</button>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{children}</div>
    </div>
  );
}

function StatTile({ icon, label, value, target, pct, color }) {
  return (
    <div className="card" style={{ padding:14, display:'flex', flexDirection:'column', gap:10, position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--fg-mute)' }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize:11, fontWeight:500, letterSpacing:'0.02em', textTransform:'uppercase' }}>{label}</span>
      </div>
      <div className="num" style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.03em', color:'var(--fg)' }}>{value}</div>
      <Bar pct={pct} color={color} h={4}/>
      <div className="num" style={{ fontSize:10, color:'var(--fg-dim)' }}>of {target}</div>
    </div>
  );
}

function RoutineRow({ name, days, tags, pct }) {
  return (
    <div className="card" style={{ padding:12, display:'flex', alignItems:'center', gap:12 }}>
      <Photo tone="warm" label="" style={{ width:54, height:54, borderRadius:14, flexShrink:0 }}>
        <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#fff', opacity:0.7 }}>
          <I.dumbbell size={22}/>
        </div>
      </Photo>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, lineHeight:1.2 }}>{name}</div>
        <div style={{ fontSize:11, color:'var(--fg-dim)', margin:'2px 0 6px' }}>{days}</div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {tags.slice(0,3).map(t => <span key={t} className="pill" style={{ padding:'2px 7px', fontSize:10 }}>{t}</span>)}
          {tags.length > 3 && <span className="pill" style={{ padding:'2px 7px', fontSize:10 }}>+{tags.length-3}</span>}
        </div>
      </div>
      <div style={{ width:38, textAlign:'right' }}>
        <div className="num" style={{ fontSize:11, fontWeight:600, color:'var(--accent)' }}>{Math.round(pct*100)}%</div>
        <div style={{ marginTop:4 }}>
          <Bar pct={pct} h={3}/>
        </div>
      </div>
    </div>
  );
}

function MacroCard({ name, value, target, unit, color, wide = false }) {
  const pct = Math.min(value/target, 1);
  return (
    <div className="card" style={{
      flexShrink:0, scrollSnapAlign:'start',
      width: wide ? 178 : 132, padding:14,
      display:'flex', flexDirection:'column', gap:10,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:11, fontWeight:500, color:'var(--fg-mute)', letterSpacing:'0.02em', textTransform:'uppercase' }}>{name}</span>
        <span style={{ width:18, height:18, borderRadius:'50%', background:`color-mix(in oklch, ${color} 22%, transparent)`, color, fontSize:10, fontWeight:700, display:'grid', placeItems:'center' }}>●</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
        <span className="num" style={{ fontSize: wide ? 28 : 22, fontWeight:700, letterSpacing:'-0.03em' }}>{value}</span>
        <span className="num" style={{ fontSize:11, color:'var(--fg-dim)' }}>/{target} {unit}</span>
      </div>
      <Bar pct={pct} color={color} h={4}/>
    </div>
  );
}

Object.assign(window, { HomeScreen });
