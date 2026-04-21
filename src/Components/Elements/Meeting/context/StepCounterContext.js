import CookieService from '../../../Utils/CookieService';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../Apicongfig";
import axios from "axios";
import ErrorBoundary from "../../../Utils/ErrorBoundary";
import { formatDate, formatTime } from "../GetMeeting/Helpers/functionHelper";

const StepCounterContext = createContext();

export const useStepCounterContext = () => {
  const context = useContext(StepCounterContext);
  if (!context) {
    throw new Error(
      "useStepCounterContext must be used within a HeaderTitleProvider"
    );
  }
  return context;
};

export const StepCounterContextProvider = ({ children }) => {
  //centralized states for count down timer.
  const { id, step_Id } = useParams();
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(true)
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [negativeTimes, setNegativeTimes] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);

  const [stepDelay, setStepDelay] = useState(null); // New state for step delay
  const [nextStepTrigger, setNextStepTrigger] = useState(0);
  const [previousStepTrigger, setPreviousStepTrigger] = useState(0);
  const [isReestimateModalOpen, setIsReestimateModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.pathname?.includes("/act%C4%ABon-play/")) return
    if (meetingData && meetingData?.steps && (meetingData?.steps[activeStepIndex]?.step_status === "to_finish" || stepDelay?.step_status === "to_finish")) {
      const stepId = meetingData?.steps[activeStepIndex]?.id;
      navigate(`/step/${stepId}`, { state: { meeting: meetingData } });
    }
  }, [location.pathname, meetingData, activeStepIndex, navigate, stepDelay]);

  const isDelayedOrNegative = useMemo(() => {
    return (
      meetingData?.steps?.[activeStepIndex]?.delay !== null ||
      negativeTimes[activeStepIndex] > 0
    );
  }, [meetingData?.steps, activeStepIndex, negativeTimes]);

  useEffect(() => {
    if (!location.pathname?.includes("/act%C4%ABon-play/")) return;
    if (isReestimateModalOpen) return;

    if (
      meetingData &&
      meetingData?.steps &&
      meetingData?.steps[activeStepIndex]?.step_status === "in_progress"
    ) {
      if (!isDelayedOrNegative) return;

      const sendCurrentTime = async () => {
        const inProgressStep = meetingData?.steps[activeStepIndex];
        const inProgressStepId = inProgressStep?.id;

        // Exit if there's no in-progress step
        if (!inProgressStepId) return;

        const currentTime = new Date();
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const options = { timeZone: userTimeZone };
        const timeInUserZone = new Date(
          currentTime.toLocaleString("en-US", options)
        );

        // Format date & time
        const day = timeInUserZone.getDate().toString().padStart(2, "0");
        const month = (timeInUserZone.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const year = timeInUserZone.getFullYear();
        const formattedDate = `${year}-${month}-${day}`;

        const hours = timeInUserZone.getHours();
        const minutes = timeInUserZone.getMinutes();
        const seconds = timeInUserZone.getSeconds();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedSeconds = seconds.toString().padStart(2, "0");
        const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;

        const payload = {
          delay_seconds: 30, // ✅ Fixed at 30 as requested
          step_id: inProgressStepId,
          current_time: formattedTime,
          current_date: formattedDate,
          timezone: userTimeZone,
        };

        try {
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

          if (response?.status) {
            const delay = response?.data?.data;
            setStepDelay(delay);
            if (delay?.step_status === "to_finish") {
              navigate(`/step/${inProgressStepId}`, {
                state: { meeting: meetingData },
              });
            }
          }
        } catch (error) {
          console.log("error while sending current time", error);
        }
      };

      // Initial call
      sendCurrentTime();

      // Set the interval
      const intervalId = setInterval(() => {
        sendCurrentTime();
      }, 30000); // ✅ Every 30 seconds

      // Cleanup function
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [
    location.pathname,
    meetingData?.id,
    activeStepIndex,
    isDelayedOrNegative,
    navigate,
    isReestimateModalOpen
  ]);

  useEffect(() => {
    if (!location?.pathname?.includes("/act%C4%ABon-play/")) return

    const getMeetingByID = async (meetingID, stepID) => {
      setLoading(true)
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/action-play-details/${meetingID}/${stepID}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&do_continue_change_cal=true`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response.status) {
          setMeetingData(response?.data?.data);
          // Find the active step index based on step_id from params if available
          let activeIndex = 0; // default to first step

          if (step_Id) {
            // Find the step with matching ID
            const stepIndex = response.data?.data?.steps.findIndex(
              step => parseInt(step.id) === parseInt(step_Id)
            );
            if (stepIndex !== -1) {
              activeIndex = stepIndex;
            }
          } else {
            // Fallback to finding first in_progress step if no step_id in params
            const inProgressIndex = response.data?.data?.steps.findIndex(
              step => step?.step_status === "in_progress"
            );
            if (inProgressIndex !== -1) {
              activeIndex = inProgressIndex;
            }
          }

          setActiveStepIndex(activeIndex);

          const negativeTimesArray = response?.data?.data?.steps?.map((step) => {
            return step.negative_time ? parseInt(step.negative_time) : 0;
          });
          setNegativeTimes(negativeTimesArray);
          return response;
        }
      } catch (error) {
        return error.response;
      } finally {
        setLoading(false)
      }
    };
    if (id && step_Id) {
      getMeetingByID(id, step_Id);
    }
  }, [location?.pathname, id, step_Id]);

  const getRefreshMeetingByID = async (meetingID, stepID) => {
    setLoading(true)
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/action-play-details/${meetingID}/${stepID}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}&do_continue_change_cal=true`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        setMeetingData(response?.data?.data);
        // Find the active step index based on step_id from params if available
        let activeIndex = 0; // default to first step

        if (step_Id) {
          // Find the step with matching ID
          const stepIndex = response.data?.data?.steps.findIndex(
            step => parseInt(step.id) === parseInt(step_Id)
          );
          if (stepIndex !== -1) {
            activeIndex = stepIndex;
          }
        } else {
          // Fallback to finding first in_progress step if no step_id in params
          const inProgressIndex = response.data?.data?.steps.findIndex(
            step => step?.step_status === "in_progress"
          );
          if (inProgressIndex !== -1) {
            activeIndex = inProgressIndex;
          }
        }

        setActiveStepIndex(activeIndex);

        const negativeTimesArray = response?.data?.data?.steps?.map((step) => {
          return step.negative_time ? parseInt(step.negative_time) : 0;
        });
        setNegativeTimes(negativeTimesArray);
        return response;
      }
    } catch (error) {
      return error.response;
    } finally {
      setLoading(false)
    }
  };
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
  }, [meetingData, activeStepIndex, savedTime, nextStepTrigger]);

  const setPreviousActiveStep = useCallback(() => {
    if (!meetingData) return;
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
  }, [meetingData, activeStepIndex, savedTime, previousStepTrigger]);

  return (
    <ErrorBoundary>
      <StepCounterContext.Provider
        value={{
          // COUNT DOWN TIMER STATES:
          meetingData,
          activeStepIndex,
          savedTime,
          negativeTimes,
          nextStepTrigger,
          previousStepTrigger,
          stepDelay,
          getRefreshMeetingByID,
          loading,
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
          setSelectedStep,
          selectedStep,
          isReestimateModalOpen,
          setIsReestimateModalOpen,
        }}
      >
        {children}
      </StepCounterContext.Provider>
    </ErrorBoundary>
  );
};
