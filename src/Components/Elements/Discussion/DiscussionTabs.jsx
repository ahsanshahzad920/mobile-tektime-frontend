import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";
import { FaExpand, FaCompress, FaPlus, FaSyncAlt } from "react-icons/fa";
import { SiChatbot, SiIonos } from "react-icons/si";
import {
  Tabs,
  Button,
  Badge,
  Avatar,
  Typography,
  Space,
  Tooltip,
  Spin,
  Modal,
  Select,
} from "antd";
import axios from "axios";

import { useHeaderTitle } from "../../../context/HeaderTitleContext";
import { useFormContext } from "../../../context/CreateMeetingContext";
import { API_BASE_URL, Assets_URL } from "../../Apicongfig";
import AddNewEmail from "./Outlook/AddNewEmail";
import AddNewMail from "./Gmail/AddNewMail";
import AddNewIonosEmail from "./Ionos/AddNewIonosEmail";

// Tabs
import MissionTab from "./Tabs/MissionTab";
import OutlookTab from "./Tabs/OutlookTab";
import GmailTab from "./Tabs/GmailTab";
import IonosTab from "./Tabs/IonosTab";
import ChatbotTab from "./Tabs/ChatbotTab";
import MessagesToHandleTab from "./Tabs/MessagesToHandleTab";
import AssistantChatTab from "./Tabs/AssistantChatTab";

import AddAccountModal from "./Modals/AddAccountModal";
import AddEmailOptionsModal from "./Modals/AddEmailOptionsModal";
import useOutlookAuth from "./Hooks/useOutlookAuth";
import {
  getAllChatbots,
  getAllEmailDestinations,
  getAllIonosEmailDestinations,
  getAllGmailDestinations,
  getAssistantProfile,
} from "./api";

import { FaWhatsapp } from "react-icons/fa6";
import CookieService from "../../Utils/CookieService";

const { Title, Text } = Typography;

const GMAIL_SVG = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
      fill="white"
    />
    <path
      d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z"
      fill="#EA4335"
    />
    <path
      d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z"
      fill="#FBBC05"
    />
    <path
      d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z"
      fill="#34A853"
    />
    <path
      d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z"
      fill="#C5221F"
    />
    <path
      d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z"
      fill="#C5221F"
    />
    <path
      d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z"
      fill="#C5221F"
    />
    <path
      d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z"
      fill="#4285F4"
    />
  </svg>
);

