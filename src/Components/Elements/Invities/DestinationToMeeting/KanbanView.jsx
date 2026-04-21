import { useState, useEffect } from "react";
import { Avatar } from "antd";
import React from "react";
import { Card, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { Tooltip as AntTooltip } from "antd";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../../Apicongfig";
import { HiUserCircle } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  abortMeetingTime,
  calculateTimeDifference,
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatStepDate,
  specialMeetingEndTime,
  typeIcons,
} from "../../../Utils/MeetingFunctions";
import { convertTo12HourFormat } from "../../Meeting/GetMeeting/Helpers/functionHelper";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
const KanbanView = ({
  data,
  destination,
  type,
  showProgressBar,
  Progress,
  isDeadlinePassed,
  diffDays,
}) => {
  const [t] = useTranslation("global");
  const { open, handleShow, handleCloseModal, getMeeting, setCheckId } =
    useFormContext();
  const navigate = useNavigate();
  const [filteredMeetings, setFilteredMeetings] = useState({
    upcoming: [],
    todo: [],
    inProgress: [],
    completed: [],
  });

  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };

  function calculateTotalTime(steps) {
    let totalSeconds = 0;
    steps.forEach((step) => {
      switch (step.time_unit) {
        case "hours":
          totalSeconds += step.count2 * 3600;
          break;
        case "minutes":
          totalSeconds += step.count2 * 60;
          break;
        case "seconds":
          totalSeconds += step.count2;
          break;
      }
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (hrs > 0) {
      result += `${hrs} ${t("hours")} `;
    }
    if (mins > 0) {
      result += `${mins} mins `;
    }
    if (secs > 0) {
      result += `${secs} secs`;
    }
    return result.trim();
  }
  const convertTo12HourFormatForClosed = (time) => {
    if (!time) return;

    const timeMoment = moment(time, "HH:mm:ss");
    return timeMoment.isValid() ? timeMoment.format("HH[h]mm") : "";
  };
  useEffect(() => {
    if (data) {
      // const draft = data.filter((item) => item.status === "draft");
      const upcoming = data.filter((item) =>
        ["active", "draft", "no_status"].includes(item.status)
      );
      const todo = data.filter((item) => ["todo"].includes(item.status));
      const inProgress = data.filter((item) =>
        ["in_progress", "to_finish"].includes(item.status)
      );
      const completed = data.filter((item) =>
        ["closed", "abort"].includes(item.status)
      );

      setFilteredMeetings({
        upcoming,
        todo,
        inProgress,
        completed,
      });
    }
  }, [data]);

  const viewDraft = async (item) => {
    handleShow();
    setCheckId(item?.id);
    await getMeeting(item.id);
  };
  const handleClick = (item, index) => {
    if (item?.status === "closed" || item?.status === "abort") {
      navigate(`/present/invite/${item?.id}`);
    } else if (item?.status === "draft") {
      //Open meeting modal
      viewDraft(item);
    } else {
      navigate(`/invite/${item?.id}`);
    }
  };

  const renderStatusBadge = (meeting) => {
    switch (meeting?.status) {
      case "closed":
        return (
          <span className="mx-2 badge inprogrss">{t("badge.finished")}</span>
        );
      case "in_progress":
        return (
          <span
            className={`${
              meeting?.meeting_steps?.some(
                (item) =>
                  item?.step_status === "in_progress" &&
                  convertTimeTakenToSeconds(item?.time_taken) >
                    convertCount2ToSeconds(item?.count2, item?.time_unit)
              )
                ? "status-badge-red-invite"
                : "status-badge-inprogress-invite"
            } mx-2 badge`}
          >
            {t("badge.inprogress")}
          </span>
        );
      case "active":
        return (
          <span style={{ verticalAlign: "text-bottom" }}>
            <span
              className={`badge ms-2 ${
                moment().isAfter(
                  moment(
                    `${meeting?.date} ${meeting?.start_time}`,
                    "YYYY-MM-DD HH:mm"
                  )
                )
                  ? "late"
                  : "future"
              }`}
              style={{ padding: "3px 8px 3px 8px" }}
            >
              {moment().isAfter(
                moment(
                  `${meeting?.date} ${meeting?.start_time}`,
                  "YYYY-MM-DD HH:mm"
                )
              )
                ? t("badge.late")
                : t("badge.future")}
            </span>
          </span>
        );
      case "to_finish":
        return (
          <span className="mx-2 badge status-badge-finish">
            {t("badge.finish")}
          </span>
        );
      case "draft":
        return (
          <span className="mx-2 badge status-badge-green">
            {t("badge.draft")}
          </span>
        );
      case "todo":
        return (
          <span className="mx-2 badge status-badge-green">
            {t("badge.Todo")}
          </span>
        );
      case "abort":
        return (
          <span className="mx-2 badge status-badge-abort">
            {t("badge.aborted")}
          </span>
        );
      case "no_status":
        return (
         null
        );
      default:
        return (
          <span className="mx-2 badge inprogrss">{t("badge.finished")}</span>
        );
    }
  };

  const renderMeetingCard = (item, index, columnType) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatDateAndTimeInUserTimezone = (dateString) => {
      const dateObj = new Date(dateString);
      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        timeZone: userTimeZone,
      });
      const formattedTimeParts = dateObj
        .toLocaleTimeString("en-GB", {
          timeZone: userTimeZone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .split(":");
      const formattedTime = `${formattedTimeParts[0]}h${formattedTimeParts[1]}`;
      return { formattedDate, formattedTime };
    };

    const { formattedDate, formattedTime } = formatDateAndTimeInUserTimezone(
      destination?.destination_end_date_time
    );

    const calculateTotalTimeTaken = (steps) => {
      if (!steps) return;
      // Helper function to convert time string to seconds
      const convertToSeconds = (timeString) => {
        if (!timeString) return 0;
        let totalSeconds = 0;

        // Split by '-' and iterate through parts
        const timeParts = timeString?.split(" - ").map((part) => part.trim());
        timeParts.forEach((part) => {
          const [value, unit] = part.split(" ");

          if (unit.startsWith("sec")) {
            totalSeconds += parseInt(value, 10);
          } else if (unit.startsWith("min")) {
            totalSeconds += parseInt(value, 10) * 60;
          } else if (unit.startsWith("hour") || unit.startsWith("hr")) {
            totalSeconds += parseInt(value, 10) * 3600;
          } else if (unit.startsWith("day")) {
            totalSeconds += parseInt(value, 10) * 86400;
          }
        });

        return totalSeconds;
      };

      // Calculate total time in seconds
      let totalSeconds = steps?.reduce((acc, step) => {
        return acc + convertToSeconds(step?.time_taken);
      }, 0);

      // Convert total seconds to days, hours, minutes, and seconds
      const days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Determine the most significant units to display
      let timeDisplay = "";
      if (days > 0) {
        timeDisplay =
          hours > 0
            ? `${days} ${t("time_unit.days")} - ${hours} ${t(
                "time_unit.hours"
              )} `
            : `${days} ${t("time_unit.days")} `;
      } else if (hours > 0) {
        timeDisplay =
          minutes > 0
            ? `${hours} ${t("time_unit.hours")}  - ${minutes} ${t(
                "time_unit.minutes"
              )} `
            : `${hours} ${t("time_unit.hours")}`;
      } else if (minutes > 0) {
        timeDisplay =
          seconds > 0
            ? `${minutes} ${t("time_unit.minutes")} - ${seconds} ${t(
                "time_unit.seconds"
              )}`
            : `${minutes} ${t("time_unit.minutes")}`;
      } else {
        timeDisplay = `${seconds} ${t("time_unit.seconds")}`;
      }

      return timeDisplay;
    };

    const calculateRealEndTimeForClosed = (steps) => {
      if (steps?.length === 0) return null;

      const convertToSeconds = (timeTaken) => {
        if (!timeTaken) return 0;
        let totalSeconds = 0;
        const parts = timeTaken?.split(" - ");
        parts.forEach((part) => {
          if (part.includes("day")) {
            totalSeconds += parseInt(part) * 86400; // 1 day = 86400 seconds
          } else if (part.includes("hour")) {
            totalSeconds += parseInt(part) * 3600; // 1 hour = 3600 seconds
          } else if (part.includes("min")) {
            totalSeconds += parseInt(part) * 60; // 1 minute = 60 seconds
          } else if (part.includes("sec")) {
            totalSeconds += parseInt(part); // seconds
          }
        });
        return totalSeconds;
      };

      const totalTimeInSeconds = steps?.reduce(
        (acc, step) => acc + convertToSeconds(step.time_taken),
        0
      );

      const firstStep = steps && steps.length > 0 ? steps[0] : null;

      const firstStepCurrentTime = firstStep?.current_time
        ? moment(firstStep.current_time, "HH:mm:ss")
        : moment(item?.starts_at, "HH:mm:ss");

      if (!firstStepCurrentTime) return null;

      const realEndTime = firstStepCurrentTime
        .add(totalTimeInSeconds, "seconds")
        .format("HH:mm:ss");

      return realEndTime;
    };
    const realEndTimeForClosed = calculateRealEndTimeForClosed(
      item?.meeting_steps
    );

    const formattedMeetingDate = moment(item?.date).format("DD/MM/YYYY");
    const daysDifference = calculateDaysDifference(
      item?.date,
      item?.estimate_time?.split("T")[0]
    );
    const totalTime = calculateTotalTime(item?.meeting_steps);

    const renderTooltip = (text) => (
      <Tooltip id={`tooltip-${index}`}>{text}</Tooltip>
    );

    return (
      <Card
        className="mt-4 step-card-meeting1"
        onClick={(e) => {
          e.stopPropagation();
          handleClick(item, index);
        }}
        style={{
          height: columnType === "inProgress" ? "auto" : "425px",
        }}
        key={index}
      >
        <Card.Body className="step-card-body p-0">
          <div className="step-body">
            <div className="step-data">
              <h6
                className="step-card-heading m-0 p-0 d-flex align-items-center justify-content-between"
                style={{
                  color: "#92929d",
                  fontSize: "13px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    `/client/${
                      destination?.clients?.id || destination?.client_id
                    }`
                  );
                }}
              >
                {destination?.clients?.client_logo && (
                  <Avatar
                    src={
                      destination.clients?.client_logo?.startsWith("http")
                        ? destination?.clients?.client_logo
                        : Assets_URL + "/" + destination?.clients?.client_logo
                    }
                    size={24}
                    className="me-2"
                  />
                )}
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip(
                    destination?.clients?.name || "No Client"
                  )}
                >
                  <Card.Title className="meeting-card-title truncated-text">
                    {destination?.clients?.name}
                  </Card.Title>
                </OverlayTrigger>
              </h6>
              <hr className="my-2" />
              <h6
                className="step-card-heading m-0 p-0 fs-6 d-flex align-items-center justify-content-between"
                style={{
                  color: "#92929d",
                }}
                // onClick={(e) => {
                //   e.stopPropagation();

                //   const path =
                //     item?.meeting?.type === "Special" ||
                //     item?.meeting?.status === "closed" ||
                //     item?.meeting?.status === "abort"
                //       ? `/present/invite/${item?.id}`
                //       : `/invite/${item?.id}`;

                //   navigate(path, {
                //     state: {
                //       data,
                //       from: "meeting",
                //     },
                //   });
                // }}
              >
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip(item?.title || "No Title")}
                >
                  <h6 className="meeting-card-subtitle mb-0">
                    {typeIcons[item?.type]} {item?.objective}
                  </h6>
                </OverlayTrigger>
              </h6>
              <hr className="my-2" />

              <div
                className="step-header d-flex align-items-center justify-content-between"
                style={{ margin: "9px 0px" }}
              >
                <div className="step-number-container d-flex align-items-center">
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(item?.title)}
                  >
                    <Card.Title className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text destination-ellipses-text">
                      {item?.title}
                    </Card.Title>
                  </OverlayTrigger>
                </div>
                {renderStatusBadge(item)}
              </div>
              <div className="step-content">
                <Card.Subtitle className="step-card-subtext">
                  {item.user && (
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
                        item?.user?.image?.startsWith("http")
                          ? item?.user?.image
                          : Assets_URL + "/" + item?.user?.image
                      }
                      alt="img"
                    />
                  )}
                  {item.user ? <span>{item?.user?.full_name}</span> : null}
                </Card.Subtitle>

                {/* {(item?.meeting_start_date || item?.meeting_end_date) && ( */}
                <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    <img
                      height="14px"
                      width="14px"
                      src="/Assets/ion_time-outline.svg"
                    />
                    <span
                      className="time"
                      style={{ fontSize: "12px", marginLeft: "4px" }}
                    >
                      {item?.type === "Action" ||
                      item?.type === "Newsletter" ||
                      item?.type === "Strategy" ? (
                        <span
                          className="time"
                          style={{ fontSize: "12px", marginLeft: "4px" }}
                        >
                          {formatStepDate(
                            item?.date,
                            item?.starts_at || item?.start_time,
                            item?.timezone
                          )}{" "}
                          -
                          {formatStepDate(
                            item?.estimate_time?.split("T")[0],
                            item?.starts_at || item?.start_time,
                            item?.timezone
                          )}{" "}
                          {item?.status !== "closed" && (
                            <span>
                              {daysDifference &&
                                `(${daysDifference} ${t("days")})`}{" "}
                            </span>
                          )}
                          {item?.status === "abort" && (
                            <>
                              {item?.abort_end_time
                                ? abortMeetingTime(
                                    item?.abort_end_time,
                                    "DD/MM/yyyy",
                                    item?.timezone
                                  )
                                : formatStepDate(
                                    item?.estimate_time?.split("T")[0],
                                    item?.starts_at || item?.start_time,
                                    item?.timezone
                                  )}
                            </>
                          )}
                        </span>
                      ) : (
                        item?.status === "no_status" && (!item?.date || !item?.start_time) ? null : 
                        <span
                          className="time"
                          style={{ fontSize: "12px", marginLeft: "4px" }}
                        >
                          {formattedMeetingDate}
                          &nbsp; {t("at")} &nbsp;
                          {convertTo12HourFormat(
                            item?.starts_at || item?.start_time,
                            item?.date,
                            item?.meeting_steps,
                            item?.timezone
                          )}{" "}
                          {item?.status === "closed" && (
                            <>
                              -{" "}
                              {formatStepDate(
                                item?.estimate_time?.split("T")[0],
                                item?.starts_at || item?.start_time,
                                item?.timezone
                              )}{" "}
                              {t("at")} &nbsp;
                              <>
                                {item?.type === "Special" ||
                                item?.type === "Law" ? (
                                  <>
                                    {specialMeetingEndTime(
                                      item?.start_time,
                                      item?.meeting_steps
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {realEndTimeForClosed
                                      ? convertTo12HourFormat(
                                          item?.estimate_time?.split("T")[1],
                                          item?.estimate_time?.split("T")[0],
                                          item?.meeting_steps,
                                          item?.timezone
                                        )
                                      : " "}
                                  </>
                                )}
                              </>
                            </>
                          )}
                          {item?.status === "abort" && (
                            <>
                              {item?.abort_end_time ? (
                                <>
                                  -{" "}
                                  {abortMeetingTime(
                                    item?.abort_end_time,
                                    "DD/MM/yyyy",
                                    item?.timezone
                                  )}{" "}
                                  {t("at")} &nbsp;
                                  {abortMeetingTime(
                                    item?.abort_end_time,
                                    "HH[h]mm",
                                    item?.timezone
                                  ) || "N/A"}
                                </>
                              ) : (
                                <>
                                  -{" "}
                                  {formatStepDate(
                                    item?.estimate_time?.split("T")[0]
                                  )}{" "}
                                  {t("at")} &nbsp;
                                  {realEndTimeForClosed
                                    ? convertTo12HourFormatForClosed(
                                        item?.estimate_time?.split("T")[1]
                                      )
                                    : " "}
                                </>
                              )}
                            </>
                          )}
                      {item?.status === "active" ? (
                            totalTime && ` (${totalTime}) `
                          ) : item?.status === "in_progress" ||
                            item?.status === "to_finish" ||
                            item?.status === "todo" ? (
                            <>
                              {calculateTimeDifference(
                                item?.meeting_steps,
                                item?.starts_at,
                                item?.current_date
                              )}
                            </>
                          ) : null}
                        </span>
                      )}
                      
                    </span> 
                  </div>
                  {item?.status === "no_status" && (!item?.date || !item?.start_time) && (
                        <span
                          className="time"
                          style={{ fontSize: "12px", marginLeft: "20px" }}
                        >
                            {/* {t("À définir")} */}
                            {totalTime && `(${totalTime}) `}
                            {item?.timezone}
                        </span>
                      )}

                  {(item?.status === "closed" || item?.status === "abort") && (
                    <>
                      <div className="text-start">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 17 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_1578_4092)">
                            <path
                              d="M16.2669 11.3333L12.9336 14.6666L10.6003 12.3333L11.6003 11.3333L12.9336 12.6666L15.2669 10.3333L16.2669 11.3333ZM9.33359 13.2666C9.06693 13.3333 8.86693 13.3333 8.60026 13.3333C5.66693 13.3333 3.26693 10.9333 3.26693 7.99998C3.26693 5.06665 5.66693 2.66665 8.60026 2.66665C11.5336 2.66665 13.9336 5.06665 13.9336 7.99998C13.9336 8.26665 13.9336 8.46665 13.8669 8.73331C14.3336 8.79998 14.7336 8.93331 15.1336 9.13331C15.2003 8.73331 15.2669 8.39998 15.2669 7.99998C15.2669 4.33331 12.2669 1.33331 8.60026 1.33331C4.93359 1.33331 1.93359 4.33331 1.93359 7.99998C1.93359 11.6666 4.93359 14.6666 8.60026 14.6666C9.00026 14.6666 9.40026 14.6 9.73359 14.5333C9.53359 14.2 9.40026 13.7333 9.33359 13.2666ZM11.0003 9.39998L8.93359 8.19998V4.66665H7.93359V8.66665L10.2669 10.0666C10.4669 9.79998 10.7336 9.59998 11.0003 9.39998Z"
                              fill="#8590A3"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1578_4092">
                              <rect
                                width="14"
                                height="14"
                                fill="white"
                                transform="translate(0.601562)"
                              />
                            </clipPath>
                          </defs>
                        </svg>

                        {item?.type === "Special" || item?.type === "Law" ? (
                          <span
                            className="time"
                            style={{ fontSize: "12px", marginLeft: "8px" }}
                          >
                            {item?.estimate_time_time_taken}
                          </span>
                        ) : (
                          <span
                            className="time"
                            style={{ fontSize: "12px", marginLeft: "8px" }}
                          >
                            {calculateTotalTimeTaken(item?.meeting_steps)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </Card.Text>
                {/* )} */}

                <div className=" d-flex align-items-center flex-wrap mb-2">
                  <Avatar.Group>
                    {item?.guides?.map((item) => {
                      return (
                        <>
                          <AntTooltip title={item?.full_name} placement="top">
                            <Avatar
                              size="default"
                              src={
                                item?.participant_image?.startsWith("http")
                                  ? item?.participant_image
                                  : Assets_URL + "/" + item?.participant_image
                              }
                            />
                          </AntTooltip>
                        </>
                      );
                    })}
                  </Avatar.Group>
                  <span
                    style={{
                      marginLeft: item?.guides?.length > 0 ? "8px" : "0px",
                    }}
                  >
                    {item?.guides?.length > 0
                      ? `${item?.guides?.length} ${
                          item?.guides?.length > 1
                            ? t("presentors")
                            : t("presentor")
                        }`
                      : ""}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="creator">{t("Privacy")}</div>
                  <div className="d-flex align-items-center flex-wrap">
                    {item?.moment_privacy === "public" ? (
                      <Avatar
                        src="/Assets/Tek.png"
                        style={{
                          borderRadius: "0",
                        }}
                      />
                    ) : item?.moment_privacy === "team" ? (
                      <Avatar.Group>
                        {item?.moment_privacy_teams_data?.map((item) => {
                          return (
                            <>
                              {/* <Tooltip
                                                                              title={item?.name}
                                                                              placement="top"
                                                                            > */}
                              <Avatar
                                size="large"
                                // src={
                                //   item?.logo?.startsWith("teams/")
                                //     ? Assets_URL + "/" + item.logo
                                //     : item.logo
                                // }
                                src={
                                  item?.logo?.startsWith("http")
                                    ? item.logo
                                    : Assets_URL + "/" + item.logo
                                }
                                style={{
                                  objectFit: "cover",
                                  objectPosition: "top",
                                }}
                              />
                              {/* </Tooltip> */}
                            </>
                          );
                        })}
                      </Avatar.Group>
                    ) : item?.moment_privacy === "enterprise" ? (
                      <img
                        src={
                          item?.user?.enterprise?.logo?.startsWith(
                            "enterprises/"
                          )
                            ? Assets_URL + "/" + item?.user?.enterprise?.logo
                            : item?.user?.enterprise?.logo?.startsWith(
                                "storage/enterprises/"
                              )
                            ? Assets_URL + "/" + item?.user?.enterprise?.logo
                            : item?.user?.enterprise?.logo
                        }
                        alt="Logo"
                        style={{
                          width: "30px",
                          height: "30px",
                          objectFit: "fill",
                          borderRadius: "50%",
                        }}
                      />
                    ) : item?.moment_privacy === "password" ? (
                      <svg
                        width="37px"
                        height="36px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>{" "}
                        </g>
                      </svg>
                    ) : (
                      <Avatar
                        src={
                          item?.user?.image?.startsWith("users/")
                            ? Assets_URL + "/" + item?.user?.image
                            : item?.user?.image
                        }
                        style={{
                          objectFit: "cover",
                          objectPosition: "top",
                          height: "24px",
                          width: "24px",
                        }}
                      />
                    )}

                    <span
                      className={`badge ms-2 ${
                        item?.moment_privacy === "private"
                          ? "solution-badge-red"
                          : item?.moment_privacy === "public"
                          ? "solution-badge-green"
                          : item?.moment_privacy === "enterprise"
                          ? "solution-badge-blue"
                          : item?.moment_privacy === "password"
                          ? "solution-badge-red"
                          : "solution-badge-yellow"
                      }`}
                      style={{
                        padding: "3px 8px 3px 8px",
                      }}
                    >
                      {item?.moment_privacy === "private"
                        ? t("solution.badge.private")
                        : item?.moment_privacy === "public"
                        ? t("solution.badge.public")
                        : item?.moment_privacy === "enterprise"
                        ? t("solution.badge.enterprise")
                        : item?.moment_privacy === "password"
                        ? t("solution.badge.password")
                        : t("solution.badge.team")}
                    </span>
                  </div>
                </div>
                {destination?.destination_end_date_time && (
                  <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start">
                    <div className="creator">
                      {t("destination_mission_end_date_label")}:
                    </div>
                    <div className="mb-2">
                      <div className="d-flex align-items-center flex-wrap">
                        <span>
                          {formattedDate} {t("at")} {formattedTime}
                        </span>
                      </div>
                    </div>
                  </Card.Text>
                )}

                {columnType === "inProgress" && isDeadlinePassed && (
                  <>
                    <div className="d-flex align-items-center flex-wrap">
                      <p
                        className="text-danger fw-bold"
                        style={{ fontSize: "12px" }}
                      >
                        {t("budget.Exceeded Deadline Error")} ({diffDays}{" "}
                        {t("time_unit.da")}
                        {diffDays > 1 ? "s" : ""} {t("budget.passed")})
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <>
      <div className="container-fluid invite">
        {showProgressBar && (
          <div className="progress-overlay">
            <div style={{ width: "50%" }}>
              <ProgressBar now={Progress} animated />
            </div>
          </div>
        )}
        <div className="mb-4 mt-1 action-tabs">
          <div className="row">
            <div className="col-md-3 text-center">
              <div
                className="kanban-header d-flex align-items-center justify-content-center gap-2 py-2"
                style={{
                  borderBottom: "2px solid #0026b1",
                  fontWeight: "600",
                  color: "#0026b1",
                  whiteSpace: "nowrap",
                }}
              >
                {t("badge.future")}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: "#e6f7ff",
                    color: "#0026b1",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {filteredMeetings.upcoming.length}
                </span>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="kanban-header d-flex align-items-center justify-content-center gap-2 py-2"
                style={{
                  borderBottom: "2px solid #0026b1",
                  fontWeight: "600",
                  color: "#0026b1",
                  whiteSpace: "nowrap",
                }}
              >
                {t("badge.Todo")}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: "#f6ffed",
                    color: "#52c41a",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {filteredMeetings.todo.length}
                </span>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="kanban-header d-flex align-items-center justify-content-center gap-2 py-2"
                style={{
                  borderBottom: "2px solid #0026b1",
                  fontWeight: "600",
                  color: "#0026b1",
                  whiteSpace: "nowrap",
                }}
              >
                {t("badge.inprogress")}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: "#e6fffb",
                    color: "#006d75",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {filteredMeetings.inProgress.length}
                </span>
              </div>
            </div>
            <div className="col-md-3 text-center">
              <div
                className="kanban-header d-flex align-items-center justify-content-center gap-2 py-2"
                style={{
                  borderBottom: "2px solid #0026b1",
                  fontWeight: "600",
                  color: "#0026b1",
                  whiteSpace: "nowrap",
                }}
              >
                {t("badge.completed")}
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: "#fff7e6",
                    color: "#d46b08",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {filteredMeetings.completed.length}
                </span>
              </div>
            </div>
          </div>

          <div
            className="accordion-item"
            style={{
              cursor: "pointer",
              border: "none",
              padding: "10px 15px",
              width: "100%",
              borderTop: "1px solid #e6e6e6",
            }}
          >
            <div className="accordion-content">
              <div className="row">
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {filteredMeetings.upcoming.map((item, index) =>
                      renderMeetingCard(item, index, "upcoming")
                    )}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {filteredMeetings.todo.map((item, index) =>
                      renderMeetingCard(item, index, "todo")
                    )}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {filteredMeetings.inProgress.map((item, index) =>
                      renderMeetingCard(item, index, "inProgress")
                    )}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {filteredMeetings.completed.map((item, index) =>
                      renderMeetingCard(item, index, "completed")
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* {open && (
                <>
                  <NewMeetingModal open={open} closeModal={handleCloseModal} 
                    destination={destination}
          openedFrom="destination"
                  />
                </>
              )} */}
      </div>
    </>
  );
};

export default KanbanView;
