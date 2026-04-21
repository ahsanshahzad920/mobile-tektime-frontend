import React from "react";
import { Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import { List, Avatar, Typography, Badge, Space, Card, Tooltip } from "antd";
import { FaStar } from "react-icons/fa";

const { Text, Title } = Typography;

function DiscussionParticipant({ selectedMoment, isCollapsed }) {
  const [t] = useTranslation("global");

  if (!selectedMoment?.user_with_participants?.length) {
    return (
      <div className="p-4 text-center text-muted">
        {isCollapsed ? "..." : "Aucun participant trouvé"}
      </div>
    );
  }

  const uniqueParticipants = selectedMoment.user_with_participants.reduce((acc, current) => {
    if (!acc.find((p) => p.email === current.email)) acc.push(current);
    return acc;
  }, []);

  const eventOrganizerEmail = selectedMoment?.event_organizer?.email || null;
  const userEmail = selectedMoment.user?.email || null;
  const meetingType = selectedMoment?.type;

  const isEmailType = ["Google Agenda Event", "Outlook Agenda Event", "Conversation Outlook", "Conversation IONOS", "Conversation Gmail"].includes(meetingType);

  let organizer = null;
  let participants = [];

  if (isEmailType) {
    organizer = {
      email: eventOrganizerEmail,
      full_name: selectedMoment?.event_organizer?.full_name || selectedMoment?.event_organizer?.name || eventOrganizerEmail,
      image: selectedMoment?.event_organizer?.image,
      isOrganizer: true
    };
    participants = uniqueParticipants.filter(p => p.email?.toLowerCase() !== eventOrganizerEmail?.toLowerCase());
  } else {
    organizer = uniqueParticipants.find(p => p.email?.toLowerCase() === userEmail?.toLowerCase());
    participants = uniqueParticipants.filter(p => p.email?.toLowerCase() !== (organizer?.email?.toLowerCase() || ""));
    if (organizer) organizer.isOrganizer = true;
  }

  const getAvatar = (item) => {
    const src = item.image || item.participant_image;
    if (src?.startsWith("http")) return src;
    if (src) return `${Assets_URL}/${src.replace(/^\//,'')}`;
    return null;
  };

  const renderParticipant = (item) => (
    <div className={`p-2 d-flex align-items-center gap-3 ${isCollapsed ? 'justify-content-center' : ''}`} key={item.email || item.id}>
      <Badge count={item.isOrganizer ? <FaStar style={{ color: '#fadb14', fontSize: '10px' }} /> : 0} offset={[-2, 32]}>
         <Avatar 
            size={isCollapsed ? "small" : "large"} 
            src={getAvatar(item)}
            className={item.isOrganizer ? 'border border-primary' : ''}
         >
            {item.full_name?.charAt(0) || "?"}
         </Avatar>
      </Badge>
      {!isCollapsed && (
        <div style={{ minWidth: 0, flex: 1 }}>
           <div className="d-flex align-items-center gap-2">
              <Text strong ellipsis>{item.full_name || "Utilisateur"}</Text>
              {item.isOrganizer && <Badge status="success" text={<Text size="small" type="success" style={{ fontSize: '10px' }}>Org</Text>} />}
           </div>
           <Text type="secondary" size="small" ellipsis className="d-block" style={{ fontSize: '11px' }}>{item.post || item.email}</Text>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-100 bg-white border-start">
      <div className="p-3 border-bottom bg-light bg-opacity-10">
         <Text strong type="secondary">{isCollapsed ? <Badge count={uniqueParticipants.length} /> : `PARTICIPANTS (${uniqueParticipants.length})`}</Text>
      </div>
      <div className="overflow-auto" style={{ height: 'calc(100% - 45px)' }}>
         {organizer && renderParticipant(organizer)}
         {participants.map(renderParticipant)}
      </div>
    </div>
  );
}

export default DiscussionParticipant;
