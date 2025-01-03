import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface ErrorResponse {
  status?: number;
  statusText?: string;
  message?: string;
  error?: {
    message: string;
  };
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as ErrorResponse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 
                    flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full 
                    border border-red-100">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Terjadi Kesalahan
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error.message || error.error?.message || 
             'Maaf, terjadi kesalahan yang tidak diharapkan.'}
          </p>

          <div className="space-y-3 w-full">
            {error.status && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-700">
                  Status: {error.status} {error.statusText}
                </p>
              </div>
            )}
            
            <Link 
              to="/"
              className="block w-full bg-red-500 text-white py-3 px-6 rounded-lg
                        hover:bg-red-600 transition-colors duration-200
                        text-center font-medium"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 