// Wayofsupporting.js
import React from "react";
import { useTranslation } from "react-i18next";

function Wayofsupporting() {
  const { t } = useTranslation("global");

  const cardData = [
    {
      title: t("wayOfSupporting.pillars.communication.title"),
      description: t("wayOfSupporting.pillars.communication.description"),
    },
    {
      title: t("wayOfSupporting.pillars.collaboration.title"),
      description: t("wayOfSupporting.pillars.collaboration.description"),
    },
    {
      title: t("wayOfSupporting.pillars.confidence.title"),
      description: t("wayOfSupporting.pillars.confidence.description"),
    },
    {
      title: t("wayOfSupporting.pillars.coaching.title"),
      description: t("wayOfSupporting.pillars.coaching.description"),
    },
  ];

  return (
    <div className="my-5 way-of-supporting pt-5">
      <div className="container text-center">
        <p className="description fs-6 text-danger fw-bold">
          {t("wayOfSupporting.title")}
        </p>
        <h3
          className="main-heading supporting-way"
          dangerouslySetInnerHTML={{ __html: t("wayOfSupporting.subtitle") }}
        ></h3>
        <div className="row mt-3">
          {cardData.map((card, index) => (
            <div className="col-md-6 mt-5" key={index}>
              <div className="">
                <img
                  src="Assets/landing/supporting-cursor.svg"
                  alt=""
                  width={50}
                />
              </div>
              <div className="card-container ">
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wayofsupporting;
