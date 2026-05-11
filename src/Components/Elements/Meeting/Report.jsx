import CookieService from '../../Utils/CookieService';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Card,
  Modal,
  OverlayTrigger,
  ProgressBar,
  Spinner,
  Table,
  Tooltip as BootTooltip,
  Container,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  FaChartBar,
  FaBook,
  FaGavel,
  FaLightbulb,
  FaComments,
  FaFileAlt,
  FaHome,
  FaBackward,
  FaFile,
} from "react-icons/fa";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MdKeyboardArrowDown, MdOutlineReviews, MdStars } from "react-icons/md";
import ReportStepCard from "./ReportStepCard";
import DecisionCard from "./DecisionCard";
import moment from "moment";
import { FaArrowRight, FaList } from "react-icons/fa";
import SignUp from "../AuthModal/SignUp";
import ForgotPassword from "../AuthModal/ForgotPassword";
import { useSidebarContext } from "../../../context/SidebarContext";
import { Accordion } from "react-bootstrap";
import { FaFlag } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";
import { BsPersonWorkspace } from "react-icons/bs";
import {
  formatMissionDate,
  markTodoMeeting,
  markToFinish,
  typeIcons,
} from "../../Utils/MeetingFunctions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Tooltip as AntdTooltip, Avatar } from "antd";
import { FaChartGantt, FaRegCalendarDays } from "react-icons/fa6";
import { momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  calculateTimeDifference,
  calculateTimeDifferencePrepareData,
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
} from "../../Utils/MeetingFunctions";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";

import CompletedReportStepFile from "./CompletedReportStepFile";
import StepperSignUpModal from "../AuthModal/StepperSignUpModal";
import {
  convertDateToUserTimezone,
  convertTo12HourFormat,
  formatDate,
  formatTime,
  localizeVisibilityMessage,
  parseAndFormatDateTime,
  specialMeetingEndTime,
  timezoneSymbols,
  userTimeZone,
} from "./GetMeeting/Helpers/functionHelper";

import InProgress from "./InProgress";
import { runStepTranscription } from "../../../Helpers/useStepTranscription";
import ReportFileMenu from "./ReportFileMenu";
import ViewFilePreview from "./ViewFilePreview";
import { useMeetings } from "../../../context/MeetingsContext";
import Roadmap from "../Invities/DestinationToMeeting/Roadmap";
import ReactCalendar from "../Invities/DestinationToMeeting/ReactCalendar";
import CalendlyBooking from "./Report/CalendlyBooking";
import MeetingDiscussion from "./CurrentMeeting/components/MeetingDiscussion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import ReportHostCard from "./ReportHostCard";
import ReportParticipantCard from "./ReportParticipantCard";
import ReportSubscriberCard from "./ReportSubscriberCard";
import ReportActiveStepCard from "./ReportActiveStepCard";
import "./ReportDesign.scss";
import FeedbackCards from "./CompletedMeeting/FeedbackCard";
import { SiMicrosoftoutlook, SiMicrosoftteams } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { BiDetail } from "react-icons/bi";

