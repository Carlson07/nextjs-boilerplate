// ===============================
// 🎯 MAIN APP ENTRY POINT - ENHANCED
// ===============================

import React, { useState, useEffect, useReducer, useCallback, memo, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Error Boundary
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
            <p className="text-neutral-600 mb-6">We're sorry, but there was an error loading the application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-green-600 rounded-full"></div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-neutral-900">Loading UniLink Africa</p>
        <p className="text-sm text-neutral-600">Preparing your learning experience...</p>
      </div>
    </div>
  </div>
);

// Lazy-loaded components for code splitting
const LazyLoginPage = lazy(() => import('./pages/LoginPage'));
const LazySignupPage = lazy(() => import('./pages/SignupPage'));
const LazyMainApp = lazy(() => import('./components/MainApp'));

// Root App Component
const RootApp = () => {
  return (
    <React.StrictMode>
      <EnhancedErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<LazyLoginPage />} />
              <Route path="/signup" element={<LazySignupPage />} />
              <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
              <Route path="/*" element={<LazyMainApp />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </EnhancedErrorBoundary>
    </React.StrictMode>
  );
};

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RootApp />);