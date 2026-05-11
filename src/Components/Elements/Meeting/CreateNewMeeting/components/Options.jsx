import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Dropdown,
  Spinner,
  Button,
} from "react-bootstrap";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ReactToggle from "react-toggle";
import "react-toggle/style.css";
import { useMeetings } from "../../../../../context/MeetingsContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Tooltip } from "antd";

const Options = ({ setActiveTab, meeting }) => {
  const {
    formState,
    setFormState,
    handleInputBlur,
    getMeeting,
    checkId,
    isUpdated,
    isDuplicate,
    handleCloseModal,
    recurrentMeetingAPI,
    setSelectedTab,
    googleLoginAndSaveProfile,
    changeOptions,
    loading,
  } = useFormContext();
  const { getMeetings } = useMeetings();
  const navigate = useNavigate();
  const isFromTemplate = !!formState?.solution_id;

  const [automaticNote, setAutomaticNote] = useState("Manual");
  const [noteTaking, setNoteTaking] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Automatic");
  const [t] = useTranslation("global");
  const [showDropdown, setShowDropdown] = useState(false);
  // const [loading, setLoading] = useState(false); // Loading state
  const [isToggled, setIsToggled] = useState(false);
  const [isShareByToggle, setIsShareByToggle] = useState(false);
  const [autostartToggle, setautostartToggle] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);

  const handleToggle = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;
    const newToggleState = !isToggled;
    setIsToggled(newToggleState);
    const playbackValue = newToggleState ? "automatic" : "manual";
    setFormState((prevFormState) => ({
      ...prevFormState,
      playback: playbackValue,
    }));
  };
  const handleShareToggle = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    const newToggleState = !isShareByToggle;
    setIsShareByToggle(newToggleState);
    const shareByValue = newToggleState ? "email" : null;

    setFormState((prevFormState) => ({
      ...prevFormState,
      share_by: shareByValue,
    }));

    setToggleStates((prev) => ({
      ...prev,
      shareby: newToggleState,
    }));
  };

  const [toggleStates, setToggleStates] = useState({ shareby: false });
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleToggleChange = (key) => {
    setToggleStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (location) => {
    setSelectedLocation(location);
  };

  const hnadleAutostart = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      autostart: !autostartToggle,
    }));
    setautostartToggle(!autostartToggle);
  };

  // useEffect(() => {
  //   if (checkId) {
  //     // Show loading indicator before making the API call
  //     setIsLoading(true);

  //     // Call the API and fetch meeting data
  //     const fetchData = async () => {
  //       try {
  //         await getMeeting(checkId);
  //       } catch (error) {
  //         toast.error("Error fetching meeting data");
  //       } finally {
  //         // Hide the loading indicator once the API call is complete
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [checkId]);
  // Load meeting data into form when available
  useEffect(() => {
    if (meeting) {
      const playbackValue = meeting.playback || ""; // Get the playback value
      const isAutomatic = playbackValue === "automatic"; // Check if playback is automatic
      setFormState((prevState) => ({
        ...prevState,
        prise_de_notes:
          meeting?.prise_de_notes || t("meeting.formState.Manual"),
        note_taker: meeting?.note_taker || false,
        alarm: meeting?.alarm || false,
        playback: playbackValue,
        autostart: meeting?.autostart || false,
        share_by: meeting?.share_by || null,
        remainder: meeting?.remainder || false,
        notification: meeting?.notification || false,
        feedback: meeting?.feedback || false,
        automatic_strategy: meeting?.automatic_strategy || false,
        automatic_instruction: meeting?.automatic_instruction || false,
        whatsapp_in: meeting?.whatsapp_in || false,
        presentation: meeting?.presentation || false,
      }));

      setIsToggled(isAutomatic);
      setSelectedTab("tab7");
    }
  }, [meeting, setFormState]);

  const [allowedOptions, setAllowedOptions] = useState({});

  useEffect(() => {
    if (formState?.solution_id) {
      setAllowedOptions((prev) => ({
        ...prev,
        prise_de_notes: prev.prise_de_notes || (formState?.prise_de_notes && formState?.prise_de_notes !== "Manual"),
        alarm: prev.alarm || !!formState?.alarm,
        feedback: prev.feedback || !!formState?.feedback,
        remainder: prev.remainder || !!formState?.remainder,
        autostart: prev.autostart || !!formState?.autostart,
        notification: prev.notification || !!formState?.notification,
        playback: prev.playback || (formState?.playback && formState?.playback !== "manual"),
        open_ai_decide: prev.open_ai_decide || !!formState?.open_ai_decide,
        automatic_strategy: prev.automatic_strategy || !!formState?.automatic_strategy,
        automatic_instruction: prev.automatic_instruction || !!formState?.automatic_instruction,
        whatsapp_in: prev.whatsapp_in || !!formState?.whatsapp_in,
        presentation: prev.presentation || !!formState?.presentation,
      }));
    } else {
      setAllowedOptions({});
    }
  }, [formState?.solution_id, formState?.prise_de_notes, formState?.alarm, formState?.feedback, formState?.remainder, formState?.autostart, formState?.notification, formState?.playback, formState?.open_ai_decide, formState?.automatic_strategy, formState?.automatic_instruction, formState?.whatsapp_in, formState?.presentation]);

  const toggleAutomaticNote = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setAutomaticNote((prevState) => {
      const newNoteTaking = prevState === "Manual" ? "Automatic" : "Manual";
      setFormState((prevFormState) => ({
        ...prevFormState,
        prise_de_notes: newNoteTaking, // Set the new state directly
      }));
      return newNoteTaking; // Return the new state
    });
  };
  const toggleNoteTaking = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setNoteTaking((prevState) => {
      const newNoteTaking = prevState === false ? true : false;
      setFormState((prevFormState) => ({
        ...prevFormState,
        note_taker: newNoteTaking, // Set the new state directly
      }));
      return newNoteTaking; // Return the new state
    });
  };

  const toggleAlarm = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      alarm: !prevFormState.alarm, // Toggle the alarm value
    }));
  };
  const toggleReview = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      feedback: !prevFormState.feedback, // Toggle the alarm value
    }));
  };
  const toggleRemainder = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      remainder: !prevFormState.remainder, // Toggle the alarm value
    }));
  };
  const toggleNotification = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      notification: !prevFormState.notification, // Toggle the notification value
    }));
  };

  const toggleMessageManagement = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      open_ai_decide: !prevFormState.open_ai_decide,
    }));
  };

  const toggleAutomaticStrategy = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      automatic_strategy: !prevFormState.automatic_strategy,
    }));
  };

  const toggleAutomaticInstruction = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      automatic_instruction: !prevFormState.automatic_instruction,
    }));
  };

  const toggleWhatsappIn = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      whatsapp_in: !prevFormState.whatsapp_in,
    }));
  };

  const togglePresentation = () => {
    if (formState?.type === "Special" || formState?.type === "Law") return;

    setFormState((prevFormState) => ({
      ...prevFormState,
      presentation: !prevFormState.presentation,
    }));
  };

  const alarmState = formState.alarm;
  const loginGoogleAndSaveProfileData = async () => {
    googleLoginAndSaveProfile();
  };

  if (loading) {
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
    <div className="col-md-12 p-1 mt-1 p-4">
      <div>
        {/* {(
          meeting?.type === "Newsletter" ||
          meeting?.type === "Strategy" ||
          meeting?.type === "Task"
        ) && ( */}
          <Row className="mb-4">
            {(!isFromTemplate || allowedOptions.prise_de_notes) && (
                <Col xs={12} md={meeting?.location === "Google Meet" ? 6 : 6}>
                  <Tooltip title={t("automatic_note_tooltip")}>
                    <div
                      className="d-flex justify-content-between align-items-center modal-tab-button"
                      onClick={toggleAutomaticNote}
                    >
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          viewBox="0 0 28 28"
                          fill="none"
                        >
                          <g filter="url(#filter0_d_1_1154)">
                            <circle
                              cx="14"
                              cy="12"
                              r="10"
                              stroke="url(#paint0_linear_1_1154)"
                              strokeWidth="4"
                            />
                          </g>
                          <defs>
                            <filter
                              id="filter0_d_1_1154"
                              x="0"
                              y="0"
                              width="28"
                              height="28"
                              filterUnits="userSpaceOnUse"
                              colorInterpolationFilters="sRGB"
                            >
                              <feFlood
                                floodOpacity="0"
                                result="BackgroundImageFix"
                              />
                              <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                              />
                              <feOffset dy="2" />
                              <feGaussianBlur stdDeviation="1" />
                              <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
                              />
                              <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1_1154"
                              />
                              <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1_1154"
                                result="shape"
                              />
                            </filter>
                            <linearGradient
                              id="paint0_linear_1_1154"
                              x1="14"
                              y1="0"
                              x2="20.375"
                              y2="21.75"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#B11FAB" />
                              <stop offset="0.514" stopColor="#56E8F1" />
                              <stop offset="1" stopColor="#2F47C1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="solutioncards option-text">
                          {t("meeting.formState.Automatic note taking")}
                        </span>
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAutomaticNote();
                        }}
                        style={{ cursor: "pointer" }}
                        aria-label={
                          formState?.prise_de_notes == "Manual"
                            ? "Switch is off"
                            : "Switch is on"
                        }
                      >
                        {formState?.prise_de_notes == "Automatic" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="27"
                            viewBox="0 0 48 27"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="4"
                              width="44"
                              height="16"
                              rx="8"
                              fill="url(#paint0_linear_1_1157)"
                            />
                            <g filter="url(#filter0_d_1_1157)">
                              <circle cx="35" cy="12" r="11" fill="white" />
                              <circle
                                cx="35"
                                cy="12"
                                r="10.5"
                                stroke="#E0E6F1"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_d_1_1157"
                                x="22"
                                y="1"
                                width="26"
                                height="26"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="2" />
                                <feGaussianBlur stdDeviation="1" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_1_1157"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_1_1157"
                                  result="shape"
                                />
                              </filter>
                              <linearGradient
                                id="paint0_linear_1_1157"
                                x1="4.5"
                                y1="7.5"
                                x2="30.5"
                                y2="18.5"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stop-color="#BE1ED7" />
                                <stop offset="0.55387" stop-color="#292FC2" />
                                <stop offset="1" stop-color="#0FD9F4" />
                              </linearGradient>
                            </defs>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="49"
                            height="27"
                            viewBox="0 0 49 27"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="4"
                              width="44"
                              height="16"
                              rx="8"
                              fill="#ECECF9"
                            />
                            <g filter="url(#filter0_d_1_625)">
                              <circle cx="13" cy="12" r="11" fill="white" />
                              <circle
                                cx="13"
                                cy="12"
                                r="10.5"
                                stroke="#E0E6F1"
                              />
                            </g>
                            <defs>
                              <filter
                                id="filter0_d_1_625"
                                x="0"
                                y="1"
                                width="26"
                                height="26"
                                filterUnits="userSpaceOnUse"
                                color-interpolation-filters="sRGB"
                              >
                                <feFlood
                                  flood-opacity="0"
                                  result="BackgroundImageFix"
                                />
                                <feColorMatrix
                                  in="SourceAlpha"
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                  result="hardAlpha"
                                />
                                <feOffset dy="2" />
                                <feGaussianBlur stdDeviation="1" />
                                <feComposite in2="hardAlpha" operator="out" />
                                <feColorMatrix
                                  type="matrix"
                                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                                />
                                <feBlend
                                  mode="normal"
                                  in2="BackgroundImageFix"
                                  result="effect1_dropShadow_1_625"
                                />
                                <feBlend
                                  mode="normal"
                                  in="SourceGraphic"
                                  in2="effect1_dropShadow_1_625"
                                  result="shape"
                                />
                              </filter>
                            </defs>
                          </svg>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                </Col>
              )}
            {(!isFromTemplate || allowedOptions.alarm) && (
              <Col xs={12} md={6}>
                <Tooltip title={t("alarm_tooltip")}>
                  <div
                    className="d-flex justify-content-between align-items-center modal-tab-button"
                    onClick={toggleAlarm}
                    style={{ padding: "15px" }}
                  >
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                          fill="#3D57B5"
                        />
                      </svg>
                      <span
                        className="solutioncards"
                        style={{ color: "#3D57B5" }}
                      >
                        {t("meeting.formState.Beep alarm")}
                      </span>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAlarm();
                      }}
                      style={{ cursor: "pointer" }}
                      // aria-label={formState?.alarm ? "Switch is on" : "Switch is off"}
                    >
                      {alarmState ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="27"
                          viewBox="0 0 48 27"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="4"
                            width="44"
                            height="16"
                            rx="8"
                            fill="#6BD27B"
                            fill-opacity="0.77"
                          />
                          <g filter="url(#filter0_d_1_1194)">
                            <circle cx="35" cy="12" r="11" fill="white" />
                            <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                          </g>
                          <defs>
                            <filter
                              id="filter0_d_1_1194"
                              x="22"
                              y="1"
                              width="26"
                              height="26"
                              filterUnits="userSpaceOnUse"
                              color-interpolation-filters="sRGB"
                            >
                              <feFlood
                                flood-opacity="0"
                                result="BackgroundImageFix"
                              />
                              <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                              />
                              <feOffset dy="2" />
                              <feGaussianBlur stdDeviation="1" />
                              <feComposite in2="hardAlpha" operator="out" />
                              <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                              />
                              <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1_1194"
                              />
                              <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1_1194"
                                result="shape"
                              />
                            </filter>
                          </defs>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="49"
                          height="27"
                          viewBox="0 0 49 27"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="4"
                            width="44"
                            height="16"
                            rx="8"
                            fill="#ECECF9"
                          />
                          <g filter="url(#filter0_d_1_625)">
                            <circle cx="13" cy="12" r="11" fill="white" />
                            <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                          </g>
                          <defs>
                            <filter
                              id="filter0_d_1_625"
                              x="0"
                              y="1"
                              width="26"
                              height="26"
                              filterUnits="userSpaceOnUse"
                              color-interpolation-filters="sRGB"
                            >
                              <feFlood
                                flood-opacity="0"
                                result="BackgroundImageFix"
                              />
                              <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                              />
                              <feOffset dy="2" />
                              <feGaussianBlur stdDeviation="1" />
                              <feComposite in2="hardAlpha" operator="out" />
                              <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                              />
                              <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1_625"
                              />
                              <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1_625"
                                result="shape"
                              />
                            </filter>
                          </defs>
                        </svg>
                      )}
                    </div>
                  </div>
                </Tooltip>
              </Col>
            )}
          </Row>
        {/* )} */}
        <Row className="mb-4">
          {(!isFromTemplate || allowedOptions.feedback) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("review_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleReview}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25px"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M16 1C17.6569 1 19 2.34315 19 4C19 4.55228 18.5523 5 18 5C17.4477 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H16C16.5523 21 17 20.5523 17 20V19C17 18.4477 17.4477 18 18 18C18.5523 18 19 18.4477 19 19V20C19 21.6569 17.6569 23 16 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H16Z"
                          fill="#3D57B5"
                        ></path>{" "}
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M20.7991 8.20087C20.4993 7.90104 20.0132 7.90104 19.7133 8.20087L11.9166 15.9977C11.7692 16.145 11.6715 16.3348 11.6373 16.5404L11.4728 17.5272L12.4596 17.3627C12.6652 17.3285 12.855 17.2308 13.0023 17.0835L20.7991 9.28666C21.099 8.98682 21.099 8.5007 20.7991 8.20087ZM18.2991 6.78666C19.38 5.70578 21.1325 5.70577 22.2134 6.78665C23.2942 7.86754 23.2942 9.61999 22.2134 10.7009L14.4166 18.4977C13.9744 18.9398 13.4052 19.2327 12.7884 19.3355L11.8016 19.5C10.448 19.7256 9.2744 18.5521 9.50001 17.1984L9.66448 16.2116C9.76728 15.5948 10.0602 15.0256 10.5023 14.5834L18.2991 6.78666Z"
                          fill="#3D57B5"
                        ></path>{" "}
                        <path
                          d="M5 7C5 6.44772 5.44772 6 6 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H6C5.44772 8 5 7.55228 5 7Z"
                          fill="#3D57B5"
                        ></path>{" "}
                        <path
                          d="M5 11C5 10.4477 5.44772 10 6 10H10C10.5523 10 11 10.4477 11 11C11 11.5523 10.5523 12 10 12H6C5.44772 12 5 11.5523 5 11Z"
                          fill="#3D57B5"
                        ></path>{" "}
                        <path
                          d="M5 15C5 14.4477 5.44772 14 6 14H7C7.55228 14 8 14.4477 8 15C8 15.5523 7.55228 16 7 16H6C5.44772 16 5 15.5523 5 15Z"
                          fill="#3D57B5"
                        ></path>{" "}
                      </g>
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Feedbacks")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReview();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.feedback ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fill-opacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_1194"
                            x="22"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_1194"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_1194"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_625"
                            x="0"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_625"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_625"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}

          {(!isFromTemplate || allowedOptions.remainder) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("remainder_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleRemainder}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M12 9V13L14.5 15.5"
                          stroke="#3D57B5"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M3.5 4.5L7.50002 2"
                          stroke="#3D57B5"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M20.5 4.5L16.5 2"
                          stroke="#3D57B5"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                          stroke="#3D57B5"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Remainder")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRemainder();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.remainder ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fill-opacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_1194"
                            x="22"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_1194"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_1194"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_625"
                            x="0"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_625"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_625"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>

        <Row className="mb-4">
          {(!isFromTemplate || allowedOptions.autostart) && (
            <Col xs={12} md={6}>
              <div
                className="d-flex justify-content-between align-items-center modal-tab-button playback-list"
                onClick={hnadleAutostart}
              >
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="24"
                    viewBox="0 0 25 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                      fill="#3D57B5"
                    />
                  </svg>
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
                    {t("meeting.formState.Autostart")}
                  </span>
                </div>
                <div style={{ cursor: "pointer", color: "#8282AE" }}>
                  <label>
                    <ReactToggle
                      checked={autostartToggle}
                      icons={false}
                      className="toggle-playback"
                    />
                  </label>
                </div>
              </div>
            </Col>
          )}

          {(!isFromTemplate || allowedOptions.notification) && (
            <Col xs={12} md={6}>
              {/* <Tooltip 
      title={t("noti")}
    > */}
              <div
                className="d-flex justify-content-between align-items-center modal-tab-button"
                onClick={toggleNotification}
                style={{ padding: "15px" }}
              >
                <div>
                  <svg
                    width="25px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
                        stroke="#3D57B5"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                      <circle
                        cx="19"
                        cy="5"
                        r="3"
                        stroke="#3D57B5"
                        stroke-width="1.5"
                      ></circle>{" "}
                      <path
                        d="M7 14H16"
                        stroke="#3D57B5"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                      <path
                        d="M7 17.5H13"
                        stroke="#3D57B5"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                  <span className="solutioncards" style={{ color: "#3D57B5" }}>
                    {t("meeting.formState.notification")}
                  </span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNotification();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {formState.notification ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="27"
                      viewBox="0 0 48 27"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="44"
                        height="16"
                        rx="8"
                        fill="#6BD27B"
                        fill-opacity="0.77"
                      />
                      <g filter="url(#filter0_d_1_1194)">
                        <circle cx="35" cy="12" r="11" fill="white" />
                        <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                      </g>
                      <defs>
                        <filter
                          id="filter0_d_1_1194"
                          x="22"
                          y="1"
                          width="26"
                          height="26"
                          filterUnits="userSpaceOnUse"
                          color-interpolation-filters="sRGB"
                        >
                          <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="2" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1_1194"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1_1194"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="49"
                      height="27"
                      viewBox="0 0 49 27"
                      fill="none"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="44"
                        height="16"
                        rx="8"
                        fill="#ECECF9"
                      />
                      <g filter="url(#filter0_d_1_625)">
                        <circle cx="13" cy="12" r="11" fill="white" />
                        <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                      </g>
                      <defs>
                        <filter
                          id="filter0_d_1_625"
                          x="0"
                          y="1"
                          width="26"
                          height="26"
                          filterUnits="userSpaceOnUse"
                          color-interpolation-filters="sRGB"
                        >
                          <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                          />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dy="2" />
                          <feGaussianBlur stdDeviation="1" />
                          <feComposite in2="hardAlpha" operator="out" />
                          <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                          />
                          <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1_625"
                          />
                          <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1_625"
                            result="shape"
                          />
                        </filter>
                      </defs>
                    </svg>
                  )}
                </div>
              </div>
              {/* </Tooltip> */}
            </Col>
          )}
        </Row>
        <Row className="mb-4">
          {(!isFromTemplate || allowedOptions.playback === "automatic") && (
              <Col xs={12} md={6}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button playback-list"
                  onClick={handleToggle}
                >
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="24"
                      viewBox="0 0 25 24"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.5001 1.35999C12.2879 1.35999 12.0844 1.44427 11.9344 1.5943C11.7844 1.74433 11.7001 1.94781 11.7001 2.15999V5.63519C11.7001 5.84736 11.7844 6.05084 11.9344 6.20087C12.0844 6.3509 12.2879 6.43519 12.5001 6.43519C12.7122 6.43519 12.9157 6.3509 13.0658 6.20087C13.2158 6.05084 13.3001 5.84736 13.3001 5.63519V2.99519C15.3173 3.17457 17.2159 4.02613 18.6915 5.41333C20.167 6.80054 21.134 8.64304 21.4373 10.6454C21.7407 12.6478 21.363 14.694 20.3646 16.4561C19.3662 18.2181 17.8051 19.5939 15.9315 20.3628C14.058 21.1317 11.9805 21.2492 10.0321 20.6965C8.08379 20.1437 6.37749 18.9528 5.1868 17.3145C3.99611 15.6763 3.39001 13.6857 3.46567 11.6619C3.54134 9.63811 4.29438 7.69833 5.60407 6.15358C5.67546 6.07402 5.73018 5.98095 5.765 5.87989C5.79981 5.77882 5.81402 5.6718 5.80678 5.56514C5.79954 5.45849 5.771 5.35437 5.72285 5.25893C5.67469 5.1635 5.6079 5.07868 5.52641 5.00949C5.44493 4.9403 5.3504 4.88815 5.24842 4.8561C5.14644 4.82406 5.03907 4.81278 4.93265 4.82293C4.82624 4.83308 4.72293 4.86446 4.62885 4.91521C4.53476 4.96595 4.4518 5.03504 4.38487 5.11839C2.81701 6.96726 1.92749 9.29609 1.86357 11.7194C1.79964 14.1427 2.56513 16.5152 4.03333 18.4442C5.50153 20.3731 7.58441 21.7429 9.9372 22.3268C12.29 22.9106 14.7716 22.6736 16.9713 21.6548C19.171 20.6361 20.9569 18.8967 22.0333 16.7247C23.1098 14.5526 23.4122 12.0781 22.8907 9.71074C22.3691 7.34336 21.0548 5.22506 19.1652 3.70646C17.2757 2.18787 14.9242 1.36003 12.5001 1.35999ZM11.2841 12.928L7.25847 7.31679C7.20487 7.23976 7.18006 7.14634 7.18838 7.05287C7.19669 6.9594 7.23761 6.87183 7.30396 6.80548C7.37031 6.73912 7.45789 6.69821 7.55135 6.68989C7.64482 6.68158 7.73824 6.70639 7.81527 6.75999L13.4297 10.784C13.6103 10.914 13.7605 11.0818 13.8699 11.2757C13.9793 11.4695 14.0453 11.6848 14.0632 11.9067C14.0812 12.1286 14.0507 12.3517 13.9738 12.5606C13.897 12.7695 13.7757 12.9592 13.6183 13.1166C13.4609 13.274 13.2712 13.3953 13.0623 13.4722C12.8534 13.549 12.6303 13.5795 12.4084 13.5615C12.1865 13.5436 11.9712 13.4776 11.7773 13.3682C11.5835 13.2588 11.4157 13.1086 11.2857 12.928"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Lecture playback")}
                    </span>
                  </div>
                  <div style={{ cursor: "pointer", color: "#8282AE" }}>
                    <label>
                      <ReactToggle
                        checked={isToggled}
                        icons={false}
                        className="toggle-playback"
                      />
                    </label>
                  </div>
                </div>
              </Col>
            )}
          {(!isFromTemplate || allowedOptions.open_ai_decide) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("message_management_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleMessageManagement}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25px"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                        stroke="#3D57B5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("Gestion des messages")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMessageManagement();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.open_ai_decide ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fillOpacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_1194"
                            x="22"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_1194"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_1194"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_625"
                            x="0"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_625"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_625"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>

        <Row className="mb-4">
          {(!isFromTemplate || allowedOptions.automatic_strategy) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("automatic_strategy_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleAutomaticStrategy}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Automatic Strategy")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutomaticStrategy();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.automatic_strategy ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fill-opacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_1194"
                            x="22"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_1194"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_1194"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_625"
                            x="0"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_625"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_625"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
          {(!isFromTemplate || allowedOptions.automatic_instruction) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("automatic_instruction_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleAutomaticInstruction}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM19 19H5V5H19V19ZM17 16H7V14H17V16ZM17 12H7V10H17V12ZM17 8H7V6H17V8Z"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Automatic Instruction")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutomaticInstruction();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.automatic_instruction ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fillOpacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_1194"
                            x="22"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_1194"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_1194"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                        <defs>
                          <filter
                            id="filter0_d_1_625"
                            x="0"
                            y="1"
                            width="26"
                            height="26"
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                              result="hardAlpha"
                            />
                            <feOffset dy="2" />
                            <feGaussianBlur stdDeviation="1" />
                            <feComposite in2="hardAlpha" operator="out" />
                            <feColorMatrix
                              type="matrix"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                            />
                            <feBlend
                              mode="normal"
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_1_625"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="effect1_dropShadow_1_625"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>

        <Row className="mb-4">
          {(!isFromTemplate || allowedOptions.whatsapp_in) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("whatsapp_in_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={toggleWhatsappIn}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Whatsapp In")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWhatsappIn();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.whatsapp_in ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fillOpacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
          {(!isFromTemplate || allowedOptions.presentation) && (
            <Col xs={12} md={6}>
              <Tooltip title={t("presentation_tooltip")}>
                <div
                  className="d-flex justify-content-between align-items-center modal-tab-button"
                  onClick={togglePresentation}
                  style={{ padding: "15px" }}
                >
                  <div>
                    <svg
                      width="25"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3ZM21 17H3V5H21V17ZM10 7L15 11L10 15V7Z"
                        fill="#3D57B5"
                      />
                    </svg>
                    <span
                      className="solutioncards"
                      style={{ color: "#3D57B5" }}
                    >
                      {t("meeting.formState.Presentation")}
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePresentation();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {formState.presentation ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="27"
                        viewBox="0 0 48 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#6BD27B"
                          fillOpacity="0.77"
                        />
                        <g filter="url(#filter0_d_1_1194)">
                          <circle cx="35" cy="12" r="11" fill="white" />
                          <circle cx="35" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="49"
                        height="27"
                        viewBox="0 0 49 27"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="4"
                          width="44"
                          height="16"
                          rx="8"
                          fill="#ECECF9"
                        />
                        <g filter="url(#filter0_d_1_625)">
                          <circle cx="13" cy="12" r="11" fill="white" />
                          <circle cx="13" cy="12" r="10.5" stroke="#E0E6F1" />
                        </g>
                      </svg>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Col>
          )}
        </Row>
      </div>
      {/* <div
        className={`modal-footer d-flex justify-content-end modal-save-button gap-4`}
      >
        {(isUpdated || isDuplicate) && (
          <Button
            variant="danger"
            // className="btn "
            onClick={handleSaveAndQuit}
            disabled={loadingQuit}
            style={{ padding: "9px" }}
          >
            {loadingQuit ? (
              <>
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
              </>
            ) : (
              <>
                &nbsp;{t("meeting.formState.Save and Quit")}
                
              </>
            )}
          </Button>
        )}
        <button
          className={`btn moment-btn`}
          onClick={handleSaveAndContinue}
          disabled={loading}
        >
          {loading ? (
            <>
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
            </>
          ) : (
            <>
              &nbsp;{changeOptions ? t("Validate") :t("meeting.formState.Save and Continue")}
              <span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.5489C13.3804 16.4777 13.3243 16.3929 13.2865 16.2995C13.2488 16.2061 13.2303 16.1061 13.2321 16.0054C13.2338 15.9047 13.2559 15.8054 13.2969 15.7134C13.3379 15.6214 13.397 15.5386 13.4707 15.4699L16.1907 12.7499H6.50066C6.30175 12.7499 6.11098 12.6709 5.97033 12.5302C5.82968 12.3896 5.75066 12.1988 5.75066 11.9999C5.75066 11.801 5.82968 11.6102 5.97033 11.4696C6.11098 11.3289 6.30175 11.2499 6.50066 11.2499H16.1907L13.4707 8.52991Z"
                    fill="white"
                  />
                </svg>
              </span>
            </>
          )}
        </button>
      </div> */}
    </div>
  );
};

export default Options;
