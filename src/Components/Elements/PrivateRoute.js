import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CookieService from '../Utils/CookieService';

const PrivateRoute = ({ children }) => {
  const token = CookieService.get('token');
  const location = useLocation();

  return token ? children : <Navigate to={`/${location?.search}`} state={{ from: location }} replace />;
};

export default PrivateRoute;
