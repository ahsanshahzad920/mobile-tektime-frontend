import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";

const ReadContract = () => {
  const [activeTab, setActiveTab] = useState("");
  const { id } = useParams();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const initialContractData = {
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    type: "",
    check_stripe: false,

  };
  const [contractData, setContractData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    no_of_licenses: "",
    price: "",
    currency: "",
    payment_type: "",
    type: "",
    check_stripe: false,
  });

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getDataFromId = async () => {
      try {
        setLoading(true);
        const token = CookieService.get("token");
        const { data } = await axios.get(`${API_BASE_URL}/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data) {
          // console.log("dataaa", data?.data);
          setContractData({
            name: data?.data?.name,
            start_date: data?.data?.start_date,
            end_date: data?.data?.end_date,
            no_of_licenses: data?.data?.no_of_licenses,
            price: data?.data?.price,
            currency: data?.data?.currency,
            payment_type: data?.data?.payment_type,
            type: (() => {
              const rawType = data?.data?.gate?.name || data?.data?.package_type;
              if (Array.isArray(rawType)) return rawType;
              if (typeof rawType === 'string') {
                try {
                  const parsed = JSON.parse(rawType);
                  if (Array.isArray(parsed)) return parsed;
                } catch (e) { }
                return rawType; // Return as string if not valid JSON array
              }
              return "";
            })(),
            check_stripe: data?.data?.check_stripe === 1 || data?.data?.check_stripe === true,
          });
        }
      } catch (error) {
        toast.error(t("messages.dataFetchError"));
      } finally {
        setLoading(false);
      }
    };

    getDataFromId();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContractData({
      ...contractData,
      [name]: value,
    });
  };

  const navigateToClosedContract = () => {
    navigate("/contract");
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
        <div className="create">
          <div className="container-fluid">
            <div className="row justify-content-center ">
              <div className="col-md-5 mb-5">
                <div className="card p-5">
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.name")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      // placeholder={t("newContract.name")}
                      name="name"
                      value={contractData.name}
                      onChange={handleInputChange}
                      readOnly
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
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {" "}
                      {t("newContract.endDate")}
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      //   placeholder="Nom du Contrat"
                      name="end_date"
                      value={contractData.end_date}
                      onChange={handleInputChange}
                      readOnly
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
                      readOnly
                      disabled
                    >
                      {/* <option value="0" selected>
                    Fréquence de paiement
                  </option> */}
                      <option value="Mensuelle (1 mois)">
                        {" "}
                        Mensuelle (1 mois)
                      </option>
                      <option value="Trimestrielle (3 mois)">
                        {" "}
                        Trimestrielle (3 mois)
                      </option>
                      <option value="Semestrielle  (6 mois)">
                        {" "}
                        Semestrielle (6 mois)
                      </option>
                      <option value="Annuelle (12 mois)">
                        {" "}
                        Annuelle (12 mois)
                      </option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.packageType")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="type"
                      value={Array.isArray(contractData.type) ? contractData.type.join(", ") : contractData.type}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.currency")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nomber de licences"
                      name="no_of_licenses"
                      value={contractData.no_of_licenses}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">
                      {t("newContract.price")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Prix"
                      name="price"
                      value={contractData.price}
                      onChange={handleInputChange}
                      readOnly
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
                      readOnly
                      disabled
                    >
                      {/* <option value="0" selected>
                    Devise
                  </option> */}
                      <option value="eur"> Euros</option>
                      <option value="usd"> Dollars</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="check_stripe"
                        name="check_stripe"
                        checked={contractData.check_stripe}
                        readOnly
                        disabled
                      />
                      <label className="form-check-label" htmlFor="check_stripe">
                        {t("newContract.stripePayment")}
                      </label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-4 mt-4 ">
                    <button
                      className="btn btn-danger"
                      onClick={navigateToClosedContract}
                    >
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

export default ReadContract;