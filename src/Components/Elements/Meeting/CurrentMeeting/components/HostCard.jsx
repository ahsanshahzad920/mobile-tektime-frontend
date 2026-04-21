import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../../../Apicongfig";
import ParticipantCardProfile from "../../../Profile/ParticipantCardProfile";

const HostCard = ({
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
  const [t] = useTranslation("global");

  const handleShowProfile = (userId) => {
    setId(userId);
    handleShow();
    setIsUser(true);
  };
  const handleShowGuideProfile = (userId) => {
    setId(userId);
    handleShow();
    setIsUser(false);
  };
  return (
    <>
      {showProfile ? (
        <div>
          <ParticipantCardProfile
            userId={id}
            handleHide={handleHide}
            isUser={isUser}
          />
        </div>
      ) : (
        <div className="row">
          {(meeting && meeting?.type === "Newsletter") || doneMoment ? (
            <div className="col-md-3">
              <Card
                className={`participant-card  participant-card-meeting
                 position-relative`}
                style={{
                  marginTop: "4rem",
                }}
              >
                <Card.Body
                  style={{
                    padding: "20px 0px 20px 0",
                  }}
                >
                  <div className="d-flex justify-content-center">
                    <div className="participant-card-position">
                      <div className="profile-logo">
                        {doneMoment ? (
                          <Card.Img
                            className="user-img"
                            src={
                              data?.participant_image?.startsWith("http")

                                ? data?.participant_image 
                                : `${Assets_URL}/${data?.participant_image}`
                            }
                            alt="User Avatar"
                          />
                        ) : (
                          <Card.Img
                            className="user-img"
                            src={
                              data?.image?.startsWith("http")
                                ? data?.image 
                                : `${Assets_URL}/${data?.image}`
                            }
                            alt="User Avatar"
                          />
                        )}
                        <Card.Img
                          className="logout-icon"
                          src="/Assets/Avatar_company.svg"
                          height="20px"
                          width="20px"
                          alt="Company Logo"
                        />
                      </div>
                    </div>
                  </div>

                  <Card.Title className="text-center mt-4 card-heading">
                    {data?.full_name}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 card-subtext">
                    {data?.post}
                  </Card.Subtitle>

                  {data?.contribution && (
                    <>
                      <Card.Subtitle className="mb-2 mt-3 card-subtext">
                        {data.contribution}
                      </Card.Subtitle>
                    </>
                  )}
                  <div
                    className="visiting-card-link"
                    onClick={() => {
                      handleShowProfile(data?.nick_name);
                    }}
                  >
                    {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : null}

          {/* Guides Cards */}
          {(meeting?.created_from === "Google Calendar" || meeting?.created_from ==="Outlook Calendar" || meeting?.type === "Conversation IONOS" || meeting?.type === "Conversation Outlook" || meeting?.type === "Conversation Gmail") ? (
            meeting?.user?.email !== meeting?.event_organizer?.email ? (
              <div className="row">
                <div className="col-md-3">
                  <Card
                    className={`participant-card participant-card-meeting position-relative`}
                    style={{
                      marginTop: "4rem",
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "20px 0px 20px 0",
                      }}
                    >
                      <div className="d-flex justify-content-center">
                        <div className="participant-card-position">
                          <div className="profile-logo">
                            <Card.Img
                                                         className="user-img"
                                                         src={
                                                           meeting?.event_organizer?.image?.startsWith("http") ?
                                                           meeting?.event_organizer?.image :
                                                             Assets_URL + "/" + meeting?.event_organizer?.image
                                                            
                                                         }
                                                       />
                            
                           
                          </div>
                        </div>
                      </div>

{meeting?.event_organizer?.full_name &&   <Card.Title className="text-center mt-4 card-heading">
                      {meeting?.event_organizer?.full_name} 
                    </Card.Title>}
                     { meeting?.event_organizer?.post &&<Card.Subtitle className="mb-2 card-subtext">
                                          {meeting?.event_organizer?.post} 
                                        </Card.Subtitle>}
                {!meeting?.event_organizer?.user_id &&    
                  <Card.Title className="text-center mt-4 card-heading">
                        {meeting?.event_organizer?.email}
                      </Card.Title>}
                      {meeting?.event_organizer?.contribution && (
                        <>
                          <Card.Subtitle className="mb-3 mt-3 card-subtext">
                            {meeting?.event_organizer?.contribution}
                          </Card.Subtitle>
                        </>
                      )}
                      {meeting?.event_organizer?.user_id && (
                        <div
                          className="visiting-card-link"
                            onClick={() => {
                      handleShowProfile(meeting?.event_organizer?.nick_name);
                    }}
                        >
                          {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            ) : (
              <>
                {guides?.length > 0 &&
                  meeting?.type !== "Newsletter" &&
                  guides
                    // .filter((guide) => guide.isCreator !== 1)
                    .map((guide, index) => (
                      <div key={index} className="col-lg-3 col-md-4">
                        <Card
                          className={`participant-card participant-card-meeting
                           position-relative`}
                          style={{
                            marginTop: "4rem",
                          }}
                        >
                          <Card.Body
                            style={{
                              padding: "20px 0px 20px 0",
                            }}
                          >
                            <div className="d-flex justify-content-center">
                              <div className="participant-card-position">
                                <div className="profile-logo">
                                  <Card.Img
                                    className="user-img"
                                    src={
                                      guide?.participant_image?.startsWith(
                                        "users/"
                                      )
                                        ? Assets_URL +
                                          "/" +
                                          guide?.participant_image
                                        : guide?.participant_image
                                    }
                                    alt="Guide Avatar"
                                  />
                                  <Card.Img
                                    className="logout-icon"
                                    src="/Assets/Avatar_company.svg"
                                    height="20px"
                                    width="20px"
                                    alt="tektime"
                                  />

                                  <Card.Img
                                    className="logout-icon"
                                    src="/Assets/Avatar_company.svg"
                                    height="20px"
                                    width="20px"
                                    alt="Company Logo"
                                  />
                                </div>
                              </div>
                            </div>

                            <Card.Title className="text-center mt-4 card-heading">
                              {guide?.full_name === " " ? guide?.email : guide?.full_name}
                          
                            </Card.Title>
                               <Card.Subtitle className="mb-2 card-subtext">
                              {guide?.email}
                            </Card.Subtitle>
                            <Card.Subtitle className="mb-2 card-subtext">
                              {guide?.post}
                            </Card.Subtitle>
                            {guide?.contribution && (
                              <>
                                <Card.Subtitle className="mb-3 mt-3 card-subtext">
                                  {guide.contribution}
                                </Card.Subtitle>
                              </>
                            )}
                            {guide?.user_id && (
                              <div
                                className="visiting-card-link"
                                onClick={() => {
                                  handleShowGuideProfile(guide?.id);
                                }}
                              >
                                {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
              </>
            )
          ) : (
            guides?.length > 0 &&
            meeting?.type !== "Newsletter" &&
            guides
              // .filter((guide) => guide.isCreator !== 1)
              .map((guide, index) => (
                <div key={index} className="col-lg-3 col-md-4">
                  <Card
                    className={`participant-card participant-card-meeting position-relative`}
                    style={{
                      marginTop: "4rem",
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "20px 0px 20px 0",
                      }}
                    >
                      <div className="d-flex justify-content-center">
                        <div className="participant-card-position">
                          <div className="profile-logo">
                            <Card.Img
                              className="user-img"
                              src={
                                guide?.participant_image?.startsWith("users/")
                                  ? Assets_URL + "/" + guide?.participant_image
                                  : guide?.participant_image
                              }
                              alt="Guide Avatar"
                            />
                            <Card.Img
                              className="logout-icon"
                              src="/Assets/Avatar_company.svg"
                              height="20px"
                              width="20px"
                              alt="tektime"
                            />

                            <Card.Img
                              className="logout-icon"
                              src="/Assets/Avatar_company.svg"
                              height="20px"
                              width="20px"
                              alt="Company Logo"
                            />
                          </div>
                        </div>
                      </div>

                      <Card.Title className="text-center mt-4 card-heading">
                        {guide?.first_name} {guide?.last_name}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 card-subtext">
                        {guide?.post} 
                      </Card.Subtitle>
                      {guide?.contribution && (
                        <>
                          <Card.Subtitle className="mb-3 mt-3 card-subtext">
                            {guide.contribution}
                          </Card.Subtitle>
                        </>
                      )}
                      {guide?.user_id && (
                        <div
                          className="visiting-card-link"
                          onClick={() => {
                            handleShowGuideProfile(guide?.id);
                          }}
                        >
                          {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ))
          )}
        </div>
      )}
    </>
  );
};

export default HostCard;
