// Profile (own) — avatar, level progress, tabs

function ProfileScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        {/* Header background */}
        <div style={{ position:'relative', height:140, marginBottom:-50 }}>
          <Photo tone="hero" mesh meshA="oklch(0.72 0.18 340)" meshB="oklch(0.78 0.20 128)" label=""
                 style={{ position:'absolute', inset:0 }}/>
          <div style={{ position:'absolute', top:18, right:16, display:'flex', gap:8, zIndex:5 }}>
            <button style={iconBtn3}><I.share size={16}/></button>
            <button style={iconBtn3}><I.edit size={16}/></button>
          </div>
        </div>

        {/* Avatar + identity */}
        <div style={{ padding:'0 20px', position:'relative', zIndex:2 }}>
          <div style={{
            width:96, height:96, borderRadius:28,
            background:'linear-gradient(135deg,#3b3a36,#1c1b18)',
            border:'4px solid var(--bg)',
            display:'grid', placeItems:'center',
            color:'var(--accent)', fontWeight:700, fontSize:40,
            marginBottom:12,
          }}>M</div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Marcos Aguilar</div>
              <div style={{ fontSize:12, color:'var(--fg-mute)', marginTop:2 }}>@marcosa · marcos@example.com</div>
            </div>
            <button style={{ ...pillBtn2 }}>Edit</button>
          </div>
        </div>

        {/* Level card */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="card" style={{
            padding:16, position:'relative', overflow:'hidden',
            background:'linear-gradient(135deg, color-mix(in oklch, var(--accent) 18%, var(--card)), var(--card) 70%)',
            borderColor:'color-mix(in oklch, var(--accent) 30%, var(--line))',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
              <LevelRing size={64} level={17} pct={0.62} sw={5}/>
              <div style={{ flex:1 }}>
                <div className="eyebrow" style={{ color:'var(--accent)' }}>RANK · SILVER II</div>
                <div className="display" style={{ fontSize:20 }}>Level <span className="num">17</span></div>
                <div style={{ fontSize:11, color:'var(--fg-mute)' }}>Top 8% globally</div>
              </div>
              <div style={{ width:42, height:42, borderRadius:14, background:'color-mix(in oklch, var(--accent) 22%, transparent)', display:'grid', placeItems:'center', color:'var(--accent)' }}>
                <I.trophy size={22}/>
              </div>
            </div>
            <Bar pct={0.62} h={6}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--fg-dim)' }} className="num">
              <span>1,488 / 2,400 XP</span>
              <span>+912 to Silver III</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding:'18px 20px 0' }}>
          <div style={{ display:'flex', padding:4, borderRadius:14, background:'var(--card)', border:'1px solid var(--line)' }}>
            <Tab2 label="Summary" active/>
            <Tab2 label="History"/>
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding:'18px 20px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <SumStat icon={<I.dumbbell size={16}/>} value="142" label="Workouts" tone="accent"/>
          <SumStat icon={<I.clock size={16}/>}    value="186h" label="Total time" tone="data"/>
          <SumStat icon={<I.flame size={16}/>}    value="48,920" label="Kcal burned" tone="warm"/>
          <SumStat icon={<I.bolt size={16}/>}     value="12d" label="Streak" tone="accent"/>
        </div>

        {/* Quick links */}
        <div style={{ padding:'18px 20px 0' }}>
          <div className="card" style={{ overflow:'hidden' }}>
            <Link icon={<I.users size={18}/>} label="Public profile" sub="3 followers · 7 following"/>
            <Sep/>
            <Link icon={<I.scale size={18}/>} label="Personal data" sub="76.4 kg · 178 cm · BMI 24.1"/>
            <Sep/>
            <Link icon={<I.target size={18}/>} label="Goals & milestones" sub="3 active · 12 unlocked"/>
            <Sep/>
            <Link icon={<I.trend size={18}/>} label="Progress" sub="Daily activity & charts"/>
          </div>
        </div>

        {/* Recent achievements */}
        <div style={{ padding:'22px 20px 0' }}>
          <div className="eyebrow" style={{ marginBottom:10 }}>Recent achievements</div>
          <div style={{ display:'flex', gap:10, overflowX:'auto', margin:'0 -20px', padding:'0 20px 4px' }}>
            <Achievement icon={<I.flame size={22}/>} title="10-day streak" date="May 6" tone="warm"/>
            <Achievement icon={<I.trophy size={22}/>} title="Silver rank" date="May 1" tone="accent"/>
            <Achievement icon={<I.bolt size={22}/>} title="Bench PR · 100kg" date="Apr 27" tone="data"/>
            <Achievement icon={<I.target size={22}/>} title="100 workouts" date="Apr 12" tone="accent"/>
          </div>
        </div>

        <div className="nav-spacer"/>
      </div>
      <BottomNav active="home"/>
    </div>
  );
}

