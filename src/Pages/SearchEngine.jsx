import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Button,
  Drawer,
  Typography,
  Card,
  Row,
  Col,
  Form,
  Input,
  Tag,
  Spin,
} from "antd";
import { FaGraduationCap, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { ArrowRightOutlined, StarFilled, SearchOutlined, LoadingOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { FaFacebookMessenger, FaSearch, FaVideo, FaCalendarAlt, FaChartLine, FaUsers, FaTasks, FaUserCheck, FaFileContract } from "react-icons/fa";
import {
  FacebookFilled,
  LinkedinFilled,
  InstagramFilled,
  MailOutlined,
} from "@ant-design/icons";
import { BsArrowRight } from "react-icons/bs";
import { UserOutlined, CodeOutlined, BulbOutlined } from "@ant-design/icons";

import "./Landing.scss";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { FiCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../Components/Apicongfig";
import CookieService from "../Components/Utils/CookieService";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/*
const getSuggestionLabel = (item, t) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  
  const gate = item.gate_name?.toLowerCase() || "";
  const localizedLabel = t(`searchEngine.gateLabels.${gate}`, "");
  if (localizedLabel) {
    return localizedLabel;
  }
  
  if (item.title) {
    const cleanTitle = item.title.split("—")[0].split("CRM")[0].split(".")[0].trim();
    return cleanTitle.length > 35 ? cleanTitle.substring(0, 32) + "..." : cleanTitle;
  }
  return item.title || "";
};
*/

const SearchEngine = () => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  // Search Engine State & Logic
  const [query, setQuery] = useState("");
  const [latitude, setLatitude] = useState(localStorage.getItem("user_latitude") || null);
  const [longitude, setLongitude] = useState(localStorage.getItem("user_longitude") || null);
  const [pillSuggestions, setPillSuggestions] = useState([]);
  const containerRef = useRef(null);

  const suggestions = t("searchEngine.suggestions", { returnObjects: true }) || [];

  // Geolocation
  useEffect(() => {
    const savedLat = CookieService.get("user_latitude") || localStorage.getItem("user_latitude");
    const savedLon = CookieService.get("user_longitude") || localStorage.getItem("user_longitude");

    if (savedLat) setLatitude(savedLat);
    if (savedLon) setLongitude(savedLon);

    const requestLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            setLatitude(lat);
            setLongitude(lon);

            localStorage.setItem("user_latitude", lat);
            localStorage.setItem("user_longitude", lon);
            try {
              CookieService.set("user_latitude", lat);
              CookieService.set("user_longitude", lon);
            } catch (e) {}
          },
          (err) => {
            console.warn("Geolocation access denied or failed:", err);
          }
        );
      }
    };

    // If no saved coordinates exist, request geolocation upon user interaction
    if (!savedLat || !savedLon) {
      const triggerInteraction = () => {
        requestLocation();
        cleanupListeners();
      };

      const cleanupListeners = () => {
        window.removeEventListener("mousemove", triggerInteraction);
        window.removeEventListener("scroll", triggerInteraction);
        window.removeEventListener("touchstart", triggerInteraction);
        window.removeEventListener("click", triggerInteraction);
      };

      window.addEventListener("mousemove", triggerInteraction, { passive: true });
      window.addEventListener("scroll", triggerInteraction, { passive: true });
      window.addEventListener("touchstart", triggerInteraction, { passive: true });
      window.addEventListener("click", triggerInteraction, { passive: true });

      return cleanupListeners;
    }
  }, []);

  // Fetch default pill suggestions once on mount or when location changes
  useEffect(() => {
    const fetchPillSuggestions = async () => {
      try {
        let url = `${API_BASE_URL}/google-search-suggestions`;
        const params = [];
        if (latitude) {
          params.push(`latitude=${latitude}`);
        }
        if (longitude) {
          params.push(`longitude=${longitude}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setPillSuggestions(result.data);
        }
      } catch (err) {
        console.error("Pill suggestions fetch error:", err);
      }
    };
    fetchPillSuggestions();
  }, [latitude, longitude]);


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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId;
    let intervalId;
    let isLoaded = false;

    const loadCrisp = () => {
      if (isLoaded) return;
      isLoaded = true;

      // Clean up event listeners immediately
      cleanupListeners();

      if (!window.$crisp) {
        window.$crisp = [];
      }
      window.CRISP_WEBSITE_ID = "a3f1edc3-bc94-4038-9037-50258aa2fb8b";

      const ensureChatVisible = () => {
        try {
          window.$crisp.push(["do", "chat:show"]);
          window.$crisp.push(["do", "chat:close"]);
        } catch (e) {
          console.error("Crisp error:", e);
        }
      };

      const existingScript = document.querySelector(
        'script[src="https://client.crisp.chat/l.js"]',
      );

      if (!existingScript) {
        const s = document.createElement("script");
        s.src = "https://client.crisp.chat/l.js";
        s.async = 1;
        s.onload = () => {
          ensureChatVisible();
        };
        document.getElementsByTagName("head")[0].appendChild(s);
      } else {
        ensureChatVisible();
      }

      intervalId = setInterval(() => {
        if (window.$crisp) {
          window.$crisp.push(["do", "chat:show"]);
        }
      }, 1000);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
      }, 5000);
    };

    const triggerEvents = ["pointerdown", "touchstart", "scroll", "mousemove", "keydown"];
    const cleanupListeners = () => {
      triggerEvents.forEach((event) => {
        window.removeEventListener(event, loadCrisp);
      });
    };

    // Load Crisp after 4 seconds of idle time or immediately on user interaction
    const idleTimeout = setTimeout(loadCrisp, 4000);

    triggerEvents.forEach((event) => {
      window.addEventListener(event, loadCrisp, { passive: true });
    });

    return () => {
      clearTimeout(idleTimeout);
      cleanupListeners();
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      if (window.$crisp) {
        try {
          window.$crisp.push(["do", "chat:hide"]);
        } catch (e) {}
      }
    };
  }, []);

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/landing-pages/by-type/Tektime`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          const rawContracts = result?.data?.contracts || [];

          const mappedPlans = rawContracts.map((item) => {
            let currencySymbol = item.currency;
            if (
              item.currency === "Dollar" ||
              item.currency === "USD" ||
              item.currency === "usd"
            )
              currencySymbol = "$";
            else if (
              item.currency === "Euro" ||
              item.currency === "EUR" ||
              item.currency === "eur"
            )
              currencySymbol = "€";

            const paymentType = item.payment_type?.toLowerCase() || "";
            const isMonthly =
              paymentType.includes("mensuelle") ||
              paymentType.includes("monthly");
            const cycle = isMonthly ? "monthly" : "yearly";

            return {
              name: item.name,
              price: `${currencySymbol}${parseFloat(item.price).toFixed(0)}`,
              period: isMonthly
                ? t("pricing.per_month")
                : cycle === "yearly"
                  ? t("pricing.per_year")
                  : item.payment_type,
              description: item.description,
              licenses: item.no_of_licenses,
              billingCycle: cycle,
              features: [
                `${item.no_of_licenses} ${parseInt(item.no_of_licenses) > 1 ? t("pricing.licenses") : t("pricing.license")}`,
                `Module: ${Array.isArray(item.type) ? item.type.join(", ") : item.type?.replace(/[\[\]"]/g, "")}`,
                isMonthly
                  ? t("pricing.monthly_billing")
                  : cycle === "yearly"
                    ? t("pricing.annual_billing")
                    : item.payment_type,
              ].filter(Boolean),
              isPopular:
                item.name === "Pro" ||
                item.name === "Basic Messages" ||
                item.name === "TEKTIME_TEST_GRATUIT_1_MOIS",
              id: item.id,
            };
          });

          mappedPlans.push({
            name: t("pricing.enterprise.title"),
            price: t("pricing.enterprise.price_text"),
            features: t("pricing.enterprise.features", { returnObjects: true }),
            isPopular: false,
            isEnterprise: true,
            id: "enterprise",
            billingCycle: "both",
          });

          setAllPlans(mappedPlans);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Failed to fetch pricing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  const hasMonthly = allPlans.some((p) => p.billingCycle === "monthly");
  const hasYearly = allPlans.some((p) => p.billingCycle === "yearly");
  const showToggle = hasMonthly && hasYearly;

  const filteredPlans = allPlans.filter(
    (plan) =>
      plan.billingCycle === "both" || plan.billingCycle === billingCycle,
  );

  useEffect(() => {
    if (!loading && window.location.hash === "#pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [loading]);

  const services = [
    {
      icon: <FaCalendarAlt size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card1.title"),
      subtitle: t("landingPage.services.card1.subtitle"),
      items: [
        t("landingPage.services.card1.l1"),
        t("landingPage.services.card1.l2"),
        t("landingPage.services.card1.l3"),
        t("landingPage.services.card1.l4"),
      ],
      btnLabel: t("landingPage.services.card1.btn")
    },
    {
      icon: <FaChartLine size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card2.title"),
      subtitle: t("landingPage.services.card2.subtitle"),
      items: [
        t("landingPage.services.card2.l1"),
        t("landingPage.services.card2.l2"),
        t("landingPage.services.card2.l3"),
        t("landingPage.services.card2.l4"),
      ],
      btnLabel: t("landingPage.services.card2.btn")
    },
    {
      icon: <FaUsers size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card3.title"),
      subtitle: t("landingPage.services.card3.subtitle"),
      items: [
        t("landingPage.services.card3.l1"),
        t("landingPage.services.card3.l2"),
        t("landingPage.services.card3.l3"),
        t("landingPage.services.card3.l4"),
        t("landingPage.services.card3.l5"),
      ],
      btnLabel: t("landingPage.services.card3.btn")
    },
    {
      icon: <FaTasks size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card4.title"),
      subtitle: t("landingPage.services.card4.subtitle"),
      items: [
        t("landingPage.services.card4.l1"),
        t("landingPage.services.card4.l2"),
        t("landingPage.services.card4.l3"),
        t("landingPage.services.card4.l4"),
      ],
      btnLabel: t("landingPage.services.card4.btn")
    },
    {
      icon: <FaUserCheck size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card5.title"),
      subtitle: t("landingPage.services.card5.subtitle"),
      items: [
        t("landingPage.services.card5.l1"),
        t("landingPage.services.card5.l2"),
        t("landingPage.services.card5.l3"),
        t("landingPage.services.card5.l4"),
      ],
      btnLabel: t("landingPage.services.card5.btn")
    },
    {
      icon: <FaFileContract size={50} style={{ color: "#1890ff" }} />,
      title: t("landingPage.services.card6.title"),
      subtitle: t("landingPage.services.card6.subtitle"),
      items: [
        t("landingPage.services.card6.l1"),
        t("landingPage.services.card6.l2"),
        t("landingPage.services.card6.l3"),
        t("landingPage.services.card6.l4"),
        t("landingPage.services.card6.l5"),
      ],
      btnLabel: t("landingPage.services.card6.btn")
    },
  ];

  const projects = [
    {
      image:
        "https://res.cloudinary.com/drrk2kqvy/image/upload/f_auto,q_auto,w_800/v1760357848/voice_notes/Screenshot_2025-10-13_171456_qwxikz.png",
      title: t("landingPage.solution.card1.title"),
      description: t("landingPage.solution.card1.desc"),
      tags: ["Generate Automatic Report", "AI-Powered", "Time-Saving"],
    },
  ];

  const ProjectCard = ({ project }) => {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <div
        className="project-image-wrapper"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={project.image}
          alt={project.title}
          className="project-image"
        />

        {isHovering && (
          <div
            className="floating-icon"
            style={{
              top: `${cursorPos.y}px`,
              left: `${cursorPos.x}px`,
            }}
          >
            <BsArrowRight />
          </div>
        )}
      </div>
    );
  };

  const steps = [
    {
      title: t("landingPage.work.step1.title"),
      description: t("landingPage.work.step1.desc"),
      image: "/Assets/process_image1.webp",
    },
    {
      title: t("landingPage.work.step2.title"),
      description: t("landingPage.work.step2.desc"),
      image: "/Assets/process_image2.webp",
    },
    {
      title: t("landingPage.work.step3.title"),
      description: t("landingPage.work.step3.desc"),
      image: "/Assets/process_image3.webp",
    },
    {
      title: t("landingPage.work.step4.title"),
      description: t("landingPage.work.step4.desc"),
      image: "/Assets/process_image3.webp",
    },
    {
      title: t("landingPage.work.step5.title"),
      description: t("landingPage.work.step4.desc"),
      image: "/Assets/process_image3.webp",
    },
  ];

  const values = [
    {
      title: t("landingPage.values.value1.title"),
      description: t("landingPage.values.value1.desc"),
    },
    {
      title: t("landingPage.values.value2.title"),
      description: t("landingPage.values.value2.desc"),
    },
    {
      title: t("landingPage.values.value3.title"),
      description: t("landingPage.values.value3.desc"),
    },
    {
      title: t("landingPage.values.value4.title"),
      description: t("landingPage.values.value4.desc"),
    },
  ];

  const testimonials = [
    {
      title: t("landingPage.testimonials.review1.title"),
      text: t("landingPage.testimonials.review1.desc"),
      image: "/Assets/testimonial_davy.jpg",
      author: "Davy CHOUMILLE",
      role: t("landingPage.testimonials.review1.role"),
    },
    {
      title: t("landingPage.testimonials.review2.title"),
      text: t("landingPage.testimonials.review2.desc"),
      image: "/Assets/testimonial_generic.png",
      author: "Romain Barbe",
      role: t("landingPage.testimonials.review2.role"),
    },
  ];

  return (
    <div className="new-landing-page">
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Content>
              {/* Original Search Hero Section */}
          <section
            id="home"
            className="search-engine-landing d-flex align-items-center justify-content-center bg-white"
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8 text-center">
                  {/* Logo, Title & Subtitle */}
                  <div className="mb-4 d-flex flex-column align-items-center">
                    {/* <img 
                      src="/Assets/sidebar-invite-logo.svg" 
                      alt="TekTIME" 
                      className="search-logo mb-4"
                    /> */}
                    
                    <div className="search-badge">
                      <span className="france-flag-logo">
                        <span className="stripe-red"></span>
                      </span>
                      <span className="badge-text">{t("searchEngine.subtitle")}</span>
                    </div>

                    {/* Title */}
                    <h1 className="search-title">
                      {t("searchEngine.titleNormal")}
                      <span className="highlight-blue">{t("searchEngine.titleHighlight")}</span>
                    </h1>
                  </div>

                  {/* Search Bar */}
                  <div ref={containerRef} className="search-container position-relative mb-4 mt-5 pt-3 mb-sm-5 mx-auto" style={{ maxWidth: "700px" }}>
                    <div className="d-flex gap-2 p-1 rounded-pill shadow-lg border" style={{ background: "#fff" }}>
                      <Input
                        size="large"
                        placeholder={t("searchEngine.placeholder")}
                        value={query}
                        allowClear
                        onChange={(e) => setQuery(e.target.value)}
                        onPressEnter={() => handleSearch()}
                        bordered={false}
                        className="flex-grow-1 px-2 px-sm-4 search-input-field"
                        style={{ fontSize: "1rem" }}
                        prefix={<SearchOutlined style={{ color: "#bfbfbf", fontSize: "1.1rem" }} />}
                      />
                      <Button 
                        type="primary" 
                        size="large" 
                        onClick={() => handleSearch()}
                        className="rounded-pill d-flex align-items-center justify-content-center search-submit-btn"
                        style={{ 
                          height: "44px", 
                          fontWeight: "600",
                          background: "#000",
                          borderColor: "#000"
                        }}
                      >
                        <span className="d-none d-sm-inline">{t("searchEngine.button")}</span>
                        <SearchOutlined className="d-inline d-sm-none" style={{ fontSize: '1.1rem' }} />
                      </Button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="suggestions-container">
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      {pillSuggestions.map((item, index) => {
                        const gateLabel = item.gate_name;
                        const typeLabel = item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : "";
                        // const label = typeLabel ? `${gateLabel} (${typeLabel})` : gateLabel;
                        const label = item?.hero_alt_text
                        const value = item?.website_link;
                        
                        return (
                          <Button
                            key={index}
                            onClick={() => onSuggestionClick(value)}
                            className="suggestion-btn rounded-pill border shadow-sm"
                            style={{ 
                              background: "#f8fafc", 
                              color: "#475569",
                              borderColor: "#e2e8f0",
                              minHeight: "40px",
                              height: "auto",
                              padding: "8px 20px",
                              fontWeight: "500",
                              transition: "all 0.2s ease",
                              maxWidth: "100%",
                              whiteSpace: "normal",
                              textAlign: "center",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: "1.3",
                              fontSize: "0.9rem"
                            }}
                            title={typeof value === "object" ? value.title : value}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <style>{`
              .search-engine-landing {
                padding-left: 1rem;
                padding-right: 1rem;
                padding-top: 96px;
                padding-bottom: 80px;
              }
              @media (max-width: 768px) {
                .search-engine-landing {
                  padding-top: 40px !important;
                  padding-bottom: 30px !important;
                }
                .search-engine-landing .search-container {
                  display: block !important;
                }
              }
              .search-logo {
                height: 80px;
                transition: all 0.3s ease;
              }
              @media (max-width: 576px) {
                .search-logo {
                  height: 50px !important;
                }
                .search-subtitle {
                  letter-spacing: 0.05em !important;
                  font-size: 0.75rem !important;
                }
                .search-container {
                  margin-bottom: 1.5rem !important;
                  max-width: 100% !important;
                  padding-left: 0.25rem;
                  padding-right: 0.25rem;
                }
                .search-submit-btn {
                  width: 44px !important;
                  padding: 0 !important;
                  border-radius: 50% !important;
                  flex-shrink: 0;
                }
                .search-input-field {
                  font-size: 0.9rem !important;
                  padding-left: 6px !important;
                  padding-right: 6px !important;
                }
                .suggestion-btn {
                  height: auto !important;
                  min-height: 32px !important;
                  padding: 4px 12px !important;
                  font-size: 0.8rem !important;
                }
              }
              .suggestion-btn:hover {
                background: #f1f5f9 !important;
                border-color: #cbd5e1 !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                color: #0f172a !important;
              }
              .search-container:focus-within {
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
              }
            `}</style>
          </section>


 {/* Banner (Hero) Section */}
          <section
            id="home"
            className="hero-section"
            style={{
              position: "relative",
              backgroundImage: `url('https://res.cloudinary.com/drrk2kqvy/image/upload/f_auto,q_auto,w_1600/v1759830958/voice_notes/WhatsApp_Image_2025-10-06_at_20.59.36_dpxvu5.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "clamp(450px, 80dvh, 900px)",
              display: "flex",
              alignItems: "flex-end",
              padding: "120px 24px 80px",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.45)", // Adjust darkness here (0.3–0.6 works best)
                zIndex: 1,
              }}
            ></div>
            <div
              className="container"
              style={{ position: "relative", zIndex: 2 }}
            >
              <Title
                level={1}
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(36px, 8vw, 80px)",
                  fontWeight: 700,
                  marginBottom: 16,
                  lineHeight: 1.2, // keeps spacing balanced
                }}
              >
                {t("landingPage.hero.title1")}
                <br />
                {t("landingPage.hero.title2")}
                <br />
                {t("landingPage.hero.title3")}
              </Title>

              <Paragraph
                style={{ fontSize: 18, maxWidth: "auto", color: "#FFFFFF" }}
              >
                {t("landingPage.hero.desc1")}
                <br /> {t("landingPage.hero.desc2")}
              </Paragraph>
            </div>
          </section>
          {/* ECOSYSTEM / ASSISTANT SECTION */}
          {/* <section id="ecosystem" style={{ padding: "100px 0", backgroundColor: "#fff" }}>
            <div className="container">
              <Row gutter={[64, 64]} align="middle">
                <Col xs={24} lg={12}>
                  <div style={{ textAlign: "left" }}>
                    <Title
                      level={5}
                      style={{
                        color: "#0047FF",
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        fontWeight: 700,
                        marginBottom: 16
                      }}
                    >
                      {t("landingPage.ecosystem.title2")}
                    </Title>
                    <Title
                      level={2}
                      style={{
                        fontSize: "clamp(32px, 4vw, 48px)",
                        fontWeight: 800,
                        lineHeight: 1.2,
                        marginBottom: 32,
                        color: "#0A0A0A"
                      }}
                    >
                      {t("landingPage.ecosystem.title1")}
                    </Title>

                    <div style={{ fontSize: "18px", color: "#555", lineHeight: "1.7" }}>
                      <Paragraph style={{ marginBottom: 20 }}>
                        {t("landingPage.ecosystem.desc1")}
                      </Paragraph>
                      <Paragraph style={{ marginBottom: 20, fontSize: "20px", color: "#333", fontWeight: 500 }}>
                        {t("landingPage.ecosystem.desc2")}
                      </Paragraph>
                      <Paragraph style={{ marginBottom: 24 }}>
                        {t("landingPage.ecosystem.desc3")} {t("landingPage.ecosystem.desc4")}
                      </Paragraph>
                    </div>

                    <div style={{ marginTop: 40, display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <Button
                        type="primary"
                        size="large"
                        style={{
                          height: "auto",
                          minHeight: 56,
                          borderRadius: 50,
                          padding: "12px 28px",
                          backgroundColor: "#0047FF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: 16,
                          boxShadow: "0 10px 20px rgba(0, 71, 255, 0.2)",
                          whiteSpace: "normal",
                          maxWidth: "100%",
                          lineHeight: "1.3"
                        }}
                        onClick={() => navigate(`/register?contract_id=3`)}
                      >
                        {t("landingPage.button1")}
                      </Button>
                     
                    </div>
                  </div>
                </Col>

                <Col xs={24} lg={12}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      boxShadow: "0 40px 100px rgba(0,0,0,0.15)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid #E6EBF5",
                      background: "#fff"
                    }}>
                      <div style={{
                        height: "28px",
                        background: "#F8FAFC",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        gap: "6px",
                        borderBottom: "1px solid #E2E8F0"
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFBD2E" }} />
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840" }} />
                      </div>
                      <img
                        src="/Assets/landing/agenda-preview.png"
                        alt="TekTIME Agenda Interface"
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </section> */}

          {/* Services Section */}
          <section id="services" className="services-section py-5 mt-5 mb-5">
            <div className="container">
              <Paragraph className="text-uppercase text-muted fw-bold mb-1" style={{ letterSpacing: "1px" }}>
                {t("landingPage.services.title")}
              </Paragraph>

              <Title level={2} className="fw-bold mb-4">
                {t("landingPage.services.subtitle1")}
                <br />
                {t("landingPage.services.subtitle2")}
              </Title>

              <Row gutter={[24, 24]} justify="center" className="mt-5">
                {services.map((service, index) => (
                  <Col xs={24} md={12} lg={8} key={index}>
                    <Card
                      className="service-card text-start p-4 h-100 flex flex-col justify-between"
                      style={{
                        minHeight: "500px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="mb-3">{service.icon}</div>

                      <Title level={4} className="mb-2">
                        {service.title}
                      </Title>

                      <Paragraph className="text-gray-600 mb-3">
                        {service.subtitle}
                      </Paragraph>

                      <div className="service-lines mt-3 space-y-2 flex-grow">
                        {service.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start text-gray-700"
                            style={{ marginBottom: "6px" }}
                          >
                            <IoCheckmarkDoneOutline
                              className="text-blue-600 text-lg flex-shrink-0 mt-0.5"
                              style={{ marginRight: "8px" }}
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* <Button
                        type="primary"
                        size="middle"
                        style={{
                          marginTop: "auto",
                          backgroundColor: "#0047FF",
                          borderColor: "#0047FF",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: "50px",
                          padding: "10px 24px",
                          boxShadow: "0 4px 12px rgba(0, 71, 255, 0.2)",
                          alignSelf: "flex-start"
                        }}
                        onClick={() => {
                          if (index === 0)
                            navigate(`/gate/moment?contract_id=${3}`);
                          else if (index === 1)
                            navigate(`/gate/mission?contract_id=${3}`);
                          else if (index === 4)
                            navigate("https://solutions.tektime.io/");
                          else navigate(`/register?contract_id=${3}`);
                        }}
                      >
                        {service.btnLabel}
                      </Button> */}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* SCALE BRAND SECTION */}
          <section
            id="scale-brand"
            style={{
              backgroundColor: "#0047FF",
              padding: "80px 0",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container px-3">
              <Row align="middle" justify="space-between" gutter={[32, 32]}>
                <Col xs={24} md={14}>
                  <div style={{ maxWidth: "550px" }}>
                    <h2
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "clamp(24px, 5vw, 42px)",
                        marginBottom: "16px",
                      }}
                    >
                      {t("landingPage.scaleBrand.title")}
                    </h2>
                    <h3
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontWeight: 500,
                        fontSize: "clamp(18px, 4vw, 32px)",
                        marginBottom: "32px",
                      }}
                    >
                      {t("landingPage.scaleBrand.desc")}
                    </h3>

                    <div>
                      <Button
                        size="large"
                        style={{
                          backgroundColor: "#fff",
                          color: "#0047FF",
                          borderRadius: "50px",
                          fontWeight: 700,
                          padding: "12px 28px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                          border: "none",
                          whiteSpace: "normal",
                          height: "auto",
                          minHeight: "48px",
                          maxWidth: "100%",
                          lineHeight: "1.3"
                        }}
                        onClick={() => navigate(`/register?contract_id=${3}`)}
                      >
                        {t("landingPage.button2")} <ArrowRightOutlined />
                      </Button>
                    </div>

                    <div style={{ marginTop: "60px" }}>
                      <p
                        style={{
                          color: "#fff",
                          textTransform: "uppercase",
                          fontSize: "clamp(11px, 1.3vw, 13px)",
                          letterSpacing: "1px",
                          marginBottom: "20px",
                          fontWeight: 700,
                        }}
                      >
                        {t("landingPage.scaleBrand.desc2")}
                      </p>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={10}>
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div
                      style={{
                        background: "white",
                        padding: "12px",
                        borderRadius: "12px",
                        display: "inline-block",
                        width: "100%",
                        maxWidth: "320px",
                      }}
                    >
                      <img
                        src="https://res.cloudinary.com/drrk2kqvy/image/upload/f_auto,q_auto,w_600/v1760357959/voice_notes/6853fb1a02d1124e4cefc3ff_join-with-image-p-1080_gv03o8.webp"
                        alt="Scale Brand"
                        style={{
                          borderRadius: "8px",
                          width: "100%",
                          height: "auto",
                        }}
                      />
                    </div>

                    <div className="floating-icon-scale top">⚡</div>
                    <div className="floating-icon-scale bottom">❤️</div>
                  </div>
                </Col>
              </Row>
            </div>

            <style>{`
              @keyframes floatUpDown {
                0%, 100% { transform: translate(-120%, 0px); }
                50% { transform: translate(-120%, -15px); }
              }
              @keyframes floatDownUp {
                0%, 100% { transform: translate(120%, 0px); }
                50% { transform: translate(120%, 15px); }
              }
              .floating-icon-scale {
                position: absolute;
                background: #fff;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: transform 0.3s ease;
              }
              .floating-icon-scale.top {
                top: -20px;
                left: 50%;
                animation: floatUpDown 3s ease-in-out infinite;
              }
              .floating-icon-scale.bottom {
                bottom: -20px;
                right: 50%;
                animation: floatDownUp 3s ease-in-out infinite;
              }
              @media (max-width: 768px) {
                .floating-icon-scale {
                  display: none !important;
                }
              }
            `}</style>
          </section>

          {/* Solutions / Projects CTA Section */}
          <section
            id="projects"
            style={{
              padding: "100px 0",
              background: "linear-gradient(180deg, #FFFFFF 0%, #F4F7FF 100%)",
              textAlign: "center",
              borderTop: "1px solid #E6EBF5"
            }}
          >
            <div className="container">
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Title
                  level={2}
                  style={{
                    fontSize: "clamp(32px, 5vw, 48px)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: "24px",
                    color: "#0A0A0A"
                  }}
                >
                  {t("landingPage.solution.title1")}
                  <br />
                  <span style={{ color: "#0047FF" }}>{t("landingPage.solution.title2")}</span>
                </Title>

                <Paragraph
                  style={{
                    fontSize: "20px",
                    color: "#64748B",
                    marginBottom: "48px",
                    lineHeight: 1.6
                  }}
                >
                  {t("landingPage.solution.cta")}
                </Paragraph>

                <div style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#0047FF",
                      borderRadius: "50px",
                      padding: "12px 28px",
                      fontWeight: 700,
                      height: "auto",
                      minHeight: 60,
                      fontSize: "clamp(15px, 4vw, 18px)",
                      boxShadow: "0 10px 25px rgba(0, 71, 255, 0.25)",
                      border: "none",
                      whiteSpace: "normal",
                      maxWidth: "100%",
                      lineHeight: "1.3"
                    }}
                    onClick={() => navigate(`/register?contract_id=3`)}
                  >
                    {t("landingPage.solution.startTrial")}
                  </Button>

                  <Button
                    size="large"
                    style={{
                      borderRadius: "50px",
                      padding: "12px 28px",
                      fontWeight: 700,
                      height: "auto",
                      minHeight: 60,
                      fontSize: "clamp(15px, 4vw, 18px)",
                      borderColor: "#0047FF",
                      color: "#0047FF",
                      backgroundColor: "transparent",
                      whiteSpace: "normal",
                      maxWidth: "100%",
                      lineHeight: "1.3"
                    }}
                    onClick={() => window.open(`https://solutions.tektime.io/`, "_blank")}
                  >
                    {t("landingPage.solution.button")}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* How We Work Section */}
          <section
            id="how-we-work"
            style={{
              backgroundColor: "#0047FF",
              padding: "80px 0",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container">
              <Row gutter={[48, 48]} align="middle">
                <Col xs={24} md={12}>
                  <Title
                    level={2}
                    className="mb-2"
                    style={{
                      color: "#fff",
                      fontSize: "clamp(22px, 3vw, 44px)",
                      fontWeight: 500,
                      lineHeight: "1.2666666666666666",
                      marginBottom: 8,
                    }}
                  >
                    {t("landingPage.work.title")}
                  </Title>
                  <Paragraph
                    style={{
                      color: "#fff",
                      textTransform: "uppercase",
                      fontSize: "clamp(13px, 2.5vw, 16px)",
                      fontWeight: 500,
                    }}
                  >
                    {t("landingPage.work.desc")}
                  </Paragraph>
                  <Button
                    size="large"
                    style={{
                      backgroundColor: "#fff",
                      color: "#0047FF",
                      borderRadius: "8px",
                      fontWeight: 600,
                      padding: "10px 24px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                      whiteSpace: "normal",
                      height: "auto",
                      minHeight: "44px",
                      maxWidth: "100%",
                      lineHeight: "1.3"
                    }}
                    onClick={() => navigate(`/register?contract_id=${3}`)}
                  >
                    {t("landingPage.work.button")}
                  </Button>
                </Col>

                <Col xs={24} md={12}>
                  <div className="steps-container">
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className="step-item animate-step"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        {index !== steps.length - 1 && (
                          <div className="step-line" />
                        )}
                        <div className="step-content">
                          <div className="step-number">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </div>
                          <div>
                            <h4 className="step-title">{step.title}</h4>
                            <p className="step-description">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {index !== steps.length - 1 && (
                          <hr className="step-divider" />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* Testimonials Section */}
          <section
            id="testimonials"
            className="testimonials-section py-5 mt-5 mb-5"
          >
            <div className="container">
              <Paragraph className="text-uppercase text-muted fw-bold mb-1" style={{ letterSpacing: "1px" }}>
                {t("landingPage.testimonials.title")}
              </Paragraph>
              <Title level={2} className="fw-bold mb-3">
                {t("landingPage.testimonials.desc")}
              </Title>

              <Row gutter={[24, 24]} justify="center" className="mt-5">
                {testimonials.map((tVal, i) => (
                  <Col
                    xs={24}
                    md={12}
                    lg={8}
                    key={i}
                    style={{ display: "flex" }}
                  >
                    <div style={{ flex: 1, display: "flex" }}>
                      <Card
                        hoverable
                        className="testimonial-card p-4"
                        style={{
                          borderRadius: 12,
                          background: "#fff",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                          border: "none",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: 380,
                        }}
                      >
                        <div
                          className="testimonial-header"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 16,
                          }}
                        >
                          <img
                            src={tVal.image}
                            alt={tVal.author}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <Title
                              level={5}
                              style={{
                                marginBottom: 0,
                                fontWeight: 600,
                              }}
                            >
                              {tVal.author}
                            </Title>
                            <Paragraph
                              style={{
                                marginBottom: 0,
                                color: "#888",
                                fontSize: 14,
                              }}
                            >
                              {tVal.role}
                            </Paragraph>
                          </div>
                        </div>

                        <div
                          style={{
                            color: "#FFD700",
                            marginBottom: 16,
                            fontSize: 18,
                          }}
                        >
                          <StarFilled /> <StarFilled /> <StarFilled />{" "}
                          <StarFilled /> <StarFilled />
                        </div>

                        <Title
                          level={4}
                          style={{
                            color: "#333",
                            fontSize: 18,
                            marginBottom: 12,
                          }}
                        >
                          {tVal.title}
                        </Title>

                        <Paragraph
                          style={{
                            fontSize: 16,
                            color: "#444",
                            fontStyle: "italic",
                            lineHeight: 1.6,
                          }}
                        >
                          “{tVal.text}”
                        </Paragraph>
                      </Card>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* Our Values */}
          <section
            id="our-values"
            style={{
              background: "linear-gradient(180deg, #F9FBFF 0%, #FFFFFF 100%)",
              padding: "90px 0",
              color: "#0A0A0A",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="container">
              <Row gutter={[48, 48]} align="middle">
                <Col xs={24} md={10}>
                  <Title
                    level={2}
                    className="mb-2"
                    style={{
                      color: "#0047FF",
                      fontSize: "clamp(22px, 3vw, 44px)",
                      fontWeight: 600,
                      lineHeight: 1.25,
                      marginBottom: 8,
                    }}
                  >
                    {t("landingPage.values.title")}
                  </Title>
                  <Paragraph
                    style={{
                      color: "#333",
                      textTransform: "uppercase",
                      fontSize: "clamp(13px, 2.5vw, 16px)",
                      fontWeight: 500,
                      letterSpacing: "0.5px",
                      marginBottom: 24,
                    }}
                  >
                    {t("landingPage.values.desc")}
                  </Paragraph>
                  <Button
                    size="large"
                    style={{
                      backgroundColor: "#0047FF",
                      color: "#fff",
                      borderRadius: "8px",
                      fontWeight: 600,
                      padding: "10px 24px",
                      boxShadow: "0 4px 10px rgba(0, 71, 255, 0.25)",
                      whiteSpace: "normal",
                      height: "auto",
                      minHeight: "44px",
                      maxWidth: "100%",
                      lineHeight: "1.3"
                    }}
                    onClick={() => navigate(`/register?contract_id=${3}`)}
                  >
                    {t("landingPage.values.button")}
                  </Button>
                </Col>

                <Col xs={24} md={14}>
                  <Row gutter={[24, 24]}>
                    {values.map((value, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <div
                          className="value-card"
                          style={{
                            background: "#fff",
                            borderRadius: "12px",
                            padding: "24px",
                            height: "100%",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                            borderLeft: "4px solid #0047FF",
                            transition: "all 0.3s ease",
                            transform: "translateY(0)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-6px)";
                            e.currentTarget.style.boxShadow =
                              "0 10px 20px rgba(0, 71, 255, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 18px rgba(0,0,0,0.05)";
                          }}
                        >
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: 700,
                              color: "#0047FF",
                              marginBottom: "10px",
                            }}
                          >
                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </div>
                          <h4
                            style={{
                              fontSize: "18px",
                              fontWeight: 600,
                              marginBottom: "8px",
                              color: "#0A0A0A",
                            }}
                          >
                            {value.title}
                          </h4>
                          <p
                            style={{
                              color: "#555",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              marginBottom: 0,
                            }}
                          >
                            {value.description}
                          </p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </div>
          </section>

          {/* Pricing Section */}
          <section
            className="pricing-section py-5 bg-light"
            id="pricing"
            style={{ padding: "90px 0" }}
          >
            <div className="container">
              <div className="text-center section-header mb-5">
                <h2
                  className="section-title"
                  style={{
                    fontSize: "clamp(22px, 3vw, 44px)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {t("pricing.title")}
                </h2>
                <p className="subtitle text-muted" style={{ fontSize: 18 }}>
                  {t("pricing.subtitle")}
                </p>
              </div>

              {loading && (
                <div className="text-center py-5">
                  <p>{t("pricing.loading")}</p>
                </div>
              )}

              {error && (
                <div className="text-center py-5">
                  <p>{t("pricing.unavailable")}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {showToggle && (
                    <div
                      className="pricing-toggle-container mb-5"
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <div
                        className="pricing-toggle"
                        style={{
                          background: "#e2e8f0",
                          padding: "4px",
                          borderRadius: "50px",
                          display: "inline-flex",
                          position: "relative",
                        }}
                      >
                        <button
                          className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                          onClick={() => setBillingCycle("yearly")}
                          style={{
                            padding: "8px 24px",
                            borderRadius: "50px",
                            border: "none",
                            background:
                              billingCycle === "yearly"
                                ? "white"
                                : "transparent",
                            color:
                              billingCycle === "yearly" ? "#0f172a" : "#64748b",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow:
                              billingCycle === "yearly"
                                ? "0 2px 4px rgba(0,0,0,0.1)"
                                : "none",
                          }}
                        >
                          {t("pricing.annual")}
                        </button>
                        <button
                          className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                          onClick={() => setBillingCycle("monthly")}
                          style={{
                            padding: "8px 24px",
                            borderRadius: "50px",
                            border: "none",
                            background:
                              billingCycle === "monthly"
                                ? "white"
                                : "transparent",
                            color:
                              billingCycle === "monthly"
                                ? "#0f172a"
                                : "#64748b",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow:
                              billingCycle === "monthly"
                                ? "0 2px 4px rgba(0,0,0,0.1)"
                                : "none",
                          }}
                        >
                          {t("pricing.monthly")}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pricing-grid">
                    <Row gutter={[32, 32]} justify="center" align="stretch">
                      {filteredPlans.map((plan, idx) => (
                        <Col
                          xs={24}
                          md={8}
                          key={idx}
                          style={{ display: "flex" }}
                        >
                          <div
                            className={`pricing-card w-100 ${plan.isPopular ? "popular" : ""}`}
                            style={
                              plan.isEnterprise
                                ? {
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: "2rem",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  }
                                : {
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    border: "1px solid #f0f0f0",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                    position: "relative",
                                  }
                            }
                          >
                            {plan.isPopular && (
                              <div className="popular-badge">
                                {t("pricing.most_popular")}
                              </div>
                            )}
                            <div
                              className="plan-header"
                              style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: plan.isEnterprise
                                  ? "center"
                                  : "stretch",
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: "1.2rem",
                                  fontWeight: 600,
                                  color: plan.isEnterprise
                                    ? "#0a1128"
                                    : "#0047FF",
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                  marginBottom: "1rem",
                                }}
                              >
                                {plan.name}
                              </h3>
                              {plan.isEnterprise ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "2.5rem",
                                      fontWeight: 800,
                                      color: "#0a1128",
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {plan.price}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "1rem",
                                      color: "#64748b",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {plan.period}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    className="plan-price"
                                    style={{
                                      marginBottom: "0.25rem",
                                      width: "100%",
                                      fontSize: "3rem",
                                      fontWeight: 800,
                                      color: "#0a0a0a",
                                      display: "flex",
                                      alignItems: "baseline",
                                      gap: "4px",
                                    }}
                                  >
                                    {plan.price}
                                    <span
                                      className="plan-period"
                                      style={{
                                        fontSize: "1rem",
                                        color: "#64748b",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {plan.period}
                                    </span>
                                  </div>
                                  {plan.licenses && (
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#6b7280",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {t(
                                        plan.licenses > 1
                                          ? "pricing.for_licenses"
                                          : "pricing.for_license",
                                        { count: plan.licenses },
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {!plan.isEnterprise && (
                              <div
                                className="plan-features flex-grow-1"
                                style={{ margin: "2rem 0" }}
                              >
                                {plan.description ? (
                                  <div
                                    className="plan-description-content"
                                    dangerouslySetInnerHTML={{
                                      __html: plan.description,
                                    }}
                                    style={{
                                      textAlign: "left",
                                      color: "#444",
                                      lineHeight: 1.6,
                                    }}
                                  />
                                ) : (
                                  plan.features.map((feature, fIdx) => (
                                    <div
                                      key={fIdx}
                                      className="feature-item"
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                        marginBottom: "12px",
                                        textAlign: "left",
                                      }}
                                    >
                                      <FiCheck
                                        size={18}
                                        className="feature-check"
                                        style={{
                                          color: "#0047FF",
                                          flexShrink: 0,
                                          marginTop: "3px",
                                        }}
                                      />
                                      <span
                                        style={{
                                          color: "#444",
                                          fontSize: "15px",
                                        }}
                                      >
                                        {feature}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}

                            {plan.isEnterprise && (
                              <div className="flex-grow-1"></div>
                            )}

                            <button
                              className={`btn ${plan.isPopular ? "btn-primary" : "btn-secondary"} w-100 mt-auto`}
                              style={{
                                background: plan.isPopular
                                  ? "#0047FF"
                                  : "#f0f5ff",
                                color: plan.isPopular ? "#fff" : "#0047FF",
                                border: "none",
                                padding: "14px",
                                borderRadius: "12px",
                                fontWeight: 700,
                                fontSize: "15px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() => {
                                if (plan.isEnterprise) {
                                  window.open(
                                    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482",
                                    "_blank",
                                  );
                                  return;
                                }
                                if (plan.price === "Custom") return;
                                navigate(`/register?contract_id=${plan.id}`);
                              }}
                            >
                              {plan.isEnterprise
                                ? t("pricing.enterprise.speak_to_sales")
                                : plan.price === "Custom"
                                  ? t("pricing.contact_sales")
                                  : t("pricing.subscribe_8days")}
                            </button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </>
              )}
            </div>
          </section>
        </Content>
      </Layout>
    </div>
  );
};

export default SearchEngine;
