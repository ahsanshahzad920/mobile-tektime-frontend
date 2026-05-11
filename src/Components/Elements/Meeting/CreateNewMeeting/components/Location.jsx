import CookieService from '../../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { toast } from "react-toastify";
import ReactToggle from "react-toggle";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { API_BASE_URL } from "../../../../Apicongfig";
import { SiMicrosoftoutlook } from "react-icons/si";
import { useHeaderTitle } from "../../../../../context/HeaderTitleContext";
import { userTimeZone } from "../../GetMeeting/Helpers/functionHelper";

function Location({}) {
  const {
    formState,
    setFormState,
    meeting,

    checkId,
    getMeetingModal,
    googleLoginAndSaveProfile,
    googleLoginCalled,
    toggleStates,
    setToggleStates,
    setSelectedToggle,
    selectedToggle,
  } = useFormContext();
  const [outlookLoginCalled, setOutlookLoginCalled] = useState(false);

  const [t] = useTranslation("global");
  const [selectedLocation, setSelectedLocation] = useState({
    meeting: "",
    agenda: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, user, setCallUser } = useHeaderTitle();

  const handleToggleChange = (selectedToggle) => {
    if (
      meeting?.type === "Special" ||
      meeting?.type === "Law" ||
      meeting?.type === "Newsletter" ||
      meeting?.type === "Google Agenda Event" ||
      meeting?.type === "Outlook Agenda Event"
    )
      return;

    setToggleStates((prevState) => {
      const updatedState = {
        ...prevState,
        [selectedToggle]: !prevState[selectedToggle],
      };

      // Clear associated fields when the toggle is turned off
      if (!updatedState[selectedToggle]) {
        if (selectedToggle === "Visioconference") {
          setSelectedLocation((prevState) => ({
            ...prevState,
            meeting: null,
          }));
          setFormState((prevState) => ({
            ...prevState,
            location: null,
          }));
        } else if (selectedToggle === "agenda") {
          setSelectedLocation((prevState) => ({
            ...prevState,
            agenda: null,
          }));
          setFormState((prevState) => ({
            ...prevState,
            agenda: null,
          }));
        } else if (selectedToggle === "Address") {
          setFormState((prevState) => ({
            ...prevState,
            address: "",
          }));
        } else if (selectedToggle === "Room") {
          setFormState((prevState) => ({
            ...prevState,
            room_details: "",
          }));
        } else if (selectedToggle === "phone") {
          setFormState((prevState) => ({
            ...prevState,
            phone: "",
          }));
        }
      }

      return updatedState;
    });
  };

  const handleSelect = (meetingOption) => {
    if (
      meeting?.type === "Special" ||
      meeting?.type === "Law" ||
      meeting?.type === "Newsletter" ||
      meeting?.type === "Google Agenda Event" ||
      meeting?.type === "Outlook Agenda Event"
    )
      return;
    setSelectedToggle(meetingOption);
    setSelectedLocation((prev) => ({
      ...prev,
      meeting: meetingOption,
    }));

    setFormState((prevState) => ({
      ...prevState,
      location: meetingOption === "None" ? "None" : meetingOption,
    }));
  };

  const handleSelectAgenda = (agendaOption) => {
    if (
      meeting?.type === "Special" ||
      meeting?.type === "Law" ||
      meeting?.type === "Newsletter" ||
      meeting?.type === "Google Agenda Event" ||
      meeting?.type === "Outlook Agenda Event"

    )
      return;
    setSelectedToggle(agendaOption);
    setSelectedLocation((prev) => ({
      ...prev,
      agenda: agendaOption,
    }));

    setFormState((prevState) => ({
      ...prevState,
      agenda: agendaOption === "None" ? "None" : agendaOption,
    }));
  };

  useEffect(() => {
    if (checkId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await getMeetingModal(checkId);
        } catch (error) {
          toast.error("Error fetching meeting data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [checkId]);

  useEffect(() => {
    if (meeting) {
      const {
        location,
        address,
        room_details,
        phone,
        agenda,
        calendar_address,
      } = meeting;
      setFormState((prevState) => ({
        ...prevState,
        location: location || "",
        address: address || "",
        room_details: room_details || "",
        phone: phone || "",
        agenda: agenda || "",
      }));

      setSelectedLocation((prevState) => ({
        ...prevState,
        meeting: location,
        agenda: agenda,
      }));
      if (googleLoginCalled || outlookLoginCalled) return;
      // if (outlookLoginCalled) return;
      setToggleStates({
        Visioconference: !!meeting.location,
        Room: !!room_details,
        Address: !!address,
        phone: !!phone,
        agenda: !!meeting.agenda,
      });
    }
  }, [meeting, setFormState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const loginGoogleAndSaveProfileData = async () => {
    await googleLoginAndSaveProfile();
  };

  const [isProcessingOutlookLogin, setIsProcessingOutlookLogin] =
    useState(false);

  const outlookLoginAndSaveProfile = async () => {
    if (isProcessingOutlookLogin) {
      console.log("Outlook login already in progress, skipping.");
      return;
    }

    setIsProcessingOutlookLogin(true);

    try {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        `${process.env.REACT_APP_API_BASE_URL}/outlook-login?user_id=${CookieService.get(
          "user_id"
        )}`,
        "Outlook Login",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        toast.error("Popup was blocked. Please allow popups for this site.");
        setIsProcessingOutlookLogin(false);
        return;
      }

      const messageHandler = async (event) => {
        if (event.origin !== `${process.env.REACT_APP_API_BASE_URL}`) {
          console.warn("⚠️ Ignored message from unknown origin:", event.origin);
          return;
        }

        const { type, data } = event.data || {};

        if (type === "outlook-login-success") {
          console.log("✅ Outlook login success:", data);
          window.removeEventListener("message", messageHandler);
          clearInterval(interval);

          if (!popup.closed) popup.close();

          try {
            await onOutlookLoginSuccess(data);
          } catch (err) {
            console.error("Error processing Outlook login:", err);
            toast.error("Failed to complete Outlook login.");
          } finally {
            setIsProcessingOutlookLogin(false);
          }
        } else if (type === "outlook-login-failed") {
          console.warn("⚠️ Outlook login failed:", data);
          toast.error("Outlook login failed.");
          window.removeEventListener("message", messageHandler);
          clearInterval(interval);
          if (!popup.closed) popup.close();
          setIsProcessingOutlookLogin(false);
        }
      };

      window.addEventListener("message", messageHandler);

      const interval = setInterval(() => {
        if (popup.closed) {
          console.log("Popup closed by user.");
          clearInterval(interval);
          window.removeEventListener("message", messageHandler);
          setIsProcessingOutlookLogin(false);
        }
      }, 500);
    } catch (error) {
      console.error("Unexpected error during Outlook login:", error);
      toast.error("Something went wrong during Outlook login.");
      setIsProcessingOutlookLogin(false);
    }
  };

  const onOutlookLoginSuccess = async (outlookData) => {
    try {
      const userId = CookieService.get("user_id");
      const token = CookieService.get("token");

      if (!userId || !token) {
        toast.error("User session not found.");
        return;
      }

      // Fetch user data to get outlook_user_info
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data?.data;
      console.log("✅ User data fetched after Outlook login:", userData);

      if (!userData) {
        toast.error("User data not found.");
        return;
      }

      const { mail, displayName } = userData?.outlook_user_info || {};
      if (!mail || !displayName) {
        toast.error("Incomplete Outlook user information.");
        return;
      }

      // Update user state with Outlook links
      const updatedUser = {
        ...user,
        integration_links: [
          ...user.integration_links.filter(
            (link) => link.platform !== "Outlook Agenda"
          ),
          { platform: "Outlook Agenda", value: displayName },
        ],
        visioconference_links: [
          ...user.visioconference_links.filter(
            (link) => link.platform !== "Microsoft Teams"
          ),
          { platform: "Microsoft Teams", value: displayName },
        ],
        email_links: [
          ...user.email_links.filter((link) => link.platform !== "Outlook"),
          { platform: "Outlook", value: mail },
        ],
      };
      setUser(updatedUser);

      // Prepare FormData for profile update
      const formData = new FormData();
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

      user?.social_links?.forEach((link, index) => {
        if (link.id) formData.append(`social_links[${index}][id]`, link.id);
        formData.append(`social_links[${index}][platform]`, link.platform);
        formData.append(`social_links[${index}][link]`, link.link);
      });

      user?.websites?.forEach((site, index) => {
        if (site.id) formData.append(`websites[${index}][id]`, site.id);
        formData.append(`websites[${index}][title]`, site.title);
        formData.append(`websites[${index}][link]`, site.link);
      });

      user?.affiliation_links?.forEach((site, index) => {
        if (site.id)
          formData.append(`affiliation_links[${index}][id]`, site.id);
        formData.append(`affiliation_links[${index}][title]`, site.title);
        formData.append(`affiliation_links[${index}][link]`, site.link);
      });

      updatedUser.integration_links.forEach((link, index) => {
        if (link.id)
          formData.append(`integration_links[${index}][id]`, link.id);
        formData.append(`integration_links[${index}][platform]`, link.platform);
        formData.append(`integration_links[${index}][value]`, link.value);
      });

      updatedUser.visioconference_links.forEach((link, index) => {
        if (link.id)
          formData.append(`visioconference_links[${index}][id]`, link.id);
        formData.append(
          `visioconference_links[${index}][platform]`,
          link.platform
        );
        formData.append(`visioconference_links[${index}][value]`, link.value);
      });

      updatedUser.email_links.forEach((link, index) => {
        if (link.id) formData.append(`email_links[${index}][id]`, link.id);
        formData.append(`email_links[${index}][platform]`, link.platform);
        formData.append(`email_links[${index}][value]`, link.value);
      });

      user?.teams?.forEach((team) => {
        formData.append("team_id[]", team.id);
      });

      if (user?.image?.startsWith("data:image/")) {
        const blob = await (await fetch(user.image)).blob();
        formData.append("image", blob, "profile-image.jpg");
      } else if (user?.image) {
        formData.append("image", user.image);
      }

      if (user?.profile_banner?.startsWith("data:image/")) {
        const blob = await (await fetch(user.profile_banner)).blob();
        formData.append("profile_banner", blob, "profile-banner.jpg");
      } else if (user?.profile_banner) {
        formData.append("profile_banner", user.profile_banner);
      }

      if (user?.video?.startsWith("blob:")) {
        const blob = await (await fetch(user.video)).blob();
        formData.append("video", blob, "video-preview.mp4");
      } else if (user?.video) {
        formData.append("video", user.video);
      }

      const profileResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(
          `Failed to update user profile: ${profileResponse.status}`
        );
      }

      const responseData = await profileResponse.json();
      setUser(responseData?.data?.data || updatedUser);
      setCallUser((prev) => !prev);

      await getMeetingModal(checkId);

      setToggleStates((prevState) => ({
        ...prevState,
        Visioconference: selectedToggle === "Microsoft Teams" ? true : false,
        agenda: selectedToggle === "Outlook Agenda" ? true : false,
      }));
      setOutlookLoginCalled(true);

      // Store tokens from outlookData
      sessionStorage.setItem(
        "outlook_access_token",
        outlookData?.outlook_access_token
      );
      sessionStorage.setItem(
        "outlook_refresh_token",
        outlookData?.outlook_refresh_token
      );
      CookieService.set(
        "outlook_access_token",
        outlookData?.outlook_access_token
      );
      CookieService.set(
        "outlook_refresh_token",
        outlookData?.outlook_refresh_token
      );
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update Outlook data."
      );
    }
  };

  const loginOutlookAndSaveProfile = async () => {
    await outlookLoginAndSaveProfile();
  };

  if (isLoading) {
    return (
      <Spinner
        animation="border"
        role="status"
        className="center-spinner"
      ></Spinner>
    );
  }

  return (
    <>
      <div className="col-md-12 pt-0 modal-height d-flex flex-column">
        <Row className="m-0 p-0 flex-grow-1">
          <Col md={12}>
            <div className="list-group">
              <div className="row mt-4">
                <div className="col-md-6 mt-3">
                  <button
                    className={`list-group-item list-group-item-action p-3 ${
                      selectedLocation.meeting === "Visioconference"
                        ? "border-primary"
                        : ""
                    }`}
                    onClick={() => handleToggleChange("Visioconference")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M19.5 3.375H4.5C3.80381 3.375 3.13613 3.65156 2.64384 4.14384C2.15156 4.63613 1.875 5.30381 1.875 6V16.5C1.875 17.1962 2.15156 17.8639 2.64384 18.3562C3.13613 18.8484 3.80381 19.125 4.5 19.125H19.5C19.8447 19.125 20.1861 19.0571 20.5045 18.9252C20.823 18.7933 21.1124 18.5999 21.3562 18.3562C21.5999 18.1124 21.7933 17.823 21.9252 17.5045C22.0571 17.1861 22.125 16.8447 22.125 16.5V6C22.125 5.65528 22.0571 5.31394 21.9252 4.99546C21.7933 4.67698 21.5999 4.3876 21.3562 4.14384C21.1124 3.90009 20.823 3.70673 20.5045 3.57482C20.1861 3.4429 19.8447 3.375 19.5 3.375ZM19.875 16.5C19.875 16.5995 19.8355 16.6948 19.7652 16.7652C19.6948 16.8355 19.5995 16.875 19.5 16.875H4.5C4.40054 16.875 4.30516 16.8355 4.23484 16.7652C4.16451 16.6948 4.125 16.5995 4.125 16.5V6C4.125 5.90054 4.16451 5.80516 4.23484 5.73484C4.30516 5.66451 4.40054 5.625 4.5 5.625H19.5C19.5995 5.625 19.6948 5.66451 19.7652 5.73484C19.8355 5.80516 19.875 5.90054 19.875 6V16.5ZM16.125 21.375C16.125 21.6734 16.0065 21.9595 15.7955 22.1705C15.5845 22.3815 15.2984 22.5 15 22.5H9C8.70163 22.5 8.41548 22.3815 8.2045 22.1705C7.99353 21.9595 7.875 21.6734 7.875 21.375C7.875 21.0766 7.99353 20.7905 8.2045 20.5795C8.41548 20.3685 8.70163 20.25 9 20.25H15C15.2984 20.25 15.5845 20.3685 15.7955 20.5795C16.0065 20.7905 16.125 21.0766 16.125 21.375Z"
                              fill="#3D57B5"
                            />
                          </svg>
                        </span>
                        Visioconference
                      </div>
                      <div>
                        <ReactToggle
                          checked={toggleStates.Visioconference}
                          icons={false}
                          className="toggle-playback"
                          onChange={() => handleToggleChange("Visioconference")}
                        />
                      </div>
                    </div>
                  </button>

                  {toggleStates.Visioconference && (
                    <div className="p-4 pt-0 pb-1 create-moment-modal">
                      <div className="row form mt-3">
                        {/* Google Meet */}
                        <div className="mb-3 col-md-6 d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            id="googlemeet"
                            name="meetingPlatform"
                            value="Google Meet"
                            checked={selectedLocation.meeting === "Google Meet"}
                            onClick={() => {
                              if (
                                meeting?.user?.visioconference_links?.length ===
                                0
                              ) {
                                loginGoogleAndSaveProfileData();
                              }
                            }}
                            onChange={() => handleSelect("Google Meet")}
                          />
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
                              <path
                                d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
                                fill="white"
                              ></path>
                              <path
                                d="M5 23.5601C5 24.3557 5.64998 25.0001 6.45081 25.0001H6.47166C5.65857 25.0001 5 24.3557 5 23.5601Z"
                                fill="#FBBC05"
                              ></path>
                              <path
                                d="M17.4678 12.4V16.1596L22.5364 12.0712V8.43999C22.5364 7.6444 21.8864 7 21.0856 7H10.1045L10.0947 12.4H17.4678Z"
                                fill="#FBBC05"
                              ></path>
                              <path
                                d="M17.4671 19.9207H10.0818L10.0732 25.0003H21.085C21.887 25.0003 22.5358 24.3559 22.5358 23.5603V20.2819L17.4671 16.1611V19.9207Z"
                                fill="#34A853"
                              ></path>
                              <path
                                d="M10.1042 7L5 12.4H10.0956L10.1042 7Z"
                                fill="#EA4335"
                              ></path>
                              <path
                                d="M5 19.9204V23.56C5 24.3556 5.65857 25 6.47166 25H10.0736L10.0821 19.9204H5Z"
                                fill="#1967D2"
                              ></path>
                              <path
                                d="M10.0956 12.3999H5V19.9203H10.0821L10.0956 12.3999Z"
                                fill="#4285F4"
                              ></path>
                              <path
                                d="M26.9926 22.2796V9.9197C26.7068 8.27931 24.9077 10.1597 24.9077 10.1597L22.5371 12.0713V20.2804L25.9305 23.0392C27.1557 23.2 26.9926 22.2796 26.9926 22.2796Z"
                                fill="#34A853"
                              ></path>
                              <path
                                d="M17.4678 16.1594L22.5377 20.2814V12.0723L17.4678 16.1594Z"
                                fill="#188038"
                              ></path>
                            </g>
                          </svg>
                          {meeting?.user?.visioconference_links?.length > 0 ? (
                            <>
                              {meeting?.user?.visioconference_links
                                ?.filter(
                                  (item) => item.platform === "Google Meet"
                                )
                                ?.map((item) => (
                                  <div key={item?.platform}>
                                    <label htmlFor="googlemeet">
                                      {item?.value}
                                    </label>
                                  </div>
                                ))}
                            </>
                          ) : (
                            <label
                              htmlFor="googlemeet"
                              onClick={() => loginGoogleAndSaveProfileData()}
                            >
                              Google Meet
                            </label>
                          )}
                        </div>
                        {/* Microsoft Teams  */}
                        {/* <div className="mb-3 col-md-6 d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            id="Microsoft Teams"
                            name="teamPlatform"
                            value="Microsoft Teams"
                            checked={
                              selectedLocation.meeting === "Microsoft Teams"
                            }
                            onClick={() => {
                              if (
                                meeting?.user?.visioconference_links?.length ===
                                  0 ||
                                !meeting?.user?.visioconference_links?.some(
                                  (item) => item.platform === "Microsoft Teams"
                                )
                              ) {
                                loginOutlookAndSaveProfile();
                              }
                            }}
                            onChange={() => handleSelect("Microsoft Teams")}
                          />
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
                              <rect
                                x="10"
                                y="2"
                                width="20"
                                height="28"
                                rx="2"
                                fill="#1066B5"
                              />
                              <rect
                                x="10"
                                y="2"
                                width="20"
                                height="28"
                                rx="2"
                                fill="url(#paint0_linear_87_7742)"
                              />
                              <rect
                                x="10"
                                y="5"
                                width="10"
                                height="10"
                                fill="#32A9E7"
                              />
                              <rect
                                x="10"
                                y="15"
                                width="10"
                                height="10"
                                fill="#167EB4"
                              />
                              <rect
                                x="20"
                                y="15"
                                width="10"
                                height="10"
                                fill="#32A9E7"
                              />
                              <rect
                                x="20"
                                y="5"
                                width="10"
                                height="10"
                                fill="#58D9FD"
                              />
                              <mask
                                id="mask0_87_7742"
                                maskUnits="userSpaceOnUse"
                                x="8"
                                y="14"
                                width="24"
                                height="16"
                              >
                                <path
                                  d="M8 14H30C31.1046 14 32 14.8954 32 16V28C32 29.1046 31.1046 30 30 30H10C8.89543 30 8 29.1046 8 28V14Z"
                                  fill="url(#paint1_linear_87_7742)"
                                />
                              </mask>
                              <g mask="url(#mask0_87_7742)">
                                <path d="M32 14V18H30V14H32Z" fill="#135298" />
                                <path
                                  d="M32 30V16L7 30H32Z"
                                  fill="url(#paint2_linear_87_7742)"
                                />
                                <path
                                  d="M8 30V16L33 30H8Z"
                                  fill="url(#paint3_linear_87_7742)"
                                />
                              </g>
                              <path
                                d="M8 12C8 10.3431 9.34315 9 11 9H17C18.6569 9 20 10.3431 20 12V24C20 25.6569 18.6569 27 17 27H8V12Z"
                                fill="#000000"
                                fill-opacity="0.3"
                              />
                              <rect
                                y="7"
                                width="18"
                                height="18"
                                rx="2"
                                fill="url(#paint4_linear_87_7742)"
                              />
                              <path
                                d="M14 16.0693V15.903C14 13.0222 11.9272 11 9.01582 11C6.08861 11 4 13.036 4 15.9307V16.097C4 18.9778 6.07278 21 9 21C11.9114 21 14 18.964 14 16.0693ZM11.6424 16.097C11.6424 18.0083 10.5665 19.1579 9.01582 19.1579C7.46519 19.1579 6.37342 17.9806 6.37342 16.0693V15.903C6.37342 13.9917 7.44937 12.8421 9 12.8421C10.5348 12.8421 11.6424 14.0194 11.6424 15.9307V16.097Z"
                                fill="white"
                              />
                              <defs>
                                <linearGradient
                                  id="paint0_linear_87_7742"
                                  x1="10"
                                  y1="16"
                                  x2="30"
                                  y2="16"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stop-color="#064484" />
                                  <stop offset="1" stop-color="#0F65B5" />
                                </linearGradient>
                                <linearGradient
                                  id="paint1_linear_87_7742"
                                  x1="8"
                                  y1="26.7692"
                                  x2="32"
                                  y2="26.7692"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stop-color="#1B366F" />
                                  <stop offset="1" stop-color="#2657B0" />
                                </linearGradient>
                                <linearGradient
                                  id="paint2_linear_87_7742"
                                  x1="32"
                                  y1="23"
                                  x2="8"
                                  y2="23"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stop-color="#44DCFD" />
                                  <stop
                                    offset="0.453125"
                                    stop-color="#259ED0"
                                  />
                                </linearGradient>
                                <linearGradient
                                  id="paint3_linear_87_7742"
                                  x1="8"
                                  y1="23"
                                  x2="32"
                                  y2="23"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stop-color="#259ED0" />
                                  <stop offset="1" stop-color="#44DCFD" />
                                </linearGradient>
                                <linearGradient
                                  id="paint4_linear_87_7742"
                                  x1="0"
                                  y1="16"
                                  x2="18"
                                  y2="16"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stop-color="#064484" />
                                  <stop offset="1" stop-color="#0F65B5" />
                                </linearGradient>
                              </defs>
                            </g>
                          </svg>
                          {meeting?.user?.visioconference_links?.some(
                            (item) => item.platform === "Microsoft Teams"
                          ) ? (
                            <>
                              {meeting?.user?.visioconference_links
                                ?.filter(
                                  (item) => item.platform === "Microsoft Teams"
                                )
                                ?.map((item) => (
                                  <div key={item?.platform}>
                                    <label htmlFor="Microsoft Teams">
                                      {item?.value}
                                    </label>
                                  </div>
                                ))}
                            </>
                          ) : (
                            <label
                              htmlFor="Microsoft Teams"
                              onClick={() => loginOutlookAndSaveProfile()}
                            >
                              Microsoft Teams
                            </label>
                          )}
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mt-3">
                  <button
                    className={`list-group-item list-group-item-action p-3 ${
                      selectedLocation === "Address" ? "border-primary" : ""
                    }`}
                    onClick={() => handleToggleChange("Address")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>
                          <svg
                            width="24"
                            height="24"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 255.856 255.856"
                            xmlSpace="preserve"
                          >
                            <g>
                              <path
                                fill="#3D57B5"
                                d="M127.928,38.8c-30.75,0-55.768,25.017-55.768,55.767s25.018,55.767,55.768,55.767
          s55.768-25.017,55.768-55.767S158.678,38.8,127.928,38.8z M127.928,135.333c-22.479,0-40.768-18.288-40.768-40.767
          S105.449,53.8,127.928,53.8s40.768,18.288,40.768,40.767S150.408,135.333,127.928,135.333z"
                              />
                              <path
                                fill="#3D57B5"
                                d="M127.928,0C75.784,0,33.362,42.422,33.362,94.566c0,30.072,25.22,74.875,40.253,98.904
          c9.891,15.809,20.52,30.855,29.928,42.365c15.101,18.474,20.506,20.02,24.386,20.02c3.938,0,9.041-1.547,24.095-20.031
          c9.429-11.579,20.063-26.616,29.944-42.342c15.136-24.088,40.527-68.971,40.527-98.917C222.495,42.422,180.073,0,127.928,0z
          M171.569,181.803c-19.396,31.483-37.203,52.757-43.73,58.188c-6.561-5.264-24.079-26.032-43.746-58.089
          c-22.707-37.015-35.73-68.848-35.73-87.336C48.362,50.693,84.055,15,127.928,15c43.873,0,79.566,35.693,79.566,79.566
          C207.495,112.948,194.4,144.744,171.569,181.803z"
                              />
                            </g>
                          </svg>
                        </span>
                        {t("meeting.formState.address")}
                      </div>
                      <div>
                        <ReactToggle
                          checked={toggleStates.Address}
                          icons={false}
                          onChange={() => handleToggleChange("Address")}
                          className="toggle-playback"
                        />
                      </div>
                    </div>
                  </button>
                  {toggleStates.Address && (
                    <div className="p-4 pt-0 pb-1 create-moment-modal">
                      <div
                        className="row form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="mb-2 col-lg-12">
                          <input
                            type="text"
                            required
                            className="form-control w-100"
                            value={formState.address}
                            name="address"
                            onChange={(e) => {
                              setFormState({
                                ...formState,
                                address: e.target.value,
                              });
                            }}
                            disabled={meeting?.type === "Google Agenda Event" || meeting?.type === "Outlook Agenda Event"}
                            placeholder={t("meeting.formState.address")}
                            style={{ marginTop: "1rem" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mt-3">
                  <button
                    className={`list-group-item list-group-item-action p-3 ${
                      selectedLocation === "Room" ? "border-primary" : ""
                    }`}
                    onClick={() => {
                      handleToggleChange("Room");
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>
                          <svg
                            width="24"
                            height="24"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 255.856 255.856"
                            xmlSpace="preserve"
                          >
                            <g>
                              <path
                                fill="#3D57B5"
                                d="M127.928,38.8c-30.75,0-55.768,25.017-55.768,55.767s25.018,55.767,55.768,55.767
          s55.768-25.017,55.768-55.767S158.678,38.8,127.928,38.8z M127.928,135.333c-22.479,0-40.768-18.288-40.768-40.767
          S105.449,53.8,127.928,53.8s40.768,18.288,40.768,40.767S150.408,135.333,127.928,135.333z"
                              />
                              <path
                                fill="#3D57B5"
                                d="M127.928,0C75.784,0,33.362,42.422,33.362,94.566c0,30.072,25.22,74.875,40.253,98.904
          c9.891,15.809,20.52,30.855,29.928,42.365c15.101,18.474,20.506,20.02,24.386,20.02c3.938,0,9.041-1.547,24.095-20.031
          c9.429-11.579,20.063-26.616,29.944-42.342c15.136-24.088,40.527-68.971,40.527-98.917C222.495,42.422,180.073,0,127.928,0z
          M171.569,181.803c-19.396,31.483-37.203,52.757-43.73,58.188c-6.561-5.264-24.079-26.032-43.746-58.089
          c-22.707-37.015-35.73-68.848-35.73-87.336C48.362,50.693,84.055,15,127.928,15c43.873,0,79.566,35.693,79.566,79.566
          C207.495,112.948,194.4,144.744,171.569,181.803z"
                              />
                            </g>
                          </svg>
                        </span>
                        {t("meeting.formState.Room")}
                      </div>
                      <div style={{ cursor: "pointer", color: "#8282AE" }}>
                        <label>
                          <ReactToggle
                            checked={toggleStates.Room}
                            icons={false}
                            onChange={() => handleToggleChange("Room")}
                            className="toggle-playback"
                          />
                        </label>
                      </div>
                    </div>
                  </button>
                  {toggleStates.Room && (
                    <div
                      className="p-4 pb-1 create-moment-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="row form">
                        <div className="mb-2 col-lg-12 col-sm-12">
                          <label className="form-label">
                            {t("meeting.formState.RoomDetail")}
                          </label>
                          <textarea
                            required
                            className="form-control"
                            value={formState.room_details || ""}
                            onChange={handleInputChange}
                            name="room_details"
                            placeholder={t("meeting.formState.RoomPlaceholder")}
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mt-3">
                  <button
                    className={`list-group-item list-group-item-action p-3 ${
                      selectedLocation === "phone" ? "border-primary" : ""
                    }`}
                    onClick={() => {
                      handleToggleChange("phone");
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>
                          <svg
                            width="24px"
                            height="24px"
                            viewBox="0 0 24.00 24.00"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
                            stroke="#ffffff"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke="#CCCCCC"
                              stroke-width="1.272"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              <path
                                d="M15 3C16.5315 3.17014 17.9097 3.91107 19 5C20.0903 6.08893 20.8279 7.46869 21 9M14.5 6.5C15.2372 6.64382 15.9689 6.96892 16.5 7.5C17.0311 8.03108 17.3562 8.76284 17.5 9.5M8.20049 15.799C1.3025 8.90022 2.28338 5.74115 3.01055 4.72316C3.10396 4.55862 5.40647 1.11188 7.87459 3.13407C14.0008 8.17945 6.5 8 11.3894 12.6113C16.2788 17.2226 15.8214 9.99995 20.8659 16.1249C22.8882 18.594 19.4413 20.8964 19.2778 20.9888C18.2598 21.717 15.0995 22.6978 8.20049 15.799Z"
                                stroke="#3D57B5"
                                stroke-width="1.272"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></path>
                            </g>
                          </svg>
                        </span>
                        {t("meeting.formState.Phone")}
                      </div>
                      <div style={{ cursor: "pointer", color: "#8282AE" }}>
                        <label>
                          <ReactToggle
                            checked={toggleStates.phone}
                            icons={false}
                            onChange={() => handleToggleChange("phone")}
                            className="toggle-playback"
                          />
                        </label>
                      </div>
                    </div>
                  </button>
                  {toggleStates.phone && (
                    <div
                      className="p-4 pb-1 create-moment-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="row form">
                        <div className="mb-2 col-lg-12 col-sm-12">
                          <label className="form-label">
                            {t("meeting.formState.phone")}
                          </label>
                          <input
                            type="tel"
                            required
                            name="phone"
                            className="form-control"
                            value={formState.phone || ""}
                            onChange={handleInputChange}
                            placeholder={t("meeting.formState.phoneNumber")}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-6 mt-3">
                  <button
                    className={`list-group-item list-group-item-action p-3 ${
                      selectedLocation.agenda === "agenda"
                        ? "border-primary"
                        : ""
                    }`}
                    onClick={() => handleToggleChange("agenda")}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <g id="SVGRepo_bgCarrier" stroke-width="0" />
                            <g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <g id="SVGRepo_iconCarrier">
                              <path
                                d="M3 9H21M7 3V5M17 3V5M6 13H8M6 17H8M11 13H13M11 17H13M16 13H18M16 17H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                                stroke="#3D57B5"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </g>
                          </svg>
                        </span>
                        Agenda
                      </div>
                      <div>
                        <ReactToggle
                          checked={toggleStates.agenda}
                          icons={false}
                          className="toggle-playback"
                          onChange={() => handleToggleChange("agenda")}
                        />
                      </div>
                    </div>
                  </button>
                  {toggleStates.agenda && (
                    <div className="p-4 pt-0 pb-1 create-moment-modal">
                      <div className="row form mt-3">
                        {/* Google Agenda */}
                        <div className="mb-3 col-md-6 d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            id="googleagenda"
                            name="agendaPlatform"
                            value="Google Agenda"
                            checked={
                              selectedLocation.agenda === "Google Agenda"
                            }
                            onClick={() => {
                              if (
                                meeting?.user?.integration_links?.length ===
                                  0 ||
                                !meeting?.user?.integration_links?.some(
                                  (item) => item.platform === "Google Agenda"
                                )
                              ) {
                                loginGoogleAndSaveProfileData();
                              }
                            }}
                            onChange={() => handleSelectAgenda("Google Agenda")}
                            style={{ marginRight: "5px" }}
                          />
                          <FcGoogle
                            style={{ color: "#0A66C2" }}
                            className="fs-5"
                          />
                          {meeting?.user?.integration_links?.some(
                            (item) => item.platform === "Google Agenda"
                          ) ? (
                            <>
                              {meeting?.user?.integration_links
                                ?.filter(
                                  (item) => item.platform === "Google Agenda"
                                )
                                ?.map((item) => (
                                  <div key={item?.id}>
                                    <label htmlFor="googleagenda">
                                      {item?.value}
                                    </label>
                                  </div>
                                ))}
                            </>
                          ) : (
                            <label
                              htmlFor="googleagenda"
                              onClick={() => loginGoogleAndSaveProfileData()}
                            >
                              Google Agenda
                            </label>
                          )}
                        </div>
                        {/* Outlook Agenda */}
                        <div className="mb-3 col-md-6 d-flex align-items-center gap-1">
                          <input
                            type="radio"
                            id="outlookagenda"
                            name="agendaPlatform"
                            value="Outlook Agenda"
                            checked={
                              selectedLocation.agenda === "Outlook Agenda"
                            }
                            onClick={() => {
                              if (
                                meeting?.user?.integration_links?.length ===
                                  0 ||
                                !meeting?.user?.integration_links?.some(
                                  (item) => item.platform === "Outlook Agenda"
                                )
                              ) {
                                loginOutlookAndSaveProfile();
                              }
                            }}
                            onChange={() =>
                              handleSelectAgenda("Outlook Agenda")
                            }
                            style={{ marginRight: "5px" }}
                          />
                          <SiMicrosoftoutlook
                            style={{ color: "#0078D4" }}
                            className="fs-5"
                          />
                          {meeting?.user?.integration_links?.some(
                            (item) => item.platform === "Outlook Agenda"
                          ) ? (
                            <>
                              {meeting?.user?.integration_links
                                ?.filter(
                                  (item) => item.platform === "Outlook Agenda"
                                )
                                ?.map((item) => (
                                  <div key={item?.id}>
                                    <label htmlFor="outlookagenda">
                                      {item?.value}
                                    </label>
                                  </div>
                                ))}
                            </>
                          ) : (
                            <label
                              htmlFor="outlookagenda"
                              onClick={() => loginOutlookAndSaveProfile()}
                            >
                              Outlook
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Location;
