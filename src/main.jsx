import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './authanticationsystem.jsx';
import { AppProvider } from './statemanagement.jsx';
import { PaymentProvider, usePayment } from './paymentsytem.jsx';
import MainApp from './mainappcomponent.jsx';
import { UniLinkAPI } from './api.js';
import { educationLevels } from './multileveleducation.jsx';

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
            <p className="text-neutral-600 mb-6">Refreshing will help resolve the issue.</p>
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

// Demo Pages (Placeholder)
const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">🎓 UniLink Africa</h1>
          <div className="hidden md:flex space-x-4">
            <a href="/courses" className="px-4 py-2 text-neutral-600 hover:text-green-600">Courses</a>
            <a href="/tutors" className="px-4 py-2 text-neutral-600 hover:text-green-600">Tutors</a>
            {isAuthenticated && <a href="/app" className="px-4 py-2 text-neutral-600 hover:text-green-600">My App</a>}
            {!isAuthenticated && (
              <>
                <a href="/login" className="px-4 py-2 text-neutral-600 hover:text-green-600">Login</a>
                <a href="/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Sign Up</a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center px-4">
          <h2 className="text-5xl font-bold text-neutral-900 mb-4">Welcome to UniLink Africa</h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">The premier online education platform supporting Primary, Secondary, and University education across Africa. Learn from expert tutors, take live classes, and join millions of students.</p>
          <div className="space-x-4 flex justify-center">
            {!isAuthenticated && <a href="/signup" className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block">Get Started</a>}
            <a href="/courses" className="px-8 py-3 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 inline-block">Browse Courses</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/app', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">🔐 Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" required />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Login</button>
        </form>
        <p className="text-center text-neutral-600 mt-4">No account? <a href="/signup" className="text-green-600 hover:underline">Sign up</a></p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ fullName, email, password });
    if (result.success) {
      navigate('/app', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">📝 Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" type="text" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" required />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" required />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create Account</button>
        </form>
        <p className="text-center text-neutral-600 mt-4">Have an account? <a href="/login" className="text-green-600 hover:underline">Login</a></p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-neutral-900 mb-8">🏠 Dashboard</h2>
        <p className="text-lg text-neutral-700 mb-6">Welcome back, {user?.name || 'student'}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
            <h3 className="text-gray-600 font-semibold mb-2">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
            <h3 className="text-gray-600 font-semibold mb-2">Learning Hours</h3>
            <p className="text-3xl font-bold text-blue-600">24.5</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
            <h3 className="text-gray-600 font-semibold mb-2">Wallet Balance</h3>
            <p className="text-3xl font-bold text-purple-600">$45.50</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesPage = () => {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const result = await UniLinkAPI.courses.getCourses();
      if (result.success) {
        setCourses(result.data);
      }
      setLoading(false);
    })();
  }, []);

  const displayed = filter
    ? courses.filter(c => c.educationLevel === filter)
    : courses;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-neutral-900 mb-8">📚 Courses</h2>
        <div className="mb-6">
          <label className="mr-2 font-medium">Filter by level:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-neutral-300 rounded-lg px-3 py-1">
            <option value="">All</option>
            {Object.keys(educationLevels).map(level => (
              <option key={level} value={level}>{educationLevels[level].name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayed.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200 hover:shadow-lg transition">
              <div className="h-40 bg-gradient-to-r from-green-400 to-blue-400"></div>
              <div className="p-4">
                <h3 className="font-bold text-neutral-900 mb-2">{course.title}</h3>
                <p className="text-sm text-neutral-600 mb-3">{course.lecturer}</p>
                <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Enroll Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TutorsPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-neutral-900 mb-8">👨‍🏫 Find a Tutor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Dr. Ahmed Hassan', subject: 'Mathematics', rating: 4.8 },
          { name: 'Miss Sarah Johnson', subject: 'English', rating: 4.9 },
          { name: 'Prof. James Smith', subject: 'Science', rating: 4.7 },
        ].map((tutor, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl">👨</div>
              <div>
                <h3 className="font-bold text-neutral-900">{tutor.name}</h3>
                <p className="text-sm text-neutral-600">{tutor.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500">⭐ {tutor.rating}</span>
              <span className="text-neutral-600">$15/hour</span>
            </div>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Book Session</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PaymentsPage = () => {
  const { paymentMethods, processDeposit, loading } = usePayment();
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('');
  const [message, setMessage] = React.useState(null);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const result = await processDeposit(parseFloat(amount), method, {});
    if (result.success) {
      setMessage('Deposit successful!');
      setAmount('');
      setMethod('');
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">💰 Wallet Deposit</h2>
        <form onSubmit={handleDeposit} className="space-y-4">
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            type="number"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
            required
          />
          <select
            value={method}
            onChange={e => setMethod(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
            required
          >
            <option value="">Select method</option>
            {paymentMethods.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            disabled={loading}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-neutral-700">{message}</p>}
      </div>
    </div>
  );
};

// Root App Component
const RootApp = () => {
  return (
    <React.StrictMode>
      <EnhancedErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <PaymentProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </PaymentProvider>
          </AppProvider>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </React.StrictMode>
  );
};

// Main App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/tutors" element={<TutorsPage />} />
      <Route path="/payments" element={<PaymentsPage />} />
      <Route path="/app/*" element={<MainApp />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RootApp />);
