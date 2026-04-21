import CookieService from '../../Utils/CookieService';
import React, { useState } from "react";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ConfirmationModal from "../../Utils/ConfirmationModal";
import CreateClient from "./CreateClient";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { FaList, FaTh } from "react-icons/fa";
import TeamCard from "./TeamCard";

function Clienttab({ clients = [], enterprise, clientLoading, getClients }) {
  const [t] = useTranslation("global");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const navigate = useNavigate();
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/clients/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response?.status) {
        getClients();
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id);
    setShowConfirmationModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    handleDelete(itemIdToDelete);
  };

  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const handleUpdate = (e, client) => {
    e.stopPropagation();
    setSelectedClient(client);
    setShowClientModal(true);
  };
  const closeModal = () => {
    setShowClientModal(false);
  };


      const [isCardView, setIsCardView] = useState(true);
    
  const handleToggle = (viewType) => {
    setIsCardView(viewType === "card");
  };

  return (
    <>
      {clientLoading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div className="py-3 team-new-card">
           {/* 🔄 View Toggle */}
           <div className="contact-view-container p-0">

          <div className="view-toggle-container mb-3 d-flex justify-content-end">
            <div className="toggle-buttons d-flex gap-2" >
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

           {isCardView ? (
  <div className="row">
             
                  <TeamCard
                              teams={clients}
  isClientView={true}
              isMemberView={false}
              isTeamView={false}
              isTeamMemberView={false}
              isCastingView={false}
              isEnterpriseView={false}
              isContactView={false}
              show={showClientModal}
              setShow={setShowClientModal}
              refresh={getClients}
                           clientId={null}

                  />
               
            </div>
           ) : (
<>
{clients.map((client, index) => (
  <div
    key={client.id || index}
    className="text-decoration-none"
    style={{ cursor: "pointer" }}
    onClick={() => navigate(`/client/${client.id}`)}
  >
    <div className="mt-3 mb-2 scheduled card team-card-sheduled p-4 rounded-4 border">
      <div className="row">
        <div
          className="col-md-1 column-1"
          style={{ fontSize: "24px" }}
        >
          <div className="profile-logo">
            <img
              className="rounded-circle"
              width={70}
              height={70}
              style={{
                objectFit: "cover",
                objectPosition: "top",
              }}
              src={
                client?.client_logo
                  ? client?.client_logo?.startsWith("http")
                    ? client?.client_logo
                    : Assets_URL + "/" + client?.client_logo
                  : `https://ui-avatars.com/api/?name=${
                      client.name || "CL"
                    }&color=7F9CF5&background=EBF4FF`
              }
              alt={client?.name}
            />
          </div>
        </div>
        <div className="col-md-10" style={{ paddingLeft: "18px" }}>
          <div className="row">
            <div className="col-12">
              {/* <h6 className="destination">{client.name}</h6> */}
              <span className="heading">
                {client.name}{" "}
                {/* <span className="status-badge-red1 mx-2 badge">
              {client.status || "Waiting"}
            </span> */}
              </span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-4 col-12">
              <svg
                width={16}
                height={16}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.14258 2.5C4.83008 2.5 2.14258 5.1875 2.14258 8.5C2.14258 11.8125 4.83008 14.5 8.14258 14.5C11.4551 14.5 14.1426 11.8125 14.1426 8.5C14.1426 5.1875 11.4551 2.5 8.14258 2.5Z"
                  stroke="#92929D"
                  strokeMiterlimit={10}
                />
                <path
                  d="M8.14258 4.5V9H11.1426"
                  stroke="#92929D"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="time">
                {" "}
                {moment(client?.created_at)
                  .tz(moment.tz.guess())
                  .format("DD/MM/YYYY [at] HH[h]mm")}
              </span>
              &nbsp;
              <span>{moment.tz.guess()}</span>
            </div>
            <div className="col-md-4 col-12">
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                  fill="#8590A3"
                />
              </svg>
              <span className="time">
                {" "}
                {t(`client_types.${client?.type}`)}
              </span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-4 mt-2">
              <div className="creator">Creator</div>
              <div>
                <span className="ant-avatar-circle ant-avatar-image css-1pg9a38 rounded-circle">
                  <img
                    src={
                      client?.created_by?.image?.startsWith("http")
                        ? client?.created_by?.image
                        : Assets_URL + "/" + client?.created_by?.image
                    }
                    className="rounded-circle"
                    width={30}
                    height={30}
                    style={{
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                    alt={client?.created_by?.full_name}
                  />
                  <span className="creator-name">
                    {client.created_by?.full_name}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-1 d-flex justify-content-end">
          <div className="col-md-1 text-end obj1 d-flex justify-content-end ">
            <div
              className="dropdown dropstart"
              onClick={(e) => e.stopPropagation()}
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
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth={0}
                  viewBox="0 0 24 24"
                  color="black"
                  height="25px"
                  width="25px"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "black" }}
                >
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              <ul className="dropdown-menu ">
                <li
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleUpdate(e, client)}
                >
                  <a className="dropdown-item">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 24 24"
                      height="20px"
                      width="20px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Edit">
                        <g>
                          <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z" />
                          <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z" />
                        </g>
                      </g>
                    </svg>
                    &nbsp; {t("user.modify")}
                  </a>
                </li>
                <li
                  style={{ cursor: "pointer" }}
                  onClick={(e) => handleDeleteClick(e, client?.id)}
                >
                  <a className="dropdown-item">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 24 24"
                      height="20px"
                      width="20px"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z" />
                    </svg>
                    &nbsp;{t("user.delete")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
))}

</>
           )}


          {showConfirmationModal && (
            <ConfirmationModal
              message={t("user.clientDeletedToast")}
              onConfirm={(e) => confirmDelete(e)}
              onCancel={(e) => {
                e.stopPropagation();
                setShowConfirmationModal(false);
              }}
            />
          )}

          {!isCardView && showClientModal && (
            <CreateClient
              client={selectedClient}
              setClient={setSelectedClient}
              show={showClientModal}
              close={closeModal}
              getClients={getClients}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Clienttab;
