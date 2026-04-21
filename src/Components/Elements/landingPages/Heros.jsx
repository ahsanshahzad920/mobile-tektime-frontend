import React from "react";
import Slider from "react-slick";
import CalendlyLink from "./CalendlyLink";
import { useTranslation } from "react-i18next";

function Heros() {
  const [t] = useTranslation("global");

  const openCalendlyLink = CalendlyLink(
    "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482"
  );

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false
  };

  return (
    <div className="main-hero">
      <div id="hero" className="pt-5 mb-4">
        <div className="container text-center mt-5">
          <Slider {...sliderSettings}>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title5") }}
            ></h5>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title1") }}
            ></h5>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title") }}
            ></h5>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title2") }}
            ></h5>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title3") }}
            ></h5>
            <h5
              className="main-heading fw-bold pt-4 hero-main-heading"
              dangerouslySetInnerHTML={{ __html: t("hero.title4") }}
            ></h5>
          </Slider>
          <p className="description mt-4 description-txtcolor hero-description">
            {t("hero.subtitle")}
          </p>
          <button className="btn-primary" onClick={openCalendlyLink}>
            {t("demo")}
          </button>
        </div>
      </div>

      <div>
        <div className="container-fluid me-5 hero-img-container">
          <div className="position-relative hero-img-position">
            {/* <img src="/Assets/landing/tek3.svg" alt="" className="img-fluid" /> */}
            <img src="/Assets/landing/tek-4.png" alt="" className="img-fluid" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heros;
