import CookieService from "../Utils/CookieService";
// Components/Layout/Sidebar.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../Apicongfig";
import { CiLogout, CiSettings } from "react-icons/ci";
import axios from "axios";
import { useTabs } from "../../context/TabContext";
import { useSidebarContext } from "../../context/SidebarContext";
import { useHeaderTitle } from "../../context/HeaderTitleContext";
import { useEnterpriseCount } from "../../context/EnterpriseUserCountContext";
import { Badge } from "react-bootstrap";
import { IoMdSync } from "react-icons/io";
import { Layout } from "antd";
import "./Sidebar.css";
import { FaRobot } from "react-icons/fa6";
import { getAssistantProfile } from "../Elements/Discussion/api";

const { Sider } = Layout;

function Sidebar({ onLogout, mobileOpen, setMobileOpen }) {
  const { setActiveTab } = useTabs();
  const [t] = useTranslation("global");
  const location = useLocation();
  const navigate = useNavigate();
  const { show } = useSidebarContext();
  const { profileImage, setProfileImage, setUser, user, callUser } =
    useHeaderTitle();
  const {
    enterpriseCount,
    fetchEnterpriseCount,
    discussionCount,
    fetchDiscussionCount,
  } = useEnterpriseCount();

  const [unreadMeetingCount, setUnreadMeetingCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const [assistantProfile, setAssistantProfile] = useState(() => {
    const cached = CookieService.get("assistant_profile");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return { name: "", logo: null };
      }
    }
    return { name: "", logo: null };
  });

  const role = CookieService.get("type");
  const userID = CookieService.get("user_id");

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch counts
  useEffect(() => {
    fetchEnterpriseCount();
    fetchDiscussionCount();

    const fetchUnreadMeetings = async () => {
      const token = CookieService.get("token");
      if (!token) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-all-unread-meetings-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response?.status === 200) {
          setUnreadMeetingCount(response.data.data ?? response.data.count ?? 0);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Error fetching unread meetings count:", error);
        }
      }
    };
    fetchUnreadMeetings();
  }, [location.pathname]);

  // Fetch user
  useEffect(() => {
    if (!userID) return;
    const getUser = async () => {
      const token = CookieService.get("token");
      if (!token) return;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data.data);
        setProfileImage(data.data.image);
      } catch {}
    };
    getUser();
  }, [userID, callUser]);

  // Fetch Assistant profile for sidebar
  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const response = await getAssistantProfile();
        if (response?.data) {
          const profile = {
            name: response.data.name || "TekTime",
            logo: response.data.logo,
          };
          setAssistantProfile(profile);
          CookieService.set("assistant_profile", JSON.stringify(profile));
        }
      } catch (e) {
        console.error("Failed to fetch assistant for sidebar", e);
      }
    };

    fetchAssistant();

    // Listen for updates from Assistant profile page
    const handleUpdate = () => {
      const cached = CookieService.get("assistant_profile");
      if (cached) {
        setAssistantProfile(JSON.parse(cached));
      }
    };
    window.addEventListener("assistantProfileUpdated", handleUpdate);
    return () =>
      window.removeEventListener("assistantProfileUpdated", handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      const profileLogo = sidebarRef.current?.querySelector(".profile-logo");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        (!profileLogo || !profileLogo.contains(e.target))
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth <= 992 &&
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen, setMobileOpen]);

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  const handleMenuClick = () => {
    setDropdownOpen(false);
    CookieService.set("activeTab", "tab5");
    CookieService.set("missionTab", "Schedule monitoring");
    if (window.innerWidth <= 992) {
      setMobileOpen(false);
    }
  };

  // === TOGGLE DROPDOWN ON PROFILE CLICK (FIXED) ===
  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent bubbling
    setDropdownOpen((prev) => !prev); // Always toggle based on current state
  };
  const isActive = (paths) =>
    paths.some((p) => location.pathname.startsWith(p));
  const isActiveDiscussion = isActive(["/discussion"]);

  // === TAB LOGIC (unchanged) ===
  const desiredTabOrder = [
    "subscriptions",
    "enterprises",
    "casting",
    "solutions",
    "missions",
    "moments",
    "actions",
    "discussions",
  ];

  const jobTabOrder = {
    "Project Manager / Product Owner": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Developer / Operational Contributor": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Trainer / Coach": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Customer Relations Officer / Sales Representative": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Manager / Team Leader": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Consultant / Freelance": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
    "Other / Explorer": [
      "moments",
      "actions",
      "missions",
      "solutions",
      "discussions",
    ],
  };
  const needsToTabMap = {
    casting_need: "casting",
    meeting_need: "moments",
    mission_need: "missions",
    action_need: "actions",
    solution_need: "solutions",
    discussion_need: "discussions",
  };

  const tabsToRender = useMemo(() => {
    const job = user?.job || "Other / Explorer";
    let tabs = jobTabOrder[job] || jobTabOrder["Other / Explorer"];
    const isAdmin = ["Admin", "MasterAdmin", "SuperAdmin"].includes(role);

    // Ensure admins always have 'casting' in the list to be checked/kept
    if (isAdmin && !tabs.includes("casting")) tabs.unshift("casting");

    const tabToNeedMap = {
      casting: "casting_need",
      moments: "meeting_need",
      missions: "mission_need",
      actions: "action_need",
      solutions: "solution_need",
      discussions: "discussion_need",
    };

    // Get the needs the user has explicitly selected in their profile
    const userSelectedNeeds = user?.user_needs?.map((n) => n.need) || [];

    tabs = tabs.filter((tab) => {
      const needKey = tabToNeedMap[tab];
      if (!needKey) return true; // Keep tabs not controlled by needs

      // 1. Check if allowed by Contract (Permission)
      const isAllowedByContract =
        user?.enterprise?.contract?.[needKey] === true;

      // 2. Check if selected by User (Preference)
      const isSelectedByUser = userSelectedNeeds.includes(needKey);

      // Special handling for casting tab
      if (tab === "casting") {
        // Admins see Casting if either:
        // - They selected it AND contract allows it
        // - OR they are Admin (override) - User said "casting tab will show to the ... admin" impling forced.
        //   "except casting because casting tab will show to the master admin super admin and admin"
        //   This implies force show for admins, regardless of preference/contract?
        //   Let's assume force show for admins.
        return isAdmin || (isAllowedByContract && isSelectedByUser);
      }

      // For all other needs: Must be allowed by contract AND selected by user
      return isAllowedByContract && isSelectedByUser;
    });

    return desiredTabOrder.filter((t) => tabs.includes(t));
  }, [user?.job, user?.enterprise?.contract, user?.user_needs, role]);

  const renderNavTab = (tab) => {
    const activeCls = "sidebar-menu-item-active";

    switch (tab) {
      case "casting":
        if (
          !["Admin", "MasterAdmin", "SuperAdmin"].includes(role) &&
          (role === "User" || role === "Invitee")
        )
          return null;
        return (
          <NavLink
            to="/Team"
            className={`sidebar-menu-item ${isActive(["/Team", "/ModifierTeam", "/users", "/ModifierUser"]) ? activeCls : ""}`}
            onClick={handleMenuClick}
          >
            <img
              src={
                isActive(["/Team", "/ModifierTeam", "/users", "/ModifierUser"])
                  ? "/Assets/sidebar_team_active.svg"
                  : "/Assets/sidebar_team.svg"
              }
              alt="team"
            />
            {!collapsed && (
              <span className="menu-text">{t("sidebar.teams")}</span>
            )}
          </NavLink>
        );

      case "missions":
        return (
          <NavLink
            to="/Invities"
            className={`sidebar-menu-item ${isActive(["/Invities", "/invitiesToMeeting", "/participantToAction", "/updateParticipant"]) ? activeCls : ""}`}
            onClick={handleMenuClick}
          >
            <img
              src={
                isActive([
                  "/Invities",
                  "/invitiesToMeeting",
                  "/participantToAction",
                  "/updateParticipant",
                ])
                  ? "/Assets/sidebar_active_destination.svg"
                  : "/Assets/sidebar_destination.svg"
              }
              alt="guests"
            />
            {!collapsed && (
              <span className="menu-text">{t("sidebar.guests")}</span>
            )}
          </NavLink>
        );

      case "actions":
        return (
          <NavLink
            to="/action"
            className={`sidebar-menu-item ${isActive(["/action", "/step"]) ? activeCls : ""}`}
            onClick={handleMenuClick}
          >
            <img
              src={
                isActive(["/action", "/step"])
                  ? "/Assets/sidebar-action-active.svg"
                  : "/Assets/sidebar-action.svg"
              }
              alt="action"
            />
            {!collapsed && (
              <span className="menu-text">{t("sidebar.action")}</span>
            )}
          </NavLink>
        );

      case "moments":
        return (
          <NavLink
            to="/meeting"
            className={`sidebar-menu-item ${isActive(["/meeting", "/graph", "/view", "/copy", "/Play", "/presentation", "/validateMeeting", "/meetings/drafts", "/present/invite", "/invite"]) ? activeCls : ""}`}
            style={{ position: "relative" }}
            onClick={() => {
              handleMenuClick();
              // setActiveTab("tab1"); // Default to agenda if needed
            }}
          >
            <img
              src={
                isActive([
                  "/meeting",
                  "/graph",
                  "/view",
                  "/copy",
                  "/Play",
                  "/presentation",
                  "/validateMeeting",
                  "/meetings/drafts",
                  "/present/invite",
                  "/invite",
                ])
                  ? "/Assets/sidebar_meeting_active.svg"
                  : "/Assets/sidebar_meeting.svg"
              }
              alt="meeting"
            />
            {!collapsed && (
              <span className="menu-text">{t("sidebar.meetings")}</span>
            )}
            {unreadMeetingCount > 0 && !collapsed && (
              <Badge pill bg="white" text="primary" className="meeting-badge">
                {unreadMeetingCount}
              </Badge>
            )}
          </NavLink>
        );

      case "solutions":
        if (role === "Invitee") return null;
        return (
          <NavLink
            to="/solution"
            className={`sidebar-menu-item ${isActive(["/solution"]) ? activeCls : ""}`}
            onClick={handleMenuClick}
          >
            <img
              src={
                isActive(["/solution"])
                  ? "/Assets/tektime-sidebar.svg"
                  : "/Assets/tektime-sidebar.svg"
              }
              alt="solution"
              style={{ width: 32 }}
            />
            {!collapsed && (
              <span className="menu-text">{t("sidebar.solution")}</span>
            )}
          </NavLink>
        );

      case "discussions":
        return (
          <NavLink
            to="/discussion"
            className={`sidebar-menu-item ${isActiveDiscussion ? activeCls : ""}`}
            style={{ position: "relative" }}
            onClick={handleMenuClick}
          >
            <img
              src={
                isActiveDiscussion
                  ? "/Assets/sidebar_active_discussion.svg"
                  : "/Assets/sidebar_discussion.svg"
              }
              alt="discussion"
              style={{ width: 26 }}
            />
            {!collapsed && <span className="menu-text">Discussions</span>}
            {discussionCount > 0 && !collapsed && (
              <Badge
                pill
                bg="white"
                text="primary"
                className="discussion-badge"
              >
                {discussionCount}
              </Badge>
            )}
          </NavLink>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Sider
        ref={sidebarRef}
        width={102}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background:
            "linear-gradient(177.7deg, #5882f2 -0.22%, #0fb8cb 102.69%)",
          borderRight: "none",
          height: "100vh",
          position: "fixed",
          left: mobileOpen ? 0 : window.innerWidth <= 992 ? -120 : 0,
          top: 0,
          zIndex: mobileOpen ? 1050 : 1000,
          transition: "left 0.3s ease",
          overflow: "visible",
          display: show ? "block" : "none",
        }}
        trigger={null}
      >
        {/* PROFILE + LOGO - IMPROVED SPACING & POSITIONING */}
        {/* PROFILE + LOGO - WITH SPACING BELOW */}
        <div
          className="sidebar-profile-section"
          style={{ paddingBottom: "20px", marginBottom: "24px" }}
        >
          <div
            className="profile-logo position-relative"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
            style={{ cursor: "pointer" }}
          >
            {profileImage ? (
              <img
                src={
                  profileImage.startsWith("users/")
                    ? `${Assets_URL}/${profileImage}`
                    : profileImage
                }
                alt="profile"
                className="user-img"
                style={{ objectPosition: "top" }}
              />
            ) : (
              <svg className="user-img" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
            {/* Enterprise badge */}
            <img
              src="/Assets/Avatar_company.svg"
              alt="company"
              className="company-badge"
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                width: "20px",
                height: "20px",
                border: "2px solid white",
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
        </div>

        {/* MENU */}
        <div className="sidebar-menu-container">
          <div className="sidebar-menu-centered">
            {role === "MasterAdmin" && (
              <NavLink
                to="/contract"
                className={`sidebar-menu-item ${isActive(["/contract"]) ? "sidebar-menu-item-active" : ""}`}
                onClick={() => {
                  setDropdownOpen(false);
                  handleMenuClick();
                }}
              >
                <img
                  src={
                    isActive(["/contract"])
                      ? "/Assets/sidebar_subscription_active.svg"
                      : "/Assets/sidebar_subscription.svg"
                  }
                  alt="sub"
                />
                {!collapsed && (
                  <span className="menu-text">
                    {t("sidebar.subscriptions")}
                  </span>
                )}
              </NavLink>
            )}

            {(role === "MasterAdmin" || role === "SuperAdmin") && (
              <NavLink
                to="/Enterprises"
                className={`sidebar-menu-item ${isActive(["/Enterprises"]) ? "sidebar-menu-item-active" : ""}`}
                style={{ position: "relative" }}
                onClick={() => {
                  setDropdownOpen(false);
                  handleMenuClick();
                }}
              >
                <img
                  src={
                    isActive(["/Enterprises"])
                      ? "/Assets/sidebar_enterprise_active.svg"
                      : "/Assets/sidebar_enterprise.svg"
                  }
                  alt="ent"
                />
                {!collapsed && (
                  <span className="menu-text">{t("sidebar.enterprises")}</span>
                )}
                {enterpriseCount > 0 && !collapsed && (
                  <Badge
                    pill
                    bg="white"
                    text="primary"
                    className="enterprise-badge"
                  >
                    {enterpriseCount}
                  </Badge>
                )}
              </NavLink>
            )}

            {user &&
              tabsToRender.map((tab) => (
                <React.Fragment key={tab}>{renderNavTab(tab)}</React.Fragment>
              ))}
          </div>
        </div>
      </Sider>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DROPDOWN - IMPROVED DESIGN & SPACING */}
      {dropdownOpen && (
        <div className="profile-dropdown-outside" ref={dropdownRef}>
          <div className="dropdown-arrow-up" />
          <div
            className="dropdown-item"
            onClick={() => {
              navigate("/profile");
              setDropdownOpen(false);
              if (window.innerWidth <= 992) setMobileOpen(false);
            }}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src="/Assets/sidebar_profile.svg"
              alt="profile"
              style={{ width: 20 }}
            />
            <span>{t("sidebar.profile")}</span>
          </div>

          <div
            className="dropdown-item"
            onClick={() => {
              navigate("/profile/integrations", {
                state: { from: "integration" },
              });
              setDropdownOpen(false);
              if (window.innerWidth <= 992) setMobileOpen(false);
            }}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <IoMdSync size={22} />
            <span>{t("profile.integration")}</span>
          </div>

          <div
            className="dropdown-item"
            onClick={() => {
              navigate("/profile/settings", { state: { from: "settings" } });
              setDropdownOpen(false);
              if (window.innerWidth <= 992) setMobileOpen(false);
            }}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CiSettings size={22} />
            <span>{t("profile.settings")}</span>
          </div>

          <div
            className="dropdown-item"
            onClick={() => {
              navigate("/profile/assistant", { state: { from: "assistant" } });
              setDropdownOpen(false);
              if (window.innerWidth <= 992) setMobileOpen(false);
            }}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {assistantProfile.logo ? (
              <img
                src={
                  assistantProfile.logo.startsWith("http")
                    ? assistantProfile.logo
                    : `${Assets_URL}/${assistantProfile.logo.replace(/^\//, "")}`
                }
                alt="assistant"
                className="rounded-circle object-fit-cover"
                style={{ width: 22, height: 22 }}
                onError={(e) => {
                  e.target.src = "/Assets/sidebar_profile.svg";
                }}
              />
            ) : (
              <FaRobot size={22} />
            )}
            <span>{assistantProfile.name || t("profile.assistant")}</span>
          </div>

          <div
            className="dropdown-item logout"
            onClick={handleLogout}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CiLogout />
            <span>{t("sidebar.logout")}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
