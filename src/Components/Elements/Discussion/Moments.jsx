import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { List, Avatar, Typography, Space, Badge, Tooltip, Button } from "antd";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { SiIonos, SiGmail } from "react-icons/si";
import { FaChevronRight, FaClock } from "react-icons/fa";
import { Assets_URL } from "../../Apicongfig";
import moment from "moment";

const { Text, Title } = Typography;

const Moments = ({ meetingsData, onMomentSelect, selectedMoment, onLoadMore, hasMore }) => {
  const [t] = useTranslation("global");

  const formatMomentDate = (dateStr) => {
    if (!dateStr) return "";
    const date = moment.utc(dateStr).local();
    const now = moment();
    if (date.isSame(now, 'day')) return date.format('HH:mm');
    if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return "Hier";
    return date.format('DD/MM');
  };

  const getCleanType = (type) => {
    if (!type) return "";
    return type.replace(/Conversation\s*/i, "").trim();
  };

  const renderIcon = (item) => {
    const type = item.type || "";
    if (type.includes("Outlook")) return <PiMicrosoftOutlookLogoFill color="#0A66C2" size={24} />;
    if (type.includes("Gmail")) return <Avatar size={24} src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" style={{ backgroundColor: 'transparent' }} />;
    if (type.includes("IONOS")) return <SiIonos color="#003D8F" size={24} />;
    
    const logo = item.clients?.client_logo || item.client?.client_logo || item.image;
    if (logo) {
      const src = logo.startsWith("http") ? logo : `${Assets_URL}/${logo.replace(/^\//, "")}`;
      return <Avatar src={src} size={32} />;
    }
    
    return <Avatar size={32} style={{ backgroundColor: '#1890ff' }}>{item.title?.charAt(0).toUpperCase() || "M"}</Avatar>;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('terminé') || s?.includes('fini') || s === 'done' || s === 'closed') return '#52c41a';
    if (s?.includes('cours') || s?.includes('doing')) return '#1890ff';
    if (s?.includes('attente') || s?.includes('pending')) return '#faad14';
    return '#8c8c8c';
  };

  return (
    <div className="h-100 d-flex flex-column" style={{ overflowX: 'hidden', width: '100%' }}>
      <List
        className="moments-list"
        dataSource={meetingsData || []}
        split={false}
        style={{ width: '100%' }}
        loadMore={hasMore && (
           <div className="text-center p-3">
              <Button type="link" onClick={onLoadMore}>Charger plus</Button>
           </div>
        )}
        renderItem={item => {
          const isSelected = selectedMoment?.id === item.id;
          const status = item.status || item.meeting_status || item.destination_status;
          
          return (
            <div 
              className={`px-3 py-3 rounded-0 mb-0 cursor-pointer transition-all border-bottom ${isSelected ? 'bg-light bg-opacity-75' : 'bg-white hover-bg-light border-light'}`}
              onClick={() => onMomentSelect(item)}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                borderLeft: isSelected ? '4px solid #25D366' : '4px solid transparent',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div className="d-flex gap-3 align-items-center w-100 overflow-hidden">
                 <div className="flex-shrink-0">{renderIcon(item)}</div>
                 <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-start gap-2">
                       <Title level={5} className="m-0" ellipsis style={{ 
                         fontSize: '15px', 
                         fontWeight: 600,
                         color: '#111b21',
                         flex: 1,
                         minWidth: 0
                       }}>
                         {item.title || item.destination_name || "Sans titre"}
                       </Title>
                       <Text type="secondary" style={{ 
                         fontSize: '11px', 
                         whiteSpace: 'nowrap', 
                         color: item.unread_messages_count > 0 ? '#25D366' : '#667781',
                         flexShrink: 0 
                       }}>
                         {formatMomentDate(item.last_message_date || item.updated_at)}
                       </Text>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-1 gap-2 overflow-hidden">
                       <Text type="secondary" size="small" ellipsis style={{ fontSize: '13px', color: '#667781', flexGrow: 1, minWidth: 0 }}>
                          {getCleanType(item.type)} {item.objective ? `• ${item.objective}` : ""}
                       </Text>
                       <div className="flex-shrink-0">
                          <Badge 
                             count={item.unread_messages_count} 
                             size="small" 
                             style={{ backgroundColor: '#25D366', borderColor: '#25D366', fontSize: '10px', minWidth: '18px', height: '18px', lineHeight: '18px' }} 
                          />
                       </div>
                    </div>
                    {status && (
                       <div className="mt-1">
                          <Text style={{ fontSize: '10px', color: getStatusColor(status), fontWeight: 600, textTransform: 'uppercase' }}>{status}</Text>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default React.memo(Moments);
