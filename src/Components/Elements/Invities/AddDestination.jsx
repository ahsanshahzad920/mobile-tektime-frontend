import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ImageEditorModal from "./ImageEditorModal";
import { IoImages } from "react-icons/io5";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
// import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import Creatable from "react-select/creatable";


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr"; // replace with your locale if needed
import { RxCross2 } from "react-icons/rx";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { FaBookOpen } from "react-icons/fa6";
import { AiOutlineAudit } from "react-icons/ai";
import { MdEventAvailable, MdOutlineSupport, MdWork } from "react-icons/md";
import { FaBullseye, FaChalkboardTeacher, FaRobot } from "react-icons/fa";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

// Optional: register the locale
registerLocale("fr", fr);

const AddDestination = ({
  show,
  handleClose,
  currentItem,
  refreshedDestination,
  refreshBudget,
}) => {
  const [loading, setLoading] = useState(false);
  const [destinationDescription, setDestinationDescription] = useState(null);
  const [destinationClient, setDestinationClient] = useState(null); // value (id or name)
  const [destinationClientId, setDestinationClientId] = useState(null); // value (id or name)

  const [clientNeed, setClientNeed] = useState(null);
  const [destinationTime, setDestinationTime] = useState();

  const [budgetInitial, setBudgetInitial] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const [type, setType] = useState(null);
  const [t] = useTranslation("global");

  // const userId = parseInt(CookieService.get("user_id"));
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = React.useRef(null);
  const [croppedimage, setcroppedImage] = useState(null);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [step, setStep] = useState(currentItem ? 2 : 1);
  const [selectedCard, setSelectedCard] = useState(null);



  // Ajoute ces states avec les autres useState
  const [missions, setMissions] = useState([]); // Toutes les missions visibles
  const [selectedLinkedMissions, setSelectedLinkedMissions] = useState([]); // Missions sélectionnées (multi)
  useEffect(() => {
    if (!show) return;

    const fetchVisibleMissions = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/linkable/all-destinations`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        // L’API renvoie probablement quelque chose comme res.data.data
        const missionOptions = (res.data?.data || []).map((m) => ({
          value: m.id,
          label: `${m.destination_name}`,
          // Tu peux ajouter d’autres infos si tu veux
          // logo: m.clients?.client_logo,
        }));

        setMissions(missionOptions);
      } catch (err) {
        console.error("Erreur chargement missions liées", err);
        toast.error("Impossible de charger les missions liées");
      }
    };

    fetchVisibleMissions();
  }, [show]);

  const [clientImage, setClientImage] = useState(null);
  const clientImageFileInputRef = useRef(null);

  // const triggerClientImageFileInput = () => {
  //   clientImageFileInputRef.current.click();
  // };

  // const { language } = useDraftMeetings();
  const typeOptions = useMemo(() => [
    {
      value: "Business opportunity",
      label: t("destination.businessOppurtunity"),
    },
    {
      value: "Study",
      label: t("destination.study"),
    },
    {
      value: "Audit",
      label: t("destination.audit"),
    },
    {
      value: "Project",
      label: t("destination.project"),
    },
    {
      value: "Accompagnement",
      label: t("destination.accompagnement"),
    },
    {
      value: "Event",
      label: t("destination.event"),
    },
    {
      value: "Formation",
      label: t("destination.formation"),
    },
    {
      value: "Recruitment",
      label: t("destination.recruitment"),
    },
    {
      value: "Objective",
      label: t("destination.objective"),
    },
    {
      value: "Other",
      label: t("destination.other"),
    },
    {
      value: "Agenda",
      label: t("destination.Agenda"),
    },
    // {
    //   value: "Google Agenda",
    //   label: t("destination.googleAgenda"),
    // },
    {
      value: "Messagerie",
      label: t("destination.messaging"),
    },
    {
      value: "Assistant Conversation",
      label: t("destination.assistantConversation"),
    },
  ], [t]);
  const [createAnother, setCreateAnother] = useState(false);
  const handleCheckboxChange = (e) => {
    setCreateAnother(e.target.checked);
  };
  // Handle image selection from file input
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCloseModal = () => {
    handleClose();
    resetForm();
  };
  const resetForm = () => {
    setClientNeed(null);
    setDestinationDescription("");
    setDestinationClient("");
    setBudgetInitial(0);
    setCurrency("EUR");
    setType(null);
    setImage(null);
    setClientImage(null);
    setcroppedImage(null);
    setStep(currentItem ? 2 : 1);
    setSelectedCard(null);

    // ADD THESE
    setMissionPrivacy("Private");
    setSelectedTeams([]);
  };

  const [missionPrivacy, setMissionPrivacy] = useState("Private"); // default
  const [selectedTeams, setSelectedTeams] = useState([]); // team IDs
  const [teamsOptions, setTeamsOptions] = useState([]); // dropdown options
  // END OF NEW STATES
  // ──────────────────────────────────────────────────────────────────────────────
  // 2. Fetch teams (once, when the modal opens)
  useEffect(() => {
    if (!show) return;

    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/teams`, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });

        const userRoleId = getUserRoleID();
        let filteredTeams = [];

        if (userRoleId === 1) {
          // Admin: show all teams
          filteredTeams = res.data?.data || [];
        } else if (userRoleId === 2) {
          // Enterprise Admin: show only teams created by self
          CookieService.set(
            "enterprise",
            JSON.stringify(res.data?.enterprise)
          );


          filteredTeams = (res.data?.data || []).filter(
            (team) => team?.created_by?.id === CookieService.get("user_id")
          );
        } else if (userRoleId === 3) {
          // Enterprise User: show teams in their enterprise
          CookieService.set(
            "enterprise",
            JSON.stringify(res.data?.enterprise)
          );

          const enterpriseId = JSON.parse(
            CookieService.get("enterprise")
          )?.id;
          filteredTeams = (res.data?.data || []).filter(
            (team) => team?.enterprise?.id === enterpriseId
          );
        } else {
          // Fallback (e.g. client or unknown): show only own created teams
          CookieService.set(
            "enterprise",
            JSON.stringify(res.data?.enterprise)
          );

          filteredTeams = (res.data?.data || []).filter(
            (team) => team?.created_by?.id === CookieService.get("user_id")
          );
        }

        // Convert to react-select format
        const options = filteredTeams.map((team) => ({
          value: team.id,
          label: team.name,
        }));

        setTeamsOptions(options);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams");
      }
    };

    fetchTeams();
  }, [show]);
  // ──────────────────────────────────────────────────────────────────────────────
  // 1. Helper: return plain values (no JSON.stringify)
  // Returns plain values – array stays an array
  const getMissionPrivacyPayload = () => {
    const payload = {};

    if (["Private", "Enterprise", "Teams"].includes(missionPrivacy)) {
      payload.mission_privacy = missionPrivacy.toLowerCase();
    }

    if (missionPrivacy === "Teams" && selectedTeams.length > 0) {
      payload.mission_privacy_teams = selectedTeams; // <-- array
    }

    return payload;
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  useEffect(() => {
    if (currentItem) {
      // Helper: Capitalize first letter
      const capitalizeFirstLetter = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
      setDestinationDescription(currentItem?.destination_description);
      setClientNeed(currentItem?.destination_name);
      setClientImage(currentItem?.clients?.client_logo);
      setDestinationClient(currentItem?.clients?.name || currentItem?.client);
      setDestinationClientId(currentItem.clients?.id);

      setBudgetInitial(currentItem?.initial_budget || 0);
      setCurrency(currentItem?.currency || "EUR");
      if (currentItem?.destination_end_date_time && currentItem?.destination_end_date_time !== "null") {
        setDestinationTime(new Date(currentItem.destination_end_date_time));
      }

      // Set mission privacy (capitalize: "private" → "Private")
      const privacy = currentItem?.mission_privacy;
      setMissionPrivacy(privacy ? capitalizeFirstLetter(privacy) : "Private");
      // ---- mission_privacy_teams → array ----
      if (currentItem?.mission_privacy_teams) {
        try {
          const arr = JSON.parse(currentItem.mission_privacy_teams);
          setSelectedTeams(Array.isArray(arr) ? arr.map(Number) : []);
        } catch (e) {
          console.warn("Bad mission_privacy_teams JSON", e);
          setSelectedTeams([]);
        }
      } else {
        setSelectedTeams([]);
      }
      const currentType = typeOptions.find(
        (opt) => opt.value === currentItem?.destination_type
      );
      if (currentType) {
        const cardIndex = typeOptions.findIndex(
          (opt) => opt.value === currentType.value
        );
        setSelectedCard(cardIndex);
      }
      setImage(currentItem?.banner);
      setcroppedImage(currentItem?.banner);
      setType(
        typeOptions.find(
          (opt) => opt.value === currentItem?.destination_type
        ) || null
      );
    } else {
      setDestinationDescription("");
      setDestinationClient("");
      setClientNeed(null);
      setBudgetInitial(0);
      setCurrency("EUR");
      setType("");
      setImage(null);
      setcroppedImage(null);
      setClientImage(null);
    }
  }, [currentItem, show, typeOptions]);

  useEffect(() => {
    if (currentItem?.all_linked) {
      const ids = currentItem.all_linked.map(item => Number(item?.id));
      setSelectedLinkedMissions(ids);
    } else {
      setSelectedLinkedMissions([]);
    }
  }, [currentItem]);
  const user_id = CookieService.get("user_id");
  const createDestination = async () => {
    if (!clientNeed) {
      toast.error(t("destination.clientNeedError"));
      return;
    }
    if (!destinationClient) {
      toast.error(t("destination.clientError"));
      return;
    }
    setLoading(true);
    try {
      // const payload = {
      //   destination_name: destinationName,
      //   destination_description: destinationDescription || "",
      //   user_id: user_id,
      // };
      const formData = new FormData();
      formData.append("client_id", destinationClientId || "");
      formData.append("client", destinationClient || "");
      formData.append("destination_name", clientNeed);
      formData.append("client_need", clientNeed);
      formData.append("destination_type", type.value || "");
      formData.append("destination_description", destinationDescription || "");
      formData.append("destination_end_date_time", destinationTime || "");
      formData.append("initial_budget", budgetInitial || 0);
      formData.append("currency", currency || "");
      formData.append("user_id", user_id);
      formData.append("timezone", userTimeZone);

      const privacyPayload = getMissionPrivacyPayload();

      Object.entries(privacyPayload).forEach(([key, value]) => {
        if (key === "mission_privacy_teams") {
          // Send each team ID as a separate mission_privacy_teams[] entry
          value.forEach((teamId) => {
            formData.append("mission_privacy_teams[]", teamId);
          });
        } else {
          // Send plain text (no quotes)
          formData.append(key, value);
        }
      });
      // ... tout le reste du FormData ...

      // Liens (missions liées)
      selectedLinkedMissions.forEach((missionId) => {
        formData.append("linked_destinations[]", missionId);
      });
      // Add client image
      if (clientImageFileInputRef.current?.files[0]) {
        formData.append(
          "client_logo",
          clientImageFileInputRef.current.files[0]
        );
      }

      // Convert Base64 string to Blob
      if (croppedimage) {
        const base64Response = await fetch(croppedimage);
        const blob = await base64Response.blob(); // Convert to Blob
        formData.append("banner", blob, "banner.jpg"); // Append the Blob to FormData
      }

      const response = await axios.post(
        `${API_BASE_URL}/destinations`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        if (!createAnother) {
          navigate(`/invitiesToMeeting/${data?.id}`);
        } else {
          resetForm();
          if (typeof refreshedDestination === "function") {
            refreshedDestination("Audit");
            refreshedDestination("Other");
            refreshedDestination("Study");
            refreshedDestination("Accompagnement");
            refreshedDestination("Project");
            refreshedDestination("Business opportunity");
          }
        }
        // getDestinations();
        toast.success(t("destination.destinationCreateMsg"));
        setDestinationClientId(null);
        setClientNeed(null);
        setDestinationDescription("");
        setDestinationClient("");
        setBudgetInitial(0);
        setCurrency("EUR");
        setType("");
      }
    } catch (error) {
      console.log("error creating destination", error);
      toast.error(
        error?.response?.data?.message || "Error while creating mission"
      );
    } finally {
      setLoading(false);
    }
  };
  const updateDestination = async (item) => {
    if (!clientNeed) {
      toast.error(t("destination.clientNeedError"));
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("client_id", destinationClientId || "");
      formData.append("client", destinationClient || "");
      formData.append("destination_name", clientNeed);
      formData.append("client_need", clientNeed);
      formData.append("destination_type", type?.value || "");
      formData.append("destination_description", destinationDescription || "");
      formData.append("destination_end_date_time", destinationTime || "");
      formData.append("initial_budget", budgetInitial || 0);
      formData.append("currency", currency || "");
      formData.append("user_id", user_id);
      formData.append("timezone", userTimeZone);

      const privacyPayload = getMissionPrivacyPayload();

      Object.entries(privacyPayload).forEach(([key, value]) => {
        if (key === "mission_privacy_teams") {
          // Send each team ID as a separate mission_privacy_teams[] entry
          value.forEach((teamId) => {
            formData.append("mission_privacy_teams[]", teamId);
          });
        } else {
          // Send plain text (no quotes)
          formData.append(key, value);
        }
      });
      // ... tout le reste du FormData ...

      // Liens (missions liées)
      selectedLinkedMissions.forEach((missionId) => {
        formData.append("linked_destinations[]", missionId);
      });
      formData.append("_method", "PATCH");

      // Add client image
      if (clientImageFileInputRef.current?.files[0]) {
        formData.append(
          "client_logo",
          clientImageFileInputRef.current.files[0]
        );
      } else if (clientImage) {
        formData.append("client_logo", clientImage); // Let backend know to keep the existing logo
      }
      // Convert Base64 string to Blob
      if (croppedimage && !croppedimage.startsWith("http")) {
        try {
          const base64Response = await fetch(croppedimage);
          if (!base64Response.ok)
            throw new Error("Failed to fetch the Base64 image");
          const blob = await base64Response.blob();
          formData.append("banner", blob, "banner.jpg");
        } catch (error) {
          console.error("Error converting Base64 to Blob:", error);
          toast.error("Failed to process the image");
          setLoading(false);
          return;
        }
      }

      //       if (croppedimage) {
      //   try {
      //     const base64Response = await fetch(croppedimage, {
      //       headers: {
      //         'Accept': '*/*',
      //         // 'Accept': 'image/*',
      //         // 'Host': 'your-api-host.com',
      //       },
      //     });

      //     if (!base64Response.ok) {
      //       throw new Error('Failed to fetch the Base64 image');
      //     }

      //     const blob = await base64Response.blob();
      //     formData.append("banner", blob, "banner.jpg"); // Append the Blob to FormData
      //   } catch (error) {
      //     console.error('Error converting Base64 to Blob:', error);
      //     toast.error('Failed to process the image');
      //     return; // Optionally stop execution if image processing fails
      //   }
      // }

      // if (croppedimage) {
      //   formData.append("banner", croppedimage);
      // }
      const response = await axios.post(
        `${API_BASE_URL}/destinations/${item.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
            "Content-Type": "multipart/form-data", // Specify the content type for file uploads
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        navigate(`/invitiesToMeeting/${data?.id}`);
        handleClose();

        // getDestinations();
        // ✅ Only call if function exists
        if (typeof refreshedDestination === "function") {
          refreshedDestination();
        }

        if (typeof refreshBudget === "function") {
          refreshBudget();
        }

        toast.success(t("destination.destinationUpdateMsg"));
        setDestinationDescription("");
        setClientNeed(null);
        setDestinationClient("");
        setBudgetInitial(0);
        setCurrency("EUR");
        setType("");
        setImage(null);
        setClientImage(null);
        setcroppedImage(null);
      }
    } catch (error) {
      console.log("error creating destination", error);
      toast.error(
        error?.response?.data?.message || "Error while updating mission"
      );
    } finally {
      setLoading(false);
    }
  };
  const [usersArray, setUsersArray] = useState([]);

  useEffect(() => {
    // Fetch users to populate the select field
    const fetchUsers = async () => {
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
        if (response.status) {
          setUsersArray(response.data?.data);
        }
      } catch (error) {
        console.log("error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  //   const options = usersArray?.map((user) => ({
  //   value: user.id,
  //   label: user.name,
  //   data: {  // Add client_logo in a data object
  //     client_logo: user.client_logo // Make sure this matches your data structure
  //   }
  // }));
  const groupedOptions = [
    {
      label: "Mon entreprise",
      options: usersArray
        .filter((user) => user.linked_to === "enterprise")
        .map((user) => ({
          value: user.id,
          label: user.name,
          data: {
            client_logo: user.client_logo,
          },
        })),
    },
    {
      label: "Nos clients",
      options: usersArray
        .filter((user) => user.linked_to === "user")
        .map((user) => ({
          value: user.id,
          label: user.name,
          data: {
            client_logo: user.client_logo,
          },
        })),
    },
  ];



  const handleTypeSelect = (type, index) => {
    setType(typeOptions.find((opt) => opt.value === type));
    setSelectedCard(index);
    setStep(2);
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        centered
        className="create-destination-modal"
        size={step === 1 ? "md" : "lg"}
      >
        <Modal.Header className="border-0 pb-0">
          <Modal.Title style={{ fontSize: "20px" }}>
            {step === 1
              ? t("Select Mission Type")
              : currentItem
                ? `${t("invities.update")} ${t(
                  `des_type.${currentItem?.destination_type}`
                )} ${t("for")} ${currentItem?.clients?.name}`
                : `${t("invities.create")} ${type?.label ?? ""}`}
          </Modal.Title>
          <Button
            variant="link"
            onClick={handleCloseModal}
            className="position-absolute end-0 top-0 pe-3 pt-2"
          >
            <RxCross2 size={20} />
          </Button>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          {step === 1 ? (
            <Row className="g-3">
              {typeOptions.map((option, index) => {
                // Get the appropriate icon for each option
                const getIcon = () => {
                  switch (option.value) {
                    case "Business opportunity":
                      return (
                        <IoIosBusiness
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Study":
                      return (
                        <FaBookOpen
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Audit":
                      return (
                        <AiOutlineAudit
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Project":
                      return (
                        <IoIosRocket
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Accompagnement":
                      return (
                        <MdOutlineSupport
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Event":
                      return (
                        <MdEventAvailable
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Formation":
                      return (
                        <FaChalkboardTeacher
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Recruitment":
                      return (
                        <MdWork
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Objective":
                      return (
                        <FaBullseye
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Assistant Conversation":
                      return (
                        <FaRobot
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
                      );

                    case "Agenda":
                    case "Messagerie":
                      return (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="37"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="#F19C38"
                        >
                          <path d="M7.5 5.6L10 0L12.5 5.6L18.1 8.1L12.5 10.6L10 16.2L7.5 10.6L1.9 8.1L7.5 5.6Z"/>
                          <path d="M17.5 15.6L19.1 12.1L20.7 15.6L24.2 17.2L20.7 18.8L19.1 22.3L17.5 18.8L14 17.2L17.5 15.6Z"/>
                        </svg>
                      );

                    case "Other":
                      return (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="37"
                          height="36"
                          viewBox="0 0 512 512"
                          fill="#DAE6ED"
                        >
                          <path d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z" />
                        </svg>
                      );

                    default:
                      return "✨";
                  }
                };

                return (
                  <Col key={index} md={4}>
                    <Card
                      className="text-center shadow-sm"
                      style={{
                        borderRadius: "10px",
                        height: "138px",
                        width: "100%",
                        maxWidth: "138px",
                        background: "none",
                        cursor: "pointer",
                        border:
                          selectedCard === index ? "2px solid blue" : "none",
                        transform: "scale(1.1)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                      onClick={() => handleTypeSelect(option.value, index)}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        {getIcon()}

                        <Card.Title
                          className="mt-2 solutioncards"
                          style={{
                            textAlign: "center",
                            wordBreak: "break-word",
                          }}
                        >
                          {option.label}
                        </Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <form className="form">
              {/* ==== TYPE DROPDOWN – visible ONLY on edit ==== */}
              {currentItem && (
                <div className="name mb-3">
                  <label htmlFor="typeSelect" className="form-label">
                    {t("destination_type")}
                    <small
                      style={{
                        color: "red",
                        fontSize: "15px",
                        marginLeft: "2px",
                      }}
                    >
                      *
                    </small>
                  </label>

                  <Select
                    id="typeSelect"
                    className="my-select destination-select-dropdown"
                    classNamePrefix="select"
                    value={type}
                    onChange={(selected) => {
                      setType(selected);
                      const idx = typeOptions.findIndex(
                        (o) => o.value === selected.value
                      );
                      setSelectedCard(idx);
                    }}
                    options={typeOptions}
                    isSearchable
                    placeholder={t("destination.selectType")}
                    // ----------------------------------------------------
                    //  Show the icon + label inside the dropdown
                    // ----------------------------------------------------
                    formatOptionLabel={(option) => {
                      const Icon = (() => {
                        switch (option.value) {
                          case "Business opportunity":
                            return (
                              <IoIosBusiness
                                style={{ width: 22, height: 22 }}
                              />
                            );
                          case "Study":
                            return (
                              <FaBookOpen style={{ width: 22, height: 22 }} />
                            );
                          case "Audit":
                            return (
                              <AiOutlineAudit
                                style={{ width: 22, height: 22 }}
                              />
                            );
                          case "Project":
                            return (
                              <IoIosRocket style={{ width: 22, height: 22 }} />
                            );
                          case "Accompagnement":
                            return (
                              <MdOutlineSupport
                                style={{ width: 22, height: 22 }}
                              />
                            );
                          case "Event":
                            return (
                              <MdEventAvailable
                                style={{ width: 22, height: 22 }}
                              />
                            );
                          case "Formation":
                            return (
                              <FaChalkboardTeacher
                                style={{ width: 22, height: 22 }}
                              />
                            );
                          case "Recruitment":
                            return <MdWork style={{ width: 22, height: 22 }} />;
                          case "Objective":
                            return (
                              <FaBullseye style={{ width: 22, height: 22 }} />
                            );
                          case "Assistant Conversation":
                            return (
                              <FaRobot style={{ width: 22, height: 22 }} />
                            );
                          case "Agenda":
                          case "Messagerie":
                            return (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="#F19C38"
                              >
                                <path d="M7.5 5.6L10 0L12.5 5.6L18.1 8.1L12.5 10.6L10 16.2L7.5 10.6L1.9 8.1L7.5 5.6Z"/>
                                <path d="M17.5 15.6L19.1 12.1L20.7 15.6L24.2 17.2L20.7 18.8L19.1 22.3L17.5 18.8L14 17.2L17.5 15.6Z"/>
                              </svg>
                            );

                          case "Assistant Conversation":
                            return (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="#F19C38"
                              >
                                <path d="M7.5 5.6L10 0L12.5 5.6L18.1 8.1L12.5 10.6L10 16.2L7.5 10.6L1.9 8.1L7.5 5.6Z"/>
                                <path d="M17.5 15.6L19.1 12.1L20.7 15.6L24.2 17.2L20.7 18.8L19.1 22.3L17.5 18.8L14 17.2L17.5 15.6Z"/>
                              </svg>
                            );  

                          case "Other":
                            return (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 512 512"
                                fill="#DAE6ED"
                              >
                                <path d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z" />
                              </svg>
                            );
                          default:
                            return null;
                        }
                      })();

                      return (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {Icon && (
                            <span style={{ color: "#DAE6ED" }}>{Icon}</span>
                          )}
                          <span>{option.label}</span>
                        </div>
                      );
                    }}
                  />
                </div>
              )}
              {!currentItem && (
                <div
                  className="name"
                  style={{ position: "relative", zIndex: 3 }}
                >
                  <label htmlFor="" className="form-label">
                    Client
                    <small
                      style={{
                        color: "red",
                        fontSize: "15px",
                        marginLeft: "2px",
                      }}
                    >
                      *
                    </small>
                  </label>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="client-tooltip">
                        💡 Commencez à taper pour rechercher un client existant
                        ou en créer un nouveau automatiquement.
                      </Tooltip>
                    }
                  >
                    <div>
                      <Creatable
                        className="my-select destination-select-dropdown"
                        classNamePrefix="select"
                        onChange={(option, actionMeta) => {
                          if (option) {
                            if (actionMeta.action === "create-option") {
                              setDestinationClient(option.label);
                              setDestinationClientId(null);
                            } else {
                              setDestinationClient(option.label);
                              setDestinationClientId(option.value);
                            }
                          } else {
                            setDestinationClient(null);
                            setDestinationClientId(null);
                          }
                        }}
                        value={
                          destinationClientId
                            ? groupedOptions.find(
                              (opt) =>
                                Number(opt.value) ===
                                Number(destinationClientId)
                            )
                            : destinationClient
                              ? {
                                label: destinationClient,
                                value: destinationClient,
                              }
                              : null
                        }
                        options={groupedOptions}
                        isClearable
                        formatOptionLabel={(option, { context }) => (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
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
                      />
                    </div>
                  </OverlayTrigger>
                </div>
              )}

              <div className="name">
                <label htmlFor="" className="form-label">
                  {t("client_need")}
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>
                </label>
                <input
                  type="text"
                  value={clientNeed}
                  onChange={(e) => setClientNeed(e.target.value)}
                />
              </div>

              <div className="description mt-4">
                <label className="form-label d-block">
                  Liens
                  <small style={{ color: "#6c757d", fontSize: "12px", marginLeft: "4px" }}>
                    (missions associées)
                  </small>
                </label>

                <Select
                  isMulti
                  className="my-select"
                  classNamePrefix="select"
                  placeholder="Sélectionner une ou plusieurs missions..."
                  options={missions}
                  value={missions.filter(m => selectedLinkedMissions.includes(m.value))}
                  onChange={(selected) => {
                    setSelectedLinkedMissions(selected ? selected.map(o => o.value) : []);
                  }}
                  isLoading={missions.length === 0}
                  noOptionsMessage={() => "Aucune mission disponible"}
                />
              </div>
              <div className="description">
                <label htmlFor="">{t("destination_desc")}</label>
                <textarea
                  placeholder={t("Enter Description")}
                  value={destinationDescription}
                  onChange={(e) => setDestinationDescription(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="name">
                    <label className="form-label">
                      {t("destination_end_date")}
                    </label>
                    <DatePicker
                      selected={destinationTime}
                      onChange={(date) => setDestinationTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy, HH:mm"
                      timeCaption="Time"
                      locale="fr"
                      placeholderText="Select date and time"
                      className="your-custom-class"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="name">
                    <label htmlFor="" className="form-label">
                      {t("destination_budget")}?
                    </label>
                    <div
                      className="input-group"
                      style={{ display: "flex", width: "100%" }}
                    >
                      <input
                        type="number"
                        value={budgetInitial}
                        onChange={(e) => setBudgetInitial(e.target.value)}
                        className="form-control"
                        style={{ flex: "4" }}
                      />
                      <select
                        name="currency"
                        className="form-select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{ width: "50px" }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/*     
                  <div className="description" style={{ marginTop: "15px" }}>
                    <label htmlFor="clientImage" className="form-label">
                      Client Image
                    </label>
                    <input
                      type="file"
                      id="clientImage"
                      accept="image/*"
                      ref={clientImageFileInputRef}
                      onChange={handleClientImageUpload}
                      className="form-control"
                    />
                    {clientImage && (
                      <div style={{ marginTop: "10px" }}>
                        <img
                          src={clientImage}
                          alt="Client Preview"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      </div>
                    )}
                  </div> */}

              {/* ── NEW MISSION PRIVACY ── */}
              <div className="description mt-4">
                <label className="form-label d-block">
                  {t("mission_privacy") || "Mission Privacy"}
                  {/* <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small> */}
                </label>

                <div className="d-flex flex-column gap-2">
                  {["Private", "Enterprise", "Teams"].map((opt) => (
                    <div key={opt} className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="missionPrivacy"
                        id={`privacy-${opt}`}
                        checked={missionPrivacy === opt}
                        onChange={() => {
                          setMissionPrivacy(opt);
                          if (opt !== "Teams") setSelectedTeams([]);
                        }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`privacy-${opt}`}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}
                </div>

                {missionPrivacy === "Teams" && (
                  <div className="mt-3">
                    <Select
                      isMulti
                      className="my-select"
                      classNamePrefix="select"
                      placeholder="Select teams..."
                      options={teamsOptions}
                      value={teamsOptions.filter((o) =>
                        selectedTeams.includes(o.value)
                      )}
                      onChange={(selected) => {
                        setSelectedTeams(
                          selected ? selected.map((s) => s.value) : []
                        );
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="description">
                <label htmlFor="">{t("Banner")}</label>
                <div
                  className="upload-container"
                  onClick={triggerFileInput}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    border: "2px dashed #ccc",
                    textAlign: "center",
                    borderRadius: "5px",
                    height: "200px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {!croppedimage ? (
                    <>
                      <IoImages
                        style={{ color: "#0026b1", fontSize: "24px" }}
                      />
                      <span
                        style={{
                          fontSize: "15px",
                          color: "#0026b1",
                          marginLeft: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("invities.uploadImg")}
                      </span>
                    </>
                  ) : (
                    <img
                      src={croppedimage}
                      alt="Selected"
                      style={{ width: "100%", height: "auto" }}
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
              </div>

              <div className="d-flex justify-content-end gap-3">
                {!currentItem && (
                  <div className="mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id="createAnotherCheckbox"
                      checked={createAnother}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="createAnotherCheckbox"
                    >
                      {t("meeting.formState.CreateAnother")}
                    </label>
                  </div>
                )}
                <Button
                  variant="danger"
                  onClick={() => {
                    currentItem ? handleCloseModal() : setStep(1);
                  }}
                >
                  {t("Cancel")}
                </Button>
                <button
                  className="btn"
                  type="button"
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
                  onClick={() => {
                    currentItem
                      ? updateDestination(currentItem)
                      : createDestination();
                  }}
                >
                  {loading ? (
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
                      {currentItem
                        ? t("invities.update")
                        : t("invities.create")}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {image && (
        <ImageEditorModal
          show={showModal}
          handleClose={handleModalClose}
          selectedImage={image}
          setImage={setImage}
          setcroppedImage={setcroppedImage}
        />
      )}
    </>
  );
};

export default AddDestination;
