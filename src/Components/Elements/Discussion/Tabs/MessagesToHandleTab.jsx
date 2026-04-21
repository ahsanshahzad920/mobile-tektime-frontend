import CookieService from '../../../Utils/CookieService';
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Spin, Button, Badge, Tag, Grid, Modal, List, Space, Typography, Avatar, Select, Empty } from "antd";
import { useTranslation } from "react-i18next";
import { 
  getAllEmailsLabeling, 
  getMeetingMessages,
} from "../api";

import {
  HiOutlineInbox,
  HiOutlineChat,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineSpeakerphone,
  HiOutlineMailOpen,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineViewList,
} from "react-icons/hi";
import { SiIonos } from "react-icons/si";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";

import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import DiscussionChat from "../DiscussionChat";
import { useFormContext } from "../../../../context/CreateMeetingContext";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CATEGORIES = [
  { id: "All",                   label: "Tous",                  icon: <HiOutlineViewList /> },
  { id: "Need Response",         label: "A Répondre",            icon: <HiOutlineChat /> },
  { id: "To Do",                 label: "A faire",               icon: <HiOutlineClipboardCheck /> },
  { id: "To Plan",               label: "A planifier",           icon: <HiOutlineCalendar /> },
  { id: "For Information",       label: "Pour info",             icon: <HiOutlineInbox /> },
  { id: "Waiting for Response",  label: "En attente de réponse", icon: <HiOutlineClock /> },
  { id: "Marketing",             label: "Marketing",             icon: <HiOutlineSpeakerphone /> },
  { id: "Meeting Invitation",    label: "Invitation réunion",    icon: <HiOutlineMailOpen /> },
  { id: "Notification",          label: "Notifications",         icon: <HiOutlineBell /> },
];

const CRITICITY_LEVELS = [
  { id: "All",    label: "All",    color: "#8c8c8c" },
  { id: "High",   label: "High",   color: "#f5222d" },
  { id: "Medium", label: "Medium", color: "#faad14" },
  { id: "Low",    label: "Low",    color: "#52c41a" },
];

