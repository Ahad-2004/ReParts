import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface SellerListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  imageUrl?: string;
  createdAt: any;
}

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch seller's listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await axios.get(`/api/listings?sellerId=${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(response.data?.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setLoadingListings(false);
      }
    };

    if (!loading) fetchListings();
  }, [user, loading]);

  const handleDelete = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setDeletingId(listingId);
    try {
      const token = await user!.getIdToken();
      await axios.delete(`/api/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from local state
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      alert('Listing deleted successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (listingId: string) => {
    navigate(`/edit/${listingId}`);
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-900 font-semibold mb-4">Please sign in to manage your listings</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Listing
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loadingListings ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your listings...</p>
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">You haven't listed any items yet.</p>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="bg-gray-200 h-48 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => handleViewListing(listing.id)}>
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover hover:scale-105 transition" />
                ) : (
                  <div className="text-5xl">📦</div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{listing.title}</h3>
                {listing.category && (
                  <p className="text-xs text-gray-500 mb-2">Category: <span className="capitalize">{listing.category}</span></p>
                )}
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{listing.description}</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">₹{listing.price ? Number(listing.price).toFixed(2) : '0.00'}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Listed {new Date(listing.createdAt?.toDate?.() || listing.createdAt).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewListing(listing.id)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(listing.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                    className={`flex-1 px-3 py-2 rounded-lg transition text-sm font-medium ${
                      deletingId === listing.id
                        ? 'bg-red-300 text-red-900 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
