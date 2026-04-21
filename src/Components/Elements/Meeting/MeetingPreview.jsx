import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import axios from "axios";
import { toast } from "react-toastify";
import ReactToggle from "react-toggle";
import "react-toggle/style.css";
import Select from "react-select";
import ShowIF from "../../Utils/ShowIF";
import { Editor } from "@tinymce/tinymce-react";
import { AiFillDelete, AiOutlineArrowLeft } from "react-icons/ai";
import { IoArrowBackSharp } from "react-icons/io5";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

import {
  formatDate,
  formatTime,
  parseAndFormatDateTime,
  timezoneSymbols,
} from "./GetMeeting/Helpers/functionHelper";
import { FaLocationDot } from "react-icons/fa6";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaExpand, FaPhoneAlt, FaUserCircle } from "react-icons/fa";
import { Tooltip as AntdTooltip, Avatar, Tooltip } from "antd";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Card, Modal, ProgressBar, Spinner, Table } from "react-bootstrap";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  convertCount2ToSeconds,
  localizeTimeTaken,
} from "../../Utils/MeetingFunctions";
import Spreadsheet from "react-spreadsheet";
import { read, utils } from "xlsx";
import StepFile from "./CurrentMeeting/components/StepFile";

function addIframesToLinks(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const links = Array.from(doc.querySelectorAll("a"));

  links.forEach((linkElement) => {
    const linkURL = linkElement.getAttribute("href");
    const iframe = createIframeForLink(linkURL);

    // Replace the link element with the iframe
    linkElement.parentNode.replaceChild(iframe, linkElement);
  });

  return doc.documentElement.outerHTML;
}

