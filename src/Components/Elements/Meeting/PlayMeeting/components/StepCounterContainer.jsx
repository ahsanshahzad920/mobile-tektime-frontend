import React, { useEffect, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import ErrorBoundary from "../../../../Utils/ErrorBoundary";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import {
  convertDateToUserTimezone,
  parseAndFormatDateTime,
} from "../../GetMeeting/Helpers/functionHelper";
import { useStepCounterContext } from "../../context/StepCounterContext";

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

const convertDaysToSeconds = (days) => {
  return days * 24 * 60 * 60; // 1 day = 24 hours, 1 hour = 60 minutes, 1 minute = 60 seconds
};
const formatTimeDDHH = (seconds, editor_type, time_unit) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const remainingSeconds = seconds % (24 * 60 * 60);
  const hours = Math.floor(remainingSeconds / (60 * 60));

  // Determine the days suffix
  const daysSuffix = (editor_type === "Story" && time_unit === "days")
    ? "SP"
    : "d";

  const formattedDays = days > 0 ? String(days).padStart(2, "0") : "00";
  const formattedHours = hours > 0 ? String(hours).padStart(2, "0") : "00";

  return `${formattedDays}${daysSuffix}:${formattedHours}h`;
};

/**-----------------------------------------FUNCTIONAL COMPONENT STARTS HERE... -------------------------------------------- */
const StepCounterContainer = ({
  alarm,
  progress,
  estimateTime,
  estimateDate,
  inProgressIndex,
  startDate,
  startTime,
}) => {
  const audioRef = useRef(null);
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
    stepDelay,
    nextStepTrigger,
    previousStepTrigger,
    refreshKey,
  } = useStepCounterContext();
  const [duration, setDuration] = useState(0);
  const remainingTimeRef = useRef(0);
  const [totalElapsedTimeState, setTotalElapsedTimeState] = useState(0);
  const [rightDuration, setRightDuration] = useState(0);
  const [showNegativeCounter, setShowNegativeCounter] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [centerColor, setCenterColor] = useState("#5AAFD6");
  const [redColor, setRedColor] = useState("red");
  // const [centerColor, setCenterColor] = useState('#5AAFD6');
  const [leftColor, setLeftColor] = useState("#eee");
  const [startingAlert, setStartingAlert] = useState("");
  const [startingAlertColor, setStartingAlertColor] = useState("0000");
  const [spareTimes, setSpareTimes] = useState([]);

  const [remainingTime, setRemainingTime] = useState(null); // Add state for playing

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (
      meetingData?.steps &&
      startTime &&
      (meetingData?.timezone || "Europe/Paris")
    ) {
      const meetingTimezone = meetingData.timezone;
      const userTimezone = moment.tz.guess();

      // Convert step_time from meeting's timezone to user's timezone
      const timeInMeetingTZ = moment.tz(
        startTime,
        "HH:mm:ss A",
        meetingTimezone
      );
      const timeInUserTZ = timeInMeetingTZ.clone().tz(userTimezone);

      // Format time in 24-hour format (16h24)
      const formattedTime = timeInUserTZ.format("HH[h]mm");

      setHours(formattedTime.split("h")[0]); // Extract hours
      setMinutes(parseInt(formattedTime.split("h")[1], 10)); // Extract minutes as a number
    }
  }, [meetingData, meetingData?.steps, startTime, startDate, refreshKey]);

  useEffect(() => {
    if (progress) return;
    setShowNegativeCounter(false); // will update conditionally later.
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
    const steps = meetingData?.steps;
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
  }, [activeStepIndex, meetingData, progress, refreshKey]);

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
  }, [meetingData, loaded, progress, refreshKey]);

  const stopAudio = () => {
    buzzer.pause(); // Pause the buzzer audio
    buzzer.currentTime = 0; // Reset the playback position to start
  };

  // Handlers:
  const [buzzerPlayed, setBuzzerPlayed] = useState(false);
  // const playAudio = () => {
  //   audio.play().catch((err) => {
  //     console.log("err", err);
  //   });
  // };

  // const playBuzzer = () => {
  //   buzzer.play().catch((err) => {
  //     console.log("err", err);
  //   });
  // };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // useEffect(() => {
  //   if (meetingData) {
  //     if (remainingTime <= 5 && remainingTime > 1 && alarm === true) {
  //       playAudio();
  //     } else if (
  //       remainingTime === 0 &&
  //       alarm === true &&
  //       meetingData?.steps[activeStepIndex]?.negative_time !== "99"
  //     ) {
  //       playBuzzer();
  //       setBuzzerPlayed(true);
  //     }
  //   }
  // }, [remainingTime]);

  useEffect(() => {
    if (progress) return;

    if (nextStepRef.current) {
      stopAudio();
      const spareTimeToBeSubtracted = spareTimes[activeStepIndex - 1];
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

      const spareTimeToBeAdded = spareTimes[activeStepIndex];
      // If you do activeStepIndex - 1 or +1 . The calculation will be Fucked up. SO Better keep it that way. It works fine this way.

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

    if (meetingData && meetingData.start_time && meetingData?.starts_at) {
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

  const formatDelay = (delay) => {
    if (!delay) {
      return;
    }

    // Remove all negative signs from the delay string
    delay = delay.replace(/-/g, "");

    const parts = delay.split(":");

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

  const activeStepDelay = meetingData && meetingData?.steps && stepDelay?.delay;

  //With Timezone
  const formatTime = (dateTimeString, meetingTimezone) => {
    if (!dateTimeString || !meetingTimezone) return null;

    const cleanDateTimeString = dateTimeString.split(".")[0]; // Removes milliseconds and 'Z' // I have to remove this Z because it takes it as a UTC

    const userTimezone = moment.tz.guess() || "Europe/Paris";

    const timeInMeetingTZ = moment.tz(cleanDateTimeString, meetingTimezone);
    const timeInUserTZ = timeInMeetingTZ.clone().tz(userTimezone);

    return `${timeInUserTZ.format("HH")}h${timeInUserTZ.format("mm")}`;
  };

  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedEndDate, setEstimatedEndDate] = useState(null);
  const [estimatedEndTimeDate, setEstimatedEndTimeDate] = useState(null);

  useEffect(() => {
    if (
      !stepDelay ||
      inProgressIndex === undefined ||
      !meetingData?.steps?.length
    ) {
      return;
    }

    let remainingTime = moment.utc(stepDelay?.step_estimate_time);

    // Calculate step end time in user's timezone
    const stepEndDateTime = remainingTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    // Format step end date & time using user's timezone
    const { formattedDate: stepEndDate, formattedTime: stepEndTime } =
      parseAndFormatDateTime(
        stepEndDateTime,
        meetingData?.type,
        meetingData?.timezone
      );
    setEstimatedEndDate(stepEndDate);
    setEstimatedTime(stepEndTime);
    setEstimatedEndTimeDate(stepEndDateTime);
  }, [meetingData, stepDelay, inProgressIndex, negativeTimes, refreshKey]); // Empty dependency array runs it only once

  // Function to subtract

  // Function to subtract time based on time unit
  const subtractTime = (momentObj, value, unit) => {
    switch (unit) {
      case "days":
        return momentObj.subtract(value, "days");
      case "hours":
        return momentObj.subtract(value, "hours");
      case "minutes":
        return momentObj.subtract(value, "minutes");
      case "seconds":
        return momentObj.subtract(value, "seconds");
      default:
        return momentObj;
    }
  };

  const formattedTime = estimatedTime
    ? formatTime(estimatedEndTimeDate, meetingData?.timezone || "Europe/Paris")
    : "";
  const formattedDelay = formatDelay(activeStepDelay);

  return (
    <ErrorBoundary>
      <div className="counter-container d-flex align-items-center flex-column">
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
                            startDate,
                            startTime,
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
                            startDate,
                            startTime,
                            meetingData?.timezone || "Europe/Paris"
                          )}
                        </span>
                        <span className="start-at" style={{ fontSize: "10px" }}>
                          {t("Start At")}
                        </span>
                        {hours}h{minutes < 10 ? "0" + minutes : minutes}
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
                  onUpdate={(remainingTime) => {}}
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
                duration={duration}
                onComplete={(totalElapsedTime) => {
                  // if (alarm === true && !buzzerPlayed && remainingTime == 0) {
                  //   // PLAY BUZZER AUDIO:
                  //   buzzer.play().catch((err) => {});
                  // }
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
                      <h3>
                        {meetingData &&
                        meetingData.steps &&
                        meetingData?.steps[activeStepIndex]?.time_unit ===
                          "days"
                          ? formatTimeDDHH(remainingTime,meetingData?.steps[activeStepIndex]?.editor_type,meetingData?.steps[activeStepIndex]?.time_unit)
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
                      {(() => {
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
                                    ? estimatedEndDate
                                    : estimateDate}
                                </span>
                                <span
                                  className="start-at"
                                  style={{
                                    fontSize: "10px",
                                  }}
                                >
                                  {t("Estimated End At")}
                                </span>
                                <span className="meeting-counter">
                                  {(meetingData &&
                                    meetingData?.steps &&
                                    meetingData?.steps[activeStepIndex]
                                      ?.delay) ||
                                  negativeTimes[activeStepIndex] > 0
                                    ? formattedTime
                                    : estimateTime}
                                </span>
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

export default StepCounterContainer;
