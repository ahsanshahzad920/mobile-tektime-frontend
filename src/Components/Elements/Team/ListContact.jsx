import CookieService from '../../Utils/CookieService';
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiEditBoxLine } from "react-icons/ri";
import { MdDeleteOutline } from "react-icons/md";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Avatar } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationModal from "../../Utils/ConfirmationModal";

const ListContact = ({ contacts, loading, refreshContacts, setShowContactModal, setEditingContact }) => {
  const [t] = useTranslation("global");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleDeleteClick = (contactId) => {
    setContactToDelete(contactId);
    setShowConfirmationModal(true);
    setOpenDropdownId(null); // Close the dropdown
  };

  const confirmDelete = async () => {
    if (isDeleting || !contactToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_BASE_URL}/contacts/${contactToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(t("contacts.delete_success"));
        refreshContacts(); // Refresh the contact list after deletion
      }
    } catch (error) {
      console.error("Delete contact error:", error);
      toast.error(t("contacts.delete_error"));
    } finally {
      setIsDeleting(false);
      setShowConfirmationModal(false);
      setContactToDelete(null);
    }
  };

  return (
    <div className="destination-to-participants">
      <table className="team-members-table">
        <thead>
          <tr className="table-header-row">
            <th>#</th>
            <th>{t("invities.name")}</th>
            <th>{t("invities.email")}</th>
            <th>{t("team.Account")}</th>
            <th>{t("header.teams")}</th>
            <th>{t("invities.post")}</th>
            {/* <th>{t("invities.enterprise")}</th> */}
            <th>{t("invities.phone")}</th>
            <th>Type</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts?.map((item, index) => (
            <tr key={item.id || index} className="team-member-row">
              <td>{index + 1}.</td>
              <td>
                <Avatar
                  src={
                    item?.image?.startsWith("http")
                      ? item?.image
                      : Assets_URL + "/" + item?.image
                  }
                />
                &nbsp; &nbsp;
                {(item?.first_name || item?.last_name)
                  ? `${item?.first_name || ''} ${item?.last_name || ''}`.trim()
                  : ''}


              </td>
              <td>{item?.email}</td>
              <td>
                <Avatar
                  src={
                    item?.clients?.client_logo?.startsWith("http")
                      ? item?.clients?.client_logo
                      : Assets_URL + "/" + item?.clients?.client_logo
                  }
                />
                &nbsp; &nbsp;
                {item?.clients?.name || "Unknown"}</td>
              <td>
                {item?.teams && item.teams.length > 0 ? (
                  <Avatar.Group maxCount={2} size="small">
                    {item.teams.map((team) => (
                      <Avatar
                        key={team.id}
                        src={
                          team?.team_image?.startsWith("http")
                            ? team?.team_image
                            : Assets_URL + "/" + team?.team_image
                        }
                        alt={team?.name}
                      />
                    ))}
                  </Avatar.Group>
                ) : (
                  <span className="text-muted">No Teams</span>
                )}
              </td>
              <td>{item?.role}</td>
              {/* <td>{item?.enterprise?.name}</td> */}
              <td>{item?.phone_number}</td>
              <td>
                <span className={`badge ${(item?.type?.toLowerCase() === "new" || item?.type?.toLowerCase() === "nouveau") ? "bg-secondary" :
                    (item?.type?.toLowerCase() === "provider" || item?.type?.toLowerCase() === "prestataire") ? "bg-warning" :
                      item?.type?.toLowerCase() === "client" ? "bg-success" :
                        "bg-secondary"
                  }`}>
                  {t(`contact.type.${(item?.type || "New").toLowerCase()}`) || (item?.type || "New")}
                </span>
              </td>
              <td className="text-center">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={openDropdownId === item.id}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "0px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(item.id);
                    }}
                  >
                    <BiDotsVerticalRounded color="black" size={"25px"} />
                  </button>
                  <ul
                    className={`dropdown-menu ${openDropdownId === item.id ? "show" : ""
                      }`}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setEditingContact(item);
                          setShowContactModal(true)
                        }}
                      >
                        <RiEditBoxLine size={"20px"} /> &nbsp;
                        {t("dropdown.To modify")}
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteClick(item.id)}
                        disabled={isDeleting}
                      >
                        <MdDeleteOutline size={"20px"} /> &nbsp;
                        {t("dropdown.Delete")}
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          message={t("contacts.delete_confirmation")}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmationModal(false);
            setContactToDelete(null);
          }}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ListContact;