// ⚠️ importScripts MUST be at the very top before everything else
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize Firebase BEFORE registering any event listeners
firebase.initializeApp({
  apiKey: "AIzaSyCGvHv2sXo2BET8soCidUcjbxhGo5YBjBk",
  authDomain: "tektime-be9b8.firebaseapp.com",
  projectId: "tektime-be9b8",
  storageBucket: "tektime-be9b8.appspot.com",
  messagingSenderId: "221855587819",
  appId: "1:221855587819:web:c93cc2c7e2732009714dae",
  measurementId: "G-3M1L4Y208Z",
});

const messaging = firebase.messaging();

// Take control of all clients immediately on activation
self.addEventListener("install", (event) => {
  // Skip waiting so the new SW activates right away
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim all open windows/tabs so this SW controls them immediately
  event.waitUntil(self.clients.claim());
});

// A fetch event listener is REQUIRED for PWA installability in most browsers.
// Even a minimal one that does nothing (just passes through) is sufficient.
self.addEventListener("fetch", (event) => {
  // We can just let the request pass through to the network.
  // This satisfies the browser's requirement for installability.
});

// -----------------------------------------------------------------------
// Handle BACKGROUND messages (app is closed / not focused)
// Firebase automatically suppresses duplicate notifications if the server
// payload already contains a "notification" key. We always call
// showNotification ourselves so the badge, data and icon are correct.
// -----------------------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "Nouvelle notification";
  const notificationBody =
    payload.notification?.body || payload.data?.body || "";
  const notificationImage = payload.notification?.image || payload.data?.image;
  const redirectUrl =
    payload.data?.click_action ||
    payload.fcmOptions?.link ||
    payload.data?.url ||
    "https://tektime.io/meeting";

  const notificationOptions = {
    body: notificationBody,
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    tag: "tektime-notification", // replaces previous unread notification instead of stacking
    renotify: true,              // still vibrate/sound even if same tag
    data: {
      url: redirectUrl,
      ...payload.data,
    },
  };

  if (notificationImage && notificationImage.startsWith("https://")) {
    notificationOptions.image = notificationImage;
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// -----------------------------------------------------------------------
// Handle notification click – open / focus the correct page
// -----------------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "https://tektime.io/meeting";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Try to find an already-open tab with the same origin
        const matchingClient = windowClients.find((client) => {
          try {
            const clientUrl = new URL(client.url);
            const targetUrl = new URL(url);
            return clientUrl.origin === targetUrl.origin;
          } catch (e) {
            return false;
          }
        });

        if (matchingClient) {
          // Focus the existing tab and navigate it to the target URL
          matchingClient.navigate(url);
          return matchingClient.focus();
        } else {
          return self.clients.openWindow(url);
        }
      })
  );
});
