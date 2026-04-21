import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./SignIn.scss"; 
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa6";
import { MdLock } from "react-icons/md";
import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";

const SignIn = ({ show, handleClose, handleShowSignUp, handleShowForgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignIn = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Both fields are required.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
    } catch (error) {}
  };
  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <div className="sign-in-modal">
          <Modal.Header className="border-0">
            <div className="d-flex flex-column gap-1 title">
              <Modal.Title>Sign In</Modal.Title>
              <small className="subtitle">
                Sign in to access your centralized meeting hub and manage all
                your meetings effortlessly
              </small>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <div className="input-with-icon">
                  <Form.Control
                    type="email"
                    placeholder="e.g. elonmusk@mars.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FaEnvelope className="input-icon" />
                </div>
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <div className="input-with-icon">
                  <Form.Control
                    type="password"
                    placeholder="e.g. X Æ A-12"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <MdLock className="input-icon" />
                </div>
              </Form.Group>

              <Form.Group
                controlId="formRememberMe"
                className="d-flex justify-content-between align-items-center forgot-password"
              >
                <Form.Check type="checkbox" label="Remember me" />
                <Link
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShowForgot();
                  }}
                >
                  Forgot Password?
                </Link>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 sign-in-submit-btn"
                onClick={(e) => handleSignIn(e)}
              >
                Sign In
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer className="justify-content-start">
            <span>
              Not a member?{" "}
              <Link className="sign-up-link" onClick={handleShowSignUp}>
                Sign up
              </Link>
            </span>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default SignIn;
