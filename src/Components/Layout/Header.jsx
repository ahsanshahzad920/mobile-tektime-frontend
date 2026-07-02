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

/**
 * Maps sidebar tab keys → the route prefixes they own.
 * Keep in sync with Sidebar.jsx renderNavTab().
 */
const TAB_ROUTE_MAP = {
  moments:     ["/meeting", "/graph", "/view", "/copy", "/Play", "/presentation", "/validateMeeting", "/meetings/drafts", "/present/invite", "/invite"],
  missions:    ["/Invities", "/invitiesToMeeting", "/participantToAction", "/updateParticipant"],
  actions:     ["/action", "/step"],
  solutions:   ["/solution"],
  discussions: ["/discussion"],
  casting:     ["/Team", "/ModifierTeam", "/users", "/ModifierUser"],
};

const ALL_MODULE_ROUTES = Object.values(TAB_ROUTE_MAP).flat();

function Header({ onSignin, onLogout, isAuthenticated, onSearch }) {
  const { updateLanguage } = useDraftMeetings();
  const { setProfileImage, user } = useHeaderTitle();
  const location = useLocation();
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");

  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const userID = CookieService.get("user_id");
  const token  = CookieService.get("token");
  const role   = CookieService.get("type");

  // === LANGUAGE SWITCH ===
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    updateLanguage(lang);
  };

  // === MODULE ACCESS HELPERS ===

  /**
   * Returns the flat list of route prefixes this user may access,
   * mirroring the tabsToRender logic in Sidebar.jsx.
   * Returns null when user data hasn't loaded yet (→ don't block anything).
   */
  const getAllowedRoutes = () => {
    if (!user) return null;

    const isAdmin = ["Admin", "MasterAdmin", "SuperAdmin"].includes(role);
    const tabToNeedMap = {
      casting:     "casting_need",
      moments:     "meeting_need",
      missions:    "mission_need",
      actions:     "action_need",
      solutions:   "solution_need",
      discussions: "discussion_need",
    };

    const userSelectedNeeds = user?.user_needs?.map((n) => n.need) || [];

    const allowedTabs = Object.keys(TAB_ROUTE_MAP).filter((tab) => {
      const needKey = tabToNeedMap[tab];
      if (!needKey) return true;

      const isAllowedByContract = user?.enterprise?.contract?.[needKey] === true;
      const isSelectedByUser    = userSelectedNeeds.includes(needKey);

      if (tab === "casting") return isAdmin || (isAllowedByContract && isSelectedByUser);
      return isAllowedByContract && isSelectedByUser;
    });

    return allowedTabs.flatMap((tab) => TAB_ROUTE_MAP[tab]);
  };

  /** True if the user has at least one module visible in the sidebar. */
  const hasAnyModule = () => {
    const routes = getAllowedRoutes();
    return routes === null || routes.length > 0; // null = not loaded, treat as yes
  };

  /**
   * Returns true if the given pathname is reachable by this user.
   * Non-module pages are always reachable.
   */
  const isPathAllowed = (pathname) => {
    const allowedRoutes = getAllowedRoutes();
    if (allowedRoutes === null) return true;

    const isModulePage = ALL_MODULE_ROUTES.some((prefix) => pathname.startsWith(prefix));
    if (!isModulePage) return true;

    return allowedRoutes.some((prefix) => pathname.startsWith(prefix));
  };

  // === BACK BUTTON ===
  const handleBack = () => {
    // Peek at referrer to know where navigate(-1) would land
    let targetPath = null;
    try {
      if (document.referrer) {
        const url = new URL(document.referrer);
        if (url.origin === window.location.origin) {
          targetPath = url.pathname;
        }
      }
    } catch (_) {}

    if (targetPath && !isPathAllowed(targetPath)) {
      // Target is a restricted module — go home instead
      navigate("/profile");
    } else {
      navigate(-1);
    }
  };

  /**
   * Whether to show the back button on the current page.
   *
   * Rules:
   * 1. Never show on top-level "root" pages (home, Enterprises, etc.)
   * 2. If the user has NO modules at all, also hide on profile-related pages
   *    (/profile, /profile/settings, /profile/integrations, etc.)
   */
  const showBackButton = (() => {
    const path = location.pathname;

    // Rule 1 – top-level pages that never need a back button
    if (/^\/(Enterprises|Team|contract|drafts|customer-support|meeting|invities|action|discussion|solution)$/i.test(path) || path === "/") {
      return false;
    }

    // Rule 2 – profile/settings/preferences: hide when user has no modules
    if (path.startsWith("/profile")) {
      return hasAnyModule();
    }

    return true;
  })();

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

                {/* BACK BUTTON */}
                {showBackButton && (
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