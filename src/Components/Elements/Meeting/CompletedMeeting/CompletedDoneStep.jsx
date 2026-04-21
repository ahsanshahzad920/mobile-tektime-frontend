import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { FiEdit } from "react-icons/fi";
import { PiFilePdfLight } from "react-icons/pi";
import { RiEditBoxLine, RiFileExcel2Line } from "react-icons/ri";
import {
  addTimeTakenToStepTime,
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  convertTo24HourFormat,
  convertTo24HourFormatForMedia,
  formatStepDate,
  localizeTimeTaken,
} from "../../../Utils/MeetingFunctions";
import { MdInfo } from "react-icons/md";
import {
  IoVideocamOutline,
  IoCopyOutline,
  IoArrowBackSharp,
} from "react-icons/io5";
import {
  MdOutlinePhotoSizeSelectActual,
  MdOutlineSummarize,
} from "react-icons/md";
import { CgTranscript } from "react-icons/cg";
import { FaRegFileAudio } from "react-icons/fa";
// import HostCard from "./HostCard";
import { useTranslation } from "react-i18next";
import {
  Card,
  OverlayTrigger,
  Spinner,
  ProgressBar,
  Button,
  Modal,
} from "react-bootstrap";
import { CiEdit } from "react-icons/ci";
import { toast } from "react-toastify";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import moment from "moment";
import { Avatar, Tooltip } from "antd";
import TranscriptComponent from "./TranscriptComponent";
import HostCard from "../CurrentMeeting/components/HostCard";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import UpcomingStepScreen from "./UpcomingStepScreen";
import StepChart from "../CreateNewMeeting/StepChart";
import { formatDate, formatTime } from "../GetMeeting/Helpers/functionHelper";
import StepParticipant from "./StepParticipant";
import MediaGallery from "./MediaGallery";
import { BiCloudUpload } from "react-icons/bi";

