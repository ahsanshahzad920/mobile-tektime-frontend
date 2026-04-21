import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    last_name: '',
    nick_name: '',
    link: '',
    post: '',
    email: '',
    enterprise_id: null,
    team_id: [],
    role_id: null,
    image: '', // Initial profile image state
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
