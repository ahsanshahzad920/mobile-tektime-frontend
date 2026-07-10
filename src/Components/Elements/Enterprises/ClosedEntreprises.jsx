import CookieService from '../../Utils/CookieService';
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Spinner, Table, Card, Button } from "react-bootstrap";
import { HiUserCircle } from "react-icons/hi2";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { IoEyeOutline } from "react-icons/io5";
import { VscActivateBreakpoints } from "react-icons/vsc";
import { toast } from "react-toastify";
import { MdRestartAlt } from "react-icons/md";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useNavigate, useOutletContext } from "react-router-dom";
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
} from "react-icons/fa";

function sortByDateDescending(objects) {
  return objects.sort((a, b) => {
    const dateA = new Date(a.updated_at);
    const dateB = new Date(b.updated_at);

    return dateB - dateA; // Sort in descending order (newest first)
  });
}

const ClosedEntreprises = ({ setActiveTab }) => {
  const { title, pushHeaderTitle, popHeaderTitle, setHeaderTitle } =
    useHeaderTitle();
  const [enterprises, setEnterprises] = useState([]);
  const [t] = useTranslation("global");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useOutletContext();

  useEffect(() => {
    setSearchTerm("");
  }, []);
  const handlelinkEnterprises = (id) => {
    navigate(`/EntreprisesToTeam/${id}`);
  };

  const [isCardView, setIsCardView] = useState(true);

  const handleToggle = (viewType) => {
    setIsCardView(viewType === "card");
  };

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

  const handleReactiveClick = async (id) => {
    try {
      setLoading(true);
      const REQUEST_URL = API_BASE_URL + "/enterprises/" + id + "/status";
      const response = await axios.post(
        REQUEST_URL,
        {
          status: "active",
          _method: "put",
        },
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setLoading(false);
        toast.success(t("messages.enterprise.reactivate.success"));
        setActiveTab("Entreprises actives");
      }
    } catch (error) {
      // toast(error.response.data.errors);
      if (
        error.response.data.errors == "Enterprise status is closed" ||
        error.response.status == 500
      ) {
        toast.error(t("errors.contractClosed"));
      }
      // console.log(error);
      // toast.error(t("messages.enterprise.reactivate.error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllEnterprises = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/closed/enterprises`, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        //Filter enterprise by roleID.
        // Only show enterprises created by the user
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
      } catch (error) {
        console.error("Error fetching closed enterprises:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEnterprises();
  }, []);

  const filteredEnterprises = enterprises.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const name = item?.name?.toLowerCase() || "";
    const creatorName = `${item?.created_by?.name || ""} ${item?.created_by?.last_name || ""}`.toLowerCase();
    const contractName = item?.contract?.name?.toLowerCase() || "";
    const activityArea = item?.activity_area?.toLowerCase() || "";
    const country = item?.country?.toLowerCase() || "";
    return (
      name.includes(searchLower) ||
      creatorName.includes(searchLower) ||
      contractName.includes(searchLower) ||
      activityArea.includes(searchLower) ||
      country.includes(searchLower)
    );
  });

  const sortedEnterprises = sortByDateDescending([...filteredEnterprises]);

  return loading ? (
    <Spinner animation="border" variant="primary" className="center-spinner" />
  ) : (
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
            {sortedEnterprises?.length === 0 ? (
              <NoContent title="Closed Enterprise" />
            ) : (
              <>
                {!isCardView &&
                  sortedEnterprises.map((item) => {
                    return (
                      item.status === "closed" && (
                        <div key={item.id} className="card my-4">
                          <div className="card-body">
                            <div className="cardbody">
                              <Table responsive>
                                <thead>
                                  <tr>
                                    {tableHeadText.map((text, index) => (
                                      <th className="table-head" key={index}>
                                        {text}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item?.logo === null || item?.logo === "" ? (
                                        <HiUserCircle size={"40px"} />
                                      ) : (
                                        <img
                                          className="logo"
                                          src={
                                            item?.logo?.startsWith("http")
                                              ? item?.logo
                                              : `${Assets_URL}/${item.logo}`
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
                                      {item?.created_by?.name || item?.created_by}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.contract?.name}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.users?.length || 0} / {item.contract?.no_of_licenses}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.activity_area}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {item.country}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {}
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {
                                        new Date(item.created_at)
                                          .toISOString()
                                          .split("T")[0]
                                      }
                                    </td>
                                    <td className="table-data enterprise-tabledata align-middle">
                                      {getEndDate(item.created_at, item.contract?.payment_type)}
                                    </td>
                                    <td className="table-data d-flex align-items-center mt-2 align-middle">
                                      <IoEyeOutline
                                        size={"22px"}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setHeaderTitle([
                                            {
                                              titleText: "Entreprises archivées",
                                              link: "/Enterprises",
                                            },
                                            {
                                              titleText: item?.name,
                                              link: `/EntreprisesToTeam/${item?.id}`,
                                            },
                                          ]);
                                          handlelinkEnterprises(item?.id);
                                        }}
                                      />
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
                                              onClick={() => {
                                                handleReactiveClick(item?.id);
                                              }}
                                            >
                                              <MdRestartAlt size={"20px"} /> &nbsp;
                                              {t("Entreprise.reactive")}
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
                      )
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
                          item.status === "closed" && (
                            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={item.id}>
                              <Card
                                className="participant-card position-relative w-100"
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
                                  handlelinkEnterprises(item.id)
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
                                        handleReactiveClick(item.id);
                                      }}
                                    >
                                      <MdRestartAlt className="me-0 me-md-1" />{" "}
                                      <span className="d-none d-md-inline">{t("Entreprise.reactive")}</span>
                                    </Button>
                                  </div>
                                </Card.Body>
                              </Card>
                            </div>
                          )
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
}

export default ClosedEntreprises;
