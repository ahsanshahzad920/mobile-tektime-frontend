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

// >==============================> For Sorting <================================<

// >==============================> F.C <================================<

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
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const moment = require("moment");
  require("moment/locale/fr");
  const loaderRef = useRef();


  //Delete Meeting
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
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

  const sortedMeetings = [...allMeetings];
  //-----------------------------------------------------------------------------------

  const formatDate = (dateString) => {
    let color;
    let fontSize;
    if (!dateString) {
      color = "#92929D";

      return <div style={{ color }}>{t("meeting.todayDate")}</div>;
    }
    // const date = moment(dateString);
    // const date = moment(dateString).locale("en-gb"); // Set locale to English
    let date;
    if (language === "en") {
      date = moment(dateString).locale("en-gb"); // Set locale to English
    } else {
      date = moment(dateString); // Set into french
    }
    const today = moment().startOf("day"); // Get today date

    const day = date.format("ddd").toUpperCase();
    const dayNumber = date.format("DD");

    // Compare if the date is today
    const isToday = date.isSame(today, "day");

    // Determine the color based on whether it's today or not
    color = isToday ? "#e7796a" : "#92929D";
    fontSize = "24px";
    return (
      <div style={{ color, fontSize }}>
        {day}
        <br />
        {dayNumber}
      </div>
    );
  };
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDateInFrench = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const calculateTotalDays = (steps) => {
    return steps.reduce((total, step) => {
      return total + step.count2;
    }, 0);
  };

  const addDaysToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // const convertTo12HourFormat = (time, steps) => {
  //   if (!time || !steps) {
  //     return;
  //   }
  //   const hasSeconds = steps.some((step) => step.time_unit === "seconds");
  //   let [hour, minute, second] = time.split(":").map(Number);
  //   minute = minute.toString().padStart(2, "0");

  //   second = second.toString().padStart(2, "0");

  //   const endTime = hasSeconds
  //     ? `${hour}h${minute}m${second}`
  //     : `${hour}h${minute}`;

  //   return endTime;
  // };
  function calculateTotalTime(steps) {
    let totalSeconds = 0;
    steps.forEach((step) => {
      switch (step.time_unit) {
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

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (hrs > 0) {
      result += `${hrs} ${t("hours")} `;
    }
    if (mins > 0) {
      result += `${mins} mins `;
    }
    if (secs > 0) {
      result += `${secs} secs`;
    }
    return result.trim();
  }

 useEffect(() => {
  const handleScroll = () => {
    if (isLoading || !draftHasMore) return;

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100
    ) {
      console.log("Reached bottom, fetching more meetings...");
      setDraftOffset((prevOffset) => {
        const newOffset = prevOffset + draftLimit;
        getDraftMeetings(newOffset); // Pass the new offset directly
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

    allMeetings
      ?.filter((meeting) => meeting.status === "draft")
      ?.forEach((item, index) => {
        const startDate = new Date(item.date);
        const totalDays = calculateTotalDays(item?.steps);
        const endDate = addDaysToDate(startDate, totalDays);
        const formattedEndDate = formatDateInFrench(endDate);

        const dateLocale = language === "en" ? "en-gb" : "fr";
        const monthName = moment(item.date).locale(dateLocale).format("MMMM");

        // Initialize the month array if it doesn't exist
        if (!meetingsMap[monthName]) {
          meetingsMap[monthName] = [];
        }

        const participantCount = item?.guides?.length || 0;
        const totalTime = calculateTotalTime(item?.steps);
        const date = item?.date ? new Date(item.date) : null;
        let formattedDate;

        if (date && !isNaN(date)) {
          // Get individual components of the date
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
          const year = date.getFullYear();

          // Format the date in dd:mm:yyyy
          formattedDate = `${day}/${month}/${year}`;
        } else {
          // Handle the case where date is not available or invalid
          formattedDate = "N/A"; // or just leave it as undefined if you don't want to show anything
        }

        meetingsMap[monthName].push(
          <Card
            className="mt-3 mb-2"
            key={index}
            onClick={() => {
              viewDraft(item);
            }}
          >
            <div className="row">
              <div className="col-md-1 column-1">{formatDate(item.date)}</div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="destination"> {item?.objective}</h6>

                    <span className="heading">{item.title}</span>
                    {item.status === "draft" && (
                      <span
                        className={`badge ms-2 `}
                        style={{
                          padding: "3px 8px 3px 8px",
                          background: "rgb(228 228 233)",
                          color: "gray",
                        }}
                      >
                        {t("badge.draft")}
                      </span>
                    )}
                    {/* <h6 className="destination"> {item?.objective}</h6> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                        stroke="#92929D"
                        stroke-miterlimit="10"
                      />
                      <path
                        d="M8.14258 4.5V9H11.1426"
                        stroke="#92929D"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    {item.type === "Action" || item?.type === "Newsletter" ? (
                      <span className="time">
                        {formatDateInFrench(item.date)} - {formattedEndDate}{" "}
                        {`(${totalDays} ${t("time_unit.days")})`}
                      </span>
                    ) : (
                      <span className="time">
                        {formattedDate}
                        &nbsp;
                        {item?.start_time && "at"}
                        &nbsp;
                        {convertTo12HourFormat(
                          item?.starts_at || item?.start_time,
                          item?.date,
                          item?.steps,
                          item?.timezone
                        )}
                        {totalTime && ` (${totalTime}) `}
                      </span>
                    )}
                  </div>
                  <div className="col-md-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                        fill="#8590A3"
                      />
                    </svg>
                    {/* <span className="time">{item?.type}</span> */}
                    <span className="time">
                      {item?.solution ? item?.solution?.title : item?.type}
                    </span>
                  </div>
                  {/* <div className="col-md-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.346 6.79075C12.3618 6.77463 12.3808 6.76199 12.4018 6.75362C12.4228 6.74526 12.4453 6.74137 12.4679 6.74218C12.4905 6.743 12.5126 6.74851 12.533 6.75836C12.5533 6.76821 12.5714 6.78219 12.586 6.79941C13.4616 7.83748 13.9592 9.1419 13.9973 10.4994C13.9978 10.5213 13.9938 10.543 13.9857 10.5633C13.9776 10.5835 13.9656 10.602 13.9502 10.6175C13.9349 10.6331 13.9165 10.6454 13.8964 10.6537C13.8762 10.6621 13.8545 10.6663 13.8327 10.6661H10.8293C10.7849 10.6653 10.7424 10.6476 10.7104 10.6167C10.6785 10.5857 10.6595 10.5438 10.6573 10.4994C10.627 10.0165 10.4657 9.5509 10.1907 9.15275C10.167 9.11952 10.1557 9.07907 10.1588 9.0384C10.1618 8.99773 10.179 8.95941 10.2073 8.93008L12.346 6.79075ZM11.866 6.07941C11.9393 6.14075 11.9427 6.25141 11.8753 6.31941L9.73532 8.45875C9.70603 8.48691 9.66784 8.50399 9.62732 8.50703C9.5868 8.51007 9.54649 8.49889 9.51332 8.47541C9.20249 8.26075 8.84958 8.11463 8.47799 8.04675C8.43781 8.03991 8.4013 8.01924 8.37475 7.98831C8.34821 7.95739 8.33332 7.91816 8.33265 7.87741V4.85208C8.33265 4.75608 8.41265 4.68008 8.50865 4.68808C9.74476 4.79382 10.9177 5.27947 11.866 6.07941ZM7.66599 4.85275C7.66625 4.8301 7.66178 4.80765 7.65287 4.78684C7.64395 4.76602 7.63079 4.74729 7.61423 4.73186C7.59766 4.71642 7.57805 4.70461 7.55666 4.69719C7.53526 4.68976 7.51256 4.68689 7.48999 4.68875C6.25395 4.7943 5.08102 5.28038 4.13265 6.08008C4.11544 6.09471 4.10146 6.11276 4.0916 6.1331C4.08175 6.15343 4.07624 6.17559 4.07542 6.19817C4.07461 6.22075 4.0785 6.24325 4.08687 6.26424C4.09523 6.28523 4.10787 6.30424 4.12399 6.32008L6.26399 8.45941C6.29315 8.48781 6.33137 8.50505 6.37196 8.5081C6.41255 8.51114 6.45292 8.49981 6.48599 8.47608C6.7968 8.2614 7.14972 8.11528 7.52132 8.04741C7.56149 8.04057 7.59801 8.0199 7.62455 7.98898C7.65109 7.95806 7.66599 7.91883 7.66665 7.87808L7.66599 4.85275ZM5.80865 9.15275C5.83205 9.11951 5.84311 9.07915 5.83995 9.03862C5.83679 8.9981 5.81959 8.95995 5.79132 8.93075L3.65199 6.79075C3.63611 6.77467 3.61705 6.76207 3.59604 6.75377C3.57502 6.74546 3.55251 6.74163 3.52993 6.74251C3.50735 6.74338 3.4852 6.74896 3.46489 6.75887C3.44459 6.76878 3.42657 6.78282 3.41199 6.80008C2.53685 7.83833 2.03977 9.14273 2.00199 10.5001C2.00154 10.5219 2.00546 10.5435 2.01351 10.5638C2.02156 10.584 2.03358 10.6024 2.04886 10.618C2.06415 10.6335 2.08238 10.6458 2.1025 10.6542C2.12261 10.6626 2.1442 10.6668 2.16599 10.6667H5.16932C5.26132 10.6667 5.33599 10.5927 5.34132 10.5001C5.37132 10.0154 5.53465 9.54941 5.80799 9.15341"
                        fill="#8590A3"
                        fill-opacity="0.25"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.33203 7.87077C8.33203 7.95477 8.3947 8.02477 8.47737 8.0401C8.85073 8.10802 9.20529 8.25485 9.51737 8.47077C9.55067 8.49434 9.59116 8.50551 9.63183 8.50234C9.67251 8.49918 9.71079 8.48187 9.74004 8.45344L12.3467 5.84677C12.3628 5.83102 12.3756 5.8121 12.384 5.79119C12.3925 5.77029 12.3966 5.74786 12.3959 5.72531C12.3953 5.70276 12.39 5.68059 12.3804 5.66019C12.3708 5.63979 12.357 5.6216 12.34 5.60677C11.2636 4.6834 9.92079 4.12735 8.5067 4.01944C8.48426 4.01788 8.46174 4.02097 8.44055 4.02851C8.41936 4.03606 8.39996 4.04791 8.38356 4.0633C8.36717 4.0787 8.35412 4.09732 8.34526 4.11799C8.33639 4.13866 8.33189 4.16094 8.33203 4.18344V7.87077Z"
                        fill="#8590A3"
                      />
                    </svg>
                    <span className="time">{t(`meeting.newMeeting.options.priorities.${item?.priority}`)}</span>
                  </div> */}
                </div>
                <div className="row my-2">
                  <div className="col-md-4 mt-2">
                    <div className="col-md-4 creator">{t("Creator")}</div>
                    <div>
                      {/* <Avatar src={Assets_URL + "/" + item?.user.image} /> */}
                      <Tooltip title={item?.user?.full_name} placement="top">
                        <Avatar
                          src={
                            item?.user?.image.startsWith("users/")
                              ? Assets_URL + "/" + item?.user?.image
                              : item?.user?.image
                          }
                        />
                      </Tooltip>

                      <span className="creator-name">
                        {/* {item?.user?.name
                        ? item?.user?.name
                        : "" + item?.user?.last_name
                        ? item?.user?.last_name
                        : ""} */}
                        {item?.user?.full_name}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4 mt-2">
                    {participantCount > 0 && (
                      <div className="creator">{`${participantCount > 1 ? t("presentors") : t("presentor")
                        }`}</div>
                    )}
                    <div className="d-flex align-items-center flex-wrap">
                      <Avatar.Group>
                        {item?.guides?.map((item) => {

                          return (
                            <>
                              <Tooltip
                                title={
                                  item?.first_name
                                    ? item?.first_name
                                    : " " + " " + item.last_name
                                      ? item.last_name
                                      : " "
                                }
                                placement="top"
                              >
                                <Avatar
                                  size="large"
                                  // src={item?.participant_image}
                                  src={
                                    item.participant_image.startsWith("users/")
                                      ? Assets_URL +
                                      "/" +
                                      item.participant_image
                                      : item.participant_image
                                  }
                                />
                              </Tooltip>
                            </>
                          );
                        })}
                      </Avatar.Group>
                      <span
                        style={{
                          marginLeft: participantCount > 0 ? "8px" : "0px",
                        }}
                      >
                        {/* {participantCount > 0 ? participantCount : "No"} {t("presentor")} */}
                        {participantCount > 0
                          ? `${participantCount} ${t("presentor")}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  {item?.type && item?.moment_privacy && (
                     <div className="col-md-4 mt-2">
                                     {/* {selectedAgenda !== "google" && ( */}
                                     <>
                                       <div className="creator">{t("Privacy")}</div>
                                       <div className="">
                                         <div className="d-flex align-items-center flex-wrap">
                                           {item?.moment_privacy === "public" ? (
                                             <Avatar
                                               src="/Assets/Tek.png"
                                               style={{ borderRadius: "0" }}
                                             />
                                           ) : item?.moment_privacy === "team" ? (
                                             <Avatar.Group>
                                               {item?.moment_privacy_teams_data?.map((item) => {
                                                 return (
                                                   <>
                                                     <Tooltip title={item?.name} placement="top">
                                                       <Avatar
                                                         size="large"
                                                         src={
                                                           item?.logo?.startsWith("http")
                                                             ? item.logo
                                                             : Assets_URL + "/" + item.logo
                                                         }
                                                       />
                                                     </Tooltip>
                                                   </>
                                                 );
                                               })}
                                             </Avatar.Group>
                                           ) : item?.moment_privacy === "participant only" ? (
                                             <Avatar.Group>
                                               {item?.user_with_participants?.map((item) => {
                                                 return (
                                                   <>
                                                     <Tooltip
                                                       title={item?.full_name}
                                                       placement="top"
                                                     >
                                                       <Avatar
                                                         size="large"
                                                         src={
                                                           item?.participant_image?.startsWith(
                                                             "http"
                                                           )
                                                             ? item.participant_image
                                                             : Assets_URL +
                                                               "/" +
                                                               item.participant_image
                                                         }
                                                       />
                                                     </Tooltip>
                                                   </>
                                                 );
                                               })}
                                             </Avatar.Group>
                                           ) : item?.moment_privacy === "tektime members" ? (
                                             <img
                                               src={
                                                 item?.user?.enterprise?.logo?.startsWith("http")
                                                   ? item?.user?.enterprise?.logo
                                                   : Assets_URL +
                                                     "/" +
                                                     item?.user?.enterprise?.logo
                                               }
                                               alt="Logo"
                                               style={{
                                                 width: "30px",
                                                 height: "30px",
                                                 objectFit: "fill",
                                                 borderRadius: "50%",
                                               }}
                                             /> // <Tooltip
                                           ) : //   title={item?.user?.enterprise?.name}
                                           //   placement="top"
                                           // >
                                           //   <img
                                           //     src={
                                           //       item?.user?.enterprise?.logo?.startsWith(
                                           //         "http"
                                           //       )
                                           //         ? item?.user?.enterprise?.logo
                                           //         : Assets_URL +
                                           //           "/" +
                                           //           item?.user?.enterprise?.logo
                                           //     }
                                           //     alt="Logo"
                                           //     style={{
                                           //       width: "30px",
                                           //       height: "30px",
                                           //       objectFit: "fill",
                                           //       borderRadius: "50%",
                                           //     }}
                                           //   />
                                           // </Tooltip>
                                           item?.moment_privacy === "enterprise" ? (
                                             <Tooltip
                                               title={item?.user?.enterprise?.name}
                                               placement="top"
                                             >
                                               <img
                                                 src={
                                                   item?.user?.enterprise?.logo?.startsWith("http")
                                                     ? item?.user?.enterprise?.logo
                                                     : Assets_URL +
                                                       "/" +
                                                       item?.user?.enterprise?.logo
                                                 }
                                                 alt="Logo"
                                                 style={{
                                                   width: "30px",
                                                   height: "30px",
                                                   objectFit: "fill",
                                                   borderRadius: "50%",
                                                 }}
                                               />
                                             </Tooltip>
                                           ) : item?.moment_privacy === "password" ? (
                                             <svg
                                               width="37px"
                                               height="36px"
                                               viewBox="0 0 24 24"
                                               fill="none"
                                               xmlns="http://www.w3.org/2000/svg"
                                             >
                                               <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                               <g
                                                 id="SVGRepo_tracerCarrier"
                                                 stroke-linecap="round"
                                                 stroke-linejoin="round"
                                               ></g>
                                               <g id="SVGRepo_iconCarrier">
                                                 {" "}
                                                 <path
                                                   d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                                   stroke="#000000"
                                                   stroke-width="2"
                                                   stroke-linecap="round"
                                                   stroke-linejoin="round"
                                                 ></path>{" "}
                                               </g>
                                             </svg>
                                           ) : (
                                             <Tooltip
                                               title={item?.user?.full_name}
                                               placement="top"
                                             >
                                               <Avatar
                                                 src={
                                                   item?.user?.image.startsWith("users/")
                                                     ? Assets_URL + "/" + item?.user?.image
                                                     : item?.user?.image
                                                 }
                                               />
                                             </Tooltip>
                                           )}
                   
                                           <span
                                             className={`badge ms-2 ${
                                               item?.moment_privacy === "private"
                                                 ? "solution-badge-red"
                                                 : item?.moment_privacy === "public"
                                                 ? "solution-badge-green"
                                                 : item?.moment_privacy === "enterprise" ||
                                                   item?.moment_privacy === "participant only" ||
                                                   item?.moment_privacy === "tektime members"
                                                 ? "solution-badge-blue"
                                                 : item?.moment_privacy === "password"
                                                 ? "solution-badge-red"
                                                 : "solution-badge-yellow"
                                             }`}
                                             style={{ padding: "3px 8px 3px 8px" }}
                                           >
                                             {item?.moment_privacy === "private"
                                               ? t("solution.badge.private")
                                               : item?.moment_privacy === "public"
                                               ? t("solution.badge.public")
                                               : item?.moment_privacy === "enterprise"
                                               ? t("solution.badge.enterprise")
                                               : item?.moment_privacy === "participant only"
                                               ? t("solution.badge.participantOnly")
                                               : item?.moment_privacy === "tektime members"
                                               ? t("solution.badge.membersOnly")
                                               : item?.moment_privacy === "password"
                                               ? t("solution.badge.password")
                                               : t("solution.badge.team")}
                                           </span>
                                         </div>
                                       </div>
                                     </>
                   
                                     {/* )} */}
                                   </div>
                  )}
                </div>
              </div>
              <div className="col-md-1 d-flex justify-content-end">
                <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
                  {item.status === "draft" && (
                    <>
                      <div className="dropdown dropstart">
                        <button
                          className="btn btn-secondary"
                          type="button"
                          data-bs-toggle="dropdown"
                          // aria-expanded="false"
                          aria-expanded={openDropdownId === item.id}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            padding: "0px",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(item.id);
                          }}
                        >
                          <BiDotsVerticalRounded color="black" size={"25px"} />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                // setHeaderTitle([
                                //   {
                                //     titleText: t("header.modification"),
                                //     link: `/meeting`,
                                //   },
                                //   {
                                //     titleText: `${item.title}`,
                                //     link: `/draft/${item?.id}`,
                                //   },
                                // ]);
                                e.stopPropagation();
                                viewDraft(item);
                              }}
                            >
                              <IoEyeOutline size={"20px"} /> &nbsp;
                              {t("dropdown.draft")}
                            </a>
                          </li>
                          <hr
                            style={{ margin: "10px 0 0 0", padding: "2px" }}
                          />

                          <li>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer", color: "red" }}
                              // onClick={(e) => {
                              //   e.stopPropagation();
                              //   handleDelete(item.id);
                              // }}
                              onClick={(e) => handleDeleteClick(e, item.id)}
                            >
                              <AiOutlineDelete size={"20px"} color="red" />
                              &nbsp; {t("dropdown.Delete")}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      });

    return meetingsMap;
  }, [allMeetings, language, loggedInUserId, t]);
  
  return (
          <>
            <div className="scheduled">
              <div className="my-2 container-fluid">
                {draftMeetingLength === 0 && draftHasMore ? (
                  <div
                    className="progress-overlay"
                    style={{ background: "transparent" }}
                  >
                    <div style={{ width: "50%" }}>
                      <ProgressBar now={draftProgress} animated />
                    </div>
                  </div>
                ) : (
                  <>
                    {sortedMeetings?.length === 0 ? (
                      <NoContent title="Draft Meetings" />
                    ) : (
                      <>
                        {Object.entries(meetingsByMonth).map(([month, meetings]) => (
                          <>
                            <span className="month">
                              {month === "Invalid date"
                                ? t("meeting.todayDate")
                                : month}
                            </span>
                            {meetings}
                          </>
                        ))}
                        <div ref={loaderRef} className="text-center my-4">
                          {isLoading &&
                            allMeetings?.filter((meeting) => meeting.status === "draft")
                              ?.length > 0 &&
                            draftHasMore && (
                              <Spinner animation="border" role="status" />
                            )}
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* {sortedMeetings?.length === 0 && !draftLoading ? (
          <NoContent title="Draft Meeting" />
        ) : sortedMeetings?.length > 0 ? (
          <>
            {Object.entries(meetingsByMonth).map(([month, meetings]) => (
              <>
                <span className="month">
                  {month === "Invalid date" ? t("meeting.todayDate") : month}
                </span>
                {meetings}
              </>
            ))}
              <div ref={loaderRef} className="text-center my-4">
                                          {isLoading &&
                                            allMeetings?.filter(
                                              (meeting) => meeting.status === "draft"
                                            )?.length > 0 &&
                                            draftHasMore && (
                                              <Spinner animation="border" role="status" />
                                            )}
                                        </div>
          </>
        ) : (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        )} */}
              </div>

              {showConfirmationModal && (
                <ConfirmationModal
                  message={t("meetingDeletedToast")}
                  onConfirm={(e) => confirmDelete(e)}
                  onCancel={(e) => {
                    e.stopPropagation();
                    setShowConfirmationModal(false);
                  }}
                />
              )}

              {open && (
                <>
                  <NewMeetingModal
                    meeting={meeting}
                    open={open}
                    closeModal={handleCloseModal}
                    setMeeting={setMeeting}
                  />
                </>
              )}
            </div>
          </>
         
   
  );
};

export default DraftMeetings;
