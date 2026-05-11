import CookieService from "../../../Utils/CookieService";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Spin,
  Button,
  Badge,
  Tag,
  Tooltip,
  Grid,
  Modal,
  List,
  Space,
  Typography,
  Avatar,
  Select,
  Layout,
  Empty,
} from "antd";
import { useTranslation } from "react-i18next";
import {
  getAllEmailsLabeling,
  getMeetingMessages,
  getDestinationMeetings,
  getDestinationEmailMeetings,
  getIonosEmailMeetings,
  getGmailDestinationMeetings,
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
import StepChart from "../../Meeting/CreateNewMeeting/StepChart";
import { getDiscussionOptions } from "../../../Utils/MeetingFunctions";

const { Text, Title } = Typography;
const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

// Category Definitions
const CATEGORIES = [
  { id: "All", label: "Tous", icon: <HiOutlineViewList /> },
  { id: "Need Response", label: "A Répondre", icon: <HiOutlineChat /> },
  { id: "To Do", label: "A faire", icon: <HiOutlineClipboardCheck /> },
  { id: "To Plan", label: "A planifier", icon: <HiOutlineCalendar /> },
  { id: "For Information", label: "Pour info", icon: <HiOutlineInbox /> },
  {
    id: "Waiting for Response",
    label: "En attente de réponse",
    icon: <HiOutlineClock />,
  },
  { id: "Marketing", label: "Marketing", icon: <HiOutlineSpeakerphone /> },
  {
    id: "Meeting Invitation",
    label: "Invitation réunion",
    icon: <HiOutlineMailOpen />,
  },
  { id: "Notification", label: "Notifications", icon: <HiOutlineBell /> },
];

const CRITICITY_LEVELS = [
  { id: "All", label: "All", color: "#8c8c8c" },
  { id: "High", label: "High", color: "#f5222d" },
  { id: "Medium", label: "Medium", color: "#faad14" },
  { id: "Low", label: "Low", color: "#52c41a" },
];

const MessagesToHandleTab = ({ isActive, searchTerm, userData }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [t] = useTranslation("global");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCriticity, setSelectedCriticity] = useState("High");
  const [messages, setMessages] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [readMessage, setReadMessage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false); // for pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionModalData, setDiscussionModalData] = useState(null);

  const { open, handleCloseModal } = useFormContext();

  const fetchMessages = useCallback(
    async (p = 1, isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      try {
        const payload = {
          user_id: userData?.id || CookieService.get("user_id"),
          category: selectedCategory === "All" ? "All" : selectedCategory,
          periorty: selectedCriticity,
          page: p,
        };

        const data = await getAllEmailsLabeling(payload, p);
        if (data && data.data) {
          const mappedMessages = data.data.messages?.map((msg) => {
            const meeting = msg.meeting;
            const destination = meeting?.destination;

            let senderName = "Unknown";
            if (destination?.destination_name) {
              const parts = destination.destination_name.split("/");
              senderName =
                parts.length > 1
                  ? parts[1].trim()
                  : destination.destination_name;
            } else if (msg?.from_email) {
              senderName = msg.from_email;
            }

            return {
              id: msg?.id,
              categoryId: msg?.category || "Need Response",
              missionTitle: meeting?.objective || "No Title",
              momentTitle: meeting?.title || "Unknown Moment",
              sender: msg?.from_email || senderName,
              date: msg?.received_date_time || msg?.created_at,
              content: msg?.message,
              criticity: msg?.priority || "Medium",
              meetingId: msg?.meeting_id,
              destinationId: destination?.id,
              isRead: msg?.is_read === 1 || msg?.is_read === true,
              originalMessage: msg,
              originalMeeting: meeting,
            };
          });
          if (isLoadMore) {
            setMessages((prev) => [...prev, ...mappedMessages]);
          } else {
            setMessages(mappedMessages);
          }

          setHasMore(mappedMessages.length > 0);
          setPage(p);

          // setMessages(mappedMessages);
          setCategoryCounts(data.data.unseen_category_counts || {});
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
    },
    [userData, selectedCategory, selectedCriticity],
  );

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
      if (
        entry.isIntersecting &&
        hasMore &&
        !loadingMore &&
        !loading &&
        isActive
      ) {
        fetchMessages(page + 1, true);
      }
    },
    [fetchMessages, page, hasMore, loadingMore, loading, isActive],
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

  const handleMessageClick = async (msg) => {
    if (
      ["Need Response", "For Information", "info", "To Do", "To Plan"].includes(
        msg.categoryId,
      )
    ) {
      setLoading(true);
      try {
        let meetings = [];
        const isOutlook = !!msg?.originalMessage?.outlook_email_id;
        const isIonos = !!msg?.originalMessage?.ionos_email_id;
        const isGmail = !!msg?.originalMessage?.gmail_id;

        if (msg.destinationId) {
          let resp;
          if (isOutlook) {
            resp = await getDestinationEmailMeetings(msg.destinationId);
          } else if (isIonos) {
            resp = await getIonosEmailMeetings(msg.destinationId);
          } else if (isGmail) {
            resp = await getGmailDestinationMeetings(msg.destinationId);
          } else {
            resp = await getDestinationMeetings(msg.destinationId);
          }
          meetings = Array.isArray(resp?.data)
            ? resp.data
            : Array.isArray(resp)
              ? resp
              : [];
        }

        if (!Array.isArray(meetings) || meetings.length === 0) {
          meetings = [
            {
              id: msg?.meetingId,
              title: msg?.momentTitle || "Conversation",
              type: msg?.originalMeeting?.type || "Conversation",
              start_time: msg?.date,
              updated_at: msg?.date,
              unread_messages_count: 0,
              last_message_date: msg?.date,
              objective: msg?.missionTitle,
            },
          ];
        }

        setDiscussionModalData({
          meetingId: msg.meetingId,
          messageId: msg.id,
          meetings: meetings,
          isIonos,
          isOutlook,
          isGmail,
          initialMessage: msg?.originalMessage?.ai_assist || "",
        });
        setShowDiscussionModal(true);
      } catch (error) {
        console.error("Error fetching context for message:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setReadMessage(msg);
    }

    if (!msg.isRead) {
      getMeetingMessages(null, msg.id, msg.meetingId)
        .then(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)),
          );
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
        if (selectedCategory !== "All" && msg.categoryId !== selectedCategory)
          return false;
        if (selectedCriticity !== "All" && msg.criticity !== selectedCriticity)
          return false;
        if (
          searchTerm &&
          !msg.missionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [messages, selectedCategory, selectedCriticity, searchTerm]);

  if (!isActive) return null;

  return (
    <Layout className="bg-white h-100" style={{ overflow: "hidden" }}>
      {!isMobile && (
        <Sider width={260} theme="light" className="border-end overflow-auto">
          <div className="p-3 border-bottom bg-light bg-opacity-10">
            <Text strong type="secondary">
              {t("header.messagesToHandle.folder", "Dossiers")}
            </Text>
          </div>
          <div className="p-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                type={selectedCategory === cat.id ? "primary" : "text"}
                block
                className="d-flex align-items-center justify-content-between mb-1"
                style={{ height: "40px", textAlign: "left" }}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id === "All") setSelectedCriticity("High");
                  else setSelectedCriticity("All");
                }}
              >
                <Space>
                  <span className="fs-5">{cat.icon}</span>
                  <Text
                    ellipsis
                    strong={selectedCategory === cat.id}
                    style={{
                      color: selectedCategory === cat.id ? "#fff" : "inherit",
                    }}
                  >
                    {t(
                      `header.messagesToHandle.categories.${cat.id}`,
                      cat.label,
                    )}
                  </Text>
                </Space>
                <Badge
                  count={categoryCounts[cat.id] || 0}
                  style={{
                    backgroundColor:
                      selectedCategory === cat.id ? "#fff" : "#1890ff",
                    color: selectedCategory === cat.id ? "#1890ff" : "#fff",
                  }}
                  size="small"
                />
              </Button>
            ))}
          </div>
        </Sider>
      )}

      <Layout className="bg-white h-100">
        <Content className="d-flex flex-column h-100">
          {/* Header Filters */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <Space wrap size={[8, 8]} align="center">
              {isMobile && (
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: "min(160px, 40vw)" }}
                  options={CATEGORIES.map((c) => ({
                    value: c.id,
                    label: (
                      <Space>
                        {c.icon}{" "}
                        {t(
                          `header.messagesToHandle.categories.${c.id}`,
                          c.label,
                        )}
                      </Space>
                    ),
                  }))}
                />
              )}
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {t("header.messagesToHandle.criticity", "Criticity")}:
              </Text>{" "}
              {CRITICITY_LEVELS.map((level) => (
                <Tag.CheckableTag
                  key={level.id}
                  checked={selectedCriticity === level.id}
                  onChange={() => setSelectedCriticity(level.id)}
                  style={{
                    border: `1px solid ${level.color}`,
                    color:
                      selectedCriticity === level.id ? "#fff" : level.color,
                    backgroundColor:
                      selectedCriticity === level.id
                        ? level.color
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {t(
                    `header.messagesToHandle.criticityLevels.${level.id}`,
                    level.label,
                  )}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>

          {/* Message List */}
          <div
            className="p-3 p-md-4 bg-light bg-opacity-25"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin", // Ensure scrollbar is visible
            }}
          >
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spin size="large" tip="Chargement des messages..." />
              </div>
            ) : filteredMessages.length > 0 ? (
              <>
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 1,
                    lg: 1,
                    xl: 1,
                    xxl: 1,
                  }}
                  dataSource={filteredMessages}
                  renderItem={(msg) => (
                    <List.Item className="p-0 mb-3 border-0" key={msg.id}>
                      <MessageCard
                        message={msg}
                        t={t}
                        onClick={() => handleMessageClick(msg)}
                      />
                    </List.Item>
                  )}
                />
                {/* Sentinelle pour le scroll infini */}
                <div
                  ref={sentinelRef}
                  style={{ height: "20px", width: "100%" }}
                />

                {loadingMore && (
                  <div className="text-center p-3">
                    <Spin size="small" tip="Loading more..." />
                  </div>
                )}
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t(
                  "header.messagesToHandle.noMessages",
                  "Aucun message dans cette catégorie",
                )}
                className="mt-5"
              />
            )}
          </div>
        </Content>
      </Layout>

      {/* Modals */}
      <Modal
        open={showDiscussionModal}
        onCancel={() => setShowDiscussionModal(false)}
        footer={null}
        width="100%"
        className="full-screen-modal"
        style={{ top: 0, padding: 0 }}
        bodyStyle={{ height: "100vh", padding: 0 }}
        closeIcon={null}
        destroyOnClose
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
        title={
          <Space>
            <MomentIcon meeting={readMessage?.originalMeeting} t={t} />
            <Text strong>{readMessage?.momentTitle}</Text>
          </Space>
        }
        open={!!readMessage}
        onCancel={() => setReadMessage(null)}
        footer={[
          <Button key="close" onClick={() => setReadMessage(null)}>
            Fermer
          </Button>,
        ]}
        width={isMobile ? "96%" : 800}
        centered
      >
        {readMessage && (
          <div>
            <div className="mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
              <Space direction="vertical" size={0}>
                <Text strong>{readMessage.sender}</Text>
                <Text type="secondary" size="small">
                  {new Date(readMessage.date).toLocaleString()}
                </Text>
              </Space>
              <Tag color="blue">
                {CATEGORIES.find((c) => c.id === readMessage.categoryId)?.label}
              </Tag>
            </div>
            <div
              style={{ maxHeight: "60vh", overflowY: "auto" }}
              dangerouslySetInnerHTML={{ __html: readMessage.content }}
            />
          </div>
        )}
      </Modal>

      {open && (
        <NewMeetingModal
          open={open}
          closeModal={handleCloseModal}
          openedFrom="destination"
        />
      )}
    </Layout>
  );
};

