import CookieService from "../../Utils/CookieService";
import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMeetings } from "../../../context/MeetingsContext";
import CustomEvent, { EventTooltipContent } from "./CustomeEvent";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import {
  formatDate,
  formatTime,
  userTimeZone,
} from "./GetMeeting/Helpers/functionHelper";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { abortMeetingTime } from "../../Utils/MeetingFunctions";
import { ProgressBar } from "react-bootstrap";
import {
  Tooltip,
  Switch,
  Card,
  Row,
  Col,
  Space,
  Button as AntButton,
  Typography,
  Badge,
  Dropdown,
  Menu,
} from "antd";
import {
  SettingOutlined,
  SyncOutlined,
  PlusOutlined,
  UserAddOutlined,
  GoogleOutlined,
  WindowsOutlined,
} from "@ant-design/icons";
import CustomToolbar from "./CustomToolbar";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { toast } from "react-toastify";
const { Text, Title } = Typography;

// Detect mobile screens (≤ 768 px)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false,
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
};

const EventWrapper = ({ children }) => {
  return <div style={{ marginBottom: "2px", width: "100%" }}>{children}</div>;
};

const CustomDateHeader = ({ label, date, localizer }) => {
  return <div>{moment(date).format("ddd D MMM")}</div>;
};

// Day view date header
const DayDateHeader = ({ label, date }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "600",
      }}
    >
      {moment(date).format("dddd, MMMM D, YYYY")}
    </div>
  );
};

