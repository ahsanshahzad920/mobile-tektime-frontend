import CookieService from "../../Utils/CookieService";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Modal,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import moment from "moment";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  createStrategyMoment,
  markToFinish,
} from "../../Utils/MeetingFunctions";
import { image_upload_handler_callback, optimizeEditorContent } from "./Chart";
import {
  MdArrowBackIosNew,
  MdKeyboardArrowDown,
  MdNavigateNext,
  MdOutlineModeEdit,
} from "react-icons/md";
import ReportStepFile from "./ReportStepFile";
import ParticipantCard from "./CurrentMeeting/components/ParticipantCard";
import { IoArrowBackOutline, IoArrowBackSharp } from "react-icons/io5";
import {
  formatDate,
  formatTime,
  parseAndFormatDateTime,
  timezoneSymbols,
} from "./GetMeeting/Helpers/functionHelper";
import { FaBackward, FaLocationDot } from "react-icons/fa6";
import { BsPersonWorkspace } from "react-icons/bs";
import {
  FaBook,
  FaChartLine,
  FaComments,
  FaExpand,
  FaFileAlt,
  FaFolderOpen,
  FaGavel,
  FaList,
  FaPause,
  FaPhoneAlt,
  FaPhotoVideo,
  FaRegQuestionCircle,
  FaRegStopCircle,
  FaSearch,
  FaStickyNote,
  FaStop,
  FaUserCircle,
} from "react-icons/fa";
import { Tooltip as AntdTooltip, Avatar, Spin, Tooltip } from "antd";
import CounterContainer from "./PlayMeeting/components/CounterContainer";
import Spreadsheet from "react-spreadsheet";
import DOMPurify from "dompurify";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import { toast } from "react-toastify";
import axios from "axios";
import ReactToggle from "react-toggle";
import "react-toggle/style.css";
import Select from "react-select";
import ShowIF from "../../Utils/ShowIF";
import { Editor } from "@tinymce/tinymce-react";
import { AiFillDelete } from "react-icons/ai";
import { useCounterContext } from "./context/CounterContext";
import { Link, useNavigate } from "react-router-dom";
import HostCard from "./CurrentMeeting/components/HostCard";
import { useRecording } from "../../../context/RecordingContext";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import StepFile from "./CurrentMeeting/components/StepFile";
import ActiveReportStepCard from "./Report/ActiveReportStepCard";
import SignUp from "../AuthModal/SignUp";
import { useMeetings } from "../../../context/MeetingsContext";
import RecordingErrorModal from "./RecordingErrorModal";
import MeetingDiscussion from "./CurrentMeeting/components/MeetingDiscussion";
import ReportHostCard from "./ReportHostCard";
import ReportParticipantCard from "./ReportParticipantCard";
import { FiPause, FiPlay } from "react-icons/fi";
import { SiMicrosoftoutlook, SiMicrosoftteams } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import Search from "./Report/Search";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import { useTranslation } from "react-i18next";
import { BiCloudUpload } from "react-icons/bi";
import { debounce } from "lodash";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { CiCircleQuestion } from "react-icons/ci";

