import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ParticipantCardProfile from "../Profile/ParticipantCardProfile";
import { Assets_URL } from "../../Apicongfig";

const HostCard = ({
  data,
  guides,
  fromMeeting,
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

  // -----------------------------------------------------------------
  // 1. Newsletter case 
  // -----------------------------------------------------------------
  if (meeting?.type === "Newsletter") {
    return (
      <div className="row">
        <div className="col-md-3">
          <Card
            className={`participant-card ${
              fromMeeting ? "participant-card-meeting" : ""
            } position-relative`}
            style={{ marginTop: "4rem" }}
          >
            <Card.Body style={{ padding: "20px 0" }}>
              <div className="d-flex justify-content-center">
                <div className="participant-card-position">
                  <div className="profile-logo">
                    <Card.Img
                      className="user-img"
                      src={meeting?.newsletter_guide?.logo}
                      alt="Newsletter logo"
                    />
                  </div>
                </div>
              </div>

              <Card.Title className="text-center mt-4 card-heading">
                {meeting?.newsletter_guide?.name}
              </Card.Title>

              <Card.Subtitle className="mb-2 card-subtext text-center">
                {meeting?.newsletter_guide?.email}
              </Card.Subtitle>

             
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 2. Normal participant card 
  // -----------------------------------------------------------------
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
          <div className="col-md-3">
            <Card
              className={`participant-card ${
                fromMeeting ? "participant-card-meeting" : ""
              } position-relative`}
              style={{ marginTop: "4rem" }}
            >
              <Card.Body style={{ padding: "20px 0px 20px 0" }}>
                <div className="d-flex justify-content-center">
                  <div className="participant-card-position">
                    <div className="profile-logo">
                      <Card.Img
                        className="user-img"
                        src={
                          data?.participant_image?.startsWith("users/")
                            ? `${Assets_URL}/${data?.participant_image}`
                            : data?.participant_image
                        }
                        alt="User Avatar"
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
                  {data?.first_name} {data?.last_name}
                </Card.Title>

                <Card.Subtitle className="mb-2 card-subtext">
                  {data?.post}
                  {/* {data?.team_names?.map((item) => item).join(", ")} */}
                </Card.Subtitle>

                {data?.contribution && (
                  <Card.Subtitle className="mb-2 mt-3 card-subtext">
                    {data.contribution}
                  </Card.Subtitle>
                )}

               {data?.user_id && <div
                  className="visiting-card-link"
                  onClick={() => handleShowProfile(data?.nick_name)}
                >
                  {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                </div>}
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default HostCard;