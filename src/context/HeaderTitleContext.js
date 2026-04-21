import CookieService from '../Components/Utils/CookieService';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
const HeaderTitleContext = createContext();

export const useHeaderTitle = () => {
  const context = useContext(HeaderTitleContext);
  if (!context) {
    throw new Error("useHeaderTitle must be used within a HeaderTitleProvider");
  }
  return context;
};

export const HeaderTitleProvider = ({ children }) => {
  const [title, setTitle] = useState(
    JSON.parse(CookieService.get("headerTitle") || "[]")
  );
  const [profileImage, setProfileImage] = useState("");
  const [user,setUser] = useState(null)
  const [callUser,setCallUser] = useState(false)
  useEffect(() => {
  }, [profileImage]);

  const pushHeaderTitle = useCallback((newTitle) => {
    setTitle((prevHeaderTitle) => [...prevHeaderTitle, newTitle]);
  }, []);

  const popHeaderTitle = useCallback(() => {
    setTitle((prevHeaderTitle) => {
      const newHeaderTitle = [...prevHeaderTitle];
      newHeaderTitle.pop();
      return newHeaderTitle;
    });
  }, []);

  const resetHeaderTitle = useCallback(() => {
    CookieService.remove("headerTitle");
    setTitle([]);
  }, []);

  const setHeaderTitle = useCallback((newTitle) => {
    setTitle(newTitle);
  }, []);

  useEffect(() => {
    if (title.length === 0) {
      CookieService.remove("headerTitle");
    }
    CookieService.set("headerTitle", title);
  }, [title]);

  const contextValue = React.useMemo(() => ({
    title,
    profileImage,
    setProfileImage,
    pushHeaderTitle,
    popHeaderTitle,
    setHeaderTitle,
    resetHeaderTitle,
    setUser,
    user,
    setCallUser,
    callUser
  }), [
    title, profileImage, pushHeaderTitle, popHeaderTitle, setHeaderTitle, 
    resetHeaderTitle, user, callUser
  ]);

  return (
    <HeaderTitleContext.Provider value={contextValue}>
      {children}
    </HeaderTitleContext.Provider>
  );
};
