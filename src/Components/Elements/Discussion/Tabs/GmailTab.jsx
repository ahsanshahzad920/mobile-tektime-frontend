import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Space, Spin, Tabs, Badge, Avatar, Typography, Select, Layout, Button } from "antd";
import { useTranslation } from "react-i18next";
import { FaInbox, FaPaperPlane, FaPlus } from "react-icons/fa";
import DiscussionChat from "../DiscussionChat";
import { getAllGmailDestinations, getGmailDestinationMeetings } from "../api";
import useMeetingPolling from "../Hooks/useMeetingPolling";

const { Text } = Typography;
const { Content } = Layout;

const GmailTab = ({ searchTerm, isActive, userData, refreshTrigger, onShowCompose }) => {
  const [t] = useTranslation("global");
  const [destinations, setDestinations] = useState([]);
  const [activeDestination, setActiveDestination] = useState(null);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [folder, setFolder] = useState("inbox");

  const fetchWithFolder = useCallback(
    (id, page) => getGmailDestinationMeetings(id, page, folder, searchTerm),
    [folder, searchTerm],
  );

  const {
    meetings,
    setMeetings,
    activeMeeting,
    loading: loadingMeetings,
    pagination,
    handleLoadMore,
  } = useMeetingPolling(
    fetchWithFolder,
    activeDestination,
    isActive,
    !!searchTerm,
  );

  const fetchDestinations = useCallback(async () => {
    try {
      const query = userData?.gmail_suite?.[0]?.first_sync === 0 ? "first_sync=true" : "sync=true";
      const data = await getAllGmailDestinations(query);
      const list = data?.data || [];
      setDestinations(list);
      if (list.length > 0 && !activeDestination) {
        setActiveDestination(list[0].id.toString());
      }
    } catch (e) { console.error(e); } finally { setLoadingDestinations(false); }
  }, [userData]);

  useEffect(() => {
    if (isActive) {
      fetchDestinations();
      const id = setInterval(fetchDestinations, 30000);
      return () => clearInterval(id);
    }
  }, [isActive, fetchDestinations, refreshTrigger]);

  const filteredDestinations = useMemo(() => {
    if (!searchTerm) return destinations;
    const term = searchTerm.toLowerCase();
    return destinations.filter(d => 
      d.destination_name?.toLowerCase().includes(term) || 
      d.clients?.client_name?.toLowerCase().includes(term)
    );
  }, [destinations, searchTerm]);

  const handleMeetingsUpdate = useCallback((upd) => {
    setMeetings(upd);
    const totalUnread = upd.reduce((s, m) => s + (m.unread_messages_count || 0), 0);
    setDestinations(dest => dest.map(d => 
      d.id.toString() === activeDestination ? { ...d, unread_messages_count: totalUnread } : d
    ));
  }, [activeDestination]);

  const tabItems = useMemo(() => {
    return filteredDestinations.map(d => ({
      key: d.id.toString(),
      label: (
        <Badge count={d.unread_messages_count} offset={[10, 0]} size="small">
          <Space>
             {d.clients?.client_logo ? <Avatar size="small" src={d.clients.client_logo} /> : <Avatar size="small">{d.destination_name?.charAt(0)}</Avatar>}
             <Text ellipsis style={{ maxWidth: 120 }}>{d.destination_name}</Text>
          </Space>
        </Badge>
      )
    }));
  }, [filteredDestinations]);

  if (!isActive) return null;

  return (
    <div className="h-100 d-flex flex-column bg-white">
      {loadingDestinations ? <div className="p-5 text-center"><Spin /></div> : (
        <>
          <div className={`px-2 px-md-3 border-bottom d-flex ${window.innerWidth < 768 ? 'flex-column gap-2 py-2' : 'align-items-center justify-content-end gap-3'} bg-light bg-opacity-10 shadow-sm`}>
            {window.innerWidth < 768 && (
              <Select
                value={activeDestination}
                onChange={setActiveDestination}
                className="w-100"
                size="middle"
                placeholder="Select Destination"
              >
                {filteredDestinations.map(d => (
                  <Select.Option key={d.id.toString()} value={d.id.toString()}>
                    <Space>
                      {d.clients?.client_logo ? <Avatar size="small" src={d.clients.client_logo} /> : <Avatar size="small">{d.destination_name?.charAt(0)}</Avatar>}
                      {d.destination_name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            )}
            <div className={`d-flex align-items-center gap-2 ${window.innerWidth < 768 ? "w-100 justify-content-between" : "py-2"}`}>
              <Button 
                type="primary" 
                size="small" 
                icon={<FaPlus />} 
                onClick={onShowCompose}
                className="flex-shrink-0"
              >
                {t("Compose", "Nouveau")}
              </Button>
              <Select 
                value={folder} 
                onChange={setFolder}
                style={{ width: window.innerWidth < 768 ? '100%' : 150 }}
                variant={window.innerWidth < 768 ? "outlined" : "borderless"}
                className="fw-bold"
                options={[
                  { value: 'inbox', label: <Space><FaInbox className="text-primary"/> {t("header.inbox", "Boîte de réception")}</Space> },
                  { value: 'sent', label: <Space><FaPaperPlane className="text-primary"/> {t("header.sentMessages", "Messages envoyés")}</Space> }
                ]}
              />
            </div>
          </div>
          
          <Content className="flex-grow-1 overflow-hidden position-relative">
             {loadingMeetings && <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-index-1" style={{ zIndex: 5 }}><Spin tip="Chargement des e-mails..." /></div>}
             <div className="h-100">
               {activeMeeting || window.innerWidth >= 768 ? (
                 <DiscussionChat 
                    meetingId={activeMeeting}
                    meetingsData={meetings}
                    onMeetingsUpdate={handleMeetingsUpdate}
                    isGmail={true}
                    onLoadMore={handleLoadMore}
                    hasMore={pagination.current_page < pagination.last_page}
                    userData={userData}
                    folder={folder}
                    searchTerm={searchTerm}
                    missionsData={filteredDestinations}
                    selectedMissionId={activeDestination}
                    onMissionSelect={setActiveDestination}
                 />
               ) : <div className="p-5 text-center text-muted">Aucun message trouvé</div>}
             </div>
          </Content>
        </>
      )}
    </div>
  );
};

export default GmailTab;