const MessageCard = ({ message, t, onClick }) => {
  const category = CATEGORIES.find((c) => c.id === message.categoryId) || {};
  const criticity =
    CRITICITY_LEVELS.find((l) => l.id === message.criticity) || {};

  return (
    <div
      className={`card border-0 shadow-sm p-3 rounded-4 hover-shadow transition-all ${!message.isRead ? "border-start border-4 border-primary" : ""}`}
      style={{ cursor: "pointer", transition: "all 0.3s" }}
      onClick={onClick}
    >
      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
        <div style={{ minWidth: 0, flex: 1 }}>
          <Space align="center" size={8} wrap>
            {criticity.color && (
              <Badge
                color={criticity.color}
                text={
                  <span>
                    {t(
                      `header.messagesToHandle.criticityLevels.${criticity.id}`,
                      criticity.label,
                    )}
                  </span>
                }
              />
            )}
            <MomentIcon meeting={message.originalMeeting} t={t} />
            <Text
              strong={!message.isRead}
              ellipsis
              style={{ fontSize: "15px" }}
            >
              {message.momentTitle}
            </Text>
            {!message.isRead && <Badge status="processing" color="#1890ff" />}
          </Space>

          <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
            <Text type="secondary" style={{ fontSize: "13px" }}>
              {message.sender}
            </Text>
            <Tag
              icon={category.icon}
              bordered={false}
              style={{ fontSize: "11px" }}
            >
              {t(
                `header.messagesToHandle.categories.${category.id}`,
                category.label,
              )}
            </Tag>
          </div>
        </div>

        <div className="text-end">
          <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
            {new Date(message.date).toLocaleDateString()}
          </Text>
          <Text type="secondary" style={{ fontSize: "11px" }}>
            {new Date(message.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </div>
      </div>

      <div
        className="mt-2 text-muted fw-light"
        style={{
          fontSize: "13px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{
          __html: message.content?.replace(/<[^>]*>?/gm, ""),
        }}
      />
    </div>
  );
};

const MomentIcon = ({ meeting, t }) => {
  if (!meeting) return null;
  const type = meeting.type;
  if (type === "Conversation Outlook")
    return <PiMicrosoftOutlookLogoFill color="#0A66C2" size={20} />;
  if (type === "Conversation IONOS")
    return <SiIonos size={20} color="#003D8F" />;
  if (type === "Conversation Gmail")
    return (
      <Avatar
        size={18}
        src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
        style={{ backgroundColor: "transparent" }}
      />
    );
  return <HiOutlineChat size={20} />;
};

export default MessagesToHandleTab;
