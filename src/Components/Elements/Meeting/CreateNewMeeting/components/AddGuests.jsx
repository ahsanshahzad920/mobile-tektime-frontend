import CookieService from '../../../../Utils/CookieService';
import { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import AddNewGuest from "./AddGuestComponents/AddNewGuest";
import RegistrationModal from "./AddGuestComponents/RegistrationModal";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import EditGuest from "./AddGuestComponents/EditGuest";
import Signin from "./AddGuestComponents/SignIn";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Tooltip } from "antd";

const AddGuest = ({ meeting }) => {
  const {
    checkId,
    getMeetingModal,
    stepsData,
    // meeting,
    setFormState,
    setSelectedTab: contextSetSelectedTab, // Alias for context method
  } = useFormContext();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [GuestId, setGuestId] = useState(null);
  const [show, setShow] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Invitation");

  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);

  const handleShow = (tab) => {
    setSelectedTab(tab);
    setFormState((prevState) => ({
      ...prevState,
      casting_type: tab, // Update casting_type when tab changes
    }));
    if (tab === "Invitation") {
      setShow(true);
    } else {
      setShowRegistrationModal(true);
    }
  };

  const handleClose = () => setShow(false);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  const [showSubscription, setShowSubscription] = useState(false);
  // const [editModal, setEditModal] = useState(false);

  const handleShowSubscription = () => {
    setSelectedTab("Subscription");

    // setShowSubscription(true);
  };
  const handleCloseSubscription = () => setShowSubscription(false);

  useEffect(() => {
    if (meeting?.solution_id) {
      const initialTab = meeting?.casting_type || "Invitation";
      setSelectedTab(initialTab);
      setFormState((prevState) => ({
        ...prevState,
        casting_type: initialTab,
      }));
    } else {
      if (meeting?.type === "Newsletter") {
        setSelectedTab("Subscription");
        setFormState((prevState) => ({
          ...prevState,
          casting_type: "Subscription",
        }));
      } else if (meeting?.casting_type === "Registration") {
        setFormState((prevState) => ({
          ...prevState,
          casting_type: "Registration",
        }));
        setSelectedTab("Registration");
      } else {
        setSelectedTab("Invitation");
        setFormState((prevState) => ({
          ...prevState,
          casting_type: "Invitation",
        }));
      }
    }
  }, [meeting]);

  const iconStyle = {
    padding: " 8px 5px",
    borderRadius: "8px",
    textAlign: "center",
    margin: "3px",
  };
  const closeEditModal = () => {
    setGuestId("");
    setEditModal(false);
    getMeetingModal(checkId);
  };

  const [isLoading, setIsLoading] = useState(false); // Loading state
  useEffect(() => {
    // if (GuestId) {
    // Show loading indicator before making the API call

    // Call the API and fetch meeting data
    const fetchData = async () => {
      // setIsLoading(true);
      try {
        await getMeetingModal(checkId);
      } catch (error) {
        toast.error("Error fetching meeting data");
      } finally {
        // Hide the loading indicator once the API call is complete
        setIsLoading(false);
      }
    };

    fetchData();
    // }
  }, []);
  const handleOpenConfirmation = (itemId) => {
    setGuestId(itemId);
    setShowConfirmation(true); // Show the confirmation modal
  };

  const cancelDelete = () => {
    setGuestId("");
    setShowConfirmation(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/participants/${GuestId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.data) {
        setShowConfirmation(false);
        await getMeetingModal(checkId);
      }
    } catch (error) {
      console.log("error while deleting step", error);
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleEditGuest = async (itemId) => {
    setGuestId(itemId);
    setEditModal(true);
  };

  const user = JSON.parse(CookieService.get("user"));
  const userMail = user?.email;

  const tabStyle = (isSelected) => ({
    borderRadius: "23px",
    padding: "18px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(241, 245, 255, 0.70)",
    color: isSelected ? "#3D57B5" : "#687691",
    border: isSelected ? "2px solid #3D57B5" : "none",
    width: "100%",
    fontFamily: "IBM Plex Sans",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "18.2px",
    textAlign: "left",
    display: "flex",
    gap: "8px",
  });

  const renderSVG = (isSelected, type) => {
    if (type === "Invitation") {
      return isSelected ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M17.755 14C18.3514 14.0005 18.9232 14.2378 19.3447 14.6597C19.7663 15.0816 20.003 15.6536 20.003 16.25V16.825C20.003 17.719 19.683 18.584 19.103 19.263C17.533 21.096 15.146 22.001 12 22.001C8.85403 22.001 6.46803 21.096 4.90203 19.261C4.32264 18.5824 4.00424 17.7193 4.00403 16.827V16.249C4.00429 15.6526 4.24133 15.0807 4.66304 14.659C5.08475 14.2373 5.65664 14.0003 6.25303 14H17.755ZM17.755 15.5H6.25203C6.05312 15.5 5.86235 15.579 5.7217 15.7197C5.58105 15.8603 5.50203 16.0511 5.50203 16.25V16.827C5.50203 17.362 5.69403 17.88 6.04203 18.287C7.29503 19.756 9.26203 20.501 11.999 20.501C14.738 20.501 16.705 19.756 17.962 18.288C18.3107 17.8803 18.5022 17.3615 18.502 16.825V16.249C18.5018 16.0506 18.4229 15.8604 18.2827 15.72C18.1425 15.5796 17.9534 15.5005 17.755 15.5ZM12 2.005C12.6566 2.005 13.3068 2.13433 13.9134 2.38561C14.5201 2.63688 15.0713 3.00518 15.5356 3.46947C15.9999 3.93376 16.3682 4.48496 16.6194 5.09159C16.8707 5.69822 17 6.3484 17 7.005C17 7.66161 16.8707 8.31179 16.6194 8.91842C16.3682 9.52505 15.9999 10.0762 15.5356 10.5405C15.0713 11.0048 14.5201 11.3731 13.9134 11.6244C13.3068 11.8757 12.6566 12.005 12 12.005C10.6739 12.005 9.40218 11.4782 8.46449 10.5405C7.52681 9.60286 7.00003 8.33109 7.00003 7.005C7.00003 5.67892 7.52681 4.40715 8.46449 3.46947C9.40218 2.53179 10.6739 2.005 12 2.005ZM12 3.505C11.5404 3.505 11.0853 3.59554 10.6606 3.77143C10.236 3.94732 9.85016 4.20513 9.52515 4.53013C9.20015 4.85514 8.94234 5.24097 8.76645 5.66561C8.59056 6.09025 8.50003 6.54538 8.50003 7.005C8.50003 7.46463 8.59056 7.91976 8.76645 8.3444C8.94234 8.76904 9.20015 9.15487 9.52515 9.47988C9.85016 9.80488 10.236 10.0627 10.6606 10.2386C11.0853 10.4145 11.5404 10.505 12 10.505C12.9283 10.505 13.8185 10.1363 14.4749 9.47988C15.1313 8.8235 15.5 7.93326 15.5 7.005C15.5 6.07675 15.1313 5.18651 14.4749 4.53013C13.8185 3.87375 12.9283 3.505 12 3.505Z"
            fill="#3D57B5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M17.755 14C18.3514 14.0005 18.9232 14.2378 19.3447 14.6597C19.7663 15.0816 20.003 15.6536 20.003 16.25V16.825C20.003 17.719 19.683 18.584 19.103 19.263C17.533 21.096 15.146 22.001 12 22.001C8.85403 22.001 6.46803 21.096 4.90203 19.261C4.32264 18.5824 4.00424 17.7193 4.00403 16.827V16.249C4.00429 15.6526 4.24133 15.0807 4.66304 14.659C5.08475 14.2373 5.65664 14.0003 6.25303 14H17.755ZM17.755 15.5H6.25203C6.05312 15.5 5.86235 15.579 5.7217 15.7197C5.58105 15.8603 5.50203 16.0511 5.50203 16.25V16.827C5.50203 17.362 5.69403 17.88 6.04203 18.287C7.29503 19.756 9.26203 20.501 11.999 20.501C14.738 20.501 16.705 19.756 17.962 18.288C18.3107 17.8803 18.5022 17.3615 18.502 16.825V16.249C18.5018 16.0506 18.4229 15.8604 18.2827 15.72C18.1425 15.5796 17.9534 15.5005 17.755 15.5ZM12 2.005C12.6566 2.005 13.3068 2.13433 13.9134 2.38561C14.5201 2.63688 15.0713 3.00518 15.5356 3.46947C15.9999 3.93376 16.3682 4.48496 16.6194 5.09159C16.8707 5.69822 17 6.3484 17 7.005C17 7.66161 16.8707 8.31179 16.6194 8.91842C16.3682 9.52505 15.9999 10.0762 15.5356 10.5405C15.0713 11.0048 14.5201 11.3731 13.9134 11.6244C13.3068 11.8757 12.6566 12.005 12 12.005C10.6739 12.005 9.40218 11.4782 8.46449 10.5405C7.52681 9.60286 7.00003 8.33109 7.00003 7.005C7.00003 5.67892 7.52681 4.40715 8.46449 3.46947C9.40218 2.53179 10.6739 2.005 12 2.005ZM12 3.505C11.5404 3.505 11.0853 3.59554 10.6606 3.77143C10.236 3.94732 9.85016 4.20513 9.52515 4.53013C9.20015 4.85514 8.94234 5.24097 8.76645 5.66561C8.59056 6.09025 8.50003 6.54538 8.50003 7.005C8.50003 7.46463 8.59056 7.91976 8.76645 8.3444C8.94234 8.76904 9.20015 9.15487 9.52515 9.47988C9.85016 9.80488 10.236 10.0627 10.6606 10.2386C11.0853 10.4145 11.5404 10.505 12 10.505C12.9283 10.505 13.8185 10.1363 14.4749 9.47988C15.1313 8.8235 15.5 7.93326 15.5 7.005C15.5 6.07675 15.1313 5.18651 14.4749 4.53013C13.8185 3.87375 12.9283 3.505 12 3.505Z"
            fill="#687691"
          />
        </svg>
      );
    } else if (type === "Subscription") {
      return isSelected ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z"
            fill="#3D57B5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z"
            fill="#687691"
          />
        </svg>
      );
    }
  };

  // Set the user's current time when the component mounts
  useEffect(() => {
    const currentTime = moment().startOf("minute"); // Normalize to remove seconds
    setUserTime(currentTime);
  }, []);

  // Calculate the time difference when userTime or meeting details change
  useEffect(() => {
    if (userTime && meeting?.date && meeting?.start_time) {
      const meetingTime = moment(
        `${meeting?.date} ${meeting?.start_time}`,
        "YYYY-MM-DD HH:mm:ss"
      ).startOf("minute"); // Normalize meeting time to remove seconds

      if (meetingTime.isValid()) {
        const diff = meetingTime.diff(userTime, "minutes");
        setTimeDifference(diff);
      } else {
        console.error("Invalid meeting date or time format.");
        setTimeDifference(null); // Reset to null if invalid
      }
    }
  }, [userTime, meeting]);

  if (isLoading) {
    // Show a loading spinner while waiting for the API response
    return (
      <Spinner
        animation="border"
        role="status"
        className="center-spinner"
      ></Spinner>
    );
  }

  return (
    <>
      <div className=" col-md-12 mt-1 modal-height">
        <Row className="mb-4">
          {(!meeting?.solution_id || meeting?.casting_type === "Invitation") && meeting?.type !== "Newsletter" && (
            <Col xs={12} sm={6} md={6} lg={6}>
              <Tooltip title={t("invitation_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                  onClick={() => handleShow("Invitation")}
                  style={tabStyle(selectedTab === "Invitation")}
                >
                  <div>
                    {renderSVG(selectedTab === "Invitation", "Invitation")}
                    <span
                      className="solutioncards"
                      style={{
                        color: selectedTab === "Invitation" ? "#3D57B5" : "#687691",
                      }}
                    >
                      {t("meeting.formState.Invitation")}
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_1_1041)">
                      <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill={selectedTab === "Invitation" ? "#3D57B5" : "#687691"} />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_1041"><rect width="24" height="24" fill="white" /></clipPath>
                    </defs>
                  </svg>
                </div>
              </Tooltip>
            </Col>
          )}

          {(!meeting?.solution_id || meeting?.casting_type === "Registration") && meeting?.type !== "Newsletter" && meeting?.type !== "Google Agenda Event" && meeting?.type !== "Outlook Agenda Event" && meeting?.type !== "Calendly" && (
            <Col xs={12} sm={6} md={6} lg={6}>
              <Tooltip title={t("registration_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                  onClick={() => handleShow("Registration")}
                  style={tabStyle(selectedTab === "Registration")}
                >
                  <div>
                    {renderSVG(selectedTab === "Registration", "Registration")}
                    <span
                      className="solutioncards"
                      style={{
                        color: selectedTab === "Registration" ? "#3D57B5" : "#687691",
                      }}
                    >
                      {t("meeting.formState.Registration")}
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_1_1041)">
                      <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill={selectedTab === "Registration" ? "#3D57B5" : "#687691"} />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_1041"><rect width="24" height="24" fill="white" /></clipPath>
                    </defs>
                  </svg>
                </div>
              </Tooltip>
            </Col>
          )}

          {((!meeting?.solution_id && meeting?.type === "Newsletter") || (meeting?.solution_id && meeting?.casting_type === "Subscription")) && (
            <Col xs={12} sm={6} md={6} lg={6}>
              <Tooltip title={t("invitation_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button p-3"
                  onClick={() => handleShow("Subscription")}
                  style={tabStyle(selectedTab === "Subscription")}
                >
                  <div>
                    {renderSVG(selectedTab === "Subscription", "Subscription")}
                    <span
                      className="solutioncards"
                      style={{
                        color: selectedTab === "Invitation" ? "#3D57B5" : "#687691",
                      }}
                    >
                      {t("meeting.formState.Signin")}
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0_1_1041)">
                      <path d="M20 11.3334H12.6667V4.00004C12.6667 3.82323 12.5964 3.65366 12.4714 3.52864C12.3464 3.40361 12.1768 3.33337 12 3.33337C11.8232 3.33337 11.6536 3.40361 11.5286 3.52864C11.4036 3.65366 11.3333 3.82323 11.3333 4.00004V11.3334H3.99999C3.82318 11.3334 3.65361 11.4036 3.52858 11.5286C3.40356 11.6537 3.33332 11.8232 3.33332 12C3.33003 12.0867 3.34535 12.173 3.37825 12.2532C3.41115 12.3335 3.46086 12.4057 3.52404 12.4651C3.58722 12.5245 3.66239 12.5696 3.74449 12.5975C3.82659 12.6254 3.91371 12.6353 3.99999 12.6267H11.3333V20C11.3333 20.1769 11.4036 20.3464 11.5286 20.4714C11.6536 20.5965 11.8232 20.6667 12 20.6667C12.1768 20.6667 12.3464 20.5965 12.4714 20.4714C12.5964 20.3464 12.6667 20.1769 12.6667 20V12.6667H20C20.1768 12.6667 20.3464 12.5965 20.4714 12.4714C20.5964 12.3464 20.6667 12.1769 20.6667 12C20.6667 11.8232 20.5964 11.6537 20.4714 11.5286C20.3464 11.4036 20.1768 11.3334 20 11.3334Z" fill={selectedTab === "Subscription" ? "#3D57B5" : "#687691"} />
                    </g>
                    <defs>
                      <clipPath id="clip0_1_1041"><rect width="24" height="24" fill="white" /></clipPath>
                    </defs>
                  </svg>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>

        {selectedTab === "Invitation" && (meeting?.type !== "Newsletter" || meeting?.solution_id) && (
          <>
            <AddNewGuest />

            <h4
              className="mb-2 solutioncards"
              style={{ fontSize: "18px", fontWeight: "600" }}
            >
              {stepsData?.participants?.filter(
                (item) => item.email !== userMail
              ).length > 0
                ? stepsData?.participants?.filter(
                  (item) => item.email !== userMail
                ).length
                : t("meeting.formState.step.No")}{" "}
              {t("meeting.formState.Guest List")}
            </h4>
            <div class="table-responsive">
              <table class="table add-guest-table">
                <tbody>
                  {stepsData?.participants
                    ?.filter((item) => item.email !== userMail)
                    ?.map((guest, index) => (
                      <tr key={guest.id || index}>
                        <th
                          scope="row"
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="responsive-icon"
                          >
                            <path
                              d="M6.75 2.25H9.75V5.25H6.75V2.25ZM14.25 2.25H17.25V5.25H14.25V2.25ZM6.75 7.75H9.75V10.75H6.75V7.75ZM14.25 7.75H17.25V10.75H14.25V7.75ZM6.75 13.25H9.75V16.25H6.75V13.25ZM14.25 13.25H17.25V16.25H14.25V13.25ZM6.75 18.75H9.75V21.75H6.75V18.75ZM14.25 18.75H17.25V21.75H14.25V18.75Z"
                              fill="#8590A3"
                            />
                          </svg>
                        </th>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {index + 1}.
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.image ? (
                            <img
                              src={
                                guest?.image?.startsWith("http")
                                  ? guest?.image
                                  : Assets_URL + "/" + guest?.image
                              }
                              alt={`${guest.name}'s avatar`}
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                            />
                          ) : (
                            <img
                              src={
                                guest?.participant_image?.startsWith("http")
                                  ? guest?.participant_image
                                  : Assets_URL + "/" + guest?.participant_image
                              }
                              alt={`${guest.name}'s avatar`}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px" }}
                            />
                          )}
                          {guest?.first_name + " " + guest?.last_name}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.email}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          <img
                            src={
                              guest?.contact?.clients?.client_logo?.startsWith(
                                "http"
                              )
                                ? guest?.contact?.clients?.client_logo
                                : Assets_URL +
                                "/" +
                                guest?.contact?.clients?.client_logo
                            }
                            alt={`${guest?.contact?.clients?.name}'s avatar`}
                            className="rounded-circle me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              objectPosition: "top",
                            }}
                          />
                        </td>

                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.contact?.clients?.name}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.post}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.team_names?.map((item) => item.team)}
                        </td>
                        <td>
                          <span
                            style={{
                              ...iconStyle,
                              backgroundColor: "#F5F8FF",
                              color: "#3D57B5",
                              cursor: "pointer",
                              display: "inline-flex",
                            }}
                            onClick={() => handleEditGuest(guest.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="25"
                              height="25"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="responsive-icon"
                            >
                              <path
                                d="M13.9751 3.90795L16.0921 6.02495M15.3361 2.04295L9.60909 7.76995C9.31318 8.06545 9.11137 8.44193 9.02909 8.85195L8.50009 11.4999L11.1481 10.9699C11.5581 10.8879 11.9341 10.6869 12.2301 10.3909L17.9571 4.66395C18.1292 4.49185 18.2657 4.28754 18.3588 4.06269C18.452 3.83783 18.4999 3.59683 18.4999 3.35345C18.4999 3.11007 18.452 2.86907 18.3588 2.64421C18.2657 2.41936 18.1292 2.21505 17.9571 2.04295C17.785 1.87085 17.5807 1.73434 17.3558 1.6412C17.131 1.54806 16.89 1.50012 16.6466 1.50012C16.4032 1.50012 16.1622 1.54806 15.9374 1.6412C15.7125 1.73434 15.5082 1.87085 15.3361 2.04295Z"
                                stroke="#687691"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M16.5001 13.5V16.5C16.5001 17.0304 16.2894 17.5391 15.9143 17.9142C15.5392 18.2893 15.0305 18.5 14.5001 18.5H3.50009C2.96966 18.5 2.46095 18.2893 2.08588 17.9142C1.71081 17.5391 1.50009 17.0304 1.50009 16.5V5.5C1.50009 4.96957 1.71081 4.46086 2.08588 4.08579C2.46095 3.71071 2.96966 3.5 3.50009 3.5H6.50009"
                                stroke="#687691"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>
                          <span
                            style={{
                              ...iconStyle,
                              backgroundColor: "#ffe5e5",
                              color: "red",
                              cursor: "pointer",
                              display: "inline-flex",
                            }}
                            onClick={() => handleOpenConfirmation(guest.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="25"
                              height="25"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="responsive-icon"
                            >
                              <path
                                d="M8.4375 4.0625V4.375H11.5625V4.0625C11.5625 3.6481 11.3979 3.25067 11.1049 2.95765C10.8118 2.66462 10.4144 2.5 10 2.5C9.5856 2.5 9.18817 2.66462 8.89515 2.95765C8.60212 3.25067 8.4375 3.6481 8.4375 4.0625ZM7.1875 4.375V4.0625C7.1875 3.31658 7.48382 2.60121 8.01126 2.07376C8.53871 1.54632 9.25408 1.25 10 1.25C10.7459 1.25 11.4613 1.54632 11.9887 2.07376C12.5162 2.60121 12.8125 3.31658 12.8125 4.0625V4.375H17.5C17.6658 4.375 17.8247 4.44085 17.9419 4.55806C18.0592 4.67527 18.125 4.83424 18.125 5C18.125 5.16576 18.0592 5.32473 17.9419 5.44194C17.8247 5.55915 17.6658 5.625 17.5 5.625H16.5575L15.375 15.98C15.2878 16.7426 14.923 17.4465 14.3501 17.9573C13.7772 18.4682 13.0363 18.7504 12.2687 18.75H7.73125C6.96366 18.7504 6.22279 18.4682 5.64991 17.9573C5.07702 17.4465 4.7122 16.7426 4.625 15.98L3.4425 5.625H2.5C2.33424 5.625 2.17527 5.55915 2.05806 5.44194C1.94085 5.32473 1.875 5.16576 1.875 5C1.875 4.83424 1.94085 4.67527 2.05806 4.55806C2.17527 4.44085 2.33424 4.375 2.5 4.375H7.1875ZM5.8675 15.8375C5.91968 16.2949 6.13835 16.7172 6.48183 17.0238C6.82531 17.3304 7.26959 17.4999 7.73 17.5H12.2694C12.7298 17.4999 13.1741 17.3304 13.5175 17.0238C13.861 16.7172 14.0797 16.2949 14.1319 15.8375L15.3 5.625H4.70062L5.8675 15.8375ZM8.125 7.8125C8.29076 7.8125 8.44973 7.87835 8.56694 7.99556C8.68415 8.11277 8.75 8.27174 8.75 8.4375V14.6875C8.75 14.8533 8.68415 15.0122 8.56694 15.1294C8.44973 15.2467 8.29076 15.3125 8.125 15.3125C7.95924 15.3125 7.80027 15.2467 7.68306 15.1294C7.56585 15.0122 7.5 14.8533 7.5 14.6875V8.4375C7.5 8.27174 7.56585 8.11277 7.68306 7.99556C7.80027 7.87835 7.95924 7.8125 8.125 7.8125ZM12.5 8.4375C12.5 8.27174 12.4342 8.11277 12.3169 7.99556C12.1997 7.87835 12.0408 7.8125 11.875 7.8125C11.7092 7.8125 11.5503 7.87835 11.4331 7.99556C11.3158 8.11277 11.25 8.27174 11.25 8.4375V14.6875C11.25 14.8533 11.3158 15.0122 11.4331 15.1294C11.5503 15.2467 11.7092 15.3125 11.875 15.3125C12.0408 15.3125 12.1997 15.2467 12.3169 15.1294C12.4342 15.0122 12.5 14.8533 12.5 14.6875V8.4375Z"
                                fill="#BB372F"
                              />
                            </svg>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedTab === "Registration" && (meeting?.type !== "Newsletter" || meeting?.solution_id) && (
          <RegistrationModal
            show={showRegistrationModal}
            handleClose={handleCloseRegistrationModal}
            meeting={meeting}
          />
        )}

        {selectedTab === "Subscription" && (
          <>
            <AddNewGuest />

            {/* <h4
              className="mb-2 solutioncards"
              style={{ fontSize: "18px", fontWeight: "600" }}
            >
              {stepsData?.participants?.filter(
                (item) => item.email !== userMail
              ).length > 0
                ? stepsData?.participants?.filter(
                    (item) => item.email !== userMail
                  ).length
                : t("meeting.formState.step.No")}{" "}
              {meeting?.type === "Newsletter" ? t("meeting.formState.Subscriber List") :t("meeting.formState.Guest List")}
            </h4> */}
            <div class="table-responsive">
              <table class="table add-guest-table">
                <tbody>
                  {stepsData?.participants
                    ?.filter((item) => item.email !== userMail)
                    ?.map((guest, index) => (
                      <tr key={guest.id || index}>
                        <th
                          scope="row"
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="responsive-icon"
                          >
                            <path
                              d="M6.75 2.25H9.75V5.25H6.75V2.25ZM14.25 2.25H17.25V5.25H14.25V2.25ZM6.75 7.75H9.75V10.75H6.75V7.75ZM14.25 7.75H17.25V10.75H14.25V7.75ZM6.75 13.25H9.75V16.25H6.75V13.25ZM14.25 13.25H17.25V16.25H14.25V13.25ZM6.75 18.75H9.75V21.75H6.75V18.75ZM14.25 18.75H17.25V21.75H14.25V18.75Z"
                              fill="#8590A3"
                            />
                          </svg>
                        </th>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {index + 1}.
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.image ? (
                            <img
                              src={
                                guest?.image?.startsWith("http")
                                  ? guest?.image
                                  : Assets_URL + "/" + guest?.image
                              }
                              alt={`${guest.name}'s avatar`}
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                            />
                          ) : (
                            <img
                              src={
                                guest?.participant_image?.startsWith("http")
                                  ? guest?.participant_image
                                  : Assets_URL + "/" + guest?.participant_image
                              }
                              alt={`${guest.name}'s avatar`}
                              className="rounded-circle me-2"
                              style={{ width: "40px", height: "40px" }}
                            />
                          )}
                          {guest?.first_name + " " + guest?.last_name}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.email}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          <img
                            src={
                              guest?.contact?.clients?.client_logo?.startsWith(
                                "http"
                              )
                                ? guest?.contact?.clients?.client_logo
                                : Assets_URL +
                                "/" +
                                guest?.contact?.clients?.client_logo
                            }
                            alt={`${guest?.contact?.clients?.name}'s avatar`}
                            className="rounded-circle me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              objectPosition: "top",
                            }}
                          />
                        </td>

                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.contact?.clients?.name}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.post}
                        </td>
                        <td
                          style={{
                            textAling: "center",
                            paddingTop: "23px",
                          }}
                        >
                          {guest?.team_names?.map((item) => item.team)}
                        </td>
                        <td>
                          <span
                            style={{
                              ...iconStyle,
                              backgroundColor: "#F5F8FF",
                              color: "#3D57B5",
                              cursor: "pointer",
                              display: "inline-flex",
                            }}
                            onClick={() => handleEditGuest(guest.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="25"
                              height="25"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="responsive-icon"
                            >
                              <path
                                d="M13.9751 3.90795L16.0921 6.02495M15.3361 2.04295L9.60909 7.76995C9.31318 8.06545 9.11137 8.44193 9.02909 8.85195L8.50009 11.4999L11.1481 10.9699C11.5581 10.8879 11.9341 10.6869 12.2301 10.3909L17.9571 4.66395C18.1292 4.49185 18.2657 4.28754 18.3588 4.06269C18.452 3.83783 18.4999 3.59683 18.4999 3.35345C18.4999 3.11007 18.452 2.86907 18.3588 2.64421C18.2657 2.41936 18.1292 2.21505 17.9571 2.04295C17.785 1.87085 17.5807 1.73434 17.3558 1.6412C17.131 1.54806 16.89 1.50012 16.6466 1.50012C16.4032 1.50012 16.1622 1.54806 15.9374 1.6412C15.7125 1.73434 15.5082 1.87085 15.3361 2.04295Z"
                                stroke="#687691"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M16.5001 13.5V16.5C16.5001 17.0304 16.2894 17.5391 15.9143 17.9142C15.5392 18.2893 15.0305 18.5 14.5001 18.5H3.50009C2.96966 18.5 2.46095 18.2893 2.08588 17.9142C1.71081 17.5391 1.50009 17.0304 1.50009 16.5V5.5C1.50009 4.96957 1.71081 4.46086 2.08588 4.08579C2.46095 3.71071 2.96966 3.5 3.50009 3.5H6.50009"
                                stroke="#687691"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>
                          <span
                            style={{
                              ...iconStyle,
                              backgroundColor: "#ffe5e5",
                              color: "red",
                              cursor: "pointer",
                              display: "inline-flex",
                            }}
                            onClick={() => handleOpenConfirmation(guest.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="25"
                              height="25"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="responsive-icon"
                            >
                              <path
                                d="M8.4375 4.0625V4.375H11.5625V4.0625C11.5625 3.6481 11.3979 3.25067 11.1049 2.95765C10.8118 2.66462 10.4144 2.5 10 2.5C9.5856 2.5 9.18817 2.66462 8.89515 2.95765C8.60212 3.25067 8.4375 3.6481 8.4375 4.0625ZM7.1875 4.375V4.0625C7.1875 3.31658 7.48382 2.60121 8.01126 2.07376C8.53871 1.54632 9.25408 1.25 10 1.25C10.7459 1.25 11.4613 1.54632 11.9887 2.07376C12.5162 2.60121 12.8125 3.31658 12.8125 4.0625V4.375H17.5C17.6658 4.375 17.8247 4.44085 17.9419 4.55806C18.0592 4.67527 18.125 4.83424 18.125 5C18.125 5.16576 18.0592 5.32473 17.9419 5.44194C17.8247 5.55915 17.6658 5.625 17.5 5.625H16.5575L15.375 15.98C15.2878 16.7426 14.923 17.4465 14.3501 17.9573C13.7772 18.4682 13.0363 18.7504 12.2687 18.75H7.73125C6.96366 18.7504 6.22279 18.4682 5.64991 17.9573C5.07702 17.4465 4.7122 16.7426 4.625 15.98L3.4425 5.625H2.5C2.33424 5.625 2.17527 5.55915 2.05806 5.44194C1.94085 5.32473 1.875 5.16576 1.875 5C1.875 4.83424 1.94085 4.67527 2.05806 4.55806C2.17527 4.44085 2.33424 4.375 2.5 4.375H7.1875ZM5.8675 15.8375C5.91968 16.2949 6.13835 16.7172 6.48183 17.0238C6.82531 17.3304 7.26959 17.4999 7.73 17.5H12.2694C12.7298 17.4999 13.1741 17.3304 13.5175 17.0238C13.861 16.7172 14.0797 16.2949 14.1319 15.8375L15.3 5.625H4.70062L5.8675 15.8375ZM8.125 7.8125C8.29076 7.8125 8.44973 7.87835 8.56694 7.99556C8.68415 8.11277 8.75 8.27174 8.75 8.4375V14.6875C8.75 14.8533 8.68415 15.0122 8.56694 15.1294C8.44973 15.2467 8.29076 15.3125 8.125 15.3125C7.95924 15.3125 7.80027 15.2467 7.68306 15.1294C7.56585 15.0122 7.5 14.8533 7.5 14.6875V8.4375C7.5 8.27174 7.56585 8.11277 7.68306 7.99556C7.80027 7.87835 7.95924 7.8125 8.125 7.8125ZM12.5 8.4375C12.5 8.27174 12.4342 8.11277 12.3169 7.99556C12.1997 7.87835 12.0408 7.8125 11.875 7.8125C11.7092 7.8125 11.5503 7.87835 11.4331 7.99556C11.3158 8.11277 11.25 8.27174 11.25 8.4375V14.6875C11.25 14.8533 11.3158 15.0122 11.4331 15.1294C11.5503 15.2467 11.7092 15.3125 11.875 15.3125C12.0408 15.3125 12.1997 15.2467 12.3169 15.1294C12.4342 15.0122 12.5 14.8533 12.5 14.6875V8.4375Z"
                                fill="#BB372F"
                              />
                            </svg>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="modal-body">{/* Your modal content goes here */}</div>
      </div>
      <Modal
        show={showConfirmation}
        onHide={handleClose}
        dialogClassName="custom-modal-size custom-modal-border modal-dialog-centered"
      >
        <Modal.Header
          closeButton
          className="border-0"
          onClick={cancelDelete}
        ></Modal.Header>
        <Modal.Body className="text-center p-4">
          <h2 className="w-100 text-center fs-5">{t("Delete Invite")}</h2>
          <p className="mb-4" style={{ color: "#92929D" }}>
            {t("Delete Invite Confirmation")}
          </p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <Button
              variant="outline-danger"
              className="px-4 py-2 confirmation-delete"
              onClick={handleDelete}
            >
              {t("meeting.formState.step.ConfirmBtn")}
            </Button>
            <Button
              variant="primary"
              className="px-4 py-2 confirmation-save"
              onClick={cancelDelete}
            >
              {t("meeting.formState.step.CancelBtn")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <EditGuest
        editModal={editModal}
        GuestId={GuestId}
        closeEditModal={closeEditModal}
      />
    </>
  );
};

export default AddGuest;