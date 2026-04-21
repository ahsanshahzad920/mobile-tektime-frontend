import React, { useEffect, useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useLocation } from "react-router-dom";
import NewEnterprises from "./NewEnterprises";
import ActiveEnterprises from "./ActiveEnterprises";
import ClosedEntreprises from "./ClosedEntreprises";
import { useTranslation } from "react-i18next";

const EntrepriseTabs = ({ tabTitles }) => {
  const location = useLocation();
  const [t] = useTranslation("global");
  const [activeTab, setActiveTab] = useState("Entreprises actives");

  const handleTabChange = (eventKey) => {
    setActiveTab(eventKey);
  };

  return (
    <div className="tektimetabs mt-3">
      <Tabs
        defaultActiveKey={activeTab}
        id="uncontrolled-tab-example"
        className="mb-3"
        onSelect={handleTabChange}
        activeKey={activeTab}
      >
        <Tab
          className="tabs"
          eventKey="Entreprises archivées"
          title={t("enterpriseTabs.close")}
        >
          {activeTab === "Entreprises archivées" && (
            <ClosedEntreprises
              eventKey="Entreprises archivées"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Entreprises actives" title={t("enterpriseTabs.active")}>
          {activeTab === "Entreprises actives" && (
            <ActiveEnterprises
              eventKey="Entreprises actives"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>

        <Tab eventKey="Nouvelle entreprise" title={t("enterpriseTabs.new")}>
          {activeTab === "Nouvelle entreprise" && (
            <NewEnterprises
              eventKey="Nouvelle entreprise"
              setActiveTab={handleTabChange}
            />
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default EntrepriseTabs;
