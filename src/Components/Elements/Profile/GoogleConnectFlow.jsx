import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Stack,
  Alert,
  Spinner,
  ListGroup,
  Accordion,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";

const formatConnectionDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const GoogleConnectFlow = ({ user, onUpdate }) => {
  const [t] = useTranslation("global");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    appPassword: "",
  });

  const hasAccounts = user?.gmail_suit && user.gmail_suit.length > 0;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });

  const handleConnect = async () => {
    if (
      !formData.email ||
      !formData.appPassword ||
      !formData.firstName ||
      !formData.lastName
    ) {
      setError(t("gmail.errorAllFields"));
      return;
    }
    if (formData.appPassword.replace(/\s/g, "").length !== 16) {
      setError(t("gmail.errorAppPassword"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/gmail-suite/login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          enterprise_id: user?.enterprise?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          app_password: formData.appPassword.replace(/\s/g, ""),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || t("gmail.errorConnection"));

      toast.success(t("gmail.successConnected"));
      setSuccess(true);
      setFormData({ firstName: "", lastName: "", email: "", appPassword: "" });
      setStep(1);
      setShowInstructions(false);
      onUpdate?.();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    setDeletingId(accountToDelete.id);
    setShowDeleteModal(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/gmail-suit/${accountToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || t("gmail.errorDelete")
        );

      toast.success(t("gmail.successDeleted"));
      onUpdate?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
      setAccountToDelete(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const startAddingNew = () => {
    setStep(2);
    setError("");
    setSuccess(false);
  };

  useEffect(() => {
    if (!hasAccounts) setShowInstructions(true);
  }, [hasAccounts]);

  return (
    <>
      <style jsx>{`
        :global(body) {
          font-family: "Google Sans", "Roboto", system-ui, sans-serif;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .google-blue {
          color: #1a73e8;
        }
        .btn-primary-google {
          background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.25s ease;
        }
        .btn-primary-google:hover {
          background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 115, 232, 0.3);
        }
        .btn-success-google {
          background: linear-gradient(135deg, #34a853 0%, #2d8e44 100%);
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: 600;
        }
        .btn-success-google:hover {
          background: linear-gradient(135deg, #2d8e44 0%, #276c38 100%);
          transform: translateY(-2px);
        }
        .account-card {
          background: #f8f9fa;
          border-radius: 14px;
          border: none;
          transition: all 0.2s ease;
        }
        .account-card:hover {
          background: #f1f3f4;
          transform: translateY(-2px);
        }
        .instruction-panel {
          background: linear-gradient(135deg, #f8f9fa 0%, #e8f0fe 100%);
          border-left: 5px solid #4285f4;
          border-radius: 0 14px 14px 0;
        }
        .form-control-modern {
          border-radius: 12px;
          border: 1.5px solid #dadce0;
          padding: 12px 16px;
          font-size: 15px;
          transition: all 0.2s ease;
        }
        .form-control-modern:focus {
          border-color: #1a73e8;
          box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1);
        }
        .label-modern {
          font-weight: 600;
          color: #3c4043;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .google-icon-wrapper {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 14px;
        }
        .link-blue {
          color: #1a73e8;
          font-weight: 500;
          text-decoration: none;
        }
        .link-blue:hover {
          text-decoration: underline;
        }
        .delete-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .delete-btn:hover {
          background: rgba(220, 53, 69, 0.1) !important;
        }
      `}</style>

      <div className="d-flex justify-content-center px-3">
        <Card
          className="glass-card"
          style={{ maxWidth: "640px", width: "100%" }}
        >
          <Card.Header className="bg-transparent border-0 pt-5 pb-4 px-5">
            <Stack
              direction="horizontal"
              gap={4}
              className="align-items-center"
            >
              <div className="google-icon-wrapper">
                <svg width="36" height="36" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 fw-bold" style={{ color: "#202124" }}>
                  {t("gmail.title")}
                </h3>
                <p className="mb-0 text-muted">
                  {hasAccounts
                    ? `${user.gmail_suit.length} ${t(
                        `gmail.accountsConnected${
                          user.gmail_suit.length > 1 ? "_plural" : ""
                        }`
                      )}`
                    : t("gmail.noAccount")}
                </p>
              </div>
            </Stack>
          </Card.Header>

          <Card.Body className="px-5 pb-5">
            {step === 1 && (
              <>
                {hasAccounts ? (
                  <>
                    <ListGroup variant="flush" className="mb-4">
                      {user.gmail_suit.map((acc) => (
                        <ListGroup.Item
                          key={acc.id}
                          className="account-card px-4 py-4 mb-3 border-0 shadow-sm"
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-dark">
                                {acc.first_name} {acc.last_name}
                              </div>
                              <div className="text-muted small mt-1">
                                {acc.email}
                              </div>
                              {acc.created_at && (
                                <div className="text-success small mt-2 fw-medium">
                                  {t("gmail.connectedOn", {
                                    date: formatConnectionDate(acc.created_at),
                                  })}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="link"
                              className="text-danger delete-btn p-0"
                              onClick={() => handleDelete(acc)}
                              disabled={deletingId === acc.id}
                            >
                              {deletingId === acc.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12z" />
                                </svg>
                              )}
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <Accordion className="mb-4">
                      <Accordion.Item eventKey="0" className="border-0">
                        <Accordion.Header className="bg-light rounded-3">
                          <span className="fw-semibold google-blue">
                            {showInstructions
                              ? t("gmail.hideInstructions")
                              : t("gmail.showInstructions")}
                          </span>
                        </Accordion.Header>
                        <Accordion.Body className="pt-3">
                          <div className="instruction-panel p-4">
                            <h6 className="fw-bold mb-3">
                              {t("gmail.instructionsTitle")}
                            </h6>
                            <ol className="mb-3 ps-4">
                              <li className="mb-2">
                                <a
                                  href="https://myaccount.google.com/security"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-blue"
                                >
                                  {t("gmail.step1")}
                                </a>
                              </li>
                              <li className="mb-2">
                                <a
                                  href="https://myaccount.google.com/signinoptions/two-step-verification"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-blue"
                                >
                                  {t("gmail.step2")}
                                </a>
                              </li>
                              <li>
                                <a
                                  href="https://myaccount.google.com/apppasswords"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="link-blue"
                                >
                                  {t("gmail.step3")}
                                </a>
                              </li>
                            </ol>
                            <a
                              href="https://support.google.com/accounts/answer/185833"
                              target="_blank"
                              rel="noreferrer"
                              className="small link-blue"
                            >
                              Full tutorial by Google →
                            </a>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

                    <div className="text-center">
                      <Button
                        className="btn-primary-google text-white"
                        onClick={startAddingNew}
                      >
                        {t("gmail.addAnother")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="instruction-panel p-5 mb-5 text-center">
                    <h5 className="fw-bold mb-4">
                      {t("gmail.prepareAccount")}
                    </h5>
                    <p
                      className="text-muted mb-4"
                      dangerouslySetInnerHTML={{
                        __html: t("gmail.prepareText"),
                      }}
                    />
                    <ol
                      className="text-start d-inline-block mb-4"
                      style={{ maxWidth: "420px" }}
                    >
                      <li className="mb-3">
                        <a
                          href="https://myaccount.google.com/security"
                          target="_blank"
                          rel="noreferrer"
                          className="link-blue fw-semibold"
                        >
                          {t("gmail.step1")} →
                        </a>
                      </li>
                      <li className="mb-3">
                        <a
                          href="https://myaccount.google.com/signinoptions/two-step-verification"
                          target="_blank"
                          rel="noreferrer"
                          className="link-blue fw-semibold"
                        >
                          {t("gmail.step2")} →
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="link-blue fw-semibold"
                        >
                          {t("gmail.step3")} →
                        </a>
                      </li>
                    </ol>
                    <Button
                      className="btn-primary-google text-white px-5"
                      onClick={() => setStep(2)}
                    >
                      {t("gmail.continue")}
                    </Button>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConnect();
                }}
              >
                {error && (
                  <Alert variant="danger" className="rounded-3">
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" className="rounded-3">
                    Connected successfully!
                  </Alert>
                )}

                <div className="text-end mb-3">
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noreferrer"
                    className="small link-blue"
                  >
                    {t("gmail.needHelp")}
                  </a>
                </div>

                <Row className="g-4">
                  <Col md={6}>
                    <Form.Label className="label-modern">
                      {t("gmail.firstName")}
                    </Form.Label>
                    <Form.Control
                      className="form-control-modern"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="label-modern">
                      {t("gmail.lastName")}
                    </Form.Label>
                    <Form.Control
                      className="form-control-modern"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                    />
                  </Col>
                </Row>

                <Form.Group className="mt-4">
                  <Form.Label className="label-modern">
                    {t("gmail.email")}
                  </Form.Label>
                  <Form.Control
                    className="form-control-modern"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@gmail.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mt-4">
                  <Form.Label className="label-modern">
                    {t("gmail.appPassword")}
                  </Form.Label>
                  <small className="text-muted d-block mb-2">
                    {t("gmail.appPasswordHelp")}
                  </small>
                  <Form.Control
                    className="form-control-modern"
                    type="text"
                    name="appPassword"
                    value={formData.appPassword}
                    onChange={handleChange}
                    // placeholder="abcd efgh ijkl mnop"
                    required
                    // maxLength={16}
                    // style={{ letterSpacing: "2px", fontFamily: "monospace" }}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mt-5 pt-3">
                  <Button
                    variant="link"
                    className="text-muted"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    {t("gmail.back")}
                  </Button>
                  <Button
                    className="btn-success-google text-white"
                    type="submitirb submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        {t("gmail.connecting")}
                      </>
                    ) : (
                      t("gmail.connectButton")
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-header border-0 pb-2">
                <h5 className="modal-title fw-bold text-danger">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="me-2"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {t("gmail.deleteConfirmTitle")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body pt-2">
                <p className="text-muted mb-3">
                  {t("gmail.deleteConfirmText")}
                </p>
                {accountToDelete && (
                  <div className="bg-light rounded-3 p-3 border-start border-danger border-4">
                    <div className="fw-semibold">
                      {accountToDelete.first_name} {accountToDelete.last_name}
                    </div>
                    <div className="text-muted small">
                      {accountToDelete.email}
                    </div>
                  </div>
                )}
                <div className="mt-4 text-danger small">
                  <strong>{t("gmail.deleteWarning")}</strong>
                </div>
              </div>
              <div className="modal-footer border-0 pt-2">
                <Button
                  variant="light"
                  className="px-4"
                  onClick={closeDeleteModal}
                  disabled={!!deletingId}
                >
                  {t("gmail.cancel")}
                </Button>
                <Button
                  variant="danger"
                  className="px-5 fw-semibold"
                  onClick={confirmDelete}
                  disabled={!!deletingId}
                >
                  {deletingId ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t("gmail.deleting")}
                    </>
                  ) : (
                    t("gmail.delete")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleConnectFlow;
