import CookieService from '../../../../../Utils/CookieService';
import { RxCross2 } from "react-icons/rx";
import { useTranslation } from "react-i18next";
import { Col, Container, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { useFormContext } from "../../../../../../context/CreateMeetingContext";
import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";
import { API_BASE_URL, Assets_URL } from "../../../../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";

const EditGuest = ({ editModal, GuestId, closeEditModal }) => {
  const {
    loading,
    GetSingleGuestData,
    singleGuestData,
    setSingleGuestData,
    updateGuest,
  } = useFormContext();
  const [t] = useTranslation("global");

     const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isNewClient, setIsNewClient] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

 useEffect(() => {
    if (GuestId && clients.length > 0) {
      GetSingleGuestData(GuestId).then(() => {
        // Extract client data from the contact object if it exists
        if (singleGuestData?.contact?.clients) {
          const clientData = singleGuestData.contact.clients;
          const foundClient = clients
            .flatMap(group => group.options)
            .find(client => client.value === clientData.id);
          
          if (foundClient) {
            setSelectedClient(foundClient);
            // Set client_id in the main data object
            setSingleGuestData(prev => ({
              ...prev,
              client_id: clientData.id,
              client: null // Ensure organization is null when using client_id
            }));
          }
        } else if (singleGuestData?.client) {
          // Handle case where organization was manually entered
          setSelectedClient({
            label: singleGuestData.client,
            value: null,
            isNew: true
          });
        }
      });
    }
  }, [GuestId, clients]);


  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get("user_id")}`,
        {
          headers: { Authorization: `Bearer ${CookieService.get("token")}` },
        }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSingleGuestData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleClientChange = (option, actionMeta) => {
    if (actionMeta.action === "create-option") {
      // New client created - set organization and clear client_id
      setSelectedClient({
        label: option.label,
        value: null,
        isNew: true
      });
      setSingleGuestData(prev => ({
        ...prev,
        client_id: null,
        client: option.label,
        contact: null // Remove contact object if it exists
      }));
    } else if (option) {
      // Existing client selected - set client_id and clear organization
      setSelectedClient(option);
      setSingleGuestData(prev => ({
        ...prev,
        client_id: option.value,
        client: null,
        contact: null // Remove contact object if it exists
      }));
    } else {
      // Cleared selection - clear both fields
      setSelectedClient(null);
      setSingleGuestData(prev => ({
        ...prev,
        client_id: null,
        client: null,
        contact: null // Remove contact object if it exists
      }));
    }
  };

 const handleUpdate = async () => {
    try {
      // Create a clean payload without the contact object
      const payload = {
        ...singleGuestData,
        _method: "put"
      };
      
      // Remove the contact object if it exists
      delete payload.contact;

      // Ensure we're not sending both client_id and organization
      if (payload.client_id) {
        payload.client = null;
      } else if (payload.client) {
        payload.client_id = null;
      }


      const response = await updateGuest(GuestId, payload);
      if (response?.data?.success) {
        toast.success("Guest updated successfully");
        closeEditModal();
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update guest");
    }
  };

  return (
    <>
      {editModal && (
        <div id="chart-container" className="chart-content">
        <div className="quick-moment-form-2">

          <div className="modal-overlay-1">
            <div className="new-meeting-modal-1">
              <div className="modal-nav">
                <div>
                  {<h4>{t("Edit Invite")}</h4>}
                  <p
                    className="solutioncards px-2"
                    style={{ color: "#92929D" }}
                  >
                    {t("Update Invite Information")}
                  </p>
                </div>

                <div className="d-flex justify-content-end">
                  <button className="cross-btn" onClick={closeEditModal}>
                    <RxCross2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-3 modal-body">
                <Container className="create-moment-modal">
                 <Row>
  {/* Email Field */}
  <Col xs={12} md={6} className="mb-2 form">
    <label className="form-label">Email</label>
    <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>
    <input
      type="text"
      name="email"
      required
      className="form-control"
      value={singleGuestData?.email || ""}
      onChange={handleInputChange}
    />
  </Col>

  {/* Organization Field */}
  <Col xs={12} md={6} className="mb-2 form1">
    <label className="form-label">{t("Organization")}</label>
    <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="client-tooltip">
          💡 Commencez à taper pour rechercher un client existant ou
          en créer un nouveau automatiquement.
        </Tooltip>
      }
    >
      <div className="destination-select-container">
        <Creatable
          className="my-select destination-select-dropdown"
          classNamePrefix="select"
          options={clients}
          value={selectedClient}
          onChange={handleClientChange}
          isClearable
          placeholder={t("client_placeholder")}
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
      </div>
    </OverlayTrigger>
  </Col>
                    <Col xs={12} md={6} className="mb-2 form">
                      <label className="form-label">
                        {" "}
                        {t("meeting.formState.post")}
                      </label>
                      <small
                        style={{
                          color: "red",
                          fontSize: "15px",
                          marginLeft: "2px",
                        }}
                      >
                        *
                      </small>
                      <input
                        type="text"
                        name="post"
                        required
                        className="form-control"
                        value={singleGuestData?.post}
                        onChange={handleInputChange}
                        // placeholder="Enter your post"
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-2 form">
                      <label className="form-label">
                        {t("meeting.formState.firstName")}
                      </label>
                      <small
                        style={{
                          color: "red",
                          fontSize: "15px",
                          marginLeft: "2px",
                        }}
                      >
                        *
                      </small>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className="form-control"
                        value={singleGuestData?.first_name || singleGuestData?.name}
                        onChange={handleInputChange}
                        placeholder={t("Enter Name")}
                      />
                    </Col>
                    <Col xs={12} md={6} className="mb-2 form">
                      <label className="form-label">
                        {t("meeting.formState.lastName")}
                      </label>
                      <small
                        style={{
                          color: "red",
                          fontSize: "15px",
                          marginLeft: "2px",
                        }}
                      >
                        *
                      </small>
                      <input
                        type="text"
                        name="last_name"
                        required
                        className="form-control"
                        value={singleGuestData?.last_name}
                        onChange={handleInputChange}
                      />
                    </Col>
                    <Col xs={12} md={12} className="mb-2 form">
                      <label className="form-label">{t("Contribution")}</label>
                      <textarea
                        type="text"
                        name="contribution"
                        required
                        className="form-control"
                        rows={3}
                        value={singleGuestData?.contribution}
                        onChange={handleInputChange}
                      />
                    </Col>
                  </Row>
                  <div
                    className={`col-md-12 d-flex justify-content-end px-4 mt-5 `}
                    onClick={handleUpdate}
                  >
                    {loading ? (
                      <button className={`btn moment-btn px-2 py-0`}>
                        <span
                          class="spinner-border spinner-border-sm text-white"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      </button>
                    ) : (
                      <button className={`btn moment-btn`}>
                        &nbsp;{t("meeting.formState.Update")}
                      </button>
                    )}
                  </div>
                </Container>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default EditGuest;
