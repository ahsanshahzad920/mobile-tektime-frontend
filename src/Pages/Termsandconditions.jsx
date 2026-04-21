import React from "react";
import { useTranslation } from "react-i18next";

function Termsandconditions() {
  const { t } = useTranslation("global");

  return (
    <div className="mt-5 py-5">
      <div className="container mt-5">
        <div className="text-center">
          <h4 className="main-heading fw-bold text-center mb-4">
            {t("T&C.terms_conditions")}
          </h4>
          <p className="description text-center">
            This website is owned and operated by IZIWORLDS.
          </p>
          <p
            className="description"
            dangerouslySetInnerHTML={{ __html: t("T&C.welcome") }}
          ></p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.acceptance_terms")}
          </h5>
          <p className="description fs-6">{t("T&C.acceptance_description")}</p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.use_service")}</h5>
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.user_account")}</h5>
          <p className="description fs-6">
            {t("T&C.user_account_description")}
          </p>
          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">
              {t("T&C.license_use")}
            </h5>
            <p className="description fs-6">
              {t("T&C.license_use_description")}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.usage_restrictions")}
          </h5>
          <p className="description fs-6">
            {t("T&C.usage_restrictions_description")}
          </p>
          <ul className="list-unstyled description fs-6">
            {t("T&C.usage_restrictions_list", { returnObjects: true }).map(
              (item, index) => (
                <li className="mt-2" key={index}>
                  - {item}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.user_content")}</h5>
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership")}
          </h5>
          {/* <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading")}
          </h6> */}
          <p className="description fs-6">
            {t("T&C.content_ownership_description")}
          </p>

          {/* <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading_2")}
          </h6>
          <p className="description fs-6">
            {t("T&C.content_ownership_description_2")}
          </p>

          <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading_3")}
          </h6>
          <p className="description fs-6">
            {t("T&C.content_ownership_description_3")}
          </p>
          <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading_4")}
          </h6>
          <p className="description fs-6">
            {t("T&C.content_ownership_description_4")}
          </p>
          <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading_5")}
          </h6>
          <p className="description fs-6">
            {t("T&C.content_ownership_description_5")}
          </p>
          <h6 className="main-heading fs-5 fw-bold">
            {t("T&C.content_ownership_sub_heading_6")}
          </h6>
          <p
            className="description fs-6"
            dangerouslySetInnerHTML={{
              __html: t("T&C.content_ownership_description_6"),
            }}
          /> */}
          {/* <p className="description fs-6">
            {t("T&C.content_ownership_description_6")}
          </p> */}
          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">
              {t("T&C.content_responsibility")}
            </h5>
            <p className="description fs-6">
              {t("T&C.content_responsibility_description")}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.payment_billing")}
          </h5>
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.pricing")}</h5>
          <p className="description fs-6">{t("T&C.pricing_description")}</p>
          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">{t("T&C.billing")}</h5>
            <p className="description fs-6">{t("T&C.billing_description")}</p>
          </div>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.privacy")}</h5>
          <p className="description fs-6">{t("T&C.privacy_description")}</p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("T&C.termination")}</h5>
          <p className="description fs-6">{t("T&C.termination_description")}</p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.limitation_liability")}
          </h5>
          <p className="description fs-6">
            {t("T&C.limitation_liability_description")}
          </p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.changes_terms")}
          </h5>
          <p className="description fs-6">
            {t("T&C.changes_terms_description")}
          </p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("T&C.governing_law")}
          </h5>
          <p className="description fs-6">
            {t("T&C.governing_law_description")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Termsandconditions;
