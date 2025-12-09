import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export default function MyListings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`/api/listings?sellerId=${user.uid}`);
        setListings(res.data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      }
    };
    if (!loading) fetch();
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map(l => (
          <div key={l.id} className="p-4 bg-white rounded shadow">
            <div className="font-bold text-lg">{l.title}</div>
            <div className="text-gray-600 text-sm">₹{l.price ? Number(l.price).toFixed(2) : '0.00'}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => navigate(`/listings/${l.id}`)} className="px-3 py-2 bg-gray-600 text-white rounded">View</button>
              <button onClick={() => navigate(`/chats?listingId=${l.id}`)} className="px-3 py-2 bg-blue-600 text-white rounded">View Chats</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
