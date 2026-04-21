import CookieService from '../../../Utils/CookieService';
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { Spinner, Card } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "./../../../Apicongfig";
import { AiOutlineDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../../context/HeaderTitleContext";
import { askPermission } from "./../../../Utils/askPermission";

import { Avatar, Tooltip } from "antd";
import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
import ConfirmationModal from "./../../../Utils/ConfirmationModal";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import NoContent from "../../Meeting/NoContent";
import { useSolutions } from "../../../../context/SolutionsContext";
import { useSolutionFormContext } from "../../../../context/CreateSolutionContext";
import { typeIcons } from "./../../../Utils/MeetingFunctions";

// >==============================> For Sorting <================================<

// >==============================> F.C <================================<

const DraftSolutions = ({ setActiveTab, allMeetings }) => {
  const { getDraftSolutions, isLoading } = useSolutions();
  const { language } = useDraftMeetings();
  const {
    open,
    handleShow,
    handleCloseModal,
    setCheckId,
    getSolution,
    solution,
    setSolution,
  } = useSolutionFormContext();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const effectRan = React.useRef(false);
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const moment = require("moment");
  require("moment/locale/fr");

  //Delete Meeting
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success(t("solutionDeletedSuccessfullToast"));
        getDraftSolutions();
      } else {
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(t(error.message));
    }
  };
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const viewDraft = async (item) => {
    handleShow();
    setCheckId(item?.id);
    await getSolution(item.id);
  };

  useEffect(() => {
    return () => {
      effectRan.current = true;
    };
  }, []);

  const sortedMeetings = [...allMeetings];
  //-----------------------------------------------------------------------------------

  const formatDate = (dateString) => {
    let color;
    let fontSize;
    if (!dateString) {
      color = "#92929D";

      return <div style={{ color }}>{t("meeting.todayDate")}</div>;
    }
    // const date = moment(dateString);
    // const date = moment(dateString).locale("en-gb"); // Set locale to English
    let date;
    if (language === "en") {
      date = moment(dateString).locale("en-gb"); // Set locale to English
    } else {
      date = moment(dateString); // Set into french
    }
    const today = moment().startOf("day"); // Get today date

    const day = date.format("ddd").toUpperCase();
    const dayNumber = date.format("DD");

    // Compare if the date is today
    const isToday = date.isSame(today, "day");

    // Determine the color based on whether it's today or not
    color = isToday ? "#e7796a" : "#92929D";
    fontSize = "24px";
    return (
      <div style={{ color, fontSize }}>
        {day}
        <br />
        {dayNumber}
      </div>
    );
  };
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDateInFrench = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const calculateTotalDays = (steps) => {
    return steps.reduce((total, step) => {
      return total + step.count2;
    }, 0);
  };

  const addDaysToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const convertTo12HourFormat = (time, steps) => {
    if (!time || !steps) {
      return;
    }
    const hasSeconds = steps.some((step) => step.time_unit === "seconds");
    let [hour, minute, second] = time.split(":").map(Number);
    minute = minute.toString().padStart(2, "0");

    second = second.toString().padStart(2, "0");

    const endTime = hasSeconds
      ? `${hour}h${minute}m${second}`
      : `${hour}h${minute}`;

    return endTime;
  };
  function calculateTotalTime(steps) {
    if (!steps) return;
    let totalSeconds = 0;
    steps?.forEach((step) => {
      switch (step.time_unit) {
        case "days":
          totalSeconds += step.count2 * 86400;
          break;
        case "hours":
          totalSeconds += step.count2 * 3600;
          break;
        case "minutes":
          totalSeconds += step.count2 * 60;
          break;
        case "seconds":
          totalSeconds += step.count2;
          break;
      }
    });

    const days = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600); // Calculate hours excluding days
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let result = "";
    if (days > 0) {
      result += `${days} ${t("days")} `;
    }
    if (hrs > 0) {
      result += `${hrs} ${t("hours")} `;
    }
    if (mins > 0) {
      result += `${mins} mins `;
    }
    if (secs > 0) {
      result += `${secs} secs`;
    }
    return result.trim();
  }

  const loggedInUserId = CookieService.get("user_id");

  const meetingsByMonth = useMemo(() => {
    const meetingsList = [];

    allMeetings
      ?.filter((meeting) => meeting.status === "draft")
      ?.forEach((item, index) => {
        // const startDate = new Date(item.date);
        // const totalDays = calculateTotalDays(item?.steps);
        // const endDate = addDaysToDate(startDate, totalDays);
        // const formattedEndDate = formatDateInFrench(endDate);

        const dateLocale = language === "en" ? "en-gb" : "fr";
        const monthName = moment(item.date).locale(dateLocale).format("MMMM");

        // // Initialize the month array if it doesn't exist
        // if (!meetingsMap[monthName]) {
        //   meetingsMap[monthName] = [];
        // }

        const participantCount = item?.guides?.length || 0;
        const totalTime = calculateTotalTime(item?.solution_steps);
        // const date = item?.date ? new Date(item.date) : null;
        // let formattedDate;

        // if (date && !isNaN(date)) {
        //   // Get individual components of the date
        //   const day = String(date.getDate()).padStart(2, "0");
        //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        //   const year = date.getFullYear();

        //   // Format the date in dd:mm:yyyy
        //   formattedDate = `${day}/${month}/${year}`;
        // } else {
        //   // Handle the case where date is not available or invalid
        //   formattedDate = "N/A"; // or just leave it as undefined if you don't want to show anything
        // }

        meetingsList.push(
          <Card
            className="mt-3 mb-2"
            key={index}
            onClick={() => {
              viewDraft(item);
            }}
          >
            <div className="row">
              <div className="col-md-1 column-1">{typeIcons[item?.type]}</div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-md-12">
                    <span className="heading">{item.title}</span>
                    <span
                      className={`badge ms-2 `}
                      style={{
                        padding: "3px 8px 3px 8px",
                        background: "rgb(228 228 233)",
                        color: "gray",
                      }}
                    >
                      {t("badge.draft")}
                    </span>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                        stroke="#92929D"
                        stroke-miterlimit="10"
                      />
                      <path
                        d="M8.14258 4.5V9H11.1426"
                        stroke="#92929D"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <span className="time">
                      {totalTime && ` ${totalTime} `}
                    </span>
                  </div>
                  <div className="col-md-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                        fill="#8590A3"
                      />
                    </svg>
                    <span className="time">
                      {item?.type === "Special" ? "Media" : item?.type}
                    </span>
                  </div>
                  <div className="col-md-4 col-12">
                    <svg
                      width="16"
                      height="16"
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
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M9.25763 5.96157C7.39525 6.0632 5.90762 7.58941 5.80905 9.49957C4.56365 10.9215 4.56365 13.0776 5.80905 14.4996C5.90423 16.4135 7.39634 17.943 9.2625 18.0396C10.6482 19.3187 12.7518 19.3187 14.1375 18.0396C16.0037 17.943 17.4958 16.4135 17.591 14.4996C18.8364 13.0776 18.8364 10.9215 17.591 9.49957C17.4924 7.58941 16.0048 6.0632 14.1424 5.96157C12.7537 4.67948 10.6454 4.67948 9.25665 5.96157H9.25763Z"
                          stroke="#8590A3"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M13.4063 11.9995C13.4063 12.966 12.6423 13.7495 11.7 13.7495C10.7577 13.7495 9.99375 12.966 9.99375 11.9995C9.99375 11.033 10.7577 10.2495 11.7 10.2495C12.6423 10.2495 13.4063 11.033 13.4063 11.9995Z"
                          stroke="#8590A3"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                    <span className="time">
                      {item?.solution_used_count}{" "}
                      {item?.solution_used_count > 1
                        ? t("multipleTime")
                        : t("oneTime")}
                    </span>
                  </div>
                </div>
                <div className="row my-2">
                  <div className="col-md-6 mt-2">
                    <div className="col-md-4 creator">{t("Creator")}</div>
                    <div>
                      {/* <Avatar src={Assets_URL + "/" + item?.user.image} /> */}
                      <Tooltip
                        title={item?.solution_creator?.full_name}
                        placement="top"
                      >
                        <Avatar
                          src={
                            item?.solution_creator?.image.startsWith("users/")
                              ? Assets_URL + "/" + item?.solution_creator?.image
                              : item?.solution_creator?.image
                          }
                        />
                      </Tooltip>
                      <span className="creator-name">
                        {item?.solution_creator?.full_name}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="creator">{t("Privacy")}</div>
                    <div className="">
                      <div>
                        {/* {typeIcons[item?.type]} */}
                        {item?.solution_privacy === "enterprise" ? (
                          <Tooltip
                            title={item?.solution_creator?.enterprise?.name}
                            placement="top"
                          >
                            <img
                              src={
                                item?.solution_creator?.enterprise?.logo?.startsWith(
                                  "enterprises/"
                                )
                                  ? Assets_URL +
                                    "/" +
                                    item?.solution_creator?.enterprise?.logo
                                  : item?.solution_creator?.enterprise?.logo?.startsWith(
                                      "storage/enterprises/"
                                    )
                                  ? Assets_URL +
                                    "/" +
                                    item?.solution_creator?.enterprise?.logo
                                  : item?.solution_creator?.enterprise?.logo
                              }
                              alt="Logo"
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "fill",
                                borderRadius: "50%",
                              }}
                            />
                          </Tooltip>
                        ) : item?.solution_privacy === "team" ? (
                          <>
                            <Avatar.Group>
                              {item?.solution_privacy_team_data?.map((item) => {
                                return (
                                  <>
                                    <Tooltip title={item?.name} placement="top">
                                      <Avatar
                                        size="large"
                                        // src={
                                        //   item?.image?.startsWith("teams/")
                                        //     ? Assets_URL + "/" + item.image
                                        //     : item.image
                                        // }
                                        src={
                                          item?.logo?.startsWith("http")
                                            ? item.logo
                                            : Assets_URL + "/" + item.logo
                                        }
                                      />
                                    </Tooltip>
                                  </>
                                );
                              })}
                            </Avatar.Group>
                          </>
                        ) : item?.solution_privacy === "private" ? (
                          <Tooltip
                            title={item?.solution_creator?.full_name}
                            placement="top"
                          >
                            <Avatar
                              src={
                                item?.solution_creator?.image.startsWith(
                                  "users/"
                                )
                                  ? Assets_URL +
                                    "/" +
                                    item?.solution_creator?.image
                                  : item?.solution_creator?.image
                              }
                            />
                          </Tooltip>
                        ) : (
                          <Avatar
                            src="/Assets/Tek.png"
                            style={{ borderRadius: "0" }}
                          />
                        )}

                        <span
                          className={`badge ms-2 ${
                            item?.solution_privacy === "private"
                              ? "solution-badge-red"
                              : item?.solution_privacy === "public"
                              ? "solution-badge-green"
                              : item?.solution_privacy === "enterprise"
                              ? "solution-badge-blue"
                              : "solution-badge-yellow"
                          }`}
                          style={{ padding: "3px 8px 3px 8px" }}
                        >
                          {item?.solution_privacy === "private"
                            ? t("solution.badge.private")
                            : item?.solution_privacy === "public"
                            ? t("solution.badge.public")
                            : item?.solution_privacy === "enterprise"
                            ? t("solution.badge.enterprise")
                            : t("solution.badge.team")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-1 d-flex justify-content-end">
                <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
                  <div className="dropdown dropstart">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      data-bs-toggle="dropdown"
                      // aria-expanded="false"
                      aria-expanded={openDropdownId === item.id}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "0px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(item.id);
                      }}
                    >
                      <BiDotsVerticalRounded color="black" size={"25px"} />
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <a
                          className="dropdown-item"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            setHeaderTitle([
                              {
                                titleText: t("header.modification"),
                                link: `/meeting`,
                              },
                              {
                                titleText: `${item.title}`,
                                link: `/draft/${item?.id}`,
                              },
                            ]);
                            e.stopPropagation();
                            viewDraft(item);
                          }}
                        >
                          <IoEyeOutline size={"20px"} /> &nbsp;
                          {t("dropdown.draft")}
                        </a>
                      </li>
                      <hr style={{ margin: "10px 0 0 0", padding: "2px" }} />

                      <li>
                        <a
                          className="dropdown-item"
                          style={{ cursor: "pointer", color: "red" }}
                          // onClick={(e) => {
                          //   e.stopPropagation();
                          //   handleDelete(item.id);
                          // }}
                          onClick={(e) => handleDeleteClick(e, item.id)}
                        >
                          <AiOutlineDelete size={"20px"} color="red" />
                          &nbsp; {t("dropdown.Delete")}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      });

    return meetingsList;
  }, [allMeetings, language, loggedInUserId, t]);
  return (
    <div className="scheduled">
      <div className="my-2 container-fluid">
        {sortedMeetings?.length === 0 && !isLoading ? (
          <NoContent title="Draft Solution" />
        ) : sortedMeetings?.length > 0 ? (
          <>
            {Object.entries(meetingsByMonth).map(([month, meetings]) => (
              <>
                <span className="month">
                  {/* {month === "Invalid date" ? t("meeting.todayDate") : month} */}
                </span>
                {meetings}
              </>
            ))}
          </>
        ) : (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        )}
      </div>
      {showConfirmationModal && (
        <ConfirmationModal
          message={t("solutionDeletedToast")}
          onConfirm={(e) => confirmDelete(e)}
          onCancel={(e) => {
            e.stopPropagation();
            setShowConfirmationModal(false);
          }}
        />
      )}

      {open && (
        <>
          <NewMeetingModal
            meeting={solution}
            open={open}
            closeModal={handleCloseModal}
            setMeeting={setSolution}
          />
        </>
      )}
    </div>
  );
};

export default DraftSolutions;
