// LiveLecture.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';

const LiveLecture = () => {
  const { lectureId } = useParams();
  const { user } = useAuth();
  const { processMicroPayment } = usePayment();
  const [isLive, setIsLive] = useState(true);
  const [timeWatched, setTimeWatched] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const intervalRef = useRef();

  // Simulate live stream
  useEffect(() => {
    // Start timer for micro-payments
    intervalRef.current = setInterval(() => {
      setTimeWatched(prev => {
        const newTime = prev + 1;
        // Every minute, process a micro-payment
        if (newTime % 60 === 0) {
          processMicroPayment(lectureId, 1); // 1 minute
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [lectureId, processMicroPayment]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: user.name,
        message: newMessage,
        timestamp: new Date().toISOString()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex">
        {/* Video Player */}
        <div className="flex-1 bg-black">
          <div className="w-full h-full flex items-center justify-center">
            {isLive ? (
              <div className="text-white">
                <div className="text-2xl">Live Stream</div>
                <div className="text-red-500">LIVE</div>
              </div>
            ) : (
              <div className="text-white">Lecture has ended</div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="w-80 border-l border-neutral-200 flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className="mb-2">
                <div className="font-medium">{msg.user}</div>
                <div className="text-sm">{msg.message}</div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-neutral-200">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-neutral-300 rounded-l-lg px-3 py-2"
              />
              <button
                onClick={handleSendMessage}
                className="bg-green-600 text-white px-4 py-2 rounded-r-lg"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lecture Info and Controls */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Live Lecture Title</h2>
            <p>Time watched: {Math.floor(timeWatched / 60)}m {timeWatched % 60}s</p>
          </div>
          <div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
              {isLive ? 'End Lecture' : 'Lecture Ended'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveLecture;