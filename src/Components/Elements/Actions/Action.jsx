import CookieService from '../../Utils/CookieService';
import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Card, ProgressBar } from "react-bootstrap";
import moment from "moment";
import { HiUserCircle } from "react-icons/hi2";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatStepDate,
  openGoogleMeet,
  parseTimeTaken,
  typeIcons,
} from "../../Utils/MeetingFunctions";
import { FaArrowRight, FaChevronDown } from "react-icons/fa";
import { useSidebarContext } from "../../../context/SidebarContext";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useMeetings } from "../../../context/MeetingsContext";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { Avatar, Tooltip as AntdTooltip } from "antd";
import { useRecording } from "../../../context/RecordingContext";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import { useStepCounterContext } from "./../Meeting/context/StepCounterContext";
import {
  formatDate,
  formatTime,
} from "../Meeting/GetMeeting/Helpers/functionHelper";

const LazyStepChart = lazy(
  () => import("../Meeting/CreateNewMeeting/StepChart"),
);

const Action = ({ stepsData, setMyActionCount, refreshTrigger }) => {
  const { getMeetingsCalculations } = useMeetings();
  const { setSelectedStep } = useStepCounterContext();
  const { startRecording } = useRecording();
  const { call } = useFormContext();
  const [t] = useTranslation("global");
  const [steps, setSteps] = useState([]);
  const [inProgressSteps, setInProgressSteps] = useState([]);
  const [todoSteps, setTodoSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = parseInt(CookieService.get("user_id"));
  const { toggle } = useSidebarContext();
  const navigate = useNavigate();
  const location = useLocation();
  const titles = [
    "Today",
    "Tomorrow",
    "Rest of Week",
    "Next Week",
    "Rest of Month",
    "Next Month",
    "Rest of Year",
    "Next Year",
  ];
  const defaultIndex = titles.indexOf("Today");

  // const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(
    titles[defaultIndex] || null,
  );
  const [activeIndex, setActiveIndex] = useState(null); // To track which item is active
  const [selectedIndex, setSelectedIndex] = useState(0); // To track which item is active
  const handleTitleClick = (title, index) => {
    setSelectedTitle(title);
    setSelectedIndex(index);
    setActiveIndex(index === activeIndex ? null : index); // Toggle active state
  };
  useEffect(() => {
    if (defaultIndex !== -1) {
      setSelectedTitle(titles[defaultIndex]);
      setActiveIndex(defaultIndex);
    }
  }, []);

  // const [meetings, setMeetings] = useState([]);
  // const [selectedTab, setSelectedTab] = useState(null);
  // console.log('selectedTab',selectedTab)
  useEffect(() => {
    if (refreshTrigger?.calculation) {
      getActions(true);
    }
  }, [refreshTrigger]);

  // const handleTabClick = async (item) => {
  //   setSelectedTab(meeting);
  // };

  // useEffect(() => {
  //   if (meetings?.length > 0) {
  //     setSelectedTab(meetings[0]);
  //   }
  // }, [meetings]); // Run the effect when meetings change

  // const getMeetingSteps = async () => {
  //   // setLoading(true);
  //   setProgress(0); // Reset progress to 0 at the start
  //   setShowProgressBar(true); // Show the progress bar
  //   // Start a progress simulation
  //   const interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev >= 90) {
  //         clearInterval(interval); // Stop updating at 90%
  //         return 90; // Set to 90 before it completes
  //       }
  //       return prev + 10; // Increment progress by 10%
  //     });
  //   }, 200); // Update every 200ms

  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/get-user-steps2/${userId}/${selectedTab?.id}`
  //     );
  //     if (response.status) {
  //       const data = response?.data?.data || [];
  //       // Example usage:
  //       // const stepsData = [ /* your steps array here */ ];
  //       // const uniqueMeetingTitles = getUniqueMeetings(data);
  //       // setMeetings(uniqueMeetingTitles);
  //       // console.log(uniqueMeetingTitles);

  //       setSteps(data);
  //       const inProgressSteps = response?.data?.data
  //         ?.filter((step) => step?.step_status === "in_progress")
  //         ?.sort((a, b) => new Date(a.meeting.date) - new Date(b.meeting.date));

  //       // Sirf woh steps filter karo jo `Task` ya `Strategy` nahi hain
  //       let filteredOtherTypeSteps = inProgressSteps?.filter(
  //         (step) =>
  //           step?.meeting?.type !== "Task" && step?.meeting?.type !== "Strategy"
  //       );
  //       console.log("filterOtherTypesSteps", filteredOtherTypeSteps);
  //       // 🔹 Check karo agar `Task` ya `Strategy` hai toh sirf pehla step lo
  //       let finalInProgressSteps = inProgressSteps;
  //       let allInProgressSteps = inProgressSteps;
  //       if (
  //         inProgressSteps?.length > 0 &&
  //         (inProgressSteps[0]?.meeting?.type === "Task" ||
  //           inProgressSteps[0]?.meeting?.type === "Strategy")
  //       ) {
  //         finalInProgressSteps = [inProgressSteps[0]]; // Sirf pehla (earliest) step rakho
  //         allInProgressSteps = [inProgressSteps[0], ...filteredOtherTypeSteps]; // Sirf pehla (earliest) step rakho
  //       }
  //       setInProgressSteps(allInProgressSteps);
  //       const todoSteps = response?.data?.data
  //         ?.filter(
  //           (step) =>
  //             step?.step_status === "todo" ||
  //             (step?.step_status === "in_progress" &&
  //               (step?.meeting?.type === "Task" ||
  //                 step?.meeting?.type === "Strategy"))
  //         )
  //         ?.filter((step) =>
  //           finalInProgressSteps.length > 0
  //             ? step?.id !== finalInProgressSteps[0]?.id
  //             : true
  //         );
  //       setTodoSteps(todoSteps);
  //       setProgress(100); // Set progress to 100% upon completion
  //     }
  //   } catch (error) {
  //     console.error("Error while fetching actions", error);
  //     clearInterval(interval); // Clear the interval when done
  //     setProgress(100); // Set progress to 100% upon completion
  //     setShowProgressBar(false); // Hide the progress bar
  //   } finally {
  //     setLoading(false);
  //     clearInterval(interval); // Clear the interval when done
  //     setProgress(100); // Set progress to 100% upon completion
  //     setShowProgressBar(false); // Hide the progress bar
  //   }
  // };

  // useEffect(() => {
  //   if (selectedTab) {
  //     getMeetingSteps(selectedTab);
  //   }
  // }, [selectedTab]); // Call API when selectedTab changes
  // useEffect(() => {
  //   getMeetingsCalculations();
  // }, []);

  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const getActions = async (calculation = false) => {
    // setLoading(true);
    setProgress(0); // Reset progress to 0 at the start
    setShowProgressBar(true); // Show the progress bar
    // Start a progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const response = await axios.get(
        `${API_BASE_URL}/get-user-steps/${userId}?filter=${selectedTitle}&current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}${
          calculation ? "&calculation=true" : ""
        }`,
      );
      if (response.status) {
        const data = response?.data?.data || [];
        setMyActionCount(data?.length);

        // Example usage:
        // // const stepsData = [ /* your steps array here */ ];
        // const uniqueMeetingTitles = getUniqueMeetings(data);
        // setMeetings(uniqueMeetingTitles);
        // // console.log(uniqueMeetingTitles);

        setSteps(data);
        const inProgressSteps = response?.data?.data
          ?.filter((step) => step?.step_status === "in_progress")
          ?.sort((a, b) => new Date(a.meeting.date) - new Date(b.meeting.date));

        // Sirf woh steps filter karo jo `Task` ya `Strategy` nahi hain
        let filteredOtherTypeSteps = inProgressSteps?.filter(
          (step) =>
            step?.meeting?.type !== "Task" &&
            step?.meeting?.type !== "Strategy",
        );
        console.log("filterOtherTypesSteps", filteredOtherTypeSteps);
        // 🔹 Check karo agar `Task` ya `Strategy` hai toh sirf pehla step lo
        let finalInProgressSteps = inProgressSteps;
        let allInProgressSteps = inProgressSteps;
        if (
          inProgressSteps?.length > 0 &&
          (inProgressSteps[0]?.meeting?.type === "Task" ||
            inProgressSteps[0]?.meeting?.type === "Strategy")
        ) {
          finalInProgressSteps = [inProgressSteps[0]]; // Sirf pehla (earliest) step rakho
          allInProgressSteps = [inProgressSteps[0], ...filteredOtherTypeSteps]; // Sirf pehla (earliest) step rakho
        }
        setInProgressSteps(allInProgressSteps);
        // const todoSteps = response?.data?.data
        //   ?.filter(
        //     (step) =>
        //       step?.step_status === "todo" ||
        //       (step?.step_status === "in_progress" &&
        //         (step?.meeting?.type === "Task" ||
        //           step?.meeting?.type === "Strategy"))
        //   )
        //   ?.filter((step) =>
        //     finalInProgressSteps.length > 0
        //       ? step?.id !== finalInProgressSteps[0]?.id
        //       : true
        //   );
        const todoSteps = response?.data?.data?.filter(
          (step) =>
            step?.step_status ===
            "todo"(
              step?.meeting?.type === "Task" ||
                step?.meeting?.type === "Strategy",
            ),
        );
        setTodoSteps(todoSteps);
        setProgress(100); // Set progress to 100% upon completion
      }
    } catch (error) {
      console.error("Error while fetching actions", error);
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setShowProgressBar(false); // Hide the progress bar
    } finally {
      setLoading(false);
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setShowProgressBar(false); // Hide the progress bar
    }
  };
  const refreshedActions = async () => {
    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      // const response = await axios.get(
      //   `${API_BASE_URL}/get-user-steps/${userId}?filter=${selectedTitle}`
      // );
      const response = await axios.get(
        `${API_BASE_URL}/get-user-steps/${userId}?filter=${selectedTitle}&current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
      );
      if (response.status) {
        const data = response?.data?.data || [];
        setSteps(data);
        setMyActionCount(data?.length);
      }
    } catch (error) {
      console.error("Error while fetching actions", error);
    } finally {
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentTime = new Date();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const options = { timeZone: userTimeZone };
        const timeInUserZone = new Date(
          currentTime.toLocaleString("en-US", options),
        );

        const formattedTime = formatTime(timeInUserZone);
        const formattedDate = formatDate(timeInUserZone);
        const response = await axios.get(
          `${API_BASE_URL}/get-user-steps-temp/${userId}?filter=${selectedTitle}&current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        );

        if (response.status) {
          const updatedSteps = response?.data?.data || [];

          setSteps((prevSteps) =>
            prevSteps.map((prevStep) => {
              const updatedStep = updatedSteps.find(
                (s) => s.id === prevStep.id,
              );
              return updatedStep
                ? {
                    ...prevStep,
                    time_taken: updatedStep.time_taken,
                    step_time: updatedStep?.step_time,
                    start_date: updatedStep?.start_date,
                  }
                : prevStep;
            }),
          );
        }
      } catch (error) {
        console.error("Error while refreshing time_taken", error);
      }
      // }, 30000); // Refresh every 30 seconds
    }, 1800000); // Refresh every 30 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [userId, selectedTitle, location.pathname]);

  useEffect(() => {
    if (selectedTitle) {
      getActions();
    }
  }, [selectedTitle]);
  // useEffect(() => {
  //   refreshedActions();
  // }, [call]);

  const upcomingCount = steps?.filter(
    (step) => step.step_status === null || step.step_status === "to_accept",
  ).length;
  const todoCount = steps?.filter(
    (step) => step.step_status === "todo" || step?.step_status === "to_finish",
  ).length;

  const formatTimeUnit = (value, singular, plural) => {
    return value === 1 ? `${value} ${singular}` : `${value} ${plural}`;
  };
  // ---------------------------------------TOTAL UPCOMING STEPS TIME-----------------------------------

  const upcomingSteps = steps?.filter((step) => step?.step_status === null || step?.step_status === "to_accept");
  const UpcomingAndTodo = [...upcomingSteps, todoSteps];
  const totalUpcomingSteps = UpcomingAndTodo?.reduce((total, step) => {
    const { count2 = 0, time_unit } = step;

    let countInSeconds = 0;
    switch (time_unit) {
      case "days":
        countInSeconds = count2 * 24 * 60 * 60;
        break;
      case "hours":
        countInSeconds = count2 * 60 * 60;
        break;
      case "minutes":
        countInSeconds = count2 * 60;
        break;
      case "seconds":
        countInSeconds = count2;
        break;
      default:
        countInSeconds = 0; // Handle unknown or missing time_unit
    }

    return total + countInSeconds;
  }, 0);

  const days = Math.floor(totalUpcomingSteps / (24 * 60 * 60));
  const remainingSecondsAfterDays = totalUpcomingSteps % (24 * 60 * 60);
  const hours = Math.floor(remainingSecondsAfterDays / (60 * 60));
  const remainingSecondsAfterHours = remainingSecondsAfterDays % (60 * 60);
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const seconds = remainingSecondsAfterHours % 60;

  const formattedTotalTime =
    days > 0
      ? `${formatTimeUnit(days, t("time_unit.day"), t("time_unit.days"))}${
          hours > 0
            ? ` ${formatTimeUnit(
                hours,
                t("time_unit.hour"),
                t("time_unit.hours"),
              )}`
            : ""
        }`
      : hours > 0
        ? `${formatTimeUnit(hours, t("time_unit.hour"), t("time_unit.hours"))}${
            minutes > 0
              ? ` ${formatTimeUnit(
                  minutes,
                  t("time_unit.minute"),
                  t("time_unit.minutes"),
                )}`
              : ""
          }`
        : minutes > 0
          ? `${formatTimeUnit(
              minutes,
              t("time_unit.minute"),
              t("time_unit.minutes"),
            )}${
              seconds > 0
                ? ` ${formatTimeUnit(
                    seconds,
                    t("time_unit.second"),
                    t("time_unit.seconds"),
                  )}`
                : ""
            }`
          : `${formatTimeUnit(
              seconds,
              t("time_unit.second"),
              t("time_unit.seconds"),
            )}`;
  // ------------------------------------------TOTAL COMPLETED STEPS TIME-----------------------------------
  const totalCompletedSteps = steps
    .filter((step) => step.step_status === "completed")
    .reduce((total, step) => {
      const timeTaken = step?.time_taken;
      if (timeTaken) {
        return total + parseTimeTaken(timeTaken);
      }
      return total;
    }, 0);
  const completedDays = Math.floor(totalCompletedSteps / (24 * 3600));
  const remainingSecondsAfterDaysCompleted = totalCompletedSteps % (24 * 3600);
  const completedHours = Math.floor(remainingSecondsAfterDaysCompleted / 3600);
  const remainingSecondsAfterHoursCompleted =
    remainingSecondsAfterDaysCompleted % 3600;
  const completedMinutes = Math.floor(remainingSecondsAfterHoursCompleted / 60);
  const completedSeconds = remainingSecondsAfterHoursCompleted % 60;

  const formattedCompletedTime =
    completedDays > 0
      ? `${formatTimeUnit(
          completedDays,
          t("time_unit.day"),
          t("time_unit.days"),
        )}${
          completedHours > 0
            ? ` ${formatTimeUnit(
                completedHours,
                t("time_unit.hour"),
                t("time_unit.hours"),
              )}`
            : ""
        }`
      : completedHours > 0
        ? `${formatTimeUnit(
            completedHours,
            t("time_unit.hour"),
            t("time_unit.hours"),
          )}${
            completedMinutes > 0
              ? ` ${formatTimeUnit(
                  completedMinutes,
                  t("time_unit.minute"),
                  t("time_unit.minutes"),
                )}`
              : ""
          }`
        : completedMinutes > 0
          ? `${formatTimeUnit(
              completedMinutes,
              t("time_unit.minute"),
              t("time_unit.minutes"),
            )}${
              completedSeconds > 0
                ? ` ${formatTimeUnit(
                    completedSeconds,
                    t("time_unit.second"),
                    t("time_unit.seconds"),
                  )}`
                : ""
            }`
          : `${formatTimeUnit(
              completedSeconds,
              t("time_unit.second"),
              t("time_unit.seconds"),
            )}`;

  // ------------------------------------------TOTAL InProgress STEPS TIME-----------------------------------
  const totalInProgressSteps = inProgressSteps?.reduce((total, step) => {
    const timeTaken = step?.time_taken;
    const count2 = convertCount2ToSeconds(step?.count2, step?.time_unit);

    if (timeTaken) {
      const parsedTimeTaken = parseTimeTaken(timeTaken);

      // Check if the parsed time taken is less than count2
      if (parsedTimeTaken < count2) {
        // Calculate the remaining time
        const remainingTime = count2 - parsedTimeTaken;
        return total + remainingTime; // Add remaining time to total
      }
    }

    return total; // If no time taken, return total as is
  }, 0);

  const inProgressDays = Math.floor(totalCompletedSteps / (24 * 3600));
  const remainingSecondsAfterDaysInProgress =
    totalInProgressSteps % (24 * 3600);
  const inProgressHours = Math.floor(
    remainingSecondsAfterDaysInProgress / 3600,
  );
  const remainingSecondsAfterHoursInProgress =
    remainingSecondsAfterDaysInProgress % 3600;
  const inProgressMinutes = Math.floor(
    remainingSecondsAfterHoursInProgress / 60,
  );
  const inProgressSeconds = remainingSecondsAfterHoursInProgress % 60;

  const formattedInProgressTime =
    inProgressDays > 0
      ? `${formatTimeUnit(
          inProgressDays,
          t("time_unit.day"),
          t("time_unit.days"),
        )}${
          inProgressHours > 0
            ? ` ${formatTimeUnit(
                inProgressHours,
                t("time_unit.hour"),
                t("time_unit.hours"),
              )}`
            : ""
        }`
      : inProgressHours > 0
        ? `${formatTimeUnit(
            inProgressHours,
            t("time_unit.hour"),
            t("time_unit.hours"),
          )}${
            inProgressMinutes > 0
              ? ` ${formatTimeUnit(
                  inProgressMinutes,
                  t("time_unit.minute"),
                  t("time_unit.minutes"),
                )}`
              : ""
          }`
        : inProgressMinutes > 0
          ? `${formatTimeUnit(
              inProgressMinutes,
              t("time_unit.minute"),
              t("time_unit.minutes"),
            )}${
              inProgressSeconds > 0
                ? ` ${formatTimeUnit(
                    inProgressSeconds,
                    t("time_unit.second"),
                    t("time_unit.seconds"),
                  )}`
                : ""
            }`
          : `${formatTimeUnit(
              inProgressSeconds,
              t("time_unit.second"),
              t("time_unit.seconds"),
            )}`;
  // Add both durations to get the total workload in seconds
  const totalWorkloadInSeconds = totalUpcomingSteps + totalInProgressSteps;

  // Convert to days and hours
  const totalDays = Math.floor(totalWorkloadInSeconds / (24 * 3600)); // Whole days
  const TotalRemainingSecondsAfterDays = totalWorkloadInSeconds % (24 * 3600); // Remaining seconds after days
  const totalHours = Math.floor(TotalRemainingSecondsAfterDays / 3600); // Remaining hours
  const totalMinutes = Math.floor((TotalRemainingSecondsAfterDays % 3600) / 60); // Remaining minutes

  // Format the result based on the total workload
  // Format the result based on the total workload
  const formattedWorkload =
    totalDays > 0
      ? `${totalDays} ${t("time_unit.day", { count: totalDays })} ${
          totalHours > 0
            ? `${totalHours} ${
                totalHours === 1 ? t("time_unit.hour") : t("time_unit.hours")
              }`
            : totalMinutes > 0
              ? `${totalMinutes} ${
                  totalMinutes === 1
                    ? t("time_unit.minute")
                    : t("time_unit.minutes")
                }`
              : ""
        }`
      : totalHours >= 1
        ? `${totalHours} ${
            totalHours === 1 ? t("time_unit.hour") : t("time_unit.hours")
          }`
        : `${totalMinutes} ${
            totalMinutes === 1 ? t("time_unit.minute") : t("time_unit.minutes")
          }`;

  // -----------------------------------------------------------------------------------------------------------------------------
  const inProgressCount = inProgressSteps?.length;
  const completedCount = steps.filter(
    (step) => step.step_status === "completed",
  ).length;

  const convertTo24HourFormat = (time, date, type, timezone) => {
    if (!time || !date || !type) {
      return false;
    }

    const meetingTimezone = timezone || "Europe/Paris";
    const userTimezone = moment.tz.guess();

    // Convert meeting time from its original timezone to the user's timezone
    const convertedTime = moment
      .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
      .tz(userTimezone);

    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    // const timeMoment = moment(time, "hh:mm:ss A");
    // return timeMoment.isValid() ? timeMoment.format("HH:mm:ss") : "";
    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    const timeMoment = moment(convertedTime, "hh:mm:ss A");

    // Check if the time is valid
    if (!timeMoment.isValid()) return "";

    // If the meeting type is 'Quiz', include seconds in the format
    const format = type === "seconds" ? "HH[h]mm[m]ss" : "HH[h]mm";

    // Return the time in the appropriate format
    return timeMoment.format(format);
  };
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
  const [visoModal, setVisioModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [step, setStep] = useState(null);
  const handleConfirm = () => {
    setVisioModal(false);
    if (selectedItem) {
      setTimeout(() => {
        const newTab = window.open(
          selectedItem?.meet_link,
          "_blank",
          "noopener,noreferrer",
        );

        if (!newTab) {
          console.error("Popup blocked! The new tab could not be opened.");
        } else {
          newTab.focus(); // Bring the new tab to the front after 5 seconds
        }
      }, 5000); // 5-second delay
    }
    continueChangeStatusAndPlay(selectedItem, step);
  };

  const handleClose = () => {
    setVisioModal(false);
    setSelectedItem(null);
    continueChangeStatusAndPlay(selectedItem, step);
  };
  const changeStatusAndPlay = async (item, step) => {
    const loggedInUserId = CookieService.get("user_id"); // Get the logged-in user's ID from session storage
    setStep(step);

    // // Check if recording should be started
    // if (item?.prise_de_notes === "Automatic") {
    //   const hasPermission = await startRecording();
    //   if (!hasPermission) {
    //     setLoading(false);
    //     return; // Stop if recording didn't start
    //   }
    // }

    // if (item?.meet_link && item?.location === "Google Meet") {
    //   setSelectedItem(item);
    //   setVisioModal(true);
    //   return; // Wait for user confirmation before proceeding
    // }
    continueChangeStatusAndPlay(item, step);
  };
  const continueChangeStatusAndPlay = async (item, step) => {
    setSelectedStep(step);
    setLoading(true);

    let current_time;
    let current_date;
    let end_date;

    // // Find the step with step_status "in_progress"
    // const inProgressStep = item?.steps?.find(
    //   (step) => step?.step_status === "in_progress"
    // );
    // // Find the step with step_status "in_progress"
    // for (const step of item?.steps || []) {
    //   if (step?.step_status === "in_progress" && step?.step_time) {
    //     current_date = step.current_date || step?.start_date;
    //     current_time = step.step_time;
    //     end_date = step?.end_date;
    //     break;
    //   }
    // }

    // if (!current_time || !current_date) {
    //   console.log("No in-progress step with current_time found.");
    //   setLoading(false);
    //   return;
    // }

    // // Parse time with AM/PM
    // const [time, meridiem] = current_time?.split(" ");
    // let [currentHours, currentMinutes, currentSeconds] = time
    //   .split(":")
    //   .map(Number);
    // if (meridiem?.toLowerCase() === "pm" && currentHours < 12) {
    //   currentHours += 12;
    // } else if (meridiem?.toLowerCase() === "am" && currentHours === 12) {
    //   currentHours = 0;
    // }

    // // Split the date string and create a new Date object
    // const [day, month, year] = current_date?.split("-").map(Number);
    // const myDate = `${day}/${month}/${year}`;
    // const currentDateTime = new Date(myDate);

    // // Update the Date object with the extracted hours, minutes, and seconds
    // currentDateTime.setHours(currentHours, currentMinutes, currentSeconds);

    // const realCurrentTime = new Date();

    // const count2InSeconds = convertCount2ToSeconds(
    //   inProgressStep?.count2,
    //   inProgressStep?.time_unit
    // );

    // const differenceInMilliseconds = realCurrentTime - currentDateTime;
    // const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    // // Subtract count2InSeconds from differenceInSeconds
    // const adjustedDifferenceInSeconds = differenceInSeconds - count2InSeconds;

    // CookieService.set("difference", differenceInSeconds);
    // // if (isNaN(differenceInSeconds)) {
    // //   console.error("differenceInSeconds is NaN");
    // //   setLoading(false);

    // //   return;
    // // }

    // const convertSecondsToDDHHMMSS = (seconds) => {
    //   if (isNaN(seconds)) {
    //     console.error("seconds is NaN");
    //     setLoading(false);

    //     return "NaN";
    //   }

    //   const days = Math.floor(seconds / (24 * 3600));
    //   seconds %= 24 * 3600;
    //   const hours = Math.floor(seconds / 3600);
    //   seconds %= 3600;
    //   const minutes = Math.floor(seconds / 60);
    //   seconds %= 60;
    //   return `${String(days).padStart(2, "0")}d:${String(hours).padStart(
    //     2,
    //     "0"
    //   )}h:${String(minutes).padStart(2, "0")}m:${String(seconds).padStart(
    //     2,
    //     "0"
    //   )}s`;
    // };

    // const delay = convertSecondsToDDHHMMSS(adjustedDifferenceInSeconds);

    // const updatedSteps = item?.steps?.map((step) => {
    //   if (step.step_status === "in_progress") {
    //     let savedTime = Number(step.savedTime) || 0;

    //     let actualStepTime = 0;
    //     if (step.time_unit === "days") {
    //       actualStepTime = Number(step.count2 * 86400);
    //     } else if (step.time_unit === "hours") {
    //       actualStepTime = Number(step.count2 * 3600);
    //     } else if (step.time_unit === "minutes") {
    //       actualStepTime = Number(step.count2 * 60);
    //     } else {
    //       actualStepTime = Number(step.count2);
    //     }

    //     const negativeTime = Number(step.negative_time) || 0;

    //     let newNegativeTime = negativeTime;

    //     let newTime = actualStepTime - differenceInSeconds;
    //     CookieService.set("newTime", newTime);
    //     // Adjust savedTime
    //     if (newTime >= 0) {
    //       savedTime = newTime;
    //       if (newTime < 0) savedTime = 0;
    //     }
    //     if (differenceInSeconds <= actualStepTime) {
    //       step.delay = null;
    //       step.savedTime = savedTime;
    //       step.negative_time = newNegativeTime;
    //     } else {
    //       step.delay = delay;
    //       step.savedTime = 0;
    //       step.negative_time = "99";
    //     }

    //     return {
    //       ...step,
    //       delay: step.delay,
    //       savedTime: step.savedTime,
    //       negative_time: step.negative_time,
    //     };
    //   } else {
    //     return {
    //       ...step,
    //     };
    //   }
    // });

    // const payload = {
    //   ...item,
    //   _method: "put",
    //   end_time: item.end_time,
    //   delay: delay,
    //   steps: updatedSteps,
    //   moment_privacy_teams:
    //     item?.moment_privacy === "team" &&
    //     item?.moment_privacy_teams?.length &&
    //     typeof item?.moment_privacy_teams[0] === "object"
    //       ? item?.moment_privacy_teams.map((team) => team.id)
    //       : item?.moment_privacy_teams || [], // Send as-is if IDs are already present
    // };

    navigate(`/actīon-play/${item.id}/${step?.id}`);
    setLoading(false);

    // try {
    //   const response = await axios.post(
    //     `${API_BASE_URL}/meetings/${item.id}`,
    //     payload,
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${CookieService.get("token")}`,
    //       },
    //     }
    //   );

    //   if (response.status) {
    //     navigate(`/actīon-play/${item.id}/${step?.id}`);
    //     setLoading(false);

    //     // if (item?.meet_link && item?.location === "Google Meet") {
    //     //   openGoogleMeet(item?.meet_link);
    //     // }
    //   }
    // } catch (error) {
    //   setLoading(false);
    //   console.log("error while updating meeting status", error);
    // }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [stepId, setStepId] = useState(null);
  const [stepIndex, setStepIndex] = useState(null);
  const [isDrop, setIsDrop] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
    toggle(true);
  };

  const handleClick = (item, index) => {
    if (loading) return;
    setLoading(true);
    if (
      item?.step_status === "completed" ||
      item?.step_status === "cancelled" ||
      item?.step_status === null ||
      item?.step_status === "to_accept" ||
      item?.step_status === "todo" ||
      item?.step_status === "to_finish"
    ) {
      navigate(`/step/${item?.id}`, { state: { meeting: item?.meeting } });
    } else if (item?.step_status === "in_progress") {
      if (item?.meeting) {
        changeStatusAndPlay(item?.meeting, item);
      }
    }

    setTimeout(() => setLoading(false), 2000);
  };
  const handleTodoClick = (item, index) => {
    if (loading) return;
    setLoading(true);
    navigate(`/step/${item?.id}`, { state: { meeting: item?.meeting } });

    setTimeout(() => setLoading(false), 2000);
  };

  // function getUniqueMeetings(stepsData) {
  //   const meetingsMap = new Map();

  //   stepsData.forEach((step) => {
  //     if (step.meeting && !meetingsMap.has(step.meeting.id)) {
  //       meetingsMap.set(step.meeting.id, step.meeting.title);
  //     }
  //   });

  //   return Array.from(meetingsMap, ([id, title]) => ({
  //     meeting_id: id,
  //     title,
  //   }));
  // }
  const stickyRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        if (window.scrollY > 10) {
          stickyRef.current.classList.add("scrolled");
        } else {
          stickyRef.current.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="container-fluid invite">
        {/* Responsive Tabs - Scrollable on Mobile */}
        <div
          ref={stickyRef}
          className="action-tabs-sticky mt-3 overflow-x-auto bg-white"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            transition: "box-shadow 0.2s ease",
          }}
        >
          <div
            className="d-flex flex-nowrap gap-2 px-2"
            style={{ minWidth: "fit-content" }}
          >
            {[
              {
                label: t("badge.Planned"),
                count: upcomingCount,
                bgcolor: "rgba(47, 86, 187, 0.1019607843)",
                color: "#2f56bb",
              },
              {
                label: t("badge.Todo"),
                count: todoCount,
                bgcolor: "#6c757d",
                color: "white",
              },
              {
                label: t("badge.inprogress"),
                count: inProgressCount,
                bgcolor: "#f2db43",
                color: "white",
              },
              {
                label: t("badge.completed"),
                count: completedCount,
                bgcolor: "rgba(47, 187, 103, 0.1019607843)",
                color: "#2fa25d",
              },
            ].map((tab, idx) => (
              <h6
                key={idx}
                className="tab flex-fill text-center py-2 px-3"
                style={{
                  // borderBottom: "2px solid #0026b1",
                  color: tab.color,
                  backgroundColor: tab.bgcolor,
                  whiteSpace: "nowrap",
                  minWidth: "120px",
                  fontSize: "14px",
                }}
              >
                {tab.label}{" "}
                <span
                  className={tab.class}
                  style={{ padding: "1px 5px", fontSize: "12px" }}
                >
                  ({activeIndex === selectedIndex ? tab.count : 0})
                </span>
              </h6>
            ))}
          </div>
        </div>

        {titles.map((title, index) => (
          <div
            key={index}
            className="accordion-item"
            onClick={() => handleTitleClick(title, index)}
            style={{
              cursor: "pointer",
              border: "none",
              padding: "10px 0",
              backgroundColor:
                activeIndex === index ? "transparent" : "transparent",
              color: activeIndex === index ? "rgb(54 155 224)" : "inherit",
              fontWeight: activeIndex === index ? "bold" : "normal",
              // borderRadius: "5px",
              width: "100%",
              borderTop: "1px solid #e6e6e6",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div
                className="d-flex align-items-center action-accordion-item-margin"
                style={{
                  justifyContent: activeIndex === index ? "center" : "start",
                  width: "100%",
                  marginLeft: activeIndex === index ? "19rem" : "",
                }}
              >
                <FaArrowRight
                  style={{
                    transition: "transform 0.3s",
                    transform:
                      activeIndex === index ? "rotate(90deg)" : "rotate(0deg)",
                    marginRight: "8px",
                    // marginTop:'10px'
                  }}
                />
                <div className="d-flex flex-column">
                  <span>
                    {t(`action.action_unit.${title}`)}
                    &nbsp;
                    <br />
                    {activeIndex === index && (
                      <>
                        <span style={{ color: "black" }}>
                          {t("action.RemainingWorkload")}
                          &nbsp;
                          {formattedWorkload}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            {/* Collapsible content */}
            {activeIndex === index && (
              <div className="accordion-content">
                {showProgressBar && (
                  <div
                    className="progress-overlay"
                    // style={{ background: "transparent" }}
                  >
                    <div style={{ width: "50%" }}>
                      <ProgressBar now={progress} animated />
                    </div>
                  </div>
                )}
                {!showProgressBar && (
                  <div className="row">
                    <div
                      className="col-lg-3 col-md-4"
                      style={{ borderRight: "1px solid #e6e6e6" }}
                    >
                      <div className="mt-3">
                        {steps
                          ?.filter((step) => step?.step_status === null || step?.step_status === "to_accept")
                          .sort((a, b) => {
                            const dateA = new Date(a?.start_date);
                            const dateB = new Date(b?.start_date);

                            if (dateA < dateB) return -1;
                            if (dateA > dateB) return 1;

                            // If dates are equal, compare step_time
                            const timeA = convertTo24HourFormat(
                              a?.step_time,
                              a?.start_date,
                              a?.time_unit,
                              a?.meeting?.timezone,
                            );
                            const timeB = convertTo24HourFormat(
                              b?.step_time,
                              b?.start_date,
                              b?.time_unit,
                              b?.meeting?.timezone,
                            );

                            // Add safety checks to ensure both are strings
                            const isValidTimeA = typeof timeA === "string";
                            const isValidTimeB = typeof timeB === "string";

                            if (isValidTimeA && isValidTimeB) {
                              return timeA.localeCompare(timeB);
                            } else if (isValidTimeA) {
                              return -1;
                            } else if (isValidTimeB) {
                              return 1;
                            } else {
                              return 0;
                            }
                          })

                          .map((item, index) => {
                            // Check for item and its properties
                            if (!item || !item?.meeting) {
                              return null; // Skip if item or meeting is undefined
                            }

                            const data = item?.meeting;

                            return (
                              <Card
                                className="mt-4 step-card-meeting"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(item, index);
                                }}
                                key={index}
                              >
                                <Card.Body className="step-card-body">
                                  <div className="step-body">
                                    <div className="step-data">
                                      <h6
                                        className="step-card-heading m-0 p-0"
                                        style={{
                                          color: "#92929d",
                                          fontSize: "13px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/invitiesToMeeting/${item?.meeting?.destination_id}`,
                                          );
                                        }}
                                      >
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.objective}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.objective}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <h6
                                        className="step-card-heading m-0 p-0 fs-6 d-flex align-items-center justify-content-between"
                                        style={{
                                          color: "#92929d",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          const path =
                                            item?.meeting?.type === "Special" ||
                                            item?.meeting?.status ===
                                              "closed" ||
                                            item?.meeting?.status === "abort"
                                              ? `/present/invite/${item?.meeting?.id}`
                                              : `/invite/${item?.meeting?.id}`;

                                          navigate(path, {
                                            state: {
                                              data,
                                              from: "meeting",
                                            },
                                          });
                                        }}
                                      >
                                        <span>
                                          {typeIcons[item?.meeting?.type]}
                                        </span>
                                        {/* <span>{item?.meeting?.title}</span> */}
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.title}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.title}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <div
                                        className="step-header d-flex align-items-center justify-content-between"
                                        style={{
                                          margin: "9px 0px",
                                        }}
                                      >
                                        <div className="step-number-container d-flex align-items-center">
                                          <span
                                            className="step-number"
                                            style={{ color: "#92929d" }}
                                          >
                                            {item?.order_no <= 9 ? "0" : " "}
                                            {item?.order_no}/
                                            {item?.meeting?.steps?.length <= 9
                                              ? "0"
                                              : " "}
                                            {item?.meeting?.steps?.length}
                                          </span>
                                          <AntdTooltip
                                            placement="top"
                                            title={item?.title}
                                          >
                                            <Card.Title className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text action-ellipses-text">
                                              {item?.title}
                                            </Card.Title>
                                          </AntdTooltip>
                                        </div>
                                        {!window.location.href.includes(
                                          "/present/invite",
                                        ) &&
                                          (item.step_status === "completed" ? (
                                            <span className="status-badge-completed h-auto">
                                              {/* Completed */}
                                              {t("badge.completed")}
                                            </span>
                                          ) : item.step_status ===
                                            "in_progress" ? (
                                            <span
                                              className={
                                                convertTimeTakenToSeconds(
                                                  item?.time_taken,
                                                ) >
                                                convertCount2ToSeconds(
                                                  item?.count2,
                                                  item?.time_unit,
                                                )
                                                  ? "status-badge-red h-auto"
                                                  : "status-badge-inprogress h-auto"
                                              }
                                            >
                                              {t("badge.inprogress")}
                                            </span>
                                          ) : item.step_status === "paused" ? (
                                            <span
                                              className={
                                                "status-badge-red h-auto"
                                              }
                                            >
                                              {t("badge.paused")}
                                            </span>
                                          ) : item.step_status ===
                                            "to_accept" ? (
                                            <span className="status-badge-green h-auto">
                                              {t("badge.to_accept")}
                                            </span>
                                          ) : (
                                            // null
                                            // <span className="status-badge-upcoming h-auto">
                                            <span
                                              className={
                                                moment().isAfter(
                                                  moment(
                                                    `${item?.start_date} ${item?.step_time}`,
                                                    "YYYY-MM-DD hh:mm:ss A",
                                                  ),
                                                )
                                                  ? "status-badge-late"
                                                  : "status-badge-upcoming"
                                              }
                                            >
                                              {/* {t("badge.future")} */}
                                              {moment().isAfter(
                                                moment(
                                                  `${item?.start_date} ${item?.step_time}`,
                                                  "YYYY-MM-DD hh:mm:ss A",
                                                ),
                                              )
                                                ? t("badge.late")
                                                : t("badge.future")}
                                            </span>
                                          ))}
                                      </div>
                                      <div className="step-content">
                                        <Card.Subtitle className="step-card-subtext">
                                          {item.assigned_team ? (
                                            <>
                                              {item?.assigned_team?.logo ? (
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
                                                    Assets_URL +
                                                    "/" +
                                                    item?.assigned_team?.logo
                                                  }
                                                  alt={
                                                    item?.assigned_team?.name
                                                  }
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
                                              {item?.image ? (
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
                                                    item?.image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.image
                                                      : // : item?.image?.startsWith("users/")
                                                        // ? Assets_URL + "/" + item.image
                                                        item?.image
                                                  }
                                                  // src={
                                                  //     item?.assigned_to_image
                                                  // }
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
                                                  // src={`${users?.participant_image}`}
                                                  // src={
                                                  //   // users?.image
                                                  //   //   ? Assets_URL + "/" + users.image
                                                  //     // :
                                                  //      users?.participant_image
                                                  // }
                                                  src={
                                                    item?.assigned_to_image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.assigned_to_image
                                                      : item?.assigned_to_image
                                                  }
                                                  alt="img"
                                                />
                                              )}
                                            </>
                                          )}

                                          {item.assigned_team ? (
                                            <span>
                                              {item?.assigned_team?.name}
                                            </span>
                                          ) : (
                                            <span>
                                              {item?.assigned_to?.first_name +
                                                " " +
                                                item?.assigned_to?.last_name}
                                            </span>
                                          )}
                                        </Card.Subtitle>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <img
                                            height="16px"
                                            width="16px"
                                            src="/Assets/ion_time-outline.svg"
                                          />
                                          {window.location.href.includes(
                                            "/present/invite",
                                          ) ? (
                                            <>
                                              <span className="me-2">
                                                {item?.step_time}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={`${
                                                item?.time_unit === "days"
                                                  ? "me-2"
                                                  : "me-2"
                                              }`}
                                            >
                                              {item?.time_unit === "days" ? (
                                                <>
                                                  {item.step_status === null
                                                    ? formatStepDate(
                                                        item?.start_date,
                                                        item?.step_time,
                                                        item?.meeting?.timezone,
                                                      )
                                                    : formatStepDate(
                                                        item?.start_date,
                                                        item?.step_time,
                                                        item?.meeting?.timezone,
                                                      )}
                                                </>
                                              ) : (
                                                <>
                                                  {item?.step_status === null
                                                    ? formatStepDate(
                                                        item?.start_date,
                                                        item?.step_time,
                                                        item?.meeting?.timezone,
                                                      ) +
                                                      " " +
                                                      ` ${t("at")}` +
                                                      " " +
                                                      convertTo24HourFormat(
                                                        item?.step_time,
                                                        item?.start_date,

                                                        item?.time_unit,
                                                        item?.meeting?.timezone,
                                                      )
                                                    : formatStepDate(
                                                        item?.start_date,
                                                        item?.step_time,
                                                        item?.meeting?.timezone,
                                                      ) +
                                                      " " +
                                                      ` ${t("at")}` +
                                                      " " +
                                                      convertTo24HourFormat(
                                                        item?.step_time,
                                                        item?.start_date,

                                                        item?.time_unit,
                                                        item?.meeting?.timezone,
                                                      )}
                                                </>
                                              )}
                                            </span>
                                          )}{" "}
                                        </Card.Text>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <span className="">
                                            <img
                                              height="16px"
                                              width="16px"
                                              src="/Assets/alarm-invite.svg"
                                            />
                                          </span>
                                          {window.location.href.includes(
                                            "/present/invite",
                                          ) ? (
                                            <span>
                                              {localizeTimeTaken(
                                                item?.time_taken?.replace(
                                                  "-",
                                                  "",
                                                ),
                                              )}
                                            </span>
                                          ) : (
                                            <>
                                              {item?.step_status === null
                                                ? item?.editor_type ===
                                                    "Story" &&
                                                  item?.time_unit === "days"
                                                  ? item.count2 +
                                                    " " +
                                                    (item.count2 > 1
                                                      ? "Story Points"
                                                      : "Story Point")
                                                  : // or simply: item.count2 + " SP"
                                                    item.count2 +
                                                    " " +
                                                    t(
                                                      `time_unit.${item.time_unit}`,
                                                    )
                                                : localizeTimeTakenActive(
                                                    item?.time_taken?.replace(
                                                      "-",
                                                      "",
                                                    ),
                                                  )}
                                              {item?.step_status !== null && (
                                                <span>
                                                  &nbsp; {item?.step_status !== "to_accept" && "/"}{" "}
                                                  {item.count2 +
                                                    " " +
                                                    t(
                                                      `time_unit.${item.time_unit}`,
                                                    )}
                                                </span>
                                              )}
                                            </>
                                          )}{" "}
                                        </Card.Text>
                                        {/* <div className="mb-2">
                                            <div className="creator">
                                              {t("Importance")}
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                              <span
                                                style={{
                                                  fontSize: "small",
                                                  fontWeight: 400,
                                                  color: "#92929d",
                                                  textAlign: "left",
                                                }}
                                              >
                                                {t(
                                                  `meeting.newMeeting.options.priorities.${item?.meeting?.priority}`
                                                )}
                                              </span>
                                            </div>
                                          </div> */}
                                        <div className="mb-2">
                                          <div className="creator">
                                            {t("Privacy")}
                                          </div>
                                          <div className="d-flex align-items-center flex-wrap">
                                            {item?.meeting?.moment_privacy ===
                                            "public" ? (
                                              <Avatar
                                                src="/Assets/Tek.png"
                                                style={{
                                                  borderRadius: "0",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy === "team" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.moment_privacy_teams_data?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        {/* <Tooltip
                                                              title={item?.name}
                                                              placement="top"
                                                            > */}
                                                        <Avatar
                                                          size="large"
                                                          // src={
                                                          //   item?.logo?.startsWith("teams/")
                                                          //     ? Assets_URL + "/" + item.logo
                                                          //     : item.logo
                                                          // }
                                                          src={
                                                            item?.logo?.startsWith(
                                                              "http",
                                                            )
                                                              ? item.logo
                                                              : Assets_URL +
                                                                "/" +
                                                                item.logo
                                                          }
                                                          style={{
                                                            objectFit: "cover",
                                                            objectPosition:
                                                              "top",
                                                          }}
                                                        />
                                                        {/* </Tooltip> */}
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "enterprise" ? (
                                              <img
                                                src={
                                                  item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                    "enterprises/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user
                                                        ?.enterprise?.logo
                                                    : item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                          "storage/enterprises/",
                                                        )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.meeting?.user
                                                          ?.enterprise?.logo
                                                      : item?.meeting?.user
                                                          ?.enterprise?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "participant only" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.participants?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        <AntdTooltip
                                                          title={
                                                            item?.full_name
                                                          }
                                                          placement="top"
                                                        >
                                                          <Avatar
                                                            size="large"
                                                            src={
                                                              item?.participant_image?.startsWith(
                                                                "http",
                                                              )
                                                                ? item.participant_image
                                                                : Assets_URL +
                                                                  "/" +
                                                                  item.participant_image
                                                            }
                                                          />
                                                        </AntdTooltip>
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "tektime members" ? (
                                              <img
                                                src={
                                                  item?.user?.enterprise?.logo?.startsWith(
                                                    "http",
                                                  )
                                                    ? item?.user?.enterprise
                                                        ?.logo
                                                    : Assets_URL +
                                                      "/" +
                                                      item?.user?.enterprise
                                                        ?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              /> // <Tooltip
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "password" ? (
                                              <svg
                                                width="37px"
                                                height="36px"
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
                                                    d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                                    stroke="#000000"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                  ></path>{" "}
                                                </g>
                                              </svg>
                                            ) : (
                                              <Avatar
                                                src={
                                                  item?.meeting?.user?.image?.startsWith(
                                                    "users/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user?.image
                                                    : item?.meeting?.user?.image
                                                }
                                                style={{
                                                  objectFit: "cover",
                                                  objectPosition: "top",
                                                  height: "24px",
                                                  width: "24px",
                                                }}
                                              />
                                            )}

                                            <span
                                              className={`badge ms-2 ${
                                                item?.meeting
                                                  ?.moment_privacy === "private"
                                                  ? "solution-badge-red"
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "public"
                                                    ? "solution-badge-green"
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                          "enterprise" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "participant only" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "tektime members"
                                                      ? "solution-badge-blue"
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "password"
                                                        ? "solution-badge-red"
                                                        : "solution-badge-yellow"
                                              }`}
                                              style={{
                                                padding: "3px 8px 3px 8px",
                                              }}
                                            >
                                              {item?.meeting?.moment_privacy ===
                                              "private"
                                                ? t("solution.badge.private")
                                                : item?.meeting
                                                      ?.moment_privacy ===
                                                    "public"
                                                  ? t("solution.badge.public")
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "enterprise"
                                                    ? t(
                                                        "solution.badge.enterprise",
                                                      )
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                        "participant only"
                                                      ? t(
                                                          "solution.badge.participantOnly",
                                                        )
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "tektime members"
                                                        ? t(
                                                            "solution.badge.membersOnly",
                                                          )
                                                        : item?.meeting
                                                              ?.moment_privacy ===
                                                            "password"
                                                          ? t(
                                                              "solution.badge.password",
                                                            )
                                                          : t(
                                                              "solution.badge.team",
                                                            )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                    <div
                      className="col-lg-3 col-md-4"
                      style={{ borderRight: "1px solid #e6e6e6" }}
                    >
                      <div className="mt-3">
                        {steps
                          ?.filter(
                            (step) =>
                              step?.step_status === "todo" ||
                              step?.step_status === "to_finish",
                          )
                          ?.sort((a, b) => {
                            // Step status priority: to_finish before todo
                            const statusOrder = { to_finish: 0, todo: 1 };
                            const statusA = statusOrder[a.step_status] ?? 2;
                            const statusB = statusOrder[b.step_status] ?? 2;

                            if (statusA !== statusB) return statusA - statusB;

                            // If status is the same, compare by start_date
                            const dateA = new Date(a?.start_date);
                            const dateB = new Date(b?.start_date);
                            return dateA - dateB;
                          })
                          .map((item, index) => {
                            // Check for item and its properties
                            if (!item || !item?.meeting) {
                              return null; // Skip if item or meeting is undefined
                            }

                            const data = item?.meeting;

                            return (
                              <Card
                                className="mt-4 step-card-meeting"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTodoClick(item, index);
                                }}
                                key={index}
                              >
                                <Card.Body className="step-card-body">
                                  <div className="step-body">
                                    <div className="step-data">
                                      <h6
                                        className="step-card-heading m-0 p-0"
                                        style={{
                                          color: "#92929d",
                                          fontSize: "13px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/invitiesToMeeting/${item?.meeting?.destination_id}`,
                                          );
                                        }}
                                      >
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.objective}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.objective}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <h6
                                        className="step-card-heading m-0 p-0 fs-6 d-flex align-items-center justify-content-between"
                                        style={{
                                          color: "#92929d",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          const path =
                                            item?.meeting?.type === "Special" ||
                                            item?.meeting?.status ===
                                              "closed" ||
                                            item?.meeting?.status === "abort"
                                              ? `/present/invite/${item?.meeting?.id}`
                                              : `/invite/${item?.meeting?.id}`;

                                          navigate(path, {
                                            state: {
                                              data,
                                              from: "meeting",
                                            },
                                          });
                                        }}
                                      >
                                        <span>
                                          {typeIcons[item?.meeting?.type]}
                                        </span>
                                        {/* <span>{item?.meeting?.title}</span> */}
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.title}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.title}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <div
                                        className="step-header d-flex align-items-center justify-content-between"
                                        style={{
                                          margin: "9px 0px",
                                        }}
                                      >
                                        <div className="step-number-container d-flex align-items-center">
                                          <span
                                            className="step-number"
                                            style={{ color: "#92929d" }}
                                          >
                                            {item?.order_no <= 9 ? "0" : " "}
                                            {item?.order_no}/
                                            {item?.meeting?.steps?.length <= 9
                                              ? "0"
                                              : " "}
                                            {item?.meeting?.steps?.length}
                                          </span>
                                          <AntdTooltip
                                            placement="top"
                                            title={item?.title}
                                          >
                                            <Card.Title className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text action-ellipses-text">
                                              {item?.title}
                                            </Card.Title>
                                          </AntdTooltip>
                                        </div>
                                        {item?.step_status === "todo" ? (
                                          <span className="status-badge-green">
                                            {t("badge.Todo")}
                                          </span>
                                        ) : (
                                          <span className="status-badge-finish">
                                            {t("badge.finish")}
                                          </span>
                                        )}
                                      </div>
                                      <div className="step-content">
                                        <Card.Subtitle className="step-card-subtext">
                                          {item.assigned_team ? (
                                            <>
                                              {item?.assigned_team?.logo ? (
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
                                                    Assets_URL +
                                                    "/" +
                                                    item?.assigned_team?.logo
                                                  }
                                                  alt={
                                                    item?.assigned_team?.name
                                                  }
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
                                              {item?.image ? (
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
                                                    item?.image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.image
                                                      : // : item?.image?.startsWith("users/")
                                                        // ? Assets_URL + "/" + item.image
                                                        item?.image
                                                  }
                                                  // src={
                                                  //     item?.assigned_to_image
                                                  // }
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
                                                  // src={`${users?.participant_image}`}
                                                  // src={
                                                  //   // users?.image
                                                  //   //   ? Assets_URL + "/" + users.image
                                                  //     // :
                                                  //      users?.participant_image
                                                  // }
                                                  src={
                                                    item?.assigned_to_image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.assigned_to_image
                                                      : item?.assigned_to_image
                                                  }
                                                  alt="img"
                                                />
                                              )}
                                            </>
                                          )}

                                          {item.assigned_team ? (
                                            <span>
                                              {item?.assigned_team?.name}
                                            </span>
                                          ) : (
                                            <span>
                                              {(item?.assigned_to?.first_name ||
                                                item?.assigned_to
                                                  ?.last_name) && (
                                                <span>
                                                  {item?.assigned_to
                                                    ?.first_name ?? ""}{" "}
                                                  {item?.assigned_to
                                                    ?.last_name ?? ""}
                                                </span>
                                              )}
                                            </span>
                                          )}
                                        </Card.Subtitle>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <img
                                            height="16px"
                                            width="16px"
                                            src="/Assets/ion_time-outline.svg"
                                          />
                                          <span
                                            className={`${
                                              item?.time_unit === "days"
                                                ? "me-2"
                                                : "me-2"
                                            }`}
                                          >
                                            {item?.time_unit === "days" ? (
                                              <>
                                                {item.step_status === "todo"
                                                  ? formatStepDate(
                                                      item?.start_date,
                                                      item?.step_time,
                                                      item?.meeting?.timezone,
                                                    )
                                                  : formatStepDate(
                                                      item?.start_date,
                                                      item?.step_time,
                                                      item?.meeting?.timezone,
                                                    )}
                                              </>
                                            ) : (
                                              <>
                                                {item?.step_status === "todo"
                                                  ? formatStepDate(
                                                      item?.start_date,
                                                      item?.step_time,
                                                      item?.meeting?.timezone,
                                                    ) +
                                                    " " +
                                                    ` ${t("at")}` +
                                                    " " +
                                                    convertTo24HourFormat(
                                                      item?.step_time,
                                                      item?.start_date,

                                                      item?.time_unit,
                                                      item?.meeting?.timezone,
                                                    )
                                                  : formatStepDate(
                                                      item?.start_date,
                                                      item?.step_time,
                                                      item?.meeting?.timezone,
                                                    ) +
                                                    " " +
                                                    ` ${t("at")}` +
                                                    " " +
                                                    convertTo24HourFormat(
                                                      item?.step_time,
                                                      item?.start_date,

                                                      item?.time_unit,
                                                      item?.meeting?.timezone,
                                                    )}
                                              </>
                                            )}
                                          </span>
                                        </Card.Text>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <span className="">
                                            <img
                                              height="16px"
                                              width="16px"
                                              src="/Assets/alarm-invite.svg"
                                            />
                                          </span>
                                          {item?.step_status === "to_finish" &&
                                          item?.time_taken ? (
                                            <span>
                                              {localizeTimeTaken(
                                                item?.time_taken?.replace(
                                                  "-",
                                                  "",
                                                ),
                                              )}
                                            </span>
                                          ) : (
                                            <>
                                              {item?.editor_type === "Story" &&
                                              item?.time_unit === "days"
                                                ? item.count2 +
                                                  " " +
                                                  (item.count2 > 1
                                                    ? "Story Points"
                                                    : "Story Point")
                                                : // or simply: item.count2 + " SP"
                                                  item.count2 +
                                                  " " +
                                                  t(
                                                    `time_unit.${item.time_unit}`,
                                                  )}
                                            </>
                                          )}{" "}
                                        </Card.Text>
                                        {/* <div className="mb-2">
                                            <div className="creator">
                                              {t("Importance")}
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                              <span
                                                style={{
                                                  fontSize: "small",
                                                  fontWeight: 400,
                                                  color: "#92929d",
                                                  textAlign: "left",
                                                }}
                                              >
                                                {t(
                                                  `meeting.newMeeting.options.priorities.${item?.meeting?.priority}`
                                                )}
                                              </span>
                                            </div>
                                          </div> */}
                                        <div className="mb-2">
                                          <div className="creator">
                                            {t("Privacy")}
                                          </div>
                                          <div className="d-flex align-items-center flex-wrap">
                                            {item?.meeting?.moment_privacy ===
                                            "public" ? (
                                              <Avatar
                                                src="/Assets/Tek.png"
                                                style={{
                                                  borderRadius: "0",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy === "team" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.moment_privacy_teams_data?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        {/* <Tooltip
                                                              title={item?.name}
                                                              placement="top"
                                                            > */}
                                                        <Avatar
                                                          size="large"
                                                          // src={
                                                          //   item?.logo?.startsWith("teams/")
                                                          //     ? Assets_URL + "/" + item.logo
                                                          //     : item.logo
                                                          // }
                                                          src={
                                                            item?.logo?.startsWith(
                                                              "http",
                                                            )
                                                              ? item.logo
                                                              : Assets_URL +
                                                                "/" +
                                                                item.logo
                                                          }
                                                          style={{
                                                            objectFit: "cover",
                                                            objectPosition:
                                                              "top",
                                                          }}
                                                        />
                                                        {/* </Tooltip> */}
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "enterprise" ? (
                                              <img
                                                src={
                                                  item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                    "enterprises/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user
                                                        ?.enterprise?.logo
                                                    : item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                          "storage/enterprises/",
                                                        )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.meeting?.user
                                                          ?.enterprise?.logo
                                                      : item?.meeting?.user
                                                          ?.enterprise?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "participant only" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.participants?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        <AntdTooltip
                                                          title={
                                                            item?.full_name
                                                          }
                                                          placement="top"
                                                        >
                                                          <Avatar
                                                            size="large"
                                                            src={
                                                              item?.participant_image?.startsWith(
                                                                "http",
                                                              )
                                                                ? item.participant_image
                                                                : Assets_URL +
                                                                  "/" +
                                                                  item.participant_image
                                                            }
                                                          />
                                                        </AntdTooltip>
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "tektime members" ? (
                                              <img
                                                src={
                                                  item?.user?.enterprise?.logo?.startsWith(
                                                    "http",
                                                  )
                                                    ? item?.user?.enterprise
                                                        ?.logo
                                                    : Assets_URL +
                                                      "/" +
                                                      item?.user?.enterprise
                                                        ?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              /> // <Tooltip
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "password" ? (
                                              <svg
                                                width="37px"
                                                height="36px"
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
                                                    d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                                    stroke="#000000"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                  ></path>{" "}
                                                </g>
                                              </svg>
                                            ) : (
                                              <Avatar
                                                src={
                                                  item?.meeting?.user?.image?.startsWith(
                                                    "users/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user?.image
                                                    : item?.meeting?.user?.image
                                                }
                                                style={{
                                                  objectFit: "cover",
                                                  objectPosition: "top",
                                                  height: "24px",
                                                  width: "24px",
                                                }}
                                              />
                                            )}

                                            <span
                                              className={`badge ms-2 ${
                                                item?.meeting
                                                  ?.moment_privacy === "private"
                                                  ? "solution-badge-red"
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "public"
                                                    ? "solution-badge-green"
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                          "enterprise" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "participant only" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "tektime members"
                                                      ? "solution-badge-blue"
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "password"
                                                        ? "solution-badge-red"
                                                        : "solution-badge-yellow"
                                              }`}
                                              style={{
                                                padding: "3px 8px 3px 8px",
                                              }}
                                            >
                                              {item?.meeting?.moment_privacy ===
                                              "private"
                                                ? t("solution.badge.private")
                                                : item?.meeting
                                                      ?.moment_privacy ===
                                                    "public"
                                                  ? t("solution.badge.public")
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "enterprise"
                                                    ? t(
                                                        "solution.badge.enterprise",
                                                      )
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                        "participant only"
                                                      ? t(
                                                          "solution.badge.participantOnly",
                                                        )
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "tektime members"
                                                        ? t(
                                                            "solution.badge.membersOnly",
                                                          )
                                                        : item?.meeting
                                                              ?.moment_privacy ===
                                                            "password"
                                                          ? t(
                                                              "solution.badge.password",
                                                            )
                                                          : t(
                                                              "solution.badge.team",
                                                            )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                    <div
                      className="col-lg-3 col-md-4"
                      style={{ borderRight: "1px solid #e6e6e6" }}
                    >
                      <div className="mt-3">
                        {steps
                          ?.filter((step) => step.step_status === "in_progress")
                          ?.sort((a, b) => {
                            const dateA = new Date(a?.start_date);
                            const dateB = new Date(b?.start_date);
                            if (dateA < dateB) return -1;
                            if (dateA > dateB) return 1;
                            const timeA = convertTo24HourFormat(
                              a?.step_time,
                              a?.start_date,
                              a?.time_unit,
                              a?.meeting?.timezone,
                            );
                            const timeB = convertTo24HourFormat(
                              b?.step_time,
                              b?.start_date,
                              b?.time_unit,
                              b?.meeting?.timezone,
                            );

                            return timeA?.localeCompare(timeB);
                          })
                          .map((item, index) => {
                            // Check for item and its properties
                            if (!item || !item?.meeting) {
                              return null; // Skip if item or meeting is undefined
                            }

                            const data = item?.meeting;

                            return (
                              <Card
                                className="mt-4 step-card-meeting"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(item, index);
                                }}
                                key={index}
                              >
                                <Card.Body className="step-card-body">
                                  <div className="step-body">
                                    <div className="step-data">
                                      <h6
                                        className="step-card-heading m-0 p-0"
                                        style={{
                                          color: "#92929d",
                                          fontSize: "13px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/invitiesToMeeting/${item?.meeting?.destination_id}`,
                                          );
                                        }}
                                      >
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.objective}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.objective}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <h6
                                        className="step-card-heading m-0 p-0 fs-6 d-flex align-items-center justify-content-between"
                                        style={{
                                          color: "#92929d",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          const path =
                                            item?.meeting?.type === "Special" ||
                                            item?.meeting?.status ===
                                              "closed" ||
                                            item?.meeting?.status === "abort"
                                              ? `/present/invite/${item?.meeting?.id}`
                                              : `/invite/${item?.meeting?.id}`;

                                          navigate(path, {
                                            state: {
                                              data,
                                              from: "meeting",
                                            },
                                          });
                                        }}
                                      >
                                        <span>
                                          {typeIcons[item?.meeting?.type]}
                                        </span>
                                        <AntdTooltip
                                          placement="top"
                                          title={item?.meeting?.title}
                                        >
                                          <Card.Title
                                            className="m-0 p-0 fs-6 ms-1 truncated-text"
                                            // style={{ width: "60%" }}
                                          >
                                            {item?.meeting?.title}
                                          </Card.Title>
                                        </AntdTooltip>
                                      </h6>
                                      <hr
                                        style={{
                                          marginTop: "9px",
                                          marginBottom: "9px",
                                        }}
                                      />
                                      <div
                                        className="step-header d-flex align-items-center justify-content-between"
                                        style={{
                                          margin: "9px 0px",
                                        }}
                                      >
                                        <div className="step-number-container d-flex align-items-center">
                                          <span
                                            className="step-number"
                                            style={{ color: "#92929d" }}
                                          >
                                            {item?.order_no <= 9 ? "0" : " "}
                                            {item?.order_no}/
                                            {item?.meeting?.steps?.length <= 9
                                              ? "0"
                                              : " "}
                                            {item?.meeting?.steps?.length}
                                          </span>
                                          <AntdTooltip
                                            placement="top"
                                            title={item?.title}
                                          >
                                            <Card.Title className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text action-ellipses-text">
                                              {item?.title}
                                            </Card.Title>
                                          </AntdTooltip>
                                        </div>
                                        {!window.location.href.includes(
                                          "/present/invite",
                                        ) &&
                                          // meeting.status === "in_progress" &&
                                          (item.step_status === "completed" ? (
                                            <span className="status-badge-completed h-auto">
                                              {/* Completed */}
                                              {t("badge.completed")}
                                            </span>
                                          ) : item.step_status ===
                                            "in_progress" ? (
                                            <span
                                              className={
                                                convertTimeTakenToSeconds(
                                                  item?.time_taken,
                                                ) >
                                                convertCount2ToSeconds(
                                                  item?.count2,
                                                  item?.time_unit,
                                                )
                                                  ? "status-badge-red h-auto"
                                                  : "status-badge-inprogress h-auto"
                                              }
                                            >
                                              {t("badge.inprogress")}
                                            </span>
                                          ) : item.step_status === "paused" ? (
                                            <span
                                              className={
                                                "status-badge-red h-auto"
                                              }
                                            >
                                              {t("badge.paused")}
                                            </span>
                                          ) : (
                                            // null
                                            <span className="status-badge-upcoming h-auto">
                                              {t("badge.future")}
                                              {/* Upcoming */}
                                            </span>
                                          ))}
                                      </div>
                                      <div className="step-content">
                                        <Card.Subtitle className="step-card-subtext">
                                          {item.assigned_team ? (
                                            <>
                                              {item?.assigned_team?.logo ? (
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
                                                    Assets_URL +
                                                    "/" +
                                                    item?.assigned_team?.logo
                                                  }
                                                  alt={
                                                    item?.assigned_team?.name
                                                  }
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
                                              {item?.image ? (
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
                                                    item?.image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.image
                                                      : // : item?.image?.startsWith("users/")
                                                        // ? Assets_URL + "/" + item.image
                                                        item?.image
                                                  }
                                                  // src={
                                                  //     item?.assigned_to_image
                                                  // }
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
                                                  // src={`${users?.participant_image}`}
                                                  // src={
                                                  //   // users?.image
                                                  //   //   ? Assets_URL + "/" + users.image
                                                  //     // :
                                                  //      users?.participant_image
                                                  // }
                                                  src={
                                                    item?.assigned_to_image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.assigned_to_image
                                                      : item?.assigned_to_image
                                                  }
                                                  alt="img"
                                                />
                                              )}
                                            </>
                                          )}

                                          {item.assigned_team ? (
                                            <span>
                                              {item?.assigned_team?.name}
                                            </span>
                                          ) : (
                                            <span>
                                              {(item?.assigned_to?.first_name ||
                                                item?.assigned_to
                                                  ?.last_name) && (
                                                <span>
                                                  {item?.assigned_to
                                                    ?.first_name ?? ""}{" "}
                                                  {item?.assigned_to
                                                    ?.last_name ?? ""}
                                                </span>
                                              )}
                                            </span>
                                          )}
                                        </Card.Subtitle>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <img
                                            height="16px"
                                            width="16px"
                                            src="/Assets/ion_time-outline.svg"
                                          />
                                          {window.location.href.includes(
                                            "/present/invite",
                                          ) ? (
                                            <>
                                              <span className="me-2">
                                                {item?.step_time}
                                              </span>
                                            </>
                                          ) : (
                                            <span
                                              className={`${
                                                item?.time_unit === "days"
                                                  ? "me-2"
                                                  : "me-2"
                                              }`}
                                            >
                                              {item?.time_unit === "days" ? (
                                                formatStepDate(
                                                  item?.start_date,
                                                  item?.step_time,
                                                  item?.meeting?.timezone,
                                                )
                                              ) : (
                                                <>
                                                  {formatStepDate(
                                                    item?.start_date,
                                                    item?.step_time,
                                                    item?.meeting?.timezone,
                                                  ) +
                                                    " " +
                                                    ` ${t("at")}` +
                                                    " " +
                                                    convertTo24HourFormat(
                                                      item?.step_time,
                                                      item?.start_date,

                                                      item?.time_unit,
                                                      item?.meeting?.timezone ||
                                                        "Europe/Paris",
                                                    )}
                                                </>
                                              )}
                                            </span>
                                          )}{" "}
                                        </Card.Text>
                                        <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                          <span className="">
                                            <img
                                              height="16px"
                                              width="16px"
                                              src="/Assets/alarm-invite.svg"
                                            />
                                          </span>
                                          {window.location.href.includes(
                                            "/present/invite",
                                          ) ? (
                                            <span>
                                              {localizeTimeTaken(
                                                item?.time_taken?.replace(
                                                  "-",
                                                  "",
                                                ),
                                              )}
                                            </span>
                                          ) : (
                                            <>
                                              {localizeTimeTakenActive(
                                                item?.time_taken?.replace(
                                                  "-",
                                                  "",
                                                ),
                                              )}
                                              {item?.step_status !== null && (
                                                <span>
                                                  &nbsp; /{" "}
                                                  {item?.editor_type ===
                                                    "Story" &&
                                                  item?.time_unit === "days"
                                                    ? item.count2 +
                                                      " " +
                                                      (item.count2 > 1
                                                        ? "Story Points"
                                                        : "Story Point")
                                                    : // or simply: item.count2 + " SP"
                                                      item.count2 +
                                                      " " +
                                                      t(
                                                        `time_unit.${item.time_unit}`,
                                                      )}
                                                </span>
                                              )}
                                            </>
                                          )}{" "}
                                        </Card.Text>
                                        {/* <div className="mb-2">
                                            <div className="creator">
                                              {t("Importance")}
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                              <span
                                                style={{
                                                  fontSize: "small",
                                                  fontWeight: 400,
                                                  color: "#92929d",
                                                  textAlign: "left",
                                                }}
                                              >
                                                {t(
                                                  `meeting.newMeeting.options.priorities.${item?.meeting?.priority}`
                                                )}
                                              </span>
                                            </div>
                                          </div> */}
                                        <div className="mb-2">
                                          <div className="creator">
                                            {t("Privacy")}
                                          </div>
                                          <div className="d-flex align-items-center flex-wrap">
                                            {item?.meeting?.moment_privacy ===
                                            "public" ? (
                                              <Avatar
                                                src="/Assets/Tek.png"
                                                style={{
                                                  borderRadius: "0",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy === "team" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.moment_privacy_teams_data?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        {/* <Tooltip
                                                              title={item?.name}
                                                              placement="top"
                                                            > */}
                                                        <Avatar
                                                          size="large"
                                                          // src={
                                                          //   item?.logo?.startsWith("teams/")
                                                          //     ? Assets_URL + "/" + item.logo
                                                          //     : item.logo
                                                          // }
                                                          src={
                                                            item?.logo?.startsWith(
                                                              "http",
                                                            )
                                                              ? item.logo
                                                              : Assets_URL +
                                                                "/" +
                                                                item.logo
                                                          }
                                                          style={{
                                                            objectFit: "cover",
                                                            objectPosition:
                                                              "top",
                                                          }}
                                                        />
                                                        {/* </Tooltip> */}
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "enterprise" ? (
                                              <img
                                                src={
                                                  item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                    "enterprises/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user
                                                        ?.enterprise?.logo
                                                    : item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                          "storage/enterprises/",
                                                        )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.meeting?.user
                                                          ?.enterprise?.logo
                                                      : item?.meeting?.user
                                                          ?.enterprise?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              />
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "participant only" ? (
                                              <Avatar.Group maxCount={5}>
                                                {item?.meeting?.participants?.map(
                                                  (item) => {
                                                    return (
                                                      <>
                                                        <AntdTooltip
                                                          title={
                                                            item?.full_name
                                                          }
                                                          placement="top"
                                                        >
                                                          <Avatar
                                                            size="large"
                                                            src={
                                                              item?.participant_image?.startsWith(
                                                                "http",
                                                              )
                                                                ? item.participant_image
                                                                : Assets_URL +
                                                                  "/" +
                                                                  item.participant_image
                                                            }
                                                          />
                                                        </AntdTooltip>
                                                      </>
                                                    );
                                                  },
                                                )}
                                              </Avatar.Group>
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "tektime members" ? (
                                              <img
                                                src={
                                                  item?.user?.enterprise?.logo?.startsWith(
                                                    "http",
                                                  )
                                                    ? item?.user?.enterprise
                                                        ?.logo
                                                    : Assets_URL +
                                                      "/" +
                                                      item?.user?.enterprise
                                                        ?.logo
                                                }
                                                alt="Logo"
                                                style={{
                                                  width: "30px",
                                                  height: "30px",
                                                  objectFit: "fill",
                                                  borderRadius: "50%",
                                                }}
                                              /> // <Tooltip
                                            ) : item?.meeting
                                                ?.moment_privacy ===
                                              "password" ? (
                                              <svg
                                                width="37px"
                                                height="36px"
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
                                                    d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                                    stroke="#000000"
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                  ></path>{" "}
                                                </g>
                                              </svg>
                                            ) : (
                                              <Avatar
                                                src={
                                                  item?.meeting?.user?.image?.startsWith(
                                                    "users/",
                                                  )
                                                    ? Assets_URL +
                                                      "/" +
                                                      item?.meeting?.user?.image
                                                    : item?.meeting?.user?.image
                                                }
                                                style={{
                                                  objectFit: "cover",
                                                  objectPosition: "top",
                                                  height: "24px",
                                                  width: "24px",
                                                }}
                                              />
                                            )}

                                            <span
                                              className={`badge ms-2 ${
                                                item?.meeting
                                                  ?.moment_privacy === "private"
                                                  ? "solution-badge-red"
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "public"
                                                    ? "solution-badge-green"
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                          "enterprise" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "participant only" ||
                                                        item?.meeting
                                                          ?.moment_privacy ===
                                                          "tektime members"
                                                      ? "solution-badge-blue"
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "password"
                                                        ? "solution-badge-red"
                                                        : "solution-badge-yellow"
                                              }`}
                                              style={{
                                                padding: "3px 8px 3px 8px",
                                              }}
                                            >
                                              {item?.meeting?.moment_privacy ===
                                              "private"
                                                ? t("solution.badge.private")
                                                : item?.meeting
                                                      ?.moment_privacy ===
                                                    "public"
                                                  ? t("solution.badge.public")
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "enterprise"
                                                    ? t(
                                                        "solution.badge.enterprise",
                                                      )
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                        "participant only"
                                                      ? t(
                                                          "solution.badge.participantOnly",
                                                        )
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "tektime members"
                                                        ? t(
                                                            "solution.badge.membersOnly",
                                                          )
                                                        : item?.meeting
                                                              ?.moment_privacy ===
                                                            "password"
                                                          ? t(
                                                              "solution.badge.password",
                                                            )
                                                          : t(
                                                              "solution.badge.team",
                                                            )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                    <div
                      className="col-lg-3 col-md-4"
                      style={{ borderRight: "1px solid #e6e6e6" }}
                    >
                      <div className="mt-3">
                        {steps
                          ?.filter((step) => step?.step_status === "completed")
                          .sort((a, b) => {
                            // Create date objects for start_date
                            const dateA = new Date(a?.start_date);
                            const dateB = new Date(b?.start_date);

                            // Compare by start_date first in descending order
                            if (dateA > dateB) return -1; // Reverse the order
                            if (dateA < dateB) return 1;

                            // If start_date is the same, compare by step_time
                            const timeA = convertTo24HourFormat(
                              a?.step_time,
                              a?.start_date,
                              a?.time_unit,
                              a?.meeting?.timezone,
                            ); // Ensure step_time is in a comparable format
                            const timeB = convertTo24HourFormat(
                              b?.step_time,
                              b?.start_date,
                              b?.time_unit,
                              b?.meeting?.timezone,
                            );

                            const isValidTimeA = typeof timeA === "string";
                            const isValidTimeB = typeof timeB === "string";

                            if (isValidTimeA && isValidTimeB) {
                              return timeB.localeCompare(timeA); // Reverse order
                            } else if (isValidTimeB) {
                              return -1;
                            } else if (isValidTimeA) {
                              return 1;
                            } else {
                              return 0;
                            }
                          })
                          .map((item, index) => {
                            // Check for item and its properties
                            if (!item || !item?.meeting) {
                              return null; // Skip if item or meeting is undefined
                            }

                            const data = item?.meeting;

                            return (
                              <>
                                <Card
                                  className="mt-4 step-card-meeting"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClick(item, index);
                                  }}
                                  key={index}
                                >
                                  <Card.Body className="step-card-body">
                                    <div className="step-body">
                                      <div className="step-data">
                                        <h6
                                          className="step-card-heading m-0 p-0"
                                          style={{
                                            color: "#92929d",
                                            fontSize: "13px",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                              `/invitiesToMeeting/${item?.meeting?.destination_id}`,
                                            );
                                          }}
                                        >
                                          <AntdTooltip
                                            placement="top"
                                            title={item?.meeting?.objective}
                                          >
                                            <Card.Title
                                              className="m-0 p-0 fs-6 ms-1 truncated-text"
                                              // style={{ width: "60%" }}
                                            >
                                              {item?.meeting?.objective}
                                            </Card.Title>
                                          </AntdTooltip>
                                        </h6>
                                        <hr
                                          style={{
                                            marginTop: "9px",
                                            marginBottom: "9px",
                                          }}
                                        />
                                        <h6
                                          className="step-card-heading m-0 p-0 fs-6 d-flex align-items-center justify-content-between"
                                          style={{
                                            color: "#92929d",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();

                                            const path =
                                              item?.meeting?.type ===
                                                "Special" ||
                                              item?.meeting?.status ===
                                                "closed" ||
                                              item?.meeting?.status === "abort"
                                                ? `/present/invite/${item?.meeting?.id}`
                                                : `/invite/${item?.meeting?.id}`;

                                            navigate(path, {
                                              state: {
                                                data,
                                                from: "meeting",
                                              },
                                            });
                                          }}
                                        >
                                          <span>
                                            {typeIcons[item?.meeting?.type]}
                                          </span>
                                          <AntdTooltip
                                            placement="top"
                                            title={item?.meeting?.title}
                                          >
                                            <Card.Title
                                              className="m-0 p-0 fs-6 ms-1 truncated-text"
                                              // style={{ width: "60%" }}
                                            >
                                              {item?.meeting?.title}
                                            </Card.Title>
                                          </AntdTooltip>
                                        </h6>
                                        <hr
                                          style={{
                                            marginTop: "9px",
                                            marginBottom: "9px",
                                          }}
                                        />
                                        <div
                                          className="step-header d-flex align-items-center justify-content-between"
                                          style={{
                                            margin: "9px 0px",
                                          }}
                                        >
                                          <div className="step-number-container d-flex align-items-center">
                                            <span
                                              className="step-number"
                                              style={{ color: "#92929d" }}
                                            >
                                              {item?.order_no <= 9 ? "0" : " "}
                                              {item?.order_no}/
                                              {item?.meeting?.steps?.length <= 9
                                                ? "0"
                                                : " "}
                                              {item?.meeting?.steps?.length}
                                            </span>
                                            <AntdTooltip
                                              placement="top"
                                              title={item?.title}
                                            >
                                              <Card.Title className="step-card-heading m-0 p-0 fs-6 ms-1 truncated-text action-ellipses-text">
                                                {item?.title}
                                              </Card.Title>
                                            </AntdTooltip>
                                          </div>
                                          {!window.location.href.includes(
                                            "/present/invite",
                                          ) &&
                                            // meeting.status === "in_progress" &&
                                            (item.step_status ===
                                            "completed" ? (
                                              <span className="status-badge-completed h-auto">
                                                {/* Completed */}
                                                {t("badge.completed")}
                                              </span>
                                            ) : item.step_status ===
                                              "in_progress" ? (
                                              <span
                                                className={
                                                  convertTimeTakenToSeconds(
                                                    item?.time_taken,
                                                  ) >
                                                  convertCount2ToSeconds(
                                                    item?.count2,
                                                    item?.time_unit,
                                                  )
                                                    ? "status-badge-red h-auto"
                                                    : "status-badge-inprogress h-auto"
                                                }
                                              >
                                                {t("badge.inprogress")}
                                              </span>
                                            ) : item.step_status ===
                                              "paused" ? (
                                              <span
                                                className={
                                                  "status-badge-red h-auto"
                                                }
                                              >
                                                {t("badge.paused")}
                                              </span>
                                            ) : (
                                              // null
                                              <span className="status-badge-upcoming h-auto">
                                                {t("badge.future")}
                                                {/* Upcoming */}
                                              </span>
                                            ))}
                                        </div>
                                        <div className="step-content">
                                          <Card.Subtitle className="step-card-subtext">
                                            {item.assigned_team ? (
                                              <>
                                                {item?.assigned_team?.logo ? (
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
                                                      Assets_URL +
                                                      "/" +
                                                      item?.assigned_team?.logo
                                                    }
                                                    alt={
                                                      item?.assigned_team?.name
                                                    }
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
                                                {item?.image ? (
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
                                                      item?.image?.startsWith(
                                                        "users/",
                                                      )
                                                        ? Assets_URL +
                                                          "/" +
                                                          item?.image
                                                        : // : item?.image?.startsWith("users/")
                                                          // ? Assets_URL + "/" + item.image
                                                          item?.image
                                                    }
                                                    // src={
                                                    //     item?.assigned_to_image
                                                    // }
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
                                                    // src={`${users?.participant_image}`}
                                                    // src={
                                                    //   // users?.image
                                                    //   //   ? Assets_URL + "/" + users.image
                                                    //     // :
                                                    //      users?.participant_image
                                                    // }
                                                    src={
                                                      item?.assigned_to_image?.startsWith(
                                                        "users/",
                                                      )
                                                        ? Assets_URL +
                                                          "/" +
                                                          item?.assigned_to_image
                                                        : item?.assigned_to_image
                                                    }
                                                    alt="img"
                                                  />
                                                )}
                                              </>
                                            )}

                                            {item.assigned_team ? (
                                              <span>
                                                {item?.assigned_team?.name}
                                              </span>
                                            ) : (
                                              <span>
                                                {(item?.assigned_to
                                                  ?.first_name ||
                                                  item?.assigned_to
                                                    ?.last_name) && (
                                                  <span>
                                                    {item?.assigned_to
                                                      ?.first_name ?? ""}{" "}
                                                    {item?.assigned_to
                                                      ?.last_name ?? ""}
                                                  </span>
                                                )}
                                              </span>
                                            )}
                                          </Card.Subtitle>
                                          <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                            <img
                                              height="16px"
                                              width="16px"
                                              src="/Assets/ion_time-outline.svg"
                                            />
                                            {window.location.href.includes(
                                              "/present/invite",
                                            ) ? (
                                              <>
                                                <span className="me-2">
                                                  {item?.step_time}
                                                </span>
                                              </>
                                            ) : (
                                              <span
                                                className={`${
                                                  item?.time_unit === "days"
                                                    ? "me-2"
                                                    : "me-2"
                                                }`}
                                              >
                                                {item?.time_unit === "days" ? (
                                                  <>
                                                    {item.step_status === null
                                                      ? formatStepDate(
                                                          item?.start_date,
                                                          item?.step_time,
                                                          item?.meeting
                                                            ?.timezone,
                                                        )
                                                      : formatStepDate(
                                                          item?.start_date,
                                                          item?.step_time,
                                                          item?.meeting
                                                            ?.timezone,
                                                        )}
                                                  </>
                                                ) : (
                                                  <>
                                                    {item?.step_status === null
                                                      ? formatStepDate(
                                                          item?.start_date,
                                                          item?.step_time,
                                                          item?.meeting
                                                            ?.timezone,
                                                        ) +
                                                        " " +
                                                        ` ${t("at")}` +
                                                        " " +
                                                        convertTo24HourFormat(
                                                          item?.step_time,
                                                          item?.start_date,

                                                          item?.time_unit,
                                                          item?.meeting
                                                            ?.timezone,
                                                        )
                                                      : formatStepDate(
                                                          item?.start_date,
                                                          item?.step_time,
                                                          item?.meeting
                                                            ?.timezone,
                                                        ) +
                                                        " " +
                                                        ` ${t("at")}` +
                                                        " " +
                                                        convertTo24HourFormat(
                                                          item?.step_time,
                                                          item?.start_date,

                                                          item?.time_unit,
                                                          item?.meeting
                                                            ?.timezone,
                                                        )}
                                                  </>
                                                )}
                                              </span>
                                            )}{" "}
                                          </Card.Text>
                                          <Card.Text className="step-card-content action-step-card-content d-flex align-items-center">
                                            <span className="">
                                              <img
                                                height="16px"
                                                width="16px"
                                                src="/Assets/alarm-invite.svg"
                                              />
                                            </span>
                                            <>
                                              {item?.meeting?.type ===
                                              "Special" ? (
                                                item?.count2 +
                                                " " +
                                                t(`time_unit.${item.time_unit}`)
                                              ) : (
                                                <>
                                                  {localizeTimeTakenActive(
                                                    item?.time_taken?.replace(
                                                      "-",
                                                      "",
                                                    ),
                                                  )}

                                                  <span>
                                                    &nbsp; /{" "}
                                                    {item?.editor_type ===
                                                      "Story" &&
                                                    item?.time_unit === "days"
                                                      ? item.count2 +
                                                        " " +
                                                        (item.count2 > 1
                                                          ? "Story Points"
                                                          : "Story Point")
                                                      : // or simply: item.count2 + " SP"
                                                        item.count2 +
                                                        " " +
                                                        t(
                                                          `time_unit.${item.time_unit}`,
                                                        )}
                                                  </span>
                                                </>
                                              )}
                                            </>
                                          </Card.Text>
                                          {/* <div className="mb-2">
                                              <div className="creator">
                                                {t("Importance")}
                                              </div>
                                              <div className="d-flex align-items-center flex-wrap">
                                                <span
                                                  style={{
                                                    fontSize: "small",
                                                    fontWeight: 400,
                                                    color: "#92929d",
                                                    textAlign: "left",
                                                  }}
                                                >
                                                  {t(
                                                    `meeting.newMeeting.options.priorities.${item?.meeting?.priority}`
                                                  )}
                                                </span>
                                              </div>
                                            </div> */}
                                          <div className="mb-2">
                                            <div className="creator">
                                              {t("Privacy")}
                                            </div>
                                            <div className="d-flex align-items-center flex-wrap">
                                              {item?.meeting?.moment_privacy ===
                                              "public" ? (
                                                <Avatar
                                                  src="/Assets/Tek.png"
                                                  style={{
                                                    borderRadius: "0",
                                                  }}
                                                />
                                              ) : item?.meeting
                                                  ?.moment_privacy ===
                                                "team" ? (
                                                <Avatar.Group maxCount={5}>
                                                  {item?.meeting?.moment_privacy_teams_data?.map(
                                                    (item) => {
                                                      return (
                                                        <>
                                                          {/* <Tooltip
                                                              title={item?.name}
                                                              placement="top"
                                                            > */}
                                                          <Avatar
                                                            size="large"
                                                            // src={
                                                            //   item?.logo?.startsWith("teams/")
                                                            //     ? Assets_URL + "/" + item.logo
                                                            //     : item.logo
                                                            // }
                                                            src={
                                                              item?.logo?.startsWith(
                                                                "http",
                                                              )
                                                                ? item.logo
                                                                : Assets_URL +
                                                                  "/" +
                                                                  item.logo
                                                            }
                                                            style={{
                                                              objectFit:
                                                                "cover",
                                                              objectPosition:
                                                                "top",
                                                            }}
                                                          />
                                                          {/* </Tooltip> */}
                                                        </>
                                                      );
                                                    },
                                                  )}
                                                </Avatar.Group>
                                              ) : item?.meeting
                                                  ?.moment_privacy ===
                                                "enterprise" ? (
                                                <img
                                                  src={
                                                    item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                      "enterprises/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.meeting?.user
                                                          ?.enterprise?.logo
                                                      : item?.meeting?.user?.enterprise?.logo?.startsWith(
                                                            "storage/enterprises/",
                                                          )
                                                        ? Assets_URL +
                                                          "/" +
                                                          item?.meeting?.user
                                                            ?.enterprise?.logo
                                                        : item?.meeting?.user
                                                            ?.enterprise?.logo
                                                  }
                                                  alt="Logo"
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    objectFit: "fill",
                                                    borderRadius: "50%",
                                                  }}
                                                />
                                              ) : item?.meeting
                                                  ?.moment_privacy ===
                                                "participant only" ? (
                                                <Avatar.Group maxCount={5}>
                                                  {item?.meeting?.participants?.map(
                                                    (item) => {
                                                      return (
                                                        <>
                                                          <AntdTooltip
                                                            title={
                                                              item?.full_name
                                                            }
                                                            placement="top"
                                                          >
                                                            <Avatar
                                                              size="large"
                                                              src={
                                                                item?.participant_image?.startsWith(
                                                                  "http",
                                                                )
                                                                  ? item.participant_image
                                                                  : Assets_URL +
                                                                    "/" +
                                                                    item.participant_image
                                                              }
                                                            />
                                                          </AntdTooltip>
                                                        </>
                                                      );
                                                    },
                                                  )}
                                                </Avatar.Group>
                                              ) : item?.meeting
                                                  ?.moment_privacy ===
                                                "tektime members" ? (
                                                <img
                                                  src={
                                                    item?.user?.enterprise?.logo?.startsWith(
                                                      "http",
                                                    )
                                                      ? item?.user?.enterprise
                                                          ?.logo
                                                      : Assets_URL +
                                                        "/" +
                                                        item?.user?.enterprise
                                                          ?.logo
                                                  }
                                                  alt="Logo"
                                                  style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    objectFit: "fill",
                                                    borderRadius: "50%",
                                                  }}
                                                /> // <Tooltip
                                              ) : item?.meeting
                                                  ?.moment_privacy ===
                                                "password" ? (
                                                <svg
                                                  width="37px"
                                                  height="36px"
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
                                                      d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                                                      stroke="#000000"
                                                      stroke-width="2"
                                                      stroke-linecap="round"
                                                      stroke-linejoin="round"
                                                    ></path>{" "}
                                                  </g>
                                                </svg>
                                              ) : (
                                                <Avatar
                                                  src={
                                                    item?.meeting?.user?.image?.startsWith(
                                                      "users/",
                                                    )
                                                      ? Assets_URL +
                                                        "/" +
                                                        item?.meeting?.user
                                                          ?.image
                                                      : item?.meeting?.user
                                                          ?.image
                                                  }
                                                  style={{
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                    height: "24px",
                                                    width: "24px",
                                                  }}
                                                />
                                              )}

                                              <span
                                                className={`badge ms-2 ${
                                                  item?.meeting
                                                    ?.moment_privacy ===
                                                  "private"
                                                    ? "solution-badge-red"
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                        "public"
                                                      ? "solution-badge-green"
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                            "enterprise" ||
                                                          item?.meeting
                                                            ?.moment_privacy ===
                                                            "participant only" ||
                                                          item?.meeting
                                                            ?.moment_privacy ===
                                                            "tektime members"
                                                        ? "solution-badge-blue"
                                                        : item?.meeting
                                                              ?.moment_privacy ===
                                                            "password"
                                                          ? "solution-badge-red"
                                                          : "solution-badge-yellow"
                                                }`}
                                                style={{
                                                  padding: "3px 8px 3px 8px",
                                                }}
                                              >
                                                {item?.meeting
                                                  ?.moment_privacy === "private"
                                                  ? t("solution.badge.private")
                                                  : item?.meeting
                                                        ?.moment_privacy ===
                                                      "public"
                                                    ? t("solution.badge.public")
                                                    : item?.meeting
                                                          ?.moment_privacy ===
                                                        "enterprise"
                                                      ? t(
                                                          "solution.badge.enterprise",
                                                        )
                                                      : item?.meeting
                                                            ?.moment_privacy ===
                                                          "participant only"
                                                        ? t(
                                                            "solution.badge.participantOnly",
                                                          )
                                                        : item?.meeting
                                                              ?.moment_privacy ===
                                                            "tektime members"
                                                          ? t(
                                                              "solution.badge.membersOnly",
                                                            )
                                                          : item?.meeting
                                                                ?.moment_privacy ===
                                                              "password"
                                                            ? t(
                                                                "solution.badge.password",
                                                              )
                                                            : t(
                                                                "solution.badge.team",
                                                              )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* </div> */}
      {isModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <div className="new-meeting-modal">
            <LazyStepChart
              meetingId={selectedMeeting?.id}
              id={stepId}
              show={isModalOpen}
              meeting={selectedMeeting}
              setMeeting={setSelectedMeeting}
              setId={setStepId}
              closeModal={handleCloseModal}
              key={`step-chart-${stepId}`}
              isDrop={isDrop}
              stepIndex={stepIndex}
              refreshMeeting={refreshedActions}
              openedFrom="action"
            />
          </div>
        </Suspense>
      )}
      {visoModal && (
        <ConfirmationModal
          message={t("Do you want to open the visioconference in a new tab?")}
          onCancel={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default Action;
