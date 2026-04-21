import CookieService from '../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../Apicongfig";
import axios from "axios";

const AccessControl = ({ need, children }) => {
    const navigate = useNavigate();
    const [t] = useTranslation("global");
    const [isAllowed, setIsAllowed] = useState(null); // null = loading
    const userID = CookieService.get("user_id");
    const role = CookieService.get("type");

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Fetch fresh user data to be sure about permissions
                // Or strictly rely on sessionStorage if 'user' object is stored there.
                // Given Sidebar fetches user, let's fetch here too or read from session if available and reliable.
                // To be safe and consistent with Sidebar, let's fetch.

                const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CookieService.get("token")}`,
                    },
                });

                const user = response?.data?.data;
                const isAdmin = ["Admin", "MasterAdmin", "SuperAdmin"].includes(role);

                if (!user) {
                    setIsAllowed(false);
                    return;
                }

                const isContractTrue = user?.enterprise?.contract?.[need] === true;

                if (need === "casting_need") {
                    if (isAdmin || isContractTrue) {
                        setIsAllowed(true);
                    } else {
                        setIsAllowed(false);
                    }
                } else {
                    if (isContractTrue) {
                        setIsAllowed(true);
                    } else {
                        setIsAllowed(false);
                    }
                }

            } catch (error) {
                console.error("Access check failed", error);
                setIsAllowed(false);
            }
        };

        if (userID) {
            checkAccess();
        } else {
            setIsAllowed(false);
        }
    }, [need, userID, role]);

    useEffect(() => {
        if (isAllowed === false) {
            toast.error(t("header.access.errorMsg"));
            const timer = setTimeout(() => {
                navigate("/access-denied");
            }, 1500); // Reduced delay for better UX
            return () => clearTimeout(timer);
        }
    }, [isAllowed, navigate, t]);

    if (isAllowed === null) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (isAllowed === false) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
                <h3>{t("header.access.denied") || "Access Denied"}</h3>
                <p>{t("header.access.notAllowedMsg") || "You are not allowed to visit this screen. Redirecting..."}</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default AccessControl;
