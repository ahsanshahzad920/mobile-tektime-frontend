import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatbotParticipant from "./ChatbotParticipant";
import ChatbotMoments from "./ChatbotMoments";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaRobot, FaUser } from "react-icons/fa";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";

const Chatbot = ({ meetingsData }) => {
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState({ messages: false });
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messageContainerRef = useRef(null);
  const [t] = useTranslation("global");

  // Auto-select first moment on desktop
  useEffect(() => {
    if (
      meetingsData?.length > 0 &&
      !selectedMoment &&
      window.innerWidth >= 768
    ) {
      setSelectedMoment(meetingsData[0]);
    }
  }, [meetingsData, selectedMoment]);

  // Load messages when moment changes
  useEffect(() => {
    if (selectedMoment?.id) {
      fetchMessages(selectedMoment.id);
    }
  }, [selectedMoment?.id]);

  const fetchMessages = async (momentId) => {
    setLoading((prev) => ({ ...prev, messages: true }));
    setMessages([]);

    try {
      const token = CookieService.get("token");
      const response = await axios.get(
        `${API_BASE_URL}/chatbot_conversation_logs/${momentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(response.data?.data?.logs || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  };

  const handleMomentSelect = (moment) => {
    setSelectedMoment(moment);
    if (window.innerWidth < 768) {
      setShowMobileChat(true);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const MessageItem = ({ message }) => {
    const isBot = message?.sender?.type === "bot";
    const senderName = message?.sender?.name || (isBot ? "Assistant" : "User");

    const formatDateForDisplay = (isoString) => {
      return new Date(isoString).toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    return (
      <div
        className={`message mb-4 d-flex gap-3 ${isBot ? "flex-row" : "flex-row"}`}
        style={{ justifyContent: "flex-start" }}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={
              message?.sender?.image
                ? message.sender?.image?.startsWith("http")
                  ? message.sender?.image
                  : Assets_URL + "/" + message?.sender?.image
                : "/default-bot-avatar.png"
            }
            width={48}
            height={48}
            alt={isBot ? "Bot" : "User"}
            className="rounded-circle object-fit-cover"
            style={{ objectPosition: "top" }}
          />
        </div>

        {/* Content */}
        <div
          className="flex-grow-1 overflow-hidden"
          style={{ maxWidth: "85%" }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <strong className="text-primary">{senderName}</strong>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              {formatDateForDisplay(message.created_at)}
            </small>
          </div>
          <div
            className="message-content p-3 rounded-3 bg-light"
            style={{
              borderTopLeftRadius: !isBot ? "16px" : "4px",
              borderTopRightRadius: isBot ? "4px" : "16px",
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
              fontSize: "0.9rem",
              lineHeight: "1.4",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: message.message }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .discussion-layout {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .discussion-layout {
            grid-template-columns: 1fr 2fr 1fr;
          }
        }
        .message-container {
          overflow-y: auto;
          max-height: 60vh;
          padding-right: 8px;
        }
        .message-container::-webkit-scrollbar {
          width: 6px;
        }
        .message-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        /* Mobile specific adjustments to keep the professional look */
        @media (max-width: 767px) {
          .discussion-layout {
             display: block;
             position: relative;
             height: calc(100vh - 180px);
             overflow: hidden;
          }
          .moments-col {
             display: ${showMobileChat ? "none" : "block"};
             width: 100%;
             height: 100%;
          }
          .chat-col {
             display: ${showMobileChat ? "block" : "none"};
             position: absolute;
             top: 0; left: 0; width: 100%; height: 100%;
             z-index: 5;
             background: #fff;
          }
          .participants-col { display: none; }
          .message-container { max-height: calc(100vh - 300px); }
        }
      `}</style>

      <div className="container-fluid px-0 px-md-3 mt-4">
        <div className="discussion-layout">
          {/* Moments */}
          <div className="order-1 moments-col">
            <ChatbotMoments
              meetingsData={meetingsData}
              onMomentSelect={handleMomentSelect}
              selectedMoment={selectedMoment}
            />
          </div>

          {/* Center: Messages */}
          <div className="order-3 order-md-2 chat-col">
            <div className="card rounded-0 h-100 shadow-sm border-0">
              <div
                className="card-body d-flex flex-column p-0 p-md-3"
                style={{ minHeight: "70vh" }}
              >
                <div className="moment-header mb-3 border-bottom pb-3 px-3 px-md-0 d-flex align-items-center gap-2">
                  {showMobileChat && (
                    <button
                      className="btn btn-link p-0 text-muted d-md-none"
                      onClick={handleBackToList}
                    >
                      <FaChevronLeft size={20} />
                    </button>
                  )}
                  <div>
                    <h5
                      className="mb-0 text-truncate"
                      style={{ maxWidth: "200px" }}
                    >
                      {selectedMoment?.title || t("Chatbot")}
                    </h5>
                    <small className="text-muted">
                      {selectedMoment?.destination?.destination_name}
                    </small>
                  </div>
                </div>

                <div
                  className="message-container flex-grow-1 mb-3 px-3 px-md-0"
                  ref={messageContainerRef}
                >
                  {loading.messages ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <div
                        className="spinner-border text-primary spinner-border-sm"
                        role="status"
                      />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <MessageItem key={message.id} message={message} />
                    ))
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center text-muted py-4">
                      <FaRobot size={48} className="mb-3 opacity-25" />
                      <p>
                        {selectedMoment
                          ? t("No messages yet")
                          : t("Select a conversation")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="order-2 order-md-3 participants-col">
            <ChatbotParticipant selectedMoment={selectedMoment} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
