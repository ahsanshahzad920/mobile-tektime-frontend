import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "./Testimonials.scss";

export default function Testimonials({ data }) {
  const { t } = useTranslation("global");

  // API fields: headline, content, author_name, author_role
  // Fallback fields: title, text, author, role, avatar
  const testimonials =
    data?.testimonials ||
    t("testimonials-discussions.list", { returnObjects: true });

  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="text-center section-header">
          <span className="badge-text">
            {t("testimonials-discussions.badge")}
          </span>
          <h2 className="section-title">
            {data?.testimonials_title || t("testimonials-discussions.title")}
          </h2>
        </div>

        <div className="testimonials-grid">
          {testimonials?.map((tItem, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="quote-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 11H6C5.45 11 5 10.55 5 10V7C5 6.45 5.45 6 6 6H8C8.55 6 9 5.55 9 5V4C9 3.45 8.55 3 8 3H5C3.9 3 3 3.9 3 5V11C3 13.2 4.8 15 7 15H10V11ZM21 11H17C16.45 11 16 10.55 16 10V7C16 6.45 16.45 6 17 6H19C19.55 6 20 5.55 20 5V4C20 3.45 19.55 3 19 3H16C14.9 3 14 3.9 14 5V11C14 13.2 15.8 15 18 15H21V11Z"
                    fill="#E2E8F0"
                  />
                </svg>
              </div>

              <div className="stars">★★★★★</div>

              <h3 className="testimonial-title">
                {tItem.headline || tItem.title}
              </h3>
              <p className="testimonial-text">
                "{tItem.content || tItem.text}"
              </p>

              <div className="testimonial-footer">
                <img
                  src={
                    tItem.avatar ||
                    `https://i.pravatar.cc/150?u=${tItem.author_name || tItem.author}`
                  }
                  alt={tItem.author_name || tItem.author}
                  className="testimonial-avatar"
                />
                <div className="testimonial-info">
                  <div className="testimonial-author">
                    {tItem.author_name || tItem.author}
                  </div>
                  <div className="testimonial-role">
                    {tItem.author_role || tItem.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
