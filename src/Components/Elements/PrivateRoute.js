import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import CookieService from '../Utils/CookieService';

const PrivateRoute = ({ children }) => {
  const token = CookieService.get('token');
  const location = useLocation();

  const isSubscriptionExpired =
    localStorage.getItem('subscription_expired') === 'true' ||
    sessionStorage.getItem('subscription_expired') === 'true';

  if (token && isSubscriptionExpired) {
    return <Navigate to="/subscription-expired" replace />;
  }

  return token ? children : <Navigate to={`/${location?.search}`} state={{ from: location }} replace />;
};

export default PrivateRoute;
