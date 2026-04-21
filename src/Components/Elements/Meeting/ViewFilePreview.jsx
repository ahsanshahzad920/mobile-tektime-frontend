import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { toast } from "react-toastify";

function ViewFilePreview({
  isModalOpen,
  setIsModalOpen,
  modalContent,
  closeModal,
  isFileUploaded,
  setIsFileUploaded,
  refreshMeeting,
  fromReport = false,
}) {
  const fileUrl = modalContent
    ? `${Assets_URL}/${modalContent?.file_path}`
    : "";
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [t] = useTranslation("global");

  useEffect(() => {
    // If the file is Excel, load its data
    if (
      modalContent?.file_type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      modalContent?.file_type === "application/vnd.ms-excel"
    ) {
      loadExcelData(modalContent?.file_path);
    } else if (
      modalContent?.file_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      modalContent?.file_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      loadDocFile(modalContent?.file_path);
    }
  }, [modalContent]);

  const loadExcelData = async (filePath) => {
    setLoading(true);
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
        setExcelData(json);
      };
      reader.readAsBinaryString(blob);
    } catch (error) {
      console.error("Error loading Excel file", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocFile = (filePath) => {
    // Optionally fetch or do other logic if required before displaying the document
    // Currently, the file is directly passed to the FileViewer component
  };

  const deleteFile = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/meeting-files/${modalContent?.id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        setLoading(false);
        setIsModalOpen(false);
        setIsFileUploaded((prev) => !prev);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      await refreshMeeting();
    }
  };


  return (
    <div className="viewfilepreview">
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null} // Custom footer inside body or removing default to save space
        width="90%"
        centered
        styles={{
          body: {
            height: "85vh",
            overflow: "hidden",
            padding: 0,
            display: "flex",
            flexDirection: "column"
          }
        }}
        // Antd v4/v5 compat: bodyStyle for v4, styles.body for v5. Keeping bodyStyle as fallback or mix if needed, but styles prop is better for v5.
        // Assuming v4 based on previous code usually using bodyStyle. usage:
        bodyStyle={{
          height: "85vh",
          overflow: "hidden",
          padding: 0,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {modalContent ? (
          <div className="d-flex flex-column h-100">
            {/* Show PDF or Other File Types */}
            <div className="flex-grow-1" style={{ overflow: "auto", position: "relative" }}>
              {modalContent?.file_type &&
                modalContent?.file_type.includes("pdf") ? (
                <iframe
                  title="File Preview"
                  src={`${fileUrl}#toolbar=0&view=fitH`}
                  className="fileuploadingiframe w-100 h-100"
                  style={{
                    border: "none",
                    display: "block"
                  }}
                ></iframe>
              ) : modalContent?.file_type?.includes("video") ? (
                <div className="w-100 h-100 d-flex justify-content-center bg-black" style={{ backgroundColor: "#000" }}>
                  <video
                    controls
                    className="w-100 h-100"
                    style={{ objectFit: "contain" }}
                    src={fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : modalContent?.file_type?.startsWith("image/") ? (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "#f8f9fa" }}>
                  <img
                    src={fileUrl}
                    className="w-100 h-100"
                    style={{ objectFit: "contain" }}
                    alt="preview"
                  />
                </div>
              ) : null}

              {/* Show Excel Preview if the file is Excel */}
              {modalContent?.file_type === "application/vnd.ms-excel" ? (
                <div className="table-responsive h-100">
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <Spinner
                        as="span"
                        variant="light"
                        size="lg"
                        role="status"
                        aria-hidden="true"
                        animation="border"
                        className="text-primary"
                      />
                    </div>
                  ) : (
                    <div className="table-responsive h-100">
                      <table className="table table-bordered mb-0">
                        <thead>
                          <tr>
                            {Object.keys(excelData[0] || {}).map((key, index) => (
                              <th key={index}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value, colIndex) => (
                                <td key={colIndex}>{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (modalContent &&
                modalContent?.file_type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                modalContent?.file_type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                modalContent?.file_type === "text/plain" ||
                modalContent?.file_type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                <div className="file-viewer-container h-100">
                  <DocViewer
                    documents={[
                      { uri: `${Assets_URL}/${modalContent?.file_path}` },
                    ]}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true,
                        disableFileName: true,
                        retainURLParams: true,
                      },
                    }}
                    style={{ height: '100%' }}
                  />
                </div>
              ) : null}
            </div>

            {/* Delete and Close Buttons - Fixed at bottom */}
            <div className="d-flex gap-2 justify-content-center align-items-center py-3 bg-white border-top">
              {!fromReport && <Button
              variant="danger"
                // danger // using antd danger prop or variant="danger" if bootstrap button
                className="delete-file-modal-button"
                type="submit"

                onClick={deleteFile}
                disabled={loading}
                style={{ minWidth: '100px' }}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"
                  />
                ) : (
                  <>{t("buttons.Delete")}</>
                )}
              </Button>}
              <Button
                key="close"
                onClick={closeModal}
                className="close-file-modall-button"
                style={{ minWidth: '100px' }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <p>No content to display.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ViewFilePreview;