const MessagesToHandleTab = ({ isActive, searchTerm, userData }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [t] = useTranslation("global");
  const [selectedCategory, setSelectedCategory]   = useState("All");
  const [selectedCriticity, setSelectedCriticity] = useState("High");
  const [messages, setMessages]                   = useState([]);
  const [categoryCounts, setCategoryCounts]       = useState({});
  const [loading, setLoading]                     = useState(false);  // for initial list fetch
  const [loadingMore, setLoadingMore]             = useState(false);  // for pagination
  const [page, setPage]                           = useState(1);
  const [hasMore, setHasMore]                     = useState(true);
  const [readMessage, setReadMessage]             = useState(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionModalData, setDiscussionModalData] = useState(null);

  const { open, handleCloseModal } = useFormContext();

  const fetchMessages = useCallback(async (p = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const payload = {
        user_id:  userData?.id || CookieService.get("user_id"),
        category: selectedCategory === "All" ? "All" : selectedCategory,
        periorty: selectedCriticity,
        page: p,
      };
      const data = await getAllEmailsLabeling(payload, p);
      const responseData = data?.data || data;
      if (responseData && (responseData.messages || responseData.messages_all)) {
        const messagesToMap = responseData.messages || responseData.messages_all;
        const mappedMessages = messagesToMap.map((msg) => {
          const meeting     = msg.meeting;
          const destination = meeting?.destination;
          let senderName = "Unknown";
          if (destination?.destination_name) {
            const parts = destination.destination_name.split("/");
            senderName = parts.length > 1 ? parts[1].trim() : destination.destination_name;
          } else if (msg?.from_email) {
            senderName = msg.from_email;
          }
          return {
            id:              msg?.id,
            categoryId:      msg?.category || "Need Response",
            missionTitle:    meeting?.objective || "No Title",
            momentTitle:     meeting?.title || "Unknown Moment",
            sender:          msg?.from_email || senderName,
            date:            msg?.received_date_time || msg?.created_at,
            content:         msg?.message,
            criticity:       msg?.priority || "Medium",
            meetingId:       msg?.meeting_id,
            destinationId:   destination?.id,
            isRead:          msg?.is_read === 1 || msg?.is_read === true,
            originalMessage: msg,
            originalMeeting: meeting,
          };
        }) || [];

        if (isLoadMore) {
          setMessages((prev) => [...prev, ...mappedMessages]);
        } else {
          setMessages(mappedMessages);
        }

        setHasMore(mappedMessages.length > 0);
        setPage(p);
        setCategoryCounts(responseData.unseen_category_counts || {});
      } else {
        if (!isLoadMore) {
          setMessages([]);
          setCategoryCounts({});
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userData, selectedCategory, selectedCriticity]);

  useEffect(() => {
    if (isActive) {
      setPage(1);
      setHasMore(true);
      fetchMessages(1, false);
    }
  }, [isActive, selectedCategory, selectedCriticity, fetchMessages]);

  const observerRef = useRef();
  const sentinelRef = useRef();

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && !loading && isActive) {
        fetchMessages(page + 1, true);
      }
    },
    [fetchMessages, page, hasMore, loadingMore, loading, isActive]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // use the viewport or parent if needed
      rootMargin: "200px", // Load 200px before reaching the end
      threshold: 0.1,
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [handleObserver]);

  // No API call needed on click — meeting data already exists in originalMeeting
  const handleMessageClick = (msg) => {
    if (["Need Response", "For Information", "info", "To Do", "To Plan"].includes(msg.categoryId)) {
      const isOutlook = !!msg?.originalMessage?.outlook_email_id;
      const isIonos   = !!msg?.originalMessage?.ionos_email_id;
      const isGmail   = !!msg?.originalMessage?.gmail_id;

      // Use originalMeeting directly — it already has full meeting data from API response
      const meeting = msg.originalMeeting;
      const meetings = meeting ? [meeting] : [{
        id: msg?.meetingId,
        title: msg?.momentTitle || "Conversation",
        type:  msg?.originalMeeting?.type || "Conversation",
        start_time: msg?.date,
        updated_at: msg?.date,
        unread_messages_count: 0,
        last_message_date: msg?.date,
        objective: msg?.missionTitle,
      }];

      setDiscussionModalData({
        meetingId: msg.meetingId,
        messageId: msg.id,
        meetings,
        isIonos,
        isOutlook,
        isGmail,
        initialMessage: msg?.originalMessage?.ai_assist || "",
      });
      setShowDiscussionModal(true);
    } else {
      setReadMessage(msg);
    }

    if (!msg.isRead) {
      getMeetingMessages(null, msg.id, msg.meetingId)
        .then(() => {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
          setCategoryCounts((prev) => ({
            ...prev,
            [msg.categoryId]: Math.max(0, (prev[msg.categoryId] || 0) - 1),
            All: Math.max(0, (prev["All"] || 0) - 1),
          }));
        })
        .catch((err) => console.error("Error marking as read:", err));
    }
  };

  const filteredMessages = useMemo(() => {
    return (messages || [])
      .filter((msg) => {
        if (selectedCategory !== "All" && msg.categoryId !== selectedCategory) return false;
        if (selectedCriticity !== "All" && msg.criticity !== selectedCriticity) return false;
        if (searchTerm && !msg.missionTitle?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [messages, selectedCategory, selectedCriticity, searchTerm]);

  if (!isActive) return null;

  return (
    /*
     * FIX: Flat flex-row div — NO Ant Design Layout/Content nesting.
     * Nested <Layout> inside <Layout> does NOT properly inherit height,
     * causing the entire right-side content area to collapse on desktop.
     */
    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#fff" }}>

      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <div
          className="border-end"
          style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", backgroundColor: "#fff" }}
        >
          <div className="p-3 border-bottom bg-light bg-opacity-10" style={{ flexShrink: 0 }}>
            <Text strong type="secondary">{t("header.messagesToHandle.folder", "Dossiers")}</Text>
          </div>
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px" }}>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                type={selectedCategory === cat.id ? "primary" : "text"}
                block
                className="d-flex align-items-center justify-content-between mb-1"
                style={{ height: "40px", textAlign: "left" }}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedCriticity(cat.id === "All" ? "High" : "All");
                }}
              >
                <Space>
                  <span className="fs-5">{cat.icon}</span>
                  <Text ellipsis strong={selectedCategory === cat.id} style={{ color: selectedCategory === cat.id ? "#fff" : "inherit" }}>
                    {t(`header.messagesToHandle.categories.${cat.id}`, cat.label)}
                  </Text>
                </Space>
                <Badge
                  count={categoryCounts[cat.id] || 0}
                  style={{ backgroundColor: selectedCategory === cat.id ? "#fff" : "#1890ff", color: selectedCategory === cat.id ? "#1890ff" : "#fff" }}
                  size="small"
                />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", backgroundColor: "#fff" }}>

        {/* Toolbar — criticity ALWAYS visible on both mobile and desktop */}
        <div className="p-3 border-bottom bg-white" style={{ flexShrink: 0 }}>
          <Space wrap size={[8, 8]} align="center">
            {/* Category dropdown on mobile */}
            {isMobile && (
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: "min(160px, 40vw)" }}
                options={CATEGORIES.map((c) => ({
                  value: c.id,
                  label: <Space>{c.icon} {t(`header.messagesToHandle.categories.${c.id}`, c.label)}</Space>,
                }))}
              />
            )}
            {/* Criticity — always show */}
            <Text strong style={{ whiteSpace: "nowrap" }}>
              {t("header.messagesToHandle.criticity", "Criticity")}:
            </Text>
            {CRITICITY_LEVELS.map((level) => (
              <Tag.CheckableTag
                key={level.id}
                checked={selectedCriticity === level.id}
                onChange={() => setSelectedCriticity(level.id)}
                style={{
                  border: `1px solid ${level.color}`,
                  color: selectedCriticity === level.id ? "#fff" : level.color,
                  backgroundColor: selectedCriticity === level.id ? level.color : "transparent",
                  cursor: "pointer",
                }}
              >
                {t(`header.messagesToHandle.criticityLevels.${level.id}`, level.label)}
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>

        {/* Scrollable message list */}
        <div
          className="p-3 p-md-4 bg-light bg-opacity-25"
          style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <Spin size="large" tip="Chargement des messages..." />
            </div>
          ) : filteredMessages.length > 0 ? (
            <>
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
                dataSource={filteredMessages}
                renderItem={(msg) => (
                  <List.Item className="p-0 mb-3 border-0" key={msg.id}>
                    <MessageCard message={msg} t={t} onClick={() => handleMessageClick(msg)} />
                  </List.Item>
                )}
              />
              
              {/* Sentinelle pour le scroll infini */}
              <div ref={sentinelRef} style={{ height: "20px", width: "100%" }} />

              {loadingMore && (
                <div className="text-center p-3">
                  <Spin size="small" tip="Loading more..." />
                </div>
              )}
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("header.messagesToHandle.noMessages", "Aucun message dans cette catégorie")}
              className="mt-5"
            />
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal
        open={showDiscussionModal}
        onCancel={() => setShowDiscussionModal(false)}
        footer={null} width="100%"
        className="full-screen-modal"
        style={{ top: 0, padding: 0 }}
        bodyStyle={{ height: "100vh", padding: 0 }}
        closeIcon={null} destroyOnClose
      >
        {discussionModalData && (
          <DiscussionChat
            meetingId={discussionModalData.meetingId}
            messageId={discussionModalData.messageId}
            meetingsData={discussionModalData.meetings}
            onMeetingsUpdate={() => {}}
            isOutlook={discussionModalData.isOutlook}
            isIonos={discussionModalData.isIonos}
            isGmail={discussionModalData.isGmail}
            userData={userData}
            defaultFullScreen={true}
            onCloseFullScreen={() => setShowDiscussionModal(false)}
            initialMessage={discussionModalData.initialMessage}
          />
        )}
      </Modal>

      <Modal
        title={<Space><MomentIcon meeting={readMessage?.originalMeeting} t={t} /><Text strong>{readMessage?.momentTitle}</Text></Space>}
        open={!!readMessage}
        onCancel={() => setReadMessage(null)}
        footer={[<Button key="close" onClick={() => setReadMessage(null)}>Fermer</Button>]}
        width={isMobile ? "96%" : 800}
        centered
      >
        {readMessage && (
          <div>
            <div className="mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
              <Space direction="vertical" size={0}>
                <Text strong>{readMessage.sender}</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>{new Date(readMessage.date).toLocaleString()}</Text>
              </Space>
              <Tag color="blue">{CATEGORIES.find((c) => c.id === readMessage.categoryId)?.label}</Tag>
            </div>
            <div style={{ maxHeight: "60vh", overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: readMessage.content }} />
          </div>
        )}
      </Modal>

      {open && <NewMeetingModal open={open} closeModal={handleCloseModal} openedFrom="destination" />}
    </div>
  );
};

const MessageCard = ({ message, t, onClick }) => {
  const category = CATEGORIES.find((c) => c.id === message.categoryId) || {};
  const criticity = CRITICITY_LEVELS.find((l) => l.id === message.criticity) || {};
  const plainTextContent = (message.content || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div
      className={`card border-0 shadow-sm p-3 rounded-4 ${!message.isRead ? "border-start border-4 border-primary" : ""}`}
      style={{ cursor: "pointer", transition: "all 0.3s", width: "100%", minWidth: 0, overflow: "hidden", boxSizing: "border-box" }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", width: "100%", minWidth: 0, overflow: "hidden", marginBottom: "6px" }}>
        {/* LEFT */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            {criticity.color && (
              <Badge color={criticity.color} text={<span style={{ fontSize: "12px" }}>{t(`header.messagesToHandle.criticityLevels.${criticity.id}`, criticity.label)}</span>} />
            )}
            <MomentIcon meeting={message.originalMeeting} t={t} />
            {!message.isRead && <Badge status="processing" color="#1890ff" />}
          </div>
          <div
            style={{ fontWeight: message.isRead ? 400 : 600, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}
            title={message.momentTitle}
          >
            {message.momentTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
            <Text type="secondary" style={{ fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }} title={message.sender}>
              {message.sender}
            </Text>
            <Tag icon={category.icon} bordered={false} style={{ fontSize: "11px", flexShrink: 0 }}>
              {t(`header.messagesToHandle.categories.${category.id}`, category.label)}
            </Tag>
          </div>
        </div>
        {/* RIGHT — date */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: "11px", display: "block", whiteSpace: "nowrap" }}>{new Date(message.date).toLocaleDateString()}</Text>
          <Text type="secondary" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>{new Date(message.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
        </div>
      </div>
      {/* BODY */}
      <div style={{ fontSize: "13px", color: "#888", fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word", overflowWrap: "break-word", maxWidth: "100%" }}>
        {plainTextContent}
      </div>
    </div>
  );
};

const MomentIcon = ({ meeting, t }) => {
  if (!meeting) return null;
  const type = meeting.type;
  if (type === "Conversation Outlook") return <PiMicrosoftOutlookLogoFill color="#0A66C2" size={20} />;
  if (type === "Conversation IONOS")   return <SiIonos size={20} color="#003D8F" />;
  if (type === "Conversation Gmail")   return <Avatar size={18} src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" style={{ backgroundColor: "transparent" }} />;
  return <HiOutlineChat size={20} />;
};

export default MessagesToHandleTab;