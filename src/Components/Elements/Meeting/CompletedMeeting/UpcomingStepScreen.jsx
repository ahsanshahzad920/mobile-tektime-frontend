import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { FiEdit, FiMoreVertical } from "react-icons/fi";
import { PiFilePdfLight } from "react-icons/pi";
import { RiEditBoxLine, RiFileExcel2Line } from "react-icons/ri";
import {
  convertTo24HourFormat,
  formatStepDate,
  markTodo,
  markTodoMeeting,
  markToFinish,
} from "../../../Utils/MeetingFunctions";
import {
  IoVideocamOutline,
  IoCopyOutline,
  IoArrowBackSharp,
} from "react-icons/io5";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { FaRegFileAudio } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  Card,
  Spinner,
  Button,
  Modal,
  Form,
  ProgressBar,
} from "react-bootstrap";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import moment from "moment";
import { Avatar, Tooltip } from "antd";
import HostCard from "../CurrentMeeting/components/HostCard";
import TimerComponent from "./TimerComponent";
import { Editor } from "@tinymce/tinymce-react";
import StepChart, {
  optimizeEditorContent,
} from "../CreateNewMeeting/StepChart";
import StepChartAction from "../../Actions/StepChartAction";
import StepChartUpcoming from "./StepChartUpcoming";
import ActionAssignmentPopup from "../../Actions/ActionAssignmentPopup";
import { toast } from "react-toastify";
import {
  formatDate,
  formatTime,
  parseAndFormatDateTime,
} from "../GetMeeting/Helpers/functionHelper";
import { useMeetings } from "../../../../context/MeetingsContext";
import StepParticipant from "./StepParticipant";
import MediaGallery from "./MediaGallery";
import { BiCloudUpload } from "react-icons/bi";

