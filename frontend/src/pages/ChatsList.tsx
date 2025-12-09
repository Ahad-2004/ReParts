import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface ChatItem {
  id: string;
  buyerId?: string;
  buyerEmail?: string;
  sellerId?: string;
  listingId?: string;
}

export default function ChatsList() {
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listingId');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const url = listingId ? `/api/chat?listingId=${listingId}` : `/api/chat`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setChats(res.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load chats');
      }
    };
    if (!loading) fetch();
  }, [user, loading, listingId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chats {listingId ? `for listing ${listingId}` : ''}</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-3">
        {chats.map(c => (
          <div key={c.id} className="p-3 bg-white rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">Chat ID: {c.id}</div>
              <div className="text-sm text-gray-600">Buyer: {c.buyerEmail || c.buyerId}</div>
            </div>
            <div>
              <button onClick={() => navigate(`/chat/${c.id}`)} className="px-3 py-2 bg-blue-600 text-white rounded">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
