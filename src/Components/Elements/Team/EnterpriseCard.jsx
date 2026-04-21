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
  FaBell
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

const Dashboard = () => {
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

  const user = JSON.parse(CookieService.get("user"));
  const enterpriseId = user?.enterprise?.id;

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
          <Col xl={3} lg={6} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 text-info">{t("dashboard.summaryCards.todo")}</Card.Title>
                </div>
                <div className="d-flex align-items-end">
                  <h2 className="fw-bold me-2">{data?.todo?.count || 0}</h2>
                  <p className="text-muted mb-1">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <FaCalendarAlt className="text-muted me-2" />
                  <span className="text-muted">
                    {secondsToHours(data?.todo?.planned_time)} {t("dashboard.summaryCards.planned")}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 text-warning">{t("dashboard.summaryCards.inProgress")}</Card.Title>
                </div>
                <div className="d-flex align-items-end">
                  <h2 className="fw-bold me-2">{data?.in_progress?.count || 0}</h2>
                  <p className="text-muted mb-1">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center mb-1">
                    <FaChartLine className="text-muted me-2" />
                    <span className="text-muted">
                      {secondsToHours(data?.in_progress?.completed_time)} {t("dashboard.summaryCards.completedTime")}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-muted me-2" />
                    <span className="text-muted">
                      {secondsToHours(data?.in_progress?.remaining_time)} {t("dashboard.summaryCards.remaining")}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 text-danger">{t("dashboard.summaryCards.late")}</Card.Title>
                </div>
                <div className="d-flex align-items-end">
                  <h2 className="fw-bold me-2">{data?.late?.count || 0}</h2>
                  <p className="text-muted mb-1">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <FaCalendarAlt className="text-muted me-2" />
                  <span className="text-muted">
                    {secondsToHours(data?.late?.delay_time)} {t("dashboard.summaryCards.remaining")}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="summary-card border-0 shadow-sm h-100" style={{cursor:'pointer'}} onClick={()=>navigate('/action')}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 text-success">{t("dashboard.summaryCards.completed")}</Card.Title>
                </div>
                <div className="d-flex align-items-end">
                  <h2 className="fw-bold me-2">{data?.completed?.count || 0}</h2>
                  <p className="text-muted mb-1">{t("dashboard.summaryCards.tasks")}</p>
                </div>
                <div className="d-flex align-items-center mt-2">
                  <FaCalendarAlt className="text-muted me-2" />
                  <span className="text-muted">
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
      <div className="dashboard-filters mb-4 p-3 bg-light rounded shadow-sm">
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Period filter */}
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="period-dropdown">
              <FaCalendarAlt className="me-2" />
              {getPeriodDisplayText()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handlePeriodChange('today')}>
                {t("dashboard.filters.period.today")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handlePeriodChange('week')}>
                {t("dashboard.filters.period.thisWeek")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handlePeriodChange('next-week')}>
                {t("dashboard.filters.period.nextWeek")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handlePeriodChange('month')}>
                {t("dashboard.filters.period.month")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handlePeriodChange('quarter')}>
                {t("dashboard.filters.period.quarter")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* View filter */}
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="view-dropdown">
              {getViewIcon()}
              {getViewDisplayText()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                resetFilters();
              }}>
                <FaGlobe className="me-2" /> {t("dashboard.filters.view.global")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setView('team')}>
                <FaUsers className="me-2" /> {t("dashboard.filters.view.byTeam")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setView('user')}>
                <FaUser className="me-2" /> {t("dashboard.filters.view.byUser")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Search */}
<div ref={searchRef} className="search-box position-relative" style={{ minWidth: '250px' }}>
  <Form.Control
    type="text"
    placeholder={t("dashboard.filters.searchPlaceholder")}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  onFocus={() => searchTerm.length >= 1 && setShowSuggestions(true)} // Changed from 2 to 1
    onKeyPress={handleSearchSubmit}
    className="ps-5"
  />
  <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
  
  {/* Search suggestions dropdown - ADD THIS BACK */}
  {showSuggestions && (
    <div className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow-lg z-3 overflow-auto"
        style={{
// border: "1px solid #ccc",
maxHeight: "300px",
overflowY: "auto",
// padding: 0,
// margin: 0,
listStyle: "none",
}}>
      {searchSuggestions.length > 0 ? (
        <>
          {searchSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 border-bottom cursor-pointer hover-bg"
          
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="d-flex align-items-center">
                {suggestion.type === 'moment' && <img
                                        src="/Assets/sidebar_meeting_active.svg"
                                        alt="moment"
                                      />}
                {suggestion.type === 'mission' && <img
                                                                              src="/Assets/sidebar_active_destination.svg"
                                                                              alt="mission"
                                                                            />}
                {suggestion.type === 'team' && <img
                                                                              src="/Assets/sidebar_team_active.svg"
                                                                              alt="team"
                                                                            />}
                
                <div className="text-truncate">
                  <div className="fw-medium text-truncate">{suggestion?.title}</div>
                
                </div>
              </div>
            </div>
          ))}
        </>
      ) : searchTerm.length >= 1 ? (
        <div className="p-2 text-muted">No results found</div>
      ) : null}
    </div>
  )}
