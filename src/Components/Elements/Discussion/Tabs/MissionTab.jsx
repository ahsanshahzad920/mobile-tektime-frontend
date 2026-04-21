import React, { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import { Space, Spin, Tabs, Badge, Avatar, Typography, Result, Select } from "antd";
import DiscussionChat from "../DiscussionChat";
import { getAllDestinations, getDestinationMeetings } from "../api";

const { Text } = Typography;

const formatMomentDate = (dateStr) => {
  if (!dateStr) return "";
  const date = moment.utc(dateStr).local();
  const now = moment();
  if (date.isSame(now, 'day')) return date.format('HH:mm');
  if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return "Hier";
  return date.format('DD/MM');
};

const MissionTab = ({ searchTerm, isActive, userData }) => {
  const [destinations, setDestinations] = useState([]);
  const [activeDestination, setActiveDestination] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState({
    destinations: true,
    meetings: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMeetings = async (destinationId) => {
    try {
      setLoading((prev) => ({ ...prev, meetings: true }));
      const meetingsData = await getDestinationMeetings(destinationId);
      setMeetings(meetingsData?.data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading((prev) => ({ ...prev, meetings: false }));
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, destinations: true }));
      try {
        const destinationsData = await getAllDestinations();
        const data = destinationsData?.data || [];
        setDestinations(data);

        if (data.length > 0) {
          const firstId = data[0].id;
          setActiveDestination(firstId.toString());
          await fetchMeetings(firstId);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading((prev) => ({ ...prev, destinations: false }));
      }
    };

    fetchInitialData();
  }, [isActive]);

  const handleDestinationChange = (key) => {
    setActiveDestination(key);
    fetchMeetings(key);
  };

  const filteredDestinations = useMemo(() => {
    if (!searchTerm) return destinations;
    const term = searchTerm.toLowerCase();
    return destinations.filter(
      (d) =>
        d.destination_name?.toLowerCase().includes(term) ||
        d.clients?.client_name?.toLowerCase().includes(term)
    );
  }, [destinations, searchTerm]);

  const handleMeetingsUpdate = useCallback((newMeetings) => {
    setMeetings((prev) => {
      const updated = prev.map((m) => {
        const upd = newMeetings.find((n) => n.id === m.id);
        return upd ? { ...m, ...upd } : m;
      });

      const totalUnread = updated.reduce((s, m) => s + (m.unread_messages_count || 0), 0);
      const lastDate = updated.reduce((max, m) => {
        const date = m.last_message_date || m.updated_at;
        if (!max) return date;
        if (!date) return max;
        return new Date(date) > new Date(max) ? date : max;
      }, null);

      setDestinations(dest => dest.map(d => 
        d.id.toString() === activeDestination ? { ...d, unread_messages_count: totalUnread, last_message_date: lastDate } : d
      ));
      return updated;
    });
  }, [activeDestination]);

  const tabItems = useMemo(() => {
    return filteredDestinations.map((d) => ({
      key: d.id.toString(),
      label: (
        <Badge count={d.unread_messages_count} offset={[10, 0]} size="small">
          <Space align="center">
            {d.clients?.client_logo ? (
              <Avatar size="small" src={d.clients.client_logo} />
            ) : (
              <Avatar size="small" style={{ backgroundColor: '#87d068' }}>
                {d.destination_name?.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Text 
              strong={activeDestination === d.id.toString()}
              style={{ 
                color: activeDestination === d.id.toString() ? '#1677ff' : 'inherit',
                maxWidth: '120px'
              }}
              ellipsis
            >
              {d.destination_name}
            </Text>
            <Text type="secondary" style={{ fontSize: '10px', marginLeft: '4px' }}>
              {formatMomentDate(d.last_message_date || d.updated_at)}
            </Text>
          </Space>
        </Badge>
      ),
    }));
  }, [filteredDestinations, activeDestination]);

  if (!isActive) return null;

  return (
    <div className="h-100 d-flex flex-column bg-white">
      {loading.destinations ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <Spin size="large" tip="Loading Missions..." />
        </div>
      ) : destinations.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <Result status="info" title="No Missions available" />
        </div>
      ) : (
        <>
          {/* Mission Tabs / Mobile Dropdown */}
          <div className="px-3 border-bottom shadow-sm bg-white">
            {isMobile ? (
              <div className="py-2">
                <Select
                  value={activeDestination}
                  onChange={handleDestinationChange}
                  className="w-100"
                  size="middle"
                  dropdownStyle={{ zIndex: 10000 }}
                >
                  {filteredDestinations.map(d => (
                    <Select.Option key={d.id.toString()} value={d.id.toString()}>
                      <Space>
                        {d.clients?.client_logo ? (
                          <Avatar size="small" src={d.clients.client_logo} />
                        ) : (
                          <Avatar size="small" style={{ backgroundColor: '#87d068' }}>{d.destination_name?.charAt(0).toUpperCase()}</Avatar>
                        )}
                        {d.destination_name}
                        <Text type="secondary" style={{ fontSize: '10px', marginLeft: 'auto' }}>
                          {formatMomentDate(d.last_message_date || d.updated_at)}
                        </Text>
                        {d.unread_messages_count > 0 && <Badge count={d.unread_messages_count} size="small" />}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </div>
            ) : (
              <Tabs
                activeKey={activeDestination}
                onChange={handleDestinationChange}
                items={tabItems}
                size="middle"
                tabBarStyle={{ marginBottom: 0 }}
                className="mission-tabs"
              />
            )}
          </div>

          {/* Discussion Area */}
          <div className="flex-grow-1 overflow-hidden position-relative">
            {loading.meetings ? (
              <div className="d-flex justify-content-center align-items-center h-100 bg-light bg-opacity-50 position-absolute w-100 z-index-1" style={{ zIndex: 10 }}>
                <Spin tip="Loading discussions..." />
              </div>
            ) : null}
            
            <div className="h-100">
              {meetings.length > 0 ? (
                <DiscussionChat
                  meetingId={meetings[0].id} // Assuming DiscussionChat handles the logic or we pick the first
                  meetingsData={meetings}
                  onMeetingsUpdate={handleMeetingsUpdate}
                   isOutlook={false}
                   userData={userData}
                />
              ) : (
                <div className="h-100 d-flex justify-content-center align-items-center">
                  <Text type="secondary">Aucun message dans cette mission</Text>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MissionTab;
