import CookieService from '../Components/Utils/CookieService';
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../Components/Apicongfig";
import { askPermission } from "../Components/Utils/askPermission";

const SolutionsContext = createContext();

export const useSolutions = () => useContext(SolutionsContext);

export const SolutionsProvider = ({ children }) => {
  const [privateSolutions, setPrivateSolutions] = useState([]);
  const [draftSolutions, setDraftSolutions] = useState([]);
  const [publicSolutions, setPublicSolutions] = useState([]);
  const [teamSolutions, setTeamSolutions] = useState([]);
  const [enterpriseSolutions, setEnterpriseSolutions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  //   const [allClosedMeetings, setAllClosedMeetings] = useState([]);
  const [status, setStatus] = useState(null);

  //   const getMeetingsCalculations = async () => {
  //     const currentTime = new Date();
  //     const hours = currentTime.getHours();
  //     const minutes = currentTime.getMinutes();
  //     const seconds = currentTime.getSeconds();
  //     const ampm = hours >= 12 ? "PM" : "AM";
  //     const formattedHours = hours % 12 || 12;
  //     const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  //     const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
  //     const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  //     // Format date
  //     const year = currentTime.getFullYear();
  //     const month = (currentTime.getMonth() + 1).toString().padStart(2, "0");
  //     const day = currentTime.getDate().toString().padStart(2, "0");
  //     const formattedDate = `${year}-${month}-${day}`;
  //     try {
  //       const response = await axios.get(`${API_BASE_URL}/calculate-meetings-time?current_time=${formattedTime}&current_date=${formattedDate}`, {
  //         headers: { Authorization: `Bearer ${CookieService.get("token")}` },
  //       });
  //       if (response.status) {
  //         // setAllMeetings(response?.data?.data);
  //         // setIsLoading(false);
  //       }
  //     } catch (error) {
  //     }
  //   };

  // GET:  /draft/solutions
  // GET:  /public/solutions
  // GET:  /team/solution
  // GET:  /enterprise/solutions
  // GET:  /solutions     (active, current solution)
  const getPrivateSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/solutions`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setPrivateSolutions(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getPublicSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/public/solutions`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setPublicSolutions(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getDraftSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/draft/solutions`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setDraftSolutions(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getTeamSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/team/solution`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setTeamSolutions(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getEnterpriseSolutions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/enterprise/solutions`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response.status) {
        setEnterpriseSolutions(response?.data?.data);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  //   const getClosedMeetings = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(`${API_BASE_URL}/closed/meetings`, {
  //         headers: { Authorization: `Bearer ${CookieService.get("token")}` },
  //       });
  //       if (response.status) {
  //         setAllClosedMeetings(response?.data?.data);
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       setIsLoading(false);
  //     }
  //   };

  const handleDelete = async (id) => {
    const permissionGranted = askPermission(
      "Êtes-vous sûr de vouloir supprimer cette réunion ?" ||
        "Are you sure you want to delete this meeting?"
    );

    if (!permissionGranted) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      if (response.status === 200) {
        toast.success("Réunion supprimée avec succès");
        getPrivateSolutions();
      } else {
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <SolutionsContext.Provider
      value={{
        privateSolutions,
        draftSolutions,
        publicSolutions,
        teamSolutions,
        enterpriseSolutions,
        isLoading,
        getPublicSolutions,
        getPrivateSolutions,
        getDraftSolutions,
        getTeamSolutions,
        getEnterpriseSolutions,
        // allClosedMeetings,
        // getClosedMeetings,
        handleDelete,
        status,
        setStatus,
      }}
    >
      {children}
    </SolutionsContext.Provider>
  );
};
