import React, { Suspense, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useMeetings } from "../../../context/MeetingsContext";
import { useTabs } from "../../../context/TabContext";
import { useSteps } from "../../../context/Step";
import { Tabs, Badge, Space, Tooltip } from "antd";
import LazyComponent from "./ScheduledMeeting";
import CompletedMeetings from "./CompletedMeetings";

const MeetingSubTab = ({ fetchCounts, unreadCounts }) => {
  const [tab, setTab] = useState("active");
  const [isManualTab, setIsManualTab] = useState(false);
  const [viewMode, setViewMode] = useState("card"); // "card" | "list"
  const { searchTerm } = useOutletContext();
  const { t } = useTranslation("global");
  const { activeTab: mainActiveTab } = useTabs();
  const { resetHeaderTitle } = useHeaderTitle();
  const {
    updateSolutionSteps,
    setSolutionType,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionFeedback,
    setSolutionMessageManagement,
    setSolutionShareBy,
  } = useSteps();
  const {
    allMeetings,
    allClosedMeetings,
    activeMeetingCount,
    closedMeetingCount,
    setOffset,
    hasMore,
    setHasMore,
    setClosedOffset,
    closedHasMore,
    setClosedHasMore,
    getMeetings,
    getClosedMeetings,
    getUnreadMeetings,
    getUpcomingMeetings,
    getNoStatusMeetings,
    unreadMeetingCount,
    upcomingMeetingCount,
    noStatusMeetingCount,
    selectedFilter,
    selectedClosedFilter,
    setAllMeetings,
    setAllClosedMeetings,
  } = useMeetings();

  const [pageNo, setPageNo] = useState(1);
  const [closedPageNo, setClosedPageNo] = useState(1);

  const cleanType = mainActiveTab?.includes("-")
    ? mainActiveTab.split("-")[1]
    : null;

  // Consolidated effect for mission (mainActiveTab) and sub-tab changes
  useEffect(() => {
    if (!cleanType) return;

    // Logic to prevent redundant fetch during auto-tab switch
    const currentUnreadCount = unreadCounts?.[cleanType] || 0;
    if (!isManualTab && currentUnreadCount > 0 && tab !== "unread") {
      // Wait for the auto-tab effect to switch to "unread"
      return;
    }
    if (!isManualTab && currentUnreadCount === 0 && tab === "unread") {
      // Wait for the auto-tab effect to switch back to "active"
      return;
    }

    // Reset header title and steps state
    resetHeaderTitle();
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionMessageManagement(false);
    setSolutionFeedback(false);
    setSolutionShareBy(null);

    // Reset pagination and clear current list to show loader
    setPageNo(1);
    setClosedPageNo(1);
    setOffset(0);
    setClosedOffset(0);
    setHasMore(true);
    setClosedHasMore(true);
    setAllMeetings([]);
    setAllClosedMeetings([]);

    // Determine which tab is active and fetch data accordingly
    switch (tab) {
      case "unread":
        getUnreadMeetings(cleanType, 1);
        break;
      case "upcoming":
        getUpcomingMeetings(cleanType, 1);
        break;
      case "finished":
        getClosedMeetings(cleanType, 1);
        break;
      case "nostatus":
        getNoStatusMeetings(cleanType, 1);
        break;
      case "active":
      default:
        getMeetings(cleanType, 1);
        break;
    }
  }, [mainActiveTab, tab, cleanType]);

  // Handle mission change - reset manual flag
  useEffect(() => {
    setIsManualTab(false);
  }, [mainActiveTab]);

  // Handle default tab selection based on unread counts from prop
  useEffect(() => {
    const currentUnreadCount = unreadCounts?.[cleanType] || 0;
    if (!isManualTab) {
      if (currentUnreadCount > 0) {
        setTab("unread");
      } else {
        setTab("active");
      }
    }
  }, [cleanType, unreadCounts, isManualTab]);

  useEffect(() => {
    if (pageNo > 1 && cleanType && hasMore) {
      switch (tab) {
        case "unread": getUnreadMeetings(cleanType, pageNo); break;
        case "upcoming": getUpcomingMeetings(cleanType, pageNo); break;
        case "nostatus": getNoStatusMeetings(cleanType, pageNo); break;
        case "active": getMeetings(cleanType, pageNo); break;
        default: break;
      }
    }
  }, [pageNo, cleanType, tab]);

  useEffect(() => {
    if (closedPageNo > 1 && tab === "finished" && cleanType && closedHasMore) {
      getClosedMeetings(cleanType, closedPageNo);
    }
  }, [closedPageNo, cleanType, tab]);

  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [closedFilteredMeetings, setClosedFilteredMeetings] = useState([]);

  useEffect(() => {
    let filtered = [...allMeetings].filter((meeting) =>
      ["active", "in_progress", "to_finish", "todo", "no_status", "closed", "abort"].includes(meeting.status)
    );
    let closedFiltered = [...allClosedMeetings].filter((meeting) =>
      ["closed", "abort"].includes(meeting.status)
    );

    if (searchTerm) {
      filtered = filtered.filter((meeting) =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      closedFiltered = closedFiltered.filter((meeting) =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMeetings(filtered);
    setClosedFilteredMeetings(closedFiltered);
  }, [allMeetings, allClosedMeetings, searchTerm, selectedFilter, selectedClosedFilter]);

  const renderLabel = (label, count, isActive) => (
    <Space size={8}>
      <span className={`tab-text ${isActive ? 'active' : ''}`}>{label}</span>
      {count > 0 && (
        <Badge
          count={count}
          overflowCount={999}
          style={{
            backgroundColor: isActive ? '#3b82f6' : '#f1f5f9',
            color: isActive ? '#fff' : '#64748b',
            boxShadow: 'none',
            fontSize: '11px',
            fontWeight: '600'
          }}
        />
      )}
    </Space>
  );

  // ─── View Toggle (right side of tab bar) ───────────────────────────────────
  const ViewToggle = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px',
      background: '#f1f5f9',
      borderRadius: '10px',
      marginBottom: '2px',
    }}>
      <Tooltip title="Vue Carte">
        <button
          onClick={() => setViewMode("card")}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: 'none', borderRadius: '7px',
            cursor: 'pointer',
            background: viewMode === "card" ? '#fff' : 'transparent',
            boxShadow: viewMode === "card" ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill={viewMode === "card" ? "#3b82f6" : "#94a3b8"} />
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill={viewMode === "card" ? "#3b82f6" : "#94a3b8"} />
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill={viewMode === "card" ? "#3b82f6" : "#94a3b8"} />
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill={viewMode === "card" ? "#3b82f6" : "#94a3b8"} />
          </svg>
        </button>
      </Tooltip>
      <Tooltip title="Vue Liste">
        <button
          onClick={() => setViewMode("list")}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: 'none', borderRadius: '7px',
            cursor: 'pointer',
            background: viewMode === "list" ? '#fff' : 'transparent',
            boxShadow: viewMode === "list" ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill={viewMode === "list" ? "#3b82f6" : "#94a3b8"} />
            <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill={viewMode === "list" ? "#3b82f6" : "#94a3b8"} />
            <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill={viewMode === "list" ? "#3b82f6" : "#94a3b8"} />
          </svg>
        </button>
      </Tooltip>
    </div>
  );

  const items = [
    {
      key: "unread",
      label: renderLabel(t("meeting.unread") || "Unread", unreadCounts?.[cleanType] || 0, tab === "unread"),
      children: (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent
            allMeetings={filteredMeetings}
            activeTab={tab}
            activeMeetingCount={unreadMeetingCount}
            type={cleanType}
            pageNo={pageNo}
            setPageNo={setPageNo}
            fetchCounts={fetchCounts}
            viewMode={viewMode}
          />
        </Suspense>
      ),
    },
    {
      key: "upcoming",
      label: renderLabel(t("meeting.upcoming") || "Upcoming/late", 0, tab === "upcoming"),
      children: (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent
            allMeetings={filteredMeetings}
            activeTab={tab}
            activeMeetingCount={upcomingMeetingCount}
            type={cleanType}
            pageNo={pageNo}
            setPageNo={setPageNo}
            fetchCounts={fetchCounts}
            viewMode={viewMode}
          />
        </Suspense>
      ),
    },
    {
      key: "active",
      label: renderLabel(t("meeting.activeMeetingsTab"), 0, tab === "active"),
      children: (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent
            allMeetings={filteredMeetings}
            activeTab={tab}
            activeMeetingCount={activeMeetingCount}
            type={cleanType}
            pageNo={pageNo}
            setPageNo={setPageNo}
            fetchCounts={fetchCounts}
            viewMode={viewMode}
          />
        </Suspense>
      ),
    },
    {
      key: "finished",
      label: renderLabel(t("meeting.completedMeetingsTab"), 0, tab === "finished"),
      children: (
        <CompletedMeetings
          allClosedMeetings={closedFilteredMeetings}
          activeTab={tab}
          type={cleanType}
          pageNo={closedPageNo}
          setPageNo={setClosedPageNo}
          fetchCounts={fetchCounts}
          viewMode={viewMode}
        />
      ),
    },
    {
      key: "nostatus",
      label: renderLabel(t("meeting.noStatus") || "No Status", 0, tab === "nostatus"),
      children: (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent
            allMeetings={filteredMeetings}
            activeTab={tab}
            activeMeetingCount={noStatusMeetingCount}
            type={cleanType}
            pageNo={pageNo}
            setPageNo={setPageNo}
            fetchCounts={fetchCounts}
            viewMode={viewMode}
          />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="meeting-subtab-container shadow-sm border">
      <Tabs
        activeKey={tab}
        onChange={(key) => {
          setTab(key);
          setIsManualTab(true);
        }}
        items={items}
        className="custom-subtabs modern"
        tabBarExtraContent={{ right: <ViewToggle /> }}
      />
      <SubTabStyles />
    </div>
  );
};

const SubTabStyles = () => (
  <style>
    {`
      .meeting-subtab-container {
        background: #fff;
        border-radius: 16px;
        padding: 1rem;
        margin-top: 1rem;
        min-height: 400px;
      }
      .custom-subtabs.modern .ant-tabs-nav {
        margin-bottom: 2rem;
        padding: 0 0.5rem;
        border-bottom: 2px solid #f8fafc;
      }
      .custom-subtabs.modern .ant-tabs-nav::before {
        border-bottom: none;
      }
      .custom-subtabs.modern .ant-tabs-tab {
        padding: 12px 20px;
        margin: 0 4px 0 0;
        border-radius: 10px 10px 0 0;
        transition: all 0.2s ease;
      }
      .custom-subtabs.modern .ant-tabs-tab:hover {
        background: #f8fafc;
      }
      .custom-subtabs.modern .ant-tabs-tab-active {
        background: transparent;
      }
      .custom-subtabs.modern .tab-text {
        font-size: 1rem;
        font-weight: 500;
        color: #64748b;
      }
      .custom-subtabs.modern .tab-text.active {
        color: #3b82f6;
        font-weight: 700;
      }
      .custom-subtabs.modern .ant-tabs-ink-bar {
        height: 3px;
        background: #3b82f6;
        border-radius: 3px 3px 0 0;
      }

      @media (max-width: 575px) {
        .meeting-subtab-container {
           padding: 0.75rem;
           border-radius: 12px;
        }
        .custom-subtabs.modern .ant-tabs-tab {
          padding: 10px 12px;
          margin-right: 2px;
        }
        .custom-subtabs.modern .tab-text {
          font-size: 0.9rem;
        }
      }
    `}
  </style>
);

export default MeetingSubTab;