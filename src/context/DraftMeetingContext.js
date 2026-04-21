import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DraftMeetingsContext = createContext();

export const useDraftMeetings = () => useContext(DraftMeetingsContext);

export const DraftMeetingsProvider = ({ children }) => {
  const [language, setLanguage] = useState("fr"); // Default to French
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  // Update language in i18n on initial render and when language changes
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const updateLanguage = (language) => {
    setLanguage(language);
  };
  return (
    <DraftMeetingsContext.Provider value={{ language, updateLanguage,searchTerm,setSearchTerm }}>
      {children}
    </DraftMeetingsContext.Provider>
  );
};
