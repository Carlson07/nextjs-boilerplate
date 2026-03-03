// ===============================
// 🎬 LIVE LECTURE PAGE (COMPLETE)
// ===============================

const LiveLecturePage = memo(({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [whiteboardData, setWhiteboardData] = useState([]);
  const [polls, setPolls] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef();
  const remoteVideosRef = useRef([]);
  const chatContainerRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    initializeSession();
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      // Join the session
      const sessionData = await UniLinkAPI.live.joinSession(sessionId, user.id);
      setSession(sessionData);
      
      // Initialize WebRTC connection
      await initializeWebRTC();
      
      // Connect to WebSocket for real-time features
      connectWebSocket();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Failed to join session: ' + error.message);
    }
  };

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection and connect to other participants
      // This would integrate with your WebRTC service
      initializePeerConnection(stream);
    } catch (error) {
      console.error('Failed to access media devices:', error);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`wss://unilink-africa.com/live/${sessionId}?token=${user.token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send join message
      ws.send(JSON.stringify({
        type: 'join',
        userId: user.id,
        userName: user.name
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'chat_message':
          setChatMessages(prev => [...prev, data.message]);
          break;
        case 'participant_joined':
          setParticipants(prev => [...prev, data.participant]);
          break;
        case 'participant_left':
          setParticipants(prev => prev.filter(p => p.id !== data.userId));
          break;
        case 'whiteboard_update':
          setWhiteboardData(prev => [...prev, data.data]);
          break;
        case 'new_poll':
          setPolls(prev => [...prev, data.poll]);
          break;
        case 'session_ended':
          handleSessionEnded();
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
  };

  const sendChatMessage = (content) => {
    const message = {
      type: 'chat_message',
      userId: user.id,
      userName: user.name,
      content,
      timestamp: new Date().toISOString()
    };

    // Send via WebSocket
    // This would be implemented with your WebSocket service
    sendWebSocketMessage(message);
    
    // Optimistically update UI
    setChatMessages(prev => [...prev, { ...message, id: Date.now() }]);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = getVideoSender(); // Get current video sender from peer connection
        await sender.replaceTrack(videoTrack);
        
        setLocalStream(prev => {
          const newStream = new MediaStream([
            videoTrack,
            prev.getAudioTracks()[0]
          ]);
          return newStream;
        });
        
        setIsScreenSharing(true);

        // Handle when user stops screen share
        videoTrack.onended = () => {
          toggleScreenShare();
        };
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        const sender = getVideoSender();
        await sender.replaceTrack(cameraTrack);
        
        setLocalStream(prev => {
          const newStream = new MediaStream([
            cameraTrack,
            prev.getAudioTracks()[0]
          ]);
          return newStream;
        });
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share failed:', error);
    }
  };

  const raiseHand = () => {
    sendWebSocketMessage({
      type: 'raise_hand',
      userId: user.id,
      userName: user.name
    });
  };

  const handleSessionEnded = () => {
    alert('The live session has ended.');
    window.location.href = '/live';
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Joining live session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-900 text-white">
      {/* Header */}
      <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{session.title}</h1>
          <p className="text-neutral-400 text-sm">
            {session.subject} • {session.lecturerName} • {participants.length} participants
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
          
          <div className="text-sm text-neutral-400">
            Recording: {session.recordingEnabled ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Lecturer Video (Main) */}
          <div className="flex-1 bg-black relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-contain"
            />
            
            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  isAudioEnabled ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  isVideoEnabled ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {isVideoEnabled ? '📹' : '📷'}
              </button>
              
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${
                  isScreenSharing ? 'bg-blue-600' : 'bg-neutral-700'
                }`}
              >
                🖥️
              </button>
              
              <button
                onClick={raiseHand}
                className="p-3 bg-yellow-600 rounded-full"
              >
                ✋
              </button>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="h-32 bg-neutral-800 border-t border-neutral-700 p-4">
            <h3 className="text-sm font-medium mb-2">Participants ({participants.length})</h3>
            <div className="flex gap-2 overflow-x-auto">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                    {participant.name.charAt(0)}
                  </div>
                  <span className="text-xs mt-1 max-w-12 truncate">{participant.name}</span>
                  {participant.isHandRaised && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-neutral-800 border-l border-neutral-700 flex flex-col">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-neutral-700">
              <h3 className="font-semibold">Live Chat</h3>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {chatMessages.map(message => (
                <div key={message.id} className={`p-3 rounded-lg ${
                  message.type === 'system' 
                    ? 'bg-blue-900 bg-opacity-50' 
                    : message.type === 'hand_raise'
                    ? 'bg-yellow-900 bg-opacity-50'
                    : 'bg-neutral-700'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.userName}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-neutral-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendChatMessage(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input');
                    if (input.value.trim()) {
                      sendChatMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Active Polls */}
          {polls.length > 0 && (
            <div className="border-t border-neutral-700 p-4">
              <h4 className="font-semibold mb-3">Active Polls</h4>
              {polls.map(poll => (
                <PollComponent key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Poll Component for Live Sessions
const PollComponent = memo(({ poll }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (optionIndex) => {
    if (hasVoted) return;
    
    setSelectedOption(optionIndex);
    setHasVoted(true);
    
    // Send vote via WebSocket
    sendWebSocketMessage({
      type: 'poll_vote',
      pollId: poll.id,
      optionIndex,
      userId: user.id
    });
  };

  return (
    <div className="bg-neutral-700 rounded-lg p-4 mb-3">
      <h5 className="font-medium mb-3">{poll.question}</h5>
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const voteCount = poll.results?.[index] || 0;
          const totalVotes = Object.values(poll.results || {}).reduce((a, b) => a + b, 0);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          
          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted}
              className={`w-full text-left p-2 rounded transition-colors ${
                selectedOption === index
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-600 hover:bg-neutral-500'
              } ${hasVoted ? 'cursor-default' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span>{option}</span>
                {hasVoted && (
                  <span className="text-sm opacity-75">
                    {voteCount} ({Math.round(percentage)}%)
                  </span>
                )}
              </div>
              {hasVoted && (
                <div className="w-full bg-neutral-500 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <div className="text-xs text-neutral-400 mt-2">
          {totalVotes} total votes
        </div>
      )}
    </div>
  );
});