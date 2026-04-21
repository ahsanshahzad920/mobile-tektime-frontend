import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const menuItems = [
    { key: "login", label: t("navbar.login") },
    { key: "about", label: t("navbar.about_us") },
    { key: "contact", label: t("footer.contact_us") },
    { key: "privacy-policy", label: t("footer.privacy_policy") },
    { key: "terms-and-conditions", label: t("footer.terms_conditions") },
  ];

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <header
        className={`custom-header ${isScrolled ? "scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled ? "#FFFFFF" : "transparent",
          boxShadow: isScrolled ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
          paddingTop: 0,
        }}
      >
        <div
          className="container custom-nav-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          {/* Logo and Text */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/Assets/landing/logo.png"
              alt="TekTIME Logo"
              className="navbar-logo-img"
              onClick={() => {
                navigate("/");
              }}
            />
          </div>

          {/* Menu Text and Hamburger */}
          {/* <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: isScrolled ? "#000000" : "#000000",
                transition: "color 0.3s ease",
              }}
            >
              MENU
            </span>
            <Button
              type="text"
              icon={
                <img
                  src="https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/6853d4aa99a1acadf62b126a_toggle.svg"
                  alt="Menu Toggle"
                  style={{
                    width: 24,
                    height: 24,
                    // filter: isScrolled ? "invert(100%)" : "none",
                    filter: "invert(100%)",
                  }}
                />
              }
              onClick={showDrawer}
              style={{
                padding: 0,
                height: 40,
                width: 40,
              }}
            />
          </div> */}
          {/* Login & Menu */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Login / Connexion Button */}
            <Button
              type="primary"
              onClick={() => navigate("/")}
              className="navbar-login-btn-desktop"
              style={{
                backgroundColor: "#0047FF",
                borderColor: "#0047FF",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 6,
                padding: "6px 20px",
                fontSize: 15,
                height: 38,
                lineHeight: "20px",
              }}
            >
              {t("navbar.login")}
            </Button>

            {/* Privacy Policy Button (Desktop only) */}
            <Link to="https://solutions.tektime.io" className="privacy-desktop-btn">
              <Button
                type="primary"
                style={{
                  backgroundColor: "#0047FF",
                  borderColor: "#0047FF",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontSize: 15,
                  height: 35,
                }}
              >
                Solutions
              </Button>
            </Link>

            <Link to="/privacy-policy" className="privacy-desktop-btn">
              <Button
                type="primary"
                style={{
                  backgroundColor: "#0047FF",
                  borderColor: "#0047FF",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontSize: 15,
                  height: 35,
                }}
              >
                {t("footer.privacy_policy")}
              </Button>
            </Link>

            {/* Terms & Conditions Button (Desktop only) */}
            <Link to="/terms-and-conditions" className="privacy-desktop-btn">
              <Button
                type="primary"
                style={{
                  backgroundColor: "#0047FF",
                  borderColor: "#0047FF",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "6px 16px",
                  fontSize: 15,
                  height: 35,
                }}
              >
                {t("footer.terms_conditions")}
              </Button>
            </Link>
            {/* Menu Text (hidden on mobile) */}
            {/* Menu Text (hidden on mobile) */}
            <span
              className="menu-label-desktop"
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#000",
                transition: "color 0.3s ease",
              }}
            >
              MENU
            </span>

            {/* Menu Icon */}
            <Button
              type="text"
              icon={
                <img
                  src="https://cdn.prod.website-files.com/6853ad30b113b68f674e59d8/6853d4aa99a1acadf62b126a_toggle.svg"
                  alt="Menu Toggle"
                  style={{ 
                    width: 24, 
                    height: 24, 
                    filter: isScrolled ? "invert(100%)" : "invert(100%)" // Always invert if icon is black to make it white/gray or adjust based on theme
                  }}
                  className="menu-toggle-icon"
                />
              }
              onClick={showDrawer}
              style={{
                padding: 0,
                height: 40,
                width: 40,
              }}
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
        <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header with Logo + Close Button */}
          <div className="drawer-header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <img
              src="/Assets/landing/logo.png"
              alt="TekTIME"
              className="drawer-logo"
              style={{ height: '35px', objectFit: 'contain' }}
            />
            <button className="drawer-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
              <span className="drawer-close-icon">×</span>
            </button>
          </div>

          <nav className="drawer-nav" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Login button prominent in sidebar on mobile */}
            <Button
              type="primary"
              onClick={() => {
                navigate("/");
                setVisible(false);
              }}
              className="drawer-login-btn-mobile"
              style={{
                backgroundColor: "#0047FF",
                borderColor: "#0047FF",
                width: '100%',
                height: '45px',
                fontWeight: 700,
                fontSize: '16px',
                borderRadius: '8px',
                marginBottom: '10px'
              }}
            >
              {t("navbar.login")}
            </Button>

            {menuItems.filter(item => item.key !== 'login').map((item) => (
              <Link
                key={item.key}
                to={`/${item.key}`}
                className="drawer-link"
                style={{ fontSize: '18px', color: '#333', textDecoration: 'none', fontWeight: 500, padding: '10px 0' }}
                onClick={() => {
                  document
                    .getElementById(item.key)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setVisible(false);
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div style={{ flexGrow: 1 }}></div>

          {/* Footer Section (Localization) */}
          <div
            style={{
              borderTop: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "30px 20px",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "#333",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <GlobalOutlined /> {t("navbar.language")}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontWeight: i18n.language === "en" ? "bold" : 400,
                  color: "#4C4C4C",
                }}
              >
                EN
              </span>
              <Switch
                checked={i18n.language === "fr"}
                onChange={() =>
                  handleChangeLanguage(i18n.language === "fr" ? "en" : "fr")
                }
                size="small"
              />
              <span
                style={{
                  fontWeight: i18n.language === "fr" ? "bold" : 400,
                  color: "#4C4C4C",
                }}
              >
                FR
              </span>
            </div>
          </div>
        </div>
      </Drawer>

      {/* ✅ CSS for hiding Menu text on mobile */}
      <style>
        {`
          .custom-nav-container { height: 96px !important; transition: height 0.3s ease; }
          .navbar-logo-img { width: 160px; height: 50px; border-radius: 8px; object-fit: contain; cursor: pointer; transition: all 0.3s ease; }
          .menu-toggle-icon { transition: filter 0.3s ease; }

          @media (max-width: 768px) {
            .custom-nav-container { height: 70px; }
            .navbar-logo-img { width: 110px; height: 35px; }
            .menu-label-desktop { display: none; }
            .navbar-login-btn-desktop { display: none !important; }
            .privacy-desktop-btn { display: none !important; }
            .drawer-login-btn-mobile { display: block !important; }
            
            /* Ensure menu icon is visible on small screen */
            .menu-toggle-icon {
                filter: ${isScrolled ? "invert(0%)" : "invert(100%)"} !important;
                background: ${isScrolled ? "rgba(0,0,0,0.05)" : "transparent"};
                border-radius: 4px;
            }
          }

          @media (min-width: 769px) {
            .menu-label-desktop { display: inline; }
            .navbar-login-btn-desktop { display: inline-block !important; }
            .privacy-desktop-btn { display: inline-block !important; }
            .drawer-login-btn-mobile { display: none !important; }
            .menu-toggle-icon { filter: invert(100%); }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