const iconBtn3 = {
  width:34, height:34, borderRadius:11,
  background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)',
  color:'#fff', display:'grid', placeItems:'center', cursor:'pointer',
  backdropFilter:'blur(8px)',
};

const pillBtn2 = {
  background:'var(--card)', color:'var(--fg)', border:'1px solid var(--line)',
  padding:'8px 16px', borderRadius:12, fontSize:12, fontWeight:600,
  cursor:'pointer',
};

function Tab2({ label, active }) {
  return (
    <button style={{
      flex:1, padding:'8px 12px', borderRadius:11,
      background: active ? 'var(--card-2)' : 'transparent',
      color: active ? 'var(--fg)' : 'var(--fg-mute)',
      border: active ? '1px solid var(--line-2)' : '1px solid transparent',
      fontSize:13, fontWeight:600, cursor:'pointer',
    }}>{label}</button>
  );
}

function SumStat({ icon, value, label, tone }) {
  const toneVar = { accent:'var(--accent)', data:'var(--data)', warm:'var(--energy)' }[tone];
  return (
    <div className="card" style={{ padding:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:toneVar, marginBottom:8 }}>
        <span style={{ width:28, height:28, borderRadius:9, background:`color-mix(in oklch, ${toneVar} 18%, transparent)`, display:'grid', placeItems:'center' }}>{icon}</span>
      </div>
      <div className="num" style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--fg-mute)', marginTop:2 }}>{label}</div>
    </div>
  );
}

function Link({ icon, label, sub }) {
  return (
    <button style={{
      width:'100%', display:'flex', alignItems:'center', gap:12,
      padding:'14px 16px', background:'transparent', border:0,
      cursor:'pointer', textAlign:'left',
    }}>
      <span style={{ width:36, height:36, borderRadius:11, background:'var(--card-2)', color:'var(--fg-mute)', display:'grid', placeItems:'center' }}>{icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--fg)' }}>{label}</div>
        <div style={{ fontSize:11, color:'var(--fg-dim)', marginTop:1 }}>{sub}</div>
      </div>
      <I.chevronRight size={14} stroke="var(--fg-dim)"/>
    </button>
  );
}

const Sep = () => <div style={{ height:1, background:'var(--line)', marginLeft:64 }}/>;

function Achievement({ icon, title, date, tone }) {
  const toneVar = { accent:'var(--accent)', data:'var(--data)', warm:'var(--energy)' }[tone];
  return (
    <div className="card" style={{
      flexShrink:0, width:140, padding:14,
      borderColor:`color-mix(in oklch, ${toneVar} 30%, var(--line))`,
    }}>
      <div style={{ width:42, height:42, borderRadius:14, background:`color-mix(in oklch, ${toneVar} 18%, transparent)`, color:toneVar, display:'grid', placeItems:'center', marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:12, fontWeight:600, lineHeight:1.2 }}>{title}</div>
      <div className="num" style={{ fontSize:10, color:'var(--fg-dim)', marginTop:4 }}>{date}</div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
