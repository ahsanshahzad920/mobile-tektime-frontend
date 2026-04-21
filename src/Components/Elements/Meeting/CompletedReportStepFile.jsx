import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { Empty } from "antd";
import * as XLSX from "xlsx";
import {
  MdKeyboardArrowDown,
  MdOutlinePhotoSizeSelectActual,
} from "react-icons/md";
import { IoDocumentOutline, IoVideocamOutline } from "react-icons/io5";
import { PiFilePdfLight } from "react-icons/pi";
import { RiFileExcel2Line } from "react-icons/ri";
import { Card } from "react-bootstrap";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

function CompletedReportStepFile({ data }) {
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

  const [dropdownVisibleIndex, setDropdownVisibleIndex] = useState(null);

  const toggleDropdown = (index) => {
    setDropdownVisibleIndex((prev) => (prev === index ? null : index));
  };

  const loadExcelData = async (filePath) => {
    // setLoading(true);
    try {
      const response = await fetch(`${Assets_URL}/${filePath}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
      };
      reader.readAsBinaryString(blob);
    } catch (error) {
      console.error("Error loading Excel file", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (dropdownVisibleIndex !== null) {
      const selectedItem = data[dropdownVisibleIndex];
      if (
        selectedItem?.file_type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedItem?.file_type === "application/vnd.ms-excel"
      ) {
        loadExcelData(selectedItem.file_path);
      }
    }
  }, [dropdownVisibleIndex, data]);

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
            onClick={() => toggleDropdown(index)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="d-flex">
              <div
                className={`${
                  dropdownVisibleIndex === index
                    ? "d-none d-flex align-items-start"
                    : "d-block"
                }`}
              >
                {/* <div className="step-number-container">
                  <span className="step-number">
                    {index < 10 ? "0" : " "}
                    {index + 1}
                  </span>
                </div> */}

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
                  ) : item?.file_type?.startsWith("image/") ? (
                    <div className="file-img-container">
                      <MdOutlinePhotoSizeSelectActual
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
                      />
                    </div>
                  ) : (
                    <div className="file-img-container">
                      <IoDocumentOutline
                        className="file-img img-fluid"
                        style={{ padding: "40px" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex flex-column justify-content-center w-100">
                <div className="mx-3 d-flex justify-content-between align-items-center step-data w-100">
                  <Card.Title
                    className="step-card-heading"
                    style={{ fontSize: "larger" }}
                  >
                    {item?.file_name}

                    <span className="ms-3 status-badge-upcoming">
                      {item?.file_type}
                    </span>
                  </Card.Title>

                  <span style={{ padding: "10px" }}>
                    <span
                      style={{
                        fontFamily: "Roboto",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "16.41px",
                        textAlign: "left",
                        color: "#92929D",
                      }}
                    >
                      <img
                        height="16px"
                        width="16px"
                        src="/Assets/alarm-invite.svg"
                      />
                      <>
                        <span>{formatFileSize(item?.file_size)}</span>
                      </>
                    </span>
                    <MdKeyboardArrowDown
                      style={{ cursor: "pointer" }}
                      size={26}
                    />
                  </span>
                </div>

                <div style={{ padding: "10px" }}>
                  <Card.Text className="step-card-content d-flex align-items-center">
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

                    <img
                      height="16px"
                      width="16px"
                      src="/Assets/ion_time-outline.svg"
                      style={{ marginLeft: "1rem", marginRight: ".2rem" }}
                    />

                    <span className="me-2">
                      {`${formatDateTime(item?.created_at)?.date}` +
                        " " +
                        `${t("at")}` +
                        " " +
                        `${formatDateTime(item?.created_at)?.time}`}
                    </span>
                  </Card.Text>
                </div>

                {dropdownVisibleIndex === index && (
                  <div className={` align-items-start`}>
                    <div>
                      {(item?.file_type &&
                        (item?.file_type.includes("pdf") ||
                          item?.file_type.includes("image"))) ||
                      item?.file_type.includes("video") ? (
                        <iframe
                          title="File Preview"
                          src={`${Assets_URL}/${item?.file_path}#toolbar=0&view=fitH`}
                          className="fileuploadingiframe w-100"
                          style={{
                            border: "none",
                            width: "100%",
                            height: "450px",
                          }}
                        ></iframe>
                      ) : null}

                      {/* {item?.file_type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      item?.file_type === "application/vnd.ms-excel" ? (
                        <div className="table-responsive">
                          <div
                            className="table-responsive"
                            style={{ height: "20rem" }}
                          >
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  {Object?.keys(excelData[0] || {}).map(
                                    (key, index) => (
                                      <th key={index}>{key}</th>
                                    )
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {excelData?.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {Object.values(row).map(
                                      (value, colIndex) => (
                                        <td key={colIndex}>{value}</td>
                                      )
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : null} */}

                      {(item?.file_type &&
                        item?.file_type === "application/msword") ||
                      item?.file_type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                      item?.file_type ===
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      item?.file_type === "application/vnd.ms-excel" ||
                      item?.file_type === "text/plain" ? (
                        <div className="file-viewer-container">
                          <DocViewer
                            documents={[
                              { uri: `${Assets_URL}/${item?.file_path}` },
                            ]}
                            pluginRenderers={DocViewerRenderers}
                            config={{
                              header: {
                                disableFileName: true,
                                retainURLParams: true,
                              },
                            }}
                            onError={() =>
                              toast.error("Unable to load the document")
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}

export default CompletedReportStepFile;
