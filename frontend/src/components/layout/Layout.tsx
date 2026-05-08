import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
    return (
        <div className="flex justify-center min-h-screen bg-background">
            <div className="w-full max-w-md min-h-screen bg-background text-foreground relative shadow-2xl overflow-hidden border-x border-white/5">
                {}

                <main className="flex-1 overflow-y-auto no-scrollbar" style={{ height: '100dvh' }}>
                    <Outlet />
                </main>

                <BottomNav />
            </div>
        </div>
    );
}
