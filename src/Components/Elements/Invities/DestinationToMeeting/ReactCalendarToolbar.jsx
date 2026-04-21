import React from "react";
import { Button, ButtonGroup, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Views } from "react-big-calendar";

const ReactCalendarToolbar = ({
  label,
  onNavigate,
  onView,
  view,
  onNavigateToToday, // NEW PROP
}) => {
  const { t } = useTranslation("global");

  return (
    <div className="calendar-toolbar-container">
      <Row className="align-items-center mb-3">
        <Col xs="12" md="6" className="d-flex align-items-center">
          <h4
            className="mb-0 me-4 fw-bold text-dark"
            style={{ fontSize: "1.4rem" }}
          >
            {label}
          </h4>
        </Col>
        <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0 d-flex flex-row flex-row-lg gap-3 gap-0-lg justify-content-end ">
          <ButtonGroup className="me-2">
            <Button className="btn-nxt-pre" onClick={() => onView(Views.MONTH)}>
              {t("calendar.month")}
            </Button>{" "}
            <Button className="btn-nxt-pre" onClick={() => onView(Views.DAY)}>
              {t("calendar.day")}
            </Button>
            <Button className="btn-nxt-pre" onClick={() => onView(Views.WEEK)}>
              {t("calendar.week")}
            </Button>
            <Button
              className="btn-nxt-pre"
              onClick={() => onView(Views.AGENDA)}
            >
              {t("calendar.year")}
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button className="btn-nxt-pre" onClick={() => onNavigate("PREV")}>
              {t("calendar.prev")}
            </Button>

            <Button className="btn-nxt-pre" onClick={onNavigateToToday}>
              {t("calendar.today")}
            </Button>

            <Button className="btn-nxt-pre" onClick={() => onNavigate("NEXT")}>
              {t("calendar.next")}
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </div>
  );
};

export default ReactCalendarToolbar;

// 