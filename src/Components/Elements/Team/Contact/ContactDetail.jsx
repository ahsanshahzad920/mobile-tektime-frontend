import CookieService from '../../../Utils/CookieService';
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import moment from "moment";
import MomentCard from "../../Meeting/CurrentMeeting/components/MomentCard";
import {
  Button,
  Col,
  Dropdown,
  Form,
  Modal,
  OverlayTrigger,
  Spinner,
  Tab,
  Tabs,
  Tooltip,
} from "react-bootstrap";
import { Row } from "antd";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import Creatable from "react-select/creatable";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import { MdDeleteOutline } from "react-icons/md";
import CustomFieldsComponent from "../CustomFieldsComponent";
import { FaFont, FaHashtag, FaPlus } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { getUserRoleID } from "../../../Utils/getSessionstorageItems";
import Select from "react-select";

const ContactDetail = () => {
  const { id } = useParams();
  const [t] = useTranslation("global");
  const navigate = useNavigate();
  const location = useLocation()
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [memberMeetings, setMemberMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("tab1");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();

  let fromMission = false;
  if (location?.state?.from === "Mission") {
    fromMission = true;
  }

  // Get initial member data
  const getContact = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/contact/meetings/${id}?page=1`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setMember(response.data?.data);
        setMemberMeetings(response.data?.data?.all_meetings?.data || []);
        setHasMore(response.data?.data?.all_meetings?.last_page > 1);
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data?.message)
      setLoading(false);
    }
  };

  // Load more meetings when scrolling
  const loadMoreMeetings = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await axios.get(
        `${API_BASE_URL}/contact/meetings/${id}?page=${nextPage}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const newMeetings = response.data?.data?.all_meetings?.data || [];
        setMemberMeetings((prev) => [...prev, ...newMeetings]);
        setPage(nextPage);
        setHasMore(nextPage < response.data?.data?.all_meetings?.last_page);
      }
    } catch (error) {
      console.log("Error loading more meetings", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, id]);

  // Intersection Observer for infinite scroll
  const lastMeetingRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMeetings();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMoreMeetings]
  );

  useEffect(() => {
    getContact();
  }, [id]);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [showContactModal, setShowContactModal] = useState(false);

  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    post: "",
    organization: "",
    phone: "",
    customFields: [], // Add this line
  });
  const handleCustomFieldsChange = (fields) => {
    setFormData({ ...formData, customFields: fields });
  };


  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    getParticipants();
  }, []);

  // Fetch participants for email suggestions
  const getParticipants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/participants-email`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
      if (response) {
        setEmailSuggestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    if (value.length > 1) {
      const filtered = emailSuggestions.filter((contact) =>
        contact.email?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (filteredSuggestions.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    }
    // Enter
    else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectEmail(filteredSuggestions[activeSuggestionIndex]);
    }
  };

  const selectEmail = (contact) => {
    console.log("contact", contact);
    setFormData({
      email: contact.email,
      firstName: contact.first_name || "",
      lastName: contact.last_name || "",
      post: contact.post || "",
      organization: contact.organization || "",
      phone: contact.phone || "",
    });
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-same-enterprise-users/${CookieService.get(
        "user_id"
      )}`, {
        headers: { Authorization: `Bearer ${CookieService.get("token")}` },
      });
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




  // New state for adding fields
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    options: ''
  });

  // Field type options
  const fieldTypes = [
    { value: 'text', label: 'Text', icon: <FaFont /> },
    { value: 'number', label: 'Number', icon: <FaHashtag /> },
    { value: 'date', label: 'Date', icon: <FaCalendarAlt /> }
  ];


  // 1. First, create a helper function for default values
  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'number': return 0;
      case 'checkbox': return false;
      case 'date': return '';
      case 'select': return '';
      default: return ''; // text and others
    }
  };

  // 2. Update your addCustomField function
  const addCustomField = () => {
    if (!newField.name.trim()) {
      toast.error("Please enter a field name");
      return;
    }

    const newFieldToAdd = {
      id: Date.now(),
      name: newField.name.trim(),
      type: newField.type,
      value: getDefaultValueForType(newField.type),
      ...(newField.type === 'select' ? {
        options: newField.options.split(',').map(o => o.trim()).filter(Boolean)
      } : {})
    };

    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, newFieldToAdd]
    }));

    // Reset new field form
    setNewField({
      name: '',
      type: 'text',
      options: ''
    });
  };

  // 3. Create a proper field change handler
  const handleFieldValueChange = (fieldId, value) => {
    setFormData(prev => {
      const updatedFields = prev.customFields.map(field => {
        if (field.id === fieldId) {
          // Convert empty string to null for number fields if needed
          if (field.type === 'number' && value === '') {
            return { ...field, value: null };
          }
          return { ...field, value };
        }
        return field;
      });

      return { ...prev, customFields: updatedFields };
    });
  };

  // 4. Enhanced renderFieldInput function
  const renderFieldInput = (field) => {
    const commonProps = {
      onChange: (e) => handleFieldValueChange(
        field.id,
        field.type === 'checkbox' ? e.target.checked : e.target.value
      ),
      className: `form-control${field.type === 'checkbox' ? ' form-check-input' : ''}`
    };

    switch (field.type) {
      case 'number':
        return (
          <input
            type="number"
            value={field.value ?? ''}
            {...commonProps}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={field.value || ''}
            {...commonProps}
          />
        );
      case 'checkbox':
        return (
          <div className="form-check form-switch">
            <input
              type="checkbox"
              checked={field.value || false}
              {...commonProps}
            />
          </div>
        );
      case 'select':
        return (
          <select
            value={field.value || ''}
            className="form-select"
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={field.value || ''}
            {...commonProps}
          />
        );
    }
  };

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  useEffect(() => {
    const fetchTeams = async () => {
      const token = CookieService.get("token");

      try {
        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const roleId = getUserRoleID();
          let filteredTeams = [];

          if (roleId === 1) {
            // Admin → show all teams
            filteredTeams = response.data?.data;
          } else if (roleId === 2) {
            // Role 2 → show teams created by logged-in user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id")
            );
          } else if (roleId === 3) {
            // Role 3 → show teams belonging to user's enterprise
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) =>
                team?.enterprise?.id ==
                JSON.parse(CookieService.get("enterprise"))?.id
            );
          } else {
            // Default → teams created by this user
            CookieService.set(
              "enterprise",
              JSON.stringify(response.data?.enterprise)
            );
            filteredTeams = response.data?.data?.filter(
              (team) => team?.created_by?.id == CookieService.get("user_id")
            );
          }

          // ✅ Convert teams to Select options
          const formattedOptions = filteredTeams.map((team) => ({
            value: team.id,
            label: team.name,
          }));

          setTeamOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error(
          t(error.response?.data?.errors?.[0] || "Failed to load teams.")
        );
      }
    };

    if (showContactModal) {
      fetchTeams(); // Fetch only when modal opens
    }
  }, [showContactModal]);


  // 5. Update your useEffect for editing contacts
  useEffect(() => {
    if (showContactModal && editingContact) {
      const initializedCustomFields = editingContact?.custom_fields?.map(field => ({
        id: field?.id || Date.now(),
        name: field?.name || '',
        type: field?.type || 'text',
        value: field?.value ?? getDefaultValueForType(field?.type || 'text'),
        options: field?.options || []
      })) || [];
      // Also handle client selection if available
      if (editingContact?.clients?.id && editingContact?.clients?.name) {
        setSelectedClient({
          value: editingContact?.clients?.id,
          label: editingContact?.clients?.name,
        });
      } else {
        setSelectedClient(null);
      }

      if (editingContact?.teams?.length > 0) {
        const selected = editingContact.teams.map((team) => ({
          value: team.id,
          label: team.name,
        }));
        setSelectedTeams(selected);
        setFormData((prev) => ({
          ...prev,
          teams: selected.map((t) => t.value),
        }));
      } else {
        setSelectedTeams([]);
      }
      setFormData({
        email: editingContact.email || "",
        firstName: editingContact.first_name || "",
        lastName: editingContact.last_name || "",
        post: editingContact.role || "",
        organization: editingContact.organization || "",
        phone: editingContact.phone_number || "",
        customFields: initializedCustomFields
      });

      // Handle client selection...
    }
  }, [showContactModal, editingContact]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const handleDeleteClick = (contactId) => {
    setContactToDelete(contactId);
    setShowConfirmationModal(true);
  };

  const confirmDelete = async () => {
    if (isDeleting || !contactToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_BASE_URL}/contacts/${contactToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success(t("contacts.delete_success"));
        navigate("/Team");
      }
    } catch (error) {
      console.error("Delete contact error:", error);
      toast.error(t("contacts.delete_error"));
    } finally {
      setIsDeleting(false);
      setShowConfirmationModal(false);
      setContactToDelete(null);
    }
  };


  const handleSave = async () => {
    const user = JSON.parse(CookieService.get("user"));

    // Clean custom fields before sending
    const cleanedCustomFields = formData.customFields.map(field => {
      let value = field.value;

      // Convert empty strings to null for numbers
      if (field.type === 'number' && value === '') {
        value = null;
      }

      // Ensure checkboxes are boolean
      if (field.type === 'checkbox') {
        value = Boolean(value);
      }

      return {
        name: field.name,
        type: field.type,
        value,
        ...(field.type === 'select' ? { options: field.options } : {})
      };
    });


    const payload = {
      email: formData.email,
      role: formData.post,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      enterprise_id: user?.enterprise_id,
      custom_fields: cleanedCustomFields,
      teams: formData.teams || [], // 👈 Add this line
      type: "New",
    };

    if (selectedClient && selectedClient.value) {
      payload.client_id = selectedClient.value;
    } else if (!selectedClient && formData.organization) {
      payload.client = formData.organization;
    }

    // console.log('payload',payload)
    // return
    try {
      let response;

      if (editingContact) {
        // 🔁 Use PUT for update
        response = await axios.put(
          `${API_BASE_URL}/contacts/${editingContact.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          }
        );
      } else {
        // ➕ Use POST for create
        response = await axios.post(`${API_BASE_URL}/contacts`, payload, {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        });
      }

      if (response?.status) {
        // getContacts();
        toast.success(
          editingContact
            ? t("Contact updated successfully!")
            : t("Contact created successfully!")
        );
        setShowContactModal(false);
        getContact();
      }
    } catch (error) {
      console.error("Error saving contact:", error);

      if (error?.response && error?.response?.data && error?.response?.data?.errors) {
        const errors = error?.response?.data?.errors;
        Object?.keys(errors)?.forEach((field) => {
          errors[field]?.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Failed to save contact.");
      }
    } finally {
      setShowContactModal(false);
    }
  };
  return (
    <>
      {loading ? (
        <Spinner
          animation="border"
          role="status"
          className="center-spinner"
        ></Spinner>
      ) : (
        <div
          className="invite w-100"
          style={{
            position: "static",
            backgroundColor: "white",
            padding: "10px 15px",
          }}
        >
          <div className="row child-1 mb-5">
            <div className="col-md-6 w-100">
              <div className="title mb-1">
                {/* <Link to="/Team">Casting</Link>
                <span> / </span>
                <Link to={`/Team`}> {t("team.contacts")}</Link> */}
                <Link to={fromMission ? `/invities` : `/Team`}>{fromMission ? 'Missions' : 'Casting'}</Link>
                <span> / </span>
                <Link to={fromMission ? `/invitiesToMeeting/${CookieService.get('missionId')}` : `/Team`}>{fromMission ? `${t("team.membersof")} ${member?.enterprise?.name}` : `Contact`}</Link>
              </div>
              <div className="invite-header d-flex align-items-start">
                <div className="col-md-8 d-flex flex-column">
                  <h5 className="content-heading-title w-100">
                    {member?.first_name + " " + member?.last_name}

                    {/* <span className="status-badge-red-invite mx-2 badge">
                      {member?.status}
                    </span> */}
                  </h5>
                  <div>
                    <div className="items">
                      <div className="type">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.33333 2.99984C8.33333 3.3665 8.20289 3.6805 7.942 3.94184C7.68111 4.20317 7.36711 4.33362 7 4.33317C6.85556 4.33317 6.72222 4.31362 6.6 4.2745C6.47778 4.23539 6.35556 4.17162 6.23333 4.08317C5.96667 4.17206 5.75289 4.33317 5.592 4.5665C5.43111 4.79984 5.35044 5.05539 5.35 5.33317H14L13.3333 9.99984H10.0667V8.6665H12.1833C12.2389 8.33317 12.2862 7.99984 12.3253 7.6665C12.3644 7.33317 12.4116 6.99984 12.4667 6.6665H3.53333C3.58889 6.99984 3.63622 7.33317 3.67533 7.6665C3.71444 7.99984 3.76156 8.33317 3.81667 8.6665H5.93333V9.99984H2.66667L2 5.33317H4C4 4.78873 4.15 4.29428 4.45 3.84984C4.75 3.40539 5.15556 3.07762 5.66667 2.8665C5.7 2.52206 5.84444 2.23606 6.1 2.0085C6.35556 1.78095 6.65556 1.66695 7 1.6665C7.36667 1.6665 7.68067 1.79717 7.942 2.0585C8.20333 2.31984 8.33378 2.63362 8.33333 2.99984ZM6.51667 12.6665H9.48333L9.86667 8.6665H6.13333L6.51667 12.6665ZM5.33333 13.9998L4.83333 8.79984C4.78889 8.41095 4.9 8.06939 5.16667 7.77517C5.43333 7.48095 5.76111 7.33362 6.15 7.33317H9.85C10.2389 7.33317 10.5667 7.4805 10.8333 7.77517C11.1 8.06984 11.2111 8.41139 11.1667 8.79984L10.6667 13.9998H5.33333Z"
                            fill="#8590A3"
                          />
                        </svg>
                        {/* <span className="time">{meeting?.type}</span> */}
                        <span className="time">{member?.role || member?.post}</span>
                      </div>
                      <div className="priority">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M12.346 6.79075C12.3618 6.77463 12.3808 6.76199 12.4018 6.75362C12.4228 6.74526 12.4453 6.74137 12.4679 6.74218C12.4905 6.743 12.5126 6.74851 12.533 6.75836C12.5533 6.76821 12.5714 6.78219 12.586 6.79941C13.4616 7.83748 13.9592 9.1419 13.9973 10.4994C13.9978 10.5213 13.9938 10.543 13.9857 10.5633C13.9776 10.5835 13.9656 10.602 13.9502 10.6175C13.9349 10.6331 13.9165 10.6454 13.8964 10.6537C13.8762 10.6621 13.8545 10.6663 13.8327 10.6661H10.8293C10.7849 10.6653 10.7424 10.6476 10.7104 10.6167C10.6785 10.5857 10.6595 10.5438 10.6573 10.4994C10.627 10.0165 10.4657 9.5509 10.1907 9.15275C10.167 9.11952 10.1557 9.07907 10.1588 9.0384C10.1618 8.99773 10.179 8.95941 10.2073 8.93008L12.346 6.79075ZM11.866 6.07941C11.9393 6.14075 11.9427 6.25141 11.8753 6.31941L9.73532 8.45875C9.70603 8.48691 9.66784 8.50399 9.62732 8.50703C9.5868 8.51007 9.54649 8.49889 9.51332 8.47541C9.20249 8.26075 8.84958 8.11463 8.47799 8.04675C8.43781 8.03991 8.4013 8.01924 8.37475 7.98831C8.34821 7.95739 8.33332 7.91816 8.33265 7.87741V4.85208C8.33265 4.75608 8.41265 4.68008 8.50865 4.68808C9.74476 4.79382 10.9177 5.27947 11.866 6.07941ZM7.66599 4.85275C7.66625 4.8301 7.66178 4.80765 7.65287 4.78684C7.64395 4.76602 7.63079 4.74729 7.61423 4.73186C7.59766 4.71642 7.57805 4.70461 7.55666 4.69719C7.53526 4.68976 7.51256 4.68689 7.48999 4.68875C6.25395 4.7943 5.08102 5.28038 4.13265 6.08008C4.11544 6.09471 4.10146 6.11276 4.0916 6.1331C4.08175 6.15343 4.07624 6.17559 4.07542 6.19817C4.07461 6.22075 4.0785 6.24325 4.08687 6.26424C4.09523 6.28523 4.10787 6.30424 4.12399 6.32008L6.26399 8.45941C6.29315 8.48781 6.33137 8.50505 6.37196 8.5081C6.41255 8.51114 6.45292 8.49981 6.48599 8.47608C6.7968 8.2614 7.14972 8.11528 7.52132 8.04741C7.56149 8.04057 7.59801 8.0199 7.62455 7.98898C7.65109 7.95806 7.66599 7.91883 7.66665 7.87808L7.66599 4.85275ZM5.80865 9.15275C5.83205 9.11951 5.84311 9.07915 5.83995 9.03862C5.83679 8.9981 5.81959 8.95995 5.79132 8.93075L3.65199 6.79075C3.63611 6.77467 3.61705 6.76207 3.59604 6.75377C3.57502 6.74546 3.55251 6.74163 3.52993 6.74251C3.50735 6.74338 3.4852 6.74896 3.46489 6.75887C3.44459 6.76878 3.42657 6.78282 3.41199 6.80008C2.53685 7.83833 2.03977 9.14273 2.00199 10.5001C2.00154 10.5219 2.00546 10.5435 2.01351 10.5638C2.02156 10.584 2.03358 10.6024 2.04886 10.618C2.06415 10.6335 2.08238 10.6458 2.1025 10.6542C2.12261 10.6626 2.1442 10.6668 2.16599 10.6667H5.16932C5.26132 10.6667 5.33599 10.5927 5.34132 10.5001C5.37132 10.0154 5.53465 9.54941 5.80799 9.15341"
                            fill="#8590A3"
                            fill-opacity="0.25"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.33203 7.87077C8.33203 7.95477 8.3947 8.02477 8.47737 8.0401C8.85073 8.10802 9.20529 8.25485 9.51737 8.47077C9.55067 8.49434 9.59116 8.50551 9.63183 8.50234C9.67251 8.49918 9.71079 8.48187 9.74004 8.45344L12.3467 5.84677C12.3628 5.83102 12.3756 5.8121 12.384 5.79119C12.3925 5.77029 12.3966 5.74786 12.3959 5.72531C12.3953 5.70276 12.39 5.68059 12.3804 5.66019C12.3708 5.63979 12.357 5.6216 12.34 5.60677C11.2636 4.6834 9.92079 4.12735 8.5067 4.01944C8.48426 4.01788 8.46174 4.02097 8.44055 4.02851C8.41936 4.03606 8.39996 4.04791 8.38356 4.0633C8.36717 4.0787 8.35412 4.09732 8.34526 4.11799C8.33639 4.13866 8.33189 4.16094 8.33203 4.18344V7.87077Z"
                            fill="#8590A3"
                          />
                        </svg>
                        <span className="time">{member?.email}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 content-body mt-3 mb-2 mt-lg-3">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src="/Assets/invite-date.svg"
                          height="28px"
                          width="28px"
                        />
                        <span className="fw-bold formate-date">
                          {moment(member?.created_at)
                            .tz(userTimezone)
                            .format("DD/MM/YYYY")}
                          &nbsp; {t("at")}
                        </span>
                        <span className="fw-bold formate-date">
                          {moment(member?.created_at)
                            .tz(userTimezone)
                            .format("HH[h]mm")}
                        </span>
                        <span className="fw-bold">{userTimezone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="col-md-4 d-flex justify-content-end"
                  style={{ height: "100%" }}
                >
                  <div className="play-btn-container d-flex align-items-center gap-3">
                    {member?.image && (
                      <img
                        src={
                          member?.image?.startsWith("http")
                            ? member?.image
                            : Assets_URL + "/" + member?.image
                        }
                        alt="client logo"
                        className="rounded-circle logo-clickable"
                        style={{
                          width: "170px",
                          height: "170px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   const currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                      //   copy(currentURL);
                      //   openLinkInNewTab(currentURL);
                      // }}
                      />
                    )}

                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-secondary show"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "0px",
                        }}
                      >
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth={0}
                          viewBox="0 0 24 24"
                          color="black"
                          height="25px"
                          width="25px"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ color: "black" }}
                        >
                          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="left-start"
                        style={{
                          position: "absolute",
                          inset: "0px 0px auto auto",
                          margin: "0px",
                          transform: "translate(-51px, 25px)",
                        }}
                      >
                        <li>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContact(member);
                              setShowContactModal(true);
                            }}
                            className="dropdown-item d-flex align-items-center"
                            style={{ cursor: "pointer", border: "none", background: "none", width: "100%" }}
                          >
                            <svg
                              stroke="currentColor"
                              fill="currentColor"
                              strokeWidth={0}
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g id="Edit">
                                <g>
                                  <path d="M3.548,20.938h16.9a.5.5,0,0,0,0-1H3.548a.5.5,0,0,0,0,1Z" />
                                  <path d="M9.71,17.18a2.587,2.587,0,0,0,1.12-.65l9.54-9.54a1.75,1.75,0,0,0,0-2.47l-.94-.93a1.788,1.788,0,0,0-2.47,0L7.42,13.12a2.473,2.473,0,0,0-.64,1.12L6.04,17a.737.737,0,0,0,.19.72.767.767,0,0,0,.53.22Zm.41-1.36a1.468,1.468,0,0,1-.67.39l-.97.26-1-1,.26-.97a1.521,1.521,0,0,1,.39-.67l.38-.37,1.99,1.99Zm1.09-1.08L9.22,12.75l6.73-6.73,1.99,1.99Zm8.45-8.45L18.65,7.3,16.66,5.31l1.01-1.02a.748.748,0,0,1,1.06,0l.93.94A.754.754,0,0,1,19.66,6.29Z" />
                                </g>
                              </g>
                            </svg>
                            &nbsp;{t("user.modify")}
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(member.id)}
                            disabled={isDeleting}
                            className="dropdown-item d-flex align-items-center"
                            style={{ cursor: "pointer", border: "none", background: "none", width: "100%" }}
                          >
                            <MdDeleteOutline size="20px" />
                            &nbsp;&nbsp;{t("dropdown.Delete")}
                          </button>
                        </li>
                      </ul>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`tabs-container py-1 px-3`}>
            <div className="tabs-header">
              <div
                className="row align-items-center gutter-0"
                style={{ padding: "0 10px" }}
              >
                {/* Tabs Section */}
                <div
                  className="col-lg-11 col-md-10 col-12 border-bottom tabs-meeting"
                  style={{ borderBottom: "2px solid #F2F2F2" }}
                >
                  <div className="tabs" style={{ overflowX: "auto" }}>
                    <div className="d-flex">
                      <button
                        className={`tab ${activeTab === "tab1" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("tab1")}
                      >
                        {t("profile.personalInfo")}

                        {/* <span
                          className={activeTab === "tab1" ? "future" : "draft"}
                        >
                          {memberMeetings?.length || 0}
                        </span> */}
                      </button>
                      <button
                        className={`tab ${activeTab === "tab2" ? "active" : ""
                          }`}
                        onClick={() => setActiveTab("tab2")}
                      >
                        {t("Moments")}
                        <span
                          className={activeTab === "tab2" ? "future" : "draft"}
                        >
                          {memberMeetings?.length || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="member-profile-container">
              {activeTab === "tab1" && (
                <div className="member-profile-card p-4">
                  <div className="row">
                    {/* Right Column - Member Details */}
                    <div className="col-md-8">
                      <div className="member-details">
                        <div className="detail-grid">
                          {/* Row 1 */}
                          <div className="detail-item">
                            <span className="detail-label">Prénom:</span>
                            <span className="detail-value">
                              {member?.first_name || "-"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Nom:</span>
                            <span className="detail-value">
                              {member?.last_name || "-"}
                            </span>
                          </div>

                          {/* Row 2 */}
                          {/* <div className="detail-item">
                            <span className="detail-label">Pseudo:</span>
                            <span className="detail-value">
                              {member?.nick_name || "-"}
                            </span>
                          </div> */}
                          <div className="detail-item">
                            <span className="detail-label">Entreprise:</span>
                            <span className="detail-value">
                              {member?.clients?.name || "-"}
                            </span>
                          </div>

                          {/* Row 3 */}
                          <div className="detail-item">
                            <span className="detail-label">Poste:</span>
                            <span className="detail-value">
                              {member?.role || member?.post || "-"}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">
                              <a href={`mailto:${member?.email}`}>
                                {member?.email || "-"}
                              </a>
                            </span>
                          </div>

                          {/* Row 4 */}
                          <div className="detail-item">
                            <span className="detail-label">Téléphone:</span>
                            <span className="detail-value">
                              {member?.phone_number ? (
                                <a href={`tel:${member?.phone_number}`}>
                                  {member?.phone_number}
                                </a>
                              ) : (
                                "-"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Teams Section */}
                        {/* <div className="teams-section mt-4">
                          <h5 className="section-title mb-3">Teams</h5>
                          {member?.teams?.length > 0 ? (
                            <div className="teams-grid">
                              {member.teams.map((team) => (
                                <div key={team.id} className="team-badge">
                                  <img
                                    src={
                                      team.logo?.startsWith("http")
                                        ? team.logo
                                        : Assets_URL + "/" + team.logo
                                    }
                                    alt={team.name}
                                    className="team-logo"
                                    // onError={(e) => {
                                    //   e.target.src = "/Assets/default-team.png";
                                    // }}
                                  />
                                  <span className="team-name">{team.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No teams assigned</p>
                          )}
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {activeTab === "tab2" && (
              <div className="meetings-list">
                {memberMeetings.length > 0 ? (
                  memberMeetings.map((meeting, index) => (
                    <div
                      key={`${meeting.id}-${index}`}
                      ref={
                        index === memberMeetings.length - 1
                          ? lastMeetingRef
                          : null
                      }
                    >
                      <MomentCard item={meeting} refresh={getContact} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted mt-3">No moments found.</p>
                )}

                {isLoadingMore && (
                  <div className="text-center my-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "tab3" && (
              <div className="social-profiles-container">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <div className="row">
                    {/* Social Networks Section */}
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-white border-bottom-0">
                          <h5 className="card-title mb-0">
                            <i className="bi bi-share-network me-2"></i>
                            {t("profile.socialMedia")}
                          </h5>
                        </div>
                        <div className="card-body">
                          {member?.social_links?.length > 0 ? (
                            <div className="social-network-list">
                              {member?.social_links?.map((social) => (
                                <div
                                  key={social.id}
                                  className="social-item d-flex align-items-center mb-3"
                                >
                                  <div
                                    className={`social-icon bg-${social.platform.toLowerCase()}`}
                                  >
                                    <i
                                      className={`bi bi-${social.platform.toLowerCase()}`}
                                    ></i>
                                  </div>
                                  <div className="social-details ms-3">
                                    <h6 className="mb-0">{social.platform}</h6>
                                    <a
                                      href={social.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-truncate d-block"
                                      style={{ maxWidth: "250px" }}
                                    >
                                      {social.link.replace(
                                        /^https?:\/\/(www\.)?/,
                                        ""
                                      )}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-muted">
                              No social networks added
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sites Section */}
                    <div className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-header bg-white border-bottom-0">
                          <h5 className="card-title mb-0">
                            <i className="bi bi-globe me-2"></i>
                            Sites
                          </h5>
                        </div>
                        <div className="card-body">
                          {member?.websites?.length > 0 ? (
                            <div className="sites-list">
                              {member?.websites?.map((site) => (
                                <div
                                  key={site.id}
                                  className="site-item d-flex align-items-center mb-3"
                                >
                                  <div className="site-icon bg-primary">
                                    <i className="bi bi-link-45deg"></i>
                                  </div>
                                  <div className="site-details ms-3">
                                    <h6 className="mb-0">{site.title}</h6>
                                    <a
                                      href={site.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-truncate d-block"
                                      style={{ maxWidth: "250px" }}
                                    >
                                      {site.link.replace(
                                        /^https?:\/\/(www\.)?/,
                                        ""
                                      )}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-muted">
                              No sites added
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Affiliation Section */}
                    <div className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header bg-white border-bottom-0">
                          <h5 className="card-title mb-0">
                            <i className="bi bi-globe me-2"></i>
                            {t("profile.Affiliation")}
                          </h5>
                        </div>
                        <div className="card-body">
                          {member?.affiliation_links?.length > 0 ? (
                            <div className="sites-list">
                              {member?.affiliation_links?.map((site) => (
                                <div
                                  key={site.id}
                                  className="site-item d-flex align-items-center mb-3"
                                >
                                  <div className="site-icon bg-primary">
                                    <i className="bi bi-link-45deg"></i>
                                  </div>
                                  <div className="site-details ms-3">
                                    <h6 className="mb-0">{site.title}</h6>
                                    <a
                                      href={site.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-truncate d-block"
                                      style={{ maxWidth: "250px" }}
                                    >
                                      {site.link.replace(
                                        /^https?:\/\/(www\.)?/,
                                        ""
                                      )}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-muted">
                              No sites added
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Partnerships Section */}
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header bg-white border-bottom-0">
                          <h5 className="card-title mb-0">
                            <i className="bi bi-handshake me-2"></i>
                            {t("profile.products")}
                          </h5>
                        </div>
                        <div className="card-body">
                          {member?.products?.length > 0 ? (
                            <div className="partnerships-list">
                              {member?.products?.map((partnership) => (
                                <div
                                  key={partnership.id}
                                  className="partnership-item mb-4"
                                >
                                  <div className="row align-items-center">
                                    <div className="col-md-3 mb-3 mb-md-0">
                                      <div className="product-image-container">
                                        <img
                                          src={
                                            Assets_URL +
                                            "/" +
                                            partnership.product_image ||
                                            "/Assets/default-product.png"
                                          }
                                          alt={partnership.product_title}
                                          className="img-fluid rounded"
                                        // onError={(e) => {
                                        //   e.target.src = '/Assets/default-product.png';
                                        //   e.target.className = 'img-fluid rounded bg-light p-4';
                                        // }}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-9">
                                      <h5 className="product-title">
                                        {partnership.product_title}
                                      </h5>
                                      <p className="product-description text-muted">
                                        {partnership.product_description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 text-muted">
                              No partnerships added
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showContactModal && (
        <Modal
          show={showContactModal}
          onHide={() => setShowContactModal(false)}
          backdrop="static"
          keyboard={false}
          centered
          className="create-moment-modal"
          size={"lg"}
        >
          <Modal.Header className="border-0 pb-0">
            <Modal.Title style={{ fontSize: "20px" }}>
              {editingContact ? t("Update Contact") : t("team.Add Contact")}
            </Modal.Title>
            <Button
              variant="link"
              onClick={() => setShowContactModal(false)}
              className="position-absolute end-0 top-0 pe-3 pt-2"
            >
              <RxCross2 size={20} />
            </Button>
          </Modal.Header>

          <Modal.Body>
            <Row className="g-2">
              <Col md={6} className="form position-relative pe-3">
                <label className="form-label">{t("Email")}</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Enter Email")}
                  required
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <Dropdown.Menu
                    show
                    style={{
                      position: "absolute",
                      top: "100%",
                      width: "100%",
                      overflowY: "auto",
                      maxHeight: "250px", // Limit the height
                      zIndex: 1000,
                      borderRadius: "5px",
                    }}
                  >
                    {filteredSuggestions.map((contact, index) => (
                      <Dropdown.Item
                        key={index}
                        // className={`suggestion-item ${
                        //   index === activeSuggestionIndex ? "active" : ""
                        // }`}
                        onClick={() => selectEmail(contact)}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              contact?.image?.startsWith("users/")
                                ? `${Assets_URL}/${contact.image}`
                                : contact.image
                            }
                            alt="avatar"
                            style={{
                              width: "25px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          <div className="suggestion-email">
                            {contact.email}
                          </div>
                        </div>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
              </Col>
              <Col md={6} className="form pe-3">
                <label className="form-label">{t("Organization")}</label>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="client-tooltip">
                      💡 Commencez à taper pour rechercher un client existant ou
                      en créer un nouveau automatiquement.
                    </Tooltip>
                  }
                >
                  <div>
                    <Creatable
                      className="my-select destination-select-dropdown"
                      classNamePrefix="select"
                      options={clients}
                      value={selectedClient}
                      onChange={(option, actionMeta) => {
                        if (actionMeta.action === "create-option" && option) {
                          setSelectedClient(null); // Since this is a new client not in list
                          setFormData({
                            ...formData,
                            organization: option.label,
                          });
                        } else if (option) {
                          setSelectedClient(option); // Set entire object
                          setFormData({
                            ...formData,
                            organization: option.label,
                          });
                        } else {
                          setSelectedClient(null);
                          setFormData({ ...formData, organization: "" });
                        }
                      }}
                      isClearable
                      placeholder={t("client_placeholder")}
                      formatOptionLabel={(option, { context }) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Show client logo if available */}
                          {option.data?.client_logo && (
                            <img
                              src={option.data.client_logo.startsWith('http')
                                ? option.data.client_logo
                                : `${Assets_URL}/${option.data.client_logo}`}
                              alt={option.label}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '10px'
                              }}
                            />
                          )}
                          {/* Client name */}
                          <span>{option.label}</span>
                        </div>
                      )}
                    />
                  </div>
                </OverlayTrigger>
              </Col>


              <Col md={6} className="form pe-3">
                <label className="form-label">{t("Teams")}</label>
                <Creatable

                  isMulti
                  classNamePrefix="select"
                  className="my-select destination-select-dropdown"
                  options={teamOptions} // from your backend or static list
                  value={selectedTeams}
                  onChange={(selected) => {
                    setSelectedTeams(selected);
                    setFormData({
                      ...formData,
                      teams: selected ? selected.map((item) => item.value) : [],
                    });
                  }}
                  placeholder={t("Select Teams")}
                />
              </Col>
              <Col md={6} className="form pe-3">
                <label className="form-label">{t("First Name")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder={t("Enter First Name")}
                  required
                />
              </Col>
              <Col md={6} className="form pe-3">
                <label className="form-label">{t("Last Name")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder={t("Enter Last Name")}
                  required
                />
              </Col>

              <Col md={6} className="form pe-3">
                <label className="form-label">{t("Post")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.post}
                  onChange={(e) =>
                    setFormData({ ...formData, post: e.target.value })
                  }
                  placeholder={t("Enter Post")}
                  required
                />
              </Col>

              <Col md={6} className="form pe-3">
                <label className="form-label">{t("Phone")}</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t("Enter Phone Number")}
                />
              </Col>
              {/* Custom Fields Section */}
              {formData.customFields.map((field) => (
                <Col md={6} key={field.id} className="mb-3 form">
                  <label className="form-label">{field.name}</label>
                  {renderFieldInput(field)}
                </Col>
              ))}


            </Row>
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button variant="danger" onClick={() => setShowContactModal(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingContact ? t("Validate") : t("Create")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          message={t("contacts.delete_confirmation")}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmationModal(false);
            setContactToDelete(null);
          }}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default ContactDetail;
