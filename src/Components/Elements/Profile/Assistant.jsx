import CookieService from '../../Utils/CookieService';
import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineUser,
  AiOutlineCamera,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineEdit,
  AiOutlineClose,
  AiOutlineUpload,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { MdOutlineDescription, MdOutlineVerified } from "react-icons/md";
import { BsGlobe } from "react-icons/bs";
import { TbRefresh } from "react-icons/tb";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../Apicongfig";
import { getAssistantProfile } from "../Discussion/api";
import { Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";

const Assistant = () => {
  const AssistantLogo = "/Assets/sidebar-invite-logo.svg";
  const { t } = useTranslation("global");

  const [assistantData, setAssistantData] = useState({
    name: "TekTime",
    description: t("assistantProfile.descriptionPlaceholder"),
    image: AssistantLogo,
    lastUpdated: t("assistantProfile.justNow"),
  });

  const [formData, setFormData] = useState({
    name: "TekTime",
    description: t("assistantProfile.descriptionPlaceholder"),
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(AssistantLogo);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getAssistantProfile();
        if (response && response.data) {
          const { name, description, logo, updated_at } = response.data;
          let logoUrl = AssistantLogo;
          if (logo) {
            if (logo === AssistantLogo) {
              logoUrl = AssistantLogo;
            } else if (logo.startsWith("http") || logo.startsWith("data:")) {
              logoUrl = logo;
            } else {
              logoUrl = `${Assets_URL}/${logo.replace(/^\//, "")}`;
            }
          }
          const assistantName = name || "TekTime";

          setAssistantData({
            name: assistantName,
            description:
              description || t("assistantProfile.descriptionPlaceholder"),
            image: logoUrl,
            lastUpdated: updated_at
              ? new Date(updated_at).toLocaleDateString()
              : t("assistantProfile.justNow"),
          });

          setFormData((prev) => ({
            ...prev,
            name: assistantName,
            description: description || "",
            image: null, // For file input
          }));
          setPreviewUrl(logoUrl);
        }
      } catch (error) {
        console.error("Error fetching assistant profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const fileInputRef = useRef(null);

  const handleOpenModal = () => {
    setFormData({
      name: assistantData.name,
      description: assistantData.description,
      image: null,
    });
    setPreviewUrl(assistantData.image);
    setUploadStatus({ type: "", message: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        type: "error",
        message: t("assistantProfile.imageFormatError"),
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        type: "error",
        message: t("assistantProfile.imageSizeError"),
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setFormData((prev) => ({ ...prev, image: file }));
      setUploadStatus({
        type: "success",
        message: t("assistantProfile.imageReady"),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    validateAndProcessFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setUploadStatus({
        type: "error",
        message: t("assistantProfile.nameRequired"),
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = JSON.parse(CookieService.get("user"));
      const userId = user?.id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const payload = new FormData();
      payload.append("user_id", userId);
      payload.append("id", "");
      payload.append("name", formData.name);
      payload.append("description", formData.description);

      if (formData.image instanceof File) {
        payload.append("logo", formData.image);
      } else {
        payload.append("logo", "");
      }

      const response = await axios.post(
        `${API_BASE_URL}/assistant/store-or-update`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setAssistantData({
          ...assistantData,
          name: formData.name,
          description: formData.description,
          image: previewUrl,
          lastUpdated: "Just now",
        });

        // Sync with global cache for sidebar and tabs
        const updatedProfile = {
          name: formData.name,
          logo:
            response.data?.data?.logo ||
            response.data?.logo ||
            assistantData.image,
        };
        CookieService.set(
          "assistant_profile",
          JSON.stringify(updatedProfile),
        );

        // Notify other components (Sidebar, Tabs) to update
        window.dispatchEvent(new Event("assistantProfileUpdated"));

        toast.success(t("assistantProfile.updateSuccess"));
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error updating assistant:", error);
      setUploadStatus({
        type: "error",
        message: `Error: ${error.response?.data?.message || error.message}`,
      });
      toast.error(t("assistantProfile.updateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="assistant-container">
      <style>{`
        /* Main Container */
        .assistant-container {
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        
        /* Background decorative elements */
        .assistant-container::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 60%;
          height: 120%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(99, 102, 241, 0.02) 100%);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          z-index: 0;
        }
        
        /* Header Section */
        .assistant-header {
          width: 100%;
          max-width: 1200px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        
        .header-title h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .header-title p {
          color: #64748b;
          margin-top: 0.5rem;
          font-size: 1rem;
        }
        
        .header-actions {
          display: flex;
          gap: 1rem;
        }
        
        .header-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .header-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        .header-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
        }
        
        .header-btn.primary:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }
        
        /* Main Card */
        .assistant-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
          width: 100%;
          max-width: 1200px;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
        }
        
        /* Card Header with gradient */
        .card-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .profile-mega {
          position: relative;
        }
        
        .profile-badge {
          position: absolute;
          bottom: 5px;
          right: 5px;
          background: #10b981;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          z-index: 2;
        }
        
        .profile-image-mega {
          width: 120px;
          height: 120px;
          border-radius: 24px;
          object-fit: cover;
          border: 4px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }
        
        .header-info h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .header-info p {
          color: #cbd5e1;
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
          max-width: 600px;
          line-height: 1.6;
        }
        
        /* Status Badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        /* Card Body */
        .card-body {
          padding: 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        
        /* Info Section */
        .info-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .info-grid {
          display: grid;
          gap: 1.5rem;
        }
        
        .info-item {
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 16px;
          border-left: 4px solid #3b82f6;
          transition: transform 0.2s ease;
        }
        
        .info-item:hover {
          transform: translateX(5px);
          background: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }
        
        .info-label {
          display: block;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        
        .info-value {
          font-size: 1rem;
          color: #0f172a;
          font-weight: 500;
        }
        
        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6 0%, #1e293b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }
        
        /* Edit Button */
        .edit-btn-main {
          position: absolute;
          top: 2rem;
          right: 2rem;
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #475569;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .edit-btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
          border-color: #3b82f6;
          color: #3b82f6;
        }
        
        /* Modal Styles */
        .assistant-edit-modal .modal-content {
          border-radius: 24px;
          border: none;
          box-shadow: 0 50px 100px -20px rgba(50, 50, 93, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .assistant-edit-modal .modal-dialog {
          max-width: 600px;
          margin: 2rem auto;
        }
        
        .modal-custom-header {
          padding: 2rem 2rem 1rem;
          text-align: center;
        }
        
        .modal-custom-header h3 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }
        
        .modal-custom-header p {
          color: #64748b;
          margin: 0;
        }
        
        .close-btn-custom {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          color: #64748b;
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .close-btn-custom:hover {
          background: white;
          color: #ef4444;
          transform: rotate(90deg);
        }
        
        .modal-custom-body {
          padding: 2rem;
        }
        
        /* Upload Section */
        .upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.5rem;
        }
        
        .avatar-uploader {
          width: 140px;
          height: 140px;
          position: relative;
          margin-bottom: 1rem;
          cursor: pointer;
        }
        
        .avatar-preview-wrap {
          width: 100%;
          height: 100%;
          border-radius: 40px;
          overflow: hidden;
          border: 4px solid white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          transition: all 0.3s ease;
        }
        
        .avatar-uploader:hover .avatar-preview-wrap {
          transform: scale(1.05);
          box-shadow: 0 30px 60px rgba(59, 130, 246, 0.3);
        }
        
        .avatar-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .upload-badge {
          position: absolute;
          bottom: -10px;
          right: -10px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid white;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        .avatar-uploader:hover .upload-badge {
          transform: scale(1.1) rotate(15deg);
        }
        
        .upload-label {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 0.25rem;
        }
        
        .upload-sublabel {
          font-size: 0.875rem;
          color: #64748b;
          text-align: center;
        }
        
        /* Form Inputs */
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        
        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: white;
          font-size: 1rem;
          color: #0f172a;
          transition: all 0.3s ease;
          outline: none;
        }
        
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .form-textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.5;
        }
        
        /* Submit Button */
        .submit-btn {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          margin-top: 1rem;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15);
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.25);
        }
        
        .submit-btn:active {
          transform: translateY(0);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* Status Message */
        .status-msg {
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .status-success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          color: #166534;
          border-left: 4px solid #22c55e;
        }
        
        .status-error {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }
        
        .file-input {
          display: none;
        }
        
        /* Word Counter */
        .word-counter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }
        
        .counter-text {
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .counter-text.warning {
          color: #ef4444;
          font-weight: 600;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .card-body {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        
        @media (max-width: 768px) {
          .assistant-container {
            padding: 1rem;
          }
          
          .assistant-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .header-actions {
            width: 100%;
            justify-content: center;
          }
          
          .card-header {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
            padding: 2rem 1.5rem;
          }
          
          .header-left {
            flex-direction: column;
          }
          
          .card-body {
            padding: 1.5rem;
          }
          
          .edit-btn-main {
            position: static;
            margin: 1rem auto;
            width: fit-content;
          }
          
          .assistant-edit-modal .modal-dialog {
            margin: 1rem;
          }
          
          .modal-custom-body {
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .header-btn {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
          
          .stats-section {
            grid-template-columns: 1fr;
          }
          
          .avatar-uploader {
            width: 120px;
            height: 120px;
          }
        }
      `}</style>

      {/* View Mode */}
      <div className="assistant-header">
        <div className="header-title">
          <h1>{t("assistantProfile.title")}</h1>
          <p>{t("assistantProfile.subtitle")}</p>
        </div>
        <div className="header-actions">
          {/* <button className="header-btn">
            <TbRefresh /> Refresh Data
          </button> */}
          <button className="header-btn primary" onClick={handleOpenModal}>
            <AiOutlineEdit /> {t("assistantProfile.editButton")}
          </button>
        </div>
      </div>

      <div className="assistant-card">
        <div className="card-header">
          <div className="header-left">
            <div className="profile-mega">
              <img
                src={assistantData?.image || AssistantLogo}
                alt={assistantData?.name}
                className="profile-image-mega"
              />
              <div className="profile-badge">
                <MdOutlineVerified size={16} />
              </div>
            </div>
            <div className="header-info">
              <h2>
                {assistantData?.name}
                {/* <span className="status-badge">
                  <div className="status-dot"></div>
                  {assistantData.status}
                </span> */}
              </h2>
              {/* <p>{assistantData.description}</p> */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  color: "#cbd5e1",
                }}
              >
                <span>
                  {t("assistantProfile.lastUpdated")}:{" "}
                  {assistantData?.lastUpdated}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="info-section">
            <h3>
              <AiOutlineInfoCircle /> {t("assistantProfile.detailsTitle")}
            </h3>
            <div className="info-grid">
              {/* <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{assistantData.name}</span>
              </div> */}
              <div className="info-item">
                <span className="info-label">
                  {t("assistantProfile.descriptionLabel")}
                </span>
                <span className="info-value">{assistantData?.description}</span>
              </div>
              {/* <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    {assistantData.status}
                  </span>
                </span>
              </div> */}
            </div>

            {/* <div className="stats-section">
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Availability</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div> */}
          </div>

          {/* <div className="info-section">
            <h3><BsGlobe /> Integration</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">API Version</span>
                <span className="info-value">v2.1.4</span>
              </div>
              <div className="info-item">
                <span className="info-label">Response Time</span>
                <span className="info-value">{"< 500ms"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Supported Languages</span>
                <span className="info-value">EN, FR, ES, DE</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* <button className="edit-btn-main" onClick={handleOpenModal}>
          <AiOutlineEdit size={20} />
          Edit Assistant Settings
        </button> */}
      </div>

      {/* Edit Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className="assistant-edit-modal"
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-custom-header">
          <button className="close-btn-custom" onClick={handleCloseModal}>
            <AiOutlineClose size={20} />
          </button>
          <h3>{t("assistantProfile.editModalTitle")}</h3>
          <p>{t("assistantProfile.editModalSubtitle")}</p>
        </div>

        <div className="modal-custom-body">
          <form onSubmit={handleSubmit}>
            <div className="upload-section">
              <div
                className="avatar-uploader"
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  transform: isDragging ? "scale(1.05)" : "none",
                  opacity: isDragging ? 0.8 : 1,
                }}
              >
                <div className="avatar-preview-wrap">
                  <img
                    src={previewUrl || AssistantLogo}
                    alt="Preview"
                    className="avatar-preview-img"
                    onError={(e) => {
                      e.target.src = AssistantLogo;
                    }}
                  />
                </div>
                <div className="upload-badge">
                  <AiOutlineCamera size={20} />
                </div>
              </div>
              <div className="upload-label">
                {t("assistantProfile.changeAvatar")}
              </div>
              <div className="upload-sublabel">
                {t("assistantProfile.uploadInstructions")}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="file-input"
              />
            </div>

            {uploadStatus.message && (
              <div
                className={`status-msg ${uploadStatus.type === "success" ? "status-success" : "status-error"}`}
              >
                {uploadStatus.type === "success" ? (
                  <AiOutlineCheckCircle size={20} />
                ) : (
                  <AiOutlineCloseCircle size={20} />
                )}
                {uploadStatus.message}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <AiOutlineUser /> {t("assistantProfile.nameLabel")}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder={t("assistantProfile.namePlaceholder")}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MdOutlineDescription />{" "}
                {t("assistantProfile.descriptionLabel")}
              </label>
              <textarea
                className="form-input form-textarea"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("assistantProfile.descriptionPlaceholder")}
              />
              <div className="word-counter">
                <span
                  className={`counter-text ${formData.description.trim().split(/\s+/).filter(Boolean).length > 500 ? "warning" : ""}`}
                >
                  {t("assistantProfile.wordCount", {
                    count: formData.description
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean).length,
                  })}
                </span>
                {formData.description.trim().split(/\s+/).filter(Boolean)
                  .length > 500 && (
                  <span style={{ color: "#ef4444", fontSize: "12px" }}>
                    {t("assistantProfile.limitExceeded")}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                isLoading ||
                !formData.name.trim() ||
                formData.description.trim().split(/\s+/).filter(Boolean)
                  .length > 500
              }
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {t("assistantProfile.savingButton")}
                </>
              ) : (
                t("assistantProfile.saveButton")
              )}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Assistant;
