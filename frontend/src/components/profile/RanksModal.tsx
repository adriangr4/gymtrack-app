import { X } from 'lucide-react';

interface RankTier {
    name: string;
    minLevel: number;
    maxLevel: number;
    color: string;
    icon: string;
}

const RANKS: RankTier[] = [
    { name: 'Bronze',   minLevel: 1,  maxLevel: 10,  color: 'oklch(0.65 0.10 55)',  icon: '🥉' },
    { name: 'Silver',   minLevel: 11, maxLevel: 30,  color: 'oklch(0.72 0.04 200)', icon: '🥈' },
    { name: 'Gold',     minLevel: 31, maxLevel: 50,  color: 'oklch(0.80 0.16 90)',  icon: '🥇' },
    { name: 'Platinum', minLevel: 51, maxLevel: 70,  color: 'oklch(0.78 0.12 175)', icon: '💠' },
    { name: 'Diamond',  minLevel: 71, maxLevel: 90,  color: 'oklch(0.80 0.18 240)', icon: '💎' },
    { name: 'Champion', minLevel: 91, maxLevel: 999, color: 'oklch(0.88 0.20 128)', icon: '👑' },
];

function xpForLevel(lvl: number): number {
    return (lvl - 1) ** 2 * 100;
}

interface Props {
    level: number;
    xp: number;
    globalPosition: number;
    totalUsers: number;
    onClose: () => void;
}

export function RanksModal({ level, xp, globalPosition, totalUsers, onClose }: Props) {
    const currentRank = RANKS.find(r => level >= r.minLevel && level <= r.maxLevel) ?? RANKS[0];

    const rankXpStart = xpForLevel(currentRank.minLevel);
    const rankXpEnd   = xpForLevel(Math.min(currentRank.maxLevel + 1, 999));
    const rankPct     = rankXpEnd > rankXpStart
        ? Math.min((xp - rankXpStart) / (rankXpEnd - rankXpStart), 1)
        : 1;

    const positionLabel = () => {
        if (!globalPosition || !totalUsers) return null;
        if (globalPosition <= 100) return `#${globalPosition} globally`;
        const pct = Math.round((globalPosition / totalUsers) * 100);
        return `Top ${pct}% globally`;
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 300,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        }} onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 480,
                    background: 'var(--card)', borderRadius: '24px 24px 0 0',
                    padding: '20px 20px 40px',
                    border: '1px solid var(--line-2)', borderBottom: 'none',
                    maxHeight: '85dvh', overflowY: 'auto',
                }}
            >
                {/* Handle + header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                        <div className="eyebrow" style={{ color: 'var(--accent)' }}>RANK SYSTEM</div>
                        <div className="display" style={{ fontSize: 18, color: 'var(--fg)', marginTop: 2 }}>Progression</div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'var(--card-2)', border: '1px solid var(--line)',
                        color: 'var(--fg-mute)', display: 'grid', placeItems: 'center', cursor: 'pointer',
                    }}>
                        <X size={15}/>
                    </button>
                </div>

                {/* Your position card */}
                <div style={{
                    background: `color-mix(in oklch, ${currentRank.color} 12%, var(--card-2))`,
                    border: `1px solid color-mix(in oklch, ${currentRank.color} 35%, var(--line))`,
                    borderRadius: 18, padding: '14px 16px', marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 36, lineHeight: 1 }}>{currentRank.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div className="eyebrow" style={{ color: currentRank.color }}>YOUR RANK</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)' }}>{currentRank.name}</div>
                            {positionLabel() && (
                                <div style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 2 }}>{positionLabel()}</div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="num" style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg)' }}>Lvl {level}</div>
                            <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{xp} XP</div>
                        </div>
                    </div>

                    {/* Progress within rank */}
                    <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{currentRank.name} progress</span>
                        <span className="num">{Math.round(rankPct * 100)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${rankPct * 100}%`, background: currentRank.color, borderRadius: 6, transition: 'width 0.6s' }}/>
                    </div>
                    {currentRank.name !== 'Champion' && (
                        <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 5, textAlign: 'right' }} className="num">
                            {xpForLevel(currentRank.maxLevel + 1) - xp} XP to {RANKS[RANKS.indexOf(currentRank) + 1]?.name}
                        </div>
                    )}
                </div>

                {/* All rank tiers */}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-mute)', marginBottom: 10, letterSpacing: '0.06em' }}>ALL RANKS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...RANKS].reverse().map(rank => {
                        const isCurrent = rank.name === currentRank.name;
                        const isPast = RANKS.indexOf(rank) < RANKS.indexOf(currentRank);
                        const isLocked = !isCurrent && !isPast && RANKS.indexOf(rank) > RANKS.indexOf(currentRank);
                        return (
                            <div key={rank.name} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px', borderRadius: 14,
                                background: isCurrent
                                    ? `color-mix(in oklch, ${rank.color} 14%, var(--card-2))`
                                    : 'var(--card-2)',
                                border: `1px solid ${isCurrent
                                    ? `color-mix(in oklch, ${rank.color} 40%, var(--line))`
                                    : 'var(--line)'}`,
                                opacity: isLocked ? 0.5 : 1,
                            }}>
                                <div style={{ fontSize: 24, lineHeight: 1, width: 32, textAlign: 'center' }}>{rank.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: isCurrent ? rank.color : 'var(--fg)' }}>{rank.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>
                                        Levels {rank.minLevel}–{rank.maxLevel === 999 ? '∞' : rank.maxLevel}
                                    </div>
                                </div>
                                {isCurrent && (
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                                        background: rank.color, color: '#000',
                                        padding: '3px 8px', borderRadius: 6,
                                    }}>● YOU</span>
                                )}
                                {isPast && (
                                    <span style={{ fontSize: 16 }}>✓</span>
                                )}
                                {isLocked && (
                                    <span style={{ fontSize: 12, color: 'var(--fg-dim)' }}>🔒</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
