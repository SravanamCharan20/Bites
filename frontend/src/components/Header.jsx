// src/components/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logout from './Logout'; // Import the Logout component

const Header = () => {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);

  // Extract userId from currentUser
  const userId = currentUser?.id; // Ensure userId is correctly set

  return (
    <header className="bg-blue-500 text-white shadow-md p-4 flex items-center justify-between">
      <div className="flex-shrink-0">
        <Link to="/" className="text-4xl font-mono p-4">
          Ecobites
        </Link>
      </div>

      <nav className="flex-grow flex justify-center space-x-4">
        <Link
          to="/avl"
          className={`px-4 py-2 rounded-md ${
            location.pathname === '/avl'
              ? 'bg-slate-700 text-white'
              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Avl
        </Link>
        <Link
          to="/donate"
          className={`px-4 py-2 rounded-md ${
            location.pathname === '/donate'
              ? 'bg-slate-700 text-white'
              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Donate
        </Link>

        {currentUser && (
          <Link
          to={`/donor/requests/${currentUser?.id}`}  // Use userId instead of donorId
          className={`px-4 py-2 rounded-md ${
            location.pathname === `/donor/requests/${currentUser?.id}`
              ? 'bg-slate-700 text-white'
              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          My Requests
        </Link>
        )}

        <Link
          to="/about"
          className={`px-4 py-2 rounded-md ${
            location.pathname === '/about'
              ? 'bg-slate-700 text-white'
              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          About
        </Link>

        {currentUser ? (
          <Logout />
        ) : (
          <Link
            to="/signup"
            className={`px-4 py-2 rounded-md ${
              location.pathname === '/signup'
                ? 'bg-slate-700 text-white'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Signup
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;