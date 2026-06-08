import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../Components/Apicongfig";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import CookieService from "../Components/Utils/CookieService";

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: "linkedin-failed" }, "*");
        window.close();
      } else {
        toast.error(`LinkedIn Authorization Failed: ${errorDescription || error}`);
        navigate("/profile?tab=integrations");
      }
      return;
    }

    if (!code || !state) {
      if (window.opener) {
        window.opener.postMessage({ type: "linkedin-failed" }, "*");
        window.close();
      } else {
        toast.error("Invalid callback URL");
        navigate("/profile?tab=integrations");
      }
      return;
    }

    const verifyCallback = async () => {
      try {
        const token = CookieService.get("token");
        const response = await axios.get(
          `${API_BASE_URL}/auth/linkedin/callback?code=${code}&state=${state}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          if (window.opener) {
            window.opener.postMessage({ type: "linkedin-success" }, "*");
            window.close();
          } else {
            toast.success("LinkedIn account linked successfully!");
            navigate("/profile?tab=integrations");
          }
        } else {
          if (window.opener) {
            window.opener.postMessage({ type: "linkedin-failed" }, "*");
            window.close();
          } else {
            toast.error("Failed to link LinkedIn account.");
            navigate("/profile?tab=integrations");
          }
        }
      } catch (error) {
        console.error("Error linking LinkedIn:", error);
        if (window.opener) {
          window.opener.postMessage({ type: "linkedin-failed" }, "*");
          window.close();
        } else {
          toast.error("An error occurred while linking LinkedIn account.");
          navigate("/profile?tab=integrations");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyCallback();
  }, [location, navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Spinner animation="border" role="status" variant="primary" />
      <h4 className="mt-3" style={{ color: "#344054" }}>
        Linking your LinkedIn account...
      </h4>
      <p style={{ color: "#667085" }}>Please wait, this may take a moment.</p>
    </div>
  );
};

export default LinkedInCallback;
