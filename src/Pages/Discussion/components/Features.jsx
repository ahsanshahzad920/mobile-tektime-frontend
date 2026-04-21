import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import feature1 from "../../../Media/assets/feature-1.1.png";
import feature2 from "../../../Media/assets/feature-2.png";
import feature3 from "../../../Media/assets/feature-3.3.png";
import feature4 from "../../../Media/assets/feature-4.1.png";
import "./Features.scss";
import { Container, Row, Col, Button } from "react-bootstrap";

// unused features array removed or kept comment out if needed
// const features = [...];

export default function Features({ data }) {
  const { t } = useTranslation("global");
  const objectUrlsRef = useRef([]);

  // Determine if we're in form/preview mode
  const isFormMode =
    data &&
    ("heroTitle" in data || "gateName" in data || "solutionTitle" in data);
  const hasItems = (arr) =>
    Array.isArray(arr) &&
    arr.some((item) => {
      if (typeof item === "string") return item.trim().length > 0;
      if (typeof item === "object" && item !== null)
        return Object.values(item).some(
          (v) => v && String(v).trim().length > 0,
        );
      return false;
    });

  const displayFeatures = data?.features || [
    {
      title: t("features-discussions.card1.title"),
      desc: t("features-discussions.card1.desc"),
      media_path: feature1,
      className: "card-large visual-blue",
    },
    {
      title: t("features-discussions.card2.title"),
      desc: t("features-discussions.card2.desc"),
      media_path: feature2,
      className: "card-medium visual-gray",
    },
    {
      title: t("features-discussions.card3.title"),
      desc: t("features-discussions.card3.desc"),
      media_path: feature3,
      className: "card-medium visual-white",
    },
    {
      title: t("features-discussions.card4.title"),
      desc: t("features-discussions.card4.desc"),
      media_path: feature4,
      className: "card-large visual-purple",
    },
  ];

  // In form mode, hide entire section if no features filled in
  if (isFormMode && !hasItems(displayFeatures)) return null;

  const renderMedia = (mediaType, mediaFile, altText = "", className = "") => {
    if (!mediaFile) {
      return null;
    }

    let mediaUrl;
    if (mediaFile instanceof File) {
      mediaUrl = URL.createObjectURL(mediaFile);
      objectUrlsRef.current.push(mediaUrl);
    } else {
      mediaUrl = mediaFile;
    }

    if (mediaType === "video") {
      return (
        <video
          src={mediaUrl}
          controls
          className={`preview-media-video rounded-3 ${className}`}
          autoPlay={data.heroAutoplay || data.hero_autoplay}
          muted={data.heroAutoplay || data.hero_autoplay}
          loop
          style={{ width: "100%" }}
        />
      );
    }
    return (
      <img
        src={mediaUrl}
        alt={altText}
        className={`preview-media-img rounded-3 ${className}`}
      />
    );
  };

  return (
    <>
      <section className="section features-section-landing" id="features">
        <div className="container">
          <div className="text-center section-header">
            <span className="badge-text">{t("feature-discussions.badge")}</span>
            <h2 className="section-title">
              {data?.solution_title || t("feature-discussions.title")}
            </h2>
            {data?.solution_intro && (
              <p className="section-subtitle">{data.solution_intro}</p>
            )}
          </div>

          <div className="bento-grid">
            {displayFeatures.map((feature, index) => {
              const visualClass = [
                "visual-blue",
                "visual-gray",
                "visual-white",
                "visual-purple",
              ][index % 4];
              return (
                <motion.div
                  key={index}
                  className={`bento-card ${feature.className || (index % 4 === 0 || index % 4 === 3 ? "card-large" : "card-medium")}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="card-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                  {(() => {
                    const mediaEl = renderMedia(
                      feature.mediaType || feature.media_type,
                      feature.mediaFile || feature.media_path,
                      "",
                      "feature-image",
                    );
                    return mediaEl ? (
                      <div className={`card-visual ${visualClass}`}>
                        {mediaEl}
                      </div>
                    ) : null;
                  })()}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- PROBLEM SECTION --- */}
      {(!isFormMode ||
        hasItems(data?.problems) ||
        data?.problem_title ||
        data?.problemTitle) && (
        <section className="section preview-problem" id="problem">
          <Container>
            {(() => {
              const mediaEl = renderMedia(
                data.problemMediaType || data.problem_media_type,
                data.problemMediaFile || data.problem_media_path,
                data.problemMediaDesc || data.problem_media_desc,
                "w-100",
              );
              return (
                <Row
                  className={`align-items-center ${mediaEl ? "flex-row-reverse g-5" : "justify-content-center text-center"}`}
                >
                  <Col lg={mediaEl ? 6 : 8}>
                    <motion.h2
                      initial={{
                        opacity: 0,
                        x: mediaEl ? 50 : 0,
                        y: mediaEl ? 0 : 20,
                      }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {data.problemTitle || data.problem_title || "The Problem"}
                    </motion.h2>
                    <div
                      className={`mt-4 ${!mediaEl ? "mx-auto text-start" : ""}`}
                      style={!mediaEl ? { maxWidth: "800px" } : {}}
                    >
                      {(data.problems || []).map(
                        (prob, idx) =>
                          prob && (
                            <div
                              key={idx}
                              className="problem-item d-flex align-items-center p-3 mb-3 bg-white shadow-sm border rounded-4"
                            >
                              <div
                                className="bg-danger rounded-circle me-3"
                                style={{ width: "10px", height: "10px" }}
                              ></div>
                              <p className="mb-0 fw-medium">{prob}</p>
                            </div>
                          ),
                      )}
                    </div>
                  </Col>
                  {mediaEl && (
                    <Col lg={6}>
                      <div className="p-2 bg-white rounded-5 shadow-lg overflow-hidden">
                        {mediaEl}
                      </div>
                    </Col>
                  )}
                </Row>
              );
            })()}
          </Container>
        </section>
      )}

      {/* --- BUSINESS BENEFITS SECTION --- */}
      {(!isFormMode ||
        hasItems(data?.benefits_for_you) ||
        hasItems(data?.benefitsForYou) ||
        hasItems(data?.benefits_for_clients) ||
        hasItems(data?.benefitsForClients)) && (
        <section
          className="section preview-business-benefits"
          id="benefits"
          style={{ padding: "80px 0" }}
        >
          <Container>
            <div className="text-center mb-5">
              <h2
                style={{
                  fontSize: "2.5rem",
                  color: "#ffffff",
                  fontWeight: "700",
                }}
              >
                {data.benefits_title ||
                  data.benefitsTitle ||
                  "Business Benefits"}
              </h2>
            </div>

            <Row className="g-5 mb-5">
              {/* For You - only show if has items */}
              {hasItems(data.benefits_for_you) && (
                <Col lg={hasItems(data.benefits_for_clients) ? 6 : 12}>
                  <div
                    className="p-4 rounded-4 h-100"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* <h3
                      className="h4 mb-4"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      For You
                    </h3> */}
                    <div className="d-flex flex-column gap-3">
                      {(data.benefits_for_you || []).map(
                        (item, idx) =>
                          item && (
                            <div
                              key={idx}
                              className="d-flex align-items-center"
                            >
                              <div
                                className="flex-shrink-0 me-3 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <span className="text-white fs-5">{item}</span>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </Col>
              )}
              {/* For Clients - only show if has items */}
              {hasItems(data.benefits_for_clients) && (
                <Col lg={hasItems(data.benefits_for_you) ? 6 : 12}>
                  <div
                    className="p-4 rounded-4 h-100"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {/* <h3
                      className="h4 mb-4"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      For Your Clients / Team
                    </h3> */}
                    <div className="d-flex flex-column gap-3">
                      {(data.benefits_for_clients || []).map(
                        (item, idx) =>
                          item && (
                            <div
                              key={idx}
                              className="d-flex align-items-center"
                            >
                              <div
                                className="flex-shrink-0 me-3 bg-info rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <span className="text-white fs-5">{item}</span>
                            </div>
                          ),
                      )}
                    </div>
                  </div>
                </Col>
              )}
            </Row>

            {/* Media Impact & Key Figure */}
            <div className="text-center mt-5">
              {(data.benefits_media_path || data.benefitsMediaPath) && (
                <div
                  className="benefits-media-wrapper rounded-4 overflow-hidden shadow-lg mx-auto mb-4"
                  style={{ maxWidth: "900px" }}
                >
                  {renderMedia(
                    data.benefits_media_type || data.benefitsMediaType,
                    data.benefits_media_path || data.benefitsMediaPath,
                    "Benefits Impact",
                    "w-100 object-fit-cover",
                  )}
                </div>
              )}

              {(data.benefits_key_figure || data.benefitsKeyFigure) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="display-6 fw-bold text-white mb-0">
                    "{data.benefits_key_figure || data.benefitsKeyFigure}"
                  </p>
                </motion.div>
              )}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
