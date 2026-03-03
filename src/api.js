// ===============================
// 🔗 UNILINK API SERVICE
// ===============================

const API_BASE = 'https://api.unilink-africa.com/v1';

// Mock API Service
export const UniLinkAPI = {
  baseURL: API_BASE,
  
  // Authentication
  auth: {
    login: async (email, password) => {
      // Mock implementation
      console.log('Login attempt:', email);
      return {
        success: true,
        data: {
          user: {
            id: '123',
            email,
            name: 'Student User',
            role: 'student',
            avatar: 'https://i.pravatar.cc/150?img=1'
          },
          token: 'mock_token_' + Date.now(),
          refreshToken: 'mock_refresh_' + Date.now()
        }
      };
    },
    
    register: async (userData) => {
      console.log('Register attempt:', userData);
      return {
        success: true,
        data: {
          user: {
            id: '124',
            email: userData.email,
            name: userData.fullName || 'New User',
            role: 'student',
            avatar: 'https://i.pravatar.cc/150?img=2'
          },
          token: 'mock_token_' + Date.now(),
          refreshToken: 'mock_refresh_' + Date.now()
        }
      };
    },
    
    verifyToken: async (token) => {
      console.log('Token verification:', token);
      return { success: true, valid: true };
    }
  },
  
  // Payment Methods
  payments: {
    getPaymentMethods: async () => {
      return {
        success: true,
        data: [
          { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
          { id: 'mobile', name: 'Mobile Money', icon: '📱' },
          { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
        ]
      };
    },
    
    getTransactionHistory: async () => {
      return {
        success: true,
        data: [
          {
            id: 'tx1',
            type: 'deposit',
            amount: 50,
            status: 'completed',
            date: new Date().toISOString()
          }
        ]
      };
    },
    
    initiatePayment: async (paymentData) => {
      console.log('Payment initiated:', paymentData);
      return {
        success: true,
        data: {
          id: 'tx_' + Date.now(),
          ...paymentData,
          status: 'completed',
          date: new Date().toISOString()
        }
      };
    }
  },
  
  // Courses
  courses: {
    getCourses: async (filters = {}) => {
      return {
        success: true,
        data: [
          {
            id: 'course1',
            title: 'Introduction to Mathematics',
            educationLevel: 'secondary',
            price: 29.99,
            lecturer: 'Dr. John Doe',
            students: 234
          },
          {
            id: 'course2',
            title: 'Advanced Physics',
            educationLevel: 'university',
            price: 99.99,
            lecturer: 'Prof. Jane Smith',
            students: 156
          }
        ]
      };
    }
  },
  
  // Live Lectures
  lectures: {
    getLiveLectures: async () => {
      return {
        success: true,
        data: [
          {
            id: 'live1',
            title: 'Live Math Tutoring',
            lecturer: 'Mr. Ahmed',
            participantCount: 12,
            startTime: new Date().toISOString()
          }
        ]
      };
    }
  },
  
  // Tutors
  tutors: {
    getTutors: async () => {
      return {
        success: true,
        data: [
          {
            id: 'tutor1',
            name: 'Dr. Ahmed Hassan',
            subject: 'Mathematics',
            rating: 4.8,
            reviews: 245,
            hourlyRate: 15
          },
          {
            id: 'tutor2',
            name: 'Miss Sarah Johnson',
            subject: 'English',
            rating: 4.9,
            reviews: 312,
            hourlyRate: 12
          }
        ]
      };
    }
  }
};

// Helper function to verify token
export const verifyToken = async (token) => {
  return await UniLinkAPI.auth.verifyToken(token);
};
