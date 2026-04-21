import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const limpactsocial = [
    {
        imgSrc: "Assets/landing/impact-card-1.png",
        textKey: "card1",
    },
    {
        imgSrc: "Assets/landing/impact-card-2.png",
        textKey: "card2",
    },
    {
        imgSrc: "Assets/landing/impact-card-3.png",
        textKey: "card3",
    },
    {
        imgSrc: "Assets/landing/impact-card-4.png",
        textKey: "card4",
    },
];

function Limpactsocial() {
    const { t } = useTranslation("global");

    return (
        <div className="impact-social">
            <div className="container mt-5">
                <div className="text-center">
                    <h1 className="fw-bold">{t("impact-social.title")}</h1>
                    <p className="impact-description m-0">{t("impact-social.subtitle")}<br className="d-none d-md-block" /> {t("impact-social.subtitle1")} <Link to={"#"} className="text-dark">{t("impact-social.subtitlelink")}</Link></p>
                </div>
                <div className="row justify-content-center align-items-center">
                    <div className="col-md-5 mt-3 text-center text-md-end">
                        <Link to={"#"} className="text-decoration-none">
                            <img src="Assets/landing/impact-left.png" alt="" className="img-fluid" />
                        </Link>
                    </div>
                    <div className="col-md-7 mt-3">
                        <h2 className="impact-heading2">{t("impact-social.heading")}</h2>
                        <p className="impact-description">{t("impact-social.description")} <br className="d-none d-md-block" />
                            {t("impact-social.description1")}</p>
                    </div>
                </div>
                <div className="row mt-3">
                    {limpactsocial.map((caseItem, index) => (
                        <div key={index} className="col-lg-3 col-md-4 mt-3">
                            <div className="card py-4 h-100">
                                <Link to={"#"} className="text-decoration-none">
                                    <div className="d-flex justify-content-center py-4">
                                        <img src={caseItem.imgSrc} className="impact-img text-center" alt="Case" />
                                    </div>
                                    <div className="card-body pb-0 text-center text-dark">
                                        <p className="card-text m-0">
                                            {t(`impact-social.${caseItem.textKey}`)}
                                            {/* <span className="card-paragraph">
                                            </span> */}
                                            <span className="arrow">→</span>
                                        </p>
                                    </div>
                                </Link>

                            </div>
                        </div>
                    ))}
                </div>
                <p className="impact-description text-center mt-4 font-italic">
                    {t("impact-social.italicdescription")} <br className="d-none d-md-block" />{t("impact-social.italicdescription1")} 
                </p>
            </div>
        </div>
    );
}

export default Limpactsocial;
