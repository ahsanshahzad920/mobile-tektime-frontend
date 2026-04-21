import CookieService from '../../../../Utils/CookieService';
import { toast } from "react-toastify";
import { copyMeetingApi, getMeeting } from "./apiHelper";
// import moment from "moment";
import moment from "moment-timezone";

export const userId = parseInt(CookieService.get("user_id"));
export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Helper function to format time in 12-hour format
export const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
};

export const getTimeZoneAbbreviation = (timeZone) => {
  // Define known time zone abbreviations
  const timeZones = {
    "Europe/Paris":
      new Date().getMonth() >= 2 && new Date().getMonth() <= 9 ? "CEST" : "CET", // France DST check
    "Asia/Karachi": "PKT", // Pakistan
  };

  return timeZones[userTimeZone] || userTimeZone; // Use abbreviation or full name
};

// Helper function to format date as YYYY-MM-DD
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to parse and format date and time from API response
// export const parseAndFormatDateTime = (dateTimeString, type) => {
//   const [dateOnly, timeOnly] = dateTimeString.split("T");
//   const [year, month, day] = dateOnly.split("-");
//   const formattedDate = `${day}/${month}/${year}`;

//   const [hours, minutes, seconds] = timeOnly.split(".")[0].split(":");
//   const formattedTime = `${hours}h${minutes}${
//     type === "Quiz" ? `m${seconds}` : ""
//   }`;

//   return { formattedDate, formattedTime };
// };

// FOR TIMEZONE
export const parseAndFormatDateTime = (dateTimeString, type , timezone) => {
  if (!dateTimeString || !type) return { formattedDate: "", formattedTime: "" };


  const meetingTimezone = timezone || "Europe/Paris";

  // Extract only the part you need: YYYY-MM-DDTHH:mm:ss
  const cleanDateTimeString = dateTimeString.split(".")[0]; // Removes milliseconds and 'Z' // I have to remove this Z because it takes it as a UTC

  // Now the problem is that the estimate time which comes from DB is in the UTC format (2025-02-20T23:10:00.000000Z" is in UTC (Z means UTC)) so cnvert UTC time to user timezone
  // Convert the meeting time from the given timezone to the user's timezone
  // const convertedTime = moment.tz(dateTimeString, timezone).tz(userTimezone); // not working correctly because of UTC

  // Convert the time from the source timezone to the user's timezone
  const convertedTime = moment
    .tz(cleanDateTimeString, meetingTimezone)
    .tz(userTimezone);

  // Format date as DD/MM/YYYY
  const formattedDate = convertedTime.format("DD/MM/YYYY");

  // Format time in your desired format
  const formattedTime =
    type === "Quiz"
      ? convertedTime.format("HH[h]mm[m]ss") // Includes seconds for quizzes
      : convertedTime.format("HH[h]mm"); // Otherwise, only hours and minutes

  return { formattedDate, formattedTime };
};

// Helper function to calculate total time units from steps
export const calculateTotalTimeUnits = (steps) => {
  const totals = { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
  return totals;
};

// Helper function to add minutes to a given time and format it
export const addMinutesToTime = (time, minutesToAdd) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours);
  startDate.setMinutes(minutes + minutesToAdd);
  startDate.setSeconds(seconds);
  return startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

export const calculateEndDate = (steps, initialDate) => {
  if (!steps || !initialDate) {
    return;
  }

  // Parse the formatted initial date (yyyy-MM-dd) into a Date object
  const [year, month, day] = initialDate.split("-").map(Number);
  const date = new Date(year, month - 1, day); // month is zero-based

  // Calculate the total time in seconds from the steps
  let totalSeconds = 0;

  steps?.forEach((step) => {
    const timeTaken = step.time_taken;
    if (timeTaken) {
      totalSeconds += parseTimeTaken(timeTaken);
    }
  });

  // Convert total seconds into days, hours, minutes, and seconds
  const days = Math.floor(totalSeconds / 86400);
  const hrs = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  // Add the calculated time to the initial date
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hrs);
  date.setMinutes(date.getMinutes() + mins);
  date.setSeconds(date.getSeconds() + secs);

  // Format the date as yyyy-MM-dd
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;

  return formattedDate;
};
/*
----------------------------------------FOR TIMEZONE--------------------------------
Europe/Paris
Asia/Karachi
export const convertTo12HourFormat = (time, steps, meetingTimezone = "Asia/Karachi") => {
  if (!time || !steps) return;

  // Get the user's timezone dynamically
  const userTimezone = moment.tz.guess();
  
  // Get the user's timezone statically
  const userTimezone = "Europe/Paris";

  // Check if any step has time unit in seconds
  const hasSeconds = steps.some((step) => step.time_unit === "seconds");

  // Assume meeting time is stored in its original timezone, add a reference date (to avoid misinterpretation)
  const meetingDateTime = moment.tz(`2025-02-20 ${time}`, "YYYY-MM-DD HH:mm:ss", meetingTimezone);

  // Convert to user's timezone
  const convertedTime = meetingDateTime.tz(userTimezone);

  // Format time in 12-hour format
  return convertedTime.format(hasSeconds ? "hh:mm:ss A" : "hh:mm A");
};
----------------------------------------FOR TIMEZONE--------------------------------
*/
const userTimezone = moment.tz.guess(); // Dynamically detect user's timezone

