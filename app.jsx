// App — design canvas with all screens framed in iOS devices

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#cdf531",
  "mode": "dark",
  "showLevelUp": false
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  '#cdf531': { '--accent': 'oklch(0.88 0.20 128)', '--accent-ink': 'oklch(0.22 0.05 128)', '--accent-soft': 'oklch(0.32 0.10 128)' },
  '#3b82f6': { '--accent': 'oklch(0.74 0.18 245)', '--accent-ink': 'oklch(0.98 0.02 245)', '--accent-soft': 'oklch(0.32 0.10 245)' },
  '#f97316': { '--accent': 'oklch(0.76 0.18 36)',  '--accent-ink': 'oklch(0.20 0.05 36)',  '--accent-soft': 'oklch(0.32 0.10 36)' },
  '#e11d8e': { '--accent': 'oklch(0.74 0.20 340)', '--accent-ink': 'oklch(0.98 0.02 340)', '--accent-soft': 'oklch(0.32 0.10 340)' },
};

function Frame({ children, mode, accent }) {
  const accentVars = ACCENT_MAP[accent] || ACCENT_MAP['#cdf531'];
  const styleVars = { ...accentVars };
  return (
    <div style={{ ...styleVars, width:402, height:874, position:'relative' }}>
      <IOSDevice width={402} height={874} dark={mode === 'dark'}>
        <div className={`gt ${mode === 'light' ? 'light' : ''}`} style={styleVars}>
          {children}
        </div>
      </IOSDevice>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const mode = t.mode;
  const accent = t.accent;

  const Stage = ({ children }) => <Frame mode={mode} accent={accent}>{children}</Frame>;

  return (
    <>
      <DesignCanvas>
        <DCSection id="critical" title="GymTrack — Redesign" subtitle="Premium athletic dark · volt accent · gamified XP">

          <DCArtboard id="home" label="01 · Home" width={402} height={874}>
            <Stage><HomeScreen/></Stage>
          </DCArtboard>

          <DCArtboard id="workout-active" label="02 · Workout · Active" width={402} height={874}>
            <Stage><WorkoutActiveScreen/></Stage>
          </DCArtboard>

          <DCArtboard id="workout-done" label="03 · Workout · Complete" width={402} height={874}>
            <Stage>
              <WorkoutCompletedScreen/>
              {t.showLevelUp && <LevelUpOverlay/>}
            </Stage>
          </DCArtboard>

          <DCArtboard id="community" label="04 · Community" width={402} height={874}>
            <Stage><CommunityScreen/></Stage>
          </DCArtboard>

          <DCArtboard id="profile" label="05 · Profile" width={402} height={874}>
            <Stage><ProfileScreen/></Stage>
          </DCArtboard>

        </DCSection>

        <DCSection id="library" title="Routines" subtitle="Library — list & detail">
          <DCArtboard id="lib-list" label="06 · Library" width={402} height={874}>
            <Stage><LibraryScreen/></Stage>
          </DCArtboard>
          <DCArtboard id="lib-detail" label="07 · Routine detail" width={402} height={874}>
            <Stage><LibraryDetailScreen/></Stage>
          </DCArtboard>
        </DCSection>

        <DCSection id="diet" title="Nutrition" subtitle="Diet plan — overview & detail">
          <DCArtboard id="diet-list" label="08 · Diet" width={402} height={874}>
            <Stage><DietScreen/></Stage>
          </DCArtboard>
          <DCArtboard id="diet-detail" label="09 · Plan detail" width={402} height={874}>
            <Stage><DietDetailScreen/></Stage>
          </DCArtboard>
        </DCSection>

        <DCSection id="data" title="Data & Progress" subtitle="Tracking screens">
          <DCArtboard id="progress" label="10 · Progress" width={402} height={874}>
            <Stage><ProgressScreen/></Stage>
          </DCArtboard>
          <DCArtboard id="personal" label="11 · Personal data" width={402} height={874}>
            <Stage><PersonalDataScreen/></Stage>
          </DCArtboard>
        </DCSection>

        <DCSection id="auth" title="Authentication" subtitle="Public screens">
          <DCArtboard id="login" label="12 · Login" width={402} height={874}>
            <Stage><LoginScreen/></Stage>
          </DCArtboard>
          <DCArtboard id="register" label="13 · Register" width={402} height={874}>
            <Stage><RegisterScreen/></Stage>
          </DCArtboard>
          <DCArtboard id="levelup" label="14 · Level-up overlay" width={402} height={874}>
            <Stage>
              <WorkoutCompletedScreen/>
              <LevelUpOverlay/>
            </Stage>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme"/>
        <TweakRadio label="Mode" value={t.mode}
          options={[{value:'dark',label:'Dark'},{value:'light',label:'Light'}]}
          onChange={v => setTweak('mode', v)}/>
        <TweakColor label="Accent" value={t.accent}
          options={['#cdf531','#3b82f6','#f97316','#e11d8e']}
          onChange={v => setTweak('accent', v)}/>
        <TweakSection label="States"/>
        <TweakToggle label="Level-up overlay" value={t.showLevelUp} onChange={v => setTweak('showLevelUp', v)}/>
      </TweaksPanel>
    </>
  );
}

// Babel transpiles text/babel scripts asynchronously, often after window.load
// has already fired. Use a polling loop that waits for required globals.
(function mount() {
  if (typeof App !== 'undefined' && typeof HomeScreen !== 'undefined' && typeof DesignCanvas !== 'undefined') {
    ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
  } else {
    setTimeout(mount, 30);
  }
})();
