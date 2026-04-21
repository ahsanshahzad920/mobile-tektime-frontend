import { useState, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./style/LandindPages.scss";
import moment from "moment-timezone";
import Base from "./Components/Layout/Base";
import Signup from "./Components/Elements/Signup";
import { ToastContainer } from "react-toastify";
import Login from "./Components/Elements/Login";
import PrivateRoute from "./Components/Elements/PrivateRoute";
import Profile from "./Components/Elements/Profile/Profile";
import Contract from "./Components/Elements/Contract/Contract";
import Enterprises from "./Components/Elements/Enterprises/Enterprises";
import NewEnterprises from "./Components/Elements/Enterprises/NewEnterprises";
import Team from "./Components/Elements/Team/Team";
import Invities from "./Components/Elements/Invities/Invities";
import UpdateContract from "./Components/Elements/Contract/UpdateContract";
import UpdateEntreprises from "./Components/Elements/Enterprises/UpdateEntreprises";
import UpdateTeam from "./Components/Elements/Team/UpdateTeam";
import Users from "./Components/Elements/User/Users";
import ContractLinkEntreprises from "./Components/Elements/LinkPages/ContractLinkEntreprises";
import ContractToTeam from "./Components/Elements/LinkPages/ContractToTeam";
import EntreprisesToTeam from "./Components/Elements/LinkPages/EntreprisesToTeam";
import global_en from "./translations/en/global.json";
import global_fr from "./translations/fr/global.json";
import i18next from "i18next";
import CopyContract from "./Components/Elements/Contract/CopyContract";
import CopyClosedContract from "./Components/Elements/Contract/CopyClosedContract";
import ReadContract from "./Components/Elements/Contract/ReadContract";
import UpdateUser from "./Components/Elements/User/UpdateUser";
import ContractToUser from "./Components/Elements/LinkPages/ContractToUser";
import EnterprisesToUser from "./Components/Elements/LinkPages/EnterprisesToUser";
import MeetingTabs from "./Components/Elements/Meeting/MeetingTabs";
import ActionPlay from "./Components/Elements/Actions/ActionPlay";
import Invite from "./Components/Elements/Meeting/CurrentMeeting/Invite";
import { CounterContextProvider } from "./Components/Elements/Meeting/context/CounterContext";
import UpdatePassword from "./Components/Elements/User/UpdatePassword";
import axios from "axios";
import { API_BASE_URL } from "./Components/Apicongfig";
import Report from "./Components/Elements/Meeting/Report";
// import CustomerSupport from "./Components/Elements/CustomerSupport";
import CompletedInvite from "./Components/Elements/Meeting/CompletedMeeting/CompletedInvite";
import DestinationToMeetings from "./Components/Elements/Invities/DestinationToMeeting/DestinationToMeetings";
import BasePage from "./Components/Layout/BasePage";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Privacypolicy from "./Pages/Privacypolicy";
import Termsandconditions from "./Pages/Termsandconditions";
import Contactus from "./Pages/Contactus";
import ProfileInvitePage from "./Components/Elements/Profile/ProfileInvitePage";
import NewsletterTerms from "./Pages/NewsletterTerms.jsx";
import ActionTabs from "./Components/Elements/Actions/ActionTabs.jsx";
import SolutionTabs from "./Components/Elements/Solution/SolutionTabs.jsx";
import Solution from "./Components/Elements/Solution/GetSolution/Solution.jsx";
import CompletedDoneStep from "./Components/Elements/Meeting/CompletedMeeting/CompletedDoneStep.jsx";
import AddQuestionField from "./Components/Elements/QuestionsField/AddQuestionField.jsx";
import { StepCounterContextProvider } from "./Components/Elements/Meeting/context/StepCounterContext.js";
import CreateUsers from "./Components/Elements/User/CreateUsers.jsx";
import ClientDetail from "./Components/Elements/Team/Client/ClientDetail.jsx";
import MemberDetail from "./Components/Elements/Team/Member/MemberDetail.jsx";
import { messaging } from "./firebase.js";
import { onMessage } from "firebase/messaging";
import { closeSnackbar, useSnackbar } from "notistack";
import notificationSound from "./Media/notification.mp3";
import MeetingPreview from "./Components/Elements/Meeting/MeetingPreview.jsx";
import ContactDetail from "./Components/Elements/Team/Contact/ContactDetail.jsx";
import CastingMemberDetail from "./Components/Elements/Team/Member/CastingMemberDetail.jsx";
import CastingContactDetail from "./Components/Elements/Team/Contact/CastingContactDetail.jsx";
import Register from "./Components/Elements/Register.jsx";
import RegisterMoment from "./Components/Elements/RegisterMoment.jsx";
import RegisterMission from "./Components/Elements/RegisterMission.jsx";
import RegisterBtp from "./Components/Elements/RegisterBtp.jsx";
import ReferralLanding from "./Components/Elements/ReferralLanding.jsx";
import DiscussionTabs from "./Components/Elements/Discussion/DiscussionTabs.jsx";
import Settings from "./Components/Elements/Profile/Settings.jsx";
import Integrations from "./Components/Elements/Profile/Integrations.jsx";
import Assistant from "./Components/Elements/Profile/Assistant.jsx";
import PaymentSuccess from "./Pages/PaymentSuccess.jsx";
import PaymentCancel from "./Pages/PaymentCancel.jsx";
import AccessControl from "./Components/Elements/AccessControl";
import AccessDenied from "./Pages/AccessDenied";
import HomeMessages from "./Pages/Discussion/HomeMessages.jsx";
import CookieService from "./Components/Utils/CookieService";

i18next.init({
  interpolation: { escapevalue: false },
  lng: "fr",
  resources: {
    en: {
      global: global_en,
    },
    fr: {
      global: global_fr,
    },
  },
});

//
// Define all valid public and private routes
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms&conditions",
  "/contactus",
  "/pricing",
  "/useCase/1",
  "/useCase/2",
  "/useCase/3",
  "/useCase/4",
  "/payment-success",
  "/payment-cancel",
];

