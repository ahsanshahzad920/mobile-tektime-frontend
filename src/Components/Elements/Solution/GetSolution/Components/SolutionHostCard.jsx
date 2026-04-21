import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ParticipantCardProfile from "../../../Profile/ParticipantCardProfile";
import { Assets_URL } from "../../../../Apicongfig";

const SolutionHostCard = ({
  data,
  fromMeeting,
  handleShow,
  handleHide,
  showProfile,
  meeting,
  useIdField = "nick_name",
  isUserType = true,
}) => {
  const [id, setId] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [t] = useTranslation("global");

  console.log("meeting", meeting);
  const handleShowProfile = (userId) => {
    setId(userId);
    handleShow();
    setIsUser(isUserType);
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
        <div className="col-md-3">
          <Card
            className={`participant-card ${fromMeeting ? "participant-card-meeting" : ""
              } position-relative`}
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
                        data?.image?.startsWith("users/")
                          ? `${Assets_URL}/${data?.image}`
                          : data?.image
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
                {data?.name} {data?.last_name}
              </Card.Title>
              <Card.Subtitle className="mb-2 card-subtext">
                {data?.post}
                {/* -{" "}
                  {data?.teams?.map((item) => item.name).join(", ")} */}
              </Card.Subtitle>

              {/* {data?.contribution && (
                  <>
                    <Card.Subtitle className="mb-2 mt-3 card-subtext">
                      {data.contribution}
                    </Card.Subtitle>
                  </>
                )} */}
              <div
                className="visiting-card-link"
                onClick={() => {
                  handleShowProfile(data?.[useIdField]);
                }}
              >
                {t("viewVisitingCard")} &nbsp; <FaArrowRight />
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  );
};

export default SolutionHostCard;
