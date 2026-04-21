import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { Spinner, Table } from "react-bootstrap";
import { MdContentCopy } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";

import NoContent from "../Meeting/NoContent";
import { useTranslation } from "react-i18next";

function ContractLinkEntreprises() {
  const [t] = useTranslation("global");
  const { title, pushHeaderTitle, popHeaderTitle, resetHeaderTitle } =
    useHeaderTitle();
  const { id } = useParams();
  const location = useLocation();
  let { setActiveTab } = location.state || {};
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContractToTeam = (id) => {
    navigate(`/ContractToTeam/${id}`);
  };

  const goBack = () => {
    // window.history.back();
    popHeaderTitle();
    navigate("/contract", { state: { activeTab: "Abonnements clôturés" } });
  };
  const getData = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/enterprises/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        setLoading(true);
        setEnterprises(response.data.data);
      }
    } catch (error) {
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    const getData = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/contracts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status) {
          setLoading(true);
          setEnterprises(response.data.data);
        }
      } catch (error) {
        // console.log("error message", error);
      }
    };
    getData();
  }, []);
  const handleChangeStatus = async (id) => {
    const token = CookieService.get("token");
    // const currentDate = moment().format();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/enterprises/${id}/status`,
        { status: "closed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        getData();
        // setCurrentDate(currentDate);
        setActiveTab("Abonnements clôturés");
        // console.log("currentDate-->", currentDate);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const handleUpdateEnterprises = (id) => {
    navigate(`/ModifierEnterprises/${id}`);
  };
  return (
    <div className="scheduled">
      <div className="container-fluid px-3">
        <div className="row justify-content-center mt-5">
          <div className="col-md-12 py-3">
            {loading ? (
              enterprises?.enterprises?.length > 0 ? (
                enterprises?.enterprises?.map((item) => (
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="card mb-4">
                        <div className="card-body">
                          <div className="cardbody">
                            <Table responsive>
                              <thead>
                                <tr>
                                  <th className="table-head">Logo</th>
                                  <th className="table-head">Nom</th>
                                  <th className="table-head">Créateur</th>
                                  <th className="table-head">Abonnement</th>
                                  <th className="table-head">
                                    Nombre de licences
                                  </th>
                                  <th className="table-head">
                                    Secteur D’activite
                                  </th>
                                  <th className="table-head">
                                    Nombre de renouvellement
                                  </th>
                                  <th className="table-head">
                                    Date de la création
                                  </th>
                                  <th className="table-head">Date de début</th>
                                  <th className="table-head">Date de fin</th>
                                  <th className="table-head">Action</th>
                                </tr>
                              </thead>
                              <tbody style={{ padding: "10px 10px" }}>
                                <>
                                  <tr>
                                    <td className="table-data">
                                        <img
                                          className="logo"
                                          width={50}
                                          height={50}
                                          src={item.logo?.startsWith("http") ? item.logo : `${Assets_URL}/${item.logo}`}
                                          alt="logo"
                                        />
                                    </td>
                                    <td className="table-data">{item.name}</td>
                                    <td className="table-data">
                                      {item?.created_by?.name}
                                    </td>
                                    <td className="table-data">
                                      {enterprises?.name}
                                    </td>
                                    <td className="table-data">
                                      {enterprises?.no_of_licenses}
                                    </td>
                                    <td className="table-data">
                                      {item.activity_area}
                                    </td>
                                    <td className="table-data">0</td>
                                    <td className="table-data">
                                      {(item?.created_at).substring(0, 10)}
                                    </td>
                                    <td className="table-data">
                                      {enterprises?.start_date}
                                    </td>
                                    <td className="table-data">
                                      {enterprises?.end_date}
                                    </td>
                                    <td className="table-data d-flex align-items-center">
                                      <IoEyeOutline
                                        size={"22px"}
                                        style={{
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          pushHeaderTitle({
                                            titleText: item?.name,
                                            link: `/ContractToTeam/${item?.id}`,
                                          });
                                          handleContractToTeam(item?.id);
                                        }}
                                      />
                                      {/* <div
                                        className="dropdown dropstart"
                                        style={{
                                          position: "absolute",
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
                                                handleUpdateEnterprises(
                                                  item?.id
                                                )
                                              }
                                            >
                                              <CiEdit size={"20px"} /> &nbsp;
                                              Modifier
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
                                              <RiDeleteRow size={"20px"} />{" "}
                                              &nbsp; Désactiver
                                            </a>
                                          </li>
                                        </ul>
                                      </div> */}
                                    </td>
                                  </tr>
                                </>
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <NoContent title={`Enterprise of ${enterprises?.name}`} />
                </>
              )
            ) : (
              <div className="d-flex justify-content-center align-items-center">
                <Spinner
                  animation="border"
                  role="status"
                  className="spinner"
                ></Spinner>
              </div>
            )}
          </div>
          {/* {enterprises?.enterprises?.length > 0 && ( */}
          <div className="d-flex justify-content-center my-3">
            <button className="btn btn-primary" onClick={goBack}>
              Revenir à la page précédente
            </button>
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}

export default ContractLinkEntreprises;
