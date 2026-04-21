import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState, useRef, useMemo } from "react";
import Tab from "react-bootstrap/Tab";
import { useTranslation } from "react-i18next";
import { Modal, Nav, ProgressBar, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import moment from "moment";
import UserCard from "./UserCard";
import UserRoadmap from "./UserRoadmap";
import MembersTab from "./MembersTab";
import {
  formatDate,
  formatTime,
} from "../Meeting/GetMeeting/Helpers/functionHelper";
import { IoArrowBackSharp } from "react-icons/io5";

function EntrepriseTabs() {
  const [activeTab, setActiveTab] = useState("members");
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const { id } = useParams();
  const [showHostProfile, setShowHostProfile] = useState(false);
  const handleChangeTeamStatus = async (id) => {
    const token = CookieService.get("token");
    const currentDate = moment().format();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/teams/${id}/status`,
        { status: "closed", _method: "put" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status) {
        // getTeam();
        navigate("/Team");
        setActiveTab("Equipes archivées");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
  };
  const [team, setTeam] = useState({});

  const [loading, setLoading] = useState(false);
  const getTeam = async () => {
    const token = CookieService.get("token");
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTeam(response?.data?.team);
        setLoading(false);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    getTeam();
  }, []);

  // Detect user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [userRoadmap, setUserRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(null);
  const [progress, setProgress] = useState(0); // State for progress

 const [timeWindowOffset, setTimeWindowOffset] = useState(0);
const [dailyWeekOffset, setDailyWeekOffset] = useState(0);
const [hourlyDayOffset, setHourlyDayOffset] = useState(0); // New state for hourly view navigation
const [viewMode, setViewMode] = useState("hourly");

const { startDate, endDate, formattedStartDate, formattedEndDate } = useMemo(() => {
  const baseDate = new Date();
  let start, end;

  if (viewMode === "weekly") {
    // Weekly view: 4-week window starting from Sunday
    baseDate.setMonth(baseDate.getMonth() + timeWindowOffset);
    start = new Date(baseDate);
    start.setDate(baseDate.getDate() - baseDate.getDay()); // Set to Sunday
    end = new Date(start);
    end.setDate(start.getDate() + 27); // 4 weeks - 1 day
  } else if (viewMode === "daily") {
    // Daily view: 1-week window starting from Monday
    baseDate.setDate(baseDate.getDate() + dailyWeekOffset * 7);
    start = new Date(baseDate);
    start.setDate(baseDate.getDate() - (baseDate.getDay() || 7) + 1); // Set to Monday
    end = new Date(start);
    end.setDate(start.getDate() + 6); // Set to Sunday
  } else {
    // Hourly view: Single day
    baseDate.setDate(baseDate.getDate() + hourlyDayOffset);
    start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const format = (date) =>
    `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;

  return {
    startDate: start,
    endDate: end,
    formattedStartDate: format(start),
    formattedEndDate: format(end),
  };
}, [timeWindowOffset, dailyWeekOffset, hourlyDayOffset, viewMode]);

const getUserRoadmap = async () => {
  const token = CookieService.get("token");
  setRoadmapLoading(true);
  setProgress(0);
  
  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 90) {
        clearInterval(interval);
        return 90;
      }
      return prev + 10;
    });
  }, 200);

  const currentTime = new Date();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options = { timeZone: userTimeZone };
  const timeInUserZone = new Date(
    currentTime.toLocaleString("en-US", options)
  );

  const formattedTime = formatTime(timeInUserZone);
  const formattedDate = formatDate(timeInUserZone);

  try {
    const response = await axios.get(
      `${API_BASE_URL}/team-with-users-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}&m_start_date=${formattedStartDate}&m_end_date=${formattedEndDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.status === 200) {
      setUserRoadmap(response?.data?.data);
      setRoadmapLoading(false);
      setProgress(100);
    }
  } catch (error) {
    toast.error(t(error.response?.data?.errors[0] || error.message));
  } finally {
    setRoadmapLoading(false);
    clearInterval(interval);
    setProgress(100);
  }
};

useEffect(() => {
  getUserRoadmap();
}, [formattedStartDate, formattedEndDate]);

const handleNext = () => {
  if (viewMode === "weekly") {
    setTimeWindowOffset((prev) => prev + 1);
  } else if (viewMode === "daily") {
    setDailyWeekOffset((prev) => prev + 1);
  } else {
    setHourlyDayOffset((prev) => prev + 1);
  }
};

const handlePrevious = () => {
  if (viewMode === "weekly") {
    setTimeWindowOffset((prev) => prev - 1);
  } else if (viewMode === "daily") {
    setDailyWeekOffset((prev) => prev - 1);
  } else {
    setHourlyDayOffset((prev) => prev - 1);
  }
};

const handleReset = () => {
  setTimeWindowOffset(0);
  setDailyWeekOffset(0);
  setHourlyDayOffset(0);
};

// Add this function to handle view mode changes and reset offsets
const handleViewModeChange = (newViewMode) => {
  setViewMode(newViewMode);
  // Reset offsets when switching view modes for better UX
  if (newViewMode === "weekly") {
    setDailyWeekOffset(0);
    setHourlyDayOffset(0);
  } else if (newViewMode === "daily") {
    setTimeWindowOffset(0);
    setHourlyDayOffset(0);
  } else {
    setTimeWindowOffset(0);
    setDailyWeekOffset(0);
  }
};
  // Calculate total meetings count across all users
  const totalMeetingsCount = useMemo(() => {
    if (!userRoadmap?.users) return 0;

    return userRoadmap.users.reduce((total, user) => {
      const destinationMeetingsCount =
        user.destinations?.reduce((destTotal, destination) => {
          return destTotal + (destination.meetings?.length || 0);
        }, 0) || 0;

      return total + destinationMeetingsCount;
    }, 0);
  }, [userRoadmap]);

  return (
    <>
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="invite w-100 current_destinations clients-tab"
          style={{
            position: "static",
            backgroundColor: "white",
            padding: "10px 15px",
          }}
        >
          <div>
            <div className="row child-1 mb-5">
              <div className="col-md-6 w-100">
                <div className="title mb-1">
                  <Link to="/Team">Casting</Link>
                  <span> / </span>
                  <Link to={`/Team`}>{t("team.ourteams")}</Link>
                </div>
                <div className="invite-header align-items-start">
                  <div className="col-md-8 d-flex flex-column">
                    <h5 className="content-heading-title w-100">
                      {team?.name}

                      <span
                        className={`mx-2 badge ${
                          team?.status === "active"
                            ? "status-badge-completed"
                            : team?.status === "closed"
                            ? "status-badge-red-invite"
                            : "status-badge-inprogress"
                        }`}
                      >
                        {team?.status === "active"
                          ? t("team.teamStatus.Active")
                          : team?.status === "closed"
                          ? t("team.teamStatus.Archived")
                          : t("team.teamStatus.Pending")}
                      </span>
                    </h5>
                    <div className="d-flex align-items-center gap-2 content-body mt-3 mb-2 mt-lg-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                        />
                        <span className="fw-bold formate-date">
                          {moment(team?.created_at)
                            .tz(userTimezone)
                            .format("DD/MM/YYYY")}
                          &nbsp; {t("at")}
                        </span>
                        <span className="fw-bold formate-date">
                          {moment(team?.created_at)
                            .tz(userTimezone)
                            .format("HH[h]mm")}
                        </span>
                        <span className="fw-bold">{userTimezone}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="col-md-4 d-flex justify-content-end align-items-center gap-3"
                    style={{ height: "100%" }}
                  >
                    {/* Rejoindre la réunion */}
                    <div className="play-btn-container d-flex flex-column align-items-center gap-3">
                      <img
                        src={
                          team?.logo?.startsWith("http")
                            ? team?.logo
                            : Assets_URL + "/" + team?.logo
                        }
                        alt="client logo"
                        className="rounded-circle logo-clickable"
                        style={{
                          width: "170px",
                          height: "170px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                      />
                    </div>

                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-secondary show"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "0px",
                        }}
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth={0}
                          viewBox="0 0 24 24"
                          color="black"
                          height="25px"
                          width="25px"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ color: "black" }}
                        >
                          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="left-start"
                        style={{
                          position: "absolute",
                          inset: "0px 0px auto auto",
                          margin: "0px",
                          transform: "translate(-51px, 25px)",
                        }}
                      >
                        <li style={{ cursor: "pointer" }}>
                          <Link
                            to={`/ModifierTeam/${team?.id}`}
                            className="dropdown-item"
                          >
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="Edit">
                                <g>
                                  <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z" />
                                  <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z" />
                                </g>
                              </g>
                            </svg>
                            &nbsp;{t("user.modify")}
                          </Link>
                        </li>
                        <li
                          style={{ cursor: "pointer" }}
                          onClick={() => handleChangeTeamStatus(id)}
                        >
                          <a className="dropdown-item">
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z" />
                            </svg>
                            &nbsp; {t("user.Deactivate")}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------TABS-------------------------------- */}

            {/* <div className="cards-section child-2">
              <div style={{ marginTop: "4rem" }}>
                <h4 className="participant-heading-meeting">
                  {showHostProfile && (
                    <IoArrowBackSharp
                      onClick={() => setShowHostProfile(false)}
                      size={25}
                      style={{
                        cursor: "pointer",
                        marginRight: "1rem",
                      }}
                    />
                  )}
                  Leader
                </h4>
                <div
                  className="host"
                  style={{ background: showHostProfile && "white" }}
                >
                  <UserCard
                    user={team?.created_by}
                    showHostProfile={showHostProfile}
                    setShowHostProfile={setShowHostProfile}
                  />
                </div>
              </div>
            </div>
            <br /> */}
            <Tab.Container
              className="destination-tabs-container"
              activeKey={activeTab}
              onSelect={(key) => {
                setActiveTab(key);
              }}
            >
              <div className="row align-items-center tabs-header custom-tabs">
                {/* Tabs Column (9) */}
                <div className="col-md-10">
                  <Nav variant="tabs" className="d-flex flex-wrap">
                     <Nav.Item key="members" className="tab">
                      <Nav.Link eventKey="members" className="custom-tab-link">
                        {t("Members")}
                        <span className="ms-2">
                          {team?.users?.length + team?.contacts?.length || 0}
                          {/* {client.contacts?.length || 0} */}
                        </span>
                      </Nav.Link>
                    </Nav.Item>
                    {/* Contacts tab - ALWAYS include this */}
                    <Nav.Item key="planning" className="tab">
                      <Nav.Link eventKey="planning" className="custom-tab-link">
                        {t("Planning")}
                        <span className="ms-2">{totalMeetingsCount || 0}</span>
                      </Nav.Link>
                    </Nav.Item>
                   
                  </Nav>
                </div>
                <div className="col-md-2 d-flex justify-content-end"></div>
              </div>
              <Tab.Content className="mt-3">
                <Tab.Pane eventKey="planning">
                  <div className="row d-flex justify-content-center">
                    <div
                      className="col-md-12 mb-3 position-relative"
                      style={{ minHeight: "300px" }}
                    >
                      {roadmapLoading && (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <div style={{ width: "50%" }}>
                            <ProgressBar now={progress} animated />
                          </div>
                        </div>
                      )}
                      <UserRoadmap
                        data={userRoadmap}
                        isLoading={roadmapLoading}
                        startDate={startDate}
                        endDate={endDate}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onReset={handleReset}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        setDailyWeekOffset={setDailyWeekOffset}
                        dailyWeekOffset={dailyWeekOffset}
                      />
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="members">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      <MembersTab team={team} refresh={getTeam} />
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      )}
    </>
  );
}

export default EntrepriseTabs;
