// ===============================
// 🔄 ENHANCED STATE MANAGEMENT
// ===============================

// App Context
const AppContext = React.createContext();

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Initial State
const initialState = {
  // UI State
  route: 'home',
  query: '',
  currentModule: 'PSC101 - Intro to Gov',
  showUpload: false,
  showAI: false,
  showWallet: false,
  showPayment: false,
  showUpgradeModal: false,
  showAdminDashboard: false,
  
  // Data State
  feed: [],
  modules: {},
  tutors: [],
  marketItems: [],
  lecturers: {},
  
  // User State
  userSubscription: 'student_basic',
  lecturerSubscription: 'lecturer_basic',
  adsEnabled: true,
  notificationCount: 0,
  transactions: [],
  
  // Platform State
  platformRevenue: {
    totalRevenue: 0,
    thisMonth: 0,
    revenueStreams: {
      videoCommissions: 0,
      tutorCommissions: 0,
      marketplaceFees: 0,
      subscriptionFees: 0,
      advertising: 0,
      withdrawalFees: 0
    },
    growth: {
      monthOverMonth: 0,
      userGrowth: 0,
      revenueGrowth: 0
    }
  }
};

// App Reducer
function appReducer(state, action) {
  switch (action.type) {
    // Navigation
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload };
    
    // Modal Controls
    case 'TOGGLE_MODAL':
      return { 
        ...state, 
        [action.payload.modal]: action.payload.show 
      };
    
    // Data Management
    case 'SET_FEED':
      return { ...state, feed: action.payload };
    
    case 'SET_MODULES':
      return { ...state, modules: action.payload };
    
    case 'SET_TUTORS':
      return { ...state, tutors: action.payload };
    
    case 'SET_MARKET_ITEMS':
      return { ...state, marketItems: action.payload };
    
    case 'SET_LECTURERS':
      return { ...state, lecturers: action.payload };
    
    // User Actions
    case 'ADD_POST':
      return {
        ...state,
        feed: [action.payload, ...state.feed]
      };
    
    case 'UPDATE_POST_LIKES':
      return {
        ...state,
        feed: state.feed.map(post =>
          post.id === action.payload.postId
            ? { ...post, likes: action.payload.likes }
            : post
        )
      };
    
    case 'ADD_COMMENT':
      return {
        ...state,
        feed: state.feed.map(post =>
          post.id === action.payload.postId
            ? {
                ...post,
                comments: [...(post.comments || []), action.payload.comment]
              }
            : post
        )
      };
    
    case 'TOGGLE_SAVE_POST':
      return {
        ...state,
        feed: state.feed.map(post =>
          post.id === action.payload
            ? { ...post, saved: !post.saved }
            : post
        )
      };
    
    // Payment & Revenue
    case 'PROCESS_MICRO_PAYMENT':
      return processMicroPayment(state, action.payload);
    
    case 'ADD_DEPOSIT':
      return {
        ...state,
        profile: {
          ...state.profile,
          wallet: {
            ...state.profile.wallet,
            balance: state.profile.wallet.balance + action.payload.amount
          }
        },
        transactions: [
          {
            id: 'tx_' + Date.now(),
            type: 'deposit',
            amount: action.payload.amount,
            description: `${action.payload.method} Deposit`,
            method: action.payload.method,
            timestamp: new Date().toISOString(),
            status: 'completed'
          },
          ...state.transactions
        ]
      };
    
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        userSubscription: action.payload.plan,
        platformRevenue: {
          ...state.platformRevenue,
          totalRevenue: state.platformRevenue.totalRevenue + action.payload.amount,
          thisMonth: state.platformRevenue.thisMonth + action.payload.amount,
          revenueStreams: {
            ...state.platformRevenue.revenueStreams,
            subscriptionFees: state.platformRevenue.revenueStreams.subscriptionFees + action.payload.amount
          }
        }
      };
    
    // Platform Management
    case 'UPDATE_PLATFORM_REVENUE':
      return {
        ...state,
        platformRevenue: {
          ...state.platformRevenue,
          ...action.payload
        }
      };
    
    default:
      return state;
  }
}

