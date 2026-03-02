'use client';

import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

export default function Home() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <div className="w-full max-w-md p-4">
        {isLoginView ? (
          <LoginForm onSwitchToSignup={() => setIsLoginView(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLoginView(true)} />
        )}
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>UniLink - Transforming Education Across Africa</p>
          <p className="mt-2">Connecting students and teachers for personalized learning experiences</p>
        </div>
      </div>
    </div>
  );
}