function createIframeForLink(linkURL) {
  const iframe = document.createElement("iframe");
  iframe.src = linkURL;
  iframe.width = "100%";
  iframe.height = "500px"; // Adjust the height as needed
  iframe.title = "Embedded Content";
  iframe.style.scrollSnapType = "none";
  iframe.style.border = "none";
  iframe.style.textAlign = "center";
  return iframe;
}
const MeetingPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [t] = useTranslation("global");
  const [meetingData, setMeetingData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutomatic, setIsAutomatic] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [slideTime, setSlideTime] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepTitle1, setStepTitle1] = useState("");
  const [nextSlideTime, setNextSlideTime] = useState("");
  const [showNextCounter, setShowNextCounter] = useState(false);
  const [htmlString, setHtmlString] = useState("");
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState([]);
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const editorRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [stepNotes, setStepNotes] = useState([]);
  useEffect(() => {
    const getMeetingById = async () => {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const userId = parseInt(CookieService.get("user_id"));
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/get-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Set input data and HTML content
          setMeetingData(response.data?.data);
          const meetingData = response.data?.data;
          if (meetingData?.prise_de_notes === "Automatic") {
            setIsAutomatic(true);
          } else {
            setIsAutomatic(false);
          }
          setTableData(meetingData?.planDActions);
          setStepNotes(meetingData?.steps?.map((step) => step?.note));

          setHtmlString(
            response.data?.data?.steps[currentStepIndex]?.editor_content
          );
        }
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after completion
      }
    };

    getMeetingById();
  }, [id]); // Ensure currentStepIndex is included in dependencies

  // Fetch editor content (HTML or Excel) whenever the step index or meetingData changes
  useEffect(() => {
    const loadStepEditorContent = async () => {
      const currentStep = meetingData?.steps?.[currentStepIndex];

      if (!currentStep) return;

      // Set HTML string
      setHtmlString(currentStep.editor_content || "");

      // If Excel, fetch the file
      if (currentStep.editor_type === "Excel" && currentStep.file) {
        try {
          const fileResponse = await axios.get(
            `${Assets_URL}/${currentStep.file}`,
            { responseType: "arraybuffer" }
          );

          const fileData = fileResponse.data;
          const workbook = read(fileData, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          if (worksheet) {
            const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });
            const formattedData = jsonSheetData.map((row, rowIndex) =>
              row.map((cell) => ({
                value: cell,
                readOnly: rowIndex === 0,
              }))
            );

            setExcelData(formattedData);
          } else {
            console.warn("Worksheet is null or undefined");
          }
        } catch (error) {
          console.error("Error fetching Excel file:", error);
        }
      } else {
        setExcelData(null); // Clear spreadsheet if not Excel step
      }
    };

    if (meetingData) {
      loadStepEditorContent();
    }
  }, [meetingData, currentStepIndex]);

  // Show preview of Links in Iframe:
  useEffect(() => {
    if (meetingData && meetingData.steps && meetingData.steps.length > 0) {
      // const originialHtml = meetingData.steps[currentStepIndex].editor_content;
      const originialHtml =
        meetingData.steps[currentStepIndex]?.editor_content === null
          ? ""
          : meetingData.steps[currentStepIndex].editor_content;
      const modifiedHtml = addIframesToLinks(originialHtml);
      setMeetingData((prevData) => ({
        ...prevData,
        steps: prevData.steps.map((step, index) => {
          if (index === currentStepIndex) {
            return {
              ...step,
              editor_content: modifiedHtml,
            };
          }
          return step;
        }),
      }));
    }
  }, [htmlString, currentStepIndex]);
  const previousPage = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handlenextPage = () => {
    if (currentStepIndex < meetingData.steps.length - 1) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
      setShowNextCounter(false);
    } else {
      window.history.back();
    }
  };

  const GradientSvg = (
    <svg>
      <defs>
        <linearGradient id="your-unique-id" x1="1" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#F2E358" />
          <stop offset="90%" stopColor="#CB690F" />
        </linearGradient>
      </defs>
    </svg>
  );
  const GradientSlideSvg = (
    <svg>
      <defs>
        <linearGradient id="slide-unique-id" x1="0" y1="0" x2="1" y2="1">
          <stop offset="10%" stopColor="#5882F2" />
          <stop offset="90%" stopColor="#0FB8CB" />
        </linearGradient>
      </defs>
    </svg>
  );
  const goBackToMeeting = () => {
    window.history.back();
  };

  const formatTimeDDHH = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const remainingSeconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(remainingSeconds / (60 * 60));

    const formattedDays = days > 0 ? String(days).padStart(2, "0") : "00";
    const formattedHours = hours > 0 ? String(hours).padStart(2, "0") : "00";

    return `${formattedDays}d:${formattedHours}h`;
  };
  function formatTimeHHMM(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "Invalid input";
    }
    console.log("seconds", seconds);
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${formattedHours}h:${formattedMinutes}`;
  }

  function formatTimeMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Add leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  const getDurationInSeconds = (count, unit) => {
    switch (unit) {
      case "days":
        return count * 24 * 60 * 60;
      case "hours":
        return count * 60 * 60;
      case "mins":
        return count * 60;
      case "secs":
        return count;
      default:
        return 0;
    }
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    if (meetingData) {
      const timeString =
        meetingData?.status === "in_progress"
          ? meetingData?.starts_at
          : meetingData?.start_time;
      // const timeString = meetingData?.starts_at || meetingData?.start_time;
      if (timeString) {
        const [h, m] = timeString.split(":").map(Number);
        setHours(h);
        setMinutes(m);
      }
    }
  }, [meetingData]);

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
  const calculateEndDate = (steps, currentDate, startTime) => {
    if (!steps || !currentDate || !startTime) {
      return;
    }

    let totalDurationInMinutes = 0;

    steps?.forEach((step) => {
      if (step.time_taken !== "0 sec") {
        const totalSeconds = parseTimeTaken(step.time_taken);
        totalDurationInMinutes += totalSeconds / 60;
      } else {
        totalDurationInMinutes += step.count2; // assuming count2 is in minutes
      }
    });

    // Combine currentDate and startTime into a single moment object
    const startDateTime = moment(
      `${currentDate} ${startTime}`,
      "YYYY-MM-DD hh:mm:ss A" // Adjusting format to include AM/PM
    );

    // Add totalDurationInMinutes to the startDateTime
    const endDate = startDateTime.add(totalDurationInMinutes, "minutes");

    return endDate.format("YYYY-MM-DD"); // Formatting to include hours, minutes, and AM/PM
  };

  function calculateTotalStepTime(steps) {
    if (!steps) return;
    return steps?.reduce((total, step) => {
      return total + convertCount2ToSeconds(step.count2, step?.time_unit);
    }, 0);
  }

  function addTimeToMeeting(meeting, totalStepTimeInSeconds) {
    if (!meeting || !totalStepTimeInSeconds) return null;
    const startDate = new Date(meeting?.date);
    let startTime = meeting?.starts_at || meeting?.start_time;

    // Convert start time to seconds and add to the date
    const [hours, minutes, seconds] = startTime?.split(":").map(Number);
    startDate.setHours(hours, minutes, seconds);

    // Add the total step time
    startDate.setSeconds(startDate.getSeconds() + totalStepTimeInSeconds);

    return startDate;
  }
  const sanitizeIframeContent = (content) => {
    if (!content) return null;
    return content.replace(
      /<iframe.*?src="(.*?)".*?<\/iframe>/gi,
      (match, src) => {
        return `<a href="${src}" target="_blank" rel="noopener noreferrer">${src}</a>`;
      }
    );
  };
  const [iFrameLoad, setIFrameLoad] = useState(true);

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

  const [emailCampaign, setEmailCampaign] = useState(null);

  useEffect(() => {
    const getNewsLetterStats = async () => {
      if (meetingData && meetingData?.type === "Newsletter") {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/get-newsletter-stats/${meetingData?.id}/${meetingData?.steps[currentStepIndex]?.id}`
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
  }, [meetingData, currentStepIndex]);

  const totalStepTimeInSeconds = calculateTotalStepTime(meetingData?.steps);
  const newMeetingStartTime = addTimeToMeeting(
    meetingData,
    totalStepTimeInSeconds
  );
  function formatMeetingTime(date) {
    if (!date) return;
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}h${minutes}`;
  }

  const formatEndTime = (timeString) => {
    if (!timeString) return;
    // Extract hours and minutes from the time string
    const [hours, minutes] = timeString.split(":");

    return `${hours}h${minutes}`;
  };

  let remainingTime = meetingData && meetingData?.estimate_time;

  // Calculate step end time in user's timezone
  // const meetingEndDateTime = remainingTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  // Format step end date & time using user's timezone
  const { formattedDate: meetingEndDate, formattedTime: meetingEndTime } =
    parseAndFormatDateTime(
      remainingTime,
      meetingData?.type,
      meetingData?.timezone
    );

  // const estimatedEndDate = meetingData && meetingData?.estimate_time?.split("T")[0];
  // const timeOnly = meetingData && meetingData?.estimate_time?.split("T")[1];

  // const estimatedEndTime = formatEndTime(timeOnly);
  // Format the date to a string for rendering
  // const formattedMeetingStartTime = formatTime(newMeetingStartTime);

  const currentStep = meetingData?.steps?.[currentStepIndex];
  const meetingStatus = meetingData?.status;

  let displayTime = 0;
  if (currentStep?.step_status === null) {
    switch (currentStep?.time_unit) {
      case "days":
        displayTime = currentStep?.count2 * 24 * 60 * 60;
        break;
      case "hours":
        displayTime = currentStep?.count2 * 60 * 60;
        break;
      case "minutes":
        displayTime = currentStep?.count2 * 60;
        break;
      case "seconds":
      default:
        displayTime = currentStep?.count2;
        break;
    }
  } else if (
    currentStep?.step_status === "in_progress" ||
    currentStep?.step_status === "completed" ||
    currentStep?.step_status === "to_finish"
  ) {
    displayTime = currentStep?.time_taken;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

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
  const [planDActionEditor, setPlanDActionEditor] = useState({
    showEditor: false,
  });

  const [clickedToggle, setClickedToggle] = useState(false);
  const [stepNoteEditor, setStepEditor] = useState({
    value: "",
    showEditor: false,
  });
  const [show, setShow] = useState({
    value: "",
    showEditor: false,
  });

  // ================>TEXT EDITORS TOGGLE FUNCTIONS: <====================
  const handleDecisionEditorToggle = () => {
    setClickedToggle((prev) => !prev);
    setNotesEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
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
    setShowStepContentEditor(false);

    setFileEditor((prev) => {
      return {
        ...prev,
        showEditor: !prev.showEditor,
      };
    });
  };

  const handleNotesEditorToggle = () => {
    setClickedToggle((prev) => !prev);
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false })); // Close the decision editor if it's open
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the step editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the all notes editor if it's open

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

  const handleStepContentEditor = async () => {
    if (showStepContentEditor === true) {
      // const optimizedEditorContent = optimizeEditorContent(
      //   meetingData?.steps[currentStepIndex]?.editor_content
      // );
    }
    setFileEditor((prev) => ({ ...prev, showEditor: false })); // Close the notes editor if it's open
    setDecisionEditor((prev) => ({ ...prev, showEditor: false }));
    setNotesEditor((prev) => ({ ...prev, showEditor: false }));
    setPlanDActionEditor((prev) => ({ ...prev, showEditor: false }));
    setStepEditor((prev) => ({ ...prev, showEditor: false })); // Close the step editor if it's open
    setShow((prev) => ({ ...prev, showEditor: false })); // Close the all notes editor if it's open
    setShowStepContentEditor((prev) => !prev);
  };

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
  return (
    <div className="preview">
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <>
          <div className="">
            {GradientSvg}
            {GradientSlideSvg}
          </div>
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
                // overflowY: "auto",
                // padding: "40px 20px",
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
                {/* Left section - Empty */}
                <div className="col-md-4">
                  {meetingData?.prise_de_notes === "Automatic" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "5px",
                      }}
                    >
                      {/* Icon and Text */}
                      <div style={{ display: "flex", alignItems: "center" }}>
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
                        <span
                          className="solutioncards option-text"
                          style={{ marginLeft: "8px" }}
                        >
                          {t("meeting.formState.Automatic note taking")}
                        </span>
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={goBackToMeeting}
                  >
                    <AiOutlineArrowLeft /> &nbsp; {t("sortir")}
                  </button>
                </div>

                {/* Center section - Title */}
                <div className="col-md-4 text-center">
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
                </div>

                {/* Right section - Button */}
                <div
                  className="col-md-4"
                  style={{
                    // flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  {/* Action buttons */}
                  <div className="d-flex gap-3 align-items-center play-meeting-btn action-buttons">
                    {currentStepIndex !== meetingData?.steps?.length - 1 ? (
                      <>
                        <div className="d-flex justify-content-center text-center mb-3 ">
                          {currentStepIndex > 0 && (
                            <button
                              className="btn btn-primary"
                              onClick={previousPage}
                            >
                              {t("Previous")}
                            </button>
                          )}{" "}
                          &nbsp; &nbsp; &nbsp;
                          <button
                            className={` btn ${
                              currentStepIndex ===
                              meetingData?.steps?.length - 1
                                ? "btn-danger"
                                : "btn-primary"
                            }`}
                            onClick={handlenextPage}
                          >
                            {currentStepIndex === meetingData?.steps?.length - 1
                              ? `${t("Exit Preview")}`
                              : `${t("Next")}`}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mb-3">
                        <div className="d-flex justify-content-center text-center mb-3">
                          {currentStepIndex > 0 && (
                            <button
                              className="btn btn-primary"
                              onClick={previousPage}
                            >
                              {t("Previous")}
                            </button>
                          )}{" "}
                          &nbsp; &nbsp; &nbsp;
                          <button
                            className={` btn ${
                              currentStepIndex ===
                              meetingData?.steps?.length - 1
                                ? "btn-danger"
                                : "btn-primary"
                            }`}
                            onClick={handlenextPage}
                          >
                            {currentStepIndex === meetingData?.steps?.length - 1
                              ? `${t("Exit Preview")}`
                              : `${t("Next")}`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Row */}
              <div
                // style={{
                //   display: "flex",
                //   justifyContent: "space-between",
                //   alignItems: "center",
                //   flexWrap: "wrap",
                //   marginBottom: "40px",
                //   maxHeight: "100px",
                //   flexShrink: 0,
                // }}
                className="row"
              >
                {/* Left Side Text/Button */}
                <div className="col-md-4">
                  {meetingData?.type === "Newsletter" ? (
                    <div
                      className="text-start mb-4"
                      style={{ marginLeft: "21px" }}
                    >
                      {meetingData?.steps[currentStepIndex]
                        ?.assigned_to_team ? (
                        <div>
                          {meetingData?.steps[currentStepIndex]?.assigned_team
                            ?.logo ? (
                            meetingData?.steps[currentStepIndex]?.assigned_team
                              .logo !== "" ? (
                              <img
                                className="user-img"
                                width={50}
                                height={50}
                                src={
                                  Assets_URL +
                                  "/" +
                                  meetingData?.steps[currentStepIndex]
                                    ?.assigned_team.logo
                                }
                                alt="logo"
                              />
                            ) : (
                              <FaUserCircle size={30} />
                            )
                          ) : (
                            <FaUserCircle size={30} />
                          )}
                          <span style={{ margin: "0px 5px 0px 12px" }}>
                            {
                              meetingData?.steps[currentStepIndex]
                                ?.assigned_team?.name
                            }
                          </span>
                          {/* <span>{meetingData?.user?.last_name}</span> */}
                        </div>
                      ) : (
                        <FaUserCircle size={30} />
                      )}
                    </div>
                  ) : (
                    <div className="text-start" style={{ marginLeft: "21px" }}>
                      {meetingData?.steps[currentStepIndex]
                        ?.assigned_to_name === null ? (
                        <div className="d-flex align-items-center gap-1">
                          {meetingData?.steps[currentStepIndex]?.image ? (
                            <img
                              className="user-img"
                              width={50}
                              height={50}
                              src={
                                meetingData?.user?.image?.startsWith("users/")
                                  ? `${Assets_URL}/${meetingData?.steps[currentStepIndex]?.image}`
                                  : meetingData?.steps[currentStepIndex]?.image
                              }
                              alt="logo1"
                            />
                          ) : (
                            <FaUserCircle size={30} />
                          )}
                          <span style={{ margin: "0px 5px 0px 12px" }}>
                            {meetingData?.user?.name}
                          </span>
                          <span>{meetingData?.user?.last_name}</span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-1">
                          {meetingData?.steps[currentStepIndex]?.participant ? (
                            <img
                              className="user-img"
                              width={50}
                              height={50}
                              // src={`${Assets_URL}/${meetingData?.steps[currentStepIndex]?.assigned_to_image}`}
                              src={
                                meetingData?.steps[
                                  currentStepIndex
                                ]?.participant?.participant_image?.startsWith(
                                  "users/"
                                )
                                  ? `${Assets_URL}/${meetingData?.steps[currentStepIndex]?.participant?.participant_image}`
                                  : meetingData?.steps[currentStepIndex]
                                      ?.participant?.participant_image
                              }
                              alt="logo2"
                            />
                          ) : (
                            <FaUserCircle size={30} />
                          )}
                          <div className="mx-2">
                            <div className="text-base font-medium">
                              {
                                meetingData?.steps[currentStepIndex]
                                  ?.participant?.full_name
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {
                                meetingData?.steps[currentStepIndex]
                                  ?.participant?.post
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Counter Centered */}
                <div className="col-md-4">
                  <div className="d-flex justify-content-center p-3">
                    <div
                      className="pt-3"
                      style={{
                        zIndex: 0,
                      }}
                    >
                      <CountdownCircleTimer
                        size={80}
                        strokeWidth={4}
                        isPlaying={true}
                        colors="url(#your-unique-id)"
                        onComplete={() => {}}
                      >
                        {({ remainingTime }) => (
                          <div className="text-center">
                            {/* <span className="start-at">{t("Start At")}</span> <br />
                                    <h5>
                                      {moment(meetingData.start_time, "HH:mm").format(
                                        "HH[h]mm"
                                      )}
            
                                    </h5> */}
                            <div className="justify-content-center flex-column d-flex align-items-center">
                              <span
                                className="start-at"
                                style={{
                                  fontSize: "10px",
                                }}
                              >
                                {meetingData?.status === "in_progress"
                                  ? formatDateToDDMMYYYY(meetingData?.date)
                                  : formatDateToDDMMYYYY(meetingData?.date)}
                              </span>
                              <span
                                className="start-at"
                                style={{ fontSize: "10px" }}
                              >
                                {t("Start At")}
                              </span>
                              <span
                                className="start-at"
                                style={{
                                  fontSize: "10px",
                                }}
                              >
                                {hours}h{minutes > 9 ? minutes : "0" + minutes}
                              </span>
                            </div>
                          </div>
                        )}
                      </CountdownCircleTimer>
                    </div>

                    <div
                      className=""
                      style={{
                        zIndex: 5,
                      }}
                    >
                      <CountdownCircleTimer
                        key={currentStepIndex} // Ensures timer resets on step change
                        size={100}
                        strokeWidth={5}
                        isPlaying={false}
                        duration={displayTime} // << Important
                        colors="url(#slide-unique-id)"
                        onComplete={() => {}}
                      >
                        {({ remainingTime }) => {
                          const displayRemTime = getDurationInSeconds(
                            currentStep?.count2,
                            currentStep?.time_unit
                          );

                          return (
                            <div className="text-center">
                              <h4
                                style={{
                                  fontSize:
                                    currentStep?.step_status === "in_progress"
                                      ? "0.9rem"
                                      : "0.9rem",
                                }}
                              >
                                {currentStep?.step_status === null ||
                                currentStep?.step_status === "todo"
                                  ? currentStep?.time_unit === "days"
                                    ? formatTimeDDHH(displayRemTime)
                                    : currentStep?.time_unit === "hours"
                                    ? formatTimeHHMM(displayRemTime)
                                    : formatTimeMMSS(displayRemTime)
                                  : typeof displayTime === "string"
                                  ? localizeTimeTaken(displayTime, t)
                                  : ""}
                              </h4>
                            </div>
                          );
                        }}
                      </CountdownCircleTimer>
                    </div>

                    <div className="pt-3">
                      <CountdownCircleTimer
                        size={80}
                        strokeWidth={4}
                        isPlaying={true}
                        colors="url(#your-unique-id)"
                        onComplete={() => {}}
                      >
                        {({ remainingTime }) => (
                          <div className="d-flex justify-content-center align-items-center flex-column">
                            <span
                              className="start-at"
                              style={{
                                fontSize: "10px",
                              }}
                            >
                              {meetingEndDate}
                            </span>
                            <span
                              className="start-at"
                              style={{
                                fontSize: "10px",
                              }}
                            >
                              {t("Estimated End At")}
                            </span>{" "}
                            {/* <br /> */}
                            <h5
                              className="start-at"
                              style={{
                                fontSize: "10px",
                              }}
                            >
                              {meetingEndTime}
                            </h5>
                          </div>
                        )}
                      </CountdownCircleTimer>
                    </div>
                  </div>
                </div>

                {/* Right Side Text/Button */}
                <div className="col-md-4">
                  {meetingData?.type === "Newsletter" ? (
                    <>
                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {/* Toggle Button */}
                        <div
                          className={`d-flex align-items-center  my-1 flex-wrap fullscreen-toggles`}
                          style={{
                            flexWrap: "nowrap",
                            overflow: "hidden",
                            gap:
                              meetingData?.prise_de_notes === "Automatic"
                                ? "1.9rem"
                                : "0.2rem",
                          }} // Prevent wrapping and keep items in a single row
                        >
                          <div
                            className="d-flex align-items-center"
                            style={{ fontSize: "13px" }}
                          >
                            <ReactToggle
                              checked={showStepContentEditor}
                              icons={false}
                              className="step-content-toggle toggle-playback"
                              onChange={handleStepContentEditor}
                              aria-label="Toggle Step Content Editor"
                              style={{ transform: "scale(0.8)" }}
                            />
                            <span style={{ fontSize: "13px" }}>
                              {t("presentation.Step")}
                            </span>
                          </div>

                          <div
                            className="d-flex align-items-center"
                            style={{
                              fontSize: "13px",
                              // marginLeft: "2px",
                            }}
                          >
                            <ReactToggle
                              checked={notesEditor.showEditor}
                              icons={false}
                              className={`toggle-icon toggle-playback ${
                                notesEditor.showEditor ? "active" : ""
                              }`}
                              onChange={handleNotesEditorToggle}
                              aria-label="Toggle Notes Editor"
                              style={{ transform: "scale(0.8)" }}
                            />
                            <span style={{ fontSize: "13px" }}>
                              {t("presentation.Notes")}
                            </span>
                          </div>

                          <div
                            className="d-flex align-items-center"
                            style={{
                              fontSize: "13px",
                              // marginLeft: "2px",
                            }}
                          >
                            <ReactToggle
                              checked={fileEditor.showEditor}
                              icons={false}
                              className={`toggle-icon toggle-playback ${
                                fileEditor.showEditor ? "active" : ""
                              }`}
                              onChange={handleFileEditor}
                              aria-label="Toggle Plan D'Action Editor"
                              style={{ transform: "scale(0.8)" }}
                            />
                            <span style={{ fontSize: "13px" }}>
                              {t("presentation.Files")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {/* Toggle Button */}
                      <div
                        className={`d-flex align-items-center  my-1 flex-wrap`}
                        style={{
                          flexWrap: "nowrap",
                          overflow: "hidden",
                          gap:
                            meetingData?.prise_de_notes === "Automatic"
                              ? "1.9rem"
                              : "0.2rem",
                        }} // Prevent wrapping and keep items in a single row
                      >
                        <div
                          className="d-flex align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <ReactToggle
                            checked={showStepContentEditor}
                            icons={false}
                            className="step-content-toggle toggle-playback"
                            onChange={handleStepContentEditor}
                            aria-label="Toggle Step Content Editor"
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span style={{ fontSize: "13px" }}>
                            {t("presentation.Step")}
                          </span>
                        </div>

                        {!isAutomatic && (
                          <div
                            className="d-flex align-items-center"
                            style={{
                              fontSize: "13px",
                              // marginLeft: "2px",
                            }}
                          >
                            <ReactToggle
                              checked={notesEditor.showEditor}
                              icons={false}
                              className={`toggle-icon toggle-playback ${
                                notesEditor.showEditor ? "active" : ""
                              }`}
                              onChange={handleNotesEditorToggle}
                              aria-label="Toggle Notes Editor"
                              disabled={meetingData?.type === "Newsletter"}
                              style={{ transform: "scale(0.8)" }}
                            />
                            <span style={{ fontSize: "13px" }}>
                              {t("presentation.Notes")}
                            </span>
                          </div>
                        )}

                        <div
                          className="d-flex align-items-center"
                          style={{
                            fontSize: "13px",
                            // marginLeft: "2px",
                          }}
                        >
                          <ReactToggle
                            checked={decisionEditor.showEditor}
                            icons={false}
                            className={`toggle-icon toggle-playback ${
                              decisionEditor.showEditor ? "active" : ""
                            }`}
                            onChange={handleDecisionEditorToggle}
                            aria-label="Toggle Decision Editor"
                            style={{ transform: "scale(0.8)" }} // Make the toggle smaller
                          />
                          <span style={{ fontSize: "13px" }}>
                            {t("presentation.Decision")}
                          </span>
                        </div>

                        <div
                          className="d-flex align-items-center"
                          style={{
                            fontSize: "13px",
                            // marginLeft: "2px",
                          }}
                        >
                          <ReactToggle
                            checked={planDActionEditor.showEditor}
                            icons={false}
                            className={`toggle-icon toggle-playback ${
                              planDActionEditor.showEditor ? "active" : ""
                            }`}
                            onChange={handlePlanDActionEditor}
                            aria-label="Toggle Plan D'Action Editor"
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span style={{ fontSize: "13px" }}>
                            {t("presentation.Strategy")}
                          </span>
                        </div>

                        <div
                          className="d-flex align-items-center"
                          style={{
                            fontSize: "13px",
                            // marginLeft: "2px",
                          }}
                        >
                          <ReactToggle
                            checked={fileEditor.showEditor}
                            icons={false}
                            className={`toggle-icon toggle-playback ${
                              fileEditor.showEditor ? "active" : ""
                            }`}
                            onChange={handleFileEditor}
                            aria-label="Toggle Plan D'Action Editor"
                            style={{ transform: "scale(0.8)" }}
                          />
                          <span style={{ fontSize: "13px" }}>
                            {t("presentation.Files")}
                          </span>
                        </div>
                      </div>
                      {/* <button
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
                     onClick={async () => {
                       await previousStep();
                     }}
                   >
                     {t("Previous")}
                   </button> */}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Section */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  minHeight: 0, // Important for flex children to scroll properly
                }}
              >
                <div style={{ height: "100vh" }}>
                  <div
                    className={`
                                    ${
                                      !decisionEditor.showEditor ||
                                      !notesEditor.showEditor ||
                                      !planDActionEditor.showEditor
                                        ? ""
                                        : "displaycard card-body"
                                    }
                                   
                                    `}
                    style={{
                      maxHeight:
                        showStepContentEditor === false &&
                        !decisionEditor.showEditor &&
                        !notesEditor.showEditor &&
                        !planDActionEditor.showEditor &&
                        !fileEditor.showEditor &&
                        "100vh",
                      height:
                        showStepContentEditor === false &&
                        !decisionEditor.showEditor &&
                        !notesEditor.showEditor &&
                        !planDActionEditor.showEditor &&
                        !fileEditor.showEditor &&
                        "100vh",
                      border:
                        showStepContentEditor === false &&
                        !decisionEditor.showEditor &&
                        !notesEditor.showEditor &&
                        !planDActionEditor.showEditor &&
                        !fileEditor.showEditor &&
                        "2px solid #eee",
                      padding:
                        showStepContentEditor === false &&
                        !decisionEditor.showEditor &&
                        !notesEditor.showEditor &&
                        !planDActionEditor.showEditor &&
                        !fileEditor.showEditor &&
                        "10px",
                    }}
                  >
                    {decisionEditor.showEditor === false &&
                      showStepContentEditor === false &&
                      notesEditor.showEditor === false &&
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
                            // height="90vh"
                            style={{ height: "100vh" }}
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
                              meetingData?.steps[currentStepIndex]?.url
                            )}
                            width="100%"
                            style={{ height: "100vh" }}
                            onLoad={() => setIFrameLoad(false)}
                          />
                          {iFrameLoad && <div className="loader"></div>}
                        </div>
                      ) : (
                        <div
                          className="rendered-content"
                          dangerouslySetInnerHTML={{
                            __html: sanitizedContent,
                          }}
                        />
                      ))}

                    {/* NOTES EDITOR */}
                    {notesEditor.showEditor && (
                      <>
                        {meetingData?.type === "Newsletter" ? (
                          <div style={{ height: "100vh" }}>
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
                            disabled={true}
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

                              // file_picker_callback: function (
                              //   callback,
                              //   value,
                              //   meta
                              // ) {
                              //   if (meta.filetype === "image") {
                              //     const input = document.createElement("input");
                              //     input.setAttribute("type", "file");
                              //     input.setAttribute("accept", "image/*");

                              //     input.onchange = function () {
                              //       const file = input.files[0];
                              //       const reader = new FileReader();

                              //       reader.onload = function (e) {
                              //         const img = new Image();
                              //         img.src = e.target.result;

                              //         img.onload = function () {
                              //           const canvas =
                              //             document.createElement("canvas");
                              //           const ctx = canvas.getContext("2d");
                              //           const maxWidth = 700;
                              //           const maxHeight = 394;

                              //           let newWidth = img.width;
                              //           let newHeight = img.height;

                              //           if (img.width > maxWidth) {
                              //             newWidth = maxWidth;
                              //             newHeight =
                              //               (img.height * maxWidth) / img.width;
                              //           }

                              //           if (newHeight > maxHeight) {
                              //             newHeight = maxHeight;
                              //             newWidth =
                              //               (img.width * maxHeight) / img.height;
                              //           }

                              //           canvas.width = newWidth;
                              //           canvas.height = newHeight;

                              //           ctx.drawImage(
                              //             img,
                              //             0,
                              //             0,
                              //             newWidth,
                              //             newHeight
                              //           );

                              //           const resizedImageData = canvas.toDataURL(
                              //             file.type
                              //           );

                              //           // Pass the resized image data to the callback function
                              //           callback(resizedImageData, {
                              //             alt: file.name,
                              //           });
                              //         };

                              //         img.src = e.target.result;
                              //       };

                              //       reader.readAsDataURL(file);
                              //     };

                              //     input.click();
                              //   }
                              // },
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
                            {/* <button
                            className="btn btn-primary"
                            style={{
                              backgroundColor: "rgb(0, 38, 177)",
                            }}
                            onClick={() => addDecisionForStep(currentStepIndex)}
                          >
                            + {t("presentation.Add Decision")}
                          </button> */}
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
                                          <tr
                                            key={index}
                                            className="table-data"
                                          >
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
                                      : null // Do nothing if there are no decisions
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}

                    {fileEditor.showEditor && (
                      <>
                        {fileEditor.showEditor && (
                          <>
                            {!isModalOpen2 && (
                              <StepFile
                                isFileUploaded={isFileUploaded}
                                setIsFileUploaded={setIsFileUploaded}
                                openModal={openModal}
                                meeting={meetingData}
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
                                    zIndex: 9999, // make sure it's above everything
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
                                          zIndex: 9999, // make sure it's above everything
                                          // overflowY: "auto",
                                          // padding: "1rem",
                                        }}
                                      >
                                        {/* Show PDF or Other File Types */}
                                        {modalContent?.file_type &&
                                        modalContent?.file_type.includes(
                                          "pdf"
                                        ) ? (
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
                                            "video"
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
                                                        excelData[0] || {}
                                                      ).map((key, index) => (
                                                        <th key={index}>
                                                          {key}
                                                        </th>
                                                      ))}
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {excelData.map(
                                                      (row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                          {Object.values(
                                                            row
                                                          ).map(
                                                            (
                                                              value,
                                                              colIndex
                                                            ) => (
                                                              <td
                                                                key={colIndex}
                                                              >
                                                                {value}
                                                              </td>
                                                            )
                                                          )}
                                                        </tr>
                                                      )
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : (modalContent &&
                                            modalContent?.file_type ===
                                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                                          modalContent?.file_type ===
                                            "text/plain" ||
                                          modalContent?.file_type ===
                                            "image/png" ||
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
                                              pluginRenderers={
                                                DocViewerRenderers
                                              }
                                              config={{
                                                header: {
                                                  disableFileName: true,
                                                  retainURLParams: true,
                                                },
                                              }}
                                            />
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
                      </>
                    )}

                    {!notesEditor.showEditor &&
                      !decisionEditor.showEditor &&
                      !showStepContentEditor &&
                      planDActionEditor.showEditor && (
                        <div className="col-md-12 mt-4">
                          <div className="decision-editor-container">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h5>{t("presentation.strategies")}</h5>
                              {/* <button
                              className="btn btn-primary"
                              style={{
                                backgroundColor: "rgb(0, 38, 177)",
                              }}
                              onClick={() => handleButtonClick()}
                            >
                              + {t("presentation.Add Strategy")}
                            </button> */}
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
                                    {/* <th className="table-row-head text-center">
                                    {t("Actions")}
                                  </th> */}
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
                                            obj.action_days === item.action_days
                                        );
                                        if (!exists) acc.push(item);
                                        return acc;
                                      }, [])
                                      ?.map((user, index) => (
                                        <tr
                                          className="table-data"
                                          key={user?.id}
                                        >
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
                                                  "."
                                                )[0]
                                              }
                                            </span>
                                          </td>
                                          <td className="text-center table-data-row">
                                            <Tooltip
                                              title={
                                                user?.participant_full_name
                                              }
                                              placement="top"
                                            >
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
                                            </Tooltip>
                                          </td>
                                          {/* <td className="text-center table-data-row">
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
                                        </td> */}
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
                      !planDActionEditor.showEditor &&
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
                                            "token"
                                          )}`,
                                        },
                                      }
                                    );

                                    if (response.status === 200) {
                                      // Update the file in the state
                                      const updatedSteps = [
                                        ...(meetingData?.steps || []),
                                      ];
                                      const selectedStep =
                                        updatedSteps[currentStepIndex];
                                      selectedStep.file =
                                        response.data.data.file;
                                      setMeetingData({
                                        ...meetingData,
                                        steps: updatedSteps,
                                      });
                                    }
                                  } catch (error) {
                                    console.log(
                                      "error while uploading file",
                                      error
                                    );
                                  }
                                }}
                              />
                            </ShowIF>
                          </section>

                          <ShowIF
                            condition={
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Excel"
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
                                          "token"
                                        )}`,
                                      },
                                    }
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
                                    error
                                  );
                                }
                              }}
                            />
                          </ShowIF>
                          <ShowIF
                            condition={
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Editeur"
                            }
                          >
                            <Editor
                              onBlur={(value) => {
                                console.log("value", value);
                              }}
                              key={currentStepIndex}
                              apiKey={TINYMCEAPI}
                              disabled={true}
                              value={
                                meetingData?.steps[currentStepIndex]
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
                                //   images_upload_handler:
                                //     image_upload_handler_callback,
                              }}
                              onEditorChange={(content) => {
                                const sanitizedContent =
                                  sanitizeIframeContent(content);
                                setMeetingData((prevData) => ({
                                  ...prevData,
                                  steps: prevData.steps.map((step, index) => {
                                    if (index === currentStepIndex) {
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
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Subtask"
                            }
                          >
                            <Editor
                              onBlur={(value) => {
                                console.log("value", value);
                              }}
                              key={currentStepIndex}
                              apiKey={TINYMCEAPI}
                              disabled={true}
                              value={
                                meetingData?.steps[currentStepIndex]
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
                                //   images_upload_handler:
                                //     image_upload_handler_callback,
                              }}
                              // onEditorChange={(content) => {
                              //   setMeetingData((prevData) => ({
                              //     ...prevData,
                              //     steps: prevData.steps.map(
                              //       (step, index) => {
                              //         if (index === currentStepIndex) {
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
                                    if (index === currentStepIndex) {
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
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Email"
                            }
                          >
                            <Editor
                              onBlur={(value) => {
                                console.log("value", value);
                              }}
                              key={currentStepIndex}
                              disabled={true}
                              apiKey={TINYMCEAPI}
                              value={
                                meetingData?.steps[currentStepIndex]
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
                                //   images_upload_handler:
                                //     image_upload_handler_callback,
                              }}
                              onEditorChange={(content) => {
                                setMeetingData((prevData) => ({
                                  ...prevData,
                                  steps: prevData.steps.map((step, index) => {
                                    if (index === currentStepIndex) {
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
                              meetingData?.steps[currentStepIndex]
                                .editor_type === "Url"
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
                                    if (index === currentStepIndex) {
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MeetingPreview;
