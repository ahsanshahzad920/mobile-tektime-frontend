import React from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { TbError404 } from "react-icons/tb";
import { IoMdArrowBack } from "react-icons/io";

// Routes gérées par le second bloc <Routes> (pages vitrine dans BasePage).
// Le catch-all de ce composant vit dans le premier bloc <Routes> ; pour ces
// chemins-là, on rend null afin de laisser le second bloc afficher la vraie
// page (sinon le 404 se superposerait à l'accueil, /about, etc.).
const PUBLIC_ROUTES = [
    "/",
    "/search-results",
    "/register/:referral_id?",
    "/about",
    "/privacy",
    "/privacy-policy",
    "/gate/:name",
    "/terms-and-conditions",
];

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        matchPath({ path: route, end: true }, location.pathname),
    );
    if (isPublicRoute) {
        return null;
    }

    return (
        <Container className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
            <Row>
                <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                    <div className="mb-4">
                        <TbError404 size={90} color="#2C48AE" />
                    </div>
                    <h2 className="mb-3 fw-bold">Page introuvable</h2>
                    <p className="text-muted mb-4 fs-5">
                        Désolé, la page que vous cherchez n'existe pas ou a été
                        déplacée. Vérifiez l'adresse ou revenez à l'accueil.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button
                            variant="outline-primary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                            onClick={() => navigate(-1)}
                        >
                            <IoMdArrowBack size={20} />
                            Page précédente
                        </Button>
                        <Button
                            variant="primary"
                            className="px-4 py-2"
                            onClick={() => navigate("/")}
                        >
                            Retour à l'accueil
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFound;
