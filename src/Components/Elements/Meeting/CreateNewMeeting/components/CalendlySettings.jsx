import React, { useState } from "react";
import { Form, Button, Row, Col, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { format } from "date-fns";
import { French } from "flatpickr/dist/l10n/fr.js";
import { useDraftMeetings } from "../../../../../context/DraftMeetingContext";

const CalendlySettings = ({ formState, setFormState }) => {
    const [t] = useTranslation("global");
    const { language } = useDraftMeetings();

    // Non-working days modal state
    const [showNonWorkingModal, setShowNonWorkingModal] = useState(false);
    const [nonWorkingDate, setNonWorkingDate] = useState(new Date());
    const [nonWorkingStartTime, setNonWorkingStartTime] = useState("00:00");
    const [nonWorkingEndTime, setNonWorkingEndTime] = useState("00:00");

    let locale = language === "en" ? undefined : French;

    const handleAddNonWorkingDay = () => {
        if (nonWorkingDate) {
            const dateStr = format(Array.isArray(nonWorkingDate) ? nonWorkingDate[0] : nonWorkingDate, "yyyy-MM-dd");
            const entry = `${dateStr} ${nonWorkingStartTime} to ${nonWorkingEndTime}`;
            if (!formState.calendly_non_availability?.includes(entry)) {
                setFormState({
                    ...formState,
                    calendly_non_availability: [
                        ...(formState.calendly_non_availability || []),
                        entry,
                    ],
                });
            }
            setShowNonWorkingModal(false);
            // Reset defaults
            setNonWorkingDate(new Date());
            setNonWorkingStartTime("00:00");
            setNonWorkingEndTime("00:00");
        }
    };

    return (
        <div className="calendly-config">
            {/* Timezone Section */}
            <div className="mb-4">
                <h5 className="fw-bold">{t("meeting.formState.Timezone") || "Fuseau horaire"}</h5>
                <Form.Group>
                    <Form.Label>{t("meeting.formState.YourTimezone") || "Votre fuseau horaire"}</Form.Label>
                    <Form.Control
                        type="text"
                        value={formState.calendly_timezone || "Europe/Paris"}
                        onChange={(e) =>
                            setFormState({ ...formState, calendly_timezone: e.target.value })
                        }
                    />
                </Form.Group>
            </div>

            {/* Availability Section */}
            <div className="mb-4">
                <h5 className="fw-bold">{t("meeting.formState.FixedWorkingDays") || "Jours ouvrables fixes"}</h5>
                <div className="availability-list">
                    {[
                        "Lundi",
                        "Mardi",
                        "Mercredi",
                        "Jeudi",
                        "Vendredi",
                        "Samedi",
                        "Dimanche",
                    ].map((day, index) => {
                        const dayConfig = formState.calendly_availability?.find(
                            (d) => d.day === day
                        ) || { day, active: index < 5, start: "09:00", end: "17:00" };

                        return (
                            <div key={day} className="d-flex align-items-center mb-3 gap-3">
                                <div className="d-flex align-items-center" style={{ width: "120px" }}>
                                    <Form.Check
                                        type="checkbox"
                                        checked={dayConfig.active}
                                        onChange={(e) => {
                                            const defaults = [
                                                "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
                                            ].map((d, i) => ({ day: d, active: i < 5, start: "09:00", end: "17:00" }));

                                            const currentAvailability = (formState.calendly_availability && formState.calendly_availability.length > 0)
                                                ? formState.calendly_availability
                                                : defaults;

                                            const newAvailability = [...currentAvailability];

                                            const targetIndex = newAvailability.findIndex(
                                                (d) => d.day === day
                                            );
                                            if (targetIndex >= 0) {
                                                newAvailability[targetIndex] = {
                                                    ...newAvailability[targetIndex],
                                                    active: e.target.checked
                                                };
                                            }
                                            setFormState({ ...formState, calendly_availability: newAvailability });
                                        }}
                                        label={day}
                                        className="mb-0"
                                    />
                                </div>
                                {dayConfig.active ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control
                                            type="time"
                                            value={dayConfig.start}
                                            onChange={(e) => {
                                                const defaults = [
                                                    "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
                                                ].map((d, i) => ({ day: d, active: i < 5, start: "09:00", end: "17:00" }));

                                                const currentAvailability = (formState.calendly_availability && formState.calendly_availability.length > 0)
                                                    ? formState.calendly_availability
                                                    : defaults;

                                                const newAvailability = [...currentAvailability];
                                                const targetIndex = newAvailability.findIndex(
                                                    (d) => d.day === day
                                                );
                                                if (targetIndex >= 0) {
                                                    newAvailability[targetIndex] = {
                                                        ...newAvailability[targetIndex],
                                                        start: e.target.value
                                                    };
                                                    setFormState({
                                                        ...formState,
                                                        calendly_availability: newAvailability,
                                                    });
                                                }
                                            }}
                                            style={{ width: "130px" }}
                                        />
                                        <span>à</span>
                                        <Form.Control
                                            type="time"
                                            value={dayConfig.end}
                                            onChange={(e) => {
                                                const defaults = [
                                                    "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
                                                ].map((d, i) => ({ day: d, active: i < 5, start: "09:00", end: "17:00" }));

                                                const currentAvailability = (formState.calendly_availability && formState.calendly_availability.length > 0)
                                                    ? formState.calendly_availability
                                                    : defaults;

                                                const newAvailability = [...currentAvailability];
                                                const targetIndex = newAvailability.findIndex(
                                                    (d) => d.day === day
                                                );
                                                if (targetIndex >= 0) {
                                                    newAvailability[targetIndex] = {
                                                        ...newAvailability[targetIndex],
                                                        end: e.target.value
                                                    };
                                                    setFormState({
                                                        ...formState,
                                                        calendly_availability: newAvailability,
                                                    });
                                                }
                                            }}
                                            style={{ width: "130px" }}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-muted">{t("meeting.formState.Unavailable") || "Indisponible"}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Non-Availability Section */}
            <div className="mb-4">
                <h5 className="fw-bold">{t("meeting.formState.NonWorkingDays") || "Jours non ouvrables"}</h5>

                <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                        <span className="text-muted me-3" style={{ minWidth: "50px" }}>{t("meeting.formState.Dates") || "Dates"}</span>
                        <div className="flex-grow-1">
                            {(formState.calendly_non_availability || []).length === 0 && (
                                <span className="text-muted fst-italic">{t("meeting.formState.NoDateSelected") || "Aucune date sélectionnée"}</span>
                            )}
                            {(formState.calendly_non_availability || []).map((entry, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between bg-light p-2 mb-2 rounded border">
                                    <span>{entry}</span>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                            const newExceptions = formState.calendly_non_availability.filter((_, i) => i !== idx);
                                            setFormState({ ...formState, calendly_non_availability: newExceptions });
                                        }}
                                    >
                                        {t("meeting.formState.Remove") || "Remove"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    <Button
                        variant="primary"
                        onClick={() => setShowNonWorkingModal(true)}
                        className="d-flex align-items-center gap-2"
                    >
                        {t("meeting.formState.AddDate") || "Ajouter une date"}
                    </Button>
                </div>

                {/* Add Non-Working Day Modal */}
                <Modal show={showNonWorkingModal} onHide={() => setShowNonWorkingModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{t("meeting.formState.AddNonWorkingDay") || "Add Non-Working Day"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("meeting.formState.Date") || "Date"}</Form.Label>
                            <Flatpickr
                                value={nonWorkingDate}
                                onChange={(date) => setNonWorkingDate(date)}
                                options={{
                                    dateFormat: "d/m/Y",
                                    minDate: "today",
                                    locale: locale || "default",
                                }}
                                className="form-control"
                                placeholder="mm/dd/yyyy"
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t("meeting.formState.StartTime") || "Start Time"}</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={nonWorkingStartTime}
                                        onChange={(e) => setNonWorkingStartTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t("meeting.formState.EndTime") || "End Time"}</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={nonWorkingEndTime}
                                        onChange={(e) => setNonWorkingEndTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={() => setShowNonWorkingModal(false)}>
                            {t("meeting.formState.Cancel") || "Cancel"}
                        </Button>
                        <Button variant="primary" onClick={handleAddNonWorkingDay}>
                            {t("meeting.formState.AddDate") || "Add Date"}
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        </div>
    );
};

export default CalendlySettings;
