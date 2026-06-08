import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { BsArrowRight } from "react-icons/bs";
import { FiCheck } from "react-icons/fi";



const SearchResultCard = ({ result }) => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (result.website_link) {
      if (result.website_link.startsWith("/")) {
        navigate(result.website_link);
      } else {
        window.location.href = result.website_link;
      }
    }
  };

  const gateName = result.gate_name || "TekTime";
  const gateType = result.gate_type || result.type || "";
  const pillLabel = (gateType || gateName).toUpperCase();

  // Extract advantages from database properties, fallback if empty
  let advantages = [];
  if (Array.isArray(result.hero_benefits)) {
    advantages = result.hero_benefits;
  } else if (Array.isArray(result.heroBenefits)) {
    advantages = result.heroBenefits;
  } else if (typeof result.hero_benefits === "string") {
    try {
      advantages = JSON.parse(result.hero_benefits);
    } catch (e) {
      advantages = result.hero_benefits.split(",").map(b => b.trim());
    }
  } else if (typeof result.heroBenefits === "string") {
    try {
      advantages = JSON.parse(result.heroBenefits);
    } catch (e) {
      advantages = result.heroBenefits.split(",").map(b => b.trim());
    }
  } else if (Array.isArray(result.benefits_for_you)) {
    advantages = result.benefits_for_you;
  } else if (Array.isArray(result.problems)) {
    advantages = result.problems;
  }

  // Filter out empty options
  advantages = advantages.filter(adv => adv && typeof adv === "string" && adv.trim() !== "");



  return (
    <div 
      className="search-result-card-container w-100 text-center mx-auto mb-5 pb-5 border-bottom"
      style={{
        fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "850px",
        paddingLeft: "16px",
        paddingRight: "16px"
      }}
    >
      {/* Category Pill */}
      <div className="d-flex justify-content-center mb-3">
        <span 
          className="px-3 py-1 rounded-pill" 
          style={{ 
            fontSize: "0.75rem", 
            background: "#eff6ff", 
            color: "#2563eb",
            fontWeight: "700",
            letterSpacing: "0.05em"
          }}
        >
          {pillLabel}
        </span>
      </div>

      {/* Hero Title */}
      <h2 
        className="mb-4 text-center text-dark" 
        style={{ 
          fontSize: "2rem", 
          fontWeight: "800", 
          lineHeight: "1.3",
          letterSpacing: "-0.02em",
          color: "#0f172a"
        }}
      >
        {result.title || result.name || result.heroTitle}
      </h2>

      {/* Description Paragraph */}
      <p 
        className="mx-auto mb-4 text-center" 
        style={{ 
          fontSize: "1.05rem", 
          lineHeight: "1.65", 
          color: "#475569", 
          maxWidth: "760px",
          fontWeight: "400"
        }}
      >
        {result.subtitle || result.hero_subtitle || result.description}
      </p>

      {/* Call to Action Button */}
      <div className="d-flex justify-content-center mb-5">
        <Button 
          type="primary" 
          size="large"
          onClick={handleNavigate}
          className="d-inline-flex align-items-center justify-content-center gap-2 border-0 px-4 py-2 custom-cta-btn"
          style={{
            height: "48px",
            background: "#2563eb",
            borderColor: "#2563eb",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "1rem",
            color: "#ffffff"
          }}
        >
          <span>{result.heroCtaPrimary || t("searchResults.learnMore") || "En savoir plus"}</span>
          <BsArrowRight style={{ fontSize: "1.1rem", strokeWidth: "1" }} />
        </Button>
      </div>

      {/* Advantages list */}
      {advantages.length > 0 && (
        <div className="advantages-section text-center">
          <div 
            className="text-uppercase font-weight-bold mb-3 text-center"
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              letterSpacing: "0.15em",
              fontWeight: "700"
            }}
          >
            {t("searchResults.advantages") || "AVANTAGES"}
          </div>
          <div 
            className="d-flex flex-wrap justify-content-center gap-3 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            {advantages.map((adv, idx) => (
              <div 
                key={idx}
                className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 border text-start"
                style={{
                  background: "#f8fafc",
                  borderColor: "#e2e8f0",
                  color: "#334155",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
              >
                <FiCheck style={{ color: "#10b981", fontSize: "1.1rem", flexShrink: 0 }} />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .custom-cta-btn:hover {
          background: #1d4ed8 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default SearchResultCard;
