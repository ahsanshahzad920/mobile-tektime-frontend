import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Container,
  Dropdown,
  Modal,
  Nav,
  ProgressBar,
  Spinner,
  Tab,
  Table as BotTable,
} from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";
import { toast } from "react-toastify";
import { FaArrowRight, FaLocationDot } from "react-icons/fa6";
import { AiOutlineDelete } from "react-icons/ai";
import { BiDotsVerticalRounded } from "react-icons/bi";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import jsPDF from "jspdf";
import {
  MdContentCopy,
  MdEdit,
  MdOutlineShare,
  MdOutlineSummarize,
} from "react-icons/md";
import { openLinkInNewTab } from "../../../Utils/openLinkInNewTab";
import copy from "copy-to-clipboard";
import ReportDecisionCard from "./ReportDecisionCard";
import { Avatar, Tooltip } from "antd";
import { CiEdit } from "react-icons/ci";
import ReportStepCard from "./ReportStepCard";
import { FaChartGantt } from "react-icons/fa6";
import { FaFilePdf, FaFileWord, FaList, FaPhoneAlt, FaRegFileAudio, FaRegFilePdf, FaRegFileWord, FaStar, FaSyncAlt } from "react-icons/fa";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import {
  IoArrowBackSharp,
  IoCloudDownloadOutline,
  IoCopyOutline,
} from "react-icons/io5";
import { useMeetings } from "../../../../context/MeetingsContext";
import {
  abortMeetingTime,
  groupWordsIntoSentences,
  localizeEstimateTime,
} from "../../../Utils/MeetingFunctions";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import NewMeetingModal from "../CreateNewMeeting/NewMeetingModal";
import { BsPersonWorkspace } from "react-icons/bs";
import { useSteps } from "../../../../context/Step";
import { RiEditBoxLine, RiPresentationFill } from "react-icons/ri";
import CompletedMomentStepFile from "./CompletedMomentStepFile";
import ViewFilePreview from "../ViewFilePreview";
import { CgTranscript } from "react-icons/cg";
import {
  convertDateToUserTimezone,
  convertTo12HourFormat,
  formatDate,
  formatTime,
  handleCopy,
  parseAndFormatDateTime,
  specialMeetingEndTime,
  timezoneSymbols,
  userId,
} from "../GetMeeting/Helpers/functionHelper";
import FeedbackCard from "./FeedbackCard";
import HostCard from "../CurrentMeeting/components/HostCard";
import FileUploadModal from "../CreateNewMeeting/FileUploadModal";
import SubscriberCard from "../CurrentMeeting/components/SubscriberCard";
import { Editor } from "@tinymce/tinymce-react";
import MeetingDiscussion from "../CurrentMeeting/components/MeetingDiscussion";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { SiMicrosoftoutlook, SiMicrosoftteams } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import GuidesCard from "../CurrentMeeting/components/GuidesCard";
import ParticipantCard from "../CurrentMeeting/components/ParticipantCard";
import KanbanBoard from "../CurrentMeeting/components/KanbanBoard";
import { autoTable } from "jspdf-autotable";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FiRefreshCw } from "react-icons/fi";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer } from "docx";
import { saveAs } from "file-saver";

// Speaker ke liye random but consistent colors (same speaker = same color)
const speakerColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
];

