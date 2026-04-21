import CookieService from "../../Utils/CookieService";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import axios from "axios";
import { useMeetings } from "../../../context/MeetingsContext";
import { useTabs } from "../../../context/TabContext";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { useSteps } from "../../../context/Step";
import SignIn from "../AuthModal/SignIn";
import SignUp from "../AuthModal/SignUp";
import ForgotPassword from "../AuthModal/ForgotPassword";
import NewMeetingModal from "./CreateNewMeeting/NewMeetingModal";
import MeetingSubTab from "./MeetingSubTab";
import ReactBigCalendar from "./ReactBigCalendar";
import QuickMomentForm from "../Invities/DestinationToMeeting/QuickMomentForm";
import DraftMeetings from "./DraftMeetings";
// import OverlayTrigger from "react-bootstrap/OverlayTrigger";
// import Tooltip from "antd";
import { Dropdown, Modal, Container, Row, Col } from "react-bootstrap";
import { API_BASE_URL } from "../../Apicongfig";
import {
  Tooltip,
  Tabs,
  Button as AntButton,
  Badge,
  Space,
  Typography,
  Popover,
} from "antd";
import {
  PlayCircleOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { formatDate, formatTime } from "./GetMeeting/Helpers/functionHelper";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

function MeetingTabs() {
  const { searchTerm, setSearchTerm } = useOutletContext();
  const { resetHeaderTitle } = useHeaderTitle();
  const { t } = useTranslation("global");
  const { activeTab, setActiveTab } = useTabs();
  const { allDraftMeetings, agendaCount, getDraftMeetings, draftMeetingCount } =
    useMeetings();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { open, handleShow, handleCloseModal, setFormState } = useFormContext();
  const {
    updateSolutionSteps,
    setSolutionType,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionMessageManagement,
    setSolutionFeedback,
    setSolutionShareBy,
  } = useSteps();
  const navigate = useNavigate();
  const tabsRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showMomentForm, setShowMomentForm] = useState(false);
  const [showMobileButtons, setShowMobileButtons] = useState(false);
  const [isQuickLaunchLoading, setIsQuickLaunchLoading] = useState(false);

  const [meetingCounts, setMeetingCounts] = useState({});
  const [unreadMeetingCounts, setUnreadMeetingCounts] = useState({});

  // Fetch meeting counts by type (only this API for list tabs)
  const fetchMeetingCounts = useCallback(async () => {
    const token = CookieService.get("token");
    if (!token) return;
    try {
      const [response, unreadResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/get-meetings-count-with-types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API_BASE_URL}/get-unread-meetings-count-by-type`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (response?.status === 200) {
        setMeetingCounts(response.data.data || {});
      }

      if (unreadResponse?.status === 200) {
        setUnreadMeetingCounts(unreadResponse.data.data || {});
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error fetching meeting counts:", error);
      }
    }
  }, [setActiveTab]);

  const initialized = useRef(false);

  // Initialize state and fetch data on mount
  useEffect(() => {
    if (!initialized.current) {
      resetHeaderTitle();
      updateSolutionSteps([]);
      setSolutionType(null);
      setSolutionAlarm(false);
      setSolutionNote("Manual");
      setSolutionMessageManagement(false);
      setSolutionFeedback(false);
      setSolutionShareBy(null);

      // Fetch initial data only once
      fetchMeetingCounts();
      getDraftMeetings();

      // Ensure "Agenda" (tab1) is selected by default when landing on the meeting page
      setActiveTab("tab1");
      initialized.current = true;
    }
  }, [
    fetchMeetingCounts,
    getDraftMeetings,
    resetHeaderTitle,
    updateSolutionSteps,
    setSolutionType,
    setSolutionAlarm,
    setSolutionNote,
    setSolutionMessageManagement,
    setSolutionFeedback,
    setSolutionShareBy,
    setActiveTab,
  ]);

  const handleTabClick = useCallback(
    (tab, type) => {
      setActiveTab(type ? `type-${type}` : tab);
    },
    [setActiveTab],
  );

  // Derived draft meetings
  const draftMeetings = useMemo(() => {
    let filtered =
      allDraftMeetings?.filter((meeting) => meeting.status === "draft") || [];
    if (searchTerm) {
      filtered = filtered.filter(
        (meeting) =>
          meeting?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting?.objective?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return filtered;
  }, [allDraftMeetings, searchTerm]);

  // Modal handlers
  const handleShowSignIn = useCallback(() => {
    setShowSignUp(false);
    setShowSignIn(true);
  }, []);

  const handleShowSignUp = useCallback(() => {
    setShowSignIn(false);
    setShowSignUp(true);
  }, []);

  const handleShowForgot = useCallback(() => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgot(true);
  }, []);

  const handleCloseSignIn = useCallback(() => setShowSignIn(false), []);
  const handleCloseSignUp = useCallback(() => setShowSignUp(false), []);
  const handleCloseForgot = useCallback(() => setShowForgot(false), []);

  // Default form state
  const defaultFormState = useMemo(
    () => ({
      selectedOption: null,
      title: null,
      date: null,
      start_time: null,
      description: null,
      type: null,
      priority: null,
      alarm: false,
      feedback: false,
      remainder: false,
      autostart: false,
      playback: "Manual",
      prise_de_notes: "Manual",
      note_taker: false,
      objective: null,
      casting_type: "Invitation",
      participants: [],
      id: null,
      repetition: false,
      repetition_number: 1,
      repetition_frequency: "Daily",
      repetition_end_date: null,
      selected_days: [],
      teams: [],
      steps: [],
      moment_privacy: "participant only",
      moment_privacy_teams: [],
      moment_password: null,
      location: null,
      agenda: null,
      address: null,
      room_details: null,
      phone: null,
      share_by: null,
      price: null,
      max_participants_register: 0,
      casting_tab: null,
      solution_id: null,
      solution_tab: "use a template",
      client: null,
      client_id: null,
      destination: null,
      destination_id: null,
      destination_type: null,
    }),
    [],
  );

  // Add state for YouTube popup
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  // Function to handle opening the video popup
  const handleOpenVideoPopup = () => {
    setShowVideoPopup(true);
  };

  // Function to handle closing the video popup
  const handleCloseVideoPopup = () => {
    setShowVideoPopup(false);
  };

  const renderTabLabel = useCallback(
    (title, count, key) => {
      const isActive = activeTab === key;
      return (
        <Space
          size={4}
          className="d-flex align-items-center w-100 justify-content-between h-100"
        >
          <span>{title}</span>
          {count > 0 && (
            <Badge
              count={count}
              overflowCount={99}
              style={{
                backgroundColor: isActive ? "#fff" : "#3b82f6",
                color: isActive ? "#3b82f6" : "#fff",
                fontSize: "10px",
                height: "18px",
                minWidth: "18px",
                lineHeight: "18px",
              }}
            />
          )}
        </Space>
      );
    },
    [activeTab],
  );

  const tabItems = useMemo(() => {
    return [
      {
        key: "tab1",
        title: t("meeting.agenda.title"),
        count: 0,
      },
      {
        key: "tab3",
        title: t("meeting.draftTab"),
        count: draftMeetingCount,
      },
      ...Object.entries(meetingCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({
          key: `type-${type}`,
          title: t(`types.${type}`),
          count: unreadMeetingCounts[type],
        })),
    ].map((item) => ({
      ...item,
      label: renderTabLabel(item.title, item.count, item.key),
    }));
  }, [
    t,
    draftMeetingCount,
    meetingCounts,
    unreadMeetingCounts,
    renderTabLabel,
  ]);

  const handleAntTabChange = (key) => {
    setActiveTab(key);
  };

  const handleQuickLaunch = async () => {
    setIsQuickLaunchLoading(true);
    try {
      const userId = CookieService.get("user_id");
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options),
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);
      const response = await axios.get(
        `${API_BASE_URL}/quick-launch-meeting/${userId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        console.log(response);
        const meeting = response?.data?.meeting;
        navigate(`/destination/${meeting?.unique_id}/${meeting?.id}`);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message || "Meeting Launch Failed");
    } finally {
      setIsQuickLaunchLoading(false);
    }
  };

  return (
    <Container fluid className="p-0">
      <div
        ref={tabsRef}
        className={`bg-white p-2 p-md-3 rounded shadow-sm mb-2 mb-md-3 ${isSticky ? "sticky-top" : ""}`}
      >
        {/* Header Section */}
        <Row className="align-items-center mb-1 mb-md-2">
          <Col
            xs={12}
            className="d-flex align-items-center justify-content-between"
          >
            <Title
              level={4}
              className="mb-0 fw-bold header-title"
              style={{ fontSize: isMobile ? "1.25rem" : "1.5rem" }}
            >
              {t("sidebar.meetings")}
            </Title>

            <div className="d-flex align-items-center gap-2">
              {!isMobile && (
                <Space size="small" className="demo-buttons">
                  <AntButton
                    type="default"
                    icon={<PlayCircleOutlined />}
                    onClick={handleOpenVideoPopup}
                    className="premium-btn ghost"
                  >
                    {t("meeting.agenda.demoVideo")}
                  </AntButton>
                  <AntButton
                    type="primary"
                    icon={<QuestionCircleOutlined />}
                    onClick={() => {
                      window.open(
                        "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482",
                        "_blank",
                      );
                    }}
                    className="premium-btn primary-gradient"
                  >
                    {t("meeting.agenda.requestDemo")}
                  </AntButton>
                </Space>
              )}

              {isMobile && (
                <Space size="small">
                  <Tooltip title={t("meeting.agenda.demoVideo")}>
                    <AntButton
                      icon={<PlayCircleOutlined style={{ fontSize: "22px" }} />}
                      onClick={handleOpenVideoPopup}
                      type="text"
                      className="mobile-icon-btn"
                    />
                  </Tooltip>
                  <Tooltip title={t("meeting.agenda.requestDemo")}>
                    <AntButton
                      icon={
                        <QuestionCircleOutlined style={{ fontSize: "22px" }} />
                      }
                      onClick={() => {
                        window.open(
                          "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482",
                          "_blank",
                        );
                      }}
                      type="text"
                      className="mobile-icon-btn"
                    />
                  </Tooltip>
                </Space>
              )}
              <div id="mobile-agenda-settings-portal"></div>
            </div>
          </Col>
        </Row>

        <Text type="secondary" className="d-none d-md-block mb-2 subtext">
          {t("meeting.agenda.subtext_long")}
        </Text>

        {/* Tabs and Create Buttons Section */}
        <Row className="align-items-center g-2 mt-0">
          <Col xs={12} xl={7} lg={6}>
            {isMobile ? (
              <div className="mb-3 w-100">
                <Dropdown className="w-100 mobile-tabs-dropdown shadow-sm">
                  <Dropdown.Toggle
                    variant="white"
                    className="w-100 d-flex align-items-center justify-content-between border py-2 px-3 bg-white"
                    style={{
                      borderRadius: "12px",
                      border: "1.5px solid #f0f0f0",
                    }}
                  >
                    <span className="text-truncate fw-bold text-primary">
                      {tabItems.find((item) => item.key === activeTab)?.title ||
                        t("Select Tab")}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="w-100 border-0 shadow-lg mt-2 p-2"
                    style={{
                      borderRadius: "12px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {tabItems.map((item) => (
                      <Dropdown.Item
                        key={item.key}
                        active={activeTab === item.key}
                        onClick={() => handleAntTabChange(item.key)}
                        className={`py-2 px-3 rounded-3 mb-1 d-flex align-items-center ${activeTab === item.key ? "bg-primary text-white shadow" : "hover-bg-light"}`}
                      >
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <span
                            className="text-truncate"
                            style={{
                              fontWeight:
                                activeTab === item.key ? "600" : "400",
                            }}
                          >
                            {item.title}
                          </span>
                          {item.count > 0 && (
                            <span
                              style={{
                                backgroundColor:
                                  activeTab === item.key ? "white" : "#3b82f6",
                                color:
                                  activeTab === item.key ? "#3b82f6" : "white",
                                minWidth: "22px",
                                height: "22px",
                                borderRadius: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "bold",
                                padding: "0 8px",
                                ml: "10px",
                              }}
                            >
                              {item.count}
                            </span>
                          )}
                        </div>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <div className="modern-tabs-wrapper">
                <Tabs
                  activeKey={activeTab}
                  onChange={handleAntTabChange}
                  items={tabItems}
                  className="meeting-tabs modern"
                  tabBarGutter={16}
                />
              </div>
            )}
          </Col>

          <Col xs={12} xl={5} lg={6}>
            <div
              className={`d-flex gap-2 justify-content-lg-end justify-content-start pb-2 align-items-center flex-wrap`}
            >
              <AntButton
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => setShowMomentForm(true)}
                className="action-btn rapid shadow-sm"
              >
                <span>{t("addQuickMomentbtninmission")}</span>
              </AntButton>

              {/* {(() => {
                const storedUserStr = CookieService.get("user");
                const user = storedUserStr ? JSON.parse(storedUserStr) : null;
                return user && user.role_id === 1;
              })() && ( */}
                <AntButton
                  type="default"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginTop: '-2px' }}
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  }
                  onClick={() => {
                    handleQuickLaunch();
                  }}
                  loading={isQuickLaunchLoading}
                  className="action-btn detailed shadow-sm"
                >
                  <span>{t("meeting.buttons.quickLaunch")}</span>
                </AntButton>
              {/* )} */}
            </div>
          </Col>
        </Row>

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

      {/* Content Section */}
      <div className="content p-0">
        {activeTab === "tab1" && (
          <ReactBigCalendar
            activeTab={activeTab}
            quickMomentForm={showMomentForm}
          />
        )}
        {activeTab.startsWith("type-") && (
          <MeetingSubTab 
            fetchCounts={fetchMeetingCounts} 
            unreadCounts={unreadMeetingCounts} 
          />
        )}
        {activeTab === "tab3" && (
          <DraftMeetings allMeetings={draftMeetings} activeTab={activeTab} />
        )}
      </div>

      {/* Modals */}
      {open && (
        <NewMeetingModal
          open={open}
          closeModal={handleCloseModal}
          openedFrom="moment"
        />
      )}

      <Modal
        show={showVideoPopup}
        onHide={handleCloseVideoPopup}
        centered
        size="lg"
        className="youtube-video-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="w-100 text-center fw-bold">
            {t("Demo Video")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-lg border">
            <iframe
              width="100%"
              height="450"
              src="https://www.youtube.com/embed/gkciCGjt_bA"
              title="TekTIME Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Modal.Body>
      </Modal>

      {showMomentForm && (
        <QuickMomentForm
          show={showMomentForm}
          onClose={() => {
            setShowMomentForm(false);
            setFormState({
              selectedOption: null,
              title: "",
              date: "",
              start_time: "",
              description: "",
              type: "",
              priority: "",
              alarm: false,
              feedback: false,
              remainder: false,
              notification: false,
              autostart: false,
              playback: "Manual",
              prise_de_notes: "Manual",
              note_taker: false,
              objective: "",
              participants: [],
              steps: [],
              solution_tab: "use a template",
              solution_id: null,
              id: null,
              repetition: false,
              repetition_number: 1,
              repetition_frequency: "Daily",
              repetition_end_date: null,
              selected_days: [],
              teams: [],
              moment_privacy: "participant only",
              moment_privacy_teams: [],
              moment_password: null,
              location: null,
              agenda: null,
              address: null,
              room_details: null,
              phone: null,
              share_by: null,
              price: null,
              max_participants_register: 0,
              casting_tab: null,
            });
          }}
          openedFrom="meeting"
          destination={null}
        />
      )}

      <MeetingTabStyles />
    </Container>
  );
}

