import CookieService from '../Components/Utils/CookieService';
import React, { createContext, useCallback, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Components/Apicongfig";
import { askPermission } from "../Components/Utils/askPermission";

const DestinationsContext = createContext();

export const useDestinations = () => useContext(DestinationsContext);

export const DestinationsProvider = ({ children }) => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allCompletedDestinations, setAllCompletedDestinations] = useState([]);
  const [showProgress,setShowProgress] = useState(false);
  const [progress,setProgress] = useState(0);

  const [newDestinations,setNewDestinations ] = useState([])
  const [currentDestinations,setCurrentDestinations ] = useState([])
  const [closedDestinations,setClosedDestinations ] = useState([])

  const [newDestinationCount,setNewDestinationCount] = useState(0)
  const [currentDestinationCount,setCurrentDestinationCount] = useState(0)
  const [closedDestinationCount,setClosedDestinationCount] = useState(0)
  const [userHaveMeetings,setUserHaveMeetings] = useState(1)
  const [userHaveSteps,setUserHaveSteps] = useState(1)
  const [userHaveMissions,setUserHaveMissions] = useState(1)


  const [roadMapData,setRoadMapData] = useState([])

  const getUserMeetingCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user-has-meetings/${CookieService.get("user_id")}`);
      if (response.status === 200) {
        // setUserHaveMeetings(response?.data?.count);
        setUserHaveMeetings(response?.data?.total_meeting_count);
        setUserHaveSteps(response?.data?.strategy_task_meeting_count);
        setUserHaveMissions(response?.data?.mission_total_count)
      }
    } catch (error) {
      console.error("Error fetching user meeting count:", error);
    }
  };
  

//  const getRoadMapData = useCallback(async (startDate, endDate) => {
//   setProgress(0);
//   setIsLoading(true);
  
//   const interval = setInterval(() => {
//     setProgress((prev) => {
//       if (prev >= 90) {
//         clearInterval(interval);
//         return 90;
//       }
//       return prev + 10;
//     });
//   }, 200);

//   try {
//     const response = await axios.get(`${API_BASE_URL}/destinations-roadmap`, {
//       headers: { Authorization: `Bearer ${CookieService.get("token")}` },
//       params: {
//         m_start_date: startDate,
//         m_end_date: endDate
//       }
//     });
    
//     if (response.status) {
//       setRoadMapData(response?.data?.data);
//     }
//   } catch (error) {
//     console.error('Error fetching roadmap data:', error);
//   } finally {
//     clearInterval(interval);
//     setProgress(100);
//     setIsLoading(false);
//   }
// }, []); // Empty dependency array since we don't use any external values

  const getNewDestinations = async () => {
    setProgress(0);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/new/destinations`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setNewDestinations(response?.data?.data);
        setClosedDestinationCount(response?.data?.closed_des_count)
        setNewDestinationCount(response?.data?.new_des_count)
        setCurrentDestinationCount(response?.data?.current_des_count)
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }finally{
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);


    }
  }
  const getCurrentDestinations = async () => {
    setProgress(0);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/current/destinations`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setCurrentDestinations(response?.data?.data);
        setClosedDestinationCount(response?.data?.closed_des_count)
        setNewDestinationCount(response?.data?.new_des_count)
        setCurrentDestinationCount(response?.data?.current_des_count)
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }finally{
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);


    }
  }
  const getClosedDestinations = async () => {
    setProgress(0);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/closed/destinations`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setClosedDestinations(response?.data?.data);
        setClosedDestinationCount(response?.data?.closed_des_count)
        setNewDestinationCount(response?.data?.new_des_count)
        setCurrentDestinationCount(response?.data?.current_des_count)
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }finally{
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);


    }
  }

  
  const getDestinations = async () => {
    setProgress(0);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setAllDestinations(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }finally{
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);


    }
  };

  const getAllCompletedDestinations = async () => {
    setProgress(0);
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
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setAllCompletedDestinations(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }finally{
      clearInterval(interval); // Clear the interval when done
      setProgress(100); // Set progress to 100% upon completion
      setIsLoading(false);
    }
  };
  const handleDelete = async (id) => {
    const permissionGranted = askPermission(
      "Êtes-vous sûr de vouloir supprimer cette réunion ?" ||
        "Are you sure you want to delete this Destinations?"
    );

    if (!permissionGranted) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/destinations/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response.status === 200) {
        toast.success("Réunion supprimée avec succès");
        getDestinations();
      } else {
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <DestinationsContext.Provider
      value={{
        allDestinations,
        isLoading,
        getDestinations,
        allCompletedDestinations,
        getAllCompletedDestinations,
        handleDelete,
        progress,


        newDestinations,
        getNewDestinations,
        currentDestinations,
        getCurrentDestinations,
        closedDestinations,
        getClosedDestinations,

        
  newDestinationCount,
  currentDestinationCount,
  closedDestinationCount,
  setNewDestinationCount,
  setCurrentDestinationCount,
  setClosedDestinationCount,


  userHaveMeetings,
  getUserMeetingCount,

  userHaveSteps,
  userHaveMissions,
  setUserHaveMissions
  

  // getRoadMapData,
  // roadMapData,
  // setRoadMapData,
  
      }}
    >
      {children}
    </DestinationsContext.Provider>
  );
};
