import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Spin,
  Avatar,
  Badge,
  Button,
  Select,
  Space,
  Typography,
  Layout,
  Tooltip,
  Card,
  Tag,
} from "antd";
import {
  FaChevronLeft,
  FaSyncAlt,
  FaTimes,
  FaClock,
  FaList,
  FaCompress,
  FaComments,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import moment from "moment";
import { API_BASE_URL } from "../../../Apicongfig";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

// Helper to format date
const formatSearchDate = (dateStr, t) => {
  if (!dateStr) return "";
  const date = moment(dateStr);
  const now = moment();
  if (date.isSame(now, "day")) return date.format("HH:mm");
  if (date.isSame(now.clone().subtract(1, "day"), "day")) {
    return t ? t("completedMeetings.filters.YESTERDAY", "Yesterday") : "Hier";
  }
  return date.format("DD/MM HH:mm");
};

// Search list item
const SearchItem = ({ item, isSelected, onClick, t }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        margin: "6px 10px",
        padding: "12px 14px",
        borderRadius: "10px",
        backgroundColor: isSelected ? "#f0f7ff" : "#fff",
        border: isSelected ? "1px solid #1890ff" : "1px solid #f0f0f0",
        boxShadow: isSelected
          ? "0 4px 12px rgba(24,144,255,0.1)"
          : "0 1px 4px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
        position: "relative",
        cursor: "pointer",
      }}
      className={isSelected ? "" : "search-list-item"}
    >
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: "3px",
            backgroundColor: "#1890ff",
            borderRadius: "0 4px 4px 0",
          }}
        />
      )}
      <div className="d-flex gap-3 align-items-start w-100 overflow-hidden">
        <Avatar
          size={34}
          icon={<FaSearch size={14} />}
          style={{
            backgroundColor: isSelected ? "#1890ff" : "#e6f7ff",
            color: isSelected ? "#fff" : "#1890ff",
            flexShrink: 0,
          }}
        />
        <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
          <div className="d-flex justify-content-between align-items-start gap-1 mb-1">
            <Text
              strong
              ellipsis
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: isSelected ? "#1890ff" : "#1a1a1a",
                flex: 1,
              }}
            >
              {item.question}
            </Text>
            <Text
              type="secondary"
              style={{ fontSize: "10px", whiteSpace: "nowrap", marginTop: 2 }}
            >
              {formatSearchDate(item.created_at, t)}
            </Text>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <Text
              type="secondary"
              ellipsis
              style={{ fontSize: "11px", flex: 1 }}
            >
              {item.country || (t ? t("searches.unknown", "Unknown") : "Inconnu")} {item.ip_address ? `(${item.ip_address})` : ""}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchesTab = ({ isActive }) => {
  const { t } = useTranslation("global");
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSearchHistory = useCallback(async (pageNum = 1, isSilent = false, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const resp = await axios.get(`${API_BASE_URL}/google-search-history?page=${pageNum}`);
      if (resp.data && resp.data.success) {
        const dataList = resp.data.data?.data || [];
        if (isLoadMore) {
          setSearches((prev) => [...prev, ...dataList]);
        } else {
          setSearches(dataList);
        }
        setCurrentPage(resp.data.data?.current_page || pageNum);
        setTotalItems(resp.data.data?.total || 0);
        setPageSize(resp.data.data?.per_page || 15);
        setHasMore((resp.data.data?.current_page || pageNum) < (resp.data.data?.last_page || 1));
        
        // Keep selected search updated if it was previously set
        if (selectedSearch) {
          const updated = dataList.find((s) => s.id === selectedSearch.id);
          if (updated) setSelectedSearch(updated);
        }
      }
    } catch (error) {
      console.error("Error fetching google search history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedSearch]);

  useEffect(() => {
    if (isActive) {
      fetchSearchHistory(1);
    }
  }, [isActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSearch]);

  const handleLoadMore = () => {
    if (hasMore && !loading && !loadingMore && !refreshing) {
      fetchSearchHistory(currentPage + 1, true, true);
    }
  };

  const handleSearchSelect = (item) => {
    setSelectedSearch(item);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedSearch(null);
  };

  if (!isActive) return null;

  if (loading && searches.length === 0) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center bg-white" style={{ minHeight: "300px" }}>
        <Spin size="large" tip={t("searches.loading", "Loading search history...")} />
      </div>
    );
  }

  // Conversational Render of the search results inside the chat content
  const renderConversationMessages = () => {
    if (!selectedSearch) return null;

    const userDateStr = selectedSearch.created_at
      ? moment(selectedSearch.created_at).format("DD/MM/YYYY HH:mm")
      : "";

    // Parse answers if they are JSON or already parsed array
    let answersArray = [];
    if (Array.isArray(selectedSearch.answer)) {
      answersArray = selectedSearch.answer;
    } else if (typeof selectedSearch.answer === "string") {
      try {
        answersArray = JSON.parse(selectedSearch.answer);
      } catch (e) {
        console.error("Failed to parse answers string:", e);
      }
    }

    return (
      <div className="d-flex flex-column gap-4 p-2 p-md-4">
        {/* User Question Message */}
        <div className="d-flex justify-content-start" style={{ width: "100%" }}>
          <div className="d-flex gap-3 align-items-start" style={{ maxWidth: "85%" }}>
            <Avatar size="default" style={{ backgroundColor: "#8c8c8c", flexShrink: 0 }}>
              U
            </Avatar>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <Text strong style={{ fontSize: "12px", color: "#262626" }}>
                  {t("searches.userLabel", "User")}
                </Text>
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  {userDateStr}
                </Text>
              </div>
              <div
                className="p-3 rounded-4 shadow-sm border bg-white"
                style={{
                  lineHeight: "1.5",
                  fontSize: "14px",
                  wordBreak: "break-word",
                  borderColor: "#e8e8e8",
                }}
              >
                <div className="fw-bold text-dark mb-2">{t("searches.question", "Question:")}</div>
                <div className="text-dark fs-5">{selectedSearch.question}</div>

                {/* Metadata details */}
                <div className="mt-3 pt-2 border-top text-muted" style={{ fontSize: "11px" }}>
                  <div className="d-flex flex-wrap gap-3">
                    {selectedSearch.ip_address && (
                      <span><strong>IP:</strong> {selectedSearch.ip_address}</span>
                    )}
                    {selectedSearch.country && (
                      <span><strong>{t("searches.unknown", "Country")}:</strong> {selectedSearch.country}</span>
                    )}
                    {selectedSearch.user_agent && (
                      <span className="w-100 mt-1"><strong>Client:</strong> {selectedSearch.user_agent}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bot Response Message */}
        <div className="d-flex justify-content-start" style={{ width: "100%" }}>
          <div className="d-flex gap-3 align-items-start" style={{ maxWidth: "90%", width: "100%" }}>
            <Avatar size="default" icon={<FaSearch size={14} />} style={{ backgroundColor: "#1890ff", color: "#fff", flexShrink: 0 }} />
            <div className="w-100">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Text strong style={{ fontSize: "12px", color: "#1890ff" }}>
                  {t("searches.assistantLabel", "Search Assistant")}
                </Text>
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  {userDateStr}
                </Text>
              </div>
              <div
                className="p-3 rounded-4 shadow-sm border w-100"
                style={{
                  lineHeight: "1.5",
                  fontSize: "14px",
                  backgroundColor: "#fcfcff",
                  borderColor: "#91d5ff",
                }}
              >
                <Text className="d-block mb-3 text-secondary">
                  {t("searches.resultsIntro", "Here are the relevant results found for this search:")}
                </Text>

                {/* Recommendations Cards */}
                <div className="d-flex flex-column gap-3">
                  {answersArray.length > 0 ? (
                    answersArray.map((ans, idx) => (
                      <Card
                        key={idx}
                        hoverable
                        size="small"
                        className="shadow-sm border-0 rounded-3"
                        style={{ background: "#ffffff", border: "1px solid #f0f0f0" }}
                        bodyStyle={{ padding: "16px" }}
                      >
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                          <div>
                            <Title level={5} className="m-0 text-primary d-flex align-items-center gap-2">
                              {ans.title}
                              {ans.gate_name && (
                                <Tag color="blue" className="text-uppercase" style={{ fontSize: "10px" }}>
                                  {ans.gate_name}
                                </Tag>
                              )}
                            </Title>
                            {ans.subtitle && (
                              <Text type="secondary" className="d-block mt-1" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                                {ans.subtitle}
                              </Text>
                            )}
                          </div>
                          {ans.website_link && (
                            <Button
                              type="link"
                              icon={<FaExternalLinkAlt size={12} />}
                              href={ans.website_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-0"
                            >
                              {t("searches.visitSite", "Visit site")}
                            </Button>
                          )}
                        </div>

                        {ans.hero_title && (
                          <div className="mt-3 p-2 bg-light rounded-3">
                            <Text strong className="d-block text-dark" style={{ fontSize: "13px" }}>
                              {ans.hero_title}
                            </Text>
                            {ans.hero_subtitle && (
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                {ans.hero_subtitle}
                              </Text>
                            )}
                          </div>
                        )}

                        {/* Benefits */}
                        {ans.hero_benefits && ans.hero_benefits.length > 0 && (
                          <div className="mt-3">
                            <Text strong style={{ fontSize: "12px" }}>{t("searches.advantages", "Benefits:")}</Text>
                            <div className="d-flex flex-column gap-1 mt-1">
                              {ans.hero_benefits.map((benefit, bIdx) => (
                                <div key={bIdx} className="d-flex align-items-start gap-2">
                                  <FaCheckCircle color="#52c41a" size={12} className="mt-1 flex-shrink-0" />
                                  <Text style={{ fontSize: "12px" }}>{benefit}</Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {ans.features && ans.features.length > 0 && (
                          <div className="mt-3">
                            <Text strong style={{ fontSize: "12px" }}>{t("searches.features", "Features:")}</Text>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {ans.features.map((feat, fIdx) => (
                                <Tag key={fIdx} color="default" className="rounded-pill">
                                  {feat}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className="text-center p-3 text-muted">
                      {t("searches.emptyList", "No searches found")}
                    </div>
                  )}
                </div>

                {/* Citation section */}
                {selectedSearch.citation && (
                  <div className="mt-3 pt-2 border-top d-flex align-items-center gap-2">
                    <FaInfoCircle color="#1890ff" />
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {t("searches.originalSource", "Original source:")}{" "}
                      <a href={selectedSearch.citation} target="_blank" rel="noopener noreferrer">
                        {selectedSearch.citation}
                      </a>
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  };

  // Full Screen Layout
  if (isFullScreen) {
    return (
      <Layout
        hasSider
        className="position-fixed top-0 start-0 w-100 h-100 bg-white"
        style={{ zIndex: 10000, overflow: "hidden", height: "100dvh", flexDirection: "row" }}
      >
        {/* Left: Searches List */}
        <div
          style={{
            width: isMobile ? "100%" : "320px",
            flex: isMobile ? "0 0 auto" : "0 0 320px",
            flexShrink: 0,
            display: isMobile && selectedSearch ? "none" : "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(to right, #fafafa, #fff)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: "#e6f7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaClock color="#1890ff" size={14} />
              </div>
              <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
                {t("searches.header", "RECHERCHES")}
              </Text>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge count={totalItems} showZero color="#1890ff" />
              <Button
                type="text"
                size="small"
                icon={<FaTimes size={12} />}
                onClick={handleCloseFullScreen}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
            {searches.map((item) => (
              <SearchItem
                key={item.id}
                item={item}
                isSelected={selectedSearch?.id === item.id}
                onClick={() => setSelectedSearch(item)}
                t={t}
              />
            ))}
          </div>
          {hasMore && (
            <div style={{ padding: "12px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
              {loadingMore ? (
                <Spin size="small" />
              ) : (
                <Button type="link" onClick={handleLoadMore}>
                  {t("searches.loadMore", "Charger plus")}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Center: Conversation */}
        <Content
          className={`d-flex flex-column h-100 overflow-hidden bg-white ${isMobile && !selectedSearch ? "d-none" : ""}`}
        >
          {/* Header */}
          <div
            style={{
              flexShrink: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              padding: isMobile ? "8px 12px" : "12px 16px",
              gap: 8,
              overflow: "hidden",
              borderBottom: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
              }}
            >
              {isMobile && selectedSearch && (
                <Button
                  type="text"
                  icon={<FaChevronLeft />}
                  style={{ flexShrink: 0 }}
                  onClick={handleCloseFullScreen}
                />
              )}
              <Avatar
                icon={<FaSearch size={14} />}
                size={isMobile ? 36 : 44}
                style={{
                  backgroundColor: "#1890ff",
                  color: "#fff",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              />
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <Title
                  level={5}
                  className="m-0"
                  ellipsis={{ tooltip: selectedSearch?.question || t("searches.tabTitle", "Searches") }}
                  style={{
                    marginBottom: 0,
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: 700,
                  }}
                >
                  {selectedSearch?.question || t("searches.tabTitle", "Searches")}
                </Title>
                <div className="d-flex align-items-center gap-2">
                  <Badge status="processing" />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedSearch?.country || "Session Active"}
                  </Text>
                </div>
              </div>
            </div>

            <Space style={{ flexShrink: 0 }}>
              <Tooltip title={t("searches.refresh", "Refresh")}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaSyncAlt size={13} className="text-muted" />}
                  onClick={() => fetchSearchHistory(currentPage, true)}
                  loading={refreshing}
                />
              </Tooltip>
              <Tooltip title={t("searches.close", "Close")}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaCompress size={13} className="text-muted" />}
                  onClick={handleCloseFullScreen}
                />
              </Tooltip>
            </Space>
          </div>

          {/* Conversation Area */}
          <div
            className="flex-grow-1"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              scrollBehavior: "smooth",
              backgroundColor: "#fafafa",
            }}
          >
            {renderConversationMessages()}
          </div>
        </Content>

        <style>{`
          .search-list-item:hover {
            background-color: #fafafa !important;
            border-color: #d9d9d9 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
          }
        `}</style>
      </Layout>
    );
  }

  // Default Split Layout
  return (
    <div
      className={`h-100 bg-white ${isMobile ? "d-flex flex-column" : "d-flex"}`}
      style={{ overflow: "hidden" }}
    >
      {/* List Sider */}
      {!isMobile ? (
        <div
          style={{
            width: "320px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            borderRight: "1px solid #f0f0f0",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(to right, #fafafa, #fff)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  backgroundColor: "#e6f7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaList color="#1890ff" size={14} />
              </div>
              <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
                {t("searches.header", "RECHERCHES")}
              </Text>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge count={totalItems} showZero color="#1890ff" />
              <Tooltip title={t("searches.refresh", "Refresh")}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<FaSyncAlt size={12} />}
                  onClick={() => fetchSearchHistory(currentPage, true)}
                  loading={refreshing}
                />
              </Tooltip>
            </div>
          </div>

          {/* List items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {searches.length === 0 ? (
              <div className="p-3 text-center text-muted">
                <FaSearch size={24} className="mb-2 opacity-25" />
                <Text type="secondary" className="d-block" style={{ fontSize: "12px" }}>
                  {t("searches.emptyList", "No searches found")}
                </Text>
              </div>
            ) : (
              searches.map((item) => (
                <SearchItem
                  key={item.id}
                  item={item}
                  isSelected={false}
                  onClick={() => handleSearchSelect(item)}
                  t={t}
                />
              ))
            )}
          </div>
          {hasMore && (
            <div style={{ padding: "12px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
              {loadingMore ? (
                <Spin size="small" />
              ) : (
                <Button type="link" onClick={handleLoadMore}>
                  {t("searches.loadMore", "Charger plus")}
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Mobile Header
        <div className="p-3 border-bottom bg-light bg-opacity-10">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Text strong type="secondary" style={{ fontSize: "11px" }}>
              {t("searches.header", "RECHERCHES")}
            </Text>
            <Button
              type="text"
              size="small"
              icon={<FaSyncAlt size={12} />}
              onClick={() => fetchSearchHistory(currentPage, true)}
              loading={refreshing}
            >
              {t("searches.refresh", "Refresh")}
            </Button>
          </div>
          <Select
            className="w-100"
            value=""
            placeholder={t("searches.selectPlaceholder", "Select a search...")}
            onChange={(val) => {
              const item = searches.find((s) => String(s.id) === String(val));
              if (item) handleSearchSelect(item);
            }}
            style={{ height: "44px" }}
            dropdownStyle={{ borderRadius: "8px" }}
          >
            {searches.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                <div className="d-flex align-items-center gap-2">
                  <Avatar size="small" icon={<FaSearch size={10} />} style={{ backgroundColor: "#1890ff", color: "#fff" }} />
                  <Text ellipsis style={{ flex: 1 }}>{item.question}</Text>
                </div>
              </Select.Option>
            ))}
          </Select>
          {hasMore && (
            <div style={{ padding: "8px 0 0 0", display: "flex", justifyContent: "center" }}>
              {loadingMore ? (
                <Spin size="small" />
              ) : (
                <Button type="link" onClick={handleLoadMore} size="small">
                  {t("searches.loadMore", "Charger plus")}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Panel empty view */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            padding: "16px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#52c41a",
              }}
            />
            <Text strong style={{ fontSize: "13px", color: "#262626", letterSpacing: "0.02em" }}>
              {t("searches.detailsHeader", "SEARCH DETAILS")}
            </Text>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50 p-5">
            <FaComments size={48} className="mb-3" />
            <Text>{t("searches.emptyDetails", "Select a search from the list to display conversation details")}</Text>
          </div>
        </div>
      </div>

      <style>{`
        .search-list-item:hover {
          background-color: #fafafa !important;
          border-color: #d9d9d9 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default SearchesTab;
