import React from "react";
import { useTranslation } from "react-i18next";

function NewsletterTerms() {
  const { t } = useTranslation("global");

  return (
    <div className="mt-1 pb-5">
      <div className="container-fluid mt-2 p-5">
        <div className="text-center">
          <h4 className="main-heading fw-bold text-center mb-4">
            {t("NewsletterT&C.terms_conditions")}
          </h4>
          <p
            className="description"
            dangerouslySetInnerHTML={{ __html: t("NewsletterT&C.welcome") }}
          ></p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms")}
          </h5>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_1")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_3")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_4")}
          </p>
          <div className="description fs-6">
            <p>{t("NewsletterT&C.acceptance_description_5")}</p>
            <p>{t("NewsletterT&C.acceptance_description_6")}</p>
            <p>{t("NewsletterT&C.acceptance_description_7")}</p>
            <p>{t("NewsletterT&C.acceptance_description_8")}</p>
            {/* <p>{t("NewsletterT&C.acceptance_description_9")}</p> */}
          </div>
        </div>

        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_description_9")}
          </h5>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_9.1")}
          </p>
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms_2")}
          </h5>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.1")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.2")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.3")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.4")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.5")}
          </p>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_2.6")}
          </p>
          <p
            className="description fs-6"
            dangerouslySetInnerHTML={{
              __html: t("NewsletterT&C.acceptance_description_2.7"),
            }}
          />
        </div>

        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms_3")}
          </h5>
          <p
            className="description fs-6"
            dangerouslySetInnerHTML={{
              __html: t("NewsletterT&C.acceptance_description_3.1"),
            }}
          />
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms_4")}
          </h5>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_4.1")}
          </p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms_5")}
          </h5>
          <p className="description fs-6">
            {t("NewsletterT&C.acceptance_description_5.1")}
          </p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("NewsletterT&C.acceptance_terms_6")}
          </h5>
          <p
            className="description fs-6"
            dangerouslySetInnerHTML={{
              __html: t("NewsletterT&C.acceptance_description_6.1"),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default NewsletterTerms;
