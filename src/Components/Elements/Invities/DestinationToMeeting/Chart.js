// // //BAR

// ---------------------REact Calendar code with 365 days
// import React, { useEffect, useMemo, useState } from "react";
// import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
// import { momentLocalizer, Views, Calendar } from "react-big-calendar";
// import moment from "moment";
// import ReactCalendarToolbar from "./ReactCalendarToolbar";
// import CustomEvent from "../../Meeting/CustomeEvent";

// const EventWrapper = ({ children }) => {
//   return <div style={{ marginBottom: "2px", width: "100%" }}>{children}</div>;
// };

// const CustomDateHeader = ({ label, date, localizer }) => {
//   return <div>{moment(date).format("ddd D MMM")}</div>;
// };

// const ReactCalendar = ({ meetings }) => {
//   console.log("meetings", meetings);
//   const [t] = useTranslation("global");
//   const navigate = useNavigate();

//   const [myEventsList, setMyEventsList] = useState([]);
//   console.log("myEventsList", myEventsList);

//   const [overlappingSlots, setOverlappingSlots] = useState(new Set());
//   const [currentStartDate, setCurrentStartDate] = useState(
//     moment().startOf("week").toDate()
//   );
//   const [currentView, setCurrentView] = useState(Views.WEEK); // Track current view
//   const { language } = useDraftMeetings();
//   const [earliestHour, setEarliestHour] = useState(9);
//   const [latestHour, setLatestHour] = useState(17);
//   useEffect(() => {
//     moment.locale(language);
//   }, [language]);
//   const localizer = momentLocalizer(moment);

//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [min, setMin] = useState(null);
//   const [max, setMax] = useState(null);

//   useEffect(() => {
//     const currentDate = new Date();
//     const startOfWeek = new Date(currentDate);
//     startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
//     startOfWeek.setHours(0, 0, 0, 0);

//     const endOfWeek = new Date(currentDate);
//     endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6);
//     endOfWeek.setHours(23, 59, 59, 999);

//     setMin(startOfWeek);
//     setMax(endOfWeek);
//   }, []);

//   const minTime = useMemo(() => {
//     const date = new Date();
//     const hour =
//       Number.isInteger(earliestHour) && earliestHour >= 0 && earliestHour <= 23
//         ? earliestHour
//         : 9;
//     date.setHours(hour, 0, 0);
//     return date;
//   }, [earliestHour, currentStartDate]);

//   const maxTime = useMemo(() => {
//     const date = new Date();
//     const hour =
//       Number.isInteger(latestHour) && latestHour >= 0 && latestHour <= 23
//         ? latestHour
//         : 17;
//     date.setHours(hour, 59, 59);
//     return date;
//   }, [latestHour, currentStartDate]);

//   const getFormattedAbortDateTime = (abortDateTime, timezone) => {
//     const userTimezone = moment.tz.guess();
//     return moment
//       .tz(abortDateTime, "YYYY-MM-DD HH:mm:ss", timezone || "UTC")
//       .tz(userTimezone)
//       .toDate();
//   };
//   const transformMeetingToEvent = (meeting) => {
//     if (
//       ![
//         "active",
//         "closed",
//         "abort",
//         "in_progress",
//         "to_finish",
//         "todo",
//       ].includes(meeting.status)
//     )
//       return null;

//     let start, end;

//     const userTimezone = moment.tz.guess();
//     const meetingTimezone = meeting?.timezone || "UTC";
//     if (meeting.status === "abort") {
//       start = moment
//         .tz(
//           `${meeting?.date} ${meeting?.starts_at}`,
//           "YYYY-MM-DD HH:mm:ss",
//           meetingTimezone
//         )
//         .tz(userTimezone)
//         .toDate();
//       end = getFormattedAbortDateTime(
//         meeting?.abort_end_time,
//         meeting?.timezone
//       );
//     } else if (
//       meeting.status === "closed" ||
//       meeting.status === "in_progress" ||
//       meeting?.status === "to_finish" ||
//       meeting?.status === "todo"
//     ) {
//       start = moment
//         .tz(
//           `${meeting?.date} ${meeting?.starts_at}`,
//           "YYYY-MM-DD HH:mm:ss",
//           meetingTimezone
//         )
//         .tz(userTimezone)
//         .toDate();

