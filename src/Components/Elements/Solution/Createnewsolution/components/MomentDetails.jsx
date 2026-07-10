import CookieService from '../../../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import { API_BASE_URL } from "../../../../Apicongfig";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useSolutions } from "../../../../../context/SolutionsContext";

const MomentDetail = ({ setActiveTab }) => {
  const {
    formState,
    setFormState,
    handleInputBlur,
    solution,
    getSolution,
    checkId,
    isUpdated,
    handleCloseModal,
  } = useSolutionFormContext();

  const [t] = useTranslation("global");
  const [options, setOptions] = useState([]);

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const userId = CookieService.get("user_id");
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingQuit, setLoadingQuit] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ["png", "jpg", "jpeg"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedExtensions.includes(fileExtension) || !allowedMimeTypes.includes(file.type)) {
      toast.error(t("messages.logoInvalidType"));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat-application");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/drrk2kqvy/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      setFormState((prevState) => ({
        ...prevState,
        logo: data.secure_url,
      }));
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Error uploading logo");
    }
  };

  useEffect(() => {
    if (checkId) {
      getSolution(checkId);
    }
  }, [checkId]);

  useEffect(() => {
    if (solution) {
      setFormState((prevState) => ({
        ...prevState,
        title: solution.title || "",
        problem_to_resolve: solution.problem_to_resolve || "",
        solution_to_bring: solution.solution_to_bring || "",
        how_it_fixes: solution.how_it_fixes || "",
        logo: solution.logo || "",
      }));
    }
  }, [solution, setFormState]);

const validateForm = () => {
    let validationErrors = {};
    let errorMessage = "";

    if (!formState.title) {
      validationErrors.title = t("meeting.formState.title");
      if (!errorMessage) errorMessage = validationErrors.title;
    }

    if (!formState.problem_to_resolve?.trim()) {
      validationErrors.problem_to_resolve =
        t("solution.newMeeting.errors.problemToResolve") ||
        "The problem you resolve is required";
      if (!errorMessage) errorMessage = validationErrors.problem_to_resolve;
    }

    if (!formState.solution_to_bring?.trim()) {
      validationErrors.solution_to_bring =
        t("solution.newMeeting.errors.solutionToBring") ||
        "The solution you bring is required";
      if (!errorMessage) errorMessage = validationErrors.solution_to_bring;
    }

    if (!formState.how_it_fixes?.trim()) {
      validationErrors.how_it_fixes =
        t("solution.newMeeting.errors.howItFixes") ||
        "How it will fix it is required";
      if (!errorMessage) errorMessage = validationErrors.how_it_fixes;
    }

    setErrors(validationErrors);

    if (errorMessage) {
      toast.error(errorMessage.trim());
    }

    return Object.keys(validationErrors).length === 0;
  };

  const handleSaveAndContinue = async () => {
    if (validateForm()) {
      setLoading(true); // Show loader
      try {
        await handleInputBlur();
        setActiveTab("tab2");
      } catch (error) {
        toast.error("Error occurred");
      } finally {
        setLoading(false); // Hide loader
      }
    }
  };

  const handleSaveAndQuit = async () => {
    if (validateForm()) {
      setLoadingQuit(true); // Show loader
      try {
        await handleInputBlur();
        handleCloseModal();
      } catch (error) {
        toast.error("Error occurred");
      } finally {
        setLoadingQuit(false); // Hide loader
        navigate(`/solution/${checkId}`);
      }
    }
  };

  return (
    <>
      <div className="col-md-12 p-1 modal-height">
        <div className="p-4 pb-1 create-moment-modal modal-body">
          <div className="row form">
            <div className="mb-2 col-12">
              <label className="form-label">
                {t("solution.SolutionObjective")}{" "}
                <small style={{ color: "red", fontSize: "15px" }}>*</small>
              </label>
              <input
                type="text"
                required
                className="form-control"
                value={formState.title}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    title: e.target.value,
                  }))
                }
              />
            </div>
            <div className="mb-2 col-12">
              <label className="form-label">Logo</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {formState.logo && (
                <div className="mt-2">
                  <img
                    src={formState.logo}
                    alt="Logo"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                </div>
              )}
            </div>
          </div>

          <div
            className="col-lg-12 form d-flex flex-column gap-2 mt-2"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="mb-2 col-md-12">
              <label className="form-label">
                {t("solution.newMeeting.labels.problemToResolve") ||
                  "The problem you resolve"}
                <small style={{ color: "red", fontSize: "15px" }}>*</small>

              </label>
              <textarea
                className="form-control"
                rows={4}
                value={formState.problem_to_resolve || ""}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    problem_to_resolve: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mb-2 col-md-12">
              <label className="form-label">
                {t("solution.newMeeting.labels.solutionToBring") ||
                  "The solution you bring"}
                <small style={{ color: "red", fontSize: "15px" }}>*</small>

              </label>
              <textarea
                className="form-control"
                rows={4}
                value={formState.solution_to_bring || ""}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    solution_to_bring: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mb-2 col-md-12">
              <label className="form-label">
                {t("solution.newMeeting.labels.howItFixes") ||
                  "How it will fix it"}
                <small style={{ color: "red", fontSize: "15px" }}>*</small>

              </label>
              <textarea
                className="form-control"
                rows={4}
                value={formState.how_it_fixes || ""}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    how_it_fixes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div
          className={`modal-footer px-4 d-flex justify-content-end modal-save-button gap-4`}
        >
          {isUpdated && (
            <Button
              variant="danger"
              onClick={handleSaveAndQuit}
              disabled={loadingQuit}
              style={{ padding: "9px" }}
            >
              {loadingQuit ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "white",
                    margin: "5px 82px",
                  }}
                />
              ) : (
                <>&nbsp;{t("meeting.formState.Save and Quit")}</>
              )}
            </Button>
          )}
          <button
            className="btn moment-btn"
            onClick={handleSaveAndContinue}
            disabled={loading}
          >
            {loading ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "white",
                  margin: "5px 82px",
                }}
              />
            ) : (
              <>
                &nbsp;{t("meeting.formState.Save and Continue")}
                <span>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.549C13.3804 16.4778 13.3243 16.393 13.2865 16.2996C13.2488 16.2062 13.2303 16.1062 13.2321 16.0055C13.2338 15.9048 13.2559 15.8055 13.2969 15.7135C13.3379 15.6215 13.397 15.5387 13.4707 15.4699L16.1907 12.7499H6C5.80109 12.7499 5.61032 12.671 5.46967 12.5303C5.32902 12.3897 5.25 12.1989 5.25 11.9999C5.25 11.801 5.32902 11.6103 5.46967 11.4696C5.61032 11.329 5.80109 11.2499 6 11.2499H16.1907L13.4707 8.52991Z"
                      fill="white"
                    />
                  </svg>
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default MomentDetail;