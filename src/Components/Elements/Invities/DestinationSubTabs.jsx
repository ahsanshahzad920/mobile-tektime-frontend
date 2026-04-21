import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import axios from "axios";
import { Button } from "react-bootstrap";
import { Header } from "antd/es/layout/layout";
import { useMeetings } from "../../../context/MeetingsContext";
import moment from "moment";
import { useTabs } from "../../../context/TabContext";
import AddDestination from "./AddDestination";
import { useDestinationTabs } from "../../../context/DestinationTabContext";
import CurrentDestinations from "./CurrentDestinations";
import CompletedDestinations from "./CompletedDestinations";
import { useDestinations } from "../../../context/DestinationsContext";
import NewDestinations from "./NewDestinations";
import { useSteps } from "../../../context/Step";

function DestinationSubTabs() {
  const { searchTerm } = useOutletContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const { resetHeaderTitle } = useHeaderTitle();

  React.useEffect(() => {
    resetHeaderTitle();
  }, []);
  const [t] = useTranslation("global");

  const [tab, setTab] = useState("Current Destinations");

  const { getMeetingsCalculations } = useMeetings();
  const {
    updateSolutionSteps,
    setSolutionType,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionFeedback,
    setSolutionShareBy,
    updateSteps,
  } = useSteps();

  const {
    allDestinations,
    allCompletedDestinations,
    getDestinations,
    getAllCompletedDestinations,

    newDestinations,
    getNewDestinations,

    currentDestinations,
    getCurrentDestinations,
    closedDestinations,
    getClosedDestinations,

    newDestinationCount,
    currentDestinationCount,
    closedDestinationCount,
    setNewDestinationCount,
    setCurrentDestinationCount,
    setClosedDestinationCount,

    getUserMeetingCount,
  } = useDestinations();
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
  }, []);

  // useEffect(() => {
  //   // setTab("Current Destinations");
  //   const fetchDestinations = async () => {
  //     try {
  //       setTab("Current Destinations");

  //       // First API call
  //       await getDestinations();
  //     } catch (error) {
  //       console.error("Error fetching destinations:", error);
  //     }
  //   };

  //   fetchDestinations();
  // }, []);
  // Function to determine if all meetings for a destination are closed
  const isAllMeetingsClosed = (meetings) => {
    return meetings.every(
      (meeting) => meeting.status === "closed" || meeting.status === "abort"
    );
  };

  const isAllMeetingsClosedActive = (meetings) => {
    return meetings.every(
      (meeting) => meeting.status === "closed" || meeting?.status === "abort"
    );
  };

  // Filter out destinations where all meetings are closed
  const activeDestinations = allDestinations?.filter((destination) => {
    return (
      destination.meetings.length > 0 &&
      // destination?.total_meetings > 0 ||
      !isAllMeetingsClosedActive(destination.meetings)
    );
  });

  // Filter out destinations where all meetings are closed
  const completedDestinations = allDestinations?.filter(
    (destination) =>
      destination.meetings.length > 0 &&
      isAllMeetingsClosed(destination.meetings)
  );

  const activeDestinationWithZeroMeetings = allDestinations?.filter(
    (destination) => destination?.meetings?.length === 0
  );
  // const newDestinationCount = activeDestinationWithZeroMeetings?.length;
  // / Filter out destinations with only one meeting in draft status
  const filteredDestinations = activeDestinations.filter((item) => {
    const hasOnlyDraftMeeting =
      item?.meetings?.length === 1 && item?.meetings[0]?.status === "draft";
    return !hasOnlyDraftMeeting;
  });
  // const currentDestinationCount = filteredDestinations?.length;
  const completedDestinationCount = completedDestinations?.length;

  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

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
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredCurrentDestinations, setFilteredCurrentDestinations] =
    useState([]);
  const [filteredNewDestinations, setFilteredNewDestinations] = useState([]);
  const [filteredCompletedDestinations, setFilteredCompletedDestinations] =
    useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (tab === "New Destinations") {
        await getNewDestinations();
      } else if (tab === "Current Destinations") {
        await getCurrentDestinations();
      } else if (tab === "Completed Destinations") {
        await getClosedDestinations();
      }
    };
    getUserMeetingCount();
    fetchData();
  }, [tab]);

  // Then separate useEffects to update filtered lists based on latest data and search
  useEffect(() => {
    setFilteredNewDestinations(
      newDestinations.filter((d) =>
        d.destination_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [newDestinations, searchTerm]);

  useEffect(() => {
    setFilteredCurrentDestinations(
      currentDestinations.filter((d) =>
        d.destination_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [currentDestinations, searchTerm]);

  useEffect(() => {
    setFilteredCompletedDestinations(
      closedDestinations.filter((d) =>
        d.destination_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [closedDestinations, searchTerm]);

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


  return (
    <>
      <div className="destination-tabs-container container-fluid px-2">
        <div
          ref={tabsRef}
          className={`tabs-header ${isSticky ? "sticky" : ""}`}
        >
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
                      className={`tab ${tab === "New Destinations" ? "active" : ""
                        }`}
                      onClick={() => setTab("New Destinations")}
                    >
                      {t("destination.newDestinationTab")}
                      <span
                        className={
                          tab === "New Destinations" ? "future" : "draft"
                        }
                      >
                        {newDestinationCount}
                      </span>
                    </button>
                    <button
                      className={`tab ${tab === "Current Destinations" ? "active" : ""
                        }`}
                      onClick={() => setTab("Current Destinations")}
                    >
                      {t("destination.currentDestinationTab")}
                      <span
                        className={
                          tab === "Current Destinations" ? "future" : "draft"
                        }
                      >
                        {currentDestinationCount}
                      </span>
                    </button>
                    <button
                      className={`tab ${tab === "Completed Destinations" ? "active" : ""
                        }`}
                      onClick={() => setTab("Completed Destinations")}
                    >
                      {t("destination.completedDestinationTab")}
                      <span
                        className={
                          tab === "Completed Destinations" ? "future" : "draft"
                        }
                      >
                        {closedDestinationCount}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {open && (
            <AddDestination
              show={open}
              handleClose={handleClose}
              currentItem={null}
            />
          )}
        </div>


        <div className="content">
          {tab === "New Destinations" && (
            <div>
              {
                <NewDestinations
                  allCurrentDestinations={filteredNewDestinations}
                />
              }
            </div>
          )}
          {tab === "Current Destinations" && (
            <div>
              {
                <CurrentDestinations
                  allCurrentDestinations={filteredCurrentDestinations}
                />
              }
            </div>
          )}
          {tab === "Completed Destinations" && (
            <div>
              <CompletedDestinations
                allCurrentDestinations={filteredCompletedDestinations}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DestinationSubTabs;
