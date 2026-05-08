// Shared components & design tokens for GymTrack redesign

// ─────────────────────────────────────────────────────────────
// Icons — minimal stroke icons, original drawings (not Lucide)
// ─────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, fill = 'none', stroke = 'currentColor', sw = 1.6, children, vb = 24 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
);

const I = {
  home: (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"/></Icon>,
  dumbbell: (p) => <Icon {...p}><path d="M2 10v4M5 7v10M19 7v10M22 10v4M5 12h14"/></Icon>,
  utensils: (p) => <Icon {...p}><path d="M5 3v8a2 2 0 002 2v8M9 3v8a2 2 0 01-2 2M14 3a3 3 0 00-3 3v6a2 2 0 002 2v7M14 3a3 3 0 013 3v6a2 2 0 01-2 2"/></Icon>,
  users: (p) => <Icon {...p}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></Icon>,
  bell: (p) => <Icon {...p}><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10.3 21a1.94 1.94 0 003.4 0"/></Icon>,
  flame: (p) => <Icon {...p}><path d="M12 2c2 4 6 6 6 11a6 6 0 11-12 0c0-3 2-4 2-7 2 1 4 0 4-4z"/></Icon>,
  bolt: (p) => <Icon {...p}><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></Icon>,
  steps: (p) => <Icon {...p}><path d="M5 4l3 7-3 1 1 8M14 6l-2 6 4 1-2 7"/></Icon>,
  clock: (p) => <Icon {...p} fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  star: (p) => <Icon {...p} fill="currentColor" sw={0}><path d="M12 2l3 7 7 .6-5.3 4.6L18 21l-6-3.7L6 21l1.3-6.8L2 9.6 9 9z"/></Icon>,
  heart: (p) => <Icon {...p}><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></Icon>,
  comment: (p) => <Icon {...p}><path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8z"/></Icon>,
  share: (p) => <Icon {...p}><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></Icon>,
  plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  chevronRight: (p) => <Icon {...p}><path d="M9 18l6-6-6-6"/></Icon>,
  chevronLeft: (p) => <Icon {...p}><path d="M15 18l-6-6 6-6"/></Icon>,
  chevronDown: (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  arrowUp: (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  arrowRight: (p) => <Icon {...p}><path d="M5 12h14M12 5l7 7-7 7"/></Icon>,
  pause: (p) => <Icon {...p} fill="currentColor" sw={0}><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></Icon>,
  play: (p) => <Icon {...p} fill="currentColor" sw={0}><path d="M6 3l15 9-15 9V3z"/></Icon>,
  check: (p) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>,
  x: (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  edit: (p) => <Icon {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></Icon>,
  trash: (p) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></Icon>,
  trophy: (p) => <Icon {...p}><path d="M6 9H4a2 2 0 010-4h2M18 9h2a2 2 0 000-4h-2M6 4h12v6a6 6 0 01-12 0V4zM12 16v3M9 22h6"/></Icon>,
  target: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Icon>,
  drop: (p) => <Icon {...p}><path d="M12 2.5s6 7 6 11.5a6 6 0 11-12 0c0-4.5 6-11.5 6-11.5z"/></Icon>,
  ruler: (p) => <Icon {...p}><path d="M3 8h18v8H3zM7 8v3M11 8v5M15 8v3M19 8v5"/></Icon>,
  scale: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9 14l3-6 3 6"/></Icon>,
  trend: (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-8M21 7v6h-6"/></Icon>,
  more: (p) => <Icon {...p} fill="currentColor" sw={0}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></Icon>,
  send: (p) => <Icon {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></Icon>,
  filter: (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>,
  calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></Icon>,
  dot: (p) => <Icon {...p} fill="currentColor" sw={0} vb={8}><circle cx="4" cy="4" r="3.5"/></Icon>,
};

// ─────────────────────────────────────────────────────────────
// XP / level helpers
// ─────────────────────────────────────────────────────────────
const RANKS = [
  { lvl: 1,  name: 'Iron' },
  { lvl: 5,  name: 'Bronze' },
  { lvl: 10, name: 'Silver' },
  { lvl: 18, name: 'Gold' },
  { lvl: 25, name: 'Platinum' },
  { lvl: 35, name: 'Diamond' },
  { lvl: 50, name: 'Apex' },
];
const rankFor = (lvl) => [...RANKS].reverse().find(r => lvl >= r.lvl) || RANKS[0];

// ─────────────────────────────────────────────────────────────
// Level progress ring — used in Home + Profile
// ─────────────────────────────────────────────────────────────
function LevelRing({ size = 56, level = 17, pct = 0.62, sw = 4, children }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={sw} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth={sw} fill="none"
                strokeDasharray={`${c*pct} ${c}`} strokeLinecap="round"/>
      </svg>
      <div style={{
        position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily: 'var(--font-mono)', fontSize: size*0.32, fontWeight: 700, color: 'var(--fg)',
      }}>{children ?? level}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Top header: greeting + avatar (level ring) + bell
// ─────────────────────────────────────────────────────────────
function TopHeader({ name = 'Marcos', level = 17, xpPct = 0.62, hour = 9, unread = 3 }) {
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px 0' }}>
      <div style={{ position:'relative' }}>
        <LevelRing size={48} level={level} pct={xpPct} sw={3}>
          <div style={{
            width: 36, height: 36, borderRadius:'50%',
            background:'linear-gradient(135deg,#3b3a36,#1c1b18)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'var(--accent)', fontWeight:700, fontSize:13,
          }}>M</div>
        </LevelRing>
        <div style={{
          position:'absolute', right:-2, bottom:-2, width:14, height:14,
          borderRadius:'50%', background:'var(--accent)',
          border:'2.5px solid var(--bg)',
        }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="eyebrow" style={{ marginBottom: 1 }}>{greet}</div>
        <div style={{ fontSize:18, fontWeight:600, lineHeight:1.1 }}>{name}</div>
      </div>
      <button style={{
        position:'relative', width:40, height:40, borderRadius:14,
        background:'var(--card)', border:'1px solid var(--line)',
        color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
      }}>
        <I.bell size={18}/>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:-4, right:-4, minWidth:18, height:18, padding:'0 5px',
            borderRadius:9, background:'var(--energy)', color:'#fff',
            fontSize:10, fontWeight:700, display:'grid', placeItems:'center',
            border:'2px solid var(--bg)',
          }}>{unread}</span>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom navigation — 4 tabs, pill shape
// ─────────────────────────────────────────────────────────────
function BottomNav({ active = 'home', onChange = () => {} }) {
  const tabs = [
    { id:'home', label:'Home',     Icon: I.home },
    { id:'lib',  label:'Library',  Icon: I.dumbbell },
    { id:'diet', label:'Diet',     Icon: I.utensils },
    { id:'soc',  label:'Community',Icon: I.users },
  ];
  return (
    <div className="bottomnav">
      {tabs.map(t => (
        <button key={t.id} className={active === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          <span className="nav-icon"><t.Icon size={20} sw={t.id === active ? 2 : 1.6}/></span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Photo placeholder — diagonal stripes + label + optional mesh
// ─────────────────────────────────────────────────────────────
function Photo({ tone = 'hero', label = 'photo', mesh = false, style = {}, children, meshA, meshB }) {
  const meshStyle = mesh ? { '--mesh-a': meshA || 'var(--accent)', '--mesh-b': meshB || 'var(--energy)' } : {};
  return (
    <div className={`photo ${tone} ${mesh ? 'mesh' : ''}`}
         data-label={label}
         style={{ ...meshStyle, ...style }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tiny linear progress bar
// ─────────────────────────────────────────────────────────────
function Bar({ pct = 0.5, color = 'var(--accent)', track = 'rgba(255,255,255,0.08)', h = 6, r = 3 }) {
  return (
    <div style={{ height:h, borderRadius:r, background:track, overflow:'hidden', width:'100%' }}>
      <div style={{ height:'100%', width:`${pct*100}%`, background:color, borderRadius:r }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stars rating (display only)
// ─────────────────────────────────────────────────────────────
function Stars({ value = 4.6, size = 12, gap = 2, color = 'var(--accent)' }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap }}>
      {[0,1,2,3,4].map(i => {
        const filled = value >= i+1;
        const half = !filled && value > i;
        return (
          <span key={i} style={{ color: filled || half ? color : 'rgba(255,255,255,0.18)' }}>
            <I.star size={size}/>
          </span>
        );
      })}
    </div>
  );
}

Object.assign(window, { Icon, I, RANKS, rankFor, LevelRing, TopHeader, BottomNav, Photo, Bar, Stars });
