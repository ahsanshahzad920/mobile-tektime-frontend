import CookieService from '../../../Utils/CookieService';
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import moment from "moment";
import MomentCard from "../../Meeting/CurrentMeeting/components/MomentCard";
import { Col, Form, ListGroup, Row, Spinner, Tab, Tabs } from "react-bootstrap";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import { toast } from "react-toastify";

const CastingMemberDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [memberMeetings, setMemberMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("tab1");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  let fromMission = false;
  if (location?.state?.from === "Mission") {
    fromMission = true;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState("");
  const { destination_id } = useParams();
  // Get initial member data
  const getMember = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-destination-meetings/${id}?destination_id=${destination_id}&page=1`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setMember(response.data?.data);
        setMemberMeetings(response.data?.data?.meetings?.data || []);
        setHasMore(response.data?.data?.meetings?.last_page > 1);
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoading(false);

      if (error.response && error.response.status === 403) {
        setVisibilityMessage(
          error?.response?.data?.message ||
            "You don't have permission to access this resource."
        );
        setIsModalOpen(true);
      }
    }
  };

  // Load more meetings when scrolling
  const loadMoreMeetings = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axios.get(
        `${API_BASE_URL}/user-destination-meetings/${id}?destination_id=${destination_id}&page=${nextPage}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const newMeetings = response.data?.data?.meetings?.data || [];
        setMemberMeetings((prev) => [...prev, ...newMeetings]);
        setPage(nextPage);
        setHasMore(nextPage < response.data?.data?.meetings?.last_page);
      }
    } catch (error) {
      console.log("Error loading more meetings", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, id]);

  // Intersection Observer for infinite scroll
  const lastMeetingRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMeetings();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMoreMeetings]
  );

  useEffect(() => {
    getMember();
  }, [id]);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // --members
  const [showMemberStatusModal, setShowMemberStatusModal] = useState(false);
  const [memberToChange, setMemberToChange] = useState(null);
  const user = JSON.parse(CookieService.get("user"));

  const changeMemberStatus = (item) => {
    setMemberToChange(item);
    setShowMemberStatusModal(true);
  };

  // const team_id = parseInt(id);
  const confirmMemberStatus = async () => {
    if (!memberToChange) return;
    const token = CookieService.get("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/change-enterprise-user-status/${memberToChange?.id}`,
        {
          status: memberToChange?.status === "active" ? "closed" : "active",
          enterprise_id: parseInt(user?.enterprise?.id),
          _method: "put",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        navigate("/Team");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
    setShowMemberStatusModal(false);
  };

  return (
    <>
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="invite w-100"
          style={{
            position: "static",
            backgroundColor: "white",
            padding: "10px 15px",
          }}
        >
          <div className="row child-1 mb-5">
            <div className="col-md-6 w-100">
              <div className="title mb-1">
                {/* <Link
                  to={
                    fromMission
                      ? `/invitiesToMeeting/${member?.destination?.id}`
                      : `/Team`
                  }
                >
                  {fromMission
                    ? member?.destination?.destination_name
                    : "Casting"}
                </Link>
                <span> / </span>
                <Link
                  to={
                    fromMission
                      ? `/invitiesToMeeting/${member?.destination?.id}`
                      : `/Team`
                  }
                >
                  {fromMission
                    ? "Casting"
                    : `${t("team.membersof")} ${member?.enterprise?.name}`}
                </Link> */}
                   {(() => {
                                                try {
                                                  // First, get the raw user JSON (adjust key if your stored user object uses a different name)
                                                  const userJson = CookieService.get("user"); // or "current_user", etc.
                                                  if (!userJson) return false;
                                            
                                                  const user = JSON.parse(userJson);
                                            
                                                  // Now extract user_needs from the user object
                                                  const userNeeds = user?.user_needs || user?.needs || [];
                                            
                                                  return Array.isArray(userNeeds) && userNeeds.some(n => n.need === "mission_need");
                                                } catch (e) {
                                                  console.warn("Failed to parse user or user_needs", e);
                                                  return false;
                                                }
                                              })() && (
                                                <>
                                                              <Link
                                  to={
                                    fromMission
                                      ? `/invitiesToMeeting/${member?.destination?.id}`
                                      : `/Team`
                                  }
                                >
                                  {fromMission
                                    ? member?.destination?.destination_name
                                    : "Casting"}
                                </Link>
                                
                                                  <span> / </span>
                                <Link
                                  to={
                                    fromMission
                                      ? `/invitiesToMeeting/${member?.destination?.id}`
                                      : `/Team`
                                  }
                                >
                                  {fromMission
                                    ? "Casting"
                                    : `${t("team.membersof")} ${member?.enterprise?.name}`}
                                </Link>
                                                </>
                                              )}
              </div>
              <div className="invite-header d-flex align-items-start">
                <div className="col-md-8 d-flex flex-column">
                  <h5 className="content-heading-title w-100">
                    {member?.full_name}

                    <span
                      className={`mx-2 badge ${
                        member?.status === "active"
                          ? "status-badge-completed"
                          : member?.status === "closed"
                          ? "status-badge-red-invite"
                          : "status-badge-inprogress"
                      }`}
                    >
                      {member?.status === "active"
                        ? t("team.teamStatus.Active")
                        : member?.status === "closed"
                        ? t("team.teamStatus.Archived")
                        : t("team.teamStatus.Pending")}
                    </span>
                  </h5>
                  <div>
                    <div className="items">
                      <div className="type">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                            fill="#8590A3"
                          />
                        </svg>
                        {/* <span className="time">{meeting?.type}</span> */}
                        <span className="time">{member?.post}</span>
                      </div>
                      <div className="priority">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M12.346 6.79075C12.3618 6.77463 12.3808 6.76199 12.4018 6.75362C12.4228 6.74526 12.4453 6.74137 12.4679 6.74218C12.4905 6.743 12.5126 6.74851 12.533 6.75836C12.5533 6.76821 12.5714 6.78219 12.586 6.79941C13.4616 7.83748 13.9592 9.1419 13.9973 10.4994C13.9978 10.5213 13.9938 10.543 13.9857 10.5633C13.9776 10.5835 13.9656 10.602 13.9502 10.6175C13.9349 10.6331 13.9165 10.6454 13.8964 10.6537C13.8762 10.6621 13.8545 10.6663 13.8327 10.6661H10.8293C10.7849 10.6653 10.7424 10.6476 10.7104 10.6167C10.6785 10.5857 10.6595 10.5438 10.6573 10.4994C10.627 10.0165 10.4657 9.5509 10.1907 9.15275C10.167 9.11952 10.1557 9.07907 10.1588 9.0384C10.1618 8.99773 10.179 8.95941 10.2073 8.93008L12.346 6.79075ZM11.866 6.07941C11.9393 6.14075 11.9427 6.25141 11.8753 6.31941L9.73532 8.45875C9.70603 8.48691 9.66784 8.50399 9.62732 8.50703C9.5868 8.51007 9.54649 8.49889 9.51332 8.47541C9.20249 8.26075 8.84958 8.11463 8.47799 8.04675C8.43781 8.03991 8.4013 8.01924 8.37475 7.98831C8.34821 7.95739 8.33332 7.91816 8.33265 7.87741V4.85208C8.33265 4.75608 8.41265 4.68008 8.50865 4.68808C9.74476 4.79382 10.9177 5.27947 11.866 6.07941ZM7.66599 4.85275C7.66625 4.8301 7.66178 4.80765 7.65287 4.78684C7.64395 4.76602 7.63079 4.74729 7.61423 4.73186C7.59766 4.71642 7.57805 4.70461 7.55666 4.69719C7.53526 4.68976 7.51256 4.68689 7.48999 4.68875C6.25395 4.7943 5.08102 5.28038 4.13265 6.08008C4.11544 6.09471 4.10146 6.11276 4.0916 6.1331C4.08175 6.15343 4.07624 6.17559 4.07542 6.19817C4.07461 6.22075 4.0785 6.24325 4.08687 6.26424C4.09523 6.28523 4.10787 6.30424 4.12399 6.32008L6.26399 8.45941C6.29315 8.48781 6.33137 8.50505 6.37196 8.5081C6.41255 8.51114 6.45292 8.49981 6.48599 8.47608C6.7968 8.2614 7.14972 8.11528 7.52132 8.04741C7.56149 8.04057 7.59801 8.0199 7.62455 7.98898C7.65109 7.95806 7.66599 7.91883 7.66665 7.87808L7.66599 4.85275ZM5.80865 9.15275C5.83205 9.11951 5.84311 9.07915 5.83995 9.03862C5.83679 8.9981 5.81959 8.95995 5.79132 8.93075L3.65199 6.79075C3.63611 6.77467 3.61705 6.76207 3.59604 6.75377C3.57502 6.74546 3.55251 6.74163 3.52993 6.74251C3.50735 6.74338 3.4852 6.74896 3.46489 6.75887C3.44459 6.76878 3.42657 6.78282 3.41199 6.80008C2.53685 7.83833 2.03977 9.14273 2.00199 10.5001C2.00154 10.5219 2.00546 10.5435 2.01351 10.5638C2.02156 10.584 2.03358 10.6024 2.04886 10.618C2.06415 10.6335 2.08238 10.6458 2.1025 10.6542C2.12261 10.6626 2.1442 10.6668 2.16599 10.6667H5.16932C5.26132 10.6667 5.33599 10.5927 5.34132 10.5001C5.37132 10.0154 5.53465 9.54941 5.80799 9.15341"
                            fill="#8590A3"
                            fill-opacity="0.25"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.33203 7.87077C8.33203 7.95477 8.3947 8.02477 8.47737 8.0401C8.85073 8.10802 9.20529 8.25485 9.51737 8.47077C9.55067 8.49434 9.59116 8.50551 9.63183 8.50234C9.67251 8.49918 9.71079 8.48187 9.74004 8.45344L12.3467 5.84677C12.3628 5.83102 12.3756 5.8121 12.384 5.79119C12.3925 5.77029 12.3966 5.74786 12.3959 5.72531C12.3953 5.70276 12.39 5.68059 12.3804 5.66019C12.3708 5.63979 12.357 5.6216 12.34 5.60677C11.2636 4.6834 9.92079 4.12735 8.5067 4.01944C8.48426 4.01788 8.46174 4.02097 8.44055 4.02851C8.41936 4.03606 8.39996 4.04791 8.38356 4.0633C8.36717 4.0787 8.35412 4.09732 8.34526 4.11799C8.33639 4.13866 8.33189 4.16094 8.33203 4.18344V7.87077Z"
                            fill="#8590A3"
                          />
                        </svg>
                        <span className="time">{member?.email}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 content-body mt-3 mb-2 mt-lg-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                        />
                        <span className="fw-bold formate-date">
                          {moment(member?.created_at)
                            .tz(userTimezone)
                            .format("DD/MM/YYYY")}
                          &nbsp; {t("at")}
                        </span>
                        <span className="fw-bold formate-date">
                          {moment(member?.created_at)
                            .tz(userTimezone)
                            .format("HH[h]mm")}
                        </span>
                        <span className="fw-bold">{userTimezone}</span>
                      </div>
                    </div>

                    {member?.work_time && (
                      <div className="paragraph-parent mt-3 ms-1 w-100 position-relative">
                        <label
                          className="form-label mb-1"
                          style={{ fontWeight: "700" }}
                        >
                          {t("Work Time")}: &nbsp;
                        </label>
                        <span
                          className="paragraph paragraph-images fw-bold"
                          style={{ color: "black" }}
                        >
                          {(() => {
                            const hours = Math.floor(member.work_time / 3600);
                            if (hours >= 24) {
                              const days = Math.floor(hours / 24);
                              return `${days} ${
                                days === 1
                                  ? t("time_unit.day")
                                  : t("time_unit.days")
                              }`;
                            } else {
                              return `${hours} ${
                                hours === 1
                                  ? t("time_unit.hour")
                                  : t("time_unit.hours")
                              }`;
                            }
                          })()}
                        </span>
                      </div>
                    )}

                    {member?.bio && (
                      <div className="paragraph-parent mt-3 ms-1 w-100 position-relative">
                        <label className="form-label fw-bold mb-1">Bio:</label>
                        <br />{" "}
                        <span className="paragraph paragraph-images">
                          {member?.bio}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="col-md-4 d-flex justify-content-end"
                  style={{ height: "100%" }}
                >
                  <div className="play-btn-container d-flex align-items-center gap-3">
                    {member?.image && (
                      <img
                        src={
                          member?.image?.startsWith("http")
                            ? member?.image
                            : Assets_URL + "/" + member?.image
                        }
                        alt="client logo"
                        className="rounded-circle logo-clickable"
                        style={{
                          width: "170px",
                          height: "170px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   const currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                        //   copy(currentURL);
                        //   openLinkInNewTab(currentURL);
                        // }}
                      />
                    )}

                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-secondary show"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "0px",
                        }}
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth={0}
                          viewBox="0 0 24 24"
                          color="black"
                          height="25px"
                          width="25px"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ color: "black" }}
                        >
                          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="left-start"
                        style={{
                          position: "absolute",
                          inset: "0px 0px auto auto",
                          margin: "0px",
                          transform: "translate(-51px, 25px)",
                        }}
                      >
                        <li style={{ cursor: "pointer" }}>
                          <Link
                            to={`/ModifierUser/${member?.id}`}
                            className="dropdown-item"
                          >
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="Edit">
                                <g>
                                  <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z" />
                                  <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z" />
                                </g>
                              </g>
                            </svg>
                            &nbsp;{t("user.modify")}
                          </Link>
                        </li>
                        {/* <li
                          style={{ cursor: "pointer" }}
                          onClick={() => changeMemberStatus(member)}
                        >
                          <a className="dropdown-item">
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z" />
                            </svg>
                            &nbsp; {t("user.Deactivate")}
                          </a>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tabs-container py-1 px-3`}>
            <div className="tabs-header">
              <div
                className="row align-items-center gutter-0"
                style={{ padding: "0 10px" }}
              >
                {/* Tabs Section */}
                <div
                  className="col-lg-11 col-md-10 col-12 border-bottom tabs-meeting"
                  style={{ borderBottom: "2px solid #F2F2F2" }}
                >
                  <div className="tabs" style={{ overflowX: "auto" }}>
                    <div className="d-flex">
                      <button
                        className={`tab ${
                          activeTab === "tab1" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab1")}
                      >
                        {t("profile.personalInfo")}

                        {/* <span
                          className={activeTab === "tab1" ? "future" : "draft"}
                        >
                          {memberMeetings?.length || 0}
                        </span> */}
                      </button>
                      <button
                        className={`tab ${
                          activeTab === "tab2" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab2")}
                      >
                        {t("Moments")}
                        <span
                          className={activeTab === "tab2" ? "future" : "draft"}
                        >
                          {member?.total_meeting_counts || 0}
                        </span>
                      </button>
                      {(member?.social_links?.length > 0 ||
                        member?.websites?.length > 0 ||
                        member?.affiliation_links?.length > 0 ||
                        member?.products?.length > 0) && (
                        <button
                          className={`tab ${
                            activeTab === "tab3" ? "active" : ""
                          }`}
                          onClick={() => setActiveTab("tab3")}
                        >
                          {t("profile.socialProfiles")}
                        </button>
                      )}
                      <button
                        className={`tab ${
                          activeTab === "tab4" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab4")}
                      >
                        {t("Working days")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="member-profile-container">
              {activeTab === "tab1" && (
                <div className="member-profile-card p-4">
                  <div className="row">
                    {/* Right Column - Member Details */}
                    <div className="col-md-8">
                      <div className="member-details">
                        <div className="detail-grid">
                          {/* Row 1 */}
                          <div className="detail-item">
                            <span className="detail-label">Prénom:</span>
                            <span className="detail-value">
                              {member?.name || "-"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Nom:</span>
                            <span className="detail-value">
                              {member?.last_name || "-"}
                            </span>
                          </div>

                          {/* Row 2 */}
                          <div className="detail-item">
                            <span className="detail-label">Pseudo:</span>
                            <span className="detail-value">
                              {member?.nick_name || "-"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Entreprise:</span>
                            <span className="detail-value">
                              {member?.enterprise?.name || "-"}
                            </span>
                          </div>

                          {/* Row 3 */}
                          <div className="detail-item">
                            <span className="detail-label">Poste:</span>
                            <span className="detail-value">
                              {member?.post || "-"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">
                              <a href={`mailto:${member?.email}`}>
                                {member?.email || "-"}
                              </a>
                            </span>
                          </div>

                          {/* Row 4 */}
                          <div className="detail-item">
                            <span className="detail-label">Téléphone:</span>
                            <span className="detail-value">
                              {member?.phoneNumber ? (
                                <a href={`tel:${member?.phoneNumber}`}>
                                  {member?.phoneNumber}
                                </a>
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>

                          <div className="detail-item">
                            <span className="detail-label">
                              {t("profile.role")}:
                            </span>
                            <span className="detail-value">
                              {member?.role?.name || ""}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">
                              {t("invities.taxAvg")}:
                            </span>
                            <span className="detail-value">
                              {member?.daily_rates || ""} {member?.currency}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">
                              {t("user.lastConnection")}:
                            </span>
                            <span className="detail-value">
                              {member?.last_connection || ""}
                            </span>
                          </div>
                        </div>

                        {/* Teams Section */}
                        <div className="teams-section mt-4">
                          <h5 className="section-title mb-3">
                            {t("profile.teams")}
                          </h5>
                          {member?.teams?.length > 0 ? (
                            <div className="teams-grid">
                              {member.teams.map((team) => (
                                <div key={team.id} className="team-badge">
                                  <img
                                    src={
                                      team.logo?.startsWith("http")
                                        ? team.logo
                                        : Assets_URL + "/" + team.logo
                                    }
                                    alt={team.name}
                                    className="team-logo"
                                    // onError={(e) => {
                                    //   e.target.src = "/Assets/default-team.png";
                                    // }}
                                  />
                                  <span className="team-name">{team.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No teams assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {activeTab === "tab2" && (
              <div className="meetings-list">
                {memberMeetings.length > 0 ? (
                  memberMeetings.map((meeting, index) => (
                    <div
                      key={`${meeting.id}-${index}`}
                      ref={
                        index === memberMeetings.length - 1
                          ? lastMeetingRef
                          : null
                      }
                    >
                      <MomentCard item={meeting} refresh={getMember} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted mt-3">No moments found.</p>
                )}

                {isLoadingMore && (
                  <div className="text-center my-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                )}
              </div>
            )}
            {activeTab === "tab3" && (
              <div className="social-profiles-container">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <div className="row mt-3">
                    {/* Social Networks Section */}
                    {member?.social_links?.length > 0 && (
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-white border-bottom-0">
                            <h5 className="card-title mb-0">
                              <i className="bi bi-share-network me-2"></i>
                              {t("profile.socialMedia")}
                            </h5>
                          </div>
                          <div className="card-body">
                            {member?.social_links?.length > 0 ? (
                              <div className="social-network-list">
                                {member?.social_links?.map((social) => (
                                  <div
                                    key={social.id}
                                    className="social-item d-flex align-items-center mb-3"
                                  >
                                    <div
                                      className={`social-icon bg-${social.platform.toLowerCase()}`}
                                    >
                                      <i
                                        className={`bi bi-${social.platform.toLowerCase()}`}
                                      ></i>
                                    </div>
                                    <div className="social-details ms-3">
                                      <h6 className="mb-0">
                                        {social.platform}
                                      </h6>
                                      <a
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-truncate d-block"
                                        style={{ maxWidth: "250px" }}
                                      >
                                        {social.link.replace(
                                          /^https?:\/\/(www\.)?/,
                                          ""
                                        )}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-muted">
                                No social networks added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sites Section */}
                    {member?.websites?.length > 0 && (
                      <div className="col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-header bg-white border-bottom-0">
                            <h5 className="card-title mb-0">
                              <i className="bi bi-globe me-2"></i>
                              Sites
                            </h5>
                          </div>
                          <div className="card-body">
                            {member?.websites?.length > 0 ? (
                              <div className="sites-list">
                                {member?.websites?.map((site) => (
                                  <div
                                    key={site.id}
                                    className="site-item d-flex align-items-center mb-3"
                                  >
                                    <div className="site-icon bg-primary">
                                      <i className="bi bi-link-45deg"></i>
                                    </div>
                                    <div className="site-details ms-3">
                                      <h6 className="mb-0">{site.title}</h6>
                                      <a
                                        href={site.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-truncate d-block"
                                        style={{ maxWidth: "250px" }}
                                      >
                                        {site.link.replace(
                                          /^https?:\/\/(www\.)?/,
                                          ""
                                        )}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-muted">
                                No sites added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Affiliation Section */}
                    {member?.affiliation_links?.length > 0 && (
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header bg-white border-bottom-0">
                            <h5 className="card-title mb-0">
                              <i className="bi bi-globe me-2"></i>
                              {t("profile.Affiliation")}
                            </h5>
                          </div>
                          <div className="card-body">
                            {member?.affiliation_links?.length > 0 ? (
                              <div className="sites-list">
                                {member?.affiliation_links?.map((site) => (
                                  <div
                                    key={site.id}
                                    className="site-item d-flex align-items-center mb-3"
                                  >
                                    <div className="site-icon bg-primary">
                                      <i className="bi bi-link-45deg"></i>
                                    </div>
                                    <div className="site-details ms-3">
                                      <h6 className="mb-0">{site.title}</h6>
                                      <a
                                        href={site.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-truncate d-block"
                                        style={{ maxWidth: "250px" }}
                                      >
                                        {site.link.replace(
                                          /^https?:\/\/(www\.)?/,
                                          ""
                                        )}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-muted">
                                No sites added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Partnerships Section */}
                    {member?.products?.length > 0 && (
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-header bg-white border-bottom-0">
                            <h5 className="card-title mb-0">
                              <i className="bi bi-handshake me-2"></i>
                              {t("profile.products")}
                            </h5>
                          </div>
                          <div className="card-body">
                            {member?.products?.length > 0 ? (
                              <div className="partnerships-list">
                                {member?.products?.map((partnership) => (
                                  <div
                                    key={partnership.id}
                                    className="partnership-item mb-4"
                                  >
                                    <div className="row align-items-center">
                                      <div className="col-md-3 mb-3 mb-md-0">
                                        <div className="product-image-container">
                                          <img
                                            src={
                                              Assets_URL +
                                                "/" +
                                                partnership.product_image ||
                                              "/Assets/default-product.png"
                                            }
                                            alt={partnership.product_title}
                                            className="img-fluid rounded"
                                            // onError={(e) => {
                                            //   e.target.src = '/Assets/default-product.png';
                                            //   e.target.className = 'img-fluid rounded bg-light p-4';
                                            // }}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-9">
                                        <h5 className="product-title">
                                          {partnership.product_title}
                                        </h5>
                                        <p className="product-description text-muted">
                                          {partnership.product_description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-muted">
                                No partnerships added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "tab4" && (
              <div className="working-days-container p-4 bg-light rounded-3 shadow-sm">
                {/* Time Zone Section */}
                <div className="mb-5">
                  <h4 className="mb-4">{t("destination.Time Zone")}</h4>
                  <div className="card">
                    <div className="card-body bg-light">
                      <p className="mb-0">
                        <strong>{t("destination.Your Time Zone")}:</strong>{" "}
                        {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Working Days Section */}
                <div className="mb-5">
                  <h4 className="mb-4">
                    {t("destination.Standing Working Days")}
                  </h4>
                  <Row>
                    <Col md={2} className="text-end">
                      <Form.Label className="text-muted small mb-1">
                        {t("destination.Every")}
                      </Form.Label>
                    </Col>
                    <Col md={8}>
                      <div className="d-grid gap-2">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const localizedDay = t(
                            `destination.days.${day.toLowerCase()}`
                          );
                          const isActive = member?.work_schedule?.some(
                            (wd) => wd.day_of_week === day
                          );

                          return (
                            <div
                              key={day}
                              className="d-flex align-items-center mb-2"
                            >
                              <div style={{ minWidth: "150px" }}>
                                <Form.Check
                                  type="checkbox"
                                  id={`day-${day}`}
                                  label={localizedDay}
                                  checked={isActive}
                                  disabled
                                  //  onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                                />
                              </div>

                              {isActive && (
                                <div className="d-flex gap-2 align-items-center ms-3">
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    style={{ maxWidth: "130px" }}
                                    value={
                                      member?.work_schedule.find(
                                        (wd) => wd.day_of_week === day
                                      )?.start_time || "09:00"
                                    }
                                    disabled

                                    //  onChange={(e) =>
                                    //    updateWorkingDayTime(day, "start_time", e.target.value)
                                    //  }
                                  />
                                  <span className="text-muted small">
                                    {t("destination.common.to")}
                                  </span>
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    style={{ maxWidth: "130px" }}
                                    value={
                                      member?.work_schedule?.find(
                                        (wd) => wd.day_of_week === day
                                      )?.end_time || "17:00"
                                    }
                                    disabled

                                    //  onChange={(e) =>
                                    //    updateWorkingDayTime(day, "end_time", e.target.value)
                                    //  }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Non-Working Days Section */}
                {member?.non_work_schedule?.length > 0 && (
                  <div>
                         <h5 className="fw-bold mb-3">{t("destination.Non-Working Days")}</h5>
                         <Row>
                             <Col md={2} className="text-end">
                               <Form.Label className="text-muted small mb-1">
                                 {t("destination.Dates")}
                               </Form.Label>
                             </Col>
                             <Col md={8}>
                               {member?.non_work_schedule?.length === 0 ? (
                                 <p className="text-muted small">{t("destination.No dates selected")}</p>
                               ) : (
                                 <ListGroup variant="flush">
                                   {member?.non_work_schedule?.map((date, index) => (
                                     <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                       <span className="small">
                                         {date.date} - {date.start_time} to {date.end_time}
                                       </span>
                                      
                                     </ListGroup.Item>
                                   ))}
                                 </ListGroup>
                               )}
                              
                             </Col>
                           </Row>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showMemberStatusModal && (
        <ConfirmationModal
          message={
            memberToChange?.status === "active"
              ? `${t("deactive_member_status_confirmation")} ${
                  memberToChange?.name + " " + memberToChange?.last_name
                }?`
              : `${t("active_member_status_confirmation")} ${
                  memberToChange?.name + " " + memberToChange?.last_name
                }?`
          }
          onConfirm={confirmMemberStatus}
          onCancel={() => {
            setShowMemberStatusModal(false);
            setMemberToChange(null);
          }}
          // isLoading={isDeleting}
        />
      )}

      {isModalOpen && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <p>{visibilityMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CastingMemberDetail;
