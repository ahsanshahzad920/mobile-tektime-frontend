import React from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoAlertCircleOutline } from "react-icons/io5";

const StripePaymentCancel = () => {
  const navigate = useNavigate();

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
          <div className="mb-4">
            <IoAlertCircleOutline size={90} color="#F19C38" />
          </div>
          <h2 style={{ fontWeight: "800", color: "#102A43", marginBottom: "16px" }}>Payment Incomplete</h2>
          <p style={{ color: "#486581", fontSize: "1.1rem", lineHeight: "1.6" }}>
            You have not completed the payment process. Your registration is currently pending.
          </p>
          <div className="mt-5">
            <Button 
              onClick={() => navigate("/profile")}
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
              Go to TekTime
            </Button>
          </div>
        </div>
        
        <div style={{ backgroundColor: "#F0F4F8", padding: "15px", textAlign: "center" }}>
          <small style={{ color: "#829AB1" }}>
            Payment security powered by <strong>Stripe</strong>
          </small>
        </div>
      </Card>
    </div>
  );
};

export default StripePaymentCancel;
