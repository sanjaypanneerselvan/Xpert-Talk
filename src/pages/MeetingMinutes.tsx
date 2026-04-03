import React, { useState } from 'react';
import { Plus, ChevronRight, X, User as UserIcon } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingMinutes: React.FC = () => {
    const { moms, addMoM } = useCollaboration();
    const [showAdd, setShowAdd] = useState(false);
    const [newMoM, setNewMoM] = useState({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd'), tags: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMoM.title && newMoM.content) {
            await addMoM(newMoM.title, newMoM.content, newMoM.date, newMoM.tags.split(',').map(t => t.trim()));
            setNewMoM({ title: '', content: '', date: format(new Date(), 'yyyy-MM-dd'), tags: '' });
            setShowAdd(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Meeting Minutes</h1>
                    <p className="text-slate-500 mt-1 font-medium tracking-tight">Archive of team meetings and discussions.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:bg-black shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    New Minutes
                </button>
            </div>

            {/* Minutes List */}
            <div className="grid grid-cols-1 gap-6 pb-10">
                {moms.map((mom, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={mom.id}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col lg:flex-row lg:items-center gap-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        {/* Date Chip */}
                        <div className="flex-shrink-0 w-20 h-24 rounded-[1.75rem] bg-slate-900 flex flex-col items-center justify-center text-white shadow-xl shadow-slate-900/10 border border-slate-800">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{format(new Date(mom.date), 'MMM')}</p>
                            <p className="text-3xl font-black">{format(new Date(mom.date), 'dd')}</p>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {mom.tags?.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[10px] font-black text-slate-600 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-slate-700 transition-colors leading-tight tracking-tight">{mom.title}</h3>
                            <p className="text-slate-500 font-medium italic line-clamp-2 leading-relaxed">
                                {mom.content}
                            </p>
                        </div>

                        <div className="flex items-center lg:flex-col lg:items-end gap-6 lg:gap-4 pl-4 lg:pl-0 lg:border-l lg:border-slate-100 pr-2">
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{mom.authorName}</p>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <UserIcon size={20} />
                                </div>
                            </div>

                            <button className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all group-hover:translate-x-1 shadow-sm">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showAdd && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAdd(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-5">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Meeting Minutes</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Record project entries</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAdd(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-colors shadow-sm">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="p-12 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
                                        <input
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 outline-none transition-all tracking-tight"
                                            placeholder="Weekly Sync"
                                            value={newMoM.title}
                                            onChange={(e) => setNewMoM({ ...newMoM, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 outline-none transition-all tracking-tight"
                                                value={newMoM.date}
                                                onChange={(e) => setNewMoM({ ...newMoM, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relevant Tags (comma separated)</label>
                                    <div className="relative">
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 outline-none transition-all tracking-tight"
                                            placeholder="updates, planning, feedback"
                                            value={newMoM.tags}
                                            onChange={(e) => setNewMoM({ ...newMoM, tags: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Notes</label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 focus:ring-4 focus:ring-slate-500/10 outline-none resize-none transition-all tracking-tight"
                                        placeholder="Outline decisions and action items..."
                                        value={newMoM.content}
                                        onChange={(e) => setNewMoM({ ...newMoM, content: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] uppercase tracking-[0.3em] text-xs"
                                >
                                    Save Minutes
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MeetingMinutes;
