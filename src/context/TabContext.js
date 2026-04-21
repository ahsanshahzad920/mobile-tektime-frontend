import React, { createContext, useState, useContext, useMemo } from 'react';

const TabsContext = createContext();

export const useTabs = () => useContext(TabsContext);

export const TabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('tab1');

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab, setActiveTab]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};
