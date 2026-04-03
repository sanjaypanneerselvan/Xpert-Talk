import React, { useState } from 'react';
import {
    Search,
    Plus,
    X,
    FolderKanban,
    Download,
    Calendar,
    Edit3,
    CheckCircle2,
    Clock,
    AlertCircle,
    Archive
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import type { Project } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProjectsPage: React.FC = () => {
    const { projects, addProject, updateProject } = useProjects();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [detailedDescription, setDetailedDescription] = useState('');
    const [status, setStatus] = useState<Project['status']>('Ongoing');
    const [deadline, setDeadline] = useState('');
    const [teamMembers, setTeamMembers] = useState('');

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status: Project['status']) => {
        switch (status) {
            case 'Ongoing': return {
                bg: 'bg-indigo-600',
                text: 'text-indigo-600',
                border: 'border-indigo-100',
                icon: Clock
            };
            case 'Completed': return {
                bg: 'bg-emerald-600',
                text: 'text-emerald-600',
                border: 'border-emerald-100',
                icon: CheckCircle2
            };
            case 'On Hold': return {
                bg: 'bg-amber-600',
                text: 'text-amber-600',
                border: 'border-amber-100',
                icon: AlertCircle
            };
            case 'Archived': return {
                bg: 'bg-slate-600',
                text: 'text-slate-600',
                border: 'border-slate-100',
                icon: Archive
            };
        }
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await addProject({
                title,
                description,
                detailedDescription,
                status,
                deadline,
                teamMembers: teamMembers.split(',').map(m => m.trim()).filter(m => m)
            });
            resetForm();
            setShowAddModal(false);
        } catch (err: any) {
            setError(err.message || 'Failed to initialize project. Please try again.');
        }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;
        setError(null);
        try {
            await updateProject(selectedProject.id, {
                title,
                description,
                detailedDescription,
                status,
                deadline,
                teamMembers: teamMembers.split(',').map(m => m.trim()).filter(m => m)
            });
            setIsEditing(false);
            setShowDetailModal(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update project.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDetailedDescription('');
        setStatus('Ongoing');
        setDeadline('');
        setTeamMembers('');
    };

    const openEdit = (project: Project) => {
        setSelectedProject(project);
        setTitle(project.title);
        setDescription(project.description);
        setDetailedDescription(project.detailedDescription);
        setStatus(project.status);
        setDeadline(project.deadline || '');
        setTeamMembers(project.teamMembers.join(', '));
        setIsEditing(true);
        setShowDetailModal(true);
    };

    const downloadPDF = (project: Project) => {
        try {
            const doc = new jsPDF();

            // Header Decoration
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setFontSize(24);
            doc.setTextColor(255, 255, 255);
            doc.text(project.title.toUpperCase(), 20, 25);

            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.text(`PROJECT REPORT | ${new Date().toLocaleDateString()}`, 20, 32);

            // Secondary Header
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`STATUS: ${project.status.toUpperCase()}`, 20, 50);
            doc.text(`DEADLINE: ${project.deadline || 'NOT SET'}`, 120, 50);

            // Horizontal Line
            doc.setDrawColor(230);
            doc.line(20, 55, 190, 55);

            // Summary
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text("EXECUTIVE SUMMARY", 20, 70);
            doc.setFontSize(11);
            doc.setTextColor(80);
            const splitSummary = doc.splitTextToSize(project.description, 170);
            doc.text(splitSummary, 20, 78);

            // Detailed Description
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text("FULL PROJECT ANALYSIS", 20, 110);
            doc.setFontSize(10);
            doc.setTextColor(80);
            const splitDetailed = doc.splitTextToSize(project.detailedDescription, 170);
            doc.text(splitDetailed, 20, 118);

            // Team Table
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text("PROJECT TEAM", 20, 200);

            autoTable(doc, {
                startY: 205,
                head: [['Team Member', 'Role']],
                body: project.teamMembers.map(m => [m, 'Member']),
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] }
            });

            doc.save(`${project.title.replace(/\s+/g, '_')}_Analysis.pdf`);
        } catch (err: any) {
            console.error('PDF Generation Failed:', err);
            setError('Failed to generate PDF. Please ensure all content is valid.');
        }
    };

    return (
        <div className="p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                            <FolderKanban size={24} />
                        </div>
                        Strategic Projects
                    </h1>
                    <p className="text-slate-500 font-medium mt-3 ml-16">Oversee ongoing transformations and detailed roadmaps.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative group flex-1 md:min-w-[350px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" size={18} />
                        <input
                            type="text"
                            placeholder="Find a project..."
                            className="bg-white border border-slate-200 pl-12 pr-6 py-3.5 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/5 outline-none w-full shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsEditing(false); setShowAddModal(true); }}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Launch Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => {
                        const styles = getStatusStyles(project.status);
                        const StatusIcon = styles.icon;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={project.id}
                                className={clsx(
                                    "group p-8 rounded-2xl border border-slate-100 transition-all duration-300 relative overflow-hidden bg-white shadow-sm hover:shadow-lg cursor-pointer"
                                )}
                                onClick={() => { setSelectedProject(project); setIsEditing(false); setShowDetailModal(true); }}
                            >
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className={clsx(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm bg-white",
                                        styles.text,
                                        styles.border
                                    )}>
                                        <StatusIcon size={12} strokeWidth={3} />
                                        {project.status}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadPDF(project); }}
                                        className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-black transition-colors leading-tight tracking-tight relative z-10">
                                    {project.title}
                                </h3>
                                <p className="text-[13px] text-slate-500 mb-10 leading-relaxed line-clamp-3 font-medium tracking-tight relative z-10">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-200/50 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {project.teamMembers.slice(0, 3).map((member, i) => (
                                                <div key={i} className="w-9 h-9 rounded-xl bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">
                                                    {member.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {project.teamMembers.length > 3 && (
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 shadow-md">
                                                    +{project.teamMembers.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                        <Calendar size={14} />
                                        {project.deadline || 'No Date'}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Modals Implementation... */}
            <AnimatePresence>
                {(showAddModal || (showDetailModal && isEditing)) && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowAddModal(false); setShowDetailModal(false); }}
                            className="fixed inset-0 bg-slate-900/40 z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[110] overflow-hidden border border-slate-100"
                        >
                            <form onSubmit={isEditing ? handleUpdateProject : handleAddProject} className="p-12">
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        {isEditing ? 'Edit Project' : 'New Strategic Project'}
                                    </h2>
                                    <button onClick={() => { setShowAddModal(false); setShowDetailModal(false); setError(null); }} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Project Title</label>
                                        <input
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Summary</label>
                                        <textarea
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-medium text-slate-900 h-24 resize-none"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Detailed Roadmap & Analysis</label>
                                        <textarea
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-medium text-slate-900 h-48 resize-none"
                                            value={detailedDescription}
                                            onChange={(e) => setDetailedDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Status</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as any)}
                                        >
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Deadline</label>
                                        <input
                                            type="date"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Team Members (Comma separated)</label>
                                        <input
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-slate-500/10 outline-none font-bold text-slate-900"
                                            value={teamMembers}
                                            onChange={(e) => setTeamMembers(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 text-xs"
                                >
                                    {isEditing ? 'Save Changes' : 'Initialize Project'}
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}

                {showDetailModal && selectedProject && !isEditing && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 bg-slate-900/40 z-[150]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-3xl shadow-2xl z-[160] overflow-hidden border border-slate-100"
                        >
                            <div className="p-12 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-12">
                                    <div className={clsx(
                                        "px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm bg-white",
                                        getStatusStyles(selectedProject.status).text,
                                        getStatusStyles(selectedProject.status).border
                                    )}>
                                        {selectedProject.status} Phase
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => openEdit(selectedProject)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => downloadPDF(selectedProject)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-900/20"
                                        >
                                            <Download size={20} />
                                        </button>
                                        <button onClick={() => setShowDetailModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-6">{selectedProject.title}</h2>
                                        <div className="flex flex-wrap gap-8 items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                    {selectedProject.ownerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Owner</p>
                                                    <p className="text-[15px] font-black text-slate-900 mt-1">{selectedProject.ownerName}</p>
                                                </div>
                                            </div>
                                            <div className="w-px h-10 bg-slate-200" />
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Deadline</p>
                                                    <p className="text-[15px] font-black text-slate-900 mt-1">{selectedProject.deadline || 'Flexible'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">Executive Summary</h3>
                                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                            <p className="text-slate-600 leading-relaxed font-medium text-[15px]">{selectedProject.description}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">Detailed Roadmap & Analysis</h3>
                                        <div className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-inner">
                                            <p className="text-slate-700 leading-relaxed font-medium text-[15px] whitespace-pre-wrap">{selectedProject.detailedDescription}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest ml-2">Project Team</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedProject.teamMembers.map((member, i) => (
                                                <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                                        {member.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{member}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsPage;
