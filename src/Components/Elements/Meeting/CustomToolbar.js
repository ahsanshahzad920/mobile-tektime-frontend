import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Views } from "react-big-calendar";
import { Tooltip, Button as AntButton, Radio, Typography, Space, Dropdown, Menu } from "antd";
import { LeftOutlined, RightOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title } = Typography;

const CustomToolbar = ({ 
  label, 
  onNavigate, 
  onView, 
  view, 
  date,
  setCurrentStartDate  
}) => {
  const { t } = useTranslation("global");

  const handleCurrentPeriod = () => {
    let targetDate;
    if (view === Views.DAY) {
      targetDate = moment().startOf("day").toDate();
    } else if (view === Views.WEEK) {
      targetDate = moment().startOf("week").toDate();
    } else if (view === Views.MONTH) {
      targetDate = moment().startOf("month").toDate();
    }
    setCurrentStartDate(targetDate);
    onNavigate("TODAY");
  };

  const viewMenuItems = [
    { key: Views.DAY, label: t("calendar.day") },
    { key: Views.WEEK, label: t("calendar.week") },
    { key: Views.MONTH, label: t("calendar.month") },
  ];

  const currentViewLabel = viewMenuItems.find(i => i.key === view)?.label;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Container fluid className="calendar-toolbar-container px-0 mb-2 mb-md-3">
      {isMobile ? (
        <div className="d-flex align-items-center justify-content-between gap-2 px-1">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
             <AntButton 
                icon={<CalendarOutlined />} 
                onClick={handleCurrentPeriod}
                className="d-flex align-items-center today-btn-mobile"
                size="small"
              />
            <Title level={5} className="mb-0 text-truncate label-mobile" style={{ maxWidth: '140px' }}>{label}</Title>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Dropdown
              overlay={
                <Menu onClick={(e) => onView(e.key)}>
                  {viewMenuItems.map(item => (
                    <Menu.Item key={item.key}>{item.label}</Menu.Item>
                  ))}
                </Menu>
              }
              trigger={['click']}
            >
              <AntButton size="small">
                {currentViewLabel}
              </AntButton>
            </Dropdown>
            <Space size={4}>
              <AntButton 
                icon={<LeftOutlined />} 
                onClick={() => onNavigate("PREV")}
                size="small"
              />
              <AntButton 
                icon={<RightOutlined />} 
                onClick={() => onNavigate("NEXT")}
                size="small"
              />
            </Space>
          </div>
        </div>
      ) : (
        <Row className="align-items-center g-3">
          {/* Left Side: Label and Today Button */}
          <Col xs={12} md={6} lg={4} className="d-flex align-items-center justify-content-center justify-content-md-start">
            <Space size="middle">
              <Title level={4} className="mb-0 text-nowrap">{label}</Title>
              <Tooltip title={t("calendar.today")}>
                <AntButton 
                  icon={<CalendarOutlined />} 
                  onClick={handleCurrentPeriod}
                  className="d-flex align-items-center"
                >
                  {t("calendar.today")}
                </AntButton>
              </Tooltip>
            </Space>
          </Col>

          {/* Center: View Switcher */}
          <Col xs={12} md={6} lg={4} className="d-flex justify-content-center">
            <Radio.Group 
              value={view} 
              onChange={(e) => onView(e.target.value)}
              buttonStyle="solid"
            >
              <Tooltip title={t("dailyTooltip")}>
                <Radio.Button value={Views.DAY}>{t("calendar.day")}</Radio.Button>
              </Tooltip>
              <Tooltip title={t("weekTooltip")}>
                <Radio.Button value={Views.WEEK}>{t("calendar.week")}</Radio.Button>
              </Tooltip>
              <Tooltip title={t("monthTooltip")}>
                <Radio.Button value={Views.MONTH}>{t("calendar.month")}</Radio.Button>
              </Tooltip>
            </Radio.Group>
          </Col>

          {/* Right Side: Navigation Buttons */}
          <Col xs={12} lg={4} className="d-flex justify-content-center justify-content-lg-end">
            <Space>
              <Tooltip title={t("prevBtnTooltip")}>
                <AntButton 
                  icon={<LeftOutlined />} 
                  onClick={() => onNavigate("PREV")}
                >
                  {t("calendar.prev")}
                </AntButton>
              </Tooltip>
              <Tooltip title={t("nextBtnTooltip")}>
                <AntButton 
                  icon={<RightOutlined />} 
                  onClick={() => onNavigate("NEXT")}
                >
                  {t("calendar.next")}
                </AntButton>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      )}

      <style>
        {`
          .calendar-toolbar-container .ant-typography {
            color: #1f2937;
          }
          .calendar-toolbar-container .ant-radio-button-wrapper-checked {
            background-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          .calendar-toolbar-container .ant-btn:hover {
            color: #3b82f6;
            border-color: #3b82f6;
          }
          @media (max-width: 768px) {
            .calendar-toolbar-container h4, .calendar-toolbar-container h5 {
              font-size: 0.95rem !important;
            }
            .label-mobile {
              font-weight: 600;
              color: #4b5563;
            }
            .today-btn-mobile {
              padding: 4px 8px !important;
            }
          }

        `}
      </style>
    </Container>
  );
};

export default CustomToolbar;