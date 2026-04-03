import React, { useState } from 'react';
import { Heart, MessageSquare, Send, Plus, X, Clock } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const IdeasBoard: React.FC = () => {
    const { ideas, addIdea, toggleLike, addComment } = useCollaboration();
    const { profile } = useAuth();
    const [showAdd, setShowAdd] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: '', content: '' });
    const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});

    const handleAddIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newIdea.title && newIdea.content) {
            await addIdea(newIdea.title, newIdea.content);
            setNewIdea({ title: '', content: '' });
            setShowAdd(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Ideas</h1>
                    <p className="text-slate-500 mt-1 font-medium tracking-tight">Internal feedback and project concepts.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:bg-black shadow-xl shadow-slate-900/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    New Idea
                </button>
            </div>

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {ideas.map((idea) => {
                    const isLiked = idea.likes.includes(profile?.uid || '');
                    return (
                        <motion.div
                            layout
                            key={idea.id}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden"
                        >
                            <div className="p-8 pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                            {(idea.authorName?.charAt(0) || '').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idea.authorName}</p>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                <Clock size={10} />
                                                {idea.createdAt && typeof idea.createdAt.toDate === 'function' ? formatDistanceToNow(idea.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight tracking-tight group-hover:text-slate-700 transition-colors">
                                    {idea.title}
                                </h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed italic tracking-tight">
                                    "{idea.content}"
                                </p>
                            </div>

                            {/* Interaction Bar */}
                            <div className="px-8 py-4 flex items-center gap-6">
                                <button
                                    onClick={() => toggleLike(idea.id, isLiked)}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                                >
                                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'scale-110' : ''} />
                                    <span>{idea.likes.length} Likes</span>
                                </button>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <MessageSquare size={16} />
                                    <span>{idea.comments.length} Comments</span>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="flex-1 bg-slate-50/50 p-8 space-y-6">
                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                    {idea.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0">
                                                {(comment.authorName?.charAt(0) || '').toUpperCase()}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{comment.authorName}</p>
                                                <p className="text-xs text-slate-600 font-medium leading-relaxed tracking-tight">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative pt-4 border-t border-slate-200/50">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="w-full pl-6 pr-12 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] text-sm font-medium focus:ring-4 focus:ring-slate-500/10 outline-none transition-all"
                                        value={commentInput[idea.id] || ''}
                                        onChange={(e) => setCommentInput({ ...commentInput, [idea.id]: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && commentInput[idea.id]) {
                                                addComment(idea.id, commentInput[idea.id]);
                                                setCommentInput({ ...commentInput, [idea.id]: '' });
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (commentInput[idea.id]) {
                                                addComment(idea.id, commentInput[idea.id]);
                                                setCommentInput({ ...commentInput, [idea.id]: '' });
                                            }
                                        }}
                                        className="absolute right-3 top-[26px] p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Idea</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Submit your feedback</p>
                                </div>
                                <button onClick={() => setShowAdd(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddIdea} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-slate-500/10 outline-none transition-all tracking-tight"
                                        placeholder="e.g. Workflow optimization"
                                        value={newIdea.title}
                                        onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-medium focus:ring-4 focus:ring-slate-500/10 outline-none resize-none transition-all tracking-tight"
                                        placeholder="Describe the core benefits..."
                                        value={newIdea.content}
                                        onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] uppercase tracking-[0.2em] mt-4 text-xs"
                                >
                                    Post Idea
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IdeasBoard;
