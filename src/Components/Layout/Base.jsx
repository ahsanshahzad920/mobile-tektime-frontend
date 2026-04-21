import React, { useEffect } from "react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

function Base(props) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const params = useParams();
  const location = useLocation();

  // Extract meeting_id and step_id

  // let fromMeeting = false;
  // if (location?.state?.from === "meeting") {
  //   fromMeeting = true;
  // }

  // Regular expression pattern to match the different variations of '/destination'
  const destinationRegex = /\/dest(i?n\u0301?)/i;
  // URLs where the sidebar should be hidden
  const hiddenSidebarPaths = [
    "/ContractLinkEnterprises",
    "/ContractToTeam",
    "/ContractToUser",
    "/EntreprisesToTeam",
    "/EntreprisesToUsers",
    "/view",
    "/PlayMeeting",
    `/play/${params?.id}`,
    // `/play/${params?.id}/${params?.step_id}`,
    // "/users",
    "/ModifierUser",
    "/updateMeeting",
    "/copyMeeting",
    "/participantToAction",
    "/calculate",
    // `/invite/${params.id}`,
    "/destination",
    "/destiination",
    "/desti%CC%81nation",
    "/heroes",
    "/newsletter/terms-and-conditions",
  ];

  // Determine if the current URL matches any in the hiddenSidebarPaths array
  const shouldHideSidebar = hiddenSidebarPaths.some((path) =>
    window.location.href.includes(path),
  );

  // Determine if sidebar should be hidden, but keep it visible for `action/play/:meeting_id/:step_id`
  //  const shouldHideSidebar = !isPlayRoute && hiddenSidebarPaths.some((path) => location.pathname.includes(path));

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Clear search when route changes
  useEffect(() => {
    setSearchTerm("");
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <div
        className="sidebar-container"
        style={{
          display: !shouldHideSidebar ? "block" : "none",
        }}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isAuthenticated={props.isAuthenticated}
          onLogin={props.onLogin}
          onLogout={props.onLogout}
          onRemove={props.onRemove}
        />
      </div>
      <div
        className={`main-content ${isSidebarOpen ? "" : "closed-sidebar"} ${
          window?.location?.href?.includes(`/play/${params?.id}`) ||
          window.location.href.includes("/destination")
            ? "mr-link"
            : ""
        }`}
      >
        <Header
          onLogout={props.onLogout}
          isAuthenticated={props.isAuthenticated}
          onLogin={props.onLogin}
          onRemove={props.onRemove}
          onSearch={handleSearch}
        />
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </div>
    </div>
  );
}

export default Base;
