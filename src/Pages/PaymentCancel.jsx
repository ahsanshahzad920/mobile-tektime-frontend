import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "../style/PaymentCancel.css";
import logo from "../Media/logo.png";

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-cancel-wrapper">
            <Card className="cancel-card">
                <div className="logo-container">
                    <img src={logo} alt="Tektime Logo" className="tektime-logo" />
                </div>

                <Card.Body className="p-0">
                    <div className="mb-4">
                        <div className="icon-container-cancel">
                            <FaTimesCircle className="cancel-icon" />
                        </div>
                    </div>

                    <h2 className="cancel-title">Paiement Annulé</h2>

                    <p className="cancel-text">
                        Le processus de paiement a été annulé. Aucun montant n'a été débité.
                    </p>

                    <div className="d-grid gap-3 justify-content-center">
                        <Button
                            className="return-btn"
                            onClick={() => navigate("/register")}
                        >
                            Retour à l'inscription
                        </Button>

                        {/* <Button 
                variant="link" 
                onClick={() => navigate("/")}
                className="text-decoration-none text-muted"
            >
                Retour à l'accueil
            </Button> */}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PaymentCancel;
