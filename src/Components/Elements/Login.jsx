import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Apicongfig";
import { Spinner, Alert } from "react-bootstrap";
import { getFcmToken } from "../../firebase";
import { useHeaderTitle } from "../../context/HeaderTitleContext";
import { useMeetings } from "../../context/MeetingsContext";
import {
  formatDate,
  formatTime,
} from "./Meeting/GetMeeting/Helpers/functionHelper";
import moment from "moment";
import { FaCheckCircle } from "react-icons/fa";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import CookieService from "../../Components/Utils/CookieService";
const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const { setUser } = useHeaderTitle();

  // Check for session_id in URL
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");
  const showSuccessMessage = !!sessionId;

  const toProfilePage = location?.state?.fromInvitePage;
  const invitePageURL = location?.state?.invitePageURL;
  const toPreviousPage = location?.state?.previousPath;
  const redirect_rules = location?.state?.redirect_rules || true;

  const fromEmail =
    searchParams.get("from") === "email" ||
    (location.state?.from?.search &&
      new URLSearchParams(location.state.from.search).get("from") === "email");

  const fromNotification =
    searchParams.get("from") === "notification" ||
    (location.state?.from?.search &&
      new URLSearchParams(location.state.from.search).get("from") ===
        "notification");

  let fromProfile = false;
  if (location?.state?.fromProfile === true) {
    fromProfile = true;
  }
  console.log("d.");
  //
  //
  // Function to check token expiration and refresh
  function checkTokenExpiration() {
    const tokenExpirationTime = CookieService.get("token_expiration_time");

    if (!tokenExpirationTime) return;

    const currentTime = Date.now();
    if (currentTime > tokenExpirationTime) {
      console.log("Access token expired. Refreshing...");
      refreshAccessToken(); // Call the function to refresh the access token
    } else {
      console.log("Token is still valid.");
    }
  }
  function refreshAccessToken() {
    const refreshToken = CookieService.get("refresh_token");

    if (!refreshToken) {
      console.error("No refresh token available");
      return;
    }
    const userid = CookieService.get("user_id");

    axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        if (response) {
          const newAccessToken = response.data?.access_token;
          const newExpiresIn = response.data?.expires_in; // e.g., 3598 seconds

          // Update the stored tokens and expiration time in cookies
          sessionStorage.setItem("access_token", newAccessToken);
          CookieService.set("access_token", newAccessToken);

          // Update refresh token if a new one is provided
          const newRefreshToken = response.data?.refresh_token;
          if (newRefreshToken) {
            sessionStorage.setItem("refresh_token", newRefreshToken);
            CookieService.set("refresh_token", newRefreshToken);
          }

          const newExpirationTime = Date.now() + newExpiresIn * 1000;
          sessionStorage.setItem("token_expiration_time", newExpirationTime);
          CookieService.set("token_expiration_time", newExpirationTime);

          // Set a new timeout to refresh the access token again
          setTimeout(refreshAccessToken, (newExpiresIn - 60) * 1000); // Refresh 1 minute before expiration
        }
      })
      .catch((error) => {
        console.error("Refresh API Error:", error);
        console.error(
          "Refresh token is invalid or expired. Redirecting to login.",
        );
        handleInvalidToken();
      });
  }
  function handleInvalidToken() {
    CookieService.remove("access_token");
    CookieService.remove("refresh_token");
    CookieService.remove("token_expiration_time");
    sessionStorage.removeItem("token_expiration_time");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");

  }

  const [loading, setLoading] = useState(false);

  const MarkDestinationActive = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/mark-destination-active`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  const formatDateForApi = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    setMin(startOfWeek);
    setMax(endOfWeek);
  }, []);
  const {
    setOffset,
    setAgendaEventOffset,
    selectedAgenda,
    setSelectedAgenda,
    setAgendaCount,
  } = useMeetings();
  const [earliestHour, setEarliestHour] = useState(9);
  const [latestHour, setLatestHour] = useState(17);
  const [myEventsList, setMyEventsList] = useState([]);
  const [overlappingSlots, setOverlappingSlots] = useState(new Set());
  const [currentStartDate, setCurrentStartDate] = useState(
    moment().startOf("week").toDate(),
  );
  const [currentView, setCurrentView] = useState(Views.WEEK); // Track current view

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
    )
      return null;

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
  const getFormattedAbortDateTime = (abortDateTime, timezone) => {
    const userTimezone = moment.tz.guess();
    return moment
      .tz(abortDateTime, "YYYY-MM-DD HH:mm:ss", timezone || "UTC")
      .tz(userTimezone)
      .toDate();
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
  const getCompletedMeetings = async (startDate) => {
    let response;
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

      // Adjust date range based on current view
      if (currentView === Views.WEEK) {
        end.setDate(start.getDate() + 7);
      } else if (currentView === Views.MONTH) {
        end.setMonth(start.getMonth() + 1);
      }

      const startDateStr = formatDateForApi(start);
      const endDateStr = formatDateForApi(end);

      // Fetch Tektime + Google + Outlook based on selectedAgenda
      if (
        selectedAgenda.tektime &&
        selectedAgenda.google &&
        selectedAgenda.outlook
      ) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-google-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime && selectedAgenda.google) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-google-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime && selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.google && selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/google-outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.tektime) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/tektime-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.google) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/google-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else if (selectedAgenda.outlook) {
        response = await axios.get(
          `${API_BASE_URL}/get-all-meetings/outlook-agenda?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&m_start_date_filter=${startDateStr}&m_end_date_filter=${endDateStr}&sync_agenda=${true}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      }

      if (response?.status === 200) {
        const meetings = response?.data?.meetings || response?.data?.data || [];
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

        if (sortedMeetings.length > 0 && currentView === Views.WEEK) {
          const earliestMeeting = sortedMeetings[0];
          const latestMeeting = sortedMeetings[sortedMeetings.length - 1];

          const minTime = new Date(earliestMeeting.start);
          const maxTime = new Date(latestMeeting.end);
          setMin(minTime);
          setMax(maxTime);
        }

        if (filteredMeetings.length > 0 && currentView === Views.WEEK) {
          let earliestHr = 24;
          let latestHr = 0;

          const weekStart = new Date(startDate);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);

          filteredMeetings.forEach((meeting) => {
            const start = new Date(meeting.start);
            const end = new Date(meeting.end);

            if (
              start >= weekStart &&
              end <= weekEnd &&
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  const handleLoginSubmit = async (event) => {
    // setShow(false);
    setLoading(true);
    event.preventDefault();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const logoutTime = new Date();
    const formattedLoginTime = logoutTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    let fcmToken = null;
    if ("Notification" in window && "serviceWorker" in navigator) {
      try {
        if (Notification.permission === "denied") {
          console.warn("Notification permission denied – skipping FCM token");
          // Don't show a toast here – it would block the login flow
        } else {
          // "granted" OR "default" (not asked yet) – getFcmToken() will
          // request permission internally if it's still "default".
          fcmToken = await getFcmToken();
          if (!fcmToken) {
            console.warn(
              "Could not get FCM token – proceeding without push notifications",
            );
          }
        }
      } catch (fcmError) {
        console.error("FCM token error:", fcmError);
        // Don't block login over a notification error
      }
    } else {
      console.warn(
        "Notifications or service workers not supported in this browser",
      );
    }

    const api = `${API_BASE_URL}/login`;
    const payload = {
      email,
      password,
      last_connection: formattedLoginTime,
      fcm_token: fcmToken,
    };

    try {
      const response = await axios.post(api, payload);

      if (response) {
        const {
          id,
          name,
          last_name,
          email,
          enterprise,
          role,
          role_id,
          user_needs,
          enterprise_id,
          image,
          full_name,
          teams
        } = response.data.user;
        const accessToken = response.data?.user?.access_token;
        const refreshToken = response.data?.user?.refresh_token;
        const tokenExpirationTime = response.data?.user?.token_expiration_time;
        const userData = {
          id,
          name,
          last_name,
          email,
          enterprise,
          role,
          role_id,
          user_needs,
          enterprise_id,
          image,
          full_name,
          teams
        };

        CookieService.set("token", response.data.token);
        CookieService.set("user_id", id);
        CookieService.set("user", userData); // CookieService now handles stringify automatically
        CookieService.set("email", email);
        CookieService.set("name", name);
        CookieService.set("type", response.data.user.role.name);
        CookieService.set("role", response.data.user.role);

        // Handle access_token
        if (accessToken && accessToken !== "null") {
          CookieService.set("access_token", accessToken);
        } else {
          CookieService.remove("access_token");
        }

        // Handle refresh_token
        if (refreshToken && refreshToken !== "null") {
          CookieService.set("refresh_token", refreshToken);
        } else {
          CookieService.remove("refresh_token");
        }

        // Handle token_expiration_time
        if (tokenExpirationTime && tokenExpirationTime !== "null") {
          CookieService.set("token_expiration_time", tokenExpirationTime);
        } else {
          CookieService.remove("token_expiration_time");
        }

        const userRole = response.data.user.role.name;
        // if ((userRole === "MasterAdmin", "SuperAdmin", "Admin")) {
        toast.success("Connexion réussie");

        if (fromEmail || fromNotification) {
          navigate(
            location.state?.from
              ? `${location.state.from.pathname}${location.state.from.search}`
              : toPreviousPage || "/Invities",
          );
        } else if (fromProfile || redirect_rules === false) {
          navigate(toPreviousPage);
        } else {
          if (response?.data?.login_rules?.redirect_route) {
            // sync Api calling before redirect

            navigate(response?.data?.login_rules?.redirect_route);
          } else {
            navigate(toProfilePage ? invitePageURL : "/Invities");
          }
        }

        getCompletedMeetings(currentStartDate);
        // await connectUserToMeeting(response?.data?.user?.id)

        // } else {
        //   navigate(toProfilePage ? invitePageURL : "/meeting");

        // }
        checkTokenExpiration(); // Check token expiration and refresh if needed

        const expiresIn = tokenExpirationTime - Date.now();
        if (expiresIn > 0) {
          setTimeout(refreshAccessToken, expiresIn - 60000); // Refresh 1 minute before expiration
        }
        setUser(response?.data?.user);
      } else {
        toast.error("La connexion a échoué");
      }
    } catch (error) {
      const msg = error?.response?.data?.message;

      // English → French mapping
      const translations = {
        "Your account is pending. Please contact support.":
          "Votre compte est en attente. Veuillez contacter le support.",
        "Invalid login details": "Identifiants de connexion invalides",
      };

      // agar translation available ho to French show karo warna jo aaya wohi
      const translatedMessage = translations[msg] || msg;

      toast.error(translatedMessage);
      // if (
      //   error?.response?.status === 403 &&
      //   error?.response?.data?.success === false &&
      //   error?.response?.data?.message === "Enterprise Status Closed!"
      // ) {
      // } else {
      //   toast.error("Veuillez vérifier votre email et votre mot de passe");
      // }
    } finally {
      setLoading(false);
      MarkDestinationActive();
    }
  };

  //   const handleLoginSubmit = async (event) => {
  //   setLoading(true);
  //   event.preventDefault();

  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   const logoutTime = new Date();
  //   const formattedLoginTime = logoutTime.toLocaleString("en-GB", {
  //     timeZone: userTimeZone,
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: false,
  //   });

  //  // Get FCM token - handle potential null value
  //     let fcmToken = null;
  //     try {
  //       fcmToken = await getFcmToken();
  //       if (!fcmToken) {
  //         console.warn('Could not get FCM token - proceeding without push notifications');
  //       }
  //     } catch (fcmError) {
  //       console.error('FCM token error:', fcmError);
  //     }

  //   console.log('fcmToken',fcmToken)

  //   const api = `${API_BASE_URL}/login`;
  //   const payload = {
  //     email,
  //     password,
  //     last_connection: formattedLoginTime,
  //     fcm_token: fcmToken, // ✅ Include it here
  //   };

  //   try {
  //     const response = await axios.post(api, payload);
  //     if (response) {
  //       const { id, name, email } = response.data.user;
  //       const accessToken = response.data?.user?.access_token;
  //       const refreshToken = response.data?.user?.refresh_token;

  //       navigate('/')
  //       // continue with your existing logic
  //     }
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     toast.error("Login failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleEmailClick = () => {
    const email = "portal@tektime.fr";
    window.open(`mailto:${email}`);
  };
  useEffect(() => {
    if (window.location.href === "https://www.tektime.io/login") {
      window.location.replace("https://tektime.io/");
    }
  }, []);
  return (
    <>
      <div className="login">
        <div className="container-fluid py-5">
          <div className={`row justify-content-center ${show ? `blur` : ""}`}>
            <div className="col-md-4">
              <div className="card px-5 py-4">
                <form
                  onSubmit={handleLoginSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLoginSubmit(e);
                    }
                  }}
                >
                  <div>
                    <div className="text-center">
                      <img
                        src="/Assets/logo5.png"
                        alt="none"
                        className="img-fluid"
                        width={180}
                      />
                    </div>
                    {showSuccessMessage && (
                      <div
                        className="mb-4 p-3 d-flex align-items-start"
                        style={{
                          backgroundColor: "#f0fdf4", // Very light green
                          border: "1px solid #bbf7d0", // Light green border
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                          color: "#166534", // Dark green text
                        }}
                      >
                        <FaCheckCircle
                          style={{
                            fontSize: "20px",
                            color: "#22c55e", // Vivid green icon
                            marginRight: "12px",
                            marginTop: "3px", // Align with first line of text
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <h6
                            style={{
                              margin: 0,
                              fontWeight: "700",
                              fontSize: "15px",
                            }}
                          >
                            Compte créé avec succès
                          </h6>
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "14px",
                              lineHeight: "1.4",
                              opacity: 0.9,
                            }}
                          >
                            Veuillez vous connecter avec votre adresse e-mail et
                            votre mot de passe pour continuer.{" "}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <label for="exampleInputEmail1" className="form-label">
                        E-mail
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="exampleInputEmail1"
                        aria-describedby="emailHelp"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={show ? true : false}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleInputPassword1"
                        className="form-label pass-lab"
                      >
                        Mot de passe
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? (
                            <BiHide color="#145CB8" />
                          ) : (
                            <BiShow color="#145CB8" />
                          )}
                        </button>
                      </label>
                      <div className="input-group">
                        <input
                          type={passwordVisible ? "text" : "password"}
                          className="form-control"
                          id="exampleInputPassword1"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={show ? true : false}
                        />
                      </div>
                    </div>

                    {/* 👇 Forgot password link */}
                    <div className="mb-3 text-end">
                      <Link
                        to="https://api.tektime.io/password/reset"
                        className="text-decoration-none text-primary"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="text-center">
                      <button
                        type="submit"
                        className="btn btn-login"
                        disabled={show ? true : false}
                      >
                        {loading ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            style={{
                              textAlign: "center",
                              fontWeight: "600",
                              fontSize: "16px",
                              color: "white",
                              margin: "5px 82px",
                            }}
                          />
                        ) : (
                          "Connexion"
                        )}
                      </button>
                    </div>

                    {/* Added separator */}
                    <div className="text-center my-3">
                      <span className="text-muted">--- OU ---</span>
                    </div>

                    {/* Updated registration section */}
                    <div className="text-center mt-3">
                      <div className="mb-2">
                        <span className="fw-bold">
                          🆕 Nouveau sur TekTIME ?
                        </span>
                      </div>
                      <div className="mb-2">
                        <span>Créez votre compte gratuitement !</span>
                      </div>
                      <Link
                        to={`/register?contract_id=${3}`}
                        // className="btn-outline-primary"
                        style={{ fontWeight: "500" }}
                      >
                        Créer mon compte
                      </Link>
                      <div className="mt-2 text-muted small">
                        ✨ Gagnez du temps. Automatisez. Collaborez.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {show && (
        <>
          <div className="box" style={{ width: "100%", height: "100%" }}>
            <div className={`row justify-content-center`}>
              <div
                className="col-md-4"
                style={{
                  position: "absolute",
                  top: "22%",
                }}
              >
                <div className="card px-4 py-4">
                  <div className="text-center">
                    <img
                      src="/Assets/logo5.png"
                      alt="none"
                      className="img-fluid"
                      width={180}
                    />
                  </div>
                  <div className="alert alert-danger  pr-0">
                    <h6 className="text-center">
                      Votre abonnement TekTIME vient de toucher à sa fin
                    </h6>
                    <small>
                      Ce n'est pas perdu je vous invite à vous rapprocher de
                      votre administrateur pour prolonger l'aventure ou
                      d'envoyer un mail à{" "}
                      <a href="" onClick={handleEmailClick}>
                        portal@tektime.fr
                      </a>
                      . Je vous dit à très vite
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* )} */}
    </>
  );
};

export default Login;
