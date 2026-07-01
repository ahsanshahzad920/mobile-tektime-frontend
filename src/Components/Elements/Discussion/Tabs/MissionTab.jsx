import React, { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import { Space, Spin, Tabs, Badge, Avatar, Typography, Result, Select } from "antd";
import DiscussionChat from "../DiscussionChat";
import { getAllDestinations, getDestinationMeetings } from "../api";

const { Text } = Typography;

const formatMomentDate = (dateStr) => {
  if (!dateStr) return "";
  const date = moment(dateStr);
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    loadingMore: false,
  });
  const [meetingsPagination, setMeetingsPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    loadingMore: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMeetings = async (destinationId, page = 1) => {
    try {
      if (page === 1) {
        setLoading((prev) => ({ ...prev, meetings: true }));
      } else {
        setMeetingsPagination((prev) => ({ ...prev, loadingMore: true }));
      }

      const response = await getDestinationMeetings(destinationId, page);
      const responseData = response?.data;
      let list = [];
      let lastPage = 1;

      if (responseData) {
        if (Array.isArray(responseData)) {
          list = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          list = responseData.data;
          lastPage = responseData.last_page || 1;
        }
      }

      if (page === 1) {
        setMeetings(list);
        setMeetingsPagination({
          currentPage: 1,
          lastPage: lastPage,
          loadingMore: false,
        });
      } else {
        setMeetings((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const filteredNew = list.filter((m) => !existingIds.has(m.id));
          return [...prev, ...filteredNew];
        });
        setMeetingsPagination({
          currentPage: page,
          lastPage: lastPage,
          loadingMore: false,
        });
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      if (page === 1) setMeetings([]);
      setMeetingsPagination((prev) => ({ ...prev, loadingMore: false }));
    } finally {
      if (page === 1) {
        setLoading((prev) => ({ ...prev, meetings: false }));
      }
    }
  };

  const handleLoadMoreMeetings = async () => {
    if (meetingsPagination.loadingMore || meetingsPagination.currentPage >= meetingsPagination.lastPage) return;
    if (!activeDestination) return;
    await fetchMeetings(activeDestination, meetingsPagination.currentPage + 1);
  };

  useEffect(() => {
    if (!isActive) return;

    const fetchInitialData = async () => {
      setLoading((prev) => ({ ...prev, destinations: true }));
      try {
        const response = await getAllDestinations(1);
        const responseData = response?.data;
        let list = [];
        let lastPage = 1;
        
        if (responseData) {
          if (Array.isArray(responseData)) {
            list = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            list = responseData.data;
            lastPage = responseData.last_page || 1;
          }
        }
        
        setDestinations(list);
        setPagination({
          currentPage: 1,
          lastPage: lastPage,
          loadingMore: false,
        });

        if (list.length > 0) {
          const firstId = list[0].id;
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

  const handleLoadMoreDestinations = async () => {
    if (pagination.loadingMore || pagination.currentPage >= pagination.lastPage) return;
    
    setPagination((prev) => ({ ...prev, loadingMore: true }));
    try {
      const nextPage = pagination.currentPage + 1;
      const response = await getAllDestinations(nextPage);
      const responseData = response?.data;
      let newList = [];
      let lastPage = pagination.lastPage;
      
      if (responseData) {
        if (Array.isArray(responseData)) {
          newList = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          newList = responseData.data;
          lastPage = responseData.last_page || lastPage;
        }
      }
      
      setDestinations((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const filteredNew = newList.filter((d) => !existingIds.has(d.id));
        return [...prev, ...filteredNew];
      });
      
      setPagination({
        currentPage: nextPage,
        lastPage: lastPage,
        loadingMore: false,
      });
    } catch (error) {
      console.error("Error loading more destinations:", error);
      setPagination((prev) => ({ ...prev, loadingMore: false }));
    }
  };

  const handleDestinationChange = (key) => {
    setActiveDestination(key);
    setMeetings([]);
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

  const activeDestinationRef = React.useRef(activeDestination);
  useEffect(() => { activeDestinationRef.current = activeDestination; }, [activeDestination]);

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
        d.id.toString() === activeDestinationRef.current ? { ...d, unread_messages_count: totalUnread, last_message_date: lastDate } : d
      ));
      return updated;
    });
  }, []);

  const tabItems = null; // removed unused memo

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
          {/* Mission Tabs / Mobile Dropdown - Hide on desktop to move to sidebar */}
          {isMobile && (
            <div className="px-3 border-bottom shadow-sm bg-white">
              <div className="py-2">
                <Select
                  value={activeDestination}
                  onChange={handleDestinationChange}
                  className="w-100"
                  size="middle"
                  dropdownStyle={{ zIndex: 10000 }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {pagination.currentPage < pagination.lastPage && (
                        <div 
                          className="text-center py-2 border-top cursor-pointer bg-light"
                          style={{ color: '#1890ff', fontSize: '12px', fontWeight: 500 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLoadMoreDestinations();
                          }}
                        >
                          {pagination.loadingMore ? <Spin size="small" /> : "Charger plus..."}
                        </div>
                      )}
                    </>
                  )}
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
            </div>
          )}

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
                  meetingId={meetings[0].id} 
                  meetingsData={meetings}
                  onMeetingsUpdate={handleMeetingsUpdate}
                  isOutlook={false}
                  userData={userData}
                  missionsData={isMobile ? null : filteredDestinations}
                  selectedMissionId={activeDestination}
                  onMissionSelect={handleDestinationChange}
                  onLoadMoreMissions={handleLoadMoreDestinations}
                  hasMoreMissions={pagination.currentPage < pagination.lastPage}
                  isLoadingMoreMissions={pagination.loadingMore}
                  onLoadMore={handleLoadMoreMeetings}
                  hasMore={meetingsPagination.currentPage < meetingsPagination.lastPage}
                  isLoadingMore={meetingsPagination.loadingMore}
                />
              ) : (
                <div className="h-100 d-flex justify-content-center align-items-center p-4">
                  <div className="w-100 h-100 d-flex flex-column">
                    {!isMobile && (
                       <DiscussionChat
                         meetingId={null}
                         meetingsData={[]}
                         missionsData={isMobile ? null : filteredDestinations}
                         selectedMissionId={activeDestination}
                         onMissionSelect={handleDestinationChange}
                         userData={userData}
                         onLoadMoreMissions={handleLoadMoreDestinations}
                         hasMoreMissions={pagination.currentPage < pagination.lastPage}
                         isLoadingMoreMissions={pagination.loadingMore}
                         onLoadMore={handleLoadMoreMeetings}
                         hasMore={meetingsPagination.currentPage < meetingsPagination.lastPage}
                         isLoadingMore={meetingsPagination.loadingMore}
                       />
                    )}
                    {isMobile && <Text type="secondary">Aucun message dans cette mission</Text>}
                  </div>
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
