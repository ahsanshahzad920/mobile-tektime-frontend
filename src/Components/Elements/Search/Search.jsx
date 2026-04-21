import CookieService from '../../Utils/CookieService';
// Components/Elements/Search/Search.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaQuestionCircle, FaSpinner } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import "./Search.scss";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";

function Search({ onSearch }) {
  const { t } = useTranslation("global");
  const location = useLocation();
  const navigate = useNavigate();

  // const [searchTerm, setSearchTerm] = useState("");
  const {searchTerm,setSearchTerm} = useDraftMeetings()
  const [searchMode, setSearchMode] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // ← NEW: Track focus

  const searchContainerRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);
  const questionIconRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

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

  const userId = useMemo(() => {
    const id = CookieService.get("user_id");
    return id ? parseInt(id) : null;
  }, []); // Only on mount

  const fetchSuggestions = useCallback(
    async (term) => {
      console.log("FETCH CALLED FOR:", term);
      console.trace(); // This shows the full call stack

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
        setSuggestions(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  // Clear search when route changes
  useEffect(() => {
    setSearchTerm("");
    onSearch("");
    setSearchMode("filter");
    setSuggestions([]);
    setIsFocused(false);
  }, [location.pathname]);

  // Handle search term changes with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.trim() === "") {
      setSuggestions([]);
      setSearchMode(null);
      onSearch("");
      return;
    }

    if (isQuestion(searchTerm)) {
      setSearchMode("ai");
      setSuggestions([]);
      return;
    }

    setSearchMode("filter");
    onSearch(searchTerm);

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch]);

  // Add this ref
  const fetchSuggestionsRef = useRef(fetchSuggestions);
  useEffect(() => {
    fetchSuggestionsRef.current = fetchSuggestions;
  }, [fetchSuggestions]);

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
        return t("search.defaultPlaceholder");
      case "global":
        return t("search.defaultPlaceholder");
      case "filter":
        return t("search.defaultPlaceholder");
      default:
        return t("search.defaultPlaceholder");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === "") {
      setSearchMode(null);
      setSuggestions([]);
      onSearch("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && searchTerm) {
      if (searchMode === "ai") {
        navigate(`/question?question=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      }
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  // const handleSuggestionClick = (suggestion) => {
  //   navigate(suggestion.slug);
  //   setSearchTerm("");
  //   setSuggestions([]);
  //   setIsFocused(false);
  // };

const handleSuggestionClick = (suggestion) => (e) => {
  e.stopPropagation();

  // Close everything
  setSearchTerm("");
  setSuggestions([]);
  setIsFocused(false); // This now safely hides dropdown

  // Navigate AFTER state update
  setTimeout(() => {
    navigate(suggestion.slug);
  }, 50); // Small delay ensures DOM is updated
};

  const handleQuestionIconMouseEnter = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(true);
  };

  const handleQuestionIconMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 300);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(tooltipTimeoutRef.current);
      clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  // Show dropdown only when input is focused AND has results
  const showDropdown =
    isFocused &&
    searchMode === "filter" &&
    searchTerm.length > 0 &&
    (suggestions.length > 0 || isLoading);

  return (
    <div ref={searchContainerRef} className="search-component">
      {/* LOGO - Only Desktop */}
      <div className="search-logo-wrapper d-none d-md-flex">
        <img
          src="/Assets/landing/logo.png"
          alt="tektime-logo"
          className="search-logo img-fluid"
          style={{ width: "120px", height: "auto" }}
        />
      </div>

      {/* SEARCH INPUT */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <span className="search-icon-left">{getSearchIcon()}</span>

          <input
            type="search"
            className="search-input"
            placeholder={getPlaceholder()}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
          />

          <button
            ref={questionIconRef}
            className="search-question-icon"
            onMouseEnter={handleQuestionIconMouseEnter}
            onMouseLeave={handleQuestionIconMouseLeave}
            onClick={() => {
              if (searchMode === "ai") {
                navigate(
                  `/question?question=${encodeURIComponent(searchTerm)}`
                );
              } else if (searchMode === "filter") {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
              }
              setSearchTerm("");
            }}
          >
            <FaQuestionCircle />
          </button>
        </div>

        {/* TOOLTIP */}
        {showTooltip && (
          <div className="search-tooltip">
            <p className="tooltip-title">{t("searchTip.tooltip.title")}</p>
            <ul className="tooltip-options">
              {t("searchTip.tooltip.options", { returnObjects: true }).map(
                (option, index) => (
                  <li key={index}>{option}</li>
                )
              )}
            </ul>
            <p className="tooltip-footer">{t("searchTip.tooltip.footer")}</p>
          </div>
        )}

        {/* SUGGESTIONS DROPDOWN - ONLY SHOW WHEN FOCUSED */}
        {showDropdown && (
          <div className="search-dropdown" onClick={(e) => e.stopPropagation()}>
            {" "}
            {isLoading ? (
              <div className="loading-state">
                <FaSpinner className="spinner" />
                <span>Searching for results...</span>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            ) : (
              suggestions.map((item) => (
                <div
                  key={`${item.type}-${item.slug}`}
                  className="suggestion-item"
                  onClick={(e) => handleSuggestionClick(item)(e)}
                >
                  <div className="suggestion-icon">
                    {item.type === "moment" ? (
                      <img
                        src="/Assets/sidebar_meeting_active.svg"
                        alt="meeting"
                      />
                    ) : item.type === "mission" ? (
                      <img
                        src="/Assets/sidebar_active_destination.svg"
                        alt="mission"
                      />
                    ) : item.type === "team" ? (
                      <img src="/Assets/sidebar_team_active.svg" alt="team" />
                    ) : item.type === "step" ? (
                      <img
                        src="/Assets/sidebar-action-active.svg"
                        alt="action"
                      />
                    ) : item.type === "solution" ? (
                      <img
                        src="/Assets/Tek.png"
                        alt="solution"
                        style={{ width: "24px" }}
                      />
                    ) : (
                      "User"
                    )}
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-title">{item.title}</div>
                    {item.email && (
                      <div className="suggestion-subtitle">{item.email}</div>
                    )}
                  </div>
                  <div className="suggestion-type">
                    {t(`entities.${item.type}`)}
                  </div>
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
