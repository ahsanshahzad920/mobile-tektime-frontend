import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import {
  FaArrowRight,
  FaCheckCircle,
  FaQuestionCircle,
  FaTimesCircle,
  FaSyncAlt,
} from "react-icons/fa";
import ParticipantCardProfile from "../../../Profile/ParticipantCardProfile";
import { useTranslation } from "react-i18next";

const GuidesCard = ({
  data,
  guides,
  handleShow,
  handleHide,
  showProfile,
  meeting,
  onAttendanceToggle,
}) => {
  const [t] = useTranslation("global");
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShowProfile = (userId) => {
    handleShow();
    setId(userId);
  };

   const [loadingIds, setLoadingIds] = useState(new Set()); // ← Yeh use karo
   
     // Attendance toggle function
    const toggleAttendance = async (guideId, currentAttendance) => {
    // Add this ID to loading set
    setLoadingIds(prev => new Set(prev).add(guideId));
  
    try {
      const newAttendance = currentAttendance === 1 ? 0 : 1;
      const response = await fetch(`${API_BASE_URL}/change-participant-attendance/${guideId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attandance: newAttendance,
          _method: "put",
        }),
      });
  
      if (response.ok) {
        console.log(`Attendance updated to ${newAttendance} for guide ${guideId}`);
        onAttendanceToggle(); // refresh data
      } else {
        console.error("Failed to update attendance");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    } finally {
      // Remove from loading set
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(guideId);
        return newSet;
      });
    }
  };

  const isNewsletter = meeting?.type === "Newsletter";

  return (
    <>
      {showProfile ? (
        <div>
          <ParticipantCardProfile userId={id} handleHide={handleHide} />
        </div>
      ) : (
        <div className="row">
          {/* === 1. REGULAR GUIDES (Google/Outlook) === */}
          {!isNewsletter &&
            guides?.map((item, index) => (
              <div className="col-md-3" key={`guide-${index}`}>
                <Card
                  className="participant-card position-relative"
                  style={{
                    marginTop: "4rem",
                    border: (meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event") ?
                      item?.attendee_response_status === "accepted"
                        ? "1px solid green"
                        : (item?.attendee_response_status === "declined")
                          ? "1px solid red"
                          : "1px solid grey"
                      :
                      item?.attandance === 1 ? "1px solid green" : item?.attandance === 0 ? "1px solid red" : "1px solid grey",
                  }}
                >
                  {/* Response Status Icons */}
                  {(meeting?.type === "Google Agenda Event" ||
                    meeting?.type === "Outlook Agenda Event") ? (
                    <>
                      {item?.attendee_response_status === "accepted" && (
                        <FaCheckCircle
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            color: "green",
                            fontSize: "1.5rem",
                          }}
                        />
                      )}
                      {item?.attendee_response_status === "declined" && (
                        <FaTimesCircle
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            color: "red",
                            fontSize: "1.5rem",
                          }}
                        />
                      )}
                      {item?.attendee_response_status === "needsAction" && (
                        <FaQuestionCircle
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            color: "grey",
                            fontSize: "1.5rem",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {item?.attandance === 1 && (
                        <FaCheckCircle
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            color: "green",
                            fontSize: "1.5rem",
                          }}
                        />
                      )}
                      {item?.attandance === 0 && (
                        <FaTimesCircle
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "white",
                            borderRadius: "50%",
                            padding: "2px",
                            color: "red",
                            fontSize: "1.5rem",
                          }}
                        />
                      )}
                    </>
                  )}

                  <Card.Body style={{ padding: "20px 0" }}>
                    <div className="d-flex justify-content-center">
                      <div className="participant-card-position">
                        <div className="profile-logo">
                          {item.image ? (
                            <Card.Img
                              className="user-img"
                              src={
                                item?.image?.startsWith("users/") ||
                                  item?.image?.startsWith("storage/")
                                  ? Assets_URL + "/" + item?.image
                                  : item?.image
                              }
                            />
                          ) : item?.participant_image ? (
                            <Card.Img
                              className="user-img"
                              src={
                                item?.participant_image?.startsWith("users/") ||
                                  item?.participant_image?.startsWith("storage/")
                                  ? Assets_URL + "/" + item?.participant_image
                                  : item?.participant_image
                              }
                            />
                          ) : (
                            <Card.Img
                              className="user-img"
                              src="/Assets/avatar.jpeg"
                            />
                          )}
                          <Card.Img
                            className="logout-icon"
                            src="/Assets/Avatar_company.svg"
                            height="20px"
                            width="20px"
                            alt="company"
                          />
                        </div>
                      </div>
                    </div>

                    <Card.Title className="text-center mt-4 card-heading">
                      {item.first_name} {item.last_name}
                    </Card.Title>

                    <Card.Subtitle className="mb-2 card-subtext">

                      {item?.email}
                    </Card.Subtitle>

                    <Card.Subtitle className="mb-2 text-center card-subtext">
                      {item.post}
                    </Card.Subtitle>

                    {item?.contribution && (
                      <Card.Subtitle className="mb-3 mt-3 text-center card-subtext">
                        {item.contribution}
                      </Card.Subtitle>
                    )}

                    {/* Attendance Toggle Button */}
                    <div className="text-center mb-3">
                      <Button
                       variant={item?.attandance === 1 ? "success" : "danger"}
                       size="sm"
                       onClick={() => toggleAttendance(item.id, item?.attandance)}
                       disabled={loadingIds.has(item.id)} // ← Sirf is card ke liye disable
                       className="d-flex align-items-center justify-content-center mx-auto"
                       style={{ minWidth: "120px" }}
                     >
                       {loadingIds.has(item.id) ? (
                         <FaSyncAlt className="spinner" />
                       ) : item?.attandance === 1 ? (
                         "Present ✓"
                       ) : (
                         "Absent X"
                       )}
                     </Button>
                    </div>

                    {item?.user_id && (
                      <div
                        className="visiting-card-link text-center"
                        onClick={() => handleShowProfile(item?.id)}
                      >
                        {t("viewVisitingCard")} <FaArrowRight />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            ))}

          {/* === 2. SEPARATE NEWSLETTER GUIDE CARD === */}
          {isNewsletter && meeting?.newsletter_guide && (
            <div className="col-md-3">
              <Card
                className="participant-card position-relative"
                style={{ marginTop: "4rem" }}
              >
                <Card.Body style={{ padding: "20px 0" }}>
                  <div className="d-flex justify-content-center">
                    <div className="participant-card-position">
                      <div className="profile-logo">
                        <Card.Img
                          className="user-img"
                          src={
                            meeting?.newsletter_guide?.logo?.startsWith("http")
                              ? meeting?.newsletter_guide?.logo
                              : `${Assets_URL}/${meeting?.newsletter_guide?.logo}`
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Card.Title className="text-center mt-4 card-heading">
                    {meeting?.newsletter_guide?.email}
                  </Card.Title>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GuidesCard;
