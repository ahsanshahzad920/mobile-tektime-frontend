import { Spinner } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useActionCounterContext } from "../../../context/ActionCounterContext";
import { convertDateToUserTimezone } from "../Meeting/GetMeeting/Helpers/functionHelper";
import ErrorBoundary from "../../Utils/ErrorBoundary";

// CUSTOM HOOK:

// const useAudio = (url) => {
//   const [audio] = useState(new Audio(url));
//   const [playing, setPlaying] = useState(false);

//   const toggle = () => setPlaying(!playing);

//   useEffect(() => {
//     playing ? audio.play() : audio.pause();
//   }, [playing]);

//   useEffect(() => {
//     audio.addEventListener("ended", () => setPlaying(false));
//     return () => {
//       audio.removeEventListener("ended", () => setPlaying(false));
//     };
//   }, []);

//   return [playing, toggle];
// };

/**
 * KEY POINTS:
 * NEGATIVE TIME OF EACH STEP WILL BE STORED IN negativeTimes ARRAY that is in the Context.
 * IF THE NEGATIVE TIME FOR ACTIVE STEP EXISTS i.e. > 0 , THEN THE DURATION OF THE CENTER COUNTER WILL BE SET TO 7200 SECONDS.
 * IF THERE IS NO NEGATIVE TIME => THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE SAVED TIME OF THE ACTIVE STEP.
 * IF THERE IS NO SAVED TIME THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE TIME OF THE ACTIVE STEP.
 * IMPORTANT : COUNTER MUST BE GIVEN A KEY PROP TO RE-RENDER ITSELF WHEN THE ACTIVE STEP CHANGES OTHERWISE EVERYTHING WILL BE MESSED UP.
 *
 */
/**--------------------------------------------------------------------------------------------------- */

/**
 * CounterContainer Component
 *
 * This component renders a countdown timer container with three counters:
 * - Left Counter: Displays the scheduled start time of the meeting and provides color-coded alerts based on the meeting's start time.
 * - Center Counter: Displays the countdown timer for the active step of the meeting. If the step has negative time, it displays the negative time.
 * - Right Counter: Displays the estimated end time of the meeting based on the scheduled start time and the total duration of all steps.
 *
 * Key Functionality:
 * - Calculates the duration and color of each counter based on the active step index, meeting data, and negative times.
 * - Updates the counters dynamically based on the changing state of the meeting and step data.
 *
 * @component
 */

function formatTimeMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Add leading zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const convertHoursToSeconds = (hours) => {
  return hours * 60 * 60; // 1 hour = 60 minutes, 1 minute = 60 seconds
};
function formatTimeHHMM(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}h:${formattedMinutes}`;
}

// function formatTimeHHMM(seconds) {
//   if (isNaN(seconds) || seconds < 0) {
//     return "Invalid input";
//   }

//   const hours = Math.floor(seconds / 3600);
//   const remainingSeconds = seconds % 3600;
//   const minutes = Math.floor(remainingSeconds / 60);
//   const secs = Math.floor(remainingSeconds % 60); // Calculate remaining seconds

//   const formattedHours = String(hours).padStart(2, "0");
//   const formattedMinutes = String(minutes).padStart(2, "0");
//   const formattedSeconds = String(secs).padStart(2, "0");

//   return `${formattedHours}h:${formattedMinutes}m:${formattedSeconds}s`;
// }

const convertDaysToSeconds = (days) => {
  return days * 24 * 60 * 60; // 1 day = 24 hours, 1 hour = 60 minutes, 1 minute = 60 seconds
};
const formatTimeDDHH = (seconds) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const remainingSeconds = seconds % (24 * 60 * 60);
  const hours = Math.floor(remainingSeconds / (60 * 60));

  const formattedDays = days > 0 ? String(days).padStart(2, "0") : "00";
  const formattedHours = hours > 0 ? String(hours).padStart(2, "0") : "00";

  return `${formattedDays}d:${formattedHours}h`;
};

// LEFT DURATION:

const formatStartTime = (time) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  return `${hours}h${minutes}`;
};

/**-----------------------------------------FUNCTIONAL COMPONENT STARTS HERE... -------------------------------------------- */
const ActionCounterContainer = ({ alarm, progress, estimateTime, estimateDate }) => {
  const audioRef = useRef(null);
  // const [buzzer] = useState(new Audio(`https://tektime.io/Final-Countdown.mp3`));
  // const [audio] = useState(new Audio(`https://tektime.io/beep.WAV`));
  const [audio] = useState(
    new Audio(`https://tektime-storage.s3.eu-north-1.amazonaws.com/beep.WAV`)
  );
  const [buzzer] = useState(
    new Audio(
      `https://tektime-storage.s3.eu-north-1.amazonaws.com/Final-Countdown+(mp3cut.net)+(1).mp3`
    )
  );
  const [t] = useTranslation("global");
  const prevStepRef = useRef(false);
  const nextStepRef = useRef(false);
  const {
    activeStepIndex,
    meetingData,
    handleSetSavedTime,
    negativeTimes,
    setNegativeTimes,
    setNextActiveStep,
    setPreviousActiveStep,
    stepDelay,
    nextStepTrigger,
    previousStepTrigger,
  } = useActionCounterContext();
  const [duration, setDuration] = useState(0);
  const [initialRemainingTimeState, setInitialRemainingTimeState] = useState(0);
  const remainingTimeRef = useRef(0);
  const [totalElapsedTimeState, setTotalElapsedTimeState] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(new Date()); // will be set to the start time of the meeting. [hours,minutes]
  const [leftDuration, setLeftDuration] = useState(0);
  const [rightDuration, setRightDuration] = useState(0);
  const [currentStepDate, setCurrentStepDate] = useState(null);
  const [showNegativeCounter, setShowNegativeCounter] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isGrowing, setIsGrowing] = useState(false);
  const [centerColor, setCenterColor] = useState("#5AAFD6");
  const [redColor, setRedColor] = useState("red");
  // const [centerColor, setCenterColor] = useState('#5AAFD6');
  const [leftColor, setLeftColor] = useState("#eee");
  const [startingAlert, setStartingAlert] = useState("");
  const [startingAlertColor, setStartingAlertColor] = useState("0000");
  const [spareTimes, setSpareTimes] = useState([]);
  // Inititalize the spareTimes array with the length of the steps array. It will be used to store the spare time of each step.
  const [isPlaying, setIsPlaying] = useState(false); // Add state for playing
  const [remainingTime, setRemainingTime] = useState(null); // Add state for playing
  console.log("remainingTime", remainingTime);
  const [isOnPage, setIsOnPage] = useState(true);
  const [leavingTime, setLeavingTime] = useState(0);
  /**----------------------------------------------------------- SIDE EFFECTS ------------------------------------------------------------------------- */

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // useEffect(() => {
  //   if (meetingData) {
  //     // Assuming that the start date and step time is available in the first step
  //     const { date, starts_at } = meetingData;
  //     if (date && starts_at) {
  //       const [hours, minutes, seconds] = starts_at?.split(':').map(Number);
  //       const [year, month, day] = date?.split('-').map(Number);

  //       const startDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
  //       setMeetingStartTime(startDateTime);
  //     }
  //   }
  // }, [meetingData]);

  // const parseTimeTaken = (timeTaken) => {
  //   if (!timeTaken) {
  //     return;
  //   }
  //   let totalSeconds = 0;

  //   const parts = timeTaken.split(" - ");

  //   parts.forEach((part) => {
  //     const [value, unit] = part?.split(" ");

  //     switch (unit) {
  //       case "days":
  //       case "day":
  //         totalSeconds += parseInt(value, 10) * 86400; // 1 day = 86400 seconds
  //         break;
  //       case "hours":
  //       case "hour":
  //         totalSeconds += parseInt(value, 10) * 3600;
  //         break;
  //       case "mins":
  //       case "min":
  //         totalSeconds += parseInt(value, 10) * 60;
  //         break;
  //       case "secs":
  //       case "sec":
  //         totalSeconds += parseInt(value, 10);
  //         break;
  //       default:
  //         totalSeconds += parseInt(value, 10) * 60;
  //         break;
  //     }
  //   });

  //   return totalSeconds;
  // };

  // const calculateEndDate = (steps, currentDate, startTime) => {
  //   if (!steps || !currentDate || !startTime) {
  //     return;
  //   }

  //   let totalDurationInMinutes = 0;

  //   steps?.forEach((step) => {
  //     if (step.time_taken !== "0 sec") {
  //       const totalSeconds = parseTimeTaken(step.time_taken);
  //       totalDurationInMinutes += totalSeconds / 60;
  //     } else {
  //       totalDurationInMinutes += step.count2; // assuming count2 is in minutes
  //     }
  //   });

  //   // Combine currentDate and startTime into a single moment object
  //   const startDateTime = moment(
  //     `${currentDate} ${startTime}`,
  //     "YYYY-MM-DD HH:mm:ss"
  //   );

  //   // Add totalDurationInMinutes to the startDateTime
  //   const endDate = startDateTime.add(totalDurationInMinutes, "minutes");

  //   return endDate.format("YYYY-MM-DD");
  // };
  const parseTimeTaken = (timeTaken) => {
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

  const calculateEndDate = (steps, currentDate, startTime) => {
    if (!steps || !currentDate || !startTime) {
      return;
    }

    let totalDurationInMinutes = 0;

    steps?.forEach((step) => {
      if (step.time_taken !== "0 sec") {
        const totalSeconds = parseTimeTaken(step.time_taken);
        totalDurationInMinutes += totalSeconds / 60;
      } else {
        totalDurationInMinutes += step.count2; // assuming count2 is in minutes
      }
    });

    // Combine currentDate and startTime into a single moment object
    const startDateTime = moment(
      `${currentDate} ${startTime}`,
      "YYYY-MM-DD hh:mm:ss A" // Adjusting format to include AM/PM
    );

    // Add totalDurationInMinutes to the startDateTime
    const endDate = startDateTime.add(totalDurationInMinutes, "minutes");

    return endDate.format("YYYY-MM-DD"); // Formatting to include hours, minutes, and AM/PM
  };

  // const endDate = calculateEndDate(meeting.steps, meeting.current_date);

  //withoutTimeZOne
  // useEffect(() => {
  //   if (meetingData && meetingData?.starts_at) {
  //     const [h, m] = meetingData.starts_at.split(":").map(Number);
  //     setHours(h);
  //     setMinutes(m);
  //   }
  // }, [meetingData]);

  // withTimeZone
  useEffect(() => {
    if (meetingData?.starts_at && (meetingData?.timezone || "Europe/Paris")) {
      const meetingTimezone = meetingData.timezone;
      const userTimezone =  moment.tz.guess() 

      // Convert time from meeting's timezone to user's timezone
      const timeInMeetingTZ = moment.tz(
        meetingData.starts_at,
        "HH:mm",
        meetingTimezone
      );
      const timeInUserTZ = timeInMeetingTZ.clone().tz(userTimezone);

      // Extract hours and minutes
      setHours(timeInUserTZ.hours());
      setMinutes(timeInUserTZ.minutes());
    }
  }, [meetingData]);

  useEffect(() => {
    if (progress) return;
    // console.log(spareTimes);
    setShowNegativeCounter(false); // will update conditionally later.
    // setCenterColor()
    // Set The Duration of Center Counter.
    if (
      meetingData &&
      meetingData?.steps &&
      negativeTimes[activeStepIndex] > 0 &&
      meetingData?.steps[activeStepIndex]?.delay === null
    ) {
      setShowNegativeCounter(true);
      /**
       * setShowNegativeCounter STATE WILL BE BY DEFAULT FALSE. ON EVERY UPDATE OF STEP INDEX IT WILL BE SET TO FALSE. AND ...
       * IF THERE IS NEGATIVE TIME FOR THE ACTIVE STEP, setShowNegativeCounter WILL BE SET TO TRUE.
       * IMPORTANT:-> IF THE NEGATIVE TIME FOR ACTIVE STEP EXISTS i.e. > 0 ,
       * THEN THE DURATION OF THE CENTER COUNTER WILL BE SET TO 7200 MINUS THE NEGATIVE TIME OF THAT STEP SO THAT THE NEGATIVE TIME STARTS FROM WHERE IT LEFT
       */
      setDuration(7200 - negativeTimes[activeStepIndex]);
      return;
    }

    // IF THERE IS NO NEGATIVE TIME => THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE SAVED TIME || THE TOTAL TIME OF THE ACTIVE STEP.
    const steps = meetingData.steps;
    if (Array.isArray(steps) && steps.length > 0) {
      const step = steps[activeStepIndex];
      if (step.time_unit === "days") {
        const count2InSeconds = convertDaysToSeconds(step.time);
        setDuration(step.savedTime || count2InSeconds);
      } else if (step.time_unit === "hours") {
        const count2InSeconds = convertHoursToSeconds(step.time);
        setDuration(step.savedTime || count2InSeconds);
      } else if (step.time_unit === "seconds") {
        setDuration(step.time); // Directly set the time for seconds
      } else {
        setDuration(step.savedTime || step.time * 60);
      }

      // setDuration(step.savedTime || step.time * 60);
    }
    setCenterColor("#5AAFD6"); // reset the color of the center counter.
  }, [activeStepIndex, meetingData, progress]);

  // useEffect(() => {
  //   if (progress) return;
  //   const handleSwitch = () => {
  //     // console.log("VISIBILITY CHANGED");
  //     setIsOnPage(!isOnPage);
  //     const timeOfSwitching = moment();

  //     if (document.visibilityState === "hidden") {
  //       // console.log("Leaving Time: ", timeOfSwitching.format("hh:mm:ss"));
  //       setLeavingTime(timeOfSwitching);
  //     } else if (document.visibilityState === "visible" && leavingTime  && showNegativeCounter) {
  //       // console.log("Returning Time: ", timeOfSwitching.format("hh:mm:ss"));
  //       const timeDifferenceInSeconds = moment
  //         .duration(timeOfSwitching.diff(leavingTime))
  //         .asSeconds();
  //       // console.log("Time Difference in Seconds: ", timeDifferenceInSeconds);

  //       const ceilingTimeDifference = Math.ceil(timeDifferenceInSeconds);
  //       console.log(
  //         "Ceiling Time Difference in Seconds: ",
  //         ceilingTimeDifference
  //       );
  //       setRightDuration((prev) => {
  //         return prev + ceilingTimeDifference;
  //       }); // to re-render the right counter.
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleSwitch);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleSwitch);
  //   };
  // }, [leavingTime, progress]);

  //   const handleSwitch = () => {
  //     // console.log("VISIBILITY CHANGED");
  //     setIsOnPage(!isOnPage);
  //     const timeOfSwitching = moment();
  //     console.log('timeOfSwitching', timeOfSwitching)
  //     if (document.visibilityState === "hidden") {
  //       // console.log("Leaving Time: ", timeOfSwitching.format("hh:mm:ss"));
  //       setLeavingTime(timeOfSwitching);
  //     } else if (document.visibilityState === "visible" && leavingTime) {
  //       // console.log("Returning Time: ", timeOfSwitching.format("hh:mm:ss"));
  //       const timeDifferenceInSeconds = moment
  //         .duration(timeOfSwitching.diff(leavingTime))
  //         .asSeconds();
  //       console.log("Time Difference in Seconds: ", timeDifferenceInSeconds);

  //       const ceilingTimeDifference = Math.ceil(timeDifferenceInSeconds);
  //       console.log(
  //         "Ceiling Time Difference in Seconds: ",
  //         ceilingTimeDifference
  //       );
  //       setRightDuration((prev) => {
  //         return prev + ceilingTimeDifference;
  //       }); // to re-render the right counter.

  // const delayInSeconds = parseDelayToSeconds(stepDelay)
  // console.log('delayInSeconds', delayInSeconds)

  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleSwitch);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleSwitch);
  //     // clearInterval(intervalId); // cleanup the interval when the component unmounts

  //   };
  // }, [leavingTime, progress]);

  /**------------------------------------------------------------------------------------------------------------------------- */
  // Calculate the Estimated total time of the meeting by adding the time of each step.:->
  // useEffect(() => {
  //   if (progress) return;

  //   if (loaded === false && !meetingData) {
  //     return;
  //   }

  //   if (meetingData && loaded === false) {
  //     setSpareTimes(new Array(meetingData.steps.length).fill(0));

  //     const totalTimesArray = meetingData?.steps?.map((step) => {
  //       const time = parseInt(step.time);
  //       const savedTime = step.savedTime ? parseInt(step.savedTime) : 0;
  //       let elapsedTime = time - savedTime;

  //       switch (step.time_unit) {
  //         case "hours":
  //           elapsedTime *= 3600;
  //           break;
  //         case "seconds":
  //           // No change needed
  //           break;
  //         default:
  //           elapsedTime *= 60; // Assumes "minutes" if not hours or seconds
  //           break;
  //       }
  //       return elapsedTime;
  //     });

  //     const totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
  //     setRightDuration(totalTime);
  //     setLoaded(true);
  //   }
  // }, [meetingData, loaded, progress]);
  // useEffect(() => {
  //   if (progress) return;

  //   if (loaded === false && !meetingData) {
  //     return;
  //   }

  //   if (meetingData && loaded === false) {
  //     setSpareTimes(new Array(meetingData.steps.length).fill(0));

  //     const totalTimesArray = meetingData?.steps?.map((step) => {
  //       const timeInSeconds = parseInt(step.time);
  //       const count2InSeconds = parseInt(step.count2);
  //       let elapsedTime;

  //       // Determine elapsed time based on saved time, if available
  //       if (!step.savedTime) {
  //         elapsedTime = timeInSeconds + count2InSeconds;
  //       } else {
  //         const savedTimeInSeconds = parseInt(step.savedTime);
  //         elapsedTime = timeInSeconds - savedTimeInSeconds + count2InSeconds;
  //       }

  //       // Convert elapsed time to seconds based on the time unit
  //       switch (step.time_unit) {
  //         case "hours":
  //           return elapsedTime * 3600;
  //         case "seconds":
  //           return elapsedTime;
  //         default:
  //           return elapsedTime; // Default to minutes
  //       }
  //     });

  //     let totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
  //     setRightDuration(totalTime);
  //     setLoaded(true);
  //   }
  // }, [meetingData, loaded, progress]);

  useEffect(() => {
    if (progress) return;

    // SET RIGHT DURATION i.e., the time when the meeting will end.:
    if (loaded === false && !meetingData) {
      // For only one time:
      return;
    }
    if (meetingData && loaded === false) {
      //------ Initializing here! ------
      setSpareTimes(new Array(meetingData.steps.length).fill(0));
      //-------
      const totalTimesArray = meetingData?.steps?.map((step) => {
        if (!step.savedTime) {
          let count2InSeconds;
          // Convert based on time_unit
          switch (step.time_unit) {
            case "hour":
            case "hours":
              count2InSeconds = parseInt(step.count2) * 3600;
              break;
            case "minute":
            case "minutes":
              count2InSeconds = parseInt(step.count2) * 60;
              break;
            case "second":
            case "seconds":
              count2InSeconds = parseInt(step.count2);
              break;
            default:
              count2InSeconds = parseInt(step.time) * 60; // Default case: Convert `time` to seconds by assuming minutes
          }
          return count2InSeconds;
        }
        let elapsedTime = parseInt(step.time) - parseInt(step.savedTime);
        // console.log("ELAPSED TIME: ", elapsedTime);
        return parseInt(step.time) - parseInt(elapsedTime);
      });

      // console.log("TOTAL TIMES ARRAY: ", totalTimesArray);
      let totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
      /**
       * HERE WE NEED TO SUBTRACT THE LAST STEP TIME FROM THE TOTAL TIME OF THE MEETING. as per client's requirement.
       * Which is obviuosly a stupid requirement. But we have to do it. So If by any chance, you need to remove this subtraction,
       * then you can remove it. But I am keeping it here for now. Remember, this is a temporary JUGAR and an imperfection to the functionality.
       *  */
      // const lastStepTime = totalTimesArray[totalTimesArray.length - 1];
      // totalTime = totalTime - lastStepTime;
      setRightDuration(totalTime);
      setLoaded(true);
    }
  }, [meetingData, loaded, progress]);

  const stopAudio = () => {
    buzzer.pause(); // Pause the buzzer audio
    buzzer.currentTime = 0; // Reset the playback position to start
  };

  // const intervalRef = useRef(null);
  // useEffect(() => {
  //   if (progress) {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //     return;
  //   }

  //   intervalRef.current = setInterval(() => {
  //     // Logic to update your counter goes here
  //   }, 1000); // Adjust the interval time as needed

  //   return () => {
  //     clearInterval(intervalRef.current);
  //   };
  // }, [progress]);
  // Handlers:
  const [buzzerPlayed, setBuzzerPlayed] = useState(false);
  const playAudio = () => {
    audio.play().catch((err) => {
      console.log("err", err);
    });
  };

  const playBuzzer = () => {
    buzzer.play().catch((err) => {
      console.log("err", err);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (meetingData) {
      if (remainingTime <= 5 && remainingTime > 1 && alarm === true) {
        playAudio();
      } else if (
        remainingTime === 0 &&
        alarm === true &&
        meetingData?.steps[activeStepIndex]?.negative_time !== "99"
      ) {
        playBuzzer();
        setBuzzerPlayed(true);
      }
    }
  }, [remainingTime]);

  useEffect(() => {
    if (progress) return;

    if (nextStepRef.current) {
      stopAudio();
      // console.log("EFFECT RAN FOR NEXT STEP");
      // console.log("ACTIVE STEP INDEX: ", activeStepIndex);
      const spareTimeToBeSubtracted = spareTimes[activeStepIndex - 1];

      // console.log("Right Duration: ", rightDuration);
      // console.log("Right Duration after Subtraction: ", rightDuration - spareTimeToBeSubtracted);
      // console.log("SPARE TIMES ARRAY: ", spareTimes);
      setRightDuration((prev) => {
        return prev - spareTimeToBeSubtracted;
      });
    }
    return () => {
      nextStepRef.current = true;
    };
  }, [nextStepTrigger, progress]);

  useEffect(() => {
    if (progress) return;

    if (prevStepRef.current) {
      stopAudio();

      // console.log("EFFECT RAN FOR PREVIOUS STEP");
      // console.log("ACTIVE STEP INDEX: ", activeStepIndex);
      const spareTimeToBeAdded = spareTimes[activeStepIndex];
      // If you do activeStepIndex - 1 or +1 . The calculation will be Fucked up. SO Better keep it that way. It works fine this way.

      // console.log("SPARE TIMES ARRAY: ", spareTimes);
      // console.log("Right Duration: ", rightDuration);
      // console.log("Right Duration after Adding: ", rightDuration + spareTimeToBeAdded);

      setRightDuration((prev) => {
        return prev + spareTimeToBeAdded;
      });
    }

    return () => {
      prevStepRef.current = true;
    };
  }, [previousStepTrigger, progress]);

  /**------------------------------------------------------------------------------------------------------------------------- */

  const getLeftColors = async (meetingData) => {
    const green = "#39FF14";
    // const red = "#FF0000";
    const red = "url(#your-unique-id2)";
    const orange = "#f67913";

    // const scheduledMinutes = parseInt(meetingData.start_time.split(":")[1], 10);
    // console.log("Scheduled minutes: ", scheduledMinutes);
    // const minutes = meetingStartTime.getMinutes();
    // console.log("minutes: ", minutes);
    // let delay = minutes - scheduledMinutes;
    // console.log("delay: ", delay);
    // Convert start_time and start_at to Date objects

    if (meetingData) {
      const [startHours, startMinutes] = meetingData?.start_time
        ?.split(":")
        .map(Number);
      const [startAtHours, startAtMinutes] = meetingData?.starts_at
        ?.split(":")
        .map(Number);

      // Create Date objects for the meeting time
      const meetingStartTime = new Date();
      meetingStartTime.setHours(startHours, startMinutes, 0, 0);

      const actualStartTime = new Date();
      actualStartTime.setHours(startAtHours, startAtMinutes, 0, 0);

      // Calculate the delay in minutes
      const delayInMilliseconds = actualStartTime - meetingStartTime;
      const delay = Math.floor(delayInMilliseconds / 60000); // Convert milliseconds to minutes

      /**
       * FOLLOWING CODE EXPLANATION:
       * IF THE MEETING STARTED EARLY, THE LEFT COUNTER WILL BE GREEN.
       * IF THE MEETING STARTED LATE, BUT THE DIFFERENCE BETWEEN TIME IS UP TO 5 MINUTES, THEN THE LEFT COUNTER WILL BE ORANGE.
       * IF THE MEETING STARTED LATE, AND THE DIFFERENCE IS GREATER THAN 5 MINUTES, THEN THE LEFT COUNTER WILL BE RED.
       */

      // Set alerts and colors based on delay
      if (delay === 0) {
        setStartingAlert(`${t("The meeting started on time.")}`);
        setStartingAlertColor("transparent");
        setLeftColor(green);
      } else if (delay > 0) {
        if (delay === 1) {
          setStartingAlert(
            `${t("The meeting started with")} ${delay} ${t("minute late.")}`
          );
          setStartingAlertColor(orange);
          setLeftColor(orange);
        } else if (delay <= 5) {
          setStartingAlert(
            `${t("The meeting started with")} ${delay} ${t("minutes late.")}`
          );
          setStartingAlertColor(orange);
          setLeftColor(orange);
        } else {
          setStartingAlert(
            `${t("The meeting started with")} ${delay} ${t("minutes late.")}`
          );
          setStartingAlertColor(red);
          setLeftColor(red);
        }
      } else {
        const delayMinutes = Math.abs(delay); // Convert to positive for early starts
        setStartingAlert(
          `${t("The meeting started with")} ${delayMinutes} ${t(
            "minutes in advance."
          )}`
        );
        setStartingAlertColor(green);
        setLeftColor(green);
      }
    }
  };

  useEffect(() => {
    if (meetingData) getLeftColors(meetingData);
  }, [meetingData]);

  // const formatDelay = (delay) => {
  //   if(!delay){
  //     return
  //   }
  //   const parts = delay.split(":");

  //   // Check if the days part is "00d" and remove it if true
  //   if (parts[0] === "00d") {
  //     parts.shift(); // Remove the first element (days part)
  //   }

  //   // Join the remaining parts back into a string
  //   return parts.join(":");
  // };
  // const formatDelay = (delay,time_unit) => {
  //   if (!delay || !time_unit) {
  //     return;
  //   }

  //   // Remove all negative signs from the delay string
  //   delay = delay.replace(/-/g, "");

  //   const parts = delay.split(":");

  //   // Check if the parts contain "00h" or "00m" and remove them
  //   const filteredParts = parts.filter(part => !part.startsWith("00"));

  //   // Join the remaining parts back into a string
  //   return filteredParts.join(":");
  // };
  const formatDelay = (delay) => {
    if (!delay) {
      return;
    }

    // Remove all negative signs from the delay string
    delay = delay.replace(/-/g, "");

    const parts = delay.split(":");

    // // Check if the parts contain "00h" or "00m" and remove them
    // const filteredParts = parts.filter(part => !part.startsWith("00"));

    // // Join the remaining parts back into a string
    // return filteredParts.join(":");
    // Extract the individual components
    const [days, hours, minutes, seconds] = parts?.map((part) =>
      parseInt(part, 10)
    );

    if (days > 0) {
      return `${days}d:${hours}h`;
    } else if (hours > 0) {
      return `${hours}h:${minutes}m`;
    } else {
      return `${minutes}m:${seconds}s`;
    }
  };

  // const formattedDelay = formatDelay(meetingData?.delay);
  const activeStepDelay = meetingData && meetingData?.steps && stepDelay?.delay;

  // const formatTime = (timeString) => {
  //   // Extract hours and minutes from the time string
  //   const [hours, minutes] = timeString.split(":");

  //   return `${hours}h${minutes}`;
  // };
  //With Timezone
  const formatTime = (dateTimeString, meetingTimezone) => {
    if (!dateTimeString || !meetingTimezone) return null;

    const cleanDateTimeString = dateTimeString.split(".")[0]; // Removes milliseconds and 'Z' // I have to remove this Z because it takes it as a UTC

    const userTimezone =  moment.tz.guess() || "Europe/Paris";

    const timeInMeetingTZ = moment.tz(cleanDateTimeString, meetingTimezone);
    const timeInUserTZ = timeInMeetingTZ.clone().tz(userTimezone);

    return `${timeInUserTZ.format("HH")}h${timeInUserTZ.format("mm")}`;
  };

  const estimatedTime =
    meetingData && meetingData.steps && stepDelay?.estimate_time?.split("T")[1];

  const estimatedEndDate =
    meetingData && meetingData.steps && stepDelay?.estimate_time?.split("T")[0];

  const estimateDateTime =
    meetingData && meetingData.steps && stepDelay?.estimate_time;

  const EstimatedEndDateWithTimezone = convertDateToUserTimezone(
    estimatedEndDate,
    estimatedTime,
    meetingData?.timezone
  );

  const formattedTime = estimatedTime
    ? formatTime(estimateDateTime, meetingData?.timezone|| "Europe/Paris")
    : "";

  const formattedDelay = formatDelay(activeStepDelay);

  // const convertDurationToSeconds = (duration) => {
  //   // Regular expression to match the pattern
  //   const regex = /(\d+)d:(\d+)h:(\d+)m:(\d+)s/;
  //   const match = duration.match(regex);

  //   if (!match) {
  //     throw new Error('Invalid duration format');
  //   }

  //   const [, days, hours, minutes, seconds] = match.map(Number);

  //   // Convert everything to seconds
  //   const totalSeconds = (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;

  //   return totalSeconds;
  // };

  // const totalDelayInSeconds = convertDurationToSeconds(stepDelay);
  // console.log('totalDelayInSeconds', totalDelayInSeconds)

  return (
    <ErrorBoundary>
      <div className="counter-container d-flex align-items-center flex-column">
        {/* <h5 className="remainingTime text-center">
              play after: {meetingData?.delay }
            </h5> */}
        <div className="d-flex justify-content-center align-items-center ">
          {/* LEFT COUNTER */}
          <div className="d-flex  flex-column pt-4 ">
            <CountdownCircleTimer
              size={100}
              strokeWidth={5}
              isPlaying={false}
              duration={0}
              colors={leftColor}
            >
              {/* INSIDE LEFT COUNTER */}
              {({ remainingTime }) => {
                return (
                  <>
                    {meetingData?.type === "Action1" ||
                    meetingData?.type === "Newsletter" ? (
                      <div className="justify-content-center flex-column d-flex align-items-center">
                        <span className="start-at" style={{ fontSize: "10px" }}>
                          {t("Start At")}
                        </span>
                        <span className="start-at" style={{ fontSize: "12px" }}>
                          {convertDateToUserTimezone(
                            meetingData?.current_date,
                            meetingData?.starts_at,
                            meetingData?.timezone || "Europe/Paris"
                          )}
                          {/* {meetingData?.current_date} */}
                        </span>
                      </div>
                    ) : (
                      <div className="justify-content-center flex-column d-flex align-items-center">
                        <span
                          className="start-at"
                          style={{
                            fontSize: "10px",
                          }}
                        >
                          {/* {meetingData?.current_date} */}
                          {convertDateToUserTimezone(
                            meetingData?.current_date,
                            meetingData?.starts_at,
                            meetingData?.timezone || "Europe/Paris"
                          )}
                        </span>
                        <span className="start-at" style={{ fontSize: "10px" }}>
                          {t("Start At")}
                        </span>
                        {hours}h{minutes > 9 ? minutes : "0" + minutes}
                        {/* {meetingStartTime.getHours()}h
                      {meetingStartTime.getMinutes() > 10
                        ? meetingStartTime.getMinutes()
                        : "0" + meetingStartTime.getMinutes()} */}
                        {/* : + meetingStartTime.getMinutes()} */}
                      </div>
                    )}
                  </>
                );
              }}
            </CountdownCircleTimer>
            {meetingData?.delay ? (
              <>
                <p
                  className="starting-alert"
                  style={{
                    color: "white",
                  }}
                >
                  {startingAlert}
                </p>
              </>
            ) : (
              <p
                className="starting-alert"
                style={{
                  color: startingAlertColor,
                }}
              >
                {startingAlert}
              </p>
            )}
          </div>

          {/* -------------------> CENTER COUNTER <--------------------------------------------------------------------------------------------- */}

          <div className="d-flex flex-column pb-5">
            {alarm === true ? (
              <div className="remainingTime text-center">
                <p style={{ fontSize: "15px" }}>
                  {t("alarm.alarmByStep")}
                  <br /> {t("alarm.active")}
                </p>
              </div>
            ) : (
              <div className="pb-3"></div>
            )}
            {meetingData &&
            meetingData?.steps &&
            meetingData?.steps[activeStepIndex].negative_time === "99" ? (
              <>
                <CountdownCircleTimer
                  key={activeStepIndex}
                  size={130}
                  strokeWidth={5}
                  isPlaying={false}
                  // isPlaying={showNegativeCounter && meetingData?.steps[activeStepIndex].negative_time === '99' ? false : true}
                  // duration={duration}
                  // isGrowing={isGrowing}
                  // onComplete={(totalElapsedTime) => {
                  //   if (alarm === "1") {
                  //     // PLAY BUZZER AUDIO:
                  //     buzzer.play().catch((err) => {
                  //     });
                  //   }
                  //   // When Positive Counter is Completed:
                  //   setTotalElapsedTimeState(totalElapsedTime);
                  // setShowNegativeCounter(true);
                  // remainingTimeRef.current = 0;
                  // setDuration(7200 + totalElapsedTime); // if totalElapsedTime is not added, the negative counter will start from -duration seconds.
                  // }}
                  onUpdate={(remainingTime) => {
                    //   // BEEPING SOUND WHEN LAST 10 SECONDS ARE LEFT:
                    //   if (
                    //     remainingTime < 5 &&
                    //     remainingTime > 0 &&
                    //     alarm === "1"
                    //   ) {
                    //     playAudio();
                    //   }
                    //   setSpareTimes((prev) => {
                    //     if (showNegativeCounter) {
                    //       let timesArray = [...prev];
                    //       timesArray[activeStepIndex] = 0;
                    //       return timesArray;
                    //     } // if the counter is negative, don't update the spare times.
                    //     let timesArray = [...prev];
                    //     timesArray[activeStepIndex] = remainingTime;
                    //     return timesArray;
                    //   });
                    // setCenterColor(centerColor);
                    //   // if (showNegativeCounter) {
                    //   setRightDuration((prev) => {
                    //     return prev + 1;
                    //   });
                    //   //   setNegativeTimes((prev) => {
                    //   //     let timesArray = [...prev];
                    //   //     timesArray[activeStepIndex] =
                    //   //       7200 - remainingTimeRef.current;
                    //   //     return timesArray;
                    //   //   });
                    //   //   return;
                    //   // }
                    //   // handleSetSavedTime(remainingTime);
                  }}
                  colors={redColor}
                >
                  {/* INSIDE  of the Center Counter */}
                  {({ remainingTime }) => {
                    remainingTimeRef.current = remainingTime;
                    return (
                      <div className="justify-content-center flex-column d-flex align-items-center">
                        <h5
                          className="meeting-counter"
                          style={{ fontSize: "20px" }}
                        >
                          - {meetingData && formattedDelay}
                        </h5>
                        {/* <h6>min</h6> */}
                      </div>
                    );
                  }}
                </CountdownCircleTimer>
              </>
            ) : (
              <CountdownCircleTimer
                key={activeStepIndex}
                size={130}
                strokeWidth={5}
                isPlaying={true}
                // isPlaying={showNegativeCounter && meetingData?.steps[activeStepIndex].negative_time === '99' ? false : true}
                duration={duration}
                // isGrowing={isGrowing}
                onComplete={(totalElapsedTime) => {
                  if (alarm === true && !buzzerPlayed && remainingTime == 0) {
                    // // PLAY BUZZER AUDIO:
                    buzzer.play().catch((err) => {
                      // console.log("err", err);
                    });
                  }
                  // When Positive Counter is Completed:
                  setTotalElapsedTimeState(totalElapsedTime);
                  setShowNegativeCounter(true);
                  remainingTimeRef.current = 0;
                  setDuration(7200 + totalElapsedTime); // if totalElapsedTime is not added, the negative counter will start from -duration seconds.
                }}
                onUpdate={(remainingTime) => {
                  // BEEPING SOUND WHEN LAST 10 SECONDS ARE LEFT:
                  setRemainingTime(remainingTime);
                  if (
                    remainingTime < 5 &&
                    remainingTime > 0 &&
                    alarm === true
                  ) {
                    // playAudio();
                  }

                  setSpareTimes((prev) => {
                    if (showNegativeCounter) {
                      let timesArray = [...prev];
                      timesArray[activeStepIndex] = 0;
                      return timesArray;
                    } // if the counter is negative, don't update the spare times.
                    let timesArray = [...prev];
                    timesArray[activeStepIndex] = remainingTime;
                    return timesArray;
                  });

                  if (showNegativeCounter) {
                    setCenterColor("red");
                    setRightDuration((prev) => {
                      return prev + 1;
                    });
                    setNegativeTimes((prev) => {
                      let timesArray = [...prev];
                      timesArray[activeStepIndex] =
                        7200 - remainingTimeRef.current;
                      return timesArray;
                    });

                    return;
                  }
                  //                   else{
                  //                     // setRightDuration((prev) => {
                  //                     //   return prev - 1;
                  //                     // });
                  //                     const minutesElapsed = Math.floor((duration - remainingTime) / 60);
                  // console.log('Duration:', duration);
                  // console.log('Remaining Time:', remainingTime);
                  // console.log('Minutes Elapsed:', minutesElapsed);
                  // console.log('Previous Minutes Elapsed:', prevMinutesElapsedRef.current);

                  // if (minutesElapsed >= 1) {
                  //   setRightDuration((prev) => prev - 1);
                  //   prevMinutesElapsedRef.current = minutesElapsed;
                  // }
                  //                   }
                  handleSetSavedTime(remainingTime);
                }}
                colors={showNegativeCounter ? "red" : "#5AAFD6"}
              >
                {/* INSIDE  of the Center Counter */}
                {({ remainingTime }) => {
                  {
                    /* getLeftColors(); */
                  }
                  remainingTimeRef.current = remainingTime;
                  return showNegativeCounter ? (
                    <div className="justify-content-center flex-column d-flex align-items-center">
                      <h3>
                        -
                        {(() => {
                          const formattedNegativeTime = remainingTime - 7200;
                          return formatTimeMMSS(-1 * formattedNegativeTime);
                        })()}
                      </h3>
                      <h6>min</h6>
                    </div>
                  ) : (
                    <div>
                      {/* <h3>{formatTimeMMSS(remainingTime)}</h3> */}
                      <h3>
                        {meetingData &&
                        meetingData.steps &&
                        meetingData?.steps[activeStepIndex]?.time_unit ===
                          "days"
                          ? formatTimeDDHH(remainingTime)
                          : meetingData &&
                            meetingData?.steps &&
                            meetingData?.steps[activeStepIndex]?.time_unit ===
                              "hours"
                          ? formatTimeHHMM(remainingTime)
                          : formatTimeMMSS(remainingTime)}
                      </h3>
                    </div>
                  );
                }}
              </CountdownCircleTimer>
            )}
            <h5 className="remainingTime text-center meeting-counter mt-2">
              {t("Remaining time of stage")}
            </h5>
          </div>
          <div>
            <audio ref={audioRef} src="/public/Assets/beep.wav" id="beep" />
          </div>
          {/* RIGHT COUNTER */}

          <div className="d-flex flex-column justify-content-center pb-5">
            <CountdownCircleTimer
              colors="url(#your-unique-id)"
              duration={rightDuration}
              size={100}
              strokeWidth={4}
              onComplete={(totalElapsedTime) => [totalElapsedTime > 0]}
            >
              {({ remainingTime }) => {
                return (
                  <>
                    <div>
                      {/* {remainingTime} */}
                      {(() => {
                        const estimatedTime =
                          meetingStartTime.getTime() + rightDuration * 1000;
                        // console.log('estimated time:', estimatedTime)
                        // Explanation of Above lie: The meetingStartTime is the time when the meeting will start
                        const time = new Date(estimatedTime);

                        const formattedHours = (time) => {
                          return (
                            time.getHours().toString().padStart(2, "0") +
                            "h" +
                            time.getMinutes().toString().padStart(2, "0")
                          );
                        };
                        // const time = new Date(estimatedTime);
                        // console.log("time:", time);
                        return (
                          <>
                            {meetingData?.type === "Action1" ||
                            meetingData?.type === "Newsletter" ? (
                              <div className="d-flex justify-content-center align-items-center flex-column">
                                <span
                                  className="start-at"
                                  style={{
                                    fontSize: "10px",
                                  }}
                                >
                                  {t("Estimated End At")}
                                </span>
                                <span
                                  className="start-at"
                                  style={{
                                    fontSize: "12px",
                                  }}
                                >
                                  {/* {calculateEndDate(
                                    meetingData?.steps,
                                    meetingData?.current_date
                                  )} */}
                                  {(meetingData &&
                                    meetingData?.steps &&
                                    meetingData?.steps[activeStepIndex]
                                      ?.delay) ||
                                  negativeTimes[activeStepIndex] > 0
                                    ? estimatedEndDate
                                    : estimateDate}
                                </span>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-center align-items-center flex-column">
                                <span
                                  className="start-at"
                                  style={{
                                    fontSize: "10px",
                                  }}
                                >
                                  {(meetingData &&
                                    meetingData?.steps &&
                                    meetingData?.steps[activeStepIndex]
                                      ?.delay) ||
                                  negativeTimes[activeStepIndex] > 0
                                    ? EstimatedEndDateWithTimezone
                                    : estimateDate}
                                  {/* {estimateDate ? estimateDate : estimatedEndDate? estimatedEndDate : calculateEndDate(
                                    meetingData?.steps,
                                    meetingData?.current_date,
                                    meetingData?.start_time
                                  )} */}
                                </span>
                                {/* <div> */}
                                <span
                                  className="start-at"
                                  style={{
                                    fontSize: "10px",
                                  }}
                                >
                                  {t("Estimated End At")}
                                </span>
                                {/* </div> */}
                                <h5 className="meeting-counter">
                                  {(meetingData &&
                                    meetingData?.steps &&
                                    meetingData?.steps[activeStepIndex]
                                      ?.delay) ||
                                  negativeTimes[activeStepIndex] > 0
                                    ? formattedTime
                                    : estimateTime}
                                </h5>
                                {/* <h5>{formattedTime ? formattedTime : formattedHours(time)}</h5> */}
                                {/* <h5>{formattedHours(time)}</h5> */}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </>
                );
              }}
            </CountdownCircleTimer>

            <section></section>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="d-flex justify-content-center gap-2 align-items-center "></div>
      </div>
    </ErrorBoundary>
  );
};

//With stop timer button
// const CounterContainer = ({ alarm, progress }) => {
//   console.log('showProgressBar', progress);
//   const audioRef = useRef(null);
//   const [audio] = useState(new Audio(`https://exoux.com/beep.WAV`));
//   const [buzzer] = useState(new Audio(`https://exoux.com/Final-Countdown%20(mp3cut.net).mp3`));
//   const [t] = useTranslation("global");
//   const prevStepRef = useRef(false);
//   const nextStepRef = useRef(false);
//   const {
//     activeStepIndex,
//     meetingData,
//     handleSetSavedTime,
//     negativeTimes,
//     setNegativeTimes,
//     setNextActiveStep,
//     setPreviousActiveStep,
//     nextStepTrigger,
//     previousStepTrigger,
//   } = useCounterContext();
//   const [duration, setDuration] = useState(0);
//   const [initialRemainingTimeState, setInitialRemainingTimeState] = useState(0);
//   const remainingTimeRef = useRef(0);
//   const [totalElapsedTimeState, setTotalElapsedTimeState] = useState(0);
//   const [meetingStartTime, setMeetingStartTime] = useState(new Date());
//   const [leftDuration, setLeftDuration] = useState(0);
//   const [rightDuration, setRightDuration] = useState(0);
//   const [showNegativeCounter, setShowNegativeCounter] = useState(false);
//   const [loaded, setLoaded] = useState(false);
//   const [isGrowing, setIsGrowing] = useState(false);
//   const [centerColor, setCenterColor] = useState("#5AAFD6");
//   const [leftColor, setLeftColor] = useState("#eee");
//   const [startingAlert, setStartingAlert] = useState("");
//   const [startingAlertColor, setStartingAlertColor] = useState("0000");
//   const [spareTimes, setSpareTimes] = useState([]);
//   const [isOnPage, setIsOnPage] = useState(true);
//   const [leavingTime, setLeavingTime] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false); // Add state for playing

//   useEffect(() => {
//     if (progress) return;
//     setShowNegativeCounter(false);
//     if (negativeTimes[activeStepIndex] > 0) {
//       setShowNegativeCounter(true);
//       setDuration(7200 - negativeTimes[activeStepIndex]);
//       return;
//     }
//     const steps = meetingData.steps;
//     if (Array.isArray(steps) && steps.length > 0) {
//       const step = steps[activeStepIndex];
//       setDuration(step.savedTime || step.time * 60);
//     }
//     setCenterColor("#5AAFD6");
//   }, [activeStepIndex, meetingData, progress]);

//   useEffect(() => {
//     if (progress) return;
//     const handleSwitch = () => {
//       setIsOnPage(!isOnPage);
//       const timeOfSwitching = moment();

//       if (document.visibilityState === "hidden") {
//         setLeavingTime(timeOfSwitching);
//       } else if (document.visibilityState === "visible" && leavingTime) {
//         const timeDifferenceInSeconds = moment.duration(timeOfSwitching.diff(leavingTime)).asSeconds();
//         const ceilingTimeDifference = Math.ceil(timeDifferenceInSeconds);
//         setRightDuration((prev) => prev + ceilingTimeDifference);
//       }
//     };

//     document.addEventListener("visibilitychange", handleSwitch);

//     return () => {
//       document.removeEventListener("visibilitychange", handleSwitch);
//     };
//   }, [leavingTime, progress]);

//   useEffect(() => {
//     if (progress) return;

//     if (loaded === false && !meetingData) return;
//     if (meetingData && loaded === false) {
//       setSpareTimes(new Array(meetingData.steps.length).fill(0));
//       const totalTimesArray = meetingData?.steps?.map((step) => {
//         if (!step.savedTime) return parseInt(step.time) * 60;
//         let elapsedTime = parseInt(step.time) - parseInt(step.savedTime);
//         return parseInt(step.time) - parseInt(elapsedTime);
//       });

//       let totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
//       setRightDuration(totalTime);
//       setLoaded(true);
//     }
//   }, [meetingData, loaded, progress]);

//   const stopAudio = () => {
//     buzzer.pause();
//     buzzer.currentTime = 0;
//   };

//   const intervalRef = useRef(null);
//   useEffect(() => {
//     if (progress) {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//       return;
//     }

//     if (isPlaying) {
//       intervalRef.current = setInterval(() => {}, 1000);
//     }

//     return () => {
//       clearInterval(intervalRef.current);
//     };
//   }, [progress, isPlaying]);

//   useEffect(() => {
//     if (progress) return;

//     if (nextStepRef.current) {
//       stopAudio();
//       const spareTimeToBeSubtracted = spareTimes[activeStepIndex - 1];
//       setRightDuration((prev) => prev - spareTimeToBeSubtracted);
//     }
//     return () => {
//       nextStepRef.current = true;
//     };
//   }, [nextStepTrigger, progress]);

//   useEffect(() => {
//     if (progress) return;

//     if (prevStepRef.current) {
//       stopAudio();
//       const spareTimeToBeAdded = spareTimes[activeStepIndex];
//       setRightDuration((prev) => prev + spareTimeToBeAdded);
//     }

//     return () => {
//       prevStepRef.current = true;
//     };
//   }, [previousStepTrigger, progress]);

//   const playAudio = () => {
//     audio.play().catch((err) => {});
//   };

//   const getLeftColors = async (meetingData) => {
//     const green = "#39FF14";
//     const red = "url(#your-unique-id2)";
//     const orange = "#f67913";
//     const scheduledMinutes = parseInt(meetingData.start_time.split(":")[1], 10);
//     const minutes = meetingStartTime.getMinutes();
//     let delay = minutes - scheduledMinutes;

//     if (delay === 0 || delay === 1) {
//       setStartingAlert(` ${t("The meeting started with")} ${delay} ${t("Minutes in Advance")}.`);
//       setStartingAlertColor("transparent");
//       setLeftColor(green);
//       return;
//     }
//     if (delay > 1 && delay <= 5) {
//       setStartingAlert(` ${t("The meeting started with")} ${delay} ${t("Minutes in Advance")}.`);
//       setStartingAlertColor(orange);
//       setLeftColor(orange);
//       return;
//     }
//     if (delay > 5) {
//       setStartingAlert(` ${t("The meeting started with")} ${delay} ${t("Minutes in Advance")}.`);
//       setStartingAlertColor(red);
//       setLeftColor(red);
//       return;
//     }
//     if (delay < 0) {
//       const delayMinutes = -1 * delay;
//       setLeftColor(green);
//       setStartingAlertColor(green);
//       setStartingAlert(` ${t("The meeting started with")} ${delayMinutes} ${t("Minutes in Advance")}.`);
//     }
//   };

//   useEffect(() => {
//     if (meetingData) getLeftColors(meetingData);
//   }, [meetingData]);

//   return (
//     <ErrorBoundary>
//       <div className="counter-container">
//         <div className="d-flex justify-content-center align-items-center">
//           <div className="d-flex flex-column pt-4">
//             <CountdownCircleTimer
//               size={100}
//               strokeWidth={5}
//               isPlaying={false}
//               duration={0}
//               colors={leftColor}
//             >
//               {({ remainingTime }) => (
//                 <div className="justify-content-center flex-column d-flex align-items-center">
//                   <span className="start-at">{t("Start At")}</span>
//                   {meetingStartTime.getHours()}h
//                   {meetingStartTime.getMinutes() > 10
//                     ? meetingStartTime.getMinutes()
//                     : "0" + meetingStartTime.getMinutes()}
//                 </div>
//               )}
//             </CountdownCircleTimer>
//             <p className="starting-alert" style={{ color: startingAlertColor }}>
//               {startingAlert}
//             </p>
//           </div>

//           <div className="d-flex flex-column pb-5">
//             {alarm === "1" ? (
//               <div className="remainingTime text-center">
//                 <p style={{ fontSize: "15px" }}>
//                   Alarme par étape
//                   <br /> activée
//                 </p>
//               </div>
//             ) : (
//               <div className="pb-3"></div>
//             )}
//             <CountdownCircleTimer
//               key={activeStepIndex}
//               size={130}
//               strokeWidth={5}
//               isPlaying={isPlaying}
//               duration={duration}
//               onComplete={(totalElapsedTime) => {
//                 if (alarm === "1") {
//                   buzzer.play().catch((err) => {});
//                 }
//                 setTotalElapsedTimeState(totalElapsedTime);
//                 setShowNegativeCounter(true);
//                 remainingTimeRef.current = 0;
//                 setDuration(7200 + totalElapsedTime);
//               }}
//               onUpdate={(remainingTime) => {
//                 if (remainingTime < 5 && remainingTime > 0 && alarm === "1") {
//                   playAudio();
//                 }
//                 setSpareTimes((prev) => {
//                   if (showNegativeCounter) {
//                     let timesArray = [...prev];
//                     timesArray[activeStepIndex] = 0;
//                     return timesArray;
//                   }
//                   let timesArray = [...prev];
//                   timesArray[activeStepIndex] = remainingTime;
//                   return timesArray;
//                 });

//                 if (showNegativeCounter) {
//                   setCenterColor("url(#your-unique-id2)");
//                   setRightDuration((prev) => prev + 1);
//                   setNegativeTimes((prev) => {
//                     let timesArray = [...prev];
//                     timesArray[activeStepIndex] = 7200 - remainingTimeRef.current;
//                     return timesArray;
//                   });

//                   return;
//                 }
//                 handleSetSavedTime(remainingTime);
//               }}
//               colors={centerColor}
//             >
//               {({ remainingTime }) => {
//                 remainingTimeRef.current = remainingTime;
//                 return showNegativeCounter ? (
//                   <div className="justify-content-center flex-column d-flex align-items-center">
//                     <h3>
//                       -
//                       {(() => {
//                         const formattedNegativeTime = remainingTime - 7200;
//                         return formatTimeMMSS(-1 * formattedNegativeTime);
//                       })()}
//                     </h3>
//                     <h6>min</h6>
//                   </div>
//                 ) : (
//                   <div>
//                     <h3>{formatTimeMMSS(remainingTime)}</h3>
//                   </div>
//                 );
//               }}
//             </CountdownCircleTimer>
//             <h5 className="remainingTime text-center">
//               {t("Remaining time of stage")}
//             </h5>
//           </div>
//           <div>
//             <audio ref={audioRef} src="/public/Assets/beep.wav" id="beep" />
//           </div>

//           <div className="d-flex flex-column justify-content-center pb-5">
//             <CountdownCircleTimer
//               colors="url(#your-unique-id)"
//               duration={rightDuration}
//               size={100}
//               strokeWidth={4}
//               onComplete={(totalElapsedTime) => [totalElapsedTime > 0]}
//             >
//               {({ remainingTime }) => {
//                 return (
//                   <div>
//                     {(() => {
//                       const estimatedTime =
//                         meetingStartTime.getTime() + rightDuration * 1000;
//                       const time = new Date(estimatedTime);
//                       return (
//                         <div className="d-flex justify-content-center align-items-center flex-column">
//                           <div>
//                             <span className="start-at">
//                               {t("Estimated End At")}
//                             </span>
//                           </div>
//                           <h5>{`${time.getHours()}h${
//                             time.getMinutes() < 10
//                               ? "0" + time.getMinutes()
//                               : time.getMinutes()
//                           }`}</h5>
//                         </div>
//                       );
//                     })()}
//                   </div>
//                 );
//               }}
//             </CountdownCircleTimer>

//             <section></section>
//           </div>
//         </div>

//         <div className="d-flex justify-content-center gap-2 align-items-center">
//           <button onClick={() => setIsPlaying(!isPlaying)}>
//             {isPlaying ? "Stop" : "Start"} Timer
//           </button>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

export default ActionCounterContainer;
