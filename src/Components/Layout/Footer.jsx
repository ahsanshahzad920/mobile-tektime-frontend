import React from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "antd";
import {
  MailOutlined,
  LinkedinFilled,
  FacebookFilled,
  InstagramFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const [t] = useTranslation("global");

  const socials = [
    {
      icon: <LinkedinFilled />,
      link: "https://www.linkedin.com/company/tektimesolutions",
      color: "#0A66C2",
      name: "LinkedIn",
    },
    {
      icon: <FacebookFilled />,
      link: "https://www.facebook.com/profile.php?id=61554831273983",
      color: "#1877F2",
      name: "Facebook",
    },
    {
      icon: <InstagramFilled />,
      link: "https://www.instagram.com/tektime.io/",
      color: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)",
      name: "Instagram",
    },
  ];

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #001a7a 0%, #0037ff 100%)",
        color: "#fff",
        padding: "80px 0 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      ></div>

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <Row gutter={[32, 32]} align="top" justify="space-between">
          {/* Logo Section */}
          <Col xs={24} md={8}>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                padding: "28px",
                backdropFilter: "blur(12px)",
                textAlign: "center",
                boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src="/Assets/landing/logo.png"
                alt="TekTIME Logo"
                style={{
                  width: "160px",
                  filter: "brightness(0) invert(1)",
                  marginBottom: 16,
                }}
              />
              <p
                style={{
                  color: "#E5E7EB",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}
              >
                {t("landingPage.footerTitle")}
              </p>
              {/* <p
                style={{
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 500,
                }}
              >
                <MailOutlined /> fondateur@tektime.fr
              </p> */}
              <a
                href="mailto:fondateur@tektime.fr"
                style={{
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.3s ease, transform 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFD700";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <MailOutlined style={{ fontSize: "20px" }} />
                fondateur@tektime.fr
              </a>
            </div>
          </Col>

          {/* Navigation Section */}
          <Col xs={24} md={8}>
            <h4
              style={{
                color: "#fff",
                fontWeight: 700,
                marginBottom: 20,
                fontSize: "18px",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Navigation
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                lineHeight: 2.2,
                fontSize: 15,
              }}
            >
              {[
                { text: t("navbar.about_us"), link: "/about" },
                { text: t("footer.contact_us"), link: "/contact" },
                { text: t("footer.privacy_policy"), link: "/privacy-policy" },
                {
                  text: t("footer.terms_conditions"),
                  link: "/terms-and-conditions",
                },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.link}
                    style={{
                      color: "#E5E7EB",
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) => (e.target.style.color = "#E5E7EB")}
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Socials Section */}
          <Col xs={24} md={8}>
            <h4
              style={{
                color: "#fff",
                fontWeight: 700,
                marginBottom: 20,
                fontSize: "18px",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("landingPage.follow_us")}
            </h4>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginBottom: 24,
              }}
            >
              {socials.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: item.color.includes("linear-gradient")
                      ? item.color
                      : `${item.color}22`,
                    color: "#fff",
                    fontSize: "22px",
                    transition:
                      "transform 0.4s ease, box-shadow 0.4s ease, background 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-5px) scale(1.1)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(255,255,255,0.25)";
                    e.currentTarget.style.background = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = item.color.includes(
                      "linear-gradient",
                    )
                      ? item.color
                      : `${item.color}22`;
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>

            <p
              style={{
                color: "#E5E7EB",
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 320,
              }}
            >
              {t("landingPage.newsletterText")}
            </p>
          </Col>
        </Row>

        {/* Bottom Line */}
        <div
          style={{
            margin: "60px 0 20px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        ></div>

        <p style={{ textAlign: "center", color: "#bbb", fontSize: "14px" }}>
          © 2026 IZIWORLDS. All rights reserved.
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;
