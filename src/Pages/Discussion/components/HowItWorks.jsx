import React from "react";
import { motion } from "framer-motion";
import { User, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import signupOutlook from "../../../Media/assets/sigup-outlook.png";
import "./HowItWorks.scss";

export default function HowItWorks({ data }) {
  const { t } = useTranslation();

  // Determine if data is from form (has camelCase keys)
  // const isFormData = data && ('heroTitle' in data || 'gateName' in data || 'howTitle' in data);

  // If we have data.steps, use them. Otherwise empty.
  const steps = data?.steps?.length > 0 ? data.steps : [];

  // Filter out completely empty steps (no title, no desc, no media)
  const validSteps = steps.filter(
    (s) => s.title || s.desc || s.media_path || s.mediaFile,
  );

  // Hide section entirely if no valid steps
  if (validSteps.length === 0) return null;

  // Render media helper: supports both image and video
  const renderStepMedia = (step) => {
    const mediaPath = step.media_path || step.mediaFile;
    const mediaType = step.media_type || step.mediaType;
    if (!mediaPath) {
      return (
        <div className="default-card-text">
          <h3>{step.title}</h3>
        </div>
      );
    }
    if (mediaType === "video") {
      return (
        <video
          src={
            typeof mediaPath === "string"
              ? mediaPath
              : URL.createObjectURL(mediaPath)
          }
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }
    return (
      <img
        src={
          typeof mediaPath === "string"
            ? mediaPath
            : URL.createObjectURL(mediaPath)
        }
        alt={step.title}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  };

  const sectionTitle = data?.how_title;

  return (
    <section className="section how-it-works-section">
      <div className="container">
        <div className="text-center section-header">
          {sectionTitle && <h2>{sectionTitle}</h2>}
          {/* {!isFormData && <p className="subtitle">{t('how_it_works.subtitle')}</p>} */}
        </div>

        <div className="steps-container">
          {/* Connecting Line - Progress Bar */}
          <div className="steps-connector">
            <motion.div
              className="connector-progress"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "100%", "100%", "0%"] }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1,
              }}
            ></motion.div>
          </div>

          <div className="steps-wrapper">
            {validSteps.map((step, index) => (
              <motion.div
                key={index}
                className="step-item"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-card">
                  {step.type === "signup" && (
                    <>
                      <motion.div
                        className="floating-icon icon-user"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <User color="white" size={24} />
                      </motion.div>
                      <div className="card-mock-ui">
                        <div className="mock-title">{step.title}</div>
                        <div className="mock-sub">
                          {t("how_it_works.step1.subtitle")}
                        </div>
                        <div className="mock-inputs">
                          <div className="input-line"></div>
                          <div className="input-field"></div>
                          <div className="input-line"></div>
                          <div className="input-field"></div>
                        </div>
                        <div className="mock-btn">{step.title}</div>
                      </div>
                    </>
                  )}

                  {step.type === "integration" && (
                    <>
                      <motion.div
                        className="floating-icon icon-integrations"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                      >
                        <div className="icon-grid">
                          <div className="mini-icon"></div>
                          <div className="mini-icon"></div>
                        </div>
                      </motion.div>
                      <div className="card-mock-ui">
                        <div className="mock-title">{step.title}</div>
                        <div className="mock-sub">
                          {t("how_it_works.step2.subtitle")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "20px",
                            margin: "15px 0",
                          }}
                        >
                          <motion.img
                            src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                            alt="Gmail"
                            style={{
                              width: "35px",
                              height: "35px",
                              objectFit: "contain",
                            }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <motion.img
                            src="https://cdn-icons-png.flaticon.com/512/732/732223.png"
                            alt="Outlook"
                            style={{
                              width: "35px",
                              height: "35px",
                              objectFit: "contain",
                            }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1.5,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step.type === "stats" && (
                    <>
                      <motion.div
                        className="floating-icon icon-bot"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1,
                        }}
                      >
                        <MessageSquare color="white" size={24} />
                      </motion.div>
                      <div
                        className="card-mock-ui ui-stats"
                        style={{
                          padding: 0,
                          overflow: "hidden",
                          background: "transparent",
                        }}
                      >
                        <img
                          src={signupOutlook}
                          alt="Outlook Integration"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {!step.type && (
                    <>
                      <motion.div
                        className={`floating-icon icon-${index % 3 === 0 ? "user" : index % 3 === 1 ? "integrations" : "bot"}`}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2,
                        }}
                      >
                        {index % 3 === 0 && <User color="#335CFF" size={24} />}
                        {index % 3 === 1 && (
                          <div className="icon-grid">
                            <div className="mini-icon"></div>
                            <div className="mini-icon"></div>
                          </div>
                        )}
                        {index % 3 === 2 && (
                          <MessageSquare color="#0EA5E9" size={24} />
                        )}
                      </motion.div>

                      <div
                        className="card-mock-ui"
                        style={{ padding: 0, overflow: "hidden" }}
                      >
                        {renderStepMedia(step)}
                      </div>
                    </>
                  )}
                </div>
                <div className="step-desc">
                  <p>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
