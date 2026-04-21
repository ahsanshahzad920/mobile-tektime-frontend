import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import { getOptions } from "../../../../Utils/MeetingFunctions";
import { useMeetings } from "../../../../../context/MeetingsContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import SolutionTemplateTab from "./SolutionTemplateTab";

const CustomComponent = ({ setActiveTab, setScreenStep }) => {
  const {
    formState,
    setFormState,
    handleInputBlur,
    meeting,
    // getMeeting,
    getMeetingModal,
    checkId,
    isUpdated,
    isDuplicate,
    handleCloseModal,
    recurrentMeetingAPI,
    setUpdatedButton,
    updatedButton,
    setQuit,
    quit,
    setSelectedTab,
    addParticipant,
    changePrivacy,
    changeContext,
    changeOptions,
  } = useFormContext();
  const { getMeetings } = useMeetings();
  const navigate = useNavigate();
  // const [selectedTab, setSelectedTab] = useState("scratch");
  const [t] = useTranslation("global");
  const [errors, setErrors] = useState({});
  const user = JSON.parse(CookieService.get("user"));
  const roleId = parseInt(user?.role_id);
  const options = getOptions(t, roleId);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);

  // useLayoutEffect(() => {
  //   if (checkId) {
  //     getMeeting(checkId);
  //   }
  // }, [checkId]);
  useEffect(() => {
    if (changePrivacy || changeOptions || addParticipant || changeContext) return
    if (checkId) {
      // Call the API and fetch meeting data
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await getMeetingModal(checkId);
        } catch (error) {
          toast.error("Error fetching meeting data");
        } finally {
          // Hide the loading indicator once the API call is complete
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [checkId]);

  useEffect(() => {
    if (meeting) {
      setFormState((prevState) => ({
        ...prevState,
        type: meeting?.type || "",
        solution_tab: meeting?.solution_tab || "use a template",
        solution_id: meeting?.solution_id || null,
      }));
    }
  }, [meeting, setFormState]);

  const handleTabSelect = (tabName) => {
    setFormState((prevState) => ({
      ...prevState,
      solution_tab: tabName, // Set 'create from scratch' or 'use template'
      solution_id: null, // Reset solution_id if switching tabs
    }));
  };

  useEffect(() => {
    if (formState.type) {
      const selectedIdx = options.findIndex(
        (item) => item.title === formState.type
      );
      setSelectedCard(selectedIdx);
    }
  }, [formState.type, options]);

  const handleCardClick = (idx, title) => {
    setSelectedCard(idx);
    setFormState((prevState) => ({
      ...prevState,
      type: title,
    }));
  };
  const validateForm = () => {
    let validationErrors = {};

    if (!formState.type && formState.solution_tab === "use a template") {
      validationErrors.type = t("meeting.formState.type");
      toast.error(validationErrors.type);
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleSaveAndContinue = async () => {
    if (validateForm()) {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 0));

      try {
        const options = { updatedButton: false, quitAndUpdate: false };
        const newformState = { ...meeting };
        await handleInputBlur(newformState, options);
        setScreenStep(4);
        setActiveTab("tab1");
        setSelectedTab("tab1");
        // navigate(`/invite/${checkId}`, { state: {from: "meeting" } });
      } catch (error) {
        toast.error("Error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  // Set the user's current time when the component mounts
  useEffect(() => {
    const currentTime = moment().startOf("minute"); // Normalize to remove seconds
    setUserTime(currentTime);
  }, []);

  // Calculate the time difference when userTime or meeting details change
  useEffect(() => {
    if (userTime && meeting?.date && meeting?.start_time) {
      const meetingTime = moment(
        `${meeting?.date} ${meeting?.start_time}`,
        "YYYY-MM-DD HH:mm:ss"
      ).startOf("minute"); // Normalize meeting time to remove seconds

      if (meetingTime.isValid()) {
        const diff = meetingTime.diff(userTime, "minutes");
        setTimeDifference(diff);
      } else {
        console.error("Invalid meeting date or time format.");
        setTimeDifference(null); // Reset to null if invalid
      }
    }
  }, [userTime, meeting]);

  const handleSaveAndQuit = async () => {
    if (
      formState?.note_taker == true &&
      meeting?.location === "Google Meet" &&
      timeDifference !== null &&
      timeDifference < 30
    ) {
      toast.warning(t("UpmeetWarning"));
      return;
    }
    if (validateForm()) {
      setLoadingQuit(true); // Show loader
      await new Promise((resolve) => setTimeout(resolve, 0));
      try {
        const options = { updatedButton: true, quitAndUpdate: true };
        const newformState = { ...meeting };
        await handleInputBlur(newformState, options);

        recurrentMeetingAPI();
        handleCloseModal();
        navigate(`/invite/${checkId}`, { state: { from: "meeting" } });
      } catch (error) {
        // Handle error (if any)
        toast.error("Error occurred");
      } finally {
        setLoadingQuit(false); // Hide loader
        setQuit(false);
        setUpdatedButton(false);
        await getMeetings();
      }
    }
  };
  const sortedOptions = options?.sort((a, b) => a.label.localeCompare(b.label));

  if (isLoading) {
    // Show a loading spinner while waiting for the API response
    return (
      <Spinner
        animation="border"
        role="status"
        className="center-spinner"
      ></Spinner>
    );
  }

  return (
    <div className="col-md-12 mt-1 p-4 modal-height solution-new-tabs">
      <div className="row">
        <div className="col-md-12 mt-3 mt-md-0">
          <ul class="nav nav-pills mb-3 row" id="pills-tab" role="tablist">
            <>
              <li class="nav-item col-md-6 mt-2 mt-md-0" role="presentation">
                <button
                  className={`nav-link w-100 ${formState.solution_tab === "use a template" ? "active" : ""}`}
                  id="pills-profile-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#pills-profile"
                  type="button"
                  role="tab"
                  aria-controls="pills-profile"
                  aria-selected={formState.solution_tab === "use a template"}
                  onClick={() => handleTabSelect("use a template")}
                >
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    className="me-2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.8333 1.66667V5H2.16667V1.66667H18.8333ZM18.8333 0H2.16667C1.72464 0 1.30072 0.175595 0.988155 0.488155C0.675595 0.800716 0.5 1.22464 0.5 1.66667V5C0.5 5.44203 0.675595 5.86595 0.988155 6.17851C1.30072 6.49107 1.72464 6.66667 2.16667 6.66667H18.8333C19.2754 6.66667 19.6993 6.49107 20.0118 6.17851C20.3244 5.86595 20.5 5.44203 20.5 5V1.66667C20.5 1.22464 20.3244 0.800716 20.0118 0.488155C19.6993 0.175595 19.2754 0 18.8333 0ZM5.5 10V18.3333H2.16667V10H5.5ZM5.5 8.33333H2.16667C1.72464 8.33333 1.30072 8.50893 0.988155 8.82149C0.675595 9.13405 0.5 9.55797 0.5 10V18.3333C0.5 18.7754 0.675595 19.1993 0.988155 19.5118C1.30072 19.8244 1.72464 20 2.16667 20H5.5C5.94203 20 6.36595 19.8244 6.67851 19.5118C6.99107 19.1993 7.16667 18.7754 7.16667 18.3333V10C7.16667 9.55797 6.99107 9.13405 6.67851 8.82149C6.36595 8.50893 5.94203 8.33333 5.5 8.33333ZM18.8333 10V18.3333H10.5V10H18.8333ZM18.8333 8.33333H10.5C10.058 8.33333 9.63405 8.50893 9.32149 8.82149C9.00893 9.13405 8.83333 9.55797 8.83333 10V18.3333C8.83333 18.7754 9.00893 19.1993 9.32149 19.5118C9.63405 19.8244 10.058 20 10.5 20H18.8333C19.2754 20 19.6993 19.8244 20.0118 19.5118C20.3244 19.1993 20.5 18.7754 20.5 18.3333V10C20.5 9.55797 20.3244 9.13405 20.0118 8.82149C19.6993 8.50893 19.2754 8.33333 18.8333 8.33333Z"
                      fill="#687691"
                    />
                  </svg>
                  {t("Use a Template")}
                </button>
              </li>
              {roleId === 1 && (
                <li class="nav-item col-md-6 mt-2 mt-md-0" role="presentation">
                  <button
                    className={`nav-link w-100 ${formState.solution_tab === "create from scratch"
                        ? "active"
                        : ""
                      }`}
                    id="pills-home-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#pills-home"
                    type="button"
                    role="tab"
                    aria-controls="pills-home"
                    aria-selected={
                      formState.solution_tab === "create from scratch"
                    }
                    onClick={() => handleTabSelect("create from scratch")}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="me-2"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 14V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H10V5H5V19H19V14H21Z"
                        fill="#687691"
                      />
                      <path
                        d="M21 7H17V3H15V7H11V9H15V13H17V9H21V7Z"
                        fill="#687691"
                      />
                    </svg>
                    {t("Create from Scratch")}
                  </button>
                </li>
              )}
            </>

          </ul>
        </div>
        <div className="tab-content" id="pills-tabContent">
          <div
            className={`tab-pane fade ${formState.solution_tab === "create from scratch" ? "show active" : ""}`}
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
            tabindex="0"
          >
            <Row className="g-3 mb-3">
              {meeting?.type === "Strategy" ? (
                <Col
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2}
                  // key={idx}
                  className="d-flex justify-content-center"
                >
                  <Card
                    className="text-center shadow-sm"
                    style={{
                      borderRadius: "10px",
                      height: "138px",
                      width: "100%",
                      maxWidth: "138px", // Set max width
                      background: "none",
                      cursor: "pointer",
                      border: "2px solid blue",
                      transform: "scale(1.1)", // Scale the card size up
                      transition: "transform 0.2s ease-in-out", // Smooth transition on hover
                    }}
                  // onClick={() => handleCardClick(idx, item.title)}
                  >
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                      {/* {item.svg} */}
                      <svg
                        height="36"
                        width="37"
                        viewBox="0 0 1024 1024"
                        fill="#000000"
                        class="icon"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path
                            d="M208.508 583.99c-4.406 0-8.078-3.578-8.078-7.998 0-4.422 3.5-8 7.92-8h0.156c4.42 0 8 3.578 8 8a7.994 7.994 0 0 1-7.998 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M999.936 767.966H56.058c-4.422 0-8-3.578-8-8V152.046c0-4.422 3.578-8 8-8h943.876c4.422 0 8 3.578 8 8v607.92a7.992 7.992 0 0 1-7.998 8z m-935.878-15.998h927.88V160.044H64.058v591.924z"
                            fill=""
                          ></path>
                          <path
                            d="M775.964 416.012c-22.058 0-39.994-17.944-39.994-39.994 0-7.016 1.844-13.936 5.342-20.006a8.004 8.004 0 0 1 13.876 7.984 24.02 24.02 0 0 0-3.218 12.022c0 13.232 10.764 23.996 23.996 23.996s23.998-10.764 23.998-23.996a24.12 24.12 0 0 0-3.204-11.966 8 8 0 0 1 2.984-10.914c3.78-2.202 8.702-0.882 10.92 2.976a40.19 40.19 0 0 1 5.296 19.904c0 22.05-17.934 39.994-39.996 39.994z"
                            fill=""
                          ></path>
                          <path
                            d="M775.964 384.016a7.992 7.992 0 0 1-7.998-7.998V216.04c0-4.422 3.576-8 7.998-8s8 3.578 8 8v159.978a7.994 7.994 0 0 1-8 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M855.956 272.032h-63.992a7.994 7.994 0 0 1-7.998-8 7.994 7.994 0 0 1 7.998-7.998h55.994v-15.998h-55.994a7.994 7.994 0 0 1-7.998-8 7.994 7.994 0 0 1 7.998-7.998h63.992a7.994 7.994 0 0 1 7.998 7.998v31.996c0 4.422-3.578 8-7.998 8zM919.948 304.028h-79.99c-4.422 0-8-3.578-8-8a7.994 7.994 0 0 1 8-7.998h79.99a7.994 7.994 0 0 1 7.998 7.998c0 4.422-3.578 8-7.998 8zM919.948 272.032h-31.996c-4.422 0-8-3.578-8-8a7.994 7.994 0 0 1 8-7.998h31.996a7.994 7.994 0 0 1 7.998 7.998c0 4.422-3.578 8-7.998 8z"
                            fill=""
                          ></path>
                          <path
                            d="M919.948 304.028a7.976 7.976 0 0 1-5.656-2.344l-15.998-15.998a7.996 7.996 0 0 1 0-11.31l15.998-15.998a7.996 7.996 0 1 1 11.31 11.31l-10.342 10.342 10.342 10.344a7.996 7.996 0 0 1-5.654 13.654zM208.04 623.984c-26.464 0-47.994-21.528-47.994-47.992 0-26.466 21.53-47.994 47.994-47.994s47.994 21.528 47.994 47.994-21.53 47.992-47.994 47.992z m0-79.988c-17.654 0-31.996 14.342-31.996 31.996 0 17.652 14.342 31.994 31.996 31.994 17.638 0 31.996-14.342 31.996-31.994 0-17.654-14.358-31.996-31.996-31.996zM256.034 535.996a7.95 7.95 0 0 1-5.906-2.61 7.982 7.982 0 0 1 0.516-11.294c184.524-168.486 459.518-138.326 462.268-138.022a7.99 7.99 0 0 1 7 8.876c-0.516 4.366-4.156 7.498-8.876 7.014-2.624-0.32-270.542-29.536-449.612 133.944a7.958 7.958 0 0 1-5.39 2.092z"
                            fill=""
                          ></path>
                          <path
                            d="M679.976 416.012a8.008 8.008 0 0 1-7.154-4.42 8.006 8.006 0 0 1 3.578-10.734l31.996-15.998a8.004 8.004 0 0 1 10.732 3.578 8.004 8.004 0 0 1-3.578 10.732l-31.996 15.998a8.066 8.066 0 0 1-3.578 0.844z"
                            fill=""
                          ></path>
                          <path
                            d="M711.972 400.014c-1.204 0-2.42-0.274-3.576-0.844l-31.996-15.998a8.004 8.004 0 0 1-3.578-10.732c1.984-3.954 6.78-5.514 10.732-3.578l31.996 15.998a8.006 8.006 0 0 1 3.578 10.734 8.008 8.008 0 0 1-7.156 4.42zM496.002 296.028a7.976 7.976 0 0 1-5.656-2.344l-31.996-31.996a8 8 0 0 1 11.312-11.31l31.996 31.996a7.996 7.996 0 0 1-5.656 13.654z"
                            fill=""
                          ></path>
                          <path
                            d="M464.006 296.028a7.996 7.996 0 0 1-5.656-13.654l31.996-31.996a8 8 0 0 1 11.312 11.31l-31.996 31.996a7.976 7.976 0 0 1-5.656 2.344z"
                            fill=""
                          ></path>
                          <path
                            d="M480.004 320.026c-26.464 0-47.994-21.53-47.994-47.994s21.53-47.994 47.994-47.994 47.994 21.53 47.994 47.994-21.53 47.994-47.994 47.994z m0-79.99c-17.638 0-31.996 14.35-31.996 31.996s14.358 31.996 31.996 31.996c17.654 0 31.996-14.35 31.996-31.996s-14.342-31.996-31.996-31.996zM264.016 368.018a7.986 7.986 0 0 1-5.656-2.342l-47.994-47.994a7.996 7.996 0 1 1 11.31-11.31l47.994 47.992a8 8 0 0 1-5.654 13.654z"
                            fill=""
                          ></path>
                          <path
                            d="M216.022 368.018a8 8 0 0 1-5.656-13.654l47.994-47.992a8 8 0 0 1 11.312 11.31l-47.994 47.994a7.982 7.982 0 0 1-5.656 2.342zM447.992 647.982a7.976 7.976 0 0 1-5.656-2.344l-31.996-31.996a8 8 0 0 1 11.312-11.31l31.996 31.996a7.996 7.996 0 0 1-5.656 13.654z"
                            fill=""
                          ></path>
                          <path
                            d="M415.996 647.982a7.996 7.996 0 0 1-5.656-13.654l31.996-31.996a8 8 0 0 1 11.312 11.31l-31.996 31.996a7.968 7.968 0 0 1-5.656 2.344z"
                            fill=""
                          ></path>
                          <path
                            d="M432.01 671.978c-26.464 0-47.994-21.53-47.994-47.994s21.53-47.992 47.994-47.992 47.994 21.528 47.994 47.992-21.53 47.994-47.994 47.994z m0-79.99c-17.654 0-31.996 14.344-31.996 31.996 0 17.654 14.342 31.996 31.996 31.996 17.638 0 31.996-14.342 31.996-31.996 0-17.652-14.358-31.996-31.996-31.996zM647.982 591.988a7.976 7.976 0 0 1-5.656-2.344l-47.994-47.992a8 8 0 1 1 11.312-11.312l47.992 47.994a7.996 7.996 0 0 1-5.654 13.654z"
                            fill=""
                          ></path>
                          <path
                            d="M599.988 591.988a7.996 7.996 0 0 1-5.656-13.654l47.994-47.994a8 8 0 0 1 11.31 11.312l-47.992 47.992a7.964 7.964 0 0 1-5.656 2.344zM831.958 663.98a7.976 7.976 0 0 1-5.654-2.344l-31.996-31.996a7.996 7.996 0 1 1 11.31-11.31l31.996 31.994a8 8 0 0 1-5.656 13.656z"
                            fill=""
                          ></path>
                          <path
                            d="M799.962 663.98a8 8 0 0 1-5.656-13.656l31.996-31.994a7.996 7.996 0 1 1 11.31 11.31l-31.996 31.996a7.964 7.964 0 0 1-5.654 2.344z"
                            fill=""
                          ></path>
                          <path
                            d="M815.96 687.976c-26.466 0-47.994-21.528-47.994-47.994 0-26.464 21.528-47.994 47.994-47.994 26.464 0 47.992 21.53 47.992 47.994 0.002 26.468-21.526 47.994-47.992 47.994z m0-79.99c-17.638 0-31.996 14.342-31.996 31.996s14.358 31.996 31.996 31.996c17.636 0 31.996-14.342 31.996-31.996s-14.358-31.996-31.996-31.996z"
                            fill=""
                          ></path>
                          <path
                            d="M527.998 96.052h-31.996c-4.422 0-8-3.576-8-7.998V56.058a7.994 7.994 0 0 1 8-7.998h31.996a7.994 7.994 0 0 1 7.998 7.998v31.996a7.994 7.994 0 0 1-7.998 7.998zM504 80.056h15.998v-15.998H504v15.998z"
                            fill=""
                          ></path>
                          <path
                            d="M1015.934 160.044H8.064a7.994 7.994 0 0 1-7.998-7.998V88.054a7.994 7.994 0 0 1 7.998-7.998h1007.87c4.422 0 8 3.576 8 7.998v63.992a7.994 7.994 0 0 1-8 7.998zM16.064 144.046h991.872V96.052H16.064v47.994z"
                            fill=""
                          ></path>
                          <path
                            d="M967.942 128.048H56.058c-4.422 0-8-3.576-8-7.998s3.578-8 8-8H967.94c4.42 0 7.998 3.578 7.998 8s-3.576 7.998-7.996 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M727.972 975.94a8.176 8.176 0 0 1-3.578-0.844l-215.972-107.986a8.002 8.002 0 0 1-3.578-10.732 8.008 8.008 0 0 1 10.734-3.578l215.97 107.986a8.002 8.002 0 0 1 3.578 10.732 8.02 8.02 0 0 1-7.154 4.422zM791.962 975.94a8.16 8.16 0 0 1-3.576-0.844l-279.964-139.982a8 8 0 0 1-3.578-10.732 8.008 8.008 0 0 1 10.734-3.578l279.962 139.982c3.954 1.968 5.544 6.782 3.578 10.732a8.02 8.02 0 0 1-7.156 4.422z"
                            fill=""
                          ></path>
                          <path
                            d="M791.962 975.94h-63.99c-4.422 0-8-3.578-8-7.998 0-4.422 3.578-8 8-8h63.99c4.422 0 8 3.578 8 8a7.994 7.994 0 0 1-8 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M296.042 975.94a8.02 8.02 0 0 1-7.17-4.422 8 8 0 0 1 3.578-10.732L508.422 852.8a8.004 8.004 0 0 1 10.732 3.578 7.988 7.988 0 0 1-3.576 10.732l-215.972 107.986a8.072 8.072 0 0 1-3.564 0.844zM232.05 975.94a8.024 8.024 0 0 1-7.17-4.422 8 8 0 0 1 3.578-10.732l279.964-139.982a8.004 8.004 0 0 1 10.732 3.578 7.988 7.988 0 0 1-3.576 10.732l-279.964 139.982a8.072 8.072 0 0 1-3.564 0.844z"
                            fill=""
                          ></path>
                          <path
                            d="M296.028 975.94h-63.992a7.994 7.994 0 0 1-7.998-7.998c0-4.422 3.578-8 7.998-8h63.992c4.422 0 8 3.578 8 8a7.996 7.996 0 0 1-8 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M496.002 843.958c-4.422 0-8-3.578-8-8v-75.99a7.994 7.994 0 0 1 8-7.998 7.994 7.994 0 0 1 7.998 7.998v75.99c0 4.42-3.578 8-7.998 8z"
                            fill=""
                          ></path>
                          <path
                            d="M527.998 843.958c-4.422 0-8-3.578-8-8v-75.99a7.994 7.994 0 0 1 8-7.998 7.994 7.994 0 0 1 7.998 7.998v75.99c0 4.42-3.578 8-7.998 8z"
                            fill=""
                          ></path>
                          <path
                            d="M527.998 975.94c-4.422 0-8-3.578-8-7.998v-99.988a7.994 7.994 0 0 1 8-7.998 7.994 7.994 0 0 1 7.998 7.998v99.988a7.994 7.994 0 0 1-7.998 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M527.998 975.94h-31.996c-4.422 0-8-3.578-8-7.998 0-4.422 3.578-8 8-8h31.996a7.994 7.994 0 0 1 7.998 8 7.994 7.994 0 0 1-7.998 7.998z"
                            fill=""
                          ></path>
                          <path
                            d="M496.002 975.94c-4.422 0-8-3.578-8-7.998v-99.988a7.994 7.994 0 0 1 8-7.998 7.994 7.994 0 0 1 7.998 7.998v99.988a7.994 7.994 0 0 1-7.998 7.998z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                      <Card.Title
                        className="mt-2 solutioncards"
                        style={{ textAlign: "center", wordBreak: "break-word" }}
                      >
                        {t("Strategy")}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                sortedOptions?.map((item, idx) => (
                  <Col
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    key={idx}
                    className="d-flex justify-content-center"
                  >
                    <Card
                      className="text-center shadow-sm"
                      style={{
                        borderRadius: "10px",
                        height: "138px",
                        width: "100%",
                        maxWidth: "138px", // Set max width
                        background: "none",
                        cursor: "pointer",
                        border:
                          selectedCard === idx ? "2px solid blue" : "none",
                        transform: "scale(1.1)", // Scale the card size up
                        transition: "transform 0.2s ease-in-out", // Smooth transition on hover
                      }}
                      onClick={() => handleCardClick(idx, item.title)}
                    >
                      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        {item.svg}
                        <Card.Title
                          className="mt-2 solutioncards"
                          style={{
                            textAlign: "center",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.label}
                        </Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </div>
          <div
            className={`tab-pane fade ${formState.solution_tab === "use a template" ? "show active" : ""}`}

            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
            tabindex="0"
          >
            <SolutionTemplateTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomComponent;
