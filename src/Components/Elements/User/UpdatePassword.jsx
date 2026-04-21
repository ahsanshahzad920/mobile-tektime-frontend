import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";
import {
  getUserRoleID,
  getLoggedInUser,
} from "../../Utils/getSessionstorageItems";
import { BiShow, BiHide } from "react-icons/bi";

function UpdatePassword({ onLogout }) {
  function validatePasswords(passwordString, confirmPasswordString) {
    if (passwordString !== confirmPasswordString) {
      return false;
    }
    if (passwordString.length < 8 && passwordString.length > 0) {
      return false;
    }
    return true;
  }
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
    nick_name: "",
    post: "",
    team_id: [],
    role_id: "",
    link: "",
    login: "",
    enterprise_id: "",
    job: "",
    user_id: "",
    confirmed_password: "",
  });
  const [t] = useTranslation("global");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userID = CookieService.get("user_id");

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);

  const [allTeams, setAllTeams] = useState([]);
  useEffect(() => {
    const getUserDataFromAPI = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        const user = response?.data?.data;
        if (user) {
          setResponseData(response?.data?.data);
          setEnterprise(user?.enterprise_id);
          setUserData({
            ...userData,
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            nick_name: user.nick_name,
            team: user.team,
            link: user.link,
            picture: user.image,
            login: user.login,
            enterprise: user.enterprise,
            post: user.post,
            user_id: user.user_id,
            role_id: user.role.id,
            team_id: user?.teams?.map((team) => team.id),
            enterprise_id: user.enterprise_id,
          });
          setSelectedTeams(
            response?.data?.data?.teams?.map((team) => ({
              value: team.id,
              label: team.name,
            }))
          );
        }
      } catch (error) {
        console.log("error", error);
        // toast.error(t(error?.response?.data?.errors[0] || error?.message));
      } finally {
        setLoading(false);
      }
    };
    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const filterredActiveTeams = response?.data?.data?.filter(
            (team) => team.status === "active"
          );
          setAllTeams(response?.data?.data);
          const teams = response?.data?.data?.filter(
            (team) => team?.enterprise?.id === response?.data?.enterprise?.id
          );
          setTeams(teams);
        }
      } catch (error) {
        console.log("error", error);

        // toast.error(t(error?.response?.data?.errors[0] || error?.message));
      }
    };
    getUserDataFromAPI();
    getTeams();
  }, [userID]);

  const [allEnterprises, setAllEnterprises] = useState([]);
  const [enterprise, setEnterprise] = useState("");
  // const localEnterprise = JSON.parse(CookieService.get("user"));
  // const [lEnt, setLEnt] = useState(localEnterprise);

  //for login user role.id

  const roleID = getUserRoleID();
  useEffect(() => {
    const getAllEnterprises = async () => {
      const token = CookieService.get("token");
      const requestURL = `${API_BASE_URL}/enterprises`;
      try {
        const response = await axios.get(requestURL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (roleID === 1) {
          // Master admin
          const allActiveEnterprises = response.data.data.filter(
            (ent) => ent.status === "active"
          );
          setAllEnterprises(allActiveEnterprises);
        } else if (roleID !== 1) {
          // Admin, Super-Admin, etc.
          const enterprisesCreatedByCurrentAdmin = response.data.data.filter(
            (enterprise) => enterprise.created_by.id === getLoggedInUser().id
          );
          setAllEnterprises(enterprisesCreatedByCurrentAdmin);
        }
      } catch (error) {
        // toast.error(t(error?.response?.data?.errors[0] || error?.message));
        console.error("Error fetching data from server:", error);
      }
    };
    getAllEnterprises();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setIsLoading(true);

    // Step 1: Validate the password
    const password = userData.password;
    const confirmed_password = userData.confirmed_password;
    const isValidPassword = validatePasswords(password, confirmed_password);

    // Step 2: Check if password and confirm password fields are empty
    if (!password || !confirmed_password) {
      toast.error(t("messages.user.profile.emptyPasswordError"));
      setIsLoading(false);
      return;
    }

    // Step 3: Check if passwords match and meet the length requirement
    if (!isValidPassword) {
      toast.error(t("messages.user.profile.passwordError"));
      setIsLoading(false);
      console.log("password message");
      return;
    }


    try {
      const token = CookieService.get("token");
      const teamIds = Array.isArray(userData.team_id)
        ? userData.team_id
        : userData.team_id.split(",").map((id) => parseInt(id.trim()));
      const payload = {
        name: userData.name,
        last_name: userData.last_name,
        nick_name: userData.nick_name,
        link: userData.link,
        post: userData.post,
        email: userData.email,
        enterprise_id: enterprise,
        team_id: teamIds,
        role_id: userData.role_id,
        password: userData.password,
        password_confirmation: userData.confirmed_password,
        _method: "put",
      };
      const response = await axios.post(
        `${API_BASE_URL}/users/${userID}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data?.success) {
        if (isValidPassword) {
          if (onLogout) {
            CookieService.clear();
            toast.success(t("messages.user.profile.updateSuccess"));
            navigate("/");
          }
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        toast.error(t("messages.user.profile.validationError"));
      } else {
        toast.error(t("messages.user.profile.updateError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };


  return (
    <>
      {loading ? (
        <Spinner animation="border" role="status" className="center-spinner" />
      ) : (
        <div className="profile mt-5">
          <div className="container-fluid pb-5" style={{ padding: "0 100px" }}>
            {/* <div className="row justify-content-center">
              {/* First Column */}


            {/* Second Column */}
            {/* </div> */}

            <div className="col justify-content-center align-items-center  d-flex justify-content-center align-items-center flex-column">
              <div className="col-md-5 mb-3 ">
                <label htmlFor="password" className="form-label pass-lab">
                  <h6>{t("profile.password")}</h6>
                  <button
                    readOnly
                    type="button"
                    className="btn btn-secondary"
                    aria-label={
                      passwordVisible ? "Hide Password" : "Show Password"
                    }
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? (
                      <BiHide color="#145CB8" />
                    ) : (
                      <BiShow color="#145CB8" />
                    )}
                  </button>
                </label>
                <input
                  placeholder={t("profile.password")}
                  type={passwordVisible ? "text" : "password"}
                  className="form-control "
                  value={userData.password}
                  id="password"
                  name="password"
                  onChange={(e) => {
                    setUserData({ ...userData, password: e.target.value });
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="col-md-5 mb-3">
                <label
                  htmlFor="confirm-password"
                  className="form-label pass-lab"
                >
                  <h6>{t("profile.cpassword")}</h6>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    aria-label={
                      passwordVisible1 ? "Hide Password" : "Show Password"
                    }
                    onClick={togglePasswordVisibility1}
                  >
                    {passwordVisible1 ? (
                      <BiHide color="#145CB8" />
                    ) : (
                      <BiShow color="#145CB8" />
                    )}
                  </button>
                </label>
                <input
                  placeholder={t("profile.cpassword")}
                  type={passwordVisible1 ? "text" : "password"}
                  name="password_confirmation"
                  className="form-control"
                  id="confirm-password"
                  value={userData.confirmed_password || ""}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      confirmed_password: e.target.value,
                    })
                  }
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-5">
              <Link to="/updatepassword">
                <button className="btn1" onClick={handleUpdateProfile}>
                  {t("Password.passwordvalidate")}
                </button>
              </Link>
              <button
                className="btn btn-danger"
                onClick={() => navigate("/profile")}
              >
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UpdatePassword;
