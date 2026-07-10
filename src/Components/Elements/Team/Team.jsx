import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import TeamTabs from "./TeamTabs";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import axios from "axios";
import { API_BASE_URL } from "../../Apicongfig";
import { getUserRoleID } from "../../Utils/getSessionstorageItems";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

const Team = () => {
  const { resetHeaderTitle } = useHeaderTitle();
  const [t] = useTranslation("global");
  React.useEffect(() => {
    resetHeaderTitle();
  }, []);

  //Active Teams
  const [activeTeams, setActiveTeams] = useState([]);
  const [filteredActiveTeams, setFilteredActiveTeams] = useState([]);

  const [loading, setLoading] = useState(false);
  const getTeams = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        if (response.data?.enterprise) {
          CookieService.set(
            "enterprise",
            JSON.stringify(response.data?.enterprise)
          );
        }

        const loggedInUser = CookieService.get("user") ? JSON.parse(CookieService.get("user")) : null;
        const cookieEnterprise = CookieService.get("enterprise") ? JSON.parse(CookieService.get("enterprise")) : null;
        const userEnterpriseId = loggedInUser?.enterprise?.id || cookieEnterprise?.id || response.data?.enterprise?.id;

        const filterredTeams = response.data?.data?.filter((team) => {
          return team?.enterprise?.id == userEnterpriseId;
        }) || [];

        console.log('filterredTeams', filterredTeams);
        setActiveTeams(filterredTeams);
        setLoading(true);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
    } finally {
      setLoading(false);
    }
  };

  const [closedTeams, setClosedTeams] = useState([]);
  const [filteredClosedTeams, setFilteredClosedTeams] = useState([]);

  const [closedLoading, setClosedLoading] = useState(false);

  const getClosedTeams = async () => {
    const token = CookieService.get("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/closed/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status) {
        setClosedLoading(true);

        const loggedInUser = CookieService.get("user") ? JSON.parse(CookieService.get("user")) : null;
        const cookieEnterprise = CookieService.get("enterprise") ? JSON.parse(CookieService.get("enterprise")) : null;
        const userEnterpriseId = loggedInUser?.enterprise?.id || cookieEnterprise?.id || response.data?.enterprise?.id;

        const filterredTeams = response.data?.data?.filter((team) => {
          return team?.enterprise?.id == userEnterpriseId;
        }) || [];

        setClosedTeams(filterredTeams);
        setClosedLoading(true);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.errors[0] || error.message));
    } finally {
      setClosedLoading(false);
    }
  };

  const [members, setMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [enterprise, setEnterprise] = useState(false);
  const user = JSON.parse(CookieService.get("user"));
  const enterpriseId = user?.enterprise?.id; // safely access enterprise ID

  const getEnterpriseClient = async () => {
    if (!enterpriseId) return; // prevent API call if enterpriseId is not available

    const token = CookieService.get("token");
    try {
      setMemberLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/get-enterprise-with-client/${enterpriseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const data = response?.data?.data;
        console.log("data", data);
        setEnterprise(data);

      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
      // console.log("error message", error);
    } finally {
      setMemberLoading(false);
    }
  };
  const getMembers = async () => {
    if (!enterpriseId) return; // prevent API call if enterpriseId is not available

    const token = CookieService.get("token");
    try {
      setMemberLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/enterprise-users/${enterpriseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        const data = response?.data?.data;
        console.log("data", data);
        setMembers(data?.users);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
      // console.log("error message", error);
    } finally {
      setMemberLoading(false);
    }
  };

  // 3rd Tab (users of enterprise)
  const [clients, setClients] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);

  const getClients = async () => {
    const token = CookieService.get("token");
    try {
      setClientLoading(true);
      const response = await axios.get(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const clients = response?.data?.data;
        setClients(clients);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setClientLoading(false);
    }
  };
  const [contacts, setContacts] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);

  const getContacts = async () => {
    const token = CookieService.get("token");
    try {
      setContactLoading(true);
      const response = await axios.get(`${API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const clients = response?.data?.data;
        setContacts(clients);
      }
    } catch (error) {
      toast.error(t(error?.response?.data?.errors[0] || error?.message));
    } finally {
      setContactLoading(false);
    }
  };
  const { searchTerm } = useOutletContext(); // Get search term from context

  // Add filtering functions
  const filterTeams = (teams) => {
    if (!searchTerm) return teams;
    return teams.filter(
      (team) =>
        team.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterMembers = (members) => {
    if (!searchTerm) return members;
    return members.filter(
      (member) =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterClients = (clients) => {
    if (!searchTerm) return clients;
    return clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterContacts = (contacts) => {
    if (!searchTerm) return contacts;
    return contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  return (
    <>
      <TeamTabs
        activeTeams={filterTeams(activeTeams)}
        closedTeams={filterTeams(closedTeams)}
        getTeams={getTeams}
        getClosedTeams={getClosedTeams}
        activeLoading={loading}
        closedLoading={closedLoading}
        members={filterMembers(members)}
        memberLoading={memberLoading}
        getMembers={getMembers}
        getEnterpriseClient={getEnterpriseClient}
        enterprise={enterprise}
        enterpriseId={enterpriseId}
        getClients={getClients}
        clientLoading={clientLoading}
        clients={filterClients(clients)}
        contactLoading={contactLoading}
        contacts={filterContacts(contacts)}
        getContacts={getContacts}
      />
    </>
  );
};

export default Team;
