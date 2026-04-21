import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import ScheduledMeeting from "../Meeting/ScheduledMeeting";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import DraftMeetings from "../Meeting/DraftMeetings";
import CompletedMeetings from "../Meeting/CompletedMeetings";
import moment from "moment";
import { useTabs } from "../../../context/TabContext";
import SignIn from "../AuthModal/SignIn";
import SignUp from "../AuthModal/SignUp";
import ForgotPassword from "../AuthModal/ForgotPassword";
import NewSolutionModal from "../Solution/Createnewsolution/NewSolutionModal";
import { useSolutions } from "../../../context/SolutionsContext";
import { useSolutionFormContext } from "../../../context/CreateSolutionContext";
import DraftSolutions from "./GetSolution/DraftSolutions";
import ActiveSolutions from "./GetSolution/ActiveSolutions";
import PublicSolutions from "./GetSolution/PublicSolutions";

function SolutionTabs() {
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext();
  const { resetHeaderTitle } = useHeaderTitle();
  const { open, handleShow, handleCloseModal, setSolution } =
    useSolutionFormContext();
  const location = useLocation();
  const [t] = useTranslation("global");

  const USER_ENTERPRISE_NAME =
    JSON.parse(CookieService.get("user")) || "Your Enterprise";

  const queryParams = new URLSearchParams(location.search);
  const fromPresentation2 = queryParams.get("from") === "presentation";
  const fromPresentation3 = queryParams.get("from") === "completeedit";

  const lastUrl = CookieService.get("lastURL");
  const {
    publicSolutions,
    privateSolutions,
    draftSolutions,
    getDraftSolutions,
    getPublicSolutions,
    getPrivateSolutions,
  } = useSolutions();

  useEffect(() => {
    getPrivateSolutions();
    getDraftSolutions();
    getPublicSolutions();
  }, []);

  // Count solutions for each tab
  const draftSolutionsCount = draftSolutions?.filter(
    (solution) => solution.status === "draft"
  ).length;

  const privateSolutionsCount = privateSolutions?.filter(
    (solution) =>
      solution.status === "active" && (solution?.solution_privacy === "private" || solution?.solution_privacy === "enterprise" || solution?.solution_privacy === "team" || solution?.solution_privacy === "participant only")
  ).length;

  const publicSolutionsCount = publicSolutions?.filter(
    (solution) =>
      solution.solution_privacy === "public" ||
      solution?.solution_privacy === "tektime members"
  ).length;

  // Solution types for private and public tabs
  const privateSolutionTypes = [
    ...new Set(
      privateSolutions?.map((solution) => solution.type).filter((type) => type)
    ),
  ];
  const publicSolutionTypes = [
    ...new Set(
      publicSolutions?.map((solution) => solution.type).filter((type) => type)
    ),
  ];

  // Count solutions for each type
  const privateTypeCounts = privateSolutionTypes.reduce((acc, type) => {
    acc[type] = privateSolutions?.filter(
      (solution) =>
        solution.type === type &&
        solution.status === "active" &&
        (solution?.solution_privacy === "private" || solution?.solution_privacy === "enterprise" || solution?.solution_privacy === "team" || solution?.solution_privacy === "participant only")
    ).length;
    return acc;
  }, {});

  const publicTypeCounts = publicSolutionTypes.reduce((acc, type) => {
    acc[type] = publicSolutions?.filter(
      (solution) =>
        solution.type === type &&
        (solution.solution_privacy === "public" ||
          solution?.solution_privacy === "tektime members")
    ).length;
    return acc;
  }, {});

  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const { activeTab, setActiveTab } = useTabs();
  const [activeSubTab, setActiveSubTab] = useState("");

  // const handleScroll = () => {
  //   if (tabsRef.current) {
  //     setIsSticky(window.scrollY > 150);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredSolutions, setFilteredSolutions] = useState(privateSolutions);
  const [draftSolutionsList, setDraftSolutions] = useState(draftSolutions);
  const [publicSolutionsList, setPublicSolutions] = useState(publicSolutions);

  const [isInviteSelected, setIsInviteSelected] = useState(false);
  const [isMySolutionsSelected, setIsMySolutionsSelected] = useState(false);
  const [isAllSolutionsSelected, setIsAllSolutionsSelected] = useState(false);

  const dropdownRef = useRef(null);
  const userId = parseInt(CookieService.get("user_id"));

  useEffect(() => {
    setIsMySolutionsSelected(true);
    const now = moment();
    let filtered = [...privateSolutions];

    if (selectedFilter === "thisMonth") {
      filtered = filtered.filter((solution) =>
        moment(solution.date).isSame(now, "month")
      );
    } else if (selectedFilter === "previousMonth") {
      const previousMonth = moment().subtract(1, "month");
      filtered = filtered.filter((solution) =>
        moment(solution.date).isSame(previousMonth, "month")
      );
    } else if (selectedFilter === "previousYear") {
      const previousYear = moment().subtract(1, "year");
      filtered = filtered.filter((solution) =>
        moment(solution.date).isSame(previousYear, "year")
      );
    }

    filtered = filtered.filter(
      (solution) =>
        solution.status == "active" && (solution?.solution_privacy === "private" || solution?.solution_privacy === "enterprise" || solution?.solution_privacy === "team" || solution?.solution_privacy === "participant only")
    );

    let draftSolutions1 = draftSolutions?.filter(
      (solution) => solution.status === "draft"
    );
    let publicSolutions1 = publicSolutions?.filter(
      (solution) =>
        solution.solution_privacy === "public" ||
        solution?.solution_privacy === "tektime members"
    );

    if (searchTerm) {
      filtered = filtered.filter((solution) =>
        solution.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      draftSolutions1 = draftSolutions?.filter(
        (solution) =>
          solution?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solution?.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      publicSolutions1 = publicSolutions1?.filter(
        (solution) =>
          solution?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          solution?.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDraftSolutions(draftSolutions1);
    setFilteredSolutions(filtered);
    setPublicSolutions(publicSolutions1);
  }, [
    selectedFilter,
    privateSolutions,
    publicSolutions,
    draftSolutions,
    userId,
    searchTerm,
  ]);

  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleShowSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleShowSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleShowForgot = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgot(true);
  };

  const handleCloseSignIn = () => setShowSignIn(false);
  const handleCloseSignUp = () => setShowSignUp(false);
  const handleCloseForgot = () => setShowForgot(false);

  // Filter solutions by type for display
  const getFilteredSolutionsByType = (type, privacy) => {
    if (privacy === "private") {
      return filteredSolutions?.filter(
        (solution) =>
          solution.type === type &&
          solution.status === "active" &&
          (solution?.solution_privacy === "private" || solution?.solution_privacy === "enterprise" || solution?.solution_privacy === "team" || solution?.solution_privacy === "participant only")
      );
    }
    return publicSolutionsList?.filter(
      (solution) =>
        solution.type === type &&
        (solution.solution_privacy === "public" ||
          solution?.solution_privacy === "tektime members")
    );
  };

  return (
    <>
      <div className="tabs-container container-fluid solution">
        <div
          ref={tabsRef}
          className={`tabs-header ${isSticky ? "sticky" : ""}`}
        >
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="meeting-title">{t("solution.title")}</h4>
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
            {t("solution.description")}
          </small>

          <div className={`container-fluid ${isSticky ? "" : "py-1 px-3"}`}>
            <div
              className="row align-items-center gutter-0"
              style={{ padding: "0 10px" }}
            >
              {/* Main Tabs Section */}
              <div
                className="col-lg-11 col-md-10 col-12 border-bottom tabs-meeting"
                style={{ borderBottom: "2px solid #F2F2F2" }}
              >
                <div className="tabs">
                  <div className="d-flex">
                    <button
                      className={`tab ${activeTab === "tab1" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("tab1");
                        setActiveSubTab("");
                      }}
                    >
                      {t("solution.draftTab")}
                      <span
                        className={activeTab === "tab1" ? "future" : "draft"}
                      >
                        {draftSolutionsCount || 0}
                      </span>
                    </button>
                    <button
                      className={`tab ${activeTab === "tab2" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("tab2");
                        setActiveSubTab(privateSolutionTypes[0] || "");
                      }}
                    >
                      {t("Mes solutions au sein de")}{" "}
                      {USER_ENTERPRISE_NAME?.enterprise?.name}
                      <span
                        className={activeTab === "tab2" ? "future" : "draft"}
                      >
                        {privateSolutionsCount || 0}
                      </span>
                    </button>
                    <button
                      className={`tab ${activeTab === "tab3" ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab("tab3");
                        setActiveSubTab(publicSolutionTypes[0] || "");
                      }}
                    >
                      {t("Solutions publiques")}
                      <span
                        className={activeTab === "tab3" ? "future" : "draft"}
                      >
                        {publicSolutionsCount || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Button Section */}
              <div
                className={`col-lg-1 col-md-2 col-12 d-flex ${isSticky ? "sticky-button" : "justify-content-end p-0"
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
                  &nbsp;{t("solution.buttons.create")}
                </button>
              </div>
            </div>

            {/* Second Level Tabs (Solution Types) */}
            {activeTab === "tab2" &&
              privateSolutionsCount > 0 &&
              privateSolutionTypes.length > 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="tabs">
                      <div className="d-flex">
                        {privateSolutionTypes.map(
                          (type) =>
                            privateTypeCounts[type] > 0 && (
                              <button
                                key={type}
                                className={`tab ${activeSubTab === type ? "active" : ""
                                  }`}
                                onClick={() => setActiveSubTab(type)}
                              >
                                {t(`types.${type}`)}

                                <span
                                  className={
                                    activeSubTab === type ? "future" : "draft"
                                  }
                                >
                                  {privateTypeCounts[type]}
                                </span>
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {activeTab === "tab3" &&
              publicSolutionsCount > 0 &&
              publicSolutionTypes.length > 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="tabs">
                      <div className="d-flex">
                        {publicSolutionTypes.map(
                          (type) =>
                            publicTypeCounts[type] > 0 && (
                              <button
                                key={type}
                                className={`tab ${activeSubTab === type ? "active" : ""
                                  }`}
                                onClick={() => setActiveSubTab(type)}
                              >
                                {t(`types.${type}`)}

                                <span
                                  className={
                                    activeSubTab === type ? "future" : "draft"
                                  }
                                >
                                  {publicTypeCounts[type]}
                                </span>
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Auth Modals */}
          <SignIn
            show={showSignIn}
            handleClose={handleCloseSignIn}
            handleShowSignUp={handleShowSignUp}
            handleShowForgot={handleShowForgot}
          />
          <SignUp
            show={showSignUp}
            handleClose={handleCloseSignUp}
            handleShowSignIn={handleShowSignIn}
          />
          <ForgotPassword
            show={showForgot}
            handleClose={handleCloseForgot}
            handleShowForgot={handleShowForgot}
          />
        </div>

        <div className="content solution">
          {activeTab === "tab1" && (
            <DraftSolutions allMeetings={draftSolutionsList} />
          )}
          {activeTab === "tab2" && (
            <ActiveSolutions
              allMeetings={
                activeSubTab && privateSolutionTypes.includes(activeSubTab)
                  ? getFilteredSolutionsByType(activeSubTab, "private")
                  : filteredSolutions
              }
            />
          )}
          {activeTab === "tab3" && (
            <PublicSolutions
              allMeetings={
                activeSubTab && publicSolutionTypes.includes(activeSubTab)
                  ? getFilteredSolutionsByType(activeSubTab, "public")
                  : publicSolutionsList
              }
            />
          )}
        </div>

        {open && <NewSolutionModal open={open} closeModal={handleCloseModal} />}
      </div>
    </>
  );
}

export default SolutionTabs;
