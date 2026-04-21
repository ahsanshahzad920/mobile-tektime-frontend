import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import {
  getLoggedInUser,
  getUserRoleID,
} from "../../Utils/getSessionstorageItems";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

const UpdateTeam = () => {
  const roleID = getUserRoleID();
  const { id } = useParams();
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState(); //enterprisse dropdown
  const [allEnterprises, setAllEnterprises] = useState([]);
  const [t] = useTranslation("global");

  const initialTeamData = {
    name: "",
    enterprise_id: "",
    description: "",
    logo: null,
  };
  const [team, setTeam] = useState({
    name: "",
    enterprise_id: "",
    description: "",
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setEnterprise(JSON.parse(CookieService.get("enterprise")));
    const getDataFromId = async () => {
      try {
        setLoading(true);
        const token = CookieService.get("token");
        const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeam({
          name: response?.data?.team?.name,
          enterprise_id:response?.data?.team?.enterprise_id,
          description: response?.data?.team?.description,
          logo: response?.data?.team?.logo || null,
        });
        setImagePreview(response?.data?.team?.logo?.startsWith('http') ? response?.data?.team?.logo :`${Assets_URL}/${response?.data?.team?.logo}`);
      } catch (error) {
        toast.error(t(error.response?.data?.errors[0] || error.message));
        // console.error("Error fetching Team data:", error);
        toast.error(t("messages.dataFetchError"));
      } finally {
        setLoading(false);
      }
    };

    getDataFromId();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeam({
      ...team,
      [name]: value,
    });
  };

  useEffect(() => {
    const getEnterprisesData = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/enterprises`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const enterprisesCreatedByCurrentAdmin = response.data.data.filter(
          (enterprise) => {
            return enterprise.created_by.id === getLoggedInUser()?.id;
          }
        );
        if (roleID === 1) {
          setAllEnterprises(response.data.data);
        } else if (roleID === 2) {
          setAllEnterprises(enterprisesCreatedByCurrentAdmin);
        }
      } catch (err) {
        // console.log(err.message);
      }
    };
    getEnterprisesData();
  }, []);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setTeam({
        ...team,
        logo: file,
      });
    } else {
      setImagePreview(team?.logo?.startsWith('http') ? team?.logo : `${Assets_URL}/${team.logo}`);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleUpdateTeam = async () => {
    const token = CookieService.get("token");

    if (
      team.name === "" ||
      team.description === "" ||
      team.enterprise_id === ""
    ) {
      toast.error(t("messages.emptyFields"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", team.name);
      formData.append("enterprise_id", team.enterprise_id);
      formData.append("description", team.description);
      formData.append("_method", "put");
      if (team.logo instanceof File) {
        formData.append("logo", team.logo);
        // formData.append("_method", "put");
      } else if (typeof team.logo === "string") {
        formData.append("logo", team.logo); // Send existing image URL
      }
      const response = await axios.post(
        `${API_BASE_URL}/teams/${id}`,
        formData,
        {
          headers: {
            Accept: "multipart/form-data",
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status) {
        toast.success(t("messages.team.update.success"));
        setTeam(initialTeamData);
        navigate("/Team");
      }
    } catch (error) {
      // console.error("Error updating team:", error);
      toast.error(t("messages.team.update.error"));
    } finally {
      setIsLoading(false);
    }
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

  const goBack = () => {
    window.history.back();
  };
  return (
    <>
      {loading ? (
        <>
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        </>
      ) : (
        <div className="profile">
          <div className="container-fluid">
            <div className="card pt-5 pb-5">
              <div className="row justify-content-center">
                <div className="col-lg-3 col-md-4">
                  <div className="image-uploader mt-4">
                    <div
                      className={`image-preview update-image-bg ${isHovered ? "hovered" : ""}`}
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
                            <div className="upload-text">
                              Click to upload logo
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      // readOnly
                      onChange={handleImageUpload}
                      name="logo"
                    />
                  </div>
                </div>
                <div className="col-lg-3 col-md-4">
                  <div className="mb-3">
                    <label className="form-label">
                      <h6>{t("Team.name")}</h6>
                    </label>
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
                    <select
                      className="select"
                      name="enterprise_id"
                      value={team.enterprise_id}
                      disabled={getUserRoleID() === 3 ? true : false}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        {t("Team.Company")}
                      </option>
                      {getUserRoleID() !== 3 ? (
                        allEnterprises?.map((enterprise) => (
                          <option key={enterprise.id} value={enterprise.id}>
                            {enterprise.name}
                          </option>
                        ))
                      ) : (
                        <option value={enterprise?.id}>
                          {enterprise?.name}
                        </option>
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
                      value={
                        team.description === "null" ? " " : team.description
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-5 gap-3">
                  {isLoading ? (
                    <>
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
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateTeam}
                    >
                      {t("Team.Update Team")}
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
      )}
    </>
  );
};

export default UpdateTeam;
