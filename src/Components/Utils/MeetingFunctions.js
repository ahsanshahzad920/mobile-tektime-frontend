import CookieService from './CookieService';
// import moment from "moment";
import moment from "moment-timezone";

import axios from "axios";
import { API_BASE_URL } from "../Apicongfig";
import { toast } from "react-toastify";
import {
  formatDate,
  formatTime,
} from "../Elements/Meeting/GetMeeting/Helpers/functionHelper";
import { AiOutlineAudit } from "react-icons/ai";
import { MdOutlineSupport } from "react-icons/md";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { GoProject } from "react-icons/go";
import { FaBookOpen } from "react-icons/fa6";
import { FaCalendarCheck } from "react-icons/fa";

export const formatMissionDate = (dateString) => {
  if (!dateString) return '';

  // If date is already in DD/MM/YYYY format, return as is
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString;
  }

  // Otherwise, try to parse as YYYY-MM-DD
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }

  return dateString; // fallback to original if format is unexpected
};
export const getUser = async () => {
  const userID = parseInt(CookieService.get("user_id"));
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CookieService.get("token")}`,
      },
    });
    if (response.status === 200 || response?.status === 201) {
      const data = response?.data?.data;
      console.log("data", data);
      CookieService.set("user", JSON.stringify(data));
    }
  } catch (error) {
    console.log("error", error);
  }
};
export const createStrategyMoment = async (payload, t) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate-strategy-moment`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      }
    );
    if (response?.status) {
      toast.success(t("Strategy moment created successfully!"));
    }
  } catch (error) {
    console.log("error while creating strategy moment", error);
  }
};

export const formatPauseTime = (seconds, t) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const getLabel = (value, singular, plural) =>
    value === 1 ? singular : plural;

  if (days > 0 || hours > 0) {
    const parts = [];
    if (days > 0)
      parts.push(
        `${days} ${getLabel(days, t("time_unit.day"), t("time_unit.days"))}`
      );
    if (hours > 0)
      parts.push(
        `${hours} ${getLabel(
          hours,
          t("time_unit.hour"),
          t("time_unit.hours")
        )}`
      );
    return parts.join(" - ");
  } else if (hours > 0 || mins > 0) {
    const parts = [];
    if (hours > 0)
      parts.push(
        `${hours} ${getLabel(
          hours,
          t("time_unit.hour"),
          t("time_unit.hours")
        )}`
      );
    if (mins > 0)
      parts.push(
        `${mins} ${getLabel(
          mins,
          t("time_unit.minute"),
          t("time_unit.minutes")
        )}`
      );
    return parts.join(" - ");
  } else {
    const parts = [];
    if (mins > 0)
      parts.push(
        `${mins} ${getLabel(
          mins,
          t("time_unit.minute"),
          t("time_unit.minutes")
        )}`
      );
    if (secs > 0)
      parts.push(
        `${secs} ${getLabel(
          secs,
          t("time_unit.second"),
          t("time_unit.seconds")
        )}`
      );
    return parts.join(" - ") || "0 sec";
  }
}
export const getTimeUnitDisplay = (count, unit, t, meetingType) => {
  // If meeting type is Sprint and time unit is days → show SP or Story Points
  if (meetingType === "Sprint" && unit === "days") {
    return count > 1 ? "Story Points" : "Story Point";
    // or simply return "SP" if you prefer short form:
    // return "SP";
  }

  // Handle special case when count is 1
  if (count === 1) {
    switch (unit) {
      case "seconds":
        return `${t("time_unit.second")}`;
      case "minutes":
        return `${t("time_unit.minute")}`;
      case "hours":
        return `${t("time_unit.hour")}`;
      case "days":
        return `${t("time_unit.da")}`; // singular
      default:
        return `${unit}`;
    }
  }

  // Plural cases
  return `${t(`time_unit.${unit}`)}`;
};


