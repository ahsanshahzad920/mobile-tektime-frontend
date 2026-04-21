import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { Assets_URL } from "../../../../Apicongfig";
import {
  FaArrowRight,
  FaCheckCircle,
  FaQuestionCircle,
  FaTimesCircle,
} from "react-icons/fa";
import ParticipantCardProfile from "../../../Profile/ParticipantCardProfile";
import { useTranslation } from "react-i18next";

const SubscriberCard = ({
  data,
  subscribers,
  handleShow,
  handleHide,
  showProfile,
  meeting,
}) => {
  // Create a set of guide emails for fast lookup
  const [t] = useTranslation("global");

 
  const [id, setId] = useState(null);

  const handleShowProfile = (userId) => {
    handleShow();
    setId(userId);
  };
  return (
    <>
      {/* {showProfile ? (
        <div>
          <ParticipantCardProfile userId={id} handleHide={handleHide} />
        </div>
      ) : ( */}
        <div className="row">
          {subscribers?.map((item, index) => {
            return (
              <div className="col-md-3" key={index}>
                <Card
                  className="participant-card position-relative"
                  style={{
                    margin:"19px 0px"
                  }}
                //   style={{
                //     marginTop: "4rem",
                //     border:
                //       meeting?.type === "Google Agenda Event" &&
                //       item?.attendee_response_status === "accepted"
                //         ? "1px solid green"
                //         : item?.attendee_response_status === "declined"
                //         ? "1px solid red"
                //         : "1px solid grey",
                //     position: "relative",
                //   }}
                >
                  
                  <Card.Body style={{ padding: "20px 0px 20px 0" }}>
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
                          ) : item.participant_image ? (
                            <Card.Img
                              className="user-img"
                              src={
                                item.participant_image?.startsWith("users/") ||
                                item.participant_image?.startsWith("storage/")
                                  ? Assets_URL + "/" + item.participant_image
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
                            alt="tektime"
                          />
                        </div>
                      </div>
                    </div>

                    <Card.Title className="text-center mt-4 card-heading">
                      {item?.full_name} 
                    </Card.Title>

                    <Card.Subtitle className="mb-2 card-subtext">
                      {item?.email} 
                    </Card.Subtitle>   <Card.Subtitle className="mb-2 card-subtext">
                      {item?.post} 
                    </Card.Subtitle>
                    {item?.contribution && (
                      <>
                        <Card.Subtitle className="mb-3 mt-3 card-subtext">
                          {item.contribution}
                        </Card.Subtitle>
                      </>
                    )}
                    {item?.user_id && (
                      <div
                        className="visiting-card-link"
                        onClick={() => handleShowProfile(item?.id)}
                      >
                        {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      {/* )} */}
    </>
  );
};

export default SubscriberCard;
