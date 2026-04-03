import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 p-10">
                    <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 shadow-2xl">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">System Anomaly Detected</h1>
                        <p className="text-slate-500 font-medium mb-8">The command center has encountered a strategic runtime exception. Operation has been suspended to prevent data corruption.</p>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-auto max-h-64 mb-8">
                            <code className="text-xs text-rose-600 font-mono font-bold">{this.state.error?.toString()}</code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
                        >
                            Restart Operational Frequency
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
