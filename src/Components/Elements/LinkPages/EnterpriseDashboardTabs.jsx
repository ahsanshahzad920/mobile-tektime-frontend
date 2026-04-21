import CookieService from '../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import OurTeamsSubTabs from "../Team/OurTeamsSubTabs";
import TeamCard from "../Team/TeamCard";
import EnterpriseCard from "../Team/EnterpriseCard";
import EnterpriseGroups from "./EnterpriseGroups";

const EnterpriseDashboardTabs = ({
    enterprise,
    activeTeams,
    closedTeams,
    teamLoading,
    closedLoading,
    getTeams,
    getClosedTeams,
    members,
    memberLoading,
    getMembers,
    getEnterpriseClient,
    onCreateTeam,
    onAddUser,
}) => {
    const [t] = useTranslation("global");
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        const savedTab = CookieService.get("enterpriseActiveTab") || "dashboard";
        setActiveTab(savedTab);
    }, []);

    const handleTabSelect = (k) => {
        setActiveTab(k);
        CookieService.set("enterpriseActiveTab", k);
    };

    return (
        <div className="tektimetabs mt-3">
            <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                className="mb-3"
            >
                <Tab eventKey="dashboard" title={t("header.dashboard") || "Dashboard"}>
                    <EnterpriseCard
                        enterprise={enterprise}
                        loading={memberLoading}
                        getEnterpriseClient={getEnterpriseClient}
                    />
                </Tab>
                <Tab eventKey="teams" title={t("header.teams") || "Équipes"}>
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            className={`btn moment-btn d-flex`}
                            onClick={onCreateTeam}
                        >
                            <span>
                                <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M8 14.75V1.25M1.25 8H14.75"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            &nbsp; {t("Team.Create a Team")}
                        </button>
                    </div>
                    <OurTeamsSubTabs
                        activeTeams={activeTeams}
                        closedTeams={closedTeams}
                        loading={teamLoading}
                        closedLoading={closedLoading}
                        getTeams={getTeams}
                        getClosedTeams={getClosedTeams}
                    />
                </Tab>
                <Tab eventKey="members" title={`${t("team.membersof") || "Membres de"} ${enterprise?.name || ""}`}>
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            className={`btn moment-btn d-flex`}
                            onClick={onAddUser}
                        >
                            <span>
                                <svg
                                    width={16}
                                    height={16}
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M8 14.75V1.25M1.25 8H14.75"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            &nbsp; {t("Team.Add a User")}
                        </button>
                    </div>
                    <TeamCard
                        teams={members}
                        loading={memberLoading}
                        isMemberView={true}
                        isTeamMemberView={false}
                        isEnterpriseView={false}
                        isCastingView={false}
                        isTeamView={false}
                        isClientView={false}
                        isContactView={false}
                        refresh={getMembers}
                        enterprise={enterprise}
                    />
                </Tab>
            </Tabs>
        </div>
    );
};

export default EnterpriseDashboardTabs;
