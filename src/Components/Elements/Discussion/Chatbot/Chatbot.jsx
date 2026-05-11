import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  Avatar,
  Badge,
  Button,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import {
  FaChevronLeft,
  FaRobot,
  FaSyncAlt,
  FaUsers,
  FaTimes,
  FaClock,
  FaList,
  FaCompress,
  FaComments,
} from "react-icons/fa";
import { SiChatbot } from "react-icons/si";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import ChatbotParticipant from "./ChatbotParticipant";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatMomentDate = (dateStr) => {
  if (!dateStr) return "";
  const date = moment(dateStr);
  const now = moment();
  if (date.isSame(now, "day")) return date.format("HH:mm");
  if (date.isSame(now.clone().subtract(1, "day"), "day")) return "Hier";
  return date.format("DD/MM");
};

// ── Moment list item ────────────────────────────────────────────────────────────
const MomentItem = ({ item, isSelected, onClick }) => {
  const title = item.title || "Conversation";
  const subtitle = item?.destination?.destination_name || "Chatbot";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        margin: "6px 10px",
        padding: "12px 14px",
        borderRadius: "10px",
        backgroundColor: isSelected ? "#f0f7ff" : "#fff",
        border: isSelected ? "1px solid #1890ff" : "1px solid #f0f0f0",
        boxShadow: isSelected
          ? "0 4px 12px rgba(24,144,255,0.1)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
        position: "relative",
        cursor: "pointer",
      }}
      className={isSelected ? "" : "chatbot-list-item"}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: "3px",
            backgroundColor: "#1890ff",
            borderRadius: "0 4px 4px 0",
          }}
        />
      )}
      <div className="d-flex gap-3 align-items-start w-100 overflow-hidden">
        <Avatar
          size={34}
          icon={<SiChatbot size={16} />}
          style={{
            backgroundColor: isSelected ? "#1890ff" : "#e6f7ff",
            color: isSelected ? "#fff" : "#1890ff",
            flexShrink: 0,
          }}
        />
        <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
          <div className="d-flex justify-content-between align-items-start gap-1 mb-1">
            <Text
              strong
              ellipsis
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: isSelected ? "#1890ff" : "#1a1a1a",
                flex: 1,
              }}
            >
              {title}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "10px", whiteSpace: "nowrap", marginTop: 2 }}
            >
              {formatMomentDate(item.date || item.updated_at)}
            </Text>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <Text
              type="secondary"
              ellipsis
              style={{ fontSize: "11px", flex: 1 }}
            >
              {subtitle}
            </Text>
            {item.unread_messages_count > 0 && (
              <Badge
                count={item.unread_messages_count}
                size="small"
                style={{
                  backgroundColor: "#1890ff",
                  marginLeft: 6,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Message bubble ──────────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isBot = message?.sender?.type === "bot";
  const senderName = message?.sender?.name || (isBot ? "Assistant" : "User");
  const avatarRaw = message?.sender?.image;
  const avatarSrc = avatarRaw
    ? avatarRaw.startsWith("http")
      ? avatarRaw
      : `${Assets_URL}/${avatarRaw}`
    : null;
  const initials = senderName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dateStr = message.created_at
    ? moment.utc(message.created_at).local().format("DD/MM/YYYY HH:mm")
    : "";

  return (
    <div
      className="d-flex justify-content-start"
      style={{ width: "100%", overflow: "hidden", marginBottom: 14 }}
    >
      <div
        className="d-flex gap-2 flex-row"
        style={{
          maxWidth: "85%",
          minWidth: 0,
          overflow: "hidden",
          alignItems: "flex-start",
        }}
      >
        <div style={{ width: 30, flexShrink: 0, alignSelf: "flex-start" }}>
          <Avatar size="small" src={avatarSrc} className="shadow-sm">
            {initials}
          </Avatar>
        </div>

        <div
          className="d-flex flex-column align-items-start"
          style={{ minWidth: 0, overflow: "hidden", flex: 1 }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <Text
              strong
              style={{
                fontSize: "12px",
                color: isBot ? "#1890ff" : "#262626",
                whiteSpace: "nowrap",
              }}
            >
              {senderName}
            </Text>
            <Text type="secondary" style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
              {dateStr}
            </Text>
          </div>

          <div
            className="p-3 rounded-4 shadow-sm border"
            style={{
              lineHeight: "1.5",
              fontSize: "14px",
              position: "relative",
              minWidth: "60px",
              maxWidth: "100%",
              overflow: "hidden",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              backgroundColor: isBot ? "#e6f7ff" : "#fff",
              borderColor: isBot ? "#91d5ff" : "#e8e8e8",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: message.message }}
              className="text-dark"
              style={{
                overflowX: "auto",
                maxWidth: "100%",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            />
            <div className="text-end" style={{ marginTop: "4px", opacity: 0.5 }}>
              <Text type="secondary" style={{ fontSize: "9px" }}>
                {dateStr}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────────
const Chatbot = ({ meetingsData, destination }) => {
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isParticipantsCollapsed, setIsParticipantsCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const [t] = useTranslation("global");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedMoment?.id) fetchMessages(selectedMoment.id);
  }, [selectedMoment?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = useCallback(async (momentId) => {
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const token = CookieService.get("token");
      const resp = await axios.get(
        `${API_BASE_URL}/chatbot_conversation_logs/${momentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(resp.data?.data?.logs || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const handleMomentSelect = (mom) => {
    setSelectedMoment(mom);
    setIsFullScreen(true); // always go fullscreen on moment click
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedMoment(null);
    setMessages([]);
  };

  const moments = meetingsData || [];

  // ── Fullscreen layout (3 columns: moments list | messages | participants) ──
  if (isFullScreen) {
    return (
      <Layout
        className="position-fixed top-0 start-0 w-100 h-100 bg-white"
        style={{ zIndex: 10000, overflow: "hidden", height: "100dvh" }}
      >
        {/* Left: moments list */}
        <div
          style={{
            width: isMobile ? "100%" : "300px",
            flex: isMobile ? "0 0 auto" : "0 0 300px",
            flexShrink: 0,
            display: isMobile && selectedMoment ? "none" : "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          {/* Sider header */}
          <div
            style={{
              padding: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(to right, #fafafa, #fff)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: "#e6f7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaClock color="#1890ff" size={14} />
              </div>
              <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
                MOMENTS
              </Text>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge count={moments.length} showZero color="#1890ff" />
              <Button
                type="text"
                size="small"
                icon={<FaTimes size={12} />}
                onClick={handleCloseFullScreen}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
            {moments.map((item) => (
              <MomentItem
                key={item.id}
                item={item}
                isSelected={selectedMoment?.id === item.id}
                onClick={() => setSelectedMoment(item)}
              />
            ))}
          </div>
        </div>

        {/* Center: messages (read-only) */}
        <Content
          className={`d-flex flex-column h-100 overflow-hidden bg-white ${isMobile && !selectedMoment ? "d-none" : ""}`}
        >
          {/* Chat header */}
          <div
            style={{
              flexShrink: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              padding: isMobile ? "8px 12px" : "12px 16px",
              gap: 8,
              overflow: "hidden",
              borderBottom: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
              }}
            >
              {isMobile && selectedMoment && (
                <Button
                  type="text"
                  icon={<FaChevronLeft />}
                  style={{ flexShrink: 0 }}
                  onClick={handleCloseFullScreen}
                />
              )}
              <Avatar
                icon={<SiChatbot />}
                size={isMobile ? 36 : 44}
                style={{
                  backgroundColor: "#1890ff",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(24,144,255,0.2)",
                }}
              />
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <Title
                  level={5}
                  className="m-0"
                  ellipsis={{ tooltip: selectedMoment?.title || "Chatbot" }}
                  style={{
                    marginBottom: 0,
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: 700,
                  }}
                >
                  {selectedMoment?.title || "Chatbot"}
                </Title>
                <div className="d-flex align-items-center gap-2">
                  <Badge status="success" />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedMoment?.destination?.destination_name || "Conversation active"}
                  </Text>
                </div>
              </div>
            </div>

            <Space style={{ flexShrink: 0 }}>
              <Tooltip title="Rafraîchir">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaSyncAlt size={13} className="text-muted" />}
                  onClick={() => selectedMoment?.id && fetchMessages(selectedMoment.id)}
                  loading={loadingMsgs}
                />
              </Tooltip>
              <Tooltip title="Fermer">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaCompress size={13} className="text-muted" />}
                  onClick={handleCloseFullScreen}
                />
              </Tooltip>
            </Space>

          </div>

          {/* Messages area — READ ONLY, no composer */}
          <div
            className="flex-grow-1 p-2 p-md-4"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              scrollBehavior: "smooth",
              backgroundColor: "#fafafa",
            }}
          >
            {!selectedMoment ? (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                <FaComments size={48} className="mb-3" />
                <Text>Sélectionnez une conversation pour commencer</Text>
              </div>
            ) : loadingMsgs ? (
              <div className="h-100 d-flex align-items-center justify-content-center">
                <Spin size="large" tip="Chargement..." />
              </div>
            ) : messages.length > 0 ? (
              <>
                <div className="d-flex flex-column">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                <FaRobot size={48} className="mb-3" />
                <Text>Aucun message pour cette conversation</Text>
              </div>
            )}
          </div>
          {/* ── No message composer — chatbot is read-only ── */}
        </Content>

        {/* Right: participants */}
        <Sider
          width={isParticipantsCollapsed ? 70 : 260}
          theme="light"
          className="border-start d-none d-lg-block"
          style={{ overflow: "hidden", transition: "width 0.15s ease" }}
        >
          <div className="h-100 d-flex flex-column overflow-hidden">
            <div
              className={`border-bottom d-flex ${isParticipantsCollapsed ? "justify-content-center" : "justify-content-between"} align-items-center`}
              style={{
                flexShrink: 0,
                padding: "16px",
                background: "linear-gradient(to left, #fafafa, #fff)",
              }}
            >
              {!isParticipantsCollapsed && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: "#f6ffed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaUsers color="#52c41a" size={14} />
                  </div>
                  <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                    PARTICIPANTS
                  </Text>
                </div>
              )}
              <Button
                type="text"
                icon={isParticipantsCollapsed ? <FaUsers /> : <FaTimes />}
                onClick={() => setIsParticipantsCollapsed(!isParticipantsCollapsed)}
                style={{ borderRadius: 8 }}
              />
            </div>
            <div className="flex-grow-1" style={{ overflowY: "auto" }}>
              {!isParticipantsCollapsed && (
                <ChatbotParticipant
                  selectedMoment={selectedMoment}
                  isCollapsed={isParticipantsCollapsed}
                />
              )}
            </div>
          </div>
        </Sider>

        <style>{`
          .chatbot-list-item:hover {
            background-color: #fafafa !important;
            border-color: #d9d9d9 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
          }
        `}</style>
      </Layout>
    );
  }

  // ── Default view (2-column on desktop, stacked on mobile) ──────────────────
  return (
    <div
      className={`h-100 bg-white ${isMobile ? 'd-flex flex-column' : 'd-flex'}`}
      style={{ overflow: "hidden" }}
    >
      {/* 1. MISSIONS Panel (Desktop Sider / Mobile Header Select) */}
      {!isMobile ? (
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          {/* Desktop Missions header */}
          <div
            style={{
              padding: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(to right, #fafafa, #fff)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: "#e6f7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaList color="#1890ff" size={14} />
              </div>
              <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
                MISSIONS
              </Text>
            </div>
            <Badge count={destination ? 1 : 0} showZero color="#1890ff" />
          </div>

          {/* Desktop single destination card */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {destination ? (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#f0f7ff",
                  border: "1px solid #1890ff",
                  boxShadow: "0 4px 12px rgba(24,144,255,0.1)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "3px",
                    backgroundColor: "#1890ff",
                    borderRadius: "0 4px 4px 0",
                  }}
                />
                <div className="d-flex gap-3 align-items-center">
                  <Avatar
                    size={36}
                    icon={<SiChatbot size={16} />}
                    style={{ backgroundColor: "#1890ff", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <Text
                      strong
                      ellipsis
                      style={{ fontSize: "13px", color: "#1890ff", display: "block" }}
                    >
                      {destination.destination_name || "Chatbot"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {moments.length} conversation{moments.length !== 1 ? "s" : ""}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-muted">
                <SiChatbot size={24} className="mb-2 opacity-25" />
                <Text type="secondary" className="d-block" style={{ fontSize: "12px" }}>
                  Aucune mission
                </Text>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mobile Missions Select (Consistency with other tabs)
        <div className="p-3 border-bottom bg-light bg-opacity-10">
          <Text strong type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 8 }}>MISSIONS</Text>
          <Select
            className="w-100"
            value="chatbot"
            style={{ height: '44px' }}
            dropdownStyle={{ borderRadius: '8px' }}
          >
            <Select.Option value="chatbot">
              <div className="d-flex align-items-center gap-2">
                <Avatar size="small" icon={<SiChatbot />} style={{ backgroundColor: "#1890ff" }} />
                <Text strong style={{ color: "#1890ff" }}>{destination?.destination_name || "Chatbot"}</Text>
              </div>
            </Select.Option>
          </Select>
        </div>
      )}

      {/* 2. MOMENTS List Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* Moments Header */}
        <div
          style={{
            padding: "16px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#52c41a",
              }}
            />
            <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
              MOMENTS
            </Text>
          </div>
          <Badge count={moments.length} showZero color="#1890ff" />
        </div>

        {/* Moments List */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: isMobile ? '8px 0' : 0 }}>
          {moments.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <FaRobot size={32} className="mb-3 opacity-25" />
              <Text type="secondary">Aucune conversation trouvée</Text>
            </div>
          ) : (
            moments.map((item) => (
              <MomentItem
                key={item.id}
                item={item}
                isSelected={false}
                onClick={() => handleMomentSelect(item)}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        .chatbot-list-item:hover {
          background-color: #fafafa !important;
          border-color: #d9d9d9 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