function CompletedDoneStep() {
  const [t] = useTranslation("global");
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [modifiedFileText, setModifiedFileText] = useState(null);

  const [step, setStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgressBar] = useState(false);
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState("note");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // const { meeting } = location?.state || "";
  const [meeting, setMeeting] = useState(null);
  const [meta, setMeta] = useState(null);
  const getStep = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options),
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/steps/${id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
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
        setStep(response?.data?.data);
        setMeta(response?.data);
        setModifiedFileText(response?.data?.data?.editor_content);

        if (
          response?.data?.data?.meeting?.type === "Special" &&
          response?.data?.data?.transcripted_text === null
        ) {
          await summarizeNote(response?.data?.data?.id);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getMeeting = async () => {
      const meetingId = step?.meeting_id;
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/action-details/${meetingId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                CookieService.get("token")
              }`,
            },
          },
        );
        if (response.status === 200 || response.status === 201) {
          setMeeting(response?.data?.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (step?.meeting_id) {
      getMeeting();
    }
  }, [id, step]);
  useEffect(() => {
    if (id) {
      getStep();
    }
  }, [id]);

  const summarizeNote = async (id) => {
    if (step?.note) return;
    setShowProgressBar(true);
    setNoteLoading(true); // Show progress bar
    setProgress(0);
    try {
      // Simulate progress incrementally
      const simulateProgress = () => {
        setProgress((prev) => {
          if (prev >= 95) return prev; // Cap progress at 95%
          return prev + 1; // Increment progress
        });
      };

      // Start a progress simulation interval
      const interval = setInterval(simulateProgress, 100); // Increment every 100ms

      const response = await axios.get(
        `${API_BASE_URL}/summrize-step-transcription/${id}`,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
      );

      clearInterval(interval);

      if (response.status === 200) {
        setStep((prevStep) => ({
          ...prevStep,
          note: response?.data?.data?.note,
        }));
        setNoteLoading(false); // Show progress bar

        setProgress(100);

        // Hide progress bar after a short delay
        setTimeout(() => {
          setShowProgressBar(false);
        }, 500);
      } else {
        throw new Error("Failed to fetch the summary");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setProgress(0);
      setShowProgressBar(false);
      setNoteLoading(false); // Show progress bar
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
  const sessionUser = JSON.parse(
    CookieService.get("user")
  );

  const handleViewToggle = async (view) => {
    if (view === "prompt") {
      await handleToggleInfo(step);
    } else if (
      view === "note" &&
      step?.meeting?.type === "Special" &&
      step?.note === null
    ) {
      await handleSecondApiCall();
    }
    setView(view);
  };

  const handleSave = async (item) => {
    const updatedContent = document.getElementById(
      "step-note-editable-content",
    ).innerHTML;
    setIsSaving(true);
    const payload = {
      ...item,
      note: updatedContent,
      _method: "put",
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
      );
      if (response?.status) {
        toast.success(t("Notes are saved successfully!"));
      }
    } catch (error) {
      console.error("Failed to save the notes:", error);
      toast.error(t("Failed to save the notes: API error"));
    } finally {
      setIsSaving(false);
    }
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
  const [showInfo, setShowInfo] = useState(false); // Toggle state
  const [infoContent, setInfoContent] = useState(""); // Initially empty
  const [infoLoading, setInfoLoading] = useState(false);
  const handleToggleInfo = async (item) => {
    setShowInfo((prev) => !prev); // Toggle info display

    if (!showInfo) {
      // Fetch data only when opening
      setInfoLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/meeting-prompts/${item?.meeting?.prompts[0]?.id}`,
          {
            headers: {
              Authorization: `Bearer ${
                CookieService.get("token")
              }`,
            },
          },
        );

        if (response?.status === 200) {
          setInfoContent(response.data?.data?.prompt || ""); // Set fetched content
        }
      } catch (error) {
        console.error("Error fetching prompt:", error);
      } finally {
        setInfoLoading(false);
      }
    }
  };
  const handleUpdatePrompt = async (item) => {
    const updatedPrompt = document.getElementById(
      "info-editable-content",
    ).innerHTML;
    setIsSaving(true);
    const payload = {
      ...item?.meeting?.prompts[0],
      prompt: updatedPrompt,
      _method: "put",
    };
    try {
      const response = await axios.put(
        `${API_BASE_URL}/meeting-prompts/${item?.meeting?.prompts[0]?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        },
      );
      if (response?.status) {
        toast.success(t("Prompt updated successfully"));
        handleSecondApiCall();
      }
    } catch (error) {
      console.error("Failed to update the prompt:", error);
      toast.error(t("Failed to update the prompt: API error"));
    } finally {
      setIsSaving(false);
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
  useEffect(() => {
    if (step?.original_note) {
      setView("note");
    } else if (step?.transcripted_text && step?.note) {
      setView("note");
    } else {
      setView("transcript");
    }
  }, [step]);

  const handleSecondApiCall = async () => {
    if (
      view === "note" &&
      step?.meeting?.type === "Special" &&
      step?.note === null
    )
      return;
    setNoteLoading(true); // Show progress bar
    setView("note");

    // Start a progress simulation interval
    // const interval = setInterval(simulateProgress, 100); // Increment every 100ms
    try {
      const response = await axios.get(
        `${API_BASE_URL}/summrize-step-transcription/${step?.id}`,
      );

      // Clear interval when the request completes
      // clearInterval(interval);
      if (response.status) {
        const newNotes = response?.data?.data?.note;
        setStep((prevMeeting) => ({
          ...prevMeeting,
          note: newNotes,
        }));
        setView("note");
      } else {
        console.log("Second API call failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error in second API call:", error);
    } finally {
      setNoteLoading(false); // Show progress bar
    }
  };

  const duration =
    step?.time_unit === "days"
      ? step?.count2 * 86400
      : step?.time_unit === "hours"
        ? step?.count2 * 3600
        : step?.count2 * 60;

  const calculateEndDate = (startDate, stepTime, timeTaken, timezone) => {
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

  // const parseDurationToSeconds = (duration) => {
  //   if (!duration) return 0;
  //   const dayMatch = duration.match(/(\d+)\s*(day|days)/i);
  //   const hourMatch = duration.match(/(\d+)\s*(hour|hours)/i);
  //   const minuteMatch = duration.match(/(\d+)\s*(min|mins)/i);
  //   const secondMatch = duration.match(/(\d+)\s*(sec|secs)/i);
  //   const days = dayMatch ? parseInt(dayMatch[1]) * 86400 : 0;
  //   const hours = hourMatch ? parseInt(hourMatch[1]) * 3600 : 0;
  //   const minutes = minuteMatch ? parseInt(minuteMatch[1]) * 60 : 0;
  //   const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;
  //   return days + hours + minutes + seconds;
  // };

  // const calculateStepStartTimes = (steps) => {
  //   let currentStartTime = 0;
  //   return steps.map((step) => {
  //     const durationInSeconds = parseDurationToSeconds(step?.time_taken);
  //     const result = {
  //       ...step,
  //       startTime: currentStartTime,
  //       endTime: currentStartTime + durationInSeconds,
  //     };
  //     currentStartTime += durationInSeconds;
  //     return result;
  //   });
  // };

  // useEffect(() => {
  //   const generateTranscriptionsForAllSteps = async () => {
  //     if (!meeting?.meeting_notes_transcript?.timestamps?.length || !meeting?.steps?.length) return;

  //     const stepsWithTimes = calculateStepStartTimes(meeting.steps);

  //     for (const step of stepsWithTimes) {
  //       if (step?.original_note) continue;

  //       const stepTranscription = meeting.meeting_notes_transcript.timestamps.filter(
  //         (entry) =>
  //           Number(entry.start_time) >= Number(step.startTime) &&
  //           Number(entry.end_time) <= Number(step.endTime)
  //       );

  //       if (!stepTranscription?.length) continue;

  //       const payload = {
  //         step_id: step.id,
  //         original_note: stepTranscription.map((entry) => entry.word).join(" "),
  //       };

  //       try {
  //         await axios.post(`${API_BASE_URL}/save-step-original-notes`, payload);
  //       } catch (error) {
  //         console.error(`Failed to save transcription for step ${step.id}`, error);
  //       }
  //     }
  //   };

  //   generateTranscriptionsForAllSteps();
  // }, [meeting?.meeting_notes_transcript?.timestamps, meeting?.steps]);

  const [isDrop, setIsDrop] = useState(false);
  const [stepId, setStepId] = useState(id); // Initialize with the id from params

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
  return (
    <>
      {loading || !step || !meeting ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <>
          {step?.step_status === "todo" ||
          step?.step_status === "to_accept" ||
          step?.step_status === null ||
          step?.step_status === "to_finish" ? (
            <UpcomingStepScreen
              meeting={meeting}
              step={step}
              meta={meta}
              getStep={getStep}
              setModifiedFileText={setModifiedFileText}
              modifiedFileText={modifiedFileText}
              loading={loading}
              setLoading={setLoading}
            />
          ) : (
            <div className="invite p-2">
              <div className="row d-flex child-1">
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
                        <Link
                          to={`/invitiesToMeeting/${meeting?.destination_id}`}
                        >
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
                      {step?.order_no && `${step.order_no}. `}{" "}
                      {/* Ensure order exists */}
                      {step?.title}
                      <span
                        className="ms-2 cursor-pointer"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEditTitle(step)}
                      >
                        <RiEditBoxLine size={20} />
                      </span>
                      {step?.step_status === "completed" ? (
                        <span className="mx-2 badge inprogrss">
                          {t("badge.completed")}
                        </span>
                      ) : step?.step_status === "to_finish" ? (
                        <span className="mx-2 badge tofinish">
                          {t("badge.finish")}
                        </span>
                      ) : (
                        <span className="mx-2 badge cancel">
                          {t("badge.cancel")}
                        </span>
                      )}
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

                    {/* Next Button */}
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

                  <div className="items mt-0 mt-md-2 audio-items">
                    <div className="type">
                      {
                        step?.editor_type === "Editeur" ||
                        step?.editor_type === "Subtask" ||
                        step?.editor_type === "Prestation" ||
                        step?.editor_type === "Story" ||
                        step?.editor_type === "Email" ||
                        step?.editor_type === "Message" ? (
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
                              step?.meeting?.timezone,
                            ) +
                            ` ${t("at")} ` +
                            convertTo24HourFormat(
                              step?.step_time,
                              step?.start_date,
                              step?.time_unit,
                              step?.meeting?.timezone,
                            )
                          : formatStepDate(
                              step?.start_date,
                              step?.step_time,
                              step?.meeting?.timezone,
                            ) +
                            ` ${t("at")} ` +
                            convertTo24HourFormat(
                              step?.step_time,
                              step?.start_date,
                              step?.time_unit,
                              step?.meeting?.timezone,
                            )}{" "}
                        -
                      </span>
                      <span className="fw-bold formate-date">
                        {meeting?.type === "Special"
                          ? formatStepDate(
                              step?.start_date,
                              step?.step_time,
                              step?.meeting?.timezone,
                            ) +
                            ` ${t("at")} ` +
                            convertTo24HourFormatForMedia(
                              step?.step_time,
                              step?.count2,
                              step?.time_unit,
                            )
                          : calculateEndDate(
                              step?.start_date,
                              step?.step_time,
                              step?.time_taken,
                              step?.meeting?.timezone,
                            ) +
                            ` ${t("at")} ` +
                            addTimeTakenToStepTime(
                              step?.time_taken,
                              step?.end_date,
                              step?.step_time,
                              step?.meeting?.timezone,
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
                              {meeting?.moment_privacy_teams_data?.map(
                                (item) => {
                                  return (
                                    <>
                                      <Tooltip
                                        title={item?.name}
                                        placement="top"
                                      >
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
                                      meeting?.moment_privacy ===
                                        "tektime members"
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
                                  : meeting?.moment_privacy ===
                                      "participant only"
                                    ? t("solution.badge.participantOnly")
                                    : meeting?.moment_privacy ===
                                        "tektime members"
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

                <div className="col-md-4 counter-container d-flex align-items-center flex-column">
                  <div className="timer-container d-flex gap-1">
                    {/* Start Time */}
                    <div className="time-circle-wrapper pt-4">
                      <CountdownCircleTimer
                        isPlaying={false}
                        duration={duration}
                        colors={["#f67913"]}
                        size={100}
                        strokeWidth={5}
                      >
                        {() => (
                          <div className="justify-content-center flex-column d-flex align-items-center">
                            <span
                              className="start-at"
                              style={{ fontSize: "12px" }}
                            >
                              {formatStepDate(
                                step?.start_date,
                                step?.step_time,
                                step?.meeting?.timezone,
                              )}
                            </span>

                            <span
                              className="start-at"
                              style={{ fontSize: "10px" }}
                            >
                              {t("Start At")}
                            </span>
                            <span
                              className="start-at"
                              style={{ fontSize: "12px" }}
                            >
                              {convertTo24HourFormat(
                                step?.step_time,
                                step?.start_date,
                                step?.time_unit,
                                step?.meeting?.timezone,
                              )}
                            </span>
                          </div>
                        )}
                      </CountdownCircleTimer>
                    </div>

                    {/* Countdown Timer */}
                    <div className="time-circle-wrapper  pb-4">
                      <CountdownCircleTimer
                        isPlaying={false}
                        duration={duration}
                        colors={["#5AAFD6"]}
                        size={130}
                        strokeWidth={5}
                      >
                        {({ remainingTime }) => (
                          <div className="timer-text">
                            {step?.meeting?.type === "Special"
                              ? step?.count2 +
                                " " +
                                t(`time_unit.${step?.time_unit}`)
                              : localizeTimeTaken(
                                  step?.time_taken?.replace("-", ""),
                                  t,
                                )}
                          </div>
                        )}
                      </CountdownCircleTimer>
                    </div>

                    {/* Estimated End Time */}
                    <div className="time-circle-wrapper pt-4">
                      <CountdownCircleTimer
                        isPlaying={false}
                        duration={duration}
                        colors={["red"]}
                        size={100}
                        strokeWidth={4}
                      >
                        {() => (
                          <div className="justify-content-center flex-column d-flex align-items-center">
                            <span
                              className="start-at"
                              style={{ fontSize: "12px" }}
                            >
                              {/* {formatStepDate(
                          step?.end_date,
                          step?.step_time,
                          step?.meeting?.timezone
                        ) } */}
                              {calculateEndDate(
                                step?.start_date,
                                step?.step_time,
                                step?.time_taken,
                                step?.meeting?.timezone,
                              )}
                            </span>
                            <span
                              className="start-at"
                              style={{ fontSize: "10px" }}
                            >
                              {t("Estimated End At")}
                            </span>
                            <span
                              className="start-at"
                              style={{ fontSize: "12px" }}
                            >
                              {addTimeTakenToStepTime(
                                step?.time_taken,
                                step?.end_date,
                                step?.step_time,
                                step?.meeting?.timezone,
                              )}
                            </span>
                          </div>
                        )}
                      </CountdownCircleTimer>
                    </div>
                  </div>

                  {/* Button Container */}
                  {/* <div className="d-flex justify-content-center gap-3 mt-3">
                    <button
                      className="btn "
                      onClick={() => handleCopyStep(step)}
                      // onClick={handleShowCopyModal}
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
                  </div> */}
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
                    <div
                      className="rendered-content-report-step-chart ps-3"
                      style={{ maxWidth: "100%" }}
                      dangerouslySetInnerHTML={{
                        __html:
                          step?.editor_content !== null ||
                          step?.editor_content !== ""
                            ? step?.editor_content
                            : " ",
                      }}
                    />
                  </>
                ) : step?.editor_type === "File" ||
                  step?.editor_type === "Video" ||
                  step?.editor_type === "Photo" ||
                  step?.editor_type === "Audio Report" ||
                  step?.editor_type === "Video Report" ? (
                  <div>
                    <iframe
                      src={
                        Assets_URL + "/" + (step?.file + "#toolbar=0&view=fitH")
                      }
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
              {/* Also Check the meeting type */}
              {meeting?.type === "Special" ? (
                <>
                  {
                    <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
                      <h4
                        className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                      >
                        {view === "note"
                          ? `${t("Notes")}`
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
                                view === "note" ? "active" : ""
                              }`}
                              onClick={() => handleViewToggle("note")}
                            >
                              <div className="icon-list" />
                              <MdOutlineSummarize size={20} />
                            </button>
                            <button
                              className={`toggle-button-option ${
                                view === "transcript" ? "active" : ""
                              }`}
                              onClick={() => handleViewToggle("transcript")}
                            >
                              <div className="icon-graph" />
                              <CgTranscript size={18} />
                            </button>
                          </div>
                        </span>
                      </h4>
                      {view === "note" ? (
                        noteLoading ? (
                          <>
                            <div className="progress-container">
                              <div
                                className="progress"
                                style={{ width: `${50}%` }}
                              />
                            </div>
                            <h5 className="text-center">
                              {t("note_translation.Processing Step Note")}
                            </h5>
                          </>
                        ) : (
                          <>
                            {/* <h6
                          style={{
                            padding: "10px 5px",
                          }}
                        >
                          {" "}
                          Total Characters:
                          {step?.note?.length}
                        </h6> */}

                            <div
                              id="step-note-editable-content"
                              contentEditable
                              dangerouslySetInnerHTML={{
                                __html: step?.note,
                              }}
                              style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                minHeight: "150px",
                              }}
                            />
                          </>
                        )
                      ) : (
                        <>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: step?.transcripted_text,
                            }}
                          />
                        </>
                      )}

                      {view === "note" ? (
                        <div className="mt-2">
                          <button
                            className={`btn moment-btn`}
                            onClick={() => handleSave(step)}
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
                            {isSaving ? (
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
                      ) : null}
                    </div>
                  }
                </>
              ) : meeting?.type === "Newsletter" ? (
                <>
                  <h4
                    className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                  >
                    {`${t("Notes")}`}

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
                          className={`toggle-button-option active`}
                          // onClick={() => handleViewToggle("note")}
                        >
                          <div className="icon-list" />
                          <MdOutlineSummarize size={20} />
                        </button>
                      </div>
                    </span>
                  </h4>
                  <div style={{ height: "200px" }} className="">
                    <div
                      className="h-100"
                      style={{
                        // overflowY: "auto",
                        border: "1px solid #ececec",
                        padding: "10px",
                        borderRadius: "5px",
                      }}
                    >
                      <div className="row d-flex flex-column">
                        <div className="d-flex gap-3 fs-4">
                          <h6>Campaign Name: </h6>
                          <h6>{step?.email_campaigns?.campaign_name}</h6>
                        </div>
                        <div className="d-flex ga-3">
                          <h6>Total Sendings: </h6>
                          <h6>{step?.email_campaigns?.total_sendings}</h6>
                        </div>
                        <div className="d-flex ga-3">
                          <h6>Total Recipients: </h6>
                          <h6>{step?.email_campaigns?.total_recipients}</h6>
                        </div>
                        <div className="d-flex ga-3">
                          <h6>Total Opens: </h6>
                          <h6>{step?.email_campaigns?.total_opens}</h6>
                        </div>
                        <div className="d-flex ga-3">
                          <h6>Total clicks: </h6>
                          <h6>{step?.email_campaigns?.total_clicks}</h6>
                        </div>
                        <div className="d-flex ga-3">
                          <h6>Total Unsubscribes: </h6>
                          <h6>{step?.email_campaigns?.total_unsubscribes}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {meeting?.prise_de_notes === "Automatic" ? (
                    meeting?.steps?.length > 1 && (
                      <>
                        {
                          <div
                            style={{
                              marginTop: "5rem",
                              marginBottom: "3rem",
                            }}
                          >
                            <h4
                              className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                            >
                              {view === "note"
                                ? `${t("Notes")}`
                                : view === "prompt"
                                  ? `${t("Prompt")}: ${
                                      meeting?.solution
                                        ? meeting?.solution?.title
                                        : t(
                                            `types.${step?.meeting?.prompts[0]?.meeting_type}`,
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
                                  {sessionUser?.role?.name ===
                                    "MasterAdmin" && (
                                    <button
                                      className={`toggle-button-option ${
                                        view === "prompt" ? "active" : ""
                                      }`}
                                      onClick={() => handleViewToggle("prompt")}
                                    >
                                      <div className="icon-list" />
                                      <MdInfo size={20} />
                                    </button>
                                  )}
                                  <button
                                    className={`toggle-button-option ${
                                      view === "note" ? "active" : ""
                                    }`}
                                    onClick={() => handleViewToggle("note")}
                                  >
                                    <div className="icon-list" />
                                    <MdOutlineSummarize size={20} />
                                  </button>
                                  <button
                                    className={`toggle-button-option ${
                                      view === "transcript" ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      handleViewToggle("transcript")
                                    }
                                  >
                                    <div className="icon-graph" />
                                    <CgTranscript size={18} />
                                  </button>
                                </div>
                              </span>
                            </h4>
                            {view === "note" ? (
                              noteLoading ? (
                                <>
                                  <div className="progress-container">
                                    <div
                                      className="progress"
                                      style={{ width: `${50}%` }}
                                    />
                                  </div>
                                  <h5 className="text-center">
                                    {t("note_translation.Processing Step Note")}
                                  </h5>
                                </>
                              ) : (
                                <>
                                  <div
                                    id="step-note-editable-content"
                                    contentEditable
                                    dangerouslySetInnerHTML={{
                                      __html: step?.note,
                                    }}
                                    style={{
                                      border: "1px solid #ccc",
                                      padding: "10px",
                                      minHeight: "150px",
                                    }}
                                  />
                                </>
                              )
                            ) : view === "prompt" ? (
                              <div
                                id="info-editable-content"
                                contentEditable
                                suppressContentEditableWarning={true} // Prevents React warning
                                dangerouslySetInnerHTML={{
                                  __html: infoContent,
                                }}
                                onBlur={(e) =>
                                  setInfoContent(e.target.innerHTML)
                                } // Save changes when focus is lost
                                style={{
                                  maxWidth: "100%",
                                  whiteSpace: "normal",
                                  background: "#f8f9fa",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  border: "1px solid #ccc",
                                  marginTop: "10px",
                                  minHeight: "50px",
                                }}
                              />
                            ) : meeting?.type === "Special" ? (
                              <>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: step?.transcripted_text,
                                  }}
                                />
                              </>
                            ) : (
                              <>
                                <TranscriptComponent
                                  meetingTranscriptWithTimestamps={
                                    meeting?.meeting_notes_transcript
                                      ?.timestamps
                                  }
                                  steps={meeting?.steps}
                                  stepId={step?.id}
                                  step={step}
                                  setStep={setStep}
                                  loading={transcriptLoading}
                                  setLoading={setTranscriptLoading}
                                  setView={setView}
                                />
                              </>
                            )}
                            {view === "note" ? (
                              <div className="mt-2">
                                <button
                                  className={`btn moment-btn`}
                                  onClick={() => handleSave(step)}
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
                                  {isSaving ? (
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
                            ) : view === "prompt" ? (
                              <div className="mt-2">
                                <button
                                  className={`btn moment-btn`}
                                  onClick={() => handleUpdatePrompt(step)}
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
                                  {isSaving ? (
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
                                    t("meeting.formState.Update&apply")
                                  )}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        }
                      </>
                    )
                  ) : (
                    <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
                      <h4
                        className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                      >
                        {`${t("Notes")}`}

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
                              className={`toggle-button-option active`}
                              // onClick={() => handleViewToggle("note")}
                            >
                              <div className="icon-list" />
                              <MdOutlineSummarize size={20} />
                            </button>
                          </div>
                        </span>
                      </h4>
                      <div
                        id={`step-note-editable-content`}
                        contentEditable
                        dangerouslySetInnerHTML={{
                          __html: step?.note,
                        }}
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                          minHeight: "150px",
                        }}
                      />
                      <div className="mt-2">
                        <button
                          className={`btn moment-btn`}
                          onClick={() => handleSave(step)}
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
                          {isSaving ? (
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
                    </div>
                  )}
                </>
              )}

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
          )}
        </>
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
            closeStep={getStep}
            isCopied={true}
          />
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
    </>
  );
}

export default CompletedDoneStep;
