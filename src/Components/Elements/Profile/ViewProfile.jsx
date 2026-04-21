import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Image,
  Card,
  Button,
  Modal,
} from "react-bootstrap";
import { MdOutlineContentCopy, MdPrint } from "react-icons/md";
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
import { Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import ReactPlayer from "react-player";
import QRCode from "react-qr-code";

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
const ViewProfile = ({ user }) => {
  const [t] = useTranslation("global");
  // useEffect(() => {
  //   if (user) {
  //   }
  // }, [user]);

  const formatUrl = (url) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`; // Default to https if no scheme is provided
    }
    return url;
  };

  const visitingCardUrl =
    window.location.origin + "/heroes" + "/" + user?.nick_name;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(visitingCardUrl).then(
      () => { },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
    // navigate("/" + "heros" + "/" + user?.uuid);
    window.open("/" + "heroes" + "/" + user?.nick_name, "_blank");
  };

  const [show, setShow] = useState(false);

  const handleModal = () => {
    setShow(true);
  };
  const hasContent =
    user?.websites?.length > 0 ||
    user?.affiliation_links?.length > 0 ||
    user?.social_links?.length > 0;
  return (
    <div className="view-profile">
      <Container fluid className="mt-5">
        <Card className="p-4 shadow-sm">
          {/* Header Section */}
          <Row>
            <Col md={12}>
              <Card className="d-flex p-3">
                <Row>
                  {/* First Column */}
                  <Col lg={2} md={3} className="text-center">
                    {/* new class remove this from below div style={{ width: "max-content" }} */}
                    <div>
                      <Image
                        src={
                          user?.image?.startsWith("users/")
                            ? Assets_URL + "/" + user?.image
                            : user?.image || "https://via.placeholder.com/100"
                        }
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
                    <h2 className="viewprofile-username-font text-center text-md-start">{user?.full_name || "N/A"}</h2>
                    <p className="enterprise-name viewprofile-enterprise-font text-center text-md-start">
                      <img
                        src={
                                  user?.enterprise?.logo?.startsWith('http') ? user?.enterprise?.logo :
                                    Assets_URL + "/" + user?.enterprise?.logo
                                  
                                }
                        alt="enterprise"
                        width="30px"
                        className="img-fluid"
                      />
                      {user?.enterprise?.name}
                    </p>
                    <h4 className="text-primary text-center text-md-start">{user?.post || "N/A"}</h4>
                  </Col>

                  {/* Third Column */}
                  <Col lg={5} md={4} className="text-md-end text-center mt-3">
                    {/* <p>
                      <img
                        src={Assets_URL + "/" + user?.enterprise?.logo}
                        alt=""
                        width="50px"
                        className="img-fluid"
                      />
                      {user?.enterprise?.name}
                    </p> */}
                    <button
                      type="submit"
                      className="visiting-card-button"
                      onClick={copyToClipboard}
                    >
                      {t("profile.viewProfile.openVisitingCard")}&nbsp;{" "}
                      <FaArrowRight />
                    </button>

                    <p className="visiting-card-print mt-3 text-center text-md-end" onClick={handleModal}>
                      {t("profile.viewProfile.printVisitingCard")} &nbsp;{" "}
                      <MdPrint size={20} />
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            {/* <Col md={3}>
              <Card className="visiting-card-url">
                <div className="d-flex justify-content-between align-items-center">
                  <Link
                    to={
                      window.location.origin + "/heros" + "/" + user?.nick_name
                      // +
                      // "/" +
                      // user?.uuid
                    }
                    className="visiting-card-url-heading"
                  >
                    {t("profile.viewProfile.visitingCardUrl")}
                  </Link>
                  <MdOutlineContentCopy
                    color="#0026b1"
                    style={{ cursor: "pointer" }}
                    onClick={copyToClipboard}
                  />
                </div>
                <p className="mt-2 visiting-url">
                  {
                    window.location.origin + "/heros" + "/" + user?.nick_name
                    // +
                    // "/" +
                    // user?.uuid
                  }
                </p>
              </Card>
            </Col> */}
          </Row>
          <br />
          {/* <hr /> */}

          <Row className="contact-bar-container " style={{ padding: ".7rem" }}>
            {/* Social Media Section */}
            <Col md={12} className="d-flex gap-5 contact-bar">
              <h5 className="viewprofile-contact-font">Contact</h5>
              {user?.phoneNumber && <p>{user?.phoneNumber || "N/A"}</p>}
              <p>{user?.email || "N/A"}</p>
              {user?.address && <p>{user?.address || "N/A"}</p>}
            </Col>
          </Row>
          <br />

          {/* Main Content */}
          <Row>
            {/* Left Section: Bio and Contact */}
            <Col md={8} className="bio">
              {user?.bio && (
                <Card>
                  <h5 className="profile-font" >Bio</h5>
                  <p>{user?.bio || "N/A"}</p>
                </Card>
              )}
            </Col>

            {/* Right Section: Presentation and Links */}
            <Col md={4} className="presentation">
              {user?.video && user?.video !== "null" && (
                <Card style={{ paddingBottom: "0px" }}>
                  <h5 className="profile-font">{t("profile.presentation")}</h5>
                  <div className="embed-responsive embed-responsive-16by9 mb-4 text-center">
                    {/* <iframe
                    className="embed-responsive-item"
                    src={
                      Assets_URL + "/" + user?.video ||
                      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                    } // Replace with your video link
                    allowFullScreen
                    style={{ borderRadius: "4px" }}
                  /> */}
                    {/* <video src={ Assets_URL + "/" + user?.video ||
                      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"}></video> */}
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
                </Card>
              )}

              {hasContent && (
                <Card
                  className={
                    user?.video && user?.video !== "null" ? `mt-4` : ""
                  }
                >
                  {user?.websites?.length > 0 && (
                    <>
                      <h5 className="website-text profile-font">Sites</h5>
                      <ul>
                        {user?.websites?.map((website, index) => {
                          const handleClick = (e) => {
                            e.preventDefault(); // Prevent the default link behavior
                            const formattedUrl = formatUrl(website.link);
                            window.open(formattedUrl, "_blank");
                          };

                          return (
                            <li key={index}>
                              <a href={website.link} onClick={handleClick}>
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
                      <h5 className="website-text profile-font">{t("profile.Affiliation")}</h5>
                      <ul>
                        {user?.affiliation_links?.map((affiliation, index) => {
                          const handleClick = (e) => {
                            e.preventDefault(); // Prevent the default link behavior
                            const formattedUrl = formatUrl(affiliation.link);
                            window.open(formattedUrl, "_blank");
                          };

                          return (
                            <li key={index}>
                              <a href={affiliation.link} onClick={handleClick}>
                                {affiliation.title || "tektime"}
                              </a>
                            </li>
                          );
                        })}
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
                        const handleClick = () => {
                          const formattedUrl = formatUrl(social.link);
                          window.open(formattedUrl, "_blank");
                        };
                        return (
                          <Link
                            key={index}
                            onClick={handleClick}
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
          </Row>
        </Card>
      </Container>

      {show && (
        <Modal
          show={show}
          onHide={() => setShow(false)}
          className="view-profile-modal"
          centered
        >
          <Modal.Header closeButton className="bg-transparent border-0">
            <Button variant="" onClick={() => setShow(false)} aria-label="Close">
              {/* &times; */}
            </Button>
          </Modal.Header>
          <Modal.Body className="pt-0 pb-4 px-0">
            <div className="d-flex flex-column align-items-center justify-content-center">
              <Image
                src={
                  user?.image?.startsWith("users/")
                    ? Assets_URL + "/" + user?.image
                    : user?.image || "https://via.placeholder.com/100"
                }
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
              <h2 className="name">{user?.full_name || "N/A"}</h2>
              <p className="enterprise-name">
                <img
                  src={Assets_URL + "/" + user?.enterprise?.logo}
                  alt="enterprise"
                  width="30px"
                  className="img-fluid"
                />
                {user?.enterprise?.name}
              </p>
              <h4 className="text-primary post">{user?.post || "N/A"}</h4>
              <div
                style={{
                  height: "auto",
                  margin: "0 auto",
                  maxWidth: 150,
                  width: "100%",
                  marginTop: "2rem",
                }}
              >
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={visitingCardUrl}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ViewProfile;
