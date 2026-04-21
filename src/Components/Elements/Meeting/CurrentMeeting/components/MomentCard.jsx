import CookieService from '../../../../Utils/CookieService';
import { Avatar, Tooltip } from "antd";
import React, { Suspense, useState } from "react";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  convertCount2ToSeconds,
  convertDateToUserTimezone,
  convertTo12HourFormat,
  timezoneSymbols,
} from "../../GetMeeting/Helpers/functionHelper";
import {
  abortMeetingTime,
  calculateTimeDifference,
  convertTimeTakenToSeconds,
  formatStepDate,
  specialMeetingEndTime,
} from "../../../../Utils/MeetingFunctions";
import { useDraftMeetings } from "../../../../../context/DraftMeetingContext";
import moment from "moment";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import { RiEditBoxLine, RiPresentationFill } from "react-icons/ri";
import { LuLink } from "react-icons/lu";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { AiOutlineDelete, AiOutlinePlaySquare } from "react-icons/ai";
import { useMeetings } from "../../../../../context/MeetingsContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useDestinations } from "../../../../../context/DestinationsContext";
import { IoCopyOutline, IoEyeOutline } from "react-icons/io5";
import { MdContentCopy, MdInsertLink } from "react-icons/md";
import copy from "copy-to-clipboard";
import { openLinkInNewTab } from "../../../../Utils/openLinkInNewTab";
import { ImCancelCircle } from "react-icons/im";
import { useNavigate } from "react-router-dom";
// import NewMeetingModal from "../../CreateNewMeeting/NewMeetingModal";
import ConfirmationModal from "../../../../Utils/ConfirmationModal";
const LazyComponent = React.lazy(
  () => import("../../CreateNewMeeting/NewMeetingModal"),
);

