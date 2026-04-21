import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Button, Modal, Form, ProgressBar, Row, Col } from "react-bootstrap";
import "./SignIn.scss";
import { Link, useParams } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa6";
import { MdLock } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";

const StepperSignUpModal = ({
  show,
  handleClose,
  handleShowSignIn,
  meetingId,
  meeting,
  setIsLoggedIn,
  refreshData,
  user,
  calendlyData,
}) => {
  const [t] = useTranslation("global");
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [post, setPost] = useState("");
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState("");
  const [agree, setAgree] = useState("");
  const [loading, setLoading] = useState(false);
  const toggleMode = () => setIsLogin((prev) => !prev);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (user) {
      setEmail(user?.email);
      setFirstName(user?.name);
      setLastName(user?.last_name);
      setPost(user?.post);
      setUserId(user?.id);
      setClient(user?.enterprise?.name);
    }
  }, [user]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSignUp = async (e) => {
    e.preventDefault();

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
    setLoading(true);

    const formData = {
      email,
      name: firstName,
      last_name: lastName,
      post: post,
      client: client,
      role_id: 5,
      user_id: Number(userId),
      meeting_id: Number(meetingId),
      ...(meeting?.type === "Calendly" && calendlyData ? {
        selected_date: calendlyData.selected_date,
        selected_time: calendlyData.selected_time
      } : {})
    };
    try {
      // setLoading(true);
      const endpoint = (meeting?.type === "Calendly")
        ? `${API_BASE_URL}/create-calendly-meeting`
        : `${API_BASE_URL}/create-sub-user`;

      const response = await axios.post(
        endpoint,
        formData
      );
      if (response.status === 201 || response.status === 200) {
        toast.success(t("registered successfully"));
        handleClose();
        refreshData();
        // handleShowSignIn();
      } else {
        toast.error(t("Failed to register. Please try again."));
      }
      setLoading(false);
    } catch (error) {
      toast.error(t(error?.response?.data?.error));
      setLoading(false);
      // toast.error(t(`time_unit.${error?.response?.data?.message}`));
    }
  };
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("Email is required"));
      return;
    }
    if (!isValidEmail(email)) {
      toast.error(t("Please enter a valid email address"));
      return;
    }

    const formData = {
      email,
      password: password,
    };
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/`, formData);
      if (response.status === 200 || response.status === 201) {
        setIsLogin((prev) => !prev);
        const { name, last_name, post, email, user_needs,role,role_id,id,enterprise,enterprise_id } = response?.data?.user;
        setFirstName(name);
        setLastName(last_name);
        setPost(post);
        setEmail(email);
        setIsLoggedIn(true);
        const userData = { id, name, email, enterprise, role,role_id,user_needs,enterprise_id };
        CookieService.set("user", JSON.stringify(userData));
        // setDisabled(false);
        // handleClose();
      }
    } catch (error) {
      console.log("error", error);
      setIsLoggedIn(false);

      // toast.error(t(`time_unit.${error?.response?.data?.message}`));
    } finally {
      setLoading(false);
    }
  };

  const [disabled, setDisabled] = useState(false);
  const handleApiCall = async () => {
    setDisabled(true);
    try {
      // Make the API call using axios
      const response = await axios.post(`${API_BASE_URL}/check-email`, {
        email: email,
      });

      // Check if the message is "Email exists in the database."
      if (response.data.message === "Email exists in the database.") {
        const { name, last_name, post } = response?.data?.data;
        setFirstName(name);
        setLastName(last_name);
        setPost(post);
        setEmail(email);
        setDisabled(false);
      } else {
        console.log(
          "Email does not exist in the database or message is different."
        );
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error during API call:", error);
    } finally {
      setDisabled(false);
    }
  };

  // Handle blur event (when the input loses focus)
  const handleBlur = () => {
    handleApiCall();
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApiCall();
    }
  };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="sign-up-modal-container"
      size="lg"
    >
      <div className="sign-in-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="d-flex flex-column gap-1 title">
            <Modal.Title>
              {isLogin
                ? `Sign In for ${meeting?.type || ""}: ${meeting?.title || ""}`
                : `Register for ${meeting?.type || ""}: ${meeting?.title || ""
                }`}
            </Modal.Title>
            {!user &&
              (isLogin ? (
                <span>
                  Don't have an account?{" "}
                  <Link className="sign-toggle" onClick={toggleMode}>
                    Register
                  </Link>
                </span>
              ) : (
                <span>
                  Already a member?{" "}
                  <Link className="sign-toggle" onClick={toggleMode}>
                    Sign in
                  </Link>
                </span>
              ))}
          </div>
        </Modal.Header>
        <Modal.Body className="mt-3 pt-0">
          {isLogin ? (
            <Form>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              {/* <Button variant="primary" type="submit" className="w-100">
                Login
              </Button> */}
              <div className="d-flex justify-content-between mt-3 gap-4">
                <Button
                  variant="primary"
                  type="submit"
                  className="sign-in-submit-btn"
                  onClick={(e) => handleSignIn(e)}
                  disabled={loading}
                >
                  {t("Login")}
                </Button>
              </div>
            </Form>
          ) : (
            <Form>
              <Row>
                <Col>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>
                      First Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={meeting?.type !== "Calendly"}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formLastName">
                    <Form.Label>
                      Last Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={meeting?.type !== "Calendly"}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
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
                                            disabled={meeting?.type !== "Calendly"}


                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formPost">
                    <Form.Label>{t("meeting.formState.post")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                                            disabled={meeting?.type !== "Calendly"}


                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group controlId="formClient">
                    <Form.Label>{t("Organization")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                                          disabled={meeting?.type !== "Calendly"}


                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group controlId="formContribution">
                    <Form.Label>
                      {t("meeting.formState.What do you expect from")}:{" "}
                      {t(`types.${meeting?.type}`)}
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
                </Col>
              </Row>

              {meeting?.type !== "Calendly" && <p className="text-left text-muted small mt-3">
                By selecting <strong>Register</strong>, I agree to the {" "}
                <a href="/terms&conditions" className="text-primary"

                  target="_blank"
                  rel="noopener noreferrer">

                  Tektime Terms of Service
                </a>
                .
              </p>}

              <div className="d-flex justify-content-between mt-3 gap-4">
                <Button
                  variant="primary"
                  type="submit"
                  className="sign-in-submit-btn"
                  onClick={(e) => {
                    handleSignUp(e);
                  }}
                  disabled={loading}
                >
                  {meeting?.type === "Calendly" ? "Submit" : t("Register")}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default StepperSignUpModal;
