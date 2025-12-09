import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Chat from './pages/Chat';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import Search from './pages/Search';
import SellerDashboard from './pages/SellerDashboard';
import EditListing from './pages/EditListing';
import MessagesHub from './pages/MessagesHub';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">🔧 ReParts</Link>
          <nav className="flex items-center gap-6">
            <Link to="/search" className="text-gray-700 hover:text-blue-600 transition">Search</Link>
            <Link to="/listings" className="text-gray-700 hover:text-blue-600 transition">Browse</Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link to="/messages" className="text-gray-700 hover:text-blue-600 transition font-medium">💬 Messages</Link>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition font-medium">My Listings</Link>
                    <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      + Sell
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{user.email}</span>
                      <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition">Sign Out</button>
                    </div>
                  </>
                ) : (
                  <Link to="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Sign In</Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={user ? <CreateListing /> : <Auth />} />
            <Route path="/dashboard" element={user ? <SellerDashboard /> : <Auth />} />
            <Route path="/edit/:id" element={user ? <EditListing /> : <Auth />} />
            <Route path="/messages" element={user ? <MessagesHub /> : <Auth />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}
