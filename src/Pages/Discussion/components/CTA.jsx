import React from "react";
import { useTranslation } from "react-i18next";
import "./CTA.scss";

export default function CTA({ data }) {
  const { t } = useTranslation("global");

  return (
    <section className="section cta-section" style={{ padding: "8rem 0" }}>
      <div className="container">
        <div className="cta-card">
          <div className="cta-content">
            <h2>{data?.cta_title || t("cta.title")}</h2>
            <p>{data?.cta_text || t("cta.text")}</p>
            <div className="cta-form">
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.open(
                    data?.cta_button_link ||
                      "https://calendly.com/tektime/tektime-qu-est-ce-que-c-est",
                    "_blank",
                  );
                }}
              >
                {data?.cta_button || t("cta.button")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