</div>

          {/* Export buttons */}
{/*           <Dropdown>
            <Dropdown.Toggle variant="outline-success" id="export-dropdown">
              {t("dashboard.filters.export")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <FaFilePdf className="me-2 text-danger" /> {t("dashboard.filters.exportOptions.pdf")}
              </Dropdown.Item>
              <Dropdown.Item>
                <FaFileCsv className="me-2 text-success" /> {t("dashboard.filters.exportOptions.csv")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}

          {/* Dark mode toggle */}
          <Button variant="outline-secondary" onClick={toggleDarkMode}>
            {darkMode ? t("dashboard.filters.lightMode") : t("dashboard.filters.darkMode")}
          </Button>

          {/* Reset all button */}
          <Button variant="outline-danger" size="sm" onClick={resetFilters}>
            {t("dashboard.filterBy.resetAll")}
          </Button>
        </div>
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
                            // backgroundColor: selectedCollaborator?.user_id == member.user_id ? "primary" : 'light',
                            // color: selectedCollaborator?.user_id == member.user_id ? 'white' : 'dark'
                          }}
                          onClick={() => handleCollaboratorSelect(member)}
                        >
                          {/* <div 
                            className="rounded-circle me-2" 
                            style={{ width: '20px', height: '20px', backgroundColor: member?.color }}
                          ></div> */}
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
            <Card.Header className="bg-light">
              <h5 className="mb-0">{t("dashboard.periodView.title")}</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>{t("dashboard.periodView.period")}</th>
                    <th>{t("dashboard.periodView.todo")}</th>
                    <th>{t("dashboard.periodView.inProgress")}</th>
                    <th>{t("dashboard.periodView.late")}</th>
                    <th>{t("dashboard.periodView.done")}</th>
                  </tr>
                </thead>
                <tbody>
                  {periodData.map((data, index) => (
                    <tr key={index}>
                      <td><strong>{data.period}</strong></td>
                      <td>{data.todo}</td>
                      <td>{data.progress}</td>
                      <td>{data.late}</td>
                      <td>{data.done}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                  <h5 className="mb-0">{t("dashboard.visualizations.workload")}</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Lundi</span>
                    <span>12h</span>
                  </div>
                  <ProgressBar className="mb-3">
                    <ProgressBar variant="info" now={30} key={1} />
                    <ProgressBar variant="warning" now={40} key={2} />
                    <ProgressBar variant="danger" now={30} key={3} />
                  </ProgressBar>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Mardi</span>
                    <span>10h</span>
                  </div>
                  <ProgressBar className="mb-3">
                    <ProgressBar variant="info" now={20} key={1} />
                    <ProgressBar variant="warning" now={50} key={2} />
                    <ProgressBar variant="danger" now={30} key={3} />
                  </ProgressBar>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Mercredi</span>
                    <span>14h</span>
                  </div>
                  <ProgressBar className="mb-3">
                    <ProgressBar variant="info" now={40} key={1} />
                    <ProgressBar variant="warning" now={30} key={2} />
                    <ProgressBar variant="danger" now={30} key={3} />
                  </ProgressBar>
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
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
        }
        
        .summary-card {
          border-radius: 16px;
          transition: transform 0.2s ease;
        }
        
        .summary-card:hover {
          transform: translateY(-5px);
        }
        
        .search-box {
          position: relative;
        }
        
        .table th {
          border-top: none;
          font-weight: 600;
          color: #8590a3;
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(40, 100, 214, 0.05);
        }
        
        .dark-mode .dashboard-filters {
          background-color: #2c3e50;
          border-color: #34495e;
        }
        
        .dark-mode .card {
          background-color: #2c3e50;
          color: #f8f9fa;
        }
        
        .dark-mode .card-header {
          background-color: #34495e !important;
          color: #f8f9fa;
        }
        
        .dark-mode .table {
          color: #f8f9fa;
        }
        
        .dark-mode .table th {
          color: #bdc3c7;
          background-color: #34495e;
        }
        
        .dark-mode .table-hover tbody tr:hover {
          background-color: rgba(52, 152, 219, 0.1);
        }
        
        .dark-mode .text-muted {
          color: #95a5a6 !important;
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
          <div className="d-flex justify-content-center gap-2 mt-3">
           <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                    // navigate(`/ModifierEnterprises/${item?.id}`,{state:{from:"tab5"}});
                    setShow(true)
                }}
              >
                <FaEdit className="me-1" /> {t("Modify")}
              </Button>
          </div>
        );
     
    };

  return (
    <div className="complete-invite">
      <div className="row participant">
        {loading ? (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        ) : (
          <>
            <div className="col-md-3">
              <Card
                className="participant-card position-relative"
                style={{
                  cursor: "pointer",
                  marginTop: "4rem",
                  borderRadius: "26px",
                  position: "relative",
                  //   border:
                  //     isClientView || isContactView
                  //       ? `none`
                  //       : `2px solid ${getBorderColor(item)}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #0026b1";
                  e.currentTarget.style.background = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid transparent";
                  e.currentTarget.style.background = "white";
                }}
                onClick={(e) => {
                        CookieService.set("activeTab", "tab5");
                    navigate(`/client/${enterprise?.client?.id}`,{state:{from: "Casting"}});
                }}
              >
                <Card.Body
                  style={{
                    padding: "20px 0px 20px 0",
                  }}
                >
                  <div className="d-flex justify-content-center">
                    <div className="participant-card-position">
                      <div className="profile-logo position-relative">
                        <>
                          {enterprise?.client?.client_logo?.startsWith("http") ? (
                            <Card.Img
                              className="user-img"
                              src={enterprise?.client?.client_logo}
                              style={{ width: "80px", height: "80px" }}
                            />
                          ) : (
                            <Card.Img
                              className="user-img"
                              src={Assets_URL + "/" + enterprise?.client?.client_logo}
                              style={{ width: "80px", height: "80px" }}
                            />
                          )}
                        </>
                      </div>
                    </div>
                  </div>

                  <Card.Title className="text-center mt-4 card-heading">
                    {enterprise?.client?.name}
                  </Card.Title>

                  {/* Creation Date */}
                  {/* <div className="text-center mb-2">
                    <small className="text-muted d-flex align-items-center justify-content-center">
                      <FaCalendarAlt className="me-1" />
                      {moment(enterprise?.created_at)
                        .tz(moment.tz.guess())
                        .format("DD/MM/YYYY [at] HH[h]mm")}
                    </small>
                  </div> */}

                  {/* Creator Information */}
                  {/* <div className="d-flex align-items-center justify-content-center mb-2">
                    <span
                      style={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "14.52px",
                        textAlign: "left",
                        color: "#8590a3",
                        marginRight: "5px",
                      }}
                    >
                      {t("Creator")}:
                    </span>
                    <>
                      {enterprise?.created_by?.image ? (
                        <img
                          src={
                            enterprise?.created_by.image.startsWith("http")
                              ? enterprise?.created_by.image
                              : `${Assets_URL}/${enterprise?.created_by.image}`
                          }
                          alt={enterprise?.created_by.full_name}
                          className="rounded-circle me-2"
                          style={{
                            width: "24px",
                            height: "24px",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: "24px",
                            height: "24px",
                            backgroundColor: "#f0f0f0",
                            color: "#666",
                          }}
                        >
                          <FaUser size={12} />
                        </div>
                      )}

                      <small className="text-muted">
                        {enterprise?.created_by?.full_name || "Unknown"}
                      </small>
                    </>
                  </div> */}

                  <div className="text-center mb-2">
                    <small className="text-muted d-flex align-items-center justify-content-center">
                      <FaTag className="me-1" />

                      {enterprise?.activity_area}
                    </small>
                  </div>
                  {/* Enterprise Information */}
                {enterprise?.country &&  <div className="text-center mb-2">
                    <small className="text-muted d-flex align-items-center justify-content-center">
                      <FaBuilding className="me-1" />

                      {enterprise?.country}
                    </small>
                  </div>
}
                  {/* User Count */}
                        <div className="text-center mb-3">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaUsers className="me-1" />
                            {enterprise?.users?.length || 0}{" "}
                            {enterprise?.users?.length > 1
                              ? t("team.members")
                              : t("team.member")}
                          </small>
                        </div>

                  {/* Render action buttons */}
                  {renderActionButtons(enterprise)}

                  {/* {!isClientView && item.status && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-14px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: getBorderColor(item),
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStatusText(item)}
                        </div>
                      )} */}
                </Card.Body>
              </Card>
            </div>
              {/* Dashboard component with filters at the beginning */}
            <div className="col-md-9">
              <Dashboard />
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
