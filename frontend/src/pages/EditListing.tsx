import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
  });
  const [loadingListing, setLoadingListing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`/api/listings/${id}`);
        const data = response.data;
        setListing(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category: data.category || 'Electronics',
          imageUrl: data.imageUrl || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load listing');
      } finally {
        setLoadingListing(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  // Check ownership
  useEffect(() => {
    if (listing && user && listing.sellerId !== user.uid) {
      setError('You do not have permission to edit this listing.');
    }
  }, [listing, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const token = await user!.getIdToken();
      await axios.put(
        `/api/listings/${id}`,
        {
          ...formData,
          price: parseFloat(formData.price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Listing updated successfully');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingListing) {
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
        <p className="text-blue-900 font-semibold mb-4">Please sign in to edit listings</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Dell Laptop - Like New"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Describe the item in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Computers">Computers</option>
                <option value="Phones">Phones</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="Preview" className="mt-4 h-48 w-auto rounded-lg object-cover" />
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 rounded-lg font-medium text-white transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Updating...' : 'Update Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
