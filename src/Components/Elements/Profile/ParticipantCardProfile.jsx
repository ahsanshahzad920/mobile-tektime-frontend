import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Image,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";
import { MdOutlineContentCopy } from "react-icons/md";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaBehance,
  FaDiscord,
  FaDribbble,
  FaGoogle,
  FaLine,
  FaFacebookMessenger,
  FaPinterest,
  FaQq,
  FaReddit,
  FaSkype,
  FaSlack,
  FaSnapchat,
  FaSpotify,
  FaMicrosoft,
  FaTelegram,
  FaTiktok,
  FaArrowRight,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ReactPlayer from "react-player";
import { IoArrowBackSharp } from "react-icons/io5";
import VisibilityMessageModal from "./VisibilityMessageModal";
import { useSidebarContext } from "../../../context/SidebarContext";

const getPlatformIcon = (platform) => {
  switch (platform) {
    case "LinkedIn":
      return <FaLinkedin size={25} style={{ color: "#0A66C2" }} />;
    case "Facebook":
      return <FaFacebook size={25} style={{ color: "#1877F2" }} />;
    case "Twitter":
      return <FaTwitter size={25} style={{ color: "#1DA1F2" }} />;
    case "Whatsapp":
      return <FaWhatsapp size={25} style={{ color: "green" }} />;
    case "Youtube":
      return <FaYoutube size={25} style={{ color: "red" }} />;
    case "Instagram":
      return <FaInstagram size={25} style={{ color: "#C13584" }} />;
    case "Behance":
      return <FaBehance size={25} style={{ color: "#1769FF" }} />;
    case "Discord":
      return <FaDiscord size={25} style={{ color: "#7289DA" }} />;
    case "Dribble":
      return <FaDribbble size={25} style={{ color: "#EA4C89" }} />;
    case "Google My Business":
      return <FaGoogle size={25} style={{ color: "#4285F4" }} />;
    case "Line":
      return <FaLine size={25} style={{ color: "#00C300" }} />;
    case "Messenger":
      return <FaFacebookMessenger size={25} style={{ color: "#0084FF" }} />;
    case "Pinterest":
      return <FaPinterest size={25} style={{ color: "#E60023" }} />;
    case "QQ":
      return <FaQq size={25} style={{ color: "#00B2A9" }} />;
    case "Reddit":
      return <FaReddit size={25} style={{ color: "#FF4500" }} />;
    case "Skype":
      return <FaSkype size={25} style={{ color: "#00AFF0" }} />;
    case "Slack":
      return <FaSlack size={25} style={{ color: "#4A154B" }} />;
    case "Snapchat":
      return <FaSnapchat size={25} style={{ color: "#FFFC00" }} />;
    case "Spotify":
      return <FaSpotify size={25} style={{ color: "#1DB954" }} />;
    case "Microsoft Teams":
      return <FaMicrosoft size={25} style={{ color: "#6264A7" }} />;
    case "Telegram":
      return <FaTelegram size={25} style={{ color: "#0088CC" }} />;
    case "Tiktok":
      return <FaTiktok size={25} style={{ color: "#000000" }} />;
    default:
      return null;
  }
};
const ParticipantCardProfile = ({ userId, handleHide, isUser }) => {
  const [t] = useTranslation("global");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { nick_name } = useParams();
  const [visibilityMessage, setVisibilityMessage] = useState(null);
  const { toggle, show } = useSidebarContext();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/${
            isUser ? `public-user` : `public-participant`
          }/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
        if (response.status === 200) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.log("error while fetching user", error);
        setVisibilityMessage(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [userId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (visibilityMessage) {
      setIsModalOpen(true);
      toggle(false);
    }
  }, [visibilityMessage]);

  // Helper function to ensure URLs are properly formatted
  const formatUrl = (url) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`; // Default to https if no scheme is provided
    }
    return url;
  };

  const visitingCardUrl =
    window.location.origin + "/" + user?.nick_name + "/" + user?.uuid;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(visitingCardUrl).then(
      () => {},
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const hasContent =
    user?.websites?.length > 0 ||
    user?.affiliation_links?.length > 0 ||
    user?.social_links?.length > 0;
  return (
    <>
      {loading ? (
        <Spinner animation="border" role="status" className="center-spinner" />
      ) : (
        <>
          {isModalOpen ? (
            <>
              <VisibilityMessageModal
                show={isModalOpen}
                message={visibilityMessage}
                onClose={handleHide}
              />
            </>
          ) : (
            <div className="profile-invite-page">
              <div className="view-profile">
                <Container fluid className="mt-5">
                  <Card className="border-0">
                    {/* Header Section */}
                    <Row>
                      <Col md={12}>
                        <Card className="d-flex p-3">
                          <Row>
                            {/* First Column */}
                            <Col md={2} className="text-center">
                              <div style={{ width: "max-content" }}>
                                <Image
                                  src={
                                    user?.image?.startsWith("users/")
                                      ? Assets_URL + "/" + user?.image
                                      : user?.image ||
                                        "https://via.placeholder.com/100"
                                  } // Replace with actual profile image
                                  roundedCircle
                                  fluid
                                  style={{
                                    objectFit: "cover",
                                    height: "150px",
                                    width: "150px",
                                    borderRadius: "50%",
                                    objectPosition: "top",
                                  }}
                                />
                              </div>
                            </Col>
                            {/* Second Column */}
                            <Col md={5} className="d-flex flex-column">
                              <h2 className="name">
                                {user?.full_name || "N/A"}
                              </h2>
                              <h4 className="text-primary post">
                                {user?.post || " "}
                              </h4>
                            </Col>

                            {/* Third Column */}
                            <Col md={5} className="text-md-right text-end">
                              {/* Add anything you'd like here, such as additional info or icons */}
                              <p className="enterprise-name">
                                <img
                                  src={
                                    Assets_URL + "/" + user?.enterprise?.logo
                                  }
                                  alt=""
                                  width="50px"
                                  className="img-fluid"
                                />
                                {user?.enterprise?.name}
                              </p>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    </Row>
                    <br />
                    <Row
                      className="contact-bar-container "
                      style={{ padding: ".7rem" }}
                    >
                      {/* Social Media Section */}
                      <Col md={12} className="d-flex gap-5 contact-bar">
                        <h5>Contact</h5>
                        {user?.phoneNumber && <p>{user?.phoneNumber || " "}</p>}
                        <p>{user?.email || "N/A"}</p>
                      </Col>
                    </Row>
                    <br />

                    {/* Main Content */}
                    <Row>
                      {/* Left Section: Bio and Contact */}
                      <Col md={8} className="bio">
                        {user?.bio && (
                          <Card>
                            <h5 className="">Bio</h5>
                            <p>{user?.bio || " "}</p>
                          </Card>
                        )}
                      </Col>

                      {/* Right Section: Presentation and Links */}
                      {(user?.video ||
                        user?.websites?.length > 0 ||
                        user?.social_links?.length > 0) && (
                        <Col md={4} className="presentation">
                          {user?.video && user?.video !== "null" && (
                            <Card style={{ paddingBottom: "0px" }}>
                              {user?.video && (
                                <>
                                  <h5>{t("profile.presentation")}</h5>
                                  <div className="embed-responsive embed-responsive-16by9 mb-4 text-center">
                                    <ReactPlayer
                                      url={
                                        Assets_URL + "/" + user?.video ||
                                        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                                      }
                                      width="100%"
                                      height="100%"
                                      controls={true}
                                      style={{ borderRadius: "4px" }}
                                    />
                                  </div>
                                </>
                              )}
                            </Card>
                          )}
                          {hasContent && (
                            <Card
                              className={
                                user?.video && user?.video !== "null"
                                  ? "mt-4"
                                  : ""
                              }
                            >
                              {user?.websites?.length > 0 && (
                                <>
                                  <h5 className="website-text">Sites</h5>
                                  <ul>
                                    {user?.websites?.map((website, index) => {
                                      const handleClick = (e) => {
                                        e.preventDefault(); // Prevent the default link behavior
                                        const formattedUrl = formatUrl(
                                          website.link
                                        );
                                        window.open(formattedUrl, "_blank");
                                      };

                                      return (
                                        <li key={index}>
                                          <a
                                            href={website.link}
                                            onClick={handleClick}
                                          >
                                            {website.title || "tektime"}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </>
                              )}
                              {user?.affiliation_links?.length > 0 && (
                                <>
                                  <h5 className="website-text">
                                    {t("profile.Affiliation")}
                                  </h5>
                                  <ul>
                                    {user?.affiliation_links?.map(
                                      (affiliation, index) => {
                                        const handleClick = (e) => {
                                          e.preventDefault(); // Prevent the default link behavior
                                          const formattedUrl = formatUrl(
                                            affiliation.link
                                          );
                                          window.open(formattedUrl, "_blank");
                                        };

                                        return (
                                          <li key={index}>
                                            <a
                                              href={affiliation.link}
                                              onClick={handleClick}
                                            >
                                              {affiliation.title || "tektime"}
                                            </a>
                                          </li>
                                        );
                                      }
                                    )}
                                  </ul>
                                </>
                              )}
                              {user?.social_links?.length > 0 && (
                                <div className="d-flex gap-2 mt-3">
                                  {user?.social_links?.map((social, index) => {
                                    // let IconComponent;
                                    // switch (social.platform.toLowerCase()) {
                                    //   case "linkedin":
                                    //     IconComponent = FaLinkedin;
                                    //     break;
                                    //   case "facebook":
                                    //     IconComponent = FaFacebook;
                                    //     break;
                                    //   case "twitter":
                                    //     IconComponent = FaTwitter;
                                    //     break;
                                    //   case "instagram":
                                    //     IconComponent = FaInstagram;
                                    //     break;
                                    //   case "behance":
                                    //     IconComponent = FaBehance;
                                    //     break;
                                    //   case "discord":
                                    //     IconComponent = FaDiscord;
                                    //     break;
                                    //   case "dribble":
                                    //     IconComponent = FaDribbble;
                                    //     break;
                                    //   case "google my business":
                                    //     IconComponent = FaGoogle;
                                    //     break;
                                    //   case "line":
                                    //     IconComponent = FaLine;
                                    //     break;
                                    //   case "messenger":
                                    //     IconComponent = FaFacebookMessenger;
                                    //     break;
                                    //   case "pinterest":
                                    //     IconComponent = FaPinterest;
                                    //     break;
                                    //   case "qq":
                                    //     IconComponent = FaQq;
                                    //     break;
                                    //   case "reddit":
                                    //     IconComponent = FaReddit;
                                    //     break;
                                    //   case "skype":
                                    //     IconComponent = FaSkype;
                                    //     break;
                                    //   case "slack":
                                    //     IconComponent = FaSlack;
                                    //     break;
                                    //   case "snapchat":
                                    //     IconComponent = FaSnapchat;
                                    //     break;
                                    //   case "spotify":
                                    //     IconComponent = FaSpotify;
                                    //     break;
                                    //   case "microsoft teams":
                                    //     IconComponent = FaMicrosoft;
                                    //     break;
                                    //   case "telegram":
                                    //     IconComponent = FaTelegram;
                                    //     break;
                                    //   case "tiktok":
                                    //     IconComponent = FaTiktok;
                                    //     break;
                                    //   default:
                                    //     IconComponent = null;
                                    // }
                                    const handleClick = (e) => {
                                      e.preventDefault();
                                      const formattedUrl = formatUrl(
                                        social.link
                                      );
                                      window.open(formattedUrl, "_blank");
                                    };
                                    return (
                                      <Link
                                        key={index}
                                        onClick={(e) => handleClick(e)}
                                        // target="_blank"
                                        className="text-primary"
                                      >
                                        {getPlatformIcon(social?.platform)}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </Card>
                          )}
                        </Col>
                      )}
                    </Row>
                  </Card>
                </Container>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ParticipantCardProfile;
