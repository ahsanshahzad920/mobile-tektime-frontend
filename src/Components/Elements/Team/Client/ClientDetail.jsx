import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MomentCard from "./../../Meeting/CurrentMeeting/components/MomentCard";
import moment from "moment";
import { RiEditBoxLine } from "react-icons/ri";
import { AiOutlineAudit, AiOutlineDelete } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import { BiDotsVerticalRounded } from "react-icons/bi";
import DestinationCard from "../../Meeting/CurrentMeeting/components/DestinationCard";
import {
  Button,
  Dropdown,
  Spinner,
  Modal,
  Form,
  Card,
  Container,
  Row,
  Col,
  Badge,
  Image,
  InputGroup,
  FormControl,
  Tab,
  Nav,
} from "react-bootstrap";
import { FaArrowRight, FaCalendarAlt, FaFileUpload, FaRobot } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { FiInfo } from "react-icons/fi";
import { FaBookOpen } from "react-icons/fa6";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { MdOutlineSupport } from "react-icons/md";
import { format } from "date-fns";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr"; // replace with your locale if needed
import { IoImages } from "react-icons/io5";
import ImageEditorModal from "../../Invities/ImageEditorModal";
import { toast } from "react-toastify";
import { Avatar } from "antd";
import CreateClient from "../CreateClient";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import Contact from "../Contact";
import FacturationClientForm from "../../Invities/DestinationToMeeting/FacturationClient";


// Optional: register the locale
registerLocale("fr", fr);