// Micro-payment processor
const processMicroPayment = (state, payload) => {
  const { postId, minutesWatched } = payload;
  const post = state.feed.find(p => p.id === postId);
  const userData = state.profile.userData;
  const alreadyPaid = userData.paidVideos[postId];
  
  const cost = alreadyPaid ? 0 : (minutesWatched * africaRevenueModel.microPayments.videoPerMinute);
  const platformFee = cost * africaRevenueModel.microPayments.platformCommission;
  const lecturerEarnings = cost - platformFee;
  
  const updatedRevenue = {
    ...state.platformRevenue,
    totalRevenue: state.platformRevenue.totalRevenue + platformFee,
    thisMonth: state.platformRevenue.thisMonth + platformFee,
    revenueStreams: {
      ...state.platformRevenue.revenueStreams,
      videoCommissions: state.platformRevenue.revenueStreams.videoCommissions + platformFee
    }
  };
  
  const updatedPaidVideos = {
    ...userData.paidVideos,
    [postId]: {
      paidAmount: (alreadyPaid?.paidAmount || 0) + cost,
      watchCount: (alreadyPaid?.watchCount || 0) + 1,
      lastWatched: new Date().toISOString(),
      archived: alreadyPaid?.archived || false
    }
  };
  
  const newWatchRecord = {
    videoId: postId,
    title: post?.title,
    watchedAt: new Date().toISOString(),
    duration: minutesWatched,
    cost: cost,
    ratePerMinute: africaRevenueModel.microPayments.videoPerMinute
  };
  
  return {
    ...state,
    platformRevenue: updatedRevenue,
    profile: {
      ...state.profile,
      wallet: {
        ...state.profile.wallet,
        balance: Math.max(0, state.profile.wallet.balance - cost),
        totalSpent: state.profile.wallet.totalSpent + cost
      },
      userData: {
        ...userData,
        paidVideos: updatedPaidVideos,
        watchHistory: [newWatchRecord, ...userData.watchHistory]
      }
    },
    feed: state.feed.map(post =>
      post.id === postId
        ? { 
            ...post, 
            views: post.views + 1,
            earnings: (post.earnings || 0) + lecturerEarnings
          }
        : post
    ),
    lecturers: {
      ...state.lecturers,
      [post?.authorId]: {
        ...state.lecturers[post?.authorId],
        earnings: {
          ...state.lecturers[post?.authorId]?.earnings,
          pending: (state.lecturers[post?.authorId]?.earnings.pending || 0) + lecturerEarnings
        }
      }
    },
    transactions: cost > 0 ? [
      {
        id: 'mtx_' + Date.now(),
        type: 'micro_payment',
        amount: -cost,
        description: `Video: ${post?.title} (${minutesWatched}min)`,
        method: 'wallet',
        rate: `${(africaRevenueModel.microPayments.videoPerMinute * 100).toFixed(1)}¢/min`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      ...state.transactions
    ] : state.transactions
  };
};

// App Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      // Load user-specific data
      const [feedData, modulesData, tutorsData, marketData] = await Promise.all([
        UniLinkAPI.videos.getFeed(),
        UniLinkAPI.modules.getUserModules(),
        UniLinkAPI.tutors.getAvailableTutors(),
        UniLinkAPI.marketplace.getItems()
      ]);

      dispatch({ type: 'SET_FEED', payload: feedData.data });
      dispatch({ type: 'SET_MODULES', payload: modulesData.data });
      dispatch({ type: 'SET_TUTORS', payload: tutorsData.data });
      dispatch({ type: 'SET_MARKET_ITEMS', payload: marketData.data });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Action creators
  const actions = {
    setRoute: (route) => dispatch({ type: 'SET_ROUTE', payload: route }),
    setQuery: (query) => dispatch({ type: 'SET_QUERY', payload: query }),
    setCurrentModule: (module) => dispatch({ type: 'SET_CURRENT_MODULE', payload: module }),
    
    toggleModal: (modal, show) => dispatch({ 
      type: 'TOGGLE_MODAL', 
      payload: { modal, show } 
    }),
    
    addPost: (post) => dispatch({ type: 'ADD_POST', payload: post }),
    updatePostLikes: (postId, likes) => dispatch({ 
      type: 'UPDATE_POST_LIKES', 
      payload: { postId, likes } 
    }),
    addComment: (postId, comment) => dispatch({
      type: 'ADD_COMMENT',
      payload: { postId, comment }
    }),
    toggleSavePost: (postId) => dispatch({ 
      type: 'TOGGLE_SAVE_POST', 
      payload: postId 
    }),
    
    processMicroPayment: (postId, minutesWatched) => dispatch({
      type: 'PROCESS_MICRO_PAYMENT',
      payload: { postId, minutesWatched }
    }),
    
    addDeposit: (amount, method) => dispatch({
      type: 'ADD_DEPOSIT',
      payload: { amount, method }
    }),
    
    updateSubscription: (plan, amount) => dispatch({
      type: 'UPDATE_SUBSCRIPTION',
      payload: { plan, amount }
    }),
    
    updatePlatformRevenue: (revenueData) => dispatch({
      type: 'UPDATE_PLATFORM_REVENUE',
      payload: revenueData
    })
  };

  const value = {
    ...state,
    ...actions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};