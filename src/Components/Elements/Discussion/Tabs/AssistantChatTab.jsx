import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Space,
  Spin,
  Typography,
  Avatar,
  Button,
  Layout,
  List,
  Badge,
  Card,
  Tooltip,
  Input,
  Grid,
  Table,
} from "antd";
import {
  FaComments,
  FaList,
  FaExternalLinkAlt,
  FaCompress,
  FaChevronLeft,
  FaPaperPlane,
  FaSyncAlt,
  FaExpand,
} from "react-icons/fa";
import parse from "html-react-parser";
import {
  getAllDestinationsForAssitant,
  getAssistantDestinationMessages,
  sendAssistantChat,
} from "../api";
import { Assets_URL } from "../../../Apicongfig";
import Moments from "../Moments";
import MessageTypeWritter from "../MessageTypeWritter";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import QuickMomentForm from "../../Invities/DestinationToMeeting/QuickMomentForm";
import CookieService from "../../../Utils/CookieService";

const { Content, Sider } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const AssistantChatTab = ({ isActive, assistantName = "", assistantLogo }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [messages, setMessages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [activeDestination, setActiveDestination] = useState(null);
  const [loading, setLoading] = useState({
    destinations: false,
    messages: false,
  });
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState("conversation");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const editorRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isMobile) {
      setViewMode("conversation");
    }
  }, [isMobile]);

  const user = JSON.parse(CookieService.get("user"));

  const cachedProfile = JSON.parse(
    CookieService.get("assistant_profile") || "{}"
  );
  const finalAssistantName = assistantName || cachedProfile.name || "TekTime";
  const assistantImage =
    assistantLogo || cachedProfile.logo
      ? (assistantLogo || cachedProfile.logo).startsWith("http")
        ? assistantLogo || cachedProfile.logo
        : `${Assets_URL}/${(assistantLogo || cachedProfile.logo).replace(/^\//, "")}`
      : "/Assets/sidebar-invite-logo.svg";

  const fetchDestinations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, destinations: true }));
    try {
      const response = await getAllDestinationsForAssitant();
      if (response?.data) {
        const mapped = response.data.map((d) => ({
          ...d,
          title: d.destination_name,
          last_message_date:
            d.last_assistant_message_at || d.destination_end_date_time,
          unread_messages_count: d.unread_messages_count || 0,
        }));
        setDestinations(mapped);
        if (mapped.length > 0 && !activeDestination && !isMobile) {
          setActiveDestination(mapped[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading((prev) => ({ ...prev, destinations: false }));
    }
  }, [isMobile]);

  const fetchHistory = useCallback(async (id) => {
    if (!id) return;
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      const response = await getAssistantDestinationMessages(id);
      const list =
        response?.assistant_messages ||
        response?.data?.assistant_messages ||
        [];
      const formatted = list.flatMap((item) =>
        [
          item.question && {
            id: `q-${item.id}`,
            role: "user",
            content: item.question,
            created_at: item.created_at,
          },
          item.answer && {
            id: `a-${item.id}`,
            role: "assistant",
            content: item.answer,
            created_at: item.updated_at || item.created_at,
          },
        ].filter(Boolean)
      );
      setMessages(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, []);

  useEffect(() => {
    if (isActive) fetchDestinations();
  }, [isActive, fetchDestinations]);

  useEffect(() => {
    if (isActive && activeDestination) fetchHistory(activeDestination);
  }, [isActive, activeDestination, fetchHistory]);

  const handleSend = async ({ message }) => {
    if (!message?.trim() || sending) return;
    const content = message;
    setSending(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const resp = await sendAssistantChat(content, activeDestination);
      if (resp?.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `resp-${Date.now()}`,
            role: "assistant",
            content: resp.answer,
            created_at: new Date().toISOString(),
          },
        ]);
        if (editorRef.current) editorRef.current.setContent("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isActive) return null;

  const selectedDest = destinations.find((d) => d.id === activeDestination);

  return (
    // FIX 1: Outer wrapper always takes full height from parent container
    // Previously height was only set in fullscreen mode — that caused collapse
    <div
      className={`bg-white d-flex flex-column ${
        isFullScreen || (activeDestination && isMobile)
          ? "position-fixed top-0 start-0 w-100 h-100"
          : ""
      }`}
      style={{
        zIndex: isFullScreen || (activeDestination && isMobile) ? 10000 : 1,
        // Always fill parent height, whether fullscreen or not
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {/* FIX 2: Layout must be a proper flex column filling all available height */}
      <Layout
        className="bg-white"
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        {/* Sidebar — plain div instead of Ant Design Sider
            Sider internally injects overflow:hidden on its aside element
            which blocks the inner scroll div from working */}
        {isMobile && selectedDest && !isFullScreen ? null : (
          <div
            className={`border-end bg-white ${isMobile && activeDestination ? "d-none" : ""}`}
            style={{
              width: isMobile ? "100%" : "300px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <div
              className="p-3 border-bottom bg-light bg-opacity-10 d-flex align-items-center"
              style={{ flexShrink: 0, minHeight: "64px" }}
            >
              <Text strong type="secondary">
                Missions & Conversations
              </Text>
            </div>
            {/* This div handles the scroll — flex:1 + minHeight:0 is the key */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
              }}
            >
              {loading.destinations ? (
                <div className="p-5 text-center">
                  <Spin />
                </div>
              ) : (
                <Moments
                  meetingsData={destinations}
                  selectedMoment={selectedDest}
                  onMomentSelect={(m) => {
                    setActiveDestination(m.id);
                    if (isMobile) {
                      setIsFullScreen(false);
                      setViewMode("conversation");
                    }
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* FIX 5: Content area — flex column, fills remaining space, no overflow on container itself */}
        <Content
          className={`${isMobile && !activeDestination ? "d-none" : "d-flex"}`}
          style={{
            display: isMobile && !activeDestination ? "none" : "flex",
            flexDirection: "column",
            // FIX 6: height: 0 + flex: 1 is the correct pattern for a
            // scrollable flex child — prevents content from pushing parent taller
            flex: 1,
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Chat Header — fixed height, never shrinks */}
          <div
            className="px-3 border-bottom bg-white shadow-sm"
            style={{
              flexShrink: 0,
              minHeight: "64px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflow: "hidden",
            }}
          >
            {/* LEFT SIDE — takes remaining space, truncates if needed */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                overflow: "hidden",
              }}
            >
              {isMobile && (
                <Button
                  icon={<FaChevronLeft />}
                  type="text"
                  style={{ flexShrink: 0 }}
                  onClick={() => setActiveDestination(null)}
                />
              )}
              <Avatar
                src={assistantImage}
                size="large"
                style={{ flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <Title
                  level={5}
                  className="m-0"
                  ellipsis={{ tooltip: selectedDest?.destination_name || finalAssistantName }}
                  style={{ marginBottom: 0, maxWidth: "100%" }}
                >
                  {selectedDest?.destination_name || finalAssistantName}
                </Title>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Assistant IA
                </Text>
              </div>
            </div>

            {/* RIGHT SIDE — icons never shrink, never cut */}
            <Space style={{ flexShrink: 0 }}>
              <Tooltip title="Rafraîchir">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaSyncAlt size={14} className="text-muted" />}
                  onClick={() =>
                    activeDestination && fetchHistory(activeDestination)
                  }
                  loading={loading.messages}
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
                      viewMode === "conversation" ? "list" : "conversation"
                    )
                  }
                />
              </Tooltip>
              {selectedDest && (
                <Tooltip title="Accéder à la mission">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <FaExternalLinkAlt size={14} className="text-primary" />
                    }
                    onClick={() => {
                      const status = (
                        selectedDest.status ||
                        selectedDest.meeting_status ||
                        selectedDest.destination_status ||
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
                        navigate(`/invite/${selectedDest.id}`);
                      } else if (
                        closedStates.some((s) => status.includes(s))
                      ) {
                        navigate(`/present/invite/${selectedDest.id}`);
                      } else {
                        navigate(`/invite/${selectedDest.id}`);
                      }
                    }}
                  />
                </Tooltip>
              )}
              <Button
                type="text"
                shape="circle"
                icon={
                  isFullScreen ? (
                    <FaCompress size={14} />
                  ) : (
                    <FaExpand size={14} />
                  )
                }
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="d-none d-sm-inline-flex"
              />
            </Space>
          </div>

          {/* FIX 7: Messages area — THIS is the key fix.
              flex: 1 + minHeight: 0 + overflowY: auto
              Without minHeight: 0, a flex child won't shrink below its content height,
              so the messages area expands and pushes the footer off-screen */}
          <div
            className="p-3 p-md-4 bg-light bg-opacity-10"
            style={{
              flex: !isMobile && !isFullScreen ?  " ": 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",   // no horizontal scroll ever
              backgroundImage: "radial-gradient(#eee 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              height: (!isMobile && !isFullScreen) && "500px",
            }}
          >
            {loading.messages ? (
              <div
                style={{ height: "100%" }}
                className="d-flex justify-content-center align-items-center"
              >
                <Spin tip="Chargement de l'historique..." />
              </div>
            ) : viewMode === "list" ? (
              <div className="bg-white rounded-3 shadow-sm p-0">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const senderName = isUser
                    ? user?.full_name || "Moi"
                    : assistantName;
                  const senderAvatar = isUser
                    ? (user?.image || user?.user_image)
                        ?.toString()
                        .startsWith("http")
                      ? user?.image || user?.user_image
                      : `${Assets_URL}/${(user?.image || user?.user_image)
                          ?.toString()
                          .replace(/^\//, "")}`
                    : assistantImage;

                  return (
                    <div
                      key={msg.id}
                      className={`p-3 p-md-4 ${
                        idx !== messages.length - 1 ? "border-bottom" : ""
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Space align="start" size="middle">
                          <Avatar
                            size={40}
                            src={senderAvatar}
                            className="shadow-sm"
                          >
                            {senderName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Text strong style={{ fontSize: "14px" }}>
                                {senderName}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                {new Date(msg.created_at).toLocaleString()}
                              </Text>
                            </div>
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
                      <div
                        className="ms-5 ps-2 text-dark"
                        style={{ fontSize: "14px", lineHeight: "1.6" }}
                      >
                        {parse(msg.content)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <List
                dataSource={messages}
                split={false}
                renderItem={(msg) => (
                  <div
                    className={`d-flex mb-4 ${
                      msg.role === "user"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                    // FIX: parent must not overflow viewport horizontally
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <div
                      className={`d-flex ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      } gap-2`}
                      style={{
                        // FIX: use calc to leave room for avatar (32px) + gap (8px)
                        maxWidth: "calc(100% - 8px)",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      <Avatar
                        src={
                          msg.role === "user"
                            ? (user?.image || user?.user_image)
                                ?.toString()
                                .startsWith("http")
                              ? user?.image || user?.user_image
                              : `${Assets_URL}/${(
                                  user?.image || user?.user_image
                                )
                                  ?.toString()
                                  .replace(/^\//, "")}`
                            : assistantImage
                        }
                        // FIX: avatar must not shrink or grow
                        style={{ flexShrink: 0, flexGrow: 0 }}
                      />
                      <div
                        className={`d-flex flex-column ${
                          msg.role === "user"
                            ? "align-items-end"
                            : "align-items-start"
                        }`}
                        // FIX: minWidth:0 + overflow:hidden so inner content wraps
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
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {msg.role === "user"
                              ? user?.full_name || user?.name || "Moi"
                              : assistantName}
                          </Text>
                          <Text
                            type="secondary"
                            style={{ fontSize: "10px", whiteSpace: "nowrap" }}
                          >
                            {new Date(msg.created_at).toLocaleDateString([], {
                              day: "2-digit",
                              month: "short",
                            })}{" "}
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </div>
                        <Card
                          size="small"
                          className={`border-0 shadow-sm ${
                            msg.role === "user"
                              ? "bg-primary text-white rounded-start"
                              : "bg-white rounded-end"
                          }`}
                          style={{
                            // FIX: card must never exceed its container
                            maxWidth: "100%",
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                          bodyStyle={{
                            padding: "10px 15px",
                            // FIX: force all text/HTML content to wrap properly
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className={
                              msg.role === "user" ? "text-white" : "text-dark"
                            }
                            style={{
                              fontSize: "14px",
                              // FIX: parsed HTML (lists, links, bold) must wrap too
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              overflow: "hidden",
                              maxWidth: "100%",
                            }}
                          >
                            {parse(msg.content)}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input — fixed height, never shrinks */}
          <div className="bg-white border-top" style={{ flexShrink: 0 }}>
            {activeDestination && (
              <MessageTypeWritter
                onSendMessage={handleSend}
                disabled={sending}
                editorRef={editorRef}
                isSending={sending}
                attachments={[]}
                onFileUpload={() => {}}
                onRemoveAttachment={() => {}}
                isEditing={false}
                onCancelEdit={() => {}}
                initialValue={""}
                participants={[]}
              />
            )}
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default AssistantChatTab;