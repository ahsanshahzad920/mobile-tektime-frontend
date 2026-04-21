import CookieService from '../../Utils/CookieService';
import React, { useRef, useState, useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";

const CreateClient = ({
  client,
  close,
  show,
  getClients,
  refreshMission,
  type,
  setClient,
}) => {
  const [t] = useTranslation("global");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    contact_email: "",
    groupe: "",
    photo: null, // for preview URL
    photoFile: null, // for actual file to upload
  });

  useEffect(() => {
    if (client) {
      // Normalize the type value if it's "Enterprise"
      const normalizedType =
        client.type === "Enterprise" || client.type === "enterprise"
          ? "Entreprise"
          : client.type;

      setFormData((prev) => ({
        ...prev,
        name: client.name || "",
        type: normalizedType || "",
        description: client.client_need_description || "",
        contact_email: client.contact_email || "", // New field added here
        groupe: client.groupe || "",
        photo: client.client_logo || null,
        photoFile: null,
      }));
    }
  }, [client]);

  const clientImageFileInputRef = useRef(null);
  const [createAnother, setCreateAnother] = useState(false);
  const handleCheckboxChange = (e) => {
    setCreateAnother(e.target.checked);
  };

  const handleClientImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file), // preview
        photoFile: file, // actual file
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast.error(t("Please fill in all required fields"));
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("name", formData.name);
    form.append("type", formData.type || "");
    form.append("client_need_description", formData.description || "");
    form.append("contact_email", formData.contact_email || ""); // New field added here
    form.append("groupe", formData.groupe || "");

    if (formData.photoFile) {
      form.append("client_logo", formData.photoFile); // the file itself
    }

    const token = CookieService.get("token"); // Or get it from context/auth provider

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (client) {
        // Update client
        form.append("_method", "PUT");

        const response = await axios.post(
          `${API_BASE_URL}/clients/${client.id}`,
          form,
          config
        );
        console.log("Client updated:", response.data);

        // ✅ Safe call only if `refreshMission` is a function
        if (typeof refreshMission === "function") {
          refreshMission(type);
        }
      } else {
        // Create new client
        const response = await axios.post(
          `${API_BASE_URL}/clients`,
          form,
          config
        );
        console.log("Client created:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error submitting client:", error);
      toast.error(error?.response?.data?.message || "An error occurred");
      setLoading(false);
    }
    getClients();
    if (!createAnother) {
      close();
    } else {
      // setClient(null)
      setFormData({
        name: "",
        description: "",
        type: "",
        contact_email: "", // New field added here
        groupe: "",
        photo: null,
        photoFile: null,
      });
    }
    setLoading(false);
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
    <>
      <Modal
        show={show}
        onHide={close}
        centered
        size="lg"
        className="create-destination-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="destination-modal-title">
            {client ? t("Team.Edit a Client") : t("Team.Create a Client")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form">
            <div className="mb-3 name">
              <label className="form-label">
                {t("invities.client_name")}
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
                name="name"
                placeholder={t("invities.name")}
                value={formData.name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div
              className="mb-3 name"
              style={{ position: "relative", zIndex: 3 }}
            >
              <label className="form-label">
                {t("invities.client_type")}
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
            <div
              className="mb-3 name"
              style={{ position: "relative", zIndex: 2 }}
            >
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

            <div className="description" style={{ marginTop: "15px" }}>
              <label htmlFor="clientImage" className="form-label">
                Client Image
              </label>
              {/* <input
    type="file"
    id="clientImage"
    accept="image/*"
    onChange={handleClientImageUpload}
    className="form-control"
  /> */}
              <input
                type="file"
                id="clientImage"
                accept="image/*"
                ref={clientImageFileInputRef}
                onChange={handleClientImageUpload}
                className="form-control"
              />

              {/* Image Preview */}
              {formData?.photo && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={
                      formData?.photo?.startsWith("http")
                        ? formData?.photo : formData?.photo?.startsWith("blob:") ? formData?.photo
                          : Assets_URL + "/" + formData?.photo
                    }
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
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="justify-content-end align-items-center pt-0">
          {!client && (
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
                style={{
                  margin: "2px 12px",
                }}
              />
            ) : (
              t("Validate")
            )}
          </button>
        </Modal.Footer>
      </Modal >
    </>
  );
};

export default CreateClient;
