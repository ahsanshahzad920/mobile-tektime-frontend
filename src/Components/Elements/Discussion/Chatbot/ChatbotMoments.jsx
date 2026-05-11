import React from "react";
import { List, Avatar, Badge, Button, Typography } from "antd";
import { SiChatbot } from "react-icons/si";
import moment from "moment";

const { Text } = Typography;

function ChatbotMoments({ meetingsData, onMomentSelect, selectedMoment }) {
  const moments = meetingsData || [];

  if (!moments.length) {
    return (
      <div className="p-4 text-center text-muted">
        <SiChatbot size={32} className="mb-3 opacity-25" />
        <Text type="secondary">Aucune conversation trouvée</Text>
      </div>
    );
  }

  const formatMomentDate = (dateStr) => {
    if (!dateStr) return "";
    const date = moment(dateStr);
    const now = moment();
    if (date.isSame(now, "day")) return date.format("HH:mm");
    if (date.isSame(now.clone().subtract(1, "day"), "day")) return "Hier";
    return date.format("DD/MM");
  };

  const truncateTitle = (title) => {
    if (!title) return "";
    const sentences = title.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 6) return title;
    return sentences.slice(0, 6).join(" ").replace(/[.!?]+$/, "") + "...";
  };

  return (
    <div
      className="h-100 d-flex flex-column"
      style={{ overflowX: "hidden", width: "100%" }}
    >
      <List
        dataSource={moments}
        split={false}
        style={{ width: "100%" }}
        renderItem={(item) => {
          const isSelected = selectedMoment?.id === item.id;
          const displayTitle = truncateTitle(item.title || "");
          const objective = item?.destination?.destination_name || "Chatbot";

          return (
            <div
              key={item.id}
              onClick={() => onMomentSelect(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onMomentSelect(item)}
              style={{
                margin: "8px 12px",
                padding: "14px 16px",
                borderRadius: "12px",
                backgroundColor: isSelected ? "#f0f7ff" : "#fff",
                border: isSelected ? "1px solid #1890ff" : "1px solid #f0f0f0",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(24,144,255,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                cursor: "pointer",
              }}
              className={isSelected ? "chatbot-item-selected" : "chatbot-item"}
            >
              {/* Left accent bar when selected */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: "4px",
                    backgroundColor: "#1890ff",
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              )}

              <div className="d-flex gap-3 align-items-start w-100 overflow-hidden">
                {/* Icon */}
                <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                  <Avatar
                    size={36}
                    icon={<SiChatbot size={18} />}
                    style={{
                      backgroundColor: isSelected ? "#1890ff" : "#e6f7ff",
                      color: isSelected ? "#fff" : "#1890ff",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                  {/* Title + date row */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <Text
                      strong
                      ellipsis
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: isSelected ? "#1890ff" : "#1a1a1a",
                        flex: 1,
                      }}
                    >
                      {displayTitle || "Sans titre"}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "11px",
                        color: "#8c8c8c",
                        fontWeight: 500,
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatMomentDate(item.date || item.updated_at)}
                    </Text>
                  </div>

                  {/* Subtitle + unread badge row */}
                  <div className="d-flex justify-content-between align-items-center">
                    <Text
                      type="secondary"
                      ellipsis
                      style={{
                        fontSize: "12px",
                        color: "#595959",
                        lineHeight: "1.4",
                        flex: 1,
                      }}
                    >
                      {objective}
                    </Text>
                    {item.unread_messages_count > 0 && (
                      <Badge
                        count={item.unread_messages_count}
                        size="small"
                        style={{
                          backgroundColor: "#1890ff",
                          boxShadow: "0 2px 4px rgba(24,144,255,0.3)",
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      />

      <style>{`
        .chatbot-item:hover {
          background-color: #fafafa !important;
          border-color: #d9d9d9 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        .chatbot-item-selected {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
}

export default ChatbotMoments;