const getSpeakerColor = (speakerName) => {
  if (!speakerName || speakerName.includes("Unknown")) return "#adb5bd"; // gray for unknown
  let hash = 0;
  for (let i = 0; i < speakerName.length; i++) {
    hash = speakerName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return speakerColors[Math.abs(hash % speakerColors.length)];
};

const TranscriptWithTimestamps = ({ transcriptData }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (transcriptData?.transcriptionStamp) {
    return (
      <Container fluid className="my-4">
        <div className="d-flex flex-column gap-5">
          {transcriptData?.transcriptionStamp?.map((segment) => {
            const speaker = segment.speaker;
            const speakerName = speaker?.name || "Unknown Speaker";
            const isUnknown = !speaker || speakerName.includes("Unknown");
            const speakerColor = getSpeakerColor(speakerName);

            return (
              <div key={segment.id} className="d-flex gap-3">
                {/* Speaker Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {isUnknown ? (
                    <HiOutlineUserCircle size={32} className="text-muted" />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center text-white rounded-circle"
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: speakerColor,
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {speakerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-grow-1" style={{ maxWidth: "720px" }}>
                  {/* Speaker Name + Time + Replay */}
                  <div className="d-flex align-items-center gap-3 small mb-2">
                    <span
                      className="fw-semibold"
                      style={{ color: isUnknown ? "#6c757d" : speakerColor }}
                    >
                      {speakerName}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">
                      {formatTime(parseFloat(segment.startTime))}
                    </span>
                    {/* <FiRefreshCw
                    size={16}
                    className="text-muted cursor-pointer"
                    style={{ ':hover': { color: '#212529' } }}
                  /> */}
                  </div>

                  {/* Text Bubble */}
                  <div
                    className="bg-white rounded-4 px-4 py-3 border shadow-sm"
                    style={{
                      borderColor: "#dee2e6",
                      lineHeight: "1.6",
                    }}
                  >
                    <p className="mb-0 text-dark">{segment.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  } else {
    return (
      <Container fluid className="my-4">
        <div className="d-flex flex-column gap-5">
          {transcriptData?.map((segment) => {
            const speaker = segment.speaker;
            const speakerName = speaker?.name || "Unknown Speaker";
            const isUnknown = !speaker || speakerName.includes("Unknown");
            const speakerColor = getSpeakerColor(speakerName);

            return (
              <div key={segment.id} className="d-flex gap-3">
                {/* Speaker Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {isUnknown ? (
                    <HiOutlineUserCircle size={32} className="text-muted" />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center text-white rounded-circle"
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: speakerColor,
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {speakerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-grow-1" style={{ maxWidth: "720px" }}>
                  {/* Speaker Name + Time + Replay */}
                  <div className="d-flex align-items-center gap-3 small mb-2">
                    <span
                      className="fw-semibold"
                      style={{ color: isUnknown ? "#6c757d" : speakerColor }}
                    >
                      {speakerName}
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">
                      {formatTime(parseFloat(segment.startTime))}
                    </span>
                    {/* <FiRefreshCw
                    size={16}
                    className="text-muted cursor-pointer"
                    style={{ ':hover': { color: '#212529' } }}
                  /> */}
                  </div>

                  {/* Text Bubble */}
                  <div
                    className="bg-white rounded-4 px-4 py-3 border shadow-sm"
                    style={{
                      borderColor: "#dee2e6",
                      lineHeight: "1.6",
                    }}
                  >
                    <p className="mb-0 text-dark">{segment.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }
};
const CompletedInvite = () => {
  const APIKEY = process.env.REACT_APP_TINYMCE_API;

  const location = useLocation();
  const navigate = useNavigate();
  const {
    handleShow,
    open,
    setMeeting,
    setIsDuplicate,
    setCheckId,
    handleCloseModal,
    setAddParticipant,
    setChangePrivacy,
    setChangeContext,
    setChangeOptions,
    call,
    changePrivacy,
    changeContext,
    changeOptions,
    setFormState,
  } = useFormContext();
  const getTimezoneSymbol = (timezone) => timezoneSymbols[timezone] || timezone;

  let fromMeeting = true;
  if (location?.state?.from === "meeting") {
    fromMeeting = true;
  }
  let isDisabled = false;
  if (location?.state?.disabled === "yes") {
    isDisabled = true;
  }
  const { id } = useParams();
  const [t] = useTranslation("global");
  const { setHeaderTitle } = useHeaderTitle();
  const { setStatus, setClosedOffset } = useMeetings();
  const { updateSteps } = useSteps();
  const [meetingSummary, setMeetingSummary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalSummary, setOriginalSummary] = useState(meetingSummary || "");

  // Update originalSummary when meetingSummary changes
  useEffect(() => {
    setOriginalSummary(meetingSummary?.replace(/---/g, "") || "");
  }, [meetingSummary]);

  const handleCancelEdit = () => {
    setMeetingSummary(originalSummary);
    setIsEditing(false);
  };

  // Use meetingSummary directly as markdown content, with fallback to empty string
  const markdownContent = meetingSummary || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const [meeting, setMeeting1] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime1, setStartTime1] = useState(null);
  const [time, setTime] = useState(null);

  const [estimateTime, setEstimateTime] = useState(null);
  const [estimateDate, setEstimateDate] = useState(null);
  const [meetingTranscript, setMeetingTranscript] = useState(null);
  console.log("meetingTranscript", meetingTranscript);
  const [meetingTranscriptWithTimeStamps, setMeetingTranscriptWithTimeStamps] =
    useState(null);

  const [isTimeStampChecked, setIsTimeStampChecked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };
  const handleCheckboxChange = () => {
    setIsTimeStampChecked(!isTimeStampChecked);
  };

  const handleSave1 = () => {
    handleAutoNoteSave({
      ...meeting,
      meeting_notes_summary: meetingSummary || "",
    });
    // setOriginalSummary(meetingSummary || "");
    setIsEditing(false);
  };

  const [ffmpeg, setFfmpeg] = useState(null);
  const [mp3Url, setMp3Url] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        await ffmpegInstance.load();
        setFfmpeg(ffmpegInstance);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
      }
    };
    load();
  }, []);

  const [isConverting, setIsConverting] = useState(false);
  const convertToMp3 = async (file) => {
    if (!ffmpeg) return;

    try {
      setIsConverting(true);
      // 1. Fetch audio file
      const response = await fetch(file);
      const data = await response.arrayBuffer();

      // 2. Write file to ffmpeg FS
      await ffmpeg.writeFile("input.webm", new Uint8Array(data));

      // 3. Run conversion
      await ffmpeg.exec(["-i", "input.webm", "-q:a", "0", "output.mp3"]);

      // 4. Read output
      const fileData = await ffmpeg.readFile("output.mp3");

      // 5. Create Blob for upload
      const mp3Blob = new Blob([fileData.buffer], { type: "audio/mpeg" });
      const mp3File = new File([mp3Blob], "converted_audio.mp3", {
        type: "audio/mpeg",
      });

      // 🔹 Play in frontend
      const url = URL.createObjectURL(mp3Blob);
      setMp3Url(url);

      // 6. Send to API
      const formData = new FormData();
      formData.append("data", mp3File);
      formData.append("meeting_id", id);

      const res = await fetch(`${API_BASE_URL}/save-into-s3`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      const result = await res.json();
      setIsConverting(false);
      getRefreshedMeeting();
      console.log("API Response:", result);
    } catch (err) {
      console.error("Upload failed:", err);
      setIsConverting(false); // Ensure state is reset on error
    }
  };

  // ✅ Automatically check & convert if needed
  // ADDITIONAL FIX: Add this useEffect to handle the conversion after state update
  useEffect(() => {
    const handleConversion = async () => {
      if (!meeting?.voice_notes) {
        console.log("⚠️ No voice notes found in meeting state");
        return;
      }

      const audioUrl = meeting.voice_notes;
      console.log("🎵 Voice notes detected:", audioUrl);

      if (audioUrl.endsWith(".webm")) {
        console.log("🔄 Converting .webm to .mp3");
        await convertToMp3(audioUrl);
      } else if (audioUrl.endsWith(".mp3") || audioUrl.endsWith(".mp4")) {
        console.log("✅ Audio already in supported format");
        setMp3Url(audioUrl);
      }
    };

    handleConversion();
  }, [meeting?.voice_notes, ffmpeg]);


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
      debounce(async (newSummary) => {
        try {
          setAutoNoteSaving(true);
          const payload = {
            // ...meeting,
            meeting_id: id,
            meeting_notes_summary: newSummary,
            // _method: "put",
          };

          const response = await axios.post(
            `${API_BASE_URL}/update-meeting-report`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            }
          );

          if (response?.status) {
            toast.success(t("Changes saved automatically"), {
              autoClose: 2000,
            });
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
          toast.error(t("Auto-save failed"));
        } finally {
          setAutoNoteSaving(false);
        }
      }, 2000), // 2-second delay
    [meeting, id]
  );
  const [showFileModal, setShowFileModal] = useState(false);
  const handleCloseFileModal = () => {
    setShowFileModal(false);
  };
  const handleFileChange = (event) => {
    event.target.value = "";
  };

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
    } finally {
      setRefreshing(false)
    }
  };
  useEffect(() => {
    getMeetingMessages();
  }, [id]);


  const refreshMessages = async () => {
    getMeetingMessages();
  };
  const [autoNoteSaving, setAutoNoteSaving] = useState(false);

  const handleAutoNoteSave = async () => {
    // Extract the updated content from the editable div

    // Update local state immediately for a better user experience
    setAutoNoteSaving(true);

    const payload = {
      // ...meeting,
      meeting_id: id,
      meeting_notes_summary: meetingSummary,
      // _method: "put",
    };
    try {
      // // Call the API to save the updated content
      // await axios.post(saveApiUrl, { report: updatedContent });
      const response = await axios.post(
        `${API_BASE_URL}/update-meeting-report`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.status) {
        setEditMode(false);
        // setMeetingSummary(response?.data?.data?.meeting_notes_summary);
        await getRefreshedMeeting();

        // Exit edit mode after a successful save
        toast.success(t("Report is Edited successfully"));
      }
    } catch (error) {
      console.error("Failed to save the report:", error);
      // alert("Failed to save the report. Please try again.");
      toast.error(t("Failed to save the report: API error"));
    } finally {
      setAutoNoteSaving(false);
    }
  };

  const [callUpmeet, setCallUpmeet] = useState(false);

  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState("");
  //   useEffect(() => {
  //   const getMeeting = async () => {
  //     try {
  //       const currentTime = new Date();
  //       const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //       const options = { timeZone: userTimeZone };
  //       const timeInUserZone = new Date(
  //         currentTime.toLocaleString("en-US", options)
  //       );

  //       const formattedTime = formatTime(timeInUserZone);
  //       const formattedDate = formatDate(timeInUserZone);
  //       const response = await axios.get(
  //         `${API_BASE_URL}/get-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`
  //       );
  //       if (response.status) {
  //         const data = response.data?.data;

  //         setMeeting1(data);
  //         // Check if meeting_notes_summary exists
  //         if (data.meeting_notes_summary) {
  //           setMeetingSummary(response.data?.data?.meeting_notes_summary);
  //           setCallUpmeet(false); // No need to poll
  //         } else {
  //           setCallUpmeet(true); // Need to poll for summary
  //         }

  //         setMeetingTranscript(response.data?.data?.meeting_notes_transcript);



  //       }
  //     } catch (error) {
  //       console.log("error while fetching meeting data", error);

  //     } finally {
  //     }
  //   };

  //   getMeeting();
  // }, [id, changePrivacy, changeOptions, changeContext]);


  // States jo tumhe add karne hain component ke andar
  const [polling, setPolling] = useState(false);

  const pollingIntervalRef = useRef(null);

  // Updated fetchReport – ab yeh summary set karta hai aur true/false return karta hai
  const fetchReport = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-upmeet-report/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token") || CookieService.get("token")
              }`,
          },
        }
      );

      const data = response.data?.data;
      if (data?.upmeet_summary || data?.upmeet_full_transcription) {
        // // Success: Summary ya transcript mil gaya
        if (data?.upmeet_full_transcription) {
          setMeetingTranscript(data.upmeet_full_transcription);
        }
        if (data?.upmeet_summary?.text) {
          setMeetingSummary(data.upmeet_summary.text);
        }

        // setViewNote("note");
        setShowProgressBar(false);
        setPolling(false);

        // Call the automatic-strategy-meeting API
        if (meeting?.automatic_strategy) {
          try {
            await axios.post(
              `${API_BASE_URL}/automatic-strategy-meeting/${id}`,
              null,
              {
                headers: {
                  Authorization: `Bearer ${CookieService.get("token")}`,
                },
              }
            );
            await getRefreshedMeeting();
          } catch (apiError) {
            console.error("Error calling automatic-strategy-meeting API:", apiError);
          }
        }

        // toast.success("Compte rendu généré avec succès !");
        return true; // Success → polling ruk jaye
      }

      // Agar abhi tak nahi mila → false return karo → polling continue
      return false;
    } catch (error) {
      console.error("Error fetching Upmeet report:", error);
      // Network error bhi continue polling → false return
      return false;
    }
  };

  // Polling Start Function
  const startPollingForReport = async () => {
    if (pollingIntervalRef.current || polling) return; // Already chal raha hai

    console.log("Starting polling for AI summary...");
    setPolling(true);
    setShowProgressBar(true);

    let attempts = 0;
    const maxAttempts = 100; // ~3.5 minutes max wait

    const poll = async () => {
      attempts++;
      const success = await fetchReport();

      if (success || attempts >= maxAttempts) {
        stopPolling();

        if (!success && attempts >= maxAttempts) {
          toast.warning(
            "Délai dépassé. Le compte rendu automatique n'est pas encore prêt."
          );
        }
      }
    };

    // First call immediately
    await poll();

    // Agar abhi tak nahi mila → interval start karo
    if (attempts < maxAttempts) {
      pollingIntervalRef.current = setInterval(poll, 7000); // Har 7 second
    }
  };

  // Polling Stop Function
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPolling(false);
    // setShowProgressBar(false); → fetchReport success mein already kar diya
  };

  // Main useEffect – Jab meeting load ho
  useEffect(() => {
    // Cleanup on unmount
    return () => stopPolling();
  }, []);

  //  const [transcriptProgress, setTranscriptProgress] = useState(0); // ← Real progress 0 to 100
  //  const [error,setError] = useState(null)

  //   const intervalRef = useRef(null);
  //   const startTimeRef = useRef(null);

  //   const startProgressAnimation = () => {
  //     startTimeRef.current = Date.now();
  //     setTranscriptProgress(0);

  //     // Har 120ms mein progress badhate hain (smooth + realistic)
  //     intervalRef.current = setInterval(() => {
  //       setTranscriptProgress((prev) => {
  //         // Pehle jaldi badhe, phir slow (natural feel)
  //         if (prev >= 95) return 95; // 100% pe nahi pahunchta jab tak success na ho
  //         if (prev < 30) return prev + 4;
  //         if (prev < 60) return prev + 2.5;
  //         if (prev < 85) return prev + 1.2;
  //         return prev + 0.5;
  //       });
  //     }, 120);
  //   };

  //   const stopProgressAnimation = () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //     // Final jump to 100%
  //     setTranscriptProgress(100);
  //     setTimeout(() => setTranscriptLoading(false), 300); // thoda delay for smoothness
  //   };

  //   const fetchTranscript = async () => {
  //     setTranscriptLoading(true);
  //     setError(null);
  //     setTranscriptProgress(0);
  //     startProgressAnimation();

  //     try {
  //       const response = await axios.get(
  //         `${API_BASE_URL}/get-upmeet-report/transcript/${id}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${
  //               CookieService.get("token") || CookieService.get("token")
  //             }`,
  //           },
  //         }
  //       );

  //       const data = response.data?.data;

  //       if (response?.status === 200 && data?.transcript) {
  //         setMeetingTranscript(data.transcript);
  //       } else {
  //         setError("Transcript not available.");
  //       }
  //     } catch (err) {
  //       console.error("Error:", err);
  //       setError("Failed to load transcript. Please try again.");
  //     } finally {
  //       stopProgressAnimation();
  //     }
  //   };

  //   // Cleanup on unmount
  //   useEffect(() => {
  //     return () => {
  //       if (intervalRef.current) clearInterval(intervalRef.current);
  //     };
  //   }, []);
  // Separate useEffect – Sirf meeting change hone par check karo
  // FIXED: Update your useEffect for meeting changes
  useEffect(() => {
    // Only check polling when meeting is actually updated (not null/undefined)
    if (!meeting) return;

    const shouldStartPolling =
      meeting?.voice_notes && // Voice note upload hua hai
      meeting?.prise_de_notes === "Automatic" && // Automatic selected hai
      !meeting?.meeting_notes_summary && // Summary abhi tak nahi hai
      !polling; // Polling already nahi chal rahi

    if (shouldStartPolling) {
      console.log("✅ Conditions matched → Starting AI report polling...");
      startPollingForReport();
    }

    // Agar user ne manually summary likh diya → polling cancel kar do
    if (meeting?.meeting_notes_summary && polling) {
      console.log("⚠️ Manual summary detected → Stopping polling");
      stopPolling();
    }
  }, [meeting?.voice_notes, meeting?.meeting_notes_summary, meeting?.prise_de_notes, polling]);

  // useEffect(() => {
  //   getRefreshMeeting();
  // }, [call]);
  const [loading, setLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [viewNote, setViewNote] = useState("note");

  // This is the GET API function you want to call after upload succeeds
  // const fetchNotesData = async () => {
  //   try {
  //     const token =
  //       CookieService.get("token") || CookieService.get("token");
  //     const response = await axios.get(
  //       `${API_BASE_URL}/get-upmeet-report/${id}`,
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
  // const shouldGenerateSummary = () => {
  //   return meeting?.prise_de_notes === "Automatic";
  // };
  // const handleAudioUploadSuccess = async () => {
  //   if (shouldGenerateSummary()) {
  //     // Your condition check
  //     setSummaryLoading(true);

  //     // Start polling
  //     const poll = async () => {
  //       try {
  //         const response = await fetchNotesData();

  //         if (response?.data?.upmeet_summary) {
  //           setTimeout(() => {
  //             setMeetingSummary(response.data?.upmeet_summary?.text);
  //             setMeetingTranscript(
  //               response.data?.upmeet_full_transcription?.text
  //             );
  //             setSummaryLoading(false);
  //             getRefreshedMeeting();
  //           }, 500); // Let progress complete
  //           return true;
  //         }
  //         return false;
  //       } catch (error) {
  //         console.error("Polling error:", error);
  //         return false;
  //       }
  //     };

  //     // Recursive polling with exponential backoff
  //     const startPolling = async (attempt = 0) => {
  //       const success = await poll();
  //       if (!success && attempt < 60) {
  //         // Max ~5 minutes
  //         setTimeout(
  //           () => startPolling(attempt + 1),
  //           Math.min(1000 * Math.pow(1.5, attempt), 10000)
  //         );
  //       } else if (!success) {
  //         setSummaryLoading(false);
  //         // toast.error("Summary generation is taking longer than expected. Please check back later.");
  //       }
  //     };

  //     await startPolling();
  //   }
  // };

  // useEffect(() => {
  //   handleAudioUploadSuccess();
  // }, [meeting?.voice_notes]);

  const getRefreshedMeeting = async () => {
    setIsLoading(true);
    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      const response = await axios.get(
        `${API_BASE_URL}/get-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data?.data;

        // CRITICAL: Log to verify voice_notes is in response
        console.log("📥 API Response voice_notes:", data?.voice_notes);

        setStatus(data.status);
        setHeaderTitle({ titleText: " " });
        const steps = data?.steps;
        const time = data?.start_time;

        // Update all states
        setMeeting1(data);
        setTime(data?.start_time);
        updateSteps(steps);
        setMeetingSummary(response.data?.data?.meeting_notes_summary);
        if (response?.data?.data?.prise_de_notes === "Automatic") {
          setActiveTab("meetingNotes")

        }
        setMeetingTranscript(response.data?.data?.meeting_notes_transcript);

        // CRITICAL FIX: Return the data so you can use it immediately
        return data;
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);
      if (error.response && error.response.status === 404) {
        setVisibilityMessage(error?.response?.data?.error);
        setIsPrivacyModal(true);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      getRefreshedMeeting();
    }
  }, [id, call]);

  useEffect(() => {
    if (meeting) {
      const { formattedDate: estimateDate, formattedTime: estimateTime } =
        parseAndFormatDateTime(
          meeting?.estimate_time,
          meeting?.type,
          meeting?.timezone || "Europe/Paris"
        );
      setEstimateTime(estimateTime);
      setEstimateDate(estimateDate);
    }
  }, [meeting]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

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
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(t(error.message));
    } finally {
      setFormState({});
    }
  };
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id);
    setShowConfirmationModal(true);
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
  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const sendReport = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send-report-link`,
        { meeting_id: parseInt(id) },
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.status) {
        toast.success(t("Report sent successfully"));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const loggedInUserId = CookieService.get("user_id");

  const [view, setView] = useState("grid");

  const handleToggle = () => {
    setView(view === "grid" ? "list" : "grid");
  };

  const formattedStartDate = convertDateToUserTimezone(
    meeting?.date,
    meeting?.starts_at || meeting?.start_time,
    meeting?.timezone
  );

  const filteredActions = meeting?.plan_d_actions?.reduce((acc, item) => {
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

  const guideEmails = new Set(meeting?.guides?.map((guide) => guide.email));
  const [showProfile, setShowProfile] = useState(false);

  const handleShow1 = () => {
    setShowProfile(true);
  };
  const hideShow = () => {
    setShowProfile(false);
  };

  //Host
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [showOrgProfile, setShowOrgProfile] = useState(false);

  const handleHostShow = () => {
    setShowHostProfile(true);
  };
  const hideHostShow = () => {
    setShowHostProfile(false);
  };

  const handleOrgShow = () => {
    setShowOrgProfile(true);
  };
  const hideOrgShow = () => {
    setShowOrgProfile(false);
  };

  const [modalContent, setModalContent] = useState(null);

  const openModal = (file) => {
    setModalContent(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleViewToggle = async (view) => {
    setViewNote(view);
    //   if(meeting?.meeting_notes_transcript==null && view==="transcript"){
    //   await fetchTranscript()
    // }
  };
  const [hoveredWord, setHoveredWord] = useState(null);

  // const sentences = meetingTranscriptWithTimeStamps?.timestamps;
  const sentences = groupWordsIntoSentences(
    meetingTranscriptWithTimeStamps?.timestamps
  );

  // Memoize sentences to prevent unnecessary re-renders
  const memoizedSentences = useMemo(() => sentences, [sentences]);
  // Calculate the average rating
  const validFeedbacks =
    meeting?.meeting_feedbacks?.filter((feedback) => feedback.rating > 0) || [];

  const averageRating =
    validFeedbacks.length > 0
      ? validFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
      validFeedbacks.length
      : 0;

  const editorRef = useRef(null);
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
          }
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

  // const [content, setContent] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditTitle = (meeting) => {
    setEditingField("title");
    setEditValue(meeting.title);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setEditingField(null);
        await getRefreshedMeeting();
        toast.success(t("Updated successfully"));
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const [uploadStage, setUploadStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [audioUploadStage, setAudioUploadStage] = useState(false);
  // FIXED: Update your uploadAudioToCloudinary function
  const uploadAudioToCloudinary = async (newBlob) => {
    setShowProgressBar(true);
    setAudioUploadStage(true)
    setProgress(0);
    setUploadStage(t("note_translation.Uploading audio"));
    // Start progress animation
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    setActiveTab("meetingNotes")
    try {
      // Create separate FormData objects for each endpoint
      const upmeetFormData = new FormData();
      const audioRouteFormData = new FormData();

      // Common meeting ID
      upmeetFormData.append("meeting_id", id);
      audioRouteFormData.append("meeting_id", id);

      // Different field names for the audio file
      const audioFile = new File([newBlob], "audio.wav", { type: "audio/wav" });
      upmeetFormData.append("file", audioFile);
      audioRouteFormData.append("voice_notes", audioFile);

      const token =
        CookieService.get("token") || CookieService.get("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Retry configuration
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second

      // Function to make request with retries
      const makeRequestWithRetry = async (url, data, attempts = 0) => {
        try {
          const response = await axios.post(url, data, { headers });
          return response;
        } catch (error) {
          if (attempts < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * (attempts + 1))
            );
            return makeRequestWithRetry(url, data, attempts + 1);
          }
          throw error;
        }
      };

      // Start both uploads in parallel
      const [upmeetResponse, audioRouteResponse] = await Promise.all([
        makeRequestWithRetry(`${API_BASE_URL}/upmeet-upload`, upmeetFormData),
        makeRequestWithRetry(`${API_BASE_URL}/audio-route`, audioRouteFormData),
      ]);

      // Check both responses (accepting 200 or 201 status codes)
      const upmeetSuccess =
        upmeetResponse?.status === 200 || upmeetResponse?.status === 201;
      const audioRouteSuccess =
        audioRouteResponse?.status === 200 ||
        audioRouteResponse?.status === 201;

      if (upmeetSuccess && audioRouteSuccess) {
        setProgress(95);
        setAudioUploadStage(false)
        setUploadStage(t("note_translation.Processing Notes"));

        // CRITICAL FIX: Wait for meeting data and use it immediately
        const updatedMeetingData = await getRefreshedMeeting();

        console.log("✅ Updated meeting data:", updatedMeetingData);
        console.log("✅ Voice notes from fresh data:", updatedMeetingData?.voice_notes);

        // CRITICAL FIX: Check polling condition using fresh data
        const shouldStartPolling =
          updatedMeetingData?.voice_notes && // Fresh voice note check
          updatedMeetingData?.prise_de_notes === "Automatic" &&
          !updatedMeetingData?.meeting_notes_summary;

        if (shouldStartPolling) {
          console.log("🎯 Starting polling with fresh meeting data");
          await pollForReport();
        } else {
          console.log("⚠️ Polling conditions not met:", {
            hasVoiceNotes: !!updatedMeetingData?.voice_notes,
            isAutomatic: updatedMeetingData?.prise_de_notes === "Automatic",
            hasSummary: !!updatedMeetingData?.meeting_notes_summary
          });
        }
      } else {
        throw new Error("One or more uploads failed");
      }
    } catch (error) {
      console.error("❌ Error uploading audio:", error);
      toast.error("Audio uploading failed!");
      toast.error(error?.response?.data?.message || error.message);
      throw new Error("Failed to upload audio");
    } finally {
      clearInterval(interval);
      setProgress(100);
      setUploadStage("");
      setTimeout(() => setShowProgressBar(false), 500);
    }
  };


  const pollForReport = async () => {
    const maxAttempts = 5000; // 30 attempts
    const delay = 60000; // 1 min between attempts
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      const success = await fetchReport();
      if (success) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error("Timeout waiting for report");
  };

  const [activeTab, setActiveTab] = useState("casting");

  // Initialize active tab from local storage
  useEffect(() => {
    const savedTab = CookieService.get("meetingActiveTab") || "casting";
    if (
      savedTab &&
      [
        "casting",
        "steps",
        // "stepNotes",
        "meetingNotes",
        "files",
        "feedbacks",
      ].includes(savedTab)
    ) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save to local storage when tab changes
  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    CookieService.set("meetingActiveTab", tab);
  };

  const [editingStepId, setEditingStepId] = useState(null);
  const [currentNote, setCurrentNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [pageViews, setPageViews] = useState(0);

  useEffect(() => {
    const pageId = `${userId}/${meeting?.id}`;
    if (!pageId) return;
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
  }, [meeting?.id]);

  // Add global CSS for blur effect
  const styles = `
  .custom-blur-backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 1050; /* Ensure backdrop is above main modal */
  }
  .custom-blur-backdrop + .modal {
    z-index: 1060; /* Confirmation modal above backdrop */
  }
`;

  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading1, setLoading1] = useState(false); // State for progress bar
  const [progress1, setProgress1] = useState(0); // Progress bar percentage
  const [value, setValue] = useState(null);
  const [selectedAI, setSelectedAI] = useState("mistral"); // default mistral
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  // New state and constant for Automatic Prompt
  const [isAutomaticPrompt, setIsAutomaticPrompt] = useState(false);
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

  // Sync state with API when modal opens
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (showInstructionModal && loggedInUserId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${loggedInUserId}`, {
            headers: { Authorization: `Bearer ${CookieService.get("token")}` },
          });

          if (response?.status === 200) {
            const userData = response.data?.data;
            const isEnabled = userData?.is_report_prompt_enabled === 1 || userData?.is_report_prompt_enabled === true;
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

  const [allMeetings, setAllMeetings] = useState(null);
  const fetchMeetings = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/meeting-report-pdf-data/${meeting?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        console.log("response", response);
        const meetings = response.data?.data;
        setAllMeetings(meetings);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    // if (activeTab === "meetingNotes") {
    if (meeting?.id) {
      fetchMeetings();
      // }
    }
  }, [meeting?.id]);

  const handleValidate = async () => {
    setLoading1(true);
    setProgress1(0);

    // Simulate progress bar animation
    const progressInterval = setInterval(() => {
      setProgress1((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    // API endpoint based on selected AI
    const apiEndpoint =
      selectedAI === "mistral"
        ? `${API_BASE_URL}/generate-ai-summary`
        : `${API_BASE_URL}/generate-ai-summary`; // Claude API endpoint

    const payload = {
      meeting_id: id,
      ai_medium: selectedAI, // dynamic AI selection
      instruction: value,
      is_report_prompt_enabled: isAutomaticPrompt ? 1 : 0,
    };

    try {
      const response = await axios.post(apiEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      clearInterval(progressInterval);
      setProgress1(100);

      setTimeout(() => {
        setLoading1(false);
        if (response?.status === 200 || response?.status === 201) {
          setShowInstructionModal(false);
          getRefreshedMeeting();
          setValue(null);
        }
      }, 300);
    } catch (error) {
      console.error("API Error:", error);
      clearInterval(progressInterval);
      setProgress1(100);
      setTimeout(() => {
        setLoading1(false);
      }, 300);
    } finally {
      fetchMeetings()
    }
  };
  const handleAddParticipant = (item) => {
    setCheckId(item?.id);
    setAddParticipant(true);
    setMeeting(item);
    handleShow();
  };

  const logo = meeting?.destination?.clients?.client_logo;


  // Add this helper function for file size formatting
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  // Get full name from different sources
  // const getFullName = () => {
  //   if (
  //     meeting?.type === "Google Agenda Event" ||
  //     meeting?.type === "Outlook Agenda Event"
  //   ) {
  //     return (
  //       meeting?.event_organizer?.full_name ||
  //       meeting?.event_organizer?.email ||
  //       "N/A"
  //     );
  //   } else {
  //     return meeting?.user?.full_name || "N/A";
  //   }
  // };

  const formatDateTimeWithTimezone = (
    dateString,
    timezone,
    format = "DD/MM/YYYY [à] HH[h]mm"
  ) => {
    if (!dateString) return "N/A";
    return moment(dateString)
      .tz(timezone || "Europe/Paris")
      .format(format);
  };

  const getPresence = (participant) => {
    if (participant.attendance === true || participant.attendance === "present")
      return "✓";
    if (participant.attendance === false || participant.attendance === "absent")
      return "✗";
    return "✗"; // default absent
  };

  // FIXED loadImage function that returns base64 data
  const generateInitialsAvatar = async (name = "NA", size = 200) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Beautiful fixed colors like ui-avatars
      const colors = [
        "#1E88E5", "#43A047", "#FB8C00", "#E53935",
        "#8E24AA", "#00ACC1", "#F4511E", "#3949AB",
        "#7CB342", "#IL8E33", "#D81B60", "#00897B"
      ];

      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = colors[Math.abs(hash) % colors.length];

      // Background circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Initials
      const words = name.trim().split(/\s+/);
      let initials = "NA";
      if (words.length >= 2) {
        initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
      } else if (words[0]) {
        initials = words[0].substring(0, 2).toUpperCase();
      }

      ctx.font = `bold ${size * 0.38}px Arial, Helvetica, sans-serif`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, size / 2, size / 2 + 5);

      resolve(canvas.toDataURL("image/png"));
    });
  };

  // FIXED loadImage function → ab ye circle mein crop karke dega
  const loadImage = (url) => {
    return new Promise((resolve) => {
      if (
        !url ||
        url === "undefined" ||
        url === "null" ||
        url === "https://undefined" ||
        url === "https://null"
      ) {
        resolve(null);
        return;
      }

      const img = new Image();

      // Better CORS handling
      img.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        console.warn(`Image loading timeout: ${url}`);
        resolve(null);
      }, 15000); // Increased timeout further

      img.onload = () => {
        clearTimeout(timeout);
        console.log(
          `Image loaded successfully: ${url}, dimensions: ${img.width}x${img.height}`
        );

        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;

          // Fill with white background first (for PNG transparency issues)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Determine format based on file extension and MIME type support
          let dataURL;
          let format = "JPEG";

          // Check file extension and try appropriate format
          const urlLower = url.toLowerCase();

          if (urlLower.includes(".png")) {
            try {
              dataURL = canvas.toDataURL("image/png");
              format = "PNG";
              console.log(`Using PNG format for: ${url}`);
            } catch (e) {
              console.warn(
                `PNG failed, falling back to JPEG for: ${url}`,
                e
              );
              dataURL = canvas.toDataURL("image/jpeg", 0.9);
              format = "JPEG";
            }
          } else if (urlLower.includes(".webp")) {
            try {
              // WebP to PNG conversion
              dataURL = canvas.toDataURL("image/png");
              format = "PNG";
              console.log(`Converted WebP to PNG for: ${url}`);
            } catch (e) {
              console.warn(
                `WebP conversion failed, using JPEG for: ${url}`,
                e
              );
              dataURL = canvas.toDataURL("image/jpeg", 0.9);
              format = "JPEG";
            }
          } else {
            // Default to JPEG for other formats
            dataURL = canvas.toDataURL("image/jpeg", 0.9);
            format = "JPEG";
            console.log(`Using JPEG format for: ${url}`);
          }

          resolve({
            img,
            dataURL: dataURL,
            format: format,
            width: img.width,
            height: img.height,
            originalUrl: url,
          });
        } catch (error) {
          console.error(`Error in canvas processing for: ${url}`, error);
          resolve(null);
        }
      };

      img.onerror = (error) => {
        clearTimeout(timeout);
        console.warn(`Failed to load image: ${url}`, error);

        // Try alternative approach for CORS issues
        if (url.includes("amazonaws.com") || url.includes("s3.")) {
          console.log(`Trying alternative CORS approach for: ${url}`);
          // You might need to implement a proxy or server-side solution here
        }

        resolve(null);
      };

      // Enhanced URL handling for CORS
      let finalUrl = url;
      if (url.includes("amazonaws.com") || url.includes("s3.")) {
        // For S3 URLs, try to ensure CORS headers are respected
        finalUrl =
          url + (url.includes("?") ? "&" : "?") + "timestamp=" + Date.now();
      } else {
        finalUrl =
          url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
      }

      console.log(`Loading image from: ${finalUrl}`);
      img.src = finalUrl;
    });
  };



  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Helper to convert DataURL to Uint8Array for docx
  const dataURLToUint8Array = (dataURL) => {
    if (!dataURL) return null;
    try {
      const parts = dataURL.split(',');
      const base64Data = parts.length > 1 ? parts[1] : parts[0]; // Handle cases with/without prefix
      if (!base64Data) return null;

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      console.error("Error converting DataURL to Uint8Array", e);
      return null;
    }
  };


  // Helper function to format content with proper bullets and spacing
  const formatContentForPDF = (content) => {
    if (!content) return '';

    // Split by lines and process each
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const formatted = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Replace asterisks with bullet points
      let cleanLine = line
        .replace(/^\*\s+/, '• ')  // Replace leading * with bullet
        .replace(/^\-\s+/, '• ')  // Replace leading - with bullet
        .trim();

      if (cleanLine) {
        // Add subtle spacing between major bullet points for readability
        if (i > 0 && cleanLine.startsWith('•') && !lines[i - 1].startsWith('*') && !lines[i - 1].startsWith('-')) {
          formatted.push(''); // Empty line before new section
        }
        formatted.push(cleanLine);
      }
    }

    return formatted.join('\n');
  };

  // Helper to format meeting time
  const formatMeetingTime = (meetingItem) => {
    try {
      const date = moment(meetingItem.date, "YYYY-MM-DD").format("DD/MM/YYYY");
      let time = "";
      if (meetingItem.start_time) {
        time = convertTo12HourFormat(
          meetingItem.start_time,
          meetingItem.date,
          meetingItem.steps || [],
          meetingItem.timezone || meeting?.timezone
        );
      }
      return time ? `${date} à ${time}` : date;
    } catch (error) {
      return meetingItem.date ? moment(meetingItem.date, "YYYY-MM-DD").format("DD/MM/YYYY") : "N/A";
    }
  };

  // Get full name helper
  const getFullName = () => {
    if (meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event") {
      return meeting?.event_organizer?.full_name || meeting?.event_organizer?.email || "N/A";
    }
    return meeting?.user?.full_name || "N/A";
  };

  // Parse meeting summary into chapters
  const parseMeetingChapters = (summary) => {
    if (!summary) return {};

    const CHAPTERS = [
      { key: "GÉNÉRALITÉS", title: "1. GÉNÉRALITÉS", alternates: ["GENERALITES"] },
      { key: "POINT MOA", title: "2. POINT MOA (Maîtrise d'Ouvrage)", alternates: ["MOA", "POINT MOA (Maîtrise d'Ouvrage)"] },
      { key: "POINT HYGIÈNE ET SÉCURITÉ", title: "3. POINT HYGIÈNE ET SÉCURITÉ", alternates: ["HYGIENE", "SECURITE", "POINT HYGIENE ET SECURITE"] },
      // { key: "POINT MOA", title: "2. POINT MOA (Maîtrise d'Ouvrage)", alternates: ["MOA"] },
      // { key: "POINT HYGIÈNE ET SÉCURITÉ", title: "3. POINT HYGIÈNE ET SÉCURITÉ", alternates: ["HYGIENE", "SECURITE"] },
      { key: "POINT ÉTUDES", title: "4. POINT ÉTUDES", alternates: ["ETUDES", "POINT ETUDES"] },
      { key: "POINT CONTRÔLEUR TECHNIQUE", title: "5. POINT CONTRÔLEUR TECHNIQUE", alternates: ["CONTROLEUR", "TECHNIQUE", "POINT CONTROLEUR TECHNIQUE"] },
      { key: "POINT TRAVAUX", title: "6. POINT TRAVAUX", alternates: ["TRAVAUX"] },
      { key: "POINT PROJETS EN INTERFACE", title: "7. POINT PROJETS EN INTERFACE", alternates: ["PROJETS", "INTERFACE"] },
      { key: "POINT QUALITÉ", title: "8. POINT QUALITÉ", alternates: ["QUALITE", "POINT QUALITE"] },
      { key: "POINT AVANCEMENT", title: "9. POINT AVANCEMENT", alternates: ["AVANCEMENT"] },
      { key: "POINT CONCESSIONNAIRES", title: "10. POINT CONCESSIONNAIRES", alternates: ["CONCESSIONNAIRES"] },
      { key: "POINT ADMINISTRATIF", title: "11. POINT ADMINISTRATIF", alternates: ["ADMINISTRATIF"] },
      { key: "REPORTAGE PHOTOGRAPHIQUE", title: "12. REPORTAGE PHOTOGRAPHIQUE", alternates: ["REPORTAGE", "PHOTOGRAPHIQUE"] }
    ];

    const chapters = {};
    const lines = summary.split('\n');
    let currentChapter = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Remove markdown headers (##, ###, etc.) for matching
      const cleanLine = trimmedLine.replace(/^#{1,6}\s*\*?\*?/, '').trim();

      // Check if this line is a chapter header (flexible matching)
      const chapterMatch = CHAPTERS.find(ch => {
        // Strict Match by key or alternates
        const upperCleanLine = cleanLine.toUpperCase();

        // Check if line exactly matches key or one of alternates
        if (upperCleanLine === ch.key.toUpperCase() || ch.alternates.some(alt => upperCleanLine === alt.toUpperCase())) {
          return true;
        }

        // Check number pattern (e.g., "1. GÉNÉRALITÉS")
        const numberMatch = cleanLine.match(/^\d+\.\s*(.+)/);
        if (numberMatch) {
          const contentAfterNumber = numberMatch[1].trim().toUpperCase();
          return contentAfterNumber === ch.key.toUpperCase() || ch.alternates.some(alt => contentAfterNumber === alt.toUpperCase());
        }

        return false;
      });

      if (chapterMatch) {
        // Save previous chapter if exists
        if (currentChapter && currentContent.length > 0) {
          const contentText = currentContent.join('\n').trim();
          if (contentText && !contentText.toLowerCase().includes('non applicable')) {
            chapters[currentChapter] = contentText;
          }
        }
        // Start new chapter
        currentChapter = chapterMatch.key;
        currentContent = [];
      } else if (currentChapter && trimmedLine) {
        // Skip "Non applicable" lines and empty sub-headers
        const isNonApplicable = trimmedLine.toLowerCase().includes('non applicable');

        if (!isNonApplicable && trimmedLine !== '---' && trimmedLine !== '**') {
          // Clean up markdown formatting
          let cleanedLine = line
            .replace(/\*\*\*\*/g, '') // Remove bold markers
            .replace(/\*\*/g, '')     // Remove bold markers
            .replace(/^#{1,6}\s*/, '') // Remove header markers
            .trim();

          if (cleanedLine) {
            currentContent.push(cleanedLine);
          }
        }
      }
    }

    // Save last chapter
    if (currentChapter && currentContent.length > 0) {
      const contentText = currentContent.join('\n').trim();
      if (contentText && !contentText.toLowerCase().includes('non applicable')) {
        chapters[currentChapter] = contentText;
      }
    }

    return chapters;
  };

  const exportToPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 15;
      let y = 15;

      // Define Blue Color Constant for consistency
      const THEME_COLOR = [0, 102, 204];

      // Define all possible chapters in order
      const CHAPTERS = [
        { key: "GÉNÉRALITÉS", title: "1. GÉNÉRALITÉS", alternates: ["GENERALITES"] },
        { key: "POINT MOA", title: "2. POINT MOA (Maîtrise d'Ouvrage)", alternates: ["MOA"] },
        { key: "POINT HYGIÈNE ET SÉCURITÉ", title: "3. POINT HYGIÈNE ET SÉCURITÉ", alternates: ["HYGIENE", "SECURITE"] },
        { key: "POINT ÉTUDES", title: "4. POINT ÉTUDES", alternates: ["ETUDES", "POINT ETUDES"] },
        { key: "POINT CONTRÔLEUR TECHNIQUE", title: "5. POINT CONTRÔLEUR TECHNIQUE", alternates: ["CONTROLEUR", "TECHNIQUE"] },
        { key: "POINT TRAVAUX", title: "6. POINT TRAVAUX", alternates: ["TRAVAUX"] },
        { key: "POINT PROJETS EN INTERFACE", title: "7. POINT PROJETS EN INTERFACE", alternates: ["PROJETS", "INTERFACE"] },
        { key: "POINT QUALITÉ", title: "8. POINT QUALITÉ", alternates: ["QUALITE"] },
        { key: "POINT AVANCEMENT", title: "9. POINT AVANCEMENT", alternates: ["AVANCEMENT"] },
        { key: "POINT CONCESSIONNAIRES", title: "10. POINT CONCESSIONNAIRES", alternates: ["CONCESSIONNAIRES"] },
        { key: "POINT ADMINISTRATIF", title: "11. POINT ADMINISTRATIF", alternates: ["ADMINISTRATIF"] },
        { key: "REPORTAGE PHOTOGRAPHIQUE", title: "12. REPORTAGE PHOTOGRAPHIQUE", alternates: ["REPORTAGE", "PHOTOGRAPHIQUE"] }
      ];

      // GET LOGO
      let logoDataURL = null;
      if (logo && logo.startsWith("https")) {
        const img = await loadImage(logo);
        if (img?.dataURL) {
          logoDataURL = img.dataURL;
        }
      }
      if (!logoDataURL) {
        const clientName = meeting?.destination?.clients?.name ||
          meeting?.clients?.name ||
          meeting?.destination?.name ||
          "Client";
        logoDataURL = await generateInitialsAvatar(clientName, 200);
      }

      // Header function
      const addHeader = () => {
        doc.addImage(logoDataURL, "PNG", left, 12, 25, 25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(meeting?.objective || "", pageWidth - left, 25, { align: "right" });

        // --- CHANGED TO BLUE ---
        doc.setDrawColor(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2]);
        doc.setLineWidth(1.5);
        doc.line(left, 40, pageWidth - left, 40);
      };

      // Footer
      const addFooter = (pageNum) => {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      };

      // Format date text (keep your existing logic)
      let dateText = "";
      if (meeting?.type === "Action1" || meeting?.type === "Newsletter") {
        if (meeting?.status === "abort") {
          dateText = `Réunion du ${formattedStartDate} - ${meeting?.abort_end_time
            ? abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)
            : estimateDate
            }`;
        } else {
          dateText = `Réunion du ${formattedStartDate} - ${estimateDate}`;
        }
      } else if (meeting?.type === "Special" || meeting?.type === "Law") {
        dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )} - ${estimateDate} à ${specialMeetingEndTime(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )}`;
      } else {
        if (meeting?.status === "abort") {
          if (meeting?.abort_end_time) {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)} à ${abortMeetingTime(meeting?.abort_end_time, "HH[h]mm", meeting?.timezone) || "N/A"
              }`;
          } else {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${estimateDate} à ${estimateTime || "N/A"}`;
          }
        } else {
          dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
            meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
            meeting?.date, meeting?.steps, meeting?.timezone
          )} - ${estimateDate} à ${estimateTime || "N/A"}`;
        }
      }

      // Prepare all meetings data
      const allMeetingReports = allMeetings?.previous_meetings || [];
      const currentMeetingReport = {
        date: meeting?.date,
        start_time: meeting?.start_time,
        meeting_notes_summary: meeting?.meeting_notes_summary || markdownContent,
        title: meeting?.title || "Réunion Actuelle",
        steps: meeting?.steps,
        timezone: meeting?.timezone,
      };

      const allMeetingsList = [...allMeetingReports, currentMeetingReport]
        .filter((m) => m.date)
        .sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          if (dateDiff !== 0) return dateDiff;
          return (a.start_time || "").localeCompare(b.start_time || "");
        });

      // Parse all meetings into chapters structure
      const meetingsByChapter = {};
      allMeetingsList.forEach(meetingItem => {
        const chapters = parseMeetingChapters(meetingItem.meeting_notes_summary);
        console.log(`Meeting ${meetingItem.date}: Found ${Object.keys(chapters).length} chapters`, chapters);

        Object.entries(chapters).forEach(([chapterKey, content]) => {
          if (!meetingsByChapter[chapterKey]) {
            meetingsByChapter[chapterKey] = [];
          }
          meetingsByChapter[chapterKey].push({
            date: formatMeetingTime(meetingItem),
            content: content
          });
        });
      });

      console.log('Final meetingsByChapter structure:', meetingsByChapter);

      // FIRST PAGE - Header and Info
      addHeader();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(meeting?.title || "Compte Rendu", left, y + 35);
      doc.text(String(allMeetings?.no_of_moment ?? ""), pageWidth - left, y + 35, { align: "right" });
      y += 47;

      doc.setFontSize(12);
      doc.text(dateText, pageWidth / 2, y, { align: "center" });
      y += 20;

      // Information Table
      autoTable(doc, {
        startY: y,
        theme: "grid",
        // --- CHANGED TO BLUE ---
        headStyles: { fillColor: THEME_COLOR, textColor: 255, fontStyle: "bold", cellPadding: 6 },
        head: [[
          "Nature de la réunion :",
          meeting?.solution ? meeting?.solution?.title : meeting?.type,
        ]],
        body: [
          ["Date de la réunion :", dateText],
          // [`${t("moment_type")} :`, meeting?.solution ? meeting?.solution?.title : meeting?.type],
          [`${t("address")} :`, meeting?.address || "N/A"],
          ["Date de la prochaine réunion :",
            allMeetings?.date_of_next_moment
              ? formatDateTimeWithTimezone(
                allMeetings.date_of_next_moment,
                allMeetings.next_moment_timezone || meeting?.timezone
              )
              : "N/A"
          ],
          ["Organisateur :", getFullName()],
        ],
        styles: { fontSize: 10, cellPadding: 4 },
      });

      y = doc.lastAutoTable.finalY + 15;

      // Participants Table
      const participantsData = (meeting?.user_with_participants || []).map((p) => {
        const baseName =
          p?.full_name ||
          [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
          "N/A";

        // Name + post on next line with arrow and brackets
        const name = p?.post
          ? `${baseName}\n(${p.post})`
          : baseName;

        const phone = p?.phone_number || p?.phone_no || "N/A";

        // Coords WITHOUT post
        const coords = `${p?.email || "N/A"}\n${phone}`;

        return [
          // p?.team_names?.join(", ") || "Tektime Dev Team",
          p?.job || "N/A",
          p?.user_id ? p?.clients?.name : p?.contact?.clients?.name || "N/A",
          name,
          coords,
          p?.attandance === 1 ? "__CHECKMARK__" : "X",
        ];
      });

      autoTable(doc, {
        startY: y,
        theme: "grid",
        // --- CHANGED TO BLUE ---
        headStyles: { fillColor: THEME_COLOR, textColor: 255, fontStyle: "bold", fontSize: 9, cellPadding: 5 },
        head: [["Fonction", "Société", "Représentants", "Coordonnées", "Prés."]],
        body: participantsData,
        styles: { fontSize: 9, cellPadding: 3 },
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index === 4) {
            if (data.cell.raw === "__CHECKMARK__") {
              data.cell.text = []; // Clear text
              data.cell.styles.customCheck = true; // Mark for drawing
            }
          }
        },
        didDrawCell: function (data) {
          if (data.cell.styles.customCheck) {
            const x = data.cell.x + data.cell.width / 2;
            const y = data.cell.y + data.cell.height / 2;

            doc.setDrawColor(0, 128, 0); // Green
            doc.setLineWidth(0.8);
            // Draw Checkmark
            doc.line(x - 1.5, y, x - 0.5, y + 1.5);
            doc.line(x - 0.5, y + 1.5, x + 2.5, y - 2);
          }
        },
      });

      // Check if any chapters were detected
      const hasChapters = Object.keys(meetingsByChapter).length > 0;

      if (hasChapters) {
        // NEW: CHAPTERS SECTION (organized by chapter, then by meeting date in TABLE format)
        doc.addPage();
        addHeader();
        y = 50;

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Comptes Rendus par Chapitre", pageWidth / 2, y, { align: "center" });
        y += 15;

        // Iterate through each chapter in order
        for (const chapter of CHAPTERS) {
          const chapterData = meetingsByChapter[chapter.key];

          // Skip chapters with no content
          if (!chapterData || chapterData.length === 0) continue;

          // Check if we need a new page for chapter title
          if (y > pageHeight - 60) {
            doc.addPage();
            addHeader();
            y = 50;
          }

          // Chapter Title (above table) - FIXED VERTICAL ALIGNMENT
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");

          // --- CHANGED TO BLUE ---
          doc.setFillColor(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2]);

          doc.rect(left, y, pageWidth - 2 * left, 12, "F"); // Background box
          doc.setTextColor(255, 255, 255); // White text
          doc.text(chapter.title, left + 5, y + 8, { baseline: "middle" }); // Centered vertically
          y += 14;
          doc.setTextColor(0, 0, 0); // Reset to black

          // Prepare table data for this chapter with formatted content
          const tableData = chapterData.map(meetingData => {
            return [
              `Réunion du ${meetingData.date}`,
              formatContentForPDF(meetingData.content)
            ];
          });

          // Draw table for this chapter with improved formatting
          autoTable(doc, {
            startY: y,
            theme: "grid",
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: "bold",
              fontSize: 11,
              halign: "center",
              cellPadding: 5,
            },
            columnStyles: {
              0: {
                cellWidth: 45,  // Date column
                fontStyle: "bold",
                halign: "left",
                valign: "top",
                fontSize: 10,
              },
              1: {
                // cellWidth: "auto", // Removed fixed calculation to let it fill remaining space
                halign: "left",
                valign: "top",
                fontSize: 10,  // Increased from 8 to 10
                lineHeight: 1.5,  // Better line spacing
              },
            },
            styles: {
              cellPadding: 6,  // Increased padding
              overflow: "linebreak",
              valign: "top",
              lineColor: [200, 200, 200],
              lineWidth: 0.1,
              minCellHeight: 15,  // Minimum cell height
            },
            head: [["Date de Réunion", "Contenu"]],
            body: tableData,
            pageBreak: "auto",
            rowPageBreak: "auto",
            margin: { left: left, right: left },

            // Custom cell rendering for better bullet formatting
            didParseCell: function (data) {
              if (data.column.index === 1 && data.section === 'body') {
                // Add extra padding for content cells
                data.cell.styles.cellPadding = { top: 8, right: 6, bottom: 8, left: 6 };
              }
            },

            // Add header on every new page created by autoTable
            didDrawPage: (data) => {
              const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
              if (data.pageNumber === currentPage && data.pageNumber > 1) {
                addHeader();
              }
            },
          });

          y = doc.lastAutoTable.finalY + 20; // Increased space after table before next chapter
        }
      } else {
        // FALLBACK: Chronological List (No Chapters)
        doc.addPage();
        addHeader();
        y = 50;

        // Title + Meeting No
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(meeting?.title || "Compte Rendu", left, y);
        doc.text(String(allMeetings?.no_of_moment ?? ""), pageWidth - left, y, {
          align: "right",
        });
        y += 12;

        // Date text in center
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(dateText, pageWidth / 2, y, { align: "center" });
        y += 20;

        if (allMeetingsList.length > 0) {
          const meetingsData = allMeetingsList.map((m) => {
            const dateTime = formatMeetingTime(m);
            let summary = "Aucun compte-rendu disponible";
            if (m.meeting_notes_summary) {
              summary = m.meeting_notes_summary
                .replace(/#{1,6}\s?/g, "")
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/`/g, "")
                .trim();
            }
            return [dateTime, summary];
          });

          autoTable(doc, {
            startY: y,
            theme: "grid",
            // --- CHANGED TO BLUE ---
            headStyles: {
              fillColor: THEME_COLOR,
              textColor: 255,
              fontStyle: "bold",
              fontSize: 9,
              halign: "center",
              cellPadding: 4,
            },
            columnStyles: {
              0: {
                cellWidth: 25, // Slightly wider to accommodate date + time
                halign: "center",
                fontStyle: "bold",
                valign: "middle",
                cellPadding: 2,
                fontSize: 7,
              },
              1: {
                // cellWidth: "auto", // Removed fixed calculation
                valign: "top",
                cellPadding: 2,
              },
            },
            styles: {
              fontSize: 7.5,
              cellPadding: 3,
              overflow: "linebreak",
              valign: "top",
            },
            head: [["Date & Heure", "Résumé"]], // Updated header to reflect time
            body: meetingsData,
            pageBreak: "auto",
            rowPageBreak: "auto",
            margin: { left: left, right: left },

            // This is the KEY: Header on every new page created by autoTable
            didDrawPage: (data) => {
              // Only add header if it's a new page created by autoTable
              const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
              if (data.pageNumber === currentPage) {
                addHeader(); // This works perfectly because logo is already cached
              }
            },
          });
          y = doc.lastAutoTable.finalY + 20;
        } else {
          doc.setFontSize(11);
          doc.setFont("helvetica", "italic");
          doc.text("Aucune réunion précédente disponible.", left, y);
          y += 20;
        }
      }

      // Media Files Page
      if (allMeetings?.steps_media && allMeetings.steps_media.length > 0) {
        doc.addPage();
        addHeader();
        y = 50;

        const imageFiles = allMeetings.steps_media.filter(
          (file) => file.mime_type?.startsWith("image/") || file.file_type === "image"
        );
        const otherFiles = allMeetings.steps_media.filter(
          (file) => !file.mime_type?.startsWith("image/") && file.file_type !== "image"
        );

        // Display Images
        if (imageFiles.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Images", left, y);
          y += 10;

          let x = left;
          let imagesPerRow = 0;

          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];

            if (imagesPerRow === 2) {
              y += 75;
              x = left;
              imagesPerRow = 0;
            }

            if (y > 250) {
              doc.addPage();
              addHeader();
              y = 50;
              x = left;
              imagesPerRow = 0;
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text("Images (suite)", left, y);
              y += 10;
            }

            try {
              const imgResult = await loadImage(file.file_url);

              if (imgResult && imgResult.img) {
                const aspectRatio = imgResult.img.width / imgResult.img.height;
                let imgWidth = 85;
                let imgHeight = 60;

                if (aspectRatio > 1) {
                  imgHeight = imgWidth / aspectRatio;
                } else {
                  imgWidth = imgHeight * aspectRatio;
                }

                const xOffset = x + (85 - imgWidth) / 2;
                const yOffset = y + (60 - imgHeight) / 2;

                doc.addImage(imgResult.img, imgResult.format, xOffset, yOffset, imgWidth, imgHeight);
              } else {
                throw new Error("Failed to load image");
              }

              doc.setFontSize(8);
              doc.setTextColor(100);
              const fileName = file.original_name || file.file_name || "Unnamed Image";
              const truncatedName = fileName.length > 20 ? fileName.substring(0, 20) + "..." : fileName;
              doc.text(truncatedName, x + 42.5, y + 67, { align: "center" });

              doc.setFontSize(6);
              const fileSize = file.file_size ? formatFileSize(file.file_size) : "Size unknown";
              doc.text(fileSize, x + 42.5, y + 72, { align: "center" });
              doc.setTextColor(0, 0, 0);
            } catch (error) {
              doc.setDrawColor(200, 200, 200);
              doc.setFillColor(240, 240, 240);
              doc.rect(x, y, 85, 60, "F");
              doc.rect(x, y, 85, 60);
              doc.setFontSize(8);
              doc.setTextColor(150, 150, 150);
              doc.text("Image non disponible", x + 42.5, y + 25, { align: "center" });

              const fileName = file.original_name || file.file_name || "Unnamed";
              const truncatedName = fileName.length > 20 ? fileName.substring(0, 20) + "..." : fileName;
              doc.text(truncatedName, x + 42.5, y + 35, { align: "center" });
              doc.setTextColor(0, 0, 0);
            }

            x += 95;
            imagesPerRow++;

            if (i === imageFiles.length - 1) {
              y += 80;
            }
          }
        }

        // Display Other Files (videos, etc.)
        if (otherFiles.length > 0) {
          if (y > 200) {
            doc.addPage();
            addHeader();
            y = 50;
          }

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Autres Fichiers", left, y);
          y += 10;

          // Array to store link positions (x, y, width, height, url)
          const linkPositions = [];

          const body = otherFiles.map((file, index) => {
            const fileUrl = file.file_url;

            let fileType = "Inconnu";
            if (file.mime_type) fileType = (file.mime_type.split("/")[1] || file.mime_type).toUpperCase();
            else if (file.file_type) fileType = file.file_type.toUpperCase();

            return [
              index + 1,
              file.original_name || file.file_name || "Fichier sans nom",
              fileType,
              file.file_size ? formatFileSize(file.file_size) : "Inconnue",
              "Cliquez ici"  // Plain text— we'll make it clickable via hook
            ];
          });

          autoTable(doc, {
            startY: y,
            theme: "grid",
            // --- CHANGED TO BLUE ---
            headStyles: {
              fillColor: THEME_COLOR,
              textColor: 255,
              fontStyle: "bold",
              fontSize: 9
            },
            bodyStyles: {
              fontSize: 8,
              cellPadding: 4,
              textColor: [0, 0, 200]  // Blue text for "link" feel
            },
            columnStyles: {
              0: { cellWidth: 15 },
              1: { cellWidth: 65 },
              2: { cellWidth: 25 },
              3: { cellWidth: 25 },
              4: { cellWidth: 40, halign: "center" }  // Link column
            },
            head: [["#", "Nom du Fichier", "Type", "Taille", "Télécharger"]],
            body: body,
            // Magic hook: Capture positions for the 5th column (Télécharger) cells
            didDrawCell: function (data) {
              if (data.column.index === 4 && data.section === 'body') {  // Only body rows, 5th column
                linkPositions.push({
                  x: data.cell.x + 2,      // Slight padding for clickable area
                  y: data.cell.y + 2,
                  width: data.cell.width - 4,
                  height: data.cell.height - 4,
                  url: otherFiles[data.row.index].file_url  // Match URL to this row
                });
              }
            }
          });

          linkPositions.forEach(pos => {
            doc.link(pos.x, pos.y, pos.width, pos.height, { url: pos.url });
          });

          y = doc.lastAutoTable.finalY + 10;
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("* Cliquez sur « Cliquez ici » pour ouvrir/télécharger le fichier", left, y);
          doc.setTextColor(0, 0, 0);
        }
      }

      // Add footer to ALL pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i);
      }

      // Save PDF
      const fileName = `Compte_Rendu_${meeting?.title || "Meeting"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      console.log("PDF généré avec succès!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportSingleReportToPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 15;
      let y = 15;
      const THEME_COLOR = [0, 102, 204];

      // Format date text
      let dateText = "";
      if (meeting?.type === "Action1" || meeting?.type === "Newsletter") {
        if (meeting?.status === "abort") {
          dateText = `Réunion du ${formattedStartDate} - ${meeting?.abort_end_time
            ? abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)
            : estimateDate
            }`;
        } else {
          dateText = `Réunion du ${formattedStartDate} - ${estimateDate}`;
        }
      } else if (meeting?.type === "Special" || meeting?.type === "Law") {
        dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )} - ${estimateDate} à ${specialMeetingEndTime(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )}`;
      } else {
        if (meeting?.status === "abort") {
          if (meeting?.abort_end_time) {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)} à ${abortMeetingTime(meeting?.abort_end_time, "HH[h]mm", meeting?.timezone) || "N/A"
              }`;
          } else {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${estimateDate} à ${estimateTime || "N/A"}`;
          }
        } else {
          dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
            meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
            meeting?.date, meeting?.steps, meeting?.timezone
          )} - ${estimateDate} à ${estimateTime || "N/A"}`;
        }
      }

      const addHeader = () => {
        let logoDataURL = null;
        // In this scope we need to make sure we have logoDataURL
        // Since it's a bit complex with async loadImage, we simplified it for single report
        // but let's try to reuse the logic
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(meeting?.objective || "", pageWidth - left, 25, { align: "right" });
        doc.setDrawColor(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2]);
        doc.setLineWidth(1.5);
        doc.line(left, 40, pageWidth - left, 40);
      };

      const addFooter = (pageNum) => {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      };

      addHeader();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(meeting?.title || "Compte Rendu", left, y + 35);
      y += 47;

      doc.setFontSize(12);
      doc.text(dateText, pageWidth / 2, y, { align: "center" });
      y += 20;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        headStyles: { fillColor: THEME_COLOR, textColor: 255, fontStyle: "bold", cellPadding: 6 },
        head: [["Nature de la réunion :", meeting?.solution ? meeting?.solution?.title : meeting?.type]],
        body: [
          ["Date de la réunion :", dateText],
          [`${t("address")} :`, meeting?.address || "N/A"],
          ["Organisateur :", getFullName()],
        ],
        styles: { fontSize: 10, cellPadding: 4 },
      });

      y = doc.lastAutoTable.finalY + 15;

      const summary = meeting?.meeting_notes_summary || markdownContent;
      if (summary) {
        doc.addPage();
        addHeader();
        y = 50;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Compte Rendu", left, y);
        y += 10;

        const splitText = doc.splitTextToSize(summary.replace(/#{1,6}\s?/g, "").replace(/\*\*/g, "").replace(/\*/g, ""), pageWidth - 2 * left);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(splitText, left, y);
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i);
      }

      const fileName = `Compte_Rendu_Simple_${meeting?.title || "Meeting"}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating single PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  const exportToDoc = async () => {
    setIsGeneratingDoc(true);
    try {
      const cellMargin = { top: 100, bottom: 100, left: 100, right: 100 }; // roughly 5pt
      const paraSpacing = { after: 50 }; // slight spacing after text

      // --- DEFINE THEME COLOR ---
      // The docx library requires Hex strings (without #). 
      // Converting [0, 102, 204] -> "0066CC"
      const THEME_HEX = "0066CC";

      // FIXED: Better logo source selection with proper URL validation
      const logo = meeting?.destination?.clients?.client_logo ||
        meeting?.destination?.clients?.logo ||
        meeting?.clients?.logo ||
        meeting?.destination?.logo;

      // Define chapters
      const CHAPTERS = [
        { key: "GÉNÉRALITÉS", title: "1. GÉNÉRALITÉS", alternates: ["GENERALITES"] },
        { key: "POINT MOA", title: "2. POINT MOA (Maîtrise d'Ouvrage)", alternates: ["MOA", "POINT MOA (Maîtrise d'Ouvrage)"] },
        { key: "POINT HYGIÈNE ET SÉCURITÉ", title: "3. POINT HYGIÈNE ET SÉCURITÉ", alternates: ["HYGIENE", "SECURITE", "POINT HYGIENE ET SECURITE"] },
        { key: "POINT ÉTUDES", title: "4. POINT ÉTUDES", alternates: ["ETUDES", "POINT ETUDES"] },
        { key: "POINT CONTRÔLEUR TECHNIQUE", title: "5. POINT CONTRÔLEUR TECHNIQUE", alternates: ["CONTROLEUR", "TECHNIQUE", "POINT CONTROLEUR TECHNIQUE"] },
        { key: "POINT TRAVAUX", title: "6. POINT TRAVAUX", alternates: ["TRAVAUX"] },
        { key: "POINT PROJETS EN INTERFACE", title: "7. POINT PROJETS EN INTERFACE", alternates: ["PROJETS", "INTERFACE"] },
        { key: "POINT QUALITÉ", title: "8. POINT QUALITÉ", alternates: ["QUALITE", "POINT QUALITE"] },
        { key: "POINT AVANCEMENT", title: "9. POINT AVANCEMENT", alternates: ["AVANCEMENT"] },
        { key: "POINT CONCESSIONNAIRES", title: "10. POINT CONCESSIONNAIRES", alternates: ["CONCESSIONNAIRES"] },
        { key: "POINT ADMINISTRATIF", title: "11. POINT ADMINISTRATIF", alternates: ["ADMINISTRATIF"] },
        { key: "REPORTAGE PHOTOGRAPHIQUE", title: "12. REPORTAGE PHOTOGRAPHIQUE", alternates: ["REPORTAGE", "PHOTOGRAPHIQUE"] }
      ];

      // Prepare Meetings Data
      const allMeetingReports = allMeetings?.previous_meetings || [];
      const currentMeetingReport = {
        date: meeting?.date,
        start_time: meeting?.start_time,
        meeting_notes_summary: meeting?.meeting_notes_summary || markdownContent,
        title: meeting?.title || "Réunion Actuelle",
        steps: meeting?.steps,
        timezone: meeting?.timezone,
      };

      const allMeetingsList = [...allMeetingReports, currentMeetingReport]
        .filter((m) => m.date)
        .sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          if (dateDiff !== 0) return dateDiff;
          return (a.start_time || "").localeCompare(b.start_time || "");
        });

      const meetingsByChapter = {};
      allMeetingsList.forEach(meetingItem => {
        const chapters = parseMeetingChapters(meetingItem.meeting_notes_summary);
        Object.entries(chapters).forEach(([chapterKey, content]) => {
          if (!meetingsByChapter[chapterKey]) {
            meetingsByChapter[chapterKey] = [];
          }
          meetingsByChapter[chapterKey].push({
            date: formatMeetingTime(meetingItem),
            content: content
          });
        });
      });

      // --- LOGO ---
      let logoBuffer = null;
      if (logo && logo.startsWith("http")) {
        try {
          const img = await loadImage(logo);
          if (img && img.dataURL) {
            const buf = dataURLToUint8Array(img.dataURL);
            if (buf && buf.length > 0) {
              logoBuffer = buf;
            }
          }
        } catch (e) {
          console.error("Failed to load logo", e);
        }
      }
      if (!logoBuffer) {
        try {
          const clientName = meeting?.destination?.clients?.name ||
            meeting?.clients?.name ||
            meeting?.destination?.name ||
            "Client";
          const avatarDataURL = await generateInitialsAvatar(clientName, 200);
          logoBuffer = dataURLToUint8Array(avatarDataURL);
        } catch (e) { console.error("Failed to generate avatar", e); }
      }

      // --- Header Component Factory ---
      const createHeader = () => {
        const headerChildren = [];
        // Common border style using the Blue Theme Color
        const borderStyle = { color: THEME_HEX, space: 1, value: "single", size: 12 };

        if (logoBuffer && logoBuffer.length > 0) { // Safety check
          headerChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: { width: 50, height: 50 },
                }),
                new TextRun({
                  text: `\t${meeting?.objective || ""}`,
                  bold: true,
                  size: 24, // 12pt
                }),
              ],
              tabStops: [
                { type: "right", position: 9000 }, // Adjust tab position as needed
              ],
              border: { bottom: borderStyle }
            })
          )
        } else {
          headerChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${meeting?.objective || ""}`,
                  bold: true,
                  size: 24, // 12pt
                }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { bottom: borderStyle }
            })
          )
        }
        return new Header({
          children: headerChildren
        });
      };

      const sections = [];

      // --- INFO & TABLES SECTION ---
      let dateText = "";
      // (Using exactly the same logic as PDF for dateText)
      if (meeting?.type === "Action1" || meeting?.type === "Newsletter") {
        if (meeting?.status === "abort") {
          dateText = `Réunion du ${formattedStartDate} - ${meeting?.abort_end_time
            ? abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)
            : estimateDate
            }`;
        } else {
          dateText = `Réunion du ${formattedStartDate} - ${estimateDate}`;
        }
      } else if (meeting?.type === "Special" || meeting?.type === "Law") {
        dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )} - ${estimateDate} à ${specialMeetingEndTime(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )}`;
      } else {
        if (meeting?.status === "abort") {
          if (meeting?.abort_end_time) {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)} à ${abortMeetingTime(meeting?.abort_end_time, "HH[h]mm", meeting?.timezone) || "N/A"
              }`;
          } else {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${estimateDate} à ${estimateTime || "N/A"}`;
          }
        } else {
          dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
            meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
            meeting?.date, meeting?.steps, meeting?.timezone
          )} - ${estimateDate} à ${estimateTime || "N/A"}`;
        }
      }

      const infoRows = [
        new TableRow({
          children: [
            // CHANGED: Red to Blue Theme
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nature de la réunion :", bold: true, color: "FFFFFF" })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ text: meeting?.solution ? meeting?.solution?.title : meeting?.type, spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Date de la réunion :", spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ text: dateText, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: `${t("address")} :`, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ text: meeting?.address || "N/A", spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Date de la prochaine réunion :", spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({
              children: [new Paragraph({
                text: allMeetings?.date_of_next_moment
                  ? formatDateTimeWithTimezone(
                    allMeetings.date_of_next_moment,
                    allMeetings.next_moment_timezone || meeting?.timezone
                  )
                  : "N/A", spacing: paraSpacing
              })], margins: cellMargin, verticalAlign: AlignmentType.CENTER
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Organisateur :", spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ text: getFullName(), spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
          ]
        }),
      ];

      const infoTable = new Table({
        rows: infoRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        }
      });

      // Participants
      const participantsRows = [
        new TableRow({
          children: [
            // CHANGED: Red to Blue Theme for all headers
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fonction", bold: true, color: "FFFFFF", size: 18 })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Société", bold: true, color: "FFFFFF", size: 18 })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Représentants", bold: true, color: "FFFFFF", size: 18 })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coordonnées", bold: true, color: "FFFFFF", size: 18 })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Prés.", bold: true, color: "FFFFFF", size: 18 })], spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
          ]
        })
      ];

      (meeting?.user_with_participants || []).forEach(p => {
        const baseName =
          p?.full_name ||
          [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
          "N/A";
        // Name + post on next line with arrow and brackets
        const name = p?.post
          ? `${baseName}\n(${p.post})`
          : baseName;
        const phone = p?.phone_number || p?.phone_no || "N/A";
        // Do simple text join for coords
        const coords = `${p?.email || "N/A"}\n${phone}`;

        participantsRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: p?.job || "N/A", size: 16, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph({ text: p?.user_id ? p?.clients?.name : p?.contact?.clients?.name || "N/A", size: 16, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph({ text: name, size: 16, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph({ text: coords, size: 16, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              new TableCell({ children: [new Paragraph({ text: p?.attandance === 1 ? " ✔ " : "X", size: 16, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
            ]
          })
        );
      });

      const participantsTable = new Table({
        rows: participantsRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        }
      });


      sections.push({
        properties: {
          header: createHeader(),
          footer: new Footer({
            children: [new Paragraph({ children: [new TextRun({ children: ["Page ", " / "], field: "PAGE" })], alignment: AlignmentType.CENTER })]
          })
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: meeting?.title || "Compte Rendu", bold: true, size: 36 })],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [new TextRun({ text: dateText, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          infoTable,
          new Paragraph({ text: "", spacing: { after: 400 } }),
          participantsTable,
          new Paragraph({ text: "", spacing: { after: 400 } }), // Break
        ]
      });

      // --- CHAPTERS / LIST SECTION ---

      const hasChapters = Object.keys(meetingsByChapter).length > 0;
      if (hasChapters) {
        // Create a new section for chapters
        const chapterChildren = [];
        chapterChildren.push(new Paragraph({
          children: [new TextRun({ text: "Comptes Rendus par Chapitre", bold: true, size: 36 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 }
        }));

        for (const chapter of CHAPTERS) {
          const chapterData = meetingsByChapter[chapter.key];
          if (!chapterData || chapterData.length === 0) continue;

          // Title
          chapterChildren.push(
            new Paragraph({
              children: [new TextRun({ text: chapter.title, bold: true, color: "FFFFFF", size: 28 })],
              // CHANGED: Red to Blue Theme
              shading: { fill: THEME_HEX },
              spacing: { before: 400, after: 200 },
              indent: { left: 100, right: 100 }
            })
          );

          // Table for content
          const chapterRows = [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Date de Réunion", bold: true, spacing: paraSpacing })], width: { size: 20, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
                new TableCell({ children: [new Paragraph({ text: "Contenu", bold: true, spacing: paraSpacing })], width: { size: 80, type: WidthType.PERCENTAGE }, shading: { fill: "F0F0F0" }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              ]
            })
          ];

          chapterData.forEach(meetingData => {
            const formattedContent = formatContentForPDF(meetingData.content);
            // Split by newlines to create separate paragraphs
            const contentParagraphs = formattedContent.split('\n').map(line => new Paragraph({ text: line, spacing: { after: 100 } })); // keep slightly larger spacing for content

            chapterRows.push(
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: meetingData.date, spacing: paraSpacing })], margins: cellMargin }),
                  new TableCell({ children: contentParagraphs, margins: cellMargin }),
                ]
              })
            );
          });

          chapterChildren.push(new Table({
            rows: chapterRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            }
          }));
        }
        sections.push({
          properties: {
            header: createHeader(),
            footer: new Footer({
              children: [new Paragraph({ children: [new TextRun({ children: ["Page ", " / "], field: "PAGE" })], alignment: AlignmentType.CENTER })]
            })
          },
          children: chapterChildren
        });

      } else {
        // Chronological List
        const listChildren = [];
        listChildren.push(new Paragraph({
          children: [new TextRun({ text: meeting?.title || "Compte Rendu", bold: true, size: 36 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }));
        listChildren.push(new Paragraph({
          children: [new TextRun({ text: dateText, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }));

        if (allMeetingsList.length > 0) {
          const listRows = [
            new TableRow({
              children: [
                // CHANGED: Red to Blue Theme
                new TableCell({ children: [new Paragraph({ text: "Date & Heure", bold: true, color: "FFFFFF", spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
                new TableCell({ children: [new Paragraph({ text: "Résumé", bold: true, color: "FFFFFF", spacing: paraSpacing })], shading: { fill: THEME_HEX }, margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
              ]
            })
          ];
          allMeetingsList.forEach(m => {
            const dateTime = formatMeetingTime(m);
            let summary = "Aucun compte-rendu disponible";
            if (m.meeting_notes_summary) {
              summary = m.meeting_notes_summary
                .replace(/#{1,6}\s?/g, "")
                .replace(/\*\*/g, "")
                .replace(/\*/g, "")
                .replace(/`/g, "")
                .trim();
            }
            // Simple paragraphs for summary
            const summaryParagraphs = summary.split('\n').map(s => new Paragraph({ text: s, spacing: paraSpacing }));

            listRows.push(new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: dateTime, spacing: paraSpacing })], margins: cellMargin, verticalAlign: AlignmentType.CENTER }),
                new TableCell({ children: summaryParagraphs, margins: cellMargin }),
              ]
            }));
          });

          listChildren.push(new Table({
            rows: listRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            }
          }));
        } else {
          listChildren.push(new Paragraph({ text: "Aucune réunion précédente disponible.", italics: true }));
        }
        sections.push({
          properties: {
            header: createHeader(),
            footer: new Footer({
              children: [new Paragraph({ children: [new TextRun({ children: ["Page ", " / "], field: "PAGE" })], alignment: AlignmentType.CENTER })]
            })
          },
          children: listChildren
        });
      }

      // GENERATE AND SAVE
      const doc = new Document({
        sections: sections
      });

      const blob = await Packer.toBlob(doc);
      // Format: Meeting_Report_date.docx
      // const formattedDateForFile = meeting?.date ? moment(meeting?.date).format("YYYY-MM-DD") : "report";
      saveAs(blob, `Compte_Rendu_${meeting?.title}_${new Date().toISOString().slice(0, 10)}.docx`);
      toast.success("Document Word généré avec succès !");

    } catch (error) {
      console.error("Error generating Docx:", error);
      toast.error("Erreur lors de la génération du document Word");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const exportSingleReportToDoc = async () => {
    setIsGeneratingDoc(true);
    try {
      const THEME_HEX = "0066CC";
      const borderStyle = { color: THEME_HEX, space: 1, value: "single", size: 12 };
      const paraSpacing = { after: 50 };

      // Format date text
      let dateText = "";
      if (meeting?.type === "Action1" || meeting?.type === "Newsletter") {
        if (meeting?.status === "abort") {
          dateText = `Réunion du ${formattedStartDate} - ${meeting?.abort_end_time
            ? abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)
            : estimateDate
            }`;
        } else {
          dateText = `Réunion du ${formattedStartDate} - ${estimateDate}`;
        }
      } else if (meeting?.type === "Special" || meeting?.type === "Law") {
        dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )} - ${estimateDate} à ${specialMeetingEndTime(
          meeting?.start_time, meeting?.date, meeting?.steps, meeting?.timezone
        )}`;
      } else {
        if (meeting?.status === "abort") {
          if (meeting?.abort_end_time) {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${abortMeetingTime(meeting?.abort_end_time, "DD/MM/yyyy", meeting?.timezone)} à ${abortMeetingTime(meeting?.abort_end_time, "HH[h]mm", meeting?.timezone) || "N/A"
              }`;
          } else {
            dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
              meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
              meeting?.date, meeting?.steps, meeting?.timezone
            )} - ${estimateDate} à ${estimateTime || "N/A"}`;
          }
        } else {
          dateText = `Réunion du ${formattedStartDate} à ${convertTo12HourFormat(
            meeting?.starts_at || meeting?.steps[0]?.current_time || meeting?.start_time,
            meeting?.date, meeting?.steps, meeting?.timezone
          )} - ${estimateDate} à ${estimateTime || "N/A"}`;
        }
      }

      const doc = new Document({
        sections: [{
          headers: {
            default: new Header({
              children: [new Paragraph({
                children: [new TextRun({ text: meeting?.objective || "", bold: true, size: 24 })],
                alignment: AlignmentType.RIGHT,
                border: { bottom: borderStyle }
              })]
            })
          },
          children: [
            new Paragraph({ text: meeting?.title || "Compte Rendu", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 } }),
            new Paragraph({ text: dateText, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
            new Paragraph({
              children: [new TextRun({ text: meeting?.meeting_notes_summary || "", size: 22 })],
              spacing: { before: 200 }
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Compte_Rendu_Simple_${meeting?.title || "Meeting"}_${new Date().toISOString().slice(0, 10)}.docx`);
    } catch (error) {
      console.error("Error generating single Doc:", error);
      toast.error("Erreur lors de la génération du document Word");
    } finally {
      setIsGeneratingDoc(false);
    }
  };


  const cleanText = (text) => {
    if (!text) return "";
    return text.replace(/^```markdown\s*/, '').replace(/```$/, '').replace(/---/g, '');
  };
  
  const isMarkdownContent = (text) => {
    if (!text) return false;
    const trimmedText = text.trim();
    if (trimmedText.startsWith("```markdown")) return true;
    // If it contains common HTML tags, it's HTML
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    if (htmlRegex.test(trimmedText)) return false;
    // If it has markdown headers, lists, or bold/italic, it's likely markdown
    const markdownRegex = /^(#+\s|\*+\s|-+\s|\d+\.\s|(\*\*|__))/m;
    return markdownRegex.test(trimmedText);
  };

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
          className="complete-invite w-100"
          style={{
            position: fromMeeting ? "static" : "relative",
            backgroundColor: fromMeeting ? "white" : "",
            padding: "10px 15px",
          }}
        >
          {/* Progress Bar Section */}
          {/* {showProgressBar && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "10px",
                  width: "50%",
                  maxWidth: "500px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    marginBottom: "20px",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {uploadStage}
                </div>
                <ProgressBar
                  now={progress}
                  label={`${progress}%`}
                  style={{ height: "20px" }}
                />
                <div style={{ marginTop: "10px", color: "#666" }}>
                  {t(
                    "note_translation.Please wait while we process your request"
                  )}
                </div>
              </div>
            </div>
          )} */}
          {isGeneratingPDF && (
            <div
              className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow-lg border"
              style={{ zIndex: 9999 }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-danger mb-3"
                  style={{ width: "3rem", height: "3rem" }}
                ></div>
                <h5>Génération du PDF en cours...</h5>
                <p className="text-muted small">
                  Cela peut prendre 10-15 secondes
                </p>
              </div>
            </div>
          )}
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
                <div className="flex-grow-1">
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
                      <span className="mx-2 badge inprogrss">
                        {t("badge.finished")}
                      </span>
                    ) : meeting?.status === "abort" ? (
                      <span className="mx-2 badge late">
                        {t("badge.cancel")}
                      </span>
                    ) : meeting?.status === "no_status" ? (
                      <span className="badge status-badge-green">{t("badge.no_status")}</span>
                    ) : null}
                  </h5>
                </div>

                {meeting?.status !== "no_status" && <div className="play-btn-container">
                  {meeting?.status !== "abort" &&
                    parseInt(meeting?.user_id) ===
                    parseInt(CookieService.get("user_id")) && (
                      <Button
                        className="btn play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentURL = `/destination/${meeting?.unique_id}/${meeting?.id}`;
                          copy(currentURL);
                          openLinkInNewTab(currentURL);
                          // navigate(currentURL, { state: fromMeeting });
                        }}
                        disabled={transcriptLoading || summaryLoading}
                      >
                        {transcriptLoading || summaryLoading
                          ? t("presentation.summarizing")
                          : t("presentation.generateLink")}

                        <FaArrowRight
                          size={12}
                          style={{
                            marginLeft: ".5rem",
                            fontWeight: 700,
                          }}
                        />
                      </Button>
                    )}
                  <Dropdown className="dropdown">
                    {
                      // Check if the logged-in user is in the guides array
                      (meeting?.steps?.some(
                        (guide) => guide?.userPID === parseInt(loggedInUserId)
                      ) ||
                        // Check if all participants have user_id equal to meeting.user.id
                        meeting?.user?.id === parseInt(loggedInUserId)) && (
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                          <BiDotsVerticalRounded color="black" size={"25px"} />
                        </Dropdown.Toggle>
                      )
                    }

                    {
                      // Check if the logged-in user is in the guides array
                      meeting?.steps?.some(
                        (guide) => guide?.userPID === parseInt(loggedInUserId)
                      ) ||
                        // Check if all participants have user_id equal to meeting.user.id
                        meeting?.user?.id === parseInt(loggedInUserId) ? (
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(
                                setFormState,
                                meeting,
                                t,
                                handleShow,
                                setMeeting1,
                                setCheckId,
                                setIsDuplicate,
                                setMeeting,
                                setIsLoading,
                                setStatus,
                                updateSteps
                              );
                            }}
                            disabled={isDisabled}
                          >
                            <MdContentCopy size={"18px"} /> &nbsp;
                            {t("dropdown.Duplicate")}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={(e) => handleChangePrivacy(meeting)}
                          >
                            <RiEditBoxLine size={"18px"} /> &nbsp;{" "}
                            {t("dropdown.change Privacy")}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={(e) => handleChangeContext(meeting)}
                          >
                            <RiEditBoxLine size={"18px"} /> &nbsp;{" "}
                            {t("dropdown.change Context")}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={(e) => handleChangeOptions(meeting)}
                          >
                            <RiEditBoxLine size={"18px"} /> &nbsp;{" "}
                            {t("dropdown.change Options")}
                          </Dropdown.Item>
                          <Dropdown.Item onClick={(e) => sendReport(meeting)}>
                            <MdOutlineShare size={"18px"} /> &nbsp;{" "}
                            {t("Shareby")}
                          </Dropdown.Item>
                          {parseInt(meeting?.user?.id) ===
                            parseInt(loggedInUserId) && (
                              <>
                                <hr
                                  style={{
                                    margin: "10px 0 0 0",
                                    padding: "2px",
                                  }}
                                />

                                <Dropdown.Item
                                  // onClick={(e) => {
                                  //   e.stopPropagation();
                                  //   handleDelete(meeting.id);
                                  // }}
                                  onClick={(e) =>
                                    handleDeleteClick(e, meeting?.id)
                                  }
                                  disabled={isDisabled}
                                >
                                  <AiOutlineDelete size={"20px"} color="red" />
                                  &nbsp; {t("dropdown.Delete")}
                                </Dropdown.Item>
                              </>
                            )}
                        </Dropdown.Menu>
                      ) : (
                        <>
                          <Button
                            className="btn play-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentURL = `/destination/${meeting?.unique_id}/${meeting?.id}`;
                              copy(currentURL);
                              openLinkInNewTab(currentURL);
                            }}
                            disabled={isDisabled}
                          >
                            <RiPresentationFill size={"20px"} /> &nbsp;
                            {t("presentation.generateLink")}
                          </Button>
                        </>
                      )
                    }
                  </Dropdown>
                </div>}
              </div>

              <div className="items">
                <div className="d-flex align-items-center gap-2 mb-2">
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
                          : t(`types.${meeting?.type}`)}
                  </span>
                </div>
              </div>

              <div className="items mt-0 mb-3">
                {meeting?.prise_de_notes === "Automatic" &&
                  (isLoading ? (
                    <div style={{ width: "20%", margin: "20px 0" }}>
                      <ProgressBar animated now={45} />
                    </div>
                  ) : meeting?.voice_notes === null ? (
                    <div
                      style={{
                        margin: "20px 0",
                        fontWeight: "bold",
                        color: "red",
                      }}
                    >
                      {t("Audio not found")}
                      <label
                        htmlFor="audio-upload"
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          color: "black",
                        }}
                      >
                        <FaRegFileAudio size={20} />{" "}
                        {t("note_translation.Upload Audio")}
                      </label>
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // You can add your audio upload logic here
                            console.log("Audio file selected:", file);
                            uploadAudioToCloudinary(file);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      {isConverting ? (
                        <>
                          {" "}
                          <audio
                            controls
                            src={meeting?.voice_notes || mp3Url}
                            key={`converting-${meeting?.voice_notes || mp3Url}`}
                          >
                            Your browser does not support the audio element.
                          </audio>{" "}
                          <span>Audio File is Buffering...</span>
                        </>
                      ) : (
                        <audio
                          controls
                          src={meeting?.voice_notes || mp3Url}
                          key={meeting?.voice_notes || mp3Url}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      )}
                    </>
                  ))}

                <div className="d-flex align-items-center gap-2">
                  <svg
                    width="24"
                    height="20"
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
                  <p className="page-count p-0 m-0">
                    {pageViews} vues sur le compte-rendu
                  </p>
                </div>
              </div>

              {meeting?.status !== "no_status" && <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                <img src="/Assets/invite-date.svg" height="28px" width="28px" />

                <>
                  {meeting?.type === "Action1" ||
                    meeting?.type === "Newsletter" ? (
                    <>
                      <span className="fw-bold formate-date">
                        {formattedStartDate} -
                      </span>

                      {meeting?.status === "abort" ? (
                        <span className="fw-bold formate-date">
                          {meeting?.abort_end_time
                            ? abortMeetingTime(
                              meeting?.abort_end_time,
                              "DD/MM/yyyy",
                              meeting?.timezone
                            )
                            : estimateDate}
                        </span>
                      ) : (
                        <span className="fw-bold formate-date">
                          {estimateDate}
                        </span>
                      )}
                    </>
                  ) : meeting?.type === "Special" || meeting?.type === "Law" ? (
                    <>
                      <span className="fw-bold formate-date">
                        {formattedStartDate}
                        &nbsp; {t("at")}
                      </span>

                      <span className="fw-bold formate-date">
                        {convertTo12HourFormat(
                          meeting?.start_time,
                          meeting?.date,
                          meeting?.steps,
                          meeting?.timezone
                        )}{" "}
                        -{" "}
                      </span>

                      <span className="fw-bold formate-date">
                        {estimateDate}
                        &nbsp; {t("at")}
                      </span>
                      <span className="fw-bold formate-date">
                        {specialMeetingEndTime(
                          meeting?.start_time,
                          meeting?.date,
                          meeting?.steps,
                          meeting?.timezone
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="fw-bold formate-date">
                        {formattedStartDate} &nbsp; {t("at")} &nbsp;
                        {convertTo12HourFormat(
                          meeting?.starts_at ||
                          meeting?.steps[0]?.current_time ||
                          meeting?.start_time,
                          meeting?.date,
                          meeting?.steps,
                          meeting?.timezone
                        )}{" "}
                        -{" "}
                      </span>
                      {meeting?.status === "abort" ? (
                        <>
                          {meeting?.abort_end_time ? (
                            <span className="fw-bold formate-date">
                              {abortMeetingTime(
                                meeting?.abort_end_time,
                                "DD/MM/yyyy",
                                meeting?.timezone
                              )}
                              &nbsp; {t("at")} &nbsp;
                              {abortMeetingTime(
                                meeting?.abort_end_time,
                                "HH[h]mm",
                                meeting?.timezone
                              ) || "N/A"}
                            </span>
                          ) : (
                            <span className="fw-bold formate-date">
                              {estimateDate}
                              &nbsp; {t("at")} &nbsp;
                              {estimateTime || "N/A"}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="fw-bold formate-date">
                          {estimateDate}
                          &nbsp; {t("at")} &nbsp;
                          {estimateTime || "N/A"}
                        </span>
                      )}
                    </>
                  )}
                </>

                <span className="fw-bold">
                  {getTimezoneSymbol(CookieService.get("timezone"))}
                </span>
              </div>}

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
                                (item) => item.platform === "Microsoft Teams"
                              )?.value || "Microsoft Microsoft Teams"}
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
                                (item) => item.platform === "Google Meet"
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
                                (item) => item.platform === "Outlook Agenda"
                              )?.value || "Outlook Agenda"}
                            </span>
                          </>
                        ) : meeting?.agenda === "Google Agenda" ? (
                          <>
                            <FcGoogle size={28} />
                            <span className="solutioncards option-text">
                              {meeting?.user?.integration_links?.find(
                                (item) => item.platform === "Google Agenda"
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
                        <span>{meeting?.phone}</span>
                      </a>
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Options */}
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
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
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
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
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
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
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
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
                    {t("meeting.formState.Automatic Strategy")}
                  </span>
                  </div>
                  </>
                )}
              </div>

              {/* Star Ratings */}
              {meeting?.meeting_feedbacks?.length > 0 && meeting?.feedback && (
                <div className="row mb-2">
                  <div className="col-md-12 mt-2 ms-1 d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={
                            index < Math.round(averageRating)
                              ? "#FFD700"
                              : "#D3D3D3"
                          }
                          size={20}
                          style={{ marginRight: 1 }}
                        />
                      ))}
                    </div>

                    <span className="time">{averageRating.toFixed(1)}</span>
                    <span className="time">{`(${meeting?.meeting_feedbacks?.length
                      } ${meeting?.meeting_feedbacks?.length > 1 ? "Votes" : "Vote"
                      })`}</span>
                  </div>
                </div>
              )}
              {/* Casting Type */}
              {/* Privacy */}
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
                              <Tooltip title={item?.full_name !== " " ? item?.full_name : item?.email} placement="top">
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
                      className={`badge ms-2 ${meeting?.moment_privacy === "private"
                        ? "solution-badge-red"
                        : meeting?.moment_privacy === "public"
                          ? "solution-badge-green"
                          : meeting?.moment_privacy === "enterprise" ||
                            meeting?.moment_privacy === "participant only" ||
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
          </div>

          <div className="paragraph-parent my-0 mt-2 ms-1">
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
                      strong: ({ node, ...props }) => <strong {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? <code {...props} /> : <code {...props} />,
                    }}
                  >
                    {cleanText(meeting?.description)}
                  </ReactMarkdown>
                </div>
              ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: meeting?.description,
                }}
              />
              )}
              </span>
          </div>

          <div className="mt-4 d-flex justify-content-center justify-content-md-start ">
            {meeting?.type === "Special" || meeting?.type === "Law" ? (
              <span
                className="px-3 py-2 fw-normal d-inline-block"
                style={{
                  backgroundColor: "#f5f8ff", // your brand blue (change if you want)
                  fontSize: "clamp(13px, 2.5vw, 15px)", // perfect size on all devices
                  whiteSpace: "nowrap", // prevents text from breaking
                  color: "black",
                }}
              >
                {meeting?.estimate_time_time_taken &&
                  `${t("estimateFieldCompleted")}:  ${localizeEstimateTime(
                    meeting?.estimate_time_time_taken
                  )}`}
              </span>
            ) : (
              <span
                className="px-3 py-3 fw-normal d-inline-block"
                style={{
                  backgroundColor: "#f5f8ff", // your brand blue (change if you want)
                  fontSize: "clamp(13px, 2.5vw, 15px)", // perfect size on all devices
                  whiteSpace: "nowrap", // prevents text from breaking
                  color: "black",
                }}
              >
                {meeting?.estimate_time_time_taken &&
                  `${t("estimateFieldCompleted")}:  ${localizeEstimateTime(
                    meeting?.estimate_time_time_taken
                  )}`}
              </span>
            )}
          </div>

          {/* ...........HERE */}

          <div className="current_destinations clients-tab">
            <Tab.Container
              className="destination-tabs-container"
              activeKey={activeTab}
              onSelect={handleTabSelect}
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
                            className={`${activeTab === "casting" ? "future" : "draft"
                              } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {meeting?.guides?.length +
                              meeting?.participants?.length || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item key="steps" className="tab">
                        <Nav.Link eventKey="steps" className="custom-tab-link">
                          {t("steps")}
                          <span
                            className={`${activeTab === "steps" ? "future" : "draft"
                              } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {meeting?.steps?.length || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      {/* {meeting?.steps?.length > 1 && (
                      <Nav.Item key="stepNotes" className="tab">
                        <Nav.Link
                          eventKey="stepNotes"
                          className="custom-tab-link"
                        >
                          {meeting?.prise_de_notes === "Automatic"
                            ? t("Resume by step")
                            : t("Note by step")}
                        </Nav.Link>
                      </Nav.Item>
                    )} */}

                      <Nav.Item key="meetingNotes" className="tab">
                        <Nav.Link
                          eventKey="meetingNotes"
                          className="custom-tab-link"
                        >
                          {t("Resume by moment")} :{" "}
                          {meeting?.type === "Google Agenda Event"
                            ? "Google Agenda Event"
                            : meeting?.type === "Outlook Agenda Event"
                              ? "Outlook Agenda Event"
                              : t(`types.${meeting?.type}`)}
                        </Nav.Link>
                      </Nav.Item>

                      <Nav.Item key="files" className="tab">
                        <Nav.Link eventKey="files" className="custom-tab-link">
                          {t("meeting.newMeeting.labels.file")}
                          <span className="ms-2">
                            {meeting?.meeting_files?.length || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                      {meeting?.meeting_feedbacks?.length > 0 && (
                        <Nav.Item key="feedbacks" className="tab">
                          <Nav.Link
                            eventKey="feedbacks"
                            className="custom-tab-link"
                          >
                            {t("feedbacks")}
                            <span
                              className={`${activeTab === "feedbacks" ? "future" : "draft"
                                } ms-2`}
                              style={{
                                padding: "4px 6px",
                                borderRadius: "8px",
                              }}
                            >
                              {meeting?.meeting_feedbacks?.length || 0}
                            </span>
                          </Nav.Link>
                        </Nav.Item>
                      )}

                      <Nav.Item key="discussion" className="tab">
                        <Nav.Link
                          eventKey="discussion"
                          className="custom-tab-link"
                        >
                          {t("meeting.newMeeting.labels.discussion")}
                          <span
                            className={`${activeTab === "discussion" ? "future" : "draft"
                              } ms-2`}
                            style={{ padding: "4px 6px", borderRadius: "8px" }}
                          >
                            {meetingMessages?.length || 0}
                          </span>
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </div>
                  <div className="col-md-2 d-flex justify-content-end">
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

                    {activeTab === "discussion" && (
                      <div className="cards-section child-2">
                        <button
                          onClick={refreshMessages}
                          disabled={refreshing}
                          className="btn btn-sm btn-link text-muted p-0"
                          title={refreshing ? "Refreshing..." : "Refresh messages"}
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
                            className={`${refreshing ? 'spinning' : ''}`}
                            size={25}
                          />
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-block d-md-none mt-4">
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="light"
                    className="w-100 d-flex justify-content-between align-items-center border rounded px-4 py-3 shadow-sm"
                    style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}
                  >
                    <span>
                      {activeTab === "casting" &&
                        `${t("Casting")} • ${(meeting?.guides?.length || 0) +
                        (meeting?.participants?.length || 0)
                        }`}
                      {activeTab === "steps" &&
                        `${t("steps")} • ${meeting?.steps?.length || 0}`}
                      {activeTab === "meetingNotes" &&
                        `${t("Resume by moment")} • ${meeting?.type === "Google Agenda Event"
                          ? "Google"
                          : meeting?.type === "Outlook Agenda Event"
                            ? "Outlook"
                            : t(`types.${meeting?.type}`)
                        }`}
                      {activeTab === "files" &&
                        `${t("meeting.newMeeting.labels.file")} • ${meeting?.meeting_files?.length || 0
                        }`}
                      {activeTab === "feedbacks" &&
                        `${t("feedbacks")} • ${meeting?.meeting_feedbacks?.length || 0
                        }`}
                      {activeTab === "discussion" &&
                        `${t("meeting.newMeeting.labels.discussion")} • ${meetingMessages?.length || 0
                        }`}
                    </span>
                    <span>▼</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100">
                    <Dropdown.Item eventKey="casting">
                      {t("Casting")} (
                      {(meeting?.guides?.length || 0) +
                        (meeting?.participants?.length || 0)}
                      )
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="steps">
                      {t("steps")} ({meeting?.steps?.length || 0})
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="meetingNotes">
                      {t("Resume by moment")} •{" "}
                      {meeting?.type === "Google Agenda Event"
                        ? "Google"
                        : meeting?.type === "Outlook Agenda Event"
                          ? "Outlook"
                          : t(`types.${meeting?.type}`)}
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="files">
                      {t("meeting.newMeeting.labels.file")} (
                      {meeting?.meeting_files?.length || 0})
                    </Dropdown.Item>
                    {meeting?.meeting_feedbacks?.length > 0 && (
                      <Dropdown.Item eventKey="feedbacks">
                        {t("feedbacks")} (
                        {meeting?.meeting_feedbacks?.length || 0})
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item eventKey="discussion">
                      {t("meeting.newMeeting.labels.discussion")} (
                      {meetingMessages?.length || 0})
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Mobile Add Buttons */}
                <div className="mt-3 text-end">
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
                </div>
              </div>

              <Tab.Content className="">
                <Tab.Pane eventKey="casting">
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
                          (item) => item?.email === meeting?.user?.email
                        )}
                        fromMeeting={fromMeeting}
                        handleShow={handleOrgShow}
                        handleHide={hideOrgShow}
                        showProfile={showOrgProfile}
                        meeting={meeting}
                      />
                    </div>
                  </div>

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
                      {meeting?.guides?.length > 1 ? "Guides" : "Guide"}
                    </h4>
                    <div
                      className="host"
                      style={{ background: showHostProfile && "white" }}
                    >
                      <GuidesCard
                        data={meeting?.user}
                        fromMeeting={fromMeeting}
                        guides={meeting?.guides}
                        disabled={isDisabled}
                        handleShow={handleHostShow}
                        handleHide={hideHostShow}
                        showProfile={showHostProfile}
                        meeting={meeting}
                        onAttendanceToggle={getRefreshedMeeting}

                      />
                    </div>
                  </div>
                  {/* ------------------------------------------------ Participants------------------------------ */}
                  {meeting?.type !== "Newsletter" && (
                    <>
                      {meeting?.participants?.filter(
                        (item) =>
                          // item.isCreator === 0
                          !guideEmails.has(item.email)
                      )?.length > 0 && (
                          <div style={{ marginTop: "5rem" }}>
                            <h4
                              className={
                                fromMeeting
                                  ? "participant-heading-meeting"
                                  : "participant-heading"
                              }
                            >
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
                              {t("invite")}{" "}
                              <span>
                                {"(" +
                                  meeting?.participants?.filter(
                                    (item) =>
                                      // item.isCreator === 0 &&
                                      !guideEmails.has(item.email)
                                  ).length +
                                  "/" +
                                  meeting?.participants?.filter(
                                    (item) =>
                                      // item.isCreator === 0 &&
                                      !guideEmails.has(item.email)
                                  ).length +
                                  ")"}
                              </span>
                            </h4>
                            <div
                              className="participant"
                              style={{ background: showProfile && "white" }}
                            >
                              <ParticipantCard
                                guides={meeting?.guides}
                                data={meeting?.participants}
                                meeting={meeting}
                                handleShow={handleShow1}
                                handleHide={hideShow}
                                showProfile={showProfile}
                                onAttendanceToggle={getRefreshedMeeting}

                              />
                            </div>
                          </div>
                        )}
                    </>
                  )}

                  {meeting?.type === "Newsletter" && (
                    <>
                      <h4
                        className={
                          fromMeeting
                            ? "participant-heading-meeting"
                            : "participant-heading"
                        }
                      >
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
                            fromMeeting={fromMeeting}
                            meeting={meeting}
                            handleShow={handleShow1}
                            handleHide={hideShow}
                            showProfile={showProfile}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </Tab.Pane>
                <Tab.Pane eventKey="steps">
                  {/* ------------------------------------------------ Steps */}
                  {meeting?.steps?.length > 0 && (
                    <>
                      <div style={{ marginTop: "3rem", marginBottom: "3rem" }}>
                        <h4
                          className={`${fromMeeting
                            ? "participant-heading-meeting"
                            : "participant-heading"
                            } mt-5 d-flex align-items-center justify-content-between`}
                        >
                          {meeting?.steps?.length > 1 ? t("steps") : t("step")}
                          <span style={{ cursor: "pointer" }}>
                            <div className="toggle-button">
                              <button
                                className={`toggle-button-option ${view === "grid" ? "active" : ""
                                  }`}
                                onClick={() => handleToggle("grid")}
                              >
                                <div className="icon-grid" />
                                <FaList size={18} />
                              </button>
                              <button
                                className={`toggle-button-option ${view === "list" ? "active" : ""
                                  }`}
                                onClick={() => handleToggle("list")}
                              >
                                <div className="icon-list" />
                                <FaChartGantt size={20} />
                              </button>
                            </div>
                          </span>
                        </h4>

                        {view === "grid" ? (
                          <ReportStepCard
                            data={meeting?.steps}
                            users={{
                              ...meeting?.user,
                              firstName: meeting?.user?.name,
                              lastName: meeting?.user?.last_name,
                              image:
                                meeting?.user?.assigned_to_image ||
                                meeting?.user?.image ||
                                "/Assets/avatar.jpeg",
                            }}
                            fromMeeting={fromMeeting}
                            meeting={meeting}
                            refreshMeetings={getRefreshedMeeting}
                          />
                        ) : (
                          <KanbanBoard
                            data={meeting?.steps}
                            users={{
                              ...meeting?.user,
                              firstName: meeting?.user?.name,
                              lastName: meeting?.user?.last_name,
                              image:
                                // meeting?.user?.assigned_to_image ||
                                meeting?.user?.image || "/Assets/avatar.jpeg",
                            }}
                            meeting={meeting}
                            refreshMeeting={getRefreshedMeeting}
                          />
                        )}
                      </div>
                    </>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="meetingNotes">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      <>
                        <div
                          style={{
                            marginTop: "5rem",
                            marginBottom: "3rem",
                          }}
                        >
                          <h4
                            className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                          >
                            {viewNote === "note"
                              ? `${t("Notes")}`
                              : viewNote === "prompt"
                                ? `${t("Prompt")}: ${meeting?.solution
                                  ? meeting?.solution?.title
                                  : t(
                                    `types.${meeting?.prompts[0]?.meeting_type}`
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
                              {viewNote === "note" && (
                                <>
                                  {/* ====================== EXPORT BUTTON ====================== */}
                                  {/* ====================== EXPORT DROPDOWN ====================== */}
                                  <Dropdown className="d-inline-block me-2"
                                    style={{ background: "#2c48ae", borderRadius: "50px" }}
                                  >
                                    <Dropdown.Toggle
                                      className="toggle-button-option play-btn d-flex align-items-center"
                                      id="dropdown-export"
                                      disabled={isGeneratingPDF || isGeneratingDoc}
                                      variant="" // Prevent default btn-primary override if custom classes handle styling
                                    >
                                      {isGeneratingPDF || isGeneratingDoc ? (
                                        <>
                                          <div
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                          >
                                            <span className="visually-hidden">
                                              Generating...
                                            </span>
                                          </div>
                                          <span className="d-none d-md-inline">
                                            {isGeneratingPDF
                                              ? "PDF en cours..."
                                              : "Word en cours..."}
                                          </span>
                                          <span className="d-inline d-md-none">
                                            ...
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <IoCloudDownloadOutline
                                            size={18}
                                            className="me-1"
                                          />
                                          <span className="d-none d-md-inline">
                                            Export
                                          </span>
                                        </>
                                      )}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="shadow-lg border-0 rounded-3" style={{ maxWidth: '90vw', minWidth: '220px' }}>
                                      <Dropdown.Item
                                        onClick={() => exportToPDF()}
                                        disabled={isGeneratingPDF || isGeneratingDoc}
                                        className="d-flex align-items-center py-2 px-3"
                                      >
                                        <FaRegFilePdf className="me-3 text-danger" size={20} />
                                        <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Export PDF</span>
                                          <small className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '200px' }}>{meeting?.title}</small>
                                        </div>
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => exportSingleReportToPDF()}
                                        disabled={isGeneratingPDF || isGeneratingDoc}
                                        className="d-flex align-items-center py-2 px-3"
                                      >
                                        <FaRegFilePdf className="me-3 text-danger" size={20} />
                                        <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Export PDF (Objective)</span>
                                          <small className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '200px' }}>{meeting?.objective}</small>
                                        </div>
                                      </Dropdown.Item>

                                      <Dropdown.Divider className="my-1" />

                                      <Dropdown.Item
                                        onClick={() => exportToDoc()}
                                        disabled={isGeneratingPDF || isGeneratingDoc}
                                        className="d-flex align-items-center py-2 px-3"
                                      >
                                        <FaRegFileWord className="me-3 text-primary" size={20} />
                                        <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Export WORD</span>
                                          <small className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '200px' }}>{meeting?.title}</small>
                                        </div>
                                      </Dropdown.Item>
                                      <Dropdown.Item 
                                        onClick={() => exportSingleReportToDoc()}
                                        disabled={isGeneratingPDF || isGeneratingDoc}
                                        className="d-flex align-items-center py-2 px-3"
                                      >
                                        <FaRegFileWord className="me-3 text-primary" size={20} />
                                        <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Export WORD (Objective)</span>
                                          <small className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '200px' }}>{meeting?.objective}</small>
                                        </div>
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>

                                  {/* ====================== SINGLE REPORT EXPORT ====================== */}
                                  {/* {(meeting?.meeting_notes_summary || markdownContent) && (
                                    <Dropdown className="d-inline-block me-2"
                                      style={{ background: "#2c48ae", borderRadius: "50px" }}
                                    >
                                      <Dropdown.Toggle
                                        className="toggle-button-option play-btn d-flex align-items-center"
                                        id="dropdown-export-single"
                                        disabled={isGeneratingPDF || isGeneratingDoc}
                                        variant=""
                                      >
                                        <IoCloudDownloadOutline size={18} className="me-1" />
                                        <span className="d-none d-md-inline">Export (Simple)</span>
                                      </Dropdown.Toggle>

                                      <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => exportSingleReportToPDF()}>
                                          PDF (Simple)
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => exportSingleReportToDoc()}>
                                          Word (Simple)
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  )} */}

                                  <button
                                    className="toggle-button-option play-btn"
                                    onClick={() => {
                                      setShowInstructionModal(true);
                                    }}
                                  >
                                    <span className="d-none d-md-inline">
                                      Ajouter l'instruction
                                    </span>
                                    <span className="d-inline d-md-none">
                                      Instruction
                                    </span>
                                  </button>
                                  <span
                                    onClick={() => {
                                      const textToCopy =
                                        "This is the text you want to copy!";
                                      navigator.clipboard
                                        .writeText(
                                          meeting?.meeting_notes_summary || ""
                                        )
                                        .then(() => {
                                          toast.success("Copied to clipboard!");
                                        })
                                        .catch((err) => {
                                          console.error(
                                            "Failed to copy: ",
                                            err
                                          );
                                        });
                                    }}
                                    className="cursor-pointer text-xl hover:text-blue-500 transition-colors duration-200"
                                    title="Copy"
                                  >
                                    <IoCopyOutline size={18} />
                                  </span>
                                </>
                              )}
                              {/* Edit icon for notes */}
                              {viewNote === "note" && (
                                <Tooltip
                                  arrow
                                  PopperProps={{
                                    sx: {
                                      "& .MuiTooltip-tooltip": {
                                        bgcolor: "#424242",
                                        fontSize: "0.8rem",
                                        padding: "6px 12px",
                                      },
                                      "& .MuiTooltip-arrow": {
                                        color: "#424242",
                                      },
                                    },
                                  }}
                                >
                                  <button
                                    className="toggle-button-option"
                                    onClick={() => {
                                      setIsEditing(!isEditing);
                                      // If we're entering edit mode and there's no content, initialize with empty string
                                      if (!isEditing && !meetingSummary) {
                                        setMeetingSummary("");
                                        // setMarkdownContent("");
                                      }
                                    }}
                                    style={{
                                      background: isEditing
                                        ? "#e8f0fe"
                                        : "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "8px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition:
                                        "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                      color: isEditing ? "#1967d2" : "#5f6368",
                                      boxShadow: isEditing
                                        ? "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)"
                                        : "none",
                                      ":hover": {
                                        background: isEditing
                                          ? "#d2e3fc"
                                          : "#f1f3f4",
                                        color: isEditing
                                          ? "#185abc"
                                          : "#202124",
                                        transform: "scale(1.1)",
                                        boxShadow:
                                          "0 1px 3px 0 rgba(60,64,67,0.302), 0 4px 8px 3px rgba(60,64,67,0.149)",
                                      },
                                      ":active": {
                                        transform: "scale(0.95)",
                                      },
                                    }}
                                  >
                                    <MdEdit
                                      size={18}
                                      style={{
                                        transition: "transform 0.2s ease",
                                      }}
                                    />
                                  </button>
                                </Tooltip>
                              )}

                              <div className="toggle-button">
                                <button
                                  className={`toggle-button-option ${viewNote === "note" ? "active" : ""
                                    }`}
                                  onClick={() => handleViewToggle("note")}
                                >
                                  <div className="icon-list" />
                                  <MdOutlineSummarize size={20} />
                                </button>
                                <button
                                  className={`toggle-button-option ${viewNote === "transcript" ? "active" : ""
                                    }`}
                                  onClick={() => handleViewToggle("transcript")}
                                >
                                  <div className="icon-graph" />
                                  <CgTranscript size={18} />
                                </button>
                              </div>
                            </span>
                          </h4>
                          {loading || audioUploadStage ? (
                            <div 
                              className="progress-overlay d-flex justify-content-center align-items-center" 
                              style={{ 
                                height: "100vh", 
                                width: "100%",
                                flexDirection: "column",
                                background: "rgba(255, 255, 255, 0.8)",
                                borderRadius: "12px",
                                border: "1px solid #eee",
                                // margin: "20px 0"
                              }}
                            >
                              <div style={{ width: "80%", maxWidth: "450px" }}>
                                <ProgressBar animated now={progress || 45} variant="primary" style={{ height: "12px", borderRadius: "6px" }} />
                                <h5 className="text-center mt-4" style={{ color: "#0026b1", fontWeight: "600" }}>
                                  {uploadStage || t("note_translation.Processing Audio")}
                                </h5>
                              </div>
                            </div>
                          ) : (
                            <>
                              {viewNote === "note" ? (
                                showProgressBar ? (
                                  <>
                                    <div className="progress-container">
                                      <div
                                        className="progress"
                                        style={{ width: `${50}%` }}
                                      />
                                    </div>
                                    <h5 className="text-center">
                                      {t("note_translation.Processing Notes")}
                                    </h5>
                                  </>
                                ) : isEditing ? (
                                  <>
                                    <div
                                      style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        minHeight: "350px",
                                      }}
                                    >
                                      <MDXEditor
                                        markdown={cleanText(meetingSummary)}
                                        onChange={(newValue) => {
                                          setMeetingSummary(newValue);
                                          debouncedAutoSave(newValue);
                                        }}
                                        plugins={[
                                          headingsPlugin(),
                                          listsPlugin(),
                                          markdownShortcutPlugin(),
                                        ]}
                                        contentEditableClassName="french-content-editor"
                                      />
                                      {/* <textarea
                                        value={cleanText(meetingSummary)}
                                        onChange={(e) => {
                                          setMeetingSummary(e.target.value);
                                          debouncedAutoSave(e.target.value);
                                        }}
                                        style={{
                                          width: "100%",
                                          height: "350px",
                                          border: "1px solid #ddd",
                                          borderRadius: "4px",
                                          padding: "10px",
                                          boxSizing: "border-box",
                                        }}
                                      /> */}
                                    </div>
                                  </>
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
                                        p: ({ node, ...props }) => (
                                          <p {...props} />
                                        ),
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
                                      {cleanText(markdownContent)}
                                    </ReactMarkdown>
                                  </div>
                                )
                              ) : (
                                <>
                                  {/* {transcriptLoading ? (
                                  <> */}
                                  {/* <div className="progress-container">
                                      <div
                                        className="progress"
                                        style={{width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                                      />
                                    </div>
                                    <h5 className="text-center">
                                      {t("note_translation.Fetching Transcription")}
                                    </h5>
                                    </>
                                ):( */}
                                  {/* <> */}

                                  <TranscriptWithTimestamps
                                    transcriptData={meetingTranscript}
                                  />
                                  {/* </> */}
                                  {/* // )

                                
                                // } */}
                                </>
                              )}

                              {viewNote === "note" ? (
                                <div className="mt-2">
                                  {isEditing && (
                                    <button
                                      className={`btn moment-btn`}
                                      onClick={() => handleSave1(meeting)}
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
                                  )}
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      </>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="files">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      {/* ------------------------------------------------ Files */}
                      <div>
                        <div style={{ marginTop: "5rem" }}>
                          <h4 className={`participant-heading-meeting`}>
                            {`${t("meeting.newMeeting.labels.file")} `}
                          </h4>
                          <CompletedMomentStepFile
                            data={meeting?.meeting_files}
                            openModal={openModal}
                            refreshMeetings={getRefreshedMeeting}
                          />
                        </div>
                        {isModalOpen && (
                          <ViewFilePreview
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                            modalContent={modalContent}
                            closeModal={closeModal}
                            isFileUploaded={isFileUploaded}
                            setIsFileUploaded={setIsFileUploaded}
                            refreshMeeting={getRefreshedMeeting}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="feedbacks">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 ">
                      {meeting?.meeting_feedbacks?.length > 0 && (
                        <div style={{ marginTop: "5rem" }}>
                          <h4 className={`participant-heading-meeting`}>
                            {`${t(
                              "meeting.newMeeting.labels.momentFeedback"
                            )} `}
                          </h4>
                          <FeedbackCard meeting={meeting} />
                        </div>
                      )}
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="discussion">
                  <div className="row d-flex justify-content-center">
                    <div className="col-md-12 mb-3">
                      {/* ------------------------------------------------ Files */}
                      <div
                      // style={{
                      //   marginTop: "3rem",
                      //   marginBottom: "3rem",
                      // }}
                      >
                        {/* <h4 className="participant-heading-meeting">
                          {`${t("meeting.newMeeting.labels.discussion")} `}
                        </h4> */}

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
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>

          <div
            className="cards-section child-2"
            style={{ marginBottom: "4rem" }}
          >
            {meeting?.plan_d_actions?.length > 0 && (
              <div
                className="row"
                style={{ marginTop: "5rem", marginBottom: "3rem" }}
              >
                <h4
                  className={
                    fromMeeting
                      ? "participant-heading-meeting d-flex justify-content-between align-items-center"
                      : "participant-heading d-flex justify-content-between align-items-center"
                  }
                >
                  {`${t("planDActions")} `}
                  <Button
                    className="play-btn"
                    onClick={() => {
                      if (
                        meeting?.plan_d_actions[0]?.strategy_meeting?.status ===
                        "closed"
                      ) {
                        navigate(
                          `/present/invite/${meeting?.plan_d_actions[0]?.strategy_meeting?.id}`,
                          { state: { meeting, from: "meeting" } }
                        );
                      } else {
                        navigate(
                          `/invite/${meeting?.plan_d_actions[0]?.strategy_meeting?.id}`,
                          {
                            state: { meeting, from: "meeting" },
                          }
                        );
                      }
                    }}
                  >
                    {t("dropdown.View")}
                  </Button>
                </h4>
                <div className="col-md-12">
                  <BotTable bordered className="action-table">
                    <thead>
                      <tr className="table-row">
                        {/* <th className="table-row-head"></th> */}
                        <th
                          className="table-row-head"
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions?.map((user, index) => (
                        <tr className="table-data" key={user?.id}>
                          <td
                            style={{ width: "70%", paddingLeft: "28px" }}
                            className="table-data-row"
                          >
                            {user?.action}
                          </td>
                          <td className="text-center table-data-row ">
                            <span className="duree">
                              {String(user?.action_days).split(".")[0]}
                            </span>
                          </td>
                          <td className="text-center table-data-row">
                            <Tooltip
                              title={user?.participant_full_name}
                              placement="top"
                            >
                              <Avatar
                                src={
                                  user?.participant_image?.includes("users")
                                    ? Assets_URL + "/" + user?.participant_image
                                    : user?.participant_image
                                }
                              />
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </BotTable>
                </div>
              </div>
            )}

            {meeting?.step_decisions &&
              meeting?.step_decisions.some((decision) => decision !== null) && (
                <div
                  className="decision-section"
                  style={{ marginTop: "5rem", marginBottom: "3rem" }}
                >
                  <div style={{ marginTop: "2rem" }}>
                    <h4 className="participant-heading-meeting">
                      {`${t("meeting.newMeeting.labels.decisions")} `}
                    </h4>

                    <ReportDecisionCard
                      data={meeting?.steps}
                      meeting={meeting}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
      {open && (
        <div className="tabs-container">
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
              refreshMeeting={getRefreshedMeeting}
            />
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

      <>
        {showInstructionModal && (
          <Modal
            show={showInstructionModal}
            onHide={() => {
              setShowInstructionModal(null);
              setShowAIDropdown(false);
              // Reset checkbox state when closing
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
              {/* Custom dropdown-like display for Mistral */}
              {/* AI Model Selection Dropdown */}
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
                  {/* Dynamic Logo based on selection */}
                  <img
                    src={
                      selectedAI === "mistral"
                        ? "/Assets/m-rainbow.png"
                        : selectedAI === "claude"
                          ? "/Assets/claude-logo-.png"
                          : "/Assets/Tek.png" // Fallback/Placeholder for Tektime logo
                    }
                    alt={`${selectedAI} Logo`}
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "8px",
                    }}
                  />
                  <span
                    style={{ fontSize: "14px", textTransform: "capitalize" }}
                  >
                    {selectedAI}
                  </span>
                  {/* Dropdown arrow icon */}
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

                {/* Dropdown Options */}
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
                    {/* Mistral Option */}
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

                    {/* Claude Option */}
                    {/* <div
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedAI("claude");
                        setShowAIDropdown(false);
                      }}
                    >
                      <img
                        src="/Assets/claude-logo-.png"
                        alt="Claude Logo"
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "8px",
                        }}
                      />
                      <span style={{ fontSize: "14px" }}>Claude</span>
                    </div> */}
                  </div>
                )}
              </div>



              {/* Automatic Prompt Checkbox - For Mistral and Claude */}
              {(selectedAI === "claude" || selectedAI === "mistral") && (
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
                          setValue(""); // Clear editor when unchecked
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
              )}

              {/* Progress Bar */}
              {loading1 && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.3)", // lighter dark overlay
                    backdropFilter: "blur(6px)", // 👈 blur background
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

              {/* Editor */}
              {/* {isAutomaticPrompt && ( */}
              <Editor
                className="editor-no-border text_editor"
                id="text_editor"
                name="text"
                apiKey={APIKEY}
                onInit={(evt, editor) => (editorRef.current = editor)}
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

                  // 👇 Add this
                  directionality: "ltr",

                  content_style: `
       body { direction: ltr; text-align: left; }
       img.img-rounded { border-radius: 8px; }
     `,
                }}
              />
              {/* )} */}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger"
                onClick={() => setShowInstructionModal(false)}
              >
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
                  padding: "10px 16px",
                }}
                onClick={() => setShowConfirmModal(true)} // Show confirmation modal
              >
                {t("Validate")}
              </button>
            </Modal.Footer>
          </Modal>
        )}
        <style>{styles}</style>

        {/* Confirmation Modal */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
          backdrop="static"
          backdropClassName="custom-blur-backdrop"
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ direction: "ltr", fontFamily: "Inter, sans-serif" }}
          >
            Êtes-vous sûr de vouloir remplacer l'ancien résumé ?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Non
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowConfirmModal(false); // Close confirmation modal
                handleValidate(); // Proceed with API call
              }}
            >
              Oui
            </Button>
          </Modal.Footer>
        </Modal>
      </>

      {
        isPrivacyModal && (
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
        )
      }
    </>
  );
};

export default CompletedInvite;
