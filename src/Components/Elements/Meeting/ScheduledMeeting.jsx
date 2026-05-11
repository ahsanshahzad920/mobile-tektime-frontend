import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Spinner, Card, ProgressBar } from "react-bootstrap";
import {
  API_BASE_URL,
  Assets_URL,
  CLIENT_ID,
  REDIRECT_URI,
} from "../../Apicongfig";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import NoContent from "./NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

import { Avatar, Tooltip } from "antd";
import { FaStar } from "react-icons/fa";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { RiEditBoxLine, RiMailSendLine, RiPresentationFill, RiFileChartLine, RiHistoryLine } from "react-icons/ri";
import { IoCopyOutline, IoEyeOutline, IoPlayOutline, IoVolumeHighOutline } from "react-icons/io5";
import { MdContentCopy, MdInsertLink, MdOutlineCancel } from "react-icons/md";
import { useMeetings } from "../../../context/MeetingsContext";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import { LuLink } from "react-icons/lu";
import copy from "copy-to-clipboard";
import { openLinkInNewTab } from "../../Utils/openLinkInNewTab";
import {
  abortMeetingTime,
  convertCount2ToSeconds,
  convertSecondsToDHMSFormat,
  convertTimeTakenToSeconds,
  formatStepDate,
} from "../../Utils/MeetingFunctions";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import { useFormContext } from "../../../context/CreateMeetingContext";
import NewMeetingModal from "./CreateNewMeeting/NewMeetingModal";
import { ImCancelCircle } from "react-icons/im";

import {
  convertDateToUserTimezone,
  convertTo12HourFormat,
  timezoneSymbols,
} from "./GetMeeting/Helpers/functionHelper";

