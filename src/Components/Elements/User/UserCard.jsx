import React, { useState } from "react";
import { Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import ParticipantCardProfile from "../Profile/ParticipantCardProfile";

const UserCard = ({ user, setShowHostProfile, showHostProfile }) => {
  const [id, setId] = useState(null);
  const [isUser, setIsUser] = useState(false);
  const [t] = useTranslation("global");

  const handleShowProfile = (userId) => {
    setId(userId);
    setShowHostProfile(true);
    setIsUser(true);
  };

  return (
    <>
      {showHostProfile ? (
        <div>
          <ParticipantCardProfile
            userId={id}
            handleHide={() => setShowHostProfile(false)}
            isUser={isUser}
          />
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div
              className="participant-card participant-card-meeting position-relative card"
              style={{ marginTop: "4rem" }}
            >
              <div className="card-body" style={{ padding: "20px 0px" }}>
                <div className="d-flex justify-content-center">
                  <div className="participant-card-position">
                    <div className="profile-logo">
                      <img
                        className="card-img user-img"
                        src={
                          user?.image?.startsWith("http")
                            ? user?.image
                            : Assets_URL + "/" + user?.image
                        }
                        alt="Guide Avatar"
                      />
                      <img
                        className="card-img logout-icon"
                        src="/Assets/Avatar_company.svg"
                        height="20px"
                        width="20px"
                        alt="tektime"
                      />
                      <img
                        className="card-img logout-icon"
                        src="/Assets/Avatar_company.svg"
                        height="20px"
                        width="20px"
                        alt="Company Logo"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4 card-heading card-title h5">
                  {user?.full_name}
                </div>
                <div className="mb-2 card-subtext card-subtitle h6">
                  {user?.post}
                </div>
                <div
                  className="visiting-card-link"
                  onClick={() => {
                    handleShowProfile(user?.nick_name);
                  }}
                >
                  {t("View Visiting Card")} &nbsp;
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 448 512"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserCard;
