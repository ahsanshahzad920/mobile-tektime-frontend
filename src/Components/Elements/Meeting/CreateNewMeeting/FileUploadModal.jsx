import CookieService from '../../../Utils/CookieService';
import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { API_BASE_URL } from "../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { read, utils } from "xlsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
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
  const [fileContent, setFileContent] = useState(null); // For file content preview
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

        if (selectedFile.name.endsWith(".xls")) {
          // Example usage:
          const reader = new FileReader();
          reader.onload = (e) => {
            const binaryStr = e.target.result;
            const workbook = read(binaryStr, { type: "binary" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = utils.sheet_to_json(firstSheet, { header: 1 });
            setFilePreview(sheetData); // Store parsed Excel data
          };
          reader.readAsBinaryString(selectedFile);
        } else if (
          selectedFile.name.endsWith(".docx") ||
          selectedFile.name.endsWith(".xlsx")
        ) {
          // // Handle Docx file
          // const fileUrl = URL.createObjectURL(selectedFile);
          // setFileContent(fileUrl); // Correctly set docPreview
          // Upload .docx file to Cloudinary
          try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("upload_preset", "chat-application"); // Replace with your upload preset
            formData.append("cloud_name", "drrk2kqvy"); // Replace with your Cloudinary cloud name

            const response = await axios.post(
              "https://api.cloudinary.com/v1_1/drrk2kqvy/auto/upload", // Replace with your Cloudinary upload endpoint
              formData
            );

            const publicUrl = response?.data?.secure_url;
            setFileContent(publicUrl); // Save the Cloudinary public URL
          } catch (error) {
            console.error("Error uploading the file:", error);
            alert("Failed to upload the file.");
          }
        } else {
          setFilePreview(null); // Reset preview for non-Excel files
        }

        setTimeout(() => setIsUpload(false), 2000); // Mock upload delay
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
                {file?.path?.endsWith(".docx") ||
                file?.path?.endsWith(".doc") ||
                file?.path?.endsWith(".xlsx") ||
                file?.path?.endsWith(".xls") ? (
                  <div className="file-viewer-container">
                    <DocViewer
                      documents={[{ uri: `${fileContent}` }]}
                      pluginRenderers={DocViewerRenderers}
                      config={{
                        header: {
                          disableFileName: true,
                          retainURLParams: true,
                        },
                      }}
                      onError={() => toast.error("Unable to load the document")}
                    />
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
