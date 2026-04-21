import { Spinner } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCounterContext } from "../../context/CounterContext";
import ErrorBoundary from "../../../../Utils/ErrorBoundary";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import { convertDateToUserTimezone } from "../../GetMeeting/Helpers/functionHelper";

function formatTimeMMSS(seconds) {
  if (isNaN(seconds)) return "00:00";
  const absSeconds = Math.max(0, seconds);
  const minutes = Math.floor(absSeconds / 60);
  const remainingSeconds = absSeconds % 60;

  // Add leading zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const convertHoursToSeconds = (hours) => {
  return hours * 60 * 60; // 1 hour = 60 minutes, 1 minute = 60 seconds
};
function formatTimeHHMM(seconds) {
  if (isNaN(seconds)) return "00h:00";
  const absSeconds = Math.max(0, seconds);
  const hours = Math.floor(absSeconds / 3600);
  const remainingSeconds = absSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}h:${formattedMinutes}`;
}

const convertDaysToSeconds = (days) => {
  return days * 24 * 60 * 60; // 1 day = 24 hours, 1 hour = 60 minutes, 1 minute = 60 seconds
};
const formatTimeDDHH = (seconds, editor_type, time_unit) => {
  if (isNaN(seconds)) return "00:00";
  const absSeconds = Math.max(0, seconds);
  const days = Math.floor(absSeconds / (24 * 60 * 60));
  const remainingSecondsAfterDays = absSeconds % (24 * 60 * 60);
  const hours = Math.floor(remainingSecondsAfterDays / (60 * 60));
  const remainingSecondsAfterHours = remainingSecondsAfterDays % (60 * 60);
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const remainingSeconds = remainingSecondsAfterHours % 60;

  const formattedDays = String(days).padStart(2, "0");
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  // days suffix
  const daysSuffix =
    editor_type === "Story" && time_unit === "days" ? "SP" : "d";


  return `${formattedDays}${daysSuffix}:${formattedHours}h`;
};

/**-----------------------------------------FUNCTIONAL COMPONENT STARTS HERE... -------------------------------------------- */
const CounterContainer = ({
  alarm,
  progress,
  estimateTime,
  estimateDate,
  isModalOpen,
  stepTitle,
  stepOrder,
  handlenextPage,
  closeMeeting,
  next,
  close,
}) => {
  const audioRef = useRef(null);
  // const [buzzer] = useState(new Audio(`https://tektime.io/Final-Countdown.mp3`));
  // const [audio] = useState(new Audio(`https://tektime.io/beep.WAV`));

  const [audio] = useState(
    new Audio(`https://tektime-storage.s3.eu-north-1.amazonaws.com/beep.WAV`),
  );
  const [buzzer] = useState(
    new Audio(
      `https://tektime-storage.s3.eu-north-1.amazonaws.com/Final-Countdown+(mp3cut.net)+(1).mp3`,
    ),
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
    showNegativeCounter,
    setShowNegativeCounter,
    timerKey,
  } = useCounterContext();
  const [duration, setDuration] = useState(0);
  const [initialRemainingTimeState, setInitialRemainingTimeState] = useState(0);
  const remainingTimeRef = useRef(0);
  const [totalElapsedTimeState, setTotalElapsedTimeState] = useState(0);
  const [meetingStartTime, setMeetingStartTime] = useState(new Date()); // will be set to the start time of the meeting. [hours,minutes]
  const [leftDuration, setLeftDuration] = useState(0);
  const [rightDuration, setRightDuration] = useState(0);
  const [currentStepDate, setCurrentStepDate] = useState(null);
  const hasStartedRef = useRef(false);
  // const [showNegativeCounter, setShowNegativeCounter] = useState(false);
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
  const [isOnPage, setIsOnPage] = useState(true);
  const [leavingTime, setLeavingTime] = useState(0);
  /**----------------------------------------------------------- SIDE EFFECTS ------------------------------------------------------------------------- */

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // withTimeZone
  useEffect(() => {
    if (meetingData?.starts_at && (meetingData?.timezone || "Europe/Paris")) {
      const meetingTimezone = meetingData.timezone;
      const userTimezone = moment.tz.guess();

      // Convert time from meeting's timezone to user's timezone
      const timeInMeetingTZ = moment.tz(
        meetingData.starts_at,
        "HH:mm",
        meetingTimezone,
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

  useEffect(() => {
    if (remainingTime > 0) {
      hasStartedRef.current = true;
    }
  }, [remainingTime]);

  const stopAudio = () => {
    buzzer.pause(); // Pause the buzzer audio
    buzzer.currentTime = 0; // Reset the playback position to start
    audio.pause();
    audio.currentTime = 0;
  };

  const [buzzerPlayed, setBuzzerPlayed] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

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

  const meetingStatusRef = useRef(meetingData?.status);
  useEffect(() => {
    meetingStatusRef.current = meetingData?.status;
  }, [meetingData?.status]);

  useEffect(() => {
    setBuzzerPlayed(false);
    setAudioPlayed(false);
    setRemainingTime(null);
    hasStartedRef.current = false;
  }, [activeStepIndex]);

  useEffect(() => {
    let worker;
    if (typeof window !== "undefined" && window.Worker) {
      const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (intervalId) return;
            intervalId = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = () => {
        if (document.hidden && meetingStatusRef.current === "in_progress") {
          setRemainingTime((prevTime) => {
            if (prevTime === null) return null;
            return prevTime > 0 ? prevTime - 1 : 0;
          });
        }
      };

      worker.postMessage('start');
    } else {
      const intervalId = setInterval(() => {
        if (document.hidden && meetingStatusRef.current === "in_progress") {
          setRemainingTime((prevTime) => {
            if (prevTime === null) return null;
            return prevTime > 0 ? prevTime - 1 : 0;
          });
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }

    return () => {
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (meetingData && duration > 0 && remainingTime !== null) {
      if (
        remainingTime <= 5 &&
        remainingTime > 0 &&
        alarm === true &&
        !showNegativeCounter
      ) {
        if (!audioPlayed) {
          audio.loop = true;
          playAudio();
          setAudioPlayed(true);
        }
      } else if (
        remainingTime === 0 &&
        duration > 0 &&
        hasStartedRef.current &&
        alarm === true &&
        meetingData?.steps?.[activeStepIndex]?.negative_time !== "99"
      ) {
        audio.loop = false;
        audio.pause();
        audio.currentTime = 0;

        if (!buzzerPlayed) {
          playBuzzer();
          setBuzzerPlayed(true);
        }
      }
    }
  }, [
    remainingTime,
    showNegativeCounter,
    alarm,
    meetingData,
    activeStepIndex,
    audioPlayed,
    buzzerPlayed,
    audio,
    buzzer,
    duration,
  ]);

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
    if (meetingData && meetingData.start_time && meetingData.starts_at) {
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
            `${t(`types.${meetingData?.type}`)} ${t("The meeting started with")} ${delay} ${t("minute late.")}`,
          );
          setStartingAlertColor(orange);
          setLeftColor(orange);
        } else if (delay <= 5) {
          setStartingAlert(
            `${t(`types.${meetingData?.type}`)} ${t("The meeting started with")} ${delay} ${t("minutes late.")}`,
          );
          setStartingAlertColor(orange);
          setLeftColor(orange);
        } else {
          setStartingAlert(
            `${t(`types.${meetingData?.type}`)} ${t("The meeting started with")} ${delay} ${t("minutes late.")}`,
          );
          setStartingAlertColor(red);
          setLeftColor(red);
        }
      } else {
        const delayMinutes = Math.abs(delay); // Convert to positive for early starts
        setStartingAlert(
          `${t(`types.${meetingData?.type}`)} ${t("The meeting started with")} ${delayMinutes} ${t(
            "minutes in advance.",
          )}`,
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

    // Extract the individual components
    const [days, hours, minutes, seconds] = parts?.map((part) =>
      parseInt(part, 10),
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

  const estimatedTime =
    meetingData && meetingData.steps && stepDelay?.estimate_time?.split("T")[1];

  const estimatedEndDate =
    meetingData && meetingData.steps && stepDelay?.estimate_time?.split("T")[0];

  const estimateDateTime =
    meetingData && meetingData.steps && stepDelay?.estimate_time;

  const EstimatedEndDateWithTimezone = convertDateToUserTimezone(
    estimatedEndDate,
    estimatedTime,
    meetingData?.timezone,
  );

  const formattedTime = estimatedTime
    ? formatTime(estimateDateTime, meetingData?.timezone || "Europe/Paris")
    : "";

  const formattedDelay = formatDelay(activeStepDelay);
  const isMobile = window.innerWidth <= 768;

  return (
    <ErrorBoundary>
      <div
        className={`counter-container-full-screen ${isModalOpen && (meetingData?.location === "Google Meet" || meetingData?.location === "Microsoft Teams") ? "counter-top-space" : isModalOpen && (meetingData?.location !== "Google Meet" || meetingData !== "Microsoft Teams") ? "counter-top-space-newsletter" : ""}`}
      >
        <div className="counters-row">
          {/* LEFT COUNTER - START */}
          <div
            className={`modern-counter red ${isModalOpen ? "modal-view" : ""}`}
            style={{ "--primary-color": leftColor }}
          >
            <div className="outer-glow-ring"></div>
            <div className="inner-dotted-ring"></div>
            <div className="counter-ring-bg"></div>
            <CountdownCircleTimer
              key={`left-${timerKey}`}
              size={isModalOpen || isMobile ? 100 : 110}
              strokeWidth={0}
              isPlaying={false}
              duration={0}
              colors={leftColor}
              trailColor="#eeeeee"
            >
              {() => (
                <div className="counter-overlay">
                  <div className="status-badge">
                    <span
                      className="dot"
                      style={{ backgroundColor: leftColor }}
                    ></span>
                    <span className="label">{t("Start At")}</span>
                  </div>
                  <div className="time-display">
                    {meetingData?.type === "Action1" ||
                    meetingData?.type === "Newsletter" ? (
                      <div className="d-flex flex-column align-items-center">
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            lineHeight: "1",
                            marginBottom: "4px",
                          }}
                        >
                          {hours}h{minutes > 9 ? minutes : "0" + minutes}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "500",
                            opacity: 0.7,
                          }}
                        >
                          {convertDateToUserTimezone(
                            meetingData?.current_date,
                            meetingData?.starts_at,
                            meetingData?.timezone || "Europe/Paris",
                          )}
                        </span>
                      </div>
                    ) : (
                      <>
                        {hours}h{minutes > 9 ? minutes : "0" + minutes}
                      </>
                    )}
                  </div>
                  {meetingData?.type !== "Action1" &&
                    meetingData?.type !== "Newsletter" && (
                      <div className="time-units">
                        {convertDateToUserTimezone(
                          meetingData?.current_date,
                          meetingData?.starts_at,
                          meetingData?.timezone || "Europe/Paris",
                        )}
                      </div>
                    )}
                </div>
              )}
            </CountdownCircleTimer>
            {!isModalOpen && meetingData?.delay && (
              <p className="starting-alert">{startingAlert}</p>
            )}
          </div>

          {/* CENTER COUNTER - REMAINING */}
          <div
            className={`modern-counter center ${
              showNegativeCounter ||
              meetingData?.steps?.[activeStepIndex]?.negative_time === "99"
                ? "red1"
                : "blue"
            } ${isModalOpen ? "modal-view" : ""}`}
            style={{
              "--primary-color":
                showNegativeCounter ||
                meetingData?.steps?.[activeStepIndex]?.negative_time === "99"
                  ? redColor
                  : "#5AAFD6",
            }}
          >
            <div className="outer-glow-ring"></div>
            <div className="inner-dotted-ring"></div>
            <div className="counter-ring-bg"></div>
            {meetingData &&
            meetingData?.steps &&
            meetingData?.steps[activeStepIndex].negative_time === "99" ? (
              <CountdownCircleTimer
                key={`center-neg-${timerKey}-${activeStepIndex}`}
                size={isModalOpen || isMobile ? 120 : 140}
            style={{ "--primary-color": "red" }}

                strokeWidth={0}
                isPlaying={false}
                colors={redColor}
                trailColor="#eeeeee"
              >
                {({ remainingTime }) => {
                  remainingTimeRef.current = remainingTime;
                  return (
                    <div className="counter-overlay">
                      <div className="status-badge">
                        <span
                          className="dot"
                          style={{ backgroundColor: "red" }}
                        ></span>
                        <span className="label">{t("Remaining")}</span>
                      </div>
                      <div className="time-display" style={{ color: "red" }}>
                        {formattedDelay}
                      </div>
                    </div>
                  );
                }}
              </CountdownCircleTimer>
            ) : (
              <CountdownCircleTimer
                key={`center-${timerKey}-${activeStepIndex}`}
                size={isModalOpen || isMobile ? 120 : 140}
                strokeWidth={1}
                isPlaying={meetingData?.status === "in_progress"}
                duration={duration}
                colors={showNegativeCounter ? "red" : "#5AAFD6"}
                trailColor="transparent"
                onComplete={async (totalElapsedTime) => {
                  if (
                    duration > 0 &&
                    remainingTimeRef.current !== null &&
                    remainingTimeRef.current <= 1 &&
                    alarm === true &&
                    !buzzerPlayed &&
                    meetingData?.steps?.[activeStepIndex]?.negative_time !==
                      "99"
                  ) {
                    audio.loop = false;
                    audio.pause();
                    audio.currentTime = 0;
                    playBuzzer();
                    setBuzzerPlayed(true);
                  }
                  
                  setTotalElapsedTimeState(totalElapsedTime);
                  setShowNegativeCounter(true);
                  remainingTimeRef.current = 0;
                  setDuration(7200 + totalElapsedTime);
                  if (meetingData?.playback === "automatic") {
                    const isLastStep =
                      activeStepIndex === meetingData?.steps?.length - 1;
                    if (meetingData?.prise_de_notes === "Manual") {
                      await (isLastStep ? closeMeeting() : handlenextPage());
                    } else {
                      await (isLastStep ? close() : next());
                    }
                  }
                }}
                onUpdate={(remainingTime) => {
                  setRemainingTime(remainingTime);
                  setSpareTimes((prev) => {
                    if (showNegativeCounter) {
                      let timesArray = [...prev];
                      timesArray[activeStepIndex] = 0;
                      return timesArray;
                    }
                    let timesArray = [...prev];
                    timesArray[activeStepIndex] = remainingTime;
                    return timesArray;
                  });

                  if (showNegativeCounter) {
                    setCenterColor("red");
                    setRightDuration((prev) => prev + 1);
                    setNegativeTimes((prev) => {
                      let timesArray = [...prev];
                      timesArray[activeStepIndex] =
                        7200 - remainingTimeRef.current;
                      return timesArray;
                    });
                    return;
                  }
                  if (remainingTime % 5 === 0 || remainingTime === 0) {
                    handleSetSavedTime(remainingTime);
                  }
                }}
              >
                {({ remainingTime }) => {
                  remainingTimeRef.current = remainingTime;
                  return (
                    <div className="counter-overlay">
                      <div className="status-badge">
                        <span
                          className="dot"
                          style={{
                            backgroundColor: showNegativeCounter
                              ? "red"
                              : "#5AAFD6",
                          }}
                        ></span>
                        <span className="label">{t("Remaining")}</span>
                      </div>
                      <div
                        className="time-display"
                        style={{
                          color: showNegativeCounter ? "red" : "inherit",
                        }}
                      >
                        {showNegativeCounter
                          ? `- ${formatTimeMMSS(-1 * (remainingTime - 7200))}`
                          : meetingData?.steps?.[activeStepIndex]?.time_unit ===
                              "days"
                            ? formatTimeDDHH(
                                remainingTime,
                                meetingData?.steps[activeStepIndex]
                                  ?.editor_type,
                                meetingData?.steps?.[activeStepIndex]
                                  ?.time_unit,
                              )
                            : meetingData?.steps?.[activeStepIndex]
                                  ?.time_unit === "hours"
                              ? formatTimeHHMM(remainingTime)
                              : formatTimeMMSS(remainingTime)}
                      </div>
                      {!showNegativeCounter &&
                        meetingData?.type !== "Newsletter" &&
                        meetingData?.type !== "Action1" &&
                        meetingData?.steps?.[activeStepIndex]?.time_unit !==
                          "days" &&
                        meetingData?.steps?.[activeStepIndex]?.time_unit !==
                          "hours" && (
                          <div className="time-units">
                            <span>mm</span>
                            <span>ss</span>
                          </div>
                        )}
                    </div>
                  );
                }}
              </CountdownCircleTimer>
            )}
            {!isModalOpen && stepTitle && (
              <h5
                className="remainingTime text-center mt-3"
                style={{ fontSize: "13px", fontWeight: "600" }}
              >
                {stepOrder}. {stepTitle}
              </h5>
            )}
          </div>

          {/* RIGHT COUNTER - ESTIMATED END */}
          <div
            className={`modern-counter yellow ${isModalOpen ? "modal-view" : ""}`}
            style={{ "--primary-color": "#FF9500" }}
          >
            <div className="outer-glow-ring"></div>
            <div className="inner-dotted-ring"></div>
            <div className="counter-ring-bg"></div>
            <CountdownCircleTimer
              key={`right-${timerKey}`}
              colors="url(#your-unique-id)"
              isPlaying={
                meetingData?.steps?.[activeStepIndex]?.step_status ===
                "in_progress"
              }
              duration={rightDuration}
              size={isModalOpen || isMobile ? 100 : 110}
              strokeWidth={0}
              trailColor="#eeeeee"
            >
              {() => {
                const estimatedTime =
                  meetingStartTime.getTime() + rightDuration * 1000;
                const time = new Date(estimatedTime);
                return (
                  <div className="counter-overlay">
                    <div className="status-badge">
                      <span
                        className="dot"
                        style={{ backgroundColor: "#FF9500" }}
                      ></span>
                      <span className="label">{t("Estimated End At")}</span>
                    </div>
                    <div className="time-display">
                      {(meetingData &&
                        meetingData?.steps &&
                        meetingData?.steps[activeStepIndex]?.delay) ||
                      negativeTimes[activeStepIndex] > 0
                        ? formattedTime
                        : estimateTime}
                    </div>
                    <div className="time-units">
                      {(meetingData &&
                        meetingData?.steps &&
                        meetingData?.steps[activeStepIndex]?.delay) ||
                      negativeTimes[activeStepIndex] > 0
                        ? EstimatedEndDateWithTimezone
                        : estimateDate}
                    </div>
                  </div>
                );
              }}
            </CountdownCircleTimer>
          </div>
        </div>

        <div className="d-none">
          <audio ref={audioRef} src="/public/Assets/beep.wav" id="beep" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CounterContainer;
