import React, { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Drawer, Button, Dropdown, Switch } from "antd";
import {
  DownOutlined,
  GlobalOutlined,
  MenuOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [t, i18n] = useTranslation("global");

  // Handle scroll effect for header
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  const navButtons = [
    { key: "solutions", label: "Solutions", link: "https://solutions.tektime.io/", type: "link" },
    { key: "add-activity", label: t("navbar.add_activity"), link: "https://tektime.io/gate/annuaire", type: "link" },
    { key: "login", label: t("navbar.login"), link: "/", type: "button" },
  ];

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const navigate = useNavigate();

  const handleNavClick = (link) => {
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
    onClose();
  };

  const location = useLocation();
  const isOldHomePage = location.pathname === "/old-home";
  const shouldShowDark = isScrolled || !isOldHomePage;

  return (
    <>
      {/* Header */}
      <header
        className={`custom-header ${shouldShowDark ? "scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: shouldShowDark ? "rgba(255, 255, 255, 0.85)" : "transparent",
          backdropFilter: shouldShowDark ? "blur(12px)" : "none",
          boxShadow: shouldShowDark ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          height: 96,
          paddingTop: 16,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/Assets/landing/logo.png"
              alt="TekTIME Logo"
              style={{
                width: 160,
                height: 50,
                borderRadius: 8,
                objectFit: "contain",
                cursor: "pointer",
                filter: shouldShowDark ? "none" : "brightness(0) invert(1)",
              }}
              onClick={() => navigate("/")}
            />
          </div>

          {/* Desktop Nav */}
          <div
            className="desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24, // Increased gap for better breathing room
            }}
          >
            {navButtons.map((btn) => {
              const isLink = btn.type === "link" || btn.key === "login";
              const isPrimary = btn.key === "try-tektime";
              const isGhost = btn.key === "book-appointment";
              const isCTA = btn.type === "cta";

              let btnClass = "nav-btn";
              if (isLink) btnClass += " nav-btn-link";
              else if (isPrimary) btnClass += " nav-btn-primary";
              else if (isGhost) btnClass += " nav-btn-outline";
              else if (isCTA) btnClass += " nav-btn-cta";

              return (
                <Button
                  key={btn.key}
                  type={isPrimary || isCTA ? "primary" : (isGhost ? "default" : "text")}
                  onClick={() => handleNavClick(btn.link)}
                  className={btnClass}
                >
                  {btn.label}
                </Button>
              );
            })}
          </div>

          <div
            className="menu-trigger"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button
              type="text"
              icon={
                <MenuOutlined style={{ fontSize: 24, color: shouldShowDark ? "#000" : "#fff" }} />
              }
              onClick={showDrawer}
              style={{ padding: 0, height: 40, width: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
            />
          </div>
        </div>
      </header>

      {/* Sidebar (Drawer) */}
      <Drawer
        title={null}
        placement="right"
        onClose={onClose}
        open={visible}
        className="custom-drawer"
        bodyStyle={{ background: "#FFFFFF", padding: 0 }}
        headerStyle={{ display: "none" }}
        zIndex={1001}
      >
        <div className="drawer-content">
          <div className="drawer-header" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <img src="/Assets/landing/logo.png" alt="TekTIME" style={{ height: 40 }} />
            <button className="drawer-close-btn" onClick={onClose} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer" }}>×</button>
          </div>

          <nav className="drawer-nav" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {navButtons.map((btn) => (
              <div
                key={btn.key}
                onClick={() => handleNavClick(btn.link)}
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111",
                  cursor: "pointer",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0"
                }}
              >
                {btn.label}
              </div>
            ))}
            <div
              onClick={() => handleNavClick("/privacy-policy")}
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#666",
                cursor: "pointer",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0"
              }}
            >
              {t("footer.privacy_policy")}
            </div>
            <div
              onClick={() => handleNavClick("/terms-and-conditions")}
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#666",
                cursor: "pointer",
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0"
              }}
            >
              {t("footer.terms_conditions")}
            </div>
          </nav>

          {/* Localization */}
          <div style={{ borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "30px 20px" }}>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#333", display: "flex", alignItems: "center", gap: 8 }}>
              <GlobalOutlined /> {t("navbar.language")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: i18n.language === "en" ? "bold" : 400, color: "#4C4C4C" }}>EN</span>
              <Switch
                checked={i18n.language === "fr"}
                onChange={() => handleChangeLanguage(i18n.language === "fr" ? "en" : "fr")}
                size="small"
              />
              <span style={{ fontWeight: i18n.language === "fr" ? "bold" : 400, color: "#4C4C4C" }}>FR</span>
            </div>
          </div>
        </div>
      </Drawer>

      <style>
        {`
          @media (max-width: 992px) {
            .desktop-nav { display: none !important; }
            .menu-label-desktop { display: none !important; }
          }
          .custom-header.scrolled .menu-label-desktop { color: #000 !important; }
          .custom-header:not(.scrolled) .menu-label-desktop { color: #fff !important; }

          .nav-btn {
            font-size: 15px !important;
            font-weight: 600 !important;
            height: 44px !important;
            border-radius: 50px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            border: none !important;
          }
          
          /* Link/Text buttons (Solutions, Connexion) */
          .nav-btn-link {
            color: ${shouldShowDark ? "#344054" : "#ffffff"} !important;
            padding: 0 8px !important;
            background: transparent !important;
            border: none !important;
            position: relative !important;
          }
          .nav-btn-link::after {
            content: '';
            position: absolute;
            bottom: 6px;
            left: 8px;
            right: 8px;
            height: 2px;
            background-color: #0047FF;
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }
          .nav-btn-link:hover {
            color: #0047FF !important;
            background: transparent !important;
          }
          .nav-btn-link:hover::after {
            transform: scaleX(1);
          }
          
          /* Primary button (Try Tektime) */
          .nav-btn-primary {
            background: linear-gradient(135deg, #0047FF 0%, #002db3 100%) !important;
            border: none !important;
            color: #ffffff !important;
            padding: 0 24px !important;
            box-shadow: 0 4px 14px rgba(0, 71, 255, 0.35) !important;
          }
          .nav-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 71, 255, 0.45) !important;
            opacity: 0.95 !important;
            color: #ffffff !important;
          }
          
          /* Outline button (Book an appointment) */
          .nav-btn-outline {
            background: transparent !important;
            border: 2px solid ${shouldShowDark ? "#0047FF" : "#ffffff"} !important;
            color: ${shouldShowDark ? "#0047FF" : "#ffffff"} !important;
            padding: 0 24px !important;
          }
          .nav-btn-outline:hover {
            background: ${shouldShowDark ? "#0047FF" : "#ffffff"} !important;
            color: ${shouldShowDark ? "#ffffff" : "#0047FF"} !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 14px ${shouldShowDark ? "rgba(0, 71, 255, 0.2)" : "rgba(255, 255, 255, 0.3)"} !important;
            border-color: ${shouldShowDark ? "#0047FF" : "#ffffff"} !important;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