export const markTodo = async (id) => {
  try {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const response = await axios.get(
      `${API_BASE_URL}/user/step/mark-todo/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
      {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      }
    );
    if (response.status) {
      console.log("check the response of mark todo api", response);
    }
  } catch (error) {
    console.log("error", error);
  }
};
export const markTodoMeeting = async (id) => {
  try {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const response = await axios.get(
      `${API_BASE_URL}/user/meeting/mark-todo-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
      {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      }
    );
    if (response.status) {
      console.log("check the response of mark todo api", response);
    }
  } catch (error) {
    console.log("error", error);
  }
};
export const markToFinish = async (id) => {
  try {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    const response = await axios.get(
      `${API_BASE_URL}/user/step/mark-to-finish/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
      {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      }
    );
    if (response.status) {
      console.log("check the response of mark todo api", response);
    }
  } catch (error) {
    console.log("error", error);
  }
};

export const groupWordsIntoSentences = (timestamps) => {
  if (!timestamps) return [];

  const sentences = [];
  let currentSentence = [];
  let sentenceStart = null;
  let sentenceEnd = null;

  for (let i = 0; i < timestamps.length; i++) {
    const { start_time, end_time, word } = timestamps[i];

    if (currentSentence.length === 0) {
      sentenceStart = start_time; // Set start time of sentence
    }

    currentSentence.push({ word, start_time, end_time });
    sentenceEnd = end_time; // Update end time of sentence

    if (/[.!?]/.test(word)) {
      sentences.push({
        start_time: sentenceStart,
        end_time: sentenceEnd,
        words: [...currentSentence], // Store words with timestamps
      });
      currentSentence = []; // Reset for next sentence
    }
  }

  // Add any remaining words as a final sentence
  if (currentSentence.length > 0) {
    sentences.push({
      start_time: sentenceStart,
      end_time: sentenceEnd,
      words: [...currentSentence],
    });
  }

  return sentences;
};

export const formatStepDate = (date, time, timezone) => {
  if (!date || !time) return;

  const meetingTimezone = timezone || "Europe/Paris";

  const userTimezone = moment.tz.guess();

  const convertedTime = moment
    .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
    .tz(userTimezone);
  // Format the date in dd/mm/yyyy
  return convertedTime.format("DD/MM/YYYY");
  // // Convert the date string into a Date object
  // const dateObject = new Date(dateString);

  // // Extract day, month, and year
  // const day = String(dateObject.getDate()).padStart(2, "0");
  // const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  // const year = dateObject.getFullYear();

  // // Return the formatted date string in dd/mm/yyyy format
  // return `${day}/${month}/${year}`;
};

export const abortMeetingTime = (
  datetime,
  format = "DD/MM/yyyy HH[h]mm",
  originalTimezone
) => {
  if (!datetime) return "N/A"; // Handle missing values
  const userTimezone = moment.tz.guess();

  return moment
    .tz(datetime, "YYYY-MM-DD HH:mm:ss", originalTimezone || "Europe/Paris") // Convert from original timezone
    .tz(userTimezone) // Convert to Paris time
    .format(format); // Format output
};

export const localizeTimeTaken = (timeTaken, t) => {
  if (!timeTaken || typeof timeTaken !== 'string') return "";

  // Retrieve localized time units
  const timeUnits = t("time_unit", { returnObjects: true });

  // Split the timeTaken string by " - " to separate time components
  const timeParts = timeTaken.split(" - ");

  // Initialize variables for each time component
  let days = null;
  let hours = null;
  let minutes = null;
  let seconds = null;

  // Iterate over each part and assign it to the corresponding variable
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

  // Check if days are present
  const hasDays = Boolean(days);

  // Determine what to show based on the presence of days
  let result = "";
  if (hasDays) {
    // Show days and hours if days are present
    result = [days, hours].filter(Boolean).join(" - ");
  } else if (hours) {
    // Show only hours and minutes if hours and minutes are present
    result = [hours, minutes].filter(Boolean).join(" - ");
  } else if (minutes) {
    // Show minutes only if no days or hours are present
    // result = minutes;
    result = [minutes, seconds].filter(Boolean).join(" - ");
  } else {
    result = seconds;
  }

  // Return empty string if result is undefined or empty
  if (!result) return "";

  // Localize and return the result
  return result
    .split(" ")
    .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
    .join(" ");
};

export const specialMeetingEndTime = (startTime, steps) => {
  if (!startTime || !steps) return 0;
  // Convert start_time to a moment object
  let meetingStartTime = moment(startTime, "HH:mm:ss");

  steps.forEach((step) => {
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

// Helper function to get ISO week number
export function getISOWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}
export const convertCount2ToSeconds = (count2, timeUnit) => {
  if (!count2 || !timeUnit) return;
  switch (timeUnit) {
    case "days":
      return count2 * 24 * 3600;
    case "hours":
      return count2 * 3600;
    case "minutes":
      return count2 * 60;
    case "seconds":
      return count2;
    default:
      return 0;
  }
};

export const convertTimeTakenToSeconds = (timeTaken) => {
  if (!timeTaken) return 0;
  let totalSeconds = 0;

  const parts = timeTaken.split(" - ");
  parts.forEach((part) => {
    const [value, unit] = part.split(" ");

    switch (unit) {
      case "days":
      case "day":
        totalSeconds += parseInt(value, 10) * 86400; // 1 day = 86400 seconds
        break;
      case "hours":
      case "hour":
        totalSeconds += parseInt(value, 10) * 3600; // 1 hour = 3600 seconds
        break;
      case "mins":
      case "min":
        totalSeconds += parseInt(value, 10) * 60; // 1 minute = 60 seconds
        break;
      case "secs":
      case "sec":
        totalSeconds += parseInt(value, 10); // seconds
        break;
      default:
        break;
    }
  });

  return totalSeconds;
};

export const convertSecondsToDHMSFormat = (seconds) => {
  if (isNaN(seconds)) {
    console.error("seconds is NaN");
    return "NaN";
  }

  const days = Math.floor(seconds / (24 * 3600));
  seconds %= 24 * 3600;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${String(days).padStart(2, "0")}days:${String(hours).padStart(
    2,
    "0"
  )}hours:${String(minutes).padStart(2, "0")}mins:${String(seconds).padStart(
    2,
    "0"
  )}secs`;
};

export const formatTimeDifference = (difference) => {
  // if (!difference) return;
  if (!difference || typeof difference !== "string") return "";

  // Split the difference into parts
  const parts = difference?.split(":");
  if (parts.length !== 4) {
    console.error("Invalid difference format:", difference);
    return "";
  }
  // Split the difference into days, hours, minutes, and seconds
  const [daysPart, hoursPart, minutesPart, secondsPart] =
    difference?.split(":");
  const [days] = daysPart?.split("days").map(Number);
  const [hours] = hoursPart?.split("hours").map(Number);
  const [minutes] = minutesPart?.split("mins").map(Number);
  const [seconds] = secondsPart?.split("secs").map(Number);

  let result = "";

  if (days > 0) {
    result += `${days} days `;
    result += hours > 0 ? `${hours} hours` : "";
  } else if (hours > 0) {
    result += `${hours} hours `;
    result += minutes > 0 ? `${minutes} mins` : "";
  } else if (minutes > 0) {
    result += `${minutes} mins `;
    result += seconds > 0 ? `${seconds} secs` : "";
  } else if (seconds > 0) {
    result += `${seconds} secs`;
  }

  return result.trim();
};
export const calculateTimeDifference = (steps, starts_at, current_date) => {
  if (!starts_at || !current_date || !steps) return;

  const [time, meridiem] = starts_at.split(" ");
  let [currentHours, currentMinutes, currentSeconds] = time
    .split(":")
    .map(Number);

  if (meridiem) {
    if (meridiem.toLowerCase() === "pm" && currentHours < 12)
      currentHours += 12;
    if (meridiem.toLowerCase() === "am" && currentHours === 12)
      currentHours = 0;
  }

  const [day, month, year] = current_date.split("-").map(Number);
  const myDate = `${day}/${month}/${year}`;
  const currentDateTime = new Date(myDate);

  currentDateTime.setHours(currentHours, currentMinutes, currentSeconds);

  const realCurrentTime = new Date();
  const diffInMilliseconds = realCurrentTime - currentDateTime;
  let diffInSeconds = 0;

  let count2InSeconds = 0;
  let timeTakenInSeconds = 0;
  steps.forEach((step) => {
    const { time_taken, step_status, count2, time_unit } = step;
    count2InSeconds = convertCount2ToSeconds(count2, time_unit);
    timeTakenInSeconds = parseTimeTaken(time_taken);
    if (step_status === "completed") {
      if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else if (step_status === "in_progress") {
      count2InSeconds = convertCount2ToSeconds(count2, time_unit);
      timeTakenInSeconds = parseTimeTaken(step?.time_taken);

      if (count2InSeconds > timeTakenInSeconds) {
        diffInSeconds += convertCount2ToSeconds(count2, time_unit);
      } else if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else {
      diffInSeconds += convertCount2ToSeconds(count2, time_unit);
    }
  });
  const formattedDifference = convertSecondsToDHMSFormat(diffInSeconds);
  const unqiueFormat = formatTimeDifference(formattedDifference);

  return ` (${unqiueFormat}) `;
};
export const calculateTimeDifferenceDestination = (
  steps,
  starts_at,
  current_date
) => {
  if (!starts_at || !current_date || !steps) return;

  const [time, meridiem] = starts_at.split(" ");
  let [currentHours, currentMinutes, currentSeconds] = time
    .split(":")
    .map(Number);

  if (meridiem) {
    if (meridiem.toLowerCase() === "pm" && currentHours < 12)
      currentHours += 12;
    if (meridiem.toLowerCase() === "am" && currentHours === 12)
      currentHours = 0;
  }

  const [day, month, year] = current_date.split("-").map(Number);
  const myDate = `${day}/${month}/${year}`;
  const currentDateTime = new Date(myDate);

  currentDateTime.setHours(currentHours, currentMinutes, currentSeconds);

  const realCurrentTime = new Date();
  const diffInMilliseconds = realCurrentTime - currentDateTime;
  let diffInSeconds = 0;

  let count2InSeconds = 0;
  let timeTakenInSeconds = 0;
  steps.forEach((step) => {
    const { time_taken, step_status, count2, time_unit } = step;
    count2InSeconds = convertCount2ToSeconds(count2, time_unit);
    timeTakenInSeconds = parseTimeTaken(time_taken);
    if (step_status === "completed") {
      if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else if (step_status === "in_progress") {
      count2InSeconds = convertCount2ToSeconds(count2, time_unit);
      timeTakenInSeconds = parseTimeTaken(step?.time_taken);

      if (count2InSeconds > timeTakenInSeconds) {
        diffInSeconds += convertCount2ToSeconds(count2, time_unit);
      } else if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else {
      diffInSeconds += convertCount2ToSeconds(count2, time_unit);
    }
  });
  const formattedDifference = convertSecondsToDHMSFormat(diffInSeconds);
  const unqiueFormat = formatTimeDifference(formattedDifference);

  return ` ${unqiueFormat} `;
};

export const formatTimeDifferencePrepareData = (difference, t) => {
  if (!difference) return;
  const { days, hours, minutes, seconds } = difference;
  const parts = [];

  // Only show days if greater than 0
  if (days > 0) {
    parts.push(
      `${days} ${days === 1 ? t("time_unit.day") : t("time_unit.days")}`
    );
  } else {
    // Only show hours, minutes, and seconds if days are not present
    if (hours > 0) {
      parts.push(
        `${hours} ${hours === 1 ? t("time_unit.hour") : t("time_unit.hours")}`
      );
    }
    if (minutes > 0) {
      parts.push(
        `${minutes} ${minutes === 1 ? t("time_unit.minute") : t("time_unit.minutes")
        }`
      );
    }
    if (seconds > 0) {
      parts.push(
        `${seconds} ${seconds === 1 ? t("time_unit.second") : t("time_unit.seconds")
        }`
      );
    }
  }

  return parts.join(" ");
};
export const calculateTimeDifferencePrepareData = (
  steps,
  starts_at,
  current_date,
  t
) => {
  if (!starts_at || !current_date || !steps) return;

  const [time, meridiem] = starts_at.split(" ");
  let [currentHours, currentMinutes, currentSeconds] = time
    .split(":")
    .map(Number);

  if (meridiem) {
    if (meridiem.toLowerCase() === "pm" && currentHours < 12)
      currentHours += 12;
    if (meridiem.toLowerCase() === "am" && currentHours === 12)
      currentHours = 0;
  }

  const [day, month, year] = current_date.split("-").map(Number);
  const myDate = `${day}/${month}/${year}`;
  const currentDateTime = new Date(myDate);

  currentDateTime.setHours(currentHours, currentMinutes, currentSeconds);

  const realCurrentTime = new Date();
  const diffInMilliseconds = realCurrentTime - currentDateTime;
  let diffInSeconds = 0;

  let count2InSeconds = 0;
  let timeTakenInSeconds = 0;
  steps.forEach((step) => {
    const { time_taken, step_status, count2, time_unit } = step;
    count2InSeconds = convertCount2ToSeconds(count2, time_unit);
    timeTakenInSeconds = parseTimeTaken(time_taken);
    if (step_status === "completed") {
      if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else if (step_status === "in_progress") {
      count2InSeconds = convertCount2ToSeconds(count2, time_unit);
      timeTakenInSeconds = parseTimeTaken(step?.time_taken);

      if (count2InSeconds > timeTakenInSeconds) {
        diffInSeconds += convertCount2ToSeconds(count2, time_unit);
      } else if (time_taken) {
        diffInSeconds += parseTimeTaken(time_taken);
      }
    } else {
      diffInSeconds += convertCount2ToSeconds(count2, time_unit);
    }
  });
  const formattedDifference = convertSecondsToDHMSFormat(diffInSeconds);

  // Calculate days, hours, minutes, and seconds from diffInSeconds
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  // Create a structured object for time difference
  const timeDifference = { days, hours, minutes, seconds };

  // Omit hours if days are present
  if (timeDifference.days > 0) {
    timeDifference.hours = 0;
  } else if (timeDifference.hours > 0) {
    timeDifference.minutes = 0;
    timeDifference.seconds = 0;
  } else if (timeDifference.minutes > 0) {
    timeDifference.seconds = 0;
  } else {
    timeDifference.seconds = 0;
  }
  // Localize the output
  const localizedFormat = formatTimeDifferencePrepareData(timeDifference, t);
  // const unqiueFormat = formatTimeDifference(formattedDifference);

  return ` ${localizedFormat} `;
};
export const parseTimeTaken = (timeTaken) => {
  if (!timeTaken) {
    return;
  }
  let totalSeconds = 0;

  const parts = timeTaken.split(" - ");

  parts.forEach((part) => {
    const [value, unit] = part?.split(" ");

    switch (unit) {
      case "days":
      case "day":
        totalSeconds += parseInt(value, 10) * 86400; // 1 day = 86400 seconds
        break;
      case "hours":
      case "hour":
        totalSeconds += parseInt(value, 10) * 3600;
        break;
      case "mins":
      case "min":
        totalSeconds += parseInt(value, 10) * 60;
        break;
      case "secs":
      case "sec":
        totalSeconds += parseInt(value, 10);
        break;
      default:
        totalSeconds += parseInt(value, 10) * 60;
        break;
    }
  });

  return totalSeconds;
};

// export const getOptions = (t) => [
//   {
//     title: "Atelier",
//     label: t("meeting.newMeeting.options.activityTypes.businessPresentation"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M12.5 6C12.5 6.79565 12.1839 7.55871 11.6213 8.12132C11.0587 8.68393 10.2956 9 9.5 9C8.70435 9 7.94129 8.68393 7.37868 8.12132C6.81607 7.55871 6.5 6.79565 6.5 6C6.5 5.20435 6.81607 4.44129 7.37868 3.87868C7.94129 3.31607 8.70435 3 9.5 3C10.2956 3 11.0587 3.31607 11.6213 3.87868C12.1839 4.44129 12.5 5.20435 12.5 6ZM8 24V33H5V15C4.99986 14.1127 5.26205 13.2451 5.7536 12.5064C6.24516 11.7677 6.94413 11.1908 7.76265 10.8482C8.58117 10.5056 9.4827 10.4127 10.3539 10.5811C11.2251 10.7494 12.0271 11.1716 12.659 11.7945L16.22 15.159L19.6895 11.6895L21.8105 13.8105L16.28 19.341L14 17.19V33H11V24H8ZM9.5 13.5C9.10218 13.5 8.72064 13.658 8.43934 13.9393C8.15804 14.2206 8 14.6022 8 15V21H11V15C11 14.6022 10.842 14.2206 10.5607 13.9393C10.2794 13.658 9.89782 13.5 9.5 13.5ZM29 7.5H15.5V4.5H30.5C30.8978 4.5 31.2794 4.65804 31.5607 4.93934C31.842 5.22064 32 5.60218 32 6V22.5C32 22.8978 31.842 23.2794 31.5607 23.5607C31.2794 23.842 30.8978 24 30.5 24H25.364L29.5985 33H26.2835L22.0475 24H15.5V21H29V7.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Comité",
//     label: t("meeting.newMeeting.options.activityTypes.committee"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M18.5 16.5C20.4891 16.5 22.3968 17.2902 23.8033 18.6967C25.2098 20.1032 26 22.0109 26 24V33H23V24C23.0001 22.8522 22.5615 21.7477 21.7741 20.9126C20.9866 20.0775 19.9098 19.5748 18.764 19.5075L18.5 19.5C17.3522 19.4999 16.2477 19.9385 15.4126 20.7259C14.5775 21.5134 14.0748 22.5902 14.0075 23.736L14 24V33H11V24C11 22.0109 11.7902 20.1032 13.1967 18.6967C14.6032 17.2902 16.5109 16.5 18.5 16.5ZM8.75 21C9.17 21.001 9.575 21.048 9.965 21.141C9.70947 21.9048 9.55762 22.6993 9.5135 23.5035L9.5 24V24.129C9.32755 24.0674 9.14822 24.0271 8.966 24.009L8.75 24C8.19091 24 7.65184 24.2081 7.23784 24.5839C6.82383 24.9596 6.56455 25.476 6.5105 26.0325L6.5 26.25V33H3.5V26.25C3.5 24.8576 4.05312 23.5223 5.03769 22.5377C6.02226 21.5531 7.35761 21 8.75 21ZM28.25 21C29.6424 21 30.9777 21.5531 31.9623 22.5377C32.9469 23.5223 33.5 24.8576 33.5 26.25V33H30.5V26.25C30.5 25.6909 30.2919 25.1518 29.9161 24.7378C29.5404 24.3238 29.024 24.0645 28.4675 24.0105L28.25 24C27.986 24.001 27.736 24.0435 27.5 24.1275V24C27.5 23.001 27.338 22.041 27.038 21.144C27.425 21.0495 27.833 21 28.25 21ZM8.75 12C9.74456 12 10.6984 12.3951 11.4017 13.0983C12.1049 13.8016 12.5 14.7554 12.5 15.75C12.5 16.7446 12.1049 17.6984 11.4017 18.4017C10.6984 19.1049 9.74456 19.5 8.75 19.5C7.75544 19.5 6.80161 19.1049 6.09835 18.4017C5.39509 17.6984 5 16.7446 5 15.75C5 14.7554 5.39509 13.8016 6.09835 13.0983C6.80161 12.3951 7.75544 12 8.75 12ZM28.25 12C29.2446 12 30.1984 12.3951 30.9016 13.0983C31.6049 13.8016 32 14.7554 32 15.75C32 16.7446 31.6049 17.6984 30.9016 18.4017C30.1984 19.1049 29.2446 19.5 28.25 19.5C27.2554 19.5 26.3016 19.1049 25.5984 18.4017C24.8951 17.6984 24.5 16.7446 24.5 15.75C24.5 14.7554 24.8951 13.8016 25.5984 13.0983C26.3016 12.3951 27.2554 12 28.25 12ZM8.75 15C8.55109 15 8.36032 15.079 8.21967 15.2197C8.07902 15.3603 8 15.5511 8 15.75C8 15.9489 8.07902 16.1397 8.21967 16.2803C8.36032 16.421 8.55109 16.5 8.75 16.5C8.94891 16.5 9.13968 16.421 9.28033 16.2803C9.42098 16.1397 9.5 15.9489 9.5 15.75C9.5 15.5511 9.42098 15.3603 9.28033 15.2197C9.13968 15.079 8.94891 15 8.75 15ZM28.25 15C28.0511 15 27.8603 15.079 27.7197 15.2197C27.579 15.3603 27.5 15.5511 27.5 15.75C27.5 15.9489 27.579 16.1397 27.7197 16.2803C27.8603 16.421 28.0511 16.5 28.25 16.5C28.4489 16.5 28.6397 16.421 28.7803 16.2803C28.921 16.1397 29 15.9489 29 15.75C29 15.5511 28.921 15.3603 28.7803 15.2197C28.6397 15.079 28.4489 15 28.25 15ZM18.5 3C20.0913 3 21.6174 3.63214 22.7426 4.75736C23.8679 5.88258 24.5 7.4087 24.5 9C24.5 10.5913 23.8679 12.1174 22.7426 13.2426C21.6174 14.3679 20.0913 15 18.5 15C16.9087 15 15.3826 14.3679 14.2574 13.2426C13.1321 12.1174 12.5 10.5913 12.5 9C12.5 7.4087 13.1321 5.88258 14.2574 4.75736C15.3826 3.63214 16.9087 3 18.5 3ZM18.5 6C17.7044 6 16.9413 6.31607 16.3787 6.87868C15.8161 7.44129 15.5 8.20435 15.5 9C15.5 9.79565 15.8161 10.5587 16.3787 11.1213C16.9413 11.6839 17.7044 12 18.5 12C19.2956 12 20.0587 11.6839 20.6213 11.1213C21.1839 10.5587 21.5 9.79565 21.5 9C21.5 8.20435 21.1839 7.44129 20.6213 6.87868C20.0587 6.31607 19.2956 6 18.5 6Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Conférence",
//     label: t("meeting.newMeeting.options.activityTypes.conference"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M16.7315 3.0045L16.8815 3.03L29.6315 6.03C29.8528 6.08177 30.0532 6.19933 30.2063 6.36721C30.3595 6.53509 30.4582 6.74542 30.4895 6.9705L30.5 7.125V28.875C30.5001 29.1023 30.4313 29.3242 30.3028 29.5117C30.1743 29.6991 29.992 29.8432 29.78 29.925L29.633 29.97L16.883 32.97C16.7304 33.0059 16.5721 33.0096 16.418 32.9808C16.264 32.9519 16.1177 32.8912 15.9884 32.8025C15.8592 32.7138 15.7499 32.5991 15.6676 32.4657C15.5853 32.3324 15.5318 32.1833 15.5105 32.028L15.5 31.875V4.125C15.4998 3.83352 15.6128 3.55334 15.8151 3.34349C16.0174 3.13364 16.2932 3.01049 16.5845 3L16.7315 3.0045ZM17.75 5.5455V30.4545L28.25 27.984V8.016L17.75 5.5455ZM14 6V8.25H8.75V27.75H14V30H7.625C7.35314 30 7.09049 29.9015 6.8856 29.7229C6.68072 29.5442 6.54747 29.2973 6.5105 29.028L6.5 28.875V7.125C6.50001 6.85314 6.59846 6.59049 6.77715 6.3856C6.95584 6.18072 7.20267 6.04747 7.472 6.0105L7.625 6H14ZM21.5 16.5C21.8978 16.5 22.2794 16.658 22.5607 16.9393C22.842 17.2206 23 17.6022 23 18C23 18.3978 22.842 18.7794 22.5607 19.0607C22.2794 19.342 21.8978 19.5 21.5 19.5C21.1022 19.5 20.7206 19.342 20.4393 19.0607C20.158 18.7794 20 18.3978 20 18C20 17.6022 20.158 17.2206 20.4393 16.9393C20.7206 16.658 21.1022 16.5 21.5 16.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Entretien individuel",
//     label: t("meeting.newMeeting.options.activityTypes.individualInterview"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <g clip-path="url(#clip0_1_441)">
//           <path
//             d="M8 20.25H29M18.5 20.25V36M10.25 16.5V9.75H8.492C7.49305 9.75001 6.5225 10.0824 5.73329 10.6948C4.94407 11.3072 4.38107 12.1648 4.133 13.1325L1.25 24.375V24.75H11.75V27C11.75 29.25 11.75 30.75 12.875 33C12.875 33 14 35.25 15.5 35.25M26.75 16.5V9.75H28.508C29.507 9.75001 30.4775 10.0824 31.2667 10.6948C32.0559 11.3072 32.6189 12.1648 32.867 13.1325L35.75 24.375V24.75H25.25V27C25.25 29.25 25.25 30.75 24.125 33C24.125 33 23 35.25 21.5 35.25M10.025 6.75C10.025 6.75 7.625 5.25 7.625 3.375C7.625 2.6796 7.90125 2.01269 8.39297 1.52097C8.88469 1.02925 9.5516 0.753 10.247 0.753C10.9424 0.753 11.6093 1.02925 12.101 1.52097C12.5928 2.01269 12.869 2.6796 12.869 3.375C12.869 5.25 10.475 6.75 10.475 6.75H10.025ZM26.975 6.75C26.975 6.75 29.375 5.25 29.375 3.375C29.375 2.67881 29.0984 2.01113 28.6062 1.51884C28.1139 1.02656 27.4462 0.75 26.75 0.75C25.301 0.75 24.131 1.926 24.131 3.375C24.131 5.25 26.525 6.75 26.525 6.75H26.975Z"
//             stroke="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <clipPath id="clip0_1_441">
//             <rect
//               width="36"
//               height="36"
//               fill="white"
//               transform="translate(0.5)"
//             />
//           </clipPath>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Embauche",
//     label: t("meeting.newMeeting.options.activityTypes.jobInterview"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
//           stroke="#DAE6ED"
//           stroke-width="1.5"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Pomodoro",
//     label: t("meeting.newMeeting.options.activityTypes.Pomodoro"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M27.7895 8.30849L27.7872 8.30699C27.7775 8.29949 27.7647 8.29649 27.7557 8.28974C27.7705 8.11667 27.7376 7.94288 27.6606 7.78715C27.5837 7.63143 27.4656 7.49971 27.3192 7.40624C25.8222 6.44624 22.9273 5.04599 20.0593 6.19499V4.01624C20.0593 3.12374 19.412 2.39624 18.617 2.39624H17.3248C16.529 2.39624 15.8818 3.12374 15.8818 4.01624V6.40274C14.5888 6.17249 11.7717 5.94524 9.06425 7.56149C8.86667 7.67695 8.71684 7.85919 8.64176 8.07536C8.56668 8.29153 8.57128 8.52742 8.65475 8.74049C8.672 8.78624 8.7035 8.82074 8.726 8.86199L8.546 8.90699C8.4095 8.94299 8.2775 9.01199 8.1635 9.10499C4.961 11.769 3.125 15.5677 3.125 19.5262C3.125 27.2887 10.022 33.6037 18.5 33.6037C26.978 33.6037 33.875 27.2887 33.875 19.5262C33.875 15.0855 31.6573 10.9965 27.7895 8.30849Z"
//           stroke="#DAE6ED"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//         <path
//           d="M27.7873 8.30699C25.7473 7.95824 23.2551 7.66499 22.8223 9.25274C22.7511 9.73424 22.9776 10.2052 23.3991 10.4535C24.9111 11.3737 25.7406 12.3555 26.1816 13.773C24.3621 12.3937 21.4251 11.2095 19.8928 12.1327C19.7788 12.2459 19.6886 12.3808 19.6277 12.5295C19.5667 12.6782 19.5363 12.8376 19.5381 12.9982C19.5943 16.6087 18.3471 19.0305 17.6211 20.1262C16.9288 18.6585 16.7151 15.501 16.7541 12.906C16.7573 12.6148 16.6529 12.3327 16.4609 12.1137C16.269 11.8948 16.0029 11.7544 15.7138 11.7195C13.5951 11.5095 11.6203 12.6735 9.96133 13.8697C10.6423 12.6262 11.6376 11.4592 12.7086 10.668C13.2171 10.3312 13.7863 9.93524 13.6873 9.24299C13.1383 7.33499 10.4098 7.86899 8.72608 8.86199M5.49658 20.4195C5.61946 21.2703 5.90735 22.0888 6.34408 22.8292M6.03508 15.6375C5.7755 16.3551 5.61674 17.1053 5.56333 17.8665"
//           stroke="#DAE6ED"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Formation",
//     label: t("meeting.newMeeting.options.activityTypes.training"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M12.5 6C12.5 6.79565 12.1839 7.55871 11.6213 8.12132C11.0587 8.68393 10.2956 9 9.5 9C8.70435 9 7.94129 8.68393 7.37868 8.12132C6.81607 7.55871 6.5 6.79565 6.5 6C6.5 5.20435 6.81607 4.44129 7.37868 3.87868C7.94129 3.31607 8.70435 3 9.5 3C10.2956 3 11.0587 3.31607 11.6213 3.87868C12.1839 4.44129 12.5 5.20435 12.5 6ZM8 24V33H5V15C4.99986 14.1127 5.26205 13.2451 5.7536 12.5064C6.24516 11.7677 6.94413 11.1908 7.76265 10.8482C8.58117 10.5056 9.4827 10.4127 10.3539 10.5811C11.2251 10.7494 12.0271 11.1716 12.659 11.7945L16.22 15.159L19.6895 11.6895L21.8105 13.8105L16.28 19.341L14 17.19V33H11V24H8ZM9.5 13.5C9.10218 13.5 8.72064 13.658 8.43934 13.9393C8.15804 14.2206 8 14.6022 8 15V21H11V15C11 14.6022 10.842 14.2206 10.5607 13.9393C10.2794 13.658 9.89782 13.5 9.5 13.5ZM29 7.5H15.5V4.5H30.5C30.8978 4.5 31.2794 4.65804 31.5607 4.93934C31.842 5.22064 32 5.60218 32 6V22.5C32 22.8978 31.842 23.2794 31.5607 23.5607C31.2794 23.842 30.8978 24 30.5 24H25.364L29.5985 33H26.2835L22.0475 24H15.5V21H29V7.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Intégration",
//     label: t("meeting.newMeeting.options.activityTypes.integration"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <g clip-path="url(#clip0_1_457)">
//           <path
//             d="M31.3461 22.2C30.436 25.0093 28.6299 27.4428 26.2045 29.1274C23.7791 30.8121 20.8682 31.655 17.9179 31.527C14.9676 31.399 12.1407 30.3071 9.87031 28.4187C7.59994 26.5303 6.01138 23.9496 5.34807 21.072L7.90107 20.568L3.04107 15.54L0.49707 22.041L3.18807 21.513C3.93908 24.891 5.78168 27.9276 8.43114 30.1536C11.0806 32.3796 14.3894 33.6711 17.8463 33.8285C21.3032 33.9859 24.7157 33.0005 27.5565 31.0244C30.3973 29.0484 32.5082 26.1917 33.5631 22.896L31.3461 22.2ZM33.8541 14.58C33.1027 11.2021 31.2598 8.16573 28.6101 5.94002C25.9604 3.71431 22.6515 2.42317 19.1947 2.26611C15.7378 2.10906 12.3254 3.09484 9.48488 5.07112C6.64431 7.0474 4.53366 9.90416 3.47907 13.2L5.61807 13.896C6.52784 11.0866 8.33368 8.65298 10.7589 6.9681C13.1841 5.28322 16.0948 4.44001 19.0451 4.56767C21.9953 4.69534 24.8224 5.78684 27.0929 7.67492C29.3635 9.563 30.9524 12.1435 31.6161 15.021L29.0631 15.528L33.9231 20.544L36.4971 14.052L33.8541 14.58Z"
//             fill="#DAE6ED"
//           />
//           <path
//             d="M27.626 24.396C27.7304 24.5024 27.8129 24.6282 27.8686 24.7665C27.9244 24.9047 27.9523 25.0526 27.9509 25.2016C27.9495 25.3506 27.9188 25.4979 27.8605 25.6351C27.8022 25.7723 27.7174 25.8966 27.611 26.001C27.5047 26.1054 27.3788 26.1878 27.2405 26.2436C27.1023 26.2993 26.9545 26.3273 26.8054 26.3259C26.6564 26.3245 26.5091 26.2938 26.3719 26.2354C26.2348 26.1771 26.1104 26.0924 26.006 25.986L21.941 21.846C21.734 21.6332 21.6181 21.3479 21.6181 21.051C21.6181 20.754 21.734 20.4688 21.941 20.256C22.7331 19.4507 23.222 18.3959 23.3246 17.271C23.4271 16.146 23.1371 15.0203 22.5037 14.085C21.8703 13.1497 20.9326 12.4625 19.8499 12.1402C18.7673 11.818 17.6064 11.8804 16.5646 12.3171C15.5228 12.7537 14.6643 13.5375 14.135 14.5354C13.6056 15.5333 13.438 16.6837 13.6608 17.7911C13.8835 18.8985 14.4827 19.8947 15.3567 20.6104C16.2306 21.326 17.3254 21.717 18.455 21.717C18.7562 21.717 19.045 21.8366 19.258 22.0496C19.4709 22.2625 19.5905 22.5513 19.5905 22.8525C19.5905 23.1536 19.4709 23.4425 19.258 23.6554C19.045 23.8684 18.7562 23.988 18.455 23.988C16.8505 23.9873 15.2928 23.4473 14.0322 22.4547C12.7715 21.4622 11.881 20.0747 11.5038 18.5152C11.1266 16.9557 11.2845 15.3146 11.9521 13.8557C12.6198 12.3967 13.7585 11.2044 15.1852 10.4705C16.612 9.73651 18.2441 9.50342 19.8193 9.80864C21.3945 10.1139 22.8214 10.9397 23.8708 12.1534C24.9202 13.3672 25.5311 14.8984 25.6055 16.5012C25.6799 18.104 25.2135 19.6852 24.281 20.991L27.626 24.396Z"
//             fill="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <clipPath id="clip0_1_457">
//             <rect
//               width="36"
//               height="36"
//               fill="white"
//               transform="translate(0.5)"
//             />
//           </clipPath>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Partage d'informations",
//     label: t("meeting.newMeeting.options.activityTypes.informationSharing"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="39"
//         height="40"
//         viewBox="0 0 39 40"
//         fill="none"
//       >
//         <g filter="url(#filter0_d_1_463)">
//           <path
//             d="M33.7959 15.421L27.0459 22.171C26.8348 22.382 26.5485 22.5006 26.25 22.5006C25.9515 22.5006 25.6652 22.382 25.4541 22.171C25.243 21.9599 25.1244 21.6735 25.1244 21.375C25.1244 21.0765 25.243 20.7902 25.4541 20.5791L30.2845 15.75H24.7031C21.9591 15.7493 19.2926 16.6606 17.1229 18.3407C14.9533 20.0208 13.4037 22.3743 12.7177 25.0313C12.6431 25.3203 12.4567 25.5679 12.1996 25.7195C11.9424 25.8712 11.6356 25.9145 11.3466 25.8399C11.0575 25.7653 10.8099 25.5789 10.6583 25.3218C10.5067 25.0646 10.4634 24.7578 10.538 24.4688C11.3474 21.3279 13.1786 18.5456 15.743 16.5598C18.3075 14.574 21.4597 13.4976 24.7031 13.5H30.2873L25.4541 8.67095C25.3495 8.56643 25.2666 8.44234 25.2101 8.30577C25.1535 8.16921 25.1244 8.02283 25.1244 7.87502C25.1244 7.7272 25.1535 7.58082 25.2101 7.44426C25.2666 7.30769 25.3495 7.1836 25.4541 7.07908C25.6652 6.86798 25.9515 6.74939 26.25 6.74939C26.3978 6.74939 26.5442 6.7785 26.6808 6.83507C26.8173 6.89164 26.9414 6.97455 27.0459 7.07908L33.7959 13.8291C33.9005 13.9336 33.9835 14.0576 34.0401 14.1942C34.0967 14.3308 34.1259 14.4772 34.1259 14.625C34.1259 14.7729 34.0967 14.9193 34.0401 15.0558C33.9835 15.1924 33.9005 15.3165 33.7959 15.421ZM28.5 29.25H7.125V12.375C7.125 12.0766 7.00647 11.7905 6.79549 11.5795C6.58452 11.3685 6.29837 11.25 6 11.25C5.70163 11.25 5.41548 11.3685 5.2045 11.5795C4.99353 11.7905 4.875 12.0766 4.875 12.375V30.375C4.875 30.6734 4.99353 30.9595 5.2045 31.1705C5.41548 31.3815 5.70163 31.5 6 31.5H28.5C28.7984 31.5 29.0845 31.3815 29.2955 31.1705C29.5065 30.9595 29.625 30.6734 29.625 30.375C29.625 30.0766 29.5065 29.7905 29.2955 29.5795C29.0845 29.3685 28.7984 29.25 28.5 29.25Z"
//             fill="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <filter
//             id="filter0_d_1_463"
//             x="-2.5"
//             y="0"
//             width="44"
//             height="44"
//             filterUnits="userSpaceOnUse"
//             color-interpolation-filters="sRGB"
//           >
//             <feFlood flood-opacity="0" result="BackgroundImageFix" />
//             <feColorMatrix
//               in="SourceAlpha"
//               type="matrix"
//               values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
//               result="hardAlpha"
//             />
//             <feOffset dy="4" />
//             <feGaussianBlur stdDeviation="2" />
//             <feComposite in2="hardAlpha" operator="out" />
//             <feColorMatrix
//               type="matrix"
//               values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
//             />
//             <feBlend
//               mode="normal"
//               in2="BackgroundImageFix"
//               result="effect1_dropShadow_1_463"
//             />
//             <feBlend
//               mode="normal"
//               in="SourceGraphic"
//               in2="effect1_dropShadow_1_463"
//               result="shape"
//             />
//           </filter>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Présentation",
//     label: t("meeting.newMeeting.options.activityTypes.pitchPresentation"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M12.5 6C12.5 6.79565 12.1839 7.55871 11.6213 8.12132C11.0587 8.68393 10.2956 9 9.5 9C8.70435 9 7.94129 8.68393 7.37868 8.12132C6.81607 7.55871 6.5 6.79565 6.5 6C6.5 5.20435 6.81607 4.44129 7.37868 3.87868C7.94129 3.31607 8.70435 3 9.5 3C10.2956 3 11.0587 3.31607 11.6213 3.87868C12.1839 4.44129 12.5 5.20435 12.5 6ZM8 24V33H5V15C4.99986 14.1127 5.26205 13.2451 5.7536 12.5064C6.24516 11.7677 6.94413 11.1908 7.76265 10.8482C8.58117 10.5056 9.4827 10.4127 10.3539 10.5811C11.2251 10.7494 12.0271 11.1716 12.659 11.7945L16.22 15.159L19.6895 11.6895L21.8105 13.8105L16.28 19.341L14 17.19V33H11V24H8ZM9.5 13.5C9.10218 13.5 8.72064 13.658 8.43934 13.9393C8.15804 14.2206 8 14.6022 8 15V21H11V15C11 14.6022 10.842 14.2206 10.5607 13.9393C10.2794 13.658 9.89782 13.5 9.5 13.5ZM29 7.5H15.5V4.5H30.5C30.8978 4.5 31.2794 4.65804 31.5607 4.93934C31.842 5.22064 32 5.60218 32 6V22.5C32 22.8978 31.842 23.2794 31.5607 23.5607C31.2794 23.842 30.8978 24 30.5 24H25.364L29.5985 33H26.2835L22.0475 24H15.5V21H29V7.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Quiz",
//     label: t("meeting.newMeeting.options.activityTypes.quiz"),
//     svg: (
//       <svg
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M21.5 22.5C21.925 22.5 22.294 22.344 22.607 22.032C22.92 21.72 23.076 21.351 23.075 20.925C23.074 20.499 22.918 20.1305 22.607 19.8195C22.296 19.5085 21.927 19.352 21.5 19.35C21.073 19.348 20.7045 19.5045 20.3945 19.8195C20.0845 20.1345 19.928 20.503 19.925 20.925C19.922 21.347 20.0785 21.716 20.3945 22.032C20.7105 22.348 21.079 22.504 21.5 22.5ZM20.375 17.7H22.625C22.625 16.975 22.7 16.444 22.85 16.107C23 15.77 23.35 15.326 23.9 14.775C24.65 14.025 25.15 13.419 25.4 12.957C25.65 12.495 25.775 11.951 25.775 11.325C25.775 10.2 25.381 9.2815 24.593 8.5695C23.805 7.8575 22.774 7.501 21.5 7.5C20.475 7.5 19.5815 7.7875 18.8195 8.3625C18.0575 8.9375 17.526 9.7 17.225 10.65L19.25 11.475C19.475 10.85 19.7815 10.3815 20.1695 10.0695C20.5575 9.7575 21.001 9.601 21.5 9.6C22.1 9.6 22.5875 9.769 22.9625 10.107C23.3375 10.445 23.525 10.901 23.525 11.475C23.525 11.825 23.425 12.1565 23.225 12.4695C23.025 12.7825 22.675 13.176 22.175 13.65C21.35 14.375 20.844 14.944 20.657 15.357C20.47 15.77 20.376 16.551 20.375 17.7ZM12.5 27C11.675 27 10.969 26.7065 10.382 26.1195C9.795 25.5325 9.501 24.826 9.5 24V6C9.5 5.175 9.794 4.469 10.382 3.882C10.97 3.295 11.676 3.001 12.5 3H30.5C31.325 3 32.0315 3.294 32.6195 3.882C33.2075 4.47 33.501 5.176 33.5 6V24C33.5 24.825 33.2065 25.5315 32.6195 26.1195C32.0325 26.7075 31.326 27.001 30.5 27H12.5ZM12.5 24H30.5V6H12.5V24ZM6.5 33C5.675 33 4.969 32.7065 4.382 32.1195C3.795 31.5325 3.501 30.826 3.5 30V9H6.5V30H27.5V33H6.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Réseautage",
//     label: t("meeting.newMeeting.options.activityTypes.collaborativeMeeting"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <g clip-path="url(#clip0_1_441)">
//           <path
//             d="M8 20.25H29M18.5 20.25V36M10.25 16.5V9.75H8.492C7.49305 9.75001 6.5225 10.0824 5.73329 10.6948C4.94407 11.3072 4.38107 12.1648 4.133 13.1325L1.25 24.375V24.75H11.75V27C11.75 29.25 11.75 30.75 12.875 33C12.875 33 14 35.25 15.5 35.25M26.75 16.5V9.75H28.508C29.507 9.75001 30.4775 10.0824 31.2667 10.6948C32.0559 11.3072 32.6189 12.1648 32.867 13.1325L35.75 24.375V24.75H25.25V27C25.25 29.25 25.25 30.75 24.125 33C24.125 33 23 35.25 21.5 35.25M10.025 6.75C10.025 6.75 7.625 5.25 7.625 3.375C7.625 2.6796 7.90125 2.01269 8.39297 1.52097C8.88469 1.02925 9.5516 0.753 10.247 0.753C10.9424 0.753 11.6093 1.02925 12.101 1.52097C12.5928 2.01269 12.869 2.6796 12.869 3.375C12.869 5.25 10.475 6.75 10.475 6.75H10.025ZM26.975 6.75C26.975 6.75 29.375 5.25 29.375 3.375C29.375 2.67881 29.0984 2.01113 28.6062 1.51884C28.1139 1.02656 27.4462 0.75 26.75 0.75C25.301 0.75 24.131 1.926 24.131 3.375C24.131 5.25 26.525 6.75 26.525 6.75H26.975Z"
//             stroke="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <clipPath id="clip0_1_441">
//             <rect
//               width="36"
//               height="36"
//               fill="white"
//               transform="translate(0.5)"
//             />
//           </clipPath>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Rituel agile",
//     label: t("meeting.newMeeting.options.activityTypes.Agile ritual"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M26.75 28.5H33.5M33.5 28.5L29.75 24.75M33.5 28.5L29.75 32.25M18.5 3L14.75 6.75L18.5 10.5"
//           stroke="#DAE6ED"
//           stroke-width="1.5"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//         <path
//           d="M16.25 6.75C19.2337 6.75 22.0952 7.93526 24.205 10.045C26.3147 12.1548 27.5 15.0163 27.5 18C27.5 20.9837 26.3147 23.8452 24.205 25.955C22.0952 28.0647 19.2337 29.25 16.25 29.25H3.5"
//           stroke="#DAE6ED"
//           stroke-width="1.5"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//         <path
//           d="M10.634 8.25C8.92105 9.23686 7.49839 10.6577 6.50931 12.3694C5.52022 14.081 4.99964 16.0231 5 18C5 20.532 5.837 22.869 7.25 24.75"
//           stroke="#DAE6ED"
//           stroke-width="1.5"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Résolution de problème",
//     label: t("meeting.newMeeting.options.activityTypes.problemResolution"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M27.7895 8.30849L27.7872 8.30699C27.7775 8.29949 27.7647 8.29649 27.7557 8.28974C27.7705 8.11667 27.7376 7.94288 27.6606 7.78715C27.5837 7.63143 27.4656 7.49971 27.3192 7.40624C25.8222 6.44624 22.9273 5.04599 20.0593 6.19499V4.01624C20.0593 3.12374 19.412 2.39624 18.617 2.39624H17.3248C16.529 2.39624 15.8818 3.12374 15.8818 4.01624V6.40274C14.5888 6.17249 11.7717 5.94524 9.06425 7.56149C8.86667 7.67695 8.71684 7.85919 8.64176 8.07536C8.56668 8.29153 8.57128 8.52742 8.65475 8.74049C8.672 8.78624 8.7035 8.82074 8.726 8.86199L8.546 8.90699C8.4095 8.94299 8.2775 9.01199 8.1635 9.10499C4.961 11.769 3.125 15.5677 3.125 19.5262C3.125 27.2887 10.022 33.6037 18.5 33.6037C26.978 33.6037 33.875 27.2887 33.875 19.5262C33.875 15.0855 31.6573 10.9965 27.7895 8.30849Z"
//           stroke="#DAE6ED"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//         <path
//           d="M27.7873 8.30699C25.7473 7.95824 23.2551 7.66499 22.8223 9.25274C22.7511 9.73424 22.9776 10.2052 23.3991 10.4535C24.9111 11.3737 25.7406 12.3555 26.1816 13.773C24.3621 12.3937 21.4251 11.2095 19.8928 12.1327C19.7788 12.2459 19.6886 12.3808 19.6277 12.5295C19.5667 12.6782 19.5363 12.8376 19.5381 12.9982C19.5943 16.6087 18.3471 19.0305 17.6211 20.1262C16.9288 18.6585 16.7151 15.501 16.7541 12.906C16.7573 12.6148 16.6529 12.3327 16.4609 12.1137C16.269 11.8948 16.0029 11.7544 15.7138 11.7195C13.5951 11.5095 11.6203 12.6735 9.96133 13.8697C10.6423 12.6262 11.6376 11.4592 12.7086 10.668C13.2171 10.3312 13.7863 9.93524 13.6873 9.24299C13.1383 7.33499 10.4098 7.86899 8.72608 8.86199M5.49658 20.4195C5.61946 21.2703 5.90735 22.0888 6.34408 22.8292M6.03508 15.6375C5.7755 16.3551 5.61674 17.1053 5.56333 17.8665"
//           stroke="#DAE6ED"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Réunion commerciale",
//     label: t("meeting.newMeeting.options.activityTypes.oneOnOne"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <g clip-path="url(#clip0_1_441)">
//           <path
//             d="M8 20.25H29M18.5 20.25V36M10.25 16.5V9.75H8.492C7.49305 9.75001 6.5225 10.0824 5.73329 10.6948C4.94407 11.3072 4.38107 12.1648 4.133 13.1325L1.25 24.375V24.75H11.75V27C11.75 29.25 11.75 30.75 12.875 33C12.875 33 14 35.25 15.5 35.25M26.75 16.5V9.75H28.508C29.507 9.75001 30.4775 10.0824 31.2667 10.6948C32.0559 11.3072 32.6189 12.1648 32.867 13.1325L35.75 24.375V24.75H25.25V27C25.25 29.25 25.25 30.75 24.125 33C24.125 33 23 35.25 21.5 35.25M10.025 6.75C10.025 6.75 7.625 5.25 7.625 3.375C7.625 2.6796 7.90125 2.01269 8.39297 1.52097C8.88469 1.02925 9.5516 0.753 10.247 0.753C10.9424 0.753 11.6093 1.02925 12.101 1.52097C12.5928 2.01269 12.869 2.6796 12.869 3.375C12.869 5.25 10.475 6.75 10.475 6.75H10.025ZM26.975 6.75C26.975 6.75 29.375 5.25 29.375 3.375C29.375 2.67881 29.0984 2.01113 28.6062 1.51884C28.1139 1.02656 27.4462 0.75 26.75 0.75C25.301 0.75 24.131 1.926 24.131 3.375C24.131 5.25 26.525 6.75 26.525 6.75H26.975Z"
//             stroke="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <clipPath id="clip0_1_441">
//             <rect
//               width="36"
//               height="36"
//               fill="white"
//               transform="translate(0.5)"
//             />
//           </clipPath>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Suivi de projet",
//     label: t("meeting.newMeeting.options.activityTypes.projectFollowup"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M16.7315 3.0045L16.8815 3.03L29.6315 6.03C29.8528 6.08177 30.0532 6.19933 30.2063 6.36721C30.3595 6.53509 30.4582 6.74542 30.4895 6.9705L30.5 7.125V28.875C30.5001 29.1023 30.4313 29.3242 30.3028 29.5117C30.1743 29.6991 29.992 29.8432 29.78 29.925L29.633 29.97L16.883 32.97C16.7304 33.0059 16.5721 33.0096 16.418 32.9808C16.264 32.9519 16.1177 32.8912 15.9884 32.8025C15.8592 32.7138 15.7499 32.5991 15.6676 32.4657C15.5853 32.3324 15.5318 32.1833 15.5105 32.028L15.5 31.875V4.125C15.4998 3.83352 15.6128 3.55334 15.8151 3.34349C16.0174 3.13364 16.2932 3.01049 16.5845 3L16.7315 3.0045ZM17.75 5.5455V30.4545L28.25 27.984V8.016L17.75 5.5455ZM14 6V8.25H8.75V27.75H14V30H7.625C7.35314 30 7.09049 29.9015 6.8856 29.7229C6.68072 29.5442 6.54747 29.2973 6.5105 29.028L6.5 28.875V7.125C6.50001 6.85314 6.59846 6.59049 6.77715 6.3856C6.95584 6.18072 7.20267 6.04747 7.472 6.0105L7.625 6H14ZM21.5 16.5C21.8978 16.5 22.2794 16.658 22.5607 16.9393C22.842 17.2206 23 17.6022 23 18C23 18.3978 22.842 18.7794 22.5607 19.0607C22.2794 19.342 21.8978 19.5 21.5 19.5C21.1022 19.5 20.7206 19.342 20.4393 19.0607C20.158 18.7794 20 18.3978 20 18C20 17.6022 20.158 17.2206 20.4393 16.9393C20.7206 16.658 21.1022 16.5 21.5 16.5Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Séminaire",
//     label: t("meeting.newMeeting.options.activityTypes.seminar"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <path
//           d="M18.5 16.5C20.4891 16.5 22.3968 17.2902 23.8033 18.6967C25.2098 20.1032 26 22.0109 26 24V33H23V24C23.0001 22.8522 22.5615 21.7477 21.7741 20.9126C20.9866 20.0775 19.9098 19.5748 18.764 19.5075L18.5 19.5C17.3522 19.4999 16.2477 19.9385 15.4126 20.7259C14.5775 21.5134 14.0748 22.5902 14.0075 23.736L14 24V33H11V24C11 22.0109 11.7902 20.1032 13.1967 18.6967C14.6032 17.2902 16.5109 16.5 18.5 16.5ZM8.75 21C9.17 21.001 9.575 21.048 9.965 21.141C9.70947 21.9048 9.55762 22.6993 9.5135 23.5035L9.5 24V24.129C9.32755 24.0674 9.14822 24.0271 8.966 24.009L8.75 24C8.19091 24 7.65184 24.2081 7.23784 24.5839C6.82383 24.9596 6.56455 25.476 6.5105 26.0325L6.5 26.25V33H3.5V26.25C3.5 24.8576 4.05312 23.5223 5.03769 22.5377C6.02226 21.5531 7.35761 21 8.75 21ZM28.25 21C29.6424 21 30.9777 21.5531 31.9623 22.5377C32.9469 23.5223 33.5 24.8576 33.5 26.25V33H30.5V26.25C30.5 25.6909 30.2919 25.1518 29.9161 24.7378C29.5404 24.3238 29.024 24.0645 28.4675 24.0105L28.25 24C27.986 24.001 27.736 24.0435 27.5 24.1275V24C27.5 23.001 27.338 22.041 27.038 21.144C27.425 21.0495 27.833 21 28.25 21ZM8.75 12C9.74456 12 10.6984 12.3951 11.4017 13.0983C12.1049 13.8016 12.5 14.7554 12.5 15.75C12.5 16.7446 12.1049 17.6984 11.4017 18.4017C10.6984 19.1049 9.74456 19.5 8.75 19.5C7.75544 19.5 6.80161 19.1049 6.09835 18.4017C5.39509 17.6984 5 16.7446 5 15.75C5 14.7554 5.39509 13.8016 6.09835 13.0983C6.80161 12.3951 7.75544 12 8.75 12ZM28.25 12C29.2446 12 30.1984 12.3951 30.9016 13.0983C31.6049 13.8016 32 14.7554 32 15.75C32 16.7446 31.6049 17.6984 30.9016 18.4017C30.1984 19.1049 29.2446 19.5 28.25 19.5C27.2554 19.5 26.3016 19.1049 25.5984 18.4017C24.8951 17.6984 24.5 16.7446 24.5 15.75C24.5 14.7554 24.8951 13.8016 25.5984 13.0983C26.3016 12.3951 27.2554 12 28.25 12ZM8.75 15C8.55109 15 8.36032 15.079 8.21967 15.2197C8.07902 15.3603 8 15.5511 8 15.75C8 15.9489 8.07902 16.1397 8.21967 16.2803C8.36032 16.421 8.55109 16.5 8.75 16.5C8.94891 16.5 9.13968 16.421 9.28033 16.2803C9.42098 16.1397 9.5 15.9489 9.5 15.75C9.5 15.5511 9.42098 15.3603 9.28033 15.2197C9.13968 15.079 8.94891 15 8.75 15ZM28.25 15C28.0511 15 27.8603 15.079 27.7197 15.2197C27.579 15.3603 27.5 15.5511 27.5 15.75C27.5 15.9489 27.579 16.1397 27.7197 16.2803C27.8603 16.421 28.0511 16.5 28.25 16.5C28.4489 16.5 28.6397 16.421 28.7803 16.2803C28.921 16.1397 29 15.9489 29 15.75C29 15.5511 28.921 15.3603 28.7803 15.2197C28.6397 15.079 28.4489 15 28.25 15ZM18.5 3C20.0913 3 21.6174 3.63214 22.7426 4.75736C23.8679 5.88258 24.5 7.4087 24.5 9C24.5 10.5913 23.8679 12.1174 22.7426 13.2426C21.6174 14.3679 20.0913 15 18.5 15C16.9087 15 15.3826 14.3679 14.2574 13.2426C13.1321 12.1174 12.5 10.5913 12.5 9C12.5 7.4087 13.1321 5.88258 14.2574 4.75736C15.3826 3.63214 16.9087 3 18.5 3ZM18.5 6C17.7044 6 16.9413 6.31607 16.3787 6.87868C15.8161 7.44129 15.5 8.20435 15.5 9C15.5 9.79565 15.8161 10.5587 16.3787 11.1213C16.9413 11.6839 17.7044 12 18.5 12C19.2956 12 20.0587 11.6839 20.6213 11.1213C21.1839 10.5587 21.5 9.79565 21.5 9C21.5 8.20435 21.1839 7.44129 20.6213 6.87868C20.0587 6.31607 19.2956 6 18.5 6Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Suivi d’accompagnement",
//     label: t("meeting.newMeeting.options.activityTypes.supportFollowup"),
//     svg: (
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//       >
//         <g clip-path="url(#clip0_1_441)">
//           <path
//             d="M8 20.25H29M18.5 20.25V36M10.25 16.5V9.75H8.492C7.49305 9.75001 6.5225 10.0824 5.73329 10.6948C4.94407 11.3072 4.38107 12.1648 4.133 13.1325L1.25 24.375V24.75H11.75V27C11.75 29.25 11.75 30.75 12.875 33C12.875 33 14 35.25 15.5 35.25M26.75 16.5V9.75H28.508C29.507 9.75001 30.4775 10.0824 31.2667 10.6948C32.0559 11.3072 32.6189 12.1648 32.867 13.1325L35.75 24.375V24.75H25.25V27C25.25 29.25 25.25 30.75 24.125 33C24.125 33 23 35.25 21.5 35.25M10.025 6.75C10.025 6.75 7.625 5.25 7.625 3.375C7.625 2.6796 7.90125 2.01269 8.39297 1.52097C8.88469 1.02925 9.5516 0.753 10.247 0.753C10.9424 0.753 11.6093 1.02925 12.101 1.52097C12.5928 2.01269 12.869 2.6796 12.869 3.375C12.869 5.25 10.475 6.75 10.475 6.75H10.025ZM26.975 6.75C26.975 6.75 29.375 5.25 29.375 3.375C29.375 2.67881 29.0984 2.01113 28.6062 1.51884C28.1139 1.02656 27.4462 0.75 26.75 0.75C25.301 0.75 24.131 1.926 24.131 3.375C24.131 5.25 26.525 6.75 26.525 6.75H26.975Z"
//             stroke="#DAE6ED"
//           />
//         </g>
//         <defs>
//           <clipPath id="clip0_1_441">
//             <rect
//               width="36"
//               height="36"
//               fill="white"
//               transform="translate(0.5)"
//             />
//           </clipPath>
//         </defs>
//       </svg>
//     ),
//   },
//   {
//     title: "Task",
//     label: t("meeting.newMeeting.options.activityTypes.task"),
//     svg: (
//       <svg
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M16.925 27L25.4 18.525L23.225 16.35L16.8875 22.6875L13.7375 19.5375L11.6 21.675L16.925 27ZM9.5 33C8.675 33 7.969 32.7065 7.382 32.1195C6.795 31.5325 6.501 30.826 6.5 30V6C6.5 5.175 6.794 4.469 7.382 3.882C7.97 3.295 8.676 3.001 9.5 3H21.5L30.5 12V30C30.5 30.825 30.2065 31.5315 29.6195 32.1195C29.0325 32.7075 28.326 33.001 27.5 33H9.5ZM20 13.5V6H9.5V30H27.5V13.5H20Z"
//           fill="#DAE6ED"
//         />
//       </svg>
//     ),
//   },
//   {
//     title: "Newsletter",
//     label: t("meeting.newMeeting.options.activityTypes.newsletter"),
//     svg: (
//       <svg
//         width="37"
//         height="36"
//         viewBox="0 0 37 36"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
//           stroke="#DAE6ED"
//           stroke-width="1.5"
//           stroke-linecap="round"
//           stroke-linejoin="round"
//         />
//       </svg>
//     ),
//   },
// ];

export const getOptions = (t, roleId) => {
  const options = [
    {
      title: "Atelier",
      label: t("meeting.newMeeting.options.activityTypes.businessPresentation"),
      svg: (
        <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
          <path
            d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },
    {
      title: "Sprint",
      label: t("meeting.newMeeting.options.activityTypes.sprint"),
      svg: (
        <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
          <path
            d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },
    {
      title: "Meeting",
      label: t("meeting.newMeeting.options.activityTypes.meeting"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              class="st0"
              d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
      C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
      C85.278,332.106,67.946,318.985,47.386,318.985z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
      c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
      C292.566,162.89,273.962,144.276,250.989,144.276z"
              fill="#DAE6ED"
            />
            <polygon
              class="st0"
              points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
      c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
      C510.937,339.664,490.119,318.985,464.613,318.985z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
      c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
      c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
              fill="#DAE6ED"
            />
          </g>
        </svg>
      ),
    },
    {
      title: "Absence",
      label: t("meeting.newMeeting.options.activityTypes.absence"),
      svg: (
        <svg
          fill="#DAE6ED"
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 52 52"
          enable-background="new 0 0 52 52"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <g>
              {" "}
              <path d="M25.7,22.4c-0.5,0.7-0.2,1.7,0.6,2.2c1.6,0.9,3.4,1.9,4.9,3.3c2.5-1.9,5.5-3,8.8-3.2 c-1.1-1.9-3.4-3.2-5.8-4.3c-2.3-1-2.8-1.9-2.8-3c0-1,0.7-1.9,1.4-2.8c1.4-1.3,2.1-3.1,2.1-5.3c0.1-4-2.2-7.5-6.4-7.5 c-2.5,0-4.2,1.3-5.4,3.1c2.9,2.2,4.6,6,4.6,10.3C27.6,18,26.9,20.4,25.7,22.4z"></path>{" "}
              <path d="M31.8,34.7l6,6l-6,6c-0.6,0.6-0.6,1.6,0,2.1l0.7,0.7c0.6,0.6,1.6,0.6,2.1,0l6-6l6,6c0.6,0.6,1.6,0.6,2.1,0 l0.7-0.7c0.6-0.6,0.6-1.6,0-2.1l-6-6l6-6c0.6-0.6,0.6-1.6,0-2.1l-0.7-0.7c-0.6-0.6-1.6-0.6-2.1,0l-6,6l-6-6c-0.6-0.6-1.6-0.6-2.1,0 l-0.7,0.7C31.3,33.1,31.3,34.1,31.8,34.7z"></path>{" "}
              <path d="M28.2,30.7c-1.4-1.4-3.5-2.3-5.6-3.3c-2.6-1.1-3-2.2-3-3.3c0-1.1,0.7-2.3,1.6-3.1c1.5-1.5,2.3-3.6,2.3-6 c0-4.5-2.6-8.4-7.2-8.4h-0.5c-4.6,0-7.2,3.9-7.2,8.4c0,2.4,0.8,4.5,2.3,6c0.9,0.8,1.6,1.9,1.6,3.1c0,1.1-0.3,2.2-3,3.3 c-3.8,1.7-7.3,3.4-7.5,7c0.2,2.5,1.9,4.4,4.1,4.4h18.6C25.2,35.7,26.4,32.9,28.2,30.7z"></path>{" "}
            </g>{" "}
          </g>
        </svg>
      ),
    },
    {
      title: "Special",
      label: t("meeting.newMeeting.options.activityTypes.special"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              class="st0"
              d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
      C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
      C85.278,332.106,67.946,318.985,47.386,318.985z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
      c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
      C292.566,162.89,273.962,144.276,250.989,144.276z"
              fill="#DAE6ED"
            />
            <polygon
              class="st0"
              points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
      c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
      C510.937,339.664,490.119,318.985,464.613,318.985z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
      c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
              fill="#DAE6ED"
            />
            <path
              class="st0"
              d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
      c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
              fill="#DAE6ED"
            />
          </g>
        </svg>
      ),
    },
    {
      title: "Calendly",
      label: t("meeting.newMeeting.options.activityTypes.calendly"),
      svg: <FaCalendarCheck size={36} color="#DAE6ED" />,
    },
    // {
    //   title: "Law",
    //   label: t("meeting.newMeeting.options.activityTypes.law"),
    //   svg: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       height="36"
    //       width="37"
    //       viewBox="0 0 48 48"
    //     >
    //       {/* <title>law-building</title> */}
    //       <g id="Layer_2" data-name="Layer 2">
    //         <g id="invisible_box" data-name="invisible box">
    //           <rect width="48" height="48" fill="none" />
    //         </g>
    //         <g id="Q3_icons" data-name="Q3 icons">
    //           <g>
    //             <rect x="5" y="36" width="38" height="4" fill="#DAE6ED" />
    //             <path
    //               d="M44,42H4a2,2,0,0,0-2,2v2H46V44A2,2,0,0,0,44,42Z"
    //               fill="#DAE6ED"
    //             />
    //             <rect x="10" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <rect x="22" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <rect x="34" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <path
    //               d="M44.9,11.4,24,2,3.1,11.4A2.1,2.1,0,0,0,2,13.2V14a2,2,0,0,0,2,2H44a2,2,0,0,0,2-2v-.8A2.1,2.1,0,0,0,44.9,11.4ZM11.6,12,24,6.4,36.4,12Z"
    //               fill="#DAE6ED"
    //             />
    //           </g>
    //         </g>
    //       </g>
    //     </svg>
    //   ),
    // },
    {
      title: "Other",
      label: t("meeting.newMeeting.options.activityTypes.other"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 5.25C12.4142 5.25 12.75 5.58579 12.75 6C12.75 6.41421 12.4142 6.75 12 6.75C11.5858 6.75 11.25 6.41421 11.25 6C11.25 5.58579 11.5858 5.25 12 5.25ZM12 11.25C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
            stroke-width="1.5"
            stroke="#DAE6ED"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },

    {
      title: "Formation",
      label: t("meeting.newMeeting.options.activityTypes.training"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 512 512"
          fill="none"
        >
          <g>
            <g>
              <g>
                <path
                  d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
          h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
          L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
          h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
          c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
          c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
          C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
          c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
          c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
          l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
          l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
          c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
          l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
                  fill="#DAE6ED"
                />
                <path
                  d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
          c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
          l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
          l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
          l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
          s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
                  fill="#DAE6ED"
                />
                <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
                <rect x="288" y="64" width="32" height="16" />
                <path
                  d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
                  fill="#DAE6ED"
                />
                <rect x="240" y="160" width="32" height="16" />
                <rect x="288" y="160" width="32" height="16" />
              </g>
            </g>
          </g>
        </svg>
      ),
    },

    {
      title: "Présentation",
      label: t("meeting.newMeeting.options.activityTypes.pitchPresentation"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 64 64"
          fill="none"
        >
          <g>
            <path
              d="M60,3.999H35v-1c0-1.657-1.343-3-3-3s-3,1.343-3,3v1H4c-2.211,0-4,1.789-4,4v38c0,2.211,1.789,4,4,4h19.888
      l-5.485,9.5c-0.829,1.435-0.338,3.27,1.098,4.098s3.27,0.337,4.098-1.098l7.217-12.5h2.37l7.217,12.5
      c0.829,1.436,2.663,1.927,4.099,1.098c1.436-0.828,1.926-2.662,1.098-4.098l-5.485-9.5H60c2.211,0,4-1.789,4-4v-38
      C64,5.788,62.211,3.999,60,3.999z M31,2.999c0-0.553,0.447-1,1-1s1,0.447,1,1v1h-2V2.999z M21.866,61.499
      c-0.276,0.479-0.888,0.643-1.366,0.365c-0.479-0.275-0.643-0.887-0.365-1.365l6.062-10.5h2.309L21.866,61.499z M43.865,60.499
      c0.277,0.479,0.113,1.09-0.365,1.366s-1.09,0.112-1.366-0.366l-6.64-11.5h2.309L43.865,60.499z M62,45.999c0,1.104-0.896,2-2,2H4
      c-1.104,0-2-0.896-2-2v-38c0-1.104,0.896-2,2-2h56c1.104,0,2,0.896,2,2V45.999z"
              fill="#DAE6ED"
            />
            <path
              d="M35,17.999h-6c-0.553,0-1,0.447-1,1v25h8v-25C36,18.446,35.553,17.999,35,17.999z M34,41.999h-4v-8h4
      V41.999z M34,31.999h-4v-12h4V31.999z"
              fill="#DAE6ED"
            />
            <path
              d="M47,9.999h-6c-0.553,0-1,0.447-1,1v33h8v-33C48,10.446,47.553,9.999,47,9.999z M46,41.999h-4v-10h4V41.999z
       M46,29.999h-4v-18h4V29.999z"
              fill="#DAE6ED"
            />
            <path
              d="M23,25.999h-6c-0.553,0-1,0.447-1,1v17h8v-17C24,26.446,23.553,25.999,23,25.999z M22,41.999h-4v-6h4
      V41.999z M22,33.999h-4v-6h4V33.999z"
              fill="#DAE6ED"
            />
          </g>
        </svg>
      ),
    },
    {
      title: "Evènement",
      label: t("meeting.newMeeting.options.activityTypes.event"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="40"
          viewBox="0 0 37 36"
          version="1.1"
          id="svg822"
        >
          <g id="layer1" transform="translate(0,-289.0625)">
            <path
              d="M 9 4 L 9 7 L 7 7 C 5.3552974 7 4 8.3553 4 10 L 4 24 C 4 25.6447 5.3552974 27 7 27 L 23 27 C 24.644703 27 26 25.6447 26 24 L 26 10 C 26 8.3553 24.644703 7 23 7 L 21 7 L 21 4 L 19 4 L 19 7 L 11 7 L 11 4 L 9 4 z M 7 9 L 23 9 C 23.571297 9 24 9.4287 24 10 L 24 24 C 24 24.5713 23.571297 25 23 25 L 7 25 C 6.4287028 25 6 24.5713 6 24 L 6 10 C 6 9.4287 6.4287028 9 7 9 z M 17 17 C 16.446 17 16 17.446 16 18 L 16 22 C 16 22.554 16.446 23 17 23 L 21 23 C 21.554 23 22 22.554 22 22 L 22 18 C 22 17.446 21.554 17 21 17 L 17 17 z "
              transform="translate(0,289.0625)"
              id="rect894"
              fill="#DAE6ED"
            />
            <g id="g825" transform="translate(0,1)" />
          </g>
        </svg>
      ),
    },
    {
      title: "Job Interview",
      label: t("meeting.newMeeting.options.activityTypes.jobInterview"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
        >
          <path
            d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
            stroke="#DAE6ED"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Customer Meeting",
      label: t("meeting.newMeeting.options.activityTypes.customerMeeting"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 70.243 70.243"
        >
          <path
            d="M9.43,36.414c0.016-0.548,0.065-2.215,1.317-2.688c1.236-0.465,2.449,0.744,2.679,0.99
    c0.377,0.404,0.356,1.037-0.047,1.414c-0.403,0.377-1.036,0.356-1.414-0.047c-0.127-0.134-0.305-0.276-0.45-0.367
    c-0.037,0.148-0.076,0.387-0.086,0.757c-0.075,2.573,1.916,3.392,2,3.425c0.354,0.14,0.606,0.471,0.638,0.85
    c0.592,7.06,6.152,9.344,8.752,9.344s8.161-2.284,8.753-9.344c0.032-0.385,0.284-0.718,0.646-0.853
    c0.076-0.03,2.067-0.849,1.992-3.422c-0.011-0.37-0.05-0.609-0.086-0.757c-0.146,0.092-0.324,0.234-0.453,0.37
    c-0.38,0.4-1.012,0.418-1.413,0.041s-0.422-1.007-0.046-1.409c0.231-0.247,1.445-1.458,2.679-0.99
    c1.252,0.473,1.301,2.14,1.317,2.688c0.089,3.024-1.729,4.495-2.702,5.063c-0.885,7.315-6.716,10.615-10.688,10.615
    s-9.803-3.299-10.688-10.615C11.159,40.909,9.341,39.438,9.43,36.414z M22.82,56.932c0.31,0,2.834-0.626,2.834-3.154H22.82h-2.834
    C19.985,56.306,22.51,56.932,22.82,56.932z M24.638,57.3c-0.26-0.046-0.53,0.008-0.75,0.157c-0.463,0.317-0.878,0.445-1.068,0.491
    c-0.196-0.047-0.609-0.176-1.071-0.491c-0.219-0.149-0.488-0.204-0.75-0.157c-0.261,0.049-0.491,0.2-0.641,0.419
    c-0.407,0.597-2.364,10.734-2.381,10.833c-0.097,0.544,0.266,1.063,0.81,1.159c0.549,0.099,1.063-0.266,1.159-0.81
    c0.333-1.878,1.382-6.906,1.896-9.163c0.474,0.172,0.809,0.214,0.868,0.221c0.071,0.008,0.145,0.008,0.216,0
    c0.059-0.006,0.394-0.048,0.868-0.221c0.514,2.257,1.563,7.285,1.897,9.163c0.086,0.485,0.507,0.825,0.983,0.825
    c0.058,0,0.117-0.005,0.176-0.016c0.544-0.096,0.906-0.615,0.81-1.159c-0.018-0.099-1.974-10.236-2.382-10.833
    C25.13,57.5,24.899,57.349,24.638,57.3z M10.427,65.574c-0.552,0-1,0.448-1,1v2.152c0,0.552,0.448,1,1,1s1-0.448,1-1v-2.152
    C11.427,66.022,10.979,65.574,10.427,65.574z M14.069,27.929c-0.914,1.101-1.503,2.479-1.706,3.989
    c-0.073,0.547,0.311,1.05,0.858,1.124c0.045,0.006,0.09,0.009,0.134,0.009c0.493,0,0.922-0.365,0.99-0.867
    c0.152-1.136,0.589-2.166,1.263-2.977c0.353-0.425,0.294-1.055-0.131-1.408C15.053,27.446,14.422,27.504,14.069,27.929z
     M30.72,33.043c0,0.552,0.448,1,1,1s1-0.448,1-1c0-5.747-4.284-7.322-6.563-7.353h-9.123c-0.552,0-1,0.448-1,1s0.448,1,1,1h9.104
    C26.608,27.701,30.72,27.945,30.72,33.043z M34.045,30.813c0.039,0,0.078-0.002,0.118-0.007c0.548-0.064,0.941-0.561,0.877-1.109
    c-0.67-5.728-5.59-7.192-8.113-7.128h-8.603c-0.552,0-1,0.448-1,1s0.448,1,1,1h8.615c0.223,0.009,5.489,0.012,6.115,5.361
    C33.113,30.438,33.545,30.813,34.045,30.813z M68.092,0H2.342c-0.552,0-1,0.448-1,1v52.144c0,0.552,0.448,1,1,1h6.077
    c-3.484,2.593-7.267,7.122-7.267,14.583c0,0.552,0.448,1,1,1s1-0.448,1-1c0-10.078,7.524-14.1,10.426-15.276l0.134,2.457
    c0.018,0.332,0.2,0.633,0.485,0.804c0.158,0.094,0.335,0.142,0.513,0.142c0.145,0,0.29-0.031,0.425-0.095l3.334-1.565
    c0.5-0.235,0.715-0.83,0.48-1.33c-0.235-0.501-0.832-0.714-1.33-0.48l-1.992,0.935l-0.215-3.938
    c-0.03-0.552-0.506-0.969-1.053-0.944c-0.551,0.03-0.974,0.501-0.944,1.053l0.048,0.874c-0.435,0.164-1.055,0.419-1.791,0.784
    c-0.006,0-0.012-0.004-0.018-0.004H3.342V2h63.75v50.144H49.522c3.191-6.788,2.519-14.94,2.482-15.359
    c-0.046-0.516-0.478-0.911-0.996-0.911h-4.917c-0.552,0-1,0.448-1,1c0,5.113-1.365,8.829-4.058,11.044
    c-3.127,2.572-7.286,2.47-8.971,2.3c-0.097-0.424-0.448-0.756-0.904-0.781c-0.548-0.029-1.023,0.392-1.053,0.944l-0.216,3.938
    l-1.83-0.859c-0.5-0.234-1.095-0.021-1.33,0.48c-0.235,0.5-0.02,1.095,0.48,1.33l3.172,1.489c0.135,0.063,0.28,0.095,0.425,0.095
    c0.178,0,0.355-0.047,0.513-0.142c0.285-0.17,0.467-0.472,0.485-0.804l0.202-3.68c2.07,0.198,6.656,0.22,10.283-2.754
    c2.999-2.458,4.606-6.358,4.785-11.6h2.984c0.096,2.892-0.024,11.973-4.876,17.271c-2.447,2.672-5.802,4.026-9.971,4.026
    c-0.552,0-1,0.448-1,1s0.448,1,1,1c4.756,0,8.609-1.575,11.451-4.681c0.668-0.731,1.252-1.52,1.768-2.346h4.91v15.099
    c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h2.5v15.099c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h8.25c0.552,0,1-0.448,1-1V1
    C69.092,0.448,68.644,0,68.092,0z M35.213,62.445c-0.552,0-1,0.448-1,1v5.281c0,0.552,0.448,1,1,1s1-0.448,1-1v-5.281
    C36.213,62.893,35.765,62.445,35.213,62.445z M31.104,8.207c0.552,0,1-0.448,1-1s-0.448-1-1-1H13.277c-0.552,0-1,0.448-1,1
    s0.448,1,1,1H31.104z M8.008,11.166c0,0.552,0.448,1,1,1h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008
    C8.456,10.166,8.008,10.614,8.008,11.166z M9.008,16.125h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
    S8.456,16.125,9.008,16.125z M9.008,20.084h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
    S8.456,20.084,9.008,20.084z M64.821,9.014c0.421-0.356,0.474-0.987,0.117-1.409c-0.356-0.421-0.987-0.475-1.409-0.117
    l-10.832,9.165l-5.668-5.946c-0.334-0.42-0.942-0.499-1.375-0.184l-6.798,5.71c-0.445,0.327-0.541,0.953-0.214,1.398
    c0.326,0.444,0.952,0.541,1.398,0.214l6.023-5.141l5.711,6c0.168,0.211,0.416,0.346,0.685,0.373
    c0.033,0.003,0.065,0.005,0.098,0.005c0.235,0,0.465-0.083,0.646-0.237L64.821,9.014z M47.42,19.128l-0.321,7.26
    c0.469-0.052,0.885-0.053,1.159-0.053c1.082,0,4.374,0,4.374,3.221v1.38c0,2.412-1.962,4.374-4.374,4.374s-4.374-1.962-4.374-4.374
    v-1.38c0-1.259,0.505-2.022,1.183-2.489l0.355-8.027c0.025-0.552,0.53-0.969,1.043-0.955C47.016,18.11,47.444,18.577,47.42,19.128z
     M48.258,28.335c-2.374,0-2.374,0.649-2.374,1.221v1.38c0,1.309,1.065,2.374,2.374,2.374s2.374-1.065,2.374-2.374v-1.38
    C50.632,28.984,50.632,28.335,48.258,28.335z M22.934,36.874v5.064h-1.228c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.228
    c0.552,0,1-0.448,1-1v-6.064c0-0.552-0.448-1-1-1S22.934,36.321,22.934,36.874z"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },

    {
      title: "Quiz",
      label: t("meeting.newMeeting.options.activityTypes.quiz"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.5 22.5C21.925 22.5 22.294 22.344 22.607 22.032C22.92 21.72 23.076 21.351 23.075 20.925C23.074 20.499 22.918 20.1305 22.607 19.8195C22.296 19.5085 21.927 19.352 21.5 19.35C21.073 19.348 20.7045 19.5045 20.3945 19.8195C20.0845 20.1345 19.928 20.503 19.925 20.925C19.922 21.347 20.0785 21.716 20.3945 22.032C20.7105 22.348 21.079 22.504 21.5 22.5ZM20.375 17.7H22.625C22.625 16.975 22.7 16.444 22.85 16.107C23 15.77 23.35 15.326 23.9 14.775C24.65 14.025 25.15 13.419 25.4 12.957C25.65 12.495 25.775 11.951 25.775 11.325C25.775 10.2 25.381 9.2815 24.593 8.5695C23.805 7.8575 22.774 7.501 21.5 7.5C20.475 7.5 19.5815 7.7875 18.8195 8.3625C18.0575 8.9375 17.526 9.7 17.225 10.65L19.25 11.475C19.475 10.85 19.7815 10.3815 20.1695 10.0695C20.5575 9.7575 21.001 9.601 21.5 9.6C22.1 9.6 22.5875 9.769 22.9625 10.107C23.3375 10.445 23.525 10.901 23.525 11.475C23.525 11.825 23.425 12.1565 23.225 12.4695C23.025 12.7825 22.675 13.176 22.175 13.65C21.35 14.375 20.844 14.944 20.657 15.357C20.47 15.77 20.376 16.551 20.375 17.7ZM12.5 27C11.675 27 10.969 26.7065 10.382 26.1195C9.795 25.5325 9.501 24.826 9.5 24V6C9.5 5.175 9.794 4.469 10.382 3.882C10.97 3.295 11.676 3.001 12.5 3H30.5C31.325 3 32.0315 3.294 32.6195 3.882C33.2075 4.47 33.501 5.176 33.5 6V24C33.5 24.825 33.2065 25.5315 32.6195 26.1195C32.0325 26.7075 31.326 27.001 30.5 27H12.5ZM12.5 24H30.5V6H12.5V24ZM6.5 33C5.675 33 4.969 32.7065 4.382 32.1195C3.795 31.5325 3.501 30.826 3.5 30V9H6.5V30H27.5V33H6.5Z"
            fill="#DAE6ED"
          />
        </svg>
      ),
      restricted: true, // Mark this as restricted to roleId 1
    },

    {
      title: "Suivi de projet",
      label: t("meeting.newMeeting.options.activityTypes.projectFollowup"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 1024 1024"
          fill="none"
        >
          <path
            d="M960 160H384V64a32 32 0 0 0-32-32H136.96A104.96 104.96 0 0 0 32 136.96v558.08A104.96 104.96 0 0 0 136.96 800h128a256 256 0 0 0 495.04 0h128A104.96 104.96 0 0 0 992 695.04V192a32 32 0 0 0-32-32zM512 928a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m416-608H576a32 32 0 0 0 0 64h352v311.04A40.96 40.96 0 0 1 887.04 736H768a256 256 0 0 0-512 0H136.96A40.96 40.96 0 0 1 96 695.04V136.96A40.96 40.96 0 0 1 136.96 96H320v96a32 32 0 0 0 32 32h576z"
            fill="#DAE6ED"
          />
          <path
            d="M288 352a32 32 0 0 0 32 32h128a32 32 0 0 0 0-64h-128a32 32 0 0 0-32 32zM209.6 325.44a17.6 17.6 0 0 0-5.44-2.88 19.84 19.84 0 0 0-6.08-2.56 27.84 27.84 0 0 0-12.48 0 20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84A32 32 0 0 0 160 352a32 32 0 0 0 9.28 22.72 36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 224 352a33.6 33.6 0 0 0-9.28-22.72zM608 704h-64v-96a32 32 0 0 0-64 0v128a32 32 0 0 0 32 32h96a32 32 0 0 0 0-64z"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },

    {
      title: "Task",
      label: t("meeting.newMeeting.options.activityTypes.task"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.925 27L25.4 18.525L23.225 16.35L16.8875 22.6875L13.7375 19.5375L11.6 21.675L16.925 27ZM9.5 33C8.675 33 7.969 32.7065 7.382 32.1195C6.795 31.5325 6.501 30.826 6.5 30V6C6.5 5.175 6.794 4.469 7.382 3.882C7.97 3.295 8.676 3.001 9.5 3H21.5L30.5 12V30C30.5 30.825 30.2065 31.5315 29.6195 32.1195C29.0325 32.7075 28.326 33.001 27.5 33H9.5ZM20 13.5V6H9.5V30H27.5V13.5H20Z"
            fill="#DAE6ED"
          />
        </svg>
      ),
    },
    {
      title: "Newsletter",
      label: t("meeting.newMeeting.options.activityTypes.newsletter"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
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
              stroke="#DAE6ED"
              stroke-linejoin="round"
              stroke-miterlimit="4.62"
              stroke-width="2"
              d="M5 16h5.5s1 3.5 5.5 3.5 5.5-3.5 5.5-3.5H27v8c0 1.5-1.5 3-3 3H8c-1.5 0-3-1.5-3-3v-8z"
            ></path>{" "}
            <path
              stroke="#DAE6ED"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M27 16l-1-3M5 19.5V16l1-3"
            ></path>{" "}
            <path
              stroke="#DAE6ED"
              stroke-linecap="round"
              stroke-width="2"
              d="M13.5 9h5M13.5 13h5"
            ></path>{" "}
            <path
              stroke="#DAE6ED"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.5 13V5h13v8"
            ></path>{" "}
          </g>
        </svg>
      ),
      restricted: true, // Mark this as restricted to roleId 1
    },
    {
      title: "Prestation Client",
      label: t("meeting.newMeeting.options.activityTypes.Prestation Client"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 512 512"
          fill="none"
        >
          <g>
            <g>
              <g>
                <path
                  d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
          h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
          L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
          h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
          c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
          c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
          C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
          c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
          c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
          l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
          l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
          c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
          l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
                  fill="#DAE6ED"
                />
                <path
                  d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
          c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
          l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
          l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
          l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
          s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
                  fill="#DAE6ED"
                />
                <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
                <rect x="288" y="64" width="32" height="16" />
                <path
                  d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
                  fill="#DAE6ED"
                />
                <rect x="240" y="160" width="32" height="16" />
                <rect x="288" y="160" width="32" height="16" />
              </g>
            </g>
          </g>
        </svg>
      ),
    },
  ];

  // If role is 3 or 4, show only specific types
  if ([3, 4].includes(roleId)) {
    return options.filter((option) =>
      ["Task", "Customer Meeting", "Meeting", "Absence"].includes(option.title)
    );
  }

  // Filter out "Prestation Client" for users who are not roleId 1
  if (roleId !== 1) {
    return options.filter((option) => option.title !== "Prestation Client");
  }

  // Filter out "Newsletter" and "Quiz" for user IDs 2, 3, 4, or 5
  if ([2, 3, 4, 5].includes(roleId)) {
    return options.filter(
      (option) => option.title !== "Newsletter" && option.title !== "Quiz"
    );
  }

  // Filter out "Special" for user IDs 3, 4, or 5
  if ([3, 4, 5].includes(roleId)) {
    return options.filter((option) => option.title !== "Special");
  }
  return options;
};

export const getDiscussionOptions = (t, roleId) => {
  const options = [
    {
      title: "Atelier",
      label: t("meeting.newMeeting.options.activityTypes.businessPresentation"),
      svg: (
        <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
          <path
            d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
            fill="#000"
          />
        </svg>
      ),
    },
    {
      title: "Sprint",
      label: t("meeting.newMeeting.options.activityTypes.sprint"),
      svg: (
        <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
          <path
            d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
            fill="#000"
          />
        </svg>
      ),
    },
    {
      title: "Meeting",
      label: t("meeting.newMeeting.options.activityTypes.meeting"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              class="st0"
              d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
      C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
              fill="#000"
            />
            <path
              class="st0"
              d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
      C85.278,332.106,67.946,318.985,47.386,318.985z"
              fill="#000"
            />
            <path
              class="st0"
              d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
              fill="#000"
            />
            <path
              class="st0"
              d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
      c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
              fill="#000"
            />
            <path
              class="st0"
              d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
              fill="#000"
            />
            <path
              class="st0"
              d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
      C292.566,162.89,273.962,144.276,250.989,144.276z"
              fill="#000"
            />
            <polygon
              class="st0"
              points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
              fill="#000"
            />
            <path
              class="st0"
              d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
      c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
              fill="#000"
            />
            <path
              class="st0"
              d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
      C510.937,339.664,490.119,318.985,464.613,318.985z"
              fill="#000"
            />
            <path
              class="st0"
              d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
      c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
              fill="#000"
            />
            <path
              class="st0"
              d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
      c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
              fill="#000"
            />
          </g>
        </svg>
      ),
    },
    {
      title: "Absence",
      label: t("meeting.newMeeting.options.activityTypes.absence"),
      svg: (
        <svg
          fill="#000"
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 52 52"
          enable-background="new 0 0 52 52"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <g>
              {" "}
              <path d="M25.7,22.4c-0.5,0.7-0.2,1.7,0.6,2.2c1.6,0.9,3.4,1.9,4.9,3.3c2.5-1.9,5.5-3,8.8-3.2 c-1.1-1.9-3.4-3.2-5.8-4.3c-2.3-1-2.8-1.9-2.8-3c0-1,0.7-1.9,1.4-2.8c1.4-1.3,2.1-3.1,2.1-5.3c0.1-4-2.2-7.5-6.4-7.5 c-2.5,0-4.2,1.3-5.4,3.1c2.9,2.2,4.6,6,4.6,10.3C27.6,18,26.9,20.4,25.7,22.4z"></path>{" "}
              <path d="M31.8,34.7l6,6l-6,6c-0.6,0.6-0.6,1.6,0,2.1l0.7,0.7c0.6,0.6,1.6,0.6,2.1,0l6-6l6,6c0.6,0.6,1.6,0.6,2.1,0 l0.7-0.7c0.6-0.6,0.6-1.6,0-2.1l-6-6l6-6c0.6-0.6,0.6-1.6,0-2.1l-0.7-0.7c-0.6-0.6-1.6-0.6-2.1,0l-6,6l-6-6c-0.6-0.6-1.6-0.6-2.1,0 l-0.7,0.7C31.3,33.1,31.3,34.1,31.8,34.7z"></path>{" "}
              <path d="M28.2,30.7c-1.4-1.4-3.5-2.3-5.6-3.3c-2.6-1.1-3-2.2-3-3.3c0-1.1,0.7-2.3,1.6-3.1c1.5-1.5,2.3-3.6,2.3-6 c0-4.5-2.6-8.4-7.2-8.4h-0.5c-4.6,0-7.2,3.9-7.2,8.4c0,2.4,0.8,4.5,2.3,6c0.9,0.8,1.6,1.9,1.6,3.1c0,1.1-0.3,2.2-3,3.3 c-3.8,1.7-7.3,3.4-7.5,7c0.2,2.5,1.9,4.4,4.1,4.4h18.6C25.2,35.7,26.4,32.9,28.2,30.7z"></path>{" "}
            </g>{" "}
          </g>
        </svg>
      ),
    },
    {
      title: "Special",
      label: t("meeting.newMeeting.options.activityTypes.special"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="36"
          width="37"
          viewBox="0 0 512 512"
        >
          <g>
            <path
              class="st0"
              d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
      C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
              fill="#000"
            />
            <path
              class="st0"
              d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
      C85.278,332.106,67.946,318.985,47.386,318.985z"
              fill="#000"
            />
            <path
              class="st0"
              d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
              fill="#000"
            />
            <path
              class="st0"
              d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
      c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
              fill="#000"
            />
            <path
              class="st0"
              d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
      c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
              fill="#000"
            />
            <path
              class="st0"
              d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
      C292.566,162.89,273.962,144.276,250.989,144.276z"
              fill="#000"
            />
            <polygon
              class="st0"
              points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
              fill="#000"
            />
            <path
              class="st0"
              d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
      c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
              fill="#000"
            />
            <path
              class="st0"
              d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
      C510.937,339.664,490.119,318.985,464.613,318.985z"
              fill="#000"
            />
            <path
              class="st0"
              d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
      c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
              fill="#000"
            />
            <path
              class="st0"
              d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
      c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
              fill="#000"
            />
          </g>
        </svg>
      ),
    },
    // {
    //   title: "Law",
    //   label: t("meeting.newMeeting.options.activityTypes.law"),
    //   svg: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       height="36"
    //       width="37"
    //       viewBox="0 0 48 48"
    //     >
    //       {/* <title>law-building</title> */}
    //       <g id="Layer_2" data-name="Layer 2">
    //         <g id="invisible_box" data-name="invisible box">
    //           <rect width="48" height="48" fill="none" />
    //         </g>
    //         <g id="Q3_icons" data-name="Q3 icons">
    //           <g>
    //             <rect x="5" y="36" width="38" height="4" fill="#DAE6ED" />
    //             <path
    //               d="M44,42H4a2,2,0,0,0-2,2v2H46V44A2,2,0,0,0,44,42Z"
    //               fill="#DAE6ED"
    //             />
    //             <rect x="10" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <rect x="22" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <rect x="34" y="18" width="4" height="16" fill="#DAE6ED" />
    //             <path
    //               d="M44.9,11.4,24,2,3.1,11.4A2.1,2.1,0,0,0,2,13.2V14a2,2,0,0,0,2,2H44a2,2,0,0,0,2-2v-.8A2.1,2.1,0,0,0,44.9,11.4ZM11.6,12,24,6.4,36.4,12Z"
    //               fill="#DAE6ED"
    //             />
    //           </g>
    //         </g>
    //       </g>
    //     </svg>
    //   ),
    // },
    {
      title: "Other",
      label: t("meeting.newMeeting.options.activityTypes.other"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 5.25C12.4142 5.25 12.75 5.58579 12.75 6C12.75 6.41421 12.4142 6.75 12 6.75C11.5858 6.75 11.25 6.41421 11.25 6C11.25 5.58579 11.5858 5.25 12 5.25ZM12 11.25C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
            stroke-width="1.5"
            stroke="#000"
            fill="#000"
          />
        </svg>
      ),
    },

    {
      title: "Formation",
      label: t("meeting.newMeeting.options.activityTypes.training"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 512 512"
          fill="none"
        >
          <g>
            <g>
              <g>
                <path
                  d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
          h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
          L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
          h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
          c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
          c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
          C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
          c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
          c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
          l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
          l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
          c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
          l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
                  fill="#000"
                />
                <path
                  d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
          c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
          l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
          l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
          l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
          s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
                  fill="#000"
                />
                <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
                <rect x="288" y="64" width="32" height="16" />
                <path
                  d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
                  fill="#000"
                />
                <rect x="240" y="160" width="32" height="16" />
                <rect x="288" y="160" width="32" height="16" />
              </g>
            </g>
          </g>
        </svg>
      ),
    },

    {
      title: "Présentation",
      label: t("meeting.newMeeting.options.activityTypes.pitchPresentation"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 64 64"
          fill="none"
        >
          <g>
            <path
              d="M60,3.999H35v-1c0-1.657-1.343-3-3-3s-3,1.343-3,3v1H4c-2.211,0-4,1.789-4,4v38c0,2.211,1.789,4,4,4h19.888
      l-5.485,9.5c-0.829,1.435-0.338,3.27,1.098,4.098s3.27,0.337,4.098-1.098l7.217-12.5h2.37l7.217,12.5
      c0.829,1.436,2.663,1.927,4.099,1.098c1.436-0.828,1.926-2.662,1.098-4.098l-5.485-9.5H60c2.211,0,4-1.789,4-4v-38
      C64,5.788,62.211,3.999,60,3.999z M31,2.999c0-0.553,0.447-1,1-1s1,0.447,1,1v1h-2V2.999z M21.866,61.499
      c-0.276,0.479-0.888,0.643-1.366,0.365c-0.479-0.275-0.643-0.887-0.365-1.365l6.062-10.5h2.309L21.866,61.499z M43.865,60.499
      c0.277,0.479,0.113,1.09-0.365,1.366s-1.09,0.112-1.366-0.366l-6.64-11.5h2.309L43.865,60.499z M62,45.999c0,1.104-0.896,2-2,2H4
      c-1.104,0-2-0.896-2-2v-38c0-1.104,0.896-2,2-2h56c1.104,0,2,0.896,2,2V45.999z"
              fill="#000"
            />
            <path
              d="M35,17.999h-6c-0.553,0-1,0.447-1,1v25h8v-25C36,18.446,35.553,17.999,35,17.999z M34,41.999h-4v-8h4
      V41.999z M34,31.999h-4v-12h4V31.999z"
              fill="#000"
            />
            <path
              d="M47,9.999h-6c-0.553,0-1,0.447-1,1v33h8v-33C48,10.446,47.553,9.999,47,9.999z M46,41.999h-4v-10h4V41.999z
       M46,29.999h-4v-18h4V29.999z"
              fill="#000"
            />
            <path
              d="M23,25.999h-6c-0.553,0-1,0.447-1,1v17h8v-17C24,26.446,23.553,25.999,23,25.999z M22,41.999h-4v-6h4
      V41.999z M22,33.999h-4v-6h4V33.999z"
              fill="#000"
            />
          </g>
        </svg>
      ),
    },
    {
      title: "Evènement",
      label: t("meeting.newMeeting.options.activityTypes.event"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="40"
          viewBox="0 0 37 36"
          version="1.1"
          id="svg822"
        >
          <g id="layer1" transform="translate(0,-289.0625)">
            <path
              d="M 9 4 L 9 7 L 7 7 C 5.3552974 7 4 8.3553 4 10 L 4 24 C 4 25.6447 5.3552974 27 7 27 L 23 27 C 24.644703 27 26 25.6447 26 24 L 26 10 C 26 8.3553 24.644703 7 23 7 L 21 7 L 21 4 L 19 4 L 19 7 L 11 7 L 11 4 L 9 4 z M 7 9 L 23 9 C 23.571297 9 24 9.4287 24 10 L 24 24 C 24 24.5713 23.571297 25 23 25 L 7 25 C 6.4287028 25 6 24.5713 6 24 L 6 10 C 6 9.4287 6.4287028 9 7 9 z M 17 17 C 16.446 17 16 17.446 16 18 L 16 22 C 16 22.554 16.446 23 17 23 L 21 23 C 21.554 23 22 22.554 22 22 L 22 18 C 22 17.446 21.554 17 21 17 L 17 17 z "
              transform="translate(0,289.0625)"
              id="rect894"
              fill="#000"
            />
            <g id="g825" transform="translate(0,1)" />
          </g>
        </svg>
      ),
    },
    {
      title: "Job Interview",
      label: t("meeting.newMeeting.options.activityTypes.jobInterview"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
        >
          <path
            d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
            stroke="#000"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Customer Meeting",
      label: t("meeting.newMeeting.options.activityTypes.customerMeeting"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 70.243 70.243"
        >
          <path
            d="M9.43,36.414c0.016-0.548,0.065-2.215,1.317-2.688c1.236-0.465,2.449,0.744,2.679,0.99
    c0.377,0.404,0.356,1.037-0.047,1.414c-0.403,0.377-1.036,0.356-1.414-0.047c-0.127-0.134-0.305-0.276-0.45-0.367
    c-0.037,0.148-0.076,0.387-0.086,0.757c-0.075,2.573,1.916,3.392,2,3.425c0.354,0.14,0.606,0.471,0.638,0.85
    c0.592,7.06,6.152,9.344,8.752,9.344s8.161-2.284,8.753-9.344c0.032-0.385,0.284-0.718,0.646-0.853
    c0.076-0.03,2.067-0.849,1.992-3.422c-0.011-0.37-0.05-0.609-0.086-0.757c-0.146,0.092-0.324,0.234-0.453,0.37
    c-0.38,0.4-1.012,0.418-1.413,0.041s-0.422-1.007-0.046-1.409c0.231-0.247,1.445-1.458,2.679-0.99
    c1.252,0.473,1.301,2.14,1.317,2.688c0.089,3.024-1.729,4.495-2.702,5.063c-0.885,7.315-6.716,10.615-10.688,10.615
    s-9.803-3.299-10.688-10.615C11.159,40.909,9.341,39.438,9.43,36.414z M22.82,56.932c0.31,0,2.834-0.626,2.834-3.154H22.82h-2.834
    C19.985,56.306,22.51,56.932,22.82,56.932z M24.638,57.3c-0.26-0.046-0.53,0.008-0.75,0.157c-0.463,0.317-0.878,0.445-1.068,0.491
    c-0.196-0.047-0.609-0.176-1.071-0.491c-0.219-0.149-0.488-0.204-0.75-0.157c-0.261,0.049-0.491,0.2-0.641,0.419
    c-0.407,0.597-2.364,10.734-2.381,10.833c-0.097,0.544,0.266,1.063,0.81,1.159c0.549,0.099,1.063-0.266,1.159-0.81
    c0.333-1.878,1.382-6.906,1.896-9.163c0.474,0.172,0.809,0.214,0.868,0.221c0.071,0.008,0.145,0.008,0.216,0
    c0.059-0.006,0.394-0.048,0.868-0.221c0.514,2.257,1.563,7.285,1.897,9.163c0.086,0.485,0.507,0.825,0.983,0.825
    c0.058,0,0.117-0.005,0.176-0.016c0.544-0.096,0.906-0.615,0.81-1.159c-0.018-0.099-1.974-10.236-2.382-10.833
    C25.13,57.5,24.899,57.349,24.638,57.3z M10.427,65.574c-0.552,0-1,0.448-1,1v2.152c0,0.552,0.448,1,1,1s1-0.448,1-1v-2.152
    C11.427,66.022,10.979,65.574,10.427,65.574z M14.069,27.929c-0.914,1.101-1.503,2.479-1.706,3.989
    c-0.073,0.547,0.311,1.05,0.858,1.124c0.045,0.006,0.09,0.009,0.134,0.009c0.493,0,0.922-0.365,0.99-0.867
    c0.152-1.136,0.589-2.166,1.263-2.977c0.353-0.425,0.294-1.055-0.131-1.408C15.053,27.446,14.422,27.504,14.069,27.929z
     M30.72,33.043c0,0.552,0.448,1,1,1s1-0.448,1-1c0-5.747-4.284-7.322-6.563-7.353h-9.123c-0.552,0-1,0.448-1,1s0.448,1,1,1h9.104
    C26.608,27.701,30.72,27.945,30.72,33.043z M34.045,30.813c0.039,0,0.078-0.002,0.118-0.007c0.548-0.064,0.941-0.561,0.877-1.109
    c-0.67-5.728-5.59-7.192-8.113-7.128h-8.603c-0.552,0-1,0.448-1,1s0.448,1,1,1h8.615c0.223,0.009,5.489,0.012,6.115,5.361
    C33.113,30.438,33.545,30.813,34.045,30.813z M68.092,0H2.342c-0.552,0-1,0.448-1,1v52.144c0,0.552,0.448,1,1,1h6.077
    c-3.484,2.593-7.267,7.122-7.267,14.583c0,0.552,0.448,1,1,1s1-0.448,1-1c0-10.078,7.524-14.1,10.426-15.276l0.134,2.457
    c0.018,0.332,0.2,0.633,0.485,0.804c0.158,0.094,0.335,0.142,0.513,0.142c0.145,0,0.29-0.031,0.425-0.095l3.334-1.565
    c0.5-0.235,0.715-0.83,0.48-1.33c-0.235-0.501-0.832-0.714-1.33-0.48l-1.992,0.935l-0.215-3.938
    c-0.03-0.552-0.506-0.969-1.053-0.944c-0.551,0.03-0.974,0.501-0.944,1.053l0.048,0.874c-0.435,0.164-1.055,0.419-1.791,0.784
    c-0.006,0-0.012-0.004-0.018-0.004H3.342V2h63.75v50.144H49.522c3.191-6.788,2.519-14.94,2.482-15.359
    c-0.046-0.516-0.478-0.911-0.996-0.911h-4.917c-0.552,0-1,0.448-1,1c0,5.113-1.365,8.829-4.058,11.044
    c-3.127,2.572-7.286,2.47-8.971,2.3c-0.097-0.424-0.448-0.756-0.904-0.781c-0.548-0.029-1.023,0.392-1.053,0.944l-0.216,3.938
    l-1.83-0.859c-0.5-0.234-1.095-0.021-1.33,0.48c-0.235,0.5-0.02,1.095,0.48,1.33l3.172,1.489c0.135,0.063,0.28,0.095,0.425,0.095
    c0.178,0,0.355-0.047,0.513-0.142c0.285-0.17,0.467-0.472,0.485-0.804l0.202-3.68c2.07,0.198,6.656,0.22,10.283-2.754
    c2.999-2.458,4.606-6.358,4.785-11.6h2.984c0.096,2.892-0.024,11.973-4.876,17.271c-2.447,2.672-5.802,4.026-9.971,4.026
    c-0.552,0-1,0.448-1,1s0.448,1,1,1c4.756,0,8.609-1.575,11.451-4.681c0.668-0.731,1.252-1.52,1.768-2.346h4.91v15.099
    c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h2.5v15.099c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h8.25c0.552,0,1-0.448,1-1V1
    C69.092,0.448,68.644,0,68.092,0z M35.213,62.445c-0.552,0-1,0.448-1,1v5.281c0,0.552,0.448,1,1,1s1-0.448,1-1v-5.281
    C36.213,62.893,35.765,62.445,35.213,62.445z M31.104,8.207c0.552,0,1-0.448,1-1s-0.448-1-1-1H13.277c-0.552,0-1,0.448-1,1
    s0.448,1,1,1H31.104z M8.008,11.166c0,0.552,0.448,1,1,1h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008
    C8.456,10.166,8.008,10.614,8.008,11.166z M9.008,16.125h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
    S8.456,16.125,9.008,16.125z M9.008,20.084h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
    S8.456,20.084,9.008,20.084z M64.821,9.014c0.421-0.356,0.474-0.987,0.117-1.409c-0.356-0.421-0.987-0.475-1.409-0.117
    l-10.832,9.165l-5.668-5.946c-0.334-0.42-0.942-0.499-1.375-0.184l-6.798,5.71c-0.445,0.327-0.541,0.953-0.214,1.398
    c0.326,0.444,0.952,0.541,1.398,0.214l6.023-5.141l5.711,6c0.168,0.211,0.416,0.346,0.685,0.373
    c0.033,0.003,0.065,0.005,0.098,0.005c0.235,0,0.465-0.083,0.646-0.237L64.821,9.014z M47.42,19.128l-0.321,7.26
    c0.469-0.052,0.885-0.053,1.159-0.053c1.082,0,4.374,0,4.374,3.221v1.38c0,2.412-1.962,4.374-4.374,4.374s-4.374-1.962-4.374-4.374
    v-1.38c0-1.259,0.505-2.022,1.183-2.489l0.355-8.027c0.025-0.552,0.53-0.969,1.043-0.955C47.016,18.11,47.444,18.577,47.42,19.128z
     M48.258,28.335c-2.374,0-2.374,0.649-2.374,1.221v1.38c0,1.309,1.065,2.374,2.374,2.374s2.374-1.065,2.374-2.374v-1.38
    C50.632,28.984,50.632,28.335,48.258,28.335z M22.934,36.874v5.064h-1.228c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.228
    c0.552,0,1-0.448,1-1v-6.064c0-0.552-0.448-1-1-1S22.934,36.321,22.934,36.874z"
            fill="#000"
          />
        </svg>
      ),
    },

    {
      title: "Quiz",
      label: t("meeting.newMeeting.options.activityTypes.quiz"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.5 22.5C21.925 22.5 22.294 22.344 22.607 22.032C22.92 21.72 23.076 21.351 23.075 20.925C23.074 20.499 22.918 20.1305 22.607 19.8195C22.296 19.5085 21.927 19.352 21.5 19.35C21.073 19.348 20.7045 19.5045 20.3945 19.8195C20.0845 20.1345 19.928 20.503 19.925 20.925C19.922 21.347 20.0785 21.716 20.3945 22.032C20.7105 22.348 21.079 22.504 21.5 22.5ZM20.375 17.7H22.625C22.625 16.975 22.7 16.444 22.85 16.107C23 15.77 23.35 15.326 23.9 14.775C24.65 14.025 25.15 13.419 25.4 12.957C25.65 12.495 25.775 11.951 25.775 11.325C25.775 10.2 25.381 9.2815 24.593 8.5695C23.805 7.8575 22.774 7.501 21.5 7.5C20.475 7.5 19.5815 7.7875 18.8195 8.3625C18.0575 8.9375 17.526 9.7 17.225 10.65L19.25 11.475C19.475 10.85 19.7815 10.3815 20.1695 10.0695C20.5575 9.7575 21.001 9.601 21.5 9.6C22.1 9.6 22.5875 9.769 22.9625 10.107C23.3375 10.445 23.525 10.901 23.525 11.475C23.525 11.825 23.425 12.1565 23.225 12.4695C23.025 12.7825 22.675 13.176 22.175 13.65C21.35 14.375 20.844 14.944 20.657 15.357C20.47 15.77 20.376 16.551 20.375 17.7ZM12.5 27C11.675 27 10.969 26.7065 10.382 26.1195C9.795 25.5325 9.501 24.826 9.5 24V6C9.5 5.175 9.794 4.469 10.382 3.882C10.97 3.295 11.676 3.001 12.5 3H30.5C31.325 3 32.0315 3.294 32.6195 3.882C33.2075 4.47 33.501 5.176 33.5 6V24C33.5 24.825 33.2065 25.5315 32.6195 26.1195C32.0325 26.7075 31.326 27.001 30.5 27H12.5ZM12.5 24H30.5V6H12.5V24ZM6.5 33C5.675 33 4.969 32.7065 4.382 32.1195C3.795 31.5325 3.501 30.826 3.5 30V9H6.5V30H27.5V33H6.5Z"
            fill="#000"
          />
        </svg>
      ),
      restricted: true, // Mark this as restricted to roleId 1
    },

    {
      title: "Suivi de projet",
      label: t("meeting.newMeeting.options.activityTypes.projectFollowup"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 1024 1024"
          fill="none"
        >
          <path
            d="M960 160H384V64a32 32 0 0 0-32-32H136.96A104.96 104.96 0 0 0 32 136.96v558.08A104.96 104.96 0 0 0 136.96 800h128a256 256 0 0 0 495.04 0h128A104.96 104.96 0 0 0 992 695.04V192a32 32 0 0 0-32-32zM512 928a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m416-608H576a32 32 0 0 0 0 64h352v311.04A40.96 40.96 0 0 1 887.04 736H768a256 256 0 0 0-512 0H136.96A40.96 40.96 0 0 1 96 695.04V136.96A40.96 40.96 0 0 1 136.96 96H320v96a32 32 0 0 0 32 32h576z"
            fill="#000"
          />
          <path
            d="M288 352a32 32 0 0 0 32 32h128a32 32 0 0 0 0-64h-128a32 32 0 0 0-32 32zM209.6 325.44a17.6 17.6 0 0 0-5.44-2.88 19.84 19.84 0 0 0-6.08-2.56 27.84 27.84 0 0 0-12.48 0 20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84A32 32 0 0 0 160 352a32 32 0 0 0 9.28 22.72 36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 224 352a33.6 33.6 0 0 0-9.28-22.72zM608 704h-64v-96a32 32 0 0 0-64 0v128a32 32 0 0 0 32 32h96a32 32 0 0 0 0-64z"
            fill="#000"
          />
        </svg>
      ),
    },

    {
      title: "Task",
      label: t("meeting.newMeeting.options.activityTypes.task"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 37 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.925 27L25.4 18.525L23.225 16.35L16.8875 22.6875L13.7375 19.5375L11.6 21.675L16.925 27ZM9.5 33C8.675 33 7.969 32.7065 7.382 32.1195C6.795 31.5325 6.501 30.826 6.5 30V6C6.5 5.175 6.794 4.469 7.382 3.882C7.97 3.295 8.676 3.001 9.5 3H21.5L30.5 12V30C30.5 30.825 30.2065 31.5315 29.6195 32.1195C29.0325 32.7075 28.326 33.001 27.5 33H9.5ZM20 13.5V6H9.5V30H27.5V13.5H20Z"
            fill="#000"
          />
        </svg>
      ),
    },
    {
      title: "Newsletter",
      label: t("meeting.newMeeting.options.activityTypes.newsletter"),
      svg: (
        <svg
          width="37"
          height="36"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
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
              stroke="#000"
              stroke-linejoin="round"
              stroke-miterlimit="4.62"
              stroke-width="2"
              d="M5 16h5.5s1 3.5 5.5 3.5 5.5-3.5 5.5-3.5H27v8c0 1.5-1.5 3-3 3H8c-1.5 0-3-1.5-3-3v-8z"
            ></path>{" "}
            <path
              stroke="#000"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M27 16l-1-3M5 19.5V16l1-3"
            ></path>{" "}
            <path
              stroke="#000"
              stroke-linecap="round"
              stroke-width="2"
              d="M13.5 9h5M13.5 13h5"
            ></path>{" "}
            <path
              stroke="#000"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.5 13V5h13v8"
            ></path>{" "}
          </g>
        </svg>
      ),
      restricted: true, // Mark this as restricted to roleId 1
    },
    {
      title: "Prestation Client",
      label: t("meeting.newMeeting.options.activityTypes.Prestation Client"),
      svg: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="36"
          viewBox="0 0 512 512"
          fill="none"
        >
          <g>
            <g>
              <g>
                <path
                  d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
          h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
          L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
          h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
          c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
          c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
          C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
          c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
          c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
          l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
          l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
          c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
          l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
                  fill="#000"
                />
                <path
                  d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
          c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
          l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
          l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
          l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
          s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
                  fill="#000"
                />
                <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
                <rect x="288" y="64" width="32" height="16" />
                <path
                  d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
                  fill="#000"
                />
                <rect x="240" y="160" width="32" height="16" />
                <rect x="288" y="160" width="32" height="16" />
              </g>
            </g>
          </g>
        </svg>
      ),
    },
  ];

  // If role is 3 or 4, show only specific types
  if ([3, 4].includes(roleId)) {
    return options.filter((option) =>
      ["Task", "Customer Meeting", "Meeting", "Absence"].includes(option.title)
    );
  }

  // Filter out "Prestation Client" for users who are not roleId 1
  if (roleId !== 1) {
    return options.filter((option) => option.title !== "Prestation Client");
  }

  // Filter out "Newsletter" and "Quiz" for user IDs 2, 3, 4, or 5
  if ([2, 3, 4, 5].includes(roleId)) {
    return options.filter(
      (option) => option.title !== "Newsletter" && option.title !== "Quiz"
    );
  }

  // Filter out "Special" for user IDs 3, 4, or 5
  if ([3, 4, 5].includes(roleId)) {
    return options.filter((option) => option.title !== "Special");
  }
  return options;
};

export const openGoogleMeet = (link) => {
  window.open(link, "_blank");
};

export const localizeEstimateTime = (timeString) => {
  if (!timeString) {
    return null;
  }
  // Split the time string into its components (e.g., "8 mins - 16 secs")
  const timeParts = timeString?.split(" - ");

  // Flags for identifying what units are present in the time string
  const hasDays = timeParts.some((part) => part.includes("days"));
  const hasHours = timeParts.some((part) => part.includes("hours"));
  const hasMinutes = timeParts.some((part) => part.includes("mins"));
  const hasSeconds = timeParts.some((part) => part.includes("secs"));

  // Case 1: Days, hours, and minutes -> don't show seconds
  if (hasDays || hasHours || hasMinutes) {
    return timeParts.filter((part) => !part.includes("secs")).join(" - ");
  }

  // Case 2 & 3: Hours or minutes only -> don't show seconds
  if (hasHours || hasMinutes) {
    return timeParts.filter((part) => !part.includes("secs")).join(" - ");
  }

  // Case 4: Only seconds -> show seconds
  if (hasSeconds && !hasDays && !hasHours && !hasMinutes) {
    return timeString;
  }

  // Return the time string as is (default case)
  return timeString;
};

export const DocumentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M13.729 4.50664L15.4932 6.27081M14.8632 2.95248L10.0907 7.72498C9.84408 7.97123 9.6759 8.28496 9.60734 8.62664L9.1665 10.8333L11.3732 10.3916C11.7148 10.3233 12.0282 10.1558 12.2748 9.90915L17.0473 5.13664C17.1908 4.99323 17.3045 4.82297 17.3821 4.63559C17.4597 4.44821 17.4997 4.24738 17.4997 4.04456C17.4997 3.84174 17.4597 3.64091 17.3821 3.45353C17.3045 3.26615 17.1908 3.09589 17.0473 2.95248C16.9039 2.80906 16.7337 2.6953 16.5463 2.61769C16.3589 2.54007 16.1581 2.50012 15.9553 2.50012C15.7524 2.50012 15.5516 2.54007 15.3642 2.61769C15.1768 2.6953 15.0066 2.80906 14.8632 2.95248Z"
      stroke="#4C4C4C"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M15.8333 12.5V15C15.8333 15.442 15.6577 15.8659 15.3451 16.1785C15.0325 16.491 14.6086 16.6666 14.1666 16.6666H4.99992C4.55789 16.6666 4.13397 16.491 3.82141 16.1785C3.50885 15.8659 3.33325 15.442 3.33325 15V5.83329C3.33325 5.39127 3.50885 4.96734 3.82141 4.65478C4.13397 4.34222 4.55789 4.16663 4.99992 4.16663H7.49992"
      stroke="#4C4C4C"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
export const ExpandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M12 6L8 10L4 6"
      stroke="#4C4C4C"
      stroke-width="1.33333"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const FileFolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M17.3438 11.875C17.3438 11.9993 17.2944 12.1185 17.2065 12.2065C17.1185 12.2944 16.9993 12.3438 16.875 12.3438H14.8438V13.9062H16.25C16.3743 13.9062 16.4935 13.9556 16.5815 14.0435C16.6694 14.1315 16.7188 14.2507 16.7188 14.375C16.7188 14.4993 16.6694 14.6185 16.5815 14.7065C16.4935 14.7944 16.3743 14.8438 16.25 14.8438H14.8438V16.25C14.8438 16.3743 14.7944 16.4935 14.7065 16.5815C14.6185 16.6694 14.4993 16.7188 14.375 16.7188C14.2507 16.7188 14.1315 16.6694 14.0435 16.5815C13.9556 16.4935 13.9062 16.3743 13.9062 16.25V11.875C13.9062 11.7507 13.9556 11.6315 14.0435 11.5435C14.1315 11.4556 14.2507 11.4062 14.375 11.4062H16.875C16.9993 11.4062 17.1185 11.4556 17.2065 11.5435C17.2944 11.6315 17.3438 11.7507 17.3438 11.875ZM7.03125 13.4375C7.03125 13.9762 6.81724 14.4929 6.43631 14.8738C6.05538 15.2547 5.53872 15.4688 5 15.4688H4.21875V16.25C4.21875 16.3743 4.16936 16.4935 4.08146 16.5815C3.99355 16.6694 3.87432 16.7188 3.75 16.7188C3.62568 16.7188 3.50645 16.6694 3.41854 16.5815C3.33064 16.4935 3.28125 16.3743 3.28125 16.25V11.875C3.28125 11.7507 3.33064 11.6315 3.41854 11.5435C3.50645 11.4556 3.62568 11.4062 3.75 11.4062H5C5.53872 11.4062 6.05538 11.6203 6.43631 12.0012C6.81724 12.3821 7.03125 12.8988 7.03125 13.4375ZM6.09375 13.4375C6.09375 13.1474 5.97852 12.8692 5.7734 12.6641C5.56828 12.459 5.29008 12.3438 5 12.3438H4.21875V14.5312H5C5.29008 14.5312 5.56828 14.416 5.7734 14.2109C5.97852 14.0058 6.09375 13.7276 6.09375 13.4375ZM12.6562 14.0625C12.6562 14.767 12.3764 15.4426 11.8783 15.9408C11.3801 16.4389 10.7045 16.7188 10 16.7188H8.75C8.62568 16.7188 8.50645 16.6694 8.41854 16.5815C8.33064 16.4935 8.28125 16.3743 8.28125 16.25V11.875C8.28125 11.7507 8.33064 11.6315 8.41854 11.5435C8.50645 11.4556 8.62568 11.4062 8.75 11.4062H10C10.7045 11.4062 11.3801 11.6861 11.8783 12.1842C12.3764 12.6824 12.6562 13.358 12.6562 14.0625ZM11.7188 14.0625C11.7188 13.6067 11.5377 13.1695 11.2153 12.8472C10.893 12.5248 10.4558 12.3438 10 12.3438H9.21875V15.7812H10C10.4558 15.7812 10.893 15.6002 11.2153 15.2778C11.5377 14.9555 11.7188 14.5183 11.7188 14.0625ZM3.28125 8.75V3.125C3.28125 2.83492 3.39648 2.55672 3.6016 2.3516C3.80672 2.14648 4.08492 2.03125 4.375 2.03125H11.875C11.9367 2.0312 11.9977 2.04332 12.0547 2.06692C12.1117 2.09051 12.1635 2.12512 12.207 2.16875L16.582 6.54375C16.6697 6.6317 16.7188 6.75083 16.7188 6.875V8.75C16.7188 8.87432 16.6694 8.99355 16.5815 9.08146C16.4935 9.16936 16.3743 9.21875 16.25 9.21875C16.1257 9.21875 16.0065 9.16936 15.9185 9.08146C15.8306 8.99355 15.7812 8.87432 15.7812 8.75V7.34375H11.875C11.7507 7.34375 11.6315 7.29436 11.5435 7.20646C11.4556 7.11855 11.4062 6.99932 11.4062 6.875V2.96875H4.375C4.33356 2.96875 4.29382 2.98521 4.26451 3.01451C4.23521 3.04382 4.21875 3.08356 4.21875 3.125V8.75C4.21875 8.87432 4.16936 8.99355 4.08146 9.08146C3.99355 9.16936 3.87432 9.21875 3.75 9.21875C3.62568 9.21875 3.50645 9.16936 3.41854 9.08146C3.33064 8.99355 3.28125 8.87432 3.28125 8.75ZM12.3438 6.40625H15.1188L12.3438 3.63125V6.40625Z"
      fill="#4C4C4C"
    />
  </svg>
);

export const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M7.7 12.515V12.5151C7.6999 12.7058 7.75172 12.8929 7.8499 13.0563C7.94808 13.2197 8.0889 13.3534 8.25727 13.4428C8.42564 13.5323 8.61519 13.5743 8.80558 13.5642C8.99594 13.5541 9.17995 13.4924 9.33789 13.3856L7.7 12.515ZM7.7 12.515V7.485V7.4849C7.6999 7.29424 7.75172 7.10714 7.8499 6.9437C7.94808 6.78025 8.0889 6.64663 8.25727 6.55716C8.42564 6.46768 8.61519 6.42574 8.80558 6.43584C8.99598 6.44593 9.18004 6.50768 9.338 6.61445L13.0554 9.1306C13.0554 9.13061 13.0554 9.13062 13.0554 9.13063C13.1974 9.22683 13.3137 9.35637 13.3941 9.50791C13.4745 9.65948 13.5166 9.82843 13.5166 10C13.5166 10.1716 13.4745 10.3405 13.3941 10.4921C13.3137 10.6436 13.1974 10.7732 13.0554 10.8694C13.0554 10.8694 13.0554 10.8694 13.0554 10.8694L9.338 13.3856L7.7 12.515ZM16.25 2.925H3.75C3.5312 2.925 3.32135 3.01192 3.16664 3.16664C3.01192 3.32135 2.925 3.5312 2.925 3.75V16.25C2.925 16.4688 3.01192 16.6786 3.16664 16.8334C3.32135 16.9881 3.5312 17.075 3.75 17.075H16.25C16.4688 17.075 16.6786 16.9881 16.8334 16.8334C16.9881 16.6786 17.075 16.4688 17.075 16.25V3.75C17.075 3.5312 16.9881 3.32135 16.8334 3.16664C16.6786 3.01192 16.4688 2.925 16.25 2.925ZM1.45 3.75C1.45 3.14 1.69232 2.55499 2.12365 2.12365C2.55499 1.69232 3.14 1.45 3.75 1.45H16.25C16.86 1.45 17.445 1.69232 17.8763 2.12365C18.3077 2.55499 18.55 3.14 18.55 3.75V16.25C18.55 16.86 18.3077 17.445 17.8763 17.8763C17.445 18.3077 16.86 18.55 16.25 18.55H3.75C3.14 18.55 2.55499 18.3077 2.12365 17.8763C1.69232 17.445 1.45 16.86 1.45 16.25V3.75Z"
      fill="#4C4C4C"
      stroke="white"
      stroke-width="0.4"
    />
  </svg>
);

export const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M11.6667 7.5C11.6667 7.16848 11.7984 6.85054 12.0329 6.61612C12.2673 6.3817 12.5852 6.25 12.9167 6.25C13.2483 6.25 13.5662 6.3817 13.8006 6.61612C14.0351 6.85054 14.1667 7.16848 14.1667 7.5C14.1667 7.83152 14.0351 8.14946 13.8006 8.38388C13.5662 8.6183 13.2483 8.75 12.9167 8.75C12.5852 8.75 12.2673 8.6183 12.0329 8.38388C11.7984 8.14946 11.6667 7.83152 11.6667 7.5Z"
      fill="#4C4C4C"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.05658 3.88166C8.6808 3.65354 11.3199 3.65354 13.9441 3.88166L15.2024 3.99166C15.7874 4.04259 16.3383 4.28895 16.7662 4.69106C17.1942 5.09317 17.4743 5.62761 17.5616 6.20833C17.9395 8.72198 17.9395 11.278 17.5616 13.7917C17.4743 14.3724 17.1942 14.9068 16.7662 15.3089C16.3383 15.711 15.7874 15.9574 15.2024 16.0083L13.9441 16.1175C11.3191 16.3458 8.68075 16.3458 6.05658 16.1175L4.79825 16.0083C4.21308 15.9576 3.66205 15.7113 3.23392 15.3092C2.8058 14.907 2.52552 14.3725 2.43825 13.7917C2.0603 11.278 2.0603 8.72198 2.43825 6.20833C2.52549 5.62761 2.80564 5.09317 3.2336 4.69106C3.66156 4.28895 4.2124 4.04259 4.79741 3.99166L6.05658 3.88166ZM13.8357 5.12749C11.2833 4.9056 8.71649 4.9056 6.16408 5.12749L4.90575 5.23666C4.60055 5.26336 4.3132 5.39196 4.08995 5.60176C3.86669 5.81156 3.72051 6.09037 3.67491 6.39333C3.46065 7.81888 3.37391 9.2607 3.41575 10.7017L6.64158 7.47499C6.70179 7.41489 6.77364 7.3677 6.85272 7.33633C6.9318 7.30497 7.01646 7.29008 7.10149 7.29257C7.18653 7.29507 7.27017 7.3149 7.34728 7.35085C7.42438 7.38681 7.49334 7.43812 7.54991 7.50166L10.6099 10.9433L12.7182 10.24C12.8338 10.2013 12.9582 10.1973 13.0761 10.2283C13.1939 10.2594 13.3001 10.3243 13.3816 10.415L16.3141 13.6733C16.6843 11.2611 16.6882 8.80676 16.3257 6.39333C16.2801 6.09024 16.1338 5.81134 15.9104 5.60152C15.687 5.3917 15.3994 5.26318 15.0941 5.23666L13.8357 5.12749ZM15.5166 14.6567L12.7257 11.5558L10.6141 12.2592C10.498 12.2979 10.3732 12.3017 10.2549 12.2702C10.1367 12.2386 10.0304 12.1731 9.94908 12.0817L7.05658 8.82749L3.51991 12.3633C3.56075 12.7783 3.61158 13.1933 3.67408 13.6058C3.71954 13.9091 3.86577 14.1882 4.08921 14.3981C4.31265 14.6081 4.60028 14.7368 4.90575 14.7633L6.16408 14.8725C8.71658 15.0942 11.2832 15.0942 13.8357 14.8725L15.0941 14.7633C15.2424 14.75 15.3857 14.7133 15.5166 14.6567Z"
      fill="#4C4C4C"
    />
  </svg>
);

export const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M15.8984 5H7.22656C5.99687 5 5 5.99687 5 7.22656V15.8984C5 17.1281 5.99687 18.125 7.22656 18.125H15.8984C17.1281 18.125 18.125 17.1281 18.125 15.8984V7.22656C18.125 5.99687 17.1281 5 15.8984 5Z"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M14.9805 5L15 4.0625C14.9984 3.48285 14.7674 2.9274 14.3575 2.51753C13.9476 2.10765 13.3922 1.87665 12.8125 1.875H4.375C3.71256 1.87696 3.07781 2.14098 2.6094 2.6094C2.14098 3.07781 1.87696 3.71256 1.875 4.375V12.8125C1.87665 13.3922 2.10765 13.9476 2.51753 14.3575C2.9274 14.7674 3.48285 14.9984 4.0625 15H5"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const typeIcons = {
  Atelier: (
    <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
      <path
        d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
        fill="#000000"
      />
    </svg>
  ),
  Meeting: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          class="st0"
          d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
    C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
    C85.278,332.106,67.946,318.985,47.386,318.985z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
    c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
    C292.566,162.89,273.962,144.276,250.989,144.276z"
          fill="#000000"
        />
        <polygon
          class="st0"
          points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
          fill="#000000"
        />
        <path
          class="st0"
          d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
    c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
    C510.937,339.664,490.119,318.985,464.613,318.985z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
    c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
    c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
          fill="#000000"
        />
      </g>
    </svg>
  ),
  Special: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          class="st0"
          d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
    C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
    C85.278,332.106,67.946,318.985,47.386,318.985z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
    c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
    C292.566,162.89,273.962,144.276,250.989,144.276z"
          fill="#000000"
        />
        <polygon
          class="st0"
          points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
          fill="#000000"
        />
        <path
          class="st0"
          d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
    c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
    C510.937,339.664,490.119,318.985,464.613,318.985z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
    c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
          fill="#000000"
        />
        <path
          class="st0"
          d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
    c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
          fill="#000000"
        />
      </g>
    </svg>
  ),
  Law: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 48 48"
    >
      {/* <title>law-building</title> */}
      <g id="Layer_2" data-name="Layer 2">
        <g id="invisible_box" data-name="invisible box">
          <rect width="48" height="48" fill="none" />
        </g>
        <g id="Q3_icons" data-name="Q3 icons">
          <g>
            <rect x="5" y="36" width="38" height="4" fill="#000000" />
            <path
              d="M44,42H4a2,2,0,0,0-2,2v2H46V44A2,2,0,0,0,44,42Z"
              fill="#000000"
            />
            <rect x="10" y="18" width="4" height="16" fill="#000000" />
            <rect x="22" y="18" width="4" height="16" fill="#000000" />
            <rect x="34" y="18" width="4" height="16" fill="#000000" />
            <path
              d="M44.9,11.4,24,2,3.1,11.4A2.1,2.1,0,0,0,2,13.2V14a2,2,0,0,0,2,2H44a2,2,0,0,0,2-2v-.8A2.1,2.1,0,0,0,44.9,11.4ZM11.6,12,24,6.4,36.4,12Z"
              fill="#000000"
            />
          </g>
        </g>
      </g>
    </svg>
  ),
  Other: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 5.25C12.4142 5.25 12.75 5.58579 12.75 6C12.75 6.41421 12.4142 6.75 12 6.75C11.5858 6.75 11.25 6.41421 11.25 6C11.25 5.58579 11.5858 5.25 12 5.25ZM12 11.25C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
        stroke-width="1.5"
        stroke="#000000"
        fill="#000000"
      />
    </svg>
  ),
  Formation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 512 512"
      fill="none"
    >
      <g>
        <g>
          <g>
            <path
              d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
        h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
        L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
        h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
        c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
        c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
        C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
        c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
        c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
        l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
        l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
        c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
        l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
              fill="#000000"
            />
            <path
              d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
        c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
        l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
        l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
        l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
        s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
              fill="#000000"
            />
            <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
            <rect x="288" y="64" width="32" height="16" />
            <path
              d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
              fill="#000000"
            />
            <rect x="240" y="160" width="32" height="16" />
            <rect x="288" y="160" width="32" height="16" />
          </g>
        </g>
      </g>
    </svg>
  ),
  Présentation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 64 64"
      fill="none"
    >
      <g>
        <path
          d="M60,3.999H35v-1c0-1.657-1.343-3-3-3s-3,1.343-3,3v1H4c-2.211,0-4,1.789-4,4v38c0,2.211,1.789,4,4,4h19.888
l-5.485,9.5c-0.829,1.435-0.338,3.27,1.098,4.098s3.27,0.337,4.098-1.098l7.217-12.5h2.37l7.217,12.5
c0.829,1.436,2.663,1.927,4.099,1.098c1.436-0.828,1.926-2.662,1.098-4.098l-5.485-9.5H60c2.211,0,4-1.789,4-4v-38
C64,5.788,62.211,3.999,60,3.999z M31,2.999c0-0.553,0.447-1,1-1s1,0.447,1,1v1h-2V2.999z M21.866,61.499
c-0.276,0.479-0.888,0.643-1.366,0.365c-0.479-0.275-0.643-0.887-0.365-1.365l6.062-10.5h2.309L21.866,61.499z M43.865,60.499
c0.277,0.479,0.113,1.09-0.365,1.366s-1.09,0.112-1.366-0.366l-6.64-11.5h2.309L43.865,60.499z M62,45.999c0,1.104-0.896,2-2,2H4
c-1.104,0-2-0.896-2-2v-38c0-1.104,0.896-2,2-2h56c1.104,0,2,0.896,2,2V45.999z"
          fill="#000000"
        />
        <path
          d="M35,17.999h-6c-0.553,0-1,0.447-1,1v25h8v-25C36,18.446,35.553,17.999,35,17.999z M34,41.999h-4v-8h4
V41.999z M34,31.999h-4v-12h4V31.999z"
          fill="#000000"
        />
        <path
          d="M47,9.999h-6c-0.553,0-1,0.447-1,1v33h8v-33C48,10.446,47.553,9.999,47,9.999z M46,41.999h-4v-10h4V41.999z
 M46,29.999h-4v-18h4V29.999z"
          fill="#000000"
        />
        <path
          d="M23,25.999h-6c-0.553,0-1,0.447-1,1v17h8v-17C24,26.446,23.553,25.999,23,25.999z M22,41.999h-4v-6h4
V41.999z M22,33.999h-4v-6h4V33.999z"
          fill="#000000"
        />
      </g>
    </svg>
  ),
  Evènement: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="40"
      viewBox="0 0 37 36"
      version="1.1"
      id="svg822"
    >
      <g id="layer1" transform="translate(0,-289.0625)">
        <path
          d="M 9 4 L 9 7 L 7 7 C 5.3552974 7 4 8.3553 4 10 L 4 24 C 4 25.6447 5.3552974 27 7 27 L 23 27 C 24.644703 27 26 25.6447 26 24 L 26 10 C 26 8.3553 24.644703 7 23 7 L 21 7 L 21 4 L 19 4 L 19 7 L 11 7 L 11 4 L 9 4 z M 7 9 L 23 9 C 23.571297 9 24 9.4287 24 10 L 24 24 C 24 24.5713 23.571297 25 23 25 L 7 25 C 6.4287028 25 6 24.5713 6 24 L 6 10 C 6 9.4287 6.4287028 9 7 9 z M 17 17 C 16.446 17 16 17.446 16 18 L 16 22 C 16 22.554 16.446 23 17 23 L 21 23 C 21.554 23 22 22.554 22 22 L 22 18 C 22 17.446 21.554 17 21 17 L 17 17 z "
          transform="translate(0,289.0625)"
          id="rect894"
          fill="#000000"
        />
        <g id="g825" transform="translate(0,1)" />
      </g>
    </svg>
  ),
  "Job Interview": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
    >
      <path
        d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
        stroke="#000000"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  "Customer Meeting": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 70.243 70.243"
    >
      <path
        d="M9.43,36.414c0.016-0.548,0.065-2.215,1.317-2.688c1.236-0.465,2.449,0.744,2.679,0.99
c0.377,0.404,0.356,1.037-0.047,1.414c-0.403,0.377-1.036,0.356-1.414-0.047c-0.127-0.134-0.305-0.276-0.45-0.367
c-0.037,0.148-0.076,0.387-0.086,0.757c-0.075,2.573,1.916,3.392,2,3.425c0.354,0.14,0.606,0.471,0.638,0.85
c0.592,7.06,6.152,9.344,8.752,9.344s8.161-2.284,8.753-9.344c0.032-0.385,0.284-0.718,0.646-0.853
c0.076-0.03,2.067-0.849,1.992-3.422c-0.011-0.37-0.05-0.609-0.086-0.757c-0.146,0.092-0.324,0.234-0.453,0.37
c-0.38,0.4-1.012,0.418-1.413,0.041s-0.422-1.007-0.046-1.409c0.231-0.247,1.445-1.458,2.679-0.99
c1.252,0.473,1.301,2.14,1.317,2.688c0.089,3.024-1.729,4.495-2.702,5.063c-0.885,7.315-6.716,10.615-10.688,10.615
s-9.803-3.299-10.688-10.615C11.159,40.909,9.341,39.438,9.43,36.414z M22.82,56.932c0.31,0,2.834-0.626,2.834-3.154H22.82h-2.834
C19.985,56.306,22.51,56.932,22.82,56.932z M24.638,57.3c-0.26-0.046-0.53,0.008-0.75,0.157c-0.463,0.317-0.878,0.445-1.068,0.491
c-0.196-0.047-0.609-0.176-1.071-0.491c-0.219-0.149-0.488-0.204-0.75-0.157c-0.261,0.049-0.491,0.2-0.641,0.419
c-0.407,0.597-2.364,10.734-2.381,10.833c-0.097,0.544,0.266,1.063,0.81,1.159c0.549,0.099,1.063-0.266,1.159-0.81
c0.333-1.878,1.382-6.906,1.896-9.163c0.474,0.172,0.809,0.214,0.868,0.221c0.071,0.008,0.145,0.008,0.216,0
c0.059-0.006,0.394-0.048,0.868-0.221c0.514,2.257,1.563,7.285,1.897,9.163c0.086,0.485,0.507,0.825,0.983,0.825
c0.058,0,0.117-0.005,0.176-0.016c0.544-0.096,0.906-0.615,0.81-1.159c-0.018-0.099-1.974-10.236-2.382-10.833
C25.13,57.5,24.899,57.349,24.638,57.3z M10.427,65.574c-0.552,0-1,0.448-1,1v2.152c0,0.552,0.448,1,1,1s1-0.448,1-1v-2.152
C11.427,66.022,10.979,65.574,10.427,65.574z M14.069,27.929c-0.914,1.101-1.503,2.479-1.706,3.989
c-0.073,0.547,0.311,1.05,0.858,1.124c0.045,0.006,0.09,0.009,0.134,0.009c0.493,0,0.922-0.365,0.99-0.867
c0.152-1.136,0.589-2.166,1.263-2.977c0.353-0.425,0.294-1.055-0.131-1.408C15.053,27.446,14.422,27.504,14.069,27.929z
M30.72,33.043c0,0.552,0.448,1,1,1s1-0.448,1-1c0-5.747-4.284-7.322-6.563-7.353h-9.123c-0.552,0-1,0.448-1,1s0.448,1,1,1h9.104
C26.608,27.701,30.72,27.945,30.72,33.043z M34.045,30.813c0.039,0,0.078-0.002,0.118-0.007c0.548-0.064,0.941-0.561,0.877-1.109
c-0.67-5.728-5.59-7.192-8.113-7.128h-8.603c-0.552,0-1,0.448-1,1s0.448,1,1,1h8.615c0.223,0.009,5.489,0.012,6.115,5.361
C33.113,30.438,33.545,30.813,34.045,30.813z M68.092,0H2.342c-0.552,0-1,0.448-1,1v52.144c0,0.552,0.448,1,1,1h6.077
c-3.484,2.593-7.267,7.122-7.267,14.583c0,0.552,0.448,1,1,1s1-0.448,1-1c0-10.078,7.524-14.1,10.426-15.276l0.134,2.457
c0.018,0.332,0.2,0.633,0.485,0.804c0.158,0.094,0.335,0.142,0.513,0.142c0.145,0,0.29-0.031,0.425-0.095l3.334-1.565
c0.5-0.235,0.715-0.83,0.48-1.33c-0.235-0.501-0.832-0.714-1.33-0.48l-1.992,0.935l-0.215-3.938
c-0.03-0.552-0.506-0.969-1.053-0.944c-0.551,0.03-0.974,0.501-0.944,1.053l0.048,0.874c-0.435,0.164-1.055,0.419-1.791,0.784
c-0.006,0-0.012-0.004-0.018-0.004H3.342V2h63.75v50.144H49.522c3.191-6.788,2.519-14.94,2.482-15.359
c-0.046-0.516-0.478-0.911-0.996-0.911h-4.917c-0.552,0-1,0.448-1,1c0,5.113-1.365,8.829-4.058,11.044
c-3.127,2.572-7.286,2.47-8.971,2.3c-0.097-0.424-0.448-0.756-0.904-0.781c-0.548-0.029-1.023,0.392-1.053,0.944l-0.216,3.938
l-1.83-0.859c-0.5-0.234-1.095-0.021-1.33,0.48c-0.235,0.5-0.02,1.095,0.48,1.33l3.172,1.489c0.135,0.063,0.28,0.095,0.425,0.095
c0.178,0,0.355-0.047,0.513-0.142c0.285-0.17,0.467-0.472,0.485-0.804l0.202-3.68c2.07,0.198,6.656,0.22,10.283-2.754
c2.999-2.458,4.606-6.358,4.785-11.6h2.984c0.096,2.892-0.024,11.973-4.876,17.271c-2.447,2.672-5.802,4.026-9.971,4.026
c-0.552,0-1,0.448-1,1s0.448,1,1,1c4.756,0,8.609-1.575,11.451-4.681c0.668-0.731,1.252-1.52,1.768-2.346h4.91v15.099
c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h2.5v15.099c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h8.25c0.552,0,1-0.448,1-1V1
C69.092,0.448,68.644,0,68.092,0z M35.213,62.445c-0.552,0-1,0.448-1,1v5.281c0,0.552,0.448,1,1,1s1-0.448,1-1v-5.281
C36.213,62.893,35.765,62.445,35.213,62.445z M31.104,8.207c0.552,0,1-0.448,1-1s-0.448-1-1-1H13.277c-0.552,0-1,0.448-1,1
s0.448,1,1,1H31.104z M8.008,11.166c0,0.552,0.448,1,1,1h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008
C8.456,10.166,8.008,10.614,8.008,11.166z M9.008,16.125h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
S8.456,16.125,9.008,16.125z M9.008,20.084h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
S8.456,20.084,9.008,20.084z M64.821,9.014c0.421-0.356,0.474-0.987,0.117-1.409c-0.356-0.421-0.987-0.475-1.409-0.117
l-10.832,9.165l-5.668-5.946c-0.334-0.42-0.942-0.499-1.375-0.184l-6.798,5.71c-0.445,0.327-0.541,0.953-0.214,1.398
c0.326,0.444,0.952,0.541,1.398,0.214l6.023-5.141l5.711,6c0.168,0.211,0.416,0.346,0.685,0.373
c0.033,0.003,0.065,0.005,0.098,0.005c0.235,0,0.465-0.083,0.646-0.237L64.821,9.014z M47.42,19.128l-0.321,7.26
c0.469-0.052,0.885-0.053,1.159-0.053c1.082,0,4.374,0,4.374,3.221v1.38c0,2.412-1.962,4.374-4.374,4.374s-4.374-1.962-4.374-4.374
v-1.38c0-1.259,0.505-2.022,1.183-2.489l0.355-8.027c0.025-0.552,0.53-0.969,1.043-0.955C47.016,18.11,47.444,18.577,47.42,19.128z
M48.258,28.335c-2.374,0-2.374,0.649-2.374,1.221v1.38c0,1.309,1.065,2.374,2.374,2.374s2.374-1.065,2.374-2.374v-1.38
C50.632,28.984,50.632,28.335,48.258,28.335z M22.934,36.874v5.064h-1.228c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.228
c0.552,0,1-0.448,1-1v-6.064c0-0.552-0.448-1-1-1S22.934,36.321,22.934,36.874z"
        fill="#000000"
      />
    </svg>
  ),
  Quiz: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.5 22.5C21.925 22.5 22.294 22.344 22.607 22.032C22.92 21.72 23.076 21.351 23.075 20.925C23.074 20.499 22.918 20.1305 22.607 19.8195C22.296 19.5085 21.927 19.352 21.5 19.35C21.073 19.348 20.7045 19.5045 20.3945 19.8195C20.0845 20.1345 19.928 20.503 19.925 20.925C19.922 21.347 20.0785 21.716 20.3945 22.032C20.7105 22.348 21.079 22.504 21.5 22.5ZM20.375 17.7H22.625C22.625 16.975 22.7 16.444 22.85 16.107C23 15.77 23.35 15.326 23.9 14.775C24.65 14.025 25.15 13.419 25.4 12.957C25.65 12.495 25.775 11.951 25.775 11.325C25.775 10.2 25.381 9.2815 24.593 8.5695C23.805 7.8575 22.774 7.501 21.5 7.5C20.475 7.5 19.5815 7.7875 18.8195 8.3625C18.0575 8.9375 17.526 9.7 17.225 10.65L19.25 11.475C19.475 10.85 19.7815 10.3815 20.1695 10.0695C20.5575 9.7575 21.001 9.601 21.5 9.6C22.1 9.6 22.5875 9.769 22.9625 10.107C23.3375 10.445 23.525 10.901 23.525 11.475C23.525 11.825 23.425 12.1565 23.225 12.4695C23.025 12.7825 22.675 13.176 22.175 13.65C21.35 14.375 20.844 14.944 20.657 15.357C20.47 15.77 20.376 16.551 20.375 17.7ZM12.5 27C11.675 27 10.969 26.7065 10.382 26.1195C9.795 25.5325 9.501 24.826 9.5 24V6C9.5 5.175 9.794 4.469 10.382 3.882C10.97 3.295 11.676 3.001 12.5 3H30.5C31.325 3 32.0315 3.294 32.6195 3.882C33.2075 4.47 33.501 5.176 33.5 6V24C33.5 24.825 33.2065 25.5315 32.6195 26.1195C32.0325 26.7075 31.326 27.001 30.5 27H12.5ZM12.5 24H30.5V6H12.5V24ZM6.5 33C5.675 33 4.969 32.7065 4.382 32.1195C3.795 31.5325 3.501 30.826 3.5 30V9H6.5V30H27.5V33H6.5Z"
        fill="#000000"
      />
    </svg>
  ),

  "Suivi de projet": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 1024 1024"
      fill="none"
    >
      <path
        d="M960 160H384V64a32 32 0 0 0-32-32H136.96A104.96 104.96 0 0 0 32 136.96v558.08A104.96 104.96 0 0 0 136.96 800h128a256 256 0 0 0 495.04 0h128A104.96 104.96 0 0 0 992 695.04V192a32 32 0 0 0-32-32zM512 928a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m416-608H576a32 32 0 0 0 0 64h352v311.04A40.96 40.96 0 0 1 887.04 736H768a256 256 0 0 0-512 0H136.96A40.96 40.96 0 0 1 96 695.04V136.96A40.96 40.96 0 0 1 136.96 96H320v96a32 32 0 0 0 32 32h576z"
        fill="#000000"
      />
      <path
        d="M288 352a32 32 0 0 0 32 32h128a32 32 0 0 0 0-64h-128a32 32 0 0 0-32 32zM209.6 325.44a17.6 17.6 0 0 0-5.44-2.88 19.84 19.84 0 0 0-6.08-2.56 27.84 27.84 0 0 0-12.48 0 20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84A32 32 0 0 0 160 352a32 32 0 0 0 9.28 22.72 36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 224 352a33.6 33.6 0 0 0-9.28-22.72zM608 704h-64v-96a32 32 0 0 0-64 0v128a32 32 0 0 0 32 32h96a32 32 0 0 0 0-64z"
        fill="#000000"
      />
    </svg>
  ),

  Task: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.925 27L25.4 18.525L23.225 16.35L16.8875 22.6875L13.7375 19.5375L11.6 21.675L16.925 27ZM9.5 33C8.675 33 7.969 32.7065 7.382 32.1195C6.795 31.5325 6.501 30.826 6.5 30V6C6.5 5.175 6.794 4.469 7.382 3.882C7.97 3.295 8.676 3.001 9.5 3H21.5L30.5 12V30C30.5 30.825 30.2065 31.5315 29.6195 32.1195C29.0325 32.7075 28.326 33.001 27.5 33H9.5ZM20 13.5V6H9.5V30H27.5V13.5H20Z"
        fill="#000000"
      />
    </svg>
  ),
  Newsletter: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
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
          stroke="#000000"
          stroke-linejoin="round"
          stroke-miterlimit="4.62"
          stroke-width="2"
          d="M5 16h5.5s1 3.5 5.5 3.5 5.5-3.5 5.5-3.5H27v8c0 1.5-1.5 3-3 3H8c-1.5 0-3-1.5-3-3v-8z"
        ></path>{" "}
        <path
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M27 16l-1-3M5 19.5V16l1-3"
        ></path>{" "}
        <path
          stroke="#000000"
          stroke-linecap="round"
          stroke-width="2"
          d="M13.5 9h5M13.5 13h5"
        ></path>{" "}
        <path
          stroke="#000000"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.5 13V5h13v8"
        ></path>{" "}
      </g>
    </svg>
  ),
};
export const solutionTypeIcons = {
  Atelier: (
    <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
      <path
        d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
        fill="#DAE6ED"
      />
    </svg>
  ),
  Sprint: (
    <svg fill="#000000" width="37" height="36" viewBox="0 0 256 256">
      <path
        d="M2,69c0,13.678,9.625,25.302,22,29.576V233H2v18h252v-18h-22V98.554c12.89-3.945,21.699-15.396,22-29.554v-8H2V69z M65.29,68.346c0,6.477,6.755,31.47,31.727,31.47c21.689,0,31.202-19.615,31.202-31.47c0,11.052,7.41,31.447,31.464,31.447 c21.733,0,31.363-20.999,31.363-31.447c0,14.425,9.726,26.416,22.954,30.154V233H42V98.594C55.402,94.966,65.29,82.895,65.29,68.346 z M254,54H2l32-32V2h189v20h-0.168L254,54z M167.877,202.446c0.13,1.168,0,2.551-0.303,3.849l-11.027-10.162l-9.946,10.854 l11.157,10.119c-1.297,0.432-2.551,0.735-3.849,0.735c-3.849,0.13-7.135-1.038-9.946-3.589c-2.811-2.681-4.324-5.795-4.454-9.643 c0-1.341,0.13-2.854,0.432-4.151l-2.681-2.551l-16.043-14.66L94.06,213.17c-1.643,2.205-4.195,3.719-7.135,3.719 c-4.757,0-8.605-3.849-8.605-8.605c0-2.551,0.995-4.887,2.941-6.53l28.195-29.233L92.417,156.91 c-1.341,0.605-2.854,0.908-4.151,0.908c-3.849,0.13-7.135-1.038-9.946-3.589s-4.324-5.665-4.454-9.514 c-0.13-1.168,0-2.551,0.303-3.849l11.157,10.119l9.86-10.811l-11.157-10.119c1.168-0.432,2.551-0.735,3.849-0.735 c3.849-0.13,7.135,1.038,9.946,3.589c2.811,2.508,4.324,5.795,4.454,9.643c0.13,1.297,0,2.551-0.303,3.849l17.557,16.087 l12.843-13.881l-19.2-16.908l17.427-19.849l49.341,43.417l-17.427,19.849l-19.719-17.384l-12.411,14.66l19.287,17.643 c1.297-0.432,2.551-0.735,3.849-0.735c3.849-0.13,7.135,1.038,9.946,3.589C166.277,195.397,167.79,198.511,167.877,202.446z"
        fill="#DAE6ED"
      />
    </svg>
  ),
  Absence: (
    <svg fill="#DAE6ED" xmlns="http://www.w3.org/2000/svg" height="36"
      width="37" viewBox="0 0 52 52" enable-background="new 0 0 52 52"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M25.7,22.4c-0.5,0.7-0.2,1.7,0.6,2.2c1.6,0.9,3.4,1.9,4.9,3.3c2.5-1.9,5.5-3,8.8-3.2 c-1.1-1.9-3.4-3.2-5.8-4.3c-2.3-1-2.8-1.9-2.8-3c0-1,0.7-1.9,1.4-2.8c1.4-1.3,2.1-3.1,2.1-5.3c0.1-4-2.2-7.5-6.4-7.5 c-2.5,0-4.2,1.3-5.4,3.1c2.9,2.2,4.6,6,4.6,10.3C27.6,18,26.9,20.4,25.7,22.4z"></path> <path d="M31.8,34.7l6,6l-6,6c-0.6,0.6-0.6,1.6,0,2.1l0.7,0.7c0.6,0.6,1.6,0.6,2.1,0l6-6l6,6c0.6,0.6,1.6,0.6,2.1,0 l0.7-0.7c0.6-0.6,0.6-1.6,0-2.1l-6-6l6-6c0.6-0.6,0.6-1.6,0-2.1l-0.7-0.7c-0.6-0.6-1.6-0.6-2.1,0l-6,6l-6-6c-0.6-0.6-1.6-0.6-2.1,0 l-0.7,0.7C31.3,33.1,31.3,34.1,31.8,34.7z"></path> <path d="M28.2,30.7c-1.4-1.4-3.5-2.3-5.6-3.3c-2.6-1.1-3-2.2-3-3.3c0-1.1,0.7-2.3,1.6-3.1c1.5-1.5,2.3-3.6,2.3-6 c0-4.5-2.6-8.4-7.2-8.4h-0.5c-4.6,0-7.2,3.9-7.2,8.4c0,2.4,0.8,4.5,2.3,6c0.9,0.8,1.6,1.9,1.6,3.1c0,1.1-0.3,2.2-3,3.3 c-3.8,1.7-7.3,3.4-7.5,7c0.2,2.5,1.9,4.4,4.1,4.4h18.6C25.2,35.7,26.4,32.9,28.2,30.7z"></path> </g> </g></svg>
  ),
  Meeting: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          class="st0"
          d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
    C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
    C85.278,332.106,67.946,318.985,47.386,318.985z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
    c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
    C292.566,162.89,273.962,144.276,250.989,144.276z"
          fill="#DAE6ED"
        />
        <polygon
          class="st0"
          points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
    c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
    C510.937,339.664,490.119,318.985,464.613,318.985z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
    c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
    c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
          fill="#DAE6ED"
        />
      </g>
    </svg>
  ),
  Special: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          class="st0"
          d="M47.436,302.806c26.222,0,47.417-21.236,47.417-47.436c0-26.192-21.195-47.437-47.417-47.437
    C21.236,207.932,0,229.178,0,255.37C0,281.57,21.236,302.806,47.436,302.806z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M47.386,318.985c-25.506,0-46.324,20.679-46.324,46.314v57.588h54.876l35.408-72.328
    C85.278,332.106,67.946,318.985,47.386,318.985z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M125.037,212.114c23.48,0,42.481-19.01,42.481-42.5c0-23.45-19.001-42.49-42.481-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C82.547,193.104,101.568,212.114,125.037,212.114z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M83.431,310.563v9.158h23.023l42.113-85.825c-6.684-4.708-14.739-7.3-23.53-7.3
    c-5.94,0-11.64,1.231-16.715,3.466c3.218,7.806,5.075,16.338,5.075,25.267C113.397,278.492,101.508,298.793,83.431,310.563z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M250.989,129.825c23.48,0,42.49-19.01,42.49-42.5c0-23.45-19.01-42.49-42.49-42.49
    c-23.47,0-42.49,19.04-42.49,42.49C208.499,110.815,227.519,129.825,250.989,129.825z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M250.989,144.276c-22.944,0-41.577,18.614-41.577,41.587v18.026h83.153v-18.026
    C292.566,162.89,273.962,144.276,250.989,144.276z"
          fill="#DAE6ED"
        />
        <polygon
          class="st0"
          points="176.149,219.871 66.437,443.745 66.437,467.166 445.563,467.166 445.563,443.745 335.851,219.871 	"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M464.563,302.806c26.202,0,47.437-21.236,47.437-47.436c0-26.192-21.235-47.437-47.437-47.437
    c-26.221,0-47.417,21.246-47.417,47.437C417.146,281.57,438.342,302.806,464.563,302.806z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M464.613,318.985c-20.56,0-37.892,13.121-43.961,31.575l35.409,72.328h54.876v-57.588
    C510.937,339.664,490.119,318.985,464.613,318.985z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M386.962,212.114c23.471,0,42.491-19.01,42.491-42.5c0-23.45-19.02-42.49-42.491-42.49
    c-23.48,0-42.48,19.04-42.48,42.49C344.482,193.104,363.482,212.114,386.962,212.114z"
          fill="#DAE6ED"
        />
        <path
          class="st0"
          d="M386.962,226.596c-8.789,0-16.844,2.592-23.529,7.3l42.113,85.825h23.024v-9.158
    c-18.078-11.77-29.966-32.071-29.966-55.234c0-8.929,1.857-17.461,5.075-25.267C398.603,227.826,392.902,226.596,386.962,226.596z"
          fill="#DAE6ED"
        />
      </g>
    </svg>
  ),
  Law: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="36"
      width="37"
      viewBox="0 0 48 48"
    >
      {/* <title>law-building</title> */}
      <g id="Layer_2" data-name="Layer 2">
        <g id="invisible_box" data-name="invisible box">
          <rect width="48" height="48" fill="none" />
        </g>
        <g id="Q3_icons" data-name="Q3 icons">
          <g>
            <rect x="5" y="36" width="38" height="4" fill="#DAE6ED" />
            <path
              d="M44,42H4a2,2,0,0,0-2,2v2H46V44A2,2,0,0,0,44,42Z"
              fill="#DAE6ED"
            />
            <rect x="10" y="18" width="4" height="16" fill="#DAE6ED" />
            <rect x="22" y="18" width="4" height="16" fill="#DAE6ED" />
            <rect x="34" y="18" width="4" height="16" fill="#DAE6ED" />
            <path
              d="M44.9,11.4,24,2,3.1,11.4A2.1,2.1,0,0,0,2,13.2V14a2,2,0,0,0,2,2H44a2,2,0,0,0,2-2v-.8A2.1,2.1,0,0,0,44.9,11.4ZM11.6,12,24,6.4,36.4,12Z"
              fill="#DAE6ED"
            />
          </g>
        </g>
      </g>
    </svg>
  ),
  Other: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 5.25C12.4142 5.25 12.75 5.58579 12.75 6C12.75 6.41421 12.4142 6.75 12 6.75C11.5858 6.75 11.25 6.41421 11.25 6C11.25 5.58579 11.5858 5.25 12 5.25ZM12 11.25C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12C11.25 11.5858 11.5858 11.25 12 11.25ZM12 17.25C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75C11.5858 18.75 11.25 18.4142 11.25 18C11.25 17.5858 11.5858 17.25 12 17.25Z"
        stroke-width="1.5"
        stroke="#DAE6ED"
        fill="#DAE6ED"
      />
    </svg>
  ),
  Formation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 512 512"
      fill="none"
    >
      <g>
        <g>
          <g>
            <path
              d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
        h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
        L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
        h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
        c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
        c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
        C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
        c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
        c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
        l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
        l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
        c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
        l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
              fill="#DAE6ED"
            />
            <path
              d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
        c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
        l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
        l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
        l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
        s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
              fill="#DAE6ED"
            />
            <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
            <rect x="288" y="64" width="32" height="16" />
            <path
              d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
              fill="#DAE6ED"
            />
            <rect x="240" y="160" width="32" height="16" />
            <rect x="288" y="160" width="32" height="16" />
          </g>
        </g>
      </g>
    </svg>
  ),
  Présentation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 64 64"
      fill="none"
    >
      <g>
        <path
          d="M60,3.999H35v-1c0-1.657-1.343-3-3-3s-3,1.343-3,3v1H4c-2.211,0-4,1.789-4,4v38c0,2.211,1.789,4,4,4h19.888