//       const estimateDate =
//         meeting.estimate_time?.split("T")[0] ||
//         meeting.estimate_time?.split(" ")[0];
//       const estimateTime =
//         meeting.estimate_time?.split("T")[1] ||
//         meeting.estimate_time?.split(" ")[1] ||
//         "00:00:00";
//       end = moment
//         .tz(
//           `${estimateDate} ${estimateTime}`,
//           "YYYY-MM-DD HH:mm:ss",
//           meetingTimezone
//         )
//         .tz(userTimezone)
//         .toDate();
//     } else {
//       start = moment
//         .tz(
//           `${meeting?.date} ${meeting?.start_time}`,
//           "YYYY-MM-DD HH:mm:ss",
//           meetingTimezone
//         )
//         .tz(userTimezone)
//         .toDate();
//       const estimateDate =
//         meeting.estimate_time?.split("T")[0] ||
//         meeting.estimate_time?.split(" ")[0];
//       const estimateTime =
//         meeting.estimate_time?.split("T")[1] ||
//         meeting.estimate_time?.split(" ")[1] ||
//         "00:00:00";
//       end = moment
//         .tz(
//           `${estimateDate} ${estimateTime}`,
//           "YYYY-MM-DD HH:mm:ss",
//           meetingTimezone
//         )
//         .tz(userTimezone)
//         .toDate();
//     }

//     return {
//       id: meeting.id,
//       title: meeting.title,
//       start: start,
//       end: end,
//       allDay: false,
//       resource: meeting,
//       steps: meeting?.steps,
//     };
//   };

//   const eventPropGetter = (event) => {
//     const status = event.resource?.status;
//     const timezone = event.resource?.timezone;
//     const now = moment().utcOffset(timezone);
//     const isPast = moment(event.end).isBefore(now) && status !== "in_progress";

//     let borderColor = "#ccc";
//     let borderWidth = "2px";
//     let backgroundColor = "#fff";
//     let zIndex = 1;

//     const isSelected = selectedEvent && selectedEvent.id === event.id;

//     if (isSelected) {
//       backgroundColor = "#f0f7ff";
//       borderColor = "#0066cc";
//       borderWidth = "3px";
//     } else if (status === "active") {
//       const meetingDateTime = moment(
//         `${event.resource.date}T${event.resource.start_time}`
//       ).utcOffset(timezone);
//       const isFutureMeeting = meetingDateTime.isAfter(now);

//       borderColor = isFutureMeeting ? "rgb(91, 170, 234)" : "red";
//       borderWidth = "5px";
//     } else if (status === "in_progress") {
//       borderColor = "yellow";
//       borderWidth = "5px";
//     } else if (status === "to_finish") {
//       borderColor = "#ff9800";
//       borderWidth = "5px";
//     } else if (status === "todo") {
//       borderColor = "#6c757d";
//       borderWidth = "5px";
//     } else if (status === "closed") {
//       borderColor = "rgb(119, 214, 113)";
//       borderWidth = "5px";
//     } else if (status === "abort") {
//       borderColor = "rgb(119, 19, 241)";
//       borderWidth = "5px";
//     }

//     return {
//       style: {
//         borderLeft: `${borderWidth} solid ${borderColor}`,
//         backgroundColor: backgroundColor,
//         paddingLeft: "8px",
//         borderRadius: "4px",
//         color: "#000000",
//         opacity: 1,
//         boxShadow: isSelected ? "0 0 5px rgba(0, 102, 204, 0.5)" : "none",
//         zIndex: zIndex,
//       },
//     };
//   };

//   const getOverlappingSlots = (events, step = 15) => {
//     const overlaps = new Set();

//     for (let i = 0; i < events.length; i++) {
//       for (let j = i + 1; j < events.length; j++) {
//         const e1 = events[i];
//         const e2 = events[j];

//         const start1 = moment(e1.start);
//         const end1 = moment(e1.end);
//         const start2 = moment(e2.start);
//         const end2 = moment(e2.end);

//         if (start1.isBefore(end2) && start2.isBefore(end1)) {
//           const overlapStart = moment.max(start1, start2).startOf("minute");
//           const overlapEnd = moment.min(end1, end2).startOf("minute");

//           let current = overlapStart.clone();
//           while (current < overlapEnd) {
//             overlaps.add(current.format("HH:mm"));
//             current.add(step, "minutes");
//           }
//         }
//       }
//     }

//     return overlaps;
//   };

//   const CustomAgendaEvent = ({ event }) => {
//   return (
//     <span>
//       <strong>{event.title}</strong>
//       <div style={{ fontSize: "12px", color: "#555" }}>
//         {event.resource?.status}
//       </div>
//     </span>
//   );
// };

//   const CustomGutter = ({ date }) => {
//     const timeLabel = moment(date).format("HH:mm");
//     const isVisible = overlappingSlots.has(timeLabel);
//     return (
//       <div
//         style={{
//           height: "100%",
//           visibility: isVisible ? "visible" : "hidden",
//           display: isVisible ? "block" : "none",
//         }}
//       >
//         {timeLabel}
//       </div>
//     );
//   };

//   useEffect(() => {
//     if (meetings && Array.isArray(meetings)) {
//       const transformedMeetings = meetings
//         ?.filter((meeting) => meeting.status !== "abort" && meeting?.status !== "draft") // Filter out abort meetings

//         .map(transformMeetingToEvent)
//         .filter((event) => event !== null);

//       const sortedMeetings = transformedMeetings.sort(
//         (a, b) => new Date(a.start) - new Date(b.start)
//       );

