import { useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../Components/Apicongfig";


export const runStepTranscription = async (meeting) => {
  console.log("meeting aja",meeting)
  if (
    !meeting?.meeting_notes_transcript?.timestamps?.length ||
    !meeting?.steps?.length
  ) return;

  const parseDurationToSeconds = (duration) => {
    if (!duration) return 0;
    const dayMatch = duration.match(/(\d+)\s*(day|days)/i);
    const hourMatch = duration.match(/(\d+)\s*(hour|hours)/i);
    const minuteMatch = duration.match(/(\d+)\s*(min|mins)/i);
    const secondMatch = duration.match(/(\d+)\s*(sec|secs)/i);
    const days = dayMatch ? parseInt(dayMatch[1]) * 86400 : 0;
    const hours = hourMatch ? parseInt(hourMatch[1]) * 3600 : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) * 60 : 0;
    const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;
    return days + hours + minutes + seconds;
  };

  const calculateStepStartTimes = (steps) => {
    let currentStartTime = 0;
    return steps.map((step) => {
      const durationInSeconds = parseDurationToSeconds(step?.time_taken);
      const result = {
        ...step,
        startTime: currentStartTime,
        endTime: currentStartTime + durationInSeconds,
      };
      currentStartTime += durationInSeconds;
      return result;
    });
  };

  const stepsWithTimes = calculateStepStartTimes(meeting.steps);

  for (const step of stepsWithTimes) {
    if (step?.original_note) continue;

    const stepTranscription = meeting.meeting_notes_transcript.timestamps.filter(
      (entry) =>
        Number(entry.start_time) >= Number(step.startTime) &&
        Number(entry.end_time) <= Number(step.endTime)
    );

    if (!stepTranscription?.length) continue;

    const payload = {
      step_id: step.id,
      original_note: stepTranscription.map((entry) => entry.word).join(" "),
    };

    try {
      await axios.post(`${API_BASE_URL}/save-step-original-notes`, payload);
    } catch (error) {
      console.error(`Failed to save transcription for step ${step.id}`, error);
    }
  }
};
