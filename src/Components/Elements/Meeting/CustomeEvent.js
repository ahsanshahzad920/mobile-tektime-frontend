import React from "react";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import tektimeLogo from "../../../Media/logo2.png";
import googleLogo from "../../../Media/google.png";
import outlookLogo from "../../../Media/outlook.jpeg";

import "./EventTooltip.css";

const CustomEvent = ({ event }) => {
  const [t] = useTranslation("global");
  console.log('event',event)

  const durationMinutes = moment(event.end).diff(moment(event.start), 'minutes');
const isShortMeeting = durationMinutes <= 30;

  // ✅ Progress logic
  const totalSteps = event.steps?.length || 0;
  const completedSteps =
    event.steps?.filter((step) => step.step_status === "completed").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Ensure there's a minimum width for the progress bar when progress is 0
  const progressWidth = progress > 0 ? progress : 1; // Minimum width of 1%

  // Determine the color of the progress bar based on the event status
  const status = event.resource?.status;
  const timezone = event.resource?.timezone || "Europe/Paris";
  const now = moment().utcOffset(timezone);
  const meetingDateTime = moment(
    `${event.resource.date}T${event.resource.start_time}`
  ).utcOffset(timezone);
  const isFutureMeeting = meetingDateTime.isAfter(now);

  let progressColor = "#007bff"; // Default blue

  if (status === "active") {
    progressColor = isFutureMeeting ? "#5baaea" : "red"; // Blue for future, red for past
  } else if (status === "in_progress") {
    progressColor = "yellow";
  }else if (status === "to_finish") {
    progressColor = "#ff9800";
  }else if (status === "todo") {
    progressColor = "#6c757d";
  } else if (status === "closed") {
    progressColor = "#28a745"; // Green
  } else if (status === "abort") {
    progressColor = "purple"; // Purple
  }

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${event.id}`} {...props} className="custom-tooltip">
      <img
        src={
          event?.resource?.created_from === "Google Calendar"
            ? googleLogo :
          event?.resource?.created_from === "Outlook Calendar"
          ? outlookLogo
            : tektimeLogo
        }
        width={30}
      />
      <br />
      <br />
      <span style={{ fontWeight: "bolder" }}>{event.title}</span>
      <br />
      <span
        style={{ fontWeight: "normal", fontSize: "12px", color: "#000000" }}
      >
        {event?.resource?.objective}
      </span>
      <br />
      {event?.resource?.description && (
        <>
          <h6>Description:</h6>
          <div
            dangerouslySetInnerHTML={{
              __html: event?.resource?.description,
            }}
          />
        </>
      )}
      <br />
      {`${moment(event.start).format(
        `DD/MM/YYYY [${t("at")}] HH[h]mm`
      )} - ${moment(event.end).format(`DD/MM/YYYY [${t("at")}] HH[h]mm`)}`}

      <br />
      {/* ✅ Progress Bar and Percentage side by side */}
      {totalSteps > 0 && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Progress Bar */}
          <div
            style={{
              flex: 1,
              height: "6px",
              background: "#eee",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressWidth}%`, // Apply the minimum width logic here
                backgroundColor: progressColor,
                borderRadius: "4px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Progress Percentage */}
          <div
            style={{
              marginLeft: "8px",
              fontSize: "12px",
              color: "#000000",
              width: "40px", // Adjust width to make sure it fits nicely next to the progress bar
              textAlign: "center", // Center the percentage text
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </Tooltip>
  );


 
  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 150, hide: 100 }}
      overlay={renderTooltip}
    >
      <div
        className="text-truncate"
        style={{ maxWidth: "100%", overflow: "hidden" }}
      >
    
      {isShortMeeting ?   <div style={{ display: "flex", alignItems: "center" }}>
              {!isShortMeeting && (
            <span style={{ fontSize: "xx-small", marginLeft: "4px" }}>
              {moment(event.start).format("HH:mm")}
            </span>
          )}
          <img
            src={
              event?.resource?.created_from === "Google Calendar"
                ? googleLogo :
              event?.resource?.created_from === "Outlook Calendar" ?
              outlookLogo 
                : tektimeLogo
            }
            style={{ objectFit: "contain", marginRight: "4px" }}
            width={event?.resource?.created_from === "Google Calendar" ? 15 : 15}
          />
          <span style={{ fontSize: "small", flex: 1 }}>{event.title}</span>

        
        </div>
       : 
       <>
       <span style={{ fontSize: "small" }} className="d-flex justify-content-between">
          {moment(event.start).format("HH:mm")}  
          {/* <img
        src={
          event?.resource?.created_from === "Google Calendar"
          ? googleLogo
          : 
          event?.resource?.created_from === "Outlook Calendar" ?
          outlookLogo 
          : tektimeLogo
        }
        style={{objectFit:'contain'}}
        width={event?.resource?.created_from === "Google Calendar"? 15 : 15}
        /> */}
        </span>
       
       
        <div style={{ fontSize: "small" }}>
           <img
        src={
          event?.resource?.created_from === "Google Calendar"
          ? googleLogo
          : 
          event?.resource?.created_from === "Outlook Calendar" ?
          outlookLogo 
          : tektimeLogo
        }
        style={{objectFit:'contain'}}
        width={event?.resource?.created_from === "Google Calendar"? 15 : 15}
        />
        {" "}
        {event.title}
        </div>
        
       </>

      }
     {!isShortMeeting && <>
        {/* ✅ Progress Bar and Percentage side by side */}
        {totalSteps > 0 && (
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "4px" }}
          >
            {/* Progress Bar */}
            <div
              style={{
                flex: 1,
                height: "6px",
                background: "#eee",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressWidth}%`, // Apply the minimum width logic here
                  backgroundColor: progressColor,
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Progress Percentage */}
            <div
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                color: "#000000",
                width: "40px", // Adjust width to make sure it fits nicely next to the progress bar
                textAlign: "center", // Center the percentage text
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </>}

      </div>
    </OverlayTrigger>
  );
};


 export const EventTooltipContent = ({ event }) => {
  const [t] = useTranslation("global");

  const durationMinutes = moment(event.end).diff(moment(event.start), "minutes");
  const isShortMeeting = durationMinutes <= 30;

  const totalSteps = event.steps?.length || 0;
  const completedSteps =
    event.steps?.filter((s) => s.step_status === "completed").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const progressWidth = progress > 0 ? progress : 1; // min 1%

  const status = event.resource?.status;
  const timezone = event.resource?.timezone || "Europe/Paris";
  const now = moment().utcOffset(timezone);
  const meetingDateTime = moment(
    `${event.resource.date}T${event.resource.start_time}`
  ).utcOffset(timezone);
  const isFuture = meetingDateTime.isAfter(now);

  // ────── SAME colour logic you already had ──────
  let progressColor = "#007bff";
  if (status === "active") progressColor = isFuture ? "#5baaea" : "red";
  else if (status === "in_progress") progressColor = "yellow";
  else if (status === "to_finish") progressColor = "#ff9800";
  else if (status === "todo") progressColor = "#6c757d";
  else if (status === "closed") progressColor = "#28a745";
  else if (status === "abort") progressColor = "purple";

  const logo =
    event.resource?.created_from === "Google Calendar"
      ? googleLogo
      : event.resource?.created_from === "Outlook Calendar"
      ? outlookLogo
      : tektimeLogo;

  return (
    /* ────── WRAPPER WITH LEFT BORDER ────── */
    <div
      style={{
        borderLeft: `4px solid ${progressColor}`,
        paddingLeft: "8px",          // keep content away from the border
        background: "#fff",
      }}
    >
      <div className="custom-tooltip p-2">
        <img src={logo} alt="source" width={30} className="mb-2" />
        <div className="fw-bold">{event.title}</div>
        <div style={{ fontSize: "12px", color: "#000" }}>
          {event.resource?.objective}
        </div>

        {event.resource?.description && (
          <>
            <h6 className="mt-2 mb-1">Description:</h6>
            <div
              dangerouslySetInnerHTML={{ __html: event.resource.description }}
              style={{ fontSize: "11px" }}
            />
          </>
        )}

        <div className="mt-1" style={{ fontSize: "11px" }}>
          {moment(event.start).format(`DD/MM/YYYY [${t("at")}] HH[h]mm`)} -{" "}
          {moment(event.end).format(`[${t("at")}] HH[h]mm`)}
        </div>

        {totalSteps > 0 && (
          <div className="d-flex align-items-center mt-2">
            <div
              style={{
                flex: 1,
                height: "6px",
                background: "#eee",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressWidth}%`,
                  backgroundColor: progressColor,
                  borderRadius: "4px",
                  transition: "width .3s ease",
                }}
              />
            </div>
            <div
              className="ms-2"
              style={{ fontSize: "12px", width: "36px", textAlign: "center" }}
            >
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CustomEvent;
