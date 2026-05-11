import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { List, Avatar, Typography, Space, Badge, Tooltip, Button } from "antd";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { SiIonos, SiGmail } from "react-icons/si";
import { FaChevronRight, FaClock } from "react-icons/fa";
import { Assets_URL } from "../../Apicongfig";
import moment from "moment";

const { Text, Title } = Typography;

const Moments = ({
  meetingsData,
  onMomentSelect,
  selectedMoment,
  onLoadMore,
  hasMore,
}) => {
  const [t] = useTranslation("global");

  const formatMomentDate = (dateStr) => {
    if (!dateStr) return "";
    const date = moment(dateStr);
    const now = moment();
    if (date.isSame(now, "day")) return date.format("HH:mm");
    if (date.isSame(now.clone().subtract(1, "day"), "day")) return "Hier";
    return date.format("DD/MM");
  };

  const getCleanType = (type) => {
    if (!type) return "";
    return type.replace(/Conversation\s*/i, "").trim();
  };

  const renderIcon = (item) => {
    const type = item.type || "";
    if (type.includes("Outlook"))
      return <PiMicrosoftOutlookLogoFill color="#0A66C2" size={24} />;
    if (type.includes("Gmail"))
      return (
        <Avatar
          size={24}
          src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
          style={{ backgroundColor: "transparent" }}
        />
      );
    if (type.includes("IONOS")) return <SiIonos color="#003D8F" size={24} />;

    const logo =
      item.clients?.client_logo || item.client?.client_logo || item.image;
    if (logo) {
      const src = logo.startsWith("http")
        ? logo
        : `${Assets_URL}/${logo.replace(/^\//, "")}`;
      return <Avatar src={src} size={32} />;
    }

    return (
      <Avatar size={32} style={{ backgroundColor: "#1890ff" }}>
        {item.title?.charAt(0).toUpperCase() || "M"}
      </Avatar>
    );
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (
      s?.includes("terminé") ||
      s?.includes("fini") ||
      s === "done" ||
      s === "closed"
    )
      return "#52c41a";
    if (s?.includes("cours") || s?.includes("doing")) return "#1890ff";
    if (s?.includes("attente") || s?.includes("pending")) return "#faad14";
    return "#8c8c8c";
  };

  return (
    <div
      className="h-100 d-flex flex-column"
      style={{ overflowX: "hidden", width: "100%" }}
    >
      <List
        className="moments-list"
        dataSource={meetingsData || []}
        split={false}
        style={{ width: "100%" }}
        loadMore={
          hasMore && (
            <div className="text-center p-3">
              <Button type="link" onClick={onLoadMore}>
                Charger plus
              </Button>
            </div>
          )
        }
        renderItem={(item) => {
          const isSelected = selectedMoment?.id === item.id;
          const status =
            item.status || item.meeting_status || item.destination_status;

          return (
            <div
              className={`px-3 py-3 rounded-3 mb-2 cursor-pointer transition-all ${isSelected ? "selected-item" : "item-card"}`}
              onClick={() => onMomentSelect(item)}
              style={{
                margin: "8px 12px",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: isSelected ? "#f0f7ff" : "#fff",
                border: isSelected ? "1px solid #1890ff" : "1px solid #f0f0f0",
                boxShadow: isSelected
                  ? "0 4px 12px rgba(24, 144, 255, 0.1)"
                  : "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
              }}
            >
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
                <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
                  {renderIcon(item)}
                </div>

                <div
                  className="flex-grow-1 overflow-hidden"
                  style={{ minWidth: 0 }}
                >
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
                      {item.title || item.destination_name || "Sans titre"}
                    </Text>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "11px",
                        color: "#8c8c8c",
                        fontWeight: 500,
                        marginTop: "2px",
                      }}
                    >
                      {formatMomentDate(
                        item.last_message_date || item.updated_at,
                      )}
                    </Text>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    <Text
                      type="secondary"
                      size="small"
                      ellipsis
                      style={{
                        fontSize: "12px",
                        color: "#595959",
                        lineHeight: "1.4",
                      }}
                    >
                      {getCleanType(item.type)}{" "}
                      {item.objective ? `• ${item.objective}` : ""}
                    </Text>

                    <div className="d-flex justify-content-between align-items-center">
                      {status ? (
                        <div className="d-flex align-items-center gap-1">
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: getStatusColor(status),
                            }}
                          />
                          <Text
                            style={{
                              fontSize: "10px",
                              color: getStatusColor(status),
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {status}
                          </Text>
                        </div>
                      ) : (
                        <div />
                      )}

                      <Badge
                        count={item.unread_messages_count}
                        size="small"
                        style={{
                          backgroundColor: "#1890ff",
                          boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <style>{`
                .item-card:hover {
                  background-color: #fafafa !important;
                  border-color: #d9d9d9 !important;
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
                }
                .selected-item {
                  transform: scale(1.01);
                }
              `}</style>
            </div>
          );
        }}
      />
    </div>
  );
};

export default React.memo(Moments);
