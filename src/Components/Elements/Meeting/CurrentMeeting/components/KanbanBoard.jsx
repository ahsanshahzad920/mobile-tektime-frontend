import CookieService from '../../../../Utils/CookieService';
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  Modal,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import { HiUserCircle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  convertTimeTakenToSeconds,
  convertTo24HourFormat,
  formatPauseTime,
  formatStepDate,
  getTimeUnitDisplay,
  markTodoMeeting,
  typeIcons,
} from "../../../../Utils/MeetingFunctions";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import { convertCount2ToSeconds } from "../../GetMeeting/Helpers/functionHelper";
import moment from "moment";
import { toast } from "react-toastify";
import axios from "axios";
import { useSidebarContext } from "../../../../../context/SidebarContext";
import { HiOutlineDotsVertical } from "react-icons/hi";
import StepChart from "../../CreateNewMeeting/StepChart";

const KanbanCustomCard = ({
  step,
  meeting,
  handleClick,
  t,
  navigate,
  users,
  openForceModal,
  handleShow,
  handleCopyStep,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const iconRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        iconRef.current &&
        !iconRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItemStyle = {
    padding: "8px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    fontSize: "12px",
  };
  const renderTooltip = (props) => (
    <Tooltip id="step-tooltip" {...props}>
      {step?.title || "No Title"}
    </Tooltip>
  );

  const renderObjectiveTooltip = (props) => (
    <Tooltip id="objective-tooltip" {...props}>
      {meeting?.objective || "No Objective"}
    </Tooltip>
  );

  const renderTitleTooltip = (props) => (
    <Tooltip id="meeting-title-tooltip" {...props}>
      {meeting?.title || "No Meeting Title"}
    </Tooltip>
  );

  const localizeTimeTakenActive = (timeTaken) => {
    if (!timeTaken) return "";

    const timeUnits = t("time_unit", { returnObjects: true });
    const timeParts = timeTaken.split(" - ");

    let days = null;
    let hours = null;
    let minutes = null;
    let seconds = null;

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

    const hasDays = Boolean(days);
    let result = "";

    if (hasDays) {
      result = [days, hours].filter(Boolean).join(" - ");
    } else if (hours) {
      result = [hours, minutes].filter(Boolean).join(" - ");
    } else if (minutes) {
      result = [minutes, seconds].filter(Boolean).join(" - ");
    } else {
      result = seconds;
    }

    if (!result) return "";

    return result
      .split(" ")
      .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
      .join(" ");
  };

  const localizeTimeTaken = (timeTaken) => {
    if (!timeTaken) return;

    const timeUnits = t("time_unit", { returnObjects: true });

    return timeTaken
      .split(" ")
      .map((part) => {
        if (!isNaN(part)) {
          return part;
        }
        return timeUnits[part] || part;
      })
      .join(" ");
  };

  return (
    <Card
      className="mb-3 kanban-step-card"
      onClick={(e) => {
        e.stopPropagation();
        handleClick(step);
      }}
      style={{ cursor: "pointer", position: "relative" }} // Added position relative
    >
      {/* Three-dot menu icon */}
      <div
        ref={iconRef}
        className="kanban-menu-icon"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          cursor: "pointer",
          zIndex: 10,
          background: "white",
          borderRadius: "4px",
          padding: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <HiOutlineDotsVertical size={16} color="#666" />
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="kanban-dropdown"
          style={{
            position: "absolute",
            top: "30px",
            right: "8px",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            zIndex: 100,
            minWidth: "140px",
            fontSize: "12px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {step?.step_status === null && (
            <div
              className="dropdown-item"
              style={menuItemStyle}
              onClick={(e) => {
                e.stopPropagation();
                openForceModal(step);
                setMenuOpen(false);
              }}
            >
              {t("buttons.Force start")}
            </div>
          )}
          {((step?.order_no === 1 && step?.step_status === null) ||
            step?.step_status === "todo") && (
            <div
              className="dropdown-item"
              style={menuItemStyle}
              onClick={(e) => {
                e.stopPropagation();
                handleShow(step);
                setMenuOpen(false);
              }}
            >
              {t("buttons.Modify")}
            </div>
          )}
          <div
            className="dropdown-item"
            style={{ ...menuItemStyle, borderBottom: "none" }}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyStep(step);
              setMenuOpen(false);
            }}
          >
            {t("buttons.Copy")}
          </div>
        </div>
      )}
      <Card.Body className="p-3">
        <div className="d-flex flex-column gap-2">
          {/* Objective */}
          <h6
            className="m-0 text-muted small"
            style={{ fontSize: "12px", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invitiesToMeeting/${meeting?.destination_id}`);
            }}
          >
            <OverlayTrigger placement="top" overlay={renderObjectiveTooltip}>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "100%" }}
              >
                {meeting?.objective}
              </span>
            </OverlayTrigger>
          </h6>
          <hr className="my-1" />

          {/* Meeting Title */}
          <h6
            className="m-0 d-flex align-items-center justify-content-between"
            style={{ color: "#92929d", fontSize: "13px" }}
            onClick={(e) => {
              e.stopPropagation();
              const path =
                meeting?.type === "Special" ||
                meeting?.status === "closed" ||
                meeting?.status === "abort"
                  ? `/present/invite/${meeting?.id}`
                  : `/invite/${meeting?.id}`;
              navigate(path, { state: { data: meeting, from: "meeting" } });
            }}
          >
            <span>{typeIcons[meeting?.type]}</span>
            <OverlayTrigger placement="top" overlay={renderTitleTooltip}>
              <span
                className="text-truncate d-inline-block"
                style={{ maxWidth: "80%" }}
              >
                {meeting?.title}
              </span>
            </OverlayTrigger>
          </h6>
          <hr className="my-1" />

          {/* Step Title + Status */}
          <div className="d-flex align-items-center justify-content-between">
            {/* Left side - Order and Title in single line */}
            <div
              className="d-flex align-items-center flex-grow-1 me-2"
              style={{ minWidth: 0 }}
            >
              {/* Larger Order Number */}
              <span
                className="text-muted fw-bold flex-shrink-0"
                style={{ fontSize: "14px", width: "35px" }}
              >
                {step?.order_no <= 9 ? "0" : ""}
                {step?.order_no}
              </span>

              {/* Larger Bold Title with Truncate and Tooltip */}
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <span
                  className="text-truncate fw-bold flex-grow-1"
                  style={{
                    fontSize: "16px",
                    color: "#333",
                    lineHeight: "1.3",
                    minWidth: 0, // Important for truncation
                    maxWidth: "100%", // Prevent overflow
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  }}
                >
                  {step?.title}
                </span>
              </OverlayTrigger>
            </div>

            {/* Right side - Status Badge */}
            <div className="flex-shrink-0 ms-2">
              {step.step_status === "completed" ? (
                <span className="status-badge-completed h-auto">
                  {t("badge.completed")}
                </span>
              ) : step.step_status === "in_progress" ? (
                <span
                  className={
                    convertTimeTakenToSeconds(step?.time_taken) >
                    convertCount2ToSeconds(step?.count2, step?.time_unit)
                      ? "status-badge-red h-auto"
                      : "status-badge-inprogress h-auto"
                  }
                >
                  {t("badge.inprogress")}
                </span>
              ) : step.step_status === "paused" ? (
                <span className={"status-badge-red h-auto"}>
                  {t("badge.paused")}
                </span>
              ) : step?.step_status === "todo" ? (
                <span className="status-badge-green">{t("badge.Todo")}</span>
              ) : step?.step_status === "to_accept" ? (
                <span className="status-badge-green">{t("badge.to_accept")}</span>
              ) : step?.step_status === "no_status" ? (
                null
              ) : step?.step_status === "to_finish" ? (
                <span className="status-badge-finish">{t("badge.finish")}</span>
              ) : (
                <span
                  className={
                    moment().isAfter(
                      moment(
                        `${step?.start_date} ${step?.step_time}`,
                        "YYYY-MM-DD hh:mm:ss A"
                      )
                    )
                      ? "status-badge-late"
                      : "status-badge-upcoming"
                  }
                >
                  {moment().isAfter(
                    moment(
                      `${step?.start_date} ${step?.step_time}`,
                      "YYYY-MM-DD hh:mm:ss A"
                    )
                  )
                    ? t("badge.late")
                    : t("badge.future")}
                </span>
              )}
            </div>
          </div>

          {/* Rest of the code remains same */}
          {/* Assigned To */}
          <div className="d-flex align-items-center mt-2">
            {meeting?.newsletter_guide ? (
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
                    src={
                      meeting?.newsletter_guide?.logo?.startsWith("http")
                        ? meeting?.newsletter_guide?.logo
                        : Assets_URL + "/" + meeting?.newsletter_guide?.logo
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
                {step?.image || step?.assigned_to_image ? (
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
                      step?.image?.startsWith("users/")
                        ? `${Assets_URL}/${step.image}`
                        : step?.assigned_to_image?.startsWith("users/")
                        ? `${Assets_URL}/${step?.assigned_to_image}`
                        : step?.image || step?.assigned_to_image
                    }
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
                    src={
                      users?.image?.startsWith("users/")
                        ? Assets_URL + "/" + users?.image
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
                {step?.assigned_to_name ||
                  `${users?.firstName} ${users?.lastName}`}
              </span>
            )}
          </div>

          {/* Time */}
          <div className="d-flex align-items-center small text-muted mt-1">
            <img
              height="16px"
              width="16px"
              src="/Assets/ion_time-outline.svg"
              alt="time"
              className="me-1"
            />
            {window.location.href.includes("/present/invite") ? (
              <>
                <span className="me-2">{step?.step_time}</span>
              </>
            ) : (
              <span
                className={`${step?.time_unit === "days" ? "me-2" : "me-2"}`}
              >
                {step?.time_unit === "days" ? (
                  <>
                    {step.step_status === null || step?.step_status === "todo"
                      ? formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          meeting?.timezone
                        )
                      : formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          meeting?.timezone
                        )}
                  </>
                ) : (
                  <>
                    {step?.step_status === null || step?.step_status === "todo"
                      ? formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          meeting?.timezone
                        ) +
                        " " +
                        ` ${t("at")}` +
                        " " +
                        convertTo24HourFormat(
                          step?.step_time,
                          step?.start_date,
                          step?.time_unit,
                          meeting?.timezone
                        )
                      : formatStepDate(
                          step?.start_date,
                          step?.step_time,
                          meeting?.timezone
                        ) +
                        " " +
                        ` ${t("at")}` +
                        " " +
                        convertTo24HourFormat(
                          step?.step_time,
                          step?.start_date,
                          step?.time_unit,
                          meeting?.timezone
                        )}
                  </>
                )}
              </span>
            )}{" "}
          </div>

          {/* Duration */}
          <div className="d-flex align-items-center small text-muted">
            <img
              src="/Assets/alarm-invite.svg"
              alt="alarm"
              width={16}
              height={16}
              className="me-1"
            />
            <span>
              {window.location.href.includes("/present/invite") ? (
                <span>
                  {localizeTimeTaken(step?.time_taken?.replace("-", ""))}
                </span>
              ) : (
                <>
                  {step?.step_status === null || step?.step_status === "todo"
                    ? step.count2 +
                      " " +
                      `${getTimeUnitDisplay(step?.count2, step?.time_unit, t)}`
                    : step?.step_status === "to_finish"
                    ? formatPauseTime(step?.work_time, t)
                    : localizeTimeTakenActive(
                        step?.time_taken?.replace("-", "")
                      )}
                  {step?.step_status !== null &&
                    step?.step_status !== "todo" && (
                      <span>
                        &nbsp; /{" "}
                        {step.count2 +
                          " " +
                          `${getTimeUnitDisplay(
                            step?.count2,
                            step?.time_unit,
                            t
                          )}`}
                      </span>
                    )}
                </>
              )}{" "}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// ——————————————————————
// MAIN KANBAN BOARD - 4 COLUMN LAYOUT
// ——————————————————————

const KanbanBoard = ({ data, meeting, refreshMeeting, users }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const { toggle, show } = useSidebarContext();
  const [stepId, setStepId] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);
  const [isDrop, setIsDrop] = useState(false);
  const [columns, setColumns] = useState({
    planned: [],
    todo: [],
    inprogress: [],
    completed: [],
  });

  useEffect(() => {
    const grouped = {
      planned: data.filter((s) => s.step_status === null || s.step_status === "to_accept" || s.step_status === "no_status"),
      todo: data.filter(
        (s) => s.step_status === "todo" || s.step_status === "to_finish"
      ),
      inprogress: data.filter((s) => s.step_status === "in_progress"),
      completed: data.filter(
        (s) =>
          s.step_status === "completed" ||
          s.step_status === "cancelled" ||
          s.step_status === "abort"
      ),
    };
    setColumns(grouped);
  }, [data]);

  const handleClick = (item, index) => {
    if (item?.step_status === "in_progress") {
      navigate(`/actīon-play/${meeting?.id}/${item?.id}`);
    } else {
      navigate(`/step/${item?.id}`, {
        state: { meeting: meeting },
      });
    }
  };

  const [isForceStep, setIsForceStep] = useState(false);

  const [showForceModal, setShowForceModal] = useState(false);
  const [forcedStep, setForcedStep] = useState(null);

  const [modalSteps, setModalSteps] = useState([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const openForceModal = async (step) => {
    setForcedStep(step);
    setShowForceModal(true);
    setIsLoadingSteps(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-prev-upcomnig-steps/${step?.id}`,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        }
      );
      setModalSteps(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching steps for force start modal:", error);
    } finally {
      setIsLoadingSteps(false);
    }
  };

  const handleForceStart = async (step) => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentTime = new Date();

    const formattedCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedCurrentDate = currentTime.toISOString().split("T")[0];
    try {
      const postData = {
        step_status: "in_progress",
        status: "in_progress",
        current_time: formattedCurrentTime,
        current_date: formattedCurrentDate,
      };
      const response = await axios.post(
        `${API_BASE_URL}/run-upcoming-step/${step?.id}?pause_current_time=${formattedCurrentTime}&pause_current_date=${formattedCurrentDate}`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        }
      );
      if (response?.status) {
        if (
          meeting?.type === "Task" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Prestation Client"
        ) {
          markTodoMeeting(meeting?.id);
        }

        navigate(`/actīon-play/${meeting?.id}/${step?.id}`);
      }
    } catch (error) {
      console.log("error while click force start button", error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
    toggle(true);
  };

  const [selectedStepId, setSelectedStepId] = useState(null);
  const handleShow = (step) => {
    setSelectedStepId(step?.id);
    setIsModalOpen(true);
  };

  const [showCopy, setShowCopy] = useState(false);
  const closeCopyModal = () => setShowCopy(false);
  const [duplicatedStep, setDuplicatedStep] = useState(null);

  const handleCopyStep = async (item) => {
    const maxOrderNo = Math.max(
      ...meeting?.steps?.map((step) => step.order_no ?? 0),
      0
    );

    const duplicateStepData = {
      ...item,
      _method: "put",
      duplicate: true,
      time_taken: null,
      savedTime: null,
      negative_time: "0",
      note: null,
      decision: null,
      step_status: null,
      status: "active",
      current_time: null,
      current_date: null,
      end_time: null,
      end_date: null,
      meeting_id: item?.meeting_id,
      order_no: maxOrderNo + 1,
      sent: 0,
      copy_order_no: true,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/steps/${item?.id}`,
        duplicateStepData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${
              CookieService.get("token")
            }`,
          },
        }
      );
      if (response.status) {
        const newStep = response?.data?.data;
        setDuplicatedStep(newStep);
        setShowCopy(true);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  // Agar meeting closed hai → sirf completed column dikhao
  if (meeting?.status === "closed") {
    return (
      <div className="kanban-container">
        <div className="row g-3">
          <div className="col-md-3 col-12">
            <div className="kanban-column h-100">
              <h6
                className="column-header px-3 py-2 rounded-top"
                style={{
                  backgroundColor: "rgba(47, 187, 103, 0.1019607843)",
                  color: "#2fa25d",
                }}
              >
                {t("badge.completed")} ({columns.completed.length})
              </h6>

              <div
                className="column-body p-2"
                style={{
                  minHeight: "400px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 8px 8px",
                }}
              >
                {columns.completed.length > 0 ? (
                  columns.completed.map((step, index) => (
                    <div key={step.id} index={index}>
                      <KanbanCustomCard
                        step={step}
                        meeting={meeting}
                        handleClick={handleClick}
                        t={t}
                        navigate={navigate}
                        users={users}
                        openForceModal={openForceModal}
                        handleShow={handleShow}
                        handleCopyStep={handleCopyStep}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small p-3">
                    {t("No steps")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const columnConfig = [
    {
      id: "planned",
      title: t("badge.Planned"),
      bgcolor: "rgba(47, 86, 187, 0.1019607843)",
      color: "#2f56bb",
    },
    { id: "todo", title: t("badge.Todo"), bgcolor: "#6c757d", color: "white" },
    {
      id: "inprogress",
      title: t("badge.inprogress"),
      bgcolor: "#f2db43",
      color: "white",
    },
    {
      id: "completed",
      title: t("badge.completed"),
      bgcolor: "rgba(47, 187, 103, 0.1019607843)",
      color: "#2fa25d",
    },
  ];

  return (
    <>
      <div className="kanban-container">
        <div className="row g-3">
          {columnConfig.map((col) => (
            <div key={col.id} className="col-xl-3 col-lg-3 col-md-6 col-sm-12">
              <div className="kanban-column h-100">
                <h6
                  className="column-header text-center px-3 py-2 rounded-top"
                  style={{ backgroundColor: col.bgcolor, color: col.color }}
                >
                  {col.title} ({columns[col.id].length})
                </h6>

                <div
                  className="column-body p-2"
                  style={{
                    minHeight: "400px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "0 0 8px 8px",
                  }}
                >
                  {columns[col.id].map((step, index) => (
                    <div key={step.id} index={index}>
                      <KanbanCustomCard
                        step={step}
                        meeting={meeting}
                        handleClick={handleClick}
                        t={t}
                        navigate={navigate}
                        users={users}
                        openForceModal={openForceModal}
                        handleShow={handleShow}
                        handleCopyStep={handleCopyStep}
                      />
                    </div>
                  ))}
                  {columns[col.id].length === 0 && (
                    <div className="text-center text-muted small p-3">
                      No {t("steps")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Force Start Step Button Upcoming */}
      {showForceModal && (
        <Modal
          show={showForceModal}
          onHide={() => setShowForceModal(false)}
          backdrop="static"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {t(
                "The following actions are supposed to be done before this one in order of priority:"
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoadingSteps ? (
              <div className="text-center">
                <Spinner animation="border" role="status" />
              </div>
            ) : modalSteps.length > 0 ? (
              <ul>
                {modalSteps.map((s, index) => (
                  <li key={s.id || index}>
                    {s.order_no}. {s.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("No Steps Exists!")}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setShowForceModal(false)}>
              {t("Cancel")}
            </Button>
            <button
              className="btn"
              style={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: " #FFFFFF",
                background: "#2C48AE",
                border: 0,
                outine: 0,
                padding: "10px 16px",
                borderRadius: "9px",
              }}
              onClick={async () => {
                setIsForceStep(true);
                try {
                  await handleForceStart(forcedStep);
                  setShowForceModal(false);
                } catch (error) {
                  console.error("Error while force starting step:", error);
                } finally {
                  setIsForceStep(false);
                }
              }}
            >
              {isForceStep ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                t("Force start anyway")
              )}
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {isModalOpen && (
        <div className="tabs-container container-fluid">
          <div className="new-meeting-modal">
            <StepChart
              meetingId={meeting?.id}
              id={selectedStepId || stepId}
              show={isModalOpen}
              meeting={meeting}
              setId={setSelectedStepId || setStepId}
              closeModal={handleCloseModal}
              key={`step-chart-${stepId}`}
              isDrop={isDrop}
              stepIndex={stepIndex}
              refreshMeeting={refreshMeeting}
            />
          </div>
        </div>
      )}

      {showCopy && (
        <div className="new-meeting-modal tabs-container">
          <StepChart
            meetingId={meeting?.id}
            id={duplicatedStep?.id}
            setId={setStepId}
            show={showCopy}
            closeModal={closeCopyModal}
            meeting={meeting}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            closeStep={refreshMeeting}
            isCopied={true}
          />
        </div>
      )}
    </>
  );
};

export default KanbanBoard;