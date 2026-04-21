import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoEyeOutline } from "react-icons/io5";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiDeleteRow } from "react-icons/ri";
import { HiUserCircle } from "react-icons/hi2";
import { Table } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { Assets_URL } from "../../Apicongfig";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";
import { FaTh } from "react-icons/fa";
import { FaList } from "react-icons/fa6";
import {
  FaUser,
  FaTag,
  FaUsers,
  FaBriefcase,
  FaGlobe,
  FaCalendarAlt,
  FaCalendar,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Card, Button } from "react-bootstrap";
// Annuelle (12 mois) 1 year
// Mensuelle (1 mois) 1 month
// Trimestrielle (3 mois) 3 month
// Semestrielle  (6 mois) 6 month

const ActiveEnterprises = ({ setActiveTab }) => {
  const [enterprises, setEnterprises] = useState([]); //enterprises list
  const [t] = useTranslation("global");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setHeaderTitle } = useHeaderTitle();
  const { searchTerm, setSearchTerm } = useOutletContext();

  useEffect(() => {
    setSearchTerm("");
  }, []);
  const tableHeadText = [
    "Logo",
    t("Entreprise.fname"),
    t("Entreprise.Creator"),
    t("Entreprise.subscription"),
    t("Entreprise.Number of Licenses"),
    t("Entreprise.Activity area"),
    t("Entreprise.country name"),
    t("Entreprise.Number of renewals"),
    t("Entreprise.Date of creation"),
    // t("Entreprise.Start date"),
    t("Entreprise.End date"),
    "Action",
  ];
  const getEndDate = (created_at, payment_type) => {
    const date = new Date(created_at);
    const months = {
      "Annuelle (12 mois)": 12,
      "Mensuelle (1 mois)": 1,
      "Trimestrielle (3 mois)": 3,
      "Semestrielle  (6 mois)": 6,
    }[payment_type];

    if (!months) return "-";
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("fr-FR");
  };
  const handleArhciveClick = async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/enterprises/${id}/status`,
        {
          status: "closed",
          _method: "put",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Enterprise archived successfully!");
        setActiveTab("Entreprises archivées");
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchAllEnterprises = async () => {
    try {
      setLoading(true);
      const URL = `${API_BASE_URL}/enterprises`;
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response.status === 200) {
        if (getUserRoleID() == 1) {
          // No need to filter
          setEnterprises(response?.data?.data);
        } else {
          // Filter enterprises
          const userId = CookieService.get("user_id");
          const filteredEnterprises = response?.data?.data?.filter(
            (enterprise) => {
              const creatorId = enterprise?.created_by?.id || enterprise?.created_by;
              return creatorId?.toString() === userId?.toString();
            }
          );
          setEnterprises(filteredEnterprises);
        }
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEnterprises();
  }, []);

  const sortedEnterprises = enterprises.sort((a, b) => (a.id < b.id ? 1 : -1)); // sorting enterprises by id in order of creation (newest to oldest)
  // const handlelinkEnterprises = (id) => {
  //   navigate(`/EntreprisesToTeam/${id}`);
  // };
  const handlelinkEnterprises = async (id, item) => {
    // If unread, mark as read
    if (!item?.read_at) {
      try {
        await axios.get(`${API_BASE_URL}/mark-enterprise-as-read/${id}`);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    navigate(`/EntreprisesToTeam/${id}`);
  };

  const [isCardView, setIsCardView] = useState(true);

  const handleToggle = (viewType) => {
    setIsCardView(viewType === "card");
  };
  return (
    <div className="enterprise">
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-md-12 py-3">
            <div className="py-3 team-new-card">
              {/* 🔄 View Toggle */}
              <div className="contact-view-container p-0">
                <div className="view-toggle-container mb-3 d-flex justify-content-end">
                  <div className="toggle-buttons d-flex gap-2">
                    <button
                      className={`toggle-btn ${isCardView ? "active" : ""}`}
                      onClick={() => handleToggle("card")}
                      aria-label="Card view"
                    >
                      <FaTh className="toggle-icon me-1" />
                      <span>Card View</span>
                    </button>
                    <button
                      className={`toggle-btn ${!isCardView ? "active" : ""}`}
                      onClick={() => handleToggle("list")}
                      aria-label="List view"
                    >
                      <FaList className="toggle-icon me-1" />
                      <span>List View</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {loading ? (
              <Spinner
                animation="border"
                variant="primary"
                className="center-spinner"
              />
            ) : sortedEnterprises?.length === 0 ? (
              <NoContent title="Active Enterpirse" />
            ) : (
              <>
                {!isCardView &&
                  sortedEnterprises.map((item) => {
                    return (
                      <React.Fragment key={item.id}>
                        <div
                          className={`card my-4`}
                          style={{
                            border: !item?.read_at ? "1px solid black" : "none",
                          }}
                        >
                          <div className="card-body">
                            <div className="cardbody">
                              <Table responsive>
                                <thead>
                                  <tr>
                                    {tableHeadText.map((item, index) => {
                                      return (
                                        <th className="table-head" key={index}>
                                          {item}
                                        </th>
                                      );
                                    })}
                                  </tr>
                                </thead>
                                <tbody style={{ padding: "10px 10px" }}>
                                  <tr>
                                    <td className="table-data">
                                      {item?.logo === null ||
                                      item?.logo === "" ? (
                                        <HiUserCircle size={"40px"} />
                                      ) : (
                                        <img
                                          className="logo"
                                          src={
                                            item?.logo?.startsWith("http")
                                              ? item?.logo
                                              : Assets_URL + "/" + item?.logo
                                          }
                                          alt="logo"
                                          width={50}
                                          height={50}
                                        />
                                      )}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.name}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item?.created_by?.name +
                                        " " +
                                        item?.created_by?.last_name}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.contract?.name}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.users.length} /
                                      {item.contract?.no_of_licenses}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item?.activity_area}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item?.country}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {
                                        new Date(item?.created_at)
                                          .toISOString()
                                          .split("T")[0]
                                      }
                                    </td>
                                    {/* <td className="table-data">
                                  {
                                    new Date(item.contract?.created_at)
                                      .toISOString()
                                      .split("T")[0]
                                  }
                                </td> */}
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.contract?.payment_type ===
                                        "Annuelle (12 mois)" && (
                                        <>
                                          {(() => {
                                            let createdAt = new Date(
                                              item.created_at
                                            );
                                            createdAt.setFullYear(
                                              createdAt.getFullYear() + 1
                                            );

                                            let year = createdAt.getFullYear();
                                            let month = String(
                                              createdAt.getMonth() + 1
                                            ).padStart(2, "0");
                                            let day = String(
                                              createdAt.getDate()
                                            ).padStart(2, "0");

                                            let formattedDate = `${year}-${month}-${day}`;
                                            return formattedDate;
                                          })()}
                                        </>
                                      )}
                                      {item.contract?.payment_type ===
                                        "Mensuelle (1 mois)" && (
                                        <>
                                          {(() => {
                                            let createdAt = new Date(
                                              item.created_at
                                            );
                                            createdAt.setMonth(
                                              createdAt.getMonth() + 1
                                            );

                                            let year = createdAt.getFullYear();
                                            let month = String(
                                              createdAt.getMonth() + 1
                                            ).padStart(2, "0");
                                            let day = String(
                                              createdAt.getDate()
                                            ).padStart(2, "0");

                                            let formattedDate = `${year}-${month}-${day}`;
                                            return formattedDate;
                                          })()}
                                        </>
                                      )}
                                      {item.contract?.payment_type ===
                                        "Trimestrielle (3 mois)" && (
                                        <>
                                          {(() => {
                                            let createdAt = new Date(
                                              item.created_at
                                            );
                                            createdAt.setMonth(
                                              createdAt.getMonth() + 3
                                            ); // Add 3 months

                                            let year = createdAt.getFullYear();
                                            let month = String(
                                              createdAt.getMonth() + 1
                                            ).padStart(2, "0");
                                            let day = String(
                                              createdAt.getDate()
                                            ).padStart(2, "0");

                                            let formattedDate = `${year}-${month}-${day}`;
                                            return formattedDate;
                                          })()}
                                        </>
                                      )}
                                      {item.contract?.payment_type ===
                                        "Semestrielle  (6 mois)" && (
                                        <>
                                          {(() => {
                                            let createdAt = new Date(
                                              item.created_at
                                            );
                                            createdAt.setMonth(
                                              createdAt.getMonth() + 6
                                            ); // Add 6 months

                                            let year = createdAt.getFullYear();
                                            let month = String(
                                              createdAt.getMonth() + 1
                                            ).padStart(2, "0");
                                            let day = String(
                                              createdAt.getDate()
                                            ).padStart(2, "0");

                                            let formattedDate = `${year}-${month}-${day}`;
                                            return formattedDate;
                                          })()}
                                        </>
                                      )}
                                    </td>
                                    <td className="table-data d-flex align-items-center mt-2 align-middle">
                                      <IoEyeOutline
                                        size={"22px"}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setHeaderTitle([
                                            {
                                              titleText: "Entreprises Actives",
                                              link: "/Enterprises",
                                            },
                                            {
                                              titleText: item?.name,
                                              link: `/EntreprisesToTeam/${item?.id}`,
                                            },
                                          ]);
                                          handlelinkEnterprises(item?.id, item);
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
                                            <Link
                                              to={`/ModifierEnterprises/${item.id}`}
                                              className="dropdown-item"
                                              style={{ cursor: "pointer" }}
                                            >
                                              <CiEdit size={"20px"} /> &nbsp;
                                              {t("Entreprise.modify")}
                                            </Link>
                                          </li>
                                          {/* <li>
                                          <a
                                            className="dropdown-item"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                              handleDuplicateClick(item?.id);
                                            }}
                                          >
                                            <MdContentCopy size={"20px"} /> &nbsp;
                                            Dupliquer
                                          </a>
                                        </li> */}
                                          <li>
                                            <a
                                              className="dropdown-item"
                                              style={{ cursor: "pointer" }}
                                              onClick={() => {
                                                handleArhciveClick(item?.id);
                                              }}
                                            >
                                              <RiDeleteRow size={"20px"} />{" "}
                                              &nbsp;
                                              {t("Entreprise.close")}
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
                      </React.Fragment>
                    );
                  })}

                {isCardView && (
                  <div className="complete-invite">
                    <div className="row participant">
                      {sortedEnterprises.map((item) => {
                        const creatorName = `${item.created_by?.name || ""} ${
                          item.created_by?.last_name || ""
                        }`.trim();
                        const endDate = getEndDate(
                          item.created_at,
                          item.contract?.payment_type
                        );

                        return (
                          <div className="col-md-3" key={item.id}>
                            <Card
                              className="participant-card position-relative"
                              style={{
                                cursor: "pointer",
                                marginTop: "4rem",
                                borderRadius: "26px",
                                position: "relative",
                                border: "2px solid transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.border =
                                  "2px solid #0026b1";
                                e.currentTarget.style.background = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.border =
                                  "2px solid transparent";
                                e.currentTarget.style.background = "white";
                              }}
                              onClick={() =>
                                handlelinkEnterprises(item.id, item)
                              }
                            >
                              <Card.Body style={{ padding: "20px 0px 20px 0" }}>
                                {/* Logo */}
                                <div className="d-flex justify-content-center">
                                  <div className="participant-card-position">
                                    <div className="profile-logo position-relative">
                                      {item?.logo ? (
                                        <Card.Img
                                          className="user-img"
                                          src={
                                            item.logo.startsWith("http")
                                              ? item.logo
                                              : `${Assets_URL}/${item.logo}`
                                          }
                                          style={{
                                            width: "80px",
                                            height: "80px",
                                          }}
                                        />
                                      ) : (
                                        <div
                                          className="user-img d-flex align-items-center justify-content-center"
                                          style={{
                                            width: "80px",
                                            height: "80px",
                                            backgroundColor: "#f0f0f0",
                                            borderRadius: "50%",
                                            color: "#666",
                                          }}
                                        >
                                          <HiUserCircle size={50} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Enterprise Name */}
                                <Card.Title className="text-center mt-4 card-heading">
                                  {item.name}
                                </Card.Title>

                                {/* Creator */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaUser className="me-1" />
                                    {creatorName || t("Unknown")}
                                  </small>
                                </div>

                                {/* Subscription */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaTag className="me-1" />
                                    {item.contract?.name || "-"}
                                  </small>
                                </div>

                                {/* Licenses */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaUsers className="me-1" />
                                    {item.users?.length || 0} /{" "}
                                    {item.contract?.no_of_licenses || "-"}
                                  </small>
                                </div>

                                {/* Activity Area */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaBriefcase className="me-1" />
                                    {item.activity_area || "-"}
                                  </small>
                                </div>

                                {/* Country */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaGlobe className="me-1" />
                                    {item.country || "-"}
                                  </small>
                                </div>

                                {/* Creation Date */}
                                <div className="text-center mb-2">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaCalendarAlt className="me-1" />
                                    {new Date(
                                      item.created_at
                                    ).toLocaleDateString("fr-FR")}
                                  </small>
                                </div>

                                {/* End Date */}
                                <div className="text-center mb-3">
                                  <small className="text-muted d-flex align-items-center justify-content-center">
                                    <FaCalendar className="me-1" />
                                    {endDate}
                                  </small>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/ModifierEnterprises/${item.id}`
                                      );
                                    }}
                                  >
                                    <FaEdit className="me-1" />{" "}
                                    {t("Entreprise.modify")}
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleArhciveClick(item.id);
                                    }}
                                  >
                                    <FaTrash className="me-1" />{" "}
                                    {t("Entreprise.close")}
                                  </Button>
                                </div>

                                {/* Unread Badge (optional) */}
                                {!item?.read_at && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "-10px",
                                      right: "-10px",
                                      backgroundColor: "#0026b1",
                                      color: "white",
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "50%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    !
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveEnterprises;
