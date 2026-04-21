import React from "react";
import { useTranslation } from "react-i18next";

function Testimonials() {
  const [t] = useTranslation("global");

  return (
    <div className="mt-5 testimonials">
      <div className="testimonials-bg py-5">
        <div className="container">
          <p className="description fs-6 green-txtcolor text-center">
            {t('testimonials.title')}
          </p>
          <div>
            <h4 className="testimonial-heading fw-bold text-white border-bottom pb-3">
              {`“${t('testimonials.quote')}”`}
            </h4>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3 mt-3 align-items-center">
                <div>
                  <img
                    src="/Assets/landing/1564908244965.jpg"
                    width={80}
                    alt=""
                    className="img-fluid"
                    style={{ borderRadius: "100%" }}
                  />
                </div>
                <div>
                  <p className="mb-0 author-description">{t('testimonials.author')}</p>
                  <span className="mb-0">{t('testimonials.position')}</span>
                </div>
              </div>
              {/* <div className="d-flex gap-2 align-items-center mt-3">
              <img src="Assets/arrow-left.svg" alt="" className="img-fluid" />
              <img src="Assets/arrow-right.svg" alt="" className="img-fluid" />
            </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="container py-5">
        <p className="description fs-6 green-txtcolor text-center">
          {t('testimonials.title')}
        </p>
        <div>
          <h4 className="testimonial-heading fs-4 fw-bold border-bottom pb-3">
            {`“${t('testimonials.quote1')}”`}
            {/* “TekTime a non seulement décidé de donner un pourcentage de ses revenus, mais a rationalisé son approche pour choisir les associations les plus efficaces. Cet engagement fondé sur les preuves témoigne de leur sérieux et de leur désir sincère d’avoir un impact positif durable.” */}
          </h4>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3 mt-3 align-items-center">
              <div>
                <img
                  src="/Assets/landing/testimonial3.png"
                  width={80}
                  alt=""
                  className="img-fluid"
                  style={{ borderRadius: "100%" }}
                />
              </div>
              <div>
                <p className="mb-0 text-dark author-description">{t('testimonials.author2')}</p>
                <span className="mb-0 text-dark">{t('testimonials.position2')}</span>
              </div>
            </div>
            {/* <div className="d-flex gap-2 align-items-center mt-3">
              <img src="Assets/arrow-left.svg" alt="" className="img-fluid" />
              <img src="Assets/arrow-right.svg" alt="" className="img-fluid" />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