const ClientDetail = () => {
  const { id } = useParams();
  const location = useLocation()
  const [client, setClient] = useState({});
  const [clientTypes, setClientTypes] = useState({}); // Initialize as empty object
  const [loading, setLoading] = useState(true);
  const [t] = useTranslation("global");
  const [show, setShow] = useState(false);


  let fromCasting = false;
  if (location?.state?.from === "Casting") {
    fromCasting = true;
  }
  const navigate = useNavigate();
  const getClient = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-client-destination/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setClient(response.data?.data);
        setClientTypes(response.data?.destination_type_counts || {}); // Fallback to empty object
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getClient();
  }, [id]);

  const typeOptions = [
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
      value: "Messagerie",
      label: t("destination.messagerie"),
    },
    {
      value: "Agenda",
      label: t("destination.Agenda"),
    },
    {
      value: "Assistant Conversation",
      label: t("destination.assistantConversation"),
    },

  ];
  // Mission modal states
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionStep, setMissionStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const toggle = () => setShow(!show);
  const handleClose = () => setShow(false);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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

  const [image, setImage] = useState(null);
  const [croppedimage, setcroppedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = React.useRef(null);
  const handleModalClose = () => {
    setShowModal(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const [clientDestinations, setClientDestinations] = useState(null);

  const [groupedDestinations, setGroupedDestinations] = useState({});

  useEffect(() => {
    if (clientDestinations?.destinations) {
      const grouped = clientDestinations.destinations.reduce((acc, dest) => {
        const type = dest.destination_type || "Other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(dest);
        return acc;
      }, {});
      setGroupedDestinations(grouped);
    }
  }, [clientDestinations]);

  const [destinationTime, setDestinationTime] = useState(new Date());
  // Update your form state initialization
  const [formData, setFormData] = useState({
    client_need: "", // Changed from clientNeed
    destination_description: "", // Changed from details
    initial_budget: "", // Changed from budget
    currency: "EUR",
    milestones: "",
    banner: null,
    client_id: id,
  });

  const [createAnother, setCreateAnother] = useState(false);
  const handleCheckboxChange = (e) => {
    setCreateAnother(e.target.checked);
  };

  const handleSubmitMission = async (e) => {
    e.preventDefault();
    const user_id = parseInt(CookieService.get("user_id"));

    try {
      // Prepare FormData for file upload
      const formPayload = new FormData();
      formPayload.append("client_id", id);
      formPayload.append("client", client?.name || "");
      formPayload.append("destination_name", formData.client_need);
      formPayload.append("client_need", formData.client_need);
      formPayload.append("destination_type", selectedType);
      formPayload.append(
        "destination_description",
        formData.destination_description
      );
      formPayload.append("initial_budget", formData.initial_budget || 0);
      formPayload.append("user_id", user_id);
      formPayload.append("currency", formData.currency);
      formPayload.append("timezone", moment.tz.guess());

      // Add date if selected
      if (destinationTime) {
        formPayload.append(
          "destination_end_date_time",
          moment(destinationTime).format("YYYY-MM-DD HH:mm:ss")
        );
      }

      // Add banner image if cropped
      if (croppedimage) {
        const base64Response = await fetch(croppedimage);
        const blob = await base64Response.blob();
        formPayload.append("banner", blob, "banner.jpg");
      }

      // API call to create mission
      const response = await axios.post(
        `${API_BASE_URL}/destinations`,
        formPayload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Close modal and reset form
        setMissionStep(1);
        setSelectedType(null);
        setFormData({
          client_need: "",
          destination_description: "",
          initial_budget: "",
          currency: "EUR",
          milestones: "",
          banner: null,
          client_id: id,
        });
        setDestinationTime(null);
        setcroppedImage(null);
        if (!createAnother) {
          setShowMissionModal(false);
        }
        // Refresh client data
        getClient();
        getDestinationsByType(activeTab);

        // Show success message
        toast.success(t("destination.destinationCreateMsg"));
      }
    } catch (error) {
      console.error("Error creating mission:", error);
      toast.error(t("destination.createError"));
    }
  };
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  // Delete button click handler
  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setClientToDelete(id);
    setShowDeleteModal(true);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/clients/${clientToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response?.status) {
        toast.success(t("clientDeletedSuccess"));
        navigate("/Invities");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error(error?.response?.data?.message || t("serverError"));
    } finally {
      setShowDeleteModal(false);
    }
  };

  const desiredOrder = [
    "opportunity",
    "study",
    "audit",
    "project",
    "support",
    "other",
    "absences",
    "recruitment",
    "objective",
    "event",
    "formation",
    "messagerie",
    "agenda",
    "Assistant Conversation"

  ];

  const typeKeyMap = {
    "Business opportunity": "opportunity",
    Study: "study",
    Audit: "audit",
    Project: "project",
    Accompagnement: "support",
    Other: "other",
    Absences: "absences",
    "Event": "event",
    "Objective": "objective",
    "Formation": "formation",
    "Recruitment": "recruitment",
    "Messagerie": "messagerie",
    "Agenda": "agenda",
    "Assistant Conversation": "Assistant Conversation"
  };
  // State for destinations loading and data
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [destinationsByType, setDestinationsByType] = useState({});
  const [activeTab, setActiveTab] = useState("contacts");

  const [filteredDestinationTypes, setFilteredDestinationTypes] = useState([]);
  // Function to fetch destinations by type
  const getDestinationsByType = async (type) => {
    setLoadingDestinations(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-client-destination/${id}?type=${encodeURIComponent(
          type
        )}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        // Update only the destinations for this specific type
        setClient((prev) => ({
          ...prev,
          destinations: response.data.data?.destinations || [],
        }));
        setClientDestinations((prev) => ({
          ...prev,
          destinations: response.data.data?.destinations || [],
        }));
        setDestinationsByType((prev) => ({
          ...prev,
          [type]: response.data.data?.destinations || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      // On error, ensure we don't show stale data
      setClient((prev) => ({
        ...prev,
        destinations: [],
      }));
      setDestinationsByType((prev) => ({
        ...prev,
        [type]: [],
      }));
    } finally {
      setLoadingDestinations(false);
    }
  };
  // Handle tab changes
  useEffect(() => {
    if (activeTab && activeTab !== "contacts") {
      getDestinationsByType(activeTab);
    }
  }, [activeTab]);


  // Initialize tabs and load first tab's data
  useEffect(() => {
    if (clientTypes && Object.keys(clientTypes).length > 0) {
      const filtered = Object.entries(clientTypes)
        .filter(([_, count]) => count > 0)
        .map(([type]) => type)
        .sort((a, b) => {
          const aKey = typeKeyMap[a] || "zzz";
          const bKey = typeKeyMap[b] || "zzz";
          return desiredOrder.indexOf(aKey) - desiredOrder.indexOf(bKey);
        });

      setFilteredDestinationTypes(filtered);

      // Set the first tab as active if not already set
      if (filtered.length > 0 && !activeTab) {
        setActiveTab(filtered[0]);
      }
    }
  }, [clientTypes]);

  const [contacts, setContacts] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // const getContacts = async () => {
  //   const token = CookieService.get("token");
  //   try {
  //     setContactLoading(true);
  //     const response = await axios.get(`${API_BASE_URL}/contacts`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (response.status === 200) {
  //       const clients = response?.data?.data;
  //       setContacts(clients);
  //     }
  //   } catch (error) {
  //     toast.error(t(error?.response?.data?.errors[0] || error?.message));
  //   } finally {
  //     setContactLoading(false);
  //   }
  // };
  const getContacts = async () => {
    const token = CookieService.get("token");
    try {
      setContactLoading(true);
      const response = await axios.get(`${API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const allContacts = response?.data?.data;

        // Filter only contacts where clients?.id matches paramId
        const filteredContacts = allContacts.filter(
          (contact) => contact?.clients?.id == id // use == to match number or string
        );

        setContacts(filteredContacts);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setContactLoading(false);
    }
  };


  useEffect(() => {
    getContacts();
  }, []);
  const user = JSON.parse(CookieService.get("user"));

  const userId = parseInt(CookieService.get("user_id"));



  return (
    <>
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="invite w-100 current_destinations clients-tab"
          style={{
            position: "static",
            backgroundColor: "white",
            padding: "10px 15px",
          }}
        >
          <div className="row child-1 mb-5">
            <div className="col-md-6 w-100">
              <>
                {/* <div className="title mb-1">
                  <Link to={fromCasting ? `/Team` :`/invities`}>{fromCasting ? 'Casting' : 'Missions'}</Link>
                  <span> / </span>

                  <Link
                    to={client?.linked_to === "users" ? "/invities" : "/Team"}
                  >
                    {client?.linked_to === "user"
                      ? t("My Clients")
                      : user?.enterprise?.name}
                  </Link>
                </div> */}
                <div className="title mb-1">
                  {/* Compute the label + decide whether to render Link + span */}
                  {(() => {
                    let user = null;
                    try {
                      const userJson = CookieService.get("user");
                      if (userJson) user = JSON.parse(userJson);
                    } catch (e) {
                      console.warn("Failed to parse user", e);
                    }

                    const userNeeds = user?.user_needs || [];
                    const hasCastingNeed = Array.isArray(userNeeds)
                      ? userNeeds.some(n => n.need === "casting_need")
                      : false;
                    const hasMissionNeed = Array.isArray(userNeeds)
                      ? userNeeds.some(n => n.need === "mission_need")
                      : false;

                    // Determine label
                    let label = "";

                    if (user?.role_id === 1 || user?.role_id === 2 || user?.role_id === 3) {
                      label = "Casting";
                    } else if (hasCastingNeed) {
                      label = "Casting";
                    } else if (hasMissionNeed) {
                      label = "Missions";
                    }

                    // Only render if we have a valid label
                    if (!label) return null;

                    return (
                      <>
                        <Link to={fromCasting || label === "Casting" ? "/Team" : "/invities"}>
                          {label}
                        </Link>
                        <span> / </span>
                      </>
                    );
                  })()}

                  {/* Second link (always shown) */}
                  <Link to={client?.linked_to === "users" ? "/invities" : "/Team"}>
                    {client?.linked_to === "user" ? t("My Clients") : user?.enterprise?.name}
                  </Link>
                </div>
                <div className="invite-header d-flex align-items-start">
                  <div
                    // style={{
                    //   marginTop: 0,
                    //   width: "80%",
                    // }}
                    className="col-md-8 d-flex flex-column"
                  >
                    <h5 className="content-heading-title w-100">
                      {client?.name}
                    </h5>

                    <div className="items">
                      <div className="type">
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
                          {t(`invities.${client?.type?.toLowerCase()}`)}
                          {client?.groupe && ` - ${t(`invities.group_options.${client.groupe}`)}`}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 content-body ms-1 mt-3 mb-2 mt-lg-3">
                      <div className="d-flex align-items-center gap-2">
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
                          {t("Created on")}:
                        </span>
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                        />
                        <span className="time">
                          {moment(client?.created_at)
                            .tz(moment.tz.guess())
                            .format("DD/MM/YYYY [at] HH[h]mm")}
                        </span>
                        &nbsp;
                        <span>{moment.tz.guess()}</span>
                      </div>
                    </div>

                    {/*                     <div className="row">
                      <div className="col-md-12 mt-2 d-flex align-items-center gap-3 ms-1">
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
                          {t("Creator")}:
                        </span>
                        <div className="">
                          <div className="d-flex align-items-center flex-wrap">
                            <Avatar
                              size="large"
                              src={
                                client?.created_by?.image?.startsWith("http")
                                  ? client?.created_by?.image
                                  : Assets_URL + "/" + client?.created_by?.image
                              }
                            />

                            <span className="creator-name">
                              {client?.created_by?.full_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div> */}

                    {/* Additional Client Information Section */}
                    <div className="row mt-3">
                      <div className="col-md-12">
                        {/* SIRET Number */}
                        {client?.siret_number && (
                          <div className="mb-2 d-flex align-items-center gap-3">
                            <span className="text-muted small">
                              {" "}
                              {t("Siret Number")}:
                            </span>
                            <p className="mb-0">
                              {client?.siret_number || "Not provided"}
                            </p>
                          </div>
                        )}
                        {/* VAT Number */}
                        {client?.vat_number && (
                          <div className="mb-2 d-flex align-items-center gap-3">
                            <span className="text-muted small">
                              {t("Vat Number")}:
                            </span>
                            <p className="mb-0">
                              {client?.vat_number || "Not provided"}
                            </p>
                          </div>
                        )}

                        {/* Billing Address */}
                        {client?.mailing_address && (
                          <div className="mb-2 d-flex align-items-center gap-3">
                            <span className="text-muted small">
                              {" "}
                              {t("Billing Address")}:
                            </span>
                            <p className="mb-0">
                              {client?.mailing_address || "Not provided"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12 mt-2 d-flex align-items-center gap-3 ms-1">
                        <div className="paragraph-parent mt-2 ms-1  w-100">
                          <span className="paragraph paragraph-images">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: client?.client_need_description || "",
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="col-md-4 d-flex justify-content-end"
                    style={{ height: "100%" }}
                  >
                    {/* Rejoindre la réunion */}
                    <div className="play-btn-container d-flex flex-column align-items-center gap-3">
                      {client?.client_logo && (
                        <img
                          src={
                            client?.client_logo?.startsWith("http")
                              ? client?.client_logo
                              : Assets_URL + "/" + client?.client_logo
                          }
                          alt="client logo"
                          className="rounded-circle logo-clickable"
                          style={{
                            width: "170px",
                            height: "170px",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   const currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                        //   copy(currentURL);
                        //   openLinkInNewTab(currentURL);
                        // }}
                        />
                      )}

                      <div className="d-flex gap-2">
                        <button
                          className="btn"
                          onClick={() => toggle(client)}
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
                          <RiEditBoxLine size={16} /> &nbsp;
                          {t("dropdown.To modify")}
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={(e) => handleDeleteClick(e, client?.id)}
                          style={{
                            fontSize: "14px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                          }}
                        >
                          <AiOutlineDelete size={16} /> &nbsp;
                          {t("dropdown.Delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>

          <Tab.Container
            className="destination-tabs-container"
            activeKey={activeTab}
            onSelect={(key) => {
              setActiveTab(key);
            }}
          >
            <div className="row align-items-center tabs-header custom-tabs">
              {/* Tabs Column (9) */}
              <div className="col-md-9">
                <Nav variant="tabs" className="d-flex flex-wrap">
                  <Nav.Item key="contacts" className="tab">
                    <Nav.Link eventKey="contacts" className="custom-tab-link">
                      {t("Contacts")}
                      <span className="ms-2">{contacts?.length || 0}</span>
                    </Nav.Link>
                  </Nav.Item>
                  {filteredDestinationTypes.map((type) => (
                    <Nav.Item key={type} className="tab">
                      <Nav.Link eventKey={type} className="custom-tab-link">
                        {t(`destination_types.${typeKeyMap[type]}`)}
                        <span
                          className={`ms-2 px-2 py-1 rounded
        ${activeTab === type ? "future" : "draft"}
        `}
                        // style={{
                        //   backgroundColor: activeTab === type ? '#cce5ff' : '#d6d8db', // light blue or light black/grey
                        //   color: activeTab === type ? '#004085' : '#343a40'            // optional: dark blue or dark grey
                        // }}
                        >
                          {clientTypes[type] || 0}
                        </span>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                  <Nav.Item key="billing" className="tab">
                    <Nav.Link eventKey="billing" className="custom-tab-link">
                      {t(
                        "destination.destinationToMeeting.Facturation Tab"
                      )}
                      {/* <span className="ms-2">{contacts?.length || 0}</span> */}
                    </Nav.Link>
                  </Nav.Item>

                  {/* Contacts tab - ALWAYS include this */}
                </Nav>
              </div>
            </div>
            <div className="row mt-3">

              <div className="col-md-12 d-flex justify-content-start mt-1">
                {activeTab === "contacts" ? (
                  <>
                    <Button
                      className="btn play-btn me-2"
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
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => setShowImportModal(true)}
                    >
                      <span>
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
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </span>{" "}
                      &nbsp;{t("Import Contact")}
                    </Button>
                    <Button
                      className="btn play-btn me-2"
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
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => setShowContactModal(true)}
                    >
                      <span>
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
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </span>{" "}
                      &nbsp;{t("Team.Add Contact")}
                    </Button>
                    <Button
                      className="btn play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMissionModal(true);
                        setMissionStep(1);
                        setSelectedType(null);
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
                        whiteSpace: "nowrap",
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
                      {t("Add Mission")}
                      <FaArrowRight
                        size={12}
                        style={{
                          marginLeft: ".5rem",
                          fontWeight: 700,
                        }}
                      />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="btn play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMissionModal(true);
                      setMissionStep(1);
                      setSelectedType(null);
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
                      whiteSpace: "nowrap",
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
                    {t("Add Mission")}
                    <FaArrowRight
                      size={12}
                      style={{
                        marginLeft: ".5rem",
                        fontWeight: 700,
                      }}
                    />
                  </Button>
                )}
              </div>
            </div>

            <Tab.Content className="mt-3">
              {/* Render dynamic panes for each filtered destination type */}
              {filteredDestinationTypes.map((type) => (
                <Tab.Pane eventKey={type} key={type}>
                  {activeTab === type ? (
                    <div
                      className="row d-flex justify-content-center"
                      style={{
                        height: loadingDestinations ? "100px" : "",
                      }}
                    >
                      {loadingDestinations ? (
                        <div className="d-flex justify-content-center">
                          <Spinner
                            animation="border"
                            role="status"
                            color="#2c48ae"
                          />
                        </div>
                      ) : clientDestinations?.destinations?.length > 0 ? (
                        clientDestinations.destinations.map((destination) => (
                          <div className="col-md-12 mb-3" key={destination.id}>
                            <DestinationCard
                              destination={destination}
                              client={client}
                              refreshClient={getClient}
                              refreshMission={getDestinationsByType}
                              activeTab={activeTab}
                            />
                          </div>
                        ))
                      ) : (
                        <p>{t("No destinations found for this type")}</p>
                      )}
                    </div>
                  ) : null}
                </Tab.Pane>
              ))}

              {/* Static Contacts Tab */}
              <Tab.Pane eventKey="contacts">
                {activeTab === "contacts" && (
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <Contact
                        contacts={contacts}
                        loading={contactLoading}
                        getContacts={getContacts}
                        setShowContactModal={setShowContactModal}
                        showContactModal={showContactModal}
                        setShowImportModal={setShowImportModal}
                        showImportModal={showImportModal}
                        fromClient={true}
                        clientId={client?.id}
                      />
                    </div>
                  </div>
                )}
              </Tab.Pane>


              {/* Static Contacts Tab */}
              <Tab.Pane eventKey="billing">
                {activeTab === "billing" && (
                  <FacturationClientForm
                    client={client}
                    loggedInUserId={userId}
                  />
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      )}

      {showMissionModal && (
        <Modal
          show={showMissionModal}
          onHide={() => setShowMissionModal(false)}
          size={missionStep === 1 ? "md" : "lg"}
          centered
          backdrop="static"
          className="create-destination-modal"
        >
          <Modal.Header className="border-0 pb-0">
            <Modal.Title style={{ fontSize: "20px" }}>
              {missionStep === 1
                ? t("Select Mission Type")
                : `${t("Create")} ${t(`des_type.${selectedType}`)} ${t(
                  "for"
                )} ${client?.name}`}
            </Modal.Title>
            <Button
              variant="link"
              onClick={() => {
                setSelectedCard(null);
                setShowMissionModal(false);
              }}
              className="position-absolute end-0 top-0 pe-3 pt-2"
            >
              <RxCross2 size={20} />
            </Button>
          </Modal.Header>

          <Modal.Body>
            {missionStep === 1 ? (
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

                         case "Assistant Conversation":
                      return (
                        <FaRobot
                          style={{ width: "37px", height: "36px" }}
                          color="#DAE6ED"
                        />
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
                            <g>
                              <g>
                                <g>
                                  <path
                                    d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
				h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
				L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
				h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
				c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
				c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
				C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
				c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
				c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
				l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
				l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
				c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
				l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
                                    fill="#DAE6ED"
                                  />
                                  <path
                                    d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
				c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
				l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
				l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
				l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
				s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
                                    fill="#DAE6ED"
                                  />
                                  <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
                                  <rect x="288" y="64" width="32" height="16" />
                                  <path
                                    d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
                                    fill="#DAE6ED"
                                  />
                                  <rect
                                    x="240"
                                    y="160"
                                    width="32"
                                    height="16"
                                  />
                                  <rect
                                    x="288"
                                    y="160"
                                    width="32"
                                    height="16"
                                  />
                                </g>
                              </g>
                            </g>
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
                          maxWidth: "138px", // Set max width
                          background: "none",
                          cursor: "pointer",
                          border:
                            selectedCard === index ? "2px solid blue" : "none",
                          transform: "scale(1.1)", // Scale the card size up
                          transition: "transform 0.2s ease-in-out", // Smooth transition on hover
                        }}
                        onClick={() => {
                          setSelectedCard(index);
                          setSelectedType(option.value);
                          setMissionStep(2);
                        }}
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
              <Form onSubmit={handleSubmitMission} className="form">
                {/* <Form.Group className="mb-3">
                  <Form.Label>Client</Form.Label>
                  <Form.Control
                    type="text"
                    value={client?.name || ""}
                    readOnly
                  />
                </Form.Group> */}

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
                    name="client_need"
                    value={formData.client_need}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="description">
                  <label htmlFor="">{t("destination_desc")}</label>
                  <textarea
                    name="destination_description"
                    value={formData.destination_description}
                    onChange={handleFormChange}
                    placeholder={t("Enter Description")}
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
                          name="initial_budget"
                          value={formData.initial_budget}
                          onChange={handleFormChange}
                          className="form-control"
                          style={{ flex: "4" }}
                        />
                        <select
                          name="currency"
                          className="form-select"
                          value={formData.currency}
                          onChange={handleFormChange}
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
                  <Button variant="danger" onClick={() => setMissionStep(1)}>
                    {t("Cancel")}
                  </Button>
                  <button
                    className="btn"
                    type="submit"
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
                    {t("Create")}
                  </button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>
      )}

      {image && (
        <ImageEditorModal
          show={showModal}
          handleClose={handleModalClose}
          selectedImage={image}
          setImage={setImage}
          setcroppedImage={setcroppedImage}
        />
      )}

      {show && (
        <CreateClient
          show={show}
          close={handleClose}
          client={client}
          setClient={setClient}
          getClients={getClient}
          refreshMission={getDestinationsByType}
          type={activeTab}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          message={t("clientDeletedToast")}
          onConfirm={handleDeleteConfirm}
          onCancel={(e) => {
            e.stopPropagation();
            setShowDeleteModal(false);
            setClientToDelete(null); // Reset the client after cancel
          }}
        />
      )}
    </>
  );
};

export default ClientDetail;
