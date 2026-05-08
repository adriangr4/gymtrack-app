import { Home, Dumbbell, Utensils, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const TABS = [
    { id: 'home',      to: '/',          Icon: Home,     label: 'Home'      },
    { id: 'library',   to: '/library',   Icon: Dumbbell, label: 'Library'   },
    { id: 'diet',      to: '/diet',      Icon: Utensils, label: 'Diet'      },
    { id: 'community', to: '/community', Icon: Users,    label: 'Community' },
] as const;

const MAIN_PATHS = ['/', '/library', '/diet', '/community', '/profile'];

export function BottomNav() {
    const location = useLocation();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const show = (e: FocusEvent) => {
            const t = e.target as HTMLElement;
            if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') setKeyboardVisible(true);
        };
        const hide = () => setKeyboardVisible(false);
        window.addEventListener('focusin', show);
        window.addEventListener('focusout', hide);
        return () => { window.removeEventListener('focusin', show); window.removeEventListener('focusout', hide); };
    }, []);

    if (!MAIN_PATHS.includes(location.pathname)) return null;

    return (
        <nav
            className={cn(
                'fixed left-4 right-4 z-40 transition-all duration-300',
                keyboardVisible ? '-bottom-24 opacity-0 pointer-events-none' : 'bottom-5 opacity-100',
            )}
        >
            <div
                className="flex items-center justify-around h-16 rounded-[28px] border px-2"
                style={{
                    background: 'var(--card)',
                    borderColor: 'var(--line-2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                {TABS.map(({ id, to, Icon, label }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={id}
                            to={to}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 group"
                        >
                            <div
                                className="flex items-center justify-center w-11 h-9 rounded-2xl transition-all duration-200"
                                style={active ? {
                                    background: 'color-mix(in oklch, var(--accent) 18%, transparent)',
                                    color: 'var(--accent)',
                                } : {
                                    color: 'var(--fg-dim)',
                                }}
                            >
                                <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                            </div>
                            <span
                                className="text-[10px] font-semibold tracking-wide transition-colors"
                                style={{ color: active ? 'var(--accent)' : 'var(--fg-dim)' }}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
