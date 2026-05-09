import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Footprints, Timer, Activity, Smartphone, Lock } from 'lucide-react';
import { usePedometer } from '../../hooks/usePedometer';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/user';

function Ring({ pct = 0, size = 200, sw = 10, color = 'var(--accent)' }: { pct?: number; size?: number; sw?: number; color?: string }) {
    const r = (size - sw) / 2, c = 2 * Math.PI * r;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={sw} fill="none"/>
            <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw} fill="none"
                strokeDasharray={`${c * Math.min(pct, 1)} ${c}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
        </svg>
    );
}

function StatCard({ icon, value, label, sub, color, fullWidth }: {
    icon: React.ReactNode; value: string | number; label: string; sub?: string;
    color: string; fullWidth?: boolean;
}) {
    return (
        <div style={{
            background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20,
            padding: '16px 18px', gridColumn: fullWidth ? '1 / -1' : undefined,
            display: 'flex', flexDirection: 'column', gap: 10,
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: `color-mix(in oklch, ${color} 15%, transparent)`,
                display: 'grid', placeItems: 'center', color,
            }}>{icon}</div>
            <div>
                <div className="num" style={{ fontSize: 26, fontWeight: 700, color: 'var(--fg)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginTop: 3 }}>{label}</div>
            </div>
            {sub && <div style={{ fontSize: 11, color, marginTop: 'auto' }}>{sub}</div>}
        </div>
    );
}

export function DailyProgressPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { steps, calories: stepCalories, distance, permissionState, requestPermission } = usePedometer();
    const [dashboardStats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!user?.id) return;
        getDashboardStats(user.id).then(setStats).catch(console.error);
    }, [user?.id]);

    const workoutCalories = dashboardStats?.calories_burned || 0;
    const totalCalories   = workoutCalories + stepCalories;
    const calorieTarget   = dashboardStats?.calories_target || 600;
    const pct             = totalCalories / calorieTarget;
    const trainingMin     = dashboardStats?.time_minutes || 0;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 90 }}>

            {/* Header */}
            <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate(-1)} style={{
                    width: 36, height: 36, borderRadius: 11,
                    background: 'var(--card)', border: '1px solid var(--line)',
                    color: 'var(--fg)', display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}>
                    <ArrowLeft size={16}/>
                </button>
                <div>
                    <div className="eyebrow">ACTIVITY</div>
                    <div className="display" style={{ fontSize: 18, color: 'var(--fg)' }}>Daily Progress</div>
                </div>
            </div>

            {/* Calorie ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 20px' }}>
                <div style={{ position: 'relative', width: 200, height: 200 }}>
                    <Ring pct={pct} size={200} sw={12} color="var(--energy)"/>
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}>
                        <Flame size={28} color="var(--energy)" style={{ filter: 'drop-shadow(0 0 8px oklch(0.75 0.20 40))' }}/>
                        <div className="num" style={{ fontSize: 40, fontWeight: 900, color: 'var(--fg)', lineHeight: 1 }}>{totalCalories}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-mute)' }}>kcal burned</div>
                        <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 2 }}>
                            goal: {calorieTarget} kcal · <span style={{ color: 'var(--energy)' }}>{Math.round(pct * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* iOS permission request */}
            {permissionState === 'unknown' && (
                <div style={{ margin: '0 16px 16px', padding: '16px', borderRadius: 18, background: 'var(--card)', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4 }}>Motion permission needed</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-mute)', marginBottom: 14 }}>
                        Allow motion access so the app can count your steps in real time.
                    </div>
                    <button onClick={requestPermission} style={{
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        border: 'none', borderRadius: 12, padding: '10px 24px',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>
                        Allow Motion Access
                    </button>
                </div>
            )}

            {permissionState === 'denied' && (
                <div style={{ margin: '0 16px 16px', padding: '14px 16px', borderRadius: 18, background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Lock size={18} color="var(--fg-mute)"/>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Step tracking unavailable</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>Motion access was denied. Enable it in Settings → Safari → Motion &amp; Orientation.</div>
                    </div>
                </div>
            )}

            {permissionState === 'unavailable' && (
                <div style={{ margin: '0 16px 16px', padding: '14px 16px', borderRadius: 18, background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Smartphone size={18} color="var(--fg-mute)"/>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Sensor not detected</div>
                        <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>DeviceMotion API not available on this device.</div>
                    </div>
                </div>
            )}

            {/* Stats grid */}
            <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard
                    icon={<Footprints size={18}/>}
                    value={steps.toLocaleString()}
                    label="Steps"
                    sub={permissionState === 'granted' ? '● Sensor active' : undefined}
                    color="oklch(0.72 0.18 240)"
                />
                <StatCard
                    icon={<Activity size={18}/>}
                    value={`${distance} km`}
                    label="Distance"
                    color="oklch(0.78 0.20 128)"
                />
                <StatCard
                    icon={<Flame size={18}/>}
                    value={stepCalories}
                    label="Kcal from steps"
                    color="var(--energy)"
                />
                <StatCard
                    icon={<Flame size={18}/>}
                    value={workoutCalories}
                    label="Kcal from workouts"
                    color="var(--recovery)"
                />
                <StatCard
                    icon={<Timer size={18}/>}
                    value={`${Math.floor(trainingMin / 60)}h ${trainingMin % 60}m`}
                    label="Training time today"
                    color="var(--data)"
                    fullWidth
                />
            </div>
        </div>
    );
}
