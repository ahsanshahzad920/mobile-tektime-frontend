
import CookieService from "../../../../Utils/CookieService";
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
import { FaUserGroup, FaBriefcase } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import axios from "axios";
import { getUserRoleID } from "../../../../Utils/getSessionstorageItems";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { useSolutions } from "../../../../../context/SolutionsContext";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaBookOpen, FaBullseye, FaChalkboardTeacher, FaRobot, FaCode, FaBullhorn, FaShoppingCart, FaUserTie, FaSearch, FaChessKnight } from "react-icons/fa";
import { MdEventAvailable, MdOutlineSupport, MdWork, MdBrush, MdMessage, MdEvent } from "react-icons/md";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { AiOutlineAudit } from "react-icons/ai";

const roleOptionsData = [
  {
    emoji: "🧠",
    title: "Chef de projet / Product Owner",
    desc: "Je planifie, j'organise, je pilote.",
    value: "Project Manager / Product Owner",
  },
  {
    emoji: "💼",
    title: "Chargé de relation client / Commercial",
    desc: "Je gère les clients, je prépare les rendez-vous, je suis les actions et je m’assure que tout avance côté client comme en interne.",
    value: "Customer Relations Officer / Sales Representative",
  },
  {
    emoji: "🎯",
    title: "Manager / Responsable d'équipe",
    desc: "Je supervise les personnes, les objectifs, les résultats.",
    value: "Manager / Team Leader",
  },
  {
    emoji: "💻",
    title: "Développeur / Contributeur opérationnel",
    desc: "Je veux de la clarté sur mes tâches, mon temps, mes priorités.",
    value: "Developer / Operational Contributor",
  },
  {
    emoji: "🎓",
    title: "Formateur / Coach",
    desc: "J'organise des sessions, je produis du contenu, je suis des participants.",
    value: "Trainer / Coach",
  },
  {
    emoji: "🛠️",
    title: "Consultant / Freelance",
    desc: "Je facture mon temps, j'enchaîne les missions, je veux aller à l'essentiel.",
    value: "Consultant / Freelance",
  },
  {
    emoji: "🧪",
    title: "Autre / Explorateur",
    desc: "Je teste pour comprendre ce que TekTIME peut m'apporter.",
    value: "Other / Explorer",
  },
];

