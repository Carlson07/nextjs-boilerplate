// ===============================
// 🚀 COMPLETE APP WRAPPER & ROUTING
// ===============================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Main App with all providers
const App = () => {
  return (
    <React.StrictMode>
      <EnhancedErrorBoundary>
        <AuthProvider>
          <PaymentProvider>
            <AppProvider>
              <NotificationProvider>
                <ServiceWorkerManager />
                <Router>
                  <AppContent />
                </Router>
              </NotificationProvider>
            </AppProvider>
          </PaymentProvider>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </React.StrictMode>
  );
};

// App content with routing
const AppContent = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <NotificationSystem />
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/*" 
          element={isAuthenticated ? <AuthenticatedApp user={user} /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </div>
  );
};

// Authenticated app structure
const AuthenticatedApp = ({ user }) => {
  const location = useLocation();
  
  // Check if current route is a full-page route (like live session)
  const isFullPageRoute = location.pathname.includes('/live/') || 
                         location.pathname.includes('/course/player/');

  if (isFullPageRoute) {
    return (
      <Routes>
        <Route path="/live/:sessionId" element={<LiveLecturePage />} />
        <Route path="/course/player/:courseId" element={<CoursePlayerPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block col-span-3">
            <UserProfileCard />
            <WalletOverview />
            <QuickActions />
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CourseDiscovery />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              <Route path="/live" element={<LiveSessionsPage />} />
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/school" element={<SchoolDashboard />} />
              <Route path="/school/:id" element={<SchoolAdminDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Right Sidebar - Desktop */}
          <aside className="hidden lg:block col-span-3">
            <LiveSessionsSidebar />
            <RecentActivity />
            <QuickStats />
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <GlobalModals />
    </div>
  );
};

export default App;