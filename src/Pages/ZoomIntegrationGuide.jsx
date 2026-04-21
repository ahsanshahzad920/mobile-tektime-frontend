import React from "react";
import { GoDotFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ZoomIntegrationGuide() {
    const { t } = useTranslation("global");

    return (
        <div className="mt-5 py-5">
            <div className="container mt-5">
                <h4 className="main-heading fw-bold text-center mb-4">
                    {t("tektime_zoom_integration")}
                </h4>
                <div className="mt-5">
  <h5 className="main-heading fs-5 fw-bold">
    {t("Test Plan")}
  </h5>
  <a 
    href="https://docs.google.com/document/d/1lNLWK43ll7s5bQpTlT8jwTzE8ciizozAJGBMsEW0BQk/edit?pli=1&tab=t.0" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-primary"
  >
    View Test Plan
  </a>
</div>

                <div className="mt-5">
                    <h5 className="main-heading fs-5 fw-bold">
                        {t("zoom_overview")}
                    </h5>
                    <p className="description">
                        {t("zoom_overview_description")}
                    </p>
                </div>
                <div className="mt-5">
                    <h5 className="main-heading fs-5 fw-bold">{t("adding_zoom_integration")}</h5>
                    <p className="description fs-6 m-0">1. {t("adding_zoom_description1")}</p>
                    <p className="description fs-6 m-0">2. {t("adding_zoom_description2")} <span className="fw-bold">{t("adding_zoom_description3")}</span> {t("adding_zoom_description4")} <span className="fw-bold">{t("adding_zoom_description5")}</span> {t("adding_zoom_description6")}</p>
                    <p className="description fs-6 m-0">3. {t("adding_zoom_description7")} <span className="fw-bold">{t("adding_zoom_description8")}</span> {t("adding_zoom_description9")}</p>
                    <p className="description fs-6 m-0">4. {t("adding_zoom_description10")}</p>
                    <p className="description fs-6 m-0">4. {t("adding_zoom_description11")}</p>
                </div>
                <div className="mt-5">
                    <h5 className="main-heading fs-5 fw-bold">{t("using_zoom_integration")}</h5>
                    <h5 className="main-heading fs-5 fw-bold mt-3">{t("zoom_step_by_step_progress")}</h5>
                    <div className="mt-3">
                        <h5 className="main-heading fs-5 fw-bold">1. {t("zoom_access_your_project_dashboard")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("login_your_tektime_account")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("navigate_the_project")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("click_on")}</span>
                            <span className="fw-bold">"{t("create_new_meeting")}"</span>
                        </p>
                    </div>
                    <div className="mt-4">
                        <h5 className="main-heading fs-5 fw-bold">2. {t("enable_zoom_integration")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("enable_zoom_integration1")} <span className="fw-bold">"{t("enable_zoom_meeting")}"</span></span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("link_your_zoom")}</span>
                        </p>
                    </div>
                    <div className="mt-4">
                        <h5 className="main-heading fs-5 fw-bold">3. {t("fill_meeting_detail")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("enter_meeting_title")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("select_zoom_option")}</span>
                        </p>
                    </div>
                    <div className="mt-4">
                        <h5 className="main-heading fs-5 fw-bold">4. {t("add_participant")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("select_team_member")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("participant_will_receive")}</span>
                        </p>
                    </div>
                    <div className="mt-4">
                        <h5 className="main-heading fs-5 fw-bold">5. {t("assign_step")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("define_actionable_step")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("assign_individual_participant")}</span>
                        </p>
                    </div>
                    <div className="mt-4">
                        <h5 className="main-heading fs-5 fw-bold">6. {t("finalize_and_save")}</h5>
                        <p className="description d-flex gap-2 align-items-center mb-2">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("review_all_detail")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("click")} <span className="fw-bold">{t("click_save")}</span> {t("to_finalize_meeting")}</span>
                        </p>
                        <p className="description d-flex gap-2 align-items-center">
                            <span>
                                <GoDotFill size={12} />
                            </span>{" "}
                            <span>{t("meeting_will_now_setup")}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-5">
                    <h5 className="main-heading fs-5 fw-bold">
                        {t("remove_zoom_integration")}
                    </h5>
                </div>
                <div className="mt-5">
                    <p className="description fs-6 m-0">1. {t("login_to_tektime")} <span className="fw-bold">{t("adding_zoom_description3")}</span></p>
                    <p className="description fs-6 m-0">2. {t("open_the_integration")} <span className="fw-bold">{t("adding_zoom_description5")}</span> {t("locate_zoom_integration")}</p>
                    <p className="description fs-6 m-0">3. {t("click_remove_button")}</p>
                    <p className="description fs-6 m-0">4. {t("disconnecting_will_stop")}</p>
                </div>
            </div>
        </div>
    );
}

export default ZoomIntegrationGuide;
