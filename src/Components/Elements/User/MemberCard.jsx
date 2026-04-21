import React from "react";
import moment from "moment-timezone";
import { Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";

const MemberCard = ({ user, team, handleChangeStatus, handleUpdateUser }) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [t] = useTranslation("global");

  const createdAt = user?.created_at;
  const formattedDate = moment(createdAt).tz(userTimezone).format("DD/MM/YYYY");
  const formattedTime = moment(createdAt).tz(userTimezone).format("HH[h]mm");
  return (
    <div className="text-decoration-none">
      <div className="mt-3 mb-2 scheduled card team-card-sheduled p-4 rounded-4 border">
        <div className="row">
          <div className="col-md-1 column-1" style={{ fontSize: "24px" }}>
            <div className="profile-logo">
              <img
                // className="card-img user-img"
                src={
                  user?.image?.startsWith("http")
                    ? user?.image
                    : Assets_URL + "/" + user?.image
                }
                className="rounded-circle"
                width={70}
                height={70}
                style={{
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>
          </div>
          <div className="col-md-10" style={{ paddingLeft: "18px" }}>
            <div className="row">
              <div className="col-12">
                <h6 className="destination">{team?.enterprise?.name}</h6>
                <span className="heading">{user?.full_name}</span>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4 col-12">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
                  {formattedDate} {t("at")} {formattedTime}
                </span>
                &nbsp;
                <span>{userTimezone}</span>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-4 mt-2">
                <div className="creator">Creator</div>
                <div>
                  <div>
                    <span className="ant-avatar-circle ant-avatar-image css-1pg9a38 rounded-circle">
                      <img
                        src="https://ui-avatars.com/api/?name=MA&color=7F9CF5&background=EBF4FF"
                        className="rounded-circle"
                        width={30}
                        height={30}
                        style={{
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                      <span className="creator-name">Muneer AHMAD</span>
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
                <ul className="dropdown-menu ">
                  <li
                    style={{ cursor: "pointer" }}
                    onClick={() => handleUpdateUser(user?.id)}
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
                        <g id="Edit">
                          <g>
                            <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z" />
                            <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z" />
                          </g>
                        </g>
                      </svg>
                      &nbsp; {t("user.modify")}
                    </a>
                  </li>
                  <li
                    style={{ cursor: "pointer" }}
                    onClick={() => handleChangeStatus(user)}
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
                      &nbsp;{" "}
                      {user?.pivot?.status === "active"
                        ? t("user.Deactivate")
                        : t("user.Activate")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
