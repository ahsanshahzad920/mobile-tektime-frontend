import React from "react";
import { Avatar, Badge, Typography } from "antd";
import { FaStar } from "react-icons/fa";
import { SiChatbot } from "react-icons/si";
import { Assets_URL } from "../../../Apicongfig";

const { Text } = Typography;

function ChatbotParticipant({ selectedMoment, isCollapsed = false }) {
  // Support both single object and array
  const rawParticipants = selectedMoment?.participants;

  // Normalize to array
  const participantList = Array.isArray(rawParticipants)
    ? rawParticipants
    : rawParticipants
    ? [rawParticipants]
    : [];

  // Also check user_with_participants
  const userParticipants = selectedMoment?.user_with_participants || [];

  // Merge both sources, deduplicate by email or id
  const allParticipants = [...participantList, ...userParticipants].reduce(
    (acc, p) => {
      const key = p.email || p.id;
      if (key && !acc.find((x) => (x.email || x.id) === key)) acc.push(p);
      return acc;
    },
    []
  );

  if (!allParticipants.length) {
    return (
      <div className="p-4 text-center" style={{ color: "#8c8c8c" }}>
        {!isCollapsed && (
          <>
            <SiChatbot size={28} style={{ opacity: 0.25, marginBottom: 8 }} />
            <Text type="secondary" className="d-block" style={{ fontSize: "12px" }}>
              Sélectionnez une conversation
            </Text>
          </>
        )}
      </div>
    );
  }

  const getAvatarSrc = (p) => {
    const src = p.participant_image || p.image;
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${Assets_URL}/${src.replace(/^\//, "")}`;
  };

  const renderParticipant = (item, index) => {
    const avatarSrc = getAvatarSrc(item);
    const name = item.full_name || item.name || "Utilisateur";
    const subtitle = item.post || item.role || item.email || "";
    const email = item.email || "";
    const isOrg = item.isOrganizer || index === 0; // first is treated as organizer

    return (
      <div
        key={item.email || item.id || index}
        className={`p-2 d-flex align-items-center gap-3 ${
          isCollapsed ? "justify-content-center" : ""
        }`}
        style={{
          padding: "10px 14px",
          transition: "background 0.15s",
          borderRadius: 6,
          cursor: "default",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Avatar with star badge for organizer */}
        <Badge
          count={
            isOrg ? (
              <FaStar style={{ color: "#fadb14", fontSize: "10px" }} />
            ) : 0
          }
          offset={[-2, isCollapsed ? 28 : 36]}
        >
          <Avatar
            size={isCollapsed ? "small" : "large"}
            src={avatarSrc}
            style={{
              border: isOrg ? "2px solid #1890ff" : "1px solid #e9ecef",
              backgroundColor: "#e6f7ff",
              color: "#1890ff",
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>

        {/* Info — hidden when collapsed */}
        {!isCollapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="d-flex align-items-center gap-2">
              <Text
                strong
                ellipsis
                style={{ fontSize: "13px", color: "#1a1a1a" }}
              >
                {name}
              </Text>
              {isOrg && (
                <Badge
                  status="success"
                  text={
                    <Text
                      type="success"
                      style={{ fontSize: "10px", fontWeight: 600 }}
                    >
                      Org
                    </Text>
                  }
                />
              )}
            </div>
            {subtitle && (
              <Text
                type="secondary"
                ellipsis
                className="d-block"
                style={{ fontSize: "11px", marginTop: 1 }}
              >
                {subtitle}
              </Text>
            )}
            {email && subtitle !== email && (
              <Text
                type="secondary"
                ellipsis
                className="d-block"
                style={{ fontSize: "10px", color: "#aaa", marginTop: 1 }}
              >
                {email}
              </Text>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-100 bg-white">
      {/* Sub-header: PARTICIPANTS (n) */}
      {!isCollapsed && (
        <div
          className="px-3 py-2 border-bottom"
          style={{ background: "#fafafa" }}
        >
          <Text
            type="secondary"
            strong
            style={{ fontSize: "11px", letterSpacing: "0.05em" }}
          >
            PARTICIPANTS ({allParticipants.length})
          </Text>
        </div>
      )}

      {/* List */}
      <div
        className="overflow-auto"
        style={{ height: isCollapsed ? "100%" : "calc(100% - 38px)" }}
      >
        {allParticipants.map((p, i) => renderParticipant(p, i))}
      </div>
    </div>
  );
}

export default ChatbotParticipant;