const MeetingTabStyles = () => (
  <style>
    {`
      .header-title {
        color: #1a3353;
        letter-spacing: -0.5px;
      }
      .subtext {
        color: #6c757d;
        font-size: 0.95rem;
        max-width: 800px;
      }
      .premium-btn {
        height: 40px;
        padding: 0 20px;
        border-radius: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
      }
      .premium-btn.ghost {
         border: 1.5px solid #e0e6ed;
         color: #1a3353;
         background: #fff;
      }
      .premium-btn.ghost:hover {
        border-color: #3b82f6;
        color: #3b82f6;
        background: #f0f7ff;
      }
      .premium-btn.primary-gradient {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border: none;
        color: #fff;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }
      .premium-btn.primary-gradient:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
      }
      .mobile-icon-btn {
        color: #4b5563;
      }
      .modern-tabs-wrapper {
        padding-bottom: 2px;
      }
      .meeting-tabs.modern .ant-tabs-nav::before {
        border-bottom: 2px solid #f0f0f0;
      }
      .meeting-tabs.modern .ant-tabs-tab {
        padding: 12px 0;
        margin-right: 12px;
        transition: all 0.3s ease;
      }
      .meeting-tabs.modern .ant-tabs-tab-btn {
        color: #64748b;
        font-weight: 500;
        font-size: 0.95rem;
      }
      .meeting-tabs.modern .ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #2563eb;
        font-weight: 700;
      }
      .meeting-tabs.modern .ant-tabs-ink-bar {
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: #2563eb;
      }
      .action-btn {
        height: 42px;
        border-radius: 12px;
        font-weight: 600;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        border: none;
      }
      .action-btn.rapid {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: #fff;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }
      .action-btn.rapid:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      }
      .action-btn.detailed {
        background: transparent;
        color: #437cf0;
        border: 1.5px solid #437cf0;
      }
      .action-btn.detailed:hover {
        background: #f0f7ff !important;
        color: #2563eb !important;
        border-color: #2563eb !important;
      }
      .hover-bg-light:hover {
        background-color: #f8fafc;
      }

      @media (max-width: 991px) {
        .header-actions {
           justify-content: flex-end;
        }
      }
      @media (max-width: 767px) {
        .bg-white.p-2 {
          padding: 0.5rem !important;
        }
        .header-title {
          margin-bottom: 0 !important;
        }
        #mobile-agenda-settings-portal {
          display: flex;
          align-items: center;
        }
        .mobile-icon-btn {
          padding: 4px !important;
          height: auto !important;
          width: auto !important;
        }
        .action-btn {
          flex: 1;
          font-size: 13px;
          padding: 0 12px;
          height: 36px !important;
        }
      }
    `}
  </style>
);

export default MeetingTabs;