l-5.485,9.5c-0.829,1.435-0.338,3.27,1.098,4.098s3.27,0.337,4.098-1.098l7.217-12.5h2.37l7.217,12.5
c0.829,1.436,2.663,1.927,4.099,1.098c1.436-0.828,1.926-2.662,1.098-4.098l-5.485-9.5H60c2.211,0,4-1.789,4-4v-38
C64,5.788,62.211,3.999,60,3.999z M31,2.999c0-0.553,0.447-1,1-1s1,0.447,1,1v1h-2V2.999z M21.866,61.499
c-0.276,0.479-0.888,0.643-1.366,0.365c-0.479-0.275-0.643-0.887-0.365-1.365l6.062-10.5h2.309L21.866,61.499z M43.865,60.499
c0.277,0.479,0.113,1.09-0.365,1.366s-1.09,0.112-1.366-0.366l-6.64-11.5h2.309L43.865,60.499z M62,45.999c0,1.104-0.896,2-2,2H4
c-1.104,0-2-0.896-2-2v-38c0-1.104,0.896-2,2-2h56c1.104,0,2,0.896,2,2V45.999z"
          fill="#DAE6ED"
        />
        <path
          d="M35,17.999h-6c-0.553,0-1,0.447-1,1v25h8v-25C36,18.446,35.553,17.999,35,17.999z M34,41.999h-4v-8h4
