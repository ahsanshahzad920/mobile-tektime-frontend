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
import { toast } from "react-toastify";
import { RiDeleteBin5Line } from "react-icons/ri";
import {
  FaUserGroup,
  FaBriefcase,
} from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import axios from "axios";
import { getUserRoleID } from "../../../../Utils/getSessionstorageItems";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useSolutions } from "../../../../../context/SolutionsContext";
import { useNavigate } from "react-router-dom";

function PrivacyOptions({ setActiveTab, closeModal }) {
  const {
    formState,
    setFormState,
    handleInputBlur,
    // loading,
    isCompleted,
    validate,
    validateAndUpdate,
    solution,
    isDuplicate,
    isUpdated,
    getSolution,
    checkId,
    handleCloseModal,
  } = useSolutionFormContext();
  const {
    getDraftSolutions,
    getPrivateSolutions,
    getPublicSolutions,
    getEnterpriseSolutions,
    getTeamSolutions,
  } = useSolutions();
  const navigate = useNavigate();

  const [t] = useTranslation("global");
  const [visibility, setVisibility] = useState("private");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [availableEnterprises, setAvailableEnterprises] = useState([]);

  const roleString = CookieService.get("role");
  const role = roleString ? JSON.parse(roleString) : { id: 0 };
  const roleId = parseInt(role.id);
  const handleOptionChange = (e) => {
    const value = e.target.value;
    setVisibility(value);
    setFormState((prevState) => ({
      ...prevState,
      solution_privacy: value,
      solution_privacy_teams: selectedTeams?.map((team) => team.value), // Only send IDs in formState
      solution_privacy_enterprises: selectedEnterprises?.map((ent) => ent.value),
    }));
  };

  useEffect(() => {
    if (checkId) {
      getSolution(checkId);
    }
  }, [checkId]);
  useEffect(() => {
    if (solution) {
      setFormState((prevState) => ({
        ...prevState,
        solution_privacy: solution.solution_privacy || "",
        solution_password: solution.solution_password || "",
        solution_privacy_teams:
          solution?.solution_privacy_team_data?.map((item) => item?.id) || [], // Only send IDs
        solution_privacy_enterprises:
          solution?.solution_privacy_enterprises?.map((item) => item?.id) || [],
      }));
      setSelectedTeams(
        solution?.solution_privacy_team_data?.map((team) => ({
          value: team?.id,
          label: team?.name,
        })) || []
      );
      const privacyEnts = solution?.solution_privacy_enterprises || solution?.solution_privacy_enterprise_data || [];
      let mappedEnterprises = [];

      if (privacyEnts?.length > 0) {
        if (typeof privacyEnts[0] === "object") {
          mappedEnterprises = privacyEnts?.map((ent) => ({
            value: ent?.id,
            label: ent?.name,
          }));
        } else if (availableEnterprises?.length > 0) {
          mappedEnterprises = privacyEnts
            .map((id) => {
              const ent = availableEnterprises.find((e) => e.id === id);
              return ent ? { value: ent.id, label: ent.name } : null;
            })
            .filter(Boolean);
        }
      }

      if (mappedEnterprises.length > 0) {
        setSelectedEnterprises(mappedEnterprises);
      }
      setVisibility(solution.solution_privacy || "private");
    }
  }, [solution, setFormState, availableEnterprises]);

  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const userID = CookieService.get("user_id");

  const getUserDataFromAPI = async () => {
    // setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      const user = response?.data?.data;
      if (user) {
        setUser(user);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      // setLoading(false);
    }
  };
  const sessionUserString = CookieService.get("user");
  const sessionUser = sessionUserString ? JSON.parse(sessionUserString) : null;
  const userTeams = sessionUser?.teams || [];

  useEffect(() => {
    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const allTeams = response?.data?.data;
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
    getUserDataFromAPI();
    getTeams();
  }, [userID]);

  // Enterprise Logic
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  useEffect(() => {
    const fetchEnterprises = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/enterprises`, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status === 200) {
          const allEnterprises = response?.data?.data;
          // Filter if needed based on requirement, for now usage all
          let filtered = allEnterprises;
          if (roleId !== 1) { // Example: Filter for non-admins if needed, mirroring ActiveEnterprises
            const userId = CookieService.get("user_id");
            filtered = allEnterprises?.filter((ent) => {
              const creatorId = ent?.created_by?.id || ent?.created_by;
              return creatorId?.toString() === userId?.toString();
            });
          }
          setEnterprises(filtered);
          setAvailableEnterprises(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch enterprises", error);
      }
    };
    fetchEnterprises();
  }, [roleId]);

  const handleEnterpriseSelect = (entId) => {
    const id = parseInt(entId);
    const selectedEnt = availableEnterprises?.find((ent) => ent.id === id);

    if (selectedEnt && !selectedEnterprises?.some((ent) => ent.value === id)) {
      setSelectedEnterprises([
        ...selectedEnterprises,
        { value: id, label: selectedEnt.name },
      ]);
    }
  };

  const removeEnterprise = (entId) => {
    setSelectedEnterprises(selectedEnterprises.filter((ent) => ent.value !== entId));
  };

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      solution_privacy_enterprises: selectedEnterprises?.map((item) => item.value),
    }));
  }, [selectedEnterprises, setFormState]);
  useEffect(() => {
    if (user || teams || solution) {
      setSelectedTeams(
        solution?.solution_privacy_team_data?.map((team) => ({
          value: team.id,
          label: team.name,
        })) || []
      );

      const userTeams = teams || [];
      setAvailableTeams(userTeams);
    }
  }, [user, teams, solution]);
  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      solution_privacy_teams: selectedTeams?.map((item) => item.value),
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
  const handleSaveAndContinue = async () => {
    if (visibility === "password" && !formState.solution_password) {
      toast.error(t("Please enter a password")); // Show toast message
      return; // Prevent further execution
    }

    if (visibility === "team" && selectedTeams?.length === 0) {
      toast.error(t("Please select a team")); // Show toast message
      return; // Prevent further execution
    }

    if (visibility === "enterprise" && selectedEnterprises?.length === 0) {
      toast.error(t("Please select an enterprise"));
      return;
    }

    try {
      if (isDuplicate || isUpdated) {
        await validateAndUpdate();
      } else {
        await validate();
      }
      // closeModal();
    } catch (error) {
      console.error("Error in saving and continuing:", error);
      toast.error("error while validating solution", error);
    }
  };

  const handleSaveAndQuit = async () => {
    // if (validateForm()) {
    setLoadingQuit(true); // Show loader
    try {
      await handleInputBlur();
      // setActiveTab("tab2");
      handleCloseModal();
    } catch (error) {
      // Handle error (if any)
      toast.error("Error occurred");
    } finally {
      setLoadingQuit(false); // Hide loader
      navigate(`/solution/${checkId}`);

      // // await getSolutions();
      //  getPrivateSolutions();
      //  getPublicSolutions();
      //  getTeamSolutions();
      //  getEnterpriseSolutions();
      //  getDraftSolutions();
    }
    // }
  };

  return (
    <div className="col-md-12 p-1 p-4 modal-height">
      <Row className="pt-0">
        <Col xs={12}>
          <p className="text-dark fs-6 fw-medium font-family-IBM Plex Sans mb-3 text-start">
            {t("profile.solutionChooseVisibility")}
          </p>
        </Col>
        <Col xs={12}>
          <Form>
            <Row>
              <Col xs={12} md={6} className="mb-3">
                {(roleId === 1 || roleId === 2) && (
                  <Form.Group>
                    <Form.Check
                      type="radio"
                      label={t("profile.public")}
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
                )}

                {(roleId !== 4 || roleId !== 5) && (
                  <Form.Group className="mt-3">
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
                  </Form.Group>
                )}

                {visibility === "enterprise" && (
                  <div className="mt-3 teams">
                    <Dropdown
                      className="mb-3 select_team"
                      onSelect={handleEnterpriseSelect}
                    >
                      <Dropdown.Toggle
                        variant="outline-primary"
                        id="enterprise-dropdown"
                        className="w-100 text-start"
                      >
                        <span className="d-flex align-items-center justify-content-between m-0">
                          <div>
                            <FaBriefcase className="me-2" />
                            {t("profile.enterprises")}
                          </div>
                          <span>
                            <GoPlus />
                          </span>
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                          width: "100%",
                        }}
                      >
                        {availableEnterprises?.map((ent, index) => {
                          const isSelected = selectedEnterprises?.some(
                            (selectedEnt) => selectedEnt.value === ent.id
                          );
                          return (
                            <Dropdown.Item
                              key={index}
                              eventKey={ent?.id?.toString()}
                              disabled={isSelected}
                            >
                              {ent?.name}
                            </Dropdown.Item>
                          );
                        })}
                      </Dropdown.Menu>
                    </Dropdown>

                    <div className="all_teams" style={{ maxHeight: "200px", overflowY: "auto" }}>
                      <h6>
                        {selectedEnterprises?.length > 0 && selectedEnterprises?.length}{" "}
                        {t("profile.enterprisesAdded")}
                      </h6>
                      {selectedEnterprises?.length === 0 && (
                        <h5>{t("profile.noEnterprisesAdded")}</h5>
                      )}

                      {selectedEnterprises?.map((selectedEnt, index) => {
                        const ent = availableEnterprises.find(
                          (e) => e.id === selectedEnt.value
                        );
                        return ent ? (
                          <React.Fragment key={index}>
                            <Row className="align-items-start mt-4">
                              <Col xs={8} className="d-flex justify-content-start">
                                <p className="mb-0 team-name">
                                  {index + 1}. &nbsp;
                                  &nbsp; {ent.name}
                                </p>
                              </Col>
                              <Col xs={4} className="text-end">
                                <Button
                                  size="sm"
                                  onClick={() => removeEnterprise(ent.id)}
                                  style={{
                                    background: "#BB372F1A",
                                    borderRadius: "8px",
                                    border: "none",
                                    outline: "none",
                                  }}
                                >
                                  <RiDeleteBin5Line size={22} color={"#BB372F"} />
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
                    <Dropdown
                      className="mb-3 select_team"
                      onSelect={handleTeamSelect}
                    >
                      <Dropdown.Toggle
                        variant="outline-primary"
                        id="team-dropdown"
                        className="w-100 text-start"
                      >
                        <span className="d-flex align-items-center justify-content-between m-0">
                          <div>
                            <FaUserGroup className="me-2" /> {t("profile.teams")}
                          </div>
                          <span>
                            <GoPlus />
                          </span>
                        </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                          width: "100%",
                        }}
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
                      </Dropdown.Menu>
                    </Dropdown>

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
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
      <div
        className={`modal-footer d-flex justify-content-end modal-save-button gap-4`}
      >
        {isUpdated && (
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
          <button className={`btn moment-btn`} onClick={handleSaveAndContinue}
          style={{padding:'0px 10px '}}
          >
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
      </div>
    </div>
  );
}

export default PrivacyOptions;
