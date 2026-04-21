// ConfirmationModal.js
import React from 'react';
import './ConfirmationModal.css'; // Add styling as needed
import { useTranslation } from 'react-i18next';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  const [t] = useTranslation("global");

  return (
    <div className="confirmation-modal">
      <div className="confirmation-modal-content">
        <p>{message}</p>
        <button className="btn-yes" onClick={onConfirm}>{t("confirmationModal.yes")}</button>
        <button className="btn-no" onClick={onCancel}>{t("confirmationModal.no")}</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
