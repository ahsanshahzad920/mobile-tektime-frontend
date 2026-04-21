import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import moment from "moment";
import { ProgressBar, Spinner, Button, ButtonGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatMissionDate } from "../../Utils/MeetingFunctions";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import {
  CalendarOutlined,
  LinkOutlined,
  FlagFilled,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertFilled,
  PlayCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";

const MissionRoadmap = ({
  isLoading = false,
  progress = 0,
  data = [],
  startDate,
  endDate,
  onPrevious,
  onNext,
  onReset,
  durationMonths,
  onDurationChange,
}) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);
  const missionsRef = useRef(new Map());
  const [viewByLink, setViewByLink] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 86400000);
    return () => clearInterval(timer);
  }, []);

  // Track container width for responsiveness
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try explicit formats first for ambiguous cases like DD/MM/YYYY
    let m = moment(dateString, ["DD/MM/YYYY", "DD/MM/YYYY HH:mm", "YYYY-MM-DD", moment.ISO_8601], true);

    // If strict parsing fails, try forgiving parsing (handles "Thu Feb 12...")
    if (!m.isValid()) {
      m = moment(dateString);
    }

    return m.isValid() ? m.toDate() : null;
  };

  const currentDatePosition = useMemo(() => {
    try {
      const chartStart = new Date(startDate);
      const chartEnd = new Date(endDate);
      const today = new Date();

      chartStart.setHours(0, 0, 0, 0);
      chartEnd.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const totalDays = (chartEnd - chartStart) / (1000 * 60 * 60 * 24);
      const daysPassed = (today - chartStart) / (1000 * 60 * 60 * 24);

      if (totalDays <= 0) return 0;

      const position = Math.min(
        100,
        Math.max(0, (daysPassed / totalDays) * 100)
      );
      return parseFloat(position.toFixed(2));
    } catch (error) {
      console.error("Error calculating current date position:", error);
      return 0;
    }
  }, [startDate, endDate]);

  const { monthHeaders, monthDividers } = useMemo(() => {
    const headers = [];
    const dividers = [];

    if (!startDate || !endDate) return { monthHeaders: [], monthDividers: [] };

    // Use moment for robust date handling
    const start = moment(startDate);
    const end = moment(endDate);
    const current = start.clone();

    // Add first month
    // headers.push(current.toDate()); // REMOVED: Loop handles this now

    const isMobile = containerWidth < 768;
    const clientColumnWidth = isMobile ? 120 : 200;
    const totalWidth = Math.max(containerWidth, window.innerWidth * 0.9);
    const clientColumnPercent = totalWidth > 0 ? (clientColumnWidth / totalWidth) * 100 : 25;

    // Calculate total duration in milliseconds for percentage calculation
    const totalDuration = end.valueOf() - start.valueOf();

    // Iterate exactly durationMonths times to match the view
    // or until we hit the end date
    for (let i = 0; i < durationMonths; i++) {
      // Calculate width of this month based on days
      const daysInMonth = current.daysInMonth();
      // Adjust if we are in a partial month scenario (start/end mid-month)? 
      // Current logic assumes start is 1st of month.

      const widthPercent = (daysInMonth * 24 * 60 * 60 * 1000 / totalDuration) * 100;

      headers.push({
        date: current.toDate(),
        width: widthPercent
      });

      // Prepare for next month divider
      const nextMonth = current.clone().add(1, 'months');

      // Stop divider calculation if strict end reached? 
      // Actually we want dividers between months.
      if (i < durationMonths - 1) {
        const timeIntoPeriod = nextMonth.valueOf() - start.valueOf();
        const dividerPos =
          clientColumnPercent +
          (timeIntoPeriod / totalDuration) * (100 - clientColumnPercent);

        if (dividerPos <= 100) {
          dividers.push(dividerPos);
        }
      }

      current.add(1, 'months');
    }

    return { monthHeaders: headers, monthDividers: dividers };
  }, [startDate, endDate, containerWidth, durationMonths]);


  const displayMissions = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const missionsMap = new Map();

    const missions = data.flatMap((client) =>
      client.destinations
        .filter((destination) => {
          if (
            !destination.meeting_start_date ||
            !destination.meeting_end_date
          ) {
            return false;
          }

          const start = parseDate(
            formatMissionDate(destination.meeting_start_date)
          );
          const end = parseDate(
            formatMissionDate(destination.meeting_end_date)
          );

          if (!start || !end) return false;

          return (
            (start >= startDate && start <= endDate) ||
            (end >= startDate && end <= endDate) ||
            (start <= startDate && end >= endDate)
          );
        })
        .map((destination) => {
          const totalMeetings = destination?.meetings?.length || 0;
          const completedMeetings = destination?.meetings?.filter(
            (m) => m.status === "closed"
          ).length;

          const allSteps =
            destination?.meetings?.flatMap((m) => m.meeting_steps || []) || [];
          const totalSteps = allSteps?.length;
          const completedSteps = allSteps?.filter(
            (s) => s.step_status === "completed"
          ).length;

          let delay = false;

          if (destination.destination_end_date_time) {
            const meetingDate = new Date(destination.meeting_end_date);
            meetingDate.setHours(0, 0, 0, 0);

            const destinationDate = new Date(
              destination.destination_end_date_time
            );
            destinationDate.setHours(0, 0, 0, 0);

            if (meetingDate.getTime() > destinationDate.getTime()) {
              delay = true;
            }
          }

          if (!delay) {
            const hasStepDelay = allSteps?.some(
              (s) =>
                (s.step_status === "in_progress" ||
                  s.step_status === "to_finish") &&
                s?.delay
            );

            if (hasStepDelay) {
              delay = true;
            }
          }

          const mission = {
            id: destination.id,
            client_id: client.id,
            client_name: client.name,
            clients: [{ id: client.id, name: client.name }],
            destination_name: destination.destination_name,
            meeting_start_date: formatMissionDate(
              destination.meeting_start_date
            ),
            meeting_end_date: formatMissionDate(destination.meeting_end_date),
            destination_end_date_time: destination.destination_end_date_time,
            total_meetings_count: totalMeetings,
            completed_meetings_count: completedMeetings || 0,
            total_steps: totalSteps || 0,
            completed_steps: completedSteps || 0,
            status: destination.status,
            delay: delay,
            budget_exceeded: destination.budget_exceeded || false,
            // OUTGOING links - is mission se dusre missions tak
            outgoing_links: destination.linked_destinations || [],
            // INCOMING links - dusre missions se is mission tak
            incoming_links: destination.linked_destination_to_me || [],
            meetings: Array(destination?.meetings?.length || 0).fill({
              status:
                completedMeetings >= totalMeetings ? "completed" : "active",
            }),
          };

          missionsMap.set(destination.id, mission);
          return mission;
        })
    );

    // Link destinations ko connect karna
    missions.forEach((mission) => {
      // Outgoing links (this mission to other missions)
      if (mission.outgoing_links && mission.outgoing_links.length > 0) {
        mission.outgoing_links = mission.outgoing_links
          .map((linked) => {
            const linkedMission = missionsMap.get(linked.id);
            if (linkedMission) {
              return {
                ...linked,
                mission: linkedMission,
                sourceMissionId: mission.id,
                targetMissionId: linked.id,
                type: 'outgoing', // Yeh identifier hai
              };
            }
            return null;
          })
          .filter((linked) => linked !== null);
      }

      // Incoming links (other missions to this mission)
      if (mission.incoming_links && mission.incoming_links.length > 0) {
        mission.incoming_links = mission.incoming_links
          .map((linked) => {
            const linkedMission = missionsMap.get(linked.id);
            if (linkedMission) {
              return {
                ...linked,
                mission: linkedMission,
                sourceMissionId: linked.id, // Note: yahan source alag hai
                targetMissionId: mission.id, // Target current mission hai
                type: 'incoming', // Yeh identifier hai
              };
            }
            return null;
          })
          .filter((linked) => linked !== null);
      }
    });

    return missions;
    return missions;
  }, [data, startDate, endDate]);

  const parentMissions = useMemo(() => {
    if (!viewByLink) return [];
    // Parent missions are those that have outgoing links (children)
    return displayMissions.filter(
      (m) => m.outgoing_links && m.outgoing_links.length > 0
    );
  }, [viewByLink, displayMissions]);

  const displayClients = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((client) => ({
        id: client.id,
        name: client.name,
        avatar: client.client_logo,
      }))
      .filter((client) =>
        displayMissions.some((mission) => mission.clients[0]?.id === client.id)
      );
  }, [data, displayMissions]);

  const getMissionStatusColor = (mission) => {
    if (mission?.status === "closed") return "rgb(119, 214, 113)";
    if (
      mission?.delay === true ||
      mission?.budget_exceeded === true ||
      (mission?.status === "in_progress" &&
        (mission?.delay || mission?.budget_exceeded))
    ) {
      return "red";
    }

    if (
      mission?.status === "in_progress" &&
      mission?.delay === false &&
      mission?.budget_exceeded === false
    ) {
      return "#f2db43";
    }

    if (mission?.status === "active") return "rgb(91, 170, 234)";
    return "#4e79a7";
  };

  const calculateMissionPosition = (mission) => {
    const start = parseDate(mission.meeting_start_date);
    const end = parseDate(mission.meeting_end_date);
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);

    const effectiveStart = start < chartStart ? chartStart : start;
    const effectiveEnd = end > chartEnd ? chartEnd : end;

    const totalDuration = chartEnd - chartStart;
    let startPos =
      Math.max(0, (effectiveStart - chartStart) / totalDuration) * 100;
    let endPos =
      Math.min(100, (effectiveEnd - chartStart) / totalDuration) * 100;

    let width = endPos - startPos;
    const MIN_WIDTH = 2;
    if (width < MIN_WIDTH) {
      const center = (startPos + endPos) / 2;
      startPos = center - MIN_WIDTH / 2;
      endPos = center + MIN_WIDTH / 2;
      width = MIN_WIDTH;
    }

    const totalMeetings = parseInt(mission?.total_steps) || 0;
    const completedMeetings = parseInt(mission?.completed_steps) || 0;
    const percentageCompleted =
      totalMeetings > 0
        ? Math.floor((completedMeetings / totalMeetings) * 100)
        : 0;

    return {
      left: `${startPos}%`,
      width: `${width}%`,
      completedWidth: `${percentageCompleted}%`,
      percentage: percentageCompleted,
      color: getMissionStatusColor(mission),
      centerX: startPos + width / 2,
      startPos,
      endPos,
      clientId: mission.client_id,
      missionId: mission.id,
      missionName: mission.destination_name,
    };
  };

  const calculateFlagPosition = (mission, missionPosition) => {
    if (!mission.destination_end_date_time) return null;

    const flagDate = parseDate(mission.destination_end_date_time);
    const chartStart = new Date(startDate);
    const chartEnd = new Date(endDate);

    // Calculate total duration of the chart view
    const totalChartDuration = chartEnd - chartStart;
    if (totalChartDuration <= 0) return null;

    // Calculate flag's position on the chart (0-100 scale)
    const flagPosOnChart = ((flagDate - chartStart) / totalChartDuration) * 100;


    // FIXED: Only show flag if it's within the current visible time range
    if (flagPosOnChart < 0 || flagPosOnChart > 100) {
      return null;
    }


    // Get mission visual dimensions on chart
    const { startPos, endPos } = missionPosition;
    const visualWidth = endPos - startPos;

    if (visualWidth <= 0) return null;

    // Calculate relative percentage inside the visual bar
    const relativeLeft = ((flagPosOnChart - startPos) / visualWidth) * 100;

    return `${Math.max(0, relativeLeft)}%`;
  };

  // Arrow connections ko calculate karna - AB do types ke arrows honge
  const calculateArrows = useMemo(() => {
    const arrows = [];
    const missionPositions = new Map();

    // If in Link View, we disable arrows because the layout itself shows the relationship
    // If in Link View, we disable arrows because the layout itself shows the relationship
    // if (viewByLink) return arrows; // ENABLED ARROWS FOR VIEW BY LINK

    if (!displayMissions || displayMissions.length === 0) return arrows;

    // Sabhi missions ki positions aur rows calculate karein
    // Sabhi missions ki positions aur rows calculate karein
    let currentY = 40; // Initial offset for header/padding

    const rows = viewByLink ? parentMissions : displayClients;

    rows.forEach((rowItem, rowIndex) => {
      let rowMissions = [];
      if (viewByLink) {
        // Parent + Children
        // We ONLY render children in the timeline timeline
        rowMissions = rowItem.outgoing_links?.map(l => l.mission).filter(Boolean) || [];

        // But we need to register the Parent's position for arrows
        // We place it "Virtually" at the start of the row (left edge) and centered vertically
        const rowHeight = Math.max(1, rowMissions.length) * 30 + 10;
        const virtualParentPos = {
          id: rowItem.id,
          centerX: 0,
          startPos: 0,
          endPos: 0,
          clientIndex: rowIndex,
          rowY: currentY + (rowHeight / 2),
          clientName: rowItem.destination_name,
          missionName: rowItem.destination_name
        };
        missionPositions.set(rowItem.id, virtualParentPos);

      } else {
        rowMissions = displayMissions.filter(m => m.clients[0]?.id === rowItem.id);
      }

      // Calculate positions for actual rendered missions (Children or Standard)
      rowMissions.forEach((mission, missionIndex) => {
        const position = calculateMissionPosition(mission);
        const rowPosition = {
          ...position,
          clientIndex: rowIndex,
          missionIndex,
          rowY: currentY + (missionIndex * 30) + 15, // +15 to center in the 30px slot
          clientName: viewByLink ? rowItem.destination_name : rowItem.name,
        };
        missionPositions.set(mission.id, rowPosition);
      });

      // Increment Y for next row
      const rowHeight = Math.max(1, rowMissions.length) * 30 + 10;
      // Note: +10 is padding in .gantt-mission-track minHeight calculation?
      // Render loop uses: minHeight: `${missionGroups?.length * 30 + 10}px`
      // So yes.
      currentY += Math.max(60, rowHeight); // Minimum row height 60?
      // CSS doesn't enforce min-height 60 on row, checks .gantt-row { display: flex }
      // But let's approximate. The client name cell might expand it.
      // Actually, let's just use the calculated content height. 
      // If content is small, row might be small? 
      // Let's assume standard behavior.
    });

    // Har mission ke links ke liye arrows create karein
    displayMissions.forEach((mission) => {
      // Outgoing arrows (is mission se dusre missions tak)
      if (mission.outgoing_links && mission.outgoing_links.length > 0) {
        mission.outgoing_links.forEach((linkedDest) => {
          if (linkedDest.mission) {
            const sourcePos = missionPositions.get(mission.id);
            const targetPos = missionPositions.get(linkedDest.mission.id);

            if (sourcePos && targetPos) {
              arrows.push({
                id: `outgoing-${mission.id}-${linkedDest.mission.id}`,
                source: sourcePos,
                target: targetPos,
                sourceMission: mission,
                targetMission: linkedDest.mission,
                type: 'outgoing', // Outgoing arrow identifier
                linkType: 'to' // Link to another mission
              });
            }
          }
        });
      }

      // Incoming arrows (dusre missions se is mission tak)
      if (mission.incoming_links && mission.incoming_links.length > 0) {
        mission.incoming_links.forEach((linkedDest) => {
          if (linkedDest.mission) {
            // Note: incoming links mein source dusra mission hai aur target current mission hai
            const sourcePos = missionPositions.get(linkedDest.mission.id);
            const targetPos = missionPositions.get(mission.id);

            if (sourcePos && targetPos) {
              arrows.push({
                id: `incoming-${linkedDest.mission.id}-${mission.id}`,
                source: sourcePos,
                target: targetPos,
                sourceMission: linkedDest.mission,
                targetMission: mission,
                type: 'incoming', // Incoming arrow identifier
                linkType: 'from' // Linked from another mission
              });
            }
          }
        });
      }
    });

    return arrows;
  }, [viewByLink, displayMissions, displayClients, startDate, endDate]);

  // Arrow SVG path banane ka function
  const getArrowPath = useCallback(
    (source, target, arrowType = 'outgoing') => {
      if (!source || !target) return null;

      const isMobile = containerWidth < 768;
      const clientColumnWidth = isMobile ? 120 : 200;
      const clientColumnPercent = (clientColumnWidth / containerWidth) * 100;

      // Calculate X positions (chart area mein convert karna)
      const sourceX =
        ((clientColumnPercent +
          (source.centerX / 100) * (100 - clientColumnPercent)) *
          containerWidth) /
        100;
      const targetX =
        ((clientColumnPercent +
          (target.centerX / 100) * (100 - clientColumnPercent)) *
          containerWidth) /
        100;

      // Calculate Y positions (rows ke hisaab se)
      const sourceY =
        source.rowY || source.clientIndex * 60 + source.missionIndex * 30 + 40;
      const targetY =
        target.rowY || target.clientIndex * 60 + target.missionIndex * 30 + 40;

      // Direction based on positions
      const isForward = sourceX <= targetX;

      // Curve height calculate karein
      const verticalDiff = Math.abs(targetY - sourceY);
      const horizontalDiff = Math.abs(targetX - sourceX);
      const curveHeight = Math.min(verticalDiff * 0.8, 100);

      if (isForward) {
        // Forward arrow (left to right)
        const controlX1 = sourceX + horizontalDiff * 0.4;
        const controlX2 = targetX - horizontalDiff * 0.4;

        return {
          path: `M ${sourceX} ${sourceY} 
               C ${controlX1} ${sourceY + curveHeight}, 
                 ${controlX2} ${targetY - curveHeight}, 
                 ${targetX} ${targetY}`,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourceMissionName: source.missionName,
          targetMissionName: target.missionName,
        };
      } else {
        // Backward arrow (right to left)
        const controlX1 = sourceX - horizontalDiff * 0.4;
        const controlX2 = targetX + horizontalDiff * 0.4;

        return {
          path: `M ${sourceX} ${sourceY} 
               C ${controlX1} ${sourceY + curveHeight}, 
                 ${controlX2} ${targetY - curveHeight}, 
                 ${targetX} ${targetY}`,
          sourceX,
          sourceY,
          targetX,
          targetY,
          sourceMissionName: source.missionName,
          targetMissionName: target.missionName,
        };
      }
    },
    [containerWidth]
  );


  const statuses = [
    { name: t("mission-badges.upcoming"), color: "rgb(91 170 234)" },
    { name: t("mission-badges.inProgress"), color: "yellow" },
    { name: t("mission-badges.alert"), color: "red" },
    { name: t("mission-badges.completed"), color: "rgb(119 214 113)" },
  ];

  return (
    <>
      {/* Responsive CSS */}
      <style>{`
  /* Add to your existing CSS */

.gantt-container {
  position: relative;
  overflow: hidden;
  min-height: 500px;
}

.gantt-scroll-wrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: visible;
  min-height: 400px;
  background: rgba(248, 249, 250, 0.5);
}

.gantt-mission-container {
  position: absolute;
  height: 25px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 4;
  overflow: visible;
}

.gantt-mission-container:hover {
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  z-index: 100 !important;
}

.current-date-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #000;
  z-index: 2;
  pointer-events: none;
}

.month-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(0,0,0,0.1);
  z-index: 2;
  pointer-events: none;
}

 /* Arrow styles based on type */
        .outgoing-arrow {
          stroke: #4a90e2; /* Blue for outgoing */
          stroke-width: 2;
          stroke-dasharray: 5,3;
        }

        .incoming-arrow {
          stroke: #34d399; /* Green for incoming */
          stroke-width: 2;
          stroke-dasharray: 3,3;
        }

        @keyframes arrowFlow {
          0% {
            stroke-dashoffset: 20;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .outgoing-indicator {
          background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(74, 144, 226, 0.5);
          animation: pulse-blue 2s infinite;
        }

        .incoming-indicator {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(52, 211, 153, 0.5);
          animation: pulse-green 2s infinite;
        }

        @keyframes pulse-blue {
          0% {
            box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(74, 144, 226, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
          }
        }

        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(52, 211, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
        }


/* Legend styles */
.status-legend {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.mission-end-flag {
  position: absolute;
  top: -24px;
  transform: translateX(-50%);
  z-index: 10;
}
      `}</style>

      {isLoading ? (
        <div className="progress-overlay" style={{ background: "transparent" }}>
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
          </div>
        </div>
      ) : (
        <div
          className="gantt-container"
          ref={containerRef}
          style={{ position: "relative" }}
        >
          {/* Navigation Controls */}
          <div className="roadmap-navigation" style={{ marginBottom: "16px" }}>
            <div className="d-block d-md-none">
              <div className="d-flex flex-column gap-3">
                <ButtonGroup style={{ marginBottom: "10px", display: "block" }}>
                  <Button
                    variant={
                      durationMonths === 3 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(3)}
                  >
                    3 mois
                  </Button>
                  <Button
                    variant={
                      durationMonths === 6 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(6)}
                  >
                    6 mois
                  </Button>
                  <Button
                    variant={
                      durationMonths === 9 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(9)}
                  >
                    9 mois
                  </Button>
                </ButtonGroup>

                <div className="text-center">
                  <div className="fw-bold mb-2" style={{ fontSize: "14px" }}>
                    {startDate.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {endDate.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    <span className="text-muted">({durationMonths} mois)</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={onReset}
                    className="flex-fill"
                  >
                    {t("calendar.reset")}
                  </Button>
                  <Button
                    variant={viewByLink ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setViewByLink(!viewByLink)}
                    className="flex-fill"
                  >
                    View By Link
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onPrevious}
                    className="flex-fill btn-nxt-pre"
                  >
                    ← {t("calendar.prev")}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onNext}
                    className="flex-fill btn-nxt-pre"
                  >
                    {t("calendar.next")} →
                  </Button>
                </div>
              </div>
            </div>

            <div className="d-none d-md-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <ButtonGroup style={{ marginBottom: "10px", display: "block" }}>
                  <Button
                    variant={
                      durationMonths === 3 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(3)}
                  >
                    3 mois
                  </Button>
                  <Button
                    variant={
                      durationMonths === 6 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(6)}
                  >
                    6 mois
                  </Button>
                  <Button
                    variant={
                      durationMonths === 9 ? "primary" : "outline-primary"
                    }
                    onClick={() => onDurationChange(9)}
                  >
                    9 mois
                  </Button>
                </ButtonGroup>

                <Button variant="outline-secondary" size="sm" onClick={onReset}>
                  {t("calendar.reset")}
                </Button>
                <Button
                  variant={viewByLink ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setViewByLink(!viewByLink)}
                >
                  View By Link
                </Button>
              </div>

              <div className="text-center fw-bold text-nowrap">
                {startDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}{" "}
                →{" "}
                {endDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}{" "}
                <span className="text-muted">({durationMonths} mois)</span>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={onPrevious}
                  className="btn-nxt-pre"
                >
                  ← {t("calendar.prev")}
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={onNext}
                  className="btn-nxt-pre"
                >
                  {t("calendar.next")} →
                </Button>
              </div>
            </div>
          </div>

          <div
            className="gantt-scroll-wrapper"
            style={{ position: "relative" }}
          >
            {/* SVG for drawing arrows */}


            {/* Draw all arrow connections */}
            {calculateArrows.map((arrow) => {
              const pathData = getArrowPath(arrow.source, arrow.target, arrow.type);
              if (!pathData) return null;

              const isOutgoing = arrow.type === 'outgoing';
              const arrowColor = isOutgoing ? "#4a90e2" : "#34d399";
              const arrowClass = isOutgoing ? "outgoing-arrow" : "incoming-arrow";
              const markerId = isOutgoing ? "arrowhead-outgoing" : "arrowhead-incoming";

              const tooltipText = isOutgoing
                ? `Links to: ${arrow.targetMission.destination_name}`
                : `Linked from: ${arrow.sourceMission.destination_name}`;

              return (
                <g key={arrow.id}>
                  <path
                    d={pathData.path}
                    fill="none"
                    stroke={arrowColor}
                    strokeWidth="2"
                    strokeDasharray={isOutgoing ? "5,3" : "3,3"}
                    markerEnd={`url(#${markerId})`}
                    opacity="0.8"
                    className={arrowClass}
                  >
                    <title>{tooltipText}</title>
                  </path>

                  <circle
                    cx={pathData.sourceX}
                    cy={pathData.sourceY}
                    r="5"
                    fill={arrowColor}
                    opacity="0.9"
                  >
                    <title>{`Source: ${arrow.sourceMission.destination_name}`}</title>
                  </circle>

                  <circle
                    cx={pathData.targetX}
                    cy={pathData.targetY}
                    r="5"
                    fill={arrowColor}
                    opacity="0.9"
                  >
                    <title>{`Target: ${arrow.targetMission.destination_name}`}</title>
                  </circle>
                </g>
              );
            })}
            {/* </svg> */}

            {/* Current date indicator */}
            <div
              className="current-date-line"
              style={{
                left: `calc(${containerWidth < 768 ? "120px" : "200px"
                  } + (100% - ${containerWidth < 768 ? "120px" : "200px"}) * ${currentDatePosition / 100
                  })`,
                // zIndex: 2,
              }}
            />

            <div className="gantt-header gantt-row">
              <div className="gantt-cell gantt-client-header">
                {viewByLink ? "Main Mission" : "Clients"}
              </div>
              {monthHeaders.map((monthObj, index) => (
                <div
                  key={index}
                  className="gantt-cell gantt-month-header"
                  style={{
                    flex: 'none',
                    width: `${monthObj.width}%`,
                    maxWidth: `${monthObj.width}%`
                  }}
                >
                  {monthObj.date.toLocaleString("default", { month: "short" })}{" "}
                  {monthObj.date.getFullYear().toString().slice(-2)}
                </div>
              ))}
            </div>

            {/* Month divider lines */}
            {monthDividers.map((pos, index) => (
              <div
                key={`divider-${index}`}
                className="month-divider"
                style={{ left: `${pos}%` }}
              />
            ))}

            {/* Client/Parent and mission rows */}
            {(viewByLink ? parentMissions : displayClients).map((rowItem) => {
              // Determine missions for this row
              let rowMissions = [];
              if (viewByLink) {
                // In Link View: rowItem is the Parent Mission
                // We show only Linked Children in the timeline
                rowMissions = rowItem.outgoing_links
                  .map((link) => link.mission)
                  .filter((m) => m !== undefined && m !== null);
              } else {
                // In Normal View: rowItem is the Client
                // We show missions belonging to this client
                rowMissions = displayMissions.filter(
                  (mission) => mission.clients[0]?.id === rowItem.id
                );
              }

              const missionGroups = [];
              rowMissions.forEach((mission) => {
                const position = calculateMissionPosition(mission);
                missionGroups.push([mission]);
              });

              return (
                <div
                  key={rowItem.id}
                  className="gantt-row"
                // style={{ zIndex: 3 }}
                >
                  <div className="gantt-cell gantt-client-name">
                    <div className="client-avatar-container">
                      {!viewByLink && rowItem.avatar ? (
                        <img
                          src={rowItem.avatar}
                          alt={rowItem.name}
                          onClick={() => navigate(`/client/${rowItem?.id}`)}
                          style={{
                            cursor: "pointer",
                            objectFit: "cover",
                            width: "30px",
                            height: "30px",
                            objectPosition: "top",
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                      ) : !viewByLink ? (
                        <div className="client-avatar-placeholder" />
                      ) : null}
                      <span
                        className="client-name-text"
                        style={{
                          overflow: viewByLink ? "visible" : "hidden",
                          textOverflow: viewByLink ? "clip" : "ellipsis",
                          whiteSpace: viewByLink ? "normal" : "nowrap",
                          maxWidth: viewByLink ? "100%" : (containerWidth < 768 ? "70px" : "150px"),
                          display: "inline-block",
                        }}
                        title={viewByLink ? rowItem.destination_name : rowItem?.name}
                      >
                        {viewByLink ? rowItem.destination_name : rowItem?.name}
                      </span>
                    </div>
                  </div>
                  <div
                    className="gantt-cell gantt-mission-track"
                    style={{
                      minHeight: `${missionGroups?.length * 30 + 10}px`,
                      // position: "relative",
                      // zIndex: 3,
                    }}
                  >
                    {missionGroups?.map((group, groupIndex) => (
                      <div
                        key={`group-${groupIndex}`}
                        className="mission-group"
                      // style={{ position: "relative" }}
                      >
                        {group.map((mission, missionIndex) => {
                          const position = calculateMissionPosition(mission);
                          const flagPosition = calculateFlagPosition(mission, position);


                          // Check for different types of links
                          const hasOutgoingLinks = mission.outgoing_links && mission.outgoing_links.length > 0;
                          const hasIncomingLinks = mission.incoming_links && mission.incoming_links.length > 0;
                          return (
                            <div
                              key={mission.id}
                              className="gantt-mission-container"
                              style={{
                                left: position.left,
                                width: position.width,
                                top: `${missionIndex * 30}px`,
                                // zIndex: missionIndex + 1,
                                zIndex: hasOutgoingLinks || hasIncomingLinks ? 10 : missionIndex + 1,
                                border: hasOutgoingLinks || hasIncomingLinks
                                  ? `2px solid ${hasOutgoingLinks && hasIncomingLinks ? '#9f7aea' : hasOutgoingLinks ? '#4a90e2' : '#34d399'}`
                                  : "1px solid rgba(255, 255, 255, 0.3)",
                                boxShadow: hasOutgoingLinks || hasIncomingLinks
                                  ? `0 2px 8px ${hasOutgoingLinks && hasIncomingLinks ? 'rgba(159, 122, 234, 0.4)' : hasOutgoingLinks ? 'rgba(74, 144, 226, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`
                                  : "0 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                              onClick={() =>
                                navigate(`/invitiesToMeeting/${mission.id}`)
                              }
                              ref={(el) => {
                                if (el) {
                                  missionsRef.current.set(mission.id, {
                                    element: el,
                                    position,
                                    mission,
                                  });
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

                              {/* Outgoing links indicator (Links TO other missions) */}
                              {hasOutgoingLinks && (
                                <Tooltip
                                  title={`Links to: ${mission.outgoing_links
                                    .map((d) => d.destination_name)
                                    .join(", ")}`}
                                  placement="top"
                                >
                                  <div
                                    className="outgoing-indicator"
                                    style={{
                                      position: "absolute",
                                      right: hasIncomingLinks ? "-18px" : "-12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      width: "24px",
                                      height: "24px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      zIndex: 11,
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <ArrowRightOutlined />
                                  </div>
                                </Tooltip>
                              )}

                              {/* Incoming links indicator (Linked FROM other missions) */}
                              {hasIncomingLinks && (
                                <Tooltip
                                  title={`Linked from: ${mission.incoming_links
                                    .map((d) => d.destination_name)
                                    .join(", ")}`}
                                  placement="top"
                                >
                                  <div
                                    className="incoming-indicator"
                                    style={{
                                      position: "absolute",
                                      left: hasOutgoingLinks ? "-18px" : "-12px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      width: "24px",
                                      height: "24px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      zIndex: 11,
                                      color: "white",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <ArrowLeftOutlined />
                                  </div>
                                </Tooltip>
                              )}

                              {/* Both outgoing and incoming links indicator (special case) */}
                              {hasOutgoingLinks && hasIncomingLinks && (
                                <Tooltip
                                  title={`Links to: ${mission.outgoing_links
                                    .map((d) => d.destination_name)
                                    .join(", ")}
                              \nLinked from: ${mission.incoming_links
                                      .map((d) => d.destination_name)
                                      .join(", ")}`}
                                  placement="top"
                                >
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "-8px",
                                      left: "50%",
                                      transform: "translateX(-50%)",
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      background: "linear-gradient(135deg, #4a90e2 0%, #34d399 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      zIndex: 12,
                                      color: "white",
                                      fontSize: "8px",
                                      fontWeight: "bold",
                                      border: "2px solid white",
                                    }}
                                  >
                                    <LinkOutlined />
                                  </div>
                                </Tooltip>
                              )}


                              {mission?.destination_end_date_time &&
                                flagPosition && (
                                  <Tooltip
                                    title={`${t(
                                      "milestone_end_date"
                                    )}: ${new Date(
                                      mission.destination_end_date_time
                                    ).toLocaleDateString()}`}
                                    placement="top"
                                  >
                                    <div
                                      className="mission-end-flag"
                                      style={{
                                        left: flagPosition,
                                        cursor: "pointer",
                                        // zIndex: 5,
                                      }}
                                    >
                                      <svg
                                        width="34px"
                                        height="34px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <g
                                          id="SVGRepo_bgCarrier"
                                          stroke-width="0"
                                        ></g>
                                        <g
                                          id="SVGRepo_tracerCarrier"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                          stroke="#CCCCCC"
                                          stroke-width="0.048"
                                        ></g>
                                        <g id="SVGRepo_iconCarrier">
                                          {" "}
                                          <path
                                            opacity="0.5"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M6.5 1.75C6.5 1.33579 6.16421 1 5.75 1C5.33579 1 5 1.33579 5 1.75V21.75C5 22.1642 5.33579 22.5 5.75 22.5C6.16421 22.5 6.5 22.1642 6.5 21.75V13.6V3.6V1.75Z"
                                            fill="#1C274C"
                                          ></path>{" "}
                                          <path
                                            d="M13.5582 3.87333L13.1449 3.70801C11.5821 3.08288 9.8712 2.9258 8.22067 3.25591L6.5 3.60004V13.6L8.22067 13.2559C9.8712 12.9258 11.5821 13.0829 13.1449 13.708C14.8385 14.3854 16.7024 14.5119 18.472 14.0695L18.5721 14.0445C19.1582 13.898 19.4361 13.2269 19.1253 12.7089L17.5647 10.1078C17.2232 9.53867 17.0524 9.25409 17.0119 8.94455C16.9951 8.81543 16.9951 8.68466 17.0119 8.55553C17.0524 8.24599 17.2232 7.96141 17.5647 7.39225L18.8432 5.26136C19.1778 4.70364 18.6711 4.01976 18.0401 4.17751C16.5513 4.54971 14.9831 4.44328 13.5582 3.87333Z"
                                            fill="#1C274C"
                                          ></path>{" "}
                                        </g>
                                      </svg>
                                    </div>
                                  </Tooltip>
                                )}

                              <div
                                className="gantt-mission-label"
                                title={`${mission.destination_name} ${mission?.meeting_start_date ||
                                  mission?.meeting_end_date
                                  ? `(${formatMissionDate(
                                    mission?.meeting_start_date
                                  )} to ${formatMissionDate(
                                    mission?.meeting_end_date
                                  )})`
                                  : ""
                                  } - ${position.percentage}% completed`}
                                style={{
                                  fontSize:
                                    containerWidth < 768 ? "10px" : "12px",
                                  padding:
                                    containerWidth < 768
                                      ? "2px 4px"
                                      : "4px 8px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "100%",
                                  // zIndex: 5,
                                  // backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  // borderRadius: "2px",
                                  // margin: "2px",
                                }}
                              >
                                {mission.destination_name} (
                                {position.percentage}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="status-legend">
            <div className="status-list">
              {statuses.map((status, index) => (
                <div key={index} className="status-item">
                  <span
                    className="status-dot"
                    style={{ backgroundColor: status.color }}
                  ></span>
                  <span
                    style={{
                      fontSize: containerWidth < 768 ? "12px" : "14px",
                    }}
                  >
                    {status.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Linked destinations legend
            <div className="status-list" style={{ marginTop: "10px" }}>
              <div className="status-item">
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#4a90e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    marginRight: "8px",
                  }}
                >
                  →
                </div>
                <span
                  style={{ fontSize: containerWidth < 768 ? "12px" : "14px" }}
                >
                  {t("linked_destinations") || "Links to other mission"}
                </span>
              </div>
              <div className="status-item" style={{ marginTop: "5px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#4a90e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "12px",
                    marginRight: "8px",
                  }}
                >
                  ←
                </div>
                <span
                  style={{ fontSize: containerWidth < 768 ? "12px" : "14px" }}
                >
                  {t("linked_from") || "Linked from another mission"}
                </span>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default MissionRoadmap;
