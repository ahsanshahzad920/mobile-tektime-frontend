import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect,useRef } from "react";
import { Card, Badge, Spinner, Button, Dropdown, Container, Row, Col, Form, Table, ProgressBar } from "react-bootstrap";
import {
  FaArrowRight,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaUser,
  FaUserTie,
  FaIdCard,
  FaPhone,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaSearch,
  FaFilePdf,
  FaFileCsv,
  FaGlobe,
  FaChartBar,
  FaChartLine,
  FaBell,
  FaSun,
  FaMoon,
  FaSyncAlt,
  FaCalendar
} from "react-icons/fa";


import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import { FaTag } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ModifyEnterpriseModal from "./ModifyEnterpriseModal";
import { formatDate, formatTime } from "../Meeting/GetMeeting/Helpers/functionHelper";

const Dashboard = ({ enterpriseId: propEnterpriseId }) => {
  const { t } = useTranslation("global");
  const navigate = useNavigate();
  // State for filters and data
  const [period, setPeriod] = useState('today');
  const [view, setView] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [collaboratorsData, setCollaboratorsData] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New states for search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const user = CookieService.get("user") ? JSON.parse(CookieService.get("user")) : null;
  const enterpriseId = propEnterpriseId || user?.enterprise?.id;

  // Utility function to convert seconds to hours (removes .0 for whole numbers)
 // Utility function to convert seconds to appropriate time format
const secondsToHours = (seconds) => {
  if (!seconds || seconds === 0) return '0m';
  
  const hours = seconds / 3600;
  const minutes = seconds / 60;
  
  // If greater than or equal to 24 hours, show in days
  if (hours >= 24) {
    const days = hours / 24;
    return Number.isInteger(days) ? `${days}d` : `${days.toFixed(1)}d`;
  }
  // If greater than or equal to 1 hour, show in hours
  else if (hours >= 1) {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  }
  // Otherwise show in minutes
  else {
    return Number.isInteger(minutes) ? `${minutes}m` : `${minutes.toFixed(0)}m`;
  }
};

  const periodData = [
    { period: t("dashboard.filters.period.today"), todo: "5 / 3h", progress: "2 / 1h30 / 0h45", late: "1 / 30min", done: "2 / 1h45" },
    { period: t("dashboard.filters.period.thisWeek"), todo: "18 / 12h", progress: "6 / 6h / 4h", late: "4 / 2h", done: "8 / 6h30" },
    { period: t("dashboard.filters.period.nextWeek"), todo: "12 / 8h", progress: "-", late: "-", done: "-" },
    { period: t("dashboard.filters.period.month"), todo: "50 / 32h", progress: "14 / 10h / 7h", late: "10 / 5h", done: "20 / 15h" }
  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search suggestions with debounce and minimum character limit
  const fetchSearchSuggestions = async (query) => {
      if (!query || query.trim().length === 0) {
    setSearchSuggestions([]);
    setShowSuggestions(false);
    return;
  }
   

    const token = CookieService.get("token");
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard-search/${query.trim()}?enterpriseId=${enterpriseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        
        }
      );

      if (response.status === 200) {
        setSearchSuggestions(response.data.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchSuggestions(searchTerm);
    }, 500); // Increased debounce time to 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);


  const [selectedSearchId, setSelectedSearchId] = useState(null);

  // Handle search suggestion selection
  // Update the handleSuggestionSelect function to store the type along with the ID
const handleSuggestionSelect = (suggestion) => {
  console.log('suggestion', suggestion);
  setSearchTerm(suggestion?.title);
  setSelectedSearchId({
    id: suggestion.id,
    type: suggestion.type // Store the type as well
  });
  setShowSuggestions(false);
  
  // // Trigger dashboard API call when a suggestion is selected
  // fetchDashboardData();
};
  // Handle manual search (when user presses enter)
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      fetchDashboardData();
    }
  };

  // Fetch dashboard data based on current filters
  const fetchDashboardData = async () => {
    if (!enterpriseId) return;

    setLoading(true);
    const token = CookieService.get("token");
    
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    
    try {
      // Build query parameters based on current filters
      const params = {
        period,
        view,
        current_time: formattedTime,
        current_date: formattedDate,
        timezone: userTimeZone
      };

      if (selectedTeam) {
        params.team_id = selectedTeam.team_id || selectedTeam.id;
      }

      if (selectedCollaborator) {
        params.user_id = selectedCollaborator.user_id || selectedCollaborator.id;
      }

    if (selectedSearchId) {
      const { id, type } = selectedSearchId;
      
      switch(type) {
        case 'moment':
          params.moment_id = id;
          break;
        case 'team':
          params.team_id = id;
          break;
        case 'mission':
          params.mission_id = id;
          break;
        default:
          // Fallback to generic search parameter
          params.search = id;
      }
    }


      const response = await axios.get(
        `${API_BASE_URL}/dashboard/${enterpriseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (response.status === 200) {
        const data = response?.data?.data;
        const stepDetails = data?.step_details;
        const teamsData = data?.teams;
        const userData = data?.users;

        setDashboard(stepDetails || data);

        if (view === 'team' && teamsData) {
          setTeamsData(teamsData);
        }

        if (view === 'user' && userData) {
          setCollaboratorsData(userData);
        }
      }
    } catch (error) {
      toast.error(t(error?.message));
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data and whenever filters change
  useEffect(() => {
    fetchDashboardData();
  }, [period, view, selectedTeam, selectedCollaborator,selectedSearchId]);

  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setSelectedTeam(null);
    setSelectedCollaborator(null);
    setSearchTerm('');
    setSelectedSearchId(null)
    setShowSuggestions(false);
  };

  // Handle team selection
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setSelectedCollaborator(null);
    setView('team');
    setSearchTerm('');
    setSelectedSearchId(null);
    setShowSuggestions(false);
  };

  // Handle collaborator selection
  const handleCollaboratorSelect = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setSelectedTeam(null);
    setView('user');
    setSearchTerm('');
    setSelectedSearchId(null);

    setShowSuggestions(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedTeam(null);
    setSelectedCollaborator(null);
    setView('global');
    setPeriod('today');
    setSearchTerm('');
    setSelectedSearchId(null);

    setShowSuggestions(false);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Get period display text
  const getPeriodDisplayText = () => {
    switch(period) {
      case 'today': return t("dashboard.filters.period.today");
      case 'week': return t("dashboard.filters.period.thisWeek");
      case 'next-week': return t("dashboard.filters.period.nextWeek");
      case 'month': return t("dashboard.filters.period.month");
      case 'quarter': return t("dashboard.filters.period.quarter");
      default: return t("dashboard.filters.period.today");
    }
  };

  // Get view display text
  const getViewDisplayText = () => {
    switch(view) {
      case 'global': return t("dashboard.filters.view.global");
      case 'team': return t("dashboard.filters.view.byTeam");
      case 'user': return t("dashboard.filters.view.byUser");
      default: return t("dashboard.filters.view.global");
    }
  };

  // Get view icon
  const getViewIcon = () => {
    switch(view) {
      case 'global': return <FaGlobe className="me-2" />;
      case 'team': return <FaUsers className="me-2" />;
      case 'user': return <FaUser className="me-2" />;
      default: return <FaGlobe className="me-2" />;
    }
  };

  // Render summary cards for a given data object
  const renderSummaryCards = (data, title = null, logo = null) => {
    if (!data) return null;

    return (
      <div className="mb-4">
        {title && (
          <div className="d-flex align-items-center mb-3">
            {logo && (
              <img 
                src={logo} 
                alt={title}
                className="rounded-circle me-3"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
            )}
            <h4 className="mb-0">{title}</h4>
          </div>
        )}
        <Row>
          <Col xl={3} lg={6} md={6} xs={12} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-3 p-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-2 mb-lg-3">
                  <Card.Title className="mb-0 text-info small fw-bold text-uppercase" style={{letterSpacing: '0.5px'}}>{t("dashboard.summaryCards.todo")}</Card.Title>
                </div>
                <div className="d-flex align-items-baseline">
                  <h2 className="fw-bold me-2 mb-0">{data?.todo?.count || 0}</h2>
                  <p className="text-muted mb-0 small">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-3 pt-2 border-top">
                  <FaCalendarAlt className="text-muted me-2 small" />
                  <span className="text-muted small">
                    {secondsToHours(data?.todo?.planned_time)} {t("dashboard.summaryCards.planned")}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} xs={12} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-3 p-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-2 mb-lg-3">
                  <Card.Title className="mb-0 text-warning small fw-bold text-uppercase" style={{letterSpacing: '0.5px'}}>{t("dashboard.summaryCards.inProgress")}</Card.Title>
                </div>
                <div className="d-flex align-items-baseline">
                  <h2 className="fw-bold me-2 mb-0">{data?.in_progress?.count || 0}</h2>
                  <p className="text-muted mb-0 small">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="mt-3 pt-2 border-top">
                  <div className="d-flex align-items-center mb-1">
                    <FaChartLine className="text-muted me-2 small" />
                    <span className="text-muted small">
                      {secondsToHours(data?.in_progress?.completed_time)} {t("dashboard.summaryCards.completedTime")}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-muted me-2 small" />
                    <span className="text-muted small">
                      {secondsToHours(data?.in_progress?.remaining_time)} {t("dashboard.summaryCards.remaining")}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} xs={12} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-3 p-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-2 mb-lg-3">
                  <Card.Title className="mb-0 text-danger small fw-bold text-uppercase" style={{letterSpacing: '0.5px'}}>{t("dashboard.summaryCards.late")}</Card.Title>
                </div>
                <div className="d-flex align-items-baseline">
                  <h2 className="fw-bold me-2 mb-0">{data?.late?.count || 0}</h2>
                  <p className="text-muted mb-0 small">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-3 pt-2 border-top">
                  <FaCalendarAlt className="text-muted me-2 small" />
                  <span className="text-muted small">
                    {secondsToHours(data?.late?.delay_time)} {t("dashboard.summaryCards.remaining")}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6} xs={12} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-3 p-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-2 mb-lg-3">
                  <Card.Title className="mb-0 text-success small fw-bold text-uppercase" style={{letterSpacing: '0.5px'}}>{t("dashboard.summaryCards.completed")}</Card.Title>
                </div>
                <div className="d-flex align-items-baseline">
                  <h2 className="fw-bold me-2 mb-0">{data?.completed?.count || 0}</h2>
                  <p className="text-muted mb-0 small">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-3 pt-2 border-top">
                  <FaCalendarAlt className="text-muted me-2 small" />
                  <span className="text-muted small">
                    {secondsToHours(data?.completed?.spend_time)} {t("dashboard.summaryCards.timeSpent")}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      {/* Filter Bar */}
      <div className="dashboard-filters mb-4 p-2 p-md-3 bg-white rounded shadow-sm border">
        <Row className="g-2 g-md-3 align-items-center">
          {/* Period and View filter - 50/50 on mobile */}
          <Col xs={6} md="auto">
            <Dropdown className="w-100">
              <Dropdown.Toggle variant="outline-primary" id="period-dropdown" className="w-100 text-start d-flex align-items-center justify-content-between px-2 px-md-3 py-2">
                <div className="text-truncate">
                  <FaCalendarAlt className="me-1 me-md-2" />
                  <span className="small d-md-inline">{getPeriodDisplayText()}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-lg border-0 mt-2">
                <Dropdown.Item onClick={() => handlePeriodChange('today')}>{t("dashboard.filters.period.today")}</Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange('week')}>{t("dashboard.filters.period.thisWeek")}</Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange('next-week')}>{t("dashboard.filters.period.nextWeek")}</Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange('month')}>{t("dashboard.filters.period.month")}</Dropdown.Item>
                <Dropdown.Item onClick={() => handlePeriodChange('quarter')}>{t("dashboard.filters.period.quarter")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col xs={6} md="auto">
            <Dropdown className="w-100">
              <Dropdown.Toggle variant="outline-primary" id="view-dropdown" className="w-100 text-start d-flex align-items-center justify-content-between px-2 px-md-3 py-2">
                <div className="text-truncate">
                  {React.cloneElement(getViewIcon(), { className: 'me-1 me-md-2' })}
                  <span className="small d-md-inline">{getViewDisplayText()}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow-lg border-0 mt-2">
                <Dropdown.Item onClick={resetFilters}><FaGlobe className="me-2" /> {t("dashboard.filters.view.global")}</Dropdown.Item>
                <Dropdown.Item onClick={() => setView('team')}><FaUsers className="me-2" /> {t("dashboard.filters.view.byTeam")}</Dropdown.Item>
                <Dropdown.Item onClick={() => setView('user')}><FaUser className="me-2" /> {t("dashboard.filters.view.byUser")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          {/* Search Box - 100% on mobile */}
          <Col xs={12} md className="flex-grow-1">
            <div ref={searchRef} className="search-box position-relative">
              <Form.Control
                type="text"
                placeholder={t("dashboard.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 1 && setShowSuggestions(true)}
                onKeyPress={handleSearchSubmit}
                className="ps-5 py-2"
                style={{ borderRadius: '10px' }}
              />
              <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              
              {showSuggestions && (
                <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow-lg z-3 overflow-auto"
                   style={{ maxHeight: "300px", overflowY: "auto", listStyle: "none" }}>
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 border-bottom cursor-pointer hover-bg"
                        style={{ cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionSelect(suggestion)}>
                        <div className="d-flex align-items-center">
                          {suggestion.type === 'moment' && <img src="/Assets/sidebar_meeting_active.svg" alt="moment" width={20} />}
                          {suggestion.type === 'mission' && <img src="/Assets/sidebar_active_destination.svg" alt="mission" width={20} />}
                          {suggestion.type === 'team' && <img src="/Assets/sidebar_team_active.svg" alt="team" width={20} />}
                          <div className="ms-2 text-truncate fw-medium">{suggestion?.title}</div>
                        </div>
                      </div>
                    ))
                  ) : searchTerm.length >= 1 ? (
                    <div className="p-2 text-muted small">No results found</div>
                  ) : null}
                </div>
              )}
            </div>
          </Col>

          {/* Buttons - 100% combined on mobile */}
          <Col xs={12} md="auto">
            <div className="d-flex gap-2">
              {/* <Button variant="outline-dark" className="flex-grow-1 d-flex align-items-center justify-content-center py-2 px-3 fw-medium" onClick={toggleDarkMode}>
                {darkMode ? <FaSun className="me-2" /> : <FaMoon className="me-2" />}
                <span className="small">{darkMode ? t("dashboard.filters.lightMode") : t("dashboard.filters.darkMode")}</span>
              </Button> */}
              <Button variant="outline-danger" className="d-flex align-items-center justify-content-center py-2 px-3 fw-medium" onClick={resetFilters}>
                <FaSyncAlt className="me-md-2" />
                <span className="small d-none d-md-inline">{t("dashboard.filterBy.resetAll")}</span>
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Team and Collaborator Filters */}
      {(view === 'team' || view === 'user') && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">{t("dashboard.filterBy.title")}</h5>
              </Card.Header>
              <Card.Body>
                {view === 'team' && (
                  <div className="mb-3">
                    <h6 className="mb-3">{t("dashboard.filterBy.team")}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {teamsData.map(team => (
                        <Badge 
                          key={team.team_id} 
                          bg={selectedTeam?.team_id === team.team_id ? "primary" : "light"} 
                          text={selectedTeam?.team_id === team.team_id ? "white" : "dark"}
                          className="p-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleTeamSelect(team)}
                        >
                          {team.team_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {view === 'user' && (
                  <div className="mb-3">
                    <h6 className="mb-3">{t("dashboard.filterBy.collaborator")}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {collaboratorsData.map(member => (
                        <Badge 
                          key={member.user_id} 
                           bg={selectedCollaborator?.user_id == member.user_id ? "primary" : 'light'} 
                          text={selectedCollaborator?.user_id == member.user_id ? 'white' : 'dark'}
                          className="p-2 d-flex align-items-center"
                          style={{ 
                            cursor: 'pointer',
                          }}
                          onClick={() => handleCollaboratorSelect(member)}
                        >
                          {member.user_name + ' ' + member.user_last_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Global View */}
      {view === 'global' && dashboard && (
        <>
          {renderSummaryCards(dashboard)}
        </>
      )}

      {view === 'team' && (
        <>
          {selectedTeam ? (
            renderSummaryCards(selectedTeam.step_details, selectedTeam.team_name, selectedTeam.team_logo)
          ) : (
            teamsData.map(team => (
              <div key={team.team_id} className="mb-4">
                {renderSummaryCards(team.step_details, team.team_name, team.team_logo)}
              </div>
            ))
          )}
        </>
      )}

      {/* Collaborator View */}
     {view === 'user' && (
  <>
    {selectedCollaborator ? (
      renderSummaryCards(
        selectedCollaborator.step_details, 
        `${selectedCollaborator.user_name} ${selectedCollaborator.user_last_name}`,
        selectedCollaborator.user_image?.startsWith('http') 
          ? selectedCollaborator.user_image 
          : `${Assets_URL}/${selectedCollaborator.user_image}`
      )
    ) : (
      collaboratorsData?.map(user => (
        <div key={user.user_id} className="mb-4">
          {renderSummaryCards(
            user.step_details, 
            `${user.user_name} ${user.user_last_name}`,
            user.user_image?.startsWith('http') 
              ? user.user_image 
              : `${Assets_URL}/${user.user_image}`
          )}
        </div>
      ))
    )}
  </>
)}



    {/* {view === "global" && <>
    
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">{t("dashboard.periodView.title")}</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="d-none d-md-block">
                <Table responsive hover className="mb-0 period-table">
                  <thead>
                    <tr>
                      <th className="ps-4">{t("dashboard.periodView.period")}</th>
                      <th>{t("dashboard.periodView.todo")}</th>
                      <th>{t("dashboard.periodView.inProgress")}</th>
                      <th>{t("dashboard.periodView.late")}</th>
                      <th className="pe-4">{t("dashboard.periodView.done")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodData.map((data, index) => (
                      <tr key={index}>
                        <td className="ps-4"><strong>{data.period}</strong></td>
                        <td>{data.todo}</td>
                        <td>{data.progress}</td>
                        <td>{data.late}</td>
                        <td className="pe-4">{data.done}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="d-md-none p-3">
                {periodData.map((data, index) => (
                  <div key={index} className="period-mobile-card mb-3 p-3 border rounded-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                      <h6 className="mb-0 fw-bold text-primary">{data.period}</h6>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <small className="text-muted d-block">{t("dashboard.periodView.todo")}</small>
                        <span className="fw-medium">{data.todo}</span>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">{t("dashboard.periodView.done")}</small>
                        <span className="fw-medium text-success">{data.done}</span>
                      </div>
                      <div className="col-12 mt-2 pt-2 border-top">
                        <small className="text-muted d-block">{t("dashboard.periodView.inProgress")}</small>
                        <span className="fw-medium text-warning">{data.progress}</span>
                      </div>
                      <div className="col-12">
                        <small className="text-muted d-block">{t("dashboard.periodView.late")}</small>
                        <span className="fw-medium text-danger">{data.late}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">{t("dashboard.filterBy.title")}</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6 className="mb-3">{t("dashboard.filterBy.collaborator")}</h6>
                <div className="d-flex flex-wrap gap-2">
                  {collaboratorsData.map(member => (
                    <Badge 
                      key={member.id} 
                      bg="light" 
                      text="dark" 
                      className="p-2 d-flex align-items-center"
                      style={{ cursor: 'pointer' }}
                    >
                      <div 
                        className="rounded-circle me-2" 
                        style={{ width: '20px', height: '20px', backgroundColor: member.color }}
                      ></div>
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h6 className="mb-3">{t("dashboard.filterBy.team")}</h6>
                <div className="d-flex flex-wrap gap-2">
                  {teamsData.map(team => (
                    <Badge 
                      key={team.team_id} 
                      bg={team.color} 
                      className="p-2"
                      style={{ cursor: 'pointer' }}
                    >
                      {team.team_name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline-secondary" size="sm">
                {t("dashboard.filterBy.resetAll")}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">{t("dashboard.visualizations.completionRate")}</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-4">
                    <div 
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: '120px', height: '120px', backgroundColor: 'rgba(40, 100, 214, 0.1)' }}
                    >
                      <h2 className="mb-0 text-primary">72%</h2>
                    </div>
                    <p className="text-muted">{t("dashboard.visualizations.completionRate")}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{t("dashboard.visualizations.progress")}</h5>
                  <Badge bg="danger">
                    <FaBell className="me-1" /> {t("dashboard.visualizations.alert")}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <div 
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                      style={{ width: '120px', height: '120px', backgroundColor: 'rgba(40, 100, 214, 0.1)' }}
                    >
                      <h2 className="mb-0 text-primary">72%</h2>
                    </div>
                    <p className="text-muted">{t("dashboard.visualizations.completionRate")}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      </>} */}


     {/* Show message if no data */}
      {!loading && ((view === 'global' && !dashboard) || (view === 'team' && teamsData.length === 0) || (view === 'user' && collaboratorsData.length === 0)) && (
        <div className="text-center py-5">
          <h5 style={{color:"lightgray"}}>{t("dashboard.noData")}</h5>
       
        </div>
      )}



      {/* Custom CSS */}
      <style>{`
        .dashboard-filters {
          background-color: #ffffff;
          border: 1px solid #edf2f7;
          border-radius: 12px;
        }
        
        .summary-card {
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent !important;
        }
        
        .summary-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.1) !important;
          border-color: rgba(40, 100, 214, 0.1) !important;
        }
        
        .search-box .form-control {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding-top: 0.6rem;
          padding-bottom: 0.6rem;
          transition: all 0.2s;
        }
        
        .search-box .form-control:focus {
          box-shadow: 0 0 0 3px rgba(40, 100, 214, 0.1);
          border-color: #2864d6;
        }
        
        .period-table th {
          border-top: none;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          background-color: #f7fafc;
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        
        .period-table td {
          padding-top: 1rem;
          padding-bottom: 1rem;
          vertical-align: middle;
        }
        
        .period-mobile-card {
           box-shadow: 0 2px 4px rgba(0,0,0,0.02);
           transition: transform 0.2s;
        }
        
        .period-mobile-card:active {
           transform: scale(0.98);
        }

        .dark-mode .dashboard-filters {
          background-color: #1a202c;
          border-color: #2d3748;
        }
        
        .dark-mode .card {
          background-color: #1a202c;
          color: #f8f9fa;
          border-color: #2d3748 !important;
        }
        
        .dark-mode .card-header {
          background-color: #2d3748 !important;
          color: #f8f9fa;
        }
        
        .dark-mode .table {
          color: #f8f9fa;
        }
        
        .dark-mode .table th {
          color: #a0aec0;
          background-color: #2d3748;
        }
        
        .dark-mode .period-mobile-card {
          background-color: #2d3748 !important;
          border-color: #4a5568 !important;
        }
        
        .dark-mode .hover-bg:hover {
          background-color: #2d3748;
        }

        @media (max-width: 576px) {
          .summary-card h2 {
            font-size: 1.2rem;
          }
          .dashboard-filters {
            margin-bottom: 1.5rem;
            padding: 0.75rem !important;
          }
           .dashboard-filters .small {
            font-size: 0.75rem !important;
          }
          .dashboard-filters .dropdown-toggle,
          .dashboard-filters .btn {
            padding: 0.4rem !important;
          }
          .search-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const EnterpriseCard = ({ enterprise, loading,getEnterpriseClient }) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(CookieService.get("user"));
  const userEnterprise = user?.enterprise?.name;


  const [show,setShow] = useState(false);
  const handleShow = () => setShow(true)
  const handleHide = () => setShow(false)
    const renderActionButtons = (item) => {
        return (
          <div className="d-flex justify-content-center gap-2">
           <Button
                variant="outline-primary"
                size="sm"
                className="w-100 px-3 py-2 rounded-pill fw-medium"
                onClick={(e) => {
                  e.stopPropagation();
                    // navigate(`/ModifierEnterprises/${item?.id}`,{state:{from:"tab5"}});
                    setShow(true)
                }}
              >
                <FaEdit className="me-2" /> {t("Modify")}
              </Button>
          </div>
        );
     
    };

  return (
    <div className="complete-invite">
      <div className="row g-4 participant">
        {loading ? (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        ) : (
          <>
            <div className="col-12 col-md-4 col-xl-3">
              <Card
                className="participant-card border-0 shadow-sm"

                style={{
                  cursor: "pointer",
                  borderRadius: "20px",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #2864d6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "none";
                }}
                onClick={(e) => {
                        CookieService.set("activeTab", "tab5");
                    navigate(`/client/${enterprise?.client?.id}`,{state:{from: "Casting"}});
                }}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                  <div className="mb-4">
                    <div className="profile-logo mx-auto shadow-sm rounded-circle p-1 bg-white" style={{ width: "100px", height: "100px" }}>
                      {enterprise?.client?.client_logo?.startsWith("http") ? (
                        <Card.Img
                          className="rounded-circle w-100 h-100"
                          src={enterprise?.client?.client_logo}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Card.Img
                          className="rounded-circle w-100 h-100"
                          src={Assets_URL + "/" + enterprise?.client?.client_logo}
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </div>

                  <Card.Title className="h4 fw-bold mb-3">
                    {enterprise?.client?.name}
                  </Card.Title>

                  <div className="w-100 mb-4 divider" style={{ height: '1px', background: '#edf2f7' }}></div>

                  <div className="w-100 px-2">
                    <div className="d-flex align-items-center justify-content-center mb-3 text-muted">
                      <FaTag className="me-2 text-primary opacity-75" />
                      <span className="small fw-medium">{enterprise?.activity_area || t("No Activity Area")}</span>
                    </div>
                    
                    {enterprise?.country && (
                    <div className="d-flex align-items-center justify-content-center mb-3 text-muted">
                      <FaBuilding className="me-2 text-primary opacity-75" />
                      <span className="small">{enterprise?.country}</span>
                    </div>
                    )}

                    <div className="d-flex align-items-center justify-content-center mb-4 text-muted">
                      <FaUsers className="me-2 text-primary opacity-75" />
                      <span className="small">
                        {enterprise?.users?.length || 0}{" "}
                        {enterprise?.users?.length > 1
                          ? t("team.members")
                          : t("team.member")}
                      </span>
                    </div>

                    {/* Start Date */}
                    <div className="d-flex align-items-center justify-content-center mb-3 text-muted">
                      <FaCalendarAlt className="me-2 text-primary opacity-75" />
                      <span className="small">
                        {(() => {
                          const subscriptions = enterprise?.client?.active_subscription || enterprise?.created_by?.active_subscription;
                          const latestSub = subscriptions && subscriptions.length > 0 
                            ? subscriptions[subscriptions.length - 1] 
                            : null;
                          
                          if (latestSub && latestSub.starts_at) {
                            return new Date(latestSub.starts_at).toLocaleDateString("fr-FR");
                          }
                          return enterprise?.created_at ? new Date(enterprise.created_at).toLocaleDateString("fr-FR") : "-";
                        })()}
                      </span>
                    </div>

                    {/* End Date */}
                    <div className="d-flex align-items-center justify-content-center mb-4 text-muted">
                      <FaCalendar className="me-2 text-primary opacity-75" />
                      <span className="small">
                        {(() => {
                          const subscriptions = enterprise?.client?.active_subscription || enterprise?.created_by?.active_subscription;
                          const latestSub = subscriptions && subscriptions.length > 0 
                            ? subscriptions[subscriptions.length - 1] 
                            : null;
                            
                          if (latestSub && latestSub.ends_at && latestSub.ends_at !== latestSub.starts_at) {
                            return new Date(latestSub.ends_at).toLocaleDateString("fr-FR");
                          }
                          
                          const startDate = latestSub?.starts_at || enterprise?.created_at;
                          if (!startDate) return "-";
                          
                          const date = new Date(startDate);
                          const months = {
                            "Annuelle (12 mois)": 12,
                            "Mensuelle (1 mois)": 1,
                            "Trimestrielle (3 mois)": 3,
                            "Semestrielle  (6 mois)": 6,
                          }[enterprise?.contract?.payment_type];
                          
                          if (!months) return new Date(startDate).toLocaleDateString("fr-FR");
                          
                          date.setMonth(date.getMonth() + months);
                          return date.toLocaleDateString("fr-FR");
                        })()}
                      </span>
                    </div>

                    {/* Trial Date */}
                    {(() => {
                      const subscriptions = enterprise?.client?.active_subscription || enterprise?.created_by?.active_subscription;
                      const actualTrial = subscriptions?.slice().reverse().find(s => s.status === 'trialing' || (s.status === 'expired' && s.stripe_subscription_id === null));
                      
                      if (actualTrial && actualTrial.ends_at) {
                          return (
                            <div className="d-flex align-items-center justify-content-center mb-3">
                              <FaCalendarAlt className="me-2 text-danger opacity-75" />
                              <span className="small text-danger fw-bold">
                                Fin d'essai : {new Date(actualTrial.ends_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="w-100 mt-3">
                    {renderActionButtons(enterprise)}
                  </div>

                </Card.Body>
              </Card>
            </div>
              {/* Dashboard component with filters at the beginning */}
            <div className="col-12 col-md-8 col-xl-9">
              <Dashboard enterpriseId={enterprise?.id || id} />
            </div>
          </>
        )}
      </div>

     {show && (
            <ModifyEnterpriseModal
        enterprise={enterprise}
        show={show}
        onHide={() => setShow(false)}
        // onSave={handleUpdate}
        getEnterpriseClient={getEnterpriseClient}
      />

     )}
    </div>
  );
};

export default EnterpriseCard;
