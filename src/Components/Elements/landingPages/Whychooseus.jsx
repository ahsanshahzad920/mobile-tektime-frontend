import React from "react";
import { useTranslation } from "react-i18next";
import CalendlyLink from "./CalendlyLink";
import { Link } from "react-router-dom";

function Whychooseus() {
  const { t } = useTranslation("global");
  const openCalendlyLink = CalendlyLink("https://www.sunrisecharity.com/");

  return (
    <div className="mt-5 pt-g why-choose-us py-5" data-aos="zoom-in-up">
      <div className="container text-center">
        <p className="description text-danger">{t("whyChooseUs.heading")}</p>
        <h4 className="main-heading fs-3 fw-bold mt-4 mb-5">
          {t("whyChooseUs.subheading")}
        </h4>
        <div className="row">
          <div className="col-md-4">
            <button className="mt-3 text-start">
              <div className="d-flex gap-4">
                <div>
                  <img
                    src="Assets/landing/associative.svg"
                    alt={t("whyChooseUs.associative.alt")}
                    width={60}
                  />
                </div>
                <div>
                  <h6 className="main-heading fs-5 fw-bold">
                    {t("whyChooseUs.associative.title")}
                  </h6>
                  <p className="description">
                    {t("whyChooseUs.associative.description")}
                    <br />
                    {/* <img
                      onClick={openCalendlyLink}
                      src="Assets/landing/sun.jpeg"
                      alt={t("whyChooseUs.associative.imgAlt")}
                      className="img-fluid mt-3"
                    /> */}
                  </p>
                </div>
              </div>
            </button>
          </div>
          <div className="col-md-4 mt-3 text-start">
            <div className="d-flex gap-4">
              <div>
                <img
                  src="Assets/landing/ecological.svg"
                  alt={t("whyChooseUs.ecological.alt")}
                  width={60}
                />
              </div>
              <div>
                <h6 className="main-heading fs-5 fw-bold">
                  {t("whyChooseUs.ecological.title")}
                </h6>
                <p className="description">
                  {t("whyChooseUs.ecological.description")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-3 text-start">
            <div className="d-flex gap-4">
              <div>
                <img
                  src="Assets/landing/privacy.svg"
                  alt={t("whyChooseUs.privacy.alt")}
                  width={60}
                />
              </div>
              <div>
                <h6 className="main-heading fs-5 fw-bold">
                  {t("whyChooseUs.privacy.title")}
                </h6>
                <ul>
                  {t("whyChooseUs.privacy.list", { returnObjects: true }).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whychooseus;
