import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../Apicongfig";
import {
  formatDate,
  formatTime,
} from "../Meeting/GetMeeting/Helpers/functionHelper";
import "./ActionAssignmentPopup.css";

/**
 * ActionAssignmentPopup
 *
 * Fetches all steps assigned to the current user that are in "to_accept" status,
 * then displays them one-by-one so the user can:
 *   - Accept & Estimate  → sets step_status to "in_progress" and opens the step
 *   - Refuse             → sets step_status to "to_assign"
 *   - Answer Later       → dismisses that card for this session (status unchanged)
 */
const ActionAssignmentPopup = ({ step: initialStep, onRefresh }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  const userId =
    CookieService.get("user_id") || sessionStorage.getItem("user_id");

  // If the passed-in step already has to_accept status, seed the list immediately
  // so the popup appears instantly without waiting for the API response.
  const initialPending =
    initialStep &&
    (initialStep.step_status === "to_accept" ||
      initialStep.status === "to_accept")
      ? [initialStep]
      : [];

  // Only handle the single step passed as initialStep
  const [pendingSteps, setPendingSteps] = useState(initialPending);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(true);

  // Estimation state
  const [showEstimate, setShowEstimate] = useState(false);
  const [selectedCount, setSelectedCount] = useState(1);
  const [isValidating, setIsValidating] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch logic disabled to respect "Only show the open step" requirement
  // -----------------------------------------------------------------------
  const fetchPendingSteps = useCallback(async () => {
    // If no initial step, we could fetch others, but the user wants exclusivity.
    // For now, we rely solely on initialStep.
    setFetched(true);
  }, []);

  useEffect(() => {
    if (!initialStep) {
      fetchPendingSteps();
    }
  }, [fetchPendingSteps, initialStep]);

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  const currentStep = pendingSteps[currentIndex];

  const advance = () => {
    if (currentIndex < pendingSteps.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // All steps handled – close popup
      setPendingSteps([]);
    }
  };

  const removeCurrentStep = () => {
    setPendingSteps((prev) => prev.filter((_, i) => i !== currentIndex));
    setShowEstimate(false);
    // currentIndex stays the same; the next item will slide in
  };

  const handleIncrementCount = () => {
    setSelectedCount((prev) => parseInt(prev) + 1);
  };

  const handleDecrementCount = () => {
    setSelectedCount((prev) => Math.max(parseInt(prev) - 1, 0));
  };

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------
  const handleAcceptAndEstimate = () => {
    if (!currentStep) return;
    // Set default duration from step if available
    setSelectedCount(currentStep.count2 || currentStep.count1 || 1);
    setShowEstimate(true);
  };

  const handleValidateEstimate = async () => {
    if (!currentStep) return;
    setIsValidating(true);
    try {
      const now = new Date();
      const formattedTime = formatTime(now);
      const formattedDate = formatDate(now);

      // Destructure to remove assigned_to and avoid sending redundant data structures per previous requirements
      // const { assigned_to, ...stepData } = currentStep;

      await axios.post(
        `${API_BASE_URL}/steps/${currentStep.id}`,
        {
          ...currentStep,
          step_status: null,
          status: "active",
          current_time: formattedTime,
          current_date: formattedDate,
          count1: Number(selectedCount),
          count2: Number(selectedCount),
          time: Number(selectedCount),
          _method: "put",

        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );

      toast.success(t("actionAssignment.acceptSuccess"));

      if (onRefresh) {
        // Just refresh the data instead of full reload
        onRefresh();
        removeCurrentStep();
      } else {
        // Fallback to reload if no refresh function provided
        window.location.reload();
      }
    } catch (error) {
      console.error("ActionAssignmentPopup: validate error", error);
      toast.error(t("actionAssignment.errorMessage"));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRefuse = () => {
    // When refusing the specific open step, we just close the popup
    setPendingSteps([]);
  };

  const handleAnswerLater = () => {
    // Disable later for explicit single step handling
    setPendingSteps([]);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  // Only hide while loading if we have nothing to show yet.
  // Once fetched (or seeded with an initialStep), always render.
  if ((!fetched && loading) || pendingSteps.length === 0 || !currentStep) {
    return null;
  }

  const creatorName = currentStep?.step_creator
    ? `${currentStep.step_creator.name ?? ""} ${currentStep.step_creator.last_name ?? ""}`.trim()
    : currentStep?.meeting?.user
      ? `${currentStep.meeting.user.first_name ?? ""} ${currentStep.meeting.user.last_name ?? ""}`.trim()
      : currentStep?.created_by_user
        ? `${currentStep.created_by_user.first_name ?? ""} ${currentStep.created_by_user.last_name ?? ""}`.trim()
        : t("actionAssignment.unknownCreator");

  const actionName = currentStep?.title ?? "";
  const meetingName = currentStep?.meeting?.title ?? "";
  const timeUnit = currentStep?.time_unit || "minutes";

  return (
    <div className="aap-overlay" role="dialog" aria-modal="true">
      <div className="aap-card">
        {/* Header */}
        <div className="aap-header">
          <span className="aap-badge">
            {showEstimate && t("actionAssignment.estimation")}
          </span>
          <h5 className="aap-title">
            {showEstimate
              ? t("actionAssignment.estimateTitle")
              : t("actionAssignment.title")}
          </h5>
        </div>

        {/* Body */}
        <div className="aap-body">
          {!showEstimate ? (
            <>
              <p className="aap-message">
                {t("actionAssignment.message", {
                  creator: creatorName,
                  action: actionName,
                })}
              </p>

              {meetingName && (
                <p className="aap-sub">
                  <span className="aap-label">
                    {t("actionAssignment.moment")}
                  </span>{" "}
                  {meetingName}
                </p>
              )}
            </>
          ) : (
            <div className="aap-estimation-container">
              <p className="aap-label mb-3">
                {t("meeting.newMeeting.Step duration")}
              </p>
              <div className="aap-duration-row">
                <div className="aap-counter-group">
                  <button
                    className="aap-counter-btn"
                    onClick={handleDecrementCount}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 8H12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={selectedCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        setSelectedCount(value);
                      }
                    }}
                    className="aap-duration-input"
                  />

                  <button
                    className="aap-counter-btn"
                    onClick={handleIncrementCount}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M8 4V12M12 8H4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <span className="aap-unit-label">
                  {t(
                    timeUnit === "days"
                      ? "days"
                      : timeUnit === "hours"
                        ? "hour"
                        : timeUnit === "seconds"
                          ? "sec"
                          : "minutes",
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / actions */}
        <div className="aap-footer">
          {!showEstimate ? (
            <>
              <button
                className="aap-btn aap-btn--accept"
                onClick={handleAcceptAndEstimate}
              >
                {t("actionAssignment.accept")}
              </button>
              <button
                className="aap-btn aap-btn--refuse"
                onClick={handleRefuse}
              >
                {t("actionAssignment.refuse")}
              </button>
              <button
                className="aap-btn aap-btn--later"
                onClick={handleAnswerLater}
              >
                {t("actionAssignment.later")}
              </button>
            </>
          ) : (
            <>
              <button
                className="aap-btn aap-btn--accept"
                onClick={handleValidateEstimate}
                disabled={isValidating}
              >
                {isValidating ? t("Saving...") : t("actionAssignment.validate")}
              </button>
              <button
                className="aap-btn aap-btn--later"
                onClick={() => setShowEstimate(false)}
                disabled={isValidating}
              >
                {t("actionAssignment.cancel")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionAssignmentPopup;
