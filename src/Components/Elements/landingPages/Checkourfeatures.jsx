import React from "react";
import { useTranslation } from "react-i18next";

function Checkourfeatures() {
  const { t } = useTranslation("global");

  return (
    <div className="mt-5 pt-5">
      <div className="container">
        <div className="text-center">
          <h5 className="main-heading fw-bold mb-4">
            {t("pricingFeature.title")}
          </h5>
          <p className="description">
            {t("pricingFeature.subtitle1")} <br className="d-none d-md-block" />{" "}
            {t("pricingFeature.subtitle2")}
          </p>
        </div>
        <div className="row">
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/landing/setup.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.one")}
                </h5>
                <p className="description fs-6">{t("pricingFeature.oneDes")}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/landing/orders.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.two")}
                </h5>
                <p className="description fs-6">{t("pricingFeature.twoDes")}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/landing/coupon.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.three")}
                </h5>
                <p className="description fs-6">
                  {t("pricingFeature.threeDes")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/compaigns.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.four")}
                </h5>
                <p className="description fs-6">
                  {t("pricingFeature.fourDes")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/customers.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.five")}
                </h5>
                <p className="description fs-6">
                  {t("pricingFeature.fiveDes")}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mt-4">
            <div className="d-flex gap-3">
              <div>
                <img
                  src="/Assets/progress.png"
                  alt=""
                  width={80}
                  className="img-fluid"
                />
              </div>
              <div>
                <h5 className="main-heading fs-5 fw-bold">
                  {t("pricingFeature.six")}
                </h5>
                <p className="description fs-6">{t("pricingFeature.sixDes")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkourfeatures;
