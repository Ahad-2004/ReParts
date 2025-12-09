import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Chat {
  id: string;
  buyerId: string;
  buyerEmail?: string;
  sellerId: string;
  sellerEmail?: string;
  listingId: string;
  listingTitle?: string;
  listingPrice?: number;
  createdAt: any;
  updatedAt: any;
  lastMessagePreview?: string;
}

export default function MessagesHub() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');

  // Fetch all chats for the user
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await axios.get('/api/chat', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chatsData = (response.data || []) as Chat[];

        // Fetch listing details for each chat to show product info
        const enrichedChats = await Promise.all(
          chatsData.map(async (chat) => {
            try {
              const listingRes = await axios.get(`/api/listings/${chat.listingId}`);
              return {
                ...chat,
                listingTitle: listingRes.data?.title,
                listingPrice: listingRes.data?.price,
              };
            } catch (e) {
              return chat;
            }
          })
        );

        // Sort by most recent first
        enrichedChats.sort((a, b) => {
          const ta = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt).getTime();
          const tb = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt).getTime();
          return tb - ta;
        });

        setChats(enrichedChats);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load chats');
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    };

    if (!loading) fetchChats();
  }, [user, loading]);

  // Filter chats based on user role
  const filteredChats = chats.filter((chat) => {
    if (filter === 'buying') return chat.buyerId === user?.uid;
    if (filter === 'selling') return chat.sellerId === user?.uid;
    return true;
  });

  const buyingChats = chats.filter((c) => c.buyerId === user?.uid);
  const sellingChats = chats.filter((c) => c.sellerId === user?.uid);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-semibold mb-4">Please sign in to view your messages</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">💬 Messages</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-3 font-medium transition border-b-2 ${
            filter === 'all'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          All Messages ({chats.length})
        </button>
        <button
          onClick={() => setFilter('buying')}
          className={`px-4 py-3 font-medium transition border-b-2 ${
            filter === 'buying'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Buying ({buyingChats.length})
        </button>
        <button
          onClick={() => setFilter('selling')}
          className={`px-4 py-3 font-medium transition border-b-2 ${
            filter === 'selling'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Selling ({sellingChats.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loadingChats ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your messages...</p>
          </div>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">
            {filter === 'all' ? 'No messages yet.' : `No ${filter} conversations yet.`}
          </p>
          {filter === 'all' || filter === 'buying' ? (
            <button
              onClick={() => navigate('/listings')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Your Listings
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChats.map((chat) => {
            const isBuyer = chat.buyerId === user?.uid;
            const otherUserEmail = isBuyer ? chat.sellerEmail : chat.buyerEmail;
            const roleLabel = isBuyer ? '(Buyer)' : '(Seller)';

            return (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition border-l-4 border-blue-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{chat.listingTitle || 'Product'}</h3>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ₹{chat.listingPrice ? Number(chat.listingPrice).toFixed(0) : '0'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {isBuyer ? '💬 Seller: ' : '👤 Buyer: '}
                      <span className="font-medium">{otherUserEmail || 'Unknown'}</span>
                      <span className="text-xs text-gray-500 ml-2">{roleLabel}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Last message:{' '}
                      <span className="text-gray-700">
                        {new Date(
                          chat.updatedAt?.toDate?.() || chat.updatedAt
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${chat.id}`);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm whitespace-nowrap"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
