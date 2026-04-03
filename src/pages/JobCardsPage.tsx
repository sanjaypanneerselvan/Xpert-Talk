import React, { useState } from 'react';
import {
    Search,
    Calendar,
    ChevronRight,
    Plus,
    X,
    CheckSquare,
    Mail
} from 'lucide-react';
import { useJobCards } from '../hooks/useJobCards';
import { SYSTEM_USERS } from '../hooks/useAuth';
import type { JobStatus, Priority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const JobCardsPage: React.FC = () => {
    const { tasks, updateTaskStatus, addTask, sendReminder } = useJobCards();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority] = useState<Priority | 'All'>('All');
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPriority, setNewPriority] = useState<Priority>('Medium');
    const [newAssignedTo, setNewAssignedTo] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [statusUpdateTaskId, setStatusUpdateTaskId] = useState<string | null>(null);
    const [quickUpdateNote, setQuickUpdateNote] = useState('');
    const [quickUpdateStatus, setQuickUpdateStatus] = useState<JobStatus | ''>('');

    const statuses: JobStatus[] = ['Pending', 'In Progress', 'Completed'];

    const getPriorityStyles = (priority: Priority) => {
        switch (priority) {
            case 'High': return {
                badge: 'bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-500/20',
                card: 'bg-gradient-to-br from-rose-50 to-white border-rose-100 hover:border-rose-400',
                accent: 'bg-rose-500',
                text: 'text-rose-950',
                light: 'bg-rose-100/50'
            };
            case 'Medium': return {
                badge: 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20',
                card: 'bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:border-amber-400',
                accent: 'bg-amber-500',
                text: 'text-amber-950',
                light: 'bg-amber-100/50'
            };
            case 'Low': return {
                badge: 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20',
                card: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:border-emerald-400',
                accent: 'bg-emerald-500',
                text: 'text-emerald-950',
                light: 'bg-emerald-100/50'
            };
            default: return {
                badge: 'bg-slate-500 text-white border-slate-600 shadow-lg shadow-slate-500/20',
                card: 'bg-gradient-to-br from-slate-50 to-white border-slate-100 hover:border-slate-400',
                accent: 'bg-slate-500',
                text: 'text-slate-950',
                light: 'bg-slate-100/50'
            };
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newAssignedTo) return;

        const assignedUser = Object.entries(SYSTEM_USERS).map(([email, info]) => ({
            email,
            displayName: info.name
        })).find(u => u.email === newAssignedTo);

        await addTask({
            title: newTitle,
            description: newDesc,
            priority: newPriority,
            status: 'Pending',
            assignedTo: newAssignedTo,
            assignedToName: assignedUser?.displayName || 'Unknown',
            deadline: newDeadline || null,
        });

        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewPriority('Medium');
        setNewAssignedTo('');
        setNewDeadline('');
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8 mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Project Streams</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Tasks</h1>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-4 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="bg-white border border-slate-200 pl-12 pr-6 py-3.5 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/5 outline-none w-full shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {statuses.map(status => (
                    <div key={status} className="flex flex-col min-h-[500px] bg-slate-100/30 rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "w-3 h-3 rounded-full shadow-sm",
                                    status === 'Completed' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' :
                                        status === 'In Progress' ? 'bg-slate-900 ring-4 ring-slate-900/10' :
                                            'bg-slate-400 ring-4 ring-slate-400/10'
                                )} />
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{status}</h3>
                                <span className="bg-white text-slate-900 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 shadow-sm tabular-nums">
                                    {(filteredTasks ?? []).filter(t => t.status === status).length}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <AnimatePresence mode="popLayout">
                                {filteredTasks
                                    .filter(task => task.status === status)
                                    .map(task => {
                                        const styles = getPriorityStyles(task.priority);
                                        const isUpdating = statusUpdateTaskId === task.id;

                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={task.id}
                                                onClick={() => !isUpdating && (setSelectedTask(task), setShowDetailModal(true))}
                                                className={clsx(
                                                    "group p-7 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1",
                                                    !isUpdating && "cursor-pointer",
                                                    styles.card
                                                )}
                                            >
                                                {/* Background decorative element */}
                                                <div className={clsx("absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-30 -mr-20 -mt-20 transition-all group-hover:scale-150", styles.accent)} />

                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div className={clsx(
                                                        "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-md",
                                                        styles.badge
                                                    )}>
                                                        {task.priority}
                                                    </div>
                                                    {task.deadline && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200">
                                                            <Calendar size={12} />
                                                            {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    )}
                                                </div>

                                                <h4 className={clsx("text-xl font-black mb-3 leading-tight tracking-tight relative z-10", styles.text)}>
                                                    {task.title}
                                                </h4>

                                                {!isUpdating ? (
                                                    <p className="text-[13px] text-slate-600 mb-8 leading-relaxed line-clamp-2 font-medium tracking-tight relative z-10">
                                                        {task.description}
                                                    </p>
                                                ) : (
                                                    <div className="mb-6 space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">New Status</label>
                                                                <select
                                                                    className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900 text-xs tracking-tight h-[46px]"
                                                                    value={quickUpdateStatus}
                                                                    onChange={(e) => setQuickUpdateStatus(e.target.value as JobStatus)}
                                                                >
                                                                    <option value="">Select Status</option>
                                                                    {statuses.map(s => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2 flex flex-col justify-end">
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-tight px-2">Update status and provide details below</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Update Description</label>
                                                            <textarea
                                                                autoFocus
                                                                className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-500/10 outline-none font-medium text-slate-900 h-24 resize-none tracking-tight text-xs"
                                                                placeholder="What's been done?"
                                                                value={quickUpdateNote}
                                                                onChange={(e) => setQuickUpdateNote(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setStatusUpdateTaskId(null);
                                                                    setQuickUpdateNote('');
                                                                    setQuickUpdateStatus('');
                                                                }}
                                                                className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-[9px] border border-slate-100"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (quickUpdateNote.trim() && quickUpdateStatus) {
                                                                        await updateTaskStatus(task.id, quickUpdateStatus, quickUpdateNote.trim());
                                                                        setStatusUpdateTaskId(null);
                                                                        setQuickUpdateNote('');
                                                                        setQuickUpdateStatus('');
                                                                    }
                                                                }}
                                                                disabled={!quickUpdateNote.trim() || !quickUpdateStatus}
                                                                className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 disabled:opacity-30 text-[9px]"
                                                            >
                                                                Confirm Update
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-6 border-t border-slate-300/30 relative z-10">
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className="h-8 w-8 rounded-full bg-slate-900 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-black">
                                                            {(() => {
                                                                const userEntry = Object.entries(SYSTEM_USERS).find(([email]) => email === task.assignedTo);
                                                                const photo = userEntry ? userEntry[1].photo : '';
                                                                return photo ? (
                                                                    <img src={photo} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    task.assignedToName.charAt(0).toUpperCase()
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black text-slate-900 truncate tracking-tight">{task.assignedToName}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Assigned</p>
                                                        </div>
                                                    </div>

                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const success = await sendReminder(task.id);
                                                                    if (success) {
                                                                        alert(`Reminder email sent successfully to ${task.assignedToName}! 📧`);
                                                                    } else {
                                                                        alert('Failed to send reminder.');
                                                                    }
                                                                }}
                                                                title="Send Email Reminder"
                                                                className="flex items-center justify-center w-10 h-10 bg-white text-slate-900 rounded-[1.25rem] border border-slate-200 hover:bg-slate-900 hover:text-white shadow-xl shadow-slate-900/5 active:scale-95"
                                                            >
                                                                <Mail size={16} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStatusUpdateTaskId(task.id);
                                                                    setQuickUpdateNote('');
                                                                    setQuickUpdateStatus(status);
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-[1.25rem] border border-slate-200 hover:bg-slate-900 hover:text-white shadow-xl shadow-slate-900/5 active:scale-95"
                                                            >
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>

                                                    {status === 'Completed' && (
                                                        <div className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-100 rounded-2xl border border-emerald-200">
                                                            <CheckSquare size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategic Milestone Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] z-[110] overflow-hidden border border-white"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Task</h2>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Assign project entry</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddTask} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Task Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900 tracking-tight"
                                            placeholder="e.g., Update project documentation"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                                        <textarea
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-medium text-slate-900 h-32 resize-none tracking-tight"
                                            placeholder="Outline the steps..."
                                            value={newDesc}
                                            onChange={(e) => setNewDesc(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Assign To</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none font-bold text-slate-900 text-sm transition-all h-[58px]"
                                                value={newAssignedTo}
                                                onChange={(e) => setNewAssignedTo(e.target.value)}
                                            >
                                                <option value="">Select Assignee</option>
                                                {Object.entries(SYSTEM_USERS).map(([email, info]) => (
                                                    <option key={email} value={email}>{info.name} ({info.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Priority</label>
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900 tracking-tight"
                                                value={newPriority}
                                                onChange={(e) => setNewPriority(e.target.value as Priority)}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900 tracking-tight"
                                            value={newDeadline}
                                            onChange={(e) => setNewDeadline(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] mt-4 text-xs"
                                    >
                                        Create Task
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedTask && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] z-[160] overflow-hidden border border-white"
                        >
                            <div className="p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                        getPriorityStyles(selectedTask.priority).badge
                                    )}>
                                        {selectedTask.priority} Priority
                                    </div>
                                    <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">{selectedTask.title}</h2>
                                        <div className="flex flex-wrap gap-6 items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                                                    {selectedTask.assignedToName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assigned to</p>
                                                    <p className="text-sm font-black text-slate-900 mt-1">{selectedTask.assignedToName}</p>
                                                </div>
                                            </div>
                                            {selectedTask.deadline && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Deadline</p>
                                                        <p className="text-sm font-black text-slate-900 mt-1">
                                                            {new Date(selectedTask.deadline).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Description</p>
                                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedTask.description}</p>
                                    </div>

                                    {selectedTask.lastUpdateNote && (
                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                                            <div className="flex items-center gap-2 mb-4">
                                                <CheckSquare size={16} className="text-slate-400" />
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest Update Note</p>
                                            </div>
                                            <p className="text-slate-900 leading-relaxed font-bold italic">"{selectedTask.lastUpdateNote}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
};

export default JobCardsPage;
