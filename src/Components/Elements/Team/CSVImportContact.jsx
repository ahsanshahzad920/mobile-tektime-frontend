import CookieService from '../../Utils/CookieService';
import React, { useState, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import { RxCross2, RxUpload, RxFileText, RxTable } from "react-icons/rx";
import { FiCheckCircle, FiAlertCircle, FiDownload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";

const CSVImportContact = ({
  showImportModal,
  setShowImportModal,
  refreshContacts,
}) => {
  const [t] = useTranslation("global");
  const [activeStep, setActiveStep] = useState(1);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Database fields for client import
  const dbFields = [
    { id: "name", name: t("invities.client_name"), required: true },
    // { id: "client_need", name: t("Client Need"), required: false },
    {
      id: "client_need_description",
      name: t("Entreprise.Description"),
      required: false,
    },
    { id: "type", name: t("invities.client_type"), required: true },
    { id: "mailing_address", name: t("Mailing Address") },
    { id: "siret_number", name: t("SIRET Number") },
    { id: "vat_number", name: t("VAT Number") },
    {
      id: "contact_email",
      name: t("Contact Email"),
      required: false,
      type: "email",
    },
  ];

  // Handle drag events for file drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      handleFileChange(files[0]);
    }
  };

  // Handle file selection
  const handleFileChange = (file) => {
    if (!file) return;
    setCsvFile(file);
    parseCSV(file);
  };

  // Parse CSV file
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV parsing errors:", results.errors);
        }

        // Keep all rows that have at least one non-empty value
        const filteredData = results.data.filter((row) =>
          Object.values(row).some(
            (val) =>
              val !== undefined && val !== null && val.toString().trim() !== ""
          )
        );

        setCsvData(filteredData);
        setHeaders(Object.keys(filteredData[0] || {}));
        initializeFieldMappings(Object.keys(filteredData[0] || {}));
        setActiveStep(2);
      },
    });
  };

  // Initialize field mappings
  const initializeFieldMappings = (csvHeaders) => {
    const initialMappings = {};
    dbFields.forEach((field) => {
      // Try to auto-match columns with similar names
      const matchedHeader = csvHeaders.find(
        (header) =>
          header.toLowerCase().includes(field.id.toLowerCase()) ||
          header.toLowerCase().includes(field.name.toLowerCase())
      );
      initialMappings[field.id] = matchedHeader || "";
    });
    setFieldMappings(initialMappings);
  };

  // Handle mapping changes
  const handleMappingChange = (dbField, csvHeader) => {
    setFieldMappings((prev) => ({
      ...prev,
      [dbField]: csvHeader,
    }));
  };

  // Validate data before upload
  const validateData = () => {
    const errors = [];

    // Validate required fields
    dbFields
      .filter((f) => f.required)
      .forEach((field) => {
        if (!fieldMappings[field.id]) {
          errors.push(`Missing mapping for required field: ${field.name}`);
        }
      });

    // Validate email format for contact_email
    if (fieldMappings.contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      csvData.forEach((row, index) => {
        const email = row[fieldMappings.contact_email];
        if (email && !emailRegex.test(email)) {
          errors.push(`Row ${index + 1}: Invalid email format (${email})`);
        }
      });
    }

    setValidationErrors(errors);
    return true; // Don't block upload for validation errors
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get enterprise_id from session storage
      const user = JSON.parse(CookieService.get("user"));
      const enterpriseId = parseInt(user?.enterprise_id);

      const payload = csvData.map((row, index) => {
        const mappedData = {};
        Object.entries(fieldMappings).forEach(([dbField, csvHeader]) => {
          if (csvHeader && row[csvHeader] !== undefined) {
            mappedData[dbField] = row[csvHeader];
          }
        });

        return {
          ...mappedData,
          _row: index + 1,
          enterprise_id: enterpriseId,
        };
      });

      console.log("Full payload being sent:", payload);

      // Upload all records regardless of validation
      const batchSize = 50;
      for (let i = 0; i < payload.length; i += batchSize) {
        const batch = payload.slice(i, i + batchSize);
        await axios.post(`${API_BASE_URL}/add-bulk-clients`, batch, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
            "Content-Type": "application/json",
          },
        });
        setUploadProgress(Math.round(((i + batchSize) / payload.length) * 100));
      }

      toast.success(`${payload.length} clients ${t("processed")}`);
      refreshContacts();
      handleClose();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error.response?.data?.message || "Import completed with some errors"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state when modal closes
  const resetState = useCallback(() => {
    setActiveStep(1);
    setCsvFile(null);
    setCsvData([]);
    setHeaders([]);
    setFieldMappings({});
    setIsUploading(false);
    setUploadProgress(0);
    setValidationErrors([]);
  }, []);

  const handleClose = () => {
    setShowImportModal(false);
    resetState();
  };

  // Render file upload area
  const renderFileUpload = () => (
    <div
      className={`file-upload-area ${isDragging ? "dragging" : ""}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={(e) => handleFileChange(e.target.files[0])}
        style={{ display: "none" }}
      />
      <RxUpload size={48} className="mb-3" />
      <h5>{t("Drag & Drop your CSV file here")}</h5>
      <p className="text-muted">{t("or click to browse files")}</p>
      {csvFile && (
        <div className="file-preview mt-3">
          <RxFileText className="me-2" />
          <span>{csvFile.name}</span>
          <span className="file-size">
            {(csvFile.size / 1024).toFixed(1)} KB
          </span>
        </div>
      )}
      <div className="requirements mt-4">
        <h6>{t("File Requirements")}:</h6>
        <ul>
          <li>
            {t("CSV format")} ({t("comma separated values")})
          </li>
          <li>{t("Maximum file size")}: 5MB</li>
          <li>
            {t("Should include name and client type")}
          </li>
        </ul>
        <Button
          variant="link"
          className="template-link"
          onClick={(e) => {
            e.stopPropagation();
            const link = document.createElement("a");
            link.href = "/templates/client-import-template.csv";
            link.download = "clients_template.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <FiDownload className="me-2" />
          {t("Download CSV Template")}
        </Button>
      </div>
    </div>
  );

  // Render field mapping table
  const renderFieldMapping = () => (
    <div className="mapping-container">
      <div className="mapping-header">
        <h5>{t("Map Your CSV Columns")}</h5>
        <p className="text-muted">
          {t("Match your CSV columns to the corresponding client fields")}
        </p>
      </div>

      <div className="mapping-table-container">
        <Table hover className="mapping-table">
          <thead>
            <tr>
              <th width="35%">Database Field</th>
              <th width="65%">{t("CSV Column")}</th>
            </tr>
          </thead>
          <tbody>
            {dbFields.map((field) => (
              <tr
                key={field.id}
                className={field.required ? "required-field" : ""}
              >
                <td>
                  <div className="field-label">
                    {field.name}
                    {field.required && (
                      <span className="required-badge">{t("Required")}</span>
                    )}
                  </div>
                  <div className="field-type">{field.type || "text"}</div>
                </td>
                <td>
                  <Form.Select
                    value={fieldMappings[field.id] || ""}
                    onChange={(e) =>
                      handleMappingChange(field.id, e.target.value)
                    }
                    className="mapping-select"
                  >
                    <option value="">-- {t("Not Mapped")} --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </Form.Select>
                  {fieldMappings[field.id] && (
                    <div className="sample-value">
                      {t("Sample")}:{" "}
                      {csvData[0]?.[fieldMappings[field.id]] || "Empty"}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="danger" className="mt-3">
          <h6>{t("Validation Issues")}:</h6>
          <ul>
            {validationErrors.slice(0, 5).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {validationErrors.length > 5 && (
              <li>
                ...{t("and")} {validationErrors.length - 5} {t("more issues")}
              </li>
            )}
          </ul>
        </Alert>
      )}
    </div>
  );

  // Render data preview
  const renderDataPreview = () => {
    const previewData = csvData.map((row) => {
      const previewRow = {};
      dbFields.forEach((field) => {
        previewRow[field.id] = fieldMappings[field.id]
          ? row[fieldMappings[field.id]]
          : null;
      });
      return previewRow;
    });

    return (
      <div className="preview-container">
        <div className="preview-header">
          <h5>{t("Import Preview")}</h5>
          <div className="stats">
            <span className="stat-item">
              <RxTable className="me-2" />
              {csvData.length} {t("records")}
            </span>
            <span className="stat-item">
              <FiCheckCircle className="me-2 text-success" />
              {csvData.length - validationErrors.length} {t("valid")}
            </span>
            {validationErrors.length > 0 && (
              <span className="stat-item">
                <FiAlertCircle className="me-2 text-danger" />
                {validationErrors.length} {t("issues")}
              </span>
            )}
          </div>
        </div>

        <div className="preview-table-container">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {dbFields.map((field) => (
                  <th key={field.id}>
                    {field.name}
                    {field.required && <span className="required-dot">•</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 5).map((row, rowIndex) => {
                const hasErrors = validationErrors.some((err) =>
                  err.includes(`Row ${rowIndex + 1}`)
                );

                return (
                  <tr
                    key={`row-${rowIndex}`}
                    className={hasErrors ? "error-row" : ""}
                  >
                    {dbFields.map((field) => (
                      <td key={`${rowIndex}-${field.id}`}>
                        {fieldMappings[field.id] ? (
                          <span className={!row[field.id] ? "empty-value" : ""}>
                            {row[field.id] || "Empty"}
                          </span>
                        ) : (
                          <span className="unmapped">{t("Not mapped")}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {csvData.length > 5 && (
          <div className="more-rows-indicator">
            {t("Showing first 5 of")} {csvData.length} {t("rows")}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress-container">
            <ProgressBar
              now={uploadProgress}
              label={`${uploadProgress}%`}
              animated
              variant="success"
              className="mb-2"
            />
            <div className="progress-stats">
              <span>
                {t("Uploading")} {csvData.length} {t("records")}...
              </span>
              <span>
                {uploadProgress}% {t("Complete")}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderFileUpload();
      case 2:
        return renderFieldMapping();
      case 3:
        return renderDataPreview();
      default:
        return null;
    }
  };

  return (
    <Modal
      show={showImportModal}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="xl"
      className="advanced-import-modal"
    >
      <Modal.Header className="border-0">
        <Modal.Title>
          <h4 className="mb-0">
            <span className="import-icon">
              <RxUpload />
            </span>
            {t("Import Client")}
          </h4>
        </Modal.Title>
        <Button
          variant="link"
          onClick={handleClose}
          className="close-button"
          disabled={isUploading}
        >
          <RxCross2 size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="stepper-modal-body">
        {/* Enhanced Stepper */}
        <div className="advanced-stepper">
          <div className={`step ${activeStep >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <div className="step-content">
              <div className="step-title">{t("Upload File")}</div>
              <div className="step-description">
                {t("Select your CSV file")}
              </div>
            </div>
          </div>
          <div className={`step ${activeStep >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <div className="step-title">{t("Map Fields")}</div>
              <div className="step-description">{t("Match CSV columns")}</div>
            </div>
          </div>
          <div className={`step ${activeStep >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <div className="step-title">{t("Review & Import")}</div>
              <div className="step-description">{t("Verify and complete")}</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content-container">{renderStepContent()}</div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <div className="w-100 d-flex justify-content-between">
          {activeStep > 1 && (
            <Button
              variant="outline-secondary"
              onClick={() => setActiveStep(activeStep - 1)}
              disabled={isUploading}
              className="back-button"
            >
              {t("Back")}
            </Button>
          )}

          {activeStep < 3 ? (
            <Button
              variant="primary"
              onClick={() => setActiveStep(activeStep + 1)}
              disabled={!csvFile || isUploading}
              className="next-button"
            >
              {t("Next")}
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleUpload}
              disabled={isUploading || validationErrors.length > 0}
              className="import-button"
            >
              {isUploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {t("Importing")}...
                </>
              ) : (
                t("Start Import")
              )}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CSVImportContact;
