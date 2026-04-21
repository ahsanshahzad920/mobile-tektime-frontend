import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Assets_URL } from "../../Apicongfig";
import "./UserRoadmap.scss";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
} from "../../Utils/MeetingFunctions";

const UserRoadmap = ({
  isLoading = false,
  progress = 0,
  data = null,
  startDate,
  endDate,
  viewMode,
  setViewMode,
  onPrevious,
  onNext,
  onReset,
}) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHourlyDetails, setShowHourlyDetails] = useState({});

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation handler with debouncing
  const handleNavigation = useCallback(
    (navigationFn) => {
      if (isNavigating) return;
      setIsNavigating(true);
      navigationFn();
      setTimeout(() => setIsNavigating(false), 300);
    },
    [isNavigating]
  );

  // Toggle hourly meeting details
  const toggleHourlyDetails = useCallback((meetingId) => {
    setShowHourlyDetails((prev) => ({
      ...prev,
      [meetingId]: !prev[meetingId],
    }));
  }, []);

  // Date parsing utility
  const parseDate = (dateInput) => {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) {
      const date = new Date(dateInput);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    if (typeof dateInput === "string") {
      if (dateInput.includes("T")) {
        const date = new Date(dateInput);
        date.setHours(0, 0, 0, 0);
        return date;
      }
      const [year, month, day] = dateInput.split("-");
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  // Parse datetime with hours and minutes
  const parseDateTime = (dateTimeInput) => {
    if (!dateTimeInput) return new Date();
    if (dateTimeInput instanceof Date) return dateTimeInput;
    if (typeof dateTimeInput === "string") {
      return new Date(dateTimeInput);
    }
    return new Date();
  };

  const effectiveChartStart = parseDate(startDate);
  const effectiveChartEnd = parseDate(endDate);

  // Calculate current date/time position in timeline
  const currentDatePosition = useMemo(() => {
    const chartStart = new Date(effectiveChartStart);
    const chartEnd = new Date(effectiveChartEnd);

    if (viewMode === "hourly") {
      chartStart.setHours(0, 0, 0, 0);
      chartEnd.setHours(23, 59, 59, 999);
    } else {
      chartEnd.setHours(23, 59, 59, 999);
    }

    const now = new Date();

    if (now <= chartStart) return 0;
    if (now >= chartEnd) return 100;

    const totalDuration = chartEnd.getTime() - chartStart.getTime();
    const elapsed = now.getTime() - chartStart.getTime();
    return parseFloat(((elapsed / totalDuration) * 100).toFixed(2));
  }, [effectiveChartStart, effectiveChartEnd, viewMode]);

  // Generate timeline headers and dividers based on view mode
  const { headers, dividers } = useMemo(() => {
    const headers = [];
    const dividers = [];
    const current = new Date(effectiveChartStart);
    const end = new Date(effectiveChartEnd);

    // Responsive column widths
    const clientColumnWidth = isMobile ? 120 : 200;
    const totalWidth = window.innerWidth * (isMobile ? 0.95 : 0.9);
    const clientColumnPercent = (clientColumnWidth / totalWidth) * 100;
    const timelineWidthPercent = 100 - clientColumnPercent;

    if (viewMode === "weekly") {
      const totalDays = (end - effectiveChartStart) / (1000 * 60 * 60 * 24);
      headers.push(new Date(current));

      for (let i = 0; i < 3; i++) {
        const nextWeek = new Date(current);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (nextWeek > end) break;
        headers.push(new Date(nextWeek));
        current.setDate(current.getDate() + 7);
      }

      headers.forEach((header, index) => {
        if (index > 0) {
          const daysIntoPeriod =
            (header - effectiveChartStart) / (1000 * 60 * 60 * 24);
          const dividerPos =
            clientColumnPercent +
            (daysIntoPeriod / totalDays) * timelineWidthPercent;
          dividers.push(dividerPos);
        }
      });
    } else if (viewMode === "daily") {
      const weekStart = new Date(effectiveChartStart);
      const weekEnd = new Date(effectiveChartEnd);
      const totalDays = (weekEnd - weekStart) / (1000 * 60 * 60 * 24) || 1;

      let day = new Date(weekStart);
      while (day <= weekEnd && day <= end) {
        headers.push(new Date(day));
        if (day < weekEnd && day < end) {
          const daysIntoPeriod = (day - weekStart) / (1000 * 60 * 60 * 24);
          const dividerPos =
            clientColumnPercent +
            (daysIntoPeriod / totalDays) * timelineWidthPercent;
          dividers.push(dividerPos);
        }
        day.setDate(day.getDate() + 1);
      }
    } else if (viewMode === "hourly") {
      // Hourly view - show hours with responsive intervals
      const dayStart = new Date(effectiveChartStart);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(effectiveChartStart);
      dayEnd.setHours(23, 59, 59, 999);
      const totalHours = 24;

      // Show fewer hours on mobile for better readability
      const hourInterval = isMobile ? 3 : 1;

      for (let hour = 0; hour < 24; hour += hourInterval) {
        const hourDate = new Date(dayStart);
        hourDate.setHours(hour, 0, 0, 0);
        headers.push(new Date(hourDate));

        // Add dividers between hours
        if (hour < 23) {
          const hoursIntoDay = hour;
          const dividerPos =
            clientColumnPercent +
            (hoursIntoDay / totalHours) * timelineWidthPercent;
          dividers.push(dividerPos);
        }
      }
    }

    return { headers, dividers };
  }, [effectiveChartStart, effectiveChartEnd, viewMode, isMobile]);

  // Process user data for display
  const displayUsers = useMemo(() => {
    if (!data || !data.users) return [];

    return data.users.map((user) => ({
      id: user.id,
      name: user.full_name || `${user.name} ${user.last_name}`,
      avatar: user.image,
      meetings: (user.destinations || []).reduce((allMeetings, destination) => {
        return [...allMeetings, ...(destination.meetings || [])];
      }, []),
    }));
  }, [data]);

  // Determine meeting status color
  const getMeetingStatusColor = (meeting) => {
    if (!meeting) return "#4e79a7";

    // Red if any step exceeds allowed time
    if (
      meeting.status === "in_progress" &&
      meeting.steps?.some(
        (item) =>
          item?.step_status === "in_progress" &&
          convertTimeTakenToSeconds(item?.time_taken) >
            convertCount2ToSeconds(item?.count2, item?.time_unit)
      )
    ) {
      return "red";
    }

    // Yellow for normal in-progress
    if (meeting.status === "in_progress") return "#f2db43";

    // Status-based colors
    const statusColors = {
      closed: "rgb(119, 214, 113)",
      to_finish: "#ff9800",
      todo: "#6c757d",
      abort: "rgb(119, 19, 241)",
      active: "rgb(91, 170, 234)",
    };

    return statusColors[meeting.status] || "#4e79a7";
  };

  // Calculate completion percentage for meeting steps
  const calculateCompletionPercentage = (steps) => {
    if (!Array.isArray(steps) || steps.length === 0) return 0;
    const totalSteps = steps.length;
    const completedSteps = steps.filter(
      (step) => step.step_status === "completed"
    ).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Calculate meeting position and dimensions on timeline
  const calculateMeetingPosition = (meeting) => {
    const chartStart = new Date(effectiveChartStart);
    const chartEnd = new Date(effectiveChartEnd);

    if (viewMode === "hourly") {
      chartStart.setHours(0, 0, 0, 0);
      chartEnd.setHours(23, 59, 59, 999);

      let start, end;

      // Parse start time with timezone consideration
      if (meeting.date && meeting.start_time) {
        const combinedStart = combineDateTime(meeting.date, meeting.start_time);
        start = parseDateTime(combinedStart);
        if (meeting.timezone) {
          const startInTimezone = new Date(
            start.toLocaleString("en-US", { timeZone: meeting.timezone })
          );
          start = startInTimezone;
        }
      } else if (meeting.starts_at) {
        const combinedStart = combineDateTime(meeting.date, meeting.starts_at);
        start = parseDateTime(combinedStart);
        if (meeting.timezone) {
          const startInTimezone = new Date(
            start.toLocaleString("en-US", { timeZone: meeting.timezone })
          );
          start = startInTimezone;
        }
      } else if (meeting.date) {
        start = parseDate(meeting.date);
        start.setHours(0, 0, 0, 0);
      } else {
        start = chartStart;
      }

      // Parse end time with timezone consideration
      if (meeting.status === "abort" && meeting.abort_end_time) {
        end = parseDateTime(meeting.abort_end_time);
        if (meeting.timezone) {
          const endInTimezone = new Date(
            end.toLocaleString("en-US", { timeZone: meeting.timezone })
          );
          end = endInTimezone;
        }
      } else if (meeting.estimate_time) {
        end = parseDateTime(meeting.estimate_time);
        if (meeting.timezone) {
          const endInTimezone = new Date(
            end.toLocaleString("en-US", { timeZone: meeting.timezone })
          );
          end = endInTimezone;
        }
      } else if (meeting.end_date && meeting.end_time) {
        const combinedEnd = combineDateTime(meeting.end_date, meeting.end_time);
        end = parseDateTime(combinedEnd);
        if (meeting.timezone) {
          const endInTimezone = new Date(
            end.toLocaleString("en-US", { timeZone: meeting.timezone })
          );
          end = endInTimezone;
        }
      } else if (meeting.end_date) {
        end = parseDate(meeting.end_date);
        end.setHours(23, 59, 59, 999);
      } else {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }

      if (end <= start) {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      }

      const effectiveStart = start < chartStart ? chartStart : start;
      const effectiveEnd = end > chartEnd ? chartEnd : end;

      const totalDuration = chartEnd.getTime() - chartStart.getTime();
      let startPos =
        Math.max(0, (effectiveStart - chartStart) / totalDuration) * 100;
      let endPos =
        Math.min(100, (effectiveEnd - chartStart) / totalDuration) * 100;

      let width = endPos - startPos;
      const MIN_WIDTH = isMobile ? 2 : 1;
      if (
        width < MIN_WIDTH &&
        effectiveStart <= chartEnd &&
        effectiveEnd >= chartStart
      ) {
        const center = (startPos + endPos) / 2;
        startPos = Math.max(0, center - MIN_WIDTH / 2);
        endPos = Math.min(100, center + MIN_WIDTH / 2);
        width = endPos - startPos;
      }

      const completionPercentage = calculateCompletionPercentage(
        meeting?.steps || []
      );

      return {
        left: `${startPos}%`,
        width: `${width}%`,
        color: getMeetingStatusColor(meeting),
        completedWidth: `${completionPercentage}%`,
        percentage: completionPercentage,
      };
    } else {
      // Daily/Weekly view logic
      chartStart.setHours(0, 0, 0, 0);
      chartEnd.setHours(23, 59, 59, 999);

      const start = parseDate(meeting.date);
      let end;

      if (meeting.status === "abort" && meeting.abort_end_time) {
        end = parseDate(meeting.abort_end_time.split(" ")[0]);
      } else if (meeting.estimate_time) {
        end = parseDate(meeting.estimate_time.split("T")[0]);
      } else if (meeting.end_date) {
        end = parseDate(meeting.end_date);
      } else {
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
      }

      if (end < start) {
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
      }

      const effectiveStart = start < chartStart ? chartStart : start;
      const effectiveEnd = end > chartEnd ? chartEnd : end;

      const totalDuration = chartEnd.getTime() - chartStart.getTime();
      let startPos =
        Math.max(0, (effectiveStart - chartStart) / totalDuration) * 100;
      let endPos =
        Math.min(100, (effectiveEnd - chartStart) / totalDuration) * 100;

      let width = endPos - startPos;
      const MIN_WIDTH = isMobile ? 3 : 2;
      if (
        width < MIN_WIDTH &&
        effectiveStart <= chartEnd &&
        effectiveEnd >= chartStart
      ) {
        const center = (startPos + endPos) / 2;
        startPos = Math.max(0, center - MIN_WIDTH / 2);
        endPos = Math.min(100, center + MIN_WIDTH / 2);
        width = endPos - startPos;
      }

      const completionPercentage = calculateCompletionPercentage(
        meeting?.steps || []
      );

      return {
        left: `${startPos}%`,
        width: `${width}%`,
        color: getMeetingStatusColor(meeting),
        completedWidth: `${completionPercentage}%`,
        percentage: completionPercentage,
      };
    }
  };

  // Status legend configuration
  const statuses = [
    { name: t("calendar.status1"), color: "rgb(119 214 113)" },
    { name: t("calendar.status2"), color: "yellow" },
    { name: t("calendar.status3"), color: "red" },
    { name: t("calendar.status4"), color: "rgb(119 19 241)" },
    { name: t("calendar.status5"), color: "rgb(91 170 234)" },
    { name: t("calendar.status6"), color: "rgb(255, 152, 0)" },
    { name: t("calendar.status7"), color: "rgb(108, 117, 125)" },
  ];

  // Date/time formatting utilities
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return dateStr || "";
    const cleanDate = dateStr.split("T")[0];
    const cleanTime = timeStr.split(".")[0];
    return `${cleanDate}T${cleanTime}`;
  };

  const formatDateTime = (dateTimeStr, locale, timezone) => {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone || "Europe/Paris",
      });
    } catch (e) {
      return "";
    }
  };

  const formatTime = (dateTimeStr, locale, timezone) => {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone || "Europe/Paris",
      });
    } catch (e) {
      return "";
    }
  };

  const formatDate = (dateStr, locale) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  // Filter meetings based on view mode
  const filterMeetingsForView = (meetings) => {
    return meetings.filter((meeting) => {
      if (!meeting.date) return false;

      if (viewMode === "hourly") {
        const start = parseDateTime(
          combineDateTime(
            meeting.date,
            meeting.start_time || meeting.starts_at || "00:00"
          )
        );
        const end = meeting.estimate_time
          ? parseDateTime(meeting.estimate_time)
          : meeting.end_date
          ? parseDate(meeting.end_date)
          : new Date(start.getTime() + 60 * 60 * 1000);

        const chartStart = new Date(effectiveChartStart);
        chartStart.setHours(0, 0, 0, 0);
        const chartEnd = new Date(effectiveChartStart);
        chartEnd.setHours(23, 59, 59, 999);

        return (
          (start >= chartStart && start <= chartEnd) ||
          (end >= chartStart && end <= chartEnd) ||
          (start <= chartStart && end >= chartEnd)
        );
      } else {
        const start = parseDate(meeting.date);
        const end = meeting.end_date ? parseDate(meeting.end_date) : start;
        const chartStart = effectiveChartStart;
        const chartEnd = effectiveChartEnd;

        return (
          (start >= chartStart && start <= chartEnd) ||
          (end >= chartStart && end <= chartEnd) ||
          (start <= chartStart && end >= chartEnd)
        );
      }
    });
  };

  // Mobile-friendly meeting label
  const getMeetingLabel = (meeting, position) => {
    if (isMobile && viewMode === "hourly") {
      return showHourlyDetails[meeting.id] ? (
        <div className="mobile-meeting-details">
          <div className="meeting-title">{meeting.title}</div>
          <div className="meeting-time">
            {meeting.start_time &&
              formatTime(
                combineDateTime(meeting.date, meeting.start_time),
                t("calendar.locale"),
                meeting.timezone
              )}
          </div>
          <div className="meeting-progress">{position.percentage}%</div>
        </div>
      ) : (
        <div className="mobile-meeting-simple">
          <span className="meeting-indicator">●</span>
        </div>
      );
    }

    // Desktop label
    return (
      <>
        {meeting.title}
        {viewMode === "hourly" &&
          meeting.start_time &&
          `(${formatTime(
            combineDateTime(meeting.date, meeting.start_time),
            t("calendar.locale"),
            meeting.timezone
          )})`}
      </>
    );
  };

  return (
    <div
      className={`gantt-container-101 ${
        isMobile ? "mobile-view" : "desktop-view"
      }`}
    >
      {/* Navigation Controls */}
      <div className="roadmap-navigation">
        {/* View Mode Buttons */}
        <div className="view-mode-buttons">
          <ButtonGroup className={isMobile ? "btn-group-mobile" : "gap-2"}>
            <Button
              variant={viewMode === "weekly" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("weekly")}
              className={isMobile ? "btn-mobile" : ""}
              size={isMobile ? "sm" : undefined}
            >
              {isMobile ? t("calendar.showWeekly") : t("calendar.showWeekly")}
            </Button>
            <Button
              variant={viewMode === "daily" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("daily")}
              className={isMobile ? "btn-mobile" : ""}
              size={isMobile ? "sm" : undefined}
            >
              {isMobile ? t("calendar.showDaily") : t("calendar.showDaily")}
            </Button>
            <Button
              variant={viewMode === "hourly" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("hourly")}
              className={isMobile ? "btn-mobile" : ""}
              size={isMobile ? "sm" : undefined}
            >
              {isMobile ? t("calendar.showHourly") : t("calendar.showHourly")}
            </Button>
          </ButtonGroup>
        </div>

        {/* Mobile Controls */}
        <div
          className={`${
            isMobile ? "d-block" : "d-none"
          } mobile-controls-wrapper`}
        >
          <div className="mobile-controls">
            <Button
              variant="outline-secondary"
              onClick={() => handleNavigation(onReset)}
              size="sm"
              disabled={isNavigating}
            >
              {t("calendar.reset")}
            </Button>
            <Button
              className="btn-nxt-pre"
              onClick={() => handleNavigation(onPrevious)}
              disabled={isNavigating}
              size="sm"
            >
              {t("calendar.prev")}
            </Button>
            <Button
              className="btn-nxt-pre"
              onClick={() => handleNavigation(onNext)}
              disabled={isNavigating}
              size="sm"
            >
              {t("calendar.next")}
            </Button>
          </div>
          <div className="mobile-date">
            {viewMode === "weekly" ? (
              <>
                {effectiveChartStart.toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(
                  effectiveChartStart.getTime() + 6 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}
              </>
            ) : viewMode === "daily" ? (
              <>
                {effectiveChartStart.toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {effectiveChartEnd.toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}
              </>
            ) : (
              <>
                {effectiveChartStart.toLocaleDateString(t("calendar.locale"), {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </>
            )}
          </div>
        </div>

        {/* Desktop Controls */}
        <div className={`${isMobile ? "d-none" : "d-flex"} desktop-controls`}>
          <div>
            <Button
              variant="outline-secondary"
              onClick={() => handleNavigation(onReset)}
              className="me-2"
            >
              {t("calendar.reset")}
            </Button>
            <span className="date-range">
              {viewMode === "hourly" ? (
                effectiveChartStart.toLocaleDateString(t("calendar.locale"), {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                <>
                  {effectiveChartStart.toLocaleDateString(
                    t("calendar.locale"),
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}{" "}
                  -{" "}
                  {effectiveChartEnd.toLocaleDateString(t("calendar.locale"), {
                    month: "long",
                    year: "numeric",
                  })}
                </>
              )}
            </span>
          </div>
          <div>
            <Button
              className="btn-nxt-pre me-2"
              onClick={() => handleNavigation(onPrevious)}
            >
              {t("calendar.prev")}
            </Button>
            <Button
              className="btn-nxt-pre"
              onClick={() => handleNavigation(onNext)}
            >
              {t("calendar.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-scroll-wrapper">
        <div
          className="current-date-line"
          style={{
            left: `calc(${isMobile ? 120 : 200}px + (100% - ${
              isMobile ? 120 : 200
            }px) * ${currentDatePosition / 100})`,
          }}
        />

        {/* Timeline Header */}
        <div className="gantt-header gantt-row">
          <div
            className={`gantt-cell gantt-client-header ${
              isMobile ? "mobile-client-header" : ""
            }`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{isMobile ? "Team" : "Team Members"}</span>
            </div>
          </div>
          {headers.map((header, index) => {
            const locale = t("calendar.locale");

            if (viewMode === "weekly") {
              const weekEnd = new Date(header);
              weekEnd.setDate(weekEnd.getDate() + 6);

              const getISOWeekNumber = (date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
                const week1 = new Date(d.getFullYear(), 0, 4);
                return (
                  1 +
                  Math.round(
                    ((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) /
                      7
                  )
                );
              };

              const weekNumber = getISOWeekNumber(header);
              const startDay = header.getDate();
              const startMonth = header.toLocaleDateString(locale, {
                month: "short",
              });
              const endDay = weekEnd.getDate();
              const endMonth = weekEnd.toLocaleDateString(locale, {
                month: "short",
              });

              return (
                <div
                  key={index}
                  className={`gantt-cell gantt-month-header ${
                    isMobile ? "mobile-header" : ""
                  }`}
                >
                  {isMobile ? `W${index + 1}` : t("week")} {index + 1}
                  {!isMobile && (
                    <>
                      <br />
                      {startDay} {startMonth} - {endDay} {endMonth}
                    </>
                  )}
                </div>
              );
            } else if (viewMode === "daily") {
              const dayName = header.toLocaleDateString(locale, {
                weekday: isMobile ? "narrow" : "short",
              });
              const day = header.getDate();
              const month = isMobile
                ? ""
                : header.toLocaleDateString(locale, { month: "short" });

              return (
                <div
                  key={index}
                  className={`gantt-cell gantt-month-header ${
                    isMobile ? "mobile-header" : ""
                  }`}
                >
                  {isMobile ? (
                    <>
                      {dayName}
                      <br />
                      {day}
                    </>
                  ) : (
                    `${dayName} ${day} ${month}`
                  )}
                </div>
              );
            } else {
              // Hourly view
              const hour = header.getHours();
              const period = hour >= 12 ? "PM" : "AM";
              const displayHour = hour % 12 || 12;

              return (
                <div
                  key={index}
                  className={`gantt-cell gantt-month-header hourly-header ${
                    isMobile ? "mobile-header" : ""
                  }`}
                >
                  {isMobile ? (
                    `${displayHour}${period === "AM" ? "a" : "p"}`
                  ) : (
                    <>
                      {displayHour}
                      <br />
                      {period}
                    </>
                  )}
                </div>
              );
            }
          })}
        </div>

        {/* Timeline Dividers */}
        {dividers.map((pos, index) => (
          <div
            key={`divider-${index}`}
            className="column-divider"
            style={{ left: `${pos}%` }}
          />
        ))}

        {/* User Rows */}
        {/* User Rows - Updated Section */}
        {displayUsers.map((user) => {
          const userMeetings = filterMeetingsForView(user.meetings);

          // Shortened name for mobile
          const getDisplayName = (name) => {
            if (!isMobile) return name;

            // Take first word of name, max 8 characters
            const firstName = name.split(" ")[0];
            return firstName.length > 8
              ? firstName.substring(0, 8) + "..."
              : firstName;
          };

          return (
            <div key={user.id} className="gantt-row">
           {/* Improved User Info */}
      <div className={`gantt-cell gantt-client-name ${isMobile ? 'mobile-client-name' : ''}`}>
        <div className={`client-avatar-container ${isMobile ? 'mobile-avatar-container' : ''}`}>
          {user.avatar ? (
            <img
              src={user.avatar?.startsWith("http") ? user.avatar : Assets_URL + "/" + user.avatar}
              alt={user.name}
              onClick={() => navigate(`/member/${user.id}`)}
              className={`client-avatar ${isMobile ? 'mobile-avatar' : ''}`}
            />
          ) : (
            <div className={`client-avatar-placeholder ${isMobile ? 'mobile-avatar' : ''}`}>
              {getDisplayName(user.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`user-text-info ${isMobile ? 'mobile-user-info' : ''}`}>
            <div 
              className="client-name" 
              title={user.name} // Full name tooltip
            >
              {getDisplayName(user.name)}
            </div>
            {!isMobile && (
              <div className="meetings-count">
                {userMeetings.length} meetings
              </div>
            )}
          </div>
        </div>
      </div>

              {/* Meeting Timeline */}
              <div
                className="gantt-cell gantt-mission-track"
                style={{
                  minHeight: `${
                    userMeetings.length * (isMobile ? 25 : 30) + 10
                  }px`,
                }}
              >
                {userMeetings.map((meeting, index) => {
                  const position = calculateMeetingPosition(meeting);

                  return (
                    <div
                      key={meeting.id}
                      className={`gantt-mission-container ${
                        isMobile ? "mobile-mission" : ""
                      } ${viewMode === "hourly" ? "hourly-mission" : ""}`}
                      style={{
                        left: position.left,
                        width: position.width,
                        top: `${index * (isMobile ? 25 : 30)}px`,
                        zIndex: index + 1,
                      }}
                      onClick={(e) => {
                        if (isMobile && viewMode === "hourly") {
                          e.stopPropagation();
                          toggleHourlyDetails(meeting.id);
                        } else {
                          if (
                            meeting?.status === "closed" ||
                            meeting?.status === "abort"
                          ) {
                            navigate(`/present/invite/${meeting?.id}`);
                          } else {
                            navigate(`/invite/${meeting?.id}`);
                          }
                        }
                      }}
                      onDoubleClick={() => {
                        if (
                          meeting?.status === "closed" ||
                          meeting?.status === "abort"
                        ) {
                          navigate(`/present/invite/${meeting?.id}`);
                        } else {
                          navigate(`/invite/${meeting?.id}`);
                        }
                      }}
                    >
                      <div
                        className="gantt-mission-bar"
                        style={{
                          width: "100%",
                          backgroundColor: position.color,
                        }}
                      />
                      <div
                        className="gantt-mission-completed"
                        style={{
                          width: position.completedWidth,
                          backgroundColor: position.color,
                        }}
                      />
                      <div
                        className={`gantt-mission-label ${
                          isMobile ? "mobile-label" : ""
                        }`}
                        title={`
    ${meeting.title} 
    (${
      meeting.status === "active"
        ? meeting.start_time
          ? ` ${formatDateTime(
              combineDateTime(meeting.date, meeting.start_time),
              t("calendar.locale"),
              meeting.timezone
            )}`
          : ` ${formatDate(meeting.date, t("calendar.locale"))}`
        : meeting.starts_at
        ? ` ${formatDateTime(
            combineDateTime(meeting.date, meeting.starts_at),
            t("calendar.locale"),
            meeting.timezone
          )}`
        : ` ${formatDate(meeting.date, t("calendar.locale"))}`
    } - ${
                          meeting.status === "abort" && meeting.abort_end_time
                            ? `${formatDateTime(
                                meeting.abort_end_time,
                                t("calendar.locale"),
                                meeting.timezone
                              )}`
                            : meeting.estimate_time
                            ? `${formatDateTime(
                                meeting.estimate_time,
                                t("calendar.locale"),
                                meeting.timezone
                              )}`
                            : meeting.end_date
                            ? `${formatDate(
                                meeting.end_date,
                                t("calendar.locale")
                              )}`
                            : ""
                        }) 
    - ${position.percentage}% completed
  `}
                      >
                        {getMeetingLabel(meeting, position)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Legend - Collapsible on mobile */}
      <div className={`status-legend ${isMobile ? "mobile-legend" : ""}`}>
        <div className="status-list">
          {statuses.map((status, index) => (
            <div key={index} className="status-item">
              <span
                className="status-dot"
                style={{ backgroundColor: status.color }}
              ></span>
              {isMobile ? status.name.split(" ")[0] : status.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRoadmap;
