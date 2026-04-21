import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { MdContentCopy } from "react-icons/md";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { Spinner, Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import NoContent from "../Meeting/NoContent";

function EntreprisesToTeam() {
  const { title, pushHeaderTitle, popHeaderTitle, resetHeaderTitle } =
    useHeaderTitle();
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  let { setActiveTab } = location.state || {};

  const handleLinkUser = (id) => {
    navigate(`/EntreprisesToUsers/${id}`);
  };
  const handleUpdateTeam = (id) => {
    navigate(`/ModifierTeam/${id}`);
  };
  const handleUsers = () => {
    navigate("/Users");
  };
  const goBack = () => {
    popHeaderTitle();
    window.history.back();
  };

  const [enterpriseTeams, setEnterpriseTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getEnterprisesTeams = async () => {
      const token = CookieService.get("token");
      try {
        const response = await axios.get(`${API_BASE_URL}/enterprises/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          // console.log("data", response);
          setEnterpriseTeams(response?.data?.data);
        }
        setLoading(false);
      } catch (error) {
        // console.log("error message", error);
        setLoading(false);
      }
    };
    getEnterprisesTeams();
  }, []);

  return (
    <div className="scheduled">
      <div className="container-fluid ">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {!loading ? (
              // team?.map((item, index) => (
              <>
                {enterpriseTeams?.teams?.length > 0 ? (
                  enterpriseTeams?.teams?.map((user, index) => (
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="cardbody">
                          <h5>{enterpriseTeams?.name}</h5>
                          <Table responsive>
                            <thead>
                              <tr key={index}>
                                <th className="table-head">logo</th>
                                <th className="table-head">Nom</th>
                                <th className="table-head">
                                  Début de la création
                                </th>
                                <th className="table-head">Effectif </th>
                                <th className="table-head">Action</th>
                              </tr>
                            </thead>
                            <tbody style={{ padding: "10px 10px" }}>
                              <tr>
                                <td className="table-data">
                                  <img
                                    className="logo"
                                    width={50}
                                    height={50}
                                    src={user?.logo?.startsWith("http") ? user?.logo : `${Assets_URL}/${user?.logo}`}
                                    alt="logo"
                                    />
                                </td>
                                <td className="table-data">{user?.name}</td>
                                <td className="table-data">
                                  {(user?.created_at).substring(0, 10)}
                                </td>
                                <td className="table-data">
                                  {user?.users?.filter(user => user.status !== 'closed').length}
                                </td>
                                <td className="table-data d-flex align-items-center">
                                  <IoEyeOutline
                                    size={"22px"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      pushHeaderTitle({
                                        titleText: user?.name,
                                        link: `/EntreprisesToUsers/${user?.id}`,
                                      });
                                      handleLinkUser(user?.id);
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
                                            handleUpdateTeam(user?.id)
                                          }
                                        >
                                          <CiEdit size={"20px"} /> &nbsp;
                                          Modifier
                                        </a>
                                      </li>
                                      <li
                                      // onClick={() =>
                                      //   handleChangeStatus(user?.id)
                                      // }
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
                                  </div> */}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <NoContent title={`Team of ${enterpriseTeams?.name}`} />
                  </>
                )}
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
}

export default EntreprisesToTeam;
