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
  Modal,
  InputGroup,
} from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Select from "react-select";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { IoMdSync } from "react-icons/io";
import { RiDeleteBin5Line } from "react-icons/ri";
import { API_BASE_URL } from "../../Apicongfig";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { getUser } from "../../Utils/MeetingFunctions";
import { toast } from "react-toastify";
import GoogleConnectFlow from "./GoogleConnectFlow";
import { SiIonos } from "react-icons/si";



// ====== PKCE Utilities ======
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const Integrations = ({ teams }) => {
  const {
    formState,
    setFormState,
    login,
    googleLogin,
    googleFullName,
    visioGoogleMeet,
    emailGmail,
    setEmailGmail,
  } = useFormContext();
  console.log('google full name', googleFullName)
  const location = useLocation();
  const { profileImage, setProfileImage, setUser, setCallUser } = useHeaderTitle();
  const navigate = useNavigate();
  const isAuth = JSON.parse(CookieService.get("is_google_login"));
  const [isOutlookAuth, setIsOutlookAuth] = useState(JSON.parse(CookieService.get("is_outlook_login")) || false);
  const [stateToken, setStateToken] = useState(null);
  const popupRef = useRef(null);
  const [codeVerifier, setCodeVerifier] = useState(null);
  const popupCheckRef = useRef(null);
  const [user, setUser1] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [t] = useTranslation("global");

  const getUserDataFromAPI = async () => {
    setIsLoading(true);
    try {
      const userID = parseInt(CookieService.get("user_id"));
      const response = await axios.get(`${API_BASE_URL}/users/${userID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      const user = response?.data?.data;
      if (user) {
        setProfileImage(user?.image);
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


  const options1 = [
    {
      value: "Google Agenda",
      label: (
        <>
          <FcGoogle style={{ color: "#0A66C2" }} className="fs-5 ms-2" /> Google Agenda
        </>
      ),
    },
  ];

  const options2 = [
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
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z" fill="white"></path>
              <path d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z" fill="#FBBC05"></path>
              <path d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z" fill="#FBBC05"></path>
              <path d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z" fill="#34A853"></path>
              <path d="M10.1042 7L5 12.4H10.0956L10.1042 7Z" fill="#EA4335"></path>
              <path d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z" fill="#1967D2"></path>
              <path d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z" fill="#4285F4"></path>
              <path d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z" fill="#34A853"></path>
              <path d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z" fill="#188038"></path>
            </g>
          </svg>{" "}
          Google Meet
        </>
      ),
    },
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
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z" fill="white"></path>
              <path d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z" fill="#EA4335"></path>
              <path d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z" fill="#FBBC05"></path>
              <path d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z" fill="#34A853"></path>
              <path d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z" fill="#C5221F"></path>
              <path d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z" fill="#C5221F"></path>
              <path d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z" fill="#C5221F"></path>
              <path d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z" fill="#4285F4"></path>
            </g>
          </svg>{" "}
          Gmail
        </>
      ),
    },
  ];

  const outlookOptions1 = [
    {
      value: "Outlook Agenda",
      label: (
        <>
          <PiMicrosoftOutlookLogoFill style={{ color: "#0A66C2" }} className="fs-5" /> Outlook Agenda
        </>
      ),
    },
  ];

  const outlookOptions2 = [
    {
      value: "Microsoft Teams",
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
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <rect x="10" y="2" width="20" height="28" rx="2" fill="#1066B5" />
              <rect x="10" y="2" width="20" height="28" rx="2" fill="url(#paint0_linear_87_7742)" />
              <rect x="10" y="5" width="10" height="10" fill="#32A9E7" />
              <rect x="10" y="15" width="10" height="10" fill="#167EB4" />
              <rect x="20" y="15" width="10" height="10" fill="#32A9E7" />
              <rect x="20" y="5" width="10" height="10" fill="#58D9FD" />
              <mask id="mask0_87_7742" maskUnits="userSpaceOnUse" x="8" y="14" width="24" height="16">
                <path d="M8 14H30C31.1046 14 32 14.8954 32 16V28C32 29.1046 31.1046 30 30 30H10C8.89543 30 8 29.1046 8 28V14Z" fill="url(#paint1_linear_87_7742)" />
              </mask>
              <g mask="url(#mask0_87_7742)">
                <path d="M32 14V18H30V14H32Z" fill="#135298" />
                <path d="M32 30V16L7 30H32Z" fill="url(#paint2_linear_87_7742)" />
                <path d="M8 30V16L33 30H8Z" fill="url(#paint3_linear_87_7742)" />
              </g>
              <path d="M8 12C8 10.3431 9.34315 9 11 9H17C18.6569 9 20 10.3431 20 12V24C20 25.6569 18.6569 27 17 27H8V12Z" fill="#000000" fill-opacity="0.3" />
              <rect y="7" width="18" height="18" rx="2" fill="url(#paint4_linear_87_7742)" />
              <path d="M14 16.0693V15.903C14 13.0222 11.9272 11 9.01582 11C6.08861 11 4 13.036 4 15.9307V16.097C4 18.9778 6.07278 21 9 21C11.9114 21 14 18.964 14 16.0693ZM11.6424 16.097C11.6424 18.0083 10.5665 19.1579 9.01582 19.1579C7.46519 19.1579 6.37342 17.9806 6.37342 16.0693V15.903C6.37342 13.9917 7.44937 12.8421 9 12.8421C10.5348 12.8421 11.6424 14.0194 11.6424 15.9307V16.097Z" fill="white" />
              <defs>
                <linearGradient id="paint0_linear_87_7742" x1="10" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#064484" />
                  <stop offset="1" stop-color="#0F65B5" />
                </linearGradient>
                <linearGradient id="paint1_linear_87_7742" x1="8" y1="26.7692" x2="32" y2="26.7692" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#1B366F" />
                  <stop offset="1" stop-color="#2657B0" />
                </linearGradient>
                <linearGradient id="paint2_linear_87_7742" x1="32" y1="23" x2="8" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#44DCFD" />
                  <stop offset="0.453125" stop-color="#259ED0" />
                </linearGradient>
                <linearGradient id="paint3_linear_87_7742" x1="8" y1="23" x2="32" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#259ED0" />
                  <stop offset="1" stop-color="#44DCFD" />
                </linearGradient>
                <linearGradient id="paint4_linear_87_7742" x1="0" y1="16" x2="18" y2="16" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#064484" />
                  <stop offset="1" stop-color="#0F65B5" />
                </linearGradient>
              </defs>
            </g>
          </svg>{" "}
          Teams
        </>
      ),
    },
  ];

  const outlookOptions3 = [
    {
      value: "Outlook",
      label: (
        <>
          <PiMicrosoftOutlookLogoFill style={{ color: "#0A66C2" }} className="fs-5" /> Outlook
        </>
      ),
    },
  ];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [integrationLinks, setIntegrationLinks] = useState([]);
  const [visioconferenceLinks, setVisioconferenceLinks] = useState([]);
  const [emailLinks, setEmailLinks] = useState([]);
  const [outlookIntegrationLinks, setOutlookIntegrationLinks] = useState([]);
  const [outlookVisioconferenceLinks, setOutlookVisioconferenceLinks] = useState([]);
  const [outlookEmailLinks, setOutlookEmailLinks] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [affiliationLinks, setAffilicationLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState(user?.title);
  const [loading, setLoading] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [croppedimage, setcroppedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeKey, setActiveKey] = useState("integration");
  const [subActiveKey, setSubActiveKey] = useState("google");


  // Ionos States
  const [ionosEmailLinks, setIonosEmailLinks] = useState([]);
  const [showIonosModal, setShowIonosModal] = useState(false);
  const [ionosValidated, setIonosValidated] = useState(false);
  const [ionosForm, setIonosForm] = useState({ username: "", password: "", host: "imap.ionos.com", domain: "com" });
  const [showIonosPassword, setShowIonosPassword] = useState(false);

  const handleIonosSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (formEl.checkValidity() === false) {
      e.stopPropagation();
      setIonosValidated(true);
      return;
    }

    setIonosValidated(true);
    setLoading(true);

    const userId = parseInt(CookieService.get("user_id"), 10);
    if (!userId) {
      toast.error("User ID not found in session storage");
      setLoading(false);
      return;
    }

    try {
      // Prepare payload excluding internal UI state like 'domain'
      const { domain, ...payload } = ionosForm;

      const res = await fetch(`${API_BASE_URL}/ionos-emails/add-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${CookieService.get("token")}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "API error");
      }

      toast.success("Account added successfully!");
      setShowIonosModal(false);
      setIonosForm({ username: "", password: "", host: "imap.ionos.com", domain: "com" });
      setIonosValidated(false);
      setShowIonosPassword(false);
      // Refresh user data to show the new link
      getUserDataFromAPI();
    } catch (err) {
      toast.error(err.message || "Failed to add account");
    } finally {
      setLoading(false);
    }
  };
  const removeIonosAccount = async (email) => {
    if (!email) return;
    try {
      setLoading(true);
      // Assuming there is a delete endpoint or we allow removing unpersisted state
      // If persisted (has ID), call API. 
      // User endpoint structure implies /ionos-emails for add, maybe /ionos-emails/:id for delete?
      // Or keep it simple if it's just 'remove link' from profile perspective?
      // Using generic email-links delete if it has ID, otherwise just null state.
      if (email?.id) {
        const endpoint = `${API_BASE_URL}/ionos-emails/account/${email.id}`;
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${CookieService.get("token")}` },
        });
      }
      // setIonosEmailLink(null);
      toast.success("Ionos account removed");
      getUserDataFromAPI();
    } catch (error) {
      console.error("Error deleting Ionos link", error);
      toast.error("Failed to remove Ionos account");
    } finally {
      setLoading(false);
    }
  };
  const addIntegrationLinks = (type) => {
    if (type === "google") {
      setIntegrationLinks([...integrationLinks, { platform: "", value: "" }]);
    } else if (type === "outlook") {
      setOutlookIntegrationLinks([...outlookIntegrationLinks, { platform: "", value: "" }]);
    }
  };

  const addVisioconferenceLinks = (type) => {
    if (type === "google") {
      setVisioconferenceLinks([...visioconferenceLinks, { platform: "", value: "" }]);
    } else if (type === "outlook") {
      setOutlookVisioconferenceLinks([...outlookVisioconferenceLinks, { platform: "", value: "" }]);
    }
  };

  const addEmailLinks = (type) => {
    if (type === "google") {
      setEmailLinks([...emailLinks, { platform: "", value: "" }]);
    } else if (type === "outlook") {
      setOutlookEmailLinks([...outlookEmailLinks, { platform: "", value: "" }]);
    }
  };

  const removeIntegrationLinks = async (item, index, type) => {
    try {
      if (item?.id) {
        const endpoint = `${API_BASE_URL}/integration-links/${item.id}`;
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response?.status === 200) {
          if (type === "google") {
            setIntegrationLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_google_login", false);
          } else if (type === "outlook") {
            setOutlookIntegrationLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_outlook_login", false);
          }
        }
      } else {
        if (type === "google") {
          setIntegrationLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_google_login", false);
        } else if (type === "outlook") {
          setOutlookIntegrationLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_outlook_login", false);
        }
      }
    } catch (error) {
      console.log("Error while deleting integration link", error);
    }
  };

  const removeVisioconferenceLinks = async (item, index, type) => {
    try {
      if (item?.id) {
        const endpoint = `${API_BASE_URL}/visioconference-links/${item.id}`;
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response?.status === 200) {
          if (type === "google") {
            setVisioconferenceLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_google_login", false);
          } else if (type === "outlook") {
            setOutlookVisioconferenceLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_outlook_login", false);
          }
        }
      } else {
        if (type === "google") {
          setVisioconferenceLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_google_login", false);
        } else if (type === "outlook") {
          setOutlookVisioconferenceLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_outlook_login", false);
        }
      }
    } catch (error) {
      console.log("Error while deleting visioconference link", error);
    }
  };

  const removeEmailLinks = async (item, index, type) => {
    try {
      if (item?.id) {
        const endpoint = `${API_BASE_URL}/email-links/${item.id}`;
        const response = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
        if (response?.status === 200) {
          if (type === "google") {
            setEmailLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_google_login", false);
            setEmailGmail(null);
          } else if (type === "outlook") {
            setOutlookEmailLinks((prev) => prev.filter((_, i) => i !== index));
            CookieService.set("is_outlook_login", false);
          }
        }
      } else {
        if (type === "google") {
          setEmailLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_google_login", false);
          setEmailGmail(null);
        } else if (type === "outlook") {
          setOutlookEmailLinks((prev) => prev.filter((_, i) => i !== index));
          CookieService.set("is_outlook_login", false);
        }
      }
    } catch (error) {
      console.log("Error while deleting email link", error);
    }
  };

  const handleIntegrationChange = (index, event, type) => {
    const { name, value } = event.target;
    if (type === "google") {
      const updatedIntegrationLinks = [...integrationLinks];
      updatedIntegrationLinks[index][name] = value;
      setIntegrationLinks(updatedIntegrationLinks);
    } else if (type === "outlook") {
      const updatedOutlookIntegrationLinks = [...outlookIntegrationLinks];
      updatedOutlookIntegrationLinks[index][name] = value;
      setOutlookIntegrationLinks(updatedOutlookIntegrationLinks);
    }
  };

  const handleVisioconferenceChange = (index, event, type) => {
    const { name, value } = event.target;
    if (type === "google") {
      const updatedVisioconferenceLinks = [...visioconferenceLinks];
      updatedVisioconferenceLinks[index][name] = value;
      setVisioconferenceLinks(updatedVisioconferenceLinks);
    } else if (type === "outlook") {
      const updatedOutlookVisioconferenceLinks = [...outlookVisioconferenceLinks];
      updatedOutlookVisioconferenceLinks[index][name] = value;
      setOutlookVisioconferenceLinks(updatedOutlookVisioconferenceLinks);
    }
  };

  const handleEmailChange = (index, event, type) => {
    const { name, value } = event.target;
    if (type === "google") {
      const updatedEmailLinks = [...emailLinks];
      updatedEmailLinks[index][name] = value;
      setEmailLinks(updatedEmailLinks);
    } else if (type === "outlook") {
      const updatedOutlookEmailLinks = [...outlookEmailLinks];
      updatedOutlookEmailLinks[index][name] = value;
      setOutlookEmailLinks(updatedOutlookEmailLinks);
    }
  };
  const outlookLoginAndSaveProfile = async () => {
    try {
      // Define popup size and position (centered)
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      // Open the popup
      const popup = window.open(
        `${process.env.REACT_APP_API_BASE_URL}/outlook-login?user_id=${CookieService.get('user_id')}`,
        'Outlook Login',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        toast.error('Popup was blocked. Please allow popups for this site.');
        return;
      }

      // Listen for message event
      const messageHandler = async (event) => {
        console.log('Received message event:', event);

        // Only accept messages from trusted origin
          if (event.origin !== `${process.env.REACT_APP_API_BASE_URL}`) {
          console.warn('⚠️ Ignored message from unknown origin:', event.origin);
          return;
        }

        const { type, data } = event.data || {};

        if (type === 'outlook-login-success') {
          console.log('✅ Outlook login success:', data);

          // Remove listener
          window.removeEventListener('message', messageHandler);
          clearInterval(interval);

          // Close popup if still open
          if (!popup.closed) popup.close();

          try {
            await onOutlookLoginSuccess();
          } catch (err) {
            console.error('Error processing Outlook login:', err);
            toast.error('Failed to complete Outlook login.');
          }
        } else if (type === 'outlook-login-failed') {
          console.warn('⚠️ Outlook login failed:', data);
          toast.error('Outlook login failed.');
          window.removeEventListener('message', messageHandler);
          clearInterval(interval);
          if (!popup.closed) popup.close();
        }
      };

      window.addEventListener('message', messageHandler);

      // Detect popup closure
      const interval = setInterval(() => {
        if (popup.closed) {
          console.log('Popup closed by user.');
          clearInterval(interval);
          window.removeEventListener('message', messageHandler);
        }
      }, 500);
    } catch (error) {
      console.error('Unexpected error during Outlook login:', error);
      toast.error('Something went wrong during Outlook login.');
    }
  };

  // Handle successful Outlook login
  const onOutlookLoginSuccess = async () => {
    try {
      const userId = CookieService.get('user_id');
      const token = CookieService.get('token');

      if (!userId || !token) {
        toast.error('User session not found.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data?.data;
      console.log('✅ User data fetched after Outlook login:', data);

      if (!data) {
        toast.error('User data not found.');
        return;
      }

      const { mail, displayName } = data?.outlook_user_info || {};
      if (!mail || !displayName) {
        toast.error('Incomplete Outlook user information.');
        return;
      }
      setOutlookIntegrationLinks([{ platform: "Outlook Agenda", value: displayName }]);
      setOutlookVisioconferenceLinks([{ platform: "Microsoft Teams", value: displayName }]);
      setOutlookEmailLinks([{ platform: "Outlook", value: mail }]);
      toast.success('Outlook account connected successfully!');
      // Update user state with Outlook links
      const updatedUser = {
        ...user,
        integration_links: [
          ...user.integration_links.filter(link => link.platform !== "Outlook Agenda"), // Prevent duplicates
          { platform: "Outlook Agenda", value: displayName },
        ],
        visioconference_links: [
          ...user.visioconference_links.filter(link => link.platform !== "Microsoft Teams"), // Prevent duplicates
          { platform: "Microsoft Teams", value: displayName },
        ],
        email_links: [
          ...user.email_links.filter(link => link.platform !== "Outlook"), // Prevent duplicates
          { platform: "Outlook", value: mail },
        ],
      };
      setUser(updatedUser);


      // Prepare FormData for profile update
      const formData = new FormData();

      // Basic user fields
      formData.append("_method", "PUT");
      formData.append("title", user?.title || "");
      formData.append("name", user?.name || "");
      formData.append("last_name", user?.last_name || "");
      formData.append("email", user?.email || "");
      formData.append("phoneNumber", user?.phoneNumber || "");
      formData.append("enterprise_id", user?.enterprise?.id || "");
      formData.append("bio", user?.bio || "");
      formData.append("post", user?.post || "");
      formData.append("role_id", user?.role_id || "");
      formData.append("timezone", userTimeZone || "Europe/Paris");
      formData.append("visibility", user?.visibility || "public");

      // Social links
      user?.social_links?.forEach((link, index) => {
        if (link.id) {
          formData.append(`social_links[${index}][id]`, link.id);
        }
        formData.append(`social_links[${index}][platform]`, link.platform);
        formData.append(`social_links[${index}][link]`, link.link);
      });

      // Websites
      user?.websites?.forEach((site, index) => {
        if (site.id) {
          formData.append(`websites[${index}][id]`, site.id);
        }
        formData.append(`websites[${index}][title]`, site.title);
        formData.append(`websites[${index}][link]`, site.link);
      });

      // Affiliation links
      user?.affiliation_links?.forEach((site, index) => {
        if (site.id) {
          formData.append(`affiliation_links[${index}][id]`, site.id);
        }
        formData.append(`affiliation_links[${index}][title]`, site.title);
        formData.append(`affiliation_links[${index}][link]`, site.link);
      });

      // Integration links (Google + Outlook)
      updatedUser.integration_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`integration_links[${index}][id]`, link.id);
        }
        formData.append(`integration_links[${index}][platform]`, link.platform);
        formData.append(`integration_links[${index}][value]`, link.value);
      });

      // Visoconference links (Google Meet + Teams)
      updatedUser.visioconference_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`visioconference_links[${index}][id]`, link.id);
        }
        formData.append(`visioconference_links[${index}][platform]`, link.platform);
        formData.append(`visioconference_links[${index}][value]`, link.value);
      });

      // Email links (Gmail + Outlook)
      updatedUser.email_links.forEach((link, index) => {
        if (link.id) {
          formData.append(`email_links[${index}][id]`, link.id);
        }
        formData.append(`email_links[${index}][platform]`, link.platform);
        formData.append(`email_links[${index}][value]`, link.value);
      });

      // Teams
      user?.teams?.forEach((team) => {
        formData.append("team_id[]", team.id);
      });

      // Profile image (if exists)
      if (user?.image?.startsWith("data:image/")) {
        const blob = await (await fetch(user.image)).blob();
        formData.append("image", blob, "profile-image.jpg");
      } else if (user?.image) {
        formData.append("image", user.image);
      }

      // Profile banner (if exists)
      if (user?.profile_banner?.startsWith("data:image/")) {
        const blob = await (await fetch(user.profile_banner)).blob();
        formData.append("profile_banner", blob, "profile-banner.jpg");
      } else if (user?.profile_banner) {
        formData.append("profile_banner", user.profile_banner);
      }

      // Video (if exists)
      if (user?.video?.startsWith("blob:")) {
        const blob = await (await fetch(user.video)).blob();
        formData.append("video", blob, "video-preview.mp4");
      } else if (user?.video) {
        formData.append("video", user.video);
      }

      // Update user profile on backend
      const profileResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to update user profile: ${profileResponse.status}`);
      }

      const responseData = await profileResponse.json();
      setUser(responseData?.data?.data || updatedUser);
      setCallUser((prev) => !prev);

      CookieService.set('outlook_access_token', data?.outlook_access_token);
      CookieService.set('outlook_refresh_token', data?.outlook_refresh_token);


    } catch (error) {
      console.error('❌ Error fetching user data after Outlook login:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch Outlook data.');
    }
  };


  const handleSelectIntegrationChange = (index, selectedOption, type) => {
    if (type === "google") {
      const updatedIntegrationLinks = [...integrationLinks];
      updatedIntegrationLinks[index].platform = selectedOption ? selectedOption.value : "";
      setIntegrationLinks(updatedIntegrationLinks);
      if (selectedOption && selectedOption.value === "Google Agenda" && !isAuth) {
        googleLogin();
        if (!visioconferenceLinks.some((link) => link.platform === "Google Meet")) {
          const updatedVisioconferenceLinks = [...visioconferenceLinks, { platform: "Google Meet", value: visioGoogleMeet }];
          setVisioconferenceLinks(updatedVisioconferenceLinks);
        }
        if (!emailLinks.some((link) => link.platform === "Gmail")) {
          const updatedEmailLinks = [...emailLinks, { platform: "Gmail", value: emailGmail }];
          setEmailLinks(updatedEmailLinks);
        }
      }
    } else if (type === "outlook") {
      const updatedOutlookIntegrationLinks = [...outlookIntegrationLinks];
      updatedOutlookIntegrationLinks[index].platform = selectedOption ? selectedOption.value : "";
      setOutlookIntegrationLinks(updatedOutlookIntegrationLinks);
      if (selectedOption && selectedOption.value === "Outlook Agenda" && !JSON.parse(CookieService.get("is_outlook_login"))) {
        outlookLoginAndSaveProfile();
        if (!outlookVisioconferenceLinks.some((link) => link.platform === "Microsoft Teams")) {
          const updatedOutlookVisioconferenceLinks = [...outlookVisioconferenceLinks, { platform: "Microsoft Teams", value: "" }];
          setOutlookVisioconferenceLinks(updatedOutlookVisioconferenceLinks);
        }
        if (!outlookEmailLinks.some((link) => link.platform === "Outlook")) {
          const updatedOutlookEmailLinks = [...outlookEmailLinks, { platform: "Outlook", value: "" }];
          setOutlookEmailLinks(updatedOutlookEmailLinks);
        }
      }
    }
  };

  const handleSelectVisioconferenceChange = (index, selectedOption, type) => {
    if (type === "google") {
      const updatedVisioconferenceLinks = [...visioconferenceLinks];
      updatedVisioconferenceLinks[index].platform = selectedOption ? selectedOption.value : "";
      setVisioconferenceLinks(updatedVisioconferenceLinks);
      if (selectedOption && selectedOption.value === "Google Meet" && !isAuth) {
        googleLogin();
        const meetValue = updatedVisioconferenceLinks[index].value || googleFullName;
        if (!integrationLinks.some((link) => link.platform === "Google Agenda")) {
          const updatedIntegrationLinks = [...integrationLinks, { platform: "Google Agenda", value: meetValue }];
          setIntegrationLinks(updatedIntegrationLinks);
        }
        if (!emailLinks.some((link) => link.platform === "Gmail")) {
          const updatedEmailLinks = [...emailLinks, { platform: "Gmail", value: emailGmail }];
          setEmailLinks(updatedEmailLinks);
        }
      }
    } else if (type === "outlook") {
      const updatedOutlookVisioconferenceLinks = [...outlookVisioconferenceLinks];
      updatedOutlookVisioconferenceLinks[index].platform = selectedOption ? selectedOption.value : "";
      setOutlookVisioconferenceLinks(updatedOutlookVisioconferenceLinks);
      if (selectedOption && selectedOption.value === "Microsoft Teams" && !JSON.parse(CookieService.get("is_outlook_login"))) {
        outlookLoginAndSaveProfile();
        const teamsValue = updatedOutlookVisioconferenceLinks[index].value || "";
        if (!outlookIntegrationLinks.some((link) => link.platform === "Outlook Agenda")) {
          const updatedOutlookIntegrationLinks = [...outlookIntegrationLinks, { platform: "Outlook Agenda", value: teamsValue }];
          setOutlookIntegrationLinks(updatedOutlookIntegrationLinks);
        }
        if (!outlookEmailLinks.some((link) => link.platform === "Outlook")) {
          const updatedOutlookEmailLinks = [...outlookEmailLinks, { platform: "Outlook", value: teamsValue }];
          setOutlookEmailLinks(updatedOutlookEmailLinks);
        }
      }
    }
  };

  const handleSelectEmailChange = (index, selectedOption, type) => {
    if (type === "google") {
      const updatedEmailLinks = [...emailLinks];
      updatedEmailLinks[index].platform = selectedOption ? selectedOption.value : "";
      setEmailLinks(updatedEmailLinks);
      if (selectedOption && selectedOption.value === "Gmail" && !isAuth) {
        googleLogin();
        const gmailValue = updatedEmailLinks[index].value || googleFullName;
        if (!integrationLinks.some((link) => link.platform === "Google Agenda")) {
          const updatedIntegrationLinks = [...integrationLinks, { platform: "Google Agenda", value: gmailValue }];
          setIntegrationLinks(updatedIntegrationLinks);
        }
        if (!visioconferenceLinks.some((link) => link.platform === "Google Meet")) {
          const updatedVisioconferenceLinks = [...visioconferenceLinks, { platform: "Google Meet", value: visioGoogleMeet }];
          setVisioconferenceLinks(updatedVisioconferenceLinks);
        }
      }
    } else if (type === "outlook") {
      const updatedOutlookEmailLinks = [...outlookEmailLinks];
      updatedOutlookEmailLinks[index].platform = selectedOption ? selectedOption.value : "";
      setOutlookEmailLinks(updatedOutlookEmailLinks);
      if (selectedOption && selectedOption.value === "Outlook" && !JSON.parse(CookieService.get("is_outlook_login"))) {
        outlookLoginAndSaveProfile();
        const outlookValue = updatedOutlookEmailLinks[index].value || "";
        if (!outlookIntegrationLinks.some((link) => link.platform === "Outlook Agenda")) {
          const updatedOutlookIntegrationLinks = [...outlookIntegrationLinks, { platform: "Outlook Agenda", value: outlookValue }];
          setOutlookIntegrationLinks(updatedOutlookIntegrationLinks);
        }
        if (!outlookVisioconferenceLinks.some((link) => link.platform === "Microsoft Teams")) {
          const updatedOutlookVisioconferenceLinks = [...outlookVisioconferenceLinks, { platform: "Microsoft Teams", value: outlookValue }];
          setOutlookVisioconferenceLinks(updatedOutlookVisioconferenceLinks);
        }
      }
    }
  };

  // Inside Integrations.jsx — add this useEffect
  // useEffect(() => {
  //   if (!isAuth) return; // Only run if logged in

  //   // Sync Google name → Google Agenda & Google Meet
  //   if (googleFullName) {
  //     setIntegrationLinks(prev =>
  //       prev.map(link =>
  //         link.platform === "Google Agenda" && !link.value
  //           ? { ...link, value: googleFullName }
  //           : link
  //       )
  //     );

  //     setVisioconferenceLinks(prev =>
  //       prev.map(link =>
  //         link.platform === "Google Meet" && !link.value
  //           ? { ...link, value: googleFullName }
  //           : link
  //       )
  //     );
  //   }

  //   // Sync Gmail → Gmail field
  //   if (emailGmail) {
  //     setEmailLinks(prev =>
  //       prev.map(link =>
  //         link.platform === "Gmail" && !link.value
  //           ? { ...link, value: emailGmail }
  //           : link
  //       )
  //     );
  //   }
  // }, [isAuth, googleFullName, emailGmail, visioGoogleMeet]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [profile, setProfile] = useState(user?.image || "https://via.placeholder.com/150");
  const [profileBanner, setProfileBanner] = useState(user?.profile_banner || null);
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
    role_id: null,
    profile: "",
  });

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
        role_id: user?.role_id,
        job: user?.job,
      });
      setTitle(user?.title);
      setSelectedTeams(
        user?.teams?.map((team) => ({
          value: team.id,
          label: team.name,
        }))
      );
      // 🌐 Google data
      setIntegrationLinks(
        (user?.integration_links || []).filter(link => link.platform === "Google Agenda")
      );
      setVisioconferenceLinks(
        (user?.visioconference_links || []).filter(link => link.platform === "Google Meet")
      );
      setEmailLinks(
        (user?.email_links || []).filter(link => link.platform === "Gmail")
      );

      // 💼 Outlook / Microsoft data
      setOutlookIntegrationLinks(
        (user?.integration_links || []).filter(link => link.platform === "Outlook Agenda")
      );
      setOutlookVisioconferenceLinks(
        (user?.visioconference_links || []).filter(link => link.platform === "Microsoft Teams")
      );
      setOutlookEmailLinks(
        (user?.email_links || []).filter(link => link.platform === "Outlook")
      );
      // 🔷 Ionos data
      setIonosEmailLinks(
        (user?.ionos_links)
      );

    }
  }, [user]);

  const userID = parseInt(CookieService.get("user_id"));
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


  const handleProfile = async () => {
    try {
      setLoading(true);
      const formDataInstance = new FormData();

      // 🖼️ Profile Image
      if (profile?.startsWith("data:image/")) {
        const blob = await (await fetch(profile)).blob();
        formDataInstance.append("image", blob, "profile-image.jpg");
      } else if (profile) {
        formDataInstance.append("image", profile);
      }

      // 🖼️ Banner
      if (profileBanner?.startsWith("data:image/")) {
        const blob = await (await fetch(profileBanner)).blob();
        formDataInstance.append("profile_banner", blob, "profile-banner.jpg");
      } else if (profileBanner) {
        formDataInstance.append("profile_banner", profileBanner);
      }

      // 🧾 Basic Info
      const basicFields = {
        // ...user,
        job: formData.job || "",
        title: title || "",
        name: formData.name || "",
        last_name: formData.last_name || "",
        email: formData.email || "",
        phoneNumber: formData.phoneNumber || "",
        enterprise_id: formData.enterprise_id || "",
        bio: formData.bio || "",
        post: formData.post || "",
        role_id: formData.role_id || "",
        timezone: userTimeZone || "Europe/Paris",
        visibility: visibility || "public",
        current_password: currentPassword || "",
        password: newPassword || "",
        password_confirmation: retypePassword || "",
        _method: "put",
      };
      Object.entries(basicFields).forEach(([key, value]) =>
        formDataInstance.append(key, value)
      );

      // 🧭 Needs
      formData.needs?.forEach((need, index) => {
        formDataInstance.append(`needs[${index}]`, need);
      });

      // 🌐 Social Links
      socialLinks.forEach((link, index) => {
        if (link.id)
          formDataInstance.append(`social_links[${index}][id]`, link.id);
        formDataInstance.append(`social_links[${index}][platform]`, link.platform);
        formDataInstance.append(`social_links[${index}][link]`, link.link);
      });


      // 🔹 Google Links
      const allIntegrationLinks = [...integrationLinks, ...outlookIntegrationLinks];
      const allVisioconferenceLinks = [...visioconferenceLinks, ...outlookVisioconferenceLinks];
      const allEmailLinks = [...emailLinks, ...outlookEmailLinks];

      // Function to append links to formDataInstance
      const appendLinksToFormData = (key, links) => {
        links.forEach((link, index) => {
          if (link.id) formDataInstance.append(`${key}[${index}][id]`, link.id);
          formDataInstance.append(`${key}[${index}][platform]`, link.platform);
          formDataInstance.append(`${key}[${index}][value]`, link.value);
        });
      };

      // 🌐 Integration Links (Google Agenda, Outlook)
      appendLinksToFormData("integration_links", allIntegrationLinks);

      // 📞 Visioconference Links (Google Meet, Teams)
      appendLinksToFormData("visioconference_links", allVisioconferenceLinks);

      // 📧 Email Links (Gmail, Outlook)
      appendLinksToFormData("email_links", allEmailLinks);

      // 🌐 Websites
      websites.forEach((site, index) => {
        if (site.id) formDataInstance.append(`websites[${index}][id]`, site.id);
        formDataInstance.append(`websites[${index}][title]`, site.title);
        formDataInstance.append(`websites[${index}][link]`, site.link);
      });

      // 🤝 Affiliations
      affiliationLinks.forEach((site, index) => {
        if (site.id)
          formDataInstance.append(`affiliation_links[${index}][id]`, site.id);
        formDataInstance.append(`affiliation_links[${index}][title]`, site.title);
        formDataInstance.append(`affiliation_links[${index}][link]`, site.link);
      });

      // 🛍️ Products
      for (const [index, product] of products.entries()) {
        if (product.id)
          formDataInstance.append(`products[${index}][id]`, product.id);
        formDataInstance.append(
          `products[${index}][product_title]`,
          product.product_title
        );
        formDataInstance.append(
          `products[${index}][product_description]`,
          product.product_description
        );

        if (product?.product_image?.startsWith("data:image/")) {
          const blob = await (await fetch(product.product_image)).blob();
          formDataInstance.append(
            `products[${index}][product_image]`,
            blob,
            "product-image.jpg"
          );
        } else {
          formDataInstance.append(
            `products[${index}][product_image]`,
            product.product_image || ""
          );
        }
      }

      // 🎥 Video
      if (videoPreview?.startsWith("blob:")) {
        const blob = await (await fetch(videoPreview)).blob();
        formDataInstance.append("video", blob, "video-preview.mp4");
      } else if (videoPreview) {
        formDataInstance.append("video", videoPreview);
      }

      // 🧑‍🤝‍🧑 Teams
      selectedTeams.forEach(team =>
        formDataInstance.append("team_id[]", team.value)
      );

      // 🚀 API Call
      const response = await fetch(`${API_BASE_URL}/users/${userID}`, {
        method: "POST",
        body: formDataInstance,
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result?.data?.data) {
        setUser(result.data.data);
        setUser1(result.data.data);
        setCallUser(prev => !prev);
        setProfileImage(result.data.data.image);
      } else {
        console.error("Profile image missing in response");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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
            <Spinner animation="border" role="status" className="center-spinner"></Spinner>
          ) : (
            <Row>
              <Col lg={12} xs={12} md={12}>
                <Tab.Container defaultActiveKey="integration">
                  <Nav variant="tabs" className="mb-3 profile-navs" activeKey={activeKey} onSelect={(selectedKey) => setActiveKey(selectedKey)}>
                    <Nav.Item>
                      <Nav.Link eventKey="integration" className={activeKey === "integration" ? "active-tab" : ""}>
                        <span>
                          <IoMdSync size={22} />
                          {t("profile.integration")}
                        </span>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content className="profile-nav-content">
                    {activeKey === "integration" && (
                      <Tab.Container activeKey={subActiveKey} onSelect={setSubActiveKey}>
                        {/* === SUB TABS === */}
                        <Nav variant="tabs" className="mb-4 border-bottom sub-tabs">
                          <Nav.Item>
                            <Nav.Link
                              eventKey="google"
                              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-top ${subActiveKey === "google"
                                ? "bg-white text-primary border border-bottom-0 shadow-sm"
                                : "bg-light text-muted"
                                }`}
                            >
                              <FcGoogle size={20} />
                              Google
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link
                              eventKey="outlook"
                              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-top ${subActiveKey === "outlook"
                                ? "bg-white text-primary border border-bottom-0 shadow-sm"
                                : "bg-light text-muted"
                                }`}
                            >
                              <PiMicrosoftOutlookLogoFill size={20} color="#0078D4" />
                              Outlook
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link
                              eventKey="gmail"
                              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-top ${subActiveKey === "gmail"
                                ? "bg-white text-primary border border-bottom-0 shadow-sm"
                                : "bg-light text-muted"
                                }`}
                            >
                              <svg
                                width="32px"
                                height="32px"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                  <path d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z" fill="white"></path>
                                  <path d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z" fill="#EA4335"></path>
                                  <path d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z" fill="#FBBC05"></path>
                                  <path d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z" fill="#34A853"></path>
                                  <path d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z" fill="#C5221F"></path>
                                  <path d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z" fill="#C5221F"></path>
                                  <path d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z" fill="#C5221F"></path>
                                  <path d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z" fill="#4285F4"></path>
                                </g>
                              </svg>
                              Gmail
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link
                              eventKey="ionos"
                              className={`d-flex align-items-center gap-2 px-4 py-2 rounded-top ${subActiveKey === "ionos"
                                ? "bg-white text-primary border border-bottom-0 shadow-sm"
                                : "bg-light text-muted"
                                }`}
                            >
                              <SiIonos size={20} color="#003D8F" />
                              Ionos
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>

                        <Tab.Content>
                          <Tab.Pane eventKey="google" className="form">
                            <h5 className="profile-font">{t("profile.integration")}</h5>
                            <small>{t("profile.integrationSubtext")}</small>
                            <Row className="mt-3 social-info-row">
                              <h6>{t("profile.agenda")}</h6>
                              {integrationLinks?.map((integration, index) => {
                                const filteredOptions = options1.filter(
                                  (option) => !integrationLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === integration.platform)}
                                        onChange={(selectedOption) => handleSelectIntegrationChange(index, selectedOption, "google")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={integration.value || googleFullName}
                                        onChange={(e) => handleIntegrationChange(index, e, "google")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeIntegrationLinks(integration, index, "google")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {integrationLinks.length < options1.length && (
                                <Button className="add-social-link" onClick={() => addIntegrationLinks("google")}>
                                  + {t("profile.add")}
                                </Button>
                              )}

                              <h6>{t("profile.visioconferences")}</h6>
                              {visioconferenceLinks?.map((visioconference, index) => {
                                const filteredOptions = options2.filter(
                                  (option) => !visioconferenceLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === visioconference.platform)}
                                        onChange={(selectedOption) => handleSelectVisioconferenceChange(index, selectedOption, "google")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={visioconference.value || visioGoogleMeet}
                                        onChange={(e) => handleVisioconferenceChange(index, e, "google")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeVisioconferenceLinks(visioconference, index, "google")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {visioconferenceLinks.length < options2.length && (
                                <Button className="add-social-link" onClick={() => addVisioconferenceLinks("google")}>
                                  + {t("profile.add")}
                                </Button>
                              )}

                              <h6>{t("profile.email")}</h6>
                              {emailLinks?.map((email, index) => {
                                const filteredOptions = options3.filter(
                                  (option) => !emailLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === email.platform)}
                                        onChange={(selectedOption) => handleSelectEmailChange(index, selectedOption, "google")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={email.value || emailGmail}
                                        onChange={(e) => handleEmailChange(index, e, "google")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeEmailLinks(email, index, "google")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {emailLinks.length < options3.length && (
                                <Button className="add-social-link" onClick={() => addEmailLinks("google")}>
                                  + {t("profile.add")}
                                </Button>
                              )}
                            </Row>
                          </Tab.Pane>

                          <Tab.Pane eventKey="outlook" className="form">
                            <h5 className="profile-font">{t("profile.integration")}</h5>
                            <small>{t("profile.integrationSubtext")}</small>
                            <Row className="mt-3 social-info-row">
                              <h6>{t("profile.agenda")}</h6>
                              {outlookIntegrationLinks?.map((integration, index) => {
                                const filteredOptions = outlookOptions1.filter(
                                  (option) => !outlookIntegrationLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === integration.platform)}
                                        onChange={(selectedOption) => handleSelectIntegrationChange(index, selectedOption, "outlook")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={integration.value || ""}
                                        onChange={(e) => handleIntegrationChange(index, e, "outlook")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeIntegrationLinks(integration, index, "outlook")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {outlookIntegrationLinks.length < outlookOptions1.length && (
                                <Button className="add-social-link" onClick={() => addIntegrationLinks("outlook")}>
                                  + {t("profile.add")}
                                </Button>
                              )}

                              <h6>{t("profile.visioconferences")}</h6>
                              {outlookVisioconferenceLinks?.map((visioconference, index) => {
                                const filteredOptions = outlookOptions2.filter(
                                  (option) => !outlookVisioconferenceLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === visioconference.platform)}
                                        onChange={(selectedOption) => handleSelectVisioconferenceChange(index, selectedOption, "outlook")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={visioconference.value || ""}
                                        onChange={(e) => handleVisioconferenceChange(index, e, "outlook")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeVisioconferenceLinks(visioconference, index, "outlook")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {outlookVisioconferenceLinks.length < outlookOptions2.length && (
                                <Button className="add-social-link" onClick={() => addVisioconferenceLinks("outlook")}>
                                  + {t("profile.add")}
                                </Button>
                              )}

                              <h6>{t("profile.email")}</h6>
                              {outlookEmailLinks?.map((email, index) => {
                                const filteredOptions = outlookOptions3.filter(
                                  (option) => !outlookEmailLinks.some((item, itemIndex) => item.platform === option.value && itemIndex !== index)
                                );
                                return (
                                  <Row key={index} className="mb-3 align-items-center">
                                    <Col md={4}>
                                      <Select
                                        name="platform"
                                        options={filteredOptions}
                                        value={filteredOptions.find((option) => option.value === email.platform)}
                                        onChange={(selectedOption) => handleSelectEmailChange(index, selectedOption, "outlook")}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Control
                                        type="text"
                                        name="value"
                                        value={email.value || ""}
                                        onChange={(e) => handleEmailChange(index, e, "outlook")}
                                      />
                                    </Col>
                                    <Col md={2}>
                                      <Button
                                        onClick={() => removeEmailLinks(email, index, "outlook")}
                                        style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                      >
                                        <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                        &nbsp; {t("profile.remove")}
                                      </Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              {outlookEmailLinks.length < outlookOptions3.length && (
                                <Button className="add-social-link" onClick={() => addEmailLinks("outlook")}>
                                  + {t("profile.add")}
                                </Button>
                              )}
                            </Row>
                          </Tab.Pane>

                          <Tab.Pane eventKey="gmail">
                            <h5 className="mb-1">{t("profile.integration")}</h5>
                            <small className="text-muted d-block mb-4">
                              {t("profile.integrationSubtext")}
                            </small>

                            <Row className="justify-content-center">
                              <GoogleConnectFlow user={user} setActiveKey={setSubActiveKey} onUpdate={() => {
                                getUserDataFromAPI();     // pehle user update karo
                                setSubActiveKey("gmail"); // ← Yeh line missing thi!
                              }} />
                            </Row>
                          </Tab.Pane>


                          <Tab.Pane eventKey="ionos" className="form">
                            <h5 className="profile-font">Ionos Integration</h5>
                            <small>Connect your Ionos email account.</small>
                            <Row className="mt-3 social-info-row">
                              <h6>Email Account</h6>
                              {ionosEmailLinks?.map((email, index) => (
                                <Row key={index} className="mb-3 align-items-center">
                                  <Col md={10}>
                                    <Form.Control
                                      type="text"
                                      value={email.email} // Display email/username
                                      disabled
                                      readOnly
                                    />
                                  </Col>
                                  <Col md={2}>
                                    <Button
                                      onClick={() => removeIonosAccount(email)}
                                      style={{ color: "#BB372F", background: "white", outline: "none", border: "none" }}
                                    >
                                      <RiDeleteBin5Line size={22} color={"#BB372F"} />
                                      &nbsp; {t("profile.remove")}
                                    </Button>
                                  </Col>
                                </Row>
                              ))}

                              {ionosEmailLinks.length < 1 && (
                                <Button className="add-social-link" onClick={() => setShowIonosModal(true)}>
                                  + Add Account
                                </Button>
                              )}
                            </Row>
                          </Tab.Pane>

                        </Tab.Content>
                      </Tab.Container>
                    )}
                  </Tab.Content>
                </Tab.Container>
                {/* {subActiveKey !== "gmail" && <Button
                  variant="primary"
                  className="mt-4 social-info-update"
                  type="submit"
                >

                  <>{t("Validate")}</>
                </Button>} */}
              </Col>
            </Row>
          )}
        </Container>
      </div>
      {/* Ionos Modal */}
      < Modal show={showIonosModal} onHide={() => setShowIonosModal(false)} centered >
        <Modal.Header closeButton>
          <Modal.Title>Connect Ionos Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={ionosValidated} onSubmit={handleIonosSubmit}>
            <Form.Group className="mb-3" controlId="ionosHost">
              <Form.Label>Host</Form.Label>
              <InputGroup>
                <Form.Control
                  readOnly
                  value="imap.ionos."
                  style={{ backgroundColor: "#e9ecef", maxWidth: "120px" }}
                />
                <Form.Select
                  name="domain"
                  value={ionosForm.domain}
                  onChange={(e) => {
                    const value = e.target.value;
                    setIonosForm((prev) => ({
                      ...prev,
                      domain: value,
                      host: `imap.ionos.${value}`
                    }));
                  }}
                >
                  <option value="com">com</option>
                  <option value="us">us</option>
                  <option value="fr">fr</option>
                  <option value="eu">eu</option>
                  <option value="it">it</option>
                  <option value="es">es</option>
                </Form.Select>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="ionosUsername">
              <Form.Label>Username / Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="email@example.com"
                required
                value={ionosForm.username}
                onChange={(e) => setIonosForm({ ...ionosForm, username: e.target.value })}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid username.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="ionosPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup hasValidation>
                <Form.Control
                  type={showIonosPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={ionosForm.password}
                  onChange={(e) => setIonosForm({ ...ionosForm, password: e.target.value })}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowIonosPassword(!showIonosPassword)}
                  type="button"
                >
                  {showIonosPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
                <Form.Control.Feedback type="invalid">
                  Please provide a password.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowIonosModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Connect"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal >
    </div>
  );
};

export default Integrations;
