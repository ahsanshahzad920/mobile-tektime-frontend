import React, { useEffect, useState } from "react";
import { Spinner, Button, Container, Card } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CookieService from "../Utils/CookieService";
import { API_BASE_URL } from "../Apicongfig";
import { useTranslation } from "react-i18next";
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const StripePaymentCompleted = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus("error");
        setLoading(false);
        return;
      }

      try {
        const token = CookieService.get("token");
        
        // Using FormData for --form equivalent
        const formData = new FormData();
        formData.append("session_id", sessionId);

        const response = await axios.post(
          `${API_BASE_URL}/stripe/verify-session`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data?.success || response.status === 200) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error verifying Stripe session:", err);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
        padding: "20px"
      }}
    >
      <Card 
        style={{ 
          maxWidth: "500px", 
          width: "100%", 
          border: "none", 
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "40px", textAlign: "center" }}>
          {loading ? (
            <div className="py-4">
              <Spinner 
                animation="border" 
                style={{ width: "3.5rem", height: "3.5rem", color: "#635BFF" }} 
                className="mb-4" 
              />
              <h3 style={{ fontWeight: "700", color: "#334E68" }}>{t("stripe_payment.verifying_title")}</h3>
              <p style={{ color: "#627D98" }}>{t("stripe_payment.verifying_text")}</p>
            </div>
          ) : status === "success" ? (
            <div className="py-2">
              <div className="mb-4">
                <IoCheckmarkCircleOutline size={90} color="#2FA25D" />
              </div>
              <h2 style={{ fontWeight: "800", color: "#102A43", marginBottom: "16px" }}>{t("stripe_payment.success_title")}</h2>
              <p style={{ color: "#486581", fontSize: "1.1rem", lineHeight: "1.6" }}>
                {t("stripe_payment.success_text")}
              </p>
              <div className="mt-5">
                <Button 
                  onClick={() => navigate(-1)}
                  style={{ 
                    backgroundColor: "#635BFF", 
                    border: "none", 
                    borderRadius: "12px", 
                    padding: "12px 40px", 
                    fontWeight: "600",
                    fontSize: "1.05rem",
                    boxShadow: "0 4px 14px rgba(99, 91, 255, 0.4)"
                  }}
                >
                  {t("stripe_payment.goto_meetings")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="mb-4">
                <IoCloseCircleOutline size={90} color="#D64545" />
              </div>
              <h2 style={{ fontWeight: "800", color: "#102A43", marginBottom: "16px" }}>{t("stripe_payment.failed_title")}</h2>
              <p style={{ color: "#486581", fontSize: "1.1rem", lineHeight: "1.6" }}>
                {t("stripe_payment.failed_text")}
              </p>
              <div className="mt-5 d-flex gap-3 justify-content-center">
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: "12px", padding: "12px 25px", fontWeight: "600" }}
                >
                  {t("stripe_payment.back")}
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  style={{ 
                    backgroundColor: "#635BFF", 
                    border: "none", 
                    borderRadius: "12px", 
                    padding: "12px 25px", 
                    fontWeight: "600"
                  }}
                >
                  {t("stripe_payment.retry_btn")}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ backgroundColor: "#F0F4F8", padding: "15px", textAlign: "center" }}>
          <small style={{ color: "#829AB1" }}>
            {t("stripe_payment.secure_footer")}
          </small>
        </div>
      </Card>
    </div>
  );
};

export default StripePaymentCompleted;
