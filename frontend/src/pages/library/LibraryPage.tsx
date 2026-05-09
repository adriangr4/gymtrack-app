import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRoutines, deleteRoutine, type Routine } from '../../services/routines';
import { useAuth } from '../../context/AuthContext';
import { shareToCommunity } from '../../services/social';
import { Plus, ChevronLeft, Share2, Pencil, Star, Play, Search, Trash2, Camera } from 'lucide-react';
import { getRoutineImage, seedFrom, getImageOverride, setImageOverride, PRESET_ROUTINE_PHOTOS } from '../../lib/imageUtils';

function Bar({ pct = 0.5, h = 6 }: { pct?: number; h?: number }) {
    return (
        <div style={{ height: h, borderRadius: h, background: 'var(--line)', overflow: 'hidden', width: '100%' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: 'var(--accent)', borderRadius: h, transition: 'width 0.6s ease' }} />
        </div>
    );
}


const iconBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 11,
    background: 'rgba(0,0,0,0.42)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer',
    backdropFilter: 'blur(8px)',
};

export function LibraryPage() {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Routine | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [, forceRender] = useState(0);
    const { user, updateUser } = useAuth();

    useEffect(() => {
        if (!user?.id) return;
        getRoutines(user.id).then(setRoutines).catch(console.error).finally(() => setLoading(false));
    }, [user?.id]);

    const handleSetActive = async (id: string) => {
        try { await updateUser({ current_routine_id: id }); } catch {}
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteRoutine(deleteTarget);
            setRoutines(prev => prev.filter(r => r.id !== deleteTarget));
            if (selected?.id === deleteTarget) setSelected(null);
        } catch { alert('Error al eliminar'); }
        finally { setDeleteTarget(null); }
    };

    const handleShare = async () => {
        if (!selected || !user) return;
        try {
            await shareToCommunity({
                content_type: 'routine', content_id: selected.id!,
                content_name: selected.name, creator_id: user.id,
                creator_name: user.username || user.email?.split('@')[0] || 'User',
                creator_avatar: user.profilePicture,
                created_at: new Date().toISOString(),
            });
            alert('¡Rutina compartida!');
        } catch (e: any) { alert(e.response?.data?.detail || 'Error al compartir'); }
    };

    const filtered = routines.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

    /* ── DELETE MODAL ─────────────────────────────────── */
    const DeleteModal = deleteTarget && (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
            <div style={{
                width: '100%', maxWidth: 340, background: 'var(--card)',
                border: '1px solid var(--line-2)', borderRadius: 24, padding: '24px 20px',
            }}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--fg)' }}>Delete routine?</div>
                <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginBottom: 24 }}>This action cannot be undone.</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={() => setDeleteTarget(null)} style={{
                        padding: '10px 18px', borderRadius: 12, border: '1px solid var(--line-2)',
                        background: 'transparent', color: 'var(--fg-mute)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={confirmDelete} style={{
                        padding: '10px 18px', borderRadius: 12, border: 0,
                        background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>Delete</button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--fg-mute)' }}>
            Loading…
        </div>
    );

    /* ── DETAIL VIEW ─────────────────────────────────── */
    if (selected) {
        const isCurrent = user?.current_routine_id === selected.id;
        const isPredefined = selected.creator_id === 'system' || selected.is_predefined;
        const isOwner = !isPredefined && selected.creator_id === user?.id;
        const grouped = (selected.exercises || []).reduce((acc: any, ex: any) => {
            const d = ex.day_of_week ?? 1;
            if (!acc[d]) acc[d] = [];
            acc[d].push(ex);
            return acc;
        }, {});
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const heroImg = getImageOverride(selected.id!) || getRoutineImage(selected.name, seedFrom(selected.id || selected.name), 800, 560);

        const PhotoPicker = showPhotoPicker && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 480, background: 'var(--card)', border: '1px solid var(--line-2)', borderRadius: '24px 24px 0 0', padding: '16px 16px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Choose cover photo</span>
                        <button onClick={() => setShowPhotoPicker(false)} style={{ background: 'none', border: 0, color: 'var(--fg-dim)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {PRESET_ROUTINE_PHOTOS.map(p => (
                            <button key={p.id} onClick={() => { setImageOverride(selected.id!, p.url.replace('300', '800').replace('200', '560')); setShowPhotoPicker(false); forceRender(n => n + 1); }} style={{
                                padding: 0, border: '2px solid transparent', borderRadius: 12, overflow: 'hidden',
                                cursor: 'pointer', aspectRatio: '3/2',
                                backgroundImage: `url("${p.url}")`, backgroundSize: 'cover', backgroundPosition: 'center',
                            }}>
                                <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );

        return (
            <div style={{ background: 'var(--bg)', paddingBottom: 90 }}>
                {DeleteModal}
                {PhotoPicker}

                {/* Floating action bar */}
                <div style={{
                    position: 'absolute', top: 20, left: 0, right: 0,
                    padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10,
                }}>
                    <button onClick={() => setSelected(null)} style={iconBtn}><ChevronLeft size={18}/></button>
                    <div style={{ flex: 1 }} />
                    {isOwner && <>
                        <button onClick={handleShare} style={iconBtn}><Share2 size={15}/></button>
                        <button onClick={() => setDeleteTarget(selected.id!)} style={{ ...iconBtn, color: '#f87171' }}><Trash2 size={15}/></button>
                    </>}
                    <button onClick={() => setShowPhotoPicker(true)} style={iconBtn}><Camera size={15}/></button>
                    <button onClick={() => handleSetActive(selected.id!)} style={{ ...iconBtn, ...(isCurrent ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'transparent' } : {}) }}>
                        <Star size={15} fill={isCurrent ? 'currentColor' : 'none'}/>
                    </button>
                    <button style={iconBtn}><Pencil size={15}/></button>
                </div>

                {/* Hero */}
                <div style={{
                    height: 280, padding: '120px 20px 20px', position: 'relative',
                    backgroundImage: `url("${heroImg}")`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)' }}/>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                            {isCurrent && <span className="pill" style={{ background: 'rgba(0,0,0,0.45)', borderColor: 'transparent', color: '#fff' }}>● ACTIVE</span>}
                            {isPredefined && (
                                <span className="pill" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'transparent', fontSize: 9 }}>
                                    ★ Lyfter Official
                                </span>
                            )}
                            {selected.difficulty && (
                                <span className="pill" style={{ background: 'rgba(0,0,0,0.45)', borderColor: 'transparent', color: '#fff', textTransform: 'capitalize' }}>
                                    {selected.difficulty}
                                </span>
                            )}
                            <span className="pill" style={{ background: 'rgba(0,0,0,0.45)', borderColor: 'transparent', color: '#fff' }}>
                                {new Set((selected.exercises || []).map((e: any) => e.day_of_week)).size} days/week
                            </span>
                        </div>
                        <div className="display" style={{ fontSize: 28, color: '#fff', lineHeight: 1.05 }}>{selected.name}</div>
                        {(selected.average_rating ?? 0) > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={11} fill={i <= Math.round(selected.average_rating ?? 0) ? '#fff' : 'none'} stroke="#fff"/>
                                ))}
                                <span className="num" style={{ fontWeight: 600 }}>{(selected.average_rating ?? 0).toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div style={{ padding: '16px 16px 0' }}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                            <span className="eyebrow">Completion progress</span>
                            <span className="num" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>0%</span>
                        </div>
                        <Bar pct={0} h={6} />
                    </div>
                </div>

                {/* Description */}
                {selected.description && (
                    <div style={{ padding: '16px 16px 0' }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-mute)', lineHeight: 1.6 }}>{selected.description}</p>
                    </div>
                )}

                {/* Day picker */}
                <div style={{ padding: '18px 0 0', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, padding: '0 16px' }}>
                        {Object.keys(grouped).sort().map((day, i) => (
                            <div key={day} style={{
                                flexShrink: 0, padding: '10px 14px', borderRadius: 14, textAlign: 'center',
                                background: i === 0 ? 'color-mix(in oklch, var(--accent) 16%, transparent)' : 'var(--card)',
                                border: `1px solid ${i === 0 ? 'color-mix(in oklch, var(--accent) 32%, var(--line))' : 'var(--line)'}`,
                                minWidth: 64,
                            }}>
                                <div className="eyebrow" style={{ color: i === 0 ? 'var(--accent)' : undefined }}>{dayNames[Number(day) - 1] ?? `D${day}`}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--accent)' : 'var(--fg)', marginTop: 3 }}>
                                    {(grouped[day] as any[]).length} ex
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exercises */}
                <div style={{ padding: '18px 16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
                            Exercises · {(selected.exercises || []).length} total
                        </div>
                    </div>
                    {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([day, exList]) => (
                        <div key={day} style={{ marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                                    background: 'color-mix(in oklch, var(--accent) 14%, transparent)',
                                    color: 'var(--accent)', padding: '3px 10px', borderRadius: 6,
                                }}>{dayNames[Number(day) - 1] ?? `Day ${day}`}</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {(exList as any[]).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((item: any, idx: number) => (
                                    <div key={item.id || idx} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                        background: 'var(--card)', border: '1px solid var(--line)',
                                        borderRadius: 16,
                                    }}>
                                        <div className="mesh-hero" style={{
                                            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                                            display: 'grid', placeItems: 'center',
                                            '--mesh-a': 'oklch(0.72 0.18 340)', '--mesh-b': 'oklch(0.65 0.16 245)',
                                        } as React.CSSProperties}>
                                            <span className="num" style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{item.exercise?.name ?? 'Exercise'}</div>
                                            <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{item.exercise?.muscle_group ?? ''}</div>
                                        </div>
                                        <div className="num" style={{ fontSize: 12, color: 'var(--fg-mute)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            {item.target_sets} × {item.target_reps_min}–{item.target_reps_max}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Start CTA */}
                <div style={{ position: 'fixed', left: 14, right: 14, bottom: 18, zIndex: 50 }}>
                    <Link to={`/workout/${selected.id}`} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', height: 56, borderRadius: 18, border: 0,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        fontSize: 15, fontWeight: 700, textDecoration: 'none',
                        boxShadow: '0 4px 24px color-mix(in oklch, var(--accent) 30%, transparent)',
                    }}>
                        <Play size={16} fill="currentColor" stroke="none"/>
                        Start workout
                    </Link>
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ───────────────────────────────────── */
    return (
        <div style={{ background: 'var(--bg)', paddingBottom: 90 }}>
            {DeleteModal}

            {/* Header */}
            <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ flex: 1 }}>
                    <div className="eyebrow" style={{ marginBottom: 1 }}>LIBRARY</div>
                    <div className="display" style={{ fontSize: 24, color: 'var(--fg)' }}>Routines</div>
                </div>
                <Link to="/workout/create" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    border: 0, padding: '8px 14px', borderRadius: 12,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                }}>
                    <Plus size={14}/> New
                </Link>
            </div>

            {/* Search */}
            <div style={{ padding: '14px 16px 0' }}>
                <div style={{
                    height: 42, borderRadius: 14, background: 'var(--card)',
                    border: '1px solid var(--line-2)',
                    display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
                    color: 'var(--fg-dim)', fontSize: 13,
                }}>
                    <Search size={16}/>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search routines…"
                        style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
                    />
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--fg-mute)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>🏋️</div>
                    <p style={{ fontSize: 14, marginBottom: 8 }}>No routines yet</p>
                    <Link to="/workout/create" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--accent)', color: 'var(--accent-ink)',
                        borderRadius: 12, padding: '10px 18px',
                        fontWeight: 700, fontSize: 13, textDecoration: 'none',
                    }}>
                        <Plus size={14}/> Create routine
                    </Link>
                </div>
            ) : (
                <div style={{ padding: '18px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {filtered.map((routine, idx) => {
                        const isCurrent = user?.current_routine_id === routine.id;
                        const isPredef = routine.creator_id === 'system' || routine.is_predefined;
                        const imgUrl = getRoutineImage(routine.name, seedFrom(routine.id || String(idx)));
                        const dayCount = new Set((routine.exercises || []).map((e: any) => e.day_of_week)).size;
                        const rating = routine.average_rating || 0;

                        return (
                            <div key={routine.id} onClick={() => setSelected(routine)}
                                style={{
                                    background: 'var(--card)', border: `1px solid ${isCurrent ? 'color-mix(in oklch, var(--accent) 32%, var(--line))' : 'var(--line)'}`,
                                    borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                                }}>
                                {/* Card photo */}
                                <div style={{
                                    height: 120, padding: 10, position: 'relative',
                                    backgroundImage: `url("${imgUrl}")`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}/>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                                        {isCurrent && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 700,
                                                letterSpacing: '0.08em', background: 'var(--accent)',
                                                color: 'var(--accent-ink)', padding: '3px 7px', borderRadius: 5,
                                            }}>● ACTIVE</span>
                                        )}
                                        {isPredef && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                                                background: 'rgba(0,0,0,0.55)', color: '#fff',
                                                padding: '3px 7px', borderRadius: 5,
                                            }}>★ Official</span>
                                        )}
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                                        <div className="num" style={{ fontSize: 11, fontWeight: 600 }}>{dayCount}d</div>
                                        {rating > 0 && (
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
                                                <Star size={10} fill="#fff" stroke="#fff"/>
                                                {rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ padding: '10px 12px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2, color: 'var(--fg)' }}>{routine.name}</div>
                                    {routine.difficulty && (
                                        <div style={{ fontSize: 10, color: 'var(--fg-dim)', marginTop: 2, textTransform: 'capitalize' }}>{routine.difficulty}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
