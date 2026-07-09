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
    if (boundHandlers[channelName].content) {
      channel.unbind("content", boundHandlers[channelName].content);
    }
    if (boundHandlers[channelName].aiGenerationFinished) {
      channel.unbind("ai_generation_finished", boundHandlers[channelName].aiGenerationFinished);
    }
  }

  const stepUpdated = (data) => {
    console.log("[Pusher] step.updated received:", data);
    onEvent({ type: "step.updated", data });
  };
  const uiUpdated = (data) => {
    console.log("[Pusher] meeting.ui-updated received:", data);
    onEvent({ type: "meeting.ui-updated", data });
  };
  const content = (data) => {
    console.log("[Pusher] content received:", data);
    onEvent({ type: "content", data });
  };
  const aiGenerationFinished = (data) => {
    console.log("[Pusher] ai_generation_finished received:", data);
    onEvent({ type: "ai_generation_finished", data });
  };

  channel.bind("step.updated", stepUpdated);
  channel.bind("meeting.ui-updated", uiUpdated);
  channel.bind("content", content);
  channel.bind("ai_generation_finished", aiGenerationFinished);

  boundHandlers[channelName] = { stepUpdated, uiUpdated, content, aiGenerationFinished };

  return channel;
};

// Callbacks multiples par canal (plusieurs composants peuvent écouter
// "agenda.synced" : la vue calendrier ET le contexte, par ex.).
const agendaHandlers = {}; // channelName -> Set<function>

/**
 * S'abonner au canal personnel de l'utilisateur : user.{userId}
 * Écoute l'event "agenda.synced" émis par le back quand l'agenda change
 * (synchro Google/Outlook, ou création/suppression d'une réunion TekTIME)
 * -> permet de rafraîchir la vue SANS refresh manuel.
 *
 * Supporte PLUSIEURS abonnés sur le même canal (bind Pusher fait une seule
 * fois ; tous les callbacks enregistrés sont appelés).
 *
 * @param {string|number} userId
 * @param {function} onSync - appelée (avec les données de l'event) à chaque event
 * @returns {function} fonction de désabonnement de CE callback
 */
export const subscribeToUserAgenda = (userId, onSync) => {
  if (!userId || typeof onSync !== "function") return () => {};
  const channelName = `user.${userId}`;
  const pusher = getPusherClient();

  if (!subscriptions[channelName]) {
    console.log(`[Pusher] Subscribing to channel: ${channelName}`);
    subscriptions[channelName] = pusher.subscribe(channelName);
    agendaHandlers[channelName] = new Set();
    // bind UNE seule fois : dispatch à tous les callbacks enregistrés
    subscriptions[channelName].bind("agenda.synced", (data) => {
      console.log("[Pusher] agenda.synced received:", data);
      (agendaHandlers[channelName] || new Set()).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          /* un callback en échec ne doit pas bloquer les autres */
        }
      });
    });
  }

  if (!agendaHandlers[channelName]) agendaHandlers[channelName] = new Set();
  agendaHandlers[channelName].add(onSync);

  // désabonnement de CE callback uniquement
  return () => {
    if (agendaHandlers[channelName]) agendaHandlers[channelName].delete(onSync);
  };
};

/**
 * Se désabonner complètement du canal personnel de l'utilisateur.
 */
export const unsubscribeFromUserAgenda = (userId) => {
  if (!userId) return;
  const channelName = `user.${userId}`;
  const pusher = getPusherClient();

  if (subscriptions[channelName]) {
    console.log(`[Pusher] Unsubscribing from channel: ${channelName}`);
    pusher.unsubscribe(channelName);
    delete subscriptions[channelName];
    delete boundHandlers[channelName];
    delete agendaHandlers[channelName];
  }
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
