import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";

const translateText = async (text, targetLang) => {
  if (!text || !text.trim()) return text;
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!response.ok) throw new Error("Translation failed");
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map((x) => x[0]).join("");
    }
    return text;
  } catch (error) {
    console.error("Translation API error:", error);
    return text;
  }
};

const translateLargeText = async (text, targetLang) => {
  if (!text || !text.trim()) return text;
  const paragraphs = text.split("\n");
  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (p) => {
      if (!p.trim()) return p;
      return await translateText(p, targetLang);
    })
  );
  return translatedParagraphs.join("\n");
};

const TranscriptComponent = ({
  steps,
  stepId,
  step,
  setStep,
  loading,
  setLoading,
  setView,
}) => {
  const [t, i18n] = useTranslation("global");
  const { user } = useHeaderTitle();

  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const targetLang = React.useMemo(() => {
    try {
      const userLan = user?.language;
      if (userLan) return userLan;
    } catch (e) {
      console.error("Error reading user language", e);
    }
    return i18n?.language || "fr";
  }, [i18n?.language, user]);

  const cleanTargetLang = targetLang.split(/[-_]/)[0];
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

  useEffect(() => {
    const originalText = stepTranscription?.length
      ? stepTranscription.map((entry) => entry?.word)?.join(" ")
      : "";

    if (step?.meeting?.automatic_translation && originalText) {
      const performTranslation = async () => {
        setIsTranslating(true);
        try {
          const translated = await translateLargeText(originalText, cleanTargetLang);
          setTranslatedText(translated);
        } catch (err) {
          console.error("Error translating step transcript:", err);
        } finally {
          setIsTranslating(false);
        }
      };
      performTranslation();
    } else {
      setTranslatedText(null);
      setShowOriginal(false);
    }
  }, [stepTranscription, step?.meeting?.automatic_translation, cleanTargetLang]);

  if (!selectedStep) {
    return <div>No matching step found.</div>;
  }

  return (
    <div>
      {loading || isTranslating ? (
        <>
          <div className="progress-container">
            <div className="progress" style={{ width: `${50}%` }} />
          </div>
          <h5 className="text-center">
            {isTranslating
              ? (t("note_translation.Processing Transcript") || "Translation in progress...")
              : t("note_translation.Processing Step Note")}
          </h5>
        </>
      ) : (
        <div style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {step?.meeting?.automatic_translation && translatedText && (
            <div className="d-flex justify-content-end mb-2">
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                onClick={() => setShowOriginal((prev) => !prev)}
                style={{
                  fontSize: "0.78rem",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  border: "1px solid #2c48ae",
                  background: showOriginal ? "#fff" : "#2c48ae",
                  color: showOriginal ? "#2c48ae" : "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {showOriginal ? (
                  <>
                    <span style={{ fontSize: "0.9rem" }}>&#127760;</span>
                    {t("Translated") || "Traduit"}
                    <span style={{ opacity: 0.75, fontWeight: 400 }}>
                      &mdash;{cleanTargetLang.toUpperCase()}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "0.9rem" }}>&#128292;</span>
                    {t("Original") || "Original"}
                  </>
                )}
              </button>
            </div>
          )}
          <p>
            {stepTranscription?.length > 0
              ? (step?.meeting?.automatic_translation && translatedText && !showOriginal ? translatedText : stepTranscription.map((entry) => entry?.word)?.join(" "))
              : t("note_translation.No transcription available for this step.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptComponent;
