import CookieService from '../../Utils/CookieService';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import axios from "axios";
import { useMeetings } from "../../../context/MeetingsContext";
import moment from "moment";
import AddDestination from "./AddDestination";
import { useDestinationTabs } from "../../../context/DestinationTabContext";
import { useDestinations } from "../../../context/DestinationsContext";
import { useSteps } from "../../../context/Step";
import CreateClient from "../Team/CreateClient";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import Clienttab from "../Team/Clienttab";
import MissionRoadmap from "./MissionRoadmap";
import DestinationMap from "./DestinationMap";

function DestinationTabs() {
  const { searchTerm } = useOutletContext();
  const { resetHeaderTitle } = useHeaderTitle();

  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  const [t] = useTranslation("global");

  const { activeTab, setActiveTab } = useDestinationTabs();
  const { getMeetingsCalculations } = useMeetings();
  const {
    updateSolutionSteps,
    setSolutionType,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionFeedback,
    setSolutionShareBy,
    setSolutionMessageManagement,
    updateSteps,
  } = useSteps();

  const { getUserMeetingCount, userHaveMissions } = useDestinations();
  useEffect(() => {
    getMeetingsCalculations();
  }, []);

  useEffect(() => {
    updateSolutionSteps([]);
    setSolutionType(null);
    setSolutionAlarm(false);
    setSolutionNote("Manual");
    setSolutionFeedback(false);
    setSolutionShareBy(null);
    setSolutionMessageManagement(false)
  }, []);

  useEffect(() => {
    if (userHaveMissions > 0) {
      setActiveTab("Roadmap");
    } else {
      setActiveTab("My Clients");
    }
  }, [userHaveMissions]);

  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  // const [activeTab, setActiveTab] = useState("tab2");

  const handleScroll = () => {
    if (tabsRef.current) {
      setIsSticky(window.scrollY > 100);
    }
  };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  useEffect(() => {
    getUserMeetingCount();
  }, [activeTab]);

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  // useEffect(() => {
  //   const now = moment();
  //   let filtered = [...activeDestinations];

  //   let myClosedDestinations = [...completedDestinations];

  //   let myNewDestinations = [...activeDestinationWithZeroMeetings];
  //   if (searchTerm) {
  //     filtered = filtered.filter((destination) =>
  //       destination.destination_name
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     );
  //     myNewDestinations = myNewDestinations.filter((destination) =>
  //       destination.destination_name
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     );
  //     myClosedDestinations = myClosedDestinations.filter((destination) =>
  //       destination.destination_name
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     );
  //   }
  //   // setDraftMeetings(draftMeetings);
  //   setFilteredCurrentDestinations(filtered);
  //   setFilteredNewDestinations(myNewDestinations);
  //   setFilteredCompletedDestinations(myClosedDestinations);
  // }, [searchTerm, allDestinations, allCompletedDestinations]);

  const [showModal, setShowModal] = useState(false);
  const handleCloseClient = () => setShowModal(false);

  // 3rd Tab (users of enterprise)
  const [clients, setClients] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);

  const getClients = async () => {
    const token = CookieService.get("token");
    try {
      setClientLoading(true);
      const response = await axios.get(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const clients = response?.data?.data;
        setClients(clients);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setClientLoading(false);
    }
  };
  useEffect(() => {
    getClients();
  }, []);

  const DESTINATION_TYPES = [
    "Audit",
    "Study",
    "Other",
    "Accompagnement",
    "Business opportunity",
    "Project",
    "Event",
    "Objective",
    "Recruitment",
    "Formation",
    "Messagerie",
    "Agenda",
    "Assistant Conversation"
  ];

  const [tabsWithData, setTabsWithData] = useState(
    DESTINATION_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {})
  );

  const [progressByType, setProgressByType] = useState({});
  const [progressBarVisibleByType, setProgressBarVisibleByType] = useState({});

  const fetchDataForType = async (type) => {
    // Start progress bar at 0
    setProgressByType((prev) => ({ ...prev, [type]: 0 }));
    setProgressBarVisibleByType((prev) => ({ ...prev, [type]: true }));

    // Simulate progress increment
    const interval = setInterval(() => {
      setProgressByType((prev) => {
        const current = prev[type] || 0;
        if (current >= 90) {
          clearInterval(interval);
          return { ...prev, [type]: 90 };
        }
        return { ...prev, [type]: current + 10 };
      });
    }, 200);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/get-destination-by-type/${type}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      const {
        new_missions = [],
        current_missions = [],
        closed_missions = [],
        upcoming_missions = [],
      } = res.data?.data || {};

      const combinedMissions = [
        ...new_missions,
        ...current_missions,
        ...closed_missions,
        ...upcoming_missions,
      ];

      if (combinedMissions.length > 0) {
        setTabsWithData((prev) => ({
          ...prev,
          [type]: {
            new_missions,
            current_missions,
            closed_missions,
            upcoming_missions,
          },
        }));
      }

      setProgressByType((prev) => ({ ...prev, [type]: 100 }));
    } catch (err) {
      console.error(`Failed to load ${type}`, err);
      setProgressByType((prev) => ({ ...prev, [type]: 100 }));
    } finally {
      clearInterval(interval);
      setProgressBarVisibleByType((prev) => ({ ...prev, [type]: false }));
    }
  };
  useEffect(() => {
    DESTINATION_TYPES.forEach(fetchDataForType);
  }, []);

  const typeOrder = [
    "Business opportunity",
    "Study",
    "Audit",
    "Project",
    "Accompagnement",
    "Other",
    "Event",
    "Objective",
    "Recruitment",
    "Formation",
    "Messagerie",
    "Agenda",
    "Assistant Conversation"
  ];
  // -----------------------------------------MIssion ROADMAP FUnctions------------------
  // -----------------------------------------MIssion ROADMAP Functions------------------
  const [durationMonths, setDurationMonths] = useState(3); // New state for duration, default 3 months
  const [timeWindowOffset, setTimeWindowOffset] = useState(0);
  const [roadMapData, setRoadMapData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Memoize the date calculation
  const { startDate, endDate, formattedStartDate, formattedEndDate } = useMemo(() => {
    const start = moment().add(timeWindowOffset * durationMonths, 'months').startOf('month');
    const end = moment(start).add(durationMonths - 1, 'months').endOf('month');

    const format = (m) => m.format("DD-MM-YYYY");

    return {
      startDate: start.toDate(),
      endDate: end.toDate(),
      formattedStartDate: format(start),
      formattedEndDate: format(end),
    };
  }, [timeWindowOffset, durationMonths]); // Added durationMonths to dependencies

  // Reset offset quand on change de période
  // useEffect(() => {
  //   setTimeWindowOffset(0);
  // }, [durationMonths]);

  // Memoized API call function
  const fetchRoadmapData = useCallback(async () => {
    setProgress(0);
    setIsLoading(true);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    try {
      const response = await axios.get(`${API_BASE_URL}/destinations-roadmap`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
        params: {
          m_start_date: formattedStartDate,
          m_end_date: formattedEndDate,
        },
      });

      if (response.status) {
        setRoadMapData(response?.data?.data || []);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setIsLoading(false);
    }
  }, [formattedStartDate, formattedEndDate]);

  // Call API when dates change
  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const [filteredTabsWithData, setFilteredTabsWithData] = useState(
    DESTINATION_TYPES.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {})
  );

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTabsWithData(tabsWithData);
    } else {
      const filtered = {};
      Object.keys(tabsWithData).forEach(type => {
        filtered[type] = {
          new_missions: filterDestinations(tabsWithData[type]?.new_missions || []),
          current_missions: filterDestinations(tabsWithData[type]?.current_missions || []),
          closed_missions: filterDestinations(tabsWithData[type]?.closed_missions || []),
          upcoming_missions: filterDestinations(tabsWithData[type]?.upcoming_missions || [])
        };
      });
      setFilteredTabsWithData(filtered);
    }
  }, [searchTerm, tabsWithData]);

  const [filteredRoadMapData, setFilteredRoadMapData] = useState([]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredRoadMapData(roadMapData);
    } else {
      const filtered = roadMapData.map(client => ({
        ...client,
        destinations: client.destinations?.filter(destination =>
          destination.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          destination.type?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(client => client.destinations?.length > 0);
      setFilteredRoadMapData(filtered);
    }
  }, [searchTerm, roadMapData]);

  const filterClients = (clients) => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterDestinations = (destinations) => {
    if (!searchTerm) return destinations;
    return destinations.filter(destination =>
      destination.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  return (
    <>
      <div className="destination-tabs-container container-fluid px-2">
        <div
          ref={tabsRef}
          className={`tabs-header ${isSticky ? "sticky" : ""}`}
        >
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="meeting-title">{t("sidebar.guests")}</h4>


            <button
              className={`btn moment-btn`}
              onClick={() => {
                window.open('https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482 ', "_blank")
              }}
            >
              {t("request a demo")}
            </button>
          </div>
          <small style={{ padding: "15px 14px" }}>
            {t(
              "The destination is the end result you want your client to achieve."
            )}
          </small>
          <div className={`container-fluid ${isSticky ? "" : "py-1 px-3"}`}>
            <div
              className="row align-items-center gutter-0"
              style={{ padding: "0 10px" }}
            >
              <div
                className="col-lg-11 col-md-10 col-12 destination-tab-row tabs-destinations border-bottom tabs-meeting"
                style={{ borderBottom: "2px solid #F2F2F2" }}
              >
                <div className="tabs">
                  <div className="d-flex">
                    <button
                      className={`tab ${activeTab === "My Clients" ? "active" : ""
                        }`}
                      onClick={() => setActiveTab("My Clients")}
                    >
                      {t("destination.MyClients")}
                      <span
                        className={
                          activeTab === "My Clients" ? "future" : "draft"
                        }
                      >
                        {clients?.length}
                      </span>
                    </button>
                    <button
                      className={`tab ${activeTab === "Roadmap" ? "active" : ""
                        }`}
                      onClick={() => setActiveTab("Roadmap")}
                    >
                      {t("destination.Roadmap")}
                      <span
                        className={activeTab === "Roadmap" ? "future" : "draft"}
                      >
                        {/* {roadMapData?.length} */}
                        {roadMapData?.reduce(
                          (total, client) =>
                            total + (client.destinations?.length || 0),
                          0
                        )}
                      </span>
                    </button>
                    {/* Dynamically render buttons for only the types that have data */}
                    {typeOrder.map((type) => {
                      return filteredTabsWithData[type] &&
                        Object.values(filteredTabsWithData[type])?.some(
                          (arr) => Array.isArray(arr) && arr.length > 0
                        ) ? (
                        <button
                          key={type}
                          className={`tab ${activeTab === type ? "active" : ""}`}
                          onClick={() => setActiveTab(type)}
                        >
                          {t(`des_type.${type}`)}
                          <span className={activeTab === type ? "future" : "draft"}>
                            {Object.values(filteredTabsWithData[type]).reduce(
                              (acc, arr) => acc + arr.length,
                              0
                            )}
                          </span>
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
              <div
                className={`col-lg-1 col-md-2 col d-flex justify-content-end p-0 ${isSticky ? "sticky-button" : ""
                  }`}
              >
                {typeOrder.includes(activeTab) || activeTab === "Roadmap" ? (
                  <button
                    className={`btn moment-btn`}
                    style={{ whiteSpace: "nowrap" }}
                    // style={{ padding: isSticky ? "11px 28px 11px 23px" : ' 0px 25px 0px 20px' }}
                    onClick={() => {
                      updateSteps([]);
                      setOpen(true);
                    }}
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
                    &nbsp;{t("destination.createDestination")}
                  </button>
                ) : activeTab === "My Clients" ? (
                  <button
                    className={`btn moment-btn`}
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => setShowModal(true)}
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
                    &nbsp;{t("Team.Create a Client")}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {open && (
            <AddDestination
              show={open}
              handleClose={handleClose}
              currentItem={null}
              refreshedDestination={fetchDataForType}
            />
          )}
        </div>
        <div className="content">
          {activeTab === "Roadmap" && (
            <div>
              {
                <MissionRoadmap
                  isLoading={isLoading}
                  progress={progress}
                  data={filteredRoadMapData}
                  startDate={startDate}
                  endDate={endDate}
                  onPrevious={() => setTimeWindowOffset((prev) => prev - 1)}
                  onNext={() => setTimeWindowOffset((prev) => prev + 1)}
                  onReset={() => setTimeWindowOffset(0)}
                  durationMonths={durationMonths}
                  onDurationChange={(dur) => {
                    setDurationMonths(dur);
                    setTimeWindowOffset(0); // Reset offset when duration changes
                  }}
                />
              }
            </div>
          )}
          {activeTab === "My Clients" && (
            <div>
              {
                <Clienttab
                  // setActiveTab={handleTabChange}
                  clientLoading={clientLoading}
                  clients={filterClients(clients)}
                  // enterprise={enterprise}
                  getClients={getClients}
                />
              }
            </div>
          )}
          {(activeTab !== "My Clients" || activeTab !== "Roadmap") && (
            <>
              {typeOrder.map(
                (type) =>
                  activeTab === type &&
                  filteredTabsWithData[type] && (
                    <div key={type}>
                      <DestinationMap
                        type={type}
                        data={filteredTabsWithData[type]}
                        Progress={progressByType[type] || 0}
                        showProgressBar={progressBarVisibleByType[type] || false}
                      />
                    </div>
                  )
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <CreateClient
          show={showModal}
          close={handleCloseClient}
          getClients={getClients}
        />
      )}
    </>
  );
}

export default DestinationTabs;
