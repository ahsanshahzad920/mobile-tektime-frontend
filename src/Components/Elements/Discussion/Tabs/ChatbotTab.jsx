import CookieService from '../../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import Chatbot from "../Chatbot/Chatbot";
import { getAllChatbots } from "../api";

const ChatbotTab = ({ isActive }) => {
  const [chatbotData, setChatbotData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isActive) return;
    const fetchInitialData = async () => {
      try {
        const user = JSON.parse(CookieService.get("user"));
        const data = await getAllChatbots(user?.enterprise?.id);
        setChatbotData(data?.data);
      } catch (error) {
        console.error("Error fetching chatbot data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="h-100 d-flex flex-column bg-white">
      {loading ? (
        <div className="p-5 text-center">
          <Spin size="large" tip="Chargement de l'assistant..." />
        </div>
      ) : chatbotData?.conversations?.length > 0 ? (
        <Chatbot
          meetingsData={chatbotData.conversations}
          destination={chatbotData.destination}
        />
      ) : (
        <div className="p-5 text-center text-muted">Aucune conversation trouvée</div>
      )}
    </div>
  );
};

export default ChatbotTab;