//       if (sortedMeetings.length > 0 && currentView === Views.WEEK) {
//         const earliestMeeting = sortedMeetings[0];
//         const latestMeeting = sortedMeetings[sortedMeetings.length - 1];

//         const minTime = new Date(earliestMeeting.start);
//         const maxTime = new Date(latestMeeting.end);
//         setMin(minTime);
//         setMax(maxTime);

//         let earliestHr = 24;
//         let latestHr = 0;

//         const weekStart = new Date(currentStartDate);
//         const weekEnd = new Date(weekStart);
//         weekEnd.setDate(weekStart.getDate() + 7);

//         sortedMeetings.forEach((meeting) => {
//           const start = new Date(meeting.start);
//           const end = new Date(meeting.end);

//           if (
//             start >= weekStart &&
//             end <= weekEnd &&
//             start.toDateString() === end.toDateString()
//           ) {
//             const startHour = start.getHours();
//             const endHour = end.getHours();
//             earliestHr = Math.min(earliestHr, startHour);
//             latestHr = Math.max(latestHr, endHour);
//           }
//         });

//         if (earliestHr !== 24) setEarliestHour(earliestHr);
//         if (latestHr !== 0) setLatestHour(latestHr);
//       }

//       setOverlappingSlots(getOverlappingSlots(sortedMeetings, 15));
//       setMyEventsList(sortedMeetings);
//     }
//   }, [meetings, currentView, currentStartDate]);

// const handleViewChange = (view) => {
//   setCurrentView(view);
//   if (view === Views.AGENDA) {
//     const firstDayOfYear = moment().startOf("year").toDate();
//     setCurrentStartDate(firstDayOfYear);
//   }
// };

//   const handleSelectEvent = (event) => {
//     setSelectedEvent(event);
//     if (
//       event?.resource?.status === "active" ||
//       event?.resource?.status === "in_progress" ||
//       event?.resource?.status === "to_finish" ||
//       event?.resource?.status === "todo"
//     ) {
//       navigate(`/invite/${event?.resource?.id}`, {
//         state: { from: "meeting" },
//       });
//     } else {
//       navigate(`/present/invite/${event?.resource?.id}`, {
//         state: { from: "meeting" },
//       });
//     }
//   };
//   const statuses = [
//     { name: t("calendar.status1"), color: "rgb(119 214 113)" },
//     { name: t("calendar.status2"), color: "yellow" },
//     { name: t("calendar.status3"), color: "red" },
//     { name: t("calendar.status4"), color: "rgb(119 19 241)" },
//     { name: t("calendar.status5"), color: "rgb(91 170 234)" },
//     { name: t("calendar.status6"), color: "#ff9800" },
//   ];
//   return (
//     <>
//       <Calendar
//         localizer={localizer}
//         events={myEventsList}
//         onSelectEvent={handleSelectEvent}
//         startAccessor="start"
//         endAccessor="end"
//               views={[Views.WEEK, Views.MONTH, Views.AGENDA]}

//         defaultView={Views.WEEK}
//         view={currentView} // Controlled view
//         onView={handleViewChange} // Handle view changes
//         showAllDayEvents={false}
//         allDayAccessor={null}
//         toolbar={true}
//         tooltipAccessor={() => null}
//         popup={true}
//         allDaySlot={true}

//         components={{
//           week: {
//             header: CustomDateHeader,
//             event: CustomEvent,
//             timeGutterHeader: CustomGutter,
//           },
//              agenda: {
//             event: CustomAgendaEvent,
//           },
//          toolbar: (props) => (
//   <ReactCalendarToolbar
//     {...props}
//     view={currentView}
//     onView={handleViewChange}
//   />
// ),

//           eventWrapper: EventWrapper,
//         }}
//         eventPropGetter={eventPropGetter}
//         formats={{
//           timeGutterFormat: "HH:mm",
//           dayRangeHeaderFormat: "MMMM D, YYYY",
//           eventTimeRangeFormat: () => "",
//              agendaHeaderFormat: ({ start, end }, culture, localizer) =>
//             `${localizer.format(start, "MMM D")} – ${localizer.format(end, "MMM D")}`,
//           agendaTimeFormat: "HH:mm",
//         }}
//         date={currentStartDate}
//         onNavigate={(date) => setCurrentStartDate(date)}
//         dayLayoutAlgorithm="no-overlap"
//         min={minTime}
//         max={maxTime}
//         length={365}
//       />

//       <div className="status-legend">
//         <div className="status-list">
//           {statuses.map((status, index) => (
//             <div key={index} className="status-item">
//               <span
//                 className="status-dot"
//                 style={{ backgroundColor: status.color }}
//               ></span>
//               {status.name}
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ReactCalendar;

// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const data = {
//   labels: ["Initial Budget", "Total Estimated Cost", "Coût consommé", "Coût restant"],
//   datasets: [
//     {
//       label: "Cost in EUR",
//       data: [150, 46.84, 12.5, 33.75],
//       backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"],
//       borderColor: "#ddd",
//       borderWidth: 1,
//     },
//   ],
// };

