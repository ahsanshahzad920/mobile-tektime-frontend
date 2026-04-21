import React, { createContext, useState, useContext } from 'react';

const StepContext = createContext();

export const StepProvider = ({ children }) => {
  const [apiResponses] = useState([]);


  const contextValue = {
    apiResponses,
  };

  return (
    <StepContext.Provider value={contextValue}>
      {children}
    </StepContext.Provider>
  );
};

export const useApiResponses = () => useContext(StepContext);