function PrivacyOptions({ setActiveTab, closeModal }) {
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#dee2e6",
      borderRadius: "0.375rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3aa5ed",
      },
      padding: "2px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f0f9ff" : "white",
      color: "#333",
      cursor: "pointer",
      padding: "6px 12px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      display: "none", // We handle selected items manually below the select
    }),
  };

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
  const [loading, setLoading] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [availableEnterprises, setAvailableEnterprises] = useState([]);
  const [selectedMissions, setSelectedMissions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedGates, setSelectedGates] = useState([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [missionTypeOptions, setMissionTypeOptions] = useState([]);
  console.log("missionTypeOptions",missionTypeOptions)
  const [gateOptions, setGateOptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [isLoadingMissionTypes, setIsLoadingMissionTypes] = useState(false);
  const [isLoadingGates, setIsLoadingGates] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const fetchMissionTypes = async () => {
      const token = CookieService.get("token");
      try {
        setIsLoadingMissionTypes(true);
        const { data } = await axios.get(`${API_BASE_URL}/mission-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.data) {
          const options = data.data.map((type) => ({
            value: type.id,
            label: type.title,
            logo_file_url: type.mission_icon ? (type.mission_icon.startsWith('http') ? type.mission_icon : `${Assets_URL}/${type.mission_icon}`) : type.logo_file_url,
            logo_key: type.logo,
          }));
          setMissionTypeOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch mission types", error);
      } finally {
        setIsLoadingMissionTypes(false);
      }
    };

    const fetchGates = async () => {
      const token = CookieService.get("token");
      try {
        setIsLoadingGates(true);
        const { data } = await axios.get(`${API_BASE_URL}/landing-pages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.data && data.data.data) {
          const options = data.data.data.map((gate) => ({
            value: gate.id,
            label: gate.gate_name,
          }));
          setGateOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch gates", error);
      } finally {
        setIsLoadingGates(false);
      }
    };

    const fetchContracts = async () => {
      const token = CookieService.get("token");
      try {
        const { data } = await axios.get(`${API_BASE_URL}/contracts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.data) {
          const options = data.data.map((contract) => ({
            value: contract.id,
            label: contract.name,
          }));
          setSubscriptionOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch contracts", error);
      }
    };

    const fetchRoles = async () => {
      const token = CookieService.get("token");
      try {
        setIsLoadingRoles(true);
        const { data } = await axios.get(`${API_BASE_URL}/role-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.data) {
          const options = data.data.map((role) => ({
            value: role.id,
            title: role.title,
            emoji: role.emoji,
            desc: role.description,
            role_icon: role.role_icon
          }));
          setRoleOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchMissionTypes();
    fetchGates();
    fetchContracts();
    fetchRoles();
  }, []);

  const roleString = CookieService.get("role");
  const role = roleString ? JSON.parse(roleString) : { id: 0 };
  const roleId = parseInt(role.id);

  const availableMissions = missionTypeOptions;

  const getIcon = (value, option = null) => {
    const commonStyle = { marginRight: 8 };
    const size = 20;

    if (option?.logo_file_url) {
      return (
        <img
          src={option.logo_file_url}
          alt=""
          style={{
            width: size,
            height: size,
            ...commonStyle,
            objectFit: "contain",
          }}
        />
      );
    }

    const iconKey = option?.logo_key || value;
    switch (iconKey) {
      case "Business opportunity":
        return <IoIosBusiness size={size} style={commonStyle} />;
      case "Study":
        return <FaBookOpen size={size} style={commonStyle} />;
      case "Audit":
        return <AiOutlineAudit size={size} style={commonStyle} />;
      case "Project":
        return <IoIosRocket size={size} style={commonStyle} />;
      case "Accompagnement":
        return <MdOutlineSupport size={size} style={commonStyle} />;
      case "Event":
        return <MdEventAvailable size={size} style={commonStyle} />;
      case "Formation":
        return <FaChalkboardTeacher size={size} style={commonStyle} />;
      case "Recruitment":
        return <MdWork size={size} style={commonStyle} />;
      case "Objective":
        return <FaBullseye size={size} style={commonStyle} />;
      case "Design": return <MdBrush size={size} style={commonStyle} />;
      case "Development": return <FaCode size={size} style={commonStyle} />;
      case "Marketing": return <FaBullhorn size={size} style={commonStyle} />;
      case "Sales": return <FaShoppingCart size={size} style={commonStyle} />;
      case "Consulting": return <FaUserTie size={size} style={commonStyle} />;
      case "Research": return <FaSearch size={size} style={commonStyle} />;
      case "Strategy": return <FaChessKnight size={size} style={commonStyle} />;
      case "Assistant Conversation":
        return <FaRobot size={size} style={commonStyle} />;
      case "Agenda":
        return <MdEvent size={size} style={commonStyle} />;
      case "Messagerie":
        return <MdMessage size={size} style={commonStyle} />;
      case "Absences":
        return <IoIosBusiness size={size} style={commonStyle} />;

      case "Other":
        return <span style={commonStyle}>✨</span>;

      default:
        return <span style={commonStyle}>✨</span>;
    }
  };

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setVisibility(value);

    // Reset local states for non-active categories
    if (value !== "team") setSelectedTeams([]);
    if (value !== "enterprise") setSelectedEnterprises([]);
    if (value !== "missions") setSelectedMissions([]);
    if (value !== "roles") setSelectedRoles([]);
    if (value !== "gates") setSelectedGates([]);
    if (value !== "subscriptions") setSelectedSubscriptions([]);

    setFormState((prevState) => ({
      ...prevState,
      solution_privacy: value,
      solution_privacy_teams: [],
      solution_privacy_enterprises: [],
      solution_privacy_missions: [],
      solution_privacy_roles: [],
      solution_privacy_gates: [],
      solution_privacy_subscriptions: [],
      solution_password:
        value === "password" ? prevState.solution_password : "",
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
          solution?.solution_privacy_team_data?.map((item) => item?.id) || [],
        solution_privacy_enterprises:
          solution?.solution_privacy_enterprises?.map((item) => item?.id) || [],
        solution_privacy_missions:
          solution?.solution_privacy_missions?.map((item) =>
            typeof item === "object" ? item?.id : item,
          ) || [],
        solution_privacy_roles:
          solution?.solution_privacy_roles?.map((item) =>
            typeof item === "object" ? item?.id : item,
          ) || [],
        solution_privacy_gates:
          solution?.solution_privacy_gates || [],
        solution_privacy_subscriptions:
          solution?.solution_privacy_subscriptions || [],
      }));
      setSelectedTeams(
        solution?.solution_privacy_team_data?.map((team) => ({
          value: team?.id,
          label: team?.name,
        })) || [],
      );
      // restore selected missions
      const privacyMissions = solution?.solution_privacy_missions || [];
      if (privacyMissions.length > 0) {
        const mapped = privacyMissions.map((mt) => {
          const idVal = typeof mt === "object" ? mt?.id : mt;
          const titleVal = typeof mt === "object" ? mt?.title || mt?.type : mt;
          const found = missionTypeOptions.find(
            (opt) => opt.value === idVal || opt.label === titleVal
          );
          return found ? found : { value: idVal, label: String(titleVal || idVal) };
        });
        setSelectedMissions(mapped);
      } else {
        setSelectedMissions([]);
      }

      const privacyEnts =
        solution?.solution_privacy_enterprises ||
        solution?.solution_privacy_enterprise_data ||
        [];
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

      const privacyRoles = solution.solution_privacy_roles || [];
      if (privacyRoles.length > 0) {
        const mapped = privacyRoles.map((val) => {
          const found = roleOptions.find((opt) => opt.value === val);
          return found
            ? found
            : { value: val, title: val, emoji: "", desc: "" };
        });
        setSelectedRoles(mapped);
      } else {
        setSelectedRoles([]);
      }

      const privacyGates = solution.solution_privacy_gates || [];
      if (privacyGates.length > 0) {
        const mapped = privacyGates.map((val) => {
          const found = gateOptions.find((opt) => opt.value === val);
          return found ? found : { value: val, label: String(val) };
        });
        setSelectedGates(mapped);
      } else {
        setSelectedGates([]);
      }

      const privacySubs = solution.solution_privacy_subscriptions || [];
      if (privacySubs.length > 0) {
        const mapped = privacySubs.map((val) => {
          const found = subscriptionOptions.find((opt) => opt.value === val);
          return found ? found : { value: val, label: String(val) };
        });
        setSelectedSubscriptions(mapped);
      } else {
        setSelectedSubscriptions([]);
      }

      setVisibility(solution.solution_privacy || "private");
    }
  }, [solution, setFormState, availableEnterprises, roleOptions, missionTypeOptions, gateOptions, subscriptionOptions]);

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
            userTeams.some((team1) => team?.id === team1?.id),
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
          if (roleId !== 1) {
            // Example: Filter for non-admins if needed, mirroring ActiveEnterprises
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

  const teamOptions = teams?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const removeEnterprise = (entId) => {
    setSelectedEnterprises(
      selectedEnterprises.filter((ent) => ent.value !== entId),
    );
  };

  const removeTeam = (teamId) => {
    setSelectedTeams(selectedTeams.filter((team) => team.value !== teamId));
  };

  const removeMissionType = (typeValue) => {
    setSelectedMissions(
      selectedMissions.filter((sm) => sm.value !== typeValue),
    );
  };

  const removeGate = (gateId) => {
    setSelectedGates(selectedGates.filter((g) => g.value !== gateId));
  };

  const removeSubscription = (subId) => {
    setSelectedSubscriptions(
      selectedSubscriptions.filter((s) => s.value !== subId),
    );
  };

  const removeRole = (roleValue) => {
    setSelectedRoles((prev) => prev.filter((role) => role.value !== roleValue));
  };

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      solution_privacy_roles: selectedRoles.map((role) => role.value),
      solution_privacy_gates: selectedGates.map((gate) => gate.value),
      solution_privacy_subscriptions: selectedSubscriptions.map((sub) => sub.value),
      solution_privacy_missions: selectedMissions.map((sm) => sm.value),
      solution_privacy_teams: selectedTeams.map((team) => team.value),
      solution_privacy_enterprises: selectedEnterprises.map((ent) => ent.value),
    }));
  }, [
    selectedRoles,
    selectedGates,
    selectedSubscriptions,
    selectedMissions,
    selectedTeams,
    selectedEnterprises,
    setFormState,
  ]);

  const handleSaveAndContinue = async () => {
    if (visibility === "team" && selectedTeams?.length === 0) {
      toast.error(t("Please select a team"));
      return;
    }
    if (visibility === "enterprise" && selectedEnterprises?.length === 0) {
      toast.error(t("Please select an enterprise"));
      return;
    }
    if (visibility === "missions" && selectedMissions.length === 0) {
      toast.error("Please select at least one mission.");
      return;
    }
    if (visibility === "roles" && selectedRoles.length === 0) {
      toast.error("Please select at least one role.");
      return;
    }
    if (visibility === "gates" && selectedGates.length === 0) {
      toast.error("Please select at least one gate.");
      return;
    }
    if (visibility === "subscriptions" && selectedSubscriptions.length === 0) {
      toast.error("Please select at least one subscription.");
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
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id="public"
                    name="solution_privacy"
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

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="enterprise"
                    name="solution_privacy"
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

                {visibility === "enterprise" && (
                  <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                    <Select
                      isMulti
                      options={availableEnterprises?.map((ent) => ({
                        value: ent.id,
                        label: ent.name,
                      }))}
                      className="basic-multi-select mb-3"
                      classNamePrefix="select"
                      placeholder={t("profile.selectEnterprise")}
                      value={selectedEnterprises}
                      onChange={setSelectedEnterprises}
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                    />

                    {selectedEnterprises?.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold mb-3 small text-uppercase">
                          {t("profile.enterprisesAdded")}
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedEnterprises.map((ent, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm transition-all"
                              style={{
                                fontSize: "0.85rem",
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <IoIosBusiness
                                className="me-2 text-warning"
                                size={16}
                              />
                              <span className="me-2 fw-medium text-dark">
                                {ent.label}
                              </span>
                              <button
                                type="button"
                                className="btn-close ms-1"
                                style={{
                                  fontSize: "0.6rem",
                                  backgroundSize: "0.5rem",
                                }}
                                onClick={() => removeEnterprise(ent.value)}
                              ></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="team"
                    name="solution_privacy"
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
                  <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                    <Select
                      isMulti
                      options={teamOptions}
                      className="basic-multi-select mb-3"
                      classNamePrefix="select"
                      placeholder={t("profile.teams")}
                      value={selectedTeams}
                      onChange={setSelectedTeams}
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                      formatOptionLabel={(team) => {
                        const teamData = availableTeams.find(
                          (t) => t.id === team.value,
                        );
                        return (
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                teamData?.logo
                                  ? Assets_URL + "/" + teamData.logo
                                  : "/Assets/tektime.png"
                              }
                              width="20px"
                              height="20px"
                              className="me-2 rounded-circle"
                              style={{ objectFit: "cover" }}
                              alt=""
                            />
                            <span>{team.label}</span>
                          </div>
                        );
                      }}
                    />

                    {selectedTeams?.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold mb-3 small text-uppercase">
                          {t("profile.teamsAdded")}
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedTeams.map((selectedTeam, index) => {
                            const team = availableTeams.find(
                              (t) => t.id === selectedTeam.value,
                            );
                            return (
                              <div
                                key={index}
                                className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm"
                                style={{
                                  fontSize: "0.85rem",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <img
                                  src={
                                    team?.logo
                                      ? Assets_URL + "/" + team.logo
                                      : "/Assets/tektime.png"
                                  }
                                  width="18px"
                                  height="18px"
                                  className="me-2 rounded-circle"
                                  style={{ objectFit: "cover" }}
                                  alt=""
                                />
                                <span className="me-2 fw-medium text-dark">
                                  {selectedTeam.label}
                                </span>
                                <button
                                  type="button"
                                  className="btn-close ms-1"
                                  style={{
                                    fontSize: "0.6rem",
                                    backgroundSize: "0.5rem",
                                  }}
                                  onClick={() => removeTeam(selectedTeam.value)}
                                ></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="tektime-members"
                    name="solution_privacy"
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
                    id="private"
                    name="solution_privacy"
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

              <Col xs={12} md={6} className="mb-3">
                {/* ── Missions (admin only) ──────────────────────────────── */}
                {roleId === 1 && (
                  <Form.Group className="mt-3">
                    <Form.Check
                      type="radio"
                      id="missions"
                      name="solution_privacy"
                      label={t("profile.missionTypes")}
                      value="missions"
                      checked={visibility === "missions"}
                      onChange={handleOptionChange}
                      className="privacy-moment"
                    />
                    <Form.Text
                      className="text-muted"
                      style={{ marginLeft: "1.5rem" }}
                    >
                      {t("profile.missionTypesSubText")}
                    </Form.Text>

                    {visibility === "missions" && (
                      <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                        <Select
                          isMulti
                          options={missionTypeOptions}
                          className="basic-multi-select mb-3"
                          classNamePrefix="select"
                          placeholder={t("profile.missionTypes")}
                          value={selectedMissions}
                          onChange={setSelectedMissions}
                          styles={customSelectStyles}
                          menuPortalTarget={document.body}
                          maxMenuHeight={250}
                          isLoading={isLoadingMissionTypes}
                          formatOptionLabel={(opt) => (
                            <div
                              className="d-flex align-items-center"
                              style={{ gap: 8 }}
                            >
                              {getIcon(opt.value, opt)}
                              <span>{opt.label}</span>
                            </div>
                          )}
                        />

                        {selectedMissions?.length > 0 && (
                          <div className="mt-3">
                            <h6 className="fw-bold mb-3 small text-uppercase">
                              {t("profile.missionsAdded")}
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedMissions.map((opt, index) => (
                                <div
                                  key={index}
                                  className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm"
                                  style={{
                                    fontSize: "0.85rem",
                                    border: "1px solid #e0e0e0",
                                  }}
                                >
                                  {getIcon(opt.value, opt)}
                                  <span className="me-2 fw-medium text-dark">
                                    {opt.label}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn-close ms-1"
                                    style={{
                                      fontSize: "0.6rem",
                                      backgroundSize: "0.5rem",
                                    }}
                                    onClick={() => removeMissionType(opt.value)}
                                  ></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Form.Group>
                )}

                {/* ── Gates ──────────────────────────────── */}
                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="gates"
                    name="solution_privacy"
                    label={t("profile-visibility.gates") || "Gates"}
                    value="gates"
                    checked={visibility === "gates"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile-visibility.gatesSubText") || "Restrict visibility to specific landing page gates"}
                  </Form.Text>

                  {visibility === "gates" && (
                    <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                      <Select
                        isMulti
                        options={gateOptions}
                        className="basic-multi-select mb-3"
                        classNamePrefix="select"
                        placeholder={t("profile-visibility.selectGates") || "Select gates"}
                        value={selectedGates}
                        onChange={setSelectedGates}
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        isLoading={isLoadingGates}
                      />

                      {selectedGates.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-bold mb-3 small text-uppercase">
                            {selectedGates.length} {t("profile-visibility.gatesAdded") || "Gates added"}
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedGates.map((gate, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm"
                                style={{
                                  fontSize: "0.85rem",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <span className="me-2 fw-medium text-dark">
                                  {gate.label}
                                </span>
                                <button
                                  type="button"
                                  className="btn-close ms-1"
                                  style={{
                                    fontSize: "0.6rem",
                                    backgroundSize: "0.5rem",
                                  }}
                                  onClick={() => removeGate(gate.value)}
                                ></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>

                {/* ── Contracts (Subscriptions) ──────────────────────────────── */}
                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="subscriptions"
                    name="solution_privacy"
                    label={t("profile-visibility.contracts") || "Contracts"}
                    value="subscriptions"
                    checked={visibility === "subscriptions"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile-visibility.contractsSubText") || "Restrict visibility to specific contracts"}
                  </Form.Text>

                  {visibility === "subscriptions" && (
                    <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                      <Select
                        isMulti
                        options={subscriptionOptions}
                        className="basic-multi-select mb-3"
                        classNamePrefix="select"
                        placeholder={t("profile-visibility.selectContracts") || "Select contracts"}
                        value={selectedSubscriptions}
                        onChange={setSelectedSubscriptions}
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                      />

                      {selectedSubscriptions.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-bold mb-3 small text-uppercase">
                            {selectedSubscriptions.length} {t("profile-visibility.contractsAdded") || "Subscriptions added"}
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedSubscriptions.map((sub, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm"
                                style={{
                                  fontSize: "0.85rem",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                <span className="me-2 fw-medium text-dark">
                                  {sub.label}
                                </span>
                                <button
                                  type="button"
                                  className="btn-close ms-1"
                                  style={{
                                    fontSize: "0.6rem",
                                    backgroundSize: "0.5rem",
                                  }}
                                  onClick={() => removeSubscription(sub.value)}
                                ></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>


                {/* ── Roles ──────────────────────────────── */}
                <Form.Group className="mt-3">
                  <Form.Check
                    type="radio"
                    id="roles"
                    name="solution_privacy"
                    label={t("profile.roles") || "Roles"}
                    value="roles"
                    checked={visibility === "roles"}
                    onChange={handleOptionChange}
                    className="privacy-moment"
                  />
                  <Form.Text
                    className="text-muted"
                    style={{ marginLeft: "1.5rem" }}
                  >
                    {t("profile.rolesSubText")}
                  </Form.Text>

                  {visibility === "roles" && (
                    <div className="mt-3" style={{ marginLeft: "1.5rem" }}>
                      <Select
                        isMulti
                        isLoading={isLoadingRoles}
                        options={roleOptions}
                        className="basic-multi-select mb-3"
                        classNamePrefix="select"
                        placeholder={
                          t("profile.noRolesAdded") || "Select roles"
                        }
                        value={selectedRoles}
                        onChange={setSelectedRoles}
                        menuPortalTarget={document.body}
                        getOptionLabel={(option) => option.title}
                        getOptionValue={(option) => option.value}
                        formatOptionLabel={(option) => (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              padding: "0px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              {option.role_icon ? (
                                <img
                                  src={option.role_icon.startsWith('http') ? option.role_icon : `${Assets_URL}/${option.role_icon}`}
                                  alt=""
                                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontSize: "1.1rem" }}>
                                  {option.emoji || "🧠"}
                                </span>
                              )}
                              <span
                                style={{
                                  fontWeight: "500",
                                  color: "#333",
                                }}
                              >
                                {option.title}
                              </span>
                            </div>
                            {option.desc && (
                              <p className="mb-0 x-small text-muted" style={{ marginLeft: "34px" }}>
                                {option.desc}
                              </p>
                            )}
                          </div>
                        )}
                        styles={customSelectStyles}
                      />

                      {selectedRoles.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-bold mb-3 small text-uppercase">
                            {selectedRoles.length} {t("profile-visibility.rolesAdded") || "Roles added"}
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {selectedRoles.map((role, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-center bg-white border px-3 py-1 rounded-pill shadow-sm"
                                style={{
                                  fontSize: "0.85rem",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                {role.role_icon ? (
                                  <img
                                    src={role.role_icon.startsWith('http') ? role.role_icon : `${Assets_URL}/${role.role_icon}`}
                                    alt=""
                                    className="me-2"
                                    style={{ width: 16, height: 16, objectFit: 'contain' }}
                                  />
                                ) : (
                                  <span className="me-2">{role.emoji || "🧠"}</span>
                                )}
                                <span className="me-2 fw-medium text-dark">
                                  {role.title}
                                </span>
                                <button
                                  type="button"
                                  className="btn-close ms-1"
                                  style={{
                                    fontSize: "0.6rem",
                                    backgroundSize: "0.5rem",
                                  }}
                                  onClick={() => removeRole(role.value)}
                                ></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
            onClick={handleSaveAndQuit}
            disabled={loadingQuit}
            style={{ padding: "9px" }}
          >
            {loadingQuit ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              t("meeting.formState.Save and Quit")
            )}
          </Button>
        )}
        <button
          className="btn moment-btn"
          onClick={handleSaveAndContinue}
          style={{ backgroundColor: "#3aa5ed", border: "none" }}
        >
          {isCompleted ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <>
              {t("meeting.formState.Save & exit")}
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
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PrivacyOptions;
