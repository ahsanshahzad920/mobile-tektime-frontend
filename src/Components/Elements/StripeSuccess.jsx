import React, { useEffect, useState } from "react";
import { Spinner, Button } from "react-bootstrap";
import axios from "axios";
import CookieService from "../Utils/CookieService";
import { API_BASE_URL } from "../Apicongfig";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const StripeSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [t] = useTranslation("global");

  useEffect(() => {
    const handleReturn = async () => {
      try {
        const token = CookieService.get("token");
       const response =  await axios.get(
          `${API_BASE_URL}/stripe/return`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if(response?.data?.charges_enabled){
          if (window.opener) {
            window.opener.postMessage({ type: "stripe-success" }, "*");
          }


        }else{
          toast.info("Nous recevons les informations que vous nous fournissez. Dès que votre compte sera vérifié, nous vous en informerons par courriel.")
        }
        
        // Notify parent window to refresh
      } catch (err) {
        console.error("Error in Stripe return:", err);
        setError("Failed to finalize the connection. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleReturn();
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <div 
      style={{ 
        height: "100vh", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}
    >
      <div 
        style={{ 
          textAlign: "center", 
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "450px",
          width: "90%"
        }}
      >
        {loading ? (
          <>
            <Spinner animation="border" style={{ color: "#635BFF" }} className="mb-4" />
            <h4 style={{ fontWeight: "600" }}>Finalizing Connection...</h4>
            <p className="text-muted">Please wait while we confirm your Stripe integration.</p>
          </>
        ) : error ? (
          <>
            <div style={{ color: "#dc3545", fontSize: "50px", marginBottom: "20px" }}>✕</div>
            <h4 style={{ fontWeight: "600", color: "#dc3545" }}>Something went wrong</h4>
            <p className="text-muted">{error}</p>
            <Button variant="outline-primary" className="mt-3" onClick={handleClose}>
              Close Window
            </Button>
          </>
        ) : (
          <>
            <div 
              style={{ 
                width: "80px",
                height: "80px",
                backgroundColor: "#2fa25d",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "white",
                fontSize: "40px",
                boxShadow: "0 4px 10px rgba(47, 187, 103, 0.3)"
              }}
            >
              ✓
            </div>
            <h2 style={{ marginBottom: "10px", fontWeight: "700", color: "#1a1a1a" }}>Connected!</h2>
            <p style={{ color: "#6c757d", lineHeight: "1.5" }}>
              Your Stripe account has been successfully linked to TekTime.
            </p>
            <div className="mt-4">
              <Button 
                style={{ backgroundColor: "#635BFF", borderColor: "#635BFF", borderRadius: "10px", padding: "10px 30px", fontWeight: "600" }}
                onClick={handleClose}
              >
                Return to TekTime
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StripeSuccess;
