import React from "react";
import { Assets_URL } from "../../../Apicongfig";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoCopyOutline, IoVideocamOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { PiFilePdfLight } from "react-icons/pi";
import { formatStepDate } from "../../../Utils/MeetingFunctions";
import { HiUserCircle } from "react-icons/hi2";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import moment from "moment";
import { FaRegFileAudio } from "react-icons/fa";
import { RiFileExcel2Line, RiFolderVideoLine } from "react-icons/ri";

const ReportStepCard = ({ users, fromMeeting, meeting }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  return (
    <div
      className="row"
      style={{ marginBottom: "6rem", gap: fromMeeting ? "4px" : "" }}
    >
      {meeting?.steps?.map((item, index) => {
        let editorContent = item.editor_content;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = editorContent;
        const firstImageTag = tempDiv.querySelector("img");
        const firstImageUrl = firstImageTag
          ? firstImageTag.getAttribute("src")
          : "";

        const handleClick = (item, index) => {
          // toggleModal(item, index);
          navigate(`/step/${item?.id}`, { state: { meeting: meeting } });
        };

        const localizeTimeTaken = (timeTaken) => {
          if (!timeTaken) return "";

          // Retrieve localized time units
          const timeUnits = t("time_unit", { returnObjects: true });

          // Split the timeTaken string by " - " to separate time components
          const timeParts = timeTaken.split(" - ");

          // Initialize variables for each time component
          let days = null;
          let hours = null;
          let minutes = null;
          let seconds = null;

          // Iterate over each part and assign it to the corresponding variable
          timeParts.forEach((part) => {
            if (part.includes("day")) {
              days = part;
            } else if (part.includes("hour")) {
              hours = part;
            } else if (part.includes("min")) {
              minutes = part;
            } else if (part.includes("sec")) {
              seconds = part;
            }
          });

          // Check if days are present
          const hasDays = Boolean(days);

          // Determine what to show based on the presence of days
          let result = "";
          if (hasDays) {
            // Show days and hours if days are present
            result = [days, hours].filter(Boolean).join(" - ");
          } else if (hours) {
            // Show only hours and minutes if hours and minutes are present
            result = [hours, minutes].filter(Boolean).join(" - ");
          } else if (minutes) {
            // Show minutes only if no days or hours are present
            // result = minutes;
            result = [minutes, seconds].filter(Boolean).join(" - ");
          } else {
            result = seconds;
          }

          // Return empty string if result is undefined or empty
          if (!result) return "";

          // Localize and return the result
          return result
            .split(" ")
            .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
            .join(" ");
        };

        const convertTo24HourFormat = (time, date, type, timezone) => {
          if (!time || !date || !type) {
            return false;
          }

          const meetingTimezone = timezone || "Europe/Paris";
 
          const userTimezone =  moment.tz.guess() 


          // Convert meeting time from its original timezone to the user's timezone
          const convertedTime = moment
            .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
            .tz(userTimezone);

          // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
          // const timeMoment = moment(time, "hh:mm:ss A");
          // return timeMoment.isValid() ? timeMoment.format("HH:mm:ss") : "";
          // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
          const timeMoment = moment(convertedTime, "hh:mm:ss A");

          // Check if the time is valid
          if (!timeMoment.isValid()) return "";

          // If the meeting type is 'Quiz', include seconds in the format
          const format = type === "seconds" ? "HH[h]mm[m]ss" : "HH[h]mm";

          // Return the time in the appropriate format
          return timeMoment.format(format);
        };

        return (
          <>
            {fromMeeting ? (
              <div className="col-12 ste" key={index}>
                <Card
                  className="mt-4 step-card-meeting"
                  onClick={() => {
                    handleClick(item, index);
                  }}
                >
                  <Card.Body className="step-card-body">
                    <div className="step-number-container">
                      <span className="step-number">
                        {item?.order_no <= 9 ? "0" : " "}
                        {item?.order_no}
                      </span>
                    </div>
                    <div className="step-body">
                      <div className="step-data reportstepcard-stepdata">
                        <div className="step-header">
                          <Card.Title className="step-card-heading reportstepcard-title">
                            {item?.title}
                          </Card.Title>
                           { item.step_status === "completed" ? (
                              <span className="status-badge-completed">
                                {t("badge.completed")}
                              </span>
                            ) : item.step_status === "in_progress" ? (
                              <span
                                className={
                                  meeting?.delay >= "00d:00h:01m"
                                    ? "status-badge-red"
                                    : "status-badge-inprogress"
                                }
                              >
                                {t("badge.inprogress")}
                              </span>
                            ) : item?.step_status === "cancelled" || item?.step_status === "abort" ? 
                            (
                              // null
                              <span className="status-badge-red">
                                {t("badge.cancel")}
                              </span>
                            )
                            : (
                              // null
                              <span className="status-badge-upcoming">
                                {/* Upcoming */}
                                {t("badge.future")}
                              </span>
                            )}
                        </div>
                        <div className="step-content reportstepcard-content">
                          <Card.Subtitle className="step-card-subtext">
                            {meeting.newsletter_guide ? (
                              <>
                                {meeting?.newsletter_guide?.logo ? (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    src={meeting?.newsletter_guide?.logo?.startsWith('http') ? meeting?.newsletter_guide?.logo :
                                      Assets_URL +
                                      "/" +
                                      meeting?.newsletter_guide?.logo
                                    }
                                    alt={meeting?.newsletter_guide?.name}
                                  />
                                ) : (
                                  <HiUserCircle
                                    style={{
                                      height: "24px",
                                      width: "24px",
                                    }}
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                {item?.participant?.participant_image ? (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    src={
                                      item?.participant?.participant_image?.startsWith("users/")
                                        ? Assets_URL + "/" + item?.participant?.participant_image
                                        : // : item?.image?.startsWith(
                                          //     "users/"
                                          //   )
                                          // ? Assets_URL + "/" + item.assigned_to_image
                                          item?.participant?.participant_image
                                    }
                                    // src={
                                    //     item?.assigned_to_image
                                    // }
                                    alt="img"
                                  />
                                ) : (
                                  <img
                                    height="24px"
                                    width="24px"
                                    style={{
                                      marginRight: "9px",
                                      borderRadius: "20px",
                                      objectFit: "cover",
                                      objectPosition: "top",
                                    }}
                                    // src={`${users?.participant_image}`}
                                    src={
                                      users?.image?.startsWith("users/")
                                        ? Assets_URL + "/" + users.image
                                        : users?.image
                                    }
                                    alt="img"
                                  />
                                )}
                              </>
                            )}

                            {meeting?.newsletter_guide ? (
                              <span>{meeting?.newsletter_guide?.name}</span>
                            ) : (
                              <span>
                                {item?.assigned_to_name ||
                                  `${users?.firstName} ${users?.lastName}`}
                              </span>
                            )}
                          </Card.Subtitle>
                          <Card.Text className="step-card-content stepcard-content">
                            <img
                              height="16px"
                              width="16px"
                              src="/Assets/ion_time-outline.svg"
                            />
                            {/* <span className="me-2">
                              {item?.step_time}
                            </span> */}
                            {window.location.href.includes(
                              "/present/invite"
                            ) ? (
                              <>
                                {item.time_unit === "days" ? (
                                  <>
                                    <span className="me-2">
                                      {formatStepDate(
                                        item.start_date,
                                        item?.step_time,
                                        meeting?.timezone
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="me-2">
                                      {formatStepDate(
                                        item.start_date,
                                        item?.step_time,
                                        meeting?.timezone
                                      ) +
                                        " " +
                                        `${t("at")}` +
                                        " " +
                                        convertTo24HourFormat(
                                          item?.step_time,
                                          item?.start_date,
                                          item?.time_unit,
                                          meeting?.timezone
                                        )}
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="me-2">
                                <span>
                                  {item.step_status === null
                                    ? item?.step_time
                                    : item.step_time}
                                </span>
                                {item.step_status === "completed" ||
                                item.step_status === "in_progress" ? (
                                  <span className="ms-2">
                                    {item?.start_date && item?.start_date}
                                  </span>
                                ) : null}
                              </span>
                            )}{" "}
                            <img
                              height="16px"
                              width="16px"
                              src="/Assets/alarm-invite.svg"
                            />
                            {window.location.href.includes(
                              "/present/invite"
                            ) ? (
                              <>
                                <span>
                                  {localizeTimeTaken(
                                    item?.time_taken?.replace("-", "")
                                  )}
                                </span>
                                <span>
                                  {" "}
                                  {!(
                                    meeting?.type === "Special" ||
                                    meeting?.type === "Law"
                                  ) && <>&nbsp; / &nbsp;</>}
                                    { item?.editor_type === "Story" && item?.time_unit === "days" ? (
    item.count2 + " " + (item.count2 > 1 ? "Story Points" : "Story Point")
    // or simply: item.count2 + " SP"
  ) : (
    item.count2 + " " + t(`time_unit.${item.time_unit}`)
  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {/* {localizeTimeTaken(item?.time_taken)} */}
                                  {localizeTimeTaken(
                                    item?.time_taken?.replace("-", "")
                                  )}
                                </span>
                              </>
                            )}{" "}
                          </Card.Text>
                        </div>
                      </div>
                      {item.editor_content &&
                      item.editor_content.trim() !==
                        "<html><head></head><body></body></html>" ? (
                        <div className="step-img-container reportstepcard-imgcontainer">
                          {firstImageUrl ? (
                            <Card.Img
                              className="step-img reportstepcard-stepimg"
                              src={firstImageUrl}
                            />
                          ) : (
                            <div className="fallback-img-container">
                              {/* <img
                                src="/Assets/Tek.png"
                                className="fallback-img"
                                alt="Fallback Image"
                              /> */}
                              <FiEdit
                                className="file-img img-fluid"
                                style={{ padding: "15px" }}
                              />
                            </div>
                          )}
                        </div>
                      ) : item.editor_type === "File" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <PiFilePdfLight
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : item.editor_type === "Video" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <IoVideocamOutline
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : item?.editor_type === "Video Report" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <RiFolderVideoLine
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : item?.editor_type === "Audio Report" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <FaRegFileAudio
                            className="file-img img-fluid"
                            style={{ padding: "20px" }}
                          />
                        </div>
                      ) : item.editor_type === "Photo" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <MdOutlinePhotoSizeSelectActual
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : item.editor_type === "Excel" ? (
                        <div className="file-img-container reportstepcard-imgcontainer">
                          <RiFileExcel2Line
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : item.url ? (
                        <div className="link-img-container reportstepcard-imgcontainer">
                          <IoCopyOutline
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="fallback-img-container reportstepcard-imgcontainer"
                          style={{
                            height: "160px",
                          }}
                        >
                          <FiEdit
                            className="file-img img-fluid"
                            style={{ padding: "15px" }}
                          />
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <div className="col-12 email-step" key={index}>
                <Card className="mt-4 step-card">
                  <Card.Body className="d-flex">
                    <div className="d-flex align-items-center">
                      <div className="step-number-container">
                        <span className="step-number">
                          {index < 10 ? "0" : " "}
                          {index + 1}
                        </span>
                      </div>
                      {/* <span className="step-number">{index + 1}.</span> */}
                      {item.editor_content ? (
                        <div className="step-img-container reportstepcard-imgcontainer">
                          {firstImageUrl ? (
                            <Card.Img
                              className="step-img"
                              src={firstImageUrl}
                            />
                          ) : (
                            <div className="fallback-img-container">
                              <img
                                src="/Assets/Tek.png"
                                className="fallback-img"
                                alt="Fallback Image"
                              />
                            </div>
                          )}
                        </div>
                      ) : item.file ? (
                        <div className="file-img-container">
                          <Card.Img
                            className="file-img img-fluid"
                            src="/Assets/pdf-svgrepo-com.svg"
                          />
                        </div>
                      ) : item.url ? (
                        <div className="link-img-container">
                          <Card.Img
                            className="link-img"
                            src={`/Assets/link-removebg.png`}
                          />
                        </div>
                      ) : (
                        <div className="fallback-img-container">
                          <Card.Img
                            className="fallback-img"
                            src={`/Assets/Tek.png`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="ms-3 d-flex justify-content-center flex-column step-data">
                      <Card.Title className="step-card-heading">
                        {item?.title}
                      </Card.Title>
                      <Card.Subtitle className="step-card-subtext">
                        {item?.image ? (
                          <img
                            height="24px"
                            width="24px"
                            style={{
                              marginRight: "9px",
                              borderRadius: "20px",
                              objectFit: "cover",
                              objectPosition: "top",
                            }}
                            // src={
                            //   item?.image
                            //     ? `${Assets_URL}/${item?.image}`
                            //     : item?.assigned_to_image
                            // }
                            src={
                              item?.image?.startsWith("users/")
                                ? Assets_URL + "/" + item?.image
                                : item?.image
                            }
                            // src={
                            //     item?.assigned_to_image
                            // }
                            alt="img"
                          />
                        ) : (
                          <img
                            height="24px"
                            width="24px"
                            style={{
                              marginRight: "9px",
                              borderRadius: "20px",
                              objectFit: "cover",
                              objectPosition: "top",
                            }}
                            // src={`${users?.participant_image}`}
                            src={
                              users?.image?.startsWith("users/")
                                ? Assets_URL + "/" + users.image
                                : users?.image
                            }
                            alt="img"
                          />
                        )}
                        <span>
                          {item?.assigned_to_name ||
                            `${users?.firstName} ${users?.lastName}`}
                        </span>
                      </Card.Subtitle>
                      <Card.Text className="step-card-content">
                        <img
                          height="16px"
                          width="16px"
                          style={{ width: "auto", marginRight: "9px" }}
                          src="/Assets/ion_time-outline.svg"
                        />
                        <span className="me-2">{item?.step_time}</span>
                        <img
                          height="16px"
                          width="16px"
                          style={{ width: "auto", marginRight: "9px" }}
                          src="/Assets/alarm-invite.svg"
                        />
                        <span>{item?.count2 + " " + "Mins"}</span>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
          </>
        );
      })}
    </div>
  );
};

export default ReportStepCard;
