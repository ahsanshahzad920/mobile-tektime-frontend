import CookieService from '../../Utils/CookieService';
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../Apicongfig";

// Common fetch function with proper payload handling
const fetchData = async (endpoint, method = "GET", payload) => {
  const token = CookieService.get("token");
  if (!token) return null;

  try {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(!(payload instanceof FormData) && {
          "Content-Type": "application/json",
        }),
      },
    };

    if (payload) {
      options.body =
        payload instanceof FormData ? payload : JSON.stringify(payload);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // Handle cases where response is not JSON
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      const error = new Error(data?.message || "Request failed");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in ${method} request to ${endpoint}:`, error);

    // Re-throw if it's already an Error with useful info
    if (error instanceof Error) {
      throw error;
    }

    // Fallback for network errors or unexpected types
    const fallbackError = new Error(error.message || "Network request failed");
    fallbackError.status = error.status;
    fallbackError.data = error.data;
    fallbackError.endpoint = endpoint;
    fallbackError.method = method;

    throw fallbackError;
  }
};

// Destination APIs
export const getAllDestinations = async () => {
  try {
    return await fetchData("/get-all-destinations");
  } catch (error) {
    toast.error(error?.message || "Error fetching destinations");
    throw error;
  }
};


// Assistant Destination APIs
export const getAllDestinationsForAssitant = async () => {
  try {
    
    return await fetchData("/get-all-destinations-for-assistant");
    // return await fetchData("/get-all-destinations");
  } catch (error) {
    toast.error(error?.message || "Error fetching destinations for assistant");
    throw error;
  }
};

//For Outlook Tab
export const getAllEmailDestinations = async () => {
  try {
    return await fetchData(`/outlook-email/all-destinations?sync=${true}`);
  } catch (error) {
    toast.error(error?.message || "Error fetching Outlook destinations");
    throw error;
  }
};

//For Ionos Tab
// export const getAllIonosEmailDestinations = (query = "sync=true") => fetchData(`/ionos-emails/all-destinations?${query}`);

export const getAllIonosEmailDestinations = async (query = "sync=true") => {
  try {
    return await fetchData(`/ionos-emails/all-destinations?${query}`);
  } catch (error) {
    toast.error(error?.message || "Error fetching Ionos destinations");
    throw error;
  }
};
//For Destination Meetings
export const getDestinationMeetings = (destinationId) =>
  fetchData(`/get-destination-all-meetings/${destinationId}`);

//For Outlook Destination Email Meetings
export const getDestinationEmailMeetings = (destinationId, page = 1, folder = "inbox", search = "") =>
  fetchData(`/outlook-email/destination-meetings/${destinationId}?page=${page}&folder=${folder}&q=${search}`);



//For Ionos Email Meetings
export const getIonosEmailMeetings = (destinationId, page = 1, folder = "inbox", search = "") =>
  fetchData(`/ionos-emails/destination-meetings/${destinationId}?page=${page}&folder=${folder}&q=${search}`);

//For Google Email Meetings
export const getAllGmailDestinations = async (query = "sync=true") => {
  try {
    return await fetchData(`/google-emails/all-destinations?${query}`);
  } catch (error) {
    toast.error(error?.message || "Error fetching Google destinations");
    throw error;
  }
};

export const getGmailDestinationMeetings = (destinationId, page = 1, folder = "inbox", search = "") =>
  fetchData(`/google-emails/destination-meetings/${destinationId}?page=${page}&folder=${folder}&q=${search}`);

// Meeting APIs
export const getMeetingMoments = (meetingId) =>
  fetchData(`/get-meeting-moments/${meetingId}`);
export const getMeetingParticipants = (meetingId) =>
  fetchData(`/get-meeting/${meetingId}`);
export const getMeetingMessages = (meetingId, messageId, selectedMomentId, folder = "inbox", search = "") => {
  let query = `?meeting_id=${selectedMomentId}&folder=${folder}&q=${search}`;
  if (messageId) {
    query += `&message_id=${messageId}`;
  }
  return fetchData(`/meeting-messages${query}`);
};

// Message APIs
export const createMessage = (messageData) =>
  fetchData("/meeting-messages", "post", messageData);
export const updateMessage = (messageId, messageData) =>
  fetchData(`/meeting-messages/${messageId}`, messageData, "put");
export const deleteMessage = (messageId) =>
  fetchData(`/meeting-messages/${messageId}`, "delete");

//Chatbot Missions API
export const getAllChatbots = (id) => fetchData(`/chatbot_conversations/${id}`);

export const getAllEmailsLabeling = (payload, page = 1) =>
  fetchData(`/all-emails-labeling?page=${page}`, "POST", payload);

// Assistant APIs
export const getAssistantMessages = () =>
  fetchData("/assistant/messages", "GET");

export const getAssistantDestinationMessages = (destinationId) =>
  // fetchData(`/assistant/messages/${destinationId}`, "GET");
  fetchData(`/get-all-destinations-for-assistant/${destinationId}`, "GET");

export const sendAssistantChat = (message, destination_id) =>
  fetchData("/assistant/chat", "POST", { message, destination_id });

export const getAssistantProfile = () =>
  fetchData("/assistant", "GET");
