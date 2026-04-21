import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize messaging only if supported
export let messaging = null;
if ("Notification" in window && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
    console.log("Firebase Messaging initialized");
  } catch (error) {
    console.warn("Failed to initialize Firebase Messaging:", error);
  }
} else {
  console.warn(
    "Service workers or notifications not supported in this browser"
  );
}

// Register service worker only if supported
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js", { scope: "/" })
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
} else {
  console.warn("Service workers not supported, skipping registration");
}

// Get FCM token
// Get FCM token
export const getFcmToken = async () => {
  console.log("Starting getFcmToken...");
  console.log("Notification API supported:", "Notification" in window);
  console.log("Service Worker supported:", "serviceWorker" in navigator);
  console.log("Messaging initialized:", !!messaging);

  if (!("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers not supported in this browser");
    return null;
  }

  if (!messaging) {
    console.warn("Firebase Messaging not initialized");
    return null;
  }

  try {
    console.log("Current notification permission:", Notification.permission);
    if (Notification.permission === "denied") {
      console.warn("Notification permission previously denied");
      return null;
    }

    if (Notification.permission !== "granted") {
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Notification permission result:", permission);
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return null;
      }
    } else {
      console.log("Notification permission already granted");
    }

    console.log("Waiting for service worker...");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker ready:", registration);

    console.log("Fetching FCM token with VAPID key:", process.env.REACT_APP_FIREBASE_VAPID_KEY);
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};