import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">♻️ Welcome to ReParts</h1>
      <p className="text-xl text-gray-600 mb-8">A marketplace for buying and selling recycled electronic components</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-bold text-lg mb-2">Search & Browse</h3>
          <p className="text-gray-600 text-sm mb-4">Find quality used components in seconds</p>
          <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">Browse Items →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-bold text-lg mb-2">Sell Components</h3>
          <p className="text-gray-600 text-sm mb-4">List your recycled electronics easily</p>
          <Link to="/create" className="text-blue-600 hover:text-blue-700 font-medium">Start Selling →</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-3xl mb-2">💬</div>
          <h3 className="font-bold text-lg mb-2">Chat & Negotiate</h3>
          <p className="text-gray-600 text-sm mb-4">Message sellers directly with offers</p>
          <Link to="/listings" className="text-blue-600 hover:text-blue-700 font-medium">View Listings →</Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mt-12">
        <h2 className="text-3xl font-bold mb-4">Why choose ReParts?</h2>
        <ul className="text-left inline-block space-y-2">
          <li>✓ Verified sellers and buyers</li>
          <li>✓ Real-time chat with secure transactions</li>
          <li>✓ Quality checked components</li>
          <li>✓ Eco-friendly electronics marketplace</li>
        </ul>
      </div>
    </div>
  );
}
