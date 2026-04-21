import React, { useState, useCallback } from "react";
import { Card, Modal } from "react-bootstrap";
import { FaArrowRight, FaCheckCircle, FaTimesCircle, FaQuestionCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";

const ReportSubscriberCard = ({
  data,
  subscribers,
  showProfile,
  meeting,
  fromMeeting,
}) => {
  const { t } = useTranslation("global");
  const renderCard = (item) => {
    const imageSrc =
      item?.image
        ? item?.image?.startsWith("users/") || item?.image?.startsWith("storage/")
          ? `${Assets_URL}/${item?.image}`
          : item.image
        : item?.participant_image
        ? item?.participant_image?.startsWith("users/") ||
          item?.participant_image?.startsWith("storage/")
          ? `${Assets_URL}/${item?.participant_image}`
          : item?.participant_image
        : "/Assets/avatar.jpeg";

    const borderColor =
      (meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event")
        ? item?.attendee_response_status === "accepted"
          ? "green"
          : item?.attendee_response_status === "declined"
            ? "red"
            : "grey"
        : item?.attandance === 1
        ? "green"
        : "red";

    return (
      <Card
        className="participant-card mb-4"
        style={{
          border: `1px solid ${borderColor}`,
        }}
      >
        <Card.Body className="d-flex justify-content-center align-items-center">
          <div className="d-flex flex-column align-items-center gap-3">
            <div className="profile-logo">
              <Card.Img
                className="user-img"
                src={imageSrc}
                alt={`${item?.full_name || item?.email}`}
              />
              <Card.Img
                className="logout-icon"
                src="/Assets/Avatar_company.svg"
                alt="tektime"
              />
            </div>
            <div className="d-flex flex-column align-items-start">
              <Card.Title className="card-heading">
                {item?.full_name || item?.email}
              </Card.Title>
              {item?.post && (
                <Card.Subtitle className="card-subtext">
                  {item?.post}
                </Card.Subtitle>
              )}
              {/* {item?.team_names?.length > 0 && (
                <Card.Subtitle className="card-subtext">
                  {item?.team_names?.join(", ")}
                </Card.Subtitle>
              )} */}
              {item?.contribution && (
                <Card.Subtitle className="card-subtext mt-2">
                  {item?.contribution}
                </Card.Subtitle>
              )}
            </div>
          </div>
          <div>
            {item?.attandance === 1 ? (
              <FaCheckCircle color="green" size={24} />
            ) : (
              <FaTimesCircle color="red" size={24} />
            )}
          </div>
        </Card.Body>
      
      </Card>
    );
  };

  return (
    <>
     

      {/* <div className="row"> */}
        {subscribers?.map((item, index) => (
                        <React.Fragment key={index}>

            {renderCard(item)}
                                 </React.Fragment>

        ))}
      {/* </div> */}
    </>
  );
};

export default ReportSubscriberCard;