const MomentCard = ({ item, refresh }) => {
  const [t] = useTranslation("global");
  const { language } = useDraftMeetings();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const navigate = useNavigate();
  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };
  const daysDifference = calculateDaysDifference(
    item?.date,
    item?.estimate_time?.split("T")[0],
  );

  const formattedDate = convertDateToUserTimezone(
    item?.date,
    item?.starts_at || item?.start_time,
    item?.timezone,
  );

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
    const color = isToday ? "#e7796a" : "#4C4C4C";
    return (
      <div style={{ color }}>
        {day}
        <br />
        {dayNumber}
      </div>
    );
  };

  function calculateTotalTime(steps) {
    if (!steps) return null;
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
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (days > 0) {
      result += `${days} ${t("days")} `;
    }
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
  const totalTime = calculateTotalTime(item?.steps);
  const loggedInUserId = CookieService.get("user_id");

  const {
    open,
    handleShow,
    setMeeting,
    handleCloseModal,
    setIsDuplicate,
    setIsUpdated,
    getMeeting,
    setCheckId,

    setChangePrivacy,
  } = useFormContext();
  const { setCallApi } = useMeetings();
  const { getUserMeetingCount } = useDestinations();

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const canManage =
    item?.user?.id === parseInt(loggedInUserId) ||
    item?.steps?.some((guide) => guide?.userPID === parseInt(loggedInUserId));

  const updateCallApi = (value) => {
    setCallApi(value);
    CookieService.set("callApi", value);
  };

  const handlePlay = async (item) => {
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);
    updateCallApi(false);

    const currentDate = moment().format("YYYY-MM-DD"); // Format to match the meeting date format
    if (item?.type === "Newsletter") {
      const meetingDate = moment(item.date).format("YYYY-MM-DD"); // Extract the meeting date in the same format

      if (meetingDate !== currentDate) {
        toast.error(t("errors.newletterplayMeeting"));
        return;
      }
    } else if (item?.type !== "Task" && item.type !== "Strategy") {
      // Allow play only if the time difference is within ±60 minutes for active meetings
      if (
        !(timeDifference >= -60 && timeDifference <= 60) &&
        item.status === "active"
      ) {
        toast.error(t("errors.playMeeting"));
        return;
      }
    }

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      const isGuide =
        item?.steps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);

      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        return; // Exit if the user is not a guide
      }
    }

    continueHandlePlay(item);
  };
  const continueHandlePlay = async (item) => {
    const scheduledDateTime = new Date(`${item.date}T${item.start_time}`);
    const currentDateTime = new Date();
    // Calculate the time difference in minutes
    const timeDifference = (currentDateTime - scheduledDateTime) / (1000 * 60);

    const currentDate = moment().format("YYYY-MM-DD"); // Format to match the meeting date format

    const endTime = new Date();
    const currentTime = new Date();

    // Get the user's time zone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localCurrentTime = currentTime.toLocaleString("en-GB", {
      timeZone: userTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const formattedCurrentDate = currentDateTime.toISOString().split("T")[0];

    const updatedSteps = item.steps.map((step, index) => {
      if (index === 0) {
        return {
          ...step,
          status: "in_progress",
          step_status: "in_progress",
          current_time: localCurrentTime,
          current_date: formattedCurrentDate,
        };
      } else {
        return step;
      }
    });
    const payload = {
      ...item,
      steps: updatedSteps,
      participants: item?.participants || [],
      starts_at: localCurrentTime,
      current_date: currentDateTime,
      status: "in_progress",
      _method: "put",
      moment_privacy_teams:
        item?.moment_privacy === "team" &&
        item?.moment_privacy_teams?.length &&
        typeof item?.moment_privacy_teams[0] === "object"
          ? item?.moment_privacy_teams.map((team) => team.id)
          : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
      apply_day_off: 0,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        // navigate(`/play/${item.id}`);
        // navigate(`/destination/${item?.unique_id}/${item?.id}`);
        // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
        navigate(`/destination/${item?.unique_id}/${item?.id}`);

        // setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      // setLoading(false);
    }
  };

  const changeStatusAndPlay = async (item) => {
    updateCallApi(true);

    // Check if the item type is "Newsletter"
    if (item.type !== "Newsletter") {
      // Check if the logged-in user is in the guides array
      const isGuide =
        item?.steps?.some(
          (guide) => guide?.userPID === parseInt(loggedInUserId),
        ) ||
        // Check if all participants have user_id equal to meeting.user.id
        item?.user?.id === parseInt(loggedInUserId);

      if (!isGuide) {
        // console.log("User is not a guide. Cannot play the meeting.");
        toast.error(
          t("meeting.formState.you are not allowed to play the meeting"),
        );
        return;
      }
    }

    continueChangeStatusAndPlay(item);
  };
  const continueChangeStatusAndPlay = async (item) => {
    let current_time;
    let current_date;
    let end_date;
    // window.open(`/destination/${item?.unique_id}/${item?.id}`, "_blank");
    navigate(`/destination/${item?.unique_id}/${item?.id}`);
  };

  const [showConfirmationCancelModal, setShowConfirmationCancelModal] =
    useState(false);
  const [item1, setItem1] = useState(null);

  const updateMeetingStatus = async (e) => {
    e.stopPropagation();
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        ...item1,
        // real_end_time: realEndTime,
        abort_end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        status: "abort",
        _method: "put",

        // plan_d_actions: null,
        // step_notes: stepNotes,
        // step_notes: null,
        // step_decisions: null,
        step_notes: null,
        steps: item?.steps?.map((step) => ({
          ...step,
          step_status: "cancelled",
          status: "cancelled",
        })),
        moment_privacy_teams:
          item?.moment_privacy === "team" &&
          item?.moment_privacy_teams?.length &&
          typeof item?.moment_privacy_teams[0] === "object"
            ? item?.moment_privacy_teams.map((team) => team.id)
            : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${item?.id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        // toast.success(response.data?.message);
        // navigate("/meeting");
        // refreshedMeetings();
        if (typeof refresh === "function") {
          refresh();
        }

        setShowConfirmationCancelModal(false);
        //
      }
    } catch (error) {
      // console.log("error ", error);
      setShowConfirmationCancelModal(false);
    }
  };
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  //Delete Meeting
  const handleDelete = async (id) => {
    // const permissionGranted = askPermission(t("meetingDeletedToast"));

    // if (!permissionGranted) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success(t("meetingDeletedSuccessfullToast"));
        if (typeof refresh === "function") {
          refresh();
        }
        // refreshedMeetings();
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
    } finally {
      getUserMeetingCount();
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
  //Duplicate Meeting

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
        time_taken: null,
        note: null,
        original_note: null,
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
        participants: item?.user_with_participants || [],
        _method: "put",
        duplicate: true,
        status: "active",
        delay: null,
        plan_d_actions: null,
        step_decisions: null,
        step_notes: null,
        starts_at: null,
        end_time: endTimeStr,
        timezone: userTimeZone,
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
        await getMeeting(data?.id);
        handleShow();
        setMeeting(data);
        // toast.error("Request failed:", response.status, response.statusText);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error(t("Duplication Failed, Check your Internet connection"));
    } finally {
    }
  };
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleEdit = (item) => {
    // navigate(`/updateMeeting/${item?.id}`);
    setCheckId(item.id);
    setIsUpdated(true);
    handleShow();
    setMeeting(item);
  };
  const handleChangePrivacy = (item) => {
    setCheckId(item?.id);
    setChangePrivacy(true);
    setMeeting(item);
    handleShow();
    setOpenDropdownId(null);
  };

  const viewDraft = async (item) => {
    handleShow();
    setCheckId(item?.id);
    await getMeeting(item.id);
  };
  const viewPresentation = (data) => {
    navigate(`/invite/${data.id}`, { state: { data, from: "meeting" } });
  };

  const presentMeeting = (id) => {
    // navigate(`/presentation/${meetingId}`, { state: meetingData });
    // navigate(`/present/invite/${id}`);
    navigate(`/present/invite/${id}`, { state: { from: "meeting" } });
  };
  const viewMeeting = (item) => {
    // navigate(`/presentation/${meetingId}`, { state: meetingData });
    navigate(`/present/invite/${item.id}`, {
      state: { item, from: "meeting" },
      // state: { item, from: "inviteMeeting" },
    });
  };

  const calculateTotalTimeTaken = (steps) => {
    if (!steps) return;
    // Helper function to convert time string to seconds
    const convertToSeconds = (timeString) => {
      if (!timeString) return 0;
      let totalSeconds = 0;

      // Split by '-' and iterate through parts
      const timeParts = timeString?.split(" - ").map((part) => part.trim());
      timeParts.forEach((part) => {
        const [value, unit] = part.split(" ");

        if (unit.startsWith("sec")) {
          totalSeconds += parseInt(value, 10);
        } else if (unit.startsWith("min")) {
          totalSeconds += parseInt(value, 10) * 60;
        } else if (unit.startsWith("hour") || unit.startsWith("hr")) {
          totalSeconds += parseInt(value, 10) * 3600;
        } else if (unit.startsWith("day")) {
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
          ? `${days} ${t("time_unit.days")} - ${hours} ${t("time_unit.hours")} `
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

  const calculateRealEndTimeForClosed = (steps) => {
    if (steps?.length === 0) return null;

    const convertToSeconds = (timeTaken) => {
      if (!timeTaken) return 0;
      let totalSeconds = 0;
      const parts = timeTaken?.split(" - ");
      parts.forEach((part) => {
        if (part.includes("day")) {
          totalSeconds += parseInt(part) * 86400; // 1 day = 86400 seconds
        } else if (part.includes("hour")) {
          totalSeconds += parseInt(part) * 3600; // 1 hour = 3600 seconds
        } else if (part.includes("min")) {
          totalSeconds += parseInt(part) * 60; // 1 minute = 60 seconds
        } else if (part.includes("sec")) {
          totalSeconds += parseInt(part); // seconds
        }
      });
      return totalSeconds;
    };

    const totalTimeInSeconds = steps?.reduce(
      (acc, step) => acc + convertToSeconds(step?.time_taken),
      0,
    );

    const firstStepCurrentTime = steps[0]?.current_time
      ? moment(steps[0]?.current_time, "HH:mm:ss")
      : moment(item?.starts_at, "HH:mm:ss");
    if (!firstStepCurrentTime) return null;

    const realEndTime = firstStepCurrentTime
      .add(totalTimeInSeconds, "seconds")
      .format("HH:mm:ss");

    return realEndTime;
  };
  const realEndTimeForClosed = calculateRealEndTimeForClosed(item?.steps || []);

  const convertTo12HourFormatForClosed = (time, steps) => {
    if (!time) return;
    // // Assuming time is in HH:mm:ss format
    // const timeMoment = moment(time, "HH:mm:ss");
    // return timeMoment.isValid() ? timeMoment.format("hh:mm A") : "";
    // Assuming time is in HH:mm:ss format
    const timeMoment = moment(time, "HH:mm:ss");
    return timeMoment.isValid() ? timeMoment.format("HH[h]mm") : ""; //
  };
  return (
    <>
      <div className="scheduled">
        <Card
          className="mt-3 mb-2"
          onClick={() => {
            if (
              item.status === "active" ||
              item.status === "in_progress" ||
              item?.status === "to_finish" ||
              item?.status === "todo" ||
              item?.status === "no_status"
            ) {
              viewPresentation(item);
            } else if (item?.status === "draft") {
              viewDraft(item);
            } else {
              // Check if the logged-in user is in the guides array
              item?.steps?.some(
                (guide) => guide?.userPID === parseInt(loggedInUserId),
              ) ||
              // Check if all participants have user_id equal to meeting.user.id
              item?.user?.id === parseInt(loggedInUserId)
                ? presentMeeting(item.id)
                : viewMeeting(item);
            }
          }}
        >
          <div className="row">
            <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
              {formatDate(item)}
            </div>
            <div className="col-md-10" style={{ paddingLeft: "18px" }}>
              <div className="row">
                <div className="col-12">
                  <h6 className="destination">{item?.objective}</h6>

                  {item?.created_from === "Google Calendar" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Google Calendar"
                      role="img"
                      viewBox="0 0 512 512"
                      width="33px"
                      height="34px"
                      fill="#000000"
                    >
                      <rect
                        width="512"
                        height="512"
                        rx="15%"
                        fill="#ffffff"
                      ></rect>
                      <path
                        d="M100 340h74V174H340v-74H137Q100 100 100 135"
                        fill="#4285f4"
                      ></path>
                      <path
                        d="M338 100v76h74v-41q0-35-35-35"
                        fill="#1967d2"
                      ></path>
                      <path d="M338 174h74V338h-74" fill="#fbbc04"></path>
                      <path
                        d="M100 338v39q0 35 35 35h41v-74"
                        fill="#188038"
                      ></path>
                      <path d="M174 338H338v74H174" fill="#34a853"></path>
                      <path d="M338 412v-74h74" fill="#ea4335"></path>
                      <path
                        d="M204 229a25 22 1 1 1 25 27h-9h9a25 22 1 1 1-25 27M270 231l27-19h4v-7V308"
                        stroke="#4285f4"
                        strokeWidth="15"
                        strokeLinejoin="bevel"
                        fill="none"
                      ></path>
                    </svg>
                  )}

                  {item?.created_from === "Outlook Calendar" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Outlook Calendar"
                      role="img"
                      viewBox="0 0 48 48"
                      width="33px"
                      height="34px"
                    >
                      <path fill="#0364b8" d="M6 10H30V38H6z" />
                      <path fill="#0078d4" d="M30 10H42V38H30z" />
                      <path
                        fill="#28a8ea"
                        d="M6 10H30L42 18V38H30L6 30z"
                        opacity="0.9"
                      />
                      <path
                        fill="#fff"
                        d="M18.5 19.5c2.7 0 4.7 2 4.7 4.5s-2 4.5-4.7 4.5-4.7-2-4.7-4.5 2-4.5 4.7-4.5zm0 1.4c-1.8 0-3.2 1.4-3.2 3.1s1.4 3.1 3.2 3.1 3.2-1.4 3.2-3.1-1.4-3.1-3.2-3.1z"
                      />
                      <path fill="#0078d4" d="M42 18L30 10v8h12z" />
                    </svg>
                  )}

                  <span className="heading">{item?.title}</span>
                  {item?.status === "active" && (
                    <span
                      className={`badge ms-2 ${
                        moment().isAfter(
                          moment(
                            `${item.date} ${item.start_time}`,
                            "YYYY-MM-DD HH:mm",
                          ),
                        )
                          ? "late"
                          : "future"
                      }`}
                      style={{ padding: "3px 8px 3px 8px" }}
                    >
                      {moment().isAfter(
                        moment(
                          `${item.date} ${item.start_time}`,
                          "YYYY-MM-DD HH:mm",
                        ),
                      )
                        ? t("badge.late")
                        : t("badge.future")}
                    </span>
                  )}
                  {item?.status === "in_progress" && (
                    // <span className="mx-2 badge status-badge-inprogress1">
                    <span
                      className={`${
                        item?.steps?.some(
                          (item) =>
                            // item?.delay >= "00d:00h:00m:01s"
                            item?.step_status === "in_progress" &&
                            convertTimeTakenToSeconds(item?.time_taken) >
                              convertCount2ToSeconds(
                                item?.count2,
                                item?.time_unit,
                              ),
                        )
                          ? "status-badge-red1"
                          : "status-badge-inprogress1"
                      } mx-2 badge`}
                    >
                      {t("badge.inprogress")}
                    </span>
                  )}
                  {item.status === "closed" && (
                    <span className="mx-2 badge inprogrss">
                      {t("badge.finished")}
                    </span>
                  )}
                  {item?.status === "abort" && (
                    <span className="mx-2 badge late">{t("badge.cancel")}</span>
                  )}
                  {item?.status === "to_finish" && (
                    <span className="mx-2 badge status-badge-finish">
                      {t("badge.finish")}
                    </span>
                  )}

                  {item?.status === "todo" && (
                    <span className="mx-2 badge status-badge-green">
                      {t("badge.Todo")}
                    </span>
                  )}
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-4 col-12">
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
                  {item?.type === "Action" ||
                  item?.type === "Newsletter" ||
                  item?.type === "Strategy" ? (
                    <span className="time">
                      {formatStepDate(
                        item?.date,
                        item?.starts_at || item?.start_time,
                        item?.timezone,
                      )}{" "}
                      -
                      {formatStepDate(
                        item?.estimate_time?.split("T")[0],
                        item?.starts_at || item?.start_time,
                        item?.timezone,
                      )}{" "}
                      {item?.status !== "closed" && (
                        <span>
                          {daysDifference &&
                            `(${daysDifference} ${t("days")})`}{" "}
                        </span>
                      )}
                      {item?.status === "abort" && (
                        <>
                          {item?.abort_end_time
                            ? abortMeetingTime(
                                item?.abort_end_time,
                                "DD/MM/yyyy",
                                item?.timezone,
                              )
                            : formatStepDate(
                                item?.estimate_time?.split("T")[0],
                                item?.starts_at || item?.start_time,
                                item?.timezone,
                              )}
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="time">
                      {formattedDate}
                      &nbsp; {t("at")} &nbsp;
                      {convertTo12HourFormat(
                        item?.starts_at || item?.start_time,
                        item?.date,
                        item?.steps,
                        item?.timezone,
                      )}{" "}
                      {item?.status === "closed" && (
                        <>
                          -{" "}
                          {formatStepDate(
                            item?.estimate_time?.split("T")[0],
                            item?.starts_at || item?.start_time,
                            item?.timezone,
                          )}{" "}
                          {t("at")} &nbsp;
                          <>
                            {item?.type === "Special" ||
                            item?.type === "Law" ? (
                              <>
                                {specialMeetingEndTime(
                                  item?.start_time,
                                  item?.steps,
                                )}
                              </>
                            ) : (
                              <>
                                {realEndTimeForClosed
                                  ? convertTo12HourFormat(
                                      item?.estimate_time?.split("T")[1],
                                      item?.estimate_time?.split("T")[0],
                                      item?.steps,
                                      item?.timezone,
                                    )
                                  : " "}
                              </>
                            )}
                          </>
                        </>
                      )}
                      {item?.status === "abort" && (
                        <>
                          {item?.abort_end_time ? (
                            <>
                              -{" "}
                              {abortMeetingTime(
                                item?.abort_end_time,
                                "DD/MM/yyyy",
                                item?.timezone,
                              )}{" "}
                              {t("at")} &nbsp;
                              {abortMeetingTime(
                                item?.abort_end_time,
                                "HH[h]mm",
                                item?.timezone,
                              ) || "N/A"}
                            </>
                          ) : (
                            <>
                              -{" "}
                              {formatStepDate(
                                item?.estimate_time?.split("T")[0],
                              )}{" "}
                              {t("at")} &nbsp;
                              {realEndTimeForClosed
                                ? convertTo12HourFormatForClosed(
                                    item?.estimate_time?.split("T")[1],
                                  )
                                : " "}
                            </>
                          )}
                        </>
                      )}
                      {item?.status === "active" ? (
                        totalTime && ` (${totalTime}) `
                      ) : item?.status === "in_progress" ||
                        item?.status === "to_finish" ||
                        item?.status === "todo" ? (
                        <>
                          {calculateTimeDifference(
                            item?.steps,
                            item?.starts_at,
                            item?.current_date,
                          )}
                        </>
                      ) : null}
                    </span>
                  )}
                  {(item?.status === "closed" || item?.status === "abort") && (
                    <>
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

                        {item?.type === "Special" || item?.type === "Law" ? (
                          <span className="time">
                            {item?.estimate_time_time_taken}
                          </span>
                        ) : (
                          <span className="time">
                            {calculateTotalTimeTaken(item?.steps)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="col-md-4 col-12">
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
                          : item?.type === "Prise de contact"
                            ? "Prise de contact"
                            : t(`types.${item?.type}`)}
                  </span>
                </div>
                {/* <div className="col-md-4 col-12">
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
                <span className="time">
                  {" "}
                  {
                           `meeting.newMeeting.options.priorities.${item?.priority}`
                         }
                  
                </span>
              </div> */}
              </div>

              <div className="row mt-3">
                <div className="col-md-4 mt-2">
                  <div className="creator">{t("Creator")}</div>
                  <div className="">
                    <div>
                      <Tooltip title={item?.user?.full_name} placement="top">
                        <Avatar
                          src={
                            item?.user?.image?.startsWith("users/")
                              ? `${Assets_URL}/${item?.user?.image}`
                              : item?.user?.image
                          }
                        />
                      </Tooltip>
                      <span className="creator-name">
                        {item?.user?.full_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 mt-2">
                  {item?.guides?.length > 0 && (
                    <div className="creator">
                      {item?.guides?.length > 1
                        ? t("presentors")
                        : t("presentor")}
                    </div>
                  )}

                  <div className=" d-flex align-items-center flex-wrap">
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
                                // src={
                                //   item?.assigned_to_image
                                //     ? Assets_URL + "/" + item.assigned_to_image
                                //     : item?.participant_image
                                // }
                                src={
                                  item?.participant_image?.startsWith("users/")
                                    ? Assets_URL + "/" + item?.participant_image
                                    : item?.participant_image
                                }
                              />
                            </Tooltip>
                          </>
                        );
                      })}
                    </Avatar.Group>
                    <span
                      style={{
                        marginLeft: item?.guides?.length > 0 ? "8px" : "0px",
                      }}
                    >
                      {item?.guides?.length > 0
                        ? `${item?.guides?.length} ${
                            item?.guides?.length > 1
                              ? t("presentors")
                              : t("presentor")
                          }`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="col-md-4 mt-2">
                  <div className="creator">{t("Privacy")}</div>
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
                                  // src={
                                  //   item?.logo?.startsWith("teams/")
                                  //     ? Assets_URL + "/" + item.logo
                                  //     : item.logo
                                  // }
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
                    ) : item?.moment_privacy === "enterprise" ? (
                      <Tooltip
                        title={item?.user?.enterprise?.name}
                        placement="top"
                      >
                        <img
                          src={
                            item?.user?.enterprise?.logo?.startsWith(
                              "enterprises/",
                            )
                              ? Assets_URL + "/" + item?.user?.enterprise?.logo
                              : item?.user?.enterprise?.logo?.startsWith(
                                    "storage/enterprises/",
                                  )
                                ? Assets_URL +
                                  "/" +
                                  item?.user?.enterprise?.logo
                                : item?.user?.enterprise?.logo
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
                            : item?.moment_privacy === "enterprise"
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
                            : item?.moment_privacy === "password"
                              ? t("solution.badge.password")
                              : t("solution.badge.team")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-1 d-flex justify-content-end">
              <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
                {item?.status === "active" ||
                item?.status === "no_status" ||
                item?.status === "in_progress" ||
                item?.status === "to_finish" ||
                item?.status === "todo" ? (
                  <>
                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        data-bs-toggle="dropdown"
                        // aria-expanded="false"
                        aria-expanded={openDropdownId === item?.id}
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
                            {item?.status !== "no_status" &&
                              (item?.type === "Google Agenda Event" ||
                              item?.type === "Outlook Agenda Event" ? (
                                <li>
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item?.meet_link) {
                                        window.open(item.meet_link, "_blank");
                                      }
                                    }}
                                  >
                                    <AiOutlinePlaySquare size={"20px"} />
                                    &nbsp;
                                    {t("Join the meeting")}
                                  </button>
                                </li>
                              ) : (
                                <li>
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={
                                      item.status === "active"
                                        ? (e) => {
                                            e.stopPropagation();
                                            handlePlay(item);
                                          }
                                        : (e) => {
                                            e.stopPropagation();
                                            changeStatusAndPlay(item);
                                          }
                                    }
                                  >
                                    <AiOutlinePlaySquare size={"20px"} />
                                    &nbsp;
                                    {t("dropdown.play")}
                                  </button>
                                </li>
                              ))}
                            {item?.status !== "in_progress" && (
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                >
                                  <RiEditBoxLine size={"20px"} /> &nbsp;
                                  {t("dropdown.To modify")}
                                </button>
                              </li>
                            )}
                            {item?.status === "in_progress" && (
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangePrivacy(item);
                                  }}
                                >
                                  <RiEditBoxLine size={"18px"} /> &nbsp;
                                  {t("dropdown.change Privacy")}
                                </button>
                              </li>
                            )}
                            {item?.status !== "no_status" && (
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(item);
                                  }}
                                >
                                  <IoCopyOutline size={"18px"} /> &nbsp;
                                  {t("dropdown.Duplicate")}
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }}
                              >
                                <LuLink size={"20px"} /> &nbsp;
                                {t("dropdown.invitation")}
                              </button>
                            </li>
                            {item?.status !== "no_status" && (
                              <>
                                <hr
                                  style={{
                                    margin: "10px 0 0 0",
                                    padding: "2px",
                                  }}
                                />
                                {item?.status === "in_progress" ? (
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setItem1(item);
                                        setShowConfirmationCancelModal(true);
                                      }}
                                    >
                                      <ImCancelCircle
                                        size={"20px"}
                                        color="red"
                                      />
                                      &nbsp; {t("dropdown.Cancel")}
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                      }}
                                      onClick={(e) =>
                                        handleDeleteClick(e, item.id)
                                      }
                                    >
                                      <AiOutlineDelete
                                        size={"20px"}
                                        color="red"
                                      />
                                      &nbsp; {t("dropdown.Delete")}
                                    </button>
                                  </li>
                                )}
                              </>
                            )}
                          </>
                        ) : (
                          <li>
                            <button
                              type="button"
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                copy(currentURL);
                                openLinkInNewTab(currentURL);
                              }}
                            >
                              <LuLink size={"20px"} /> &nbsp;
                              {t("dropdown.reviewinvitation")}
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </>
                ) : (item?.status === "closed" || item?.status === "abort") &&
                  canManage ? (
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
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCallApi(true);

                                  let currentURL = `/destination/${item?.unique_id}/${item?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }}
                              >
                                <MdInsertLink size={"20px"} /> &nbsp;
                                {t("presentation.generateLink")}
                              </button>
                            </li>
                            {item?.status === "closed" && (
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangePrivacy(item);
                                  }}
                                >
                                  <RiEditBoxLine size={"18px"} /> &nbsp;
                                  {t("dropdown.change Privacy")}
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item);
                                }}
                              >
                                <MdContentCopy size={"18px"} /> &nbsp;
                                {t("dropdown.Duplicate")}
                              </button>
                            </li>

                            <hr
                              style={{ margin: "10px 0 0 0", padding: "2px" }}
                            />

                            <li>
                              <button
                                type="button"
                                className="dropdown-item"
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={(e) => handleDeleteClick(e, item?.id)}
                              >
                                <AiOutlineDelete size={20} />
                                &nbsp; {t("dropdown.Delete")}
                              </button>
                            </li>
                          </>
                        ) : (
                          <li>
                            <a
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                viewMeeting(item);
                              }}
                            >
                              <RiPresentationFill size={"20px"} /> &nbsp;
                              {t("dropdown.report")}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <IoEyeOutline
                        size={"28px"}
                        style={{ cursor: "pointer" }}
                        title="Démarrer"
                        onClick={() => viewDraft(item)}
                      />
                    </div>
                    <div>
                      <AiOutlineDelete
                        size={"20px"}
                        style={{ cursor: "pointer" }}
                        // onClick={() => handleDelete(item?.id)}
                        onClick={(e) => handleDeleteClick(e, item?.id)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="tabs-container">
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
        {showConfirmationCancelModal && (
          <ConfirmationModal
            message={t("confirmation")}
            onConfirm={(e) => updateMeetingStatus(e)}
            onCancel={(e) => {
              e.stopPropagation();
              setShowConfirmationCancelModal(false);
            }}
          />
        )}
        {open && (
          <>
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent open={open} closeModal={handleCloseModal} />
            </Suspense>
          </>
        )}
      </div>
    </>
  );
};

export default MomentCard;
//
