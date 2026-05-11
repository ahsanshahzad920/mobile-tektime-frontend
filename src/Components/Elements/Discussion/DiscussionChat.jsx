import CookieService from "../../Utils/CookieService";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Layout,
  Button,
  Space,
  Typography,
  Avatar,
  Badge,
  Spin,
  List,
  Tooltip,
  Dropdown,
  Menu,
  Table,
} from "antd";
import {
  FaThumbtack,
  FaEdit,
  FaTrashAlt,
  FaSyncAlt,
  FaChevronLeft,
  FaExpand,
  FaCompress,
  FaComments,
  FaLinkedin,
  FaEllipsisV,
  FaExternalLinkAlt,
  FaTimes,
  FaUsers,
  FaList,
  FaClock,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

import DiscussionParticipant from "./DiscussionParticipant";
import MessageTypeWritter from "./MessageTypeWritter";
import Moments from "./Moments";
import {
  getMeetingMessages,
  deleteMessage,
  getDestinationMeetings,
  getMissionParticipants,
} from "./api";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DiscussionChat = ({
  meetingId,
  messageId,
  meetingsData,
  onMeetingsUpdate,
  isOutlook = false,
  isIonos = false,
  isGmail = false,
  isLinkedIn = false,
  onLoadMore,
  hasMore,
  userData,
  folder = "inbox",
  searchTerm = "",
  defaultFullScreen = false,
  onCloseFullScreen,
  initialMessage = "",
  missionsData = null,
  selectedMissionId = null,
  onMissionSelect = null,
}) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isParticipantsCollapsed, setIsParticipantsCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(defaultFullScreen);
  const [viewMode, setViewMode] = useState("conversation");
  const [attachments, setAttachments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const editorRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setViewMode("conversation");
    }
  }, [isMobile]);

  const onMeetingsUpdateRef = useRef(onMeetingsUpdate);
  useEffect(() => { onMeetingsUpdateRef.current = onMeetingsUpdate; }, [onMeetingsUpdate]);

  const fetchMessages = useCallback(async () => {
    const momentId = selectedMoment?.id;
    if (!meetingId || !momentId) return;
    setLoading(true);
    try {
      const resp = await getMeetingMessages(
        meetingId,
        messageId,
        momentId,
        folder,
        searchTerm,
      );
      const rawData = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
          ? resp
          : [];
      const sorted = [...rawData].sort(
        (a, b) => new Date(a?.sent_date_time || a.created_at) - new Date(b?.sent_date_time || b.created_at),
      );
      setMessages(sorted);
      if (selectedMoment?.unread_messages_count > 0 && onMeetingsUpdateRef.current) {
        onMeetingsUpdateRef.current([{ ...selectedMoment, unread_messages_count: 0 }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [
    meetingId,
    messageId,
    selectedMoment?.id,
    folder,
    searchTerm,
  ]);

  useEffect(() => {
    // Don't auto-select moments when in missions list mode — user clicks to open
    if (missionsData) return;
    if (meetingsData?.length > 0 && !selectedMoment && !isMobile) {
      if (meetingId) {
        const found = meetingsData.find(
          (m) => m.id?.toString() === meetingId.toString(),
        );
        setSelectedMoment(found || meetingsData[0]);
      } else {
        setSelectedMoment(meetingsData[0]);
      }
    } else if (meetingsData?.length > 0 && selectedMoment) {
      const updated = meetingsData.find((m) => m.id === selectedMoment.id);
      if (
        updated &&
        (updated.unread_messages_count !==
          selectedMoment.unread_messages_count ||
          updated.last_message_date !== selectedMoment.last_message_date)
      ) {
        setSelectedMoment(updated);
      }
    }
  }, [meetingsData, selectedMoment, isMobile, missionsData]);

  useEffect(() => {
    setMessages([]);
    fetchMessages();
  }, [selectedMoment?.id, fetchMessages]);

  // Fetch participants from API whenever selected moment changes
  useEffect(() => {
    if (!selectedMoment?.id) {
      setParticipants([]);
      return;
    }
    getMissionParticipants(selectedMoment.id)
      .then((response) => {
        if (Array.isArray(response?.data)) {
          // Each participant from data array goes into the participants array individually
          setParticipants(response.data);
        } else if (Array.isArray(response)) {
          setParticipants(response);
        } else {
          // Fallback: use user_with_participants from moment object
          setParticipants(selectedMoment?.user_with_participants || []);
        }
      })
      .catch(() => {
        // On error fallback to moment's existing participant data
        setParticipants(selectedMoment?.user_with_participants || []);
      });
  }, [selectedMoment?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async ({ message }) => {
    // Extract mentioned participants using a robust regex
    const mentionRegex = /<span [^>]*class="mention"[^>]*>([\s\S]*?)<\/span>/g;
    const mentionedParticipants = [];
    let match;
    
    while ((match = mentionRegex.exec(message)) !== null) {
      const spanHtml = match[0];
      const spanText = match[1].replace(/^@/, "").trim(); // Remove leading @ and trim
      
      // Try to find data-id in the span attributes
      const idMatch = spanHtml.match(/data-id="([^"]+)"/);
      const dataId = idMatch ? idMatch[1] : null;

      const participant = (participants || []).find(p => {
        if (dataId) {
          return p.id?.toString() === dataId || p.user_id?.toString() === dataId;
        }
        // Fallback to name/email matching
        const name = p.full_name || p.name || p.email || "";
        return name.trim().toLowerCase() === spanText.toLowerCase();
      });

      if (participant && !mentionedParticipants.some(p => p.id === participant.id)) {
        mentionedParticipants.push(participant);
      }
    }

    setSending(true);
    try {
      const formData = new FormData();
      const userId = CookieService.get("user_id");
      formData.append("user_id", userId);
      formData.append("message", message);
      attachments.forEach((f, i) => formData.append(`attachments[${i}]`, f));
      
      // Add mentioned participants to formData
      mentionedParticipants.forEach((p, i) => {
        formData.append(`participants[${i}]`, JSON.stringify(p));
      });

      let endpoint = "/meeting-messages";
      if (isOutlook) endpoint = "/outlook-email/reply-all";
      else if (isIonos) endpoint = "/ionos-emails/reply-all";
      else if (isGmail) endpoint = "/google-emails/reply-all";

      if (editingMessage) {
        formData.append("_method", "PUT");
        endpoint = `/meeting-messages/${editingMessage.id}`;
      } else {
        formData.append("meeting_id", selectedMoment.id);
      }

      const resp = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (resp.data.success) {
        if (editingMessage)
          setMessages((prev) =>
            prev.map((m) => (m.id === editingMessage.id ? resp.data.data : m)),
          );
        else setMessages((prev) => [...prev, resp.data.data]);
        setAttachments([]);
        setEditingMessage(null);
        if (editorRef.current) editorRef.current.setContent("");
        toast.success(t("Success"));
        if (onMeetingsUpdate && !editingMessage) {
          onMeetingsUpdate([
            {
              ...selectedMoment,
              last_message_date: resp.data.data.sent_date_time,
              updated_at: resp.data.data.sent_date_time,
              unread_messages_count: 0,
            },
          ]);
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    } finally {
      setSending(false);
    }
  };

  const handleTogglePin = async (msg) => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("is_pinned", msg.is_pinned ? 0 : 1);

      const resp = await axios.post(
        `${API_BASE_URL}/meeting-messages/${msg.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${CookieService.get("token")}` },
        },
      );

      if (resp.data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, is_pinned: !msg.is_pinned } : m,
          ),
        );
        toast.success(
          msg.is_pinned ? t("Message désépinglé") : t("Message épinglé"),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = (msg) => {
    if (msg.redirect_url) navigate(msg.redirect_url);
    else toast.info("Action non disponible");
  };

  const currentUserId = parseInt(CookieService.get("user_id"));

  // When closing fullscreen, clear heavy state first so the DOM is lightweight
  // during the position-fixed → normal-flow layout transition
  const handleCloseFullScreen = useCallback(() => {
    setMessages([]);
    setSelectedMoment(null);
    setIsFullScreen(false);
  }, []);

  return (
    <Layout
      className={`h-100 bg-white ${isFullScreen || (isMobile && selectedMoment) ? "position-fixed top-0 start-0 w-100 h-100" : ""}`}
      style={{
        height:
          isFullScreen || (isMobile && selectedMoment) ? "100dvh" : "100%",
        overflow: "hidden",
        zIndex: isFullScreen || (isMobile && selectedMoment) ? 10000 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* ── MOMENTS SIDER ── */}
      {/* FIX 1 (mobile): Replace Ant Design Sider with plain div so we can add
          a back button at the top on mobile. Sider has no slot for a header row. */}
      <div
        style={{
          width: isFullScreen
            ? "300px"
            : isMobile
              ? "100%"
              : missionsData
                ? "350px"
                : "300px",
          flex: isFullScreen
            ? "0 0 300px"
            : isMobile
              ? "0 0 auto"
              : missionsData
                ? "0 0 350px"
                : "0 0 300px",
          flexShrink: 0,
          display: isMobile && selectedMoment
              ? "none"
              : "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          borderRight: "1px solid #f0f0f0",
          backgroundColor: "#fff",
          transition: "width 0.2s ease, flex 0.2s ease",
        }}
      >
        {/* MOMENTS header row */}
        <div
          className="p-4 border-bottom"
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #fafafa, #fff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {missionsData && !isMobile ? (
                <FaList color="#1890ff" size={16} />
              ) : (
                <FaClock color="#1890ff" size={16} />
              )}
            </div>
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#262626",
                letterSpacing: "0.02em",
              }}
            >
              {missionsData && !isMobile ? "MISSIONS" : "MOMENTS"}
            </Text>
          </div>
          <Badge
            count={missionsData && !isMobile ? missionsData?.length : meetingsData?.length}
            showZero
            color="#1890ff"
            style={{ boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)" }}
          />
        </div>

        {/* Scrollable moments list */}
        <div
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
          }}
        >
          {missionsData && !isFullScreen && !isMobile ? (
            <Moments
              meetingsData={missionsData}
              onMomentSelect={(m) =>
                onMissionSelect && onMissionSelect(m.id.toString())
              }
              selectedMoment={{
                id: selectedMissionId ? parseInt(selectedMissionId) : null,
              }}
            />
          ) : (
            <Moments
              meetingsData={meetingsData}
              onMomentSelect={(m) => {
                setSelectedMoment(m);
                if (isMobile) setViewMode("conversation");
                if (m.unread_messages_count > 0 && onMeetingsUpdate) {
                  onMeetingsUpdate([{ ...m, unread_messages_count: 0 }]);
                }
              }}
              selectedMoment={selectedMoment}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
            />
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {/* Use display:none instead of null to avoid unmount/remount on fullscreen toggle */}
      <Content
        className={`d-flex flex-column h-100 overflow-hidden bg-white ${isMobile && !selectedMoment ? "d-none" : ""} ${(!isFullScreen && missionsData && !isMobile) ? "d-none" : ""}`}
      >
        {/* FIX 2: Chat Header — flat flex row so title shrinks and icons never cut */}
        <div
          className="border-bottom shadow-sm bg-white"
          style={{
            flexShrink: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "8px 12px" : "12px 16px",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {/* LEFT — back button + avatar + title, takes remaining space, truncates */}
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
            {(isMobile && selectedMoment) || (isFullScreen && missionsData) ? (
              <Button
                type="text"
                icon={<FaChevronLeft />}
                style={{ flexShrink: 0 }}
                onClick={() =>
                  isFullScreen
                    ? handleCloseFullScreen()
                    : setSelectedMoment(null)
                }
              />
            ) : null}
            <Avatar
              icon={<FaComments />}
              size={48}
              style={{
                backgroundColor: "#1890ff",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
              }}
              src={
                selectedMoment?.clients?.client_logo
                  ? selectedMoment.clients.client_logo.startsWith("http")
                    ? selectedMoment.clients.client_logo
                    : `${Assets_URL}/${selectedMoment.clients.client_logo}`
                  : null
              }
            />
            {/* Title block — truncates, never pushes icons off-screen */}
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <Title
                level={4}
                className="m-0"
                ellipsis={{ tooltip: selectedMoment?.title || "Discussion" }}
                style={{
                  marginBottom: 0,
                  fontSize: "18px",
                  maxWidth: "100%",
                  fontWeight: 700,
                }}
              >
                {selectedMoment?.title || "Discussion"}
              </Title>
              <div className="d-flex align-items-center gap-2">
                <Badge status="success" />
                <Text
                  type="secondary"
                  style={{
                    fontSize: "12px",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  }}
                >
                  {selectedMoment?.type || "Conversation active"}
                </Text>
              </div>
            </div>
          </div>

          {/* RIGHT — icons, never shrink */}
          <Space style={{ flexShrink: 0 }}>
            <Tooltip title="Rafraîchir">
              <Button
                type="text"
                shape="circle"
                icon={<FaSyncAlt size={14} className="text-muted" />}
                onClick={fetchMessages}
                loading={loading}
              />
            </Tooltip>
            <Tooltip
              title={
                viewMode === "conversation" ? "Vue Liste" : "Vue Conversation"
              }
            >
              <Button
                type="text"
                shape="circle"
                icon={
                  viewMode === "conversation" ? (
                    <FaList size={14} className="text-muted" />
                  ) : (
                    <FaComments size={16} className="text-muted" />
                  )
                }
                onClick={() =>
                  setViewMode(
                    viewMode === "conversation" ? "list" : "conversation",
                  )
                }
              />
            </Tooltip>
            {selectedMoment && (
              <Tooltip title="Accéder à la réunion">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <FaExternalLinkAlt size={14} className="text-primary" />
                  }
                  onClick={() => {
                    if (selectedMoment?.id) {
                      const status = (
                        selectedMoment.status ||
                        selectedMoment.meeting_status ||
                        selectedMoment.destination_status ||
                        ""
                      )?.toLowerCase();
                      const activeStates = [
                        "active",
                        "in_progress",
                        "todo",
                        "to_finish",
                      ];
                      const closedStates = [
                        "abort",
                        "cancle",
                        "cancel",
                        "closed",
                      ];
                      if (activeStates.some((s) => status.includes(s))) {
                        navigate(`/invite/${selectedMoment.id}`);
                      } else if (closedStates.some((s) => status.includes(s))) {
                        navigate(`/present/invite/${selectedMoment.id}`);
                      } else {
                        navigate(`/invite/${selectedMoment.id}`);
                      }
                    }
                  }}
                />
              </Tooltip>
            )}
            <Button
              type="text"
              shape="circle"
              icon={
                isFullScreen ? <FaCompress size={14} /> : <FaExpand size={14} />
              }
              onClick={() => isFullScreen ? handleCloseFullScreen() : setIsFullScreen(true)}
              className="d-none d-sm-inline-flex"
            />
            {onCloseFullScreen && (
              <Button
                type="text"
                shape="circle"
                icon={<FaTimes size={16} className="text-danger" />}
                onClick={onCloseFullScreen}
              />
            )}
            <Button
              type="text"
              shape="circle"
              icon={
                isParticipantsCollapsed ? (
                  <FaUsers size={16} />
                ) : (
                  <FaTimes size={16} />
                )
              }
              className="d-lg-none d-none"
              onClick={() =>
                setIsParticipantsCollapsed(!isParticipantsCollapsed)
              }
            />
          </Space>
        </div>

        {/* Messages Container */}
        {/* FIX 3: overflowX: hidden so message content never bleeds sideways */}
        <div
          className="flex-grow-1 p-2 p-md-4 bg-light bg-opacity-5"
          style={{
            overflowY: "auto",
            overflowX: "hidden", // ← stops horizontal bleed
            scrollBehavior: "smooth",
            // minHeight: 0,
            height: !isMobile && !isFullScreen && "500px",
          }}
        >
          {!selectedMoment ? (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
              <FaComments size={48} className="mb-3" />
              <Text>Sélectionnez une discussion pour commencer</Text>
            </div>
          ) : loading && messages.length === 0 ? (
            <div className="h-100 d-flex align-items-center justify-content-center">
              <Spin size="large" tip="Chargement..." />
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white rounded-3 shadow-sm p-0">
              {messages.map((msg, idx) => {
                const isMe = parseInt(msg.user_id) === currentUserId;
                const senderImage = isMe
                  ? userData?.image || userData?.user_image
                  : msg.user?.image ||
                    msg.participant_image ||
                    msg.image ||
                    msg.user_image ||
                    msg.sender_image ||
                    msg.participant?.participant_image ||
                    msg.participant?.image;

                let senderName = [
                  msg.user?.full_name,
                  msg.user?.name,
                  msg.participant?.full_name,
                  msg.participant?.name,
                  msg.user_name,
                  msg.full_name,
                  msg.sender_name,
                  msg.from_name,
                  msg.from,
                ].find((n) => n && n.trim());

                if (!senderName && msg.sender) {
                  if (
                    typeof msg.sender === "string" &&
                    msg.sender.includes("<")
                  ) {
                    const parts = msg.sender.split("<");
                    senderName =
                      parts[0].trim() || parts[1]?.replace(">", "").trim();
                  } else {
                    senderName = msg.sender;
                  }
                }
                if (!senderName) {
                  senderName = [
                    msg.from_email,
                    msg.user_email,
                    msg.email,
                    msg.sender_email,
                  ].find((e) => e && e.trim());
                }
                if (!senderName || !senderName.trim())
                  senderName = isMe ? t("You") : "User";

                const avatarStr = senderImage?.toString()?.trim();
                const avatarSrc = avatarStr
                  ? avatarStr.startsWith("http")
                    ? avatarStr
                    : `${Assets_URL}/${avatarStr.replace(/^\//, "")}`
                  : null;
                const initials = senderName
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={msg.id}
                    className={`p-3 p-md-4 ${idx !== messages.length - 1 ? "border-bottom" : ""}`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Space align="start" size="middle">
                        <Avatar size={40} src={avatarSrc} className="shadow-sm">
                          {initials}
                        </Avatar>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Text strong style={{ fontSize: "14px" }}>
                              {isMe ? t("You") : senderName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {moment(msg.created_at).format(
                                "DD/MM/YYYY HH:mm:ss",
                              )}
                            </Text>
                          </div>
                          <Space size="large" className="text-muted">
                            <Tooltip title="Pin">
                              <FaThumbtack
                                className={`cursor-pointer ${msg.is_pinned ? "text-warning" : ""}`}
                                size={14}
                                onClick={() => handleTogglePin(msg)}
                              />
                            </Tooltip>
                            {isMe && (
                              <>
                                <Tooltip title="Edit">
                                  <FaEdit
                                    className="cursor-pointer"
                                    size={14}
                                    onClick={() => setEditingMessage(msg)}
                                  />
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <FaTrashAlt
                                    className="cursor-pointer"
                                    size={14}
                                    onClick={() =>
                                      deleteMessage(msg.id).then(fetchMessages)
                                    }
                                  />
                                </Tooltip>
                              </>
                            )}
                          </Space>
                        </div>
                      </Space>
                      {msg.redirect_url && (
                        <Button
                          type="link"
                          icon={<FaExternalLinkAlt size={10} />}
                          onClick={() => navigate(msg.redirect_url)}
                          className="fw-bold"
                        >
                          {t("Voir l'action")}
                        </Button>
                      )}
                    </div>
                    {/* FIX 3: list view message content also needs overflow control */}
                    <div
                      className="ms-5 ps-2 text-dark"
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.6",
                        overflowX: "auto", // allow scroll inside if content is wide (tables etc)
                        maxWidth: "100%",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                      dangerouslySetInnerHTML={{ __html: msg.message }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {messages.map((msg, idx) => {
                const isMe = parseInt(msg.user_id) === currentUserId;
                const senderImage = isMe
                  ? userData?.image || userData?.user_image
                  : msg.user?.image ||
                    msg.participant_image ||
                    msg.image ||
                    msg.user_image ||
                    msg.sender_image ||
                    msg.participant?.participant_image ||
                    msg.participant?.image;

                let senderName = [
                  msg.user?.full_name,
                  msg.user?.name,
                  msg.participant?.full_name,
                  msg.participant?.name,
                  msg.user_name,
                  msg.full_name,
                  msg.sender_name,
                  msg.from_name,
                  msg.from,
                ].find((n) => n && n.trim());

                if (!senderName && msg.sender) {
                  if (
                    typeof msg.sender === "string" &&
                    msg.sender.includes("<")
                  ) {
                    const parts = msg.sender.split("<");
                    const namePart = parts[0].trim();
                    const emailPart = parts[1]?.replace(">", "").trim();
                    senderName = namePart || emailPart;
                  } else {
                    senderName = msg.sender;
                  }
                }
                if (!senderName) {
                  senderName = [
                    msg.from_email,
                    msg.user_email,
                    msg.email,
                    msg.sender_email,
                    msg.user?.email,
                    msg.participant?.email,
                  ].find((e) => e && e.trim());
                }
                if (
                  (!senderName || senderName === "User") &&
                  selectedMoment?.user_with_participants
                ) {
                  const emailSearch =
                    msg.from_email ||
                    msg.user_email ||
                    msg.email ||
                    msg.sender_email ||
                    msg.user?.email;
                  const participant =
                    selectedMoment.user_with_participants.find(
                      (p) =>
                        (emailSearch && p.email === emailSearch) ||
                        (msg.participant_id && p.id === msg.participant_id) ||
                        (msg.user_id && p.user_id === msg.user_id),
                    );
                  if (participant) {
                    senderName =
                      participant.full_name?.trim() ||
                      participant.name?.trim() ||
                      participant.email;
                  }
                }
                if (!senderName || !senderName.trim()) {
                  senderName = isMe
                    ? userData?.full_name || userData?.name || t("You")
                    : msg.name || "User";
                }

                const avatarStr = senderImage?.toString()?.trim();
                const avatarSrc = avatarStr
                  ? avatarStr.startsWith("http")
                    ? avatarStr
                    : `${Assets_URL}/${avatarStr.replace(/^\//, "")}`
                  : null;
                const initials = senderName
                  .toString()
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={msg.id}
                    className={`d-flex ${isMe ? "justify-content-end" : "justify-content-start"}`}
                    // FIX 3: row itself must not overflow
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <div
                      className={`d-flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      style={{
                        maxWidth: isMobile ? "calc(100% - 8px)" : "85%",
                        minWidth: 0,
                        overflow: "hidden",
                        alignItems: "flex-start", // avatar stays at top, never stretches
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          flexShrink: 0,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Avatar
                          size="small"
                          src={avatarSrc}
                          className="shadow-sm"
                        >
                          {initials}
                        </Avatar>
                      </div>
                      <div
                        className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}
                        style={{ minWidth: 0, overflow: "hidden", flex: 1 }}
                      >
                        <div
                          className="d-flex align-items-center gap-2 mb-1"
                          style={{ maxWidth: "100%", overflow: "hidden" }}
                        >
                          <Text
                            strong
                            style={{
                              fontSize: "12px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {senderName}
                          </Text>
                          <Text
                            type="secondary"
                            style={{ fontSize: "10px", whiteSpace: "nowrap" }}
                          >
                            {moment.utc(msg?.sent_date_time || msg?.created_at).local().format("DD/MM/YYYY HH:mm")}
                          </Text>
                        </div>
                        <div
                          className={`p-3 rounded-4 shadow-sm border ${isMe ? "bg-success bg-opacity-10 border-success border-opacity-20 m-0 bubble-me" : "bg-white bubble-other"}`}
                          style={{
                            lineHeight: "1.5",
                            fontSize: "14px",
                            position: "relative",
                            minWidth: "60px",
                            // FIX 3: content inside bubble must wrap, not expand bubble
                            maxWidth: "100%",
                            overflow: "hidden",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: msg.message }}
                            className="text-dark"
                            style={{
                              // FIX 3: rendered HTML (tables, images) — allow internal scroll if needed
                              overflowX: "auto",
                              maxWidth: "100%",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          />
                          <div
                            className="text-end"
                            style={{ marginTop: "-4px", opacity: 0.6 }}
                          >
                            <Text type="secondary" style={{ fontSize: "9px" }}>
                              {moment.utc(msg?.sent_date_time || msg?.created_at).local().format("DD/MM/YYYY HH:mm")}
                            </Text>
                          </div>
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 pt-2 border-top border-dark border-opacity-10">
                              {msg.attachments.map((at, i) => (
                                <div key={i} className="mb-1">
                                  <a
                                    href={`${Assets_URL}/${at.path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary"
                                  >
                                    <Space size="small">
                                      <FaExternalLinkAlt size={10} />
                                      <Text
                                        ellipsis
                                        style={{
                                          maxWidth: 150,
                                          fontSize: "12px",
                                        }}
                                      >
                                        {at.name}
                                      </Text>
                                    </Space>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Space
                          className={`mt-1 action-row transition-all ${isMe ? "flex-row-reverse" : ""}`}
                          size="middle"
                        >
                          <Tooltip title="Pin">
                            <Button
                              type="text"
                              size="small"
                              icon={
                                <FaThumbtack
                                  size={12}
                                  className={
                                    msg.is_pinned
                                      ? "text-warning"
                                      : "text-muted"
                                  }
                                />
                              }
                              onClick={() => handleTogglePin(msg)}
                            />
                          </Tooltip>
                          {isMe && (
                            <>
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  <FaEdit size={12} className="text-muted" />
                                }
                                onClick={() => setEditingMessage(msg)}
                              />
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  <FaTrashAlt
                                    size={12}
                                    className="text-muted"
                                  />
                                }
                                onClick={() =>
                                  deleteMessage(msg.id).then(fetchMessages)
                                }
                              />
                            </>
                          )}
                          {msg.redirect_url && (
                            <Button
                              type="link"
                              size="small"
                              style={{ fontSize: "11px" }}
                              onClick={() => handleAction(msg)}
                            >
                              {t("Voir l'action")}
                            </Button>
                          )}
                        </Space>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {selectedMoment && (
          <div className="bg-white border-top" style={{ flexShrink: 0 }}>
            <MessageTypeWritter
              onSendMessage={handleSend}
              disabled={sending}
              editorRef={editorRef}
              isSending={sending}
              attachments={attachments}
              onFileUpload={(e) =>
                setAttachments((prev) => [
                  ...prev,
                  ...Array.from(e.target.files || []),
                ])
              }
              onRemoveAttachment={(i) =>
                setAttachments((prev) => prev.filter((_, idx) => idx !== i))
              }
              isEditing={!!editingMessage}
              onCancelEdit={() => {
                setEditingMessage(null);
                if (editorRef.current) editorRef.current.setContent("");
              }}
              initialValue={editingMessage?.message || initialMessage || ""}
              participants={participants}
            />
          </div>
        )}
      </Content>

      {/* Participants/Moments Sider */}
      <Sider
        width={
          isFullScreen
            ? 300
            : isParticipantsCollapsed
              ? 80
              : missionsData && !isFullScreen
                ? "calc(100% - 350px)"
                : 300
        }
        theme="light"
        className={`border-start d-none d-lg-block`}
        style={{
          overflow: "hidden",
          width: isFullScreen
            ? 300
            : isParticipantsCollapsed
              ? 80
              : missionsData && !isFullScreen
                ? "calc(100% - 350px)"
                : 300,
          flex: isFullScreen ? "0 0 300px" : missionsData && !isFullScreen ? "1 1 auto" : "0 0 auto",
          transition: "width 0.15s ease, flex 0.15s ease",
        }}
      >
        <div className="h-100 d-flex flex-column overflow-hidden">
          <div
            className={`p-4 border-bottom d-flex ${isParticipantsCollapsed ? "justify-content-center" : "justify-content-between"} align-items-center`}
            style={{
              flexShrink: 0,
              background: "linear-gradient(to left, #fafafa, #fff)",
            }}
          >
            {!isParticipantsCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {missionsData && !isFullScreen ? (
                    <FaClock color="#52c41a" size={16} />
                  ) : (
                    <FaUsers color="#52c41a" size={16} />
                  )}
                </div>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    color: "#262626",
                    letterSpacing: "0.02em",
                  }}
                >
                  {missionsData && !isFullScreen ? "MOMENTS" : "PARTICIPANTS"}
                </Text>
              </div>
            )}
            {!(missionsData && !isFullScreen) && (
              <Button
                type="text"
                icon={isParticipantsCollapsed ? <FaUsers /> : <FaTimes />}
                onClick={() =>
                  setIsParticipantsCollapsed(!isParticipantsCollapsed)
                }
                style={{ borderRadius: "8px" }}
              />
            )}
          </div>
          <div
            className="flex-grow-1 overflow-hidden"
            style={{ overflowY: "auto" }}
          >
            {missionsData && !isFullScreen ? (
              <Moments
                meetingsData={meetingsData}
                onMomentSelect={(m) => {
                  setSelectedMoment(m);
                  if (isMobile) setViewMode("conversation");
                  else if (missionsData) setIsFullScreen(true);
                  if (m.unread_messages_count > 0 && onMeetingsUpdate) {
                    onMeetingsUpdate([{ ...m, unread_messages_count: 0 }]);
                  }
                }}
                selectedMoment={selectedMoment}
                onLoadMore={onLoadMore}
                hasMore={hasMore}
              />
            ) : (
              <DiscussionParticipant
                selectedMoment={selectedMoment}
                isCollapsed={isParticipantsCollapsed}
              />
            )}
          </div>
        </div>
      </Sider>

      <style>{`
        .bubble-me::after { content: ''; position: absolute; right: -8px; top: 12px; border: 8px solid transparent; border-left-color: #f6ffed; border-right: 0; border-top: 0; }
        .bubble-other::after { content: ''; position: absolute; left: -8px; top: 12px; border: 8px solid transparent; border-right-color: #fff; border-left: 0; border-top: 0; }
        @media (max-width: 991px) {
          .ant-layout-sider { position: absolute; z-index: 100; height: 100%; }
        }
      `}</style>
    </Layout>
  );
};

export default DiscussionChat;
