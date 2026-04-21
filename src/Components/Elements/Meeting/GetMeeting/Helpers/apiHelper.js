import CookieService from '../../../../Utils/CookieService';
import axios from "axios";
import { API_BASE_URL } from "../../../../Apicongfig";
import { getAuthHeaders } from "./auth";
import moment from "moment";
import { formatDate, formatTime } from "./functionHelper";

export const updateMeetingStatus = async (e, meeting, navigate) => {
  e.stopPropagation();
  const { id } = meeting;
  try {
    const postData = {
      ...meeting,
      // real_end_time: realEndTime,
      abort_end_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      status: "abort",
      _method: "put",
      step_notes: null,
      steps: meeting?.steps?.map((step) => ({
        ...step,
          step_status: "cancelled",
          status: "cancelled",
      })),
      delay: null,
      moment_privacy_teams:
        meeting?.moment_privacy_teams?.map((item) => item?.id) || [],
    };
    const response = await axios.post(
      `${API_BASE_URL}/meetings/${id}/status`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      }
    );
    if (response.status) {
      navigate("/meeting");
    }
  } catch (error) {
    console.log("error ", error);
  }
};

export const copyMeetingApi = async (meetingId, postData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/meetings/${meetingId}`,
      postData,
      {
        headers: getAuthHeaders(),
      }
    );

    return response?.data?.data; // Return response data for further processing
  } catch (error) {
    console.error("API Error: Failed to copy meeting", error);
    throw error; // Throw error to be handled in `handleCopy`
  }
};

export const getMeeting = async (
  id,
  setMeeting,
  setIsLoading,
  setStatus,
  updateSteps
) => {
  const currentTime = new Date();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const options = { timeZone: userTimeZone };
  const timeInUserZone = new Date(currentTime.toLocaleString("en-US", options));

  const formattedTime = formatTime(timeInUserZone);
  const formattedDate = formatDate(timeInUserZone);

  setIsLoading(true);
  try {
    const response = await axios.get(
      `${API_BASE_URL}/get-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}`
    );

    if (response.status) {
      const { data } = response;
      setStatus(data?.data?.status);

      const steps = data?.data?.steps;
      updateSteps(steps);

      setMeeting(data?.data);
    }
  } catch (error) {
    console.log("error while fetching meeting data", error);
  } finally {
    setIsLoading(false);
  }
};
