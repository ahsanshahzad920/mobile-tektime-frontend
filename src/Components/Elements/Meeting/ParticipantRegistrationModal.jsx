import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaCreditCard, FaPlus, FaMinus, FaCheckCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./ParticipantRegistrationModal.scss";
import axios from "axios";
import CookieService from "../../Utils/CookieService";
import { API_BASE_URL } from "../../Apicongfig";

const ParticipantRegistrationModal = ({ show, handleClose, meetingData, refreshData, user, handleShowSignIn }) => {
  const [t] = useTranslation("global");
  const [step, setStep] = useState(1);
  const [ticketCount, setTicketCount] = useState(1);
  const [participants, setParticipants] = useState([
    { email: "", firstName: "", lastName: "" }
  ]);
  const [loading, setLoading] = useState(false);

  const maxParticipants = meetingData?.max_participants_register || 0;
  const currentParticipantsCount = meetingData?.participants?.length || 0;
  const remainingPlaces = maxParticipants - currentParticipantsCount;

  useEffect(() => {
    if (show) {
      setStep(1);
      setTicketCount(1);
      if (user) {
        setParticipants([{ 
          email: user.email || "", 
          firstName: user.name || "", 
          lastName: user.last_name || "" 
        }]);
      } else {
        setParticipants([{ email: "", firstName: "", lastName: "" }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleTicketChange = (delta) => {
    const newCount = ticketCount + delta;
    if (newCount >= 1 && newCount <= remainingPlaces) {
      setTicketCount(newCount);
      
      // Update participants array length
      if (delta > 0) {
        setParticipants([...participants, { email: "", firstName: "", lastName: "" }]);
      } else {
        setParticipants(participants.slice(0, -1));
      }
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  const validateStep2 = () => {
    const emails = new Set();
    for (let i = 0; i < participants.length; i++) {
      const email = participants[i].email.toLowerCase().trim();
      
      if (!email || !participants[i].firstName || !participants[i].lastName) {
        toast.error(t("Please fill all fields for participant ") + (i + 1));
        return false;
      }
      
      if (!/\S+@\S+\.\S+/.test(email)) {
        toast.error(t("Invalid email for participant ") + (i + 1));
        return false;
      }

      if (emails.has(email)) {
        toast.error(t("The email ") + email + t(" is already used for another participant."));
        return false;
      }
      
      emails.add(email);
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (ticketCount > remainingPlaces) {
        toast.error(t("Not enough places available"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    // Add basic checks
    if (!meetingData?.id) {
      toast.error(t("Meeting ID is missing."));
      return;
    }

    // Ensure all participant fields are valid before submitting
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    
    // Constructing the payload with all collected information
    const payload = {
      meeting_id: meetingData?.id,
      ticket_count: ticketCount,
      participants: participants.map((p) => ({
        first_name: p.firstName,
        last_name: p.lastName,
        email: p.email.toLowerCase().trim(),
      })),
      total_amount: totalPrice,
      currency: "EUR",
    };

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token if available
      const token = CookieService.get("token");
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_BASE_URL}/create-sub-user-meeting`, payload, { headers });
      
      // Check if Stripe redirect URL is provided in the response
      const checkoutUrl = response.data?.checkout_url || response.data?.url || response.data?.data?.url;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.success(t("Registration successful!"));
        setLoading(false);
        handleClose();
        
        if (refreshData) {
          refreshData();
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error?.response?.data?.message || t("An error occurred during registration."));
      setLoading(false);
    }
  };

  const totalPrice = (meetingData?.price || 0) * ticketCount;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      scrollable
      backdrop="static"
      className="participant-registration-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{t("Event Registration")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Stepper Header */}
        <div className="stepper-header">
          <div className={`step-item ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <div className="step-number">{step > 1 ? <FaCheckCircle /> : "1"}</div>
            <div className="step-label">{t("Tickets")}</div>
          </div>
          <div className={`step-item ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
            <div className="step-number">{step > 2 ? <FaCheckCircle /> : "2"}</div>
            <div className="step-label">{t("Details")}</div>
          </div>
          <div className={`step-item ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
            <div className="step-number">{step > 3 ? <FaCheckCircle /> : "3"}</div>
            <div className="step-label">{t("Payment")}</div>
          </div>
        </div>

        <div className="step-content">
          {step === 1 && (
            <div className="text-center py-4">
              <h4 className="mb-3">{t("How many tickets do you need?")}</h4>
              <p className="text-muted mb-4">{t("Select the number of participants you want to register.")}</p>
              
              <div className="ticket-selector">
                <button 
                  onClick={() => handleTicketChange(-1)} 
                  disabled={ticketCount <= 1}
                >
                  <FaMinus />
                </button>
                <div className="ticket-count">{ticketCount}</div>
                <button 
                  onClick={() => handleTicketChange(1)} 
                  disabled={ticketCount >= remainingPlaces}
                >
                  <FaPlus />
                </button>
              </div>

              <div className="remaining-badge">
                {remainingPlaces} {t("places remaining")}
              </div>

              <div className="mt-4 p-4 summary-card">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{t("Price per ticket")}</span>
                  <span className="text-primary fw-bold fs-4">{meetingData?.price || 0} €</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {!user && (
                <div className="summary-card mb-4 p-3 text-center" style={{ border: '1px dashed #3b82f6' }}>
                  <p className="mb-2 text-muted">{t("Want to register faster?")}</p>
                  <Button 
                    variant="link" 
                    className="p-0 text-primary fw-bold" 
                    onClick={() => {
                      handleClose();
                      handleShowSignIn();
                    }}
                  >
                    {t("Log in to pre-fill your details")}
                  </Button>
                </div>
              )}
              <h4 className="mb-4 text-center">{t("Participant Information")}</h4>
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className="participant-row">
                    <div className="row-title">
                      <Badge pill className="me-2">{index + 1}</Badge>
                      {t("Participant")} {index + 1}
                    </div>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{t("First Name")}</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("Enter first name")}
                            value={participant.firstName}
                            onChange={(e) => handleParticipantChange(index, "firstName", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{t("Last Name")}</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder={t("Enter last name")}
                            value={participant.lastName}
                            onChange={(e) => handleParticipantChange(index, "lastName", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>{t("Email Address")}</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder={t("Enter email address")}
                            value={participant.email}
                            onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-2">
              <h4 className="mb-4 text-center">{t("Registration Summary")}</h4>
              <div className="summary-card mb-4">
                <div className="summary-item">
                  <span>{t("Event")}</span>
                  <span className="fw-bold text-end">{meetingData?.title}</span>
                </div>
                <div className="summary-item">
                  <span>{t("Tickets")}</span>
                  <span className="fw-bold">x {ticketCount}</span>
                </div>
                <div className="summary-item">
                  <span>{t("Price per ticket")}</span>
                  <span className="fw-bold">{meetingData?.price || 0} €</span>
                </div>
                <div className="summary-item total">
                  <span>{t("Total Amount")}</span>
                  <span>{totalPrice} €</span>
                </div>
              </div>

              <div className="summary-card mb-4 p-4">
                <div className="d-flex align-items-center gap-4">
                  <div className="icon-box p-3 bg-primary bg-opacity-10 rounded-4 text-primary">
                    <FaCreditCard size={32} />
                  </div>
                  <div>
                    <h5 className="mb-1 text-white">{t("Secure Payment")}</h5>
                    <p className="text-muted mb-0">{t("Your payment is processed securely via our provider.")}</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-muted small">
                {t("By completing this registration, you agree to the event's terms and conditions.")}
              </p>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {step > 1 && (
          <Button variant="secondary" onClick={prevStep} disabled={loading} className="d-flex align-items-center justify-content-center">
            <span className="d-none d-md-inline">{t("Back")}</span>
            <FaArrowLeft className="d-md-none" />
          </Button>
        )}
        <Button 
          variant="primary" 
          onClick={step === 3 ? handleSubmit : nextStep}
          disabled={loading}
          className="d-flex align-items-center justify-content-center"
        >
          {loading ? (
            t("Processing...")
          ) : (
            <>
              <span className="d-none d-md-inline">
                {step === 3 ? t("Complete Registration") : t("Next")}
              </span>
              <span className="d-md-none">
                {step === 3 ? <FaCheckCircle size={20} /> : <FaArrowRight size={20} />}
              </span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ParticipantRegistrationModal;
