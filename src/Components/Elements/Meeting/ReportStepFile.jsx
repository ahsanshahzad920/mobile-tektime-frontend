import React, {  useState } from "react";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { IoDocumentOutline, IoVideocamOutline } from "react-icons/io5";
import { PiFilePdfLight } from "react-icons/pi";
import { RiFileExcel2Line } from "react-icons/ri";
import { Card } from "react-bootstrap";

function ReportStepFile({ data }) {
  const [t] = useTranslation("global");
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

  return (
    <div
      className="col-12 email-step"
      style={{ marginBottom: "3rem", gap: "4px" }}
    >
      {data?.map((item, index) => {
        return (
          <Card
            className="mt-4 step-card"
            key={item?.id}
            //   onClick={() => openModal(item)}
          >
            <Card.Body className="d-flex">
              <div className="d-flex align-items-center">
                <div className="step-number-container">
                  <span className="step-number">
                    {index < 10 ? "0" : " "}
                    {index + 1}
                  </span>
                </div>

                <div className={`d-block`}>
                  {item?.file_type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                  item?.file_type === "application/vnd.ms-excel" ? (
                    <div className="file-img-container">
                      <RiFileExcel2Line
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
                      />
                    </div>
                  ) : item?.file_type === "application/pdf" ? (
                    <div className="file-img-container">
                      <PiFilePdfLight
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
                      />
                    </div>
                  ) : item?.file_type === "application/msword" ||
                    item?.file_type ===
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                    <div className="file-img-container">
                      <IoDocumentOutline
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
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
                        style={{ padding: "40px" }}
                      />
                    </div>
                  ) : (
                    <div className="file-img-container">
                      <MdOutlinePhotoSizeSelectActual
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div
                className="ms-3 d-flex justify-content-center flex-column step-data w-100"
                style={{ overflow: "auto" }}
              >
                <div className="step-header justify-content-between">
                  <div className="d-flex">
                    <Card.Title className="step-card-heading">
                      {item?.file_name}
                    </Card.Title>
                    <>
                      <span className="status-badge-upcoming">
                        {item?.file_type}
                      </span>
                    </>
                  </div>
                </div>
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
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default ReportStepFile;