// const options = {
//   responsive: true,
//   plugins: {
//     legend: { position: "top" },
//     title: { display: true, text: "Financial Overview" },
//   },
// };

// export default function CostChart() {
//   return <Bar data={data} options={options} />;
// }

//Correct but in this code(only show the latest budget histroy annotation on same date)
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function BudgetProgressionChart({
  initialBudget = 0,
  totalBudget = 0,
  usedBudget = 0,
  remainingBudget = 0,
  startDate,
  endDate,
  budgetHistory = [],
  destination
}) {
  const [t] = useTranslation("global");
  const [labels, setLabels] = useState([]);

  const initial = Number(initialBudget) || 0;
  const total = Number(totalBudget) || 0;
  const used = Number(usedBudget) || 0;

  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = moment(startDate, "DD/MM/YYYY");
    const end = moment(endDate, "DD/MM/YYYY");

    if (!start.isValid() || !end.isValid()) return;

    const diffDays = end.diff(start, "days");
    const increment =
      diffDays > 180 ? 30 : diffDays > 60 ? 15 : diffDays > 30 ? 7 : 3;

    let newLabels = [];
    let currentDate = start.clone();

    while (currentDate.isSameOrBefore(end)) {
      newLabels.push(currentDate.format("DD/MM/YYYY"));
      currentDate.add(increment, "days");
      if (currentDate.isAfter(end)) break;
    }

    const lastLabel = newLabels[newLabels.length - 1];
    const endDateFormatted = end.format("DD/MM/YYYY");
    if (lastLabel !== endDateFormatted) {
      newLabels.push(endDateFormatted);
    }

    setLabels(newLabels);
  }, [startDate, endDate]);

