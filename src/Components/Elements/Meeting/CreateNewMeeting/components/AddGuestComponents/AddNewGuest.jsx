import CookieService from '../../../../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { Button, Modal, Container, Row, Col, Dropdown } from "react-bootstrap";
import { RxCross2 } from "react-icons/rx";
import { useTranslation } from "react-i18next";
// import AddIndividual from "./AddIndividual";
import AddTeam from "./AddTeam";
import SignIn from "../../../../AuthModal/SignIn";
import SignUp from "../../../../AuthModal/SignUp";
import ForgotPassword from "../../../../AuthModal/ForgotPassword";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../../../Apicongfig";
import { toast } from "react-toastify";
import { useFormContext } from "../../../../../../context/CreateMeetingContext";
import Creatable from "react-select/creatable";

const NewMeetingModal = ({ show, handleClose }) => {
  const [t] = useTranslation("global");
  const [selectedTab, setSelectedTab] = useState("Individual");
  const [showBtn, setShowBtn] = useState(false);
  const {
    loading,
    formState,
    setFormState,
    handleInputBlur,
    checkId,
    getMeetingModal,
    meeting,
    stepsData,
    validateAndUpdate,
  } = useFormContext();

  // useEffect(() => {
  //   if (checkId) {
  //     getMeeting(checkId);
  //   }
  // }, [checkId]);

  const [clients, setClients] = useState([]);
  // const [selectedClients, setSelectedClients] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
          "user_id"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.data?.data) {
        const clientsData = response.data.data;

        const userClients = clientsData
          .filter((client) => client.linked_to === "user")
          .map((client) => ({
            label: client.name,
            value: client.id,
            data: {
              client_logo: client.client_logo,
            },
          }));

        const enterpriseClients = clientsData
          .filter((client) => client.linked_to === "enterprise")
          .map((client) => ({
            label: client.name,
            value: client.id,
            data: {
              client_logo: client.client_logo,
            },
          }));

        setClients([
          {
            label: "Mon entreprise",
            options: enterpriseClients,
          },
          {
            label: "Nos clients",
            options: userClients,
          },
        ]);
      }
      //       setClients(
      //         response.data.data.map((client) => ({
      //           label: client.name,
      //           value: client.id,
      //             data: {  // Add client_logo in a data object
      //   client_logo: client.client_logo // Make sure this matches your data structure
      // }
      //         }))
      //       );
      //     }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  useEffect(() => {
    if (meeting?.type === "Newsletter") {
      setSelectedTab("Individual");
    } else {
      setSelectedTab("Individual");
    }
  }, []);

  const [contributions, setContributions] = useState([
    {
      searchInput: "",
      email: "",
      first_name: "",
      last_name: "",
      post: "",
      contribution: "",
      client_id: null, // Will store ID if selected from dropdown
      client: null, // Will store name if created new
      filteredSuggestions: [],
      showFields: false,
    },
  ]);

  console.log("contributions", contributions);

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    getParticipants();
  }, []);

  const getParticipants = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/participants-email`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });

      // Separate members and contacts
      const members = res.data.data.filter(
        (participant) => participant.type === "member"
      );
      const contacts = res.data.data.filter(
        (participant) => participant.type === "contact"
      );

      setSuggestions({
        members,
        contacts,
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const areAllContributionsCompleteValidate = () => {
    return contributions.every(
      (c) => c.email && c.post && c.first_name && c.last_name
    );
  };

  const handleContributionChange = (index, field, value) => {
    const updated = [...contributions];
    updated[index][field] = value;
    setContributions(updated);
  };

  const deleteStepX = () => {
    handleClose();
  };

  // Styles for tabs based on active/inactive state
  const tabStyle = (isSelected) => ({
    borderRadius: "16px",
    padding: "18px",
    textAlign: "center",
    cursor: "pointer",
    background: "rgba(241, 245, 255, 0.70)",
    color: isSelected ? "#3D57B5" : "#687691",
    border: isSelected ? "2px solid #3D57B5" : "none",
    width: "100%",
    fontFamily: "IBM Plex Sans",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "18.2px",
    textAlign: "left",
    display: "flex",
    gap: "8px",
  });

  const renderSVG = (isSelected, type) => {
    if (type === "Individual") {
      return isSelected ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.5 4.625C11.5 5.28804 11.2366 5.92393 10.7678 6.39277C10.2989 6.86161 9.66304 7.125 9 7.125C8.33696 7.125 7.70107 6.86161 7.23223 6.39277C6.76339 5.92393 6.5 5.28804 6.5 4.625C6.5 3.96196 6.76339 3.32607 7.23223 2.85723C7.70107 2.38839 8.33696 2.125 9 2.125C9.66304 2.125 10.2989 2.38839 10.7678 2.85723C11.2366 3.32607 11.5 3.96196 11.5 4.625ZM13.375 4.625C13.375 5.78532 12.9141 6.89812 12.0936 7.71859C11.2731 8.53906 10.1603 9 9 9C7.83968 9 6.72688 8.53906 5.90641 7.71859C5.08594 6.89812 4.625 5.78532 4.625 4.625C4.625 3.46468 5.08594 2.35188 5.90641 1.53141C6.72688 0.710936 7.83968 0.25 9 0.25C10.1603 0.25 11.2731 0.710936 12.0936 1.53141C12.9141 2.35188 13.375 3.46468 13.375 4.625ZM2.125 14.625C2.125 14.37 2.4 13.6138 3.775 12.8013C5.0475 12.05 6.9 11.5 9 11.5C11.1 11.5 12.9525 12.05 14.225 12.8013C15.6 13.6138 15.875 14.37 15.875 14.625C15.875 14.9565 15.7433 15.2745 15.5089 15.5089C15.2745 15.7433 14.9565 15.875 14.625 15.875H3.375C3.04348 15.875 2.72554 15.7433 2.49112 15.5089C2.2567 15.2745 2.125 14.9565 2.125 14.625ZM9 9.625C4.1875 9.625 0.25 12.125 0.25 14.625C0.25 15.4538 0.57924 16.2487 1.16529 16.8347C1.75134 17.4208 2.5462 17.75 3.375 17.75H14.625C15.4538 17.75 16.2487 17.4208 16.8347 16.8347C17.4208 16.2487 17.75 15.4538 17.75 14.625C17.75 12.125 13.8125 9.625 9 9.625Z"
            fill="#3D57B5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12.5 5.625C12.5 6.28804 12.2366 6.92393 11.7678 7.39277C11.2989 7.86161 10.663 8.125 10 8.125C9.33696 8.125 8.70107 7.86161 8.23223 7.39277C7.76339 6.92393 7.5 6.28804 7.5 5.625C7.5 4.96196 7.76339 4.32607 8.23223 3.85723C8.70107 3.38839 9.33696 3.125 10 3.125C10.663 3.125 11.2989 3.38839 11.7678 3.85723C12.2366 4.32607 12.5 4.96196 12.5 5.625ZM14.375 5.625C14.375 6.78532 13.9141 7.89812 13.0936 8.71859C12.2731 9.53906 11.1603 10 10 10C8.83968 10 7.72688 9.53906 6.90641 8.71859C6.08594 7.89812 5.625 6.78532 5.625 5.625C5.625 4.46468 6.08594 3.35188 6.90641 2.53141C7.72688 1.71094 8.83968 1.25 10 1.25C11.1603 1.25 12.2731 1.71094 13.0936 2.53141C13.9141 3.35188 14.375 4.46468 14.375 5.625ZM3.125 15.625C3.125 15.37 3.4 14.6138 4.775 13.8013C6.0475 13.05 7.9 12.5 10 12.5C12.1 12.5 13.9525 13.05 15.225 13.8013C16.6 14.6138 16.875 15.37 16.875 15.625C16.875 15.9565 16.7433 16.2745 16.5089 16.5089C16.2745 16.7433 15.9565 16.875 15.625 16.875H4.375C4.04348 16.875 3.72554 16.7433 3.49112 16.5089C3.2567 16.2745 3.125 15.9565 3.125 15.625ZM10 10.625C5.1875 10.625 1.25 13.125 1.25 15.625C1.25 16.4538 1.57924 17.2487 2.16529 17.8347C2.75134 18.4208 3.5462 18.75 4.375 18.75H15.625C16.4538 18.75 17.2487 18.4208 17.8347 17.8347C18.4208 17.2487 18.75 16.4538 18.75 15.625C18.75 13.125 14.8125 10.625 10 10.625Z"
            fill="#687691"
          />
        </svg>
      );
    } else if (type === "team") {
      return isSelected ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g clip-path="url(#clip0_1_906)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.25 9C8.84674 9 9.41903 8.76295 9.84099 8.34099C10.2629 7.91903 10.5 7.34674 10.5 6.75C10.5 6.15326 10.2629 5.58097 9.84099 5.15901C9.41903 4.73705 8.84674 4.5 8.25 4.5C7.65326 4.5 7.08097 4.73705 6.65901 5.15901C6.23705 5.58097 6 6.15326 6 6.75C6 7.34674 6.23705 7.91903 6.65901 8.34099C7.08097 8.76295 7.65326 9 8.25 9ZM8.25 11.25C9.44347 11.25 10.5881 10.7759 11.432 9.93198C12.2759 9.08807 12.75 7.94347 12.75 6.75C12.75 5.55653 12.2759 4.41193 11.432 3.56802C10.5881 2.72411 9.44347 2.25 8.25 2.25C7.05653 2.25 5.91193 2.72411 5.06802 3.56802C4.22411 4.41193 3.75 5.55653 3.75 6.75C3.75 7.94347 4.22411 9.08807 5.06802 9.93198C5.91193 10.7759 7.05653 11.25 8.25 11.25ZM3.7065 15.579C2.541 16.389 2.25 17.1735 2.25 17.538C2.25 18.207 2.793 18.75 3.462 18.75H13.038C13.3594 18.75 13.6677 18.6223 13.895 18.395C14.1223 18.1677 14.25 17.8594 14.25 17.538C14.25 17.172 13.959 16.3875 12.7935 15.579C11.688 14.8125 10.0785 14.25 8.25 14.25C6.423 14.25 4.812 14.8125 3.7065 15.579ZM0 17.538C0 14.769 3.7125 12 8.25 12C10.02 12 11.667 12.4215 13.0155 13.101C14.3069 12.3711 15.7666 11.9915 17.25 12C20.9625 12 24 14.307 24 16.6155C24 17.3805 23.6961 18.1142 23.1551 18.6551C22.6142 19.1961 21.8805 19.5 21.1155 19.5H15.891C15.267 20.406 14.2215 21 13.038 21H3.462C2.54382 21 1.66325 20.6353 1.014 19.986C0.364745 19.3368 0 18.4562 0 17.538ZM16.4865 17.25H21.1155C21.4665 17.25 21.75 16.965 21.75 16.6155C21.75 16.461 21.606 15.9075 20.718 15.2805C19.887 14.691 18.6555 14.25 17.25 14.25C16.4745 14.25 15.7515 14.385 15.12 14.604C15.909 15.405 16.401 16.323 16.4865 17.25ZM18.75 7.5C18.75 7.89782 18.592 8.27936 18.3107 8.56066C18.0294 8.84196 17.6478 9 17.25 9C16.8522 9 16.4706 8.84196 16.1893 8.56066C15.908 8.27936 15.75 7.89782 15.75 7.5C15.75 7.10218 15.908 6.72064 16.1893 6.43934C16.4706 6.15804 16.8522 6 17.25 6C17.6478 6 18.0294 6.15804 18.3107 6.43934C18.592 6.72064 18.75 7.10218 18.75 7.5ZM21 7.5C21 8.49456 20.6049 9.44839 19.9016 10.1517C19.1984 10.8549 18.2446 11.25 17.25 11.25C16.2554 11.25 15.3016 10.8549 14.5983 10.1517C13.8951 9.44839 13.5 8.49456 13.5 7.5C13.5 6.50544 13.8951 5.55161 14.5983 4.84835C15.3016 4.14509 16.2554 3.75 17.25 3.75C18.2446 3.75 19.1984 4.14509 19.9016 4.84835C20.6049 5.55161 21 6.50544 21 7.5Z"
              fill="#3D57B5"
            />
          </g>
          <defs>
            <clipPath id="clip0_1_906">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="19"
          viewBox="0 0 24 19"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.25 7C8.84674 7 9.41903 6.76295 9.84099 6.34099C10.2629 5.91903 10.5 5.34674 10.5 4.75C10.5 4.15326 10.2629 3.58097 9.84099 3.15901C9.41903 2.73705 8.84674 2.5 8.25 2.5C7.65326 2.5 7.08097 2.73705 6.65901 3.15901C6.23705 3.58097 6 4.15326 6 4.75C6 5.34674 6.23705 5.91903 6.65901 6.34099C7.08097 6.76295 7.65326 7 8.25 7ZM8.25 9.25C9.44347 9.25 10.5881 8.77589 11.432 7.93198C12.2759 7.08807 12.75 5.94347 12.75 4.75C12.75 3.55653 12.2759 2.41193 11.432 1.56802C10.5881 0.724106 9.44347 0.25 8.25 0.25C7.05653 0.25 5.91193 0.724106 5.06802 1.56802C4.22411 2.41193 3.75 3.55653 3.75 4.75C3.75 5.94347 4.22411 7.08807 5.06802 7.93198C5.91193 8.77589 7.05653 9.25 8.25 9.25ZM3.7065 13.579C2.541 14.389 2.25 15.1735 2.25 15.538C2.25 16.207 2.793 16.75 3.462 16.75H13.038C13.3594 16.75 13.6677 16.6223 13.895 16.395C14.1223 16.1677 14.25 15.8594 14.25 15.538C14.25 15.172 13.959 14.3875 12.7935 13.579C11.688 12.8125 10.0785 12.25 8.25 12.25C6.423 12.25 4.812 12.8125 3.7065 13.579ZM0 15.538C0 12.769 3.7125 10 8.25 10C10.02 10 11.667 10.4215 13.0155 11.101C14.3069 10.3711 15.7666 9.99151 17.25 10C20.9625 10 24 12.307 24 14.6155C24 15.3805 23.6961 16.1142 23.1551 16.6551C22.6142 17.1961 21.8805 17.5 21.1155 17.5H15.891C15.267 18.406 14.2215 19 13.038 19H3.462C2.54382 19 1.66325 18.6353 1.014 17.986C0.364745 17.3368 0 16.4562 0 15.538ZM16.4865 15.25H21.1155C21.4665 15.25 21.75 14.965 21.75 14.6155C21.75 14.461 21.606 13.9075 20.718 13.2805C19.887 12.691 18.6555 12.25 17.25 12.25C16.4745 12.25 15.7515 12.385 15.12 12.604C15.909 13.405 16.401 14.323 16.4865 15.25ZM18.75 5.5C18.75 5.89782 18.592 6.27936 18.3107 6.56066C18.0294 6.84196 17.6478 7 17.25 7C16.8522 7 16.4706 6.84196 16.1893 6.56066C15.908 6.27936 15.75 5.89782 15.75 5.5C15.75 5.10218 15.908 4.72064 16.1893 4.43934C16.4706 4.15804 16.8522 4 17.25 4C17.6478 4 18.0294 4.15804 18.3107 4.43934C18.592 4.72064 18.75 5.10218 18.75 5.5ZM21 5.5C21 6.49456 20.6049 7.44839 19.9016 8.15165C19.1984 8.85491 18.2446 9.25 17.25 9.25C16.2554 9.25 15.3016 8.85491 14.5983 8.15165C13.8951 7.44839 13.5 6.49456 13.5 5.5C13.5 4.50544 13.8951 3.55161 14.5983 2.84835C15.3016 2.14509 16.2554 1.75 17.25 1.75C18.2446 1.75 19.1984 2.14509 19.9016 2.84835C20.6049 3.55161 21 4.50544 21 5.5Z"
            fill="#687691"
          />
        </svg>
      );
    } else if (type === "signin") {
      return isSelected ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7ZM20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z"
            fill="#3D57B5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="18"
          viewBox="0 0 20 18"
          fill="none"
        >
          <path
            d="M9 4L7.6 5.4L10.2 8H0V10H10.2L7.6 12.6L9 14L14 9L9 4ZM18 16H10V18H18C19.1 18 20 17.1 20 16V2C20 0.9 19.1 0 18 0H10V2H18V16Z"
            fill="#687691"
          />
        </svg>
      );
    }
  };

  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleShowSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleShowSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleShowForgot = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgot(true);
  };

  const handleCloseSignIn = () => setShowSignIn(false);
  const handleCloseSignUp = () => setShowSignUp(false);
  const handleCloseForgot = () => setShowForgot(false);

  const areAllContributionsComplete = () => {
    return contributions.every(
      (contribution) =>
        contribution.email &&
        contribution.post &&
        contribution.first_name &&
        contribution.last_name &&
        contribution.contribution
    );
  };

  const handleSave = async () => {
    if (!areAllContributionsCompleteValidate()) {
      toast.error(t("Please fill out all required fields."));
      return;
    }

    const emails = contributions.map((c) => c.email);
    const duplicateEmails = emails.filter(
      (email, i) => emails.indexOf(email) !== i
    );
    if (duplicateEmails.length > 0) {
      toast.error(t("Duplicate participants are not allowed."));
      return;
    }

    const existingParticipants = stepsData?.participants?.map((p) => p.email);
    const alreadyExists = contributions.filter((c) =>
      existingParticipants?.includes(c.email)
    );

    if (alreadyExists.length > 0) {
      toast.error(t("Some participants are already part of the meeting."));
      return;
    }

    const newFormState = {
      ...formState,
      participants: contributions,
    };

    const options = { updatedButton: false, quitAndUpdate: false };
    const response = await handleInputBlur(newFormState, options);

    if (response?.data?.success) {
      setContributions([
        {
          email: "",
          post: "",
          first_name: "",
          last_name: "",
          contribution: "",
          emailInput: "",
          filteredSuggestions: [],
          showAdditionalFields: false,
        },
      ]);
      await getMeetingModal(checkId);
    }
  };

  const [selectedClients, setSelectedClients] = useState(Array(1).fill(null)); // Initialize with one null element

  // Initialize selectedClients when contributions change
  useEffect(() => {
    if (selectedClients.length < contributions.length) {
      const newSelectedClients = [...selectedClients];
      while (newSelectedClients.length < contributions.length) {
        newSelectedClients.push(null);
      }
      setSelectedClients(newSelectedClients);
    }
  }, [contributions.length]);

  const handleSearchInputChange = (e, index) => {
    const value = e.target.value;
    const updated = [...contributions];
    updated[index].searchInput = value;

    if (value) {
      // Filter both members and contacts
      const filteredMembers =
        suggestions.members?.filter((s) => {
          return (
            (s.email || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.name || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.last_name || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.phone_number || "").toLowerCase().includes(value.toLowerCase())
          );
        }) || [];

      const filteredContacts =
        suggestions.contacts?.filter((s) => {
          return (
            (s.email || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.first_name || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.last_name || "").toLowerCase().includes(value.toLowerCase()) ||
            (s.phone_number || "").toLowerCase().includes(value.toLowerCase())
          );
        }) || [];

      updated[index].filteredSuggestions = {
        members: filteredMembers,
        contacts: filteredContacts,
      };
      updated[index].showFields =
        filteredMembers.length === 0 && filteredContacts.length === 0;
    } else {
      updated[index].filteredSuggestions = {
        members: [],
        contacts: [],
      };
      updated[index].showFields = false;
    }

    setContributions(updated);
  };

  const handleParticipantSelect = (participant, index) => {
    const updated = [...contributions];
    const updatedClients = [...selectedClients];

    // Ensure we have enough elements in selectedClients
    while (updatedClients.length <= index) {
      updatedClients.push(null);
    }

    // Initialize with null for both fields
    const newContribution = {
      ...updated[index],
      searchInput: ``,
      email: participant.email || "",
      first_name: participant?.first_name || participant?.name || "",
      last_name: participant.last_name || "",
      post: participant.post || participant?.role || "",
      contribution: "",
      client_id: null, // Initialize as null
      client: null, // Initialize as null
      filteredSuggestions: [],
      showFields: true,
    };

    // Only set one field based on what's available
    if (participant?.clients?.id) {
      newContribution.client_id = participant.clients.id;
    } else if (participant?.clients?.name) {
      newContribution.client = participant.clients.name;
    }

    updated[index] = newContribution;

    // If participant has a client, find and set the corresponding client option
    if (participant?.clients?.id) {
      let clientOption = null;
      clients.forEach((group) => {
        const found = group.options?.find(
          (c) => c.value === participant.clients.id
        );
        if (found) clientOption = found;
      });
      updatedClients[index] = clientOption;
    } else {
      updatedClients[index] = null;
    }

    setSelectedClients(updatedClients);
    setContributions(updated);
  };

  const renderClientSelect = (index) => {
    const currentSelectedClient = selectedClients?.[index] || null;

    return (
      <Col xs={12} md={6} className="mb-2 form">
        <label className="form-label">{t("Organization")}</label>
        <small style={{ color: "red", fontSize: "15px", marginLeft: "2px" }}>
          *
        </small>
        <Creatable
          className="my-select destination-select-dropdown"
          classNamePrefix="select"
          options={clients}
          value={currentSelectedClient}
          onChange={(option, actionMeta) => {
            const updatedClients = [...selectedClients];
            const updatedContributions = [...contributions];

            // Ensure arrays are properly sized
            while (updatedClients.length <= index) {
              updatedClients.push(null);
            }

            updatedClients[index] = option;

            if (actionMeta.action === "create-option") {
              // New client created - set only client name
              updatedContributions[index] = {
                ...updatedContributions[index],
                client: option?.label || "",
                client_id: null, // Explicitly clear client_id
              };
            } else if (option) {
              // Existing client selected - set only client_id
              updatedContributions[index] = {
                ...updatedContributions[index],
                client_id: option.value,
                client: null, // Explicitly clear client name
              };
            } else {
              // Cleared selection - clear both fields
              updatedContributions[index] = {
                ...updatedContributions[index],
                client_id: null,
                client: null,
              };
            }

            setSelectedClients(updatedClients);
            setContributions(updatedContributions);
          }}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          isClearable
          placeholder={t("Select or create organization")}
          formatOptionLabel={(option) => (
            <div className="option-with-logo">
              {option.data?.client_logo && (
                <img
                  src={
                    option.data.client_logo.startsWith("http")
                      ? option.data.client_logo
                      : `${Assets_URL}/${option.data.client_logo}`
                  }
                  alt={option.label}
                  className="client-logo"
                />
              )}
              <span>{option.label}</span>
            </div>
          )}
        />
      </Col>
    );
  };
  const user = JSON.parse(
    CookieService.get("user") || CookieService.get("user") || "{}"
  );

  return (
    <>
      {/* {show && ( */}
      <div id="chart-container" className="chart-content">
        <div className=" col-md-12">
          <Row className="mb-4">
            {
            //   <Col xs={12} sm={4}>
            //     <div
            //       style={tabStyle(selectedTab === "signin")}
            //       onClick={() => {
            //         setSelectedTab("signin");
            //         // handleShowSignIn();
            //       }}
            //       className="text-center"
            //     >
            //       {renderSVG(selectedTab === "signin", "signin")}
            //       <div>{t("meeting.formState.Signin")}</div>
            //     </div>
            //   </Col>
            // ) : (
              <>
                <Col xs={12} sm={4}>
                  <div
                    style={tabStyle(selectedTab === "Individual")}
                    onClick={() => setSelectedTab("Individual")}
                    className="text-center mb-1"
                  >
                    {renderSVG(selectedTab === "Individual", "Individual")}
                    <div>{t("meeting.formState.Individual")}</div>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div
                    style={tabStyle(selectedTab === "team")}
                    onClick={() => setSelectedTab("team")}
                    className="text-center mb-1"
                  >
                    {renderSVG(selectedTab === "team", "team")}
                    <div>{t("meeting.formState.moment_form_teams")}</div>
                  </div>
                </Col>
              </>
            }
          </Row>
          <Row>
            <Col md={12}>
              {selectedTab === "Individual" &&(
                  <div className="">
                    <>
                      <div className="create-moment-modal">
                        {contributions.map((contribution, index) => (
                          <div key={index}>
                            {/* Search Field */}
                            <Row className="g-2 mb-3">
                              <Col md={6} className="mb-2 form">
                                <label className="form-label">
                                  {t("Search")}
                                </label>
                                <input
                                  className="form-control"
                                  value={contribution.searchInput}
                                  onChange={(e) =>
                                    handleSearchInputChange(e, index)
                                  }
                                  placeholder="Search by name, email or phone"
                                />
                                {contribution.filteredSuggestions?.members
                                  ?.length > 0 ||
                                contribution.filteredSuggestions?.contacts
                                  ?.length > 0 ? (
                                  <ul className="dropdown-menu show w-100">
                                    {/* Members Section */}
                                    {contribution?.filteredSuggestions?.members
                                      ?.length > 0 && (
                                      <>
                                        <li className="dropdown-header">
                                          {t("team.membersof")}{" "}
                                          {user?.enterprise?.name || ""}
                                        </li>
                                        {contribution?.filteredSuggestions?.members.map(
                                          (s, i) => (
                                            <li key={`member-${i}`}>
                                              <button
                                                type="button"
                                                className="dropdown-item d-flex align-items-center gap-2 text-wrap"
                                                onClick={() =>
                                                  handleParticipantSelect(
                                                    s,
                                                    index
                                                  )
                                                }
                                                style={{ whiteSpace: 'normal' }}
                                              >
                                                <img
                                                  src={
                                                    s.image?.startsWith("http")
                                                      ? s?.image
                                                      : Assets_URL +
                                                        "/" +
                                                        s?.image
                                                  }
                                                  alt="avatar"
                                                  width="32"
                                                  height="32"
                                                  className="rounded-circle object-fit-cover"
                                                  style={{
                                                    border: "1px solid #ddd",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                />
                                                <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                                                  {s.name} {s.last_name} (
                                                  {s.email})
                                                </span>
                                              </button>
                                            </li>
                                          )
                                        )}
                                      </>
                                    )}

                                    {/* Contacts Section */}
                                    {contribution?.filteredSuggestions?.contacts
                                      ?.length > 0 && (
                                      <>
                                        <li className="dropdown-divider"></li>
                                        <li className="dropdown-header">
                                          Contacts
                                        </li>
                                        {contribution?.filteredSuggestions?.contacts?.map(
                                          (s, i) => (
                                            <li key={`contact-${i}`}>
                                              <button
                                                type="button"
                                                className="dropdown-item d-flex align-items-center gap-2 text-wrap"
                                                onClick={() =>
                                                  handleParticipantSelect(
                                                    s,
                                                    index
                                                  )
                                                }
                                                style={{ whiteSpace: 'normal' }}
                                              >
                                                <img
                                                  src={
                                                    s.image?.startsWith("http")
                                                      ? s?.image
                                                      : Assets_URL +
                                                        "/" +
                                                        s?.image
                                                  }
                                                  alt="avatar"
                                                  width="32"
                                                  height="32"
                                                  className="rounded-circle object-fit-cover"
                                                  style={{
                                                    border: "1px solid #ddd",
                                                    objectFit: "cover",
                                                    objectPosition: "top",
                                                  }}
                                                />
                                                <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                                                  {s.first_name} {s.last_name} (
                                                  {s.email})
                                                </span>
                                              </button>
                                            </li>
                                          )
                                        )}
                                      </>
                                    )}
                                  </ul>
                                ) : null}
                              </Col>
                            </Row>

                            {/* Other Fields - Only Show When Participant Selected */}
                            {contribution.showFields && (
                              <>
                                <Row className="g-2 mb-3">
                                  <Col xs={12} md={6} className="mb-2 form">
                                    <label className="form-label">
                                      {t("meeting.formState.email")}
                                    </label>
                                    <small className="text-danger">*</small>
                                    <input
                                      className="form-control"
                                      value={contribution.email}
                                      onChange={(e) => {
                                        const updated = [...contributions];
                                        updated[index].email = e.target.value;
                                        setContributions(updated);
                                      }}
                                    />
                                  </Col>
                                  {renderClientSelect(index)}
                                  <Col xs={12} md={6} className="mb-2 form">
                                    <label className="form-label">
                                      {t("meeting.formState.post")}
                                    </label>
                                    <small className="text-danger">*</small>
                                    <input
                                      className="form-control"
                                      value={contribution.post}
                                      onChange={(e) => {
                                        const updated = [...contributions];
                                        updated[index].post = e.target.value;
                                        setContributions(updated);
                                      }}
                                    />
                                  </Col>
                                  <Col xs={12} md={6} className="mb-2 form">
                                    <label className="form-label">
                                      {t("meeting.formState.firstName")}
                                    </label>
                                    <small className="text-danger">*</small>
                                    <input
                                      className="form-control"
                                      value={contribution.first_name}
                                      onChange={(e) => {
                                        const updated = [...contributions];
                                        updated[index].first_name =
                                          e.target.value;
                                        setContributions(updated);
                                      }}
                                    />
                                  </Col>
                                  <Col xs={12} md={6} className="mb-2 form">
                                    <label className="form-label">
                                      {t("meeting.formState.lastName")}
                                    </label>
                                    <small className="text-danger">*</small>
                                    <input
                                      className="form-control"
                                      value={contribution.last_name}
                                      onChange={(e) => {
                                        const updated = [...contributions];
                                        updated[index].last_name =
                                          e.target.value;
                                        setContributions(updated);
                                      }}
                                    />
                                  </Col>
                                  <Col xs={12} md={12} className="mb-2 form">
                                    <label className="form-label">
                                      {t("Contribution")}
                                    </label>
                                    <textarea
                                      rows={3}
                                      className="form-control"
                                      value={contribution.contribution}
                                      onChange={(e) => {
                                        const updated = [...contributions];
                                        updated[index].contribution =
                                          e.target.value;
                                        setContributions(updated);
                                      }}
                                    />
                                  </Col>
                                </Row>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                    <div
                      className={`modal-footer d-flex justify-content-end  `}
                    >
                      {loading ? (
                        <button className={`btn moment-btn px-2 py-0`}>
                          <span
                            class="spinner-border spinner-border-sm text-white"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </button>
                      ) : (
                        <button
                          className={`btn moment-btn`}
                          onClick={handleSave}
                        >
                          &nbsp;
                          {t("meeting.formState.Add")}
                          <span>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.5489C13.3804 16.4777 13.3243 16.3929 13.2865 16.2995C13.2488 16.2061 13.2303 16.1061 13.2321 16.0054C13.2338 15.9047 13.2559 15.8054 13.2969 15.7134C13.3379 15.6214 13.397 15.5386 13.4707 15.4699L16.1907 12.7499H6.50066C6.30175 12.7499 6.11098 12.6709 5.97033 12.5302C5.82968 12.3896 5.75066 12.1988 5.75066 11.9999C5.75066 11.801 5.82968 11.6102 5.97033 11.4696C6.11098 11.3289 6.30175 11.2499 6.50066 11.2499H16.1907L13.4707 8.52991Z"
                                fill="white"
                              />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </Col>
          </Row>
          <Row>
            <Col>
              {selectedTab === "team"  && (
                <AddTeam meeting={meeting} handleClose={handleClose} />
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              {/* {selectedTab === "signin" && (
                        <Signin handleClose={handleClose} />
                      )} */}
            </Col>
          </Row>
        </div>
        {/* </div> */}
        {/* </div> */}

        {/* SignIn Modal */}
        <SignIn
          show={showSignIn}
          handleClose={handleCloseSignIn}
          handleShowSignUp={handleShowSignUp}
          handleShowForgot={handleShowForgot}
        />

        {/* SignUp Modal */}
        <SignUp
          show={showSignUp}
          handleClose={handleCloseSignUp}
          handleShowSignIn={handleShowSignIn}
        />
        {/* Forgot Password Modal */}
        <ForgotPassword
          show={showForgot}
          handleClose={handleCloseForgot}
          handleShowForgot={handleShowForgot}
        />
      </div>
      {/* )} */}
    </>
  );
};

export default NewMeetingModal;