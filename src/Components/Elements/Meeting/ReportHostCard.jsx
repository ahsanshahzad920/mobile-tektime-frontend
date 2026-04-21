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

const ReportHostCard = ({
  data,
  guides,
  handleShow,
  handleHide,
  showProfile,
  meeting,
  doneMoment,
}) => {
  const [id, setId] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [t] = useTranslation("global");

  const handleShowProfile = useCallback(
    (userId) => {
      setId(userId);
      setIsUser(true);
      setShowModal(true);
      handleShow();
    },
    [handleShow]
  );

  const handleShowGuideProfile = useCallback(
    (userId) => {
      setId(userId);
      setIsUser(false);
      setShowModal(true);
      handleShow();
    },
    [handleShow]
  );

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    handleHide();
  }, [handleHide]);

  const renderCard = (user, isGuide = false) => {
    const imageSrc = isGuide
      ? user?.participant_image?.startsWith("http")
        ? user.participant_image
        : user?.participant_image
        ? `${Assets_URL}/${user.participant_image}`
        : "/Assets/avatar.jpeg"
      : user?.image?.startsWith("http")
      ? user.image
      : user?.logo?.startsWith("http")
      ? user.logo
      : user?.image
      ? `${Assets_URL}/${user.image}`
      : "/Assets/avatar.jpeg";

    const isCalendarEvent =
      meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event";

    const borderColor = isCalendarEvent
      ? user?.attendee_response_status === "accepted"
        ? "green"
        : user?.attendee_response_status === "declined"
        ? "red"
        : "grey"
      : user?.attandance === 1
      ? "green"
      : user?.attandance === 0
      ? "red"
      : "grey";

    // Status icon component (reusable)
    const StatusIcon = () => {
      if (isCalendarEvent) {
        if (user?.attendee_response_status === "accepted")
          return <FaCheckCircle color="green" />;
        if (user?.attendee_response_status === "declined")
          return <FaTimesCircle color="red" />;
        if (user?.attendee_response_status === "needsAction")
          return <FaQuestionCircle color="orange" />;
      } else {
        if (user?.attandance === 1) return <FaCheckCircle color="green" />;
        if (user?.attandance === 0) return <FaTimesCircle color="red" />;
      }
      return <FaQuestionCircle color="grey" />;
    };

    return (
      <Card
        className="participant-card position-relative shadow-sm"
        style={{
          border: `2px solid ${borderColor}`,
          borderRadius: "12px",
          overflow: "visible",        // Critical: icon hide nahi hoga
          paddingBottom: "20px",      // Icon ke liye space
          marginBottom: "20px",
        }}
      >
        <Card.Body className="d-flex flex-column align-items-center p-3">
        <div className="profile-logo position-relative mb-3">
  <Card.Img
    className="user-img rounded-circle border border-white shadow-sm"
    src={imageSrc}
    alt="user"
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

          <div className="text-center">
            <Card.Title className="mb-1" style={{ fontSize: "13px", fontWeight: "600" }}>
              {user?.full_name?.trim() || user?.email || "Unknown"}
            </Card.Title>
             <Card.Subtitle className="mb-2 card-subtext">
            
                                      {user.email}
                                    </Card.Subtitle>
            {user?.post && (
              <Card.Subtitle className="text-muted small">{user.post}</Card.Subtitle>
            )}
            {user?.contribution && (
              <small className="d-block text-muted mt-1">{user.contribution}</small>
            )}

            {(user?.user_id || user?.nick_name || user?.id) && (
              <div
                className="visiting-card-link mt-3 text-primary justify-content-center"
                role="button"
                onClick={() =>
                  isGuide
                    ? handleShowGuideProfile(user?.id || user?.user_id)
                    : handleShowProfile(user?.nick_name)
                }
                style={{ fontSize: "12px", fontWeight: "500" }}
              >
                {t("viewVisitingCard")}
              </div>
            )}
          </div>
        </Card.Body>

        {/* Status Icon - Always Visible & Never Hidden */}
        <div
          style={{
            position: "absolute",
            bottom: "-16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            borderRadius: "50%",
            padding: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            // border: `4px solid ${borderColor}`,
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
              {isUser
                ? data?.full_name || data?.email
                : guides?.find((g) => g.id === id)?.full_name ||
                  meeting?.event_organizer?.email ||
                  "Profile"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ParticipantCardProfile
              userId={id}
              handleHide={handleCloseModal}
              isUser={isUser}
            />
          </Modal.Body>
        </Modal>
      )}

      {meeting?.type === "Newsletter" && meeting?.newsletter_guide && (
        <div className="d-inline-block">{renderCard(meeting.newsletter_guide, false)}</div>
      )}

      {guides?.length > 0 &&
        meeting?.type !== "Newsletter" &&
        guides.map((guide, index) => (
          <div className="d-inline-block" key={guide.id || index}>
            {renderCard(guide, true)}
          </div>
        ))}
    </>
  );
};

export default ReportHostCard;
