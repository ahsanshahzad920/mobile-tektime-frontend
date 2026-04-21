import CookieService from '../../Utils/CookieService';
import React from "react";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";
import { RiDeleteRow } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function Members({
  enterpriseUsers = [],
  enterprise,
  enterpriseLoading,
  getEnterpriseUsers,
}) {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  const handleUpdateUser = (id) => {
    navigate(`/ModifierUser/${id}`);
  };

   const handleUpdateStatus = async (user) => {
      const token = CookieService.get("token");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/user-teams-status/closed/${user?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response) {
          getEnterpriseUsers();
        }
      } catch (error) {
        toast.error(t(error?.response?.data?.errors[0] || error.message));
        // console.log("error", error);
      }
    };
  return (
    <div className="py-3 team-new-card">
      {enterpriseUsers?.map((user, index) => (
        <div
          className="text-decoration-none"
          style={{ cursor: "pointer" }}
          key={index}
          onClick={()=>{
            navigate(`/member/${user?.id}`)
          }}
        >
          <div className="mt-3 mb-2 scheduled card team-card-sheduled p-4 rounded-4 border">
            <div className="row">
              <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
                <div className="profile-logo">
                  <img
                    className="rounded-circle"
                    width={70}
                    height={70}
                    style={{
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                    src={
                      user?.image?.startsWith("http")
                        ? user?.image
                        : Assets_URL + "/" + user?.image || `https://ui-avatars.com/api/?name=${
                          user.full_name || "CL"
                        }&color=7F9CF5&background=EBF4FF`
                    }
                    alt={user.full_name}
                  />
                </div>
              </div>
              <div className="col-md-10" style={{ paddingLeft: "18px" }}>
                <div className="row">
                  <div className="col-12">
                    <h6 className="destination">{enterprise?.name}</h6>
                    <span className="heading">
                      {user.full_name}{" "}
                      <span
                        className={`${
                          user?.status === "closed"
                            ? "status-badge-red1"
                            : user?.status === "pending"
                            ? "late"
                            : "inprogrss"
                        } mx-2 badge`}
                      >
                        {user?.status === "closed"
                          ? t("teamStatus.closed")
                          : user?.status === "pending"
                          ? t("teamStatus.pending")
                          : t("teamStatus.active")}
                      </span>
                      {/* badge color conditions */}
                      {/* <span class="mx-2 badge inprogrss">Validate</span>
                      <span class="badge ms-2 late">Desactivate</span> */}
                    </span>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4 col-12">
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                        stroke="#92929D"
                        strokeMiterlimit={10}
                      />
                      <path
                        d="M8.14258 4.5V9H11.1426"
                        stroke="#92929D"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="time">
                      {moment(user?.created_at)
                        .tz(moment.tz.guess())
                        .format("DD/MM/YYYY [at] HH[h]mm")}
                    </span>
                    &nbsp;
                    <span className>{moment.tz.guess()}</span>
                  </div>
                  <div className="col-md-4 col-12">
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
                    <span className="time">
                      {user?.post}
                    </span>
                    &nbsp;
                  </div>
                  <div className="col-md-4 col-12">
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
                    <span className="time">
                     {user?.role?.name}
                    </span>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-4 mt-2">
                    <div className="creator">Creator</div>
                    <div>
                      <span className="ant-avatar-circle ant-avatar-image css-1pg9a38 rounded-circle">
                        <img
                          src={`https://ui-avatars.com/api/?name=${
                            user.creatorName || "NA"
                          }&color=7F9CF5&background=EBF4FF`}
                          className="rounded-circle"
                          width={30}
                          height={30}
                          style={{
                            objectFit: "cover",
                            objectPosition: "center top",
                          }}
                          alt={user.creatorName}
                        />
                        <span className="creator-name">
                          {user.creatorName || "Unknown"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-1 d-flex justify-content-end">
                <div className="col-md-1 text-end obj1 d-flex justify-content-end">
                  <div className="dropdown dropstart">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
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
                    <ul className="dropdown-menu">
                      <li
                        style={{ cursor: "pointer" }}
                        onClick={() => handleUpdateUser(user?.id)}
                      >
                        <a className="dropdown-item">
                          <CiEdit size={"20px"} /> &nbsp; {t("Team.modify")}
                        </a>
                      </li>
                      {/* <li
                        style={{ cursor: "pointer" }}
                        onClick={() => handleUpdateStatus(user)}
                      >
                        <a className="dropdown-item">
                          <RiDeleteRow size={"20px"} /> &nbsp;
                          {user?.status === "active" ? t("Team.Deactivate") : t("user.Activate")}
                        </a>
                      </li> */}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Members;
