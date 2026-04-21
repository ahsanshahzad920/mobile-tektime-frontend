import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "../style/PaymentSuccess.css";
import logo from "../Media/logo.png";

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-success-wrapper">
            <Card className="success-card">
                <div className="logo-container">
                    <img src={logo} alt="Tektime Logo" className="tektime-logo" />
                </div>

                <Card.Body className="p-0">
                    <div className="mb-4">
                        <div className="icon-container">
                            <FaCheckCircle className="success-icon" />
                        </div>
                    </div>

                    <h2 className="success-title">Paiement Réussi !</h2>

                    <p className="success-text">
                        Votre paiement a été effectué avec succès. Vous recevrez un e-mail dans les <span className="email-highlight">5 minutes</span>.
                        Veuillez consulter votre messagerie pour vérifier et finaliser l'activation de votre compte.
                    </p>

                    {/* <div className="d-grid gap-3 justify-content-center">
                        <Button
                            className="connect-btn"
                            onClick={() => navigate("/")}
                        >
                            Se connecter
                        </Button>
                    </div> */}
                </Card.Body>
            </Card>
        </div>
    );
};

export default PaymentSuccess;
