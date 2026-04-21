import React, { createContext, useState, useContext } from 'react';

const DestinationTabsContext = createContext();

export const useDestinationTabs = () => useContext(DestinationTabsContext);

export const DestinationTabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('My Clients');

  return (
    <DestinationTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DestinationTabsContext.Provider>
  );
};