const generateInitialBudgetHistoryData = () => {
  if (!budgetHistory || budgetHistory.length === 0) {
    return labels.map((_, i) => ({ x: i, y: initial }));
  }

  const sorted = [...budgetHistory].sort((a, b) =>
    moment(a.changed_at).diff(moment(b.changed_at))
  );

  let points = [];
  let currentValue = 0; // Start with 0 as per your history data
  let startDateMoment = moment(startDate, "DD/MM/YYYY");

  // Add initial point at start date with 0 value
  if (sorted[0].old_initial_budget === "0.00") {
    points.push({ x: 0, y: 0 });
  } else {
    points.push({ x: 0, y: initial });
  }

  sorted.forEach((entry) => {
    const changeDate = moment(entry.changed_at);
    const x = labels.findIndex((label) =>
      moment(label, "DD/MM/YYYY").isSameOrAfter(changeDate)
    );

    if (x === -1) return;

    // Add point before change with current value
    if (points.length === 0 || points[points.length - 1].x !== x) {
      points.push({ x, y: currentValue });
    }

    // Update to new value and add point
    currentValue = Number(entry.new_initial_budget);
    points.push({ x, y: currentValue });
  });

  // Extend to the end of the graph with the last known value
  if (points.length > 0 && points[points.length - 1].x < labels.length - 1) {
    points.push({ x: labels.length - 1, y: currentValue });
  }

  return points;
};

 const generateInitialBudgetChangeAnnotations = () => {
  if (!budgetHistory || budgetHistory.length === 0 || labels.length === 0) return {};

  const sorted = [...budgetHistory].sort((a, b) =>
    moment(a.changed_at).diff(moment(b.changed_at))
  );

  const annotations = {};

  sorted.forEach((entry, index) => {
    const changeDate = moment(entry.changed_at);
    const x = labels.findIndex((label) =>
      moment(label, "DD/MM/YYYY").isSameOrAfter(changeDate)
    );

    if (x !== -1) {
      const y = Number(entry.new_initial_budget);
      const side = x < labels.length * 0.25
        ? 'right'
        : x > labels.length * 0.75
        ? 'left'
        : 'top';

      annotations[`budgetChangeLabel${index}`] = {
        type: "label",
        xValue: x,
        yValue: y,
        content: [
          `${t("budget.Initial Budget")}: ${y.toLocaleString()} ${destination?.currency}`,
          moment(changeDate).format("DD MMM YYYY"),
        ],
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#FF0000",
        borderWidth: 1,
        color: "#FF0000",
        font: { size: 11 },
        padding: 6,
        textAlign: "center",
        position: "center",
        callout: {
          display: true,
          side, // dynamically adjusts label side
        },
        xAdjust: 0,
        yAdjust: y < 50 ? 30 : -10, // pushes label down if too close to top
      };
    }
  });

  return annotations;
};


  const generateProgressiveData = (finalValue) => {
    const numericValue = Number(finalValue) || 0;
    return labels.map((_, i) => {
      const progress = i / (labels.length - 1);
      return { x: i, y: Number((numericValue * progress).toFixed(2)) };
    });
  };

  const generateUsedDataUpToToday = (finalValue) => {
    const numericValue = Number(finalValue) || 0;
    const today = moment();
    let result = [];
    let todayX = null;

    for (let i = 0; i < labels.length - 1; i++) {
      const current = moment(labels[i], "DD/MM/YYYY");
      const next = moment(labels[i + 1], "DD/MM/YYYY");

      if (today.isBetween(current, next, null, "[]")) {
        const totalDays = next.diff(current, "days") || 1;
        const daysSinceCurrent = today.diff(current, "days");
        const progressWithin = totalDays ? daysSinceCurrent / totalDays : 0;
        todayX = i + progressWithin;
        break;
      }
    }

    if (todayX === null && labels.length > 0) {
      const lastIndex = labels.length - 1;
      const lastDate = moment(labels[lastIndex], "DD/MM/YYYY");
      if (today.isSameOrAfter(lastDate)) {
        todayX = lastIndex;
      }
    }

    if (todayX !== null) {
      const roundedEnd = Math.floor(todayX);
      for (let i = 0; i <= roundedEnd; i++) {
        const progress = i / todayX;
        result.push({
          x: i,
          y: Number((numericValue * progress).toFixed(2)),
        });
      }

      if (todayX > roundedEnd) {
        result.push({
          x: Number(todayX.toFixed(2)),
          y: numericValue,
        });
      }
    }

    return result;
  };

  const generateRemainingData = (initialValue, remainingValue) => {
    const initial = Number(initialValue) || 0;
    const remaining = Number(remainingValue) || 0;

    return labels.map((_, i) => {
      const progress = i / (labels.length - 1);
      const value = initial - (initial - remaining) * progress;
      return { x: i, y: Number(value.toFixed(2)) };
    });
  };

  const interpolateDate = (indexFloat) => {
    const lowerIndex = Math.floor(indexFloat);
    const upperIndex = Math.ceil(indexFloat);
    if (lowerIndex < 0 || upperIndex >= labels.length) return "";
    const lowerDate = moment(labels[lowerIndex], "DD/MM/YYYY");
    const upperDate = moment(labels[upperIndex], "DD/MM/YYYY");
    const fraction = indexFloat - lowerIndex;
    const interpolated = lowerDate
      .clone()
      .add(upperDate.diff(lowerDate) * fraction, "milliseconds");
    return interpolated.format("DD/MM/YYYY");
  };

  const calculateCrossoverPoint = (progressiveData, initialValue) => {
    for (let i = 1; i < progressiveData.length; i++) {
      const prevY = progressiveData[i - 1].y;
      const currY = progressiveData[i].y;
      if (prevY <= initialValue && currY > initialValue) {
        const fraction = (initialValue - prevY) / (currY - prevY);
        const exactX = progressiveData[i - 1].x + fraction;
        const label = interpolateDate(exactX);
        return { x: exactX, y: initialValue, label };
      }
    }
    return null;
  };

  const totalData = generateProgressiveData(total);
  const usedData = generateUsedDataUpToToday(used);
  const remainingData = generateRemainingData(initial, remainingBudget);
  const initialBudgetData = generateInitialBudgetHistoryData();

  const crossoverPoint = useMemo(
    () => calculateCrossoverPoint(totalData, initial),
    [totalData, initial]
  );

  const usedCrossoverPoint = useMemo(
    () => calculateCrossoverPoint(usedData, initial),
    [usedData, initial]
  );

  const todayX = labels.length > 0 ? getTodayX() : -1;

  function getTodayX() {
    const today = moment();
    for (let i = 0; i < labels.length - 1; i++) {
      const d1 = moment(labels[i], "DD/MM/YYYY");
      const d2 = moment(labels[i + 1], "DD/MM/YYYY");
      if (today.isBetween(d1, d2, null, "[]")) {
        const total = d2.diff(d1, "days") || 1;
        const progress = today.diff(d1, "days") / total;
        return i + progress;
      }
    }
    return labels.length - 1;
  }

  const annotations = {
      ...generateInitialBudgetChangeAnnotations(), // 👈 Add this line

    ...(crossoverPoint && {
      crossoverLine: {
        type: "line",
        xMin: crossoverPoint.x,
        xMax: crossoverPoint.x,
        yMin: 0,
        yMax: crossoverPoint.y,
        borderColor: "#007bff",
        borderWidth: 2,
        borderDash: [3, 3],
      },
      crossoverLabel: {
        type: "label",
        xValue: crossoverPoint.x,
        yValue: crossoverPoint.y * 1.05,
          z: 40,
        content: [`${t("budget.Crossover Point")}`, crossoverPoint.label],
        backgroundColor: "rgba(255,255,255,0.9)",
        color: "#007bff",
        font: { size: 12, weight: "bold" },
        padding: 6,
        textAlign: "center",
        callout: { display: true },
      },
    }),
    ...(usedCrossoverPoint && {
      usedCrossoverLine: {
        type: "line",
        xMin: usedCrossoverPoint.x,
        xMax: usedCrossoverPoint.x,
        yMin: 0,
        yMax: usedCrossoverPoint.y,
        borderColor: "#28a745",
        borderWidth: 2,
        borderDash: [3, 3],
      },
      usedCrossoverLabel: {
        type: "label",
        xValue: usedCrossoverPoint.x,
        yValue: usedCrossoverPoint.y * 1.05,
        content: [
          `${t("budget.Used Crossover Point")}`,
          usedCrossoverPoint.label,
        ],
        backgroundColor: "rgba(255,255,255,0.9)",
        color: "#28a745",
        font: { size: 12, weight: "bold" },
        padding: 6,
        textAlign: "center",
        callout: { display: true },
      },
    }),
    ...(todayX >= 0 && {
      todayLine: {
        type: "line",
        xMin: todayX,
        xMax: todayX,
        borderColor: "red",
        borderWidth: 2,
        label: {
          display: true,
          content: `Today (${moment().format("DD MMM YYYY")})`,
          position: "start",
          backgroundColor: "rgba(255,255,255,0.9)",
          color: "red",
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 6,
        },
      },
    }),
  };

  const chartData = {
    labels,
    datasets: [
   {
  label: `${t("budget.Initial Budget")} (${destination?.currency})`,
  data: initialBudgetData,
  borderColor: "#FF0000",
  borderDash: [5, 5],
  borderWidth: 2,
  pointRadius: 3,
  fill: false,
  tension: 0, // Stepped line
},
      {
        label: `${total.toLocaleString()} ${destination?.currency} - ${t("budget.Total Estimated Cost")}`,
        data: totalData,
        borderColor: "#007bff",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      },
      {
        label: `${used.toLocaleString()} ${destination?.currency} - ${t("budget.Cost Consume")}`,
        data: usedData,
        borderColor: "#28a745",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      },
      {
        label: `${
          Number(remainingBudget) < 0
            ? t("budget.Cost Depass")
            : `${Number(remainingBudget).toLocaleString()} ${destination?.currency} - ${t("budget.Cost Remaining")}`
        }`,
        data: remainingData,
        borderColor: "#ffc107",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      }
      
    ],
  };
