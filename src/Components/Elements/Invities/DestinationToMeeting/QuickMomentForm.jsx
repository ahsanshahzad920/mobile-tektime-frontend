import CookieService from "../../../Utils/CookieService";
import { createPortal } from "react-dom";
import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import {
  Modal,
  Button,
  Tooltip,
  OverlayTrigger,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import Creatable from "react-select/creatable";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  getOptions,
  markTodoMeeting,
  solutionTypeIcons,
} from "../../../Utils/MeetingFunctions";
import { getUserRoleID } from "../../../Utils/getSessionstorageItems";
import Select from "react-select";
import { format } from "date-fns";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { French } from "flatpickr/dist/l10n/fr.js";
import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
import QuickStepChart from "./QuickStepChart";
import moment from "moment";
import {
  formatDate,
  formatTime,
} from "../../Meeting/GetMeeting/Helpers/functionHelper";
import { useNavigate } from "react-router-dom";
import { MdEventAvailable, MdOutlineSupport, MdWork } from "react-icons/md";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMap,
} from "react-icons/hi";
import {
  AiOutlineAudit,
  AiOutlineFileText,
  AiOutlineBell,
  AiOutlineMessage,
  AiOutlineClockCircle,
  AiOutlinePlayCircle,
  AiOutlinePlaySquare,
} from "react-icons/ai";
import { FaBookOpen, FaBullseye, FaChalkboardTeacher } from "react-icons/fa";
import {
  SiGooglecalendar,
  SiGooglemeet,
  SiMicrosoftoutlook,
} from "react-icons/si";
import Solution from "../../Meeting/CreateNewMeeting/components/Template";
import CalendlySettings from "../../Meeting/CreateNewMeeting/components/CalendlySettings";
import RepetitionSettings from "../../Meeting/CreateNewMeeting/components/RepetitionSettings";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";
import { useMeetings } from "../../../../context/MeetingsContext";

