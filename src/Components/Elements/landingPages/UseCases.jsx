import React from "react";
import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";

const useCasesData = [
  {
    imgSrc: "Assets/landing/case1.png",
    textKey: "card1",
  },
  {
    imgSrc: "Assets/landing/case2.png",
    textKey: "card2",
  },
  {
    imgSrc: "Assets/landing/case3.png",
    textKey: "card3",
  },
  {
    imgSrc: "Assets/landing/case4.png",
    textKey: "card4",
  },
];

function UseCases() {
  const { t } = useTranslation("global");

  return (
    <div className="cases">
      <div className="container mt-5">
        <div className="text-center">
          <h1 className="fw-bold">{t("cases.title")}</h1>
          <p>{t("cases.subtitle")}</p>
        </div>
        <div className="row mt-5">
          {useCasesData.map((caseItem, index) => (
            <div key={index} className="col-md-3 mt-3">
              <div className="card h-100">
                {/* <Link to={`/useCase/${index+1}`}> */}
                <img src={caseItem.imgSrc} className="card-img-top" alt="Case" />
                <div className="card-body text-center">
                  <p className="card-text">
                    {t(`cases.${caseItem.textKey}`)}
                    <span className="arrow">→</span>
                  </p>
                </div>
                {/* </Link> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UseCases;
