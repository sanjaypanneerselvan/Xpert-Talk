import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Search,
    Bell,
    Menu,
    X,
    BellOff,
    Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useActivity } from '../hooks/useActivity';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout: React.FC = () => {
    const { profile } = useAuth();
    const { notifications, markAsRead } = useActivity();
    const { permission, requestPermission } = useNotifications();
    const [showNotifs, setShowNotifs] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { pathname } = useLocation();

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-full">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-80 bg-white z-[70] lg:hidden shadow-2xl"
                        >
                            <div className="absolute right-4 top-4">
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex flex-shrink-0 items-center justify-between px-6 lg:px-10 z-50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:flex items-center max-w-md">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-10 py-2.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-sm bg-slate-50/50 transition-all font-medium min-w-[300px]"
                                    placeholder="Search..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Permission Toggle */}
                        {permission !== 'granted' && (
                            <button
                                onClick={() => requestPermission()}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all relative group"
                                title="Enable Notifications"
                            >
                                <BellOff size={20} />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 border-2 border-white rounded-full animate-pulse"></span>
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className={clsx(
                                    "p-3 rounded-2xl transition-all relative",
                                    showNotifs ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 border-2 border-white rounded-full"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifs && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotifs(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-[22rem] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-lg">Notifications</h3>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daily Updates</p>
                                                </div>
                                                <button onClick={() => setShowNotifs(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-colors shadow-sm">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="max-h-[30rem] overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="p-12 text-center">
                                                        <p className="text-sm text-slate-500 font-bold">No new notifications</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={clsx(
                                                                "p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors relative flex gap-4 transition-all",
                                                                !notif.read && "bg-primary-50/20"
                                                            )}
                                                        >
                                                            <div className="flex-1">
                                                                <p className="text-sm font-black text-slate-900 leading-tight">{notif.title}</p>
                                                                <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">{notif.message}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 mt-2.5 uppercase tracking-widest">
                                                                    {notif.timestamp && typeof notif.timestamp.toDate === 'function' ? formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                                                </p>
                                                            </div>
                                                            {!notif.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <Link
                                                to="/activity"
                                                onClick={() => setShowNotifs(false)}
                                                className="block p-4 text-center text-[10px] font-black text-slate-400 bg-slate-50/50 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]"
                                            >
                                                View all activity
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-10 w-[1px] bg-slate-200 hidden sm:block"></div>

                        {/* User Profile Hook */}
                        <Link to="/profile" className="flex items-center gap-4 group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none group-hover:text-primary-600 transition-colors">{profile?.displayName}</p>
                                <p className="text-[10px] font-black text-primary-600 mt-1.5 uppercase tracking-widest">{profile?.role}</p>
                            </div>
                            <div className="relative">
                                <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-base shadow-xl shadow-primary-900/10 group-hover:scale-110 transition-transform duration-500 overflow-hidden border-2 border-white ring-1 ring-slate-100">
                                    {profile?.photoURL ? (
                                        <img
                                            src={profile.photoURL}
                                            alt={profile.displayName}
                                            className="h-full w-full object-cover object-top"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        (profile?.displayName?.charAt(0) || '').toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-500/20"></div>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="max-w-[120rem] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div >
        </div >
    );
};

export default MainLayout;
