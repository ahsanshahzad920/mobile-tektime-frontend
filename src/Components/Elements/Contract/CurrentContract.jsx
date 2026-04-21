import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { BsPlay } from "react-icons/bs";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdContentCopy } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import NoContent from "../Meeting/NoContent";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";

function CurrentContract({ setActiveTab }) {
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const location = useLocation();
  const [contractData, setContractData] = useState([]);
  const [t] = useTranslation("global");
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleUpdateContract = (id) => {
    navigate(`/ModifierContract/${id}`);
  };

  const handlelinkEnterprises = (id) => {
    navigate(`/ContractLinkEnterprises/${id}`);
  };

  const handleCopyContract = (id) => {
    navigate(`/CopyContract/${id}`);
  };

  const getData = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        if (getUserRoleID() == 1) {
          setContractData(response?.data);
        } else {
          // Filter enterprises
          const filteredEnterprises = response?.data?.filter(
            (enterprise) =>
              enterprise.created_by.id.toString() ===
              CookieService.get("user_id").toString()
          );
          setContractData(filteredEnterprises);
        }
        setLoading(true);
      }
    } catch (error) {
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const handleChangeStatus = async (id) => {
    const token = CookieService.get("token");
    const currentDate = moment().format();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/contracts/${id}/status`,
        { status: "closed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        getData();
        setCurrentDate(currentDate);
        setActiveTab("Abonnements clôturés");
        // console.log("currentDate-->", currentDate);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
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
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              sortedContracts?.length == 0 ? (
                <NoContent title="Active Contract" />
              ) : (
                sortedContracts?.map((item, index) => (
                  <>
                    <div className="card mb-4" key={index}>
                      <div className="card-body">
                        <div className="cardbody">
                          <Table responsive>
                            <thead>
                              <tr>
                                <th className="table-head">
                                  {t("newContract.name")}
                                </th>
                                <th className="table-head">
                                  {" "}
                                  {t("newContract.startDate")}
                                </th>
                                <th className="table-head">
                                  {" "}
                                  {t("newContract.endDate")}
                                </th>
                                <th className="table-head">
                                  {t("newContract.paymentFrequency")}
                                </th>
                                <th className="table-head">
                                  Landing Pages
                                </th>
                                <th className="table-head">
                                  {t("newContract.numberOfLicenses")}
                                </th>
                                <th className="table-head">
                                  {t("newContract.price")}
                                </th>
                                <th className="table-head">
                                  {t("newContract.numberOfCompanies")}
                                </th>
                                <th className="table-head">Action</th>
                              </tr>
                            </thead>
                            <tbody style={{ padding: "10px 10px" }}>
                              <tr>
                                <td className="table-data activeteam-tabledata align-middle">{item.name}</td>
                                <td className="table-data activeteam-tabledata align-middle">
                                  {item.start_date}
                                </td>
                                <td className="table-data activeteam-tabledata align-middle">{item.end_date}</td>
                                <td className="table-data activeteam-tabledata align-middle">
                                  {item.payment_type}
                                </td>
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
                                <td className="table-data activeteam-tabledata align-middle">
                                  {item.no_of_licenses}
                                </td>
                                <td className="table-data activeteam-tabledata align-middle">
                                  {item.price}{" "}
                                  {item?.currency === "eur" ? "€" : "$"}
                                </td>
                                <td className="table-data activeteam-tabledata align-middle">
                                  {item?.enterprises?.length}
                                </td>
                                <td className="table-data d-flex align-items-center mt-2">
                                  <IoEyeOutline
                                    size={"22px"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setHeaderTitle([
                                        {
                                          titleText: "Abonnements en cours",
                                          link: "/contract",
                                        },
                                        {
                                          titleText: item?.name,
                                          link: `/ContractLinkEnterprises/${item?.id}`,
                                        },
                                      ]);
                                      // pushHeaderTitle();
                                      handlelinkEnterprises(item?.id);
                                    }}
                                  />
                                  <div
                                    className="dropdown dropstart"
                                    style={{
                                      position: "absolute",
                                      // marginLeft: "1rem",
                                    }}
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
                                      <BiDotsVerticalRounded
                                        color="black"
                                        size={"25px"}
                                      />
                                    </button>
                                    <ul
                                      className="dropdown-menu"
                                      style={{ top: "3rem !important" }}
                                    >
                                      <li>
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleUpdateContract(item?.id)
                                          }
                                        >
                                          <CiEdit size={"20px"} /> &nbsp;{" "}
                                          {t("newContract.action.update")}
                                        </a>
                                      </li>
                                      <li
                                        onClick={() =>
                                          handleCopyContract(item?.id)
                                        }
                                      >
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <MdContentCopy size={"20px"} /> &nbsp;
                                          {t("newContract.action.Duplicate")}
                                        </a>
                                      </li>
                                      <li
                                        onClick={() =>
                                          handleChangeStatus(item?.id)
                                        }
                                      >
                                        <a
                                          className="dropdown-item"
                                          style={{ cursor: "pointer" }}
                                        >
                                          <RiDeleteRow size={"20px"} /> &nbsp;
                                          {t("newContract.action.close")}
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                              {/* </>
                          ))} */}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </>
                ))
              )
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
    </div>
  );
}

export default CurrentContract;
