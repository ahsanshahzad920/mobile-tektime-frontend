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

  const renderTabContent = () => {
    switch (activeTab) {
      case "Entreprises archivées":
        return (
          <ClosedEntreprises
            eventKey="Entreprises archivées"
            setActiveTab={handleTabChange}
          />
        );
      case "Entreprises actives":
        return (
          <ActiveEnterprises
            eventKey="Entreprises actives"
            setActiveTab={handleTabChange}
          />
        );
      case "Nouvelle entreprise":
        return (
          <NewEnterprises
            eventKey="Nouvelle entreprise"
            setActiveTab={handleTabChange}
          />
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
            {activeTab === "Entreprises archivées" && renderTabContent()}
          </Tab>

          <Tab eventKey="Entreprises actives" title={t("enterpriseTabs.active")}>
            {activeTab === "Entreprises actives" && renderTabContent()}
          </Tab>

          <Tab eventKey="Nouvelle entreprise" title={t("enterpriseTabs.new")}>
            {activeTab === "Nouvelle entreprise" && renderTabContent()}
          </Tab>
        </Tabs>
      </div>

      {/* Mobile Select Dropdown & Content */}
      <div className="d-block d-md-none px-3">
        <div className="mb-3">
          <select
            className="form-select form-control"
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            style={{
              height: "45px",
              fontSize: "16px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#f9f9f9"
            }}
          >
            <option value="Entreprises actives">{t("enterpriseTabs.active")}</option>
            <option value="Entreprises archivées">{t("enterpriseTabs.close")}</option>
            <option value="Nouvelle entreprise">{t("enterpriseTabs.new")}</option>
          </select>
        </div>
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default EntrepriseTabs;
