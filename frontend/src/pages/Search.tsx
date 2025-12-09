import React, { useState, useEffect } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const client = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_SEARCH_KEY);
const index = client.initIndex('reparts_listings');

interface SearchResult {
  objectID: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt?: number;
}

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function doSearch(q: string) {
    if (!q) {
      setResults([]);
      setSearchPerformed(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const res = await index.search(q, { hitsPerPage: 12 });
      setResults(res.hits as SearchResult[]);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Search Listings</h1>
        <p className="text-gray-600">Find the perfect recycled components</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 sticky top-20 z-40">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Search by title, category, or description..."
          />
          <span className="absolute left-4 top-3.5 text-xl">🔍</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          <p className="font-semibold">Search Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        </div>
      )}

      {/* No Search Performed */}
      {!searchPerformed && !loading && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          <p className="text-3xl mb-4">🔎</p>
          <p className="text-gray-600 text-lg">Start searching to find great deals on recycled electronics</p>
        </div>
      )}

      {/* No Results */}
      {searchPerformed && !loading && results.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-3xl mb-4">📭</p>
          <p className="text-gray-600 text-lg mb-2">No results for "{query}"</p>
          <p className="text-gray-500 text-sm">Try a different search term or browse all listings</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-4">Found {results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.objectID}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer hover:scale-105 transform duration-200"
              >
                <div className="bg-gray-200 h-40 flex items-center justify-center overflow-hidden">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">📦</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{result.price ? Number(result.price).toFixed(2) : '0.00'}
                    </p>
                     <div className="flex gap-2">
                       <Link
                         to={`/listings/${result.objectID}`}
                         className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition"
                       >
                         View
                       </Link>
                       <button
                         onClick={() => {
                           if (!user) {
                             navigate('/auth');
                           } else {
                             navigate(`/listings/${result.objectID}`);
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
        </div>
      )}
    </div>
  );
}