const DiscussionTabs = () => {
  const { searchTerm } = useOutletContext();
  const [t] = useTranslation("global");
  const { setUser, user: headerUser } = useHeaderTitle();

  const [activeTab, setActiveTab] = useState("assistant");
  const [userData, setUserData] = useState(null);
  const [showAddEmailOptions, setShowAddEmailOptions] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [assistantProfile, setAssistantProfile] = useState({
    name: "TekTime",
    logo: null,
  });
  const [hasChatbotConversations, setHasChatbotConversations] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showAddGmail, setShowAddGmail] = useState(false);
  const [showAddIonosEmail, setShowAddIonosEmail] = useState(false);

  const triggerRefresh = useCallback(() => setRefreshTrigger((p) => p + 1), []);

  const { loginOutlookAndSaveProfileData, isOutlookSyncing } = useOutlookAuth({
    onSuccess: () => {
      setActiveTab("outlook");
      fetchUserDetail();
      triggerRefresh();
    },
  });

  const fetchUserDetail = useCallback(async () => {
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/users/${CookieService.get("user_id")}`,
        {
          headers: { Authorization: `Bearer ${CookieService.get("token")}` },
        },
      );
      if (resp.status === 200) {
        setUserData(resp.data.data);
        setUser(resp.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [setUser]);

  useEffect(() => {
    fetchUserDetail();
    const fetchAssistant = async () => {
      try {
        const resp = await getAssistantProfile();
        if (resp?.data)
          setAssistantProfile({
            name: resp.data.name || "TekTime",
            logo: resp.data.logo,
          });
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssistant();

    const checkChatbot = async () => {
      try {
        const u = JSON.parse(CookieService.get("user"));
        const d = await getAllChatbots(u?.enterprise?.id);
        if (d?.data?.conversations?.length > 0)
          setHasChatbotConversations(true);
      } catch (e) {
        console.error(e);
      }
    };
    checkChatbot();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === "outlook") await getAllEmailDestinations();
      else if (activeTab === "ionos")
        await getAllIonosEmailDestinations("sync=true");
      else if (activeTab === "gmail") await getAllGmailDestinations();
      triggerRefresh();
      fetchUserDetail();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasOutlook = userData?.email_links?.some(
    (l) => l.platform === "Outlook",
  );
  const hasIonos = userData?.ionos_links?.length > 0;
  const hasGmail = userData?.gmail_suit?.length > 0;
  const showMissionTab =
    userData?.enterprise?.contract?.mission_need === true &&
    userData?.user_needs?.some((n) => n.need === "mission_need");

  const tabItems = useMemo(
    () =>
      [
        {
          key: "assistant",
          label: (
            <Space align="center" size={8} style={{ padding: "4px 0" }}>
              <Avatar
                size="small"
                src={
                  assistantProfile.logo
                    ? assistantProfile.logo.startsWith("http")
                      ? assistantProfile.logo
                      : `${Assets_URL}/${assistantProfile.logo.replace(/^\//, "")}`
                    : "/Assets/sidebar-invite-logo.svg"
                }
              />
              <span style={{ lineHeight: "1" }}>{assistantProfile.name}</span>
            </Space>
          ),
          mobileLabel: assistantProfile.name,
          children: (
            <AssistantChatTab
              isActive={activeTab === "assistant"}
              assistantName={assistantProfile.name}
              assistantLogo={assistantProfile.logo}
            />
          ),
        },
        {
          key: "handle",
          label: t("header.messagesToHandle.tabTitle", "Messages à gérer"),
          mobileLabel: t(
            "header.messagesToHandle.tabTitle",
            "Messages à gérer",
          ),
          children: (
            <MessagesToHandleTab
              isActive={activeTab === "handle"}
              searchTerm={searchTerm}
              userData={userData}
            />
          ),
        },
        showMissionTab && {
          key: "missions",
          label: "Missions",
          mobileLabel: "Missions",
          children: (
            <MissionTab
              isActive={activeTab === "missions"}
              searchTerm={searchTerm}
              userData={userData}
            />
          ),
        },
        hasOutlook && {
          key: "outlook",
          label: (
            <Space align="center" style={{ padding: "4px 0" }}>
              <PiMicrosoftOutlookLogoFill color="#0A66C2" size={18} /> Outlook
            </Space>
          ),
          mobileLabel: "Outlook",
          children: (
            <OutlookTab
              isActive={activeTab === "outlook"}
              searchTerm={searchTerm}
              userData={userData}
              refreshTrigger={refreshTrigger}
              onShowCompose={() => setShowAddEmail(true)}
            />
          ),
        },
        hasGmail && {
          key: "gmail",
          label: (
            <Space align="center" style={{ padding: "4px 0" }}>
              {GMAIL_SVG} Gmail
            </Space>
          ),
          mobileLabel: "Gmail",
          children: (
            <GmailTab
              isActive={activeTab === "gmail"}
              searchTerm={searchTerm}
              userData={userData}
              refreshTrigger={refreshTrigger}
              onShowCompose={() => setShowAddGmail(true)}
            />
          ),
        },
        hasIonos && {
          key: "ionos",
          label: (
            <Space align="center" style={{ padding: "4px 0" }}>
              <SiIonos color="#003D8F" size={24} />
            </Space>
          ),
          mobileLabel: "Ionos",
          children: (
            <IonosTab
              isActive={activeTab === "ionos"}
              searchTerm={searchTerm}
              userData={userData}
              refreshTrigger={refreshTrigger}
              refreshUser={fetchUserDetail}
              onShowCompose={() => setShowAddIonosEmail(true)}
            />
          ),
        },
        hasChatbotConversations && {
          key: "chatbot",
          label: (
            <Space align="center" style={{ padding: "4px 0" }}>
              <SiChatbot size={18} /> Chatbot
            </Space>
          ),
          mobileLabel: "Chatbot",
          children: <ChatbotTab isActive={activeTab === "chatbot"} />,
        },
      ].filter(Boolean),
    [
      activeTab,
      assistantProfile,
      hasChatbotConversations,
      hasGmail,
      hasIonos,
      hasOutlook,
      searchTerm,
      showMissionTab,
      t,
      userData,
      refreshTrigger,
    ],
  );

  return (
    <div
      className={`d-flex flex-column bg-white ${isFullScreen ? "position-fixed top-0 start-0 w-100 h-100 z-index-1000" : ""}`}
      style={{
        height: isFullScreen ? "100dvh" : isMobile ? "calc(100dvh - 125px)" : "",
        zIndex: isFullScreen ? 2000 : 1,
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <div
        className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white shadow-sm"
        style={{ flexShrink: 0 }}
      >
        <Space direction="vertical" size={0}>
          <Title
            level={4}
            className="m-0"
            style={{ fontSize: "clamp(16px, 4vw, 24px)" }}
          >
            Discussions
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: "11px" }}
            className="d-none d-sm-block"
          >
            Gérez vos missions et messages
          </Text>
        </Space>

        <Space wrap>
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => setShowAddEmailOptions(true)}
            loading={isOutlookSyncing}
            size={window.innerWidth < 576 ? "small" : "middle"}
          >
            <span className="d-none d-sm-inline">
              {t("discussion.Add Email")}
            </span>
          </Button>

          {(activeTab === "outlook" ||
            activeTab === "gmail" ||
            activeTab === "ionos") && (
            <Tooltip title="Rafraîchir">
              <Button
                icon={<FaSyncAlt />}
                onClick={handleRefresh}
                loading={isRefreshing}
                size={window.innerWidth < 576 ? "small" : "middle"}
              />
            </Tooltip>
          )}

          <Button
            icon={isFullScreen ? <FaCompress /> : <FaExpand />}
            onClick={() => setIsFullScreen(!isFullScreen)}
            size={window.innerWidth < 576 ? "small" : "middle"}
          />
        </Space>
      </div>

      {/* Tabs Section - Fill remaining space */}
      <div
        className="flex-grow-1 d-flex flex-column overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {isMobile ? (
          <div className="d-flex flex-column h-100 overflow-hidden bg-white">
            <div className="p-2 border-bottom bg-light">
              <Select
                value={activeTab}
                onChange={setActiveTab}
                className="w-100"
                size="large"
                dropdownStyle={{ zIndex: 10000 }}
              >
                {tabItems.map((item) => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.mobileLabel || item.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div
              className="flex-grow-1"
              style={{ position: "relative", overflow: "hidden", minHeight: 0 }}
            >
              <div className="w-100 h-100 d-flex flex-column">
                {tabItems.find((t) => t.key === activeTab)?.children}
              </div>
            </div>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="discussion-tabs"
            tabBarStyle={{
              background: "#fff",
              margin: 0,
              padding: "4px 16px",
              borderBottom: "1px solid #f0f0f0",
              zIndex: 5,
            }}
            destroyInactiveTabPane
          />
        )}
      </div>

      <style>{`
        .discussion-tabs { height: 100%; display: flex; flex-direction: column; margin-top: 4px; }
        .discussion-tabs .ant-tabs-nav { margin-bottom: 0 !important; padding-top: 12px !important; }
        .discussion-tabs .ant-tabs-tab { padding-top: 10px !important; padding-bottom: 10px !important; }
        .discussion-tabs .ant-tabs-content-holder { flex: 1; overflow: hidden; min-height: 0; }
        .discussion-tabs .ant-tabs-content { height: 100%; }
        .discussion-tabs .ant-tabs-tabpane { height: 100%; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
      `}</style>

      {/* Modals */}
      <AddEmailOptionsModal
        show={showAddEmailOptions}
        onHide={() => setShowAddEmailOptions(false)}
        connectedServices={{
          gmail: hasGmail,
          outlook: hasOutlook,
          ionos: hasIonos,
        }}
        onSelect={(o) => {
          setShowAddEmailOptions(false);
          if (o === "outlook") loginOutlookAndSaveProfileData();
          else if (o === "ionos") setShowAddModal(true);
          else if (o === "gmail") setShowAddGmail(true);
        }}
      />

      <Modal
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        title="Ajouter Compte Ionos"
      >
        <AddAccountModal
          handleClose={() => setShowAddModal(false)}
          triggerRefresh={fetchUserDetail}
        />
      </Modal>
      <AddNewEmail
        show={showAddEmail}
        onClose={() => setShowAddEmail(false)}
        onEmailAdded={triggerRefresh}
      />
      <AddNewMail
        show={showAddGmail}
        onClose={() => setShowAddGmail(false)}
        onEmailAdded={triggerRefresh}
      />
      <AddNewIonosEmail
        show={showAddIonosEmail}
        onClose={() => setShowAddIonosEmail(false)}
        onEmailAdded={triggerRefresh}
      />
    </div>
  );
};

export default DiscussionTabs;
