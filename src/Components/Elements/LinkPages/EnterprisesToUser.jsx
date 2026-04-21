import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { CiEdit } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { RiDeleteRow } from "react-icons/ri";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import NoContent from "../Meeting/NoContent";
import { useTranslation } from "react-i18next";

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
  console.log('teamUsers', teamUsers)
  const [loading, setLoading] = useState(false);
  const getEnterprisesTeams = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        // Filter out users with status "closed"
        // const filteredUsers = response.data.data.users.filter(
        //   (user) => user.status !== "closed"
        // );
          console.log("data", response);

        // setTeamUsers(filteredUsers);
        setTeamUsers(response?.data?.team);
        setLoading(true);
      }
    } catch (error) {
      // console.log("error message", error);
    }
  };
  useEffect(() => {
    // const getEnterprisesTeams = async () => {
    //   const token = CookieService.get("token");
    //   try {
    //     const response = await axios.get(`${API_BASE_URL}/teams/${id}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     if (response.status) {
    //       // console.log("data", response);
    //       setTeamUsers(response?.data?.team);
    //       setLoading(true);
    //     }
    //   } catch (error) {
    //     // console.log("error message", error);
    //   }
    // };
    getEnterprisesTeams();
  }, []);

  const handleUpdateUser = (id) => {
    navigate(`/ModifierUser/${id}`);
  };

  const handleChangeStatus = async (id) => {
    const token = CookieService.get("token");
    // const currentDate = moment().format();
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${id}/status`,
        { status: "closed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        // getData();
        getEnterprisesTeams();
        // setCurrentDate(currentDate);
        // setActiveTab("Abonnements clôturés");
      }
    } catch (error) { }
  };
  return (
    <div className="scheduled">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {loading ? (
              // team?.map((item, index) => (
              <>
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="cardbody">
                      <h5>{teamUsers?.name}</h5>
                      {teamUsers?.users?.length === 0 ? (
                        <NoContent title={`User of ${teamUsers?.name}`} />
                      ) : (
                        // teamUsers?.users?.map((user, index) => (
                        teamUsers?.users
                          // ?.filter((user) => user.pivot?.status !== "closed")
                          .map((user, index) => (
                            <div>
                              <Table responsive>
                                <thead>
                                  <tr>
                                    <th className="table-head">logo</th>
                                    <th className="table-head">
                                      {t("user.team")}
                                    </th>
                                    <th className="table-head">
                                      {t("user.name")}
                                    </th>
                                    <th className="table-head">
                                      {t("user.fname")}
                                    </th>
                                    <th className="table-head">
                                      {t("user.job")}
                                    </th>
                                    <th className="table-head">Email </th>
                                    <th className="table-head">
                                      {t("user.Profile")}
                                    </th>
                                    <th className="table-head">
                                      {" "}
                                      {t("user.Creation date")}{" "}
                                    </th>

                                    <th className="table-head">Action</th>
                                  </tr>
                                </thead>
                                <tbody style={{ padding: "10px 10px" }}>
                                  <tr key={index}>
                                    <td className="table-data">
                                      {/* {teamUsers?.logo ? ( */}
                                        <img
                                          className="logo"
                                          width={50}
                                          height={50}
                                          src={teamUsers?.logo?.startsWith("http") ? teamUsers?.logo : `${Assets_URL}/${teamUsers?.logo}`}
                                          alt="logo"
                                        />
                                      {/* ) : (
                                        <FaUserCircle size={30} />
                                      )} */}
                                    </td>
                                    <td className="table-data">
                                      {teamUsers?.name}
                                    </td>
                                    <td className="table-data">{user.name}</td>
                                    <td className="table-data">
                                      {user.last_name}
                                    </td>
                                    <td className="table-data">{user?.post}</td>
                                    <td className="table-data">
                                      {user?.email}
                                    </td>
                                    <td className="table-data">
                                      {(() => {
                                        const roleName = user?.role?.name;
                                        if (roleName === "MasterAdmin") {
                                          return "Master";
                                        } else if (roleName === "SuperAdmin") {
                                          return "Créateur";
                                        } else if (roleName === "Admin") {
                                          return "Administrator";
                                        } else {
                                          return "Guide";
                                        }

                                        return roleName;
                                      })()}
                                    </td>
                                    <td className="table-data">
                                      {(user?.created_at).substring(0, 10)}
                                    </td>
                                    <td className="table-data d-flex align-items-center">
                                      <div
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
                                                handleUpdateUser(user?.id)
                                              }
                                            >
                                              <CiEdit size={"20px"} /> &nbsp;
                                              Modifier
                                            </a>
                                          </li>
                                          <li
                                            onClick={() =>
                                              handleChangeStatus(user?.id)
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
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                              <div className="user-status">
                                <span
                                  className={`badge ${user.status === "active"
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
                    Revenir à la page précédente
                  </button>
                </div>
              </>
            ) : (
              // ))
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
};

export default EnterprisesToUser;
