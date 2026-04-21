import CookieService from '../../../Utils/CookieService';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../Apicongfig";
import axios from "axios";
import ErrorBoundary from "../../../Utils/ErrorBoundary";
import { formatDate, formatTime } from "../GetMeeting/Helpers/functionHelper";
import { useMeetings } from "../../../../context/MeetingsContext";

const CounterContext = createContext();

export const useCounterContext = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error(
      "useCounterContext must be used within a HeaderTitleProvider"
    );
  }
  return context;
};

export const CounterContextProvider = ({ children }) => {
  const { callApi, setCallApi } = useMeetings();
  //centralized states for count down timer.
  const { meeting_id: id } = useParams();
  const [meetingData, setMeetingData] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [negativeTimes, setNegativeTimes] = useState(Array().fill(0));

  const [stepDelay, setStepDelay] = useState(null); // New state for step delay
  const [nextStepTrigger, setNextStepTrigger] = useState(0);
  const [previousStepTrigger, setPreviousStepTrigger] = useState(0);
  const [showNegativeCounter, setShowNegativeCounter] = useState(false);
  const [decision, setDecision] = useState([]);
  const [timerKey, setTimerKey] = useState(0);

  const incrementTimerKey = useCallback(() => {
    setTimerKey(prev => prev + 1);
  }, []);

  const intervalRef = useRef(null);

  // useEffect(() => {
  //   if (meetingData) {
  //     const sendCurrentTime = async () => {
  //       const inProgressStep = meetingData?.steps[activeStepIndex];
  //       const inProgressStepId = inProgressStep?.id;

  //       // Exit if there's no in-progress step
  //       if (!inProgressStepId) return;

  //       const currentTime = new Date();

  //       const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //       // Convert the current time to the user's timezone
  //       const options = { timeZone: userTimeZone };
  //       const timeInUserZone = new Date(
  //         currentTime.toLocaleString("en-US", options)
  //       );

  //       // Format time
  //       const hours = timeInUserZone.getHours();
  //       const minutes = timeInUserZone.getMinutes();
  //       const seconds = timeInUserZone.getSeconds();
  //       const ampm = hours >= 12 ? "PM" : "AM";
  //       const formattedHours = hours % 12 || 12;
  //       const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  //       const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
  //       const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

  //       // Format date
  //       const year = timeInUserZone.getFullYear();
  //       const month = (timeInUserZone.getMonth() + 1)
  //         .toString()
  //         .padStart(2, "0");
  //       const day = timeInUserZone.getDate().toString().padStart(2, "0");
  //       const formattedDate = `${year}-${month}-${day}`;
  //       const payload = {
  //         delay_seconds: 1,
  //         step_id: inProgressStepId,
  //         current_time: formattedTime,
  //         current_date: formattedDate,
  //       };

  //       try {
  //         const response = await axios.post(
  //           `${API_BASE_URL}/update-delay`,
  //           payload,
  //           {
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${CookieService.get("token")}`,
  //             },
  //           }
  //         );

  //         if (response?.status) {
  //           const delay = response?.data?.data;
  //           setStepDelay(delay);
  //         }
  //       } catch (error) {
  //         console.log("error while sending current time", error);
  //       }
  //     };
  //     if (
  //       meetingData?.steps[activeStepIndex]?.delay !== null ||
  //       negativeTimes[activeStepIndex] > 0
  //     ) {
  //       sendCurrentTime();
  //     }

  //     let timeoutId;
  //     let intervalId;

  //     // Set the timeout to start the interval after 1 minute
  //     timeoutId = setTimeout(() => {
  //       intervalId = setInterval(() => {
  //         if (
  //           meetingData?.steps[activeStepIndex]?.delay !== null ||
  //           negativeTimes[activeStepIndex] > 0
  //         ) {
  //           sendCurrentTime();
  //         }
  //         //   }, 30000); // Executes every 30 seconds
  //         // }, 30000); // Initial delay of 1 minute
  //       }, 1000); // Executes every 30 seconds
  //     }, 1000); // Initial delay of 1 minute

  //     // Cleanup function
  //     return () => {
  //       clearTimeout(timeoutId); // Clear the timeout
  //       clearInterval(intervalId); // Clear the interval
  //     };
  //   }
  // }, [meetingData, activeStepIndex, negativeTimes]);



  
  const isDelayedOrNegative = useMemo(() => {
    return (
      meetingData?.steps?.[activeStepIndex]?.delay !== null ||
      negativeTimes?.[activeStepIndex] > 0
    );
  }, [meetingData?.steps, activeStepIndex, negativeTimes]);

  const lastCalledTimeRef = useRef(new Date());

  useEffect(() => {
    if (!meetingData || !isDelayedOrNegative) return;

    // ✅ Reset timer when active step or status changes
    lastCalledTimeRef.current = new Date();

    const sendCurrentTime = async () => {
      try {
        const inProgressStep = meetingData?.steps?.[activeStepIndex];
        const inProgressStepId = inProgressStep?.id;

        if (!inProgressStepId) return;

        const currentTime = new Date();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timeInUserZone = new Date(
          currentTime.toLocaleString("en-US", { timeZone: userTimeZone })
        );

        const year = timeInUserZone.getFullYear();
        const month = (timeInUserZone.getMonth() + 1).toString().padStart(2, "0");
        const day = timeInUserZone.getDate().toString().padStart(2, "0");
        const hours = timeInUserZone.getHours();
        const minutes = timeInUserZone.getMinutes();
        const seconds = timeInUserZone.getSeconds();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
        const formattedDate = `${year}-${month}-${day}`;

        const payload = {
          delay_seconds: 30, // ✅ Always send 30 as requested
          step_id: inProgressStepId,
          current_time: formattedTime,
          current_date: formattedDate,
          timezone: userTimeZone,
        };

        const response = await axios.post(
          `${API_BASE_URL}/update-delay`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200 && response?.data?.data !== undefined) {
          setStepDelay(response.data.data);
        }
      } catch (error) {
        console.error(
          "Error while sending current time to update-delay API:",
          error?.response?.data || error.message
        );
      }
    };

    // First immediate call
    sendCurrentTime();

    // Then start the interval
    const intervalId = setInterval(() => {
      sendCurrentTime();
    }, 30000); // ✅ Every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [meetingData?.id, activeStepIndex, isDelayedOrNegative]);


  const savePositiveTime = async () => {
    const inProgressStep = meetingData?.steps[activeStepIndex];
    const inProgressStepId = inProgressStep?.id;

    // Exit if there's no in-progress step
    if (!inProgressStepId) return;

    const currentTime = new Date();

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert the current time to the user's timezone
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    // Format time
    const hours = timeInUserZone.getHours();
    const minutes = timeInUserZone.getMinutes();
    const seconds = timeInUserZone.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

    // Format date
    const year = timeInUserZone.getFullYear();
    const month = (timeInUserZone.getMonth() + 1).toString().padStart(2, "0");
    const day = timeInUserZone.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const payload = {
      step_id: inProgressStepId,
      current_time: formattedTime,
      current_date: formattedDate,
          timezone:userTimeZone

    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-saved-time`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response?.status) {
        const delay = response?.data?.data;
        // setStepDelay(delay);
      }
    } catch (error) {
      console.log("error while sending current time", error);
    }
  };
  useEffect(() => {
    if (!meetingData || showNegativeCounter || meetingData?.delay === null)
      return;

    const savePositiveTime = async () => {
      const inProgressStep = meetingData?.steps[activeStepIndex];
      const inProgressStepId = inProgressStep?.id;

      if (!inProgressStepId) return;

      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", { timeZone: userTimeZone })
      );

      const hours = timeInUserZone.getHours();
      const minutes = timeInUserZone.getMinutes();
      const seconds = timeInUserZone.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
      const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
      const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

      const year = timeInUserZone.getFullYear();
      const month = (timeInUserZone.getMonth() + 1).toString().padStart(2, "0");
      const day = timeInUserZone.getDate().toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const payload = {
        step_id: inProgressStepId,
        current_time: formattedTime,
        current_date: formattedDate,
          timezone:userTimeZone

      };

      try {
        const response = await axios.post(
          `${API_BASE_URL}/update-saved-time`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status) {
          const delay = response?.data?.data;
          // Optional: setStepDelay(delay);
        }
      } catch (error) {
        console.log("Error while sending current time", error);
      }
    };

    // Call it once immediately
    savePositiveTime();

    // Then every 5 seconds
    const intervalId = setInterval(() => {
      if (!showNegativeCounter && meetingData?.delay === null) {
        savePositiveTime();
      }
    }, 5000); // 5000 ms = 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [meetingData, activeStepIndex, showNegativeCounter]);

  useEffect(() => {
    const getMeetingByID = async (meetingID) => {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      // 👇 URL dynamically create karo
      let url = `${API_BASE_URL}/meetings/${meetingID}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`;
      if (callApi) {
        url += `&do_continue_change_cal=true`;
      }

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status) {
          // console.log("response from getMeeting by ID ->", response?.data?.data);
          setMeetingData(response?.data?.data);
          setDecision(
            response?.data?.data?.steps?.map((step) => step?.decision)
          );

          // setActiveStepIndex(0);
          const inProgressIndex = response.data?.data?.steps.findIndex(
            (step) => step?.step_status === "in_progress" || step?.step_status === "to_finish"
          );
           const toFinishIndex = response.data?.data?.steps.findIndex(
            (step) => step?.step_status === "to_finish"
          );
          if (inProgressIndex !== -1) {
            setActiveStepIndex(inProgressIndex);
            setTimerKey(prev => prev + 1);
          }
          //  else if (response.data?.data?.status === "to_finish") {
          //   setActiveStepIndex(toFinishIndex);
          // }
          const negativeTimes = response?.data?.data?.steps?.map((step) => {
            if (step.negative_time) return parseInt(step.negative_time);
          });
          // console.log("negativeTimes", negativeTimes);
          setNegativeTimes(negativeTimes);
          return response;
        }
      } catch (error) {
        // console.log("error", error);
        return error.response;
      } finally {
        // 👇 reset callApi to false after API call
        // if (callApi) setCallApi(false);
      }
    };
    getMeetingByID(id);
  }, [id, callApi]);

  /**------------------------------------------------------------------------------------------------------------------------------------------------ */
  // HANDLER FUNCTIONS:
  const handleSetSavedTime = useCallback((time) => {
    setSavedTime(time);
  }, []);

  const setNextActiveStep = useCallback(() => {
    if (!meetingData) return;
    const stepsArray = meetingData?.steps;
    if (activeStepIndex !== stepsArray?.length - 1) {
      let stepsArray = meetingData?.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });

      // STEP 2: SET ACTIVE STEP:
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      setNextStepTrigger(nextStepTrigger + 1);
    } else {
      return;
    }
  }, [meetingData, activeStepIndex, savedTime]);

  const setPreviousActiveStep = useCallback(() => {
    if (!meetingData) return;
    // console.log("Saved Time", savedTime);
    const stepsArray = meetingData?.steps;
    if (activeStepIndex !== 0) {
      let stepsArray = meetingData?.steps;
      const activeStep = stepsArray[activeStepIndex];
      activeStep.savedTime = parseInt(savedTime);
      stepsArray[activeStepIndex] = activeStep;
      setMeetingData((prevState) => {
        return {
          ...prevState,
          steps: stepsArray,
        };
      });
      //STEP@: SET ACTIVE STEP:
      const previousIndex = activeStepIndex - 1;
      setActiveStepIndex(previousIndex);
      setPreviousStepTrigger(previousStepTrigger + 1);
    }
  }, [meetingData, activeStepIndex, savedTime]);

  return (
    <ErrorBoundary>
      <CounterContext.Provider
        value={{
          // COUNT DOWN TIMER STATES:
          meetingData,
          activeStepIndex,
          savedTime,
          negativeTimes,
          nextStepTrigger,
          previousStepTrigger,
          stepDelay,

          setNextStepTrigger,
          setPreviousStepTrigger,
          setNegativeTimes,
          setActiveStepIndex,
          setMeetingData,
          setSavedTime,
          handleSetSavedTime,
          setNextActiveStep,
          setPreviousActiveStep,
          setStepDelay,

          setShowNegativeCounter,
          showNegativeCounter,
          setDecision,
          decision,

          setCallApi,
          callApi,
          timerKey,
          incrementTimerKey,
        }}
      >
        {children}
      </CounterContext.Provider>
    </ErrorBoundary>
  );
};

//const updateStepTime = async () => {
//     try {
//         console.log("API CALL-->");
//         const response = await axios.put(
//             `${API_BASE_URL}/meetings/${id}`,
//             meetingData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${CookieService.get("token")}`,
//                 },
//             }
//         );
//         if (response.status) {
//             console.log("response from updateMeeting ->", response.data.data);
//             return response;
//         }

//     } catch (error) {
//         console.log("error", error);
//         return error.response;
//     }
// }
