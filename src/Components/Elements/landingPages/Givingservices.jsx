import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import CalendlyLink from "./CalendlyLink";
import { useTranslation } from "react-i18next";

function Givingservices() {
  const [t] = useTranslation("global");
  const openCalendlyLink = CalendlyLink(
    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482"
  );
  return (
    <div className="mt-5 pt-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mt-3">
            <img
              src="Assets/landing/customer-happy.png"
              alt=""
              className="img-fluid"
              data-aos="fade-down"
            />
          </div>
          <div className="col-md-6 mt-3" data-aos="fade-down">
            <h4 className="fw-bold trackmoment-mainheading">
              {t("make.title")} <br className="d--none d-md-block" />
            </h4>
            <p className="description mt-4 hero-description">
              {t("make.subtitle")}
            </p>
            {/* <p className="description hero-description">
              {t("make.subtitle1")}
            </p> */}
            {/* <p className="description hero-description">
              {t("make.subtitle2")}
            </p>
            <p className="description hero-description">
              {t("make.subtitle3")}
            </p> */}
            <button onClick={openCalendlyLink} className="btn-demo">
              {t("demo")} <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Givingservices;
