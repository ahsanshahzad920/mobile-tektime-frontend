// This file is intentionally left minimal.
// The Firebase Messaging service worker (firebase-messaging-sw.js) is
// registered inside src/firebase.js, which ensures Firebase gets the
// correct ServiceWorkerRegistration object for its getToken() call.
// Registering the same SW here again would create a race condition.
// We simply do nothing here so the browser picks up the SW from firebase.js.
