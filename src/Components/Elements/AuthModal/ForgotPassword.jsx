import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./SignIn.scss"; 
import { toast } from "react-toastify";
import { MdLock } from "react-icons/md";

const ForgotPassword = ({ show, handleClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");

  const handleReset = (e) => {
    e.preventDefault();

    if (newPassword === "" || reenterPassword === "") {
      toast.error("Both fields are required.");
      return;
    }

    if (newPassword !== reenterPassword) {
      toast.error("Passwords do not match.");
      return;
    }
  };
  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <div className="sign-in-modal">
          <Modal.Header className="border-0">
            <div className="d-flex flex-column gap-1 title">
              <Modal.Title>Reset Password</Modal.Title>
              <small className="subtitle">
                Regain Access to Your Account Quickly and Securely
              </small>
            </div>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formNewPasseword">
                <Form.Label>New password</Form.Label>
                <div className="input-with-icon">
                  <Form.Control
                    type="password"
                    placeholder="e.g. X Æ A-12"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <MdLock className="input-icon" />
                </div>
              </Form.Group>

              <Form.Group controlId="formReEnterNewPassword">
                <Form.Label>Re-enter new password</Form.Label>
                <div className="input-with-icon">
                  <Form.Control
                    type="password"
                    placeholder="e.g. X Æ A-12"
                    value={reenterPassword}
                    onChange={(e) => setReenterPassword(e.target.value)}
                  />
                  <MdLock className="input-icon" />
                </div>
              </Form.Group>

              <div className="mt-3">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 sign-in-submit-btn"
                  onClick={(e) => handleReset(e)}
                >
                  Update Password
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
};

export default ForgotPassword;
