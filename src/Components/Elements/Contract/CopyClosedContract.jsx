import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";

const CopyClosedContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [t] = useTranslation("global");
  const initialContractData = {
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    description: "",
    type: [],
    mission_need: false,
    discussion_need: false,
    meeting_need: false,
    solution_need: false,
    action_need: false,
    casting_need: false,
    check_whatsapp: false,
  };
  const [contractData, setContractData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    description: "",
    type: [],
    mission_need: false,
    discussion_need: false,
    meeting_need: false,
    solution_need: false,
    action_need: false,
    casting_need: false,
    check_whatsapp: false,
  });
  const handleInputChange = (e) => {
    const { name, value, selectedOptions, type } = e.target;
    if (name === "type" && type === "select-multiple") {
      const values = Array.from(selectedOptions, (option) => option.value);
      setContractData({
        ...contractData,
        [name]: values,
      });

    } else if (type === "checkbox") {
      setContractData({
        ...contractData,
        [name]: e.target.checked,
      });
    } else {
      setContractData({
        ...contractData,
        [name]: value,
      });
    }
  };

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getDataFromId = async () => {
      try {
        setLoading(true);
        const token = CookieService.get("token");
        const { data } = await axios.get(`${API_BASE_URL}/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("dataaa", data?.data);
        if (data) {
          setContractData({
            name: data?.data?.name,
            start_date: data?.data?.start_date,
            end_date: data?.data?.end_date,
            no_of_licenses: data?.data?.no_of_licenses,
            price: data?.data?.price,
            currency: data?.data?.currency,
            payment_type: data?.data?.payment_type,
            description: data?.data?.description || "",
            type: data?.data?.type || [],
            mission_need: data?.data?.mission_need || false,
            discussion_need: data?.data?.discussion_need || false,
            meeting_need: data?.data?.meeting_need || false,
            solution_need: data?.data?.solution_need || false,
            action_need: data?.data?.action_need || false,
            casting_need: data?.data?.casting_need || false,
            check_whatsapp: data?.data?.check_whatsapp === 1 || data?.data?.check_whatsapp === true,
          });
        }
      } catch (error) {
        // console.error("Error fetching contract data:", error);
        toast.error(t("messages.dataFetchError"));
      } finally {
        setLoading(false);
      }
    };

    getDataFromId();
  }, [id]);

  const [isLoading, setIsLoading] = useState(false);
  const updateContract = async () => {
    const token = CookieService.get("token");
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/contracts/${id}/duplicate`,
        { ...contractData, check_whatsapp: contractData.check_whatsapp ? 1 : 0 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200 || response.status === 201) {

        toast.success(t("messages.contract.duplicate.success"));
        // contractData(initialContractData);
        navigate("/contract");
        // console.log("duplicate api response->", response);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        toast.error(error.response.data.errors);
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("messages.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const needsOptions = [
    { key: "mission_need", label: "Mission", icon: <img src="/Assets/sidebar_active_destination.svg" alt="mission" width="24" /> },
    { key: "solution_need", label: "Solution", icon: <img src="/Assets/Tek.png" alt="solution" width="24" /> },
    { key: "meeting_need", label: "Moment", icon: <img src="/Assets/sidebar_meeting_active.svg" alt="moment" width="24" /> },
    { key: "action_need", label: "Action", icon: <img src="/Assets/sidebar-action-active.svg" alt="action" width="24" /> },
    { key: "discussion_need", label: "Discussion", icon: <img src="/Assets/sidebar_active_discussion.svg" alt="discussion" width="24" /> },
    { key: "casting_need", label: "Casting", icon: <img src="/Assets/sidebar_team_active.svg" alt="casting" width="24" /> },
  ];

  const toggleNeed = (key) => {
    setContractData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        <div className="create">
          <div className="container-fluid">
            <div className="row justify-content-center ">
              <div className="col-md-5 mb-5">
                <div className="card p-5">
                  <div className="mb-4">
                    <label className="form-label">Que veux-tu?</label>
                    <small className="text-muted d-block mb-3" style={{ fontSize: "0.8rem" }}>
                      (choix multiples)
                    </small>
                    <div className="d-flex flex-column gap-3">
                      {needsOptions.map((option) => (
                        <div
                          key={option.key}
                          className={`d-flex align-items-center p-3 border rounded cursor-pointer ${contractData[option.key] === true
                            ? "bg-light-primary border-primary text-primary"
                            : "bg-white"
                            }`}
                          style={{
                            cursor: "pointer",
                            backgroundColor: contractData[option.key] === true ? "#f0f9ff" : "#fff",
                            borderColor: contractData[option.key] === true ? "#3aa5ed" : "#dee2e6",
                            borderWidth: contractData[option.key] === true ? "1.5px" : "1px",
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => toggleNeed(option.key)}
                        >
                          <div
                            className="me-3 fs-5"
                            style={{ color: contractData[option.key] === true ? "#3aa5ed" : "#6c757d" }}
                          >
                            {option.icon}
                          </div>
                          <div
                            className="flex-grow-1"
                            style={{
                              fontSize: "0.95rem",
                              lineHeight: "1.4",
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
                    <label className="form-label">
                      {t("newContract.name")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("newContract.name")}
                      name="name"
                      value={contractData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {" "}
                      {t("newContract.startDate")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      //   placeholder="Nom du Contrat"
                      name="start_date"
                      value={contractData.start_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {" "}
                      {t("newContract.endtDate")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      //   placeholder="Nom du Contrat"
                      name="end_date"
                      value={contractData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.paymentFrequency")}
                    </label>
                    <br />
                    <select
                      className="select"
                      name="payment_type"
                      value={contractData.payment_type}
                      onChange={handleInputChange}
                    >
                      <option value="0" selected disabled>
                        {t("newContract.paymentFrequency")}
                      </option>
                      <option value="Mensuelle (1 mois)">
                        {" "}
                        {t("newContract.paymentMethod.monthly")}
                      </option>
                      <option value="Trimestrielle (3 mois)">
                        {" "}
                        {t("newContract.paymentMethod.3month")}
                      </option>
                      <option value="Semestrielle  (6 mois)">
                        {" "}
                        {t("newContract.paymentMethod.6month")}
                      </option>
                      <option value="Annuelle (12 mois)">
                        {" "}
                        {t("newContract.paymentMethod.yearly")}
                      </option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">{t("newContract.packageType")}</label>
                    <br />
                    <Select
                      isMulti
                      name="type"
                      options={[
                        { value: "Discussion", label: "Discussion" },
                        { value: "Mission", label: "Mission" },
                        { value: "Tektime", label: "Tektime" },
                      ]}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder={t("newContract.packageTypeSelection")}
                      value={contractData.type.map((val) => ({
                        value: val,
                        label: val,
                      }))}
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
                    <label className="form-label">
                      {t("newContract.numberOfLicenses")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("newContract.numberOfLicenses")}
                      name="no_of_licenses"
                      value={contractData.no_of_licenses}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.price")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("newContract.price")}
                      name="price"
                      value={contractData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.currency")}
                    </label>
                    <br />
                    <select
                      className="select"
                      name="currency"
                      value={contractData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="0" disabled selected>
                        {t("newContract.currency")}
                      </option>
                      <option value="eur"> Euros</option>
                      <option value="usd"> Dollars</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <div className="form-check d-flex align-items-center gap-2">
                     <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        id="check_whatsapp_closed_copy"
                        name="check_whatsapp"
                        checked={contractData.check_whatsapp === true || contractData.check_whatsapp === 1}
                        onChange={handleInputChange}
                        style={{ cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label mb-0"
                        htmlFor="check_whatsapp_closed_copy"
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

                  <div className="d-flex justify-content-center gap-4 mt-4 ">
                    {isLoading ? (
                      <div style={{ width: "45%" }}>
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
                      <button
                        className="btn btn-primary"
                        onClick={updateContract}
                      >
                        {t("newContract.copy")}
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={goBack}>
                      {" "}
                      {t("newContract.cancel")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CopyClosedContract;
