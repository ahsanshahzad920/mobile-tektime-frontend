import { Spinner } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCounterContext } from "../../context/CounterContext";
import ErrorBoundary from "../../../../Utils/ErrorBoundary";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import axios from "axios";
import { API_BASE_URL } from "../../../../Apicongfig";
import { useParams } from "react-router-dom";
import { convertDateToUserTimezone } from "../../GetMeeting/Helpers/functionHelper";

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
const CounterContainerTest = ({ alarm, progress, estimateTime, estimateDate }) => {

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
    positiveTimes,
    setNegativeTimes,
    setPositiveTimes,
    setNextActiveStep,
    setPreviousActiveStep,
    stepDelay,
    nextStepTrigger,
    previousStepTrigger,
  } = useCounterContext();

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
      const userTimezone = moment.tz.guess()

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
    setShowNegativeCounter(false);

    if (
      meetingData &&
      meetingData?.steps &&
      negativeTimes[activeStepIndex] > 0 &&
      meetingData?.steps[activeStepIndex]?.delay === null
    ) {
      setShowNegativeCounter(true);

      setDuration(7200 - negativeTimes[activeStepIndex]);
      return;
    }

    // IF THERE IS NO NEGATIVE TIME => THE DURATION OF THE CENTER COUNTER WILL BE SET TO THE SAVED TIME || THE TOTAL TIME OF THE ACTIVE STEP.
    const steps = meetingData?.steps;
    if (Array.isArray(steps) && steps?.length > 0) {
      const step = steps[activeStepIndex];
      if (step?.time_unit === "days") {
        const count2InSeconds = convertDaysToSeconds(step?.time);
        setDuration(step?.savedTime || count2InSeconds);
      } else if (step?.time_unit === "hours") {
        const count2InSeconds = convertHoursToSeconds(step?.time);
        setDuration(step?.savedTime || count2InSeconds);
      } else if (step?.time_unit === "seconds") {
        setDuration(step?.time); // Directly set the time for seconds
      } else {
        setDuration(step?.savedTime || step?.time * 60);
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

      let totalTime = totalTimesArray?.reduce((acc, curr) => acc + curr, 0);
      setRightDuration(totalTime);
      setLoaded(true);
    }
  }, [meetingData, loaded, progress]);

  const stopAudio = () => {
    buzzer.pause(); // Pause the buzzer audio
    buzzer.currentTime = 0; // Reset the playback position to start
  };

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
  console.log('activeStepDelay',activeStepDelay)

  const formatTime = (dateTimeString, meetingTimezone) => {
    if (!dateTimeString || !meetingTimezone) return null;

    const cleanDateTimeString = dateTimeString.split(".")[0];

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
    meetingData?.timezone
  );

  const formattedTime = estimatedTime
    ? formatTime(estimateDateTime, meetingData?.timezone || "Europe/Paris")
    : "";

  const formattedDelay = formatDelay(activeStepDelay);


  return (
    <ErrorBoundary>
      <div className="counter-container d-flex align-items-center flex-column" style={{ margin: "-8px" }}>

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
                      <div className="justify-content-center flex-column d-flex align-items-center" style={{
                        fontSize: 'medium'
                      }}>
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
                      <div className="justify-content-center flex-column d-flex align-items-center" style={{ fontSize: 'medium' }}>
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

          {/* -------------------> CENTER COUNTER <---------------------------- */}

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
              meetingData?.steps[activeStepIndex]?.negative_time === "99" ? (
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

export default CounterContainerTest;