const localizer = momentLocalizer(moment);
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let fromMeeting = false;
  if (location?.state?.from === "meeting") {
    fromMeeting = true;
  }
  const {
    destinationId,
    setDestinationId,
    destinationUniqueId,
    setDestinationUniqueId,
  } = useFormContext();
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;
  const { setCallApi, setFromTektime, fromTektime } = useMeetings();
  const [showProgressBar1, setShowProgressBar1] = useState(false);
  const [progress1, setProgress1] = useState(false);
  const { id } = useParams();
  const [t, i18n] = useTranslation("global");
  const { unqiue_id, meeting_id: meetId } = useParams();
  const [meeting, setMeeting] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [startTime1, setStartTime1] = useState(null);
  const [time, setTime] = useState(null);

  const [objective, setObjective] = useState(null);
  const [userId, setUserID] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null);
  const userid = parseInt(CookieService.get("user_id"));
  const pageId = `${userid}/${meetId}`;
  const [pageViews, setPageViews] = useState(0);
  const [meetingData, setMeetingData] = useState();
  const [meetingFile, setMeetingFile] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  //For Destination Home Page START-------------------------------------------------------------------------------
  const [uniqueId, setUniqueId] = useState(false);
  const [destinationDate, setdestinationData] = useState({});
  const [isCalling, setIsCalling] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [fileClicked, setFileClicked] = useState(false); // state for file button

  const [roadmapData, setRoadmapData] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [roadmapMeetings, setRoadmapMeetings] = useState(null);
  const [timeWindowOffset, setTimeWindowOffset] = useState(0);

  const {
    meetingStartDate,
    meetingEndDate,
    formattedStartDate,
    formattedMeetingEndDate,
  } = useMemo(() => {
    const meetings = destinationDate?.meetings || [];
    let baseDate;

    if (meetings && meetings.length > 0) {
      // Find the earliest meeting date
      const earliestMeetingDate = new Date(
        Math.min(...meetings.map((meeting) => new Date(meeting.date)))
      );
      baseDate = new Date(earliestMeetingDate);
      // Apply timeWindowOffset to the earliest meeting's month
      baseDate.setMonth(baseDate.getMonth() + timeWindowOffset);
    } else {
      // Fallback to current month with offset
      baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() + timeWindowOffset);
    }

    baseDate.setDate(1); // Start from first of the month
    baseDate.setHours(0, 0, 0, 0);

    const start = new Date(baseDate);
    start.setDate(start.getDate() - start.getDay()); // Align to previous Sunday

    const end = new Date(start);
    end.setDate(start.getDate() + 27); // 4 weeks (28 days) - 1 day = 27 days

    const format = (date) =>
      `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;

    return {
      meetingStartDate: start,
      meetingEndDate: end,
      formattedStartDate: format(start),
      formattedMeetingEndDate: format(end),
    };
  }, [timeWindowOffset, destinationDate?.meetings]);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();

    // Handle ISO format (with 'T')
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return new Date(year, month - 1, day);
    }

    // Fallback to default Date parsing
    return new Date(dateString);
  };

  const resetToCurrentWeek = useCallback(() => {
    const meetings = destinationDate?.meetings || [];
    if (!Array.isArray(meetings) || meetings.length === 0) {
      setTimeWindowOffset(0); // No meetings, reset to current week
      return;
    }

    let earliestMeetingDate = null;
    meetings.forEach((meeting) => {
      const meetingDate = parseDate(meeting.date);
      if (!earliestMeetingDate || meetingDate < earliestMeetingDate) {
        earliestMeetingDate = meetingDate;
      }
    });

    if (!earliestMeetingDate) {
      setTimeWindowOffset(0); // No valid meeting dates, reset to current week
      return;
    }

    // Calculate the week difference between today and the earliest meeting
    const today = new Date(); // Current date (e.g., October 17, 2025)
    today.setHours(0, 0, 0, 0);
    const earliestWeekStart = new Date(earliestMeetingDate);
    earliestWeekStart.setDate(
      earliestMeetingDate.getDate() - earliestMeetingDate.getDay()
    ); // Sunday of earliest meeting's week
    earliestWeekStart.setHours(0, 0, 0, 0);
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay()); // Sunday of current week
    todayWeekStart.setHours(0, 0, 0, 0);

    // Calculate month difference for timeWindowOffset (since useMemo uses months)
    const diffTime = todayWeekStart - earliestWeekStart;
    const diffMonths = Math.round(diffTime / (30.42 * 24 * 60 * 60 * 1000)); // Average days in a month
    setTimeWindowOffset(diffMonths);
  }, [destinationDate?.meetings]);

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };
  const convertTo12HourFormatPrepareData = (time, steps) => {
    if (!time || !steps) {
      return;
    }
    // Check if any step has time unit in seconds
    const hasSeconds = steps?.some((step) => step.time_unit === "seconds");
    // Extract hours and minutes from the time string
    // let [hour, minute] = time?.split(":").map(Number);

    return time;
  };

  const [meetingMessages, setMeetingMessages] = useState([]);
  useEffect(() => {
    const getMeetingMessages = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/meeting-messages?meeting_id=${meetId}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response?.status === 200) {
          const data = response?.data?.data;
          const sortedMessages = [...(data || [])].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setMeetingMessages(sortedMessages);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    if (!uniqueId) {
      getMeetingMessages();
    }
  }, [meetId, uniqueId]);

  // // This is the GET API function you want to call after upload succeeds
  // const fetchNotesData = async () => {
  //   try {
  //     const token =
  //       CookieService.get("token") || CookieService.get("token");
  //     const response = await axios.get(
  //       `${API_BASE_URL}/get-upmeet-report/${meetId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     return response.data; // Return full response (check for response.data.data later)
  //   } catch (error) {
  //     console.error("Error fetching notes:", error);
  //     throw error;
  //   }
  // };

  // 3. Use this useEffect
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        // Modern browsers require both of these
        e.preventDefault();
        e.returnValue = ""; // Chrome requires this to be set (even if blank)
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading]); // Add dependency here
  const [progress2, setProgress2] = useState(0);
  const [meetingSummaryLoading, setMeetingSummaryLoading] = useState(false);

  const [callReport, setCallReport] = useState(false);

  // const [strategyLoading, setStrategyLoading] = useState(false);
  // const [strategyProgress, setStrategyProgress] = useState(0);

  // const createStrategyMoment = async () => {
  //   setStrategyLoading(true);
  //   setStrategyProgress(10); // Initial progress

  //   // Smooth progress animation
  //   const progressInterval = setInterval(() => {
  //     setStrategyProgress((prev) => Math.min(prev + (100 - prev) * 0.05, 90)); // Slow down near completion
  //   }, 500);
  //   try {
  //     const response = await axios.post(
  //       `${API_BASE_URL}/automatic-strategy-meeting/${meetId}`,
  //       null,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${CookieService.get("token")}`,
  //         },
  //       }
  //     );
  //     if (response?.status === 201 || response?.status === 200) {
  //       clearInterval(progressInterval);
  //       setStrategyProgress(100);
  //       setStrategyLoading(false);
  //     }
  //   } catch (error) {
  //     console.log("error", error);
  //     clearInterval(progressInterval);
  //     setStrategyProgress(100);
  //     setStrategyLoading(false);
  //   }
  // };
  const handleAudioUploadSuccess = async () => {
    navigate(`/present/invite/${meetId}`);
    return;
  };

  // const [progressReport, setProgressReport] = useState(0);
  // const [statusText, setStatusText] = useState(
  // "Initializing report generation..."
  // );
  // const [reportLoading, setReportLoading] = useState(false);

  // const [upmeetReport, setUpmeetReport] = useState(null);

  // const fetchReport = async () => {
  //   const token =
  //     CookieService.get("token") || CookieService.get("token");
  //   let attemptCount = 0;

  //   while (true) {
  //     attemptCount++;
  //     // setStatusText(`Generating report (Attempt ${attemptCount})...`);
  //     setReportLoading(true);

  //     try {
  //       // Continuous progress animation
  //       const startTime = Date.now();
  //       const duration = 60000; // 1 minute

  //       const updateProgress = () => {
  //         const elapsed = Date.now() - startTime;
  //         const progress = Math.min((elapsed / duration) * 100, 100);
  //         setProgressReport(progress);

  //         if (progress < 100) {
  //           requestAnimationFrame(updateProgress);
  //         }
  //       };

  //       updateProgress();

  //       const response = await axios.get(
  //         `${API_BASE_URL}/get-upmeet-report/${meetId}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );

  //       if (response?.status === 200 || response?.status === 201) {
  //         setUpmeetReport(response.data?.data?.upmeet_summary?.text);
  //         setStatusText("Report generated successfully!");
  //         setProgressReport(100);
  //         setReportLoading(false);
  //         return;
  //       }
  //     } catch (error) {
  //       console.error("Error fetching report:", error);
  //       setStatusText(
  //         `Report not ready yet. Retrying in 1 minute... (Attempt ${attemptCount})`
  //       );

  //       // Wait for 1 minute before retrying
  //       await new Promise((resolve) => setTimeout(resolve, 60000));
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (
  //     meetingData?.status === "closed" &&
  //     meetingData?.prise_de_notes === "Automatic" &&
  //     meetingData?.meeting_notes_summary === null
  //   ) {
  //     fetchReport();
  //   }

  //   // Cleanup function
  //   return () => {
  //     // Cancel any pending operations if needed
  //   };
  // }, [meetId, callReport, meetingData?.status]);

  const getParticipantsByDestinationId = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/destination-participants/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setRoadmapData(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getMilestones = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-meeting-step-decisions/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setMilestones(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };
  const [specialMeetingLoading, setSpecialMeetingLoading] = useState(false);
  const getSpecialMeeting = async () => {
    setIsModalOpen(false);
    setIsModalOpen1(false);
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setSpecialMeetingLoading(true);
    try {
      const response = await axios.get(
        // `${API_BASE_URL}/get-destination-with-meeting/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,
        `${API_BASE_URL}/get-destination-report/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      const data = response?.data?.data;
      // `${API_BASE_URL}/get-destination-meetings/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,

      setdestinationData(response?.data?.data);
      setDestinationId(response?.data?.data?.id);
      setIsModalOpen(false);

      // Create the proper data structure for Roadmap
      const roadmapData = [
        {
          ...data.clients, // Spread all client properties
          meetings: data.meetings, // Add meetings array
          client_logo: data.clients.client_logo,
          client_need: data.clients.client_need,
        },
      ];
      setRoadmapMeetings(data?.meetings);
      // setRoadmapData(roadmapData);

      const uuid = response?.data?.data?.uuid
        ? `${response.data.data.uuid}--es`
        : null;
      if (uuid) {
        setDestinationUniqueId(uuid);
      } else {
        console.warn("UUID is missing in the response:", response);
      }
    } catch (error) {
      setIsModalOpen(false);
    } finally {
      setSpecialMeetingLoading(false);
    }
  };

  const [participants, setParticipants] = useState([]);
  const getSpecialParticipants = async () => {
    setIsModalOpen(false);
    setIsModalOpen1(false);
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
        // `${API_BASE_URL}/get-destination-with-meeting/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,
        `${API_BASE_URL}/get-destination-report-participants/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      const data = response?.data?.data;
      // `${API_BASE_URL}/get-destination-meetings/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}`,
      setParticipants(data?.participant || []);
      setIsModalOpen(false);
    } catch (error) {
      setIsModalOpen(false);
    } finally {
    }
  };

  const [loading, setLoading] = useState(false);

  function getAllDecisionsFromMeetings(meetings) {
    const allDecisions = [];

    // Assuming you have userTimeZone and currentTime defined as before
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: userTimeZone,
    });
    const currentTime = currentDateTime.split(", ")[1]; // Extract the time part
    const currentDate = currentDateTime.split(", ")[0]; // Extract the time part
    meetings?.forEach((meeting) => {
      meeting?.steps?.forEach((step) => {
        if (step?.decision) {
          allDecisions.push({
            meeting_id: meeting.id,
            step_id: step.id,
            decision_type: step.decision.decision_type,
            decision: step.decision.decision,
            decision_apply: step.decision.decision_apply,
            milestone_date:
              step.decision.decision_type === "Milestone"
                ? step.decision?.milestone_date
                : step.decision?.creation_date,
            creation_time: step?.decision?.creation_time || currentTime,
          });
        }
      });
    });

    return allDecisions;
  }

  const decisions = getAllDecisionsFromMeetings(destinationDate?.meetings);
  const sortedMilestones = decisions.sort(
    (a, b) => new Date(a.milestone_date) - new Date(b.milestone_date)
  );
  function calculateTotalTime(steps) {
    let totalSeconds = 0;
    steps?.forEach((step) => {
      switch (step.time_unit) {
        case "days":
          totalSeconds += step.count2 * 86400;
          break;
        case "hours":
          totalSeconds += step.count2 * 3600;
          break;
        case "minutes":
          totalSeconds += step.count2 * 60;
          break;
        case "seconds":
          totalSeconds += step.count2;
          break;
      }
    });

    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    // Display logic based on the available time units
    if (days > 0) {
      result += `${days} ${t("time_unit.days")}`;
    } else if (hrs > 0) {
      result += `${hrs} ${t("time_unit.hours")}`;
    } else if (mins > 0) {
      result += `${mins} ${t("time_unit.minutes")}`;
    } else if (secs > 0) {
      result += `${secs} ${t("time_unit.seconds")}`;
    }

    return result.trim();
  }
  const calculateTotalTimeTaken = (steps) => {
    if (!steps) return;
    // Helper function to convert time string to seconds
    const convertToSeconds = (timeString) => {
      if (!timeString) return 0;
      let totalSeconds = 0;

      // Split by '-' and iterate through parts
      const timeParts = timeString?.split(" - ").map((part) => part.trim());
      timeParts?.forEach((part) => {
        const [value, unit] = part?.split(" ");

        if (unit?.startsWith("sec")) {
          totalSeconds += parseInt(value, 10);
        } else if (unit?.startsWith("min")) {
          totalSeconds += parseInt(value, 10) * 60;
        } else if (unit?.startsWith("hour") || unit?.startsWith("hr")) {
          totalSeconds += parseInt(value, 10) * 3600;
        } else if (unit?.startsWith("day")) {
          totalSeconds += parseInt(value, 10) * 86400;
        }
      });

      return totalSeconds;
    };

    // Calculate total time in seconds
    let totalSeconds = steps?.reduce((acc, step) => {
      return acc + convertToSeconds(step?.time_taken);
    }, 0);

    // Convert total seconds to days, hours, minutes, and seconds
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Determine the most significant units to display
    let timeDisplay = "";
    if (days > 0) {
      timeDisplay =
        hours > 0
          ? // ? `${days} ${t("time_unit.days")} - ${hours} ${t("time_unit.hours")} `
          `${days} ${t("time_unit.days")} `
          : `${days} ${t("time_unit.days")} `;
    } else if (hours > 0) {
      timeDisplay =
        minutes > 0
          ? `${hours} ${t("time_unit.hours")} `
          : `${hours} ${t("time_unit.hours")}`;
    } else if (minutes > 0) {
      timeDisplay =
        seconds > 0
          ? `${minutes} ${t("time_unit.minutes")}`
          : `${minutes} ${t("time_unit.minutes")}`;
    } else {
      timeDisplay = `${seconds} ${t("time_unit.seconds")}`;
    }

    return timeDisplay;
  };

  const startDate1 = new Date(
    formatMissionDate(destinationDate?.meeting_start_date)
      ?.split("/")
      ?.reverse()
      ?.join("/")
  ); // Convert to MM/DD/YYYY
  const endDate1 = new Date(
    formatMissionDate(destinationDate?.meeting_end_date)
      ?.split("/")
      ?.reverse()
      ?.join("/")
  ); // Convert to MM/DD/YYYY

  // Calculate the difference in milliseconds
  const differenceInMillis = endDate1 - startDate1;

  // Convert milliseconds to days
  const totalDays2 = Math.floor(differenceInMillis / (1000 * 60 * 60 * 24));
  // Format the result
  let result;
  if (totalDays2 > 0) {
    result = `${totalDays2} ${totalDays2 > 1 ? t("time_unit.days") : t("time_unit.day")
      }`;
  } else {
    // result = t("time_unit.no_days"); // Handle cases where the end date is before the start date
    result = `1 ${t("time_unit.day")}`;
  }

  // Output the result
  const events = (destinationDate?.meetings || [])
    ?.filter((meeting) => meeting?.status !== "abort")
    ?.map((meeting) => {
      const userTimezoneOffset = new Date().getTimezoneOffset() * 60000;
      const meetingDateTime = new Date(
        new Date(meeting.date).getTime() - userTimezoneOffset
      );
      const currentDateTime = new Date();

      const color = meetingDateTime < currentDateTime ? "#ff4d4d" : "#4C49E3";

      let totalCompletedTime = 0;
      let totalAllTime = 0;
      let totalCount2 = 0;
      let timeUnit = "";

      const convertToSeconds = (timeString) => {
        if (!timeString) return 0;
        let totalSeconds = 0;

        const timeParts = timeString.split(" - ").map((part) => part.trim());
        timeParts.forEach((part) => {
          const [value, unit] = part.split(" ");

          if (unit?.includes("sec")) {
            totalSeconds += parseInt(value, 10);
          } else if (unit?.includes("min")) {
            totalSeconds += parseInt(value, 10) * 60;
          } else if (unit?.includes("hour") || unit?.includes("hr")) {
            totalSeconds += parseInt(value, 10) * 3600;
          } else if (unit?.includes("day")) {
            totalSeconds += parseInt(value, 10) * 86400;
          }
        });

        return totalSeconds;
      };

      const getStepColor = (step) => {
        const stepTimeInSeconds = convertToSeconds(step?.time_taken);
        const count2InSeconds = convertToSeconds(
          `${step?.count2} ${step?.time_unit || ""}`
        );
        return stepTimeInSeconds > count2InSeconds ? "#F12D2B" : "#FFDB01";
      };

      meeting?.steps?.forEach((step) => {
        const stepTimeInSeconds = convertToSeconds(step?.time_taken);
        totalAllTime += stepTimeInSeconds;

        if (meeting?.status === "in_progress") {
          totalCount2 += step?.count2 ?? 0;
        }

        if (step?.step_status === "completed") {
          totalCompletedTime += stepTimeInSeconds;
        }

        if (step?.time_unit === "seconds") {
          totalCount2 += step?.count2 || 0;
        } else if (step?.time_unit === "minutes") {
          totalCount2 += step?.count2 || 0;
        } else if (step?.time_unit === "hours") {
          totalCount2 += step?.count2 || 0;
        }

        timeUnit = step?.time_unit || timeUnit;
      });

      let percentage = 0;
      if (meeting?.status === "closed") {
        percentage =
          totalAllTime > 0 ? (totalCompletedTime / totalAllTime) * 100 : 0;
      }

      if (meeting?.status === "in_progress") {
        const totalSteps = meeting?.steps?.length || 1;
        const completedSteps = meeting?.steps?.filter(
          (step) => step?.step_status === "completed"
        ).length;
        percentage =
          totalSteps > 0
            ? ((completedSteps + totalCompletedTime / totalAllTime) /
              totalSteps) *
            100
            : 0;
      }

      let start;
      // Ensure valid start time for meetings
      if (meeting?.status === "in_progress" && meeting?.starts_at) {
        const formattedStartTime = convertTo12HourFormatPrepareData(
          meeting?.starts_at,
          meeting?.steps
        );
        const startDateStringInProgress = `${meeting?.date}T${formattedStartTime}`;
        start = new Date(startDateStringInProgress);
      } else {
        const startDateString = `${meeting?.date}T${meeting?.start_time || "00:00:00"
          }`; // Add a fallback for undefined start_time
        start = new Date(startDateString);
      }

      const estimateTime = meeting?.estimate_time || new Date().toISOString();
      const end = new Date(estimateTime.split(".")[0]);
      return {
        title: meeting?.title,
        start: start,
        end: end,
        color:
          meeting?.status === "closed"
            ? "#0A8634"
            : meeting?.status === "in_progress"
              ? meeting?.steps?.some((step) => getStepColor(step) === "#F12D2B")
                ? "#F12D2B"
                : "#FFDB01"
              : meeting?.status === "active"
                ? color
                : "#4C49E3",
        // progress: percentage.toFixed(2),
        progress: Math.floor(percentage),
        status: meeting?.status,
        url: `/destination/${meeting?.unique_id}/${meeting?.id}`,
        allDay: true,
        totalCount2,
        timeUnit,
      };
    });

  const decisionEvents = sortedMilestones?.map((decision, index) => ({
    start: new Date(decision.milestone_date),
    end: new Date(decision.milestone_date),
    title: `Milestone ${index + 1}: ${decision.decision}`,
    color: "#000000",
    status: "decision",
  }));

  const allEvents = [...events, ...decisionEvents];

  const minDate = new Date(Math.min(...allEvents.map((event) => event.start)));
  const maxDate = new Date(Math.max(...allEvents.map((event) => event.end)));
  const dateDiff = maxDate - minDate; // Difference in milliseconds
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  const oneWeek = 7 * oneDay; // One week in milliseconds
  const oneYear = 365 * oneDay; // Approximate year in milliseconds

  // Determine the appropriate view based on date difference
  let defaultView;
  let views;

  if (dateDiff < oneDay) {
    defaultView = "day"; // Show day view if less than a day (hour view)
    views = {
      day: true, // Only show the agenda view
    };
  } else if (dateDiff < oneWeek) {
    defaultView = "week"; // Show week view if less than a week
    views = {
      day: false, // Only show the day view
      week: true, // Show the week view
      month: false, // Show the week view
    };
  } else if (dateDiff < oneYear) {
    defaultView = "month"; // Default to month view for less than a year
    views = {
      day: false,
      week: false,
      month: true,
    };
  } else {
    defaultView = "agenda"; // Show agenda view if a year or more
    views = {
      day: false,
      week: false,
      month: false,
      agenda: true, // Only show agenda view
    };
  }

  //For Destination Home Page END-------------------------------------------------------------------------------

  useEffect(() => {
    const incrementPageView = async () => {
      // setIsLoading(true)
      try {
        const response = await axios.get(
          `${API_BASE_URL}/page-views/${pageId}`
        );
        if (response.status === 200) {
          setPageViews(response?.data?.data?.views);
          // setIsLoading(false);
        }
      } catch (error) {
        console.error("Error incrementing page view:", error);
      }
    };
    if (pageId) {
      incrementPageView();
    }
  }, [pageId]);
  const [estimateTime, setEstimateTime] = useState(null);
  const [estimateDate, setEstimateDate] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null); // State for the selected meeting
  const [selectedFile, setSelectedFile] = useState(null); // State for the selected meeting
  const [visibilityMessage, setVisibilityMessage] = useState(null);

  const sessionUser = JSON.parse(CookieService.get("user"));
  useEffect(() => {
    if (!meetingData) return;

    const { estimate_time, type, steps, start_time, timezone } = meetingData;
    if (estimate_time) {
      const { formattedDate: estimateDate, formattedTime: estimateTime } =
        parseAndFormatDateTime(estimate_time, type, timezone);
      setEstimateTime(estimateTime);
      setEstimateDate(estimateDate);
    }

    // Ensure start_time exists before manipulating
    if (start_time) {
      const totalCount2 = steps?.reduce((acc, step) => acc + step.count2, 0);
      const [hours, minutes, seconds] = start_time.split(":").map(Number);

      if (!isNaN(hours) && !isNaN(minutes)) {
        const startDate = new Date();
        startDate.setHours(hours);
        startDate.setMinutes(minutes);
        startDate.setSeconds(seconds || 0); // Handle case where seconds might be missing
        startDate.setMinutes(startDate.getMinutes() + totalCount2);

        const formattedStartTime = startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        setStartTime1(formattedStartTime);
      }
    }
  }, [meetingData, id, meetId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (visibilityMessage) {
      setIsModalOpen(true);
    }
  }, [visibilityMessage, unqiue_id]);

  const dateActive = new Date(meeting?.date);

  const startTimeActive = meeting?.start_time;
  const formattedTimeActive = new Date(
    `1970-01-01T${startTimeActive}`
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const desId = destinationId || null;

  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [meetingAudio, setMeetingAudio] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [meetingTranscript, setMeetingTranscript] = useState(null);
  const [meetingSummary, setMeetingSummary] = useState(null);
  const [viewNote, setViewNote] = useState("note");

  const getMeetingReport = async () => {
    if (uniqueId) return false;

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    setIsLoading(true);
    setIsModalOpen(false);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-meeting-report/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&destination_id=${desId}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const meeting = response.data.data;
        // if(meeting?.status === "in_progress"){
        //   navigate(`/destiination/${meeting?.unique_id}/${meeting?.id}`)
        //   return
        // }

        setMeetingAudio(meeting?.voice_notes);
        setMeetingFile(meeting);
        setMeetingTranscript(meeting?.meeting_notes_transcript?.transcript);
        setMeetingSummary(meeting?.meeting_notes_summary);
        if (response?.data?.data?.meeting_notes) {
          setReportData(response?.data?.data?.meeting_notes);
          setReportProgress(false);
          setIsCalling(true);
        }

        setObjective(meeting?.objective);
        setUserID(meeting?.user?.id);
        const steps = meeting?.steps || [];
        const startTime = meeting?.start_time;
        const { formattedDate: estimateDate, formattedTime: estimateTime } =
          parseAndFormatDateTime(
            meeting?.estimate_time,
            meeting?.type,
            meeting?.timezone
          );
        setEstimateTime(estimateTime);
        setEstimateDate(estimateDate);
        // const estimateTime = meeting?.estimate_time?.split("T")[1] || "";

        setMeeting(meeting);
        setTime(startTime);
        // setEstimateDate(meeting?.estimate_time.split("T")[0]);
        // setEstimateTime(estimateTime);

        const totalMinutes = steps.reduce((acc, step) => acc + step.count2, 0);
        const [hours, minutes] = startTime.split(":").map(Number);

        const startDate = new Date();
        startDate.setHours(hours, minutes + totalMinutes);
        setStartTime1(
          startDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );

        setSelectedMeeting({ value: meeting?.id, label: meeting?.title });
        setMeetingData(meeting);

        setIsLoading(false);

        // Check if all notes are summarized
        // const areNotesSummarized = steps.every(
        //   (step) => step.note?.trim() === step.original_note?.trim()
        // );
        const allEqual = steps.every(
          (step) => step.note?.trim() === step.original_note?.trim()
        );

        const someEqual = steps.some(
          (step) => step.note?.trim() === step.original_note?.trim()
        );

        const areNotesSummarized = allEqual || someEqual; // true if all or some equal, false if none

        const areStepNotesSummarized = steps
          ? steps.every((step) => step.note === null) || // All notes are null
          (steps.some((step) => step.note === null) &&
            steps.some((step) => step.note !== null)) // One note is null and one is not
          : undefined; // Handle the case when `steps` is null or undefined

        // if (
        //   (meeting?.status === "closed" &&
        //     meeting?.prise_de_notes === "Automatic" &&
        //     areNotesSummarized) ||
        //   (meeting?.type === "Special" && areStepNotesSummarized)
        // ) {
        //   setShowProgressBar(true);
        //   await handleSecondApiCall(meeting.id); // Pass any required data
        // }
        if (
          (meeting?.status === "closed" &&
            meeting?.prise_de_notes === "Automatic" &&
            meeting?.summary_status === 0) ||
          (meeting?.type === "Special" && areStepNotesSummarized)
        ) {
          // setShowProgressBar(true);
          // await handleSecondApiCall(meeting.id); // Pass any required data
        }
        return { status: response.status, meeting };
      }
    } catch (error) {
      const status = error?.response?.status || 500;
      const message = error?.response?.data?.message || "An error occurred.";
      setVisibilityMessage(status === 403 ? message : message);
      setIsModalOpen(true);

      // return { status, message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportResponse = await getMeetingReport();

        if (reportResponse?.status === 200 && reportResponse?.meeting) {
          const { meeting } = reportResponse;

          if (meeting.status === "closed") {
            getMeetingByID(meeting.objective, meeting.user.id);
          } else if (
            ["active", "in_progress", "to_finish", "todo"].includes(
              meeting.status
            )
          ) {
            getActiveMeetingByID(meeting.objective, meeting.user.id);
          }
        } else if (reportResponse?.message || reportResponse?.status === 403) {
          console.error(
            "Visibility message or Forbidden status found:",
            reportResponse?.message
          );
          // setVisibilityMessage(reportResponse?.message || "Access Denied");
          // setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    };

    if (unqiue_id?.endsWith("--es")) {
      setUniqueId(true);
      getSpecialMeeting();
      getSpecialParticipants();
      getMilestones();
      getParticipantsByDestinationId();
    } else {
      fetchData();
    }
  }, [unqiue_id]);

  const [allMeetings, setAllMeetings] = useState([]);

  const [allFiles, setAllFiles] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const openModal = (file) => {
    setModalContent(file);
    setIsFileModalOpen(true);
  };
  const closeModal = () => {
    setIsFileModalOpen(false);
    setModalContent(null);
  };
  const getAllFiles = async () => {
    // Validate required data
    const destinationId = uniqueId ? meetId : meetingData?.destination_id;
    if (!destinationId) {
      console.warn("No destination ID available");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-public-destination-files/${destinationId}`
      );

      if (response?.status === 200) {
        const files = response?.data?.data || []; // Fallback to empty array

        // Files that are NOT media (i.e., treat as documents)
        const documentFiles = files.filter((file) => {
          const type = file?.file_type?.toLowerCase() || "";
          return !(
            type.startsWith("audio/") ||
            type.startsWith("video/") ||
            type.startsWith("image/")
          );
        });

        // Files that ARE media
        const mediaFiles = files.filter((file) => {
          const type = file?.file_type?.toLowerCase() || "";
          return (
            type.startsWith("audio/") ||
            type.startsWith("video/") ||
            type.startsWith("image/")
          );
        });

        setAllFiles(documentFiles);
        setAllMedia(mediaFiles);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      // Consider setting error state here for UI feedback
    }
  };

  useEffect(() => {
    // Only run if we have either meetId or destination_id
    if (meetId || meetingData?.destination_id) {
      getAllFiles();
    }
  }, [uniqueId, meetingData, destinationDate, meetId]); // Added meetId to dependencies
  const getMeetingByID = async (objective, userId) => {
    if (uniqueId) {
      return false;
    }

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const token = CookieService.get("token");
      const REQUEST_URL = `${API_BASE_URL}/get-public-meetings/${userId}/${objective}?destination_id=${desId}&current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`;

      const response = await axios.get(REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status) {
        const meetings = response.data?.data;

        setAllMeetings(meetings);
      } else {
        toast.error("Échec de la récupération du rapport");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveMeetingByID = async (objective, userId) => {
    if (uniqueId) {
      return false;
    }

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const token = CookieService.get("token");
      const REQUEST_URL = `${API_BASE_URL}/get-public-active-meetings/${userId}/${objective}?destination_id=${desId}&current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`;

      const response = await axios.get(REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status) {
        const meetings = response.data?.data;

        //  // Filter out duplicate meetings by ID
        //     const uniqueMeetings = meetings.reduce((acc, current) => {
        //       const x = acc.find(item => item.id === current.id);
        //       if (!x) {
        //         return acc.concat([current]);
        //       } else {
        //         return acc;
        //       }
        //     }, []);

        setAllMeetings(meetings);
      } else {
        toast.error("Échec de la récupération du rapport");
      }
    } catch (error) {
    } finally {
    }
  };

  const [callNow, setCallNow] = useState(false);

  useEffect(() => {
    if (callNow && !meetingTranscript) {
      const fetchTranscript = async () => {
        setTranscriptLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/transcripte-meeting-notes/${meetId}`
          );

          const transcript =
            response.data?.data?.meeting_notes_transcript?.transcript;

          if (response.status && transcript) {
            setMeetingTranscript(transcript);
            setViewNote("note");
          }
        } catch (error) {
          console.log("error while fetching meeting transcript", error);
          toast.error("Transcription Failed, Please Refresh the Page");
        } finally {
          setTranscriptLoading(false);
        }
      };

      fetchTranscript();
    }
  }, [callNow, meetingTranscript, meetId]);

  const hasTranscribedRef = useRef(false);

  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscriptionAndNext = async () => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);

    const simulateProgress = () => {
      setTranscriptionProgress((prev) => {
        if (prev >= 75) return prev;
        return prev + 1;
      });
    };

    const interval = setInterval(simulateProgress, 100);

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      // STEP 1: Fetch current meeting before transcription (optional but can help)
      const initialResponse = await axios.get(
        `${API_BASE_URL}/get-meeting/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`
      );

      const meeting = initialResponse?.data?.data;
      console.log("🧠 Meeting before transcription:", meeting);

      // STEP 2: Run transcription on freshly fetched meeting
      await runStepTranscription(meeting);
      console.log("✅ Transcription finished");

      // STEP 3: Now fetch latest version after transcription is saved
      const refreshedResponse = await axios.get(
        `${API_BASE_URL}/get-meeting/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`
      );

      clearInterval(interval); // Stop progress simulation

      if (refreshedResponse?.status === 200) {
        const updatedMeeting = refreshedResponse.data.data;
        setMeetingData(updatedMeeting);
        setTranscriptionProgress(100);
        hasTranscribedRef.current = true;

        setTimeout(() => {
          setIsTranscribing(false);
        }, 500);

        console.log(
          "🎉 Refreshed meeting with updated step notes:",
          updatedMeeting
        );
      }
    } catch (err) {
      console.error("❌ Error during transcription flow:", err);
      clearInterval(interval);
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    if (meetingTranscript && !meetingData?.meeting_notes_summary) {
      const fetchSummary = async () => {
        console.log("Fetching summary...");
        setSummaryLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/summarize-meeting-notes/${meetId}`
          );
          console.log("Summary response:", response);

          if (response.status === 200) {
            setMeetingSummary(response.data?.data?.meeting_notes_summary);
            console.log("Calling handleTranscriptionAndNext");
            await handleTranscriptionAndNext();
          }
        } catch (error) {
          console.log("error while fetching meeting summary", error);
          toast.error("Summarization Failed, Please Refresh the Page");
        } finally {
          setSummaryLoading(false);
        }
      };

      fetchSummary();
    }
  }, [meetingTranscript]);

  const formattedDate = convertDateToUserTimezone(
    meetingData?.date,
    meetingData?.start_time,
    meetingData?.timezone
  );

  const startTime = meetingData?.starts_at || meetingData?.start_time;
  const formattedTime = new Date(`1970-01-01T${startTime}`).toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: true }
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedTitleOrder, setSelectedTitleOrder] = useState(
    meetingData?.title_order
  );
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const applyFilter = async (item) => {
    try {
      setIsLoading(true);
      setFileClicked(false);

      // await getMeeting(item.id); // Fetch meeting data
      setSelectedTitleOrder(item.title_order);
      setDropdownVisible(!dropdownVisible);
      if (item?.status === "in_progress") {
        updateCallApi(true);
        navigate(`/destination/${item?.unique_id}/${item?.id}`);
      } else {
        updateCallApi(false);

        navigate(`/destination/${item.unique_id}/${item.id}`);
      }
      setSelectedMeeting({
        value: item?.id,
        label: item?.title,
      });
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false); // Hide loader whether successful or not
    }
  };
  const applyHeaderFilter = async (item) => {
    try {
      setIsLoading(true);
      setFileClicked(false);

      // await getMeeting(item.id); // Fetch meeting data
      setSelectedTitleOrder(item.title_order);
      // setDropdownVisible(!dropdownVisible);
      if (item?.status === "in_progress") {
        updateCallApi(true);

        navigate(`/destination/${item?.unique_id}/${item?.id}`);
      } else {
        updateCallApi(false);

        navigate(`/destination/${item.unique_id}/${item.id}`);
      }
      setSelectedMeeting({
        value: item?.id,
        label: item?.title,
      });
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false); // Hide loader whether successful or not
    }
  };
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };
  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const steps = meetingData?.steps || [];

  const lastStep = steps[steps.length - 1];
  const lastStepTime = lastStep?.end_time;
  const lastStepFormattedTime = new Date(
    `1970-01-01T${lastStepTime}`
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const calculateTotalDays = (steps) => {
    if (!steps) {
      return;
    }
    return steps?.reduce((total, step) => {
      return total + step.count2;
    }, 0);
  };
  const addDaysToDate = (date, days) => {
    if (!date || !days) {
      return;
    }
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  const formatDateInFrench = (dateString) => {
    if (!dateString) {
      return;
    }
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // const startDate = new Date(meetingData?.date);
  const startDate = new Date(`${meetingData?.date}T${meetingData?.start_time}`);

  const totalDays1 = calculateTotalDays(meetingData?.steps);

  let endDateForHour;
  if (meetingData?.type === "Action") {
    // If the meeting type is "Active", treat totalDays as total days
    endDateForHour = new Date(
      startDate.getTime() + totalDays1 * 24 * 60 * 60 * 1000
    );
  } else if (meetingData?.type === "Task") {
    // If the meeting type is "Task", treat totalDays as total hours
    endDateForHour = new Date(
      startDate.getTime() + totalDays1 * 60 * 60 * 1000
    );
  } else if (meetingData?.type === "Quiz") {
    // If the meeting type is "Quiz", treat totalDays as total seconds
    endDateForHour = new Date(startDate.getTime() + totalDays1 * 1000);
  } else {
    // Otherwise, treat totalDays as total minutes
    endDateForHour = new Date(startDate.getTime() + totalDays1 * 60 * 1000);
  }

  const formattedEndDateInHours = formatDateInFrench(endDateForHour);

  const endDate = addDaysToDate(startDate, totalDays1);
  const formattedEndDate = formatDateInFrench(endDate);

  const filteredActions = meetingData?.plan_d_actions?.reduce((acc, item) => {
    // Find if an entry with the same action, order, and action_days already exists
    const existing = acc.find(
      (obj) =>
        obj.action === item.action &&
        obj.order === item.order &&
        obj.action_days === item.action_days
    );

    // If it exists, we skip adding the current item to the accumulator
    if (!existing) {
      acc.push(item);
    }

    return acc;
  }, []);

  const guideEmails = new Set(meetingData?.guides?.map((guide) => guide.email));

  //Participant
  const [showProfile, setShowProfile] = useState(false);
  const handleShow = () => {
    setShowProfile(true);
  };
  const hideShow = () => {
    setShowProfile(false);
  };

  //Host
  const [showHostProfile, setShowHostProfile] = useState(false);
  const handleHostShow = () => {
    setShowHostProfile(true);
  };
  const hideHostShow = () => {
    setShowHostProfile(false);
  };

  //Closed Report Participant
  const [uuid, setUuid] = useState(null);
  const [show, setShow] = useState(false);

  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const [showStepperModal, setShowStepperModal] = useState(false);
  const [calendlyData, setCalendlyData] = useState(null);

  const handleShowSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleShowSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleShowStepperModal = (date, time) => {
    if (date && time) {
      setCalendlyData({
        selected_date: moment(date).format("YYYY-MM-DD"),
        selected_time: time
      });
    }
    setShowStepperModal(true);
    // setShowSignUp(true);
  };
  const handleCloseStepperModal = () => setShowStepperModal(false);

  const handleShowForgot = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgot(true);
  };

  const handleCloseSignUp = () => setShowSignUp(false);
  const handleCloseForgot = () => setShowForgot(false);

  const { toggle } = useSidebarContext();
  const handleClose = () => {
    toggle(true);
    setIsModalOpen(false);
    // onClose();
  };

  const handleLogin = () => {
    navigate("/", {
      state: {
        redirect_rules: false,

        fromInvitePage: true,
        fromProfile: true,
        previousPath: window.location.pathname + window.location.search,
      },
    });
  };

  const [password, setPassword] = useState(null);
  const checkPassword = async () => {
    const payload = {
      password: password,
      meeting_id: meetId,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/check-meeting-password`,
        payload
      );
      if (response?.status) {
        const meeting = response?.data?.data;
        toggle(true);
        handleClose();
        setMeetingAudio(meeting?.voice_notes);
        setMeetingTranscript(meeting?.meeting_notes_transcript?.transcript);
        setMeetingSummary(meeting?.meeting_notes_summary);
        setMeetingData(meeting);
        if (meeting.status === "closed") {
          const allEqual = steps.every(
            (step) => step.note?.trim() === step.original_note?.trim()
          );

          const someEqual = steps.some(
            (step) => step.note?.trim() === step.original_note?.trim()
          );

          const areNotesSummarized = allEqual || someEqual; // true if all or some equal, false if none

          const areStepNotesSummarized = steps
            ? steps.every((step) => step.note === null) || // All notes are null
            (steps.some((step) => step.note === null) &&
              steps.some((step) => step.note !== null)) // One note is null and one is not
            : undefined; // Handle the case when `steps` is null or undefined

          if (
            (meeting?.status === "closed" &&
              meeting?.prise_de_notes === "Automatic" &&
              meeting?.summary_status === 0) ||
            (meeting?.type === "Special" && areStepNotesSummarized)
          ) {
            // setShowProgressBar(true);
            // await handleSecondApiCall(meeting.id); // Pass any required data
          }
          getMeetingByID(meeting.objective, meeting.user.id);
        } else if (["active", "in_progress"].includes(meeting.status)) {
          getActiveMeetingByID(meeting.objective, meeting.user.id);
        }
        setSelectedMeeting({
          value: meeting?.id,
          label: meeting?.title,
        });
        setIsModalOpen(false);
        // getRefreshMeeting()
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Incorrect password");
    }
  };

  const [view, setView] = useState("list");
  // const [open1, setOpen1] = useState(false);
  const handleToggle = () => {
    setView(view === "list" ? "graph" : "list");
    // setOpen1(!open1);
  };

  const [activeEventKey, setActiveEventKey] = useState(null);

  const copyToClipboard = (nick_name) => {
    if (!nick_name) return;
    const visitingCardUrl =
      window.location.origin + "/heroes" + "/" + nick_name;

    navigator.clipboard.writeText(visitingCardUrl).then(
      () => { },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
    // navigate("/" + "heros" + "/" + user?.uuid);
    window.open("/" + "heroes" + "/" + nick_name, "_blank");
  };

  const viewPresentation = (data) => {
    setSelectedMeeting({
      value: data?.id,
      label: data?.title,
    });
    const url = `/destination/${data?.unique_id}/${data?.id}`;
    if (data?.status === "closed" || data?.status === "abort") {
      updateCallApi(false);

      navigate(url);
    } else if (data?.status === "in_progress") {
      updateCallApi(true);

      navigate(`/destination/${data?.unique_id}/${data?.id}`);
    } else {
      updateCallApi(false);

      navigate(url);
    }
  };

  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    if (destinationDate?.meetings) {
      // Set all keys open initially once destinationDate is available
      setOpenKeys(destinationDate.meetings.map((_, index) => index.toString()));
    }
  }, [destinationDate]);

  const handleToggleAccoridon = (key) => {
    setOpenKeys(
      (prevKeys) =>
        prevKeys.includes(key)
          ? prevKeys.filter((k) => k !== key) // Close if open
          : [...prevKeys, key] // Open if closed
    );
  };

  const [activeLink, setActiveLink] = useState("");

  const { updateLanguage } = useDraftMeetings();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    updateLanguage(lang);
  };

  const handleClick = () => {
    setFileClicked(false);
    setSelectedMeeting(null);
    setIsModalOpen(false);
    setShowHostProfile(false);

    const url =
      meetingData?.status === "closed" || meetingData?.status === "in_progress"
        ? `/destination/${meetingData?.destination_unique_id}--es/${meetingData?.destination_id}`
        : meetingData?.status === "active" ||
          meetingData?.status === "in_progress" ||
          meetingData?.status === "to_finish" ||
          meetingData?.status === "todo"
          ? `/destination/${meetingData?.destination_unique_id}--es/${meetingData?.destination_id}`
          : `/destination/${destinationDate?.uuid}--es/${destinationDate?.id}`;

    navigate(url);
    setIsModalOpen1(false);
  };
  useEffect(() => {
    const path = location.pathname;

    const destinationPattern =
      /^\/destination\/([a-f0-9\-]+)--es\/([a-f0-9\-]+)$/;
    if (destinationPattern.test(path)) {
      setActiveLink("/destination");
    } else {
      setActiveLink(path);
    }
  }, [location]);

  const renderIcon = () => {
    const type = meetingData?.type;
    return typeIcons[type] || null;
  };

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navbarStyle = {
    position: isSticky ? "fixed" : "relative",
    top: isSticky ? "0" : "auto",
    zIndex: 10000000000,
    boxShadow: isSticky ? "0 4px 2px -2px white" : "none",
  };

  const reportNavbarStyle = {
    position: isSticky ? "fixed" : "relative",
    top: isSticky ? "10%" : "auto", // 🔹 top se thoda space
    left: isSticky ? "50%" : "auto", // 🔹 horizontally center
    transform: isSticky ? "translateX(-50%)" : "none", // 🔹 perfect centering
    zIndex: 2,
    boxShadow: isSticky ? "0 4px 2px -2px rgba(0,0,0,0.1)" : "none",
    transition: "all 0.3s ease", // 🔹 smooth transition
    background: "white", // optional: background visible rahe jab fixed ho
    borderRadius: "10px", // optional: better look
    padding: "10px 20px", // optional: thoda spacing
  };

  // Handle change event
  const handleChange = (selectedOption) => {
    setFileClicked(false);
    setSelectedMeeting(selectedOption);

    if (selectedOption) {
      const selectedItem = destinationDate?.meetings?.find(
        (item) => item.id === selectedOption.value
      );

      if (selectedItem) {
        setUniqueId((prev) => !prev); // Assuming setUniqueId is defined elsewhere
        viewPresentation(selectedItem);
      }
    }
  };

  // Map the meetings to options
  const optionsMeetings = allMeetings
    ?.filter((item) => item.id.toString() !== meetId.toString())
    ?.map((item, index) => ({
      value: item.id,
      label: `${index + 1}. ${item.title}`, // Format as '1. title'
    }));

  const handleChangeMeetings = async (selectedOption) => {
    // console.log("selected option", selectedOption);
    setFileClicked(false);
    setSelectedMeeting(selectedOption);
    setUniqueId(false);

    await applyHeaderFilter(selectedOption);
  };

  const [dropdownWidth, setDropdownWidth] = useState(250); // Initial width

  const calculateDropdownWidth = (options) => {
    // Calculate width based on the longest label in the options
    const maxLabelLength = options.reduce((maxLength, option) => {
      const optionLength = option.label.length;
      return optionLength > maxLength ? optionLength : maxLength;
    }, 0);
    // You can adjust the multiplier to add padding or margins if needed
    setDropdownWidth(maxLabelLength * 8); // Adjusting width dynamically based on text length
  };

  useEffect(() => {
    if (optionsMeetings && optionsMeetings.length > 0) {
      calculateDropdownWidth(optionsMeetings);
    }
  }, [optionsMeetings]);

  const [reportProgress, setReportProgress] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Local state for login

  // Determine if content should be blurred based on registration info
  const isContentBlurred =
    meetingData?.casting_type === "Registration" &&
    meetingData?.price !== null &&
    meetingData?.max_participant !== null;

  // console.log("isContentBlurred", isContentBlurred);
  // Determine if user is among participants (excluding meeting creator)
  const shouldBlurContent = meetingData?.user_with_participants?.some(
    (item) =>
      item?.email === sessionUser?.email &&
      item?.email !== meetingData?.user?.email // exclude meeting creator
  );

  // console.log("shouldBlurContent", shouldBlurContent);

  // Final check
  const blurContent = isContentBlurred && shouldBlurContent;

  // console.log("blurContent", blurContent);

  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [anonymous, setAnonymous] = useState(false);
  const [userName, setUserName] = useState(null);

  const [submit, setSubmit] = useState(false);
  const onClose = () => {
    setShowFeedbackPopup(false);
    setRating(0);
    setFeedback(null);
    setAnonymous(false);
  };
  useEffect(() => {
    if (meetingData?.status === "closed" && meetingData?.feedback) {
      const hasGivenFeedback = checkUserFeedback(
        userid,
        meetingData.meeting_feedbacks
      );
      if (!hasGivenFeedback) {
        setShowFeedbackPopup(true);
      }
    }
  }, [meetingData]);

  // Check if the user has already provided feedback for the meeting
  const checkUserFeedback = (userId, feedbacks) => {
    return feedbacks?.some((feedback) => feedback?.user_id === userId);
  };
  const handleFeedbackSubmit = async () => {
    // Check if rating is not provided (but allow 0 as a valid rating)
    if (rating === null || rating === undefined) {
      // alert("Please provide a rating before submitting.");
      toast.error(t("Please provide a rating before submitting"));
      return;
    }

    if (!sessionUser && userName === null) {
      toast.error(t("Please enter your name before submitting"));
      return;
    }
    setLoading(true);
    setSubmit(true);

    try {
      await axios.post(
        `${API_BASE_URL}/moment-feedback`,
        {
          user_id: userid || null,
          meeting_id: meetingData.id,
          rating,
          user_name: userName,
          comment: feedback,
          anonymous,
        },
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      // Hide feedback popup after submission
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.response && error.response.data) {
        const { message, errors } = error.response.data;

        // Show the main error message
        if (message) {
          toast.error(t(message));
        }

        // Show validation errors (if any)
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            messages.forEach((msg) => toast.error(t(msg)));
          });
        }
      } else {
        // Fallback error message if no response data
        toast.error(t("Failed to submit feedback. Please try again."));
      }
    } finally {
      setUserName(null);
      setRating(null);
      setAnonymous(false);
      setFeedback(null);
      setLoading(false);
      setSubmit(false);
    }
  };

  const emojis = [
    {
      value: 5,
      emoji: "😎",
      label: t("5 Star"),
    }, // Cool
    { value: 4, emoji: "😀", label: t("4 Star") }, // Happy
    {
      value: 3,
      emoji: "🙂",
      label: t("3 Star"),
    }, // Neutral
    {
      value: 2,
      emoji: "😟",
      label: t("2 Star"),
    }, // Sad
    {
      value: 1,
      emoji: "😣",
      label: t("1 Star"),
    }, // Very Sad
    // { value: 0, emoji: "❌", label: t("0 Star") }, // No opinion
  ];

  const updateFromTektime = (value) => {
    setFromTektime(value);
    CookieService.set("fromTektime", value);
  };

  const [play, setPlay] = useState(false);
  const loggedInUserId =
    CookieService.get("user_id");
  const [workingHours, setWorkingHours] = useState([]);
  useEffect(() => {
    if (meetingData) {
      const getWorkingHours = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/user-scheduled-days/${loggedInUserId}/${meetingData?.destination?.id}`
          );
          if (response?.status === 200) {
            setWorkingHours(response?.data?.data?.working_days);
          }
        } catch (error) {
          console.log("error", error);
        }
      };
      getWorkingHours();
    }
  }, [meetingData]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // Get day index (0-6) instead of relying on day names
  // Map day index to English day names
  const getEnglishDayName = (dayIndex) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayIndex];
  };

  const handlePlay = async (item) => {
    updateCallApi(false);
    updateFromTektime(true);

    continueHandlePlay(item);
  };

  const continueHandlePlay = async (item) => {
    updateCallApi(false);
    updateFromTektime(true);

    setPlay(true);
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    const currentTime = new Date();

    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedCurrentDate = currentDateTime.toISOString().split("T")[0];

    const minOrderNo = Math.min(...item.steps.map((step) => step.order_no));

    // Find the first step (order_no 1)
    const firstStep = item.steps.find((step) => step.order_no === minOrderNo);
    const firstParticipant = firstStep?.assigned_to;

    // Format date and time in user's timezone
    const stepTimeFormatted = moment().tz(userTimeZone).format("hh:mm:ss A"); // "05:27:40 PM"
    const startDateFormatted = moment().tz(userTimeZone).format("YYYY-MM-DD"); // "2025-04-30"

    const updatedSteps = item?.steps?.map((step) => {
      if (step.id === firstStep.id) {
        // The actual step that's being played
        return {
          ...step,
          status: "in_progress",
          step_status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
          step_time: stepTimeFormatted,
          start_date: startDateFormatted,
        };
      } else if (
        step.order_no === minOrderNo &&
        step.assigned_to === firstParticipant
      ) {
        // Same order_no and same participant as first step → Todo
        return {
          ...step,
          step_status: "todo",
          status: "todo",
        };
      } else if (
        step.order_no === minOrderNo &&
        step.assigned_to !== firstParticipant
      ) {
        // Same order_no but different participant → in_progress
        return {
          ...step,
          step_status: "in_progress",
          status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
          step_time: stepTimeFormatted,
          start_date: startDateFormatted,
        };
      }
      return step;
    });

    // Calculate apply_day_off based on step time + count2
    let apply_day_off = 1; // Default value

    if (firstStep && firstStep.step_time) {
      // Parse the step_time (assuming format "hh:mm:ss A")
      const stepTime = moment(firstStep.step_time, "hh:mm:ss A");
      console.log("stepTime:", stepTime);
      console.log("firstStep:", firstStep);

      // Add count2 with time_unit
      const count2 = firstStep?.count2 || 0;
      const time_unit = firstStep?.time_unit || "hours";

      const stepTimePlusCount = stepTime.add(count2, time_unit);
      console.log("stepTimePlusCount:", stepTimePlusCount);

      // Get the day of week for the step time (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = stepTimePlusCount.day();
      console.log("dayOfWeek:", dayOfWeek);

      const englishDayName = getEnglishDayName(dayOfWeek);

      // Find working hours for this day
      const dayWorkingHours = workingHours.find(
        (day) => day.day.toLowerCase() === englishDayName.toLowerCase()
      );

      if (!dayWorkingHours) {
        // No working hours defined for this day
        apply_day_off = 0;
      } else {
        // Convert stepTimePlusCount to time string for comparison
        const stepTimePlusCountTime = stepTimePlusCount.format("HH:mm:ss");

        // Create time objects for comparison
        const stepTimeObj = moment(stepTimePlusCountTime, "HH:mm:ss");
        console.log("stepTimeObj:", stepTimeObj);
        const workStartObj = moment(dayWorkingHours.start_time, "HH:mm");
        const workEndObj = moment(dayWorkingHours.end_time, "HH:mm");

        console.log("workStartObj:", workStartObj);
        console.log("workEndObj:", workEndObj);

        console.log(
          "stepTimeObj.isBefore(workStartObj):",
          stepTimeObj.isBefore(workStartObj)
        );
        console.log(
          "stepTimeObj.isAfter(workEndObj):",
          stepTimeObj.isAfter(workEndObj)
        );

        // Check if step time + count2 is before work start or after work end
        const isBeforeWork = stepTimeObj.isBefore(workStartObj);
        const isAfterWork = stepTimeObj.isAfter(workEndObj);

        // If outside working hours, set apply_day_off to 0
        if (isBeforeWork || isAfterWork) {
          apply_day_off = 0;
        }
      }
    }

    const payload = {
      ...item,
      steps: updatedSteps,
      starts_at: localCurrentTime,
      date: formattedCurrentDate,
      current_date: currentDateTime,
      status: "in_progress",
      _method: "put",
      moment_privacy_teams:
        item?.moment_privacy === "team" &&
          item?.moment_privacy_teams?.length &&
          typeof item?.moment_privacy_teams[0] === "object"
          ? item?.moment_privacy_teams.map((team) => team.id)
          : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
      apply_day_off: 0,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const firstInProgressStep = item?.steps[0];
        if (
          item?.type === "Task" ||
          item?.type === "Strategy" ||
          item?.type === "Prestation Client"
        ) {
          markTodoMeeting(item?.id);
          // getMeeting()
        }
        // navigate(`/play/${item.id}`);

        window.location.reload();
        // window.open(`/destination/${item?.unique_id}/${item?.id}`, '_blank');

        setLoading(false);

        // navigate(`/destínation/${item?.unique_id}/${item?.id}`);
      }
    } catch (error) {
      console.log("error", error);
      setPlay(false);
    }
  };
  // Get session user details
  const sessionEmail = JSON.parse(CookieService.get("user"))?.email;

  // Check conditions
  const isEventOrganizer =
    meetingData?.event_organizer &&
    meetingData?.event_organizer?.email === sessionEmail;
  const isAgendaEvent =
    meetingData?.type === "Google Agenda Event" ||
    meetingData?.type === "Outlook Agenda Event";

  // Check if session email matches any of the meeting users or guides
  const isMeetingParticipant =
    meetingData?.user?.email === sessionEmail ||
    meetingData?.guides?.some((guide) => guide?.email === sessionEmail);

  // Final visibility condition
  const showButton =
    (isAgendaEvent && isEventOrganizer) || isMeetingParticipant;
  // Determine banner background based on meetingData
  const getBannerBackground = () => {
    if (meetingData?.destination_banner) {
      return `url(${meetingData.destination_banner})`;
    }
    return "none"; // Will use the gradient div
  };

  // Determine banner content
  const getBannerContent = (textColor) => {
    return (
      <Container>
        <Row className="align-items-center h-100">
          <Col
            xs={12}
            md={8}
            className="animate__animated animate__fadeInUp position-relative"
          >
            <h1 className="banner-title" style={{ color: textColor }}>
              {meetingData?.objective}
            </h1>
            <div className="client-name-mobile">
              {meetingData?.destination?.clients?.name && (
                <p className="client-name-text" style={{ color: textColor }}>
                  {meetingData?.destination?.clients?.name}
                </p>
              )}
            </div>
          </Col>
          <Col
            xs={12}
            md={4}
            className="text-center text-md-end animate__animated animate__zoomIn client-section"
          >
            <img
              src={
                meetingData?.destination?.clients?.client_logo
                  ? meetingData?.destination?.clients?.client_logo?.startsWith(
                    "http"
                  )
                    ? meetingData?.destination?.clients.client_logo
                    : `${Assets_URL}/${meetingData?.destination?.clients?.client_logo}`
                  : "/Assets/logo2.png"
              }
              alt="Company Logo"
              className="banner-logo"
            />
          </Col>
        </Row>
      </Container>
    );
  };

  const getDestinationBannerBackground = () => {
    if (destinationDate?.banner) {
      return `url(${destinationDate.banner})`;
    }
    return "none"; // Will use the gradient div
  };

  const getDestinatinBannerContent = (textColor) => {
    return (
      <Container>
        <Row className="align-items-center h-100">
          <Col
            xs={12}
            md={8}
            className="animate__animated animate__fadeInUp position-relative"
          >
            <h1 className="banner-title" style={{ color: textColor }}>
              {destinationDate?.destination_name}
            </h1>
            <div className="date-section mt-2">
              <img src="/Assets/invite-date.svg" alt="Date Icon" />
              &nbsp;
              <span
                className="fw-bold formate-date"
                style={{ color: textColor }}
              >
                {formatMissionDate(destinationDate?.meeting_start_date)}
                &nbsp; - &nbsp;
              </span>
              <span
                className="fw-bold formate-date"
                style={{ color: textColor }}
              >
                {formatMissionDate(destinationDate?.meeting_end_date)}
              </span>
            </div>
          </Col>
          <Col
            xs={12}
            md={4}
            className="text-center text-md-end animate__animated animate__zoomIn client-section"
          >
            <img
              src={
                destinationDate?.clients?.client_logo
                  ? destinationDate?.clients?.client_logo?.startsWith("http")
                    ? destinationDate?.clients?.client_logo
                    : `${Assets_URL}/${destinationDate?.clients?.client_logo}`
                  : "/Assets/logo2.png"
              }
              alt="Company Logo"
              className="banner-logo"
            />
          </Col>
        </Row>
      </Container>
    );
  };

  const parseMeetingDescription = (html) => {
    if (!html) return "";

    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let processedHtml = html.replace(urlRegex, (url) => {
      // Clean up the URL (remove trailing punctuation)
      let cleanUrl = url.replace(/[.,;!?]$/, "");

      // Check if it's already an anchor tag
      if (url.includes("<a ") && url.includes("href=")) {
        return url;
      }

      // Create proper anchor tag
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">${cleanUrl}</a>`;
    });

    // Clean up formatting
    processedHtml = processedHtml
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(
        /_{2,}/g,
        '<hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">'
      );

    return processedHtml;
  };

  // Add these states
  const [stepMedias, setStepMedias] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true); // ← NEW: Loading state for GET

  useEffect(() => {
    const fetchStepMedia = async () => {
      if (!meetId) {
        setMediaLoading(false);
        return;
      }

      setMediaLoading(true); // ← Start loading

      try {
        const response = await axios.get(
          `${API_BASE_URL}/meeting/${meetId}/all-media`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")
                }`,
            },
          }
        );

        if (response.status === 200) {
          setStepMedias(response?.data?.data?.media || []);
        }
      } catch (error) {
        console.error("Error fetching step media:", error);
        toast.error(t("Failed to load media"));
        setStepMedias([]);
      } finally {
        setMediaLoading(false); // ← Always stop loading
      }
    };
  if (meetId) {
      fetchStepMedia();
    }
  }, [meetId]); // ← Better dependency: step.id only

  const [isNavVisible, setIsNavVisible] = useState(false);

  const [isRun, setIsRun] = useState(false);
  const handleRunStep = async (step) => {
    updateCallApi(true);
    setIsRun(true);
    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentTime = new Date();

    const formattedCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedCurrentDate = currentTime.toISOString().split("T")[0];
    try {
      const postData = {
        step_status: "in_progress",
        status: "in_progress",
        current_time: formattedCurrentTime,
        current_date: formattedCurrentDate,
      };

      const response = await axios.post(
        `${API_BASE_URL}/run-upcoming-step/${step?.id}?pause_current_time=${formattedCurrentTime}&pause_current_date=${formattedCurrentDate}`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")
              }`,
          },
        }
      );
      if (response?.status) {
        // await getMeetingById();
        window.location.reload();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsRun(false);
    }
  };

  const [isReOpen, setIsReOpen] = useState(false);

  const handleReRunStep = async (step) => {
    updateCallApi(true);
    setIsReOpen(true);

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    const payload = {
      ...step,
      step_status: "in_progress",
      status: "in_progress",
      re_open_to_finish_step: true,
      pause_current_time: formattedTime,
      pause_current_date: formattedDate,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${step?.id}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")
              }`,
          },
        }
      );
      if (response?.status) {
        await markToFinish(step?.id);
        // await getMeetingById();
        window.location.reload();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error starting step:", error);
    } finally {
      setIsReOpen(false);
    }
  };

  const tableHeaderStyle = {
    backgroundColor: "#a3bae7 !important",
  };


  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/^```markdown\s*/, '').replace(/```$/, '').replace(/---/g, '');
  };

  const isMarkdownContent = (text) => {
    if (!text) return false;
    // Simple check: if it contains typical markdown patterns but not typical HTML tags
    const hasMarkdown = /[*_#\-+]|\[.*\]\(.*\)/.test(text);
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    return hasMarkdown && !hasHtml;
  };
  return (
    <>
      {isLoading ? (
        <>
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        </>
      ) : (
        <>
          {(!isModalOpen1 && meetingData?.status !== "in_progress" && meetingData?.status !== "to_finish") && (
            <div className="home-header">
              <nav
                id="navbar"
                className="container-fluid navbar bg-white navbar-expand-lg py-3"
                style={navbarStyle}
              >
                <div className="container">


                  <div>
                    {/* Logo - Always Centered */}
                    <Link
                      to="/"
                      className="navbar-brand "
                      style={{ zIndex: 10 }}
                    >
                      <img
                        src="/Assets/landing/logo.png"
                        alt="Logo"
                        className="img-fluid"
                      // style={{ height: "42px" }}
                      />
                    </Link>
                  </div>
                  <button
                    className="navbar-toggler bg-white"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon" />
                  </button>
                  <div
                    className="collapse navbar-collapse "
                    id="navbarSupportedContent"
                  >
                    <div className="navbar-nav ms-auto d-flex right-dropdown-profile w-100">
                      <ul className="navbar-nav mb-2 mb-lg-0 align-items-center justify-content-between w-100 ">
                        {
                          <div
                            className="d-flex align-items-center ms-5"
                          // style={{
                          //   visibility: uniqueId
                          //     ? "visible"
                          //     : !uniqueId &&
                          //       allMeetings?.filter(
                          //         (item) =>
                          //           Number(item?.id) !== Number(meetId)
                          //       )?.length > 0
                          //     ? "visible"
                          //     : "hidden",
                          // }}
                          >
                            {/* <li
                              className={`nav-item ${
                                activeLink === "/destination" && !fileClicked
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <span
                                className="nav-link pb-1"
                                onClick={handleClick}
                                style={{ cursor: "pointer" }}
                              >
                                {t("navbar.home")}
                              </span>
                            </li> */}
                            {/* <li
                              className={`nav-item ${
                                fileClicked ? "active" : ""
                              }`}
                            >
                              <span
                                className="nav-link pb-1"
                                onClick={handleClicked}
                                style={{ cursor: "pointer" }}
                              >
                                {t("navbar.file")}
                              </span>
                            </li> */}

                            {/* <li
                              className={`nav-item dropdown ${
                                selectedMeeting && !fileClicked ? "active" : ""
                              }`} // Add 'active' class if selectedMeeting exists
                            >
                              {!uniqueId ? (
                                <>
                                  <Select
                                    options={optionsMeetings}
                                    value={
                                      selectedMeeting
                                        ? {
                                            value: selectedMeeting.value,
                                            label: selectedMeeting.label,
                                          }
                                        : null
                                    } // Set selected value
                                    onChange={handleChangeMeetings} // Handle change
                                    placeholder="Moments"
                                    isSearchable={false}
                                    styles={{
                                      control: (provided, state) => ({
                                        ...provided,
                                        width: "290px",
                                        border: "none",
                                        outline: "none",
                                        cursor: "pointer",
                                        borderBottom:
                                          selectedMeeting && !fileClicked
                                            ? "3px solid rgba(255, 186, 0, 1)"
                                            : "none",
                                      }),
                                      menu: (base) => ({
                                        ...base,
                                        width: "290px",
                                      }),
                                      menuList: (base) => ({
                                        ...base,
                                        width: "290px",
                                      }),
                                    }}
                                  />
                                </>
                              ) : (
                                <>
                                  <Select
                                    options={options}
                                    onChange={handleChange}
                                    placeholder="Moments"
                                    value={
                                      selectedMeeting
                                        ? {
                                            value: selectedMeeting.value,
                                            label: selectedMeeting.label,
                                          }
                                        : null
                                    } // Set selected value
                                    // isSearchable
                                    // className="nav-link pb-1"
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        width: "290px",
                                        border: "none",
                                        boxShadow: "none",
                                        cursor: "pointer",
                                        borderBottom:
                                          selectedMeeting && !fileClicked
                                            ? "3px solid rgba(255, 186, 0, 1)"
                                            : "none", // Add border-bottom if an option is selected
                                      }),
                                      menu: (base) => ({
                                        ...base,
                                        width: "290px",
                                      }),
                                      menuList: (base) => ({
                                        ...base,
                                        width: "290px",
                                      }),
                                    }}
                                  />
                                </>
                              )}
                            </li> */}
                          </div>
                        }

                        <div className="d-flex align-items-center gap-4">
                          <li className="nav-item">
                            <div className="mt-1 swtich">
                              <label
                                className="form-check-label mr-2"
                                htmlFor="languageSwitch"
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: "13px",
                                  lineHeight: "15.73px",
                                  textAlign: "left",
                                  color: "#4C4C4C",
                                  fontWeight:
                                    i18n.language === "fr" ? 200 : "bold",
                                }}
                              >
                                {/* {i18n.language === "en" && "En"} */}
                                En
                              </label>

                              <div
                                className="form-check form-switch p-0"
                                style={{ minHeight: "0px" }}
                              >
                                <input
                                  className="form-check-input m-0"
                                  type="checkbox"
                                  id="languageSwitch"
                                  role="switch"
                                  checked={i18n.language === "fr"} // Set the checked state based on the current language
                                  onChange={() =>
                                    handleChangeLanguage(
                                      i18n.language === "fr" ? "en" : "fr"
                                    )
                                  }
                                />
                              </div>
                              <label
                                className="form-check-label"
                                htmlFor="languageSwitch"
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: "13px",
                                  lineHeight: "15.73px",
                                  textAlign: "left",
                                  color: "#4C4C4C",
                                  fontWeight:
                                    i18n.language === "en" ? 200 : "bold",
                                }}
                              >
                                {/* {i18n.language === "fr" && "Fr"} */}
                                Fr
                              </label>
                            </div>
                          </li>

                          {sessionUser ? (
                            <div className="connected_users">
                              <div className=" d-flex align-items-center flex-wrap">
                                <Avatar.Group>
                                  <Avatar
                                    size="large"
                                    src={
                                      sessionUser?.image?.startsWith("users/")
                                        ? Assets_URL + "/" + sessionUser?.image
                                        : sessionUser?.image
                                    }
                                  />
                                </Avatar.Group>
                                <span
                                  style={{
                                    marginLeft: "8px",
                                  }}
                                >
                                  {sessionUser?.full_name}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="nav-item">
                              <button
                                onClick={handleLogin}
                                className="nav-link ps-0 pb-1"
                              >
                                <div className="container-door align-items-center">
                                  {t("navbar.login")}

                                  <div className="flipbox top-0">
                                    <div className="flipbox-active"></div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          )}

          <>
            {!uniqueId ? (
              <div className={showProgressBar1 ? "blur-container" : ""}>
                {/* feedbact location */}
                {meetingData?.status === "closed" ||
                  meetingData?.status === "abort" ? (
                  <div className="app-container">
                    <div
                      className={
                        !(
                          (meeting?.location === "Google Meet" ||
                            meeting?.location === "Microsoft Teams") &&
                          !["Task", "Quiz", "Media", "Law"].includes(
                            meeting?.type
                          )
                        )
                          ? showProgressBar
                            ? "blur-container"
                            : ""
                          : null
                      }
                    >
                      <div>
                        <section
                          className={`banner ${meetingData?.destination_banner ? "has-image" : ""
                            }`}
                          style={{
                            backgroundImage: meetingData?.destination_banner
                              ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${meetingData.destination_banner})`
                              : "none",
                          }}
                        >
                          {meetingData?.destination_banner ? (
                            getBannerContent("white") // banner → white text
                          ) : (
                            <>
                              <div className="gradient-header">
                                <svg
                                  width="100%"
                                  height="100%"
                                  viewBox="0 0 1453 338"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  preserveAspectRatio="none"
                                >
                                  <g filter="url(#filter0_f_902_7997)">
                                    <rect
                                      width="100%"
                                      height="100%"
                                      fill="url(#paint0_linear_902_7997)"
                                    />
                                  </g>
                                  <defs>
                                    <filter
                                      id="filter0_f_902_7997"
                                      x="-66.5"
                                      y="-66.5"
                                      width="1573"
                                      height="404"
                                      filterUnits="userSpaceOnUse"
                                      colorInterpolationFilters="sRGB"
                                    >
                                      <feFlood
                                        floodOpacity="0"
                                        result="BackgroundImageFix"
                                      />
                                      <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                      />
                                      <feGaussianBlur
                                        stdDeviation="33.25"
                                        result="effect1_foregroundBlur_902_7997"
                                      />
                                    </filter>
                                    <linearGradient
                                      id="paint0_linear_902_7997"
                                      x1="856"
                                      y1="281.934"
                                      x2="863.131"
                                      y2="-138.913"
                                      gradientUnits="userSpaceOnUse"
                                    >
                                      <stop stopColor="white" />
                                      <stop offset="1" stopColor="#76C3EE" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>

                              {
                                getBannerContent(
                                  "black"
                                ) /* gradient → black text */
                              }
                            </>
                          )}
                        </section>

                        <nav
                          role="navigation"
                          aria-label="Main navigation"
                          className={`sidebar-nav ${isNavVisible ? "visible" : "hidden"
                            }`}
                          style={reportNavbarStyle}
                        >
                          <ul className="nav-list">
                            {[
                              {
                                id: "home",
                                label: t("navbar.home"),
                                icon: <FaHome />,
                              },
                              {
                                id: "report",
                                label: t("Report"),
                                icon: <FaChartBar />,
                              },
                              {
                                id: "guides",
                                label: t("Participants"),
                                icon: <FaBook />,
                              },
                              {
                                id: "steps",
                                label: t("Program"),
                                icon: <FaList />,
                              },
                              ...(meetingData?.meeting_files?.length > 0
                                ? [
                                  {
                                    id: "meeting_files",
                                    label: t(
                                      "meeting.newMeeting.labels.file"
                                    ),
                                    icon: <FaFileAlt />,
                                  },
                                ]
                                : []),
                              {
                                id: "decision",
                                label: "Decision",
                                icon: <FaGavel />,
                              },
                              ...(meetingData?.plan_d_actions?.length > 0
                                ? [
                                  {
                                    id: "strategy",
                                    label: t("planDActions"),
                                    icon: <FaLightbulb />,
                                  },
                                ]
                                : []),
                              ...(meetingData?.meeting_feedbacks?.length > 0
                                ? [
                                  {
                                    id: "feedbacks",
                                    label: t("Feedbacks"),
                                    icon: <MdOutlineReviews />,
                                  },
                                ]
                                : []),
                              {
                                id: "discussion",
                                label: "Discussion",
                                icon: <FaComments />,
                              },
                            ].map((item) => (
                              <li key={item.id}>
                                <button
                                  className="nav-link-custom"
                                  aria-label={`Navigate to ${item.label}`}
                                  title={item.label}
                                  onClick={() => {
                                    if (window.innerWidth < 768)
                                      setIsNavVisible(false);

                                    if (item.id === "home") {
                                      // 👇 yeh tumhara custom function chalega sirf home ke liye
                                      handleClick();
                                    } else {
                                      // 👇 baqi buttons pe smooth scroll
                                      document
                                        .getElementById(item.id)
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                    }
                                  }}
                                >
                                  {item.icon}
                                  <span>{item.label}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </nav>
                        <div className="form-actions d-flex justify-content-center mt-4">
                          <Button
                            className="next-btn"
                            style={{
                              alignItems: "center",
                              backgroundColor: "#4361ee",
                              border: "none",
                              borderRadius: "8px",
                              display: "flex",

                              flexDirection: "column",
                              fontWeight: "500",
                              padding: ".75rem 1.5rem",
                              transition: "all .2s ease",
                            }}
                            onClick={() => navigate(`/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`)}
                          >
                            <span>Essayer l'aventure TekTIME</span>

                            {/* <span className="btn-subtext">
                Personnalisez votre expérience en 2 minutes
              </span> */}
                          </Button>
                        </div>

                        <div className="main-content-9 mt-4 container">
                          <section
                            id="detail"
                            className="section detail-section animate__animated animate__fadeIn"
                          >
                            <div className="meeting-header">
                              <div className="header-row">
                                <div
                                  className="dropdown-container"
                                  ref={dropdownRef}
                                >
                                  <div className="content-heading-title d-flex align-items-center">
                                    <div
                                      className="icon-wrapper"
                                      style={{ cursor: "pointer" }}
                                    >
                                      {renderIcon()}
                                    </div>
                                    {selectedTitleOrder && (
                                      <span className="title-order">
                                        {selectedTitleOrder}
                                      </span>
                                    )}
                                    <span className="meeting-title mb-0">
                                      {meetingData?.title}
                                    </span>
                                    {meetingData?.status === "active" && (
                                      <span
                                        style={{
                                          marginLeft: "0.5rem",
                                          background: moment().isAfter(
                                            moment(
                                              `${meetingData?.date} ${meetingData?.start_time}`,
                                              "YYYY-MM-DD HH:mm"
                                            )
                                          )
                                            ? "#bb372f1a" // Red for late
                                            : "#e2e7f8", // Green for future
                                          color: moment().isAfter(
                                            moment(
                                              `${meetingData?.date} ${meetingData?.start_time}`,
                                              "YYYY-MM-DD HH:mm"
                                            )
                                          )
                                            ? "#bb372f"
                                            : "#5b7aca",
                                          padding: "0.25rem 0.5rem",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        {moment().isAfter(
                                          moment(
                                            `${meetingData?.date} ${meetingData?.start_time}`,
                                            "YYYY-MM-DD HH:mm"
                                          )
                                        )
                                          ? t("badge.late")
                                          : t("badge.future")}
                                      </span>
                                    )}
                                    {meetingData?.status === "closed" && (
                                      <span
                                        style={{
                                          marginLeft: "0.5rem",
                                          background: "#38993c1a", // Green for future
                                          color: "#38993c",
                                          padding: "0.25rem 0.5rem",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        {t("badge.finished")}
                                      </span>
                                    )}
                                    {meetingData?.status === "abort" && (
                                      <span
                                        style={{
                                          marginLeft: "0.5rem",
                                          background: "#bb372f1a", // Green for future
                                          color: "#bb372f",
                                          padding: "0.25rem 0.5rem",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        {t("badge.cancel")}
                                      </span>
                                    )}
                                    {meetingData?.status === "no_status" && (
                                      <span
                                        style={{
                                          display: "none",
                                          marginLeft: "0.5rem",
                                          background: "#6c757d",
                                          color: "white",
                                          padding: "0.25rem 0.5rem",
                                          borderRadius: "0.25rem",
                                          fontSize: "0.875rem",
                                        }}
                                      >
                                        {t("badge.no_status")}
                                      </span>
                                    )}
                                    {allMeetings?.filter(
                                      (item) =>
                                        Number(item?.id) !== Number(meetId)
                                    )?.length > 0 && (
                                        <MdKeyboardArrowDown
                                          size={30}
                                          onClick={toggleDropdown}
                                          style={{
                                            cursor: "pointer",
                                            marginBottom: "6px",
                                          }}
                                        />
                                      )}
                                  </div>
                                  {dropdownVisible && (
                                    <div className="dropdown-content-filter">
                                      <div className="dropdown-section">
                                        {allMeetings
                                          ?.filter(
                                            (item) =>
                                              item.id.toString() !==
                                              meetId.toString()
                                          )
                                          ?.map((item, index) => (
                                            <div
                                              key={index}
                                              onClick={() => applyFilter(item)}
                                              style={{
                                                cursor: "pointer",
                                                padding: "8px 12px",
                                              }}
                                              className="border-bottom"
                                            >
                                              <b>{item.title_order}</b>.{" "}
                                              {item.title}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-4 items mt-2 audio-items">
                                <div className="type">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                                      fill="#8590A3"
                                    />
                                  </svg>
                                  <span className="time ms-2 text-muted">
                                    {meetingData?.solution
                                      ? meetingData?.solution?.title
                                      : meetingData?.type ===
                                        "Google Agenda Event"
                                        ? "Google Agenda Event"
                                        : meetingData?.type ===
                                          "Outlook Agenda Event"
                                          ? "Outlook Agenda Event"
                                          : meetingData?.type === "Special"
                                            ? "Media"
                                            : meetingData?.type === "Prise de contact"
                                              ? "Prise de contact"
                                              : t(`types.${meetingData?.type}`)}
                                  </span>
                                </div>
                              </div>
                              <div className="meeting-dates mt-3">
                                <div className="date-row">
                                  <img
                                    src="/Assets/invite-date.svg"
                                    alt="Date"
                                    className="date-icon"
                                  />

                                  <div className="date-details">
                                    {meetingData?.type === "Action" ||
                                      meetingData?.type === "Newsletter" ||
                                      meetingData?.type === "Strategy" ? (
                                      <>
                                        <span className="date-text">
                                          {formattedDate}
                                        </span>
                                        <span className="date-separator">
                                          -
                                        </span>
                                        <span className="date-text">
                                          {estimateDate}
                                        </span>
                                      </>
                                    ) : meetingData?.type === "Special" ||
                                      meetingData?.type === "Law" ? (
                                      <>
                                        <span className="date-text">
                                          {formattedDate}&nbsp;{t("at")}
                                        </span>
                                        <span className="date-text">
                                          {convertTo12HourFormat(
                                            meetingData?.start_time,
                                            meetingData?.date,
                                            meetingData?.steps,
                                            meetingData?.timezone
                                          )}
                                        </span>
                                        <span className="date-separator">
                                          -
                                        </span>
                                        <span className="date-text">
                                          {estimateDate}&nbsp;{t("at")}
                                        </span>
                                        <span className="date-text">
                                          {specialMeetingEndTime(
                                            meetingData?.start_time,
                                            meetingData?.date,
                                            meetingData?.steps,
                                            meetingData?.timezone
                                          )}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="date-text">
                                          {formattedDate}&nbsp;{t("at")}
                                        </span>
                                        <span className="date-text">
                                          {convertTo12HourFormat(
                                            meetingData?.starts_at ||
                                            meetingData?.start_time,
                                            meetingData?.date,
                                            meetingData?.steps,
                                            meetingData?.timezone
                                          )}
                                        </span>
                                        <span className="date-separator">
                                          -
                                        </span>
                                        <span className="date-text">
                                          {estimateDate}&nbsp;{t("at")}
                                        </span>
                                        <span className="date-text">
                                          {estimateTime}
                                        </span>
                                      </>
                                    )}

                                    <span className="timezone-text">
                                      {getTimezoneSymbol(
                                        CookieService.get("timezone")
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                {(meetingData?.location &&
                                  meetingData?.location !== "None") ||
                                  (meetingData?.agenda &&
                                    meetingData?.agenda !== "None") ? (
                                  <div className="d-flex gap-4 align-items-center mt-2 mb-2">
                                    {meetingData?.location &&
                                      meetingData?.location !== "None" && (
                                        <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                          {meetingData?.location === "Zoom" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                                                    fill="#4087FC"
                                                  ></path>
                                                  <path
                                                    d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z"
                                                    fill="white"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {
                                                  meetingData?.user
                                                    ?.user_zoom_info
                                                    ?.display_name
                                                }
                                              </span>
                                            </>
                                          ) : meetingData?.location ===
                                            "Microsoft Teams" ? (
                                            <>
                                              <SiMicrosoftteams
                                                style={{ color: "#6264A7" }}
                                                className="fs-5"
                                                size={28}
                                              />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.visioconference_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Microsoft Teams"
                                                )?.value || "Microsoft Teams"}
                                              </span>
                                            </>
                                          ) : meetingData?.location ===
                                            "Google Meet" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.23969 30 6.55953 30 5.27606 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z"
                                                    fill="#FBBC05"
                                                  ></path>
                                                  <path
                                                    d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z"
                                                    fill="#FBBC05"
                                                  ></path>
                                                  <path
                                                    d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z"
                                                    fill="#34A853"
                                                  ></path>
                                                  <path
                                                    d="M10.1042 7L5 12.4H10.0956L10.1042 7Z"
                                                    fill="#EA4335"
                                                  ></path>
                                                  <path
                                                    d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z"
                                                    fill="#1967D2"
                                                  ></path>
                                                  <path
                                                    d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z"
                                                    fill="#4285F4"
                                                  ></path>
                                                  <path
                                                    d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z"
                                                    fill="#34A853"
                                                  ></path>
                                                  <path
                                                    d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z"
                                                    fill="#188038"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.visioconference_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Google Meet"
                                                )?.value || "Google Meet"}
                                              </span>
                                            </>
                                          ) : null}
                                        </p>
                                      )}
                                    {meetingData?.agenda &&
                                      meetingData?.agenda !== "None" && (
                                        <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                          {meetingData?.agenda ===
                                            "Zoom Agenda" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                                                    fill="#4087FC"
                                                  ></path>
                                                  <path
                                                    d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z"
                                                    fill="white"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {
                                                  meetingData?.user
                                                    ?.user_zoom_info
                                                    ?.display_name
                                                }
                                              </span>
                                            </>
                                          ) : meetingData?.agenda ===
                                            "Outlook Agenda" ? (
                                            <>
                                              <SiMicrosoftoutlook
                                                style={{ color: "#0078D4" }}
                                                className="fs-5"
                                                size={28}
                                              />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.integration_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Outlook Agenda"
                                                )?.value || "Outlook Agenda"}
                                              </span>
                                            </>
                                          ) : meetingData?.agenda ===
                                            "Google Agenda" ? (
                                            <>
                                              <FcGoogle size={28} />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.integration_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Google Agenda"
                                                )?.value || "Google Agenda"}
                                              </span>
                                            </>
                                          ) : null}
                                        </p>
                                      )}
                                  </div>
                                ) : null}

                                <div className="ps-0">
                                  {meetingData?.address ? (
                                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 ms-0 mt-2">
                                      <FaLocationDot size={25} />
                                      <span>{meetingData?.address}</span>
                                    </p>
                                  ) : null}
                                </div>
                                {meetingData?.room_details ? (
                                  <div>
                                    <p className="d-flex gap-2 mt-2 justify-content-start align-items-top ps-0">
                                      <BsPersonWorkspace size={25} />
                                      <p className="m-0">
                                        {meetingData?.room_details}
                                      </p>
                                    </p>
                                  </div>
                                ) : null}
                                {meetingData?.phone ? (
                                  <div>
                                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 mt-2">
                                      <FaPhoneAlt size={25} />
                                      <a
                                        href={`tel:${meetingData.phone}`}
                                        className="text-decoration-none"
                                      >
                                        <span>{meetingData.phone}</span>
                                      </a>
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                              {(meetingData?.prise_de_notes === "Automatic" ||
                                meetingData?.alarm === true ||
                                meetingData?.autostart === "automatic" ||
                                meetingData?.playback === true ||
                                meetingData?.notification === true ||
                                meetingData?.automatic_strategy === true) && (
                                  <div className="row mt-3">
                                    <div className="col-md-12 d-flex align-items-center gap-3 flex-wrap">
                                      {meetingData?.prise_de_notes ===
                                        "Automatic" && (
                                          <div className="d-flex align-items-center gap-2">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="28"
                                              height="28"
                                              viewBox="0 0 28 28"
                                              fill="none"
                                            >
                                              <g filter="url(#filter0_d_1_1154)">
                                                <circle
                                                  cx="14"
                                                  cy="12"
                                                  r="10"
                                                  stroke="url(#paint0_linear_1_1154)"
                                                  strokeWidth="4"
                                                />
                                              </g>
                                              <defs>
                                                <filter
                                                  id="filter0_d_1_1154"
                                                  x="0"
                                                  y="0"
                                                  width="28"
                                                  height="28"
                                                  filterUnits="userSpaceOnUse"
                                                  colorInterpolationFilters="sRGB"
                                                >
                                                  <feFlood
                                                    floodOpacity="0"
                                                    result="BackgroundImageFix"
                                                  />
                                                  <feColorMatrix
                                                    in="SourceAlpha"
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                    result="hardAlpha"
                                                  />
                                                  <feOffset dy="2" />
                                                  <feGaussianBlur stdDeviation="1" />
                                                  <feColorMatrix
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                                                  />
                                                  <feBlend
                                                    mode="normal"
                                                    in2="BackgroundImageFix"
                                                    result="effect1_dropShadow_1_1154"
                                                  />
                                                  <feBlend
                                                    mode="normal"
                                                    in="SourceGraphic"
                                                    in2="effect1_dropShadow_1_1154"
                                                    result="shape"
                                                  />
                                                </filter>
                                                <linearGradient
                                                  id="paint0_linear_1_1154"
                                                  x1="14"
                                                  y1="0"
                                                  x2="20.375"
                                                  y2="21.75"
                                                  gradientUnits="userSpaceOnUse"
                                                >
                                                  <stop stopColor="#B11FAB" />
                                                  <stop
                                                    offset="0.514"
                                                    stopColor="#56E8F1"
                                                  />
                                                  <stop
                                                    offset="1"
                                                    stopColor="#2F47C1"
                                                  />
                                                </linearGradient>
                                              </defs>
                                            </svg>
                                            <span className="solutioncards option-text text-muted">
                                              {t(
                                                "meeting.formState.Automatic note taking"
                                              )}
                                            </span>
                                          </div>
                                        )}

                                      {meetingData?.alarm === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.Beep alarm")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.autostart === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.Autostart")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.playback === "automatic" && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t(
                                              "meeting.formState.Lecture playback"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.notification === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            width="25px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                            <circle
                                              cx="19"
                                              cy="5"
                                              r="3"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                            ></circle>
                                            <path
                                              d="M7 14H16"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                            <path
                                              d="M7 17.5H13"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.notification")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.automatic_strategy ===
                                        true && (
                                          <>
                                            <div>
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="25"
                                                height="24"
                                                viewBox="0 0 25 24"
                                                fill="none"
                                              >
                                                <path
                                                  fill-rule="evenodd"
                                                  clip-rule="evenodd"
                                                  d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                                  fill="#3D57B5"
                                                />
                                              </svg>
                                              <span
                                                className="solutioncards"
                                                style={{ color: "#3D57B5" }}
                                              >
                                                {t(
                                                  "meeting.formState.Automatic Strategy"
                                                )}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                )}
                              <div className="row mt-3">
                                <div className="col-md-12 mt-2 ms-1 d-flex align-items-center gap-3">
                                  <span
                                    style={{
                                      fontFamily: "Inter",
                                      fontSize: "12px",
                                      fontWeight: 400,
                                      lineHeight: "14.52px",
                                      textAlign: "left",
                                      color: "#8590a3",
                                    }}
                                  >
                                    {t("Privacy")}:
                                  </span>
                                  <div className="">
                                    <div className="d-flex align-items-center flex-wrap">
                                      {meetingData?.moment_privacy ===
                                        "public" ? (
                                        <img
                                          src="/Assets/Tek.png"
                                          alt="Public"
                                          style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "0",
                                          }}
                                        />
                                      ) : meetingData?.moment_privacy ===
                                        "team" ? (
                                        <div className="d-flex">
                                          {meetingData?.moment_privacy_teams_data?.map(
                                            (item, idx) => (
                                              <div key={idx} className="me-1">
                                                <img
                                                  src={
                                                    item?.logo?.startsWith(
                                                      "http"
                                                    )
                                                      ? item.logo
                                                      : `${Assets_URL}/${item.logo}`
                                                  }
                                                  alt={item?.name}
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                  title={item?.name}
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "participant only" ? (
                                        <div className="d-flex">
                                          {meetingData?.user_with_participants?.map(
                                            (item, idx) => (
                                              <div key={idx} className="me-1">
                                                <img
                                                  src={
                                                    item?.participant_image?.startsWith(
                                                      "http"
                                                    )
                                                      ? item.participant_image
                                                      : `${Assets_URL}/${item.participant_image}`
                                                  }
                                                  alt={item?.full_name}
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                  title={item?.full_name}
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "tektime members" ? null : meetingData?.moment_privacy ===
                                          "enterprise" ? (
                                        <div>
                                          <img
                                            src={
                                              meetingData?.user?.enterprise?.logo?.startsWith(
                                                "http"
                                              )
                                                ? meetingData?.user?.enterprise
                                                  ?.logo
                                                : `${Assets_URL}/${meetingData?.user?.enterprise?.logo}`
                                            }
                                            alt={
                                              meetingData?.user?.enterprise
                                                ?.name
                                            }
                                            style={{
                                              width: "30px",
                                              height: "30px",
                                              borderRadius: "50%",
                                              objectFit: "fill",
                                              objectPosition: "top",
                                            }}
                                            title={
                                              meetingData?.user?.enterprise
                                                ?.name
                                            }
                                          />
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "password" ? (
                                        <svg
                                          width="37px"
                                          height="36px"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                            stroke="#000000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <img
                                          src={
                                            meetingData?.user?.image?.startsWith(
                                              "users/"
                                            )
                                              ? `${Assets_URL}/${meetingData?.user?.image}`
                                              : meetingData?.user?.image
                                          }
                                          alt={meetingData?.user?.full_name}
                                          style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            objectPosition: "top",
                                          }}
                                          title={meetingData?.user?.full_name}
                                        />
                                      )}
                                      <Badge
                                        className={`ms-2 ${meetingData?.moment_privacy ===
                                          "private"
                                          ? "solution-badge-red"
                                          : meetingData?.moment_privacy ===
                                            "public"
                                            ? "solution-badge-green"
                                            : meetingData?.moment_privacy ===
                                              "enterprise" ||
                                              meetingData?.moment_privacy ===
                                              "participant only" ||
                                              meetingData?.moment_privacy ===
                                              "tektime members"
                                              ? "solution-badge-blue"
                                              : meetingData?.moment_privacy ===
                                                "password"
                                                ? "solution-badge-red"
                                                : "solution-badge-yellow"
                                          }`}
                                        style={{ padding: "3px 8px" }}
                                      >
                                        {meetingData?.moment_privacy ===
                                          "private"
                                          ? t("solution.badge.private")
                                          : meetingData?.moment_privacy ===
                                            "public"
                                            ? t("solution.badge.public")
                                            : meetingData?.moment_privacy ===
                                              "enterprise"
                                              ? t("solution.badge.enterprise")
                                              : meetingData?.moment_privacy ===
                                                "participant only"
                                                ? t("solution.badge.participantOnly")
                                                : meetingData?.moment_privacy ===
                                                  "tektime members"
                                                  ? t("solution.badge.membersOnly")
                                                  : meetingData?.moment_privacy ===
                                                    "password"
                                                    ? t("solution.badge.password")
                                                    : t("solution.badge.team")}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {meetingData?.description && (
                                <div className="paragraph-parent mt-3 ps-2 ps-md-4 ps-lg-0">
                                  <span className="paragraph paragraph-images">
                                    {isMarkdownContent(meetingData?.description) ? (
                                      <div className="markdown-content">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            h1: ({ node, ...props }) => <h3 {...props} />,
                                            h2: ({ node, ...props }) => <h4 {...props} />,
                                            h3: ({ node, ...props }) => <h5 {...props} />,
                                            p: ({ node, ...props }) => <p {...props} />,
                                            ul: ({ node, ...props }) => <ul {...props} />,
                                            ol: ({ node, ...props }) => <ol {...props} />,
                                            strong: ({ node, ...props }) => <strong {...props} />,
                                            code: ({ node, inline, ...props }) =>
                                              inline ? <code {...props} /> : <code {...props} />,
                                          }}
                                        >
                                          {cleanText(meetingData?.description)}
                                        </ReactMarkdown>
                                      </div>
                                    ) : (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: meetingData?.description || "",
                                        }}
                                      />
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* {meetingData?.meeting_notes_summary &&      */}
                          <section id="report" className="section">
                            <h3 className="section-title-1 text-left">
                              {viewNote === "note"
                                ? `${t("Summary of")}: ${meetingData?.type === "Google Agenda Event"
                                  ? "Google Agenda Event"
                                  : meetingData?.type ===
                                    "Outlook Agenda Event"
                                    ? "Outlook Agenda Event"
                                    : t(`types.${meetingData?.type}`)
                                }`
                                : viewNote === "prompt"
                                  ? `${t("Prompt")}: ${meetingData?.solution
                                    ? meetingData?.solution?.title
                                    : t(
                                      `types.${meetingData?.prompts[0]?.meeting_type}`
                                    )
                                  }`
                                  : `${t("Transcript")}`}

                              <span
                                style={{
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              ></span>
                            </h3>
                            {loading ? (
                              <div
                                style={{
                                  width: "100%",
                                  margin: "20px 0",
                                }}
                              >
                                <ProgressBar animated now={45} />
                                <h5 className="text-center">
                                  {" "}
                                  {t("note_translation.Processing Audio")}
                                </h5>
                              </div>
                            ) : (
                              <div className="markdown-content">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({ node, ...props }) => (
                                      <h1 {...props} />
                                    ),
                                    h2: ({ node, ...props }) => (
                                      <h2 {...props} />
                                    ),
                                    h3: ({ node, ...props }) => (
                                      <h3 {...props} />
                                    ),
                                    p: ({ node, ...props }) => <p {...props} />,
                                    ul: ({ node, ...props }) => (
                                      <ul {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                      <ol {...props} />
                                    ),
                                    strong: ({ node, ...props }) => (
                                      <strong {...props} />
                                    ),
                                    code: ({ node, inline, ...props }) =>
                                      inline ? (
                                        <code {...props} />
                                      ) : (
                                        <code {...props} />
                                      ),
                                  }}
                                >
                                  {cleanText(meetingData?.meeting_notes_summary || "")}
                                </ReactMarkdown>
                              </div>
                            )}
                          </section>
                          {/* // } */}

                          <section id="guides" className="section">
                            <h2 className="section-title-1 text-left">
                              {meetingData?.guides?.length > 1
                                ? t("Guides")
                                : t("Guide")}
                            </h2>

                            <div className="guides-container">
                              <ReportHostCard
                                data={meetingData?.user}
                                guides={meetingData?.guides}
                                handleShow={handleHostShow}
                                handleHide={hideHostShow}
                                showProfile={showHostProfile}
                                meeting={meetingData}
                              />
                            </div>
                          </section>

                          {meetingData?.type !== "Newsletter" &&
                            meetingData?.participants?.filter(
                              (item) => !guideEmails?.has(item.email)
                            )?.length > 0 && (
                              <section id="guides" className="section">
                                <h2 className="section-title-1 text-left">
                                  {t("invite")}
                                  <span
                                    style={{
                                      fontFamily: "Roboto",
                                      fontSize: "16px",
                                      fontWeight: 400,
                                      lineHeight: "18.75px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {"(" +
                                      meetingData?.participants?.filter(
                                        (item) => !guideEmails?.has(item.email)
                                      ).length +
                                      "/" +
                                      meetingData?.participants?.filter(
                                        (item) => !guideEmails?.has(item.email)
                                      ).length +
                                      ")"}
                                  </span>
                                </h2>
                                <div className="guides-container">
                                  {/* {meetingData?.type !== "Newsletter" &&
                                      meetingData?.participants?.filter(
                                        (item) => !guideEmails?.has(item.email)
                                      )?.length > 0 &&
                                      meetingData?.participants
                                        ?.filter(
                                          (item) =>
                                            !guideEmails?.has(item.email)
                                        )
                                        ?.map((item, index) => (
                                          <ProfileCard
                                            key={index}
                                            user={item}
                                            isGuide={false}
                                            meetingType={meetingData?.type}
                                            handleProfile={handleProfileClick}
                                            t={t}
                                            Assets_URL={Assets_URL}
                                          />
                                        ))} */}
                                  {meetingData?.type !== "Newsletter" && (
                                    <>
                                      <ReportParticipantCard
                                        data={meetingData?.participants}
                                        guides={meetingData?.guides}
                                        handleShow={handleShow}
                                        handleHide={hideShow}
                                        showProfile={showProfile}
                                        meeting={meetingData}
                                      />
                                    </>
                                  )}
                                </div>
                              </section>
                            )}

                          {meetingData?.steps?.length > 0 && (
                            <section id="steps" className="section">
                              <h2 className="section-title-1 text-left">
                                {t("meeting.newMeeting.labels.Program")}
                              </h2>
                              <div className="steps-desktop d-none d-md-block">
                                {meetingData.steps.map((step, index) => (
                                  <ReportStepCard
                                    key={index}
                                    index={index}
                                    item={step}
                                    startTime={formattedTime}
                                    users={{
                                      ...meetingData?.user,
                                      firstName: meetingData?.user?.name,
                                      lastName: meetingData?.user?.last_name,
                                      image:
                                        meetingData?.user?.assigned_to_image ||
                                        meetingData?.user?.image ||
                                        "/Assets/avatar.jpeg",
                                    }}
                                    meeting={meetingData}
                                    setMeetingData={setMeetingData}
                                    transcriptionProgress={
                                      transcriptionProgress
                                    }
                                    isTranscribing={isTranscribing}
                                    Assets_URL={Assets_URL}
                                    t={t}
                                    stepMedias={stepMedias || []}
                                  />
                                ))}
                              </div>
                              <Accordion
                                defaultActiveKey="0"
                                className="steps-accordion d-md-none"
                              >
                                {meetingData.steps.map((step, index) => (
                                  <ReportStepCard
                                    key={index}
                                    index={index}
                                    item={step}
                                    startTime={formattedTime}
                                    users={{
                                      ...meetingData?.user,
                                      firstName: meetingData?.user?.name,
                                      lastName: meetingData?.user?.last_name,
                                      image:
                                        meetingData?.user?.assigned_to_image ||
                                        meetingData?.user?.image ||
                                        "/Assets/avatar.jpeg",
                                    }}
                                    meeting={meetingData}
                                    setMeetingData={setMeetingData}
                                    transcriptionProgress={
                                      transcriptionProgress
                                    }
                                    isTranscribing={isTranscribing}
                                    Assets_URL={Assets_URL}
                                    t={t}
                                    isAccordion
                                    stepMedias={stepMedias || []}
                                  />
                                ))}
                              </Accordion>
                            </section>
                          )}
                          {meetingData?.meeting_files?.length > 0 && (
                            <section id="meeting_files" className="section">
                              <h2 className="section-title-1 text-left">
                                {`${t("meeting.newMeeting.labels.file")} `}
                              </h2>
                              <CompletedReportStepFile
                                data={meetingData?.meeting_files}
                                meeting={meetingData}
                                startTime={formattedTime}
                                users={{
                                  ...meetingData?.user,
                                  firstName: meetingData?.user?.name,
                                  lastName: meetingData?.user?.last_name,
                                  image:
                                    meetingData?.user?.assigned_to_image ||
                                    meetingData?.user?.image ||
                                    "/Assets/avatar.jpeg",
                                }}
                              />
                            </section>
                          )}

                          {meetingData.step_decisions &&
                            meetingData.step_decisions.some(
                              (decision) => decision !== null
                            ) && (
                              <section id="decision" className="section">
                                <h4 className="section-title-1 text-left">
                                  {`${t(
                                    "meeting.newMeeting.labels.decisions"
                                  )} `}
                                </h4>
                                <DecisionCard
                                  data={meetingData?.steps}
                                  meeting={meetingData}
                                />
                              </section>
                            )}
                          {meetingData?.plan_d_actions?.length > 0 && (
                            <section id="strategy" className="section py-4">
                              {/* <Container fluid> */}
                              <Row>
                                <Col>
                                  <h4 className="section-title-1 text-left mb-4">
                                    {`${t("Strategy")} `}
                                  </h4>
                                  <div className="table-responsive">
                                    <Table
                                      bordered
                                      hover
                                      className="action-table"
                                    >
                                      <thead>
                                        <tr style={tableHeaderStyle}>
                                          <th
                                            className="text-left"
                                            style={{
                                              paddingLeft: "1.5rem",
                                              background: "#f2f9ff",
                                              borderLeft: "1px solid #a3bae7",
                                              borderTop: "1px solid #a3bae7",
                                              borderBottom: "1px solid #a3bae7",
                                              color: "#5079b2",
                                            }}
                                          >
                                            {t("tasks")}
                                          </th>
                                          <th
                                            className="text-center"
                                            style={{
                                              background: "#f2f9ff",
                                              borderLeft: "1px solid #a3bae7",
                                              borderTop: "1px solid #a3bae7",
                                              borderBottom: "1px solid #a3bae7",
                                              color: "#5079b2",
                                            }}
                                          >
                                            {t("duration")}
                                          </th>
                                          <th
                                            className="text-center"
                                            style={{
                                              background: "#f2f9ff",
                                              borderLeft: "1px solid #a3bae7",
                                              borderTop: "1px solid #a3bae7",
                                              borderBottom: "1px solid #a3bae7",
                                              color: "#5079b2",
                                            }}
                                          >
                                            {t("participant")}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredActions?.map((user, index) => (
                                          <tr key={user?.id}>
                                            <td
                                              style={{
                                                paddingLeft: "1.5rem",
                                              }}
                                            >
                                              {user?.action}
                                            </td>
                                            <td className="text-center">
                                              <span className="duree">
                                                {
                                                  String(
                                                    user?.action_days
                                                  ).split(".")[0]
                                                }
                                              </span>
                                            </td>
                                            <td className="text-center">
                                              <Avatar
                                                src={
                                                  user?.participant_image?.includes(
                                                    "users"
                                                  )
                                                    ? Assets_URL +
                                                    "/" +
                                                    user?.participant_image
                                                    : user?.participant_image
                                                }
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </div>
                                </Col>
                              </Row>
                              {/* </Container> */}
                            </section>
                          )}

                          {meetingData?.meeting_feedbacks?.length > 0 && (
                            <section id="feedbacks" className="section">
                              <h2 className="section-title-1 text-left">
                                {`${t(
                                  "meeting.newMeeting.labels.momentFeedback"
                                )} `}
                              </h2>
                              <FeedbackCards meeting={meetingData} />
                            </section>
                          )}

                          <section id="discussion" className="section">
                            <h4 className="section-title-1 text-left">
                              {`${t("meeting.newMeeting.labels.discussion")} `}
                            </h4>
                            <MeetingDiscussion
                              meetingId={meetId}
                              messages={meetingMessages}
                              selectedMoment={meetingData}
                              onMessagesUpdate={(newMeetings) =>
                                setMeetingMessages(newMeetings)
                              }
                            />
                          </section>
                        </div>

                        <div className="form-actions d-flex justify-content-center mb-3">
                          <Button
                            className="next-btn"
                            style={{
                              alignItems: "center",
                              backgroundColor: "#4361ee",
                              border: "none",
                              borderRadius: "8px",
                              display: "flex",

                              flexDirection: "column",
                              fontWeight: "500",
                              padding: ".75rem 1.5rem",
                              transition: "all .2s ease",
                            }}
                            onClick={() => navigate(`/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`)}
                          >
                            <span>Essayer l'aventure TekTIME</span>

                            {/* <span className="btn-subtext">
                Personnalisez votre expérience en 2 minutes
              </span> */}
                          </Button>
                        </div>
                        <div className="d-flex justify-content-center align-items-center view-count">
                          <div className="d-flex flex-column align-items-center">
                            <span>
                              <svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 15.5C13.6569 15.5 15 14.1569 15 12.5C15 10.8431 13.6569 9.5 12 9.5C10.3431 9.5 9 10.8431 9 12.5C9 14.1569 10.3431 15.5 12 15.5Z"
                                  stroke="black"
                                  stroke-width="2"
                                />
                                <path
                                  d="M21 12.5C21 12.5 20 4.5 12 4.5C4 4.5 3 12.5 3 12.5"
                                  stroke="black"
                                  stroke-width="2"
                                />
                              </svg>
                            </span>
                            <p className="page-count">{pageViews} page views</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!(
                      (meeting?.location === "Google Meet" ||
                        meeting?.location === "Microsoft Teams") &&
                      !["Task", "Quiz", "Media", "Law"].includes(meeting?.type)
                    ) && (
                        <>
                          {showProgressBar && (
                            <div className="progress-overlay">
                              <div style={{ width: "50%" }}>
                                <ProgressBar now={progress} animated />
                                <h5 className="text-center my-3">
                                  {t("progressBarText")}
                                </h5>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                ) : meetingData?.status === "in_progress" ||
                  meetingData?.status === "to_finish" ||
                  meetingData?.status === "todo" ? (
                  <>
                    <InProgress
                      meetingFile={meetingFile}
                      setFromTektime={setFromTektime}
                      fromTektime={fromTektime}
                      setCallNow={setCallNow}
                      setMeetingTranscript={setMeetingTranscript}
                      setViewNote={setViewNote}
                      isModalOpen={isModalOpen1}
                      setIsModalOpen={setIsModalOpen1}
                      meetingData={meetingData}
                      setMeetingData={setMeetingData}
                      t={t}
                      seesionUser={sessionUser}
                      dropdownRef={dropdownRef}
                      renderIcon={renderIcon}
                      allMeetings={allMeetings}
                      meetId={meetId}
                      selectedTitleOrder={selectedTitleOrder}
                      toggleDropdown={toggleDropdown}
                      dropdownVisible={dropdownVisible}
                      applyFilter={applyFilter}
                      formattedDate={formattedDate}
                      convertTo12HourFormat={convertTo12HourFormat}
                      formattedTime={formattedTime}
                      formattedEndDate={formattedEndDate}
                      estimateDate={estimateDate}
                      estimateTime={estimateTime}
                      setEstimateTime={setEstimateTime}
                      setEstimateDate={setEstimateDate}
                      handleShowSignUp={handleShowSignUp}
                      handleShowStepperModal={handleShowStepperModal}
                      showHostProfile={showHostProfile}
                      hideHostShow={hideHostShow}
                      handleHostShow={handleHostShow}
                      isContentBlurred={blurContent}
                      guidesEmails={guideEmails}
                      showProfile={showProfile}
                      handleShow={handleShow}
                      hideShow={hideShow}
                      meetingMessages={meetingMessages}
                      setMeetingMessages={setMeetingMessages}
                      showProgressBar={showProgressBar1}
                      setShowProgressBar={setShowProgressBar1}
                      progress={progress1}
                      setProgress={setProgress1}
                      onUploadSuccess={handleAudioUploadSuccess}
                      setIsUploading={setIsUploading}
                      stepMedias={stepMedias || []}
                    />
                  </>
                ) : (
                  <>
                    <div className="app-container">
                      <div>
                        <section
                          className={`banner ${meetingData?.destination_banner ? "has-image" : ""
                            }`}
                          style={{
                            backgroundImage: meetingData?.destination_banner
                              ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${meetingData.destination_banner})`
                              : "none",
                          }}
                        >
                          {meetingData?.destination_banner ? (
                            getBannerContent("white") // banner → white text
                          ) : (
                            <>
                              <div className="gradient-header">
                                <svg
                                  width="100%"
                                  height="100%"
                                  viewBox="0 0 1453 338"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  preserveAspectRatio="none"
                                >
                                  <g filter="url(#filter0_f_902_7997)">
                                    <rect
                                      width="100%"
                                      height="100%"
                                      fill="url(#paint0_linear_902_7997)"
                                    />
                                  </g>
                                  <defs>
                                    <filter
                                      id="filter0_f_902_7997"
                                      x="-66.5"
                                      y="-66.5"
                                      width="1573"
                                      height="404"
                                      filterUnits="userSpaceOnUse"
                                      colorInterpolationFilters="sRGB"
                                    >
                                      <feFlood
                                        floodOpacity="0"
                                        result="BackgroundImageFix"
                                      />
                                      <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="BackgroundImageFix"
                                        result="shape"
                                      />
                                      <feGaussianBlur
                                        stdDeviation="33.25"
                                        result="effect1_foregroundBlur_902_7997"
                                      />
                                    </filter>
                                    <linearGradient
                                      id="paint0_linear_902_7997"
                                      x1="856"
                                      y1="281.934"
                                      x2="863.131"
                                      y2="-138.913"
                                      gradientUnits="userSpaceOnUse"
                                    >
                                      <stop stopColor="white" />
                                      <stop offset="1" stopColor="#76C3EE" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </div>

                              {
                                getBannerContent(
                                  "black"
                                ) /* gradient → black text */
                              }
                            </>
                          )}
                        </section>
                        {meeting?.type !== "Calendly" && <nav
                          role="navigation"
                          aria-label="Main navigation"
                          className={`sidebar-nav mb-5 ${isNavVisible ? "visible" : "hidden"
                            }`}
                          style={reportNavbarStyle}
                        >
                          <ul className="nav-list">
                            {[
                              {
                                id: "home",
                                label: t("navbar.home"),
                                icon: <FaHome />,
                              },
                              {
                                id: "guides",
                                label: t("Participants"),

                                icon: <FaBook />,
                              },
                              {
                                id: "steps",
                                label: t("Program"),
                                icon: <FaList />,
                              },

                              {
                                id: "meeting_files",
                                label: t("meeting.newMeeting.labels.file"),
                                icon: <FaFileAlt />,
                              },

                              {
                                id: "discussion",
                                label: "Discussion",
                                icon: <FaComments />,
                              },
                            ].map((item) => (
                              <li key={item.id}>
                                <button
                                  className="nav-link-custom"
                                  aria-label={`Navigate to ${item.label}`}
                                  title={item.label} // Add title attribute for tooltip
                                  onClick={() => {
                                    if (window.innerWidth < 768)
                                      setIsNavVisible(false);

                                    if (item.id === "home") {
                                      // 👇 yeh tumhara custom function chalega sirf home ke liye
                                      handleClick();
                                    } else {
                                      // 👇 baqi buttons pe smooth scroll
                                      document
                                        .getElementById(item.id)
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                    }
                                  }}
                                >
                                  {item.icon}
                                  <span>{item.label}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </nav>}

                        <div className="form-actions d-flex justify-content-center mt-4">
                          <Button
                            className="next-btn"
                            style={{
                              alignItems: "center",
                              backgroundColor: "#4361ee",
                              border: "none",
                              borderRadius: "8px",
                              display: "flex",

                              flexDirection: "column",
                              fontWeight: "500",
                              padding: ".75rem 1.5rem",
                              transition: "all .2s ease",
                            }}
                            onClick={() => navigate(`/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`)}
                          >
                            <span>Essayer l'aventure TekTIME</span>

                            {/* <span className="btn-subtext">
                Personnalisez votre expérience en 2 minutes
              </span> */}
                          </Button>
                        </div>
                        <div className="main-content-9 mt-4 container">
                          <section
                            id="detail"
                            className="section animate__animated animate__fadeIn"
                          >
                            <div className="meeting-header">
                              <div className="header-row">
                                <div
                                  className="dropdown-container"
                                  ref={dropdownRef}
                                >
                                  <div className="content-heading-title d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="icon-wrapper"
                                        style={{ cursor: "pointer" }}
                                      >
                                        {renderIcon()}
                                      </div>
                                      {selectedTitleOrder && (
                                        <span className="title-order">
                                          {selectedTitleOrder}
                                        </span>
                                      )}
                                      <span className="meeting-title mb-0">
                                        {meetingData?.title}
                                      </span>
                                      {meetingData?.status === "active" && (
                                        <span
                                          style={{
                                            marginLeft: "0.5rem",
                                            background: moment().isAfter(
                                              moment(
                                                `${meetingData?.date} ${meetingData?.start_time}`,
                                                "YYYY-MM-DD HH:mm"
                                              )
                                            )
                                              ? "#bb372f1a" // Red for late
                                              : "#e2e7f8", // Green for future
                                            color: moment().isAfter(
                                              moment(
                                                `${meetingData?.date} ${meetingData?.start_time}`,
                                                "YYYY-MM-DD HH:mm"
                                              )
                                            )
                                              ? "#bb372f"
                                              : "#5b7aca",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "0.25rem",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {moment().isAfter(
                                            moment(
                                              `${meetingData?.date} ${meetingData?.start_time}`,
                                              "YYYY-MM-DD HH:mm"
                                            )
                                          )
                                            ? t("badge.late")
                                            : t("badge.future")}
                                        </span>
                                      )}
                                      {meetingData?.status === "to_finish" && (
                                        <span
                                          style={{
                                            marginLeft: "0.5rem",
                                            background: "#ff9800",
                                            color: "#ffffff",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "0.25rem",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {t("badge.finish")}
                                        </span>
                                      )}
                                      {meetingData?.status === "no_status" && (
                                        <span
                                          style={{
                                            display: "none",
                                            marginLeft: "0.5rem",
                                            background: "#6c757d",
                                            color: "white",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "0.25rem",
                                            fontSize: "0.875rem",
                                          }}
                                        >
                                          {t("badge.no_status")}
                                        </span>
                                      )}

                                      {meetingData?.type !== "Calendly" && (
                                        <>
                                          {allMeetings?.filter(
                                            (item) =>
                                              Number(item?.id) !== Number(meetId)
                                          )?.length > 0 && (
                                              <MdKeyboardArrowDown
                                                size={30}
                                                onClick={toggleDropdown}
                                                style={{
                                                  cursor: "pointer",
                                                  marginBottom: "6px",
                                                }}
                                              />
                                            )}

                                        </>
                                      )}
                                    </div>

                                    {(meetingData?.type !== "Calendly" && meetingData?.presentation) && <div className="d-flex gap-3 play-meeting-button">
                                      <div className="d-flex w-100 play-btn-child">
                                        <AntdTooltip
                                          title={
                                            !showButton
                                              ? t(
                                                "You are not authorized to start this moment"
                                              )
                                              : ""
                                          }
                                        >
                                          <div
                                            style={{
                                              display: "inline-block",
                                            }}
                                          >
                                            <Button
                                              className="btn play-btn"
                                              style={{ width: "fit-content" }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlay(meetingData);
                                              }}
                                              // disabled={
                                              //   !meetingData?.guides?.some(
                                              //     (item) =>
                                              //       item?.email ===
                                              //       sessionStorage.getItem(
                                              //         "email"
                                              //       )
                                              //   ) || play
                                              // }
                                              disabled={!showButton || play}
                                            >
                                              {meetingData?.type ===
                                                "Google Agenda Event" ||
                                                meetingData?.type ===
                                                "Outlook Agenda Event"
                                                ? t("Join the meeting")
                                                : `${t("startMoment")}: ${meetingData?.solution
                                                  ? meetingData?.solution
                                                    ?.title
                                                  : meetingData?.type ===
                                                    "Prise de contact"
                                                    ? "Prise de contact"
                                                    : t(
                                                      `types.${meetingData?.type}`
                                                    )
                                                }`}
                                              <FaArrowRight
                                                size={12}
                                                style={{
                                                  marginLeft: ".5rem",
                                                  fontWeight: 700,
                                                }}
                                              />
                                            </Button>
                                          </div>
                                        </AntdTooltip>
                                      </div>
                                    </div>}
                                  </div>
                                  {dropdownVisible && (
                                    <div className="dropdown-content-filter">
                                      <div className="dropdown-section">
                                        {allMeetings
                                          ?.filter(
                                            (item) =>
                                              item.id.toString() !==
                                              meetId.toString()
                                          )
                                          ?.map((item, index) => (
                                            <div
                                              key={index}
                                              onClick={() => applyFilter(item)}
                                              style={{
                                                cursor: "pointer",
                                                padding: "8px 12px",
                                              }}
                                              className="border-bottom"
                                            >
                                              <b>{item.title_order}</b>.{" "}
                                              {item.title}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-4 items mt-2 audio-items">
                                <div className="type">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                                      fill="#8590A3"
                                    />
                                  </svg>
                                  <span className="time ms-2 text-muted">
                                    {meetingData?.solution
                                      ? meetingData?.solution?.title
                                      : meetingData?.type ===
                                        "Google Agenda Event"
                                        ? "Google Agenda Event"
                                        : meetingData?.type ===
                                          "Outlook Agenda Event"
                                          ? "Outlook Agenda Event"
                                          : meetingData?.type === "Special"
                                            ? "Media"
                                            : meetingData?.type === "Prise de contact"
                                              ? "Prise de contact"
                                              : t(`types.${meetingData?.type}`)}
                                  </span>
                                </div>
                              </div>
                              {meetingData?.type !== "Calendly" && <div className="meeting-dates mt-3">
                                <div className="date-row">
                                  <img
                                    src="/Assets/invite-date.svg"
                                    alt="Date"
                                    className="date-icon"
                                  />
                                  <div className="date-details">
                                    {meetingData?.type === "Action" ||
                                      meetingData?.type === "Newsletter" ||
                                      meetingData?.type === "Strategy" ? (
                                      <>
                                        <span className="date-text">
                                          {formattedDate}
                                        </span>
                                        <span className="date-separator">
                                          -
                                        </span>
                                        <span className="date-text">
                                          {/* {formattedDateActive} */}
                                          {estimateDate}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="date-text">
                                          {formattedDate}&nbsp;{t("at")}
                                        </span>

                                        <span className="date-text">
                                          {(meetingData?.status === "in_progress" || meetingData?.status === "to_finish")
                                            ? convertTo12HourFormat(
                                              meetingData?.starts_at,
                                              meetingData?.date,
                                              meetingData?.steps,
                                              meetingData?.timezone
                                            )
                                            : convertTo12HourFormat(
                                              meetingData?.start_time,
                                              meetingData?.date,
                                              meetingData?.steps,
                                              meetingData?.timezone
                                            )}
                                        </span>
                                        <span className="date-separator">
                                          -
                                        </span>
                                        <span className="date-text">
                                          {estimateDate}&nbsp;{t("at")}
                                        </span>
                                        <span className="date-text">
                                          {estimateTime}
                                        </span>
                                      </>
                                    )}
                                    <span className="timezone-text">
                                      {getTimezoneSymbol(
                                        CookieService.get("timezone")
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>}
                              <div>
                                {(meetingData?.location &&
                                  meetingData?.location !== "None") ||
                                  (meetingData?.agenda &&
                                    meetingData?.agenda !== "None") ? (
                                  <div className="d-flex gap-4 align-items-center mt-2 mb-2">
                                    {meetingData?.location &&
                                      meetingData?.location !== "None" && (
                                        <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                          {meetingData?.location === "Zoom" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                                                    fill="#4087FC"
                                                  ></path>
                                                  <path
                                                    d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z"
                                                    fill="white"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {
                                                  meetingData?.user
                                                    ?.user_zoom_info
                                                    ?.display_name
                                                }
                                              </span>
                                            </>
                                          ) : meetingData?.location ===
                                            "Microsoft Teams" ? (
                                            <>
                                              <SiMicrosoftteams
                                                style={{ color: "#6264A7" }}
                                                className="fs-5"
                                                size={28}
                                              />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.visioconference_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Microsoft Teams"
                                                )?.value || "Microsoft Teams"}
                                              </span>
                                            </>
                                          ) : meetingData?.location ===
                                            "Google Meet" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.23969 30 6.55953 30 5.27606 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z"
                                                    fill="#FBBC05"
                                                  ></path>
                                                  <path
                                                    d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z"
                                                    fill="#FBBC05"
                                                  ></path>
                                                  <path
                                                    d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z"
                                                    fill="#34A853"
                                                  ></path>
                                                  <path
                                                    d="M10.1042 7L5 12.4H10.0956L10.1042 7Z"
                                                    fill="#EA4335"
                                                  ></path>
                                                  <path
                                                    d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z"
                                                    fill="#1967D2"
                                                  ></path>
                                                  <path
                                                    d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z"
                                                    fill="#4285F4"
                                                  ></path>
                                                  <path
                                                    d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z"
                                                    fill="#34A853"
                                                  ></path>
                                                  <path
                                                    d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z"
                                                    fill="#188038"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.visioconference_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Google Meet"
                                                )?.value || "Google Meet"}
                                              </span>
                                            </>
                                          ) : null}
                                        </p>
                                      )}
                                    {meetingData?.agenda &&
                                      meetingData?.agenda !== "None" && (
                                        <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                          {meetingData?.agenda ===
                                            "Zoom Agenda" ? (
                                            <>
                                              <svg
                                                width="28px"
                                                height="28px"
                                                viewBox="0 0 32 32"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <g
                                                  id="SVGRepo_bgCarrier"
                                                  stroke-width="0"
                                                ></g>
                                                <g
                                                  id="SVGRepo_tracerCarrier"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                ></g>
                                                <g id="SVGRepo_iconCarrier">
                                                  <path
                                                    d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                                                    fill="#4087FC"
                                                  ></path>
                                                  <path
                                                    d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z"
                                                    fill="white"
                                                  ></path>
                                                  <path
                                                    d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z"
                                                    fill="white"
                                                  ></path>
                                                </g>
                                              </svg>
                                              <span className="solutioncards option-text">
                                                {
                                                  meetingData?.user
                                                    ?.user_zoom_info
                                                    ?.display_name
                                                }
                                              </span>
                                            </>
                                          ) : meetingData?.agenda ===
                                            "Outlook Agenda" ? (
                                            <>
                                              <SiMicrosoftoutlook
                                                style={{ color: "#0078D4" }}
                                                className="fs-5"
                                                size={28}
                                              />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.integration_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Outlook Agenda"
                                                )?.value || "Outlook Agenda"}
                                              </span>
                                            </>
                                          ) : meetingData?.agenda ===
                                            "Google Agenda" ? (
                                            <>
                                              <FcGoogle size={28} />
                                              <span className="solutioncards option-text">
                                                {meetingData?.user?.integration_links?.find(
                                                  (item) =>
                                                    item.platform ===
                                                    "Google Agenda"
                                                )?.value || "Google Agenda"}
                                              </span>
                                            </>
                                          ) : null}
                                        </p>
                                      )}
                                  </div>
                                ) : null}

                                <div className="ps-0">
                                  {meetingData?.address ? (
                                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 ms-0 mt-2">
                                      <FaLocationDot size={25} />
                                      <span>{meetingData?.address}</span>
                                    </p>
                                  ) : null}
                                </div>
                                {meetingData?.room_details ? (
                                  <div>
                                    <p className="d-flex gap-2 mt-2 justify-content-start align-items-top ps-0">
                                      <BsPersonWorkspace size={25} />
                                      <p className="m-0">
                                        {meetingData?.room_details}
                                      </p>
                                    </p>
                                  </div>
                                ) : null}
                                {meetingData?.phone ? (
                                  <div>
                                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 mt-2">
                                      <FaPhoneAlt size={25} />
                                      <a
                                        href={`tel:${meetingData?.phone}`}
                                        className="text-decoration-none"
                                      >
                                        <span>{meetingData?.phone}</span>
                                      </a>
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                              {(meetingData?.prise_de_notes === "Automatic" ||
                                meetingData?.alarm === true ||
                                meetingData?.autostart === "automatic" ||
                                meetingData?.playback === true ||
                                meetingData?.notification === true ||
                                meetingData?.automatic_strategy === true) && (
                                  <div className="row mt-3">
                                    <div className="col-md-12 d-flex align-items-center gap-3 flex-wrap">
                                      {meetingData?.prise_de_notes ===
                                        "Automatic" && (
                                          <div className="d-flex align-items-center gap-2">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="28"
                                              height="28"
                                              viewBox="0 0 28 28"
                                              fill="none"
                                            >
                                              <g filter="url(#filter0_d_1_1154)">
                                                <circle
                                                  cx="14"
                                                  cy="12"
                                                  r="10"
                                                  stroke="url(#paint0_linear_1_1154)"
                                                  strokeWidth="4"
                                                />
                                              </g>
                                              <defs>
                                                <filter
                                                  id="filter0_d_1_1154"
                                                  x="0"
                                                  y="0"
                                                  width="28"
                                                  height="28"
                                                  filterUnits="userSpaceOnUse"
                                                  colorInterpolationFilters="sRGB"
                                                >
                                                  <feFlood
                                                    floodOpacity="0"
                                                    result="BackgroundImageFix"
                                                  />
                                                  <feColorMatrix
                                                    in="SourceAlpha"
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                    result="hardAlpha"
                                                  />
                                                  <feOffset dy="2" />
                                                  <feGaussianBlur stdDeviation="1" />
                                                  <feColorMatrix
                                                    type="matrix"
                                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                                                  />
                                                  <feBlend
                                                    mode="normal"
                                                    in2="BackgroundImageFix"
                                                    result="effect1_dropShadow_1_1154"
                                                  />
                                                  <feBlend
                                                    mode="normal"
                                                    in="SourceGraphic"
                                                    in2="effect1_dropShadow_1_1154"
                                                    result="shape"
                                                  />
                                                </filter>
                                                <linearGradient
                                                  id="paint0_linear_1_1154"
                                                  x1="14"
                                                  y1="0"
                                                  x2="20.375"
                                                  y2="21.75"
                                                  gradientUnits="userSpaceOnUse"
                                                >
                                                  <stop stopColor="#B11FAB" />
                                                  <stop
                                                    offset="0.514"
                                                    stopColor="#56E8F1"
                                                  />
                                                  <stop
                                                    offset="1"
                                                    stopColor="#2F47C1"
                                                  />
                                                </linearGradient>
                                              </defs>
                                            </svg>
                                            <span className="solutioncards option-text text-muted">
                                              {t(
                                                "meeting.formState.Automatic note taking"
                                              )}
                                            </span>
                                          </div>
                                        )}

                                      {meetingData?.alarm === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.Beep alarm")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.autostart === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.Autostart")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.playback === "automatic" && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="25"
                                            height="24"
                                            viewBox="0 0 25 24"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                              fill="#3D57B5"
                                            />
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t(
                                              "meeting.formState.Lecture playback"
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.notification === true && (
                                        <div className="d-flex align-items-center gap-2">
                                          <svg
                                            width="25px"
                                            height="24px"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                            <circle
                                              cx="19"
                                              cy="5"
                                              r="3"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                            ></circle>
                                            <path
                                              d="M7 14H16"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                            <path
                                              d="M7 17.5H13"
                                              stroke="#3D57B5"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                            ></path>
                                          </svg>
                                          <span
                                            className="solutioncards text-muted"
                                            style={{ color: "#3D57B5" }}
                                          >
                                            {t("meeting.formState.notification")}
                                          </span>
                                        </div>
                                      )}
                                      {meetingData?.automatic_strategy ===
                                        true && (
                                          <>
                                            <div>
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="25"
                                                height="24"
                                                viewBox="0 0 25 24"
                                                fill="none"
                                              >
                                                <path
                                                  fill-rule="evenodd"
                                                  clip-rule="evenodd"
                                                  d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                                  fill="#3D57B5"
                                                />
                                              </svg>
                                              <span
                                                className="solutioncards"
                                                style={{ color: "#3D57B5" }}
                                              >
                                                {t(
                                                  "meeting.formState.Automatic Strategy"
                                                )}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                    </div>
                                  </div>
                                )}
                              <div className="row mt-3">
                                <div className="col-md-12 mt-2 ms-1 d-flex align-items-center gap-3">
                                  <span
                                    style={{
                                      fontFamily: "Inter",
                                      fontSize: "12px",
                                      fontWeight: 400,
                                      lineHeight: "14.52px",
                                      textAlign: "left",
                                      color: "#8590a3",
                                    }}
                                  >
                                    {t("Privacy")}:
                                  </span>
                                  <div className="">
                                    <div className="d-flex align-items-center flex-wrap">
                                      {meetingData?.moment_privacy ===
                                        "public" ? (
                                        <img
                                          src="/Assets/Tek.png"
                                          alt="Public"
                                          style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "0",
                                          }}
                                        />
                                      ) : meetingData?.moment_privacy ===
                                        "team" ? (
                                        <div className="d-flex">
                                          {meetingData?.moment_privacy_teams_data?.map(
                                            (item, idx) => (
                                              <div key={idx} className="me-1">
                                                <img
                                                  src={
                                                    item?.logo?.startsWith(
                                                      "http"
                                                    )
                                                      ? item.logo
                                                      : `${Assets_URL}/${item.logo}`
                                                  }
                                                  alt={item?.name}
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                  title={item?.name}
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "participant only" ? (
                                        <div className="d-flex">
                                          {meetingData?.user_with_participants?.map(
                                            (item, idx) => (
                                              <div key={idx} className="me-1">
                                                <img
                                                  src={
                                                    item?.participant_image?.startsWith(
                                                      "http"
                                                    )
                                                      ? item.participant_image
                                                      : `${Assets_URL}/${item.participant_image}`
                                                  }
                                                  alt={item?.full_name}
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                  title={item?.full_name}
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "tektime members" ? null : meetingData?.moment_privacy ===
                                          "enterprise" ? (
                                        <div>
                                          <img
                                            src={
                                              meetingData?.user?.enterprise?.logo?.startsWith(
                                                "http"
                                              )
                                                ? meetingData?.user?.enterprise
                                                  ?.logo
                                                : `${Assets_URL}/${meetingData?.user?.enterprise?.logo}`
                                            }
                                            alt={
                                              meetingData?.user?.enterprise
                                                ?.name
                                            }
                                            style={{
                                              width: "30px",
                                              height: "30px",
                                              borderRadius: "50%",
                                              objectFit: "fill",
                                              objectPosition: "top",
                                            }}
                                            title={
                                              meetingData?.user?.enterprise
                                                ?.name
                                            }
                                          />
                                        </div>
                                      ) : meetingData?.moment_privacy ===
                                        "password" ? (
                                        <svg
                                          width="37px"
                                          height="36px"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                            stroke="#000000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <img
                                          src={
                                            meetingData?.user?.image?.startsWith(
                                              "users/"
                                            )
                                              ? `${Assets_URL}/${meetingData?.user?.image}`
                                              : meetingData?.user?.image
                                          }
                                          alt={meetingData?.user?.full_name}
                                          style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            objectPosition: "top",
                                          }}
                                          title={meetingData?.user?.full_name}
                                        />
                                      )}
                                      <Badge
                                        className={`ms-2 ${meetingData?.moment_privacy ===
                                          "private"
                                          ? "solution-badge-red"
                                          : meetingData?.moment_privacy ===
                                            "public"
                                            ? "solution-badge-green"
                                            : meetingData?.moment_privacy ===
                                              "enterprise" ||
                                              meetingData?.moment_privacy ===
                                              "participant only" ||
                                              meetingData?.moment_privacy ===
                                              "tektime members"
                                              ? "solution-badge-blue"
                                              : meetingData?.moment_privacy ===
                                                "password"
                                                ? "solution-badge-red"
                                                : "solution-badge-yellow"
                                          }`}
                                        style={{ padding: "3px 8px" }}
                                      >
                                        {meetingData?.moment_privacy ===
                                          "private"
                                          ? t("solution.badge.private")
                                          : meetingData?.moment_privacy ===
                                            "public"
                                            ? t("solution.badge.public")
                                            : meetingData?.moment_privacy ===
                                              "enterprise"
                                              ? t("solution.badge.enterprise")
                                              : meetingData?.moment_privacy ===
                                                "participant only"
                                                ? t("solution.badge.participantOnly")
                                                : meetingData?.moment_privacy ===
                                                  "tektime members"
                                                  ? t("solution.badge.membersOnly")
                                                  : meetingData?.moment_privacy ===
                                                    "password"
                                                    ? t("solution.badge.password")
                                                    : t("solution.badge.team")}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {meetingData?.description && (
                                <div className="paragraph-parent mt-3 ps-2 ps-md-4 ps-lg-0">
                                  <span className="paragraph paragraph-images">
                                    {isMarkdownContent(meetingData?.description) ? (
                                      <div className="markdown-content">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            h1: ({ node, ...props }) => <h3 {...props} />,
                                            h2: ({ node, ...props }) => <h4 {...props} />,
                                            h3: ({ node, ...props }) => <h5 {...props} />,
                                            p: ({ node, ...props }) => <p {...props} />,
                                            ul: ({ node, ...props }) => <ul {...props} />,
                                            ol: ({ node, ...props }) => <ol {...props} />,
                                            strong: ({ node, ...props }) => <strong {...props} />,
                                            code: ({ node, inline, ...props }) =>
                                              inline ? <code {...props} /> : <code {...props} />,
                                          }}
                                        >
                                          {cleanText(meetingData?.description)}
                                        </ReactMarkdown>
                                      </div>
                                    ) : (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: meetingData?.description || "",
                                        }}
                                      />
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </section>

                          {meeting?.type === "Calendly" && <CalendlyBooking meetingData={meetingData} onConfirm={handleShowStepperModal} />}

                          {meetingData?.type === "Newsletter" ? (
                            <Card>
                              <Card.Body className="d-flex flex-column">
                                <h4
                                  style={{
                                    fontFamily: "Roboto",
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    lineHeight: "20px",
                                    textAlign: "left",
                                    color: "#344054",
                                  }}
                                >
                                  {t("Join Now")}
                                </h4>
                                <h6
                                  style={{
                                    fontFamily: "Roboto",
                                    fontSize: "14px",
                                    fontWeight: 400,
                                    lineHeight: "16.41px",
                                    textAlign: "left",
                                    color: "#92929D",
                                  }}
                                >
                                  {t("Sign up to be a part of this moment.")}
                                </h6>
                                <div className="subscribe-button mt-2">
                                  <button
                                    className="btn moment-btn w-100"
                                    style={{
                                      padding: "12px 20px 12px 20px",
                                      gap: "8px",
                                      borderRadius: "8px",
                                      background: "#2C48AE",
                                      border: "1px solid #E2E2E2",
                                      color: "white",
                                    }}
                                    onClick={() => handleShowSignUp()}
                                  >
                                    {t("Subscribe")}{" "}
                                  </button>
                                </div>
                              </Card.Body>
                            </Card>
                          ) : meetingData?.casting_type === "Registration" &&
                            meetingData?.type !== "Newsletter" ? (
                            <Card>
                              <Card.Body className="d-flex flex-column">
                                <div className="d-flex align-items-center justify-content-between">
                                  {meetingData?.participants?.some(
                                    (participant) =>
                                      participant.email === sessionUser?.email
                                  ) ? null : (
                                    <>
                                      <div className="d-flex flex-column">
                                        <h4
                                          style={{
                                            fontFamily: "Roboto",
                                            fontSize: "20px",
                                            fontWeight: 600,
                                            lineHeight: "20px",
                                            textAlign: "left",
                                            color: "#344054",
                                          }}
                                        >
                                          {t("Register Now")}
                                        </h4>
                                        <h6
                                          style={{
                                            fontFamily: "Roboto",
                                            fontSize: "14px",
                                            fontWeight: 400,
                                            lineHeight: "16.41px",
                                            textAlign: "left",
                                            color: "#92929D",
                                          }}
                                        >
                                          {t(
                                            "Sign up to be a part of this moment."
                                          )}
                                        </h6>
                                      </div>

                                      <div>
                                        {meetingData?.max_participants_register -
                                          meetingData?.participants?.filter(
                                            (item) =>
                                              item.email !== sessionUser?.email
                                          )?.length}{" "}
                                        Remaining
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="subscribe-button mt-2">
                                  {meetingData?.participants?.some(
                                    (participant) =>
                                      participant.email === sessionUser?.email
                                  ) ? (
                                    <button
                                      className="btn moment-btn w-100"
                                      style={{
                                        padding: "12px 20px",
                                        gap: "8px",
                                        borderRadius: "8px",
                                        background: "#2C48AE",
                                        border: "1px solid #E2E2E2",
                                        color: "white",
                                      }}
                                      disabled
                                    >
                                      {t("Already Registered")}
                                    </button>
                                  ) : (
                                    <button
                                      className="btn moment-btn w-100"
                                      style={{
                                        padding: "12px 20px",
                                        gap: "8px",
                                        borderRadius: "8px",
                                        background: "#2C48AE",
                                        border: "1px solid #E2E2E2",
                                        color: "white",
                                      }}
                                      onClick={() => handleShowStepperModal()}
                                    >
                                      {t("Register")}
                                    </button>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          ) : null}

                          <section
                            id="guides"
                            className="section report-host-card"
                          >
                            <h2 className="section-title-1 text-left">
                              {meetingData?.guides?.length > 1
                                ? t("Guides")
                                : t("Guide")}
                            </h2>
                            <div className="guides-container">
                              <ReportHostCard
                                data={meetingData?.user}
                                guides={meetingData?.guides}
                                handleShow={handleHostShow}
                                handleHide={hideHostShow}
                                showProfile={showHostProfile}
                                meeting={meetingData}
                              />
                            </div>

                            {/* ------------------------------------------------ Participants */}
                          </section>

                          {meetingData?.participants?.length > 0 &&
                            meetingData?.type !== "Newsletter" && (
                              <section
                                id="guides"
                                className="section report-host-card"
                              >
                                <h2 className="section-title-1 text-left">
                                  {t("invite")}
                                </h2>
                                {/* <div className="guides-container"> */}
                                {!blurContent && (
                                  <div
                                    className="guides-container"
                                    style={{
                                      filter: !blurContent
                                        ? "none"
                                        : "blur(13px)",
                                    }}
                                  >
                                    {meetingData?.type !== "Newsletter" && (
                                      <>
                                        <ReportParticipantCard
                                          data={meetingData?.participants}
                                          guides={meetingData?.guides}
                                          handleShow={handleShow}
                                          handleHide={hideShow}
                                          showProfile={showProfile}
                                          meeting={meetingData}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}

                                {/* </div> */}
                              </section>
                            )}
                          {meetingData?.type === "Newsletter" && (
                            <section
                              id="guides"
                              className="section report-host-card"
                            >
                              <h4
                                className={
                                  fromMeeting
                                    ? "participant-heading-meeting"
                                    : "participant-heading"
                                }
                              >
                                {t("Abonnés")}
                              </h4>
                              <div className="guides-container">
                                {/* {meetingData?.type === "Newsletter" && ( */}

                                <ReportSubscriberCard
                                  subscribers={
                                    meetingData?.newsletter_subscribers
                                  }
                                  data={meetingData?.newsletter_subscribers}
                                  fromMeeting={fromMeeting}
                                  meeting={meetingData}
                                  // handleShow={handleShow1}
                                  // handleHide={hideShow}
                                  showProfile={showProfile}
                                />
                              </div>
                            </section>
                          )}

                          {meetingData?.steps?.length > 0 && (
                            <section id="steps" className="section">
                              <h2 className="section-title-1 text-left">
                                {t("meeting.newMeeting.labels.Program")}
                              </h2>
                              <div className="steps-desktop d-none d-md-block">
                                {meetingData.steps.map((step, index) => (
                                  <ReportActiveStepCard
                                    key={index}
                                    index={index}
                                    data={step} // Pass individual step instead of entire steps array
                                    startTime={formattedTime}
                                    users={{
                                      ...meetingData?.user,
                                      firstName: meetingData?.user?.name,
                                      lastName: meetingData?.user?.last_name,
                                      image:
                                        meetingData?.user?.assigned_to_image ||
                                        meetingData?.user?.image ||
                                        "/Assets/avatar.jpeg",
                                    }}
                                    meetingId={meetingData?.id}
                                    meeting={meetingData}
                                    setIsModalOpen1={setIsModalOpen1}
                                    runStep={handleRunStep}
                                    isRun={isRun}
                                    isReOpen={isReOpen}
                                    reRunStep={handleReRunStep}
                                    isAccordion={false} // Card layout for desktop
                                    Assets_URL={Assets_URL} // Pass Assets_URL
                                    t={t} // Pass translation function
                                    stepMedias={stepMedias}
                                  />
                                ))}
                              </div>
                              <Accordion
                                defaultActiveKey="0"
                                className="steps-accordion d-md-none"
                              >
                                {meetingData.steps.map((step, index) => (
                                  <ReportActiveStepCard
                                    key={index}
                                    index={index}
                                    data={step} // Pass individual step instead of entire steps array
                                    startTime={formattedTime}
                                    users={{
                                      ...meetingData?.user,
                                      firstName: meetingData?.user?.name,
                                      lastName: meetingData?.user?.last_name,
                                      image:
                                        meetingData?.user?.assigned_to_image ||
                                        meetingData?.user?.image ||
                                        "/Assets/avatar.jpeg",
                                    }}
                                    meetingId={meetingData?.id}
                                    meeting={meetingData}
                                    setIsModalOpen1={setIsModalOpen1}
                                    runStep={handleRunStep}
                                    isRun={isRun}
                                    isReOpen={isReOpen}
                                    reRunStep={handleReRunStep}
                                    isAccordion={true} // Accordion layout for mobile
                                    Assets_URL={Assets_URL} // Pass Assets_URL
                                    t={t} // Pass translation function
                                    stepMedias={stepMedias}
                                  />
                                ))}
                              </Accordion>
                            </section>
                          )}

                          {meetingData?.meeting_files?.length > 0 && (
                            <section id="meeting_files" className="section">
                              <h2 className="section-title-1 text-left">
                                {`${t("meeting.newMeeting.labels.file")} `}
                              </h2>
                              <CompletedReportStepFile
                                data={meetingData?.meeting_files}
                                meeting={meetingData}
                                startTime={formattedTime}
                                users={{
                                  ...meetingData?.user,
                                  firstName: meetingData?.user?.name,
                                  lastName: meetingData?.user?.last_name,
                                  image:
                                    meetingData?.user?.assigned_to_image ||
                                    meetingData?.user?.image ||
                                    "/Assets/avatar.jpeg",
                                }}
                              />
                            </section>
                          )}

                          <section id="discussion" className="section">
                            <h4 className="section-title-1 text-left">
                              {`${t("meeting.newMeeting.labels.discussion")} `}
                            </h4>
                            <MeetingDiscussion
                              meetingId={meetId}
                              messages={meetingMessages}
                              selectedMoment={meetingData}
                              onMessagesUpdate={(newMeetings) =>
                                setMeetingMessages(newMeetings)
                              }
                            />
                          </section>
                        </div>

                        <div className="form-actions d-flex justify-content-center mb-3">
                          <Button
                            className="next-btn"
                            style={{
                              alignItems: "center",
                              backgroundColor: "#4361ee",
                              border: "none",
                              borderRadius: "8px",
                              display: "flex",

                              flexDirection: "column",
                              fontWeight: "500",
                              padding: ".75rem 1.5rem",
                              transition: "all .2s ease",
                            }}
                            onClick={() => navigate(`/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`)}
                          >
                            <span>Essayer l'aventure TekTIME</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* ------------------------------------------------ Steps */}

                    {/* <div style={{ marginTop: "5rem" }}>
                              <span className="participant-heading">
                                {`${t("meeting.newMeeting.labels.Program")} `}
                              </span>
                              <ActiveReportStepCard
                                data={meetingData?.steps}
                                startTime={formattedTime}
                                users={{
                                  ...meetingData?.user,
                                  firstName: meetingData?.user?.name,
                                  lastName: meetingData?.user?.last_name,
                                  image:
                                    meetingData?.user?.assigned_to_image ||
                                    meetingData?.user?.image ||
                                    "/Assets/avatar.jpeg",
                                }}
                                meetingId={meetingData?.id}
                                meeting={meetingData}
                              />
                            </div> */}

                    {/* SignUp Modal */}
                    <SignUp
                      show={showSignUp}
                      handleClose={handleCloseSignUp}
                      handleShowSignIn={handleShowSignIn}
                      meetingId={meetId}
                      meeting={meetingData}
                    />
                    <StepperSignUpModal
                      show={showStepperModal}
                      handleClose={handleCloseStepperModal}
                      handleShowSignIn={handleShowSignIn}
                      meetingId={meetId}
                      meeting={meetingData}
                      setIsLoggedIn={setIsLoggedIn}
                      refreshData={getMeetingReport}
                      user={sessionUser}
                      calendlyData={calendlyData}
                    />
                    {/* Forgot Password Modal */}
                    <ForgotPassword
                      show={showForgot}
                      handleClose={handleCloseForgot}
                      handleShowForgot={handleShowForgot}
                    />
                  </>
                )}
              </div>
            ) : specialMeetingLoading ? (
              <Spinner
                animation="border"
                role="status"
                className="center-spinner"
              ></Spinner>
            ) : (
              <>
                <div className="app-container">
                  <section
                    className={`banner ${destinationDate?.banner ? "has-image" : ""
                      }`}
                    style={{
                      backgroundImage: destinationDate?.banner
                        ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${destinationDate?.banner})`
                        : "none",
                    }}
                  >
                    {destinationDate?.banner ? (
                      getDestinatinBannerContent("white")
                    ) : (
                      <>
                        <div className="gradient-header">
                          <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 1453 338"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                          >
                            <g filter="url(#filter0_f_902_7997)">
                              <rect
                                width="100%"
                                height="100%"
                                fill="url(#paint0_linear_902_7997)"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_f_902_7997"
                                x="-66.5"
                                y="-66.5"
                                width="1573"
                                height="404"
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                              >
                                <feFlood
                                  floodOpacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="BackgroundImageFix"
                                  result="shape"
                                />
                                <feGaussianBlur
                                  stdDeviation="33.25"
                                  result="effect1_foregroundBlur_902_7997"
                                />
                              </filter>
                              <linearGradient
                                id="paint0_linear_902_7997"
                                x1="856"
                                y1="281.934"
                                x2="863.131"
                                y2="-138.913"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="white" />
                                <stop offset="1" stopColor="#76C3EE" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        {getDestinatinBannerContent("black")}
                      </>
                    )}
                  </section>

                  <nav
                    role="navigation"
                    aria-label="Main navigation"
                    className={`sidebar-nav ${isNavVisible ? "visible" : "hidden"
                      }`}
                    style={reportNavbarStyle}
                  >
                    <ul className="nav-list">
                      {[
                        {
                          id: "home",
                          label: t("navbar.home"),
                          icon: <FaHome />,
                        },
                        {
                          id: "description",
                          label: t("navbar.description"),
                          icon: <BiDetail />,
                        },
                        {
                          id: "moments",
                          label: t("moments"),

                          icon: <FaList />,
                        },
                        {
                          id: "casting",
                          label: t("invite"),

                          icon: <FaBook />,
                        },
                        {
                          id: "files",
                          label: t("navbar.file"),
                          icon: <FaFile />,
                        },
                        {
                          id: "roadmap",
                          label: t("roadmap"),
                          icon: <FaChartBar />,
                        },
                      ].map((item) => (
                        <li key={item.id}>
                          <button
                            className="nav-link-custom"
                            aria-label={`Navigate to ${item.label}`}
                            title={item.label}
                            // onClick={() => {
                            //   if (window.innerWidth < 768)
                            //     setIsNavVisible(false);
                            //   document
                            //     .getElementById(item.id)
                            //     ?.scrollIntoView({
                            //       behavior: "smooth",
                            //     });
                            // }}
                            onClick={() => {
                              if (window.innerWidth < 768)
                                setIsNavVisible(false);

                              if (item.id === "home") {
                                // 👇 yeh tumhara custom function chalega sirf home ke liye
                                handleClick();
                              } else {
                                // 👇 baqi buttons pe smooth scroll
                                document
                                  .getElementById(item.id)
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                  });
                              }
                            }}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <Container className="mt-4 home-link">
                    <section
                      id="description"
                      className=" detail-section animate__animated animate__fadeIn"
                    >
                      {destinationDate?.destination_description &&
                        destinationDate?.destination_description !== "null" && (
                          <div className="paragraph-parent mt-2">
                            <p className="paragraph paragraph-images p-1">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html:
                                    destinationDate.destination_description,
                                }}
                              />
                            </p>
                          </div>
                        )}
                    </section>
                  </Container>

                  <Container className="mt-4 home-link">
                    {destinationDate?.meetings?.length > 0 && (
                      <section
                        id="moments"
                        className=" detail-section animate__animated animate__fadeIn"
                      >
                        <Row className="justify-content-center">
                          <Col
                            xs={12}
                            lg={12}
                            className="moments-section-1 mb-4 mb-lg-0"
                          >
                            <h2 className="participant-heading mb-3">
                              Moments
                            </h2>
                            <Accordion className="my-custom-accordion">
                              {destinationDate?.meetings
                                ?.filter((moment) => moment.status !== "abort")
                                ?.sort(
                                  (a, b) => new Date(a.date) - new Date(b.date)
                                )
                                ?.map((item, index) => {
                                  const formattedDesDate =
                                    convertDateToUserTimezone(
                                      item?.date,
                                      item?.starts_at || item?.start_time,
                                      item?.timezone
                                    );
                                  const endTime = specialMeetingEndTime(
                                    item?.start_time,
                                    item?.steps
                                  );
                                  return (
                                    <Accordion.Item
                                      eventKey={index.toString()}
                                      key={item.id}
                                      className="mb-4 shadow"
                                      onClick={() =>
                                        handleToggleAccoridon(index.toString())
                                      }
                                    >
                                      <Accordion.Header className="my-custom-header">
                                        <p className="moment-title-1">
                                          {item?.order_no <= 9 ? "0" : " "}
                                          {item?.order_no}&nbsp;
                                          {item?.type}:&nbsp;{item?.title}
                                          &nbsp;&nbsp;
                                          {item?.status === "active" && (
                                            <span
                                              style={{
                                                marginLeft: "0.5rem",
                                                background: moment().isAfter(
                                                  moment(
                                                    `${item?.date} ${item?.start_time}`,
                                                    "YYYY-MM-DD HH:mm"
                                                  )
                                                )
                                                  ? "#bb372f1a" // Red for late
                                                  : "#e2e7f8", // Green for future
                                                color: moment().isAfter(
                                                  moment(
                                                    `${item?.date} ${item?.start_time}`,
                                                    "YYYY-MM-DD HH:mm"
                                                  )
                                                )
                                                  ? "#bb372f"
                                                  : "#5b7aca",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {moment().isAfter(
                                                moment(
                                                  `${item?.date} ${item?.start_time}`,
                                                  "YYYY-MM-DD HH:mm"
                                                )
                                              )
                                                ? t("badge.late")
                                                : t("badge.future")}
                                            </span>
                                          )}
                                          {item?.status === "in_progress" && (
                                            <span
                                              // className={`${
                                              //   item?.steps?.some(
                                              //     (moment) =>
                                              //       moment?.step_status ===
                                              //         "in_progress" &&
                                              //       convertTimeTakenToSeconds(
                                              //         moment?.time_taken
                                              //       ) >
                                              //         convertCount2ToSeconds(
                                              //           moment?.count2,
                                              //           moment?.time_unit
                                              //         )
                                              //   )
                                              //     ? "status-badge-red1"
                                              //     : "status-badge-inprogress1"
                                              // } mx-2 badge h-100`}

                                              style={{
                                                background: item?.steps?.some(
                                                  (moment) =>
                                                    moment?.step_status ===
                                                    "in_progress" &&
                                                    convertTimeTakenToSeconds(
                                                      moment?.time_taken
                                                    ) >
                                                    convertCount2ToSeconds(
                                                      moment?.count2,
                                                      moment?.time_unit
                                                    )
                                                )
                                                  ? "red" // Red for late
                                                  : "#ffde14", // Green for future

                                                color: item?.steps?.some(
                                                  (moment) =>
                                                    moment?.step_status ===
                                                    "in_progress" &&
                                                    convertTimeTakenToSeconds(
                                                      moment?.time_taken
                                                    ) >
                                                    convertCount2ToSeconds(
                                                      moment?.count2,
                                                      moment?.time_unit
                                                    )
                                                )
                                                  ? "#fff"
                                                  : "#fff",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {t("badge.inprogress")}
                                            </span>
                                          )}
                                          {item?.status === "closed" && (
                                            <span
                                              style={{
                                                marginLeft: "0.5rem",
                                                background: "#38993c1a", // Green for future
                                                color: "#38993c",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {t("badge.finished")}
                                            </span>
                                          )}
                                          {item?.status === "abort" && (
                                            <span
                                              style={{
                                                marginLeft: "0.5rem",
                                                background: "#bb372f1a", // Green for future
                                                color: "#bb372f",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {t("badge.cancel")}
                                            </span>
                                          )}
                                          {item?.status === "to_finish" && (
                                            <span
                                              style={{
                                                marginLeft: "0.5rem",
                                                background: "#ff9800",
                                                color: "#ffffff",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {t("badge.finish")}
                                            </span>
                                          )}
                                          {item?.status === "todo" && (
                                            <span
                                              style={{
                                                marginLeft: "0.5rem",
                                                color: "white",
                                                background: "#6c757d",
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.875rem",
                                              }}
                                            >
                                              {t("badge.Todo")}
                                            </span>
                                          )}
                                          {item?.status === "in_progress" ||
                                            item?.status === "closed" ? (
                                            <span className="fw-bold formate-date">
                                              <span className="fw-bold formate-date">
                                                {formattedDesDate}&nbsp;{" "}
                                                {t("at")}
                                                &nbsp;
                                              </span>
                                              {item?.type === "Special" ||
                                                item?.type === "Law" ? (
                                                <>{endTime}</>
                                              ) : (
                                                <>
                                                  {convertTo12HourFormat(
                                                    item?.starts_at ||
                                                    item?.start_time,
                                                    item?.date,
                                                    item?.steps,
                                                    item?.timezone
                                                  )}
                                                </>
                                              )}
                                            </span>
                                          ) : (
                                            <span className="ms-2 fw-bold formate-date">
                                              <span className="fw-bold formate-date">
                                                {formattedDesDate}&nbsp;{" "}
                                                {t("at")}
                                                &nbsp;
                                              </span>
                                              {convertTo12HourFormat(
                                                item?.start_time,
                                                item?.date,
                                                item?.steps,
                                                item?.timezone
                                              )}
                                            </span>
                                          )}
                                          &nbsp;&nbsp;
                                          <span
                                            className="see-more-link"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIsModalOpen(false);
                                              setUniqueId((prev) => !prev);
                                              viewPresentation(item);
                                            }}
                                          >
                                            {t("meeting.See More")}
                                          </span>
                                        </p>
                                      </Accordion.Header>
                                      <Accordion.Body>
                                        <p
                                          dangerouslySetInnerHTML={{
                                            __html: item?.description?.replace(
                                              /<img /g,
                                              '<img style="width: 100%;" '
                                            ),
                                          }}
                                        ></p>
                                      </Accordion.Body>
                                    </Accordion.Item>
                                  );
                                })}
                            </Accordion>
                          </Col>
                        </Row>
                      </section>
                    )}

                    {participants?.length > 0 && (
                      <section
                        id="casting"
                        className=" detail-section animate__animated animate__fadeIn"
                      >
                        <Row className="justify-content-center">
                          <Col xs={12} lg={12} className="casting-section-1">
                            <h2 className="participant-heading mb-4">
                              Casting
                            </h2>
                            <div className="casting-list">
                              <Accordion
                                className="casting-accordian"
                                onSelect={(key) => setActiveEventKey(key)}
                                activeKey={activeEventKey}
                              >
                                {participants?.map((member, index) => (
                                  <Accordion.Item
                                    eventKey={index.toString()}
                                    key={member.id}
                                    className="mb-3 casting-item"
                                  >
                                    <Accordion.Header className="casting-header">
                                      <div className="d-flex align-items-center gap-3 w-100">
                                        <Avatar
                                          src={
                                            member?.participant_image?.startsWith(
                                              "users/"
                                            )
                                              ? Assets_URL +
                                              "/" +
                                              member?.participant_image
                                              : member?.participant_image
                                          }
                                          className="custom-avatar"
                                        />
                                        <div className="d-flex flex-column gap-1 w-100">
                                          <div className="d-flex align-items-center justify-content-between">
                                            <h5 className="mb-0 casting-member">
                                              {member?.full_name}
                                            </h5>
                                            {activeEventKey ===
                                              index.toString() && (
                                                <>
                                                  {member?.user_id && (
                                                    <div
                                                      className="visiting-card-link"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(
                                                          member?.user
                                                            ?.nick_name ||
                                                          member?.nick_name
                                                        );
                                                      }}
                                                    >
                                                      {t("viewVisitingCard")}{" "}
                                                      <FaArrowRight />
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                          </div>
                                          <p className="mb-0 casting-post">
                                            {member?.email}
                                          </p>
                                          <p className="mb-0 casting-post">
                                            {member?.post}
                                          </p>
                                          <p className="mb-0 casting-enterprise">
                                            {member?.user?.enterprise?.name ||
                                              member?.enterprise?.name}
                                          </p>
                                        </div>
                                      </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="casting-body">
                                      {member?.user?.bio && (
                                        <div className="bio-section">
                                          <h6 className="bio-title">
                                            {t("profile.inviteProfile.bio")}
                                          </h6>
                                          <p className="bio-text">
                                            {member?.user?.bio}
                                          </p>
                                        </div>
                                      )}
                                      {member?.meetings?.length > 0 && (
                                        <div className="meetings-section">
                                          <div className="table-responsive">
                                            <table className="table table-custom mt-3">
                                              <thead>
                                                <tr>
                                                  <th>
                                                    {t("time_unit.moment_name")}
                                                  </th>
                                                  <th>
                                                    {t(
                                                      "time_unit.moment_delay"
                                                    )}
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {member?.meetings?.map(
                                                  (item, idx) => (
                                                    <tr key={idx}>
                                                      <td>{item.title}</td>
                                                      <td
                                                        className={
                                                          item.status ===
                                                            "in_progress"
                                                            ? item?.meeting_steps?.some(
                                                              (step) =>
                                                                convertTimeTakenToSeconds(
                                                                  step?.time_taken
                                                                ) >
                                                                convertCount2ToSeconds(
                                                                  step?.count2,
                                                                  step?.time_unit
                                                                )
                                                            )
                                                              ? "text-delay-warning"
                                                              : "text-delay-inprogress"
                                                            : item?.status ===
                                                              "active"
                                                              ? moment().isAfter(
                                                                moment(
                                                                  `${item.date} ${item.start_time}`,
                                                                  "YYYY-MM-DD HH:mm"
                                                                )
                                                              )
                                                                ? "text-delay-late"
                                                                : "text-delay-active"
                                                              : item?.status ===
                                                                "closed"
                                                                ? "text-delay-closed"
                                                                : ""
                                                        }
                                                      >
                                                        {item?.status ===
                                                          "in_progress"
                                                          ? calculateTimeDifferencePrepareData(
                                                            item?.meeting_steps,
                                                            item?.starts_at,
                                                            item?.current_date,
                                                            t
                                                          )
                                                          : item?.status ===
                                                            "closed"
                                                            ? calculateTotalTimeTaken(
                                                              item?.meeting_steps
                                                            )
                                                            : calculateTotalTime(
                                                              item?.meeting_steps
                                                            )}
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </Accordion.Body>
                                  </Accordion.Item>
                                ))}
                              </Accordion>
                            </div>
                          </Col>
                        </Row>
                      </section>
                    )}
                  </Container>

                  {allFiles?.length > 0 && <Container className="mt-4 home-link">
                    <section
                      id="files"
                      className="detail-section animate__animated animate__fadeIn"
                    >
                      <div className="casting-section-1">
                        <h2 className="participant-heading mb-4">
                          {t("navbar.file")}
                        </h2>
                      </div>

                      <ReportFileMenu
                        meeting_files={allFiles}
                        openModal={openModal}
                      />
                    </section>
                  </Container>}
                  <Container>
                    <section
                      id="roadmap"
                      className=" detail-section animate__animated animate__fadeIn"
                    >
                      <Card className="roadmap-container shadow mt-5">
                        <div>
                          <h4
                            className={`${fromMeeting
                              ? "participant-heading-meeting"
                              : "participant-heading"
                              } d-flex align-items-center justify-content-between`}
                          >
                            {view === "graph"
                              ? `${t("time_unit.Roadmap")} `
                              : `${t("time_unit.Calendar")} `}
                            <span style={{ cursor: "pointer" }}>
                              <div className="toggle-button">
                                <button
                                  className={`toggle-button-option ${view === "list" ? "active" : ""
                                    }`}
                                  onClick={() => handleToggle("list")}
                                >
                                  <div className="icon-list" />
                                  <FaRegCalendarDays size={18} />
                                </button>
                                <button
                                  className={`toggle-button-option ${view === "graph" ? "active" : ""
                                    }`}
                                  onClick={() => handleToggle("graph")}
                                >
                                  <div className="icon-graph" />
                                  <FaChartGantt size={20} />
                                </button>
                              </div>
                            </span>
                          </h4>

                          <Card.Body>
                            {view === "graph" ? (
                              <>
                                <Roadmap
                                  loading={loading}
                                  handleChangeMeetings={handleChangeMeetings}
                                  data={roadmapData}
                                  milestones={milestones}
                                  startDate={meetingStartDate}
                                  endDate={meetingEndDate}
                                  onPrevious={() =>
                                    setTimeWindowOffset((prev) => prev - 1)
                                  }
                                  onNext={() =>
                                    setTimeWindowOffset((prev) => prev + 1)
                                  }
                                  onReset={resetToCurrentWeek}
                                  from="report"
                                />
                              </>
                            ) : (
                              <>
                                <ReactCalendar
                                  meetings={destinationDate?.meetings || []}
                                  handleChangeMeetings={handleChangeMeetings}
                                  from="report"
                                />
                              </>
                            )}
                          </Card.Body>
                        </div>
                      </Card>
                    </section>
                  </Container>
                </div>
                {/* graph destination home page */}
              </>
            )}
          </>
        </>
      )}

      {isFileModalOpen && (
        <ViewFilePreview
          isModalOpen={isFileModalOpen}
          setIsModalOpen={setIsFileModalOpen}
          modalContent={modalContent}
          closeModal={closeModal}
          fromReport={true}
        // isFileUploaded={isFileUploaded}
        // setIsFileUploaded={setIsFileUploaded}
        // refreshMeeting={getRefreshMeeting}
        />
      )}

      {showProgressBar1 && (
        <div className="progress-overlay">
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress1} animated />
            <h5 className="text-center my-3">{t("progressBarText")}</h5>
            <p
              style={{
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              {t("Saving Audio Report...Don't close this window")},
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Prevent the default anchor behavior
                  window.open(
                    `https://tektime.io/meeting`,

                    "_blank"
                  ); // Open the current URL in a new tab
                }}
                style={{
                  marginLeft: "5px",
                  color: "#1890ff",
                  textDecoration: "underline",
                }}
              >
                {t("Click here to view the application in another window")}
              </a>
            </p>
          </div>
        </div>
      )}
      {/* <p className="feedback-meta">Amanda Smith • an hour ago</p> */}
      {showFeedbackPopup && (
        <div className="feedback-overlay">
          <div
            className="feedback-popup bg-light"
            style={{ width: sessionUser ? "400px" : "520px" }}
          >
            <div className="feedback-card card border-0 bg-light p-1 rounded-0">
              <div className="card-body text-center" style={{ padding: "7px" }}>
                {/* <MdStars className="fs-2 bg-light" /> */}
                {sessionUser ? (
                  <img
                    src={
                      sessionUser?.image?.startsWith("http")
                        ? sessionUser?.image
                        : Assets_URL + "/" + sessionUser?.image
                    } // Or your image path
                    alt="User Avatar"
                    className="rounded-circle" // Makes the avatar circular
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                      objectPosition: "top",
                    }} // Adjust size and maintain aspect ratio
                  />
                ) : (
                  <MdStars className="fs-2 bg-light" />
                )}
                <h2 className="feedback-title">{meetingData?.title}</h2>
                <div className="bg-white p-3 rounded-3 mt-3">
                  <p className="feedback-subtitle">
                    {t("How do you rate the time you just spent")}{" "}
                    {estimateDate} à {estimateTime} ?
                  </p>

                  <div className="emoji-container">
                    {emojis?.map((item) => (
                      <OverlayTrigger
                        key={item?.value}
                        placement="top"
                        overlay={(props) => (
                          <BootTooltip id={`tooltip-${item?.value}`} {...props}>
                            {item?.label}
                          </BootTooltip>
                        )}
                      >
                        <div
                          className={`emoji ${rating === item.value ? "selected" : ""
                            }`}
                          onClick={() => setRating(item.value)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.emoji}
                          <span className="emoji-label">{item.value}</span>
                        </div>
                      </OverlayTrigger>
                    ))}
                    <div className="d-flex flex-column align-items-center justify-content-center mt-2">
                      <button
                        className="btn"
                        onClick={onClose}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "5px",
                          fontSize: "14px",
                          backgroundColor: "red", // Green if selected, gray otherwise
                          color: "#fff", // White text
                          border: "none",
                        }}
                      >
                        {t("0 Star")}
                      </button>
                    </div>
                    {!sessionUser && (
                      <div className="d-flex flex-column align-items-center justify-content-center mt-2">
                        <button
                          className="btn"
                          onClick={onClose}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 12px",
                            borderRadius: "5px",
                            fontSize: "14px",
                            backgroundColor: "#28a745", // Green if selected, gray otherwise
                            color: "#fff", // White text
                            border: "none",
                          }}
                        >
                          {t("Already Answered")}
                        </button>
                      </div>
                    )}
                  </div>
                  {!sessionUser && (
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder={t("Write your name here")}
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  )}

                  <textarea
                    className="form-control shadow-none"
                    placeholder={t("Write your feedback here")}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <label className="toggle-container">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={() => setAnonymous(!anonymous)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">{t("Anonymous")}</span>
                  </label>
                  <button
                    className="feedback-button"
                    disabled={submit}
                    onClick={handleFeedbackSubmit}
                  >
                    {t("Send my feedback")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <ConfirmationModal
          message={popupMessage}
          onConfirm={(e) => {
            continueHandlePlay(meetingData);
            setShowPopup(false);
          }}
          onCancel={(e) => {
            e.stopPropagation();
            setShowPopup(false);
          }}
        />
      )}
      {isModalOpen && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <p>{localizeVisibilityMessage(visibilityMessage, t)}</p>
            {visibilityMessage === "Please log in to view meeting." ? (
              <button className="btn btn-primary" onClick={handleLogin}>
                {t("login")}
              </button>
            ) : visibilityMessage ===
              "Please enter password to view meeting." ? (
              <div className="d-flex flex-column gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      checkPassword();
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={checkPassword}>
                  Submit
                </button>
              </div>
            ) : null}
            {!window.location.href.includes("destination") && (
              <button className="btn-no" onClick={handleClose}>
                {t("confirmationModal.close")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Report;
