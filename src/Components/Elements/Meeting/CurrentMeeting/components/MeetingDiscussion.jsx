import CookieService from '../../../../Utils/CookieService';
import React, { useState, useEffect, useRef } from "react";
import {
  FaEdit,
  FaThumbtack,
  FaTrashAlt,
  FaList,
  FaComments
} from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import StepChart from "../../../Meeting/CreateNewMeeting/StepChart";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import MessageTypeWritterReport from "../../../Discussion/MessageTypeWritterReport";
import { deleteMessage, getMeetingMessages } from "../../../Discussion/api";

const cleanHtml = (htmlString) => {
  if (!htmlString) return "";
  const match = htmlString.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (match && match[1]) return match[1].trim();
  if (htmlString.trim().startsWith("<") && htmlString.includes(">")) return htmlString.trim();
  return htmlString;
};

function MeetingDiscussion({ meetingId, messages, selectedMoment, onMessagesUpdate, isOutlook = false, userData }) {
  const [editingMessage, setEditingMessage] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const [id, setId] = useState(null);
  const [actionModalId, setActionModalId] = useState(null);
  const [t] = useTranslation("global");
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState("conversation");
  const messageContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [meetingId, messages]);

  const handleHideAction = (shouldRefresh) => {
    setShowActionModal(false);
    if (shouldRefresh && meetingId && selectedMoment) {
      const fetchMessages = async () => {
        try {
          const messagesData = await getMeetingMessages(meetingId, selectedMoment.id);
          const sortedMessages = [...(messagesData?.data || [])].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          onMessagesUpdate(sortedMessages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  };

  const handleSendMessage = async (messageContent) => {
    try {
      const formData = new FormData();
      const userId = parseInt(CookieService.get("user_id"));

      if (editingMessage) {
        formData.append("_method", "PUT");
        formData.append("message", messageContent.message);

        const response = await fetch(`${API_BASE_URL}/meeting-messages/${editingMessage.id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${CookieService.get('token')}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update message');
        }

        const responseData = await response.json();
        if (responseData?.success) {
          onMessagesUpdate?.(prevMessages =>
            prevMessages.map(msg => msg.id === editingMessage.id ? responseData.data : msg)
          );
          setEditingMessage(null);
          setAttachments([]);
        }

      } else {
        formData.append("meeting_id", selectedMoment?.id);
        if (userId) formData.append("user_id", userId);
        formData.append("message", messageContent.message);
        attachments?.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });

        const response = await fetch(`${API_BASE_URL}/meeting-messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${CookieService.get('token')}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to send message');
        }

        const responseData = await response.json();
        if (responseData?.success) {
          onMessagesUpdate?.(prevMessages => [...prevMessages, responseData.data]);
          setAttachments([]);
          requestAnimationFrame(() => {
            const messageContainer = document.querySelector(".message-container");
            messageContainer?.scrollTo({ top: messageContainer.scrollHeight, behavior: 'smooth' });
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    if (editorRef.current) editorRef.current.setContent(message.message);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await deleteMessage(messageId);
        if (response.success) {
          onMessagesUpdate(messages.filter(msg => msg.id !== messageId));
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  const handlePinMessage = async (messageId, isPinned) => {
    try {
      const formData = new FormData();
      formData.append("is_pinned", !isPinned);
      formData.append("_method", "PUT");

      const response = await fetch(`${API_BASE_URL}/meeting-messages/${messageId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CookieService.get('token')}` },
        body: formData,
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update pin status (HTTP ${response.status})`);
      }

      const responseData = await response.json();
      if (!responseData?.success) throw new Error('Invalid response format from server');

      if (onMessagesUpdate) {
        onMessagesUpdate(currentMessages =>
          currentMessages.map(msg =>
            msg.id === messageId ? { ...msg, is_pinned: !isPinned, ...responseData.data } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    if (editorRef.current) editorRef.current.setContent("");
  };

  const handleShowAction = (message) => {
    if (message?.message_type === "notification" || message?.message_type === "system-notification") {
      navigate(`${message?.redirect_url}`);
    } else {
      setActionModalId(message);
      setShowActionModal(true);
    }
  };

  const currentUserId = React.useMemo(() => {
    return parseInt(CookieService.get("user_id"), 10);
  }, []);

  const MessageItem = ({
    message, onEdit, onDelete, onPin, onShowAction,
    isEditing, currentUserId, userData, viewMode
  }) => {
    const outlookLink = userData?.email_links?.find(
      (link) => link.platform === "outlook" || link.platform === "Outlook"
    );

    const isCurrentUser = isOutlook
      ? message?.user_email === outlookLink?.value
      : Number(message.user_id) === currentUserId;

    const formatDateForDisplay = (isoString) => {
      return new Date(isoString).toLocaleString("fr-FR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      });
    };

    const renderAttachment = (attachment) => {
      const fileType = attachment?.type?.split('/')[0];
      const fileUrl = `${Assets_URL}/${attachment?.path}`;
      const isImage = fileType === "image" || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment?.path);

      if (isImage) {
        return (
          <div className="attachment-item mb-2">
            <img src={fileUrl} alt="Attachment" className="img-fluid rounded" style={{ maxHeight: '200px' }} />
          </div>
        );
      }
      return (
        <div className="attachment-item mb-2">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="bg-light p-2 rounded">
              <i className={`bi ${fileType === 'application' ? 'bi-file-earmark-text' : 'bi-file-earmark'} fs-4`}></i>
            </div>
            <div>
              <div className="text-primary">{attachment.name}</div>
              <small className="text-muted">{(attachment.size / 1024).toFixed(2)} KB</small>
            </div>
          </a>
        </div>
      );
    };

    const getColorForUser = (userId) => {
      const colors = [
        "#E3F2FD", "#BBDEFB", "#E1F5FE", "#B3E5FC", "#E0F7FA",
        "#B2EBF2", "#E8EAF6", "#C5CAE9", "#B39DDB", "#90CAF9",
        "#81D4FA", "#80DEEA", "#9FA8DA"
      ];
      return colors[Math.abs(userId) % colors.length];
    };

    const userColor = getColorForUser(message.user_id);
    const msgType = message?.message_type ? message.message_type.toLowerCase().trim() : "";
    const isNotification = ["system-notification", "notification"].includes(msgType);

    const avatarSrc = message?.user?.image
      ? (message.user.image.startsWith("http") ? message.user.image : Assets_URL + "/" + message.user.image)
      : (message?.user_image || "https://via.placeholder.com/38");

    // Shared action button style
    const actionBtnStyle = { fontSize: "0.78rem", textDecoration: "none", lineHeight: 1 };

    if (viewMode === 'list') {
      return (
        <div className={`message-list-item py-3 border-bottom ${message?.is_pinned ? "bg-light" : ""}`}>
          <div className="d-flex align-items-start gap-3">
            <div className="flex-shrink-0">
              <img src={avatarSrc} width={40} height={40} alt="User"
                className="rounded-circle object-fit-cover shadow-sm border"
                style={{ objectPosition: "top" }} />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <strong className="text-dark small">
                    {isCurrentUser ? t("You") : (message?.user?.full_name || message?.user_name)}
                  </strong>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {formatDateForDisplay(message.created_at)}
                  </small>
                  {message?.is_pinned && (
                    <span className="badge bg-warning text-dark d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                      <FaThumbtack size={10} /> {t("Pinned")}
                    </span>
                  )}
                </div>
                <div className="d-flex gap-1 align-items-center">
                  {isCurrentUser && (
                    <>
                      <button onClick={() => onEdit(message)} className="btn btn-link p-0 text-muted" title={t("Edit")} style={actionBtnStyle}>
                        <FaEdit size={13} />
                      </button>
                      <button onClick={() => onDelete(message.id)} className="btn btn-link p-0 text-muted" title={t("Delete")} style={actionBtnStyle}>
                        <FaTrashAlt size={13} />
                      </button>
                    </>
                  )}
                  <button onClick={() => onPin(message.id, message.is_pinned)}
                    className={`btn btn-link p-0 ${message.is_pinned ? "text-primary" : "text-muted"}`}
                    title={message.is_pinned ? t("Unpin") : t("Pin")} style={actionBtnStyle}>
                    <FaThumbtack size={13} />
                  </button>
                </div>
              </div>
              <div className="text-break text-secondary" style={{ fontSize: '0.9rem' }}>
                <div dangerouslySetInnerHTML={{ __html: message.message }} />
                {message.attachments?.length > 0 && (
                  <div className="attachments-container mt-2">
                    {message.attachments.map((att, idx) => <div key={idx}>{renderAttachment(att)}</div>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`message mb-3 ${message?.is_pinned ? "pinned-message" : ""}`}>
        {message?.is_pinned && (
          <div className="pinned-badge text-muted mb-1 text-center" style={{ fontSize: '0.8rem' }}>
            <FaThumbtack className="me-1" /> {t("Pinned")}
          </div>
        )}

        <div className={`d-flex gap-2 ${isCurrentUser ? "" : "justify-content-end"}`}>

          {isCurrentUser ? (
            <>
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img src={avatarSrc} width={36} height={36} alt="User"
                  className="rounded-circle object-fit-cover shadow-sm border border-white"
                  style={{ objectPosition: "top" }} />
              </div>

              {/* Content */}
              <div className="flex-grow-1" style={{ maxWidth: "85%", minWidth: 0 }}>
                <div className="d-flex align-items-center gap-1 mb-1 flex-wrap">
                  <strong className="text-dark" style={{ fontSize: "0.8rem" }}>{t("You")}</strong>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {formatDateForDisplay(message.created_at)}
                  </small>
                </div>

                <div className={`message-bubble my-message-bubble ${isEditing ? "editing" : ""}`}>
                  <div dangerouslySetInnerHTML={{ __html: message.message }} />
                  {message.attachments?.length > 0 && (
                    <div className="attachments-container mt-2">
                      {message.attachments.map((att, idx) => <div key={idx}>{renderAttachment(att)}</div>)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex gap-1 mt-1 align-items-center">
                  <button className="btn btn-sm btn-link p-0 text-muted"
                    onClick={() => onEdit(message)} disabled={isEditing}
                    title={t("Edit")} style={actionBtnStyle}>
                    <FaEdit size={13} />
                  </button>
                  <button className="btn btn-sm btn-link p-0 text-muted"
                    onClick={() => onDelete(message.id)} disabled={isEditing}
                    title={t("Delete")} style={actionBtnStyle}>
                    <FaTrashAlt size={13} />
                  </button>
                  <button className="btn btn-sm btn-link p-0 text-muted"
                    onClick={() => onPin(message.id, message.is_pinned)}
                    title={message.is_pinned ? t("Unpin") : t("Pin")} style={actionBtnStyle}>
                    <FaThumbtack size={13} className={message.is_pinned ? "text-primary" : ""} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Content */}
              <div className="d-flex flex-column align-items-end" style={{ maxWidth: "85%", minWidth: 0 }}>
                <div className="d-flex align-items-center gap-1 mb-1 justify-content-end flex-wrap">
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {formatDateForDisplay(message.created_at)}
                  </small>
                  <strong className="text-dark" style={{ fontSize: "0.8rem" }}>
                    {message?.user?.full_name || message?.user_name}
                  </strong>
                </div>

                <div className={`message-bubble other-message-bubble text-start ${isEditing ? "editing" : ""}`}
                  style={{ backgroundColor: userColor }}>
                  <div dangerouslySetInnerHTML={{ __html: message.message }} />
                  {message.attachments?.length > 0 && (
                    <div className="attachments-container mt-2">
                      {message.attachments.map((att, idx) => <div key={idx}>{renderAttachment(att)}</div>)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex gap-1 mt-1 align-items-center justify-content-end">
                  <button className="btn btn-sm btn-link p-0 text-muted"
                    onClick={() => onPin(message.id, message.is_pinned)}
                    title={message.is_pinned ? t("Unpin") : t("Pin")} style={actionBtnStyle}>
                    <FaThumbtack size={13} className={message.is_pinned ? "text-primary" : ""} />
                  </button>
                  {CookieService.get('token') &&
                    !(message?.message_type === "notification" && message?.redirect_url === null) && (
                      <button
                        className="btn btn-sm btn-link p-0 text-primary fw-bold"
                        onClick={() => onShowAction(message)}
                        title={
                          message?.message_type === "notification" ? t("View Action")
                          : message?.message_type === "system-notification" ? t("View Report")
                          : t("Create Action")
                        }
                        style={actionBtnStyle}
                      >
                        {isNotification
                          ? (msgType === "system-notification" ? t("View Report")
                            : message?.redirect_url ? t("View Action") : t("Create Action"))
                          : <span className="d-flex align-items-center gap-1">
                              {t("Create Action")} <FaArrowUpRightFromSquare size={11} />
                            </span>
                        }
                      </button>
                    )
                  }
                </div>
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img src={avatarSrc} width={36} height={36} alt="User"
                  className="rounded-circle object-fit-cover shadow-sm border border-white"
                  style={{ objectPosition: "top" }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .chat-background {
          background-color: #ffffff;
          background-image: radial-gradient(#f1f1f1 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .message-container {
          overflow-y: auto;
          padding-right: 8px;
          scroll-behavior: smooth;
        }
        .message-container::-webkit-scrollbar { width: 5px; }
        .message-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .message-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .message-bubble {
          position: relative;
          padding: 10px 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          max-width: 100%;
          word-break: break-word;
          overflow-wrap: anywhere;
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .my-message-bubble {
          background-color: #f0f2f5;
          color: #1c1e21;
          border-radius: 12px 12px 12px 2px;
          border: 1px solid #e4e6eb;
        }
        .other-message-bubble {
          border-radius: 12px 12px 2px 12px;
        }
        .pinned-badge {
          font-size: 0.75rem;
          color: #6c757d;
        }

        /* Mobile tweaks */
        @media (max-width: 480px) {
          .message-bubble {
            padding: 8px 10px;
            font-size: 0.83rem;
          }
          .message-input {
            padding: 8px !important;
          }
        }
      `}</style>

      <div className="meeting-discussion h-100">
        <div className="container-fluid h-100 p-0">
          <div className="card rounded-3 h-100 shadow-sm border-0 ">
            <div className="card-body d-flex flex-column p-0" style={{ minHeight: "50vh", height: "100%" }}>

              {/* Header */}
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white rounded-top-3">
                <h6 className="m-0 fw-bold text-dark">{t("Discussion")}</h6>
                <button
                  onClick={() => setViewMode(viewMode === 'conversation' ? 'list' : 'conversation')}
                  className="btn btn-sm btn-light border d-flex align-items-center gap-1"
                  title={viewMode === 'conversation' ? t("Switch to List View") : t("Switch to Conversation View")}
                >
                  {viewMode === 'conversation' ? <FaList size={13} /> : <FaComments size={13} />}
                  <span className="d-none d-sm-inline" style={{ fontSize: '0.8rem' }}>
                    {viewMode === 'conversation' ? t("List") : t("Conversation")}
                  </span>
                </button>
              </div>

              {/* Messages */}
              <div
                className={`message-container flex-grow-1 p-md-3 ${viewMode === 'conversation' ? 'chat-background' : 'bg-white'}`}
                ref={messageContainerRef}
              >
                {messages?.length > 0 ? (
                  <>
                    {messages.filter(msg => msg.is_pinned).map(message => (
                      <MessageItem
                        key={message.id} message={message}
                        onEdit={handleEditMessage} onDelete={handleDeleteMessage}
                        onPin={handlePinMessage} onShowAction={handleShowAction}
                        isEditing={editingMessage?.id === message.id}
                        currentUserId={currentUserId} userData={userData} viewMode={viewMode}
                      />
                    ))}
                    {messages.filter(msg => !msg.is_pinned).map(message => (
                      <MessageItem
                        key={message.id} message={message}
                        onEdit={handleEditMessage} onDelete={handleDeleteMessage}
                        onPin={handlePinMessage} onShowAction={handleShowAction}
                        isEditing={editingMessage?.id === message.id}
                        currentUserId={currentUserId} userData={userData} viewMode={viewMode}
                      />
                    ))}
                  </>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-chat-square-text fs-1"></i>
                      <p className="mt-2" style={{ fontSize: '0.9rem' }}>
                        {selectedMoment ? t("NoMessagesYet") : t("SelectMomentToViewMessages")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              {selectedMoment && (
                <div className="message-input mt-auto border-top p-2 bg-white">
                  <MessageTypeWritterReport
                    onSendMessage={handleSendMessage}
                    editorRef={editorRef}
                    isEditing={!!editingMessage}
                    onCancelEdit={cancelEdit}
                    participants={selectedMoment?.user_with_participants}
                    meeting={selectedMoment}
                    onFileUpload={handleFileUpload}
                    onRemoveAttachment={removeAttachment}
                    attachments={attachments}
                    isExpanded={isExpanded}
                    setIsExpanded={setIsExpanded}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {showActionModal && (
          <div className="action-modal">
            <StepChart
              meetingId={selectedMoment?.id}
              id={id}
              show={showActionModal}
              setId={setId}
              closeModal={handleHideAction}
              meeting={selectedMoment}
              isDrop={isDrop}
              setIsDrop={setIsDrop}
              editorContent={actionModalId}
              openedFrom="discussion"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default MeetingDiscussion;