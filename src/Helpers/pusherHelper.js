import Pusher from "pusher-js";

const APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY || "4f8a77a9e7d65f541d54";
const APP_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER || "eu";

let pusherInstance = null;
const subscriptions = {};
const boundHandlers = {}; // track bound callbacks per channel

// Initialize a single shared Pusher client (public, no auth needed)
export const getPusherClient = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(APP_KEY, {
      cluster: APP_CLUSTER,
      forceTLS: true,
    });
  }
  return pusherInstance;
};

/**
 * Subscribe to the public meeting channel: meeting.{meetId}
 * Listens for both backend-emitted events:
 *   - "step.updated"      → step data changed (navigate, pause, save content, etc.)
 *   - "meeting.ui-updated" → host changed UI state (toggle open/close)
 *
 * @param {string|number} meetId
 * @param {function} onEvent - called with { type, data } for every event
 * @returns {object} the Pusher channel
 */
export const subscribeToMeeting = (meetId, onEvent) => {
  if (!meetId) return null;
  const channelName = `meeting.${meetId}`;
  const pusher = getPusherClient();

  // Subscribe if not already subscribed
  if (!subscriptions[channelName]) {
    console.log(`[Pusher] Subscribing to channel: ${channelName}`);
    subscriptions[channelName] = pusher.subscribe(channelName);
  }

  const channel = subscriptions[channelName];

  // Always rebind so we use the latest onEvent callback
  if (boundHandlers[channelName]) {
    channel.unbind("step.updated", boundHandlers[channelName].stepUpdated);
    channel.unbind("meeting.ui-updated", boundHandlers[channelName].uiUpdated);
  }

  const stepUpdated = (data) => {
    console.log("[Pusher] step.updated received:", data);
    onEvent({ type: "step.updated", data });
  };
  const uiUpdated = (data) => {
    console.log("[Pusher] meeting.ui-updated received:", data);
    onEvent({ type: "meeting.ui-updated", data });
  };

  channel.bind("step.updated", stepUpdated);
  channel.bind("meeting.ui-updated", uiUpdated);

  boundHandlers[channelName] = { stepUpdated, uiUpdated };

  return channel;
};

/**
 * Unsubscribe and clean up
 */
export const unsubscribeFromMeeting = (meetId) => {
  if (!meetId) return;
  const channelName = `meeting.${meetId}`;
  const pusher = getPusherClient();

  if (subscriptions[channelName]) {
    console.log(`[Pusher] Unsubscribing from channel: ${channelName}`);
    pusher.unsubscribe(channelName);
    delete subscriptions[channelName];
    delete boundHandlers[channelName];
  }
};