function UpcomingStepScreen({
  meeting,
  step,
  meta,
  getStep,
  setModifiedFileText,
  modifiedFileText,
  loading,
  setLoading,
}) {
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  // const [modifiedFileText, setModifiedFileText] = useState(null);
  const [t] = useTranslation("global");
  // const [loading, setLoading] = useState(false);
  // const [step, setStep] = useState(null);
  const [showHostProfile, setShowHostProfile] = useState(false);
  const { id } = useParams();
  const [stepId, setStepId] = useState(id); // Initialize with the id from params

  const navigate = useNavigate();
  const [editContentSave, setEditorContentSave] = useState(false);

  const currentTime = new Date();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options = { timeZone: userTimeZone };
  const timeInUserZone = new Date(currentTime.toLocaleString("en-US", options));

  const formattedTime = formatTime(timeInUserZone);
  const formattedDate = formatDate(timeInUserZone);
  const { setCallApi } = useMeetings();

  // const getStep = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${API_BASE_URL}/steps/${id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${
  //             CookieService.get("token") || CookieService.get("token")
  //           }`,
  //         },
  //       }
  //     );
  //     if (response.status === 200) {
  //       // setStep(response?.data?.data);
  //       setModifiedFileText(response?.data?.data?.editor_content);

  //       // setMeta(response?.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   const getMeeting = async () => {
  //     const meetingId = step?.meeting_id;
  //     const currentTime = new Date();
  //            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //            const options = { timeZone: userTimeZone };
  //            const timeInUserZone = new Date(
  //              currentTime.toLocaleString("en-US", options)
  //            );

  //            const formattedTime = formatTime(timeInUserZone);
  //            const formattedDate = formatDate(timeInUserZone);
  //     try {
  //       const response = await axios.get(
  //         `${API_BASE_URL}/get-meeting/${meetingId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${
  //               CookieService.get("token") || CookieService.get("token")
  //             }`,
  //           },
  //         }
  //       );
  //       if (response.status === 200 || response.status === 201) {
  //         // setMeeting(response?.data?.data);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   // if (step?.meeting_id) {
  //   //   getMeeting();
  //   // }
  // }, [id,step]);

  // useEffect(() => {
  //   if (id) {
  //     // getStep();
  //   }
  // }, [id]);

  const handleSaveEditorContent = async () => {
    setEditorContentSave(true);
    const optimizedEditorContent =
      await optimizeEditorContent(modifiedFileText);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/steps/${id}`,
        {
          ...step,
          editor_content: optimizedEditorContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
      );
      if (response.status === 200) {
        // toast.success("Content saved successfully");
        getStep();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setEditorContentSave(false);
    }
  };

  const handleHostShow = () => {
    setShowHostProfile(true);
  };
  const hideHostShow = () => {
    setShowHostProfile(false);
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

    return false;
  };

  const handlePrevious = (step) => {
    if (meta?.previous_step?.step_status === "in_progress") {
      navigate(`/actīon-play/${meeting?.id}/${meta?.previous_step?.id}`);
    } else {
      navigate(`/step/${meta?.previous_step?.id}`, {
        state: { meeting: meeting },
      });
    }
  };
  const handleNext = (step) => {
    if (meta?.next_step?.step_status === "in_progress") {
      navigate(`/actīon-play/${meeting?.id}/${meta?.next_step?.id}`);
    } else {
      navigate(`/step/${meta?.next_step?.id}`, {
        state: { meeting: meeting },
      });
      // return;
    }
  };

  const handleClick = (meeting) => {
    if (
      meeting?.status === "abort" ||
      meeting?.status === "closed" ||
      meeting?.status === "cancelled"
    ) {
      // Navigate to /invite/:id if status is active or in_progress
      navigate(`/present/invite/${meeting?.id}`, {
        state: { from: "meeting" },
      });
    } else {
      // Navigate to /present/invite/:id if status is not active or in_progress
      navigate(`/invite/${meeting?.id}`, { state: { from: "meeting" } });
    }
  };

  const calculateEndDate = (
    startDate,
    stepTime,
    count2,
    timeUnit,
    timezone,
  ) => {
    if (!startDate || !stepTime || !count2 || !timeUnit) return startDate;

    let startMoment = moment.tz(
      `${startDate} ${stepTime}`,
      "YYYY-MM-DD hh:mm:ss A",
      timezone,
    );

    switch (timeUnit) {
      case "days":
        startMoment.add(count2, "days");
        break;
      case "hours":
        startMoment.add(count2, "hours");
        break;
      case "minutes":
        startMoment.add(count2, "minutes");
        break;
      case "seconds":
        startMoment.add(count2, "seconds");
        break;
      default:
        break;
    }

    return startMoment.format("DD/MM/YYYY");
  };

  const calculateEndTime = (
    startDate,
    startTime,
    duration,
    timeUnit,
    timezone,
  ) => {
    if (!startDate || !startTime || !duration || !timeUnit || !timezone) {
      console.warn("Missing values in calculateEndTime:", {
        startDate,
        startTime,
        duration,
        timeUnit,
        timezone,
      });
      return "";
    }

    const meetingTimezone = timezone || "Europe/Paris";
    const userTimezone = moment.tz.guess(); // Get the user's timezone dynamically

    // Ensure startTime is correctly interpreted (handle both 12-hour & 24-hour formats)
    let stepStartTime = moment.tz(
      `${startDate} ${startTime}`,
      ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD hh:mm:ss A"],
      meetingTimezone,
    );

    if (!stepStartTime.isValid()) {
      console.error("Invalid date format in calculateEndTime:", {
        startDate,
        startTime,
      });
      return "";
    }

    // Add duration based on the time unit
    if (timeUnit === "days") {
      stepStartTime = stepStartTime.add(duration, "days");
    } else if (timeUnit === "hours") {
      stepStartTime = stepStartTime.add(duration, "hours");
    } else {
      stepStartTime = stepStartTime.add(duration, "minutes");
    }

    // Convert to the user's timezone and ensure it's in 24-hour format
    const convertedTime = stepStartTime.tz(userTimezone);

    console.log(
      "Calculated end time in user timezone (24h format):",
      convertedTime.format("YYYY-MM-DD HH:mm"),
    );

    // Return the correct format (e.g., `18h35`)
    return convertedTime.format("HH[h]mm");
  };

  // Utility function for debouncing
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Add this in your component
  const debouncedAutoSave = useMemo(
    () =>
      debounce(async (content) => {
        try {
          const optimizedEditorContent = await optimizeEditorContent(content);

          const payload = {
            editor_content: optimizedEditorContent,
          };
          const response = await axios.post(
            `${API_BASE_URL}/autosave-step-content/${id}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );
          if (response.status) {
          }
        } catch (error) {
          console.log("error", error);
          setEditorContentSave(false);

          // setIsValidate(false);
          // toast.error(
          //   t(`meeting.newMeeting.${error?.response?.data?.errors?.title[0]}`)
          // );
        }
      }, 4000), // 2-second delay
    [step],
  );

  // -----------------------------------RE Estimate Time
  const [showReestimateModal, setShowReestimateModal] = useState(false);
  const [additionalTime, setAdditionalTime] = useState(1);
  const handleOpenReestimate = () => {
    setShowReestimateModal(true);
    setAdditionalTime(1); // Reset input
  };

  // const updateStep = async () => {
  //   const now = new Date();
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   const options = { timeZone: userTimeZone };
  //   const timeInUserZone = new Date(now.toLocaleString("en-US", options));

  //   const latestFormattedTime = formatTime(timeInUserZone);
  //   const latestFormattedDate = formatDate(timeInUserZone);

  //   const updatedStep = {
  //     ...step,
  //     count1: Number(additionalTime),
  //     count2: Number(additionalTime),
  //     time: Number(additionalTime),
  //   };

  //   let apiUrl = `${API_BASE_URL}/steps/${id}`;

  //   if (step?.step_status === "to_finish") {
  //     apiUrl = `${API_BASE_URL}/play-meetings/steps/${id}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`;
  //   } else {
  //     updatedStep._method = "put";
  //   }

  //   try {
  //     const response = await axios.post(apiUrl, updatedStep, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${
  //           CookieService.get("token") || CookieService.get("token")
  //         }`,
  //       },
  //     });

  //     if (response.status === 200) {
  //       // navigate(-1); // Navigate back to previous page
  //       setShowReestimateModal(false);
  //       await getStep();
  //     }
  //   } catch (error) {
  //     console.error("Error updating step:", error);
  //   }
  // };

   const updateStep = async (step) => {
    if (!step || !step.id) return;

    const currentStep = step;
    const stepId = currentStep?.id;

      const now = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(now.toLocaleString("en-US", options));

    const latestFormattedTime = formatTime(timeInUserZone);
    const latestFormattedDate = formatDate(timeInUserZone);

    // Calculate additional seconds
    let additionalSeconds = 0;
    const unit = step?.time_unit;

    if (unit === "day" || unit === "days") {
      additionalSeconds = Number(additionalTime) * 86400; // 1 day = 86400 seconds
    } else if (unit === "hour" || unit === "hours") {
      additionalSeconds = Number(additionalTime) * 3600; // 1 hour = 3600 seconds
    } else if (unit === "minute" || unit === "minutes") {
      additionalSeconds = Number(additionalTime) * 60; // 1 minute = 60 seconds
    } else if (unit === "second" || unit === "seconds") {
      additionalSeconds = Number(additionalTime); // seconds as is
    }

    const isDelay = step?.delay;

    const token = CookieService.get("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      // setIsReestimating(true);
      let response;

      if (isDelay) {
        // Payload for delay
        const delayPayload = {
          step_id: stepId,
          re_estimate_time: Number(additionalTime), //from user
          savedTime: Number(additionalSeconds), // convert the input time in seconds
        };

        response = await axios.post(
          `${API_BASE_URL}/update-estimate-time`,
          delayPayload,
          { headers },
        );
      } else {
        // Normal update payload
        const normalPayload = {
          ...currentStep,
          step_status: "to_finish",
          status: "to_finish",
          savedTime:
            currentStep?.savedTime === 0 ? 0 : (currentStep?.savedTime && currentStep?.savedTime != 0) ? currentStep?.savedTime : 0,

          count2: Number(additionalTime),
          time: Number(additionalTime),
          // count2: step.count2 + Number(additionalTime),
          // time: step.count2 + Number(additionalTime),
          delay: null,
          negative_time: "0",
          pause_current_time: latestFormattedTime,
          pause_current_date: latestFormattedDate,
          step_reestimated_time:true
        };

        response = await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
          normalPayload,
          { headers },
        );
      }

      if (response.status === 200) {
        setShowReestimateModal(false);
        await getStep();
      }
    } catch (error) {
      console.error("Error updating step:", error);
    } finally {
      // setShowReestimateModal(false);
    }
  };
  //--------------------------
  //   Cancel Step Button

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [stepToCancel, setStepToCancel] = useState(null);

  const handleCancelClick = () => {
    setShowConfirmCancel(true);
    setStepToCancel(step);
  };

  const deleteStep = async () => {
    if (!stepToCancel) return;

    try {
      await axios.delete(`${API_BASE_URL}/steps/${stepToCancel.id}`, {
        headers: {
          Authorization: `Bearer ${
            CookieService.get("token")
          }`,
        },
      });

      setShowConfirmCancel(false);
      navigate(-1); // Navigate back to previous page
    } catch (error) {
      console.error("Error deleting step:", error);
    }
  };

  //------------------------------------Start Todo Step
  const handleStartStep = async () => {
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
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${id}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
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
        navigate(`/actīon-play/${meeting?.id}/${id}`);
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markToFinish(id);
        }
      }
    } catch (error) {
      console.error("Error starting step:", error);
    }
  };
  //------------------------------------Start ToFinish Step
  const handleStartToFinishStep = async () => {
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
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${id}/step-note-and-action?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}&pause_current_time=${latestFormattedTime}&pause_current_date=${latestFormattedDate}`,
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
        navigate(`/actīon-play/${meeting?.id}/${id}`);
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markToFinish(id);
        }
      }
    } catch (error) {
      console.error("Error starting step:", error);
    }
  };

  // -----------------------------------RE Assign Button
  const [show, setShow] = useState(false);
  const [isDrop, setIsDrop] = useState(false);

  const handleShow = () => {
    setShow(true);
  };

  const closeModal = () => setShow(false);

  // -----------------Repradre Button
  const [showResume, setShowResume] = useState(false);
  const handleCloseResume = () => setShowResume(false);
  const handleShowResume = () => {
    setShowResume(true);
  };

  //Reparde Button
  const todoStep = async (val) => {
    // setIsNext(true);
    // const currentStep = meeting?.steps[currentStepIndex];

    // const nextStep = meeting?.steps[currentStepIndex + 1];
    const stepId = step?.id;
    // const myNextStepId = step?.id;

    const optimizedEditorContent = await optimizeEditorContent(
      step?.editor_content,
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
    // setExitCurrentTime(localEndTime);
    // Convert current time to a string in the user's local time zone
    const localCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const postData = {
      ...step,
      editor_content: optimizedEditorContent || "",
      step_status:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? "todo"
          : "completed",
      status:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? "todo"
          : "completed",
      url: step?.url ? step?.url : null,
      current_time:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : step?.current_time,
      current_date:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : step?.current_date,
      meeting_id: parseInt(meeting?.id),
      end_time:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : localEndTime,
      end_date:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : formattedEndDate,
      real_time:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : localEndTime,
      real_date:
        meeting?.type === "Task" ||
        meeting?.type === "Strategy" ||
        meeting?.type === "Prestation Client"
          ? null
          : formattedEndDate,
      re_assign_step: true,
      time_taken: null,
    };

    try {
      const now = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(now.toLocaleString("en-US", options));

      const latestFormattedTime = formatTime(timeInUserZone);
      const latestFormattedDate = formatDate(timeInUserZone);

      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/?current_time=${latestFormattedTime}&current_date=${latestFormattedDate}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markTodo(id);
        }
        // await getMeeting();
        navigate(`/invite/${meeting?.id}`);
      }
    } catch (error) {
      // toast.error(error.response?.data?.message);
    }
  };
  const calculateToFinishEndDate = (
    startDate,
    stepTime,
    timeTaken,
    timezone,
  ) => {
    if (!startDate || !stepTime || !timeTaken) return startDate;

    // Parse the start date and time with timezone
    let startMoment = moment.tz(
      `${startDate} ${stepTime}`,
      "YYYY-MM-DD hh:mm:ss A",
      timezone,
    );
    console.log("startMoment", startMoment);

    // Regex to extract time units from time_taken string
    const timeUnits = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    timeTaken.split("-").forEach((part) => {
      let trimmedPart = part.trim();
      if (trimmedPart.includes("day")) {
        timeUnits.days = parseInt(trimmedPart);
      } else if (trimmedPart.includes("hour")) {
        timeUnits.hours = parseInt(trimmedPart);
      } else if (trimmedPart.includes("min")) {
        timeUnits.minutes = parseInt(trimmedPart);
      } else if (trimmedPart.includes("sec")) {
        timeUnits.seconds = parseInt(trimmedPart);
      }
    });

    // Add extracted time to moment object
    startMoment.add(timeUnits.days, "days");
    startMoment.add(timeUnits.hours, "hours");
    startMoment.add(timeUnits.minutes, "minutes");
    startMoment.add(timeUnits.seconds, "seconds");

    console.log("after", startMoment);

    return startMoment.format("DD/MM/YYYY"); // Return the updated date
  };

  const [showCopy, setShowCopy] = useState(false);
  const closeCopyModal = () => setShowCopy(false);

  const [isDuplicateStep, setIsDuplicateStep] = useState(false);
  const [duplicatedStep, setDuplicatedStep] = useState(null); // store copied step data

  const handleCopyStep = async (item) => {
    setIsDuplicateStep(true);
    // Get the current max order_no
    const maxOrderNo = Math.max(
      ...meeting?.steps.map((step) => step.order_no ?? 0),
      0,
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
        },
      );
      if (response.status) {
        const newStep = response?.data?.data;
        setDuplicatedStep(newStep); // Save step data for modal
        setIsDuplicateStep(false);
        setShowCopy(true); // Open modal
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      setIsDuplicateStep(false);
    }
  };

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };

  // -------------------------FOR PLAY MEETING FROM STEP--------
  const handlePlay = async (item) => {
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
        setLoading(false);
        return;
      }
    } else if (item?.type !== "Task" && item.type !== "Strategy") {
      // Allow play only if the time difference is within ±60 minutes for active meetings
      if (
        !(timeDifference >= -60 && timeDifference <= 60) &&
        item.status === "active"
      ) {
        toast.error(t("errors.playMeeting"));
        setLoading(false);

        return;
      }
    }

    continueHandlePlay(item);
  };

  const continueHandlePlay = async (item) => {
    updateCallApi(false);
    setLoading(true);

    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
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

    const targetStep = item.steps.find((step) => step.id === parseInt(id));
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
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
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

  // const continueHandlePlay = async (item) => {
  //   updateCallApi(false);
  //   setLoading(true);
  //   const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
  //   const currentDateTime = new Date();
  //   const currentTime = new Date();

  //   // Get the user's time zone
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //   const localCurrentTime = currentTime.toLocaleString("en-GB", {
  //     timeZone: userTimeZone,
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //     hour12: false,
  //   });
  //   const formattedCurrentDate = currentDateTime.toISOString().split("T")[0];

  //   const minOrderNo = Math.min(...item.steps.map((step) => step.order_no));

  //   // Find the first step (order_no 1)
  //   const firstStep = item.steps.find((step) => step.order_no === minOrderNo);
  //   const firstParticipant = firstStep?.assigned_to;

  //   // Format date and time in user's timezone
  //   const stepTimeFormatted = moment().tz(userTimeZone).format("hh:mm:ss A"); // "05:27:40 PM"
  //   const startDateFormatted = moment().tz(userTimeZone).format("YYYY-MM-DD"); // "2025-04-30"

  //   const updatedSteps = item?.steps?.map((step) => {
  //     if (step.id === firstStep.id) {
  //       // The actual step that's being played
  //       return {
  //         ...step,
  //         status: "in_progress",
  //         step_status: "in_progress",
  //         current_time: localCurrentTime,
  //         current_date: formattedCurrentDate,
  //         step_time: stepTimeFormatted,
  //         start_date: startDateFormatted,
  //       };
  //     } else if (
  //       step.order_no === minOrderNo &&
  //       step.assigned_to === firstParticipant
  //     ) {
  //       return {
  //         ...step,
  //         step_status: "todo",
  //         status: "todo",
  //       };
  //     } else if (
  //       step.order_no === minOrderNo &&
  //       step.assigned_to !== firstParticipant
  //     ) {
  //       return {
  //         ...step,
  //         step_status: "in_progress",
  //         status: "in_progress",
  //         current_time: localCurrentTime,
  //         current_date: formattedCurrentDate,
  //         step_time: stepTimeFormatted,
  //         start_date: startDateFormatted,
  //       };
  //     }
  //     return step;
  //   });

  //   const payload = {
  //     ...item,
  //     steps: updatedSteps,
  //     starts_at: localCurrentTime,
  //     current_date: currentDateTime,
  //     status: "in_progress",
  //     _method: "put",
  //     participants:[...item?.user_with_participants],
  //     moment_privacy_teams:
  //       item?.moment_privacy === "team" &&
  //       item?.moment_privacy_teams?.length &&
  //       typeof item?.moment_privacy_teams[0] === "object"
  //         ? item?.moment_privacy_teams.map((team) => team.id)
  //         : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
  //   };

  //   try {
  //     const response = await axios.post(
  //       `${API_BASE_URL}/meetings/${item.id}`,
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")}`,
  //         },
  //       }
  //     );
  //     if (response.status) {
  //       const firstInProgressStep = item?.steps[0];
  //       if (item?.type === "Task" || item?.type === "Strategy") {
  //         markTodoMeeting(item?.id);
  //       }
  //       navigate(`/actīon-play/${item.id}/${step?.id}`);

  //       setLoading(false);

  //       // navigate(`/destínation/${item?.unique_id}/${item?.id}`);
  //     }
  //   } catch (error) {
  //     console.log("error", error);
  //     setLoading(false);
  //   }
  // };

  const btnStyle = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "24px",
    textAlign: "left",
    color: "#FFFFFF",
    background: "#2C48AE",
    border: 0,
    outline: 0,
    padding: "7px 16px",
    borderRadius: "6px",
  };

  const { formattedDate: stepEndDate, formattedTime: stepEndTime } =
    parseAndFormatDateTime(
      step?.estimate_time,
      meeting?.type,
      step?.meeting?.timezone,
    );

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
        `${API_BASE_URL}/get-prev-upcomnig-steps/${id}`,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
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
              CookieService.get("token") || CookieService.get("token")
            }`,
          },
        },
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

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditTitle = (step) => {
    setEditingField("title");
    setEditValue(step?.title);
  };
  const handleSaveEdit = async () => {
    try {
      const token = CookieService.get("token");

      // Construct the payload with all meeting data, only updating the edited field
      const updatedStep = {
        ...step, // keep all other fields
        [editingField]: editValue, // only update the edited field
        _method: "put",
      };

      const response = await axios.post(
        `${API_BASE_URL}/steps/${stepId}`,
        updatedStep,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        setEditingField(null);
        await getStep();

        // await getMeeting();
        toast.success(t("Updated successfully"));
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // Add these states
  const [stepMedias, setStepMedias] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true); // ← NEW: Loading state for GET
  const [deletingId, setDeletingId] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMediaUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const validFiles = Array.from(files).filter((file) =>
      validTypes.includes(file.type),
    );
    const invalidFiles = files.length - validFiles.length;

    if (invalidFiles > 0) {
      toast.warn(t("Some files were skipped (only images & videos allowed)"));
    }

    if (validFiles.length === 0) return;

    setIsUploadingMedia(true);
    setUploadProgress(0);

    const formData = new FormData();
    validFiles.forEach((file, i) => {
      formData.append(`media[${i}]`, file);
    });
    formData.append("step_id", step?.id);

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

      // Refresh media after success
      const response = await axios.get(
        `${API_BASE_URL}/step-media/${step?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      setStepMedias(response?.data?.data?.media || []);

      toast.success(t("Media uploaded successfully!"));
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || t("Upload failed"));
    } finally {
      setIsUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    const fetchStepMedia = async () => {
      if (!step?.id) {
        setMediaLoading(false);
        return;
      }

      setMediaLoading(true); // ← Start loading

      try {
        const response = await axios.get(
          `${API_BASE_URL}/step-media/${step?.id}`,
          {
            headers: {
              Authorization: `Bearer ${
                CookieService.get("token")
              }`,
            },
          },
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

    fetchStepMedia();
  }, [step?.id]); // ← Better dependency: step.id only

  // DELETE MEDIA FUNCTION
  const handleDeleteMedia = async (mediaId) => {
    if (!mediaId) return;

    setDeletingId(mediaId); // Show spinner only on this item

    try {
      // Replace with your actual delete API endpoint
      await axios.delete(`${API_BASE_URL}/delete-media/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${
            CookieService.get("token")
          }`,
        },
      });

      // Remove from local state
      setStepMedias((prev) => prev.filter((media) => media.id !== mediaId));

      toast.success("Média supprimé avec succès !");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(
        error.response?.data?.message || "Échec de la suppression. Réessayez.",
      );
    } finally {
      setDeletingId(null); // Hide spinner
    }
  };
  return (
    <>
      {loading || !step || !meeting ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="invite p-2">
          <div className="row child-1">
            <div className="col-md-8 col-12">
              <div className="title mb-1">
                {(() => {
                  try {
                    // First, get the raw user JSON (adjust key if your stored user object uses a different name)
                    const userJson = CookieService.get("user"); // or "current_user", etc.
                    if (!userJson) return false;

                    const user = JSON.parse(userJson);

                    // Now extract user_needs from the user object
                    const userNeeds = user?.user_needs || user?.needs || [];

                    return (
                      Array.isArray(userNeeds) &&
                      userNeeds.some((n) => n.need === "action_need")
                    );
                  } catch (e) {
                    console.warn("Failed to parse user or user_needs", e);
                    return false;
                  }
                })() && (
                  <>
                    <Link
                      to={`/action`}
                      // style={{ textDecoration: "none", color: "#8590a3" }}
                    >
                      Actions
                    </Link>
                    <span> / </span>
                  </>
                )}

                {(() => {
                  try {
                    // First, get the raw user JSON (adjust key if your stored user object uses a different name)
                    const userJson = CookieService.get("user"); // or "current_user", etc.
                    if (!userJson) return false;

                    const user = JSON.parse(userJson);

                    // Now extract user_needs from the user object
                    const userNeeds = user?.user_needs || user?.needs || [];

                    return (
                      Array.isArray(userNeeds) &&
                      userNeeds.some((n) => n.need === "mission_need")
                    );
                  } catch (e) {
                    console.warn("Failed to parse user or user_needs", e);
                    return false;
                  }
                })() && (
                  <>
                    <Link to={`/invitiesToMeeting/${meeting?.destination_id}`}>
                      {meeting?.objective}
                    </Link>
                    <span> / </span>
                  </>
                )}
                <Link
                  to={`/invite/${meeting?.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(meeting);
                  }}
                  // style={{ textDecoration: "none", color: "#8590a3" }}
                >
                  {meeting?.title}
                </Link>
              </div>

              <div className="invite-header">
                <span
                  className="content-heading-title"
                  style={{ marginTop: 0 }}
                >
                  {step?.order_no && `${step.order_no}. `} {step?.title}
                  <span
                    className="ms-2 cursor-pointer"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditTitle(step)}
                  >
                    <RiEditBoxLine size={20} />
                  </span>
                  {step?.step_status === "todo" ? (
                    <span className="mx-2 badge todo">{t("badge.todo")}</span>
                  ) : step?.step_status === "to_accept" ? (
                    <span className="mx-2 badge todo">
                      {t("badge.to_accept")}
                    </span>
                  ) : step?.step_status === null ? (
                    <span className="mx-2 badge future">
                      {t("badge.future")}
                    </span>
                  ) : step?.step_status === "to_finish" ? (
                    <span className="mx-2 badge tofinish">
                      {t("badge.finish")}
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2 content-body present-invite-body mt-3 mt-lg-3">
                {meta?.previous_step !== null && (
                  <button
                    onClick={() => handlePrevious(step)}
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
                    {meta?.previous_step?.order_no}.{" "}
                    {meta?.previous_step?.title}
                  </button>
                )}

                {meta?.next_step !== null && (
                  <button
                    onClick={() => handleNext(step)}
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
                    {meta?.next_step?.order_no}. {meta?.next_step?.title}
                  </button>
                )}
              </div>
              {/* //For TODO */}
              {/* <div className="d-flex align-items-center gap-2 content-body present-invite-body mt-3 mt-lg-3">
                {meta?.prev_todo_step !== null && (
                  <button
                    onClick={() => handlePrevious(step)}
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
                    {meta?.prev_todo_step?.order_no}.{" "}
                    {meta?.prev_todo_step?.title}
                  </button>
                )}

                {meta?.next_todo_step !== null && (
                  <button
                    onClick={() => handleNext(step)}
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
                    {meta?.next_todo_step?.order_no}.{" "}
                    {meta?.next_todo_step?.title}
                  </button>
                )}
              </div> */}

              <div className="items mt-0 mt-md-2 audio-items">
                <div className="type">
                  {
                    step?.editor_type === "Editeur" ||
                    step?.editor_type === "Subtask" ||
                    step?.editor_type === "Prestation" ||
                    step?.editor_type === "Story" ||
                    step?.editor_type === "Email" ? (
                      <FiEdit
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "File" ? (
                      <PiFilePdfLight
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "Excel" ? (
                      <RiFileExcel2Line
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "Video" ||
                      step?.editor_type === "Video Report" ? (
                      <IoVideocamOutline
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "Photo" ? (
                      <MdOutlinePhotoSizeSelectActual
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "Url" ? (
                      <IoCopyOutline
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : step?.editor_type === "Audio" ? (
                      <FaRegFileAudio
                        className="completedonestep-iconwidth img-fluid"
                        style={{ padding: "5px" }}
                      />
                    ) : null
                    // <FiEdit className="file-img img-fluid" style={{ padding: "12px" }} />
                  }
                  <span className="time">{step?.editor_type}</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 content-body present-invite-body mt-3 mt-lg-3">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src="/Assets/invite-date.svg"
                    alt="Invite Date"
                    height="28"
                    width="28"
                  />
                  <span className="fw-bold formate-date">
                    {meeting?.type === "Special"
                      ? formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          step?.meeting?.timezone || "Europe/Paris",
                        ) +
                        ` ${t("at")} ` +
                        convertTo24HourFormat(
                          step?.step_time,
                          step?.start_date,
                          step?.time_unit,
                          step?.meeting?.timezone || "Europe/Paris",
                        )
                      : formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          step?.meeting?.timezone || "Europe/Paris",
                        ) +
                        ` ${t("at")} ` +
                        convertTo24HourFormat(
                          step?.step_time,
                          step?.start_date,
                          step?.time_unit,
                          step?.meeting?.timezone || "Europe/Paris",
                        )}{" "}
                  </span>
                  <span className="fw-bold formate-date">
                    {step?.step_status === "to_finish"
                      ? stepEndDate + ` ${t("at")} ` + stepEndTime
                      : calculateEndDate(
                          step?.start_date,
                          step?.step_time,
                          step?.count2,
                          step?.time_unit,
                          step?.meeting?.timezone || "Europe/Paris",
                        ) +
                        ` ${t("at")} ` +
                        calculateEndTime(
                          step?.start_date,
                          step?.step_time,
                          step?.count2,
                          step?.time_unit,
                          step?.meeting?.timezone || "Europe/Paris",
                        )}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="row mt-3">
                <div className="col-md-12 d-flex align-items-center gap-3">
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

                  {meeting?.share_by === "email" && (
                    <>
                      <div>
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 30 30"
                            width="30px"
                            height="30px"
                          >
                            <path
                              d="M 23 3 A 4 4 0 0 0 19 7 A 4 4 0 0 0 19.09375 7.8359375 L 10.011719 12.376953 A 4 4 0 0 0 7 11 A 4 4 0 0 0 3 15 A 4 4 0 0 0 7 19 A 4 4 0 0 0 10.013672 17.625 L 19.089844 22.164062 A 4 4 0 0 0 19 23 A 4 4 0 0 0 23 27 A 4 4 0 0 0 27 23 A 4 4 0 0 0 23 19 A 4 4 0 0 0 19.986328 20.375 L 10.910156 15.835938 A 4 4 0 0 0 11 15 A 4 4 0 0 0 10.90625 14.166016 L 19.988281 9.625 A 4 4 0 0 0 23 11 A 4 4 0 0 0 27 7 A 4 4 0 0 0 23 3 z"
                              fill="#3D57B5"
                            />
                          </svg>
                        </span>
                        {t("Shareby")}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Privacy */}
              <div className="row ">
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
                        <Avatar.Group>
                          {meeting?.user_with_participants?.map((item) => {
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
                      ) : meeting?.moment_privacy === "tektime members" ? (
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
                        /> //   title={meeting?.user?.enterprise?.name} // <Tooltip
                      ) : //   placement="top"
                      // >
                      //   <img
                      //     src={
                      //       meeting?.user?.enterprise?.logo?.startsWith(
                      //         "http"
                      //       )
                      //         ? meeting?.user?.enterprise?.logo
                      //         : Assets_URL +
                      //           "/" +
                      //           meeting?.user?.enterprise?.logo
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
                      meeting?.moment_privacy === "enterprise" ? (
                        <Tooltip
                          title={meeting?.user?.enterprise?.name}
                          placement="top"
                        >
                          <img
                            src={
                              meeting?.user?.enterprise?.logo?.startsWith(
                                "http",
                              )
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
                        <Tooltip
                          title={meeting?.user?.full_name}
                          placement="top"
                        >
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
              </div>

              <div>
                <div className="ps-0"></div>
              </div>
              <div className="row">
                <div className="col-md-12 d-flex align-items-center gap-3"></div>
              </div>
            </div>
            <div className="col-md-4 counter-container d-flex align-items-center flex-column w-auto">
              <TimerComponent
                step={step}
                toFinishEndDate={stepEndDate}
                toFinishEndTime={stepEndTime}
              />

              {/* Button Container */}
              <div className="d-flex justify-content-center gap-3 mt-3 align-items-center">
                {/* Start Button (only if null and first step) */}
                {meeting?.status === "active" &&
                  step?.order_no === 1 &&
                  step?.step_status === null && (
                    <button
                      className="btn"
                      onClick={() => handlePlay(meeting)}
                      style={btnStyle}
                    >
                      {t("buttons.Start moment")}
                    </button>
                  )}

                {/* Continue / Restart Button (if not null) */}
                {step?.step_status !== null &&
                  step?.step_status !== "to_accept" &&
                  step?.step_status !== "no_status" && (
                    <>
                      {CookieService.get("email") !==
                      step?.participant?.email ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            if (step?.step_status === "to_finish") {
                              handleShowResume();
                            }
                          }}
                          style={btnStyle}
                        >
                          {step?.step_status === "to_finish"
                            ? t("Reprendre")
                            : t("Reprendre")}
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => {
                            if (step?.step_status === "to_finish") {
                              handleStartToFinishStep();
                            } else {
                              handleStartStep();
                            }
                          }}
                          style={btnStyle}
                        >
                          {step?.step_status === "to_finish"
                            ? t("buttons.Restart")
                            : t("Continue")}
                        </button>
                      )}
                    </>
                  )}

                {/* If status is null, show Modify directly */}
                {step?.step_status === null && step?.order_no !== 1 && (
                  <button className="btn" onClick={handleShow} style={btnStyle}>
                    {t("buttons.Modify")}
                  </button>
                )}

                {/* {(step?.step_status === null || step?.step_status === "todo") && (
     <button className="btn" style={btnStyle} onClick={() => handleCopyStep(step)}>
     {isDuplicateStep ? (
       <Spinner
         as="div"
         variant="light"
         size="sm"
         role="status"
         aria-hidden="true"
         animation="border"
       />
     ) : (
       t("buttons.Copy")
     )}
   </button>
  )} */}

                {/* Delete / Reject Button */}
                {meeting?.prise_de_notes === "Automatic" &&
                meeting?.status === "in_progress" ? null : (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelClick}
                  >
                    {step?.step_status === null ? t("Delete") : t("Reject")}
                  </button>
                )}
                {/* Show dropdown only for in_progress or to_finish */}
                {step?.step_status === "to_finish" ||
                step?.step_status === "in_progress" ? (
                  <div className="dropdown d-flex justify-content-center">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        borderRadius: "9px",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        // padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiMoreVertical size={20} color="black" />
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      {/* Copy always shown */}
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCopyStep(step)}
                        >
                          {isDuplicateStep ? (
                            <Spinner
                              as="div"
                              variant="light"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              animation="border"
                            />
                          ) : (
                            t("buttons.Copy")
                          )}
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={handleOpenReestimate}
                        >
                          {t("Ré-estimer")}
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={handleShow}>
                          {t("Ré-assigner")}
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="dropdown d-flex justify-content-center">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      id="dropdownMenuButton"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        borderRadius: "9px",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        // padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FiMoreVertical size={20} color="black" />
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      {step?.step_status === null && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => openForceModal(step)}
                          >
                            {isForceStep ? (
                              <Spinner
                                as="div"
                                variant="light"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                animation="border"
                              />
                            ) : (
                              t("buttons.Force start")
                            )}
                          </button>
                        </li>
                      )}
                      {/* Copy always shown */}
                      {((step?.order_no === 1 && step?.step_status === null) ||
                        step?.step_status === "todo") && (
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={handleShow}
                          >
                            {t("buttons.Modify")}
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCopyStep(step)}
                        >
                          {isDuplicateStep ? (
                            <Spinner
                              as="div"
                              variant="light"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              animation="border"
                            />
                          ) : (
                            t("buttons.Copy")
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3" style={{ marginTop: "4rem" }}>
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
              Guide
            </h4>
            <div className="host">
              {meeting?.type === "Newsletter" ? (
                <div className="row">
                  <div className="col-md-3">
                    <Card
                      className={`participant-card participant-card-meeting`}
                      style={{
                        marginTop: "4rem",
                      }}
                    >
                      <Card.Body
                        style={{
                          padding: "20px 0px 20px 0",
                        }}
                      >
                        <div className="d-flex justify-content-center">
                          <div className="participant-card-position">
                            <div className="profile-logo">
                              <Card.Img
                                className="user-img"
                                src={
                                  meeting?.newsletter_guide?.logo?.startsWith(
                                    "http",
                                  )
                                    ? meeting?.newsletter_guide?.logo
                                    : `${Assets_URL}/${meeting?.newsletter_guide?.logo}`
                                }
                                alt="User Avatar"
                              />
                              <Card.Img
                                className="logout-icon"
                                src="/Assets/Avatar_company.svg"
                                height="20px"
                                width="20px"
                                alt="Company Logo"
                              />
                            </div>
                          </div>
                        </div>

                        <Card.Title className="text-center mt-4 card-heading">
                          {meeting?.newsletter_guide?.name}
                        </Card.Title>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              ) : (
                <StepParticipant
                  data={step?.participant}
                  //   guides={meeting?.guides}
                  //   disabled={isDisabled}
                  handleShow={handleHostShow}
                  handleHide={hideHostShow}
                  showProfile={showHostProfile}
                  meeting={meeting}
                  doneMoment={true}
                />
              )}
            </div>
          </div>

          <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
            <h4 className="participant-heading-meeting d-flex align-items-center justify-content-between">
              {t("Content")}
            </h4>
            {step?.editor_type === "Editeur" ||
            step?.editor_type === "Subtask" ||
            step?.editor_type === "Prestation" ||
            step?.editor_type === "Story" ||
            step?.editor_type === "Email" ||
            step?.editor_type === "Message" ||
            meeting?.type === "Absence" ? (
              <>
                <Editor
                  className="editor-no-border text_editor"
                  id="text_editor"
                  apiKey={TINYMCEAPI}
                  value={modifiedFileText}
                  name="text"
                  disabled={meeting?.type === "Absence"}
                  init={{
                    statusbar: false,
                    branding: false,
                    height: 600,
                    border: "none",
                    menubar: true,
                    language: "fr_FR",

                    plugins:
                      meeting?.type === "Law"
                        ? "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern"
                        : "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                    toolbar:
                      meeting?.type === "Law"
                        ? "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat"
                        : "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                    image_advtab: meeting?.type !== "Law",
                    file_picker_types:
                      meeting?.type === "Law" ? "" : "image media",
                    file_picker_callback: function (callback, value, meta) {
                      if (
                        meta.filetype === "image" &&
                        meeting?.type !== "Law"
                      ) {
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
                              const canvas = document.createElement("canvas");
                              const ctx = canvas.getContext("2d");
                              const maxWidth = 700;
                              const maxHeight = 394;

                              let newWidth = img.width;
                              let newHeight = img.height;

                              if (img.width > maxWidth) {
                                newWidth = maxWidth;
                                newHeight = (img.height * maxWidth) / img.width;
                              }

                              if (newHeight > maxHeight) {
                                newHeight = maxHeight;
                                newWidth = (img.width * maxHeight) / img.height;
                              }

                              canvas.width = newWidth;
                              canvas.height = newHeight;

                              ctx.drawImage(img, 0, 0, newWidth, newHeight);

                              const resizedImageData = canvas.toDataURL(
                                file.type,
                              );
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
                    setup: (editor) => {
                      // Disable pasting images and media
                      editor.on("paste", (event) => {
                        if (meeting?.type === "Law") {
                          const clipboard =
                            event.clipboardData || window.clipboardData;
                          const items = clipboard.items || [];
                          for (const item of items) {
                            if (
                              item.type?.startsWith("image") ||
                              item.type?.startsWith("video")
                            ) {
                              event.preventDefault();
                              console.warn(
                                "Pasting images and videos is not allowed for 'Law' type content.",
                              );
                              return;
                            }
                          }
                        }
                      });
                    },
                  }}
                  // onEditorChange={(content) => {
                  //   setModifiedFileText(content);
                  // }}
                  onEditorChange={(content) => {
                    setModifiedFileText(content);
                    debouncedAutoSave(content);
                  }}
                />
                <Button
                  className="mt-2"
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
                  onClick={() => handleSaveEditorContent(modifiedFileText)}
                >
                  {editContentSave ? (
                    <Spinner
                      as="div"
                      variant="light"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      animation="border"
                      style={{
                        margin: "2px 12px",
                      }}
                    />
                  ) : (
                    t("meeting.formState.Update")
                  )}
                </Button>
              </>
            ) : step?.editor_type === "File" ||
              step?.editor_type === "Video" ||
              step?.editor_type === "Photo" ||
              step?.editor_type === "Audio Report" ||
              step?.editor_type === "Video Report" ? (
              <div>
                <iframe
                  src={Assets_URL + "/" + (step?.file + "#toolbar=0&view=fitH")}
                  width="100%"
                  height="500px"
                />
              </div>
            ) : step?.editor_type === "Url" ? (
              <>
                <iframe
                  src={getYoutubeEmbedUrl(step?.url)}
                  width="100%"
                  height="500px"
                />
              </>
            ) : step?.editor_type === "Excel" ? (
              <DocViewer
                documents={[{ uri: `${Assets_URL}/${step?.file}` || "" }]}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableFileName: true,
                    retainURLParams: true,
                  },
                }}
              />
            ) : null}
          </div>

          {/* Media Section */}
          <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
            {/* Header */}
            <div
              className="d-flex justify-content-between align-items-center mb-4"
              style={{ border: "1px solid #ececec", borderRadius: "90px" }}
            >
              <h4 className="participant-heading-meeting border-0 mb-0">
                {t("Media")}
                {!mediaLoading && stepMedias.length > 0 && (
                  <span className="ms-2 text-muted fs-6">
                    ({stepMedias.length})
                  </span>
                )}
              </h4>

              {/* Upload Button */}
              <input
                type="file"
                ref={(ref) => (window.mediaInput = ref)}
                style={{ display: "none" }}
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleMediaUpload(e.target.files);
                    e.target.value = "";
                  }
                }}
              />

              <Button
                variant={isUploadingMedia ? "secondary" : "primary"}
                onClick={() => window.mediaInput?.click()}
                disabled={isUploadingMedia || mediaLoading}
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
                  borderRadius: "7px",
                  marginRight: "2rem",
                }}
                size="sm"
              >
                <BiCloudUpload className="me-2" size={20} />
                {isUploadingMedia ? t("Uploading...") : t("Upload Media")}
              </Button>
            </div>

            {/* Upload Progress */}
            {isUploadingMedia && (
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">
                    {t("Uploading your files...")}
                  </small>
                  <small className="text-primary fw-bold">
                    {uploadProgress}%
                  </small>
                </div>
                <ProgressBar
                  animated
                  now={uploadProgress}
                  variant="success"
                  style={{ height: "8px" }}
                />
              </div>
            )}

            {/* Loading State */}
            {mediaLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">{t("Loading media...")}</p>
              </div>
            )}

            {/* Success: Has Media */}
            {!mediaLoading && stepMedias.length > 0 && (
              <MediaGallery
                stepMedias={stepMedias}
                onDeleteMedia={handleDeleteMedia}
                deletingId={deletingId}
              />
            )}

            {/* Empty State */}
            {!mediaLoading && stepMedias.length === 0 && (
              <div className="text-center py-5 border rounded bg-light">
                <BiCloudUpload
                  size={56}
                  className="mb-3 text-secondary opacity-50"
                />
                <p className="mb-1 text-muted">{t("No media uploaded yet.")}</p>
                <small className="text-muted">
                  {t("Click 'Upload Media' to add photos or videos")}
                </small>
              </div>
            )}
          </div>
        </div>
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
            {editingField === "description" ? null : (
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
      {/* //Re estimaite  Modal  */}
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
            {/* <p>
                    {t("Remaining Time:")} <strong>{stepEndTime}</strong>
                  </p> */}
            <Form.Group>
              <Form.Label>{t("Enter Time Duration")}</Form.Label>
              <div className="d-flex gap-4 align-items-center">
                <Form.Control
                  type="number"
                  min="1"
                  value={additionalTime}
                  onChange={(e) => setAdditionalTime(e.target.value)}
                  // placeholder="Enter minutes"
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
                    {t(`time_unit.${step?.time_unit}`)}{" "}
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
                outine: 0,
                padding: "10px 16px",
                borderRadius: "9px",
              }}
              onClick={()=>{
                updateStep(step)
              }}
            >
              {t("Validate")}
            </button>
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
            <Modal.Title>{t("Confirm Deletion")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t(
              "Are you sure you want to delete this step? This action cannot be undone.",
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmCancel(false)}
            >
              {t("No")}
            </Button>
            <Button variant="danger" onClick={deleteStep}>
              {t("Yes, Delete")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Create a whole new Step */}
      {show && (
        <div className="tabs-container container-fluid">
          <div className="new-meeting-modal">
            <StepChartUpcoming
              meetingId={meeting?.id}
              id={id}
              setId={setStepId}
              show={show}
              closeModal={closeModal}
              meeting={meeting}
              isDrop={isDrop}
              setIsDrop={setIsDrop}
              closeStep={getStep}
            />
          </div>
        </div>
      )}
      {/* Copy a whole new Step */}
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
            closeStep={getStep}
            isCopied={true}
          />
        </div>
      )}

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
                "The following actions are supposed to be done before this one in order of priority:",
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

      {showResume && (
        <div className="new-meeting-modal tabs-container">
          <StepChartAction
            meetingId={meeting?.id}
            id={id}
            show={showResume}
            // setId={setStepId}
            closeModal={handleCloseResume}
            meeting={meeting}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            // stepIndex={currentStepIndex}
            closeStep={todoStep}
            fromTodo={true}

            // refreshMeeting={getRefreshMeeting}
          />
        </div>
      )}
      {step?.step_status === "to_accept" && (
        <ActionAssignmentPopup step={step} onRefresh={getStep} />
      )}
    </>
  );
}

export default UpcomingStepScreen;