// const userTimezone = "Europe/Paris"; // ONLY FOR TESTING PURPOSE (Uncomment for testing)
export const convertTo12HourFormat = (
  startTime,
  startDate,
  steps,
  timezone
) => {
  if (!startTime || !steps || !startDate) return;

  // Use provided timezone or default to Europe/Paris
  const meetingTimezone = timezone || "Europe/Paris";
  // Check if any step has time unit in seconds
  const hasSeconds = steps?.some((step) => step.time_unit === "seconds");

  // Convert meeting time from its original timezone to the user's timezone
  const convertedTime = moment
    .tz(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss", meetingTimezone)
    .tz(userTimezone);

  // Extract hours, minutes, and seconds
  let hour = convertedTime.hour();
  let minute = convertedTime.minute();
  let second = convertedTime.second();

  const formattedHour = hour.toString().padStart(2, "0");
  const formattedMinute = minute.toString().padStart(2, "0");
  const formattedSecond = second.toString().padStart(2, "0");

  const endTime = hasSeconds
    ? `${formattedHour}h${formattedMinute}m${formattedSecond}`
    : `${formattedHour}h${formattedMinute} `;

  return `${endTime}`;
};

export const convertTo12HourFormatMeeting = (
  startTime,
  startDate,
  timezone
) => {
  if (!startTime || !startDate) return;

  // Use provided timezone or default to Europe/Paris
  const meetingTimezone = timezone || "Europe/Paris";

  // // Check if any step has time unit in seconds
  // const hasSeconds = steps?.some((step) => step.time_unit === "seconds");

  // Convert meeting time from its original timezone to the user's timezone
  const convertedTime = moment
    .tz(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss", meetingTimezone)
    .tz(userTimezone);

  // Extract hours, minutes, and seconds
  let hour = convertedTime.hour();
  let minute = convertedTime.minute();
  let second = convertedTime.second();

  const formattedHour = hour.toString().padStart(2, "0");
  const formattedMinute = minute.toString().padStart(2, "0");
  const formattedSecond = second.toString().padStart(2, "0");

  const endTime = `${formattedHour}h${formattedMinute} `;

  return `${endTime}`;
};

export const convertDateToUserTimezone = (
  meetingDate,
  meetingTime,
  timezone
) => {
  if (!meetingDate || !meetingTime) return "";

  // Use provided timezone or default to Europe/Paris
  const meetingTimezone = timezone || "Europe/Paris";

  // Convert meeting time from its original timezone to the user's timezone
  const convertedTime = moment
    .tz(
      `${meetingDate} ${meetingTime}`,
      "YYYY-MM-DD HH:mm:ss A",
      meetingTimezone
    )
    .tz(userTimezone);

  // Format the date in dd/mm/yyyy
  return convertedTime.format("DD/MM/YYYY");
};

export function calculateTotalTime(steps, t) {
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
  // Retrieve localized time units
  const timeUnits = t("time_unit", { returnObjects: true });

  let result = "";

  if (days > 0) result += `${days} ${timeUnits["days"] || "days"} `;
  if (hrs > 0) result += `${hrs} ${timeUnits["hours"] || "hours"} `;
  if (mins > 0) result += `${mins} ${timeUnits["mins"] || "mins"} `;

  // Only show seconds if no days, hours, or minutes are present
  if (days === 0 && hrs === 0 && mins === 0 && secs > 0) {
    result += `${secs} ${timeUnits["secs"] || "secs"}`;
  }

  return result.trim();
}

export function calculateTotalTimeMeeting(meeting, t) {
  if (!meeting) return "";

  let totalSeconds = 0;
  let startDateTime, endDateTime;

  const timeUnits = t("time_unit", { returnObjects: true });

  // Handle different statuses
  if (meeting.status === "active") {
    // For active meetings, calculate duration between start_time and estimate_time
    startDateTime = moment(`${meeting.date} ${meeting.start_time}`, "YYYY-MM-DD HH:mm:ss");
    endDateTime = moment(meeting.estimate_time); // Parse ISO format directly
    totalSeconds = Math.max(0, endDateTime.diff(startDateTime, "seconds"));
  } else if (meeting.status === "in_progress" || meeting?.status === "to_finish" || meeting?.status === "todo" || meeting.status === "completed") {
    // For in_progress/completed meetings, calculate duration between starts_at and ends_at
    startDateTime = moment(`${meeting.date} ${meeting.starts_at}`, "YYYY-MM-DD HH:mm:ss");
    endDateTime = moment(meeting.estimate_time); // Parse ISO format directly

    totalSeconds = Math.max(0, endDateTime.diff(startDateTime, "seconds"));
  }

  // Convert total seconds into days, hours, minutes
  const days = Math.floor(totalSeconds / 86400);
  const hrs = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  let result = [];

  // Build the result array
  if (days > 0) result.push(`${days} ${timeUnits["days"] || "days"}`);
  if (hrs > 0) result.push(`${hrs} ${timeUnits["hours"] || "hours"}`);
  if (mins > 0) result.push(`${mins} ${timeUnits["mins"] || "mins"}`);

  // If no time units, show "0 mins"
  if (result.length === 0) {
    return `0 ${timeUnits["mins"] || "mins"}`;
  }

  return result.join(" ");
}

export const specialMeetingEndTime = (
  startTime,
  estimateDate,
  steps,
  meetingTimezone
) => {
  if (!startTime || !steps || !estimateDate) return "N/A";

  // Combine date and time in the meeting's timezone
  let meetingStartTime = moment.tz(
    `${estimateDate} ${startTime}`,
    "YYYY-MM-DD HH:mm:ss",
    meetingTimezone
  );

  // Ensure meetingStartTime is valid
  if (!meetingStartTime.isValid()) {
    console.error(
      "Invalid meeting start time:",
      estimateDate,
      startTime,
      meetingTimezone
    );
    return "Invalid Time";
  }

  // Add step durations
  steps?.forEach(({ count2, time_unit }) => {
    if (time_unit === "seconds") meetingStartTime.add(count2, "seconds");
    else if (time_unit === "minutes") meetingStartTime.add(count2, "minutes");
    else if (time_unit === "hours") meetingStartTime.add(count2, "hours");
    else if (time_unit === "days") meetingStartTime.add(count2, "days");
  });

  // Get the user's timezone dynamically
  const userTimezone = moment.tz.guess();
  // Convert to the user's local timezone
  let userTime = meetingStartTime.clone().tz(userTimezone);
  // Return the final converted time in 24-hour format (HH[h]mm)
  return userTime.format("HH[h]mm");
};
export const timeUnitsToSeconds = (time, unit) => {
  switch (unit) {
    case "hours":
      return time * 3600;
    case "minutes":
      return time * 60;
    case "seconds":
      return time;
    case "days":
      return time * 86400; // 24 * 60 * 60
    default:
      console.error("Invalid time unit:", unit);
      return 0;
  }
};

export const formatDateInFrench = (dateString) => {
  if (!dateString) {
    return;
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const calculateTotalDays = (steps) => {
  if (!steps) {
    return;
  }
  return steps?.reduce((total, step) => {
    return total + step.count2;
  }, 0);
};

export const addDaysToDate = (date, days) => {
  if (!date || !days) {
    return;
  }
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Utility function to group participants by team name
export const groupParticipantsByTeam = (participants) => {
  if (!participants) return;
  const grouped = participants.reduce((acc, participant) => {
    const teamName = participant.team_names
      ? participant.team_names[0]
      : "No Team";

    if (!acc[teamName]) {
      acc[teamName] = [];
    }

    acc[teamName].push(participant);
    return acc;
  }, {});

  return grouped;
};

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

//Copy API Helper functions
export const generateCopyPayload = (item, userTimeZone) => {
  const calculateEndTime = (startTime) => {
    const [hour, minute] = startTime.split(":").map(Number);
    return `${String((hour + 1) % 24).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;
  };

  const resetStepFields = (steps) => {
    return steps?.map((step) => ({
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
      pause_date_time:null,
      pause_time_in_sec:null,
      work_time:null
    }));
  };

  return {
    ...item,
    client_id: item?.destination?.client_id, 
    steps: resetStepFields(item?.steps),
    participants: item?.user_with_participants,
    _method: "put",
    duplicate: true,
    status: "active",
    end_time: calculateEndTime(item?.start_time),
    transcript_job_id:null,
    timezone: userTimeZone,
    delay: null,
    plan_d_actions: null,
    step_decisions: null,
    step_notes: null,
    starts_at: null,
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
};

export const handleCopy = async (
  setFormState,
  item,
  t,
  handleShow,
  setMeetingContext,
  setCheckId,
  setIsDuplicate,
  setMeeting,
  setIsLoading,
  setStatus,
  updateSteps
) => {
  try {
    const postData = generateCopyPayload(item, userTimeZone);

    const data = await copyMeetingApi(item?.id, postData);

    if (data) {
      setCheckId(data?.id);
      setFormState(data);
      setMeeting(data)
      setIsDuplicate(true);
      await getMeeting(
        data?.id,
        setMeeting,
        setIsLoading,
        setStatus,
        updateSteps
      );
      handleShow();
      setMeetingContext(data);
    } else {
      toast.error("Échec de la duplication de la réunion");
    }
  } catch (error) {
    toast.error(t("Duplication Failed, Check your Internet connection"));
  }
};

export function localizeVisibilityMessage(
  message,
  t
) {
  if (message === "Please log in to view meeting.") {
    return t("login_to_view_meeting");
  }

  return message.replace(
    /This meeting is set to private, thanks to contact (.*?) to have access/,
    `${t("private_meeting_msg")}$1 ${t("access_meeting_msg")}`
  );
}

export const timezoneSymbols = {
  "Asia/Karachi": "Asia/Karachi",
  "America/New_York": "America/New_York",
  "America/Los_Angeles": "America/Los_Angeles",
  "America/Chicago": "America/Chicago",
  "America/Denver": "America/Denver",
  "Europe/London": "Europe/London",
  "Europe/Paris": "Europe/Paris",
  "Europe/Berlin": "Europe/Berlin",
  "Europe/Madrid": "Europe/Madrid",
  "Europe/Rome": "Europe/Rome",
  "Europe/Amsterdam": "Europe/Amsterdam",
  "Europe/Brussels": "Europe/Brussels",
  "Europe/Zurich": "Europe/Zurich",
  "Europe/Stockholm": "Europe/Stockholm",
  "Europe/Oslo": "Europe/Oslo",
  "Europe/Copenhagen": "Europe/Copenhagen",
  "Europe/Vienna": "Europe/Vienna",
  "Europe/Lisbon": "Europe/Vienna",
  "Asia/Tokyo": "Asia/Tokyo",
  "Asia/Seoul": "Asia/Seoul",
  "Asia/Shanghai": "Asia/Shanghai",
  "Asia/Singapore": "Asia/Singapore",
  "Asia/Bangkok": "Asia/Bangkok",
  "Asia/Dubai": "Asia/Dubai",
  "Asia/Kolkata": "Asia/Kolkata",
  "Australia/Sydney": "Australia/Sydney",
  "Australia/Melbourne": "Australia/Melbourne",
  "Australia/Brisbane": "Australia/Brisbane",
  "Australia/Perth": "Australia/Perth",
  "Australia/Adelaide": "Australia/Adelaide",
  "America/Toronto": "America/Toronto",
  "America/Vancouver": "America/Vancouver",
  "America/Mexico_City": "America/Mexico_City",
  "America/Argentina/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo": "America/Sao_Paulo",
  "Africa/Johannesburg": "Africa/Johannesburg",
  "Africa/Ceuta": "Africa/Ceuta",
  "Europe/Moscow": "Europe/Moscow",
};

// export const getPriorityLabel = (priority) => {
//   const priorityLabels = {
//     "Obligatoire": "Provides high strategic value. Strong and direct impact on objectives.",
//     "Majeure": "Clearly contributes to achieving objectives. Significant added value.",
//     "Moyenne": "Notable impact on overall progress. Real added value, deserves attention.",
//     "Mineure": "Provides moderate value, useful for proper functioning but not decisive.",
//     "Secondary": "Low immediate added value. Consider after top priorities.",
//   };

//   return priorityLabels[priority] || "Unknown Priority"; // Fallback if priority is missing
// };
