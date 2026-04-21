import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Select } from "antd";
import { API_BASE_URL } from "../../../Apicongfig";
import { getUserRoleID } from "../../../Utils/getSessionstorageItems";

const EditParticipantModal = ({
  show,
  handleClose,
  participant,
  refreshedParticipants,
  refreshBudget
}) => {
  const [t] = useTranslation("global");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enterprise, setEnterprise] = useState("");
  const [post, setPost] = useState("");
  const [dailyRates, setDailyRates] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [enterpriseId, setEnterpriseId] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    if (participant) {
      setFirstName(participant?.first_name || "");
      setLastName(participant?.last_name || "");
      setEmail(participant?.email || "");
      setPhoneNumber(participant?.phone_number || "");
      setEnterprise(participant?.user?.enterprise?.name || "");
      setPost(participant?.post || "");
      setDailyRates(participant?.daily_rates || null);
      setCurrency(participant?.currency || "EUR");
      setEnterpriseId(participant?.user?.enterprise?.enterprise_id || "");
      setTeams(participant?.user?.teams || []);
      setSelectedTeams(
        participant?.user?.teams?.map((team) => ({
          label: team.name,
          value: team.id,
        })) || []
      );
    }
  }, [participant]);

  const handleSelectInputChange = (value) => {
    setSelectedTeams(value);
  };

  const [isUpdate, setIsUpdate] = useState(false);
  const updateGuest = async () => {
    setIsUpdate(true);
    const payload = {
      ...participant,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      enterprise: enterprise,
      post: post,
      daily_rates: Number(dailyRates),
      currency: currency,
      isCreator: 0,
      _method: "put",
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/participants/${participant?.id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status) {
        toast.success(t("invities.updateGuestMsg"));
        refreshedParticipants();
             if (typeof refreshBudget === "function") {
                           refreshBudget()
                  }
        handleClose();
      }
    } catch (error) {
      console.log("Error while updating the participant", error);
    } finally {
      setIsUpdate(false);
    }
  };

  const userId = parseInt(CookieService.get("user_id"));

  const hasUserId = participant?.user_id !== null;
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="edit-participant-modal"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="destination-modal-title">
          <div className="d-flex flex-column">
            <span>{!hasUserId ? t("editGuest") : t("invities.modifytaxAvg")}</span>
            <small
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "18.2px",
                textAlign: "left",
              }}
            >
              {!hasUserId && t("Update Guest Information")}
            </small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="form">
        {!hasUserId &&  <div className="row mt-3">
            <div className="name col-md-6">
              <label htmlFor="">{t("profile.fname")}</label>
              <input
                type="text"
                // placeholder={t("profile.fname")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                // disabled={
                //   participant?.user_id !== null &&
                //   participant?.user_id !== userId
                // }
              />
            </div>
            <div className="name col-md-6">
              <label htmlFor="">{t("profile.name")}</label>
              <input
                type="text"
                // placeholder={t("profile.name")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                // disabled={
                //   participant?.user_id !== null &&
                //   participant?.user_id !== userId
                // }
              />
            </div>
          </div>}
         {!hasUserId&& <div className="row mt-4">
            <div className="name col-md-6">
              <label htmlFor="">Email</label>
              <input
                type="text"
                // placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={
                  participant?.user_id !== null &&
                  participant?.user_id !== userId
                }
              />
            </div>
            <div className="name col-md-6">
              <label htmlFor="">{t("invities.phone")}</label>
              <PhoneInput
                international
                defaultCountry="FR"
                // placeholder="Enter phone number"
                value={phoneNumber}
                onChange={setPhoneNumber}
                // disabled={
                //   participant?.user_id !== null &&
                //   participant?.user_id !== userId
                // }
              />
            </div>
          </div>}
         {!hasUserId&& <div className="row mt-4">
            <div className="name col-md-6">
              <label htmlFor="">{t("invities.post")}</label>
              <input
                type="text"
                placeholder="Enter Post"
                value={post}
                onChange={(e) => setPost(e.target.value)}
                // disabled={
                //   participant?.user_id !== null &&
                //   participant?.user_id !== userId
                // }
              />
              {/* {participant?.user_id ? (
                <Select
                  className="react-select"
                  id="teamSelect"
                  isMulti
                  name="team_id"
                  options={teams?.map((team) => ({
                    label: team?.name,
                    value: team?.id,
                  }))}
                  value={selectedTeams}
                  onChange={handleSelectInputChange}
                  disabled={participant?.user_id !== userId}
                />
              ) : (
                <input
                  type="text"
                  placeholder={t("invities.team")}
                  value="Invité"
                  readOnly
                  disabled={participant?.user_id !== userId}
                />
              )} */}
            </div>
            <div className="name col-md-6">
              <label htmlFor="">{t("invities.enterprise")}</label>
              {participant?.user_id ? (
                <select
                  value={enterpriseId}
                  onChange={(e) => setEnterpriseId(e.target.value)}
                  disabled={participant?.user_id !== userId}
                >
                  <option value={enterpriseId}>{enterprise}</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={t("invities.enterprise")}
                  value={enterprise}
                  onChange={(e) => setEnterprise(e.target.value)}
                  // readOnly
                />
              )}
            </div>
          </div>}
          <div className="row mt-4">
            <div className="name col-md-6">
              <label htmlFor="">{t("invities.taxAvg")}</label>
              <div className="input-group">
                <input
                  type="number"
                  name="daily_rates"
                  value={dailyRates}
                  onChange={(e) => setDailyRates(e.target.value)}
                  className="form-control"
                  autoComplete="off"
                />
                <select
                  name="currency"
                  className="select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
        </form>
      </Modal.Body>
      <Modal.Footer className="destination-modal-footer">
        <button
          onClick={updateGuest}
          // disabled={
          //   participant?.user_id !== null && participant?.user_id !== userId
          // }
        >
          {isUpdate ? (
            <Spinner
              as="div"
              variant="light"
              size="sm"
              role="status"
              aria-hidden="true"
              animation="border"
              style={{
                margin: "2px 12px",
              }}
            />
          ) : (
            <>{t("updateGuestBtn")}</>
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditParticipantModal;
