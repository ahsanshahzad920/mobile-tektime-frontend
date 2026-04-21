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
import { useSolutionFormContext } from "../../../../context/CreateSolutionContext";
import { useSolutions } from "../../../../context/SolutionsContext";
import ConfirmationModal from "./../../../Utils/ConfirmationModal";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import NoContent from "../../Meeting/NoContent";
import { typeIcons } from "./../../../Utils/MeetingFunctions";
import { FaTh } from "react-icons/fa";
import { FaList } from "react-icons/fa6";
import CardViewItem from "./CardViewItem";

const PublicSolutions = ({ allMeetings }) => {
  const { isLoading, getPublicSolutions } = useSolutions();
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
  const userId = parseInt(CookieService.get("user_id"));
  const [isCardView, setIsCardView] = useState(true);

  const [t] = useTranslation("global");
  const navigate = useNavigate();
  // const [meetings, setSolutions] = useState([]);
  const moment = require("moment");
  require("moment/locale/fr");

  const handleDelete = async (item) => {
    const solutionCreatorId = parseInt(item?.solution_creator?.id);
    if (solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action"
        )
      );
      return;
    }
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/solutions/${item?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status) {
        toast.success(t("solutionDeletedSuccessfullToast"));
        getPublicSolutions();
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      toast.error(t(error.message));
    }
  };
  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    setItemIdToDelete(item);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const handleCopy = async (item) => {
    const solutionCreatorId = parseInt(item?.solution_creator?.id);
    if (solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action"
        )
      );
      return;
    }
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
    const solutionCreatorId = parseInt(item?.solution_creator?.id);
    if (solutionCreatorId !== userId) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action"
        )
      );
      return;
    }
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
        console.log("Total time", totalTime);

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
                {/* {formatDate(item)} */}
                {typeIcons[item?.type]}
              </div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-12">
                    <h6 className="destination"> {item?.objective}</h6>

                    <span className="heading">{item.title}</span>
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

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="creator">{t("Creator")}</div>
                    <div className="">
                      <div>
                        <Tooltip
                          title={item?.solution_creator?.full_name}
                          placement="top"
                        >
                          <Avatar
                            src={
                              item?.solution_creator?.image.startsWith("users/")
                                ? Assets_URL +
                                  "/" +
                                  item?.solution_creator?.image
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
                      {item?.solution_privacy === "public" ? (
                        <div>
                          <Avatar
                            src="/Assets/Tek.png"
                            style={{ borderRadius: "0" }}
                          />

                          <span
                            className={`badge ms-2 solution-badge-green`}
                            style={{ padding: "3px 8px 3px 8px" }}
                          >
                            {t("solution.badge.public")}
                          </span>
                        </div>
                      ) : (
                        <div>
                          {/* <Avatar
                          src="/Assets/Tek.png"
                          style={{ borderRadius: "0" }}
                        /> */}
                          <Avatar
                            src={
                              item?.solution_creator?.enterprise?.logo?.startsWith("http")
                                ?  item?.solution_creator?.enterprise?.logo
                                : Assets_URL + "/" + item?.solution_creator?.enterprise?.logo
                            }
                          />

                          <span
                            className={`badge ms-2 solution-badge-blue`}
                            style={{ padding: "3px 8px 3px 8px" }}
                          >
                            {t("solution.badge.membersOnly")}
                          </span>
                        </div>
                      )}
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
                      className={`dropdown-menu ${
                        openDropdownId === item.id ? "show" : ""
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
                            onClick={(e) => handleDeleteClick(e, item)}
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


     
   const handleToggle = (viewType) => {
     setIsCardView(viewType === "card");
   };
 
  return (
    <div className="scheduled">
        {/* Add Toggle Header */}
            <div className="contact-view-container p-0">
              <div className="view-toggle-container mb-3 d-flex justify-content-end">
                <div className="toggle-buttons d-flex gap-2">
                  <button
                    className={`toggle-btn ${isCardView ? "active" : ""}`}
                    onClick={() => handleToggle("card")}
                    aria-label="Card view"
                  >
                    <FaTh className="toggle-icon me-1" />
                    <span>Card View</span>
                  </button>
                  <button
                    className={`toggle-btn ${!isCardView ? "active" : ""}`}
                    onClick={() => handleToggle("list")}
                    aria-label="List view"
                  >
                    <FaList className="toggle-icon me-1" />
                    <span>List View</span>
                  </button>
                </div>
              </div>
            </div>
      <div className="my-2 container-fluid">
         {allMeetings?.length === 0 && !isLoading ? (
          <NoContent title="Public Solution" />
        ) : allMeetings?.length > 0 ? (
          <>
            {/* Conditional rendering based on view */}
            {isCardView ? (
              <div className="row">
                {allMeetings
                  .filter((m) => m.status !== "draft")
                  .map((item, idx) => (
                    <div key={idx} className="col-xl-3 col-lg-6 col-md-6 mb-4">
                      <CardViewItem
                        item={item}
                        onView={viewPresentation}
                        onEdit={handleEdit}
                        onCopy={handleCopy}
                        onDelete={handleDeleteClick}
                        t={t}
                        openDropdownId={openDropdownId}
                        toggleDropdown={toggleDropdown}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              // Existing list view
              <>
                {meetingsByMonth.map((meetingCard, index) => (
                  <div key={index}>{meetingCard}</div>
                ))}
              </>
            )}
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

export default PublicSolutions;
