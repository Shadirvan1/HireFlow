import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6">
      <div className="text-center">
        {/* Animated Icon or Image */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-600 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h1 className="text-8xl font-black text-gray-200">404</h1>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Not Found</h2>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable .
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;