// src/components/Logout.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../reducers/userSlice';

const Logout = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    dispatch(logout());
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={handleLogout}
      className='px-4 py-2 bg-red-700 text-white rounded-full hover:bg-red-500'
    >
      Logout
    </button>
  );
};

export default Logout;