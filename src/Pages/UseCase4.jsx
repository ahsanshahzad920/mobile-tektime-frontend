import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowRight } from "react-icons/fa6";
import CalendlyLink from "../Components/Elements/landingPages/CalendlyLink";
import { useLocation } from "react-router-dom";

const UseCase4 = () => {
  const { t } = useTranslation("global");
  const location = useLocation();
  const openCalendlyLink = CalendlyLink(
    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482"
  );
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [location]);
  return (
    <div className="mt-5 pt-0 pt-lg-5">
      <div className="usecase-1 pb-5 usecase-one">
        <div
          className="hero-img-position d-flex align-items-center justify-content-center h-100 pt-5"
          style={{
            backgroundImage: `url('/Assets/landing/usecase1.svg')`,
            height: "769px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "-54px -45px",
            backgroundSize: "cover",
            width: "100%",
            paddingTop: "72px",
          }}
        >
          <div className="container process-and-productivity">
            <div className="row usecase-rowgap">
              <div className="col-12 col-md-6 d-flex align-items-start justify-content-center">
                <div className="text-center text-md-start">
                  <h5 className="usecasone-heading usecase-mainlineheight">{t("useCases.case4.ProcessAndProductivity.title")}</h5>
                  <p className="description">
                    {t("useCases.case4.ProcessAndProductivity.description")}
                  </p>
                  <button className="button" onClick={openCalendlyLink}>
                    {t("useCases.case4.ProcessAndProductivity.btn")}
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
                <img
                  src="/Assets/landing/crm.png"
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-g improve-business py-5" data-aos="zoom-in-up">
          <div className="container text-center">
            <h1 className="improve-business-heading usecasone-heading usecase-mainlineheight">
              {" "}
              {t("useCases.case4.improveBusiness.title")}{" "}
            </h1>
            <div className="row mt-5 usecase-rowgap">
              <div className="col-md-4">
                <button className="mt-3 text-start">
                  <div className="d-flex gap-4">
                    <div className="text-center">
                      <p className="heading text-danger">
                        {t("useCases.case4.improveBusiness.one.heading")}
                      </p>

                      <h6 className="main-heading usecaseone-problematic">
                        {t("useCases.case4.improveBusiness.one.sub-heading-1")}
                        <br className="d-none d-md-block" />{" "}
                        {t("useCases.case4.improveBusiness.one.sub-heading-2")}
                      </h6>
                      <p className="description fs-6">
                        {t("useCases.case4.improveBusiness.one.description")}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="col-md-4 mt-3 text-start">
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <p className="heading text-danger">
                      {t("useCases.case4.improveBusiness.two.heading")}
                    </p>
                    <h6 className="main-heading usecaseone-problematic">
                      {t("useCases.case4.improveBusiness.two.sub-heading-1")}
                      <br className="d-none d-md-block" />{" "}
                      {t("useCases.case4.improveBusiness.one.sub-heading-2")}
                    </h6>
                    <p className="description fs-6">
                      {t("useCases.case4.improveBusiness.two.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mt-3 text-start">
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <p className="heading text-danger">
                      {t("useCases.case4.improveBusiness.three.heading")}
                    </p>
                    <h6 className="main-heading usecaseone-problematic">
                      {t("useCases.case4.improveBusiness.three.sub-heading-1")}
                      <br className="d-none d-md-block" />{" "}
                      {t("useCases.case4.improveBusiness.three.sub-heading-2")}
                    </h6>
                    <p className="description fs-6">
                      {t("useCases.case4.improveBusiness.three.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 team-boost">
          <div className="container">
            <div className="row align-items-center usecase-rowgap">
              <div className="col-md-6 mt-3" data-aos="fade-down">
                <h4 className="main-heading usecasone-heading usecase-mainlineheight">
                  {t("useCases.case4.teamboost.title1")}{" "}
                  <br className="d-none d-md-block" />{" "}
                  {t("useCases.case4.teamboost.title2")}
                </h4>

                <button onClick={openCalendlyLink} className="btn-demo mt-5">
                  {t("useCases.case4.teamboost.btn")} <FaArrowRight />
                </button>
              </div>
              <div className="col-md-6 mt-3">
                <img
                  src="/Assets/landing/usecase4.1.png"
                  alt=""
                  className="img-fluid"
                  data-aos="fade-up"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-g manage-project py-5" data-aos="zoom-in-up">
          <div className="container text-center">
            <h1 className="manage-project-heading usecasone-heading usecase-mainlineheight">
              {" "}
              {t("useCases.case4.manageProject.title")}{" "}
            </h1>
            <div className="row mt-5">
              <div className="col-md-4">
                <button className="mt-3 text-start">
                  <div className="d-flex gap-4">
                    <div className="text-center">
                      <p className="heading text-danger">
                        {t("useCases.case4.manageProject.one.heading")}
                      </p>

                      <h6 className="main-heading usecaseone-problematic">
                        {t("useCases.case4.manageProject.one.sub-heading-1")}
                      </h6>
                      <p className="description fs-6">
                        {t("useCases.case4.manageProject.one.description")}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="col-md-4 mt-3 text-start">
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <p className="heading text-danger">
                      {t("useCases.case4.manageProject.two.heading")}
                    </p>
                    <h6 className="main-heading usecaseone-problematic">
                      {t("useCases.case4.manageProject.two.sub-heading-1")}
                      <br className="d-none d-md-block" />{" "}
                      {t("useCases.case4.manageProject.two.sub-heading-2")}
                    </h6>
                    <p className="description fs-6">
                      {t("useCases.case4.manageProject.two.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mt-3 text-start">
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <p className="heading text-danger">
                      {t("useCases.case4.manageProject.three.heading")}
                    </p>
                    <h6 className="main-heading usecaseone-problematic">
                      {t("useCases.case4.manageProject.three.sub-heading-1")}
                      <br className="d-none d-md-block" />{" "}
                      {t("useCases.case4.manageProject.three.sub-heading-2")}
                    </h6>
                    <p className="description fs-6">
                      {t("useCases.case4.manageProject.three.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 project-template">
          <div className="container">
            <div className="row align-items-center usecase-rowgap">
              <div className="col-md-6 mt-3">
                <img
                  src="/Assets/landing/usecase4.2.png"
                  alt=""
                  className="img-fluid"
                  data-aos="fade-up"
                />
              </div>
              <div className="col-md-6 mt-3 mb-5" data-aos="fade-down">
                <h4 className="main-heading usecasone-heading usecase-mainlineheight">
                  {t("useCases.case4.projectTemplate.title1")}
                  <br className="d-none d-md-block" />{" "}
                  {t("useCases.case4.projectTemplate.title2")}
                </h4>
                <button onClick={openCalendlyLink} className="btn-demo mt-3">
                  {t("useCases.case4.projectTemplate.btn")}
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCase4;
