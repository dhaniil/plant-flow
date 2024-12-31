import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state sehingga render berikutnya akan menampilkan fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Anda bisa log error ke service error reporting di sini
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', info);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-green-100/70 font-Poppins flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
              Terjadi Kesalahan
            </h2>
            
            <p className="text-green-600 mb-6">
              {this.state.error?.message || 'Telah terjadi kesalahan yang tidak diketahui'}
            </p>
            
            <div className="space-x-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Coba Lagi
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
