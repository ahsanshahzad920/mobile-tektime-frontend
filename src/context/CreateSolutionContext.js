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
import { useSteps } from "./Step";
import { useSolutions } from "./SolutionsContext";
import { useNavigate } from "react-router-dom";

export const CreateSolutionContext = createContext();

export const useDestinations = () => useContext(CreateSolutionContext);

export const SolutionFormProvider = ({ children }) => {
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [solution, setSolution] = useState(null);
  const [inputGroups, setInputGroups] = useState([]);
  const {
    getPublicSolutions,
    getPrivateSolutions,
    getEnterpriseSolutions,
    getDraftSolutions,
    getTeamSolutions,
  } = useSolutions();
  const {
    solutionSteps,
    updateSteps,
    updateSolutionSteps,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionNoteTaker,
    setSolutionFeedback,
    setSolutionRemainder,
    setSolutionShareBy,
    setSolutionType,
    setSolutionPlayback,
    setSolutionAutostart,
    setSolutionAutomaticStrategy,
    setSolutionMessageManagement,
    solutionMessageManagement,
    setSolutionId,
    setSolutionAutomaticInstruction,
  } = useSteps();
  const [participants, setParticipants] = useState([]);
  const [checkId, setCheckId] = useState(null);
  const [solutionData, setSolutionData] = useState({});
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

  const [timeUnitsTotal, setTimeUnitsTotal] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [addParticipant, setAddParticipant] = useState(false);
  const [changePrivacy, setChangePrivacy] = useState(false);
  const [fromDestination, setFromDestination] = useState(false);
  const [fromDestinationName, setFromDestinationName] = useState(null);
  const [callDestination, setCallDestination] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [teamAdded, setTeamAdded] = useState(false);

  const [activeTab, setActiveTab] = useState("tab1");

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    location: "",
    address: "",
    room_details: "",
    phone: "",
    agenda: "",
    type: "",
    alarm: false,
    feedback: false,
    remainder: false,
    notification: false,
    autostart: false,
    share_by: null,
    playback: "manual",
    prise_de_notes: "Manual",
    open_ai_decide: false,
    note_taker: false,
    automatic_strategy: false,
    automatic_translation: false,
    automatic_instruction: false,
    whatsapp_in: false,
    presentation: false,
    id: null,
    teams: [],
    solution_privacy: "private",
    solution_privacy_teams: [],
    solution_privacy_enterprises: [],
    solution_privacy_missions: [],
    solution_privacy_roles: [],
    solution_privacy_gates: [],
    solution_privacy_subscriptions: [],
    solution_password: null,
    date: null,
    start_time: null,
    repetition: false,
    repetition_number: 1,
    repetition_frequency: "Daily",
    repetition_end_date: null,
    selected_days: [],
    repetition: false,
    repetition_number: 1,
    repetition_frequency: "Daily",
    repetition_end_date: null,
    repetition_end_date: null,
    selected_days: [],
    max_participants_register: null,
    price: null,
    casting_type: "Invitation",
    show_participants: false,
    show_discussion: false,
    show_qr_code: false,
  });

  const handleCloseModal = () => {
    setOpen(false);
    setCall((prev) => !prev);
    setCallDestination((prev) => !prev);
    setSolution(null);
    setCheckId(null);
    setAddParticipant(false);
    setChangePrivacy(false);
    setFromDestination(false);
    setFromDestinationName(null);
    // navigate("/solution");
    setIsUpdated(false);
    setIsDuplicate(false);
    setActiveTab("tab1");
    setFormState({
      title: "",
      description: "",
      location: "",
      address: "",
      room_details: "",
      phone: "",
      agenda: "",
      logo: "",
      type: "",
      alarm: false,
      feedback: false,
      remainder: false,
      notification: false,
      autostart: false,
      share_by: null,
      playback: "manual",
      prise_de_notes: "Manual",
      open_ai_decide: false,

      note_taker: false,
      automatic_strategy: false,
      automatic_translation: false,
      automatic_instruction: false,
      whatsapp_in: false,
      presentation: false,
      id: null,
      teams: [],
      solution_privacy: "private",
      solution_privacy_teams: [],
      solution_privacy_enterprises: [],
      solution_privacy_missions: [],
      solution_privacy_roles: [],
      solution_privacy_gates: [],
      solution_privacy_subscriptions: [],
      solution_password: null,
      date: null,
      start_time: null,
      repetition: false,
      repetition_number: 1,
      repetition_frequency: "Daily",
      repetition_end_date: null,
      selected_days: [],
      max_participants_register: null,
      price: null,
      casting_type: "Invitation",
      show_participants: false,
      show_discussion: false,
      show_qr_code: false,
    });
    updateSteps([]);
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionMessageManagement(false)
    setSolutionId(null)
    setSolutionNoteTaker(false);
    setSolutionShareBy(null);
    setSolutionFeedback(false);
    setSolutionRemainder(false);
    setSolutionPlayback("manual");
    setSolutionAutostart(false);
    setSolutionAutomaticStrategy(false);
    setSolutionAutomaticInstruction(false);
    setInputGroups([]);
  };
  // Alternatively, use useEffect to log the updated state
  useEffect(() => { }, [formState]);

  const handleShow = () => {
    updateSteps([]);
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionMessageManagement(false)
    setSolutionId(null)

    setSolutionNoteTaker(false);
    setSolutionFeedback(false);
    setSolutionRemainder(false);
    setSolutionPlayback("manual");
    setSolutionAutostart(false);
    setSolutionAutomaticStrategy(false);
    setSolutionAutomaticInstruction(false);
    setSolutionShareBy(null);
    setOpen(true);
  };

  useEffect(() => { }, [solutionSteps]);
  useEffect(() => {
    const accessToken = CookieService.get("access_token");
    if (accessToken) {
      setToken(accessToken);
      setIsLoggedIn(CookieService.get("is_logged_in") === "true");
      setIsLoggedIn(true);
    }
  }, [token, open]);

  const getSolution = async (checkId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/solutions/${checkId}`, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status === 200) {
        setSolution(response?.data?.data);
        setSolutionData(response.data.data);
        setFormState({
          ...response.data.data,
          casting_type: response.data.data.casting_type || "Invitation",
        });
        setStepsData(response.data?.data);
        setLoading(false);
        const stepsData = response.data?.data?.solution_steps;
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

  const getTabPayload = (tab, state, newformstate) => {
    switch (tab) {
      case "tab1":
        return {
          title: state.title,
          logo: state.logo,
          problem_to_resolve: state.problem_to_resolve,
          solution_to_bring: state.solution_to_bring,
          how_it_fixes: state.how_it_fixes,
        };
      case "tab2":
        return {
          type: state.type,
        };
      case "tab4":
        return {
          location: state.location,
          address: state.address,
          room_details: state.room_details,
          phone: state.phone,
          agenda: state.agenda,
        };
      case "tab5":
        return {
          casting_type: state.casting_type,
          max_participants_register: state.max_participants_register,
          price: state.price,
          participants: newformstate?.participants || state.participants || [],
        };
      case "tab6":
        return {
          solution_steps: newformstate?.steps || inputGroups,
        };
      case "tab7":
        return {
          alarm: state.alarm,
          feedback: state.feedback,
          remainder: state.remainder,
          notification: state.notification,
          autostart: state.autostart,
          playback: state.playback,
          prise_de_notes: state.prise_de_notes,
          open_ai_decide: state.open_ai_decide,
          share_by: state.share_by,
          note_taker: state.note_taker,
          automatic_strategy: state.automatic_strategy,
          automatic_translation: state.automatic_translation,
          automatic_instruction: state.automatic_instruction,
          whatsapp_in: state.whatsapp_in,
          presentation: state.presentation,
          show_participants: state.show_participants,
          show_discussion: state.show_discussion,
          show_qr_code: state.show_qr_code,
        };
      case "tab8":
        return {
          solution_privacy: state.solution_privacy,
          solution_privacy_teams:
            state.solution_privacy === "team" &&
            state.solution_privacy_teams?.length &&
            typeof state.solution_privacy_teams[0] === "object"
              ? state.solution_privacy_teams.map((team) => team.id)
              : state.solution_privacy_teams || [],
          solution_privacy_enterprises:
            state.solution_privacy === "enterprise" &&
            state.solution_privacy_enterprises?.length &&
            typeof state.solution_privacy_enterprises[0] === "object"
              ? state.solution_privacy_enterprises.map((ent) => ent.id)
              : state.solution_privacy_enterprises || [],
          solution_privacy_missions:
            state.solution_privacy === "missions"
              ? state.solution_privacy_missions || []
              : [],
          solution_privacy_roles:
            state.solution_privacy === "roles"
              ? state.solution_privacy_roles || []
              : [],
          solution_privacy_gates:
            state.solution_privacy === "gates"
              ? state.solution_privacy_gates || []
              : [],
          solution_privacy_subscriptions:
            state.solution_privacy === "subscriptions"
              ? state.solution_privacy_subscriptions || []
              : [],
          solution_password:
            state.solution_privacy === "password" ? state.solution_password : null,
        };
      default:
        return {};
    }
  };

  const handleInputBlur = useCallback(
    async (newformstate, options) => {
      setLoading(true);
      const formFields = [formState.title, formState.description];
      const hasText = formFields?.some((field) => {
        if (typeof field === "string") {
          return field?.trim() !== "";
        }
        return field !== null;
      });

      if (hasText) {
        if (isDuplicate || isUpdated) {
          // If isDuplicate is true, call updateDraft immediately
          const updateResponse = await updateSolution(newformstate, options);
          return updateResponse;
        } else if (checkId === null) {
          const draftResponse = await handleDraft(newformstate, options); // Save as draft if no id exists
          return draftResponse;
        } else {
          const updateResponse = await updateDraft(newformstate, options); // Update draft if an ID exists
          return updateResponse;
        }
      }
      setLoading(false); // Hide loader
    },
    [formState, checkId, isDuplicate, isUpdated, activeTab]
  );

  const handleDraft = async (newformstate, options) => {
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

    let inputData = {};
    if (!options?.saveAll && activeTab) {
      inputData = {
        ...getTabPayload(activeTab, formState, newformstate),
        status: "draft",
      };
    } else {
      inputData = {
        type: formState.type,
        title: formState.title,
        date: formState.date,
        start_time: formState.start_time,
        repetition: formState.repetition,
        repetition_number: formState.repetition_number,
        repetition_frequency: formState.repetition_frequency,
        repetition_end_date: formState.repetition_end_date,
        selected_days: formState.selected_days,
        description: formState.description,
        problem_to_resolve: formState.problem_to_resolve,
        solution_to_bring: formState.solution_to_bring,
        how_it_fixes: formState.how_it_fixes,
        solution_steps: inputGroups,
        alarm: formState.alarm,
        feedback: formState.feedback,
        remainder: formState.remainder,
        notification: formState.notification,

        share_by: formState?.share_by,
        autostart: formState.autostart,
        total_time: formState.time,
        prise_de_notes: formState.prise_de_notes,
        open_ai_decide: formState.open_ai_decide,
        note_taker: formState.note_taker,
        playback: formState?.playback,
        automatic_strategy: formState.automatic_strategy,
        automatic_translation: formState.automatic_translation,
        automatic_instruction: formState.automatic_instruction,
        whatsapp_in: formState.whatsapp_in,
        presentation: formState.presentation,
        show_participants: formState.show_participants,
        show_discussion: formState.show_discussion,
        show_qr_code: formState.show_qr_code,
        // teams: formState.teams,
        solution_id: formState.solutionId,
        status: "draft",
        solution_privacy: formState.solution_privacy,
        solution_password:
          formState.solution_privacy === "password" ? formState.password : null,
        solution_privacy_teams: [],
        solution_privacy_enterprises:
          formState.solution_privacy === "enterprise" &&
            formState.solution_privacy_enterprises?.length &&
            typeof formState.solution_privacy_enterprises[0] === "object"
            ? formState.solution_privacy_enterprises.map((ent) => ent.id)
            : formState.solution_privacy_enterprises || [],
        solution_privacy_missions:
          formState.solution_privacy === "missions"
            ? formState.solution_privacy_missions || []
            : [],
        solution_privacy_roles:
          formState.solution_privacy === "roles"
            ? formState.solution_privacy_roles || []
            : [],
        solution_privacy_gates:
          formState.solution_privacy === "gates"
            ? formState.solution_privacy_gates || []
            : [],
        solution_privacy_subscriptions:
          formState.solution_privacy === "subscriptions"
            ? formState.solution_privacy_subscriptions || []
            : [],
        participants: newformstate?.participants || formState.participants || [],
        date: formState.date,
        start_time: formState.start_time,
        repetition: formState.repetition,
        repetition_number: formState.repetition_number,
        repetition_frequency: formState.repetition_frequency,
        repetition_end_date: formState.repetition_end_date,
        selected_days: formState.selected_days,
        max_participants_register: formState.max_participants_register,
        price: formState.price,
        casting_type: formState.casting_type,
        location: formState.location,
        address: formState.address,
        room_details: formState.room_details,
        phone: formState.phone,
        agenda: formState.agenda,
        logo: formState.logo,
      };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/solutions`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status) {
        toast.success(t("solution.solutionDraftSaved"));
        setLoading(false);
        setCheckId(response.data.data?.id);
        setSolutionData(response.data?.data);
        setInputGroups(response.data.data?.solution_steps || []);
      }
      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to save draft:", error);
      // toast.error(t("messages.draftSaveError"));
    }
  };
  const updateDraft = async (newformstate, options) => {
    const {
      type,
      title,
      description,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      open_ai_decide,
      share_by,
      note_taker,
      playback,
      time,
      teams,
      solution_privacy,
      solution_privacy_teams,
      solution_privacy_enterprises,
      solution_privacy_missions,
      solution_privacy_roles,
      solution_privacy_gates,
      solution_privacy_subscriptions,
      solution_password,
      logo,
      location,
      address,
      room_details,
      phone,
      agenda,
      participants,
      date,
      start_time,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      selected_days,
      max_participants_register,
      price,
      casting_type,
      automatic_strategy,
      automatic_translation,
      automatic_instruction,
      whatsapp_in,
      presentation,
      show_participants,
      show_discussion,
      show_qr_code,
      problem_to_resolve,
      solution_to_bring,
      how_it_fixes,
    } = formState;

    const formFields = [title];
    const hasText = formFields?.some((field) => field?.trim() !== "");
    if (!hasText) {
      toast.error("Veuillez d'abord remplir les champs ci-dessus");
      return;
    }

    let inputData = {};
    if (!options?.saveAll && activeTab) {
      inputData = {
        ...getTabPayload(activeTab, formState, newformstate),
        _method: "put",
        solution_id: checkId,
        status:
          isDuplicate || isUpdated
            ? "active"
            : addParticipant || changePrivacy
              ? formState?.status || newformstate?.status
              : "draft",
      };
    } else {
      inputData = {
        ...solutionData,
        type,
        title,
        description,
        logo,
        location,
        address,
        room_details,
        phone,
        phone,
        agenda,
        participants,
        alarm,
        feedback,
        remainder,
        notification,
        autostart,
        playback,
        prise_de_notes,
        open_ai_decide,
        automatic_strategy,
        automatic_translation,
        automatic_instruction,
        whatsapp_in,
        presentation,
        show_participants,
        show_discussion,
        show_qr_code,
        share_by,
        note_taker,
        total_time: time,
        teams: teams?.map((team) => team.id) || [],
        solution_steps: inputGroups,
        status:
          isDuplicate || isUpdated
            ? "active"
            : addParticipant || changePrivacy
              ? formState?.status || newformstate?.status
              : "draft",
        solution_privacy,
        solution_privacy_teams:
          solution_privacy === "team" &&
            solution_privacy_teams?.length &&
            typeof solution_privacy_teams[0] === "object"
            ? solution_privacy_teams.map((team) => team.id)
            : solution_privacy_teams || [], // Send as-is if IDs are already present
        solution_privacy_enterprises:
          solution_privacy === "enterprise" &&
            solution_privacy_enterprises?.length &&
            typeof solution_privacy_enterprises[0] === "object"
            ? solution_privacy_enterprises.map((ent) => ent.id)
            : solution_privacy_enterprises || [],
        solution_privacy_missions:
          solution_privacy === "missions"
            ? solution_privacy_missions || []
            : [],
        solution_privacy_roles:
          solution_privacy === "roles"
            ? solution_privacy_roles || []
            : [],
        solution_privacy_gates:
          solution_privacy === "gates"
            ? solution_privacy_gates || []
            : [],
        solution_privacy_subscriptions:
          solution_privacy === "subscriptions"
            ? solution_privacy_subscriptions || []
            : [],
        solution_password:
          solution_privacy === "password" ? solution_password : null,
        _method: "put",
        solution_id: checkId,
        add_team: teams?.length > 0 ? true : false,
        participants: newformstate?.participants || formState.participants || [],
        date,
        start_time,
        repetition,
        repetition_number,
        repetition_frequency,
        repetition_end_date,
        selected_days,
        max_participants_register,
        price,
        casting_type,
        problem_to_resolve,
        solution_to_bring,
        how_it_fixes,
      };
    }

    if (isDuplicate) {
      inputData.duplicate = true;
    }
    //
    try {
      const response = await axios.post(
        `${API_BASE_URL}/solutions/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const allSteps = response.data.data.solution_steps.sort(
          (a, b) => a.id - b.id
        );
        setInputGroups(allSteps);
        setLoading(false);
        setSolutionData({
          ...response.data.data,
          solution_steps: allSteps,
        });
      } else {
        setLoading(false);
        // toast.error("Failed to update solution.");
      }

      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to update draft:", error);
      toast.error(t("solution.draftSaveError"));
    } finally {
      setStepBtnDisabled(false);
      setLoading(false); // Hide loader after the API call is complete
    }
  };
  const updateSolution = async (newformstate, options) => {
    const {
      type,
      title,
      description,
      logo,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      share_by,
      prise_de_notes,
      open_ai_decide,
      note_taker,
      playback,
      time,
      teams,
      solution_privacy,
      solution_privacy_teams,
      solution_privacy_enterprises,
      solution_privacy_missions,
      solution_privacy_roles,
      solution_privacy_gates,
      solution_privacy_subscriptions,
      solution_password,
      location,
      address,
      room_details,
      phone,
      agenda,
      participants,
      date,
      start_time,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      selected_days,
      max_participants_register,
      price,
      casting_type,
      automatic_strategy,
      automatic_translation,
      automatic_instruction,
      whatsapp_in,
      presentation,
      show_participants,
      show_discussion,
      show_qr_code,
      problem_to_resolve,
      solution_to_bring,
      how_it_fixes,
    } = formState;

    const formFields = [title];
    const hasText = formFields?.some((field) => field?.trim() !== "");
    if (!hasText) {
      toast.error("Veuillez d'abord remplir les champs ci-dessus");
      return;
    }

    let inputData = {};
    if (!options?.saveAll && activeTab) {
      inputData = {
        ...getTabPayload(activeTab, formState, newformstate),
        _method: "put",
        solution_id: checkId,
        status: isDuplicate || isUpdated ? "active" : "draft",
      };
    } else {
      inputData = {
        ...solutionData,
        type,
        title,
        description,
        logo,
        location,
        address,
        room_details,
        phone,
        phone,
        agenda,
        participants,
        alarm,
        feedback,
        remainder,
        notification,
        autostart,
        playback,
        prise_de_notes,
        open_ai_decide,
        automatic_strategy,
        automatic_translation,
        automatic_instruction,
        presentation,
        whatsapp_in,
        show_participants,
        show_discussion,
        show_qr_code,
        share_by,
        note_taker,
        total_time: time,
        teams: teams?.map((team) => team.id) || [],
        solution_steps: newformstate?.steps || inputGroups,
        status: isDuplicate || isUpdated ? "active" : "draft",
        solution_privacy,
        solution_privacy_teams:
          solution_privacy === "team" &&
            solution_privacy_teams?.length &&
            typeof solution_privacy_teams[0] === "object"
            ? solution_privacy_teams.map((team) => team.id)
            : solution_privacy_teams || [], // Send as-is if IDs are already present
        solution_privacy_enterprises:
          solution_privacy === "enterprise" &&
            solution_privacy_enterprises?.length &&
            typeof solution_privacy_enterprises[0] === "object"
            ? solution_privacy_enterprises.map((ent) => ent.id)
            : solution_privacy_enterprises || [],
        solution_privacy_missions:
          solution_privacy === "missions"
            ? solution_privacy_missions || []
            : [],
        solution_privacy_roles:
          solution_privacy === "roles"
            ? solution_privacy_roles || []
            : [],
        solution_privacy_gates:
          solution_privacy === "gates"
            ? solution_privacy_gates || []
            : [],
        solution_privacy_subscriptions:
          solution_privacy === "subscriptions"
            ? solution_privacy_subscriptions || []
            : [],
        solution_password:
          solution_privacy === "password" ? solution_password : null,
        _method: "put",
        solution_id: checkId,
        add_team: teams?.length > 0 ? true : false,
        participants: newformstate?.participants || formState.participants || [],
        date,
        start_time,
        repetition,
        repetition_end_date,
        selected_days,
        max_participants_register,
        price,
        casting_type,
        problem_to_resolve,
        solution_to_bring,
        how_it_fixes,
      };
    }


    if (isUpdated) {
      inputData.update = true;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/solutions/${checkId}`,
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
        const allSteps = response.data.data.solution_steps.sort(
          (a, b) => a.id - b.id
        );
        setInputGroups(allSteps);
        setLoading(false);
        setSolutionData({
          ...response.data.data,
          solution_steps: allSteps,
        });
      } else {
        setLoading(false);
        // toast.error("Failed to update solution.");
      }

      return response;
    } catch (error) {
      setLoading(false);
      console.error("Failed to update draft:", error);
    } finally {
      setStepBtnDisabled(false);
      setLoading(false); // Hide loader after the API call is complete
    }
  };

  const deleteSolution = async (solutionId) => {
    if (solutionId) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/solutions/${solutionId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success(t("draftSolutionDeletedToast"));

          setFormState({
            title: "",
            description: "",
            type: "",
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "manual",
            share_by: null,
            prise_de_notes: "Manual",
            open_ai_decide: false,

             automatic_strategy: false,
             automatic_translation: false,
             automatic_instruction: false,
             whatsapp_in: false,
             presentation: false,
             note_taker: false,
            id: null,
            teams: [],
            solution_privacy: "private",
            solution_privacy_teams: [],
            solution_password: null,
            show_participants: false,
            show_discussion: false,
            show_qr_code: false,
          });
          navigate("/solution");
          setStepsData([]);
          setSolutionData(null);
          setInputGroups([]);
          setCheckId(null);
          setSolution(null);
          setAddParticipant(false);
          setChangePrivacy(false);
          setFromDestination(false);
          setFromDestinationName(null);
          handleCloseModal();
          setLoading(false);
          // if()
          // await getSolutions();
          await getPrivateSolutions();
          await getPublicSolutions();
          await getTeamSolutions();
          await getEnterpriseSolutions();
          await getDraftSolutions();
        } else {
          toast.error("Failed to delete solution.");
        }
      } catch (error) {
        toast.error(t(error.message));
      }
    } else {
      setFormState({
        title: "",
        description: "",
        type: "",
        alarm: false,
        feedback: false,
        remainder: false,
        notification: false,
        autostart: false,
        playback: "manual",
        prise_de_notes: "Manual",
        open_ai_decide: false,

        share_by: null,
        automatic_strategy: false,
        automatic_translation: false,
        automatic_instruction: false,
        whatsapp_in: false,
        presentation: false,
        note_taker: false,
        id: null,
        teams: [],
        solution_privacy: "private",
        solution_privacy_teams: [],
        solution_privacy_roles: [],
        solution_password: null,
        logo: "",
        location: "",
        address: "",
        room_details: "",
        phone: "",
        agenda: "",
        show_participants: false,
        show_discussion: false,
        show_qr_code: false,
      });
      updateSteps([]);
      updateSolutionSteps([]);
      setSolutionType(null);
      setSolutionAlarm(false);
      setSolutionNote("Manual");
      setSolutionMessageManagement(false)
      setSolutionId(null)

      setSolutionNoteTaker(false);
      setSolutionFeedback(false);
      setSolutionRemainder(false);
      setSolutionPlayback("manual");
      setSolutionAutostart(false);
      setSolutionAutomaticStrategy(false);
      setSolutionAutomaticInstruction(false);
      setSolutionShareBy(null);
      setSolution(null);
      setCheckId(null);
      handleCloseModal();
      setInputGroups([]);
      setAddParticipant(false);
      setChangePrivacy(false);

      setFromDestination(false);
      setFromDestinationName(null);
      // await getSolutions();
      await getPrivateSolutions();
      await getPublicSolutions();
      await getTeamSolutions();
      await getEnterpriseSolutions();
      await getDraftSolutions();
    }
  };
  const saveDraft = async (newformstate) => {
    if (checkId) {
      const {
        type,
        title,
        description,
        priority,
        alarm,
        feedback,
        remainder,
        notification,
        autostart,
        prise_de_notes,
        open_ai_decide,
        note_taker,
        share_by,
        playback,
        time,
        teams,
        solution_privacy,
        solution_privacy_teams,
        solution_privacy_enterprises,
        solution_privacy_missions,
        solution_privacy_roles,
        solution_privacy_gates,
        solution_privacy_subscriptions,
        solution_password,
        logo,
        location,
        address,
        room_details,
        phone,
        agenda,
        show_participants,
        show_discussion,
        show_qr_code,
      } = formState;

      const formFields = [title];
      const hasText = formFields?.some((field) => field?.trim() !== "");
      if (!hasText) {
        toast.error("Veuillez d'abord remplir les champs ci-dessus");
        return;
      }

      let inputData = {};
      if (activeTab) {
        inputData = {
          ...getTabPayload(activeTab, formState, newformstate),
          _method: "put",
          solution_id: checkId,
          status: "draft",
        };
      } else {
        inputData = {
          ...solution,
          type,
          title,
          description,
          logo,
          location,
          address,
          room_details,
          phone,
          agenda,
          priority,
          alarm,
          feedback,
          remainder,
          notification,
          autostart,
          playback,
          prise_de_notes,
          open_ai_decide,
          share_by,
          note_taker,
          total_time: time,
          teams: teams?.map((team) => team.id) || [],
          solution_steps: inputGroups,
          status: "draft",
          solution_privacy,
          solution_privacy_teams:
            solution_privacy === "team" &&
              solution_privacy_teams?.length &&
              typeof solution_privacy_teams[0] === "object"
              ? solution_privacy_teams.map((team) => team.id)
              : solution_privacy_teams || [], // Send as-is if IDs are already present
          solution_privacy_enterprises:
            solution_privacy === "enterprise" &&
              solution_privacy_enterprises?.length &&
              typeof solution_privacy_enterprises[0] === "object"
              ? solution_privacy_enterprises.map((ent) => ent.id)
              : solution_privacy_enterprises || [],
          solution_privacy_missions:
            solution_privacy === "missions"
              ? solution_privacy_missions || []
              : [],
          solution_privacy_roles:
            solution_privacy === "roles"
              ? solution_privacy_roles || []
              : [],
          solution_privacy_gates:
            solution_privacy === "gates"
              ? solution_privacy_gates || []
              : [],
          solution_privacy_subscriptions:
            solution_privacy === "subscriptions"
              ? solution_privacy_subscriptions || []
              : [],
          solution_password:
            solution_privacy === "password" ? solution_password : null,
          _method: "put",
          solution_id: checkId,
          show_participants,
          show_discussion,
          show_qr_code,
        };
      }
      //
      try {
        const response = await axios.post(
          `${API_BASE_URL}/solutions/${checkId}`,
          inputData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status === 200) {
          const allSteps = response.data.data.solution_steps.sort(
            (a, b) => a.id - b.id
          );
          setLoading(false);
          setInputGroups(allSteps);
          setSolutionData({
            ...response.data.data,
            solution_steps: allSteps,
          });

          setFormState({
            title: "",
            description: "",
            type: "",
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "manual",
            prise_de_notes: "Manual",
            open_ai_decide: false,

            note_taker: false,
            share_by: null,
             automatic_strategy: false,
             automatic_translation: false,
             automatic_instruction: false,
             whatsapp_in:false,
             presentation:false,
             id: null,
            teams: [],
            solution_privacy: "private",
            solution_privacy_teams: [],
            solution_password: null,
            show_participants: false,
            show_discussion: false,
            show_qr_code: false,
          });
          setCheckId(null);
          updateSteps([]);
          updateSolutionSteps([]);
          setSolutionType(null);
          setSolutionAlarm(false);
          setSolutionNote("Manual");
          setSolutionNoteTaker(false);
          setSolutionMessageManagement(false)
          setSolutionId(null)

          setSolutionFeedback(false);
          setSolutionRemainder(false);
          setSolutionPlayback("manual");
          setSolutionAutostart(false);
          setSolutionAutomaticStrategy(false);
          setSolutionShareBy(null);
          handleCloseModal();
          setSolution(null);
          // await getSolutions();
          await getPrivateSolutions();
          await getPublicSolutions();
          await getTeamSolutions();
          await getEnterpriseSolutions();
          await getDraftSolutions();
        } else {
          toast.error("Failed to update solution.");
        }
      } catch (error) {
        console.error("Failed to update draft:", error);
        // toast.error(t("messages.draftSaveError"));
        handleCloseModal();
      } finally {
        setStepBtnDisabled(false);
        setLoading(false); // Hide loader after the API call is complete
        updateSteps([]);
        updateSolutionSteps([]);
        setSolutionType(null);
        setSolutionAlarm(false);
        setSolutionNote("Manual");
        setSolutionNoteTaker(false);
        setSolutionMessageManagement(false)
        setSolutionId(null)

        setSolutionFeedback(false);
        setSolutionRemainder(false);
        setSolutionPlayback("manual");
        setSolutionAutostart(false);
        setSolutionAutomaticStrategy(false);

        setSolutionShareBy(null);
        setCheckId(null);
        setSolution(null);
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

      const inputData = {
        type: formState.type,
        title: formState.title,
        description: formState.description,
        solution_steps: inputGroups,
        alarm: formState.alarm,
        feedback: formState.feedback,
        remainder: formState.remainder,
        notification: formState.notification,

        share_by: formState.share_by,

        autostart: formState.autostart,
        total_time: formState.time,
        prise_de_notes: formState.prise_de_notes,
        open_ai_decide: formState.open_ai_decide,
        note_taker: formState.note_taker,
        playback: formState?.playback,
        teams: formState.teams,
        solution: formState.solutionId,
        status: "draft",
        solution_privacy: formState.solution_privacy,
        solution_password:
          formState.solution_privacy === "password" ? formState.password : null,
        solution_privacy_teams:
          formState.solution_privacy === "team" &&
            formState.solution_privacy_teams?.length &&
            typeof formState.solution_privacy_teams[0] === "object"
            ? formState.solution_privacy_teams.map((team) => team.id)
            : formState.solution_privacy_teams || [],
        solution_privacy_enterprises:
          formState.solution_privacy === "enterprise" &&
            formState.solution_privacy_enterprises?.length &&
            typeof formState.solution_privacy_enterprises[0] === "object"
            ? formState.solution_privacy_enterprises.map((ent) => ent.id)
            : formState.solution_privacy_enterprises || [],
        solution_privacy_missions:
          formState.solution_privacy === "missions"
            ? formState.solution_privacy_missions || []
            : [],
        solution_privacy_roles:
          formState.solution_privacy === "roles"
            ? formState.solution_privacy_roles || []
            : [],
        solution_privacy_gates:
          formState.solution_privacy === "gates"
            ? formState.solution_privacy_gates || []
            : [],
        solution_privacy_subscriptions:
          formState.solution_privacy === "subscriptions"
            ? formState.solution_privacy_subscriptions || []
            : [],
        show_participants: formState.show_participants,
        show_discussion: formState.show_discussion,
        show_qr_code: formState.show_qr_code,
      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/solutions`,
          inputData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status) {
          toast.success(t("messages.draftSaved"));
          setLoading(false);

          setFormState({
            type: "",
            title: "",
            description: "",
            steps: [],
            alarm: false,
            feedback: false,
            remainder: false,
            notification: false,
            autostart: false,
            playback: "manual",
            prise_de_notes: "Manual",
            open_ai_decide: false,

            share_by: null,
            automatic_strategy: false,
            automatic_translation: false,
            automatic_instruction: false,
            presentation:false,
            whatsapp_in:false,
            note_taker: false,
            time: 0,
            teams: [],
            solution_privacy: "private",
            solution_privacy_teams: [],
            solution_password: "",
            show_participants: false,
            show_discussion: false,
            show_qr_code: false,
          });
          setCheckId(null);
          updateSteps([]);
          updateSolutionSteps([]);
          setSolutionType(null);
          setSolutionAlarm(false);
          setSolutionNote("Manual");
          setSolutionNoteTaker(false);
          setSolutionMessageManagement(false)
          setSolutionId(null)

          setSolutionFeedback(false);
          setSolutionRemainder(false);
          setSolutionPlayback("manual");
          setSolutionAutostart(false);
          setSolutionAutomaticStrategy(false);
          setSolutionShareBy(null);
          setSolution(null);
          handleCloseModal();
          // await getSolutions();
          await getPrivateSolutions();
          await getPublicSolutions();
          await getTeamSolutions();
          await getEnterpriseSolutions();
          await getDraftSolutions();
        }
        return response;
      } catch (error) {
        handleCloseModal();
        setLoading(false);
        console.error("Failed to save draft:", error);
      }
    }
  };

  const updateSolutionPage = async () => {
    const {
      type,
      title,
      description,
      logo,
      location,
      address,
      room_details,
      phone,
      agenda,
      alarm,
      feedback,
      remainder,
      notification,
      autostart,
      prise_de_notes,
      open_ai_decide,
      note_taker,
      share_by,
      playback,
      teams,
      solution_privacy,
      solution_privacy_teams,
      solution_privacy_enterprises,
      solution_privacy_missions,
      solution_privacy_roles,
      solution_privacy_gates,
      solution_privacy_subscriptions,
      solution_password,
      show_participants,
      show_discussion,
      show_qr_code,
      date,
      start_time,
      repetition,
      repetition_number,
      repetition_frequency,
      repetition_end_date,
      selected_days,
      max_participants_register,
      price,
      casting_type,
      automatic_strategy,
      automatic_translation,
      automatic_instruction,
      whatsapp_in,
      presentation,
      problem_to_resolve,
      solution_to_bring,
      how_it_fixes,
    } = formState;

    // if (
    //   solutionSteps.length === 0 &&
    //   (formState.location === "Google Meet" ||
    //     formState.agenda === "Google Agenda" ||
    //     formState.agenda === "Outlook Agenda")
    // ) {
    //   toast.error(t("For the Agenda Creation At least one step is required"));
    //   return;
    // }

    setLoading(true);
    setIsCompleted(true);

    let inputData = {};
    if (activeTab) {
      inputData = {
        ...getTabPayload(activeTab, formState),
        _method: "put",
        status: "active",
      };
    } else {
      inputData = {
        ...solution,
        type,
        title,
        description,
        logo,
        location,
        address,
        room_details,
        phone,
        agenda,
        alarm,
        feedback,
        remainder,
        notification,
        autostart,
        prise_de_notes,
        open_ai_decide,
        playback,
        share_by,
        note_taker,
        solution_steps: solutionSteps,
        teams: teams?.map((team) => team.id) || [],
        // teams:  teams,
        solution_privacy,
        // moment_privacy_teams:
        // moment_privacy === "team" ? moment_privacy_teams : [],
        solution_privacy_teams:
          solution_privacy === "team" &&
            solution_privacy_teams?.length &&
            typeof solution_privacy_teams[0] === "object"
            ? solution_privacy_teams.map((team) => team.id)
            : solution_privacy_teams || [], // Send as-is if IDs are already present
        solution_privacy_enterprises:
          solution_privacy === "enterprise" &&
            solution_privacy_enterprises?.length
            ? solution_privacy_enterprises.map((ent) => (typeof ent === "object" ? ent.id : ent))
            : [],
        solution_privacy_missions:
          solution_privacy === "missions"
            ? solution_privacy_missions || []
            : [],
        solution_privacy_roles:
          solution_privacy === "roles"
            ? solution_privacy_roles || []
            : [],
        solution_privacy_gates:
          solution_privacy === "gates"
            ? solution_privacy_gates || []
            : [],
        solution_privacy_subscriptions:
          solution_privacy === "subscriptions"
            ? solution_privacy_subscriptions || []
            : [],
        solution_password:
          solution_privacy === "password" ? solution_password : null,
        status: "active",
        show_participants,
        show_discussion,
        show_qr_code,
        date,
        start_time,
        repetition,
        repetition_number,
        repetition_frequency,
        repetition_end_date,
        selected_days,
        max_participants_register,
        price,
        casting_type,
        automatic_strategy,
        automatic_translation,
        automatic_instruction,
        whatsapp_in,
        presentation,
        problem_to_resolve,
        solution_to_bring,
        how_it_fixes,
        _method: "put",
      };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/solutions/${checkId}`,
        inputData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        CookieService.set("solutionId", response.data?.data?.id);
        const data = response.data?.data;
        // setSolutionId(response.data?.data?.id);
        setSolutionData(response.data?.data);
        if (isDuplicate) {
          toast.success(t("solution.solutionDuplicateMsg"));
        } else if (isUpdated) {
          toast.success(t("solution.solutionUpdatedMsg"));
        } else {
          toast.success(t("solution.solutionSaved"));
          // Additional message when repetition is true
          if (formState.repetition) {
            toast.success(t("messages.repetitionEnabled"));
          }
        }
        setIsCompleted(false);
        // if (isDuplicate || isUpdated) {
        navigate(`/solution/${data?.id}`, { state: { data, from: "meeting" } });
        // }
        handleCloseModal();

        // setButtonDisabled(false);
        // navigate("/solution");
        // setOpen(true);
        updateSteps([]);
        updateSolutionSteps([]);
        setSolutionType(null);
        setSolutionAlarm(false);
        setSolutionNote("Manual");
        setSolutionNoteTaker(false);
        setSolutionMessageManagement(false)
        setSolutionId(null)

        setSolutionFeedback(false);
        setSolutionRemainder(false);
        setSolutionPlayback("manual");
        setSolutionAutostart(false);
        setSolutionAutomaticStrategy(false);
        setSolutionShareBy(null);
        setStepsData([]);
        setLoading(false);

        setFormState({
          title: "",
          description: "",
          type: "",
          alarm: false,
          feedback: false,
          remainder: false,
          notification: false,
          playback: "manual",
          autostart: false,
          share_by: null,
          automatic_strategy: false,
          automatic_translation: false,
          prise_de_notes: "Manual",
          open_ai_decide: false,

          note_taker: false,
          id: null,
          teams: [],
          solution_privacy: "private",
          solution_password: null,
        });
        setSolution(null);
        setCheckId(null);
        setIsUpdated(false);
        setIsDuplicate(false);
        setInputGroups([]);
        await getPrivateSolutions();
        await getPublicSolutions();
        await getTeamSolutions();
        await getEnterpriseSolutions();
        await getDraftSolutions();
      }
    } catch (error) {
      // console.log("error", error);
      setLoading(false);
      setIsCompleted(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const validate = () => {
    updateSolutionPage();
  };

  const validateAndUpdate = () => {
    updateSolutionPage();
  };

  return (
    <CreateSolutionContext.Provider
      value={{
        formState,
        setFormState,
        handleInputBlur,
        activeTab,
        setActiveTab,
        checkId,
        setCheckId,
        loading,
        getSolution,
        solution,
        setSolution,
        stepsData,
        validate,
        validateAndUpdate,
        deleteSolution,
        saveDraft,
        open,
        handleShow,
        handleCloseModal,
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
      }}
    >
      {children}
    </CreateSolutionContext.Provider>
  );
};

export const useSolutionFormContext = () => {
  const context = useContext(CreateSolutionContext);
  if (!context) {
    throw new Error(
      "useFormContext must be used within a SolutionFormProvider"
    );
  }
  return context;
};
