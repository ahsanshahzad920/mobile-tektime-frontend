import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useLocation } from "react-router-dom";
import CreateContract from "./CreateContract";
import CurrentContract from "./CurrentContract";
import ClosedContract from "./ClosedContract";
import Gates from "./Gates";
import { useTranslation } from "react-i18next";

const ContractTabs = () => {
  const location = useLocation();
  const [t] = useTranslation("global");

  // Main level tab state
  const [mainActiveTab, setMainActiveTab] = useState("Abonnements");

  // Sub level tab state (for Abonnements)
  const [abonnementActiveTab, setAbonnementActiveTab] = useState("Abonnements en cours");

  const handleMainTabChange = (key) => {
    setMainActiveTab(key);
  };

  const handleAbonnementTabChange = (eventKey) => {
    setAbonnementActiveTab(eventKey);
  };

  const queryParams = new URLSearchParams(location.search);
  const fromPresentation = queryParams.get("from") === "play";
  const fromPresentation1 = queryParams.get("from") === "completeedit";
  const fromPresentation2 = queryParams.get("from") === "presentation";
  const fromPresentation3 = queryParams.get("from") === "schedule";

  useEffect(() => {
    if (fromPresentation || fromPresentation1 || fromPresentation2) {
      setMainActiveTab("Abonnements");
      setAbonnementActiveTab("Abonnements clôturés");
    } else if (fromPresentation3) {
      setMainActiveTab("Abonnements");
      setAbonnementActiveTab("Abonnements en cours");
    }
  }, [fromPresentation, fromPresentation1, fromPresentation2, fromPresentation3]);

  return (
    <div className="tektimetabs mt-3">
      {/* Main Tabs: Abonnements vs Gates */}
      <Tabs
        activeKey={mainActiveTab}
        onSelect={handleMainTabChange}
        id="main-contract-tabs"
        className="mb-3"
      >
        {/* TAB 1: ABONNEMENTS (Contains existing sub-tabs) */}
        <Tab eventKey="Abonnements" title="Abonnements">
          <div className="p-2">
            <Tabs
              activeKey={abonnementActiveTab}
              onSelect={handleAbonnementTabChange}
              defaultActiveKey={"Abonnements en cours"}
              id="abonnement-sub-tabs"
              className="mb-3"
            >
              <Tab
                className="tabs"
                eventKey="Abonnements clôturés"
                title={t("contractTabs.close")}
              >
                {abonnementActiveTab === "Abonnements clôturés" && (
                  <ClosedContract
                    eventKey="Abonnements clôturés"
                    setActiveTab={handleAbonnementTabChange}
                  />
                )}
              </Tab>

              <Tab eventKey="Abonnements en cours" title={t("contractTabs.active")}>
                {abonnementActiveTab === "Abonnements en cours" && (
                  <CurrentContract
                    eventKey="Abonnements en cours"
                    setActiveTab={handleAbonnementTabChange}
                  />
                )}
              </Tab>

              <Tab eventKey="Nouvel Abonnement" title={t("contractTabs.new")}>
                {abonnementActiveTab === "Nouvel Abonnement" && (
                  <CreateContract
                    eventKey="Nouvel Abonnement"
                    setActiveTab={handleAbonnementTabChange}
                  />
                )}
              </Tab>
            </Tabs>
          </div>
        </Tab>

        {/* TAB 2: PORTES (GATES) */}
        <Tab eventKey="Portes" title="Portes (Gates)">
          <Gates />
        </Tab>
      </Tabs>
    </div>
  );
}

export default ContractTabs;
