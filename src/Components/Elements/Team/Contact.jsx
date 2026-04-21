import CookieService from "../../Utils/CookieService";
import React, { useState, useEffect } from "react";
import {
  FaList,
  FaTh,
  FaSearch,
  FaCog,
  FaEdit,
  FaCalendarAlt,
  FaCheckSquare,
} from "react-icons/fa";
import TeamCard from "./TeamCard";
import ListContact from "./ListContact";
import {
  Button,
  Modal,
  Row,
  Col,
  Dropdown,
  Form,
  OverlayTrigger,
  Tooltip,
  Tabs,
  Tab,
} from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import Creatable from "react-select/creatable";
import CSVImportStepper from "./CSVImportStepper";
import CustomFieldsComponent from "./CustomFieldsComponent";
import { FaFont, FaHashtag, FaPlus } from "react-icons/fa6";
import Select from "react-select";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

const Contact = ({
  contacts,
  loading,
  showContactModal,
  setShowContactModal,
  getContacts,
  showImportModal,
  setShowImportModal,
  fromClient = false,
  clientId = null,
  getTeams,
}) => {
  const [isCardView, setIsCardView] = useState(true);
  const [editingContact, setEditingContact] = useState(null);
  console.log("editingContact", editingContact);
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("contactList");
  const [selectedType, setSelectedType] = useState("All");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    post: "",
    organization: "",
    phone: "",
    type: "New",
    customFields: [], // Add this line
  });

  console.log("formData", formData);
  const handleCustomFieldsChange = (fields) => {
    setFormData({ ...formData, customFields: fields });
  };

  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    getParticipants();
  }, []);

  // Fetch participants for email suggestions
  const getParticipants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/participants-email`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response) {
        setEmailSuggestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };
  const handleToggle = (viewType) => {
    setIsCardView(viewType === "card");
  };

  useEffect(() => {
    if (selectedType !== "All" && contacts) {
      const typeExists = contacts.some((c) => c.type === selectedType);
      if (!typeExists) {
        setSelectedType("All");
      }
    }
  }, [contacts, selectedType]);

  // Add this useEffect to fetch custom fields when modal opens
  // useEffect(() => {
  //   if (showContactModal) {
  //     fetchCustomFieldsForForm();
  //   }
  // }, [showContactModal]);

  // const fetchCustomFieldsForForm = async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/get-contacts-custom-fields`, {
  //       headers: {
  //         Authorization: `Bearer ${CookieService.get("token")}`
  //       }
  //     });

  //     if (response.data && response.data.success) {
  //       // Initialize custom fields with empty values
  //       const fieldsWithValues = response.data.data.map(field => ({
  //         id: field.id,
  //         name: field.name,
  //         type: field.type,
  //         value: '' // Initialize with empty value
  //       }));

  //       setFormData(prev => ({
  //         ...prev,
  //         customFields: fieldsWithValues
  //       }));
  //     }
  //   } catch (err) {
  //     console.error("Error fetching custom fields:", err);
  //   }
  // };

  // Add this useEffect to fetch custom fields when modal opens
  // useEffect(() => {
  //   if (showContactModal) {
  //     fetchCustomFieldsForForm().then(availableFields => {
  //       if (editingContact) {
  //         // For editing contact, merge with existing values
  //         const mergedCustomFields = availableFields.map(availableField => {
  //           const contactField = editingContact.custom_fields?.find(
  //             cf => cf.name === availableField.name
  //           );
  //           return {
  //             ...availableField,
  //             value: contactField ? contactField.value : ''
  //           };
  //         });

  //         setFormData(prev => ({
  //           ...prev,
  //           customFields: mergedCustomFields
  //         }));
  //       } else {
  //         // For new contact, just set the available fields with empty values
  //         setFormData(prev => ({
  //           ...prev,
  //           customFields: availableFields
  //         }));
  //       }
  //     });
  //   }
  // }, [showContactModal, editingContact]);

  // Update fetchCustomFieldsForForm to return the fields
  const fetchCustomFieldsForForm = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-contacts-custom-fields`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.data && response.data.success) {
        return response.data.data.map((field) => ({
          id: field.id, // Use the ID from the server
          name: field.name,
          type: field.type,
          value: field.value || "", // Use existing value or empty string
        }));
      }
      return [];
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      return [];
    }
  };
  const renderFieldInput = (field) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            className="form-control"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="form-control"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );
      case "date":
        return (
          <input
            type="date"
            className="form-control"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      default:
        return (
          <input
            type="text"
            className="form-control"
            value={field.value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );
    }
  };

  const handleCustomFieldChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((field) =>
        field.id === fieldId ? { ...field, value } : field,
      ),
    }));
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (value.length > 1) {
      const filtered = emailSuggestions.filter((contact) =>
        contact.email?.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (filteredSuggestions.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
      );
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
    // Enter
    else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectEmail(filteredSuggestions[activeSuggestionIndex]);
    }
  };

  const selectEmail = (contact) => {
    console.log("contact", contact);
    setFormData({
      email: contact.email,
      firstName: contact.first_name || "",
      lastName: contact.last_name || "",
      post: contact.post || "",
      organization: contact.organization || "",
      phone: contact.phone || "",
    });
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
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

      if (response?.data?.data) {
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
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSave = async () => {
    const user = JSON.parse(CookieService.get("user"));
    // Filter out any null values in custom fields

    // Clean custom fields before sending
    const cleanedCustomFields = formData.customFields.map((field) => {
      let value = field.value;

      // Convert empty strings to null for numbers
      if (field.type === "number" && value === "") {
        value = null;
      }

      // Ensure checkboxes are boolean
      if (field.type === "checkbox") {
        value = Boolean(value);
      }

      return {
        name: field.name,
        type: field.type,
        value,
        ...(field.type === "select" ? { options: field.options } : {}),
      };
    });

    const payload = {
      email: formData.email,
      role: formData.post,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      type: formData.type,
      enterprise_id: user?.enterprise_id,
      custom_fields: cleanedCustomFields,
      teams: formData.teams || [], // 👈 Add this line
    };

    // Conditionally add client_id or organization based on fromClient
    if (fromClient && clientId) {
      // Case 1: Coming from client context (clientId is already available)
      payload.client_id = clientId;
    } else {
      // Case 2: Selecting from dropdown or creating new
      if (selectedClient) {
        if (selectedClient.value) {
          // Existing client selected (has value = client_id)
          payload.client_id = selectedClient.value;
        } else {
          // Case 3: New client created (has label but no value)
          payload.client = selectedClient.label;
        }
      } else if (formData.organization) {
        // Fallback: organization entered but not through creatable
        payload.client = formData.organization;
      }
    }
    try {
      let response;

      if (editingContact) {
        response = await axios.put(
          `${API_BASE_URL}/contacts/${editingContact.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
      } else {
        response = await axios.post(`${API_BASE_URL}/contacts`, payload, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
      }

      if (response?.status) {
        getContacts();
        toast.success(
          editingContact
            ? t("Contact updated successfully!")
            : t("Contact created successfully!"),
        );
        if (typeof getTeams === "function") {
          getTeams();
        }

        setShowContactModal(false);
      }
    } catch (error) {
      console.error("Error saving contact:", error);

      // Try to extract validation error message
      if (
        error?.response &&
        error?.response?.data &&
        error?.response?.data?.errors
      ) {
        const errors = error?.response?.data?.errors;

        // Loop through all fields and show each error message
        Object?.entries(errors)?.forEach(([field, messages]) => {
          messages.forEach((msg) => {
            toast.error(msg);
          });
        });
      } else {
        toast.error("Failed to save contact.");
      }
    } finally {
      setShowContactModal(false);
    }
  };

  // Keep only this one
  useEffect(() => {
    if (showContactModal) {
      fetchCustomFieldsForForm()?.then((availableFields) => {
        if (editingContact) {
          // For editing contact, merge with existing values
          const mergedCustomFields = availableFields?.map((availableField) => {
            const contactField = editingContact.custom_fields?.find(
              (cf) => cf.name === availableField.name,
            );
            return {
              ...availableField,
              value: contactField ? contactField.value : "",
            };
          });

          if (editingContact?.teams?.length > 0) {
            const selected = editingContact.teams.map((team) => ({
              value: team.id,
              label: team.name,
            }));
            setSelectedTeams(selected);
            setFormData((prev) => ({
              ...prev,
              teams: selected.map((t) => t.value),
            }));
          } else {
            setSelectedTeams([]);
          }

          // Also handle client selection if available
          if (editingContact?.clients?.id && editingContact?.clients?.name) {
            setSelectedClient({
              value: editingContact?.clients?.id,
              label: editingContact?.clients?.name,
            });
          } else {
            setSelectedClient(null);
          }

          setFormData((prev) => ({
            ...prev,
            email: editingContact.email || "",
            firstName: editingContact.first_name || "",
            lastName: editingContact.last_name || "",
            post: editingContact.role || "",
            organization: editingContact.organization || "",
            phone: editingContact.phone_number || "",
            type: editingContact.type || "New",
            customFields: mergedCustomFields,
          }));
        } else {
          // For new contact, just set the available fields with empty values
          setFormData((prev) => ({
            ...prev,
            email: "",
            firstName: "",
            lastName: "",
            post: "",
            organization: "",
            phone: "",
            type: "New",
            customFields: availableFields,
          }));
        }
      });
    }
  }, [showContactModal, editingContact]);

  const handleCloseModal = () => {
    setShowContactModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      post: "",
      organization: "",
      phone: "",
      type: "New", // Default value
      customFields: [],
    });
    setEditingContact(null);
    setSelectedClient(null);
  };
  const user = JSON.parse(CookieService.get("user"));

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const token = CookieService.get("token");

      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const roleId = getUserRoleID();
          let filteredTeams = [];

          if (roleId === 1) {
            // Admin → show all teams
            filteredTeams = response.data?.data;
          } else if (roleId === 2) {
            // Role 2 → show teams created by logged-in user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise),
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id"),
            );
          } else if (roleId === 3) {
            // Role 3 → show teams belonging to user's enterprise
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise),
            );
            filteredTeams = response.data?.data?.filter(
              (team) =>
                team?.enterprise?.id ==
                JSON.parse(CookieService.get("enterprise"))?.id,
            );
          } else {
            // Default → teams created by this user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise),
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id"),
            );
          }

          // ✅ Convert teams to Select options
          const formattedOptions = filteredTeams.map((team) => ({
            value: team.id,
            label: team.name,
          }));

          setTeamOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error(
          t(error.response?.data?.errors?.[0] || "Failed to load teams."),
        );
      }
    };

    if (showContactModal) {
      fetchTeams(); // Fetch only when modal opens
    }
  }, [showContactModal]);

  return (
    <div className="contact-view-container">
      {/* Add Tabs navigation */}
      {/* Main Tabs navigation */}
      {/* Main Tabs navigation */}
      <div className="tabs-container mb-3">
        <div className="border-bottom tabs-meeting">
          <div className="tabs" style={{ overflowX: "auto" }}>
            <div className="d-flex gap-2">
              <button
                className={`tab ${activeTab === "contactList" ? "active" : ""}`}
                onClick={() => setActiveTab("contactList")}
              >
                {t("Contact List")}
              </button>
              <button
                className={`tab ${activeTab === "customFields" ? "active" : ""}`}
                onClick={() => setActiveTab("customFields")}
              >
                {t(
                  "Custom Fields Contacts",
                  "Champs personnalisés des contacts de",
                )}{" "}
                {user?.enterprise?.name}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "contactList" && (
        <div className="contact-list-section">
          {/* Sub-tabs for contact types */}
          <div className="tabs-container mb-3">
            <div className="border-bottom tabs-meeting">
              <div className="tabs" style={{ overflowX: "auto" }}>
                <div className="d-flex gap-2">
                  {[
                    { id: "All", label: t("All") || "All" },
                    { id: "New", label: t("contact.type.new") || "New" },
                    {
                      id: "Provider",
                      label: t("contact.type.provider") || "Provider",
                    },
                    {
                      id: "Client",
                      label: t("contact.type.client") || "Client",
                    },
                    {
                      id: "Prospect",
                      label: t("contact.type.prospect") || "Prospect",
                    },
                  ]
                    .map((type) => ({
                      ...type,
                      count:
                        type.id === "All"
                          ? contacts?.length
                          : contacts?.filter((c) => c.type === type.id).length,
                    }))
                    .filter((type) => type.id === "All" || type.count > 0)
                    .map((type) => (
                      <button
                        key={type.id}
                        className={`tab ${selectedType === type.id ? "active" : ""}`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        {type.label}
                        <span
                          className={
                            selectedType === type.id ? "future" : "draft"
                          }
                        >
                          {type.count || 0}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Existing contact list view */}
          <div className="view-toggle-container">
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${isCardView ? "active" : ""}`}
                onClick={() => handleToggle("card")}
                aria-label="Card view"
              >
                <FaTh className="toggle-icon" />
                <span>Card View</span>
              </button>
              <button
                className={`toggle-btn ${!isCardView ? "active" : ""}`}
                onClick={() => handleToggle("list")}
                aria-label="List view"
              >
                <FaList className="toggle-icon" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {isCardView ? (
            <TeamCard
              teams={
                selectedType === "All"
                  ? contacts
                  : contacts?.filter((c) => c.type === selectedType)
              }
              loading={loading}
              isTeamView={false}
              isMemberView={false}
              isClientView={false}
              isContactView={true}
              isTeamMemberView={false}
              isCastingView={false}
              isEnterpriseView={false}
              show={setShowContactModal}
              editData={setEditingContact}
              refresh={getContacts}
            />
          ) : (
            <ListContact
              contacts={
                selectedType === "All"
                  ? contacts
                  : contacts?.filter((c) => c.type === selectedType)
              }
              loading={loading}
              refreshContacts={getContacts}
              setShowContactModal={setShowContactModal}
              setEditingContact={setEditingContact}
            />
          )}
        </div>
      )}

      {activeTab === "customFields" && (
        <div className="custom-fields-tab">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>{t("Manage Custom Fields")}</h4>
          </div>

          <CustomFieldsComponent
            customFields={formData.customFields}
            onCustomFieldsChange={handleCustomFieldsChange}
          />
        </div>
      )}

      {/* {isCardView ? (
        <TeamCard
          teams={contacts}
          loading={loading}
          isTeamView={false}
          isMemberView={false}
          isClientView={false}
          isContactView={true}
          isTeamMemberView={false}
          isCastingView={false}
          isEnterpriseView={false}
          show={setShowContactModal}
          editData={setEditingContact}
          refresh={getContacts}
        />
      ) : (
        <ListContact
          contacts={contacts}
          loading={loading}
          refreshContacts={getContacts}
          setShowContactModal={setShowContactModal}
          setEditingContact={setEditingContact}
        />
      )} */}

      {showContactModal && (
        <Modal
          show={showContactModal}
          onHide={handleCloseModal}
          backdrop="static"
          keyboard={false}
          centered
          className="create-moment-modal"
          size={"lg"}
        >
          <Modal.Header className="border-0 pb-0">
            <Modal.Title style={{ fontSize: "20px" }}>
              {editingContact ? t("Update Contact") : t("team.Add Contact")}
            </Modal.Title>
            <Button
              variant="link"
              onClick={handleCloseModal}
              className="position-absolute end-0 top-0 pe-3 pt-2"
            >
              <RxCross2 size={20} />
            </Button>
          </Modal.Header>

          <Modal.Body>
            <Row className="g-2">
              <Col md={6} className="form position-relative">
                <label className="form-label">{t("Email")}</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Enter Email")}
                  required
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <Dropdown.Menu
                    show
                    style={{
                      position: "absolute",
                      top: "100%",
                      width: "100%",
                      overflowY: "auto",
                      maxHeight: "250px", // Limit the height
                      zIndex: 1000,
                      borderRadius: "5px",
                    }}
                  >
                    {filteredSuggestions.map((contact, index) => (
                      <Dropdown.Item
                        key={index}
                        // className={`suggestion-item ${
                        //   index === activeSuggestionIndex ? "active" : ""
                        // }`}
                        onClick={() => selectEmail(contact)}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              contact?.image?.startsWith("users/")
                                ? `${Assets_URL}/${contact.image}`
                                : contact.image
                            }
                            alt="avatar"
                            style={{
                              width: "25px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <div className="suggestion-email">
                            {contact.email}
                          </div>
                        </div>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
              </Col>
              {!fromClient && (
                <Col md={6} className="form">
                  <label className="form-label">{t("Organization")}</label>
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
                        options={clients}
                        value={selectedClient}
                        onChange={(option, actionMeta) => {
                          if (actionMeta.action === "create-option") {
                            // Handle new option creation
                            const newOption = {
                              label: option.label,
                              value: null,
                              data: {}, // empty data object or add default values
                            };
                            setSelectedClient(newOption);
                            setFormData({
                              ...formData,
                              organization: option.label,
                            });
                          } else if (option) {
                            setSelectedClient(option); // Set entire object
                            setFormData({
                              ...formData,
                              organization: option.label,
                            });
                          } else {
                            setSelectedClient(null);
                            setFormData({ ...formData, organization: "" });
                          }
                        }}
                        isClearable
                        placeholder={t("client_placeholder")}
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
                </Col>
              )}

              <Col md={6} className="form">
                <label className="form-label">{t("Teams")}</label>
                <Creatable
                  isMulti
                  classNamePrefix="select"
                  className="my-select destination-select-dropdown"
                  options={teamOptions} // from your backend or static list
                  value={selectedTeams}
                  onChange={(selected) => {
                    setSelectedTeams(selected);
                    setFormData({
                      ...formData,
                      teams: selected ? selected.map((item) => item.value) : [],
                    });
                  }}
                  placeholder={t("Select Teams")}
                />
              </Col>

              <Col md={6} className="form">
                <label className="form-label">{t("First Name")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder={t("Enter First Name")}
                  required
                />
              </Col>
              <Col md={6} className="form">
                <label className="form-label">{t("Last Name")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder={t("Enter Last Name")}
                  required
                />
              </Col>

              <Col md={6} className="form">
                <label className="form-label">{t("Post")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.post}
                  onChange={(e) =>
                    setFormData({ ...formData, post: e.target.value })
                  }
                  placeholder={t("Enter Post")}
                  required
                />
              </Col>

              <Col md={6} className="form">
                <label className="form-label">{t("Phone")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t("Enter Phone Number")}
                />
              </Col>
              <Col md={6} className="form">
                <label className="form-label">{t("Type") || "Type"}</label>
                <Select
                  className="my-select destination-select-dropdown"
                  classNamePrefix="select"
                  options={[
                    { value: "New", label: t("contact.type.new") || "New" },
                    {
                      value: "Provider",
                      label: t("contact.type.provider") || "Provider",
                    },
                    {
                      value: "Client",
                      label: t("contact.type.client") || "Client",
                    },
                    {
                      value: "Prospect",
                      label: t("contact.type.prospect") || "Prospect",
                    },
                  ]}
                  value={{
                    value: formData.type || "New",
                    label:
                      t(
                        `contact.type.${(formData.type || "New").toLowerCase()}`,
                      ) ||
                      formData.type ||
                      "New",
                  }}
                  onChange={(option) =>
                    setFormData({ ...formData, type: option.value })
                  }
                  placeholder={t("Select Type")}
                />
              </Col>
              {formData.customFields.map((field) => (
                <Col md={6} key={field.id} className="mb-3 form">
                  <label className="form-label">{field.name}</label>
                  {renderFieldInput(field)}
                </Col>
              ))}
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button variant="danger" onClick={handleCloseModal}>
              {t("Cancel")}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingContact ? t("Validate") : t("Create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {showImportModal && (
        <CSVImportStepper
          showImportModal={showImportModal}
          setShowImportModal={setShowImportModal}
          refreshContacts={getContacts}
          fromClient={fromClient}
          clientId={clientId}
          forClient={false}
        />
      )}
    </div>
  );
};

export default Contact;
