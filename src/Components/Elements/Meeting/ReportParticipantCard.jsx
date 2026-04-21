import React, { useState, useCallback } from "react";
import { Card, Modal } from "react-bootstrap";
import {
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";
import ParticipantCardProfile from "../Profile/ParticipantCardProfile";

const ReportParticipantCard = ({
  data,
  guides,
  handleShow,
  handleHide,
  showProfile,
  meeting,
}) => {
  const [t] = useTranslation("global");
  const [id, setId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowProfile = useCallback(
    (userId) => {
      setId(userId);
      setShowModal(true);
      handleShow();
    },
    [handleShow]
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    handleHide();
  }, [handleHide]);

  const renderCard = (item) => {
    // Image URL fix
    const imageSrc = item.image
      ? item.image.startsWith("http")
        ? item.image
        : `${Assets_URL}/${item.image}`
      : item.participant_image
      ? item.participant_image.startsWith("http")
        ? item.participant_image
        : `${Assets_URL}/${item.participant_image}`
      : "/Assets/avatar.jpeg";

    // Border color logic
    const isCalendarEvent =
      meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event";

    const borderColor = isCalendarEvent
      ? item?.attendee_response_status === "accepted"
        ? "green"
        : item?.attendee_response_status === "declined"
        ? "red"
        : "grey"
      : item?.attandance === 1
      ? "green"
      : item?.attandance === 0 || item?.attandance === false
      ? "red"
      : "grey";

    // Status Icon Component
    const StatusIcon = () => {
      if (isCalendarEvent) {
        if (item?.attendee_response_status === "accepted")
          return <FaCheckCircle color="green" />;
        if (item?.attendee_response_status === "declined")
          return <FaTimesCircle color="red" />;
        if (item?.attendee_response_status === "needsAction")
          return <FaQuestionCircle color="orange" />;
      } else {
        if (item?.attandance === 1) return <FaCheckCircle color="green" />;
        if (item?.attandance === 0) return <FaTimesCircle color="red" />;
      }
      return <FaQuestionCircle color="grey" />;
    };

    return (
      <Card
        className="participant-card position-relative shadow-sm"
        style={{
          border: `2px solid ${borderColor}`,
          borderRadius: "16px",
          overflow: "visible",           // Icon hide nahi hoga
          paddingBottom: "28px",         // Icon ke liye space
          minWidth: "190px",
          maxWidth: "220px",
        }}
      >
        <Card.Body className="d-flex flex-column align-items-center p-3">
          {/* Profile Image + Company Logo */}
          <div className="profile-logo position-relative mb-3">
            <Card.Img
    className="user-img rounded-circle border border-white shadow-sm"
              src={imageSrc}
              alt="participant"
              style={{
                width: "90px",
                height: "90px",
                objectFit: "cover",
              }}
            />
            <Card.Img
              className="position-absolute"
              src="/Assets/Avatar_company.svg"
              alt="company"
              style={{
      width: "26px",
      height: "26px",
      bottom: "-8px",
      right: "-8px",
      border: "3px solid white",
      borderRadius: "50%",
      background: "white",
    }}
            />
          </div>

          {/* Name & Details */}
          <div className="text-center">
             <Card.Title className="mb-1" style={{ fontSize: "13px", fontWeight: "600" }}>
              {item.first_name && item.last_name
                ? `${item.first_name} ${item.last_name}`
                : ""}
            </Card.Title>

 <Card.Subtitle className="mb-2 card-subtext">

                          {item?.email}
                        </Card.Subtitle>
            {item.post && (
              <small className="small text-muted">{item.post}</small>
            )}

            {item.contribution && (
              <small className="d-block text-muted mt-1">{item.contribution}</small>
            )}

            {item.user_id && (
              <div
                className="visiting-card-link mt-3 text-primary justify-content-center"
                role="button"
                onClick={() => handleShowProfile(item?.id || item.user_id)}
                style={{ fontSize: "12px", fontWeight: "500" }}
              >
                {t("viewVisitingCard")}
              </div>
            )}
          </div>
        </Card.Body>

        {/* Status Icon - Bottom Center (Never Hidden) */}
        <div
          style={{
            position: "absolute",
            bottom: "-18px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            borderRadius: "50%",
            padding: "8px",
            // border: `4px solid ${borderColor}`,
            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            zIndex: 20,
          }}
        >
          <StatusIcon />
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Profile Modal */}
      {showProfile && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="xl"
          className="visiting-card-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {data?.find((p) => p.id === id || p.user_id === id)
                ? `${data.find((p) => p.id === id || p.user_id === id).first_name || ""} ${
                    data.find((p) => p.id === id || p.user_id === id).last_name || ""
                  }`.trim() || data.find((p) => p.id === id || p.user_id === id)?.email
                : "Profile"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ParticipantCardProfile userId={id} handleHide={handleCloseModal} />
          </Modal.Body>
        </Modal>
      )}

      {/* Render All Participants */}
      {/* <div className="d-flex flex-wrap justify-content-start gap-4"> */}
        {data?.map((item, index) => (
          <div key={item.id || item.user_id || index}>
            {renderCard(item)}
          </div>
        ))}
      {/* </div> */}
    </>
  );
};

export default ReportParticipantCard;
