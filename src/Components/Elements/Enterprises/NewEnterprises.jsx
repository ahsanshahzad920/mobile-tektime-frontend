import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import countryList from "react-select-country-list";

const activityAreaOptions = [
  { value: "14", label: "Activities de services" },
  { value: "2", label: "Agroalimentaire" },
  { value: "10", label: "Art" },
  { value: "15", label: "Artisanat" },
  { value: "6", label: "Audiovisuel" },
  { value: "20", label: "Automobile" },
  { value: "1", label: "Communication" },
  { value: "3", label: "Construction" },
  { value: "11", label: "Culture" },
  { value: "16", label: "Droit" },
  { value: "5", label: "Energie" },
  { value: "12", label: "Entreprise" },
  { value: "18", label: "Environnement" },
  { value: "21", label: "Immobilier" },
  { value: "4", label: "Industrie" },
  { value: "7", label: "Logistique" },
  { value: "13", label: "Sante" },
  { value: "17", label: "Sciences" },
  { value: "19", label: "Securite" },
  { value: "8", label: "Tourisme" },
  { value: "9", label: "Transport" },
];

const NewEnterprises = ({ eventKey, setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]); //contracts dropdown
  const [numberOfLicences, setNumberOfLicences] = useState(0); //number of licences
  const [enterpriseData, setEnterpriseData] = useState({
    name: "",
    activity_area: "",
    country:"",
    contract_id: "",
    description: "",
    logo: "",
  });
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [t] = useTranslation("global");
  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    const getContractsData = async () => {
      setLoading(true);
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/contracts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setLoading(false);
          const sortedContracts = response.data.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setContracts(sortedContracts);
          // console.log(contracts);
        }
      } catch (err) {
        // console.log(err.message);
        setLoading(false);
      }
    };
    getContractsData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setEnterpriseData({
      ...enterpriseData,
      logo: file,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEnterpriseData({
      ...enterpriseData,
      [name]: value,
    });
  };

  const handleSelectInputChange = (e) => {
    const selectedOptionIdex = e.target.selectedIndex;
    const selectedContract = contracts[selectedOptionIdex - 1]; // -1 because the first option is disabled
    setEnterpriseData({
      ...enterpriseData,
      contract_id: selectedContract.id,
    });
    setNumberOfLicences(selectedContract.no_of_licenses);
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
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
    setLoading(true);
    const formData = new FormData();
    formData.append("name", enterpriseData.name);
    formData.append("activity_area", enterpriseData.activity_area);
    formData.append("country", enterpriseData.country);
    formData.append("contract_id", enterpriseData.contract_id);
    formData.append("description", enterpriseData.description || "");
    formData.append("logo", enterpriseData.logo);
    try {
      setIsLoading(false);
      const response = await axios.post(
        `${API_BASE_URL}/enterprises`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success(t("messages.enterprise.create.success"));
        setActiveTab("Entreprises actives");
        setLoading(false);
      } else {
        toast.error("Something went wrong!", response.errors);
        setLoading(false);
      }
    } catch (error) {
      // console.log(error);
      toast.error(
        t("messages.enterprise.create.error") + " " + error.response.data.errors
      );
      setEnterpriseData({});
    } finally {
      setIsLoading(false);
      setLoading(false);
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
                  name="logo"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Entreprise.name")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Nom Entreprise"
                  value={enterpriseData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <h6>{t("Entreprise.subscription")}</h6>
                </label>
                <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small> 

                <br />
                <select
                  className="select"
                  name="contracts"
                  onChange={handleSelectInputChange}
                  defaultValue={""}
                >
                  <option value="" disabled>
                    {t("Entreprise.subscription")}
                  </option>
                  {contracts.map((contract, index) => (
                    <option value={contract?.no_of_licenses} key={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <h6> {t("Entreprise.Number of Licenses")}</h6>
                </label>
                {/* <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small>  */}

                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Entreprise.Number of Licenses")}
                  readOnly
                  value={numberOfLicences}
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
                  name="activity_area"
                  onChange={(e) => {
                    //log selected option text:
                    const selectedOptionText =
                      e.target.options[e.target.selectedIndex - 1].text; // -1 because the first option is disabled
                    setEnterpriseData({
                      ...enterpriseData,
                      activity_area: e.target.value,
                    });
                  }}
                >
                  <option value={""} disabled>
                    {t("Entreprise.Activity area")}
                  </option>
                  {activityAreaOptions.map((option) => (
                    <option key={option.value}>{option.label}</option>
                  ))}
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
            <div className="col-md-3">
              <label className="form-label">
                <h6>Description</h6>
              </label>
              {/* <small style={{ color: 'red',fontSize:'15px',marginLeft:'2px' }}>*</small>  */}

              <br />
              <textarea
                rows="10"
                value={enterpriseData.description}
                onChange={handleInputChange}
                name="description"
              />
            </div>
            <div className="d-flex justify-content-center mt-5 gap-3">
              {isLoading ? (
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
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {t("Entreprise.Create a company")}
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => setActiveTab("Entreprises actives")}
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

export default NewEnterprises;
