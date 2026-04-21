import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Spinner, Card, ProgressBar } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { AiOutlineDelete } from "react-icons/ai";
import { MdContentCopy, MdInsertLink } from "react-icons/md";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import NoContent from "./NoContent";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { Avatar, Tooltip } from "antd";
import { IoEyeOutline } from "react-icons/io5";
import {
  RiEditBoxLine,
  RiMailSendLine,
  RiPresentationFill,
} from "react-icons/ri";
import { useMeetings } from "../../../context/MeetingsContext";
import { useDraftMeetings } from "../../../context/DraftMeetingContext";
import copy from "copy-to-clipboard";
import { openLinkInNewTab } from "../../Utils/openLinkInNewTab";
import "moment/locale/fr"; // Import the French locale
import axios from "axios";
import { abortMeetingTime, formatStepDate } from "../../Utils/MeetingFunctions";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { FaStar } from "react-icons/fa";
import {
  convertDateToUserTimezone,
  convertTo12HourFormat,
  timezoneSymbols,
} from "./GetMeeting/Helpers/functionHelper";

const CompletedMeetings = ({
  allClosedMeetings,
  calendar,
  activeTab,
  type,
  pageNo,
  setPageNo,
  fetchCounts,
  viewMode = "card",
}) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    handleShow,
    setMeeting,
    setFormState,
    setIsDuplicate,
    setCheckId,
    setChangePrivacy,
  } = useFormContext();

  const {
    getClosedMeetings,
    closedHasMore,

    setAllClosedMeetings,

    closedProgress,
    closedMeetingLength,
    setClosedMeetingLength,
    closedLoading,
    closedPerPage,
    closedMeetingCount,
  } = useMeetings();

  const { searchTerm, setSearchTerm } = useOutletContext();
  const { language } = useDraftMeetings();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const effectRan = React.useRef(false);
  const { setHeaderTitle } = useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const moment = require("moment");
  require("moment/locale/fr");

  useEffect(() => {
    setSearchTerm("");
  }, []);
  const handleDelete = async (dataId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${dataId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (!response.ok) {
        toast.error("Impossible d'obtenir une réponse");
      } else {
        toast.success(t("meetingDeletedSuccessfullToast"));
        setAllClosedMeetings([]);
        setClosedMeetingLength(0);
        // setClosedHasMore(true);
        // setClosedOffset(0);
        fetchCounts();
        await getClosedMeetings(type, 1);
      }
    } catch (error) {
      // console.log("Error deleting data:", error);
    } finally {
      setFormState({});
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

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  const loadMoreMeetings = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      await getClosedMeetings(type, pageNo + 1); // 👈 API call with next page
      setPageNo((prev) => prev + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const lastMeetingRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && closedHasMore) {
          loadMoreMeetings();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, closedHasMore],
  );


  const handleCopy = async (item) => {
    try {
      // Parse the start time string
      const [hour, minute] = item?.start_time?.split(":").map(Number);

      // Add one hour to the hour component
      let endHour = hour + 1;

      // If end hour is greater than or equal to 24, subtract 24
      if (endHour >= 24) {
        endHour -= 24;
      }

      // Format the end time as a string
      const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`;
      // Prepare the steps array with null values for specific fields
      const updatedSteps = item?.steps?.map((step) => ({
        ...step,
        end_time: null,
        current_time: null,
        current_date: null,
        end_date: null,
        step_status: null,
        status: "active",
        delay: null,
        time_seconds: null,
        savedTime: null,
        decision: null,
        plan_d_actions: null,
        savedTime: null,
        note: item?.type === "Law" ? step?.note : null,
        original_note: null,
        time_taken: null,
        negative_time: 0,
        new_current_time: null,
        new_current_date: null,
        assigned_to_name: null,
        sent: 0,
        summary_status: false,
        pause_date_time: null,
        pause_time_in_sec: null,
        work_time: null,
      }));
      const postData = {
        ...item,
        steps: updatedSteps,
        client_id: item?.destination?.client_id,
        transcript_job_id: null,
        _method: "put",
        duplicate: true,
        status: "active",
        delay: null,
        plan_d_actions: null,
        step_decision: null,
        step_notes: null,
        starts_at: null,
        end_time: endTimeStr,
        timezone: userTimeZone,
        current_date: null,
        eventId: null,
        moment_privacy_teams: [],
        newly_created_team: null,
        voice_notes: null,
        voice_blob: null,
        sent: 0,
        meeting_notes: null,
        summary_status: 0,
        meeting_notes_summary: null,
        meeting_notes_transcript: null,
        max_participants_register: 0,
        price: 0,
        update_meeting: false,
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item?.id}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const data = response?.data?.data;
        // console.log(response?.data?.data);
        // navigate(`/copyMeeting/${data?.id}`);
        setCheckId(data?.id);
        setIsDuplicate(true);
        handleShow();
        setMeeting(data);
        setFormState(data);
        // toast.error("Request failed:", response.status, response.statusText);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error(t("Duplication Failed, Check your Internet connection"));
    }
  };

  //Publish Report button Api
  const sendEmail = async (item) => {
    const payload = {
      meeting_id: item.id,
    };
    try {
      const response = await axios.post(
        `${API_BASE_URL}/send-report-link`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        toast.success(t("Report is published successfully"));
      }
    } catch (error) {
      console.log("error while sending mail", error);
    }
  };

  const handleChangePrivacy = (item) => {
    setCheckId(item?.id);
    setFormState(item);
    setChangePrivacy(true);
    setMeeting(item);
    handleShow();
    setOpenDropdownId(null);
  };

  // useEffect(() => {
  //   return () => {
  //     effectRan.current = true;
  //   };
  // }, []);

  const sortedMeetings = [...allClosedMeetings];

  // const sortedMeetings = [...allClosedMeetings].sort((a, b) => {
  //   if (a.estimate_time && b.estimate_time) {
  //     return new Date(b.estimate_time) - new Date(a.estimate_time);
  //   }
  //   return 0;
  // });

  const formatDate = (item) => {
    let date;
    if (language === "en") {
      date = moment(item.date).locale("en-gb"); // Set locale to English
    } else {
      date = moment(item.date); // Set into french
    }
    const today = moment().startOf("day"); // Get today date

    const day = date.format("ddd").toUpperCase();
    const dayNumber = date.format("DD");

    // Compare if the date is today
    const isToday = date.isSame(today, "day");

    // Determine the color based on whether it's today or not
    const color = item.status === "abort" ? "#e7796a" : "#92929D";
    return (
      <div style={{ color }}>
        {day}
        <br />
        {dayNumber}
      </div>
    );
  };

  const presentMeeting = (id) => {
    navigate(`/present/invite/${id}`, { state: { from: "meeting" } });
  };
  const viewPresentation = (item) => {
    navigate(`/present/invite/${item.id}`, {
      state: { item, from: "meeting" },
    });
  };

  // Parse the start and real start times into Date objects
  const parseTime = (time) => {
    const [hours, minutes, seconds] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // const formatDateInFrench = (dateString) => {
  //   const date = new Date(dateString);
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // };

  const meetingsByMonth = {};
  // sortedMeetings.sort((a, b) => moment(b.date).diff(moment(a.date)));

  sortedMeetings?.forEach((item, index) => {
    let date;
    if (language === "en") {
      date = moment(item?.estimate_time).locale("en-gb"); // Set locale to English
    } else {
      date = moment(item?.estimate_time); // Set into french
    }
    const month = moment(date).format("MMMM"); // Include year to ensure correct sorting
    if (!meetingsByMonth[month]) {
      meetingsByMonth[month] = [];
    }

    const participantCount = item?.guides?.length;
    const startTimeDate = item?.start_time ? parseTime(item.start_time) : null;
    const realStartTimeDate = item?.starts_at
      ? parseTime(item.starts_at)
      : null;
    // const userRole = CookieService.get("user_role");
    const loggedInUserId = CookieService.get("user_id");
    const canManage =
      item.user_id === parseInt(loggedInUserId) ||
      item?.steps?.some((guide) => guide?.userPID === parseInt(loggedInUserId));

    let statusMessage = "";

    if (startTimeDate && realStartTimeDate) {
      if (realStartTimeDate.getTime() === startTimeDate.getTime()) {
        statusMessage = t("meeting.completedMeetings.onTime");
      } else if (realStartTimeDate.getTime() < startTimeDate.getTime()) {
        statusMessage = t("meeting.completedMeetings.early");
      } else {
        statusMessage = t("meeting.completedMeetings.late");
      }
    }

    // const convertTo12HourFormat = (time, steps) => {
    //   if (!time) return;
    //   // Assuming time is in HH:mm:ss format
    //   const timeMoment = moment(time, "HH:mm:ss");
    //   return timeMoment.isValid() ? timeMoment.format("HH[h]mm") : ""; // Keep in 24-hour format
    // };
    const specialMeetingEndTime = (startTime, steps) => {
      if (!startTime || !steps) return 0;
      // Convert start_time to a moment object
      let meetingStartTime = moment(startTime, "HH:mm:ss");

      steps?.forEach((step) => {
        const { count2, time_unit } = step;

        if (time_unit === "seconds") {
          meetingStartTime.add(count2, "seconds");
        } else if (time_unit === "minutes") {
          meetingStartTime.add(count2, "minutes");
        } else if (time_unit === "hours") {
          meetingStartTime.add(count2, "hours");
        } else if (time_unit === "days") {
          meetingStartTime.add(count2, "days");
        }
      });

      // Return the updated time in 12-hour format
      return meetingStartTime.format("HH[h]mm");
    };

    const calculateTotalTimeTaken = (steps) => {
      if (!steps) return;
      // Helper function to convert time string to seconds
      const convertToSeconds = (timeString) => {
        if (!timeString) return 0;
        let totalSeconds = 0;

        // Split by '-' and iterate through parts
        const timeParts = timeString?.split(" - ").map((part) => part.trim());
        timeParts?.forEach((part) => {
          const [value, unit] = part?.split(" ");

          if (unit?.startsWith("sec")) {
            totalSeconds += parseInt(value, 10);
          } else if (unit?.startsWith("min")) {
            totalSeconds += parseInt(value, 10) * 60;
          } else if (unit?.startsWith("hour") || unit?.startsWith("hr")) {
            totalSeconds += parseInt(value, 10) * 3600;
          } else if (unit?.startsWith("day")) {
            totalSeconds += parseInt(value, 10) * 86400;
          }
        });

        return totalSeconds;
      };

      // Calculate total time in seconds
      let totalSeconds = steps?.reduce((acc, step) => {
        return acc + convertToSeconds(step?.time_taken);
      }, 0);

      // Convert total seconds to days, hours, minutes, and seconds
      const days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      // Determine the most significant units to display
      let timeDisplay = "";
      if (days > 0) {
        timeDisplay =
          hours > 0
            ? `${days} ${t("time_unit.days")} - ${hours} ${t(
                "time_unit.hours",
              )} `
            : `${days} ${t("time_unit.days")} `;
      } else if (hours > 0) {
        timeDisplay =
          minutes > 0
            ? `${hours} ${t("time_unit.hours")}  - ${minutes} ${t(
                "time_unit.minutes",
              )} `
            : `${hours} ${t("time_unit.hours")}`;
      } else if (minutes > 0) {
        timeDisplay =
          seconds > 0
            ? `${minutes} ${t("time_unit.minutes")} - ${seconds} ${t(
                "time_unit.seconds",
              )}`
            : `${minutes} ${t("time_unit.minutes")}`;
      } else {
        timeDisplay = `${seconds} ${t("time_unit.seconds")}`;
      }

      return timeDisplay;
    };

    // const startDate1 = new Date(item?.date);
    // // Get individual components of the date
    // const day = String(startDate1.getDate()).padStart(2, "0");
    // const startMonth = String(startDate1.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    // const year = startDate1.getFullYear();

    // // Format the date in dd:mm:yyyy
    // const formattedStartDate = `${day}/${startMonth}/${year}`;
    const formattedStartDate = convertDateToUserTimezone(
      item?.date,
      item?.estimate_time?.split("T")[1],
      item?.timezone,
    );

    // Calculate the average rating
    const validFeedbacks =
      item?.meeting_feedbacks?.filter((feedback) => feedback.rating > 0) || [];

    const averageRating =
      validFeedbacks.length > 0
        ? validFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) /
          validFeedbacks.length
        : 0;
    meetingsByMonth[month].push(
      <Card
        className="mt-3 mb-2"
        key={index}
        onClick={() => {
          // Check if the logged-in user is in the guides array
          item?.steps?.some(
            (guide) => guide?.userPID === parseInt(loggedInUserId),
          ) ||
          // Check if all participants have user_id equal to meeting.user.id
          item?.user?.id === parseInt(loggedInUserId)
            ? presentMeeting(item.id)
            : viewPresentation(item);
        }}
      >
        <div className="row">
          <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
            {formatDate(item)}
          </div>

          <div className="col-md-10" style={{ paddingLeft: "18px" }}>
            <div className="row">
              <div className="col-md-12">
                <h6 className="destination"> {item?.objective}</h6>

                <span className="heading">{item.title}</span>
                {item.status === "closed" && (
                  <span className="mx-2 badge inprogrss">
                    {t("badge.finished")}
                  </span>
                )}
                {item?.status === "in_progress" && (
                  <span className="mx-2 badge status-badge-inprogress1">
                    {t("badge.inprogress")}
                  </span>
                )}
                {item?.status === "abort" && (
                  <span className="mx-2 badge late">{t("badge.cancel")}</span>
                )}
                {/* <h6 className="destination"> {item?.objective}</h6> */}
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4 text-start">
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
                {item.type === "Action1" || item?.type === "Newsletter" ? (
                  <span className="time">
                    {formatStepDate(
                      item?.date,
                      item?.estimate_time?.split("T")[1],
                      item?.timezone,
                    )}{" "}
                    -{" "}
                    {item?.status === "abort" ? (
                      <>
                        {item?.abort_end_time
                          ? formatStepDate(item?.abort_end_time, item?.timezone)
                          : formatStepDate(
                              item?.estimate_time?.split("T")[0],
                              item?.estimate_time?.split("T")[1],
                              item?.timezone,
                            )}
                      </>
                    ) : (
                      <>
                        {formatStepDate(
                          item?.estimate_time?.split("T")[0],
                          item?.estimate_time?.split("T")[1],
                          item?.timezone,
                        )}{" "}
                      </>
                    )}
                  </span>
                ) : item?.type === "Special" || item?.type === "Law" ? (
                  <>
                    <span className="time">
                      {formattedStartDate}{" "}
                      {item?.start_time && <>{t("at")}&nbsp;</>}
                      {convertTo12HourFormat(
                        item?.start_time,
                        item?.date,
                        item?.steps,
                        item?.timezone,
                      )}{" "}
                      &nbsp; - &nbsp;
                      {formatStepDate(
                        item?.estimate_time?.split("T")[0],
                        item?.estimate_time?.split("T")[1],
                        item?.timezone,
                      )}{" "}
                      {item?.start_time && t("at")}&nbsp;
                      <>
                        {item?.type === "Special" || item?.type === "Law" ? (
                          <>
                            {specialMeetingEndTime(
                              item?.start_time,
                              item?.steps,
                            )}
                          </>
                        ) : (
                          <>
                            {convertTo12HourFormat(
                              item?.estimate_time?.split("T")[1],
                              item?.estimate_time?.split("T")[0],
                              item?.steps,
                              item?.timezone,
                            )}
                          </>
                        )}
                      </>
                    </span>
                  </>
                ) : (
                  <span className="time">
                    {formattedStartDate}{" "}
                    {(item?.starts_at || item?.start_time) && (
                      <>
                        {t("at")}&nbsp;
                        {/* {item.starts_at} */}
                      </>
                    )}
                    {convertTo12HourFormat(
                      item?.starts_at || item?.start_time,
                      item?.date,
                      item?.steps,
                      item?.timezone,
                    )}{" "}
                    &nbsp; - &nbsp;
                    {item?.status === "abort" ? (
                      <>
                        {item.abort_end_time ? (
                          <>
                            {abortMeetingTime(
                              item?.abort_end_time,
                              "DD/MM/yyyy",
                              item?.timezone,
                            )}{" "}
                            {item?.starts_at && t("at")}&nbsp;
                            {abortMeetingTime(
                              item?.abort_end_time,
                              "HH[h]mm",
                              item?.timezone,
                            )}
                          </>
                        ) : (
                          <>
                            {formatStepDate(
                              item?.estimate_time?.split("T")[0],
                              item?.estimate_time?.split("T")[1],
                              item?.timezone,
                            )}{" "}
                            {item?.starts_at && t("at")}&nbsp;
                            {convertTo12HourFormat(
                              item?.estimate_time?.split("T")[1],
                              item?.estimate_time?.split("T")[0],
                              item?.steps,
                              item?.timezone,
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {formatStepDate(
                          item?.estimate_time?.split("T")[0],
                          item?.estimate_time?.split("T")[1],
                          item?.timezone,
                        )}{" "}
                        {item?.starts_at && t("at")}&nbsp;
                        {convertTo12HourFormat(
                          item?.estimate_time?.split("T")[1],
                          item?.estimate_time?.split("T")[0],
                          item?.steps,
                          item?.timezone,
                        )}
                      </>
                    )}
                  </span>
                )}
                {/* <span className="">
                              {getTimezoneSymbol(CookieService.get("timezone"))}
                              </span> */}
                <div>
                  {!(item?.type === "Special" || item?.type === "Law") && (
                    <div className="text-start">
                      <svg
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1578_4092)">
                          <path
                            d="M16.2669 11.3333L12.9336 14.6666L10.6003 12.3333L11.6003 11.3333L12.9336 12.6666L15.2669 10.3333L16.2669 11.3333ZM9.33359 13.2666C9.06693 13.3333 8.86693 13.3333 8.60026 13.3333C5.66693 13.3333 3.26693 10.9333 3.26693 7.99998C3.26693 5.06665 5.66693 2.66665 8.60026 2.66665C11.5336 2.66665 13.9336 5.06665 13.9336 7.99998C13.9336 8.26665 13.9336 8.46665 13.8669 8.73331C14.3336 8.79998 14.7336 8.93331 15.1336 9.13331C15.2003 8.73331 15.2669 8.39998 15.2669 7.99998C15.2669 4.33331 12.2669 1.33331 8.60026 1.33331C4.93359 1.33331 1.93359 4.33331 1.93359 7.99998C1.93359 11.6666 4.93359 14.6666 8.60026 14.6666C9.00026 14.6666 9.40026 14.6 9.73359 14.5333C9.53359 14.2 9.40026 13.7333 9.33359 13.2666ZM11.0003 9.39998L8.93359 8.19998V4.66665H7.93359V8.66665L10.2669 10.0666C10.4669 9.79998 10.7336 9.59998 11.0003 9.39998Z"
                            fill="#8590A3"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1578_4092">
                            <rect
                              width="16"
                              height="16"
                              fill="white"
                              transform="translate(0.601562)"
                            />
                          </clipPath>
                        </defs>
                      </svg>

                      <span className="time">
                        {calculateTotalTimeTaken(item?.steps)}
                        {/* {item?.estimate_time} */}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-2">
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
                <span className="time">
                  {item?.solution
                    ? item?.solution?.title
                    : item?.type === "Google Agenda Event"
                      ? "Google Agenda Event"
                      : item?.type === "Outlook Agenda Event"
                        ? "Outlook Agenda Event"
                        : item?.type === "Special"
                          ? "Media"
                          : item?.type === "Prise de contact"
                            ? "Prise de contact"
                            : t(`types.${item?.type}`)}
                </span>
              </div>
              {/* <div className="col-md-2">
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

              {/* {!(item?.type === "Special" || item?.type === "Law") && (
                <div className="col-md-2">
                  <svg
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_1578_4092)">
                      <path
                        d="M16.2669 11.3333L12.9336 14.6666L10.6003 12.3333L11.6003 11.3333L12.9336 12.6666L15.2669 10.3333L16.2669 11.3333ZM9.33359 13.2666C9.06693 13.3333 8.86693 13.3333 8.60026 13.3333C5.66693 13.3333 3.26693 10.9333 3.26693 7.99998C3.26693 5.06665 5.66693 2.66665 8.60026 2.66665C11.5336 2.66665 13.9336 5.06665 13.9336 7.99998C13.9336 8.26665 13.9336 8.46665 13.8669 8.73331C14.3336 8.79998 14.7336 8.93331 15.1336 9.13331C15.2003 8.73331 15.2669 8.39998 15.2669 7.99998C15.2669 4.33331 12.2669 1.33331 8.60026 1.33331C4.93359 1.33331 1.93359 4.33331 1.93359 7.99998C1.93359 11.6666 4.93359 14.6666 8.60026 14.6666C9.00026 14.6666 9.40026 14.6 9.73359 14.5333C9.53359 14.2 9.40026 13.7333 9.33359 13.2666ZM11.0003 9.39998L8.93359 8.19998V4.66665H7.93359V8.66665L10.2669 10.0666C10.4669 9.79998 10.7336 9.59998 11.0003 9.39998Z"
                        fill="#8590A3"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1578_4092">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                          transform="translate(0.601562)"
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  <span className="time">{statusMessage}</span>
                </div>
              )} */}
              {item?.meeting_feedbacks?.length > 0 &&
                item?.meeting_feedbacks?.some(
                  (feedback) => feedback.rating > 0,
                ) && (
                  <div
                    className="col-md-4 d-flex gap-1"
                    style={{
                      paddingTop: "2px",
                    }}
                  >
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 -0.5 25 25"
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
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.5 14.2606C5.51486 16.2065 7.10302 17.7728 9.049 17.7606H9.53L10.952 19.2606C11.0963 19.4094 11.2947 19.4934 11.502 19.4934C11.7093 19.4934 11.9077 19.4094 12.052 19.2606L13.474 17.7606H13.955C15.8994 17.7706 17.4851 16.205 17.5 14.2606V10.0006C17.4851 8.05461 15.897 6.48838 13.951 6.50057H9.051C7.10424 6.48727 5.51486 8.05382 5.5 10.0006V14.2606Z"
                          stroke="#8590A3"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M7.25 6.5006C7.25 6.91481 7.58579 7.2506 8 7.2506C8.41421 7.2506 8.75 6.91481 8.75 6.5006H7.25ZM16.449 4.0006V4.75073L16.4629 4.75047L16.449 4.0006ZM18.9332 4.97613L18.4128 5.51618L18.4128 5.51618L18.9332 4.97613ZM20 7.4226H20.7501L20.7499 7.40875L20 7.4226ZM17.5 14.2506C17.0858 14.2506 16.75 14.5864 16.75 15.0006C16.75 15.4148 17.0858 15.7506 17.5 15.7506V14.2506ZM8.5 10.2506C8.08579 10.2506 7.75 10.5864 7.75 11.0006C7.75 11.4148 8.08579 11.7506 8.5 11.7506V10.2506ZM14.265 11.7506C14.6792 11.7506 15.015 11.4148 15.015 11.0006C15.015 10.5864 14.6792 10.2506 14.265 10.2506V11.7506ZM9.221 12.3586C8.80679 12.3586 8.471 12.6944 8.471 13.1086C8.471 13.5228 8.80679 13.8586 9.221 13.8586V12.3586ZM13.544 13.8586C13.9582 13.8586 14.294 13.5228 14.294 13.1086C14.294 12.6944 13.9582 12.3586 13.544 12.3586V13.8586ZM8.75 6.5006C8.75 5.81137 9.01573 5.43293 9.42787 5.18347C9.8982 4.89877 10.6233 4.7506 11.549 4.7506V3.2506C10.5147 3.2506 9.4653 3.40742 8.65113 3.90023C7.77877 4.42827 7.25 5.29983 7.25 6.5006H8.75ZM11.549 4.7506H16.449V3.2506H11.549V4.7506ZM16.4629 4.75047C17.1887 4.73702 17.8901 5.01246 18.4128 5.51618L19.4537 4.43609C18.6445 3.6563 17.5587 3.22991 16.4351 3.25073L16.4629 4.75047ZM18.4128 5.51618C18.9355 6.01991 19.2367 6.71065 19.2501 7.43645L20.7499 7.40875C20.7291 6.28518 20.2629 5.21587 19.4537 4.43609L18.4128 5.51618ZM19.25 7.4226V11.5786H20.75V7.4226H19.25ZM19.25 11.5786C19.25 12.4864 19.1243 13.1709 18.8585 13.6099C18.6354 13.9783 18.2701 14.2506 17.5 14.2506V15.7506C18.7299 15.7506 19.6146 15.2569 20.1415 14.3868C20.6257 13.5873 20.75 12.5608 20.75 11.5786H19.25ZM8.5 11.7506H14.265V10.2506H8.5V11.7506ZM9.221 13.8586H13.544V12.3586H9.221V13.8586Z"
                          fill="#8590A3"
                        ></path>{" "}
                      </g>
                    </svg>
                    {/* Star Ratings */}

                    <div className="d-flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={
                            index < Math.round(averageRating)
                              ? "#FFD700"
                              : "#D3D3D3"
                          }
                          size={16}
                          style={{ marginRight: 1 }}
                        />
                      ))}
                    </div>

                    <span className="time">{averageRating.toFixed(1)}</span>
                    <span className="time ml-0">{`(${
                      item?.meeting_feedbacks?.length
                    } ${
                      item?.meeting_feedbacks?.length > 1 ? "Votes" : "Vote"
                    })`}</span>
                  </div>
                )}
            </div>

            <div className="row my-2">
              <div className="col-md-4 mt-2">
                <div className="col-md-5 creator">{t("Creator")}</div>
                <div>
                  {/* <Avatar src={Assets_URL + "/" + item?.user?.image} /> */}
                  <Tooltip title={item?.user?.full_name} placement="top">
                    <Avatar
                      src={
                        item?.user?.image?.startsWith("users/")
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
                  <div className="creator">
                    {participantCount > 1 ? t("presentors") : t("presentor")}
                  </div>
                )}
                <div className="d-flex align-items-center flex-wrap">
                  <Avatar.Group>
                    {item?.guides?.map((item) => {
                      // if (item?.isCreator === 1) {
                      //   return;
                      // }

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
                                  ? Assets_URL + "/" + item.participant_image
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
                      ? `${participantCount} ${
                          participantCount > 1
                            ? t("presentors")
                            : t("presentor")
                        }`
                      : ""}
                  </span>
                </div>
              </div>
              <div className="col-md-4 mt-2">
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
                              <Tooltip title={item?.full_name} placement="top">
                                <Avatar
                                  size="large"
                                  src={
                                    item?.participant_image?.startsWith("http")
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
                            : Assets_URL + "/" + item?.user?.enterprise?.logo
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
                              : Assets_URL + "/" + item?.user?.enterprise?.logo
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
                      <Tooltip title={item?.user?.full_name} placement="top">
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
              </div>
            </div>
          </div>
          <div className="col-md-1 d-flex justify-content-end">
            {/* <BsThreeDotsVertical /> */}
            <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
              <>
                <div className="dropdown dropstart" key={item.id}>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    data-bs-toggle="dropdown"
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
                  <ul
                    className={`dropdown-menu ${
                      openDropdownId === item.id ? "show" : ""
                    }`}
                  >
                    {canManage ? (
                      <>
                        {item?.status !== "abort" && (
                          <>
                            <li>
                              <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                // onClick={(e) => {
                                //   e.stopPropagation();
                                //   presentMeeting(item.id);
                                // }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }}
                              >
                                <MdInsertLink size={"20px"} /> &nbsp;
                                {t("presentation.generateLink")}
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sendEmail(item);
                                }}
                              >
                                <RiMailSendLine size={"20px"} /> &nbsp;
                                {t("dropdown.Publish Report")}
                              </a>
                            </li>
                            <li>
                              <a
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangePrivacy(item);
                                }}
                              >
                                <RiEditBoxLine size={"20px"} /> &nbsp;
                                {t("dropdown.change Privacy")}
                              </a>
                            </li>
                          </>
                        )}

                        <li>
                          <a
                            className="dropdown-item"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item);
                            }}
                          >
                            <MdContentCopy size={"18px"} /> &nbsp;
                            {t("dropdown.Duplicate")}
                          </a>
                        </li>

                        {parseInt(item?.user?.id) ===
                          parseInt(CookieService.get("user_id")) && (
                          <>
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
                          </>
                        )}
                      </>
                    ) : (
                      <li>
                        <a
                          className="dropdown-item"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                            copy(currentURL);
                            openLinkInNewTab(currentURL);
                          }}
                        >
                          <RiPresentationFill size={"20px"} /> &nbsp;
                          {t("presentation.generateLink")}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            </div>
          </div>
        </div>
      </Card>,
    );
  });

  const months = Object.keys(meetingsByMonth);

  // ─── List View Row ──────────────────────────────────────────────────────────
  const renderListView = () => {
    if (sortedMeetings.length === 0) return <NoContent title="Closed Meeting" />;
    return (
      <div className="list-view-container" style={{
        background: '#ffffff',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <style>
          {`
            .list-view-grid {
              display: grid;
              grid-template-columns: 45px 55px 1fr 1fr 250px 250px 100px;
              gap: 16px;
              padding: 14px 24px;
              align-items: center;
            }
            @media (max-width: 1400px) {
              .list-view-grid {
                grid-template-columns: 45px 55px 1fr 1fr 170px 110px;
              }
              .col-audio { display: none; }
            }
            @media (max-width: 1200px) {
              .list-view-grid {
                grid-template-columns: 45px 55px 1fr 160px 110px;
              }
              .col-mission, .col-audio { display: none; }
            }
            @media (max-width: 768px) {
              .list-view-grid {
                grid-template-columns: 35px 1fr 90px;
              }
              .ps-2 { padding-left: 0 !important; }
              .col-logo, .col-mission, .col-audio, .col-date { display: none; }
            }
            .meeting-grid-action-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 34px;
              height: 34px;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
              background: #fff;
              color: #475569;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              cursor: pointer;
              padding: 0;
            }
            .meeting-grid-action-btn:hover {
              background: #f1f5f9;
              color: #2563eb;
              border-color: #cbd5e1;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .meeting-grid-action-btn svg {
              font-size: 18px;
            }
            .col-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 48px;
            }
          `}
        </style>
        {/* Header */}
        <div className="list-view-header list-view-grid" style={{
          borderBottom: '1px solid #f1f5f9',
          color: '#64748b',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          background: '#f8fafc',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          textAlign: 'left'
        }}>
          <span style={{ width: '40px' }}>#</span>
          <span className="col-logo"></span>
          <span className="ps-2">{t("meeting.activeMeetings.title")}</span>
          <span className="col-mission text-start">{t("meeting.activeMeetings.destinations")}</span>
          <span className="col-date text-start">{t("meeting.activeMeetings.niche")}</span>
          <span className="col-audio text-start">Audio</span>
          <span className="col-actions text-start ps-4">{t("meeting.activeMeetings.actions")}</span>
        </div>

        {/* Rows */}
        {sortedMeetings.map((item, idx) => {
          const loggedInUserId = CookieService.get("user_id");
          const logo = item?.destination?.clients?.client_logo
            || item?.solution?.logo
            || item?.destination?.logo;
          const isGoogle = item?.created_from === "Google Calendar" || item?.type === "Google Agenda Event";
          const isOutlook = item?.created_from === "Outlook Calendar" || item?.type === "Outlook Agenda Event";
          
          const isCreator = parseInt(item?.user?.id) === parseInt(loggedInUserId);
          const isGuide = item?.guides?.some(g => parseInt(g.id) === parseInt(loggedInUserId));
          const canManage = isCreator || isGuide;

          const solutionTitle = item?.solution
            ? item?.solution?.title
            : isGoogle ? "Google"
            : isOutlook ? "Outlook"
            : item?.type === "Special" ? "Media"
            : item?.type || "Réunion";
          const initials = (item?.objective || item?.title || "M").substring(0, 2).toUpperCase();
          const hasAudio = !!item?.voice_notes;

          const missionLogo = item?.solution?.logo || item?.destination?.logo;
          const missionTitle = item?.objective || (isGoogle ? "Google" : isOutlook ? "Outlook" : "—");

          // format start date/time
          const startFormatted = convertDateToUserTimezone(
            item?.date,
            item?.estimate_time?.split("T")[1],
            item?.timezone,
          );
          const startTime = convertTo12HourFormat(
            item?.starts_at || item?.start_time,
            item?.date,
            item?.steps,
            item?.timezone,
          );
          const endTime = item?.status === "abort" && item?.abort_end_time
            ? `${abortMeetingTime(item?.abort_end_time, "DD/MM/yyyy", item?.timezone)} ${abortMeetingTime(item?.abort_end_time, "HH[h]mm", item?.timezone)}`
            : (() => {
                const endDatePart = formatStepDate(item?.estimate_time?.split("T")[0], item?.estimate_time?.split("T")[1], item?.timezone);
                const endTimePart = convertTo12HourFormat(item?.estimate_time?.split("T")[1], item?.estimate_time?.split("T")[0], item?.steps, item?.timezone);
                return `${endDatePart} ${endTimePart || ""}`;
              })();
          const isLast = idx === sortedMeetings.length - 1;

          return (
            <div key={item.id} ref={isLast ? lastMeetingRef : null} className="list-view-row list-view-grid" style={{ 
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.2s',
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} 
               onClick={() => {
                 item?.steps?.some(g => g?.userPID === parseInt(loggedInUserId)) ||
                 item?.user?.id === parseInt(loggedInUserId)
                   ? presentMeeting(item.id)
                   : viewPresentation(item);
               }}>
              {/* Index */}
              <span style={{ fontSize: '12px', color: '#94a3b8', width: '40px' }}>{idx + 1}</span>

              {/* Logo */}
              <div className="col-logo">
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: isGoogle ? '#fde6e9' : isOutlook ? '#e0e7ff' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700', color: isGoogle ? '#ef4444' : isOutlook ? '#3b82f6' : '#64748b',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  overflow: 'hidden'
                }}>
                  {logo ? (
                    <img src={logo.startsWith('http') ? logo : `${Assets_URL}/${logo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : initials}
                </div>
              </div>

              {/* Title & Objective */}
              <div className="ps-2" style={{ minWidth: 0 }}>
                <div className="text-secondary mb-1" style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {solutionTitle}
                </div>
                <div className="fw-bold text-dark" style={{ 
                  fontSize: '14px', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {item?.title}
                  {(item?.status === 'in_progress' || item?.status === 'active') && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: '999px', border: '1px solid #fef08a' }}>
                      {t("badge.inprogress")}
                    </span>
                  )}
                  {item?.status === 'to_finish' && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '999px', border: '1px solid #fed7aa' }}>
                      {t("badge.tofinish") || "To Finish"}
                    </span>
                  )}
                  {item?.status === 'abort' && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '999px', border: '1px solid #fecaca' }}>
                      {t("badge.cancel")}
                    </span>
                  )}
                  {item?.status === 'closed' && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                      {t("badge.finished")}
                    </span>
                  )}
                  {item?.status === 'todo' && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                       {t("badge.todo")}
                    </span>
                  )}
                </div>
              </div>

              {/* Mission */}
              <div className="col-mission" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  color: '#64748b', fontSize: '13px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {missionTitle}
                </div>
              </div>

              {/* Start → End */}
              <div className="col-date" style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>
                <div>{startFormatted}{startTime ? ` à ${startTime}` : ''}</div>
                <div style={{ color: '#94a3b8' }}>→ {endTime}</div>
              </div>

              {/* Audio Player */}
              <div className="col-audio" onClick={e => e.stopPropagation()}>
                {hasAudio ? (
                  <audio
                    controls
                    src={item.voice_notes}
                    style={{ height: '32px', width: '200px', accentColor: '#3b82f6', outline: 'none' }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <span style={{ color: '#e2e8f0', fontSize: '12px', paddingRight: '16px' }}>—</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-actions d-flex align-items-center justify-content-end gap-2" onClick={e => e.stopPropagation()}>
                {/* Report Icon Button */}
                <Tooltip title={t("dropdown.reviewinvitation")} placement="top">
                  <button className="meeting-grid-action-btn" onClick={(e) => {
                    e.stopPropagation();
                    const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                    openLinkInNewTab(currentURL);
                  }}>
                    <IoEyeOutline />
                  </button>
                </Tooltip>

                {/* Dropdown Toggle */}
                <div className="dropdown">
                  <button
                    className="meeting-grid-action-btn"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={openDropdownId === item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(item.id);
                    }}
                  >
                    <BiDotsVerticalRounded />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end ${openDropdownId === item.id ? 'show' : ''}`} style={{ minWidth: '180px', borderRadius: '12px', padding: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                    {canManage ? (
                      <>
                        {item?.status !== "abort" && (
                          <>
                            <li>
                              <a className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: '6px' }} onClick={() => {
                                const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                copy(currentURL);
                                toast.success(t("linkCopiedToast"));
                              }}>
                                <MdInsertLink size="18px" /> {t("presentation.generateLink")}
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: '6px' }} onClick={() => handleChangePrivacy(item)}>
                                <RiEditBoxLine size="18px" /> {t("dropdown.change Privacy")}
                              </a>
                            </li>
                          </>
                        )}
                        <li>
                          <a className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: '6px' }} onClick={() => handleCopy(item)}>
                            <MdContentCopy size="16px" /> {t("dropdown.Duplicate")}
                          </a>
                        </li>
                        {isCreator && (
                          <>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />
                            <li>
                              <a className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" style={{ borderRadius: '6px' }} onClick={(e) => handleDeleteClick(e, item.id)}>
                                <AiOutlineDelete size="18px" /> {t("dropdown.Delete")}
                              </a>
                            </li>
                          </>
                        )}
                      </>
                    ) : (
                      <li>
                        <a className="dropdown-item d-flex align-items-center gap-2 py-2" style={{ borderRadius: '6px' }} onClick={() => {
                          const currentURL = `${window.location.origin}/destination/${item?.unique_id}/${item?.id}`;
                          copy(currentURL);
                          toast.success(t("linkCopiedToast"));
                        }}>
                          <RiPresentationFill size="18px" /> {t("presentation.generateLink")}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
        {/* Spinner for loading next page */}
        {isLoadingMore && closedHasMore && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" style={{ color: '#3b82f6' }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="scheduled">
        <div className="my-2 container-fluid">
          {closedLoading ? (
            <div className="progress-overlay" style={{ background: "transparent" }}>
              <div style={{ width: "50%" }}>
                <ProgressBar now={closedProgress} animated />
              </div>
            </div>
          ) : viewMode === "list" ? (
            <>
              {renderListView()}
              {/* Loading Spinner */}
              <div className="text-center my-4">
                {isLoadingMore && closedHasMore && (
                  <Spinner animation="border" role="status" />
                )}
              </div>
            </>
          ) : (
            <>
              {allClosedMeetings?.length === 0 ? (
                <NoContent title="Closed Meeting" />
              ) : (
                <>
                  {months.map((month, monthIndex) => (
                    <React.Fragment key={month}>
                      <span className="month">{month}</span>
                      {meetingsByMonth[month]?.map((meeting, index) => {
                        const isLast =
                          monthIndex === months.length - 1 &&
                          index === meetingsByMonth[month].length - 1;
                        return (
                          <div key={index} ref={isLast ? lastMeetingRef : null}>
                            {meeting}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  {/* Loading Spinner */}
                  <div className="text-center my-4">
                    {isLoadingMore && closedHasMore && (
                      <Spinner animation="border" role="status" />
                    )}
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
            onCancel={(e) => {
              e.stopPropagation();
              setShowConfirmationModal(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default CompletedMeetings;
