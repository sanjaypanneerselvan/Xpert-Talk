import React from 'react';
import { useActivity } from '../hooks/useActivity';
import { formatDistanceToNow } from 'date-fns';

const ActivityPage: React.FC = () => {
    const { logs } = useActivity();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log</h1>
                <p className="text-slate-500 mt-1 font-medium">Record of internal system activity.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                                <th className="px-8 py-4">User</th>
                                <th className="px-8 py-4">Action</th>
                                <th className="px-8 py-4">Details</th>
                                <th className="px-8 py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                                                {(log.userName?.charAt(0) || '').toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <p className="text-sm text-slate-500">{log.details}</p>
                                    </td>
                                    <td className="px-8 py-4 text-xs font-medium text-slate-400">
                                        {log.timestamp && typeof log.timestamp.toDate === 'function' ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;
