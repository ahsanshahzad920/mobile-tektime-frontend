import React from "react";
import { Container, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BiErrorCircle } from "react-icons/bi";
import { IoMdArrowBack } from "react-icons/io";

const AccessDenied = () => {
    const navigate = useNavigate();
    const [t] = useTranslation("global");

    return (
        <Container className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
            <Row>
                <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                    <div className="mb-4">
                        <BiErrorCircle size={80} color="#dc3545" />
                    </div>
                    <h2 className="mb-3 fw-bold">{t("header.access.denied")}</h2>
                    <p className="text-muted mb-4 fs-5">
                        {t("header.access.notIncludedMsg")}
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button
                            variant="outline-primary"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                            onClick={() => navigate(-2)}
                        >
                            <IoMdArrowBack size={20} />
                            {t("buttons.goBack")}
                        </Button>
                        <Button
                            variant="primary"
                            className="px-4 py-2"
                            onClick={() => navigate("/")}
                        >
                            {t("sidebar.home", "Home")}
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AccessDenied;
