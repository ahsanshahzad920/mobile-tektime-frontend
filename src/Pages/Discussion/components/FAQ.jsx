import React, { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./FAQ.scss";

export default function FAQ({ data }) {
  const { t } = useTranslation("global");
  const [openIndex, setOpenIndex] = useState(null);

  const isFormMode =
    data && ("heroTitle" in data || "gateName" in data || "faq_items" in data);
  const rawFaqs = data?.faq_items || null;
  const faqs = rawFaqs || t("faq.list", { returnObjects: true });

  // In form mode, hide if all FAQ items are empty
  if (
    isFormMode &&
    (!rawFaqs || rawFaqs.every((f) => !f.question && !f.answer))
  )
    return null;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="section faq-section"
      id="faq"
      style={{ padding: "4rem 0" }}
    >
      <div className="container">
        <div className="text-center section-header">
          <h2>{t("faq.title")}</h2>
          <p className="subtitle">{t("faq.subtitle")}</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "open" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <div className="faq-icon-wrapper">
                  {openIndex === index ? (
                    <MinusCircle size={20} />
                  ) : (
                    <PlusCircle size={20} />
                  )}
                </div>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
