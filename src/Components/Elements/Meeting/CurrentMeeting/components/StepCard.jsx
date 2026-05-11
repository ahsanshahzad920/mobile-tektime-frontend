import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import { Button, Card, Modal, Spinner, Form, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../../../../context/SidebarContext";
import moment from "moment";
import { FaExpand } from "react-icons/fa"; // Import the FaExpand icon
import { PiFilePdfLight } from "react-icons/pi";
import { IoCopyOutline, IoVideocamOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatPauseTime,
  formatStepDate,
  getTimeUnitDisplay,
  markTodoMeeting,
  markTodo,
  markToFinish,

} from "../../../../Utils/MeetingFunctions";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { HiUserCircle } from "react-icons/hi2";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlinePhotoSizeSelectActual,
} from "react-icons/md";
import { toast } from "react-toastify";
import { RiFileExcel2Line } from "react-icons/ri";
import { formatDate, formatTime } from "../../GetMeeting/Helpers/functionHelper";
import Spreadsheet from "react-spreadsheet";
import { read, utils } from "xlsx";
import DOMPurify from "dompurify";
import { useRecording } from "../../../../../context/RecordingContext";
import ConfirmationModal from "../../../../Utils/ConfirmationModal";
import {
  StepCounterContextProvider,
  useStepCounterContext,
} from "../../context/StepCounterContext";
import { HiOutlineDotsVertical } from "react-icons/hi";
import StepChart from "../../CreateNewMeeting/StepChart";
import StepChartUpcoming from "../../CompletedMeeting/StepChartUpcoming";
import { useMeetings } from '../../../../../context/MeetingsContext';
const LazyStepChart = lazy(() => import("../../CreateNewMeeting/StepChart"));

