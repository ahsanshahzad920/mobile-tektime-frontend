import React from "react";
import { useTranslation } from "react-i18next";
import NoContent from "../Meeting/NoContent";
import TeamCard from "../Team/TeamCard";

const EnterpriseGroups = ({ clients = [], clientLoading, getClients, enterprise, show, setShow }) => {
    const [t] = useTranslation("global");

    // Extract unique groups from clients dynamically
    const dynamicGroups = React.useMemo(() => {
        const groups = Array.from(new Set(clients.map(c => c.groupe).filter(Boolean)));
        return groups.sort((a, b) => a.localeCompare(b));
    }, [clients]);

    const hasUngrouped = React.useMemo(() => clients.some(c => !c.groupe), [clients]);

    // Define all groups to show
    const activeGroups = React.useMemo(() => {
        const groups = [...dynamicGroups];
        if (hasUngrouped) {
            groups.push("Ungrouped");
        }
        return groups;
    }, [dynamicGroups, hasUngrouped]);

    const [activeSubTab, setActiveSubTab] = React.useState("");

    // Set initial active subtab or update if current one is no longer valid
    React.useEffect(() => {
        if (activeGroups.length > 0) {
            if (!activeSubTab || !activeGroups.includes(activeSubTab)) {
                setActiveSubTab(activeGroups[0]);
            }
        } else {
            setActiveSubTab("");
        }
    }, [activeGroups, activeSubTab]);

    const filteredClients = clients.filter(client => {
        if (activeSubTab === "Ungrouped") {
            return !client.groupe;
        }
        return client.groupe === activeSubTab;
    });

    const getGroupLabel = (group) => {
        if (group === "Ungrouped") {
            return t("invities.group_options.Ungrouped", "Other");
        }
        return t(`invities.group_options.${group}`, group);
    };

    return (
        <div className="container-fluid px-0">

            {activeGroups.length > 0 ? (
                <div className="tektimetabs mt-4">
                    <div className="tabs-meeting mb-4">
                        <div className="tabs" style={{ overflowX: "auto" }}>
                            <div className="d-flex">
                                {activeGroups.map((groupValue) => (
                                    <button
                                        key={groupValue}
                                        className={`tab ${activeSubTab === groupValue ? "active" : ""}`}
                                        onClick={() => setActiveSubTab(groupValue)}
                                    >
                                        {getGroupLabel(groupValue)}
                                        <span className={activeSubTab === groupValue ? "future" : "draft"}>
                                            {clients.filter(c => {
                                                if (groupValue === "Ungrouped") return !c.groupe;
                                                return c.groupe === groupValue;
                                            }).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <TeamCard
                            teams={filteredClients}
                            loading={clientLoading}
                            isClientView={true}
                            isMemberView={false}
                            isTeamView={false}
                            isTeamMemberView={false}
                            isCastingView={false}
                            isEnterpriseView={false}
                            isContactView={false}
                            refresh={getClients}
                            enterprise={enterprise}
                            show={show}
                            setShow={setShow}
                            clientId={null}
                        />
                    </div>
                </div>
            ) : (
                <NoContent title={t("Groups")} />
            )}
        </div>
    );
};

export default EnterpriseGroups;
