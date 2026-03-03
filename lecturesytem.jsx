// ===============================
// 🎥 LIVE LECTURE SYSTEM
// ===============================

// Live Lecture Manager
class LiveLectureManager {
  constructor() {
    this.sessions = new Map();
    this.participants = new Map();
    this.ongoingLectures = new Map();
  }

  // Create a new live lecture session
  async createLiveSession(sessionData) {
    const {
      lecturerId,
      title,
      subject,
      educationLevel,
      scheduledTime,
      duration,
      sessionType = 'group', // 'group', 'oneOnOne', 'institutional'
      maxParticipants,
      price,
      recordingEnabled = true
    } = sessionData;

    const sessionId = 'live_' + Date.now();
    
    const session = {
      id: sessionId,
      lecturerId,
      title,
      subject,
      educationLevel,
      scheduledTime,
      duration,
      sessionType,
      maxParticipants,
      price,
      recordingEnabled,
      status: 'scheduled',
      joinUrl: this.generateJoinUrl(sessionId),
      recordingUrl: null,
      participants: [],
      chat: [],
      whiteboard: {
        enabled: true,
        data: []
      },
      polls: [],
      qna: [],
      createdAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Start a live session
  async startSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'live';
    session.startedAt = new Date().toISOString();
    this.ongoingLectures.set(sessionId, session);

    // Notify participants
    this.notifyParticipants(sessionId, 'session_started');

    return session;
  }

  // Join a live session
  async joinSession(sessionId, userData) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.participants.length >= session.maxParticipants) {
      throw new Error('Session is full');
    }

    // Process payment for the session
    const paymentResult = await this.processSessionPayment(userData.userId, session);
    if (!paymentResult.success) {
      throw new Error('Payment failed: ' + paymentResult.error);
    }

    const participant = {
      userId: userData.userId,
      name: userData.name,
      role: userData.role || 'student',
      joinedAt: new Date().toISOString(),
      paymentStatus: 'paid'
    };

    session.participants.push(participant);
    
    // Add to participants map for quick lookup
    if (!this.participants.has(sessionId)) {
      this.participants.set(sessionId, new Map());
    }
    this.participants.get(sessionId).set(userData.userId, participant);

    return {
      session,
      participant,
      joinUrl: session.joinUrl
    };
  }

  // Process payment for live session
  async processSessionPayment(userId, session) {
    const pricing = advancedRevenueModel.liveLectures[session.sessionType];
    let amount = 0;

    switch (session.sessionType) {
      case 'group':
        amount = pricing.perStudent;
        break;
      case 'oneOnOne':
        amount = (session.duration / 60) * pricing.perHour;
        break;
      case 'institutional':
        amount = pricing.monthlySubscription;
        break;
    }

    const paymentProcessor = new PaymentProcessor();
    return await paymentProcessor.processPayment({
      amount,
      method: 'wallet', // Deduct from wallet
      userType: session.educationLevel,
      paymentDetails: {
        sessionId: session.id,
        sessionType: session.sessionType,
        duration: session.duration
      }
    });
  }

  // Real-time chat in live session
  async sendChatMessage(sessionId, messageData) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const message = {
      id: 'msg_' + Date.now(),
      userId: messageData.userId,
      userName: messageData.userName,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text' // 'text', 'question', 'answer'
    };

    session.chat.push(message);
    
    // Broadcast to all participants
    this.broadcastToParticipants(sessionId, 'chat_message', message);
    
    return message;
  }

  // Interactive whiteboard
  async updateWhiteboard(sessionId, whiteboardData) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.whiteboard.data.push(whiteboardData);
    
    // Broadcast whiteboard update
    this.broadcastToParticipants(sessionId, 'whiteboard_update', whiteboardData);
  }

  // Create poll
  async createPoll(sessionId, pollData) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const poll = {
      id: 'poll_' + Date.now(),
      question: pollData.question,
      options: pollData.options,
      correctAnswer: pollData.correctAnswer, // For quizzes
      type: pollData.type || 'poll', // 'poll' or 'quiz'
      responses: new Map(),
      createdAt: new Date().toISOString()
    };

    session.polls.push(poll);
    this.broadcastToParticipants(sessionId, 'new_poll', poll);
    
    return poll;
  }

  // End session and process recordings
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    this.ongoingLectures.delete(sessionId);

    // Generate recording if enabled
    if (session.recordingEnabled) {
      session.recordingUrl = await this.generateRecording(sessionId);
    }

    // Calculate and distribute earnings
    await this.distributeSessionEarnings(sessionId);

    // Notify participants
    this.notifyParticipants(sessionId, 'session_ended');

    return session;
  }

  // Utility methods
  generateJoinUrl(sessionId) {
    return `https://live.unilink-africa.com/join/${sessionId}`;
  }

  broadcastToParticipants(sessionId, event, data) {
    // Implementation for real-time broadcasting
    console.log(`Broadcasting ${event} to session ${sessionId}:`, data);
  }

  notifyParticipants(sessionId, notification) {
    // Implementation for participant notifications
    console.log(`Notifying participants of ${notification} for session ${sessionId}`);
  }

  async generateRecording(sessionId) {
    // Implementation for generating session recording
    return `https://recordings.unilink-africa.com/${sessionId}.mp4`;
  }

  async distributeSessionEarnings(sessionId) {
    // Implementation for distributing earnings after session
    return { success: true };
  }
}

// Live Lecture React Component
const LiveLectureComponent = memo(({ sessionId, user }) => {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [whiteboardData, setWhiteboardData] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const liveManager = useRef(new LiveLectureManager());
  const videoRef = useRef();
  const chatContainerRef = useRef();

  useEffect(() => {
    initializeSession();
    return () => {
      // Cleanup on unmount
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      // Join the session
      const joinResult = await liveManager.current.joinSession(sessionId, user);
      setSession(joinResult.session);
      setParticipants(joinResult.session.participants);
      setChatMessages(joinResult.session.chat);
      
      // Initialize video/audio
      await initializeMedia();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session: ' + error.message);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Failed to access media devices:', error);
    }
  };

  const sendChatMessage = async (content) => {
    if (!content.trim()) return;

    await liveManager.current.sendChatMessage(sessionId, {
      userId: user.id,
      userName: user.name,
      content: content.trim(),
      type: 'text'
    });
  };

  const toggleAudio = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const raiseHand = async () => {
    await liveManager.current.sendChatMessage(sessionId, {
      userId: user.id,
      userName: user.name,
      content: '✋ Raised hand',
      type: 'action'
    });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Joining live session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{session.title}</h1>
          <p className="text-neutral-400 text-sm">
            {session.subject} • {session.educationLevel} • {session.participants.length} participants
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Lecturer Video */}
          <div className="flex-1 bg-black relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-contain"
            />
            
            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  audioEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {audioEnabled ? '🎤' : '🔇'}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  videoEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {videoEnabled ? '📹' : '📷'}
              </button>
              <button
                onClick={raiseHand}
                className="p-3 bg-yellow-600 text-white rounded-full"
              >
                ✋
              </button>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="h-32 bg-neutral-800 border-t border-neutral-700 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {participants.map(participant => (
                <div key={participant.userId} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white">
                    {participant.name.charAt(0)}
                  </div>
                  <span className="text-white text-xs mt-1">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white flex flex-col">
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {chatMessages.map(message => (
                <div key={message.id} className={`p-3 rounded-lg ${
                  message.type === 'action' 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-neutral-50'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-neutral-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});