const QuickMomentForm = ({
  show,
  onClose,
  openedFrom,
  destination,
  meetingData,
  // answer,
  // refresh,
}) => {
  const [t] = useTranslation("global");
  console.log("destination", destination);
  const [step, setStep] = useState(
    meetingData ? 2 : openedFrom === "mission" ? 1 : 1,
  );
  const [momentType, setMomentType] = useState("");
  const [momentName, setMomentName] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [stepsList, setStepsList] = useState([]);
  const [newStep, setNewStep] = useState("");
  const [isDrop, setIsDrop] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [id, setId] = useState(null);
  const { user } = useHeaderTitle();
  const { setCallApi, setFromTektime } = useMeetings();
  const sessionUser = CookieService.get("email")?.toLowerCase()?.trim();
  // Client and mission states
  const [client, setClient] = useState(null);
  const [clientId, setClientId] = useState(null);
  const {
    checkId,
    setCheckId,
    deleteMeeting,
    saveDraft,
    open,
    handleCloseModal,
    isUpdated,
    isDuplicate,
    validateAndUpdate,
    addParticipant,
    changePrivacy,
    changeContext,
    changeOptions,
    // meeting,
    // setMeeting,
    setSelectedTab,
    setFormState,
    formState,
    // getMeeting,
    handleInputBlur,
    selectedSolution,
    googleLoginAndSaveProfileScheduled,
    showProgressBar,
    setShowProgressBar,
    progress,
    setProgress,
  } = useFormContext();

  const [mission, setMission] = useState(null);
  const [missionId, setMissionId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [destinationType, setDestinationType] = useState(null);
  const [usersArray, setUsersArray] = useState([]);
  const [missionOptions, setMissionOptions] = useState([]);

  const navigate = useNavigate();
  const [isManualTitle, setIsManualTitle] = useState(false);
  const [isManualMission, setIsManualMission] = useState(false);

  // Handle client selection
  const handleClientSelect = (selectedOption) => {
    setSelectedClient(selectedOption);
    setSelectedMission(null);
    setIsManualMission(false);
    setIsManualTitle(false);
  };

  // Update mission selection handler to fetch moments
  const handleMissionSelect = (selectedOption) => {
    setSelectedMission(selectedOption);
    setIsManualMission(true);
  };

  const { language } = useDraftMeetings();
  let [locale, setLocale] = useState(null);
  useEffect(() => {
    if (language === "en") {
      setLocale(undefined);
    } else {
      setLocale(French);
    }
  }, [language]);

  // useEffect(() => {
  //   if (show && answer && step === 1) {
  //     const matchSolution = async () => {
  //       try {
  //         const response = await axios.get(
  //           `${API_BASE_URL}/get-all-solutions`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${CookieService.get("token")}`,
  //             },
  //           },
  //         );
  //         if (response?.status === 200) {
  //           const solutions = response.data.data || [];

  //           // More robust matching: check if solution title is contained in the answer
  //           // or if the answer is contained in the solution title.
  //           const matchingSolution = solutions.find((s) => {
  //             const title = s.title?.toLowerCase().trim();
  //             const ans = answer.toLowerCase().trim();
  //             return ans.includes(title) || title.includes(ans);
  //           });

  //           if (matchingSolution) {
  //             setFormState((prev) => ({
  //               ...prev,
  //               solution_id: matchingSolution.id,
  //               solution_tab: "use a template",
  //             }));
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error matching solution:", error);
  //       }
  //     };
  //     matchSolution();
  //   }
  // }, [show, answer, step]);
  useEffect(() => {
    if (show && meetingData) {
      // Direct jump to step 2 handled by initial state, but ensure it if show changes
      if (step === 1) setStep(2);
      if (meetingData?.created_from_whatsapp) {
        setFormState(meetingData);
        setMeeting(meetingData);

        // Map Date and Time
        const mTime = meetingData.time || meetingData.start_time;
        if (meetingData.date && mTime) {
          const [year, month, day] = meetingData.date.split("-");
          const [hour, minute] = mTime.split(":");
          const newD = new Date(year, month - 1, day, hour, minute);
          setSelectedDateTime(newD);
        }

        // Map Title
        if (meetingData.title) {
          setMomentName(meetingData.title);
          setIsManualTitle(true);
        }
      } else {
        // Original mapping for other cases
        if (meetingData.date && meetingData.time) {
          const [year, month, day] = meetingData.date.split("-");
          const [hour, minute] = meetingData.time.split(":");
          const newD = new Date(year, month - 1, day, hour, minute);
          setSelectedDateTime(newD);
        }

        if (meetingData.title) {
          setMomentName(meetingData.title);
          setIsManualTitle(true);
        }
      }

      if (meetingData?.solution && meetingData?.created_from_whatsapp === true) {
        setFormState((prev) => ({
          ...prev,
          solution_id: meetingData.solution.id,
          solution_tab: "use a template",
        }));
      }

      // Map Template (Solution)
      if (meetingData.solution_suggestion && meetingData?.created_from_whatsapp === true) {
        const matchSolution = async () => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/get-all-solutions`,
              {
                headers: {
                  Authorization: `Bearer ${CookieService.get("token")}`,
                },
              },
            );
            if (response?.status === 200) {
              const solutions = response.data.data || [];
              const suggestion = meetingData.solution_suggestion
                .toLowerCase()
                .trim();

              const matchingSolution = solutions.find((s) => {
                const title = s.title?.toLowerCase().trim();
                return suggestion.includes(title) || title.includes(suggestion);
              });

              if (matchingSolution) {
                setFormState((prev) => ({
                  ...prev,
                  solution_id: matchingSolution.id,
                  solution_tab: "use a template",
                }));
              }
            }
          } catch (error) {
            console.error("Error matching solution:", error);
          }
        };
        matchSolution();
      }

      // Map Client
      const clientObj = meetingData.client || meetingData.clients;
      if (clientObj) {
        setSelectedClient({
          value: clientObj.id,
          label: clientObj.name,
          data: {
            client_logo: clientObj.client_logo || "",
          },
        });
        setClientId(clientObj.id);
      }

      // Map Mission (Destination)
      if (meetingData.destination) {
        setSelectedMission({
          value: meetingData.destination.id,
          label: meetingData.destination.destination_name,
          type: meetingData.destination.destination_type,
          data: {
            description: meetingData.destination.destination_description,
          },
        });
      }

      // Map Participants (Invites)
      if (meetingData.participants && Array.isArray(meetingData.participants)) {
        const mappedParticipants = meetingData.participants.map((p) => ({
          id: p.id || null,
          email: p.email,
          first_name: p.first_name || p.name || "",
          last_name: p.last_name || "",
          post: p.post || p.role || "",
          client: p.client || null,
          client_id: p.client_id || null,
          contribution: p.contribution || "",
          meeting_id: checkId || null,
        }));

        setFormState((prev) => ({
          ...prev,
          participants: mappedParticipants,
        }));
      }

      // Map Repetition Settings
      if (meetingData.repetition !== undefined) {
        setFormState((prev) => ({
          ...prev,
          repetition: !!meetingData.repetition,
          repetition_frequency:
            meetingData.repetition_frequency ||
            prev.repetition_frequency ||
            "Weekly",
          repetition_number: meetingData.repetition_number || 1,
          repetition_end_date:
            meetingData.repetition_end_date || prev.repetition_end_date,
          selected_days: meetingData.selected_days || prev.selected_days || [],
        }));
      }
    }
  }, [show, meetingData, checkId]);

  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const formatDateWithCustomTime = (date) => {
    return format(date, "dd/MM/yyyy, HH'h'mm");
  };

  const formatMissionOption = ({ label, status }) => {
    let statusColor = "#5b7aca";
    let localizedStatus = t("mission-badges.upcoming");

    if (status === "in_progress") {
      statusColor = "#f2db43";
      localizedStatus = t("mission-badges.inProgress");
    } else if (status === "closed") {
      statusColor = "rgba(47, 187, 103, 0.1019607843)";
      localizedStatus = t("mission-badges.completed");
    } else if (status === "active") {
      statusColor = "#5b7aca";
      localizedStatus = t("mission-badges.upcoming");
    } else if (status === "TODO") {
      statusColor = "#5b7aca";
      localizedStatus = t("mission-badges.new");
    } else {
      // Fallback for new options
      statusColor = "#ccc";
      localizedStatus = t("mission-badges.new"); // or 'Custom'
    }

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{label}</span>
        <span
          style={{
            backgroundColor: statusColor,
            color: status === "closed" ? "#2fa25d" : "#fff",
            padding: "2px 8px",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        >
          {localizedStatus}
        </span>
      </div>
    );
  };

  const displayVisioLinks =
    user?.visioconference_links?.filter((link) => {
      // If Outlook is the active context, only permit Microsoft Teams (if it's also selected)
      if (
        formState?.agenda === "Outlook Agenda" ||
        formState?.location === "Microsoft Teams"
      ) {
        return (
          link.platform === "Microsoft Teams" &&
          formState?.location === "Microsoft Teams"
        );
      }
      // If Google is the active context, only permit Google Meet (if it's also selected)
      if (
        formState?.agenda === "Google Agenda" ||
        formState?.location === "Google Meet"
      ) {
        return (
          link.platform === "Google Meet" &&
          formState?.location === "Google Meet"
        );
      }
      return false;
    }) || [];

  const displayAgendaLinks =
    user?.integration_links?.filter((link) => {
      // If Outlook is the active context, only permit Outlook Agenda (if it's also selected)
      if (
        formState?.location === "Microsoft Teams" ||
        formState?.agenda === "Outlook Agenda"
      ) {
        return (
          link.platform === "Outlook Agenda" &&
          formState?.agenda === "Outlook Agenda"
        );
      }
      // If Google is the active context, only permit Google Agenda (if it's also selected)
      if (
        formState?.location === "Google Meet" ||
        formState?.agenda === "Google Agenda"
      ) {
        return (
          link.platform === "Google Agenda" &&
          formState?.agenda === "Google Agenda"
        );
      }
      return false;
    }) || [];


  const getFilteredMissions = () => {
    if (!selectedClient) return []; // No client selected, show empty

    return missionOptions.filter(
      (mission) => mission.client_id === selectedClient.value,
    );
  };

  const [isProcessingOutlookLogin, setIsProcessingOutlookLogin] =
    useState(false);
  const { setUser: setGlobalUser, setCallUser } = useHeaderTitle();

  const outlookLoginAndSaveProfile = async () => {
    if (isProcessingOutlookLogin) {
      console.log("Outlook login already in progress, skipping.");
      return;
    }

    setIsProcessingOutlookLogin(true);
    setShowProgressBar(true);
    setProgress(10);

    try {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        `${process.env.REACT_APP_API_BASE_URL}/outlook-login?user_id=${CookieService.get("user_id")}`,
        "Outlook Login",
        `width=${width},height=${height},top=${top},left=${left}`,
      );

      if (!popup) {
        toast.error("Popup was blocked. Please allow popups for this site.");
        setIsProcessingOutlookLogin(false);
        setShowProgressBar(false);
        return;
      }

      setProgress(30);

      const messageHandler = async (event) => {
        if (event.origin !== `${process.env.REACT_APP_API_BASE_URL}`) {
          console.warn("⚠️ Ignored message from unknown origin:", event.origin);
          return;
        }

        const { type, data } = event.data || {};

        if (type === "outlook-login-success") {
          console.log("✅ Outlook login success:", data);
          window.removeEventListener("message", messageHandler);
          clearInterval(interval);

          if (!popup.closed) popup.close();

          try {
            await onOutlookLoginSuccess(data);
          } catch (err) {
            console.error("Error processing Outlook login:", err);
            toast.error("Failed to complete Outlook login.");
          } finally {
            setIsProcessingOutlookLogin(false);
            setProgress(100);
            setTimeout(() => {
              setShowProgressBar(false);
            }, 1000);
          }
        } else if (type === "outlook-login-failed") {
          console.warn("⚠️ Outlook login failed:", data);
          toast.error("Outlook login failed.");
          window.removeEventListener("message", messageHandler);
          clearInterval(interval);
          if (!popup.closed) popup.close();
          setIsProcessingOutlookLogin(false);
          setShowProgressBar(false);
        }
      };

      window.addEventListener("message", messageHandler);

      const interval = setInterval(() => {
        if (popup.closed) {
          console.log("Popup closed by user.");
          clearInterval(interval);
          window.removeEventListener("message", messageHandler);
          setIsProcessingOutlookLogin(false);
          setShowProgressBar(false);
        }
      }, 500);
    } catch (error) {
      console.error("Unexpected error during Outlook login:", error);
      toast.error("Something went wrong during Outlook login.");
      setIsProcessingOutlookLogin(false);
      setShowProgressBar(false);
    }
  };

  const onOutlookLoginSuccess = async (outlookData) => {
    try {
      const userId = CookieService.get("user_id");
      const token = CookieService.get("token");

      if (!userId || !token) {
        toast.error("User session not found.");
        return;
      }

      // Fetch user data to get outlook_user_info
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data?.data;
      console.log("✅ User data fetched after Outlook login:", userData);

      if (!userData) {
        toast.error("User data not found.");
        return;
      }

      const { mail, displayName } = userData?.outlook_user_info || {};
      if (!mail || !displayName) {
        toast.error("Incomplete Outlook user information.");
        return;
      }

      // Update user state with Outlook links
      const updatedUser = {
        ...user,
        integration_links: [
          ...user.integration_links.filter(
            (link) => link.platform !== "Outlook Agenda",
          ),
          { platform: "Outlook Agenda", value: displayName },
        ],
        visioconference_links: [
          ...user.visioconference_links.filter(
            (link) => link.platform !== "Microsoft Teams",
          ),
          { platform: "Microsoft Teams", value: displayName },
        ],
        email_links: [
          ...user.email_links.filter((link) => link.platform !== "Outlook"),
          { platform: "Outlook", value: mail },
        ],
      };
      setGlobalUser(updatedUser);

      // Prepare FormData for profile update
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", user?.title || "");
      formData.append("name", user?.name || "");
      formData.append("last_name", user?.last_name || "");
      formData.append("email", user?.email || "");
      formData.append("phoneNumber", user?.phoneNumber || "");
      formData.append("enterprise_id", user?.enterprise?.id || "");
      formData.append("bio", user?.bio || "");
      formData.append("post", user?.post || "");
      formData.append("role_id", user?.role_id || "");
      formData.append("timezone", moment.tz.guess() || "Europe/Paris");
      formData.append("visibility", user?.visibility || "public");

      user?.social_links?.forEach((link, index) => {
        if (link.id) formData.append(`social_links[${index}][id]`, link.id);
        formData.append(`social_links[${index}][platform]`, link.platform);
        formData.append(`social_links[${index}][link]`, link.link);
      });

      user?.websites?.forEach((site, index) => {
        if (site.id) formData.append(`websites[${index}][id]`, site.id);
        formData.append(`websites[${index}][title]`, site.title);
        formData.append(`websites[${index}][link]`, site.link);
      });

      user?.affiliation_links?.forEach((site, index) => {
        if (site.id)
          formData.append(`affiliation_links[${index}][id]`, site.id);
        formData.append(`affiliation_links[${index}][title]`, site.title);
        formData.append(`affiliation_links[${index}][link]`, site.link);
      });

      updatedUser.integration_links.forEach((link, index) => {
        if (link.id)
          formData.append(`integration_links[${index}][id]`, link.id);
        formData.append(`integration_links[${index}][platform]`, link.platform);
        formData.append(`integration_links[${index}][value]`, link.value);
      });

      updatedUser.visioconference_links.forEach((link, index) => {
        if (link.id)
          formData.append(`visioconference_links[${index}][id]`, link.id);
        formData.append(
          `visioconference_links[${index}][platform]`,
          link.platform,
        );
        formData.append(`visioconference_links[${index}][value]`, link.value);
      });

      updatedUser.email_links.forEach((link, index) => {
        if (link.id) formData.append(`email_links[${index}][id]`, link.id);
        formData.append(`email_links[${index}][platform]`, link.platform);
        formData.append(`email_links[${index}][value]`, link.value);
      });

      user?.teams?.forEach((team) => {
        formData.append("team_id[]", team.id);
      });

      if (user?.image?.startsWith("data:image/")) {
        const blob = await (await fetch(user.image)).blob();
        formData.append("image", blob, "profile-image.jpg");
      } else if (user?.image) {
        formData.append("image", user.image);
      }

      if (user?.profile_banner?.startsWith("data:image/")) {
        const blob = await (await fetch(user.profile_banner)).blob();
        formData.append("profile_banner", blob, "profile-banner.jpg");
      } else if (user?.profile_banner) {
        formData.append("profile_banner", user.profile_banner);
      }

      if (user?.video?.startsWith("blob:")) {
        const blob = await (await fetch(user.video)).blob();
        formData.append("video", blob, "video-preview.mp4");
      } else if (user?.video) {
        formData.append("video", user.video);
      }

      const profileResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(
          `Failed to update user profile: ${profileResponse.status}`,
        );
      }

      const responseData = await profileResponse.json();
      setGlobalUser(responseData?.data?.data || updatedUser);
      setCallUser((prev) => !prev);
      setProgress(90);

      if (checkId) {
        await getMeeting(checkId);
      }

      // Store tokens from outlookData
      sessionStorage.setItem(
        "outlook_access_token",
        outlookData?.outlook_access_token,
      );
      sessionStorage.setItem(
        "outlook_refresh_token",
        outlookData?.outlook_refresh_token,
      );
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update Outlook data.",
      );
      setShowProgressBar(false);
    }
  };

  const [participantOptions, setParticipantOptions] = useState([]);
  const [isFetchingParticipants, setIsFetchingParticipants] = useState(false);

  // Custom styles for the select dropdown to match the design in the discussion part
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: 40,
      borderColor: "#d9d9d9",
      "&:hover": { borderColor: "#40a9ff" },
      borderRadius: "8px",
      boxShadow: "none",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e6f7ff",
      border: "1px solid #91d5ff",
      borderRadius: "4px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1890ff",
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: "#1890ff",
      fontWeight: "bold",
      textTransform: "none",
      fontSize: 14,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  useEffect(() => {
    if (show) {
      const fetchParticipantsAndTeams = async () => {
        setIsFetchingParticipants(true);
        try {
          const token = CookieService.get("token");
          const headers = { Authorization: `Bearer ${token}` };

          const [participantsRes, teamsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/participants-email`, { headers }),
            axios.get(`${API_BASE_URL}/teams`, { headers }),
          ]);

          const participantsData = participantsRes.data.data || [];
          const teamsData = teamsRes.data.data || [];

          // Filter Teams based on user role (matching Team.jsx logic)
          let filteredTeams = teamsData;
          const roleId = getUserRoleID();
          const userId = CookieService.get("user_id");

          if (roleId === 1) {
            filteredTeams = teamsData;
          } else if (roleId === 2) {
            if (teamsRes.data?.enterprise) {
              CookieService.set(
                "enterprise",
                JSON.stringify(teamsRes.data.enterprise),
              );
            }
            filteredTeams = teamsData.filter(
              (team) => team?.created_by?.id == userId,
            );
          } else if (roleId === 3) {
            if (teamsRes.data?.enterprise) {
              CookieService.set(
                "enterprise",
                JSON.stringify(teamsRes.data.enterprise),
              );
            }
            const enterprise = JSON.parse(CookieService.get("enterprise"));
            filteredTeams = teamsData.filter(
              (team) => team?.enterprise?.id == enterprise?.id,
            );
          } else {
            if (teamsRes.data?.enterprise) {
              CookieService.set(
                "enterprise",
                JSON.stringify(teamsRes.data.enterprise),
              );
            }
            filteredTeams = teamsData.filter(
              (team) => team.created_by?.id == userId,
            );
          }

          const grouped = [];

          // Format Members
          const memberOptions = participantsData
            .filter(
              (p) =>
                p.type === "member" &&
                p.email?.toLowerCase()?.trim() !== sessionUser,
            )
            .map((p) => ({
              value: p.email,
              label:
                `${p.first_name || p.name || ""} ${p.last_name || ""} (${p.email})`.trim(),
              type: "user",
              data: p,
            }));

          if (memberOptions.length > 0) {
            grouped.push({
              label: t("Team Members") || "Team Members",
              options: memberOptions,
            });
          }

          // Format Contacts
          const contactOptions = participantsData
            .filter(
              (p) =>
                p.type === "contact" &&
                p.email?.toLowerCase()?.trim() !== sessionUser,
            )
            .map((p) => ({
              value: p.email,
              label:
                `${p.first_name || p.name || ""} ${p.last_name || ""} (${p.email})`.trim(),
              type: "user",
              data: p,
            }));

          if (contactOptions.length > 0) {
            grouped.push({
              label: t("Contacts") || "Contacts",
              options: contactOptions,
            });
          }

          // Format Teams
          const teamOptions = filteredTeams.map((team) => ({
            value: team.id,
            label: team.name,
            type: "team",
            data: team,
          }));

          if (teamOptions.length > 0) {
            grouped.push({
              label: t("Teams") || "Teams",
              options: teamOptions,
            });
          }

          setParticipantOptions(grouped);
        } catch (err) {
          console.error("Error fetching participants/teams", err);
        } finally {
          setIsFetchingParticipants(false);
        }
      };

      fetchParticipantsAndTeams();
    }
  }, [show, t]);

  // const handleSelectionChange = (selected) => {

  //   const participants = [];
  //   const teams = [];

  //   (selected || []).forEach((option) => {
  //     if (option.type === "user") {
  //       const participantId = option.data.meeting_id ? option.data.id : null;
  //       const clientId =
  //         option.data.client_id || option.data.clients?.id || null;

  //       participants.push({
  //         id: participantId,
  //         email: option.data.email,
  //         first_name: option.data.first_name || option.data.name || "",
  //         last_name: option.data.last_name || "",
  //         post: option.data.post || option.data.role || "",
  //         client: clientId
  //           ? null
  //           : option.data.clients?.name || option.data.client || null,
  //         client_id: clientId,
  //         contribution: option.data.contribution || "",
  //         meeting_id: checkId || null,
  //       });
  //     } else if (option.type === "team") {
  //       teams.push(option.data);
  //     } else if (option.__isNew__) {
  //       participants.push({
  //         email: option.value,
  //         first_name: option.value,
  //         last_name: "",
  //         isNew: true,
  //         post: "",
  //         client: null,
  //         client_id: null,
  //         contribution: "",
  //         meeting_id: checkId || null,
  //       });
  //     }
  //   });

  //   setFormState((prev) => ({
  //     ...prev,
  //     participants,
  //     teams,
  //   }));
  // };

  const handleSelectionChange = async (selected, actionMeta) => {
    const token = CookieService.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    const oldValues = getSelectValue() || [];
    const newValues = selected || [];

    // Find items that were removed by diffing old vs new
    const removedItems = oldValues.filter(
      (oldItem) =>
        oldItem &&
        !newValues.some(
          (newItem) =>
            newItem &&
            oldItem.type === newItem.type &&
            String(oldItem.value) === String(newItem.value),
        ),
    );

    if (removedItems.length > 0) {
      try {
        await Promise.all(
          removedItems.map((opt) => {
            if (!opt) return Promise.resolve();
            if (
              (opt.type === "user" || opt.type === "contact") &&
              opt.data?.id
            ) {
              return axios.delete(
                `${API_BASE_URL}/participants/${opt.data.id}`,
                { headers },
              );
            } else if (opt.type === "team" && opt.data?.id) {
              return axios.delete(`${API_BASE_URL}/teams/${opt.data.id}`, {
                headers,
              });
            }
            return Promise.resolve();
          }),
        );
        toast.success(t("Database updated successfully"));
      } catch (error) {
        console.error("Error deleting participant/team", error);
        toast.error(t("Failed to update database"));
      }
    }

    const participants = [];
    const teams = [];

    newValues.forEach((option) => {
      if (!option) return;

      if (option.type === "user" || option.type === "contact") {
        // Try to keep the ID from the previous state if it's already there
        const existingParticipant = (formState?.participants || []).find(
          (p) =>
            p?.email?.toLowerCase().trim() ===
            option.value?.toLowerCase().trim(),
        );

        const participantId = existingParticipant?.id || null;
        const clientId =
          option.data?.client_id || option.data?.clients?.id || null;

        participants.push({
          id: null,
          email: option.data?.email || option.value,
          first_name:
            option.data?.first_name || option.data?.name || option.label || "",
          last_name: option.data?.last_name || "",
          post: option.data?.post || option.data?.role || "",
          client: clientId
            ? null
            : option.data?.clients?.name || option.data?.client || null,
          client_id: clientId,
          contribution: option.data?.contribution || "",
          meeting_id:
            checkId ||
            option.data?.meeting_id ||
            existingParticipant?.meeting_id ||
            null,
        });
      } else if (option.type === "team") {
        if (option.data) teams.push(option.data);
      } else if (option.__isNew__) {
        participants.push({
          id: null,
          email: option.value,
          first_name: option.value,
          last_name: "",
          isNew: true,
          post: "",
          client: null,
          client_id: null,
          contribution: "",
          meeting_id: checkId || null,
        });
      }
    });

    setFormState((prev) => ({
      ...prev,
      participants,
      teams,
    }));
  };
  const getSelectValue = () => {
    const values = [];

    (formState.participants || [])
      ?.filter((item) => item?.email?.toLowerCase()?.trim() !== sessionUser)
      .forEach((p) => {
        values.push({
          value: p.email,
          label:
            `${p.first_name || ""} ${p.last_name || ""} (${p.email})`.trim(),
          type: "user",
          data: p,
        });
      });

    (formState.teams || []).forEach((t) => {
      values.push({
        value: t.id,
        label: t.name,
        type: "team",
        data: t,
      });
    });

    return values;
  };

  useEffect(() => {
    if (destination || meeting || meetingData) {
      setMissionId(destination?.id || meeting?.destination_id || meetingData?.destination_id);
      setClientId(destination?.client_id || meeting?.destination?.client_id || meetingData?.destination?.client_id);
      setDestinationType(
        destination?.destination_type || meeting?.destination?.destination_type || meetingData?.destination?.destination_type,
      );
    }
  }, [destination, meeting,meetingData]);
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
            "user_id",
          )}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status) {
          const clientsData = response.data.data;

          const userClients = clientsData
            .filter((client) => client.linked_to === "user")
            .map((client) => ({
              label: client.name,
              value: client.id,
              data: {
                client_logo: client.client_logo,
              },
            }));

          const enterpriseClients = clientsData
            .filter((client) => client.linked_to === "enterprise")
            .map((client) => ({
              label: client.name,
              value: client.id,
              data: {
                client_logo: client.client_logo,
              },
            }));

          setUsersArray([
            {
              label: "Mon entreprise",
              options: enterpriseClients,
            },
            {
              label: "Nos clients",
              options: userClients,
            },
          ]);
          console.log(enterpriseClients, "enterpriseClients");
          const destinationClient = {
            label: destination?.clients?.name || "",
            value: destination?.clients?.id || "",
            data: {
              client_logo: destination?.clients?.client_logo || "",
            },
          }; // Set the first enterprise client as default if exists
          if (enterpriseClients.length > 0 && openedFrom !== "mission") {
            setSelectedClient(enterpriseClients[0]);
          } else {
            setSelectedClient(destinationClient);
          }
        }
      } catch (error) {
        console.log("error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const userProfile = user?.job || "Other / Explorer";

  // Fetch missions
  const getObjectives = async () => {
    try {
      const userId = parseInt(CookieService.get("user_id"));

      const response = await axios.get(
        `${API_BASE_URL}/get-objectives-with-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const objectives = response?.data?.data;
        const newOptions = objectives.map((item) => ({
          value: item?.id,
          label: item?.name,
          client_id: item?.client_id,
          status: item?.status,
        }));
        setMissionOptions(newOptions);

        //    // Check if we should use an existing mission
        // const existingMission = newOptions.find(option =>
        //   option.label.includes(selectedClient?.label)
        // );

        // console.log('existingMission',existingMission)

        // if (existingMission) {
        //   setSelectedMission({
        //     ...existingMission,
        //     __isNew__: false
        //   });
        // }
      }
    } catch (error) {
      console.log("error fetching objectives", error);
    }
  };

  useEffect(() => {
    getObjectives();
  }, []);

  // Mission defaults effect
  useEffect(() => {
    if (!selectedClient?.label || isManualMission) return;
    if(meetingData?.created_from_whatsapp) return;

    // Determine default mission label based on user profile
    let defaultMissionLabel = `projet ${selectedClient.label.toLowerCase()}`;
    let defaultMissionValue = null;
    let isNewMission = true;
    let shouldCallAPI = false;

    switch (userProfile) {
      case "Project Manager / Product Owner":
        defaultMissionLabel = `projet ${selectedClient.label.toLowerCase()}`;
        shouldCallAPI = true;
        break;
      case "Customer Relations Officer / Sales Representative":
        defaultMissionLabel = `Opportunité client ${selectedClient.label.toLowerCase()}`;
        shouldCallAPI = true;
        break;
      case "Manager / Team Leader":
        defaultMissionLabel = `projet ${selectedClient.label.toLowerCase()}`;
        shouldCallAPI = true;
        break;
      case "Developer / Operational Contributor":
        defaultMissionLabel = `projet ${selectedClient.label.toLowerCase()}`;
        shouldCallAPI = true;
        break;
      default:
        defaultMissionLabel = `projet ${selectedClient.label.toLowerCase()}`;
        shouldCallAPI = true;
    }

    if (shouldCallAPI && defaultMissionLabel && openedFrom !== "mission") {
      getDefaultMission(defaultMissionLabel, missionOptions);
    }

    const existingMission = missionOptions.find(
      (option) =>
        option.label.toLowerCase().trim() ===
        defaultMissionLabel.toLowerCase().trim(),
    );

    if (existingMission) {
      defaultMissionValue = existingMission.value;
      isNewMission = false;
    }

    const defaultDestinationType =
      userProfile === "Customer Relations Officer / Sales Representative"
        ? "Business opportunity"
        : "Project";

    setSelectedMission({
      __isNew__: isNewMission,
      value: defaultMissionValue,
      label: defaultMissionLabel,
      client_id: selectedClient.value,
      status: existingMission?.status ? existingMission?.status : "upcoming",
      type: defaultDestinationType,
    });

    setDestinationType(defaultDestinationType);
  }, [
    selectedClient,
    userProfile,
    missionOptions,
    isManualMission,
    openedFrom,
    meetingData
  ]);

  // Title defaults effect
  useEffect(() => {
    if (!selectedClient?.label || isManualTitle) return;

    const dateToFormat = Array.isArray(selectedDateTime)
      ? selectedDateTime[0]
      : selectedDateTime;
    const formattedDate = dateToFormat
      ? format(dateToFormat, "dd/MM/yyyy")
      : "";
    const formattedTime = dateToFormat ? format(dateToFormat, "HH'h'mm") : "";

    setMomentName(
      `${t(`types.${formState?.type}`)} ${selectedClient.label} le ${formattedDate} à ${formattedTime}` ||
        "",
    );
  }, [
    selectedClient,
    // Removed selectedDateTime from deps to prevent title change on date change
    formState?.type,
    t,
    isManualTitle,
  ]);

  useEffect(() => {
    if (show && user && !meetingData) {
      const gAgenda = user?.integration_links?.some(
        (link) => link.platform === "Google Agenda",
      );
      const oAgenda = user?.integration_links?.some(
        (link) => link.platform === "Outlook Agenda",
      );
      const gMeet = user?.visioconference_links?.some(
        (link) => link.platform === "Google Meet",
      );
      const oTeams = user?.visioconference_links?.some(
        (link) => link.platform === "Microsoft Teams",
      );

      setFormState((prev) => {
        // Only set defaults if they are currently null or empty
        const newAgenda = !prev.agenda
          ? gAgenda
            ? "Google Agenda"
            : oAgenda
              ? "Outlook Agenda"
              : prev.agenda
          : prev.agenda;

        let newLocation = !prev.location
          ? gMeet
            ? "Google Meet"
            : prev.location
          : prev.location;

        // JB Outlook se kar rahay hain, toh location null rahay gi as requested
        if (newAgenda === "Outlook Agenda") {
          newLocation = null;
        }

        if (prev.agenda === newAgenda && prev.location === newLocation)
          return prev;

        return {
          ...prev,
          agenda: newAgenda,
          location: newLocation,
        };
      });
    }
  }, [show, user, setFormState]);

  // Initialize defaults for Calendly fields
  useEffect(() => {
    // Only apply defaults if we are likely in a context where these matter (e.g. form is active)
    // and they aren't already set.
    if (!formState.calendly_timezone) {
      setFormState((prev) => ({
        ...prev,
        calendly_timezone: "Europe/Paris",
      }));
    }

    if (
      !formState.calendly_availability ||
      formState.calendly_availability.length === 0
    ) {
      const defaultAvailability = [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche",
      ].map((d, i) => ({
        day: d,
        active: i < 5, // Mon-Fri active
        start: "09:00",
        end: "17:00",
      }));

      setFormState((prev) => ({
        ...prev,
        calendly_availability: defaultAvailability,
      }));
    }
  }, []); // Run once on mount (or could add minimal deps if needed, but mount is safest to not overwrite user changes)

  // Fetch missions
  const getDefaultMission = async (
    defaultMissionLabel,
    currentMissionOptions,
  ) => {
    try {
      const userId = parseInt(CookieService.get("user_id"));
      const payload = {
        client_id: selectedClient?.value,
        destination_name: defaultMissionLabel,
        // Add any other required parameters
      };
      const response = await axios.post(
        `${API_BASE_URL}/check-destination-duplicate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        console.log("response from getDefaultMission ->", response.data.data);
        let defaultMissionValue = response?.data?.suggested_name;
        let finalMissionLabel = defaultMissionValue;
        let isNewMission = true;

        // Check if mission exists (case-insensitive) and get its ID if exists using the passed options
        const optionsToUse = currentMissionOptions || missionOptions;
        const existingMission = optionsToUse.find(
          (option) =>
            option.label.toLowerCase().trim() ===
            defaultMissionValue?.toLowerCase().trim(),
        );

        if (existingMission) {
          defaultMissionValue = existingMission.value;
          finalMissionLabel = existingMission.label;
          isNewMission = false;
        }

        setSelectedMission({
          __isNew__: isNewMission,
          value: defaultMissionValue,
          label: finalMissionLabel,
          client_id: selectedClient.value,
          status: existingMission?.status || "upcoming",
          type:
            userProfile === "Customer Relations Officer / Sales Representative"
              ? "Business opportunity"
              : "Project",
        });
        //   const objectives = response?.data?.data;
        //   const newOptions = objectives.map((item) => ({
        //     value: item?.id,
        //     label: item?.name,
        //     client_id: item?.client_id,
        //     status: item?.status,

        //   }));
        //   setMissionOptions(newOptions);

        //    // Check if we should use an existing mission
        // const existingMission = newOptions.find(option =>
        //   option.label.includes(selectedClient?.label)
        // );

        // if (existingMission) {
        //   setSelectedMission({
        //     ...existingMission,
        //     __isNew__: false
        //   });
        // }
      }
    } catch (error) {
      console.log("error fetching objectives", error);
    }
  };

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
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-meeting/${meeting?.id}?current_time=${formattedTime}&current_date=${formattedDate}&user_id=${userId}&timezone=${userTimeZone}`,
      );
      if (response?.status === 200) {
        setMeeting(response?.data?.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (showStepsModal && meeting) {
      getMeeting();
    }
  }, [showStepsModal]);

  const objectives = missionOptions
    ?.filter((item) => item?.client_id == clientId)
    .map((item) => ({
      value: item.value,
      label: item.label,
    }));

  const handleCreate = async () => {
    setLoading(true);

    const userTimezone = moment.tz.guess();
    const dateTime =
      selectedDateTime && selectedDateTime.length > 0
        ? selectedDateTime[0]
        : new Date();

    // Validation for step 1 (Solution tab)
    if (step === 1) {
      if (!formState.type && formState.solution_tab === "create from scratch") {
        toast.error(t("meeting.formState.type"));
        return;
      }
      if (
        !formState.solution_id &&
        formState.solution_tab === "use a template"
      ) {
        toast.error(t("meeting.formState.type"));
        return;
      }
      // Validation done
    }

    let meetingData = {};
    let api_end_point = "/meetings";
    let method = "post";
    const isNewClient = selectedClient?.__isNew__;
    const isNewMission = selectedMission?.__isNew__;
    if (step === 1) {
      // Initial creation - Solution tab
      meetingData = {
        ...formState,
        status: "draft",
        timezone: userTimezone,
        date: dateTime.toISOString().split("T")[0],
        start_time: dateTime.toTimeString().split(" ")[0],
      };

      // When opened from mission, include client_id and destination_id immediately
      if (openedFrom === "mission") {
        meetingData = {
          ...meetingData,
          client_id: destination?.clients?.id || destination?.client_id,
          destination_id: destination?.id || destination?.client_id,
          destination_type: destination?.type || null,
        };
      }
    } else if (step === 2 && openedFrom !== "mission") {
      // Client tab - no API call, just proceed to next step (only for non-mission flow)
      setStep(3);
      return;
    } else if (
      (step === 3 && openedFrom !== "mission") ||
      (step === 2 && openedFrom === "mission")
    ) {
      // Mission tab update for normal flow OR moment tab for mission flow
      meetingData = {
        ...formState,
        client_id: !isNewClient ? selectedClient?.value : null,
        client: isNewClient ? selectedClient?.label : null,

        destination_id: !isNewMission ? selectedMission?.value : null,
        destination: isNewMission ? selectedMission?.label : null,
        destination_type: isNewMission ? destinationType : null,

        status: "draft", // Keep as draft until final submit
        timezone: userTimezone,
        ...(meeting?.id ? { _method: "put" } : {}),
      };
      api_end_point = meeting?.id ? `/meetings/${meeting.id}` : "/meetings";
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}${api_end_point}`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (res.status === 201 || res.status === 200) {
        const data = res?.data?.data;
        // Filter out session user from participants returned by API
        // if (data.participants) {
        //   data.participants = data.participants.filter(
        //     (p) => p.email?.toLowerCase()?.trim() !== sessionUser,
        //   );
        // }
        setMeeting(data);
        setFormState(data);
        // setCheckId(data.id);
        console.log("data", data);

        // Integration Check Logic using response data (matching Location.jsx)
        if (data) {
          const visioconference_links = user?.visioconference_links || [];
          const integration_links = user?.integration_links || [];

          if (
            (data?.location === "Google Meet" &&
              visioconference_links.length === 0) ||
            (data?.agenda === "Google Agenda" &&
              !integration_links.some(
                (link) => link.platform === "Google Agenda",
              ))
          ) {
            googleLoginAndSaveProfileScheduled();
          } else if (
            (data?.location === "Microsoft Teams" &&
              (visioconference_links.length === 0 ||
                !visioconference_links.some(
                  (link) => link.platform === "Microsoft Teams",
                ))) ||
            (data?.agenda === "Outlook Agenda" &&
              !integration_links.some(
                (link) => link.platform === "Outlook Agenda",
              ))
          ) {
            outlookLoginAndSaveProfile();
          }
        }

        if (openedFrom === "mission") {
          // For mission flow, after step 1 go to step 2 (moment tab)
          if (step === 1) setStep(2);
        } else {
          // For normal flow
          if (step === 1) setStep(2);
          else if (step === 3) setStep(4);
        }
      }
    } catch (err) {
      console.error("Error in handleCreate:", err);
      toast.error(t("An error occurred while saving"));
    } finally {
      setLoading(false);
    }
  };

  // Determine if we're using a template or creating from scratch
  const isTemplate =
    formState.solution_tab === "use a template" && formState.solution_id;
  const isNewClient = selectedClient?.__isNew__;
  const isNewMission = selectedMission?.__isNew__;

  const handleFinalSubmit = async () => {
    setLoading(true);

    const userTimezone = moment.tz.guess();
    const dateTime =
      selectedDateTime && selectedDateTime.length > 0
        ? selectedDateTime[0]
        : new Date();

    // Determine if we're using a template or creating from scratch
    const isTemplate =
      formState.solution_tab === "use a template" && formState.solution_id;
    const isNewClient = selectedClient?.__isNew__;
    const isNewMission = selectedMission?.__isNew__;

    // Ensure Calendly defaults are present in payload if type is Calendly
    let finalCalendlyTimezone = formState.calendly_timezone;
    let finalCalendlyAvailability = formState.calendly_availability;

    if (formState.type === "Calendly") {
      if (!finalCalendlyTimezone) {
        finalCalendlyTimezone = "Europe/Paris";
      }
      if (
        !finalCalendlyAvailability ||
        finalCalendlyAvailability.length === 0
      ) {
        finalCalendlyAvailability = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ].map((d, i) => ({
          day: d,
          active: i < 5, // Mon-Fri active
          start: "09:00",
          end: "17:00",
        }));
      }
    }

    const payload = {
      ...formState,
      create_agenda: formState?.location || formState?.agenda ? true : false,
      calendly_timezone: finalCalendlyTimezone,
      calendly_availability: finalCalendlyAvailability,
      client_id: !isNewClient ? selectedClient?.value : null,
      client: isNewClient ? selectedClient?.label : null,
      // Conditional fields based on new/existing mission
      ...(isNewMission
        ? {
            destination: selectedMission.label,
            destination_type: destinationType,
          }
        : {
            destination_id:
              openedFrom === "mission"
                ? destination?.id
                : selectedMission.value,
            destination_type: selectedMission.type || destinationType,
          }),
      title: momentName,
      date: dateTime.toISOString().split("T")[0],
      start_time: dateTime.toTimeString().split(" ")[0],
      timezone: userTimezone,
      status: "active",
      team_ids: (formState.teams || []).map((t) => t.id).filter((id) => id),
      ...(meeting?.id ? { _method: "put" } : {}),
    };

    try {
      const res = await axios.post(
        meeting?.id
          ? `${API_BASE_URL}/meetings/${meeting.id}`
          : `${API_BASE_URL}/meetings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (res.status === 200 || res?.status === 201) {
        const responseData = res?.data?.data || meeting;
        const targetId = responseData?.id;

        setMeeting(responseData);
        // toast.success(t("meeting.formState.Meeting created successfully"));

        if (formState.repetition) {
          await recurrentMeetingAPI(targetId);
        }
        if (meetingData) {
          // Assistant Flow: Check actual meeting data for steps
          const hasSteps = (responseData?.steps?.length > 0) || (responseData?.meeting_steps_count > 0);
          if (hasSteps) {
            navigate(`/invite/${targetId}`);
            if (isTemplate) {
              setMeeting(null);
              setFormState({
                selectedOption: null,
                title: "",
                date: "",
                start_time: "",
                description: "",
                type: "",
                priority: "",
                alarm: false,
                feedback: false,
                remainder: false,
                notification: false,
                autostart: false,
                playback: "Manual",
                prise_de_notes: "Manual",
                note_taker: false,
                objective: "",
                participants: [],
                steps: [],
                solution_tab: "use a template",
                solution_id: null,
                id: null,
                repetition: false,
                repetition_number: 1,
                repetition_frequency: "Daily",
                repetition_end_date: null,
                selected_days: [],
                teams: [],
                moment_privacy: "participant only",
                moment_privacy_teams: [],
                moment_password: null,
                location: null,
                agenda: null,
                address: null,
                room_details: null,
                phone: null,
                share_by: null,
                price: null,
                max_participants_register: 0,
                casting_tab: null,
              });
            }
            onClose();
          } else {
            setShowStepsModal(true);
          }
        } else {
          // Standard Flow: Original Quick Planning logic
          if (isTemplate && selectedSolution?.is_step_exists !== false) {
            // For templates, navigate to invite page
            navigate(`/invite/${targetId}`);
            setMeeting(null);
            setFormState({
              selectedOption: null,
              title: "",
              date: "",
              start_time: "",
              description: "",
              type: "",
              priority: "",
              alarm: false,
              feedback: false,
              remainder: false,
              notification: false,
              autostart: false,
              playback: "Manual",
              prise_de_notes: "Manual",
              note_taker: false,
              objective: "",
              participants: [],
              steps: [],
              solution_tab: "use a template",
              solution_id: null,
              id: null,
              repetition: false,
              repetition_number: 1,
              repetition_frequency: "Daily",
              repetition_end_date: null,
              selected_days: [],
              teams: [],
              moment_privacy: "participant only",
              moment_privacy_teams: [],
              moment_password: null,
              location: null,
              agenda: null,
              address: null,
              room_details: null,
              phone: null,
              share_by: null,
              price: null,
              max_participants_register: 0,

              casting_tab: null,
            });
          } else {
            // For solutions, show steps modal
            setShowStepsModal(true);
          }
        }
      }
    } catch (err) {
      console.error("Error finalizing meeting:", err);
      toast.error(t("An error occurred while finalizing the meeting"));
    } finally {
      setLoading(false);
      setLoadingPlay(false);
    }
  };


  const handleMeetingUpdate = async () => {
    if (!meetingData?.id) return;

    setLoading(true);

    const userTimezone = moment.tz.guess();
    const dateTime = Array.isArray(selectedDateTime)
      ? selectedDateTime.length > 0
        ? selectedDateTime[0]
        : new Date()
      : selectedDateTime || new Date();

    const isNewClient = selectedClient?.__isNew__;
    const isNewMission = selectedMission?.__isNew__;

    const payload = {
      ...(meetingData?.created_from_whatsapp ? meetingData : {}),
      ...formState,
      _method: "put",
      status: "active",
      update_meeting: true,
      create_agenda:
        meetingData?.location === "Google Meet" ||
        meetingData?.agenda === "Google Agenda" ||
        meetingData?.agenda === "Outlook Agenda"
          ? true
          : false,
      id: meetingData?.id,
      title: momentName,
      date: moment(dateTime).format("YYYY-MM-DD"),
      start_time: dateTime.toTimeString().split(" ")[0],
      timezone: userTimezone,
      client_id: !isNewClient ? selectedClient?.value : null,
      client: isNewClient ? selectedClient?.label : null,
      ...(isNewMission
        ? {
            destination: selectedMission?.label,
            destination_type: destinationType,
          }
        : {
            destination_id:
              openedFrom === "mission"
                ? destination?.id
                : selectedMission?.value,
            destination_type: selectedMission?.type || destinationType,
          }),
      steps: formState?.steps?.length > 0 ? formState?.steps : [],
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/meetings/${meetingData?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (res.status === 200 || res?.status === 201) {
        toast.success(t("meeting.formState.Meeting updated successfully"));

            const hasSteps =
      (meetingData?.steps?.length > 0) || (meetingData?.meeting_steps_count > 0);

    if (!hasSteps) {
      setShowStepsModal(true);
      // return;
    }
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error(t("An error occurred while updating the meeting"));
    } finally {
      setLoading(false);
    }
  };

  const [loadingPlay, setLoadingPlay] = useState(false);

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };
  const updateFromTektime = (value) => {
    setFromTektime(value);
    CookieService.set("fromTektime", value);
  };

  const handlePlay = async (item) => {
    console.log("item", item);

    updateCallApi(false);
    updateFromTektime(true);

    await continueHandlePlay(item);
  };

  const [loading, setLoading] = useState(false);
  const recurrentMeetingAPI = async (meetingId) => {
    // if (!formState.repetition) return;
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const payload = {
        meeting_id: meetingId,
        timezone: userTimeZone,
      };
      const response = await axios.post(
        `${API_BASE_URL}/recurring-meeting`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response?.status) {
        toast.success(t("messages.repetitionEnabled"));
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const continueHandlePlay = async (item) => {
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

    const minOrderNo = Math.min(...item?.steps?.map((step) => step.order_no));

    // Find the first step (order_no 1)
    const firstStep = item?.steps?.find((step) => step.order_no === minOrderNo);
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
        }
        // navigate(`/play/${item.id}`);

        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);

        setLoading(false);
        setLoadingPlay(true);

        // navigate(`/destínation/${item?.unique_id}/${item?.id}`);
      }
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  const createAndPlay = async () => {
    setLoadingPlay(true);
    const userTimezone = moment.tz.guess();
    const dateTime =
      selectedDateTime && selectedDateTime.length > 0
        ? selectedDateTime[0]
        : new Date();

    // Determine if we're using a template or creating from scratch
    const isTemplate =
      formState.solution_tab === "use a template" && formState.solution_id;
    const isNewClient = selectedClient?.__isNew__;
    const isNewMission = selectedMission?.__isNew__;

    const payload = {
      ...formState,
      create_agenda: formState?.location && formState?.agenda ? true : false,
      client_id: !isNewClient ? selectedClient?.value : null,
      client: isNewClient ? selectedClient?.label : null,
      // Conditional fields based on new/existing mission
      ...(isNewMission
        ? {
            destination: selectedMission.label,
            destination_type: destinationType,
          }
        : {
            destination_id: selectedMission.value,
            destination_type: selectedMission.type || destinationType,
          }),
      title: momentName,
      date: dateTime.toISOString().split("T")[0],
      start_time: dateTime.toTimeString().split(" ")[0],
      timezone: userTimezone,
      status: "active",
      team_ids: (formState.teams || []).map((t) => t.id).filter((id) => id),
      ...(meeting?.id ? { _method: "put" } : {}),
    };

    try {
      const res = await axios.post(
        meeting?.id
          ? `${API_BASE_URL}/meetings/${meeting.id}`
          : `${API_BASE_URL}/meetings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (res.status === 200 || res?.status === 201) {
        const response = res?.data?.data;
        if (formState.repetition) {
          await recurrentMeetingAPI(response.id);
        }
        // toast.success(t("Meeting created successfully"));
        // onClose();
        // refresh();
        if (isTemplate && selectedSolution?.is_step_exists !== false) {
          // For templates, navigate to invite page
          await handlePlay(response);
          // navigate(`/invite/${meeting?.id}`);
          setMeeting(null);
          setFormState({
            selectedOption: null,
            title: "",
            date: "",
            start_time: "",
            description: "",
            type: "",
            priority: "",
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "Manual",
            prise_de_notes: "Manual",
            note_taker: false,
            objective: "",
            participants: [],
            steps: [],
            solution_tab: "use a template",
            solution_id: null,
            id: null,
            repetition: false,
            repetition_number: 1,
            repetition_frequency: "Daily",
            repetition_end_date: null,
            selected_days: [],
            teams: [],
            moment_privacy: "participant only",
            moment_privacy_teams: [],
            moment_password: null,
            location: null,
            agenda: null,
            address: null,
            room_details: null,
            phone: null,
            share_by: null,
            price: null,
            max_participants_register: 0,

            casting_tab: null,
          });
        } else {
          // For solutions, show steps modal
          setShowStepsModal(true);
        }
      }
    } catch (err) {
      console.error("Error finalizing meeting:", err);
      toast.error(t("An error occurred while finalizing the meeting"));
    } finally {
    }
  };

  const handleBack = () => {
    if (openedFrom === "mission") {
      // No back navigation when opened from mission
      return;
    }
    setStep((prev) => prev - 1);
  };

  const handleValider = () => {
    console.log("Creating solution moment:", {
      momentType,
      momentName,
      steps: stepsList,
      client,
      mission,
    });
    onClose();
  };

  const handleCancel = () => setShowConfirmation(true);
  const handleCloseConfirmation = () => setShowConfirmation(false);

  const handleChange = (date) => {
    setSelectedDateTime(date);
    if (date) {
      const datePart = date[0]?.toISOString().split("T")[0];
      const timePart = date[0]?.toTimeString().split(" ")[0];
    }
  };

  const missionTypeOptions = [
    {
      value: "Business opportunity",
      label: t("destination.businessOppurtunity"),
    },
    { value: "Study", label: t("destination.study") },
    { value: "Audit", label: t("destination.audit") },
    { value: "Project", label: t("destination.project") },
    { value: "Accompagnement", label: t("destination.accompagnement") },
    { value: "Event", label: t("destination.event") },
    { value: "Formation", label: t("destination.formation") },
    { value: "Recruitment", label: t("destination.recruitment") },
    { value: "Objective", label: t("destination.objective") },
    { value: "Agenda", label: t("destination.Agenda") },
    { value: "Messagerie", label: t("destination.messaging") },
    { value: "Other", label: t("destination.other") },
  ];

  const getIcon = (value) => {
    const commonStyle = { marginRight: 8 };

    switch (value) {
      case "Business opportunity":
        return <IoIosBusiness size={20} style={commonStyle} />;

      case "Study":
        return <FaBookOpen size={20} style={commonStyle} />;

      case "Audit":
        return <AiOutlineAudit size={20} style={commonStyle} />;

      case "Project":
        return <IoIosRocket size={20} style={commonStyle} />;

      case "Accompagnement":
        return <MdOutlineSupport size={20} style={commonStyle} />;

      case "Event":
        return <MdEventAvailable size={20} style={commonStyle} />;

      case "Formation":
        return <FaChalkboardTeacher size={20} style={commonStyle} />;

      case "Recruitment":
        return <MdWork size={20} style={commonStyle} />;

      case "Objective":
        return <FaBullseye size={20} style={commonStyle} />;

      case "Agenda":
      case "Messagerie":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#F19C38" style={commonStyle}>
            <path d="M7.5 5.6L10 0L12.5 5.6L18.1 8.1L12.5 10.6L10 16.2L7.5 10.6L1.9 8.1L7.5 5.6Z"/>
            <path d="M17.5 15.6L19.1 12.1L20.7 15.6L24.2 17.2L20.7 18.8L19.1 22.3L17.5 18.8L14 17.2L17.5 15.6Z"/>
          </svg>
        );

      case "Other":
        return <span style={commonStyle}>✨</span>;

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (openedFrom === "mission") {
      // Only show Solution and Moment tabs when opened from mission
      switch (step) {
        case 1: // Solution tab
          return (
            <div className="step-content">
              <div className="form-group">
                <Solution from="quick" />
              </div>
            </div>
          );
        case 2: // Moment tab (renumbered from original step 4)
          return (
            <div className="create-moment-modal">
              <div className="step-content">
                <div className="d-flex flex-column gap-2 mb-4">
                  {(client || clientId) && (
                    <div
                      className="selected-summary mb-3 p-3"
                      style={{
                        backgroundColor: "#f5f7fa",
                        borderRadius: "8px",
                      }}
                    >
                      <strong>{t("Selected Client")}:</strong>{" "}
                      {clientId
                        ? (() => {
                            // Search through all groups and options to find the matching client
                            for (const group of usersArray) {
                              const foundClient = group.options.find(
                                (opt) => Number(opt.value) === Number(clientId),
                              );
                              if (foundClient) return foundClient.label;
                            }
                            return clientId; // fallback if not found
                          })()
                        : client}
                    </div>
                  )}
                  {(mission || missionId) && (
                    <div
                      className="selected-summary mb-3 p-3"
                      style={{
                        backgroundColor: "#f5f7fa",
                        borderRadius: "8px",
                      }}
                    >
                      <strong>{t("Selected Mission")}:</strong>{" "}
                      {missionId
                        ? objectives.find(
                            (opt) => Number(opt.value) === Number(missionId),
                          )?.label
                        : mission}
                    </div>
                  )}
                </div>

                {meeting && (
                  <div className="meeting-settings-premium mb-4">
                    <div className="row g-2">
                      {[
                        {
                          label: t("meeting.formState.Automatic note taking"),
                          icon: (
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
                          ),
                          checked: meeting.prise_de_notes === "Automatic",
                        },
                        {
                          label: t("meeting.formState.Beep alarm"),
                          icon: (
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
                          ),
                          checked: meeting.alarm,
                        },
                        {
                          label: t("meeting.formState.Feedbacks"),
                          icon: (
                            <svg
                              width="25px"
                              height="24px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  d="M16 1C17.6569 1 19 2.34315 19 4C19 4.55228 18.5523 5 18 5C17.4477 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H16C16.5523 21 17 20.5523 17 20V19C17 18.4477 17.4477 18 18 18C18.5523 18 19 18.4477 19 19V20C19 21.6569 17.6569 23 16 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H16Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M20.7991 8.20087C20.4993 7.90104 20.0132 7.90104 19.7133 8.20087L11.9166 15.9977C11.7692 16.145 11.6715 16.3348 11.6373 16.5404L11.4728 17.5272L12.4596 17.3627C12.6652 17.3285 12.855 17.2308 13.0023 17.0835L20.7991 9.28666C21.099 8.98682 21.099 8.5007 20.7991 8.20087ZM18.2991 6.78666C19.38 5.70578 21.1325 5.70577 22.2134 6.78665C23.2942 7.86754 23.2942 9.61999 22.2134 10.7009L14.4166 18.4977C13.9744 18.9398 13.4052 19.2327 12.7884 19.3355L11.8016 19.5C10.448 19.7256 9.2744 18.5521 9.50001 17.1984L9.66448 16.2116C9.76728 15.5948 10.0602 15.0256 10.5023 14.5834L18.2991 6.78666Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 11C5 10.4477 5.44772 10 6 10H10C10.5523 10 11 10.4477 11 11C11 11.5523 10.5523 12 10 12H6C5.44772 12 5 11.5523 5 11Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 15C5 14.4477 5.44772 14 6 14H7C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16H6C5.44772 16 5 15.5523 5 15Z"
                                  fill="#3D57B5"
                                ></path>
                              </g>
                            </svg>
                          ),
                          checked: meeting.feedback,
                        },
                        {
                          label: t("meeting.formState.Remainder"),
                          icon: (
                            <svg
                              width="25"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 9V13L14.5 15.5"
                                stroke="#3D57B5"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M3.5 4.5L7.50002 2"
                                stroke="#3D57B5"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M20.5 4.5L16.5 2"
                                stroke="#3D57B5"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                              <path
                                d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                                stroke="#3D57B5"
                                stroke-width="1.5"
                                stroke-linecap="round"
                              ></path>
                            </svg>
                          ),
                          checked: meeting.remainder,
                        },
                        {
                          label: t("meeting.formState.Autostart"),
                          icon: (
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
                          ),
                          checked: meeting.autostart,
                        },
                        {
                          label: t("meeting.formState.notification"),
                          icon: (
                            <svg
                              width="25px"
                              height="24px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                  stroke="#3D57B5"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                ></path>
                                <circle
                                  cx="19"
                                  cy="5"
                                  r="3"
                                  stroke="#3D57B5"
                                  stroke-width="1.5"
                                ></circle>
                                <path
                                  d="M7 14H16"
                                  stroke="#3D57B5"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                ></path>
                                <path
                                  d="M7 17.5H13"
                                  stroke="#3D57B5"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                ></path>
                              </g>
                            </svg>
                          ),
                          checked: meeting.notification,
                        },
                        {
                          label: t("meeting.formState.Lecture playback"),
                          icon: (
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
                          ),
                          checked: meeting.playback === "Automatic",
                        },
                        {
                          label: t("Gestion des messages"),
                          icon: (
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
                          ),
                          checked: meeting.open_ai_decide,
                        },
                        {
                          label: t("meeting.formState.Automatic Strategy"),
                          icon: (
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
                          ),
                          checked: meeting.automatic_strategy,
                        },
                        {
                          label: t("meeting.formState.Automatic Instruction"),
                          icon: (
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
                          ),
                          checked: meeting.automatic_instruction,
                        },
                        // {
                        //   label: meeting.address,
                        //   icon: (
                        //     <HiOutlineLocationMarker size={22} color="#3D57B5" />
                        //   ),
                        //   checked: !!meeting.address,
                        // },
                        // {
                        //   label: meeting.phone,
                        //   icon: <HiOutlinePhone size={22} color="#3D57B5" />,
                        //   checked: !!meeting.phone,
                        // },
                        // {
                        //   label: meeting.location,
                        //   icon: <HiOutlineMap size={22} color="#3D57B5" />,
                        //   checked:
                        //     !!meeting.location &&
                        //     ![
                        //       "Google Meet",
                        //       "Microsoft Teams",
                        //       "Zoom",
                        //     ].includes(meeting.location),
                        // },
                      ]
                        .filter((item) => item.checked)
                        .map((item, index) => (
                          <div className="col-md-6" key={index}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 16px",
                                background: "#F5F8FF",
                                borderRadius: "12px",
                                border: "1px solid #E8EFFF",
                                height: "100%",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {item.icon}
                                </span>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#334155",
                                  }}
                                >
                                  {item.label}
                                </span>
                              </div>
                              <div className="form-check form-switch mb-0">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={item.checked}
                                  disabled
                                  style={{ cursor: "default", opacity: 1 }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {t("Objective")}{" "}
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("meeting.newMeeting.placeholders.objective")}
                    value={momentName}
                    onChange={(e) => {
                      setMomentName(e.target.value);
                      setIsManualTitle(true);
                    }}
                  />
                </div>

                {/* Location & Integration info */}
                {(displayAgendaLinks.length > 0 ||
                  displayVisioLinks.length > 0) &&
                  !((meetingData?.created_from_whatsapp || meeting?.created_from_whatsapp) && !meetingData?.location && !meetingData?.agenda) && (
                  <div className="form-group mb-3">
                    <label className="form-label">
                      {t("Location & Integration")}
                    </label>
                    <div
                      className="d-flex flex-row flex-wrap gap-3 p-3"
                      style={{
                        background: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      {/* Visioconference */}
                      {displayVisioLinks.map((link, idx) => (
                        <div
                          key={`visio-${idx}`}
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFormState((prev) => ({
                              ...prev,
                              location: prev.location === link.platform ? null : link.platform,
                            }));
                          }}
                        >
                          <input
                            type="radio"
                            checked={formState.location === link.platform}
                            readOnly
                          />
                          {link.platform === "Google Meet" ? (
                            <SiGooglemeet size={20} color="#00897b" />
                          ) : (
                            <SiMicrosoftoutlook size={20} color="#0078d4" />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {link.value}
                          </span>
                        </div>
                      ))}

                      {/* Agenda */}
                      {displayAgendaLinks.map((link, idx) => (
                        <div
                          key={`agenda-${idx}`}
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFormState((prev) => ({
                              ...prev,
                              agenda: prev.agenda === link.platform ? null : link.platform,
                            }));
                          }}
                        >
                          <input
                            type="radio"
                            checked={formState.agenda === link.platform}
                            readOnly
                          />
                          {link.platform === "Google Agenda" ? (
                            <SiGooglecalendar size={20} color="#4285f4" />
                          ) : (
                            <SiMicrosoftoutlook size={20} color="#0078d4" />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {link.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {t("invities.participants") || "Participants"}
                  </label>
                  <Creatable
                    isMulti
                    isClearable
                    isLoading={isFetchingParticipants}
                    options={participantOptions}
                    value={getSelectValue()}
                    onChange={handleSelectionChange}
                    placeholder={
                      t("Type email or select from list...") ||
                      "Type email or select from list..."
                    }
                    formatCreateLabel={(inputValue) =>
                      `Add new: "${inputValue}"`
                    }
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    className="my-select"
                  />
                </div>

                {/* Conditional Date/Time or Calendly Config */}
                {formState?.type === "Calendly" ? (
                  <>
                    <CalendlySettings
                      formState={formState}
                      setFormState={setFormState}
                    />
                    {/* <RepetitionSettings formState={formState} setFormState={setFormState} meeting={meeting} /> */}
                  </>
                ) : (
                  <>
                    <div className="mb-4 form d-flex flex-column form-group">
                      <label className="form-label">
                        {t("meeting.formState.dateTime")}
                        <small style={{ color: "red", fontSize: "15px" }}>
                          *
                        </small>
                      </label>
                      <Flatpickr
                        data-enable-time
                        value={selectedDateTime}
                        onChange={handleChange}
                        options={{
                          locale: locale,
                          dateFormat: "d/m/Y, H:i",
                          time_24hr: true,
                          formatDate: (date) => formatDateWithCustomTime(date),
                        }}
                      />
                    </div>
                    <RepetitionSettings
                      formState={formState}
                      setFormState={setFormState}
                      meeting={meeting}
                    />
                  </>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div className="form-group">
              <Solution from="quick" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            {/* ------------------Client */}

            <div className="form-group">
              <label className="form-label">
                {t("Client")}
                <span className="required-asterisk">*</span>
              </label>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="client-tooltip">{t("clientTooltip")}</Tooltip>
                }
              >
                {meeting?.type === "Absence" ? (
                  // Readonly Select field for Absence type
                  <Select
                    classNamePrefix="select"
                    className="my-select destination-select-dropdown"
                    value={{
                      value: meeting?.destination?.clients?.id,
                      label:
                        meeting?.destination?.clients?.name ||
                        t("No client assigned"),
                      data: {
                        client_logo: meeting?.destination?.clients?.client_logo,
                        client_need_description:
                          meeting?.destination?.clients
                            ?.client_need_description,
                      },
                    }}
                    options={
                      meeting?.destination?.clients
                        ? [
                            {
                              value: meeting.destination.clients.id,
                              label: meeting.destination.clients.name,
                              data: {
                                client_logo:
                                  meeting.destination.clients.client_logo,
                                client_need_description:
                                  meeting.destination.clients
                                    .client_need_description,
                              },
                            },
                          ]
                        : []
                    }
                    isDisabled={true}
                    formatOptionLabel={(option) => (
                      <div className="option-with-logo">
                        {option.data?.client_logo && (
                          <img
                            src={
                              option.data.client_logo.startsWith("http")
                                ? option.data.client_logo
                                : `${Assets_URL}/${option.data.client_logo}`
                            }
                            alt={option.label}
                            className="client-logo"
                          />
                        )}
                        <span>{option.label}</span>
                      </div>
                    )}
                  />
                ) : (
                  <div>
                    <Creatable
                      className="my-select destination-select-dropdown"
                      classNamePrefix="select"
                      // isLoading={isClientsLoading}
                      options={usersArray}
                      onChange={handleClientSelect}
                      value={selectedClient}
                      placeholder={t("Select or create a client")}
                      formatOptionLabel={(option, { context }) => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {/* Show client logo if available */}
                          {option.data?.client_logo && (
                            <img
                              src={
                                option.data.client_logo.startsWith("http")
                                  ? option.data.client_logo
                                  : `${Assets_URL}/${option.data.client_logo}`
                              }
                              alt={option.label}
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {/* Client name */}
                          <span>{option.label}</span>
                        </div>
                      )}
                      isClearable
                      styles={{
                        control: (provided) => ({ ...provided, zIndex: 1 }),
                        menuPortal: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }), // Very high z-index
                      }}
                      menuPortalTarget={document.body}
                      menuPosition="fixed" // This is crucial
                    />
                  </div>
                )}
              </OverlayTrigger>
            </div>
            {/* ------------------Mission */}

            <div className="form-group">
              <label className="form-label">
                {t("Mission")}
                <span className="required-asterisk">*</span>
              </label>
              {meeting?.type === "Absence" ? (
                // Readonly Select field for Absence type
                <Select
                  classNamePrefix="select"
                  className="my-select destination-select-dropdown mb-3"
                  value={{
                    value: meeting?.destination?.id,
                    label:
                      meeting?.destination?.destination_name ||
                      t("No mission assigned"),
                    data: {
                      description:
                        meeting?.destination?.destination_description,
                    },
                  }}
                  options={
                    meeting?.destination
                      ? [
                          {
                            value: meeting.destination.id,
                            label: meeting.destination.destination_name,
                            data: {
                              description:
                                meeting.destination.destination_description,
                            },
                          },
                        ]
                      : []
                  }
                  isDisabled={true}
                />
              ) : (
                <Creatable
                  className="my-select"
                  classNamePrefix="select"
                  // isLoading={isMissionsLoading}
                  options={getFilteredMissions()} // Only show missions for selected client
                  onChange={handleMissionSelect}
                  value={selectedMission}
                  placeholder={t("Select a mission")}
                  isDisabled={!selectedClient}
                  isClearable
                  formatOptionLabel={formatMissionOption}
                  styles={{
                    control: (provided) => ({ ...provided, zIndex: 1 }),
                    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }), // Very high z-index
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed" // This is crucial
                />
              )}
            </div>
            {selectedMission?.__isNew__ && (
              <div className="form-group mt-3">
                <label className="form-label">
                  {t("destination_type")}
                  <span className="required-asterisk">*</span>
                </label>
                <Select
                  className="my-select "
                  classNamePrefix="select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      zIndex: 9, // Ensure dropdown is above other elements
                    }),
                  }}
                  options={missionTypeOptions}
                  value={missionTypeOptions.find(
                    (opt) => opt.value === destinationType,
                  )}
                  onChange={(option) => setDestinationType(option.value)}
                  formatOptionLabel={(option) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {getIcon(option)}
                      <span>{option.label}</span>
                    </div>
                  )}
                  isClearable
                />
              </div>
            )}

            {/* ------------------Moment */}
            <div className="create-moment-modal">
              <div className="step-content">
                {meeting && (
                  <div className="meeting-settings-premium mb-4">
                    <div className="row g-2">
                      {[
                        {
                          label: t("meeting.formState.Automatic note taking"),
                          icon: (
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
                          ),
                          checked: meeting.prise_de_notes === "Automatic",
                        },
                        {
                          label: t("meeting.formState.Beep alarm"),
                          icon: (
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
                          ),
                          checked: meeting.alarm,
                        },
                        {
                          label: t("meeting.formState.Feedbacks"),
                          icon: (
                            <svg
                              width="25px"
                              height="24px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  d="M16 1C17.6569 1 19 2.34315 19 4C19 4.55228 18.5523 5 18 5C17.4477 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H16C16.5523 21 17 20.5523 17 20V19C17 18.4477 17.4477 18 18 18C18.5523 18 19 18.4477 19 19V20C19 21.6569 17.6569 23 16 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H16Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M20.7991 8.20087C20.4993 7.90104 20.0132 7.90104 19.7133 8.20087L11.9166 15.9977C11.7692 16.145 11.6715 16.3348 11.6373 16.5404L11.4728 17.5272L12.4596 17.3627C12.6652 17.3285 12.855 17.2308 13.0023 17.0835L20.7991 9.28666C21.099 8.98682 21.099 8.5007 20.7991 8.20087ZM18.2991 6.78666C19.38 5.70578 21.1325 5.70577 22.2134 6.78665C23.2942 7.86754 23.2942 9.61999 22.2134 10.7009L14.4166 18.4977C13.9744 18.9398 13.4052 19.2327 12.7884 19.3355L11.8016 19.5C10.448 19.7256 9.2744 18.5521 9.50001 17.1984L9.66448 16.2116C9.76728 15.5948 10.0602 15.0256 10.5023 14.5834L18.2991 6.78666Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 11C5 10.4477 5.44772 10 6 10H10C10.5523 10 11 10.4477 11 11C11 11.5523 10.5523 12 10 12H6C5.44772 12 5 11.5523 5 11Z"
                                  fill="#3D57B5"
                                ></path>
                                <path
                                  d="M5 15C5 14.4477 5.44772 14 6 14H7C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16H6C5.44772 16 5 15.5523 5 15Z"
                                  fill="#3D57B5"
                                ></path>
                              </g>
                            </svg>
                          ),
                          checked: meeting.feedback,
                        },
                        {
                          label: t("meeting.formState.Remainder"),
                          icon: (
                            <svg
                              width="25"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 9V13L14.5 15.5"
                                stroke="#3D57B5"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                              <path
                                d="M3.5 4.5L7.50002 2"
                                stroke="#3D57B5"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                              <path
                                d="M20.5 4.5L16.5 2"
                                stroke="#3D57B5"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>
                              <path
                                d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                                stroke="#3D57B5"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              ></path>
                            </svg>
                          ),
                          checked: meeting.remainder,
                        },
                        {
                          label: t("meeting.formState.Autostart"),
                          icon: (
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
                          ),
                          checked: meeting.autostart,
                        },
                        {
                          label: t("meeting.formState.notification"),
                          icon: (
                            <svg
                              width="25px"
                              height="24px"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="SVGRepo_iconCarrier">
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
                              </g>
                            </svg>
                          ),
                          checked: meeting.notification,
                        },
                        {
                          label: t("meeting.formState.Lecture playback"),
                          icon: (
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
                          ),
                          checked: meeting.playback === "Automatic",
                        },
                        {
                          label: t("Gestion des messages"),
                          icon: (
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
                          ),
                          checked: meeting.open_ai_decide,
                        },
                        {
                          label: t("meeting.formState.Automatic Strategy"),
                          icon: (
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
                          ),
                          checked: meeting.automatic_strategy,
                        },
                        {
                          label: t("meeting.formState.Automatic Instruction"),
                          icon: (
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
                          ),
                          checked: meeting.automatic_instruction,
                        },
                        // {
                        //   label: meeting.address,
                        //   icon: (
                        //     <HiOutlineLocationMarker size={22} color="#3D57B5" />
                        //   ),
                        //   checked: !!meeting.address,
                        // },
                        // {
                        //   label: meeting.phone,
                        //   icon: <HiOutlinePhone size={22} color="#3D57B5" />,
                        //   checked: !!meeting.phone,
                        // },
                        // {
                        //   label: meeting.location,
                        //   icon: <HiOutlineMap size={22} color="#3D57B5" />,
                        //   checked:
                        //     !!meeting.location &&
                        //     ![
                        //       "Google Meet",
                        //       "Microsoft Teams",
                        //       "Zoom",
                        //     ].includes(meeting.location),
                        // },
                      ]
                        .filter((item) => item.checked)
                        .map((item, index) => (
                          <div className="col-md-3" key={index}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px 16px",
                                background: "#F5F8FF",
                                borderRadius: "12px",
                                border: "1px solid #E8EFFF",
                                height: "100%",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {item.icon}
                                </span>
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    color: "#334155",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {item.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Location & Integration info */}
                {(displayAgendaLinks.length > 0 ||
                  displayVisioLinks.length > 0) &&
                  !((meetingData?.created_from_whatsapp || meeting?.created_from_whatsapp) && !meetingData?.location && !meetingData?.agenda) && (
                  <div className="form-group mb-3">
                    <label className="form-label">
                      {t("meeting.NewMeetingTabs.tab4")}
                    </label>
                    <div
                      className="d-flex flex-row flex-wrap gap-3 p-3"
                      style={{
                        background: "#F8FAFC",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      {/* Visioconference */}
                      {displayVisioLinks.map((link, idx) => (
                        <div
                          key={`visio-${idx}`}
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFormState((prev) => ({
                              ...prev,
                              location: prev.location === link.platform ? null : link.platform,
                            }));
                          }}
                        >
                          <input
                            type="radio"
                            checked={formState.location === link.platform}
                            readOnly
                          />
                          {link.platform === "Google Meet" ? (
                            <SiGooglemeet size={20} color="#00897b" />
                          ) : (
                            <SiMicrosoftoutlook size={20} color="#0078d4" />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {link.value}
                          </span>
                        </div>
                      ))}

                      {/* Agenda */}
                      {displayAgendaLinks.map((link, idx) => (
                        <div
                          key={`agenda-${idx}`}
                          className="d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setFormState((prev) => ({
                              ...prev,
                              agenda: prev.agenda === link.platform ? null : link.platform,
                            }));
                          }}
                        >
                          <input
                            type="radio"
                            checked={formState.agenda === link.platform}
                            readOnly
                          />
                          {link.platform === "Google Agenda" ? (
                            <SiGooglecalendar size={20} color="#4285f4" />
                          ) : (
                            <SiMicrosoftoutlook size={20} color="#0078d4" />
                          )}
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {link.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {t("Objective")}{" "}
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("meeting.newMeeting.placeholders.objective")}
                    value={momentName}
                    onChange={(e) => setMomentName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t("invities.participants") || "Participants"}
                  </label>
                  <Creatable
                    isMulti
                    isClearable
                    isLoading={isFetchingParticipants}
                    options={participantOptions}
                    value={getSelectValue()}
                    onChange={handleSelectionChange}
                    placeholder={
                      t("Type email or select from list...") ||
                      "Type email or select from list..."
                    }
                    formatCreateLabel={(inputValue) =>
                      `Add new: "${inputValue}"`
                    }
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    className="my-select"
                  />
                </div>

                {/* Conditional Date/Time or Calendly Config */}
                {formState?.type === "Calendly" ? (
                  <>
                    <CalendlySettings
                      formState={formState}
                      setFormState={setFormState}
                    />
                    {/* <RepetitionSettings formState={formState} setFormState={setFormState} meeting={meeting} /> */}
                  </>
                ) : (
                  <>
                    <div className="mb-4 form d-flex flex-column form-group">
                      <label className="form-label">
                        {t("meeting.formState.dateTime")}
                        <small style={{ color: "red", fontSize: "15px" }}>
                          *
                        </small>
                      </label>
                      <Flatpickr
                        data-enable-time
                        value={selectedDateTime}
                        onChange={handleChange}
                        options={{
                          locale: locale,
                          dateFormat: "d/m/Y, H:i",
                          time_24hr: true,
                          formatDate: (date) => formatDateWithCustomTime(date),
                        }}
                      />
                    </div>
                    <RepetitionSettings
                      formState={formState}
                      setFormState={setFormState}
                      meeting={meeting}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const mainModalContent = (
    <div
      className="quick-moment-form"
      style={{
        zIndex: 1040,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div className="modal-overlay-1">
        <div className="new-meeting-modal-1">
          <div className="modal-nav">
            <h4>
              {t("addQuickMomentbtninmission")}
              {(meetingData?.solution && meetingData?.created_from_whatsapp ) ? ` - ${meetingData?.solution?.title}` :meetingData?.solution_suggestion &&
                ` - ${meetingData.solution_suggestion}`}
            </h4>
            <button className="cross-btn" onClick={handleCancel}>
              <RxCross2 size={18} />
            </button>
          </div>

          <div className="modal-body">
            {!meetingData && (
              <div className="progress-container-1">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        openedFrom === "mission"
                          ? `${((step - 1) / 1) * 100}%` // For mission flow (2 steps: 0% to 100%)
                          : `${((step - 1) / 3) * 100}%`, // For normal flow (4 steps: 0% to 100%)
                    }}
                  ></div>
                </div>
                <div className="progress-steps">
                  {openedFrom === "mission" ? (
                    <>
                      <div
                        className={`progress-step ${step >= 1 ? "active" : ""}`}
                      >
                        <div className="step-number">1</div>
                        <div className="step-label">{t("Solution")}</div>
                      </div>
                      <div
                        className={`progress-step ${step >= 2 ? "active" : ""}`}
                      >
                        <div className="step-number">2</div>
                        <div className="step-label">{t("Moment")}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`progress-step ${step >= 1 ? "active" : ""}`}
                      >
                        <div className="step-number">1</div>
                        <div className="step-label">{t("Solution")}</div>
                      </div>
                      <div
                        className={`progress-step ${step >= 2 ? "active" : ""}`}
                      >
                        <div className="step-number">2</div>
                        <div className="step-label">{t("Moment")}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {showProgressBar && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.8)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                }}
              >
                <ProgressBar
                  now={progress}
                  label={`${progress}%`}
                  animated
                  style={{
                    width: "80%",
                    height: "20px",
                    borderRadius: "10px",
                  }}
                />
                <p
                  style={{
                    marginTop: "15px",
                    fontWeight: "600",
                    color: "#2C48AE",
                  }}
                >
                  {t("Processing integration login...")}
                </p>
              </div>
            )}
            {renderStepContent()}
          </div>

          <div className="modal-footer-fixed">
            <button className="btn btn-danger" onClick={handleCancel}>
              {t("Cancel")}
            </button>
            <div className="d-flex gap-2">
              {openedFrom === "mission" ? (
                <>
                  {step === 1 ? (
                    <button
                      className="btn btn-primary"
                      style={{ outline: 0, borderRadius: "9px" }}
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      {loading ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        t("meeting.formState.Save and Continue")
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{ outline: 0, borderRadius: "9px" }}
                        onClick={()=>meetingData?.created_from_whatsapp ? handleMeetingUpdate() : handleFinalSubmit()}
                        disabled={!momentName || loading}
                      >
                        {loading ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          t("Validate")
                        )}
                      </button>
                      {isTemplate &&
                        formState?.type !== "Calendly" &&
                        selectedSolution?.is_step_exists !== false &&
                        !meetingData?.created_from_whatsapp && (
                          <button
                            className="btn btn-primary"
                            style={{ outline: 0, borderRadius: "9px" }}
                            onClick={createAndPlay}
                            disabled={!momentName}
                          >
                            {loadingPlay ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              t("Validate and Play")
                            )}
                          </button>
                        )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {step < 2 ? (
                    <button
                      className="btn btn-primary"
                      style={{ outline: 0, borderRadius: "9px" }}
                      onClick={handleCreate}
                    >
                      {t("meeting.formState.Save and Continue")}
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary"
                        style={{ outline: 0, borderRadius: "9px" }}
                        onClick={()=>meetingData?.created_from_whatsapp ? handleMeetingUpdate() : handleFinalSubmit()}
                        disabled={!momentName}
                      >
                        {loading ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          t("Validate")
                        )}
                      </button>

                      {isTemplate &&
                        formState?.type !== "Calendly" &&
                        selectedSolution?.is_step_exists !== false &&
                        !meetingData?.created_from_whatsapp && (
                          <button
                            className="btn btn-primary"
                            style={{ outline: 0, borderRadius: "9px" }}
                            onClick={createAndPlay}
                            disabled={!momentName}
                          >
                            {loadingPlay ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : (
                              t("Validate and Play")
                            )}
                          </button>
                        )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {show &&
        !showStepsModal &&
        typeof document !== "undefined" &&
        createPortal(mainModalContent, document.body)}

      <Modal
        show={showConfirmation}
        onHide={handleCloseConfirmation}
        centered
        className="confirmation-modal"
        style={{ zIndex: 1051 }}
        backdropClassName="custom-high-z-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("areYouSure")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("unsavedChangesWarning")}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseConfirmation}>
            {t("Cancel")}
          </Button>
          <Button
            variant="danger"
            className="px-4 py-2 confirmation-delete"
            onClick={() => {
              setId(null);
              setClient(null);
              setClientId(null);
              setMission(null);
              setMissionId(null);
              setSelectedClient(null);
              setSelectedMission(null);
              setDestinationType(null);

              onClose();
            }}
          >
            {t("Yes")}
          </Button>
        </Modal.Footer>
      </Modal>

      {showStepsModal &&
        meeting &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="new-meeting-modal-container"
            style={{
              zIndex: 1055,
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="new-meeting-modal"
              style={{
                width: "80%",
                maxHeight: "90vh",
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div className="tektimetabs">
                <QuickStepChart
                  meetingId={meeting?.id}
                  id={id}
                  show={showStepsModal}
                  setId={setId}
                  closeModal={() => {
                    setShowStepsModal(false);
                    // onClose();
                  }}
                  meeting={meeting}
                  setMeeting={setMeeting}
                  closeMeeting={onClose}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
      <style>{`
        .custom-high-z-backdrop {
          z-index: 1050 !important;
        }
      `}</style>
    </>
  );
};

export default QuickMomentForm;
