import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ProgressBar, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatMissionDate,
  getISOWeekNumber,
} from "../../../Utils/MeetingFunctions";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../../Apicongfig";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import { useFormContext } from "../../../../context/CreateMeetingContext";

const Roadmap = ({
  isLoading = false,
                                        handleChangeMeetings,

  progress = 0,
  data = [],
  milestones,
  startDate,
  endDate,
  onPrevious,
  onNext,
  onReset,
  destination,
  from,
}) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
 
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = useCallback(
    (navigationFn) => {
      if (isNavigating) return;
      setIsNavigating(true);
      navigationFn();
      setTimeout(() => setIsNavigating(false), 300);
    },
    [isNavigating]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 86400000);
    return () => clearInterval(timer);
  }, []);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();

    // Handle ISO format (with 'T')
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return new Date(year, month - 1, day);
    }

    // Fallback to default Date parsing
    return new Date(dateString);
  };

  const currentDatePosition = useMemo(() => {
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today <= chartStart) return 0;
    if (today >= chartEnd) return 100;

    const totalDuration = chartEnd - chartStart;
    const elapsed = today - chartStart;
    return parseFloat(((elapsed / totalDuration) * 100).toFixed(2));
  }, [startDate, endDate]);

  const { weekHeaders, weekDividers } = useMemo(() => {
    const headers = [];
    const dividers = [];
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);

    // Client column width percentage (fixed left sidebar)
    const clientColumnPercent = (200 / window.innerWidth) * 100;

    let currentDate = new Date(chartStart);

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      headers.push({
        start: weekStart,
        end: weekEnd,
        number: getISOWeekNumber(weekStart),
      });

      // Add divider at end of each week (except last week)
      if (i < 3) {
        const daysElapsed = (weekEnd - chartStart) / (86400 * 1000); // days
        const dividerPosition =
          clientColumnPercent +
          (daysElapsed / 28) * (100 - clientColumnPercent);
        dividers.push(dividerPosition);
      }

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return { weekHeaders: headers, weekDividers: dividers };
  }, [startDate, endDate]);


  const displayUsers = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((user) => {
        const meetingsByType = {};

        (user.meetings || []).forEach((meeting) => {
          const type = meeting.type || "Other";
          if (!meetingsByType[type]) {
            meetingsByType[type] = [];
          }

          const start = parseDate(meeting.date);
          const end = meeting.estimate_time?.split("T")[0]
            ? parseDate(meeting.estimate_time?.split("T")[0])
            : start;
          const chartStart = new Date(startDate);
          const chartEnd = new Date(endDate);

          // Check based on status
          const shouldInclude = [
            "in_progress",
            "todo",
            "to_finish",
            "closed",
            "abort",
            "active"
          ].includes(meeting.status)
            ? start <= chartEnd && end >= chartStart
            : // Only check end date for these statuses
              start >= chartStart; // Only check start date for other statuses

          if (shouldInclude) {
            meetingsByType[type].push(meeting);
          }
        });

        return {
          id: user.id,
          name: user.full_name || `${user.first_name} ${user.last_name}`,
        avatar: user.participant_image,
          meetingsByType,
          user_id: user?.user_id
        };
      })
      .filter((user) => {
        return Object.values(user.meetingsByType).some(
          (meetings) => meetings.length > 0
        );
      });
  }, [data, startDate, endDate]);

  const calculateMeetingPosition = (meeting) => {
    const start = parseDate(meeting.date);
    const end = meeting.estimate_time
      ? parseDate(meeting.estimate_time?.split("T")[0])
      : start;
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);

    // Filter based on status
    const shouldShow = [
      "in_progress",
      "todo",
      "to_finish",
      "closed",
      "abort",
      "active"
    ].includes(meeting.status)
      ? start <= chartEnd && end >= chartStart
      : // Only check end date for these statuses
        start >= chartStart; // Only check start date for other statuses

    if (!shouldShow) {
      return null;
    }

    const totalDuration = chartEnd - chartStart;
    let startPos = Math.max(0, (start - chartStart) / totalDuration) * 100;
    let endPos = Math.min(100, (end - chartStart) / totalDuration) * 100;

    let width = endPos - startPos;
    const MIN_WIDTH = 2;
    if (width < MIN_WIDTH) {
      const center = (startPos + endPos) / 2;
      startPos = center - MIN_WIDTH / 2;
      endPos = center + MIN_WIDTH / 2;
      width = MIN_WIDTH;
    }

    const completionPercentage = calculateCompletionPercentage(
      meeting.meeting_steps || []
    );

    return {
      left: `${startPos}%`,
      width: `${width}%`,
      color: getMeetingStatusColor(meeting),
      completedWidth: `${completionPercentage}%`,
      percentage: completionPercentage,
    };
  };

  const getMeetingStatusColor = (meeting) => {
    const isDelayedStep =
      meeting?.meeting_steps?.some(
        (item) =>
          item?.step_status === "in_progress" &&
          convertTimeTakenToSeconds(item?.time_taken) >
            convertCount2ToSeconds(item?.count2, item?.time_unit)
      ) || false;
    switch (meeting?.status) {
      case "closed":
        return "rgb(119, 214, 113)";
      case "to_finish":
        return "#ff9800";
      case "todo":
        return "#6c757d";
      case "abort":
        return "rgb(119, 19, 241)";
      case "in_progress":
        return isDelayedStep ? "red" : "#f2db43";
      case "active":
        return "rgb(91, 170, 234)";
      default:
        return "#4e79a7";
    }
  };

  const calculateCompletionPercentage = (steps) => {
    if (!Array.isArray(steps) || steps.length === 0) return 0;
    const completedSteps = steps.filter(
      (step) => step.step_status === "completed"
    ).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const calculateMilestonePosition = (milestoneDate) => {
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);

    if (milestoneDate < chartStart) return 0;
    if (milestoneDate > chartEnd) return 100;

    const totalDuration = chartEnd - chartStart;
    const elapsed = milestoneDate - chartStart;
    return parseFloat(((elapsed / totalDuration) * 100).toFixed(2));
  };

  const [hoveredMilestone, setHoveredMilestone] = useState(null);

  const processedMilestones = useMemo(() => {
    if (!Array.isArray(milestones) || milestones?.length === 0) return [];

    return milestones
      .flatMap((milestoneGroup) =>
        milestoneGroup?.map((item) => {
          let date;
          if (item?.decision_type === "Milestone") {
            date = item?.milestone_date;
          } else {
            date = item?.creation_date; // For Budget and Rule types
          }

          return {
            ...item,
            displayDate: date ? parseDate(date) : null,
          };
        })
      )
      .filter((item) => {
        // Only keep milestones that fall within current date range
        if (!item.displayDate) return false;
        const chartStart = new Date(startDate);
        const chartEnd = new Date(endDate);
        return item.displayDate >= chartStart && item.displayDate <= chartEnd;
      });
  }, [milestones, startDate, endDate]);

  const statuses = [
    { name: t("calendar.status1"), color: "rgb(119 214 113)" },
    { name: t("calendar.status2"), color: "yellow" },
    { name: t("calendar.status3"), color: "red" },
    { name: t("calendar.status4"), color: "rgb(119 19 241)" },
    { name: t("calendar.status5"), color: "rgb(91 170 234)" },
    { name: t("calendar.status6"), color: "#ff9800" },
  ];
  const [expandedUsers, setExpandedUsers] = useState({});

  return (
    <>
      {isLoading ? (
        <div className="progress-overlay" style={{ background: "transparent" }}>
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
          </div>
        </div>
      ) : (
        <div className="gantt-container">
          {/* Navigation Controls */}
          <div className="roadmap-navigation" style={{ marginBottom: "10px" }}>
            {/* Mobile layout (stacked) */}
            <div className="d-block d-md-none">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Button
                  variant="outline-secondary"
                  onClick={onReset}
                  size="sm"
                  style={{ marginRight: "8px", flex: 1 }}
                  disabled={isNavigating}
                >
                  {t("calendar.reset")}
                </Button>
                <Button
                  className="btn-nxt-pre"
                  onClick={() => handleNavigation(onPrevious)}
                  disabled={isNavigating}
                  size="sm"
                  style={{ marginRight: "8px", flex: 1 }}
                >
                  {t("calendar.prev")}
                </Button>
                <Button
                  className="btn-nxt-pre"
                  onClick={() => handleNavigation(onNext)}
                  disabled={isNavigating}
                  size="sm"
                  style={{ flex: 1 }}
                >
                  {t("calendar.next")}
                </Button>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {t("week")} 1 -{" "}
                {startDate.toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}{" "}
                to{" "}
                {new Date(
                  startDate.getTime() + 6 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(t("calendar.locale"), {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Desktop layout (original) */}
            <div
              className="d-none d-md-flex"
              style={{ justifyContent: "space-between", padding: "0 10px" }}
            >
              <div>
                <Button
                  variant="outline-secondary"
                  onClick={onReset}
                  style={{ marginRight: "10px" }}
                >
                  {t("calendar.reset")}
                </Button>
                {/* <span style={{ fontWeight: "bold" }}>
                  {startDate.toLocaleDateString(t("calendar.locale"), {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {endDate.toLocaleDateString(t("calendar.locale"), {
                    month: "long",
                    year: "numeric",
                  })}
                </span> */}
              </div>
              <div>
                <Button className="btn-nxt-pre me-2" onClick={onPrevious}>
                  {t("calendar.prev")}
                </Button>
                <Button className="btn-nxt-pre" onClick={onNext}>
                  {t("calendar.next")}
                </Button>
              </div>
            </div>
          </div>

          <div className="gantt-scroll-wrapper">
            {/* Current date indicator */}
            <div
              className="current-date-line"
              style={{
                left: `calc(200px + (100% - 200px) * ${
                  currentDatePosition / 100
                })`,
              }}
            />

            {/* Milestone lines */}
            {processedMilestones.map((milestone, index) => {
              const position = calculateMilestonePosition(
                milestone.displayDate
              );

              return (
                <div
                  className="milestone-container"
                  key={`milestone-${index}`}
                  style={{
                    position: "absolute",
                    left: `calc(200px + (100% - 200px) * ${position / 100})`,
                    top: "40px",
                    height: `calc(100% - 40px)`,
                    zIndex: 8,
                  }}
                  onMouseEnter={() => setHoveredMilestone(index)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                >
                  {/* Black milestone line */}
                  <div
                    className="milestone-line"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "2px",
                      height: "100%",
                      backgroundColor: "black",
                    }}
                  />

                  {/* Diamond shape at top */}
                  <div
                    className="milestone-diamond"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "0",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "black",
                      transform: "translateX(-50%) rotate(45deg)",
                      zIndex: 9,
                    }}
                  />

                  {/* Label (hidden by default) */}
                  <div
                    className="milestone-label"
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "15px",
                      transform: "translateX(-50%)",
                      opacity: hoveredMilestone === index ? 1 : 0,
                      cursor: hoveredMilestone === index ? "pointer" : "auto",
                      transition: "opacity 0.2s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {milestone.decision}
                    {milestone.decision_type === "Budget" && (
                      <span className="budget-amount">
                        ({milestone.budget_amount} {milestone.currency})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="gantt-header gantt-row">
              <div className="gantt-cell gantt-client-header">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Organisateur</span>
                </div>
              </div>
              {weekHeaders.map((week, index) => (
                <div key={index} className="gantt-cell gantt-month-header">
                  {`${t("week")} ${week.number}`}
                  <br />
                  {`${week.start.getDate()} ${week.start.toLocaleDateString(
                    "en-US",
                    { month: "short" }
                  )} - 
       ${week.end.getDate()} ${week.end.toLocaleDateString("en-US", {
                    month: "short",
                  })}`}
                </div>
              ))}
            </div>

            {/* Month divider lines */}
            {weekDividers.map((pos, index) => (
              <div
                key={`divider-${index}`}
                className="month-divider"
                style={{ left: `${pos}%` }}
              />
            ))}

            {/* User rows with their destinations */}
            {displayUsers.map((user) => (
              <React.Fragment key={user.id}>
                {/* User row */}
                <div className="gantt-row">
                  <div className="gantt-cell gantt-client-name">
                    <div
                      className="client-avatar-container"
                      style={{
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "4px",
                        backgroundColor: expandedUsers[user.id]
                          ? "#f0f0f0"
                          : "transparent",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        {user.avatar ? (
                          <img
                            src={
                              user.avatar?.startsWith("http")
                                ? user.avatar
                                : Assets_URL + "/" + user.avatar
                            }
                            alt={user.name}
                            onClick={(e) => {
                              e.stopPropagation();
                                   if(user?.user_id){

                              navigate(`/casting/member/${destination?.id}/${user.user_id}`,{state:{from:'Mission'}});
                              }
else{
                              navigate(`/casting/contact/${destination?.id}/${user.id}`,{state:{from:'Mission'}});

}
                            }}
                            style={{
                              cursor: "pointer",
                              objectFit: "cover",
                              width: "40px",
                              height: "40px",
                              objectPosition: "top",
                              borderRadius: "50%",
                              marginRight: "12px",
                              border: "2px solid #fff",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          />
                        ) : (
                          <div
                            className="client-avatar-placeholder"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor: "#e9ecef",
                              marginRight: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#6c757d",
                              fontWeight: "bold",
                              fontSize: "16px",
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "500" }}>{user.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="gantt-cell gantt-mission-track"></div>
                </div>

                {Object.entries(user.meetingsByType).map(
                  ([type, meetings], typeIndex) => {
                    if (meetings.length === 0) return null;

                    return (
                      <div
                        key={`${user.id}-${type}-${typeIndex}`}
                        className="gantt-row"
                        style={{
                          backgroundColor: "rgba(245, 245, 245, 0.5)",
                          borderLeft: "4px solid #6c757d",
                        }}
                      >
                        <div
                          className="gantt-cell gantt-client-name"
                          // style={{ width: "250px" }}
                        >
                          <div
                            className="client-avatar-container"
                            style={{
                              paddingLeft: "52px",
                              padding: "8px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontWeight: "500",
                                  // cursor: "pointer",
                                }}
                              >
                                {t(`types.${type}`)}
                              </span>
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {meetings.length} moment
                                {meetings.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="gantt-cell gantt-mission-track"
                          style={{
                            minHeight: `${meetings.length * 30 + 10}px`,
                          }}
                        >
                          {meetings.map((meeting, index) => {
                            const position = calculateMeetingPosition(meeting);
                            if (!position) return null;

                            return (
                              <div
                                key={meeting.id}
                                className="gantt-mission-container"
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  top: `${index * 30}px`,
                                  zIndex: index + 1,
                                }}
                                onClick={() => {
                                  if (
                                    meeting?.status === "closed" ||
                                    meeting?.status === "abort"
                                  ) {
                                    if (from === "report") {
                                         // window.open(`/destination/${meeting?.unique_id}/${meeting?.id}`, '_blank');
                                                                            handleChangeMeetings(meeting)


                                    } else {
                                      navigate(
                                        `/present/invite/${meeting?.id}`
                                      );
                                    }
                                  } else {
                                    if (from === "report") {
                                            // window.open(`/destination/${meeting?.unique_id}/${meeting?.id}`, '_blank');
                                                                            handleChangeMeetings(meeting)


                                    } else {
                                      navigate(`/invite/${meeting?.id}`);
                                    }
                                  }
                                }}
                              >
                                <div
                                  className="gantt-mission-bar"
                                  style={{
                                    width: "100%",
                                    backgroundColor: position.color,
                                    opacity: 0.3,
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
                                  className="gantt-mission-label"
                                  title={`${meeting.title} (${meeting.date}${
                                    meeting.estimate_time?.split("T")[0]
                                      ? ` to ${
                                          meeting.estimate_time?.split("T")[0]
                                        }`
                                      : ""
                                  }) - ${position.percentage}% completed`}
                                >
                                  {meeting.title} ({position.percentage}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </React.Fragment>
            ))}
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
        </div>
      )}

      {/* {open && (
        <NewMeetingModal
          open={open}
          closeModal={handleCloseModal}
          destination={destination}
          openedFrom="destination"
        />
      )} */}
    </>
  );
};

export default Roadmap;
