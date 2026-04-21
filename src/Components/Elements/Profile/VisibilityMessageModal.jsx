// ConfirmationModal.js
import React from "react";
import "../../Utils/ConfirmationModal.css"; // Add styling as needed
import { useTranslation } from "react-i18next";
import { useSidebarContext } from "../../../context/SidebarContext";
import { useNavigate } from "react-router-dom";

const VisibilityMessageModal = ({ message, onConfirm, onClose }) => {
  const { toggle, show } = useSidebarContext();
  const navigate = useNavigate();
  const [t] = useTranslation("global");

  const handleClose = () => {
    toggle(true);
    onClose();
  };
const handleLogin = async() => {
  navigate("/", {
    state: {
        redirect_rules:false,

      fromInvitePage: true,
      fromProfile: true,
      previousPath: window.location.pathname + window.location.search,
    },
  });
};
  return (
    <div className="confirmation-modal">
      <div className="confirmation-modal-content">
        <p>{message}</p>
        {message === "Please log in to access this user's profile." && (
          <button className="btn btn-primary" onClick={handleLogin}>
            Login
          </button>
        )}
        {!window.location.href.includes("heroes") && (
          <button className="btn-no" onClick={handleClose}>
            {t("confirmationModal.close")}
          </button>
        )}
      </div>
    </div>
  );
};

export default VisibilityMessageModal;
