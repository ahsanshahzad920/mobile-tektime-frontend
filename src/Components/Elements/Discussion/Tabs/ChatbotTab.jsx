import CookieService from '../../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { Space, Spin, Tabs, Avatar, Typography } from "antd";
import { SiChatbot } from "react-icons/si";
import Chatbot from "../Chatbot/Chatbot";
import { getAllChatbots } from "../api";

const { Text } = Typography;

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

  const tabItems = chatbotData?.destination ? [{
    key: '1',
    label: (
      <Space>
        <SiChatbot size={18} className="text-primary" />
        <Text strong ellipsis style={{ maxWidth: 200 }}>{chatbotData.destination.destination_name}</Text>
      </Space>
    )
  }] : [];

  return (
    <div className="h-100 d-flex flex-column bg-white">
      {loading ? (
        <div className="p-5 text-center">
          <Spin size="large" tip="Chargement de l'assistant..." />
        </div>
      ) : (
        <>
          <div className="px-3 border-bottom shadow-sm">
            <Tabs items={tabItems} activeKey="1" tabBarStyle={{ marginBottom: 0 }} />
          </div>
          <div className="flex-grow-1 overflow-hidden">
            {chatbotData?.conversations?.length > 0 ? (
              <Chatbot meetingsData={chatbotData.conversations} />
            ) : (
              <div className="p-5 text-center text-muted">Aucune conversation trouvée</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotTab;
