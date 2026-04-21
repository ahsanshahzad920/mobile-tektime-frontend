import CookieService from '../../../Utils/CookieService';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaQuestionCircle, FaSpinner } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BASE_URL } from "../../../Apicongfig";

function Search({ onSearch, onIframeUrl }) {
  const { t } = useTranslation("global");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const searchContainerRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Track container width for responsive tweaks
  useEffect(() => {
    if (!searchContainerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setIsNarrow(entry.contentRect.width < 480);
    });
    ro.observe(searchContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Question detection patterns
  const questionPatterns = [
    /^(what|who|when|where|why|how|is|are|can|do|does|did|will|would|should|could)\s+/i,
    /^(tell me about|explain|show me|find me|search for|look up)\s+/i,
    /^(quel|quelle|quels|quelles|qui|quand|où|pourquoi|comment)\s+/i,
    /^(dis-moi|explique|montre|trouve|cherche)\s+/i,
  ];

  const isQuestion = (text) => {
    if (text.includes("?")) return true;
    if (text.length > 20 && text.split(" ").length > 4) return true;
    return questionPatterns.some((pattern) => pattern.test(text));
  };

  const userId = parseInt(CookieService.get("user_id"));

  const fetchSuggestions = useCallback(
    async (term) => {
      if (term.trim() === "") {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/search/${term}?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        const results = response.data?.data || [];
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log("Search term updated:", value);
    setSearchTerm(value);
  };

  // Handle search mode and suggestions
  useEffect(() => {
    console.log("useEffect triggered with searchTerm:", searchTerm);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.trim() === "") {
      console.log("Clearing suggestions due to empty search term");
      setSuggestions([]);
      setSearchMode(null);
      onSearch("");
      return;
    }

    if (isQuestion(searchTerm)) {
      console.log("Setting search mode to AI");
      setSearchMode("ai");
      setSuggestions([]);
      return;
    }

    console.log("Setting search mode to filter");
    setSearchMode("filter");
    onSearch(searchTerm);

    debounceTimeoutRef.current = setTimeout(() => {
      console.log("Fetching suggestions for:", searchTerm);
      fetchSuggestions(searchTerm);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions, onSearch]);

  const getSearchIcon = () => {
    switch (searchMode) {
      case "ai":
        return "💬";
      case "global":
        return "📁";
      case "filter":
        return "🔍";
      default:
        return <FaSearch />;
    }
  };

  const getPlaceholder = () => {
    switch (searchMode) {
      case "ai":
      case "global":
      case "filter":
      default:
        return t("search.defaultPlaceholder");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      console.log("Enter pressed, searchMode:", searchMode, "searchTerm:", searchTerm);
      let targetUrl = "";
      if (searchMode === "ai") {
        targetUrl = `/question?question=${encodeURIComponent(searchTerm)}`;
      } else if (searchMode === "filter") {
        targetUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
      }
      if (targetUrl) {
        onIframeUrl(targetUrl);
        setSearchTerm("");
        setSuggestions([]);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    console.log("Suggestion clicked:", suggestion);
    onIframeUrl(suggestion.slug);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleQuestionIconMouseEnter = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(true);
  };

  const handleQuestionIconMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(tooltipTimeoutRef.current);
      clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={searchContainerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        padding: "0 12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: isNarrow ? "14px" : "20px",
              fontSize: isNarrow ? "15px" : "18px",
              color: "#666",
              zIndex: 1,
            }}
          >
            {getSearchIcon()}
          </span>

          <input
            type="search"
            style={{
              width: "100%",
              padding: isNarrow ? "11px 48px 11px 44px" : "14px 48px 14px 50px",
              fontSize: isNarrow ? "13px" : "16px",
              border: "1px solid #ddd",
              borderRadius: "30px",
              outline: "none",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              backgroundColor: "#fff",
              boxSizing: "border-box",
            }}
            placeholder={getPlaceholder()}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />

          <button
            onMouseEnter={handleQuestionIconMouseEnter}
            onMouseLeave={handleQuestionIconMouseLeave}
            onClick={() => {
              console.log("Question icon clicked, searchMode:", searchMode);
              let targetUrl = "";
              if (searchMode === "ai") {
                targetUrl = `/question?question=${encodeURIComponent(searchTerm)}`;
              } else if (searchMode === "filter") {
                targetUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
              }
              if (targetUrl) {
                onIframeUrl(targetUrl);
                setSearchTerm("");
              }
            }}
            style={{
              position: "absolute",
              right: "20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#666",
              zIndex: 1,
            }}
          >
            <FaQuestionCircle />
          </button>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: "0",
              width: "min(300px, calc(100vw - 32px))",
              backgroundColor: "#333",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              marginTop: "10px",
              zIndex: 1001,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              boxSizing: "border-box",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>{t("searchTip.tooltip.title")}</p>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {t("searchTip.tooltip.options", { returnObjects: true }).map(
                (option, index) => (
                  <li key={index} style={{ marginBottom: "4px" }}>
                    {option}
                  </li>
                )
              )}
            </ul>
            <p style={{ margin: "8px 0 0 0", fontStyle: "italic" }}>
              {t("searchTip.tooltip.footer")}
            </p>
          </div>
        )}

        {/* Dropdown for suggestions (retained for filter mode) */}
        {searchMode === "filter" && searchTerm.length > 0 && (suggestions.length > 0 || isLoading) && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              border: "1px solid #eee",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              marginTop: "10px",
              maxHeight: "min(400px, 60vh)",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {isLoading ? (
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    animation: "spin 1s linear infinite",
                    fontSize: "24px",
                    color: "#4285f4",
                  }}
                >
                  <FaSpinner />
                </div>
                <div
                  style={{
                    color: "#555",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Searching for results...
                </div>
              </div>
            ) : (
              suggestions.map((item) => (
                <div
                  key={`${item.type}-${item.slug}`}
                  style={{
                    padding: "12px 15px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    transition: "background-color 0.2s",
                  }}
                  onClick={() => handleSuggestionClick(item)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fff")
                  }
                >
                  <span
                    style={{
                      marginRight: "12px",
                      fontSize: "20px",
                      color: item.type === "moment" ? "#4CAF50" : "#2196F3",
                      flexShrink: 0,
                    }}
                  >
                    {item.type === "moment" ? (
                      <img src="/Assets/sidebar_meeting_active.svg" alt="meeting" />
                    ) : item.type === "mission" ? (
                      <img src="/Assets/sidebar_active_destination.svg" alt="mission" />
                    ) : item.type === "team" ? (
                      <img src="/Assets/sidebar_team_active.svg" alt="team" />
                    ) : item.type === "step" ? (
                      <img src="/Assets/sidebar-action-active.svg" alt="action" />
                    ) : item.type === "solution" ? (
                      <img src="/Assets/Tek.png" alt="solution" width="32px" />
                    ) : (
                      "👤"
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "500", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  </div>
                  {!isNarrow && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item?.email}</div>
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      textTransform: "capitalize",
                      flexShrink: 0,
                    }}
                  >
                    {t(`entities.${item.type}`)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;