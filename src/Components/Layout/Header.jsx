import CookieService from '../Utils/CookieService';
// Components/Layout/Header.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../Apicongfig";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../context/HeaderTitleContext";
import axios from "axios";
import { useDraftMeetings } from "../../context/DraftMeetingContext";
import Search from "../Elements/Search/Search";
import Sidebar from "./Sidebar";
import { MdMenu, MdArrowBack } from "react-icons/md";

function Header({ onSignin, onLogout, isAuthenticated, onSearch }) {
  const { updateLanguage } = useDraftMeetings();
  const { setProfileImage } = useHeaderTitle();
  const location = useLocation();
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");

  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const userID = CookieService.get("user_id")
  const token = CookieService.get("token")

  // === LANGUAGE SWITCH ===
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    updateLanguage(lang);
  };

  // === BACK BUTTON ===
  const handleBack = () => navigate(-1);

  // === SCROLL EFFECT ===
  // useEffect(() => {
  //   const handleScroll = () => setScrolled(window.scrollY > 0);
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // === FETCH USER IMAGE ===
  useEffect(() => {
    if (!userID) return;
    const getUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileImage(data.data?.image);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [userID]);

  // === SEARCH HANDLING ===
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };

  useEffect(() => {
    setSearchTerm("");
    onSearch("");
  }, [location.pathname]);

  // === HIDE HEADER ON SPECIFIC PAGES ===
  const hideHeader = /^\/(destination|destiination|desti%CC%81nation)\/[^/]+\/[^/]+$/.test(location.pathname);
  if (hideHeader) return null;

  return (
    <>
      {/* HEADER */}
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-fluid px-2 px-md-4">
          <div className="header-top py-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between gap-3">

              {/* LEFT: HAMBURGER + BACK BUTTON */}
              <div className="d-flex align-items-center gap-3">

                {/* HAMBURGER - MOBILE ONLY */}
                <div className="d-lg-none">
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="btn p-0 text-dark"
                    aria-label="Open menu"
                  >
                    <MdMenu size={28} />
                  </button>
                </div>

                {/* BACK BUTTON - ALL DEVICES */}
                {!location.pathname.match(/^\/(home|Enterprises|Team|contract|drafts|customer-support)$/) && (
                  <button
                    onClick={handleBack}
                    className="btn p-0 text-primary d-flex align-items-center gap-1"
                    style={{ fontSize: "15px", fontWeight: 500 }}
                  >
                    <MdArrowBack size={20} />
                    <span className="d-none d-md-inline">{t("back")}</span>
                  </button>
                )}
              </div>

              {/* CENTER: SEARCH (DESKTOP) */}
              <div className="d-none d-lg-block flex-grow-1 max-w-600 mx-auto">
                <Search onSearch={handleSearchChange} />
              </div>

              {/* RIGHT: LANGUAGE SWITCHER */}
              <div className="language-switcher d-flex align-items-center gap-2 bg-light rounded-pill px-2 py-1">
                <button
                  onClick={() => handleChangeLanguage("en")}
                  className={`btn p-1 px-3 rounded-pill text-sm fw-bold ${i18n.language === "en" ? "bg-primary text-white" : "text-dark"}`}
                  style={{ fontSize: "13px" }}
                >
                  EN
                </button>
                <button
                  onClick={() => handleChangeLanguage("fr")}
                  className={`btn p-1 px-3 rounded-pill text-sm fw-bold ${i18n.language === "fr" ? "bg-primary text-white" : "text-dark"}`}
                  style={{ fontSize: "13px" }}
                >
                  FR
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH BELOW HEADER */}
      <div className="d-lg-none px-3 py-2 bg-white border-bottom">
        <Search onSearch={handleSearchChange} />
      </div>

      {/* SHARED SIDEBAR */}
      <Sidebar
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
    </>
  );
}

export default Header;