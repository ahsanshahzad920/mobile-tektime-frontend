import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ProgressBar } from "react-bootstrap";
import "./SignIn.scss";
import { Link, useParams } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa6";
import { MdLock } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import StepperSignUpModal from "./StepperSignUpModal";

const StepperModal = ({
  show,
  handleClose,
  handleShowSignIn,
  meetingId,
  meeting,
}) => {
  const [t] = useTranslation("global");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [post, setPost] = useState("");
  const [msg, setMsg] = useState("");
  const [agree, setAgree] = useState("");
  const [loading, setLoading] = useState(false);
  const [signUpStepperModal, setSignUpStepperModal] = useState(false);

  const handleNext = async (e) => {
    e.preventDefault();
    if (step === 1 && (!email || !password)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (step === 1 && !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/`, {
        email: email,
        password: password,
      });
      // Check if the message is "Email exists in the database."
      if (response.status) {
        const { name, last_name, post,id } = response?.data?.user;
        setUserId(id)
        setFirstName(name);
        setLastName(last_name);
        setPost(post);
        setEmail(email);
        setDisabled(false);
        setStep(step + 1);
      } else {
        console.log(
          "Email does not exist in the database or message is different."
        );
      }
    } catch (error) {
      toast.error("Invalid credentials");
    }
    // if (step < 2) {
    //   setStep(step + 1);
    // }
  };
  const getProgress = () => {
    return (step / 2) * 100;
  };

  useEffect(() => {
    if (show) {
      setStep(1);
      //   setEmail("");
      //   setPassword("");
      //   setFirstName("");
      //   setLastName("");
      //   setPost("");
      //   setMsg("");
      //   setAgree("");
    }
  }, [show]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error(t("Email is required"));
      return;
    }
    if (!firstName) {
      toast.error(t("First name is required"));
      return;
    }
    if (!lastName) {
      toast.error(t("Last name is required"));
      return;
    }
    if (!isValidEmail(email)) {
      toast.error(t("Please enter a valid email address"));
      return;
    }

    // Validate checkbox
    if (!agree) {
      toast.error(t("You must agree to the terms and conditions"));
      setLoading(false);
      return;
    }

    const formData = {
      user_id:Number(userId),
      email,
      name: firstName,
      last_name: lastName,
      post: post,
      contribution: msg,
      agree: agree,
      role_id: 5,
      meeting_id: Number(meetingId),
    };
    try {
      // setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/update-user-and-participant`,
        formData
      );
      if (response.status === 201) {
        toast.success(t("registered successfully"));
        handleClose();
        // handleShowSignIn();
      } else {
        toast.error(t("Failed to register. Please try again."));
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      toast.error(t(`time_unit.${error?.response?.data?.message}`));
    }
  };

  const [disabled, setDisabled] = useState(false);

  const handleShowSignUpStepperModal = () => {
    handleClose();
    setSignUpStepperModal(true);
  };
  const handleCloseSignUpStepperModal = () => {
    setSignUpStepperModal(false);
  };
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="sign-up-modal-container"
      >
        <ProgressBar now={getProgress()} />
        <div className="sign-in-modal">
          <Modal.Header className="border-0 pb-0">
            <div className="d-flex flex-column gap-1 title">
              <Modal.Title>
                {step === 1
                  ? `${t("Sign in to the")} ${meeting?.type || ""}: ${
                      meeting?.title || ""
                    }`
                  : `${t("Register to the")} ${meeting?.type || ""}: ${
                      meeting?.title || ""
                    }`}
              </Modal.Title>
            </div>
          </Modal.Header>
          <Modal.Body className="mt-0 pt-0">
            <Form>
              {step === 1 && (
                <>
                  <Form.Group controlId="formEmail">
                    <Form.Label>
                      Email{" "}
                      <span style={{ color: "red", fontSize: "15px" }}>*</span>
                    </Form.Label>
                    {/* <div className="input-with-icon"> */}
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      // onBlur={handleBlur}
                      // onKeyDown={handleKeyDown}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="input-with-icon">
                      <Form.Control
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      {/* <MdLock className="input-icon" /> */}
                    </div>
                  </Form.Group>
                </>
              )}

              {step === 2 && (
                <>
                  <Form.Group controlId="formEmail">
                    <Form.Label>
                      Email{" "}
                      <span style={{ color: "red", fontSize: "15px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>
                      {t("meeting.formState.firstName")}{" "}
                      <span style={{ color: "red", fontSize: "15px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={disabled}
                    />
                  </Form.Group>
                  <Form.Group controlId="formLastName">
                    <Form.Label>
                      {t("meeting.formState.lastName")}{" "}
                      <span style={{ color: "red", fontSize: "15px" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={disabled}
                    />
                  </Form.Group>
                  <Form.Group controlId="formPost">
                    <Form.Label>{t("meeting.formState.post")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      disabled={disabled}
                    />
                  </Form.Group>
                  <Form.Group controlId="formContribution">
                    <Form.Label>
                      {t(
                        "meeting.formState.What will make this moment a success for you"
                      )}
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      // placeholder="Contribution"
                      style={{ resize: "none" }}
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                    />
                  </Form.Group>

                  {/* Add Checkbox Field */}
                  <Form.Group controlId="formCheck" className="mt-2">
                    <Form.Check
                      type="checkbox"
                      // label={t(
                      //   "meeting.formState.I agree to the terms and conditions"
                      // )}
                      label={
                        <>
                          {t(
                            "meeting.formState.I agree to the terms and conditions"
                          )}{" "}
                          <a
                            href="/newsletter/terms-and-conditions"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("meeting.formState.Click here")}
                          </a>
                        </>
                      }
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      required
                    />
                  </Form.Group>
                </>
              )}

              <div className="d-flex justify-content-between mt-3 gap-4">
                {step < 2 ? (
                  <Button
                    variant="primary"
                    className="w-100 sign-in-submit-btn"
                    onClick={(e) => handleNext(e)}
                  >
                    Continue
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 sign-in-submit-btn"
                      onClick={(e) => handleRegister(e)}
                      disabled={loading}
                    >
                      {t("Register")}
                    </Button>

                    <Button
                      variant="primary"
                      className="w-100 sign-in-submit-btn"
                      style={{
                        background: "#ffffff",
                        color: "#0037ff",
                        border: "1px solid blue",
                      }}
                      onClick={handleClose}
                    >
                      {t("meeting.formState.Cancel")}
                    </Button>
                  </>
                )}
              </div>
            </Form>
          </Modal.Body>
          {step === 1 && (
            <Modal.Footer className="justify-content-start">
              <span>
                Not a member?{" "}
                <Link
                  className="sign-up-link"
                  onClick={handleShowSignUpStepperModal}
                >
                  Sign up
                </Link>
              </span>
            </Modal.Footer>
          )}
          {/* <Modal.Footer className="justify-content-start">
          <span>
            Already a member?{" "}
            <Link className="sign-up-link" onClick={handleShowSignIn}>
              Sign in
            </Link>
          </span>
        </Modal.Footer> */}
        </div>
      </Modal>

      <StepperSignUpModal
        show={signUpStepperModal}
        handleClose={handleCloseSignUpStepperModal}
        meetingId={meeting?.id}
        meeting={meeting}
      />
    </>
  );
};

export default StepperModal;