V41.999z M34,31.999h-4v-12h4V31.999z"
          fill="#DAE6ED"
        />
        <path
          d="M47,9.999h-6c-0.553,0-1,0.447-1,1v33h8v-33C48,10.446,47.553,9.999,47,9.999z M46,41.999h-4v-10h4V41.999z
 M46,29.999h-4v-18h4V29.999z"
          fill="#DAE6ED"
        />
        <path
          d="M23,25.999h-6c-0.553,0-1,0.447-1,1v17h8v-17C24,26.446,23.553,25.999,23,25.999z M22,41.999h-4v-6h4
V41.999z M22,33.999h-4v-6h4V33.999z"
          fill="#DAE6ED"
        />
      </g>
    </svg>
  ),
  Evènement: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="40"
      viewBox="0 0 37 36"
      version="1.1"
      id="svg822"
    >
      <g id="layer1" transform="translate(0,-289.0625)">
        <path
          d="M 9 4 L 9 7 L 7 7 C 5.3552974 7 4 8.3553 4 10 L 4 24 C 4 25.6447 5.3552974 27 7 27 L 23 27 C 24.644703 27 26 25.6447 26 24 L 26 10 C 26 8.3553 24.644703 7 23 7 L 21 7 L 21 4 L 19 4 L 19 7 L 11 7 L 11 4 L 9 4 z M 7 9 L 23 9 C 23.571297 9 24 9.4287 24 10 L 24 24 C 24 24.5713 23.571297 25 23 25 L 7 25 C 6.4287028 25 6 24.5713 6 24 L 6 10 C 6 9.4287 6.4287028 9 7 9 z M 17 17 C 16.446 17 16 17.446 16 18 L 16 22 C 16 22.554 16.446 23 17 23 L 21 23 C 21.554 23 22 22.554 22 22 L 22 18 C 22 17.446 21.554 17 21 17 L 17 17 z "
          transform="translate(0,289.0625)"
          id="rect894"
          fill="#DAE6ED"
        />
        <g id="g825" transform="translate(0,1)" />
      </g>
    </svg>
  ),
  "Job Interview": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
    >
      <path
        d="M10.25 13.5H8.75M16.25 13.5H14.75M10.25 9H8.75M16.25 9H14.75M28.25 22.5H26.75M28.25 16.5H26.75M21.5 12V33H27.5C30.329 33 31.742 33 32.621 32.121C33.5 31.242 33.5 29.829 33.5 27V18C33.5 15.171 33.5 13.758 32.621 12.879C31.742 12 30.329 12 27.5 12H21.5ZM21.5 12C21.5 7.758 21.5 5.6355 20.1815 4.3185C18.8645 3 16.742 3 12.5 3C8.258 3 6.1355 3 4.8185 4.3185C3.5 5.6355 3.5 7.758 3.5 12V15M12.5375 20.9325C12.5462 21.332 12.4751 21.7292 12.3282 22.1009C12.1813 22.4725 11.9616 22.811 11.6821 23.0966C11.4025 23.3822 11.0688 23.609 10.7004 23.7638C10.3319 23.9186 9.93633 23.9983 9.53672 23.9981C9.13711 23.9979 8.74156 23.9178 8.37331 23.7627C8.00506 23.6075 7.67152 23.3803 7.39227 23.0945C7.11302 22.8086 6.8937 22.4699 6.74717 22.0981C6.60064 21.7263 6.52987 21.329 6.539 20.9295C6.55692 20.1457 6.88098 19.4 7.44181 18.8521C8.00265 18.3042 8.75568 17.9977 9.53972 17.9981C10.3238 17.9985 11.0765 18.3058 11.6368 18.8542C12.1971 19.4027 12.5204 20.1487 12.5375 20.9325ZM3.605 30.315C5.192 27.873 7.7135 26.958 9.5375 26.9595C11.3615 26.961 13.808 27.873 15.3965 30.315C15.4985 30.4725 15.527 30.6675 15.434 30.831C15.0635 31.4895 13.91 32.796 13.079 32.883C12.1205 32.985 9.6185 33 9.539 33C9.4595 33 6.8795 32.985 5.924 32.883C5.09 32.7945 3.938 31.4895 3.566 30.831C3.52427 30.7498 3.50582 30.6586 3.5127 30.5675C3.51959 30.4764 3.55153 30.389 3.605 30.315Z"
        stroke="#DAE6ED"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  "Customer Meeting": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 70.243 70.243"
    >
      <path
        d="M9.43,36.414c0.016-0.548,0.065-2.215,1.317-2.688c1.236-0.465,2.449,0.744,2.679,0.99
