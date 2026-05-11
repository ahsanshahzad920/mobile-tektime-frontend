import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";

function CreateContract({ setActiveTab }) {
  const [t] = useTranslation("global");

  const [packageOptions, setPackageOptions] = useState([]);

  useEffect(() => {
    const fetchPackageTypes = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/landing-pages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data && response.data.data.data) {
          const options = response.data.data.data.map((page) => ({
            value: page.id,
            label: page.gate_name,
          }));
          setPackageOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch landing pages", error);
      }
    };
    fetchPackageTypes();
  }, []);

  // 1. CHANGED: set defaults to false
  const initialContractData = {
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    type: [],
    mission_need: false,
    discussion_need: false,
    meeting_need: false,
    solution_need: false,
    action_need: false,
    casting_need: false,
    check_stripe: false,
    check_whatsapp: false,
    description: "",
  };

  // 2. CHANGED: set defaults to false in useState as well
  const [contractData, setContractData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    type: [],
    mission_need: false,
    discussion_need: false,
    meeting_need: false,
    solution_need: false,
    action_need: false,
    casting_need: false,
    check_stripe: false,
    check_whatsapp: false,
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked, selectedOptions } = e.target;
    if (name === "type" && type === "select-multiple") {
      const values = Array.from(selectedOptions, (option) => option.value);
      setContractData((prev) => ({
        ...prev,
        [name]: values,
      }));
    } else if (type === "checkbox") {
     setContractData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
    } else {
      setContractData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const createContract = async () => {
    const token = CookieService.get("token");
    const errors = {};

    if (contractData.name === "") {
      errors.name = t("messages.contract.create.nameFieldError");
      toast.error(t("messages.contract.create.nameFieldError"));
      return;
    }
    if (contractData.start_date === "") {
      errors.start_date = t("messages.contract.create.startDateFieldError");
      toast.error(t("messages.contract.create.startDateFieldError"));
      return;
    }
    if (contractData.end_date === "") {
      errors.end_date = t("messages.contract.create.endDateFieldError");
      toast.error(t("messages.contract.create.endDateFieldError"));
      return;
    }
    if (contractData.no_of_licenses === "") {
      errors.no_of_licenses = t("messages.contract.create.licenseFieldError2");
      toast.error(t("messages.contract.create.licenseFieldError2"));
      return;
    }
    if (contractData.price === "") {
      errors.price = t("messages.contract.create.priceFieldError");
      toast.error(t("messages.contract.create.priceFieldError"));
      return;
    }
    if (contractData.currency === "") {
      errors.currency = t("messages.contract.create.currencyFieldError");
      toast.error(t("messages.contract.create.currencyFieldError"));
      return;
    }
    // if (contractData.payment_type === "") {
    //   errors.payment_type = t("messages.contract.create.paymentTypeFieldError");
    //   toast.error(t("messages.contract.create.paymentTypeError"));
    //   return;
    // }
    // if (contractData.type.length === 0) {
    //   errors.type = "Le type de forfait est requis";
    //   toast.error("Le type de forfait est requis");
    //   return;
    // }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/contracts`,
        {
          ...contractData,
          check_stripe: contractData.check_stripe ? 1 : 0,
          check_whatsapp: contractData.check_whatsapp ? 1 : 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success(t("messages.contract.create.success"));
        setActiveTab("Abonnements en cours");
        setContractData(initialContractData);
      }
    } catch (error) {
      toast.error(error?.response?.data?.errors || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const goBack = () => {
    setActiveTab("Abonnements en cours");
  };

  const needsOptions = [
    { key: "mission_need", label: "Mission", icon: <img src="/Assets/sidebar_active_destination.svg" alt="mission" width="24" /> },
    { key: "solution_need", label: "Solution", icon: <img src="/Assets/Tek.png" alt="solution" width="24" /> },
    { key: "meeting_need", label: "Moment", icon: <img src="/Assets/sidebar_meeting_active.svg" alt="moment" width="24" /> },
    { key: "action_need", label: "Action", icon: <img src="/Assets/sidebar-action-active.svg" alt="action" width="24" /> },
    { key: "discussion_need", label: "Discussion", icon: <img src="/Assets/sidebar_active_discussion.svg" alt="discussion" width="24" /> },
    { key: "casting_need", label: "Casting", icon: <img src="/Assets/sidebar_team_active.svg" alt="casting" width="24" /> },
  ];

  // 3. CHANGED: Logic now simply toggles boolean value
  const toggleNeed = (key) => {
    setContractData((prev) => ({
      ...prev,
      [key]: !prev[key], // If true becomes false, if false becomes true
    }));
  };

  return (
    <div className="create">
      <div className="container-fluid">
        <div className="row justify-content-center ">
          <div className="col-md-5 mb-5">
            <div className="card py-5 px-3 px-md-0 px-lg-5">
              <div className="mb-4">
                <label className="form-label">Que veux-tu?</label>
                <small className="text-muted d-block mb-3" style={{ fontSize: "0.8rem" }}>
                  (choix multiples)
                </small>
                <div className="d-flex flex-column gap-3">
                  {needsOptions.map((option) => (
                    <div
                      key={option.key}
                      // 4. CHANGED: Check checks for true/false instead of 1/0
                      className={`d-flex align-items-center p-3 border rounded cursor-pointer ${
                        contractData[option.key] === true
                          ? "bg-light-primary border-primary text-primary"
                          : "bg-white"
                      }`}
                      style={{
                        cursor: "pointer",
                        // 4. CHANGED: Check checks for true/false
                        backgroundColor: contractData[option.key] === true ? "#f0f9ff" : "#fff",
                        borderColor: contractData[option.key] === true ? "#3aa5ed" : "#dee2e6",
                        borderWidth: contractData[option.key] === true ? "1.5px" : "1px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => toggleNeed(option.key)}
                    >
                      <div
                        className="me-3 fs-5"
                        // 4. CHANGED: Check checks for true/false
                        style={{ color: contractData[option.key] === true ? "#3aa5ed" : "#6c757d" }}
                      >
                        {option.icon}
                      </div>
                      <div
                        className="flex-grow-1"
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: "1.4",
                          // 4. CHANGED: Check checks for true/false
                          fontWeight: contractData[option.key] === true ? "500" : "400",
                        }}
                      >
                        {option.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">{t("newContract.name")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <input
                  required
                  type="text"
                  className="form-control"
                  placeholder={t("newContract.name")}
                  name="name"
                  value={contractData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.startDate")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <input
                  required
                  type="date"
                  className="form-control"
                  name="start_date"
                  value={contractData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.endDate")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <input
                  required
                  type="date"
                  className="form-control"
                  name="end_date"
                  value={contractData.end_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.paymentFrequency")}</label>
                {/* <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small> */}

                <br />
                <select
                  className="form-control"
                  name="payment_type"
                  value={contractData.payment_type}
                  onChange={handleInputChange}
                >
                  <option value="0" selected>
                    {t("newContract.paymentFrequency")}
                  </option>
                  <option value="Mensuelle (1 mois)"> {t("newContract.paymentMethod.monthly")}</option>
                  <option value="Trimestrielle (3 mois)"> {t("newContract.paymentMethod.3month")}</option>
                  <option value="Semestrielle  (6 mois)"> {t("newContract.paymentMethod.6month")}</option>
                  <option value="Annuelle (12 mois)"> {t("newContract.paymentMethod.yearly")}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">{t("newContract.packageType")}</label>
                {/* <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small> */}

                <br />
                <Select
                  isMulti
                  name="type"
                  options={packageOptions.length > 0 ? packageOptions : [
                    { value: "Discussion", label: "Discussion" },
                    { value: "Mission", label: "Mission" },
                    { value: "Tektime", label: "Tektime" },
                  ]}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder={t("newContract.packageTypeSelection")}
                  value={contractData.type.map((val) => {
                    const option = packageOptions.find((opt) => opt.value === val);
                    return option ? option : { value: val, label: val };
                  })}
                  onChange={(selectedOptions) => {
                    setContractData({
                      ...contractData,
                      type: selectedOptions ? selectedOptions.map((option) => option.value) : [],
                    });
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#dee2e6",
                      borderRadius: "0.375rem",
                    }),
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">{t("newContract.numberOfLicenses")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <input
                  required
                  min={1}
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  className="form-control"
                  placeholder={t("newContract.numberOfLicenses")}
                  name="no_of_licenses"
                  value={contractData.no_of_licenses}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.price")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <input
                  required
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  className="form-control"
                  placeholder={t("newContract.price")}
                  name="price"
                  value={contractData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">{t("newContract.currency")}</label>
                <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>*</small>

                <br />
                <select
                  className="form-control"
                  name="currency"
                  value={contractData.currency}
                  onChange={handleInputChange}
                >
                  <option value="0" selected>
                    {t("newContract.currency")}
                  </option>
                  <option value="usd"> Dollars</option>
                  <option value="eur"> Euros</option>
                </select>
              </div>

            <div className="mb-4">
  <div className="form-check d-flex align-items-center gap-2">
    <input
      className="form-check-input mt-0"
      type="checkbox"
      id="check_stripe_create"
      name="check_stripe"
      // FIX: Ensure it always gets a boolean true/false
      checked={Boolean(contractData.check_stripe)} 
      onChange={handleInputChange} 
      style={{ cursor: "pointer", width: "20px", height: "20px" }} // Size thora adjust kiya taake tick clear dikhe
    />
    <label 
      className="form-check-label mb-0" 
      htmlFor="check_stripe_create"
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {t("newContract.stripePayment")}
    </label>
  </div>
</div>

<div className="mb-4">
  <div className="form-check d-flex align-items-center gap-2">
    <input
      className="form-check-input mt-0"
      type="checkbox"
      id="check_whatsapp_create"
      name="check_whatsapp"
      checked={Boolean(contractData.check_whatsapp)} 
      onChange={handleInputChange} 
      style={{ cursor: "pointer", width: "20px", height: "20px" }}
    />
    <label 
      className="form-check-label mb-0" 
      htmlFor="check_whatsapp_create"
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      WhatsApp (Direct Message)
    </label>
  </div>
</div>

              <div className="mb-4">
                <label className="form-label">Description</label>
                <Editor
                  apiKey={process.env.REACT_APP_TINYMCE_API}
                  value={contractData.description}
                  init={{
                    height: 300,
                    menubar: false,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                    ],
                    toolbar:
                      "undo redo | formatselect | " +
                      "bold italic backcolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat | help",
                  }}
                  onEditorChange={(content) => {
                    setContractData({ ...contractData, description: content });
                  }}
                />
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                {isLoading ? (
                  <div style={{ width: "40%" }}>
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
                  <button className="btn btn-primary" onClick={createContract}>
                    {t("newContract.create")}
                  </button>
                )}

                <button className="btn btn-danger" onClick={goBack}>
                  {t("newContract.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateContract;