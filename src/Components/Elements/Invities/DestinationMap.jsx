import { Avatar } from "antd";
import React from "react";
import { Card, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";
import { HiUserCircle } from "react-icons/hi2";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  convertTo24HourFormat,
  destinationTypeIcons,
  formatMissionDate,
  formatStepDate,
  typeIcons,
} from "../../Utils/MeetingFunctions";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const DestinationMap = ({ data, type, showProgressBar, Progress }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const handleClick = (item, index) => {
    navigate(`/invitiesToMeeting/${item?.id}`);
  };
  return (
    <>
      <div className="container-fluid invite">
        {showProgressBar && (
          <div
            className="progress-overlay"
            // style={{ background: "transparent" }}
          >
            <div style={{ width: "50%" }}>
              <ProgressBar now={Progress} animated />
            </div>
          </div>
        )}
        <div className="mb-4 mt-1 action-tabs">
          <div className="row">
            <div className="col-md-3 text-center">
              <button
                className={`tab`}
                style={{
                  borderBottom: "2px solid #0026b1",
                  // color: "#0026b1"
                }}
              >
                {t("mission-badges.new")}{" "}
                <span
                  className="status-badge-upcoming"
                  style={{ padding: "1px 5px" }}
                >
                  {data?.new_missions?.length}
                </span>
              </button>
            </div>
            <div className="col-md-3 text-center">
              <button
                className={`tab`}
                style={{
                  borderBottom: "2px solid #0026b1",
                  // color: "#0026b1"
                }}
              >
                {t("mission-badges.upcoming")}{" "}
                <span
                  // className="status-badge-green"
                  className="status-badge-upcoming"
                  style={{ padding: "1px 5px" }}
                >
                  {data?.upcoming_missions?.length}
                </span>
              </button>
            </div>
            <div className="col-md-3 text-center">
              <button
                className={`tab`}
                style={{
                  borderBottom: "2px solid #0026b1",
                  // color: "#0026b1"
                }}
              >
                {t("mission-badges.inProgress")}{" "}
                <span
                  className="status-badge-inprogress"
                  style={{ padding: "1px 5px" }}
                >
                  {data?.current_missions?.length}
                </span>
              </button>
            </div>

            <div className="col-md-3 text-center">
              <button
                className={`tab`}
                style={{
                  borderBottom: "2px solid #0026b1",
                  // color: "#0026b1"
                }}
              >
                {t("mission-badges.completed")}{" "}
                <span
                  className="status-badge-completed"
                  style={{ padding: "1px 5px" }}
                >
                  {data?.closed_missions?.length}
                </span>
              </button>
            </div>
          </div>

          <div
            className="accordion-item"
            // onClick={() => handleTitleClick(title, index)}
            style={{
              cursor: "pointer",
              border: "none",
              padding: "10px 15px",
              //   backgroundColor:
              //     activeIndex === index ? "transparent" : "transparent",
              //   color: activeIndex === index ? "rgb(54 155 224)" : "inherit",
              //   fontWeight: activeIndex === index ? "bold" : "normal",
              // borderRadius: "5px",
              width: "100%",
              borderTop: "1px solid #e6e6e6",
            }}
          >
            {/* Collapsible content */}
            {/* {activeIndex === index && ( */}
            <div className="accordion-content">
              <div className="row">
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {data?.new_missions?.map((item, index) => {
                      const userTimeZone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const formatDateAndTimeInUserTimezone = (dateString) => {
                        const dateObj = new Date(dateString);

                        // Format date in dd/mm/yyyy for user's timezone
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-GB",
                          {
                            timeZone: userTimeZone,
                          }
                        );

                        // Format time as HHhMM in user's timezone
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
                      const { formattedDate, formattedTime } =
                        formatDateAndTimeInUserTimezone(
                          item?.destination_end_date_time
                        );

                      // Safeguard tooltip rendering
                      const renderTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Title"}{" "}
                          {/* Fallback for title */}
                        </Tooltip>
                      );

                      const renderTitleTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Meeting Title"}{" "}
                          {/* Fallback for meeting title */}
                        </Tooltip>
                      );

                      const renderObjectiveTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.clients?.name || "No Client"}{" "}
                          {/* Fallback for objective */}
                        </Tooltip>
                      );
                      const data = item?.meeting;

                      return (
                        <Card
                          className="mt-4 step-card-meeting1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item, index);
                          }}
                          style={{
                            height: "290px",
                          }}
                          key={index}
                        >
                          <Card.Body className="step-card-body">
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
                                        item?.clients?.id || item?.client_id
                                      }`
                                    );
                                  }}
                                >
                                  {/* Client Avatar on the right */}
                                  {item?.clients?.client_logo && (
                                    <img
                                      src={
                                        item.clients?.client_logo?.startsWith(
                                          "http"
                                        )
                                          ? item?.clients?.client_logo
                                          : Assets_URL +
                                            "/" +
                                            item?.clients?.client_logo
                                      }
                                      alt={item.clients?.name}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginLeft: "8px",
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/24";
                                      }}
                                    />
                                  )}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={renderObjectiveTooltip}
                                  >
                                    <Card.Title className="m-0 p-0 fs-6 ms-1 truncated-text">
                                      {item?.clients?.name}
                                    </Card.Title>
                                  </OverlayTrigger>
                                </h6>
                                <hr
                                  style={{
                                    marginTop: "9px",
                                    marginBottom: "9px",
                                  }}
                                />

                                <div
                                  className="step-header d-flex align-items-center justify-content-between"
                                  style={{
                                    margin: "9px 0px",
                                  }}
                                >
                                  <div className="step-number-container d-flex align-items-center">
                                    {/* <span
                                        className="step-number"
                                        style={{ color: "#92929d" }}
                                      >
                                        {item?.order_no <= 9 ? "0" : " "}
                                        {item?.order_no}/
                                        {item?.meeting?.steps?.length <= 9
                                          ? "0"
                                          : " "}
                                        {item?.meeting?.steps?.length}
                                      </span> */}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={renderTooltip}
                                    >
                                      <Card.Title
                                        className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text destination-ellipses-text"
                                        // style={{ width: "60%" }}
                                      >
                                        {item?.destination_name}
                                      </Card.Title>
                                    </OverlayTrigger>
                                  </div>

                                  <span className="future h-auto">
                                    {t("mission-badges.new")}
                                  </span>
                                </div>
                                <div className="step-content">
                                  <Card.Subtitle className="step-card-subtext">
                                    {item.user && (
                                      <>
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
                                            item?.user?.image?.startsWith(
                                              "http"
                                            )
                                              ? item?.user?.image
                                              : Assets_URL +
                                                "/" +
                                                item?.user?.image
                                          }
                                          alt="img"
                                        />
                                      </>
                                    )}

                                    {item.user ? (
                                      <span>{item?.user?.full_name}</span>
                                    ) : null}
                                  </Card.Subtitle>

                                  {item?.destination_end_date_time && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start">
                                      <div className="creator">
                                        {t("destination_mission_end_date")}:
                                      </div>

                                      <div className="mb-2">
                                        <div className="d-flex align-items-center flex-wrap">
                                          {item?.destination_end_date_time && (
                                            <span>
                                              {" "}
                                              {formattedDate} {t("at")}{" "}
                                              {formattedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Text>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {data?.upcoming_missions?.map((item, index) => {
                      const userTimeZone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const formatDateAndTimeInUserTimezone = (dateString) => {
                        const dateObj = new Date(dateString);

                        // Format date in dd/mm/yyyy for user's timezone
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-GB",
                          {
                            timeZone: userTimeZone,
                          }
                        );

                        // Format time as HHhMM in user's timezone
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
                      const { formattedDate, formattedTime } =
                        formatDateAndTimeInUserTimezone(
                          item?.destination_end_date_time
                        );

                      // Safeguard tooltip rendering
                      const renderTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Title"}{" "}
                          {/* Fallback for title */}
                        </Tooltip>
                      );

                      const renderTitleTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Meeting Title"}{" "}
                          {/* Fallback for meeting title */}
                        </Tooltip>
                      );

                      const renderObjectiveTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.clients?.name || "No Client"}{" "}
                          {/* Fallback for objective */}
                        </Tooltip>
                      );
                      const data = item?.meeting;

                     const allSteps = item?.meetings?.flatMap((m) => m.meeting_steps || []) || [];
  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter((s) => s.step_status === "completed").length;

                      return (
                        <Card
                          className="mt-4 step-card-meeting1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item, index);
                          }}
                          style={{
                            height: "290px",
                          }}
                          key={index}
                        >
                          <Card.Body className="step-card-body">
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
                                        item?.clients?.id || item?.client_id
                                      }`
                                    );
                                  }}
                                >
                                  {/* Client Avatar on the right */}
                                  {item?.clients?.client_logo && (
                                    <img
                                      src={
                                        item.clients?.client_logo?.startsWith(
                                          "http"
                                        )
                                          ? item?.clients?.client_logo
                                          : Assets_URL +
                                            "/" +
                                            item?.clients?.client_logo
                                      }
                                      alt={item.clients?.name}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginLeft: "8px",
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/24";
                                      }}
                                    />
                                  )}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={renderObjectiveTooltip}
                                  >
                                    <Card.Title className="m-0 p-0 fs-6 ms-1 truncated-text">
                                      {item?.clients?.name}
                                    </Card.Title>
                                  </OverlayTrigger>
                                </h6>
                                <hr
                                  style={{
                                    marginTop: "9px",
                                    marginBottom: "9px",
                                  }}
                                />

                                <div
                                  className="step-header d-flex align-items-center justify-content-between"
                                  style={{
                                    margin: "9px 0px",
                                  }}
                                >
                                  <div className="step-number-container d-flex align-items-center">
                                    {/* <span
                                        className="step-number"
                                        style={{ color: "#92929d" }}
                                      >
                                        {item?.order_no <= 9 ? "0" : " "}
                                        {item?.order_no}/
                                        {item?.meeting?.steps?.length <= 9
                                          ? "0"
                                          : " "}
                                        {item?.meeting?.steps?.length}
                                      </span> */}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={renderTooltip}
                                    >
                                      <Card.Title
                                        className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text destination-ellipses-text"
                                        // style={{ width: "60%" }}
                                      >
                                        {item?.destination_name}
                                      </Card.Title>
                                    </OverlayTrigger>
                                  </div>

                                  <span className="future h-auto">
                                    {t("mission-badges.upcoming")}
                                  </span>
                                </div>
                                <div className="step-content">
                                  <Card.Subtitle className="step-card-subtext">
                                    {item.user && (
                                      <>
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
                                            item?.user?.image?.startsWith(
                                              "http"
                                            )
                                              ? item?.user?.image
                                              : Assets_URL +
                                                "/" +
                                                item?.user?.image
                                          }
                                          alt="img"
                                        />
                                      </>
                                    )}

                                    {item.user ? (
                                      <span>{item?.user?.full_name}</span>
                                    ) : null}
                                  </Card.Subtitle>
                                  {(item?.meeting_start_date ||
                                    item?.meeting_end_date) && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                      <img
                                        height="16px"
                                        width="16px"
                                        src="/Assets/ion_time-outline.svg"
                                      />

                                      <span className="time">
                                        {formatMissionDate(
                                          item?.meeting_start_date
                                        )}{" "}
                                        -{" "}
                                        {formatMissionDate(
                                          item?.meeting_end_date
                                        )}
                                      </span>
                                    </Card.Text>
                                  )}
                                  {item?.destination_end_date_time && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start">
                                      <div className="creator">
                                        {t("destination_mission_end_date")}:
                                      </div>

                                      <div className="mb-2">
                                        <div className="d-flex align-items-center flex-wrap">
                                          {item?.destination_end_date_time && (
                                            <span>
                                              {" "}
                                              {formattedDate} {t("at")}
                                              {formattedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Text>
                                  )}

                                  <div className="mb-2">
                                    <div className="creator">
                                      {t("progression")}
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap">
                                      <span
                                        style={{
                                          fontSize: "small",
                                          fontWeight: 400,
                                          color: "#92929d",
                                          textAlign: "left",
                                        }}
                                      >
                                       {totalSteps > 0 && (
                                          <span>
                                            {Math.floor(
                                              totalSteps > 0
                                                ? Math.floor(
                                                    (completedSteps /
                                                      totalSteps) *
                                                      100
                                                  )
                                                : 0
                                            )}
                                            % {t("destinationPercentage")}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {data?.current_missions?.map((item, index) => {
                      const userTimeZone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const formatDateAndTimeInUserTimezone = (dateString) => {
                        const dateObj = new Date(dateString);

                        // Format date in dd/mm/yyyy for user's timezone
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-GB",
                          {
                            timeZone: userTimeZone,
                          }
                        );

                        // Format time as HHhMM in user's timezone
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
                      const { formattedDate, formattedTime } =
                        formatDateAndTimeInUserTimezone(
                          item?.destination_end_date_time
                        );

                      // Safeguard tooltip rendering
                      const renderTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Title"}{" "}
                          {/* Fallback for title */}
                        </Tooltip>
                      );

                      const renderTitleTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Meeting Title"}{" "}
                          {/* Fallback for meeting title */}
                        </Tooltip>
                      );

                      const renderObjectiveTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.clients?.name || "No Client"}{" "}
                          {/* Fallback for objective */}
                        </Tooltip>
                      );
                      const data = item?.meeting;

                      const rawDeadline = new Date(
                        Date.parse(item?.destination_end_date_time)
                      );

                      // If your meeting_end_date is in dd/mm/yyyy format (with slashes), it may parse incorrectly in some browsers.
                      // Convert it safely like this:
                      // Parse meeting_end_date (dd/mm/yyyy)
                      const [day, month, year] =
                        item?.meeting_end_date?.split("/") || [];
                      const rawMissionEnd = new Date(`${year}-${month}-${day}`);
                      // Normalize both to remove time
                      const deadline = new Date(
                        rawDeadline.getFullYear(),
                        rawDeadline.getMonth(),
                        rawDeadline.getDate()
                      );
                      const missionEnd = new Date(
                        rawMissionEnd.getFullYear(),
                        rawMissionEnd.getMonth(),
                        rawMissionEnd.getDate()
                      );
                      const isDeadlinePassed = missionEnd > deadline;
                      let diffDays = 0;
                      if (isDeadlinePassed) {
                        const diffTime =
                          missionEnd.getTime() - deadline.getTime();
                        diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                      }

                     const allSteps = item?.meetings?.flatMap((m) => m.meeting_steps || []) || [];
  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter((s) => s.step_status === "completed").length;

                  
   // 🟢 delay check
let delay = false;

// condition 1: meeting_end_date vs destination_end_date_time
if (item?.destination_end_date_time) {
  const meetingDate = new Date(item?.meeting_end_date);
  meetingDate.setHours(0, 0, 0, 0); // ignore time

  const destinationDate = new Date(item?.destination_end_date_time);
  destinationDate.setHours(0, 0, 0, 0); // ignore time

  if (meetingDate.getTime() > destinationDate.getTime()) {
    delay = true;
  }
}

// condition 2: step-level delay
if (!delay) {
  const hasStepDelay = allSteps.some(
    (s) =>
      (s.step_status === "in_progress" || s.step_status === "to_finish") &&
      s?.delay
  );

  if (hasStepDelay) {
    delay = true;
  }
}
                      return (
                        <Card
                          className="mt-4 step-card-meeting1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item, index);
                          }}
                          style={{
                            height: "355px",
                          }}
                          key={index}
                        >
                          <Card.Body className="step-card-body">
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
                                        item?.clients?.id || item?.client_id
                                      }`
                                    );
                                  }}
                                >
                                  {/* Client Avatar on the right */}
                                  {item?.clients?.client_logo && (
                                    <img
                                      src={
                                        item.clients?.client_logo?.startsWith(
                                          "http"
                                        )
                                          ? item?.clients?.client_logo
                                          : Assets_URL +
                                            "/" +
                                            item?.clients?.client_logo
                                      }
                                      alt={item.clients?.name}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginLeft: "8px",
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/24";
                                      }}
                                    />
                                  )}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={renderObjectiveTooltip}
                                  >
                                    <Card.Title className="m-0 p-0 fs-6 ms-1 truncated-text">
                                      {item?.clients?.name}
                                    </Card.Title>
                                  </OverlayTrigger>
                                </h6>
                                <hr
                                  style={{
                                    marginTop: "9px",
                                    marginBottom: "9px",
                                  }}
                                />

                                <div
                                  className="step-header d-flex align-items-center justify-content-between"
                                  style={{
                                    margin: "9px 0px",
                                  }}
                                >
                                  <div className="step-number-container d-flex align-items-center">
                                    {/* <span
                                        className="step-number"
                                        style={{ color: "#92929d" }}
                                      >
                                        {item?.order_no <= 9 ? "0" : " "}
                                        {item?.order_no}/
                                        {item?.meeting?.steps?.length <= 9
                                          ? "0"
                                          : " "}
                                        {item?.meeting?.steps?.length}
                                      </span> */}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={renderTooltip}
                                    >
                                      <Card.Title
                                        className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text destination-ellipses-text"
                                        // style={{ width: "60%" }}
                                      >
                                        {item?.destination_name}
                                      </Card.Title>
                                    </OverlayTrigger>
                                  </div>

                                  <span
                                    className={`${
                                      item?.status === "in_progress" &&
                                      (delay === true ||
                                        item?.budget_exceed === true)
                                        ? "status-badge-delay-inprogress"
                                        : item?.status === "in_progress" &&
                                          isDeadlinePassed
                                        ? "status-badge-delay-inprogress"
                                        : "status-badge-inprogress"
                                    } h-auto`}
                                  >
                                    {t("mission-badges.inProgress")}
                                    {/* {item?.status === "in_progress"
                                      ? t("badge.inprogress")
                                      : t("badge.late")} */}
                                  </span>
                                </div>
                                <div className="step-content">
                                  <Card.Subtitle className="step-card-subtext">
                                    {item.user && (
                                      <>
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
                                            item?.user?.image?.startsWith(
                                              "http"
                                            )
                                              ? item?.user?.image
                                              : Assets_URL +
                                                "/" +
                                                item?.user?.image
                                          }
                                          alt="img"
                                        />
                                      </>
                                    )}

                                    {item.user ? (
                                      <span>{item?.user?.full_name}</span>
                                    ) : null}
                                  </Card.Subtitle>
                                  {(item?.meeting_start_date ||
                                    item?.meeting_end_date) && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                      <img
                                        height="16px"
                                        width="16px"
                                        src="/Assets/ion_time-outline.svg"
                                      />

                                      <span className="time">
                                        {formatMissionDate(
                                          item?.meeting_start_date
                                        )}{" "}
                                        -{" "}
                                        {formatMissionDate(
                                          item?.meeting_end_date
                                        )}
                                      </span>
                                    </Card.Text>
                                  )}
                                  {item?.destination_end_date_time && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start">
                                      <div className="creator">
                                        {t("destination_mission_end_date")}:
                                      </div>

                                      <div className="mb-2">
                                        <div className="d-flex align-items-center flex-wrap">
                                          {item?.destination_end_date_time && (
                                            <span>
                                              {" "}
                                              {formattedDate} {t("at")}{" "}
                                              {formattedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Text>
                                  )}

                                  {isDeadlinePassed && (
                                    <div className="mb-2">
                                      <div className="d-flex align-items-center flex-wrap">
                                        <p
                                          className="text-danger fw-bold"
                                          style={{ fontSize: "13px" }}
                                        >
                                          {t("budget.Exceeded Deadline Error")}{" "}
                                          ({diffDays} {t("time_unit.da")}
                                          {diffDays > 1 ? "s" : ""}{" "}
                                          {t("budget.passed")})
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="mb-2">
                                    <div className="creator">
                                      {t("progression")}
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap">
                                      <span
                                        style={{
                                          fontSize: "small",
                                          fontWeight: 400,
                                          color: "#92929d",
                                          textAlign: "left",
                                        }}
                                      >
                                        {totalSteps > 0 && (
                                          <span>
                                            {Math.floor(
                                              totalSteps > 0
                                                ? Math.floor(
                                                    (completedSteps /
                                                      totalSteps) *
                                                      100
                                                  )
                                                : 0
                                            )}
                                            % {t("destinationPercentage")}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <div
                  className="col-lg-3 col-md-4"
                  style={{ borderRight: "1px solid #e6e6e6" }}
                >
                  <div className="mt-3">
                    {data?.closed_missions?.map((item, index) => {
                      const userTimeZone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const formatDateAndTimeInUserTimezone = (dateString) => {
                        const dateObj = new Date(dateString);

                        // Format date in dd/mm/yyyy for user's timezone
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-GB",
                          {
                            timeZone: userTimeZone,
                          }
                        );

                        // Format time as HHhMM in user's timezone
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
                      const { formattedDate, formattedTime } =
                        formatDateAndTimeInUserTimezone(
                          item?.destination_end_date_time
                        );

                      // Safeguard tooltip rendering
                      const renderTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Title"}{" "}
                          {/* Fallback for title */}
                        </Tooltip>
                      );

                      const renderTitleTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.destination_name || "No Meeting Title"}{" "}
                          {/* Fallback for meeting title */}
                        </Tooltip>
                      );

                      const renderObjectiveTooltip = (props) => (
                        <Tooltip id="step-card-tooltip" {...props}>
                          {item?.clients?.name || "No Client"}{" "}
                          {/* Fallback for objective */}
                        </Tooltip>
                      );
                      const data = item?.meeting;

                  
                     const allSteps = item?.meetings?.flatMap((m) => m.meeting_steps || []) || [];
  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter((s) => s.step_status === "completed").length;

                      return (
                        <Card
                          className="mt-4 step-card-meeting1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick(item, index);
                          }}
                          style={{
                            height: "290px",
                          }}
                          key={index}
                        >
                          <Card.Body className="step-card-body">
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
                                        item?.clients?.id || item?.client_id
                                      }`
                                    );
                                  }}
                                >
                                  {/* Client Avatar on the right */}
                                  {item?.clients?.client_logo && (
                                    <img
                                      src={
                                        item.clients?.client_logo?.startsWith(
                                          "http"
                                        )
                                          ? item?.clients?.client_logo
                                          : Assets_URL +
                                            "/" +
                                            item?.clients?.client_logo
                                      }
                                      alt={item.clients?.name}
                                      style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginLeft: "8px",
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/24";
                                      }}
                                    />
                                  )}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={renderObjectiveTooltip}
                                  >
                                    <Card.Title className="m-0 p-0 fs-6 ms-1 truncated-text">
                                      {item?.clients?.name}
                                    </Card.Title>
                                  </OverlayTrigger>
                                </h6>
                                <hr
                                  style={{
                                    marginTop: "9px",
                                    marginBottom: "9px",
                                  }}
                                />

                                <div
                                  className="step-header d-flex align-items-center justify-content-between"
                                  style={{
                                    margin: "9px 0px",
                                  }}
                                >
                                  <div className="step-number-container d-flex align-items-center">
                                    {/* <span
                                        className="step-number"
                                        style={{ color: "#92929d" }}
                                      >
                                        {item?.order_no <= 9 ? "0" : " "}
                                        {item?.order_no}/
                                        {item?.meeting?.steps?.length <= 9
                                          ? "0"
                                          : " "}
                                        {item?.meeting?.steps?.length}
                                      </span> */}
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={renderTooltip}
                                    >
                                      <Card.Title
                                        className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text destination-ellipses-text"
                                        // style={{ width: "60%" }}
                                      >
                                        {item?.destination_name}
                                      </Card.Title>
                                    </OverlayTrigger>
                                  </div>

                                  <span className="status-badge-completed h-auto">
                                    {t("mission-badges.completed")}
                                  </span>
                                </div>
                                <div className="step-content">
                                  <Card.Subtitle className="step-card-subtext">
                                    {item.user && (
                                      <>
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
                                            item?.user?.image?.startsWith(
                                              "http"
                                            )
                                              ? item?.user?.image
                                              : Assets_URL +
                                                "/" +
                                                item?.user?.image
                                          }
                                          alt="img"
                                        />
                                      </>
                                    )}

                                    {item.user ? (
                                      <span>{item?.user?.full_name}</span>
                                    ) : null}
                                  </Card.Subtitle>
                                  {(item?.meeting_start_date ||
                                    item?.meeting_end_date) && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                      <img
                                        height="16px"
                                        width="16px"
                                        src="/Assets/ion_time-outline.svg"
                                      />

                                      <span className="time">
                                        {formatMissionDate(
                                          item?.meeting_start_date
                                        )}{" "}
                                        -{" "}
                                        {formatMissionDate(
                                          item?.meeting_end_date
                                        )}
                                      </span>
                                    </Card.Text>
                                  )}
                                  {item?.destination_end_date_time && (
                                    <Card.Text className="step-card-content action-step-card-content d-flex flex-column align-items-start">
                                      <div className="creator">
                                        {t("destination_mission_end_date")}:
                                      </div>

                                      <div className="mb-2">
                                        <div className="d-flex align-items-center flex-wrap">
                                          {item?.destination_end_date_time && (
                                            <span>
                                              {" "}
                                              {formattedDate} {t("at")}
                                              {formattedTime}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Text>
                                  )}

                                  <div className="mb-2">
                                    <div className="creator">
                                      {t("progression")}
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap">
                                      <span
                                        style={{
                                          fontSize: "small",
                                          fontWeight: 400,
                                          color: "#92929d",
                                          textAlign: "left",
                                        }}
                                      >
                                        {totalSteps > 0 && (
                                          <span>
                                            {Math.floor(
                                              totalSteps > 0
                                                ? Math.floor(
                                                    (completedSteps /
                                                      totalSteps) *
                                                      100
                                                  )
                                                : 0
                                            )}
                                            % {t("destinationPercentage")}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* )} */}
          </div>
        </div>
      </div>
    </>
  );
};

export default DestinationMap;