c0.377,0.404,0.356,1.037-0.047,1.414c-0.403,0.377-1.036,0.356-1.414-0.047c-0.127-0.134-0.305-0.276-0.45-0.367
c-0.037,0.148-0.076,0.387-0.086,0.757c-0.075,2.573,1.916,3.392,2,3.425c0.354,0.14,0.606,0.471,0.638,0.85
c0.592,7.06,6.152,9.344,8.752,9.344s8.161-2.284,8.753-9.344c0.032-0.385,0.284-0.718,0.646-0.853
c0.076-0.03,2.067-0.849,1.992-3.422c-0.011-0.37-0.05-0.609-0.086-0.757c-0.146,0.092-0.324,0.234-0.453,0.37
c-0.38,0.4-1.012,0.418-1.413,0.041s-0.422-1.007-0.046-1.409c0.231-0.247,1.445-1.458,2.679-0.99
c1.252,0.473,1.301,2.14,1.317,2.688c0.089,3.024-1.729,4.495-2.702,5.063c-0.885,7.315-6.716,10.615-10.688,10.615
s-9.803-3.299-10.688-10.615C11.159,40.909,9.341,39.438,9.43,36.414z M22.82,56.932c0.31,0,2.834-0.626,2.834-3.154H22.82h-2.834
C19.985,56.306,22.51,56.932,22.82,56.932z M24.638,57.3c-0.26-0.046-0.53,0.008-0.75,0.157c-0.463,0.317-0.878,0.445-1.068,0.491
c-0.196-0.047-0.609-0.176-1.071-0.491c-0.219-0.149-0.488-0.204-0.75-0.157c-0.261,0.049-0.491,0.2-0.641,0.419
c-0.407,0.597-2.364,10.734-2.381,10.833c-0.097,0.544,0.266,1.063,0.81,1.159c0.549,0.099,1.063-0.266,1.159-0.81
c0.333-1.878,1.382-6.906,1.896-9.163c0.474,0.172,0.809,0.214,0.868,0.221c0.071,0.008,0.145,0.008,0.216,0
c0.059-0.006,0.394-0.048,0.868-0.221c0.514,2.257,1.563,7.285,1.897,9.163c0.086,0.485,0.507,0.825,0.983,0.825
c0.058,0,0.117-0.005,0.176-0.016c0.544-0.096,0.906-0.615,0.81-1.159c-0.018-0.099-1.974-10.236-2.382-10.833
C25.13,57.5,24.899,57.349,24.638,57.3z M10.427,65.574c-0.552,0-1,0.448-1,1v2.152c0,0.552,0.448,1,1,1s1-0.448,1-1v-2.152
C11.427,66.022,10.979,65.574,10.427,65.574z M14.069,27.929c-0.914,1.101-1.503,2.479-1.706,3.989
c-0.073,0.547,0.311,1.05,0.858,1.124c0.045,0.006,0.09,0.009,0.134,0.009c0.493,0,0.922-0.365,0.99-0.867
c0.152-1.136,0.589-2.166,1.263-2.977c0.353-0.425,0.294-1.055-0.131-1.408C15.053,27.446,14.422,27.504,14.069,27.929z
M30.72,33.043c0,0.552,0.448,1,1,1s1-0.448,1-1c0-5.747-4.284-7.322-6.563-7.353h-9.123c-0.552,0-1,0.448-1,1s0.448,1,1,1h9.104
C26.608,27.701,30.72,27.945,30.72,33.043z M34.045,30.813c0.039,0,0.078-0.002,0.118-0.007c0.548-0.064,0.941-0.561,0.877-1.109
c-0.67-5.728-5.59-7.192-8.113-7.128h-8.603c-0.552,0-1,0.448-1,1s0.448,1,1,1h8.615c0.223,0.009,5.489,0.012,6.115,5.361
C33.113,30.438,33.545,30.813,34.045,30.813z M68.092,0H2.342c-0.552,0-1,0.448-1,1v52.144c0,0.552,0.448,1,1,1h6.077
c-3.484,2.593-7.267,7.122-7.267,14.583c0,0.552,0.448,1,1,1s1-0.448,1-1c0-10.078,7.524-14.1,10.426-15.276l0.134,2.457
c0.018,0.332,0.2,0.633,0.485,0.804c0.158,0.094,0.335,0.142,0.513,0.142c0.145,0,0.29-0.031,0.425-0.095l3.334-1.565
c0.5-0.235,0.715-0.83,0.48-1.33c-0.235-0.501-0.832-0.714-1.33-0.48l-1.992,0.935l-0.215-3.938
c-0.03-0.552-0.506-0.969-1.053-0.944c-0.551,0.03-0.974,0.501-0.944,1.053l0.048,0.874c-0.435,0.164-1.055,0.419-1.791,0.784
c-0.006,0-0.012-0.004-0.018-0.004H3.342V2h63.75v50.144H49.522c3.191-6.788,2.519-14.94,2.482-15.359
c-0.046-0.516-0.478-0.911-0.996-0.911h-4.917c-0.552,0-1,0.448-1,1c0,5.113-1.365,8.829-4.058,11.044
c-3.127,2.572-7.286,2.47-8.971,2.3c-0.097-0.424-0.448-0.756-0.904-0.781c-0.548-0.029-1.023,0.392-1.053,0.944l-0.216,3.938
l-1.83-0.859c-0.5-0.234-1.095-0.021-1.33,0.48c-0.235,0.5-0.02,1.095,0.48,1.33l3.172,1.489c0.135,0.063,0.28,0.095,0.425,0.095
c0.178,0,0.355-0.047,0.513-0.142c0.285-0.17,0.467-0.472,0.485-0.804l0.202-3.68c2.07,0.198,6.656,0.22,10.283-2.754
c2.999-2.458,4.606-6.358,4.785-11.6h2.984c0.096,2.892-0.024,11.973-4.876,17.271c-2.447,2.672-5.802,4.026-9.971,4.026
c-0.552,0-1,0.448-1,1s0.448,1,1,1c4.756,0,8.609-1.575,11.451-4.681c0.668-0.731,1.252-1.52,1.768-2.346h4.91v15.099
c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h2.5v15.099c0,0.552,0.448,1,1,1s1-0.448,1-1V54.144h8.25c0.552,0,1-0.448,1-1V1
C69.092,0.448,68.644,0,68.092,0z M35.213,62.445c-0.552,0-1,0.448-1,1v5.281c0,0.552,0.448,1,1,1s1-0.448,1-1v-5.281
C36.213,62.893,35.765,62.445,35.213,62.445z M31.104,8.207c0.552,0,1-0.448,1-1s-0.448-1-1-1H13.277c-0.552,0-1,0.448-1,1
s0.448,1,1,1H31.104z M8.008,11.166c0,0.552,0.448,1,1,1h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008
C8.456,10.166,8.008,10.614,8.008,11.166z M9.008,16.125h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
S8.456,16.125,9.008,16.125z M9.008,20.084h22.096c0.552,0,1-0.448,1-1s-0.448-1-1-1H9.008c-0.552,0-1,0.448-1,1
S8.456,20.084,9.008,20.084z M64.821,9.014c0.421-0.356,0.474-0.987,0.117-1.409c-0.356-0.421-0.987-0.475-1.409-0.117
l-10.832,9.165l-5.668-5.946c-0.334-0.42-0.942-0.499-1.375-0.184l-6.798,5.71c-0.445,0.327-0.541,0.953-0.214,1.398
c0.326,0.444,0.952,0.541,1.398,0.214l6.023-5.141l5.711,6c0.168,0.211,0.416,0.346,0.685,0.373
c0.033,0.003,0.065,0.005,0.098,0.005c0.235,0,0.465-0.083,0.646-0.237L64.821,9.014z M47.42,19.128l-0.321,7.26
c0.469-0.052,0.885-0.053,1.159-0.053c1.082,0,4.374,0,4.374,3.221v1.38c0,2.412-1.962,4.374-4.374,4.374s-4.374-1.962-4.374-4.374
v-1.38c0-1.259,0.505-2.022,1.183-2.489l0.355-8.027c0.025-0.552,0.53-0.969,1.043-0.955C47.016,18.11,47.444,18.577,47.42,19.128z
M48.258,28.335c-2.374,0-2.374,0.649-2.374,1.221v1.38c0,1.309,1.065,2.374,2.374,2.374s2.374-1.065,2.374-2.374v-1.38
C50.632,28.984,50.632,28.335,48.258,28.335z M22.934,36.874v5.064h-1.228c-0.552,0-1,0.448-1,1s0.448,1,1,1h2.228
c0.552,0,1-0.448,1-1v-6.064c0-0.552-0.448-1-1-1S22.934,36.321,22.934,36.874z"
        fill="#DAE6ED"
      />
    </svg>
  ),
  Quiz: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.5 22.5C21.925 22.5 22.294 22.344 22.607 22.032C22.92 21.72 23.076 21.351 23.075 20.925C23.074 20.499 22.918 20.1305 22.607 19.8195C22.296 19.5085 21.927 19.352 21.5 19.35C21.073 19.348 20.7045 19.5045 20.3945 19.8195C20.0845 20.1345 19.928 20.503 19.925 20.925C19.922 21.347 20.0785 21.716 20.3945 22.032C20.7105 22.348 21.079 22.504 21.5 22.5ZM20.375 17.7H22.625C22.625 16.975 22.7 16.444 22.85 16.107C23 15.77 23.35 15.326 23.9 14.775C24.65 14.025 25.15 13.419 25.4 12.957C25.65 12.495 25.775 11.951 25.775 11.325C25.775 10.2 25.381 9.2815 24.593 8.5695C23.805 7.8575 22.774 7.501 21.5 7.5C20.475 7.5 19.5815 7.7875 18.8195 8.3625C18.0575 8.9375 17.526 9.7 17.225 10.65L19.25 11.475C19.475 10.85 19.7815 10.3815 20.1695 10.0695C20.5575 9.7575 21.001 9.601 21.5 9.6C22.1 9.6 22.5875 9.769 22.9625 10.107C23.3375 10.445 23.525 10.901 23.525 11.475C23.525 11.825 23.425 12.1565 23.225 12.4695C23.025 12.7825 22.675 13.176 22.175 13.65C21.35 14.375 20.844 14.944 20.657 15.357C20.47 15.77 20.376 16.551 20.375 17.7ZM12.5 27C11.675 27 10.969 26.7065 10.382 26.1195C9.795 25.5325 9.501 24.826 9.5 24V6C9.5 5.175 9.794 4.469 10.382 3.882C10.97 3.295 11.676 3.001 12.5 3H30.5C31.325 3 32.0315 3.294 32.6195 3.882C33.2075 4.47 33.501 5.176 33.5 6V24C33.5 24.825 33.2065 25.5315 32.6195 26.1195C32.0325 26.7075 31.326 27.001 30.5 27H12.5ZM12.5 24H30.5V6H12.5V24ZM6.5 33C5.675 33 4.969 32.7065 4.382 32.1195C3.795 31.5325 3.501 30.826 3.5 30V9H6.5V30H27.5V33H6.5Z"
        fill="#DAE6ED"
      />
    </svg>
  ),

  "Suivi de projet": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 1024 1024"
      fill="none"
    >
      <path
        d="M960 160H384V64a32 32 0 0 0-32-32H136.96A104.96 104.96 0 0 0 32 136.96v558.08A104.96 104.96 0 0 0 136.96 800h128a256 256 0 0 0 495.04 0h128A104.96 104.96 0 0 0 992 695.04V192a32 32 0 0 0-32-32zM512 928a192 192 0 1 1 192-192 192 192 0 0 1-192 192z m416-608H576a32 32 0 0 0 0 64h352v311.04A40.96 40.96 0 0 1 887.04 736H768a256 256 0 0 0-512 0H136.96A40.96 40.96 0 0 1 96 695.04V136.96A40.96 40.96 0 0 1 136.96 96H320v96a32 32 0 0 0 32 32h576z"
        fill="#DAE6ED"
      />
      <path
        d="M288 352a32 32 0 0 0 32 32h128a32 32 0 0 0 0-64h-128a32 32 0 0 0-32 32zM209.6 325.44a17.6 17.6 0 0 0-5.44-2.88 19.84 19.84 0 0 0-6.08-2.56 27.84 27.84 0 0 0-12.48 0 20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84A32 32 0 0 0 160 352a32 32 0 0 0 9.28 22.72 36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 224 352a33.6 33.6 0 0 0-9.28-22.72zM608 704h-64v-96a32 32 0 0 0-64 0v128a32 32 0 0 0 32 32h96a32 32 0 0 0 0-64z"
        fill="#DAE6ED"
      />
    </svg>
  ),

  Task: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.925 27L25.4 18.525L23.225 16.35L16.8875 22.6875L13.7375 19.5375L11.6 21.675L16.925 27ZM9.5 33C8.675 33 7.969 32.7065 7.382 32.1195C6.795 31.5325 6.501 30.826 6.5 30V6C6.5 5.175 6.794 4.469 7.382 3.882C7.97 3.295 8.676 3.001 9.5 3H21.5L30.5 12V30C30.5 30.825 30.2065 31.5315 29.6195 32.1195C29.0325 32.7075 28.326 33.001 27.5 33H9.5ZM20 13.5V6H9.5V30H27.5V13.5H20Z"
        fill="#DAE6ED"
      />
    </svg>
  ),
  Newsletter: (
    <svg
      width="37"
      height="36"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
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
          stroke="#DAE6ED"
          stroke-linejoin="round"
          stroke-miterlimit="4.62"
          stroke-width="2"
          d="M5 16h5.5s1 3.5 5.5 3.5 5.5-3.5 5.5-3.5H27v8c0 1.5-1.5 3-3 3H8c-1.5 0-3-1.5-3-3v-8z"
        ></path>{" "}
        <path
          stroke="#DAE6ED"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M27 16l-1-3M5 19.5V16l1-3"
        ></path>{" "}
        <path
          stroke="#DAE6ED"
          stroke-linecap="round"
          stroke-width="2"
          d="M13.5 9h5M13.5 13h5"
        ></path>{" "}
        <path
          stroke="#DAE6ED"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.5 13V5h13v8"
        ></path>{" "}
      </g>
    </svg>
  ),
};

