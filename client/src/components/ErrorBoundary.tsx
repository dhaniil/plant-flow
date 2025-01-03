import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-gradient-to-br from-red-50 to-red-100 
                        rounded-2xl p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Komponen Gagal Dimuat
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {this.state.error?.message || 
               'Terjadi kesalahan saat memuat komponen ini.'}
            </p>

            <Link 
              to="/error"
              className="inline-block bg-red-500 text-white py-2 px-4 rounded-lg
                        hover:bg-red-600 transition-colors duration-200"
            >
              Lihat Detail Error
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
