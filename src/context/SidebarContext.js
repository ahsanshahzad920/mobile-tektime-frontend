import React, { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const useSidebarContext = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [show, setShow] = useState(true);
  const toggle = (param) => {
    setShow(param);
  };

  return (
    <SidebarContext.Provider value={{ show, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};
