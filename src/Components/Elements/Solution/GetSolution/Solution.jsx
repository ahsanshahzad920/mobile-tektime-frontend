import CookieService from "../../../Utils/CookieService";
import React, { useEffect, useState } from "react";
import { Button, Dropdown, Spinner } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "./../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";
import { toast } from "react-toastify";
import { FaArrowRight, FaLocationDot, FaPhone } from "react-icons/fa6";
import { RiEditBoxLine, RiPresentationFill } from "react-icons/ri";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { IoArrowBackSharp, IoCopyOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  MdMeetingRoom,
  MdPublic,
  MdLock,
  MdGroups,
  MdBusiness,
} from "react-icons/md";
import {
  SiGooglemeet,
  SiMicrosoftoutlook,
  SiMicrosoftteams,
} from "react-icons/si";
import { BsPersonWorkspace } from "react-icons/bs";
import { Avatar, Tooltip } from "antd";
import moment from "moment";
import { useSteps } from "../../../../context/Step";
import { FaChartGantt } from "react-icons/fa6";
import { FaList } from "react-icons/fa";
import {
  convertCount2ToSeconds,
  parseTimeTaken,
} from "../../../Utils/MeetingFunctions";
import { useSolutionFormContext } from "../../../../context/CreateSolutionContext";

import ConfirmationModal from "../../../Utils/ConfirmationModal";
import { useSolutions } from "../../../../context/SolutionsContext";
import SolutionHostCard from "./Components/SolutionHostCard";
import SolutionStepCard from "./Components/SolutionStepCard";
import SolutionStepGraph from "./Components/SolutionStepGraph";
import StepChart from "../Createnewsolution/StepChart";
import NewSolutionModal from "../Createnewsolution/NewSolutionModal";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import { FcGoogle } from "react-icons/fc";
// import NewMeetingModal from "../BuildMoment/NewMeetingModal";

