import React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import "./Pricing.scss";
import { API_BASE_URL } from "../../../Components/Apicongfig";

// Helper to map a raw contract object to a plan card object
function mapContractToPlan(item, t) {
  let currencySymbol = item.currency;
  if (
    item.currency === "Dollar" ||
    item.currency === "USD" ||
    item.currency === "usd"
  )
    currencySymbol = "$";
  else if (
    item.currency === "Euro" ||
    item.currency === "EUR" ||
    item.currency === "eur"
  )
    currencySymbol = "€";

  const isMonthly =
    item.payment_type?.toLowerCase().includes("mensuelle") ||
    item.payment_type?.toLowerCase().includes("monthly");
  const cycle = isMonthly ? "monthly" : "yearly";

  return {
    name: item.name,
    price: `${currencySymbol}${parseFloat(item.price).toFixed(0)}`,
    period: isMonthly
      ? t("pricing.per_month")
      : cycle === "yearly"
        ? t("pricing.per_year")
        : item.payment_type,
    description: item.description,
    licenses: item.no_of_licenses,
    billingCycle: cycle,
    features: [
      `${item.no_of_licenses} ${item.no_of_licenses > 1 ? t("pricing.licenses") : t("pricing.license")}`,
      isMonthly
        ? t("pricing.monthly_billing")
        : cycle === "yearly"
          ? t("pricing.annual_billing")
          : item.payment_type,
    ].filter(Boolean),
    isPopular: item.name === "Pro" || item.name === "Basic Messages",
    id: item.id,
    stripe_price_id: item.stripe_price_id,
    check_stripe: item.check_stripe,
  };
}

