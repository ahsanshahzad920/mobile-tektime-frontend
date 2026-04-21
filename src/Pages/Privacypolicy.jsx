import React from "react";
import { GoDotFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

function Privacypolicy() {
  const { t } = useTranslation("global");

  return (
    <div className="mt-5 py-5">
      <div className="container mt-5">
        <h4 className="main-heading fw-bold text-center mb-4">
          {t("privacy_policy")}
        </h4>
        <p className="description text-center">
          This website is owned and operated by IZIWORLDS.
        </p>
        <p
          className="description text-center"
          dangerouslySetInnerHTML={{ __html: t("welcome_message") }}
        ></p>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("google_oauth_scopes_disclosure_title")}
          </h5>
          <p className="description fs-6">
            {t("google_oauth_scopes_disclosure_intro")}
          </p>
          <ul className="description fs-6">
            <li>
              <strong>https://www.googleapis.com/auth/userinfo.email</strong> –{" "}
              {t("scope_userinfo_email")}
            </li>
            <li>
              <strong>https://www.googleapis.com/auth/userinfo.profile</strong>{" "}
              – {t("scope_userinfo_profile")}
            </li>
            <li>
              <strong>openid</strong> – {t("scope_openid")}
            </li>
            <li>
              <strong>https://www.googleapis.com/auth/calendar</strong> –{" "}
              {t("scope_calendar")}
            </li>
            <li>
              <strong>https://www.googleapis.com/auth/calendar.events</strong> –{" "}
              {t("scope_calendar_events")}
            </li>
            <li>
              <strong>
                https://www.googleapis.com/auth/calendar.calendarlist.readonly
              </strong>{" "}
              – {t("scope_calendar_list_readonly")}
            </li>
            <li>
              <strong>
                https://www.googleapis.com/auth/calendar.calendars
              </strong>{" "}
              – {t("scope_calendar_calendars")}
            </li>
            <li>
              <strong>
                https://www.googleapis.com/auth/calendar.app.created
              </strong>{" "}
              – {t("scope_calendar_app_created")}
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <h5 className="main-heading fs-5 fw-bold">
            {t("data_usage_storage_title")}
          </h5>
          <p className="description fs-6">{t("data_usage_storage_text")}</p>
        </div>

        <div className="mt-4">
          <h5 className="main-heading fs-5 fw-bold">
            {t("google_api_policy_reference_title")}
          </h5>
          <p className="description fs-6">
            <Trans i18nKey="google_api_policy_reference_text">
              Our use of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="green-txtcolor"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </Trans>
          </p>
        </div>

        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("information_we_collect")}
          </h5>
          <p className="description">{t("information_we_collect_text")}</p>
          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">
              {t("personal_information")}
            </h5>
            <p className="description fs-6">{t("personal_information_text")}</p>
            <p className="description d-flex gap-2 align-items-center mb-2">
              <span>
                <GoDotFill size={12} />
              </span>{" "}
              <span>{t("first_last_name")}</span>
            </p>
            <p className="description d-flex gap-2 align-items-center">
              <span>
                <GoDotFill size={12} />
              </span>{" "}
              <span>{t("email_address")}</span>
            </p>
          </div>
          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">{t("log_data")}</h5>
            <p className="description fs-6">{t("log_data_text")}</p>
          </div>

          <div className="mt-5">
            <h5 className="main-heading fs-5 fw-bold">
              {t("google_calendar_data")}
            </h5>
            <p className="description fs-6">{t("google_calendar_data_text")}</p>
            <ul className="description fs-6">
              <Link to="" className="green-txtcolor text-decoration-none">
                <li>https://www.googleapis.com/auth/calendar</li>
              </Link>
              <Link to="" className="green-txtcolor text-decoration-none">
                <li>https://www.googleapis.com/auth/calendar</li>
              </Link>
            </ul>
          </div>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("usage_of_information")}
          </h5>
          <p className="description fs-6">{t("usage_of_information_text")}</p>
          <ul className="description fs-6`">
            <li>{t("provideAndMaintain")}</li>
            <li>{t("notifyOfChanges")}</li>
            <li>{t("allowParticipation")}</li>
            <li>{t("provideCustomerSupport")}</li>
            <li>{t("collectAnalytics")}</li>
            <li>{t("monitorUse")}</li>
            <li>{t("detectTechnicalProblems")}</li>
          </ul>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("sharing_your_information")}
          </h5>
          <p className="description fs-6">
            {t("sharing_your_information_text")}
          </p>
          <p className="description fs-6">{t("may_share_info")}</p>
          <ul className="description fs-6">
            <li>{t("third_party")}</li>
            <li className="mt-2">{t("legal")}</li>
          </ul>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("data_security")}</h5>
          <p className="description fs-6">{t("data_security_text")}</p>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">{t("your_rights")}</h5>
          <p className="description fs-6">{t("your_rights_text")}</p>
          <ul className="description fs-6">
            <li>{t("access")}</li>
            <li className="mt-2">{t("Rectification")}</li>
            <li className="mt-2">{t("Erasure")}</li>
            <li className="mt-2">{t("Limitation")}</li>
            <li className="mt-2">{t("Opposition")}</li>
            <li className="mt-2">{t("Portability")}</li>
          </ul>
        </div>
        <div className="mt-5">
          <h5 className="main-heading fs-5 fw-bold">
            {t("changes_to_privacy_policy")}
          </h5>
          <p className="description fs-6">
            {t("changes_to_privacy_policy_text")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacypolicy;
