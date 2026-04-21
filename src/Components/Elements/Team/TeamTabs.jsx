import CookieService from '../../Utils/CookieService';
// import React, { useState } from "react";
import React, { useState, useRef, useEffect } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import CreateTeam from "./CreateTeam";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import Members from "./Members";
import Clienttab from "./Clienttab";
// import { useTranslation } from "react-i18next";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { toast } from "react-toastify";
import CreateClient from "./CreateClient";
// import TeamSubTabs from "./TeamSubTabs";
import OurTeamsSubTabs from "./OurTeamsSubTabs";
import TeamCard from "./TeamCard";
import Contact from "./Contact";
import ClientCastingModal from "./ClientCastingModal";
import EnterpriseCard from "./EnterpriseCard";
import EnterpriseDashboardTabs from "../LinkPages/EnterpriseDashboardTabs";
import EnterpriseGroups from "../LinkPages/EnterpriseGroups";

function TeamTabs({
  getTeams,
  getClosedTeams,
  closedTeams,
  teamLoading,
  closedLoading,
  activeTeams,
  members,
  memberLoading,
  getMembers,
  getEnterpriseClient,
  enterpriseId,
  enterprise,
  getClients,
  clientLoading,
  clients,
  getContacts,
  contactLoading,
  contacts,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportClientModal, setShowImportClientModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  const { resetHeaderTitle } = useHeaderTitle();
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);

  const [activeTab, setActiveTab] = useState("tab5");
  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
    CookieService.set("activeTab", eventKey);
  };

  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const handleClick = () => {
    setShowCreateTeam(true);
  };

  // In your component, add state for the modal
  const [showLicenseLimitModal, setShowLicenseLimitModal] = useState(false);

  const handleUserClick = () => {
    // Check license limit
    if (enterprise.used_license >= enterprise.contract?.no_of_licenses) {
      setShowLicenseLimitModal(true);
      return;
    }

    setShowCreateTeam(false);
    CookieService.set("activeTab", "tab5");
    navigate(`/user/create`);
  };

  //Active Teams
  // const [team, setTeam] = useState([]);
  // const [loading, setLoading] = useState(false);

  // const getData = async () => {
  //   const token = CookieService.get("token");
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/teams`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log("response", response);
  //     if (response.status) {
  //       // If user is admin, no need to filter teams.
  //       if (getUserRoleID() === 1) {
  //         setTeam(response.data?.data);
  //         setLoading(true);
  //       } else if (getUserRoleID() == 2) {
  //         sessionStorage.setItem(
  //           "enterprise",
  //           JSON.stringify(response.data?.enterprise)
  //         );
  //         setLoading(true);

  //         //Filter Teams based on user id: show only teams created by logged in user.
  //         const filterredTeams = response?.data?.data?.filter(
  //           (team) =>
  //             team.created_by.id.toString() ===
  //             CookieService.get("user_id").toString()
  //         );
  //         setTeam(filterredTeams);
  //         setLoading(true);
  //       } else if (getUserRoleID() == 3) {
  //         sessionStorage.setItem(
  //           "enterprise",
  //           JSON.stringify(response.data.enterprise)
  //         );
  //         //Filter Teams based on user id: show only teams created by logged in user.
  //         const filterredTeams = response.data?.data?.filter((team) => {
  //           return (
  //             team?.enterprise?.id ==
  //             JSON.parse(CookieService.get("enterprise"))?.id
  //           );
  //         });
  //         setTeam(filterredTeams);
  //         setLoading(true);
  //       } else {
  //         sessionStorage.setItem(
  //           "enterprise",
  //           JSON.stringify(response.data?.enterprise)
  //         );
  //         //Filter Teams based on user id: show only teams created by logged in user.
  //         const filterredTeams = response.data.data.filter((team) => {
  //           return team.created_by == CookieService.get("user_id");
  //         });
  //         setTeam(filterredTeams);
  //         setLoading(true);
  //       } //
  //     }
  //   } catch (error) {
  //     toast.error(t(error.response?.data?.errors[0] || error.message));
  //     // console.log("error message", error);
  //   }
  // };
  useEffect(() => {
    getTeams();
  }, []);

  //Closed Teams
  // const [closedTeams, setClosedTeams] = useState([]);
  // const [closedLoading, setClosedLoading] = useState(false);

  // const getClosedTeam = async () => {
  //   const token = CookieService.get("token");
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/closed/teams`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     if (response.status) {
  //       setClosedLoading(true);

  //       // If user is admin, no need to filter teams.
  //       if (getUserRoleID() == 1) {
  //         // No need to filter teams for admin user.
  //         // const filterredTeams = response?.data?.data?.filter(
  //         //   (team) =>
  //         //     team.created_by.id.toString() ===
  //         //     CookieService.get("user_id").toString()
  //         // );
  //         // setTeams(filterredTeams);\
  //         setClosedTeams(response.data.data);
  //         setClosedLoading(true);
  //       } else {
  //         //Filter Teams based on user id: show only teams created by logged in user.
  //         const filterredTeams = response.data.data.filter((team) => {
  //           return team?.created_by?.id == CookieService.get("user_id");
  //         });
  //         setClosedTeams(filterredTeams);
  //         setClosedLoading(true);
  //       } //
  //       // setTeams(response.data.data);
  //     }
  //   } catch (error) {
  //     toast.error(t(error.response?.data?.errors[0] || error.message));
  //     // console.log("error message", error);
  //   }
  // };
  useEffect(() => {
    getClosedTeams();
  }, []);

  // 3rd Tab (users of enterprise)
  // const [enterpriseUsers, setEnterpriseUsers] = useState([]);
  // const [enterprise, setEnterprise] = useState(null);
  // const [enterpriseLoading, setEnterpriseLoading] = useState(false);

  // Get the user and enterpriseId from sessionStorage
  // const user = JSON.parse(CookieService.get("user") || "{}");
  // const enterpriseId = user?.enterprise?.id; // safely access enterprise ID
  // const getEnterpriseUsers = async () => {
  //   if (!enterpriseId) return; // prevent API call if enterpriseId is not available

  //   const token = CookieService.get("token");
  //   try {
  //     setEnterpriseLoading(true);
  //     const response = await axios.get(
  //       `${API_BASE_URL}/enterprise-users/${enterpriseId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     if (response.status === 200) {
  //       const data = response?.data?.data;
  //       console.log('data',data)
  //       setEnterprise(data)
  //       setEnterpriseUsers(data?.users);
  //     }
  //   } catch (error) {
  //     toast.error(t(error?.response?.data?.errors[0] || error?.message));
  //     // console.log("error message", error);
  //   } finally {
  //     setEnterpriseLoading(false);
  //   }
  // };

  useEffect(() => {
    getMembers();
    getEnterpriseClient();
  }, [enterpriseId]);

  useEffect(() => {
    getClients();
  }, []);
  useEffect(() => {
    getContacts();
  }, []);
  useEffect(() => {
    const savedTab = CookieService.get("activeTab") || "tab5";
    if (savedTab === "tab3") {
      setActiveTab("tab6"); // Redirect from removed tab to Groups
    } else if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const [showContactModal, setShowContactModal] = useState(false);

  // If user clicked "Create a Team", only show CreateTeam component
  if (showCreateTeam) {
    return (
      <div className="tektimetabs">
        <CreateTeam
          eventKey="Nouvelle équipe"
          setActiveTab={handleTabChange}
          setShowCreateTeam={setShowCreateTeam}
          getTeams={getTeams}

        />
      </div>
    );
  }

  const user = JSON.parse(
    CookieService.get("user")|| "{}"
  );

  // -----------------------CLIENT--------------

  return (
    // <div className="tektimetabs">
    //   <div classname="mt-4 border mx-3">
    //     <div className="container-fluid">
    //       <h4 style={{ padding: "0 14px" }} className="my-2">
    //         Casting
    //       </h4>
    //       <p style={{ padding: "0 14px" }}>{t("casting.subheading")}.</p>
    //       <div className="row align-items-center justify-content-between tab-row">
    //         <div className="col-md-7 mt-3 mt-md-2">
    //           <ul
    //             className="nav nav-pills border-bottom"
    //             id="pills-tab"
    //             role="tablist"
    //           >
    //             <li className="nav-item" role="presentation">
    //               <button
    //                 className="nav-link p-0 rounded-0"
    //                 id="pills-archive-tab"
    //                 data-bs-toggle="pill"
    //                 data-bs-target="#pills-archive"
    //                 type="button"
    //                 role="tab"
    //                 aria-controls="pills-archive"
    //                 aria-selected="true"
    //               >
    //                 {t("team.ourteams")}{" "}
    //                 <span class="count">{closedTeams?.length}</span>
    //               </button>
    //             </li>
    //             {/* <li className="nav-item" role="presentation">
    //               <button
    //                 className="nav-link p-0 rounded-0"
    //                 id="pills-archive-tab"
    //                 data-bs-toggle="pill"
    //                 data-bs-target="#pills-archive"
    //                 type="button"
    //                 role="tab"
    //                 aria-controls="pills-archive"
    //                 aria-selected="true"
    //               >
    //                 {t("teamTabs.close")}{" "}
    //                 <span class="count">{closedTeams?.length}</span>
    //               </button>
    //             </li> */}
    //             {/* <li className="nav-item" role="presentation">
    //               <button
    //                 className="nav-link  active p-0 rounded-0"
    //                 id="pills-active-tab"
    //                 data-bs-toggle="pill"
    //                 data-bs-target="#pills-active"
    //                 type="button"
    //                 role="tab"
    //                 aria-controls="pills-active"
    //                 aria-selected="true"
    //               >
    //                 {t("team.members")}{" "}
    //                 <span class="count">{team?.length}</span>
    //               </button>
    //             </li> */}
    //             <li className="nav-item" role="presentation">
    //               <button
    //                 className="nav-link p-0 rounded-0"
    //                 id="pills-members-tab"
    //                 data-bs-toggle="pill"
    //                 data-bs-target="#pills-members"
    //                 type="button"
    //                 role="tab"
    //                 aria-controls="pills-members"
    //                 aria-selected="true"
    //               >
    //                 {t("team.membersof")} <span class="count">{enterpriseUsers?.length}</span>
    //               </button>
    //             </li>
    //             <li className="nav-item" role="presentation">
    //               <button
    //                 className="nav-link p-0 rounded-0"
    //                 id="pills-client-tab"
    //                 data-bs-toggle="pill"
    //                 data-bs-target="#pills-client"
    //                 type="button"
    //                 role="tab"
    //                 aria-controls="pills-client"
    //                 aria-selected="true"
    //               >
    //                 {t("team.clientsof")} <span class="count">{clients?.length}</span>
    //               </button>
    //             </li>
    //           </ul>
    //         </div>
    //         <div className="col-md-5 mt-3 mt-md-2">
    //           <div className="d-flex gap-2 align-items-center justify-content-md-end flex-wrap">
    //             <button
    //               className="btn moment-btn d-flex"
    //               onClick={() => setShowModal(true)}
    //             >
    //               <span>
    //                 <svg
    //                   width={16}
    //                   height={16}
    //                   viewBox="0 0 16 16"
    //                   fill="none"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                 >
    //                   <path
    //                     d="M8 14.75V1.25M1.25 8H14.75"
    //                     stroke="white"
    //                     strokeWidth="1.5"
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                   />
    //                 </svg>
    //               </span>
    //               &nbsp; {t("Team.Create a Client")}
    //             </button>
    //             <button className="btn moment-btn d-flex" onClick={handleClick}>
    //               <span>
    //                 <svg
    //                   width={16}
    //                   height={16}
    //                   viewBox="0 0 16 16"
    //                   fill="none"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                 >
    //                   <path
    //                     d="M8 14.75V1.25M1.25 8H14.75"
    //                     stroke="white"
    //                     strokeWidth="1.5"
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                   />
    //                 </svg>
    //               </span>
    //               &nbsp; {t("Team.Create a Team")}
    //             </button>

    //             <button
    //               className="btn moment-btn d-flex"
    //               onClick={handleUserClick}
    //             >
    //               <span>
    //                 <svg
    //                   width={16}
    //                   height={16}
    //                   viewBox="0 0 16 16"
    //                   fill="none"
    //                   xmlns="http://www.w3.org/2000/svg"
    //                 >
    //                   <path
    //                     d="M8 14.75V1.25M1.25 8H14.75"
    //                     stroke="white"
    //                     strokeWidth="1.5"
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                   />
    //                 </svg>
    //               </span>
    //               &nbsp; {t("Team.Add a User")}
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="tab-content mt-3" id="pills-tabContent">
    //         <div
    //           className="tab-pane fade"
    //           id="pills-archive"
    //           role="tabpanel"
    //           aria-labelledby="pills-archive-tab"
    //           tabIndex={0}
    //         >
    //           {/* <ClosedTeam
    //             eventKey="Equipes archivées"
    //             setActiveTab={handleTabChange}
    //             closedLoading={closedLoading}
    //             closedTeams={closedTeams}
    //             getClosedTeam={getClosedTeam}
    //           /> */}
    //           <TeamSubTabs/>
    //         </div>
    //         <div
    //           className="tab-pane fade show active"
    //           id="pills-active"
    //           role="tabpanel"
    //           aria-labelledby="pills-active-tab"
    //           tabIndex={0}
    //         >
    //           <ActiveTeam
    //             eventKey="Equipes actives"
    //             setActiveTab={handleTabChange}
    //             loading={loading}
    //             team={team}
    //             getData={getData}
    //           />
    //         </div>
    //         <div
    //           className="tab-pane fade"
    //           id="pills-members"
    //           role="tabpanel"
    //           aria-labelledby="pills-members-tab"
    //           tabIndex={0}
    //         >
    //           <Members
    //           setActiveTab={handleTabChange}
    //           enterpriseLoading={enterpriseLoading}
    //           enterpriseUsers={enterpriseUsers}
    //           enterprise={enterprise}
    //           getEnterpriseUsers={getEnterpriseUsers}
    //           />
    //         </div>
    //         <div
    //           className="tab-pane fade"
    //           id="pills-client"
    //           role="tabpanel"
    //           aria-labelledby="pills-client-tab"
    //           tabIndex={0}
    //         >
    //           <Clienttab
    //            setActiveTab={handleTabChange}
    //            clientLoading={clientLoading}
    //            clients={clients}
    //            enterprise={enterprise}
    //            getClients={getClients}
    //           />
    //         </div>
    //         {/* <div className="tab-pane fade" id="pills-NewTeam" role="tabpanel" aria-labelledby="pills-NewTeam-tab" tabIndex={0}>
    //             <CreateTeam
    //               eventKey="Nouvelle équipe"
    //               setActiveTab={handleTabChange}
    //             />
    //           </div> */}
    //       </div>
    //     </div>
    //   </div>
    //   {showModal && (
    //     <CreateClient show={showModal} close={handleClose} getClients={getClients}/>
    //   )}
    // </div>
    <div className="tabs-container container-fluid">
      <div ref={tabsRef} className={`tabs-header ${isSticky ? "sticky" : ""}`}>
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="">{t("Casting")}</h4>

          <button
            className={`btn moment-btn`}
            onClick={() => {
              window.open(
                "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482 ",
                "_blank"
              );
            }}
          >
            {t("request a demo")}
          </button>
        </div>
        <small style={{ padding: "15px 14px" }}>
          {t("casting.subheading")}
        </small>

        <div className={`container-fluid ${isSticky ? "" : "py-1 px-3"}`}>
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
                    className={`tab ${activeTab === "tab5" ? "active" : ""}`}
                    onClick={() => handleTabChange("tab5")}
                  >
                    {user?.enterprise?.name || ""}
                  </button>

                  <button
                    className={`tab ${activeTab === "tab6" ? "active" : ""}`}
                    onClick={() => handleTabChange("tab6")}
                  >
                    {t("invities.groupe")}
                  </button>
                  <button
                    className={`tab ${activeTab === "tab4" ? "active" : ""}`}
                    onClick={() => handleTabChange("tab4")}
                  >
                    {t("team.contacts")}
                    <span className={activeTab === "tab4" ? "future" : "draft"}>
                      {contacts?.length || 0}
                    </span>
                  </button>

                </div>
              </div>
            </div>

            <div
              className={`col-lg-1 col-md-2 col d-flex justify-content-end p-0 ${isSticky ? "sticky-button" : ""
                }`}
            >
              {activeTab === "tab1" ? (
                <button
                  className={`btn moment-btn`}
                  style={{ whiteSpace: "nowrap" }}
                  // style={{ padding: isSticky ? "11px 28px 11px 23px" : ' 0px 25px 0px 20px' }}
                  onClick={handleClick}
                >
                  <span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 14.75V1.25M1.25 8H14.75"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>{" "}
                  &nbsp;{t("Team.Create a Team")}
                </button>
              ) : activeTab === "tab2" ? (
                <button
                  className={`btn moment-btn`}
                  style={{ whiteSpace: "nowrap" }}
                  onClick={handleUserClick}
                >
                  <span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 14.75V1.25M1.25 8H14.75"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>{" "}
                  &nbsp;{t("Team.Add a User")}
                </button>
              ) : activeTab === "tab3" || activeTab === "tab6" ? (
                <>
                  <button
                    className={`btn moment-btn me-2`}
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => setShowImportClientModal(true)}
                  >
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 14.75V1.25M1.25 8H14.75"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>{" "}
                    &nbsp;{t("Import Client")}
                  </button>
                  <button
                    className={`btn moment-btn`}
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => setShowClientModal(true)}
                  >
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 14.75V1.25M1.25 8H14.75"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>{" "}
                    &nbsp;{t("Team.Create a Client Account")}
                  </button>
                </>

              ) : activeTab === "tab4" ? (
                <>
                  <button
                    className={`btn moment-btn me-2`}
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => setShowImportModal(true)}
                  >
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 14.75V1.25M1.25 8H14.75"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>{" "}
                    &nbsp;{t("Import Contact")}
                  </button>
                  <button
                    className={`btn moment-btn`}
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => setShowContactModal(true)}
                  >
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 14.75V1.25M1.25 8H14.75"
                          stroke="white"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>{" "}
                    &nbsp;{t("Team.Add Contact")}
                  </button>
                </>
              ) : null}
            </div>
            {/* Button Section */}
            {/* <div
                className={`col-lg-1 col-md-2 col-12 d-flex  ${
                  isSticky ? "sticky-button" : "justify-content-end p-0"
                }`}
              >
                <button
                  className={`btn moment-btn d-flex`}
                  onClick={handleShow}
                >
                  <span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 14.75V1.25M1.25 8H14.75"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  &nbsp;{t("meeting.buttons.create")}
                </button>
              </div> */}
          </div>
        </div>
      </div>
      <div className="content">
        {activeTab === "tab1" && (
          <div>
            <OurTeamsSubTabs
              activeTeams={activeTeams}
              closedTeams={closedTeams}
              loading={teamLoading}
              closedLoading={closedLoading}
              getTeams={getTeams}
              getClosedTeams={getClosedTeams}
            />
          </div>
        )}
        {activeTab === "tab2" && (
          <div>
            <TeamCard
              teams={members}
              loading={memberLoading}
              isMemberView={true}
              isTeamMemberView={false}
              isEnterpriseView={false}
              isCastingView={false}
              isTeamView={false}
              isClientView={false}
              isContactView={false}
              refresh={getMembers}
              enterprise={enterprise}
            />
          </div>
        )}

        {activeTab === "tab4" && (
          <div>
            <Contact
              contacts={contacts}
              loading={contactLoading}
              getContacts={getContacts}
              setShowContactModal={setShowContactModal}
              showContactModal={showContactModal}
              setShowImportModal={setShowImportModal}
              showImportModal={showImportModal}
              getTeams={getTeams}
              clientId={null}
            />
          </div>
        )}
        {activeTab === "tab6" && (
          <div>
            <EnterpriseGroups
              clients={clients}
              clientLoading={clientLoading}
              getClients={getClients}
              enterprise={enterprise}
              show={showClientModal}
              setShow={setShowClientModal}
            />
          </div>
        )}
        {activeTab === "tab5" && (
          <div>
            <EnterpriseDashboardTabs
              enterprise={enterprise}
              activeTeams={activeTeams}
              closedTeams={closedTeams}
              teamLoading={teamLoading}
              closedLoading={closedLoading}
              getTeams={getTeams}
              getClosedTeams={getClosedTeams}
              members={members}
              memberLoading={memberLoading}
              getMembers={getMembers}
              getEnterpriseClient={getEnterpriseClient}
              onCreateTeam={handleClick}
              onAddUser={handleUserClick}
            />
          </div>
        )}
      </div>

      {/* // Add this modal component somewhere in your JSX */}
      {showLicenseLimitModal && (
        <Modal
          show={showLicenseLimitModal}
          onHide={() => setShowLicenseLimitModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("License Limit Reached")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {t(
                "You have reached the maximum number of licenses allowed by your contract."
              )}
            </p>
            <p>
              {t("Please contact your administrator to upgrade your plan.")}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => setShowLicenseLimitModal(false)}
            >
              {t("close")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default TeamTabs;
