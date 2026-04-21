import CookieService from "../Utils/CookieService";
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  ProgressBar,
  Breadcrumb,
  Alert,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import { FaCalendarCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../Apicongfig";
// import { getFcmToken } from "../../firebase";
import { useHeaderTitle } from "../../context/HeaderTitleContext";
import { toast } from "react-toastify";
import { getFcmToken } from "../../firebase";

const RegisterBtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { referral_id } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const user_id = queryParams.get("user_id");
  const plan_id = queryParams.get("contract_id");

  // const [step, setStep] = useState(1);

  // Start from step 2 if user_id exists
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profile: "",
    needs: [],
    first_name: "",
    last_name: "",
    email: "",
    enterprise: "",
    password: "",
    confirmPassword: "", // Add confirmPassword field

    acceptTerms: true,
    job: "",
  });

  // State to hold referral data
  const [referralData, setReferralData] = useState({
    referred_by: null,
    is_referral: false,
  });

  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [passwordError, setPasswordError] = useState(""); // State for password validation e

  // Add password validation effect
  useEffect(() => {
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setPasswordError("Les mots de passe ne correspondent pas");
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);
  useEffect(() => {
    // console.log("Referral ID from params:", referral_id); // Debug log

    // Check for referral ID in both params and location state
    const queryParams = new URLSearchParams(location.search);
    const refParam = queryParams.get("ref");

    // Get from location state if available (passed from ReferralRedirect)
    const stateRef = location.state?.referral_id;

    const finalRef = referral_id || refParam || stateRef;

    if (finalRef && finalRef !== "undefined") {
      setReferralData({
        referred_by: finalRef,
        is_referral: true,
      });
      // toast.info("Special referral benefits applied!");
    }
  }, [location, referral_id]);

  useEffect(() => {
    if (user_id) {
      axios
        .get(`${API_BASE_URL}/get-public-user/${user_id}`)
        .then((res) => {
          const user = res.data?.data;

          // Set the formData using fetched user info
          setFormData((prev) => ({
            ...prev,
            first_name: user.name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            enterprise: user.enterprise?.name || "",
            profile: user.profile || "",
            job: user.job || "",
            needs: user.needs || [],
            acceptTerms: true, // Assuming this should be checked
            password: "", // Keep empty for security
          }));
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          toast.error(
            "Erreur lors du chargement des données de l'utilisateur.",
          );
        });
    }
  }, [user_id]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNeedsChange = (e) => {
    const { value, checked } = e.target;
    let needs = [...formData.needs];

    if (checked) {
      needs.push(value);
    } else {
      needs = needs.filter((item) => item !== value);
    }

    setFormData((prev) => ({
      ...prev,
      needs,
    }));
  };

  const nextStep = () => {
    // If we're on step 3 (password step), validate passwords match before proceeding
    if (step === 3 && formData.password !== formData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return; // Don't proceed to next step
    }
    setStep(step + 1);
  };
  const prevStep = () => setStep(step - 1);

  // Mapping from French display values to English database values
  const profileMap = {
    freelance: "freelance",
    agency: "agency",
    team: "project_team",
    tester: "tester",
  };

  const needsMap = {
    "Je veux gérer mes clients, mes collaborateurs ou mon équipe facilement":
      "casting_need",
    "Je veux planifier mes projets, suivre les budgets et garder le cap sur mes deadlines":
      "mission_need",
    "Je veux centraliser mes réunions, les préparer, et garder une trace automatique":
      "meeting_need",
    "Je veux mieux suivre les tâches, la charge de travail et les priorités":
      "action_need",
    "Je veux faire quelque chose sans repartir de zéro, grâce aux modèles et templates adaptés":
      "solution_need",
  };
  const roleMap = {
    "Chef de projet / Product Owner": "Project Manager / Product Owner",
    "Chargé de relation client / Commercial":
      "Customer Relations Officer / Sales Representative",
    "Manager / Responsable d'équipe": "Manager / Team Leader",
    "Développeur / Contributeur opérationnel":
      "Developer / Operational Contributor",
    "Formateur / Coach": "Trainer / Coach",
    "Consultant / Freelance": "Consultant / Freelance",
    "Autre / Explorateur": "Other / Explorer",
  };

  const { setUser } = useHeaderTitle();

  function checkTokenExpiration() {
    const tokenExpirationTime = CookieService.get("token_expiration_time");

    if (!tokenExpirationTime) return;

    const currentTime = Date.now();
    if (currentTime > tokenExpirationTime) {
      console.log("Access token expired. Refreshing...");
      refreshAccessToken(); // Call the function to refresh the access token
    } else {
      console.log("Token is still valid.");
    }
  }
  function refreshAccessToken() {
    const refreshToken = CookieService.get("refresh_token");

    if (!refreshToken) {
      console.error("No refresh token available");
      return;
    }
    const userid = CookieService.get("user_id");

    axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {
          // refresh_token: refreshToken,
          user_id: userid,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        if (response) {
          const newAccessToken = response.data?.access_token;
          const newExpiresIn = response.data?.expires_in; // e.g., 3598 seconds

          // Update the stored tokens and expiration time
          CookieService.set("access_token", newAccessToken);
          sessionStorage.setItem("access_token", newAccessToken);

          const newExpirationTime = Date.now() + newExpiresIn * 1000;
          CookieService.set("token_expiration_time", newExpirationTime);
          sessionStorage.setItem("token_expiration_time", newExpirationTime);

          // Set a new timeout to refresh the access token again
          setTimeout(refreshAccessToken, (newExpiresIn - 60) * 1000); // Refresh 1 minute before expiration
        }
      })
      .catch((error) => {
        console.error("Refresh API Error:", error);
        // Optionally handle token refresh errors (e.g., log out user)
        // If the refresh token is invalid (e.g., 401 Unauthorized), handle re-authentication
        // if (error.response && error.response.status === 401) {
        console.error(
          "Refresh token is invalid or expired. Redirecting to login.",
        );
        handleInvalidToken();
        // }
      });
  }
  function handleInvalidToken() {
    CookieService.remove("access_token");
    sessionStorage.removeItem("access_token");

    CookieService.remove("refresh_token");
    sessionStorage.removeItem("refresh_token");

    CookieService.remove("token_expiration_time");
    sessionStorage.removeItem("token_expiration_time");
  }
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user's timezone and format the current time
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date();
      const formattedLoginTime = currentTime.toLocaleString("en-GB", {
        timeZone: userTimeZone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      // requestNotificationPermission
      // Get FCM token - handle potential null value
      let fcmToken = null;
      try {
        console.log("Attempting to get FCM token...");
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("FCM token retrieval timed out")),
            5000,
          ),
        );
        fcmToken = await Promise.race([getFcmToken(), timeoutPromise]);
        console.log("FCM token result:", fcmToken || "null");
        if (!fcmToken) {
          console.warn(
            "Could not get FCM token - proceeding without push notifications",
          );
        }
      } catch (fcmError) {
        console.error("FCM token error:", fcmError);
      }
      const registrationData = {
        ...formData,
        profile: profileMap[formData.profile] || formData.profile,
        needs: formData.needs.map((need) => needsMap[need] || need),
        job: roleMap[formData.job] || formData.job,
        last_connection: formattedLoginTime,
        fcm_token: fcmToken,
        ...(referralData.is_referral && {
          referral_by: referralData.referred_by,
        }),
        ...(user_id && { user_id }), // Include user_id if available
        ...(plan_id && { plan_id: Number(plan_id) }), // Include plan_id if available
      };

      const response = await axios.post(
        `${API_BASE_URL}/register-user`,
        registrationData,
      );

      if (response.status === 201) {
        const token = response?.data?.token;
        const user = response?.data?.user;
        const { id, name, email, enterprise, role,role_id,user_needs,enterprise_id } =user;
        const userData = { id, name, email, enterprise, role,role_id,user_needs,enterprise_id };

        const accessToken = user?.access_token;
        const refreshToken = user?.refresh_token;
        const tokenExpirationTime = user?.token_expiration_time;
        CookieService.set("token", token);
        CookieService.set("user_id", id);
        CookieService.set("user", userData);
        CookieService.set("email", email);
        CookieService.set("name", name);
        CookieService.set("type", user?.role.name);
        CookieService.set("role", user?.role);

        // Handle access_token
        if (accessToken && accessToken !== "null") {
          CookieService.set("access_token", accessToken);
          sessionStorage.setItem("access_token", accessToken);
        } else {
          sessionStorage.removeItem("access_token");
          CookieService.remove("access_token");
        }

        // Handle refresh_token
        if (refreshToken && refreshToken !== "null") {
          CookieService.set("refresh_token", refreshToken);
          sessionStorage.setItem("refresh_token", refreshToken);
        } else {
          CookieService.remove("refresh_token");
          sessionStorage.removeItem("refresh_token");
        }

        // Handle token_expiration_time
        if (tokenExpirationTime && tokenExpirationTime !== "null") {
          CookieService.set("token_expiration_time", tokenExpirationTime);
          sessionStorage.setItem("token_expiration_time", tokenExpirationTime);
        } else {
          CookieService.remove("token_expiration_time");
          sessionStorage.removeItem("token_expiration_time");
        }

        // checkTokenExpiration(); // Check token expiration and refresh if needed
        const expiresIn = tokenExpirationTime - Date.now();
        if (expiresIn > 0) {
          setTimeout(refreshAccessToken, expiresIn - 60000); // Refresh 1 minute before expiration
        }
        setUser(user);
        navigate("/meeting");
        // setSuccess(true);
        // You can redirect or show success message
      }
    } catch (err) {
      console.log("Registration error:", err); // Fixed variable name
      if (err.response) {
        // Handle server validation errors
        if (err.response.status === 422 && err.response.data.errors) {
          const serverErrors = err.response.data.errors;
          Object.entries(serverErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              // Add array check
              messages.forEach((message) => {
                toast.error(`${field}: ${message}`);
              });
            }
          });
        } else {
          const errorMessage =
            err.response.data.message ||
            "An error occurred during registration. Please try again.";
          toast.error(errorMessage);
        }
      } else if (err.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Registration error details:", err); // More detailed logging
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProfileOptions = () => (
    <Row className="g-3 mb-4">
      {[
        { emoji: "👤", title: "Freelance", value: "freelance" },
        { emoji: "🏢", title: "Agence", value: "agency" },
        { emoji: "👥", title: "Équipe projet", value: "team" },
        { emoji: "🔍", title: "Je veux juste tester", value: "tester" },
      ].map((profile, index) => (
        <Col md={6} key={index}>
          <Card
            className={`h-100 profile-card ${
              formData.profile === profile.value ? "selected" : ""
            }`}
            onClick={() => setFormData({ ...formData, profile: profile.value })}
          >
            <Card.Body className="text-center p-4">
              <div className="emoji-display mb-3">{profile.emoji}</div>
              <Card.Title className="fw-semibold">{profile.title}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderNeedsOptions = () => (
    <div className="needs-grid mb-4">
      {[
        {
          icon: "👥",
          text: "Je veux gérer mes clients, mes collaborateurs ou mon équipe facilement",
        },
        {
          icon: "📅",
          text: "Je veux planifier mes projets, suivre les budgets et garder le cap sur mes deadlines",
        },
        {
          icon: "📅",
          text: "Je veux centraliser mes réunions, les préparer, et garder une trace automatique",
        },
        {
          icon: "✅",
          text: "Je veux mieux suivre les tâches, la charge de travail et les priorités",
        },
        {
          icon: "✅",
          text: "Je veux faire quelque chose sans repartir de zéro, grâce aux modèles et templates adaptés",
        },
      ].map((need, index) => (
        <div
          key={index}
          className={`need-item ${
            formData.needs.includes(need.text) ? "selected" : ""
          }`}
          onClick={() => {
            const event = {
              target: {
                value: need.text,
                checked: !formData.needs.includes(need.text),
              },
            };
            handleNeedsChange(event);
          }}
        >
          <span className="need-icon">{need.icon}</span>
          <span className="need-text">{need.text}</span>
          <div className="checkmark"></div>
        </div>
      ))}
    </div>
  );

  const renderRoleOptions = () => (
    <div className="role-options mb-4">
      {[
        {
          emoji: "🧠",
          title: "Chef de projet / Product Owner",
          desc: "Je planifie, j’organise, je pilote.",
        },
        {
          emoji: "💼",
          title: "Chargé de relation client / Commercial",
          desc: "Je gère les clients, je prépare les rendez-vous, je suis les actions et je m’assure que tout avance côté client comme en interne.",
        },
        {
          emoji: "🎯",
          title: "Manager / Responsable d'équipe",
          desc: "Je supervise les personnes, les objectifs, les résultats.",
        },
        {
          emoji: "💻",
          title: "Développeur / Contributeur opérationnel",
          desc: "Je veux de la clarté sur mes tâches, mon temps, mes priorités.",
        },
        {
          emoji: "🎓",
          title: "Formateur / Coach",
          desc: "J’organise des sessions, je produis du contenu, je suis des participants.",
        },
        {
          emoji: "🛠️",
          title: "Consultant / Freelance",
          desc: "Je facture mon temps, j’enchaîne les missions, je veux aller à l’essentiel.",
        },
        {
          emoji: "🧪",
          title: "Autre / Explorateur",
          desc: "Je teste pour comprendre ce que TekTIME peut m’apporter.",
        },
      ].map((role, index) => (
        <div
          key={index}
          className={`role-card ${
            formData.job === role.title ? "selected" : ""
          }`}
          onClick={() => setFormData({ ...formData, job: role.title })}
        >
          <div className="role-emoji">{role.emoji}</div>
          <div className="role-content">
            <h5>{role.title}</h5>
            <p>{role.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const getPersonalizedPromise = () => {
    switch (formData.profile) {
      case "freelance":
        return (
          <div className="promise-card">
            <p className="promise-intro">
              👉 En tant que freelance, TekTIME vous aide à :
            </p>
            <ul className="promise-list">
              <li>Suivre vos activités à la minute près</li>
              <li>Générer vos factures automatiquement</li>
              <li>Gagner du temps, et donc… des heures facturées</li>
            </ul>
            <div className="social-proof">
              <span className="badge">
                🕓 +30% d'heures facturées en moyenne dès le premier mois
              </span>
            </div>
          </div>
        );
      case "agency":
        return (
          <div className="promise-card">
            <p className="promise-intro">
              👉 En tant qu'agence, TekTIME vous aide à :
            </p>
            <ul className="promise-list">
              <li>Suivre précisément la charge et les budgets par client</li>
              <li>Automatiser les comptes rendus et les suivis de mission</li>
              <li>
                Avoir une vue instantanée sur l'avancement et la rentabilité
              </li>
            </ul>
            <div className="social-proof">
              <span className="quote">
                "Les agences gagnent 12h par semaine et récupèrent jusqu'à 20%
                de budget non facturé."
              </span>
            </div>
          </div>
        );
      case "team":
        return (
          <div className="promise-card">
            <p className="promise-intro">
              👉 En tant qu'équipe projet, TekTIME vous permet de :
            </p>
            <ul className="promise-list">
              <li>Synchroniser les tâches, les réunions et les décisions</li>
              <li>Anticiper les risques de surcharge ou de retard</li>
              <li>Aligner tout le monde sur les priorités en temps réel</li>
            </ul>
            <div className="social-proof">
              <span className="quote">
                "Réduction de 35% des dérapages de planning dès le premier
                mois."
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="promise-card">
            <p className="promise-intro">
              👉 TekTIME vous permet d'explorer toutes les fonctionnalités :
            </p>
            <ul className="promise-list">
              <li>Découvrir les modules adaptés à vos besoins</li>
              <li>Tester sans engagement</li>
              <li>Personnaliser votre expérience ultérieurement</li>
            </ul>
          </div>
        );
    }
  };

  if (success) {
    return (
      <Container className="py-5 text-center">
        <Card className="p-5">
          <Card.Body>
            <h1 className="text-success mb-4">Inscription réussie!</h1>
            <p className="lead">Votre compte a été créé avec succès.</p>
            <p>
              Nous vous avons envoyé un email de confirmation à {formData.email}
              .
            </p>
            <Button as={Link} to="/" variant="primary" className="mt-4">
              Se connecter
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="register-wrapper mt-5 pt-5">
      <Container className="py-5">
        {/* <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Accueil
          </Breadcrumb.Item>
        </Breadcrumb> */}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="register-card">
              <Card.Body className="p-4 p-md-5">
                <div className="form-header mb-4">
                  <ProgressBar
                    now={(step / 3) * 100}
                    className="form-progress"
                  />
                  <div className="step-indicator">Étape {step} sur 3</div>
                </div>

                {step === 1 && (
                  <div className="step-content">
                    <h1 className="form-title">
                      BTP : Ne perdez plus de temps avec les comptes-rendus
                      manuels
                    </h1>

                    <div className="form-section text-center mb-4">
                      <p className="">
                        Avec TekTIME, vos réunions et chantiers génèrent
                        automatiquement des prises de notes et des
                        comptes-rendus fiables, centralisés et disponibles en
                        temps réel.
                      </p>
                    </div>

                    <div className="form-actions text-center justify-content-center mb-3">
                      <Button className="next-btn" onClick={nextStep}>
                        <span>Commencer l'aventure TekTIME</span>
                        <span className="btn-subtext">
                          Personnalisez votre expérience en 2 minutes
                        </span>
                      </Button>
                    </div>
                    <div className="form-section">
                      <h4 className="section-title">🚧 Les défis du BTP</h4>
                      <div className="needs-grid mb-4">
                        {[
                          "Manque de suivi précis des réunions de chantier : les décisions prises sont souvent perdues ou mal retranscrites.",
                          "Comptes rendus chronophages : les conducteurs de travaux passent des heures à rédiger, au détriment du suivi terrain.",
                          "Communication éclatée entre maître d'ouvrage, architectes, sous-traitants et équipes.",
                          "Retards et litiges fréquents dus au manque de traçabilité des échanges.",
                        ].map((item, index) => (
                          <div key={index} className="need-item">
                            <span className="need-text">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">
                        💡 La solution TekTIME pour le BTP
                      </h4>
                      <p className="mb-4">
                        TekTIME automatise vos prises de notes et génère des
                        comptes-rendus clairs après chaque réunion ou suivi de
                        chantier. Centralisé et simple, l'outil vous libère du
                        papier et vous fait gagner du temps.
                      </p>

                      <div className="needs-grid mb-4">
                        {[
                          {
                            icon: "🤖",
                            title: "Automatisation",
                            text: "Les réunions sont enregistrées et transcrites automatiquement",
                          },
                          {
                            icon: "📊",
                            title: "Centralisation",
                            text: "Toutes les informations disponibles en un seul endroit",
                          },
                          {
                            icon: "✅",
                            title: "Fiabilité",
                            text: "Historique complet et traçabilité garantie",
                          },
                        ].map((item, index) => (
                          <div key={index} className="need-item">
                            <span className="need-text">
                              {item.icon} {item.title} : {item.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-light p-3 rounded mb-4">
                        <h6 className="mb-2">
                          Les comptes rendus sont générés instantanément avec :
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-primary text-white">
                            Les décisions
                          </span>
                          <span className="badge bg-primary text-white">
                            Les tâches attribuées
                          </span>
                          <span className="badge bg-primary text-white">
                            Les délais
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">🏗️ Cas d'usage BTP</h4>
                      <Row className="g-3 mb-4">
                        {[
                          "Réunion de chantier hebdomadaire : compte rendu structuré généré automatiquement",
                          "Coordination multi-acteurs : suivi des responsabilités de chaque entreprise",
                          "Pilotage des retards : actions en retard et impact sur le planning global",
                          "Suivi client : reporting clair et fiable accessible au maître d'ouvrage",
                        ].map((item, index) => (
                          <Col md={6} key={index}>
                            <Card className="h-100 border-0 bg-light">
                              <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                  <span className="me-2">•</span>
                                  <span>{item}</span>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">
                        ⭐ Pourquoi TekTIME est unique pour le BTP
                      </h4>
                      <div className="needs-grid mb-4">
                        {[
                          "Zéro perte d'information : tout est capté, transcrit et structuré automatiquement",
                          "Gains de temps : jusqu'à 3h économisées par semaine pour un conducteur de travaux",
                          "Réduction des litiges : traçabilité des décisions, preuves documentées",
                          "Collaboration simplifiée : un seul espace partagé avec filtres par chantier, équipe, ou lot",
                          "Adapté au terrain : interface simple, accessible depuis smartphone ou tablette sur chantier",
                        ].map((item, index) => (
                          <div key={index} className="need-item">
                            <span className="need-text">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">🔧 Comment ça marche</h4>
                      <div className="needs-grid mb-4">
                        {[
                          {
                            icon: "📲",
                            title: "Étape 1",
                            text: "Enregistrez votre réunion ou visite de chantier",
                          },
                          {
                            icon: "🤖",
                            title: "Étape 2",
                            text: "TekTIME transforme l'audio en notes structurées",
                          },
                          {
                            icon: "📑",
                            title: "Étape 3",
                            text: "Vous recevez automatiquement un compte-rendu clair et partagé",
                          },
                        ].map((item, index) => (
                          <div key={index} className="need-item">
                            <span className="need-text">
                              {item.icon} {item.title} : {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-actions text-center">
                      <Button className="next-btn" onClick={nextStep}>
                        <span>Commencer l'aventure TekTIME</span>
                        <span className="btn-subtext">
                          Personnalisez votre expérience en 2 minutes
                        </span>
                      </Button>
                    </div>

                    <div className="text-center mt-4 small text-muted">
                      <p>
                        Nous sommes à votre disposition 24/7/365 -
                        <a
                          href="https://tektime.fr"
                          className="text-decoration-none ms-1"
                        >
                          tektime.fr
                        </a>{" "}
                        -
                        <a
                          href="mailto:fondateur@tektime.fr"
                          className="text-decoration-none ms-1"
                        >
                          fondateur@tektime.fr
                        </a>{" "}
                        -
                        <a
                          href="https://www.instagram.com/tektime.io/"
                          className="text-decoration-none ms-1"
                        >
                          Instagram
                        </a>
                      </p>
                    </div>
                  </div>
                )}
                {/* {step === 2 && (
                  <div className="step-content">
                    <h1 className="form-title">
                      Automatisez votre organisation.
                    </h1>
                    <p className="form-subtitle">
                      TekTIME est votre assistant personnel pour gérer vos
                      projets, vos réunions et vos temps facturables sans charge
                      mentale.
                    </p>

                    <div className="form-section">
                      <h4 className="section-title">
                        Qui êtes-vous ?{" "}
                        <span className="subtext">
                          (pour personnaliser l'expérience)
                        </span>
                      </h4>
                      {renderProfileOptions()}
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">
                        Que souhaitez-vous ?{" "}
                        <span className="subtext">(choix multiples)</span>
                      </h4>
                      {renderNeedsOptions()}
                    </div>

                    <div className="form-actions">
                      <Button
                        className="next-btn"
                        onClick={nextStep}
                        disabled={!formData.profile}
                      >
                        <span>Suivant</span>
                        <span className="btn-subtext">
                          Personnalisez votre expérience en 2 minutes
                        </span>
                      </Button>
                    </div>
                  </div>
                )} */}

                {step === 3 && (
                  <div className="step-content">
                    <h1 className="form-title">
                      Un outil. Zéro charge mentale. Une organisation qui
                      rapporte.
                    </h1>
                    {getPersonalizedPromise()}

                    <h4 className="section-title">Créez votre compte</h4>
                    <Form>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mt-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={user_id}
                        />
                      </Form.Group>

                      <Form.Group className="mt-3">
                        <Form.Label>Entreprise</Form.Label>
                        <Form.Control
                          type="text"
                          name="enterprise"
                          value={formData.enterprise}
                          onChange={handleInputChange}
                          disabled={user_id}
                        />
                      </Form.Group>

                      {/* <Form.Group className="mt-3">
                        <Form.Label>Mot de passe</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          minLength={8}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group> */}

                      <Form.Group className="mt-3">
                        <Form.Label>Mot de passe</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            minLength={8}
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />

                          <InputGroup.Text>
                            {showPassword ? (
                              <FaEyeSlash
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                              />
                            ) : (
                              <FaEye
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                              />
                            )}
                          </InputGroup.Text>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mt-3">
                        <Form.Label>Confirmer le mot de passe</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            minLength={8}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                          <InputGroup.Text>
                            {showPassword ? (
                              <FaEyeSlash
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                              />
                            ) : (
                              <FaEye
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ cursor: "pointer" }}
                              />
                            )}
                          </InputGroup.Text>
                        </InputGroup>
                        {passwordError && (
                          <Form.Text className="text-danger">
                            {passwordError}
                          </Form.Text>
                        )}
                      </Form.Group>

                      <p className="mt-3">
                        Je souhaite tester gratuitement TekTIME pendant 8 jours
                        et annuler quand je veux.
                      </p>
                    </Form>

                    <div className="form-actions mt-4">
                      {!user_id && (
                        <Button variant="outline-secondary" onClick={prevStep}>
                          Retour
                        </Button>
                      )}

                      <Button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={
                          !formData.first_name ||
                          !formData.last_name ||
                          !formData.email ||
                          !formData.enterprise ||
                          !formData.password ||
                          !formData.confirmPassword ||
                          formData.password !== formData.confirmPassword
                        }
                        // disabled={!formData.job || loading}
                      >
                        {loading ? (
                          <span>Enregistrement en cours...</span>
                        ) : (
                          <>
                            <span>Accéder à mon espace TekTIME</span>
                            <span className="btn-subtext">
                              L'aventure commence maintenant
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-content">
                    <h1 className="form-title">
                      Personnalisez TekTIME selon votre rôle
                    </h1>
                    <p className="form-subtitle">
                      TekTIME va activer les bons modules et vous suggérer les
                      bons modèles selon vos priorités.
                    </p>

                    <div className="form-section">{renderRoleOptions()}</div>

                    <div className="form-actions">
                      <Button
                        variant="outline-secondary"
                        onClick={prevStep}
                        className="back-btn"
                      >
                        Retour
                      </Button>
                      <Button
                        className="submit-btn"
                        onClick={nextStep}
                        disabled={!formData.job || loading}
                      >
                        <span>Créer mon espace TekTIME</span>
                        {/* <span className="btn-subtext">
                          Aucun moyen de paiement requis
                        </span> */}
                      </Button>
                    </div>
                    <p className="form-note">
                      (Vous pourrez tout modifier plus tard)
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterBtp;
