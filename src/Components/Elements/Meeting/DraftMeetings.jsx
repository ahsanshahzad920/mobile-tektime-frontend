import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Spinner, Card, ProgressBar } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { AiOutlineDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { RiEditBoxLine } from "react-icons/ri";
import NoContent from "./NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { askPermission } from "../../Utils/askPermission";

import { Avatar, Divider, Tooltip } from "antd";
import { useMeetings } from "../../../context/MeetingsContext";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import NewMeetingModal from "./CreateNewMeeting/NewMeetingModal";
import { useFormContext } from "../../../context/CreateMeetingContext";
import debounce from "lodash/debounce";
import { typeIcons } from "../../Utils/MeetingFunctions";
import { convertTo12HourFormat } from "./GetMeeting/Helpers/functionHelper";

const DraftMeetings = ({ setActiveTab, allMeetings }) => {
  const {
    getDraftMeetings,
    isLoading,
    draftLimit,

    draftHasMore,
    setDraftHasMore,
    setDraftOffset,
    draftLoading,
    setAllDraftMeetings,

    draftProgress,
    draftMeetingLength,
    setDraftMeetingLength,
  } = useMeetings();
  const { language } = useDraftMeetings();
  const {
    open,
    handleShow,
    handleCloseModal,
    setCheckId,
    getMeeting,
    meeting,
    setMeeting,
  } = useFormContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const effectRan = React.useRef(false);
  const { setHeaderTitle } = useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const moment = require("moment");
  require("moment/locale/fr");
  const loaderRef = useRef();

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response.status === 200) {
        toast.success(t("draftDeletedToast"));
        setAllDraftMeetings([]);
        setDraftMeetingLength(0);
        setDraftHasMore(true);
        setDraftOffset(0);
        await getDraftMeetings(0);
      } else {
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(t(error.message));
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const viewDraft = async (item) => {
    handleShow();
    setCheckId(item?.id);
    await getMeeting(item.id);
  };

  useEffect(() => {
    return () => {
      effectRan.current = true;
    };
  }, []);

  const formatDate = (dateString) => {
    let color;
    if (!dateString) {
      color = "#92929D";
      return <div style={{ color }}>{t("meeting.todayDate")}</div>;
    }
    let date = language === "en" ? moment(dateString).locale("en-gb") : moment(dateString);
    const today = moment().startOf("day");
    const day = date.format("ddd").toUpperCase();
    const dayNumber = date.format("DD");
    const isToday = date.isSame(today, "day");
    color = isToday ? "#e7796a" : "#92929D";
    return (
      <div style={{ color, fontSize: "24px" }}>
        {day}
        <br />
        {dayNumber}
      </div>
    );
  };

  const formatDateInFrench = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateTotalDays = (steps) => {
    return steps.reduce((total, step) => total + (step.count2 || 0), 0);
  };

  const addDaysToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  function calculateTotalTime(steps) {
    let totalSeconds = 0;
    steps?.forEach((step) => {
      switch (step.time_unit) {
        case "hours": totalSeconds += step.count2 * 3600; break;
        case "minutes": totalSeconds += step.count2 * 60; break;
        case "seconds": totalSeconds += step.count2; break;
      }
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (hrs > 0) result += `${hrs} ${t("time_unit.hours")} `;
    if (mins > 0) result += `${mins} ${t("time_unit.minutes")} `;
    if (secs > 0) result += `${secs} ${t("time_unit.seconds")} `;
    return result.trim();
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !draftHasMore) return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setDraftOffset((prevOffset) => {
          const newOffset = prevOffset + draftLimit;
          getDraftMeetings(newOffset);
          return newOffset;
        });
      }
    };
    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [isLoading, draftHasMore, draftLimit]);

  const loggedInUserId = CookieService.get("user_id");

  const meetingsByMonth = useMemo(() => {
    const meetingsMap = {};
    const sortedMeetings = [...allMeetings];

    sortedMeetings
      ?.filter((meeting) => meeting.status === "draft")
      ?.forEach((item, index) => {
        const startDate = new Date(item.date);
        const totalDays = calculateTotalDays(item?.steps || []);
        const endDate = addDaysToDate(startDate, totalDays);
        const formattedEndDate = formatDateInFrench(endDate);

        const dateLocale = language === "en" ? "en-gb" : "fr";
        const monthName = moment(item.date).locale(dateLocale).format("MMMM");

        if (!meetingsMap[monthName]) meetingsMap[monthName] = [];

        const participantCount = item?.guides?.length || 0;
        const totalTime = calculateTotalTime(item?.steps);
        const date = item?.date ? new Date(item.date) : null;
        let formattedDate = "";

        if (date && !isNaN(date)) {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        } else {
          formattedDate = "N/A";
        }

        const isGoogle = item?.created_from === "Google Calendar" || item?.type === "Google Agenda Event";
        const isOutlook = item?.created_from === "Outlook Calendar" || item?.type === "Outlook Agenda Event";
        const missionTitle = item?.objective || (isGoogle ? "Google" : isOutlook ? "Outlook" : "—");
        const initials = (item?.objective || item?.title || "M").substring(0, 2).toUpperCase();
        const logo = item?.destination?.clients?.client_logo || item?.solution?.logo || item?.destination?.logo;
        const solutionTitle = item?.solution ? item?.solution?.title : (isGoogle ? "Google" : isOutlook ? "Outlook" : item?.type || "Réunion");
        const startTime = convertTo12HourFormat(item?.starts_at || item?.start_time, item?.date, item?.steps, item?.timezone);

        meetingsMap[monthName].push(
          <Card
            className="mt-3 mb-2 draft-card"
            key={index}
            onClick={() => viewDraft(item)}
          >
            {/* Mobile Card Layout */}
            <div className="mobile-only premium-mobile-card">
              <div className="smc-top">
                {/* Thumbnail */}
                <div className="smc-thumb" style={{ background: isGoogle ? '#fde6e9' : isOutlook ? '#e0e7ff' : '#f1f5f9' }}>
                  {logo ? (
                    <img src={logo.startsWith('http') ? logo : `${Assets_URL}/${logo}`} alt="logo" />
                  ) : (
                    <span className="smc-initials" style={{ color: isGoogle ? '#ef4444' : isOutlook ? '#3b82f6' : '#64748b' }}>{initials}</span>
                  )}
                </div>

                {/* Body */}
                <div className="smc-body">
                  <div className="smc-title">
                    {item.title}
                    <span className="smc-badge draft">{t("badge.draft")}</span>
                  </div>
                  <div className="smc-desc">{missionTitle || "—"}</div>
                  <div className="smc-meta">{formattedDate}{startTime ? ` • ${startTime}` : ''}</div>
                </div>
              </div>

              {/* Bottom action row */}
              <div className="smc-actions" onClick={e => e.stopPropagation()}>
                <div className="smc-icon-group">
                  {/* More (kebab) */}
                  <div className="dropdown">
                    <button className="smc-icon-btn" type="button" onClick={(e) => { e.stopPropagation(); toggleDropdown(item.id); }}>
                      <BiDotsVerticalRounded size="20px" />
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end mobile-dropdown-menu ${openDropdownId === item.id ? 'show' : ''}`}>
                      <li>
                        <a className="dropdown-item d-flex align-items-center gap-2 py-3" onClick={() => viewDraft(item)}>
                          <RiEditBoxLine size="19px" /> 
                          <span>{t("dropdown.Modify")}</span>
                        </a>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <a className="dropdown-item d-flex align-items-center gap-2 py-3 text-danger" onClick={(e) => handleDeleteClick(e, item.id)}>
                          <AiOutlineDelete size="19px" /> 
                          <span>{t("dropdown.Delete")}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* View/Edit button */}
                <button
                  className="smc-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewDraft(item);
                  }}
                >
                  <RiEditBoxLine size="20px" />
                </button>
              </div>
            </div>

            <div className="desktop-only row">
              <div className="col-md-1 column-1">{formatDate(item.date)}</div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="destination"> {item?.objective}</h6>
                    <span className="heading">{item.title}</span>
                    {item.status === "draft" && (
                      <span className="badge ms-2" style={{ padding: "3px 8px", background: "rgb(228 228 233)", color: "gray" }}>
                        {t("badge.draft")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z" stroke="#92929D" stroke-miterlimit="10"/>
                      <path d="M8.14258 4.5V9H11.1426" stroke="#92929D" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span className="time">
                      {formattedDate} &nbsp; {item?.start_time && "at"} &nbsp;
                      {convertTo12HourFormat(item?.starts_at || item?.start_time, item?.date, item?.steps, item?.timezone)}
                      {totalTime && ` (${totalTime}) `}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z" fill="#8590A3"/>
                    </svg>
                    <span className="time">{item?.solution ? item?.solution?.title : item?.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      });
    return meetingsMap;
  }, [allMeetings, language, loggedInUserId, t, openDropdownId]);

  return (
    <div className="scheduled">
      <div className="my-2 container-fluid p-0">
        {draftMeetingLength === 0 && draftHasMore ? (
          <div className="progress-overlay" style={{ background: "transparent" }}>
            <div style={{ width: "50%" }}><ProgressBar now={draftProgress} animated /></div>
          </div>
        ) : (
          <>
            {allMeetings?.filter(m => m.status === 'draft').length === 0 ? (
              <NoContent title="Draft Meetings" />
            ) : (
              <>
                {Object.entries(meetingsByMonth).map(([month, meetings]) => (
                  <React.Fragment key={month}>
                    <span className="month">{month === "Invalid date" ? t("meeting.todayDate") : month}</span>
                    {meetings}
                  </React.Fragment>
                ))}
                <div ref={loaderRef} className="text-center my-4">
                  {isLoading && draftHasMore && <Spinner animation="border" role="status" />}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showConfirmationModal && (
        <ConfirmationModal
          message={t("meetingDeletedToast")}
          onConfirm={(e) => confirmDelete(e)}
          onCancel={(e) => { e.stopPropagation(); setShowConfirmationModal(false); }}
        />
      )}

      {open && (
        <NewMeetingModal
          meeting={meeting}
          open={open}
          closeModal={handleCloseModal}
          setMeeting={setMeeting}
        />
      )}

      <style>
        {`
          @media (max-width: 768px) {
            .draft-card {
              border: none !important;
              background: #fff !important;
              border-radius: 20px !important;
              padding: 0 !important;
              margin-bottom: 12px !important;
              box-shadow: 0 4px 15px rgba(0,0,0,0.06) !important;
              border: 1px solid #f1f5f9 !important;
              overflow: visible !important;
            }
            .premium-mobile-card { padding: 16px 16px 12px; position: relative; border-bottom: 1px solid #f1f5f9; }
            .smc-top { display: flex; gap: 14px; align-items: flex-start; }
            .smc-thumb { flex-shrink: 0; width: 68px; height: 68px; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .smc-thumb img { width: 100%; height: 100%; object-fit: cover; }
            .smc-initials { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
            .smc-body { flex: 1; min-width: 0; }
            .smc-title { font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 4px; }
            .smc-desc { font-size: 12px; color: #64748b; line-height: 1.45; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 5px; }
            .smc-meta { font-size: 11.5px; color: #94a3b8; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .smc-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 5px; margin-left: 6px; vertical-align: middle; }
            .smc-badge.draft { background: rgb(228, 228, 233); color: gray; }
            .smc-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-left: 82px; }
            .smc-icon-group { display: flex; align-items: center; gap: 4px; }
            .smc-icon-btn { background: transparent; border: none; color: #94a3b8; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: color 0.15s, background 0.15s; }
            .smc-icon-btn:active { background: #f1f5f9; color: #475569; }
            .smc-play-btn { width: 44px; height: 44px; border-radius: 50%; background: #0f172a; border: none; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; transition: transform 0.15s, background 0.15s; }
            .smc-play-btn:active { transform: scale(0.93); }
            .mobile-dropdown-menu { border-radius: 16px !important; padding: 10px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important; border: 1px solid #f1f5f9 !important; margin-top: 8px !important; }
            .mobile-dropdown-menu .dropdown-item { border-radius: 10px; font-size: 14px; font-weight: 600; }
            .mobile-dropdown-menu .dropdown-divider { margin: 8px 0; opacity: 0.5; }
            .desktop-only { display: none !important; }
          }
          @media (min-width: 769px) { .mobile-only { display: none !important; } }
        `}
      </style>
    </div>
  );
};

export default DraftMeetings;