const privateRoutes = [
  "/profile",
  "/contract",
  "/CopyContract",
  "/CopyClosedContract",
  "/ModifierContract",
  "/ContractLinkEnterprises",
  "/readContract",
  "/ContractToTeam",
  "/ContractToUser",
  "/EntreprisesToTeam",
  "/EntreprisesToUsers",
  "/Enterprises",
  "/NewEnterprises",
  "/ModifierEnterprises",
  "/Team",
  "/ModifierTeam",
  "/Users",
  "/ModifierUser",
  "/Invities",
  "/invitiesToMeeting",
  "/participantToAction",
  "/updateParticipant",
  "/meeting",
  "/updatepassword",
  "/meetingDetail",
  "/play",
  "/actīon/play",
  "/PlayMeeting",
  "/view",
  "/invite",
  "/destination/:unqiue_id/:meeting_id",
  "/newsletter/terms-and-conditions",
  "/present/invite",
  "/step",
  "/todo-step",
  "/action",
  "/solution",
  "/question",
  "/message/:id",
  "/solution",
];

// Function to check if the route is valid
const isValidRoute = (path, isSignedIn) => {
  return publicRoutes.includes(path) || privateRoutes.includes(path);
};

function App() {
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(() => {
    return !!CookieService.get("token");
  });

  console.log("m...");
  // useEffect(() => {
  //   // Setup axios interceptors
  //   setupAxiosInterceptors(navigate);

  // }, [navigate]);

  useEffect(() => {
    if (!messaging) {
      console.warn(
        "Firebase Messaging not available, skipping onMessage listener"
      );
      return;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔔 Foreground message received:", payload);

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification";
      const body = payload.notification?.body || payload.data?.body || "";
      const image =
        payload.notification?.image ||
        payload.data?.image ||
        "/icons/icon-192x192.png";

      const audio = new Audio(notificationSound);
      audio.play().catch((err) => console.log("Sound error:", err));

      enqueueSnackbar(body, {
        variant: "default",
        anchorOrigin: { vertical: "top", horizontal: "center" },
        autoHideDuration: 5000,
        content: (key, message) => {
          const url =
            payload.data?.click_action || payload.notification?.click_action;

          return (
            <div
              key={key}
              onClick={() => {
                if (url) {
                  navigate(url, { state: { from: "meeting" } });
                }
                closeSnackbar(key);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
                padding: "1.25rem",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                maxWidth: 420,
                width: "100%",
                gap: "1rem",
                cursor: "pointer",
                animation: "fadeSlideIn 0.3s ease",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <img
                src={image || "/icons/icon-192x192.png"}
                alt="Notification"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "12px",
                  objectFit: "cover",
                  objectPosition: "left",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: "0.35rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#4a4a4a",
                    lineHeight: 1.4,
                  }}
                >
                  {message}
                </div>
              </div>
              <style>
                {`
                  @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}
              </style>
            </div>
          );
        },
      });
    });

    return () => unsubscribe();
  }, [enqueueSnackbar, navigate]);

  //   useEffect(()=>{
  //     // getFcmToken()
  //  // Handle incoming messages when app is in foreground
  // onMessage(messaging, (payload) => {
  //   console.log("Foreground message received:", payload);

  //   // Customize how you want to show the notification
  //   const notificationTitle = payload.notification?.title || payload.data?.title;
  //   const notificationOptions = {
  //     body: payload.notification?.body || payload.data?.body,
  //     icon: '/icons/icon-192x192.png',
  //     image: payload.notification?.image || payload.data?.image
  //   };

  //   // Show notification using the Notification API
  //   if (Notification.permission === "granted") {
  //     new Notification(notificationTitle, notificationOptions);
  //   } else {
  //     console.log("Notification permission not granted");
  //   }
  // });
  //   },[])
  const [removeLogo, setRemoveLogo] = useState(false);

  const signin = () => {
    setIsSignedIn(true);
    setRemoveLogo(true);
  };

  const signout = async () => {
    // 1. Capture necessary data BEFORE clearing cookies
    const token = CookieService.get("token");
    const userId = CookieService.get("user_id");
    const logoutTime = new Date().toLocaleString(); 

    // 2. Clear local session IMMEDIATELY for better UX
    CookieService.set("logoutTime", logoutTime);
    setIsSignedIn(false);
    setRemoveLogo(false);
    CookieService.clear();

    // 3. Navigate to login RIGHT AWAY
    navigate("/");

    // 4. Send logout notification to server in the background
    if (token && userId) {
      updateUserWithToken(userId, token);
    }
  };

  useEffect(() => {
    const userTimezone = moment.tz.guess();

    CookieService.set("timezone", userTimezone);
  }, []);

  // Update function with explicit token passing to support background logout
  const updateUserWithToken = async (userId, token, useBeacon = false) => {
    const id = parseInt(userId);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload = {
      user_id: id,
    };

    if (useBeacon) {
      const url = `${API_BASE_URL}/logout`;
      navigator.sendBeacon(url, JSON.stringify(payload));
    } else {
      try {
        await axios.post(`${API_BASE_URL}/logout`, payload, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Error updating User background logout:", error);
      }
    }
  };

  // Original updateUser for other cases (if needed)
  const updateUser = async (useBeacon = false) => {
    const userId = CookieService.get("user_id");
    const token = CookieService.get("token");
    if (userId && token) {
      return updateUserWithToken(userId, token, useBeacon);
    }
  };


  useEffect(() => {
    const hasToken = !!CookieService.get("token");
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (hasToken && (location.pathname === "/")) {
      navigate("/meeting");
    } else if (!hasToken && location.pathname === "/" && isMobile) {
      // For mobile users, redirect root to login as requested
      navigate("/");
    }
  }, [location.pathname, navigate]);
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
        }
      )
      .then((response) => {
        if (response) {
          const newAccessToken = response.data.access_token;
          const newExpiresIn = response.data.expires_in; // e.g., 3598 seconds

          // Update the stored tokens and expiration time
          CookieService.set("access_token", newAccessToken);

          const newExpirationTime = Date.now() + newExpiresIn * 1000;
          CookieService.set("token_expiration_time", newExpirationTime);

          // Set a new timeout to refresh the access token again
          setTimeout(refreshAccessToken, (newExpiresIn - 60) * 1000); // Refresh 1 minute before expiration
        }
      })
      .catch((error) => {
        handleInvalidToken();
      });
  }

  function handleInvalidToken() {
    CookieService.remove("access_token");
    CookieService.remove("refresh_token");
    CookieService.remove("token_expiration_time");
  }

  // Function to check token expiration and refresh
  function checkTokenExpiration() {
    const tokenExpirationTime = CookieService.get("token_expiration_time");
    if (!tokenExpirationTime) return;

    const currentTime = Date.now();
    if (currentTime > tokenExpirationTime) {
      CookieService.remove("access_token");
      CookieService.remove("token_expiration_time");
      refreshAccessToken();
    } else {
      console.log("not expired now!");
    }
  }


  useEffect(() => {
    const intervalId = setInterval(() => {
      const tokenExpirationTime = CookieService.get("token_expiration_time");
      if (!tokenExpirationTime) return;

      const currentTime = Date.now();
      if (currentTime > parseInt(tokenExpirationTime)) {
        console.log("Token expired, refreshing...");
        refreshAccessToken();
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

 useEffect(() => {
    // Add a condition to prevent redirect loops
    if (
      window.location.href === "https://mobile.tektime.io/" &&
      window.location.href !== "https://mobile.tektime.io"
    ) {
      window.location.replace("https://mobile.tektime.io");
    }
  }, []);

  return (
    <div>
      <ToastContainer
        autoClose={3000}
        closeOnClick
      // style={{
      //   position: "absolute",
      //   zIndex: "4",
      // }}
      />

      <Routes>
        {/* <Route path="/" element={<Login onLogin={signin} />} /> */}
        <Route path="/" element={<Login onLogin={signin} />} />
        <Route
          path="/heroes/:nick_name/emissary/:referral_id"
          element={<ReferralLanding />}
        />
       

        <Route path="/signup" element={<Signup />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route
          path="/heroes/:nick_name"
          element={<ProfileInvitePage onLogout={signout} />}
        />
        <Route
          element={
            <Base
              isAuthenticated={isSignedIn}
              onLogout={signout}
              onLogin={signin}
              onRemove={removeLogo}
            />
          }
        >
          {CookieService.get("type") === "MasterAdmin" &&
            CookieService.get("type") != "SuperAdmin" &&
            CookieService.get("type") != "Admin" && (
              <Route
                path="/contract"
                element={
                  <PrivateRoute isSignedIn={isSignedIn}>
                    <Contract onLogout={signout} />
                  </PrivateRoute>
                }
              />
            )}
          <Route
            path="/CopyContract/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CopyContract onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/CopyClosedContract/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CopyClosedContract onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ModifierContract/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdateContract onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ContractLinkEnterprises/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ContractLinkEntreprises onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/readContract/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ReadContract onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ContractToTeam/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ContractToTeam onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ContractToUser/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ContractToUser onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/EntreprisesToTeam/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <EntreprisesToTeam onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/EntreprisesToUsers/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <EnterprisesToUser onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/Enterprises"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Enterprises onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/NewEnterprises"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <NewEnterprises onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ModifierEnterprises/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdateEntreprises onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/Team"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="casting_need"> */}
                  <Team onLogout={signout} />
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />
          <Route
            path="/client/:id"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ClientDetail onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/member/:id"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <MemberDetail onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/casting/member/:destination_id/:id"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CastingMemberDetail onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact/:id"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ContactDetail onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/casting/contact/:destination_id/:id"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CastingContactDetail onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/discussion"
            exact
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="discussion_need"> */}
                  <DiscussionTabs onLogout={signout} />
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />
          <Route
            path="/ModifierTeam/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdateTeam onLogout={signout} />
              </PrivateRoute>
            }
          />

          <Route
            path="/Users/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Users onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/create"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CreateUsers onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/ModifierUser/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdateUser onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/Invities"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="mission_need"> */}
                  <Invities onLogout={signout} />
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />
          <Route
            path="/invitiesToMeeting/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <DestinationToMeetings onLogout={signout} />
              </PrivateRoute>
            }
          />

          {/* <Route
            path="/participantToAction/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <ParticipantToAction onLogout={signout} />
              </PrivateRoute>
            }
          /> */}

          {/* <Route
            path="/updateParticipant/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdateParticipant onLogout={signout} />
              </PrivateRoute>
            }
          /> */}

          <Route
            path="/meeting"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="meeting_need"> */}
                  <MeetingTabs onLogout={signout} />
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Profile onLogout={signout} />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile/integrations"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Integrations onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/assistant"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Assistant onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/settings"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Settings onLogout={signout} />
              </PrivateRoute>
            }
          />

          {/* UpdatePassword Route */}
          <Route
            path="/updatepassword"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <UpdatePassword onLogout={signout} />
              </PrivateRoute>
            }
          />

          {/* <Route
            path="/participant/:id"
            element={<UpdateParticipant onLogout={signout} />}
          /> */}

          {/* <Route
            path="/play/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CounterContextProvider>
                  <Play onLogout={signout} />
                </CounterContextProvider>
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/actīon-play/:id/:step_Id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <StepCounterContextProvider>
                  <ActionPlay onLogout={signout} />
                </StepCounterContextProvider>
              </PrivateRoute>
            }
          />

          {/* <Route
            path="/PlayMeeting/:id"
            element={
              <CounterContextProvider>
                <PlayMeeting />
              </CounterContextProvider>
            }
          /> */}
          <Route
            path="/view/:id"
            element={<MeetingPreview onLogout={signout} />}
          />


          <Route
            path="/invite/:id"
            element={
              // <StepCounterContextProvider>
              <Invite onLogout={signout} />
              // </StepCounterContextProvider>
            }
          />
          <Route
            path="/destination/:unqiue_id/:meeting_id"
            element={
              <CounterContextProvider>
                <Report />
              </CounterContextProvider>
            }
          // element={<Presentationreport />}
          />
          <Route
            path="/newsletter/terms-and-conditions"
            element={<NewsletterTerms />}
          // element={<Presentationreport />}
          />

          <Route
            path="/present/invite/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CompletedInvite onLogout={signout} />
              </PrivateRoute>
            }
          />

          <Route
            path="/step/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CompletedDoneStep onLogout={signout} />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/todo-step/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <TodoStepScreen onLogout={signout} />
              </PrivateRoute>
            }
          /> */}
          {/* <Route
            path="/customer-support"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <CustomerSupport onLogout={signout} />
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/action"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="action_need"> */}
                  <StepCounterContextProvider>
                    <ActionTabs onLogout={signout} />
                  </StepCounterContextProvider>
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />

          <Route
            path="/solution"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                {/* <AccessControl need="solution_need"> */}
                  <SolutionTabs onLogout={signout} />
                {/* </AccessControl> */}
              </PrivateRoute>
            }
          />
          <Route
            path="/question"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <AddQuestionField onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/message/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <AddQuestionField onLogout={signout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/solution/:id"
            element={
              <PrivateRoute isSignedIn={isSignedIn}>
                <Solution onLogout={signout} />
              </PrivateRoute>
            }
          />
        </Route>
        {/* Wildcard Route - Redirects Based on Auth Status */}
        {/* <Route
          path="*"
          element={
            isSignedIn ? (
              <Navigate to="/Team" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        /> */}
      </Routes>

      <BasePage>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/register/:referral_id?" element={<Register />} />
          <Route
            path="/gate/moment/:referral_id?"
            element={<RegisterMoment />}
          />
          <Route
            path="/gate/mission/:referral_id?"
            element={<RegisterMission />}
          />
          <Route path="/gate/btp/:referral_id?" element={<RegisterBtp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contactus />} />
          <Route path="/privacy" element={<Privacypolicy />} />
          <Route path="/privacy-policy" element={<Privacypolicy />} />
          <Route
            path="/gate/:name"
            element={<HomeMessages />}
          />
          <Route
            path="/terms-and-conditions"
            element={<Termsandconditions />}
          />
          <Route path="/contactus" element={<Contactus />} />

        </Routes>
      </BasePage>
    </div>
  );
}

export default App;
