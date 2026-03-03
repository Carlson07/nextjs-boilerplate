// ===============================
// 🏠 MAIN APP COMPONENT
// ===============================

const MainApp = () => {
  const { isAuthenticated, user } = useAuth();
  const app = useApp();
  const payment = usePayment();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block col-span-3">
            <UserProfileCard />
            <WalletCard />
            <ModulesList />
          </aside>

          {/* Main Content Area */}
          <main className="col-span-12 lg:col-span-6">
            <RouteHandler />
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block col-span-3">
            <PaymentMethodsCard />
            <RevenueTransparencyCard />
            <SecurityFeaturesCard />
          </aside>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <MobileBottomNavigation />

      {/* Modals */}
      <ModalManager />
    </div>
  );
};

// Route Handler Component
const RouteHandler = () => {
  const { route } = useApp();
  
  switch (route) {
    case 'home':
      return <FeedPage />;
    case 'modules':
      return <ModulesPage />;
    case 'tutors':
      return <TutorsPage />;
    case 'marketplace':
      return <MarketplacePage />;
    case 'profile':
      return <ProfilePage />;
    default:
      return <FeedPage />;
  }
};

// Modal Manager Component
const ModalManager = () => {
  const { 
    showUpload, 
    showAI, 
    showWallet, 
    showPayment, 
    showUpgradeModal, 
    showAdminDashboard,
    toggleModal 
  } = useApp();

  return (
    <>
      {showUpload && (
        <UploadModal 
          onClose={() => toggleModal('showUpload', false)} 
        />
      )}
      
      {showAI && (
        <AIAssistantModal 
          onClose={() => toggleModal('showAI', false)} 
        />
      )}
      
      {showWallet && (
        <WalletModal 
          onClose={() => toggleModal('showWallet', false)} 
        />
      )}
      
      {showPayment && (
        <EnhancedPaymentModal 
          isOpen={showPayment}
          onClose={() => toggleModal('showPayment', false)}
          onSuccess={(transaction) => {
            console.log('Payment successful:', transaction);
            toggleModal('showPayment', false);
          }}
          type="deposit"
        />
      )}
      
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => toggleModal('showUpgradeModal', false)} 
        />
      )}
      
      {showAdminDashboard && (
        <AdminDashboardModal 
          onClose={() => toggleModal('showAdminDashboard', false)} 
        />
      )}
    </>
  );
};

export default MainApp;