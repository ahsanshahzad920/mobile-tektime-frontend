import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdContentCopy, MdDetails } from "react-icons/md";
import { BiDetail } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { MdDeleteOutline } from "react-icons/md";
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
    // navigate("/ModifierContract");
    try {
      const response = await axios.delete(`${API_BASE_URL}/contracts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response) {
        toast.success(t("messages.contract.delete.success"));
        // console.log("delete contract response", response);
        getData();
      }
    } catch (error) {
      // console.log("error - delete", error);
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

  const getData = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/closed/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        // console.log("data", response);
        setContractData(response.data);
        setLoading(true);
      }
    } catch (error) {
      // console.log("error message", error);
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
                              <th className="table-head">Date de clôture</th>
                              <th className="table-head">
                                {t("newContract.paymentFrequency")}
                              </th>
                              <th className="table-head">Landing Pages</th>
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
                              <td className="table-data activeteam-tabledata align-middle activeteam-tabledata align-middle">{item.start_date}</td>
                              <td className="table-data activeteam-tabledata align-middle">{item.end_date}</td>
                              <td className="table-data activeteam-tabledata align-middle">
                                {(item?.updated_at).substring(0, 10)}
                              </td>
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
                                {item.price}
                                {item?.currency === "Euro" ? "€" : "$"}
                              </td>
                              <td className="table-data activeteam-tabledata align-middle">
                                {item?.enterprises?.length}
                              </td>
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
                                  }
                                  }
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
                                          handleReadContract(item?.id)
                                        }
                                      >
                                        <BiDetail size={"20px"} /> &nbsp;
                                        Details
                                      </a>
                                    </li>

                                    <li
                                      onClick={() =>
                                        handleCopyClosedContract(item?.id)
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
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        style={{ cursor: "pointer" }}
                                        onClick={() =>
                                          handleDeleteContract(item?.id)
                                        }
                                      >
                                        <MdDeleteOutline size={"20px"} /> &nbsp;
                                        {t("newContract.action.delete")}

                                      </a>
                                    </li>
                                    {/* <li >
                                      <a
                                        className="dropdown-item"
                                        style={{ cursor: "pointer" }}
                                      >
                                        <RiDeleteRow size={"20px"} /> &nbsp;
                                        Clôturer
                                      </a>
                                    </li> */}
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
            ) : (
              <>
                <Spinner
                  animation="border"
                  role="status"
                  className="center-spinner"
                ></Spinner>
              </>
            )}
            {/* <div className="card">
              <div className="card-body">
                <div className="cardbody">
                  <div className="row subtitle card2 py-4 px-4">
                    <div className="col-md-1 text-start obj">
                      <span>Nom</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>Debut</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>FIN</span>
                    </div>
                    <div className="col-md-1 text-center obj">
                      <span>Frequence</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Nombre de licences</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Nombre de licences</span>
                    </div>
                    <div className="col-md-2 text-center obj">
                      <span>Prix </span>
                    </div>
                    <div className="col-md-2 text-end obj">
                      <span>Actions</span>
                    </div>
                  </div>

                  {contractData &&
                    contractData?.data?.map((item, index) => (
                      <>
                        <div className="row py-4 pb-5 text-body-dark px-3">
                          <div className="col-md-1 text-start obj1">
                            <h6>{item.name}</h6>
                          </div>
                          <div className="col-md-1 text-center obj1">
                            <h6>{item.start_date}</h6>
                          </div>
                          <div className="col-md-1 text-center obj1">
                            <h6>{item.end_date}</h6>
                          </div>
                          <div className="col-md-1 text-center obj1">
                            <h6>{item.payment_type}</h6>
                          </div>
                          <div className="col-md-2 text-center obj1">
                            <h6>{item.no_of_licenses}</h6>
                          </div>
                          <div className="col-md-2 text-center obj1">
                            <h6>{item.currency}</h6>
                          </div>
                          <div className="col-md-2 text-center obj1">
                            <h6>{item.price}</h6>
                          </div>
                          <div className="col-md-2 text-end  d-flex justify-content-end ">
                            <div className="">
                              <IoEyeOutline
                                size={"22px"}
                                style={{ cursor: "pointer" }}
                                onClick={() => handlelinkEnterprises()}
                              />
                            </div>
                            <div className="dropdown dropstart">
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
                              <ul className="dropdown-menu">
                                <li>
                                  <a
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleUpdateContract()}
                                  >
                                    <CiEdit size={"20px"} /> &nbsp; Modifier
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <RiDeleteRow size={"20px"} /> &nbsp;
                                    Clôturer
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClosedContract;