const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "nearest",
    axis: 'x',
    intersect: false,
  },
  plugins: {
    legend: { position: "bottom" },
    annotation: { annotations, clip: false },
    tooltip: {
      enabled: false, // Disable the default tooltip
      external: function (context) {
        // Tooltip element
        let tooltipEl = document.getElementById('chartjs-custom-tooltip');

        // Create element if not exists
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-custom-tooltip';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.background = 'rgba(0, 0, 0, 0.75)';
          tooltipEl.style.color = 'white';
          tooltipEl.style.borderRadius = '4px';
          tooltipEl.style.padding = '8px 12px';
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.transform = 'translate(-50%, -100%)';
          tooltipEl.style.whiteSpace = 'nowrap';
          tooltipEl.style.zIndex = '9999'; // 🟢 Force it above all other content
          document.body.appendChild(tooltipEl);
        }

        // Hide if no tooltip
        const tooltipModel = context.tooltip;
        if (tooltipModel.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        const { dataPoints } = tooltipModel;

        if (dataPoints && dataPoints.length) {
          const dp = dataPoints[0];
          const value = dp.raw?.y ?? dp.formattedValue;
          const label = dp.dataset.label;

          tooltipEl.innerHTML = `<strong>${label}</strong><br>${value}`;
        }

        // Position tooltip
        const canvas = context.chart.canvas;
        const rect = canvas.getBoundingClientRect();
        const bodyFont = ChartJS.defaults.font;

        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = `${rect.left + window.pageXOffset + tooltipModel.caretX}px`;
        tooltipEl.style.top = `${rect.top + window.pageYOffset + tooltipModel.caretY}px`;
        tooltipEl.style.font = `${bodyFont.size}px ${bodyFont.family}`;
      },
    },
  },
  scales: {
    x: {
      type: "linear",
      min: 0,
      max: labels.length - 1,
      ticks: {
        callback: (val) => (Number.isInteger(val) ? labels[val] || "" : ""),
      },
    },
    // y: {
    //   beginAtZero: true,
    //   title: { display: true, text: t("budget.Amount") },
    // },
     y: {
      beginAtZero: true,
      suggestedMax: Math.max(
        total,
        ...budgetHistory.map((b) => Number(b.new_initial_budget) || 0),
        used,
        remainingBudget
      ) * 1.2, // leaves 20% headroom for labels
      title: { display: true, text: t("budget.Amount") },
    },
  },
};





  return (
   <div
  style={{
    height: "500px",
    width: "100%",
    position: "relative",
    zIndex: 9999, // 🟢 Highest level
    overflow: "visible",
  }}
>
  <Line data={chartData} options={options} />
</div>

  );
}

