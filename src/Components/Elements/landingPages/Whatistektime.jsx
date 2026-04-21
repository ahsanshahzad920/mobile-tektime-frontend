import React from "react";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";

function Whatistektime() {
  const [t] = useTranslation("global");

  return (
    <div className="my-5 pt-5">
      <div className="container">
        <p className="description text-danger">{t("whatisTektime.subtitle")}</p>
        <div className="row">
          <div className="col-md-8 mt-3">
            <h3 className="main-heading fs-4 fw-bold whatistektime-text">
              {t("whatisTektime.title")}
              {/* <br className="d-none d-md-block" />
              {t("whatisTektime.title1")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title2")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title3")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title4")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title5")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title6")}
              <br className="d-none d-md-block" />
              {t("whatisTektime.title7")} */}
            </h3>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-md-6 mt-4">
            <div className="d-flex justify-content-center">
              <img
                src="Assets/landing/report 1.svg"
                alt=""
                className="img-fluid"
                data-aos="fade-right"
              />
            </div>
          </div>
          <div className="col-md-6 mt-4" data-aos="fade-down">
            <div className="text-center">
              <img src="Assets/landing/Fill.png" alt="" className="img-fluid" />
            </div>
            <div className="d-flex align-items-center">
              <div>
                <img
                  src="Assets/landing/Meeting 1.svg"
                  alt=""
                  className="img-fluid"
                />
              </div>
              <div>
                <img
                  src="Assets/landing/Option 1.svg"
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
            <p className="description fw-bold fs-4">{t("whatisTektime.paragraphtitle")}</p>
            <p className="description text-dark fw-bold whatistektime-description">
              {t("whatisTektime.paragraph")}{" "}

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whatistektime;
