import React from 'react';
import {
    Mail,
    Shield,
    TrendingUp,
    Clock,
    Camera,
    Award,
    Bell,
    Lock,
    BellOff,
    Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useJobCards } from '../hooks/useJobCards';
import { useNotifications } from '../hooks/useNotifications';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const ProfilePage: React.FC = () => {
    const { profile } = useAuth();
    const { tasks } = useJobCards();
    const { permission, requestPermission, showNotification } = useNotifications();
    const userTasks = tasks.filter(t => t.assignedTo === profile?.email);
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;

    const stats = [
        { label: 'Productivity', value: profile?.productivityScore || 0, icon: TrendingUp, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Tasks Done', value: completedTasks, icon: Award, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Rank', value: profile?.role?.split(' ')[0] || 'Member', icon: Shield, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Active Jobs', value: userTasks.length - completedTasks, icon: Clock, color: 'text-slate-900', bg: 'bg-slate-50' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Profile Header */}
            <div className="relative h-48 md:h-64 bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl">
                <div className="absolute -bottom-16 md:-bottom-20 left-0 right-0 md:left-12 md:right-auto px-6 md:px-0 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-52 md:h-52 rounded-[2rem] md:rounded-[3.5rem] bg-white p-2 md:p-3 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                            <div className="w-full h-full rounded-[1.6rem] md:rounded-[2.8rem] bg-slate-50 flex items-center justify-center text-slate-300 text-4xl md:text-6xl font-black border-2 md:border-4 border-slate-100 overflow-hidden relative shadow-inner">
                                {profile?.photoURL ? (
                                    <img
                                        src={profile.photoURL}
                                        alt={profile.displayName || 'Profile'}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    (profile?.displayName?.charAt(0) || '').toUpperCase()
                                )}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-slate-400/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-500"></div>
                        <button className="absolute -bottom-1 -right-1 md:bottom-2 md:right-2 p-2.5 md:p-3 bg-slate-900 text-white rounded-xl md:rounded-2xl shadow-xl hover:bg-black transition-all border-2 md:border-4 border-white active:scale-90">
                            <Camera size={18} />
                        </button>
                    </div>
                    <div className="mb-0 md:mb-24 text-center md:text-left relative z-20">
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 md:text-white tracking-tighter uppercase md:drop-shadow-lg">{profile?.displayName}</h1>
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mt-3 md:mt-4">
                            <div className="px-4 py-1.5 bg-slate-100 md:bg-white/10 md:backdrop-blur-md text-slate-600 md:text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.2em] border border-slate-200 md:border-white/20 shadow-sm md:shadow-lg">
                                {profile?.role}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 md:text-slate-300 text-xs md:text-sm font-bold tracking-tight bg-slate-50 md:bg-black/20 px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl md:backdrop-blur-sm border border-slate-200 md:border-white/5">
                                <Mail size={14} className="text-primary-400" />
                                {profile?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-32 md:pt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Left Column: Stats & Meta */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={stat.label}
                                className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                            >
                                <div className={clsx("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                                    <stat.icon className={clsx("w-6 h-6 md:w-7 md:h-7", stat.color)} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Access History</h2>
                            <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Full Audit</button>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Secure Internal Login</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified IP: 192.168.1.{i * 12}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">2h ago</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Preferences */}
                <div className="space-y-10">
                    <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                        <h3 className="text-xl font-black tracking-tight mb-8 relative z-10">Account Settings</h3>
                        <div className="space-y-4 relative z-10">
                            <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-slate-400" />
                                    <span className="text-sm font-bold">Security Key</span>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Verified</span>
                            </button>
                            <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} className="text-slate-400" />
                                    <span className="text-sm font-bold">Notifications</span>
                                </div>
                                <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Notification Settings</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status & Testing</p>
                            </div>
                            <div className={clsx(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                permission === 'granted' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                {permission}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {permission !== 'granted' ? (
                                <button
                                    onClick={() => requestPermission()}
                                    className="w-full p-6 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-900/10 active:scale-95"
                                >
                                    <BellOff size={20} />
                                    Enable Real-Time Alerts
                                </button>
                            ) : (
                                <button
                                    onClick={() => showNotification("Test Notification", {
                                        body: "This is a tactical test message to verify your browser setup. It's working! 🚀",
                                        icon: '/favicon.svg'
                                    })}
                                    className="w-full p-6 bg-slate-900 hover:bg-black text-white rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10 active:scale-95"
                                >
                                    <Send size={20} />
                                    Send Test Notification
                                </button>
                            )}
                            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest leading-relaxed px-4">
                                {permission === 'granted'
                                    ? "Notifications are active. Click test to verify visibility on your system."
                                    : "Permissions are currently restricted. enable them to see messages and task updates."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Profile Management</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Manage your professional identity and personal settings. Maintain consistent activity for comprehensive tracking.
                        </p>
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                Update Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
