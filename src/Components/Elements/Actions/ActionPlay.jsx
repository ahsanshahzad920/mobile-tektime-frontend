import CookieService from '../../Utils/CookieService';
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Modal,
  ProgressBar,
  Spinner,
  Table,
} from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaLocationDot, FaRegFileAudio } from "react-icons/fa6";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

// 1. Reject
// 2. Copy
// 3. re estimate
import {
  MdInfo,
  MdOutlinePhotoSizeSelectActual,
  MdOutlineSummarize,
} from "react-icons/md";
import { Avatar, Tooltip } from "antd";
import {
  IoArrowBackSharp,
  IoCopyOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import {
  convertTimeTakenToSeconds,
  convertTo24HourFormat,
  formatStepDate,
  markTodo,
} from "../../Utils/MeetingFunctions";
import { RiEditBoxLine, RiFileExcel2Line } from "react-icons/ri";
import {
  convertCount2ToSeconds,
  convertDateToUserTimezone,
  formatDate,
  formatTime,
  parseAndFormatDateTime,
  timezoneSymbols,
} from "../Meeting/GetMeeting/Helpers/functionHelper";
// import HostCard from "../Meeting/CurrentMeeting/components/HostCard";
import { Assets_URL, API_BASE_URL } from "../../Apicongfig";
import { FiEdit, FiMoreVertical } from "react-icons/fi";
import { PiFilePdfLight } from "react-icons/pi";
import moment from "moment";
import StepCounterContainer from "../Meeting/PlayMeeting/components/StepCounterContainer";
import StepChartAction from "./StepChartAction";
import { optimizeEditorContent } from "../Meeting/Chart";
import HostCard from "./HostCard";
import { useStepCounterContext } from "../Meeting/context/StepCounterContext";
import { Editor } from "@tinymce/tinymce-react";
import StepChart from "../Meeting/CreateNewMeeting/StepChart";
import { BiCloudUpload } from "react-icons/bi";
import MediaGallery from "../Meeting/CompletedMeeting/MediaGallery";

const ActionPlay = () => {
  const {
    meetingData,
    savedTime,
    negativeTimes,
    activeStepIndex,
    setNextActiveStep,
    stepDelay,
    loading,
    getRefreshMeetingByID,
    setIsReestimateModalOpen,
  } = useStepCounterContext();
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const [modifiedFileText, setModifiedFileText] = useState(null);
  const location = useLocation();
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;
  const [show, setShow] = useState(false);
  const [isDrop, setIsDrop] = useState(false);
  const [stepId, setStepId] = useState(null);
  const [meeting, setMeeting] = useState(null);
  const [step, setStep] = useState(null);

  const sessionUserEmail = JSON.parse(CookieService.get("user"));

  const handleShow = () => {
    setShow(true);
  };

  const closeModal = () => setShow(false);

  const [showResume, setShowResume] = useState(false);
  const handleCloseResume = () => setShowResume(false);
  const handleShowResume = () => {
    setShowResume(true);
  };

  const currentTime = new Date();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options = { timeZone: userTimeZone };
  const timeInUserZone = new Date(currentTime.toLocaleString("en-US", options));

  const formattedTime = formatTime(timeInUserZone);
  const formattedDate = formatDate(timeInUserZone);
  let fromMeeting = false;
  if (location?.state?.from === "meeting") {
    fromMeeting = true;
  }
  let isDisabled = false;
  if (location?.state?.disabled === "yes") {
    isDisabled = true;
  }

  const { id, step_Id } = useParams();
  const currentStep = meetingData?.steps?.find(
    (s) => Number(s?.id) === Number(step_Id),
  );

  const isStepInProgress = currentStep?.step_status === "in_progress";

  const params = useParams();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(null);

  const [estimateTime, setEstimateTime] = useState(null);
  const [estimateDate, setEstimateDate] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [autoNoteSaving, setAutoNoteSaving] = useState(false);
  const handleAutoNoteSave = async (meeting) => {
    setAutoNoteSaving(true);

    try {
      // Extract the content from the editable div
      const autoNoteContent = document.getElementById(
        "auto-note-editable-content",
      )?.innerHTML;
      const currentStep = meetingData?.steps[currentStepIndex];
      const stepId = meetingData?.steps[currentStepIndex]?.id;

      if (!stepId) {
        console.error("Step ID is missing!");
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

      const postData = {
        ...currentStep,
        note: autoNoteContent, // Save the extracted note
        meeting_id: meetingData?.id,
        step_status: "in_progress",
        pause_current_time: formattedTime,
        pause_current_date: formattedDate,
      };

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

      if (response.status === 200) {
        // console.log(t("Notes saved successfully"));
        toast.success(t("Notes saved successfully"));
        await getMeeting(); // Refresh the meeting data
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setAutoNoteSaving(false);
    }
  };

  const [viewNote, setViewNote] = useState("note");

  let formattedStartDate = null;

  if (meetingData) {
    formattedStartDate = convertDateToUserTimezone(
      meetingData?.steps?.[currentStepIndex]?.start_date,
      meetingData?.steps?.[currentStepIndex]?.step_time,
      meetingData?.timezone,
    );
  }

  const [editContentSave, setEditorContentSave] = useState(false);
  const handleSaveEditorContent = async (step) => {
    setEditorContentSave(true);
    const optimizedEditorContent =
      await optimizeEditorContent(modifiedFileText);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/steps/${step_Id}`,
        {
          ...step,
          editor_content: optimizedEditorContent,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status === 200) {
        await getRefreshMeetingByID(id, step_Id);
        toast.success(t("Content saved successfully"));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setEditorContentSave(false);
    }
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
            ...meetingData?.steps[currentStepIndex],
            editor_content: optimizedEditorContent,
          };
          const response = await axios.patch(
            `${API_BASE_URL}/steps/${step_Id}`,
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

          // setIsValidate(false);
          // toast.error(
          //   t(`meeting.newMeeting.${error?.response?.data?.errors?.title[0]}`)
          // );
        }
      }, 4000), // 2-second delay
    [meetingData?.steps[currentStepIndex], step_Id],
  );

  //Host
  const [showHostProfile, setShowHostProfile] = useState(false);
  const handleHostShow = () => {
    setShowHostProfile(true);
  };
  const hideHostShow = () => {
    setShowHostProfile(false);
  };

  const handleViewToggle = async (view) => {
    setViewNote(view);
  };

  const [meta, setMeta] = useState(null);

  const [stepEndTime, setStepEndTime] = useState(null);
  const [stepEndDate, setStepEndDate] = useState(null);
  const [stepStartTime, setStepStartTime] = useState(null);
  const [stepStartDate, setStepStartDate] = useState(null);
  const [isAutomatic, setIsAutomatic] = useState(false);

  // Fetch meeting data
  const getMeeting = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    try {
      // setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/meetings/${id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&do_continue_change_cal=true`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        const meetingData = response.data?.data;
        // setMeeting(meetingData);
        // setMeetingData(meetingData);

        const inProgressIndex = meetingData?.steps?.findIndex(
          (step) => Number(step?.id) === Number(step_Id),
        );

        setCurrentStepIndex(inProgressIndex);
        setStepStartTime(meetingData?.steps[inProgressIndex]?.step_time);
        setStepStartDate(meetingData?.steps[inProgressIndex]?.start_date);

        if (meetingData?.prise_de_notes === "Automatic") {
          setIsAutomatic(true);
        } else {
          setIsAutomatic(false);
        }

        // Calculate step end time
        // 1.
        const estimate_time =
          meetingData?.steps[inProgressIndex]?.estimate_time; // first step get estimate time from response
        if (estimate_time) {
          // 2
          let remainingTime = moment.utc(estimate_time); //utc conversion

          // for (let i = inProgressIndex + 1; i < meetingData.steps.length; i++) {
          //   const step = meetingData.steps[i];
          //   console.log("step->", step);

          //   if (step?.count2 && step?.time_unit) {
          //     remainingTime = subtractTime(
          //       remainingTime,
          //       step.count2,
          //       step.time_unit
          //     );
          //   }
          // }

          const stepEndDateTime = remainingTime.format(
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
          );

          const { formattedDate: stepEndDate, formattedTime: stepEndTime } =
            parseAndFormatDateTime(
              stepEndDateTime,
              meetingData?.type,
              meetingData?.timezone,
            );

          setStepEndDate(stepEndDate);
          setStepEndTime(stepEndTime);

          const { formattedDate: estimateDate, formattedTime: estimateTime } =
            parseAndFormatDateTime(
              estimate_time,
              meetingData?.type,
              meetingData?.timezone,
            );
          setEstimateTime(estimateTime);
          setEstimateDate(estimateDate);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!meetingData) return;

    const inProgressIndex = meetingData?.steps?.findIndex(
      (step) => Number(step?.id) === Number(step_Id),
    );

    if (meetingData?.steps[inProgressIndex]?.step_status !== "in_progress") {
      navigate(`/step/${step_Id}`, { replace: true });
      return;
    }

    setCurrentStepIndex(inProgressIndex);
    setStepStartTime(meetingData?.steps[inProgressIndex]?.step_time);
    setStepStartDate(meetingData?.steps[inProgressIndex]?.start_date);

    if (meetingData?.prise_de_notes === "Automatic") {
      setIsAutomatic(true);
    } else {
      setIsAutomatic(false);
    }

    const estimate_time = meetingData?.steps[inProgressIndex]?.estimate_time;
    if (estimate_time) {
      let remainingTime = moment.utc(estimate_time);

      const stepEndDateTime = remainingTime.format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
      );

      const { formattedDate: stepEndDate, formattedTime: stepEndTime } =
        parseAndFormatDateTime(
          stepEndDateTime,
          meetingData?.type,
          meetingData?.timezone,
        );

      setStepEndDate(stepEndDate);
      setStepEndTime(stepEndTime);

      const { formattedDate: estimateDate, formattedTime: estimateTime } =
        parseAndFormatDateTime(
          estimate_time,
          meetingData?.type,
          meetingData?.timezone,
        );
      setEstimateTime(estimateTime);
      setEstimateDate(estimateDate);
    }
  }, [meetingData, step_Id]);
  useEffect(() => {
    if (meetingData) {
      const content =
        meetingData?.steps[currentStepIndex]?.editor_content || "";
      setModifiedFileText(content);
    }
  }, [meetingData, currentStepIndex]);

  // Fetch step details
  const getStep = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/steps/${step_Id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status === 200) {
        if (response.data.data.step_status !== "in_progress") {
          navigate(`/step/${step_Id}`, { replace: true });
          return;
        }
        setStep(response.data.data);
        setMeta(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (meeting) {
      getStep();
    }
  }, [step_Id]);

  useEffect(() => {
    if (
      !stepDelay ||
      currentStepIndex === undefined ||
      !meetingData?.steps?.length
    ) {
      return;
    }
    let remainingTime = moment.utc(stepDelay?.step_estimate_time);
    // Subtract next steps time
    // for (let i = currentStepIndex + 1; i < meetingData.steps.length; i++) {
    //   const step = meetingData.steps[i];
    //   if (step?.count2 && step?.time_unit) {
    //     remainingTime = subtractTime(
    //       remainingTime,
    //       step.count2,
    //       step.time_unit
    //     );
    //   }
    // }

    // Calculate step end time in user's timezone
    const stepEndDateTime = remainingTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const { formattedDate: stepEndDate, formattedTime: stepEndTime } =
      parseAndFormatDateTime(
        stepEndDateTime,
        meetingData?.type,
        meetingData?.timezone,
      );
    setStepEndDate(stepEndDate);
    setStepEndTime(stepEndTime);
  }, [stepDelay, meetingData, currentStepIndex]);

  // Function to subtract time based on time unit
  const subtractTime = (momentObj, value, unit) => {
    switch (unit) {
      case "days":
        return momentObj.subtract(value, "days");
      case "hours":
        return momentObj.subtract(value, "hours");
      case "minutes":
        return momentObj.subtract(value, "minutes");
      case "seconds":
        return momentObj.subtract(value, "seconds");
      default:
        return momentObj;
    }
  };

  const isLastStep =
    meetingData?.steps?.length > 0 &&
    currentStepIndex === meetingData?.steps?.length - 1 &&
    !meetingData?.steps.some((step) => step.step_status === "in_progress");

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
        navigate(`/step/${stepId}`, { state: { meeting: meeting } });
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || "server error");
    }
  };
  // -----------------------------------RE Estimate Time
  const [showReestimateModal, setShowReestimateModal] = useState(false);
  const [additionalTime, setAdditionalTime] = useState("");
  const [isReestimating, setIsReestimating] = useState(false);
  const handleOpenReestimate = () => {
    setShowReestimateModal(true);
    setIsReestimateModalOpen(true);
    setAdditionalTime(""); // Reset input
  };

  const updateStep = async (step) => {
    if (!step || !step.id) return;

    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep?.id;

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
      setIsReestimating(true);
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
          step_status: "in_progress",
          status: "in_progress",
          savedTime:
            currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,

          count2: Number(additionalTime),
          time: Number(additionalTime),
          // count2: step.count2 + Number(additionalTime),
          // time: step.count2 + Number(additionalTime),
          delay: null,
          negative_time: "0",
          pause_current_time: formattedTime,
          pause_current_date: formattedDate,
          step_reestimated_time:true
        };

        response = await axios.post(
          `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
          normalPayload,
          { headers },
        );
      }

      if (response.status === 200) {
        window.location.reload(); // Reloads the current page
        // navigate(-1);
      }
    } catch (error) {
      console.error("Error updating step:", error);
    } finally {
      setIsReestimating(false);
    }
  };

  // -------------------------------------------Cancel Step

  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showCancelNotes, setShowCancelNotes] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");
  const [stepToCancel, setStepToCancel] = useState(null);

  const [cancel, setCancel] = useState(false);
  // Function to handle cancel button click
  const handleCancelClick = (step) => {
    setStepToCancel(step);
    setShowConfirmCancel(true);
  };

  // Function to confirm cancellation
  const confirmCancelStep = () => {
    setShowConfirmCancel(false);
    setShowCancelNotes(true); // Show notes modal
  };

  // Function to finalize cancellation with notes
  const finalizeCancelStep = async () => {
    if (!stepToCancel) return;
    setCancel(true);

    const currentStep = meetingData?.steps[currentStepIndex];
    const nextStep = meetingData?.steps[currentStepIndex + 1];
    const stepId = currentStep?.id;
    const myNextStepId = nextStep?.id;

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
    const updatedStep = {
      ...currentStep,
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime != 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      step_status: "cancelled",
      status: "cancelled",
      meeting_id: id,
      end_date: formattedEndDate,
      end_time: localEndTime,
      next_step_id: myNextStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      note: cancelNotes,
      pause_current_time: formattedTime,
      pause_current_date: formattedDate,
    };
    delete updateStep.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/step-note-and-action?current_time=${formattedTime}&current_date=${formattedDate}&pause_current_time=${formattedTime}&pause_current_date=${formattedDate}`,
        updatedStep,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status === 200) {
        setShowCancelNotes(false);
        setCancelNotes(""); // Reset notes
        navigate(-1); // Navigate back to previous page
      }
    } catch (error) {
      console.error("Error updating step:", error);
    }
    try {
      const nextStepId = nextStep.id;

      const stepResponse = await axios.get(
        `${API_BASE_URL}/steps/${nextStepId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
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
          status: "in_progress",
          // new_current_time: localEndTime,
          // new_current_date: formattedCurrentDate,
          current_time: localEndTime,
          current_date: formattedCurrentDate,
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
          console.log("Step updated successfully:", response.data);
          setCancel(true);

          // navigate(-1); // Navigate back to previous page
        }
      }
    } catch (error) {
      console.error("Error updating step:", error);
    } finally {
      setCancel(true);
    }
  };

  // --------------------------------CLOSE STEP
  const saveDataonEnd = async (val) => {
    const currentStep = meetingData?.steps[currentStepIndex];

    const nextStep = meetingData?.steps[currentStepIndex + 1];

    const stepId = currentStep?.id;
    const myNextStepId = nextStep?.id;
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

    // Format end_date to dd/mm/yyyy
    const formatDate = (date) => {
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    };
    const formattedEndDate = formatDate(endTime);
    const postData = {
      ...currentStep,
      savedTime: savedTime != 0 ? savedTime : 0,

      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,

      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      status: "active",
      step_status: "completed",
      note: stepNotes,
      meeting_id: id,
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
  const [next, setNext] = useState(false);
  const [previous, setPrevious] = useState(false);

  const [isClose, setIsClose] = useState(false);

  const closeMeeting = async () => {
    const responseNotes = await saveDataonEnd();
    const steps = [...meetingData?.steps];
    steps[steps?.length - 1] = responseNotes;
    // const updatedStepData = [...stepData]; // Copy the stepData array
    // updatedStepData[updatedStepData.length - 1].note = responseNotes; // Update the note for the last step
    // updatedStepData[updatedStepData.length - 1] = responseNotes;
    setIsClose(true);
    CookieService.set("lastURL", "/play");
    // Parse the start time string
    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);

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

    const updatedDatWithClosingTime = {
      ...meetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      steps: steps?.map(({ assigned_to, ...step }) => ({
        //dont send the assigned_to, you will get an error
        ...step,
        status: "completed",
        step_status: "completed",
      })),

      end_time: endTimeStr,
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [], // Send as-is if IDs are already present
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        updatedDatWithClosingTime,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
    } catch (error) {
      // console.log("error", error);
    }
    // -------------------------------------------------- NOW UPDATE STATUS OF MEETING ----------------------------------------------
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      // console.log("meeting status api", response);
      if (response.status) {
        // console.log("meeting status changed successfully", response.data);
        const data = response?.data?.data;
        setIsClose(false);
        navigate(`/action`);
      }
    } catch (error) {
      console.log("error ", error);
      setIsClose(false);
    }
  };

  const close = async () => {
    setIsClose(true);
    // setShowProgressBar(true); // Show progress bar
    // setProgress(0); // Reset progress
    const currentStep = meetingData?.steps[currentStepIndex];
    const stepId = currentStep.id;

    const responseNotes = await saveDataonEnd();
    const steps = [...meetingData?.steps];
    steps[steps?.length - 1] = responseNotes;
    setIsClose(true);
    // const updatedStepData = [...stepData];
    // // updatedStepData[updatedStepData.length - 1].note =
    // //   responseNotes?.data?.data?.note;
    // updatedStepData[updatedStepData.length - 1] = responseNotes;

    CookieService.set("lastURL", "/play");

    // Parse the start time string
    const [hour, minute] = meetingData?.start_time?.split(":").map(Number);

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

    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const updatedDatWithClosingTime = {
      ...meetingData,
      real_end_time: moment().format("HH:mm:ss"),
      _method: "put",
      status: "closed",
      timezone: userTimeZone,
      steps: steps?.map(({ assigned_to, ...step }) => ({
        //dont send the assigned_to, you will get an error
        ...step,
        status: "completed",
        step_status: "completed",
      })),

      end_time: endTimeStr,
      // status: "closed",
      moment_privacy_teams:
        meetingData?.moment_privacy === "team" &&
        meetingData?.moment_privacy_teams?.length &&
        typeof meetingData?.moment_privacy_teams[0] === "object"
          ? meetingData?.moment_privacy_teams.map((team) => team.id)
          : meetingData?.moment_privacy_teams || [], // Send as-is if IDs are already present
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}`,
        updatedDatWithClosingTime,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const steps = response?.data?.data?.steps;
      }
    } catch (error) {
      console.log("error", error);
    }
    setIsClose(true);
    const realEndTime = moment().format("HH:mm:ss");
    // const updatedSteps = [...stepData];

    try {
      const postData = {
        real_end_time: realEndTime,
        status: "closed",
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        setIsClose(false);
      }
    } catch (error) {
      console.log("error ", error);
      setIsClose(false);
      // setShowProgressBar(false); // Hide progress bar on error
    }
  };

  const [showConfirmLastStepModal, setShowConfirmLastStepModal] =
    useState(false);
  const [stepNotes, setStepNotes] = useState(
    meetingData?.steps[currentStepIndex]?.note || "",
  );

  const handlenextPage = async (val) => {
    setNext(true);
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
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime !== 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      step_status: "in_progress",
      status: "in_progress",
      url: meetingData?.steps[currentStepIndex].url || null,
      meeting_id: id,
      // note: stepNotes[currentStepIndex],
      note: stepNotes,
      end_time: localEndTime,
      end_date: formattedEndDate,
      next_step_id: myNextStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
    };

    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/save-current-step-data/${stepId}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        setCurrentStepIndex((prevIndex) => prevIndex + 1);
        setNextActiveStep();

        setNext(false);
        if (
          nextStep?.step_status === null ||
          nextStep?.step_status === "completed" ||
          nextStep?.step_status === "cancelled" ||
          nextStep?.step_status === "to_finish" ||
          nextStep?.step_status === "todo"
        ) {
          navigate(`/step/${nextStep.id}`, { state: { meeting: meeting } });
        } else {
          navigate(`/actīon-play/${id}/${nextStep.id}`);
        }
        // setStepId(nextStep.id); // Ensure state is updated
      }
    } catch (error) {
      console.log("Error saving current step:", error);
      setNext(false);
    }
  };

  const handlePreviousPage = async () => {
    if (currentStepIndex <= 0) return; // Prevent going back from the first step

    setPrevious(true);
    const currentStep = meetingData?.steps[currentStepIndex];
    const prevStep = meetingData?.steps[currentStepIndex - 1];
    const stepId = currentStep?.id;
    const prevStepId = prevStep?.id;

    const optimizedEditorContent = await optimizeEditorContent(
      currentStep?.editor_content,
    );

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const endTime = new Date();
    const localEndTime = endTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedEndDate = endTime.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: userTimeZone,
    });

    const postData = {
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime !== 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      step_status: "in_progress",
      status: "in_progress",
      url: meetingData?.steps[currentStepIndex].url || null,
      meeting_id: id,
      note: stepNotes,
      end_time: localEndTime,
      end_date: formattedEndDate,
      next_step_id: prevStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
    };

    delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/save-current-step-data/${stepId}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status) {
        setPrevious(false);
        setCurrentStepIndex((prevIndex) => prevIndex - 1);
        if (
          prevStep?.step_status === null ||
          prevStep?.step_status === "completed" ||
          prevStep?.step_status === "cancelled" ||
          prevStep?.step_status === "todo" ||
          prevStep?.step_status === "to_finish"
        ) {
          navigate(`/step/${prevStep?.id}`, { state: { meeting: meeting } });
        } else {
          navigate(`/actīon-play/${id}/${prevStep?.id}`);
        }
      }
    } catch (error) {
      console.log("Error saving current step:", error);
      setPrevious(false);
    }
  };

  //call another api to close the moment when there is the last step of meeting
  const closeCurrentStep = async (val) => {
    setIsClose(true);
    const autoNoteContent = document.getElementById(
      "auto-note-editable-content",
    )?.innerHTML;
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
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        currentStep?.savedTime === 0 ? 0 : savedTime !== 0 ? savedTime : 0,
      negative_time:
        savedTime === 0
          ? negativeTimes[activeStepIndex] !== 0
            ? negativeTimes[activeStepIndex]
            : 0
          : 0,
      step_status: "completed",
      status: "completed",
      url: meetingData?.steps[currentStepIndex].url || null,
      meeting_id: id,
      note: stepNotes, // Save the extracted note
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
        setIsClose(false);
        if (
          meetingData?.type === "Task" ||
          meetingData?.type === "Strategy" ||
          meetingData?.type === "Prestation Client"
        ) {
          markTodo(stepId);
        }
        navigate("/action");
      }
    } catch (error) {
      console.log("Error saving current step:", error);
    }
  };

  const closeStep = async (val) => {
    // setIsNext(true);
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
      status: "completed",
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      meeting_id: id,
      end_time: localEndTime,
      end_date: formattedEndDate,
      next_step_id: myNextStepId,
      delay: currentStep?.negative_time === "99" ? stepDelay?.delay : null,
      real_time: localEndTime,
      real_date: formattedEndDate,
      re_assign_step: true,
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
        // await getMeeting();
        navigate("/action");
      }
    } catch (error) {
      // toast.error(error.response?.data?.message);
    }
  };

  //Reparde Button
  const todoStep = async (val) => {
    // setIsNext(true);
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
      ...currentStep,
      editor_content: optimizedEditorContent || "",
      savedTime:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : currentStep?.savedTime === 0
            ? 0
            : savedTime != 0
              ? savedTime
              : 0,
      negative_time:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? 0
          : savedTime === 0
            ? negativeTimes[activeStepIndex] !== 0
              ? negativeTimes[activeStepIndex]
              : 0
            : 0,
      step_status:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? "todo"
          : "completed",
      status:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? "todo"
          : "completed",
      url: meetingData?.steps[currentStepIndex].url
        ? meetingData?.steps[currentStepIndex].url
        : null,
      current_time:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : meetingData?.steps[currentStepIndex]?.current_time,
      current_date:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : meetingData?.steps[currentStepIndex]?.current_date,
      meeting_id: id,
      end_time:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : localEndTime,
      end_date:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : formattedEndDate,
      next_step_id: myNextStepId,
      delay:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : currentStep?.negative_time === "99"
            ? stepDelay?.delay
            : null,
      real_time:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : localEndTime,
      real_date:
        meetingData?.type === "Task" ||
        meetingData?.type === "Strategy" ||
        meetingData?.type === "Prestation Client"
          ? null
          : formattedEndDate,
      re_assign_step: true,
      time_taken: null,
    };
    // delete postData.time_taken;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/play-meetings/steps/${stepId}/?current_time=${formattedTime}&current_date=${formattedDate}`,
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
          meetingData?.type === "Task" ||
          meetingData?.type === "Strategy" ||
          meetingData?.type === "Prestation Client"
        ) {
          markTodo(id);
        }
        // await getMeeting();
        navigate("/action");
      }
    } catch (error) {
      // toast.error(error.response?.data?.message);
    }
  };

  const handleClick = (meeting) => {
    if (
      meetingData?.status === "abort" ||
      meetingData?.status === "closed" ||
      meetingData?.status === "cancelled"
    ) {
      // Navigate to /invite/:id if status is active or in_progress
      navigate(`/present/invite/${meetingData?.id}`, {
        state: { from: "meeting" },
      });
    } else {
      // Navigate to /present/invite/:id if status is not active or in_progress
      navigate(`/invite/${meetingData?.id}`, { state: { from: "meeting" } });
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

    return false;
  };

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
  const [showCopy, setShowCopy] = useState(false);

  const closeCopyModal = () => setShowCopy(false);

  const [isDuplicateStep, setIsDuplicateStep] = useState(false);
  const [duplicatedStep, setDuplicatedStep] = useState(null); // store copied step data

  const handleCopyStep = async (item) => {
    console.log("item", item);
    console.log("meeting", meeting);
    setIsDuplicateStep(true);
    // Get the current max order_no
    const maxOrderNo = Math.max(
      ...meetingData?.steps.map((step) => step.order_no ?? 0),
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
            Authorization: `Bearer ${CookieService.get("token")}`,
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
        ...meetingData?.steps[currentStepIndex], // keep all other fields
        [editingField]: editValue, // only update the edited field
        _method: "put",
      };

      const response = await axios.post(
        `${API_BASE_URL}/steps/${step_Id}`,
        updatedStep,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        setEditingField(null);
        await getRefreshMeetingByID(id, step_Id);

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
    formData.append("step_id", step_Id);

    try {
      await axios.post(`${API_BASE_URL}/add-media-to-step`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")}`,
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
        `${API_BASE_URL}/step-media/${step_Id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")}`,
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
      if (!step_Id) {
        setMediaLoading(false);
        return;
      }

      setMediaLoading(true); // ← Start loading

      try {
        const response = await axios.get(
          `${API_BASE_URL}/step-media/${step_Id}`,
          {
            headers: {
              Authorization: `Bearer ${
                CookieService.get("token") || CookieService.get("token")
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
  }, [step_Id]); // ← Better dependency: step.id only

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
      {loading || !meetingData || isLoading || !isStepInProgress ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="complete-invite w-100"
          style={{
            position: fromMeeting ? "static" : "relative",
            backgroundColor: fromMeeting ? "white" : "",
            padding: "10px 15px",
          }}
        >
          <div>
            <div className="row child-1">
              <div className={`col-md-7 ${fromMeeting ? "w-100" : ""}`}>
                {/* {fromMeeting ? ( */}
                <>
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
                        <Link
                          to={`/invitiesToMeeting/${meetingData?.destination_id}`}
                        >
                          {meetingData?.objective}
                        </Link>
                        <span> / </span>
                      </>
                    )}
                    <Link
                      to={`/invite/${meetingData?.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(meeting);
                      }}
                      // style={{ textDecoration: "none", color: "#8590a3" }}
                    >
                      {meetingData?.title}
                    </Link>
                  </div>

                  <div className="invite-header">
                    <span
                      className="content-heading-title"
                      style={{ marginTop: "0" }}
                    >
                      {meetingData?.steps[currentStepIndex]?.order_no &&
                        `${meetingData?.steps[currentStepIndex]?.order_no}. `}{" "}
                      {meetingData?.steps[currentStepIndex]?.title}
                      <span
                        className="ms-2 cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleEditTitle(meetingData?.steps[currentStepIndex])
                        }
                      >
                        <RiEditBoxLine size={20} />
                      </span>
                      {meetingData?.status === "in_progress" && (
                        // {/* <span className="mx-2 badge status-badge-inprogress-invite"> */}
                        // <span className="mx-2 badge status-badge-inprogress-invite">
                        <span
                          className={`${
                            (() => {
                              const currentStep =
                                meetingData?.steps?.[currentStepIndex];
                              return (
                                currentStep?.step_status === "in_progress" &&
                                convertTimeTakenToSeconds(
                                  currentStep?.time_taken,
                                ) >
                                  convertCount2ToSeconds(
                                    currentStep?.count2,
                                    currentStep?.time_unit,
                                  )
                              );
                            })()
                              ? "status-badge-red-invite"
                              : "status-badge-inprogress-invite"
                          } mx-2 badge`}
                        >
                          {t("badge.inprogress")}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 content-body present-invite-body mt-3 mt-lg-3">
                    {/* Previous Step Button */}
                    {currentStepIndex > 0 && (
                      <button
                        onClick={handlePreviousPage}
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
                        }}
                      >
                        {previous ? (
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
                          <>
                            {meetingData?.steps[currentStepIndex - 1]?.order_no}
                            . {meetingData?.steps[currentStepIndex - 1]?.title}
                          </>
                        )}
                      </button>
                    )}

                    {currentStepIndex !== meetingData?.steps?.length - 1 && (
                      <button
                        onClick={async () => {
                          await handlenextPage();
                        }}
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
                        }}
                      >
                        {next ? (
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
                          <>
                            {meetingData?.steps[currentStepIndex + 1]?.order_no}
                            . {meetingData?.steps[currentStepIndex + 1]?.title}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="items mt-0 mt-md-2 audio-items">
                    <div className="type">
                      {
                        meetingData?.steps[currentStepIndex]?.editor_type ===
                          "Editeur" ||
                        meetingData?.steps[currentStepIndex]?.editor_type ===
                          "Subtask" ||
                        meetingData?.steps[currentStepIndex]?.editor_type ===
                          "Prestation" ||
                        meetingData?.steps[currentStepIndex]?.editor_type ===
                          "Email" ||
                        meetingData?.steps[currentStepIndex]?.editor_type ===
                          "Story" ? (
                          <FiEdit
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "File" ? (
                          <PiFilePdfLight
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "Excel" ? (
                          <RiFileExcel2Line
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "Video" ||
                          meetingData?.steps[currentStepIndex]?.editor_type ===
                            "Video Report" ? (
                          <IoVideocamOutline
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "Photo" ? (
                          <MdOutlinePhotoSizeSelectActual
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "Url" ? (
                          <IoCopyOutline
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : meetingData?.steps[currentStepIndex]
                            ?.editor_type === "Audio" ? (
                          <FaRegFileAudio
                            className="completedonestep-iconwidth img-fluid"
                            style={{ padding: "5px" }}
                          />
                        ) : null
                        // <FiEdit className="file-img img-fluid" style={{ padding: "12px" }} />
                      }
                      <span className="time">
                        {meetingData?.steps[currentStepIndex]?.editor_type}
                      </span>
                    </div>
                  </div>
                </>
                <div className="d-flex align-items-center gap-2 content-body present-invite-body mt-3 mt-lg-3">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src="/Assets/invite-date.svg"
                      height="28px"
                      width="28px"
                    />

                    <>
                      {meetingData?.type === "Action1" ||
                      meetingData?.type === "Newsletter" ? (
                        <>
                          <span className="fw-bold formate-date">
                            {formattedStartDate} -
                          </span>

                          <span className="fw-bold formate-date">
                            {stepEndDate}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="fw-bold formate-date">
                            {/* {formattedStartDate} */}
                            {formatStepDate(
                              meetingData?.steps[currentStepIndex]?.start_date,
                              meetingData?.steps[currentStepIndex]?.step_time,
                              meetingData?.timezone,
                            )}
                            &nbsp; {t("at")} &nbsp;
                            {convertTo24HourFormat(
                              meetingData?.steps[currentStepIndex]?.step_time,
                              meetingData?.steps[currentStepIndex]?.start_date,
                              meetingData?.steps[currentStepIndex]?.time_unit,
                              meetingData?.timezone,
                            )}{" "}
                            -{" "}
                          </span>

                          <span className="fw-bold formate-date">
                            {stepEndDate}
                            &nbsp; {t("at")} &nbsp;
                            {stepEndTime || "N/A"}
                          </span>
                        </>
                      )}
                    </>

                    <span className="fw-bold">
                      {getTimezoneSymbol(CookieService.get("timezone"))}
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="row mt-3">
                  <div className="col-md-12 d-flex align-items-center gap-3">
                    {meetingData?.prise_de_notes === "Automatic" && (
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

                    {meetingData?.alarm === true && (
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

                    {meetingData?.share_by === "email" && (
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
                        {meetingData?.moment_privacy === "public" ? (
                          <Avatar
                            src="/Assets/Tek.png"
                            style={{ borderRadius: "0" }}
                          />
                        ) : meetingData?.moment_privacy === "team" ? (
                          <Avatar.Group>
                            {meetingData?.moment_privacy_teams_data?.map(
                              (item) => {
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
                              },
                            )}
                          </Avatar.Group>
                        ) : meetingData?.moment_privacy === "enterprise" ? (
                          <Tooltip
                            title={meetingData?.user?.enterprise?.name}
                            placement="top"
                          >
                            <img
                              src={
                                meetingData?.user?.enterprise?.logo?.startsWith(
                                  "enterprises/",
                                )
                                  ? Assets_URL +
                                    "/" +
                                    meetingData?.user?.enterprise?.logo
                                  : meetingData?.user?.enterprise?.logo?.startsWith(
                                        "storage/enterprises/",
                                      )
                                    ? Assets_URL +
                                      "/" +
                                      meetingData?.user?.enterprise?.logo
                                    : meetingData?.user?.enterprise?.logo
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
                        ) : meetingData?.moment_privacy === "password" ? (
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
                            title={meetingData?.user?.full_name}
                            placement="top"
                          >
                            <Avatar
                              src={
                                meetingData?.user?.image.startsWith("users/")
                                  ? Assets_URL + "/" + meetingData?.user?.image
                                  : meetingData?.user?.image
                              }
                            />
                          </Tooltip>
                        )}

                        <span
                          className={`badge ms-2 ${
                            meetingData?.moment_privacy === "private"
                              ? "solution-badge-red"
                              : meetingData?.moment_privacy === "public"
                                ? "solution-badge-green"
                                : meetingData?.moment_privacy === "enterprise"
                                  ? "solution-badge-blue"
                                  : meetingData?.moment_privacy === "password"
                                    ? "solution-badge-red"
                                    : "solution-badge-yellow"
                          }`}
                          style={{ padding: "3px 8px 3px 8px" }}
                        >
                          {meetingData?.moment_privacy === "private"
                            ? t("solution.badge.private")
                            : meetingData?.moment_privacy === "public"
                              ? t("solution.badge.public")
                              : meetingData?.moment_privacy === "enterprise"
                                ? t("solution.badge.enterprise")
                                : meetingData?.moment_privacy === "password"
                                  ? t("solution.badge.password")
                                  : t("solution.badge.team")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div>
                  <StepCounterContainer
                    alarm={meetingData?.alarm || false}
                    // progress={showProgressBar}
                    startTime={stepStartTime}
                    startDate={stepStartDate}
                    estimateTime={stepEndTime}
                    estimateDate={stepEndDate}
                    inProgressIndex={currentStepIndex}
                  />
                  {/* Button Container */}
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    {/* Terminer / Reprendre Button */}
                    {meetingData?.type !== "Newsletter" && (
                      <>
                        {meetingData?.steps[currentStepIndex]?.participant
                          ?.email === sessionUserEmail?.email ? (
                          <button
                            className="btn"
                            onClick={() => setShowConfirmLastStepModal(true)}
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "24px",
                              textAlign: "left",
                              color: "#FFFFFF",
                              background: isLastStep ? "#14A44D" : "#2C48AE",
                              border: 0,
                              outline: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                            }}
                          >
                            {isLastStep
                              ? `${t("Close")}:${meetingData?.title}`
                              : t("Terminer")}
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            onClick={handleShowResume}
                          >
                            {t("Reprendre")}
                          </button>
                        )}
                      </>
                    )}

                    {/* Reject Button */}
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleCancelClick(meetingData?.steps[currentStepIndex])
                      }
                    >
                      {t("Reject")}
                    </button>

                    {/* Dropdown for other actions */}
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
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              handleCopyStep(
                                meetingData?.steps[currentStepIndex],
                              )
                            }
                          >
                            {isDuplicateStep ? (
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
                              t("buttons.Copy")
                            )}
                          </button>
                        </li>
                        {meetingData?.type !== "Newsletter" && (
                          <>
                            {meetingData?.steps[currentStepIndex]?.participant
                              ?.email === sessionUserEmail?.email && (
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={handlePauseStep}
                                >
                                  {t("Pause")}
                                </button>
                              </li>
                            )}
                          </>
                        )}
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={handleOpenReestimate}
                          >
                            {t("Ré-estimer")}
                          </button>
                        </li>
                        {meetingData?.type !== "Newsletter" && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={handleShow}
                            >
                              {t("Ré-assigner")}
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="paragraph-parent my-0 mt-2 ms-1">
              <span className="paragraph paragraph-images">
                <div
                  dangerouslySetInnerHTML={{
                    __html: meetingData?.description || "",
                  }}
                />
              </span>
            </div>
            <div
              className="cards-section child-2"
              style={{ marginBottom: "4rem" }}
            >
              <div style={{ marginTop: "4rem" }}>
                <h4
                  className={
                    fromMeeting
                      ? "participant-heading-meeting"
                      : "participant-heading"
                  }
                >
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
                  {"Guide"}
                </h4>
                <div
                  className="host"
                  style={{ background: showHostProfile && "white" }}
                >
                  <HostCard
                    data={meetingData?.steps[currentStepIndex]?.participant}
                    fromMeeting={fromMeeting}
                    guides={meetingData?.guides}
                    disabled={isDisabled}
                    handleShow={handleHostShow}
                    handleHide={hideHostShow}
                    showProfile={showHostProfile}
                    meeting={meetingData}
                  />
                </div>
              </div>

              {/* Content Part */}
              <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
                <h4 className="participant-heading-meeting d-flex align-items-center justify-content-between">
                  {t("Content")}
                </h4>
                {meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Editeur" ||
                meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Subtask" ||
                meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Prestation" ||
                meetingData?.steps[currentStepIndex]?.editor_type === "Story" ||
                meetingData?.steps[currentStepIndex]?.editor_type === "Email" ||
                meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Message" ? (
                  <>
                    {/* <div
                      className="rendered-content-report-step-chart ps-3"
                      style={{ maxWidth: "100%" }}
                      dangerouslySetInnerHTML={{
                        __html:
                        meetingData?.steps[currentStepIndex]?.editor_content !== null ||
                        meetingData?.steps[currentStepIndex]?.editor_content !== ""
                            ? meetingData?.steps[currentStepIndex]?.editor_content
                            : " ",
                      }}
                    /> */}
                    <Editor
                      className="editor-no-border text_editor"
                      id="text_editor"
                      apiKey={TINYMCEAPI}
                      value={modifiedFileText}
                      onEditorChange={(content) => {
                        setModifiedFileText(content);
                        debouncedAutoSave(content);
                      }}
                      name="text"
                      init={{
                        statusbar: false,
                        branding: false,
                        height: 600,
                        border: "none",
                        menubar: true,
                        language: "fr_FR",
                        plugins:
                          meetingData?.type === "Law"
                            ? "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern"
                            : "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                        toolbar:
                          meetingData?.type === "Law"
                            ? "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat"
                            : "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                        image_advtab: meetingData?.type !== "Law",
                        file_picker_types:
                          meetingData?.type === "Law" ? "" : "image media",
                        file_picker_callback: function (callback, value, meta) {
                          if (
                            meta.filetype === "image" &&
                            meetingData?.type !== "Law"
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
                            if (meetingData?.type === "Law") {
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
                      onClick={() =>
                        handleSaveEditorContent(
                          meetingData?.steps[currentStepIndex],
                        )
                      }
                      disabled={editContentSave}
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
                ) : meetingData?.steps[currentStepIndex]?.editor_type ===
                    "File" ||
                  meetingData?.steps[currentStepIndex]?.editor_type ===
                    "Video" ||
                  meetingData?.steps[currentStepIndex]?.editor_type ===
                    "Photo" ||
                  meetingData?.steps[currentStepIndex]?.editor_type ===
                    "Audio Report" ||
                  meetingData?.steps[currentStepIndex]?.editor_type ===
                    "Video Report" ? (
                  <div>
                    <iframe
                      src={
                        Assets_URL +
                        "/" +
                        (meetingData?.steps[currentStepIndex]?.file +
                          "#toolbar=0&view=fitH")
                      }
                      width="100%"
                      height="500px"
                    />
                  </div>
                ) : meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Url" ? (
                  <>
                    <iframe
                      src={getYoutubeEmbedUrl(
                        meetingData?.steps[currentStepIndex]?.url,
                      )}
                      width="100%"
                      height="500px"
                    />
                  </>
                ) : meetingData?.steps[currentStepIndex]?.editor_type ===
                  "Excel" ? (
                  <DocViewer
                    documents={[
                      {
                        uri:
                          `${Assets_URL}/${meetingData?.steps[currentStepIndex]?.file}` ||
                          "",
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
                ) : null}
              </div>

              {/* Notes Part */}

              <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
                <h4
                  className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                >
                  {viewNote === "note"
                    ? `${t("Notes")}`
                    : viewNote === "prompt"
                      ? `${t("Prompt")}: ${
                          meetingData?.solution
                            ? meetingData?.solution?.title
                            : t(
                                `types.${meetingData?.prompts[0]?.meeting_type}`,
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
                  >
                    <div className="toggle-button">
                      <button
                        className={`toggle-button-option ${
                          viewNote === "note" ? "active" : ""
                        }`}
                        onClick={() => handleViewToggle("note")}
                      >
                        <div className="icon-list" />
                        <MdOutlineSummarize size={20} />
                      </button>
                    </div>
                  </span>
                </h4>
                {meetingData?.type === "Newsletter" ? (
                  <>
                    <div className="row d-flex flex-column m-4">
                      <div className="d-flex gap-3 fs-4">
                        <h6>Campaign Name: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.campaign_name
                          }
                        </h6>
                      </div>
                      <div className="d-flex ga-3">
                        <h6>Total Sendings: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.total_sendings
                          }
                        </h6>
                      </div>
                      <div className="d-flex ga-3">
                        <h6>Total Recipients: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.total_recipients
                          }
                        </h6>
                      </div>
                      <div className="d-flex ga-3">
                        <h6>Total Opens: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.total_opens
                          }
                        </h6>
                      </div>
                      <div className="d-flex ga-3">
                        <h6>Total clicks: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.total_clicks
                          }
                        </h6>
                      </div>
                      <div className="d-flex ga-3">
                        <h6>Total Unsubscribes: </h6>
                        <h6>
                          {
                            meetingData?.steps[currentStepIndex]
                              ?.email_campaigns?.total_unsubscribes
                          }
                        </h6>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      id="auto-note-editable-content"
                      contentEditable
                      dangerouslySetInnerHTML={{
                        __html: meetingData?.steps[currentStepIndex]?.note,
                      }}
                      onInput={(e) => setStepNotes(e.currentTarget.innerHTML)}
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        minHeight: "150px",
                      }}
                    />
                  </>
                )}
                {meetingData?.type !== "Newsletter" && (
                  <div className="mt-2">
                    <button
                      className={`btn moment-btn`}
                      onClick={() => handleAutoNoteSave(meeting)}
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
                    >
                      {autoNoteSaving ? (
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
                    </button>
                  </div>
                )}
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
                    <p className="mb-1 text-muted">
                      {t("No media uploaded yet.")}
                    </p>
                    <small className="text-muted">
                      {t("Click 'Upload Media' to add photos or videos")}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            {GradientSvg}
            {GradientSvg2}
            {GradientSvg3}
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
      {/* //Close Button Modal  */}
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
            {/* Step Notes Editor */}
            <div
              id="auto-note-editable-content"
              contentEditable
              dangerouslySetInnerHTML={{
                __html: meetingData?.steps[currentStepIndex]?.note || "",
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
            {/* Validate Button */}
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
                await closeCurrentStep(meeting);
                const isLastStep =
                  currentStepIndex === meetingData?.steps?.length - 1;
                const allStepsCompleted = meetingData?.steps?.every(
                  (step) => step.step_status === "completed",
                );
                const isSpecialMeetingType =
                  meetingData?.type === "Task" ||
                  meetingData?.type === "Prestation Client" ||
                  meetingData?.type === "Strategy";

                if (isSpecialMeetingType && allStepsCompleted) {
                  isAutomatic
                    ? await close(meeting)
                    : await closeMeeting(meeting);
                } else if (
                  isLastStep &&
                  (meetingData?.type !== "Task" ||
                    meetingData?.type !== "Strategy")
                ) {
                  isAutomatic
                    ? await close(meeting)
                    : await closeMeeting(meeting);
                }
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

            {/* Cancel Button */}
            <Button
              variant="danger"
              onClick={() => setShowConfirmLastStepModal(false)}
            >
              {t("Cancel")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* //Re estimaite  Modal  */}
      {showReestimateModal && (
        <Modal
          show={showReestimateModal}
          onHide={() => {
            setShowReestimateModal(false);
            setIsReestimateModalOpen(false);
          }}
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
              {/* <Form.Label>{t("Enter Time Duration")}</Form.Label> */}
              <div className="d-flex gap-4 align-items-center">
                <Form.Control
                  type="number"
                  min="1"
                  value={additionalTime}
                  onChange={(e) => setAdditionalTime(e.target.value)}
                  // placeholder="Enter minutes"
                />
                {meetingData?.type === "Action1" ||
                meetingData?.type === "Newsletter" ||
                meetingData?.type === "Strategy" ||
                meetingData?.type === "Absence" ||
                meetingData?.type === "Sprint" ? (
                  <span className="fw-bold"> {t("days")} </span>
                ) : meetingData?.type === "Task" ||
                  meetingData?.type === "Prestation Client" ? (
                  <span className="fw-bold"> {t("hour")} </span>
                ) : meetingData?.type === "Quiz" ? (
                  <span className="fw-bold"> {t("sec")} </span>
                ) : meetingData?.type === "Special" ? (
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
              onClick={() => {
                setShowReestimateModal(false);
                setIsReestimateModalOpen(false);
              }}
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
                opacity: isReestimating ? 0.7 : 1,
              }}
              onClick={() => updateStep(meetingData?.steps[currentStepIndex])}
              disabled={isReestimating}
            >
              {isReestimating ? (
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
                t("Validate")
              )}
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

      {/* For ReAssign */}
      {show && (
        <div className="new-meeting-modal tabs-container">
          <StepChartAction
            meetingId={id}
            id={step_Id}
            show={show}
            // setId={setStepId}
            closeModal={closeModal}
            meeting={meetingData}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            stepIndex={currentStepIndex}
            closeStep={closeStep}
            // refreshMeeting={getRefreshMeeting}
          />
        </div>
      )}
      {showResume && (
        <div className="new-meeting-modal tabs-container">
          <StepChartAction
            meetingId={id}
            id={step_Id}
            show={showResume}
            // setId={setStepId}
            closeModal={handleCloseResume}
            meeting={meetingData}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            stepIndex={currentStepIndex}
            closeStep={todoStep}
            fromTodo={true}
          />
        </div>
      )}

      {showCopy && (
        <div className="new-meeting-modal tabs-container">
          <StepChart
            meetingId={meetingData?.id}
            id={duplicatedStep?.id}
            setId={setStepId}
            show={showCopy}
            closeModal={closeCopyModal}
            meeting={meetingData}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            closeStep={getStep}
            isCopied={true}
          />
        </div>
      )}
    </>
  );
};

export default ActionPlay;
