import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Button, Col, Dropdown, Modal, Nav, OverlayTrigger, Row, Tab, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TeamCard from "../Team/TeamCard";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import Select from "react-select";
import { RxCross2 } from "react-icons/rx";
import Creatable from "react-select/creatable";

const MembersTab = ({ team, refresh }) => {
  const [tab, setTab] = useState("active");
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [activeMembers, setActiveMembers] = useState([]);
  const [inActiveMembers, setInActiveMembers] = useState([]);
  useEffect(() => {
    if (team?.users?.length || team?.contacts?.length) {
      const isActive = (status) => status === "active";
      const isInactive = (status) => status === "closed" || status === "pending";

      const activeMembers = [
        ...(team.users?.filter((item) => isActive(item.pivot?.status)).map(item => ({ ...item, type: 'member' })) || []),
        ...(team.contacts?.filter((item) => isActive(item.pivot?.status)).map(item => ({ ...item, type: 'contact' })) || []),
      ];

      const inactiveMembers = [
        ...(team.users?.filter((item) => isInactive(item.pivot?.status)).map(item => ({ ...item, type: 'member' })) || []),
        ...(team.contacts?.filter((item) => isInactive(item.pivot?.status)).map(item => ({ ...item, type: 'contact' })) || []),
      ];

      setActiveMembers(activeMembers);
      setInActiveMembers(inactiveMembers);
    }
  }, [team]);


  // Common button style
  const buttonStyle = {
    border: 0,
    outline: 0,
    padding: "6px 10px",
    borderRadius: "9px",
    whiteSpace: "nowrap",
    marginLeft: "6px",
    display: "flex",
    alignItems: "center",
    // height: "32px",

    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "24px",
    textAlign: "left",
    color: "rgb(255, 255, 255)",
    background: "rgb(44, 72, 174)",
    // padding: "10px 16px",
  };

  const [showExistingTeamModal, setShowExistingTeamModal] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    post: "",
    organization: "",
    phone: "",
  });

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



  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (value.length > 1) {
      const filtered = emailSuggestions.filter((contact) =>
        contact.email?.toLowerCase().includes(value.toLowerCase())
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
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
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
      const response = await axios.get(`${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
        "user_id"
      )}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

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

    const payload = {
      email: formData.email,
      role: formData.post,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      enterprise_id: user?.enterprise_id,
      type: "New",
    };

    // Conditionally add client_id or organization based on fromClient

    if (selectedClient && selectedClient.value) {
      payload.client_id = selectedClient.value;
    } else if (!selectedClient && formData.organization) {
      payload.client = formData.organization;
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
          }
        );
      } else {
        response = await axios.post(`${API_BASE_URL}/contacts`, payload, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
      }

      if (response?.status) {
        // getContacts();
        toast.success(
          editingContact
            ? t("Contact updated successfully!")
            : t("Contact created successfully!")
        );
        refresh()
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


  useEffect(() => {
    if (showContactModal && editingContact) {
      setFormData({
        email: editingContact.email || "",
        firstName: editingContact.first_name || "",
        lastName: editingContact.last_name || "",
        post: editingContact.role || "",
        organization: editingContact.organization || "",
        phone: editingContact.phone_number || "",
      });

      // Also handle client selection if available
      if (editingContact?.clients?.id && editingContact?.clients?.name) {
        setSelectedClient({
          value: editingContact?.clients?.id,
          label: editingContact?.clients?.name,
        });
      } else {
        setSelectedClient(null);
      }
    }

    if (!showContactModal) {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        post: "",
        organization: "",
        phone: "",
      });
      setSelectedClient(null);
      setEditingContact(null); // Clear editing state
    }
  }, [showContactModal, editingContact]);
  const [enterprise, setEnterprise] = useState(null);
  useEffect(() => {
    const sessionUser = JSON.parse(CookieService.get("user"));
    if (sessionUser?.enterprise) {
      setEnterprise(sessionUser.enterprise);
    }
  }, []);

  const [teams, setTeams] = useState([]);
  const getTeams = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTeams(response?.data?.data);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error?.message));
      // console.log("error message", error);
    }
  };

  const options1 = teams?.filter(
    (team) => parseInt(team?.enterprise_id) === parseInt(enterprise?.id)
  );
  const teamOptions = options1?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const handleSelectInputChange = (selectedOptions, action) => {
    if (action.name === "team_id") {
      const selectedTeams = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];
      setSelectedTeams(selectedOptions);
    }
  };
  useEffect(() => {
    getTeams();
  }, []);
  const handleValidate = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-team-users`,
        {
          teams: selectedTeams?.map((team) => team.value),
          team_id: parseInt(team?.id),
        },
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.status) {
        refresh();
      }

      // Optional: handle success response
    } catch (error) {
      console.error("Error adding team users:", error);
    }
  };

  const [existingMembers, setExistingMembers] = useState([]);
  const [existingContacts, setExistingContacts] = useState([]);

  useEffect(() => {
    const getExistingMembers = async () => {
      const token = CookieService.get("token");

      try {
        const response = await axios.get(
          `${API_BASE_URL}/get-enterprise-user-with-contact?enterprise_id=${enterprise?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          const data = response?.data?.data;

          const members = data.filter((item) => item.created_by === undefined);
          const contacts = data.filter((item) => item.created_by !== undefined);


          setExistingMembers(
            members.map((member) => ({
              value: member.id,
              label: member.name + " " + member.last_name,
              type: 'member'
            }))
          );

          setExistingContacts(
            contacts.map((contact) => ({
              value: contact.id,
              label: contact.email,
              type: 'contact'
            }))
          );
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    if (enterprise) {
      getExistingMembers();
    }
  }, [enterprise]);

  // Combine both with group labels for the select options
  const groupedOptions = [
    {
      label: "Membres",
      options: existingMembers,
    },
    {
      label: "Contacts",
      options: existingContacts,
    }
  ];

  const [showExistingMemberModal, setShowExistingMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleValidateMember = async () => {
    try {
      const payload = {
        team_id: parseInt(team?.id),
        user_ids: selectedMembers
          .filter(m => m.type === 'member')
          .map(m => m.value),
        contact_ids: selectedMembers
          .filter(m => m.type === 'contact')
          .map(m => m.value)
      };
      const response = await axios.post(
        `${API_BASE_URL}/add-existing-users-to-team`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.status) {
        refresh();
      }
      // Optional: handle success response
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Error adding team users:", error);
    }
  };

  const handleSelectMemberChange = (selectedOptions) => {
    setSelectedMembers(selectedOptions);
  };

  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Tab.Container activeKey={tab} onSelect={(key) => setTab(key)}>
        <div className="row align-items-center tabs-header custom-tabs">
          <div className="col-md-4">
            <Nav variant="tabs" className="d-flex flex-wrap">
              <Nav.Item className="tab">
                <Nav.Link eventKey="active" className="custom-tab-link">
                  {t("team.active_member")}
                  <span className="ms-2">{activeMembers.length}</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tab">
                <Nav.Link eventKey="archive" className="custom-tab-link">
                  {t("team.inactifs_member")}
                  <span className="ms-2">{inActiveMembers.length}</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="col-md-8 d-flex justify-content-end">
            {tab === "active" && (
              <div className="d-flex align-items-center flex-wrap">
                <Button
                  style={buttonStyle}
                  onClick={() => setShowExistingMemberModal(true)}
                >
                  <FaPlus size={10} className="me-1" />
                  {t("team.Add Existing Member")}
                </Button>
                <Button
                  style={buttonStyle}
                  onClick={() => {
                    navigate(`/user/create`, {
                      state: {
                        preselectedTeam: team,
                      },
                    });
                  }}
                >
                  <FaPlus size={10} className="me-1" />
                  {t("team.Add New Member")}
                </Button>
                <Button
                  style={buttonStyle}
                  onClick={() => setShowExistingTeamModal(true)}
                >
                  <FaPlus size={10} className="me-1" />
                  {t("team.Add Existing Team")}
                </Button>
                {/* <Button
                style={buttonStyle}
                onClick={() => console.log("Import Member")}
              >
                <FaPlus size={10} className="me-1" />
                {t("team.Import Member")}
              </Button> */}
              </div>
            )}
          </div>
        </div>

        <Tab.Content className="mt-3">
          <Tab.Pane eventKey="active">
            <div className="row d-flex justify-content-center">
              <div className="col-md-12 mb-3">
                <TeamCard
                  teams={activeMembers}
                  isClientView={false}
                  isMemberView={false}
                  isTeamMemberView={true}
                  isTeamView={false}
                  isCastingView={false}
                  isEnterpriseView={false}
                  isContactView={false}
                  refresh={refresh}
                  editData={setEditingContact}
                  show={setShowContactModal}
                />
              </div>
            </div>
          </Tab.Pane>
          <Tab.Pane eventKey="archive">
            <div className="row d-flex justify-content-center">
              <div className="col-md-12 mb-3">
                <TeamCard
                  teams={inActiveMembers}
                  refresh={refresh}
                  isClientView={false}
                  isMemberView={false}
                  isTeamMemberView={true}
                  isCastingView={false}
                  isEnterpriseView={false}
                  isContactView={false}
                  isTeamView={false}
                />
              </div>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {showExistingTeamModal && (
        <Modal
          show={showExistingTeamModal}
          onHide={() => setShowExistingTeamModal(false)}
          centered
          size="md"
        >
          <Modal.Header closeButton className="border">
            <h4 className="participant-heading-meeting">
              {t("userTabs.Add an existing team")}
            </h4>
          </Modal.Header>
          <Modal.Body className="">
            <div className="mb-3">
              <label className="form-label">
                <h6>{t("user.team")}</h6>
              </label>

              <Select
                className="react-select"
                id="teamSelect"
                isMulti
                name="team_id"
                options={teamOptions}
                value={selectedTeams}
                onChange={handleSelectInputChange}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-start pt-0">
            <button
              onClick={handleValidate}
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: "rgb(255, 255, 255)",
                background: "rgb(44, 72, 174)",
                border: "0px",
                padding: "10px 16px",
                borderRadius: "9px",
                marginTop: "1.5rem",
              }}
            >
              Validate
            </button>
            <button
              className="btn mt-4"
              // onClick={handleClose}
              style={{
                backgroundColor: "red",
                color: "rgb(255, 255, 255)",
                border: "none",
                padding: "9px 26px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
              }}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      )}
      {showExistingMemberModal && (
        <Modal
          show={showExistingMemberModal}
          onHide={() => setShowExistingMemberModal(false)}
          centered
          size="md"
        >
          <Modal.Header closeButton className="border">
            <h4 className="participant-heading-meeting">
              {t("team.Add Existing Member")}
            </h4>
          </Modal.Header>
          <Modal.Body className="">
            <div className="mb-3">

              <Select
                className="react-select"
                id="memberSelect"
                isMulti
                name="user_id"
                options={groupedOptions}
                value={selectedMembers}
                onChange={handleSelectMemberChange}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-start pt-0">
            <button
              onClick={handleValidateMember}
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: "rgb(255, 255, 255)",
                background: "rgb(44, 72, 174)",
                border: "0px",
                padding: "10px 16px",
                borderRadius: "9px",
                marginTop: "1.5rem",
              }}
            >
              Validate
            </button>
            <button
              className="btn mt-4"
              // onClick={handleClose}
              style={{
                backgroundColor: "red",
                color: "rgb(255, 255, 255)",
                border: "none",
                padding: "9px 26px",
                fontSize: "16px",
                cursor: "pointer",
                borderRadius: "5px",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
              }}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {showContactModal && (
        <Modal
          show={showContactModal}
          onHide={() => setShowContactModal(false)}
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
              onClick={() => setShowContactModal(false)}
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
              {/* {!fromClient && ( */}
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
                        if (actionMeta.action === "create-option" && option) {
                          setSelectedClient(null); // Since this is a new client not in list
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
              {/* )} */}

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
            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button variant="danger" onClick={() => setShowContactModal(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingContact ? t("Validate") : t("Create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default MembersTab;
