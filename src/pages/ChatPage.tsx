import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Hash,
    CheckCheck,
    Search,
    Shield,
    ChevronDown
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage: React.FC = () => {
    const { profile } = useAuth();
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const { messages, users, sendMessage } = useChat(selectedRecipient || undefined);
    const [input, setInput] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    const currentRecipient = users.find(u => u.uid === selectedRecipient);
    const filteredUsers = users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Sidebar: Message Contacts (Desktop Only) */}
            <div className="w-96 border-r border-slate-100 hidden md:flex flex-col bg-slate-50/30">
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-6">Messages</h2>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search teammates..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-slate-500/10 outline-none transition-all placeholder:text-slate-400"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 mt-4">
                    <button
                        onClick={() => setSelectedRecipient(null)}
                        className={clsx(
                            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                            !selectedRecipient
                                ? "bg-white shadow-xl shadow-slate-200 text-slate-900 border border-slate-100"
                                : "text-slate-500 hover:bg-white/50"
                        )}
                    >
                        <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                            !selectedRecipient ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                            <Hash size={24} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="font-black text-sm tracking-tight">General</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Team channel</p>
                        </div>
                    </button>

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Teammates</p>
                    </div>

                    {filteredUsers.map(user => (
                        <button
                            key={user.uid}
                            onClick={() => setSelectedRecipient(user.uid)}
                            className={clsx(
                                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                                selectedRecipient === user.uid
                                    ? "bg-white shadow-xl shadow-slate-200 text-slate-900 border border-slate-100"
                                    : "text-slate-500 hover:bg-white/50"
                            )}
                        >
                            <div className="relative">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-md border-2",
                                    selectedRecipient === user.uid ? "bg-slate-900 text-white border-slate-800" : "bg-white text-slate-600 border-slate-100"
                                )}>
                                    {(user.displayName?.charAt(0) || '').toUpperCase()}
                                </div>
                                {user.online && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-black text-sm tracking-tight truncate">{user.displayName}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Engine */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Channel Header */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white relative">
                    <div className="flex items-center gap-5">
                        {selectedRecipient ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-4 text-left group md:pointer-events-none"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-base shadow-xl shadow-slate-900/20 border border-slate-800">
                                        {(currentRecipient?.displayName?.charAt(0) || '').toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase truncate max-w-[150px] sm:max-w-none">{currentRecipient?.displayName}</h3>
                                            <ChevronDown size={16} className={clsx("text-slate-400 md:hidden transition-transform", showUserDropdown && "rotate-180")} />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={clsx("w-2 h-2 rounded-full", currentRecipient?.online ? 'bg-emerald-500' : 'bg-slate-300')} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentRecipient?.online ? 'Online' : 'Offline'}</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    className="flex items-center gap-4 text-left group md:pointer-events-none"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black shadow-xl shadow-slate-900/20 border border-slate-800">
                                        <Shield size={22} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">General</h3>
                                            <ChevronDown size={16} className={clsx("text-slate-400 md:hidden transition-transform", showUserDropdown && "rotate-180")} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Global Stream</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {showUserDropdown && (
                        <div className="md:hidden">
                            <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setShowUserDropdown(false)} />
                            <div className="absolute top-[calc(100%+8px)] left-6 right-6 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Switch Channel</p>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => { setSelectedRecipient(null); setShowUserDropdown(false); }}
                                        className={clsx(
                                            "w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors",
                                            !selectedRecipient && "bg-slate-50"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                            <Shield size={18} />
                                        </div>
                                        <div className="text-left font-black text-xs uppercase tracking-tight">General Channel</div>
                                    </button>
                                    
                                    <div className="px-5 py-3 bg-white">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Teammates</p>
                                    </div>

                                    {users.map(user => (
                                        <button
                                            key={user.uid}
                                            onClick={() => { setSelectedRecipient(user.uid); setShowUserDropdown(false); }}
                                            className={clsx(
                                                "w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors",
                                                selectedRecipient === user.uid && "bg-slate-50 text-slate-900"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-xs uppercase text-slate-400 shadow-sm">
                                                {(user.displayName?.charAt(0) || '').toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-xs uppercase tracking-tight">{user.displayName}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Feed */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-8 bg-white"
                >
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center opacity-40">
                                <div>
                                    <p className="text-lg font-black text-slate-400 tracking-tight uppercase">No communications found</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Awaiting project entries...</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderId === profile?.uid;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        key={msg.id}
                                        className={clsx("flex flex-col max-w-[85%] lg:max-w-[70%]", isMe ? "ml-auto items-end" : "items-start")}
                                    >
                                        {!isMe && !selectedRecipient && (
                                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-2">{msg.senderName}</p>
                                        )}
                                        <div className={clsx(
                                            "p-5 rounded-[2rem] text-sm font-medium leading-relaxed transition-all relative group tracking-tight shadow-sm",
                                            isMe
                                                ? "bg-slate-900 text-white rounded-tr-none"
                                                : "bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100"
                                        )}>
                                            <p>{msg.text}</p>
                                        </div>
                                        <div className={clsx("flex items-center gap-3 mt-3 px-2", isMe ? "flex-row-reverse" : "")}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {msg.timestamp ? format(msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(), 'HH:mm') : 'Syncing'}
                                            </p>
                                            {isMe && <CheckCheck size={14} className="text-slate-400" />}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="p-8 bg-white border-t border-slate-50">
                    <form onSubmit={handleSend} className="relative max-w-5xl mx-auto">
                        <input
                            type="text"
                            placeholder="Write a message..."
                            className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-slate-500/10 outline-none transition-all font-bold text-slate-900 tracking-tight placeholder:text-slate-400 text-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black disabled:opacity-30 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
