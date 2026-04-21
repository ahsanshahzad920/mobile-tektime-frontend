import CookieService from '../Components/Utils/CookieService';
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { API_BASE_URL } from "../Components/Apicongfig";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useSteps } from "./Step";
import { useMeetings } from "./MeetingsContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useSolutionFormContext } from "./CreateSolutionContext";
import { useHeaderTitle } from "./HeaderTitleContext";
import moment from "moment";
import { formatDate, formatTime } from "../Components/Elements/Meeting/GetMeeting/Helpers/functionHelper";
import { useDestinations as useDestinationAPI } from "./DestinationsContext"; // <- Renamed


const CreateMeetingContext = createContext();

export const useDestinations = () => useContext(CreateMeetingContext);


export const FormProvider = ({ children }) => {

  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const { setUser, user, setCallUser } = useHeaderTitle();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [meeting, setMeeting] = useState(null);
  const [inputGroups, setInputGroups] = useState([]);
  const { getUserMeetingCount } = useDestinationAPI(); // For API logic
  // useEffect(() => {
  //   initializeMsal();
  // }, []);
  const {
    solutionSteps,
    steps,
    updateSteps,
    solutionType,
    solutionNote,
    solutionNoteTaker,
    solutionAlarm,
    solutionFeedback,
    solutionRemainder,
    solutionNotifcation,
    solutionShareBy,
    solutionMessageManagement
  } = useSteps();
  const [participants, setParticipants] = useState([]);
  const [checkId, setCheckId] = useState(null);
  const [meetingData, setMeetingData] = useState({});
  const [stepBtnDisabled, setStepBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stepsData, setStepsData] = useState([]);
  const [singleGuestData, setSingleGuestData] = useState({});
  const [token, setToken] = useState(null);
  const [open, setOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [call, setCall] = useState(false);
  const [destinationId, setDestinationId] = useState(null);
  const [destinationUniqueId, setDestinationUniqueId] = useState(null);
  const [googleFullName, setGoogleFullName] = useState(null);
  const [outlookFullName, setOutlookFullName] = useState(null);
  const [mailOutlook, setEmailOutlook] = useState(null);
  const [visioGoogleMeet, setVisioGoogleMeet] = useState(null);
  const [emailGmail, setEmailGmail] = useState(null);
  const [googleLoginCalled, setGoogleLoginCalled] = useState(false);
  const [outlookLoginCalled, setOutlookLoginCalled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const { setSolution } = useSolutionFormContext();
  const {
    getMeetings,
    getDraftMeetings,
    getClosedMeetings,
    setAllMeetings,
    setHasMore,
    setOffset,
    setMeetingLength,

    setAllClosedMeetings,
    setClosedHasMore,
    setClosedOffset,
    setClosedMeetingLength,

  } = useMeetings();
  const [timeUnitsTotal, setTimeUnitsTotal] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [toggleStates, setToggleStates] = useState({
    Visioconference: false,
    Room: false,
    Address: false,
    phone: false,
    agenda: false,
  });
  const [selectedToggle, setSelectedToggle] = useState(null);
  const [addParticipant, setAddParticipant] = useState(false);
  const [changePrivacy, setChangePrivacy] = useState(false);
  const [changeContext, setChangeContext] = useState(false);
  const [changeOptions, setChangeOptions] = useState(false);
  const [fromDestination, setFromDestination] = useState(false);
  const [fromDestinationName, setFromDestinationName] = useState(null);
  const [callDestination, setCallDestination] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [teamAdded, setTeamAdded] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);

  const [updatedButton, setUpdatedButton] = useState(false);
  const [quit, setQuit] = useState(false);

  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [formState, setFormState] = useState({
    selectedOption: null,
    title: null,
    date: null,
    start_time: null,
    description: null,
    type: null,
    priority: null,
    alarm: false,
    feedback: false,
    remainder: false,
    notification: false,
    autostart: false,
    playback: "Manual",
    prise_de_notes: "Manual",
    note_taker: false,
    objective: null,
    casting_type: "Invitation",
    participants: [],
    id: null,
    repetition: false,
    repetition_number: 1,
    repetition_frequency: "Daily",
    repetition_end_date: null,
    selected_days: [],
    teams: [],
    steps: [],
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
    solution_id: null,
    solution_tab: "use a template",
    client: null,
    client_id: null,
    destination: null,
    destination_id: null,
    destination_type: null,
    open_ai_decide: false,
    automatic_strategy: false,
    automatic_instruction: false,
    whatsapp_in: false,
    presentation: false,
  });

  // Function to get the user's current time dynamically
  const updateUserTime = () => {
    const currentTime = moment().startOf("minute"); // Normalize to minute
    setUserTime(currentTime);
  };

  // Update userTime every minute dynamically
  useEffect(() => {
    updateUserTime();
    const interval = setInterval(updateUserTime, 60000); // Update every 60 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Calculate the time difference when userTime or meeting details change
  useEffect(() => {
    if (userTime && formState?.date && formState?.start_time) {
      const meetingTime = moment(
        `${formState?.date} ${formState?.start_time}`,
        "YYYY-MM-DD HH:mm:ss"
      ).startOf("minute"); // Normalize meeting time to remove seconds

      if (meetingTime.isValid()) {
        const diff = meetingTime.diff(userTime, "minutes");
        setTimeDifference(diff);
      } else {
        console.error("Invalid meeting date or time format.");
        setTimeDifference(null); // Reset to null if invalid
      }
    }
  }, [userTime, formState]);
  // const handleCloseModal = () => {
  //   setOpen(false);
  //   navigate('/meeting')
  //   setIsUpdated(false);
  // };
  const handleCloseModal = () => {
    // First, reset all the simple state values
    setOpen(false);
    setMeeting(null);
    setCheckId(null);
    setAddParticipant(false);
    setChangePrivacy(false);
    setChangeContext(false);
    setChangeOptions(false);
    setFromDestination(false);
    setFromDestinationName(null);
    setIsUpdated(false);
    setIsDuplicate(false);

    // Then toggle these values (if absolutely necessary)
    setCall(prev => !prev);
    setCallDestination(prev => !prev);

    // Reset form state with a comprehensive default
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
      solution_id: null,
      solution_tab: "use a template",
      open_ai_decide: false,
      automatic_strategy: false,
      automatic_instruction: false,
      whatsapp_in: false,
      presentation: false,
    });

    // Reset other related states
    updateSteps([]);
    setInputGroups([]);

    // Navigation commented out, but if needed:
    // navigate("/meeting");
  };
  // Alternatively, use useEffect to log the updated state
  // useEffect(() => {}, [formState]);

  const handleShow = () => {
    updateSteps([]);
    setOpen(true);
  };

  // useEffect(() => {}, [steps]);
  useEffect(() => {
    const accessToken = CookieService.get("access_token");
    if (accessToken) {
      setToken(accessToken);
      setIsLoggedIn(CookieService.get("is_logged_in") === "true");
      setIsLoggedIn(true);
    }
  }, [token, open]);

  const getMeeting = async (checkId) => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/meetings/${checkId}?current_time=${formattedTime}&current_date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status === 200) {
        setMeeting(response?.data?.data);
        setMeetingData(response.data.data);
        setFormState(response.data.data);
        setStepsData(response.data?.data);
        setLoading(false);
        setParticipants(response.data?.data?.participants);

        const stepsData = response.data?.data?.steps;
        setInputGroups(stepsData);
        // Calculate cumulative time for each time unit
        const totals = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        // Calculating cumulative time of all steps
        const cumulativeTime = stepsData?.reduce(
          (totalTime, step) => totalTime + step.time,
          0
        );
        // setTime(cumulativeTime);
        stepsData?.forEach((step) => {
          switch (step.time_unit) {
            case "days":
              totals.days += step.time;
              break;
            case "hours":
              totals.hours += step.time;
              break;
            case "minutes":
              totals.minutes += step.time;
              break;
            case "seconds":
              totals.seconds += step.time;
              break;
            default:
              break;
          }
        });

        setTimeUnitsTotal(totals);
      }
    } catch (error) {
      console.log("error while getting steps", error);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingModal = async (checkId) => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/meeting-data/${checkId}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setMeeting(response?.data?.data);
        setMeetingData(response.data.data);
        setFormState(response.data.data);
        setStepsData(response.data?.data);
        setLoading(false);
        setParticipants(response.data?.data?.participants);

        const stepsData = response.data?.data?.steps;
        setInputGroups(stepsData);
        // Calculate cumulative time for each time unit
        const totals = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        // Calculating cumulative time of all steps
        const cumulativeTime = stepsData?.reduce(
          (totalTime, step) => totalTime + step.time,
          0
        );
        // setTime(cumulativeTime);
        stepsData?.forEach((step) => {
          switch (step.time_unit) {
            case "days":
              totals.days += step.time;
              break;
            case "hours":
              totals.hours += step.time;
              break;
            case "minutes":
              totals.minutes += step.time;
              break;
            case "seconds":
              totals.seconds += step.time;
              break;
            default:
              break;
          }
        });

        setTimeUnitsTotal(totals);
      }
    } catch (error) {
      console.log("error while getting steps", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputBlur = useCallback(
    async (newformstate, options = {}) => {
      setLoading(true);
      const formFields = [
        formState.selectedOption,
        formState.priority,
        formState.title,
        formState.description,
      ];
      const hasText = formFields?.some((field) => {
        if (typeof field === "string") {
          return field?.trim() !== "";
        }
        return field !== null;
      });

      if (hasText) {
        const { updatedButton, quitAndUpdate } = options;

        if (isDuplicate || isUpdated) {
          if (quitAndUpdate) {
            const updateResponse = await updateMeeting(
              newformstate,
              updatedButton,
              quitAndUpdate
            );
            return updateResponse;
          } else {
            const updateResponse = await updateMeeting(newformstate);
            return updateResponse;
          }
        } else if (checkId === null) {
          const draftResponse = await handleDraft(newformstate); // Save as draft if no id exists
          return draftResponse;
        } else {
          const updateResponse = await updateDraft(newformstate); // Update draft if an ID exists
          return updateResponse;
        }
      }
      setLoading(false); // Hide loader
    },
    [formState, checkId, isDuplicate]
  );

  const handleDraft = async (newFormState) => {
    const slides = [];
    let prevCount = 0;
    for (let i = 0; i < inputGroups.length; i++) {
      const currentStep = inputGroups[i];
      const counts = [prevCount, prevCount + currentStep.count2];

      slides.push({
        value: currentStep.title,
        counts: counts,
      });

      prevCount = counts[1];
    }

    const repetitionFields = formState.repetition
      ? {
        repetition_number: formState.repetition_number,
        repetition_frequency: formState.repetition_frequency,
        repetition_end_date: formState.repetition_end_date,
        selected_days: formState.selected_days,
      }
      : {
        repetition_number: 1,
        repetition_frequency: "Daily",
        repetition_end_date: null,
        selected_days: [],
      };

    const inputData = {
      ...formState,
      objective: fromDestination ? fromDestinationName : formState.objective,
      type: formState.type,
      title: formState.title,
      date: formState.date,
      start_time: formState.start_time,
      description: newFormState?.description || formState.description,
      steps: inputGroups,
      alarm: formState.alarm,
      feedback: formState.feedback,
      notification: formState.notification,
      remainder: formState.remainder,
      autostart: formState.autostart,
      total_time: formState.time,
      prise_de_notes: formState.prise_de_notes,
      note_taker: formState.note_taker,
      playback: formState?.playback,
      priority: formState.priority,
      open_ai_decide: formState.open_ai_decide,
      participants: formState.participants ? formState.participants : [],
      teams: formState.teams,
      meeting_id: formState.meetingId,
      // status: "draft",
      status: addParticipant || changePrivacy || changeContext || changeOptions ? formState?.status : "draft",
      repetition: formState.repetition || false,
      ...repetitionFields,
      moment_privacy: formState.moment_privacy,
      moment_password:
        formState.moment_privacy === "password" ? formState.password : null,
      moment_privacy_teams: [],
      location: formState.location,
      agenda: formState.agenda,
      address: formState.address,

      room_details: formState.room_details,
      casting_type: formState?.type === "Newsletter" ? "Subscription" : formState?.casting_type,
      phone: formState.phone,
      share_by: formState.share_by,
      timezone: userTimeZone,
      solution_steps: solutionSteps || [],
      solution_type: solutionType || null,
      solution_note: solutionNote || "Manual",
      solution_note_taker: solutionNoteTaker || false,
      solution_alarm: solutionAlarm || false,
      solution_feedback: solutionFeedback || false,
      solution_remainder: solutionRemainder || false,
      solution_notification: solutionNotifcation || false,
      solution_shareby: solutionShareBy || null,
      solution_open_ai_decide: solutionMessageManagement || false,
      price: Number(formState.price),
      max_participants_register: Number(formState.max_participants_register),
      automatic_strategy: formState.automatic_strategy || false,
      automatic_instruction: formState.automatic_instruction || false,
      whatsapp_in: formState.whatsapp_in || false,
      presentation: formState.presentation || false,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/meetings`, inputData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (response.status) {
        toast.success(t("messages.draftSaved"));
        setLoading(false);
        setCheckId(response.data.data?.id);
        setMeetingData(response.data?.data);
        setInputGroups(response.data.data?.steps || []);
        setParticipants(response.data.data?.participants || []);
      }
      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to save draft:", error);
      // toast.error(t("messages.draftSaveError"));
    }
    finally {
      getUserMeetingCount()

    }
  };
  const updateDraft = async (newformstate) => {
    const {
      objective,
      type,
      title,

      date,
      start_time,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      note_taker,
      playback,
      time,
      teams,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      participants,
      selected_days,
      moment_privacy,
      moment_privacy_teams,
      moment_password,
      location,
      agenda,
      address,
      room_details,
      phone,
      share_by,
      price,
      max_participants_register,
      casting_type,
      solution_id,
      solution_tab,
      client_id,
      client,
      destination,
      destination_id,
      destination_type,
      open_ai_decide,
      automatic_strategy,
      automatic_instruction,
      whatsapp_in,
      presentation
    } = formState;
    const repetitionFields = repetition
      ? {
        repetition_number,
        repetition_frequency,
        repetition_end_date,
        selected_days,
      }
      : {
        repetition_number: 1,
        repetition_frequency: "Daily",
        repetition_end_date: null,
        selected_days: [],
      };

    const formFields = [objective, type, title, date, start_time];
    const hasText = formFields?.some((field) => field?.trim() !== "");
    if (!hasText) {
      toast.error("Veuillez d'abord remplir les champs ci-dessus");
      return;
    }

    const cleanedParticipants =
      newformstate?.participants?.map(
        ({
          emailInput,
          filteredSuggestions,
          showAdditionalFields,
          ...rest
        }) => ({
          ...rest,
          meeting_id: checkId || null,
        })
      ) || [];

    const inputData = {
      ...newformstate,
      objective: fromDestination ? fromDestinationName : objective,
      // objective,
      type,
      title,
      date,
      start_time,
      description: newformstate?.description,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      casting_type: type === "Newsletter" ? "Subscription" : casting_type,
      playback,
      prise_de_notes,
      note_taker,
      total_time: time,
      participants: cleanedParticipants,
      // teams: teams,
      teams: teams?.map((team) => team.id) || [],
      timezone: userTimeZone,
      steps: inputGroups,
      // status: isDuplicate || isUpdated ? "active" : "draft",
      status:
        isDuplicate || isUpdated
          ? "active"
          : addParticipant || changePrivacy || changeContext || changeOptions
            ? formState?.status || newformstate?.status
            : "draft",
      repetition: repetition || false,
      ...repetitionFields,
      moment_privacy,
      moment_privacy_teams:
        moment_privacy === "team" &&
          moment_privacy_teams?.length &&
          typeof moment_privacy_teams[0] === "object"
          ? moment_privacy_teams.map((team) => team.id)
          : moment_privacy_teams || [], // Send as-is if IDs are already present
      moment_password: moment_privacy === "password" ? moment_password : null,
      location: location,
      agenda: agenda,
      address,
      room_details: room_details,
      phone: phone,
      share_by: share_by,
      _method: "put",
      meeting_id: checkId,
      add_team: teams?.length > 0 && selectedTab !== "tab7" ? true : false,
      price: Number(price),
      max_participants_register: Number(max_participants_register),
      update_meeting: addParticipant ? true : false,
      solution_id: solution_id || null,
      solution_tab: solution_tab || null,
      client: client || null,
      client_id: client_id || null,
      destination: destination || null,
      destination_id: destination_id || null,
      destination_type: destination_type || null,
      open_ai_decide: open_ai_decide || false,
      automatic_strategy: automatic_strategy || false,
      automatic_instruction: automatic_instruction || false,
      whatsapp_in: whatsapp_in || false,
      presentation: presentation || false,

    };

    if (isDuplicate) {
      inputData.duplicate = true;
    }
    //
    try {
      console.log("inputDatainputData", inputData);
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const allSteps = response.data.data.steps.sort((a, b) => a.id - b.id);
        setInputGroups(allSteps);
        setParticipants(response.data.data.participants || []);

        // if (isAddStepButtonClicked) {
        //   setInputGroups((prev) => [
        //     ...prev,
        //     {
        //       order_no: inputGroups.length + 1,
        //       step: inputGroups.length + 1,
        //       title: "",
        //       count1: 0,
        //       count2: 0,
        //       time: 0,
        //     },
        //   ]);
        // }
        setLoading(false);
        setMeetingData({
          ...response.data.data,
          steps: allSteps,
          participants: response.data.data.participants || [],
        });
      } else {
        setLoading(false);
        // toast.error("Failed to update meeting.");
      }

      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to update draft:", error);
      toast.error(t("messages.draftSaveError"));
    } finally {
      setStepBtnDisabled(false);
      setLoading(false); // Hide loader after the API call is complete
    }
  };
  const updateMeeting = async (newformstate, updatedButton, quitAndUpdate) => {
    const {
      objective,
      type,
      title,
      date,
      start_time,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      note_taker,
      playback,
      time,
      teams,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      participants,
      selected_days,
      moment_privacy,
      moment_privacy_teams,
      moment_password,
      location,
      agenda,
      address,
      room_details,
      phone,
      share_by,
      price,
      max_participants_register,
      casting_type,
      solution_id,
      solution_tab,
      client_id,
      client,
      destination,
      destination_id,
      destination_type,
      open_ai_decide,
      automatic_strategy,
      automatic_instruction,
      whatsapp_in,
      presentation
    } = formState;
    const repetitionFields = repetition
      ? {
        repetition_number,
        repetition_frequency,
        repetition_end_date,
        selected_days,
      }
      : {
        repetition_number: 1,
        repetition_frequency: "Daily",
        repetition_end_date: null,
        selected_days: [],
      };

    const formFields = [objective, type, title, date, start_time];
    const hasText = formFields?.some((field) => field?.trim() !== "");
    if (!hasText) {
      toast.error("Veuillez d'abord remplir les champs ci-dessus");
      return;
    }

    const cleanedParticipants =
      newformstate?.participants?.map(
        ({
          emailInput,
          filteredSuggestions,
          showAdditionalFields,
          ...rest
        }) => ({
          ...rest,
          meeting_id: checkId || null,
        })
      ) || [];

    const inputData = {
      ...meetingData,
      objective,
      type,
      title,
      date,
      start_time,
      description: newformstate?.description,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      playback,
      casting_type: type === "Newsletter" ? "Subscription" : casting_type,
      prise_de_notes,
      note_taker,
      total_time: time,
      participants: cleanedParticipants,
      // teams: teams,
      teams: teams?.map((team) => team.id) || [],
      // steps: inputGroups,
      steps: newformstate?.steps || inputGroups,
      status: isDuplicate || isUpdated ? "active" : "draft",
      repetition: repetition || false,
      ...repetitionFields,
      moment_privacy,
      moment_privacy_teams:
        moment_privacy === "team" &&
          moment_privacy_teams?.length &&
          typeof moment_privacy_teams[0] === "object"
          ? moment_privacy_teams.map((team) => team.id)
          : moment_privacy_teams || [], // Send as-is if IDs are already present

      moment_password: moment_privacy === "password" ? moment_password : null,
      timezone: userTimeZone,
      location: location,
      agenda: agenda,
      address: address,
      room_details: room_details,
      phone: phone,
      share_by: share_by,
      _method: "put",
      meeting_id: checkId,
      add_team: teams?.length > 0 && selectedTab !== "tab7" ? true : false,
      update_meeting: updatedButton ? true : false,
      create_agenda: quitAndUpdate && isDuplicate ? true : false,
      price: Number(price),
      max_participants_register: Number(max_participants_register),
      solution_id: solution_id,
      solution_tab: solution_tab,
      client: client || null,
      client_id: client_id || null,
      destination: destination || null,
      destination_id: destination_id || null,
      destination_type: destination_type || null,
      open_ai_decide: open_ai_decide || false,
      automatic_strategy: automatic_strategy || false,
      automatic_instruction: automatic_instruction || false,
      whatsapp_in: whatsapp_in || false,
      presentation: presentation || false,
    };

    if (isUpdated) {
      inputData.update = true;
    }

    try {
      console.log("inputData22", inputData);
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        const allSteps = response.data.data.steps.sort((a, b) => a.id - b.id);
        setInputGroups(allSteps);
        setParticipants(response.data.data.participants || []);

        // if (isAddStepButtonClicked) {
        //   setInputGroups((prev) => [
        //     ...prev,
        //     {
        //       order_no: inputGroups.length + 1,
        //       step: inputGroups.length + 1,
        //       title: "",
        //       count1: 0,
        //       count2: 0,
        //       time: 0,
        //     },
        //   ]);
        // }
        // setIsDuplicate(false)
        // setIsUpdated(false)
        // setCheckId(null)
        setLoading(false);
        setMeetingData({
          ...response.data.data,
          steps: allSteps,
          participants: response.data.data.participants || [],
        });
        // navigate(`/invite/${data?.id}`, { state: { data, from: "meeting" } });

        // if (formState.repetition) {
        //   toast.success(t("messages.repetitionEnabled"));
        // }
      } else {
        setLoading(false);
        // toast.error("Failed to update meeting.");
      }

      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to update draft:", error);
    } finally {
      setStepBtnDisabled(false);
      setLoading(false); // Hide loader after the API call is 
      getUserMeetingCount()
      // complete
    }
  };
  const GetSingleGuestData = async (GuestId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/participants/${GuestId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setSingleGuestData(response?.data?.data?.participant);
        setLoading(false);
      }
    } catch (error) {
      console.log("error while getting steps", error);
    } finally {
      setLoading(false);
    }
  };
  const deleteMeeting = async (meetingId) => {
    if (meetingId) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/meetings/${meetingId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(t("draftDeletedToast"));
          const deletedMeeting = response?.data?.data;

          setFormState({
            objective: "",
            type: null,
            title: null,
            date: null,
            start_time: null,
            description: null,
            steps: [],
            alarm: 0,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            prise_de_notes: "Manual",
            note_taker: false,
            playback: "Manual",
            time: 0,
            participants: [],
            teams: [],
            repetition: false,
            repetition_number: 1,
            repetition_frequency: "Daily",
            repetition_end_date: null,
            selected_days: [],
            casting_type: "Invitation",
            moment_privacy: "participant only",
            moment_privacy_teams: [],
            steps: [],

            moment_password: "",
            location: "",
            agenda: "",
            address: "",
            room_details: "",
            phone: "",
            share_by: null,
            price: null,
            max_participants_register: 0,
            automatic_strategy: false,
            automatic_instruction: false, 
            whatsapp_in: false, 
            presentation: false,
            
            casting_tab: null,
            solution_id: null,
            solution_tab: "use a template",

          });
          if (JSON.parse(CookieService.get("role"))?.name === "User") {
            navigate("/Invities");
          } else {
            navigate("/meeting");
          }
          setStepsData([]);
          setMeetingData(null);
          setInputGroups([]);
          setParticipants([]);
          setCheckId(null);
          setMeeting(null);
          setAddParticipant(false);
          setChangePrivacy(false);
          setChangeContext(false);
          setChangeOptions(false);

          setFromDestination(false);
          setFromDestinationName(null);
          handleCloseModal();
          setLoading(false);
          if (deletedMeeting?.status === "draft") {
            await getDraftMeetings();
          } else if (
            deletedMeeting?.status === "closed" ||
            deletedMeeting?.status === "abort"
          ) {
            await getClosedMeetings();
          } else {
            await getMeetings();
          }
        } else {
          toast.error("Failed to delete meeting.");
        }
      } catch (error) {
        toast.error(t(error.message));
      }
    } else {
      setFormState({
        objective: "",
        type: "",
        title: "",
        date: "",
        start_time: "",
        description: "",
        steps: [],
        alarm: 0,
        feedback: false,
        remainder: false,
        notification: false,
        autostart: false,
        prise_de_notes: "Manual",
        note_taker: false,
        playback: "Manual",
        time: 0,
        participants: [],
        teams: [],
        steps: [],

        repetition: false,
        repetition_number: 1,
        repetition_frequency: "Daily",
        repetition_end_date: null,
        selected_days: [],
        moment_privacy: "participant only",
        moment_privacy_teams: [],
        moment_password: "",
        location: "",
        casting_type: "Invitation",
        agenda: "",
        address: "",
        room_details: "",
        phone: "",
        share_by: null,
        price: null,
        max_participants_register: 0,
        casting_tab: null,
        solution_id: null,
        solution_tab: "use a template",
        automatic_strategy: false,
        automatic_instruction:false,
        whatsapp_in:false,
        presentation: false,

      });
      updateSteps([]);
      setMeeting(null);
      setCheckId(null);
      handleCloseModal();
      setInputGroups([]);
      setAddParticipant(false);
      setChangePrivacy(false);
      setChangeContext(false);
      setChangeOptions(false);

      setFromDestination(false);
      setFromDestinationName(null);
      await getMeetings();
    }
    getUserMeetingCount()

  };
  const saveDraft = async (newformstate) => {
    if (checkId) {
      const {
        objective,
        type,
        title,
        // description,
        date,
        start_time,
        priority,
        alarm,
        feedback,
        remainder,
        notification,
        autostart,
        prise_de_notes,
        note_taker,
        playback,
        open_ai_decide,
        time,
        teams,
        repetition,
        repetition_number,
        repetition_frequency,
        repetition_end_date,
        participants,
        selected_days,
        moment_privacy,
        moment_privacy_teams,
        moment_password,
        location,
        agenda,
        address,
        room_details,
        phone,
        share_by,
        price,
        max_participants_register,
        casting_type,
        client_id,
        automatic_strategy,
        automatic_instruction,
        whatsapp_in,
        presentation
      } = formState;

      const repetitionFields = repetition
        ? {
          repetition_number,
          repetition_frequency,
          repetition_end_date,
          selected_days,
        }
        : {
          repetition_number: 1,
          repetition_frequency: "Daily",
          repetition_end_date: null,
          selected_days: [],
        };

      const formFields = [
        objective,
        type,
        title,
        // description,
        date,
        start_time,
      ];
      const hasText = formFields?.some((field) => field?.trim() !== "");
      if (!hasText) {
        toast.error("Veuillez d'abord remplir les champs ci-dessus");
        return;
      }

      const cleanedParticipants =
        newformstate?.participants?.map(
          ({
            emailInput,
            filteredSuggestions,
            showAdditionalFields,
            ...rest
          }) => ({
            ...rest,
            meeting_id: checkId || null,
          })
        ) || [];

      const inputData = {
        ...meeting,
        objective,
        type,
        title,
        date,
        start_time,
        description: newformstate?.description || "",
        priority,
        alarm,
        feedback,
        remainder,
        notification,
        client_id: client_id || null,
        autostart,
        playback,
        prise_de_notes,
        note_taker,
        total_time: time,
        participants: cleanedParticipants,
        // teams: teams,
        casting_type: type === "Newsletter" ? "Subscription" : casting_type,
        teams: teams?.map((team) => team.id) || [],
        timezone: userTimeZone,
        steps: inputGroups,
        status: "draft",
        repetition: repetition || false,
        ...repetitionFields,
        moment_privacy,
        moment_privacy_teams:
          moment_privacy === "team" &&
            moment_privacy_teams?.length &&
            typeof moment_privacy_teams[0] === "object"
            ? moment_privacy_teams.map((team) => team.id)
            : moment_privacy_teams || [], // Send as-is if IDs are already present
        moment_password: moment_privacy === "password" ? moment_password : null,
        location: location,
        agenda: agenda,
        address: address,
        room_details: room_details,
        phone: phone,
        share_by: share_by,
        _method: "put",
        meeting_id: checkId,
        price: Number(price),
        open_ai_decide,
        max_participants_register: Number(max_participants_register),
        automatic_strategy: automatic_strategy || false,
        automatic_instruction: automatic_instruction || false,
        whatsapp_in: whatsapp_in || false,
        presentation: presentation || false,
      };
      //
      try {
        console.log("daf response", inputData);
        const response = await axios.post(
          `${API_BASE_URL}/meetings/${checkId}`,
          inputData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status === 200) {
          const savedDraft = response?.data?.data;
          const allSteps = response.data.data.steps.sort((a, b) => a.id - b.id);
          setLoading(false);
          setInputGroups(allSteps);
          setParticipants(response.data.data.participants || []);
          setMeetingData({
            ...response.data.data,
            steps: allSteps,
            participants: response.data.data.participants || [],
          });

          setFormState({
            objective: "",
            type: "",
            title: "",
            date: "",
            start_time: "",
            description: "",
            steps: [],
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "Manual",
            prise_de_notes: "Manual",
            note_taker: false,
            time: 0,
            participants: [],
            teams: [],
            repetition: false,
            repetition_number: 1,
            repetition_frequency: "Daily",
            repetition_end_date: null,
            selected_days: [],
            moment_privacy: "participant only",
            moment_privacy_teams: [],
            moment_password: "",
            location: "",
            agenda: "",
            address: "",
            room_details: "",
            phone: "",
            share_by: null,
            price: null,
            max_participants_register: 0,

            casting_type: "Invitation",
          });
          setCheckId(null);
          updateSteps([]);
          handleCloseModal();
          setMeeting(null);
          if (savedDraft?.status === "draft") {
            await getDraftMeetings();
          } else {
            await getMeetings();
          }
        } else {
          toast.error("Failed to update meeting.");
        }
      } catch (error) {
        console.error("Failed to update draft:", error);
        // toast.error(t("messages.draftSaveError"));
        handleCloseModal();
      } finally {
        setStepBtnDisabled(false);
        setLoading(false); // Hide loader after the API call is complete
        updateSteps([]);
        setFormState({
          selectedOption: null,
          title: null,
          date: null,
          start_time: null,
          description: null,
          type: null,
          priority: null,
          alarm: false,
          feedback: false,
          remainder: false,
          notification: false,
          autostart: false,
          playback: "Manual",
          prise_de_notes: "Manual",
          note_taker: false,
          objective: null,
          casting_type: "Invitation",
          participants: [],
          id: null,
          repetition: false,
          repetition_number: 1,
          repetition_frequency: "Daily",
          repetition_end_date: null,
          selected_days: [],
          teams: [],
          steps: [],
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
          solution_id: null,
          solution_tab: "use a template",

          client: null,
          client_id: null,
          destination: null,
          destination_id: null,
          destination_type: null,
          open_ai_decide: false,
          automatic_strategy: false,
          automatic_instruction:false,
          whatsapp_in:false,
          presentation: false,
        })
        setCheckId(null);
        setMeeting(null);
        setInputGroups([]);
      }
    } else {
      const slides = [];
      let prevCount = 0;
      for (let i = 0; i < inputGroups.length; i++) {
        const currentStep = inputGroups[i];
        const counts = [prevCount, prevCount + currentStep.count2];

        slides.push({
          value: currentStep.title,
          counts: counts,
        });

        prevCount = counts[1];
      }

      const repetitionFields = formState.repetition
        ? {
          repetition_number: formState.repetition_number,
          repetition_frequency: formState.repetition_frequency,
          repetition_end_date: formState.repetition_end_date,
          selected_days: formState.selected_days,
        }
        : {
          repetition_number: 1,
          repetition_frequency: "Daily",
          repetition_end_date: null,
          selected_days: [],
        };

      const inputData = {
        objective: fromDestination ? fromDestinationName : formState.objective,
        type: formState.type,
        title: formState.title,
        date: formState.date,
        start_time: formState.start_time,
        description: newformstate?.description || formState.description,
        steps: inputGroups,
        alarm: formState.alarm,
        feedback: formState.feedback,
        remainder: formState.remainder,
        notification: formState.notification,
        open_ai_decide: formState.open_ai_decide,
        autostart: formState.autostart,
        total_time: formState.time,
        prise_de_notes: formState.prise_de_notes,
        note_taker: formState.note_taker,
        client_id: formState?.client_id || null,
        destination_id: formState?.destination_id || null,
        playback: formState?.playback,
        priority: formState.priority,
        participants: formState.participants ? formState.participants : [],
        teams: formState.teams,
        meeting_id: formState.meetingId,
        // status: "draft",
        status: addParticipant || changePrivacy || changeContext || changeOptions ? formState?.status : "draft",
        repetition: formState.repetition || false,
        ...repetitionFields,
        moment_privacy: formState.moment_privacy,
        moment_password:
          formState.moment_privacy === "password" ? formState.password : null,
        moment_privacy_teams: [],
        location: formState.location,
        agenda: formState.agenda,
        address: formState.address,
        room_details: formState.room_details,
        phone: formState.phone,
        share_by: formState.share_by,
        timezone: userTimeZone,
        price: Number(formState.price),
        max_participants_register: Number(formState.max_participants_register),
        casting_type: formState?.type === "Newsletter" ? "Subscription" : formState.casting_type,
        automatic_strategy: formState.automatic_strategy || false,
        automatic_instruction: formState.automatic_instruction || false,
        whatsapp_in: formState.whatsapp_in || false,
        presentation: formState.presentation || false
      };

      try {
        console.log("inputDatadd", inputData);
        const response = await axios.post(
          `${API_BASE_URL}/meetings`,
          inputData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status) {
          const savedDraft = response?.data?.data;
          toast.success(t("messages.draftSaved"));
          setLoading(false);
          setFormState({
            objective: "",
            type: "",
            title: "",
            date: "",
            start_time: "",
            description: "",
            steps: [],
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "Manual",
            prise_de_notes: "Manual",
            note_taker: false,
            time: 0,
            participants: [],
            teams: [],
            repetition: false,
            repetition_number: 1,
            repetition_frequency: "Daily",
            repetition_end_date: null,
            selected_days: [],
            moment_privacy: "participant only",
            moment_privacy_teams: [],
            moment_password: "",
            location: "",
            agenda: "",
            address: "",
            room_details: "",
            phone: "",
            share_by: null,
            price: null,
            max_participants_register: 0,

            casting_tab: null,
            casting_type: "Invitation",
          });
          setCheckId(null);
          updateSteps([]);
          setMeeting(null);
          handleCloseModal();
          // await getMeetings();
          if (savedDraft?.status === "draft") {
            await getDraftMeetings();
          } else {
            await getMeetings();
          }
        }
        return response;
      } catch (error) {
        handleCloseModal();
        setLoading(false);
        console.error("Failed to save draft:", error);
      }
    }
    getUserMeetingCount()

  };

  const userid = CookieService.get("user_id");

  const onSuccess = (response) => {
    const { code } = response;
    axios
      .post(
        `${API_BASE_URL}/auth/google`,
        {
          code: code,
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      )
      .then(async (response) => {
        if (response.data) {
          // setOpen(false);
          // setActiveTab("Evènements programmés");
          // setGoogleFullName(response?.data?.user?.google_full_name);
          // setVisioGoogleMeet(response?.data?.user?.google_full_name);
          // setEmailGmail(response?.data?.user?.google_account);
          setIsLoggedIn(true);
          setLoading(false);
          await updateMeetingPage();
          CookieService.set("is_logged_in", "true");
          sessionStorage.setItem(
            "access_token",
            response?.data?.token?.access_token
          );
          sessionStorage.setItem(
            "refresh_token",
            response?.data?.token?.refresh_token
          );
          localStorage.setItem(
            "access_token",
            response?.data?.token?.access_token
          );
          localStorage.setItem(
            "refresh_token",
            response?.data?.token?.refresh_token
          );

          const expiresIn = response.data?.token?.expires_in; // e.g., 3598 seconds
          const expirationTime = Date.now() + expiresIn * 1000; // current time + expires_in in milliseconds
          CookieService.set("token_expiration_time", expirationTime);
          sessionStorage.setItem("token_expiration_time", expirationTime);
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        // toast.error("Google Authentication Failed, Server Error");
        toast.error(error?.response?.data?.message);
      });
  };

  const onLoginSuccess = async (response) => {
    const { code } = response;
    axios
      .post(
        `${API_BASE_URL}/auth/google`,
        {
          code: code,
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      )
      .then(async (response) => {
        if (response.data) {
          const data = response?.data?.data;
          setGoogleFullName(data?.user?.google_full_name);
          setVisioGoogleMeet(data?.user?.google_full_name);
          setEmailGmail(data?.user?.google_account);
          setIsLoggedIn(true);
          setLoading(false);
          // // await updateMeetingPage();
          CookieService.set("is_logged_in", "true");
          CookieService.set("access_token", data?.token?.access_token);
          CookieService.set("refresh_token", data?.token?.refresh_token);
          sessionStorage.setItem("access_token", data?.token?.access_token);
          sessionStorage.setItem("refresh_token", data?.token?.refresh_token);
          // CookieService.set("is_google_login", true);
          CookieService.set("is_google_login", JSON.stringify(true));

          const expiresIn = data?.token?.expires_in;
          const expirationTime = Date.now() + expiresIn * 1000;
          CookieService.set("token_expiration_time", expirationTime);
          sessionStorage.setItem("token_expiration_time", expirationTime);

          // Prepare FormData
          const formData = new FormData();

          // Add meeting fields
          formData.append("_method", "put"); // Specify the method override
          formData.append("title", user?.title || "");
          formData.append("name", user?.name || "");
          formData.append("last_name", user?.last_name || "");
          formData.append("email", user?.email || "");
          formData.append("phoneNumber", user?.phoneNumber || "");
          formData.append("enterprise_id", user?.enterprise_id || "");
          formData.append("bio", user?.bio || "");
          formData.append("post", user?.post || "");
          formData.append("timezone", userTimeZone || "Europe/Paris");
          formData.append("role_id", user?.role_id || "");

          user?.social_links?.forEach((link, index) => {
            if (link.id) {
              // Existing link (include ID)
              formData.append(`social_links[${index}][id]`, link.id);
            }
            formData.append(`social_links[${index}][platform]`, link.platform);
            formData.append(`social_links[${index}][link]`, link.link);
          });

          user?.websites?.forEach((site, index) => {
            if (site.id) {
              // Existing link (include ID)
              formData.append(`websites[${index}][id]`, site.id);
            }
            formData.append(`websites[${index}][title]`, site.title);
            formData.append(`websites[${index}][link]`, site.link);
          });

          user?.affiliation_links?.forEach((site, index) => {
            if (site.id) {
              // Existing link (include ID)
              formData.append(`affiliation_links[${index}][id]`, site.id);
            }
            formData.append(`affiliation_links[${index}][title]`, site.title);
            formData.append(`affiliation_links[${index}][link]`, site.link);
          });

          formData.append("video", user?.video);

          formData.append("current_password", user?.currentPassword || "");
          formData.append("password", user?.newPassword || "");
          formData.append("password_confirmation", user?.retypePassword || "");

          formData.append("visibility", user?.visibility || "public");
          user?.teams?.forEach((team) => {
            formData.append("team_id[]", team.id);
          });

          // Add integration_links
          const existingIntegrationLinks = user?.integrationLinks || [];
          const newIndexIntegration = existingIntegrationLinks.length; // Get next available index

          formData.append(`integration_links[${newIndexIntegration}][platform]`, "Google Agenda");
          formData.append(`integration_links[${newIndexIntegration}][value]`, data?.user?.google_full_name);

          const existingEmailLinks = user?.emailLinks || []; // Ensure it's an array
          const newIndex = existingEmailLinks.length; // Get the next available index

          formData.append(`email_links[${newIndex}][platform]`, "Gmail");
          formData.append(`email_links[${newIndex}][value]`, data?.user?.google_account);


          const existingVisioconferenceLinks = user?.visioconferenceLinks || [];
          const newIndexVisio = existingVisioconferenceLinks.length; // Get the next available index

          formData.append(`visioconference_links[${newIndexVisio}][platform]`, "Google Meet");
          formData.append(`visioconference_links[${newIndexVisio}][value]`, data?.user?.google_full_name);

          formData.append("_method", "put");

          try {
            const response = await fetch(`${API_BASE_URL}/users/${userid}`, {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            });
            if (response?.status) {
              console.log("response", response);
              // await getMeeting(checkId); // Ensure this is awaited
              setUser(response?.data?.data);
              setCallUser((prev) => !prev);
              // Now update the toggle states
              // setToggleStates((prevState) => ({
              //   ...prevState,
              //   Visioconference: selectedToggle === "Google Meet" ? true : false,
              //   agenda: selectedToggle === "Google Agenda" ? true : false,
              // }));

              // setGoogleLoginCalled(true);
            }
          } catch (error) {
            console.log("error in save profile Data");
          }


        }
      })
      .catch((error) => {
        console.log("API Error:", error);
        toast.error("Google Authentication Failed, Retry Again");
      });
  };



  // Fetch Zoom User Info after authentication
  const fetchZoomProfile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-user-zoom-info/${userid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`, // If authentication is required
          },
        }
      );
      if (response?.status === 200) {
        const data = response.data?.data;
        console.log("data->", data);

        setZoomFullName(data?.user?.zoom_display_name);
        setVisioZoom(data?.user?.zoom_display_name);
        setEmailZoom(data?.user?.zoom_emial_name);
        setIsLoggedIn(true);

        CookieService.set("is_logged_in", "true");
        sessionStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        sessionStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );
        localStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        localStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );

        const expiresIn = data?.token?.zoom_token_expires_at;
        const expirationTime = Date.now() + expiresIn * 1000;
        CookieService.set("zoom_token_expiration_time", expirationTime);

      } else {
        console.log("Not logged in");
      }
      // Set the state to store the user info
      // setZoomUserInfo(data);
    } catch (error) {
      console.error("Error fetching Zoom user info:", error);
      toast.error("Zoom Authentication Failed, Retry Again");
    }
  };
  const zoomLogin = () => {
    console.log("Opening Zoom popup...");

    const popupWidth = 600;
    const popupHeight = 600;
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2;

    const popup = window.open(
      `https://phplaravel-1350509-4993140.cloudwaysapps.com/api/auth/zoom?user_id=${userid}`,
      "zoomAuthPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      console.error("Popup blocked! Allow popups for this site.");
      return;
    }

    // Listen for success message from the popup
    const messageListener = (event) => {
      if (event.data?.success) {
        console.log("Zoom authentication successful, closing popup...");
        if (popup) popup.close();
        window.removeEventListener("message", messageListener);

        // Fetch user data after login
        fetchZoomProfile();
      }
    };

    window.addEventListener("message", messageListener);

    // Fallback: Check if the popup is closed manually
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        console.log("Popup closed, fetching user data...");
        window.removeEventListener("message", messageListener);
        fetchZoomProfile();
      }
    }, 1000);
  };



  const onLoginAndProfileSuccess = async (response) => {
    if (!response?.code) {
      console.error("No authorization code received from Google response.");
      return;
    }

    const { code } = response;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/google`,
        {
          code,
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      const data = res.data?.data;

      if (data) {
        setGoogleFullName(data.user.google_full_name);
        setVisioGoogleMeet(data.user.google_full_name);
        setEmailGmail(data.user.google_account);
        setIsLoggedIn(true);
        setLoading(false);

        // Save tokens and session data
        CookieService.set("is_logged_in", "true");
        CookieService.set("access_token", data?.token.access_token);
        CookieService.set("refresh_token", data?.token.refresh_token);
        sessionStorage.setItem("access_token", data?.token.access_token);
        sessionStorage.setItem("refresh_token", data?.token.refresh_token);

        const expiresIn = data.token.expires_in;
        const expirationTime = Date.now() + expiresIn * 1000;
        CookieService.set("token_expiration_time", expirationTime);
        sessionStorage.setItem("token_expiration_time", expirationTime);

        // Prepare FormData
        const formData = new FormData();

        // Add meeting fields
        formData.append("_method", "put"); // Specify the method override
        formData.append("title", meeting?.user?.title || "");
        formData.append("name", meeting?.user?.name || "");
        formData.append("last_name", meeting?.user?.last_name || "");
        formData.append("email", meeting?.user?.email || "");
        formData.append("phoneNumber", meeting?.user?.phoneNumber || "");
        formData.append("enterprise_id", meeting?.user?.enterprise_id || "");
        formData.append("bio", meeting?.user?.bio || "");
        formData.append("post", meeting?.user?.post || "");
        formData.append("role_id", meeting?.user?.role_id || "");

        meeting?.user?.social_links?.forEach((link, index) => {
          if (link.id) {
            // Existing link (include ID)
            formData.append(`social_links[${index}][id]`, link.id);
          }
          formData.append(`social_links[${index}][platform]`, link.platform);
          formData.append(`social_links[${index}][link]`, link.link);
        });

        meeting?.user?.websites?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`websites[${index}][id]`, site.id);
          }
          formData.append(`websites[${index}][title]`, site.title);
          formData.append(`websites[${index}][link]`, site.link);
        });

        meeting?.user?.affiliation_links?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`affiliation_links[${index}][id]`, site.id);
          }
          formData.append(`affiliation_links[${index}][title]`, site.title);
          formData.append(`affiliation_links[${index}][link]`, site.link);
        });

        formData.append("video", meeting?.user?.video);

        formData.append(
          "current_password",
          meeting?.user?.currentPassword || ""
        );
        formData.append("password", meeting?.user?.newPassword || "");
        formData.append(
          "password_confirmation",
          meeting?.user?.retypePassword || ""
        );

        formData.append("visibility", meeting?.user?.visibility || "public");
        meeting?.user?.teams?.forEach((team) => {
          formData.append("team_id[]", team.id);
        });

        // // Add visioconference_links
        // formData.append(`visioconference_links[0][platform]`, "Google Meet");
        // formData.append(
        //   `visioconference_links[0][value]`,
        //   data?.user?.google_full_name
        // );

        // // Add integration_links
        // formData.append(`integration_links[0][platform]`, "Google Agenda");
        // formData.append(
        //   `integration_links[0][value]`,
        //   data?.user?.google_full_name
        // );

        // // Add email_links
        // formData.append(`email_links[0][platform]`, "Gmail");
        // formData.append(`email_links[0][value]`, data?.user?.google_account);

        // Add integration_links
        const existingIntegrationLinks = meeting?.user?.integrationLinks || [];
        const newIndexIntegration = existingIntegrationLinks.length; // Get next available index

        formData.append(`integration_links[${newIndexIntegration}][platform]`, "Google Agenda");
        formData.append(`integration_links[${newIndexIntegration}][value]`, data?.user?.google_full_name);

        const existingEmailLinks = meeting?.user?.emailLinks || []; // Ensure it's an array
        const newIndex = existingEmailLinks.length; // Get the next available index

        formData.append(`email_links[${newIndex}][platform]`, "Gmail");
        formData.append(`email_links[${newIndex}][value]`, data?.user?.google_account);


        const existingVisioconferenceLinks = meeting?.user?.visioconferenceLinks || [];
        const newIndexVisio = existingVisioconferenceLinks.length; // Get the next available index

        formData.append(`visioconference_links[${newIndexVisio}][platform]`, "Google Meet");
        formData.append(`visioconference_links[${newIndexVisio}][value]`, data?.user?.google_full_name);

        formData.append("_method", "put");

        try {
          const response = await fetch(`${API_BASE_URL}/users/${userid}`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          });
          if (response?.status) {
            await getMeeting(checkId); // Ensure this is awaited
            // Now update the toggle states
            setToggleStates((prevState) => ({
              ...prevState,
              Visioconference: selectedToggle === "Google Meet" ? true : false,
              agenda: selectedToggle === "Google Agenda" ? true : false,
            }));

            setGoogleLoginCalled(true);
          }
        } catch (error) {
          console.log("error in save profile Data");
        }
        // return res.data; // Return parsed data
      } else {
        console.error("No data received in API response.");
      }
    } catch (error) {
      console.error("Error during Google Login API call:", error);
      toast.error(error?.response?.data?.message);
      // throw error;
    }
  };
  const onLoginAndProfileSuccessScheduled = async (response) => {
    if (!response?.code) {
      console.error("No authorization code received from Google response.");
      return;
    }

    const { code } = response;

    try {
      setShowProgressBar(true);
      setProgress(10);
      const res = await axios.post(
        `${API_BASE_URL}/auth/google`,
        {
          code,
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      const data = res.data?.data;

      if (data) {
        setProgress(30);
        setGoogleFullName(data.user.google_full_name);
        setVisioGoogleMeet(data.user.google_full_name);
        setEmailGmail(data.user.google_account);
        setIsLoggedIn(true);
        setLoading(false);

        // Save tokens and session data
        CookieService.set("is_logged_in", "true");
        CookieService.set("access_token", data?.token.access_token);
        CookieService.set("refresh_token", data?.token.refresh_token);
        sessionStorage.setItem("access_token", data?.token.access_token);
        sessionStorage.setItem("refresh_token", data?.token.refresh_token);

        const expiresIn = data.token.expires_in;
        const expirationTime = Date.now() + expiresIn * 1000;
        CookieService.set("token_expiration_time", expirationTime);
        sessionStorage.setItem("token_expiration_time", expirationTime);

        setProgress(50);
        // Prepare FormData
        const formData = new FormData();

        // Add meeting fields
        formData.append("_method", "put"); // Specify the method override
        formData.append("title", user?.title || "");
        formData.append("name", user?.name || "");
        formData.append("last_name", user?.last_name || "");
        formData.append("email", user?.email || "");
        formData.append("phoneNumber", user?.phoneNumber || "");
        formData.append("enterprise_id", user?.enterprise_id || "");
        formData.append("bio", user?.bio || "");
        formData.append("post", user?.post || "");
        formData.append("timezone", userTimeZone || "Europe/Paris");

        formData.append("role_id", user?.role_id || "");

        user?.social_links?.forEach((link, index) => {
          if (link.id) {
            // Existing link (include ID)
            formData.append(`social_links[${index}][id]`, link.id);
          }
          formData.append(`social_links[${index}][platform]`, link.platform);
          formData.append(`social_links[${index}][link]`, link.link);
        });

        user?.websites?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`websites[${index}][id]`, site.id);
          }
          formData.append(`websites[${index}][title]`, site.title);
          formData.append(`websites[${index}][link]`, site.link);
        });

        user?.affiliation_links?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`affiliation_links[${index}][id]`, site.id);
          }
          formData.append(`affiliation_links[${index}][title]`, site.title);
          formData.append(`affiliation_links[${index}][link]`, site.link);
        });

        formData.append("video", user?.video);

        formData.append("current_password", user?.currentPassword || "");
        formData.append("password", user?.newPassword || "");
        formData.append("password_confirmation", user?.retypePassword || "");

        formData.append("visibility", user?.visibility || "public");
        user?.teams?.forEach((team) => {
          formData.append("team_id[]", team.id);
        });

        // Add integration_links
        const existingIntegrationLinks = user?.integration_links || [];
        const newIndexIntegration = existingIntegrationLinks.length; // Get next available index

        formData.append(
          `integration_links[${newIndexIntegration}][platform]`,
          "Google Agenda"
        );
        formData.append(
          `integration_links[${newIndexIntegration}][value]`,
          data?.user?.google_full_name
        );

        const existingEmailLinks = user?.email_links || []; // Ensure it's an array
        const newIndex = existingEmailLinks.length; // Get the next available index

        formData.append(`email_links[${newIndex}][platform]`, "Gmail");
        formData.append(
          `email_links[${newIndex}][value]`,
          data?.user?.google_account
        );

        const existingVisioconferenceLinks = user?.visioconference_links || [];
        const newIndexVisio = existingVisioconferenceLinks.length; // Get the next available index

        formData.append(
          `visioconference_links[${newIndexVisio}][platform]`,
          "Google Meet"
        );
        formData.append(
          `visioconference_links[${newIndexVisio}][value]`,
          data?.user?.google_full_name
        );

        formData.append("_method", "put");

        setProgress(70);
        try {
          const response = await fetch(`${API_BASE_URL}/users/${userid}`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          });
          if (response.ok) {
            const result = await response.json();
            setProgress(90);
            console.log("response", result);
         
            setUser(result?.data?.data);
            setCallUser((prev) => !prev);

            setGoogleLoginCalled(true);
            setProgress(100);
            setTimeout(() => {
              setShowProgressBar(false);
            }, 1000);
          } else {
            setShowProgressBar(false);
          }
        } catch (error) {
          console.log("error in save profile Data");
          setShowProgressBar(false);
        }
        // return res.data; // Return parsed data
      } else {
        console.error("No data received in API response.");
        setShowProgressBar(false);
      }
    } catch (error) {
      console.error("Error during Google Login API call:", error);
      toast.error(error?.response?.data?.message);
      setShowProgressBar(false);
      // throw error;
    }
  };

  const updateMeetingPage = async () => {
    const {
      objective,
      type,
      title,
      description,
      date,
      start_time,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      note_taker,
      playback,
      time,
      teams,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      // participants,
      selected_days,
      moment_privacy,
      moment_privacy_teams,
      moment_password,
      location,
      agenda,
      address,
      room_details,
      phone,
      share_by,
      price,
      max_participants_register,
      casting_type,
      solution_id,
      solution_tab,
      open_ai_decide
    } = formState;
    setLoading(true);
    setIsCompleted(true);
    // if (
    //   value.trim() === "" ||
    //   title.trim() === "" ||
    //   date.trim() === "" ||
    //   startTime.trim() === ""
    // ) {
    //   toast.error(t("messages.emptyFields"));
    //   setLoading(false);

    //   return;
    // }
    // CREATOR
    let participantArrayWithCreatorAdded = [
      ...participants,
      {
        first_name: JSON.parse(CookieService.get("user")).name,
        last_name: JSON.parse(CookieService.get("user")).last_name,
        email: JSON.parse(CookieService.get("user")).email,
        post: JSON.parse(CookieService.get("user")).post,
        isCreator: true,
      },
    ];

    // setButtonDisabled(true);

    // Check for duplicate step names
    // const stepNames = meetingData?.steps?.map((step) => step.title);
    // const duplicateStepNames = stepNames?.filter(
    //   (stepName) =>
    //     stepNames.indexOf(stepName) !== stepNames.lastIndexOf(stepName)
    // );
    // if (duplicateStepNames.length > 0) {
    //   toast.error(t("messages.stepNames"));
    //   setButtonText("Valider");

    //   setButtonDisabled(false);
    //   setLoading(false);

    //   return;
    // }

    // if (steps?.length === 0) {
    //   // toast.error(t("messages.emptySteps"));
    //   // setButtonText("Valider");
    //   // setButtonDisabled(false);
    //   setLoading(false);
    //   return;
    // }
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
      minute
    ).padStart(2, "0")}`;

    const repetitionFields = formState.repetition
      ? {
        repetition_number: formState.repetition_number,
        repetition_frequency: formState.repetition_frequency,
        repetition_end_date: formState.repetition_end_date,
        selected_days: formState.selected_days,
      }
      : {
        repetition_number: 1,
        repetition_frequency: "Daily",
        repetition_end_date: null,
        selected_days: [],
      };

    const inputData = {
      ...meeting,
      objective,
      type,
      title,
      date,
      start_time: `${start_time}`,
      end_time: endTimeStr,
      description,
      priority,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      note_taker,
      open_ai_decide,
      casting_type: type === "Newsletter" ? "Subscription" : casting_type,
      timezone: userTimeZone,
      total_time: time,
      steps: steps,
      participants: meetingData?.participants,
      teams: teams?.map((team) => team.id) || [],
      // teams:  teams,
      repetition: repetition || false,
      ...repetitionFields,
      moment_privacy,
      // moment_privacy_teams:
      // moment_privacy === "team" ? moment_privacy_teams : [],
      moment_privacy_teams:
        moment_privacy === "team" &&
          moment_privacy_teams?.length &&
          typeof moment_privacy_teams[0] === "object"
          ? moment_privacy_teams.map((team) => team.id)
          : moment_privacy_teams || [], // Send as-is if IDs are already present
      moment_password: moment_privacy === "password" ? moment_password : null,
      location: location,
      agenda: agenda,
      address: address,
      room_details: room_details,
      phone: phone,
      share_by: share_by,
      status:
        addParticipant || changePrivacy || changeContext || changeOptions
          ? formState?.status
          : formState?.type === "Special"
            ? "closed"
            : formState?.type === "Law"
              ? "closed"
              : "active",
      update_meeting: true,
      _method: "put",
      create_agenda: true,
      price: Number(price),
      max_participants_register: Number(max_participants_register),
      solution_id: solution_id,
      solution_tab: solution_tab,
    };

    try {
      console.log("inputData meeting steps", inputData);
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        setSolution(null);
        const data = response?.data?.data;
        CookieService.set("meetingId", response.data?.data?.id);

        // setMeetingId(response.data?.data?.id);
        setMeetingData(response.data?.data);
        if (isDuplicate) {
          toast.success(t("meetingDuplicateMsg"));
        } else if (isUpdated) {
          toast.success(t("meetingUpdatedMsg"));
        } else if (changePrivacy) {
          toast.success(t("messages.privacySaved"));
        } else if (changeContext || changeOptions) {
          toast.success(t("meetingUpdatedMsg"));
        } else {
          toast.success(t("messages.activeSaved"));
        }
        setIsCompleted(false);
        if (changePrivacy || changeContext || changeOptions) {
          // await getReportMeeting(response?.data?.data?.id)
          handleCloseModal();
          getMeeting(response?.data?.data?.id);
          // setButtonDisabled(false);
          // navigate("/meeting");
          // setOpen(true);
          updateSteps([]);
          setStepsData([]);
          setLoading(false);

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
            playback: "Manual",
            autostart: false,
            prise_de_notes: "Manual",
            note_taker: false,
            objective: "",
            participants: [],
            id: null,
            repetition: false,
            repetition_number: 1,
            repetition_frequency: "Daily",
            repetition_end_date: null,
            selected_days: [],
            teams: [],
            steps: [],

            moment_privacy: "participant only",
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
            casting_type: "Invitation",
            solution_id: null,
            solution_tab: "use a template",
            open_ai_decide: false,

          });
          setMeeting(null);
          setCheckId(null);
          setIsUpdated(false);
          setIsDuplicate(false);
          setInputGroups([]);

          if (response?.data?.data?.status === "in_progress") {
            setAllMeetings([]);
            setMeetingLength(0);
            setHasMore(true);
            setOffset(0);
            await getMeetings();
          } else {
            setAllClosedMeetings([]);
            setClosedMeetingLength(0);
            setClosedHasMore(true);
            setClosedOffset(0);
            await getClosedMeetings();
          }

          return;
        }
        if (isDuplicate || isUpdated) {
          if (data?.type === "Special" || data?.type === "Law") {
            navigate(`/present/invite/${data?.id}`, {
              state: { data, from: "meeting" },
            });
          } else {
            navigate(`/invite/${data?.id}`, {
              state: { data, from: "meeting" },
            });
          }
        } else {
          if (data?.type === "Special" || data?.type === "Law") {
            navigate(`/present/invite/${data?.id}`, {
              state: { data, from: "meeting" },
            });
          } else {
            navigate(`/invite/${data?.id}`, {
              state: { data, from: "meeting" },
            });
          }
        }
        handleCloseModal();

        // setButtonDisabled(false);
        // navigate("/meeting");
        // setOpen(true);
        updateSteps([]);
        setStepsData([]);
        setLoading(false);

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
          playback: "Manual",
          autostart: false,
          prise_de_notes: "Manual",
          note_taker: false,
          objective: "",
          participants: [],
          id: null,
          repetition: false,
          repetition_number: 1,
          repetition_frequency: "Daily",
          repetition_end_date: null,
          selected_days: [],
          teams: [],
          steps: [],

          moment_privacy: "participant only",
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
          casting_type: "Invitation",
          solution_id: null,
          solution_tab: "use a template",
          open_ai_decide: false,

        });
        setMeeting(null);
        setCheckId(null);
        setIsUpdated(false);
        setIsDuplicate(false);
        setInputGroups([]);
        await getMeetings();
      }
    } catch (error) {
      setLoading(false);
      setIsCompleted(false);
      toast.error(error?.response?.data?.message);
    }
    getUserMeetingCount()

  };

  const recurrentMeetingAPI = async () => {
    if (!formState.repetition) return;
    setShowProgressBar(true); // Show progress bar
    setProgress(0); // Reset progress

    // Simulate progress incrementally
    const simulateProgress = () => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Cap progress at 95%
        return prev + 1; // Increment progress
      });
    };

    // Start a progress simulation interval
    const interval = setInterval(simulateProgress, 100); // Increment every 100ms
    try {
      const payload = {
        meeting_id: checkId,
        timezone: userTimeZone,
      };
      const response = await axios.post(
        `${API_BASE_URL}/recurring-meeting`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      clearInterval(interval);

      if (response?.status) {
        if (formState.repetition) {
          setProgress(100);
          // Hide progress bar after a short delay
          setTimeout(() => {
            setShowProgressBar(false);
          }, 500);
          toast.success(t("messages.repetitionEnabled"));
        }
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      clearInterval(interval);
      setShowProgressBar(false);
      getUserMeetingCount()

    }
  };

  const onFailure = (response) => {
    console.error("Google Login Failed:", response);
    // handleRedirectToSignup();
  };
  const onLoginFailure = (response) => {
    console.error("Google Login Failed:", response);
    // handleRedirectToSignup();
  };
  const onLoginAndProfileFailure = (response) => {
    console.error("Google Login Failed:", response);
    // handleRedirectToSignup();
  };
  const onLoginAndProfileFailureScheduled = (response) => {
    console.error("Google Login Failed:", response);
    // handleRedirectToSignup();
  };

  const loggedInUserMail = CookieService.get("email");
  const login = useGoogleLogin({
    onSuccess,
    onFailure,
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    flow: "auth-code",
    hint: loggedInUserMail,
    access_type: "offline",
    prompt: "select_account", // Ensures the user selects or creates an account
    onNonOAuthError: (response) => {
      console.error("Non-OAuth Error:", response);
      // Handle non-OAuth-related errors
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onFailure: onLoginFailure,
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    // "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    flow: "auth-code",
    hint: loggedInUserMail,
    access_type: "offline",
    prompt: "select_account", // Ensures the user selects or creates an account
    onNonOAuthError: (response) => {
      console.error("Non-OAuth Error:", response);
      // Handle non-OAuth-related errors
    },
  });




  const googleLoginAndSaveProfile = useGoogleLogin({
    onSuccess: onLoginAndProfileSuccess,
    onFailure: onLoginAndProfileFailure,
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    // "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    flow: "auth-code",
    hint: loggedInUserMail,
    access_type: "offline",
    prompt: "select_account", // Ensures the user selects or creates an account
    onNonOAuthError: (response) => {
      console.error("Non-OAuth Error:", response);
      // Handle non-OAuth-related errors
    },
  });

  //zoom
  const zoomLoginAndSaveProfile = async () => {
    console.log("Opening Zoom popup...");

    const popupWidth = 600;
    const popupHeight = 600;
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2;

    // Open popup immediately on user action
    const popup = window.open(
      `https://phplaravel-1350509-4993140.cloudwaysapps.com/api/auth/zoom?user_id=${userid}`,
      "zoomAuthPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      console.error("Popup blocked! Allow popups for this site.");
      return;
    }

    // Poll to check if popup is closed
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        console.log("Popup closed, fetching user data...");

        // Fetch user data after login
        fetchZoomUserInfo();
      }
    }, 1000);
  };

  const [zoomFullName, setZoomFullName] = useState(null);
  const [visioZoom, setVisioZoom] = useState(null);
  const [emailZoom, setEmailZoom] = useState(null);
  const [zoomLoginCalled, setZoomLoginCalled] = useState(false);

  // Fetch Zoom User Info after authentication
  const fetchZoomUserInfo = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-user-zoom-info/${userid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`, // If authentication is required
          },
        }
      );
      if (response?.status === 200) {
        const data = response.data?.data;
        console.log("data->", data);

        setZoomFullName(data?.user?.zoom_display_name);
        setVisioZoom(data?.user?.zoom_display_name);
        setEmailZoom(data?.user?.zoom_emial_name);
        setIsLoggedIn(true);

        CookieService.set("is_logged_in", "true");
        sessionStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        sessionStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );
        localStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        localStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );

        const expiresIn = data?.token?.zoom_token_expires_at;
        const expirationTime = Date.now() + expiresIn * 1000;
        CookieService.set("zoom_token_expiration_time", expirationTime);

        // Prepare FormData
        const formData = new FormData();

        // Add meeting fields
        formData.append("_method", "put"); // Specify the method

        formData.append("title", meeting?.user?.title || "");
        formData.append("name", meeting?.user?.name || "");
        formData.append("last_name", meeting?.user?.last_name || "");
        formData.append("email", meeting?.user?.email || "");
        formData.append("phoneNumber", meeting?.user?.phoneNumber || "");
        formData.append("enterprise_id", meeting?.user?.enterprise_id || "");
        formData.append("bio", meeting?.user?.bio || "");
        formData.append("post", meeting?.user?.post || "");
        formData.append("role_id", meeting?.user?.role_id || "");

        meeting?.user?.social_links?.forEach((link, index) => {
          if (link.id) {
            // Existing link (include ID)
            formData.append(`social_links[${index}][id]`, link.id);
          }
          formData.append(`social_links[${index}][platform]`, link.platform);
          formData.append(`social_links[${index}][link]`, link.link);
        });

        meeting?.user?.websites?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`websites[${index}][id]`, site.id);
          }
          formData.append(`websites[${index}][title]`, site.title);
          formData.append(`websites[${index}][link]`, site.link);
        });

        meeting?.user?.affiliation_links?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`affiliation_links[${index}][id]`, site.id);
          }
          formData.append(`affiliation_links[${index}][title]`, site.title);
          formData.append(`affiliation_links[${index}][link]`, site.link);
        });

        formData.append("video", meeting?.user?.video);

        formData.append(
          "current_password",
          meeting?.user?.currentPassword || ""
        );
        formData.append("password", meeting?.user?.newPassword || "");
        formData.append(
          "password_confirmation",
          meeting?.user?.retypePassword || ""
        );

        formData.append("visibility", meeting?.user?.visibility || "public");
        meeting?.user?.teams?.forEach((team) => {
          formData.append("team_id[]", team.id);
        });

        // Get the current length of visioconference_links
        const currentLengthVisio =
          meeting?.user?.visioconference_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(
          `visioconference_links[${currentLengthVisio}][platform]`,
          "Zoom"
        );
        formData.append(
          `visioconference_links[${currentLengthVisio}][value]`,
          data?.user?.zoom_display_name
        );

        // Get the current length of integration_links
        const currentLengthIntegration =
          meeting?.user?.integration_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(
          `integration_links[${currentLengthIntegration}][platform]`,
          "Zoom Agenda"
        );
        formData.append(
          `integration_links[${currentLengthIntegration}][value]`,
          data?.user?.zoom_display_name
        );

        // Get the current length of email_links
        const currentLengthEmail = meeting?.user?.email_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(`email_links[${currentLengthEmail}][platform]`, "Zoom");
        formData.append(
          `email_links[${currentLengthEmail}][value]`,
          data?.user?.zoom_emial_name
        );

        try {
          const response = await fetch(`${API_BASE_URL}/users/${userid}`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          });
          if (response?.status) {
            await getMeeting(checkId); // Ensure this is awaited
            // Now update the toggle states
            setToggleStates((prevState) => ({
              ...prevState,
              Visioconference: selectedToggle === "Zoom" ? true : false,
              agenda: selectedToggle === "Zoom" ? true : false,
            }));

            setZoomLoginCalled(true);
          }
        } catch (error) {
          console.log("error in save profile Data");
        }
      } else {
        console.log("Not logged in");
      }
      // Set the state to store the user info
      // setZoomUserInfo(data);
    } catch (error) {
      console.error("Error fetching Zoom user info:", error);
    }
  };
  //Scheduled Meeting
  const googleLoginAndSaveProfileScheduled = useGoogleLogin({
    onSuccess: onLoginAndProfileSuccessScheduled,
    onFailure: onLoginAndProfileFailureScheduled,
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    // "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    flow: "auth-code",
    hint: loggedInUserMail,
    access_type: "offline",
    prompt: "select_account", // Ensures the user selects or creates an account
    onNonOAuthError: (response) => {
      console.error("Non-OAuth Error:", response);
      // Handle non-OAuth-related errors
    },
  });


  //Outlook Implementation

  //   const outlookLoginAndSaveProfile = async () => {
  //     try {
  //       // Ensure MSAL is initialized
  //       if (!msalInstance.getActiveAccount()) {
  //         await msalInstance.initialize();
  //       }

  //       // Step 1: Login with Microsoft Graph scopes (for user profile)
  //       const graphScopes = ['openid', 'profile', 'email', 'offline_access', 'User.Read'];
  //       const authResult = await msalInstance.loginPopup({ scopes: graphScopes, prompt: 'select_account' });

  //       if (!authResult?.account) {
  //         throw new Error("No account found after login");
  //       }

  //       msalInstance.setActiveAccount(authResult.account);

  //       // Step 2: Fetch user info from Microsoft Graph
  //       const graphResponse = await msalInstance.acquireTokenSilent({ scopes: ['User.Read'] });
  //       const graphUserInfo = await fetch('https://graph.microsoft.com/v1.0/me', {
  //         headers: { 'Authorization': `Bearer ${graphResponse.accessToken}` }
  //       }).then(res => res.json());

  //       console.log("User Info from Microsoft Graph:", graphUserInfo);

  //       // Step 3: Get Outlook API token (separate request)
  //       const outlookScopes = [
  //         'https://outlook.office.com/Calendars.ReadWrite',
  //         'https://outlook.office.com/Mail.ReadWrite'
  //       ];

  //       // Try silent token acquisition first, fallback to popup if needed
  //       const outlookToken = await msalInstance.acquireTokenSilent({ scopes: outlookScopes })
  //         .catch(async (error) => {
  //           console.log("Silent token failed, trying popup...");
  //           return await msalInstance.acquireTokenPopup({ scopes: outlookScopes });
  //         });

  //       console.log("Outlook Token:", outlookToken);

  //       // Combine authResult with user info
  //       const enrichedAuthResult = {
  //         ...authResult,
  //         userInfo: graphUserInfo
  //       };

  //       // Call your backend with the enriched auth result
  //       await onOutlookLoginSuccess(enrichedAuthResult);

  //     } catch (error) {
  //       console.error('Outlook login error:', error);
  //       toast.error('Failed to login with Outlook');
  //     }
  //   };

  // const onOutlookLoginSuccess = async (response) => {
  //   console.log("response",response)
  //   try {
  //     const res = await axios.post(
  //       `${API_BASE_URL}/auth/outlook`,
  //       {
  //         access_token: response.accessToken,
  //         user_id: userid,
  //         outlook_user_info:response?.userInfo
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${CookieService.get('token')}`,
  //         },
  //       }
  //     );

  //     const data = res.data?.data;

  //     if (data) {
  //       // Save Outlook account info
  //       setOutlookFullName(data?.token?.outlook_user_info?.display_name);
  //       setEmailOutlook(data?.token?.outlook_user_info?.mail);
  //       setIsLoggedIn(true);
  //       setLoading(false);

  //       // Save tokens and session data
  //       CookieService.set('outlook_access_token', data?.token?.outlook_access_token);
  //       CookieService.set('outlook_refresh_token', data?.token?.outlook_refresh_token);

  //       // Prepare FormData for updating user profile
  //       const formData = new FormData();
  //       formData.append('_method', 'put');

  //       // Add existing user fields
  //       formData.append('title', meeting?.user?.title || '');
  //       formData.append('name', meeting?.user?.name || '');
  //       formData.append("last_name", meeting?.user?.last_name || "");
  //       formData.append("email", meeting?.user?.email || "");
  //       formData.append("phoneNumber", meeting?.user?.phoneNumber || "");
  //       formData.append("enterprise_id", meeting?.user?.enterprise_id || "");
  //       formData.append("bio", meeting?.user?.bio || "");
  //       formData.append("post", meeting?.user?.post || "");
  //       formData.append("role_id", meeting?.user?.role_id || "");

  //       meeting?.user?.social_links?.forEach((link, index) => {
  //         if (link.id) {
  //           // Existing link (include ID)
  //           formData.append(`social_links[${index}][id]`, link.id);
  //         }
  //         formData.append(`social_links[${index}][platform]`, link.platform);
  //         formData.append(`social_links[${index}][link]`, link.link);
  //       });

  //       meeting?.user?.websites?.forEach((site, index) => {
  //         if (site.id) {
  //           // Existing link (include ID)
  //           formData.append(`websites[${index}][id]`, site.id);
  //         }
  //         formData.append(`websites[${index}][title]`, site.title);
  //         formData.append(`websites[${index}][link]`, site.link);
  //       });

  //       meeting?.user?.affiliation_links?.forEach((site, index) => {
  //         if (site.id) {
  //           // Existing link (include ID)
  //           formData.append(`affiliation_links[${index}][id]`, site.id);
  //         }
  //         formData.append(`affiliation_links[${index}][title]`, site.title);
  //         formData.append(`affiliation_links[${index}][link]`, site.link);
  //       });

  //       formData.append("video", meeting?.user?.video);

  //       formData.append(
  //         "current_password",
  //         meeting?.user?.currentPassword || ""
  //       );
  //       formData.append("password", meeting?.user?.newPassword || "");
  //       formData.append(
  //         "password_confirmation",
  //         meeting?.user?.retypePassword || ""
  //       );

  //       formData.append("visibility", meeting?.user?.visibility || "public");
  //       meeting?.user?.teams?.forEach((team) => {
  //         formData.append("team_id[]", team.id);
  //       });


  //       // Add Outlook integration links
  //       const existingIntegrationLinks = meeting?.user?.integrationLinks || [];
  //       const newIndexIntegration = existingIntegrationLinks.length;

  //       formData.append(`integration_links[${newIndexIntegration}][platform]`, 'Outlook Agenda');
  //       formData.append(`integration_links[${newIndexIntegration}][value]`, data?.token?.outlook_user_info?.display_name);

  //       // Add email links if needed
  //       const existingEmailLinks = meeting?.user?.emailLinks || [];
  //       const newIndexEmail = existingEmailLinks.length;

  //       formData.append(`email_links[${newIndexEmail}][platform]`, 'Outlook');
  //       formData.append(`email_links[${newIndexEmail}][value]`, data?.token?.outlook_user_info?.mail);


  //       // Add visioconference links if needed

  //       const existingVisioconferenceLinks = meeting?.user?.visioconferenceLinks || [];
  //       const newIndexVisio = existingVisioconferenceLinks.length; // Get the next available index

  //       formData.append(`visioconference_links[${newIndexVisio}][platform]`, "Microsoft Teams");
  //       formData.append(`visioconference_links[${newIndexVisio}][value]`, data?.token?.outlook_user_info?.display_name);

  //       formData.append("_method", "put");

  //       try {

  //         // Update user profile
  //         await fetch(`${API_BASE_URL}/users/${userid}`, {
  //           method: 'POST',
  //           body: formData,
  //           headers: {
  //             Authorization: `Bearer ${CookieService.get('token')}`,
  //           },
  //         });

  //         if (response?.status) {

  //         // Refresh meeting data
  //         await getMeeting(checkId);

  //         // Update toggle states
  //         setToggleStates((prevState) => ({
  //           ...prevState,
  //           Visioconference: selectedToggle === "Microsoft Teams" ? true : false,
  //           agenda: selectedToggle === "Outlook" ? true : false,
  //         }));

  //         setOutlookLoginCalled(true);
  //       }
  //       } catch (error) {
  //         console.log("error in save profile Data");

  //       }
  //     }
  //   } catch (error) {
  //     console.error('Outlook login API error:', error);
  //     toast.error(error?.response?.data?.message || 'Outlook login failed');
  //   }
  // };

  // PKCE utilities
  const generateCodeVerifier = () => {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join('');
  };

  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  };

  // Configuration
  const CLIENT_ID = 'e5a1a99f-9e33-4e5d-a7a9-1e2b1d9c36fa';
  const REDIRECT_URI = 'http://localhost:3000/meeting';
  const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  const SCOPES = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Mail.ReadWrite',
    'https://graph.microsoft.com/Calendars.ReadWrite',
    'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
  ];

  const outlookLoginAndSaveProfile = () => {
    // Open a centered popup
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    // Open the popup window
    const popup = window.open(
      `https://tektime.ilt-itsolution.com/outlook-login?user_id=${CookieService.get('user_id')}`,
      'Outlook Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Add message listener for the popup callback
    const messageHandler = async (event) => {
      console.log('Received message event:', event);
      console.log('Event origin:', event.origin);
      console.log('Event data:', event.data);

      // Validate the origin to ensure it’s from the expected domain
      if (event.origin !== 'https://tektime.ilt-itsolution.com') {
        console.warn('Invalid origin:', event.origin);
        return;
      }

      // Check if this is the response we're waiting for
      if (event.data && event.data.type === 'outlook-login-success') {
        console.log('Outlook login success message received:', event.data);

        // Remove the event listener after receiving the message
        window.removeEventListener('message', messageHandler);

        try {
          // Call the success handler
          await onOutlookLoginSuccess();
        } catch (error) {
          console.error('Error in onOutlookLoginSuccess:', error);
          toast.error('Failed to process Outlook login');
          setLoading(false);
        }
      } else {
        console.warn('Unexpected message data:', event.data);
      }
    };

    window.addEventListener('message', messageHandler);

    // Monitor popup closing
    const interval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(interval);
        window.removeEventListener('message', messageHandler);
        console.log('Popup closed');
      }
    }, 500);

    return Promise.resolve();
  };


  // Handle successful login and send auth code to backend
  const onOutlookLoginSuccess = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/users/${CookieService.get('user_id')}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CookieService.get('token')}`, // Match your original code
          },
        }
      );

      const data = res.data?.data;

      if (data) {
        // Save Outlook account info
        setOutlookFullName(data?.outlook_user_info?.displayName);
        setEmailOutlook(data?.outlook_user_info?.mail);
        setIsLoggedIn(true);
        setLoading(false);

        // Save tokens returned by backend
        CookieService.set('outlook_access_token', data?.outlook_access_token);
        CookieService.set('outlook_refresh_token', data?.outlook_refresh_token);
        sessionStorage.setItem('outlook_access_token', data?.outlook_access_token);
        sessionStorage.setItem('outlook_refresh_token', data?.outlook_refresh_token);

        // Prepare FormData for updating user profile
        const formData = new FormData();
        formData.append('_method', 'put');

        // Add existing user fields
        formData.append('title', user?.title || '');
        formData.append('name', user?.name || '');
        formData.append('last_name', user?.last_name || '');
        formData.append('email', user?.email || '');
        formData.append('phoneNumber', user?.phoneNumber || '');
        formData.append('enterprise_id', user?.enterprise_id || '');
        formData.append('bio', user?.bio || '');
        formData.append('post', user?.post || '');
        formData.append('role_id', user?.role_id || '');

        user?.social_links?.forEach((link, index) => {
          if (link.id) {
            formData.append(`social_links[${index}][id]`, link.id);
          }
          formData.append(`social_links[${index}][platform]`, link.platform);
          formData.append(`social_links[${index}][link]`, link.link);
        });

        user?.websites?.forEach((site, index) => {
          if (site.id) {
            formData.append(`websites[${index}][id]`, site.id);
          }
          formData.append(`websites[${index}][title]`, site.title);
          formData.append(`websites[${index}][link]`, site.link);
        });

        user?.affiliation_links?.forEach((site, index) => {
          if (site.id) {
            formData.append(`affiliation_links[${index}][id]`, site.id);
          }
          formData.append(`affiliation_links[${index}][title]`, site.title);
          formData.append(`affiliation_links[${index}][link]`, site.link);
        });

        formData.append('video', user?.video || '');
        formData.append('current_password', user?.currentPassword || '');
        formData.append('password', user?.newPassword || '');
        formData.append('password_confirmation', user?.retypePassword || '');
        formData.append('visibility', user?.visibility || 'public');

        user?.teams?.forEach((team) => {
          formData.append('team_id[]', team.id);
        });

        // Add Outlook integration links
        const existingIntegrationLinks = user?.integrationLinks || [];
        const newIndexIntegration = existingIntegrationLinks.length;
        formData.append(`integration_links[${newIndexIntegration}][platform]`, 'Outlook Agenda');
        formData.append(`integration_links[${newIndexIntegration}][value]`, data?.outlook_user_info?.displayName);

        // Add email links
        const existingEmailLinks = user?.emailLinks || [];
        const newIndexEmail = existingEmailLinks.length;
        formData.append(`email_links[${newIndexEmail}][platform]`, 'Outlook');
        formData.append(`email_links[${newIndexEmail}][value]`, data?.outlook_user_info?.mail);

        // Add visioconference links
        const existingVisioconferenceLinks = user?.visioconferenceLinks || [];
        const newIndexVisio = existingVisioconferenceLinks.length;
        formData.append(`visioconference_links[${newIndexVisio}][platform]`, 'Microsoft Teams');
        formData.append(`visioconference_links[${newIndexVisio}][value]`, data?.outlook_user_info?.displayName);

        // // Update user profile
        await fetch(`${API_BASE_URL}/users/${userid}`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${CookieService.get('token')}`,
          },
        });

        if (res?.status) {
          await getMeeting(checkId);
          setToggleStates((prevState) => ({
            ...prevState,
            Visioconference: selectedToggle === 'Microsoft Teams' ? true : false,
            agenda: selectedToggle === 'Outlook Agenda' ? true : false,
          }));
          setOutlookLoginCalled(true);
          setUser(res?.data?.data);
          setCallUser((prev) => !prev);
        }
      }
    } catch (error) {
      console.error('Outlook login API error:', error);
      toast.error(error?.response?.data?.message || 'Outlook login failed');
      throw error;
    }
  };

  // Redirect handler component (to be used in /meeting route)
  const handleRedirectResponse = () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const codeVerifier = CookieService.get('pkce_code_verifier');
      const userInfo = {
        display_name: '',
        mail: '',
        id: '',
      };

      onOutlookLoginSuccess({
        authCode: code,
        codeVerifier,
        userInfo,
      }).then(() => {
        // Clear query params from URL
        window.history.replaceState({}, document.title, REDIRECT_URI);
      });
    }
  };

  // const outlookLoginAndSaveProfile = async () => {
  //   try {
  //     // Initialize MSAL if not already done
  //     if (!msalInstance.getActiveAccount()) {
  //       await msalInstance.initialize();
  //     }

  //     const loginRequest = {
  //       scopes: [
  //         'openid',
  //         'profile',
  //         'email',
  //         'User.Read',
  //           'Mail.ReadWrite',
  //           'Calendars.ReadWrite',
  //           'OnlineMeetings.Read',
  //           'OnlineMeetings.ReadWrite',
  //           'IMAP.AccessAsUser.All',
  //           'POP.AccessAsUser.All',
  //         'offline_access',

  //       'https://graph.microsoft.com/Calendars.ReadWrite',
  //         'https://graph.microsoft.com/Mail.ReadWrite',
  //         'https://graph.microsoft.com/Calendars.Read',
  //         'https://graph.microsoft.com/Mail.Read',
  //         'https://graph.microsoft.com/OnlineMeetings.Read',
  //         'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
  //         'https://graph.microsoft.com/IMAP.AccessAsUser.All',
  //         'https://graph.microsoft.com/POP.AccessAsUser.All',
  //         'https://graph.microsoft.com/User.Read',

  //       ],
  //       prompt: 'select_account'
  //     };

  //     // Step 1: Get auth result from MSAL
  //     const authResult = await msalInstance.loginPopup(loginRequest);

  //     console.log('authResult',authResult)

  //     if (!authResult?.account) {
  //       throw new Error("No account found after login");
  //     }

  //     // Step 2: Get access token silently (MSAL will handle refresh token internally)
  //     const tokenResponse = await msalInstance.acquireTokenSilent({
  //       account: authResult.account,
  //       scopes: loginRequest.scopes
  //     }).catch(async (error) => {
  //       console.log("Silent token acquisition failed, trying popup...");
  //       return await msalInstance.acquireTokenPopup({
  //         account: authResult.account,
  //         scopes: loginRequest.scopes
  //       });
  //     });

  //     console.log('token Response',tokenResponse)

  //     // Step 3: Get user info
  //     const userInfo = await getUserInfo(tokenResponse.accessToken);

  //     // Step 4: Process the successful login
  //     await onOutlookLoginSuccess({
  //       tokenData: {
  //         access_token: tokenResponse.accessToken,
  //         token_type: tokenResponse.tokenType || "Bearer",
  //         expires_in: tokenResponse.expiresOn ? 
  //           Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000) : 3600,
  //         ext_expires_in: tokenResponse.extExpiresOn ? 
  //           Math.floor((tokenResponse.extExpiresOn.getTime() - Date.now()) / 1000) : 3600,
  //         scope: tokenResponse.scopes.join(" "),
  //         id_token: tokenResponse.idToken
  //       },
  //       account: authResult.account,
  //       userInfo
  //     });

  //   } catch (error) {
  //     console.error('Outlook login error:', error);
  //     toast.error('Failed to login with Outlook');
  //   }
  // };


  // // Helper function to get user info
  // async function getUserInfo(accessToken) {
  //   try {
  //     const response = await fetch('https://graph.microsoft.com/v1.0/me', {
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to get user info: ${response.statusText}`);
  //     }

  //     const userData = await response.json();

  //     return {
  //       display_name: userData.displayName,
  //       mail: userData.mail || userData.userPrincipalName,
  //       id: userData.id,
  //       preferredLanguage:userData?.preferredLanguage,
  //       mobilePhone:userData?.mobilePhone,
  //       jobTitle:userData?.jobTitle,
  //       officeLocation:userData?.officeLocation,
  //       businessPhones:userData?.businessPhones,
  //       surname:userData?.surname,
  //       givenName:userData?.givenName,
  //       userPrincipalName:userData?.userPrincipalName


  //     };
  //   } catch (error) {
  //     console.error("Error fetching user info:", error);
  //     throw error;
  //   }
  // }


  // const onOutlookLoginSuccess = async (response) => {
  //   console.log("response",response)
  //   try {
  //     const res = await axios.post(
  //       `${API_BASE_URL}/auth/outlook`,
  //       {
  //         ...response?.tokenData,
  //         user_id: userid,
  //         outlook_user_info:response?.userInfo
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${CookieService.get('token')}`,
  //         },
  //       }
  //     );

  //     const data = res.data?.data;

  //     if (data) {
  //       // Save Outlook account info
  //       setOutlookFullName(data?.token?.outlook_user_info?.display_name);
  //       setEmailOutlook(data?.token?.outlook_user_info?.mail);
  //       setIsLoggedIn(true);
  //       setLoading(false);

  //       // Save tokens and session data
  //       CookieService.set('outlook_access_token', data?.token?.outlook_access_token);
  //       CookieService.set('outlook_refresh_token', data?.token?.outlook_refresh_token);

  //       // Prepare FormData for updating user profile
  //       const formData = new FormData();
  //       formData.append('_method', 'put');

  //       // Add existing user fields
  //       formData.append('title', meeting?.user?.title || '');
  //       formData.append('name', meeting?.user?.name || '');
  //       formData.append("last_name", meeting?.user?.last_name || "");
  //       formData.append("email", meeting?.user?.email || "");
  //       formData.append("phoneNumber", meeting?.user?.phoneNumber || "");
  //       formData.append("enterprise_id", meeting?.user?.enterprise_id || "");
  //       formData.append("bio", meeting?.user?.bio || "");
  //       formData.append("post", meeting?.user?.post || "");
  //       formData.append("role_id", meeting?.user?.role_id || "");

  //       meeting?.user?.social_links?.forEach((link, index) => {
  //         if (link.id) {
  //           // Existing link (include ID)
  //           formData.append(`social_links[${index}][id]`, link.id);
  //         }
  //         formData.append(`social_links[${index}][platform]`, link.platform);
  //         formData.append(`social_links[${index}][link]`, link.link);
  //       });

  //       meeting?.user?.websites?.forEach((site, index) => {
  //         if (site.id) {
  //           // Existing link (include ID)
  //           formData.append(`websites[${index}][id]`, site.id);
  //         }
  //         formData.append(`websites[${index}][title]`, site.title);
  //         formData.append(`websites[${index}][link]`, site.link);
  //       });

  //       meeting?.user?.affiliation_links?.forEach((site, index) => {
  //         if (site.id) {
  //           // Existing link (include ID)
  //           formData.append(`affiliation_links[${index}][id]`, site.id);
  //         }
  //         formData.append(`affiliation_links[${index}][title]`, site.title);
  //         formData.append(`affiliation_links[${index}][link]`, site.link);
  //       });

  //       formData.append("video", meeting?.user?.video);

  //       formData.append(
  //         "current_password",
  //         meeting?.user?.currentPassword || ""
  //       );
  //       formData.append("password", meeting?.user?.newPassword || "");
  //       formData.append(
  //         "password_confirmation",
  //         meeting?.user?.retypePassword || ""
  //       );

  //       formData.append("visibility", meeting?.user?.visibility || "public");
  //       meeting?.user?.teams?.forEach((team) => {
  //         formData.append("team_id[]", team.id);
  //       });


  //       // Add Outlook integration links
  //       const existingIntegrationLinks = meeting?.user?.integrationLinks || [];
  //       const newIndexIntegration = existingIntegrationLinks.length;

  //       formData.append(`integration_links[${newIndexIntegration}][platform]`, 'Outlook Agenda');
  //       formData.append(`integration_links[${newIndexIntegration}][value]`, data?.token?.outlook_user_info?.display_name);

  //       // Add email links if needed
  //       const existingEmailLinks = meeting?.user?.emailLinks || [];
  //       const newIndexEmail = existingEmailLinks.length;

  //       formData.append(`email_links[${newIndexEmail}][platform]`, 'Outlook');
  //       formData.append(`email_links[${newIndexEmail}][value]`, data?.token?.outlook_user_info?.mail);


  //       // Add visioconference links if needed

  //       const existingVisioconferenceLinks = meeting?.user?.visioconferenceLinks || [];
  //       const newIndexVisio = existingVisioconferenceLinks.length; // Get the next available index

  //       formData.append(`visioconference_links[${newIndexVisio}][platform]`, "Microsoft Teams");
  //       formData.append(`visioconference_links[${newIndexVisio}][value]`, data?.token?.outlook_user_info?.display_name);

  //       formData.append("_method", "put");

  //       try {

  //         // Update user profile
  //         await fetch(`${API_BASE_URL}/users/${userid}`, {
  //           method: 'POST',
  //           body: formData,
  //           headers: {
  //             Authorization: `Bearer ${CookieService.get('token')}`,
  //           },
  //         });

  //         if (response?.status) {

  //         // Refresh meeting data
  //         await getMeeting(checkId);

  //         // Update toggle states
  //         setToggleStates((prevState) => ({
  //           ...prevState,
  //           Visioconference: selectedToggle === "Microsoft Teams" ? true : false,
  //           agenda: selectedToggle === "Outlook Agenda" ? true : false,
  //         }));

  //         setOutlookLoginCalled(true);
  //       }
  //       } catch (error) {
  //         console.log("error in save profile Data");

  //       }
  //     }
  //   } catch (error) {
  //     console.error('Outlook login API error:', error);
  //     toast.error(error?.response?.data?.message || 'Outlook login failed');
  //   }
  // };



  //   //For Profile Part
  //   const outlookLogin = async () => {
  //     try {
  //       // Initialize MSAL if not already done
  //       if (!msalInstance.getActiveAccount()) {
  //         await msalInstance.initialize();
  //       }

  //       const loginRequest = {
  //         scopes: [
  //           'openid',
  //           'profile',
  //           'email',
  //           'User.Read',
  //           'Mail.ReadWrite',
  //           'Calendars.ReadWrite',
  //           'OnlineMeetings.ReadWrite',
  //           'offline_access',
  //         ],
  //         prompt: 'select_account'
  //       };

  //       // Step 1: Get auth result from MSAL
  //       const authResult = await msalInstance.loginPopup(loginRequest);

  //       if (!authResult?.account) {
  //         throw new Error("No account found after login");
  //       }

  //       // Step 2: Get access token silently (MSAL will handle refresh token internally)
  //       const tokenResponse = await msalInstance.acquireTokenSilent({
  //         account: authResult.account,
  //         scopes: loginRequest.scopes
  //       }).catch(async (error) => {
  //         console.log("Silent token acquisition failed, trying popup...");
  //         return await msalInstance.acquireTokenPopup({
  //           account: authResult.account,
  //           scopes: loginRequest.scopes
  //         });
  //       });

  //       // Step 3: Get user info
  //       const userInfo = await getUserInfo(tokenResponse.accessToken);

  //       // Step 4: Process the successful login
  //       await onOutlookLoginProfile({
  //         tokenData: {
  //           access_token: tokenResponse.accessToken,
  //           token_type: tokenResponse.tokenType || "Bearer",
  //           expires_in: tokenResponse.expiresOn ? 
  //             Math.floor((tokenResponse.expiresOn.getTime() - Date.now()) / 1000) : 3600,
  //           ext_expires_in: tokenResponse.extExpiresOn ? 
  //             Math.floor((tokenResponse.extExpiresOn.getTime() - Date.now()) / 1000) : 3600,
  //           scope: tokenResponse.scopes.join(" "),
  //           id_token: tokenResponse.idToken
  //         },
  //         account: authResult.account,
  //         userInfo
  //       });

  //     } catch (error) {
  //       console.error('Outlook login error:', error);
  //       toast.error('Failed to login with Outlook');
  //     }
  //   };
  // const onOutlookLoginProfile = async (response) => {
  //   console.log("response",response)
  //   try {
  //     const res = await axios.post(
  //       `${API_BASE_URL}/auth/outlook`,
  //       {
  //         ...response?.tokenData,
  //         user_id: userid,
  //         outlook_user_info:response?.userInfo
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${CookieService.get('token')}`,
  //         },
  //       }
  //     );

  //     const data = res.data?.data;
  // console.log('data->',data)
  //     if (data) {
  //       // Save Outlook account info
  //       setOutlookFullName(data?.token?.outlook_user_info?.display_name);
  //       setEmailOutlook(data?.token?.outlook_user_info?.mail);
  //       setIsLoggedIn(true);
  //       setLoading(false);

  //       // Save tokens and session data
  //       CookieService.set("is_logged_in", "true");
  //       CookieService.set('outlook_access_token', data?.token?.outlook_access_token);
  //       CookieService.set('outlook_access_token', data?.token?.outlook_access_token);
  //       CookieService.set('outlook_refresh_token', data?.token?.outlook_refresh_token);
  //       CookieService.set('outlook_refresh_token', data?.token?.outlook_refresh_token);

  //       // const expiresIn = data?.token?;
  //       // const expirationTime = Date.now() + expiresIn * 1000;
  //       // CookieService.set("token_expiration_time", expirationTime);
  //       // CookieService.set("token_expiration_time", expirationTime);

  //       CookieService.set("is_outlook_login", JSON.stringify(true));

  //     }
  //   } catch (error) {
  //     console.error('Outlook login API error:', error);
  //     toast.error(error?.response?.data?.message || 'Outlook login failed');
  //   }
  // };
  //ScheduleMeeting
  const zoomLoginAndSaveProfileScheduled = async () => {
    console.log("Opening Zoom popup...");

    const popupWidth = 600;
    const popupHeight = 600;
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2;

    // Open popup immediately on user action
    const popup = window.open(
      `https://phplaravel-1350509-4993140.cloudwaysapps.com/api/auth/zoom?user_id=${userid}`,
      "zoomAuthPopup",
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      console.error("Popup blocked! Allow popups for this site.");
      return;
    }

    // Poll to check if popup is closed
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        console.log("Popup closed, fetching user data...");

        // Fetch user data after login
        fetchZoomUserInfoSchedule();
      }
    }, 1000);
  }
  //Schedule Meeting
  const fetchZoomUserInfoSchedule = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-user-zoom-info/${userid}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`, // If authentication is required
          },
        }
      );
      if (response?.status === 200) {
        const data = response.data?.data;
        console.log("data->", data);

        setZoomFullName(data?.user?.zoom_display_name);
        setVisioZoom(data?.user?.zoom_display_name);
        setEmailZoom(data?.user?.zoom_emial_name);
        setIsLoggedIn(true);

        CookieService.set("is_logged_in", "true");
        sessionStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        sessionStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );
        localStorage.setItem(
          "zoom_access_token",
          data?.token?.zoom_access_token
        );
        localStorage.setItem(
          "zoom_refresh_token",
          data?.token?.zoom_refresh_token
        );

        const expiresIn = data?.token?.zoom_token_expires_at;
        const expirationTime = Date.now() + expiresIn * 1000;
        CookieService.set("zoom_token_expiration_time", expirationTime);

        // Prepare FormData
        const formData = new FormData();

        // Add meeting fields
        formData.append("_method", "put"); // Specify the method

        formData.append("title", meeting?.user?.title || "");
        formData.append("name", meeting?.user?.name || "");
        formData.append("last_name", meeting?.user?.last_name || "");
        formData.append("email", meeting?.user?.email || "");
        formData.append("phoneNumber", meeting?.user?.phoneNumber || "");
        formData.append("enterprise_id", meeting?.user?.enterprise_id || "");
        formData.append("bio", meeting?.user?.bio || "");
        formData.append("post", meeting?.user?.post || "");
        formData.append("role_id", meeting?.user?.role_id || "");

        meeting?.user?.social_links?.forEach((link, index) => {
          if (link.id) {
            // Existing link (include ID)
            formData.append(`social_links[${index}][id]`, link.id);
          }
          formData.append(`social_links[${index}][platform]`, link.platform);
          formData.append(`social_links[${index}][link]`, link.link);
        });

        meeting?.user?.websites?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`websites[${index}][id]`, site.id);
          }
          formData.append(`websites[${index}][title]`, site.title);
          formData.append(`websites[${index}][link]`, site.link);
        });

        meeting?.user?.affiliation_links?.forEach((site, index) => {
          if (site.id) {
            // Existing link (include ID)
            formData.append(`affiliation_links[${index}][id]`, site.id);
          }
          formData.append(`affiliation_links[${index}][title]`, site.title);
          formData.append(`affiliation_links[${index}][link]`, site.link);
        });

        formData.append("video", meeting?.user?.video);

        formData.append(
          "current_password",
          meeting?.user?.currentPassword || ""
        );
        formData.append("password", meeting?.user?.newPassword || "");
        formData.append(
          "password_confirmation",
          meeting?.user?.retypePassword || ""
        );

        formData.append("visibility", meeting?.user?.visibility || "public");
        meeting?.user?.teams?.forEach((team) => {
          formData.append("team_id[]", team.id);
        });

        // Get the current length of visioconference_links
        const currentLengthVisio =
          meeting?.user?.visioconference_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(
          `visioconference_links[${currentLengthVisio}][platform]`,
          "Zoom"
        );
        formData.append(
          `visioconference_links[${currentLengthVisio}][value]`,
          data?.user?.zoom_display_name
        );

        // Get the current length of integration_links
        const currentLengthIntegration =
          meeting?.user?.integration_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(
          `integration_links[${currentLengthIntegration}][platform]`,
          "Zoom Agenda"
        );
        formData.append(
          `integration_links[${currentLengthIntegration}][value]`,
          data?.user?.zoom_display_name
        );

        // Get the current length of email_links
        const currentLengthEmail = meeting?.user?.email_links?.length || 0;

        // Append new Google Meet entry at the next available index
        formData.append(`email_links[${currentLengthEmail}][platform]`, "Zoom");
        formData.append(
          `email_links[${currentLengthEmail}][value]`,
          data?.user?.zoom_emial_name
        );

        try {
          const response = await fetch(`${API_BASE_URL}/users/${userid}`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          });
          if (response?.status) {
            await getMeeting(checkId); // Ensure this is awaited
            // Now update the toggle states

            setZoomLoginCalled(true);
          }
        } catch (error) {
          console.log("error in save profile Data");
        }
      } else {
        console.log("Not logged in");
      }
      // Set the state to store the user info
      // setZoomUserInfo(data);
    } catch (error) {
      console.error("Error fetching Zoom user info:", error);
    }
  };

  const validate = () => {
    // if (
    //   token === null &&
    //   (meeting?.location === "Google Meet" ||
    //     meeting?.agenda === "Google Agenda")
    // ) {
    //   login();
    // } else {
    updateMeetingPage();
    if (!changePrivacy || !changeContext || changeOptions) {
      recurrentMeetingAPI();
    }
    // }
  };
  // const validate = () => {
  //   if (token === null) {
  //     login();
  //   } else {
  //     updateMeetingPage();
  //   }
  // };
  const validateAndUpdate = () => {
    if (isUpdated || isDuplicate) {
      if (
        formState?.note_taker == true &&
        meeting?.location === "Google Meet" &&
        timeDifference !== null &&
        timeDifference < 30
      ) {
        toast.warning(t("UpmeetWarning"));
        return;
      }
    }
    // if (
    //   token === null &&
    //   (meeting?.location === "Google Meet" ||
    //     meeting?.agenda === "Google Agenda")
    // ) {
    //   login();
    // } else {
    updateMeetingPage();
    if (!changePrivacy || !changeContext || changeOptions) {
      recurrentMeetingAPI();
    }
    // }
  };

  const updateGuest = async (GuestId, payload) => {
    const inputData = {
      ...payload,
      _method: "put",
    };
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/participants/${GuestId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        setLoading(false);
        setSingleGuestData({});
      }
      return response;
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  //   const zoomLogin = async (code) => {
  //     try {
  //       const token = CookieService.get("token");
  //       const payload = {
  //         code: code,
  //         user_id: userid,
  //       };
  //       const response = await axios.post(
  //         `${API_BASE_URL}/save-zoom-token
  // `,
  //         payload,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       if (response.status === 200) {
  //         console.log("Zoom token successfully sent.");
  //       } else {
  //         console.warn("Unexpected response:", response.status, response.data);
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error while sending Zoom token:",
  //         error.response?.data || error.message
  //       );
  //     }
  //   };
  return (
    <CreateMeetingContext.Provider
      value={{
        login,
        formState,
        setFormState,
        handleInputBlur,
        checkId,
        setCheckId,
        loading,
        getMeeting,
        meeting,
        setMeeting,
        stepsData,
        validate,
        validateAndUpdate,
        deleteMeeting,
        GetSingleGuestData,
        singleGuestData,
        setSingleGuestData,
        saveDraft,
        open,
        handleShow,
        handleCloseModal,
        updateGuest,
        setIsDuplicate,
        isDuplicate,
        setIsUpdated,
        isUpdated,
        setIsCompleted,
        isCompleted,
        timeUnitsTotal,
        addParticipant,
        setAddParticipant,
        changePrivacy,
        setChangePrivacy,
        setChangeContext,
        changeContext,
        setChangeOptions,
        changeOptions,
        call,
        setCall,
        destinationId,
        setDestinationId,
        destinationUniqueId,
        setDestinationUniqueId,

        fromDestination,
        setFromDestination,
        fromDestinationName,
        setFromDestinationName,
        setCallDestination,
        callDestination,

        setTeamAdded,
        teamAdded,

        recurrentMeetingAPI,

        setSelectedTab,
        selectedTab,

        setUpdatedButton,
        updatedButton,

        quit,
        setQuit,

        googleFullName,
        setGoogleFullName,
        googleLogin,

        visioGoogleMeet,
        setVisioGoogleMeet,
        emailGmail,
        setEmailGmail,
        token,

        googleLoginAndSaveProfile,
        setGoogleLoginCalled,
        googleLoginCalled,

        zoomLoginAndSaveProfile,
        zoomLoginCalled,
        setZoomLoginCalled,
        zoomFullName,
        setZoomFullName,
        visioZoom,
        setVisioZoom,
        emailZoom,
        setEmailZoom,



        toggleStates,
        setToggleStates,

        setSelectedToggle,
        selectedToggle,

        progress,
        showProgressBar,
        setShowProgressBar,
        setProgress,

        googleLoginAndSaveProfileScheduled,

        //profile
        zoomLogin,
        getMeetingModal,
        selectedSolution,
        setSelectedSolution


        // outlookLoginAndSaveProfile,
        // outlookLoginCalled,
        // setOutlookFullName,
        // outlookFullName,
        // mailOutlook,
        // setEmailOutlook,

        // outlookLogin
      }}
    >
      {children}
    </CreateMeetingContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(CreateMeetingContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
