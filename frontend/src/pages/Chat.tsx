import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderEmail: string;
  text: string;
  createdAt: any;
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages (ensure polling starts only after auth available)
  const fetchMessages = async () => {
    try {
      if (!user) return;
      // force refresh token to reduce chance of using an expired token
      const token = await user.getIdToken(true);
      // debug: indicate if token is present (do NOT print full token in production)
      console.debug('Chat: token present?', !!token);
      const response = await axios.get(`/api/chat/${id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(response.data || []);
      setError(null);
    } catch (err: any) {
      // If unauthorized, surface message and stop polling by throwing
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Unauthorized. Please sign in again.');
      } else {
        setError(err.message || 'Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    // only start polling when we have both chat id and authenticated user
    if (id && user) {
      // initial fetch
      fetchMessages();
      // Poll for new messages every 2 seconds
      interval = window.setInterval(fetchMessages, 2000);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [id, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const token = await user.getIdToken(true);
      await axios.post(`/api/chat/${id}/messages`, { text: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
      setNewMessage('');
      // Refetch messages after sending
      await fetchMessages();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === user?.uid
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs opacity-75 mb-1">{msg.senderEmail}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !sending) {
                  handleSendMessage();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Type a message..."
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                sending || !newMessage.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
