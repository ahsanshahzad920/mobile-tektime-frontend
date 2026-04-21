import React, { createContext, useState, useContext } from 'react';

const MeetingTabsContext = createContext();

export const useMeetingTabs = () => useContext(MeetingTabsContext);

export const MeetingTabsProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <MeetingTabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </MeetingTabsContext.Provider>
  );
};
