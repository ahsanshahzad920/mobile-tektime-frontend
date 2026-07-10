import React, { useEffect } from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";
import CookieService from "../Components/Utils/CookieService";
import { API_BASE_URL } from "../Components/Apicongfig";

const SubscriptionExpiredPage = () => {
  const [t] = useTranslation("global");

  // Retrieve the payment URL from query param or storage
  const queryParams = new URLSearchParams(window.location.search);
  const paymentUrl =
    queryParams.get("payment_url") ||
    localStorage.getItem("payment_url") ||
    sessionStorage.getItem("payment_url") ||
    "";
    
  const [loading, setLoading] = React.useState(false);

  // Prevent user from navigating back
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleRedirect = async () => {
    setLoading(true);
    try {
      // First try to generate a fresh link
      const response = await fetch(`${API_BASE_URL}/subscription/renew-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CookieService.get("token")}`
        }
      });
      const data = await response.json();
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
    } catch (err) {
      console.error("Error generating fresh checkout link", err);
    }
    setLoading(false);

    // Fallback to cached URL if dynamic generation fails
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      console.warn("Payment URL not found in storage");
      window.location.href = "/";
    }
  };

  return (
    <div
      style={{
        background: "radial-gradient(circle at top left, #1e1b4b, #0f172a, #020617)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Glow Elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <Container className="d-flex justify-content-center">
        <Card
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "3.5rem 2rem",
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            color: "#f8fafc",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
            }}
          >
            <FiAlertTriangle size={38} color="#ef4444" />
          </div>

          <h2
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("subscription.expired.title", "Abonnement expiré")}
          </h2>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "#94a3b8",
              marginBottom: "2rem",
            }}
          >
            {t(
              "subscription.expired.message",
              "Votre période d'essai ou votre abonnement a pris fin. Pour continuer à accéder à votre tableau de bord et à vos réunions, veuillez renouveler votre abonnement."
            )}
          </p>

          {/* Assistant Message Bubble */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              padding: "1.25rem",
              marginBottom: "2rem",
              textAlign: "left",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3aa5ed 0%, #0fb8cb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(58, 165, 237, 0.3)"
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>🤖</span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <strong style={{ display: "block", color: "#e2e8f0", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                Assistant TekTIME
              </strong>
              <p style={{ margin: 0, fontSize: "0.92rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                {t(
                  "subscription.expired.assistant_message",
                  "Bonjour ! Votre période d'essai gratuite est terminée. Pour continuer à profiter de toutes les fonctionnalités de TekTIME, veuillez configurer votre moyen de paiement en cliquant sur le bouton Stripe ci-dessous."
                )}
              </p>
            </div>
          </div>

          <Button
            disabled={loading}
            onClick={handleRedirect}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              border: "none",
              borderRadius: "14px",
              padding: "0.85rem 2rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              boxShadow: "0 10px 25px rgba(99, 102, 241, 0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 30px rgba(99, 102, 241, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(99, 102, 241, 0.35)";
            }}
          >
            <MdOutlinePayment size={22} />
            {loading ? (t("subscription.expired.loading", "Redirection...") || "Redirection...") : t("subscription.expired.cta", "Renouveler l'abonnement")}
          </Button>

          <div
            style={{
              marginTop: "2rem",
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            {t(
              "subscription.expired.support",
              "Besoin d'aide ? Contactez notre équipe de support."
            )}
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default SubscriptionExpiredPage;
