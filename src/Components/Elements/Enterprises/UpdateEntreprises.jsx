import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import { Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import countryList from "react-select-country-list";


const activityAreaOptions = [
  // "20industrie chinique",
  "Activities de services",
  "Agroalimentaire",
  "Art",
  "Artisanat",
  "Audiovisuel",
  "Automobile",
  "Communication",
  "Construction",
  "Culture",
  "Droit",
  "Energie",
  "Entreprise",
  "Environnement",
  "Immobilier",
  "Industrie",
  "Logistique",
  "Sante",
  "Sciences",
  "Securite",
  "Tourisme",
  "Transport",
];

const UpdateEntreprises = () => {
  const [loading, setLoading] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState({});
  const [contracts, setContracts] = useState([]); //contracts dropdown
  const [numberOfLicences, setNumberOfLicences] = useState(0); //number of licences
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const { id } = useParams();
  const navigator = useNavigate();
  const [t] = useTranslation("global");
  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const fetchEnterprisebyID = async (id) => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/enterprises/${id}`, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status) {
          setEnterpriseData(response?.data?.data);
          // setImagePreview(`${Assets_URL}/${response.data?.data?.logo}`);
           setImagePreview(response?.data?.data?.logo?.startsWith('http') ? response?.data?.data?.logo : `${Assets_URL}/${response?.data?.data?.logo}`);
        }
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const getContractsData = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/contracts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedContracts = response.data?.data?.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        setContracts(sortedContracts);
        // setContracts(response.data.data);
      } catch (err) {
        // console.log(err.message);
      }
    };
    getContractsData();
    fetchEnterprisebyID(id);

    // setLoading(false);
  }, [id]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      // New file selected
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setEnterpriseData({ ...enterpriseData, logo: file });
    } else {
      setImagePreview(enterpriseData.logo?.startsWith('http') ? enterpriseData?.logo : `${Assets_URL}/${enterpriseData.logo}`);
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

  const [isLoading, setIsLoading] = useState(false);
  const handleBtnUpdateClick = async (e) => {
    if (!enterpriseData.name) {
      toast.error(t("messages.enterprise.create.nameFieldError"));
      return;
    }
    if (!enterpriseData.activity_area) {
      toast.error(t("messages.enterprise.create.activityFieldError"));
      return;
    }
    if (!enterpriseData.country) {
      toast.error(t("messages.enterprise.create.countryField"));
      return;
    }
    if (!enterpriseData.contract_id) {
      toast.error(t("messages.enterprise.create.subscriptionFieldError"));
      return;
    }
    e.preventDefault();
    try {
      // setLoading(true);
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", enterpriseData.name);
      formData.append("activity_area", enterpriseData.activity_area);
      formData.append("country", enterpriseData.country);
      formData.append("description", enterpriseData.description || "");
      formData.append("contract_id", enterpriseData.contract_id);
      // formData.append("logo", enterpriseData.logo);
      formData.append("_method", "put");

      if (enterpriseData.logo instanceof File) {
        formData.append("logo", enterpriseData.logo);
      } else if (typeof enterpriseData.logo === "string") {
        formData.append("logo", enterpriseData.logo); // Send existing image URL
      }
      const response = await axios.post(
        `${API_BASE_URL}/enterprises/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success(t("messages.enterprise.update.success"));
        navigator("/enterprises");
      }
    } catch (error) {
      toast.error(
        t(
          error.response?.data?.errors ||
            error.response?.data?.errors[0] ||
            error.message
        )
      );
      // console.log(error.message);
    } finally {
      setIsLoading(true);
    }
  };

  return loading ? (
    <Spinner animation="border" variant="primary" className="center-spinner" />
  ) : (
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
                />
              </div>
            </div>
            {/* Name */}
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Entreprise.name")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Entreprise.name")}
                  value={enterpriseData?.name}
                  onChange={(e) => {
                    setEnterpriseData({
                      ...enterpriseData,
                      name: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Entreprise.subscription")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                {/* CONTRACT SELECT */}
                <select
                  className="select"
                  name="contracts"
                  value={
                    // first, find the contract that matches contract_id in enterprise  from the list of fetched contracts
                    // then, get the name of the contract
                    // if contract_id is null, then set value to empty string
                    // set value to the name of the contract
                    enterpriseData?.contract_id
                      ? contracts.find(
                          (obj) => obj.id === enterpriseData.contract_id
                        )?.name
                      : ""
                  }
                  onChange={(e) => {
                    const selectedContract = contracts.find(
                      (obj) => obj.name === e.target.value
                    );
                    setEnterpriseData({
                      ...enterpriseData,
                      contract_id: selectedContract.id,
                    });
                    setNumberOfLicences(selectedContract?.no_of_licenses);
                  }}
                >
                  <option value={""} disabled>
                    {t("Entreprise.subscription")}
                  </option>
                  {contracts.map((contract, index) => (
                    <option value={contract?.name} key={index}>
                      {contract.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Entreprise.Number of Licenses")}</h6>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Entreprise.Number of Licenses")}
                  value={
                    contracts.find(
                      (obj) => obj.id === enterpriseData.contract_id
                    )?.no_of_licenses || ""
                  }
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  <h6> {t("Entreprise.Activity area")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                <br />

                <select
                  className="select"
                  value={enterpriseData.activity_area}
                  onChange={(e) => {
                    setEnterpriseData({
                      ...enterpriseData,
                      activity_area: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    {t("Entreprise.Activity area")}
                  </option>
                  {activityAreaOptions.map((item) => {
                    return (
                      <option value={item} key={item}>
                        {item}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label">
                  <h6> {t("Entreprise.country name")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                <br />
                <select
                  className="select"
                  value={enterpriseData.country || ""} 
                  name="country"
                  onChange={(e) => {
                    setEnterpriseData({
                      ...enterpriseData,
                      country: e.target.value,
                    });
                  }}
                >
                  <option value={""} disabled>
                    {t("Entreprise.country name")}
                  </option>
                  {options?.map((option) => (
                    <option key={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Description */}
            <div className="col-md-3">
              <label className="form-label">
                <h6>Description</h6>
              </label>
              <br />
              <textarea
                rows="10"
                defaultValue={enterpriseData.description}
                onChange={(e) => {
                  setEnterpriseData({
                    ...enterpriseData,
                    description: e.target.value,
                  });
                }}
              />
            </div>
            {/* BUTTONS */}
            <div className="d-flex justify-content-center mt-5 gap-3">
              {/* Update Button */}
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
                <button
                  className="btn btn-primary"
                  onClick={handleBtnUpdateClick}
                >
                  {t("Entreprise.Update company")}
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  navigator("/enterprises");
                }}
              >
                {t("Entreprise.cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEntreprises;
