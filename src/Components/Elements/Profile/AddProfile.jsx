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
  InputGroup,
  DropdownButton,
  Dropdown,
  Spinner,
  Modal,
} from "react-bootstrap";
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
  FaYoutube,
  FaFileUpload,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Select from "react-select";
import { useFormContext } from "../../../context/CreateMeetingContext";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoPlayOutline, IoShareSocialOutline } from "react-icons/io5";
import { IoMdSync } from "react-icons/io";
import { RiDeleteBin5Line, RiLockPasswordLine } from "react-icons/ri";
import { MdOutlineFileUpload, MdOutlinePrivacyTip } from "react-icons/md";
import { FaUserGroup, FaWhatsapp } from "react-icons/fa6";
import { GoPlus } from "react-icons/go";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-number-input";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { IoImages } from "react-icons/io5";
import ImageEditorModal from "../Invities/ImageEditorModal";
import { CiSettings } from "react-icons/ci";

const AddProfile = ({ user, teams, refreshUserData, isLoading, setView }) => {
  const {
    formState,
    setFormState,

    login,
    googleLogin,
    googleFullName,
    visioGoogleMeet,
    emailGmail,
    setGoogleFullName,
    setVisioGoogleMeet,
    setEmailGmail,
  } = useFormContext();

  const { profileImage, setProfileImage,setUser,setCallUser } = useHeaderTitle();
  const navigate = useNavigate();
  const isAuth = JSON.parse(CookieService.get("is_google_login"));
  const options = [
    {
      value: "LinkedIn",
      label: (
        <>
          <FaLinkedin style={{ color: "#0A66C2" }} /> LinkedIn
        </>
      ),
    },
    {
      value: "Facebook",
      label: (
        <>
          <FaFacebook style={{ color: "#1877F2" }} /> Facebook
        </>
      ),
    },
    {
      value: "Youtube",
      label: (
        <>
          <FaYoutube style={{ color: "red" }} /> Youtube
        </>
      ),
    },
    {
      value: "Whatsapp",
      label: (
        <>
          <FaWhatsapp style={{ color: "green" }} /> Whatsapp
        </>
      ),
    },
    {
      value: "Twitter",
      label: (
        <>
          <FaTwitter style={{ color: "#1DA1F2" }} /> Twitter
        </>
      ),
    },
    {
      value: "Instagram",
      label: (
        <>
          <FaInstagram style={{ color: "#C13584" }} /> Instagram
        </>
      ),
    },
    {
      value: "Behance",
      label: (
        <>
          <FaBehance style={{ color: "#1769FF" }} /> Behance
        </>
      ),
    },
    {
      value: "Discord",
      label: (
        <>
          <FaDiscord style={{ color: "#7289DA" }} /> Discord
        </>
      ),
    },
    {
      value: "Dribble",
      label: (
        <>
          <FaDribbble style={{ color: "#EA4C89" }} /> Dribble
        </>
      ),
    },
    {
      value: "Google My Business",
      label: (
        <>
          <FaGoogle style={{ color: "#4285F4" }} /> Google My Business
        </>
      ),
    },

    {
      value: "Line",
      label: (
        <>
          <FaLine style={{ color: "#00C300" }} /> Line
        </>
      ),
    },
    {
      value: "Messenger",
      label: (
        <>
          <FaFacebookMessenger style={{ color: "#0084FF" }} /> Messenger
        </>
      ),
    },
    {
      value: "Pinterest",
      label: (
        <>
          <FaPinterest style={{ color: "#E60023" }} /> Pinterest
        </>
      ),
    },
    {
      value: "QQ",
      label: (
        <>
          <FaQq style={{ color: "#00B2A9" }} /> QQ
        </>
      ),
    },
    {
      value: "Reddit",
      label: (
        <>
          <FaReddit style={{ color: "#FF4500" }} /> Reddit
        </>
      ),
    },
    {
      value: "Skype",
      label: (
        <>
          <FaSkype style={{ color: "#00AFF0" }} /> Skype
        </>
      ),
    },
    {
      value: "Slack",
      label: (
        <>
          <FaSlack style={{ color: "#4A154B" }} /> Slack
        </>
      ),
    },
    {
      value: "Snapchat",
      label: (
        <>
          <FaSnapchat style={{ color: "#FFFC00" }} /> Snapchat
        </>
      ),
    },
    {
      value: "Spotify",
      label: (
        <>
          <FaSpotify style={{ color: "#1DB954" }} /> Spotify
        </>
      ),
    },
    {
      value: "Microsoft Teams",
      label: (
        <>
          <FaMicrosoft style={{ color: "#6264A7" }} /> Microsoft Teams
        </>
      ),
    },
    {
      value: "Telegram",
      label: (
        <>
          <FaTelegram style={{ color: "#0088CC" }} /> Telegram
        </>
      ),
    },
    {
      value: "Tiktok",
      label: (
        <>
          <FaTiktok style={{ color: "#000000" }} /> Tiktok
        </>
      ),
    },
  ];

  const options1 = [
    // {
    //   value: "Outlook",
    //   label: (
    //     <>
    //       <svg
    //         width="25px"
    //         height="25px"
    //         viewBox="0 0 32 32"
    //         fill="none"
    //         xmlns="http://www.w3.org/2000/svg"
    //       >

    //         <g id="SVGRepo_bgCarrier" stroke-width="0" />

    //         <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

    //         <g id="SVGRepo_iconCarrier"> <rect x="10" y="2" width="20" height="28" rx="2" fill="#1066B5" /> <rect x="10" y="2" width="20" height="28" rx="2" fill="url(#paint0_linear_87_7742)" /> <rect x="10" y="5" width="10" height="10" fill="#32A9E7" /> <rect x="10" y="15" width="10" height="10" fill="#167EB4" /> <rect x="20" y="15" width="10" height="10" fill="#32A9E7" /> <rect x="20" y="5" width="10" height="10" fill="#58D9FD" /> <mask id="mask0_87_7742" maskUnits="userSpaceOnUse" x="8" y="14" width="24" height="16"> <path d="M8 14H30C31.1046 14 32 14.8954 32 16V28C32 29.1046 31.1046 30 30 30H10C8.89543 30 8 29.1046 8 28V14Z" fill="url(#paint1_linear_87_7742)" /> </mask> <g mask="url(#mask0_87_7742)"> <path d="M32 14V18H30V14H32Z" fill="#135298" /> <path d="M32 30V16L7 30H32Z" fill="url(#paint2_linear_87_7742)" /> <path d="M8 30V16L33 30H8Z" fill="url(#paint3_linear_87_7742)" /> </g> <path d="M8 12C8 10.3431 9.34315 9 11 9H17C18.6569 9 20 10.3431 20 12V24C20 25.6569 18.6569 27 17 27H8V12Z" fill="#000000" fill-opacity="0.3" /> <rect y="7" width="18" height="18" rx="2" fill="url(#paint4_linear_87_7742)" /> <path d="M14 16.0693V15.903C14 13.0222 11.9272 11 9.01582 11C6.08861 11 4 13.036 4 15.9307V16.097C4 18.9778 6.07278 21 9 21C11.9114 21 14 18.964 14 16.0693ZM11.6424 16.097C11.6424 18.0083 10.5665 19.1579 9.01582 19.1579C7.46519 19.1579 6.37342 17.9806 6.37342 16.0693V15.903C6.37342 13.9917 7.44937 12.8421 9 12.8421C10.5348 12.8421 11.6424 14.0194 11.6424 15.9307V16.097Z" fill="white" /> <defs> <linearGradient id="paint0_linear_87_7742" x1="10" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse"> <stop stop-color="#064484" /> <stop offset="1" stop-color="#0F65B5" /> </linearGradient> <linearGradient id="paint1_linear_87_7742" x1="8" y1="26.7692" x2="32" y2="26.7692" gradientUnits="userSpaceOnUse"> <stop stop-color="#1B366F" /> <stop offset="1" stop-color="#2657B0" /> </linearGradient> <linearGradient id="paint2_linear_87_7742" x1="32" y1="23" x2="8" y2="23" gradientUnits="userSpaceOnUse"> <stop stop-color="#44DCFD" /> <stop offset="0.453125" stop-color="#259ED0" /> </linearGradient> <linearGradient id="paint3_linear_87_7742" x1="8" y1="23" x2="32" y2="23" gradientUnits="userSpaceOnUse"> <stop stop-color="#259ED0" /> <stop offset="1" stop-color="#44DCFD" /> </linearGradient> <linearGradient id="paint4_linear_87_7742" x1="0" y1="16" x2="18" y2="16" gradientUnits="userSpaceOnUse"> <stop stop-color="#064484" /> <stop offset="1" stop-color="#0F65B5" /> </linearGradient> </defs> </g>

    //       </svg>{""}
    //       Outlook
    //     </>
    //   ),
    // },
    {
      value: "Google Agenda",
      label: (
        <>
          <FcGoogle style={{ color: "#0A66C2" }} className="fs-5" /> Google
          Agenda
        </>
      ),
    },
  ];

  const options2 = [
    // {
    //   value: "Teams",
    //   label: (
    //     <>
    //       <BiLogoMicrosoftTeams style={{ color: "#0A66C2" }} className="fs-5" /> Teams
    //     </>
    //   ),
    // },
    {
      value: "Google Meet",
      label: (
        <>
          <svg
            width="32px"
            height="32px"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                fill="white"
              ></path>{" "}
              <path
                d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z"
                fill="#FBBC05"
              ></path>{" "}
              <path
                d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z"
                fill="#FBBC05"
              ></path>{" "}
              <path
                d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z"
                fill="#34A853"
              ></path>{" "}
              <path
                d="M10.1042 7L5 12.4H10.0956L10.1042 7Z"
                fill="#EA4335"
              ></path>{" "}
              <path
                d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z"
                fill="#1967D2"
              ></path>{" "}
              <path
                d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z"
                fill="#4285F4"
              ></path>{" "}
              <path
                d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z"
                fill="#34A853"
              ></path>{" "}
              <path
                d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z"
                fill="#188038"
              ></path>{" "}
            </g>
          </svg>{" "}
          Google Meet
        </>
      ),
    },
    // {
    //   value: "Zoom",

    //   label: (
    //     <>
    //       <BiLogoZoom style={{ color: "#0A66C2" }} className="fs-5" /> Zoom
    //     </>
    //   ),
    // },
  ];

  const options3 = [
    {
      value: "Gmail",
      label: (
        <>
          <svg
            width="32px"
            height="32px"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                fill="white"
              ></path>{" "}
              <path
                d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z"
                fill="#EA4335"
              ></path>{" "}
              <path
                d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z"
                fill="#FBBC05"
              ></path>{" "}
              <path
                d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z"
                fill="#34A853"
              ></path>{" "}
              <path
                d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z"
                fill="#C5221F"
              ></path>{" "}
              <path
                d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z"
                fill="#C5221F"
              ></path>{" "}
              <path
                d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z"
                fill="#C5221F"
              ></path>{" "}
              <path
                d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z"
                fill="#4285F4"
              ></path>{" "}
            </g>
          </svg>{" "}
          Gmail
        </>
      ),
    },
    // {
    //   value: "Outlook",

    //   label: (
    //     <>
    //       <PiMicrosoftOutlookLogoFill style={{ color: "#0A66C2" }} className="fs-5" /> Outlook
    //     </>
    //   ),
    // },
  ];

  const [t] = useTranslation("global");

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


  // useEffect(() => {
  //   setcroppedImage(banner);
  // }, [currentItem]);

  // Function to handle adding a new social link
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", link: "" }]);
  };
  const addintegrationLinks = () => {
    setIntegrationLinks([...integrationLinks, { platform: "", value: "" }]);
  };
  const addvisioconferenceLinks = () => {
    setVisioconferenceLinks([
      ...visioconferenceLinks,
      { platform: "", value: "" },
    ]);
  };
  const addemailLinks = () => {
    setEmailLinks([...emailLinks, { platform: "", link: "" }]);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { product_title: "", product_description: "", product_image: null },
    ]);
  };
  const removeProduct = async (item, index) => {
    try {
      if (item?.id) {
        // if the peoduct has an ID (existing product)
        const response = await axios.delete(
          `${API_BASE_URL}/products/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted product
          setProducts((prevProduct) =>
            prevProduct.filter((_, i) => i !== index)
          );
        }
      } else {
        // If the product doesn't have an ID, it's a new product (not saved in the backend yet)
        setProducts((prevProduct) => prevProduct.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.log("Error while deleting product", error);
    }
  };

  const handleProductChange = (index, event) => {
    const { name, value } = event.target;
    const updateProducts = [...products];
    updateProducts[index][name] = value;
    setProducts(updateProducts);
  };

  const handleProductImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProducts = [...products];
        updatedProducts[index] = {
          ...updatedProducts[index],
          product_image: reader.result,
        };
        setProducts(updatedProducts);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
    event.target.value = "";
  };

  // Function to handle removing a social link
  const removeSocialLink = async (item, index) => {
    try {
      if (item?.id) {
        // if the social has an ID (existing social link)
        const response = await axios.delete(
          `${API_BASE_URL}/social-links/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted social link
          setSocialLinks((prevSocialLinks) =>
            prevSocialLinks.filter((_, i) => i !== index)
          );
        }
      } else {
        // If the social doesn't have an ID, it's a new social link (not saved in the backend yet)
        setSocialLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.log("Error while deleting website", error);
    }
  };

  const removeIntegrationLinks = async (item, index) => {
    try {
      if (item?.id) {
        // if the social has an ID (existing social link)
        const response = await axios.delete(
          `${API_BASE_URL}/integration-links/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted social link
          setIntegrationLinks((prevIntegrationLinks) =>
            prevIntegrationLinks.filter((_, i) => i !== index)
          );
          CookieService.set("is_google_login", false);
          // setGoogleFullName(null)
        }
      } else {
        // If the social doesn't have an ID, it's a new social link (not saved in the backend yet)
        setIntegrationLinks((prevLinks) =>
          prevLinks.filter((_, i) => i !== index)
        );
        CookieService.set("is_google_login", false);
        // setGoogleFullName(null)
      }
    } catch (error) {
      console.log("Error while deleting website", error);
      // setGoogleFullName(null)
    }
  };
  const removeVisioconferenceLinks = async (item, index) => {
    try {
      if (item?.id) {
        // if the social has an ID (existing social link)
        const response = await axios.delete(
          `${API_BASE_URL}/visioconference-links/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted social link
          setVisioconferenceLinks((prevVisioconferenceLinks) =>
            prevVisioconferenceLinks.filter((_, i) => i !== index)
          );
          CookieService.set("is_google_login", false);
          handleVisioconferenceChange(false);
          // setVisioGoogleMeet(null)
        }
      } else {
        // If the social doesn't have an ID, it's a new social link (not saved in the backend yet)
        setVisioconferenceLinks((prevLinks) =>
          prevLinks.filter((_, i) => i !== index)
        );
        CookieService.set("is_google_login", false);
        // setVisioGoogleMeet(null)
      }
    } catch (error) {
      console.log("Error while deleting website", error);
      // setVisioGoogleMeet(null)
    }
  };

  const removeEmailLinks = async (item, index) => {
    try {
      if (item?.id) {
        // if the social has an ID (existing social link)
        const response = await axios.delete(
          `${API_BASE_URL}/email-links/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted social link
          setEmailLinks((prevEmailLinks) =>
            prevEmailLinks.filter((_, i) => i !== index)
          );
          CookieService.set("is_google_login", false);
          handleEmailChange(false);
          setEmailGmail(null);
        }
      } else {
        // If the social doesn't have an ID, it's a new social link (not saved in the backend yet)
        setEmailLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
        CookieService.set("is_google_login", false);
        setEmailGmail(null);
      }
    } catch (error) {
      console.log("Error while deleting website", error);
      setEmailGmail(null);
    }
  };

  // Function to handle adding a new website
  const addWebsite = () => {
    setWebsites([...websites, { title: "", link: "" }]);
  };

  const removeWebsite = async (item, index) => {
    try {
      if (item?.id) {
        const response = await axios.delete(
          `${API_BASE_URL}/website/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted website
          setWebsites((prevWebsites) =>
            prevWebsites.filter((_, i) => i !== index)
          );
        }
      } else {
        // If the website doesn't have an ID, it's a new website
        setWebsites((prevWebsites) =>
          prevWebsites.filter((_, i) => i !== index)
        );
      }
    } catch (error) {
      console.log("Error while deleting website", error);
    }
  };
  // Function to handle adding a new affilication links
  const addAffiliationLinks = () => {
    setAffilicationLinks([...affiliationLinks, { title: "", link: "" }]);
  };

  const removeAffiliationLinks = async (item, index) => {
    try {
      if (item?.id) {
        const response = await axios.delete(
          `${API_BASE_URL}/affiliation-links/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );

        if (response?.status === 200) {
          // Update the state by removing the deleted Affilication
          setAffilicationLinks((prevAffiliationLinks) =>
            prevAffiliationLinks.filter((_, i) => i !== index)
          );
        }
      } else {
        // If the Affilication doesn't have an ID, it's a new Affilication
        setAffilicationLinks((prevAffiliationLinks) =>
          prevAffiliationLinks.filter((_, i) => i !== index)
        );
      }
    } catch (error) {
      console.log("Error while deleting Affilication", error);
    }
  };

  // const handleAffiliationLinkChange = (index, event) => {
  //   const { name, value } = event.target;
  //   const updatedAffiliationLink = [...affiliationLinks];
  //   updatedAffiliationLink[index][name] = value;
  //   setAffilicationLinks(updatedAffiliationLink);
  // };
  const handleAffiliationLinkChange = (index, event) => {
    const { name, value } = event.target;
    const updatedAffiliationLink = [...affiliationLinks];

    // If the link is a YouTube link, convert it to the embed format
    if (name === "link" && value.includes("youtube.com/watch")) {
      const url = new URL(value);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        updatedAffiliationLink[index][
          name
        ] = `https://www.youtube.com/embed/${videoId}`;
      } else {
        updatedAffiliationLink[index][name] = value;
      }
    } else {
      updatedAffiliationLink[index][name] = value;
    }

    setAffilicationLinks(updatedAffiliationLink);
  };

  const handleSocialChange = (index, event) => {
    const { name, value } = event.target;
    const updatedSocialLinks = [...socialLinks];
    updatedSocialLinks[index][name] = value;
    setSocialLinks(updatedSocialLinks);
  };

  const handleSelectChange = (index, selectedOption) => {
    const updatedSocialLinks = [...socialLinks];
    updatedSocialLinks[index].platform = selectedOption
      ? selectedOption.value
      : "";
    setSocialLinks(updatedSocialLinks);
  };

  const handleIntegrationChange = (index, event) => {
    const { name, value } = event.target;
    const updatedIntegrationLinks = [...integrationLinks];
    updatedIntegrationLinks[index][name] = value;
    setIntegrationLinks(updatedIntegrationLinks);
  };

  const initiateOutlookLogin = () => {
    const clientId = "YOUR_CLIENT_ID"; // Replace with your app's Client ID
    const redirectUri = "YOUR_REDIRECT_URI"; // Replace with your app's redirect URI
    const scope = "openid profile email";

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_mode=query&scope=${encodeURIComponent(scope)}`;

    // Redirect user to the Microsoft login page
    window.location.href = authUrl;
  };

  const handleVisioconferenceChange = (index, event) => {
    const { name, value } = event.target;
    const updatedVisioconferenceLinks = [...visioconferenceLinks];
    updatedVisioconferenceLinks[index][name] = value;
    setVisioconferenceLinks(updatedVisioconferenceLinks);
  };

  const handleEmailChange = (index, event) => {
    const { name, value } = event.target;
    const updatedEmailLinks = [...emailLinks];
    updatedEmailLinks[index][name] = value;
    setEmailLinks(updatedEmailLinks);
  };
  // Handle changes for websites

  // integration select option
  const handleSelectintegrationChange = (index, selectedOption) => {
    const updatedIntegrationLinks = [...integrationLinks];
    updatedIntegrationLinks[index].platform = selectedOption
      ? selectedOption.value
      : "";
    setIntegrationLinks(updatedIntegrationLinks);

    // Run googleLogin() and auto-select Google Meet and Gmail
    if (selectedOption && selectedOption.value === "Google Agenda" && !isAuth) {
      googleLogin();

      // Auto-select "Google Meet" in visioconferenceLinks
      if (
        !visioconferenceLinks.some((link) => link.platform === "Google Meet")
      ) {
        const updatedVisioconferenceLinks = [
          ...visioconferenceLinks,
          { platform: "Google Meet", value: googleFullName },
        ];
        setVisioconferenceLinks(updatedVisioconferenceLinks);
      }

      // Auto-select "Gmail" in emailLinks
      if (!emailLinks.some((link) => link.platform === "Gmail")) {
        const updatedEmailLinks = [
          ...emailLinks,
          { platform: "Gmail", value: emailGmail },
        ];
        setEmailLinks(updatedEmailLinks);
      }
    }
  };

  const handleSelectvisioconferenceChange = (index, selectedOption) => {
    const updatedVisioconferenceLinks = [...visioconferenceLinks];
    updatedVisioconferenceLinks[index].platform = selectedOption
      ? selectedOption.value
      : "";
    setVisioconferenceLinks(updatedVisioconferenceLinks);

    if (selectedOption && selectedOption.value === "Google Meet" && !isAuth) {
      googleLogin();

      // Retrieve the value of Google Meet
      // const meetValue = updatedVisioconferenceLinks[index].value || "https://meet.google.com";
      const meetValue =
        updatedVisioconferenceLinks[index].value || googleFullName;

      // Auto-select "Google Agenda" in integrationLinks
      if (!integrationLinks.some((link) => link.platform === "Google Agenda")) {
        const updatedIntegrationLinks = [
          ...integrationLinks,
          { platform: "Google Agenda", value: meetValue },
        ];
        setIntegrationLinks(updatedIntegrationLinks);
      }

      // Auto-select "Gmail" in emailLinks
      if (!emailLinks.some((link) => link.platform === "Gmail")) {
        const updatedEmailLinks = [
          ...emailLinks,
          { platform: "Gmail", value: meetValue },
        ];
        setEmailLinks(updatedEmailLinks);
      }
    }
  };

  const handleSelectEmailChange = (index, selectedOption) => {
    const updatedEmailLinks = [...emailLinks];
    updatedEmailLinks[index].platform = selectedOption
      ? selectedOption.value
      : "";
    setEmailLinks(updatedEmailLinks);

    if (selectedOption && selectedOption.value === "Gmail" && !isAuth) {
      googleLogin();

      // Retrieve the value of Gmail
      const gmailValue = updatedEmailLinks[index].value || googleFullName;

      // Auto-select "Google Agenda" in integrationLinks
      if (!integrationLinks.some((link) => link.platform === "Google Agenda")) {
        const updatedIntegrationLinks = [
          ...integrationLinks,
          { platform: "Google Agenda", value: gmailValue },
        ];
        setIntegrationLinks(updatedIntegrationLinks);
      }

      // Auto-select "Google Meet" in visioconferenceLinks
      if (
        !visioconferenceLinks.some((link) => link.platform === "Google Meet")
      ) {
        const updatedVisioconferenceLinks = [
          ...visioconferenceLinks,
          { platform: "Google Meet", value: gmailValue },
        ];
        setVisioconferenceLinks(updatedVisioconferenceLinks);
      }
    }
  };

  // End integration select opion

  const handleWebsiteChange = (index, event) => {
    const { name, value } = event.target;
    const updatedWebsites = [...websites];
    // updatedWebsites[index][name] = value;
    // setWebsites(updatedWebsites);

    // If the link is a YouTube link, convert it to the embed format
    if (name === "link" && value.includes("youtube.com/watch")) {
      const url = new URL(value);
      const videoId = url.searchParams.get("v");
      if (videoId) {
        updatedWebsites[index][
          name
        ] = `https://www.youtube.com/embed/${videoId}`;
      } else {
        updatedWebsites[index][name] = value;
      }
    } else {
      updatedWebsites[index][name] = value;
    }

    setWebsites(updatedWebsites);
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const maxLength = 800;

  const togglePasswordVisibility = (setShowFunction, showState) => {
    setShowFunction(!showState);
  };

  const [visibility, setVisibility] = useState("public");
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [availableTeams, setAvailableTeams] = useState([]);
  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
  };

  // const handleTeamSelect = (teamId) => {
  //   const id = parseInt(teamId);
  //   // Add the team ID to selectedTeams if it's not already selected
  //   if (!selectedTeams.includes(id)) {
  //     setSelectedTeams([...selectedTeams, id]);
  //   }
  // };
  const handleTeamSelect = (teamId) => {
    const id = parseInt(teamId);
    const selectedTeam = availableTeams.find((team) => team.id === id);

    // Add the team object to selectedTeams if it's not already selected
    if (selectedTeam && !selectedTeams.some((team) => team.value === id)) {
      setSelectedTeams([
        ...selectedTeams,
        { value: id, label: selectedTeam.name },
      ]);
    }
  };

  const removeTeam = (teamId) => {
    // Remove the team from selectedTeams based on the `value` field
    setSelectedTeams(selectedTeams.filter((team) => team.value !== teamId));
  };
  // const removeTeam = (teamId) => {
  //   // Remove the team ID from selectedTeams
  //   setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
  // };

  const [videoPreview, setVideoPreview] = useState(null);
  const videoFileInputRef = useRef(null);
  useEffect(() => {
  }, [videoFileInputRef]);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;

      if (
        (fileType === "video/mp4" || fileType === "video/x-m4v") &&
        file.size <= 50 * 1024 * 1024
      ) {
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(file);

        videoElement.onloadedmetadata = () => {
          const duration = videoElement.duration; // Duration in seconds
          if (duration <= 120) {
            // 2 minutes = 120 seconds
            setVideoPreview(videoElement.src);
          } else {
            alert("Please upload a video shorter than 2 minutes.");
          }
        };
      } else {
        alert("Please upload a valid MP4 file up to 50MB.");
      }
    }
  };
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


  const handleVideoRemove = async () => {
    // setVideoPreview(null);
    try {
      const formDataInstance = new FormData();

      // Handle profile image
      if (profile.startsWith("data:image/")) {
        const response = await fetch(profile);
        const blob = await response.blob();
        formDataInstance.append("image", blob, "profile-image.jpg");
      } else {
        formDataInstance.append("image", profile);
      }

      formDataInstance.append("name", formData.name || "");
      formDataInstance.append("last_name", formData.last_name || "");
      formDataInstance.append("nick_name", formData.nick_name || "");
      formDataInstance.append("email", formData.email || "");
      formDataInstance.append("phoneNumber", formData.phoneNumber || "");
      formDataInstance.append("enterprise_id", formData.enterprise_id || "");
      formDataInstance.append("bio", formData.bio || "");
      formDataInstance.append("post", formData.post || "");
      formDataInstance.append("role_id", user?.role_id || "");
      formDataInstance.append("timezone",  userTimeZone || "Europe/Paris");


      // socialLinks.forEach((link, index) => {
      //   formDataInstance.append(
      //     `social_links[${index}][platform]`,
      //     link.platform
      //   );
      //   formDataInstance.append(`social_links[${index}][link]`, link.link);
      // });

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
          googleFullName
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
          visioGoogleMeet
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
        formDataInstance.append(`email_links[${index}][value]`, emailGmail);
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

      // formDataInstance.append("socialLinks", JSON.stringify(socialLinks || []));
      // formDataInstance.append("websites", JSON.stringify(websites || []));

      // Handle video
      formDataInstance.append("video", null);

      formDataInstance.append("current_password", currentPassword || "");
      formDataInstance.append("password", newPassword || "");
      formDataInstance.append("password_confirmation", retypePassword || "");

      formDataInstance.append("visibility", visibility || "public");
      formDataInstance.append("_method", "put");

      // Conditionally append teams
      // if (visibility === "team") {
      // formDataInstance.append("team_id", JSON.stringify(selectedTeams || []));
      // const teamArray = selectedTeams || [];
      // teamArray.forEach((teamId) => {
      //   formDataInstance.append("team_id[]", teamId);
      // });
      // }

      const teamIds = Array.isArray(formData.team_id)
        ? formData.team_id
        : formData.team_id.split(",").map((id) => parseInt(id.trim()));

      teamIds.forEach((teamId) => {
        formDataInstance.append("team_id[]", teamId);
      });
      // formDataInstance.append("team_id", teamIds);

      const response = await fetch(`${API_BASE_URL}/users/${userID}`, {
        method: "POST",
        body: formDataInstance,
        headers: {
          // "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result) {
        refreshUserData();
        setProfileImage(result?.data?.data?.image);
      } else {
        console.error("Profile image is undefined in the response");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setVideoPreview(null);

      // setLoading(false);
    }
  };

  const handleChangeVideoClick = () => {
    if (videoFileInputRef.current) {
      videoFileInputRef.current.click();
    } else {
      console.error("Video file input reference is null.");
    }
  };

  const [profile, setProfile] = useState(
    user?.image || "https://via.placeholder.com/150"
  );

  const fileInputRef = useRef(null);

  const handleChangeProfileClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
    event.target.value = "";
  };

  const [profileBanner, setProfileBanner] = useState(user?.profile_banner || null)
  const bannerInputRef = useRef(null);

  const handleModalClose = () => {
    setShowModal(false);
  };
  const handleChangeBannerClick = (e) => {
    e.stopPropagation();
    bannerInputRef.current.click();
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      setShowModal(true);
      reader.onloadend = () => {
        setProfileBanner(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
    event.target.value = "";
  };


  // const imageUrl = URL.createObjectURL(file);
  //     setImage(imageUrl);
  //     setShowModal(true);
  const handleRemoveProfileClick = (e) => {
    e.stopPropagation();
    setProfile("https://via.placeholder.com/150");
  };

  const [activeKey, setActiveKey] = useState("personalInfo");
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
    address: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length === maxLength) {
      toast.info("Your bio can contain a maximum of 800 characters");
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectInputChange = (selectedOptions, action) => {
    if (action.name === "team_id") {
      const selectedTeams = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];
      setFormData({
        ...formData,
        team_id: selectedTeams,
      });
      setSelectedTeams(selectedOptions);
    }
  };

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

  const teamOptions = teams?.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  useEffect(() => {
    if (user || teams) {
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
        address: user?.address || "",
      });
      setTitle(user?.title);
      setSelectedTeams(
        user?.teams?.map((team) => ({
          value: team.id,
          label: team.name,
        }))
      );

      const userSocialLinks = user?.social_links || [];
      const userIntegrationLinks = user?.integration_links || [];
      const userVisioconferenceLinks = user?.visioconference_links || [];
      const userEmailLinks = user?.email_links || [];
      const userWebsites = user?.websites || [];
      const userAffiliationLinks = user?.affiliation_links || [];
      const userProducts = user?.products || [];

      setSocialLinks(userSocialLinks);
      setVisibility(user?.visibility);
      setIntegrationLinks(
        userIntegrationLinks.length > 0 ? userIntegrationLinks : []
      );
      setVisioconferenceLinks(
        userVisioconferenceLinks.length > 0 ? userVisioconferenceLinks : []
      );
      setEmailLinks(userEmailLinks.length > 0 ? userEmailLinks : []);
      setWebsites(userWebsites.length > 0 ? userWebsites : []);
      setAffilicationLinks(
        userAffiliationLinks.length > 0 ? userAffiliationLinks : []
      );
      setProducts(userProducts.length > 0 ? userProducts : []);

      setVideoPreview(user?.video);
      const userTeams = teams || [];
      setAvailableTeams(userTeams);
    }
  }, [user, teams]);

  const payload = {
    image: profile,
    name: formData.name,
    last_name: formData.last_name,
    nick_name: formData.nick_name,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
    enterprise_id: formData.enterprise_id,
    bio: formData.bio,
    post: formData.post,
    social_links: socialLinks,
    websites: websites,
    products: products,
    video: videoPreview,
    current_password: currentPassword,
    new_password: newPassword,
    retype_password: retypePassword,
    visibility: visibility,
    title: title,
    address: formData.address,
  };

  if (visibility === "team") {
    payload.team_id = selectedTeams;
  }

  const userID = parseInt(CookieService.get("user_id"));

  const logoutUser = () => {
    CookieService.remove("isSignedIn");
    CookieService.clear();
    navigate("/");
  };

  const handleNextTab = () => {
    const tabsOrder = ["personalInfo", "socialProfiles", "presentation", "privacy", "changePassword"];
    const currentIndex = tabsOrder.indexOf(activeKey);
    if (currentIndex < tabsOrder.length - 1) {
      setActiveKey(tabsOrder[currentIndex + 1]);
    }
  }

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
      formDataInstance.append("address", formData.address || "");
      formDataInstance.append("role_id", user?.role_id || "");
      formDataInstance.append("timezone",  userTimeZone || "Europe/Paris");

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
        refreshUserData();
        setUser(result?.data?.data);
        setCallUser((prev)=>!prev)
        setProfileImage(result?.data?.data?.image);
        handleNextTab();
        if (formData.email !== user.email) {
          logoutUser();
        }
      } else {
        console.error("Profile image is undefined in the response");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  //Handle Save and Quit
  const handleProfileQuit = async () => {
    try {
      setLoadingQuit(true);
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
      formDataInstance.append("address", formData.address || "");
      formDataInstance.append("role_id", user?.role_id || "");
      formDataInstance.append("timezone",  userTimeZone || "Europe/Paris");

      socialLinks?.forEach((link, index) => {
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

      websites?.forEach((site, index) => {
        if (site.id) {
          // Existing link (include ID)
          formDataInstance.append(`websites[${index}][id]`, site.id);
        }
        formDataInstance.append(`websites[${index}][title]`, site.title);
        formDataInstance.append(`websites[${index}][link]`, site.link);
      });

      affiliationLinks?.forEach((site, index) => {
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
        setProfileImage(result?.data?.data?.image);
        refreshUserData();
        setUser(result?.data?.data);
        setCallUser((prev)=>!prev)

        if (formData.email !== user.email) {
          logoutUser();
        }
        setView(false);
      } else {
        console.error("Profile image is undefined in the response");
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoadingQuit(false);
    }
  };


  const handlePassword = async () => {
    // Check if the password contains any blank spaces
    if (/\s/.test(newPassword)) {
      toast.error(t("profile.passwordSpacesMsg"));
      return;
    }
    // Check if the password length is at least 8 characters
    if (newPassword.length < 8) {
      toast.error(t("profile.passwordLengthMsg"));
      return;
    }
    if (newPassword !== retypePassword) {
      toast.error(t("profile.samePasswordMsg"));
      return;
    }

    try {
      const payload = {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: retypePassword,
        user_id: userID,
        _method: "put",
      };

      const response = await axios.post(
        `${API_BASE_URL}/users/password/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate("/");
    } catch (error) {
      toast.error(t(`profile.${error?.response?.data?.message}`));
      console.log("Error:", error);
    }
  };

  return (
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
            <Col
              lg={3}
              xs={12}
              md={4}
              className="text-center mb-4 profile-img-section"
            >
              <Card
                onClick={handleChangeProfileClick}
                style={{ cursor: "pointer" }}
              >
                <Card.Img
                  variant="top"
                  src={
                    profile?.startsWith("users/")
                      ? Assets_URL + "/" + profile
                      : profile
                  }
                  className="img-fluid"
                  alt="Profile"
                />
                <Card.Body className="profile-buttons">
                  <Button
                    className="change-profile-btn"
                    onClick={handleChangeProfileClick}
                  >
                    {t("profile.buttons.changeProfile")}
                  </Button>
                  <Button
                    className="remove-profile-btn"
                    onClick={handleRemoveProfileClick}
                  >
                    {t("profile.buttons.removeProfile")}
                  </Button>
                </Card.Body>
              </Card>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Col>

            {/* Main Content */}
            <Col lg={9} xs={12} md={8}>
              <Tab.Container defaultActiveKey="personalInfo">
                <Nav
                  variant="tabs"
                  className="mb-3 profile-navs"
                  activeKey={activeKey}
                  onSelect={(selectedKey) => setActiveKey(selectedKey)}
                >
                  <Nav.Item>
                    <Nav.Link
                      eventKey="personalInfo"
                      className={
                        activeKey === "personalInfo" ? "active-tab" : ""
                      }
                    >
                      <span>
                        <CgProfile size={22} />
                        {t("profile.personalInfo")}
                      </span>
                    </Nav.Link>
                  </Nav.Item>


                  <Nav.Item>
                    <Nav.Link
                      eventKey="socialProfiles"
                      className={
                        activeKey === "socialProfiles" ? "active-tab" : ""
                      }
                    >
                      <span>
                        <IoShareSocialOutline size={22} />
                        {t("profile.socialProfiles")}
                      </span>
                    </Nav.Link>
                  </Nav.Item>


{/*                   <Nav.Item>
                    <Nav.Link
                      eventKey="integration"
                      className={
                        activeKey === "integration" ? "active-tab" : ""
                      }
                    >
                      <span>
                        <IoMdSync size={22} />
                        {t("profile.integration")}
                      </span>
                    </Nav.Link>
                  </Nav.Item> */}

                  <Nav.Item>
                    <Nav.Link
                      eventKey="presentation"
                      className={
                        activeKey === "presentation" ? "active-tab" : ""
                      }
                    >
                      <span>
                        <IoPlayOutline size={22} />
                        {t("profile.presentation")}
                      </span>
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link
                      eventKey="privacy"
                      className={activeKey === "privacy" ? "active-tab" : ""}
                    >
                      <span>
                        <MdOutlinePrivacyTip size={22} />
                        {t("profile.privacy")}
                      </span>
                    </Nav.Link>
                  </Nav.Item>


                  <Nav.Item>
                    <Nav.Link
                      eventKey="changePassword"
                      className={
                        activeKey === "changePassword" ? "active-tab" : ""
                      }
                    >
                      <span>
                        <RiLockPasswordLine size={22} />
                        {t("profile.changePassword")}
                      </span>
                    </Nav.Link>
                  </Nav.Item>

{/*                     <Nav.Item>
                    <Nav.Link
                      eventKey="settings"
                      className={activeKey === "settings" ? "active-tab" : ""}
                    >
                      <span>
                        <CiSettings size={22} />
                        {t("profile.settings")}
                      </span>
                    </Nav.Link>
                  </Nav.Item> */}
                </Nav>

                <Tab.Content className="profile-nav-content">
                  {/* Personal Info Tab */}
                  {activeKey === "personalInfo" &&
                    <div
                      eventKey="personalInfo"
                      className="form personal-info-form"
                    >
                      <Card>
                        <Form>
                          <h5 className="profile-font">
                            {t("profile.personalInfo")}
                          </h5>
                          <small>{t("profile.personalInfoSubtext")}</small>
                          <Row className="mt-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.fname")} *</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("profile.fname")}
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.name")} *</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="last_name"
                                  placeholder={t("profile.name")}
                                  value={formData.last_name}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.nickname")}</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="nick_name"
                                  placeholder={t("profile.nickname")}
                                  value={formData.nick_name}
                                  disabled
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.company")}</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="enterprise_id"
                                  placeholder={t("profile.company")}
                                  value={user?.enterprise?.name}
                                  disabled
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.job")}</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="post"
                                  placeholder="CEO"
                                  value={formData.post}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.team")}</Form.Label>
                                <Select
                                  className="react-select"
                                  id="teamSelect"
                                  isMulti
                                  name="team_id"
                                  isDisabled={
                                    getUserRoleID() === 4 ? true : false
                                  }
                                  options={
                                    Array.isArray(teamOptions) &&
                                      teams?.length > 0
                                      ? teamOptions
                                      : []
                                  }
                                  value={selectedTeams}
                                  onChange={handleSelectInputChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Form>
                      </Card>

                      <Card className="mt-3">
                        <Form>
                          <h5 className="profile-font">
                            {t("profile.contactInfo")}
                          </h5>
                          <small>{t("profile.contactInfoSubtext")}</small>

                          <Row className="mt-3">
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Email *</Form.Label>
                                <Form.Control
                                  type="email"
                                  placeholder="Email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.phone")}</Form.Label>
                                <PhoneInput
                                  style={{
                                    padding: "7px 8px",
                                  }}
                                  className="form-control"
                                  international
                                  defaultCountry="FR"
                                  placeholder="+33 234 345 3456"
                                  value={formData.phoneNumber}
                                  onChange={(value) =>
                                    setFormData({
                                      ...formData,
                                      phoneNumber: value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>{t("profile.address")}</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={1}
                                  placeholder={t("profile.address")}
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Form>
                      </Card>


                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        onClick={handleProfileQuit}
                        disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>

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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button>

                    </div>
                  }
                  {/* Social Info Tab */}
                  {activeKey === "socialProfiles" &&
                    <div eventKey="socialProfiles" className="form">
                      <Card>
                        <h5 className="profile-font">
                          {t("profile.socialProfiles")}
                        </h5>
                        <small>{t("profile.socialProfilesSubtext")}</small>

                        <Row className="mt-3 social-info-row">
                          <h6>{t("profile.socialMedia")}</h6>
                          {socialLinks?.map((social, index) => (
                            <Row key={index} className="mb-3 align-items-center">
                              <Col md={4}>
                                <Select
                                  name="platform"
                                  options={options}
                                  value={options.find(
                                    (option) => option.value === social.platform
                                  )}
                                  onChange={(selectedOption) =>
                                    handleSelectChange(index, selectedOption)
                                  }
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Control
                                  type="text"
                                  name="link"
                                  // placeholder="https://www.linkedin.com/in/mo/"
                                  value={social.link}
                                  onChange={(e) => handleSocialChange(index, e)}
                                />
                              </Col>
                              <Col md={2}>
                                <Button
                                  onClick={() => removeSocialLink(social, index)}
                                  style={{
                                    color: "#BB372F",
                                    background: "white",
                                    outline: "none",
                                    border: "none",
                                  }}
                                >
                                  <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                  &nbsp; {t("profile.remove")}
                                </Button>
                              </Col>
                            </Row>
                          ))}
                          <Button
                            className="add-social-link"
                            onClick={addSocialLink}
                          >
                            + {t("profile.add")}
                          </Button>

                          <h6 className="mt-4">Sites</h6>
                          {websites?.map((website, index) => (
                            <Row key={index} className="mb-3 align-items-center">
                              <Col md={4}>
                                <Form.Control
                                  type="text"
                                  name="title"
                                  // placeholder="Behance"
                                  value={website.title}
                                  onChange={(e) => handleWebsiteChange(index, e)}
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Control
                                  type="text"
                                  name="link"
                                  // placeholder="www.behance.net/mo"
                                  value={website.link}
                                  onChange={(e) => handleWebsiteChange(index, e)}
                                />
                              </Col>
                              <Col md={2}>
                                <Button
                                  onClick={() => removeWebsite(website, index)}
                                  style={{
                                    color: "#BB372F",
                                    background: "white",
                                    outline: "none",
                                    border: "none",
                                  }}
                                >
                                  <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                  &nbsp; {t("profile.remove")}
                                </Button>
                              </Col>
                            </Row>
                          ))}
                          <Button
                            className="add-social-link"
                            onClick={addWebsite}
                          >
                            + {t("profile.add")}
                          </Button>

                          <h6 className="mt-4">{t("profile.Affiliation")}</h6>
                          {affiliationLinks?.map((affiliationLink, index) => (
                            <Row key={index} className="mb-3 align-items-center">
                              <Col md={4}>
                                <Form.Control
                                  type="text"
                                  name="title"
                                  // placeholder="Behance"
                                  value={affiliationLink.title}
                                  onChange={(e) =>
                                    handleAffiliationLinkChange(index, e)
                                  }
                                />
                              </Col>
                              <Col md={6}>
                                <Form.Control
                                  type="text"
                                  name="link"
                                  // placeholder="www.behance.net/mo"
                                  value={affiliationLink.link}
                                  onChange={(e) =>
                                    handleAffiliationLinkChange(index, e)
                                  }
                                />
                              </Col>
                              <Col md={2}>
                                <Button
                                  onClick={() =>
                                    removeAffiliationLinks(affiliationLink, index)
                                  }
                                  style={{
                                    color: "#BB372F",
                                    background: "white",
                                    outline: "none",
                                    border: "none",
                                  }}
                                >
                                  <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                  &nbsp; {t("profile.remove")}
                                </Button>
                              </Col>
                            </Row>
                          ))}
                          <Button
                            className="add-social-link"
                            onClick={addAffiliationLinks}
                          >
                            + {t("profile.add")}
                          </Button>

                          <h6 className="mt-4">{t("profile.products")}</h6>
                          {products?.map((product, index) => (
                            <>
                              <Row
                                key={index}
                                className="mb-3 align-items-center"
                              >
                                <Col md={12}>
                                  <Row className="align-items-center">
                                    <Col md={10}>
                                      <Row className="mb-3">
                                        <Col md={12}>
                                          <Form.Control
                                            type="text"
                                            name="product_title"
                                            // placeholder="Behance"
                                            value={product.product_title}
                                            onChange={(e) =>
                                              handleProductChange(index, e)
                                            }
                                          />
                                        </Col>
                                      </Row>
                                      <Row className="mb-3">
                                        <Col md={12}>
                                          <Form.Control
                                            as="textarea"
                                            name="product_description"
                                            rows={5}
                                            // placeholder="descti"
                                            value={product.product_description}
                                            onChange={(e) =>
                                              handleProductChange(index, e)
                                            }
                                          />
                                        </Col>
                                      </Row>

                                      <Row className="mb-3">
                                        <Col md={12}>
                                          {/* <Form.Control
                                          type="file"
                                          name="product_image"
                                          onChange={(e) =>
                                            handleProductImageChange(index, e)
                                          }
                                          

                                        /> */}
                                          <label
                                            htmlFor={`fileId-${index}`}
                                            className="custom-label"
                                          >
                                            <MdOutlineFileUpload className="upload__icon" />
                                            <h6>Upload Image</h6>
                                          </label>
                                          <input
                                            type="file"
                                            id={`fileId-${index}`}
                                            className="custom-field"
                                            name="product_image"
                                            onChange={(e) =>
                                              handleProductImageChange(index, e)
                                            }
                                          />
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col md={10}>
                                          <img
                                            // src={
                                            //   Assets_URL +
                                            //   "/" +
                                            //   product?.product_image
                                            // }
                                            src={
                                              product?.product_image?.startsWith(
                                                "images/"
                                              )
                                                ? Assets_URL +
                                                "/" +
                                                product?.product_image
                                                : product?.product_image
                                            }
                                            width="100px"
                                            alt={product?.product_image}
                                          />
                                        </Col>
                                      </Row>
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() =>
                                          removeProduct(product, index)
                                        }
                                        style={{
                                          color: "#BB372F",
                                          background: "white",
                                          outline: "none",
                                          border: "none",
                                        }}
                                      >
                                        <RiDeleteBin5Line
                                          size={22}
                                          color={"#BB372F"}
                                        />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </>
                          ))}
                          <Button
                            className="add-social-link"
                            onClick={addProduct}
                          >
                            + {t("profile.add")}
                          </Button>
                        </Row>
                      </Card>
                      {/* {loading ? (
                      <>
                        <Button
                          variant="dark"
                          disabled
                          style={{
                            backgroundColor: "#3aa5ed",
                            border: "none",
                            padding: "10px 39px",
                          }}
                          className="mt-4"
                        >
                          <Spinner
                            as="span"
                            variant="light"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            animation="border"
                          />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        className="mt-4 social-info-update"
                        type="submit"
                        onClick={handleProfile}
                      >
                        {t("profile.buttons.update")}
                      </Button>
                    )} */}
                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        onClick={handleProfileQuit}
                        disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>

                      <Button
                        variant="primary"
                        className="mt-4 social-info-update"
                        type="submit"
                        // onClick={handleProfile}
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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button>
                    </div>
                  }

                  {/* Password Info Tab */}
                  {activeKey === "changePassword" &&
                    <div eventKey="changePassword" className="form">
                      <Card>
                        <h5 className="profile-font">
                          {t("profile.changePassword")}
                        </h5>
                        <small>{t("profile.changePasswordSubtext")}</small>

                        <Form className="mt-3">
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Label>
                                {t("profile.currentPassword")}
                              </Form.Label>
                              <InputGroup>
                                <div
                                  style={{ position: "relative", width: "100%" }}
                                >
                                  <Form.Control
                                    type={
                                      showCurrentPassword ? "text" : "password"
                                    }
                                    value={currentPassword}
                                    onChange={(e) =>
                                      setCurrentPassword(e.target.value)
                                    }
                                    placeholder={t("profile.currentPassword")}
                                    style={{
                                      paddingRight: "2.5rem",
                                    }}
                                  />
                                  <InputGroup.Text
                                    onClick={() =>
                                      togglePasswordVisibility(
                                        setShowCurrentPassword,
                                        showCurrentPassword
                                      )
                                    }
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      cursor: "pointer",
                                      border: "none",
                                      backgroundColor: "transparent",
                                    }}
                                  >
                                    {showCurrentPassword ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </InputGroup.Text>
                                </div>
                              </InputGroup>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Label>{t("profile.newPassword")}</Form.Label>
                              <InputGroup>
                                <div
                                  style={{ position: "relative", width: "100%" }}
                                >
                                  <Form.Control
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                      setNewPassword(e.target.value)
                                    }
                                    placeholder={t("profile.newPassword")}
                                  />
                                  <InputGroup.Text
                                    onClick={() =>
                                      togglePasswordVisibility(
                                        setShowNewPassword,
                                        showNewPassword
                                      )
                                    }
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      cursor: "pointer",
                                      border: "none",
                                      backgroundColor: "transparent",
                                    }}
                                  >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                  </InputGroup.Text>
                                </div>
                              </InputGroup>
                            </Col>

                            <Col md={6}>
                              <Form.Label>
                                {t("profile.reTypePassword")}
                              </Form.Label>
                              <InputGroup>
                                <div
                                  style={{ position: "relative", width: "100%" }}
                                >
                                  <Form.Control
                                    type={
                                      showRetypePassword ? "text" : "password"
                                    }
                                    value={retypePassword}
                                    onChange={(e) =>
                                      setRetypePassword(e.target.value)
                                    }
                                    placeholder={t("profile.reTypePassword")}
                                  />
                                  <InputGroup.Text
                                    onClick={() =>
                                      togglePasswordVisibility(
                                        setShowRetypePassword,
                                        showRetypePassword
                                      )
                                    }
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      cursor: "pointer",
                                      border: "none",
                                      backgroundColor: "transparent",
                                    }}
                                  >
                                    {showRetypePassword ? (
                                      <FaEyeSlash />
                                    ) : (
                                      <FaEye />
                                    )}
                                  </InputGroup.Text>
                                </div>
                              </InputGroup>
                            </Col>
                          </Row>
                        </Form>
                      </Card>
                      {/* <Button
                      className="mt-4 social-info-update"
                      type={"submit"}
                      onClick={handlePassword}
                    >
                     {t("profile.saveandquit")}
                    </Button> */}
                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        // onClick={handleProfileQuit}
                        onClick={handlePassword}
                      // disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>


                    </div>
                  }

                  {/* Privacy Info Tab */}
                  {activeKey === "privacy" &&
                    <div eventKey="privacy" className="form">
                      <Card>
                        <h5 className="profile-font">
                          {t("profile.privacyHeading")}
                        </h5>
                        <small>{t("profile.privacySubtext")}</small>
                        <Form className="mt-3">
                          <Form.Group>
                            <div className="d-flex flex-column gap-3">
                              <Form.Group>
                                <Form.Check
                                  type="radio"
                                  label={t("profile.public")}
                                  value="public"
                                  checked={visibility === "public"}
                                  onChange={handleVisibilityChange}
                                />
                                <Form.Text
                                  className="text-muted"
                                  style={{ marginLeft: "1.5rem" }}
                                >
                                  {t("profile.publicSubText")}
                                </Form.Text>
                              </Form.Group>

                              <Form.Group>
                                <Form.Check
                                  type="radio"
                                  label={t("profile.enterprise")}
                                  value="enterprise"
                                  checked={visibility === "enterprise"}
                                  onChange={handleVisibilityChange}
                                />
                                <Form.Text
                                  className="text-muted"
                                  style={{ marginLeft: "1.5rem" }}
                                >
                                  {t("profile.enterpriseSubText")}
                                </Form.Text>
                              </Form.Group>

                              <Form.Group>
                                <Form.Check
                                  type="radio"
                                  label={t("profile.team")}
                                  value="team"
                                  checked={visibility === "team"}
                                  onChange={handleVisibilityChange}
                                />
                                <Form.Text
                                  className="text-muted"
                                  style={{ marginLeft: "1.5rem" }}
                                >
                                  {t("profile.TeamSubText")}
                                </Form.Text>
                              </Form.Group>
                              {visibility === "team" && (
                                <div className="mt-3 teams">
                                  <DropdownButton
                                    id="team-dropdown"
                                    title={
                                      <span className="d-flex align-items-center justify-content-between">
                                        <div>
                                          <FaUserGroup className="me-2" />{" "}
                                          {t("profile.teams")}
                                        </div>
                                        <span>
                                          <GoPlus />
                                        </span>
                                      </span>
                                    }
                                    variant="outline-primary"
                                    className="mb-3 select-team"
                                    onSelect={handleTeamSelect} // Use `onSelect` here
                                  >
                                    {availableTeams?.map((team, index) => {
                                      // Check if the current team is selected by matching the `id` with `value`
                                      const isSelected = selectedTeams?.some(
                                        (selectedTeam) =>
                                          selectedTeam.value === team.id
                                      );

                                      return (
                                        <Dropdown.Item
                                          key={index}
                                          eventKey={team?.id?.toString()} // Convert the ID to a string for Dropdown
                                          disabled={isSelected} // Disable if already selected
                                        >
                                          {team?.name}
                                        </Dropdown.Item>
                                      );
                                    })}
                                  </DropdownButton>

                                  <div className="all-teams">
                                    <h6>
                                      {selectedTeams?.length > 0 &&
                                        selectedTeams?.length}{" "}
                                      {t("profile.teamsAdded")}
                                    </h6>
                                    {selectedTeams.length === 0 && (
                                      <h5>{t("profile.noTeamsAdded")}</h5>
                                    )}

                                    {selectedTeams?.map((selectedTeam, index) => {

                                      // Find the team details by ID
                                      const team = availableTeams.find(
                                        (team) => team.id === selectedTeam.value
                                      );

                                      // Render the team details
                                      return team ? (
                                        <React.Fragment key={index}>
                                          <Row className="align-items-center mt-4">
                                            <Col xs={8}>
                                              <p className="mb-0 team-name">
                                                {index + 1}. &nbsp;
                                                <img
                                                  src={
                                                    team.logo
                                                      ? Assets_URL +
                                                      "/" +
                                                      team.logo
                                                      : "/Assets/tektime.png"
                                                  } // Display the team's logo or fallback to a default image
                                                  width="24px"
                                                  height="30px"
                                                  alt=""
                                                  style={{ objectFit: "contain" }}
                                                  className="img-fluid"
                                                />
                                                &nbsp; {team.name}
                                              </p>
                                            </Col>
                                            <Col xs={4} className="text-end">
                                              <Button
                                                size="sm"
                                                onClick={() =>
                                                  removeTeam(team.id)
                                                }
                                                style={{
                                                  background: "#BB372F1A",
                                                  borderRadius: "8px",
                                                  border: "none",
                                                  outline: "none",
                                                }}
                                              >
                                                <RiDeleteBin5Line
                                                  size={22}
                                                  color={"#BB372F"}
                                                />
                                              </Button>
                                            </Col>
                                          </Row>
                                          <hr></hr>
                                        </React.Fragment>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                              <Form.Group>
                                <Form.Check
                                  type="radio"
                                  label={t("profile.private")}
                                  value="private"
                                  checked={visibility === "private"}
                                  onChange={handleVisibilityChange}
                                />
                                <Form.Text
                                  className="text-muted"
                                  style={{ marginLeft: "1.5rem" }}
                                >
                                  {t("profile.privateSubText")}
                                </Form.Text>
                              </Form.Group>
                            </div>
                          </Form.Group>
                          {/* </Form> */}
                        </Form>
                      </Card>
                      {/* {loading ? (
                      <>
                        <Button
                          variant="dark"
                          disabled
                          style={{
                            backgroundColor: "#3aa5ed",
                            border: "none",
                            padding: "10px 39px",
                          }}
                          className="mt-4"
                        >
                          <Spinner
                            as="span"
                            variant="light"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            animation="border"
                          />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        className="mt-4 social-info-update"
                        type="submit"
                        onClick={handleProfile}
                      >
                        {t("profile.buttons.update")}
                      </Button>
                    )} */}
                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        onClick={handleProfileQuit}
                        disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>

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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button>
                    </div>
                  }

                  {/* Presentation Info Tab */}
                  {activeKey === "presentation" &&
                    <div eventKey="presentation" className="form">
                      <Form.Group>
                        <Form.Label style={{ fontWeight: 600 }}>
                          {t("TitleofVisitingCard")}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          className="mb-3"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </Form.Group>
                      <Card className="mt-3">
                        <Form>
                          <h5 className="profile-font">{t("profile.bio")}</h5>
                          <small>{t("profile.bioInfoSubtext")}</small>

                          <Form.Group className="mt-3">
                            <Form.Control
                              as="textarea"
                              rows={5}
                              placeholder={t("profile.bioInfoSubtext")}
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              maxLength={maxLength}
                            />
                            <div
                              className="text-start mt-1"
                              style={{ color: "#bababa", fontSize: "14px" }}
                            >
                              {formData.bio.length}/{maxLength}
                            </div>
                          </Form.Group>
                        </Form>
                      </Card>

                      <Card>
                        <h5 className="profile-font">
                          {t("profile.presentationHeading")}
                        </h5>
                        <small>{t("profile.presentationSubText")}</small>
                        <div className="mt-3">
                          {!videoPreview || videoPreview === "null" ? (
                            <div className="file-upload-wrapper">
                              <Form.Group
                                className="file-upload-area"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleVideoUpload({
                                    target: { files: e.dataTransfer.files },
                                  });
                                }}
                              >
                                <Form.Label
                                  className="file-upload-label"
                                  style={{ textAlign: "center" }}
                                >
                                  {t("profile.dragFile")}

                                  <br />
                                  <small className="file-upload-label-format">
                                    {t("profile.fileSize")}
                                  </small>
                                </Form.Label>
                                <Button
                                  variant="outline-primary"
                                  className="file-upload-button"
                                  onClick={handleChangeVideoClick}
                                >
                                  {t("profile.browseFile")}
                                </Button>
                                <Form.Control
                                  ref={videoFileInputRef}
                                  type="file"
                                  accept="video/mp4,video/x-m4v"
                                  // accept="video/mp4,video/x-m4v"
                                  onChange={handleVideoUpload}
                                  style={{ display: "none" }}
                                />
                              </Form.Group>
                            </div>
                          ) : (
                            <div className="text-center file-upload-wrapper">
                              <video
                                width="50%"
                                height="auto"
                                controls
                                src={
                                  videoPreview?.startsWith("users/")
                                    ? Assets_URL + "/" + videoPreview
                                    : videoPreview
                                }
                              />
                              <br />
                              <Button
                                variant="danger"
                                onClick={handleVideoRemove}
                                className="mt-2 remove-presentation-btn"
                              >
                                {t("profile.buttons.removeVideo")}
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleChangeVideoClick}
                                className="mt-2 ms-2 change-presentation-btn"
                              >
                                {t("profile.buttons.changeVideo")}
                              </Button>
                              <Form.Control
                                ref={videoFileInputRef}
                                type="file"
                                accept="video/mp4,video/x-m4v"
                                // accept="video/mp4,video/x-m4v"
                                onChange={handleVideoUpload}
                                style={{ display: "none" }}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                      <div className="description mt-3">
                        <label htmlFor="">{t("Presentation Banner")}</label>
                        <div
                          className="upload-container"
                          // onClick={!image ? triggerFileInput : null}
                          onClick={handleChangeBannerClick}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            border: "2px dashed #ccc",
                            textAlign: "center",
                            borderRadius: "5px",
                            height: "200px",
                            backgroundColor: "#f9f9f9", // Add some background to make the container stand out
                          }}
                        >
                          {!croppedimage || croppedimage === "null" ? (
                            <>
                              <IoImages
                                style={{ color: "#0026b1", fontSize: "24px" }}
                              />
                              <span
                                style={{
                                  fontSize: "15px",
                                  color: "#0026b1",
                                  marginLeft: "10px",
                                  fontWeight: "bold",
                                }}
                              >
                                {t("invities.uploadImg")}
                              </span>
                            </>
                          ) : (
                            <img
                              src={
                                croppedimage?.startsWith("users/")
                                  ? Assets_URL + "/" + croppedimage
                                  : croppedimage
                              }
                              alt="Selected"
                              style={{ width: "100%", height: "12.5rem" }}
                            />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}
                          style={{ display: "none" }}
                          ref={bannerInputRef}
                        />
                      </div>
                      {/* {loading ? (
                      <>
                        <Button
                          variant="dark"
                          disabled
                          style={{
                            backgroundColor: "#3aa5ed",
                            border: "none",
                            padding: "10px 39px",
                          }}
                          className="mt-4"
                        >
                          <Spinner
                            as="span"
                            variant="light"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            animation="border"
                          />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        className="mt-4 social-info-update"
                        type="submit"
                        onClick={handleProfile}
                      >
                        {t("profile.buttons.update")}
                      </Button>
                    )} */}
                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        onClick={handleProfileQuit}
                        disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>

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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button>
                    </div>
                  }

                  {/* Integration Info Tab */}
                  {activeKey === "integration" &&
                    <div eventKey="integration" className="form">
                      <Card>
                        <h5 className="profile-font">
                          {t("profile.integration")}
                        </h5>
                        <small>{t("profile.integrationSubtext")}</small>

                        <Row className="mt-3 social-info-row">
                          <h6>{t("profile.agenda")}</h6>
                          {/* {integrationLinks?.map((social, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={4}>
                              <Select
                                name="platform"
                                options={options1}
                                value={options1.find(
                                  (option) => option.value === social.platform
                                )}
                                onChange={(selectedOption) =>
                                  handleSelectintegrationChange(index, selectedOption)
                                }
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="link"
                                // placeholder="https://www.linkedin.com/in/mo/"
                                value={social.link}
                                onChange={(e) => handleIntegrationChange(index, e)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                onClick={() => removeIntegrationLinks(social, index)}
                                style={{
                                  color: "#BB372F",
                                  background: "white",
                                  outline: "none",
                                  border: "none",
                                }}
                              >
                                <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                &nbsp; {t("profile.remove")}
                              </Button>
                            </Col>
                          </Row>
                        ))} */}
                          {/* {integrationLinks?.map((social, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={4}>
                              <Select
                                name="platform"
                                options={options1}
                                value={options1.find(
                                  (option) => option.value === social.platform
                                )}
                                onChange={(selectedOption) =>
                                  handleSelectintegrationChange(index, selectedOption)
                                }
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="link"
                                // placeholder="https://www.linkedin.com/in/mo/"
                                value={social.link}
                                onChange={(e) => handleIntegrationChange(index, e)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                onClick={() => removeIntegrationLinks(social, index)}
                                style={{
                                  color: "#BB372F",
                                  background: "white",
                                  outline: "none",
                                  border: "none",
                                }}
                              >
                                <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                &nbsp; {t("profile.remove")}
                              </Button>
                            </Col>
                          </Row>
                        ))} */}

                          {/* outlook */}
                          {/* {integrationLinks?.map((social, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={4}>
                              <Select
                                name="platform"
                                options={options1}
                                value={options1.find((option) => option.value === social.platform)}
                                onChange={(selectedOption) => {
                                  handleSelectintegrationChange(index, selectedOption);

                                  // Check if "Outlook" is selected
                                  if (selectedOption.value === "Outlook") {
                                    initiateOutlookLogin();
                                  }
                                }}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="link"
                                value={social.link}
                                onChange={(e) => handleIntegrationChange(index, e)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                onClick={() => removeIntegrationLinks(social, index)}
                                style={{
                                  color: "#BB372F",
                                  background: "white",
                                  outline: "none",
                                  border: "none",
                                }}
                              >
                                <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                &nbsp; {t("profile.remove")}
                              </Button>
                            </Col>
                          </Row>
                        ))} */}
                          {/* end outlook */}

                          <div>
                            {integrationLinks?.map((integration, index) => {
                              const filteredOptions = options1.filter(
                                (option) =>
                                  !integrationLinks.some(
                                    (item, itemIndex) =>
                                      item.platform === option.value &&
                                      itemIndex !== index
                                  )
                              );

                              return (
                                <Row
                                  key={index}
                                  className="mb-3 align-items-center"
                                >
                                  <Col md={4}>
                                    <Select
                                      name="platform"
                                      options={filteredOptions}
                                      value={filteredOptions.find(
                                        (option) =>
                                          option.value === integration.platform
                                      )}
                                      onChange={(selectedOption) =>
                                        handleSelectintegrationChange(
                                          index,
                                          selectedOption
                                        )
                                      }
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Control
                                      type="text"
                                      name="link"
                                      // value={social.link || social.google_full_name || ""}
                                      value={integration.value || googleFullName}
                                      onChange={(e) =>
                                        handleIntegrationChange(index, e)
                                      }
                                    />
                                  </Col>
                                  <Col md={2}>
                                    <Button
                                      onClick={() =>
                                        removeIntegrationLinks(integration, index)
                                      }
                                      style={{
                                        color: "#BB372F",
                                        background: "white",
                                        outline: "none",
                                        border: "none",
                                      }}
                                    >
                                      <RiDeleteBin5Line
                                        size={22}
                                        color={"#BB372F"}
                                      />
                                      &nbsp; {t("profile.remove")}
                                    </Button>
                                  </Col>
                                </Row>
                              );
                            })}

                            {integrationLinks.length < options1.length && (
                              <Button
                                className="add-social-link"
                                onClick={addintegrationLinks}
                              >
                                + {t("profile.add")}
                              </Button>
                            )}
                          </div>

                          <h6>{t("profile.visioconferences")}</h6>
                          {/* {visioconferenceLinks?.map((social, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={4}>
                              <Select
                                name="platform"
                                options={options2}
                                value={options2.find(
                                  (option) => option.value === social.platform
                                )}
                                onChange={(selectedOption) =>
                                  handleSelectvisioconferenceChange(index, selectedOption)
                                }
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="link"
                                // placeholder="https://www.linkedin.com/in/mo/"
                                value={social.link}
                                onChange={(e) => handleVisioconferenceChange(index, e)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                onClick={() => removeVisioconferenceLinks(social, index)}
                                style={{
                                  color: "#BB372F",
                                  background: "white",
                                  outline: "none",
                                  border: "none",
                                }}
                              >
                                <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                &nbsp; {t("profile.remove")}
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        <Button
                          className="add-social-link"
                          onClick={addvisioconferenceLinks}
                        >
                          + {t("profile.add")}
                        </Button> */}
                          <div>
                            {visioconferenceLinks?.map(
                              (visioconference, index) => {
                                const filteredOptions = options2.filter(
                                  (option) =>
                                    !visioconferenceLinks.some(
                                      (item, itemIndex) =>
                                        item.platform === option.value &&
                                        itemIndex !== index
                                    )
                                );

                                return (
                                  <Row
                                    key={index}
                                    className="mb-3 align-items-center"
                                  >
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find(
                                          (option) =>
                                            option.value ===
                                            visioconference.platform
                                        )}
                                        onChange={(selectedOption) =>
                                          handleSelectvisioconferenceChange(
                                            index,
                                            selectedOption
                                          )
                                        }
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="link"
                                        value={
                                          visioconference.value || visioGoogleMeet
                                        }
                                        onChange={(e) =>
                                          handleVisioconferenceChange(index, e)
                                        }
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() =>
                                          removeVisioconferenceLinks(
                                            visioconference,
                                            index
                                          )
                                        }
                                        style={{
                                          color: "#BB372F",
                                          background: "white",
                                          outline: "none",
                                          border: "none",
                                        }}
                                      >
                                        <RiDeleteBin5Line
                                          size={22}
                                          color={"#BB372F"}
                                        />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              }
                            )}

                            {/* Conditionally render the add button based on length */}
                            {visioconferenceLinks.length < options2.length && (
                              <Button
                                className="add-social-link"
                                onClick={addvisioconferenceLinks}
                              >
                                + {t("profile.add")}
                              </Button>
                            )}
                          </div>

                          <h6>{t("profile.email")}</h6>
                          {/* {emailLinks?.map((social, index) => (
                          <Row key={index} className="mb-3 align-items-center">
                            <Col md={4}>
                              <Select
                                name="platform"
                                options={options3}
                                value={options3.find(
                                  (option) => option.value === social.platform
                                )}
                                onChange={(selectedOption) =>
                                  handleSelectEmailChange(index, selectedOption)
                                }
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Control
                                type="text"
                                name="link"
                                // placeholder="https://www.linkedin.com/in/mo/"
                                value={social.link}
                                onChange={(e) => handleEmailChange(index, e)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button
                                onClick={() => removeEmailLinks(social, index)}
                                style={{
                                  color: "#BB372F",
                                  background: "white",
                                  outline: "none",
                                  border: "none",
                                }}
                              >
                                <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                &nbsp; {t("profile.remove")}
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        <Button
                          className="add-social-link"
                          onClick={addemailLinks}
                        >
                          + {t("profile.add")}
                        </Button> */}
                          <div>
                            {emailLinks?.map((email, index) => {
                              const filteredOptions = options3.filter(
                                (option) =>
                                  !emailLinks.some(
                                    (item, itemIndex) =>
                                      item.platform === option.value &&
                                      itemIndex !== index
                                  )
                              );

                              return (
                                <Row
                                  key={index}
                                  className="mb-3 align-items-center"
                                >
                                  <Col md={4}>
                                    <Select
                                      name="platform"
                                      options={filteredOptions}
                                      value={filteredOptions.find(
                                        (option) =>
                                          option.value === email.platform
                                      )}
                                      onChange={(selectedOption) =>
                                        handleSelectEmailChange(
                                          index,
                                          selectedOption
                                        )
                                      }
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Control
                                      type="text"
                                      name="link"
                                      value={email.value || emailGmail}
                                      onChange={(e) =>
                                        handleEmailChange(index, e)
                                      }
                                    />
                                  </Col>
                                  <Col md={2}>
                                    <Button
                                      onClick={() =>
                                        removeEmailLinks(email, index)
                                      }
                                      style={{
                                        color: "#BB372F",
                                        background: "white",
                                        outline: "none",
                                        border: "none",
                                      }}
                                    >
                                      <RiDeleteBin5Line
                                        size={22}
                                        color={"#BB372F"}
                                      />
                                      &nbsp; {t("profile.remove")}
                                    </Button>
                                  </Col>
                                </Row>
                              );
                            })}

                            {/* Conditionally render the add button based on length */}
                            {emailLinks.length < options3.length && (
                              <Button
                                className="add-social-link"
                                onClick={addemailLinks}
                              >
                                + {t("profile.add")}
                              </Button>
                            )}
                          </div>
                        </Row>
                      </Card>
                      {/* {loadingQuit ? (
                      <>
                        <Button
                          variant="dark"
                          disabled
                          style={{
                            backgroundColor: "#3aa5ed",
                            border: "none",
                            padding: "10px 39px",
                          }}
                          className="mt-4"
                        >
                          <Spinner
                            as="span"
                            variant="light"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            animation="border"
                          />
                        </Button>
                      </>
                    ) : ( */}
                      <Button
                        variant="primary"
                        className="mt-4 me-3 social-info-quit border-none"
                        type="submit"
                        onClick={handleProfileQuit}
                        disabled={loadingQuit}
                      >
                        {loadingQuit ? (
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
                          <>{t("profile.saveandquit")}</>
                        )}
                      </Button>

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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button>
                      {/* )} */}

                      {/* <Button
                        variant="primary"
                        className="mt-4 social-info-update"
                        type="submit"
                        onClick={handleProfileQuit}
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
                          <>{t("profile.saveandcontinue")}</>
                        )}
                      </Button> */}
                    </div>
                  }


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
                                    title:
                                      "Chargé de relation client / Commercial",
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
                                    value:
                                      "Developer / Operational Contributor",
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
                                      },
                                    ],
                                  },
                                ].map((role, index) => (
                                  <Col md={6} key={index}>
                                    <Card
                                      className={`h-100 profile-card ${
                                        formData.job === role.value
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
                          <div key={tabIndex} className="d-flex flex-column align-items-center">
                            <div style={{ width: '24px', height: '24px' }}>
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
                                ].map((need, index) => (
                                  <div className="col-md-6" key={index}>
                                    <div
                                      className={`p-3 rounded-3 need-item ${
                                        formData.needs?.includes(need.value)
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
                                        <div className="me-3 fs-4">
                                          {need.icon}
                                        </div>
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
                                            onChange={() => {}}
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
                            className="mt-4 me-3 social-info-quit border-none"
                            type="submit"
                            onClick={handleProfileQuit}
                            disabled={loadingQuit}
                          >
                            {loadingQuit ? (
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
                              <>{t("profile.saveandquit")}</>
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
      {profileBanner && (
        <ImageEditorModal
          show={showModal}
          handleClose={handleModalClose}
          selectedImage={profileBanner}
          setImage={setProfileBanner}
          setcroppedImage={setcroppedImage}
        />
      )}
    </div>
  );
};

export default AddProfile;
