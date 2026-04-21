import CookieService from '../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { IoDocumentOutline, IoVideocamOutline } from "react-icons/io5";
import { PiFilePdfLight } from "react-icons/pi";
import { RiFileExcel2Line } from "react-icons/ri";
import { Card } from "react-bootstrap";
import axios from "axios";
import { localizeVisibilityMessage } from "../../Meeting/GetMeeting/Helpers/functionHelper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FileUploadModal from "../../Meeting/CreateNewMeeting/FileUploadModal";

function StepFileTab({
  openModal,
  data,
  meetings,
  refreshFiles,
  showMoments,
  setShowMoments,
}) {
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const [visibilityMessage, setVisibilityMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState(null);

  useEffect(() => {
    if (visibilityMessage) {
      setIsModalOpen(true);
    }
  }, [visibilityMessage]);
  const formatFileSize = (bytes) => {
    if (!bytes) return;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return;
    const dateObj = new Date(timestamp);

    // Format the date as dd/mm/yyyy
    const date = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);

    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0"); // Add leading zero if needed

    const time = `${hours}h${minutes}`;
    return { date, time };
  };

  const handleFileClick = async (item) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/destination-files/${item?.id}/${item.meeting_id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response?.data) {
        openModal(item);
        setVisibilityMessage(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      const status = error?.response?.status || 500;
      const message = error?.response?.data?.message || "An error occurred.";
      setVisibilityMessage(message);
      setIsModalOpen(true);
    }
    setSelectedFile(item);
  };

  const checkPassword = async () => {
    try {
      const payload = {
        password: password,
        meeting_id: selectedFile?.meeting_id,
      };

      const response = await axios.post(
        `${API_BASE_URL}/check-meeting-password`,
        payload
      );

      if (response?.status) {
        setIsModalOpen(false);
        setVisibilityMessage(null);
        setPassword(null);
        openModal(selectedFile);
      }
    } catch (error) {
      toast.error("Incorrect password");
    }
  };

  const handleLogin = () => {
    navigate("/", {
      state: {
        fromInvitePage: true,
        invitePageURL: window.location.pathname + window.location.search,
        meetingData: selectedFile?.meeting_id,
      },
    });
  };
  const [showFileModal, setShowFileModal] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [selectedMomentId, setSelectedMomentId] = useState(null);

  const handleMomentSelect = (moment) => {
    setSelectedMomentId(moment.id); // assuming `moment.id` is the ID
    setShowFileModal(true); // open the modal
  };

  const handleFileChange = (event) => {
    event.target.value = "";
  };
  return (
    <>
      <div className="row" style={{ marginBottom: "3rem", gap: "4px" }}>
        {data?.map((item, index) => {
          return (
            <div key={item?.id}>
              <div className="col-12 ste">
                <Card
                  className="mt-4 step-card-meeting"
                  onClick={() => handleFileClick(item)}
                >
                  <Card.Body className="step-card-body">
                    <div className="step-number-container">
                      <span className="step-number">
                        {index < 10 ? "0" : " "}
                        {index + 1}
                      </span>
                    </div>
                    <div className="step-body">
                      <div className="step-data stepcard-stepdata">
                        <div className="step-header">
                          <div className="d-flex flex-column  ">
                            <h6
                              className="destination p-0 m-0 "
                              style={{
                                fontFamily: "Inter",
                                fontSize: "14px",
                                fontWeight: 400,
                                lineHeight: "30px",
                                textAlign: "left",
                                color: "#8590a3",
                              }}
                            >
                              {" "}
                              {item?.meeting_title}
                            </h6>
                            <div className="d-flex gap-2">
                              <Card.Title className="step-card-heading">
                                {item?.file_name}
                              </Card.Title>
                              <span className="status-badge-upcoming">
                                {item?.file_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="step-content">
                          <Card.Subtitle className="step-card-subtext">
                            <img
                              height="24px"
                              width="24px"
                              style={{
                                marginRight: "9px",
                                borderRadius: "20px",
                                objectFit: "cover",
                                objectPosition: "top",
                              }}
                              src={
                                item?.creator?.image?.startsWith("http")
                                  ? item?.creator?.image
                                  : Assets_URL + "/" + item?.creator?.image
                              }
                              alt="img"
                            />
                            <span>{item?.creator?.full_name}</span>
                          </Card.Subtitle>
                          <Card.Text className="step-card-content flex-row align-items-center card-text gap-0">
                            <img
                              height="16px"
                              width="16px"
                              src="/Assets/ion_time-outline.svg"
                            />

                            <span className="me-2">
                              {`${formatDateTime(item?.created_at)?.date}` +
                                " " +
                                `${t("at")}` +
                                " " +
                                `${formatDateTime(item?.created_at)?.time}`}
                            </span>
                          </Card.Text>
                          <Card.Text className="step-card-content flex-row align-items-center gap-0 mb-3">
                            <span className="">
                              <img
                                height="16px"
                                width="16px"
                                src="/Assets/alarm-invite.svg"
                              />
                            </span>
                            <>
                              <span>{formatFileSize(item?.file_size)}</span>
                            </>
                          </Card.Text>
                        </div>
                      </div>

                      {/* --------img */}
                      <div className="step-images">
                        {item?.file_type ===
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                        item?.file_type === "application/vnd.ms-excel" ? (
                          <div className="file-img-container">
                            <RiFileExcel2Line
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        ) : item?.file_type === "application/pdf" ? (
                          <div className="file-img-container">
                            <PiFilePdfLight
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        ) : item?.file_type === "application/msword" ||
                          item?.file_type ===
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                          <div className="file-img-container">
                            <IoDocumentOutline
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        ) : item?.file_type?.startsWith("audio/") ? (
                          <img
                            src="/Assets/audio-logo.png"
                            alt="Audio File"
                            style={{ height: "5rem", width: "auto" }}
                          />
                        ) : item?.file_type?.startsWith("video/") ? (
                          <div className="file-img-container">
                            <IoVideocamOutline
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        ) : item?.file_type?.startsWith("image/") ? (
                          <div className="file-img-container">
                            <MdOutlinePhotoSizeSelectActual
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        ) : (
                          <div className="file-img-container">
                            <IoDocumentOutline
                              className="file-img img-fluid"
                              style={{ padding: "14px" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          );
        })}
        {/* <div className="invite-buttons mt-3">
              
                <button
                  onClick={() => setShowMoments(true)}
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "24px",
                    textAlign: "left",
                    color: "#FFFFFF",
                    background: "#2C48AE",
                    border: 0,
                    outline: 0,
                    padding: "10px 16px",
                    borderRadius: "9px",
                    marginTop: "20px",
                  }}
                >
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                      fill="white"
                    />
                  </svg>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {t("addFile")}
                </button>
              </div> */}
      </div>
      {/* <div className="invite-buttons mt-3">
                <input
                  type="file"
                  id="fileInput"
                  // accept="application/pdf"
                  accept="
                                          application/pdf,
                                          application/vnd.ms-excel,
                                          application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                                          application/vnd.ms-powerpoint,
                                          application/vnd.openxmlformats-officedocument.presentationml.presentation,
                                          application/msword,
                                          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                          image/png,
                                          image/webp
                                          video/mp4,
                                          video/x-msvideo,
                                          video/x-matroska,
                                          video/mpeg,
                                          video/quicktime"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => setShowFileModal(true)}
                  style={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "24px",
                    textAlign: "left",
                    color: "#FFFFFF",
                    background: "#2C48AE",
                    border: 0,
                    outline: 0,
                    padding: "10px 16px",
                    borderRadius: "9px",
                    marginTop: "20px",
                  }}
                >
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                      fill="white"
                    />
                  </svg>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {t("addFile")}
                </button>
              </div> */}

      {isModalOpen && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            {/* Close Button */}
            <button
              className="btn-close"
              style={{ position: "absolute", top: "10px", right: "10px" }}
              onClick={() => {
                setIsModalOpen(false);
                setVisibilityMessage(null);
                setPassword(null);
              }}
            ></button>
            <p>{localizeVisibilityMessage(visibilityMessage, t)}</p>
            {visibilityMessage === "Please log in to view files." ? (
              <button className="btn btn-primary" onClick={handleLogin}>
                Login
              </button>
            ) : visibilityMessage === "Please enter password to view files." ? (
              <div className="d-flex flex-column gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkPassword()}
                />
                <button className="btn btn-primary" onClick={checkPassword}>
                  Submit
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showMoments && (
        <div className="custom-modal-backdrop">
          <div
            className="custom-modal-content"
            style={{
              width: meetings?.length > 8 ? "70vw" : "40vw", // Increase width if many moments
              maxHeight: "80vh",
              overflowY: "auto",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
              {t("destination.select the moment in which you want to add file")}
            </h5>
            <div className="moments-list">
              {meetings?.map((moment, i) => (
                <div
                  key={moment?.id}
                  onClick={() => {
                    setSelectedMomentId(moment?.id); // Save selected moment ID
                    setShowMoments(false);
                    setShowFileModal(true);
                  }}
                  className="moment-item"
                >
                  <span style={{ fontWeight: "500" }}>
                    {i + 1}. {moment?.title}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMoments(false)}
              style={{
                marginTop: "1rem",
                background: "#ccc",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}

      {showFileModal && (
        <div className="file-modal-overlay">
          <div
            className="file-modal-content w-100 h-100"
            style={{ background: "rgb(242, 244, 251)" }}
          >
            <button
              className="file-modal-close"
              onClick={() => setShowFileModal(false)}
            >
              ×
            </button>
            <FileUploadModal
              meetingId={selectedMomentId}
              setShowFileModal={setShowFileModal}
              isFileUploaded={isFileUploaded}
              setIsFileUploaded={setIsFileUploaded}
              refreshMeeting={refreshFiles}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default StepFileTab;