//Correct but in this code(show the budget histroy annotation on same date)
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import annotationPlugin from "chartjs-plugin-annotation";
// import { useEffect, useState, useMemo } from "react";
// import moment from "moment";
// import { useTranslation } from "react-i18next";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   annotationPlugin
// );

// export default function BudgetProgressionChart({
//   initialBudget = 0,
//   totalBudget = 0,
//   usedBudget = 0,
//   remainingBudget = 0,
//   startDate,
//   endDate,
//   budgetHistory = [],
// }) {
//   const [t] = useTranslation("global");
//   const [labels, setLabels] = useState([]);

//   const initial = Number(initialBudget) || 0;
//   const total = Number(totalBudget) || 0;
//   const used = Number(usedBudget) || 0;

//   useEffect(() => {
//     if (!startDate || !endDate) return;

//     const start = moment(startDate, "DD/MM/YYYY");
//     const end = moment(endDate, "DD/MM/YYYY");

//     if (!start.isValid() || !end.isValid()) return;

//     const diffDays = end.diff(start, "days");
//     const increment = diffDays > 180 ? 30 : diffDays > 60 ? 15 : diffDays > 30 ? 7 : 3;

//     let newLabels = [];
//     let currentDate = start.clone();

//     while (currentDate.isSameOrBefore(end)) {
//       newLabels.push(currentDate.format("DD/MM/YYYY"));
//       currentDate.add(increment, "days");
//     }

//     if (!newLabels.includes(end.format("DD/MM/YYYY"))) {
//       newLabels.push(end.format("DD/MM/YYYY"));
//     }

//     setLabels(newLabels);
//   }, [startDate, endDate]);

//   const generateFlatData = (value) =>
//     labels.map((_, i) => ({ x: i, y: Number(value) }));

//   const generateProgressiveData = (finalValue) => {
//     const numericValue = Number(finalValue) || 0;
//     return labels.map((_, i) => {
//       const progress = i / (labels.length - 1);
//       return { x: i, y: Number((numericValue * progress).toFixed(2)) };
//     });
//   };

//   const generateRemainingData = (totalValue, usedValue) => {
//     const total = Number(totalValue) || 0;
//     const used = Number(usedValue) || 0;
//     return labels.map((_, i) => {
//       const progress = i / (labels.length - 1);
//       const usedAtPoint = used * progress;
//       const remaining = total - usedAtPoint;
//       return { x: i, y: Number(remaining.toFixed(2)) };
//     });
//   };

//   const interpolateDate = (indexFloat) => {
//     const lowerIndex = Math.floor(indexFloat);
//     const upperIndex = Math.ceil(indexFloat);
//     if (lowerIndex < 0 || upperIndex >= labels.length) return "";
//     const lowerDate = moment(labels[lowerIndex], "DD/MM/YYYY");
//     const upperDate = moment(labels[upperIndex], "DD/MM/YYYY");
//     const fraction = indexFloat - lowerIndex;
//     const interpolated = lowerDate.clone().add(
//       upperDate.diff(lowerDate) * fraction,
//       "milliseconds"
//     );
//     return interpolated.format("DD/MM/YYYY");
//   };

//   const calculateCrossoverPoint = (progressiveData, initialValue) => {
//     for (let i = 1; i < progressiveData.length; i++) {
//       const prevY = progressiveData[i - 1].y;
//       const currY = progressiveData[i].y;
//       if (prevY <= initialValue && currY > initialValue) {
//         const fraction = (initialValue - prevY) / (currY - prevY);
//         const exactX = progressiveData[i - 1].x + fraction;
//         const label = interpolateDate(exactX);
//         return { x: exactX, y: initialValue, label };
//       }
//     }
//     return null;
//   };

//   const totalData = generateProgressiveData(total);
//   const usedData = generateProgressiveData(used);
//   const remainingData = generateRemainingData(total, used);

//   const crossoverPoint = useMemo(
//     () => calculateCrossoverPoint(totalData, initial),
//     [totalData, initial]
//   );

//   const budgetChangeAnnotations = useMemo(() => {
//     if (!labels.length || !budgetHistory.length) return [];
//     return budgetHistory.flatMap((change, index) => {
//       const changeMoment = moment(change.changed_at, "YYYY-MM-DD HH:mm:ss");
//       const changeDate = changeMoment.format("DD/MM/YYYY");
//       let x = -1;
//       for (let i = 0; i < labels.length - 1; i++) {
//         const d1 = moment(labels[i], "DD/MM/YYYY");
//         const d2 = moment(labels[i + 1], "DD/MM/YYYY");
//         if (changeMoment.isBetween(d1, d2, null, "[]")) {
//           const total = d2.diff(d1, "days");
//           const progress = changeMoment.diff(d1, "days") / total;
//           x = i + progress;
//           break;
//         }
//       }
//       if (x === -1) return [];
//       const yBase = parseFloat(change.new_initial_budget);
//       const offsetY = index * 5;
//       const offsetX = index * 0.05;
//       return [
//         {
//           type: "point",
//           xValue: x + offsetX,
//           yValue: yBase + offsetY,
//           backgroundColor: "#ff6347",
//           radius: 5,
//           borderColor: "#000",
//           borderWidth: 1,
//         },
//         {
//           type: "label",
//           xValue: x + offsetX,
//           yValue: yBase + offsetY + 10,
//           content: [`${t("budget.Budget Changed")}`, changeDate],
//           backgroundColor: "rgba(255,255,255,0.8)",
//           color: "#ff6347",
//           font: { size: 10, weight: "bold" },
//           padding: 4,
//           textAlign: "center",
//           yAdjust: -10,
//         },
//       ];
//     });
//   }, [budgetHistory, labels, t]);