const Solution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setStatus } = useSolutions(); // Access setStatus from the context
  const {
    handleShow,
    open,
    setOpen,
    setSolution: setSolutionContext,
    setIsDuplicate,
    setIsUpdated,
    setCheckId,
    setCall,
    call,
  } = useSolutionFormContext();
  const { handleShow: handleShowMeeting, open: openModal } = useFormContext();

  let fromMeeting = false;
  if (location?.state?.from === "meeting") {
    fromMeeting = true;
  }
  const { id } = useParams();
  const [t] = useTranslation("global");
  const { setHeaderTitle } = useHeaderTitle();

  const [meeting, setMeeting] = useState();
  const [meetingStartDate, setMeetingStartDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime1, setStartTime1] = useState(null);
  const [time, setTime] = useState(null);
  const {
    solutionSteps,
    updateSolutionSteps,
    setSolutionType,
    setSolutionNote,
    setSolutionMessageManagement,
    setSolutionId,
    setSolutionFeedback,
    setSolutionAlarm,
    setSolutionShareBy,
    setSolutionTitle,
  } = useSteps();
  const [timeUnitsTotal, setTimeUnitsTotal] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [estimateTime, setEstimateTime] = useState(null);
  const [estimateDate, setEstimateDate] = useState(null);
  const [isDrop, setIsDrop] = useState(false);
  const [view, setView] = useState("list");
  const userId = parseInt(CookieService.get("user_id"));

  // const [ call,setCall] = useState(false)
  const getRefreshMeeting = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setStatus(response?.data?.data?.status);
        setMeetingStartDate(response?.data?.data?.date);
        setHeaderTitle({ titleText: " " });
        const steps = response.data?.data?.solution_steps;
        // updateSteps(steps);
        const time = response?.data?.data?.start_time;
        setMeeting(response.data?.data);
        // setSolutionContext(response?.data?.data);
        updateSolutionSteps(steps);
        setSolutionType(response?.data?.data?.type);
        setSolutionNote(response?.data?.data?.prise_de_notes);
        setSolutionMessageManagement(response?.data?.data?.open_ai_decide);
        setSolutionId(response?.data?.data?.id);

        setSolutionFeedback(response?.data?.data?.feedback);
        setSolutionAlarm(response?.data?.data?.alarm);
        setSolutionShareBy(response?.data?.data?.share_by);
        setSolutionTitle(response?.data?.data?.title);
        setTime(response?.data?.data?.start_time);
        const date = response?.data?.data?.estimate_time;
        const dateOnly = date.split("T")[0];

        // Split the date into year, month, and day
        const [year, month, day] = dateOnly.split("-");

        // Format the date as dd/mm/yyyy
        const formattedDate1 = `${day}/${month}/${year}`;
        const timeOnly = date.split("T")[1].split(".")[0];

        // Convert the time to a Date object for easy 12-hour conversion
        const [hours1, minutes1, seconds1] = timeOnly.split(":");
        // let hours12 = hours1 % 12 || 12; // Convert to 12-hour format, handle 00 as 12
        // const amPm = hours1 >= 12 ? "PM" : "AM";
        console.log("dateOnly", formattedDate);
        console.log("timeOnly", timeOnly);
        const formattedTime = `${hours1}h${minutes1}${
          response?.data?.data?.type === "Quiz" ? `m${seconds1}` : ""
        }`;
        console.log("formattedTime", formattedTime);

        setEstimateTime(formattedTime);
        setEstimateDate(formattedDate1);
        // Calculate the total count2
        const totalCount2 = steps?.reduce((acc, step) => acc + step.count2, 0);
        console.log("totalCount2: ", totalCount2);
        // Convert start time to a Date object
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours);
        startDate.setMinutes(minutes);
        startDate.setSeconds(seconds);

        // Add totalCount2 minutes to the start date
        startDate.setMinutes(startDate.getMinutes() + totalCount2);

        // Format the new time
        const formattedTimeAfterAddingStepsTime = startDate.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          },
        );
        setStartTime1(formattedTimeAfterAddingStepsTime);
        const totals = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        steps.forEach((step) => {
          switch (step.time_unit) {
            case "days":
              totals.days += step.time;
              break;
            case "hours":
              totals.hours += step.time;
              break;
            case "minutes":
              totals.minutes += step.time;
              break;
            case "seconds":
              totals.seconds += step.time;
              break;
            default:
              break;
          }
        });

        setTimeUnitsTotal(totals);
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);
    } finally {
      // setIsLoading(false);
    }
  };
  const getMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setStatus(response?.data?.data?.status);
        setMeetingStartDate(response?.data?.data?.date);
        setHeaderTitle({ titleText: " " });
        const steps = response.data?.data?.solution_steps;
        // updateSteps(steps);
        const time = response?.data?.data?.start_time;
        updateSolutionSteps(steps);
        setSolutionType(response?.data?.data?.type);
        setSolutionNote(response?.data?.data?.prise_de_notes);
        setSolutionMessageManagement(response?.data?.data?.open_ai_decide);
        setSolutionFeedback(response?.data?.data?.feedback);
        setSolutionId(response?.data?.data?.id);

        setSolutionAlarm(response?.data?.data?.alarm);
        setSolutionShareBy(response?.data?.data?.share_by);
        setSolutionTitle(response?.data?.data?.title);

        setMeeting(response.data?.data);
        // setSolutionContext(response?.data?.data);
        setTime(response?.data?.data?.start_time);
        const date = response?.data?.data?.estimate_time;
        const dateOnly = date.split("T")[0];

        // Split the date into year, month, and day
        const [year, month, day] = dateOnly.split("-");

        // Format the date as dd/mm/yyyy
        const formattedDate1 = `${day}/${month}/${year}`;
        const timeOnly = date.split("T")[1].split(".")[0];

        // Convert the time to a Date object for easy 12-hour conversion
        const [hours1, minutes1, seconds1] = timeOnly.split(":");
        // let hours12 = hours1 % 12 || 12; // Convert to 12-hour format, handle 00 as 12
        // const amPm = hours1 >= 12 ? "PM" : "AM";
        console.log("dateOnly", formattedDate);
        console.log("timeOnly", timeOnly);
        const formattedTime = `${hours1}h${minutes1}${
          response?.data?.data?.type === "Quiz" ? `m${seconds1}` : ""
        }`;
        console.log("formattedTime", formattedTime);

        setEstimateTime(formattedTime);
        setEstimateDate(formattedDate1);
        // Calculate the total count2
        const totalCount2 = steps?.reduce((acc, step) => acc + step.count2, 0);
        console.log("totalCount2: ", totalCount2);
        // Convert start time to a Date object
        const [hours, minutes, seconds] = time.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours);
        startDate.setMinutes(minutes);
        startDate.setSeconds(seconds);

        // Add totalCount2 minutes to the start date
        startDate.setMinutes(startDate.getMinutes() + totalCount2);

        // Format the new time
        const formattedTimeAfterAddingStepsTime = startDate.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          },
        );
        setStartTime1(formattedTimeAfterAddingStepsTime);
        const totals = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
        steps.forEach((step) => {
          switch (step.time_unit) {
            case "days":
              totals.days += step.time;
              break;
            case "hours":
              totals.hours += step.time;
              break;
            case "minutes":
              totals.minutes += step.time;
              break;
            case "seconds":
              totals.seconds += step.time;
              break;
            default:
              break;
          }
        });

        setTimeUnitsTotal(totals);
      }
    } catch (error) {
      console.log("error while fetching meeting data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMeeting();
    // getMeeting1();
  }, [id, showModal]);
  useEffect(() => {
    getRefreshMeeting();
    // getMeeting1();
  }, [call]);

  const date = new Date(meeting?.date);
  // Get individual components of the date
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  // Format the date in dd:mm:yyyy
  const formattedDate = `${day}/${month}/${year}`;

  const startTime = meeting?.start_time;
  const formattedTime = new Date(`1970-01-01T${startTime}`).toLocaleTimeString(
    "en-US",
    { hour: "2-digit", minute: "2-digit", hour12: true },
  );

  const calculateTotalDays = (steps) => {
    if (!steps) {
      return;
    }
    return steps?.reduce((total, step) => {
      return total + step.count2;
    }, 0);
  };

  const [loading, setLoading] = useState(false);

  const handleEdit = (item) => {
    const solutionCreatorId = parseInt(item?.solution_creator?.id);
    if (item?.solution_privacy === "public" && solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }
    // navigate(`/updateMeeting/${item?.id}`);
    setCheckId(item.id);
    setIsUpdated(true);
    handleShow();
    setSolutionContext(item);
  };
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleCopy = async (item) => {
    const solutionCreatorId = Number(item?.solution_creator?.id);
    if (item?.solution_privacy === "public" && solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }

    try {
      // // Parse the start time string
      // const [hour, minute] = startTime.split(":").map(Number);

      // // Add one hour to the hour component
      // let endHour = hour + 1;

      // // If end hour is greater than or equal to 24, subtract 24
      // if (endHour >= 24) {
      //   endHour -= 24;
      // }

      // // Format the end time as a string
      // const endTimeStr = `${String(endHour).padStart(2, "0")}:${String(
      //   minute
      // ).padStart(2, "0")}`;
      // Prepare the steps array with null values for specific fields
      const updatedSteps = item?.solution_steps?.map((step) => ({
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
        time_taken: null,
        note: null,
        negative_time: 0,
        new_current_time: null,
        new_current_date: null,
        assigned_to_name: null,
        summary_status: false,
      }));
      const postData = {
        ...item,
        steps: updatedSteps,
        _method: "put",
        duplicate: true,
        status: "active",
        // end_time: endTimeStr,
        timezone: userTimeZone,
        delay: null,
        plan_d_actions: null,
        step_decisions: null,
        step_notes: null,
        starts_at: null,
        eventId: null,
        moment_privacy_teams: [],
        newly_created_team: null,
        // voice_notes: null,
        // voice_blob: null,
      };
      console.log("copy meeting payload--->", postData);
      const response = await axios.post(
        `${API_BASE_URL}/solutions/${item?.id}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            // Accept: "application/json",
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
        setSolutionContext(data);
        // toast.error("Request failed:", response.status, response.statusText);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error(t("Duplication Failed, Check your Internet connection"));
    }
  };
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showConfirmationCancelModal, setShowConfirmationCancelModal] =
    useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const handleDelete = async (item) => {
    const solutionCreatorId = parseInt(item?.solution_creator?.id);
    if (item?.solution_privacy === "public" && solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/solutions/${item?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success(t("solutionDeletedSuccessfullToast"));
        // getMeetings();
        navigate("/solution");
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
    }
  };
  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    setItemIdToDelete(item);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const updateMeetingStatus = async (e) => {
    e.stopPropagation();
    const realEndTime = moment().format("HH:mm:ss");
    try {
      const postData = {
        ...meeting,
        // real_end_time: realEndTime,
        abort_end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
        status: "abort",
        _method: "put",
        // plan_d_actions: null,
        // step_notes: stepNotes,
        // step_notes: null,
        // step_decisions: null,
        step_notes: null,
        steps: meeting?.steps?.map((step) => ({
          ...step,
          step_status: "cancelled",
          status: "cancelled",
        })),
        moment_privacy_teams:
          meeting?.moment_privacy_teams?.map((item) => item?.id) || [],
      };
      const response = await axios.post(
        `${API_BASE_URL}/meetings/${id}/status`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        console.log("meeting status changed successfully", response.data);
        // toast.success(response.data?.message);
        navigate("/meeting");
        //
      }
    } catch (error) {
      // console.log("error ", error);
    }
  };

  const [open1, setOpen1] = useState(false);
  const handleToggle = () => {
    setView(view === "list" ? "graph" : "list");
    setOpen1(!open1);
  };
  const [newId, setNewId] = useState(null);
  // const [show2, setShow2] = useState(false); // Assuming repetition is mandatory
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const startDate = new Date(`${meeting?.date}T${meeting?.start_time}`);
  console.log("startDate", startDate);
  const totalDays = calculateTotalDays(meeting?.steps);
  console.log("totalDatas", totalDays);

  let endDateForHour;
  if (meeting?.type === "Action") {
    // If the meeting type is "Active", treat totalDays as total days
    endDateForHour = new Date(
      startDate.getTime() + totalDays * 24 * 60 * 60 * 1000,
    );
  } else if (meeting?.type === "Task") {
    // If the meeting type is "Task", treat totalDays as total hours
    endDateForHour = new Date(startDate.getTime() + totalDays * 60 * 60 * 1000);
  } else if (meeting?.type === "Quiz") {
    // If the meeting type is "Quiz", treat totalDays as total seconds
    endDateForHour = new Date(startDate.getTime() + totalDays * 1000);
  } else {
    // Otherwise, treat totalDays as total minutes
    endDateForHour = new Date(startDate.getTime() + totalDays * 60 * 1000);
  }

  function calculateTotalTime(steps) {
    if (!steps) {
      return "";
    }
    let totalSeconds = 0;
    let count2InSeconds = 0;
    let timeTakenInSeconds = 0;
    steps?.forEach((step) => {
      const timeTaken = step.time_taken;
      const stepStatus = step.step_status;
      const count2 = step.count2;
      const timeUnit = step.time_unit;

      console.log("time_taken", timeTaken);
      console.log("stepStatus", stepStatus);
      console.log("count2", count2);
      console.log("timeUnit", timeUnit);

      if (stepStatus === "completed") {
        if (timeTaken) {
          totalSeconds += parseTimeTaken(timeTaken);
        }
      } else if (stepStatus === "in_progress") {
        count2InSeconds = convertCount2ToSeconds(count2, timeUnit);
        timeTakenInSeconds = parseTimeTaken(step?.time_taken);

        if (count2InSeconds > timeTakenInSeconds) {
          totalSeconds += convertCount2ToSeconds(count2, timeUnit);
        } else if (timeTaken) {
          totalSeconds += parseTimeTaken(timeTaken);
        }
      } else {
        // totalSeconds += parseTimeTaken(timeTaken);
        totalSeconds += convertCount2ToSeconds(count2, timeUnit);
      }
    });

    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    console.log("days", days);
    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    let result = "";
    // if (days > 0) result += `${days} ${timeUnits["days"] || "days"} `;
    // if (hrs > 0) result += `${hrs} ${timeUnits["hours"] || "hours"} `;
    // if (mins > 0) result += `${mins} ${timeUnits["mins"] || "mins"} `;
    // if (secs > 0) result += `${secs} ${timeUnits["secs"] || "secs"}`;

    if (days > 0) result += `${days} ${timeUnits["days"] || "days"} `;
    if (hrs > 0) result += `${hrs} ${timeUnits["hours"] || "hours"} `;
    if (mins > 0) result += `${mins} ${timeUnits["mins"] || "mins"} `;

    // Only show seconds if no days, hours, or minutes are present
    if (days === 0 && hrs === 0 && mins === 0 && secs > 0) {
      result += `${secs} ${timeUnits["secs"] || "secs"}`;
    }

    console.log("result", result);
    return result.trim();
  }

  const totalTime = calculateTotalTime(meeting?.solution_steps);

  //Host
  const [activeProfileId, setActiveProfileId] = useState(null);
  const handleHostShow = (profileId) => {
    setActiveProfileId(profileId);
  };
  const hideHostShow = () => {
    setActiveProfileId(null);
  };
  return (
    <>
      {isLoading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="tabs-container">
          <div
            className="invite w-100"
            style={{
              position: fromMeeting ? "static" : "static",
              backgroundColor: fromMeeting ? "white" : "white",
              // height: fromMeeting && "100%" ,
              padding: "0px 15px",
            }}
          >
            <div className={""}>
              <div
              // className="content-child"
              // style={{ top: fromMeeting && "30px" }}
              >
                <div className="row child-1">
                  <div className="col-12 w-100 d-flex justify-content-between align-items-start">
                    <div className="left-content w-100">
                      <div className="invite-header">
                        <div
                          style={{
                            marginTop: 0,
                            width: "80%",
                          }}
                        >
                          <h5 className="content-heading-title w-100">
                            {meeting?.title}
                            <span
                              style={{
                                verticalAlign: "text-bottom",
                              }}
                            >
                              {/* <span
                                className={`badge ms-2 future`}
                                style={{ padding: "3px 8px 3px 8px" }}
                              >
                                {t("badge.future")}
                              </span> */}
                            </span>
                          </h5>
                        </div>
                      </div>

                      {/* <div>
                        <div className="d-flex align-items-center gap-2 content-body">
                          <div className="d-flex align-items-center gap-2">
                            <img src="/Assets/invite-date.svg" />

                            {meeting?.type === "Action1" ||
                            meeting?.type === "Newsletter" ? (
                              <>
                                {fromMeeting ? (
                                  <>
                                    <span className="fw-bold formate-date">
                                      {formattedDate}
                                    </span>{" "}
                                    -
                                    <span className="fw-bold formate-date">
                                      {estimateDate}
                                    </span>
                                  </>
                                ) : (
                                  <span className="fw-bold formate-date">
                                    {estimateDate}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                {fromMeeting ? (
                                  <>
                                    <span className="fw-bold formate-date">
                                      {formattedDate}
                                      &nbsp; {t("at")}
                                    </span>
                                    <span className="fw-bold formate-date">
                                      {meeting?.status === "in_progress"
                                        ? convertTo12HourFormat(
                                            meeting?.starts_at,
                                            meeting?.steps
                                          )
                                        : convertTo12HourFormat(
                                            meeting?.start_time,
                                            meeting?.steps
                                          )}{" "}
                                      -{" "}
                                    </span>

                                    <span className="fw-bold formate-date">
                                      {estimateDate}
                                      &nbsp; {t("at")}
                                    </span>
                                    <span className="fw-bold formate-date">
                                      {estimateTime}
                                    </span>
                                  </>
                                ) : (
                                  <span className="fw-bold formate-date">
                                    {formattedEndDateInHours}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div> */}

                      {meeting?.description && (
                        <div className="paragraph-parent mt-1 w-100">
                          <span className="paragraph paragraph-images">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: meeting?.description || "",
                              }}
                            />
                          </span>
                        </div>
                      )}
                      <div className="items d-flex flex-wrap gap-4 align-items-center mt-1">
                        <div className="type d-flex align-items-center gap-2">
                          <svg
                            width="20"
                            height="20"
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
                            {meeting?.type === "Special"
                              ? "Media"
                              : meeting?.type}
                          </span>
                        </div>

                        {/* Location Info matching Invite.jsx */}
                        <div className="location-info w-100 mt-3">
                          {(meeting?.location &&
                            meeting?.location !== "None") ||
                          (meeting?.agenda && meeting?.agenda !== "None") ? (
                            <div className="d-flex gap-4 align-items-center mb-2">
                              {meeting?.location &&
                                meeting?.location !== "None" && (
                                  <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                    {meeting?.location === "Zoom" ? (
                                      <>
                                        <svg
                                          width="28px"
                                          height="28px"
                                          viewBox="0 0 32 32"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M2 11.6C2 8.23969 2 6.55953 2.65396 5.27606C3.2292 4.14708 4.14708 3.2292 5.27606 2.65396C6.55953 2 8.23969 2 11.6 2H20.4C23.7603 2 25.4405 2 26.7239 2.65396C27.8529 3.2292 28.7708 4.14708 29.346 5.27606C30 6.55953 30 8.23969 30 11.6V20.4C30 23.7603 30 25.4405 29.346 26.7239C28.7708 27.8529 27.8529 28.7708 26.7239 29.346C25.4405 30 23.7603 30 20.4 30H11.6C8.23969 30 6.55953 30 5.27606 29.346C4.14708 28.7708 3.2292 27.8529 2.65396 26.7239C2 25.4405 2 23.7603 2 20.4V11.6Z"
                                            fill="#4087FC"
                                          ></path>
                                          <path
                                            d="M8.26667 10C7.56711 10 7 10.6396 7 11.4286V18.3571C7 20.369 8.44612 22 10.23 22L17.7333 21.9286C18.4329 21.9286 19 21.289 19 20.5V13.5C19 11.4881 17.2839 10 15.5 10L8.26667 10Z"
                                            fill="white"
                                          ></path>
                                          <path
                                            d="M20.7122 12.7276C20.2596 13.1752 20 13.8211 20 14.5V17.3993C20 18.0782 20.2596 18.7242 20.7122 19.1717L23.5288 21.6525C24.1019 22.2191 25 21.7601 25 20.9005V11.1352C25 10.2755 24.1019 9.81654 23.5288 10.3832L20.7122 12.7276Z"
                                            fill="white"
                                          ></path>
                                        </svg>
                                        <span className="ms-2">
                                          {meeting?.location}
                                        </span>
                                      </>
                                    ) : meeting?.location ===
                                      "Microsoft Teams" ? (
                                      <>
                                        <SiMicrosoftteams
                                          style={{ color: "#6264A7" }}
                                          size={28}
                                        />
                                        <span className="ms-2">
                                          {meeting?.location}
                                        </span>
                                      </>
                                    ) : meeting?.location === "Google Meet" ? (
                                      <>
                                        <svg
                                          width="28px"
                                          height="28px"
                                          viewBox="0 0 32 32"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.23969 30 6.55953 30 5.27606 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                                            fill="white"
                                          ></path>
                                          <path
                                            d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z"
                                            fill="#FBBC05"
                                          ></path>
                                          <path
                                            d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z"
                                            fill="#FBBC05"
                                          ></path>
                                          <path
                                            d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z"
                                            fill="#34A853"
                                          ></path>
                                          <path
                                            d="M10.1042 7L5 12.4H10.0956L10.1042 7Z"
                                            fill="#EA4335"
                                          ></path>
                                          <path
                                            d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z"
                                            fill="#1967D2"
                                          ></path>
                                          <path
                                            d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z"
                                            fill="#4285F4"
                                          ></path>
                                          <path
                                            d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z"
                                            fill="#34A853"
                                          ></path>
                                          <path
                                            d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z"
                                            fill="#188038"
                                          ></path>
                                        </svg>
                                        <span className="ms-2">
                                          {meeting?.location}
                                        </span>
                                      </>
                                    ) : null}
                                  </p>
                                )}
                              {meeting?.agenda &&
                                meeting?.agenda !== "None" && (
                                  <p className="d-flex gap-2 justify-content-start ps-0 fw-bold align-items-center mb-0">
                                    {meeting?.agenda === "Outlook Agenda" ? (
                                      <>
                                        <SiMicrosoftoutlook
                                          style={{ color: "#0078D4" }}
                                          className="fs-5"
                                          size={28}
                                        />
                                        <span className="solutioncards option-text">
                                          {meeting?.user?.integration_links?.find(
                                            (item) =>
                                              item.platform ===
                                              "Outlook Agenda",
                                          )?.value || "Outlook Agenda"}
                                        </span>
                                      </>
                                    ) : meeting?.agenda === "Google Agenda" ? (
                                      <>
                                        <FcGoogle size={28} />
                                        <span className="solutioncards option-text">
                                          {meeting?.user?.integration_links?.find(
                                            (item) =>
                                              item.platform === "Google Agenda",
                                          )?.value || "Google Agenda"}
                                        </span>
                                      </>
                                    ) : null}
                                  </p>
                                )}
                            </div>
                          ) : null}

                          <div className="ps-0">
                            {meeting?.address ? (
                              <p className="d-flex gap-2 align-items-center justify-content-start ps-0 ms-0 mt-2">
                                <FaLocationDot size={25} color="#8590A3" />
                                <span>{meeting?.address}</span>
                              </p>
                            ) : null}
                          </div>
                          {meeting?.room_details ? (
                            <div>
                              <p className="d-flex gap-2 mt-2 justify-content-start align-items-top ps-0">
                                <BsPersonWorkspace size={25} color="#8590A3" />
                                <p className="m-0">{meeting?.room_details}</p>
                              </p>
                            </div>
                          ) : null}
                          {meeting?.phone ? (
                            <div>
                              <p className="d-flex gap-2 align-items-center justify-content-start ps-0 mt-2">
                                <FaPhone size={25} color="#8590A3" />
                                <a
                                  href={`tel:${meeting.phone}`}
                                  className="text-decoration-none text-dark"
                                >
                                  <span>{meeting.phone}</span>
                                </a>
                              </p>
                            </div>
                          ) : null}
                          <div className="d-flex flex-wrap gap-3 mb-4">
                            {meeting?.prise_de_notes === "Automatic" && (
                              <>
                                <div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 28 28"
                                    fill="none"
                                  >
                                    <g filter="url(#filter0_d_1_1154)">
                                      <circle
                                        cx="14"
                                        cy="12"
                                        r="10"
                                        stroke="url(#paint0_linear_1_1154)"
                                        strokeWidth="4"
                                      />
                                    </g>
                                    <defs>
                                      <filter
                                        id="filter0_d_1_1154"
                                        x="0"
                                        y="0"
                                        width="28"
                                        height="28"
                                        filterUnits="userSpaceOnUse"
                                        colorInterpolationFilters="sRGB"
                                      >
                                        <feFlood
                                          floodOpacity="0"
                                          result="BackgroundImageFix"
                                        />
                                        <feColorMatrix
                                          in="SourceAlpha"
                                          type="matrix"
                                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                          result="hardAlpha"
                                        />
                                        <feOffset dy="2" />
                                        <feGaussianBlur stdDeviation="1" />
                                        <feColorMatrix
                                          type="matrix"
                                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                                        />
                                        <feBlend
                                          mode="normal"
                                          in2="BackgroundImageFix"
                                          result="effect1_dropShadow_1_1154"
                                        />
                                        <feBlend
                                          mode="normal"
                                          in="SourceGraphic"
                                          in2="effect1_dropShadow_1_1154"
                                          result="shape"
                                        />
                                      </filter>
                                      <linearGradient
                                        id="paint0_linear_1_1154"
                                        x1="14"
                                        y1="0"
                                        x2="20.375"
                                        y2="21.75"
                                        gradientUnits="userSpaceOnUse"
                                      >
                                        <stop stopColor="#B11FAB" />
                                        <stop
                                          offset="0.514"
                                          stopColor="#56E8F1"
                                        />
                                        <stop offset="1" stopColor="#2F47C1" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  <span className="solutioncards option-text">
                                    {t(
                                      "meeting.formState.Automatic note taking",
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.alarm === true && (
                              <>
                                <div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="24"
                                    viewBox="0 0 25 24"
                                    fill="none"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                      fill="#3D57B5"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Beep alarm")}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.autostart === true && (
                              <>
                                <div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="24"
                                    viewBox="0 0 25 24"
                                    fill="none"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                      fill="#3D57B5"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Autostart")}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.playback === "automatic" && (
                              <>
                                <div>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="24"
                                    viewBox="0 0 25 24"
                                    fill="none"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                                      fill="#3D57B5"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Lecture playback")}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.notification === true && (
                              <>
                                <div>
                                  <svg
                                    width="25px"
                                    height="24px"
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
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                      ></path>{" "}
                                      <circle
                                        cx="19"
                                        cy="5"
                                        r="3"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                      ></circle>{" "}
                                      <path
                                        d="M7 14H16"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                      ></path>{" "}
                                      <path
                                        d="M7 17.5H13"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.notification")}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.open_ai_decide === true && (
                              <>
                                <div>
                                  <svg
                                    width="25px"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                                      stroke="#3D57B5"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("Gestion des messages")}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.automatic_instruction === true && (
                              <>
                                <div>
                                  <svg
                                    width="25"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM19 19H5V5H19V19ZM17 16H7V14H17V16ZM17 12H7V10H17V12ZM17 8H7V6H17V8Z"
                                      fill="#3D57B5"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t(
                                      "meeting.formState.Automatic Instruction",
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                            {meeting?.remainder && (
                              <>
                                <div>
                                  <svg
                                    width="25"
                                    height="24px"
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
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        d="M12 9V13L14.5 15.5"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M3.5 4.5L7.50002 2"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M20.5 4.5L16.5 2"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      ></path>{" "}
                                      <path
                                        d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                                        stroke="#3D57B5"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Remainder")}
                                  </span>
                                </div>
                              </>
                            )}

                            {meeting?.feedback && (
                              <>
                                <div>
                                  <svg
                                    width="25px"
                                    height="24px"
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
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      {" "}
                                      <path
                                        d="M16 1C17.6569 1 19 2.34315 19 4C19 4.55228 18.5523 5 18 5C17.4477 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H16C16.5523 21 17 20.5523 17 20V19C17 18.4477 17.4477 18 18 18C18.5523 18 19 18.4477 19 19V20C19 21.6569 17.6569 23 16 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H16Z"
                                        fill="#3D57B5"
                                      ></path>{" "}
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M20.7991 8.20087C20.4993 7.90104 20.0132 7.90104 19.7133 8.20087L11.9166 15.9977C11.7692 16.145 11.6715 16.3348 11.6373 16.5404L11.4728 17.5272L12.4596 17.3627C12.6652 17.3285 12.855 17.2308 13.0023 17.0835L20.7991 9.28666C21.099 8.98682 21.099 8.5007 20.7991 8.20087ZM18.2991 6.78666C19.38 5.70578 21.1325 5.70577 22.2134 6.78665C23.2942 7.86754 23.2942 9.61999 22.2134 10.7009L14.4166 18.4977C13.9744 18.9398 13.4052 19.2327 12.7884 19.3355L11.8016 19.5C10.448 19.7256 9.2744 18.5521 9.50001 17.1984L9.66448 16.2116C9.76728 15.5948 10.0602 15.0256 10.5023 14.5834L18.2991 6.78666Z"
                                        fill="#3D57B5"
                                      ></path>{" "}
                                      <path
                                        d="M5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7Z"
                                        fill="#3D57B5"
                                      ></path>{" "}
                                      <path
                                        d="M5 11C5 10.4477 5.44772 10 6 10H10C10.5523 10 11 10.4477 11 11C11 11.5523 10.5523 12 10 12H6C5.44772 12 5 11.5523 5 11Z"
                                        fill="#3D57B5"
                                      ></path>{" "}
                                      <path
                                        d="M5 15C5 14.4477 5.44772 14 6 14H7C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16H6C5.44772 16 5 15.5523 5 15Z"
                                        fill="#3D57B5"
                                      ></path>{" "}
                                    </g>
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Feedbacks")}
                                  </span>
                                </div>
                              </>
                            )}

                            {meeting?.automatic_strategy && (
                              <>
                                <div>
                                  <svg
                                    width="25"
                                    height="24px"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                                      fill="#3D57B5"
                                    />
                                  </svg>
                                  <span
                                    className="solutioncards"
                                    style={{ color: "#3D57B5" }}
                                  >
                                    {t("meeting.formState.Automatic Strategy")}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Privacy Info matching Invite.jsx */}
                        <div className="d-flex align-items-center flex-wrap gap-3 mt-4">
                          <span
                            style={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: 400,
                              lineHeight: "14.52px",
                              textAlign: "left",
                              color: "#8590a3",
                            }}
                          >
                            {t("Privacy")}:
                          </span>

                          <div className="d-flex align-items-center flex-wrap">
                            {meeting?.solution_privacy === "public" ? (
                              <Avatar
                                src="/Assets/Tek.png"
                                style={{ borderRadius: "0" }}
                              />
                            ) : meeting?.solution_privacy === "team" ? (
                              <Avatar.Group maxCount={8}>
                                {meeting?.solution_privacy_team_data?.map(
                                  (item) => {
                                    return (
                                      <Tooltip
                                        title={item?.name}
                                        placement="top"
                                        key={item?.id}
                                      >
                                        <Avatar
                                          size="large"
                                          src={
                                            item?.logo?.startsWith("http")
                                              ? item.logo
                                              : Assets_URL + "/" + item.logo
                                          }
                                        />
                                      </Tooltip>
                                    );
                                  },
                                )}
                              </Avatar.Group>
                            ) : meeting?.solution_privacy === "enterprise" ? (
                              <Avatar.Group maxCount={8}>
                                {meeting?.solution_privacy_enterprise_data?.map(
                                  (item) => {
                                    return (
                                      <Tooltip
                                        title={item?.name}
                                        placement="top"
                                        key={item?.id}
                                      >
                                        <Avatar
                                          size="large"
                                          src={
                                            item?.logo?.startsWith("http")
                                              ? item.logo
                                              : Assets_URL + "/" + item.logo
                                          }
                                        />
                                      </Tooltip>
                                    );
                                  },
                                )}
                              </Avatar.Group>
                            ) : null}

                            <span
                              className={`badge ms-2 text-capitalize ${
                                meeting?.solution_privacy === "private"
                                  ? "solution-badge-red"
                                  : meeting?.solution_privacy === "public"
                                    ? "solution-badge-green"
                                    : meeting?.solution_privacy ===
                                          "enterprise" ||
                                        meeting?.solution_privacy ===
                                          "participant only"
                                      ? "solution-badge-blue"
                                      : "solution-badge-yellow"
                              }`}
                              style={{ padding: "3px 8px 3px 8px" }}
                            >
                              {t(`profile.${meeting?.solution_privacy}`) ||
                                meeting?.solution_privacy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="right-content ps-3">
                      <div className="play-btn-container d-flex flex-column align-items-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                          {meeting?.logo && (
                            <div className="solution-logo">
                              <img
                                src={meeting?.logo}
                                alt="Solution Logo"
                                style={{
                                  width: "150px",
                                  height: "150px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid #e0e0e0",
                                }}
                              />
                            </div>
                          )}
                          {meeting?.solution_privacy === "public" &&
                          parseInt(meeting?.solution_creator?.id) !==
                            userId ? null : (
                            <Dropdown className="dropdown">
                              <Dropdown.Toggle
                                variant="white"
                                id="dropdown-basic"
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  padding: 0,
                                }}
                              >
                                <BiDotsVerticalRounded
                                  color="black"
                                  size={"25px"}
                                />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={(e) => {
                                    handleEdit(meeting);
                                  }}
                                >
                                  <RiEditBoxLine size={"20px"} /> &nbsp;
                                  {t("dropdown.To modify")}
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(meeting);
                                  }}
                                >
                                  <IoCopyOutline size={"18px"} /> &nbsp;
                                  {t("dropdown.Duplicate")}
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={(e) => handleDeleteClick(e, meeting)}
                                >
                                  <AiOutlineDelete size={"20px"} color="red" />
                                  &nbsp; {t("dropdown.Delete")}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          )}
                        </div>

                        <div className="d-flex align-items-center justify-content-end">
                          {loading ? (
                            <button
                              className={`btn play-btn`}
                              style={{ padding: "10px 40px" }}
                            >
                              <Spinner
                                as="span"
                                variant="light"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                animation="border"
                              />
                            </button>
                          ) : (
                            <Button
                              className="btn play-btn"
                              onClick={() => {
                                handleShowMeeting();
                              }}
                              disabled={loading}
                            >
                              {t("solution.Build Moment")}

                              <FaArrowRight
                                size={12}
                                style={{
                                  marginLeft: ".5rem",
                                  fontWeight: 700,
                                }}
                              />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cards-section child-2">
                  <div style={{ marginTop: "4rem" }}>
                    <h4
                      className={
                        fromMeeting
                          ? "participant-heading-meeting"
                          : "participant-heading-meeting"
                      }
                    >
                      {activeProfileId === meeting?.solution_creator?.id && (
                        <IoArrowBackSharp
                          onClick={hideHostShow}
                          size={25}
                          style={{
                            cursor: "pointer",
                            marginRight: "1rem",
                          }}
                        />
                      )}
                      Architek
                    </h4>
                    <div
                      className="host row"
                      style={{
                        background:
                          activeProfileId === meeting?.solution_creator?.id &&
                          "white",
                      }}
                    >
                      <SolutionHostCard
                        data={meeting?.solution_creator}
                        fromMeeting={fromMeeting}
                        handleShow={() =>
                          handleHostShow(meeting?.solution_creator?.id)
                        }
                        handleHide={hideHostShow}
                        showProfile={
                          activeProfileId === meeting?.solution_creator?.id
                        }
                        meeting={meeting}
                        useIdField="nick_name"
                        isUserType={true}
                      />
                    </div>
                  </div>

                  {/* ------------------------------------------------ Invitees */}
                  {meeting?.participants &&
                    meeting?.participants?.length > 0 && (
                      <div style={{ marginTop: "4rem" }}>
                        <h4
                          className={
                            fromMeeting
                              ? "participant-heading-meeting"
                              : "participant-heading-meeting"
                          }
                        >
                          {meeting?.participants?.some(
                            (p) => p.id === activeProfileId,
                          ) && (
                            <IoArrowBackSharp
                              onClick={hideHostShow}
                              size={25}
                              style={{
                                cursor: "pointer",
                                marginRight: "1rem",
                              }}
                            />
                          )}
                          {t("Invitees") || "Invitées"}
                        </h4>
                        <div className="host row">
                          {meeting?.participants?.map((participant) => (
                            <SolutionHostCard
                              key={participant.id}
                              data={{
                                ...participant,
                                name: participant.first_name,
                                image: participant.participant_image,
                              }}
                              fromMeeting={fromMeeting}
                              handleShow={() => handleHostShow(participant.id)}
                              handleHide={hideHostShow}
                              showProfile={activeProfileId === participant.id}
                              meeting={meeting}
                              useIdField="id"
                              isUserType={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* ------------------------------------------------ Steps */}

                  <div style={{ marginTop: "5rem", marginBottom: "3rem" }}>
                    <h4
                      className={`${
                        fromMeeting
                          ? "participant-heading-meeting"
                          : "participant-heading-meeting"
                      } d-flex align-items-center justify-content-between`}
                    >
                      {`${t("step")} `}
                      <span style={{ cursor: "pointer" }}>
                        <div className="toggle-button">
                          <button
                            className={`toggle-button-option ${
                              view === "list" ? "active" : ""
                            }`}
                            onClick={() => handleToggle("list")}
                          >
                            <div className="icon-list" />
                            <FaList size={18} />
                          </button>
                          <button
                            className={`toggle-button-option ${
                              view === "graph" ? "active" : ""
                            }`}
                            onClick={() => handleToggle("graph")}
                          >
                            <div className="icon-graph" />
                            <FaChartGantt size={20} />
                          </button>
                        </div>
                      </span>
                    </h4>
                    {view === "graph" ? (
                      <SolutionStepGraph
                        data={meeting}
                        meetingId={meeting?.id}
                        steps={solutionSteps}
                      />
                    ) : (
                      <SolutionStepCard
                        data={solutionSteps}
                        startTime={formattedTime}
                        users={{
                          ...meeting?.user,
                          firstName: meeting?.user?.name,
                          lastName: meeting?.user?.last_name,
                          image:
                            // meeting?.user?.assigned_to_image ||
                            meeting?.user?.image || "/Assets/avatar.jpeg",
                        }}
                        fromMeeting={fromMeeting}
                        meeting1={meeting}
                      />
                    )}
                    <div className="invite-buttons">
                      {meeting?.solution_privacy === "public" &&
                      parseInt(meeting?.solution_creator?.id) !==
                        userId ? null : (
                        <button
                          onClick={() => {
                            setIsDrop(true);
                            setIsUpdated(false);
                            setShowModal(true);
                          }}
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
                            // marginTop: "1.5rem",
                          }}
                        >
                          <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                              fill="white"
                            />
                          </svg>
                          &nbsp;&nbsp;&nbsp;&nbsp;
                          {t("addTask")}
                        </button>
                      )}

                      <h5 className="estimated-font">
                        {meeting?.solution_steps &&
                          `${t("estimateFieldActive")}: ${totalTime}`}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {open && (
            <NewSolutionModal open={open} closeModal={handleCloseModal} />
          )}
          {openModal && (
            <NewMeetingModal
              open={openModal}
              closeModal={handleCloseModal}
              openedFrom="solution"
            />
          )}
        </div>
      )}
      {showConfirmationModal && (
        <ConfirmationModal
          message={t("solutionDeletedToast")}
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
      {showModal && (
        <div className="new-meeting-modal tabs-container">
          <StepChart
            meetingId={meeting?.id}
            id={newId}
            show={showModal}
            setId={setNewId}
            closeModal={handleCloseModal}
            isDrop={isDrop}
            setIsDrop={setIsDrop}
            meeting1={meeting}
          />
        </div>
      )}
    </>
  );
};

export default Solution;