export default function Pricing({ data }) {
  const { t } = useTranslation("global");
  const [billingCycle, setBillingCycle] = React.useState("monthly");
  const [allPlans, setAllPlans] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // If contracts are provided from parent (landing page data), use them directly
    if (data?.contracts && Array.isArray(data.contracts)) {
      const mappedPlans = data.contracts.map((item) =>
        mapContractToPlan(item, t),
      );

      // Add Enterprise Plan
      mappedPlans.push({
        name: t("pricing.enterprise.title"),
        price: t("pricing.enterprise.price_text"),
        period: t("pricing.enterprise.bespoke_pricing"),
        features: t("pricing.enterprise.features", { returnObjects: true }),
        isPopular: false,
        isEnterprise: true,
        id: "enterprise",
        billingCycle: "both",
      });

      setAllPlans(mappedPlans);

      // Auto-set billing cycle if no monthly plans available
      const hasMonthly = mappedPlans.some((p) => p.billingCycle === "monthly");
      if (!hasMonthly && mappedPlans.some((p) => p.billingCycle === "yearly")) {
        setBillingCycle("yearly");
      }

      setLoading(false);
      return;
    }

    // Fallback: standalone fetch (legacy / when no data prop)
    const fetchPlans = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/landing-pages/by-type/${data?.gate_name}`,
        );
        const result = await response.json();

        if (result.success && result.data) {
          // The API returns the landing page object in 'data', which contains 'contracts'
          const rawContracts = Array.isArray(result.data)
            ? result.data
            : result.data.contracts || [];

          const mappedPlans = rawContracts.map((item) =>
            mapContractToPlan(item, t),
          );

          mappedPlans.push({
            name: t("pricing.enterprise.title"),
            price: t("pricing.enterprise.price_text"),
            period: t("pricing.enterprise.bespoke_pricing"),
            features: t("pricing.enterprise.features", { returnObjects: true }),
            isPopular: false,
            isEnterprise: true,
            id: "enterprise",
            billingCycle: "both",
          });

          setAllPlans(mappedPlans);

          // Auto-set billing cycle if no monthly plans available
          const hasMonthly = mappedPlans.some(
            (p) => p.billingCycle === "monthly",
          );
          if (
            !hasMonthly &&
            mappedPlans.some((p) => p.billingCycle === "yearly")
          ) {
            setBillingCycle("yearly");
          }
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Failed to fetch pricing:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (data?.gate_name || data?.id) {
      fetchPlans();
    } else {
      // If no data yet, keep loading or handle appropriately
      // setLoading(false);
    }
  }, [data, t]);

  React.useEffect(() => {
    if (!loading && window.location.hash === "#pricing") {
      const element = document.getElementById("pricing");
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [loading]);

  const hasMonthly = allPlans.some((p) => p.billingCycle === "monthly");
  const hasYearly = allPlans.some((p) => p.billingCycle === "yearly");
  const showToggle = hasMonthly && hasYearly;

  const filteredPlans = allPlans.filter(
    (plan) =>
      plan.billingCycle === "both" || plan.billingCycle === billingCycle,
  );

  if (loading) {
    return (
      <section className="section discussion-pricing-section" id="pricing">
        <div className="container text-center">
          <p>{t("pricing-discussions.loading")}</p>
        </div>
      </section>
    );
  }

  if (error || filteredPlans.length === 0) {
    return null; // Hide pricing section if no contracts available
  }

  return (
    <section className="section discussion-pricing-section" id="pricing">
      <div className="container">
        <div className="text-center section-header">
          <h2 className="section-title">{t("pricing-discussions.title")}</h2>
          <p className="subtitle">{t("pricing-discussions.subtitle")}</p>
        </div>

        {showToggle && (
          <div
            className="pricing-toggle-container"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            <div
              className="pricing-toggle"
              style={{
                background: "#e2e8f0",
                padding: "4px",
                borderRadius: "50px",
                display: "inline-flex",
                position: "relative",
              }}
            >
              <button
                className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                onClick={() => setBillingCycle("yearly")}
                style={{
                  padding: "8px 24px",
                  borderRadius: "50px",
                  border: "none",
                  background:
                    billingCycle === "yearly" ? "white" : "transparent",
                  color: billingCycle === "yearly" ? "#0f172a" : "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    billingCycle === "yearly"
                      ? "0 2px 4px rgba(0,0,0,0.1)"
                      : "none",
                }}
              >
                {t("pricing-discussions.annual")}
              </button>
              <button
                className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                onClick={() => setBillingCycle("monthly")}
                style={{
                  padding: "8px 24px",
                  borderRadius: "50px",
                  border: "none",
                  background:
                    billingCycle === "monthly" ? "white" : "transparent",
                  color: billingCycle === "monthly" ? "#0f172a" : "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    billingCycle === "monthly"
                      ? "0 2px 4px rgba(0,0,0,0.1)"
                      : "none",
                }}
              >
                {t("pricing-discussions.monthly")}
              </button>
            </div>
          </div>
        )}

        <div className="discussion-pricing-grid mt-8">
          {filteredPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`discussion-pricing-card ${plan.isPopular ? "popular" : ""}`}
              style={
                plan.isEnterprise
                  ? {
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "2rem",
                    }
                  : {}
              }
            >
              {plan.isPopular && (
                <div className="discussion-popular-badge">
                  {t("pricing-discussions.most_popular")}
                </div>
              )}
              <div
                className="discussion-plan-header"
                style={
                  plan.isEnterprise
                    ? {
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }
                    : {}
                }
              >
                <h3>{plan.name}</h3>
                {plan.isEnterprise ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span style={{ fontSize: "2rem", lineHeight: "1.2" }}>
                      {plan.price}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <div
                      className="discussion-plan-price"
                      style={{ marginBottom: "0.25rem", width: "100%" }}
                    >
                      {plan.price}
                      <span className="discussion-plan-period">
                        {plan.period}
                      </span>
                    </div>
                    {plan.licenses && (
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        {t(
                          plan.licenses > 1
                            ? "pricing-discussions.for_licenses"
                            : "pricing-discussions.for_license",
                          { count: plan.licenses },
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!plan.isEnterprise && (
                <div className="discussion-plan-features">
                  {plan.description ? (
                    <div
                      className="plan-description-content"
                      dangerouslySetInnerHTML={{ __html: plan.description }}
                    />
                  ) : (
                    plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="discussion-feature-item">
                        <Check size={16} className="discussion-feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              <button
                className={`btn ${plan.isPopular ? "btn-primary" : "btn-secondary"} w-full`}
                onClick={() => {
                  if (plan.isEnterprise) {
                    window.open(
                      "https://calendly.com/tektime/tektime-qu-est-ce-que-c-est",
                      "_blank",
                    );
                    return;
                  }
                  window.location.href = `/register?contract_id=${plan.id}`;
                }}
              >
                {plan.isEnterprise
                  ? t("pricing-discussions.enterprise.speak_to_sales")
                  : t("pricing-discussions.subscribe")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
