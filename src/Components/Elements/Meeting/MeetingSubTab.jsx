import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useMeetings } from "../../../context/MeetingsContext";
import { useTabs } from "../../../context/TabContext";
import { useSteps } from "../../../context/Step";
import { Tabs, Badge, Space, Tooltip } from "antd";
import LazyComponent from "./ScheduledMeeting";
import CompletedMeetings from "./CompletedMeetings";

const MeetingSubTab = ({ fetchCounts,unreadCounts }) => {
  // ── Separate tab state per view mode ──────────────────────────────────────
  const [cardTab, setCardTab] = useState("active"); // 5-tab card view
  const [listTab, setListTab] = useState("unread"); // 2-tab list view
  const [viewMode, setViewMode] = useState("list"); // "list" | "card"
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    getAllMeetingsByType,
    unreadMeetingCount,
    upcomingMeetingCount,
    noStatusMeetingCount,
    selectedFilter,
    selectedClosedFilter,
    setAllMeetings,
    setAllClosedMeetings,
    loading,
    tabsVisibility,
  } = useMeetings();

  // ── Refs: track if auto default-tab selection is still pending ─────────────
  const listTabAutoRef = useRef(false);
  const cardTabAutoRef = useRef(false);

  const [pageNo, setPageNo] = useState(1);
  const [closedPageNo, setClosedPageNo] = useState(1);

  // ── Moments state (list view – paginated infinite scroll) ───────────────
  const [allMoments, setAllMoments] = useState([]);
  const [momentsLoading, setMomentsLoading] = useState(false);
  const [momentsTotal, setMomentsTotal] = useState(0);
  const [momentsPage, setMomentsPage] = useState(1);
  const [momentsHasMore, setMomentsHasMore] = useState(false);
  const [momentsLoadingMore, setMomentsLoadingMore] = useState(false);
  const momentsObserver = useRef();

  const cleanType = mainActiveTab?.includes("-")
    ? mainActiveTab.split("-")[1]
    : null;

  // ── Real moments API (get-all-meetings-by-type) – page-aware ────────────
  const fetchAllMoments = useCallback(async (type, page = 1, append = false) => {
    if (page === 1) setMomentsLoading(true);
    else setMomentsLoadingMore(true);
    try {
      const result = await getAllMeetingsByType(type, page);
      if (result?.data) {
        // Support both paginated ({ data: [...], current_page, last_page }) and flat array
        const isPaginated = result.data && !Array.isArray(result.data) && result.data.data;
        const rows = isPaginated ? (result.data.data || []) : (Array.isArray(result.data) ? result.data : []);
        const currentPage = isPaginated ? (result.data.current_page || 1) : 1;
        const lastPage = isPaginated ? (result.data.last_page || 1) : 1;

        setAllMoments((prev) => {
          const combined = append ? [...prev, ...rows] : rows;
          return [...new Map(combined.map((m) => [m.id, m])).values()];
        });
        setMomentsTotal(result.count ?? (isPaginated ? (result.data.total ?? rows.length) : rows.length));
        setMomentsPage(currentPage);
        setMomentsHasMore(currentPage < lastPage);
      } else {
        if (!append) { setAllMoments([]); setMomentsTotal(0); }
        setMomentsHasMore(false);
      }
    } catch (err) {
      console.error("fetchAllMoments error:", err);
      if (!append) { setAllMoments([]); setMomentsTotal(0); }
      setMomentsHasMore(false);
    } finally {
      setMomentsLoading(false);
      setMomentsLoadingMore(false);
    }
  }, [getAllMeetingsByType]);

  // ── IntersectionObserver sentinel for moments infinite scroll ─────────────
  const lastMomentRef = useCallback(
    (node) => {
      if (momentsLoadingMore) return;
      if (momentsObserver.current) momentsObserver.current.disconnect();
      momentsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && momentsHasMore) {
          fetchAllMoments(cleanType, momentsPage + 1, true);
        }
      });
      if (node) momentsObserver.current.observe(node);
    },
    [momentsLoadingMore, momentsHasMore, momentsPage, cleanType, fetchAllMoments]
  );

  // ── Data fetching for CARD VIEW (original 5-tab logic) ───────────────────
  useEffect(() => {
    if (!cleanType || viewMode !== "card") return;

    resetHeaderTitle();
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionMessageManagement(false);
    setSolutionFeedback(false);
    setSolutionShareBy(null);

    setPageNo(1);
    setClosedPageNo(1);
    setOffset(0);
    setClosedOffset(0);
    setHasMore(true);
    setClosedHasMore(true);
    setAllMeetings([]);
    setAllClosedMeetings([]);

    switch (cardTab) {
      case "unread":   getUnreadMeetings(cleanType, 1);   break;
      case "upcoming": getUpcomingMeetings(cleanType, 1); break;
      case "finished": getClosedMeetings(cleanType, 1);   break;
      case "nostatus": getNoStatusMeetings(cleanType, 1); break;
      case "active":
      default:         getMeetings(cleanType, 1);          break;
    }
  }, [mainActiveTab, cardTab, cleanType, viewMode]);

  // ── Data fetching for LIST VIEW (unread or moments) ──────────────────────
  useEffect(() => {
    if (!cleanType || viewMode !== "list") return;

    resetHeaderTitle();
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionMessageManagement(false);
    setSolutionFeedback(false);
    setSolutionShareBy(null);

    if (listTab === "moments") {
      // Reset & fetch page 1 fresh
      setAllMoments([]);
      setMomentsTotal(0);
      setMomentsPage(1);
      setMomentsHasMore(false);
      fetchAllMoments(cleanType, 1, false);
      // Also silently fetch unread so the badge count is always visible
      getUnreadMeetings(cleanType, 1);
      return;
    }

    // listTab === "unread"
    setPageNo(1);
    setOffset(0);
    setClosedOffset(0);
    setHasMore(true);
    setClosedHasMore(true);
    setAllMeetings([]);
    setAllClosedMeetings([]);
    getUnreadMeetings(cleanType, 1);
  }, [mainActiveTab, listTab, cleanType, viewMode]);

  // ── When entering fresh – always start on "unread" to fetch tabsVisibility ─
  useEffect(() => {
    listTabAutoRef.current = true;
    cardTabAutoRef.current = true;
    setListTab("unread");
    setCardTab("unread");
  }, [viewMode, mainActiveTab]);

  // ── After unread/tabsVisibility loads, pick the right default tab ──────────
  useEffect(() => {
    if (!listTabAutoRef.current && !cardTabAutoRef.current) return;
    if (loading) return;

    // List View Auto-nav (original logic: if unread empty, show moments)
    if (viewMode === "list" && listTabAutoRef.current && listTab === "unread") {
      listTabAutoRef.current = false;
      const count = unreadCounts?.[cleanType] ?? unreadMeetingCount;
      if (count === 0) {
        setListTab("moments");
      }
    }

    // Card View Auto-nav (dynamic based on tabsVisibility)
    if (viewMode === "card" && cardTabAutoRef.current && cardTab === "unread" && tabsVisibility) {
      cardTabAutoRef.current = false;
      if (!tabsVisibility.unread) {
        const priority = ["upcoming_late", "in_progress", "no_status", "completed"];
        const firstTrue = priority.find((k) => tabsVisibility[k] === true);
        if (firstTrue) {
          const map = {
            upcoming_late: "upcoming",
            in_progress: "active",
            no_status: "nostatus",
            completed: "finished"
          };
          setCardTab(map[firstTrue] || "active");
        }
      }
    }
  }, [loading, viewMode, listTab, cardTab, unreadMeetingCount, tabsVisibility]);

  // ── Load-more ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (pageNo > 1 && cleanType && hasMore && viewMode === "card") {
      switch (cardTab) {
        case "unread":   getUnreadMeetings(cleanType, pageNo);   break;
        case "upcoming": getUpcomingMeetings(cleanType, pageNo); break;
        case "nostatus": getNoStatusMeetings(cleanType, pageNo); break;
        case "active":   getMeetings(cleanType, pageNo);          break;
        default: break;
      }
    }
    if (pageNo > 1 && cleanType && hasMore && viewMode === "list" && listTab === "unread") {
      getUnreadMeetings(cleanType, pageNo);
    }
  }, [pageNo, cleanType, cardTab, listTab, viewMode]);

  useEffect(() => {
    if (closedPageNo > 1 && cardTab === "finished" && cleanType && closedHasMore && viewMode === "card") {
      getClosedMeetings(cleanType, closedPageNo);
    }
  }, [closedPageNo, cleanType, cardTab, viewMode]);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [closedFilteredMeetings, setClosedFilteredMeetings] = useState([]);
  const [filteredMoments, setFilteredMoments] = useState([]);

  useEffect(() => {
    let filtered = [...allMeetings].filter((m) =>
      ["active", "in_progress", "to_finish", "todo", "no_status", "closed", "abort"].includes(m.status)
    );
    let closedFiltered = [...allClosedMeetings].filter((m) =>
      ["closed", "abort"].includes(m.status)
    );
    if (searchTerm) {
      filtered = filtered.filter((m) => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));
      closedFiltered = closedFiltered.filter((m) => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredMeetings(filtered);
    setClosedFilteredMeetings(closedFiltered);
  }, [allMeetings, allClosedMeetings, searchTerm, selectedFilter, selectedClosedFilter]);

  useEffect(() => {
    let moments = [...allMoments];
    if (searchTerm) {
      moments = moments.filter((m) => m.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredMoments(moments);
  }, [allMoments, searchTerm]);

  // ── Label renderer ────────────────────────────────────────────────────────
  const renderLabel = (label, count, isActive) => (
    <Space size={8}>
      <span className={`tab-text ${isActive ? "active" : ""}`}>{label}</span>
      {count > 0 && (
        <Badge
          count={count}
          overflowCount={999}
          style={{
            backgroundColor: isActive ? "#3b82f6" : "#f1f5f9",
            color: isActive ? "#fff" : "#64748b",
            boxShadow: "none",
            fontSize: "11px",
            fontWeight: "600",
          }}
        />
      )}
    </Space>
  );

  // ── View Toggle ───────────────────────────────────────────────────────────
  const ViewToggle = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px",
        background: "#f1f5f9",
        borderRadius: "10px",
        marginBottom: "2px",
      }}
    >
      <Tooltip title="Vue Carte">
        <button
          onClick={() => setViewMode("card")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", border: "none", borderRadius: "7px",
            cursor: "pointer",
            background: viewMode === "card" ? "#fff" : "transparent",
            boxShadow: viewMode === "card" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            transition: "all 0.2s ease",
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
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", border: "none", borderRadius: "7px",
            cursor: "pointer",
            background: viewMode === "list" ? "#fff" : "transparent",
            boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            transition: "all 0.2s ease",
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

  // ── CARD VIEW tabs: dynamic based on tabsVisibility ───────────────────────
  const cardTabDefs = [
    { key: "unread",   apiKey: "unread",        label: t("meeting.unread") || "Non lus",             count: unreadCounts?.[cleanType] ?? unreadMeetingCount,   isCompleted: false },
    { key: "upcoming", apiKey: "upcoming_late", label: t("meeting.upcoming") || "À venir/En retard", count: upcomingMeetingCount, isCompleted: false },
    { key: "active",   apiKey: "in_progress",   label: t("meeting.activeMeetingsTab"),               count: activeMeetingCount,   isCompleted: false },
    { key: "nostatus", apiKey: "no_status",     label: t("meeting.noStatus") || "Sans statut",        count: noStatusMeetingCount, isCompleted: false },
    { key: "finished", apiKey: "completed",     label: t("meeting.completedMeetingsTab"),            count: 0,                    isCompleted: true  },
  ];

  // Show only tabs where tabsVisibility[apiKey] === true; show all if loading
  const visibleCardDefs = tabsVisibility
    ? cardTabDefs.filter((d) => tabsVisibility[d.apiKey] === true)
    : cardTabDefs;

  const cardItems = visibleCardDefs.map((def) => ({
    key: def.key,
    label: renderLabel(def.label, def.count, cardTab === def.key),
    children: def.isCompleted ? (
      <CompletedMeetings
        allClosedMeetings={closedFilteredMeetings}
        activeTab={cardTab}
        type={cleanType}
        pageNo={closedPageNo}
        setPageNo={setClosedPageNo}
        fetchCounts={fetchCounts}
        viewMode="card"
      />
    ) : (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent
          allMeetings={filteredMeetings}
          activeTab={cardTab}
          activeMeetingCount={def.count}
          type={cleanType}
          pageNo={pageNo}
          setPageNo={setPageNo}
          fetchCounts={fetchCounts}
          viewMode="card"
        />
      </Suspense>
    ),
  }));

  // ── LIST VIEW tabs: 2 original tabs ──────────────────────────────────────
  const listItems = [
    {
      key: "unread",
      label: renderLabel(t("meeting.unread") || "Non lus", unreadCounts?.[cleanType] ?? unreadMeetingCount, listTab === "unread"),
      children: (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent
            allMeetings={filteredMeetings}
            activeTab={listTab}
            activeMeetingCount={unreadMeetingCount}
            type={cleanType}
            pageNo={pageNo}
            setPageNo={setPageNo}
            fetchCounts={fetchCounts}
            viewMode="list"
          />
        </Suspense>
      ),
    },
    {
      key: "moments",
      label: renderLabel(t("meeting.moments") || "Moments", momentsTotal, listTab === "moments"),
      children: momentsLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>Chargement des moments…</div>
        </div>
      ) : (
        <>
          <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent
              allMeetings={filteredMoments}
              activeTab="moments"
              activeMeetingCount={momentsTotal}
              type={cleanType}
              pageNo={momentsPage}
              setPageNo={() => {}}
              fetchCounts={fetchCounts}
              viewMode="list"
            />
          </Suspense>

          {/* ── Infinite-scroll sentinel ── */}
          <div ref={lastMomentRef} style={{ height: "1px" }} />

          {momentsLoadingMore && (
            <div style={{ textAlign: "center", padding: "1rem 0", color: "#94a3b8" }}>
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>Chargement…</span>
            </div>
          )}

          {!momentsHasMore && filteredMoments.length > 0 && (
            <div style={{ textAlign: "center", padding: "0.75rem 0 0.25rem", color: "#cbd5e1", fontSize: "0.8rem" }}>
              — Tous les moments chargés —
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="meeting-subtab-container shadow-sm border">
      {/* Mobile-only Tab Dropdown */}
      <div className="mobile-only-tab-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }} className="d-none">
              {t("header.meeting")}
            </div>
            <div className="custom-mobile-dropdown" ref={dropdownRef}>
              <button 
                className="custom-dropdown-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="d-flex align-items-center gap-2">
                  <span className="dropdown-label-text">
                    {(() => {
                      const currentKey = viewMode === "card" ? cardTab : listTab;
                      const item = (viewMode === "card" ? cardItems : listItems).find(i => i.key === currentKey);
                      return item?.key === 'unread' ? `${t("meeting.unread")} (${unreadCounts?.[cleanType] ?? unreadMeetingCount})` : 
                             item?.key === 'moments' ? `${t("meeting.moments")} (${momentsTotal})` : 
                             item?.key === 'upcoming' ? t("meeting.upcoming") :
                             item?.key === 'active' ? t("meeting.activeMeetingsTab") :
                             item?.key === 'finished' ? t("meeting.completedMeetingsTab") :
                             item?.key === 'nostatus' ? t("meeting.noStatus") : item?.key;
                    })()}
                  </span>
                </div>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showDropdown && (
                <div className="custom-dropdown-menu shadow-lg">
                  {(viewMode === "card" ? cardItems : listItems).map(item => (
                    <div 
                      key={item.key} 
                      className={`custom-dropdown-item ${((viewMode === "card" ? cardTab : listTab) === item.key) ? 'active' : ''}`}
                      onClick={() => {
                        if (viewMode === "card") setCardTab(item.key);
                        else setListTab(item.key);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <span>
                          {item.key === 'unread' ? t("meeting.unread") : 
                           item.key === 'moments' ? t("meeting.moments") : 
                           item.key === 'upcoming' ? t("meeting.upcoming") :
                           item.key === 'active' ? t("meeting.activeMeetingsTab") :
                           item.key === 'finished' ? t("meeting.completedMeetingsTab") :
                           item.key === 'nostatus' ? t("meeting.noStatus") : item.key}
                        </span>
                        {((item.key === 'unread' && (unreadCounts?.[cleanType] ?? unreadMeetingCount) > 0) || (item.key === 'moments' && momentsTotal > 0)) && (
                          <span className="dropdown-badge">
                            {item.key === 'unread' ? (unreadCounts?.[cleanType] ?? unreadMeetingCount) : momentsTotal}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '18px' }}>
            <ViewToggle />
          </div>
        </div>
        
        {/* Render active content for mobile */}
        {((viewMode === "card" && cardItems.length > 0) || viewMode === "list") && (
          <div className="mobile-only-tab-container">
            <div className="mobile-tab-content">
              {(viewMode === "card" ? cardItems : listItems).find(item => item.key === (viewMode === "card" ? cardTab : listTab))?.children}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Tabs */}
      {((viewMode === "card" && cardItems.length > 0) || viewMode === "list") && (
        <div className="desktop-tabs-container">
          <Tabs
            activeKey={viewMode === "card" ? cardTab : listTab}
            onChange={viewMode === "card" ? setCardTab : setListTab}
            items={viewMode === "card" ? cardItems : listItems}
            className="custom-subtabs modern"
            tabBarExtraContent={{ right: <ViewToggle /> }}
          />
        </div>
      )}
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

      .mobile-only-tab-container {
        display: none;
      }
      .mobile-tab-content {
        padding: 0 12px 20px;
      }
      .desktop-tabs-container {
        display: block;
      }

      @media (max-width: 768px) {
        .mobile-only-tab-container {
          display: block;
          padding: 4px;
        }
        .desktop-tabs-container {
          display: none;
        }
        .meeting-subtab-container {
           padding: 0rem;
           border-radius: 16px;
           margin-top: 0.5rem;
        }
        .custom-subtabs.modern .ant-tabs-nav {
          margin-bottom: 1rem;
        }
        .custom-subtabs.modern .ant-tabs-tab {
          padding: 8px 10px;
          margin-right: 2px;
        }
        .custom-subtabs.modern .tab-text {
          font-size: 0.85rem;
        }
        .custom-subtabs.modern .ant-tabs-tab-btn .ant-space {
          gap: 4px !important;
        }
      }

      /* Premium Mobile Dropdown Styles */
      .custom-mobile-dropdown {
        position: relative;
        width: 100%;
      }
      .custom-dropdown-toggle {
        width: 100%;
        padding: 10px 16px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .custom-dropdown-toggle:active {
        background: #f8fafc;
        transform: scale(0.99);
      }
      .dropdown-label-text {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }
      .dropdown-arrow {
        transition: transform 0.2s ease;
      }
      .dropdown-arrow.open {
        transform: rotate(180deg);
      }
      .custom-dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: #fff;
        border-radius: 14px;
        padding: 6px;
        z-index: 1000;
        border: 1px solid #f1f5f9;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        max-height: 300px;
        overflow-y: auto;
      }
      .custom-dropdown-item {
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #475569;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .custom-dropdown-item:active {
        background: #f1f5f9;
      }
      .custom-dropdown-item.active {
        background: #eff6ff;
        color: #2563eb;
        font-weight: 700;
      }
      .dropdown-badge {
        background: #3b82f6;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
      }
      .custom-dropdown-item.active .dropdown-badge {
        background: #2563eb;
      }
    `}
  </style>
);

export default MeetingSubTab;