// Ourkeyvalues.js
import React from "react";
import { useTranslation } from "react-i18next";

function Ourkeyvalues() {
  const { t } = useTranslation("global");

  return (
    <div className="mt-5 py-5 why-choose-us">
      <div className="container text-center">
        <h4 className="main-heading fs-4 mb-0">{t("keyValues.title")}</h4>
        <div className="row align-items-center">
          <div className="col-md-4 col-4 mt-4 mt-md-0">
            <img
              src="Assets/landing/empathy.png"
              alt=""
              className="img-fluid"
            />
            <h5 className="main-heading fs-5 fw-bold">
              {t("keyValues.values.empathy")}
            </h5>
          </div>
          <div className="col-md-4 col-4 mt-4 mt-md-0">
            <img src="Assets/landing/dream.png" alt="" className="img-fluid" />
            <h5 className="main-heading fs-5 fw-bold">
              {t("keyValues.values.dream")}
            </h5>
          </div>
          <div className="col-md-4 col-4 mt-4 mt-md-0">
            <img
              src="Assets/landing/mentorship.png"
              alt=""
              className="img-fluid"
            />
            <h5 className="main-heading fs-5 fw-bold">
              {t("keyValues.values.mentorship")}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ourkeyvalues;
