--- app/dashboard/page.tsx (原始)


+++ app/dashboard/page.tsx (修改后)
'use client';

import React from 'react';
import { useAuthStore } from '../store';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    router.push('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Determine dashboard content based on user role and type
  const getDashboardTitle = () => {
    if (user.role === 'student') {
      switch (user.studentType) {
        case 'primary_student':
          return 'Primary Student Dashboard';
        case 'secondary_student':
          return 'Secondary Student Dashboard';
        case 'university_student':
          return `University Student Dashboard - ${user.universityProgram || 'General'}`;
        default:
          return 'Student Dashboard';
      }
    } else if (user.role === 'teacher') {
      switch (user.teacherType) {
        case 'primary_teacher':
          return 'Primary Teacher Dashboard';
        case 'secondary_teacher':
          return 'Secondary Teacher Dashboard';
        case 'lecturer':
          return 'University Lecturer Dashboard';
        default:
          return 'Teacher Dashboard';
      }
    }
    return 'Dashboard';
  };

  const getDashboardContent = () => {
    if (user.role === 'student') {
      return (
        <div className="dashboard-grid">
          <div className="card">
            <h3 className="card-title">My Courses</h3>
            <p className="card-content">Browse and enroll in courses</p>
          </div>
          <div className="card">
            <h3 className="card-title">Learning Progress</h3>
            <p className="card-content">Track your learning journey</p>
          </div>
          <div className="card">
            <h3 className="card-title">Wallet</h3>
            <p className="card-content">Manage your deposits and payments</p>
          </div>
          <div className="card">
            <h3 className="card-title">Achievements</h3>
            <p className="card-content">View your badges and XP</p>
          </div>
          <div className="card">
            <h3 className="card-title">Followed Teachers</h3>
            <p className="card-content">See updates from teachers you follow</p>
          </div>
          <div className="card">
            <h3 className="card-title">Certificates</h3>
            <p className="card-content">Download your earned certificates</p>
          </div>
        </div>
      );
    } else if (user.role === 'teacher') {
      return (
        <div className="dashboard-grid">
          <div className="card">
            <h3 className="card-title">My Courses</h3>
            <p className="card-content">Create and manage your courses</p>
          </div>
          <div className="card">
            <h3 className="card-title">Students</h3>
            <p className="card-content">View and interact with your students</p>
          </div>
          <div className="card">
            <h3 className="card-title">Earnings</h3>
            <p className="card-content">Track your revenue and payouts</p>
          </div>
          <div className="card">
            <h3 className="card-title">Creator Studio</h3>
            <p className="card-content">Upload and edit your content</p>
          </div>
          <div className="card">
            <h3 className="card-title">Profile</h3>
            <p className="card-content">Manage your public profile</p>
          </div>
          <div className="card">
            <h3 className="card-title">Analytics</h3>
            <p className="card-content">View performance metrics</p>
          </div>
        </div>
      );
    }
    return <p>Welcome to your dashboard!</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{getDashboardTitle()}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}!</span>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {getDashboardContent()}
      </main>
    </div>
  );
};

export default DashboardPage;