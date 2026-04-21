import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";

const TranscriptComponent = ({
  steps,
  stepId,
  step,
  setStep,
  loading,
  setLoading,
  setView,
}) => {
  const [t] = useTranslation("global");
  // Function to parse duration like "9 mins 34 secs" into seconds
  const parseDurationToSeconds = (duration) => {
    if (!duration) return 0;

    const dayMatch = duration.match(/(\d+)\s*(day|days)/i);
    const hourMatch = duration.match(/(\d+)\s*(hour|hours)/i);
    const minuteMatch = duration.match(/(\d+)\s*(min|mins)/i);
    const secondMatch = duration.match(/(\d+)\s*(sec|secs)/i);

    const days = dayMatch ? parseInt(dayMatch[1], 10) * 86400 : 0; // 1 day = 86400 seconds
    const hours = hourMatch ? parseInt(hourMatch[1], 10) * 3600 : 0; // 1 hour = 3600 seconds
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) * 60 : 0; // 1 min = 60 seconds
    const seconds = secondMatch ? parseInt(secondMatch[1], 10) : 0;

    return days + hours + minutes + seconds;
  };

  // Calculate start times for each step
  const calculateStepStartTimes = (steps) => {
    if (!steps) {
      return [];
    }
    let currentStartTime = 0;
    return steps?.map((step) => {
      const durationInSeconds = parseDurationToSeconds(step?.time_taken);
      const stepWithStartTime = {
        ...step,
        startTime: currentStartTime,
        endTime: currentStartTime + durationInSeconds,
      };
      currentStartTime += durationInSeconds; // Update start time for the next step
      return stepWithStartTime;
    });
  };

  // Calculate step start times
  const stepsWithStartTimes = calculateStepStartTimes(steps);
  const [meetingTranscriptWithTimestamps, setMeetingTranscriptWithTimestamps] =
    useState(null);
  useEffect(() => {
    if (step) {
      setMeetingTranscriptWithTimestamps(
        step?.meeting?.meeting_notes_transcript?.timestamps
      );
    }
  }, [step]);

  // Find the step with the matching ID
  const selectedStep = stepsWithStartTimes?.find((step) => step?.id === stepId);
  // Get transcription for the selected step
  const stepTranscription = meetingTranscriptWithTimestamps?.filter(
    (entry) =>
      Number(entry.start_time) >= Number(selectedStep?.startTime) &&
      Number(entry.end_time) <= Number(selectedStep?.endTime)
  );

  const apiCallInProgress = useRef(false);

  useEffect(() => {
    const fetchStepTranscription = async () => {
      if (step?.original_note !== null && step?.original_note !== undefined)
        return;
      if (apiCallInProgress.current) return; // Prevent multiple calls

      const originalNote = stepTranscription?.length
        ? stepTranscription.map((entry) => entry.word).join(" ")
        : "";

      if (!originalNote) return; // Avoid sending empty data
      const payload = {
        step_id: step?.id,
        original_note: stepTranscription
          ?.map((entry) => entry?.word)
          ?.join(" "),
      };
      try {
        apiCallInProgress.current = true; // Set flag to true before making API call

        setLoading(true);
        const response = await axios.post(
          `${API_BASE_URL}/save-step-original-notes`,
          payload
        );
        if (response?.status === 200) {
          setStep((prevStep) => ({
            ...prevStep,
            note: response.data?.data?.note,
            original_note: response.data?.data?.original_note,
          }));
          setView("note");
          setLoading(false);
        }
      } catch (error) {
        console.log("error while fetching step transcription", error);
        setLoading(false);
      } finally {
        apiCallInProgress.current = false; // Reset flag after API call completes
      }
    };
    if (step?.original_note === null && step?.note === null) {
      fetchStepTranscription();
    }
  }, [stepTranscription]);

  if (!selectedStep) {
    return <div>No matching step found.</div>;
  }

  return (
    <div>
      {loading ? (
        <>
          <div className="progress-container">
            <div className="progress" style={{ width: `${50}%` }} />
          </div>
          <h5 className="text-center">
            {t("note_translation.Processing Step Note")}
          </h5>
        </>
      ) : (
        <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
          <p>
            {stepTranscription?.length > 0
              ? stepTranscription.map((entry) => entry?.word)?.join(" ")
              : t("note_translation.No transcription available for this step.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptComponent;
