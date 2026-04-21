import CookieService from '../../Utils/CookieService';
import React, { useState, useRef, useMemo } from "react";
import { Modal, Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import countryList from "react-select-country-list";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";

const activityAreaOptions = [
  // "20industrie chinique",
  "Activities de services",
  "Agroalimentaire",
  "Art",
  "Artisanat",
  "Audiovisuel",
  "Automobile",
  "Communication",
  "Construction",
  "Culture",
  "Droit",
  "Energie",
  "Entreprise",
  "Environnement",
  "Immobilier",
  "Industrie",
  "Logistique",
  "Sante",
  "Sciences",
  "Securite",
  "Tourisme",
  "Transport",
];
const ModifyEnterpriseModal = ({ enterprise, show, onHide, onSave,getEnterpriseClient }) => {
  const [t] = useTranslation("global");
  const [enterpriseData, setEnterpriseData] = useState({
    ...enterprise,
    client: enterprise.client || {}, // Ensure client object exists
      activity_area: enterprise.activity_area || "", // 👈 Add this

  });
  const [imagePreview, setImagePreview] = useState(enterprise?.client?.client_logo);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const options = useMemo(() => countryList().getData(), []);
const countryCode =
  options.find((opt) => opt.label === enterprise?.country)?.value || "";
  const handleHover = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleButtonClick = () => fileInputRef.current.click();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // setEnterpriseData({
        //   ...enterpriseData,
        //   logo: file,
        // });
        setEnterpriseData({
            ...enterpriseData,
            client:{
                ...enterpriseData?.client,
                client_logo:file
            }
        })
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnterpriseData((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [name]: value,
      },
    }));
  };

  const [loadin,setLoading] = useState(false)
 const handleSave = async () => {
    if (!enterpriseData.client.name) {
      toast.error(t("Please fill in all required fields"));
      return;
    }

    setLoading(true);
    const form = new FormData();
    
    // Append client data
    form.append("name", enterpriseData.client.name || "");
    form.append("mailing_address", enterpriseData.client.mailing_address || "");
    form.append("siret_number", enterpriseData.client.siret_number || "");
    form.append("vat_number", enterpriseData.client.vat_number || "");
    form.append("client_need_description", enterpriseData.client.client_need_description || "");
    form.append("activity_area", enterpriseData.activity_area || "");

    // Append logo if changed
    if (enterpriseData?.client?.client_logo instanceof File) {
      form.append("client_logo", enterpriseData?.client?.client_logo);
    }

    const token = CookieService.get("token");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (enterprise) {
        form.append("_method", "PUT");
        await axios.post(
          `${API_BASE_URL}/clients/${enterprise.client.id}`,
          form,
          config
        );
        toast.success(t("Client updated successfully"));
      }

      getEnterpriseClient();
      onHide();
    } catch (error) {
      console.error("Error submitting client:", error);
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="create-destination-modal"
      backdrop="static"
    >
      <Modal.Header closeButton>
         <Modal.Title className="destination-modal-title">{t("Team.Edit a Client")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form">


        {/* Logo Upload */}
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
            {imagePreview ? (
              <img
                src={
                  imagePreview.startsWith("http")
                    ? imagePreview
                    : imagePreview.startsWith('data:') ? imagePreview
                    : `${Assets_URL}/${imagePreview}`
                }
                alt="Enterprise Logo"
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
            onChange={handleImageUpload}
          />
        </div>

        {/* Enterprise Fields (Readonly) */}
        <div className="mt-4">
          <Form.Group className="mb-3 name">
            <Form.Label className="form-label">
              {t("invities.name")}
              <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={enterpriseData?.client?.name || ""}
            //   readOnly
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3 name">
            <Form.Label className="form-label">
              {t("Entreprise.country name")}{" "}
              {/* <span className="text-danger">*</span> */}
            </Form.Label>
            <Form.Select
              value={countryCode}
              disabled
              className="form-control"
            >
              <option value="" disabled>
                {t("Select country")}
              </option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 name">
            <Form.Label className="form-label">{t("Activity Area")}</Form.Label>
          <Form.Select
  name="activity_area"
  value={enterpriseData?.activity_area || ""}
  onChange={(e) =>
    setEnterpriseData((prev) => ({
      ...prev,
      activity_area: e.target.value,
    }))
  }
  className="my-select destination-select-dropdown"
>

              <option value="">{t("Select activity area")}</option>
              {activityAreaOptions.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Client Fields (Editable) */}
          <Form.Group className="mb-3 description">
            <Form.Label className="form-label">
              {t("Entreprise.Description")}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="client_need_description"
              value={enterpriseData?.client?.client_need_description || ""}
              onChange={handleChange}
              style={{ resize: "none" }}
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3 description">
            <Form.Label className="form-label" htmlFor="mailing_address">
              {t("Billing Address")}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{t("Billing Address Tooltip")}</Tooltip>}
              >
                <span className="ms-2 text-muted" style={{ cursor: "pointer" }}>
                  <i className="fas fa-info-circle"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="mailing_address"
              value={enterpriseData?.client?.mailing_address || ""}
              onChange={handleChange}
              rows={5}
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3 name">
            <Form.Label className="form-label" htmlFor="siret_number">
              {t("Siret Number")}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{t("Siret Number Tooltip")}</Tooltip>}
              >
                <span className="ms-2 text-muted" style={{ cursor: "pointer" }}>
                  <i className="fas fa-info-circle"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <Form.Control
              type="text"
              name="siret_number"
              value={enterpriseData?.client?.siret_number || ""}
              onChange={handleChange}
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3 name">
            <Form.Label className="form-label" htmlFor="vat_number">
              {t("Vat Number")}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{t("Vat Number Tooltip")}</Tooltip>}
              >
                <span className="ms-2 text-muted" style={{ cursor: "pointer" }}>
                  <i className="fas fa-info-circle"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <Form.Control
              type="text"
              name="vat_number"
              value={enterpriseData?.client?.vat_number || ""}
              onChange={handleChange}
              className="form-control"
            />
          </Form.Group>
        </div>
        </div>

      </Modal.Body>
      <Modal.Footer className="border-0">
        <button
          className="btn mt-4"
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
          onClick={onHide}
        >
          {t("Cancel")}
        </button>
        <Button
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
          onClick={handleSave}
        >
          {t("Validate")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModifyEnterpriseModal;
