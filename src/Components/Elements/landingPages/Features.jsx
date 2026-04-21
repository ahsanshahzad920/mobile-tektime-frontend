import React from 'react';
import { useTranslation } from 'react-i18next';

function Features() {
  const { t } = useTranslation("global");

  return (
    <div className='my-5 pt-5'>
      <div className="container text-center">
        <h4 className="main-heading fw-bold fs-4">{t("features.title")}</h4>
        <p className="description" dangerouslySetInnerHTML={{ __html: t("features.subtitle") }}></p>
        <div className="row justify-content-center">
          <div className="col-md-6 mt-4">
            <img src="/Assets/landing/productive-meeting.svg" alt={t("features.productiveMeetings.alt")} className="img-fluid" />
            <h6 className="main-heading fw-bold fs-6 mt-3 mb-0">{t("features.productiveMeetings.title")}</h6>
            <img src="/Assets/landing/Line.png" alt={t("features.borderLine.alt")} className="img-fluid" />
            <p className="description fs-6" dangerouslySetInnerHTML={{ __html: t("features.productiveMeetings.description") }}></p>
          </div>
          <div className="col-md-6 mt-4">
            <img src="/Assets/landing/clear-roadmaps.svg" alt={t("features.clearRoadmaps.alt")} className="img-fluid" />
            <h6 className="main-heading fw-bold fs-6 mt-3 mb-0">{t("features.clearRoadmaps.title")}</h6>
            <img src="/Assets/landing/Line.png" alt={t("features.borderLine.alt")} className="img-fluid" />
            <p className="description fs-6" dangerouslySetInnerHTML={{ __html: t("features.clearRoadmaps.description") }}></p>
          </div>
          <div className="col-md-6 mt-4">
            <img src="/Assets/landing/automatic-transcription.svg" alt={t("features.automaticTranscription.alt")} className="img-fluid" />
            <h6 className="main-heading fw-bold fs-6 mt-3 mb-0">{t("features.automaticTranscription.title")}</h6>
            <img src="/Assets/landing/Line.png" alt={t("features.borderLine.alt")} className="img-fluid" />
            <p className="description fs-6" dangerouslySetInnerHTML={{ __html: t("features.automaticTranscription.description") }}></p>
          </div>
          <div className="col-md-6 mt-4">
            <img src="/Assets/landing/detailed-reports.svg" alt={t("features.detailedReports.alt")} className="img-fluid" />
            <h6 className="main-heading fw-bold fs-6 mt-3 mb-0">{t("features.detailedReports.title")}</h6>
            <img src="/Assets/landing/Line.png" alt={t("features.borderLine.alt")} className="img-fluid" />
            <p className="description fs-6" dangerouslySetInnerHTML={{ __html: t("features.detailedReports.description") }}></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
