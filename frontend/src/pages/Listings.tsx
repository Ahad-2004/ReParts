import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  sellerId: string;
  createdAt: any;
}

const ITEMS_PER_PAGE = 12;

export default function Listings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchListings = useCallback(async (pageNum: number) => {
    try {
      const response = await axios.get(`/api/listings?page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
      const newListings = response.data.data || [];
      
      if (pageNum === 1) {
        setListings(newListings);
      } else {
        setListings((prev) => [...prev, ...newListings]);
      }

      // If we got fewer items than requested, there are no more pages
      if (newListings.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchListings(1);
      setLoading(false);
    };
    load();
  }, [fetchListings]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          fetchListings(page + 1).then(() => {
            setPage((prev) => prev + 1);
            setLoadingMore(false);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [page, hasMore, loadingMore, loading, fetchListings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error loading listings</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 All Listings</h1>
        <p className="text-gray-600">Browse {listings.length} available components</p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">No listings yet.</p>
          <Link to="/create" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            Be the first to list →
          </Link>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                <div className="bg-gray-200 h-40 flex items-center justify-center overflow-hidden">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl">📱</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{listing.title}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-blue-600">₹{listing.price ? Number(listing.price).toFixed(2) : '0.00'}</p>
                     <div className="flex gap-2">
                       <Link
                         to={`/listings/${listing.id}`}
                         className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition"
                       >
                         View
                       </Link>
                       <button
                         onClick={() => {
                           if (!user) {
                             navigate('/auth');
                           } else {
                             navigate(`/listings/${listing.id}`);
                           }
                         }}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition"
                       >
                         Message
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="mt-12 text-center">
            {loadingMore && (
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {!hasMore && listings.length > 0 && (
              <p className="text-gray-500 text-sm">No more listings to load</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
