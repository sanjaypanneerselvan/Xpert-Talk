import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const loc = useLocation();
    const from = loc.state?.from?.pathname || "/";


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            nav(from, { replace: true });
        } catch (err: any) {
            console.error("Login error:", err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900">
            {/* Left Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white z-10">
                <div className="max-w-md w-full space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase border-l-8 border-slate-950 pl-6">Xpertio</h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">Internal Communication Portal</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm font-bold flex items-center space-x-3">
                                <span className="flex-1">{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                        <Mail size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white transition-all outline-none text-sm font-bold placeholder-slate-300"
                                        placeholder="user@xpertio.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                        <Lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white transition-all outline-none text-sm font-bold placeholder-placeholder-slate-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-slate-950 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center space-x-3 group uppercase tracking-widest text-xs"
                        >
                            <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                            {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="pt-12 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                            Xpertio Strategic Command Center <br />
                            Internal Access Only
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Visual/Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-24">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800 rounded-full blur-[120px] -mr-96 -mt-96"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-900 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-[12rem] font-black text-white/5 tracking-tighter leading-none select-none"
                    >
                        Xpertio
                    </motion.div>
                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white tracking-tight">Professional. <br />Seamless. Secure.</h2>
                        <p className="text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
                            A dedicated environment for internal coordination and executive decision making.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-12 right-12 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
                    &copy; 2026 Corporate Solutions
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
