import React from "react";
import { motion, useSpring } from "framer-motion";
import { ArrowRight, CheckCircle, Play } from "lucide-react";
import heroDashboard from "../../../Media/assets/hero-bg-2.png";

import "./Hero.scss";

import { useTranslation } from "react-i18next"; // Added import
import { API_BASE_URL } from "../../../Components/Apicongfig";

export default function Hero({ data }) {
  const { t } = useTranslation(); // Added hook
  // Mouse Parallax Logic
  const mouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 50, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x * 15); // Reduced sensitivity for smoother feel
    mouseY.set(y * 15);
  }

  const splitTitle = (title) => {
    if (!title)
      return {
        first: "Build Your Professional",
        second: "Landing Page",
        third: "",
      };
    const words = title.split(" ");
    if (words.length <= 2) return { first: title, second: "", third: "" };

    const thirdLen = Math.ceil(words.length / 3);
    const secondStart = thirdLen;
    const thirdStart = Math.ceil((2 * words.length) / 3);

    return {
      first: words.slice(0, secondStart).join(" "),
      second: words.slice(secondStart, thirdStart).join(" "),
      third: words.slice(thirdStart).join(" "),
    };
  };

  const { first, second, third } = splitTitle(data.hero_title);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId =
    data?.hero_media_type === "youtube"
      ? getYoutubeId(data.hero_youtube_url)
      : null;

  return (
    <section
      className="section hero-section"
      id="home"
      onMouseMove={handleMouseMove}
    >
      {/* Modern Mesh Gradient Background */}
      <div className="hero-mesh-bg"></div>

      <div className="container hero-container relative">
        {/* Centered Content */}
        <div className="hero-content text-center">
          {/* <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="hero-badge"
                    >
                        <span className="badge-dot"></span>
                        New Implementation
                    </motion.div> */}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="hero-title"
          >
            <span className="title-top d-block mb-2">{first}</span>
            <span className="title-bottom d-block">{second}</span>
            <span className="title-bottom text-primary-gradient d-block">
              {third}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hero-description"
          >
            {data?.hero_subtitle}
          </motion.p>

          {(data.hero_benefits || []).some((b) => b) && (
            <motion.div
              className="hero-benefits-tags d-flex justify-content-center gap-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {data?.hero_benefits?.map(
                (benefit, i) =>
                  benefit && (
                    <span key={i} className="benefit-tag">
                      <CheckCircle size={14} className="me-1" /> {benefit}
                    </span>
                  ),
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hero-actions justify-center"
          >
            {data?.hero_cta_primary && data?.hero_cta_primary_link && (
              <button
                className="btn btn-hero btn-primary"
                onClick={async () => {
                  const link = data?.hero_cta_primary_link;

                  // // Track click if ID is available
                  // if (data?.id) {
                  //   try {
                  //     await fetch(
                  //       `${API_BASE_URL}/landing-pages/${data.id}/click`,
                  //       {
                  //         method: "POST",
                  //         headers: {
                  //           "Content-Type": "application/json",
                  //         },
                  //       },
                  //     );
                  //   } catch (error) {
                  //     console.error("Error tracking click:", error);
                  //   }
                  // }

                  if (link) {
                    window.open(link, "_blank");
                  }
                }}
              >
                {data.hero_cta_primary}{" "}
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
            )}
            {data?.hero_cta_secondary && data?.hero_cta_secondary_link && (
              <button
                className="btn btn-hero btn-secondary"
                onClick={() => {
                  const link = data?.hero_cta_secondary_link;
                  if (link) {
                    window.open(link, "_blank");
                  }
                }}
              >
                <Play
                  size={16}
                  fill="currentColor"
                  style={{ marginRight: 8 }}
                />
                {data.hero_cta_secondary}
              </button>
            )}
          </motion.div>
        </div>

        {/* Highlighted Visuals with Parallax */}
        {/* Wrapped Entrance Animation Separate from Parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="hero-visuals"
        >
          {/* Inner wrapper handles the continuous parallax to avoid conflict */}
          <motion.div
            className="dashboard-parallax-wrapper"
            style={{ x: mouseX, y: mouseY }}
          >
            <div className="dashboard-wrapper">
              {data?.hero_media_type === "youtube" && youtubeId ? (
                <div
                  className="dashboard-img"
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%",
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${data.hero_autoplay ? 1 : 0}&mute=${data.hero_autoplay ? 1 : 0}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Youtube Video"
                  />
                </div>
              ) : data?.hero_media_type === "video" && data?.hero_media_path ? (
                <video
                  src={data.hero_media_path}
                  className="dashboard-img"
                  autoPlay={!!data.hero_autoplay}
                  muted
                  loop
                  playsInline
                  controls={!data.hero_autoplay}
                  style={{ width: "100%", borderRadius: "12px" }}
                />
              ) : data?.hero_media_path ? (
                <img
                  src={data.hero_media_path}
                  alt="TekTIME Dashboard"
                  className="dashboard-img"
                />
              ) : !data?.hero_title ? (
                // Only show default dashboard if NOT in custom gate preview mode
                <img
                  src={heroDashboard}
                  alt="TekTIME Dashboard"
                  className="dashboard-img"
                />
              ) : null}

              {/* Floating Element - Independent Motion */}
              {/* <motion.div
                                className="floating-card-wrapper"
                                animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <img src={heroCard} alt="Support Ticket" className="floating-card-img" />
                            </motion.div> */}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
