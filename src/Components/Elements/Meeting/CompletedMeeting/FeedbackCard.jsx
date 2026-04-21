import React from "react";
import { Assets_URL } from "../../../Apicongfig";
import { FaStar } from "react-icons/fa";
import moment from "moment";
import {
  getTimeZoneAbbreviation,
  userTimeZone,
} from "../GetMeeting/Helpers/functionHelper";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { convertToUserTimeZone } from "../../../Utils/MeetingFunctions";

const FeedbackCards = ({ meeting }) => {
  const [t] = useTranslation("global");
  const timeZoneAbbr = getTimeZoneAbbreviation(userTimeZone);

  const emojis = [
    {
      value: 5,
      emoji: "😎",
      label: t("5 Star"),
    },
    { value: 4, emoji: "😀", label: t("4 Star") },
    {
      value: 3,
      emoji: "🙂",
      label: t("3 Star"),
    },
    {
      value: 2,
      emoji: "😟",
      label: t("2 Star"),
    },
    {
      value: 1,
      emoji: "😣",
      label: t("1 Star"),
    },
    { value: 0, emoji: "❌", label: t("0 Star") },
  ];
  return (
    <div className="feedback-container ste">
      {meeting?.meeting_feedbacks?.map((feedback, index) => (
        <div
          key={index}
          className="feedback-card-1 card mb-4 mt-4 step-card-meeting"
        >
          <div className="card-body d-flex align-items-center p-3">
            {/* Avatar */}
            {feedback?.user_name ? (
              <img
                src={
                  feedback?.anonymous
                    ? "/Assets/Anonym.png"
                    : feedback?.user_ini
                }
                alt="Avatar"
                className="avatar-img rounded-circle me-3"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            ) : (
              <img
                src={
                  feedback?.anonymous
                    ? "/Assets/Anonym.png"
                    : feedback?.user?.image?.startsWith("http")
                    ? feedback?.user?.image
                    : Assets_URL + "/" + feedback?.user?.image
                }
                alt="Avatar"
                className="avatar-img rounded-circle me-3"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            )}

            {/* Content */}
            <div className="d-flex flex-column ms-2 w-100">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-1 text-dark">
                  {feedback?.user
                    ? feedback?.anonymous
                      ? "Anonymous"
                      : feedback?.user?.full_name
                    : feedback?.anonymous
                    ? "Anonymous"
                    : feedback?.user_name}
                </h5>

                {/* Star Rating */}
                <div className="star-rating">
                  {Array.from({ length: 5 }).map((_, i) => {
                    // Find corresponding emoji and label
                    const tooltipData = emojis?.find(
                      (e) => e.value === i + 1
                    ) || { emoji: "", label: "" };
                    const isTooltipStar = i + 1 === feedback?.rating; // Show tooltip only on the exact rating star

                    return (
                      // <OverlayTrigger
                      //   key={i}
                      //   placement="top"
                      //   overlay={
                      //     isTooltipStar ? (
                      //       <Tooltip id={`tooltip-${i}`}>
                      //         {tooltipData.emoji} {tooltipData.label}
                      //       </Tooltip>
                      //     ) : (
                      //       <></>
                      //     )
                      //   }
                      // >
                        <span className="d-inline-block">
                          <FaStar
                            color={i < feedback?.rating ? "gold" : "#e0e0e0"}
                            size={20}
                            style={{ cursor: "pointer" }}
                          />
                        </span>
                      // </OverlayTrigger>
                    );
                  })}
                </div>
              </div>
              <small className="card-text text-muted mb-1">
                {!feedback?.anonymous && feedback?.user?.post}
              </small>

              {/* Display Teams */}
              {/* <small className="card-text text-muted mb-3">
                {!feedback?.anonymous &&
                  feedback?.user?.teams?.map((item) => item?.name)?.join(", ")}
              </small> */}

              {/* Comment */}
              <p className="card-text">{feedback.comment}</p>

              {/* Date and Time */}
              <p className="card-text text-muted mt-2">
                {feedback?.created_at
                  ? `${convertToUserTimeZone(feedback?.created_at)}  ${timeZoneAbbr}`
                  : "No date available"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedbackCards;
