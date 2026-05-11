import CookieService from '../../../Utils/CookieService';
import { RxCross2 } from "react-icons/rx";
import MomentDetail from "./components/MomentDetails";
import Solution from "./components/Template";
import DateandTime from "./components/DateandTime";
import Location from "./components/Location";
import AddGuests from "./components/AddGuests";
import AddSteps from "./components/AddSteps";
import Options from "./components/Options";
import Privacy from "./components/Privacy";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Button,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import Creatable from "react-select/creatable";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import axios from "axios";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { FaBookOpen, FaBullseye, FaChalkboardTeacher } from "react-icons/fa";
import { AiOutlineAudit } from "react-icons/ai";
import { MdEventAvailable, MdOutlineSupport, MdWork } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSteps } from "../../../../context/Step";



const NewMeetingModal = ({ destination, openedFrom }) => {
  const [t] = useTranslation("global");

  const missionTypeOptions = [
    { value: "Business opportunity", label: t("destination.businessOppurtunity") },
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectRef = useRef(null);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    solutionSteps,
    steps,
    updateSteps,
    solutionType,
    solutionNote,
    solutionMessageManagement,
    solutionNoteTaker,
    solutionAlarm,
    solutionFeedback,
    solutionRemainder,
    solutionShareBy,
    solutionPlayback,
    solutionAutostart,
    // solutionAutomaticStrategy,
    solutionTitle,
    solutionId
  } = useSteps();

  const navigate = useNavigate();
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
    meeting,
    setMeeting,
    setSelectedTab,
    setFormState,
    formState,
    handleInputBlur,
    recurrentMeetingAPI,
    getMeetingModal,
    loading

  } = useFormContext();
  const [currentStep, setCurrentStep] = useState(
    openedFrom === "destination"
      ? 1
      : isUpdated || isDuplicate || openedFrom === "solution"
        ? 2
        : 1
  );
  console.log("currentStep", currentStep)
  // useEffect(() => {
  //   setIsEditMode((isUpdated || isDuplicate)&& !!formState?.id);
  // }, [isUpdated,isDuplicate, formState]);

  const handleClose = () => setShowConfirmation(false);
  const handleDelete = () => deleteMeeting(checkId);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setShowConfirmation(false);
      // Reset any other states that might cause DOM conflicts
    };
  }, []);
  useEffect(() => {
    return () => {
      // Cleanup select references
      if (selectRef.current) {
        // Any cleanup needed for react-select
      }
    };
  }, []);
  // Combine isUpdated and isDuplicate for edit mode detection
  const isEditMode = (isUpdated || isDuplicate) && !!formState?.id;
  const handleStepClick = (stepNumber) => {
    if (isEditMode) {
      if (
        openedFrom === "destination" &&
        (stepNumber === 1 || stepNumber === 2)
      )
        return;
      setCurrentStep(stepNumber);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const [isQuit, setIsQuit] = useState(false);
  const handleSaveAndQuit = async () => {
    try {
      if (!formState?.id) {
        toast.error(t("Meeting ID is missing"));
        return;
      }
      setIsQuit(true);

      const payload = {
        _method: "put",
        update_meeting: true,
        create_agenda: isUpdated ? false : true,
        timezone: userTimeZone,
        ...formState,
        // status: "draft",
      };

      // Ensure Calendly defaults are present in payload if type is Calendly
      if (meeting?.type === "Calendly" || formState?.type === "Calendly") {
        if (!payload.calendly_timezone) {
          payload.calendly_timezone = "Europe/Paris";
        }
        if (!payload.calendly_availability || payload.calendly_availability.length === 0) {
          payload.calendly_availability = [
            "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
          ].map((day, index) => ({ day, active: index < 5, start: "09:00", end: "17:00" }));
        }
      }

      const response = await axios.post(
        `${API_BASE_URL}/meetings/${formState.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status) {
        const updatedMeeting = response.data?.data;
        // setFormState((prev) => ({ ...prev, ...updatedMeeting }));
        // setMeeting(updatedMeeting);
        handleCloseModal();
        navigate(`/invite/${updatedMeeting?.id}`);
        if (updatedMeeting?.repetition) {
          recurrentMeetingAPI();
        }
        toast.success(t("Meeting updated successfully"));
      }
    } catch (error) {
      console.error("Error saving meeting:", error);

      toast.error(t("Failed to save meeting"));
      toast.error(error?.response?.data?.message);
    } finally {
      setIsQuit(false);
    }
  };

  useEffect(() => {
    if (addParticipant) setCurrentStep(5);
    if (changePrivacy) setCurrentStep(8);
    if (changeContext) setCurrentStep(2);
    if (changeOptions) setCurrentStep(7);
  }, [addParticipant, changePrivacy, changeContext, changeOptions]);

  // useEffect(() => {
  //   axios
  //     .get(
  //       `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
  //         "user_id"
  //       )}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${CookieService.get("token")}`,
  //         },
  //       }
  //     )
  //     .then((res) => setUsersArray(res.data?.data))
  //     .catch((err) => console.log("error fetching users", err));
  // }, []);

  // useEffect(() => {
  //   axios
  //     .get(
  //       `${API_BASE_URL}/get-objectives-with-id/${CookieService.get(
  //         "user_id"
  //       )}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${CookieService.get("token")}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       const options = res.data?.data?.map((item) => ({
  //         value: item?.id,
  //         label: item?.name,
  //         client_id: item?.client_id,
  //         description: item?.description,
  //       }));
  //       setMissionArray(options);
  //     })
  //     .catch((err) => console.log("error fetching objectives", err));
  // }, []);

  // step 2 par call hone wali API
  // useEffect(() => {
  //   if (currentStep === 2) {
  //     axios
  //       .get(
  //         `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
  //           "user_id"
  //         )}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${CookieService.get("token")}`,
  //           },
  //         }
  //       )
  //       .then((res) => setUsersArray(res.data?.data))
  //       .catch((err) => console.log("error fetching users", err));
  //   }
  // }, [currentStep]);

  // // step 3 par call hone wali API
  // useEffect(() => {
  //   if (currentStep === 2) {
  //     axios
  //       .get(
  //         `${API_BASE_URL}/get-objectives-with-id/${CookieService.get(
  //           "user_id"
  //         )}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${CookieService.get("token")}`,
  //           },
  //         }
  //       )
  //       .then((res) => {
  //         const options = res.data?.data?.map((item) => ({
  //           value: item?.id,
  //           label: item?.name,
  //           client_id: item?.client_id,
  //           description: item?.description,
  //         }));
  //         setMissionArray(options);
  //       })
  //       .catch((err) => console.log("error fetching objectives", err));
  //   }
  // }, [currentStep]);
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isMounted && checkId) {
          await getMeetingModal(checkId);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Error fetching meeting data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [checkId]);


  const [clientOption, setClientOption] = useState(null);
  // Add a state to track the selected client's description
  const [selectedClientDescription, setSelectedClientDescription] =
    useState(null);
  const [selectedMissionDescription, setSelectedMissionDescription] =
    useState(null);

  const [missionOption, setMissionOption] = useState(null);
  const [missionTypeOption, setMissionTypeOption] = useState(null);
  const [usersArray, setUsersArray] = useState([]);
  const [missionsArray, setMissionArray] = useState([]);

  useEffect(() => {
    if (changeOptions || changePrivacy) return;

    axios
      .get(
        `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      )
      .then((res) => setUsersArray(res.data?.data))
      .catch((err) => console.log("error fetching users", err));
  }, []);

  // step 3 par call hone wali API
  useEffect(() => {
    if (changeOptions || changePrivacy) return;

    axios
      .get(
        `${API_BASE_URL}/get-objectives-with-id/${CookieService.get(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      )
      .then((res) => {
        const options = res.data?.data?.map((item) => ({
          value: item?.id,
          label: item?.name,
          client_id: item?.client_id,
          description: item?.description,
        }));
        setMissionArray(options);
      })
      .catch((err) => console.log("error fetching objectives", err));
  }, []);

  const missionOptions = useMemo(
    () =>
      missionsArray
        ?.filter((item) => item?.client_id == clientOption?.value)
        .map((item) => ({
          value: item.value,
          label: item.label,
          data: { description: item.description },
        })),
    [missionsArray, clientOption]
  );
  const clientOptions = [
    {
      label: "Mon entreprise",
      options: usersArray
        ?.filter((user) => user?.linked_to === "enterprise")
        ?.map((user) => ({
          value: user.id,
          label: user.name,
          data: {
            client_logo: user.client_logo,
            client_need_description: user.client_need_description,
          },
        })),
    },
    {
      label: "Nos clients",
      options: usersArray
        ?.filter((user) => user?.linked_to === "user")
        ?.map((user) => ({
          value: user.id,
          label: user.name,
          data: {
            client_logo: user.client_logo,
            client_need_description: user.client_need_description,
          },
        })),
    },
  ];

  // useEffect(() => {
  //   if (
  //     meeting?.destination &&
  //     usersArray.length > 0 &&
  //     missionsArray.length > 0
  //   ) {
  //     // For Absence type, we don't need to set clientOption and missionOption
  //     if (meeting?.type !== "Absence") {
  //       const foundClient = usersArray.find(
  //         (user) => user.id == meeting.destination.client_id
  //       );
  //       if (foundClient) {
  //         setClientOption({
  //           value: foundClient.id,
  //           label: foundClient.name,
  //           data: {
  //             client_logo: foundClient.client_logo,
  //             client_need_description: foundClient.client_need_description,
  //           },
  //         });
  //         setSelectedClientDescription(
  //           foundClient.client_need_description || null
  //         );
  //       }

  //       const foundMission = missionsArray.find(
  //         (mission) => mission.value == meeting.destination.id
  //       );
  //       if (foundMission) {
  //         setMissionOption(foundMission);
  //         setSelectedMissionDescription(foundMission.description || null);
  //       }

  //       if (meeting.destination.destination_type) {
  //         const missionType = missionTypeOptions.find(
  //           (type) => type.value === meeting.destination.destination_type
  //         );
  //         if (missionType) {
  //           setMissionTypeOption({
  //             value: missionType.value,
  //             label: (
  //               <div>
  //                 {getIcon(missionType.value)}
  //                 {t(missionType.label)}
  //               </div>
  //             ),
  //           });
  //         }
  //       }
  //     }
  //   }
  // }, [meeting, usersArray, missionsArray]);
  useEffect(() => {
    if (
      meeting?.destination
    ) {
      // For Absence type, we don't need to set clientOption and missionOption
      if (meeting?.type !== "Absence") {
        const foundClient = meeting.destination?.clients
        console.log('foundClient', foundClient)
        if (foundClient) {
          setClientOption({
            value: foundClient.id,
            label: foundClient.name,
            data: {
              client_logo: foundClient.client_logo,
              client_need_description: foundClient.client_need_description,
            },
          });
          setSelectedClientDescription(
            foundClient.client_need_description || null
          );
        }

        // const foundMission =  meeting.destination
        const foundMission = meeting.destination
        console.log('foundMission', foundMission)

        if (foundMission) {
          // setMissionOption(foundMission);
          setMissionOption({
            value: foundMission?.id,
            label: foundMission?.destination_name,
            client_id: foundMission?.client_id,
            description: foundMission?.destination_description

          });
          //           {
          //     "value": 938,
          //     "label": "Google Agenda / mohammadzubairkhan007@gmail.com",
          //     "client_id": 609,
          //     "description": null
          // }
          setSelectedMissionDescription(foundMission.destination_description || null);
        }

        if (meeting.destination.destination_type) {
          const missionType = missionTypeOptions.find(
            (type) => type.value === meeting.destination.destination_type
          );
          if (missionType) {
            setMissionTypeOption({
              value: missionType.value,
              label: (
                <div>
                  {getIcon(missionType.value)}
                  {t(missionType.label)}
                </div>
              ),
            });
          }
        }
      }
    }
  }, [meeting]);
  // Determine if we're in a special mode (addParticipant, changePrivacy, etc.)
  const isSpecialMode =
    addParticipant || changePrivacy || changeContext || changeOptions;

  // const shouldHideSolutionStep =
  //   Boolean(meeting?.type) && !isUpdated && !isDuplicate;
  const shouldHideSolutionStep =
    (Boolean(meeting?.type) && (isUpdated || isDuplicate)) ||
    formState?.type === "Google Agenda Event" ||
    formState?.type === "Outlook Agenda Event" ||
    openedFrom === "solution";

  const handleNextStep = async () => {
    // setIsLoading(true);
    if (isSpecialMode) {
      try {
        if (!formState?.id) {
          toast.error(t("Meeting ID is missing"));
          return;
        }
        const payload = {
          _method: "put",
          timezone: userTimeZone,
          ...formState,
          create_agenda: addParticipant ? true : false,
          update_meeting: true,
          status:
            addParticipant || changePrivacy || changeContext || changeOptions
              ? formState?.status
              : "active", // or "draft" depending on your requirement
        };

        const response = await axios.post(
          `${API_BASE_URL}/meetings/${formState.id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status) {
          const updatedMeeting = response.data?.data;
          setFormState((prev) => ({ ...prev, ...updatedMeeting }));
          setMeeting(updatedMeeting);
          handleCloseModal();
          toast.success(t("Changes saved successfully"));
        }
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error(t("Failed to save changes"));
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
      return;
    }

    const updateMeeting = async (additionalPayload = {}) => {
      if (!formState?.id) {
        toast.error(t("Meeting ID is missing"));
        return false;
      }
      setIsLoading(true);

      const payload = {
        ...formState,
        ...additionalPayload,
        // client_id: meeting?.destination?.client_id,
        // destination_id: meeting?.destination_id,
        // destination: null,
        // client: null,
        _method: "put",
        timezone: userTimeZone,
        update_meeting: formState?.agenda === "Google Agenda" || meeting?.agenda === "Google Agenda" ? true : false,
      };

      // Ensure Calendly defaults are present in payload if type is Calendly
      if (meeting?.type === "Calendly" || formState?.type === "Calendly") {
        if (!payload.calendly_timezone) {
          payload.calendly_timezone = "Europe/Paris";
        }
        if (!payload.calendly_availability || payload.calendly_availability.length === 0) {
          payload.calendly_availability = [
            "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
          ].map((day, index) => ({ day, active: index < 5, start: "09:00", end: "17:00" }));
        }
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/meetings/${formState.id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status) {
          const updatedMeeting = response.data?.data;
          setFormState((prev) => ({ ...prev, ...updatedMeeting }));
          setMeeting(updatedMeeting);
          setIsLoading(false);

          return true;
        }
      } catch (error) {
        console.error("Error updating meeting:", error);
        toast.error(t("Failed to update meeting"));
        toast.error(error?.response?.data?.message);
        setIsLoading(false);

        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const createMeeting = async (payload) => {
      setIsLoading(true);

      try {
        const fullPayload =
          openedFrom === "solution"
            ? {
              ...payload,
              solution_id: solutionId || null,
              // solution_steps: solutionSteps || [],
              solution_type: solutionType || null,
              // solution_note: solutionNote || "Manual",
              // solution_note_taker: solutionNoteTaker || false,
              // solution_alarm: solutionAlarm || false,
              // solution_open_ai_decide: solutionMessageManagement || false,
              // solution_feedback: solutionFeedback || false,
              // solution_remainder: solutionRemainder || false,
              // solution_playback: solutionPlayback || "manual",
              // solution_autostart: solutionAutostart || null,
              // solution_shareby: solutionShareBy || null,
            }
            : payload;

        // Ensure Calendly defaults are present in payload if type is Calendly
        if (fullPayload.type === "Calendly" || fullPayload.solution_type === "Calendly") {
          if (!fullPayload.calendly_timezone) {
            fullPayload.calendly_timezone = "Europe/Paris";
          }
          if (!fullPayload.calendly_availability || fullPayload.calendly_availability.length === 0) {
            fullPayload.calendly_availability = [
              "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
            ].map((day, index) => ({ day, active: index < 5, start: "09:00", end: "17:00" }));
          }
        }

        const response = await axios.post(
          `${API_BASE_URL}/meetings`,
          fullPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response.status) {
          const newMeeting = response.data?.data;
          if (newMeeting?.type === "Absence") {
            setFormState((prev) => ({
              ...prev,
              ...newMeeting,
              id: newMeeting?.id,
              client_id: newMeeting?.client_id,
              destination_id: newMeeting?.destination_id,
              timezone: userTimeZone,
            }));
            setMeeting((prev) => ({
              ...prev,
              ...newMeeting,
              id: newMeeting?.id,
              client_id: newMeeting?.client_id,
              destination_id: newMeeting?.destination_id,
              timezone: userTimeZone,
            }));
          } else {
            setFormState((prev) => ({
              ...prev,
              ...newMeeting,
              id: newMeeting?.id,
              client: null,
              client_id: newMeeting?.client_id,
              destination_id: newMeeting?.destination?.destination_id,
              destination: null,
              timezone: userTimeZone,
            }));
          }

          setCheckId(newMeeting?.id);
          setMeeting(newMeeting);
          setIsLoading(false);
          // await getMeeting(newMeeting?.id);

          return true;
        }
      } catch (error) {
        console.error("Error creating meeting:", error);
        toast.error(t("Failed to create meeting"));
        setIsLoading(false);

        return false;
      }
    };

    try {
      switch (currentStep) {
        case 2:
          // Skip validation for Absence type meetings
          if (meeting?.type !== "Absence" && !clientOption) {
            toast.error(t("Please select or create a client"));
            setIsLoading(false);
            return;
          }
          // Skip validation for Absence type meetings
          if (meeting?.type !== "Absence") {
            if (!missionOption) {
              toast.error(t("Please select or create a mission"));
              setIsLoading(false);
              return;
            }
            if (missionOption.__isNew__ && !missionTypeOption) {
              toast.error(t("Please select mission type for new mission"));
              setIsLoading(false);
              return;
            }
          }
          if (!formState.title) {
            toast.error(t("meeting.formState.title"));
            setIsLoading(false);

            return;
          }

          const meetingPayload = {
            ...formState,
            // For Absence type, use the existing values from formState
            client_id:
              meeting?.type === "Absence"
                ? meeting.client_id
                : clientOption?.__isNew__
                  ? null
                  : clientOption?.value,
            client:
              meeting?.type === "Absence"
                ? null
                : clientOption?.__isNew__
                  ? clientOption?.label
                  : null,
            destination_id:
              meeting?.type === "Absence"
                ? meeting.destination_id
                : missionOption?.__isNew__
                  ? null
                  : missionOption?.value,
            destination:
              meeting?.type === "Absence"
                ? null
                : missionOption?.__isNew__
                  ? missionOption?.label
                  : null,
            destination_type:
              meeting?.type === "Absence"
                ? meeting.destination_type
                : missionTypeOption?.value || null,
            timezone: userTimeZone,
            status: isUpdated || isDuplicate ? "active" : "draft",
          };

          const updateMeetingPayload = {
            ...formState,
            // For Absence type, use the existing values from formState
            client_id:
              meeting?.type === "Absence"
                ? meeting.client_id
                : clientOption?.__isNew__
                  ? null
                  : clientOption?.value,
            client:
              meeting?.type === "Absence"
                ? null
                : clientOption?.__isNew__
                  ? clientOption?.label
                  : null,
            destination_id:
              meeting?.type === "Absence"
                ? meeting.destination_id
                : missionOption?.__isNew__
                  ? null
                  : missionOption?.value,
            destination:
              meeting?.type === "Absence"
                ? null
                : missionOption?.__isNew__
                  ? missionOption?.label
                  : null,
            destination_type:
              meeting?.type === "Absence"
                ? meeting.destination_type
                : missionTypeOption?.value || null,
            timezone: userTimeZone,
            status: isUpdated || isDuplicate ? "active" : "draft",
          };

          if (formState?.id) {
            await updateMeeting(updateMeetingPayload);
          } else if (!isUpdated && !isDuplicate) {
            await createMeeting(meetingPayload);
          }
          break;


        case 1:
          if (!formState?.id && openedFrom === "destination") {
            if (
              !formState.type &&
              formState.solution_tab === "create from scratch"
            ) {
              toast.error(t("meeting.formState.type"));
              setIsLoading(false);

              return;
            }
            if (
              !formState.solution_id &&
              formState.solution_tab === "use a template"
            ) {
              toast.error(t("meeting.formState.type"));
              setIsLoading(false);

              return;
            }
            const payload = {
              ...formState,
              client_id: destination?.client_id || null,
              client: null,
              destination_id: destination?.id || null,
              destination: null,
              destination_type: destination?.destination_type || null,
              // status: "draft",
              status: isUpdated || isDuplicate ? "active" : "draft",
              timezone: userTimeZone,
            };
            await createMeeting(payload);
          } else {
            if (
              !formState.type &&
              formState.solution_tab === "create from scratch"
            ) {
              toast.error(t("meeting.formState.type"));
              setIsLoading(false);

              return;
            }
            if (
              !formState.solution_id &&
              formState.solution_tab === "use a template"
            ) {
              toast.error(t("meeting.formState.type"));
              setIsLoading(false);

              return;
            }

            const meetingPayload = {
              ...formState,
              timezone: userTimeZone,
              status: isUpdated || isDuplicate ? "active" : "draft",
            };

            if (formState?.id) {
              await updateMeeting();
            } else {
              await createMeeting(meetingPayload);
            }
          }
          break;

        case 3:
          const isCalendly = meeting?.type === "Calendly" || formState?.type === "Calendly";

          if (!isCalendly) {
            if (!formState.date) {
              toast.error(t("meeting.formState.date"));
              setIsLoading(false);
              return;
            }
            if (!formState.start_time) {
              toast.error(t("meeting.formState.time"));
              setIsLoading(false);
              return;
            }

            if (formState.repetition) {
              if (!formState.repetition_frequency) {
                toast.error(t("meeting.formState.repetitionFrequency"));
                setIsLoading(false);
                return;
              }

              if (!formState.repetition_number) {
                toast.error(t("meeting.formState.repetitionNumber"));
                setIsLoading(false);
                return;
              }

              if (!formState.repetition_end_date) {
                toast.error(t("meeting.formState.repetitionEndDate"));
                setIsLoading(false);
                return;
              }
            }
          }

          // Ensure defaults for Calendly are present in formState before update
          if (isCalendly && formState?.id) {
            const defaults = [
              "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
            ].map((day, index) => ({ day, active: index < 5, start: "09:00", end: "17:00" }));

            const calendly_availability = (formState.calendly_availability && formState.calendly_availability.length > 0)
              ? formState.calendly_availability
              : defaults;

            const calendly_timezone = formState.calendly_timezone || "Europe/Paris";

            await updateMeeting({
              calendly_availability,
              calendly_timezone
            });
          } else if (formState?.id) {
            await updateMeeting();
          }
          break;
        case 4:
        case 5:
        case 6:
          if (currentStep === 6 && formState.steps?.length === 0) {
            toast.error(t("messages.emptySteps"));
            setIsLoading(false);

            return;
          };
          if (formState?.id) {
            await updateMeeting();
          }
          break;
        case 7:

          if (formState?.id) {
            await updateMeeting();
          }
          break;
        case 8:
          if (formState?.id) {
            // await updateMeeting({
            //   status: "active",
            //   update_meeting: true,
            //   create_agenda: true,
            // });
            // handleCloseModal();
            const success = await updateMeeting({
              status: "active",
              update_meeting: isUpdated ? true : false,
              create_agenda: isUpdated ? false : true,
            });

            if (success) {
              handleCloseModal(); // Close the modal
              navigate(`/invite/${formState.id}`); // Navigate using the same id
              if (formState?.repetition) {
                recurrentMeetingAPI();
              }
            }
          }
          break;
        // case 9:


        // case 10:

      }
      setCurrentStep((prev) => {
        let next = prev + 1;
        // if (openedFrom === "destination" && next === 2) {
        //   next = 2;
        // }
        return next;
      });
    } catch (error) {
      console.error("Error during step progression:", error);
      toast.error(t("An error occurred while proceeding to the next step"));
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => {
      let previous = prev - 1;
      // if (shouldHideSolutionStep && previous === 3) {
      //   previous = 2;
      // }
      return previous;
    });
  };

  const renderStepContent = () => {
    if (
      // (openedFrom === "destination" &&
      //   (currentStep === 2 || currentStep === 3)) ||
      (shouldHideSolutionStep && currentStep === 1)
    ) {
      return null;
    }

    switch (currentStep) {
      // case 2:
      //   return (
      //     <div className="step-content">
      //       <div className="form-group">
      //         <label className="form-label">
      //           {t("Client")} <span className="required-asterisk">*</span>
      //         </label>
      //         <div>

      //             {meeting?.type === "Absence" ? (
      //               // Readonly Select field for Absence type
      //               <Select
      //                 className="my select destination-select-dropdown"
      //                 value={{
      //                   value: meeting?.destination?.clients?.id,
      //                   label:
      //                     meeting?.destination?.clients?.name ||
      //                     t("No client assigned"),
      //                   data: {
      //                     client_logo:
      //                       meeting?.destination?.clients?.client_logo,
      //                     client_need_description:
      //                       meeting?.destination?.clients
      //                         ?.client_need_description,
      //                   },
      //                 }}
      //                 options={
      //                   meeting?.destination?.clients
      //                     ? [
      //                         {
      //                           value: meeting.destination.clients.id,
      //                           label: meeting.destination.clients.name,
      //                           data: {
      //                             client_logo:
      //                               meeting.destination.clients.client_logo,
      //                             client_need_description:
      //                               meeting.destination.clients
      //                                 .client_need_description,
      //                           },
      //                         },
      //                       ]
      //                     : []
      //                 }
      //                 isDisabled={true}
      //                 formatOptionLabel={(option) => (
      //                   <div className="option-with-logo">
      //                     {option.data?.client_logo && (
      //                       <img
      //                         src={
      //                           option.data.client_logo.startsWith("http")
      //                             ? option.data.client_logo
      //                             : `${Assets_URL}/${option.data.client_logo}`
      //                         }
      //                         alt={option.label}
      //                         className="client-logo"
      //                       />
      //                     )}
      //                     <span>{option.label}</span>
      //                   </div>
      //                 )}
      //               />
      //             ) : (
      //               <Creatable
      //             className="my-select destination-select-dropdown"
      //                 onChange={(selected) => {
      //                   setClientOption(selected);
      //                   // Find the full client object to get description
      //                   const selectedClient = usersArray.find(
      //                     (user) => user.id === selected?.value
      //                   );
      //                   setSelectedClientDescription(
      //                     selectedClient?.client_need_description || null
      //                   );
      //                   setFormState((prev) => ({
      //                     ...prev,
      //                     client_id: selected?.__isNew__
      //                       ? null
      //                       : selected?.value,
      //                     client: selected?.__isNew__ ? selected?.label : null,
      //                   }));
      //                 }}
      //                 value={clientOption}
      //                 options={clientOptions}
      //                 isClearable
      //                 formatOptionLabel={(option) => (
      //                   <div className="option-with-logo">
      //                     {option.data?.client_logo && (
      //                       <img
      //                         src={
      //                           option.data.client_logo.startsWith("http")
      //                             ? option.data.client_logo
      //                             : `${Assets_URL}/${option.data.client_logo}`
      //                         }
      //                         alt={option.label}
      //                         className="client-logo"
      //                       />
      //                     )}
      //                     <span>{option.label}</span>
      //                   </div>
      //                 )}
      //               />
      //             )}
      //         </div>

      //         {/* Display client description if it exists */}
      //         {selectedClientDescription && (
      //           <div className="client-description mt-2">
      //             <p className="text-muted">{selectedClientDescription}</p>
      //           </div>
      //         )}
      //       </div>
      //     </div>
      //   );

      // case 3:
      // return (
      //   <div className="step-content">
      //     <div className="form-group">
      //       <label className="form-label">
      //         {t("Mission")}
      //         <span className="required-asterisk">*</span>
      //       </label>
      //       {meeting?.type === "Absence" ? (
      //         // Readonly Select field for Absence type
      //         <Select
      //           className="my-select destination-select-dropdown mb-3"
      //           value={{
      //             value: meeting?.destination?.id,
      //             label:
      //               meeting?.destination?.destination_name ||
      //               t("No mission assigned"),
      //             data: {
      //               description:
      //                 meeting?.destination?.destination_description,
      //             },
      //           }}
      //           options={
      //             meeting?.destination
      //               ? [
      //                   {
      //                     value: meeting.destination.id,
      //                     label: meeting.destination.destination_name,
      //                     data: {
      //                       description:
      //                         meeting.destination.destination_description,
      //                     },
      //                   },
      //                 ]
      //               : []
      //           }
      //           isDisabled={true}
      //         />
      //       ) : (
      //         <Creatable
      //           className="my-select destination-select-dropdown mb-3"
      //           value={missionOption}
      //           onChange={(selected) => {
      //             setMissionOption(selected);
      //             // Find the full mission object to get description
      //             const selectedMission = missionsArray.find(
      //               (mission) => mission.id === selected?.value
      //             );
      //             setSelectedMissionDescription(
      //               selectedMission?.description || null
      //             );
      //             setFormState((prev) => ({
      //               ...prev,
      //               destination_id: selected?.__isNew__
      //                 ? null
      //                 : selected?.value,
      //               destination: selected?.__isNew__ ? selected?.label : null,
      //               destination_type: selected?.__isNew__
      //                 ? prev.destination_type
      //                 : null,
      //             }));
      //           }}
      //           options={missionOptions}
      //           isClearable
      //           isSearchable
      //         />
      //       )}

      //       {/* Mission Description */}
      //       {selectedMissionDescription && (
      //         <div className="description-box mt-2">
      //           <p className="text-muted">{selectedMissionDescription}</p>
      //         </div>
      //       )}
      //       {missionOption?.__isNew__ && (
      //         <>
      //           <label className="form-label">
      //             {t("destination_type")}
      //             <span className="required-asterisk">*</span>
      //           </label>
      //           <Select
      //             className="my-select destination-select-dropdown"
      //             value={missionTypeOption}
      //             onChange={(selected) => {
      //               setMissionTypeOption(selected);
      //               setFormState((prev) => ({
      //                 ...prev,
      //                 destination_type: selected?.value,
      //               }));
      //             }}
      //             options={missionTypeOptions.map((opt) => ({
      //               ...opt,
      //               label: (
      //                 <div>
      //                   {getIcon(opt.value)}
      //                   {t(opt.label)}
      //                 </div>
      //               ),
      //             }))}
      //             isClearable
      //             isSearchable
      //           />
      //         </>
      //       )}
      //     </div>
      //   </div>
      // );

      case 1:
        return (
          <div className="px-4">
            <Solution
              meeting={meeting}
              closeModal={handleCloseModal}
              from="simple"
              loading={loading}
            />
          </div>
        );

      case 2:
        return (
          <div className="px-4">
            <MomentDetail meeting={meeting} loading={loading} openedFrom={openedFrom} closeModal={handleCloseModal} usersArray={usersArray} setClientOption={setClientOption} clientOption={clientOption} clientOptions={clientOptions} setSelectedClientDescription={setSelectedClientDescription} selectedClientDescription={selectedClientDescription} missionOption={missionOption} missionOptions={missionOptions} setMissionOption={setMissionOption} missionsArray={missionsArray} missionTypeOption={missionTypeOption} setMissionTypeOption={setMissionTypeOption} setSelectedMissionDescription={setSelectedMissionDescription} selectedMissionDescription={selectedMissionDescription} />
          </div>
        );

      case 3:
        return (
          <div className="px-4">
            <DateandTime meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      case 4:
        return (
          <div className="px-4">
            <Location meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      case 5:
        return (
          <div className="px-4">
            <AddGuests meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      case 6:
        return (
          <div className="px-4">
            <AddSteps meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      case 7:
        return (
          <div className="px-4">
            <Options meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      case 8:
        return (
          <div className="px-4">
            <Privacy meeting={meeting} loading={loading} closeModal={handleCloseModal} />
          </div>
        );

      default:
        return null;
    }
  };

  const renderProgressSteps = () => (
    <div className="progress-steps">
      {[1, 2, 3, 4, 5, 6, 7, 8]
        .filter((step) => {
          // if (openedFrom === "destination" && (step === 2 || step === 3))
          //   return false;
          if (shouldHideSolutionStep && step === 1) return false;
          return true;
        })
        .map((step) => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? "active" : ""} ${isEditMode ? "clickable-step" : ""
              }`}
            onClick={() => handleStepClick(step)}
          >
            <div
              className="step-number"
              style={{
                color:
                  (isUpdated || isDuplicate) && step > currentStep
                    ? "black"
                    : "",
              }}
            >
              {/* {step} */}
            </div>
            <div
              className="step-label"
              style={{
                color:
                  (isUpdated || isDuplicate) && step > currentStep
                    ? "black"
                    : "",
              }}
            >
              {step === 1 && t("meeting.NewMeetingTabs.tab2")}
              {/* {step === 2 && t("Client")} */}
              {/* {step === 3 && t("Mission")} */}
              {step === 2 && t("meeting.NewMeetingTabs.tab1")}
              {step === 3 && t("meeting.NewMeetingTabs.tab3")}
              {step === 4 && t("meeting.NewMeetingTabs.tab4")}
              {step === 5 && t("meeting.NewMeetingTabs.tab5")}
              {step === 6 && t("meeting.NewMeetingTabs.tab6")}
              {step === 7 && t("meeting.NewMeetingTabs.tab7")}
              {step === 8 && t("meeting.NewMeetingTabs.tab8")}
            </div>
          </div>
        ))}
    </div>
  );

  const renderFooterButtons = () => (
    <div className="modal-footer-fixed">
      {isEditMode && (
        <button
          className="btn btn-outline-secondary me-auto"
          onClick={handleSaveAndQuit}
          style={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            padding: "10px 16px",
            borderRadius: "9px",
          }}
        >
          {isQuit ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "16px",
                color: "black",
                margin: "5px 60px",
              }}
            />
          ) : (
            t("meeting.formState.Save and Quit")
          )}
        </button>
      )}

      {currentStep > (openedFrom === "destination" ? 2 : 2) && (
        <>
          {!isSpecialMode && (
            <button
              className="btn btn-outline-secondary"
              onClick={handlePreviousStep}
            >
              {t("Previous")}
            </button>
          )}
        </>
      )}

      {currentStep < 8 ? (
        <button
          className="btn"
          style={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "24px",
            color: "#FFFFFF",
            background: "#2C48AE",
            border: 0,
            padding: "10px 16px",
            borderRadius: "9px",
          }}
          onClick={handleNextStep}
        >
          {isLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "16px",
                color: "white",
                margin: "5px 60px",
              }}
            />
          ) : (
            <>
              {t("meeting.formState.Save and Continue")}
              <span className="ms-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.5489C13.3804 16.4777 13.3243 16.3929 13.2865 16.2995C13.2488 16.2061 13.2303 16.1061 13.2321 16.0054C13.2338 15.9047 13.2559 15.8054 13.2969 15.7134C13.3379 15.6214 13.397 15.5386 13.4707 15.4699L16.1907 12.7499H6.50066C6.30175 12.7499 6.11098 12.6709 5.97033 12.5302C5.82968 12.3896 5.75066 12.1988 5.75066 11.9999C5.75066 11.801 5.82968 11.6102 5.97033 11.4696C6.11098 11.3289 6.30175 11.2499 6.50066 11.2499H16.1907L13.4707 8.52991Z"
                    fill="white"
                  />
                </svg>
              </span>
            </>
          )}
        </button>
      ) : (
        <button
          className="btn"
          style={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "24px",
            color: "#FFFFFF",
            background: "#2C48AE",
            border: 0,
            padding: "10px 16px",
            borderRadius: "9px",
          }}
          onClick={handleNextStep}
        >
          {isLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "16px",
                color: "white",
                margin: "5px 60px",
              }}
            />
          ) : (
            t("Save Meeting")
          )}
        </button>
      )}
    </div>
  );

  return (
    open && (
      <>
        <style>
          {`
            .clickable-step {
              cursor: pointer;
            }
            .clickable-step:hover {
              background-color: #f8f9fa;
            }
          `}
        </style>
        <div className="quick-moment-form-2">
          <div className="modal-overlay-1">
            <div className="new-meeting-modal-1">
              <div className="modal-nav">
                <h4>
                  {isUpdated
                    ? meeting?.solution
                      ? `${t(
                        "meeting.newMeeting.update"
                      )}: ${meeting?.solution?.title?.toUpperCase()}`
                      : `Modifier ${meeting?.type}: ${meeting?.title}`
                    : isDuplicate
                      ? meeting?.solution
                        ? `${t(
                          "meeting.newMeeting.duplicate"
                        )}: ${meeting?.solution?.title?.toUpperCase()}`
                        : t("meeting.newMeeting.DuplicateMoment")
                      : addParticipant && meeting?.type !== "Newsletter"
                        ? t("meeting.newMeeting.Add new invite")
                        : addParticipant && meeting?.type === "Newsletter"
                          ? t("meeting.newMeeting.Add new subscriber")
                          : changePrivacy
                            ? t("meeting.newMeeting.ChangePrivacy")
                            : changeContext
                              ? t("dropdown.change Context")
                              : changeOptions
                                ? t("dropdown.change Options")
                                : meeting?.solution || openedFrom === "solution"
                                  ? `${t("meeting.newMeeting.create")}: ${meeting?.solution?.title?.toUpperCase() ||
                                  solutionTitle?.toUpperCase()
                                  }`
                                  : t("meeting.newMeeting.CreateMoment")}
                </h4>
                <button
                  className="cross-btn"
                  onClick={() => setShowConfirmation(true)}
                >
                  <RxCross2 size={18} />
                </button>
              </div>

              <div className="modal-body">
                {
                  addParticipant || changeOptions || changePrivacy || changeContext ? <div style={{
                    marginTop: '1rem'
                  }}></div> :
                    <div className="progress-container-1">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${((currentStep - 1) / 7) * 100}%`,
                          }}
                        ></div>
                      </div>
                      {renderProgressSteps()}
                    </div>
                }
                {renderStepContent()}
              </div>
              {renderFooterButtons()}
            </div>
          </div>

          <Modal
            show={showConfirmation}
            onHide={handleClose}
            dialogClassName="custom-modal-size custom-modal-border cancel-moment-modal modal-dialog-centered"
          >
            <Modal.Header closeButton className="border-0"></Modal.Header>
            <Modal.Body className="text-center p-4">
              <h2 className="w-100 text-center fs-5">{t("Are you sure")}</h2>
              <p className="mb-4" style={{ color: "#92929D" }}>
                {isUpdated ||
                  isDuplicate ||
                  addParticipant ||
                  changePrivacy ||
                  changeContext
                  ? ""
                  : t("saveAndDraftText")}
              </p>
              <div className="d-flex justify-content-center gap-3 mb-3">
                {isUpdated ||
                  addParticipant ||
                  changePrivacy ||
                  changeContext ||
                  changeOptions ? (
                  <Button
                    variant="outline-danger"
                    className="px-4 py-2 confirmation-delete"
                    onClick={handleCloseModal}
                  >
                    {t("Cancel")}
                  </Button>
                ) : (
                  <Button
                    variant="outline-danger"
                    className="px-4 py-2 confirmation-delete"
                    onClick={handleDelete}
                  >
                    {t("Delete")}
                  </Button>
                )}
                <Button
                  variant="primary"
                  className="px-4 py-2 confirmation-save"
                  onClick={
                    isDuplicate || isUpdated
                      ? handleSaveAndQuit
                      : addParticipant ||
                        changePrivacy ||
                        changeContext ||
                        changeOptions
                        ? handleSaveAndQuit
                        : saveDraft
                  }
                >
                  {isUpdated || isDuplicate
                    ? t("Save Meeting")
                    : addParticipant ||
                      changePrivacy ||
                      changeContext ||
                      changeOptions
                      ? t("Save Meeting")
                      : t("Save Draft")}
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </>
    )
  );
};

export default React.memo(NewMeetingModal);

