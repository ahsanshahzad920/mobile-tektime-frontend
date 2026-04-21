import CookieService from "../../../Utils/CookieService";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiEditBoxLine } from "react-icons/ri";
import { Avatar } from "antd";
import { Assets_URL } from "../../../Apicongfig";
import EditParticipantModal from "./EditParticipantModal";
import { AiOutlineEye } from "react-icons/ai";
import { FaTh } from "react-icons/fa";
import { FaList } from "react-icons/fa6";
import TeamCard from "../../Team/TeamCard";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "react-bootstrap";

const Participants = ({
  meetings,
  participants,
  isLoading,
  refreshedParticipants,
  refreshBudget,
  activeTab,
  id,
  progress,
  showProgress,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(!show);
    // refreshedParticipants()
  };

  const [participant, setParticipant] = useState(null);
  const updateParticipant = (item) => {
    CookieService.set("missionTab", "Participants");

    // navigate(`/updateParticipant/${item.id}`);
    setParticipant(item);
    setShow(true);
  };
  const userId = parseInt(CookieService.get("user_id"));
  const handleShowProfileLink = (item) => {
    if (item?.user_id) {
      navigate(`/casting/member/${id}/${item?.user_id}`, {
        state: { from: "Mission" },
      });
    } else {
      navigate(`/casting/contact/${id}/${item?.id}`, {
        state: { from: "Mission" },
      });
    }
  };

  const [completedCosts, setCompletedCosts] = useState({});
  // -------------------------------------------------------FOR COMPLETED
  function calculateParticipantCompletedDaysAndCost(meetings, participants) {
    if (!meetings?.length || !participants?.length) {
      return { participantTimes: {}, participantCosts: {} }; // safe fallback
    }

    // Objects to store total days and total cost for each participant
    const participantTimes = {};
    const participantCosts = {};

    // Iterate through all meetings
    meetings.forEach((meeting) => {
      meeting.meeting_steps?.forEach((step) => {
        if (step.step_status !== "completed") return; //  Only consider completed steps

        const participantId = step.userPID;

        // Find the participant in the `participants` array
        const participant = participants.find(
          (p) => p.user_id === participantId,
        );
        if (!participant) return;

        const participantName = `${participant.first_name} ${participant.last_name}`;

        const dailyCost = participant ? Number(participant.daily_rates) : 0; // Use 0 if no participant found

        // Initialize participant's time and cost if not exists
        if (!participantTimes[participantName]) {
          participantTimes[participantName] = 0;
          participantCosts[participantName] = 0;
        }

        // let timeInDays = 0;

        // // Process `time_taken` if available
        // if (step.time_taken) {
        //   const timeParts = step.time_taken.split(" - ");
        //   timeParts.forEach((part) => {
        //     const [value, unit] = part.split(" ");
        //     const numValue = parseFloat(value);

        //     switch (unit.toLowerCase()) {
        //       case "day":
        //       case "days":
        //         timeInDays += numValue;
        //         break;
        //       case "hour":
        //       case "hours":
        //         timeInDays += numValue / 24;
        //         break;
        //       case "min":
        //       case "mins":
        //       case "minute":
        //       case "minutes":
        //         timeInDays += numValue / (24 * 60);
        //         break;
        //       case "sec":
        //       case "secs":
        //       case "second":
        //       case "seconds":
        //         timeInDays += numValue / (24 * 60 * 60);
        //         break;
        //     }
        //   });
        // }

        // // Update totals
        // participantTimes[participantId] += timeInDays;
        // participantCosts[participantId] += timeInDays;
        let timeInHours = 0;

        if (step.time_taken) {
          const timeParts = step.time_taken.split(" - ");
          timeParts.forEach((part) => {
            const [value, unit] = part.split(" ");
            const numValue = parseFloat(value);

            switch (unit.toLowerCase()) {
              case "day":
              case "days":
                timeInHours += numValue * 24;
                break;
              case "hour":
              case "hours":
                timeInHours += numValue;
                break;
              case "min":
              case "mins":
              case "minute":
              case "minutes":
                timeInHours += numValue / 60;
                break;
              case "sec":
              case "secs":
              case "second":
              case "seconds":
                timeInHours += numValue / 3600;
                break;
            }
          });
        }

        // participantTimes[participantId] += timeInHours;
        // participantCosts[participantId] += timeInHours;
        participantTimes[participantName] += timeInHours;
        participantCosts[participantName] += timeInHours;
        // participantCosts[participantId] += timeInDays * dailyCost; // Multiply by daily cost
      });
    });

    // Round values to 2 decimal places

    // with participant id
    // Object.keys(participantTimes).forEach((participantId) => {
    //   participantTimes[participantId] = Number(participantTimes[participantId]);
    //   participantCosts[participantId] = Number(participantCosts[participantId]);
    // });
    // with participant name
    // Object.keys(participantTimes).forEach((name) => {
    //   participantTimes[name] = Math.floor(participantTimes[name]); // Round down to the nearest integer
    //   participantCosts[name] = Math.floor(participantCosts[name]); // Round down to the nearest integer
    // });
    Object.keys(participantTimes).forEach((name) => {
      participantTimes[name] = Math.round(participantTimes[name]); // Round to nearest integer
      participantCosts[name] = Math.round(participantCosts[name]); // Round to nearest integer
    });

    // Object.keys(participantTimes).forEach((name) => {
    //   participantTimes[name] = Number(participantTimes[name].toFixed(2));
    //   participantCosts[name] = Number(participantCosts[name].toFixed(2));
    // });

    return { participantTimes, participantCosts };
  }

  //CompletedCosts
  useEffect(() => {
    if (meetings?.length > 0 && participants?.length > 0) {
      const { participantCosts } = calculateParticipantCompletedDaysAndCost(
        meetings,
        participants,
      );
      setCompletedCosts(participantCosts);
    }
  }, [meetings, participants, activeTab]);

  const [isCardView, setIsCardView] = useState(true);

  const handleToggle = (viewType) => {
    setIsCardView(viewType === "card");
  };

  return (
    <>
      {showProgress ? (
        <div
          style={{
            background: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "50%" }}>
            <ProgressBar now={progress} animated />
          </div>
        </div>
      ) : (
        <div>
          <div className="contact-view-container p-0">
            <div className="view-toggle-container d-flex justify-content-end mb-0">
              <div className="toggle-buttons">
                <button
                  className={`toggle-btn ${isCardView ? "active" : ""}`}
                  onClick={() => handleToggle("card")}
                  aria-label="Card view"
                >
                  <FaTh className="toggle-icon" />
                </button>
                <button
                  className={`toggle-btn ${!isCardView ? "active" : ""}`}
                  onClick={() => handleToggle("list")}
                  aria-label="List view"
                >
                  <FaList className="toggle-icon" />
                </button>
              </div>
            </div>
          </div>

          {isCardView ? (
            <TeamCard
              teams={participants}
              isTeamView={false}
              isMemberView={false}
              isClientView={false}
              isContactView={false}
              isCastingView={true}
              isTeamMemberView={false}
              isEnterpriseView={false}
              completedCosts={completedCosts}
              show={show}
              setShow={setShow}
              editData={setParticipant}
              refresh={refreshedParticipants}
              refreshBudget={refreshBudget}
              destinationId={id}
            />
          ) : (
            <>
              <div className="destination-to-participants table-responsive">
                <table className="team-members-table">
                  <thead>
                    <tr className="table-header-row">
                      <th>#</th>
                      <th>{t("invities.name")}</th>
                      <th>{t("invities.email")}</th>
                      <th>{t("invities.enterprise")}</th>
                      <th>{t("invities.post")}</th>
                      <th>{t("invities.taxAvg")}</th>
                      <th>{t("invities.timePassed")}</th>
                      <th>{t("invities.workingTimeEstimate")}</th>
                      <th>Moments</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants?.map((item, index) => {
                      // Check if the participant is not in the meetings array
                      const participantName = `${item?.first_name} ${item?.last_name}`;
                      const cost = completedCosts[participantName] || 0; // Get the cost for the participant, or 0 if not available

                      return (
                        <tr
                          key={index}
                          className="team-member-row"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => handleShowProfileLink(item)}
                        >
                          <td>{index + 1}.</td>
                          <td>
                            <Avatar
                              src={
                                item?.participant_image?.startsWith("users/")
                                  ? Assets_URL + "/" + item?.participant_image
                                  : item?.participant_image
                              }
                            />
                            &nbsp; &nbsp;
                            {item?.first_name + " " + item?.last_name}
                          </td>
                          <td>{item?.email}</td>
                          <td>
                            {item?.user_id
                              ? item?.enterprise?.name
                              : item?.contact?.clients?.name || "No enterprise"}
                          </td>
                          <td>{item?.post}</td>
                          <td>
                            {item?.daily_rates} {item?.currency}
                          </td>
                          <td>
                            {/* {item.work_time ? Math.floor(item.work_time / 3600) : 0}{" "}
  {(item.work_time ? Math.floor(item.work_time / 3600) : 0) === 1 ? "hour" : "hours"} */}
                            {item?.work_time >= 86400
                              ? `${Math.floor(item.work_time / 86400)} ${Math.floor(item.work_time / 86400) === 1 ? t("time_unit.day") : t("time_unit.days")}`
                              : `${Math.floor(item.work_time / 3600)} ${Math.floor(item.work_time / 3600) === 1 ? t("time_unit.hour") : t("time_unit.hours")}`}

                            {/* {cost} {cost > 1 ? t("hours") : t("hour")} */}
                          </td>
                          <td>
                            {/* {item.work_time ? Math.floor(item.work_time / 3600) : 0}{" "}
  {(item.work_time ? Math.floor(item.work_time / 3600) : 0) === 1 ? "hour" : "hours"} */}
                            {item?.working_estimate_time >= 86400
                              ? `${Math.floor(item.working_estimate_time / 86400)} ${Math.floor(item.working_estimate_time / 86400) === 1 ? t("time_unit.day") : t("time_unit.days")}`
                              : `${Math.floor(item.working_estimate_time / 3600)} ${Math.floor(item.working_estimate_time / 3600) === 1 ? t("time_unit.hour") : t("time_unit.hours")}`}

                            {/* {cost} {cost > 1 ? t("hours") : t("hour")} */}
                          </td>

                          <td>{item?.meeting_count}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-secondary"
                              type="button"
                              data-bs-toggle="dropdown"
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
                              <BiDotsVerticalRounded
                                color="black"
                                size={"25px"}
                              />
                            </button>
                            <ul
                              className={`dropdown-menu ${
                                openDropdownId === item.id ? "show" : ""
                              }`}
                            >
                              <li>
                                <a
                                  className="dropdown-item"
                                  style={{ cursor: "pointer" }}
                                  // onClick={(e) => {
                                  //   updateParticipant(item);
                                  // }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateParticipant(item);
                                  }}
                                >
                                  {/* {item?.user_id !== null &&
                              item?.user_id !== userId ? (
                                <>
                                  <AiOutlineEye
                                    size={"20px"}
                                    // onClick={(e) => {
                                    //   e.stopPropagation();
                                    //   handleShowProfileLink(item?.uuid);
                                    // }}
                                  />{" "}
                                  &nbsp;
                                  {t("dropdown.Review the detail")}
                                </>
                              ) : ( */}
                                  <>
                                    <RiEditBoxLine size={"20px"} /> &nbsp;
                                    {item?.user_id
                                      ? t("invities.modifytaxAvg")
                                      : t("dropdown.To modify")}
                                  </>
                                  {/* )} */}
                                </a>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* {show && ( */}
                <EditParticipantModal
                  show={show}
                  handleClose={handleClose}
                  participant={participant}
                  refreshedParticipants={refreshedParticipants}
                  refreshBudget={refreshBudget}
                />
                {/* )} */}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Participants;
