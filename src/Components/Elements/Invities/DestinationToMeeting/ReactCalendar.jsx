import React, { useEffect, useMemo, useState } from "react";
import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { momentLocalizer, Views, Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import ReactCalendarToolbar from "./ReactCalendarToolbar";
import CustomEvent from "../../Meeting/CustomeEvent";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import { ProgressBar } from "react-bootstrap";
import tektimeLogo from "../../../../Media/logo2.png";
import googleLogo from "../../../../Media/google.png";
import outlookLogo from "../../../../Media/outlook.jpeg";

const EventWrapper = ({ children }) => {
  return <div style={{ marginBottom: "2px", width: "100%" }}>{children}</div>;
};

const MonthEvent = ({ event }) => {
  const [t] = useTranslation("global");

  // Progress logic
  const totalSteps = event.steps?.length || 0;
  const completedSteps =
    event.steps?.filter((step) => step.step_status === "completed").length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const progressWidth = progress > 0 ? progress : 1;

  // Determine status color
  const status = event.resource?.status;
  const timezone = event.resource?.timezone || "Europe/Paris";
  const now = moment().utcOffset(timezone);
  const meetingDateTime = moment(
    `${event.resource.date}T${event.resource.start_time}`
  ).utcOffset(timezone);
  const isFutureMeeting = meetingDateTime.isAfter(now);

  let progressColor = "#007bff";
  if (status === "active") {
    progressColor = isFutureMeeting ? "#5baaea" : "red";
  } else if (status === "in_progress") {
    progressColor = "yellow";
  } else if (status === "to_finish") {
    progressColor = "#ff9800";
  } else if (status === "todo") {
    progressColor = "#6c757d";
  } else if (status === "closed") {
    progressColor = "#28a745";
  } else if (status === "abort") {
    progressColor = "purple";
  }

  const logo =
    event.resource?.created_from === "Google Calendar"
      ? googleLogo
      : event.resource?.created_from === "Outlook Calendar"
      ? outlookLogo
      : tektimeLogo;

  return (
    <div className="text-truncate" style={{ maxWidth: "100%", overflow: "hidden" }}>
      <span style={{ fontSize: "small" }} className="d-flex justify-content-between">
        {moment(event.start).format("HH:mm")}
      </span>
      <div style={{ fontSize: "small", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} className="text-truncate">
        <img
          src={logo}
          style={{ objectFit: "contain", marginRight: "4px" }}
          width={15}
          alt="logo"
        />
        {event.title}
      </div>
      {totalSteps > 0 && (
        <div style={{ display: "flex", alignItems: "center", marginTop: "4px" }}>
          <div style={{ flex: 1, height: "6px", background: "#eee", borderRadius: "4px" }}>
            <div
              style={{
                height: "100%",
                width: `${progressWidth}%`,
                backgroundColor: progressColor,
                borderRadius: "4px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ marginLeft: "8px", fontSize: "12px", color: "#000000", width: "40px", textAlign: "center" }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDateHeader = ({ label, date, localizer }) => {
  return <div>{moment(date).format("ddd DD MMM")}</div>;
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
const MonthDateHeader = ({ label, date, localizer }) => {
  return (
    <div style={{ textAlign: "center", padding: "5px", fontWeight: "600", color: "#4a5568" }}>
      {label}
    </div>
  );
};

const CustomAgendaHeader = ({ label }) => {
  return null;
};

const clampDate = (date, minD, maxD) => {
  if (!minD || !maxD) return date;
  const startLimit = moment(minD).startOf("day");
  const endLimit = moment(maxD).endOf("day");
  const current = moment(date);

  if (current.isBefore(startLimit)) {
    return startLimit.toDate();
  }
  if (current.isAfter(endLimit)) {
    return endLimit.toDate();
  }
  return date;
};

const getInitialView = (defaultView) => {
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

const ReactCalendar = ({
  meetings,
  from,
  handleChangeMeetings,
  defaultView,
  progress = 0,
  showProgress = false,
  minDate,
  maxDate,
}) => {
  const { open, handleShow, setMeeting, handleCloseModal } = useFormContext();
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  console.log("defaultView", defaultView);

  const [currentView, setCurrentView] = useState(getInitialView(defaultView));
  const { language } = useDraftMeetings();
  const [earliestHour, setEarliestHour] = useState(9);
  const [latestHour, setLatestHour] = useState(17);

  const [myEventsList, setMyEventsList] = useState([]);
  const [overlappingSlots, setOverlappingSlots] = useState(new Set());
  const [currentStartDate, setCurrentStartDate] = useState(new Date());

  const MonthCellWrapper = ({ children, value }) => {
    if (currentView !== Views.MONTH) {
      return children;
    }

    const dayEvents = myEventsList.filter((event) => {
      const start = moment(event.start);
      const end = event.end ? moment(event.end) : start;
      return moment(value).isBetween(start, end, "day", "[]");
    });

    const isToday = moment(value).isSame(moment(), "day");
    const isOffRange = !moment(value).isSame(currentStartDate, "month");

    return React.cloneElement(children, {
      style: {
        ...children.props.style,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
      },
      children: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            padding: "4px",
            boxSizing: "border-box",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Day Number Header */}
          <div
            style={{
              alignSelf: "flex-end",
              padding: "2px 6px",
              fontSize: "12px",
              fontWeight: "600",
              color: isOffRange ? "#cbd5e1" : isToday ? "#0066cc" : "#4a5568",
              backgroundColor: isToday ? "#e0f2fe" : "transparent",
              borderRadius: isToday ? "50%" : "0",
              width: isToday ? "20px" : "auto",
              height: isToday ? "20px" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
            }}
          >
            {moment(value).format("D")}
          </div>

          {/* Scrollable Events List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              width: "100%",
              minWidth: 0,
            }}
            className="custom-month-cell-scrollable"
          >
            {dayEvents.map((event, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectEvent(event);
                }}
                style={{
                  cursor: "pointer",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "6px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                }}
              >
                <MonthEvent event={event} />
              </div>
            ))}
          </div>
        </div>
      ),
    });
  };

  const agendaLength = useMemo(() => {
    if (minDate && maxDate) {
      const start = moment(minDate).startOf("day");
      const end = moment(maxDate).endOf("day");
      const diffDays = end.diff(start, "days") + 1;
      return diffDays > 0 ? diffDays : 30;
    }
    return 365;
  }, [minDate, maxDate]);

  // Fixed: Handle defaultView changes properly and reset date to today
  useEffect(() => {
    if (defaultView) {
      const newView = getInitialView(defaultView);
      setCurrentView(newView);

      // Reset the start date to today's date based on the view
      const today = new Date();
      let targetDate = today;

      if (minDate && maxDate) {
        const startLimit = moment(minDate).startOf("day");
        const endLimit = moment(maxDate).endOf("day");
        if (newView === Views.AGENDA || newView === Views.MONTH) {
          targetDate = startLimit.toDate();
        } else {
          if (moment(today).isBefore(startLimit)) {
            targetDate = startLimit.toDate();
          } else if (moment(today).isAfter(endLimit)) {
            targetDate = endLimit.toDate();
          }
        }
      }

      if (newView === Views.DAY) {
        setCurrentStartDate(moment(targetDate).startOf("day").toDate());
      } else if (newView === Views.WEEK) {
        setCurrentStartDate(moment(targetDate).startOf("week").toDate());
      } else if (newView === Views.MONTH) {
        setCurrentStartDate(moment(targetDate).startOf("month").toDate());
      } else {
        setCurrentStartDate(targetDate);
      }
    }
  }, [defaultView, minDate, maxDate]);

  // Set initial currentStartDate when minDate/maxDate become available or if currentStartDate goes out of bounds
  useEffect(() => {
    if (minDate && maxDate) {
      const startLimit = moment(minDate).startOf("day");
      const endLimit = moment(maxDate).endOf("day");

      // For Agenda and Month views, always start from the start of the mission (minDate)
      if (currentView === Views.AGENDA || currentView === Views.MONTH) {
        setCurrentStartDate(startLimit.toDate());
        return;
      }

      const current = moment(currentStartDate);

      if (current.isBefore(startLimit) || current.isAfter(endLimit)) {
        let targetDate = new Date();
        if (moment(targetDate).isBefore(startLimit)) {
          targetDate = startLimit.toDate();
        } else if (moment(targetDate).isAfter(endLimit)) {
          targetDate = endLimit.toDate();
        }

        if (currentView === Views.WEEK) {
          setCurrentStartDate(moment(targetDate).startOf("week").toDate());
        } else if (currentView === Views.MONTH) {
          setCurrentStartDate(moment(targetDate).startOf("month").toDate());
        } else if (currentView === Views.DAY) {
          setCurrentStartDate(moment(targetDate).startOf("day").toDate());
        } else {
          setCurrentStartDate(targetDate);
        }
      }
    }
  }, [minDate, maxDate, currentView]);

  // Compute disabled states for toolbar buttons based on date constraints
  const isPrevDisabled = useMemo(() => {
    if (!minDate) return false;
    const startLimit = moment(minDate).startOf("day");
    const current = moment(currentStartDate);

    if (currentView === Views.MONTH) {
      const prevMonthEnd = current.clone().subtract(1, "month").endOf("month");
      return prevMonthEnd.isBefore(startLimit);
    } else if (currentView === Views.WEEK) {
      const prevWeekEnd = current.clone().subtract(1, "week").endOf("week");
      return prevWeekEnd.isBefore(startLimit);
    } else {
      const prevDay = current.clone().subtract(1, "day").startOf("day");
      return prevDay.isBefore(startLimit);
    }
  }, [currentStartDate, currentView, minDate]);

  const isNextDisabled = useMemo(() => {
    if (!maxDate) return false;
    const endLimit = moment(maxDate).endOf("day");
    const current = moment(currentStartDate);

    if (currentView === Views.MONTH) {
      const nextMonthStart = current.clone().add(1, "month").startOf("month");
      return nextMonthStart.isAfter(endLimit);
    } else if (currentView === Views.WEEK) {
      const nextWeekStart = current.clone().add(1, "week").startOf("week");
      return nextWeekStart.isAfter(endLimit);
    } else {
      const nextDay = current.clone().add(1, "day").endOf("day");
      return nextDay.isAfter(endLimit);
    }
  }, [currentStartDate, currentView, maxDate]);

  const isTodayDisabled = useMemo(() => {
    if (!minDate || !maxDate) return false;
    const today = moment();
    const startLimit = moment(minDate).startOf("day");
    const endLimit = moment(maxDate).endOf("day");

    let clampedToday = today;
    if (today.isBefore(startLimit)) {
      clampedToday = startLimit;
    } else if (today.isAfter(endLimit)) {
      clampedToday = endLimit;
    }

    const current = moment(currentStartDate);
    if (currentView === Views.MONTH) {
      return current.isSame(clampedToday, "month");
    } else if (currentView === Views.WEEK) {
      return current.isSame(clampedToday, "week");
    } else {
      return current.isSame(clampedToday, "day");
    }
  }, [currentStartDate, currentView, minDate, maxDate]);

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
      let targetDate = currentDate;

      if (minDate && maxDate) {
        const startLimit = moment(minDate).startOf("day");
        const endLimit = moment(maxDate).endOf("day");
        if (currentView === Views.AGENDA) {
          targetDate = startLimit.toDate();
        } else {
          if (moment(currentDate).isBefore(startLimit)) {
            targetDate = startLimit.toDate();
          } else if (moment(currentDate).isAfter(endLimit)) {
            targetDate = endLimit.toDate();
          }
        }
      }

      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(targetDate);
      endOfWeek.setDate(targetDate.getDate() - targetDate.getDay() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      setCurrentStartDate(targetDate);
      setMin(startOfWeek);
      setMax(endOfWeek);
      setMyEventsList([]);
      setOverlappingSlots(new Set());
    }

    if (currentView === Views.AGENDA && minDate) {
      setCurrentStartDate(moment(minDate).startOf("day").toDate());
    }
  }, [meetings, currentView, defaultView, minDate, maxDate]);

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
    if (view === Views.AGENDA || view === Views.MONTH) {
      if (minDate) {
        setCurrentStartDate(moment(minDate).startOf("day").toDate());
      }
    } else {
      const today = new Date();
      let targetDate = today;
      if (minDate && maxDate) {
        const startLimit = moment(minDate).startOf("day");
        const endLimit = moment(maxDate).endOf("day");
        if (moment(today).isBefore(startLimit)) {
          targetDate = startLimit.toDate();
        } else if (moment(today).isAfter(endLimit)) {
          targetDate = endLimit.toDate();
        }
      }
      if (view === Views.WEEK) {
        setCurrentStartDate(moment(targetDate).startOf("week").toDate());
      } else if (view === Views.MONTH) {
        setCurrentStartDate(moment(targetDate).startOf("month").toDate());
      } else if (view === Views.DAY) {
        setCurrentStartDate(moment(targetDate).startOf("day").toDate());
      } else {
        setCurrentStartDate(targetDate);
      }
    }
  };

  // Custom navigation restrictor
  const handleNavigate = (newDate, view) => {
    if (!minDate || !maxDate) {
      setCurrentStartDate(newDate);
      return;
    }

    const startLimit = moment(minDate).startOf("day");
    const endLimit = moment(maxDate).endOf("day");
    const target = moment(newDate);
    const currentViewToCheck = view || currentView;

    let adjustedDate = newDate;

    if (currentViewToCheck === Views.MONTH) {
      const startOfProposedMonth = target.clone().startOf("month");
      const endOfProposedMonth = target.clone().endOf("month");

      if (endOfProposedMonth.isBefore(startLimit)) {
        adjustedDate = startLimit.clone().startOf("month").toDate();
      } else if (startOfProposedMonth.isAfter(endLimit)) {
        adjustedDate = endLimit.clone().startOf("month").toDate();
      }
    } else if (currentViewToCheck === Views.WEEK) {
      const startOfProposedWeek = target.clone().startOf("week");
      const endOfProposedWeek = target.clone().endOf("week");

      if (endOfProposedWeek.isBefore(startLimit)) {
        adjustedDate = startLimit.clone().startOf("week").toDate();
      } else if (startOfProposedWeek.isAfter(endLimit)) {
        adjustedDate = endLimit.clone().startOf("week").toDate();
      }
    } else if (currentViewToCheck === Views.DAY || currentViewToCheck === Views.AGENDA) {
      if (target.isBefore(startLimit)) {
        adjustedDate = startLimit.toDate();
      } else if (target.isAfter(endLimit)) {
        adjustedDate = endLimit.toDate();
      }
    }

    setCurrentStartDate(adjustedDate);
  };

  // Fixed today button handler
  const handleNavigateToToday = () => {
    const today = new Date();
    let proposedDate = today;

    if (minDate && maxDate) {
      const startLimit = moment(minDate).startOf("day");
      const endLimit = moment(maxDate).endOf("day");
      if (moment(today).isBefore(startLimit)) {
        proposedDate = startLimit.toDate();
      } else if (moment(today).isAfter(endLimit)) {
        proposedDate = endLimit.toDate();
      }
    }

    if (currentView === Views.WEEK) {
      proposedDate = moment(proposedDate).startOf("week").toDate();
    } else if (currentView === Views.MONTH) {
      proposedDate = moment(proposedDate).startOf("month").toDate();
    } else if (currentView === Views.DAY) {
      proposedDate = moment(proposedDate).startOf("day").toDate();
    }

    handleNavigate(proposedDate, currentView);
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
      <style>{`
        .reactCalendarCustomHeight {
          height: 900px !important;
        }

        .reactCalendarAutoHeight {
          height: auto !important;
        }

        /* Hide default foreground elements in Month view (so we only see background cells with our custom cards) */
        .reactCalendarCustomHeight .rbc-month-view .rbc-row-content {
          display: none !important;
        }

        /* Sleek custom scrollbars for individual cell scroll container */
        .reactCalendarCustomHeight .custom-month-cell-scrollable {
          overflow-y: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: #cbd5e1 rgba(0, 0, 0, 0.02) !important;
        }

        .reactCalendarCustomHeight .custom-month-cell-scrollable::-webkit-scrollbar {
          width: 4px !important;
          height: 4px !important;
          background-color: transparent !important;
        }

        .reactCalendarCustomHeight .custom-month-cell-scrollable::-webkit-scrollbar-track {
          background-color: rgba(0, 0, 0, 0.02) !important;
          border-radius: 2px !important;
        }

        .reactCalendarCustomHeight .custom-month-cell-scrollable::-webkit-scrollbar-thumb {
          background-color: #cbd5e1 !important;
          border-radius: 2px !important;
        }

        .reactCalendarCustomHeight .custom-month-cell-scrollable::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8 !important;
        }
      `}</style>
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
          <div className={currentView === Views.MONTH ? "reactCalendarCustomHeight" : "reactCalendarAutoHeight"}>
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
            popup={false}
            showAllEvents={true}
            doShowMoreDrillDown={false}
            onShowMore={(events, date) => {
              // Navigate explicitly to the exact clicked date in Day view
              const clamped = clampDate(date, minDate, maxDate);
              setCurrentStartDate(clamped);
              setCurrentView(Views.DAY);
            }}
            allDaySlot={true}
            components={{
              dateCellWrapper: currentView === Views.MONTH ? MonthCellWrapper : undefined,
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
                event: MonthEvent,
                dateHeader: MonthDateHeader,
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
                  prevDisabled={isPrevDisabled}
                  nextDisabled={isNextDisabled}
                  todayDisabled={isTodayDisabled}
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
            onNavigate={handleNavigate}
            dayLayoutAlgorithm="no-overlap"
            min={minTime}
            max={maxTime}
            length={agendaLength}
          />
        </div>

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
