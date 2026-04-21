import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import TeamCard from "./TeamCard";

const OurTeamsSubTabs = ({
  loading,
  closedLoading,
  closedTeams,
  activeTeams,
  getTeams,
  getClosedTeams,
}) => {
  const [tab, setTab] = useState("tab1");
  const [t] = useTranslation("global");

  const [activeTeamCount, setActiveTeamCount] = useState(0);
  const [closedTeamCount, setClosedTeamCount] = useState(0);
  React.useEffect(() => {
    if (activeTeams && activeTeams.length > 0) {
      const activeCount = activeTeams.filter(
        (team) => team.status === "active"
      ).length;
      const closedCount = closedTeams.filter(
        (team) => team.status === "closed"
      ).length;
      setActiveTeamCount(activeCount);
      setClosedTeamCount(closedCount);
    }
  }, [activeTeams, closedTeams]);

  const refresh = () => {
    getTeams();
    getClosedTeams();
  };

  return (
    <div className="tabs-container">
      <div className="border-bottom tabs-meeting">
        <div className="tabs" style={{ overflowX: "auto" }}>
          <div className="d-flex">
            <button
              className={`tab ${tab === "tab1" ? "active" : ""}`}
              onClick={() => setTab("tab1")}
            >
              {t("team.ourteams_subtabs.currentteams")}
              <span className={tab === "tab1" ? "future" : "draft"}>
                {activeTeamCount}
              </span>
            </button>
            <button
              className={`tab ${tab === "tab2" ? "active" : ""}`}
              onClick={() => setTab("tab2")}
            >
              {t("team.ourteams_subtabs.archivedteams")}
              <span className={tab === "tab2" ? "future" : "draft"}>
                {closedTeamCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        {tab === "tab1" && (
          <div>
            <TeamCard
              teams={activeTeams}
              loading={loading}
              isTeamView={true}
              isMemberView={false}
              isTeamMemberView={false}
              isEnterpriseView={false}
              isCastingView={false}
              isClientView={false}
              isContactView={false}
              refresh={refresh}
              getClosedTeams={getClosedTeams}
            />
          </div>
        )}
        {tab === "tab2" && (
          <div>
            <TeamCard
              teams={closedTeams}
              loading={closedLoading}
              isTeamView={true}
              isMemberView={false}
              isTeamMemberView={false}
              isEnterpriseView={false}
              isClientView={false}
              isCastingView={false}
              isContactView={false}
              refresh={refresh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OurTeamsSubTabs;
