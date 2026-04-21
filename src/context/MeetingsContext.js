import CookieService from '../Components/Utils/CookieService';
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Components/Apicongfig";
import { askPermission } from "../Components/Utils/askPermission";
import {
  formatDate,
  formatTime,
} from "../Components/Elements/Meeting/GetMeeting/Helpers/functionHelper";

const MeetingsContext = createContext();

export const useMeetings = () => useContext(MeetingsContext);

export const MeetingsProvider = ({ children }) => {
  const [allMeetings, setAllMeetings] = useState([]);
  const [combineMeetings, setCombineMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allClosedMeetings, setAllClosedMeetings] = useState([]);
  const [allDraftMeetings, setAllDraftMeetings] = useState([]);
  const [allEventMeetings, setAllEventMeetings] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("TODAY");
  const [offset, setOffset] = useState(0);
  const [progress, setProgress] = useState(0); // State for progress
  const [meetingLength, setMeetingLength] = useState(0);
  const [combineMeetingLength, setCombineMeetingLength] = useState(0);

  const [activeMeetingCount, setActiveMeetingCount] = useState(0);
  const [closedMeetingCount, setClosedMeetingCount] = useState(0);
  const [unreadMeetingCount, setUnreadMeetingCount] = useState(0);
  const [upcomingMeetingCount, setUpcomingMeetingCount] = useState(0);
  const [noStatusMeetingCount, setNoStatusMeetingCount] = useState(0);
  const [draftMeetingCount, setDraftMeetingCount] = useState(0);
  const [agendaEventCount, setAgendaEventCount] = useState(0);
  const [limit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [callApi, setCallApi] = useState(() => {
    const stored = CookieService.get("callApi");
    return stored === "false" ? false : true; // default to true if not set
  });
  const [fromTektime, setFromTektime] = useState(() => {
    const stored = CookieService.get("fromTektime");
    return stored === "true"; // ✅ will default to false unless "true"
  });

  const [selectedClosedFilter, setSelectedClosedFilter] = useState("TODAY");
  const [closedOffset, setClosedOffset] = useState(0);
  const [closedLimit] = useState(5);
  const [closedHasMore, setClosedHasMore] = useState(true);
  const [closedLoading, setClosedLoading] = useState(false);
  const [closedProgress, setClosedProgress] = useState(0); // State for progress
  const [closedMeetingLength, setClosedMeetingLength] = useState(0);
  //Draft
  const [draftOffset, setDraftOffset] = useState(0);
  const [draftLimit] = useState(5);
  const [draftHasMore, setDraftHasMore] = useState(true);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftProgress, setDraftProgress] = useState(0); // State for progress
  const [draftMeetingLength, setDraftMeetingLength] = useState(0);
  const [agendaCount, setAgendaCount] = useState(0);
  //Google Agenda Events
  const [agendaEventOffset, setAgendaEventOffset] = useState(0);
  const [agendaEventLimit] = useState(5);
  const [agendaEventHasMore, setAgendaEventHasMore] = useState(true);
  const [agendaEventLoading, setAgendaEventLoading] = useState(false);
  const [agendaEventProgress, setAgendaEventProgress] = useState(0); // State for progress
  const [agendaEventLength, setAgendaEventLength] = useState(0);

  const [calendar, setCalendar] = useState(false);

  const [selectedAgenda, setSelectedAgenda] = useState({
    tektime: true,
    google: true,
    outlook:true,
    zoom: false,
  });
  const [syncAgenda, setSyncAgenda] = useState(false);

  const getAgendaEvents = useCallback(async () => {
    setProgress(0); // Reset progress to 0 at the start
    setLoading(true);
    setIsLoading(true);
    const userId = parseInt(CookieService.get("user_id"));
    // Start a progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms

    try {
      const currentTime = new Date();
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const options = { timeZone: userTimeZone };
      const timeInUserZone = new Date(
        currentTime.toLocaleString("en-US", options)
      );

      const formattedTime = formatTime(timeInUserZone);
      const formattedDate = formatDate(timeInUserZone);

      const response = await axios.get(
        `${API_BASE_URL}/get-google-events/${userId}?current_time=${formattedTime}&current_date=${formattedDate}&timezone=${userTimeZone}`,
        {
          params: {
            offset: agendaEventOffset,
            limit: agendaEventLimit,
          },
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response?.data) {
        const data = response?.data?.data;
        setActiveMeetingCount(response?.data?.count);
        setHasMore(data.length === limit); // Check if more data is available

        setAllMeetings((prev) => {
          const updatedMeetings = offset === 0 ? data : [...prev, ...data];
          return [
            ...new Map(updatedMeetings.map((item) => [item.id, item])).values(),
          ]; // assuming item.id is the unique identifier
        });
        setUserInfo(data?.user_info);
        setMeetingLength(data?.length);
        setIsLoading(false);
        setLoading(false);
        setProgress(100); // Set progress to 100% upon completion
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);
      setLoading(false);
    }
  }, [agendaEventOffset, agendaEventLimit, limit, offset]);

  const [perPage, setPerPage] = useState(15);
  const [closedPerPage, setClosedPerPage] = useState(15);

  // 🟢 ACTIVE MEETINGS
  const getMeetings = useCallback(async (type, pageNo = 1, replace = false) => {
    const isFirstPage = pageNo === 1 || replace;
    if (isFirstPage) {
      setProgress(0);
      setLoading(true);
    }
    setIsLoading(true);

    const cleanType = type?.includes("-") ? type.split("-")[1] : type;

    // Only simulate progress for first page
    const interval = isFirstPage
      ? setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200)
      : null;

    try {
      const response = await axios.get(`${API_BASE_URL}/get-meetings-by-type`, {
        params: {
          type: cleanType,
          page: pageNo, // ✅ use page number instead of offset
        },
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });

      if (response?.data?.data) {
        setActiveMeetingCount(response?.data?.count);
        const pData = response?.data?.data;
        const data = pData?.data || [];
        
        // Update per_page if available
        if (pData?.per_page) setPerPage(pData.per_page);

        // ✅ Determine if there are more pages
        const currentPage = pData?.current_page || 1;
        const lastPage = pData?.last_page || 1;
        setHasMore(currentPage < lastPage);

        // ✅ Append or replace based on first page
        setAllMeetings((prev) => {
          const updatedMeetings = isFirstPage ? data : [...prev, ...data];
          return [
            ...new Map(updatedMeetings.map((item) => [item.id, item])).values(),
          ];
        });

        setMeetingLength(data?.length);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsLoading(false);

      if (isFirstPage && interval) {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    }
  }, []);

  // 🔵 CLOSED MEETINGS
  const getClosedMeetings = useCallback(async (type, pageNo = 1, replace = false) => {
    const isFirstPage = pageNo === 1 || replace;
    if (isFirstPage) {
      setClosedProgress(0);
      setClosedLoading(true);
    }
    setIsLoading(true);

    const cleanType = type?.includes("-") ? type.split("-")[1] : type;

    // Only simulate progress for first page
    const interval = isFirstPage
      ? setInterval(() => {
          setClosedProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200)
      : null;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-closed-meetings-by-type`,
        {
          params: {
            type: cleanType,
            page: pageNo, // ✅ switched from offset/limit to page
          },
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status) {
        setClosedMeetingCount(response?.data?.count);
        const pData = response?.data?.data;
        const data = pData?.data || [];

        // ✅ Determine pagination
        if (pData?.per_page) setClosedPerPage(pData.per_page);
        const currentPage = pData?.current_page || 1;
        const lastPage = pData?.last_page || 1;
        setClosedHasMore(currentPage < lastPage);

        setClosedMeetingLength(data?.length);

        // ✅ Merge or reset data
        setAllClosedMeetings((prev) => {
          const updatedMeetings = isFirstPage ? data : [...prev, ...data];
          return [
            ...new Map(updatedMeetings.map((item) => [item.id, item])).values(),
          ];
        });
      }
    } catch (error) {
      console.error("Error fetching closed meetings:", error);
    } finally {
      setIsLoading(false);

      if (isFirstPage && interval) {
        clearInterval(interval);
        setClosedProgress(100);
        setClosedLoading(false);
      }
    }
  }, []);

  // 🟡 UNREAD MEETINGS
  const getUnreadMeetings = useCallback(async (type, pageNo = 1, replace = false) => {
    const isFirstPage = pageNo === 1 || replace;
    if (isFirstPage) {
      setProgress(0);
      setLoading(true);
    }
    setIsLoading(true);

    const cleanType = type?.includes("-") ? type.split("-")[1] : type;

    // Simulate progress for first page
    const interval = isFirstPage
      ? setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200)
      : null;

    try {
      const response = await axios.get(`${API_BASE_URL}/get-unread-meetings-by-type`, {
        params: { type: cleanType, page: pageNo },
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response?.data?.data) {
        setUnreadMeetingCount(response?.data?.count || 0);
        const pData = response?.data?.data;
        const data = pData?.data || [];
        if (pData?.per_page) setPerPage(pData.per_page);
        const currentPage = pData?.current_page || 1;
        const lastPage = pData?.last_page || 1;
        setHasMore(currentPage < lastPage);

        setAllMeetings((prev) => {
          const updatedMeetings = isFirstPage ? data : [...prev, ...data];
          return [...new Map(updatedMeetings.map((item) => [item.id, item])).values()];
        });
      }
    } catch (error) {
      console.error("Error fetching unread meetings:", error);
    } finally {
      setIsLoading(false);
      if (isFirstPage && interval) {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    }
  }, []);

  // 🟠 UPCOMING MEETINGS
  const getUpcomingMeetings = useCallback(async (type, pageNo = 1, replace = false) => {
    const isFirstPage = pageNo === 1 || replace;
    if (isFirstPage) {
      setProgress(0);
      setLoading(true);
    }
    setIsLoading(true);

    const cleanType = type?.includes("-") ? type.split("-")[1] : type;

    // Simulate progress for first page
    const interval = isFirstPage
      ? setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200)
      : null;

    try {
      const response = await axios.get(`${API_BASE_URL}/get-upcoming-meetings-by-type`, {
        params: { type: cleanType, page: pageNo },
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response?.data?.data) {
        setUpcomingMeetingCount(response?.data?.count || 0);
        const pData = response?.data?.data;
        const data = pData?.data || [];
        if (pData?.per_page) setPerPage(pData.per_page);
        const currentPage = pData?.current_page || 1;
        const lastPage = pData?.last_page || 1;
        setHasMore(currentPage < lastPage);

        setAllMeetings((prev) => {
          const updatedMeetings = isFirstPage ? data : [...prev, ...data];
          return [...new Map(updatedMeetings.map((item) => [item.id, item])).values()];
        });
      }
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
    } finally {
      setIsLoading(false);
      if (isFirstPage && interval) {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    }
  }, []);

  // 🔴 NO STATUS MEETINGS
  const getNoStatusMeetings = useCallback(async (type, pageNo = 1, replace = false) => {
    const isFirstPage = pageNo === 1 || replace;
    if (isFirstPage) {
      setProgress(0);
      setLoading(true);
    }
    setIsLoading(true);

    const cleanType = type?.includes("-") ? type.split("-")[1] : type;

    // Simulate progress for first page
    const interval = isFirstPage
      ? setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200)
      : null;

    try {
      const response = await axios.get(`${API_BASE_URL}/get-nostatus-meetings-by-type`, {
        params: { type: cleanType, page: pageNo },
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response?.data?.data) {
        setNoStatusMeetingCount(response?.data?.count || 0);
        const pData = response?.data?.data;
        const data = pData?.data || [];
        if (pData?.per_page) setPerPage(pData.per_page);
        const currentPage = pData?.current_page || 1;
        const lastPage = pData?.last_page || 1;
        setHasMore(currentPage < lastPage);

        setAllMeetings((prev) => {
          const updatedMeetings = isFirstPage ? data : [...prev, ...data];
          return [...new Map(updatedMeetings.map((item) => [item.id, item])).values()];
        });
      }
    } catch (error) {
      console.error("Error fetching no status meetings:", error);
    } finally {
      setIsLoading(false);
      if (isFirstPage && interval) {
        clearInterval(interval);
        setProgress(100);
        setLoading(false);
      }
    }
  }, []);

  const getCombineMeetings = useCallback(async (forceSync = false) => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setProgress(0); // Reset progress to 0 at the start
    setLoading(true);
    setIsLoading(true);

    // Start a progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms

    // Use forceSync parameter instead of syncAgenda state
    const shouldSync = forceSync || syncAgenda;

    // Reset offset to 0 if forceSync is true
    const currentOffset = forceSync ? 0 : offset;
    try {
      const response = await axios.get(`${API_BASE_URL}/all-toggle-meetings`, {
        params: {
          tektime_agenda: selectedAgenda.tektime,
          google_agenda: selectedAgenda.google,
          offset: currentOffset,
          limit: limit,
          current_time: formattedTime,
          current_date: formattedDate,
          timezone: userTimeZone,
          sync_agenda: shouldSync,
        },
        headers: {
          Authorization: `Bearer ${CookieService.get("token")}`,
        },
      });
      if (response?.data && response?.data?.data) {
        setActiveMeetingCount(response?.data?.count);
        const data = response?.data?.data;
        setHasMore(data.length === limit); // Check if more data is available

        // Always replace data when forceSync is true
        setAllMeetings(
          forceSync
            ? data
            : (prev) => {
                const updatedMeetings =
                  offset === 0 ? data : [...prev, ...data];
                return [
                  ...new Map(
                    updatedMeetings.map((item) => [item.id, item])
                  ).values(),
                ];
              }
        );

        setMeetingLength(data?.length);
        setIsLoading(false);
        setLoading(false);
        setProgress(100); // Set progress to 100% upon completion
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);
      setLoading(false);
      setSyncAgenda(false);
    }
  }, [syncAgenda, offset, limit, selectedAgenda.tektime, selectedAgenda.google]);

  const getMeetingsCalculations = async () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
    // Format date
    const year = currentTime.getFullYear();
    const month = (currentTime.getMonth() + 1).toString().padStart(2, "0");
    const day = currentTime.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/calculate-meetings-time?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        // setAllMeetings(response?.data?.data);
        // setIsLoading(false);
      }
    } catch (error) {}
  };

  const getDraftMeetings = useCallback(async (offsetParam = draftOffset) => {
    setDraftProgress(0);
    setIsLoading(true);
    setDraftLoading(true);

    const interval = setInterval(() => {
      setDraftProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await axios.get(`${API_BASE_URL}/draft/meetings`, {
        params: {
          offset: offsetParam,
          limit: draftLimit,
        },
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response.status) {
        setDraftMeetingCount(response?.data?.count);
        const data = response?.data?.data;
        setDraftHasMore(data?.length === draftLimit);
        setDraftMeetingLength(data?.length);

        setAllDraftMeetings((prev) => {
          if (offsetParam === 0) {
            return data;
          }
          const combined = [...prev, ...data];
          return [...new Map(combined.map((item) => [item.id, item])).values()];
        });

        setIsLoading(false);
        setDraftLoading(false);
        setDraftProgress(100);
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      clearInterval(interval);
      setDraftProgress(100);
      setIsLoading(false);
      setDraftLoading(false);
    }
  }, [draftOffset, draftLimit]);

  const handleDelete = useCallback(async (id) => {
    const permissionGranted = askPermission(
      "Êtes-vous sûr de vouloir supprimer cette réunion ?" ||
        "Are you sure you want to delete this meeting?"
    );

    if (!permissionGranted) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/meetings/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response.status === 200) {
        toast.success("Réunion supprimée avec succès");
        getMeetings();
      } else {
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [getMeetings]);

  const contextValue = React.useMemo(() => ({
    allMeetings,
    isLoading,
    getMeetings,
    allClosedMeetings,
    getClosedMeetings,
    getUnreadMeetings,
    getUpcomingMeetings,
    getNoStatusMeetings,
    allDraftMeetings,

    setAllDraftMeetings,

    handleDelete,
    status,
    setStatus,
    getMeetingsCalculations,
    setAllMeetings,
    setMeetingLength,
    selectedFilter,
    setSelectedFilter,
    selectedClosedFilter,
    setSelectedClosedFilter,

    setAllClosedMeetings,
    offset,
    setOffset,
    limit,
    hasMore,
    setHasMore,
    loading,
    setLoading,
    setClosedMeetingLength,

    closedOffset,
    setClosedOffset,
    closedLimit,
    closedHasMore,
    setClosedHasMore,
    closedLoading,
    setClosedLoading,

    draftOffset,
    setDraftOffset,
    draftLimit,
    draftHasMore,
    setDraftHasMore,
    draftLoading,
    setDraftLoading,

    progress,
    setProgress,
    meetingLength,

    closedProgress,
    closedMeetingLength,

    draftProgress,
    draftMeetingLength,
    setDraftMeetingLength,

    activeMeetingCount,
    closedMeetingCount,
    unreadMeetingCount,
    upcomingMeetingCount,
    noStatusMeetingCount,
    draftMeetingCount,
    getDraftMeetings,
    getAgendaEvents,
    setAllEventMeetings,
    setUserInfo,
    userInfo,
    allEventMeetings,
    setAgendaEventCount,
    agendaEventCount,
    setAgendaEventOffset,
    agendaEventOffset,
    agendaEventLimit,
    agendaEventHasMore,
    setAgendaEventHasMore,
    agendaEventLoading,
    setAgendaEventLoading,
    agendaEventProgress,
    setAgendaEventProgress,
    agendaEventLength,
    setAgendaEventLength,

    selectedAgenda,
    setSelectedAgenda,

    setCombineMeetings,
    combineMeetings,
    getCombineMeetings,
    combineMeetingLength,
    setCombineMeetingLength,

    setCallApi,
    callApi,
    setFromTektime,
    fromTektime,

    setCalendar,
    calendar,

    syncAgenda,
    setSyncAgenda,
    setAgendaCount,
    agendaCount,
    perPage,
    closedPerPage,
  }), [
    allMeetings, isLoading, getMeetings, allClosedMeetings, getClosedMeetings, getDraftMeetings, 
    allDraftMeetings, status, selectedFilter, selectedClosedFilter, offset, hasMore, loading, 
    closedOffset, closedHasMore, closedLoading, draftOffset, draftHasMore, draftLoading, 
    progress, meetingLength, closedProgress, closedMeetingLength, draftProgress, draftMeetingLength, 
    activeMeetingCount, closedMeetingCount, unreadMeetingCount, upcomingMeetingCount,
    noStatusMeetingCount, draftMeetingCount, userInfo, allEventMeetings, 
    agendaEventCount, agendaEventOffset, agendaEventHasMore, agendaEventLoading, 
    agendaEventProgress, agendaEventLength, selectedAgenda, combineMeetings, 
    combineMeetingLength, callApi, fromTektime, calendar, syncAgenda, agendaCount,
    getUnreadMeetings, getUpcomingMeetings, getNoStatusMeetings, perPage, closedPerPage
  ]);

  return (
    <MeetingsContext.Provider value={contextValue}>
      {children}
    </MeetingsContext.Provider>
  );
};
