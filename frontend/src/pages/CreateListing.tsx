import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { authFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('laptop');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [titleError, setTitleError] = useState('');
  const [priceError, setPriceError] = useState('');

  async function handleUpload(): Promise<string> {
    if (!file) throw new Error('No file selected');
    
    setUploadProgress(25);
    
    const signRes = await fetch('/api/upload/sign', { 
      headers: { Authorization: `Bearer ${await auth.currentUser?.getIdToken()}` } 
    });
    if (!signRes.ok) throw new Error('Failed to get upload signature');
    const sign = await signRes.json();

    setUploadProgress(50);

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sign.apiKey);
    form.append('timestamp', String(sign.timestamp));
    form.append('signature', sign.signature);

    const cloudName = sign.cloudName;
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    
    setUploadProgress(80);
    
    if (!resp.ok) throw new Error('Image upload failed');
    const data = await resp.json();
    
    setUploadProgress(100);
    
    return data.secure_url;
  }

  function validateForm(): boolean {
    let valid = true;
    setTitleError('');
    setPriceError('');

    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    }
    if (!price || Number(price) <= 0) {
      setPriceError('Price must be greater than 0');
      valid = false;
    }

    return valid;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await handleUpload();
      }

      await authFetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          price: Number(price), 
          category,
          images: imageUrl ? [imageUrl] : [] 
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/listings');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Create a Listing</h1>
        <p className="text-gray-600">Tell buyers about your recycled electronics</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
          <p className="font-semibold">✓ Listing created successfully!</p>
          <p className="text-sm">Redirecting to your listings...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              titleError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Dell ThinkPad Laptop - Good Condition"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
          />
          {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Describe the condition, specifications, and any defects..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="laptop">💻 Laptop</option>
            <option value="phone">📱 Phone</option>
            <option value="tablet">📱 Tablet</option>
            <option value="accessory">🎧 Accessory</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (₹ INR) *
          </label>
          <input
            type="number"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
              priceError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (priceError) setPriceError('');
            }}
          />
          {priceError && <p className="text-red-500 text-sm mt-1">{priceError}</p>}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div>
                  <p className="text-green-600 font-medium">✓ {file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-2">📸</p>
                  <p className="text-gray-700 font-medium">Click to upload image</p>
                  <p className="text-sm text-gray-600">or drag and drop</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Uploading: {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-lg font-medium text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                {uploadProgress > 0 ? 'Uploading...' : 'Creating...'}
              </span>
            ) : (
              '✓ Create Listing'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