const StepCard = ({
  data,

  users,
  meeting,
  refreshMeeting,
}) => {
  const { setSelectedStep } = useStepCounterContext();

  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toggle, show } = useSidebarContext();
  const [stepId, setStepId] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);
  const [isDrop, setIsDrop] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [inProgressStep, setInProgressStep] = useState(null);
  const [showReestimateModal, setShowReestimateModal] = useState(false);
  const [additionalTime, setAdditionalTime] = useState(1);
  const [stepToReestimate, setStepToReestimate] = useState(null);
  const [showConfirmLastStepModal, setShowConfirmLastStepModal] = useState(false);
  const [stepNotes, setStepNotes] = useState("");
  const [isClose, setIsClose] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showCancelNotes, setShowCancelNotes] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");
  const [stepToCancel, setStepToCancel] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
    toggle(true);
  };
  const [loading, setLoading] = useState(false);

  const [visoModal, setVisioModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [step, setStep] = useState(null);

  const handleConfirm = () => {
    setVisioModal(false);
    if (selectedItem) {
      setTimeout(() => {
        const newTab = window.open(
          selectedItem?.meet_link,
          "_blank",
          "noopener,noreferrer"
        );

        if (!newTab) {
          console.error("Popup blocked! The new tab could not be opened.");
        } else {
          newTab.focus(); // Bring the new tab to the front after 5 seconds
        }
      }, 5000); // 5-second delay
    }
    continueChangeStatusAndPlay(selectedItem, step);
  };

  const handleClose = () => {
    setVisioModal(false);
    setSelectedItem(null);
    continueChangeStatusAndPlay(selectedItem, step);
  };
  const changeStatusAndPlay = async (item, step) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    setStep(step);

    continueChangeStatusAndPlay(item, step);
  };
  const continueChangeStatusAndPlay = async (item, step) => {
    setSelectedStep(step);

    navigate(`/actīon-play/${item?.id}/${step?.id}`);
  };

  const localizeTimeTaken = (timeTaken) => {
    if (!timeTaken) return;

    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    // Split timeTaken string by spaces and iterate over each segment
    return timeTaken
      .split(" ")
      .map((part) => {
        // Check if the part is numeric or text
        if (!isNaN(part)) {
          return part; // Return the number as is
        }
        // Otherwise, it's a unit; look up its localized version
        return timeUnits[part] || part; // Fallback to original if no localization
      })
      .join(" ");
  };

  const convertTo24HourFormat = (time, date, type, timezone) => {
    if (!time || !date || !type) {
      return false;
    }

    const meetingTimezone = timezone || "Europe/Paris";
    const userTimezone = moment.tz.guess();

    // Convert meeting time from its original timezone to the user's timezone
    const convertedTime = moment
      .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
      .tz(userTimezone);

    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    // const timeMoment = moment(time, "hh:mm:ss A");
    // return timeMoment.isValid() ? timeMoment.format("HH:mm:ss") : "";
    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    const timeMoment = moment(convertedTime, "hh:mm:ss A");

    // Check if the time is valid
    if (!timeMoment.isValid()) return "";

    // If the meeting type is 'Quiz', include seconds in the format
    const format = type === "seconds" ? "HH[h]mm[m]ss" : "HH[h]mm";

    // Return the time in the appropriate format
    return timeMoment.format(format);
  };

  const localizeTimeTakenActive = (timeTaken) => {
    if (!timeTaken) return "";

    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    // Split the timeTaken string by " - " to separate time components
    const timeParts = timeTaken.split(" - ");

    // Initialize variables for each time component
    let days = null;
    let hours = null;
    let minutes = null;
    let seconds = null;

    // Iterate over each part and assign it to the corresponding variable
    timeParts.forEach((part) => {
      if (part.includes("day")) {
        days = part;
      } else if (part.includes("hour")) {
        hours = part;
      } else if (part.includes("min")) {
        minutes = part;
      } else if (part.includes("sec")) {
        seconds = part;
      }
    });

    // Check if days are present
    const hasDays = Boolean(days);

    // Determine what to show based on the presence of days
    let result = "";
    if (hasDays) {
      // Show days and hours if days are present
      result = [days, hours].filter(Boolean).join(" - ");
    } else if (hours) {
      // Show only hours and minutes if hours and minutes are present
      result = [hours, minutes].filter(Boolean).join(" - ");
    } else if (minutes) {
      // Show minutes only if no days or hours are present
      // result = minutes;
      result = [minutes, seconds].filter(Boolean).join(" - ");
    } else {
      result = seconds;
    }

    // Return empty string if result is undefined or empty
    if (!result) return "";

    // Localize and return the result
    return result
      .split(" ")
      .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
      .join(" ");
  };

  const [items, setItems] = useState(data); // Store the items in the state
  const [isDrag, setIsDrag] = useState(false);
  const onDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const draggedStep = items[result.source.index];
    const destinationStep = items[result.destination.index];

    // Prevent drag if status is 'in_progress'
    if (
      draggedStep?.step_status === "in_progress" ||
      draggedStep?.step_status === "completed"
    ) {
      console.log("Cannot drag steps with 'in_progress' status.");
      return;
    }

    // Prevent moving any step before a 'completed' step
    if (
      destinationStep?.step_status === "completed" &&
      draggedStep?.step_status !== "completed"
    ) {
      return;
    }

    // Prevent placing a 'completed' step after an 'upcoming' or 'in_progress' step
    if (
      draggedStep?.step_status === "completed" &&
      (destinationStep?.step_status === null ||
        destinationStep?.step_status === "in_progress")
    ) {
      return;
    }

    // Prevent placing a step with 'null' status before an 'in_progress' step
    if (
      draggedStep?.step_status === null &&
      destinationStep?.step_status === "in_progress"
    ) {
      return;
    }

    // 🛠️ Make deep copy BEFORE reorder
    const originalItems = items.map((item) => ({ ...item }));

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    // ✅ Compare with original copy
    const changedSteps = reorderedItems.filter((step, index) => {
      return step.id !== originalItems[index].id;
    });

    setItems(reorderedItems);
    setIsDrag(true);

    // Call the API to save the changed order
    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps/reorder`,
        {
          meeting_id: meeting?.id,
          steps: changedSteps.map((step) => ({
            id: step.id,
            order_no: step.order_no,
          })),
          _method: "post",
        },
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        }
      );

      if (response.status === 200) {
        await refreshMeeting();
        setIsDrag(false);
      } else {
        console.error("Error updating the order");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setIsDrag(false);
    }
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update the order_no after reordering
    return result.map((item, index) => ({
      ...item,
      order_no: index + 1, // Update the order_no based on the new index
    }));
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
  const [dropdownVisible, setDropdownVisible] = useState(
    Array(data?.length).fill(true)
  );
  const dropdownRefs = useRef([]);

  const toggleDropdown = (index) => {
    return;
    setDropdownVisible((prev) => {
      const newDropdownVisible = [...prev];
      newDropdownVisible[index] = !newDropdownVisible[index];
      return newDropdownVisible;
    });
  };
  useEffect(() => {
    data?.forEach((item, index) => {
      const el = dropdownRefs.current[index];
      if (el) {
        if (dropdownVisible[index]) {
          el.style.display = "block";
          requestAnimationFrame(() => {
            el.classList.add("show");
          });
        } else {
          el.classList.remove("show");
          el.addEventListener(
            "transitionend",
            () => {
              el.style.display = "none";
            },
            { once: true }
          );
        }
      }
    });
  }, [dropdownVisible, data]);

  useEffect(() => {
    const currentInProgressStep = data?.find(
      (item) => item.step_status === "in_progress"
    );
    setInProgressStep(currentInProgressStep || null);
  }, [data]);

  // Fetch Excel data when inProgressStep changes
  useEffect(() => {
    const fetchExcel = async () => {
      if (inProgressStep?.editor_type === "Excel" && inProgressStep?.file) {
        try {
          const fileResponse = await axios.get(
            `${Assets_URL}/${inProgressStep.file}`,
            {
              responseType: "arraybuffer",
            }
          );

          const fileData = fileResponse.data;
          const workbook = read(fileData, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });

          const formattedData = jsonSheetData.map((row, rowIndex) =>
            row.map((cell) => ({
              value: cell,
              readOnly: rowIndex === 0,
            }))
          );

          setExcelData(formattedData);
        } catch (error) {
          console.error("Error fetching Excel file:", error);
        }
      }
    };

    if (inProgressStep) {
      fetchExcel();
    }
  }, [inProgressStep]);

  const fetchExcelData = async (file) => {
    if (file) {
      try {
        const response = await fetch(`${Assets_URL}/${file}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fileData = await response.arrayBuffer();
        const workbook = read(fileData, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });

        const formattedData = jsonSheetData.map((row, rowIndex) =>
          row.map((cell) => ({
            value: cell,
            readOnly: rowIndex === 0,
          }))
        );

        setExcelData(formattedData);
      } catch (error) {
        console.error("Error fetching Excel file:", error);
      }
    }
  };

  const [orderSelectOpen, setOrderSelectOpen] = useState(null);
  const [maxOrderNo, setMaxOrderNo] = useState(0); // Maximum order number

  useEffect(() => {
    if (data && data.length > 0) {
      // Find the maximum order_no from all steps
      const maxOrder = Math.max(...data.map((step) => step.order_no || 0));
      setMaxOrderNo(maxOrder);
    } else {
      setMaxOrderNo(0);
    }
  }, [data]);

  const handleOrderChange = async (step, newOrder) => {
    // Use maxOrderNo + 1 instead of totalSteps for validation
    if (isNaN(newOrder) || newOrder < 1 || newOrder > maxOrderNo + 1) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps/${step?.id}`,
        {
          ...step,
          order_no: parseInt(newOrder),
          is_order_change: true,
          _method: "PUT",
        },
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        }
      );

      if (response.status === 200 || response.status === 200) {
        await refreshMeeting();
        setOrderSelectOpen(null);
        toast.success(t("step_order_updated"));
      } else {
        console.error("Error updating step order");
        toast.error(t("step_order_update_failed"));
      }
    } catch (error) {
      console.error("API call failed:", error);
      toast.error(t("step_order_update_failed"));
    }
  };

  /* --------------------------------------------------------------
   NEW – three‑dot menu (hover → icon → click → dropdown)
   → placed **right before the image** and dropdown aligned to the icon
-------------------------------------------------------------- */
  const [menuOpen, setMenuOpen] = useState({});
  const menuRefs = useRef({});
  const iconRefs = useRef({}); // Add ref for icons

  useEffect(() => {
    const handler = (e) => {
      Object.keys(menuRefs.current).forEach((id) => {
        const menu = menuRefs.current[id];
        const icon = iconRefs.current[id];

        // Check if click is outside both menu AND icon
        if (
          menu &&
          !menu.contains(e.target) &&
          icon &&
          !icon.contains(e.target)
        ) {
          setMenuOpen((p) => ({ ...p, [id]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItemStyle = {
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  };


    const [isForceStep, setIsForceStep] = useState(false);

   const [showForceModal, setShowForceModal] = useState(false);
    const [forcedStep, setForcedStep] = useState(null);
  
    const [modalSteps, setModalSteps] = useState([]);
    const [isLoadingSteps, setIsLoadingSteps] = useState(false);
    const openForceModal = async (step) => {
      setForcedStep(step);
      setShowForceModal(true);
      setIsLoadingSteps(true);
  
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-prev-upcomnig-steps/${step?.id}`,
          {
            headers: {
              Authorization: `Bearer ${
                CookieService.get("token")
              }`,
            },
          }
        );
        setModalSteps(response.data?.data || []); // Adjust based on actual response structure
      } catch (error) {
        console.error("Error fetching steps for force start modal:", error);
      } finally {
        setIsLoadingSteps(false);
      }
    };
  
    const handleForceStart = async (step) => {
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
                CookieService.get("token")
              }`,
            },
          }
        );
        if (response?.status) {
          if (
            meeting?.type === "Task" ||
            meeting?.type === "Strategy" ||
            meeting?.type === "Prestation Client"
          ) {
            markTodoMeeting(meeting?.id);
          }
  
          navigate(`/actīon-play/${meeting?.id}/${step?.id}`);
        }
      } catch (error) {
        console.log("error while click force start button", error);
      }
    };


      const { setCallApi } = useMeetings();
  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };
  const handlePlayMeetingStep = async (item, step) => {
    const scheduledDateTime = new Date(`${item?.date}T${item?.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);

    updateCallApi(false);
    
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
        item?.status === "active"
      ) {
        toast.error(t("errors.playMeeting"));
        setLoading(false);

        return;
      }
    }

    continueHandlePlayMeetingStep(item,step);
  };

    const continueHandlePlayMeetingStep = async (item,step) => {
    updateCallApi(false);
    setLoading(true);

    const scheduledDateTime = new Date(`${item?.date}T${item?.start_time}`);
    const currentDateTime = new Date();
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const formattedCurrentDate = currentDateTime.toISOString().split("T")[0];
    const stepTimeFormatted = moment().tz(userTimeZone).format("hh:mm:ss A");
    const startDateFormatted = moment().tz(userTimeZone).format("YYYY-MM-DD");

    const targetStep = item.steps.find((step) => step.id === parseInt(step?.id));
    const minOrderNo = Math.min(...item.steps.map((step) => step.order_no));
    const firstStep = item.steps.find((step) => step.order_no === minOrderNo);
    const firstParticipant = firstStep?.assigned_to;

    const updatedSteps = item?.steps?.map((step) => {
      // ✅ Step to be played based on param
      if (step.id === targetStep?.id) {
        return {
          ...step,
          status: "in_progress",
          step_status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
          step_time: stepTimeFormatted,
          start_date: startDateFormatted,
        };
      }

      // ✅ Same order_no and same user → todo
      if (
        step.order_no === minOrderNo &&
        step.assigned_to === firstParticipant
      ) {
        return {
          ...step,
          status: "todo",
          step_status: "todo",
        };
      }

      // ✅ Same order_no but different user → in_progress
      if (
        step.order_no === minOrderNo &&
        step.assigned_to !== firstParticipant
      ) {
        return {
          ...step,
          status: "in_progress",
          step_status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
          step_time: stepTimeFormatted,
          start_date: startDateFormatted,
        };
      }

      // ✅ All other steps untouched
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
      participants: [...item?.user_with_participants],
      moment_privacy_teams:
        item?.moment_privacy === "team" &&
        item?.moment_privacy_teams?.length &&
        typeof item?.moment_privacy_teams[0] === "object"
          ? item?.moment_privacy_teams.map((team) => team.id)
          : item?.moment_privacy_teams || [],
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
        if (
          item?.type === "Task" ||
          item?.type === "Strategy" ||
          item?.type === "Prestation Client"
        ) {
          markTodoMeeting(item?.id);
        }

        // ✅ Navigate to correct step
        navigate(`/actīon-play/${item.id}/${targetStep?.id}`);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };


      const [selectedStepId, setSelectedStepId] = useState(null);
      const handleShow = (step) => {
        setSelectedStepId(step?.id);
        setIsModalOpen(true);
      };
    

       const [showCopy, setShowCopy] = useState(false);
        const closeCopyModal = () => setShowCopy(false);
        const [duplicatedStep, setDuplicatedStep] = useState(null); // store copied step data
      
        const handleCopyStep = async (item) => {
          const maxOrderNo = Math.max(
            ...meeting?.steps.map((step) => step.order_no ?? 0),
            0
          );
      
          const duplicateStepData = {
            ...item,
            _method: "put",
            duplicate: true,
            time_taken: null,
            savedTime: null,
            negative_time: "0",
            note: null,
            decision: null,
            step_status: null,
            status: "active",
            current_time: null,
            current_date: null,
            end_time: null,
            end_date: null,
            meeting_id: item?.meeting_id,
            order_no: maxOrderNo + 1,
            sent: 0,
            copy_order_no: true,
          };
          try {
            const response = await axios.post(
              `${API_BASE_URL}/steps/${item?.id}`,
              duplicateStepData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${
                    CookieService.get("token")
                  }`,
                },
              }
            );
            if (response.status) {
              const newStep = response?.data?.data;
              setDuplicatedStep(newStep); // Save step data for modal
              setShowCopy(true); // Open modal
            }
          } catch (error) {
            toast.error(error?.response?.data?.message);
          }
        };

  const handleStartStep = async (step) => {
    const now = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(now.toLocaleString("en-US", options));

    const latestFormattedTime = formatTime(timeInUserZone);
    const latestFormattedDate = formatDate(timeInUserZone);

    const endTime = new Date();
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toISOString().split("T")[0];

    // Format the end time and date
    const formattedEndDate = endTime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: userTimeZone,
    });

    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const payload = {
      ...step,
      step_status: "in_progress",
      status: "in_progress",
      current_time: localEndTime,
      current_date: formattedCurrentDate,
      step_time: localEndTime,
      start_date: formattedCurrentDate,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: latestFormattedTime,
      pause_current_date: latestFormattedDate,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${step?.id}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status) {
        navigate(`/actīon-play/${meeting?.id}/${step?.id}`);
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markToFinish(step?.id);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error starting step:", error);
    }
  };

         const handleStartToFinishStep = async (step) => {
    const now = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(now.toLocaleString("en-US", options));

    const latestFormattedTime = formatTime(timeInUserZone);
    const latestFormattedDate = formatDate(timeInUserZone);

    const payload = {
      ...step,
      step_status: "in_progress",
      status: "in_progress",
      re_open_to_finish_step: true,
      pause_current_time: latestFormattedTime,
      pause_current_date: latestFormattedDate,
    };
    //
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${step?.id}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
      );
      if (response?.status) {
        navigate(`/actīon-play/${meeting?.id}/${step?.id}`);
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markToFinish(step?.id);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error starting step:", error);
    }
  };

        const handlePauseStep = async (step) => {
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
            const payload = {
              step_status: "to_finish",
              status: "to_finish",
              step_id: parseInt(step?.id),
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
              }
            );
            if (response.status) {
              toast.success(t("Step paused successfully"));
              await refreshMeeting();
            }
          } catch (error) {
            console.error("Error while pausing step:", error);
            toast.error(t("Failed to pause step"));
          }
        };

        const handleDelete = async (id) => {
          if (!window.confirm(t("Are you sure you want to delete this step?"))) return;
          try {
            const response = await axios.delete(`${API_BASE_URL}/steps/${id}`, {
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            });
            if (response.status) {
              toast.success(t("Step deleted successfully"));
              await refreshMeeting();
            }
          } catch (error) {
            console.log("error while deleting step", error);
            toast.error(error?.response?.data?.message || t("Failed to delete step"));
          }
        };

        const handleOpenReestimate = (step) => {
          setStepToReestimate(step);
          setShowReestimateModal(true);
        };

        const updateStepReestimate = async () => {
          if (!stepToReestimate || !stepToReestimate.id) return;

          const currentStep = stepToReestimate;
          const stepId = currentStep?.id;

          const now = new Date();
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const options = { timeZone: userTimeZone };
          const timeInUserZone = new Date(now.toLocaleString("en-US", options));

          const latestFormattedTime = formatTime(timeInUserZone);
          const latestFormattedDate = formatDate(timeInUserZone);

          // Calculate additional seconds
          let additionalSeconds = 0;
          const unit = currentStep?.time_unit;

          if (unit === "day" || unit === "days") {
            additionalSeconds = Number(additionalTime) * 86400; // 1 day = 86400 seconds
          } else if (unit === "hour" || unit === "hours") {
            additionalSeconds = Number(additionalTime) * 3600; // 1 hour = 3600 seconds
          } else if (unit === "minute" || unit === "minutes") {
            additionalSeconds = Number(additionalTime) * 60; // 1 minute = 60 seconds
          } else if (unit === "second" || unit === "seconds") {
            additionalSeconds = Number(additionalTime); // seconds as is
          }

          const isDelay = currentStep?.delay;

          const token = CookieService.get("token");
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };

          try {
            let response;

            if (isDelay) {
              const delayPayload = {
                step_id: stepId,
                re_estimate_time: Number(additionalTime), 
                savedTime: Number(additionalSeconds), 
              };

              response = await axios.post(
                `${API_BASE_URL}/update-estimate-time`,
                delayPayload,
                { headers },
              );
            } else {
              const targetStatus = currentStep?.step_status === "in_progress" ? "in_progress" : "to_finish";
              const normalPayload = {
                ...currentStep,
                step_status: targetStatus,
                status: targetStatus,
                savedTime:
                  currentStep?.savedTime === 0 ? 0 : (currentStep?.savedTime && currentStep?.savedTime != 0) ? currentStep?.savedTime : 0,

                count2: Number(additionalTime),
                time: Number(additionalTime),
                delay: null,
                negative_time: "0",
                pause_current_time: latestFormattedTime,
                pause_current_date: latestFormattedDate,
                step_reestimated_time: true
              };

              response = await axios.post(
                `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
                normalPayload,
                { headers },
              );
            }

            if (response.status === 200 || response.status === 201) {
              toast.success(t("Step re-estimated successfully"));
              setShowReestimateModal(false);
              await refreshMeeting();
            }
          } catch (error) {
            console.error("Error updating step estimate:", error);
            toast.error(t("Failed to update step estimate"));
          }
        };

  const handleEndStepClick = (step) => {
    setActiveStep(step);
    setStepNotes(step?.note || "");
    setShowConfirmLastStepModal(true);
  };

  const closeCurrentStep = async (step) => {
    setIsClose(true);
    const stepId = step?.id;
    const token = CookieService.get("token");
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    
  
    const endTime = new Date();

    
    // Format the end time and date
    const formattedEndDate = endTime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: userTimeZone,
    });

    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const postData = {
      ...step,
      savedTime: step?.savedTime || 0,
      negative_time: 0,
      step_status: "completed",
      status: "completed",
      meeting_id: meeting?.id,
      note: stepNotes,
      end_time: localEndTime,
      end_date: formattedEndDate,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: localEndTime,
      pause_current_date: formattedEndDate,
    };

    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${localEndTime}&current_date=${formattedEndDate}&pause_current_time=${localEndTime}&pause_current_date=${formattedEndDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status) {
        setIsClose(false);
        setShowConfirmLastStepModal(false);
        toast.success(t("Step completed successfully"));
          if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markTodo(stepId);
        }
        await refreshMeeting();
      }
    } catch (error) {
      console.error("Error completing step:", error);
      setIsClose(false);
      toast.error(t("Failed to complete step"));
    }
  };

  const handleCancelClick = (step) => {
    setStepToCancel(step);
    setShowConfirmCancel(true);
  };

  const confirmCancelStep = () => {
    setShowConfirmCancel(false);
    setShowCancelNotes(true);
  };

  const finalizeCancelStep = async () => {
    if (!stepToCancel) return;
    
    const stepId = stepToCancel.id;
    const token = CookieService.get("token");
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const endTime = new Date();

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

    const postData = {
      ...stepToCancel,
      savedTime: stepToCancel.savedTime || 0,
      negative_time: 0,
      step_status: "cancelled",
      status: "cancelled",
      meeting_id: meeting?.id,
      note: cancelNotes,
      end_time: localEndTime,
      end_date: formattedEndDate,
      real_time: localEndTime,
      real_date: formattedEndDate,
      pause_current_time: localEndTime,
      pause_current_date: formattedEndDate,
    };

    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${localEndTime}&current_date=${formattedEndDate}&pause_current_time=${localEndTime}&pause_current_date=${formattedEndDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status) {
        setShowCancelNotes(false);
        setCancelNotes("");
        setStepToCancel(null);
        toast.success(t("Step cancelled successfully"));
        await refreshMeeting();
      }
    } catch (error) {
      console.error("Error cancelling step:", error);
      toast.error(t("Failed to cancel step"));
    }
  };



  return (
    <>
    <StepCounterContextProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="row" style={{ marginBottom: "3rem", gap: "4px" }}>
          {data?.map((item, index) => {
            let editorContent = item.editor_content;
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = editorContent;
            const firstImageTag = tempDiv.querySelector("img");
            const firstImageUrl = firstImageTag
              ? firstImageTag.getAttribute("src")
              : "";

            const handleClick = (item, index) => {
              if (loading) return;
              setLoading(true);
              // const selectedStep = data?.steps[index];
              if (item?.step_status === "completed") {
                if (item?.editor_type === "Excel") {
                  fetchExcelData(item?.file);
                }
                navigate(`/step/${item?.id}`, {
                  state: { meeting: meeting },
                });
              } else if (item?.step_status === "in_progress") {
                changeStatusAndPlay(meeting, item);
                toggle(true);
              } else if (item?.step_status === "todo") {
                navigate(`/step/${item?.id}`, {
                  state: { meeting: meeting },
                });
              } else {
                navigate(`/step/${item?.id}`, {
                  state: { meeting: meeting },
                });
              }
              setTimeout(() => setLoading(false), 2000); // Adjust the delay if necessary
            };

            return (
              <div
                className="col-12 ste"
                key={item.id ?? index}
                /* ---- HOVER ---- */
                onMouseEnter={() => {
                  const card = document.getElementById(`step-card-${item.id}`);
                  card?.classList.add("step-card-hover");
                }}
                onMouseLeave={() => {
                  const card = document.getElementById(`step-card-${item.id}`);
                  card?.classList.remove("step-card-hover");
                }}
              >
                <Card
                  id={`step-card-${item.id}`}
                  className="mt-4 step-card-meeting"
                  onClick={() => handleClick(item, index)}
                >
                  <Card.Body className="step-card-body">
                    <div className="step-number-container">
                      {item?.step_status === "todo" ||
                      item?.step_status === null ? (
                        <div
                          className="order-select-container"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderSelectOpen(
                              orderSelectOpen === index ? null : index
                            );
                          }}
                        >
                          <span className="step-number">
                            {item?.order_no <= 9 ? "0" : ""}
                            {item?.order_no}
                          </span>
                          <span className="order-select-arrow">
                            {orderSelectOpen === index ? (
                              <MdKeyboardArrowUp />
                            ) : (
                              <MdKeyboardArrowDown />
                            )}
                          </span>
                          {orderSelectOpen === index && (
                            <div className="order-select-dropdown">
                              {Array.from(
                                { length: maxOrderNo + 1 },
                                (_, i) => i + 1
                              )
                                .filter((order) => {
                                  // Find all steps with this order number
                                  const stepsWithOrder = data.filter(
                                    (step) => step.order_no === order
                                  );

                                  // Only include order numbers where ALL steps are not completed
                                  const allStepsCompleted =
                                    stepsWithOrder.length > 0 &&
                                    stepsWithOrder.every(
                                      (step) => step.step_status === "completed"
                                    );

                                  return !allStepsCompleted;
                                })
                                .map((order) => (
                                  <div
                                    key={order}
                                    className={`order-option ${
                                      order === item.order_no ? "selected" : ""
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (order !== item.order_no) {
                                        handleOrderChange(item, order);
                                      }
                                    }}
                                  >
                                    {order <= 9 ? "0" : ""}
                                    {order}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="step-number">
                          {item?.order_no <= 9 ? "0" : ""}
                          {item?.order_no}
                        </span>
                      )}
                    </div>
                    <div className="step-body">
                      <div className="step-data stepcard-stepdata">
                        <div className="step-header">
                          <Card.Title className="step-card-heading">
                            {item?.title}
                          </Card.Title>
                          {!window.location.href.includes("/present/invite") &&
                            // meeting.status === "in_progress" &&
                            (item.step_status === "completed" ? (
                              <span className="status-badge-completed">
                                {/* Completed */}
                                {t("badge.completed")}
                              </span>
                            ) : item?.step_status === "to_accept" ? (
                              <span className="status-badge-green">
                                {/* To Accept */}
                                {t("badge.to_accept")}
                              </span>
                            ) : item?.step_status === "no_status" ?  null : item.step_status === "in_progress" ? (
                              <span
                                className={
                                  convertTimeTakenToSeconds(item?.time_taken) >
                                  convertCount2ToSeconds(
                                    item?.count2,
                                    item?.time_unit
                                  )
                                    ? "status-badge-red"
                                    : "status-badge-inprogress"
                                }
                              >
                                {t("badge.inprogress")}
                              </span>
                            ) : item.step_status === "to_finish" ? (
                              <span className={"status-badge-finish"}>
                                {t("badge.finish")}
                              </span>
                            ) : item?.step_status === "cancelled" ? (
                              <span className={"status-badge-cancel"}>
                                {t("badge.cancel")}
                              </span>
                            ) : item?.step_status === "todo" ? (
                              // null
                              <span className="status-badge-green">
                                {t("badge.todo")}
                              </span>
                            ) : (
                              // null
                              <span className="status-badge-upcoming">
                                {t("badge.future")}
                                {/* Upcoming */}
                              </span>
                            ))}
                        </div>
                        <div className="step-content">
                          <Card.Subtitle className="step-card-subtext">
                            {meeting?.newsletter_guide ? (
                              <>
                                {meeting?.newsletter_guide?.logo ? (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    src={
                                      meeting?.newsletter_guide?.logo?.startsWith(
                                        "http"
                                      )
                                        ? meeting?.newsletter_guide?.logo
                                        : Assets_URL +
                                          "/" +
                                          meeting?.newsletter_guide?.logo
                                    }
                                    alt={meeting?.newsletter_guide?.name}
                                  />
                                ) : (
                                  <HiUserCircle
                                    style={{
                                      height: "24px",
                                      width: "24px",
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                {item?.image || item?.assigned_to_image ? (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    src={
                                      item?.image?.startsWith("users/")
                                        ? `${Assets_URL}/${item.image}`
                                        : item?.assigned_to_image?.startsWith(
                                            "users/"
                                          )
                                        ? `${Assets_URL}/${item.assigned_to_image}`
                                        : item?.image || item?.assigned_to_image // Fallback to raw URL if no prefix
                                    }
                                    // src={
                                    //     item?.assigned_to_image
                                    // }
                                    alt="img"
                                  />
                                ) : (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    // src={`${users?.participant_image}`}
                                    // src={
                                    //   // users?.image
                                    //   //   ? Assets_URL + "/" + users.image
                                    //     // :
                                    //      users?.participant_image
                                    // }
                                    src={
                                      users?.image?.startsWith("users/")
                                        ? Assets_URL + "/" + users?.image
                                        : users?.image
                                    }
                                    alt="img"
                                  />
                                )}
                              </>
                            )}

                            {meeting?.newsletter_guide ? (
                              <span>{meeting?.newsletter_guide?.name}</span>
                            ) : (
                              <span>
                                {item?.assigned_to_name ||
                                  `${users?.firstName} ${users?.lastName}`}
                              </span>
                            )}
                          </Card.Subtitle>
                          <Card.Text className="step-card-content flex-row align-items-center card-text gap-0">
                            <img
                              height="16px"
                              width="16px"
                              src="/Assets/ion_time-outline.svg"
                              alt="time"
                            />
                            {window.location.href.includes(
                              "/present/invite"
                            ) ? (
                              <>
                                <span className="me-2">{item?.step_time}</span>
                              </>
                            ) : (
                              <span
                                className={`${
                                  item?.time_unit === "days" ? "me-2" : "me-2"
                                }`}
                              >
                                {item?.time_unit === "days" ? (
                                  <>
                                    {item.step_status === null ||
                                    item?.step_status === "todo"
                                      ? formatStepDate(
                                          item?.start_date,
                                          item?.step_time,

                                          meeting?.timezone
                                        )
                                      : formatStepDate(
                                          item?.start_date,
                                          item?.step_time,
                                          meeting?.timezone
                                        )}
                                  </>
                                ) : (
                                  <>
                                    {item?.step_status === null ||
                                    item?.step_status === "todo"
                                      ? formatStepDate(
                                          item?.start_date,
                                          item?.step_time,
                                          meeting?.timezone
                                        ) +
                                        " " +
                                        ` ${t("at")}` +
                                        " " +
                                        convertTo24HourFormat(
                                          item?.step_time,
                                          item?.start_date,
                                          item?.time_unit,
                                          meeting?.timezone
                                        )
                                      : formatStepDate(
                                          item?.start_date,
                                          item?.step_time,
                                          meeting?.timezone
                                        ) +
                                        " " +
                                        ` ${t("at")}` +
                                        " " +
                                        convertTo24HourFormat(
                                          item?.step_time,
                                          item?.start_date,
                                          item?.time_unit,
                                          meeting?.timezone
                                        )}
                                  </>
                                )}
                              </span>
                            )}{" "}
                          </Card.Text>
                          <Card.Text className="step-card-content flex-row align-items-center gap-0 mb-3">
                            <span className="">
                              <img
                                height="16px"
                                width="16px"
                                src="/Assets/alarm-invite.svg"
              alt="alarm"

                              />
                            </span>
                            {window.location.href.includes(
                              "/present/invite"
                            ) ? (
                              <span>
                                {localizeTimeTaken(
                                  item?.time_taken?.replace("-", "")
                                )}
                              </span>
                            ) : (
                              <>
                                {item?.step_status === null ||
                                item?.step_status === "todo" 
                                  ? item.count2 +
                                    " " +
                                    `${getTimeUnitDisplay(
                                      item?.count2,
                                      item?.time_unit,
                                      t,
                                      meeting?.type

                                    )}`
                                  : item?.step_status === "to_finish"
                                  ? formatPauseTime(item?.work_time, t)
                                  : localizeTimeTakenActive(
                                      item?.time_taken?.replace("-", "")
                                    )}
                                {item?.step_status !== null &&
                                  item?.step_status !== "todo" && (
                                    <span>
                                      &nbsp; {item?.step_status === "to_accept" ? "" : "/"}{" "}
                                      {item.count2 +
                                        " " +
                                        `${getTimeUnitDisplay(
                                          item?.count2,
                                          item?.time_unit,
                                          t,
                                      meeting?.type

                                        )}`}
                                    </span>
                                  )}
                              </>
                            )}{" "}
                          </Card.Text>
                        </div>
                      </div>

                      {/* ---- THREE‑DOT ICON (right before the image) ---- */}
                    {item?.step_status !== "completed" &&  <div className="d-flex gap-5 align-items-center">
                        {/* ---- THREE‑DOT ICON (right before the image) ---- */}
                        <div
                          ref={(el) => (iconRefs.current[item.id] = el)} // Add this ref
                          className="step-card-menu-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }));
                          }}
                          style={{
                            display: "block",
                            cursor: "pointer",
                            position: "relative",
                            zIndex: 10,
                          }}
                        >
                          <HiOutlineDotsVertical size={24} />

                          {/* ---- DROPDOWN (opens under icon) ---- */}
                          {menuOpen[item.id] && (
                            <div
                              ref={(el) => (menuRefs.current[item.id] = el)}
                              className="step-card-dropdown"
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: "4px",
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                                zIndex: 100,
                                minWidth: "160px",
                                fontSize: "14px",
                                pointerEvents: "auto", // allow clicks inside dropdown
                              }}
                              onClick={(e) => e.stopPropagation()} // prevent card click
                            >
                              {(item?.step_status === null ||
                                (item?.step_status === "todo")) && (
                                <div
                                  className="dropdown-item"
                                  style={menuItemStyle}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                      if (item?.order_no === 1 && item?.step_status === null && meeting?.status === "active") {
                                        handlePlayMeetingStep(meeting, item);
                                      }else if(item?.step_status === "todo"){
                                      handleStartStep(item);

                                      } else {
                                        openForceModal(item);
                                      }
                                    setMenuOpen((prev) => ({
                                      ...prev,
                                      [item.id]: false,
                                    }));
                                  }}
                                >
                                  {meeting?.status === "active" && item?.step_status === null && item?.order_no === 1
                                    ? t("buttons.Start moment")
                                    : item?.step_status === "todo" ? t("buttons.Start moment")
                                    : t("buttons.Force start")}
                                </div>
                              )}
                            {(item?.step_status === null ||
                        item?.step_status === "todo") &&  <div
                                className="dropdown-item"
                                style={{ ...menuItemStyle}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShow(item)
                                }}
                              >
                                {t("buttons.Modify")}
                              </div>}
                            {  <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add your View Details logic here
                                  handleCopyStep(item)
                                }}
                              >
                                {t("buttons.Copy")}
                              </div>}
                            {item?.step_status === "to_finish" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleStartToFinishStep(item);
                                }}
                              >
                                {t("buttons.Restart")}
                              </div>
                            )}
                            {item?.step_status === "in_progress" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePauseStep(item);
                                }}
                              >
                                                                 {t("Pause")}

                              </div>
                            )}
                            {item?.step_status === "in_progress" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEndStepClick(item);
                                  setMenuOpen((prev) => ({
                                    ...prev,
                                    [item.id]: false,
                                  }));
                                }}
                              >
                                {index === data?.length - 1 ? t("Close") : t("Terminer")}
                              </div>
                            )}
                            {item?.step_status === "in_progress" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(item);
                                  setMenuOpen((prev) => ({
                                    ...prev,
                                    [item.id]: false,
                                  }));
                                }}
                              >
                                {t("Reject")}
                              </div>
                            )}
                            {item?.step_status === "in_progress" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShow(item);
                                  setMenuOpen((prev) => ({
                                    ...prev,
                                    [item.id]: false,
                                  }));
                                }}
                              >
                                {t("Ré-assigner")}
                              </div>
                            )}

                            {(item?.step_status === "to_finish" || item?.step_status === "in_progress") && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReestimate(item);
                                }}
                              >
                                 {t("Ré-estimer")}
                              </div>
                            )}
                            {item?.step_status !== "completed" && item?.step_status !== "in_progress" && (
                              <div
                                className="dropdown-item"
                                style={menuItemStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item?.id);
                                }}
                              >
                                {t("buttons.Delete")}
                              </div>
                            )}
                            </div>
                          )}
                        </div>

                        <div className="step-images">
                          {item.editor_content &&
                          item.editor_content.trim() !==
                            "<html><head></head><body></body></html>" ? (
                            <div className="step-img-container">
                              {firstImageUrl ? (
                                <Card.Img
                                  className="step-img report-step-img"
                                  src={firstImageUrl}
                                />
                              ) : (
                                <div className="fallback-img-container">
                                  {/* <img
                                src="/Assets/Tek.png"
                                className="fallback-img"
                                alt="Fallback Image"
                              /> */}
                                  <FiEdit
                                    className="file-img img-fluid"
                                    style={{ padding: "12px" }}
                                  />
                                </div>
                              )}
                            </div>
                          ) : item.editor_type === "File" ? (
                            <div className="file-img-container">
                              <PiFilePdfLight
                                className="file-img img-fluid"
                                style={{ padding: "12px" }}
                              />
                            </div>
                          ) : item.editor_type === "Excel" ? (
                            <div className="file-img-container">
                              <RiFileExcel2Line
                                className="file-img img-fluid"
                                style={{ padding: "14px" }}
                              />
                            </div>
                          ) : item.editor_type === "Video" ? (
                            <div className="file-img-container">
                              <IoVideocamOutline
                                className="file-img img-fluid"
                                style={{ padding: "12px" }}
                              />
                            </div>
                          ) : item.editor_type === "Photo" ? (
                            <div className="file-img-container">
                              <MdOutlinePhotoSizeSelectActual
                                className="file-img img-fluid"
                                style={{ padding: "12px" }}
                              />
                            </div>
                          ) : item.url ? (
                            <div className="link-img-container">
                              <IoCopyOutline
                                className="file-img img-fluid"
                                style={{ padding: "12px" }}
                              />
                            </div>
                          ) : (
                            <div className="fallback-img-container">
                              <FiEdit
                                className="file-img img-fluid"
                                style={{ padding: "12px" }}
                              />
                            </div>
                          )}
                        </div>
                      </div>}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <Suspense fallback={<div>Loading...</div>}>
            <div className="new-meeting-modal">
              <LazyStepChart
                meetingId={meeting?.id}
                id={stepId}
                show={isModalOpen}
                meeting={meeting}
                setId={setStepId}
                closeModal={handleCloseModal}
                key={`step-chart-${stepId}`}
                isDrop={isDrop}
                stepIndex={stepIndex}
                refreshMeeting={refreshMeeting}
              />
            </div>
          </Suspense>
        )}

        {visoModal && (
          <ConfirmationModal
            message={t("Do you want to open the visioconference in a new tab?")}
            onCancel={handleClose}
            onConfirm={handleConfirm}
          />
        )}
      </Suspense>
    </StepCounterContextProvider>
       {/* Force Start Step Button Upcoming */}
          {showForceModal && (
            <Modal
              show={showForceModal}
              onHide={() => setShowForceModal(false)}
              backdrop="static"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  {t(
                    "The following actions are supposed to be done before this one in order of priority:"
                  )}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {isLoadingSteps ? (
                  <div className="text-center">
                    <Spinner animation="border" role="status" />
                  </div>
                ) : modalSteps.length > 0 ? (
                  <ul>
                    {modalSteps.map((s, index) => (
                      <li key={s.id || index}>
                        {s.order_no}. {s.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t("No Steps Exists!")}</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="danger" onClick={() => setShowForceModal(false)}>
                  {t("Cancel")}
                </Button>
                <button
                  className="btn"
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
                  }}
                  onClick={async () => {
                    setIsForceStep(true);
                    try {
                      await handleForceStart(forcedStep);
                      setShowForceModal(false);
                    } catch (error) {
                      console.error("Error while force starting step:", error);
                    } finally {
                      setIsForceStep(false);
                    }
                  }}
                >
                  {isForceStep ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    t("Force start anyway")
                  )}
                </button>
              </Modal.Footer>
            </Modal>
          )}


            {isModalOpen && (
                  <div className="tabs-container container-fluid">
                    <div className="new-meeting-modal">
                      <StepChartUpcoming
                meetingId={meeting?.id}
                id={selectedStepId || stepId}
                show={isModalOpen}
                meeting={meeting}
                setId={setSelectedStepId || setStepId}
                closeModal={handleCloseModal}
                key={`step-chart-${stepId}`}
                isDrop={isDrop}
                setIsDrop={setIsDrop}
                closeStep={refreshMeeting}
              />
                    </div>
                  </div>
               )} 


                 {showCopy && (
                       <div className="new-meeting-modal tabs-container">
                         <StepChart
                           meetingId={meeting?.id}
                           id={duplicatedStep?.id} // use duplicated step ID
                           setId={setStepId}
                           show={showCopy}
                           closeModal={closeCopyModal}
                           meeting={meeting}
                           isDrop={isDrop}
                           setIsDrop={setIsDrop}
                           closeStep={refreshMeeting}
                           isCopied={true}
                         />
                       </div>
                     )}
      {/* //Re estimate Modal  */}
      {showReestimateModal && (
        <Modal
          show={showReestimateModal}
          onHide={() => setShowReestimateModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {t("How much more time do you need to finish this step?")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>{t("Enter Time Duration")}</Form.Label>
              <div className="d-flex gap-4 align-items-center">
                <Form.Control
                  type="number"
                  min="1"
                  value={additionalTime}
                  onChange={(e) => setAdditionalTime(e.target.value)}
                />
                {meeting?.type === "Action1" ||
                meeting?.type === "Newsletter" ||
                meeting?.type === "Strategy" ||
                meeting?.type === "Sprint" ? (
                  <span className="fw-bold"> {t("days")} </span>
                ) : meeting?.type === "Task" ||
                  meeting?.type === "Prestation Client" ? (
                  <span className="fw-bold"> {t("hour")} </span>
                ) : meeting?.type === "Quiz" ? (
                  <span className="fw-bold"> {t("sec")} </span>
                ) : meeting?.type === "Special" ? (
                  <span className="fw-bold">
                    {" "}
                    {t(`time_unit.${stepToReestimate?.time_unit}`)}{" "}
                  </span>
                ) : (
                  <span className="fw-bold"> mins </span>
                )}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={() => setShowReestimateModal(false)}
            >
              {t("Cancel")}
            </Button>
            <button
              className="btn"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: " #FFFFFF",
                background: "#2C48AE",
                border: 0,
                outline: 0,
                padding: "10px 16px",
                borderRadius: "9px",
              }}
              onClick={()=>{
                updateStepReestimate()
              }}
            >
              {t("Validate")}
            </button>
          </Modal.Footer>
      </Modal>
    )}

      {/* Close Button Modal (To End) */}
      {showConfirmLastStepModal && (
        <Modal
          show={showConfirmLastStepModal}
          onHide={() => setShowConfirmLastStepModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("Commentaires")}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div
              id="auto-note-editable-content"
              contentEditable
              dangerouslySetInnerHTML={{
                __html: activeStep?.note || "",
              }}
              onInput={(e) => setStepNotes(e.currentTarget.innerHTML)}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                minHeight: "150px",
              }}
            />
          </Modal.Body>

          <Modal.Footer>
            <button
              className="btn"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: " #FFFFFF",
                background: "#2C48AE",
                border: 0,
                outline: 0,
                padding: "10px 16px",
                borderRadius: "9px",
              }}
              onClick={async () => {
                await closeCurrentStep(activeStep);
              }}
            >
              {isClose ? (
                <Spinner
                  as="div"
                  variant="light"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  animation="border"
                  style={{ margin: "2px 12px" }}
                />
              ) : (
                <>{t("Validate Notes")}</>
              )}
            </button>

            <Button
              variant="danger"
              onClick={() => setShowConfirmLastStepModal(false)}
            >
              {t("Cancel")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <Modal
          show={showConfirmCancel}
          onHide={() => setShowConfirmCancel(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("Confirm Cancellation")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t(
              "Are you sure you want to cancel this step? This action cannot be undone.",
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmCancel(false)}
            >
              {t("No")}
            </Button>
            <Button variant="danger" onClick={confirmCancelStep}>
              {t("Yes, Cancel")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Add Cancel Notes Modal */}
      {showCancelNotes && (
        <Modal
          show={showCancelNotes}
          onHide={() => setShowCancelNotes(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("Add Cancellation Notes")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>
                  {t("Explain why this step is being cancelled:")}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Enter cancellation reason"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCancelNotes(false)}
            >
              {t("Skip")}
            </Button>
            <Button variant="primary" onClick={finalizeCancelStep}>
              {t("Submit")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
  </>



  );
};

export default StepCard;
