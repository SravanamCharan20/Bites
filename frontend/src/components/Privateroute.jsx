// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return isAuthenticated ? Component : <Navigate to="/signin" />;
};

export default PrivateRoute;