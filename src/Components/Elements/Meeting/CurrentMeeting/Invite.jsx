import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Form,
  Modal,
  Nav,
  ProgressBar,
  Spinner,
  Tab,
} from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import ParticipantCard from "./components/ParticipantCard";
import StepCard from "./components/StepCard";
import StepFile from "./components/StepFile";
import HostCard from "./components/HostCard";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaArrowRight } from "react-icons/fa6";
import { RiEditBoxLine } from "react-icons/ri";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { IoArrowBackSharp, IoCopyOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import moment from "moment";
import { ImCancelCircle } from "react-icons/im";
import { LuLink } from "react-icons/lu";
import copy from "copy-to-clipboard";
import { openLinkInNewTab } from "../../../Utils/openLinkInNewTab";
import { useSteps } from "../../../../context/Step";
import { FaChartGantt } from "react-icons/fa6";
import { FaList, FaRegCheckSquare, FaSyncAlt } from "react-icons/fa";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import {
  convertTimeTakenToSeconds,
  markTodoMeeting,
} from "../../../Utils/MeetingFunctions";
import { useMeetings } from "../../../../context/MeetingsContext";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import NewMeetingModal from "../CreateNewMeeting/NewMeetingModal";
import StepChart from "../CreateNewMeeting/StepChart";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { Avatar, Tooltip } from "antd";
import FileUploadModal from "../CreateNewMeeting/FileUploadModal";
import ViewFilePreview from "../ViewFilePreview";

import {
  formatTime,
  formatDate,
  parseAndFormatDateTime,
  calculateEndDate,
  calculateTotalTime,
  convertCount2ToSeconds,
  handleCopy,
  convertDateToUserTimezone,
  timezoneSymbols,
  calculateTotalTimeMeeting,
  convertTo12HourFormatMeeting,
} from "../GetMeeting/Helpers/functionHelper";
import { updateMeetingStatus } from "../GetMeeting/Helpers/apiHelper";
import SubscriberCard from "./components/SubscriberCard";
import { useDestinations } from "../../../../context/DestinationsContext";
import { Editor } from "@tinymce/tinymce-react";
import MeetingDiscussion from "./components/MeetingDiscussion";
import { FcGoogle } from "react-icons/fc";
import { SiMicrosoftoutlook, SiMicrosoftteams } from "react-icons/si";
import GuidesCard from "./components/GuidesCard";
import KanbanBoard from "./components/KanbanBoard";
import QuickMomentForm from "../../Invities/DestinationToMeeting/QuickMomentForm";

const Invite = () => {
  const APIKEY = process.env.REACT_APP_TINYMCE_API;

  const location = useLocation();
  const navigate = useNavigate();
  const { getUserMeetingCount } = useDestinations();
  //I have a state in useMeeting context that will check wheather i have to call an api or not... if the callApi is true then call then i pass a parameter in the getMeetingById which is in CounterContext if callApi state is true then pass the parameter otherwise i have a button in Invite component and in that button function i explicitly set the callAPi to false when i am starting a meeting first time in that case i don't pass that parameter in getMeetingById API....
  const { setStatus, setOffset, setCallApi, setFromTektime } = useMeetings();
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;
  const {
    handleShow,
    open,
    setOpen,
    setMeeting: setMeetingContext,
    setIsDuplicate,
    setIsUpdated,
    setCheckId,
    setAddParticipant,
    setChangePrivacy,
    setChangeContext,
    setChangeOptions,
    call,
    setFormState,
    handleCloseModal,
  } = useFormContext();

  const { id } = useParams();
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("casting");
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { steps, updateSteps } = useSteps();
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [estimateTime, setEstimateTime] = useState(null);
  console.log("estimate_time", estimateTime);
  const [estimateDate, setEstimateDate] = useState(null);
  const [isDrop, setIsDrop] = useState(false);
  const [isDropFile, setIsDropFile] = useState(false);
  const [view, setView] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPlayConfirmationModal, setShowPlayConfirmationModal] =
    useState(false);
  const [showConfirmationCancelModal, setShowConfirmationCancelModal] =
    useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [open1, setOpen1] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showQuickMomentForm, setShowQuickMomentForm] = useState(false);
  const hasOpenedQuickFormRef = useRef(false);

  useEffect(() => {
    if (meeting?.status === "draft" && meeting.created_from_whatsapp && !hasOpenedQuickFormRef.current) {
      hasOpenedQuickFormRef.current = true;
      setShowQuickMomentForm(true);
    }
  }, [meeting]);

  const openModal = (file) => {
    setModalContent(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleFileChange = (event) => {
    event.target.value = "";
  };

  //For Discussion

  const [meetingMessages, setMeetingMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getMeetingMessages = async () => {
    if (refreshing) return; // Prevent double click

    setRefreshing(true); // ← Start loading

    try {
      const response = await axios.get(
        `${API_BASE_URL}/meeting/${id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status === 200) {
        const data = response?.data?.data;
        const sortedMessages = [...(data || [])].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
        setMeetingMessages(sortedMessages);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (id && activeTab === "discussion") getMeetingMessages();
  }, [id, activeTab]);

  const refreshMessages = async () => {
    getMeetingMessages();
  };

  //For Steps
  const [meetingSteps, setMeetingSteps] = useState([]);
  const [stepProgress, setStepProgress] = useState(0);
  const [showStepProgressBar, setShowStepProgressBar] = useState(false);

  const getMeetingSteps = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const userId = parseInt(CookieService.get("user_id"));
    // setLoading(true);
    setStepProgress(0); // Reset progress to 0 at the start
    setShowStepProgressBar(true); // Show the progress bar
    // Start a progress simulation
    const interval = setInterval(() => {
      setStepProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms

    try {
      const response = await axios.get(
        `${API_BASE_URL}/meeting/${id}/steps?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.data;
        const meetingData = response?.data;

        // Update meeting state to include steps
        setMeeting((prevMeeting) => ({
          ...prevMeeting,
          estimate_time: meetingData?.meeting_estimate_time,
          status: meetingData?.meeting_status,
          date: meetingData?.meeting_date,
          start_time: meetingData?.meeting_start_time,
          steps: data,
        }));

        const { formattedDate: estimateDate, formattedTime: estimateTime } =
          parseAndFormatDateTime(
            meetingData?.meeting_estimate_time,
            meetingData?.meeting_type,
            meetingData?.meeting_timezone || "Europe/Paris",
          );
        setEstimateTime(estimateTime);
        setEstimateDate(estimateDate);

        setMeetingSteps(data);
        setStepProgress(100); // Set progress to 100% upon completion
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      clearInterval(interval); // Clear the interval when done
      setStepProgress(100); // Set progress to 100% upon completion
      setShowStepProgressBar(false); // Hide the progress bar
    }
  };
  useEffect(() => {
    if (id && activeTab === "steps") {
      getMeetingSteps();
    }
  }, [id, activeTab]);

  const refreshSteps = async () => {
    getMeetingSteps();
    getMeeting();
  };
  //For Files
  const [meetingFiles, setMeetingFiles] = useState([]);

  const getMeetingFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/meeting/${id}/files`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response?.status === 200) {
        const data = response?.data?.data;
        setMeetingFiles(data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const refreshFiles = async () => {
    getMeetingFiles();
    getMeeting();
  };
  useEffect(() => {
    if (id && activeTab === "files") {
      getMeetingFiles();
    }
  }, [id, activeTab]);
  const getRefreshMeeting = async () => {
    // if (activeTab === "casting") {
    getMeeting();
    // } else if (activeTab === "steps") {
    getMeetingSteps();
    // }
  };

  const [count, setCount] = useState(null);
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState("");
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/^```markdown\s*/, "")
      .replace(/```$/, "")
      .replace(/---/g, "");
  };

  const isMarkdownContent = (text) => {
    if (!text) return false;
    // Check for explicit markers or patterns
    if (text.trim().startsWith("```markdown")) return true;
    if (text.includes("---")) return true;

    // Check for common Markdown syntax while avoiding common HTML
    const markdownPatterns = [
      /^#{1,6}\s/m, // Headers
      /^\s*[-*+]\s/m, // Unordered lists
      /^\s*\d+\.\s/m, // Ordered lists
      /\*\*[^*]+\*\*/, // Bold
      /\[[^\]]+\]\([^)]+\)/, // Links
    ];

    const hasMarkdown = markdownPatterns.some((pattern) => pattern.test(text));
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);

    return hasMarkdown && !hasHtml;
  };

  // Main function
  const getMeeting = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const userId = parseInt(CookieService.get("user_id"));

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/meeting/${id}/casting?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
      );

      if (response.status) {
        const data = response?.data?.data;
        setCount(response?.data);
        setStatus(data?.status);

        // const steps = data?.steps;
        // updateSteps(steps);
   if (data?.status === "in_progress") {
          setActiveTab("steps");
        }
        setMeeting(data);
        // ✅ Redirect if status is "closed"
        if (data?.status === "closed") {
          navigate(`/present/invite/${id}`, { state: { from: "meeting" } });
          return; // stop further execution
        }

        const { formattedDate: estimateDate, formattedTime: estimateTime } =
          parseAndFormatDateTime(
            data?.estimate_time,
            data?.type,
            data?.timezone,
          );
        setEstimateTime(estimateTime);
        setEstimateDate(estimateDate);
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);

      if (error.response && error.response.status === 404) {
        setVisibilityMessage(error?.response?.data?.error);
        setIsPrivacyModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMeeting();
    setOffset(0);
  }, [id]);

  useEffect(() => {
    getRefreshMeeting();
  }, [call]);

  const forNavigate = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const userId = parseInt(CookieService.get("user_id"));

    try {
      const response = await axios.get(
        `${API_BASE_URL}/meeting/${id}/casting?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
      );

      if (response.status) {
        const { data } = response;
        if (data?.data?.status === "closed") {
          navigate(`/present/invite/${id}`, { state: { from: "meeting" } });
        }
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);
    }
  };
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" ||
        document.visibilityState === "hidden"
      ) {
        console.log("Page is visible!");
        forNavigate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  //Call this API every 5 sec to update the time interval
  const callMeetingApiForTimeTaken = async () => {
    if (meeting?.status !== "in_progress") {
      return;
    }

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const userId = parseInt(CookieService.get("user_id"));

      const response = await axios.get(
        `${API_BASE_URL}/meeting/${id}/steps?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
      );

      if (response.status) {
        const data = response?.data?.data;
        const meetingData = response?.data;
        setMeetingSteps(data);
        setMeeting((prevMeeting) => ({
          ...prevMeeting,
          estimate_time: meetingData?.meeting_estimate_time,
          status: meetingData?.meeting_status,
          date: meetingData?.meeting_date,
          start_time: meetingData?.meeting_start_time,
          steps: data,
        }));

        const { formattedDate: estimateDate, formattedTime: estimateTime } =
          parseAndFormatDateTime(
            meetingData?.meeting_estimate_time,
            meeting?.type,
            meeting?.timezone,
          );
        setEstimateTime(estimateTime);
        setEstimateDate(estimateDate);
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);
    }
  };

  useEffect(() => {
    if (meeting?.status === "in_progress") {
      const intervalId = setInterval(callMeetingApiForTimeTaken, 30000); // 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [meeting, id]);

  //WITH TIMEZONE CONVERSION
  const formattedDate = convertDateToUserTimezone(
    meeting?.date,
    meeting?.start_time,
    meeting?.timezone,
  );

  const startTime = meeting?.start_time;
  const formattedTime = new Date(`1970-01-01T${startTime}`).toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: true },
  );

  const loggedInUserId =
    CookieService.get("user_id") || CookieService.get("user_id");

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

    if (selectedItem?.status === "in_progress") {
      continueChangeStatusAndPlay(selectedItem);
    } else {
      continueHandlePlay(selectedItem);
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
  const updateFromTektime = (value) => {
    setFromTektime(value);
    CookieService.set("fromTektime", value);
  };
  const [meetingToPlay, setMeetingToPlay] = useState(null);

  const [workingHours, setWorkingHours] = useState([]);
  useEffect(() => {
    if (meeting) {
      const getWorkingHours = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/user-scheduled-days/${loggedInUserId}/${meeting?.destination?.id}`,
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
  }, [meeting]);
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

  // Check if CURRENT time is outside working hours
  const isOutsideWorkingHoursNow = () => {
    if (workingHours.length === 0) return false;

    // Get current date and time in user's timezone
    const now = moment();
    const currentDayIndex = now.day(); // 0-6 (Sunday-Saturday)
    const currentTime = now.format("HH:mm:ss");
    const currentDate = now.format("YYYY-MM-DD");

    const englishDayName = getEnglishDayName(currentDayIndex);

    console.log("Current local time:", now.format("YYYY-MM-DD HH:mm:ss Z"));
    console.log("Current day:", englishDayName);
    console.log("Current time:", currentTime);

    // Find working hours for today
    const dayWorkingHours = workingHours.find(
      (day) => day.day.toLowerCase() === englishDayName.toLowerCase(),
    );

    if (!dayWorkingHours) {
      console.log("No working hours defined for", englishDayName);
      return true; // No working hours defined for today
    }

    console.log(
      "Working hours for",
      englishDayName,
      ":",
      dayWorkingHours.start_time,
      "-",
      dayWorkingHours.end_time,
    );

    // Create time objects for comparison
    const currentTimeObj = moment(currentTime, "HH:mm:ss");
    const workStartObj = moment(dayWorkingHours.start_time, "HH:mm");
    const workEndObj = moment(dayWorkingHours.end_time, "HH:mm");

    console.log("Current time:", currentTimeObj.format("HH:mm"));
    console.log("Work start:", workStartObj.format("HH:mm"));
    console.log("Work end:", workEndObj.format("HH:mm"));

    // Check if current time is before work start or after work end
    const isBeforeWork = currentTimeObj.isBefore(workStartObj);
    const isAfterWork = currentTimeObj.isAfter(workEndObj);

    console.log("Is before work:", isBeforeWork);
    console.log("Is after work:", isAfterWork);

    return isBeforeWork || isAfterWork;
  };

  const handlePlay = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);
    updateCallApi(false);
    updateFromTektime(true);

    // Check if CURRENT time is outside working hours
    if (isOutsideWorkingHoursNow()) {
      setPopupMessage(
        t("warnings.outside_working_hours", {
          time: moment().format("HH:mm"),
          date: moment().format("YYYY-MM-DD"),
        }),
      );
      setShowPopup(true);
      setLoading(false);
      setMeetingToPlay(item);
      return;
    }
    const currentDate = moment().format("YYYY-MM-DD"); // Format to match the meeting date format
    if (item?.type === "Newsletter") {
      const meetingDate = moment(item.date).format("YYYY-MM-DD"); // Extract the meeting date in the same format

      if (meetingDate !== currentDate) {
        toast.error(t("errors.newletterplayMeeting"));
        setLoading(false);
        return;
      }
    } else if (item?.type !== "Task" && item.type !== "Strategy") {
      // Allow play only if the time difference is within ±60 minutes for active meetings
      if (
        !(timeDifference >= -60 && timeDifference <= 60) &&
        item.status === "active"
      ) {
        // toast.error(t("errors.playMeeting"));
        // setLoading(false);

        // return;
        // Show confirmation modal instead of toast error
        setMeetingToPlay(item);
        setShowPlayConfirmationModal(true);
        setLoading(false);
        return;
      }
    }

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      const isGuide =
        meetingSteps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);

      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        setLoading(false);

        return; // Exit if the user is not a guide
      }
    }

    continueHandlePlay(item);
  };

  const continueHandlePlay = async (item) => {
    setShowPopup(false);
    updateCallApi(false);
    updateFromTektime(true);
    setLoading(true);
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);

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

    const minOrderNo = Math.min(...meetingSteps.map((step) => step.order_no));

    // Find the first step (order_no 1)
    const firstStep = meetingSteps.find((step) => step.order_no === minOrderNo);
    const firstParticipant = firstStep?.assigned_to;

    // Format date and time in user's timezone
    const stepTimeFormatted = moment().tz(userTimeZone).format("hh:mm:ss A"); // "05:27:40 PM"
    const startDateFormatted = moment().tz(userTimeZone).format("YYYY-MM-DD"); // "2025-04-30"

    const updatedSteps = meetingSteps?.map((step) => {
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
        },
      );
      if (response.status) {
        if (item?.type === "Task" || item?.type === "Strategy") {
          markTodoMeeting(item?.id);
          getMeeting();
        }
        // navigate(`/play/${item.id}`);

        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);
        getRefreshMeeting();

        setLoading(false);

        // navigate(`/destínation/${item?.unique_id}/${item?.id}`);
      }
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  // Add this confirmation handler
  const handleConfirmPlay = () => {
    if (meetingToPlay) {
      continueHandlePlay(meetingToPlay);
    }
    setShowPlayConfirmationModal(false);
  };
  const changeStatusAndPlay = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    updateCallApi(true);
    updateFromTektime(true);

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      // Check if the logged-in user is in the guides array

      const isGuide =
        meetingSteps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);
      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        setLoading(false);
        return; // Exit if the user is not a guide
      }
    }

    continueChangeStatusAndPlay(item);
  };
  const continueChangeStatusAndPlay = async (item) => {
    setLoading(true);

    // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
    navigate(`/destination/${item?.unique_id}/${item?.id}`);

    setLoading(false);
  };

  const changeStatusAndRestart = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    updateCallApi(true);
    updateFromTektime(true);

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      // Check if the logged-in user is in the guides array

      const isGuide =
        meetingSteps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);
      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        setLoading(false);
        return; // Exit if the user is not a guide
      }
    }

    continueChangeStatusAndRestart(item);
  };

  const continueChangeStatusAndRestart = async (item) => {
    setLoading(true);
    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const response = await axios.get(
        `${API_BASE_URL}/play-to-finish-meeting/${item?.id}?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
      );
      if (response?.status) {
        getMeeting();
        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (meeting) => {
    // window.open(`/destination/${meeting?.unique_id}/${meeting?.id}`, "_blank");
    navigate(`/destination/${meeting?.unique_id}/${meeting?.id}`);
  };

  const changeTodoStatusAndRestart = async (item) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    updateCallApi(true);
    updateFromTektime(true);

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      // Check if the logged-in user is in the guides array

      const isGuide =
        meetingSteps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);
      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        setLoading(false);
        return; // Exit if the user is not a guide
      }
    }

    continueChangeTodoStatusAndRestart(item);
  };

  const continueChangeTodoStatusAndRestart = async (item) => {
    setLoading(true);
    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const response = await axios.get(
        `${API_BASE_URL}/play-todo-meeting/${item?.id}?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
      );
      if (response?.status) {
        getMeeting();
        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (item) => {
    setCheckId(item.id);
    // setFormState(item);

    // Update formState while preserving any existing state
    setFormState((prev) => ({
      ...prev, // Spread existing state
      ...item, // Spread the new item properties
      steps: meetingSteps || prev.steps, // Handle steps specifically if needed
    }));
    setIsUpdated(true);
    handleShow();
    // Update formState while preserving any existing state
    setMeetingContext((prev) => ({
      ...prev, // Spread existing state
      ...item, // Spread the new item properties
      steps: meetingSteps || prev.steps, // Handle steps specifically if needed
    }));
    // setMeetingContext(item);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success("Réunion supprimée avec succès");

        // Check user needs for redirection logic
        const userJson = CookieService.get("user");
        let hasMeetingModule = false;
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            const userNeeds = user?.user_needs || user?.needs || [];
            hasMeetingModule =
              Array.isArray(userNeeds) &&
              userNeeds.some((n) => n.need === "meeting_need");
          } catch (e) {
            console.error("Error parsing user needs", e);
          }
        }

        if (hasMeetingModule) {
          navigate("/meeting");
        } else {
          navigate("/profile");
        }
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
      // getUserMeetingCount();
    } finally {
      setFormState({});
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
  const review = (data) => {
    navigate(`/view/${data.id}`, { state: data });
  };

  const handleToggle = () => {
    setView(view === "list" ? "graph" : "list");
    setOpen1(!open1);
  };

  const [newId, setNewId] = useState(null);
  const handleCloseModal1 = () => {
    setShowModal(false);
    setShowFileModal(false);
  };

  const formattedEndDateInHours = calculateEndDate(steps, meeting?.date);

  const guideEmails = new Set(meeting?.guides?.map((guide) => guide.email));

  const handleAddParticipant = (item) => {
    setCheckId(item?.id);
    setAddParticipant(true);
    setMeeting(item);
    handleShow();
  };
  const handleChangePrivacy = (item) => {
    setCheckId(item?.id);
    setFormState(item);
    setChangePrivacy(true);
    setMeeting(item);
    handleShow();
  };
  const handleChangeContext = (item) => {
    setCheckId(item?.id);
    setFormState(item);
    setChangeOptions(false);
    setChangeContext(true);
    setMeeting(item);
    handleShow();
  };
  const handleChangeOptions = (item) => {
    setCheckId(item?.id);
    setFormState(item);
    setChangeContext(false);
    setChangeOptions(true);

    setMeeting(item);
    handleShow();
  };

  const totalTime = calculateTotalTimeMeeting(meeting, t);

  const handleShow1 = () => {
    setShowProfile(true);
  };
  const hideShow = () => {
    setShowProfile(false);
  };

  const handleOrgShow = () => {
    setShowOrgProfile(true);
  };
  const hideOrgShow = () => {
    setShowOrgProfile(false);
  };
  const handleHostShow = () => {
    setShowHostProfile(true);
  };
  const hideHostShow = () => {
    setShowHostProfile(false);
  };

  const [isCloseMomentModalOpen, setIsCloseMomentModalOpen] = useState(false);
  const [closeMomentDateTime, setCloseMomentDateTime] = useState("");
  const [isConfirmCloseMomentOpen, setIsConfirmCloseMomentOpen] =
    useState(false);

  // Updated Confirm Handler
  const handleCloseMoment = async () => {
    let meetingClosedDate = closeMomentDateTime.split("T")[0]; // Get the date part from datetime input
    let meetingClosedTime = closeMomentDateTime.split("T")[1]; // Get the time part from datetime input

    // Ensure the time format is hh:mm:ss (if seconds are missing)
    if (meetingClosedTime && meetingClosedTime.length === 5) {
      meetingClosedTime = `${meetingClosedTime}:00`; // Append seconds (set to 00)
    }
    const data = {
      meeting_id: parseInt(id),
      meeting_closed_date: meetingClosedDate,
      meeting_closed_time: meetingClosedTime,
      starts_at: meeting?.starts_at || meeting?.start_time,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/close-meeting-manually`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        toast.success(
          `Clôture: ${t(`types.${meeting?.type}`)} - ${meeting?.title}`,
        );

        setIsCloseMomentModalOpen(false);
        setIsConfirmCloseMomentOpen(false);
        navigate(`/present/invite/${id}`, { state: { from: "meeting" } });
      }
    } catch (error) {
      console.error("Error closing moment:", error);
      toast.error("Something went wrong.");
    }
  };

  const editorRef = useRef(null);
  // const [content, setContent] = useState("");

  const handleEditorChange = (content) => {
    // setContent(content);
    setEditValue(content);
  };

  const uploadToCloudinary = async (blobInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());
        formData.append("upload_preset", "chat-application"); // Replace with your upload preset
        formData.append("cloud_name", "drrk2kqvy"); // Replace with your cloud name

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/drrk2kqvy/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        resolve(data.secure_url); // Return the secure URL from Cloudinary
      } catch (error) {
        console.error("Upload error:", error);
        reject("Image upload failed: " + error.message);
      }
    });
  };

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditTitle = (meeting) => {
    setEditingField("title");
    setEditValue(meeting.title);
  };

  const handleEditDescription = (meeting) => {
    setEditingField("description");
    setEditValue(meeting.description);
    // setContent(meeting.description);
  };

  const handleSaveEdit = async () => {
    try {
      const token = CookieService.get("token");

      // Construct the payload with all meeting data, only updating the edited field
      const updatedMeeting = {
        // ...meeting, // keep all other fields
        [editingField]: editValue, // only update the edited field
        meeting_id: meeting?.id,
      };

      const response = await axios.post(
        `${API_BASE_URL}/update-meeting-title`,
        updatedMeeting,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200 || response.status === 201) {
        setEditingField(null);
        await getMeeting();
        toast.success(t("Updated successfully"));
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // Get session user details
  const sessionEmail = JSON.parse(CookieService.get("user"))?.email;

  // Check conditions
  const isEventOrganizer =
    meeting?.event_organizer &&
    meeting?.event_organizer?.email === sessionEmail;
  const isAgendaEvent =
    meeting?.type === "Google Agenda Event" ||
    meeting?.type === "Outlook Agenda Event";

  // Check if session email matches any of the meeting users or guides
  const isMeetingParticipant =
    meeting?.user?.email === sessionEmail ||
    meeting?.guides?.some((guide) => guide?.email === sessionEmail);

  // Final visibility condition
  const showButton =
    (isAgendaEvent && isEventOrganizer) || 
    isMeetingParticipant || 
    (parseInt(meeting?.user?.id) === parseInt(loggedInUserId)) || 
    meeting?.user?.email === sessionEmail;
  console.log("showButton", showButton);

  // const userRole = CookieService.get("user_role");
  const canManage =
    meeting?.user?.id === parseInt(loggedInUserId) ||
    (meeting?.event_organizer && meeting?.event_organizer?.email === sessionEmail) ||
    meeting?.user?.email === sessionEmail ||
    meeting?.guides?.some(
      (guide) =>
        guide?.id === parseInt(loggedInUserId) || guide?.email === sessionEmail,
    )

  console.log("canManage", canManage);
  return (
    <>
      {isLoading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="invite w-100 notranslate"
          style={{
            position: "static",
            backgroundColor: "white",
            padding: "10px 15px",
            display: showQuickMomentForm ? "none" : "block",
          }}
        >
          <div className="d-flex flex-column flex-lg-row gap-4">
            {/* Left Column - Content (takes full width on mobile) */}
            <div className="flex-grow-1 order-2 order-lg-1">
              <div className="title mb-1">
                {(() => {
                  try {
                    const userJson = CookieService.get("user");
                    if (!userJson) return false;
                    const user = JSON.parse(userJson);
                    const userNeeds = user?.user_needs || user?.needs || [];
                    return (
                      Array.isArray(userNeeds) &&
                      userNeeds.some((n) => n.need === "meeting_need")
                    );
                  } catch (e) {
                    console.warn("Failed to parse user or user_needs", e);
                    return false;
                  }
                })() && (
                  <>
                    <Link to="/meeting">Agenda</Link>
                    <span> / </span>
                  </>
                )}
                <Link
                  to={{
                    pathname: `/invitiesToMeeting/${meeting?.destination_id}`,
                  }}
                >
                  {meeting?.objective}
                </Link>
              </div>

              <div className="invite-header d-flex flex-column flex-md-row justify-content-between gap-3 mt-3">
                <div className="flex-grow-1" style={{width:'80%'}}>
                  <h5 className="content-heading-title mt-0 d-flex align-items-center flex-wrap gap-2">
                    {meeting?.title}
                    <span
                      className="cursor-pointer"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditTitle(meeting)}
                    >
                      <RiEditBoxLine size={20} />
                    </span>

                    {/* Status Badge */}
                    {meeting?.status === "closed" ? (
                      <span className="badge inprogrss">
                        {t("badge.finished")}
                      </span>
                    ) : meeting?.status === "in_progress" ? (
                      <span
                        className={`badge ${meetingSteps?.some((item) => item?.step_status === "in_progress" && convertTimeTakenToSeconds(item?.time_taken) > convertCount2ToSeconds(item?.count2, item?.time_unit)) ? "status-badge-red-invite" : "status-badge-inprogress-invite"}`}
                      >
                        {t("badge.inprogress")}
                      </span>
                    ) : meeting?.status === "active" ? (
                      <span
                        className={`badge ms-2 ${moment().isAfter(moment(`${meeting?.date} ${meeting?.start_time}`, "YYYY-MM-DD HH:mm")) ? "late" : "future"}`}
                      >
                        {moment().isAfter(
                          moment(
                            `${meeting?.date} ${meeting?.start_time}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                          ? t("badge.late")
                          : t("badge.future")}
                      </span>
                    ) : meeting?.status === "to_finish" ? (
                      <span className="badge status-badge-finish">
                        {t("badge.finish")}
                      </span>
                    ) : meeting?.status === "todo" ? (
                      <span className="badge status-badge-green">
                        {t("badge.Todo")}
                      </span>
                    ) : meeting?.status === "no_status" ? (
                      // <span className="badge status-badge-green">{t("badge.no_status")}</span>
                      <span className="badge status-badge-green d-none">
                        {t("badge.no_status")}
                      </span>
                    ) : meeting?.status === "draft" ? (
                      <span className="badge draft">
                        {t("badge.draft")}
                      </span>
                    ): (
                      <span className="badge inprogrss">
                        {t("badge.finished")}
                      </span>
                    )}
                  </h5>
                </div>

                {/* Rejoindre la réunion */}
               {(meeting?.status !== "no_status" ||
                  meeting?.type === "Calendly" ||
                  canManage) && (
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="play-btn-container">
                      {showButton && meeting?.type !== "Calendly" && (
                        <>
                          {/* Button */}

                          {meeting?.status === "in_progress" ? (
                            <>
                              {loading ? (
                                <button
                                  className={`btn play-btn`}
                                  style={{ padding: "13px 72px" }}
                                >
                                  <Spinner
                                    as="span"
                                    variant="light"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    animation="border"
                                  />
                                </button>
                              ) : (
                                <Button
                                  className="btn play-btn"
                                  // onClick={() => handlePlay(meeting)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (meeting.status === "active") {
                                      handlePlay(meeting);
                                    } else if (
                                      meeting?.status === "to_finish"
                                    ) {
                                      // changeStatusAndRestart(meeting);
                                      handleClick(meeting);
                                    } else if (meeting?.status === "todo") {
                                      changeTodoStatusAndRestart(meeting);
                                    } else {
                                      changeStatusAndPlay(meeting);
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  {`${t("continue moment")}: ${
                                    meeting?.type === "Google Agenda Event" ||
                                    meeting?.type === "Outlook Agenda Event"
                                      ? t("Join the meeting")
                                      : meeting?.solution
                                        ? meeting?.solution?.title
                                        : meeting?.type === "Prise de contact"
                                          ? "Prise de contact"
                                          : t(`types.${meeting?.type}`)
                                  }`}

                                  <FaArrowRight
                                    size={12}
                                    style={{
                                      marginLeft: ".5rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Button>
                              )}
                            </>
                          ) : meeting?.status === "closed" ? (
                            <>
                              <Button
                                className="btn play-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCallApi(false);
                                  updateFromTektime(false);

                                  const currentURL = `/destination/${meeting?.unique_id}/${meeting?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }}
                                // disabled={transcriptLoading || summaryLoading}
                              >
                                {t("presentation.generateLink")}

                                <FaArrowRight
                                  size={12}
                                  style={{
                                    marginLeft: ".5rem",
                                    fontWeight: 700,
                                  }}
                                />
                              </Button>
                            </>
                          ) : meeting?.status === "to_finish" ||
                            meeting?.status === "todo" ? (
                            <>
                              {loading ? (
                                <button
                                  className={`btn play-btn`}
                                  style={{ padding: "13px 72px" }}

                                  // style={{ background: "#0d6efd" }}
                                >
                                  <Spinner
                                    as="span"
                                    variant="light"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    animation="border"
                                  />
                                </button>
                              ) : (
                                <Button
                                  className="btn play-btn"
                                  // onClick={() => handlePlay(meeting)}
                                  onClick={
                                    meeting.status === "active"
                                      ? (e) => {
                                          e.stopPropagation();
                                          handlePlay(meeting);
                                        }
                                      : meeting?.status === "to_finish"
                                        ? (e) => {
                                            e.stopPropagation();
                                            // changeStatusAndRestart(meeting);
                                            handleClick(meeting);
                                          }
                                        : meeting?.status === "todo"
                                          ? (e) => {
                                              e.stopPropagation();
                                              changeTodoStatusAndRestart(
                                                meeting,
                                              );
                                            }
                                          : (e) => {
                                              e.stopPropagation();
                                              changeStatusAndPlay(meeting);
                                            }
                                  }
                                  disabled={loading}
                                >
                                  {/* {t("startMoment")} */}
                                  {meeting?.type === "Google Agenda Event" ||
                                  meeting?.type === "Outlook Agenda Event"
                                    ? t("Join the meeting")
                                    : `${t("follow")}: ${
                                        meeting?.solution
                                          ? meeting?.solution?.title
                                          : meeting?.type === "Prise de contact"
                                            ? "Prise de contact"
                                            : t(`types.${meeting?.type}`)
                                      }`}

                                  <FaArrowRight
                                    size={12}
                                    style={{
                                      marginLeft: ".5rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Button>
                              )}
                            </>
                          ) : meeting?.status === "no_status" ? null : (
                            <>

                            {meeting?.presentation && <>
                              {loading ? (
                                <button
                                  className={`btn play-btn`}
                                  style={{ padding: "13px 72px" }}

                                  // style={{ background: "#0d6efd" }}
                                >
                                  <Spinner
                                    as="span"
                                    variant="light"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    animation="border"
                                  />
                                </button>
                              ) : (
                                <Button
                                  className="btn play-btn"
                                  // onClick={() => handlePlay(meeting)}
                                  onClick={
                                    meeting?.status === "active"
                                      ? (e) => {
                                          e.stopPropagation();
                                          handlePlay(meeting);
                                        }
                                      : meeting?.status === "to_finish"
                                        ? (e) => {
                                            e.stopPropagation();
                                            changeStatusAndRestart(meeting);
                                          }
                                        : meeting?.status === "todo"
                                          ? (e) => {
                                              e.stopPropagation();
                                              changeTodoStatusAndRestart(
                                                meeting,
                                              );
                                            }
                                          : (e) => {
                                              e.stopPropagation();
                                              changeStatusAndPlay(meeting);
                                            }
                                  }
                                  disabled={loading}
                                >
                                  {/* {t("startMoment")} */}
                                  {meeting?.type === "Google Agenda Event" ||
                                  meeting?.type === "Outlook Agenda Event"
                                    ? t("Join the meeting")
                                    : `${t("startMoment")}: ${
                                        meeting?.solution
                                          ? meeting?.solution?.title
                                          : meeting?.type === "Prise de contact"
                                            ? "Prise de contact"
                                            : t(`types.${meeting?.type}`)
                                      }`}

                                  <FaArrowRight
                                    size={12}
                                    style={{
                                      marginLeft: ".5rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                </Button>
                              )}
                            </>}
                            </>
                          )}
                        </>
                      )}

                      {(!showButton || meeting?.type === "Calendly") && (
                        <Button
                          className="btn play-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCallApi(true);
                            updateFromTektime(false);

                            const currentURL = `/destination/${meeting?.unique_id}/${meeting?.id}`;
                            copy(currentURL);
                            openLinkInNewTab(currentURL);
                          }}
                        >
                          <LuLink size={"20px"} /> &nbsp;
                          {t("dropdown.reviewinvitation")}
                          {/* {t("dropdown.Review the detail")} */}
                        </Button>
                      )}
                      {/* Dropdown List */}
                      {canManage && (
                        <Dropdown className="dropdown">
                          {showButton && (
                            <Dropdown.Toggle
                              variant="success"
                              id="dropdown-basic"
                            >
                              <BiDotsVerticalRounded
                                color="black"
                                size={"25px"}
                              />
                            </Dropdown.Toggle>
                          )}

                          {
                            showButton && (
                              <Dropdown.Menu>
                                {meeting?.status !== "in_progress" && meeting?.status !== "no_status" && (
                                  <>
                                    {/* {(meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event") && */}

                                    <Dropdown.Item
                                      onClick={(e) => {
                                        handleEdit(meeting);
                                      }}
                                    >
                                      <RiEditBoxLine size={"20px"} /> &nbsp;
                                      {t("dropdown.To modify")}
                                    </Dropdown.Item>

                                    {/* // } */}
                                  </>
                                )}
                                {meeting?.status === "in_progress" && (
                                  <Dropdown.Item
                                    onClick={(e) => {
                                      handleChangePrivacy(meeting);
                                    }}
                                  >
                                    <RiEditBoxLine size={"20px"} /> &nbsp;
                                    {t("dropdown.change Privacy")}
                                  </Dropdown.Item>
                                )}
                                {meeting?.status !== "no_status" && (
                                  <Dropdown.Item
                                    onClick={(e) => handleChangeContext(meeting)}
                                  >
                                    <RiEditBoxLine size={"18px"} /> &nbsp;{" "}
                                    {t("dropdown.change Context")}
                                  </Dropdown.Item>
                                )}
                                {meeting?.status !== "no_status" && (
                                  <Dropdown.Item
                                    onClick={(e) => handleChangeOptions(meeting)}
                                  >
                                    <RiEditBoxLine size={"18px"} /> &nbsp;{" "}
                                    {t("dropdown.change Options")}
                                  </Dropdown.Item>
                                )}

                                {meeting?.status !== "no_status" && (
                                  <Dropdown.Item
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(
                                        setFormState,
                                        meeting,
                                        t,
                                        handleShow,
                                        setMeetingContext,
                                        setCheckId,
                                        setIsDuplicate,
                                        setMeeting,
                                        setIsLoading,
                                        setStatus,
                                        updateSteps,
                                        meetingSteps,
                                      );
                                    }}
                                  >
                                    <IoCopyOutline size={"18px"} /> &nbsp;
                                    {t("dropdown.Duplicate")}
                                  </Dropdown.Item>
                                )}

                                {meeting?.status === "active" && (
                                  <Dropdown.Item
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCallApi(true);
                                      updateFromTektime(false);

                                      let currentURL = `/destination/${meeting?.unique_id}/${meeting?.id}`;
                                      copy(currentURL);
                                      openLinkInNewTab(currentURL);
                                    }}
                                  >
                                    <LuLink size={"20px"} /> &nbsp;
                                    {t("dropdown.invitation")}
                                  </Dropdown.Item>
                                )}
                                {meeting?.status !== "no_status" && (
                                  <Dropdown.Item
                                    onClick={() =>
                                      setIsCloseMomentModalOpen(true)
                                    }
                                  >
                                    <FaRegCheckSquare size={"18px"} /> &nbsp;
                                    {t("dropdown.CloseManually")}:{" "}
                                    {meeting?.solution
                                      ? meeting?.solution?.title
                                      : meeting?.type === "Google Agenda Event"
                                        ? "Google Agenda Event"
                                        : meeting?.type === "Outlook Agenda Event"
                                          ? "Outlook Agenda Event"
                                          : meeting?.type === "Prise de contact"
                                            ? "Prise de contact"
                                            : t(`types.${meeting?.type}`)}
                                  </Dropdown.Item>
                                )}
                                {meeting?.status !== "no_status" && (
                                  <Dropdown.Item
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      review(meeting);
                                    }}
                                  >
                                    <AiOutlineEye size={"20px"} /> &nbsp;
                                    {t("dropdown.Review the detail")}
                                  </Dropdown.Item>
                                )}

                                {(parseInt(meeting?.user?.id) === parseInt(loggedInUserId) ||
                                  (meeting?.event_organizer && meeting?.event_organizer?.email === sessionEmail) ||
                                  meeting?.user?.email === sessionEmail) && (
                                  <>
                                    {meeting?.status !== "no_status" && (
                                      <hr
                                        style={{
                                          margin: "10px 0 0 0",
                                          padding: "2px",
                                        }}
                                      />
                                    )}
                                    {meeting?.status === "in_progress" ? (
                                      <>
                                        <Dropdown.Item
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowConfirmationCancelModal(
                                              true,
                                            );

                                            // handleCancel(meeting.id);
                                          }}
                                        >
                                          <ImCancelCircle
                                            size={"20px"}
                                            color="red"
                                          />
                                          &nbsp; {t("dropdown.Cancel")}
                                        </Dropdown.Item>
                                      </>
                                    ) : (
                                      <Dropdown.Item
                                        onClick={(e) =>
                                          handleDeleteClick(e, meeting?.id)
                                        }
                                      >
                                        <AiOutlineDelete
                                          size={"20px"}
                                          color="red"
                                        />
                                        &nbsp; {t("dropdown.Delete")}
                                      </Dropdown.Item>
                                    )}
                                  </>
                                )}
                              </Dropdown.Menu>
                            )
                            // : (

                            // )
                          }
                        </Dropdown>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="items">
                <div className="d-flex align-items-center gap-2 mb-3">
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
                  {/* <span className="time">{meeting?.type}</span> */}
                  <span className="time">
                    {meeting?.solution
                      ? meeting?.solution?.title
                      : meeting?.type === "Google Agenda Event"
                        ? "Google Agenda Event"
                        : meeting?.type === "Outlook Agenda Event"
                          ? "Outlook Agenda Event"
                          : meeting?.type === "Prise de contact"
                            ? "Prise de contact"
                            : t(`types.${meeting?.type}`)}
                  </span>
                </div>
              </div>

              {/* <div className="d-flex align-items-center gap-2 content-body mt-3 mb-2 mt-lg-3"> */}
              {meeting?.status !== "no_status" &&
                meeting?.type !== "Calendly" && (
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                    <img
                      src="/Assets/invite-date.svg"
                      height="28px"
                      width="28px"
                    />

                    {meeting?.type === "Action1" ||
                    meeting?.type === "Newsletter" ||
                    meeting?.type === "Strategy" ? (
                      <>
                        <span className="fw-bold formate-date">
                          {formattedDate}
                        </span>{" "}
                        -
                        <span className="fw-bold formate-date">
                          {estimateDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="fw-bold formate-date">
                          {formattedDate}
                          &nbsp; {t("at")}
                        </span>
                        <span className="fw-bold formate-date">
                          {/* {formattedTime} */}
                          {meeting?.status === "in_progress"
                            ? convertTo12HourFormatMeeting(
                                meeting?.starts_at,
                                meeting?.current_date || meeting?.date,
                                meeting?.timezone,
                              )
                            : convertTo12HourFormatMeeting(
                                meeting?.start_time,
                                meeting?.date,
                                meeting?.timezone,
                              )}{" "}
                          -{" "}
                        </span>

                        <span className="fw-bold formate-date">
                          {estimateDate}
                          &nbsp; {t("at")}
                        </span>
                        <span className="fw-bold formate-date">
                          {estimateTime}
                        </span>
                      </>
                    )}
                    <span className="fw-bold fs-10">
                      {getTimezoneSymbol(CookieService.get("timezone"))}
                    </span>
                  </div>
                )}
              {/* </div> */}

              {/* Location */}
              <div>
                {(meeting?.location && meeting?.location !== "None") ||
                (meeting?.agenda && meeting?.agenda !== "None") ? (
                  <div className="d-flex gap-4 align-items-center mt-2 mb-2">
                    {meeting?.location && meeting?.location !== "None" && (
                      <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                        {meeting?.location === "Zoom" ? (
                          <>
                            <svg
                              width="28px"
                              height="28px"
                              viewBox="0 0 32 32"
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
                              {meeting?.user?.user_zoom_info?.display_name}
                            </span>
                          </>
                        ) : meeting?.location === "Microsoft Teams" ? (
                          <>
                            <SiMicrosoftteams
                              style={{ color: "#6264A7" }}
                              className="fs-5"
                              size={28}
                            />
                            <span className="solutioncards option-text">
                              {meeting?.user?.visioconference_links?.find(
                                (item) => item.platform === "Microsoft Teams",
                              )?.value || "Microsoft Teams"}
                            </span>
                          </>
                        ) : meeting?.location === "Google Meet" ? (
                          <>
                            <svg
                              width="28px"
                              height="28px"
                              viewBox="0 0 32 32"
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
                              {meeting?.user?.visioconference_links?.find(
                                (item) => item.platform === "Google Meet",
                              )?.value || "Google Meet"}
                            </span>
                          </>
                        ) : null}
                      </p>
                    )}
                    {meeting?.agenda && meeting?.agenda !== "None" && (
                      <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                        {meeting?.agenda === "Zoom Agenda" ? (
                          <>
                            <svg
                              width="28px"
                              height="28px"
                              viewBox="0 0 32 32"
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
                              {meeting?.user?.user_zoom_info?.display_name}
                            </span>
                          </>
                        ) : meeting?.agenda === "Outlook Agenda" ? (
                          <>
                            <SiMicrosoftoutlook
                              style={{ color: "#0078D4" }}
                              className="fs-5"
                              size={28}
                            />
                            <span className="solutioncards option-text">
                              {meeting?.user?.integration_links?.find(
                                (item) => item.platform === "Outlook Agenda",
                              )?.value || "Outlook Agenda"}
                            </span>
                          </>
                        ) : meeting?.agenda === "Google Agenda" ? (
                          <>
                            <FcGoogle size={28} />
                            <span className="solutioncards option-text">
                              {meeting?.user?.integration_links?.find(
                                (item) => item.platform === "Google Agenda",
                              )?.value || "Google Agenda"}
                            </span>
                          </>
                        ) : null}
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="ps-0">
                  {meeting?.address ? (
                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 ms-0 mt-2">
                      <FaLocationDot size={25} />
                      <span>{meeting?.address}</span>
                    </p>
                  ) : null}
                </div>
                {meeting?.room_details ? (
                  <div>
                    <p className="d-flex gap-2 mt-2 justify-content-start align-items-top ps-0">
                      <BsPersonWorkspace size={25} />
                      <p className="m-0">{meeting?.room_details}</p>
                    </p>
                  </div>
                ) : null}
                {meeting?.phone ? (
                  <div>
                    <p className="d-flex gap-2 align-items-center justify-content-start ps-0 mt-2">
                      <FaPhoneAlt size={25} />
                      <a
                        href={`tel:${meeting.phone}`}
                        className="text-decoration-none"
                      >
                        <span>{meeting.phone}</span>
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Options */}
              {/* <div className="row mt-2"> */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                {meeting?.prise_de_notes === "Automatic" && (
                  <>
                    <div>
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
                            <stop offset="0.514" stopColor="#56E8F1" />
                            <stop offset="1" stopColor="#2F47C1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="solutioncards option-text">
                        {t("meeting.formState.Automatic note taking")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.alarm === true && (
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
                        {t("meeting.formState.Beep alarm")}
                      </span>
                    </div>
                  </>
                )}
                 {meeting?.presentation && (
                  <>
                    <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3ZM21 17H3V5H21V17ZM10 7L15 11L10 15V7Z"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Presentation")}
                    </span>
                    </div>
                  </>
                )}
                {meeting?.autostart === true && (
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
                        {t("meeting.formState.Autostart")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.playback === "automatic" && (
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
                        {t("meeting.formState.Lecture playback")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.notification === true && (
                  <>
                    <div>
                      <svg
                        width="25px"
                        height="24px"
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
                            d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          ></path>{" "}
                          <circle
                            cx="19"
                            cy="5"
                            r="3"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                          ></circle>{" "}
                          <path
                            d="M7 14H16"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          ></path>{" "}
                          <path
                            d="M7 17.5H13"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          ></path>{" "}
                        </g>
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.notification")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.open_ai_decide === true && (
                  <>
                    <div>
                      <svg
                        width="25px"
                        height="24px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                          stroke="#3D57B5"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("Gestion des messages")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.automatic_instruction === true && (
                  <>
                    <div>
                      <svg
                        width="25"
                        height="24px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM19 19H5V5H19V19ZM17 16H7V14H17V16ZM17 12H7V10H17V12ZM17 8H7V6H17V8Z"
                          fill="#3D57B5"
                        />
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.Automatic Instruction")}
                      </span>
                    </div>
                  </>
                )}
                {meeting?.remainder && (
                  <>
                    <div>
                      <svg
                        width="25"
                        height="24px"
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
                            d="M12 9V13L14.5 15.5"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M3.5 4.5L7.50002 2"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M20.5 4.5L16.5 2"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                          <path
                            d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                            stroke="#3D57B5"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          ></path>{" "}
                        </g>
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.Remainder")}
                      </span>
                    </div>
                  </>
                )}

                {meeting?.feedback && (
                  <>
                    <div>
                      <svg
                        width="25px"
                        height="24px"
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
                            d="M16 1C17.6569 1 19 2.34315 19 4C19 4.55228 18.5523 5 18 5C17.4477 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H16C16.5523 21 17 20.5523 17 20V19C17 18.4477 17.4477 18 18 18C18.5523 18 19 18.4477 19 19V20C19 21.6569 17.6569 23 16 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H16Z"
                            fill="#3D57B5"
                          ></path>{" "}
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M20.7991 8.20087C20.4993 7.90104 20.0132 7.90104 19.7133 8.20087L11.9166 15.9977C11.7692 16.145 11.6715 16.3348 11.6373 16.5404L11.4728 17.5272L12.4596 17.3627C12.6652 17.3285 12.855 17.2308 13.0023 17.0835L20.7991 9.28666C21.099 8.98682 21.099 8.5007 20.7991 8.20087ZM18.2991 6.78666C19.38 5.70578 21.1325 5.70577 22.2134 6.78665C23.2942 7.86754 23.2942 9.61999 22.2134 10.7009L14.4166 18.4977C13.9744 18.9398 13.4052 19.2327 12.7884 19.3355L11.8016 19.5C10.448 19.7256 9.2744 18.5521 9.50001 17.1984L9.66448 16.2116C9.76728 15.5948 10.0602 15.0256 10.5023 14.5834L18.2991 6.78666Z"
                            fill="#3D57B5"
                          ></path>{" "}
                          <path
                            d="M5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7Z"
                            fill="#3D57B5"
                          ></path>{" "}
                          <path
                            d="M5 11C5 10.4477 5.44772 10 6 10H10C10.5523 10 11 10.4477 11 11C11 11.5523 10.5523 12 10 12H6C5.44772 12 5 11.5523 5 11Z"
                            fill="#3D57B5"
                          ></path>{" "}
                          <path
                            d="M5 15C5 14.4477 5.44772 14 6 14H7C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16H6C5.44772 16 5 15.5523 5 15Z"
                            fill="#3D57B5"
                          ></path>{" "}
                        </g>
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.Feedbacks")}
                      </span>
                    </div>
                  </>
                )}

                {meeting?.automatic_strategy && (
                  <>
                    <div>
                      <svg
                        width="25"
                        height="24px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                          fill="#3D57B5"
                        />
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.Automatic Strategy")}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {/* </div> */}

              {/* <div className="row"> */}
              <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
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
                    {meeting?.moment_privacy === "public" ? (
                      <Avatar
                        src="/Assets/Tek.png"
                        style={{ borderRadius: "0" }}
                      />
                    ) : meeting?.moment_privacy === "team" ? (
                      <Avatar.Group>
                        {meeting?.moment_privacy_teams_data?.map((item) => {
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
                    ) : meeting?.moment_privacy === "participant only" ? (
                      <Avatar.Group maxCount={8}>
                        {meeting?.user_with_participants?.map((item) => {
                          return (
                            <>
                              <Tooltip
                                title={
                                  item?.full_name !== " "
                                    ? item?.full_name
                                    : item?.email
                                }
                                placement="top"
                              >
                                <Avatar
                                  size="large"
                                  src={
                                    item?.participant_image?.startsWith("http")
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
                    ) : meeting?.moment_privacy === "tektime members" ? (
                      <img
                        src={
                          meeting?.user?.enterprise?.logo?.startsWith("http")
                            ? meeting?.user?.enterprise?.logo
                            : Assets_URL + "/" + meeting?.user?.enterprise?.logo
                        }
                        alt="Logo"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "fill",
                          borderRadius: "50%",
                        }}
                      /> // <Tooltip
                    ) : meeting?.moment_privacy === "enterprise" ? (
                      <Tooltip
                        title={meeting?.user?.enterprise?.name}
                        placement="top"
                      >
                        <img
                          src={
                            meeting?.user?.enterprise?.logo?.startsWith("http")
                              ? meeting?.user?.enterprise?.logo
                              : Assets_URL +
                                "/" +
                                meeting?.user?.enterprise?.logo
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
                    ) : meeting?.moment_privacy === "password" ? (
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
                      <Tooltip title={meeting?.user?.full_name} placement="top">
                        <Avatar
                          src={
                            meeting?.user?.image.startsWith("users/")
                              ? Assets_URL + "/" + meeting?.user?.image
                              : meeting?.user?.image
                          }
                        />
                      </Tooltip>
                    )}

                    <span
                      className={`badge ms-2 ${
                        meeting?.moment_privacy === "private"
                          ? "solution-badge-red"
                          : meeting?.moment_privacy === "public"
                            ? "solution-badge-green"
                            : meeting?.moment_privacy === "enterprise" ||
                                meeting?.moment_privacy ===
                                  "participant only" ||
                                meeting?.moment_privacy === "tektime members"
                              ? "solution-badge-blue"
                              : meeting?.moment_privacy === "password"
                                ? "solution-badge-red"
                                : "solution-badge-yellow"
                      }`}
                      style={{ padding: "3px 8px 3px 8px" }}
                    >
                      {meeting?.moment_privacy === "private"
                        ? t("solution.badge.private")
                        : meeting?.moment_privacy === "public"
                          ? t("solution.badge.public")
                          : meeting?.moment_privacy === "enterprise"
                            ? t("solution.badge.enterprise")
                            : meeting?.moment_privacy === "participant only"
                              ? t("solution.badge.participantOnly")
                              : meeting?.moment_privacy === "tektime members"
                                ? t("solution.badge.membersOnly")
                                : meeting?.moment_privacy === "password"
                                  ? t("solution.badge.password")
                                  : t("solution.badge.team")}
                    </span>
                  </div>
                </div>
              </div>
              {/* Calendly Availability */}
              {(meeting?.calendly_availability?.length > 0 ||
                meeting?.calendly_non_availability?.length > 0) && (
                <div className="mt-3 mb-3">
                  {meeting?.calendly_availability?.length > 0 && (
                    <div className="mb-2">
                      <strong style={{ fontSize: "14px", color: "#3D57B5" }}>
                        {t("meeting.formState.calendly_availability")}:
                      </strong>
                      <div className="d-flex flex-column mt-1 ps-2">
                        {meeting.calendly_availability
                          .sort((a, b) => {
                            const days = [
                              "Lundi",
                              "Mardi",
                              "Mercredi",
                              "Jeudi",
                              "Vendredi",
                              "Samedi",
                              "Dimanche",
                            ];
                            return days.indexOf(a.day) - days.indexOf(b.day);
                          })
                          .map((day) => {
                            const dayMapping = {
                              Lundi: "Monday",
                              Mardi: "Tuesday",
                              Mercredi: "Wednesday",
                              Jeudi: "Thursday",
                              Vendredi: "Friday",
                              Samedi: "Saturday",
                              Dimanche: "Sunday",
                            };
                            return (
                              day.active && (
                                <div
                                  key={day.id}
                                  className="d-flex gap-2"
                                  style={{ fontSize: "13px" }}
                                >
                                  <span
                                    style={{ width: "80px", fontWeight: "600" }}
                                  >
                                    {t(
                                      `meeting.formState.NameofDays.${dayMapping[day.day]}`,
                                    )}
                                    :
                                  </span>
                                  <span>
                                    {day.start} - {day.end}
                                  </span>
                                </div>
                              )
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {meeting?.calendly_non_availability?.length > 0 && (
                    <div className="mt-2">
                      <strong style={{ fontSize: "14px", color: "#3D57B5" }}>
                        {t("meeting.formState.calendly_non_availability")}:
                      </strong>
                      <ul
                        className="ps-3 mt-1 mb-0"
                        style={{ fontSize: "13px" }}
                      >
                        {meeting.calendly_non_availability.map((na, index) => (
                          <li key={index}>{na}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {/* </div> */}

              {(meeting?.description || meeting?.description !== null) && (
                <div className="paragraph-parent mt-2 ms-1 w-100 position-relative">
                  <span className="paragraph paragraph-images">
                    {isMarkdownContent(meeting?.description) ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 {...props} />,
                            h2: ({ node, ...props }) => <h2 {...props} />,
                            h3: ({ node, ...props }) => <h3 {...props} />,
                            p: ({ node, ...props }) => <p {...props} />,
                            ul: ({ node, ...props }) => <ul {...props} />,
                            ol: ({ node, ...props }) => <ol {...props} />,
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
                          {cleanText(meeting?.description)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div
                        className="html-content-wrapper"
                        dangerouslySetInnerHTML={{
                          __html: meeting?.description || "",
                        }}
                      />
                    )}
                  </span>
                </div>
              )}

              {/* Best practice – pure Bootstrap, zero inline styles */}
              {meetingSteps && totalTime && (
                <div className="mt-4 d-flex justify-content-center justify-content-md-start ">
                  <span
                    className="px-3 py-2 fw-normal d-inline-block"
                    style={{
                      backgroundColor: "#f5f8ff", // your brand blue (change if you want)
                      fontSize: "clamp(13px, 2.5vw, 15px)", // perfect size on all devices
                      whiteSpace: "nowrap", // prevents text from breaking
                      color: "black",
                    }}
                  >
                    {t("estimateFieldActive")}: {totalTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------TABS------------------------------------------------------ */}

          <div className="current_destinations clients-tab">
            <Tab.Container
              className="destination-tabs-container"
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key)}
            >
              <div className="d-none d-md-block">
                <div className="row align-items-end tabs-header custom-tabs mt-5">
                  <div className="col-md-10">
                    <Nav variant="tabs" className="d-flex flex-wrap gap-3">
                      {/* Contacts tab - ALWAYS include this */}
                      <Nav.Item key="casting" className="tab">
                        <Nav.Link
                          eventKey="casting"
                          className="custom-tab-link"
                        >
                          {t("Casting")}
                          <span
                            className={`${
                              activeTab === "casting" ? "future" : "draft"
                            } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {meeting?.type === "Newsletter"
                              ? `${meeting?.newsletter_subscribers?.length || 0}`
                              : `${
                                  meeting?.guides?.length +
                                  meeting?.participants?.length
                                }`}
                            {/* // {meeting?.guides?.length + */}
                            {/* //   meeting?.participants?.length + meeting?.newsletter_subscribers?.length} */}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="steps" className="tab">
                        <Nav.Link eventKey="steps" className="custom-tab-link">
                          {t("steps")}
                          <span
                            className={`${
                              activeTab === "steps" ? "future" : "draft"
                            } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {count?.step_count || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="files" className="tab">
                        <Nav.Link eventKey="files" className="custom-tab-link">
                          {t("meeting.newMeeting.labels.file")}
                          <span
                            className={`${
                              activeTab === "files" ? "future" : "draft"
                            } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {count?.file_count || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="discussion" className="tab">
                        <Nav.Link
                          eventKey="discussion"
                          className="custom-tab-link"
                        >
                          {t("meeting.newMeeting.labels.discussion")}
                          <span
                            className={`${
                              activeTab === "discussion" ? "future" : "draft"
                            } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {count?.message_count || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                  <div className="col-md-2 d-flex justify-content-end">
                    {activeTab === "casting" && (
                      <div className="cards-section child-2">
                        {meeting?.type === "Newsletter" ? (
                          <button
                            onClick={() => {
                              handleAddParticipant(meeting);
                            }}
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "24px",
                              textAlign: "left",
                              color: " #FFFFFF",
                              background: "#2C48AE",
                              border: 0,
                              outine: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                              marginTop: "1.5rem",
                            }}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                fill="white"
                              />
                            </svg>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {t("meeting.formState.Add Abonne")}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleAddParticipant(meeting);
                            }}
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "24px",
                              textAlign: "left",
                              color: " #FFFFFF",
                              background: "#2C48AE",
                              border: 0,
                              outine: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                              marginTop: "1.5rem",
                            }}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                fill="white"
                              />
                            </svg>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {t("meeting.formState.Add Invitee")}
                          </button>
                        )}
                      </div>
                    )}

                    {activeTab === "steps" && (
                      <>
                        {!(
                          meeting?.type === "Google Agenda Event" ||
                          meeting?.type === "Outlook Agenda Event"
                        ) && (
                          <div className="invite-buttons">
                            {/* {meeting?.status === "in_progress" && ( */}
                            <button
                              onClick={() => {
                                // stepModal(meeting);
                                setIsDrop(true);

                                setIsUpdated(false);
                                setShowModal(true);
                                // setOpen1(false);
                              }}
                              style={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                fontWeight: 600,
                                lineHeight: "24px",
                                textAlign: "left",
                                color: " #FFFFFF",
                                background: "#2C48AE",
                                border: 0,
                                outine: 0,
                                padding: "10px 16px",
                                borderRadius: "9px",
                                // marginTop: "1.5rem",
                              }}
                            >
                              <svg
                                width="20"
                                height="21"
                                viewBox="0 0 20 21"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                  fill="white"
                                />
                              </svg>
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              {t("addTask")}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "files" && (
                      <div className="invite-buttons mt-3">
                        <input
                          type="file"
                          id="fileInput"
                          // accept="application/pdf"
                          accept="
                          application/pdf,
                          application/vnd.ms-excel,
                          application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                          application/vnd.ms-powerpoint,
                          application/vnd.openxmlformats-officedocument.presentationml.presentation,
                          application/msword,
                          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                          image/png,
                          image/webp
                          video/mp4,
                          video/x-msvideo,
                          video/x-matroska,
                          video/mpeg,
                          video/quicktime"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                        <button
                          onClick={() => setShowFileModal(true)}
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            textAlign: "left",
                            color: "#FFFFFF",
                            background: "#2C48AE",
                            border: 0,
                            outline: 0,
                            padding: "10px 16px",
                            borderRadius: "9px",
                            marginTop: "20px",
                          }}
                        >
                          <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                              fill="white"
                            />
                          </svg>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {t("addFile")}
                        </button>
                      </div>
                    )}

                    {activeTab === "discussion" && (
                      <div className="cards-section child-2">
                        <button
                          onClick={refreshMessages}
                          disabled={refreshing}
                          className="btn btn-sm btn-link text-muted p-0"
                          title={
                            refreshing ? "Refreshing..." : "Refresh messages"
                          }
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            textAlign: "left",
                            border: 0,
                            outine: 0,
                            padding: "10px 16px",
                            borderRadius: "9px",
                            marginRight: "1rem",
                          }}
                        >
                          <FaSyncAlt
                            className={`${refreshing ? "spinning" : ""}`}
                            size={25}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile: Simple Minimal Dropdown */}
              <div className="d-block d-md-none mt-4">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="light"
                    className="w-100 d-flex justify-content-between align-items-center border rounded px-3 py-2 shadow-sm"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <span className="fw-bold">
                      {activeTab === "casting" &&
                        `${t("Casting")} • ${meeting?.type === "Newsletter" ? meeting?.newsletter_subscribers?.length || 0 : (meeting?.guides?.length || 0) + (meeting?.participants?.length || 0)}`}
                      {activeTab === "steps" &&
                        `${t("steps")} • ${count?.step_count || 0}`}
                      {activeTab === "files" &&
                        `${t("meeting.newMeeting.labels.file")} • ${count?.file_count || 0}`}
                      {activeTab === "discussion" &&
                        `${t("meeting.newMeeting.labels.discussion")} • ${count?.message_count || 0}`}
                    </span>
                    <span>▼</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100">
                    <Dropdown.Item eventKey="casting">
                      {t("Casting")} (
                      {meeting?.type === "Newsletter"
                        ? meeting?.newsletter_subscribers?.length || 0
                        : (meeting?.guides?.length || 0) +
                          (meeting?.participants?.length || 0)}
                      )
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="steps">
                      {t("steps")} ({count?.step_count || 0})
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="files">
                      {t("meeting.newMeeting.labels.file")} (
                      {count?.file_count || 0})
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="discussion">
                      {t("meeting.newMeeting.labels.discussion")} (
                      {count?.message_count || 0})
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {/* Mobile: Show Add Button Below Dropdown */}
                <div className="mt-3 text-end">
                  {activeTab === "casting" && (
                    <div className="cards-section child-2">
                      {meeting?.type === "Newsletter" ? (
                        <button
                          onClick={() => {
                            handleAddParticipant(meeting);
                          }}
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            textAlign: "left",
                            color: " #FFFFFF",
                            background: "#2C48AE",
                            border: 0,
                            outine: 0,
                            padding: "10px 16px",
                            borderRadius: "9px",
                            marginTop: "1.5rem",
                          }}
                        >
                          <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                              fill="white"
                            />
                          </svg>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {t("meeting.formState.Add Abonne")}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleAddParticipant(meeting);
                          }}
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            textAlign: "left",
                            color: " #FFFFFF",
                            background: "#2C48AE",
                            border: 0,
                            outine: 0,
                            padding: "10px 16px",
                            borderRadius: "9px",
                            marginTop: "1.5rem",
                          }}
                        >
                          <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                              fill="white"
                            />
                          </svg>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {t("meeting.formState.Add Invitee")}
                        </button>
                      )}
                    </div>
                  )}

                  {activeTab === "steps" && (
                    <>
                      {!(
                        meeting?.type === "Google Agenda Event" ||
                        meeting?.type === "Outlook Agenda Event"
                      ) && (
                        <div className="invite-buttons">
                          {/* {meeting?.status === "in_progress" && ( */}
                          <button
                            onClick={() => {
                              // stepModal(meeting);
                              setIsDrop(true);

                              setIsUpdated(false);
                              setShowModal(true);
                              // setOpen1(false);
                            }}
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "24px",
                              textAlign: "left",
                              color: " #FFFFFF",
                              background: "#2C48AE",
                              border: 0,
                              outine: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                              // marginTop: "1.5rem",
                            }}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                fill="white"
                              />
                            </svg>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {t("addTask")}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "files" && (
                    <div className="invite-buttons mt-3">
                      <input
                        type="file"
                        id="fileInput"
                        // accept="application/pdf"
                        accept="
                          application/pdf,
                          application/vnd.ms-excel,
                          application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                          application/vnd.ms-powerpoint,
                          application/vnd.openxmlformats-officedocument.presentationml.presentation,
                          application/msword,
                          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                          image/png,
                          image/webp
                          video/mp4,
                          video/x-msvideo,
                          video/x-matroska,
                          video/mpeg,
                          video/quicktime"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <button
                        onClick={() => setShowFileModal(true)}
                        style={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "24px",
                          textAlign: "left",
                          color: "#FFFFFF",
                          background: "#2C48AE",
                          border: 0,
                          outline: 0,
                          padding: "10px 16px",
                          borderRadius: "9px",
                          marginTop: "20px",
                        }}
                      >
                        <svg
                          width="20"
                          height="21"
                          viewBox="0 0 20 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                            fill="white"
                          />
                        </svg>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        {t("addFile")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Tab.Content className="mt-3">
                <Tab.Pane eventKey="casting">
                  <div className="row d-flex justify-content-center">
                    <div
                      className="col-md-12 mb-3 position-relative"
                      // style={{ minHeight: "300px" }}
                    >
                      {/* --------------Organisator */}
                      <div style={{ marginTop: "4rem" }}>
                        <h4 className="participant-heading-meeting">
                          {showOrgProfile && (
                            <IoArrowBackSharp
                              onClick={hideOrgShow}
                              size={25}
                              style={{
                                cursor: "pointer",
                                marginRight: "1rem",
                              }}
                            />
                          )}
                          {t("Creator")}
                        </h4>
                        <div
                          className="host"
                          style={{
                            background: showOrgProfile && "white",
                          }}
                        >
                          <HostCard
                            data={meeting?.user}
                            guides={meeting?.user_with_participants?.filter(
                              (item) => item?.email === meeting?.user?.email,
                            )}
                            handleShow={handleOrgShow}
                            handleHide={hideOrgShow}
                            showProfile={showOrgProfile}
                            meeting={meeting}
                          />
                        </div>
                      </div>

                      {/* ---------------GUides */}
                      {meeting?.guides?.length > 0 && (
                        <div style={{ marginTop: "4rem" }}>
                          <h4 className="participant-heading-meeting">
                            {showHostProfile && (
                              <IoArrowBackSharp
                                onClick={hideHostShow}
                                size={25}
                                style={{
                                  cursor: "pointer",
                                  marginRight: "1rem",
                                }}
                              />
                            )}
                            {meeting?.guides?.length > 1 ? "Guides" : "Guide"}
                          </h4>
                          <div
                            className="host"
                            style={{
                              background: showHostProfile && "white",
                            }}
                          >
                            <GuidesCard
                              data={meeting?.user}
                              guides={meeting?.guides}
                              handleShow={handleHostShow}
                              handleHide={hideHostShow}
                              showProfile={showHostProfile}
                              meeting={meeting}
                              onAttendanceToggle={getMeeting}
                            />
                          </div>
                        </div>
                      )}
                      {/* ------------------------------------------------ Participants */}

                      {meeting?.type !== "Newsletter" && (
                        <>
                          {meeting?.participants?.filter(
                            (item) =>
                              // item.isCreator === 0 &&
                              !guideEmails?.has(item.email),
                          )?.length > 0 && (
                            <div style={{ marginTop: "3rem" }}>
                              <h4 className="participant-heading-meeting">
                                {showProfile && (
                                  <IoArrowBackSharp
                                    onClick={hideShow}
                                    size={25}
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "1rem",
                                    }}
                                  />
                                )}

                                {t("invite")}
                              </h4>
                              <div
                                className="participant"
                                style={{
                                  background: showProfile && "white",
                                }}
                              >
                                <ParticipantCard
                                  guides={meeting?.guides}
                                  data={meeting?.participants}
                                  meeting={meeting}
                                  handleShow={handleShow1}
                                  handleHide={hideShow}
                                  showProfile={showProfile}
                                  onAttendanceToggle={getMeeting}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {meeting?.type === "Newsletter" &&
                        meeting?.newsletter_subscribers?.length > 0 && (
                          <div
                            style={{
                              marginTop: "3rem",
                              marginBottom: "3rem",
                            }}
                          >
                            <h4 className={"participant-heading-meeting"}>
                              {t("Abonnés")}
                            </h4>

                            <div
                              className="participant"
                              style={{ background: showProfile && "white" }}
                            >
                              <div style={{ marginTop: "5rem" }}>
                                <SubscriberCard
                                  subscribers={meeting?.newsletter_subscribers}
                                  data={meeting?.newsletter_subscribers}
                                  meeting={meeting}
                                  handleShow={handleShow1}
                                  handleHide={hideShow}
                                  showProfile={showProfile}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </Tab.Pane>
                {/* ------------------------------------------------ Steps */}

                <Tab.Pane eventKey="steps">
                  {showStepProgressBar ? (
                    <div
                      className="d-flex align-items-center justify-content-center my-5"
                      // style={{ background: "transparent" }}
                    >
                      <div style={{ width: "50%" }}>
                        <ProgressBar now={stepProgress} animated />
                      </div>
                    </div>
                  ) : (
                    <div className="row d-flex justify-content-center">
                      <div className="col-md-12 mb-3">
                        <div
                          style={{
                            marginTop: "3rem",
                            marginBottom: "3rem",
                          }}
                        >
                          <h4
                            className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                          >
                            {meetingSteps?.length > 1 ? t("steps") : t("step")}

                            <span style={{ cursor: "pointer" }}>
                              <div className="toggle-button">
                                <button
                                  className={`toggle-button-option ${
                                    view === "list" ? "active" : ""
                                  }`}
                                  onClick={() => handleToggle("list")}
                                >
                                  <div className="icon-list" />
                                  <FaList size={18} />
                                </button>
                                <button
                                  className={`toggle-button-option ${
                                    view === "graph" ? "active" : ""
                                  }`}
                                  onClick={() => handleToggle("graph")}
                                >
                                  <div className="icon-graph" />
                                  <FaChartGantt size={20} />
                                </button>
                              </div>
                            </span>
                          </h4>

                          {view === "graph" ? (
                            <KanbanBoard
                              data={meetingSteps}
                              startTime={formattedTime}
                              users={{
                                ...meeting?.user,
                                firstName: meeting?.user?.name,
                                lastName: meeting?.user?.last_name,
                                image:
                                  // meeting?.user?.assigned_to_image ||
                                  meeting?.user?.image || "/Assets/avatar.jpeg",
                              }}
                              meeting={meeting}
                              refreshMeeting={getRefreshMeeting}
                            />
                          ) : (
                            <StepCard
                              data={meetingSteps}
                              startTime={formattedTime}
                              users={{
                                ...meeting?.user,
                                firstName: meeting?.user?.name,
                                lastName: meeting?.user?.last_name,
                                image:
                                  // meeting?.user?.assigned_to_image ||
                                  meeting?.user?.image || "/Assets/avatar.jpeg",
                              }}
                              meeting={meeting}
                              refreshMeeting={getRefreshMeeting}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="files">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      {/* ------------------------------------------------ Files */}
                      <div
                        style={{
                          marginTop: "3rem",
                          marginBottom: "3rem",
                        }}
                      >
                        <h4 className="participant-heading-meeting">
                          {`${t("meeting.newMeeting.labels.file")} `}
                        </h4>
                        <StepFile
                          isFileUploaded={isFileUploaded}
                          setIsFileUploaded={setIsFileUploaded}
                          openModal={openModal}
                          meetingFiles={meetingFiles}
                        />
                        {isModalOpen && (
                          <ViewFilePreview
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                            modalContent={modalContent}
                            closeModal={closeModal}
                            isFileUploaded={isFileUploaded}
                            setIsFileUploaded={setIsFileUploaded}
                            refreshMeeting={refreshFiles}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="discussion">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      <MeetingDiscussion
                        meetingId={id}
                        messages={meetingMessages}
                        selectedMoment={meeting}
                        onMessagesUpdate={(newMeetings) =>
                          setMeetingMessages(newMeetings)
                        }
                        refreshMessages={refreshMessages}
                      />
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      )}
      {open && (
        <div className="tabs-container container-fluid">
          <NewMeetingModal open={open} closeModal={handleCloseModal} />
        </div>
      )}

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
      {showPlayConfirmationModal && (
        <ConfirmationModal
          message={t("errors.playmsg")}
          onConfirm={(e) => handleConfirmPlay(e)}
          onCancel={(e) => {
            e.stopPropagation();
            setShowPlayConfirmationModal(false);
          }}
        />
      )}
      {showPopup && (
        <ConfirmationModal
          message={popupMessage}
          onConfirm={(e) => handleConfirmPlay(e)}
          onCancel={(e) => {
            e.stopPropagation();
            setShowPopup(false);
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
      {showConfirmationCancelModal && (
        <ConfirmationModal
          message={t("confirmation")}
          onConfirm={(e) => updateMeetingStatus(e, meeting, navigate)}
          onCancel={(e) => {
            e.stopPropagation();
            setShowConfirmationCancelModal(false);
          }}
        />
      )}
      {showModal && (
        <div className="new-meeting-modal tabs-container">
          <StepChart
            meetingId={meeting?.id}
            id={newId}
            show={showModal}
            setId={setNewId}
            closeModal={handleCloseModal1}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            setIsDropFile={setIsDropFile}
            meeting={meeting}
            setMeeting={setMeeting}
            refreshMeeting={getRefreshMeeting}
            openedFrom='step'
          />
        </div>
      )}
      {showFileModal && (
        <div className="file-modal-overlay">
          <div
            className="file-modal-content w-100 h-100"
            style={{ background: "rgb(242, 244, 251)" }}
          >
            <button
              className="file-modal-close"
              onClick={() => setShowFileModal(false)}
            >
              ×
            </button>
            <FileUploadModal
              meetingId={meeting?.id}
              setShowFileModal={setShowFileModal}
              isFileUploaded={isFileUploaded}
              setIsFileUploaded={setIsFileUploaded}
              refreshMeeting={refreshFiles}
            />
          </div>
        </div>
      )}

      {isCloseMomentModalOpen && (
        <Modal
          show={isCloseMomentModalOpen}
          onHide={() => setIsCloseMomentModalOpen(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("Select moment end time")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="datetime">
                <Form.Label>{t("Select Date and Time")}</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={closeMomentDateTime}
                  onChange={(e) => setCloseMomentDateTime(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsCloseMomentModalOpen(false)}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="primary"
              disabled={!closeMomentDateTime}
              // onClick={() => setIsConfirmCloseMomentOpen(true)}
              onClick={() => {
                setIsCloseMomentModalOpen(false); // Close first modal
                setIsConfirmCloseMomentOpen(true); // Open confirmation modal
              }}
            >
              {t("Validate")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {isConfirmCloseMomentOpen && (
        <Modal
          show={isConfirmCloseMomentOpen}
          onHide={() => setIsConfirmCloseMomentOpen(false)}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {t(
                "Are you sure you want to close the moment at this date and time?",
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="danger" onClick={handleCloseMoment}>
              {t("Yes, confirm")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsConfirmCloseMomentOpen(false);
                setIsCloseMomentModalOpen(true); // open first modal
              }}
            >
              {t("No, cancel")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {editingField && (
        <Modal
          show={true}
          onHide={() => setEditingField(null)}
          centered
          backdrop="static"
          size={editingField === "description" ? "xl" : "md"} // xl for description, lg for title
          dialogClassName={
            editingField === "description" ? "description-edit-modal" : ""
          }
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {t("edit")} {t(`fieldNames.${editingField}`)}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingField === "description" ? (
              isMarkdownContent(editValue) ? (
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "hidden",
                    minHeight: "400px",
                  }}
                >
                  <MDXEditor
                    markdown={cleanText(editValue)}
                    onChange={(newValue) => {
                      setEditValue(newValue);
                    }}
                    plugins={[
                      headingsPlugin(),
                      listsPlugin(),
                      markdownShortcutPlugin(),
                    ]}
                    contentEditableClassName="french-content-editor"
                  />
                </div>
              ) : (
                <Editor
                  apiKey={APIKEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  value={editValue}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 480,
                    menubar: true,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                      "image",
                      "imagetools",
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic underline | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | link image | \
                  code | fullscreen | help",

                    /* Cloudinary Image Handling */
                    automatic_uploads: true,
                    images_upload_handler: async (blobInfo, progress) => {
                      progress(0);
                      try {
                        const url = await uploadToCloudinary(blobInfo);
                        progress(100);
                        return url;
                      } catch (error) {
                        progress(0);
                        throw error;
                      }
                    },

                    /* Enable all image input methods */
                    paste_data_images: true,
                    file_picker_types: "image",

                    /* Image enhancements */
                    image_caption: true,
                    image_advtab: true,
                    image_title: true,

                    // 🟢 Enable resizing images with the mouse
                    resize_img_proportional: true, // Optional: constrain proportions
                    object_resizing: true, // or 'img' to target only images
                    image_dimensions: true, // shows width/height fields and supports inline sizing

                    image_class_list: [
                      { title: "Responsive", value: "img-responsive" },
                      { title: "Rounded", value: "img-rounded" },
                    ],

                    /* Responsive images by default */
                    content_style: `
                 
                  img.img-rounded { border-radius: 8px; }
                `,
                  }}
                />
              )
            ) : (
              <input
                type="text"
                className="form-control"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setEditingField(null)}>
              {t("Cancel")}
            </Button>
            <button
              className="btn"
              style={{
                background: "#0026b1",
                color: "white",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "20px",
                textAlign: "left",
                padding: "10px 16px",
              }}
              onClick={handleSaveEdit}
            >
              {t("Validate")}
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {showQuickMomentForm && (
        <QuickMomentForm
          show={showQuickMomentForm}
          onClose={() => {
            setShowQuickMomentForm(false);
          }}
          openedFrom="assistant"
          destination={meeting?.destination}
          meetingData={meeting}
        />
      )}

      {isPrivacyModal && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <p>{visibilityMessage}</p>
            <div className="confirmation-modal-buttons">
              <button
                className="btn btn-danger"
                onClick={() => navigate("/meeting")}
              >
                {t("back")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invite;