const MonthEvent = ({ event }) => {
  return (
    <div
      style={{
        fontSize: "12px",
        padding: "2px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {event.title}
    </div>
  );
};

const MonthDateHeader = ({ label, date, localizer }) => {
  return (
    <div style={{ textAlign: "center", padding: "5px" }}>
      {/* {moment(date).format("D")} */}
    </div>
  );
};

const ReactBigCalendar = ({ quickMomentForm }) => {
  const { updateLanguage } = useDraftMeetings();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [myEventsList, setMyEventsList] = useState([]);
  const [overlappingSlots, setOverlappingSlots] = useState(new Set());
  const {
    googleLoginAndSaveProfileScheduled,
    setFormState,
    setMeeting,
    googleLoginCalled,
    open,
  } = useFormContext();
  const {
    setOffset,
    setAgendaEventOffset,
    selectedAgenda,
    setSelectedAgenda,
    setAgendaCount,
  } = useMeetings();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState(
    isMobile ? Views.DAY : Views.WEEK,
  );
  const [currentStartDate, setCurrentStartDate] = useState(
    isMobile ? moment().startOf("day").toDate() : moment().startOf("week").toDate(),
  );

  // Small screens ke liye default view DAY set karein
  const { setUser, user, callUser, setCallUser } = useHeaderTitle();
  const { language } = useDraftMeetings();
  const popupRef = useRef(null);
  const popupCheckRef = useRef(null);
  const [stateToken, setStateToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    moment.locale(language);
  }, [language]);

  const localizer = momentLocalizer(moment);

  const [btnDisable, setBtnDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [firstTime, setFirstTime] = useState(true);
  const [closedProgress, setClosedProgress] = useState(0);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const { searchTerm, setSearchTerm } = useOutletContext();
  const [syncAgenda, setSyncAgenda] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);
  const [earliestHour, setEarliestHour] = useState(9);
  const [latestHour, setLatestHour] = useState(17);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvents(myEventsList);
    } else {
      const filtered = myEventsList.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, myEventsList]);

  // useEffect(() => {
  //   const currentDate = new Date();
  //   const startOfWeek = new Date(currentDate);
  //   startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  //   startOfWeek.setHours(0, 0, 0, 0);

  //   const endOfWeek = new Date(currentDate);
  //   endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
  //   endOfWeek.setHours(23, 59, 59, 999);

  //   setMin(startOfWeek);
  //   setMax(endOfWeek);
  // }, []);

  const formatDateForApi = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getEmptyFormState = () => ({
    selectedOption: null,
    title: null,
    date: null,
    start_time: null,
    description: null,
    type: null,
    priority: null,
    alarm: false,
    feedback: false,
    remainder: false,
    autostart: false,
    playback: "Manual",
    prise_de_notes: "Manual",
    note_taker: false,
    objective: null,
    casting_type: "Invitation",
    participants: [],
    id: null,
    repetition: false,
    repetition_number: 1,
    repetition_frequency: "Daily",
    repetition_end_date: null,
    selected_days: [],
    teams: [],
    steps: [],
    moment_privacy: "participant only",
    moment_privacy_teams: [],
    moment_password: null,
    location: null,
    agenda: null,
    address: null,
    room_details: null,
    phone: null,
    share_by: null,
    price: null,
    max_participants_register: 0,
    casting_tab: null,
    solution_id: null,
    solution_tab: "use a template",
    client: null,
    client_id: null,
    destination: null,
    destination_id: null,
    destination_type: null,
  });

  const outlookLoginAndSaveProfile = async () => {
    try {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        `${process.env.REACT_APP_API_BASE_URL}/outlook-login?user_id=${CookieService.get(
          "user_id",
        )}`,
        "Outlook Login",
        `width=${width},height=${height},top=${top},left=${left}`,
      );
      if (!popup) {
        toast.error("Popup was blocked. Please allow popups for this site.");
        return;
      }

      const messageHandler = async (event) => {
        console.log("Received message event:", event);

        if (event.origin !== process.env.REACT_APP_API_BASE_URL) {
          console.warn("⚠️ Ignored message from unknown origin:", event.origin);
          return;
        }
        const { type, data } = event.data || {};

        if (type === "outlook-login-success") {
          console.log("✅ Outlook login success:", data);

          window.removeEventListener("message", messageHandler);
          clearInterval(interval);

          if (!popup.closed) popup.close();

          try {
            await onOutlookLoginSuccess();
          } catch (err) {
            console.error("Error processing Outlook login:", err);
            toast.error("Failed to complete Outlook login.");
          }
        } else if (type === "outlook-login-failed") {
          console.warn("⚠️ Outlook login failed:", data);
          toast.error("Outlook login failed.");
          window.removeEventListener("message", messageHandler);
          clearInterval(interval);
          if (!popup.closed) popup.close();
        }
      };

      window.addEventListener("message", messageHandler);

      const interval = setInterval(() => {
        if (popup.closed) {
          console.log("Popup closed by user.");
          clearInterval(interval);
          window.removeEventListener("message", messageHandler);
        }
      }, 500);
    } catch (error) {
      console.error("Unexpected error during Outlook login:", error);
      toast.error("Something went wrong during Outlook login.");
    }
  };

  const userid = parseInt(CookieService.get("user_id"));

  const getCompletedMeetings = async (startDate, forceSync = false) => {
    const token = CookieService.get("token");
    if (!token) return;
    let response;
    setBtnDisable(true);
    setLoading(true);
    if (!quickMomentForm) {
      setFormState(getEmptyFormState());
      setMeeting(null);
    }
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );
    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    try {
      const start = new Date(startDate);
      const end = new Date(start);

      if (currentView === Views.WEEK) {
        end.setDate(start.getDate() + 6);
      } else if (currentView === Views.MONTH) {
        end.setMonth(start.getMonth() + 1);
      } else if (currentView === Views.DAY) {
        // For day view, set end to same day
        end.setDate(start.getDate());
      }

      const startDateStr = formatDateForApi(start);
      const endDateStr = formatDateForApi(end);
      const shouldSync = forceSync || syncAgenda;
      let meetings = [];

      if (
        selectedAgenda.tektime &&
        selectedAgenda.google &&
        selectedAgenda.outlook
      ) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-google-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime && selectedAgenda.google) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-google-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime && selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.google && selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/google-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.google) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/google-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${shouldSync}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      }

      if (response?.status === 200) {
        meetings = response?.data?.meetings || response?.data?.data || [];
        const transformedMeetings = meetings.map((meeting) => {
          const transformedMeeting = transformMeetingToEvent(meeting);
          return transformedMeeting;
        });
        const filteredMeetings = transformedMeetings.filter(
          (meeting) => meeting !== null,
        );

        const sortedMeetings = filteredMeetings.sort(
          (a, b) => new Date(a.start) - new Date(b.start),
        );

        if (
          sortedMeetings.length > 0 &&
          (currentView === Views.WEEK || currentView === Views.DAY)
        ) {
          const earliestMeeting = sortedMeetings[0];
          const latestMeeting = sortedMeetings[sortedMeetings.length - 1];

          const minTime = new Date(earliestMeeting.start);
          const maxTime = new Date(latestMeeting.end);
          setMin(minTime);
          setMax(maxTime);
        }

        if (
          filteredMeetings.length > 0 &&
          (currentView === Views.WEEK || currentView === Views.DAY)
        ) {
          let earliestHr = 24;
          let latestHr = 0;

          const viewStart = new Date(startDate);
          const viewEnd = new Date(viewStart);

          if (currentView === Views.DAY) {
            viewEnd.setDate(viewStart.getDate() + 1);
          } else {
            viewEnd.setDate(viewStart.getDate() + 7);
          }

          filteredMeetings.forEach((meeting) => {
            const start = new Date(meeting.start);
            const end = new Date(meeting.end);

            if (
              start >= viewStart &&
              end <= viewEnd &&
              start.toDateString() === end.toDateString()
            ) {
              const startHour = start.getHours();
              const endHour = end.getHours();

              earliestHr = Math.min(earliestHr, startHour);
              latestHr = Math.max(latestHr, endHour);
            }
          });

          if (earliestHr !== 24) setEarliestHour(earliestHr);
          if (latestHr !== 0) setLatestHour(latestHr);
        }

        setOverlappingSlots(getOverlappingSlots(filteredMeetings, 15));
        setAgendaCount(filteredMeetings.length);
        setMyEventsList(filteredMeetings);

        setClosedProgress(100);
        setFirstTime(false);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);

      const getErrorMessage = (err) => {
        if (err.response?.data?.message) return err.response.data.message;
        if (err.response?.data?.error) return err.response.data.error;
        if (err.message) return err.message;
        return "An unexpected error occurred";
      };

      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setBtnDisable(false);
      setSyncAgenda(false);
    }
  };

  const renderAgendaDropdown = () => (
    <Card
      className="shadow-lg border"
      style={{ width: 300, zIndex: 1050 }}
      bodyStyle={{ padding: "12px" }}
    >
      <Space direction="vertical" className="w-100" size="large">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Title level={5} className="m-0">
            {t("meeting.agenda.settings")}
          </Title>
          {user?.email_links?.some(
            (i) => i.platform === "Gmail" || i.platform === "Outlook",
          ) && (
            <Tooltip title={t("refresh")}>
              <AntButton
                type="text"
                icon={<SyncOutlined spin={loading} />}
                onClick={handleRefreshSync}
                loading={loading}
                disabled={btnDisable}
              />
            </Tooltip>
          )}
        </div>

        {/* Tektime Agenda */}
        <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light bg-opacity-10">
          <Space>
            <img src="/Assets/Tek.png" alt="tektime" width={20} height={20} />
            <Text strong>Tektime</Text>
          </Space>
          <Switch
            size="small"
            checked={selectedAgenda.tektime}
            onChange={() => toggleAgenda("tektime")}
          />
        </div>

        {/* Google Agenda */}
        <div className="p-2 border rounded bg-light bg-opacity-10">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <Space>
              <svg
                width="18"
                height="18"
                viewBox="0 0 512 512"
                style={{ verticalAlign: "middle" }}
              >
                <rect width="512" height="512" rx="15%" fill="#ffffff" />
                <path
                  d="M100 340h74V174H340v-74H137Q100 100 100 135"
                  fill="#4285f4"
                />
                <path d="M338 100v76h74v-41q0-35-35-35" fill="#1967d2" />
                <path d="M338 174h74V338h-74" fill="#fbbc04" />
                <path d="M100 338v39q0 35 35 35h41v-74" fill="#188038" />
                <path d="M174 338H338v74H174" fill="#34a853" />
                <path d="M338 412v-74h74" fill="#ea4335" />
              </svg>
              <Text strong>Google</Text>
            </Space>
            {user?.email_links?.some((item) => item?.platform === "Gmail") ? (
              <Switch
                size="small"
                checked={selectedAgenda.google}
                onChange={() => toggleAgenda("google")}
              />
            ) : (
              <AntButton
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={loginGoogleAndSaveProfileData}
              >
                {t("Connect")}
              </AntButton>
            )}
          </div>
          {user?.email_links?.some((item) => item?.platform === "Gmail") && (
            <Text
              type="secondary"
              style={{ fontSize: "11px" }}
              className="d-block text-truncate"
            >
              {user.email_links.find((i) => i.platform === "Gmail")?.value}
            </Text>
          )}
        </div>

        {/* Outlook Agenda */}
        <div className="p-2 border rounded bg-light bg-opacity-10">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <Space>
              <PiMicrosoftOutlookLogoFill color="#0078D4" />
              <Text strong>Outlook</Text>
            </Space>
            {user?.email_links?.some((item) => item?.platform === "Outlook") ? (
              <Switch
                size="small"
                checked={selectedAgenda.outlook}
                onChange={() => toggleAgenda("outlook")}
              />
            ) : (
              <AntButton
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={loginOutlookAndSaveProfileData}
                disabled={isLoading}
              >
                {t("Connect")}
              </AntButton>
            )}
          </div>
          {user?.email_links?.some((item) => item?.platform === "Outlook") && (
            <Text
              type="secondary"
              style={{ fontSize: "11px" }}
              className="d-block text-truncate"
            >
              {user.email_links.find((i) => i.platform === "Outlook")?.value}
            </Text>
          )}
        </div>

        {user?.email_links?.some(
          (i) => i.platform === "Gmail" || i.platform === "Outlook",
        ) && (
          <AntButton
            type="primary"
            block
            icon={<SyncOutlined />}
            onClick={handleRefreshSync}
            loading={loading}
            disabled={btnDisable}
          >
            {t("refresh")}
          </AntButton>
        )}
      </Space>
    </Card>
  );

  const handleRefreshSync = async () => {
    setSyncAgenda(true);
    setLoading(true);
    setBtnDisable(true);

    try {
      await getCompletedMeetings(currentStartDate, true);
    } finally {
      setLoading(false);
      setBtnDisable(false);
    }
  };

  // Consolidated into the agenda fetching effect

  const onOutlookLoginSuccess = async () => {
    try {
      const userId = CookieService.get("user_id");
      const token = CookieService.get("token");

      if (!userId || !token) {
        toast.error("User session not found.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data;
      console.log("✅ User data fetched after Outlook login:", data);

      if (!data) {
        toast.error("User data not found.");
        return;
      }

      const { mail, displayName } = data?.outlook_user_info || {};
      if (!mail || !displayName) {
        toast.error("Incomplete Outlook user information.");
        return;
      }

      const updatedUser = {
        ...user,
        integration_links: [
          ...user.integration_links.filter(
            (link) => link.platform !== "Outlook Agenda",
          ),
          { platform: "Outlook Agenda", value: displayName },
        ],
        visioconference_links: [
          ...user.visioconference_links.filter(
            (link) => link.platform !== "Microsoft Teams",
          ),
          { platform: "Microsoft Teams", value: displayName },
        ],
        email_links: [
          ...user.email_links.filter((link) => link.platform !== "Outlook"),
          { platform: "Outlook", value: mail },
        ],
      };
      setUser(updatedUser);

      const formData = new FormData();

      formData.append("_method", "PUT");
      formData.append("title", user?.title || "");
      formData.append("name", user?.name || "");
      formData.append("last_name", user?.last_name || "");
      formData.append("email", user?.email || "");
      formData.append("phoneNumber", user?.phoneNumber || "");
      formData.append("enterprise_id", user?.enterprise?.id || "");
      formData.append("bio", user?.bio || "");
      formData.append("post", user?.post || "");
      formData.append("role_id", user?.role_id || "");
      formData.append("timezone", userTimeZone || "Europe/Paris");
      formData.append("visibility", user?.visibility || "public");

      user?.social_links?.forEach((link, index) => {
        if (link.id) {
          formData.append(`social_links[${index}][id]`, link.id);
        }
        formData.append(`social_links[${index}][platform]`, link.platform);
        formData.append(`social_links[${index}][link]`, link.link);
      });

      user?.websites?.forEach((site, index) => {
        if (site.id) {
          formData.append(`websites[${index}][id]`, site.id);
        }
        formData.append(`websites[${index}][title]`, site.title);
        formData.append(`websites[${index}][link]`, site.link);
      });

      user?.affiliation_links?.forEach((site, index) => {
        if (site.id) {
          formData.append(`affiliation_links[${index}][id]`, site.id);
        }
        formData.append(`affiliation_links[${index}][title]`, site.title);
        formData.append(`affiliation_links[${index}][link]`, site.link);
      });

      updatedUser.integration_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`integration_links[${index}][id]`, link.id);
        }
        formData.append(`integration_links[${index}][platform]`, link.platform);
        formData.append(`integration_links[${index}][value]`, link.value);
      });

      updatedUser.visioconference_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`visioconference_links[${index}][id]`, link.id);
        }
        formData.append(
          `visioconference_links[${index}][platform]`,
          link.platform,
        );
        formData.append(`visioconference_links[${index}][value]`, link.value);
      });

      updatedUser.email_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`email_links[${index}][id]`, link.id);
        }
        formData.append(`email_links[${index}][platform]`, link.platform);
        formData.append(`email_links[${index}][value]`, link.value);
      });

      user?.teams?.forEach((team) => {
        formData.append("team_id[]", team.id);
      });

      if (user?.image?.startsWith("data:image/")) {
        const blob = await (await fetch(user.image)).blob();
        formData.append("image", blob, "profile-image.jpg");
      } else if (user?.image) {
        formData.append("image", user.image);
      }

      if (user?.profile_banner?.startsWith("data:image/")) {
        const blob = await (await fetch(user.profile_banner)).blob();
        formData.append("profile_banner", blob, "profile-banner.jpg");
      } else if (user?.profile_banner) {
        formData.append("profile_banner", user.profile_banner);
      }

      if (user?.video?.startsWith("blob:")) {
        const blob = await (await fetch(user.video)).blob();
        formData.append("video", blob, "video-preview.mp4");
      } else if (user?.video) {
        formData.append("video", user.video);
      }

      const profileResponse = await fetch(`${API_BASE_URL}/users/${userid}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(
          `Failed to update user profile: ${profileResponse.status}`,
        );
      }

      const responseData = await profileResponse.json();
      setUser(responseData?.data?.data || updatedUser);
      setCallUser((prev) => !prev);
      getUser();
      handleRefreshSync();
      sessionStorage.setItem(
        "outlook_access_token",
        data?.outlook_access_token,
      );
      sessionStorage.setItem(
        "outlook_refresh_token",
        data?.outlook_refresh_token,
      );
      CookieService.set("outlook_access_token", data?.outlook_access_token);
      CookieService.set("outlook_refresh_token", data?.outlook_refresh_token);
    } catch (error) {
      console.error("❌ Error fetching user data after Outlook login:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch Outlook data.",
      );
    }
  };

  const minTime = useMemo(() => {
    const date = new Date();
    const earliest =
      Number.isInteger(earliestHour) && earliestHour >= 0 && earliestHour <= 23
        ? earliestHour
        : 9;

    date.setHours(earliest, 0, 0, 0);
    return date;
  }, [earliestHour]);

  const maxTime = useMemo(() => {
    const date = new Date();
    let latest =
      Number.isInteger(latestHour) && latestHour >= 0 && latestHour <= 23
        ? latestHour
        : 17;

    if (earliestHour != null && latest <= earliestHour) {
      latest = earliestHour + 1;
      if (latest > 23) latest = 23;
    }

    date.setHours(latest, 59, 59, 999);
    return date;
  }, [latestHour, earliestHour]);

  useEffect(() => {
    if (selectedAgenda) {
      getCompletedMeetings(currentStartDate, false);
    }
  }, [currentStartDate, selectedAgenda, currentView, callUser]);

  const getFormattedAbortDateTime = (abortDateTime, timezone) => {
    const userTimezone = moment.tz.guess();
    return moment
      .tz(abortDateTime, "YYYY-MM-DD HH:mm:ss", timezone || "UTC")
      .tz(userTimezone)
      .toDate();
  };

  const transformMeetingToEvent = (meeting) => {
    if (
      ![
        "active",
        "closed",
        "abort",
        "in_progress",
        "to_finish",
        "todo",
      ].includes(meeting.status)
    ) {
      return null;
    }

    let start, end;
    const userTimezone = moment.tz.guess();
    const meetingTimezone = meeting?.timezone || "UTC";
    if (meeting.status === "abort") {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.starts_at}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone,
        )
        .tz(userTimezone)
        .toDate();
      end = getFormattedAbortDateTime(
        meeting?.abort_end_time,
        meeting?.timezone,
      );
    } else if (
      meeting.status === "closed" ||
      meeting.status === "in_progress" ||
      meeting?.status === "to_finish" ||
      meeting?.status === "todo"
    ) {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.starts_at}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone,
        )
        .tz(userTimezone)
        .toDate();

      const estimateDate =
        meeting.estimate_time?.split("T")[0] ||
        meeting.estimate_time?.split(" ")[0];
      const estimateTime =
        meeting.estimate_time?.split("T")[1] ||
        meeting.estimate_time?.split(" ")[1] ||
        "00:00:00";
      end = moment
        .tz(
          `${estimateDate} ${estimateTime}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone,
        )
        .tz(userTimezone)
        .toDate();
    } else {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.start_time}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone,
        )
        .tz(userTimezone)
        .toDate();
      const estimateDate =
        meeting.estimate_time?.split("T")[0] ||
        meeting.estimate_time?.split(" ")[0];
      const estimateTime =
        meeting.estimate_time?.split("T")[1] ||
        meeting.estimate_time?.split(" ")[1] ||
        "00:00:00";
      end = moment
        .tz(
          `${estimateDate} ${estimateTime}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone,
        )
        .tz(userTimezone)
        .toDate();
    }

    return {
      id: meeting.id,
      title: meeting.title,
      start: start,
      end: end,
      allDay: false,
      resource: meeting,
      steps: meeting?.steps,
    };
  };

  const eventPropGetter = (event) => {
    const status = event?.resource?.status;
    const timezone = event?.resource?.timezone || "Europe/Paris";
    const now = moment().utcOffset(timezone);
    const isPast = moment(event.end).isBefore(now) && status !== "in_progress";

    let borderColor = "#ccc";
    let borderWidth = "2px";
    let backgroundColor = "#fff";
    let zIndex = 1;

    const isSelected = selectedEvent && selectedEvent?.id === event.id;

    if (isSelected) {
      backgroundColor = "#f0f7ff";
      borderColor = "#0066cc";
      borderWidth = "3px";
    } else if (status === "active") {
      const meetingDateTime = moment(
        `${event?.resource?.date}T${event?.resource?.start_time}`,
      ).utcOffset(timezone);
      const isFutureMeeting = meetingDateTime?.isAfter(now);

      borderColor = isFutureMeeting ? "rgb(91, 170, 234)" : "red";
      borderWidth = "5px";
    } else if (status === "in_progress") {
      borderColor = "yellow";
      borderWidth = "5px";
    } else if (status === "to_finish") {
      borderColor = "#ff9800";
      borderWidth = "5px";
    } else if (status === "todo") {
      borderColor = "#6c757d";
      borderWidth = "5px";
    } else if (status === "closed") {
      borderColor = "rgb(119, 214, 113)";
      borderWidth = "5px";
    } else if (status === "abort") {
      borderColor = "rgb(119, 19, 241)";
      borderWidth = "5px";
    }

    return {
      style: {
        borderLeft: `${borderWidth} solid ${borderColor}`,
        backgroundColor: backgroundColor,
        paddingLeft: "8px",
        borderRadius: "4px",
        color: "#000000",
        opacity: 1,
        boxShadow: isSelected ? "0 0 5px rgba(0, 102, 204, 0.5)" : "none",
        zIndex: zIndex,
      },
    };
  };

  const getOverlappingSlots = (events, step = 15) => {
    const overlaps = new Set();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        const start1 = moment(e1.start);
        const end1 = moment(e1.end);
        const start2 = moment(e2.start);
        const end2 = moment(e2.end);

        if (start1.isBefore(end2) && start2.isBefore(end1)) {
          const overlapStart = moment.max(start1, start2).startOf("minute");
          const overlapEnd = moment.min(end1, end2).startOf("minute");

          let current = overlapStart.clone();
          while (current < overlapEnd) {
            overlaps.add(current.format("HH:mm"));
            current.add(step, "minutes");
          }
        }
      }
    }

    return overlaps;
  };

  const CustomGutter = ({ date }) => {
    const timeLabel = moment(date).format("HH:mm");
    const isVisible = overlappingSlots.has(timeLabel);
    return (
      <div
        style={{
          height: "100%",
          visibility: isVisible ? "visible" : "hidden",
          display: isVisible ? "block" : "none",
        }}
      >
        {timeLabel}
      </div>
    );
  };

  const toggleAgenda = (type) => {
    setOffset(0);
    setAgendaEventOffset(0);
    setSelectedAgenda((prev) => {
      const newState = { ...prev };

      if (type === "tektime") {
        if (prev.tektime && !prev.google && !prev.outlook) return prev;
        newState.tektime = !prev.tektime;
      } else if (type === "google") {
        if (prev.google && !prev.tektime && !prev.outlook) return prev;
        newState.google = !prev.google;
      } else if (type === "outlook") {
        if (prev.outlook && !prev.tektime && !prev.google) return prev;
        newState.outlook = !prev.outlook;
      }

      return newState;
    });
  };

  const loginGoogleAndSaveProfileData = async () => {
    await googleLoginAndSaveProfileScheduled();
  };

  const loginOutlookAndSaveProfileData = async () => {
    await outlookLoginAndSaveProfile();
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (
      event?.resource?.status === "active" ||
      event?.resource?.status === "in_progress" ||
      event?.resource?.status === "to_finish" ||
      event?.resource?.status === "todo"
    ) {
      navigate(`/invite/${event?.resource?.id}`, {
        state: { from: "meeting" },
      });
    } else {
      navigate(`/present/invite/${event?.resource?.id}`, {
        state: { from: "meeting" },
      });
    }
  };

  const handleCalendarClick = () => {
    setSelectedEvent(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);

    if (view === Views.DAY) {
      setCurrentStartDate(moment().startOf("day").toDate());
    } else if (view === Views.WEEK) {
      setCurrentStartDate(moment().startOf("week").toDate());
    } else {
      setCurrentStartDate(moment().startOf("month").toDate());
    }
  };

  const statuses = [
    { name: t("calendar.status1"), color: "rgb(119 214 113)" },
    { name: t("calendar.status2"), color: "yellow" },
    { name: t("calendar.status3"), color: "red" },
    { name: t("calendar.status4"), color: "rgb(119 19 241)" },
    { name: t("calendar.status5"), color: "rgb(91 170 234)" },
    { name: t("calendar.status6"), color: "rgb(255, 152, 0)" },
    { name: t("calendar.status7"), color: "rgb(108, 117, 125)" },
  ];

  const userID = CookieService.get("user_id");

  const getUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status === 200) {
        setUser(response?.data?.data);
      }
    } catch (error) {
      console.error(error?.message);
    }
  };

  useEffect(() => {
    getUser();
  }, [callUser]);

  useEffect(() => {
    return () => {
      if (popupCheckRef.current) {
        clearInterval(popupCheckRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  const [showMoreModal, setShowMoreModal] = useState({
    open: false,
    events: [],
    date: new Date(),
  });

  return (
    <div className={`myCustomHeight ${loading ? "screen-blur" : ""}`}>
      {loading && (
        <div className="progress-overlay" style={{ background: "transparent" }}>
          <div style={{ width: "50%" }}>
            <ProgressBar now={closedProgress} animated />
          </div>
        </div>
      )}

      {/* Agenda Management Section */}
      {!isMobile ? (
        <Row className="mb-4" justify="end">
          <Col>
            <Dropdown trigger={["click"]} dropdownRender={renderAgendaDropdown}>
              <AntButton
                type="primary"
                size="large"
                icon={<SettingOutlined />}
                className="d-flex align-items-center shadow-sm"
                style={{ borderRadius: "8px" }}
              >
                {t("meeting.agenda.manage")}
              </AntButton>
            </Dropdown>
          </Col>
        </Row>
      ) : (
        document.getElementById("mobile-agenda-settings-portal") &&
        ReactDOM.createPortal(
          <Dropdown
            trigger={["click"]}
            dropdownRender={renderAgendaDropdown}
            placement="bottomRight"
          >
            <AntButton
              type="primary"
              icon={<SettingOutlined />}
              className="d-flex align-items-center justify-content-center shadow-sm"
              style={{ borderRadius: "8px", width: "38px", height: "38px" }}
            />
          </Dropdown>,
          document.getElementById("mobile-agenda-settings-portal"),
        )
      )}

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={filteredEvents}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        defaultView={isMobile ? Views.DAY : Views.WEEK} // Default view mobile ke hisab se
        view={currentView}
        onView={handleViewChange}
        showAllDayEvents={false}
        onNavigate={(date) => setCurrentStartDate(date)}
        allDayAccessor={null}
        toolbar={true}
        tooltipAccessor={() => null}
        popup={true}
        onShowMore={(events, date) => {
          setSelectedEvent(null);
          const eventTitles = events.map((e) => e.title).join("\n");
          alert(
            `Events on ${moment(date).format(
              "MMMM D, YYYY",
            )}:\n\n${eventTitles}`,
          );
        }}
        allDaySlot={true}
        components={{
          day: {
            header: DayDateHeader,
            event: CustomEvent,
          },
          week: {
            header: CustomDateHeader,
            event: CustomEvent,
            timeGutterHeader: CustomGutter,
          },
          month: {
            event: MonthEvent,
            dateHeader: MonthDateHeader,
            showMore: ({ events, date }) => {
              if (!isMobile) {
                return (
                  <div
                    style={{
                      background: "white",
                      border: "1px solid #ddd",
                      padding: "8px",
                      borderRadius: "4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 1000,
                    }}
                  >
                    {/* <strong
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                      }}
                    >
                      {moment(date).format("D MMM YYYY")}
                    </strong> */}
                    {events.map((event, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectEvent(event)}
                        style={{
                          padding: "4px 0",
                          fontSize: "12px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          borderBottom:
                            idx < events.length - 1 ? "1px solid #eee" : "none",
                        }}
                      >
                        <EventTooltipContent event={event} />
                      </div>
                    ))}
                  </div>
                );
              }

              const moreCount = events.length;

              return (
                <button
                  type="button"
                  aria-label={`Show ${moreCount} more events on ${moment(
                    date,
                  ).format("D MMM YYYY")}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreModal({ open: true, events, date });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #0066cc, #004499)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "13px",
                    lineHeight: "1",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "10px",
                    minWidth: "auto",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 102, 204, 0.3)",
                    transition: "all 0.2s ease",
                    margin: "2px 0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 102, 204, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 102, 204, 0.3)";
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span style={{ position: "relative", top: "-0.5px" }}>
                    +{moreCount}
                  </span>
                </button>
              );
            },
          },
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              view={currentView}
              onView={handleViewChange}
              setCurrentStartDate={setCurrentStartDate}
            />
          ),
          eventWrapper: EventWrapper,
        }}
        eventPropGetter={eventPropGetter}
        formats={{
          timeGutterFormat: "HH:mm",
          dayRangeHeaderFormat: "MMMM D, YYYY",
          eventTimeRangeFormat: () => "",
        }}
        date={currentStartDate}
        // onNavigate={(date) => setCurrentStartDate(date)}
        dayLayoutAlgorithm="no-overlap"
        min={minTime}
        max={maxTime}
      />

      {/* Status Legend */}
      <div className="status-legend">
        <div className="status-list">
          {statuses.map((status, index) => (
            <div key={index} className="status-item">
              <span
                className="status-dot"
                style={{ backgroundColor: status.color }}
              ></span>
              {status.name}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Show-More Modal (mobile only) */}
      {showMoreModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "1rem",
          }}
          onClick={() =>
            setShowMoreModal({ open: false, events: [], date: new Date() })
          }
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "420px",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem",
                fontWeight: "600",
                fontSize: "1.1rem",
                borderBottom: "1px solid #eee",
              }}
            >
              {moment(showMoreModal.date).format("D MMM YYYY")}
            </div>

            {/* Events list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1rem" }}>
              {showMoreModal.events.map((event, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleSelectEvent(event);
                    setShowMoreModal({
                      open: false,
                      events: [],
                      date: new Date(),
                    });
                  }}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                  }}
                >
                  <EventTooltipContent event={event} />
                </div>
              ))}
            </div>

            {/* Close button */}
            <div
              style={{ padding: "0.75rem 1rem", borderTop: "1px solid #eee" }}
            >
              <button
                onClick={() =>
                  setShowMoreModal({
                    open: false,
                    events: [],
                    date: new Date(),
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Responsive Styles */}
      <CalendarStyles />
    </div>
  );
};

const CalendarStyles = () => (
  <style>
    {`
      .bg-light-hover {
        background-color: #f8f9fa;
      }
      .bg-light-hover:hover {
        background-color: #e9ecef;
      }
      .transition-all {
        transition: all 0.2s ease;
      }
      .screen-blur {
        filter: blur(2px);
        pointer-events: none;
      }
      .progress-overlay {
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         display: flex;
         align-items: center;
         justify-content: center;
         z-index: 1000;
         background: rgba(255,255,255,0.7);
      }
      .status-legend {
        margin-top: 1rem;
        padding: 1rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .status-list {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
      }
      .status-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: #4b5563;
      }
      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .active-view {
         background-color: #3b82f6 !important;
         color: white !important;
      }
    `}
  </style>
);

export default ReactBigCalendar;
