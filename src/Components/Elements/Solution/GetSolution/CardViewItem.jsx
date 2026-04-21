/* CardViewItem.jsx */
import React from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiEditBoxLine } from "react-icons/ri";
import { IoCopyOutline } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import { typeIcons } from "./../../../Utils/MeetingFunctions";
import { API_BASE_URL, Assets_URL } from "./../../../Apicongfig";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdMeetingRoom, MdPublic, MdLock, MdGroups, MdBusiness } from "react-icons/md";
import { SiGooglemeet, SiMicrosoftteams } from "react-icons/si";
import "./CardViewItem.scss";

import { Avatar, Tooltip } from "antd";

const CardViewItem = ({
  item,
  onView,
  onEdit,
  onCopy,
  onDelete,
  t,
  openDropdownId,
  toggleDropdown,
}) => {
  // Total time calculation
  const calculateTotalTime = (steps) => {
    if (!steps) return "0 min";
    let totalSeconds = 0;
    steps.forEach((step) => {
      switch (step.time_unit) {
        case "days":
          totalSeconds += step.count2 * 86400;
          break;
        case "hours":
          totalSeconds += step.count2 * 3600;
          break;
        case "minutes":
          totalSeconds += step.count2 * 60;
          break;
        case "seconds":
          totalSeconds += step.count2;
          break;
      }
    });

    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      return `${days} ${days > 1 ? t("days") : t("day")}`;
    }

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }

    return `${mins}m`;
  };

  const totalTime = calculateTotalTime(item?.solution_steps);

  // Random image using Lorem Picsum
  const randomId = Math.floor(Math.random() * 1000);
  const randomImage = `https://picsum.photos/400/300?random=${randomId}`;

  // Sanitize and render HTML description
  const renderDescription = () => {
    if (!item?.description) return <p className="text-muted">No description</p>;

    return (
      <div
        className="html-description"
        dangerouslySetInnerHTML={{ __html: item.description }}
      />
    );
  };

  return (
    <div
      className="solution-card-wrapper"
      onClick={() => onView(item)}
      style={{ cursor: "pointer" }}
    >
      <div className="solution-card">

        {/* === 1. TOP: Full Random Image === */}
        <div className="card-image">
          <img src={item?.logo || randomImage} alt={item.title} />
          <div className="time-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                stroke="white"
                strokeMiterlimit="10"
              />
              <path d="M8.14258 4.5V9H11.1426" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{totalTime}</span>
          </div>
        </div>

        {/* === 2. MIDDLE: Title === */}
        <div className="card-title text-center">
          <h5>{item.title}</h5>
        </div>

        {/* === 3. BOTTOM: HTML Description + Icons === */}
        <div className="card-bottom">
          <div className="card-description">
            {item?.description && renderDescription()}

          </div>

          <div className="card-icons">
            {/* Type Icon */}
            <div className="type-icon" style={{ fontSize: "20px" }}>
              {typeIcons[item?.type] || "?"}
            </div>

            {/* Usage Count */}
            {item?.solution_used_count !== undefined && (
              <div className="usage-count mx-2 d-flex align-items-center text-muted" style={{ fontSize: "0.85rem" }}>
                <span className="me-1">{item.solution_used_count}</span>
                <span>{item.solution_used_count > 1 ? t("multipleTime") || "uses" : t("oneTime") || "use"}</span>
              </div>
            )}


            <div className="privacy-badge">
              <span
                className={`badge ${item?.solution_privacy === "private"
                  ? "solution-badge-red"
                  : item?.solution_privacy === "public"
                    ? "solution-badge-green"
                    : item?.solution_privacy === "enterprise" ||
                      item?.solution_privacy === "participant only"
                      ? "solution-badge-blue"
                      : "solution-badge-yellow"
                  }`}
              >
                {item?.solution_privacy === "private"
                  ? t("solution.badge.private")
                  : item?.solution_privacy === "public"
                    ? t("solution.badge.public")
                    : item?.solution_privacy === "enterprise"
                      ? t("solution.badge.enterprise")
                      : item?.solution_privacy === "participant only"
                        ? t("solution.badge.participantOnly")
                        : t("solution.badge.team")}
              </span>
            </div>
          </div>
        </div>

        {/* 3-dot Menu */}
        <div className="card-menu" onClick={(e) => e.stopPropagation()}>
          <button
            className="menu-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleDropdown(item.id);
            }}
          >
            <BiDotsVerticalRounded size={20} />
          </button>

          {/* Dropdown */}
          {openDropdownId === item.id && (
            <ul className="dropdown-menu show"> {/* Add 'show' class */}
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                  toggleDropdown(null); // optional: close after action
                }}
              >
                <RiEditBoxLine size={16} /> {t("dropdown.To modify")}
              </li>
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(item);
                  toggleDropdown(null);
                }}
              >
                <IoCopyOutline size={16} /> {t("dropdown.Duplicate")}
              </li>
              <hr />
              <li
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e, item.id);
                  toggleDropdown(null);
                }}
              >
                <AiOutlineDelete size={16} /> {t("dropdown.Delete")}
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardViewItem;