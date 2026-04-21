import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const RecordingErrorModal = ({ show, onRetry, onClose, message }) => {
  const [t] = useTranslation("global");
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>{t("recording_title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t("recording_error")}</p>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button> */}
        <button
          className="btn"
          style={{
            backgroundColor: "#0026b1",
            color: "#fff",
            border: "none",
            padding: "9px 26px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px",
            transition: "background-color 0.3s",
            display: "flex",
            alignItems: "center",
          }}
          onClick={onRetry}
        >
          {t("Try Again")}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecordingErrorModal;
