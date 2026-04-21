import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Use your preferred icon library

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaUserGroup } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import axios from "axios";
import { getUserRoleID } from "../../../../Utils/getSessionstorageItems";
import { useMeetings } from "../../../../../context/MeetingsContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FaGlobeEurope } from "react-icons/fa";

function PrivacyOptions({ setActiveTab, closeModal,meeting }) {
  const {
    formState,
    setFormState,
    handleInputBlur,
    // loading,
    isCompleted,
    validate,
    validateAndUpdate,
    isDuplicate,
    isUpdated,
    getMeeting,
    checkId,
    handleCloseModal,
    recurrentMeetingAPI,
    setSelectedTab,
    changePrivacy,
        loading

  } = useFormContext();
  const { getMeetings } = useMeetings();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const [visibility, setVisibility] = useState("participant only");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // const [loading, setLoading] = useState(false); // Loading state
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);
  const handleOptionChange = (e) => {
    const value = e.target.value;
    setVisibility(value);
    setFormState((prevState) => ({
      ...prevState,
      moment_privacy: value,
      moment_privacy_teams: selectedTeams?.map((team) => team.value), // Only send IDs in formState
    }));
  };

  // useEffect(() => {
  //   if (checkId) {
  //     // Show loading indicator before making the API call
  //     setIsLoading(true);

  //     // Call the API and fetch meeting data
  //     const fetchData = async () => {
  //       try {
  //         await getMeeting(checkId);
  //       } catch (error) {
  //         toast.error("Error fetching meeting data");
  //       } finally {
  //         // Hide the loading indicator once the API call is complete
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [checkId]);
  useEffect(() => {
    if (meeting) {
      setFormState((prevState) => ({
        ...prevState,
        moment_privacy: meeting.moment_privacy || "",
        moment_password: meeting.moment_password || "",
        moment_privacy_teams:
          meeting?.moment_privacy_teams_data?.map((item) => item.id) || [], // Only send IDs
      }));
      setSelectedTeams(
        meeting?.moment_privacy_teams_data?.map((team) => ({
          value: team.id,
          label: team.name,
        })) || []
      );
      setVisibility(meeting.moment_privacy || "participant only");
      setSelectedTab("tab8");
    }
  }, [meeting, setFormState]);

  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const userID = CookieService.get("user_id");

  useEffect(() => {
    const getUserDataFromAPI = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        const userData = response?.data?.data;
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        toast.error(t(error?.response?.data?.errors[0] || error?.message));
      }
    };
    // if(changePrivacy)return
    getUserDataFromAPI();
  }, [userID]);

  // const userTeams = user?.teams || []
  useEffect(() => {
    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const allTeams = response?.data?.data;
          const userTeams = user?.teams || [];
          const teams = allTeams?.filter((team) =>
            userTeams.some((team1) => team?.id === team1?.id)
          );
          setTeams(teams);
        }
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error?.message));
        // console.log("error message", error);
      } finally {
        // setLoading(false);
      }
    };
    if (user) {
      // if(changePrivacy)return
      getTeams();
    }
  }, [user]);
  useEffect(() => {
    if (user || teams || meeting) {
      setSelectedTeams(
        meeting?.moment_privacy_teams_data?.map((team) => ({
          value: team.id,
          label: team.name,
        })) || []
      );

      const userTeams = teams || [];
      setAvailableTeams(userTeams);
    }
  }, [user, teams, meeting]);
  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      moment_privacy_teams: selectedTeams?.map((item) => item.value),
    }));
  }, [selectedTeams, setFormState]);
  const handleTeamSelect = (teamId) => {
    const id = parseInt(teamId);
    const selectedTeam = availableTeams?.find((team) => team.id === id);

    // Add the team object to selectedTeams if it's not already selected
    if (selectedTeam && !selectedTeams?.some((team) => team.value === id)) {
      setSelectedTeams([
        ...selectedTeams,
        { value: id, label: selectedTeam.name },
      ]);
    }
  };

  const removeTeam = (teamId) => {
    // Remove the team from selectedTeams based on the `value` field
    setSelectedTeams(selectedTeams.filter((team) => team.value !== teamId));
  };

  const teamOptions = teams?.map((team) => ({
    value: team.id,
    label: team.name,
  }));
  // const handleSaveAndContinue = async () => {
  //   if (
  //     formState?.prise_de_notes == "Automatic" &&
  //     meeting?.location === "Google Meet" &&
  //     timeDifference !== null &&
  //     timeDifference < 30
  //   ) {
  //     toast.warning(t("UpmeetWarning"));
  //     return;
  //   }
  //   if (visibility === "password" && !formState.moment_password) {
  //     toast.error(t("Please enter a password")); // Show toast message
  //     return; // Prevent further execution
  //   }

  //   if (visibility === "team" && selectedTeams?.length === 0) {
  //     toast.error(t("Please select a team")); // Show toast message
  //     return; // Prevent further execution
  //   }

  //   try {
  //     if (isDuplicate || isUpdated) {
  //       await validateAndUpdate();
  //       // navigate(`/invite/${checkId}`, { state: {from: "meeting" } });
  //     } else {
  //       await validate();
  //       // navigate(`/invite/${checkId}`, { state: { from: "meeting" } });
  //     }
  //     // closeModal();
  //   } catch (error) {
  //     console.error("Error in saving and continuing:", error);
  //     toast.error("error while validating moment", error);
  //   }
  // };

  // Set the user's current time when the component mounts




  if (loading) {
    // Show a loading spinner while waiting for the API response
    return (
      <Spinner
        animation="border"
        role="status"
        className="center-spinner"
      ></Spinner>
    );
  }
  return (
    <div className="col-md-12 modal-height">
      <Row className="pt-0">
        <Col xs={12}>
          <p className="text-dark fs-6 fw-medium font-family-IBM Plex Sans mb-3 text-start">
            {t("profile.chooseVisibility")}
          </p>
        </Col>
        <Col xs={12}>
          <Form>
            <Row>
              <Col xs={12} md={6} className="mb-3">
                <Form.Group>
                  <Form.Check
        type="radio"
        label={
          <div className="d-flex align-items-center">
            <FaGlobeEurope style={{ 
              marginRight: '8px',
              color: '#6c757d', // muted color
              fontSize: '1.1rem'
            }} />
            {t("profile.public")}
          </div>
        }
        value="public"
        checked={visibility === "public"}
        onChange={handleOptionChange}
        className="privacy-moment"
      />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.publicSubText")}
                  </Form.Text>
                </Form.Group>

                {/* <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    label={t("profile.enterprise")}
                    value="enterprise"
                    checked={visibility === "enterprise"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.enterpriseSubText")}
                  </Form.Text>
                </Form.Group> */}
                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    // label={t("profile.enterprise")}
      label={
  <div className="d-flex align-items-center">
    <img
      src={meeting?.user?.enterprise?.logo?.startsWith("http") ? meeting?.user?.enterprise?.logo : Assets_URL + "/" + meeting?.user?.enterprise?.logo}
      alt="Enterprise Logo"
      style={{
        width: '20px',
        height: '20px',
        objectFit: 'contain',
        marginRight: '8px',
      }}
    />
    {t("profile.enterprise")}
  </div>
}

                    value="enterprise"
                    checked={visibility === "enterprise"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.enterpriseSubText")}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    label={t("profile.private")}
                    value="private"
                    checked={visibility === "private"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.privateSubText")}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    label={t("profile.password")}
                    value="password"
                    checked={visibility === "password"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.passwordSubText")}
                  </Form.Text>
                </Form.Group>
                {visibility === "password" && (
                  <Form.Group className="mt-3 position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder={t("profile.enterpassword")}
                      value={formState.moment_password}
                      onChange={(e) =>
                        setFormState((prevState) => ({
                          ...prevState,
                          moment_password: e.target.value,
                        }))
                      }
                    />
                    <span
                      className="position-absolute top-50 translate-middle-y"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        right: "18px",
                        cursor: "pointer",
                        padding: "0",
                        margin: "0",
                      }} // Adjusted right for proper horizontal placement
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible size={24} />
                      ) : (
                        <AiOutlineEye size={24} />
                      )}
                    </span>
                  </Form.Group>
                )}
                {/* <Form.Group className="mt-3">
                  <Form.Control
                    type="text"
                    placeholder={t("profile.passwordPlaceholder")}
                  />
                </Form.Group> */}
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Group>
                  <Form.Check
                    type="radio"
                    label={t("profile.membersOnly")}
                    value="tektime members"
                    checked={visibility === "tektime members"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.membersSubText")}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    label={t("profile.participantOnly")}
                    value="participant only"
                    checked={visibility === "participant only"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.participantSubText")}
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    label={t("profile.team")}
                    value="team"
                    checked={visibility === "team"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.TeamSubText")}
                  </Form.Text>
                </Form.Group>

                {visibility === "team" && (
                  <div className="mt-3 teams">
                    <DropdownButton
                      id="team-dropdown"
                      title={
                        <span className="d-flex align-items-center justify-content-between m-0">
                          <div>
                            <FaUserGroup className="me-2" />{" "}
                            {t("profile.teams")}
                          </div>
                          <span>
                            <GoPlus />
                          </span>
                        </span>
                      }
                      variant="outline-primary"
                      className="mb-3 select_team"
                      onSelect={handleTeamSelect} // Use `onSelect` here
                    >
                      {availableTeams?.map((team, index) => {
                        // Check if the current team is selected by matching the `id` with `value`
                        const isSelected = selectedTeams?.some(
                          (selectedTeam) => selectedTeam.value === team.id
                        );

                        return (
                          <Dropdown.Item
                            key={index}
                            eventKey={team?.id?.toString()} // Convert the ID to a string for Dropdown
                            disabled={isSelected} // Disable if already selected
                          >
                            {team?.name}
                          </Dropdown.Item>
                        );
                      })}
                    </DropdownButton>

                    <div className="all_teams">
                      <h6>
                        {selectedTeams?.length > 0 && selectedTeams?.length}{" "}
                        {t("profile.teamsAdded")}
                      </h6>
                      {selectedTeams?.length === 0 && (
                        <h5>{t("profile.noTeamsAdded")}</h5>
                      )}

                      {selectedTeams?.map((selectedTeam, index) => {
                        // Find the team details by ID
                        const team = availableTeams.find(
                          (team) => team.id === selectedTeam.value
                        );

                        // Render the team details
                        return team ? (
                          <React.Fragment key={index}>
                            <Row className="align-items-start mt-4">
                              <Col
                                xs={8}
                                className="d-flex justify-content-start"
                              >
                                <p className="mb-0 team-name">
                                  {index + 1}. &nbsp;
                                  <img
                                    src={
                                      team.logo
                                        ? Assets_URL + "/" + team.logo
                                        : "/Assets/tektime.png"
                                    } // Display the team's logo or fallback to a default image
                                    width="24px"
                                    height="30px"
                                    alt=""
                                    style={{ objectFit: "contain" }}
                                    className="img-fluid"
                                  />
                                  &nbsp; {team.name}
                                </p>
                              </Col>
                              <Col xs={4} className="text-end">
                                <Button
                                  size="sm"
                                  onClick={() => removeTeam(team.id)}
                                  style={{
                                    background: "#BB372F1A",
                                    borderRadius: "8px",
                                    border: "none",
                                    outline: "none",
                                  }}
                                >
                                  <RiDeleteBin5Line
                                    size={22}
                                    color={"#BB372F"}
                                  />
                                </Button>
                              </Col>
                            </Row>
                            <hr></hr>
                          </React.Fragment>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      {/* <div
        className={`modal-footer d-flex justify-content-end modal-save-button gap-4`}
      >
        {(isUpdated || isDuplicate) && (
          <Button
            variant="danger"
            // className="btn "
            onClick={handleSaveAndQuit}
            disabled={loadingQuit}
            style={{ padding: "9px" }}
          >
            {loadingQuit ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "white",
                    margin: "5px 82px",
                  }}
                />
              </>
            ) : (
              <>
                &nbsp;{t("meeting.formState.Save and Quit")}
               
              </>
            )}
          </Button>
        )}
        {isCompleted ? (
          <>
            {" "}
            <Button
              variant="dark"
              disabled
              style={{
                backgroundColor: "#3aa5ed",
                border: "none",
              }}
              className="moment-btn"
            >
              <Spinner
                as="div"
                variant="light"
                size="sm"
                role="status"
                aria-hidden="true"
                animation="border"
                style={{
                  margin: "2px 12px",
                }}
              />
            </Button>
          </>
        ) : (
          <button className={`btn moment-btn`} onClick={handleSaveAndContinue}>
            &nbsp;{t("meeting.formState.Save & exit")}
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4.125 13.125L9.375 18.375L19.875 7.125"
                  stroke="white"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>{" "}
          </button>
        )}
      </div> */}
    </div>
  );
}

export default PrivacyOptions;
