import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import {
  getLoggedInUser,
  getUserRoleID,
} from "../../Utils/getSessionstorageItems";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CreateTeam = ({ setActiveTab,setShowCreateTeam,getTeams }) => {
  const roleID = getUserRoleID();

  const initialTeamData = {
    name: "",
    enterprise_id: "",
    description: "",
    logo: "",
  };
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState({ id: "" }); //enterprisse dropdown;
  const [allEnterprises, setAllEnterprises] = useState([]);
  const [team, setTeam] = useState({
    name: "",
    enterprise_id: "",
    description: "",
    logo: "",
  });
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setTeam({
      ...team,
      logo: file,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeam({
      ...team,
      [name]: value,
    });
  };

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    // For Master admin
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
        toast.error(
          t(
            error.response?.data?.errors ||
              error.response?.data?.errors[0] ||
              error.message
          )
        );
        // console.error("Error fetching data from server:", error);
      }
    }; //
    getAllEnterprises();
  }, []);
  useEffect(() => {
    const getEnterpriseData = async () => {
      const enterprise = JSON.parse(CookieService.get("enterprise"));
      setEnterprise(enterprise);
      setTeam({
        ...team,
        enterprise_id: enterprise?.id,
      });
    };
    getEnterpriseData();
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const createTeam = async () => {
    const token = CookieService.get("token");
    if (!team.name || !team.enterprise_id) {
      toast.error(t("messages.team.create.required"));
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("name", team.name);
    formData.append("enterprise_id", team.enterprise_id);
    formData.append("description", team.description);
    formData.append("logo", team.logo);

    // clear the form fields:
    setEnterprise({
      ...enterprise,
      id: "",
    });
    setTeam({
      ...team,
      name: "",
      enterprise_id: "",
      description: "",
      logo: "",
    });
    fileInputRef.current.value = "";
    setImagePreview("");
    // Post to API Endpoint:
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/teams`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        toast.success(t("messages.team.create.success"));
        setActiveTab("tab1");
        setShowCreateTeam(false);
        getTeams();
        setTeam(initialTeamData);
      }
    } catch (error) {
      toast.error(
        t(
          error.response?.data?.errors ||
            error.response?.data?.errors[0] ||
            error.message
        )
      );
      // console.error("Error creating contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    // setActiveTab("Equipes actives");
   setShowCreateTeam(false)
  };
  return (
    <div className="profile">
      <div className="container-fluid">
        <div className="card pt-5 pb-5">
          <div className="row justify-content-center">
            <div className="col-md-3">
              <div className="image-uploader mt-4">
                <div
                  className={`image-preview ${isHovered ? "hovered" : ""}`}
                  onMouseEnter={handleHover}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleButtonClick}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Uploaded" />
                  ) : (
                    <>
                      <div className="avatar"></div>
                      {isHovered && (
                        <div className="upload-text">Click to upload logo</div>
                      )}
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  name="logo"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Team.name")}</h6>
                </label>
                <small
                  style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}
                >
                  *
                </small>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Team.name")}
                  name="name"
                  value={team.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Team.Company")}</h6>
                </label>
                <small
                  style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}
                >
                  *
                </small>

                <select
                  className="select"
                  disabled={getUserRoleID() === 3 ? true : false}
                  name="enterprise_id"
                  value={team.enterprise_id}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    {t("Team.Company")}
                  </option>
                  {roleID !== 3 && roleID !== 4 ? (
                    allEnterprises?.map((enterprise) => (
                      <option key={enterprise.id} value={enterprise.id}>
                        {enterprise.name}
                      </option>
                    ))
                  ) : (
                    <option value={enterprise?.id}>{enterprise?.name}</option>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">
                  <h6>Description</h6>
                </label>
                <br />
                <textarea
                  rows="10"
                  name="description"
                  value={team.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-center mt-5 gap-3">
              {isLoading ? (
                <div style={{ width: "10%" }}>
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
                <button className="btn btn-primary" onClick={createTeam}>
                  {t("Team.Create a Team")}
                </button>
              )}
              <button className="btn btn-danger" onClick={goBack}>
                {t("Team.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
