import CookieService from '../../Utils/CookieService';
import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

/**
 * Master admin can create All Roles.
 * Super admin can create SuperAdmin, Admin and User.
 * Admin can create Admin and User.
 */

const masterAdminOptions = [
  { value: "1", label: "Master" },
  { value: "2", label: "Créateur" },
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];
const superAdminOptions = [
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];
const adminOptions = [
  { value: "3", label: "Administrateur" },
  { value: "4", label: "Guide" },
];

const languagesWithISO = [
  { name: "English", code: "en" },
  { name: "Spanish", code: "es" },
  { name: "French", code: "fr" },
  { name: "German", code: "de" },
  { name: "Chinese", code: "zh" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Hindi", code: "hi" },
  { name: "Arabic", code: "ar" },
  { name: "Portuguese", code: "pt" },
  { name: "Russian", code: "ru" },
  { name: "Italian", code: "it" },
  { name: "Dutch", code: "nl" },
  { name: "Swedish", code: "sv" },
  { name: "Norwegian", code: "no" },
  { name: "Turkish", code: "tr" },
  { name: "Bengali", code: "bn" },
  { name: "Urdu", code: "ur" },
  { name: "Vietnamese", code: "vi" },
  { name: "Polish", code: "pl" },
  { name: "Romanian", code: "ro" },
  { name: "Greek", code: "el" },
  { name: "Hungarian", code: "hu" },
  { name: "Czech", code: "cs" },
  { name: "Thai", code: "th" },
  { name: "Filipino", code: "fil" },
  { name: "Indonesian", code: "id" },
  { name: "Malay", code: "ms" },
  { name: "Finnish", code: "fi" },
  { name: "Hebrew", code: "he" },
  { name: "Danish", code: "da" },
  { name: "Icelandic", code: "is" },
  { name: "Serbian", code: "sr" },
  { name: "Croatian", code: "hr" },
  { name: "Slovak", code: "sk" },
  { name: "Bulgarian", code: "bg" },
  { name: "Ukrainian", code: "uk" },
  { name: "Persian", code: "fa" },
  { name: "Swahili", code: "sw" },
  { name: "Zulu", code: "zu" },
  { name: "Xhosa", code: "xh" },
  { name: "Amharic", code: "am" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Marathi", code: "mr" },
  { name: "Punjabi", code: "pa" },
  { name: "Gujarati", code: "gu" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Sinhala", code: "si" },
  { name: "Burmese", code: "my" },
  { name: "Khmer", code: "km" },
  { name: "Lao", code: "lo" },
  { name: "Mongolian", code: "mn" },
  { name: "Tajik", code: "tg" },
  { name: "Uzbek", code: "uz" },
  { name: "Kazakh", code: "kk" },
  { name: "Haitian Creole", code: "ht" },
  { name: "Albanian", code: "sq" },
  { name: "Bosnian", code: "bs" },
  { name: "Georgian", code: "ka" },
  { name: "Azerbaijani", code: "az" },
  { name: "Farsi", code: "fa" },
  { name: "Pashto", code: "ps" },
  { name: "Somali", code: "so" },
  { name: "Tigrinya", code: "ti" },
  { name: "Yoruba", code: "yo" },
  { name: "Igbo", code: "ig" },
];

const CreateUsers = ({ setActiveTab, }) => {
  const [loading, setLoading] = useState(false);
  // const { id } = useParams();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const location = useLocation();

  const preselectedTeam = location.state?.preselectedTeam || null;

  const [selectedLanguage, setSelectedLanguage] = useState("");

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    setUserData({
      ...userData,
      language: event.target.value, // Update userData with selected language
    });
  };
  const initialUserData = {
    name: "",
    last_name: "",
    email: "",
    role_id: "",
    post: "",
    enterprise_id: "",
    team_id: [],
    language: "",
    daily_rates: null,
    currency: "EUR",
  };
  const [userData, setUserData] = useState({
    name: "",
    last_name: "",
    email: "",
    role_id: "",
    post: "",
    team_id: [],
    language: "",
    daily_rates: null,
    currency: "EUR",
  });

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  // const [enterprise, setEnterprise] = useState({});
  const [roleID, setRoleID] = useState("");

  const [enterprise, setEnterprise] = useState(null);
  console.log("enterprise", enterprise);
  useEffect(() => {
    const sessionUser = JSON.parse(CookieService.get("user"));
    if (preselectedTeam) {
      setEnterprise(preselectedTeam.enterprise);

    }else{
      setEnterprise(sessionUser.enterprise);
    }
  }, []);

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSelectInputChange = (selectedOptions, action) => {
    if (action.name === "team_id") {
      const selectedTeams = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];

      setUserData({
        ...userData,
        team_id: selectedTeams,
      });
      setSelectedTeams(selectedOptions);
    }
  };

  const getData = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setTeams(response?.data?.data);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error message", error);
    }
  };

  const options1 = teams?.filter(
    (team) => parseInt(team?.enterprise_id) === parseInt(enterprise?.id)
  );
  const teamOptions = options1?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const createUser = async () => {
    try {
      setIsLoading(true);
      const updatedUserData = {
        ...userData,
        enterprise_id: enterprise?.id,
        daily_rates: Number(userData?.daily_rates),
        currency: userData?.currency,
      };
      const response = await axios.post(
        `${API_BASE_URL}/users`,
        updatedUserData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      setLoading(false);
      if (response.status === 201) {
        setLoading(true);
        setUserData(initialUserData);
        toast.success(t("messages.user.create.success"));
        toast.success(t("messages.user.create.mailSent"));
        // setActiveTab("Utilisateurs actifs");
        navigate('/Team')
        setSelectedTeams([]);
      }
    } catch (error) {
      // if 400 then show error message.
      if (error?.response?.status === 400) {
        toast.error(t(error?.response?.data?.errors[0] || error?.message));
      } else {
        // setShow(true);
        error?.response?.data?.errors?.forEach((error) => {
          toast.error(t("messages.user.create.error"));
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const USER_ROLE_ID = JSON.parse(CookieService.get("role")).id;
    setRoleID(USER_ROLE_ID);
    getData();
    // getEnterprise();
  }, [setActiveTab]);

  useEffect(() => {
    if (preselectedTeam && teamOptions?.length > 0) {
      const preselected = teamOptions.find(team => team.value === preselectedTeam?.id);
      if (preselected) {
        setSelectedTeams([preselected]);
        setUserData(prev => ({
          ...prev,
          team_id: [preselected.value],
        }));
      }
    }
  }, [preselectedTeam, teamOptions]);
  const goBack = () => {
    // setActiveTab("Utilisateurs actifs");
    navigate(-1)
  };
  return (
    <div className="profile">
      <div className="container-fluid">
        <>
          <div className="card pt-5 pb-5">
            <div className="row justify-content-center">
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.name")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <input
                    type="text"
                    name="last_name"
                    placeholder={t("user.name")}
                    onChange={handleInputChange}
                    value={userData.last_name}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.fname")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <input
                    type="text"
                    name="name"
                    placeholder={t("user.fname")}
                    onChange={handleInputChange}
                    value={userData.name}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>Email</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Email"
                    onChange={handleInputChange}
                    value={userData.email}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    <h6>{t("user.Profile")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <br />
                  <select
                    className="select"
                    name="role_id"
                    value={userData.role_id}
                    onChange={handleInputChange}
                  >
                    <option value="" selected>
                      {t("user.Profile")}
                    </option>
                    {getUserRoleID() === 1
                      ? masterAdminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : getUserRoleID() === 2
                      ? superAdminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : getUserRoleID() === 3
                      ? adminOptions.map((option) => (
                          <option value={option.value}>{option.label}</option>
                        ))
                      : null}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label">
                    <h6>{t("user.taxAvg")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>
                  <br />
                  <div className="input-group">
                    <input
                      type="number"
                      name="daily_rates"
                      onChange={handleInputChange}
                      value={userData.daily_rates}
                      className="form-control"
                      autoComplete="off"
                    />
                    <select
                      name="currency"
                      className="select"
                      value={userData.currency}
                      onChange={handleInputChange}
                      style={{ maxWidth: "100px" }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.company")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <input
                    type="text"
                    className="form-control"
                    value={enterprise?.name || ""}
                    onChange={handleInputChange}
                    name="enterprise_id"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.team")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <Select
                    className="react-select"
                    id="teamSelect"
                    isMulti
                    name="team_id"
                    options={teamOptions}
                    value={selectedTeams}
                    onChange={handleSelectInputChange}
                    isDisabled={!!preselectedTeam} // disables dropdown if preselectedTeam exists
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.job")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <input
                    type="text"
                    className="form-control"
                    name="post"
                    placeholder={t("user.job")}
                    onChange={handleInputChange}
                    value={userData.post}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    <h6>{t("user.language")}</h6>
                  </label>
                  <small
                    style={{
                      color: "red",
                      fontSize: "15px",
                      marginLeft: "2px",
                    }}
                  >
                    *
                  </small>

                  <br />
                  <select
                    className="select"
                    id="language"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    <option value="" disabled selected>
                      --{t("user.Select a language")}--
                    </option>

                    {languagesWithISO.map((language, index) => (
                      <option key={index} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-center mt-5 gap-3">
                {isLoading ? (
                  <>
                    <div style={{ width: "12%" }}>
                      <Button
                        variant="blue"
                        disabled
                        className="w-100"
                        style={{
                          backgroundColor: "#3aa5ed",
                          border: "none",
                        }}
                      >
                        <Spinner
                          as="span"
                          variant="light"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          animation="border"
                        />
                      </Button>
                    </div>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={createUser}>
                    {t("user.Generate creation link")}
                  </button>
                )}
                <button className="btn btn-danger" onClick={goBack}>
                  {t("user.cancel")}
                </button>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default CreateUsers;