const ScheduledMeeting = ({
  allMeetings,
  type,
  pageNo,
  setPageNo,
  activeTab,
  fetchCounts,
  viewMode = "card",
}) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;
  const { setSearchTerm } = useOutletContext();

  const {
    getMeetings,
    getClosedMeetings,
    getUnreadMeetings,
    getUpcomingMeetings,
    getNoStatusMeetings,

    hasMore,
    setAllMeetings,
    progress,
    meetingLength,
    setMeetingLength,

    allEventMeetings,
    userInfo,

    selectedAgenda,

    setCallApi,
    loading,
    unreadMeetingCount,
    upcomingMeetingCount,
    noStatusMeetingCount,
    activeMeetingCount,
    perPage,
    startMeetingDirectly
  } = useMeetings();

  const [startingId, setStartingId] = useState(null);
  const [audioPreviewId, setAudioPreviewId] = useState(null);

  const {
    open,
    handleShow,
    setMeeting,
    handleCloseModal,
    setIsDuplicate,
    setIsUpdated,
    setFormState,
    getMeeting,
    setCheckId,
    setChangePrivacy,
    googleLoginAndSaveProfileScheduled,
    // zoomLoginAndSaveProfileScheduled
  } = useFormContext();

  const { language } = useDraftMeetings();
  const [searchParams] = useSearchParams();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  const [authCode, setAuthCode] = useState(null);
  const [outlookName, setOutlookName] = useState("");
  const [outlookEmail, setOutlookEmail] = useState("");

  const effectRan = React.useRef(false);
  const { setUser, callUser } = useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  // const [meetings, setMeetings] = useState([]);
  const moment = require("moment");
  require("moment/locale/fr");

  const isMeetingLate = (item) => {
    if (!item?.date || !(item?.starts_at || item?.start_time)) return false;
    const meetingTime = moment(`${item.date} ${item.starts_at || item.start_time}`, "YYYY-MM-DD HH:mm:ss");
    return moment().isAfter(meetingTime) && item.status !== 'closed' && item.status !== 'in_progress';
  };
  useEffect(() => {
    setSearchTerm("");
  }, []);
  // Scroll event listener to detect bottom of the page

  // const [pageNo, setPageNo] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  const loadMoreMeetings = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = pageNo + 1;
      switch (activeTab) {
        case "unread": await getUnreadMeetings(type, nextPage); break;
        case "upcoming": await getUpcomingMeetings(type, nextPage); break;
        case "nostatus": await getNoStatusMeetings(type, nextPage); break;
        case "active":
        default: await getMeetings(type, nextPage); break;
      }
      setPageNo(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const lastMeetingRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMeetings();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore],
  );


  const [showConfirmationCancelModal, setShowConfirmationCancelModal] =
    useState(false);
  const [item, setItem] = useState(null);

  const loggedInUserId = CookieService.get("user_id");
  // const userRole = CookieService.get("role");
  const canManage = (item) =>
    item?.user?.id === parseInt(loggedInUserId) ||
    item?.steps?.some((guide) => guide?.userPID === parseInt(loggedInUserId));

  const updateMeetingStatus = async (e) => {
    e.stopPropagation();
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        ...item,
        // real_end_time: realEndTime,
        abort_end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        status: "abort",
        _method: "put",

        step_notes: null,
        steps: item?.steps?.map((step) => ({
          ...step,
          step_status: "cancelled",
          status: "cancelled",
        })),
        moment_privacy_teams:
          item?.moment_privacy === "team" &&
          item?.moment_privacy_teams?.length &&
          typeof item?.moment_privacy_teams[0] === "object"
            ? item?.moment_privacy_teams.map((team) => team.id)
            : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item?.id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        // toast.success(response.data?.message);
        // navigate("/meeting");
        setShowConfirmationCancelModal(false);
        setAllMeetings([]);
        setMeetingLength(0);
        fetchCounts();
        const refreshData = async () => {
          switch (activeTab) {
            case "unread": await getUnreadMeetings(type, 1); break;
            case "upcoming": await getUpcomingMeetings(type, 1); break;
            case "nostatus": await getNoStatusMeetings(type, 1); break;
            case "active": await getMeetings(type, 1); break;
            default: break;
          }
        };
        await refreshData();
        await getClosedMeetings(type, 1);
        //
      }
    } catch (error) {
      // console.log("error ", error);
      setShowConfirmationCancelModal(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success(t("meetingDeletedSuccessfullToast"));
        fetchCounts();
        switch (activeTab) {
          case "unread": await getUnreadMeetings(type, 1); break;
          case "upcoming": await getUpcomingMeetings(type, 1); break;
          case "nostatus": await getNoStatusMeetings(type, 1); break;
          case "active": await getMeetings(type, 1); break;
          default: break;
        }
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
    }
  };
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const handleCopy = async (item) => {
    try {
      // Parse the start time string
      const [hour, minute] = item?.start_time?.split(":").map(Number);

      // Add one hour to the hour component
      let endHour = hour + 1;

      // If end hour is greater than or equal to 24, subtract 24
      if (endHour >= 24) {
        endHour -= 24;
      }

      // Format the end time as a string
      const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`;
      // Prepare the steps array with null values for specific fields
      const updatedSteps = item?.steps?.map((step) => ({
        ...step,
        end_time: null,
        current_time: null,
        current_date: null,
        end_date: null,
        step_status: null,
        status: "active",
        delay: null,
        time_seconds: null,
        savedTime: null,
        decision: null,
        plan_d_actions: null,
        savedTime: null,
        time_taken: null,
        note: null,
        original_note: null,
        negative_time: 0,
        new_current_time: null,
        new_current_date: null,
        assigned_to_name: null,
        sent: 0,
        summary_status: false,
        max_participants_register: 0,
        price: 0,
        update_meeting: false,
        pause_date_time: null,
        pause_time_in_sec: null,
        work_time: null,
      }));
      const postData = {
        ...item,
        steps: updatedSteps,
        client_id: item?.destination?.client_id,
        _method: "put",
        duplicate: true,
        status: "active",
        transcript_job_id: null,
        delay: null,
        plan_d_actions: null,
        step_decisions: null,
        step_notes: null,
        starts_at: null,
        end_time: endTimeStr,
        timezone: userTimeZone,
        current_date: null,
        eventId: null,
        moment_privacy_teams: [],
        newly_created_team: null,
        voice_notes: null,
        voice_blob: null,
        sent: 0,
        meeting_notes: null,
        summary_status: 0,
        meeting_notes_summary: null,
        meeting_notes_transcript: null,
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item?.id}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        // console.log(response?.data?.data);
        // navigate(`/copyMeeting/${data?.id}`);
        setCheckId(data?.id);
        setIsDuplicate(true);
        await getMeeting(data?.id);
        handleShow();
        setMeeting(data);
        setFormState(data);

        // toast.error("Request failed:", response.status, response.statusText);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error(t("Duplication Failed, Check your Internet connection"));
    } finally {
    }
  };
  const [showAlert, setShowAlert] = useState(false);

  const [visoModal, setVisioModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const handleConfirm = () => {
    setVisioModal(false);
    if (selectedItem) {
      setTimeout(() => {
        const newTab = window.open(
          selectedItem?.meet_link,
          "_blank",
          "noopener,noreferrer",
        );

        if (!newTab) {
          console.error("Popup blocked! The new tab could not be opened.");
        } else {
          newTab.focus(); // Bring the new tab to the front after 5 seconds
        }
      }, 5000); // 5-second delay
    }
    if (selectedItem && selectedItem?.status === "in_progress") {
      continueChangeStatusAndPlay(selectedItem);
    } else {
      continueHandlePlay(selectedItem); // Continue the function after cancellation
    }
  };

  const handleClose = () => {
    setVisioModal(false);
    setSelectedItem(null);
    if (selectedItem && selectedItem?.status === "in_progress") {
      continueChangeStatusAndPlay(selectedItem);
    } else {
      continueHandlePlay(selectedItem); // Continue the function after cancellation
    }
  };

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };

  const handlePlay = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);
    updateCallApi(false);

    const currentDate = moment().format("YYYY-MM-DD"); // Format to match the meeting date format
    if (item?.type === "Newsletter") {
      const meetingDate = moment(item.date).format("YYYY-MM-DD"); // Extract the meeting date in the same format

      if (meetingDate !== currentDate) {
        toast.error(t("errors.newletterplayMeeting"));
        return;
      }
    } else if (item?.type !== "Task" && item.type !== "Strategy") {
      // Allow play only if the time difference is within ±60 minutes for active meetings
      if (
        !(timeDifference >= -60 && timeDifference <= 60) &&
        item.status === "active"
      ) {
        toast.error(t("errors.playMeeting"));
        return;
      }
    }

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      const isGuide =
        item?.steps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);

      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        return; // Exit if the user is not a guide
      }
    }

    continueHandlePlay(item);
  };
  const continueHandlePlay = async (item) => {
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);
    updateCallApi(false);

    const currentDate = moment().format("YYYY-MM-DD"); // Format to match the meeting date format

    const endTime = new Date();
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

    const updatedSteps = item.steps.map((step, index) => {
      if (index === 0) {
        return {
          ...step,
          status: "in_progress",
          step_status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
        };
      } else {
        return step;
      }
    });
    const payload = {
      ...item,
      steps: updatedSteps,
      client_id: item?.destination?.client_id,
      starts_at: localCurrentTime,
      current_date: currentDateTime,
      status: "in_progress",
      _method: "put",
      moment_privacy_teams:
        item?.moment_privacy === "team" &&
        item?.moment_privacy_teams?.length &&
        typeof item?.moment_privacy_teams[0] === "object"
          ? item?.moment_privacy_teams.map((team) => team.id)
          : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
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
        },
      );
      if (response.status) {
        // navigate(`/play/${item.id}`);
        // navigate(`/destination/${item?.unique_id}/${item?.id}`);
        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);

        // setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      // setLoading(false);
    }
  };

  const closeAlert = () => {
    setShowAlert(false); // Close the alert
  };
  const parseTimeTaken = (timeTaken) => {
    if (!timeTaken) {
      return;
    }
    let totalSeconds = 0;

    const parts = timeTaken.split(" - ");

    parts.forEach((part) => {
      const [value, unit] = part?.split(" ");

      switch (unit) {
        case "days":
        case "day":
          totalSeconds += parseInt(value, 10) * 86400; // 1 day = 86400 seconds
          break;
        case "hours":
        case "hour":
          totalSeconds += parseInt(value, 10) * 3600;
          break;
        case "mins":
        case "min":
          totalSeconds += parseInt(value, 10) * 60;
          break;
        case "secs":
        case "sec":
          totalSeconds += parseInt(value, 10);
          break;
        default:
          totalSeconds += parseInt(value, 10) * 60;
          break;
      }
    });

    return totalSeconds;
  };

  const changeStatusAndPlay = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    updateCallApi(true);

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      // Check if the logged-in user is in the guides array
      const isGuide =
        item?.steps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);

      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        return;
      }
    }

    continueChangeStatusAndPlay(item);
  };
  const continueChangeStatusAndPlay = async (item) => {
    // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
    navigate(`/destination/${item?.unique_id}/${item?.id}`);
  };

  const handleEdit = (item) => {
    // navigate(`/updateMeeting/${item?.id}`);
    setCheckId(item.id);
    setFormState(item);
    setIsUpdated(true);
    handleShow();
    setMeeting(item);
    setOpenDropdownId(null);
  };

  const handleChangePrivacy = (item) => {
    setCheckId(item?.id);
    setChangePrivacy(true);
    setFormState(item);

    setMeeting(item);
    handleShow();
    setOpenDropdownId(null);
  };

  //Publish Report button Api
  const sendEmail = async (item) => {
    const payload = {
      meeting_id: item.id,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send-report-link`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        toast.success(t("Report is published successfully"));
      }
    } catch (error) {
      console.log("error while sending mail", error);
    }
  };

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
          ? `${days} ${t("time_unit.days")} - ${hours} ${t(
              "time_unit.hours",
            )} `
          : `${days} ${t("time_unit.days")} `;
    } else if (hours > 0) {
      timeDisplay =
        minutes > 0
          ? `${hours} ${t("time_unit.hours")}  - ${minutes} ${t(
              "time_unit.minutes",
            )} `
          : `${hours} ${t("time_unit.hours")}`;
    } else if (hours > 0) {
      timeDisplay =
        minutes > 0
          ? `${hours} ${t("time_unit.hours")}  - ${minutes} ${t(
              "time_unit.minutes",
            )} `
          : `${hours} ${t("time_unit.hours")}`;
    } else if (minutes > 0) {
      timeDisplay =
        seconds > 0
          ? `${minutes} ${t("time_unit.minutes")} - ${seconds} ${t(
              "time_unit.seconds",
            )}`
          : `${minutes} ${t("time_unit.minutes")}`;
    } else {
      timeDisplay = `${seconds} ${t("time_unit.seconds")}`;
    }

    return timeDisplay;
  };

  const viewPresentation = async (data) => {
    navigate(`/invite/${data.id}`, { state: { data, from: "meeting" } });
  };

  const formatDate = (item) => {
    let date;
    if (language === "en") {
      date = moment(item.date).locale("en-gb"); // Set locale to English
    } else {
      date = moment(item.date); // Set into french
    }
    const today = moment().startOf("day"); // Get today date

    const day = date.format("ddd").toUpperCase();
    const dayNumber = date.format("DD");

    // Compare if the date is today
    const isToday = date.isSame(today, "day");

    // Determine the color based on whether it's today or not
    const color = isToday ? "#e7796a" : "#4C4C4C";
    return (
      <div style={{ color }}>
        {date.isValid() ? (
          <>
            {day}
            <br />
            {dayNumber}
          </>
        ) : (
          <div style={{ fontSize: "14px", fontWeight: 600 }}>
            {t("meeting.calendly.dateToBeDefined")}
          </div>
        )}
      </div>
    );
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const formatTimeDifference = (difference) => {
    if (!difference || typeof difference !== "string") return "";

    // Split the difference into parts
    const parts = difference.split(":");
    if (parts.length !== 4) {
      console.error("Invalid difference format:", difference);
      return "";
    }

    // Split the difference into days, hours, minutes, and seconds
    const [daysPart, hoursPart, minutesPart, secondsPart] =
      difference?.split(":");
    const [days] = daysPart?.split("days").map(Number);
    const [hours] = hoursPart?.split("hours").map(Number);
    const [minutes] = minutesPart?.split("mins").map(Number);
    const [seconds] = secondsPart?.split("secs").map(Number);

    let result = "";

    if (days > 0) {
      result += `${days} days `;
      result += hours > 0 ? `${hours} hours` : "";
    } else if (hours > 0) {
      result += `${hours} hours `;
      result += minutes > 0 ? `${minutes} mins` : "";
    } else if (minutes > 0) {
      result += `${minutes} mins `;
      result += seconds > 0 ? `${seconds} secs` : "";
    } else if (seconds > 0) {
      result += `${seconds} secs`;
    }

    return result.trim();
  };
  const calculateTimeDifference = (steps, starts_at, current_date) => {
    if (!starts_at || !current_date || !steps) return;

    const [time, meridiem] = starts_at.split(" ");
    let [currentHours, currentMinutes, currentSeconds] = time
      .split(":")
      .map(Number);

    if (meridiem) {
      if (meridiem.toLowerCase() === "pm" && currentHours < 12)
        currentHours += 12;
      if (meridiem.toLowerCase() === "am" && currentHours === 12)
        currentHours = 0;
    }

    const [day, month, year] = current_date.split("-").map(Number);
    const myDate = `${day}/${month}/${year}`;
    const currentDateTime = new Date(myDate);

    currentDateTime.setHours(currentHours, currentMinutes, currentSeconds);

    let diffInSeconds = 0;
    let count2InSeconds = 0;
    let timeTakenInSeconds = 0;
    steps.forEach((step) => {
      const { time_taken, step_status, count2, time_unit } = step;
      count2InSeconds = convertCount2ToSeconds(count2, time_unit);
      timeTakenInSeconds = parseTimeTaken(time_taken);
      if (step_status === "completed") {
        if (time_taken) {
          diffInSeconds += parseTimeTaken(time_taken);
        }
      } else if (step_status === "in_progress") {
        count2InSeconds = convertCount2ToSeconds(count2, time_unit);
        timeTakenInSeconds = parseTimeTaken(step?.time_taken);

        if (count2InSeconds > timeTakenInSeconds) {
          diffInSeconds += convertCount2ToSeconds(count2, time_unit);
        } else if (time_taken) {
          diffInSeconds += parseTimeTaken(time_taken);
        }
      } else {
        diffInSeconds += convertCount2ToSeconds(count2, time_unit);
      }
    });
    const formattedDifference = convertSecondsToDHMSFormat(diffInSeconds);
    const unqiueFormat = formatTimeDifference(formattedDifference);

    return ` (${unqiueFormat}) `;
  };

  const toggleDropdown = (id) => {
    // If the clicked dropdown is already open, close it
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      // Otherwise, set the new dropdown id
      setOpenDropdownId(id);
    }
  };

  function calculateTotalTime(steps) {
    if (!steps) return null;
    let totalSeconds = 0;
    steps.forEach((step) => {
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
    if (days > 0) {
      result += `${days} ${t("days")} `;
    }
    if (hrs > 0) {
      result += `${hrs} ${t("hours")} `;
    }
    if (mins > 0) {
      result += `${mins} mins `;
    }
    if (secs > 0) {
      result += `${secs} secs`;
    }
    return result.trim();
  }

  if (viewMode !== "list") {
    allMeetings?.sort((a, b) => moment(a.date).diff(moment(b.date)));
  }

  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };

  const meetingsByMonth = useMemo(() => {
    const meetingsMap = {};

    // Choose correct meetings list based on selected agenda
    const meetingsToMap =
      selectedAgenda.google && !selectedAgenda.tektime
        ? allMeetings
        : selectedAgenda.tektime && !selectedAgenda.google
          ? allMeetings
          : allMeetings;

    meetingsToMap?.forEach((item, index) => {
      const validDate = moment(item.date);
      const monthName = validDate.isValid()
        ? validDate
            .locale(language === "en" ? "en-gb" : "fr")
            .format("MMMM YYYY")
        : t("meeting.calendly.dateToBeDefined");

      if (!meetingsMap[monthName]) {
        meetingsMap[monthName] = [];
      }

      const guideCount = item?.guides?.length;

      const totalTime = calculateTotalTime(item?.steps);

      const validFeedbacks =
        item?.meeting_feedbacks?.filter((feedback) => feedback.rating > 0) || [];

      const averageRating =
        validFeedbacks.length > 0
          ? validFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
            validFeedbacks.length
          : 0;

      const formattedDate = convertDateToUserTimezone(
        item?.date,
        item?.starts_at || item?.start_time,
        item?.timezone,
      );

      const daysDifference = calculateDaysDifference(
        item?.date,
        item?.estimate_time?.split("T")[0],
      );

      const isGoogle = item?.created_from === "Google Calendar" || item?.type === "Google Agenda Event";
      const isOutlook = item?.created_from === "Outlook Calendar" || item?.type === "Outlook Agenda Event";
      const missionTitle = item?.objective || (isGoogle ? "Google" : isOutlook ? "Outlook" : "—");
      const initials = (item?.objective || item?.title || "M").substring(0, 2).toUpperCase();
      const logo = item?.destination?.clients?.client_logo || item?.solution?.logo || item?.destination?.logo;
      const solutionTitle = item?.solution ? item?.solution?.title : (isGoogle ? "Google" : isOutlook ? "Outlook" : item?.type || "Réunion");
      const startTime = convertTo12HourFormat(item?.starts_at || item?.start_time, item?.date, item?.steps, item?.timezone);
      const endTime = convertTo12HourFormat(item?.estimate_time?.split("T")[1], item?.estimate_time?.split("T")[0], item?.steps, item?.timezone);

      meetingsMap[monthName].push(
        <Card
          className="mt-3 mb-2 scheduled"
          key={index}
          onClick={() => viewPresentation(item)}
        >
          {/* Mobile Card Layout – Spotify-style */}
          <div className="mobile-only premium-mobile-card">
            <div className="smc-top">
              {/* Thumbnail */}
              <div className="smc-thumb" style={{ background: isGoogle ? '#fde6e9' : isOutlook ? '#e0e7ff' : '#f1f5f9' }}>
                {logo ? (
                  <img src={logo.startsWith('http') ? logo : `${Assets_URL}/${logo}`} alt="logo" />
                ) : (
                  <span className="smc-initials" style={{ color: isGoogle ? '#ef4444' : isOutlook ? '#3b82f6' : '#64748b' }}>{initials}</span>
                )}
              </div>

              {/* Body */}
              <div className="smc-body">
                <div className="smc-title">
                  {item.title}
                  {item?.status === 'active' && (
                    <span className={`smc-badge ${moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? "late" : "future"}`}>
                      {moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? t("badge.late") : t("badge.future")}
                    </span>
                  )}
                  {item?.status === 'in_progress' && <span className="smc-badge progress">{t("badge.inprogress")}</span>}
                  {item?.status === 'closed' && <span className="smc-badge finished">{t("badge.finished")}</span>}
                  {item?.status === 'abort' && <span className="smc-badge cancelled">{t("badge.cancel")}</span>}
                  {item?.status === 'todo' && <span className="smc-badge draft">{t("badge.todo")}</span>}
                </div>
                <div className="smc-desc">{missionTitle || solutionTitle}</div>
                <div className="smc-meta">{formattedDate}{startTime ? ` • ${startTime}` : ''}{endTime ? ` → ${endTime}` : ''}</div>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="smc-actions" onClick={e => e.stopPropagation()}>
              <div className="smc-icon-group">
                {/* Copy link */}
                <button className="smc-icon-btn" title="Copier le lien" onClick={() => { copy(`${window.location.origin}/destination/${item?.unique_id}/${item?.id}`); toast.success(t("linkCopiedToast")); }}>
                  <MdInsertLink size="20px" />
                </button>
                {/* Edit / Duplicate */}
                {canManage(item) && (
                  <>
                    <button className="smc-icon-btn" title={t("dropdown.Duplicate")} onClick={(e) => { e.stopPropagation(); handleCopy(item); }}>
                      <MdContentCopy size="18px" />
                    </button>
                  </>
                )}
                {/* More (kebab) */}
                <div className="dropdown">
                  <button className="smc-icon-btn" type="button" onClick={(e) => { e.stopPropagation(); toggleDropdown(item.id); }}>
                    <BiDotsVerticalRounded size="20px" />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end mobile-dropdown-menu ${openDropdownId === item.id ? 'show' : ''}`}>
                    {canManage(item) && (
                      <>
                        <li><a className="dropdown-item d-flex align-items-center gap-2 py-3" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}><RiEditBoxLine size="19px" /> {t("dropdown.Modify")}</a></li>
                        <div className="dropdown-divider"></div>
                        <li><a className="dropdown-item d-flex align-items-center gap-2 py-3 text-danger" onClick={(e) => handleDeleteClick(e, item.id)}><AiOutlineDelete size="19px" /> {t("dropdown.Delete")}</a></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Play / View / Audio button */}
              {item?.status === 'active' ? (
                /* ACTIVE → Play + API call */
                <button
                  className="smc-play-btn"
                  style={{ background: startingId === item?.id ? '#94a3b8' : '#2563eb' }}
                  disabled={startingId === item?.id}
                  onClick={async (e) => {
                    e.stopPropagation();
                    setStartingId(item?.id);
                    await startMeetingDirectly(item, navigate, t);
                    setStartingId(null);
                  }}
                >
                  {startingId === item?.id
                    ? <span className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                    : <IoPlayOutline size="20px" />}
                </button>
              ) : (item?.status === 'in_progress' || item?.status === 'to_finish') ? (
                /* IN PROGRESS / TO_FINISH → Eye icon, navigate */
                <button
                  className="smc-play-btn inprogress"
                  onClick={(e) => { e.stopPropagation(); navigate(`/destination/${item?.unique_id}/${item?.id}`); }}
                >
                  <IoEyeOutline size="20px" />
                </button>
              ) : (item?.status === 'closed' || item?.status === 'abort') && item?.voice_notes ? (
                /* CLOSED / ABORT with audio → Speaker toggle */
                <button
                  className="smc-play-btn"
                  style={{ background: audioPreviewId === item?.id ? '#7c3aed' : '#0f172a' }}
                  onClick={(e) => { e.stopPropagation(); setAudioPreviewId(audioPreviewId === item?.id ? null : item?.id); }}
                >
                  <IoVolumeHighOutline size="20px" />
                </button>
              ) : (
                /* CLOSED / ABORT without audio → File chart, navigate */
                <button
                  className="smc-play-btn"
                  style={{ background: '#64748b' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/destination/${item?.unique_id}/${item?.id}`); }}
                >
                  <RiFileChartLine size="20px" />
                </button>
              )}
            </div>
            {/* Inline audio preview */}
            {audioPreviewId === item?.id && item?.voice_notes && (
              <div style={{ padding: '0 16px 12px', marginTop: '-4px' }} onClick={e => e.stopPropagation()}>
                <audio
                  controls
                  autoPlay
                  src={item.voice_notes}
                  style={{ width: '100%', height: '36px', borderRadius: '8px', accentColor: '#7c3aed' }}
                />
              </div>
            )}
          </div>

          <div className="desktop-only">
          <div className="row">
            <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
              {formatDate(item)}
            </div>
            <div className="col-md-10" style={{ paddingLeft: "18px" }}>
              <div className="row">
                <div className="col-12">
                  <h6 className="destination"> {item?.objective}</h6>

                  {item?.created_from === "Google Calendar" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Google Calendar"
                      role="img"
                      viewBox="0 0 512 512"
                      width="33px"
                      height="34px"
                      fill="#000000"
                    >
                      <rect
                        width="512"
                        height="512"
                        rx="15%"
                        fill="#ffffff"
                      ></rect>
                      <path
                        d="M100 340h74V174H340v-74H137Q100 100 100 135"
                        fill="#4285f4"
                      ></path>
                      <path
                        d="M338 100v76h74v-41q0-35-35-35"
                        fill="#1967d2"
                      ></path>
                      <path d="M338 174h74V338h-74" fill="#fbbc04"></path>
                      <path
                        d="M100 338v39q0 35 35 35h41v-74"
                        fill="#188038"
                      ></path>
                      <path d="M174 338H338v74H174" fill="#34a853"></path>
                      <path d="M338 412v-74h74" fill="#ea4335"></path>
                      <path
                        d="M204 229a25 22 1 1 1 25 27h-9h9a25 22 1 1 1-25 27M270 231l27-19h4v-7V308"
                        stroke="#4285f4"
                        strokeWidth="15"
                        strokeLinejoin="bevel"
                        fill="none"
                      ></path>
                    </svg>
                  )}
                  {item?.created_from === "Outlook Calendar" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Outlook Calendar"
                      role="img"
                      viewBox="0 0 48 48"
                      width="33px"
                      height="34px"
                    >
                      <path fill="#0364b8" d="M6 10H30V38H6z" />
                      <path fill="#0078d4" d="M30 10H42V38H30z" />
                      <path
                        fill="#28a8ea"
                        d="M6 10H30L42 18V38H30L6 30z"
                        opacity="0.9"
                      />
                      <path
                        fill="#fff"
                        d="M18.5 19.5c2.7 0 4.7 2 4.7 4.5s-2 4.5-4.7 4.5-4.7-2-4.7-4.5 2-4.5 4.7-4.5zm0 1.4c-1.8 0-3.2 1.4-3.2 3.1s1.4 3.1 3.2 3.1 3.2-1.4 3.2-3.1-1.4-3.1-3.2-3.1z"
                      />
                      <path fill="#0078d4" d="M42 18L30 10v8h12z" />
                    </svg>
                  )}

                  <span className="heading">{item.title}</span>
                  {item?.status === "active" && (
                    <span
                      className={`badge ms-2 ${
                        moment().isAfter(
                          moment(
                            `${item.date} ${item.start_time}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                          ? "late"
                          : "future"
                      }`}
                      style={{ padding: "3px 8px 3px 8px" }}
                    >
                      {moment().isAfter(
                        moment(
                          `${item.date} ${item.start_time}`,
                          "YYYY-MM-DD HH:mm",
                        ),
                      )
                        ? t("badge.late")
                        : t("badge.future")}
                    </span>
                  )}
                  {item?.status === "in_progress" && (
                    // <span className="mx-2 badge status-badge-inprogress1">
                    <span
                      className={`${
                        item?.steps?.some(
                          (item) =>
                            // item?.delay >= "00d:00h:00m:01s"
                            item?.step_status === "in_progress" &&
                            convertTimeTakenToSeconds(item?.time_taken) >
                              convertCount2ToSeconds(
                                item?.count2,
                                item?.time_unit,
                              ),
                        )
                          ? "status-badge-red1"
                          : "status-badge-inprogress1"
                      } mx-2 badge`}
                    >
                      {t("badge.inprogress")}
                    </span>
                  )}
                  {item.status === "closed" && (
                    <span className="mx-2 badge inprogrss">
                      {t("badge.finished")}
                    </span>
                  )}
                  {item?.status === "abort" && (
                    <span className="mx-2 badge late">{t("badge.cancel")}</span>
                  )}

                  {item?.status === "to_finish" && (
                    <span className="mx-2 badge status-badge-finish p-1">
                      {t("badge.finish")}
                    </span>
                  )}

                  {item?.status === "todo" && (
                    <span className="mx-2 badge status-badge-green p-1">
                      {t("badge.Todo")}
                    </span>
                  )}
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-4 col-12">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                      stroke="#92929D"
                      stroke-miterlimit="10"
                    />
                    <path
                      d="M8.14258 4.5V9H11.1426"
                      stroke="#92929D"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  {item.type === "Action1" ||
                  item?.type === "Newsletter" ||
                  item?.type === "Strategy" ? (
                    <span className="time">
                      {formatStepDate(
                        item.date,
                        item?.starts_at || item?.start_time,
                        item?.timezone,
                      )}{" "}
                      -{" "}
                      {formatStepDate(
                        item?.estimate_time?.split("T")[0],
                        item?.starts_at || item?.start_time,
                        item?.timezone,
                      )}{" "}
                      {daysDifference && `(${daysDifference} ${t("days")})`}
                    </span>
                  ) : (
                    <span className="time">
                      {/* {formattedDate} */}
                      {formattedDate}
                      &nbsp;
                      {item?.status === "closed" || item?.status === "abort"
                        ? item?.start_time && <>{t("at")}&nbsp;</>
                        : t("at")}
                      {/* {totalTime && ` ${t("at")}`} */}
                      &nbsp;
                      {convertTo12HourFormat(
                        item?.starts_at || item?.start_time,
                        item?.date,
                        item?.steps,
                        item?.timezone,
                      )}{" "}
                      &nbsp;-&nbsp;
                      {item?.status === "closed" || item?.status === "abort" ? (
                        <>
                          {formatStepDate(
                            item?.estimate_time?.split("T")[0],
                            item?.estimate_time?.split("T")[1],
                            item?.timezone,
                          )}{" "}
                          {(item?.starts_at || item?.start_time) && t("at")}&nbsp;
                          {convertTo12HourFormat(
                            item?.estimate_time?.split("T")[1],
                            item?.estimate_time?.split("T")[0],
                            item?.steps,
                            item?.timezone,
                          )}
                        </>
                      ) : (
                        <>
                          {item?.status !== "in_progress" ? (
                            totalTime && ` (${totalTime}) `
                          ) : (
                            <>
                              {calculateTimeDifference(
                                item?.steps,
                                item?.starts_at,
                                item?.current_date || item?.date,
                              )}
                            </>
                          )}
                        </>
                      )}
                    </span>
                  )}

                  <span className="">
                    {getTimezoneSymbol(CookieService.get("timezone"))}
                  </span>
                  <div>
                    {(item?.status === "closed" || item?.status === "abort") &&
                      !(item?.type === "Special" || item?.type === "Law") && (
                        <div className="text-start">
                          <svg
                            width="17"
                            height="16"
                            viewBox="0 0 17 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_1578_4092)">
                              <path
                                d="M16.2669 11.3333L12.9336 14.6666L10.6003 12.3333L11.6003 11.3333L12.9336 12.6666L15.2669 10.3333L16.2669 11.3333ZM9.33359 13.2666C9.06693 13.3333 8.86693 13.3333 8.60026 13.3333C5.66693 13.3333 3.26693 10.9333 3.26693 7.99998C3.26693 5.06665 5.66693 2.66665 8.60026 2.66665C11.5336 2.66665 13.9336 5.06665 13.9336 7.99998C13.9336 8.26665 13.9336 8.46665 13.8669 8.73331C14.3336 8.79998 14.7336 8.93331 15.1336 9.13331C15.2003 8.73331 15.2669 8.39998 15.2669 7.99998C15.2669 4.33331 12.2669 1.33331 8.60026 1.33331C4.93359 1.33331 1.93359 4.33331 1.93359 7.99998C1.93359 11.6666 4.93359 14.6666 8.60026 14.6666C9.00026 14.6666 9.40026 14.6 9.73359 14.5333C9.53359 14.2 9.40026 13.7333 9.33359 13.2666ZM11.0003 9.39998L8.93359 8.19998V4.66665H7.93359V8.66665L10.2669 10.0666C10.4669 9.79998 10.7336 9.59998 11.0003 9.39998Z"
                                fill="#8590A3"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_1578_4092">
                                <rect
                                  width="16"
                                  height="16"
                                  fill="white"
                                  transform="translate(0.601562)"
                                />
                              </clipPath>
                            </defs>
                          </svg>

                          <span className="time">
                            {calculateTotalTimeTaken(item?.steps)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <div className="col-md-4 col-12">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                      fill="#8590A3"
                    />
                  </svg>
                  {/* <span className="time">{item?.type}</span> */}
                  <span className="time">
                    {item?.solution
                      ? item?.solution?.title
                      : item?.type === "Google Agenda Event"
                        ? "Google Agenda Event"
                        : item?.type === "Outlook Agenda Event"
                          ? "Outlook Agenda Event"
                          : item?.type === "Prise de contact"
                            ? "Prise de contact"
                            : t(`types.${item?.type}`)}
                  </span>
                </div>
                {(item?.status === "closed" || item?.status === "abort") &&
                  item?.meeting_feedbacks?.length > 0 &&
                  item?.meeting_feedbacks?.some(
                    (feedback) => feedback.rating > 0,
                  ) && (
                    <div
                      className="col-md-4 d-flex gap-1"
                      style={{
                        paddingTop: "2px",
                      }}
                    >
                      <svg
                        width="20px"
                        height="20px"
                        viewBox="0 -0.5 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M5.5 14.2606C5.51486 16.2065 7.10302 17.7728 9.049 17.7606H9.53L10.952 19.2606C11.0963 19.4094 11.2947 19.4934 11.502 19.4934C11.7093 19.4934 11.9077 19.4094 12.052 19.2606L13.474 17.7606H13.955C15.8994 17.7706 17.4851 16.205 17.5 14.2606V10.0006C17.4851 8.05461 15.897 6.48838 13.951 6.50057H9.051C7.10424 6.48727 5.51486 8.05382 5.5 10.0006V14.2606Z"
                            stroke="#8590A3"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M7.25 6.5006C7.25 6.91481 7.58579 7.2506 8 7.2506C8.41421 7.2506 8.75 6.91481 8.75 6.5006H7.25ZM16.449 4.0006V4.75073L16.4629 4.75047L16.449 4.0006ZM18.9332 4.97613L18.4128 5.51618L18.4128 5.51618L18.9332 4.97613ZM20 7.4226H20.7501L20.7499 7.40875L20 7.4226ZM17.5 14.2506C17.0858 14.2506 16.75 14.5864 16.75 15.0006C16.75 15.4148 17.0858 15.7506 17.5 15.7506V14.2506ZM8.5 10.2506C8.08579 10.2506 7.75 10.5864 7.75 11.0006C7.75 11.4148 8.08579 11.7506 8.5 11.7506V10.2506ZM14.265 11.7506C14.6792 11.7506 15.015 11.4148 15.015 11.0006C15.015 10.5864 14.6792 10.2506 14.265 10.2506V11.7506ZM9.221 12.3586C8.80679 12.3586 8.471 12.6944 8.471 13.1086C8.471 13.5228 8.80679 13.8586 9.221 13.8586V12.3586ZM13.544 13.8586C13.9582 13.8586 14.294 13.5228 14.294 13.1086C14.294 12.6944 13.9582 12.3586 13.544 12.3586V13.8586ZM8.75 6.5006C8.75 5.81137 9.01573 5.43293 9.42787 5.18347C9.8982 4.89877 10.6233 4.7506 11.549 4.7506V3.2506C10.5147 3.2506 9.4653 3.40742 8.65113 3.90023C7.77877 4.42827 7.25 5.29983 7.25 6.5006H8.75ZM11.549 4.7506H16.449V3.2506H11.549V4.7506ZM16.4629 4.75047C17.1887 4.73702 17.8901 5.01246 18.4128 5.51618L19.4537 4.43609C18.6445 3.6563 17.5587 3.22991 16.4351 3.25073L16.4629 4.75047ZM18.4128 5.51618C18.9355 6.01991 19.2367 6.71065 19.2501 7.43645L20.7499 7.40875C20.7291 6.28518 20.2629 5.21587 19.4537 4.43609L18.4128 5.51618ZM19.25 7.4226V11.5786H20.75V7.4226H19.25ZM19.25 11.5786C19.25 12.4864 19.1243 13.1709 18.8585 13.6099C18.6354 13.9783 18.2701 14.2506 17.5 14.2506V15.7506C18.7299 15.7506 19.6146 15.2569 20.1415 14.3868C20.6257 13.5873 20.75 12.5608 20.75 11.5786H19.25ZM8.5 11.7506H14.265V10.2506H8.5V11.7506ZM9.221 13.8586H13.544V12.3586H9.221V13.8586Z"
                            fill="#8590A3"
                          ></path>{" "}
                        </g>
                      </svg>
                      {/* Star Ratings */}

                      <div className="d-flex">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            color={
                              index < Math.round(averageRating)
                                ? "#FFD700"
                                : "#D3D3D3"
                            }
                            size={16}
                            style={{ marginRight: 1 }}
                          />
                        ))}
                      </div>

                      <span className="time">{averageRating.toFixed(1)}</span>
                      <span className="time ml-0">{`(${
                        item?.meeting_feedbacks?.length
                      } ${
                        item?.meeting_feedbacks?.length > 1 ? "Votes" : "Vote"
                      })`}</span>
                    </div>
                  )}

                <div className="col-md-4 col-12">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                      fill="#8590A3"
                    />
                  </svg>
                  {/* <span className="time">{item?.type}</span> */}
                  <span className="time">
                    {item?.solution
                      ? item?.solution?.title
                      : item?.type === "Google Agenda Event"
                        ? "Google Agenda Event"
                        : item?.type === "Outlook Agenda Event"
                          ? "Outlook Agenda Event"
                          : item?.type === "Prise de contact"
                            ? "Prise de contact"
                            : t(`types.${item?.type}`)}
                  </span>
                </div>
                {/* <div className="col-md-4 col-12">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.346 6.79075C12.3618 6.77463 12.3808 6.76199 12.4018 6.75362C12.4228 6.74526 12.4453 6.74137 12.4679 6.74218C12.4905 6.743 12.5126 6.74851 12.533 6.75836C12.5533 6.76821 12.5714 6.78219 12.586 6.79941C13.4616 7.83748 13.9592 9.1419 13.9973 10.4994C13.9978 10.5213 13.9938 10.543 13.9857 10.5633C13.9776 10.5835 13.9656 10.602 13.9502 10.6175C13.9349 10.6331 13.9165 10.6454 13.8964 10.6537C13.8762 10.6621 13.8545 10.6663 13.8327 10.6661H10.8293C10.7849 10.6653 10.7424 10.6476 10.7104 10.6167C10.6785 10.5857 10.6595 10.5438 10.6573 10.4994C10.627 10.0165 10.4657 9.5509 10.1907 9.15275C10.167 9.11952 10.1557 9.07907 10.1588 9.0384C10.1618 8.99773 10.179 8.95941 10.2073 8.93008L12.346 6.79075ZM11.866 6.07941C11.9393 6.14075 11.9427 6.25141 11.8753 6.31941L9.73532 8.45875C9.70603 8.48691 9.66784 8.50399 9.62732 8.50703C9.5868 8.51007 9.54649 8.49889 9.51332 8.47541C9.20249 8.26075 8.84958 8.11463 8.47799 8.04675C8.43781 8.03991 8.4013 8.01924 8.37475 7.98831C8.34821 7.95739 8.33332 7.91816 8.33265 7.87741V4.85208C8.33265 4.75608 8.41265 4.68008 8.50865 4.68808C9.74476 4.79382 10.9177 5.27947 11.866 6.07941ZM7.66599 4.85275C7.66625 4.8301 7.66178 4.80765 7.65287 4.78684C7.64395 4.76602 7.63079 4.74729 7.61423 4.73186C7.59766 4.71642 7.57805 4.70461 7.55666 4.69719C7.53526 4.68976 7.51256 4.68689 7.48999 4.68875C6.25395 4.7943 5.08102 5.28038 4.13265 6.08008C4.11544 6.09471 4.10146 6.11276 4.0916 6.1331C4.08175 6.15343 4.07624 6.17559 4.07542 6.19817C4.07461 6.22075 4.0785 6.24325 4.08687 6.26424C4.09523 6.28523 4.10787 6.30424 4.12399 6.32008L6.26399 8.45941C6.29315 8.48781 6.33137 8.50505 6.37196 8.5081C6.41255 8.51114 6.45292 8.49981 6.48599 8.47608C6.7968 8.2614 7.14972 8.11528 7.52132 8.04741C7.56149 8.04057 7.59801 8.0199 7.62455 7.98898C7.65109 7.95806 7.66599 7.91883 7.66665 7.87808L7.66599 4.85275ZM5.80865 9.15275C5.83205 9.11951 5.84311 9.07915 5.83995 9.03862C5.83679 8.9981 5.81959 8.95995 5.79132 8.93075L3.65199 6.79075C3.63611 6.77467 3.61705 6.76207 3.59604 6.75377C3.57502 6.74546 3.55251 6.74163 3.52993 6.74251C3.50735 6.74338 3.4852 6.74896 3.46489 6.75887C3.44459 6.76878 3.42657 6.78282 3.41199 6.80008C2.53685 7.83833 2.03977 9.14273 2.00199 10.5001C2.00154 10.5219 2.00546 10.5435 2.01351 10.5638C2.02156 10.584 2.03358 10.6024 2.04886 10.618C2.06415 10.6335 2.08238 10.6458 2.1025 10.6542C2.12261 10.6626 2.1442 10.6668 2.16599 10.6667H5.16932C5.26132 10.6667 5.33599 10.5927 5.34132 10.5001C5.37132 10.0154 5.53465 9.54941 5.80799 9.15341"
                      fill="#8590A3"
                      fill-opacity="0.25"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.33203 7.87077C8.33203 7.95477 8.3947 8.02477 8.47737 8.0401C8.85073 8.10802 9.20529 8.25485 9.51737 8.47077C9.55067 8.49434 9.59116 8.50551 9.63183 8.50234C9.67251 8.49918 9.71079 8.48187 9.74004 8.45344L12.3467 5.84677C12.3628 5.83102 12.3756 5.8121 12.384 5.79119C12.3925 5.77029 12.3966 5.74786 12.3959 5.72531C12.3953 5.70276 12.39 5.68059 12.3804 5.66019C12.3708 5.63979 12.357 5.6216 12.34 5.60677C11.2636 4.6834 9.92079 4.12735 8.5067 4.01944C8.48426 4.01788 8.46174 4.02097 8.44055 4.02851C8.41936 4.03606 8.39996 4.04791 8.38356 4.0633C8.36717 4.0787 8.35412 4.09732 8.34526 4.11799C8.33639 4.13866 8.33189 4.16094 8.33203 4.18344V7.87077Z"
                      fill="#8590A3"
                    />
                  </svg>
                  <span className="time">
                    {" "}
                    {selectedAgenda.google
                      ? t(`meeting.newMeeting.options.priorities.Moyenne`)
                      : t(
                          `meeting.newMeeting.options.priorities.${item?.priority}`
                        )}
                  </span>
                </div> */}
              </div>

              <div className="row mt-3">
                <div className="col-md-4 mt-2">
                  <div className="creator">{t("Creator")}</div>
                  <div className="">
                    <div>
                      <Tooltip title={item?.user?.full_name} placement="top">
                        <Avatar
                          src={
                            item?.user?.image?.startsWith("users/")
                              ? `${Assets_URL}/${item?.user?.image}`
                              : item?.user?.image
                          }
                        />
                      </Tooltip>
                      <span className="creator-name">
                        {item?.user?.full_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 mt-2">
                  {guideCount > 0 && (
                    <div className="creator">
                      {guideCount > 1 ? t("presentors") : t("presentor")}
                    </div>
                  )}

                  <div className=" d-flex align-items-center flex-wrap">
                    <Avatar.Group>
                      {item?.guides?.map((item) => {
                        // if (item?.isCreator === 1) {
                        //   return;
                        // }

                        return (
                          <>
                            <Tooltip
                              title={
                                item?.first_name
                                  ? item?.first_name
                                  : " " + " " + item.last_name
                                    ? item.last_name
                                    : " "
                              }
                              placement="top"
                            >
                              <Avatar
                                size="large"
                                // src={
                                //   item?.assigned_to_image
                                //     ? Assets_URL + "/" + item.assigned_to_image
                                //     : item?.participant_image
                                // }
                                src={
                                  item?.participant_image?.startsWith("users/")
                                    ? Assets_URL + "/" + item?.participant_image
                                    : item?.participant_image
                                }
                              />
                            </Tooltip>
                          </>
                        );
                      })}
                    </Avatar.Group>
                    <span
                      style={{
                        marginLeft: guideCount > 0 ? "8px" : "0px",
                      }}
                    >
                      {guideCount > 0
                        ? `${guideCount} ${
                            guideCount > 1 ? t("presentors") : t("presentor")
                          }`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="col-md-4 mt-2">
                  {/* {selectedAgenda !== "google" && ( */}
                  <>
                    <div className="creator">{t("Privacy")}</div>
                    <div className="">
                      <div className="d-flex align-items-center flex-wrap">
                        {item?.moment_privacy === "public" ? (
                          <Avatar
                            src="/Assets/Tek.png"
                            style={{ borderRadius: "0" }}
                          />
                        ) : item?.moment_privacy === "team" ? (
                          <Avatar.Group>
                            {item?.moment_privacy_teams_data?.map((item) => {
                              return (
                                <>
                                  <Tooltip title={item?.name} placement="top">
                                    <Avatar
                                      size="large"
                                      src={
                                        item?.logo?.startsWith("http")
                                          ? item.logo
                                          : Assets_URL + "/" + item.logo
                                      }
                                    />
                                  </Tooltip>
                                </>
                              );
                            })}
                          </Avatar.Group>
                        ) : item?.moment_privacy === "participant only" ? (
                          <Avatar.Group>
                            {item?.user_with_participants?.map((item) => {
                              return (
                                <>
                                  <Tooltip
                                    title={item?.full_name}
                                    placement="top"
                                  >
                                    <Avatar
                                      size="large"
                                      src={
                                        item?.participant_image?.startsWith(
                                          "http",
                                        )
                                          ? item.participant_image
                                          : Assets_URL +
                                            "/" +
                                            item.participant_image
                                      }
                                    />
                                  </Tooltip>
                                </>
                              );
                            })}
                          </Avatar.Group>
                        ) : item?.moment_privacy === "tektime members" ? (
                          <img
                            src={
                              item?.user?.enterprise?.logo?.startsWith("http")
                                ? item?.user?.enterprise?.logo
                                : Assets_URL +
                                  "/" +
                                  item?.user?.enterprise?.logo
                            }
                            alt="Logo"
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "fill",
                              borderRadius: "50%",
                            }}
                          /> // <Tooltip
                        ) : //   title={item?.user?.enterprise?.name}
                        //   placement="top"
                        // >
                        //   <img
                        //     src={
                        //       item?.user?.enterprise?.logo?.startsWith(
                        //         "http"
                        //       )
                        //         ? item?.user?.enterprise?.logo
                        //         : Assets_URL +
                        //           "/" +
                        //           item?.user?.enterprise?.logo
                        //     }
                        //     alt="Logo"
                        //     style={{
                        //       width: "30px",
                        //       height: "30px",
                        //       objectFit: "fill",
                        //       borderRadius: "50%",
                        //     }}
                        //   />
                        // </Tooltip>
                        item?.moment_privacy === "enterprise" ? (
                          <Tooltip
                            title={item?.user?.enterprise?.name}
                            placement="top"
                          >
                            <img
                              src={
                                item?.user?.enterprise?.logo?.startsWith("http")
                                  ? item?.user?.enterprise?.logo
                                  : Assets_URL +
                                    "/" +
                                    item?.user?.enterprise?.logo
                              }
                              alt="Logo"
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "fill",
                                borderRadius: "50%",
                              }}
                            />
                          </Tooltip>
                        ) : item?.moment_privacy === "password" ? (
                          <svg
                            width="37px"
                            height="36px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                stroke="#000000"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>{" "}
                            </g>
                          </svg>
                        ) : (
                          <Tooltip
                            title={item?.user?.full_name}
                            placement="top"
                          >
                            <Avatar
                              src={
                                item?.user?.image.startsWith("users/")
                                  ? Assets_URL + "/" + item?.user?.image
                                  : item?.user?.image
                              }
                            />
                          </Tooltip>
                        )}

                        <span
                          className={`badge ms-2 ${
                            item?.moment_privacy === "private"
                              ? "solution-badge-red"
                              : item?.moment_privacy === "public"
                                ? "solution-badge-green"
                                : item?.moment_privacy === "enterprise" ||
                                    item?.moment_privacy ===
                                      "participant only" ||
                                    item?.moment_privacy === "tektime members"
                                  ? "solution-badge-blue"
                                  : item?.moment_privacy === "password"
                                    ? "solution-badge-red"
                                    : "solution-badge-yellow"
                          }`}
                          style={{ padding: "3px 8px 3px 8px" }}
                        >
                          {item?.moment_privacy === "private"
                            ? t("solution.badge.private")
                            : item?.moment_privacy === "public"
                              ? t("solution.badge.public")
                              : item?.moment_privacy === "enterprise"
                                ? t("solution.badge.enterprise")
                                : item?.moment_privacy === "participant only"
                                  ? t("solution.badge.participantOnly")
                                  : item?.moment_privacy === "tektime members"
                                    ? t("solution.badge.membersOnly")
                                    : item?.moment_privacy === "password"
                                      ? t("solution.badge.password")
                                      : t("solution.badge.team")}
                        </span>
                      </div>
                    </div>
                  </>

                  {/* )} */}
                </div>
              </div>
            </div>
            <div className="col-md-1 d-flex justify-content-end">
              {/* <BsThreeDotsVertical /> */}
              <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
                {/* {item.status === "active" || item.status === "in_progress" ? ( */}
                <>
                  {(item?.status !== "no_status" ||
                    item?.type === "Calendly") && (
                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        data-bs-toggle="dropdown"
                        // aria-expanded="false"
                        aria-expanded={openDropdownId === item.id}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "0px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(item.id);
                        }}
                      >
                        <BiDotsVerticalRounded color="black" size={"25px"} />
                      </button>
                      <ul
                        className={`dropdown-menu ${
                          openDropdownId === item.id ? "show" : ""
                        }`}
                      >
                        {canManage(item) ? (
                          <>
                            {item?.status === "active" ||
                            item?.status === "in_progress" ||
                            item?.status === "to_finish" ||
                            item?.status === "todo" ? (
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    // Check if prise_de_notes is 'Automatic' before requesting microphone permission
                                    if (item?.prise_de_notes === "Automatic") {
                                      try {
                                        const stream =
                                          await navigator.mediaDevices.getUserMedia(
                                            { audio: true },
                                          );

                                        // Close the stream immediately after checking permissions (optional)
                                        // stream.getTracks().forEach(track => track.stop());

                                        // Proceed with the meeting
                                        if (item.status === "active") {
                                          handlePlay(item);
                                        } else {
                                          changeStatusAndPlay(item);
                                        }
                                      } catch (error) {
                                        // If microphone permission is denied, show the alert
                                        setShowAlert(true);
                                      }
                                    } else {
                                      // If not Automatic, proceed without checking for microphone permission
                                      if (item.status === "active") {
                                        handlePlay(item);
                                      } else {
                                        changeStatusAndPlay(item);
                                      }
                                    }
                                  }}
                                >
                                  <AiOutlinePlaySquare size={"20px"} />
                                  &nbsp;
                                  {t("dropdown.play")}
                                </a>
                              </li>
                            ) : null}

                            {(item?.status === "closed" ||
                              item?.status === "abort") && (
                              <>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentURL = `${window.location.origin}/destination/${item?.unique_id}/${item?.id}`;
                                      copy(currentURL);
                                      openLinkInNewTab(currentURL);
                                    }}
                                  >
                                    <MdInsertLink size={"20px"} /> &nbsp;
                                    {t("presentation.generateLink")}
                                  </a>
                                </li>
                                {item?.status === "closed" && (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      style={{ cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sendEmail(item);
                                      }}
                                    >
                                      <RiMailSendLine size={"20px"} /> &nbsp;
                                      {t("dropdown.Publish Report")}
                                    </a>
                                  </li>
                                )}
                              </>
                            )}

                            {(item?.status === "in_progress" ||
                              item?.status === "closed" ||
                              item?.status === "abort") && (
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangePrivacy(item);
                                  }}
                                >
                                  <RiEditBoxLine size={"20px"} /> &nbsp;
                                  {t("dropdown.change Privacy")}
                                </a>
                              </li>
                            )}
                            {item?.status === "active" ||
                              (item?.status === "todo" && (
                                <li>
                                  <a
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(item);
                                    }}
                                  >
                                    <RiEditBoxLine size={"20px"} /> &nbsp;
                                    {t("dropdown.To modify")}
                                  </a>
                                </li>
                              ))}
                            <li>
                              <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item);
                                }}
                              >
                                {item?.status === "closed" ||
                                item?.status === "abort" ? (
                                  <MdContentCopy size={"18px"} />
                                ) : (
                                  <IoCopyOutline size={"18px"} />
                                )}{" "}
                                &nbsp;
                                {t("dropdown.Duplicate")}
                              </a>
                            </li>
                            {item?.status !== "closed" &&
                              item?.status !== "abort" && (
                                <li>
                                  <a
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCallApi(true);

                                      const currentURL = `${window.location.origin}/destination/${item?.unique_id}/${item?.id}`;
                                      copy(currentURL);
                                      openLinkInNewTab(currentURL);
                                    }}
                                  >
                                    <LuLink size={"20px"} /> &nbsp;
                                    {t("dropdown.invitation")}
                                  </a>
                                </li>
                              )}

                            {parseInt(item?.user?.id) ===
                              parseInt(loggedInUserId) && (
                              <>
                                <hr
                                  style={{
                                    margin: "10px 0 0 0",
                                    padding: "2px",
                                  }}
                                />
                                {item?.status === "in_progress" ? (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }}
                                      // onClick={(e) => {
                                      //   e.stopPropagation();
                                      //   handleDelete(item.id);
                                      // }}
                                      // onClick={(e) => handleDeleteClick(e, item.id)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // updateMeetingStatus();
                                        setItem(item);
                                        setShowConfirmationCancelModal(true);

                                        // handleCancel(meeting.id);
                                      }}
                                    >
                                      <ImCancelCircle
                                        size={"20px"}
                                        color="red"
                                      />
                                      &nbsp; {t("dropdown.Cancel")}
                                    </a>
                                  </li>
                                ) : (
                                  <li>
                                    <a
                                      className="dropdown-item"
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }}
                                      // onClick={(e) => {
                                      //   e.stopPropagation();
                                      //   handleDelete(item.id);
                                      // }}
                                      onClick={(e) =>
                                        handleDeleteClick(e, item.id)
                                      }
                                    >
                                      <AiOutlineDelete
                                        size={"20px"}
                                        color="red"
                                      />
                                      &nbsp; {t("dropdown.Delete")}
                                    </a>
                                  </li>
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <li>
                              <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  updateCallApi(true);

                                  e.stopPropagation();
                                  const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }}
                              >
                                <LuLink size={"20px"} /> &nbsp;
                                {t("dropdown.reviewinvitation")}
                              </a>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </>
                {/* // ) : (
                //   <>
                //     <div>
                //       <IoEyeOutline
                //         size={"28px"}
                //         style={{ cursor: "pointer" }}
                //         title="Démarrer"
                //         onClick={() => viewDraft(item)}
                //       />
                //     </div>
                //     <div>
                //       <AiOutlineDelete
                //         size={"20px"}
                //         style={{ cursor: "pointer" }}
                //         // onClick={() => handleDelete(item?.id)}
                //         onClick={(e) => handleDeleteClick(e, item.id)}
                //       />
                //     </div>
                //   </>
                // )} */}
              </div>
            </div>
            </div>
          </div>
        </Card>,
      );
    });

    return meetingsMap;
  }, [allMeetings, allEventMeetings, userInfo, language, loggedInUserId]);

  const userID = CookieService.get("user_id");
  // const getUser = async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${CookieService.get("token")}`,
  //       },
  //     });
  //     if (response.status === 200) {
  //       setUser(response?.data?.data);
  //     }
  //   } catch (error) {
  //     // console.log(error?.message);
  //   }
  // };
  // useEffect(() => {
  //   getUser();
  // }, [callUser]);

  const loginGoogleAndSaveProfileData = async () => {
    await googleLoginAndSaveProfileScheduled();
  };
  // const loginZoomAndSaveProfileData = async () => {
  //   await zoomLoginAndSaveProfileScheduled();
  // };

  // Outlook integration Start

  const AUTHORIZATION_ENDPOINT =
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"; //For personal & work

  /* Generate a random string for the code verifier*/
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  /* Hash the code verifier using SHA-256 to create the code challenge */
  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setAuthCode(code);
      // setStatus("Authorization code received. Sending to backend...");

      // Retrieve code verifier from session storage
      const codeVerifier = CookieService.get("pkce_code_verifier");
      if (!codeVerifier) {
        // setStatus("Error: Code verifier not found.");
        return;
      }
    }
  }, [searchParams]);

  const openPopup = (url) => {
    const width = 600;
    const height = 630;

    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    return window.open(
      url,
      "MicrosoftOAuth",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  const handleOutlookLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    CookieService.set("pkce_code_verifier", codeVerifier);

    // Build OAuth URL with PKCE parameters
    const authUrl = `${AUTHORIZATION_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI,
    )}&scope=openid profile email offline_access&code_challenge=${codeChallenge}&code_challenge_method=S256&response_mode=query&state=12345`;

    // Open Microsoft Login in Popup
    const popup = openPopup(authUrl);

    // Check popup for authorization code
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        // setStatus("Popup closed before authentication.");
      }
      try {
        const url = popup.location.href;
        if (url.includes("?code=")) {
          const urlParams = new URLSearchParams(new URL(url).search);
          const authCode = urlParams.get("code");
          popup.close();
          clearInterval(checkPopup);
          // ✅ Exchange the auth code for access token
          exchangeAuthCodeForToken(authCode);
        }
      } catch (err) {
        // Cross-origin restriction, keep checking
      }
    }, 1000);
  };

  const exchangeAuthCodeForToken = async (authCode) => {
    const codeVerifier = CookieService.get("pkce_code_verifier"); // Get stored PKCE code verifier
    if (!codeVerifier) {
      console.error("Code verifier not found");
      return;
    }

    // setLoadingIntegraion(true)
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: REDIRECT_URI, // Must match the one in Azure
      code_verifier: codeVerifier, // Required for PKCE
    });

    try {
      const response = await fetch(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        },
      );

      const data = await response.json();
      if (data) {
        await handleAuthOutlook(data);
      }

      if (data.error) {
        console.error("Error getting token:", data.error_description);
        return;
      }
      // setLoadingIntegraion(false)

      // ✅ Store tokens in sessionStorage
      CookieService.set("access_token_outlook", data.access_token);
      CookieService.set("refresh_token_outlook", data.refresh_token);
      CookieService.set("expires_at", Date.now() + data.expires_in * 1000); // Store expiration time
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const handleAuthOutlook = async (data) => {
    try {
      // setLoadingIntegraion(true)
      const payload = {
        user_id: userID,
        token_type: data?.token_type,
        scope: data?.scope,
        expires_in: data?.expires_in,
        ext_expires_in: data?.ext_expires_in,
        access_token: data?.access_token,
        refresh_token: data?.refresh_token,
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/outlook`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status === 200) {
        const userEmail = response?.data?.data?.email;
        const userName = response?.data?.data?.full_name;
        setOutlookEmail(userEmail);
        setOutlookName(userName);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // setLoadingIntegraion(false)

      // navigate("/");
    } catch (error) {
      toast.error(t(`profile.${error?.response?.data?.message}`));
      console.log("Error:", error);
      // setLoadingIntegraion(false)
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = CookieService.get("refresh_token_outlook");
    if (!refreshToken) {
      console.error("No refresh token found, user needs to log in again.");
      return;
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        },
      );

      const data = await response.json();
      if (data.error) {
        console.error("Error refreshing token:", data.error_description);
        return;
      }

      // ✅ Store new tokens
      CookieService.set("access_token_outlook", data.access_token);
      CookieService.set("refresh_token_outlook", data.refresh_token); // Update with new refresh token
      CookieService.set("expires_at", Date.now() + data.expires_in * 1000); // Update expiration time
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const checkTokenExpiration = () => {
    const expiresAt = CookieService.get("expires_at");
    if (!expiresAt) return;

    const timeRemaining = expiresAt - Date.now();

    if (timeRemaining < 60000) {
      // Refresh if less than 1 minute remaining
      console.log("Refreshing access token...");
      refreshAccessToken();
    }
  };

  // Check every 5 minutes
  setInterval(checkTokenExpiration, 5 * 60 * 1000);

  // Outlook Integration End

  const renderListView = () => {
    if (allMeetings?.length === 0) return <NoContent title="Current Meetings" />;
    return (
      <div className="list-view-container" style={{
        background: '#ffffff',
        borderRadius: '14px',
        overflow: 'visible',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <style>
          {`
            .list-view-grid {
              display: grid;
              grid-template-columns: 45px 55px 1fr 1fr 180px 180px 100px;
              gap: 16px;
              padding: 14px 24px;
              align-items: center;
            }
            @media (max-width: 1600px) {
              .list-view-grid {
                grid-template-columns: 45px 55px 1fr 1fr 150px 150px 100px;
              }
            }
            @media (max-width: 1400px) {
              .list-view-grid {
                grid-template-columns: 45px 55px 1fr 1fr 140px 100px;
              }
              .col-audio { display: none; }
            }
            @media (max-width: 1200px) {
              .list-view-grid {
                grid-template-columns: 45px 55px 1fr 130px 100px;
              }
              .col-mission, .col-audio { display: none; }
            }
            @media (max-width: 768px) {
              .list-view-grid-desktop {
                display: none !important;
              }
              .list-view-row {
                background: #ffffff;
                border-radius: 16px !important;
                padding: 14px !important;
                margin-bottom: 12px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
                border: 1px solid #f1f5f9 !important;
                display: flex !important;
                flex-direction: column;
                gap: 10px;
                position: relative;
              }
              
              .mobile-card-top {
                display: flex;
                align-items: start;
                gap: 12px;
                width: 100%;
              }

              .mobile-index-badge {
                position: absolute;
                top: -8px;
                left: -8px;
                background: #64748b;
                color: #fff;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 700;
                border: 2px solid #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }

              .mobile-card-details {
                display: flex;
                flex-direction: column;
                gap: 10px; /* Increased spacing */
                padding-top: 14px;
                border-top: 1px dashed #f1f5f9;
              }
              .mobile-detail-item {
                display: flex;
                align-items: flex-start;
                gap: 12px; /* Improved gap */
                font-size: 12px;
              }
              .mobile-detail-icon {
                font-size: 15px;
                color: #94a3b8;
                width: 18px;
                padding-top: 1px;
                display: flex;
                justify-content: center;
              }
              .mobile-detail-text {
                color: #475569;
                font-weight: 500;
                flex: 1;
                line-height: 1.4;
              }
              .mobile-detail-label {
                font-size: 10px;
                color: #94a3b8;
                font-weight: 600;
                text-transform: uppercase;
                margin-right: 4px;
              }
            }
            
            /* Hide mobile elements on desktop */
            @media (min-width: 769px) {
              .mobile-only { display: none !important; }
            }
            @media (max-width: 768px) {
               .desktop-only { display: none !important; }
            }
            @media (max-width: 480px) {
               .list-view-grid {
                 gap: 2px 10px !important;
               }
               .col-actions {
                 gap: 4px !important;
               }
            }
            .meeting-grid-action-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 34px;
              height: 34px;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
              background: #fff;
              color: #475569;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
              padding: 0;
            }
            .meeting-grid-action-btn:hover {
              background: #f1f5f9;
              color: #2563eb;
              border-color: #cbd5e1;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .meeting-grid-action-btn svg {
              font-size: 18px;
            }
            .col-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 48px;
            }

            /* Responsive Card View Styles */
            @media (max-width: 768px) {
              .list-view-row.list-view-grid {
                display: block !important;
                padding: 0 !important;
                margin-bottom: 12px !important;
                border-radius: 20px !important;
                background: #fff !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.06) !important;
                border: 1px solid #f1f5f9 !important;
                overflow: visible !important;
              }
              /* ── Spotify-style list card ── */
              .premium-mobile-card {
                padding: 16px 16px 12px;
                position: relative;
                border-bottom: 1px solid #f1f5f9;
              }
              .smc-top {
                display: flex;
                gap: 14px;
                align-items: flex-start;
              }
              .smc-thumb {
                flex-shrink: 0;
                width: 68px;
                height: 68px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
              .smc-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .smc-initials {
                font-size: 22px;
                font-weight: 900;
                letter-spacing: -1px;
              }
              .smc-body {
                flex: 1;
                min-width: 0;
              }
              .smc-title {
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.35;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: 4px;
              }
              .smc-desc {
                font-size: 12px;
                color: #64748b;
                line-height: 1.45;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: 5px;
              }
              .smc-meta {
                font-size: 11.5px;
                color: #94a3b8;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .smc-badge {
                display: inline-block;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 7px;
                border-radius: 5px;
                margin-left: 6px;
                vertical-align: middle;
              }
              .smc-badge.progress { background: #fffbeb; color: #d97706; }
              .smc-badge.late     { background: #fef2f2; color: #ef4444; }
              .smc-badge.future   { background: #f0fdf4; color: #16a34a; }
              .smc-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 12px;
                padding-left: 82px; /* align with body text (thumb 68 + gap 14) */
              }
              .smc-icon-group {
                display: flex;
                align-items: center;
                gap: 4px;
              }
              .smc-icon-btn {
                background: transparent;
                border: none;
                color: #94a3b8;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.15s, background 0.15s;
              }
              .smc-icon-btn:active { background: #f1f5f9; color: #475569; }
              .smc-play-btn {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: #0f172a;
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex-shrink: 0;
                transition: transform 0.15s, background 0.15s;
              }
              .smc-play-btn:active { transform: scale(0.93); }
              .smc-play-btn.inprogress { background: #f59e0b; }
              .mobile-dropdown-menu {
                border-radius: 16px !important;
                padding: 10px !important;
                box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
                border: 1px solid #f1f5f9 !important;
                margin-top: 8px !important;
              }
              .mobile-dropdown-menu .dropdown-item {
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
              }
              .mobile-dropdown-menu .dropdown-divider {
                margin: 8px 0;
                opacity: 0.5;
              }
              .ps-2 { padding-left: 0 !important; }
            }
          `}</style>

        {/* Header */}
        <div className="list-view-header list-view-grid list-view-grid-desktop" style={{
          borderBottom: '1px solid #f1f5f9',
          color: '#64748b',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: '#f8fafc',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          textAlign: 'left'
        }}>
          <span style={{ width: '40px' }}>#</span>
          <span className="col-logo"></span>
          <span className="ps-2">{t("meeting.activeMeetings.title")}</span>
          <span className="col-mission text-start">{t("meeting.activeMeetings.destinations")}</span>
          <span className="col-date text-start">{t("meeting.activeMeetings.niche")}</span>
          <span className="col-audio text-start">Audio</span>
          <span className="col-actions text-start ps-4">{t("meeting.activeMeetings.actions")}</span>
        </div>

        {/* Rows */}
        {allMeetings.map((item, idx) => {
          const loggedInUserId = CookieService.get("user_id");
          const sessionEmail = CookieService.get("user") ? JSON.parse(CookieService.get("user"))?.email : null;
          const logo = item?.destination?.clients?.client_logo
            || item?.solution?.logo
            || item?.destination?.logo;
          const isGoogle = item?.created_from === "Google Calendar" || item?.type === "Google Agenda Event";
          const isOutlook = item?.created_from === "Outlook Calendar" || item?.type === "Outlook Agenda Event";
          
          const isCreator = parseInt(item?.user?.id) === parseInt(loggedInUserId) ||
            (item?.event_organizer && item?.event_organizer?.email === sessionEmail) ||
            (item?.user?.email === sessionEmail);
          const isGuide = item?.guides?.some(g => parseInt(g.id) === parseInt(loggedInUserId) || g?.email === sessionEmail);
          const canManage = isCreator || isGuide;

          const solutionTitle = item?.solution
            ? item?.solution?.title
            : isGoogle ? "Google"
            : isOutlook ? "Outlook"
            : item?.type === "Special" ? "Media"
            : item?.type || "Réunion";
          const initials = (item?.objective || item?.title || "M").substring(0, 2).toUpperCase();
          const hasAudio = !!item?.voice_notes;

          const missionLogo = item?.solution?.logo || item?.destination?.logo;
          const missionTitle = item?.objective || (isGoogle ? "Google" : isOutlook ? "Outlook" : "—");

          // format start date/time
          const formattedDate = convertDateToUserTimezone(
            item?.date,
            item?.starts_at || item?.start_time,
            item?.timezone,
          );
          const startTime = convertTo12HourFormat(
            item?.starts_at || item?.start_time,
            item?.date,
            item?.steps,
            item?.timezone,
          );
          const endTime = item?.status === "abort" && item?.abort_end_time
            ? `${abortMeetingTime(item?.abort_end_time, "DD/MM/yyyy", item?.timezone)} ${abortMeetingTime(item?.abort_end_time, "HH[h]mm", item?.timezone)}`
            : (() => {
                const endDatePart = formatStepDate(item?.estimate_time?.split("T")[0], item?.estimate_time?.split("T")[1], item?.timezone);
                const endTimePart = convertTo12HourFormat(item?.estimate_time?.split("T")[1], item?.estimate_time?.split("T")[0], item?.steps, item?.timezone);
                return `${endDatePart} ${endTimePart || ""}`;
              })();

          const isLast = idx === allMeetings.length - 1;

          return (
            <div key={item.id} ref={isLast ? lastMeetingRef : null} className="list-view-row list-view-grid list-view-grid-desktop" style={{ 
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => {
              const route = (item?.status === 'closed' || item?.status === 'abort') 
                ? `/present/invite/${item?.id}` 
                : `/invite/${item?.id}`;
              navigate(route);
            }}>
              {/* Mobile View – Spotify-style list card */}
              <div className="mobile-only premium-mobile-card">
                <div className="smc-top">
                  {/* Thumbnail */}
                  <div className="smc-thumb" style={{ background: isGoogle ? '#fde6e9' : isOutlook ? '#e0e7ff' : '#f1f5f9' }}>
                    {logo ? (
                      <img src={logo.startsWith('http') ? logo : `${Assets_URL}/${logo}`} alt="logo" />
                    ) : (
                      <span className="smc-initials" style={{ color: isGoogle ? '#ef4444' : isOutlook ? '#3b82f6' : '#64748b' }}>{initials}</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="smc-body">
                    <div className="smc-title">
                      {item.title}
                      {item?.status === 'active' && (
                        <span className={`smc-badge ${moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? "late" : "future"}`}>
                          {moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? t("badge.late") : t("badge.future")}
                        </span>
                      )}
                      {item?.status === 'in_progress' && <span className="smc-badge progress">{t("badge.inprogress")}</span>}
                      {item?.status === 'closed' && <span className="smc-badge finished">{t("badge.finished")}</span>}
                      {item?.status === 'abort' && <span className="smc-badge cancelled">{t("badge.cancel")}</span>}
                      {item?.status === 'todo' && <span className="smc-badge draft">{t("badge.todo")}</span>}
                    </div>
                    <div className="smc-desc">{missionTitle || solutionTitle}</div>
                    <div className="smc-meta">{formattedDate}{startTime ? ` • ${startTime}` : ''}{endTime ? ` → ${endTime}` : ''}</div>
                  </div>
                </div>

                {/* Bottom action row */}
                <div className="smc-actions" onClick={e => e.stopPropagation()}>
                  <div className="smc-icon-group">
                    {/* Copy link */}
                    <button className="smc-icon-btn" title="Copier le lien" onClick={() => { copy(`${window.location.origin}/destination/${item?.unique_id}/${item?.id}`); toast.success(t("linkCopiedToast")); }}>
                      <MdInsertLink size="20px" />
                    </button>
                    {/* Duplicate */}
                    {canManage && (
                      <button className="smc-icon-btn" title={t("dropdown.Duplicate")} onClick={() => handleCopy(item)}>
                        <MdContentCopy size="18px" />
                      </button>
                    )}
                    {/* More (kebab) */}
                    <div className="dropdown">
                      <button className="smc-icon-btn" type="button" onClick={(e) => { e.stopPropagation(); toggleDropdown(item.id); }}>
                        <BiDotsVerticalRounded size="20px" />
                      </button>
                      <ul className={`dropdown-menu dropdown-menu-end mobile-dropdown-menu ${openDropdownId === item.id ? 'show' : ''}`}>
                        {canManage && item.status !== "in_progress" && (
                          <li><a className="dropdown-item d-flex align-items-center gap-2 py-3" onClick={() => handleShow(item.id)}><RiEditBoxLine size="19px" /> {t("dropdown.Modify")}</a></li>
                        )}
                        <div className="dropdown-divider"></div>
                        {canManage && (
                          <li><a className="dropdown-item d-flex align-items-center gap-2 py-3 text-danger" onClick={(e) => handleDeleteClick(e, item.id)}><AiOutlineDelete size="19px" /> {t("dropdown.Delete")}</a></li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Play / View / Audio button */}
                  {item?.status === 'active' ? (
                    <button
                      className="smc-play-btn"
                      style={{ background: startingId === item?.id ? '#94a3b8' : '#2563eb' }}
                      disabled={startingId === item?.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setStartingId(item?.id);
                        await startMeetingDirectly(item, navigate, t);
                        setStartingId(null);
                      }}
                    >
                      {startingId === item?.id
                        ? <span className="spinner-border spinner-border-sm" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                        : <IoPlayOutline size="20px" />}
                    </button>
                  ) : (item?.status === 'in_progress' || item?.status === 'to_finish') ? (
                    <button
                      className="smc-play-btn inprogress"
                      onClick={(e) => { e.stopPropagation(); navigate(`/destination/${item?.unique_id}/${item?.id}`); }}
                    >
                      <IoEyeOutline size="20px" />
                    </button>
                  ) : (item?.status === 'closed' || item?.status === 'abort') && item?.voice_notes ? (
                    <button
                      className="smc-play-btn"
                      style={{ background: audioPreviewId === item?.id ? '#7c3aed' : '#0f172a' }}
                      onClick={(e) => { e.stopPropagation(); setAudioPreviewId(audioPreviewId === item?.id ? null : item?.id); }}
                    >
                      <IoVolumeHighOutline size="20px" />
                    </button>
                  ) : (
                    <button
                      className="smc-play-btn"
                      style={{ background: '#64748b' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/destination/${item?.unique_id}/${item?.id}`); }}
                    >
                      <RiFileChartLine size="20px" />
                    </button>
                  )}
                </div>
                {audioPreviewId === item?.id && item?.voice_notes && (
                  <div style={{ padding: '0 16px 12px', marginTop: '-4px' }} onClick={e => e.stopPropagation()}>
                    <audio controls autoPlay src={item.voice_notes} style={{ width: '100%', height: '36px', borderRadius: '8px', accentColor: '#7c3aed' }} />
                  </div>
                )}
              </div>

              {/* Desktop View Columns (Visible only on desktop) */}
              <span className="desktop-only col-index" style={{ fontSize: '12px', color: '#94a3b8', width: '40px' }}>{idx + 1}</span>
              <div className="desktop-only col-logo">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: isGoogle ? '#fde6e9' : isOutlook ? '#e0e7ff' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: isGoogle ? '#ef4444' : isOutlook ? '#3b82f6' : '#64748b',
                  overflow: 'hidden'
                }}>
                  {logo ? <img src={logo.startsWith('http') ? logo : `${Assets_URL}/${logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
              </div>
              <div className="desktop-only ps-2" style={{ minWidth: 0 }}>
                <div className="text-secondary mb-1" style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, textTransform: 'uppercase' }}>{solutionTitle}</div>
                <div className="fw-bold text-dark" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                  {item?.status === 'active' && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? '#ffe2e6' : '#c9f7f5', color: moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? '#f64e60' : '#1bc5bd' }}>
                      {moment().isAfter(moment(`${item.date} ${item.start_time}`, "YYYY-MM-DD HH:mm")) ? t("badge.late") : t("badge.future")}
                    </span>
                  )}
                  {item?.status === 'in_progress' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#f2db43', color: '#ffffff', padding: '2px 8px', borderRadius: '999px' }}>{t("badge.inprogress")}</span>}
                  {item?.status === 'closed' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '999px' }}>{t("badge.finished")}</span>}
                  {(item?.status === 'abort' || item?.status === "cancelled") && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ffe2e6', color: '#f64e60', padding: '2px 8px', borderRadius: '999px' }}>{t("badge.cancel")}</span>}
                  {item?.status === 'todo' && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgb(228 228 233)', color: 'gray', padding: '2px 8px', borderRadius: '999px' }}>{t("badge.todo")}</span>}
                </div>
              </div>
              <div className="desktop-only col-mission" style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{missionTitle}</div>
              <div className="desktop-only col-date" style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>
                <div>{formattedDate}{startTime ? ` à ${startTime}` : ''}</div>
                <div style={{ color: '#94a3b8' }}>→ {endTime}</div>
              </div>
              <div className="desktop-only col-audio" onClick={e => e.stopPropagation()}>
                {hasAudio ? <audio controls src={item.voice_notes} style={{ height: '32px', width: '200px' }} /> : <span style={{ color: '#e2e8f0' }}>—</span>}
              </div>
              <div className="desktop-only col-actions d-flex align-items-center justify-content-end gap-2" onClick={e => e.stopPropagation()}>
                <Tooltip title={item?.status === 'active' ? t("buttons.Start moment") : t("dropdown.reviewinvitation")} placement="top">
                  <button className="meeting-grid-action-btn" style={item?.status === 'active' ? { background: '#2563eb', color: '#fff', borderColor: '#2563eb' } : {}} onClick={async (e) => {
                    e.stopPropagation();
                    if (item?.status === 'active') { setStartingId(item?.id); await startMeetingDirectly(item, navigate, t); setStartingId(null); }
                    else { openLinkInNewTab(`/destination/${item?.unique_id}/${item?.id}`); }
                  }} disabled={startingId === item?.id}>
                    {startingId === item?.id ? <Spinner animation="border" size="sm" variant="light" /> : (item?.status === 'active' ? <IoPlayOutline /> : (item?.status === 'closed' ? <RiFileChartLine /> : <IoEyeOutline />))}
                  </button>
                </Tooltip>
                <div className="dropdown">
                  <button className="meeting-grid-action-btn" type="button" onClick={(e) => { e.stopPropagation(); toggleDropdown(item.id); }}>
                    <BiDotsVerticalRounded />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end ${openDropdownId === item.id ? 'show' : ''}`} style={{ minWidth: '180px', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'absolute', right: 0, left: 'auto' }}>
                    {canManage ? (
                      <>
                        {item.status !== "in_progress" && <li><a className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => handleShow(item.id)}><RiEditBoxLine size="18px" /> {t("dropdown.Modify")}</a></li>}
                        <li><a className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={(e) => handleDeleteClick(e, item.id)}><AiOutlineDelete size="18px" /> {t("dropdown.Delete")}</a></li>
                      </>
                    ) : <li><a className="dropdown-item pointer" onClick={() => { copy(`${window.location.origin}/destination/${item?.unique_id}/${item?.id}`); toast.success(t("linkCopiedToast")); }}><RiPresentationFill size="18px" /> {t("presentation.generateLink")}</a></li>}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {/* Spinner for loading next page */}
        {isLoadingMore && hasMore && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" style={{ color: '#3b82f6' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="scheduled">
        <div className="my-2 container-fluid p-0">
          {showAlert && (
            <div className="confirmation-modal">
              <div className="confirmation-modal-content">
                <p>
                  {t(
                    "Microphone access denied. Please allow microphone access from browser setting to continue.",
                  )}
                </p>
                <button className="btn-no" onClick={closeAlert}>
                  {t("confirmationModal.close")}
                </button>
              </div>
            </div>
          )}

          {/* Global mobile card styles (shared by card-view & list-view) */}
          <style>{`
            @media (max-width: 768px) {
              .premium-mobile-card { padding: 16px 16px 12px; position: relative; border-bottom: 1px solid #f1f5f9; }
              .smc-top { display: flex; gap: 14px; align-items: flex-start; }
              .smc-thumb { flex-shrink: 0; width: 68px; height: 68px; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
              .smc-thumb img { width: 100%; height: 100%; object-fit: cover; }
              .smc-initials { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
              .smc-body { flex: 1; min-width: 0; }
              .smc-title { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 4px; }
              .smc-desc { font-size: 12px; color: #64748b; line-height: 1.45; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 5px; }
              .smc-meta { font-size: 11.5px; color: #94a3b8; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              .smc-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 5px; margin-left: 6px; vertical-align: middle; }
              .smc-badge.progress  { background: #f2db43; color: #ffffff; }
              .smc-badge.late      { background: #ffe2e6; color: #f64e60; }
              .smc-badge.future    { background: #c9f7f5; color: #1bc5bd; }
              .smc-badge.finished  { background: #dcfce7; color: #16a34a; }
              .smc-badge.cancelled { background: #ffe2e6; color: #f64e60; }
              .smc-badge.draft     { background: rgb(228, 228, 233); color: gray; }
              .smc-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-left: 82px; }
              .smc-icon-group { display: flex; align-items: center; gap: 4px; }
              .smc-icon-btn { background: transparent; border: none; color: #94a3b8; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: color 0.15s, background 0.15s; }
              .smc-icon-btn:active { background: #f1f5f9; color: #475569; }
              .smc-play-btn { width: 44px; height: 44px; border-radius: 50%; background: #0f172a; border: none; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; transition: transform 0.15s, background 0.15s; }
              .smc-play-btn:active { transform: scale(0.93); }
              .smc-play-btn.inprogress { background: #f59e0b; }
              .mobile-dropdown-menu { border-radius: 16px !important; padding: 10px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important; border: 1px solid #f1f5f9 !important; margin-top: 8px !important; }
              .mobile-dropdown-menu .dropdown-item { border-radius: 10px; font-size: 14px; font-weight: 600; }
              .mobile-dropdown-menu .dropdown-divider { margin: 8px 0; opacity: 0.5; }
            }
            @media (min-width: 769px) { .mobile-only { display: none !important; } }
          `}</style>
          {loading ? (
            <div
              className="progress-overlay"
              style={{ background: "transparent", zIndex: "99" }}
            >
              <div style={{ width: "50%" }}>
                <ProgressBar now={progress} animated />
              </div>
            </div>
          ) : viewMode === "list" ? (
            renderListView()
          ) : (
            <>
              {allMeetings?.length === 0 ? (
                <NoContent title="Combine Meetings" />
              ) : (
                <>
                  {Object.entries(meetingsByMonth).map(
                    ([month, meetings]) => (
                      <React.Fragment key={month}>
                        <span className="month">{month}</span>
                        {meetings.map((meeting, index) => {
                          const isLast =
                            index === meetings.length - 1 &&
                            month ===
                              Object.keys(meetingsByMonth)[
                                Object.keys(meetingsByMonth).length - 1
                              ];

                          return (
                            <div
                              key={index}
                              ref={isLast ? lastMeetingRef : null}
                            >
                              {meeting}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ),
                  )}

                  {/* Loading Spinner */}
                  <div className="text-center my-4">
                    {isLoadingMore && hasMore && (
                      <Spinner animation="border" role="status" />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {showConfirmationModal && (
          <ConfirmationModal
            message={t("meetingDeletedToast")}
            onConfirm={(e) => confirmDelete(e)}
            onCancel={(e) => {
              e.stopPropagation();
              setShowConfirmationModal(false);
            }}
          />
        )}
        {showConfirmationCancelModal && (
          <ConfirmationModal
            message={t("confirmation")}
            onConfirm={(e) => updateMeetingStatus(e)}
            onCancel={(e) => {
              e.stopPropagation();
              setShowConfirmationCancelModal(false);
            }}
          />
        )}
        {visoModal && (
          <ConfirmationModal
            message={t("Do you want to open the visioconference in a new tab?")}
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />
        )}
        {open && (
          <>
            <NewMeetingModal open={open} closeModal={handleCloseModal} />
          </>
        )}
      </div>
    </>
  );
};

export default ScheduledMeeting;
