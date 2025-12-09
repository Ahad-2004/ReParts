import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
  sellerId: string;
  sellerEmail?: string;
  createdAt: any;
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`/api/listings/${id}`);
        setListing(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  const handleSendMessage = async () => {
    if (!user) {
      alert('Please sign in to message sellers');
      navigate('/auth');
      return;
    }

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!listing) return;

    // Ensure we have some seller identifier to create a chat
    if (!listing.sellerId && !listing.sellerEmail) {
      alert('Seller contact information not available. Cannot send message.');
      return;
    }

    setSendingMessage(true);
    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        '/api/chat',
        {
          buyerId: user.uid,
          buyerEmail: user.email,
          sellerId: listing.sellerId,
          sellerEmail: listing.sellerEmail,
          listingId: listing.id,
          initialMessage: messageText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chatId = response.data.id;
      setMessageText('');
      alert('Message sent! You can continue chatting.');
      navigate(`/chat/${chatId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error || 'Listing not found'}</p>
      </div>
    );
  }

  const isOwnListing = user?.uid === listing.sellerId;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center overflow-hidden">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-6xl">📦</div>
          )}
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          {listing.category && (
            <p className="text-sm text-gray-600 mb-4">Category: <span className="font-medium capitalize">{listing.category}</span></p>
          )}

          <p className="text-4xl font-bold text-blue-600 mb-6">₹{listing.price ? Number(listing.price).toFixed(2) : '0.00'}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
            <p className="text-gray-600">📧 {listing.sellerEmail || 'Unknown'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Posted {new Date(listing.createdAt?.toDate?.() || listing.createdAt).toLocaleDateString()}
            </p>
          </div>

          {isOwnListing ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              <p className="font-semibold">This is your listing</p>
              <p className="text-sm">You can edit or delete it from your dashboard</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user ? (
                <>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Write a message to the seller..."
                    rows={4}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                    className={`w-full py-3 rounded-lg font-medium text-white transition ${
                      sendingMessage
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {sendingMessage ? '💬 Sending...' : '💬 Send Message to Seller'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Sign In to Message Seller
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