//   const annotations = {
//     initialBudgetLabel: {
//       type: "label",
//       xValue: labels.length - 1,
//       yValue: initial,
//       content: [`Initial Budget: ${initial.toLocaleString()}`],
//       backgroundColor: "rgba(255,255,255,0.8)",
//       color: "#FF0000",
//       font: { size: 12, weight: "bold" },
//       padding: 6,
//       textAlign: "center",
//     },
//     ...(crossoverPoint
//       ? {
//           crossoverLine: {
//             type: "line",
//             xMin: crossoverPoint.x,
//             xMax: crossoverPoint.x,
//             yMin: 0,
//             yMax: crossoverPoint.y,
//             borderColor: "rgba(0,0,0,0.7)",
//             borderWidth: 2,
//             borderDash: [5, 5],
//           },
//           crossoverDot: {
//             type: "point",
//             xValue: crossoverPoint.x,
//             yValue: crossoverPoint.y,
//             radius: 5,
//             backgroundColor: "red",
//             borderColor: "#000",
//             borderWidth: 1,
//           },
//           crossoverLabel: {
//             type: "label",
//             xValue: crossoverPoint.x,
//             yValue: crossoverPoint.y * 1.05,
//             content: [`${t("budget.Crossover Point")}`, `${crossoverPoint.label}`],
//             backgroundColor: "rgba(255,255,255,0.9)",
//             color: "#007bff",
//             font: { size: 12, weight: "bold" },
//             padding: 6,
//             textAlign: "center",
//             callout: { display: true, side: 10 },
//           },
//         }
//       : {}),
//     ...budgetChangeAnnotations.reduce((acc, ann, idx) => {
//       acc[`change_${idx}`] = ann;
//       return acc;
//     }, {}),
//   };

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: t("budget.Initial Budget"),
//         data: generateFlatData(initial),
//         parsing: false,
//         borderColor: "#FF0000",
//         borderWidth: 2,
//         borderDash: [5, 5],
//         tension: 0,
//         fill: false,
//         pointRadius: 0,
//       },
//       {
//         label: t("budget.Total Budget"),
//         data: totalData,
//         parsing: false,
//         borderColor: "#007bff",
//         borderWidth: 2,
//         tension: 0.3,
//         fill: false,
//       },
//       {
//         label: t("budget.Used Budget"),
//         data: usedData,
//         parsing: false,
//         borderColor: "#28a745",
//         borderWidth: 2,
//         tension: 0.3,
//         fill: false,
//       },
//       {
//         label: t("budget.Remaining Budget"),
//         data: remainingData,
//         parsing: false,
//         borderColor: "#ffc107",
//         borderWidth: 2,
//         tension: 0.3,
//         fill: false,
//       },
//     ],
//   };

//   const maxYValue = Math.max(initial, total, used, total - used, 1) * 1.2;

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: "bottom",
//         labels: { boxWidth: 12, padding: 20, usePointStyle: true },
//       },
//       tooltip: {
//         mode: "index",
//         intersect: false,
//         callbacks: {
//           label: (context) => {
//             const value = context.parsed.y;
//             return `${context.dataset.label}: ${typeof value === "number" ? value.toFixed(2) : "0"}`;
//           },
//         },
//       },
//       annotation: {
//         annotations,
//       },
//     },
//     scales: {
//       x: {
//         type: "linear",
//         min: 0,
//         max: labels.length - 1,
//         ticks: {
//           callback: function (val) {
//             return labels[Math.round(val)] || "";
//           },
//           stepSize: 1,
//           autoSkip: false,
//         },
//         title: { display: true, text: t("budget.Date") },
//       },
//       y: {
//         beginAtZero: true,
//         min: 0,
//         max: maxYValue,
//         ticks: {
//           callback: (value) => (typeof value === "number" ? value.toLocaleString() : value),
//         },
//         title: { display: true, text: t("budget.Amount") },
//       },
//     },
//     interaction: {
//       mode: "nearest",
//       axis: "x",
//       intersect: false,
//     },
//   };

//   return (
//     <div style={{ height: "500px", width: "100%" }}>
//       <Line data={chartData} options={options} />
//     </div>
//   );
// }
