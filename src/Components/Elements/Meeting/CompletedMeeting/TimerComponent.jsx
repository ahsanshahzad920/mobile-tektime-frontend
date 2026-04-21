import { CountdownCircleTimer } from "react-countdown-circle-timer";
import {
  addTimeTakenToStepTime,
  convertTo24HourFormat,
  formatPauseTime,
  formatStepDate,
  localizeTimeTaken,
} from "../../../Utils/MeetingFunctions";
import moment from "moment";
import { useTranslation } from "react-i18next";

const TimerComponent = ({ step, toFinishEndTime, toFinishEndDate }) => {
  const [t] = useTranslation("global");
  const duration =
    step?.time_unit === "days"
      ? step?.count2 * 86400
      : step?.time_unit === "hours"
      ? step?.count2 * 3600
      : step?.count2 * 60;

 

  const calculateEndDate = (
    startDate,
    stepTime,
    count2,
    timeUnit,
    timezone
  ) => {
    if (!startDate || !stepTime || !count2 || !timeUnit) return startDate;

    let startMoment = moment.tz(
      `${startDate} ${stepTime}`,
      "YYYY-MM-DD hh:mm:ss A",
      timezone
    );

    switch (timeUnit) {
      case "days":
        startMoment.add(count2, "days");
        break;
      case "hours":
        startMoment.add(count2, "hours");
        break;
      case "minutes":
        startMoment.add(count2, "minutes");
        break;
      case "seconds":
        startMoment.add(count2, "seconds");
        break;
      default:
        break;
    }

    return startMoment.format("DD/MM/YYYY");
  };
  const calculateEndTime = (
    startDate,
    startTime,
    duration,
    timeUnit,
    timezone
  ) => {
    if (!startDate || !startTime || !duration || !timeUnit || !timezone) {
      console.warn("Missing values in calculateEndTime:", {
        startDate,
        startTime,
        duration,
        timeUnit,
        timezone,
      });
      return "";
    }

    const meetingTimezone = timezone || "Europe/Paris";
    const userTimezone = moment.tz.guess(); // Get the user's timezone dynamically

    // Ensure startTime is correctly interpreted (handle both 12-hour & 24-hour formats)
    let stepStartTime = moment.tz(
      `${startDate} ${startTime}`,
      ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD hh:mm:ss A"],
      meetingTimezone
    );

    if (!stepStartTime.isValid()) {
      console.error("Invalid date format in calculateEndTime:", {
        startDate,
        startTime,
      });
      return "";
    }

    // Add duration based on the time unit
    if (timeUnit === "days") {
      stepStartTime = stepStartTime.add(duration, "days");
    } else if (timeUnit === "hours") {
      stepStartTime = stepStartTime.add(duration, "hours");
    } else {
      stepStartTime = stepStartTime.add(duration, "minutes");
    }

    // Convert to the user's timezone and ensure it's in 24-hour format
    const convertedTime = stepStartTime.tz(userTimezone);

    console.log(
      "Calculated end time in user timezone (24h format):",
      convertedTime.format("YYYY-MM-DD HH:mm")
    );

    // Return the correct format (e.g., `18h35`)
    return convertedTime.format("HH[h]mm");
  };

  // Get the user's timezone dynamically
  const userTimezone = moment.tz.guess();

  // Get the user's current time in their timezone
  const userCurrentTime = moment().tz(userTimezone);

  // Convert the step's start time from the meeting timezone to the user's timezone
  const stepStartTime = moment
    .tz(
      `${step?.start_date} ${step?.step_time}`,
      "YYYY-MM-DD HH:mm:ss",
      step?.meeting?.timezone
    )
    .tz(userTimezone);

  // Determine the color
  const timerColor = stepStartTime.isAfter(userCurrentTime)
    ? "#FFC107"
    : "#DC6F2E";

  // ----------------------------------FOR end time
  // Calculate the estimated end date and time
  const estimatedEndDate = calculateEndDate(
    step?.start_date,
    step?.step_time,
    step?.count2,
    step?.time_unit,
    step?.meeting?.timezone
  );

  const estimatedEndTime = calculateEndTime(
    step?.start_date,
    step?.step_time,
    step?.count2,
    step?.time_unit,
    step?.meeting?.timezone
  );

  // Convert the estimated end time to the user's timezone
  const stepEndTime = moment
    .tz(
      `${estimatedEndDate} ${estimatedEndTime}`,
      "DD/MM/YYYY HH[h]mm",
      step?.meeting?.timezone
    )
    .tz(userTimezone);

  // Determine the color
  const endTimerColor = stepEndTime.isAfter(userCurrentTime)
    ? "#FF0000"
    : "#28A745"; // Red if after, Green if before

 
  return (
    <div className="timer-container d-flex gap-1">
      {/* Start Time */}
      <div className="time-circle-wrapper pt-4">
        <CountdownCircleTimer
          isPlaying={false}
          duration={duration}
          colors={[timerColor]}
          size={100}
          strokeWidth={5}
        >
          {() => (
            <div className="justify-content-center flex-column d-flex align-items-center">
              <span className="start-at" style={{ fontSize: "12px" }}>
                {formatStepDate(
                  step?.start_date,
                  step?.step_time,
                  step?.meeting?.timezone || "Europe/Paris"
                )}
              </span>

              <span className="start-at" style={{ fontSize: "10px" }}>
                {t("Start At")}
              </span>
              <span className="start-at" style={{ fontSize: "12px" }}>
                {convertTo24HourFormat(
                  step?.step_time,
                  step?.start_date,
                  step?.time_unit,
                  step?.meeting?.timezone || "Europe/Paris"
                )}
              </span>
            </div>
          )}
        </CountdownCircleTimer>
      </div>

      <div className="d-flex flex-column gap-1">
        {/* Countdown Timer */}
        <div
          className={`time-circle-wrapper text-center ${
            step?.step_status === "to_finish" ? "pb-1" : "pb-4"
          }`}
        >
          {step?.step_status === "to_finish" &&  <small>{t("Work Time")}</small>}

          <CountdownCircleTimer
            isPlaying={false}
            duration={duration}
            colors={["#5AAFD6"]}
            size={130}
            strokeWidth={5}
          >
            {({ remainingTime }) => (
              <div className="timer-text">
                {step?.step_status === "to_finish" && step?.work_time ? (
                  // localizeTimeTaken(step?.time_taken?.replace("-", ""), t)
                  formatPauseTime(step?.work_time,t)

                ) : (
                  <>
                    {step?.time_unit === "days" && step?.editor_type !== "Story"
                      ? `${String(Math.floor(remainingTime / 86400)).padStart(
                          2,
                          "0"
                        )}d:00`
                      : step?.time_unit === "days" && step?.editor_type === "Story"
                      ? `${String(Math.floor(remainingTime / 86400)).padStart(
                          2,
                          "0"
                        )}SP:00`
                      : step?.time_unit === "hours"
                      ? `${String(Math.floor(remainingTime / 3600)).padStart(
                          2,
                          "0"
                        )}h:00`
                      : step?.time_unit === "minutes"
                      ? `${String(Math.floor(remainingTime / 60)).padStart(
                          2,
                          "0"
                        )}m:00`
                      : `${String(Math.floor(remainingTime / 60)).padStart(
                          2,
                          "0"
                        )}m:${String(remainingTime % 60).padStart(2, "0")}s`}
                  </>
                )}
              </div>
            )}
          </CountdownCircleTimer>
        </div>
        {/* Pause Timer */}
        {step?.step_status === "to_finish" && (
          <div className="time-circle-wrapper pb-4 text-center">
            <CountdownCircleTimer
              isPlaying={false}
              // duration={duration}
              colors={["red"]}
              size={130}
              strokeWidth={5}
            >
              {({ remainingTime }) => (
                <div className="timer-text">
                  {formatPauseTime(step?.pause_time_in_sec,t)}
                </div>
              )}
            </CountdownCircleTimer>
            <small>{t("Pause Time")}</small>
          </div>
        )}
      </div>

      {/* Estimated End Time */}
      <div className="time-circle-wrapper pt-4">
        <CountdownCircleTimer
          isPlaying={false}
          duration={duration}
          colors={[endTimerColor]}
          size={100}
          strokeWidth={4}
        >
          {() => (
            <div className="justify-content-center flex-column d-flex align-items-center">
              <span className="start-at" style={{ fontSize: "12px" }}>
                {step?.step_status === "to_finish"
                  ? toFinishEndDate
                  : calculateEndDate(
                      step?.start_date,
                      step?.step_time,
                      step?.count2,
                      step?.time_unit,
                      step?.meeting?.timezone || "Europe/Paris"
                    )}
              </span>
              <span className="start-at" style={{ fontSize: "10px" }}>
                {t("Estimated End At")}
              </span>
              <span className="start-at" style={{ fontSize: "12px" }}>
                {step?.step_status === "to_finish"
                  ? toFinishEndTime
                  : calculateEndTime(
                      step?.start_date,
                      step?.step_time,
                      step?.count2,
                      step?.time_unit,
                      step?.meeting?.timezone || "Europe/Paris"
                    )}
              </span>
            </div>
          )}
        </CountdownCircleTimer>
      </div>
    </div>
  );
};

export default TimerComponent;