export const changeTo24HourFormat = (time) => {
  if (!time) return;

  // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
  const timeMoment = moment(time, "hh:mm:ss A");
  return timeMoment.isValid() ? timeMoment.format("HH[h]mm") : "";
};
export const convertTo24HourFormat = (time, date, type, timezone) => {
  if (!time || !date || !type) {
    return false;
  }

  const meetingTimezone = timezone || "Europe/Paris";

  // Get the user's timezone dynamically
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

//For Media Meeting Type (Add Count2 with time_unit into step_time)
export const convertTo24HourFormatForMedia = (step_time, count2, time_unit) => {
  if (!step_time || !count2 || !time_unit) {
    console.error("Missing required parameters:", {
      step_time,
      count2,
      time_unit,
    });
    return "";
  }

  // Convert `step_time` from 12-hour format to a moment object
  let timeMoment = moment(step_time, ["h:mm:ss A", "hh:mm:ss A"], true);

  if (!timeMoment.isValid()) {
    console.error("Invalid step_time format:", step_time);
    return "";
  }

  // Convert `count2` to a valid number
  const count = Number(count2);
  if (isNaN(count)) {
    console.error("Invalid count2 value:", count2);
    return "";
  }

  // Add `count2` based on `time_unit`
  const timeUnitsMap = {
    seconds: "seconds",
    mins: "minutes",
    minutes: "minutes",
    hours: "hours",
    days: "days",
  };

  if (!timeUnitsMap[time_unit]) {
    console.error("Invalid time_unit:", time_unit);
    return "";
  }

  timeMoment.add(count, timeUnitsMap[time_unit]);

  // Return formatted time in 24-hour format (HH:mm)
  return timeMoment.format("HH[h]mm");
};

// export const addTimeTakenToStepTime = (time_taken, step_time) => {
//   if (!time_taken || !step_time) return;

//   let days = 0,
//     hours = 0,
//     minutes = 0,
//     seconds = 0;

//   // Split time_taken into parts by " - "
//   const timeParts = time_taken.split(" - ");

//   // Loop through each part of the time_taken string
//   timeParts.forEach((part) => {
//     if (part.includes("day")) {
//       days = parseInt(part.replace("day", "").replace("s", "").trim());
//     } else if (part.includes("hour")) {
//       hours = parseInt(part.replace("hours", "").replace("hour", "").trim());
//     } else if (part.includes("min")) {
//       minutes = parseInt(part.replace("mins", "").replace("min", "").trim());
//     } else if (part.includes("sec")) {
//       seconds = parseInt(part.replace("secs", "").replace("sec", "").trim());
//     }
//   });

//   // Convert days into hours
//   hours += days * 24;

//   // Parse the "step_time" to a Date object (assume time is in format HH:mm:ss AM/PM)
//   const timeMoment = moment(step_time, "hh:mm:ss A");

//   if (!timeMoment.isValid()) return "";

//   // Add the time_taken to step_time
//   timeMoment.add(hours, "hours");
//   timeMoment.add(minutes, "minutes");
//   timeMoment.add(seconds, "seconds");

//   // Format the final time in "HH:mm" format
//   return convertTo24HourFormat(timeMoment.format("HH:mm"));
// };
export const addTimeTakenToStepTime = (
  time_taken,
  date,
  step_time,
  timezone
) => {
  if (!time_taken || !step_time) return;
  const userTimezone = moment.tz.guess();

  let days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0;

  // Split time_taken into parts by " - "
  const timeParts = time_taken.split(" - ");

  // Loop through each part of the time_taken string
  timeParts.forEach((part) => {
    if (part.includes("day")) {
      days = parseInt(part.replace("day", "").replace("s", "").trim());
    } else if (part.includes("hour")) {
      hours = parseInt(part.replace("hours", "").replace("hour", "").trim());
    } else if (part.includes("min")) {
      minutes = parseInt(part.replace("mins", "").replace("min", "").trim());
    } else if (part.includes("sec")) {
      seconds = parseInt(part.replace("secs", "").replace("sec", "").trim());
    }
  });

  // Convert days into hours
  hours += days * 24;

  // Use provided timezone or default to Europe/Paris
  const meetingTimezone = timezone || "Europe/Paris";

  // Convert step_time from meeting's timezone to the user's timezone
  const timeMoment = moment
    .tz(`${date} ${step_time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
    .tz(userTimezone);

  if (!timeMoment.isValid()) return "";

  // Add the time_taken to step_time
  timeMoment.add(hours, "hours");
  timeMoment.add(minutes, "minutes");
  timeMoment.add(seconds, "seconds");

  // Format the final time in "HH:mm" format
  return changeTo24HourFormat(timeMoment.format("HH:mm"));
};

//FOr Feedback
export const convertToUserTimeZone = (utcDateString) => {
  if (!utcDateString) return;

  const date = new Date(utcDateString + "Z"); // Treat as UTC
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23", // Use 24-hour format
    timeZone: userTimeZone, // Convert to user's timezone
  }).format(date);
};





export const destinationTypeIcons = {
  Study: (
    <FaBookOpen style={{ width: '37px', height: '36px' }} />
  ),
  Audit: (
    <AiOutlineAudit style={{ width: '37px', height: '36px' }} />
  ),
  Project: (
    <IoIosRocket style={{ width: '37px', height: '36px' }} />
  ),
  Accompagnement: (
    <MdOutlineSupport style={{ width: '37px', height: '36px' }} />
  ),
  "Business opportunity": (
    <IoIosBusiness style={{ width: '37px', height: '36px' }} />
  ),
  Other: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 512 512"
      fill="none"
    >
      <g>
        <g>
          <g>
            <path
              d="M432,336h-10.84c16.344-13.208,26.84-33.392,26.84-56v-32c0-30.872-25.128-56-56-56h-32c-2.72,0-5.376,0.264-8,0.64V48
        h16V0H0v48h16v232H0v48h187.056l40,80H304v88h192v-96C496,364.712,467.288,336,432,336z M422.584,371.328l-32.472,13.92
        L412.28,352h5.472L422.584,371.328z M358.944,352h34.112L376,377.576L358.944,352z M361.872,385.248l-32.472-13.92L334.24,352
        h5.472L361.872,385.248z M432.008,280C432,310.872,406.872,336,376,336s-56-25.128-56-56h37.424
        c14.12,0,27.392-5.504,37.368-15.48l4.128-4.128c8.304,10.272,20.112,16.936,33.088,18.92V280z M48,192v72h107.176
        c0.128,0.28,0.176,0.584,0.312,0.856L163.056,280H32V48h304v149.48c-18.888,9.008-32,28.24-32,50.52v32h-65.064l-24.816-46.528
        C208.368,222.696,197.208,216,185,216c-10.04,0-18.944,4.608-25,11.712V192H48z M144,208v40H64v-40H144z M360,208h32
        c22.056,0,40,17.944,40,40v15.072c-9.168-2.032-17.32-7.48-22.656-15.48l-8.104-12.152l-17.768,17.768
        c-6.96,6.96-16.208,10.792-26.048,10.792H320v-16C320,225.944,337.944,208,360,208z M16,16h336v16H16V16z M16,312v-16h155.056
        l8,16H16z M256,392h-19.056L169.8,257.712c-1.176-2.36-1.8-4.992-1.8-7.608V249c0-9.376,7.624-17,17-17c6.288,0,12.04,3.456,15,9
        l56,104.992V392z M247.464,296h58.392c1.28,5.616,3.232,10.968,5.744,16H256L247.464,296z M264.536,328h57.952
        c2.584,2.872,5.352,5.568,8.36,8H268.8L264.536,328z M480,480h-32v-32h32V480z M480,432h-32v-32h-16v80H320v-88h-48v-40h45.76
        l-7.168,28.672L376,408.704l65.416-28.032l-7.144-28.56C459.68,353.312,480,374.296,480,400V432z"
              fill="#000000"
            />
            <path
              d="M160,128v-16h-16.808c-1.04-5.096-3.072-9.832-5.856-14.024l11.92-11.92l-11.312-11.312l-11.92,11.92
        c-4.192-2.784-8.928-4.816-14.024-5.856V64H96v16.808c-5.096,1.04-9.832,3.072-14.024,5.856l-11.92-11.92L58.744,86.056
        l11.92,11.92c-2.784,4.192-4.816,8.928-5.856,14.024H48v16h16.808c1.04,5.096,3.072,9.832,5.856,14.024l-11.92,11.92
        l11.312,11.312l11.92-11.92c4.192,2.784,8.928,4.816,14.024,5.856V176h16v-16.808c5.096-1.04,9.832-3.072,14.024-5.856
        l11.92,11.92l11.312-11.312l-11.92-11.92c2.784-4.192,4.816-8.928,5.856-14.024H160z M104,144c-13.232,0-24-10.768-24-24
        s10.768-24,24-24s24,10.768,24,24S117.232,144,104,144z"
              fill="#000000"
            />
            <polygon points="244.28,80 272,80 272,64 235.72,64 203.72,112 176,112 176,128 212.28,12" />
            <rect x="288" y="64" width="32" height="16" />
            <path
              d="M224,144h-48v48h48V144z M208,176h-16v-16h16V176z"
              fill="#000000"
            />
            <rect x="240" y="160" width="32" height="16" />
            <rect x="288" y="160" width="32" height="16" />
          </g>
        </g>
      </g>
    </svg>
  ),
};
