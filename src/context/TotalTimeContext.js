import React, { createContext, useContext, useState } from 'react';

const TotalTimeContext = createContext();

export const TotalTimeProvider = ({ children }) => {
  const [total_Time, setTotal_Time] = useState(0);

  const updateTotalTime = (newTotalTime) => {
    setTotal_Time(newTotalTime);
  };

  return (
    <TotalTimeContext.Provider value={{ total_Time, updateTotalTime }}>
      {children}
    </TotalTimeContext.Provider>
  );
};

export const useTotalTime = () => {
  const context = useContext(TotalTimeContext);
  if (!context) {
    throw new Error('useTotalTime must be used within a TotalTimeProvider');
  }
  return context;
};
