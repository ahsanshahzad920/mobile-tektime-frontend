import React from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa6";
import CalendlyLink from "./CalendlyLink";

const plans = [
  {
    id: 1,
    key: "plan1",
  },
  {
    id: 2,
    key: "plan2",
  },
  {
    id: 3,
    key: "plan3",
  },
  {
    id: 4,
    key: "plan4",
  },
  {
    id: 5,
    key: "plan5",
  },
  {
    id: 6,
    key: "plan6",
  },
];

function Pricingandplans({ heading, mainheading }) {
  const { t } = useTranslation("global");

  const openCalendlyLink = CalendlyLink(
    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482"
  );

  return (
    <div className="pt-5" id="pricing">
      <div className="container text-center">
        <p className="description text-danger">{t("plans.subtitle")}</p>
        <h4 className="main-heading fw-bold fs-3">{t("plans.title1")} <br /> {t("plans.title2")}</h4>
        <div className="row justify-content-center">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="col-lg-4 col-md-4 mt-4 mt-md-5 px-5 px-md-2 px-lg-5"
            >
              <div className="card shadow border-0 rounded-4 pb-3 h-100">
                <div className="card-body">
                  <p className="description darkblue-txtcolor fw-bold plans-description">
                    {t(`plans.${plan.key}.title`)}
                  </p>
                  <h4 className="main-heading plans-mainheading fw-bold">
                    <span className="fs-5"></span>{" "}
                    <span>{t(`plans.${plan.key}.subtitle`)}</span>
                  </h4>
                  <p className="description pricing-description">
                    {t(`plans.${plan.key}.description`)}
                  </p>
                  <ul className="text-start">
                    <li>{t("plans.feature_1")}</li>
                    <li>{t("plans.feature_2")}</li>
                    <li>{t("plans.feature_3")}</li>
                    <li>{t("plans.feature_4")}</li>
                    <li>{t("plans.feature_5")}</li>
                    <li>{t("plans.feature_6")}</li>
                  </ul>
                </div>
                <div className="card-footer bg-transparent border-0">
                  <button className="pricing-btn fw-bold plans-button" onClick={openCalendlyLink}>
                    {t("pricing.startTrial")} <FaArrowRight className="ms-3" />
                  </button>

                  {/* <p className="description fs-6 mt-2">
                    {t(`plans.${plan.key}.description`)}
                  </p> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricingandplans;
