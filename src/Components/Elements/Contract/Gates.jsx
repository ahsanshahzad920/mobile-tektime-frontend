import CookieService from '../../Utils/CookieService';
import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Modal,
} from "react-bootstrap";
import {
  FaPlus,
  FaArrowLeft,
  FaGem,
  FaUserInjured,
  FaCheckCircle,
  FaTh,
  FaList,
  FaCogs,
  FaChartLine,
  FaShieldAlt,
  FaLock,
  FaQuestionCircle,
  FaTrash,
  FaPlusCircle,
  FaEye,
  FaQuoteLeft,
  FaExclamationCircle,
} from "react-icons/fa";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { BsCloudUpload } from "react-icons/bs";
import { RiEditBoxLine } from "react-icons/ri";
import { IoCopyOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
// import GatePreview from './GatePreview';
import "./Gates.scss";
import HomeMessages from "../../../Pages/Discussion/HomeMessages";

// --- INITIAL STATE FOR NEW GATE ---
const INITIAL_GATE_STATE = {
  gateName: "",
  gateType: "",
  contractName: "",
  // landingPageUrl: "",
  landingPageType: "Message",
  // 1. Hero
  heroTitle: "",
  heroSubtitle: "",
  heroBenefits: ["", "", ""],
  heroCtaPrimary: "",
  heroCtaPrimaryLink: "",
  heroCtaSecondary: "",
  heroCtaSecondaryLink: "",
  heroMediaType: "image", // 'image', 'video', or 'youtube'
  heroMediaFile: null,
  heroYoutubeUrl: "",
  heroAutoplay: false,
  heroAltText: "",

  // 2. Problem
  problemTitle: "",
  problems: ["", "", ""],
  problemMediaType: "image",
  problemMediaFile: null,
  problemMediaDesc: "",

  // 3. Solution
  solutionTitle: "",
  solutionIntro: "",
  features: [{ title: "", desc: "", mediaType: "image", mediaFile: null }],

  // 4. How it works
  howTitle: "",
  steps: [
    {
      title: "",
      desc: "",
      cardSubtitle: "",
      cardBtn: "",
      mediaFile: null,
      mediaType: "image",
    },
  ],

  // 5. Business Benefits
  benefitsTitle: "",
  benefitsForYou: ["", ""],
  benefitsForClients: ["", ""],
  benefitsMediaType: "image", // checkbox logic?
  benefitsMediaFile: null,
  benefitsKeyFigure: "",

  // 6. Testimonials
  testimonialsTitle: "",
  testimonials: [
    {
      headline: "",
      content: "",
      authorName: "",
      authorRole: "",
      authorImage: null,
    },
  ],

  // 7. Integrations & Security
  integrationsTitle: "",
  integrationsSubtitle: "",
  integrationsList: ["", "", "", ""], // Fixed 4 slots or dynamic? Let's make dynamic logic but start with 3
  securityArgs: ["", ""],
  integrationsMediaType: "image",
  integrationsMediaFile: null,

  // 8. FAQ
  faqItems: [{ question: "", answer: "", mediaFile: null, mediaType: "image" }],

  // 9. Audio
  audioFile: null,
};

const GateEditor = ({
  onCancel,
  onSave,
  initialData,
  validationErrors = {},
  setValidationErrors,
}) => {
  const [t] = useTranslation("global");
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...INITIAL_GATE_STATE,
        ...initialData,
        landingPageType:
          initialData.landingPageType || INITIAL_GATE_STATE.landingPageType,
      };
    }
    return {
      ...INITIAL_GATE_STATE,
      problemTitle: t("gateForm.defaults.problemTitle"),
      solutionTitle: t("gateForm.defaults.solutionTitle"),
      howTitle: t("gateForm.defaults.howTitle"),
      benefitsTitle: t("gateForm.defaults.benefitsTitle"),
      integrationsTitle: t("gateForm.defaults.integrationsTitle"),
    };
  });

  const [showPreview, setShowPreview] = useState(false);

  const sectionFields = {
    hero: [
      "gateName",
      "gate_name",
      "gateType",
      "gate_type",
      "heroTitle",
      "title",
      "heroSubtitle",
      "subtitle",
      "heroBenefits",
      "hero_benefits",
      "heroMediaFile",
      "hero_media_file",
      "heroYoutubeUrl",
      "hero_youtube_url",
    ],
    problem: [
      "problemTitle",
      "problem_title",
      "problems",
      "problemMediaFile",
      "problem_media_file",
    ],
    solution: [
      "solutionTitle",
      "solution_title",
      "solutionIntro",
      "solution_intro",
      "features",
    ],
    how: ["howTitle", "how_title", "steps"],
    benefits: [
      "benefitsTitle",
      "benefits_title",
      "benefitsForYou",
      "benefits_for_you",
      "benefitsForClients",
      "benefits_for_clients",
      "benefitsMediaFile",
      "benefits_media_file",
    ],
    testimonials: ["testimonialsTitle", "testimonials_title", "testimonials"],
    integrations: [
      "integrationsTitle",
      "integrations_title",
      "integrationsSubtitle",
      "integrations_subtitle",
      "integrationsList",
      "integrations_list",
      "securityArgs",
      "security_args",
      "integrationsMediaFile",
      "integrations_media_file",
    ],
    faq: ["faqItems"],
    audio: ["audioFile", "audio_file"],
  };

  const hasSectionError = (sectionId) => {
    const fields = sectionFields[sectionId] || [];
    const errorKeys = Object.keys(validationErrors);
    return fields.some((f) =>
      errorKeys.some(
        (ek) => ek === f || ek.startsWith(`${f}.`) || ek.startsWith(`${f}[`),
      ),
    );
  };

  const renderError = (field) => {
    const error = validationErrors[field];
    if (!error) return null;
    return (
      <div
        className="text-danger small mt-1 animate__animated animate__fadeIn"
        style={{ fontWeight: "500" }}
      >
        {Array.isArray(error) ? error[0] : error}
      </div>
    );
  };

  const clearError = (field) => {
    if (setValidationErrors) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        // Also try snake_case version
        const snakeKey = field.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        delete newErrors[snakeKey];
        return newErrors;
      });
    }
  };

  // --- GENERIC HANDLER ---
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  // --- ARRAY HANDLERS (for benefits, problems lists that are just strings) ---
  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
    clearError(field);
  };
  const addArrayItem = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };
  const removeArrayItem = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  // --- OBJECT ARRAY HANDLERS (for Features, Steps, FAQ) ---
  const handleObjArrayChange = (arrayField, index, key, value) => {
    const newArray = [...formData[arrayField]];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData((prev) => ({ ...prev, [arrayField]: newArray }));
    clearError(arrayField);
  };
  const addObjItem = (arrayField, emptyObj) => {
    setFormData((prev) => ({
      ...prev,
      [arrayField]: [...prev[arrayField], emptyObj],
    }));
  };
  const removeObjItem = (arrayField, index) => {
    const newArray = [...formData[arrayField]];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [arrayField]: newArray }));
  };

  // --- FILE HANDLER ---
  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [field]: e.target.files[0] }));
      clearError(field);
    }
  };
  const handleObjFileChange = (e, arrayField, index, key) => {
    if (e.target.files && e.target.files[0]) {
      handleObjArrayChange(arrayField, index, key, e.target.files[0]);
    }
  };
  const [activeSection, setActiveSection] = useState("hero");

  const sections = [
    { id: "hero", icon: <FaGem />, label: t("gateForm.sections.hero.title") },
    {
      id: "problem",
      icon: <FaUserInjured />,
      label: t("gateForm.sections.problem.title"),
    },
    {
      id: "solution",
      icon: <FaCheckCircle />,
      label: t("gateForm.sections.solution.title"),
    },
    { id: "how", icon: <FaCogs />, label: t("gateForm.sections.how.title") },
    {
      id: "benefits",
      icon: <FaChartLine />,
      label: t("gateForm.sections.benefits.title"),
    },
    {
      id: "testimonials",
      icon: <FaQuoteLeft />,
      label: t("gateForm.sections.testimonials.title"),
    },
    {
      id: "integrations",
      icon: <FaLock />,
      label: t("gateForm.sections.integrations.title"),
    },
    {
      id: "faq",
      icon: <FaQuestionCircle />,
      label: t("gateForm.sections.faq.title"),
    },
    { id: "audio", icon: <FaPlus />, label: "Audio Background" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of sections) {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="gate-editor-container">
      {/* Header */}
      <div className="gate-editor-header">
        <div className="gate-header-content">
          <div className="d-flex align-items-center">
            <button className="gate-back-btn" onClick={onCancel}>
              <FaArrowLeft />
            </button>
            <div>
              <h4 className="gate-title">{t("gateForm.title")}</h4>
              <span className="gate-subtitle text-muted small">
                Configuring landing page structure
              </span>
            </div>
          </div>
          <div>
            <Button
              variant="light"
              className="btn-secondary-ghost me-3"
              onClick={onCancel}
            >
              {t("gateForm.cancel")}
            </Button>
            <Button
              variant="outline-primary"
              className="btn-preview-gate me-3"
              onClick={() => setShowPreview(true)}
            >
              <FaEye className="me-2" /> {t("gateForm.preview") || "Preview"}
            </Button>
            <Button
              className="btn-primary-styled"
              onClick={() => onSave(formData)}
            >
              {t("gateForm.save")}
            </Button>
          </div>
        </div>
      </div>

      <div className="gate-form-content">
        <Row className="gx-5">
          {/* Sidebar Nav */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="gate-editor-sidebar">
              <div className="sidebar-nav-list">
                {sections?.map((section) => (
                  <button
                    key={section.id}
                    className={`sidebar-nav-item ${activeSection === section.id ? "active" : ""} ${hasSectionError(section.id) ? "has-error border-start border-danger" : ""}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    <span className="nav-item-icon">{section.icon}</span>
                    <span className="nav-item-label">{section.label}</span>
                    {hasSectionError(section.id) && (
                      <FaExclamationCircle className="ms-auto text-danger animate__animated animate__pulse animate__infinite" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Col>

          {/* Form Areas */}
          <Col lg={9}>
            {/* 1. HERO SECTION */}
            <div className="gate-card" id="section-hero">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaGem />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.hero.title")}
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.gateName") || "Gate Name"}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.gateName || validationErrors.gate_name ? "is-invalid" : ""}`}
                  placeholder="Enter gate name..."
                  value={formData.gateName || ""}
                  onChange={(e) => handleChange("gateName", e.target.value)}
                />
                {renderError("gateName")}
                {renderError("gate_name")}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.gateType") || "Gate Type"}
                </Form.Label>
                <Form.Select
                  className={`gate-input ${validationErrors.gateType || validationErrors.gate_type ? "is-invalid" : ""}`}
                  value={formData.gateType || ""}
                  onChange={(e) => handleChange("gateType", e.target.value)}
                >
                  <option value="">
                    {t("gateForm.selectGateType") || "Select Gate Type"}
                  </option>
                  <option value="Entreprises">
                    {t("gateForm.gateTypeOptions.Entreprises") || "Entreprises"}
                  </option>
                  <option value="Profession">
                    {t("gateForm.gateTypeOptions.Profession") || "Profession"}
                  </option>
                  <option value="Applications">
                    {t("gateForm.gateTypeOptions.Applications") ||
                      "Applications"}
                  </option>
                  <option value="Prestations">
                    {t("gateForm.gateTypeOptions.Prestations") ||
                      "Prestations"}
                  </option>
                </Form.Select>
                {renderError("gateType")}
                {renderError("gate_type")}
              </Form.Group>
              {/* 
              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.landingPageType") || "Landing Page URL"}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder="Enter landing page URL..."
                  value={formData.landingPageUrl || ""}
                  onChange={(e) =>
                    handleChange("landingPageUrl", e.target.value)
                  }
                />
              </Form.Group> */}

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.selectedContract") || "Selected Contract"}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  // placeholder="No contract selected"
                  value={formData.contractName || ""}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.hero.h1")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.heroTitle || validationErrors.title ? "is-invalid" : ""}`}
                  placeholder=""
                  value={formData.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                />
                {renderError("heroTitle")}
                {renderError("title")}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.hero.subtitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.heroSubtitle || validationErrors.subtitle ? "is-invalid" : ""}`}
                  placeholder=""
                  value={formData.heroSubtitle}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                />
                {renderError("heroSubtitle")}
                {renderError("subtitle")}
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.hero.benefits")}
                </Form.Label>
                <Row className="g-3">
                  {formData?.heroBenefits?.map((benefit, idx) => (
                    <Col md={4} key={idx}>
                      <Form.Control
                        type="text"
                        className="gate-input"
                        placeholder={t(
                          "gateForm.sections.hero.benefitPlaceholder",
                          { index: idx + 1 },
                        )}
                        value={benefit}
                        onChange={(e) =>
                          handleArrayChange("heroBenefits", idx, e.target.value)
                        }
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="section-label">
                      {t("gateForm.sections.hero.ctaPrimary")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="gate-input"
                      placeholder=""
                      value={formData.heroCtaPrimary}
                      onChange={(e) =>
                        handleChange("heroCtaPrimary", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="section-label-small">
                      Link (URL)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="gate-input"
                      placeholder="https://..."
                      value={formData.heroCtaPrimaryLink}
                      onChange={(e) =>
                        handleChange("heroCtaPrimaryLink", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="section-label">
                      {t("gateForm.sections.hero.ctaSecondary")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="gate-input"
                      placeholder=""
                      value={formData.heroCtaSecondary}
                      onChange={(e) =>
                        handleChange("heroCtaSecondary", e.target.value)
                      }
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="section-label-small">
                      Link (URL)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="gate-input"
                      placeholder="https://..."
                      value={formData.heroCtaSecondaryLink}
                      onChange={(e) =>
                        handleChange("heroCtaSecondaryLink", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label className="section-label">
                  {t("gateForm.sections.hero.media")}
                </Form.Label>
                <div className="media-type-selector mb-3">
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.image")}
                    type="radio"
                    name="heroMediaType"
                    id="hero-img"
                    checked={formData.heroMediaType === "image"}
                    onChange={() => handleChange("heroMediaType", "image")}
                  />
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.video")}
                    type="radio"
                    name="heroMediaType"
                    id="hero-video"
                    checked={formData.heroMediaType === "video"}
                    onChange={() => handleChange("heroMediaType", "video")}
                  />
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.youtube")}
                    type="radio"
                    name="heroMediaType"
                    id="hero-youtube"
                    checked={formData.heroMediaType === "youtube"}
                    onChange={() => handleChange("heroMediaType", "youtube")}
                  />
                </div>

                {formData.heroMediaType === "youtube" ? (
                  <Form.Group className="mb-3">
                    <Form.Label className="section-label-small">
                      {t("gateForm.sections.hero.youtubeUrl")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className="gate-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.heroYoutubeUrl}
                      onChange={(e) =>
                        handleChange("heroYoutubeUrl", e.target.value)
                      }
                    />
                  </Form.Group>
                ) : (
                  <div className="custom-file-upload mb-3">
                    <input
                      type="file"
                      accept={
                        formData.heroMediaType === "video"
                          ? "video/*"
                          : "image/*"
                      }
                      onChange={(e) => handleFileChange(e, "heroMediaFile")}
                    />
                    <div className="upload-placeholder">
                      <BsCloudUpload className="upload-icon" />
                      {formData.heroMediaFile &&
                      typeof formData.heroMediaFile === "string" ? (
                        <div className="d-flex flex-column align-items-center mt-2">
                          {formData.heroMediaType === "video" ? (
                            <video
                              src={formData.heroMediaFile}
                              style={{
                                maxHeight: "100px",
                                maxWidth: "100%",
                                borderRadius: "4px",
                              }}
                              controls
                              muted
                            />
                          ) : (
                            <img
                              src={formData.heroMediaFile}
                              alt="Preview"
                              style={{
                                maxHeight: "100px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: "4px",
                              }}
                            />
                          )}
                          <span className="text-muted small mt-1">
                            {t("gateForm.existingImage") || "Existing Media"}
                          </span>
                        </div>
                      ) : (
                        <span>
                          {formData.heroMediaFile instanceof File
                            ? formData.heroMediaFile.name
                            : t("gateForm.sections.hero.upload") ||
                              "Click or Drag to Upload Media"}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {formData.heroMediaType === "video" && (
                  <Form.Check
                    type="switch"
                    label={t("gateForm.sections.hero.autoplay")}
                    id="hero-autoplay"
                    checked={formData.heroAutoplay}
                    onChange={(e) =>
                      handleChange("heroAutoplay", e.target.checked)
                    }
                    className="mb-3"
                  />
                )}

                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder={t("gateForm.sections.hero.altText")}
                  value={formData.heroAltText}
                  onChange={(e) => handleChange("heroAltText", e.target.value)}
                />
              </div>
            </div>

            {/* 2. LE PROBLÈME UTILISATEUR */}
            <div className="gate-card" id="section-problem">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaUserInjured />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.problem.title")}
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.problem.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.problemTitle || validationErrors.problem_title ? "is-invalid" : ""}`}
                  value={formData.problemTitle}
                  onChange={(e) => handleChange("problemTitle", e.target.value)}
                />
                {renderError("problemTitle")}
                {renderError("problem_title")}
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.problem.problems")}
                </Form.Label>
                <div className="editor-field-group">
                  {formData?.problems?.map((prob, idx) => (
                    <div className="d-flex mb-2 align-items-center" key={idx}>
                      <Form.Control
                        type="text"
                        className="gate-input"
                        placeholder={t("gateForm.sections.problem.placeholder")}
                        value={prob}
                        onChange={(e) =>
                          handleArrayChange("problems", idx, e.target.value)
                        }
                      />
                      <Button
                        variant="link"
                        className="text-danger p-0 ms-2"
                        onClick={() => removeArrayItem("problems", idx)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                  <button
                    className="btn btn-link add-item-btn"
                    onClick={() => addArrayItem("problems")}
                  >
                    <FaPlusCircle /> {t("gateForm.sections.problem.add")}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <Form.Label className="section-label">
                  {t("gateForm.sections.problem.media")}
                </Form.Label>
                <div className="media-type-selector mb-3">
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.image")}
                    type="radio"
                    name="probMedia"
                    checked={formData.problemMediaType === "image"}
                    onChange={() => handleChange("problemMediaType", "image")}
                  />
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.video")}
                    type="radio"
                    name="probMedia"
                    checked={formData.problemMediaType === "video"}
                    onChange={() => handleChange("problemMediaType", "video")}
                  />
                </div>
                <div className="custom-file-upload mb-3">
                  <input
                    type="file"
                    accept={
                      formData.problemMediaType === "video"
                        ? "video/*"
                        : "image/*"
                    }
                    onChange={(e) => handleFileChange(e, "problemMediaFile")}
                  />
                  <div
                    className={`upload-placeholder ${validationErrors.problemMediaFile || validationErrors.problem_media_file ? "border-danger" : ""}`}
                  >
                    <BsCloudUpload className="upload-icon" />
                    {formData.problemMediaFile &&
                    typeof formData.problemMediaFile === "string" ? (
                      <div className="d-flex flex-column align-items-center mt-2">
                        {formData.problemMediaType === "video" ? (
                          <video
                            src={formData.problemMediaFile}
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              borderRadius: "4px",
                            }}
                            controls
                            muted
                          />
                        ) : (
                          <img
                            src={formData.problemMediaFile}
                            alt="Preview"
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <span className="text-muted small mt-1">
                          {t("gateForm.existingImage") || "Existing Media"}
                        </span>
                      </div>
                    ) : (
                      <span>
                        {formData.problemMediaFile instanceof File
                          ? formData.problemMediaFile.name
                          : "Upload Media"}
                      </span>
                    )}
                  </div>
                </div>
                {renderError("problemMediaFile")}
                {renderError("problem_media_file")}
                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder={t("gateForm.sections.problem.mediaDesc")}
                  value={formData.problemMediaDesc}
                  onChange={(e) =>
                    handleChange("problemMediaDesc", e.target.value)
                  }
                />
              </div>
            </div>

            {/* 3. LA SOLUTION TEKTIME */}
            <div className="gate-card" id="section-solution">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaCheckCircle />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.solution.title")}
                </div>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.solution.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.solutionTitle || validationErrors.solution_title ? "is-invalid" : ""}`}
                  value={formData.solutionTitle}
                  onChange={(e) =>
                    handleChange("solutionTitle", e.target.value)
                  }
                />
                {renderError("solutionTitle")}
                {renderError("solution_title")}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.solution.intro")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.solutionIntro || validationErrors.solution_intro ? "is-invalid" : ""}`}
                  placeholder=""
                  value={formData.solutionIntro}
                  onChange={(e) =>
                    handleChange("solutionIntro", e.target.value)
                  }
                />
                {renderError("solutionIntro")}
                {renderError("solution_intro")}
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.solution.features")}
                </Form.Label>

                {formData?.features?.map((feature, idx) => (
                  <div className="feature-block" key={idx}>
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold text-primary">
                        {t("gateForm.sections.solution.featureTitle", {
                          index: idx + 1,
                        })}
                      </h6>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => removeObjItem("features", idx)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                    <Form.Control
                      type="text"
                      className="gate-input mb-2"
                      placeholder={t("gateForm.sections.solution.featureName")}
                      value={feature.title}
                      onChange={(e) =>
                        handleObjArrayChange(
                          "features",
                          idx,
                          "title",
                          e.target.value,
                        )
                      }
                    />
                    <Form.Control
                      as="textarea"
                      className="gate-input mb-2"
                      rows={2}
                      placeholder={t("gateForm.sections.solution.featureDesc")}
                      value={feature.desc}
                      onChange={(e) =>
                        handleObjArrayChange(
                          "features",
                          idx,
                          "desc",
                          e.target.value,
                        )
                      }
                    />

                    <Form.Label className="small text-muted mb-1">
                      {t("gateForm.sections.solution.media")}
                    </Form.Label>
                    <div className="media-type-selector mb-2">
                      <Form.Check
                        inline
                        label={t("gateForm.sections.hero.image")}
                        type="radio"
                        name={`featMedia${idx}`}
                        checked={feature.mediaType === "image"}
                        onChange={() =>
                          handleObjArrayChange(
                            "features",
                            idx,
                            "mediaType",
                            "image",
                          )
                        }
                      />
                      <Form.Check
                        inline
                        label={t("gateForm.sections.hero.video")}
                        type="radio"
                        name={`featMedia${idx}`}
                        checked={feature.mediaType === "video"}
                        onChange={() =>
                          handleObjArrayChange(
                            "features",
                            idx,
                            "mediaType",
                            "video",
                          )
                        }
                      />
                    </div>
                    <div
                      className="custom-file-upload p-2 border rounded bg-white"
                      style={{ position: "relative" }}
                    >
                      <input
                        type="file"
                        accept={
                          feature.mediaType === "video" ? "video/*" : "image/*"
                        }
                        onChange={(e) =>
                          handleObjFileChange(e, "features", idx, "mediaFile")
                        }
                        style={{
                          opacity: 0,
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          top: 0,
                          left: 0,
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                      />
                      <div className="d-flex align-items-center justify-content-center">
                        {feature.mediaFile &&
                        typeof feature.mediaFile === "string" ? (
                          <div className="text-center">
                            <img
                              src={feature.mediaFile}
                              alt="Preview"
                              style={{
                                maxHeight: "60px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted small ms-2">
                            {feature.mediaFile instanceof File
                              ? feature.mediaFile.name
                              : "Click to select file..."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-link add-item-btn"
                  onClick={() =>
                    addObjItem("features", {
                      title: "",
                      desc: "",
                      mediaType: "image",
                      mediaFile: null,
                    })
                  }
                >
                  <FaPlusCircle /> {t("gateForm.sections.solution.add")}
                </button>
              </div>
            </div>

            {/* 4. COMMENT ÇA MARCHE */}
            <div className="gate-card" id="section-how">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaCogs />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.how.title")}
                </div>
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.how.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  value={formData.howTitle}
                  onChange={(e) => handleChange("howTitle", e.target.value)}
                />
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.how.steps")} (MAX 3)
                </Form.Label>
                {formData?.steps?.map((step, idx) => (
                  <div
                    className="feature-block"
                    key={idx}
                    style={{ borderLeft: "4px solid #0d6efd" }}
                  >
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold">
                        {t("gateForm.sections.how.stepTitle", {
                          index: idx + 1,
                        })}
                      </h6>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => removeObjItem("steps", idx)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                    <Form.Control
                      type="text"
                      className="gate-input mb-2"
                      placeholder={t("gateForm.sections.how.titlePlaceholder")}
                      value={step.title}
                      onChange={(e) =>
                        handleObjArrayChange(
                          "steps",
                          idx,
                          "title",
                          e.target.value,
                        )
                      }
                    />
                    <Form.Control
                      type="text"
                      className="gate-input mb-2"
                      placeholder={t("gateForm.sections.how.descPlaceholder")}
                      value={step.desc}
                      onChange={(e) =>
                        handleObjArrayChange(
                          "steps",
                          idx,
                          "desc",
                          e.target.value,
                        )
                      }
                    />

                    <Row className="mb-2">
                      <Col md={6}>
                        <Form.Label className="small text-muted">
                          {t("gateForm.sections.how.cardSubtitle") ||
                            "Card Subtitle"}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="gate-input"
                          placeholder="e.g. Quick action required"
                          value={step.cardSubtitle}
                          onChange={(e) =>
                            handleObjArrayChange(
                              "steps",
                              idx,
                              "cardSubtitle",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small text-muted">
                          {t("gateForm.sections.how.cardBtn") || "Card Button"}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="gate-input"
                          placeholder="e.g. Submit"
                          value={step.cardBtn}
                          onChange={(e) =>
                            handleObjArrayChange(
                              "steps",
                              idx,
                              "cardBtn",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                    </Row>

                    <Form.Label className="small text-muted mb-1">
                      {t("gateForm.sections.how.media")}
                    </Form.Label>
                    <div className="media-type-selector mb-3 border-bottom pb-2">
                      <Form.Check
                        inline
                        label={t("gateForm.sections.hero.image")}
                        type="radio"
                        name={`stepMedia${idx}`}
                        checked={step.mediaType !== "video"}
                        onChange={() =>
                          handleObjArrayChange(
                            "steps",
                            idx,
                            "mediaType",
                            "image",
                          )
                        }
                      />
                      <Form.Check
                        inline
                        label={t("gateForm.sections.hero.video")}
                        type="radio"
                        name={`stepMedia${idx}`}
                        checked={step.mediaType === "video"}
                        onChange={() =>
                          handleObjArrayChange(
                            "steps",
                            idx,
                            "mediaType",
                            "video",
                          )
                        }
                      />
                    </div>
                    <div
                      className="custom-file-upload p-2 border rounded bg-white"
                      style={{ position: "relative" }}
                    >
                      <input
                        type="file"
                        accept={
                          step.mediaType === "video" ? "video/*" : "image/*"
                        }
                        onChange={(e) =>
                          handleObjFileChange(e, "steps", idx, "mediaFile")
                        }
                        style={{
                          opacity: 0,
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          top: 0,
                          left: 0,
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                      />
                      <div className="d-flex align-items-center justify-content-center">
                        {step.mediaFile &&
                        typeof step.mediaFile === "string" ? (
                          <div className="text-center">
                            <img
                              src={step.mediaFile}
                              alt="Preview"
                              style={{
                                maxHeight: "60px",
                                maxWidth: "100%",
                                objectFit: "contain",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted small ms-2">
                            {step.mediaFile instanceof File
                              ? step.mediaFile.name
                              : "Select file..."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {formData.steps.length < 3 && (
                  <button
                    className="btn btn-link add-item-btn"
                    onClick={() =>
                      addObjItem("steps", {
                        title: "",
                        desc: "",
                        cardSubtitle: "",
                        cardBtn: "",
                        mediaFile: null,
                        mediaType: "image",
                      })
                    }
                  >
                    <FaPlusCircle /> {t("gateForm.sections.how.add")}
                  </button>
                )}
              </div>
            </div>

            {/* 5. BÉNÉFICES BUSINESS */}
            <div className="gate-card" id="section-benefits">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaChartLine />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.benefits.title")}
                </div>
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.benefits.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  value={formData.benefitsTitle}
                  onChange={(e) =>
                    handleChange("benefitsTitle", e.target.value)
                  }
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Label className="section-label">
                    {t("gateForm.sections.benefits.forYou")}
                  </Form.Label>
                  <div className="editor-field-group">
                    {formData?.benefitsForYou?.map((item, idx) => (
                      <div className="d-flex mb-1" key={idx}>
                        <Form.Control
                          size="sm"
                          type="text"
                          className="gate-input"
                          placeholder={t(
                            "gateForm.sections.benefits.placeholderYou",
                          )}
                          value={item}
                          onChange={(e) =>
                            handleArrayChange(
                              "benefitsForYou",
                              idx,
                              e.target.value,
                            )
                          }
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 ms-1"
                          onClick={() => removeArrayItem("benefitsForYou", idx)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                    <button
                      className="btn btn-link add-item-btn"
                      onClick={() => addArrayItem("benefitsForYou")}
                    >
                      <FaPlusCircle /> {t("gateForm.sections.benefits.add")}
                    </button>
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Label className="section-label">
                    {t("gateForm.sections.benefits.forClients")}
                  </Form.Label>
                  <div className="editor-field-group">
                    {formData?.benefitsForClients?.map((item, idx) => (
                      <div className="d-flex mb-1" key={idx}>
                        <Form.Control
                          size="sm"
                          type="text"
                          className="gate-input"
                          placeholder={t(
                            "gateForm.sections.benefits.placeholderClients",
                          )}
                          value={item}
                          onChange={(e) =>
                            handleArrayChange(
                              "benefitsForClients",
                              idx,
                              e.target.value,
                            )
                          }
                        />
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0 ms-1"
                          onClick={() =>
                            removeArrayItem("benefitsForClients", idx)
                          }
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    ))}
                    <button
                      className="btn btn-link add-item-btn"
                      onClick={() => addArrayItem("benefitsForClients")}
                    >
                      <FaPlusCircle /> {t("gateForm.sections.benefits.add")}
                    </button>
                  </div>
                </Col>
              </Row>

              <div className="mt-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.benefits.media")}
                </Form.Label>
                <div className="media-type-selector mb-3">
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.image")}
                    type="radio"
                    name="benMedia"
                    checked={formData.benefitsMediaType === "image"}
                    onChange={() => handleChange("benefitsMediaType", "image")}
                  />
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.video")}
                    type="radio"
                    name="benMedia"
                    checked={formData.benefitsMediaType === "video"}
                    onChange={() => handleChange("benefitsMediaType", "video")}
                  />
                </div>
                <div className="custom-file-upload mb-3">
                  <input
                    type="file"
                    accept={
                      formData.benefitsMediaType === "video"
                        ? "video/*"
                        : "image/*"
                    }
                    onChange={(e) => handleFileChange(e, "benefitsMediaFile")}
                  />
                  <div className="upload-placeholder">
                    <BsCloudUpload className="upload-icon" />
                    {formData.benefitsMediaFile &&
                    typeof formData.benefitsMediaFile === "string" ? (
                      <div className="d-flex flex-column align-items-center mt-2">
                        {formData.benefitsMediaType === "video" ? (
                          <video
                            src={formData.benefitsMediaFile}
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              borderRadius: "4px",
                            }}
                            controls
                            muted
                          />
                        ) : (
                          <img
                            src={formData.benefitsMediaFile}
                            alt="Preview"
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <span className="text-muted small mt-1">
                          {t("gateForm.existingImage") || "Existing Media"}
                        </span>
                      </div>
                    ) : (
                      <span>
                        {formData.benefitsMediaFile instanceof File
                          ? formData.benefitsMediaFile.name
                          : "Upload Media"}
                      </span>
                    )}
                  </div>
                </div>
                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder={t("gateForm.sections.benefits.keyFigure")}
                  value={formData.benefitsKeyFigure}
                  onChange={(e) =>
                    handleChange("benefitsKeyFigure", e.target.value)
                  }
                />
              </div>
            </div>

            {/* 6. TESTIMONIALS */}
            <div className="gate-card" id="section-testimonials">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaQuoteLeft />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.testimonials.title")}
                </div>
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.testimonials.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder="e.g. Loved by industry leaders"
                  value={formData.testimonialsTitle}
                  onChange={(e) =>
                    handleChange("testimonialsTitle", e.target.value)
                  }
                />
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.testimonials.list")}
                </Form.Label>
                {formData?.testimonials?.map((testi, idx) => (
                  <div
                    className="feature-block mb-3 p-3 border rounded"
                    key={idx}
                  >
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="fw-bold">
                        {t("gateForm.sections.testimonials.item")} {idx + 1}
                      </h6>
                      {formData.testimonials?.length > 1 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeObjItem("testimonials", idx)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                    <Form.Group className="mb-2">
                      <Form.Control
                        type="text"
                        className="gate-input mb-1"
                        placeholder={t(
                          "gateForm.sections.testimonials.fields.headline",
                        )}
                        value={testi.headline}
                        onChange={(e) =>
                          handleObjArrayChange(
                            "testimonials",
                            idx,
                            "headline",
                            e.target.value,
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Control
                        as="textarea"
                        className="gate-input mb-1"
                        rows={2}
                        placeholder={t(
                          "gateForm.sections.testimonials.fields.content",
                        )}
                        value={testi.content}
                        onChange={(e) =>
                          handleObjArrayChange(
                            "testimonials",
                            idx,
                            "content",
                            e.target.value,
                          )
                        }
                      />
                    </Form.Group>
                    <Row className="mb-2">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          className="gate-input"
                          placeholder={t(
                            "gateForm.sections.testimonials.fields.authorName",
                          )}
                          value={testi.authorName}
                          onChange={(e) =>
                            handleObjArrayChange(
                              "testimonials",
                              idx,
                              "authorName",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          className="gate-input"
                          placeholder={t(
                            "gateForm.sections.testimonials.fields.authorRole",
                          )}
                          value={testi.authorRole}
                          onChange={(e) =>
                            handleObjArrayChange(
                              "testimonials",
                              idx,
                              "authorRole",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                    </Row>
                    <div className="mt-2">
                      <Form.Label className="small text-muted mb-1">
                        {t("gateForm.sections.testimonials.fields.authorImage")}
                      </Form.Label>
                      <div
                        className="custom-file-upload p-2 border rounded bg-white"
                        style={{ position: "relative" }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleObjFileChange(
                              e,
                              "testimonials",
                              idx,
                              "authorImage",
                            )
                          }
                          style={{
                            opacity: 0,
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          }}
                        />
                        <div className="d-flex align-items-center justify-content-center">
                          {testi.authorImage &&
                          typeof testi.authorImage === "string" ? (
                            <div className="text-center">
                              <img
                                src={testi.authorImage}
                                alt="Preview"
                                style={{
                                  maxHeight: "60px",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          ) : (
                            <span className="text-muted small ms-2">
                              {testi.authorImage instanceof File
                                ? testi.authorImage.name
                                : t(
                                    "gateForm.sections.testimonials.fields.selectImage",
                                  )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-link add-item-btn"
                  onClick={() =>
                    addObjItem("testimonials", {
                      headline: "",
                      content: "",
                      authorName: "",
                      authorRole: "",
                      authorImage: null,
                    })
                  }
                >
                  <FaPlusCircle /> {t("gateForm.sections.testimonials.add")}
                </button>
              </div>
            </div>

            {/* 7. INTÉGRATIONS & SÉCURITÉ */}
            <div className="gate-card" id="section-integrations">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaLock />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.integrations.title")}
                </div>
              </div>
              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.integrations.sectionTitle")}
                </Form.Label>
                <Form.Control
                  type="text"
                  className={`gate-input ${validationErrors.integrationsTitle || validationErrors.integrations_title ? "is-invalid" : ""}`}
                  value={formData.integrationsTitle}
                  onChange={(e) =>
                    handleChange("integrationsTitle", e.target.value)
                  }
                />
                {renderError("integrationsTitle")}
                {renderError("integrations_title")}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.integrations.sectionDescription") ||
                    "Description"}
                </Form.Label>
                <Form.Control
                  type="text"
                  className="gate-input"
                  placeholder="Enter section description..."
                  value={formData.integrationsSubtitle}
                  onChange={(e) =>
                    handleChange("integrationsSubtitle", e.target.value)
                  }
                />
              </Form.Group>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.integrations.list")}
                </Form.Label>
                <p className="text-muted small">
                  {t("gateForm.sections.integrations.example")}
                </p>
                <div className="editor-field-group">
                  <Row className="g-2">
                    {formData?.integrationsList?.map((item, idx) => (
                      <Col md={3} key={idx}>
                        <Form.Control
                          size="sm"
                          type="text"
                          className="gate-input"
                          placeholder={t(
                            "gateForm.sections.integrations.placeholder",
                          )}
                          value={item}
                          onChange={(e) =>
                            handleArrayChange(
                              "integrationsList",
                              idx,
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                    ))}
                  </Row>
                  <button
                    className="btn btn-link add-item-btn"
                    onClick={() => addArrayItem("integrationsList")}
                  >
                    <FaPlusCircle />{" "}
                    {t("gateForm.sections.integrations.addTool")}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.integrations.security")}
                </Form.Label>
                <div className="editor-field-group">
                  {formData?.securityArgs?.map((arg, idx) => (
                    <div className="d-flex mb-2 align-items-center" key={idx}>
                      <Form.Control
                        type="text"
                        className="gate-input"
                        placeholder="Security argument..."
                        value={arg}
                        onChange={(e) =>
                          handleArrayChange("securityArgs", idx, e.target.value)
                        }
                      />
                      <Button
                        variant="link"
                        className="text-danger p-0 ms-2"
                        onClick={() => removeArrayItem("securityArgs", idx)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                  <button
                    className="btn btn-link add-item-btn"
                    onClick={() => addArrayItem("securityArgs")}
                  >
                    <FaPlusCircle />{" "}
                    {t("gateForm.sections.integrations.addSecurity")}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <Form.Label className="section-label">
                  {t("gateForm.sections.integrations.media") || "Media"}
                </Form.Label>
                <div className="media-type-selector mb-3">
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.image")}
                    type="radio"
                    name="intMedia"
                    checked={formData.integrationsMediaType === "image"}
                    onChange={() =>
                      handleChange("integrationsMediaType", "image")
                    }
                  />
                  <Form.Check
                    inline
                    label={t("gateForm.sections.hero.video")}
                    type="radio"
                    name="intMedia"
                    checked={formData.integrationsMediaType === "video"}
                    onChange={() =>
                      handleChange("integrationsMediaType", "video")
                    }
                  />
                </div>
                <div className="custom-file-upload mb-3">
                  <input
                    type="file"
                    accept={
                      formData.integrationsMediaType === "video"
                        ? "video/*"
                        : "image/*"
                    }
                    onChange={(e) =>
                      handleFileChange(e, "integrationsMediaFile")
                    }
                  />
                  <div className="upload-placeholder">
                    <BsCloudUpload className="upload-icon" />
                    {formData.integrationsMediaFile &&
                    typeof formData.integrationsMediaFile === "string" ? (
                      <div className="d-flex flex-column align-items-center mt-2">
                        {formData.integrationsMediaType === "video" ? (
                          <video
                            src={formData.integrationsMediaFile}
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              borderRadius: "4px",
                            }}
                            controls
                            muted
                          />
                        ) : (
                          <img
                            src={formData.integrationsMediaFile}
                            alt="Preview"
                            style={{
                              maxHeight: "100px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <span>
                        {formData.integrationsMediaFile instanceof File
                          ? formData.integrationsMediaFile.name
                          : "Upload Media"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. FAQ */}
            <div className="gate-card" id="section-faq">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaQuestionCircle />
                </div>
                <div className="gate-section-title-text">
                  {t("gateForm.sections.faq.title")}
                </div>
              </div>
              {formData?.faqItems?.map((faq, idx) => (
                <div className="feature-block mb-3" key={idx}>
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="fw-bold">
                      {t("gateForm.sections.faq.questionTitle", {
                        index: idx + 1,
                      })}
                    </h6>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => removeObjItem("faqItems", idx)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                  <Form.Control
                    type="text"
                    className="gate-input mb-2 fw-bold"
                    placeholder={t("gateForm.sections.faq.question")}
                    value={faq.question}
                    onChange={(e) =>
                      handleObjArrayChange(
                        "faqItems",
                        idx,
                        "question",
                        e.target.value,
                      )
                    }
                  />
                  <Form.Control
                    as="textarea"
                    className="gate-input mb-2"
                    rows={2}
                    placeholder={t("gateForm.sections.faq.answer")}
                    value={faq.answer}
                    onChange={(e) =>
                      handleObjArrayChange(
                        "faqItems",
                        idx,
                        "answer",
                        e.target.value,
                      )
                    }
                  />

                  <Form.Label className="small text-muted mb-1">
                    {t("gateForm.sections.faq.media")}
                  </Form.Label>
                  <div className="media-type-selector mb-3 border-bottom pb-2">
                    <Form.Check
                      inline
                      label={t("gateForm.sections.hero.image")}
                      type="radio"
                      name={`faqMedia${idx}`}
                      checked={faq.mediaType !== "video"}
                      onChange={() =>
                        handleObjArrayChange(
                          "faqItems",
                          idx,
                          "mediaType",
                          "image",
                        )
                      }
                    />
                    <Form.Check
                      inline
                      label={t("gateForm.sections.hero.video")}
                      type="radio"
                      name={`faqMedia${idx}`}
                      checked={faq.mediaType === "video"}
                      onChange={() =>
                        handleObjArrayChange(
                          "faqItems",
                          idx,
                          "mediaType",
                          "video",
                        )
                      }
                    />
                  </div>
                  <div
                    className="custom-file-upload p-2 border rounded bg-white"
                    style={{ position: "relative" }}
                  >
                    <input
                      type="file"
                      accept={faq.mediaType === "video" ? "video/*" : "image/*"}
                      onChange={(e) =>
                        handleObjFileChange(e, "faqItems", idx, "mediaFile")
                      }
                      style={{
                        opacity: 0,
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                    />
                    <div className="d-flex align-items-center justify-content-center">
                      {faq.mediaFile && typeof faq.mediaFile === "string" ? (
                        <div className="text-center">
                          <img
                            src={faq.mediaFile}
                            alt="Preview"
                            style={{
                              maxHeight: "60px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-muted small ms-2">
                          {faq.mediaFile instanceof File
                            ? faq.mediaFile.name
                            : "Select file..."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-link add-item-btn"
                onClick={() =>
                  addObjItem("faqItems", {
                    question: "",
                    answer: "",
                    mediaFile: null,
                    mediaType: "image",
                  })
                }
              >
                <FaPlusCircle /> {t("gateForm.sections.faq.add")}
              </button>
            </div>

            {/* 9. AUDIO SECTION */}
            <div className="gate-card" id="section-audio">
              <div className="gate-section-header">
                <div className="gate-section-icon">
                  <FaPlus />
                </div>
                <div className="gate-section-title-text">Background Audio</div>
              </div>
              <div className="mb-3">
                <Form.Label className="section-label">
                  Upload Audio File (MP3, WAV)
                </Form.Label>
                <div
                  className={`custom-file-upload mb-3 ${validationErrors.audioFile || validationErrors.audio_file ? "border-danger" : ""}`}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audioFile")}
                  />
                  <div className="upload-placeholder">
                    <BsCloudUpload className="upload-icon" />
                    {formData.audioFile ? (
                      <div className="d-flex flex-column align-items-center mt-2">
                        <audio
                          src={
                            typeof formData.audioFile === "string"
                              ? formData.audioFile
                              : URL.createObjectURL(formData.audioFile)
                          }
                          controls
                          style={{ maxHeight: "40px", maxWidth: "100%" }}
                        />
                        <span className="text-muted small mt-1">
                          {formData.audioFile instanceof File
                            ? formData.audioFile.name
                            : "Existing Audio"}
                        </span>
                      </div>
                    ) : (
                      <span>Click or Drag to Upload Audio</span>
                    )}
                  </div>
                </div>
                {renderError("audioFile")}
                {renderError("audio_file")}
                <p className="text-muted small">
                  This audio will play for 8 seconds when the landing page is
                  opened.
                </p>
              </div>
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-end mb-5 pt-4 border-top">
          <Button
            variant="light"
            className="btn-secondary-ghost me-3"
            onClick={onCancel}
          >
            {t("gateForm.cancel")}
          </Button>
          <Button
            variant="outline-primary"
            className="btn-preview-gate me-3"
            onClick={() => setShowPreview(true)}
          >
            <FaEye className="me-2" /> {t("gateForm.preview") || "Preview"}
          </Button>
          <Button
            className="btn-primary-styled btn-lg"
            onClick={() => onSave(formData)}
          >
            {t("gateForm.save")}
          </Button>
        </div>

        <Modal
          show={showPreview}
          onHide={() => setShowPreview(false)}
          fullscreen={true}
          className="gate-preview-modal"
        >
          <Modal.Header
            closeButton
            className="sticky-top bg-white border-bottom"
          >
            <Modal.Title className="fw-bold text-primary">
              <FaEye className="me-2" />{" "}
              {t("gateForm.previewTitle") || "Landing Page Preview"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <HomeMessages data={formData} />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

const GateCard = ({ item, onEdit, onDuplicate, onDelete, onPreview }) => {
  const [t] = useTranslation("global");
  // Use hero_media_path from API if available, otherwise fallback to random image
  const [displayImage] = useState(item.hero_media_path || null);
  const [openDropdown, setOpenDropdown] = useState(false);

  const renderDescription = () => {
    // Use subtitle or hero_subtitle from API
    const desc = item.subtitle || item.hero_subtitle || "";
    return (
      <div
        className="html-description"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    );
  };

  return (
    <div
      className="solution-card-wrapper"
      onClick={() => onPreview(item)}
      style={{ cursor: "pointer" }}
    >
      <div className="solution-card">
        {/* 1. TOP: Image */}
        {displayImage && (
          <div className="card-image">
            {item.hero_media_type === "video" ? (
              <video
                src={displayImage}
                muted
                autoPlay
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img src={displayImage} alt={item.title} />
            )}
          </div>
        )}

        {/* 2. MIDDLE: Title */}
        <div className="card-title text-center">
          <h5>{item.title}</h5>
        </div>

        {/* 3. BOTTOM */}
        <div className="card-bottom">
          <div className="card-description">{renderDescription()}</div>

          <div
            className="card-icons"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              paddingTop: "10px",
              borderTop: "1px solid #f0f0f0",
              marginTop: "5px",
            }}
          >
            <div
              className="type-badge"
              style={{
                fontSize: "0.75rem",
                backgroundColor: "#e0f2fe",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: "600",
                color: "#0369a1",
                position: "absolute",
                left: 0,
              }}
            >
              {item?.gate_type
                ? t(`gateForm.gateTypeOptions.${item.gate_type}`) ||
                  item.gate_type
                : item?.gate_name || ""}
            </div>

            <div className="privacy-badge">
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                {item?.click_counts || 0} {t("gateForm.listView.uses")}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="card-menu">
          <button
            className="menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(!openDropdown);
            }}
          >
            <BiDotsVerticalRounded size={20} />
          </button>
          {openDropdown && (
            <div
              className="dropdown-menu show"
              style={{ position: "absolute", right: 0, top: "40px" }}
            >
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                  setOpenDropdown(false);
                }}
              >
                <RiEditBoxLine className="me-2" />{" "}
                {t("gateForm.listView.edit") || "Modify"}
              </button>
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(item.id);
                  setOpenDropdown(false);
                }}
              >
                <IoCopyOutline className="me-2" />{" "}
                {t("gateForm.listView.duplicate") || "Duplicate"}
              </button>
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(item);
                  setOpenDropdown(false);
                }}
              >
                <FaEye className="me-2" /> {t("gateForm.preview") || "Preview"}
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                  setOpenDropdown(false);
                }}
              >
                <AiOutlineDelete className="me-2" />{" "}
                {t("gateForm.listView.delete") || "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Gates = () => {
  const [t] = useTranslation("global");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'create' or 'edit'
  const [isCardView, setIsCardView] = useState(true);
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGate, setEditingGate] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchGates = async () => {
    try {
      const token = CookieService.get("token");
      const response = await axios.get(`${API_BASE_URL}/landing-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract data from response.data.data.data mapping to the provided API structure
      if (response.data && response.data.success) {
        const dataArray =
          response.data.data && response.data.data.data
            ? response.data.data.data
            : [];
        setGates(dataArray);
      }
    } catch (error) {
      console.error("Error fetching gates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGates();
  }, []);

  const toCamelCase = (str) =>
    str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", ""),
    );

  const transformToCamelCase = (obj) => {
    if (obj === null || typeof obj !== "object" || obj instanceof File)
      return obj;
    if (Array.isArray(obj)) return obj?.map(transformToCamelCase);

    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key);
      acc[camelKey] = transformToCamelCase(obj[key]);
      return acc;
    }, {});
  };

  const mapApiToState = (data) => {
    const camelData = transformToCamelCase(data);

    // Helper to ensure field is an array
    const ensureArray = (key) => {
      if (!Array.isArray(camelData[key])) {
        if (
          typeof camelData[key] === "string" &&
          camelData[key].trim().startsWith("[")
        ) {
          try {
            camelData[key] = JSON.parse(camelData[key]);
          } catch (e) {
            camelData[key] = [];
          }
        } else {
          camelData[key] = [];
        }
      }
    };

    const arrayFields = [
      "heroBenefits",
      "problems",
      "features",
      "steps",
      "benefitsForYou",
      "benefitsForClients",
      "testimonials",
      "integrationsList",
      "securityArgs",
      "faqItems",
    ];
    arrayFields.forEach(ensureArray);

    // Extract contract names if 'contracts' array exists
    if (data.contracts && Array.isArray(data.contracts)) {
      camelData.contractName = data.contracts.map((c) => c.name).join(", ");
    }

    // Helper to map path string to file field
    const mapPath = (obj, pathKey, fileKey) => {
      if (obj[pathKey] && !obj[fileKey]) {
        obj[fileKey] = obj[pathKey];
      }
    };

    mapPath(camelData, "heroMediaPath", "heroMediaFile");
    mapPath(camelData, "problemMediaPath", "problemMediaFile");
    mapPath(camelData, "benefitsMediaPath", "benefitsMediaFile");
    mapPath(camelData, "integrationsMediaPath", "integrationsMediaFile");
    if (data.hero_youtube_url && !camelData.heroYoutubeUrl) {
      camelData.heroYoutubeUrl = data.hero_youtube_url;
    }

    // Sync root title/subtitle to heroTitle/heroSubtitle for form consistency
    if (camelData.title && !camelData.heroTitle)
      camelData.heroTitle = camelData.title;
    if (camelData.subtitle && !camelData.heroSubtitle)
      camelData.heroSubtitle = camelData.subtitle;
    if (camelData.gateName === undefined && data.gate_name)
      camelData.gateName = data.gate_name;
    if (camelData.gateType === undefined && data.gate_type)
      camelData.gateType = data.gate_type;
    // if (camelData.landingPageUrl === undefined && data.landing_page_url)
    //   camelData.landingPageUrl = data.landing_page_url;

    if (Array.isArray(camelData.features)) {
      camelData.features.forEach((f) => mapPath(f, "mediaPath", "mediaFile"));
    }
    if (Array.isArray(camelData.steps)) {
      camelData.steps.forEach((s) => mapPath(s, "mediaPath", "mediaFile"));
    }
    if (Array.isArray(camelData.testimonials)) {
      camelData.testimonials.forEach((t) =>
        mapPath(t, "authorImagePath", "authorImage"),
      );
    }
    if (Array.isArray(camelData.faqItems)) {
      camelData.faqItems.forEach((f) => mapPath(f, "mediaPath", "mediaFile"));
    }

    mapPath(camelData, "audioPath", "audioFile");

    return camelData;
  };

  const handleEditGate = async (gate) => {
    try {
      setLoading(true);
      const token = CookieService.get("token");
      const response = await axios.get(
        `${API_BASE_URL}/landing-pages/${gate.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data && response.data.success) {
        const fullGate = response.data.data;
        setEditingGate(mapApiToState(fullGate));
        setViewMode("edit");
      }
    } catch (error) {
      console.error("Error fetching gate details:", error);
      toast.error(t("gateForm.detailError") || "Error loading gate details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGate = async (id) => {
    if (
      !window.confirm(
        t("gateForm.confirmDelete") ||
          "Are you sure you want to delete this gate?",
      )
    )
      return;
    try {
      const token = CookieService.get("token");
      await axios.delete(`${API_BASE_URL}/landing-pages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("gateForm.deleteSuccess") || "Gate deleted successfully");
      setGates(gates.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting gate:", error);
      toast.error(t("gateForm.deleteError") || "Error deleting gate");
    }
  };

  const handleDuplicateGate = async (id) => {
    try {
      const token = CookieService.get("token");
      const response = await axios.post(
        `${API_BASE_URL}/landing-pages/${id}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data && response.data.success) {
        toast.success(
          t("gateForm.duplicateSuccess") || "Gate duplicated successfully",
        );
        fetchGates(); // Refresh list to get the new duplicate
      }
    } catch (error) {
      // If duplicate endpoint doesn't exist, fallback to fetch and create?
      // For now just error
      console.error("Error duplicating gate:", error);
      toast.error(t("gateForm.duplicateError") || "Error duplicating gate");
    }
  };

  const handlePreviewGate = (gate) => {
    setPreviewData(gate);
  };

  const handleSaveGate = async (newGateData) => {
    setValidationErrors({});
    try {
      const token = CookieService.get("token");
      const formData = new FormData();

      // Helper to convert camelCase to snake_case
      const toSnakeCase = (str) =>
        str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      // Recursive function to transform all keys in an object/array to snake_case
      const transformToSnakeCase = (obj) => {
        if (obj === null || typeof obj !== "object" || obj instanceof File) {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map(transformToSnakeCase);
        }
        return Object.keys(obj).reduce((acc, key) => {
          const snakeKey = toSnakeCase(key);
          acc[snakeKey] = transformToSnakeCase(obj[key]);
          return acc;
        }, {});
      };

      // Prepare the payload
      // 1. Convert everything to snake_case first
      const baseData = transformToSnakeCase(newGateData);

      // 2. Map hero_title/subtitle to root title/subtitle if backend expects that
      const payload = {
        ...baseData,
        gate_name: newGateData.gateName || "",
        // landing_page_url: newGateData.landingPageUrl || "",
        landing_page_type: newGateData.landingPageType || "Message",
        title: newGateData.heroTitle || "",
        subtitle: newGateData.heroSubtitle || "",
      };

      // Recursive helper to append entries to FormData
      const appendToFormData = (key, value) => {
        if (value === null || value === undefined) return;

        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (
              item !== null &&
              typeof item === "object" &&
              !(item instanceof File)
            ) {
              Object.keys(item).forEach((subKey) => {
                appendToFormData(`${key}[${index}][${subKey}]`, item[subKey]);
              });
            } else if (item !== undefined && item !== null) {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (value !== null && typeof value === "object") {
          Object.keys(value).forEach((subKey) => {
            appendToFormData(`${key}[${subKey}]`, value[subKey]);
          });
        } else {
          formData.append(key, value);
        }
      };

      // Append all data to FormData
      Object.keys(payload).forEach((key) => {
        appendToFormData(key, payload[key]);
      });

      // Ensure landing_page_type is explicitly in the FormData
      if (newGateData.landingPageType) {
        formData.delete("landing_page_type"); // avoid duplicates
        formData.append("landing_page_type", newGateData.landingPageType);
      } else {
        formData.append("landing_page_type", "Message");
      }

      if (editingGate) {
        // UPDATE FLOW
        formData.append("_method", "PUT"); // Explicitly required in payload

        const response = await axios.post(
          `${API_BASE_URL}/landing-pages/${editingGate.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200 || response.status === 201) {
          toast.success(
            t("gateForm.updateSuccess") || "Gate updated successfully",
          );
          fetchGates();
          setViewMode("list");
          setEditingGate(null);
        }
      } else {
        // CREATE FLOW
        const response = await axios.post(
          `${API_BASE_URL}/landing-pages`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200 || response.status === 201) {
          toast.success(
            t("gateForm.saveSuccess") || "Gate created successfully",
          );
          fetchGates();
          setViewMode("list");
        }
      }
    } catch (error) {
      console.error("Error saving gate:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        setValidationErrors(error.response.data.errors);
        const errorData = error.response.data.errors;
        const firstField = Object.keys(errorData)[0];
        const fieldDisplayName = firstField
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        const firstMessage = Array.isArray(errorData[firstField])
          ? errorData[firstField][0]
          : errorData[firstField];

        // Ensure the toast is descriptive by including the field name if not already there
        const finalToastMessage = firstMessage
          .toLowerCase()
          .includes(fieldDisplayName.toLowerCase())
          ? firstMessage
          : `${fieldDisplayName}: ${firstMessage}`;

        toast.error(finalToastMessage);
      } else {
        toast.error(t("gateForm.saveError") || "Error saving gate");
      }
    }
  };

  return (
    <div className="gates-container py-3">
      {/* Header */}
      {viewMode === "list" && (
        <div className="gates-list-header d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 px-3 gap-3">
          <h5 className="mb-0 text-primary fw-bold text-nowrap">
            {t("gateForm.listView.title")}
          </h5>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Toggle View Buttons */}
            <div className="view-toggle-container">
              <div className="toggle-buttons d-flex">
                <button
                  className={`toggle-btn ${isCardView ? "active" : ""}`}
                  onClick={() => setIsCardView(true)}
                  title={t("gateForm.listView.cardView")}
                >
                  <FaTh className="toggle-icon" />
                  <span className="d-none d-sm-inline ms-1">
                    {t("gateForm.listView.cardView")}
                  </span>
                </button>
                <button
                  className={`toggle-btn ${!isCardView ? "active" : ""}`}
                  onClick={() => setIsCardView(false)}
                  title={t("gateForm.listView.listView")}
                >
                  <FaList className="toggle-icon" />
                  <span className="d-none d-sm-inline ms-1">
                    {t("gateForm.listView.listView")}
                  </span>
                </button>
              </div>
            </div>

            <Button
              className="create-gate-btn"
              onClick={() => setViewMode("create")}
            >
              <FaPlus />{" "}
              <span className="d-none d-sm-inline ms-1">
                {t("gateForm.listView.create")}
              </span>
            </Button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <Container fluid>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading gates...</p>
            </div>
          ) : isCardView ? (
            <Row className="g-3">
              {gates
                ?.filter((gate) => gate.gate_name !== "Tektime")
                .map((gate) => (
                  <Col key={gate.id} xs={12} md={6} lg={4} xl={3}>
                    <GateCard
                      item={gate}
                      onEdit={handleEditGate}
                      onDuplicate={handleDuplicateGate}
                      onDelete={handleDeleteGate}
                      onPreview={handlePreviewGate}
                    />
                  </Col>
                ))}
            </Row>
          ) : (
            // Fallback List View
            <ul className="list-group">
              {gates
                ?.filter((gate) => gate.gate_name !== "Tektime")
                .map((gate) => (
                  <li
                    key={gate.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5>{gate.title}</h5>
                      <small className="text-muted">
                        {gate.click_counts} {t("gateForm.listView.uses")}
                      </small>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handlePreviewGate(gate)}
                    >
                      {t("gateForm.listView.view")}
                    </Button>
                  </li>
                ))}
            </ul>
          )}
        </Container>
      ) : (
        <GateEditor
          onCancel={() => {
            setViewMode("list");
            setEditingGate(null);
            setValidationErrors({});
          }}
          onSave={handleSaveGate}
          initialData={editingGate}
          validationErrors={validationErrors}
          setValidationErrors={setValidationErrors}
        />
      )}

      {/* Global Preview Modal */}
      <Modal
        show={!!previewData}
        onHide={() => setPreviewData(null)}
        fullscreen={true}
        className="gate-preview-modal"
      >
        <Modal.Header closeButton className="sticky-top bg-white border-bottom">
          <Modal.Title className="fw-bold text-primary">
            <FaEye className="me-2" />{" "}
            {t("gateForm.previewTitle") || "Landing Page Preview"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {previewData && <HomeMessages data={previewData} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Gates;
