import React, { useEffect, useMemo, useState } from "react";
import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { momentLocalizer, Views, Calendar } from "react-big-calendar";
import moment from "moment";
import ReactCalendarToolbar from "./ReactCalendarToolbar";
import CustomEvent from "../../Meeting/CustomeEvent";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import { ProgressBar } from "react-bootstrap";

const EventWrapper = ({ children }) => {
  return <div style={{ marginBottom: "2px", width: "100%" }}>{children}</div>;
};

const CustomDateHeader = ({ label, date, localizer }) => {
  return <div>{moment(date).format("ddd D MMM")}</div>;
};

// Day view date header
const DayDateHeader = ({ label, date }) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "600",
      }}
    >
      {moment(date).format("dddd, MMMM D, YYYY")}
    </div>
  );
};

const CustomAgendaHeader = ({ label }) => {
  return null;
};

const ReactCalendar = ({
  meetings,
  from,
  handleChangeMeetings,
  defaultView,
  progress = 0,
  showProgress = false,
}) => {
  const { open, handleShow, setMeeting, handleCloseModal } = useFormContext();
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  console.log("defaultView", defaultView);

  const [myEventsList, setMyEventsList] = useState([]);
  const [overlappingSlots, setOverlappingSlots] = useState(new Set());
  const [currentStartDate, setCurrentStartDate] = useState(
    moment().startOf("week").toDate()
  );

  // Fixed default view handling
  const getInitialView = () => {
    switch (defaultView) {
      case "day":
        return Views.DAY;
      case "week":
        return Views.WEEK;
      case "month":
        return Views.MONTH;
      case "agenda":
        return Views.AGENDA;
      default:
        return Views.WEEK;
    }
  };

  // Fixed: Handle defaultView changes properly
  useEffect(() => {
    if (defaultView) {
      const newView = getInitialView();
      setCurrentView(newView);

      // Also reset the start date based on the view
      const today = new Date();
      if (newView === Views.DAY) {
        setCurrentStartDate(moment().startOf("day").toDate());
      }
    }
  }, [defaultView]);

  // Handle defaultView changes
  useEffect(() => {
    if (defaultView) {
      const newView = getInitialView();
      console.log("Setting view to:", newView);
      setCurrentView(newView);
    }
  }, [defaultView]);

  const [currentView, setCurrentView] = useState(getInitialView());
  const { language } = useDraftMeetings();
  const [earliestHour, setEarliestHour] = useState(9);
  const [latestHour, setLatestHour] = useState(17);

  useEffect(() => {
    moment.locale(language);
  }, [language]);

  const localizer = momentLocalizer(moment);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);

  useEffect(() => {
    if (meetings && Array.isArray(meetings) && meetings.length > 0) {
      const transformedMeetings = meetings
        .filter(
          (meeting) => meeting.status !== "abort" && meeting?.status !== "draft"
        )
        .map(transformMeetingToEvent)
        .filter((event) => event !== null);

      const sortedMeetings = transformedMeetings.sort(
        (a, b) => new Date(a.start) - new Date(b.start)
      );

      if (sortedMeetings.length > 0) {
        const earliestMeetingDate = moment(sortedMeetings[0].start)
          .startOf("week")
          .toDate();
        setCurrentStartDate(earliestMeetingDate);

        const startOfWeek = new Date(earliestMeetingDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        setMin(startOfWeek);
        setMax(endOfWeek);

        let earliestHr = 24;
        let latestHr = 0;

        const weekStart = new Date(earliestMeetingDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        sortedMeetings.forEach((meeting) => {
          const start = new Date(meeting.start);
          const end = new Date(meeting.end);

          if (
            start >= weekStart &&
            end <= weekEnd &&
            start.toDateString() === end.toDateString()
          ) {
            const startHour = start.getHours();
            const endHour = end.getHours();
            earliestHr = Math.min(earliestHr, startHour);
            latestHr = Math.max(latestHr, endHour);
          }
        });

        if (earliestHr !== 24) setEarliestHour(earliestHr);
        if (latestHr !== 0) setLatestHour(latestHr);

        setOverlappingSlots(getOverlappingSlots(sortedMeetings, 15));
        setMyEventsList(sortedMeetings);
      }
    } else {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      setCurrentStartDate(startOfWeek);
      setMin(startOfWeek);
      setMax(endOfWeek);
      setMyEventsList([]);
      setOverlappingSlots(new Set());
    }
  }, [meetings, currentView, defaultView]);

  const minTime = useMemo(() => {
    const date = new Date();
    const hour =
      Number.isInteger(earliestHour) && earliestHour >= 0 && earliestHour <= 23
        ? earliestHour
        : 9;
    date.setHours(hour, 0, 0);
    return date;
  }, [earliestHour]);

  const maxTime = useMemo(() => {
    const date = new Date();
    const hour =
      Number.isInteger(latestHour) && latestHour >= 0 && latestHour <= 23
        ? latestHour
        : 17;
    date.setHours(hour, 59, 59);
    return date;
  }, [latestHour]);

  const getFormattedAbortDateTime = (abortDateTime, timezone) => {
    const userTimezone = moment.tz.guess();
    return moment
      .tz(abortDateTime, "YYYY-MM-DD HH:mm:ss", timezone || "UTC")
      .tz(userTimezone)
      .toDate();
  };

  const transformMeetingToEvent = (meeting) => {
    if (
      ![
        "active",
        "closed",
        "abort",
        "in_progress",
        "to_finish",
        "todo",
      ].includes(meeting.status)
    )
      return null;

    let start, end;

    const userTimezone = moment.tz.guess();
    const meetingTimezone = meeting?.timezone || "UTC";
    if (meeting.status === "abort") {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.starts_at}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone
        )
        .tz(userTimezone)
        .toDate();
      end = getFormattedAbortDateTime(
        meeting?.abort_end_time,
        meeting?.timezone
      );
    } else if (
      meeting.status === "closed" ||
      meeting.status === "in_progress" ||
      meeting?.status === "to_finish" ||
      meeting?.status === "todo"
    ) {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.starts_at}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone
        )
        .tz(userTimezone)
        .toDate();

      const estimateDate =
        meeting.estimate_time?.split("T")[0] ||
        meeting.estimate_time?.split(" ")[0];
      const estimateTime =
        meeting.estimate_time?.split("T")[1] ||
        meeting.estimate_time?.split(" ")[1] ||
        "00:00:00";
      end = moment
        .tz(
          `${estimateDate} ${estimateTime}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone
        )
        .tz(userTimezone)
        .toDate();
    } else {
      start = moment
        .tz(
          `${meeting?.date} ${meeting?.start_time}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone
        )
        .tz(userTimezone)
        .toDate();
      const estimateDate =
        meeting.estimate_time?.split("T")[0] ||
        meeting.estimate_time?.split(" ")[0];
      const estimateTime =
        meeting.estimate_time?.split("T")[1] ||
        meeting.estimate_time?.split(" ")[1] ||
        "00:00:00";
      end = moment
        .tz(
          `${estimateDate} ${estimateTime}`,
          "YYYY-MM-DD HH:mm:ss",
          meetingTimezone
        )
        .tz(userTimezone)
        .toDate();
    }

    return {
      id: meeting.id,
      title: meeting.title,
      start: start,
      end: end,
      allDay: false,
      resource: meeting,
      steps: meeting?.meeting_steps,
    };
  };

  const eventPropGetter = (event) => {
    const status = event.resource?.status;
    const timezone = event.resource?.timezone || "Europe/Paris";
    const now = moment().utcOffset(timezone);
    const isPast = moment(event.end).isBefore(now) && status !== "in_progress";

    let borderColor = "#ccc";
    let borderWidth = "2px";
    let backgroundColor = "#fff";
    let zIndex = 1;

    const isSelected = selectedEvent && selectedEvent.id === event.id;

    if (isSelected) {
      backgroundColor = "#f0f7ff";
      borderColor = "#0066cc";
      borderWidth = "3px";
    } else if (status === "active") {
      const meetingDateTime = moment(
        `${event.resource.date}T${event.resource.start_time}`
      ).utcOffset(timezone);
      const isFutureMeeting = meetingDateTime.isAfter(now);

      borderColor = isFutureMeeting ? "rgb(91, 170, 234)" : "red";
      borderWidth = "5px";
    } else if (status === "in_progress") {
      borderColor = "yellow";
      borderWidth = "5px";
    } else if (status === "to_finish") {
      borderColor = "#ff9800";
      borderWidth = "5px";
    } else if (status === "todo") {
      borderColor = "#6c757d";
      borderWidth = "5px";
    } else if (status === "closed") {
      borderColor = "rgb(119, 214, 113)";
      borderWidth = "5px";
    } else if (status === "abort") {
      borderColor = "rgb(119, 19, 241)";
      borderWidth = "5px";
    }

    return {
      style: {
        borderLeft: `${borderWidth} solid ${borderColor}`,
        backgroundColor: backgroundColor,
        paddingLeft: "8px",
        borderRadius: "4px",
        color: "#000000",
        opacity: 1,
        boxShadow: isSelected ? "0 0 5px rgba(0, 102, 204, 0.5)" : "none",
        zIndex: zIndex,
        cursor: "pointer",  
      },
    };
  };

  const getOverlappingSlots = (events, step = 15) => {
    const overlaps = new Set();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        const start1 = moment(e1.start);
        const end1 = moment(e1.end);
        const start2 = moment(e2.start);
        const end2 = moment(e2.end);

        if (start1.isBefore(end2) && start2.isBefore(end1)) {
          const overlapStart = moment.max(start1, start2).startOf("minute");
          const overlapEnd = moment.min(end1, end2).startOf("minute");

          let current = overlapStart.clone();
          while (current < overlapEnd) {
            overlaps.add(current.format("HH:mm"));
            current.add(step, "minutes");
          }
        }
      }
    }

    return overlaps;
  };

  const CustomAgendaEvent = ({ event }) => {
    return (
      <span>
        <strong>{event.title}</strong>
        <div style={{ fontSize: "12px", color: "#555" }}>
          {event.resource?.status}
        </div>
      </span>
    );
  };

  const CustomGutter = ({ date }) => {
    const timeLabel = moment(date).format("HH:mm");
    const isVisible = overlappingSlots.has(timeLabel);
    return (
      <div
        style={{
          height: "100%",
          visibility: isVisible ? "visible" : "hidden",
          display: isVisible ? "block" : "none",
        }}
      >
        {timeLabel}
      </div>
    );
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Fixed today button handler
  const handleNavigateToToday = () => {
    const today = new Date();
    if (currentView === Views.WEEK) {
      setCurrentStartDate(moment(today).startOf("week").toDate());
    } else if (currentView === Views.MONTH) {
      setCurrentStartDate(moment(today).startOf("month").toDate());
    } else if (currentView === Views.DAY) {
      setCurrentStartDate(moment(today).startOf("day").toDate());
    } else if (currentView === Views.AGENDA) {
      setCurrentStartDate(moment(today).toDate());
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (
      event?.resource?.status === "active" ||
      event?.resource?.status === "in_progress" ||
      event?.resource?.status === "to_finish" ||
      event?.resource?.status === "todo"
    ) {
      if (from === "report") {
        handleChangeMeetings(event?.resource);
      } else {
        navigate(`/invite/${event?.resource?.id}`, {
          state: { from: "meeting" },
        });
      }
    } else {
      if (from === "report") {
        handleChangeMeetings(event?.resource);
      } else {
        navigate(`/present/invite/${event?.resource?.id}`, {
          state: { from: "meeting" },
        });
      }
    }
  };

  const statuses = [
    { name: t("calendar.status1"), color: "rgb(119 214 113)" },
    { name: t("calendar.status2"), color: "yellow" },
    { name: t("calendar.status3"), color: "red" },
    { name: t("calendar.status4"), color: "rgb(119 19 241)" },
    { name: t("calendar.status5"), color: "rgb(91 170 234)" },
    { name: t("calendar.status6"), color: "#ff9800" },
  ];

  return (
    <>
      {showProgress ? (
        <div
          style={{
            background: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
          </div>
        </div>
      ) : (
        <>
          <Calendar
            localizer={localizer}
            events={myEventsList}
            onSelectEvent={handleSelectEvent}
            startAccessor="start"
            endAccessor="end"
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
            defaultView={
              defaultView === "day"
                ? Views.DAY
                : defaultView === "week"
                ? Views.WEEK
                : defaultView === "month"
                ? Views.MONTH
                : Views.AGENDA
            }
            view={currentView}
            onView={handleViewChange}
            showAllDayEvents={false}
            allDayAccessor={null}
            toolbar={true}
            tooltipAccessor={() => null}
            popup={true}
            allDaySlot={true}
            components={{
              day: {
                header: DayDateHeader,
                event: CustomEvent,
                timeGutterHeader: CustomGutter, // Added time gutter for day view
              },
              week: {
                header: CustomDateHeader,
                event: CustomEvent,
                timeGutterHeader: CustomGutter,
              },
              month: {
                header: CustomDateHeader,
                event: CustomEvent,
              },
              agenda: {
                header: CustomAgendaHeader,
                event: CustomAgendaEvent,
              },
              toolbar: (props) => (
                <ReactCalendarToolbar
                  {...props}
                  view={currentView}
                  onView={handleViewChange}
                  onNavigateToToday={handleNavigateToToday}
                />
              ),
              eventWrapper: EventWrapper,
            }}
            eventPropGetter={eventPropGetter}
            formats={{
              timeGutterFormat: "HH:mm",
              dayRangeHeaderFormat: "MMMM D, YYYY",
              eventTimeRangeFormat: () => "",
              agendaHeaderFormat: ({ start, end }, culture, localizer) => {
                const sameDay = moment(start).isSame(end, "day");
                if (sameDay) {
                  return `${localizer.format(start, "dddd, MMMM D, YYYY")}`;
                }
                return `${localizer.format(
                  start,
                  "MMMM D, YYYY"
                )} - ${localizer.format(end, "MMMM D, YYYY")}`;
              },
              agendaTimeFormat: "HH:mm",
            }}
            date={currentStartDate}
            onNavigate={(date) => setCurrentStartDate(date)}
            dayLayoutAlgorithm="no-overlap"
            min={minTime}
            max={maxTime}
          />

          <div className="status-legend">
            <div className="status-list">
              {statuses.map((status, index) => (
                <div key={index} className="status-item">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: status.color }}
                  ></span>
                  {status.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {open && <NewMeetingModal open={open} closeModal={handleCloseModal} />}
    </>
  );
};

export default ReactCalendar;
//
