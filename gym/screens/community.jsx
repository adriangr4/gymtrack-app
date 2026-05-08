// Community feed — global/friends tabs, post cards, FAB

function CommunityScreen() {
  return (
    <div className="gt">
      <div className="gt-scroll">
        {/* Header */}
        <div style={{ padding:'8px 20px 0', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div className="eyebrow" style={{ marginBottom:1 }}>COMMUNITY</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Feed</div>
          </div>
          <button style={iconBtn2}><I.search size={18}/></button>
          <button style={iconBtn2}><I.filter size={18}/></button>
        </div>

        {/* Tabs */}
        <div style={{ padding:'14px 20px 0' }}>
          <div style={{
            display:'flex', padding:4, borderRadius:14,
            background:'var(--card)', border:'1px solid var(--line)',
          }}>
            <Tab label="Global" count="2.4k" active/>
            <Tab label="Friends" count="38"/>
          </div>
        </div>

        {/* Posts */}
        <div style={{ padding:'18px 16px 0', display:'flex', flexDirection:'column', gap:18 }}>
          <PostCard
            user={{ name:'Lucía Vega', handle:'@luvega', lvl:24, rank:'Gold' }}
            kind="routine" verb="shared a routine"
            title="5/3/1 Power Block"
            meshA="oklch(0.78 0.20 36)" meshB="oklch(0.65 0.16 340)"
            tags={['Strength','5 days','8 weeks']}
            rating={4.7} ratings={128}
            likes={342} comments={28}
            time="3h"
            inputAvatar="M"
          />
          <PostCard
            user={{ name:'Tomás Reyes', handle:'@tomr', lvl:31, rank:'Platinum' }}
            kind="diet" verb="shared a meal plan"
            title="High-Protein Cut · 2200 kcal"
            meshA="oklch(0.78 0.20 128)" meshB="oklch(0.70 0.16 245)"
            tags={['Cut','High-protein','7 days']}
            rating={4.9} ratings={56}
            likes={188} comments={14}
            time="6h"
            inputAvatar="M"
          />
          <PostCard
            user={{ name:'Núria Bosch', handle:'@nbosch', lvl:18, rank:'Silver' }}
            kind="routine" verb="completed a workout"
            title="Glute Builder · Day 2"
            meshA="oklch(0.72 0.18 340)" meshB="oklch(0.65 0.16 245)"
            tags={['62 min','312 kcal','PR']}
            stat
            likes={94} comments={6}
            time="1d"
            inputAvatar="M"
          />
        </div>

        <div className="nav-spacer"/>
      </div>

      {/* FAB */}
      <button style={{
        position:'absolute', right:20, bottom:100, zIndex:25,
        width:56, height:56, borderRadius:18,
        background:'var(--accent)', color:'var(--accent-ink)',
        border:0, cursor:'pointer', display:'grid', placeItems:'center',
        boxShadow:'0 8px 24px color-mix(in oklch, var(--accent) 35%, transparent)',
      }}><I.plus size={22} sw={2.5}/></button>

      <BottomNav active="soc"/>
    </div>
  );
}

const iconBtn2 = {
  width:38, height:38, borderRadius:12,
  background:'var(--card)', border:'1px solid var(--line)',
  color:'var(--fg)', display:'grid', placeItems:'center', cursor:'pointer',
};

function Tab({ label, count, active }) {
  return (
    <button style={{
      flex:1, padding:'8px 12px', borderRadius:11,
      background: active ? 'var(--card-2)' : 'transparent',
      color: active ? 'var(--fg)' : 'var(--fg-mute)',
      border: active ? '1px solid var(--line-2)' : '1px solid transparent',
      fontSize:13, fontWeight:600, cursor:'pointer',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    }}>
      {label}
      <span className="num" style={{ fontSize:10, color:'var(--fg-dim)' }}>{count}</span>
    </button>
  );
}

function PostCard({ user, verb, kind, title, tags, rating, ratings, likes, comments, time, inputAvatar, meshA, meshB, stat }) {
  return (
    <div className="card" style={{ overflow:'hidden', borderRadius:22 }}>
      {/* Header */}
      <div style={{ padding:'12px 14px 10px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{
          width:38, height:38, borderRadius:'50%',
          background:'linear-gradient(135deg,#3b3a36,#1c1b18)',
          color:'var(--accent)', display:'grid', placeItems:'center',
          fontSize:13, fontWeight:700, position:'relative',
        }}>
          {user.name.split(' ').map(n=>n[0]).join('')}
          <span className="num" style={{
            position:'absolute', right:-4, bottom:-3,
            background:'var(--accent)', color:'var(--accent-ink)',
            fontSize:9, fontWeight:700, padding:'1px 5px',
            borderRadius:6, border:'2px solid var(--card)',
          }}>{user.lvl}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>{user.name}</span>
            <span style={{ fontSize:9, color:'var(--accent)', letterSpacing:'0.06em', fontWeight:700 }}>● {user.rank.toUpperCase()}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--fg-mute)' }}>{verb} · {time}</div>
        </div>
        <button style={{ background:'transparent', border:0, color:'var(--fg-dim)', cursor:'pointer', padding:6 }}>
          <I.more size={18}/>
        </button>
      </div>

      {/* Big media */}
      <Photo tone="hero" mesh meshA={meshA} meshB={meshB} label={title.toLowerCase()}
             style={{ height:200, padding:14, display:'flex', flexDirection:'column', justifyContent:'space-between', borderRadius:0 }}>
        <div style={{ display:'flex', gap:6, position:'relative', zIndex:2 }}>
          <span className="pill accent" style={{ background:'rgba(0,0,0,0.45)', color:'#fff', borderColor:'transparent' }}>
            {kind === 'routine' ? <I.dumbbell size={11}/> : <I.utensils size={11}/>}
            {kind.toUpperCase()}
          </span>
        </div>
        <div style={{ position:'relative', zIndex:2, color:'#fff' }}>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.05 }}>{title}</div>
          <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
            {tags.map(t => (
              <span key={t} style={{
                fontSize:10, fontWeight:500, padding:'3px 8px',
                background:'rgba(255,255,255,0.18)', borderRadius:999,
                backdropFilter:'blur(6px)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </Photo>

      {/* Rating row */}
      {!stat && (
        <div style={{ padding:'12px 14px 0', display:'flex', alignItems:'center', gap:10 }}>
          <Stars value={rating} size={13}/>
          <span className="num" style={{ fontSize:12, fontWeight:600 }}>{rating.toFixed(1)}</span>
          <span style={{ fontSize:11, color:'var(--fg-dim)' }}>({ratings})</span>
          <button style={{ marginLeft:'auto', ...pillBtn, color:'var(--accent)' }}>
            Import <I.arrowRight size={12}/>
          </button>
        </div>
      )}

      {/* Interactions */}
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:14, color:'var(--fg-mute)', fontSize:12, fontWeight:500 }}>
        <button style={interactBtn}>
          <I.heart size={16}/>
          <span className="num">{likes}</span>
        </button>
        <button style={interactBtn}>
          <I.comment size={16}/>
          <span className="num">{comments}</span>
        </button>
        <button style={interactBtn}>
          <I.star size={16}/>
          Rate
        </button>
        <button style={{ ...interactBtn, marginLeft:'auto' }}>
          <I.share size={16}/>
        </button>
      </div>

      {/* Inline comment input */}
      <div style={{ padding:'0 14px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{
          width:28, height:28, borderRadius:'50%',
          background:'linear-gradient(135deg,#3b3a36,#1c1b18)',
          color:'var(--accent)', display:'grid', placeItems:'center',
          fontSize:11, fontWeight:700, flexShrink:0,
        }}>{inputAvatar}</div>
        <div style={{
          flex:1, height:34, borderRadius:12,
          background:'var(--card-2)', border:'1px solid var(--line)',
          padding:'0 12px', display:'flex', alignItems:'center',
          color:'var(--fg-dim)', fontSize:12,
        }}>Add a comment…</div>
        <button style={{ ...iconBtn2, width:34, height:34, color:'var(--accent)' }}><I.send size={14}/></button>
      </div>
    </div>
  );
}

const interactBtn = {
  background:'transparent', border:0, padding:0, cursor:'pointer',
  color:'var(--fg-mute)', fontSize:12, fontWeight:500,
  display:'inline-flex', alignItems:'center', gap:5,
};

const pillBtn = {
  background:'color-mix(in oklch, var(--accent) 18%, transparent)',
  color:'var(--accent)', border:'1px solid color-mix(in oklch, var(--accent) 30%, transparent)',
  padding:'6px 12px', borderRadius:999, fontSize:11, fontWeight:600,
  cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5,
};

Object.assign(window, { CommunityScreen });
