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

    const renderTabContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <EnterpriseCard
                        enterprise={enterprise}
                        loading={memberLoading}
                        getEnterpriseClient={getEnterpriseClient}
                    />
                );
            case "teams":
                return (
                    <>
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
                    </>
                );
            case "members":
                return (
                    <>
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
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="tektimetabs mt-3">
            {/* Desktop Tabs */}
            <div className="d-none d-md-block">
                <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabSelect}
                    className="mb-3"
                >
                    <Tab eventKey="dashboard" title={t("header.dashboard") || "Dashboard"}>
                        {activeTab === "dashboard" && renderTabContent()}
                    </Tab>
                    <Tab eventKey="teams" title={t("header.teams") || "Équipes"}>
                        {activeTab === "teams" && renderTabContent()}
                    </Tab>
                    <Tab eventKey="members" title={`${t("team.membersof") || "Membres de"} ${enterprise?.name || ""}`}>
                        {activeTab === "members" && renderTabContent()}
                    </Tab>
                </Tabs>
            </div>

            {/* Mobile Select Dropdown & Content */}
            <div className="d-block d-md-none px-3">
                <div className="mb-3">
                    <select
                        className="form-select form-control"
                        value={activeTab}
                        onChange={(e) => handleTabSelect(e.target.value)}
                        style={{
                          height: "45px",
                          fontSize: "16px",
                          fontWeight: "500",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          backgroundColor: "#f9f9f9"
                        }}
                    >
                        <option value="dashboard">{t("header.dashboard") || "Dashboard"}</option>
                        <option value="teams">{t("header.teams") || "Équipes"}</option>
                        <option value="members">{`${t("team.membersof") || "Membres de"} ${enterprise?.name || ""}`}</option>
                    </select>
                </div>
                <div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default EnterpriseDashboardTabs;
