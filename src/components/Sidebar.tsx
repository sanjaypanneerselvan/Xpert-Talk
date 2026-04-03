import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    MessageSquare,
    Lightbulb,
    FileText,
    LogOut,
    Shield,
    Activity,
    FolderKanban,
    User as UserIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
        { to: '/chat', icon: MessageSquare, label: 'Messages' },
        { to: '/moms', icon: FileText, label: 'Minutes' },
        { to: '/activity', icon: Activity, label: 'Activity' },
        { to: '/projects', icon: FolderKanban, label: 'Projects' },
    ];

    return (
        <aside className="w-72 h-full bg-slate-950 flex flex-col border-r border-slate-900 z-[100] relative">
            <div className="p-8 pb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                        <Shield className="text-slate-900" size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Xpertio</h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-4">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 group",
                            isActive
                                ? "bg-white text-slate-950 font-bold"
                                : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon size={20} strokeWidth={2} />
                        <span className="text-sm tracking-tight">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-900 bg-black/10">
                <NavLink
                    to="/profile"
                    className={({ isActive }) => clsx(
                        "flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 mb-2",
                        isActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-500 hover:text-white"
                    )}
                >
                    <UserIcon size={18} />
                    <span className="text-xs font-bold">Profile</span>
                </NavLink>

                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all transition-colors"
                >
                    <LogOut size={18} />
                    <span className="text-xs font-bold">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
