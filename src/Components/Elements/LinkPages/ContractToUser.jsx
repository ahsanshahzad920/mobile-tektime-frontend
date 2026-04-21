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

const ContractToUser = () => {
  const { title, pushHeaderTitle, popHeaderTitle, resetHeaderTitle } =
    useHeaderTitle();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  let { setActiveTab } = location.state || {};


  const goBack = () => {
    popHeaderTitle();
    window.history.back();
  };

  const [teamUsers, setTeamUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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
    } catch (error) {
      // console.log("error message", error);
    }
  };
  useEffect(() => {
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
      } catch (error) {
        // console.log("error message", error);
      }
    };
    getEnterprisesTeams();
  }, []);

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
        getEnterprisesTeams()
        // setCurrentDate(currentDate);
        // setActiveTab("Abonnements clôturés");
        // console.log("currentDate-->", currentDate);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const handleUpdateUser = (id) => {
    navigate(`/ModifierUser/${id}`);
  };
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
                      {teamUsers?.users.length === 0 ? (
                        <NoContent title={`User of ${teamUsers?.name}`} />
                      ) : (
                        teamUsers?.users
                        // ?.filter((user) => user.status !== "closed")
                        ?.map((user, index) => (
                          <Table responsive>
                            <thead>
                              <tr>
                                <th className="table-head">logo</th>
                                <th className="table-head">Equipe </th>
                                <th className="table-head">Nom</th>
                                <th className="table-head">Prénom</th>
                                <th className="table-head">Poste </th>
                                <th className="table-head">Email </th>
                                <th className="table-head">Profil</th>
                                <th className="table-head">Date Creation</th>

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
                                      src={teamUsers?.logo?.startsWith("http") ? teamUsers?.logo : `${Assets_URL}/${teamUsers?.logo}`}
                                      alt="logo"
                                    />
                                </td>
                                {/* <td className="table-data">{teamUsers?.name}</td> */}
                                {/* {teamUsers?.teams?.map((team)=>(
                                   <td className="table-data">
                                    {team.name}
                                    </td>
                                ))} */}
                                <td className="table-data">
                                  {teamUsers?.name}
                                </td>
                                <td className="table-data">{user?.name}</td>
                                <td className="table-data">{user.last_name}</td>
                                <td className="table-data">{user?.post}</td>
                                <td className="table-data">{user?.email}</td>
                                <td className="table-data">
                                  {user?.role?.name}
                                </td>
                                {/* <td className="table-data">{user?.role_id === 1 ? "Master Admin" : user.role_id === 2 ? "Super Admin" : user.role_id === 3 ? "Admin" : 'Guide'}</td> */}

                                <td className="table-data">
                                  {(user?.created_at).substring(0, 10)}
                                </td>
                                <td className="table-data d-flex align-items-center">
                                  {/* <IoEyeOutline
                                    size={"22px"}
                                    style={{ cursor: "pointer" }}
                                  /> */}
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
                                          <RiDeleteRow size={"20px"} /> &nbsp;
                                          Désactiver
                                        </a>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                              <div className="">
                                <span
                                  className={`badge ${
                                    user.status === "active"
                                      ? "bg-success"
                                      : "bg-danger"
                                  } text-white`}
                                >
                                  {user.status === "active"
                                    ? "compte validé"
                                    : user.status === "Pending"
                                    ? "compte en attente de validation"
                                    : user.status === "closed" && "closed"}
                                </span>
                              </div>
                            </tbody>
                          </Table>
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

export default ContractToUser;
