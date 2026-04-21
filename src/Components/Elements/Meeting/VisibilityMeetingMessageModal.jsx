// ConfirmationModal.js
import React, { useState } from "react";
import "../../Utils/ConfirmationModal.css"; // Add styling as needed
import { useTranslation } from "react-i18next";
import { useSidebarContext } from "../../../context/SidebarContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";

const VisibilityMeetingMessageModal = ({
  message,
  onConfirm,
  onClose,
  getRefreshMeeting,
  setMeetingData,
}) => {
  const { toggle, show } = useSidebarContext();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const { meeting_id } = useParams();
  const handleClose = () => {
    toggle(true);
    onClose();
  };

  const handleLogin = () => {
    navigate("/", {
      state: {
        fromInvitePage: true,
        invitePageURL: window.location.pathname + window.location.search,
      },
    });
  };

  const [password, setPassword] = useState(null);
  const checkPassword = async () => {
    const payload = {
      password: password,
      meeting_id: meeting_id,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/check-meeting-password`,
        payload
      );
      if (response?.status) {
        toggle(true);
        onClose();
        setMeetingData(response?.data?.data);
        // getRefreshMeeting()
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Incorrect password");
    }
  };
  return (
    <div className="confirmation-modal">
      <div className="confirmation-modal-content">
        <p>{message}</p>
        {message === "Please log in to view meeting." ? (
          <button className="btn btn-primary" onClick={handleLogin}>
            Login
          </button>
        ) : message === "Please enter password to view meeting." ? (
          <div className="d-flex flex-column gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  checkPassword();
                }
              }}
            />
            <button className="btn btn-primary" onClick={checkPassword}>
              Submit
            </button>
          </div>
        ) : null}
        {!window.location.href.includes("destination") && (
          <button className="btn-no" onClick={handleClose}>
            {t("confirmationModal.close")}
          </button>
        )}
      </div>
    </div>
  );
};

export default VisibilityMeetingMessageModal;
