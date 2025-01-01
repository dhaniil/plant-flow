import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class JadwalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
        
        // Log error ke service monitoring jika ada
        console.error('Jadwal Error:', error);
        console.error('Error Info:', errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">
                            Terjadi Kesalahan
                        </h2>
                        
                        <div className="bg-red-50 p-4 rounded-lg mb-4">
                            <p className="text-red-700 mb-2">
                                {this.state.error?.message || 'Terjadi kesalahan yang tidak diketahui'}
                            </p>
                            {this.state.errorInfo && (
                                <details className="mt-2">
                                    <summary className="text-sm text-red-600 cursor-pointer">
                                        Detail Error
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-800 overflow-auto max-h-40">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Muat Ulang Halaman
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default JadwalErrorBoundary; 