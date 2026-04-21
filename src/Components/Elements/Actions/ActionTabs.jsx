import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import Action from "./Action";
import ActionByDestination from "./ActionByDestination";
import { useTranslation } from "react-i18next";
import ActionByTeams from "./ActionByTeams";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { useFormContext } from "../../../context/CreateMeetingContext";
import StepChart from "../Meeting/CreateNewMeeting/StepChart";
import {
  formatDate,
  formatTime,
} from "../Meeting/GetMeeting/Helpers/functionHelper";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { RxCross2 } from "react-icons/rx";
import Creatable from "react-select/creatable";
import { MdEventAvailable, MdOutlineSupport, MdWork } from "react-icons/md";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { AiOutlineAudit } from "react-icons/ai";
import { FaBookOpen } from "react-icons/fa6";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import { French } from "flatpickr/dist/l10n/fr.js";
import { format } from "date-fns";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { solutionTypeIcons, getOptions } from "../../Utils/MeetingFunctions";
import moment from "moment";
import { toast } from "react-toastify";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { FaBullseye, FaChalkboardTeacher, FaSync } from "react-icons/fa";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const ActionTabs = () => {
  const [t] = useTranslation("global");
  const userId = parseInt(CookieService.get("user_id"));
  const location = useLocation()
  const teamNameFromState = location?.state;
  const navigate = useNavigate()
  const { user: userContext } = useHeaderTitle();
  // Default tab based on job
  const getDefaultTab = () => {
    return userContext?.job === "Manager / Team Leader"
      ? "Action by Teams"
      : userContext?.job === "Project Manager / Product Owner"
        ? "Action by Destinations"
        : "My Action";
  };
  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Ye useEffect tab ko override karega agar teamName aaya ho
  useEffect(() => {
    if (teamNameFromState?.name) {
      setActiveTab("Action by Teams");
    }
  }, [teamNameFromState]);
  const [myActionCount, setMyActionCount] = useState(0);
  const [myDestinationCount, setMyDestinationCount] = useState(0);
  const [myTeamCount, setMyTeamCount] = useState(0);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [stepsData, setStepsData] = useState([]);
  const [destinationData, setDestinationData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState({
    count: 0,
    calculation: false,
  });

  // New state for stepper modal
  const [showStepperModal, setShowStepperModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedMoment, setSelectedMoment] = useState(null);

  // Options with labels
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

      case "Other":
        return <span style={commonStyle}>✨</span>;

      default:
        return null;
    }
  };

  // Client state
  const [clients, setClients] = useState([]);
  const [isClientsLoading, setIsClientsLoading] = useState(false);

  // Mission state
  const [missions, setMissions] = useState([]);
  const [isMissionsLoading, setIsMissionsLoading] = useState(false);

  // Moment state
  const [moments, setMoments] = useState([]);
  const [isMomentsLoading, setIsMomentsLoading] = useState(false);

  // Fetch clients when modal opens
  useEffect(() => {
    if (showStepperModal) {
      fetchClients();
      fetchMissions();
    }
  }, [showStepperModal]);

  // API to fetch clients
  const fetchClients = async () => {
    setIsClientsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.data?.data) {
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

        setClients([
          {
            label: "Mon entreprise",
            options: enterpriseClients,
          },
          {
            label: "Nos clients",
            options: userClients,
          },
        ]);
        // const clientOptions = response.data.data.map((client) => ({
        //   value: client.id,
        //   label: client.name,
        //   logo: client.client_logo,
        // }));
        // setClients(clientOptions);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setIsClientsLoading(false);
    }
  };
  // API to fetch clients
  const fetchMissions = async () => {
    setIsMissionsLoading(true);
    try {
      const userId = parseInt(CookieService.get("user_id"));
      const response = await axios.get(
        `${API_BASE_URL}/get-objectives-with-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.data) {
        const missionOptions = response.data.data.map((mission) => ({
          value: mission.id,
          label: mission.name,
          client_id: mission?.client_id,
          status: mission?.status,
        }));
        setMissions(missionOptions);
      }
    } catch (error) {
      console.error("Error fetching missions:", error);
    } finally {
      setIsMissionsLoading(false);
    }
  };

  // API to fetch moments based on selected mission's destination_id
  const fetchMoments = async (destinationId) => {
    setIsMomentsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-meeting-names/${destinationId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response?.status === 200) {
        const momentOptions = response.data.data.map((moment) => ({
          value: moment.id,
          label: moment.title,
        }));
        setMoments(momentOptions);
      }
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setIsMomentsLoading(false);
    }
  };

  // Handle client selection
  const handleClientSelect = (selectedOption) => {
    setSelectedClient(selectedOption);
    setSelectedMission(null);
    setSelectedMoment(null);
  };

  // Update mission selection handler to fetch moments
  const handleMissionSelect = (selectedOption) => {
    setSelectedMission(selectedOption);
    setSelectedMoment(null);

    if (selectedOption && selectedOption.value) {
      fetchMoments(selectedOption.value);
    }
  };

  // Update the moment selection handler
  const handleMomentSelect = (selectedOption) => {
    setSelectedMoment(selectedOption);

    // // Store the meeting ID and open StepChart
    // if (selectedOption) {
    //   setShow(true);
    //   getMeeting(selectedOption.value); // Fetch meeting
    // }
  };

  // Filter missions based on selected client
  const getFilteredMissions = () => {
    if (!selectedClient) return []; // No client selected, show empty

    return missions.filter(
      (mission) => mission.client_id === selectedClient.value
    );
  };

  const getUserDestinations = async () => {
    setDestinationLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-user-destinations/${userId}`
      );
      if (response.status) {
        const data = response?.data?.data || [];
        setMyDestinationCount(data?.length);
        // setSteps(data);
        setDestinationData(data);
      }
    } catch (error) {
      console.error("Error while fetching actions", error);
    } finally {
      setDestinationLoading(false);
    }
  };
  const [teamLoading, setTeamLoading] = useState(false);
  const getUserTeams = async () => {
    setTeamLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-user-teams/${userId}`
      );
      if (response.status) {
        const data = response?.data?.data || [];
        setMyTeamCount(data?.length);
        // setSteps(data);
        setTeamData(data);
      }
    } catch (error) {
      console.error("Error while fetching actions", error);
    } finally {
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    // getActions();
    getUserDestinations();
    getUserTeams();
  }, []);

  // const handleScroll = () => {
  //   if (tabsRef.current) {
  //     setIsSticky(window.scrollY > 170);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  // const [showDestinationModal, setShowDestinationModal] = useState(false);
  // const [destinations, setDestinations] = useState([]);
  // const [isDestinationLoad, setIsDestinationLoad] = useState(false);

  // useEffect(() => {
  //   const getDestinationName = async () => {
  //     setIsDestinationLoad(true);
  //     try {
  //       const response = await axios.get(
  //         `${API_BASE_URL}/current/destinations/names`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${CookieService.get("token")}`,
  //           },
  //         }
  //       );
  //       if (response?.status === 200) {
  //         const data = response.data?.data;
  //         setDestinations(data);
  //         setIsDestinationLoad(false);
  //       }
  //     } catch (error) {
  //       console.log("error", error);
  //       setIsDestinationLoad(false);
  //     }
  //   };

  //   getDestinationName();
  // }, []);

  const [isDrop, setIsDrop] = useState(false);
  const [isDropFile, setIsDropFile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [show, setShow] = useState(false);
  const [newId, setNewId] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setShow(false);
    setShowStepperModal(false);
    setSelectedClient(null);
    setSelectedMission(null);
    setSelectedMoment(null);
    setIsDrop(false);
    setIsDropFile(false);
    setMeeting(null);
    setCurrentStep(1);
  };

  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const getMeeting = async (id) => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}`
      );
      if (response) {
        const data = response?.data?.data;
        setMeeting(data);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleContinue = async () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!selectedClient) {
        toast.error(t("meeting.formState.clientError") || "Please select a client");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!selectedMission) {
        toast.error(t("meeting.formState.destination") || "Please select a mission");
        return;
      }
      if (selectedMission.__isNew__ && !destinationType) {
        toast.error(t("meeting.formState.type") || "Please select a mission type");
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!selectedMoment) {
        toast.error(t("meeting.formState.momentError") || "Please select a moment");
        return;
      }

      const isNewClient = selectedClient?.__isNew__;
      const isNewMission = selectedMission?.__isNew__;
      const isNewMoment = selectedMoment?.__isNew__;

      if (isNewMoment) {
        if (!momentType) {
          toast.error(t("meeting.formState.type") || "Please select a moment type");
          return;
        }
        if (!selectedDateTime) {
          toast.error(t("meeting.formState.date") || "Please select a date and time");
          return;
        }
      }

      if (!isNewClient && !isNewMission && !isNewMoment) {
        // All existing — just open chart and load meeting
        setShow(true);
        if (selectedMoment?.value) {
          getMeeting(selectedMoment.value);
        }
      } else {
        const dateTime =
          selectedDateTime && selectedDateTime.length > 0
            ? selectedDateTime[0]
            : selectedDateTime instanceof Date 
              ? selectedDateTime 
              : new Date();

        // One or more are new — build full payload and post
        const payload = {
          client_id: !isNewClient ? selectedClient?.value : null,
          client: isNewClient ? selectedClient?.label : null,

          destination_id: !isNewMission ? selectedMission?.value : null,
          destination: isNewMission ? selectedMission?.label : null,
          destination_type: isNewMission ? destinationType : null,
          ...(isNewMoment && {
            type: momentType?.value,
            date: dateTime.toISOString().split("T")[0],
            start_time: dateTime.toTimeString().split(" ")[0],
          }),

          moment_id: !isNewMoment ? selectedMoment?.value : null,
          moment: isNewMoment ? selectedMoment?.label : null,
          timezone: userTimeZone,
          solution_id: momentType?.solution?.id,
        };

        setIsSubmitting(true);
        try {
          const response = await axios.post(
            `${API_BASE_URL}/quick-action-planning`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            }
          );

          if (response?.data?.success) {
            toast.success(t("meeting.formState.createdSuccess") || "Created successfully!");
            if (momentType?.solution?.is_step_exists !== false) {
              navigate(`/invite/${response?.data?.data?.id}`)
            } else {
              setShow(true);
              getMeeting(response.data.data?.id);
            }
          } else {
            toast.error(response?.data?.message || t("meeting.formState.createFailed") || "Failed to create. Please try again.");
          }
        } catch (error) {
          console.error("API Error:", error);
          toast.error(error?.response?.data?.message || t("meeting.formState.somethingWentWrong") || "Something went wrong.");
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const [destinationType, setDestinationType] = useState(null);
  const { language } = useDraftMeetings();
  let [locale, setLocale] = useState(null);
  if (language === "en") {
    locale = undefined;
  } else {
    locale = French;
  }
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const formatDateWithCustomTime = (date) => {
    return format(date, "dd/MM/yyyy, HH'h'mm");
  };

  const handleChange = (date) => {
    setSelectedDateTime(date);
    if (date) {
      const datePart = date[0]?.toISOString().split("T")[0];
      const timePart = date[0]?.toTimeString().split(" ")[0];
    }
  };
  const [momentType, setMomentType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
console.log("momentType",momentType)
  const user = JSON.parse(CookieService.get("user"));
  const roleId = parseInt(user?.role_id);
      const [solutions, setSolutions] = useState([])

    useEffect(() => {
        const getSolutionTemplate = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/get-all-solutions`, {
                    headers: {
                        Authorization: `Bearer ${CookieService.get("token")}`
                    }
                });
                if (response?.status === 200) {
                    setSolutions(response?.data?.data)
                }
            } catch (error) {
                console.error("Error fetching solution templates:", error);
            }
        }

        getSolutionTemplate();
    }, [])



  const formattedSolutions = solutions.map((item) => {
    if (typeof item === "string") {
      return {
        value: item,
        label: item,
        icon: solutionTypeIcons[item] || null,
        solution:item
      };
    }

    // If it's an object
    const title = item?.title || "";
    const label = item?.label || title;
    const iconUrl = item?.logo?.startsWith('http') ? item?.logo : Assets_URL + '/' + item?.logo
    const solution = item;

    return {
      value: title,
      label,
      icon: iconUrl ? (
        <img
          src={iconUrl}
          alt={title}
          width={18}
          height={18}
          style={{ objectFit: "contain" }}
        />
      ) : (
        solutionTypeIcons[title] || null
      ),
      solution
    };
  });

  const typeOptions = [
    {
      label: t("Create from template"),
      options: formattedSolutions,
      isDisabled: true,
    },
  ];

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Client step
        return (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">
                {t("Client")}
                <span className="required-asterisk">*</span>
              </label>
              <Creatable
                className="my-select destination-select-dropdown"
                classNamePrefix="select"
                isLoading={isClientsLoading}
                options={clients}
                onChange={handleClientSelect}
                value={selectedClient}
                placeholder={t("Select or create a client")}
                formatOptionLabel={(option) => (
                  <div className="option-with-logo">
                    {/* Show client logo if available */}
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
                    {/* Client name */}
                    <span>{option.label}</span>
                  </div>
                )}
                isClearable
              />
            </div>
          </div>
        );

      case 2: // Mission step
        return (
          <div className="step-content">
            {selectedClient && (
              <div
                className="selected-summary mb-3 p-3"
                style={{ backgroundColor: "#f5f7fa", borderRadius: "8px" }}
              >
                <strong>{t("Selected Client")}:</strong>{" "}
                {selectedClient?.value && !selectedClient?.__isNew__
                  ? (() => {
                    // Search through all client groups for the matching client
                    for (const group of clients) {
                      const foundClient = group.options.find(
                        (opt) =>
                          Number(opt.value) === Number(selectedClient?.value)
                      );
                      if (foundClient) return foundClient.label;
                    }
                    return selectedClient?.label;
                  })()
                  : selectedClient?.label}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {t("Mission")}
                <span className="required-asterisk">*</span>
              </label>
              <Creatable
                className="my-select destination-select-dropdown"
                classNamePrefix="select"
                isLoading={isMissionsLoading}
                options={getFilteredMissions()} // Only show missions for selected client
                onChange={handleMissionSelect}
                value={selectedMission}
                placeholder={t("Select a mission")}
                isDisabled={!selectedClient}
                isClearable
                formatOptionLabel={formatMissionOption}
              />
            </div>
            {/* Destination Type Select Field */}
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
                    (opt) => opt.value === destinationType
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
          </div>
        );

      case 3: // Moment step
        return (
          <div className="step-content">
            {selectedClient && (
              <div
                className="selected-summary mb-3 p-3"
                style={{ backgroundColor: "#f5f7fa", borderRadius: "8px" }}
              >
                <strong>{t("Selected Client")}:</strong>{" "}
                {selectedClient?.value && !selectedClient?.__isNew__
                  ? (() => {
                    // Search through all client groups for the matching client
                    for (const group of clients) {
                      const foundClient = group.options.find(
                        (opt) =>
                          Number(opt.value) === Number(selectedClient?.value)
                      );
                      if (foundClient) return foundClient.label;
                    }
                    return selectedClient?.label;
                  })()
                  : selectedClient?.label}
              </div>
            )}
            {selectedMission && (
              <div
                className="selected-summary mb-3 p-3"
                style={{ backgroundColor: "#f5f7fa", borderRadius: "8px" }}
              >
                <strong>{t("Selected Mission")}:</strong>{" "}
                {selectedMission?.value && !selectedMission?.__isNew__
                  ? missions.find(
                    (opt) =>
                      Number(opt.value) === Number(selectedMission?.value)
                  )?.label
                  : selectedMission?.label}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">
                {t("Moment")}
                <span className="required-asterisk">*</span>
              </label>
              <Creatable
                className="my-select destination-select-dropdown"
                classNamePrefix="select"
                isLoading={isMomentsLoading}
                options={moments}
                onChange={handleMomentSelect}
                value={selectedMoment}
                placeholder={t("Select a moment")}
                isDisabled={!selectedMission}
              />
            </div>
            {selectedMoment?.__isNew__ && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    {t("momentType")}
                    {""}
                    <span className="required-asterisk">*</span>
                  </label>
                  <Select
                    className="my-select destination-select-dropdown"
                    classNamePrefix="select"
                    value={momentType}
                    onChange={(selected) => {
                      setMomentType(selected);
                      if (selected?.templateData) {
                        setSelectedTemplate(selected.templateData);
                      } else {
                        setSelectedTemplate(null);
                      }
                    }}
                    options={typeOptions}
                    isClearable
                    formatOptionLabel={(option) => {
                      if (option.label === "Create From Scratch") {
                        return (
                          <div
                            style={{
                              fontWeight: "bold",
                              padding: "8px 12px",
                              borderBottom: "1px solid #e0e0e0",
                              backgroundColor: "#f5f5f5",
                            }}
                          >
                            {option.label}
                          </div>
                        );
                      }
                      return (
                        <div className="option-with-logo">
                          {option.icon && (
                            <span className="icon-wrapper">
                              {typeof option.icon === "string" ? (
                                <img
                                  src={option.icon}
                                  alt="icon"
                                  className="client-logo"
                                />
                              ) : (
                                option.icon
                              )}
                            </span>
                          )}
                          <span>{option.label}</span>
                        </div>
                      );
                    }}
                    formatGroupLabel={(group) => (
                      <div
                        style={{
                          fontWeight: "bold",
                          padding: "8px 12px",
                          borderBottom: "1px solid #e0e0e0",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        {group.label}
                      </div>
                    )}
                  />
                </div>

                <div className="create-moment-modal">
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
                </div>
              </>
            )}
          </div>
        );

      // case 4: // Action step
      //   return (
      //     <div className="step-content">
      //       <div className="form-group">
      //         <h4>{t("Create Action")}</h4>
      //         <p>Client: {selectedClient?.label}</p>
      //         <p>Mission: {selectedMission?.label}</p>
      //         <p>Moment: {selectedMoment?.label}</p>
      //         {/* Add action-specific form fields here */}
      //       </div>
      //     </div>
      //   );

      default:
        return null;
    }
  };

  return (
    <div className="destination-tabs-container container-fluid px-2">
      <div ref={tabsRef} className={`tabs-header`}>
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="meeting-title">{t("action.title")}</h4>


          <button
            className={`btn moment-btn`}
            onClick={() => {
              window.open('https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482 ', "_blank")
            }}
          >
            {t("request a demo")}
          </button>
        </div>
        <small style={{ padding: "15px 14px" }}>{t("action.subheading")}</small>
        <div className={`container-fluid`}>
          <div               className="row align-items-center gutter-0"
              style={{ padding: "0 10px" }}

>
            <div
              className="col-lg-9 col-md-8 col-12 destination-tab-row tabs-destinations border-bottom tabs-meeting"
              style={{ borderBottom: "2px solid #F2F2F2" }}
            >
              <div className="tabs">
                <div className="d-flex">
                  <button
                    className={`tab ${activeTab === "My Action" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("My Action")}
                            style={{borderRadius: "0px"}}

                  >
                    {t("action.MyActionTab")}
                    <span
                      className={activeTab === "My Action" ? "future" : "draft"}
                    >
                      {myActionCount}
                    </span>
                  </button>
                  <button
                    className={`tab ${activeTab === "Action by Destinations" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("Action by Destinations")}
                            style={{borderRadius: "0px"}}

                  >
                    {t("action.ActionByDestinationsTab")}
                    <span
                      className={
                        activeTab === "Action by Destinations"
                          ? "future"
                          : "draft"
                      }
                    >
                      {myDestinationCount}
                    </span>
                  </button>
                  <button
                    className={`tab ${activeTab === "Action by Teams" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("Action by Teams")}
                            style={{borderRadius: "0px"}}

                  >
                    {t("action.ActionByTeamsTab")}
                    <span
                      className={
                        activeTab === "Action by Teams" ? "future" : "draft"
                      }
                    >
                      {myTeamCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`col-lg-3 col-md-4 col-12 d-flex justify-content-end p-0 align-items-center gap-2`}
            >
              <button
                className={`btn`}
                style={{
                  whiteSpace: "nowrap",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #2C48AE",
                  color: "#2C48AE",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "40px",
                }}
                onClick={() =>
                  setRefreshTrigger((prev) => ({
                    count: prev.count + 1,
                    calculation: true,
                  }))
                }
                disabled={loading || destinationLoading || teamLoading}
              >
                {loading || destinationLoading || teamLoading ? (
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                ) : (
                  <FaSync size={14} />
                )}
                Refresh
              </button>
              <button
                className={`btn`}
                style={{
                  whiteSpace: "nowrap",
                  backgroundColor: "#2C48AE",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "40px",
                }}
                onClick={() => {
                  setShowStepperModal(true);
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 14.75V1.25M1.25 8H14.75"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("action.addStep")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="content p-0">
        {activeTab === "My Action" && (
          <div>
            {
              <Action
                stepsData={stepsData}
                setMyActionCount={setMyActionCount}
                refreshTrigger={refreshTrigger}
              />
            }
          </div>
        )}
        {activeTab === "Action by Destinations" && (
          <div>{<ActionByDestination stepsData={destinationData} refreshTrigger={refreshTrigger} />}</div>
        )}
        {activeTab === "Action by Teams" && (
          <div>{<ActionByTeams stepsData={teamData} teamName={teamNameFromState} refreshTrigger={refreshTrigger} />}</div>
        )}
      </div>

      {/* Stepper Modal */}
      {showStepperModal && (
        <div className="quick-moment-form">
          <div className="modal-overlay-1">
            <div
              className="new-meeting-modal-1"
              style={{
                width: "70vw",
                maxHeight: "80vh",
                overflowY: "auto",
                background: "white",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <div className="modal-nav">
                <h4>{t("meeting.newMeeting.Create New Action")}</h4>
                <button
                  className="cross-btn"
                  onClick={() => setShowStepperModal(false)}
                >
                  <RxCross2 size={18} />
                </button>
              </div>
              <div className="modal-body">
                <div className="progress-container-1">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((currentStep - 1) / 2) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <>
                      <div
                        className={`progress-step ${currentStep >= 1 ? "active" : ""
                          }`}
                      >
                        <div className="step-number">1</div>
                        <div className="step-label">{t("Client")}</div>
                      </div>
                      <div
                        className={`progress-step ${currentStep >= 2 ? "active" : ""
                          }`}
                      >
                        <div className="step-number">2</div>
                        <div className="step-label">{t("Mission")}</div>
                      </div>
                      <div
                        className={`progress-step ${currentStep >= 3 ? "active" : ""
                          }`}
                      >
                        <div className="step-number">3</div>
                        <div className="step-label">{t("Moment")}</div>
                      </div>
                    </>
                  </div>
                </div>

                {renderStepContent()}
              </div>

              <div className="modal-footer-fixed">
                {currentStep > 1 && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleBack}
                  >
                    {t("Previous")}
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    className="btn"
                    style={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      textAlign: "left",
                      color: " #FFFFFF",
                      background: (currentStep === 1 && !selectedClient) || (currentStep === 2 && !selectedMission) || isSubmitting || isLoading ? "#ccc" : "#2C48AE",
                      border: 0,
                      outline: 0,
                      padding: "10px 16px",
                      borderRadius: "9px",
                      cursor: (currentStep === 1 && !selectedClient) || (currentStep === 2 && !selectedMission) || isSubmitting || isLoading ? "not-allowed" : "pointer"
                    }}
                    onClick={handleContinue}
                    disabled={(currentStep === 1 && !selectedClient) || (currentStep === 2 && !selectedMission) || isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                      t("meeting.formState.Save and Continue")
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
                      textAlign: "left",
                      color: " #FFFFFF",
                      background: !selectedMoment || (selectedMoment.__isNew__ && !momentType) || isSubmitting || isLoading ? "#ccc" : "#2C48AE",
                      border: 0,
                      outline: 0,
                      padding: "10px 16px",
                      borderRadius: "9px",
                      cursor: !selectedMoment || (selectedMoment.__isNew__ && !momentType) || isSubmitting || isLoading ? "not-allowed" : "pointer"
                    }}
                    onClick={handleContinue}
                    disabled={!selectedMoment || (selectedMoment.__isNew__ && !momentType) || isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    ) : (
                      t("meeting.formState.Save and Continue")
                    )}
                  </button>
                )}
              </div>

              {/* <div className="stepper-header">
              <div className={`stepper-step ${currentStep >= 0 ? 'active' : ''}`}>
                1. Select Client
              </div>
              <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''}`}>
                2. Select Mission
              </div>
              <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''}`}>
                3. Select Moment
              </div>
              <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''}`}>
                4. Add Action
              </div>
            </div>
            
            <div className="stepper-content">
              {currentStep === 0 && (
                <>
                  <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    {t("action.select client")}
                  </h5>
                  {isClientsLoading ? (
                    <Spinner animation="border" role="status" className="center-spinner" />
                  ) : (
                    <CreatableSelect
                      options={clients}
                      // onChange={handleClientSelect}
                      placeholder="Select or create a client..."
                      isClearable
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  )}
                </>
              )}
              
              {currentStep === 1 && (
                <>
                  <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    {t("action.select mission")}
                  </h5>
                  {isDestinationLoad ? (
                    <Spinner animation="border" role="status" className="center-spinner" />
                  ) : (
                    <CreatableSelect
                      options={destinations.map(dest => ({
                        value: dest.id,
                        label: dest.destination_name,
                        clientId: dest.clients?.[0]?.id || null
                      }))}
                      // onChange={handleMissionSelect}
                      placeholder="Select or create a mission..."
                      isClearable
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                    />
                  )}
                </>
              )}
              
              {currentStep === 2 && (
                <>
                  <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
                    {t("action.select a moment")}
                  </h5>
                  {isMeetingLoad ? (
                    <Spinner animation="border" role="status" className="center-spinner" />
                  ) : (
                    <Select
                      options={meetings.map(meeting => ({
                        value: meeting.id,
                        label: meeting.title
                      }))}
                      // onChange={handleMomentSelect}
                      placeholder="Select a moment..."
                      isLoading={isLoading}
                    />
                  )}
                </>
              )}
              
              {currentStep === 3 && (
                <div className="text-center">
                  <Spinner animation="border" role="status" />
                  <p>Preparing action form...</p>
                </div>
              )}
            </div>
            
            <div className="stepper-footer">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    marginRight: "1rem",
                    background: "#ccc",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                  }}
                >
                  {t("Back")}
                </button>
              )}
              <button
                onClick={() => setShowStepperModal(false)}
                style={{
                  background: "#ccc",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                }}
              >
                {t("Cancel")}
              </button>
            </div> */}
            </div>
          </div>
        </div>
      )}

      {/* {show && ( */}
      <div className="quick-moment-form-2">
        <div className="new-meeting-modal">
          <StepChart
            meetingId={meeting?.id}
            id={null}
            show={show}
            setId={setNewId}
            closeModal={handleCloseModal}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            setIsDropFile={setIsDropFile}
            meeting={meeting}
            setMeeting={setMeeting}
            refreshMeeting={getMeeting}
            fromAction={true}
          // stepIndex={stepIndex}
          />
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default ActionTabs;
