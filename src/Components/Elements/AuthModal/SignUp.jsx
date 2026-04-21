import CookieService from '../../Utils/CookieService';
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

const SignUp = ({ show, handleClose, handleShowSignIn, meetingId,refreshData,meeting }) => {
  const [t] = useTranslation("global");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [post, setPost] = useState("");
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState("");
  const [agree, setAgree] = useState("");
  const [loading, setLoading] = useState(false);

  
  // const handleNext = async(e) => {
  //   e.preventDefault();
  //   if (step === 1 && (!email || !password)) {
  //     toast.error("Please fill in all required fields.");
  //     return;
  //   }
  //   if (step === 1 && !/\S+@\S+\.\S+/.test(email)) {
  //     toast.error("Please enter a valid email address.");
  //     return;
  //   }
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/check-email`,{email:email})
  //   } catch (error) {
  //     console.log('error',error)
  //   }
  //   setStep(step + 1);
  //   // if (step < 2) {
  //   //   setStep(step + 1);
  //   // }
  // };
  // const getProgress = () => {
  //   return (step / 2) * 100;
  // };

  useEffect(() => {
    if (show) {
      // setStep(1);
      setEmail("");
      // setPassword("");
      setFirstName("");
      setLastName("");
      setPost("");
      setMsg("");
      setAgree("");
      setClient(null)
    }
  }, [show]);

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
    setLoading(false);
    return;
  }

  // Validate checkbox
  if (!agree) {
    toast.error(t("You must agree to the terms and conditions"));
    setLoading(false);
    return;
  }
  setLoading(true);

  const formData = {
    ...meeting,
    participants: [{
      email,
      first_name: firstName,
      last_name: lastName,
      post: post,
      client: client || null,
      client_id:null,
      contribution: msg,
      agree: agree,
      meeting_id:Number(meetingId)
    }],
    _method:"PUT",
  };
  
  console.log("formData", formData);
  try {
    const response = await axios.post(`${API_BASE_URL}/subscribe-to-newsletter/${meetingId}`, formData,{headers:{Authorization: `Bearer ${CookieService.get("token")}`}});
    console.log("response", response);
    if (response.status === 201 || response.status === 200) {
      toast.success(t("subscribed successfully"));
      handleClose();
      refreshData()
    } else {
      toast.error(t("Failed to subscribe. Please try again."));
    }
    setLoading(false);
  } catch (error) {
    console.log("error", error);
    toast.error(error?.response?.data?.message);
    setLoading(false);
  }
   setEmail("");
      // setPassword("");
      setFirstName("");
      setLastName("");
      setPost("");
      setMsg("");
      setAgree("");
      setClient(null)
};
  const [disabled,setDisabled] = useState(false)
  const handleApiCall = async () => {
    setDisabled(true)
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
        setDisabled(false)
      } else {
        console.log(
          "Email does not exist in the database or message is different."
        );
      }
    } catch (error) {
      // Handle any errors that occur during the API call
      console.error("Error during API call:", error);
    }finally{
    setDisabled(false)

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
    >
      {/* <ProgressBar now={getProgress()} /> */}
      <div className="sign-in-modal" style={{padding:'30px 21px'}}>
        <Modal.Header className="border-0 pb-0">
          <div className="d-flex flex-column gap-1 title">
            <Modal.Title>{t("Subscribe to our Newsletter")}</Modal.Title>
            {/* <small className="subtitle">
              {t(
                "Abonnez-vous maintenant et commencez à gérer toutes vos réunions en un seul endroit pratique"
              )}
            </small> */}
          </div>
        </Modal.Header>
        <Modal.Body className="mt-0 pt-0">
          <Form>
            {/* {step === 1 && (
              <>
               

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
                    <MdLock className="input-icon" />
                  </div>
                </Form.Group>
              </>
            )} */}

            {/* {step === 2 && ( */}
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
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
                {/* <FaEnvelope className="input-icon" /> */}
                {/* </div> */}
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
              <Form.Group controlId="formClient">
                <Form.Label>{t("Organization")}</Form.Label>
                <Form.Control
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}

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
            {/* )} */}

            <div className="d-flex justify-content-between mt-3 gap-4">
              {/* {step < 2 ? (
                <Button
                  variant="primary"
                  className="w-100 sign-in-submit-btn"
                  onClick={(e) => handleNext(e)}
                >
                  Continue
                </Button>
              ) : ( */}
              <Button
                variant="primary"
                type="submit"
                className="w-100 sign-in-submit-btn"
                onClick={(e) => handleSignUp(e)}
                disabled={loading}
              >
                {t("Subscribe")}
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

              {/* )} */}
            </div>
          </Form>
        </Modal.Body>
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
  );
};

export default SignUp;
