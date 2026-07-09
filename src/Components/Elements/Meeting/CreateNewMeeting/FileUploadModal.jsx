import CookieService from '../../../Utils/CookieService';
import React, { useState, useMemo } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { API_BASE_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { read, utils } from "xlsx";
import { FileText } from "lucide-react";
import { toast } from "react-toastify";

function FileUploadModal({
  meetingId,
  setShowFileModal,
  isFileUploaded,
  setIsFileUploaded,
  refreshMeeting,
}) {
  const [isUpload, setIsUpload] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // For file content preview
  const [loading, setLoading] = useState(false);
  const userID = parseInt(CookieService.get("user_id"));
  const [t] = useTranslation("global");

 const { getRootProps, getInputProps } = useDropzone({
  onDrop: async (acceptedFiles) => {
    const allowedExtensions = [
      ".xlsx",
      ".pdf",
      ".docx",
      ".png",
      ".txt",
      ".mp4",
    ];

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Limit to 10 MB
      const maxFileSize = 10 * 1024 * 1024; // 10 MB in bytes
      if (selectedFile.size > maxFileSize) {
        toast.error(t("fileSizeError")); // Show an error message
        return;
      }
      const fileExtension = selectedFile?.name
        ?.slice(selectedFile?.name?.lastIndexOf("."))
        .toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error("This file type is not allowed."); // Show an error message
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setIsUpload(true);
      setTimeout(() => setIsUpload(false), 600);
    }
  },
  accept: ".xlsx, .pdf, .docx, .png, .txt, .mp4",
});

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append("meeting_id", meetingId);
    formData.append("file", file);
    formData.append("file_size", file?.size);
    formData.append("created_by", userID);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/meeting-files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        setLoading(false);
        setShowFileModal(false);
        setIsFileUploaded((prev) => !prev);
        refreshMeeting();
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fileuploadmodal">
      <div className="col-md-12 p-4">
        {!isUpload ? (
          <>
            <div
              className={`d-flex align-items-center gap-4 ${
                fileName ? "" : "h-100"
              }`}
            >
              <div
                {...getRootProps()}
                style={{
                  border: "1px dashed #BAC3D4",
                  padding: "5px 7px",
                  width: fileName ? "auto" : "100%",
                  borderRadius: "50px",
                  outline: "none",
                  margin: fileName ? "" : "0 auto",
                  height: fileName ? "auto" : "80vh",
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                {fileName ? (
                  <div>Selected file: {fileName}</div>
                ) : (
                  <p className="upload-container">
                    <span className="upload-text">
                      Drag and drop here to upload
                    </span>
                    <span className="upload-or">OR</span>
                    <span className="browse-button">Browse</span>
                  </p>
                )}
              </div>
            </div>

            {file && (
              <>
                {file?.name?.endsWith(".docx") ||
                file?.name?.endsWith(".doc") ||
                file?.name?.endsWith(".xlsx") ||
                file?.name?.endsWith(".xls") ? (
                  <div className="mt-3 p-4 d-flex flex-column align-items-center justify-content-center bg-light border rounded w-100" style={{ minHeight: "350px", borderStyle: "dashed" }}>
                    <div className="mb-3 text-success">
                      <FileText size={64} />
                    </div>
                    <h4>{file.name}</h4>
                    <p className="text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <span className="badge bg-success px-3 py-2" style={{ fontSize: "0.9rem" }}>Ready to upload</span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="pdf-preview">
                      <iframe
                        className="w-100"
                        src={URL.createObjectURL(file)}
                        style={{ minHeight: "450px" }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                className="mt-4 social-info-update"
                type="submit"
                onClick={handleFileUpload}
                disabled={loading}
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
                  <>{t("invities.create")}</>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Spinner
            animation="border"
            role="status"
            className="center-spinner"
          />
        )}
      </div>
    </div>
  );
}

export default FileUploadModal;
