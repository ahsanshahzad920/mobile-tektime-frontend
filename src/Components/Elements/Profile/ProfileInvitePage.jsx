import CookieService from '../../Utils/CookieService';
import React, { useEffect, useRef, useState } from "react";
import { Modal, Card, Spinner, Button } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  FaCloudDownloadAlt,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { API_BASE_URL, Assets_URL, Client_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ReactPlayer from "react-player";
import VisibilityMessageModal from "./VisibilityMessageModal";
import { toast } from "react-toastify";
// import ConfirmationModal from "../../Utils/ConfirmationModal";

const getPlatformIcon = (platform) => {
  switch (platform) {
    case "LinkedIn":
      return (
        <FaLinkedin className="platform-icon" style={{ color: "#0A66C2" }} />
      );
    case "Facebook":
      return (
        <FaFacebook className="platform-icon" style={{ color: "#1877F2" }} />
      );
    case "Twitter":
      return (
        <FaTwitter className="platform-icon" style={{ color: "#1DA1F2" }} />
      );
    case "Whatsapp":
      return (
        <FaWhatsapp className="platform-icon" style={{ color: "green" }} />
      );
    case "Youtube":
      return <FaYoutube className="platform-icon" style={{ color: "red" }} />;
    case "Instagram":
      return (
        <FaInstagram className="platform-icon" style={{ color: "#C13584" }} />
      );
    case "Behance":
      return (
        <FaBehance className="platform-icon" style={{ color: "#1769FF" }} />
      );
    case "Discord":
      return (
        <FaDiscord className="platform-icon" style={{ color: "#7289DA" }} />
      );
    case "Dribble":
      return (
        <FaDribbble className="platform-icon" style={{ color: "#EA4C89" }} />
      );
    case "Google My Business":
      return (
        <FaGoogle className="platform-icon" style={{ color: "#4285F4" }} />
      );
    case "Line":
      return <FaLine className="platform-icon" style={{ color: "#00C300" }} />;
    case "Messenger":
      return (
        <FaFacebookMessenger
          className="platform-icon"
          style={{ color: "#0084FF" }}
        />
      );
    case "Pinterest":
      return (
        <FaPinterest className="platform-icon" style={{ color: "#E60023" }} />
      );
    case "QQ":
      return <FaQq className="platform-icon" style={{ color: "#00B2A9" }} />;
    case "Reddit":
      return (
        <FaReddit className="platform-icon" style={{ color: "#FF4500" }} />
      );
    case "Skype":
      return <FaSkype className="platform-icon" style={{ color: "#00AFF0" }} />;
    case "Slack":
      return <FaSlack className="platform-icon" style={{ color: "#4A154B" }} />;
    case "Snapchat":
      return (
        <FaSnapchat className="platform-icon" style={{ color: "#FFFC00" }} />
      );
    case "Spotify":
      return (
        <FaSpotify className="platform-icon" style={{ color: "#1DB954" }} />
      );
    case "Microsoft Teams":
      return (
        <FaMicrosoft className="platform-icon" style={{ color: "#6264A7" }} />
      );
    case "Telegram":
      return (
        <FaTelegram className="platform-icon" style={{ color: "#0088CC" }} />
      );
    case "Tiktok":
      return (
        <FaTiktok className="platform-icon" style={{ color: "#000000" }} />
      );
    default:
      return null;
  }
};
const ProfileInvitePage = () => {
  const [t, i18n] = useTranslation("global");
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { nick_name } = useParams();
  const [pageViews, setPageViews] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleOffer, setModalVisibleOffer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemOffer, setSelectedItemOffer] = useState(null);
  const userId = parseInt(CookieService.get("user_id")); // Replace with dynamic user ID if needed
  const sessionUser =
    JSON.parse(CookieService.get("user"))

  // === LANGUAGE SWITCH ===
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
  // Add these states at the top of your component with other useState hooks
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    first_name: '',
    last_name: '',
    email: '',
    rating: 0,
    comment: ''
  });
  const [ratingHover, setRatingHover] = useState(0);
  // Add this function to handle review submission
  const handleReviewSubmit = async () => {
    // Basic validation
    if (!newReview.first_name || !newReview.last_name || !newReview.email || !newReview.rating || !newReview.comment) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Prepare the review data with timezone information
      const reviewData = {
        user_id: user?.id,
        reviewer_first_name: newReview.first_name,
        reviewer_last_name: newReview.last_name,
        reviewer_email: newReview.email,
        rating: newReview.rating,
        comment: newReview.comment,
        timezone: userTimezone, // Include timezone in the submission
        // Server will handle the actual timestamp conversion
      };

      // Make API call to save the review
      const response = await axios.post(
        `${API_BASE_URL}/reviews`,
        reviewData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CookieService.get('token')}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Format the date for display in user's local time
        const addedReview = {
          ...response.data.data,
          avatar: "https://tektime-storage.s3.eu-north-1.amazonaws.com/users/Nidi-1724316722.jfif",
          formatted_date: formatDateForDisplay(response.data.data.created_at, userTimezone)
        };

        setReviews([...reviews, addedReview]);
        toast.success("Review added successfully!");

        // Reset form
        setNewReview({
          first_name: '',
          last_name: '',
          email: '',
          rating: 0,
          comment: ''
        });
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Error submitting review");
    }
  };

  // Helper function to format dates for display
  const formatDateForDisplay = (isoString, timezone) => {
    return new Date(isoString).toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  const [formData, setFormData] = useState({
    email: null,
    first_name: null,
    last_name: null,
    phone: null,
    company: null,
    team: null,
    post: null,
    reason: null,
    question: null,
    digital_card_url: null,
    start_time: null,
    date: null,
    tektime_user_first_name: null,
    tektime_user_last_name: null,
    tektime_user_id: userId,
  });
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };
  const handleCardClickOffer = (item) => {
    setSelectedItemOffer(item);
    setModalVisibleOffer(true);
  };

  useEffect(() => {
    const incrementPageView = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user-page-views/${nick_name}`
        );
        if (response.status === 200) {
          setPageViews(response?.data?.views_count);
        }
      } catch (error) {
        console.error("Error incrementing page view:", error);
      }
    };
    incrementPageView();
  }, [nick_name]);

  const [visibilityMessage, setVisibilityMessage] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);

      // Extract the part after the underscore
      // const parts = nick_name?.split('_');
      // const suffix = parts[parts?.length - 1];
      // console.log('suffix',suffix)
      // const isNumeric = /^\d+$/.test(suffix);
      const apiUrl = `${API_BASE_URL}/public-user/${nick_name}`;
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response.status === 200) {
          setUser(response.data?.data);
        }
      } catch (error) {
        setLoading(false);
        console.log("error while fetching user", error);
        setVisibilityMessage(error?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (visibilityMessage) {
      setIsModalOpen(true);
    }
  }, [visibilityMessage]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatUrl = (url) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`; // Default to https if no scheme is provided
    }
    return url;
  };
  const handleOpen = (link) => {
    window.open(formatUrl(link), "_blank");
  };
  const [dropdownVisible, setDropdownVisible] = useState(
    Array(user?.websites?.length).fill(false)
  );
  const dropdownRefs = useRef([]);

  const toggleDropdown = (index) => {
    setDropdownVisible((prev) => {
      const newDropdownVisible = [...prev];
      newDropdownVisible[index] = !newDropdownVisible[index];
      return newDropdownVisible;
    });
  };
  useEffect(() => {
    user?.websites?.forEach((item, index) => {
      const el = dropdownRefs.current[index];
      if (el) {
        if (dropdownVisible[index]) {
          el.style.display = "block";
          requestAnimationFrame(() => {
            el.classList.add("show");
          });
        } else {
          el.classList.remove("show");
          el.addEventListener(
            "transitionend",
            () => {
              el.style.display = "none";
            },
            { once: true }
          );
        }
      }
    });
  }, [dropdownVisible, user]);

  //For Affiliation
  const [dropdownVisible1, setDropdownVisible1] = useState(
    Array(user?.affiliation_links?.length).fill(false)
  );
  const dropdownRefs1 = useRef([]);

  const toggleDropdown1 = (index) => {
    setDropdownVisible1((prev) => {
      const newDropdownVisible = [...prev];
      newDropdownVisible[index] = !newDropdownVisible[index];
      return newDropdownVisible;
    });
  };
  useEffect(() => {
    user?.affiliation_links?.forEach((item, index) => {
      const el = dropdownRefs1.current[index];
      if (el) {
        if (dropdownVisible1[index]) {
          el.style.display = "block";
          requestAnimationFrame(() => {
            el.classList.add("show");
          });
        } else {
          el.classList.remove("show");
          el.addEventListener(
            "transitionend",
            () => {
              el.style.display = "none";
            },
            { once: true }
          );
        }
      }
    });
  }, [dropdownVisible1, user]);
  //For Products
  const [dropdownVisible2, setDropdownVisible2] = useState(
    Array(user?.products?.length).fill(false)
  );
  const dropdownRefs2 = useRef([]);

  const toggleDropdown2 = (index) => {
    setDropdownVisible2((prev) => {
      const newDropdownVisible = [...prev];
      newDropdownVisible[index] = !newDropdownVisible[index];
      return newDropdownVisible;
    });
  };
  useEffect(() => {
    user?.products?.forEach((item, index) => {
      const el = dropdownRefs2.current[index];
      if (el) {
        if (dropdownVisible2[index]) {
          el.style.display = "block";
          requestAnimationFrame(() => {
            el.classList.add("show");
          });
        } else {
          el.classList.remove("show");
          el.addEventListener(
            "transitionend",
            () => {
              el.style.display = "none";
            },
            { once: true }
          );
        }
      }
    });
  }, [dropdownVisible2, user]);

  const handleNavigate = () => {
    window.location.href =
      "https://tektime.io/destination/uKnsk22F2gvNxC5F5a2s2jp5pts8XbxPk22zZ9qf/167482";
  };

  const blockedDomains = [
    // Music platforms
    "spotify.com",
    "open.spotify.com",
    "apple.com/music",
    "soundcloud.com",
    "youtube.com",
    "youtubemusic.com",

    // Social media platforms
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "tiktok.com",
    "reddit.com",
    "pinterest.com",
    "linkedin.com",
    "discord.com",

    // Search engines
    "google.com",
    "bing.com",
    "duckduckgo.com",

    // Email providers
    "gmail.com",
    "outlook.com",
    "yahoo.com",
    "hotmail.com",

    // Productivity platforms
    "dropbox.com",
    "drive.google.com",
    "onedrive.com",
    "box.com",

    // News platforms
    "nytimes.com",
    "bbc.com",
    "cnn.com",
    "foxnews.com",

    // E-commerce platforms
    "amazon.com",
    "ebay.com",
    "alibaba.com",
    "walmart.com",

    // Banking and finance platforms
    "paypal.com",
    "stripe.com",
    "bankofamerica.com",
    "chase.com",

    // Other popular platforms
    "netflix.com",
    "hulu.com",
    "amazonprime.com",
    "disneyplus.com",
    "medium.com",
    "quora.com",
    "stackoverflow.com",
  ];

  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setFormData({
      email: null,
      first_name: null,
      last_name: null,
      post: null,
      phone: null,
      company: null,
      team: null,
      reason: null,
      question: null,
      digital_card_url: null,
      start_time: null,
      date: null,
      tektime_user_first_name: null,
      tektime_user_last_name: null,
      tektime_user_id: userId,
    });
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [disabled, setDisabled] = useState(false);
  const [validating, setValidating] = useState(false);
  const handleApiCall = async () => {
    setDisabled(true);
    try {
      // Make the API call using axios
      const response = await axios.post(`${API_BASE_URL}/check-email`, {
        email: formData?.email,
      });

      // Check if the message is "Email exists in the database."
      if (response.data.message === "Email exists in the database.") {
        const { name, last_name, post } = response?.data?.data;

        setFormData((prev) => ({
          ...prev,
          first_name: name,
          last_name: last_name,
          post: post,
          // company: company,
        }));
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

  function downloadVCard() {
    const {
      first_name,
      last_name,
      email,
      phone,
      post,
      reason,
      digital_card_url,
    } = formData;
    // ;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    // Construct vCard
    let vCardData = `BEGIN:VCARD\n`;
    vCardData += `VERSION:3.0\n`;
    vCardData += `FN:${fullName || "N/A"}\n`;
    vCardData += `ORG:${formData.company || "N/A"}\n`;
    vCardData += `TITLE:${post || "N/A"}\n`;
    vCardData += `EMAIL:${email || "N/A"}\n`;
    if (phone) {
      vCardData += `TEL;TYPE=CELL:${phone}\n`;
    }
    vCardData += `NOTE:${reason || "N/A"}\n`;

    // Add websites (if any)
    // if (websites && websites.length > 0) {
    //   websites.forEach((website) => {
    //     if (website.link) {
    //       vCardData += `URL;TYPE=WORK:${website.link}\n`;
    //     }
    //   });
    // }

    // // Add social links (if any)
    // if (social_links && social_links.length > 0) {
    //   social_links.forEach((link) => {
    //     if (link.link) {
    //       vCardData += `URL;TYPE=SOCIAL:${link.link}\n`;
    //     }
    //   });
    // }

    // End the vCard
    vCardData += `END:VCARD`;

    // Trigger download
    try {
      const blob = new Blob([vCardData], { type: "text/vcard" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${first_name || "contact"}_${last_name || ""}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error generating or downloading the vCard:", error);
    }
  }

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast.error(t("profile.valideError"));
      return; // Stop submission
    }
    setValidating(true);
    try {
      const currentDate = new Date();
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        team: formData.team,
        post: formData.post,
        company: null,
        reason: formData.reason,
        digital_card_url: window.location.href, // Full current page URL
        start_time: currentDate.toLocaleTimeString("en-GB", { hour12: false }), // Current time (HH:mm:ss)
        date: currentDate.toISOString().split("T")[0], // Current date (YYYY-MM-DD)
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's timezone
        // tektime_user_first_name: user?.name || sessionUser?.name,
        // tektime_user_last_name:  user?.last_name || sessionUser?.last_name,
        // tektime_user_id: user?.id || sessionUser?.id,
        // question: `Pourquoi souhaitez-vous connecter avec ${user?.name || sessionUser?.name} ${user?.last_name || sessionUser?.last_name}?`,
        tektime_user_first_name: user?.name || null,
        tektime_user_last_name: user?.last_name || null,
        tektime_user_id: user?.id || null,
        question: `Pourquoi souhaitez-vous connecter avec ${user?.name} ${user?.last_name}?`,
      };
      console.log("payload", payload);
      const response = await axios.post(
        `${API_BASE_URL}/register-digital-card`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status) {
        toast.success(t("profile.Contact Added Successfully"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("profile.Error while submitting form"));
    } finally {
      setValidating(false);
      if (isMobileDevice()) {
        downloadVCard(); // Only download on mobile
      }
      handleClose();
    }
  };
  return (
    <>
      {loading ? (
        <Spinner animation="border" role="status" className="center-spinner" />
      ) : (
        <>
          {/* Custom Header */}
          <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom">
            <div className="d-flex align-items-center">
              <img src="/Assets/landing/logo.png" alt="TekTime" style={{ height: "40px", objectFit: "contain" }} />
            </div>
            <div className="language-switcher d-flex align-items-center gap-2 bg-light rounded-pill px-2 py-1">
              <button
                onClick={() => handleChangeLanguage("en")}
                className={`btn p-1 px-3 rounded-pill text-sm fw-bold ${i18n.language === "en" ? "bg-primary text-white" : "text-dark"}`}
                style={{ fontSize: "13px" }}
              >
                EN
              </button>
              <button
                onClick={() => handleChangeLanguage("fr")}
                className={`btn p-1 px-3 rounded-pill text-sm fw-bold ${i18n.language === "fr" ? "bg-primary text-white" : "text-dark"}`}
                style={{ fontSize: "13px" }}
              >
                FR
              </button>
            </div>
          </div>
          {isModalOpen ? (
            <VisibilityMessageModal
              message={visibilityMessage}
              onClose={closeModal}
            />
          ) : (
            <div
              className="profile-link w-100"
              style={{ position: "relative" }}
            >

              {user?.profile_banner ? (
                <img
                  src={Assets_URL + "/" + user?.profile_banner}
                  alt="Destination Banner"
                  style={{
                    width: "100%",
                    height: "338px",
                    objectFit: "cover",
                    filter: "opacity(0.5)",
                  }}
                />
              ) : (
                <div className="gradient-header profile-header">
                  <svg
                    width="100%"
                    height="338"
                    viewBox="0 0 1453 338"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter="url(#filter0_f_902_7997)">
                      <rect
                        width="100%"
                        height="271"
                        fill="url(#paint0_linear_902_7997)"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_f_902_7997"
                        x="-66.5"
                        y="-66.5"
                        width="1573"
                        height="404"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                      >
                        <feFlood
                          flood-opacity="0"
                          result="BackgroundImageFix"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="33.25"
                          result="effect1_foregroundBlur_902_7997"
                        />
                      </filter>
                      <linearGradient
                        id="paint0_linear_902_7997"
                        x1="856"
                        y1="281.934"
                        x2="863.131"
                        y2="-138.913"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="white" />
                        <stop offset="1" stop-color="#76C3EE" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}

              <div className="content">
                <div className="row profile-ivite-card report-row">
                  <div className="col-12 col-md-8 d-flex flex-column flex-md-row align-items-center align-items-md-start text-center text-md-start">
                    <h5 className="content-heading fw-bold">
                      {user?.title
                        ? user?.title
                        : t("profile.inviteProfile.visitingCard")}
                    </h5>
                  </div>
                  <div className="col-md-4">
                    <div className="position-relative">
                      <Card className="mt-3 host-card destination-dev-team">
                        <Card.Body>
                          <div className="d-flex justify-content-center">
                            <div className="profile-logo">
                              <Card.Img
                                className="avatar-img"
                                src={
                                  user?.enterprise?.logo?.startsWith("http")
                                    ? user?.enterprise?.logo
                                    : Assets_URL + "/" + user?.enterprise?.logo
                                }
                              />
                            </div>
                          </div>
                          {/* <Card.Title className="text-center mt-3 card-heading">
                            {meetingData?.user?.enterprise?.name}
                          </Card.Title> */}
                          {/* <Card.Subtitle className="mb-2 card-subtext">
                        {meeting?.user?.post} -{" "}
                        {meeting?.user?.teams?.map((item) => item.name)}
                      </Card.Subtitle> */}
                        </Card.Body>
                      </Card>
                    </div>
                  </div>

                  {/* ------------------------------------------------ HOST */}
                </div>
                {/* {user?.bio && (
                  <div className="row mt-5">
                    <div className="col-md-12">
                      <div className="bio">
                        <h3> {t("profile.inviteProfile.bio")}</h3>
                        <p>{user?.bio}</p>
                      </div>
                    </div>
                  </div>
                )} */}
                <div className="row profile-card report-row mt-4">
                  <div className="col-md-12">
                    <div className="d-flex justify-content-center flex-wrap">
                      <Card
                        className={`participant-card participant-card-meeting position-relative`}
                        style={{
                          width: "fit-content",
                          marginTop: "4rem",
                        }}
                      >
                        <Card.Body className="profile-invite-card-body profilecard-width px-5 py-4">
                          <div className="d-flex justify-content-center">
                            <div className="participant-card-position">
                              <div className="profile-logo">
                                <Card.Img
                                  className="user-img"
                                  src={
                                    user?.image?.startsWith("users/")
                                      ? `${Assets_URL}/${user?.image}`
                                      : user?.image
                                  }
                                  style={{
                                    height: "150px",
                                    width: "150px",
                                  }}
                                  alt="User Avatar"
                                />
                                <Card.Img
                                  className="logout-icon"
                                  src="/Assets/Avatar_company.svg"
                                  height="20px"
                                  width="20px"
                                  alt="Company Logo"
                                />
                              </div>
                            </div>
                          </div>
                          {/* New button feedback */}
                          <div className="d-flex justify-content-center mt-4">
                            <button
                              className="show-save-profile d-block"
                              onClick={handleShow}
                            >
                              <FaCloudDownloadAlt size={18} /> &nbsp;{" "}
                              {t("Add to my contact")}
                            </button>
                          </div>
                          <Card.Title className="text-center mt-4 card-heading">
                            {user?.name} {user?.last_name}
                          </Card.Title>
                          <Card.Title className="text-center mb-2 card-subtext">
                            {user?.email}
                          </Card.Title>
                          <Card.Title className="text-center mb-2 card-subtext">
                            {user?.phoneNumber}
                          </Card.Title>
                          <Card.Title className="mb-2 card-subtext">
                            {user?.post}
                          </Card.Title>
                          {/* <Card.Title className="mb-2 card-subtext">
                            {user?.teams?.map((item) => item.name).join(", ")}
                          </Card.Title> */}
                          {/* <div className="d-flex justify-content-center d-none">
                            <button
                              className="show-save-profile"
                              onClick={downloadVCard}
                            >
                              <FaCloudDownloadAlt size={18} /> &nbsp;{" "}
                              {t("Contact sheet")}
                            </button>
                          </div> */}
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* End new button feedback */}
                {user?.bio && (
                  <div className="row mt-5 profileinvitelink justify-content-center report-row">
                    <div className="col-md-4">
                      <div className="">
                        {/* <h3> {t("profile.inviteProfile.bio")}</h3> */}
                        {/* <p className="">{user?.bio}</p> */}
                        <p
                          style={{
                            wordWrap: "break-word",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {user?.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {user?.social_links?.length > 0 && (
                  <div className="row mt-3 profileinvitelink report-row">
                    {/* <h3>{t("profile.inviteProfile.socialLinks")}</h3> */}
                    <div className="d-flex gap-3 mt-3 justify-content-center">
                      {user?.social_links?.map((item, index) => (
                        <Link
                          key={index}
                          onClick={() => handleOpen(item.link)}
                          className="text-primary"
                        >
                          {getPlatformIcon(item?.platform)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {/* feedback */}
                {user?.websites?.length > 0 && (
                  <div className="row profileinvitelink report-row">
                    <div className="col-md-12">
                      <div className="bio profileinvite-biomargin">
                        <h3 className="text-center">
                          {t("profile.inviteProfile.websites")}
                        </h3>

                        {user?.websites?.map((item, index) => {
                          const domain = new URL(formatUrl(item?.link))
                            ?.hostname;
                          const isBlocked = blockedDomains?.includes(domain);

                          return (
                            <div className="col-12 profile-step" key={index}>
                              <div className="d-flex justify-content-center flex-wrap">
                                <Card
                                  className="mt-4 step-card rounded-0 profileinvite-websitewidth card-shadow py-0"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleCardClick(item)}
                                >
                                  <Card.Body className="d-flex py-3">
                                    <div className="ms-3 d-flex justify-content-center flex-column step-data w-100">
                                      <div className="ms-3 me-5 d-flex justify-content-between align-items-center step-data viewprofile-width">
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={
                                            <Tooltip id={`tooltip-${item?.id}`}>
                                              {item?.title}
                                            </Tooltip>
                                          }
                                        >
                                          <Card.Title className="step-card-heading w-100 profileinvite-cardtext-size text-center viewprofile-txtellipses viewprofile-txtsize">
                                            {item?.title}
                                          </Card.Title>
                                        </OverlayTrigger>
                                        <MdKeyboardArrowDown
                                          // onClick={() => toggleDropdown(index)}
                                          style={{
                                            cursor: "pointer",
                                            marginRight: "21px",
                                          }}
                                          size={26}
                                        />
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {user?.affiliation_links?.length > 0 && (
                  <div className="row profileinvitelink mt-3 report-row">
                    <div className="col-md-12">
                      <div className="bio profileinvite-biomargin">
                        <h3 className="text-center">
                          {t("profile.inviteProfile.affiliation")}
                        </h3>

                        {user?.affiliation_links?.map((item, index) => {
                          return (
                            <div className="col-12 profile-step" key={index}>
                              <div className="d-flex justify-content-center flex-wrap">
                                <Card
                                  className="mt-4 step-card profileinvite-websitewidth rounded-0 card-shadow py-0"
                                  style={{ cursor: "pointer" }}
                                  //  onClick={() => toggleDropdown1(index)}
                                  onClick={() => handleCardClick(item)}
                                >
                                  <Card.Body className="d-flex py- ">
                                    <div
                                      className={` ${dropdownVisible1[index]
                                        ? "d-block"
                                        : "d-block d-flex align-items-start"
                                        }`}
                                    >
                                      {/* <div className="step-number-container">
                                        <span className="step-number">
                                          {index < 10 ? "0" : ""}
                                          {index + 1}
                                        </span>
                                      </div> */}

                                      {/* {getPlatformIcon(item?.platform)} */}
                                    </div>
                                    <div className="ms-3 d-flex justify-content-center flex-column step-data w-100">
                                      <div className="ms-3 me-5 d-flex justify-content-between align-items-center step-data viewprofile-width">
                                        <Card.Title className="step-card-heading w-100 profileinvite-cardtext-size text-center viewprofile-txtellipses viewprofile-txtsize">
                                          {item?.title}
                                        </Card.Title>
                                        <MdKeyboardArrowDown
                                          // onClick={() => toggleDropdown(index)}
                                          style={{
                                            cursor: "pointer",
                                            marginRight: "21px",
                                          }}
                                          size={26}
                                        />
                                      </div>
                                    </div>
                                  </Card.Body>
                                  {dropdownVisible1[index] && (
                                    <div
                                      className="dropdown-content-1  fade"
                                      ref={(el) =>
                                        (dropdownRefs1.current[index] = el)
                                      }
                                      style={{ display: "none", margin: "6px" }}
                                    >
                                      <div className="dropdown-section-1">
                                        <iframe
                                          // src={item.link}
                                          src={formatUrl(item?.link)}
                                          frameborder="0"
                                          allowFullScreen
                                          style={{
                                            height: "500px",
                                            width: "100%",
                                            maxHeight: "500px",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </Card>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {user?.products?.length > 0 && (
                  <div className="row profileinvitelink mt-3 report-row">
                    <div className="col-md-12">
                      <div className="bio profileinvite-biomargin">
                        <h3 className="text-center">
                          {t("profile.inviteProfile.products")}
                        </h3>

                        {user?.products?.map((item, index) => {
                          return (
                            <div className="col-md-12" key={index}>
                              <div className="d-flex justify-content-center flex-wrap">
                                <Card
                                  className="mt-4 profile-step-card profileinvite-websitewidth rounded-0 card-shadow py-0"
                                  // onClick={() => toggleDropdown2(index)}
                                  onClick={() => handleCardClickOffer(item)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Card.Body className="d-flex py-3">
                                    <div
                                      className={` ${dropdownVisible2[index]
                                        ? "d-none"
                                        : "d-block d-flex align-items-start"
                                        }`}
                                    // style={{ display: dropdownVisible[index] ? "none" : "block" }}
                                    >
                                      <div>
                                        <Card.Img
                                          className={
                                            dropdownVisible2[index]
                                              ? "product-step-img"
                                              : "product-img"
                                          }
                                          src={
                                            Assets_URL +
                                            "/" +
                                            item.product_image
                                          }
                                          style={{
                                            width: "80px", // Make the image responsive
                                            height: "46px", // Maintain aspect ratio
                                            objectFit: "contain",
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="ms-3 d-flex justify-content-center flex-column step-data w-100">
                                      <div className="ms-3 me-5 d-flex justify-content-between align-items-center step-data viewprofile-width">
                                        <Card.Title
                                          className="step-card-heading w-100 profileinvite-cardtext-size text-center viewprofile-txtellipses viewprofile-txtsize"
                                          style={{ fontSize: "larger" }}
                                        >
                                          {item?.product_title}
                                        </Card.Title>

                                        <span style={{ padding: "10px" }}>
                                          <MdKeyboardArrowDown
                                            // onClick={() => toggleDropdown(index)}
                                            style={{ cursor: "pointer" }}
                                            size={26}
                                          />
                                        </span>
                                      </div>

                                      <div
                                        className={` ${dropdownVisible2[index]
                                          ? "d-block"
                                          : "d-none d-flex align-items-start"
                                          }`}
                                      >
                                        <div
                                          className="text-center"
                                        // style={{
                                        //   width: "193.14px",
                                        //   height: "104px",
                                        //   background: "#eaeaef",
                                        //   borderRadius: "10px",
                                        //   display: "flex",
                                        //   alignItems: "center",
                                        //   justifyContent: "center",
                                        // }}
                                        >
                                          <Card.Img
                                            className={
                                              dropdownVisible2[index]
                                                ? "product-step-img"
                                                : ""
                                            }
                                            src={
                                              Assets_URL +
                                              "/" +
                                              item.product_image
                                            }
                                            style={{
                                              width: "500px", // Make the image responsive
                                              height: "auto", // Maintain aspect ratio
                                            }}
                                          />
                                        </div>
                                      </div>
                                      {dropdownVisible2[index] && (
                                        <div
                                          className="dropdown-content-1  fade"
                                          ref={(el) =>
                                            (dropdownRefs2.current[index] = el)
                                          }
                                          style={{
                                            display: "none",
                                            margin: "6px",
                                          }}
                                        >
                                          <div className="dropdown-section-1">
                                            <h6>{t("product_description")}</h6>
                                            <p>{item.product_description}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {/* 
                <div className="bio profileinvite-biomargin">
                  <h3 class="text-center">Recommandation</h3>
                  <div className="row mt-5 report-row">
                    <div className="join-btn d-flex justify-content-center">
                      <button
                        style={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "24px",
                          textAlign: "left",
                          color: " #FFFFFF",
                          background: "#2C48AE",
                          border: 0,
                          outine: 0,
                          padding: "10px 16px",
                          borderRadius: "9px",
                          // marginTop: "1.5rem",
                        }}
                        onClick={() => setShowModal(true)}
                      >
                        {t("profile.add review")}
                      </button>
                    </div>
                  </div>
                </div> */}

                {/* <div className="row justify-content-center report-row">
                  <div className="col-md-7 review-col mt-3">
    {reviews.map((review) => (
      <div key={review.id} className="feedback-card-1 card mb-4 mt-4 step-card-meeting p-3 rounded-4">
        <div className="card-body d-flex align-items-center p-3">
          <img
            src={review.avatar}
            alt="Avatar"
            className="avatar-img rounded-circle me-3"
            style={{
              width: "50px",
              height: "50px",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          <div className="d-flex flex-column ms-2 w-100">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-1 text-dark">
                {review.first_name} {review.last_name}
              </h5>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="d-inline-block">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 576 512"
                      color={star <= review.rating ? "gold" : "#e0e0e0"}
                      height={20}
                      width={20}
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ 
                        color: star <= review.rating ? "gold" : "rgb(224, 224, 224)",
                        cursor: "pointer"
                      }}
                    >
                      <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                    </svg>
                  </span>
                ))}
              </div>
            </div>
            <small className="card-text text-muted mb-1">
              {review.email}
            </small>
            <p className="card-text">{review.comment}</p>
            <p className="card-text text-muted mt-2">
              {review.date}
            </p>
          </div>
        </div>
      </div>
    ))}
                  </div>
                </div> */}

                {user?.video && user?.video !== "null" && (
                  <div className="row profileinvitelink mt-3 report-row">
                    <div className="col-md-12">
                      <div className="bio profileinvite-biomargin">
                        <h3 className="text-center mb-5">
                          {" "}
                          {t("profile.inviteProfile.presentation")}
                        </h3>

                        <div className="embed-responsive embed-responsive-16by9 mb-4 text-center  d-flex align-items-center justify-content-center">
                          <ReactPlayer
                            url={
                              Assets_URL + "/" + user?.video ||
                              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                            }
                            className="react-player-video"
                            controls={true}
                            style={{ borderRadius: "4px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* <div className="row mt-5 report-row">
                  <div className="join-btn d-flex justify-content-center">
                    <button
                      style={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "24px",
                        textAlign: "left",
                        color: " #FFFFFF",
                        background: "#2C48AE",
                        border: 0,
                        outine: 0,
                        padding: "10px 16px",
                        borderRadius: "9px",
                        // marginTop: "1.5rem",
                      }}
                      onClick={handleNavigate}
                    >
                      {t("joinTektime")}
                    </button>
                  </div>
                </div> */}
                <div className="row mt-5 report-row">
                  <div className="d-flex flex-column align-items-center">
                    <div
                      className="mb-3"
                      style={{ width: "100%", maxWidth: "500px" }}
                    >
                      {/* <label
                        htmlFor="referralLink"
                        className="form-label"
                        style={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#6B7280",
                          marginBottom: "8px",
                        }}
                      >
                        {t("profile.yourReferralLink")}
                      </label> */}

                      {/* <div className="input-group">
                        <input
                          id="referralLink"
                          type="text"
                          className="form-control"
                          value={`${window.location.origin}${user?.referral_link}`}
                          readOnly
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            border: "1px solid #D1D5DB",
                            padding: "10px 16px",
                            borderRadius: "6px 0 0 6px",
                          }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}${user?.referral_link}`
                            );
                            toast.success(t("profile.copied"));
                          }}
                          style={{
                            background: "#2C48AE",
                            border: "1px solid #2C48AE",
                            borderRadius: "0 6px 6px 0",
                            padding: "10px 16px",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          {t("copy")}
                        </button>
                      </div> */}
                    </div>

                    <button
                      className="btn btn-primary mt-2"
                      onClick={() =>
                        window.open(
                          `${window.location.origin}${user?.referral_link}`,
                          "_blank"
                        )
                      }
                      style={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        background: "#2C48AE",
                        border: 0,
                        padding: "10px 24px",
                        borderRadius: "6px",
                        minWidth: "200px",
                      }}
                    >
                      {t("joinTektime")}
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-center align-items-center view-count">
                  <div className="d-flex flex-column align-items-center">
                    <span>
                      <svg
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 15.5C13.6569 15.5 15 14.1569 15 12.5C15 10.8431 13.6569 9.5 12 9.5C10.3431 9.5 9 10.8431 9 12.5C9 14.1569 10.3431 15.5 12 15.5Z"
                          stroke="black"
                          stroke-width="2"
                        />
                        <path
                          d="M21 12.5C21 12.5 20 4.5 12 4.5C4 4.5 3 12.5 3 12.5"
                          stroke="black"
                          stroke-width="2"
                        />
                      </svg>
                    </span>
                    <p className="page-count">{pageViews} page views</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Website preview modal */}
      <Modal
        show={modalVisible}
        onHide={() => setModalVisible(false)}
        size="lg"
        fullscreen
        centered
        onClick={() => setModalVisible(false)} // Close modal on click
        className="profileinvite-modal"
      >
        <Modal.Header className="text-center justify-content-between">
          <div></div>
          <Modal.Title className="text-center">
            {selectedItem?.title}
          </Modal.Title>
          <MdKeyboardArrowDown
            // onClick={() => toggleDropdown(index)}
            style={{
              cursor: "pointer",
              marginRight: "21px",
            }}
            className="text-end"
            size={26}
          />
        </Modal.Header>
        <Modal.Body className="profileinvite-modalbody">
          {selectedItem ? (
            blockedDomains?.includes(
              new URL(formatUrl(selectedItem?.link))?.hostname
            ) ? (
              <div className="d-flex align-items-center flex-column">
                <p>
                  Unable to display "{selectedItem.title}" due to security
                  policies.
                </p>
                <p>Please click the link below to open it in a new tab.</p>
                <a
                  href={selectedItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {selectedItem.title} in a new tab
                </a>
              </div>
            ) : (
              <iframe
                src={formatUrl(selectedItem?.link)}
                frameBorder="0"
                allowFullScreen
                style={{ height: "100%", width: "100%" }}
              />
            )
          ) : null}
        </Modal.Body>
      </Modal>

      {/* Offer modal */}
      <Modal
        // show={modalVisibleOffer} onHide={handleCloseModal} size="lg" centered
        show={modalVisibleOffer}
        onHide={() => setModalVisibleOffer(false)}
        size="lg"
        fullscreen
        centered
        onClick={() => setModalVisibleOffer(false)} // Close modal on click
        className="profileinvite-modal"
      >
        <Modal.Header className="text-center justify-content-between">
          <div></div>
          <Modal.Title>{selectedItemOffer?.product_title}</Modal.Title>
          <MdKeyboardArrowDown
            // onClick={() => toggleDropdown(index)}
            style={{
              cursor: "pointer",
              marginRight: "21px",
            }}
            className="text-end"
            size={26}
          />
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <img
              src={Assets_URL + "/" + selectedItemOffer?.product_image}
              alt={selectedItemOffer?.product_title}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
          <div className="mt-4">
            <h6>Description</h6>
            <p>{selectedItemOffer?.product_description}</p>
          </div>
        </Modal.Body>
        {/* <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer> */}
      </Modal>

      {/* Add to contact modal */}
      {/* <Modal show={show} onHide={handleClose} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Contact Added</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div class="form-group">
            <label class="mb-1 description">{t("profile.email")} <span className="text-danger">*</span></label>
            <input
              type="email"
              placeholder={t("profile.email")}
              class="form-control description"
            />
          </div>
          <div class="form-group">
            <label class="mb-1 description">{t("meeting.formState.firstName")} <span className="text-danger">*</span></label>
            <input
              type="text"
              placeholder={t("meeting.formState.firstName")}
              class="form-control description"
            />
          </div>
          <div class="form-group">
            <label class="mb-1 description">{t("profile.name")} <span className="text-danger">*</span></label>
            <input
              type="text"
              placeholder={t("profile.name")}
              class="form-control description"
            />
          </div>
          <div class="form-group">
            <label class="mb-1 description">{t("meeting.formState.Phone")}</label>
            <input
              type="phone"
              placeholder={t("meeting.formState.Phone")}
              class="form-control description"
            />
          </div>
          <div class="form-group">
            <label class="mb-1 description">{t("solution.badge.enterprise")}</label>
            <input
              type="text"
              placeholder={t("solution.badge.enterprise")}
              class="form-control description"
            />
          </div>
          <div class="form-group">
            <label class="mb-1 description">Pourquoi souhaitez-vous connecter avec TekTIME_USER_FIRSTNAME TEKTIME_USER_LASTNAME ?</label>
            <textarea className="form-control description" rows={5}></textarea>
          </div>
          <button className="saveandcontinue border-0 w-100">Validate</button>
        </Modal.Body>
      </Modal> */}
      <Modal
        show={show}
        onHide={handleClose}
        size="md"
        centered
        className="sign-up-modal-container"
      >
        <Modal.Header closeButton>
          <Modal.Title> {t("Add to my contact")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {t("profile.email")} <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("profile.Enter your email")}
              className="form-control profile-invite-field"
              onBlur={handleBlur}
            />
          </div>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {t("profile.fname")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder={t("profile.Enter your first name")}
              className="form-control profile-invite-field"
              disabled={disabled}
            />
          </div>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {t("profile.name")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder={t("profile.Enter your last name")}
              className="form-control profile-invite-field"
              disabled={disabled}
            />
          </div>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {" "}
              {t("profile.phone")}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("profile.Enter your phone no")}
              className="form-control profile-invite-field"
              disabled={disabled}
            />
          </div>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {" "}
              {t("profile.post")}
            </label>
            <input
              type="text"
              name="post"
              value={formData.post}
              onChange={handleChange}
              placeholder={t("profile.Enter your post")}
              className="form-control profile-invite-field"
              disabled={disabled}
            />
          </div>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {t("profile.Why do you want to connect with")}{" "}
              {`${user?.name} ${user?.last_name}`}?
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="form-control profile-invite-field"
              rows={5}
            // placeholder="Enter your reason"
            ></textarea>
          </div>
          <button
            className="saveandcontinue text-center border-0 w-100 mt-3"
            onClick={handleSubmit}
          >
            {validating ? (
              <Spinner
                as="span"
                variant="light"
                size="sm"
                role="status"
                aria-hidden="true"
                animation="border"
              />
            ) : (
              <>{t("profile.Validate")}</>
            )}
          </button>
        </Modal.Body>
      </Modal>
      {/* End add to contact modal */}

      {/* Add Review modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("profile.add review")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label className="mb-1 description1-contact">
              {t("profile.fname")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={newReview.first_name}
              onChange={(e) => setNewReview({ ...newReview, first_name: e.target.value })}
              placeholder={t("profile.Enter your first name")}
              className="form-control profile-invite-field"
            />
          </div>
          <div className="form-group mt-2">
            <label className="mb-1 description1-contact">
              {t("profile.name")} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={newReview.last_name}
              onChange={(e) => setNewReview({ ...newReview, last_name: e.target.value })}
              placeholder={t("profile.Enter your last name")}
              className="form-control profile-invite-field"
            />
          </div>
          <div className="form-group mt-2">
            <label className="mb-1 description1-contact">
              {t("profile.email")} <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={newReview.email}
              onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
              placeholder={t("profile.Enter your email")}
              className="form-control profile-invite-field"
            />
          </div>
          <div className="mt-2">
            <p className="mb-1 description1-contact">Rating <span className="text-danger">*</span></p>
            <div className="d-flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="d-inline-block"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 576 512"
                    color={(ratingHover || newReview.rating) >= star ? "gold" : "#e0e0e0"}
                    height={20}
                    width={20}
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      color: (ratingHover || newReview.rating) >= star ? "gold" : "rgb(224, 224, 224)",
                    }}
                  >
                    <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>
          <div className="form-group mt-2">
            <label className="mb-1 description1-contact">
              {t("profile.add review")} <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control profile-invite-field"
              rows="4"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button
            className="saveandcontinue text-center border-0 w-100"
            onClick={handleReviewSubmit}
          >
            {t("profile.add review")}
          </button>
        </Modal.Footer>
      </Modal>
      {/* End add review modal */}
    </>
  );
};

export default ProfileInvitePage;
