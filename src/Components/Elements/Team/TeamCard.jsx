import CookieService from '../../Utils/CookieService';
import React, { useState } from "react";
import { Card, Badge, Spinner, Button, Dropdown } from "react-bootstrap";
import {
  FaArrowRight,
  FaBuilding,
  FaUsers,
  FaCalendarAlt,
  FaUser,
  FaUserTie,
  FaIdCard,
  FaPhone,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaCalendar,
} from "react-icons/fa";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import moment from "moment-timezone";
import { FaMeetup, FaTag } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import axios from "axios";
import { toast } from "react-toastify";
import ClientCastingModal from "./ClientCastingModal";
import { Avatar, Tooltip } from "antd";
import { MdOutlineLibraryAddCheck } from "react-icons/md";
import EditParticipantModal from "../Invities/DestinationToMeeting/EditParticipantModal";
import CSVImportContact from "./CSVImportContact";

const TeamCard = ({
  teams,
  loading,
  isTeamView,
  isMemberView,
  isClientView,
  isContactView,
  isTeamMemberView,
  show,
  setShow,
  editData,
  refresh,
  onChangeStatus,
  enterprise = null,
  isCastingView = false,
  completedCosts,
  refreshBudget,
  destinationId = null,
  showImportModal,
  setShowImportModal,
  fromClient = false,
  clientId = null,

}) => {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [itemToChange, setItemToChange] = useState(null);
  // --members
  const [showMemberStatusModal, setShowMemberStatusModal] = useState(false);
  const [memberToChange, setMemberToChange] = useState(null);
  // ----Team Member----
  const [showTeamMemberStatusModal, setShowTeamMemberStatusModal] =
    useState(false);
  const [teamMemberToChange, setTeamMemberToChange] = useState(null);
  // ----Team contact----
  const [showTeamContactStatusModal, setShowTeamContactStatusModal] =
    useState(false);
  const [teamContactToChange, setTeamContactToChange] = useState(null);
  const handleClose = () => {
    setShow(!true);
  };

  const user = JSON.parse(CookieService.get("user"));
  const userEnterprise = user?.enterprise?.name;
  const getBorderColor = (item) => {
    if (isClientView) return "transparent";
    switch (isTeamMemberView ? item?.pivot?.status : item.status) {
      case "pending":
        return "#f4b400"; // Yellow
      case "active":
        return "#34a853"; // Green
      case "closed":
        return "#ea4335"; // Red
      default:
        return "transparent";
    }
  };

  const getStatusText = (item) => {
    switch (isTeamMemberView ? item.pivot.status : item.status) {
      case "pending":
        return t("team.teamStatus.Pending");
      case "active":
        return t("team.teamStatus.Active");
      case "closed":
        return t("team.teamStatus.Archived");
      default:
        return "";
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const endpoint = isContactView ? "contacts" : "clients";

    try {
      // setIsDeleting(true);
      const response = await axios.delete(
        `${API_BASE_URL}/${endpoint}/${itemToDelete?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        if (isContactView) {
          toast.success(t("contacts.delete_success"));
        } else {
          toast.success(t("clients.delete_success"));
        }
        // Call refresh only if it exists
        if (typeof refresh === "function") {
          refresh();
        }
      }
    } catch (error) {
      console.error("Delete contact error:", error);
      toast.error(t("contacts.delete_error"));
      if (isContactView) {
        toast.error(t("contacts.delete_error"));
      } else {
        toast.error(t("clients.delete_error"));
      }
    } finally {
      // setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const changeStatus = (item) => {
    setItemToChange(item);
    setShowStatusModal(true);
  };

  // const team_id = parseInt(id);
  const confirmStatus = async () => {
    if (!itemToChange) return;
    const token = CookieService.get("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/teams/${itemToChange?.id}/status`,
        {
          status: itemToChange?.status === "active" ? "closed" : "active",
          _method: "put",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        if (typeof refresh === "function") {
          refresh();
        }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
    setShowStatusModal(false);
  };

  // -----------------TEAm Member -----------
  const changeTeamMemberStatus = (item) => {
    setTeamMemberToChange(item);
    setShowTeamMemberStatusModal(true);
  };
  const changeTeamContactStatus = (item) => {
    setTeamContactToChange(item);
    setShowTeamContactStatusModal(true);
  };

  const team_id = parseInt(id);
  const confirmTeamMemberStatus = async () => {
    if (!teamMemberToChange) return;
    const token = CookieService.get("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/${teamMemberToChange?.id}/status`,
        {
          status:
            teamMemberToChange?.pivot?.status === "active"
              ? "closed"
              : "active",
          team_id: team_id,
          _method: "put",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        if (typeof refresh === "function") {
          refresh();
        }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
    setShowTeamMemberStatusModal(false);
  };
  const confirmTeamContactStatus = async () => {
    if (!teamContactToChange) return;
    const token = CookieService.get("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/contacts/${teamContactToChange?.id}/status`,
        {
          status:
            teamContactToChange?.pivot?.status === "active"
              ? "closed"
              : "active",
          team_id: team_id,
          _method: "put",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        if (typeof refresh === "function") {
          refresh();
        }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
    setShowTeamContactStatusModal(false);
  };

  const changeMemberStatus = (item) => {
    setMemberToChange(item);
    setShowMemberStatusModal(true);
  };

  // const team_id = parseInt(id);
  const confirmMemberStatus = async () => {
    if (!memberToChange) return;
    const token = CookieService.get("token");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/change-enterprise-user-status/${memberToChange?.id}`,
        {
          status: memberToChange?.status === "active" ? "closed" : "active",
          enterprise_id: parseInt(user?.enterprise?.id),
          _method: "put",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response) {
        if (typeof refresh === "function") {
          refresh();
        }
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
      // console.log("error", error);
    }
    setShowMemberStatusModal(false);
  };

  const [client, setClient] = useState(null);
  const [participant, setParticipant] = useState(null);

  const renderActionButtons = (item) => {
    if (isContactView || isClientView) {
      return (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isContactView) {
                editData(item);
                show(true);
              } else if (isClientView) {
                setShow(true);
                setClient(item);
              }
            }}
          >
            <FaEdit className="me-1" /> {t("Modify")}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isContactView) {
                handleDeleteClick(item);
              } else if (isClientView) {
                handleDeleteClick(item);
              }
            }}
          >
            <FaTrash className="me-1" /> {t("Delete")}
          </Button>
        </div>
      );
    } else if (isMemberView || isTeamView) {
      return (
        <div className="d-flex justify-content-center gap-2 mt-3">
          {item?.status === "active" && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isMemberView || isTeamMemberView) {
                  navigate(`/ModifierUser/${item?.id}`);
                } else {
                  navigate(`/ModifierTeam/${item?.id}`);
                }
              }}
            >
              <FaEdit className="me-1" /> {t("Modify")}
            </Button>
          )}
          {isTeamView && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isTeamView) {
                  changeStatus(item);
                }
              }}
            >
              <FaExchangeAlt className="me-1" /> {t("Change Status")}
            </Button>
          )}
          {isMemberView && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isMemberView) {
                  changeMemberStatus(item);
                }
              }}
            >
              <FaExchangeAlt className="me-1" /> {t("Change Status")}
            </Button>
          )}
        </div>
      );
    } else if (isTeamMemberView) {
      return (
        <div className="d-flex justify-content-center gap-2 mt-3">
          {item?.pivot?.status === "active" && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isTeamMemberView && item?.type === "member") {
                  navigate(`/ModifierUser/${item?.id}`);
                } else if (isTeamMemberView && item?.type === "contact") {
                  editData(item);
                  show(true);

                }
                // if (isTeamMemberView) {
                // navigate(`/ModifierUser/${item?.id}`);
                // }
              }}
            >
              <FaEdit className="me-1" /> {t("Modify")}
            </Button>
          )}

          {/* {isTeamMemberView && ( */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isTeamMemberView && item?.type === "member") {
                changeTeamMemberStatus(item);
              } else {
                changeTeamContactStatus(item)
              }
            }}
          >
            <FaExchangeAlt className="me-1" /> {t("Change Status")}
          </Button>
          {/* )} */}
        </div>
      );
    } else if (isCastingView) {
      return (
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isCastingView) {
                setShow(true); // This opens the modal
                setParticipant(item); // This sets the participant data
              }
            }}
          >
            <FaEdit className="me-1" />{" "}
            {item?.user_id ? t("invities.modifytaxAvg") : t("Modify")}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="complete-invite">
      <div className="row participant">
        {loading ? (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          ></Spinner>
        ) : (
          <>
            {teams?.map((item, index) => {
              const participantName = `${item.first_name} ${item.last_name}`;
              const cost = completedCosts?.[participantName] || 0;
              return (
                <div className="col-md-3" key={index}>
                  <Card
                    className="participant-card position-relative"
                    style={{
                      cursor: "pointer",
                      marginTop: "4rem",
                      borderRadius: "26px",
                      position: "relative",
                      border:
                        isClientView || isContactView || isCastingView
                          ? `none`
                          : `2px solid ${getBorderColor(item)}`,
                    }}
                    onMouseEnter={(e) => {
                      if (isMemberView || isTeamView || isTeamMemberView)
                        return;
                      e.currentTarget.style.border = "1px solid #0026b1";
                      e.currentTarget.style.background = "white";
                    }}
                    onMouseLeave={(e) => {
                      if (isMemberView || isTeamView || isTeamMemberView)
                        return;
                      e.currentTarget.style.border = "1px solid transparent";
                      e.currentTarget.style.background = "white";
                    }}
                    onClick={(e) => {
                      // When switching to a tab (e.g., tab3)
                      if (isClientView) {
                        CookieService.set("activeTab", "tab3");

                        navigate(`/client/${item?.id}`, {
                          state: { from: "Casting" },
                        });
                      } else if (isMemberView) {
                        CookieService.set("activeTab", "tab5");
                        navigate(`/member/${item?.id}`);
                      } else if (isTeamMemberView) {
                        CookieService.set("activeTab", "tab5");
                        if (item?.type === "member") {
                          navigate(`/member/${item?.id}`);
                        } else {
                          navigate(`/contact/${item?.id}`);
                        }
                      } else if (isContactView) {
                        CookieService.set("activeTab", "tab4");

                        navigate(`/contact/${item?.id}`);
                      } else if (isCastingView) {
                        CookieService.set("missionTab", "Participants");
                        if (item?.user_id) {
                          navigate(`/casting/member/${destinationId}/${item?.user_id}`, {
                            state: { from: "Mission" },
                          });
                        } else {
                          navigate(`/casting/contact/${destinationId}/${item?.id}`, {
                            state: { from: "Mission" },
                          });
                        }
                      } else {
                        CookieService.set("activeTab", "tab5");

                        navigate(`/Users/${item?.id}`);
                      }
                    }}
                  >
                    <Card.Body
                      style={{
                        padding: "20px 0px 20px 0",
                      }}
                    >
                      <div className="d-flex justify-content-center">
                        <div className="participant-card-position">
                          <div className="profile-logo position-relative">
                            {isMemberView || isTeamMemberView ? (
                              <>
                                {item?.image?.startsWith("http") ? (
                                  <Card.Img
                                    className="user-img"
                                    src={item?.image}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                ) : (
                                  <Card.Img
                                    className="user-img"
                                    src={Assets_URL + "/" + item?.image}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                )}
                              </>
                            ) : isClientView ? (
                              <>
                                {item?.client_logo?.startsWith("http") ? (
                                  <Card.Img
                                    className="user-img"
                                    src={item?.client_logo}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                ) : (
                                  <Card.Img
                                    className="user-img"
                                    src={Assets_URL + "/" + item?.client_logo}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                )}
                              </>
                            ) : isContactView ? (
                              <>
                                {item?.image?.startsWith("http") ? (
                                  <Card.Img
                                    className="user-img"
                                    src={item?.image}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                ) : (
                                  <Card.Img
                                    className="user-img"
                                    src={Assets_URL + "/" + item?.image}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                )}
                              </>
                            ) : isCastingView ? (
                              <>
                                {item?.participant_image?.startsWith("http") ? (
                                  <Card.Img
                                    className="user-img"
                                    src={item?.participant_image}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                ) : (
                                  <Card.Img
                                    className="user-img"
                                    src={
                                      Assets_URL + "/" + item?.participant_image
                                    }
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                )}
                              </>
                            ) : (
                              <>
                                {item?.logo?.startsWith("http") ? (
                                  <Card.Img
                                    className="user-img"
                                    src={item?.logo}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                ) : (
                                  <Card.Img
                                    className="user-img"
                                    src={Assets_URL + "/" + item?.logo}
                                    style={{ width: "80px", height: "80px" }}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Card.Title className="text-center mt-4 card-heading">
                        {isMemberView || isTeamMemberView
                          ? item?.full_name ? item?.full_name : item?.first_name + item?.last_name
                          : isContactView
                            ? item.first_name || item.last_name
                              ? `${item.first_name || ""} ${item.last_name || ""
                                }`.trim()
                              : item.email
                            : isCastingView
                              ? item?.full_name
                              : item.name}
                      </Card.Title>

                      {/* Contact Type Badge */}
                      {isContactView && (
                        <div className="text-center mb-2">
                          <Badge
                            bg={
                              (item?.type?.toLowerCase() === "new" || item?.type?.toLowerCase() === "nouveau") ? "secondary" :
                                (item?.type?.toLowerCase() === "provider" || item?.type?.toLowerCase() === "prestataire") ? "warning" :
                                  (item?.type?.toLowerCase() === "client") ? "success" :
                                    "secondary"
                            }
                          >
                            {t(`contact.type.${(item?.type || "New").toLowerCase()}`) || (item?.type || "New")}
                          </Badge>
                        </div>
                      )}

                      {/* Casting View Email */}
                      {isCastingView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            {item?.email}
                          </small>
                        </div>
                      )}
                      {/* Post  */}
                      {isMemberView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaIdCard className="me-1" />
                            {/* {moment(item?.created_at)
                            .tz(moment.tz.guess())
                            .format("DD/MM/YYYY [at] HH[h]mm")} */}
                            {item?.post}
                          </small>
                        </div>
                      )}
                      {/* Contract End Date --Member View */}
                      {isMemberView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            {t("Subscriptions End of date")}: &nbsp;
                            <FaCalendar className="me-1" />
                            {moment(enterprise?.contract?.end_date).format(
                              "DD/MM/YYYY"
                            )}
                          </small>
                        </div>
                      )}
                      {/* Creator Information */}
                      {/* <div className="d-flex align-items-center justify-content-center mb-2">
                        <span
                          style={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            fontWeight: 400,
                            lineHeight: "14.52px",
                            textAlign: "left",
                            color: "#8590a3",
                            marginRight: "5px",
                          }}
                        >
                          {t("Creator")}:
                        </span>
                        {isMemberView || isTeamMemberView ? (
                          <>
                            {item?.created_by?.image ? (
                              <img
                                src={
                                  item.created_by.image.startsWith("http")
                                    ? item.created_by.image
                                    : `${Assets_URL}/${item.created_by.image}`
                                }
                                alt={item.created_by.full_name}
                                className="rounded-circle me-2"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  objectFit: "cover",
                                  objectPosition: "top",
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  backgroundColor: "#f0f0f0",
                                  color: "#666",
                                }}
                              >
                                <FaUser size={12} />
                              </div>
                            )}
                            <small className="text-muted">
                              {item.created_by_name || "Unknown"}
                            </small>
                          </>
                        ) : (
                          <>
                            {item.created_by?.image ? (
                              <img
                                src={
                                  item.created_by.image.startsWith("http")
                                    ? item.created_by.image
                                    : `${Assets_URL}/${item.created_by.image}`
                                }
                                alt={item.created_by.full_name}
                                className="rounded-circle me-2"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  objectFit: "cover",
                                  objectPosition: "top",
                                }}
                              />
                            ) : (
                              <div
                                className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  backgroundColor: "#f0f0f0",
                                  color: "#666",
                                }}
                              >
                                <FaUser size={12} />
                              </div>
                            )}

                            <small className="text-muted">
                              {item.created_by?.full_name || "Unknown"}
                            </small>
                          </>
                        )}
                      </div> */}

                      {/* Add this section to show team names for members */}
                      {isMemberView && item.teams && (
                        <div className="text-center mb-3">
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* Added Teams label */}
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.875rem" }}
                            >
                              Teams:
                            </span>

                            <Avatar.Group
                              maxCount={3}
                              size="small"
                              maxStyle={{
                                color: "#f56a00",
                                backgroundColor: "#fde3cf",
                              }}
                            >
                              {item.teams.map((team) => (
                                <Tooltip
                                  key={team.id}
                                  title={team.name}
                                  placement="top"
                                >
                                  <Avatar
                                    style={{
                                      cursor: "pointer",
                                    }}
                                    src={
                                      team?.logo?.startsWith("http")
                                        ? team?.logo
                                        : Assets_URL + "/" + team?.logo
                                    }
                                  />
                                </Tooltip>
                              ))}
                            </Avatar.Group>
                          </div>
                          {item.teams.length > 3 && (
                            <small className="text-muted mt-1 d-block">
                              +{item.teams.length - 3} more teams
                            </small>
                          )}
                        </div>
                      )}

                      {/* Add this section to show team names for contacts */}
                      {isContactView && item.teams?.length > 0 && (
                        <div className="text-center mb-3">
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            {/* Added Teams label */}
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.875rem" }}
                            >
                              {t("header.teams")}:
                            </span>

                            <Avatar.Group
                              maxCount={3}
                              size="small"
                              maxStyle={{
                                color: "#f56a00",
                                backgroundColor: "#fde3cf",
                              }}
                            >
                              {item.teams.map((team) => (
                                <Tooltip
                                  key={team.id}
                                  title={team.name}
                                  placement="top"
                                >
                                  <Avatar
                                    style={{
                                      cursor: "pointer",
                                    }}
                                    src={
                                      team?.logo?.startsWith("http")
                                        ? team?.logo
                                        : Assets_URL + "/" + team?.logo
                                    }
                                  />
                                </Tooltip>
                              ))}
                            </Avatar.Group>
                          </div>
                          {item.teams.length > 3 && (
                            <small className="text-muted mt-1 d-block">
                              +{item.teams.length - 3} more teams
                            </small>
                          )}
                        </div>
                      )}

                      {/* Role and Post - Only for member view */}
                      {isMemberView ||
                        (isTeamMemberView && (
                          <>
                            {item?.role?.name && (
                              <div className="text-center mb-2">
                                <small className="text-muted d-flex align-items-center justify-content-center">
                                  <FaUserTie className="me-1" />
                                  {item?.role ? item?.role?.name : ""}
                                </small>
                              </div>
                            )}
                            {item?.post && (
                              <div className="text-center mb-2">
                                <small className="text-muted d-flex align-items-center justify-content-center">
                                  <FaIdCard className="me-1" />
                                  {item?.post}
                                </small>
                              </div>
                            )}
                          </>
                        ))}
                      {/* Role and Post - Only for contact view */}

                      {isContactView && (
                        <>
                          {/* Client Name or Image */}
                          {item.clients && (
                            <div className="d-flex align-items-center justify-content-center mb-2">
                              <span
                                style={{
                                  fontFamily: "Inter",
                                  fontSize: "12px",
                                  fontWeight: 400,
                                  lineHeight: "14.52px",
                                  textAlign: "left",
                                  color: "#8590a3",
                                  marginRight: "5px",
                                }}
                              >
                                {t("team.Account")}:
                              </span>
                              {item.clients?.client_logo ? (
                                <img
                                  src={
                                    item.clients.client_logo.startsWith("http")
                                      ? item.clients.client_logo
                                      : `${Assets_URL}/${item.clients.client_logo}`
                                  }
                                  alt={item.clients.name}
                                  className="rounded-circle me-2"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    backgroundColor: "#f0f0f0",
                                    color: "#666",
                                  }}
                                >
                                  <FaBuilding size={12} />
                                </div>
                              )}
                              <small className="text-muted">
                                {item.clients?.name}
                              </small>
                            </div>
                          )}

                          {item?.role && (
                            <div className="text-center mb-2">
                              <small className="text-muted d-flex align-items-center justify-content-center">
                                <FaUserTie className="me-1" />
                                {item.role || "No post assigned"}
                              </small>
                            </div>
                          )}
                          {/* Phone Number */}
                          {item.phone_number && (
                            <div className="text-center mb-2">
                              <small className="text-muted d-flex align-items-center justify-content-center">
                                <FaPhone className="me-1" />
                                {item.phone_number}
                              </small>
                            </div>
                          )}
                        </>
                      )}

                      {/* Enterprise Information */}
                      {!isContactView && (
                        <>
                          {isCastingView ? (
                            <div className="text-center mb-2">
                              <small className="text-muted d-flex align-items-center justify-content-center">
                                <FaBuilding className="me-1" />
                                {item?.user_id ? item?.enterprise?.name : item?.contact?.clients?.name || "No enterprise"}
                              </small>
                            </div>
                          ) : (
                            <div className="text-center mb-2">
                              <small className="text-muted d-flex align-items-center justify-content-center">
                                {isClientView ? (
                                  <>
                                    <FaTag className="me-1" />

                                    {t(`client_types.${item.type}`) || "No type"}
                                  </>
                                ) : (
                                  <>
                                    <FaBuilding className="me-1" />
                                    {/* {isMemberView 
                                    ? userEnterprise
                                    : item?.enterprise?.name || "No enterprise"} */}
                                    {isMemberView
                                      ? userEnterprise
                                      : isTeamMemberView
                                        ? item?.pivot?.user_id
                                          ? item?.enterprise?.name
                                          : item?.clients?.name
                                        : null}
                                  </>
                                )}
                              </small>
                            </div>
                          )}
                        </>
                      )}

                      {/* Casting View - Post  */}
                      {isCastingView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaIdCard className="me-1" />

                            {item?.post}
                          </small>
                        </div>
                      )}
                      {/* Casting View Information */}
                      {isCastingView && item?.daily_rates && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            {item?.daily_rates} {item?.currency}
                          </small>
                        </div>
                      )}
                      {/* Casting View Cost Info */}
                      {isCastingView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            <span className="me-1">{t("invities.timePassed")}:</span>
                            {item.work_time >= 86400
                              ? `${Math.floor(item.work_time / 86400)} ${Math.floor(item.work_time / 86400) === 1
                                ? t("time_unit.day")
                                : t("time_unit.days")
                              }`
                              : `${Math.floor(item.work_time / 3600)} ${Math.floor(item.work_time / 3600) === 1
                                ? t("time_unit.hour")
                                : t("time_unit.hours")
                              }`}
                          </small>
                        </div>
                      )}

                      {isCastingView && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            <span className="me-1">{t("invities.workingTimeEstimate")}:</span>
                            {item.working_estimate_time >= 86400
                              ? `${Math.floor(item.working_estimate_time / 86400)} ${Math.floor(item.working_estimate_time / 86400) === 1
                                ? t("time_unit.day")
                                : t("time_unit.days")
                              }`
                              : `${Math.floor(item.working_estimate_time / 3600)} ${Math.floor(item.working_estimate_time / 3600) === 1
                                ? t("time_unit.hour")
                                : t("time_unit.hours")
                              }`}
                          </small>
                        </div>
                      )}


                      {isCastingView && (
                        <div className="text-center mb-3">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <MdOutlineLibraryAddCheck className="me-1" />
                            {item.meeting_count || 0}{" "}
                            {item?.meeting_count > 1
                              ? t("moments")
                              : t("moment")}
                          </small>
                        </div>
                      )}
                      {/* Client View Information */}
                      {isClientView && item?.mailing_address && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            {item?.mailing_address}
                          </small>
                        </div>
                      )}
                      {isClientView && item?.siret_number && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            {item?.siret_number}
                          </small>
                        </div>
                      )}
                      {isClientView && item?.vat_number && (
                        <div className="text-center mb-2">
                          <small className="text-muted d-flex align-items-center justify-content-center">
                            <FaTag className="me-1" />
                            {item?.vat_number}
                          </small>
                        </div>
                      )}

                      {/* User Count */}
                      {!isMemberView &&
                        !isTeamMemberView &&
                        !isClientView &&
                        !isContactView &&
                        !isCastingView && (
                          <div className="text-center mb-3">
                            <small className="text-muted d-flex align-items-center justify-content-center">
                              <FaUsers className="me-1" />
                              {item.users?.length || 0}{" "}
                              {item?.user?.length > 1
                                ? t("team.members")
                                : t("team.member")}
                            </small>
                          </div>
                        )}
                      {/* Contact Count */}
                      {!isMemberView &&
                        !isTeamMemberView &&
                        !isClientView &&
                        !isContactView &&
                        !isCastingView && (
                          <div className="text-center mb-3">
                            <small className="text-muted d-flex align-items-center justify-content-center">
                              <FaUsers className="me-1" />
                              {item.contact_count || 0}{" "}
                              {item?.contact_count > 1
                                ? t("team.contacts")
                                : t("team.contact")}
                            </small>
                          </div>
                        )}

                      {/* {item?.user_id && (
                        <div className="visiting-card-link">
                          {t("viewVisitingCard")} &nbsp; <FaArrowRight />
                        </div>
                      )} */}

                      {/* Render action buttons */}
                      {renderActionButtons(item)}

                      {!isClientView && item.status && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-14px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: getBorderColor(item),
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStatusText(item)}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              );
            })}
          </>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          message={
            isContactView
              ? t("contacts.delete_confirmation")
              : t("clients.delete_confirmation")
          }
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
        // isLoading={isDeleting}
        />
      )}
      {showStatusModal && (
        <ConfirmationModal
          message={
            itemToChange?.status === "active"
              ? `${t("deactive_status_confirmation")} ${itemToChange?.name}?`
              : `${t("active_status_confirmation")} ${itemToChange?.name}?`
          }
          onConfirm={confirmStatus}
          onCancel={() => {
            setShowStatusModal(false);
            setItemToChange(null);
          }}
        // isLoading={isDeleting}
        />
      )}
      {showMemberStatusModal && (
        <ConfirmationModal
          message={
            memberToChange?.status === "active"
              ? `${t("deactive_member_status_confirmation")} ${memberToChange?.name
              }?`
              : `${t("active_member_status_confirmation")} ${memberToChange?.name
              }?`
          }
          onConfirm={confirmMemberStatus}
          onCancel={() => {
            setShowMemberStatusModal(false);
            setMemberToChange(null);
          }}
        // isLoading={isDeleting}
        />
      )}
      {showTeamMemberStatusModal && (
        <ConfirmationModal
          message={
            teamMemberToChange?.pivot?.status === "active"
              ? `${t("deactive_member_status_confirmation")} ${teamMemberToChange?.name
              }?`
              : `${t("active_member_status_confirmation")} ${teamMemberToChange?.name
              }?`
          }
          onConfirm={confirmTeamMemberStatus}
          onCancel={() => {
            setShowTeamMemberStatusModal(false);
            setTeamMemberToChange(null);
          }}
        // isLoading={isDeleting}
        />
      )}
      {showTeamContactStatusModal && (
        <ConfirmationModal
          message={
            teamContactToChange?.pivot?.status === "active"
              ? `${t("deactive_member_status_confirmation")} ${teamContactToChange?.full_name
              }?`
              : `${t("active_member_status_confirmation")} ${teamContactToChange?.full_name
              }?`
          }
          onConfirm={confirmTeamContactStatus}
          onCancel={() => {
            setShowTeamContactStatusModal(false);
            setTeamContactToChange(null);
          }}
        // isLoading={isDeleting}
        />
      )}

      {/* ----------CLIENT_----------- */}
      {isClientView && show && (
        <>
          <ClientCastingModal
            client={client}
            setClient={setClient}
            show={show}
            close={() => {
              setShow(false);
              setClient(null);
            }}
            getClients={refresh}
          />
        </>
      )}

      {/* {isCastingView && show && (
        <EditParticipantModal
          show={show}
          handleClose={handleClose}
          participant={participant}
          refreshedParticipants={refresh}
        />
      )} */}
      {isCastingView && show && (
        <EditParticipantModal
          show={show}
          handleClose={handleClose}
          participant={participant}
          refreshedParticipants={refresh}
          refreshBudget={refreshBudget}
        />
      )}

      {showImportModal && (
        <CSVImportContact
          showImportModal={showImportModal}
          setShowImportModal={setShowImportModal}
          refreshContacts={refresh}
          fromClient={fromClient}
          clientId={clientId}
          forClient={true}

        />
      )}
    </div>
  );
};

export default TeamCard;
