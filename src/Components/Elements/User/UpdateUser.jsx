import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

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
const inviteeOptions = [{ value: "5", label: "Invitee" }];
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

const UpdateUser = () => {
  const roleID = getUserRoleID();
  const { id } = useParams();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
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
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    setUserData({
      ...userData,
      language: event.target.value,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [user,setUser] = useState(null)

  // const [teamOptions, setTeamOptions] = useState([]);
  useEffect(() => {
    const fetchTeams = async () => {
      const token = CookieService.get("token");
  
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          const roleId = getUserRoleID();
          let filteredTeams = [];
  
          if (roleId === 1) {
            // Admin → show all teams
            filteredTeams = response.data?.data;
          } else if (roleId === 2) {
            // Role 2 → show teams created by logged-in user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id")
            );
          } else if (roleId === 3) {
            // Role 3 → show teams belonging to user's enterprise
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) =>
                team?.enterprise?.id ==
                JSON.parse(CookieService.get("enterprise"))?.id
            );
          } else {
            // Default → teams created by this user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id")
            );
          }
  
          // ✅ Convert teams to Select options
          const formattedOptions = filteredTeams.map((team) => ({
            value: team.id,
            label: team.name,
          }));
  
          setTeams(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error(
          t(error.response?.data?.errors?.[0] || "Failed to load teams.")
        );
      }
    };
  
      fetchTeams(); // Fetch only when modal opens
  }, []);
  
  useEffect(() => {
    const getuserFromId = async () => {
      try {
        setLoading(true);
        const token = CookieService.get("token");
        const { data } = await axios.get(`${API_BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data?.data)
    
        setSelectedLanguage(data.data?.language);
        setUserData({
          ...userData,
          name: data?.data?.name,
          last_name: data?.data?.last_name,
          email: data?.data?.email,
          role_id: data?.data?.role?.id,
          post: data?.data?.post,
          language: data?.data?.language,
          daily_rates: data?.data?.daily_rates,
          currency: data?.data?.currency,
          team_id: data?.data?.teams?.map((team) => team.id),
          enterprise_name: data?.data?.enterprise?.name,
          enterprise_id: data?.data?.enterprise?.id,
          teams: teams,
        });
      } catch (error) {
        // console.error("Error fetching User data:", error);
        toast.error(t(error.response?.data?.errors[0] || error.message));
      } finally {
        setLoading(false);
      }
    };

    // const getData = async () => {
    //   const token = CookieService.get("token");
    //   try {
    //     const response = await axios.get(`${API_BASE_URL}/teams`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     if (response.status === 200) {
    //       setTeams(response?.data?.data);
    //     }
    //   } catch (error) {
    //     toast.error(t(error.response?.data?.errors[0] || error.message));
    //   }
    // };
    // getData();
    getuserFromId();
  }, []);

  // New useEffect: Jab teams aur user dono load ho jayein, tab selectedTeams set karo
useEffect(() => {
  if (teams.length > 0 && user) {
    const userTeamIds = user.teams?.map((team) => team.id) || [];
    const matchedSelectedTeams = teams.filter((team) =>
      userTeamIds.includes(team.value)
    );
    setSelectedTeams(matchedSelectedTeams);

    // Update userData with team_id array
    setUserData((prev) => ({
      ...prev,
      team_id: userTeamIds,
    }));
  }
}, [teams, user]);
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

  // const teamOptions = teams.map((team) => ({
  //   value: team.id,
  //   label: team.name,
  // }));

  const [isLoading, setIsLoading] = useState(false);
  const updateUser = async () => {
    const formData = {
      ...user,
      name: userData.name,
      last_name: userData.last_name,
      email: userData.email,
      post: userData.post,
      role_id: userData.role_id,
      daily_rates: Number(userData.daily_rates),
      currency: userData.currency,
      team_id: userData.team_id,
      enterprise_id: userData.enterprise_id,
      language: userData.language,
      _method: "put",
    };
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/users/${id}`,
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        // console.log("Response from server:", userData);
        toast.success(response?.data?.message);
        navigate(-1);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating User:", error);
      toast.error("Error updating User. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify/user`,
        {
          id: id,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(t("EmailSent"));
        navigate(-1);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating User:", error);
      toast.error("Error updating User. Please try again.");
    }
  };

  return (
    <>
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <>
          <div className="profile">
            <div className="container-fluid">
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
                      {userData?.role_id === 5 ? (
                        <select
                          className="select"
                          name="role_id"
                          value={userData.role_id}
                          onChange={handleInputChange}
                        >
                          <option value="0" disabled>
                            {t("user.Profile")}
                          </option>
                          {inviteeOptions.map((option) => (
                            <option value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          className="select"
                          name="role_id"
                          value={userData.role_id}
                          onChange={handleInputChange}
                        >
                          <option value="0" disabled>
                            {t("user.Profile")}
                          </option>
                          {roleID === 1
                            ? masterAdminOptions.map((option) => (
                                <option value={option.value}>
                                  {option.label}
                                </option>
                              ))
                            : roleID === 2
                            ? superAdminOptions.map((option) => (
                                <option value={option.value}>
                                  {option.label}
                                </option>
                              ))
                            : roleID === 3
                            ? adminOptions.map((option) => (
                                <option value={option.value}>
                                  {option.label}
                                </option>
                              ))
                            : null}
                        </select>
                      )}
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
                        <h6>{t("user.company")} </h6>
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
                        value={userData?.enterprise_name}
                        readOnly
                        name="enterprise_name"
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
                        // options={
                        //   Array.isArray(teamOptions) && userData.teams?.length > 0
                        //     ? teamOptions
                        //     : []
                        // }
                        options={teams}
                        value={selectedTeams}
                        onChange={handleSelectInputChange}
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
                        placeholder="Job"
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
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerateLink}
                    >
                      {t("user.Generate creation link")}
                    </button>
                    {isLoading ? (
                      <div style={{ width: "8%" }}>
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
                    ) : (
                      <button className="btn btn-primary" onClick={updateUser}>
                        {t("user.updateUser")}
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => navigate(-1)}
                    >
                      {t("user.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UpdateUser;
