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
import { Avatar,Tooltip } from "antd";
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

const TeamSolutions = ({ allMeetings }) => {
  const { isLoading, getTeamSolutions } = useSolutions();
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
        getTeamSolutions();
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
        summary_status:false,
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
    if(!steps)return
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
        console.log('Total time', totalTime)

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
                {/* <svg
                  width="37"
                  height="36"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10.9996 0.75C10.4502 0.75 9.91334 0.914585 9.45831 1.22253C9.00328 1.53048 8.65092 1.96768 8.44668 2.47775C8.24244 2.98782 8.19567 3.54737 8.31241 4.08427C8.42914 4.62117 8.70403 5.11079 9.10162 5.49L8.90162 5.846L7.10462 9.069C6.98977 9.28545 6.86532 9.49666 6.73162 9.702C6.71313 9.72881 6.6931 9.75452 6.67162 9.779C6.64386 9.76123 6.61715 9.74186 6.59162 9.721C6.40652 9.55999 6.22868 9.39083 6.05862 9.214L5.97862 9.135C5.69509 8.84638 5.40434 8.56496 5.10662 8.291C5.26372 7.87227 5.29246 7.41623 5.18919 6.98109C5.08592 6.54595 4.85532 6.15146 4.52682 5.84798C4.19832 5.5445 3.78684 5.3458 3.3449 5.27724C2.90296 5.20869 2.45061 5.27339 2.04561 5.46309C1.64061 5.6528 1.30133 5.95889 1.07109 6.34229C0.840845 6.7257 0.730082 7.16902 0.752942 7.61566C0.775801 8.0623 0.931246 8.492 1.19943 8.84989C1.46761 9.20778 1.83637 9.47764 2.25862 9.625L2.26862 9.798C2.29262 10.123 2.33462 10.512 2.38162 10.956L2.56662 12.673L2.65362 13.503C2.76562 14.586 2.87362 15.621 3.03362 16.494C3.13362 17.046 3.26162 17.566 3.43762 18.017C3.61262 18.465 3.85462 18.892 4.21162 19.212C4.84162 19.776 5.60162 20.022 6.50762 20.138C7.38262 20.25 8.48562 20.25 9.85962 20.25H12.1396C13.5136 20.25 14.6166 20.25 15.4916 20.138C16.3986 20.022 17.1576 19.776 17.7876 19.212C18.1446 18.892 18.3866 18.465 18.5616 18.017C18.7376 17.566 18.8656 17.046 18.9666 16.494C19.1266 15.621 19.2336 14.586 19.3456 13.504L19.4326 12.674L19.6176 10.957C19.6646 10.512 19.7076 10.123 19.7296 9.798L19.7406 9.625C20.1629 9.47764 20.5316 9.20778 20.7998 8.84989C21.068 8.492 21.2234 8.0623 21.2463 7.61566C21.2692 7.16902 21.1584 6.7257 20.9282 6.34229C20.6979 5.95889 20.3586 5.6528 19.9536 5.46309C19.5486 5.27339 19.0963 5.20869 18.6543 5.27724C18.2124 5.3458 17.8009 5.5445 17.4724 5.84798C17.1439 6.15146 16.9133 6.54595 16.8101 6.98109C16.7068 7.41623 16.7355 7.87227 16.8926 8.291C16.6286 8.528 16.3386 8.817 16.0196 9.135L15.9406 9.214C15.6826 9.472 15.5286 9.624 15.4076 9.721C15.3821 9.74186 15.3554 9.76123 15.3276 9.779C15.3062 9.7545 15.2861 9.72879 15.2676 9.702C15.1339 9.49666 15.0095 9.28545 14.8946 9.069L13.0976 5.846L12.8976 5.49C13.2952 5.11079 13.5701 4.62117 13.6868 4.08427C13.8036 3.54737 13.7568 2.98782 13.5526 2.47775C13.3483 1.96768 12.996 1.53048 12.5409 1.22253C12.0859 0.914585 11.5491 0.75 10.9996 0.75ZM9.74962 3.5C9.74962 3.16848 9.88132 2.85054 10.1157 2.61612C10.3502 2.3817 10.6681 2.25 10.9996 2.25C11.3311 2.25 11.6491 2.3817 11.8835 2.61612C12.1179 2.85054 12.2496 3.16848 12.2496 3.5C12.2496 3.83152 12.1179 4.14946 11.8835 4.38388C11.6491 4.6183 11.3311 4.75 10.9996 4.75C10.6681 4.75 10.3502 4.6183 10.1157 4.38388C9.88132 4.14946 9.74962 3.83152 9.74962 3.5ZM10.2046 6.59C10.2846 6.445 10.3596 6.312 10.4286 6.19C10.8051 6.26973 11.1941 6.26973 11.5706 6.19C11.6406 6.312 11.7136 6.445 11.7946 6.59L13.6016 9.83C13.7566 10.108 13.8996 10.365 14.0396 10.564C14.1886 10.775 14.3906 11.009 14.7016 11.146C14.9696 11.264 15.2656 11.305 15.5556 11.265C15.8916 11.218 16.1506 11.049 16.3516 10.887C16.5396 10.734 16.7486 10.526 16.9756 10.301L16.9996 10.277C17.3746 9.903 17.6496 9.632 17.8596 9.44C17.9796 9.51 18.1056 9.57 18.2386 9.618L18.2336 9.692C18.2136 9.986 18.1736 10.349 18.1236 10.808L17.9416 12.513L17.8496 13.383C17.7796 14.053 17.7156 14.678 17.6406 15.25H4.35862C4.28047 14.6283 4.21046 14.0056 4.14862 13.382C4.12062 13.1 4.08962 12.81 4.05862 12.512L3.87462 10.808C3.82954 10.412 3.79154 10.0153 3.76062 9.618C3.89362 9.57 4.02062 9.51 4.14062 9.44C4.35062 9.632 4.62462 9.903 5.00062 10.277L5.02362 10.301C5.25062 10.526 5.45962 10.734 5.64762 10.887C5.84862 11.049 6.10762 11.218 6.44362 11.265C6.73362 11.305 7.02962 11.264 7.29762 11.145C7.60762 11.009 7.81162 10.775 7.95962 10.564C8.11764 10.3264 8.26382 10.0811 8.39762 9.829L10.2046 6.59ZM4.61762 16.75C4.68262 17.026 4.75462 17.266 4.83462 17.47C4.96462 17.8 5.09562 17.99 5.21162 18.094C5.52862 18.377 5.95062 18.554 6.69862 18.65C7.46662 18.749 8.47362 18.75 9.91162 18.75H12.0876C13.5256 18.75 14.5326 18.749 15.3006 18.65C16.0486 18.555 16.4706 18.377 16.7876 18.094C16.9036 17.99 17.0356 17.8 17.1646 17.471C17.2446 17.266 17.3166 17.026 17.3816 16.75H4.61762ZM2.24962 7.5C2.24963 7.35205 2.2934 7.20741 2.37542 7.08427C2.45744 6.96114 2.57405 6.86501 2.71057 6.80799C2.84709 6.75097 2.99743 6.7356 3.14266 6.76382C3.2879 6.79204 3.42154 6.86258 3.52678 6.96657C3.63202 7.07056 3.70415 7.20335 3.7341 7.34824C3.76404 7.49313 3.75047 7.64364 3.69508 7.78083C3.63969 7.91802 3.54497 8.03577 3.42282 8.11925C3.30067 8.20273 3.15656 8.24822 3.00862 8.25H2.99962C2.80071 8.25 2.60994 8.17098 2.46929 8.03033C2.32864 7.88968 2.24962 7.69891 2.24962 7.5ZM18.2496 7.5C18.2496 7.35166 18.2936 7.20666 18.376 7.08332C18.4584 6.95999 18.5756 6.86386 18.7126 6.80709C18.8497 6.75033 19.0005 6.73547 19.1459 6.76441C19.2914 6.79335 19.4251 6.86478 19.53 6.96967C19.6348 7.07456 19.7063 7.2082 19.7352 7.35368C19.7642 7.49917 19.7493 7.64997 19.6925 7.78701C19.6358 7.92406 19.5396 8.04119 19.4163 8.1236C19.293 8.20601 19.148 8.25 18.9996 8.25H18.9906C18.793 8.24841 18.6041 8.1686 18.4652 8.02804C18.3263 7.88747 18.2488 7.6976 18.2496 7.5Z"
                    fill="#000000"
                  />
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
                        className={`badge ms-2 solution-badge-yellow`}
                        style={{ padding: "3px 8px 3px 8px" }}
                      >
                        {t("solution.badge.team")}
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

                    <span className="time">
                      {totalTime ? ` ${totalTime}` : ""}
                    </span>
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
                    <span className="time">{item?.solution_used_count} {item?.solution_used_count > 1 ? t("multipleTime"): t('oneTime')}</span>
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
                    <div className="d-flex align-items-center flex-wrap">
                      <Avatar.Group>
                    {item?.solution_privacy_team_data?.map((item) => {
                      return (
                        <>
                          <Tooltip
                            title={item?.name}
                            placement="top"
                          >
                            <Avatar
                              size="large"
                              // src={
                              //   item?.logo?.startsWith("teams/")
                              //     ? Assets_URL + "/" + item.logo
                              //     :  item?.logo?.startsWith("storage/teams/")
                              //     ? Assets_URL + "/" + item.logo
                              //     : item.logo
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

                        <span
                          className={`badge ms-2 solution-badge-yellow`}
                          style={{ padding: "3px 8px 3px 8px" }}
                        >
                          {t("solution.badge.team")}
                        </span>
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
          <NoContent title="Team Solution" />
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

export default TeamSolutions;
