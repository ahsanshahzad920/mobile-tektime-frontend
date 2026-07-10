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

  const roleOptions = [
    { emoji: "🧠", title: "Chef de projet / Product Owner", desc: "Je planifie, j'organise, je pilote.", value: "Project Manager / Product Owner" },
    { emoji: "💼", title: "Chargé de relation client / Commercial", desc: "Je gère les clients, je prépare les rendez-vous, je suis les actions et je m’assure que tout avance côté client comme en interne.", value: "Customer Relations Officer / Sales Representative" },
    { emoji: "🎯", title: "Manager / Responsable d'équipe", desc: "Je supervise les personnes, les objectifs, les résultats.", value: "Manager / Team Leader" },
    { emoji: "💻", title: "Développeur / Contributeur opérationnel", desc: "Je veux de la clarté sur mes tâches, mon temps, mes priorités.", value: "Developer / Operational Contributor" },
    { emoji: "🎓", title: "Formateur / Coach", desc: "J'organise des sessions, je produis du contenu, je suis des participants.", value: "Trainer / Coach" },
    { emoji: "🛠️", title: "Consultant / Freelance", desc: "Je facture mon temps, j'enchaîne les missions, je veux aller à l'essentiel.", value: "Consultant / Freelance" },
    { emoji: "🧪", title: "Autre / Explorateur", desc: "Je teste pour comprendre ce que TekTIME peut m'apporter.", value: "Other / Explorer" },
  ];

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
    check_whatsapp: false,
    roles: [],
    trial_days: 0,
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
                return rawType; 
              }
              return "";
            })(),
            check_stripe: data?.data?.check_stripe === 1 || data?.data?.check_stripe === true,
            check_whatsapp: data?.data?.check_whatsapp === 1 || data?.data?.check_whatsapp === true,
            roles: (() => {
              const rawRoles = data?.data?.roles;
              if (Array.isArray(rawRoles)) return rawRoles;
              if (typeof rawRoles === "string") {
                try {
                  const parsed = JSON.parse(rawRoles);
                  if (Array.isArray(parsed)) return parsed;
                } catch (e) {}
                return [rawRoles];
              }
              return [];
            })(),
            trial_days: data?.data?.trial_days || 0,
          });
        }
      } catch (error) {
        toast.error(t("messages.dataFetchError"));
      } finally {
        setLoading(false);
      }
    };

    getDataFromId();
  }, [id, t]);

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
                    <label className="form-label">{t("profile.customizeRole") || "Roles"}</label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {Array.isArray(contractData.roles) && contractData.roles.length > 0 ? (
                        contractData.roles.map((roleValue, index) => {
                          const role = roleOptions.find((opt) => opt.value === roleValue);
                          return (
                            <div
                              key={index}
                              className="d-flex align-items-center gap-2 p-2 border rounded bg-light"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <span>{role ? role.emoji : ""}</span>
                              <span style={{ fontWeight: "500" }}>{role ? role.title : roleValue}</span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>Aucun rôle sélectionné</span>
                      )}
                    </div>
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
                      <option value="eur"> Euros</option>
                      <option value="usd"> Dollars</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Durée de test (en jours)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="trial_days"
                      value={contractData.trial_days}
                      readOnly
                    />
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="read_check_stripe"
                        name="check_stripe"
                        checked={contractData.check_stripe}
                        readOnly
                        disabled
                      />
                      <label className="form-check-label" htmlFor="read_check_stripe">
                        {t("newContract.stripePayment")}
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="read_check_whatsapp"
                        name="check_whatsapp"
                        checked={contractData.check_whatsapp}
                        readOnly
                        disabled
                      />
                      <label className="form-check-label" htmlFor="read_check_whatsapp">
                        WhatsApp (Direct Message)
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