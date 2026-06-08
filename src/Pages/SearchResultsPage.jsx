import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Input, Button, Spin } from "antd";
import { SearchOutlined, BulbOutlined, LoadingOutlined, ExclamationCircleOutlined, ReloadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../Components/Apicongfig";
import CookieService from "../Components/Utils/CookieService";
import SearchResultCard from "../Components/Elements/Search/SearchResultCard";

const SearchResultsPage = () => {
  const { t } = useTranslation("global");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";
  const initialLat = queryParams.get("lat") || CookieService.get("user_latitude") || localStorage.getItem("user_latitude") || null;
  const initialLon = queryParams.get("lon") || CookieService.get("user_longitude") || localStorage.getItem("user_longitude") || null;

  const [query, setQuery] = useState(initialQuery);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLon);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const containerRef = useRef(null);

  const userId = CookieService.get("user_id");

  const performSearch = async (searchTerm, latVal, lonVal) => {
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    setResults([]);

    const activeLat = latVal !== undefined ? latVal : latitude;
    const activeLon = lonVal !== undefined ? lonVal : longitude;

    const isValidCoordinate = (val) => {
      if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") {
        return false;
      }
      const num = Number(val);
      return !isNaN(num);
    };

    const finalLat = isValidCoordinate(activeLat) ? Number(activeLat) : null;
    const finalLon = isValidCoordinate(activeLon) ? Number(activeLon) : null;

    try {
      const response = await axios.post(`${API_BASE_URL}/google-search`, {
        question: searchTerm.trim(),
        latitude: finalLat,
        longitude: finalLon,
      });

      let resultsArray = [];
      if (response.data && response.data.success) {
        const data = response.data.data;
        if (data) {
          if (Array.isArray(data.answer)) {
            resultsArray = data.answer;
          } else if (Array.isArray(data.data)) {
            resultsArray = data.data;
          } else if (Array.isArray(data)) {
            resultsArray = data;
          }
        }
      }
      setResults(resultsArray);
    } catch (err) {
      console.error("Search error:", err);
      setError(t("searchResults.error") || "Une erreur est survenue lors de la recherche.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, initialLat, initialLon);
    }
  }, [initialQuery, initialLat, initialLon]);

  const handleSearch = (term, latVal, lonVal) => {
    const finalTerm = term || query;
    const finalLat = latVal !== undefined ? latVal : latitude;
    const finalLon = lonVal !== undefined ? lonVal : longitude;

    const isValidCoordinate = (val) => {
      if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") {
        return false;
      }
      const num = Number(val);
      return !isNaN(num);
    };

    if (finalTerm.trim()) {
      let url = `/search-results?q=${encodeURIComponent(finalTerm.trim())}`;
      if (isValidCoordinate(finalLat)) {
        url += `&lat=${finalLat}`;
      }
      if (isValidCoordinate(finalLon)) {
        url += `&lon=${finalLon}`;
      }
      navigate(url);
    }
  };

  const onSuggestionClick = (suggestion) => {
    if (!suggestion) return;

    // If it's a suggestion object
    if (typeof suggestion === "object") {
      const link = suggestion.website_link;
      if (link) {
        if (link.startsWith("http://") || link.startsWith("https://")) {
          window.location.href = link;
        } else {
          navigate(link);
        }
        return;
      }
      suggestion = suggestion.title;
    }

    // Check if it's a URL string
    const isUrl = typeof suggestion === "string" && (
      suggestion.startsWith("http://") || 
      suggestion.startsWith("https://") || 
      suggestion.startsWith("/")
    );

    if (isUrl) {
      if (suggestion.startsWith("http://") || suggestion.startsWith("https://")) {
        window.location.href = suggestion;
      } else {
        navigate(suggestion);
      }
    } else {
      setQuery(suggestion);
      handleSearch(suggestion, latitude, longitude);
    }
  };



  return (
    <div className="search-results-page bg-white min-vh-100 pb-5">
      {/* Header Search Bar */}
      <div className="bg-white border-bottom py-3 sticky-top shadow-sm search-results-header" style={{ zIndex: 999 }}>
        <Container fluid>
          <Row>
            <Col xs={12} lg={8} className="mx-auto px-lg-4">
              <div ref={containerRef} className="d-flex gap-2 position-relative">
                <div className="position-relative flex-grow-1">
                  <Input
                    size="large"
                    placeholder={t("searchEngine.placeholder")}
                    value={query}
                    allowClear
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={() => handleSearch()}
                    className="rounded-pill shadow-sm"
                    prefix={<SearchOutlined className="text-muted" />}
                    style={{ height: "46px" }}
                  />
                </div>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => handleSearch()}
                  className="rounded-pill px-3 px-sm-4 shadow-sm d-flex align-items-center justify-content-center"
                  style={{ height: "46px", background: "#1a0dab", borderColor: "#1a0dab" }}
                >
                  <span className="d-none d-sm-inline">{t("searchEngine.button")}</span>
                  <SearchOutlined className="d-inline d-sm-none" style={{ fontSize: '1.1rem' }} />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Results Content */}
      <Container fluid className="search-results-content">
        <Row>
          <Col xs={12} lg={8} className="mx-auto px-lg-4">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "350px", width: "100%" }}>
                <div className="loader-ripple mb-4">
                  <div></div>
                  <div></div>
                </div>
                <p className="text-muted fw-normal" style={{ fontSize: "1.05rem", animation: "pulse 2s infinite" }}>
                  {t("searchResults.loading") || "TekTime recherche votre solution..."}
                </p>
              </div>
            ) : error ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 px-3 text-center" style={{ minHeight: "350px", width: "100%" }}>
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm"
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#fef2f2",
                    color: "#ef4444",
                    border: "1px solid #fee2e2"
                  }}
                >
                  <ExclamationCircleOutlined style={{ fontSize: "2rem" }} />
                </div>
                <h3 className="text-dark mb-2" style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  {t("searchResults.errorTitle") || "Oups ! Quelque chose s'est mal passé"}
                </h3>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px", fontSize: "0.95rem", lineHeight: "1.5" }}>
                  {error}
                </p>
                <Button 
                  type="primary"
                  onClick={() => performSearch(query)}
                  className="rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
                  style={{ 
                    height: "44px", 
                    background: "#1a0dab", 
                    borderColor: "#1a0dab",
                    fontWeight: "500",
                    fontSize: "0.95rem"
                  }}
                >
                  <ReloadOutlined />
                  {t("buttons.retry") || "Réessayer"}
                </Button>
              </div>
            ) : results.length > 0 ? (
              <div className="results-list">
                <div className="text-muted text-center mb-5" style={{ fontSize: "14px", letterSpacing: "0.02em" }}>
                  {t("searchResults.found", { count: results.length }) || `Environ ${results.length} résultats`}
                </div>
                {results.map((res, index) => (
                  <SearchResultCard key={index} result={res} />
                ))}
              </div>
            ) : (
              initialQuery && (
                <div className="py-5" style={{ paddingLeft: "8px" }}>
                  <p className="text-muted">{t("searchResults.noResults")}</p>
                </div>
              )
            )}
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes ripple {
          0% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 0;
          }
          4.9% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 0;
          }
          5% {
            top: 36px;
            left: 36px;
            width: 8px;
            height: 8px;
            opacity: 1;
          }
          100% {
            top: 0;
            left: 0;
            width: 80px;
            height: 80px;
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .loader-ripple {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .loader-ripple div {
          position: absolute;
          border: 4px solid #1a0dab;
          opacity: 1;
          border-radius: 50%;
          animation: ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .loader-ripple div:nth-child(2) {
          animation-delay: -0.5s;
        }
        .search-results-header {
          top: 96px;
        }
        .search-results-content {
          margin-top: 110px;
        }
        @media (max-width: 768px) {
          .search-results-header {
            top: 60px !important;
          }
          .search-results-content {
            margin-top: 40px;
          }
        }
        @media (max-width: 576px) {
          .search-results-header .ant-input-affix-wrapper {
            font-size: 0.9rem !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          .search-results-header button {
            width: 46px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResultsPage;
