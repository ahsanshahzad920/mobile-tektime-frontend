import CookieService from '../../Utils/CookieService';
import React, { useRef, useState, useEffect } from "react";
import { Modal, Spinner, Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";

const ClientCastingModal = ({ client, setClient, close, show, getClients }) => {
  const [t] = useTranslation("global");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    photo: null,
    photoFile: null,
    contact_email: "",
    mailing_address: "",
    groupe: "",
    siret_number: "",
    vat_number: "",
  });

  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      // Normalize the type value if it's "Enterprise" or "enterprise"
      const normalizedType =
        client.type === "Enterprise" || client.type === "enterprise"
          ? "Entreprise"
          : client.type;

      setFormData((prev) => ({
        ...prev,
        name: client.name || "",
        type: normalizedType || "",
        description: client.client_need_description || "",
        mailing_address: client?.mailing_address || "",
        contact_email: client?.contact_email || "",
        groupe: client?.groupe || "",
        siret_number: client?.siret_number || "",
        vat_number: client?.vat_number || "",
        photo: client.client_logo || null,
        photoFile: null,
      }));
    }
  }, [client]);

  const [createAnother, setCreateAnother] = useState(false);
  const handleCheckboxChange = (e) => {
    setCreateAnother(e.target.checked);
  };

  const handleHover = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleButtonClick = () => fileInputRef.current.click();

  const handleClientImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
        photoFile: file,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error(t("Please fill in all required fields"));
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.append("name", formData.name);
    form.append("type", formData.type || "");
    form.append("mailing_address", formData.mailing_address || "");
    form.append("contact_email", formData.contact_email || "");
    form.append("groupe", formData.groupe || "");
    form.append("siret_number", formData.siret_number || "");
    form.append("vat_number", formData.vat_number || "");
    form.append("client_need_description", formData.description || "");

    if (formData.photoFile) {
      form.append("client_logo", formData.photoFile);
    }

    const token = CookieService.get("token");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (client) {
        form.append("_method", "PUT");
        await axios.post(`${API_BASE_URL}/clients/${client.id}`, form, config);
      } else {
        await axios.post(`${API_BASE_URL}/clients`, form, config);
      }

      getClients();
      if (!createAnother) {
        close();
      }
      setFormData({
        name: "",
        description: "",
        type: "",
        photo: null,
        photoFile: null,
        contact_email: "",
        mailing_address: "",
        groupe: "",
        siret_number: "",
        vat_number: "",
      })
      setClient(null);
    } catch (error) {
      console.error("Error submitting client:", error);
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: "Entreprise", label: t("invities.entreprise") },
    { value: "Particulier", label: t("invities.particulier") },
    { value: "Association", label: t("invities.association") },
  ];

  const groupOptions = [
    { value: "Hospitality", label: t("invities.group_options.Hospitality") },
    { value: "Catering", label: t("invities.group_options.Catering") },
    { value: "Administration", label: t("invities.group_options.Administration") },
    { value: "Retail", label: t("invities.group_options.Retail") },
    { value: "Healthcare", label: t("invities.group_options.Healthcare") },
    { value: "Events", label: t("invities.group_options.Events") },
  ];

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      size="lg"
      className="create-destination-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title className="destination-modal-title">
          {client ? t("Team.Edit a Client") : t("Team.Create a Client")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="form">
          {/* Improved Image Upload */}
          <div className="mb-4 text-center">
            <div
              className={`image-preview ${isHovered ? "hovered" : ""}`}
              onMouseEnter={handleHover}
              onMouseLeave={handleMouseLeave}
              onClick={handleButtonClick}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 auto 15px",
                position: "relative",
                border: "1px dashed #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backgroundColor: "#f8f9fa",
              }}
            >
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Client Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <>
                  <div
                    className="avatar"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="fas fa-camera text-muted"></i>
                  </div>
                  {isHovered && (
                    <div
                      className="upload-text"
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        color: "#6c757d",
                        fontSize: "12px",
                      }}
                    >
                      Click to upload logo
                    </div>
                  )}
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleClientImageUpload}
            />
          </div>

          <div className="mb-3 name">
            <label className="form-label">
              {t("invities.client_name")}
              <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>
                *
              </small>
            </label>
            <input
              type="text"
              name="name"
              placeholder={t("invities.name")}
              value={formData.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3 name" style={{ position: "relative", zIndex: 3 }}>
            <label className="form-label">
              {t("invities.client_type")}
              <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>
                *
              </small>
            </label>
            <Select
              name="type"
              options={typeOptions}
              value={typeOptions.find((opt) => opt.value === formData.type)}
              onChange={(selectedOption) =>
                handleChange({
                  target: { name: "type", value: selectedOption?.value },
                })
              }
              className="my-select destination-select-dropdown"
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3 name">
            <label className="form-label">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              placeholder="Enter contact email"
              value={formData.contact_email}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3 name" style={{ position: "relative", zIndex: 2 }}>
            <label className="form-label">{t("invities.groupe")}</label>
            <Select
              name="groupe"
              options={groupOptions}
              value={groupOptions.find((opt) => opt.value === formData.groupe)}
              onChange={(selectedOption) =>
                handleChange({
                  target: { name: "groupe", value: selectedOption?.value },
                })
              }
              className="my-select destination-select-dropdown"
              classNamePrefix="select"
              placeholder={t("invities.groupe")}
            />
          </div>

          <div className="mb-3 description">
            <label className="form-label" htmlFor="mailing_address">
              {t("Billing Address")}
            </label>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t("Billing Address Tooltip")}</Tooltip>}
            >
              <textarea
                name="mailing_address"
                className="form-control"
                value={formData.mailing_address || ""}
                onChange={handleChange}
                rows={3}
              />
            </OverlayTrigger>
          </div>

          <div className="mb-3 name">
            <label className="form-label" htmlFor="siret_number">
              {t("Siret Number")}
            </label>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t("Siret Number Tooltip")}</Tooltip>}
            >
              <input
                type="text"
                name="siret_number"
                className="form-control"
                value={formData.siret_number || ""}
                onChange={handleChange}
              />
            </OverlayTrigger>
          </div>

          <div className="mb-3 name">
            <label className="form-label" htmlFor="vat_number">
              {t("Vat Number")}
            </label>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t("Vat Number Tooltip")}</Tooltip>}
            >
              <input
                type="text"
                name="vat_number"
                className="form-control"
                value={formData.vat_number || ""}
                onChange={handleChange}
              />
            </OverlayTrigger>
          </div>

          <div className="description fs-6">
            <label htmlFor="description">{t("Entreprise.Description")}</label>
            <textarea
              name="description"
              placeholder={t("Enter Description")}
              className="form-control"
              rows={5}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className="justify-content-end pt-0">
        {!client && (
          <>
            <div className="mt-4">
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
          </>
        )}
        <button
          className="btn mt-4"
          onClick={close}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "10px 16px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "9px",
            transition: "background-color 0.3s",
            display: "flex",
            alignItems: "center",
          }}
        >
          {t("Cancel")}
        </button>
        <button
          onClick={handleSubmit}
          style={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "24px",
            textAlign: "left",
            color: "white",
            background: "rgb(44, 72, 174)",
            border: "0px",
            padding: "10px 16px",
            borderRadius: "9px",
            marginTop: "1.5rem",
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
            t("Validate")
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientCastingModal;