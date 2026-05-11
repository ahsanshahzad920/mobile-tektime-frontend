import CookieService from '../../Utils/CookieService';
import { IoMdSync } from "react-icons/io";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Table } from "react-bootstrap";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { CiEdit } from "react-icons/ci";
import { RiDeleteRow } from "react-icons/ri";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import NoContent from "../Meeting/NoContent";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";

// ── Custom Option with color dot ──────────────────────────────
const EnterpriseOption = (props) => {
  const { data, isDisabled } = props;
  return (
    <components.Option {...props}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <span style={{ fontSize: "14px" }}>{data.label}</span>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: data.color,
            display: "inline-block",
            flexShrink: 0,
          }}
          title={data.statusLabel}
        />
      </div>
      <div style={{ fontSize: "11px", color: data.color, marginTop: "2px" }}>
        {data.statusLabel}
      </div>
    </components.Option>
  );
};

// ── Custom SingleValue with color dot ────────────────────────
const EnterpriseSingleValue = (props) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: data.color,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        {data.label}
      </span>
    </components.SingleValue>
  );
};

const EnterprisesToUser = () => {
  const { title, pushHeaderTitle, popHeaderTitle, resetHeaderTitle } =
    useHeaderTitle();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  let { setActiveTab } = location.state || {};
  const [t] = useTranslation("global");

  const goBack = () => {
    popHeaderTitle();
    window.history.back();
  };

  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enterprises, setEnterprises] = useState([]);
  const roleID = getUserRoleID();

  // Modal state
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEnterpriseOption, setSelectedEnterpriseOption] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  // ── Helpers ────────────────────────────────────────────────
  const getEnterpriseColor = (enterprise) => {
    const limit = enterprise?.contract?.no_of_licenses || 0;
    const current = enterprise?.users?.length || 0;
    const remaining = limit - current;
    if (remaining >= 2) return "#28a745"; // Green for 2 or more
    if (remaining === 1) return "#ff8c00"; // Orange for exactly 1
    return "#dc3545"; // Red for 0 or less
  };

  const getEnterpriseStatusLabel = (enterprise) => {
    const limit = enterprise?.contract?.no_of_licenses || 0;
    const current = enterprise?.users?.length || 0;
    const remaining = limit - current;
    if (remaining <= 0) return t("Entreprise.noMorePlaces");
    if (remaining === 1) return t("Entreprise.onePlaceLeft");
    return t("Entreprise.available");
  };

  // Build react-select options from enterprises array
  const enterpriseOptions = enterprises.map((ent) => {
    const limit = ent?.contract?.no_of_licenses || 0;
    const current = ent?.users?.length || 0;
    const remaining = limit - current;
    return {
      value: ent.id,
      label: ent.name,
      color: getEnterpriseColor(ent),
      statusLabel: getEnterpriseStatusLabel(ent),
      isDisabled: remaining <= 0,
      remaining,
      limit,
      current,
    };
  });

  // ── API calls ──────────────────────────────────────────────
  const fetchEnterprises = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/enterprises`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setEnterprises(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching enterprises", error);
    }
  };

  const getEnterprisesTeams = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        setTeamUsers(response?.data?.team);
        setLoading(true);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getEnterprisesTeams();
    if (roleID === 1) {
      fetchEnterprises();
    }
  }, []);

  // ── Modal handlers ─────────────────────────────────────────
  const openChangeModal = (userId) => {
    setSelectedUserId(userId);
    setSelectedEnterpriseOption(null);
    setShowChangeModal(true);
  };

  const handleChangeEnterprise = async () => {
    if (!selectedEnterpriseOption) {
      toast.warning(t("Entreprise.changeEnterprise") + " ?");
      return;
    }
    if (selectedEnterpriseOption.remaining <= 0) {
      toast.error(t("Entreprise.noMorePlaces"));
      return;
    }

    const token = CookieService.get("token");
    setIsChanging(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/change-enterprise-of-user`,
        {
          user_id: selectedUserId,
          enterprise_id: selectedEnterpriseOption.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success(t("Entreprise.changeEnterprise") + " ✓");
        setShowChangeModal(false);
        getEnterprisesTeams();
      }
    } catch (error) {
      toast.error(t("error") || "Error");
    } finally {
      setIsChanging(false);
    }
  };

  // ── Table row handlers ─────────────────────────────────────
  const handleUpdateUser = (id) => {
    navigate(`/ModifierUser/${id}`);
  };

  const handleChangeStatus = async (id) => {
    const token = CookieService.get("token");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${id}/status`,
        { status: "closed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        getEnterprisesTeams();
      }
    } catch (error) {}
  };

  // ── react-select custom styles ────────────────────────────
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "10px",
      border: state.isFocused ? "1.5px solid #5882f2" : "1.5px solid #dee2e6",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(88,130,242,0.15)" : "none",
      padding: "2px 4px",
      fontSize: "14px",
      cursor: "text",
      "&:hover": { borderColor: "#5882f2" },
    }),
    option: (base, { isDisabled, isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#5882f2"
        : isFocused
        ? "#eef1ff"
        : "white",
      color: isDisabled ? "#aaa" : isSelected ? "white" : "#333",
      cursor: isDisabled ? "not-allowed" : "pointer",
      padding: "10px 14px",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      overflowY: "auto",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#aaa",
      fontSize: "14px",
    }),
  };

  // ──────────────────────────────────────────────────────────
  return (
    <div className="scheduled">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              <>
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="cardbody">
                      <h5>{teamUsers?.name}</h5>
                      {teamUsers?.users?.length === 0 ? (
                        <NoContent title={`User of ${teamUsers?.name}`} />
                      ) : (
                        teamUsers?.users.map((user, index) => (
                          <div key={user.id || index}>
                            <Table responsive>
                              <thead>
                                <tr>
                                  <th className="table-head">logo</th>
                                  <th className="table-head">{t("user.team")}</th>
                                  <th className="table-head">{t("user.name")}</th>
                                  <th className="table-head">{t("user.fname")}</th>
                                  <th className="table-head">{t("user.job")}</th>
                                  <th className="table-head">Email </th>
                                  <th className="table-head">{t("user.Profile")}</th>
                                  <th className="table-head">
                                    {" "}{t("user.Creation date")}{" "}
                                  </th>
                                  <th className="table-head">Action</th>
                                </tr>
                              </thead>
                              <tbody style={{ padding: "10px 10px" }}>
                                <tr key={index}>
                                  <td className="table-data">
                                    <img
                                      className="logo"
                                      width={50}
                                      height={50}
                                      src={
                                        teamUsers?.logo?.startsWith("http")
                                          ? teamUsers?.logo
                                          : `${Assets_URL}/${teamUsers?.logo}`
                                      }
                                      alt="logo"
                                    />
                                  </td>
                                  <td className="table-data">{teamUsers?.name}</td>
                                  <td className="table-data">{user.name}</td>
                                  <td className="table-data">{user.last_name}</td>
                                  <td className="table-data">{user?.post}</td>
                                  <td className="table-data">{user?.email}</td>
                                  <td className="table-data">
                                    {(() => {
                                      const roleName = user?.role?.name;
                                      if (roleName === "MasterAdmin") return "Master";
                                      if (roleName === "SuperAdmin") return "Créateur";
                                      if (roleName === "Admin") return "Administrator";
                                      return "Guide";
                                    })()}
                                  </td>
                                  <td className="table-data">
                                    {(user?.created_at).substring(0, 10)}
                                  </td>
                                  <td className="table-data d-flex align-items-center">
                                    <div
                                      className="dropdown dropstart"
                                      style={{ position: "absolute" }}
                                    >
                                      <button
                                        className="btn btn-secondary"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{
                                          backgroundColor: "transparent",
                                          border: "none",
                                          padding: "0px",
                                        }}
                                      >
                                        <BiDotsVerticalRounded color="black" size={"25px"} />
                                      </button>
                                      <ul
                                        className="dropdown-menu"
                                        style={{ top: "3rem !important" }}
                                      >
                                        <li>
                                          <a
                                            className="dropdown-item"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleUpdateUser(user?.id)}
                                          >
                                            <CiEdit size={"20px"} /> &nbsp;
                                            {t("Entreprise.modify")}
                                          </a>
                                        </li>
                                        <li onClick={() => handleChangeStatus(user?.id)}>
                                          <a
                                            className="dropdown-item"
                                            style={{ cursor: "pointer" }}
                                          >
                                            <RiDeleteRow size={"20px"} />{" "}
                                            &nbsp; {t("Team.Deactivate")}
                                          </a>
                                        </li>
                                        {roleID === 1 && (
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              style={{ cursor: "pointer" }}
                                              onClick={() => openChangeModal(user?.id)}
                                            >
                                              <IoMdSync size={"20px"} /> &nbsp;
                                              {t("Entreprise.changeEnterprise")}
                                            </a>
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                            <div className="user-status">
                              <span
                                className={`badge ${
                                  user.status === "active"
                                    ? "bg-success"
                                    : user.status === "pending_payment"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {user.status === "active"
                                  ? "compte validé"
                                  : user.status === "pending_payment"
                                  ? "Paiement en attente"
                                  : "compte en attente de validation"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-center mt-5">
                  <button className="btn btn-primary" onClick={goBack}>
                    {t("buttons.goBack")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Spinner
                  animation="border"
                  role="status"
                  className="center-spinner"
                ></Spinner>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Change Enterprise Modal ===== */}
      <Modal
        show={showChangeModal}
        onHide={() => setShowChangeModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #5882f2 0%, #0fb8cb 100%)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <Modal.Title
            style={{
              fontWeight: 600,
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IoMdSync size={22} />
            {t("Entreprise.changeEnterprise")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: "24px", overflow: "visible" }}>
          <label
            style={{
              fontWeight: 500,
              marginBottom: "10px",
              display: "block",
              color: "#444",
            }}
          >
            {t("Entreprise.name")}
          </label>

          {/* ── Searchable enterprise select ── */}
          <Select
            options={enterpriseOptions}
            value={selectedEnterpriseOption}
            onChange={(opt) => setSelectedEnterpriseOption(opt)}
            components={{
              Option: EnterpriseOption,
              SingleValue: EnterpriseSingleValue,
            }}
            styles={selectStyles}
            isOptionDisabled={(opt) => opt.isDisabled}
            placeholder={`🔍 ${t("Entreprise.changeEnterprise")}...`}
            isClearable
            isSearchable
            noOptionsMessage={() => t("No data") || "Aucun résultat"}
            menuPlacement="auto"
            menuShouldScrollIntoView={false}
          />

          {/* ── Legend ── */}
          <div
            className="d-flex gap-3 mt-3"
            style={{ fontSize: "12px", color: "#666" }}
          >
            {[
              { color: "#28a745", label: t("Entreprise.available") },
              { color: "#ff8c00", label: t("Entreprise.onePlaceLeft") },
              { color: "#dc3545", label: t("Entreprise.noMorePlaces") },
            ].map(({ color, label }) => (
              <span
                key={color}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: color,
                    display: "inline-block",
                  }}
                />
                {label}
              </span>
            ))}
          </div>

          {/* ── Preview card ── */}
          {selectedEnterpriseOption && (
            <div
              className="mt-3 p-3"
              style={{
                backgroundColor: "#f8f9fa",
                border: `1px solid ${selectedEnterpriseOption.color}`,
                borderLeft: `4px solid ${selectedEnterpriseOption.color}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>
                {selectedEnterpriseOption.label}
              </div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                👥 {selectedEnterpriseOption.current} / {selectedEnterpriseOption.limit}{" "}
                {t("Entreprise.Number of Licenses")}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: selectedEnterpriseOption.color,
                  fontWeight: 500,
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: selectedEnterpriseOption.color,
                    display: "inline-block",
                  }}
                />
                {selectedEnterpriseOption.statusLabel}
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "none", padding: "12px 24px 20px" }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowChangeModal(false)}
            style={{ borderRadius: "8px", padding: "8px 20px" }}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={handleChangeEnterprise}
            disabled={!selectedEnterpriseOption || isChanging}
            style={{
              borderRadius: "8px",
              padding: "8px 20px",
              background: "linear-gradient(135deg, #5882f2 0%, #0fb8cb 100%)",
              border: "none",
              fontWeight: 500,
            }}
          >
            {isChanging ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                ...
              </>
            ) : (
              t("Entreprise.changeEnterprise")
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EnterprisesToUser;
