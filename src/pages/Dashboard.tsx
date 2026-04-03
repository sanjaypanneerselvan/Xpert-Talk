import React from 'react';
import {
    Activity,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    MessageSquare,
    Shield,
    Globe,
    Target
} from 'lucide-react';
import { useJobCards } from '../hooks/useJobCards';
import { useProjects } from '../hooks/useProjects';
import { useChat } from '../hooks/useChat';
import { useActivity } from '../hooks/useActivity';
import { SYSTEM_USERS } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';

const Dashboard: React.FC = () => {
    const { projects } = useProjects();
    const { tasks } = useJobCards();
    const { messages } = useChat();
    const { logs } = useActivity();

    const pendingTasks = tasks.filter(t => t.status === 'Pending');
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const ongoingProjects = projects.filter(p => p.status === 'Ongoing');

    const totalTasks = tasks.length || 1; // avoid division by zero
    const taskDist = [
        { label: 'Pending', count: pendingTasks.length, color: 'bg-rose-500', percent: (pendingTasks.length / totalTasks) * 100 },
        { label: 'Completed', count: completedTasks.length, color: 'bg-emerald-500', percent: (completedTasks.length / totalTasks) * 100 },
        { label: 'In Progress', count: inProgressTasks.length, color: 'bg-blue-500', percent: (inProgressTasks.length / totalTasks) * 100 },
    ];

    const upcomingDeadlines = [...projects]
        .filter(p => p.deadline && p.status === 'Ongoing')
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3);

    const totalMessages = messages.length;

    // Simplified activity calculation for line graph
    const activityTrend = [40, 25, 60, 45, 90, 55, 80];

    const stats = [
        { label: 'Pending Tasks', value: pendingTasks.length, change: 'Action Required', icon: Target, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Ongoing Projects', value: ongoingProjects.length, change: 'Stable', icon: Activity, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'Live Messages', value: totalMessages, change: 'Syncing', icon: MessageSquare, color: 'text-slate-900', bg: 'bg-slate-50' },
        { label: 'System Access', value: 'Verified', change: 'Optimal', icon: Shield, color: 'text-slate-900', bg: 'bg-slate-50' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <Shield size={12} className="text-slate-400" />
                            Secure Environment • Level 5 Access
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h1>
                    <p className="text-slate-500 font-medium tracking-tight text-sm">Internal coordination and project overview.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm w-fit lg:w-auto">
                    <div className="text-right px-4 border-r border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
                        <p className="text-xs font-black text-emerald-500 uppercase mt-0.5">Systems Nominal</p>
                    </div>
                    <Globe size={24} className="text-slate-400 animate-spin-slow" />
                </div>
            </div>

            {/* Tactical Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    >
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                            <div className={clsx("text-xs font-black px-2.5 py-1 rounded-full", stat.color, stat.bg)}>
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col h-[380px]">
                        <div className="absolute top-0 right-0 p-8">
                            <ArrowUpRight className="text-primary-500" size={32} />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-black tracking-tight mb-1 uppercase">Operational Velocity</h3>
                                <p className="text-slate-400 text-[10px] font-medium">Internal coordination performance.</p>
                            </div>

                            <div className="relative h-32 md:h-40 flex-1 mt-2">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M 0 200 ${activityTrend.map((v, i) => `L ${i * 115} ${200 - (v / 100) * 150}`).join(' ')} L 700 200 Z`}
                                        fill="url(#lineGradient)"
                                    />
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                        d={`M 0 ${200 - (activityTrend[0] / 100) * 150} ${activityTrend.map((v, i) => `L ${i * 115} ${200 - (v / 100) * 150}`).join(' ')}`}
                                        fill="none"
                                        stroke="#38bdf8"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className="flex justify-between mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                    <span>Sun</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Data: Task Status Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Task Distribution</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-module status tracking</p>
                            </div>
                            <div className="space-y-6">
                                {taskDist.map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                            <span className="text-slate-500">{item.label}</span>
                                            <span className="text-slate-900">{item.count} items</span>
                                        </div>
                                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percent}%` }}
                                                className={clsx("h-full rounded-full transition-all duration-1000", item.color)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Upcoming Deadlines</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Strategic milestones</p>
                            </div>
                            <div className="space-y-4">
                                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{p.title}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.deadline}</p>
                                        </div>
                                        <Clock size={16} className="text-slate-400 flex-shrink-0" />
                                    </div>
                                )) : (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No immediate deadlines</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Operational Feed */}
                    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Recent Activity</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Live tracking of system events</p>
                            </div>
                            <button className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Audit Log</button>
                        </div>
                        <div className="space-y-8">
                            {logs.slice(0, 7).map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={log.id}
                                    className="flex items-center gap-6 group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                        {log.action?.includes('Task') ? <CheckCircle2 size={24} /> : <Activity size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900 leading-none tracking-tight">{log.userName} <span className="text-slate-400 font-bold ml-1 italic tracking-tight">{log.action}</span></p>
                                        <p className="text-xs text-slate-500 mt-2 font-medium tracking-tight">{log.details}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {log.timestamp && typeof log.timestamp.toDate === 'function' ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Priority Reminders */}
                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="mb-10">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Priority Alerts</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending items requiring review</p>
                        </div>

                        <div className="space-y-4">
                            {pendingTasks.slice(0, 3).map((task) => (
                                <div key={task.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-slate-900 transition-all duration-300">
                                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 group-hover:text-rose-400">Task Pending</p>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-white leading-tight">{task.title}</p>
                                </div>
                            ))}
                            {ongoingProjects.slice(0, 2).map((project) => (
                                <div key={project.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-indigo-600 transition-all duration-300">
                                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1 group-hover:text-indigo-200">Ongoing Project</p>
                                    <p className="text-sm font-black text-slate-900 group-hover:text-white leading-tight">{project.title}</p>
                                </div>
                            ))}
                            {pendingTasks.length === 0 && ongoingProjects.length === 0 && (
                                <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                    <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All Clear</p>
                                </div>
                            )}
                        </div>

                        {/* Team Section */}
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Decision Makers</p>
                            <div className="flex -space-x-3 relative z-10">
                                {Object.values(SYSTEM_USERS).map((u, i) => (
                                    <div key={i} className="h-10 w-10 rounded-2xl border-2 border-white bg-slate-900 flex items-center justify-center text-xs font-black text-white shadow-xl overflow-hidden ring-1 ring-slate-100 transition-transform hover:scale-110 hover:z-20 cursor-pointer group">
                                        {u.photo ? (
                                            <img src={u.photo} alt={u.name} className="h-full w-full object-cover" />
                                        ) : (
                                            u.name.charAt(0).toUpperCase()
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[8px] text-white uppercase">{u.name.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-slate-50">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Internal Update</p>
                                <p className="text-xs text-slate-900 font-bold leading-relaxed italic tracking-tight">"All project streams are active. Ensure high-priority items are addressed."</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Progress Block */}
                    <div className="bg-slate-900 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <Clock size={40} className="mb-6 opacity-40 text-slate-400" />
                        <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">Operational Flow</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 tracking-tight">Performance metrics indicate consistent tactical progress across all project streams.</p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '74%' }}
                                transition={{ duration: 2, ease: 'circOut' }}
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