// Modern Animated Recording Indicator Component
const RecordingIndicator = ({ t }) => (
  <div
    className="recording-status-badge d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
    style={{
      background: "rgba(220, 38, 38, 0.08)",
      border: "1px solid rgba(220, 38, 38, 0.15)",
      width: "fit-content",
      margin: "5px auto",
      backdropFilter: "blur(4px)",
      boxShadow: "0 2px 10px rgba(220, 38, 38, 0.05)",
    }}
  >
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "12px", height: "12px" }}
    >
      <div
        className="rounded-circle bg-danger"
        style={{
          width: "7px",
          height: "7px",
          boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.6)",
          animation: "recording-dot-pulse 2s infinite",
        }}
      ></div>
    </div>

    <div className="d-flex align-items-center gap-1" style={{ height: "10px" }}>
      {[0.4, 0.7, 0.5, 0.8].map((h, i) => (
        <div
          key={i}
          className="bg-danger rounded-pill"
          style={{
            width: "1.5px",
            height: "100%",
            opacity: 0.7,
            animation: `recording-wave-bar 1s ease-in-out infinite ${i * 0.15}s`,
          }}
        ></div>
      ))}
    </div>

    <span
      className="text-danger fw-bold"
      style={{
        fontSize: "11px",
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        fontFamily: "'Inter', sans-serif",
        userSelect: "none",
      }}
    >
      {t("Enregistrement en cours")}
    </span>

    <style>
      {`
        @keyframes recording-wave-bar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.1); }
        }
        @keyframes recording-dot-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}
    </style>
  </div>
);

// Modern Animated Auto Note-Taking Component
const AutoNoteIndicator = ({ t, visible, isDesktopOnly }) => (
  <div
    className={`${isDesktopOnly ? "d-none d-lg-flex" : "d-flex"} align-items-center gap-2 px-3 py-1 rounded-pill`}
    style={{
      visibility: visible ? "visible" : "hidden",
      background: "rgba(177, 31, 171, 0.04)",
      border: "1px solid rgba(177, 31, 171, 0.12)",
      backdropFilter: "blur(4px)",
      width: "fit-content",
      boxShadow: "0 2px 10px rgba(177, 31, 171, 0.03)",
    }}
  >
    <div
      className="position-relative d-flex align-items-center justify-content-center"
      style={{ width: "20px", height: "20px" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 28 28"
        fill="none"
        style={{ animation: "auto-note-rotate 10s linear infinite" }}
      >
        <circle
          cx="14"
          cy="14"
          r="11"
          stroke="url(#ai-ind-grad)"
          strokeWidth="2.5"
          strokeDasharray="3 3"
        />
        <defs>
          <linearGradient id="ai-ind-grad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#B11FAB" />
            <stop offset="0.5" stopColor="#56E8F1" />
            <stop offset="1" stopColor="#2F47C1" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="position-absolute rounded-circle"
        style={{
          width: "5px",
          height: "5px",
          background: "#56E8F1",
          boxShadow: "0 0 10px rgba(86, 232, 241, 0.8)",
          animation: "auto-note-pulse 2s ease-in-out infinite",
        }}
      ></div>
    </div>
    <span
      className="solutioncards option-text fw-semibold"
      style={{
        fontSize: "11px",
        background: "linear-gradient(135deg, #B11FAB, #2F47C1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "0.4px",
      }}
    >
      {t("meeting.formState.Automatic note taking")}
    </span>
    <style>
      {`
        @keyframes auto-note-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes auto-note-pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.4); opacity: 1; } }
      `}
    </style>
  </div>
);

const InProgress = ({
  onUploadSuccess,
  meetingData,
  setMeetingData,
  t,
  dropdownRef,
  renderIcon,
  allMeetings,
  meetId,
  selectedTitleOrder,
  toggleDropdown,
  dropdownVisible,
  applyFilter,
  formattedDate,
  convertTo12HourFormat,
  formattedTime,
  formattedEndDate,
  estimateDate,
  estimateTime,
  setEstimateDate,
  setEstimateTime,
  // handleShowSignUp,
  showHostProfile,
  hideHostShow,
  handleHostShow,
  isContentBlurred,
  guideEmails,
  showProfile,
  handleShow,
  hideShow,
  onModalClose,
  isModalOpen,
  setIsModalOpen,
  setCallNow,
  fromTektime,
  setFromTektime,
  meetingFile,
  meetingMessages,
  setMeetingMessages,
  showProgressBar,
  setShowProgressBar,
  progress,
  setProgress,
  setIsUploading,
  stepMedias = [],
}) => {
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/^```markdown\s*/, "")
      .replace(/```$/, "")
      .replace(/---/g, "");
  };

  const isMarkdownContent = (text) => {
    if (!text) return false;
    // Simple check: if it contains typical markdown patterns but not typical HTML tags
    const hasMarkdown = /[*_#\-+]|\[.*\]\(.*\)/.test(text);
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);
    return hasMarkdown && !hasHtml;
  };

  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;
  const [excelData, setExcelData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { setCallApi } = useMeetings();
  const {
    //   meetingData,
    savedTime,
    negativeTimes,
    activeStepIndex,
    setNextActiveStep,
    setPreviousActiveStep,
    stepDelay,
    setStepDelay,
    setDecision,
    decision,
    timerKey,
    incrementTimerKey,
    setMeetingData: setContextMeetingData,

    // const [decision, setDecision] = useState([]);
  } = useCounterContext();
  const { startRecording } = useRecording();

  // iPhone/iPad Wake Lock Video Reference (for iOS users specifically)
  // const wakeLockVideoRef = useRef(null);
  // const isIPhoneDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // // Effect to handle silent video playback for iOS wake lock
  // useEffect(() => {
  //   if (isIPhoneDevice && wakeLockVideoRef.current) {
  //     const playVideo = async () => {
  //       try {
  //         if (wakeLockVideoRef.current) {
  //           // Explicitly set muted as a DOM property, which iOS prefers over the attribute
  //           wakeLockVideoRef.current.muted = true;
  //           if (wakeLockVideoRef.current.paused) {
  //             await wakeLockVideoRef.current.play();
  //             console.log("🎬 Mobile Wake Lock Video started");
  //           }
  //         }
  //       } catch (err) {
  //         console.log(
  //           "Wake lock video play failed, waiting for interaction:",
  //           err.name,
  //         );
  //       }
  //     };

  //     playVideo();
  //     // Small timeout for Safari just in case
  //     setTimeout(playVideo, 1000);

  //     // Listen for any interaction to trigger play if autoplay was blocked
  //     const handleInteraction = () => {
  //       playVideo();
  //     };

  //     document.addEventListener("click", handleInteraction);
  //     document.addEventListener("touchstart", handleInteraction, {
  //       passive: true,
  //     });

  //     return () => {
  //       document.removeEventListener("click", handleInteraction);
  //       document.removeEventListener("touchstart", handleInteraction);
  //     };
  //   }
  // }, [isIPhoneDevice, isModalOpen]); // Trigger when modal opens to ensure play() on user gesture
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [showStepContentEditor, setShowStepContentEditor] = useState(false);

  // REACT QUILL EDITORS for Notes and Decisions:
  const [notesEditor, setNotesEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [decisionEditor, setDecisionEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [fileEditor, setFileEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [questionEditor, setQuestionEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [mediaEditor, setMediaEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [planDActionEditor, setPlanDActionEditor] = useState({
    showEditor: false,
  });

  const isMobile = window.innerWidth <= 768; // You can adjust this breakpoint

  const getMeetingById = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/meetings/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const meetingData = response.data?.data;
        if (meetingData?.prise_de_notes === "Automatic") {
          setIsAutomatic(true);
        } else {
          setIsAutomatic(false);
        }
        setPreviousSteps(meetingData?.steps);
        setStepNotes(meetingData?.steps?.map((step) => step?.note));
        setDecision(meetingData?.steps?.map((step) => step?.decision));
        setStepData(meetingData?.steps);
        setTableData(meetingData?.plan_d_actions || []);
        setMeetingData(meetingData);
        // if (setContextMeetingData) {
        //   setContextMeetingData(meetingData);
        // }
        // setEmailCampaign(meetingData?.email_campaigns);

        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );

          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
        }

        return meetingData;
      }
    } catch (error) {
      return null;
    }
  };
    const getMeetingByIdWithCalculation = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/meetings/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&do_continue_change_cal=true`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const meetingData = response.data?.data;
        if (meetingData?.prise_de_notes === "Automatic") {
          setIsAutomatic(true);
        } else {
          setIsAutomatic(false);
        }
        setPreviousSteps(meetingData?.steps);
        setStepNotes(meetingData?.steps?.map((step) => step?.note));
        setDecision(meetingData?.steps?.map((step) => step?.decision));
        setStepData(meetingData?.steps);
        setTableData(meetingData?.plan_d_actions || []);
        setMeetingData(meetingData);
        if (setContextMeetingData) {
          setContextMeetingData(meetingData);
        }
        // setEmailCampaign(meetingData?.email_campaigns);

        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );

          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
        }

        return meetingData;
      }
    } catch (error) {
      return null;
    }
  };
  const getMeeting = async () => {
    // Check if any editor is open
    if (
      showStepContentEditor ||
      notesEditor.showEditor ||
      decisionEditor.showEditor ||
      questionEditor.showEditor ||
      mediaEditor.showEditor ||
      fileEditor.showEditor ||
      planDActionEditor.showEditor
    ) {
      return;
    }
    if (
      meetingData?.status !== "in_progress" &&
      meetingData?.status !== "to_finish"
    ) {
      return;
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
      const response = await axios.get(
        `${API_BASE_URL}/get-meeting/${meetId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
      );
      if (response.status) {
        const meetingData = response.data?.data;
        if (meetingData?.prise_de_notes === "Automatic") {
          setIsAutomatic(true);
        } else {
          setIsAutomatic(false);
        }

        setPreviousSteps(meetingData?.steps);
        setStepNotes(meetingData?.steps?.map((step) => step?.note));
        setDecision(meetingData?.steps?.map((step) => step?.decision));
        setStepData(meetingData?.steps);
        setTableData(meetingData?.plan_d_actions || []);
        setMeetingData(meetingData);
        // if (setContextMeetingData) {
        //   setContextMeetingData(meetingData);
        // }
        // setEmailCampaign(meetingData?.email_campaigns);

        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );

          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
        }

        return meetingData;
      }
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (
      meetingData &&
      (meetingData?.status === "in_progress" ||
        meetingData?.status === "to_finish")
    ) {
      const intervalId = setInterval(() => {
        if (
          !showStepContentEditor &&
          !notesEditor.showEditor &&
          !decisionEditor.showEditor &&
          !fileEditor.showEditor &&
          !questionEditor.showEditor &&
          !mediaEditor.showEditor &&
          !planDActionEditor.showEditor
        ) {
          getMeeting();
        }
      }, 30000); // 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [
    meetingData,
    meetId,
    isModalOpen,
    showStepContentEditor,
    notesEditor.showEditor,
    decisionEditor.showEditor,
    fileEditor.showEditor,
    planDActionEditor.showEditor,
    questionEditor.showEditor,
    mediaEditor.showEditor,
  ]);

  useEffect(() => {
    if (meetingData) {
      let index = meetingData?.steps.findIndex(
        (step) => step?.step_status === "in_progress",
      );

      let index2 = meetingData?.steps.findIndex(
        (step) => step?.step_status == "to_finish",
      );
      if (index2 !== -1) {
        setCurrentStepIndex(index2);
      } else if (index !== -1) {
        setCurrentStepIndex(index);
      }
      if (meetingData?.prise_de_notes === "Automatic") {
        setIsAutomatic(true);
      } else {
        setIsAutomatic(false);
      }
    }
  }, [meetingData]);

  useEffect(() => {
    // if (currentStepIndex !== -1) {
      if (meetingData?.presentation === true) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    // }
  }, [meetingData?.presentation]);

  // useEffect(() => {
  //   const initiateRecording = async () => {
  //     if (
  //       meetingData?.prise_de_notes === "Automatic" &&
  //       meetingData?.status === "in_progress" &&
  //       meetingData?.location === nul
  //     ) {
  //       const hasPermission = await startRecording();
  //       if (!hasPermission) {
  //         setLoading(false);
  //         return; // Stop if recording didn't start
  //       }
  //     }
  //   };

  //   initiateRecording();
  // }, []);

  // Helper: Detect mobile device
  const isMobileDevice = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth <= 768
    ); // Optional: fallback for small screens
  };
  const handleStartRecording = async () => {
    try {
      // const success = await startRecording();
      // if (!success) {
      //   setErrorMessage("Unknown error starting recording.");
      //   setShowErrorModal(true);
      // }

      const success = await startRecording();

      if (success) {
        // Recording started successfully
        if (meetingData?.meet_link) {
          window.open(meetingData.meet_link, "_blank"); // Open meeting link in new tab
        }
      } else {
        setErrorMessage("Unknown error starting recording.");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to start recording.");
      setShowErrorModal(true);
    }
  };

  const handleRetry = async () => {
    setShowErrorModal(false);
    handleStartRecording();
  };

  const starting = async () => {
    if (meetingData?.audio_shared) {
      if (meetingData?.meet_link) {
        window.open(meetingData.meet_link, "_blank");
      }
    } else {
      // Only show popup on non-mobile
      if (!isMobileDevice()) {
        setShowConfirmationPopup(true);
      } else {
        // On mobile: skip popup and go straight to recording
        await initiateRecording();
      }
    }
  };

  // 1. Check if we should initiate recording
  useEffect(() => {
    if (
      meetingData?.prise_de_notes === "Automatic" &&
      meetingData?.status === "in_progress" &&
      meetingData?.location === null &&
      meetingData?.audio_shared === false
    ) {
      if (!isMobileDevice()) {
        // Show popup only on desktop/tablet
        setShowConfirmationPopup(true);
      } else {
        // Auto-start recording on mobile without popup
        initiateRecording();
      }
    }
  }, []); // Don't forget dependencies!

  const [recordingStart, setRecordingStart] = useState(false);
  const initiateRecording = async () => {
    setShowConfirmationPopup(false); // Close confirmation popup
    setLoading(true);
    setRecordingStart(false);

    try {
      // Try to update audio_shared status but don't block if it fails
      try {
        const payload = {
          audio_shared: true,
        };

        await axios.post(
          `${API_BASE_URL}/meeting-audio-shared/${meetingData?.id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json", // Changed from multipart/form-data since we're sending JSON
              // 'Authorization': `Bearer ${token}`,
            },
          },
        );
      } catch (apiError) {
        console.warn(
          "Failed to update audio shared status, continuing anyway:",
          apiError,
        );
        setRecordingStart(false);
        // Continue with recording despite API failure
      }

      // Proceed with recording regardless of API success
      const hasPermission = await startRecording();

      if (hasPermission) {
        if (meetingData?.meet_link) {
          window.open(meetingData.meet_link, "_blank");
        }
        setRecordingStart(true);
      } else {
        setLoading(false);
        setErrorMessage("Recording permission denied");
        setShowErrorModal(true);
        setRecordingStart(false);
      }
    } catch (recordingError) {
      setLoading(false);
      setErrorMessage(recordingError.message || "Recording failed");
      setShowErrorModal(true);
      setRecordingStart(false);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) {
      return false;
    }
    if (url.includes("youtube.com/watch")) {
      const videoUrl = new URL(url);
      const videoId = videoUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handle the shortened YouTube URL (youtu.be)
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return false; // Return false if it's not a valid YouTube URL
  };
  const sanitizeContent = (content) => {
    if (!content) return null;

    const sanitizedContent = DOMPurify.sanitize(content, {
      ADD_TAGS: [
        "table",
        "tr",
        "td",
        "th",
        "tbody",
        "thead",
        "tfoot",
        "caption",
        "iframe",
      ],
      ADD_ATTR: [
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "src",
        "title",
        "style",
      ],
    });

    // Create a temporary div to hold the sanitized HTML and parse it
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = sanitizedContent;

    // Find all iframe tags within the content
    const iframes = tempDiv.querySelectorAll("iframe");

    // Replace each iframe tag with a link while preserving its surrounding structure
    iframes.forEach((iframe) => {
      const iframeSrc = iframe.getAttribute("src");

      if (iframeSrc) {
        const linkElement = document.createElement("a");
        linkElement.href = iframeSrc;
        linkElement.target = "_blank";

        // Create a more user-friendly link text (optional improvement)
        // linkElement.textContent = `Click here to view the content`;
        linkElement.textContent = iframeSrc;

        // Apply the truncation class to the link element
        linkElement.classList.add("truncated-link");
        // Replace iframe with the link while keeping it inside the parent tag (e.g., table, td)
        iframe.parentNode.replaceChild(linkElement, iframe);
      }
    });

    // Return the updated HTML as a string
    return tempDiv.innerHTML;
  };
  const rawContent =
    meetingData?.steps &&
    Array.isArray(meetingData?.steps) &&
    meetingData?.steps[currentStepIndex] &&
    meetingData?.steps[currentStepIndex]?.editor_content
      ? meetingData?.steps[currentStepIndex].editor_content
      : " ";
  const sanitizedContent = sanitizeContent(rawContent);

  const GradientSvg = (
    <svg height="0px">
      <defs>
        <linearGradient id="your-unique-id" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#F2E358" />
          <stop offset="90%" stopColor="#CB690F" />
        </linearGradient>
      </defs>
    </svg>
  );
  const GradientSvg2 = (
    <svg height="0px">
      <defs>
        <linearGradient id="your-unique-id2" x1="1" y1="0" x2="1" y2="1">
          <stop offset="20%" stopColor="#F25861" />
          <stop offset="90%" stopColor="#CB0F1A" />
        </linearGradient>
      </defs>
    </svg>
  );
  const GradientSvg3 = (
    <svg height="0px">
      <defs>
        <linearGradient id="your-unique-id1" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#CB0C17" />
          <stop offset="90%" stopColor="#5AAFD6" />
        </linearGradient>
      </defs>
    </svg>
  );

  const sanitizeContent1 = (html) => {
    if (!html) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Find all iframe elements
    const iframes = doc.querySelectorAll("iframe");

    iframes.forEach((iframe) => {
      const src = iframe.getAttribute("src");
      if (src) {
        // Replace iframe with a link to the source
        const link = doc.createElement("a");
        link.href = src;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `${src}`;

        iframe.replaceWith(link);
      }
    });

    return doc.body.innerHTML;
  };

  const sanitizeIframeContent = (content) => {
    if (!content) return null;
    return content.replace(
      /<iframe.*?src="(.*?)".*?<\/iframe>/gi,
      (match, src) => {
        return `<a href="${src}" target="_blank" rel="noopener noreferrer">${src}</a>`;
      },
    );
  };
  // Toggles
  const [iFrameLoad, setIFrameLoad] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [stepNotes, setStepNotes] = useState([]);
  // const [decision, setDecision] = useState([]);
  const [stepData, setStepData] = useState([]);

  const [showNewDecisionModal, setShowNewDecisionModal] = useState(false);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);

  // Add a new decision for the current step
  const addDecisionForStep = (stepIndex) => {
    const updated = [...decision];
    if (!updated[stepIndex]) updated[stepIndex] = [];
    updated[stepIndex].push({
      decision_type: "",
      decision: "",
      creation_date: "",
      creation_time: "",
      milestone_date: "",
      budget_amount: "",
      currency: "EUR",
      decision_apply: "",
    });
    setDecision(updated);
    setCurrentDecisionIndex(updated[stepIndex].length - 1); // set last added
    setShowNewDecisionModal(true);
  };

  // Handle select changes
  const handleSelectChange = (selectedOption, field, decisionIndex) => {
    const updatedDecision = [...decision];
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: userTimeZone,
    });
    const [date, time] = currentDateTime?.split(", ");

    if (!updatedDecision[currentStepIndex]) {
      updatedDecision[currentStepIndex] = [];
    }

    const existingDecision =
      updatedDecision[currentStepIndex][decisionIndex] || {};

    updatedDecision[currentStepIndex][decisionIndex] = {
      ...existingDecision,
      [field]: selectedOption.value,
      creation_date: new Date().toISOString().split("T")[0],
      creation_time: time,
    };

    setDecision(updatedDecision);
  };

  // Handle text changes
  const handleTextChange = (event, decisionIndex) => {
    const updatedDecision = [...decision];
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: userTimeZone,
    });
    const [date, time] = currentDateTime?.split(", ");

    if (!updatedDecision[currentStepIndex]) {
      updatedDecision[currentStepIndex] = [];
    }

    const existingDecision =
      updatedDecision[currentStepIndex][decisionIndex] || {};

    updatedDecision[currentStepIndex][decisionIndex] = {
      ...existingDecision,
      decision: event.target.value,
      creation_date: new Date().toISOString().split("T")[0],
      creation_time: time,
    };

    setDecision(updatedDecision);
  };

  const closeDecisionModal = () => {
    setDecision((prev) => {
      const updatedDecision = [...prev];

      if (updatedDecision[currentStepIndex]) {
        const filteredDecisions = updatedDecision[currentStepIndex].filter(
          (d) => {
            // Check if all meaningful fields are empty
            return Object.entries(d).some(
              ([key, value]) =>
                value !== null && value !== undefined && value !== "",
            );
          },
        );

        updatedDecision[currentStepIndex] = filteredDecisions;
      }

      return updatedDecision;
    });

    setShowNewDecisionModal(false); // Close the modal
  };

  const userTeams =
    (meetingData && meetingData?.steps[currentStepIndex]?.user_teams) || [];

  // Dynamically map `userTeams` to the required format
  const teamOptions = userTeams.map((team) => ({
    value: team.team_name, // Use the team_name from the user_teams array
    label: team.team_name, // Same for the label
  }));

  // Combine the static options (Enterprise, Private) with the dynamic options
  const combinedOptions = [
    { value: "Enterprise", label: "Enterprise" },
    { value: "Private", label: "Private" },
    ...teamOptions, // Append dynamic team options here
  ];

  const [clickedToggle, setClickedToggle] = useState(false);
  const [stepNoteEditor, setStepEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [show, setShow] = useState({
    value: "",
    showEditor: false,
  });
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [previousSteps, setPreviousSteps] = useState([]);
  const [myStepNoteId, setMyStepNoteId] = useState(null);
  const [editorContent, setEditorContent] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const handleShowSignUp = () => {
    setShowSignUp(true);
  };
  const handleCloseSignUp = () => setShowSignUp(false);

  // ================>TEXT EDITORS TOGGLE FUNCTIONS: <====================
  const handleDecisionEditorToggle = () => {
    setClickedToggle((prev) => !prev);
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open

    setDecisionEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
    setShowStepContentEditor(false);
  };

  const handleFileEditor = () => {
    setClickedToggle((prev) => !prev);
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open

    setShowStepContentEditor(false);

    setFileEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
  };

  const handleQuestionEditor = () => {
    setClickedToggle((prev) => !prev);
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShowStepContentEditor(false);

    setQuestionEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
  };

  const handleMediaEditor = () => {
    setClickedToggle((prev) => !prev);
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShowStepContentEditor(false);

    setMediaEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
  };

  const [uploadedMedia, setUploadedMedia] = useState([]); // Local preview (only during upload)
  const [serverMedia, setServerMedia] = useState([]); // Real media from server
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false); // For GET
  const [deletingIndex, setDeletingIndex] = useState(null);

  useEffect(() => {
    if (!mediaEditor.showEditor) {
      setServerMedia([]);
      return;
    }

    const fetchServerMedia = async () => {
      setMediaLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/step-media/${meetingData?.steps[currentStepIndex]?.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        setServerMedia(res?.data?.data?.media || []);
      } catch (err) {
        console.error("Failed to load media:", err);
        toast.error(t("Failed to load uploaded media"));
      } finally {
        setMediaLoading(false);
      }
    };

    fetchServerMedia();
  }, [mediaEditor.showEditor, currentStepIndex]);

  const handleMediaUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setUploadedMedia(fileArray);
    setIsUploadingMedia(true);
    setUploadProgress(0);

    const formData = new FormData();
    fileArray.forEach((file, i) => formData.append(`media[${i}]`, file));
    formData.append("step_id", meetingData?.steps[currentStepIndex]?.id);

    try {
      await axios.post(`${API_BASE_URL}/add-media-to-step`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });

      toast.success(t("Media uploaded successfully!"));
      setUploadedMedia([]); // Clear preview

      // Refresh from server
      const res = await axios.get(
        `${API_BASE_URL}/step-media/${meetingData?.steps[currentStepIndex]?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      setServerMedia(res?.data?.data?.media || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t("Upload failed"));
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [progress1, setProgress1] = useState(0);
  const [value, setValue] = useState("");
  const [selectedAI, setSelectedAI] = useState("mistral");
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [isAutomaticPrompt, setIsAutomaticPrompt] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);
  const loggedInUserId = CookieService.get("user_id");
  const APIKEY = process.env.REACT_APP_TINYMCE_API;

  const AUTOMATIC_PROMPT_TEXT = `Please create a detailed summary report based on the provided information, strictly following the 12-chapter structure listed below:<br><br>
1. GÉNÉRALITÉS<br>
2. POINT MOA<br>
3. POINT HYGIÈNE ET SÉCURITÉ<br>
4. POINT ÉTUDES<br>
5. POINT CONTRÔLEUR TECHNIQUE<br>
6. POINT TRAVAUX<br>
7. POINT PROJETS EN INTERFACE<br>
8. POINT QUALITÉ<br>
9. POINT AVANCEMENT<br>
10. POINT CONCESSIONNAIRES<br>
11. POINT ADMINISTRATIF<br>
12. REPORTAGE PHOTOGRAPHIQUE<br><br>
Please categorize the relevant details into their corresponding sections.`;

  const handleValidate = async (prompt_action) => {
    setLoading1(true);
    setProgress1(0);

    const progressInterval = setInterval(() => {
      setProgress1((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    const apiEndpoint = `${API_BASE_URL}/meeting-prompt-action`;

    const payload = {
      meeting_id: meetId,
      ai_medium: selectedAI,
      instruction: value,
      is_report_prompt_enabled: isAutomaticPrompt ? 1 : 0,
      prompt_action: prompt_action,
    };

    try {
      const response = await axios.post(apiEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      clearInterval(progressInterval);
      setProgress1(100);

      setTimeout(async () => {
        setLoading1(false);
        if (response?.status === 200 || response?.status === 201) {
          setShowInstructionModal(false);
          setValue("");
          if (pendingCloseAction) {
            await pendingCloseAction();
          }
        }
      }, 300);
    } catch (error) {
      console.error("API Error:", error);
      clearInterval(progressInterval);
      setProgress1(100);
      setTimeout(() => {
        setLoading1(false);
      }, 300);
    }
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (showInstructionModal && loggedInUserId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/users/${loggedInUserId}`,
            {
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );

          if (response?.status === 200) {
            const userData = response.data?.data;
            const isEnabled =
              userData?.is_report_prompt_enabled === 1 ||
              userData?.is_report_prompt_enabled === true;
            setIsAutomaticPrompt(isEnabled);
            if (isEnabled) {
              setValue(userData?.report_prompt);
            }
          }
        } catch (error) {
          console.error("Error fetching user settings for prompt:", error);
        }
      }
    };

    fetchUserSettings();
  }, [showInstructionModal, loggedInUserId]);

  const removeMedia = async (index) => {
    if (!window.confirm(t("Delete this media permanently?"))) return;

    const mediaToDelete = serverMedia[index];
    setDeletingIndex(index);

    try {
      await axios.delete(`${API_BASE_URL}/delete-media/${mediaToDelete.id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      setServerMedia((prev) => prev.filter((_, i) => i !== index));
      toast.success("Média supprimé avec succès !");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Échec de la suppression. Réessayez.",
      );
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleNotesEditorToggle = () => {
    setClickedToggle((prev) => !prev);
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the step editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the all notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open

    setNotesEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
    setShowStepContentEditor(false);
  };

  // Function to handle eye button click
  const handlePlanDActionEditor = () => {
    setClickedToggle((prev) => !prev);
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false }));
    setNotesEditor((prev) => ({ ...prev, showEditor: false }));
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close step notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the all notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open

    setPlanDActionEditor((prev) => ({
      ...prev,
      showEditor: !prev.showEditor,
    }));

    // If closing the editor, update entered data
    if (planDActionEditor.showEditor) {
      const enteredDataString = tableData?.map((rowData) => ({
        action: rowData.action,
        action_days: rowData.action_days,
      }));
      // setEnteredData(enteredDataString);
    }
    setShowStepContentEditor(false);
  };
  const handleTableDataChange = (e, index) => {
    const { name, value } = e.target;
    setTableData((prevTableData) =>
      prevTableData?.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              [name]: value,
              // participant_id: newArray,
              step_id: meetingData?.steps[currentStepIndex].id,
              status: "Todo",
            }
          : rowData,
      ),
    );
  };

  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const handleButtonClose = () => {
    setShowStrategyModal(false);
    setEditingStrategy(null);
    setTableData([]);
  };
  const handleButtonClick = () => {
    setShowStrategyModal(true);
    if (Array.isArray(tableData) && tableData.length > 0) {
      setTableData([
        ...tableData,
        {
          order: 1,
          action: "",
          action_days: 1,
          participant_id: "",
          step_id: meetingData?.steps[currentStepIndex].id,
          status: "Todo",
        },
      ]);
    } else {
      setTableData([
        {
          order: 1,
          action: "",
          action_days: 1,
          participant_id: "",
          step_id: meetingData?.steps[currentStepIndex].id,
          status: "Todo",
        },
      ]);
    }
  };

  const handleButtonDelete = async (index) => {
    const actionToBeDeleted = tableData[index];
    const id = actionToBeDeleted.id;
    //Send API Call only if the action is already saved in the database.
    const foundInDatabase = actionToBeDeleted.id; // If the action is already saved in the database, it will have an id.
    //----API CALL TO DELETE ACTION
    if (foundInDatabase) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/planDactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        console.clear();
      } catch (error) {
        console.log("error", error);
        return;
      }
    }

    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };
  const handleDeleteStrategy = async (strategy) => {
    const id = strategy?.id;

    if (id) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/planDactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error?.response?.data?.message || "server error");
      } finally {
        getMeetingById(); // Refresh the meeting data after deletion
      }
    }

    // Update tableData by filtering out the deleted strategy
    const updatedTableData = tableData.filter((item) => item.id !== id);
    setTableData(updatedTableData);
  };

  const handleIncrementCount = (index) => {
    setTableData((prevTableData) =>
      prevTableData.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              // action_days: Math.min(parseFloat(rowData.action_days) + 1, 5),
              action_days: Math.min(parseFloat(rowData.action_days) + 1, 100),
            }
          : rowData,
      ),
    );
  };

  const handleDecrementCount = (index) => {
    setTableData((prevTableData) =>
      prevTableData.map((rowData, i) =>
        i === index
          ? {
              ...rowData,
              action_days: Math.max(parseFloat(rowData.action_days) - 1, 0),
            }
          : rowData,
      ),
    );
  };

  const handleStepContentEditor = async () => {
    if (showStepContentEditor === true) {
      const optimizedEditorContent = optimizeEditorContent(
        meetingData?.steps[currentStepIndex]?.editor_content,
      );
      await saveEditorContent(optimizedEditorContent);
    }
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false }));
    setNotesEditor((prev) => ({ ...prev, showEditor: false }));
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false }));
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the step editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the all notes editor if it's open
    setMediaEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setQuestionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open

    setShowStepContentEditor((prev) => !prev);
  };
  const saveEditorContent = async (editorContent) => {
    const _OPTIMIZED_EDITOR_CONTENT =
      await optimizeEditorContent(editorContent);
    const stepId = meetingData?.steps[currentStepIndex]?.id;
    const URL = `${API_BASE_URL}/play-meetings/steps/${stepId}`;
    const postData = {
      ...meetingData?.steps[currentStepIndex],
      editor_content: _OPTIMIZED_EDITOR_CONTENT,
    };
    try {
      const token = CookieService.get("token");
      const response = await axios.post(URL, postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: ` Bearer ${token}`,
        },
      });
      if (response.status) {
        // toast.success(response.data?.message);
        toast.success("Content saved successfully");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const next = async () => {
    setIsLoadingNext(true);

    try {
      const currentStep = meetingData?.steps[currentStepIndex];
      const nextStep = meetingData?.steps[currentStepIndex + 1];
      const stepId = currentStep?.id;
      const myNextStepId = nextStep?.id;

      const optimizedEditorContent = await optimizeEditorContent(
        currentStep?.editor_content,
      );
      const currentTime = new Date();

      // User's time zone
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format dates and times
      const formattedEndDate = currentTime.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: userTimeZone,
      });
      const formattedEndTime = currentTime.toLocaleString("en-GB", {
        timeZone: userTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const formattedCurrentDate = currentTime.toISOString().split("T")[0];

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const postData = {
        ...currentStep,
        editor_content: optimizedEditorContent || null,
        savedTime:
          currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,
        negative_time:
          savedTime === 0
            ? negativeTimes[currentStepIndex] !== 0
              ? negativeTimes[currentStepIndex]
              : 0
            : 0,
        totaldecision: decision.join(" "),
        totalstepnotes: null,
        note: null,
        original_note: null,
        decision: decision[currentStepIndex] || [],
        actions: tableData || [],

        url: currentStep?.url || null,
        meeting_id: meetId,
        status: "completed",
        step_status: "completed",
        end_time: formattedEndTime,
        end_date: formattedEndDate,
        next_step_id: myNextStepId,
        delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
        real_time: formattedEndTime,
        real_date: formattedEndDate,
        pause_current_time: formattedTime,
        pause_current_date: formattedDate,
      };

      delete postData?.time_taken;

      const token = CookieService.get("token");

      // Post current step data
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status) {
        //   await getMeetingById();
        setTableData(response?.data?.data?.planDActions);

        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );

          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
        }
      }

      // Handle the next step
      if (nextStep) {
        const stepResponse = await axios.get(
          `${API_BASE_URL}/steps/${myNextStepId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (stepResponse.status) {
          const nextStepData = stepResponse.data.data;
          const payload = {
            ...nextStepData,
            step_status: "in_progress",
            current_time: nextStep.current_time || formattedEndTime,
            current_date: nextStep.current_date || formattedCurrentDate,
            real_time: formattedEndTime,
            real_date: formattedEndDate,
            pause_current_time: formattedTime,
            pause_current_date: formattedDate,
          };

          delete payload.time_taken;

          const nextStepResponse = await axios.post(
            `${API_BASE_URL}/play-meetings/steps/${myNextStepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (nextStepResponse.status) {
            //   await getMeetingById();
            const nextEstimateTime =
              nextStepResponse?.data?.data?.estimate_time;
            if (nextEstimateTime) {
              const [date, timeWithMilliseconds] = nextEstimateTime.split("T");
              const timeOnly = timeWithMilliseconds.split(".")[0];
              const formattedTime = timeOnly.slice(0, 5).replace(":", "h");

              setEstimateTime(formattedTime);
              setEstimateDate(date);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in next step processing:", error);
    } finally {
      setIsLoadingNext(false);
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
      setShow((prev) => ({ ...prev, showEditor: false }));
      setNextActiveStep();
      await getMeetingById();
    }
  };

  // useEffect(() => {
  //   let timer;
  //   if (showProgressBar) {
  //     timer = setInterval(() => {
  //       setProgress((prevProgress) =>
  //         prevProgress >= 100 ? 100 : prevProgress + 1
  //       );
  //     }, 100);
  //   }
  //   return () => clearInterval(timer);
  // }, [showProgressBar]);

  const saveEndData = async () => {
    setIsLoading(true);
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep.id;

    const endTime = new Date();
    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert currentDateTime to a string in the user's local time zone
    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    // Format end_date to dd/mm/yyyy
    const formatEndDate = (date) => {
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    };
    const currentTime = new Date();

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    // ..
    const formattedEndDate = formatEndDate(endTime);
    const postData = {
      ...currentStep,
      savedTime: savedTime != 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      totalstepnotes: null,
      note: null,
      original_note: null,
      decision: decision[currentStepIndex] || [],
      actions: tableData ? tableData : [],
      meeting_id: meetId,
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      status: "completed",
      step_status: "completed",
      end_time: localEndTime,
      end_date: formattedEndDate,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: formattedTime,
      pause_current_date: formattedDate,
    };

    try {
      const token = CookieService.get("token");
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ` Bearer ${token}`,
          },
        },
      );
      if (response.status) {
        return response?.data?.data;
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    }
  };

  //auto notes functionality
  const finalizeClose = async () => {
    setIsLoading(true);
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep.id;

    const responseNotes = await saveEndData();
    setIsLoading(true);

    let updatedStepData = [...meetingData?.steps];
    updatedStepData[updatedStepData.length - 1] = responseNotes;

    CookieService.set("lastURL", "/play");

    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);
    let endHour = hour + 1;
    if (endHour >= 24) {
      endHour -= 24;
    }
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`;

    const {
      prompt_action,
      temporary_prompt,
      use_temporary_prompt,
      ...cleanedMeetingData
    } = meetingData || {};

    const updatedDatWithClosingTime = {
      ...cleanedMeetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      timezone: userTimeZone,
      plan_d_actions: tableData ? tableData : [],
      steps: updatedStepData?.map(({ assigned_to, ...step }) => ({
        ...step,
        step_status: "completed",
        status: "completed",
      })),
      step_decisions: decision.filter((decision) => decision != ""),
      end_time: endTimeStr,
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [],
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/public-meetings-update/${meetId}`,
        updatedDatWithClosingTime,
      );
      if (response.status) {
        const steps = response?.data?.data?.steps;
        setStepData(steps);
      }
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(true);
    const realEndTime = moment().format("HH:mm:ss");

    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${meetId}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        setIsLoading(false);
        setIsModalOpen(false);
        await getMeetingById();
        stopRecording();
        setIsLoading(false);
        if (data?.plan_d_actions?.length > 0) {
          createStrategyMoment(data, t);
        }
      }
    } catch (error) {
      console.log("error ", error);
      setIsLoading(false);
    }
  };

  const close = async () => {
    const invalidActions = tableData?.filter((action) => !action.action);
    if (invalidActions?.length > 0) {
      toast.error(t("Please fill in all required fields in actions."));
      return;
    }

    if (meetingData?.automatic_instruction) {
      setPendingCloseAction(() => finalizeClose);
      setShowInstructionModal(true);
      return;
    }
    await finalizeClose();
  };
  const finalizeCloseEarly = async () => {
    setIsLoading(true);
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep.id;

    const responseNotes = await saveEndData();
    let updatedStepData = [...meetingData?.steps];
    updatedStepData[currentStepIndex] = responseNotes;

    CookieService.set("lastURL", "/play");

    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);
    let endHour = hour + 1;
    if (endHour >= 24) {
      endHour -= 24;
    }
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`;

    const {
      prompt_action,
      temporary_prompt,
      use_temporary_prompt,
      ...cleanedMeetingData
    } = meetingData || {};

    const updatedDatWithClosingTime = {
      ...cleanedMeetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      timezone: userTimeZone,
      plan_d_actions: tableData ? tableData : [],
      steps: updatedStepData?.map(({ assigned_to, ...step }) => ({
        ...step,
        step_status: "completed",
        status: "completed",
      })),
      step_decisions: decision.filter((decision) => decision != ""),
      end_time: endTimeStr,
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [],
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/public-meetings-update/${meetId}`,
        updatedDatWithClosingTime,
      );
      if (response.status) {
        const steps = response?.data?.data?.steps;
        setStepData(steps);
      }
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(true);
    const realEndTime = moment().format("HH:mm:ss");

    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${meetId}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        setIsLoading(false);
        setIsModalOpen(false);
        setShowTimerModal(false);
        await getMeetingById();
        stopRecording();
        if (data?.plan_d_actions?.length > 0) {
          createStrategyMoment(data, t);
        }
      }
    } catch (error) {
      console.log("error ", error);
      setIsLoading(false);
    }
  };

  const closeEarly = async () => {
    const invalidActions = tableData?.filter((action) => !action.action);
    if (invalidActions?.length > 0) {
      toast.error(t("Please fill in all required fields in actions."));
      return;
    }
    if (meetingData?.automatic_instruction) {
      setPendingCloseAction(() => finalizeCloseEarly);
      setShowInstructionModal(true);
      return;
    }
    await finalizeCloseEarly();
  };

  const [isPause, setIsPause] = useState(false);
  //-------------------------------Pause Step
  const handlePauseStep = async () => {
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
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep?.id;

    setIsPause(true);
    try {
      const payload = {
        step_status: "to_finish",
        status: "to_finish",
        step_id: parseInt(stepId),
        pause_current_time: formattedCurrentTime,
        pause_current_date: formattedCurrentDate,
      };
      const response = await axios.post(
        `${API_BASE_URL}/make-step-pause?pause_current_time=${formattedCurrentTime}&pause_current_date=${formattedCurrentDate}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status) {
        await getMeetingByIdWithCalculation();
        // window.location.reload();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || "server error");
    } finally {
      setIsPause(false);
    }
  };
  const [isNext, setIsNext] = useState(false);

  const handlenextPage = async (val) => {
    if (meetingData && currentStepIndex < meetingData?.steps?.length - 1) {
      setIsNext(true);
      // handlePlayPause(currentStepIndex, false);

      const currentStep = meetingData?.steps[currentStepIndex];
      const nextStep = meetingData?.steps[currentStepIndex + 1];
      const stepId = currentStep?.id;
      const myNextStepId = nextStep?.id;

      const optimizedEditorContent = await optimizeEditorContent(
        currentStep?.editor_content,
      );
      const endTime = new Date();
      const currentTime = new Date();
      const formattedCurrentDate = currentTime.toISOString().split("T")[0];

      // Get the user's time zone
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Convert endTime to a date string in the format "4/8/2024"
      const formattedEndDate = endTime.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: userTimeZone,
      });

      // Convert currentDateTime to a string in the user's local time zone
      const localEndTime = endTime.toLocaleString("en-GB", {
        timeZone: userTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      const postData = {
        ...currentStep,
        editor_content: optimizedEditorContent || "",
        savedTime:
          currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,
        negative_time:
          savedTime === 0
            ? negativeTimes[activeStepIndex] !== 0
              ? negativeTimes[activeStepIndex]
              : 0
            : 0,

        step_status: "completed",
        totalstepnotes: stepNotes[currentStepIndex],
        totaldecision: decision.join(" "),
        note: stepNotes[currentStepIndex],
        original_note: stepNotes[currentStepIndex],
        status: "completed",
        url: meetingData?.steps[currentStepIndex].url
          ? meetingData?.steps[currentStepIndex].url
          : null,
        meeting_id: meetId,
        decision: decision[currentStepIndex] || [],
        actions: tableData ? tableData : [],
        end_time: localEndTime,
        end_date: formattedEndDate,
        next_step_id: myNextStepId,
        delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
        real_time: localEndTime,
        real_date: formattedEndDate,
        pause_current_time: formattedTime,
        pause_current_date: formattedDate,
      };
      delete postData.time_taken;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
          postData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status) {
          setTableData(response.data?.data?.planDActions); // Set
          const estimate_time = response?.data?.data?.estimate_time;
          const type = response?.data?.data?.type;
          const timezone = response?.data?.data?.timezone;
          if (estimate_time) {
            const formattedDateTime = parseAndFormatDateTime(
              estimate_time,
              type,
              timezone,
            );
            setEstimateTime(formattedDateTime.formattedTime);
            setEstimateDate(formattedDateTime.formattedDate);
          }
        }
      } catch (error) {
        // toast.error(error.response?.data?.message);
      }

      try {
        const nextStepId = nextStep.id;
        const stepResponse = await axios.get(
          `${API_BASE_URL}/steps/${nextStepId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );

        if (stepResponse.status) {
          const nextStepData = stepResponse.data.data;
          const payload = {
            ...nextStepData,
            step_status: "in_progress",
            current_time: nextStep.current_time
              ? nextStep.current_time
              : localEndTime,
            current_date: nextStep.current_date
              ? nextStep.current_date
              : formattedCurrentDate,
            real_time: localEndTime,
            real_date: formattedEndDate,
            pause_current_time: formattedTime,
            pause_current_date: formattedDate,
          };

          delete payload.time_taken;

          // Make the second API call with the retrieved step data
          const response = await axios.post(
            `${API_BASE_URL}/play-meetings/steps/${nextStepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );

          if (response.status) {
            const step = response?.data?.data;
            // Additional logic for handling the response
            // await getMeetingById();
            const estimate_time = response?.data?.data?.estimate_time;
            const type = response?.data?.data?.type;
            const timezone = response?.data?.data?.timezone;
            if (estimate_time) {
              const formattedDateTime = parseAndFormatDateTime(
                estimate_time,
                type,
                timezone,
              );

              setEstimateTime(formattedDateTime.formattedTime);
              setEstimateDate(formattedDateTime.formattedDate);
            }
          }
        }
      } catch (error) {
        console.log("Error updating next step status:", error);
      }
      setIsNext(false);
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
      setShow((prev) => ({ ...prev, showEditor: false })); // Close the showEditor
      setNextActiveStep();
      await getMeetingById();
    }
    return;
  };

  const [isPrevious, setIsPrevious] = useState(false);

  const previousStep = async () => {
    if (meetingData && currentStepIndex > 0) {
      setIsPrevious(true);

      const currentStep = meetingData?.steps[currentStepIndex];
      const previousStep = meetingData?.steps[currentStepIndex - 1];

      const currentStepId = currentStep?.id;
      const previousStepId = previousStep?.id;

      const currentTime = new Date();
      const formattedCurrentDate = currentTime.toISOString().split("T")[0];

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const realTime = formatTime(timeInUserZone);
      const realDate = formatDate(timeInUserZone);
      const formattedDate = currentTime.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: userTimeZone,
      });
      const formattedTime = currentTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: userTimeZone,
      });

      try {
        // 1. Update current step to "to_finish"
        const toFinishPayload = {
          ...currentStep,
          step_status: "to_finish",
          status: "to_finish",
          real_time: formattedTime,
          real_date: formattedDate,
          pause_current_time: realTime,
          pause_current_date: realDate,
        };
        delete toFinishPayload.time_taken;

        await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${currentStepId}/step-note-and-action?current_time=${realTime}&current_date=${realDate}&pause_current_time=${realTime}&pause_current_date=${realDate}`,
          toFinishPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );

        // 2. Update previous step to "in_progress"
        const prevStepResponse = await axios.get(
          `${API_BASE_URL}/steps/${previousStepId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );

        if (prevStepResponse.status) {
          const prevStepData = prevStepResponse.data.data;
          const prevPayload = {
            ...prevStepData,
            step_status: "in_progress",
            status: "in_progress",
            current_time: previousStep.current_time || formattedTime,
            current_date: previousStep.current_date || formattedCurrentDate,
            real_time: formattedTime,
            real_date: formattedDate,
            end_time: null,
            end_date: null,
            pause_current_time: realTime,
            pause_current_date: realDate,
          };
          delete prevPayload.time_taken;

          await axios.post(
            `${API_BASE_URL}/play-meetings/steps/${previousStepId}/step-note-and-action?current_time=${realTime}&current_date=${realDate}&pause_current_time=${realTime}&pause_current_date=${realDate}`,
            prevPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );
        }

        setCurrentStepIndex((prevIndex) => prevIndex - 1);
        setShow((prev) => ({ ...prev, showEditor: false })); // Close the showEditor
        setPreviousActiveStep();
        await getMeetingById();
      } catch (error) {
        console.log("Error while going to previous step:", error);
      } finally {
        setIsPrevious(false);
      }
    }
  };

  const [saveDecision, setSaveDecision] = useState(false);
  const [saveStrategy, setSaveStrategy] = useState(false);
  const saveNewDecision = async (val) => {
    setIsNext(true);
    setSaveDecision(true);
    // handlePlayPause(currentStepIndex, false);

    const currentStep = meetingData?.steps[currentStepIndex];
    const nextStep = meetingData?.steps[currentStepIndex + 1];
    const stepId = currentStep?.id;
    const myNextStepId = nextStep?.id;

    const optimizedEditorContent = await optimizeEditorContent(
      currentStep?.editor_content,
    );
    const endTime = new Date();
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toISOString().split("T")[0];

    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert endTime to a date string in the format "4/8/2024"
    const formattedEndDate = endTime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: userTimeZone,
    });

    // Convert currentDateTime to a string in the user's local time zone
    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const currentStepDecisions = decision[currentStepIndex] || [];

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    // let isValid = true;
    // let errorMessage = "";

    // // Validate each decision entry based on its type
    // for (let i = 0; i < currentStepDecisions.length; i++) {
    //   const d = currentStepDecisions[i];
    //   const type = d?.decision_type?.trim();

    //   if (!type) {
    //     isValid = false;
    //     errorMessage = `Decision type is required for decision ${i + 1}`;
    //     break;
    //   }

    //   if (type === "milestone") {
    //     if (!d?.milestone_date?.trim() || !d?.decision_apply?.trim()) {
    //       isValid = false;
    //       errorMessage = `Milestone Date and Decision Apply are required for Milestone decision ${
    //         i + 1
    //       }`;
    //       break;
    //     }
    //   }

    //   if (type === "budget") {
    //     if (!d?.budget_amount?.toString().trim()) {
    //       isValid = false;
    //       errorMessage = `Budget Amount is required for Budget decision ${
    //         i + 1
    //       }`;
    //       break;
    //     }
    //   }

    //   if (type === "rule") {
    //     if (!d?.decision?.trim() || !d?.decision_apply?.trim()) {
    //       isValid = false;
    //       errorMessage = `Decision and Decision Apply are required for Rule decision ${
    //         i + 1
    //       }`;
    //       break;
    //     }
    //   }
    // }

    // // If validation fails, show toast and stop the process
    // if (!isValid) {
    //   toast.error(errorMessage);
    //   setSaveDecision(false);

    //   return;
    // }

    // 🔥 Clean empty decisions (but don't show error)
    const cleanedDecision = (decision[currentStepIndex] || []).filter((d) => {
      return Object.entries(d).some(([key, value]) => {
        if (key === "currency") return false;
        return (
          value !== null &&
          value !== undefined &&
          value.toString().trim() !== ""
        );
      });
    });

    const postData = {
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,

      totalstepnotes: stepNotes[currentStepIndex],
      totaldecision: decision.join(" "),
      note: stepNotes[currentStepIndex],
      original_note: stepNotes[currentStepIndex],
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      meeting_id: meetId,
      decision: cleanedDecision,

      actions: tableData ? tableData : [],
      end_time: localEndTime,
      next_step_id: myNextStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: formattedTime,
      pause_current_date: formattedDate,
    };
    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        setTableData(response.data?.data?.planDActions); // Set
        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );

          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
          setSaveDecision(false);
        }
      }
    } catch (error) {
      // toast.error(error.response?.data?.message);
      setSaveDecision(false);
    }

    setIsNext(false);
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the

    // Reset the decision fields
    const updatedDecision = [...decision];
    updatedDecision[activeStepIndex][currentDecisionIndex] = {
      decision_type: "",
      decision: "",
      creation_date: "",
      creation_time: "",
      milestone_date: "",
      budget_amount: "",
      currency: "",
      decision_apply: "",
    };

    setDecision(updatedDecision);

    // Close the modal
    setShowNewDecisionModal(false);
    setSaveDecision(false);

    await getMeetingById();
  };

  const [editingStrategy, setEditingStrategy] = useState(null);

  const handleEditStrategy = (strategy) => {
    setEditingStrategy(strategy);
    setShowStrategyModal(true);
  };

  useEffect(() => {
    if (editingStrategy) {
      setTableData([
        {
          ...editingStrategy,
          step_id: meetingData?.steps[currentStepIndex]?.id,
        },
      ]);
    }
  }, [editingStrategy]);

  const saveNewStrategy = async (val) => {
    setIsNext(true);
    setSaveStrategy(true);

    const invalidActions = tableData?.filter((action) => !action.action);

    if (invalidActions.length > 0) {
      toast.error("Some actions are missing!");
      setSaveStrategy(false);
      setIsNext(false);
      return;
    }

    // handlePlayPause(currentStepIndex, false);

    const currentStep = meetingData?.steps[currentStepIndex];
    const nextStep = meetingData?.steps[currentStepIndex + 1];
    const stepId = currentStep?.id;
    const myNextStepId = nextStep?.id;

    const optimizedEditorContent = await optimizeEditorContent(
      currentStep?.editor_content,
    );
    const endTime = new Date();
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toISOString().split("T")[0];

    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert endTime to a date string in the format "4/8/2024"
    const formattedEndDate = endTime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: userTimeZone,
    });

    // Convert currentDateTime to a string in the user's local time zone
    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const currentStepDecisions = decision[currentStepIndex] || [];
    let isValid = true;
    let errorMessage = "";

    const postData = {
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,

      totalstepnotes: stepNotes[currentStepIndex],
      totaldecision: decision.join(" "),
      note: stepNotes[currentStepIndex],
      original_note: stepNotes[currentStepIndex],
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      meeting_id: meetId,
      actions: tableData ? tableData : [],
      end_time: localEndTime,
      next_step_id: myNextStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: formattedTime,
      pause_current_date: formattedDate,
    };
    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        setTableData(response.data?.data?.planDActions); // Set
        const estimate_time = response?.data?.data?.estimate_time;
        const type = response?.data?.data?.type;
        const timezone = response?.data?.data?.timezone;
        if (estimate_time) {
          const formattedDateTime = parseAndFormatDateTime(
            estimate_time,
            type,
            timezone,
          );
          setEstimateTime(formattedDateTime.formattedTime);
          setEstimateDate(formattedDateTime.formattedDate);
          setSaveStrategy(false);
        }
      }
    } catch (error) {
      setSaveStrategy(false);

      // toast.error(error.response?.data?.message);
    }

    setIsNext(false);
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the

    // Close the modal
    setShowStrategyModal(false);
    setTableData([]);
    await getMeetingById();
    return;
  };

  const saveDataonEnd = async (val) => {
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep.id;
    const endTime = new Date();

    const currentTime = new Date();
    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert currentDateTime to a string in the user's local time zone
    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const realTime = formatTime(timeInUserZone);
    const realDate = formatDate(timeInUserZone);

    // Format end_date to dd/mm/yyyy
    const formatEndDate = (date) => {
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    };
    const formattedEndDate = formatEndDate(endTime);
    const postData = {
      ...currentStep,
      savedTime: savedTime != 0 ? savedTime : 0,

      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      totalstepnotes: stepNotes[currentStepIndex],
      note: stepNotes[currentStepIndex],
      original_note: stepNotes[currentStepIndex],
      totaldecision: decision.join(" "),
      decision: decision[currentStepIndex] || [],
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      status: "active",
      step_status: "completed",
      meeting_id: meetId,
      actions: tableData ? tableData : [],
      end_time: localEndTime,
      end_date: formattedEndDate,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: realTime,
      pause_current_date: realDate,
    };

    try {
      const token = CookieService.get("token");
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${realTime}&current_date=${realDate}&pause_current_time=${realTime}&pause_current_date=${realDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: ` Bearer ${token}`,
          },
        },
      );
      if (response.status) {
        return response?.data?.data;
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message);
    }
  };
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const finalizeCloseMeeting = async () => {
    const responseNotes = await saveDataonEnd();
    let updatedStepData = [...meetingData?.steps];
    updatedStepData[updatedStepData.length - 1] = responseNotes;
    setIsLoading(true);
    CookieService.set("lastURL", "/play");
    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);
    let endHour = hour + 1;
    if (endHour >= 24) {
      endHour -= 24;
    }
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`;

    const updatedDatWithClosingTime = {
      ...meetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      plan_d_actions: tableData ? tableData : [],
      steps: updatedStepData?.map(({ assigned_to, ...step }) => ({
        ...step,
        step_status: "completed",
        status: "completed",
      })),
      step_decisions: decision.filter((decision) => decision != ""),
      end_time: endTimeStr,
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [],
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/public-meetings-update/${meetId}`,
        updatedDatWithClosingTime,
      );
    } catch (error) {}
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${meetId}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        setIsLoading(false);
        setIsModalOpen(false);
        getMeetingById();
        navigate(`/present/invite/${data?.id}`);

        if (data?.plan_d_actions?.length > 0) {
          createStrategyMoment(data, t);
        }
      }
    } catch (error) {
      console.log("error ", error);
      setIsLoading(false);
    }
  };

  const closeMeeting = async () => {
    const invalidActions = tableData?.filter((action) => !action.action);
    if (invalidActions?.length > 0) {
      toast.error(t("Please fill in all required fields in actions."));
      return;
    }

    if (meetingData?.automatic_instruction) {
      setPendingCloseAction(() => finalizeCloseMeeting);
      setShowInstructionModal(true);
      return;
    }
    await finalizeCloseMeeting();
  };
  const finalizeCloseEarlyMeeting = async () => {
    const responseNotes = await saveDataonEnd();
    let updatedStepData = [...meetingData?.steps];
    updatedStepData[currentStepIndex] = responseNotes;
    setIsLoading(true);
    CookieService.set("lastURL", "/play");
    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);
    let endHour = hour + 1;
    if (endHour >= 24) {
      endHour -= 24;
    }
    const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
      minute,
    ).padStart(2, "0")}`;

    const updatedDatWithClosingTime = {
      ...meetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      plan_d_actions: tableData ? tableData : [],
      steps: updatedStepData?.map(({ assigned_to, ...step }) => ({
        ...step,
        step_status: "completed",
        status: "completed",
      })),
      step_decisions: decision.filter((decision) => decision != ""),
      end_time: endTimeStr,
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [],
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/public-meetings-update/${meetId}`,
        updatedDatWithClosingTime,
      );
    } catch (error) {}
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${meetId}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        setIsLoading(false);
        setIsModalOpen(false);
        setShowTimerModal(false);
        getMeetingById();
        navigate(`/present/invite/${data?.id}`);

        if (data?.plan_d_actions?.length > 0) {
          createStrategyMoment(data, t);
        }
      }
    } catch (error) {
      console.log("error ", error);
      setIsLoading(false);
    }
  };

  const closeEarlyMeeting = async () => {
    const invalidActions = tableData?.filter((action) => !action.action);
    if (invalidActions?.length > 0) {
      toast.error(t("Please fill in all required fields in actions."));
      return;
    }

    if (meetingData?.automatic_instruction) {
      setPendingCloseAction(() => finalizeCloseEarlyMeeting);
      setShowInstructionModal(true);
      return;
    }
    await finalizeCloseEarlyMeeting();
  };

  const { recordedChunks, micStream, systemStream, setIsRecording, recorder } =
    useRecording();

  const [existingAudioBlob, setExistingAudioBlob] = useState(null);

  const fetchExistingAudio = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/audio-route/${meetId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      setExistingAudioBlob(response?.data?.data?.voice_notes); // Save the existing audio blob
      // setAudioUrl(response?.data?.data?.voice_blob);
    } catch (error) {
      console.error("Error fetching existing audio:", error);
    }
  };

  useEffect(() => {
    if (meetId) {
      fetchExistingAudio(); // Fetch the existing audio if the meeting is in progress
    }
  }, [meetId]);

  const fetchAudioBlob = async (audioUrl) => {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch the existing audio");
      }
      const audioBlob = await response.blob(); // Convert the response to a Blob
      return audioBlob;
    } catch (error) {
      console.error("Error fetching audio blob:", error);
      return null;
    }
  };

  const appendAudio = async (existingAudioUrl, newBlob) => {
    const existingAudioBlob = await fetchAudioBlob(existingAudioUrl);
    if (!existingAudioBlob) {
      console.error("No existing audio to append to.");
      return newBlob; // Return just the new blob if there's no existing audio
    }

    const existingAudioBuffer = await existingAudioBlob.arrayBuffer();
    const newAudioBuffer = await newBlob.arrayBuffer();

    const combinedBuffer = new Uint8Array(
      existingAudioBuffer.byteLength + newAudioBuffer.byteLength,
    );

    combinedBuffer.set(new Uint8Array(existingAudioBuffer), 0);
    combinedBuffer.set(
      new Uint8Array(newAudioBuffer),
      existingAudioBuffer.byteLength,
    );

    return new Blob([combinedBuffer], { type: "audio/webm" });
  };

  //  const uploadAudioToUpmeet = async (newBlob) => {
  //   setShowProgressBar(true);
  //   setProgress(0);
  // getMeetingById();

  //   const interval = setInterval(() => {
  //     setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
  //   }, 200);

  //   const formData = new FormData();
  //   const file = new File([newBlob], "audio.wav", { type: "audio/wav" });

  //   formData.append("meeting_id", meetId);
  //   formData.append("file", file);

  //   const token = CookieService.get("token") || CookieService.get("token");
  //   let attempts = 0;
  //   const maxRetries = 5;
  //   const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  //   try {
  //     let response;
  //     while (attempts < maxRetries) {
  //       try {
  //         response = await axios.post(`${API_BASE_URL}/upmeet-upload`, formData, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             'Content-Type': 'multipart/form-data'
  //           },
  //           // timeout: 30000
  //         });

  //         if (response?.status === 201 || response?.status === 200) {
  //           const data = response.data?.data;
  //           await getMeetingById();

  //           // if (meetingData?.location === "Google Meet" && meetingData?.prise_de_notes === "Automatic") {
  //           //   await onUploadSuccess();
  //           // }

  //           return data;
  //         }
  //         break;
  //       } catch (err) {
  //         attempts++;
  //         if (attempts >= maxRetries) throw err;
  //         await delay(1000 * attempts);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Upmeet upload failed:", error);
  //     throw error;
  //   } finally {
  //     clearInterval(interval);
  //     setProgress(100);
  //     setShowProgressBar(false);
  //   }
  // };

  // const uploadAudioToS3 = async (newBlob) => {
  //   setShowProgressBar(true);
  //   setProgress(0);

  //   const interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev >= 90) {
  //         clearInterval(interval);
  //         return 90;
  //       }
  //       return prev + 10;
  //     });
  //   }, 200);

  //   let combinedAudioBlob;
  //   if (existingAudioBlob) {
  //     combinedAudioBlob = await appendAudio(existingAudioBlob, newBlob);
  //   } else {
  //     combinedAudioBlob = newBlob;
  //   }

  //   const formData = new FormData();
  //   const file = new File([combinedAudioBlob], "audio.wav", {
  //     type: "audio/wav",
  //   });

  //   const now = new Date();
  //   const timestamp = now.toISOString().replace(/[:.]/g, "-");
  //   const rawTitle = meetingData?.title || "tektime";
  //   const safeTitle = rawTitle?.replace(/[^a-zA-Z0-9-_]/g, "_");
  //   const filename = `record_${safeTitle}_${timestamp}.mp3`;

  //   // Optional: Download locally
  //   const downloadUrl = URL.createObjectURL(file);
  //   const a = document.createElement("a");
  //   a.href = downloadUrl;
  //   a.download = filename;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   URL.revokeObjectURL(downloadUrl);

  //   formData.append("meeting_id", meetId);
  //   formData.append("voice_notes", file);

  //   const endPoint = `${API_BASE_URL}/audio-route`;
  //   const token = CookieService.get("token") || CookieService.get("token");

  //   let attempts = 0;
  //   const maxRetries = 5;
  //   const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  //   try {
  //     let response;
  //     while (attempts < maxRetries) {
  //       try {
  //         response = await axios.post(endPoint, formData, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });

  //         if (response?.status === 200) {
  //           const data = response.data?.data;
  //           if (data?.status === "closed") {
  //             setProgress(100);
  //             // getMeetingById();
  //             navigate(`/destination/${data?.unique_id}/${data?.id}`);
  //             return data;
  //           }
  //         }
  //         break; // exit loop if successful
  //       } catch (err) {
  //         attempts++;
  //         if (attempts >= maxRetries) throw err;
  //         await delay(1000 * attempts); // exponential backoff: 1s, 2s, 3s
  //       }

  //     }
  //   } catch (error) {
  //     console.error("Error uploading audio:", error);
  //     toast.error("Audio uploading failed!");
  //     toast.error(error?.response?.data?.message || error.message);
  //     throw new Error("Failed to upload audio in database");
  //   } finally {
  //     clearInterval(interval);
  //     setProgress(100);
  //     setShowProgressBar(false);
  //   }
  // };

  // const handleAudioUpload = async (audioBlob) => {
  //   try {
  //     // if (meetingData?.location === "Google Meet" && meetingData?.prise_de_notes === "Automatic") {
  //       // Start both uploads in parallel
  //       await Promise.allSettled([
  //         uploadAudioToUpmeet(audioBlob)
  //           .then(() => onUploadSuccess())
  //           .catch(e => console.error("Upmeet final error:", e)),
  //         uploadAudioToS3(audioBlob).catch(e => console.error("S3 final error:", e))
  //       ]);

  //   } catch (error) {
  //     console.error("Meeting upload failed:", error);
  //     toast.error("Failed to process meeting recording");
  //   }
  // };
  // Stop recording and upload audio

  // let isUploading = false;

  const uploadAudioToUpmeet = async (newBlob) => {
    const formData = new FormData();
    const file = new File([newBlob], "audio.wav", { type: "audio/wav" });

    formData.append("meeting_id", meetId);
    formData.append("file", file);

    const token = CookieService.get("token");
    let attempts = 0;
    const maxRetries = 5;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    try {
      let response;
      while (attempts < maxRetries) {
        try {
          response = await axios.post(
            `${API_BASE_URL}/upmeet-upload`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          if (response?.status === 201 || response?.status === 200) {
            const data = response.data?.data;
            // await getMeetingById();
            return data;
          }
          break;
        } catch (err) {
          attempts++;
          if (attempts >= maxRetries) {
            console.error("Upmeet upload failed after retries:", err);
            throw err;
          }
          await delay(1000 * attempts);
        }
      }
    } catch (error) {
      console.error("Upmeet upload failed:", error);
      throw error;
    }
  };

  const uploadAudioToS3 = async (newBlob) => {
    let combinedAudioBlob;
    if (existingAudioBlob) {
      combinedAudioBlob = await appendAudio(existingAudioBlob, newBlob);
    } else {
      combinedAudioBlob = newBlob;
    }

    const formData = new FormData();
    const file = new File([combinedAudioBlob], "audio.wav", {
      type: "audio/wav",
    });

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const rawTitle = meetingData?.title || "tektime";
    const safeTitle = rawTitle?.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `record_${safeTitle}_${timestamp}.mp3`;

    // Optional: Download locally
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isMobileDevice) {
      const downloadUrl = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }
    formData.append("meeting_id", meetId);
    formData.append("voice_notes", file);

    const endPoint = `${API_BASE_URL}/audio-route`;
    const token = CookieService.get("token");

    let attempts = 0;
    const maxRetries = 5;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    try {
      let response;
      while (attempts < maxRetries) {
        try {
          response = await axios.post(endPoint, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response?.status === 200) {
            const data = response.data?.data;
            if (data?.status === "closed") {
              // navigate(`/destination/${data?.unique_id}/${data?.id}`);
              return data;
            }
          }
          break;
        } catch (err) {
          attempts++;
          if (attempts >= maxRetries) {
            console.error("S3 upload failed after retries:", err);
            throw err;
          }
          await delay(1000 * attempts);
        }
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Audio uploading failed!");
      toast.error(error?.response?.data?.message || error.message);
      throw new Error("Failed to upload audio in database");
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    setShowProgressBar(true);
    setProgress(0);
    setIsUploading(true); // Set uploading flag
    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    try {
      // Start both uploads in parallel
      const results = await Promise.allSettled([
        uploadAudioToUpmeet(audioBlob).catch((e) => {
          console.error("Upmeet final error:", e);
          return null; // Return null instead of throwing
        }),
        uploadAudioToS3(audioBlob)
          .then(() => onUploadSuccess())
          .catch((e) => {
            console.error("S3 final error:", e);
            return null; // Return null instead of throwing
          }),
      ]);

      // Check if any upload failed completely (after all retries)
      const failedUploads = results?.filter(
        (result) => result.status === "rejected" || result?.value === null,
      );

      // Optional: You can add some logic here to handle partial success
      // For example, if one succeeded and one failed
      if (failedUploads?.length === results?.length) {
        // Both uploads failed completely
        toast.error("Failed to upload meeting recording");
      } else if (failedUploads?.length > 0) {
        // One succeeded, one failed
        console.log("Partial success - one upload completed");
      }
    } catch (error) {
      console.error("Meeting upload failed:", error);
      // Don't show error to user since we're handling silently
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setShowProgressBar(false);
        setIsUploading(false);
      }, 500);
    }
  };

  const stopRecording = async () => {
    if (!recorder.current || recorder.current.state !== "recording") return;

    // Stop the recorder first
    recorder.current.stop();

    // Stop the mic and system streams
    if (micStream.current) {
      micStream.current.getTracks().forEach((track) => track.stop());
      micStream.current = null; // Clear the reference
    }
    if (systemStream.current) {
      systemStream.current.getTracks().forEach((track) => track.stop());
      systemStream.current = null; // Clear the reference
    }

    setIsRecording(false);

    // Ensure `onstop` runs correctly
    recorder.current.onstop = async () => {
      if (recordedChunks.current.length === 0) {
        console.error("No recorded audio data available.");
        return;
      }

      // Create Blob from recorded chunks
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });

      // Reset recorded chunks
      recordedChunks.current = [];

      // if(meetingData?.location === "Google Meet" && meetingData?.prise_de_notes === "Automatic"){
      await handleAudioUpload(blob);
      // }else{

      //   // Upload the audio
      //   await uploadAudioToCloudinary(blob);
      // }
    };
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // stopRecording(); // your custom function

      const message =
        "You have unsaved changes. Are you sure you want to leave?";
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //   const handleBeforeUnload = (event) => {
  //   stopRecording(); // your custom function

  //   const message = "You have unsaved changes. Are you sure you want to leave?";
  //   event.returnValue = message;
  //   return message;
  // };

  // useEffect(() => {
  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);

  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const openModal = (file) => {
    setModalContent(file);
    setIsModalOpen2(true);
  };

  const closeModal = () => {
    setIsModalOpen2(false);
    setModalContent(null);
  };

  const [showTimerModal, setShowTimerModal] = useState(false);

  const formattedDateTime = parseAndFormatDateTime(
    stepDelay?.estimate_time,
    meetingData?.type,
    meetingData?.timezone,
  );

  const [emailCampaign, setEmailCampaign] = useState(null);

  useEffect(() => {
    const getNewsLetterStats = async () => {
      if (meetingData && meetingData?.type === "Newsletter") {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/get-newsletter-stats/${meetingData?.id}/${meetingData?.steps[activeStepIndex]?.id}`,
          );
          if (response?.data?.data) {
            const data = response.data?.data;
            setEmailCampaign(data);
          }
        } catch (error) {}
      }
    };

    getNewsLetterStats();

    const interval = setInterval(getNewsLetterStats, 20000);
    return () => clearInterval(interval);
  }, [meetingData, activeStepIndex]);

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };

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
            Authorization: `Bearer ${
              CookieService.get("token") || CookieService.get("token")
            }`,
          },
        },
      );
      if (response?.status) {
        incrementTimerKey();
        await getMeetingByIdWithCalculation();
        // window.location.reload();
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
      currentTime.toLocaleString("en-US", options),
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
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status) {
        await markToFinish(step?.id);
        incrementTimerKey();
        await getMeetingByIdWithCalculation();
        // window.location.reload();
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error starting step:", error);
    } finally {
      setIsReOpen(false);
    }
  };
  // system check
  const userAgent = navigator.userAgent?.toLowerCase();
  const isMac = userAgent?.includes("mac");
  const isWindows = userAgent?.includes("win");

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
                      "http",
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
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  // Map options to icons
  const iconMap = {
    Presentation: <FaFileAlt size={20} />, // Default icon for "Presentation"
    Step: <FaList size={20} />,
    Notes: <FaStickyNote size={20} />,
    Decision: <FaGavel size={20} />,
    Strategy: <FaChartLine size={20} />,
    Files: <FaFolderOpen size={20} />,
    Media: <FaPhotoVideo size={20} />,
    Questions: <FaSearch size={20} />,
  };

  const [searchQuery, setSearchQuery] = useState("");

  const onSearch = (term) => {
    setSearchQuery(term); // Update parent state with search term
    // Additional logic, e.g., filtering data based on term
  };

  const [iframeUrl, setIframeUrl] = useState(""); // State for iframe URL

  const handleSearch = useCallback((term) => {
    console.log("Search term:", term); // Debug log
  }, []);

  const handleIframeUrl = useCallback((url) => {
    console.log("Loading iframe URL:", url); // Debug log
    setIframeUrl(url);
  }, []);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false); // déjà existant probablement
  const confirmBackAction = () => {
    if (meetingData?.prise_de_notes === "Manual") {
      // Si manuel → on quitte sans rien sauvegarder
      navigate(-1);
    } else {
      // Si automatique → on affiche la modale de confirmation
      setShowBackConfirmModal(true);
    }
  };
  const confirmLeaveMeeting = async () => {
    if (currentStepIndex === meetingData?.steps?.length - 1) {
      // Dernière étape → fermeture normale
      close();
    } else {
      // Fermeture prématurée → sauvegarde + arrêt enregistrement
      await closeEarly();
    }
    setShowBackConfirmModal(false);
  };
  // // ✅ Confirm modal action (when user clicks "Yes")
  // const confirmBackAction = () => {
  //   if (currentStepIndex === meetingData?.steps?.length - 1) {
  //     close();
  //   } else {
  //     closeEarly();
  //   }
  // };

  // ✅ Handle back button
  const handleBackClick = () => {
    if (meetingData?.prise_de_notes === "Automatic") {
      setShowConfirmModal(true); // show modal only for automatic notes
    } else {
      navigate(`/invite/${meetingData?.id}`); // go back directly
    }
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
  const [i18n] = useTranslation("global");

  const { updateLanguage } = useDraftMeetings();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    updateLanguage(lang);
  };
  const sessionUser = JSON.parse(CookieService.get("user"));
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

  const autoSaveStep = async (content) => {
    const step = meetingData?.steps?.[activeStepIndex];
    if (!step?.id) return;

    const URL = `${API_BASE_URL}/steps/${step.id}`;

    try {
      await fetch(URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
        body: JSON.stringify({
          ...step,
          editor_content: content,
        }),
      });
      console.log("Auto-saved!");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
    }
  };

  // Debounce – 1.2 seconds pause = save
  const debouncedSave = useRef(
    debounce((content) => {
      autoSaveStep(content);
    }, 1200),
  ).current;

  const menuItems = [
    {
      key: "Step",
      iconBg: "#dbeafe",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1e40af"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      label: t("presentation.Step"),
      sub: "Éditer le contenu",
      checked: showStepContentEditor,
      onChange: (e) => {
        handleStepContentEditor(e);
        setSelectedOption(e.target.checked ? "Step" : "");
      },
      show: true,
    },
    {
      key: "Notes",
      iconBg: "#fef3c7",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      label: t("presentation.Notes"),
      sub: "Ajouter des notes",
      checked: notesEditor.showEditor,
      onChange: (e) => {
        handleNotesEditorToggle(e);
        setSelectedOption(e.target.checked ? "Notes" : "");
      },
      show: !isAutomatic,
    },
    {
      key: "Decision",
      iconBg: "#fef3c7",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      label: t("presentation.Decision"),
      sub: "Ajouter une décision",
      checked: decisionEditor.showEditor,
      onChange: (e) => {
        handleDecisionEditorToggle(e);
        setSelectedOption(e.target.checked ? "Decision" : "");
      },
      show: true,
    },
    {
      key: "Strategy",
      iconBg: "#d1fae5",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      label: t("presentation.Strategy"),
      sub: "Plan d'action",
      checked: planDActionEditor.showEditor,
      onChange: (e) => {
        handlePlanDActionEditor(e);
        setSelectedOption(e.target.checked ? "Strategy" : "");
      },
      show: meetingData?.automatic_strategy === false,
    },
    {
      key: "Files",
      iconBg: "#ede9fe",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <polyline points="13 2 13 9 20 9" />
        </svg>
      ),
      label: t("presentation.Files"),
      sub: "Upload, Drive, récents",
      checked: fileEditor.showEditor,
      onChange: (e) => {
        handleFileEditor(e);
        setSelectedOption(e.target.checked ? "Files" : "");
      },
      show: true,
    },
    {
      key: "Media",
      iconBg: "#fce7f3",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#db2777"
          strokeWidth="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
      label: t("presentation.Media"),
      sub: "Vidéos, enregistrement",
      checked: mediaEditor.showEditor,
      onChange: (e) => {
        handleMediaEditor(e);
        setSelectedOption(e.target.checked ? "Media" : "");
      },
      show: true,
    },
    {
      key: "Questions",
      iconBg: "#e0f2fe",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      label: t("presentation.Questions"),
      sub: "Décisions, notes, actions",
      checked: questionEditor.showEditor,
      onChange: (e) => {
        handleQuestionEditor(e);
        setSelectedOption(e.target.checked ? "Questions" : "");
      },
      show: true,
    },
  ];
  return (
    <>
      {!isModalOpen &&
        (meetingData?.status === "in_progress" ||
          meetingData?.status === "to_finish") && (
          <div className="home-header">
            <nav
              id="navbar"
              className="container-fluid navbar bg-white navbar-expand-lg py-3"
              style={navbarStyle}
            >
              <div className="container-fluid position-relative">
                {/* Back Button + Text - Visible only on Desktop (lg and up) */}
                <div className="d-none d-lg-flex align-items-center position-absolute start-0">
                  <button
                    className="btn btn-link p-0 me-2 d-flex align-items-center"
                    onClick={() => {
                      meetingData?.prise_de_notes === "Manual"
                        ? navigate(-1)
                        : confirmBackAction();
                    }}
                    style={{ textDecoration: "none", color: "#000" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="me-2"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="#000000"
                        strokeWidth="
```2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ fontWeight: "500" }}>Back to Dashboard</span>
                  </button>
                </div>

                {/* Back Arrow Only - Visible only on Mobile (below lg) */}
                <button
                  className="btn btn-link p-0 me-3 d-lg-none"
                  onClick={() => {
                    meetingData?.prise_de_notes === "Manual"
                      ? navigate(-1)
                      : confirmBackAction();
                  }}
                  style={{ textDecoration: "none", color: "#000" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div>
                  {/* Logo - Always Centered */}
                  <Link
                    to="/"
                    className="navbar-brand position-absolute start-50 top-50 translate-middle"
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
                {/* <Link
                        to="/"
                        className="navbar-brand"
                       
                      >
                        <img
                          src="/Assets/landing/logo.png"
                          alt=""
                          className="img-fluid"
                        />
                      </Link> */}
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
                      {<div className="d-flex align-items-center ms-5"></div>}

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
                                    i18n.language === "fr" ? "en" : "fr",
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
      <div
        className="app-container"
        style={{
          height: isModalOpen ? "100vh" : "auto",
          overflow: isModalOpen ? "hidden" : "unset",
        }}
      >
        {/* <div className="email-invite w-100"> */}
        {!isModalOpen && (
          <>
            <section
              className={`banner ${
                meetingData?.destination_banner ? "has-image" : ""
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

                  {getBannerContent("black") /* gradient → black text */}
                </>
              )}
            </section>
          </>
        )}
        {!isModalOpen && (
          <>
            <nav
              role="navigation"
              aria-label="Main navigation"
              className={`sidebar-nav ${isNavVisible ? "visible" : "hidden"}`}
            >
              <ul className="nav-list">
                {[
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
                        if (window.innerWidth < 768) setIsNavVisible(false);
                        document.getElementById(item.id)?.scrollIntoView({
                          behavior: "smooth",
                        });
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
                onClick={() =>
                  navigate(
                    `/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`,
                  )
                }
              >
                <span>Essayer l'aventure TekTIME</span>
              </Button>
            </div>
          </>
        )}

        <div className="main-content-9 mt-4 container">
          {meetingData &&
            (meetingData?.status === "in_progress" ||
              meetingData?.status === "to_finish") && (
              <section
                id="counter"
                className="section animate__animated animate__fadeIn"
                style={{ paddingTop: "18px" }}
              >
                <div className="col-md-12 col-12">
                  {meetingData?.guides?.some(
                    (item) => item?.email === CookieService.get("email"),
                  ) && (
                    <>
                      {meetingData?.presentation && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "10px",
                            gap: "6px",
                          }}
                        >
                          <button
                            style={{
                              backgroundColor: "red",
                              color: "#fff",
                              border: "none",
                              padding: "9px 26px",
                              fontSize: "16px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              transition: "background-color 0.3s",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onClick={() => {
                              setShowTimerModal(true);
                            }}
                          >
                            {t("Close")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <div
                    className={`counter-wrapper ${
                      isModalOpen ? "modal-open" : ""
                    }`}
                    style={{
                      position: isModalOpen ? "fixed" : "relative",
                      top: isModalOpen ? "30px" : "auto",
                      left: isModalOpen ? "50%" : "auto",
                      transform: isModalOpen ? "translateX(-50%)" : "none",
                      zIndex: isModalOpen ? 1001 : "auto",
                      pointerEvents: "none",
                      marginTop: isModalOpen ? undefined : "16px",
                    }}
                  >
                    <CounterContainer
                      alarm={meetingData?.alarm || false}
                      progress={false}
                      estimateTime={estimateTime}
                      estimateDate={estimateDate}
                      isModalOpen={true}
                      stepTitle={meetingData?.steps[currentStepIndex]?.title}
                      stepOrder={meetingData?.steps[currentStepIndex]?.order_no}
                      handlenextPage={handlenextPage}
                      closeMeeting={closeMeeting}
                      next={next}
                      close={close}
                    />
                  </div>
                  {meetingData?.presentation && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: "25px",
                          // marginRight: "10px",
                          marginBottom: "10px",
                          gap: "6px",
                        }}
                        className="counter-buttons"
                      >
                        <button
                          style={{
                            backgroundColor: "#0026b1",
                            color: "#fff",
                            border: "none",
                            padding: "13px 30px",
                            fontSize: "16px",
                            cursor: "pointer",
                            borderRadius: "5px",
                            transition: "background-color 0.3s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => setIsModalOpen(true)}
                        >
                          <FaExpand size={16} />
                        </button>
                        {!recordingStart && (meetingData?.location === "Google Meet" ||
                          meetingData?.location === "Microsoft Teams") && (
                          <button
                            className="btn"
                            style={{
                              backgroundColor: "#0026b1",
                              color: "#fff",
                              border: "none",
                              padding: "9px 26px",
                              fontSize: "16px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              transition: "background-color 0.3s",
                              display: "flex",
                              // alignItems: "center",
                              // whiteSpace: "nowrap",
                            }}
                            onClick={async () => {
                              if (
                                meetingData?.prise_de_notes === "Automatic" &&
                                meetingData?.meet_link
                              ) {
                                await starting();
                                // window.open(meetingData?.meet_link, "_blank");
                              } else if (
                                meetingData?.meet_link &&
                                meetingData?.prise_de_notes === "Manual"
                              ) {
                                window.open(meetingData?.meet_link, "_blank");
                              } else if (
                                meetingData?.prise_de_notes === "Automatic" &&
                                !meetingData?.meet_link
                              ) {
                                await starting();
                              } else if (
                                meetingData?.prise_de_notes === "Manual" &&
                                !meetingData?.meet_link
                              ) {
                                window.open(meetingData?.meet_link, "_blank");
                              } else {
                                await starting();
                                // window.open(meetingData?.meet_link, "_blank");
                              }
                            }}
                          >
                            {meetingData?.location === "Google Meet"
                              ? t("meeting.formState.join with google meet 1")
                              : t(
                                  "meeting.formState.join with microsoft teams 1",
                                )}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          <section
            id="detail"
            className="section animate__animated animate__fadeIn"
          >
            <div className="meeting-header">
              <div className="header-row">
                <div className="dropdown-container" ref={dropdownRef}>
                  <h5 className="content-heading-title ms-0">
                    {renderIcon()}
                    {/* // </div> */}
                    &nbsp;
                    {selectedTitleOrder}&nbsp;
                    {meetingData?.title} &nbsp;&nbsp;
                    {meetingData?.status === "active" && (
                      <span
                        className={`badge ms-2 ${
                          moment().isAfter(
                            moment(
                              `${meetingData?.date} ${meetingData?.start_time}`,
                              "YYYY-MM-DD HH:mm",
                            ),
                          )
                            ? "late"
                            : "future"
                        }`}
                        // style={{ padding: "3px 8px 3px 8px" }}
                      >
                        {moment().isAfter(
                          moment(
                            `${meetingData?.date} ${meetingData?.start_time}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                          ? t("badge.late")
                          : t("badge.future")}
                      </span>
                    )}
                    {meetingData?.status === "in_progress" && (
                      // <span className="mx-2 badge status-badge-inprogress1">
                      <span
                        className={`${
                          meetingData?.steps?.some(
                            (moment) =>
                              moment?.step_status === "in_progress" &&
                              convertTimeTakenToSeconds(moment?.time_taken) >
                                convertCount2ToSeconds(
                                  moment?.count2,
                                  moment?.time_unit,
                                ),
                          )
                            ? "status-badge-red1"
                            : "status-badge-inprogress1"
                        } mx-2 badge h-100`}
                      >
                        {t("badge.inprogress")}
                      </span>
                    )}
                    {meetingData?.status === "closed" && (
                      <span className="mx-2 badge inprogrss">
                        {t("badge.finished")}
                      </span>
                    )}
                    {meetingData?.status === "abort" && (
                      <span className="mx-2 badge late">
                        {t("badge.cancel")}
                      </span>
                    )}
                    {meetingData?.status === "to_finish" && (
                      <span className="mx-2 badge status-badge-finish">
                        {t("badge.finish")}
                      </span>
                    )}
                    {meetingData?.status === "todo" && (
                      <span className="mx-2 badge status-badge-green">
                        {t("badge.Todo")}
                      </span>
                    )}
                    {/* {allMeetings && allMeetings?.length < 2 ? null : ( */}
                    {allMeetings?.length > 1 ? (
                      <span>
                        <MdKeyboardArrowDown
                          size={30}
                          onClick={toggleDropdown}
                          style={{
                            cursor: "pointer",
                            // marginLeft: ".6rem",
                            marginBottom: "6px",
                          }}
                        />
                      </span>
                    ) : null}
                  </h5>
                  {dropdownVisible && (
                    <div className="dropdown-content-filter">
                      <div className="dropdown-section">
                        {allMeetings
                          // ?.filter((item) => item.id !== meetId)
                          ?.filter(
                            (item) => item.id.toString() !== meetId.toString(),
                          )
                          ?.map((item, index) => {
                            return (
                              <>
                                <div
                                  key={index}
                                  onClick={() => applyFilter(item)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <b>{item.title_order}.</b>&nbsp;
                                  {item.title}
                                </div>
                              </>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-4 items mt-0 mt-md-2 audio-items">
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
                  {/* <span className="time">{meeting?.type}</span> */}
                  <span className="time">
                    {meetingData?.solution
                      ? meetingData?.solution?.title
                      : meetingData?.type === "Google Agenda Event"
                        ? "Google Agenda Event"
                        : meetingData?.type === "Outlook Agenda Event"
                          ? "Outlook Agenda Event"
                          : meetingData?.type === "Special"
                            ? "Media"
                            : meetingData?.type === "Prise de contact"
                              ? "Prise de contact"
                              : t(`types.${meetingData?.type}`)}
                  </span>
                </div>
                {/* <div className="priority">
                      <svg
                        width="20"
                        height="20"
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
                        {t(
                          `meeting.newMeeting.options.priorities.${meetingData?.priority}`
                        )}
                      </span>
                    </div> */}
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
                        <span className="date-text">{formattedDate}</span>
                        <span className="date-separator">-</span>
                        <span className="date-text">
                          {/* {formattedDateActive} */}
                          {estimateDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="date-text">
                          {formattedDate}
                          &nbsp; {t("at")}
                        </span>
                        <span className="date-text">
                          {meetingData?.status === "in_progress"
                            ? convertTo12HourFormat(
                                meetingData?.starts_at,
                                meetingData?.date,
                                meetingData?.steps,
                                meetingData?.timezone,
                              )
                            : convertTo12HourFormat(
                                meetingData?.start_time,
                                meetingData?.date,
                                meetingData?.steps,
                                meetingData?.timezone,
                              )}
                          <span className="date-separator">-</span>
                        </span>

                        <span className="date-text">
                          {/* {formattedEndDateInHoursForEmailInvite} */}
                          {formattedDateTime.formattedDate || estimateDate}
                          &nbsp; {t("at")}
                        </span>
                        <span className="date-text">
                          {/* {lastStepEndTime} */}
                          {formattedDateTime.formattedTime || estimateTime}
                        </span>

                        <span className="timezone-text">
                          {getTimezoneSymbol(CookieService.get("timezone"))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {(meetingData?.location && meetingData?.location !== "None") ||
              (meetingData?.agenda && meetingData?.agenda !== "None") ? (
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
                              {meetingData?.user?.user_zoom_info?.display_name}
                            </span>
                          </>
                        ) : meetingData?.location === "Microsoft Teams" ? (
                          <>
                            <SiMicrosoftteams
                              style={{ color: "#6264A7" }}
                              className="fs-5"
                              size={28}
                            />
                            <span className="solutioncards option-text">
                              {meetingData?.user?.visioconference_links?.find(
                                (item) => item.platform === "Microsoft Teams",
                              )?.value || "Microsoft Teams"}
                            </span>
                          </>
                        ) : meetingData?.location === "Google Meet" ? (
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
                              {meetingData?.user?.visioconference_links?.find(
                                (item) => item.platform === "Google Meet",
                              )?.value || "Google Meet"}
                            </span>
                          </>
                        ) : null}
                      </p>
                    )}
                  {meetingData?.agenda && meetingData?.agenda !== "None" && (
                    <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                      {meetingData?.agenda === "Zoom Agenda" ? (
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
                            {meetingData?.user?.user_zoom_info?.display_name}
                          </span>
                        </>
                      ) : meetingData?.agenda === "Outlook Agenda" ? (
                        <>
                          <SiMicrosoftoutlook
                            style={{ color: "#0078D4" }}
                            className="fs-5"
                            size={28}
                          />
                          <span className="solutioncards option-text">
                            {meetingData?.user?.integration_links?.find(
                              (item) => item.platform === "Outlook Agenda",
                            )?.value || "Outlook Agenda"}
                          </span>
                        </>
                      ) : meetingData?.agenda === "Google Agenda" ? (
                        <>
                          <FcGoogle size={28} />
                          <span className="solutioncards option-text">
                            {meetingData?.user?.integration_links?.find(
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
                    <p className="m-0">{meetingData?.room_details}</p>
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
              {meetingData?.prise_de_notes === "Automatic" ||
                meetingData?.alarm === true ||
                meetingData?.autostart === "automatic" ||
                meetingData?.playback === true ||
                meetingData?.notification === true ||
                (meetingData?.automatic_strategy === true && (
                  <div className="row mt-3">
                    <div className="col-md-12 d-flex align-items-center gap-3 flex-wrap">
                      {meetingData?.prise_de_notes === "Automatic" && (
                        <AutoNoteIndicator
                          t={t}
                          visible={true}
                          isDesktopOnly={false}
                        />
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
                            {t("meeting.formState.Lecture playback")}
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
                      {meetingData?.automatic_strategy === true && (
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
                              {t("meeting.formState.Automatic Strategy")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
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
                      {meetingData?.moment_privacy === "public" ? (
                        <img
                          src="/Assets/Tek.png"
                          alt="Public"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "0",
                          }}
                        />
                      ) : meetingData?.moment_privacy === "team" ? (
                        <div className="d-flex">
                          {meetingData?.moment_privacy_teams_data?.map(
                            (item, idx) => (
                              <div key={idx} className="me-1">
                                <img
                                  src={
                                    item?.logo?.startsWith("http")
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
                            ),
                          )}
                        </div>
                      ) : meetingData?.moment_privacy === "participant only" ? (
                        <div className="d-flex">
                          {meetingData?.user_with_participants?.map(
                            (item, idx) => (
                              <div key={idx} className="me-1">
                                <img
                                  src={
                                    item?.participant_image?.startsWith("http")
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
                            ),
                          )}
                        </div>
                      ) : meetingData?.moment_privacy ===
                        "tektime members" ? null : meetingData?.moment_privacy ===
                        "enterprise" ? (
                        <div>
                          <img
                            src={
                              meetingData?.user?.enterprise?.logo?.startsWith(
                                "http",
                              )
                                ? meetingData?.user?.enterprise?.logo
                                : `${Assets_URL}/${meetingData?.user?.enterprise?.logo}`
                            }
                            alt={meetingData?.user?.enterprise?.name}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "50%",
                              objectFit: "fill",
                              objectPosition: "top",
                            }}
                            title={meetingData?.user?.enterprise?.name}
                          />
                        </div>
                      ) : meetingData?.moment_privacy === "password" ? (
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
                            meetingData?.user?.image?.startsWith("users/")
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
                        className={`ms-2 ${
                          meetingData?.moment_privacy === "private"
                            ? "solution-badge-red"
                            : meetingData?.moment_privacy === "public"
                              ? "solution-badge-green"
                              : meetingData?.moment_privacy === "enterprise" ||
                                  meetingData?.moment_privacy ===
                                    "participant only" ||
                                  meetingData?.moment_privacy ===
                                    "tektime members"
                                ? "solution-badge-blue"
                                : meetingData?.moment_privacy === "password"
                                  ? "solution-badge-red"
                                  : "solution-badge-yellow"
                        }`}
                        style={{ padding: "3px 8px" }}
                      >
                        {meetingData?.moment_privacy === "private"
                          ? t("solution.badge.private")
                          : meetingData?.moment_privacy === "public"
                            ? t("solution.badge.public")
                            : meetingData?.moment_privacy === "enterprise"
                              ? t("solution.badge.enterprise")
                              : meetingData?.moment_privacy ===
                                  "participant only"
                                ? t("solution.badge.participantOnly")
                                : meetingData?.moment_privacy ===
                                    "tektime members"
                                  ? t("solution.badge.membersOnly")
                                  : meetingData?.moment_privacy === "password"
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

          {!isModalOpen && meetingData?.type === "Newsletter" && (
            <>
              <div className="col-md-4">
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
              </div>
            </>
          )}

          {!isModalOpen && (
            <section id="guides" className="section report-host-card">
              <h2 className="section-title-1 text-left">
                {meetingData?.guides?.length > 1 ? t("Guides") : t("Guide")}
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
          )}

          {meetingData?.participants?.length > 0 &&
            meetingData?.type !== "Newsletter" && (
              <section id="guides" className="section report-host-card">
                <h2 className="section-title-1 text-left">{t("invite")}</h2>
                {/* <div className="guides-container"> */}
                {!isContentBlurred && (
                  <div
                    className="guides-container"
                    style={{
                      filter: !isContentBlurred ? "none" : "blur(13px)",
                    }}
                  >
                    {meetingData?.type !== "Newsletter" && (
                      <>
                        {meetingData?.participants?.filter(
                          (item) =>
                            // item.isCreator === 0 &&
                            !guideEmails?.has(item.email),
                        )?.length > 0 && (
                          <ReportParticipantCard
                            data={meetingData?.participants}
                            guides={meetingData?.guides}
                            handleShow={handleShow}
                            handleHide={hideShow}
                            showProfile={showProfile}
                            meeting={meetingData}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* </div> */}
              </section>
            )}

          {meetingData?.steps?.length > 0 && (
            <section id="steps" className="section">
              <h2 className="section-title-1 text-left">
                {t("meeting.newMeeting.labels.Program")}
              </h2>
              <div className="steps-desktop d-none d-md-block">
                {meetingData.steps.map((step, index) => (
                  <ActiveReportStepCard
                    key={index}
                    index={index}
                    setIsModalOpen1={setIsModalOpen}
                    setCurrentStepIndex={setCurrentStepIndex}
                    data={step}
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
                    currentStepIndex={currentStepIndex}
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
                  <ActiveReportStepCard
                    key={index}
                    index={index}
                    setIsModalOpen1={setIsModalOpen}
                    setCurrentStepIndex={setCurrentStepIndex}
                    data={step}
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
                    currentStepIndex={currentStepIndex}
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
              </Accordion>
            </section>
          )}

          {meetingData?.meeting_files?.length > 0 && (
            <section id="meeting_files" className="section">
              <h2 className="section-title-1 text-left">
                {`${t("meeting.newMeeting.labels.file")} `}
              </h2>
              <ReportStepFile
                data={meetingData?.meeting_files}
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
                meeting1={meetingData?.id}
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
          {/* {!isModalOpen && (
            <div className="cards-section">
           

              <div style={{ marginTop: "5rem" }}>
                <span className="participant-heading">
                  {`${t("meeting.newMeeting.labels.Program")} `}
                </span>
                <ActiveReportStepCard
                  setIsModalOpen1={setIsModalOpen}
                  setCurrentStepIndex={setCurrentStepIndex}
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
                  currentStepIndex={currentStepIndex}
                  runStep={handleRunStep}
                  isRun={isRun}
                  isReOpen={isReOpen}
                  reRunStep={handleReRunStep}
                />
              </div>



            </div>
          )} */}
        </div>
        <div className="form-actions d-flex justify-content-center">
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
            onClick={() =>
              navigate(
                `/gate/moment?contract_id=${process.env.REACT_APP_CONTRACT_ID}`,
              )
            }
          >
            <span>Essayer l'aventure TekTIME</span>
          </Button>
        </div>
        {/* </div> */}
        <div>
          {GradientSvg}
          {GradientSvg2}
          {GradientSvg3}
        </div>
      </div>
      <SignUp
        show={showSignUp}
        handleClose={handleCloseSignUp}
        // handleShowSignIn={handleShowSignIn}

        meetingId={meetId || meetingData?.id}
        meeting={meetingData}
      />
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "#fff",
            zIndex: 1000,
            overflowY: "auto",
            padding: "0px 10px",
            display: "flex",
            flexDirection: "column",
          }}
          className="tektime"
        >
          <div
            className="d-flex align-items-center full-screen-top-row"
            style={{ flexShrink: 0 }}
          >
            <div className="d-flex align-items-center justify-content-between p-2 w-100">
              {/* Back Button - Compact on Mobile */}
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-link text-dark p-0"
                  onClick={() =>
                    meetingData?.prise_de_notes === "Manual"
                      ? navigate(-1)
                      : confirmBackAction()
                  }
                >
                  <MdArrowBackIosNew size={20} />
                </button>
                <AutoNoteIndicator
                  t={t}
                  visible={meetingData?.prise_de_notes === "Automatic"}
                  isDesktopOnly={true}
                />
              </div>

              {/* Guest Profile - Compact on Mobile */}
              <div className="d-flex align-items-center d-flex d-xl-none">
                {/* {meetingData?.type === "Newsletter" ? (
                  <div className="text-start d-">
                    {meetingData?.newsletter_guide ? (
                      <div>
                        {meetingData?.newsletter_guide?.logo ? (
                          meetingData?.newsletter_guide.logo !== "" ? (
                            <img
                              className="user-img-compact"
                              width={32}
                              height={32}
                              src={
                                meetingData?.newsletter_guide?.logo?.startsWith("http")
                                  ? meetingData?.newsletter_guide?.logo
                                  : Assets_URL + "/" + meetingData?.newsletter_guide?.logo
                              }
                              alt="logo"
                              style={{ borderRadius: '50%' }}
                            />
                          ) : (
                            <FaUserCircle size={24} />
                          )
                        ) : (
                          <FaUserCircle size={24} />
                        )}
                      </div>
                    ) : (
                      <FaUserCircle size={24} />
                    )}
                  </div>
                ) : (
                  <div className="text-start d-flex d-xl-none">
                    {meetingData?.steps[currentStepIndex]?.participant?.participant_image ? (
                      <img
                        className="user-img-compact"
                        width={32}
                        height={32}
                        src={
                          meetingData?.steps[currentStepIndex]?.participant?.participant_image?.startsWith("users/")
                            ? `${Assets_URL}/${meetingData?.steps[currentStepIndex]?.participant?.participant_image}`
                            : meetingData?.steps[currentStepIndex]?.participant?.participant_image
                        }
                        alt="logo2"
                        style={{ borderRadius: '50%' }}
                      />
                    ) : (
                      <FaUserCircle size={24} />
                    )}
                  </div>
                )} */}
                   <Tooltip
                  title={
                    meetingData?.steps[currentStepIndex]?.order_no +
                    ".\u00A0" +
                    meetingData?.steps[currentStepIndex]?.title
                  }
                >
                  <h4
                    style={{
                      overflow: "hidden",
                      margin: 0,
                    }}
                    className="truncated-text"
                  >
                    {meetingData?.steps[currentStepIndex]?.order_no}.
                    {meetingData?.steps[currentStepIndex]?.title}
                  </h4>
                </Tooltip>
              </div>

              {/* Expand/Collapse Button */}
              <button
                className="d-flex d-xl-none btn-expand-compact"
                style={{
                  background: "rgba(30, 64, 175, 0.1)",
                  color: "#1e40af",
                  border: "none",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setIsModalOpen(false)}
              >
                <FaExpand size={16} />
              </button>
            </div>
              {/* <div className="d-flex d-xl-none text-center">
                <Tooltip
                  title={
                    meetingData?.steps[currentStepIndex]?.order_no +
                    ".\u00A0" +
                    meetingData?.steps[currentStepIndex]?.title
                  }
                >
                  <h4
                    style={{
                      overflow: "hidden",
                      margin: 0,
                    }}
                    className="truncated-text"
                  >
                    {meetingData?.steps[currentStepIndex]?.order_no}.
                    {meetingData?.steps[currentStepIndex]?.title}
                  </h4>
                </Tooltip>
              </div> */}
              {/* //For Mobile - Expand button */}

              {/* <button
                className="d-flex d-xl-none"
                style={{
                  background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 24px",
                  fontSize: "16px",
                  cursor: "pointer",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setIsModalOpen(false)}
              >
                <FaExpand size={16} />
              </button> */}
            </div>

            {/* Center section - Title */}
            {/* <div className="col-md-4 text-center d-none d-lg-block">
              <Tooltip
                title={
                  meetingData?.steps[currentStepIndex]?.order_no +
                  ".\u00A0" +
                  meetingData?.steps[currentStepIndex]?.title
                }
              >
                <h4
                  style={{
                    overflow: "hidden",
                    // textOverflow: "ellipsis",
                    // display: "inline-block",
                    // maxWidth: "100%",
                    // verticalAlign: "bottom",
                    margin: 0, // optional: remove extra spacing
                  }}
                  className="truncated-text"
                >
                  {meetingData?.steps[currentStepIndex]?.order_no}.
                  {meetingData?.steps[currentStepIndex]?.title}
                </h4>
              </Tooltip>
            </div> */}

            {/* For Mobile */}
            <div className="row align-items-center d-flex d-xl-none w-100 mt-3 mb-2">
              <div className="col-12 d-sm-none text-center d-flex justify-content-center p-0">
                {(meetingData?.location === "Google Meet" ||
                  meetingData?.location === "Microsoft Teams") && (
                  <button
                    style={{
                      backgroundColor: "#0026b1",
                      color: "#fff",
                      border: "none",
                      padding: "9px 15px",
                      fontSize: "14px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      transition: "background-color 0.3s",
                      display: "flex",
                      alignItems: "center",
                      visibility: "hidden",
                    }}
                    onClick={async () => {
                      if (
                        meetingData?.prise_de_notes === "Automatic" &&
                        meetingData?.meet_link
                      ) {
                        await starting();
                      } else if (
                        meetingData?.meet_link &&
                        meetingData?.prise_de_notes === "Manual"
                      ) {
                        window.open(meetingData?.meet_link, "_blank");
                      } else if (
                        meetingData?.prise_de_notes === "Automatic" &&
                        !meetingData?.meet_link
                      ) {
                        await starting();
                      } else if (
                        meetingData?.prise_de_notes === "Manual" &&
                        !meetingData?.meet_link
                      ) {
                        window.open(meetingData?.meet_link, "_blank");
                      } else {
                        await starting();
                      }
                    }}
                  >
                    {t("Join")}
                  </button>
                )}
            </div>
          </div>
          {/* ---------------------------------------------------- */}
          {/* ---------------------------------------------------- */}
          {/* Second row desktop */}
          <div
            className="top-row-toggles position-relative premium-glow-container"
            style={{
              border: (isMobile || window.innerWidth <= 1200) ? "none" : "2.5px solid transparent",
              borderRadius: "50px",
              background: (isMobile || window.innerWidth <= 1200) ? "transparent" :
                "linear-gradient(white, white) padding-box, linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #22d3ee, #3b82f6) border-box",
              backgroundSize: "200% auto",
              animation: (isMobile || window.innerWidth <= 1200) ? "none" : "borderGlow 4s linear infinite",
              boxShadow: (isMobile || window.innerWidth <= 1200) ? "none" : `
              0 10px 15px -3px rgba(0, 0, 0, 0.1), 
              0 0 15px rgba(59, 130, 246, 0.3), 
              0 0 5px rgba(236, 72, 153, 0.2)
            `,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "2px 20px",
              margin: "10px 0",
              transition: "all 0.3s ease",
            }}
          >
            {/* Left Side Text/Button */}
            <div className="top-row-child">
              {/* User Profile Card — new design */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  borderRadius: "12px",
                  padding: "6px 15px",
                  marginLeft: "10px",
                  marginBottom: "0px",
                }}
                className="d-none d-xl-flex"
              >
                {/* Avatar with online dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {meetingData?.steps[currentStepIndex]?.participant
                    ?.participant_image ? (
                    <img
                      className="user-img"
                      width={42}
                      height={42}
                      src={
                        meetingData?.steps[
                          currentStepIndex
                        ]?.participant?.participant_image?.startsWith("users/")
                          ? `${Assets_URL}/${meetingData?.steps[currentStepIndex]?.participant?.participant_image}`
                          : meetingData?.steps[currentStepIndex]?.participant
                              ?.participant_image
                      }
                      alt="avatar"
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(255,255,255,0.15)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "#1e3a6e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {meetingData?.steps[
                        currentStepIndex
                      ]?.participant?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || (
                        <FaUserCircle size={24} color="#90b8f8" />
                      )}
                    </div>
                  )}
                  {/* Online dot */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid #fff",
                    }}
                  />
                </div>

                {/* Name + Title */}
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111",
                      lineHeight: 1.2,
                    }}
                  >
                    {meetingData?.steps[currentStepIndex]?.participant
                      ?.full_name || meetingData?.user?.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                    {meetingData?.steps[currentStepIndex]?.participant?.post ||
                      ""}
                  </div>
                </div>
              </div>
            </div>

            <div
              className=""
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "0px",
              }}
            >
              {/* Action buttons */}
              <div className="d-flex gap-3 align-items-center play-meeting-btn action-buttons">

                <button
                  className="d-none d-xl-flex"
                  style={{
                    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "10px 24px",
                    fontSize: "16px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaExpand size={16} />
                </button>
                <>
                  {meetingData?.type === "Newsletter" && (
                    <div className="d-flex gap-3 align-items-center d-none d-xl-flex">
                      {/* {pause button} */}
                      <div
                        className="d-none d-xl-flex align-items-center"
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <div className="d-flex justify-content-center align-items-center d-none d-xl-flex">
                          {(isPause || isReOpen) ? (
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                borderRadius: "12px",
                                padding: "10px 24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                              disabled
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
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.2)",
                                padding: "10px 24px",
                                fontSize: "15px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                                transition: "all 0.3s ease",
                              }}
                              onClick={async (e) => {
                                e.preventDefault();
                                if (meetingData?.status === "to_finish") {
                                  await handleReRunStep(
                                    meetingData?.steps[currentStepIndex],
                                  );
                                } else {
                                  await handlePauseStep();
                                }
                              }}
                            >
                              {meetingData?.status === "to_finish" ? (
                                <FiPlay size={16} />
                              ) : (
                                <FiPause size={16} />
                              )}
                              <span>
                                {meetingData?.status === "to_finish"
                                  ? t("Restart")
                                  : t("Pause")}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      {/* {close button} */}
                      <div className="justify-content-center">
                        <div className="d-flex prev-btn">
                          {isLoading ? (
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #be185d, #ec4899)",
                                borderRadius: "12px",
                                padding: "10px 24px",
                              }}
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
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #be185d, #ec4899)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.2)",
                                padding: "10px 24px",
                                fontSize: "15px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(190, 24, 93, 0.3)",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() =>
                                currentStepIndex ===
                                meetingData?.steps?.length - 1
                                  ? closeMeeting()
                                  : setShowTimerModal(true)
                              }
                              disabled={isLoading}
                            >
                              <FaStop size={14} />
                              {t("Close")}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Desktop Dropdown - manual meeting type */}
                      <div className="dropdown">
                        <button
                          className="btn"
                          type="button"
                          id="manualTogglesDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #1e40af, #3b82f6)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 3,
                            cursor: "pointer",
                            padding: 0,
                            boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                background: "#fff",
                                display: "block",
                              }}
                            />
                          ))}
                        </button>

                        <ul
                          className="dropdown-menu dropdown-menu-end p-0"
                          aria-labelledby="manualTogglesDropdown"
                          style={{
                            width: 280,
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                            border: "1px solid rgba(0,0,0,0.05)",
                            padding: "8px 0",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {menuItems
                            .filter((item) => item.show)
                            .map((item, index, arr) => (
                              <li
                                key={item.key}
                                className="px-3 py-2"
                                style={{
                                  cursor: "default",
                                  transition: "background 0.2s ease",
                                }}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className="d-flex align-items-center gap-3"
                                    style={{ flex: 1 }}
                                  >
                                    <div
                                      style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        background: item.iconBg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        color: "#fff",
                                        fontSize: "18px",
                                      }}
                                    >
                                      {item.icon}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: "13px",
                                          fontWeight: 600,
                                          color: "#1e293b",
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        {item.label}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                          lineHeight: 1.1,
                                        }}
                                      >
                                        {item.sub}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      flexShrink: 0,
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <ReactToggle
                                      checked={item.checked}
                                      icons={false}
                                      onChange={item.onChange}
                                      style={{ transform: "scale(0.85)" }}
                                    />
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {meetingData?.type !== "Newsletter" && (
                    <>
                      {showButton && (
                        <div className="d-flex gap-2 prev-btn align-items-center d-none d-xl-flex">
                          {/* Conditional Join or Pause Button */}
                          <div
                            className="d-none d-xl-flex align-items-center"
                            style={{
                              textAlign: "right",
                              // visibility: meetingData?.guides?.some(
                              //   (item) =>
                              //     item?.email === CookieService.get("email"),
                              // )
                              //   ? "visible"
                              //   : "hidden",
                            }}
                          >
                            {/* {meetingData?.guides?.some(
                              (item) =>
                                item?.email === CookieService.get("email"),
                            ) && ( */}
                              <div className="d-flex justify-content-center align-items-center d-none d-xl-flex">
                                {!recordingStart &&
                                (meetingData?.location === "Google Meet" ||
                                  meetingData?.location ===
                                    "Microsoft Teams") ? (
                                  <button
                                    className="btn"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #1e40af, #3b82f6)",
                                      color: "#fff",
                                      border: "1px solid rgba(255,255,255,0.2)",
                                      padding: "10px 24px",
                                      fontSize: "15px",
                                      fontWeight: "600",
                                      borderRadius: "12px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      boxShadow:
                                        "0 4px 15px rgba(30, 64, 175, 0.3)",
                                      transition: "all 0.3s ease",
                                    }}
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      if (
                                        meetingData?.prise_de_notes ===
                                          "Automatic" &&
                                        meetingData?.meet_link
                                      ) {
                                        await starting();
                                      } else if (
                                        meetingData?.meet_link &&
                                        meetingData?.prise_de_notes === "Manual"
                                      ) {
                                        window.open(
                                          meetingData?.meet_link,
                                          "_blank",
                                        );
                                      } else if (
                                        meetingData?.prise_de_notes ===
                                          "Automatic" &&
                                        !meetingData?.meet_link
                                      ) {
                                        await starting();
                                      } else if (
                                        meetingData?.prise_de_notes ===
                                          "Manual" &&
                                        !meetingData?.meet_link
                                      ) {
                                        window.open(
                                          meetingData?.meet_link,
                                          "_blank",
                                        );
                                      } else {
                                        await starting();
                                      }
                                    }}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M15 10l5 5-5 5" />
                                      <path d="M4 4v7a4 4 0 004 4h12" />
                                    </svg>
                                    <span>
                                      {meetingData?.location === "Google Meet"
                                        ? t(
                                            "meeting.formState.join with google meet 1",
                                          )
                                        : t(
                                            "meeting.formState.join with microsoft teams 1",
                                          )}
                                    </span>
                                  </button>
                                ) : (
                                  <>
                                    {(isPause || isReOpen) ? (
                                      <button
                                        className="btn"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #1e40af, #3b82f6)",
                                          borderRadius: "12px",
                                          padding: "10px 24px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                        }}
                                        disabled
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
                                      <button
                                        className="btn"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #1e40af, #3b82f6)",
                                          color: "#fff",
                                          border: "1px solid rgba(255,255,255,0.2)",
                                          padding: "10px 24px",
                                          fontSize: "15px",
                                          fontWeight: "600",
                                          borderRadius: "12px",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "10px",
                                          boxShadow:
                                            "0 4px 15px rgba(30, 64, 175, 0.3)",
                                          transition: "all 0.3s ease",
                                        }}
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          if (meetingData?.status === "to_finish") {
                                            await handleReRunStep(
                                              meetingData?.steps[currentStepIndex],
                                            );
                                          } else {
                                            await handlePauseStep();
                                          }
                                        }}
                                      >
                                        {meetingData?.status === "to_finish" ? (
                                          <FiPlay size={16} />
                                        ) : (
                                          <FiPause size={16} />
                                        )}
                                        <span>
                                          {meetingData?.status === "to_finish"
                                            ? t("Restart")
                                            : t("Pause")}
                                        </span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            {/* // )} */}
                          </div>

                          {/* Close Button Desktop */}
                          <div className="justify-content-center">
                            <div className="d-flex prev-btn">
                              {isLoading ? (
                                <button className="btn btn-success">
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
                                <button
                                  className="btn"
                                  style={{
                                    background:
                                      currentStepIndex ===
                                      meetingData?.steps?.length - 1
                                        ? "linear-gradient(135deg, #10b981, #059669)"
                                        : "linear-gradient(135deg, #be185d, #ec4899)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    padding: "10px 24px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    boxShadow:
                                      currentStepIndex ===
                                      meetingData?.steps?.length - 1
                                        ? "0 4px 15px rgba(16, 185, 129, 0.3)"
                                        : "0 4px 15px rgba(190, 24, 93, 0.3)",
                                    transition: "all 0.3s ease",
                                  }}
                                  onClick={() =>
                                    currentStepIndex ===
                                    meetingData?.steps?.length - 1
                                      ? isAutomatic
                                        ? close()
                                        : closeMeeting()
                                      : setShowTimerModal(true)
                                  }
                                  disabled={isLoading}
                                >
                                  <FaStop size={14} />
                                  {t("Close")}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Desktop Dropdown - manual meeting type */}
                          <div className="dropdown">
                            <button
                              className="btn"
                              type="button"
                              id="manualTogglesDropdown"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 3,
                                cursor: "pointer",
                                padding: 0,
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                                transition: "all 0.3s ease",
                              }}
                            >
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    display: "block",
                                  }}
                                />
                              ))}
                            </button>

                            <ul
                              className="dropdown-menu dropdown-menu-end p-0"
                              aria-labelledby="manualTogglesDropdown"
                              style={{
                                width: 280,
                                borderRadius: 12,
                                overflow: "hidden",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                border: "1px solid rgba(0,0,0,0.05)",
                                padding: "8px 0",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {menuItems
                                .filter((item) => item.show)
                                .map((item, index, arr) => (
                                  <li
                                    key={item.key}
                                    className="px-3 py-2"
                                    style={{
                                      cursor: "default",
                                      transition: "background 0.2s ease",
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-3">
                                      <div
                                        className="d-flex align-items-center gap-3"
                                        style={{ flex: 1 }}
                                      >
                                        <div
                                          style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: item.iconBg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            color: "#fff",
                                            fontSize: "18px",
                                          }}
                                        >
                                          {item.icon}
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1,
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: 600,
                                              color: "#1e293b",
                                              lineHeight: 1.2,
                                            }}
                                          >
                                            {item.label}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: "11px",
                                              color: "#64748b",
                                              lineHeight: 1.1,
                                            }}
                                          >
                                            {item.sub}
                                          </span>
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          flexShrink: 0,
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <ReactToggle
                                          checked={item.checked}
                                          icons={false}
                                          onChange={item.onChange}
                                          style={{ transform: "scale(0.85)" }}
                                        />
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              </div>
            </div>

            {/* Right Side Text/Button */}
            {meetingData?.type === "Newsletter" ? (
              <>
                <div
                  className="d-none d-xl-flex align-items-center"
                  style={{
                    textAlign: "right",
                    gap: "10px",
                    position: "absolute",
                    right: "12%",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  {/* Desktop Dropdown - Newsletter type */}
                  {/* <div className="dropdown">
                    <button
                      className="btn dropdown-toggle"
                      type="button"
                      id="desktopTogglesDropdownNewsletter"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        backgroundColor: "#0026b1",
                        color: "#fff",
                        border: "none",
                        padding: "9px 14px",
                        fontSize: "14px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {iconMap[selectedOption || "Presentation"]}
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="desktopTogglesDropdownNewsletter"
                    >
                      <li className="dropdown-item">
                        <div className="d-flex align-items-center">
                          <ReactToggle
                            checked={showStepContentEditor}
                            icons={false}
                            onChange={(e) => {
                              handleStepContentEditor(e);
                              setSelectedOption(e.target.checked ? "Step" : "");
                            }}
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span className="ms-2">{t("presentation.Step")}</span>
                        </div>
                      </li>
                      <li className="dropdown-item">
                        <div className="d-flex align-items-center">
                          <ReactToggle
                            checked={notesEditor.showEditor}
                            icons={false}
                            onChange={(e) => {
                              handleNotesEditorToggle(e);
                              setSelectedOption(
                                e.target.checked ? "Notes" : "",
                              );
                            }}
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span className="ms-2">
                            {t("presentation.Notes")}
                          </span>
                        </div>
                      </li>
                      <li className="dropdown-item">
                        <div className="d-flex align-items-center">
                          <ReactToggle
                            checked={fileEditor.showEditor}
                            icons={false}
                            onChange={(e) => {
                              handleFileEditor(e);
                              setSelectedOption(
                                e.target.checked ? "Files" : "",
                              );
                            }}
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span className="ms-2">
                            {t("presentation.Files")}
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div> */}
                </div>

                {/* Top Row for Mobile */}
                <div className="d-flex d-xl-none w-100 justify-content-center align-items-center gap-2">
                  <div className="dropdown d-flex justify-content-center">
                    {meetingData?.type === "Newsletter" ? (
                       <div className="dropdown">
                    <button
                      className="btn"
                      type="button"
                      id="manualTogglesDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 3,
                        cursor: "pointer",
                        padding: 0,
                        boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#fff",
                            display: "block",
                          }}
                        />
                      ))}
                    </button>

                    <ul
                      className="dropdown-menu dropdown-menu-end p-0"
                      aria-labelledby="manualTogglesDropdown"
                      style={{
                        width: 280,
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        padding: "8px 0",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {menuItems
                        .filter((item) => item.show)
                        .map((item, index, arr) => (
                          <li
                            key={item.key}
                            className="px-3 py-2"
                            style={{
                              cursor: "default",
                              transition: "background 0.2s ease",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center gap-3"
                                style={{ flex: 1 }}
                              >
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: item.iconBg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    color: "#fff",
                                    fontSize: "18px",
                                  }}
                                >
                                  {item.icon}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: "#1e293b",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {item.sub}
                                  </span>
                                </div>
                              </div>

                              <div
                                style={{
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ReactToggle
                                  checked={item.checked}
                                  icons={false}
                                  onChange={item.onChange}
                                  style={{ transform: "scale(0.85)" }}
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                    ) : (
                       <div className="dropdown">
                    <button
                      className="btn"
                      type="button"
                      id="manualTogglesDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 3,
                        cursor: "pointer",
                        padding: 0,
                        boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#fff",
                            display: "block",
                          }}
                        />
                      ))}
                    </button>

                    <ul
                      className="dropdown-menu dropdown-menu-end p-0"
                      aria-labelledby="manualTogglesDropdown"
                      style={{
                        width: 280,
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        padding: "8px 0",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {menuItems
                        .filter((item) => item.show)
                        .map((item, index, arr) => (
                          <li
                            key={item.key}
                            className="px-3 py-2"
                            style={{
                              cursor: "default",
                              transition: "background 0.2s ease",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center gap-3"
                                style={{ flex: 1 }}
                              >
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: item.iconBg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    color: "#fff",
                                    fontSize: "18px",
                                  }}
                                >
                                  {item.icon}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: "#1e293b",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {item.sub}
                                  </span>
                                </div>
                              </div>

                              <div
                                style={{
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ReactToggle
                                  checked={item.checked}
                                  icons={false}
                                  onChange={item.onChange}
                                  style={{ transform: "scale(0.85)" }}
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                    )}
                  </div>

                  {recordingStart && <RecordingIndicator t={t} />}

                  {meetingData?.type === "Newsletter" ? (
                    <>
                      {isAutomatic ? (
                        <div className="d-flex gap-2 prev-btn align-items-center ">
                          <div className="justify-content-center">
                            <div className="d-flex prev-btn">
                              {isLoading ? (
                                <button className="btn btn-success">
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
                                <button
                                  className="btn"
                                  style={{
                                    backgroundColor:
                                      currentStepIndex ===
                                      meetingData?.steps?.length - 1
                                        ? "#198754"
                                        : "red",
                                    color: "#fff",
                                    border: "none",
                                    padding: "9px 26px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    borderRadius: "5px",
                                    transition: "background-color 0.3s",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  // onClick={() => close()}
                                  onClick={() =>
                                    currentStepIndex ===
                                    meetingData?.steps?.length - 1
                                      ? close()
                                      : setShowTimerModal(true)
                                  }
                                  disabled={isLoading}
                                >
                                  <FaRegStopCircle size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Next button */}
                          {currentStepIndex !==
                          meetingData?.steps?.length - 1 ? (
                            <>
                              {isLoadingNext ? (
                                <button className="btn btn-primary">
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
                                <button
                                  className="btn"
                                  style={{
                                    backgroundColor: "#0026b1",
                                    color: "#fff",
                                    border: "none",
                                    padding: "9px 13px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    borderRadius: "5px",
                                    transition: "background-color 0.3s",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  onClick={() => next()}
                                  disabled={isLoadingNext}
                                >
                                  <MdNavigateNext size={16} />
                                </button>
                              )}
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <div className="d-flex justify-content-center ">
                          <div className="d-flex gap-2 justify-content-center">
                            <div className="d-flex gap-3 prev-btn">
                              <button
                                className="btn"
                                style={{
                                  backgroundColor:
                                    currentStepIndex ===
                                    meetingData?.steps?.length - 1
                                      ? "#198754"
                                      : "red",
                                  color: "#fff",
                                  border: "none",
                                  padding: "9px 26px",
                                  fontSize: "16px",
                                  cursor: "pointer",
                                  borderRadius: "5px",
                                  transition: "background-color 0.3s",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                onClick={() =>
                                  currentStepIndex ===
                                  meetingData?.steps?.length - 1
                                    ? closeMeeting()
                                    : setShowTimerModal(true)
                                }
                              >
                                {isLoading ? (
                                  <Spinner
                                    as="span"
                                    variant="light"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    animation="border"
                                  />
                                ) : (
                                  <FaRegStopCircle size={16} />
                                )}
                              </button>
                            </div>
                            {currentStepIndex !==
                            meetingData?.steps?.length - 1 ? (
                              <>
                                <div className="d-flex prev-btn">
                                  {isNext ? (
                                    <button className="btn btn-primary">
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
                                    <button
                                      className="btn"
                                      style={{
                                        backgroundColor: "#0026b1",
                                        color: "#fff",
                                        border: "none",
                                        padding: "9px  13px",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        borderRadius: "5px",
                                        transition: "background-color 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      onClick={async () => {
                                        await handlenextPage();
                                      }}
                                    >
                                      <MdNavigateNext size={16} />
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {showButton && (
                        <>
                          {isAutomatic ? (
                            <div className="d-flex gap-2 prev-btn align-items-center">
                              <div className="justify-content-center">
                                <div className="d-flex prev-btn">
                                  {isLoading ? (
                                    <button className="btn btn-success">
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
                                    <button
                                      className="btn"
                                      style={{
                                        backgroundColor:
                                          currentStepIndex ===
                                          meetingData?.steps?.length - 1
                                            ? "#198754"
                                            : "red",
                                        color: "#fff",
                                        border: "none",
                                        padding: "9px 13px",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        borderRadius: "5px",
                                        transition: "background-color 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      // onClick={() => close()}
                                      onClick={() =>
                                        currentStepIndex ===
                                        meetingData?.steps?.length - 1
                                          ? close()
                                          : setShowTimerModal(true)
                                      }
                                      disabled={isLoading}
                                    >
                                      <FaRegStopCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Next button */}
                              {currentStepIndex !==
                              meetingData?.steps?.length - 1 ? (
                                <>
                                  {isLoadingNext ? (
                                    <button className="btn btn-primary">
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
                                    <button
                                      className="btn"
                                      style={{
                                        backgroundColor: "#0026b1",
                                        color: "#fff",
                                        border: "none",
                                        padding: "9px 13px",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        borderRadius: "5px",
                                        transition: "background-color 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      onClick={() => next()}
                                      disabled={isLoadingNext}
                                    >
                                      <MdNavigateNext size={16} />
                                    </button>
                                  )}
                                </>
                              ) : null}
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <div className="d-flex gap-3 prev-btn">
                                  <button
                                    className="btn"
                                    style={{
                                      backgroundColor:
                                        currentStepIndex ===
                                        meetingData?.steps?.length - 1
                                          ? "#198754"
                                          : "red",
                                      color: "#fff",
                                      border: "none",
                                      padding: "9px 13px",
                                      fontSize: "16px",
                                      cursor: "pointer",
                                      borderRadius: "5px",
                                      transition: "background-color 0.3s",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    onClick={() =>
                                      currentStepIndex ===
                                      meetingData?.steps?.length - 1
                                        ? closeMeeting()
                                        : setShowTimerModal(true)
                                    }
                                  >
                                    {isLoading ? (
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    ) : (
                                      <FaRegStopCircle size={16} />
                                    )}
                                  </button>
                                </div>
                                {currentStepIndex !==
                                meetingData?.steps?.length - 1 ? (
                                  <>
                                    <div className="d-flex prev-btn">
                                      {isNext ? (
                                        <button className="btn btn-primary">
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
                                        <button
                                          className="btn"
                                          style={{
                                            backgroundColor: "#0026b1",
                                            color: "#fff",
                                            border: "none",
                                            padding: "9px 13px",
                                            fontSize: "16px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            transition: "background-color 0.3s",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                          onClick={async () => {
                                            await handlenextPage();
                                          }}
                                        >
                                          <MdNavigateNext size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Top Row for Mobile Pending work */}
                {/* {recordingStart && (
                  <div className="d-flex d-xl-none w-100 justify-content-center align-items-center gap-2">
                    <RecordingIndicator t={t} />
                  </div>
                )} */}
                <div className="d-flex d-xl-none w-100 justify-content-center align-items-center gap-2">
                   {!recordingStart && (meetingData?.location === "Google Meet" ||
                  meetingData?.location === "Microsoft Teams") && (
                  <button
                    style={{
                      backgroundColor: "#0026b1",
                      color: "#fff",
                      border: "none",
                      padding: "9px 15px",
                      fontSize: "14px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      transition: "background-color 0.3s",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={async () => {
                      if (
                        meetingData?.prise_de_notes === "Automatic" &&
                        meetingData?.meet_link
                      ) {
                        await starting();
                      } else if (
                        meetingData?.meet_link &&
                        meetingData?.prise_de_notes === "Manual"
                      ) {
                        window.open(meetingData?.meet_link, "_blank");
                      } else if (
                        meetingData?.prise_de_notes === "Automatic" &&
                        !meetingData?.meet_link
                      ) {
                        await starting();
                      } else if (
                        meetingData?.prise_de_notes === "Manual" &&
                        !meetingData?.meet_link
                      ) {
                        window.open(meetingData?.meet_link, "_blank");
                      } else {
                        await starting();
                      }
                    }}
                  >
                    {t("Join")}
                  </button>
                )}
                  <div className="dropdown">
                    <button
                      className="btn"
                      type="button"
                      id="manualTogglesDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 3,
                        cursor: "pointer",
                        padding: 0,
                        boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#fff",
                            display: "block",
                          }}
                        />
                      ))}
                    </button>

                    <ul
                      className="dropdown-menu dropdown-menu-end p-0"
                      aria-labelledby="manualTogglesDropdown"
                      style={{
                        width: 280,
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid rgba(0,0,0,0.05)",
                        padding: "8px 0",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {menuItems
                        .filter((item) => item.show)
                        .map((item, index, arr) => (
                          <li
                            key={item.key}
                            className="px-3 py-2"
                            style={{
                              cursor: "default",
                              transition: "background 0.2s ease",
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center gap-3"
                                style={{ flex: 1 }}
                              >
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: item.iconBg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    color: "#fff",
                                    fontSize: "18px",
                                  }}
                                >
                                  {item.icon}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: "#1e293b",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#64748b",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {item.sub}
                                  </span>
                                </div>
                              </div>

                              <div
                                style={{
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ReactToggle
                                  checked={item.checked}
                                  icons={false}
                                  onChange={item.onChange}
                                  style={{ transform: "scale(0.85)" }}
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                  {/* {meetingData?.guides?.some(
                    (item) => item?.email === CookieService.get("email"),
                  ) && ( */}
                    <div className="d-flex justify-content-center align-items-center">
                      <button
                        className="btn"
                        style={{
                          background:
                            meetingData?.status === "to_finish"
                              ? "linear-gradient(135deg, #059669, #10b981)"
                              : "linear-gradient(135deg, #1e40af, #3b82f6)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                          padding: "9px 14px",

                          fontSize: "16px",
                          borderRadius: "5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          boxShadow:
                            meetingData?.status === "to_finish"
                              ? "0 4px 15px rgba(5, 150, 105, 0.3)"
                              : "0 4px 15px rgba(30, 64, 175, 0.3)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          justifyContent: "center",
                        }}
                        onClick={async (e) => {
                          e.preventDefault();
                          if (meetingData?.status === "to_finish") {
                            await handleReRunStep(
                              meetingData?.steps[currentStepIndex],
                            );
                          } else {
                            await handlePauseStep();
                          }
                        }}
                      >
                        {meetingData?.status === "to_finish" ? (
                          <>
                            <FiPlay size={16} />
                          </>
                        ) : (
                          <>
                            <FiPause size={16} />
                          </>
                        )}
                      </button>
                    </div>


                  {meetingData?.type === "Newsletter" ? (
                    <>
                     <div className="d-flex justify-content-center ">
                          <div className="d-flex gap-2 justify-content-center">
                            <div className="d-flex gap-3 prev-btn">
                              <button
                                className="btn"
                                style={{
                                  background:
                                    currentStepIndex ===
                                    meetingData?.steps?.length - 1
                                      ? "linear-gradient(135deg, #10b981, #059669)"
                                      : "linear-gradient(135deg, #be185d, #ec4899)",
                                  color: "#fff",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                  padding: "10px 24px",
                                  fontSize: "15px",
                                  fontWeight: "600",
                                  borderRadius: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                                  transition: "all 0.3s ease",
                                }}
                                onClick={() =>
                                  currentStepIndex ===
                                  meetingData?.steps?.length - 1
                                    ? closeMeeting()
                                    : setShowTimerModal(true)
                                }
                              >
                                {isLoading ? (
                                  <Spinner
                                    as="span"
                                    variant="light"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    animation="border"
                                  />
                                ) : (
                                  <>
                                    <FaStop size={14} />
                                    {t("Close")}
                                  </>
                                )}
                              </button>
                            </div>
                            {currentStepIndex !==
                            meetingData?.steps?.length - 1 ? (
                              <>
                                <div className="d-flex prev-btn">
                                  {isNext ? (
                                    <button className="btn btn-primary">
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
                                    <button
                                      className="btn"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #1e40af, #3b82f6)",
                                        color: "#fff",
                                        border:
                                          "1px solid rgba(255,255,255,0.2)",
                                        padding: "10px 24px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        boxShadow:
                                          "0 4px 15px rgba(30, 64, 175, 0.3)",
                                        transition: "all 0.3s ease",
                                      }}
                                      onClick={async () => {
                                        await handlenextPage();
                                      }}
                                    >
                                      <MdNavigateNext size={22} />
                                      {t("Next")}
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                    </>
                  ) : (
                    <>
                      {showButton && (
                        <>
                          {isAutomatic ? (
                            <div className="d-flex gap-2 prev-btn align-items-center">
                              <div className="justify-content-center">
                                <div className="d-flex prev-btn">
                                  {isLoading ? (
                                    <button className="btn btn-success">
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
                                    <button
                                      className="btn"
                                      style={{
                                        backgroundColor:
                                          currentStepIndex ===
                                          meetingData?.steps?.length - 1
                                            ? "#198754"
                                            : "red",
                                        color: "#fff",
                                        border: "none",
                                        padding: "9px 13px",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        borderRadius: "5px",
                                        transition: "background-color 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      // onClick={() => close()}
                                      onClick={() =>
                                        currentStepIndex ===
                                        meetingData?.steps?.length - 1
                                          ? close()
                                          : setShowTimerModal(true)
                                      }
                                      disabled={isLoading}
                                    >
                                      <FaRegStopCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Next button */}
                              {currentStepIndex !==
                              meetingData?.steps?.length - 1 ? (
                                <>
                                  {isLoadingNext ? (
                                    <button className="btn btn-primary">
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
                                    <button
                                      className="btn"
                                      style={{
                                        backgroundColor: "#0026b1",
                                        color: "#fff",
                                        border: "none",
                                        padding: "9px 13px",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        borderRadius: "5px",
                                        transition: "background-color 0.3s",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      onClick={() => next()}
                                      disabled={isLoadingNext}
                                    >
                                      <MdNavigateNext size={16} />
                                    </button>
                                  )}
                                </>
                              ) : null}
                            </div>
                          ) : (
                            <div className="d-flex justify-content-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <div className="d-flex gap-3 prev-btn">
                                  <button
                                    className="btn"
                                    style={{
                                      backgroundColor:
                                        currentStepIndex ===
                                        meetingData?.steps?.length - 1
                                          ? "#198754"
                                          : "red",
                                      color: "#fff",
                                      border: "none",
                                      padding: "9px 13px",
                                      fontSize: "16px",
                                      cursor: "pointer",
                                      borderRadius: "5px",
                                      transition: "background-color 0.3s",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    onClick={() =>
                                      currentStepIndex ===
                                      meetingData?.steps?.length - 1
                                        ? closeMeeting()
                                        : setShowTimerModal(true)
                                    }
                                  >
                                    {isLoading ? (
                                      <Spinner
                                        as="span"
                                        variant="light"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        animation="border"
                                      />
                                    ) : (
                                      <FaRegStopCircle size={16} />
                                    )}
                                  </button>
                                </div>
                                {currentStepIndex !==
                                meetingData?.steps?.length - 1 ? (
                                  <>
                                    <div className="d-flex prev-btn">
                                      {isNext ? (
                                        <button className="btn btn-primary">
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
                                        <button
                                          className="btn"
                                          style={{
                                            backgroundColor: "#0026b1",
                                            color: "#fff",
                                            border: "none",
                                            padding: "9px 13px",
                                            fontSize: "16px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            transition: "background-color 0.3s",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                          onClick={async () => {
                                            await handlenextPage();
                                          }}
                                        >
                                          <MdNavigateNext size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* third row for next button only  desktop only*/}
          {/* Third row for next button aligned to the right */}
          <div className="row w-100 d-none d-lg-flex m-0 p-0">
            {/* Pehli empty div (4 columns) - Step Title restored here with modern design */}
            <div className="col-md-4 d-none d-lg-block">
              <Tooltip
                title={
                  meetingData?.steps[currentStepIndex]?.order_no +
                  ".\u00A0" +
                  meetingData?.steps[currentStepIndex]?.title
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.8))",
                    padding: "8px 20px",
                    borderRadius: "15px",
                    border: "1px solid rgba(30, 58, 138, 0.1)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    maxWidth: "100%",
                    cursor: "default",
                    marginTop: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#1e3a8a",
                      flexShrink: 0,
                    }}
                  >
                    {meetingData?.steps[currentStepIndex]?.order_no}.
                  </span>
                  <h4
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#334155",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flexGrow: 1,
                    }}
                  >
                    {meetingData?.steps[currentStepIndex]?.title}
                  </h4>
                </div>
              </Tooltip>
            </div>

            {/* Doosri empty div (4 columns) */}
            <div className="col-md-4"></div>

            {/* Teesri div button ke liye (4 columns) */}
            <div
              className="col-md-4"
              style={{
                display: "flex",
                justifyContent: "end", // Button ko is 4-column space ke center mein rakhne ke liye
                alignItems: "center",
                // marginTop: "8px",
              }}
            >
              {/* Action buttons logic start */}
              <div className="d-flex gap-3 align-items-center play-meeting-btn action-buttons">
                {meetingData?.type === "Newsletter" ? (
                  <>
                    {isAutomatic ? (
                      <div className="d-flex gap-2 prev-btn align-items-center d-none d-lg-flex">
                        {currentStepIndex !== meetingData?.steps?.length - 1 &&
                          (isLoadingNext ? (
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                borderRadius: "12px",
                                padding: "10px 24px",
                              }}
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
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.2)",
                                padding: "10px 24px",
                                fontSize: "15px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() => next()}
                              disabled={isLoadingNext}
                            >
                              <MdNavigateNext size={22} />
                              {t("Next")}
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="d-flex justify-content-center d-none d-lg-flex">
                        <div className="d-flex gap-2 justify-content-center">
                          {currentStepIndex !==
                            meetingData?.steps?.length - 1 && (
                            <div className="d-flex prev-btn">
                              {isNext ? (
                                <button
                                  className="btn"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #1e40af, #3b82f6)",
                                    borderRadius: "12px",
                                    padding: "10px 24px",
                                  }}
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
                                <button
                                  className="btn"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #1e40af, #3b82f6)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    padding: "10px 24px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    boxShadow:
                                      "0 4px 15px rgba(30, 64, 175, 0.3)",
                                    transition: "all 0.3s ease",
                                  }}
                                  onClick={async () => await handlenextPage()}
                                >
                                  <MdNavigateNext size={22} />
                                  {t("Next")}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showButton && (
                      <div className="d-flex gap-2 prev-btn align-items-center d-none d-lg-flex">
                        {currentStepIndex !== meetingData?.steps?.length - 1 &&
                          (isLoadingNext || isNext ? (
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                borderRadius: "12px",
                                padding: "10px 24px",
                              }}
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
                            <button
                              className="btn"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1e40af, #3b82f6)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.2)",
                                padding: "10px 24px",
                                fontSize: "15px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.3)",
                                transition: "all 0.3s ease",
                              }}
                              onClick={() =>
                                isAutomatic ? next() : handlenextPage()
                              }
                              disabled={isLoadingNext || isNext}
                            >
                              <MdNavigateNext size={22} />
                              {t("Next")}
                            </button>
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Data Section */}

          {recordingStart && (
            <div className="d-flex justify-content-center align-items-center d-none d-lg-flex mt-3">
              <RecordingIndicator t={t} />
            </div>
          )}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0, // Important for flex children to scroll properly
              marginTop: isMobile ? "4rem" : "1.3rem", //isMobile ? "0rem" : "0",
              // zIndex: "-1",
            }}
          >

            {editorContent && (
              <div>
                <div
                  className={`
                                 ${
                                   !decisionEditor.showEditor ||
                                   !notesEditor.showEditor ||
                                   !planDActionEditor.showEditor ||
                                   !questionEditor.showEditor ||
                                   !mediaEditor.showEditor ||
                                   !fileEditor.showEditor
                                    ? ""
                                     : "displaycard card-body"
                                 }
                                
                                 `}
                  style={{
                    maxHeight: isMobile ? "none" : "calc(100vh - 350px)",
                    height: isMobile ? "auto" : "auto",
                    minHeight: isMobile ? "400px" : "500px",
                     border:
                      showStepContentEditor === false &&
                      !decisionEditor.showEditor &&
                      !notesEditor.showEditor &&
                      !questionEditor.showEditor &&
                      !mediaEditor.showEditor &&
                      !planDActionEditor.showEditor &&
                      !fileEditor.showEditor &&
                      "2px solid #eee",
                    // overflowY: "auto",
                    padding:
                      showStepContentEditor === false &&
                      !decisionEditor.showEditor &&
                      !notesEditor.showEditor &&
                      !questionEditor.showEditor &&
                      !mediaEditor.showEditor &&
                      !planDActionEditor.showEditor &&
                      !fileEditor.showEditor &&
                      "10px",
                    marginTop: "1rem",
                  }}
                >
                  {decisionEditor.showEditor === false &&
                    showStepContentEditor === false &&
                    notesEditor.showEditor === false &&
                    questionEditor.showEditor === false &&
                    mediaEditor.showEditor === false &&
                    planDActionEditor.showEditor === false &&
                    fileEditor.showEditor === false &&
                    show.showEditor === false &&
                    (meetingData?.steps[currentStepIndex]?.editor_type ===
                      "File" ||
                    meetingData?.steps[currentStepIndex]?.editor_type ===
                      "Video" ||
                    meetingData?.steps[currentStepIndex]?.editor_type ===
                      "Photo" ? (
                      <div>
                        <iframe
                          src={
                            Assets_URL +
                            "/" +
                            meetingData?.steps[currentStepIndex]?.file
                          }
                          width="100%"
                          style={{ height: isMobile ? "400px" : "100vh" }}
                        />
                      </div>
                    ) : meetingData?.steps[currentStepIndex]?.editor_type ===
                      "Excel" ? (
                      <div className="iframe-container">
                        <Spreadsheet
                          data={excelData || []}
                          // onChange={handleSpreadsheetChange}
                        />
                      </div>
                    ) : meetingData?.steps[currentStepIndex]?.editor_type ===
                      "Url" ? (
                      <div className="iframe-container">
                        <iframe
                          // ref={iframeRef}
                          // src={meetingData?.steps[currentStepIndex]?.url}
                          src={getYoutubeEmbedUrl(
                            meetingData?.steps[currentStepIndex]?.url,
                          )}
                          width="100%"
                          style={{ height: isMobile ? "400px" : "100vh" }}
                          onLoad={() => setIFrameLoad(false)}
                        />
                        {iFrameLoad && <div className="loader"></div>}
                      </div>
                    ) : (
                      <div
                        className="rendered-content"
                        // style={{ height: "100vh" }}
                        dangerouslySetInnerHTML={{
                          __html: sanitizedContent,
                        }}
                      />
                    ))}

                  {/* NOTES EDITOR */}
                  {notesEditor.showEditor && (
                    <>
                      {meetingData?.type === "Newsletter" ? (
                        <div style={{ height: isMobile ? "auto" : "calc(100vh - 400px)" }}>
                          <div
                            key={emailCampaign}
                            className="h-100"
                            style={{
                              overflowY: "auto",
                              borderBottom: "1px solid #ccc",
                              padding: "10px",
                              borderRadius: "5px",
                            }}
                          >
                            <div className="row d-flex flex-column">
                              <div className="d-flex gap-3 fs-4">
                                <h6>Campaign Name: </h6>
                                <h6>{emailCampaign?.campaign_name}</h6>
                              </div>
                              <div className="d-flex ga-3">
                                <h6>Total Sendings: </h6>
                                <h6>{emailCampaign?.total_sendings}</h6>
                              </div>
                              <div className="d-flex ga-3">
                                <h6>Total Recipients: </h6>
                                <h6>{emailCampaign?.total_recipients}</h6>
                              </div>
                              <div className="d-flex ga-3">
                                <h6>Total Opens: </h6>
                                <h6>{emailCampaign?.total_opens}</h6>
                              </div>
                              <div className="d-flex ga-3">
                                <h6>Total clicks: </h6>
                                <h6>{emailCampaign?.total_clicks}</h6>
                              </div>
                              <div className="d-flex ga-3">
                                <h6>Total Unsubscribes: </h6>
                                <h6>{emailCampaign?.total_unsubscribes}</h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Editor
                          onBlur={(value) => {
                            console.log("value", value);
                          }}
                          key={currentStepIndex}
                          apiKey={TINYMCEAPI}
                          value={stepNotes[currentStepIndex]}
                          init={{
                            statusbar: false,
                            branding: false,
                            height: 900,
                            menubar: true,
                            language: "fr_FR",
                            // language: "en_EN",
                            plugins:
                              "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                            toolbar:
                              "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                            image_advtab: true,
                            file_picker_types: "image",

                            file_picker_callback: function (
                              callback,
                              value,
                              meta,
                            ) {
                              if (meta.filetype === "image") {
                                const input = document.createElement("input");
                                input.setAttribute("type", "file");
                                input.setAttribute("accept", "image/*");

                                input.onchange = function () {
                                  const file = input.files[0];
                                  const reader = new FileReader();

                                  reader.onload = function (e) {
                                    const img = new Image();
                                    img.src = e.target.result;

                                    img.onload = function () {
                                      const canvas =
                                        document.createElement("canvas");
                                      const ctx = canvas.getContext("2d");
                                      const maxWidth = 700;
                                      const maxHeight = 394;

                                      let newWidth = img.width;
                                      let newHeight = img.height;

                                      if (img.width > maxWidth) {
                                        newWidth = maxWidth;
                                        newHeight =
                                          (img.height * maxWidth) / img.width;
                                      }

                                      if (newHeight > maxHeight) {
                                        newHeight = maxHeight;
                                        newWidth =
                                          (img.width * maxHeight) / img.height;
                                      }

                                      canvas.width = newWidth;
                                      canvas.height = newHeight;

                                      ctx.drawImage(
                                        img,
                                        0,
                                        0,
                                        newWidth,
                                        newHeight,
                                      );

                                      const resizedImageData = canvas.toDataURL(
                                        file.type,
                                      );

                                      // Pass the resized image data to the callback function
                                      callback(resizedImageData, {
                                        alt: file.name,
                                      });
                                    };

                                    img.src = e.target.result;
                                  };

                                  reader.readAsDataURL(file);
                                };

                                input.click();
                              }
                            },
                          }}
                          // onEditorChange={(value) => {
                          //   setNotes(value);
                          // }}
                          onEditorChange={(value) => {
                            setStepNotes((prev) => {
                              let newStepNotes = [...prev];
                              newStepNotes[currentStepIndex] = value;
                              return newStepNotes;
                            });
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* DECISION EDITOR */}
                  {decisionEditor.showEditor && (
                    <div className="col-md-12 mt-4">
                      <div className="decision-editor-container">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5>{t("Decisions")}</h5>
                          <button
                            className="btn btn-primary"
                            style={{
                              backgroundColor: "rgb(0, 38, 177)",
                            }}
                            onClick={() => addDecisionForStep(currentStepIndex)}
                          >
                            + {t("presentation.Add Decision")}
                          </button>
                        </div>

                        <div className="decision-table-scroll">
                          <Table bordered className="action-table">
                            <thead>
                              <tr className="table-row">
                                <th className="table-row-head text-center">
                                  {t("presentation.Decision Type")}
                                </th>
                                <th className="table-row-head text-center">
                                  {t("presentation.Description")}
                                </th>
                                <th className="table-row-head text-center">
                                  {t("presentation.Value")}
                                </th>

                                <th className="table-row-head text-center">
                                  {t("presentation.Apply Decision To")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {meetingData?.steps?.map(
                                (step, stepIndex) =>
                                  step?.decision && step.decision.length > 0
                                    ? step.decision.map((decision, index) => (
                                        <tr key={index} className="table-data">
                                          <td>{decision?.decision_type}</td>
                                          <td>{decision?.decision}</td>
                                          <td>
                                            {decision?.decision_type ===
                                            "Milestone"
                                              ? decision?.milestone_date
                                              : decision?.decision_type ===
                                                  "Budget"
                                                ? `${decision?.budget_amount} ${
                                                    decision?.currency || ""
                                                  }`
                                                : decision?.creation_date}
                                          </td>
                                          {/* <td>
                                            {decision?.budget_amount
                                              ? `$${Number(
                                                  decision.budget_amount
                                                ).toLocaleString()}`
                                              : "-"}
                                          </td> */}
                                          <td>{decision?.decision_apply}</td>
                                        </tr>
                                      ))
                                    : null, // Do nothing if there are no decisions
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {fileEditor.showEditor && (
                    <>
                      {!isModalOpen2 && (
                        <StepFile
                          isFileUploaded={isFileUploaded}
                          setIsFileUploaded={setIsFileUploaded}
                          openModal={openModal}
                          meetingFiles={meetingData?.meeting_files || meetingFile}
                          inProgressFiles={true}
                        />
                      )}
                      {isModalOpen2 && (
                        <>
                          {/* Delete and Close Buttons */}
                          <div className="d-flex gap-2 justify-content-end align-items-center mt-2 mb-2">
                            <button
                              onClick={closeModal}
                              className="delete-file-modal-button2"
                              style={{ zIndex: 9999 }}
                            >
                              Close
                            </button>
                          </div>
                          <div
                            style={{
                              // width: "100vw",
                              height: "100vh",
                              zIndex: 99999999999, // make sure it's above everything
                              // overflowY: "auto",
                              // padding: "1rem",
                            }}
                          >
                            {modalContent ? (
                              <>
                                <div
                                  style={{
                                    width: "100vw",
                                    height: "100vh",
                                    zIndex: 99999999999, // make sure it's above everything
                                    // overflowY: "auto",
                                    // padding: "1rem",
                                  }}
                                >
                                  {/* Show PDF or Other File Types */}
                                  {modalContent?.file_type &&
                                  modalContent?.file_type.includes("pdf") ? (
                                    <iframe
                                      title="File Preview"
                                      src={`${
                                        modalContent
                                          ? `${Assets_URL}/${modalContent?.file_path}`
                                          : ""
                                      }#toolbar=0&view=fitH`}
                                      className="fileuploadingiframe w-100"
                                      width="100%"
                                      style={{ height: "100vh" }}
                                    ></iframe>
                                  ) : modalContent?.file_type?.includes(
                                      "video",
                                    ) ? (
                                    <iframe
                                      title="File Preview"
                                      src={`${
                                        modalContent
                                          ? `${Assets_URL}/${modalContent?.file_path}`
                                          : ""
                                      }#toolbar=0&view=fitH`}
                                      //  className="fileuploadingiframe w-100"
                                      width="100%"
                                      style={{ height: "100vh" }}
                                    ></iframe>
                                  ) : null}

                                  {/* Show Excel Preview if the file is Excel */}
                                  {modalContent?.file_type ===
                                  "application/vnd.ms-excel" ? (
                                    <div className="table-responsive">
                                      {loading ? (
                                        <Spinner
                                          as="span"
                                          variant="light"
                                          size="sm"
                                          role="status"
                                          aria-hidden="true"
                                          animation="border"
                                        />
                                      ) : (
                                        <div
                                          className="table-responsive"
                                          style={{
                                            maxHeight: "80vh",
                                            overflowY: "auto",
                                          }}
                                        >
                                          <table className="table table-bordered">
                                            <thead>
                                              <tr>
                                                {Object.keys(
                                                  excelData[0] || {},
                                                ).map((key, index) => (
                                                  <th key={index}>{key}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {excelData.map(
                                                (row, rowIndex) => (
                                                  <tr key={rowIndex}>
                                                    {Object.values(row).map(
                                                      (value, colIndex) => (
                                                        <td key={colIndex}>
                                                          {value}
                                                        </td>
                                                      ),
                                                    )}
                                                  </tr>
                                                ),
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  ) : (modalContent &&
                                      modalContent?.file_type ===
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                                    modalContent?.file_type === "text/plain" ||
                                    modalContent?.file_type === "image/png" ||
                                    modalContent?.file_type ===
                                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                    <div
                                      className="file-viewer-container"
                                      style={{ height: "100vh" }}
                                    >
                                      <DocViewer
                                        documents={[
                                          {
                                            uri: `${Assets_URL}/${modalContent?.file_path}`,
                                          },
                                        ]}
                                        pluginRenderers={DocViewerRenderers}
                                        config={{
                                          header: {
                                            disableFileName: true,
                                            retainURLParams: true,
                                          },
                                        }}
                                      />
                                      {/* <iframe
  title="DOCX Preview"
  src={`https://docs.google.com/gview?url=${Assets_URL}/${modalContent?.file_path}&embedded=true`}
  style={{ width: "100%", height: "100vh" }}
  frameBorder="0"
/> */}
                                    </div>
                                  ) : null}
                                </div>
                              </>
                            ) : (
                              <p>No content to display.</p>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {questionEditor.showEditor && (
                    <div className="search-container-report">
                      <Search
                        onSearch={handleSearch}
                        onIframeUrl={(url) => {
                          setIsIframeLoading(true); // Loader start
                          handleIframeUrl(url);
                        }}
                      />

                      {iframeUrl && (
                        <div
                          style={{
                            marginTop: "20px",
                            width: "100%",
                            height: "600px", // Parent container ki height fix rakhen
                            position: "relative", // Loader ko center karne ke liye zaroori hai
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          {/* Loader UI */}
                          {isIframeLoading && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "white", // Taaki piche ka khali iframe na dikhe
                                zIndex: 20,
                              }}
                            >
                              {/* Simple CSS Spinner agar aapke paas Ant Design ya koi library nahi hai */}
                              <Spin size="large" />
                              <p
                                style={{
                                  marginTop: "15px",
                                  color: "#1890ff",
                                  fontWeight: "500",
                                }}
                              >
                                Chargement du contenu...
                              </p>
                            </div>
                          )}

                          <iframe
                            src={iframeUrl}
                            onLoad={(e) => {
                              setIsIframeLoading(false); // Loader stop
                              try {
                                const iframeDoc =
                                  e.target.contentDocument ||
                                  e.target.contentWindow.document;
                                const style = iframeDoc.createElement("style");
                                style.textContent = `
                .sidebar, .ant-layout-sider, .header, #sidebar-id, .header-class { 
                  display: none !important; 
                }
                .main-content { margin-left: 0 !important; }
              `;
                                iframeDoc.head.appendChild(style);
                              } catch (err) {
                                console.error(
                                  "Cross-origin restriction: Cannot access iframe DOM",
                                  err,
                                );
                              }
                            }}
                            title="Search Results"
                            style={{
                              width: "100%",
                              height: "100%", // Parent ki poori height lega
                              border: "none",
                              visibility: isIframeLoading
                                ? "hidden"
                                : "visible", // 'none' ki jagah 'hidden' use karein
                            }}
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                      )}
                      {/* 4. Close button ko container se bahar rakhen taaki wo hamesha dikhe */}
                      {iframeUrl && (
                        <button
                          onClick={() => {
                            setIframeUrl("");
                            setIsIframeLoading(false);
                          }}
                          style={{
                            marginTop: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#f0f0f0",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          {t("close")}
                        </button>
                      )}
                    </div>
                  )}
                  {mediaEditor.showEditor && (
                    <div
                      className="media-upload-container"
                      style={{
                        padding: "24px",
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        marginTop: "1rem",
                      }}
                    >
                      <h5 className="mb-4">
                        <BiCloudUpload className="me-2" />
                        {t("presentation.Upload Media")}
                      </h5>

                      {/* Mobile vs Desktop */}
                      {(() => {
                        const isMobile = /iPhone|iPad|iPod|Android/i.test(
                          navigator.userAgent,
                        );

                        return isMobile ? (
                          <div className="text-center">
                            {/* Input for Camera (Mobile specific) */}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              style={{ display: "none" }}
                              id="mobile-cam"
                              onChange={(e) => {
                                console.log("Camera input changed");
                                handleMediaUpload(e.target.files);
                              }}
                            />
                            <label
                              htmlFor="mobile-cam"
                              onClick={() =>
                                console.log("Camera label clicked")
                              }
                            >
                              <div
                                style={{
                                  padding: "20px 40px",
                                  background: "#0066ff",
                                  color: "white",
                                  borderRadius: "16px",
                                  fontSize: "18px",
                                  fontWeight: "600",
                                  display: "inline-block",
                                  cursor: "pointer",
                                  boxShadow: "0 4px 12px rgba(0,102,255,0.3)",
                                }}
                              >
                                {t("Open Camera")}
                              </div>
                            </label>

                            <div className="mt-3">
                              {/* Input for Gallery (Mobile specific) */}
                              <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                style={{ display: "none" }}
                                id="mobile-gallery"
                                onChange={(e) => {
                                  console.log("Gallery input changed");
                                  handleMediaUpload(e.target.files);
                                }}
                              />
                              <label
                                htmlFor="mobile-gallery"
                                onClick={() =>
                                  console.log("Gallery label clicked")
                                }
                                style={{
                                  color: "#0066ff",
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                  display: "block",
                                  padding: "10px",
                                }}
                              >
                                {t("Or select from gallery")}
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              disabled={isUploadingMedia}
                              onChange={(e) =>
                                handleMediaUpload(e.target.files)
                              }
                              style={{
                                padding: "30px",
                                border: "3px dashed #0066ff",
                                borderRadius: "16px",
                                width: "100%",
                                background: "#f0f8ff",
                                fontSize: "16px",
                                cursor: isUploadingMedia
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            />
                            <p className="text-muted mt-2">
                              {t("presentation.Supported_media")}
                            </p>
                          </div>
                        );
                      })()}

                      {/* Upload Progress */}
                      {isUploadingMedia && (
                        <div className="mt-4 p-3 bg-white rounded shadow-sm">
                          <div className="d-flex justify-content-between mb-2">
                            <strong>
                              {t("Uploading")} ({uploadedMedia.length} files)
                            </strong>
                            <span className="text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                          <ProgressBar
                            animated
                            now={uploadProgress}
                            variant="success"
                            style={{ height: "10px" }}
                          />
                        </div>
                      )}

                      {/* Loading Server Media */}
                      {mediaLoading && (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted">
                            {t("Loading uploaded media...")}
                          </p>
                        </div>
                      )}

                      {/* Uploaded Media from Server */}
                      {serverMedia.length > 0 && (
                        <div className="mt-4">
                          <h6>
                            {t("Uploaded Media")} ({serverMedia.length})
                          </h6>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(140px, 1fr))",
                              gap: "12px",
                            }}
                          >
                            {serverMedia.map((media, index) => (
                              <div
                                key={media.id}
                                style={{
                                  position: "relative",
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              >
                                {media.file_type?.includes("image") ? (
                                  <img
                                    src={media.file_url}
                                    alt={media.original_name}
                                    style={{
                                      width: "100%",
                                      height: "140px",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <video
                                    src={media.file_url}
                                    muted
                                    loop
                                    controls
                                    style={{ width: "100%", height: "140px" }}
                                  />
                                )}
                                <button
                                  onClick={() => removeMedia(index)}
                                  disabled={deletingIndex === index}
                                  style={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    background: "rgba(0,0,0,0.7)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                  }}
                                >
                                  {deletingIndex === index ? "..." : "×"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {!mediaLoading &&
                        serverMedia.length === 0 &&
                        !isUploadingMedia && (
                          <div className="text-center py-5 text-muted">
                            <BiCloudUpload
                              size={48}
                              className="mb-3 opacity-50"
                            />
                            <p>{t("presentation.No media uploaded yet")}</p>
                          </div>
                        )}
                    </div>
                  )}
                  {!notesEditor.showEditor &&
                    !decisionEditor.showEditor &&
                    !questionEditor.showEditor &&
                    !mediaEditor.showEditor &&
                    !showStepContentEditor &&
                    !fileEditor.showEditor &&
                    planDActionEditor.showEditor && (
                      <div className="col-md-12 mt-4">
                        <div className="decision-editor-container">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5>{t("presentation.strategies")}</h5>
                            <button
                              className="btn btn-primary"
                              style={{
                                backgroundColor: "rgb(0, 38, 177)",
                              }}
                              onClick={() => handleButtonClick()}
                            >
                              + {t("presentation.Add Strategy")}
                            </button>
                          </div>

                          <div className="decision-table-scroll">
                            <Table bordered className="action-table">
                              <thead>
                                <tr className="table-row">
                                  <th className="table-row-head text-center">
                                    {t("order")}
                                  </th>
                                  <th
                                    className="table-row-head text-center"
                                    style={{
                                      paddingLeft: "38px",
                                    }}
                                  >
                                    {t("tasks")}
                                  </th>
                                  <th className="table-row-head text-center">
                                    {t("duration")}
                                  </th>
                                  <th className="table-row-head text-center">
                                    {t("participant")}
                                  </th>
                                  <th className="table-row-head text-center">
                                    {t("Actions")}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {meetingData?.plan_d_actions &&
                                  meetingData?.plan_d_actions
                                    .reduce((acc, item) => {
                                      const exists = acc.find(
                                        (obj) =>
                                          obj.action === item.action &&
                                          obj.order === item.order &&
                                          obj.action_days === item.action_days,
                                      );
                                      if (!exists) acc.push(item);
                                      return acc;
                                    }, [])
                                    ?.map((user, index) => (
                                      <tr className="table-data" key={user?.id}>
                                        <td
                                          style={
                                            {
                                              // width: "70%",
                                              // paddingLeft: "28px",
                                            }
                                          }
                                          className="table-data-row"
                                        >
                                          {user?.order}
                                        </td>
                                        <td
                                          style={{
                                            width: "50%",
                                            paddingLeft: "28px",
                                          }}
                                          className="table-data-row"
                                        >
                                          {user?.action}
                                        </td>
                                        <td className="text-center table-data-row ">
                                          <span className="duree">
                                            {
                                              String(user?.action_days).split(
                                                ".",
                                              )[0]
                                            }
                                          </span>
                                        </td>
                                        <td className="text-center table-data-row">
                                          <Tooltip
                                            title={user?.participant_full_name}
                                            placement="top"
                                          >
                                            <Avatar
                                              src={
                                                user?.participant_image?.includes(
                                                  "users",
                                                )
                                                  ? Assets_URL +
                                                    "/" +
                                                    user?.participant_image
                                                  : user?.participant_image
                                              }
                                            />
                                          </Tooltip>
                                        </td>
                                        <td className="text-center table-data-row">
                                          <button
                                            className="btn-sm btn-outline-primary p-0"
                                            onClick={() =>
                                              handleEditStrategy(user)
                                            }
                                            style={{
                                              border: 0,
                                              background: "white",
                                              margin: "4px",
                                            }}
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            className="btn-sm btn-outline-danger p-0"
                                            onClick={() =>
                                              handleDeleteStrategy(user)
                                            }
                                            style={{
                                              border: 0,
                                              background: "white",
                                              margin: "4px",
                                            }}
                                          >
                                            🗑️
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  {
                    // STEP EDITORRRR
                    !notesEditor.showEditor &&
                    !decisionEditor.showEditor &&
                    !questionEditor.showEditor &&
                    !mediaEditor.showEditor &&
                    !planDActionEditor.showEditor &&
                    !fileEditor.showEditor &&
                    showStepContentEditor ? (
                      <div>
                        {/* FILE UPLOADDD */}
                        <section>
                          <ShowIF
                            condition={
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "File" ||
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Video" ||
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Photo"
                            }
                          >
                            <label>
                              {meetingData?.steps[currentStepIndex].file}
                            </label>
                            <input
                              type="file"
                              multiple="false"
                              // value={meetingData?.steps[currentStepIndex].file}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                let allowedFileTypes = [];
                                // Determine allowed file types based on modalType
                                if (
                                  meetingData?.steps[currentStepIndex]
                                    .editor_type === "File"
                                ) {
                                  allowedFileTypes = [
                                    "application/pdf",
                                    "application/vnd.ms-excel",
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                    "application/vnd.ms-powerpoint",
                                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                    "application/msword",
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                  ];
                                } else if (
                                  meetingData?.steps[currentStepIndex]
                                    .editor_type === "Video"
                                ) {
                                  allowedFileTypes = [
                                    "video/mp4",
                                    "video/x-msvideo",
                                    "video/x-matroska",
                                    "video/mpeg",
                                    "video/quicktime",
                                  ];
                                } else if (
                                  meetingData?.steps[currentStepIndex]
                                    .editor_type === "Photo"
                                ) {
                                  allowedFileTypes = [
                                    "image/jpeg",
                                    "image/png",
                                    "image/gif",
                                    "image/bmp",
                                    "image/webp",
                                    // Add other image MIME types if needed
                                  ];
                                } else if (
                                  meetingData?.steps[currentStepIndex]
                                    .editor_type === "Excel"
                                ) {
                                  allowedFileTypes = [
                                    "application/vnd.ms-excel",
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                  ];
                                }

                                // const allowedFileTypes = [
                                //   "application/pdf",
                                //   "application/vnd.ms-excel",
                                //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                //   "application/vnd.ms-powerpoint",
                                //   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                //   "application/msword",
                                //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                // ];
                                if (
                                  !file ||
                                  !allowedFileTypes.includes(file.type)
                                ) {
                                  alert("Please select a valid file type");
                                }
                                // PREPARE THE PAYLOAD
                                const updatedSteps = [
                                  ...(meetingData?.steps || []),
                                ];
                                const selectedStep =
                                  updatedSteps[currentStepIndex];
                                const filePayload = {
                                  ...selectedStep,
                                  title: selectedStep.title,
                                  count1: selectedStep.count1,
                                  count2: selectedStep.count2,
                                  time: selectedStep.count2,
                                  editor_type: selectedStep.editor_type,
                                  file: file,
                                  editor_content: null,
                                  _method: "put",
                                };
                                // SEND THE FILE TO THE SERVER
                                try {
                                  const response = await axios.post(
                                    `${API_BASE_URL}/steps/${selectedStep?.id}`,
                                    filePayload,
                                    {
                                      headers: {
                                        "Content-Type": "multipart/form-data",
                                        Authorization: `Bearer ${CookieService.get(
                                          "token",
                                        )}`,
                                      },
                                    },
                                  );

                                  if (response.status === 200) {
                                    // Update the file in the state
                                    const updatedSteps = [
                                      ...(meetingData?.steps || []),
                                    ];
                                    const selectedStep =
                                      updatedSteps[currentStepIndex];
                                    selectedStep.file = response.data.data.file;
                                    setMeetingData({
                                      ...meetingData,
                                      steps: updatedSteps,
                                    });
                                  }
                                } catch (error) {
                                  console.log(
                                    "error while uploading file",
                                    error,
                                  );
                                }
                              }}
                            />
                          </ShowIF>
                        </section>
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Excel"
                          }
                        >
                          <label>
                            {meetingData?.steps[currentStepIndex].file}
                          </label>
                          <input
                            type="file"
                            multiple="false"
                            // value={meetingData?.steps[currentStepIndex].file}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              let allowedFileTypes = [];
                              // Determine allowed file types based on modalType
                              if (
                                meetingData?.steps[currentStepIndex]
                                  .editor_type === "Excel"
                              ) {
                                allowedFileTypes = [
                                  "application/vnd.ms-excel",
                                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                ];
                              }

                              if (
                                !file ||
                                !allowedFileTypes.includes(file.type)
                              ) {
                                alert("Please select a valid file type");
                              }
                              // PREPARE THE PAYLOAD
                              const updatedSteps = [
                                ...(meetingData?.steps || []),
                              ];
                              const selectedStep =
                                updatedSteps[currentStepIndex];
                              const filePayload = {
                                ...selectedStep,
                                title: selectedStep.title,
                                count1: selectedStep.count1,
                                count2: selectedStep.count2,
                                time: selectedStep.count2,
                                editor_type: selectedStep.editor_type,
                                file: file,
                                editor_content: null,
                                _method: "put",
                              };
                              // SEND THE FILE TO THE SERVER
                              try {
                                const response = await axios.post(
                                  `${API_BASE_URL}/steps/${selectedStep?.id}`,
                                  filePayload,
                                  {
                                    headers: {
                                      "Content-Type": "multipart/form-data",
                                      Authorization: `Bearer ${CookieService.get(
                                        "token",
                                      )}`,
                                    },
                                  },
                                );

                                if (response.status === 200) {
                                  // Update the file in the state
                                  const updatedSteps = [
                                    ...(meetingData?.steps || []),
                                  ];
                                  const selectedStep =
                                    updatedSteps[currentStepIndex];
                                  selectedStep.file = response.data.data.file;
                                  setMeetingData({
                                    ...meetingData,
                                    steps: updatedSteps,
                                  });
                                }
                              } catch (error) {
                                console.log(
                                  "error while uploading file",
                                  error,
                                );
                              }
                            }}
                          />
                        </ShowIF>
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Editeur"
                          }
                        >
                          <Editor
                            onBlur={(evt, editor) => {
                              const currentContent = editor.getContent();
                              const sanitized =
                                sanitizeIframeContent(currentContent);

                              // Turant save on blur
                              autoSaveStep(sanitized);
                            }}
                            key={activeStepIndex}
                            apiKey={TINYMCEAPI}
                            value={
                              meetingData?.steps[activeStepIndex]
                                ?.editor_content
                            }
                            // style={{height:'100vh'}}

                            init={{
                              statusbar: false,
                              branding: false,
                              menubar: true,
                              height: 700,
                              language: "fr_FR",
                              // language: "en_EN",
                              plugins:
                                "print preview paste searchreplace image autolink directionality visualblocks visualchars fullscreen  link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                              toolbar:
                                "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                              // image_advtab: true,
                              file_picker_types: "image",
                              images_upload_handler:
                                image_upload_handler_callback,
                            }}
                            // onEditorChange={(content) => {
                            //   setMeetingData((prevData) => ({
                            //     ...prevData,
                            //     steps: prevData.steps.map(
                            //       (step, index) => {
                            //         if (index === activeStepIndex) {
                            //           return {
                            //             ...step,
                            //             editor_content: content,
                            //           };
                            //         }
                            //         return step;
                            //       }
                            //     ),
                            //   }));
                            // }}
                            onEditorChange={(content) => {
                              const sanitizedContent =
                                sanitizeIframeContent(content);
                              setMeetingData((prevData) => ({
                                ...prevData,
                                steps: prevData.steps.map((step, index) => {
                                  if (index === activeStepIndex) {
                                    return {
                                      ...step,
                                      editor_content: sanitizedContent,
                                    };
                                  }
                                  return step;
                                }),
                              }));
                              // Trigger debounced auto-save
                              debouncedSave(sanitizedContent);
                            }}
                            onInit={(evt, editor) => {
                              editorRef.current = editor;
                            }}
                            onNodeChange={(e) => {
                              if (
                                e &&
                                e.element.nodeName.toLowerCase() == "img"
                              ) {
                                editorRef.current.dom.setAttribs(e.element, {
                                  width: "700px",
                                  height: "394px",
                                });
                              }
                            }}
                          />
                        </ShowIF>
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Subtask"
                          }
                        >
                          <Editor
                            onBlur={(value) => {
                              console.log("value", value);
                            }}
                            key={activeStepIndex}
                            apiKey={TINYMCEAPI}
                            value={
                              meetingData?.steps[activeStepIndex]
                                ?.editor_content
                            }
                            // style={{height:'100vh'}}

                            init={{
                              statusbar: false,
                              branding: false,
                              menubar: true,
                              height: 900,
                              language: "fr_FR",
                              // language: "en_EN",
                              plugins:
                                "print preview paste searchreplace image autolink directionality visualblocks visualchars fullscreen  link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                              toolbar:
                                "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                              // image_advtab: true,
                              file_picker_types: "image",
                              images_upload_handler:
                                image_upload_handler_callback,
                            }}
                            // onEditorChange={(content) => {
                            //   setMeetingData((prevData) => ({
                            //     ...prevData,
                            //     steps: prevData.steps.map(
                            //       (step, index) => {
                            //         if (index === activeStepIndex) {
                            //           return {
                            //             ...step,
                            //             editor_content: content,
                            //           };
                            //         }
                            //         return step;
                            //       }
                            //     ),
                            //   }));
                            // }}
                            onEditorChange={(content) => {
                              const sanitizedContent =
                                sanitizeIframeContent(content);
                              setMeetingData((prevData) => ({
                                ...prevData,
                                steps: prevData.steps.map((step, index) => {
                                  if (index === activeStepIndex) {
                                    return {
                                      ...step,
                                      editor_content: sanitizedContent,
                                    };
                                  }
                                  return step;
                                }),
                              }));
                            }}
                            onInit={(evt, editor) => {
                              editorRef.current = editor;
                            }}
                            onNodeChange={(e) => {
                              if (
                                e &&
                                e.element.nodeName.toLowerCase() == "img"
                              ) {
                                editorRef.current.dom.setAttribs(e.element, {
                                  width: "700px",
                                  height: "394px",
                                });
                              }
                            }}
                          />
                        </ShowIF>{" "}
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Story"
                          }
                        >
                          <Editor
                            onBlur={(value) => {
                              console.log("value", value);
                            }}
                            key={activeStepIndex}
                            apiKey={TINYMCEAPI}
                            value={
                              meetingData?.steps[activeStepIndex]
                                ?.editor_content
                            }
                            // style={{height:'100vh'}}

                            init={{
                              statusbar: false,
                              branding: false,
                              menubar: true,
                              height: 900,
                              language: "fr_FR",
                              // language: "en_EN",
                              plugins:
                                "print preview paste searchreplace image autolink directionality visualblocks visualchars fullscreen  link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                              toolbar:
                                "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                              // image_advtab: true,
                              file_picker_types: "image",
                              images_upload_handler:
                                image_upload_handler_callback,
                            }}
                            // onEditorChange={(content) => {
                            //   setMeetingData((prevData) => ({
                            //     ...prevData,
                            //     steps: prevData.steps.map(
                            //       (step, index) => {
                            //         if (index === activeStepIndex) {
                            //           return {
                            //             ...step,
                            //             editor_content: content,
                            //           };
                            //         }
                            //         return step;
                            //       }
                            //     ),
                            //   }));
                            // }}
                            onEditorChange={(content) => {
                              const sanitizedContent =
                                sanitizeIframeContent(content);
                              setMeetingData((prevData) => ({
                                ...prevData,
                                steps: prevData.steps.map((step, index) => {
                                  if (index === activeStepIndex) {
                                    return {
                                      ...step,
                                      editor_content: sanitizedContent,
                                    };
                                  }
                                  return step;
                                }),
                              }));
                            }}
                            onInit={(evt, editor) => {
                              editorRef.current = editor;
                            }}
                            onNodeChange={(e) => {
                              if (
                                e &&
                                e.element.nodeName.toLowerCase() == "img"
                              ) {
                                editorRef.current.dom.setAttribs(e.element, {
                                  width: "700px",
                                  height: "394px",
                                });
                              }
                            }}
                          />
                        </ShowIF>
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Email"
                          }
                        >
                          <Editor
                            onBlur={(value) => {
                              console.log("value", value);
                            }}
                            key={activeStepIndex}
                            apiKey={TINYMCEAPI}
                            value={
                              meetingData?.steps[activeStepIndex]
                                ?.editor_content
                            }
                            init={{
                              statusbar: false,
                              branding: false,
                              menubar: true,
                              language: "fr_FR",
                              height: 900,

                              // language: "en_EN",
                              plugins:
                                "print preview paste searchreplace image autolink directionality visualblocks visualchars fullscreen  link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                              toolbar:
                                "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | imagePicker link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                              // image_advtab: true,
                              file_picker_types: "image",
                              images_upload_handler:
                                image_upload_handler_callback,
                            }}
                            onEditorChange={(content) => {
                              setMeetingData((prevData) => ({
                                ...prevData,
                                steps: prevData.steps.map((step, index) => {
                                  if (index === activeStepIndex) {
                                    return {
                                      ...step,
                                      editor_content: content,
                                    };
                                  }
                                  return step;
                                }),
                              }));
                            }}
                            onInit={(evt, editor) => {
                              editorRef.current = editor;
                            }}
                            onNodeChange={(e) => {
                              if (
                                e &&
                                e.element.nodeName.toLowerCase() == "img"
                              ) {
                                editorRef.current.dom.setAttribs(e.element, {
                                  width: "700px",
                                  height: "394px",
                                });
                              }
                            }}
                          />
                        </ShowIF>
                        <ShowIF
                          condition={
                            meetingData?.steps[currentStepIndex].editor_type ===
                            "Url"
                          }
                        >
                          <label>
                            {meetingData?.steps[currentStepIndex]?.Url}
                          </label>
                          <input
                            type="text"
                            // placeholder="https://www.google.com"
                            value={meetingData?.steps[currentStepIndex]?.url}
                            // onChange={handleLinkUpload}
                            onChange={(e) => {
                              setMeetingData((prevData) => ({
                                ...prevData,
                                steps: prevData.steps.map((step, index) => {
                                  if (index === activeStepIndex) {
                                    return {
                                      ...step,
                                      url: e.target.value,
                                    };
                                  }
                                  return step;
                                }),
                              }));
                            }}
                            name="url"
                            style={{ width: "50%" }}
                          />
                        </ShowIF>
                      </div>
                    ) : null
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ✅ Confirmation Modal — only for Automatic notes */}
      {/* {showConfirmModal &&  <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to go back? If you go back, Moment will closed.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            No
          </Button>
          <Button variant="primary" onClick={confirmBackAction}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>} */}

      {showTimerModal && (
        <ConfirmationModal
          message={t(
            "presentation.are you sure you want to close this meeting?",
          )}
          onCancel={() => setShowTimerModal(false)}
          onConfirm={() => (isAutomatic ? closeEarly() : closeEarlyMeeting())}
        />
      )}

      {/* {showProgressBar && (
        <div className="progress-overlay">
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
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
      )} */}

      {showNewDecisionModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "#fff",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
          className="tektime"
        >
          <div
            className="d-flex align-items-center"
            style={{ width: "100%", padding: "1px" }}
          >
            {/* Left section - Empty */}
            <div style={{ flex: 1, textAlign: "start" }}></div>

            {/* Center section - Title */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <Tooltip
                title={
                  meetingData?.steps[currentStepIndex]?.order_no +
                  ".\u00A0" +
                  meetingData?.steps[currentStepIndex]?.title
                }
              >
                <h4
                  style={{
                    overflow: "hidden",
                    // textOverflow: "ellipsis",
                    // display: "inline-block",
                    // maxWidth: "100%",
                    // verticalAlign: "bottom",
                    margin: 0, // optional: remove extra spacing
                  }}
                  className="truncated-text"
                >
                  {meetingData?.steps[currentStepIndex]?.order_no}. &nbsp;
                  {meetingData?.steps[currentStepIndex]?.title}
                </h4>
              </Tooltip>
            </div>

            {/* Right section - Button */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              {/* Action buttons */}
            </div>
          </div>
          {/* Top Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "170px",
              maxHeight: "100px",
            }}
          ></div>

          <div
            style={{
              // maxHeight: "530px",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              height: "100vh",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>📝 {t("presentation.New Decision")}</h3>

              <button
                onClick={closeDecisionModal}
                style={{
                  backgroundColor: "red",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                x {t("presentation.close")}
              </button>
            </div>
            {/* Scrollable Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
              }}
            >
              {/* Decision Type */}
              <label
                style={{
                  fontWeight: "500",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                {t("presentation.Decision Type")}
              </label>
              <Select
                options={[
                  { value: "Budget", label: "Budget" },
                  { value: "Milestone", label: t("Milestone") },
                  { value: "Rule", label: t("Rule") },
                ]}
                onChange={(selectedOption) =>
                  handleSelectChange(
                    selectedOption,
                    "decision_type",
                    currentDecisionIndex,
                  )
                }
                styles={{
                  container: (base) => ({ ...base, marginBottom: "15px" }),
                }}
              />

              {/* Conditional Inputs */}
              {decision[activeStepIndex]?.[currentDecisionIndex]
                ?.decision_type === "Milestone" && (
                <>
                  <label
                    style={{
                      fontWeight: "500",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {t("presentation.Milestone Date")}
                  </label>
                  <input
                    type="date"
                    value={
                      decision[activeStepIndex]?.[currentDecisionIndex]
                        ?.milestone_date || ""
                    }
                    onChange={(event) =>
                      handleSelectChange(
                        { value: event.target.value },
                        "milestone_date",
                        currentDecisionIndex,
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      marginBottom: "15px",
                    }}
                  />
                </>
              )}

              {decision[activeStepIndex]?.[currentDecisionIndex]
                ?.decision_type === "Budget" && (
                <>
                  <label
                    style={{
                      fontWeight: "500",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {t("presentation.Budget Amount")}
                  </label>

                  {/* Input Group for Budget Amount + Currency */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "15px",
                    }}
                  >
                    <input
                      type="number"
                      value={
                        decision[activeStepIndex]?.[currentDecisionIndex]
                          ?.budget_amount || ""
                      }
                      onChange={(event) =>
                        handleSelectChange(
                          { value: event.target.value },
                          "budget_amount",
                          currentDecisionIndex,
                        )
                      }
                      style={{
                        flex: 2,
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                    />

                    <select
                      value={
                        decision[activeStepIndex]?.[currentDecisionIndex]
                          ?.currency || ""
                      }
                      onChange={(event) =>
                        handleSelectChange(
                          { value: event.target.value },
                          "currency",
                          currentDecisionIndex,
                        )
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="" disabled>
                        {t("presentation.Select Currency")}
                      </option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </>
              )}

              {/* Decision Text */}
              <label
                style={{
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {t("presentation.Description")}
              </label>
              <textarea
                rows="4"
                value={
                  decision[activeStepIndex]?.[currentDecisionIndex]?.decision ||
                  ""
                }
                onChange={(e) => handleTextChange(e, currentDecisionIndex)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  marginBottom: "15px",
                }}
              />

              {/* Apply Decision */}
              <label
                style={{
                  fontWeight: "500",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {t("presentation.Apply Decision To")}
              </label>
              <Select
                options={combinedOptions}
                value={
                  decision[activeStepIndex]?.[currentDecisionIndex]
                    ?.decision_apply
                    ? {
                        value:
                          decision[activeStepIndex][currentDecisionIndex]
                            .decision_apply,
                        label:
                          decision[activeStepIndex][currentDecisionIndex]
                            .decision_apply,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleSelectChange(
                    selectedOption,
                    "decision_apply",
                    currentDecisionIndex,
                  )
                }
                styles={{
                  container: (provided) => ({
                    ...provided,
                    marginBottom: "20px",
                    zIndex: 10,
                  }),
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                }}
              />

              {/* Save Button */}
              <button
                onClick={saveNewDecision}
                style={{
                  backgroundColor: "rgb(0, 38, 177)",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: "100%",
                }}
                disabled={saveDecision}
              >
                💾 {t("presentation.Save Decision")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStrategyModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "#fff",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
          className="tektime"
        >
          <div
            className="d-flex align-items-center"
            style={{ width: "100%", padding: "1px" }}
          >
            {/* Left section - Empty */}
            <div style={{ flex: 1, textAlign: "start" }}></div>

            {/* Center section - Title */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <Tooltip
                title={
                  meetingData?.steps[currentStepIndex]?.order_no +
                  ".\u00A0" +
                  meetingData?.steps[currentStepIndex]?.title
                }
              >
                <h4
                  style={{
                    overflow: "hidden",
                    // textOverflow: "ellipsis",
                    // display: "inline-block",
                    // maxWidth: "100%",
                    // verticalAlign: "bottom",
                    margin: 0, // optional: remove extra spacing
                  }}
                  className="truncated-text"
                >
                  {meetingData?.steps[currentStepIndex]?.order_no}. &nbsp;
                  {meetingData?.steps[currentStepIndex]?.title}
                </h4>
              </Tooltip>
            </div>

            {/* Right section - Button */}
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              {/* Action buttons */}
            </div>
          </div>
          {/* Top Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "170px",
              maxHeight: "100px",
            }}
          ></div>

          <div
            style={{
              // maxHeight: "530px",
              overflowY: "auto",
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              height: "100vh",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {editingStrategy
                  ? "✏️ " + t("presentation.Update Strategy")
                  : "📝 " + t("presentation.New Strategy")}
              </h3>

              <button
                onClick={handleButtonClose}
                style={{
                  backgroundColor: "red",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                x {t("presentation.close")}
              </button>
            </div>
            {/* Scrollable Content */}
            <div
              style={{
                flex: 1,
                // overflowY: "auto",
                padding: "20px",
                height: "100vh",
              }}
            >
              <section
                className="row py-1"
                // style={{ height: "600px" }}
              >
                <div className="col-md-12 mb-2">
                  {/* Plan of Action */}
                  <div
                    className="card card2 p-3 table-container"
                    // style={{ height: "600px" }}
                  >
                    <div
                      className="cardbody"
                      style={{
                        height: "auto",
                        // overflow:"hidden"
                        // minHeight: "80vh",
                      }}
                    >
                      <div className=" row subtitle  text-body-secondary">
                        <div className="col-md-2">
                          <span>{t("presentation.order")}</span>
                        </div>
                        <div className=" col-md-3 ">
                          <span>{t("presentation.action")}</span>
                        </div>
                        <div className="col-md-3">
                          <span>{t("presentation.carrier")}</span>
                        </div>
                        <div className="col-md-3">
                          <span>{t("presentation.dueDate")}</span>
                        </div>
                        <div className="col-md-1">
                          <span></span>
                        </div>
                      </div>

                      {tableData?.map((rowData, index) => {
                        if (
                          rowData.step_id !==
                          meetingData?.steps[currentStepIndex].id
                        ) {
                          return;
                        }
                        return (
                          <div
                            className="row p-2 text-body-dark mt-3 "
                            style={{
                              borderBottom: "1px solid #ccc",
                            }}
                            key={index}
                          >
                            <div className="col-md-2">
                              <select
                                className="form-select form-select-sm"
                                value={rowData.order}
                                onChange={(e) => {
                                  handleTableDataChange(e, index);
                                }}
                                name="order"
                              >
                                {Array.from({
                                  length: 11,
                                }).map((_, i) => (
                                  <option key={i} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-md-3">
                              <textarea
                                name="action"
                                value={rowData.action}
                                onChange={(e) => {
                                  handleTableDataChange(e, index);
                                }}
                                placeholder="Action"
                                rows={3}
                                // maxLength={100}
                                className="wrapped-textarea txt"
                              />
                            </div>

                            <div className="col-md-3">
                              {meetingData?.type === "Newsletter" ? (
                                <>
                                  <select
                                    className="form-select form-select-sm"
                                    // value={rowData.participant_id || ""}
                                    value={rowData.participant_id}
                                    name="participant_id"
                                    onChange={(e) =>
                                      handleTableDataChange(e, index)
                                    }
                                  >
                                    <option value="" disabled>
                                      {t("Select Participant")}
                                    </option>

                                    {meetingData?.participants &&
                                      meetingData?.participants?.length < 1 && (
                                        <option value="">
                                          {t(
                                            "presentation.No Participants Added",
                                          )}{" "}
                                        </option>
                                      )}
                                    {meetingData &&
                                      meetingData?.participants
                                        ?.filter(
                                          (participant, index, self) =>
                                            index ===
                                            self.findIndex(
                                              (p) =>
                                                p.email === participant.email,
                                            ),
                                        )
                                        ?.map((item) => {
                                          return (
                                            <option
                                              key={item.id}
                                              value={item.id}
                                            >
                                              {item?.first_name}{" "}
                                              {item?.last_name} ({item?.email})
                                            </option>
                                          );
                                        })}
                                  </select>
                                </>
                              ) : (
                                <select
                                  className="form-select form-select-sm"
                                  // value={rowData.participant_id || ""}
                                  value={rowData.participant_id}
                                  name="participant_id"
                                  onChange={(e) =>
                                    handleTableDataChange(e, index)
                                  }
                                >
                                  <option value="" disabled>
                                    {t("Select Participant")}
                                  </option>

                                  {meetingData?.participants &&
                                    meetingData?.participants?.length < 1 && (
                                      <option value="">
                                        {t(
                                          "presentation.No Participants Added",
                                        )}{" "}
                                      </option>
                                    )}
                                  {meetingData &&
                                    meetingData?.participants
                                      ?.filter(
                                        (participant, index, self) =>
                                          index ===
                                          self.findIndex(
                                            (p) =>
                                              p.email === participant.email,
                                          ),
                                      )
                                      ?.map((item) => {
                                        return (
                                          <option key={item.id} value={item.id}>
                                            {item?.first_name} {item?.last_name}{" "}
                                            ({item?.email})
                                          </option>
                                        );
                                      })}
                                </select>
                              )}
                            </div>

                            <div className="col-md-3">
                              <div>
                                <img
                                  src="/Assets/minus1.svg"
                                  alt="minus"
                                  className="img-fluid "
                                  width={"15px"}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleDecrementCount(index)}
                                />{" "}
                                &nbsp; &nbsp;
                                <span>
                                  {parseInt(rowData.action_days)} {t("Day")}
                                </span>
                                &nbsp;&nbsp;
                                <img
                                  src="/Assets/plus1.svg"
                                  alt="plus"
                                  className="img-fluid"
                                  width={"15px"}
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleIncrementCount(index)}
                                />
                              </div>
                            </div>

                            <div className="col-md-1">
                              <button
                                className="btndel"
                                onClick={() => handleButtonDelete(index)}
                              >
                                <AiFillDelete size={"25px"} color="red" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* <div className="d-flex justify-content-center mt-3 gap-2">
                                  <div>
                                    <GoPlusCircle
                                      size="30px"
                                      onClick={handleButtonClick}
                                    />
                                  </div>
                                </div> */}
                      <button
                        onClick={saveNewStrategy}
                        style={{
                          backgroundColor: "rgb(0, 38, 177)",
                          color: "#fff",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: "600",
                          fontSize: "16px",
                          cursor: "pointer",
                          width: "100%",
                        }}
                        // disabled={saveStrategy}
                      >
                        💾 {t("presentation.Save Strategy")}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup before recording */}
      {showConfirmationPopup && (
        <Modal
          show={showConfirmationPopup}
          size="lg"
          centered
          backdrop="static"
        >
          <Modal.Header>
            <Modal.Title>{t("note_confirmation_title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p
              dangerouslySetInnerHTML={{
                __html: t("note_confirmation_content"),
              }}
            />
            {/* system-specific image */}
            <div className="d-flex justify-content-center">
              {isMac && (
                <img
                  src="/Assets/mac-popup.png"
                  alt="Mac Instructions"
                  style={{
                    // width: "100%",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                />
              )}

              {isWindows && (
                <img
                  src="/Assets/windows-popup.png"
                  alt="Windows Instructions"
                  style={{
                    // width: "100%",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button variant="secondary" onClick={onClose}>
                 Cancel
               </Button> */}
            <button
              className="btn"
              style={{
                backgroundColor: "#0026b1",
                color: "#fff",
                border: "none",
                padding: "9px 26px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
              }}
              onClick={initiateRecording}
            >
              {t("meeting.formState.Save and Continue")}
            </button>
          </Modal.Footer>
        </Modal>
      )}

      <RecordingErrorModal
        show={showErrorModal}
        message={errorMessage}
        onRetry={handleRetry}
        onClose={() => setShowErrorModal(false)}
      />

      <Modal
        show={showInstructionModal}
        onHide={() => {
          setShowInstructionModal(false);
          setShowAIDropdown(false);
          setIsAutomaticPrompt(false);
        }}
        centered
        backdrop="static"
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Ajouter l'intruction que vous voulez appliquer au compte-rendu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: "10px" }}>
            <div
              style={{
                width: "200px",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                cursor: "pointer",
                direction: "ltr",
                position: "relative",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontFamily: "Inter, sans-serif",
              }}
              onClick={() => setShowAIDropdown(!showAIDropdown)}
            >
              <img
                src={
                  selectedAI === "mistral"
                    ? "/Assets/m-rainbow.png"
                    : selectedAI === "claude"
                      ? "/Assets/claude-logo-.png"
                      : "/Assets/Tek.png"
                }
                alt={`${selectedAI} Logo`}
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "8px",
                }}
              />
              <span style={{ fontSize: "14px", textTransform: "capitalize" }}>
                {selectedAI}
              </span>
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                ▼
              </span>
            </div>

            {showAIDropdown && (
              <div
                style={{
                  position: "absolute",
                  width: "200px",
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  marginTop: "4px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                  onClick={() => {
                    setSelectedAI("mistral");
                    setShowAIDropdown(false);
                  }}
                >
                  <img
                    src="/Assets/m-rainbow.png"
                    alt="Mistral Logo"
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "8px",
                    }}
                  />
                  <span style={{ fontSize: "14px" }}>Mistral</span>
                </div>
              </div>
            )}
          </div>

          {/* {(selectedAI === "claude" || selectedAI === "mistral") && (
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={isAutomaticPrompt}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsAutomaticPrompt(checked);
                    if (checked) {
                      setValue(AUTOMATIC_PROMPT_TEXT);
                    } else {
                      setValue("");
                    }
                  }}
                  style={{
                    marginRight: "8px",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                Automatic Prompt
              </label>
            </div>
          )} */}

          {loading1 && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(6px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div style={{ width: "60%", maxWidth: "500px" }}>
                <ProgressBar
                  now={progress1}
                  label={`${progress1}%`}
                  style={{
                    height: "28px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                />
              </div>
            </div>
          )}

          <Editor
            className="editor-no-border text_editor"
            id="text_editor"
            name="text"
            apiKey={APIKEY}
            value={value}
            onEditorChange={(content) => {
              setValue(content);
            }}
            init={{
              statusbar: false,
              branding: false,
              height: 480,
              menubar: true,
              language: "fr_FR",
              plugins:
                "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern",
              toolbar:
                "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
              directionality: "ltr",
              content_style: `
                body { direction: ltr; text-align: left; }
                img.img-rounded { border-radius: 8px; }
              `,
            }}
          />
        </Modal.Body>
        <Modal.Footer className="gap-2">
          <button
            className="btn"
            style={{
              background: "#0026b1",
              color: "white",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              padding: "10px 16px",
            }}
            onClick={() => handleValidate("dont_apply_automatic_prompt")}
          >
            Ne pas appliquer cette instruction
          </button>
          <button
            className="btn"
            style={{
              background: "#0026b1",
              color: "white",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              padding: "10px 16px",
            }}
            onClick={() => handleValidate("apply_prompt_and_dont_save")}
          >
            Valider
          </button>
          <button
            className="btn"
            style={{
              background: "#0026b1",
              color: "white",
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              padding: "10px 16px",
            }}
            onClick={() =>
              handleValidate("apply_prompt_and_save_automatic_prompt")
            }
          >
            Valider & sauvegarder
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .custom-blur-backdrop {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1050;
        }
        .custom-blur-backdrop + .modal {
          z-index: 1060;
        }
      `}</style>
      <Modal
        show={showBackConfirmModal}
        onHide={() => setShowBackConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            {t("meeting1.confirmLeaveTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("meeting1.confirmLeaveText")}</p>
          <div className="bg-light p-3 rounded border-start border-warning border-4">
            <strong>{meetingData?.title}</strong>
          </div>
          <div className="mt-3 text-warning">
            <strong>{t("meeting1.automaticRecordingWarning")}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBackConfirmModal(false)}
          >
            {t("meeting1.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={confirmLeaveMeeting}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                {t("meeting1.leaving")}
              </>
            ) : (
              t("meeting1.leaveMeeting")
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InProgress;
