import CookieService from '../../../Utils/CookieService';
import axios from "axios";
import React, { useMemo, useState } from "react";
import { Spinner, Card } from "react-bootstrap";
import { API_BASE_URL, Assets_URL } from "./../../../Apicongfig";
import { AiOutlineDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { Avatar, Tooltip } from "antd";
import { RiEditBoxLine } from "react-icons/ri";
import { IoCopyOutline } from "react-icons/io5";
import { useDraftMeetings } from "../../../../context/DraftMeetingContext";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
} from "./../../../Utils/MeetingFunctions";
import { useSolutionFormContext } from "./../../../../context/CreateSolutionContext";
import { useSolutions } from "./../../../../context/SolutionsContext";
import ConfirmationModal from "./../../../Utils/ConfirmationModal";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import NoContent from "../../Meeting/NoContent";
import { typeIcons } from "./../../../Utils/MeetingFunctions";

const EnterpriseSolutions = ({ allMeetings }) => {
  const { isLoading, getEnterpriseSolutions } = useSolutions();
  const {
    open,
    handleShow,
    setSolution,
    handleCloseModal,
    setIsDuplicate,
    setIsUpdated,
    getSolution,
    setCheckId,
  } = useSolutionFormContext();
  const { language } = useDraftMeetings();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  const [t] = useTranslation("global");
  const navigate = useNavigate();
  // const [meetings, setSolutions] = useState([]);
  const moment = require("moment");
  require("moment/locale/fr");

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status) {
        toast.success(t("solutionDeletedSuccessfullToast"));
        getEnterpriseSolutions();
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
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

  const handleCopy = async (item) => {
    try {
      // Prepare the steps array with null values for specific fields
      const updatedSteps = item?.solution_steps?.map((step) => ({
        ...step,
        status: "active",
        summary_status: false,

      }));
      const postData = {
        ...item,
        solution_steps: updatedSteps,
        _method: "put",
        duplicate: true,
        status: "active",
        moment_privacy_teams: [],
        newly_created_team: null,
      };
      const response = await axios.post(
        `${API_BASE_URL}/solutions/${item?.id}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        // console.log(response?.data?.data);
        // navigate(`/copyMeeting/${data?.id}`);
        setCheckId(data?.id);
        setIsDuplicate(true);
        await getSolution(data?.id);
        handleShow();
        setSolution(data);
        // toast.error("Request failed:", response.status, response.statusText);
      } else {
        toast.error("Échec de la duplication de la réunion");
      }
    } catch (error) {
      toast.error(t("Duplication Failed, Check your Internet connection"));
    } finally {
    }
  };

  const handleEdit = (item) => {
    // navigate(`/updateMeeting/${item?.id}`);
    setCheckId(item.id);
    setIsUpdated(true);
    handleShow();
    setSolution(item);
  };

  const viewPresentation = (data) => {
    navigate(`/solution/${data.id}`, { state: { data, from: "meeting" } });
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const toggleDropdown = (id) => {
    // If the clicked dropdown is already open, close it
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      // Otherwise, set the new dropdown id
      setOpenDropdownId(id);
    }
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

  allMeetings?.sort((a, b) => moment(a.date).diff(moment(b.date)));

  const calculateDaysDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the time difference in milliseconds
    const timeDiff = end - start;

    // Convert the difference from milliseconds to days
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff;
  };

  const loggedInUserId = CookieService.get("user_id");

  const meetingsByMonth = useMemo(() => {
    const meetingsList = []; // Changed to a single list

    allMeetings
      ?.filter((meeting) => meeting.status !== "draft")
      .forEach((item, index) => {
        const guideCount = item?.guides?.length;

        const shouldDisableButtons =
          item?.user_id !== parseInt(CookieService.get("user_id")) &&
          item?.steps?.some((step) => step?.participant || step?.userPID);

        const totalTime = calculateTotalTime(item?.solution_steps);

        const date = new Date(item?.date);
        // Get individual components of the date
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear();

        const daysDifference = calculateDaysDifference(
          item?.date,
          item?.estimate_time?.split("T")[0]
        );

        meetingsList.push(
          <Card
            className="mt-3 mb-2 scheduled"
            key={index}
            onClick={() => viewPresentation(item)}
          >
            <div className="row">
              <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
                {/* <svg width="37" height="36" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.8128 3.50476C17.9028 4.78576 18.5178 5.99851 19.5243 6.86476C20.2565 7.49366 20.8452 8.27239 21.2505 9.14835C21.6559 10.0243 21.8685 10.9771 21.874 11.9423C21.8863 12.8331 21.72 13.7174 21.3848 14.5428C21.0496 15.3683 20.5524 16.1182 19.9225 16.7483C19.2906 17.3989 18.5342 17.9156 17.6983 18.2676C16.8624 18.6197 15.9642 18.7998 15.0573 18.7973H13.9473C14.1792 18.8667 14.3825 19.009 14.5271 19.2032C14.6717 19.3973 14.7498 19.6329 14.7498 19.875C14.7423 20.4998 14.2413 21 13.6225 21H8.37703C8.22913 21.0002 8.08264 20.9713 7.94593 20.9148C7.80923 20.8584 7.68498 20.7756 7.5803 20.6711C7.47561 20.5666 7.39254 20.4425 7.33583 20.3059C7.27912 20.1693 7.24988 20.0229 7.24978 19.875C7.24978 19.3688 7.58578 18.9375 8.05228 18.7973H7.31728C5.47753 18.7973 3.75103 18.0668 2.45203 16.7483C1.17628 15.453 0.478027 13.7423 0.500527 11.9423C0.510788 10.9771 0.726287 10.0253 1.13271 9.14983C1.53913 8.27439 2.12717 7.49546 2.85778 6.86476C3.35152 6.44555 3.75755 5.93291 4.05255 5.35629C4.34755 4.77968 4.52571 4.15045 4.57678 3.50476H3.06778C2.99233 3.5048 2.91875 3.48133 2.85726 3.43761C2.79577 3.3939 2.74943 3.3321 2.72468 3.26083C2.69993 3.18956 2.69801 3.11235 2.71917 3.03993C2.74034 2.96751 2.78354 2.90349 2.84278 2.85676L6.19828 0.198014C6.26035 0.150359 6.33451 0.120996 6.41238 0.113236C6.49026 0.105476 6.56875 0.119627 6.63901 0.154094C6.70927 0.188562 6.7685 0.241974 6.81003 0.308307C6.85155 0.37464 6.87372 0.451256 6.87403 0.529514L6.86653 3.50476C6.86653 5.57626 5.95828 7.23376 4.36678 8.61976C3.88348 9.03574 3.49428 9.54984 3.22505 10.1279C2.95582 10.7059 2.81272 11.3346 2.80528 11.9723C2.79028 13.155 3.24778 14.2778 4.09678 15.1365C4.517 15.5693 5.02002 15.913 5.57588 16.1473C6.13175 16.3815 6.72907 16.5015 7.33228 16.5C8.05619 16.4986 8.74991 16.2098 9.26088 15.697C9.77185 15.1842 10.0582 14.4894 10.057 13.7655V3.50551H9.05953C8.97589 3.50479 8.89411 3.48077 8.82336 3.43615C8.75262 3.39153 8.69571 3.32808 8.65902 3.25291C8.62233 3.17775 8.60732 3.09384 8.61567 3.01062C8.62402 2.9274 8.65539 2.84815 8.70628 2.78176L10.6803 0.220514C10.732 0.15187 10.799 0.0961775 10.8759 0.0578259C10.9528 0.0194743 11.0376 -0.000488281 11.1235 -0.000488281C11.2095 -0.000488281 11.2943 0.0194743 11.3712 0.0578259C11.4481 0.0961775 11.5151 0.15187 11.5668 0.220514L13.5408 2.78176C13.5914 2.8481 13.6226 2.92721 13.6309 3.01025C13.6391 3.09329 13.6241 3.17699 13.5876 3.252C13.551 3.32701 13.4943 3.39038 13.4238 3.43501C13.3533 3.47965 13.2717 3.5038 13.1883 3.50476H12.3475V13.7498C12.3468 14.1083 12.4168 14.4634 12.5533 14.7949C12.6899 15.1264 12.8904 15.4277 13.1434 15.6817C13.3964 15.9357 13.697 16.1374 14.0279 16.2752C14.3589 16.413 14.7138 16.4843 15.0723 16.485C15.6754 16.4858 16.2725 16.3655 16.8282 16.1312C17.384 15.897 17.8871 15.5537 18.3078 15.1215C18.7241 14.7074 19.0529 14.2138 19.2748 13.6701C19.4967 13.1264 19.607 12.5437 19.5993 11.9565C19.591 11.3191 19.4475 10.6908 19.1784 10.113C18.9092 9.5352 18.5204 9.02113 18.0378 8.60476C16.4313 7.22626 15.523 5.57626 15.523 3.49726L15.5155 0.529514C15.5155 0.183014 15.913 -0.013486 16.1905 0.205514L19.5468 2.85676C19.8093 3.07576 19.6593 3.50476 19.3218 3.50476H17.8128Z" fill="#000000"/>
</svg> */}
                {typeIcons[item?.type]}
              </div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-12">
                    <h6 className="destination"> {item?.objective}</h6>

                    <span className="heading">{item.title}</span>
                    {/* {item?.status !== "in_progress" && (
                      <span
                        className={`badge ms-2 solution-badge-blue`}
                        style={{ padding: "3px 8px 3px 8px" }}
                      >
                        {t("solution.badge.enterprise")}
                      </span>
                    )} */}
                    {/* <h6 className="destination"> {item?.objective}</h6> */}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4 col-12">
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
                    <span className="time">{totalTime && ` ${totalTime}`}</span>
                  </div>
                  <div className="col-md-4 col-12">
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
                    <span className="time">{item?.type === "Special" ? "Media" : item?.type}</span>
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
                    <span className="time">{item?.solution_used_count} {item?.solution_used_count > 1 ? t("multipleTime") : t('oneTime')}</span>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="creator">{t("Creator")}</div>
                    <div className="">
                      <div>
                        <Tooltip title={item?.solution_creator?.full_name} placement="top">


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
                  </div>
                  <div className="col-md-6">
                    <div className="creator">{t("Privacy")}</div>
                    <div className="">
                      <div>
                        {/* <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden" }}> */}
                        <Tooltip title={item?.solution_creator?.enterprise?.name} placement="top">


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
                                  item?.solution_creator?.enterprise?.logo : item?.solution_creator?.enterprise?.logo
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

                        {/* </div> */}

                        <span
                          className={`badge ms-2 solution-badge-blue`}
                          style={{ padding: "3px 8px 3px 8px" }}
                        >
                          {t("solution.badge.enterprise")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="row my-2">
                    
                    </div> */}
              </div>
              <div className="col-md-1 d-flex justify-content-end">
                {/* <BsThreeDotsVertical /> */}
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
                    <ul
                      className={`dropdown-menu ${openDropdownId === item.id ? "show" : ""
                        }`}
                    >
                      <>
                        <li>
                          <a
                            className="dropdown-item"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            <RiEditBoxLine size={"20px"} /> &nbsp;
                            {t("dropdown.To modify")}
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item);
                            }}
                          >
                            <IoCopyOutline size={"18px"} /> &nbsp;
                            {t("dropdown.Duplicate")}
                          </a>
                        </li>

                        <hr
                          style={{
                            margin: "10px 0 0 0",
                            padding: "2px",
                          }}
                        />

                        <li>
                          <a
                            className="dropdown-item"
                            style={{
                              cursor: "pointer",
                              color: "red",
                            }}
                            onClick={(e) => handleDeleteClick(e, item.id)}
                          >
                            <AiOutlineDelete size={"20px"} color="red" />
                            &nbsp; {t("dropdown.Delete")}
                          </a>
                        </li>
                      </>
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
        {allMeetings?.length === 0 && !isLoading ? (
          <NoContent title="Business Solution" />
        ) : allMeetings?.length > 0 ? (
          <>
            {meetingsByMonth.map((meetingCard, index) => (
              <div key={index}>{meetingCard}</div>
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
          <NewMeetingModal open={open} closeModal={handleCloseModal} />
        </>
      )}
    </div>
  );
};

export default EnterpriseSolutions;
