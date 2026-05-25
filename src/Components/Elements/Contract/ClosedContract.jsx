import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdContentCopy, MdDetails, MdDeleteOutline, MdOutlineSettingsBackupRestore } from "react-icons/md";
import { BiDetail } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { set } from "immutable";
import NoContent from "../Meeting/NoContent";

const ClosedContract = ({ setActiveTab }) => {
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } = useHeaderTitle();
  const [contractData, setContractData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [t] = useTranslation("global");

  const handleDeleteContract = async (id) => {
    const token = CookieService.get("token");
    try {
      const response = await axios.delete(`${API_BASE_URL}/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response) {
        toast.success(t("messages.contract.delete.success"));
        getData();
      }
    } catch (error) {
      console.error("error - delete", error);
    }
  };

  const handleReadContract = (id) => {
    navigate(`/readContract/${id}`);
  };

  const handlelinkEnterprises = (id) => {
    navigate(`/ContractLinkEnterprises/${id}`, {
      state: { setActiveTab: "Abonnements clôturés" },
    });
  };

  const handleCopyClosedContract = (id) => {
    navigate(`/CopyClosedContract/${id}`);
  };

  const handleReactivate = async (id) => {
    const token = CookieService.get("token");
    try {
      const response = await axios.put(
        `${API_BASE_URL}/contracts/${id}/status`,
        { status: "active" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        toast.success(t("messages.contract.reactivate.success", "Contract reactivated successfully"));
        getData();
        setActiveTab("Abonnements en cours");
      }
    } catch (error) {
      toast.error(t("messages.contract.reactivate.error", "Failed to reactivate contract"));
    }
  };

  const getData = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/closed/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setContractData(response.data);
        setLoading(true);
      }
    } catch (error) {
      console.error("error message", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const sortedContracts =
    Array.isArray(contractData?.data) && contractData?.data?.length > 0
      ? [...contractData?.data].sort((a, b) => {
        if (a.id && b.id) {
          return b.id - a.id;
        }
        return 0;
      })
      : [];

  return (
    <div className="contract">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              sortedContracts.length === 0 ? <NoContent title="Closed Contract"/> :
              sortedContracts?.map((item, index) => (
                <div className="card mb-4" key={index}>
                  <div className="card-body">
                    <div className="cardbody">
                      <Table responsive>
                        <thead>
                          <tr>
                            <th className="table-head">{t("newContract.name")}</th>
                            <th className="table-head"> {t("newContract.startDate")}</th>
                            <th className="table-head"> {t("newContract.endDate")}</th>
                            <th className="table-head">Date de clôture</th>
                            <th className="table-head">{t("newContract.paymentFrequency")}</th>
                            <th className="table-head">Landing Pages</th>
                            <th className="table-head">{t("newContract.numberOfLicenses")}</th>
                            <th className="table-head">{t("newContract.price")}</th>
                            <th className="table-head">{t("newContract.numberOfCompanies")}</th>
                            <th className="table-head">Action</th>
                          </tr>
                        </thead>
                        <tbody style={{ padding: "10px 10px" }}>
                          <tr>
                            <td className="table-data activeteam-tabledata align-middle">{item.name}</td>
                            <td className="table-data activeteam-tabledata align-middle">{item.start_date}</td>
                            <td className="table-data activeteam-tabledata align-middle">{item.end_date}</td>
                            <td className="table-data activeteam-tabledata align-middle">
                              {(item?.updated_at || "").substring(0, 10)}
                            </td>
                            <td className="table-data activeteam-tabledata align-middle">{item.payment_type}</td>
                            <td className="table-data activeteam-tabledata align-middle">
                              {item?.landing_pages?.length > 0 ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {item.landing_pages.map((lp) => (
                                    <span
                                      key={lp.id}
                                      style={{
                                        fontSize: '0.72rem',
                                        backgroundColor: '#e0e7ff',
                                        color: '#4338ca',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {lp.gate_name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="table-data activeteam-tabledata align-middle">{item.no_of_licenses}</td>
                            <td className="table-data activeteam-tabledata align-middle">
                              {item.price}
                              {item?.currency === "Euro" ? "€" : "$"}
                            </td>
                            <td className="table-data activeteam-tabledata align-middle">{item?.enterprises?.length}</td>
                            <td className="table-data d-flex align-items-center mt-2">
                              <IoEyeOutline
                                size={"22px"}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setHeaderTitle([{
                                    titleText: 'Abonnements clôturés',
                                    link: '/contract'
                                  }, {
                                    titleText: item?.name,
                                    link: '/ContractLinkEnterprises/' + item?.id,
                                  }]);
                                  handlelinkEnterprises(item?.id)
                                }}
                              />
                              <div className="dropdown dropstart" style={{ position: "absolute" }}>
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  style={{ backgroundColor: "transparent", border: "none", padding: "0px" }}
                                >
                                  <BiDotsVerticalRounded color="black" size={"25px"} />
                                </button>
                                <ul className="dropdown-menu" style={{ top: "3rem !important" }}>
                                  <li>
                                    <a className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleReadContract(item?.id)}>
                                      <BiDetail size={"20px"} /> &nbsp; Details
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleCopyClosedContract(item?.id)}>
                                      <MdContentCopy size={"20px"} /> &nbsp; {t("newContract.action.Duplicate")}
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleReactivate(item?.id)}>
                                      <MdOutlineSettingsBackupRestore size={"20px"} /> &nbsp; Reactivate
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" style={{ cursor: "pointer" }} onClick={() => handleDeleteContract(item?.id)}>
                                      <MdDeleteOutline size={"20px"} /> &nbsp; {t("newContract.action.delete")}
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Spinner animation="border" role="status" className="center-spinner"></Spinner>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClosedContract;
