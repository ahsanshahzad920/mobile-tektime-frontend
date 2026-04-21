import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Tab,
  Form,
  Button,
  Card,
  Spinner,
} from "react-bootstrap";

import { FcGoogle } from "react-icons/fc";
import Select from "react-select";
import { useFormContext } from "../../../context/CreateMeetingContext";

import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { CiSettings } from "react-icons/ci";
import { getUser } from "../../Utils/MeetingFunctions";

const Settings = ({ }) => {
  const { googleFullName, visioGoogleMeet, emailGmail } = useFormContext();

  const { profileImage, setProfileImage, setUser, setCallUser } =
    useHeaderTitle();
  const navigate = useNavigate();

  const [t] = useTranslation("global");
  const [user, setUser1] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [integrationLinks, setIntegrationLinks] = useState([]);
  const [visioconferenceLinks, setVisioconferenceLinks] = useState([]);
  const [emailLinks, setEmailLinks] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [affiliationLinks, setAffilicationLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState(user?.title);
  const [loading, setLoading] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [croppedimage, setcroppedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const [visibility, setVisibility] = useState("public");
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [profile, setProfile] = useState(
    user?.image || "https://via.placeholder.com/150"
  );

  const [profileBanner, setProfileBanner] = useState(
    user?.profile_banner || null
  );
  const [videoPreview, setVideoPreview] = useState(null);

  const [activeKey, setActiveKey] = useState("settings");
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    nick_name: "",
    enterprise_id: "",
    post: "",
    email: "",
    phoneNumber: "",
    bio: "",
    team_id: [],
    needs: [],
    profile: "",
  });

  const [isLoading, setIsLoading] = useState(false);


  const getUserDataFromAPI = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      const user = response?.data?.data;
      if (user) {
        setProfileImage(user?.image)
        setUser(user);
        setUser1(user);

      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getUserDataFromAPI();
  }, []);
  const handleNeedsChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      // Initialize needs array if it doesn't exist
      const currentNeeds = Array.isArray(prev.needs) ? prev.needs : [];

      let updatedNeeds;
      if (checked) {
        // Add the need if not already present
        updatedNeeds = [...new Set([...currentNeeds, value])];
      } else {
        // Remove the need
        updatedNeeds = currentNeeds.filter((need) => need !== value);
      }

      return {
        ...prev,
        needs: updatedNeeds,
      };
    });
  };

  useEffect(() => {
    if (user) {
      setProfile(user?.image);
      setProfileBanner(user?.profile_banner);
      setcroppedImage(user?.profile_banner ? user?.profile_banner : null);
      setFormData({
        name: user?.name || "",
        last_name: user?.last_name || "",
        nick_name: user?.nick_name || "",
        enterprise_id: user?.enterprise?.id || "",
        post: user?.post || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.bio || "",
        team_id: user?.teams?.map((team) => team.id),
        needs: user?.user_needs?.map((need) => need.need),
        job: user?.job,
      });
      setTitle(user?.title);
      setSelectedTeams(
        user?.teams?.map((team) => ({
          value: team.id,
          label: team.name,
        }))
      );
    }
  }, [user]);

  const userID = parseInt(CookieService.get("user_id"));
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //Handle Save and Continue
  const handleProfile = async () => {
    try {
      setLoading(true);
      const formDataInstance = new FormData();

      // Handle profile image
      if (profile.startsWith("data:image/")) {
        const response = await fetch(profile);
        const blob = await response.blob();
        formDataInstance.append("image", blob, "profile-image.jpg");
      } else {
        formDataInstance.append("image", profile);
      }

      if (profileBanner?.startsWith("data:image/")) {
        const response = await fetch(profileBanner);
        const blob = await response.blob();
        formDataInstance.append("profile_banner", blob, "profile-banner.jpg");
      } else {
        formDataInstance.append("profile_banner", profileBanner);
      }

      // Add profile and needs data
      // formDataInstance.append("job", formData.job || "");
      // formData.needs?.forEach((need, index) => {
      //   formDataInstance.append(`needs[${index}]`, need);
      // });
      // Add profile data
      formDataInstance.append("job", formData.job || "");

      formData.needs?.forEach((need, index) => {
        formDataInstance.append(`needs[${index}]`, need);
      });

      formDataInstance.append("title", title || "");
      formDataInstance.append("name", formData.name || "");
      formDataInstance.append("last_name", formData.last_name || "");
      // formDataInstance.append("nick_name", formData.nick_name || "");
      formDataInstance.append("email", formData.email || "");
      formDataInstance.append("phoneNumber", formData.phoneNumber || "");
      formDataInstance.append("enterprise_id", formData.enterprise_id || "");
      formDataInstance.append("bio", formData.bio || "");
      formDataInstance.append("post", formData.post || "");
      formDataInstance.append("role_id", user?.role_id || "");
      formDataInstance.append("timezone", userTimeZone || "Europe/Paris");

      socialLinks.forEach((link, index) => {
        if (link.id) {
          // Existing link (include ID)
          formDataInstance.append(`social_links[${index}][id]`, link.id);
        }
        formDataInstance.append(
          `social_links[${index}][platform]`,
          link.platform
        );
        formDataInstance.append(`social_links[${index}][link]`, link.link);
      });

      integrationLinks.forEach((link, index) => {
        if (link.id) {
          // Existing link (include ID)
          formDataInstance.append(`integration_links[${index}][id]`, link.id);
        }
        formDataInstance.append(
          `integration_links[${index}][platform]`,
          link.platform
        );
        formDataInstance.append(
          `integration_links[${index}][value]`,
          googleFullName || link?.value
        );
      });

      visioconferenceLinks.forEach((link, index) => {
        if (link.id) {
          // Existing link (include ID)
          formDataInstance.append(
            `visioconference_links[${index}][id]`,
            link.id
          );
        }
        formDataInstance.append(
          `visioconference_links[${index}][platform]`,
          link.platform
        );
        formDataInstance.append(
          `visioconference_links[${index}][value]`,
          visioGoogleMeet || link?.value
        );
      });

      emailLinks.forEach((link, index) => {
        if (link.id) {
          // Existing link (include ID)
          formDataInstance.append(`email_links[${index}][id]`, link.id);
        }
        formDataInstance.append(
          `email_links[${index}][platform]`,
          link.platform
        );
        formDataInstance.append(
          `email_links[${index}][value]`,
          emailGmail || link?.value
        );
      });

      websites.forEach((site, index) => {
        if (site.id) {
          // Existing link (include ID)
          formDataInstance.append(`websites[${index}][id]`, site.id);
        }
        formDataInstance.append(`websites[${index}][title]`, site.title);
        formDataInstance.append(`websites[${index}][link]`, site.link);
      });

      affiliationLinks.forEach((site, index) => {
        if (site.id) {
          // Existing link (include ID)
          formDataInstance.append(`affiliation_links[${index}][id]`, site.id);
        }
        formDataInstance.append(
          `affiliation_links[${index}][title]`,
          site.title
        );
        formDataInstance.append(`affiliation_links[${index}][link]`, site.link);
      });

      // Handle products
      for (const [index, product] of products.entries()) {
        if (product.id) {
          formDataInstance.append(`products[${index}][id]`, product.id);
        }
        formDataInstance.append(
          `products[${index}][product_title]`,
          product.product_title
        );
        formDataInstance.append(
          `products[${index}][product_description]`,
          product.product_description
        );

        if (product?.product_image?.startsWith("data:image/")) {
          try {
            const response = await fetch(product.product_image);
            const blob = await response.blob();
            formDataInstance.append(
              `products[${index}][product_image]`,
              blob,
              "profile-image.jpg"
            );
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        } else {
          formDataInstance.append(
            `products[${index}][product_image]`,
            product.product_image || ""
          );
        }
      }

      // Handle video
      if (videoPreview?.startsWith("blob:")) {
        // If video does not exist, upload the video file
        const response = await fetch(videoPreview);
        const blob = await response.blob();
        formDataInstance.append("video", blob, "video-preview.mp4");
      } else {
        formDataInstance.append("video", videoPreview);
      }

      formDataInstance.append("current_password", currentPassword || "");
      formDataInstance.append("password", newPassword || "");
      formDataInstance.append("password_confirmation", retypePassword || "");

      formDataInstance.append("visibility", visibility || "public");
      selectedTeams.forEach((team) => {
        formDataInstance.append("team_id[]", team.value);
      });
      formDataInstance.append("_method", "put");

      const response = await fetch(`${API_BASE_URL}/users/${userID}`, {
        method: "POST",
        body: formDataInstance,
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result) {
        console.log("result", result);
        setUser(result?.data?.data);
        setUser1(user);

        setCallUser((prev) => !prev);
        setProfileImage(result?.data?.data?.image);
      } else {
        console.error("Profile image is undefined in the response");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
      getUser();
    }
  };

  return (
    <div className="visiting-card">

      <div className="add-profile">
        <Container fluid className="my-4">
          {isLoading ? (
            <>
              <Spinner
                animation="border"
                role="status"
                className="center-spinner"
              ></Spinner>
            </>
          ) : (
            <Row>
              {/* Main Content */}
              <Col lg={12} xs={12} md={12}>
                <Tab.Container defaultActiveKey="settings">
                  <Nav
                    variant="tabs"
                    className="mb-3 profile-navs"
                    activeKey={activeKey}
                    onSelect={(selectedKey) => setActiveKey(selectedKey)}
                  >
                    <Nav.Item>
                      <Nav.Link
                        eventKey="settings"
                        className={activeKey === "settings" ? "active-tab" : ""}
                      >
                        <span>
                          <CiSettings size={22} />
                          {t("profile.settings")}
                        </span>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content className="profile-nav-content">
                    {activeKey === "settings" && (
                      <div eventKey="settings" className="form">
                        {/* Profile Section */}
                        <Card className="mb-4 shadow-sm">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                                <i className="fas fa-user text-primary fs-4"></i>
                              </div>
                              <div>
                                <h5 className="mb-0 fw-semibold">
                                  {t("profile.customizeRole")}
                                </h5>
                                <small className="text-muted">
                                  {t("profile.customizeRoleDesc")}
                                </small>
                              </div>
                            </div>

                            <Row className="g-3">
                              {[
                                {
                                  emoji: "🧠",
                                  title: "Chef de projet / Product Owner",
                                  desc: "Je planifie, j'organise, je pilote.",
                                  value: "Project Manager / Product Owner",
                                  // Add tabs that should be shown for this role
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_active_destination.svg"
                                          alt="mission"
                                        />
                                      ),
                                      name: "Mission",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                  ],
                                },
                                {
                                  emoji: "💼",
                                  title: "Chargé de relation client / Commercial",
                                  desc: "Je gère les clients, je prépare les rendez-vous, je suis les actions et je m’assure que tout avance côté client comme en interne.",
                                  value:
                                    "Customer Relations Officer / Sales Representative",
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_active_destination.svg"
                                          alt="mission"
                                        />
                                      ),
                                      name: "Mission",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                  ],
                                },
                                {
                                  emoji: "🎯",
                                  title: "Manager / Responsable d'équipe",
                                  desc: "Je supervise les personnes, les objectifs, les résultats.",
                                  value: "Manager / Team Leader",
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_team_active.svg"
                                          alt="team"
                                        />
                                      ),
                                      name: "Team",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                  ],
                                },
                                {
                                  emoji: "💻",
                                  title:
                                    "Développeur / Contributeur opérationnel",
                                  desc: "Je veux de la clarté sur mes tâches, mon temps, mes priorités.",
                                  value: "Developer / Operational Contributor",
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar-action-active.svg"
                                          alt="action"
                                        />
                                      ),
                                      name: "Action",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                  ],
                                },
                                {
                                  emoji: "🎓",
                                  title: "Formateur / Coach",
                                  desc: "J'organise des sessions, je produis du contenu, je suis des participants.",
                                  value: "Trainer / Coach",
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/Tek.png"
                                          alt="solution"
                                          width="30px"
                                        />
                                      ),
                                      name: "Solution",
                                    },
                                  ],
                                },
                                {
                                  emoji: "🛠️",
                                  title: "Consultant / Freelance",
                                  desc: "Je facture mon temps, j'enchaîne les missions, je veux aller à l'essentiel.",
                                  value: "Consultant / Freelance",
                                  tabs: [
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_active_destination.svg"
                                          alt="mission"
                                        />
                                      ),
                                      name: "Mission",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                  ],
                                },
                                {
                                  emoji: "🧪",
                                  title: "Autre / Explorateur",
                                  desc: "Je teste pour comprendre ce que TekTIME peut m'apporter.",
                                  value: "Other / Explorer",
                                  tabs: [
                                    ,
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_active_destination.svg"
                                          alt="mission"
                                        />
                                      ),
                                      name: "Mission",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_meeting_active.svg"
                                          alt="meeting"
                                        />
                                      ),
                                      name: "Meeting",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar-action-active.svg"
                                          alt="action"
                                        />
                                      ),
                                      name: "Action",
                                    },
                                    {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_team_active.svg"
                                          alt="team"
                                        />
                                      ),
                                      name: "Team",
                                    }, {
                                      icon: (
                                        <img
                                          src="/Assets/sidebar_active_discussion.svg"
                                          alt="discussion"
                                          width="23px"

                                        />
                                      ),
                                      name: "Discussion",
                                    },
                                  ],
                                },
                              ].map((role, index) => (
                                <Col md={6} key={index}>
                                  <Card
                                    className={`h-100 profile-card ${formData.job === role.value
                                        ? "border-primary shadow-sm"
                                        : ""
                                      }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        job: role.value,
                                      }))
                                    }
                                  >
                                    <Card.Body className="p-3 d-flex flex-column">
                                      <div className="text-center">
                                        <div className="emoji-display mb-2 fs-3">
                                          {role.emoji}
                                        </div>
                                        <h6 className="mb-1 fw-medium">
                                          {role.title}
                                        </h6>
                                      </div>
                                      <small className="text-muted text-center">
                                        {role.desc}
                                      </small>

                                      {/* Show tabs for this role */}
                                      {/* {formData.job === role.value && ( */}
                                      <div className="mt-2">
                                        <div className="d-flex justify-content-center gap-2">
                                          {role.tabs.map((tab, tabIndex) => (
                                            <div
                                              key={tabIndex}
                                              className="d-flex flex-column align-items-center"
                                            >
                                              <div
                                                style={{
                                                  width: "24px",
                                                  height: "24px",
                                                }}
                                              >
                                                {tab.icon}
                                              </div>
                                              {/* <small className="text-muted">{tab.name}</small> */}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      {/* )} */}
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </Card.Body>
                        </Card>

                        {/* Needs Section */}
                        <Card className="mb-4 shadow-sm">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                                <i className="fas fa-list-check text-info fs-4"></i>
                              </div>
                              <div>
                                <h5 className="mb-0 fw-semibold">
                                  {t("profile.yourNeeds")}
                                </h5>
                                <small className="text-muted">
                                  {t("profile.selectMultipleNeeds")}
                                </small>
                              </div>
                            </div>

                            <div className="row g-3">
                              {[
                                {
                                  icon: (
                                    <img
                                      src="/Assets/sidebar_team_active.svg"
                                      alt="team"
                                    />
                                  ),
                                  value: "casting_need",
                                },
                                {
                                  icon: (
                                    <img
                                      src="/Assets/sidebar_active_destination.svg"
                                      alt="mission"
                                    />
                                  ),
                                  value: "mission_need",
                                },
                                {
                                  icon: (
                                    <img
                                      src="/Assets/sidebar_meeting_active.svg"
                                      alt="meeting"
                                    />
                                  ),
                                  value: "meeting_need",
                                },
                                {
                                  icon: (
                                    <img
                                      src="/Assets/sidebar-action-active.svg"
                                      alt="action"
                                    />
                                  ),
                                  value: "action_need",
                                },
                                {
                                  icon: (
                                    <img
                                      src="/Assets/Tek.png"
                                      alt="solution"
                                      width="32px"
                                    />
                                  ),
                                  value: "solution_need",
                                },
                                {
                                  icon: (
                                    <img
                                      src="/Assets/sidebar_active_discussion.svg"
                                      alt="discussion"
                                      width="32px"
                                    />
                                  ),
                                  value: "discussion_need",
                                },
                              ]
                                .filter(
                                  (need) =>
                                    user?.enterprise?.contract?.[need.value] ===
                                    true
                                )
                                .map((need, index) => (
                                  <div className="col-md-6" key={index}>
                                    <div
                                      className={`p-3 rounded-3 need-item ${formData.needs?.includes(need.value)
                                          ? "bg-info bg-opacity-10 border-info"
                                          : "border"
                                        }`}
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        const event = {
                                          target: {
                                            value: need.value,
                                            checked: !formData.needs?.includes(
                                              need.value
                                            ),
                                          },
                                        };
                                        handleNeedsChange(event);
                                      }}
                                    >
                                      <div className="d-flex align-items-center">
                                        <div className="me-3 fs-4">{need.icon}</div>
                                        <div className="flex-grow-1">
                                          <h6 className="mb-0 fw-medium">
                                            {" "}
                                            {t(`profile.needs.${need.value}`)}
                                          </h6>
                                        </div>
                                        <div className="form-check">
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={formData.needs?.includes(
                                              need.value
                                            )}
                                            onChange={() => { }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </Card.Body>
                        </Card>

                        <Button
                          variant="primary"
                          className="mt-4 social-info-update"
                          type="submit"
                          onClick={handleProfile}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                variant="light"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                animation="border"
                              />
                            </>
                          ) : (
                            <>{t("Validate")}</>
                          )}
                        </Button>
                      </div>
                    )}
                  </Tab.Content>
                </Tab.Container>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>

  );
};

export default Settings;
