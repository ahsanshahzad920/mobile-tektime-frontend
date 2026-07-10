import CookieService from '../../Utils/CookieService';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../Apicongfig";
import axios from "axios";
import { Spinner, Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import EnterpriseDashboardTabs from "./EnterpriseDashboardTabs";
import CreateTeam from "../Team/CreateTeam";

function EntreprisesToTeam() {
  const [t] = useTranslation("global");
  const { pushHeaderTitle, popHeaderTitle } = useHeaderTitle();
  const { id } = useParams();
  const navigate = useNavigate();

  const [enterpriseTeams, setEnterpriseTeams] = useState(null);
  const [activeTeams, setActiveTeams] = useState([]);
  const [closedTeams, setClosedTeams] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [closedLoading, setClosedLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showLicenseLimitModal, setShowLicenseLimitModal] = useState(false);

  const getEnterprisesTeams = async () => {
    const token = CookieService.get("token");
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get-enterprise-with-client/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setEnterpriseTeams(response?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching enterprise client info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTeams = async () => {
    const token = CookieService.get("token");
    try {
      setTeamLoading(true);
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const filtered = response?.data?.data?.filter(
          (team) => parseInt(team?.enterprise?.id) === parseInt(id)
        ) || [];
        setActiveTeams(filtered);
      }
    } catch (error) {
      console.error("Error fetching active teams:", error);
    } finally {
      setTeamLoading(false);
    }
  };

  const getClosedTeams = async () => {
    const token = CookieService.get("token");
    try {
      setClosedLoading(true);
      const response = await axios.get(`${API_BASE_URL}/closed/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const filtered = response?.data?.data?.filter(
          (team) => parseInt(team?.enterprise?.id) === parseInt(id)
        ) || [];
        setClosedTeams(filtered);
      }
    } catch (error) {
      console.error("Error fetching closed teams:", error);
    } finally {
      setClosedLoading(false);
    }
  };

  const getMembers = async () => {
    const token = CookieService.get("token");
    try {
      setMemberLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/enterprise-users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setMembers(response?.data?.data?.users || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    getEnterprisesTeams();
    getTeams();
    getClosedTeams();
    getMembers();
  }, [id]);

  useEffect(() => {
    if (enterpriseTeams?.name) {
      pushHeaderTitle({
        titleText: enterpriseTeams.name,
        link: `/EntreprisesToTeam/${id}`,
      });
    }
    return () => {
      popHeaderTitle();
    };
  }, [enterpriseTeams, id]);

  const handleUserClick = () => {
    if (enterpriseTeams?.used_license >= enterpriseTeams?.contract?.no_of_licenses) {
      setShowLicenseLimitModal(true);
      return;
    }
    setShowCreateTeam(false);
    navigate(`/user/create`, {
      state: { preselectedEnterprise: enterpriseTeams }
    });
  };

  const goBack = () => {
    window.history.back();
  };

  if (showCreateTeam) {
    return (
      <div className="tektimetabs">
        <CreateTeam
          eventKey="Nouvelle équipe"
          setActiveTab={() => {}}
          setShowCreateTeam={setShowCreateTeam}
          getTeams={getTeams}
          preselectedEnterprise={enterpriseTeams}
        />
      </div>
    );
  }

  return (
    <div className="scheduled">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-12 py-2">
            {!loading ? (
              <>
                <EnterpriseDashboardTabs
                  enterprise={enterpriseTeams}
                  activeTeams={activeTeams}
                  closedTeams={closedTeams}
                  teamLoading={teamLoading}
                  closedLoading={closedLoading}
                  getTeams={getTeams}
                  getClosedTeams={getClosedTeams}
                  members={members}
                  memberLoading={memberLoading}
                  getMembers={getMembers}
                  getEnterpriseClient={getEnterprisesTeams}
                  onCreateTeam={() => setShowCreateTeam(true)}
                  onAddUser={handleUserClick}
                />
                
                <div className="d-flex justify-content-center mt-5">
                  <button className="btn btn-primary shadow-sm px-4 py-2" onClick={goBack}>
                    {t("back") || "Revenir à la page précédente"}
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                <Spinner
                  animation="border"
                  role="status"
                  className="center-spinner"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showLicenseLimitModal && (
        <Modal
          show={showLicenseLimitModal}
          onHide={() => setShowLicenseLimitModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("License Limit Reached") || "License Limit Reached"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              {t("You have reached the maximum number of licenses allowed by your contract.") || 
               "You have reached the maximum number of licenses allowed by your contract."}
            </p>
            <p>
              {t("Please contact your administrator to upgrade your plan.") || 
               "Please contact your administrator to upgrade your plan."}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => setShowLicenseLimitModal(false)}
            >
              {t("close") || "Fermer"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default EntreprisesToTeam;
