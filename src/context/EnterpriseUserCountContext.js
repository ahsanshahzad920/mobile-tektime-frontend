import CookieService from '../Components/Utils/CookieService';
// src/context/EnterpriseUserCountContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Components/Apicongfig';

const EnterpriseUserCountContext = createContext();

export const EnterpriseCountProvider = ({ children }) => {
  const [enterpriseCount, setEnterpriseCount] = useState(0);
  const [discussionCount, setDiscussionCount] = useState(0);

  const fetchEnterpriseCount = async () => {
    const token = CookieService.get('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/get-unread-enterprise-count`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setEnterpriseCount(response.data.data);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching enterprise count:', error);
      }
    }
  };
  const fetchDiscussionCount = async () => {
    const token = CookieService.get('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/user/unread-meeting-messages-count`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setDiscussionCount(response.data.data?.unread_messages_count);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching discussion count:', error);
      }
    }
  };
  const readEnterpriseUserCount = async () => {
    const token = CookieService.get('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/mark-all-enterprise-as-read `, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setEnterpriseCount(0);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching enterprise count:', error);
      }
    }
  };

  return (
    <EnterpriseUserCountContext.Provider value={{ enterpriseCount,discussionCount, fetchEnterpriseCount, fetchDiscussionCount, readEnterpriseUserCount }}>
      {children}
    </EnterpriseUserCountContext.Provider>
  );
};

export const useEnterpriseCount = () => useContext(EnterpriseUserCountContext);