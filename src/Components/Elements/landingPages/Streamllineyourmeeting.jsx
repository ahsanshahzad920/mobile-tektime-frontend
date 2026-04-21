import React from "react";
import { useTranslation } from 'react-i18next';

import CalendlyLink from "./CalendlyLink";
function Streamllineyourmeeting() {
  const { t } = useTranslation("global");

  const openCalendlyLink = CalendlyLink(
    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482"
  );
  return (
    <div className="mt-5">
      <div className="container pt-5 border-top">
        <div className="row align-items-center justify-content-center">
          <div className="col-md-6 mt-4">
            <h4 className="main-heading fw-bold fs-4">
              {t("streamlineMeeting.title")}
            </h4>
            <p className="description fs-6">
              {t("streamlineMeeting.description")}

            </p>
          </div>
          <div className="col-md-5 mt-4 text-end">
            <button onClick={openCalendlyLink} className="btn-primary">
              {t("demo")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Streamllineyourmeeting;
