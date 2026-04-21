import React, { useState, useEffect } from "react";
import { Form, Row, Col, ButtonGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { FaRotate, FaCaretDown } from "react-icons/fa6";
import { French } from "flatpickr/dist/l10n/fr.js";
import { useDraftMeetings } from "../../../../../context/DraftMeetingContext";

const RepetitionSettings = ({ formState, setFormState, meeting }) => {
    const [t] = useTranslation("global");
    const { language } = useDraftMeetings();
    const [showRepeatSection, setShowRepeatSection] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    let locale = language === "en" ? undefined : French;

    const daysOfWeek = [
        t("meeting.formState.NameofDays.Monday"),
        t("meeting.formState.NameofDays.Tuesday"),
        t("meeting.formState.NameofDays.Wednesday"),
        t("meeting.formState.NameofDays.Thursday"),
        t("meeting.formState.NameofDays.Friday"),
        t("meeting.formState.NameofDays.Saturday"),
        t("meeting.formState.NameofDays.Sunday"),
    ];

    const dayNameMap = {
        [t("meeting.formState.NameofDays.Monday")]: "Monday",
        [t("meeting.formState.NameofDays.Tuesday")]: "Tuesday",
        [t("meeting.formState.NameofDays.Wednesday")]: "Wednesday",
        [t("meeting.formState.NameofDays.Thursday")]: "Thursday",
        [t("meeting.formState.NameofDays.Friday")]: "Friday",
        [t("meeting.formState.NameofDays.Saturday")]: "Saturday",
        [t("meeting.formState.NameofDays.Sunday")]: "Sunday",
    };

    const dayTranslationMap = {
        Monday: "Lundi",
        Tuesday: "Mardi",
        Wednesday: "Mercredi",
        Thursday: "Jeudi",
        Friday: "Vendredi",
        Saturday: "Samedi",
        Sunday: "Dimanche",
    };

    const dayTranslationMapEng = {
        Monday: "Monday",
        Tuesday: "Tuesday",
        Wednesday: "Wednesday",
        Thursday: "Thursday",
        Friday: "Friday",
        Saturday: "Saturday",
        Sunday: "Sunday",
    };

    const translateDaysToFrench = (days) => {
        if (days?.length > 0) {
            return days?.map((day) => dayTranslationMap[day]);
        }
    };

    const translateDaysToEnglish = (days) => {
        if (days?.length > 0) {
            return days?.map((day) => dayTranslationMapEng[day]);
        }
    };

    useEffect(() => {
        if (formState.repetition !== undefined) {
            setShowRepeatSection(formState.repetition);
        }
        if (formState.selected_days) {
            const translatedSelectedDays =
                language === "en"
                    ? translateDaysToEnglish(formState.selected_days || [])
                    : translateDaysToFrench(formState.selected_days || []);
            setSelectedDays(translatedSelectedDays || []);
        }

    }, [formState.repetition, formState.selected_days, language]);


    const toggleDay = (day) => {
        setSelectedDays((prevSelectedDays) => {
            let newSelectedDays;
            if (prevSelectedDays.includes(day)) {
                newSelectedDays = prevSelectedDays.filter(
                    (selectedDay) => selectedDay !== day
                );
            } else {
                newSelectedDays = [...prevSelectedDays, day];
            }
            const daysInEnglish = newSelectedDays.map(
                (selectedDay) => dayNameMap[selectedDay]
            );

            setFormState((prevFormState) => ({
                ...prevFormState,
                selected_days: daysInEnglish,
            }));

            return newSelectedDays;
        });
    };

    const handleToggle = (e) => {
        if (meeting?.type === "Special" || meeting?.type === "Law") return;
        const isChecked = e.target.checked;
        setFormState((prevState) => ({
            ...prevState,
            repetition: isChecked,
        }));
        setShowRepeatSection(isChecked);
    };

    const renderDay = (day, index) => {
        const isSelected = selectedDays.includes(day);
        const firstChar = day.charAt(0);
        const styles = {
            backgroundColor: isSelected ? "#F5F8FF" : "rgba(146, 146, 157, 0.10)",
            border: isSelected ? "1px solid #0026B1" : "none",
            color: isSelected ? "#373782" : "black",
            borderRadius: "50%",
            padding: "10px 16px",
            textAlign: "center",
            cursor: "pointer",
        };

        return (
            <div key={index} style={styles} onClick={() => toggleDay(day)}>
                {firstChar}
            </div>
        );
    };

    // Set minDate to tomorrow
    const currentDate = new Date();
    const minEndDate = new Date();
    minEndDate.setDate(currentDate.getDate());

    // Set maxDate exactly 3 months from minDate
    const maxEndDate = new Date(minEndDate);
    maxEndDate.setMonth(minEndDate.getMonth() + 3);

    return (
        <>
            <Row>
                <Col md={12}>
                    <div
                        className="mt-3 d-flex justify-content-between align-items-center"
                        style={{
                            borderRadius: "16px",
                            background: " rgba(241, 245, 255, 0.70)",
                            padding: "12px",
                            cursor: "pointer",
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M19.3407 7.85705C20.1343 8.68843 20.6724 9.73026 20.8911 10.8586C21.1097 11.987 20.9996 13.1545 20.574 14.2221C20.1483 15.2897 19.425 16.2126 18.4899 16.8811C17.5549 17.5495 16.4476 17.9353 15.2997 17.9925L14.9997 18L10.0602 17.9985L11.7822 19.722C11.9064 19.8461 11.9832 20.0099 11.9991 20.1848C12.015 20.3597 11.969 20.5346 11.8692 20.679L11.7822 20.7825C11.6581 20.9068 11.4943 20.9835 11.3194 20.9994C11.1445 21.0153 10.9696 20.9694 10.8252 20.8695L10.7217 20.7825L7.71866 17.7795C7.59465 17.6553 7.51817 17.4914 7.50254 17.3165C7.48692 17.1417 7.53314 16.9668 7.63316 16.8225L7.71866 16.719L10.7217 13.716C10.8539 13.5832 11.0312 13.5047 11.2185 13.496C11.4058 13.4873 11.5895 13.5491 11.7335 13.6692C11.8775 13.7893 11.9713 13.959 11.9964 14.1448C12.0215 14.3306 11.9761 14.5191 11.8692 14.673L11.7822 14.778L10.0602 16.4985H14.9997C16.1472 16.4986 17.2515 16.0603 18.0866 15.2732C18.9216 14.486 19.4245 13.4096 19.4922 12.264L19.4997 12C19.4998 10.8157 19.0331 9.67902 18.2007 8.83655C18.0638 8.69803 17.9861 8.5117 17.9842 8.31697C17.9822 8.12223 18.056 7.93437 18.1901 7.79311C18.3241 7.65185 18.5079 7.56827 18.7025 7.56004C18.897 7.55182 19.0872 7.6196 19.2327 7.74905L19.3407 7.85705ZM13.1757 3.13055L13.2807 3.21605L16.2822 6.21905L16.3692 6.32405C16.4556 6.44929 16.5019 6.59787 16.5019 6.75005C16.5019 6.90222 16.4556 7.0508 16.3692 7.17605L16.2822 7.28105L13.2807 10.2825L13.1757 10.3695C13.0504 10.456 12.9018 10.5023 12.7497 10.5023C12.5975 10.5023 12.4489 10.456 12.3237 10.3695L12.2187 10.2825L12.1332 10.1775C12.0467 10.0523 12.0004 9.90372 12.0004 9.75155C12.0004 9.59937 12.0467 9.45079 12.1332 9.32555L12.2187 9.22055L13.9407 7.50005H8.99966C7.85184 7.49998 6.74739 7.93853 5.91227 8.72597C5.07715 9.51341 4.5745 10.5902 4.50716 11.736L4.49966 12C4.49966 13.23 4.99316 14.343 5.79116 15.156C5.91752 15.3003 5.98381 15.4876 5.97638 15.6792C5.96895 15.8709 5.88838 16.0524 5.75123 16.1865C5.61408 16.3206 5.43077 16.397 5.23899 16.4001C5.04722 16.4032 4.86155 16.3326 4.72016 16.203C3.91021 15.3779 3.35591 14.3364 3.12395 13.2037C2.89198 12.071 2.99223 10.8954 3.41263 9.81831C3.83303 8.74123 4.55568 7.80857 5.49364 7.13251C6.4316 6.45645 7.54492 6.0658 8.69966 6.00755L8.99966 6.00005L13.9407 5.99855L12.2187 4.27805L12.1332 4.17305C12.0344 4.02867 11.9892 3.85431 12.0053 3.68012C12.0215 3.50593 12.0981 3.34288 12.2218 3.21918C12.3455 3.09548 12.5085 3.01892 12.6827 3.00273C12.8569 2.98654 13.0313 3.03176 13.1757 3.13055Z"
                                    fill="#3D57B5"
                                />
                            </svg>
                            <Form.Label className="ml-2 mb-0">
                                {t("meeting.formState.repeat")}
                            </Form.Label>
                        </div>
                        <Form.Check
                            type="switch"
                            id="custom-switch"
                            label=""
                            checked={showRepeatSection}
                            onChange={handleToggle}
                            style={{ cursor: "pointer" }}
                        />
                    </div>
                </Col>
            </Row>
            {showRepeatSection && (
                <div className="mt-4">
                    <Row className="align-items-center">
                        <Col md={6} className="mt-4">
                            <div className="row align-items-center">
                                <div className="col-md-1">
                                    <FaRotate /> &nbsp;
                                </div>
                                <div className="col-md-3 p-0">
                                    <span>{t("meeting.formState.Repeat Each")}</span>
                                </div>
                                <div className="col-md-2 position-relative">
                                    <select
                                        id="numberSelect"
                                        className="form-select"
                                        value={formState.repetition_number}
                                        onChange={(e) => {
                                            const selectedNumber = parseInt(e.target.value, 10);
                                            setFormState((prevState) => ({
                                                ...prevState,
                                                repetition_number: selectedNumber,
                                            }));
                                            if (selectedNumber !== 1) {
                                                setFormState((prevState) => ({
                                                    ...prevState,
                                                    selected_days: [],
                                                }));
                                                setSelectedDays([]);
                                            }
                                        }}
                                        style={{ border: "none" }}
                                    >
                                        {[...Array(10).keys()].map((num) => (
                                            <option key={num + 1} value={num + 1}>
                                                {num + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <Form.Group className="create-moment-modal">
                                        <div className="form">
                                            <div className="position-relative w-100">
                                                <Form.Control
                                                    as="select"
                                                    required
                                                    value={formState.repetition_frequency}
                                                    onChange={(e) => {
                                                        const selectedFrequency = e.target.value;
                                                        setFormState((prevState) => ({
                                                            ...prevState,
                                                            repetition_frequency: selectedFrequency,
                                                        }));

                                                        if (selectedFrequency === "Daily") {
                                                            const translatedDays = [
                                                                t("meeting.formState.NameofDays.Monday"),
                                                                t("meeting.formState.NameofDays.Tuesday"),
                                                                t("meeting.formState.NameofDays.Wednesday"),
                                                                t("meeting.formState.NameofDays.Thursday"),
                                                                t("meeting.formState.NameofDays.Friday"),
                                                                t("meeting.formState.NameofDays.Saturday"),
                                                                t("meeting.formState.NameofDays.Sunday"),
                                                            ];

                                                            setSelectedDays(translatedDays);
                                                            const allDaysInEnglish = [
                                                                "Monday",
                                                                "Tuesday",
                                                                "Wednesday",
                                                                "Thursday",
                                                                "Friday",
                                                                "Saturday",
                                                                "Sunday",
                                                            ];

                                                            setFormState((prevFormState) => ({
                                                                ...prevFormState,
                                                                selected_days: allDaysInEnglish,
                                                            }));
                                                        } else {
                                                            setSelectedDays([]);
                                                            setFormState((prevFormState) => ({
                                                                ...prevFormState,
                                                                selected_days: [],
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <option value="Daily">
                                                        {t("meeting.formState.daily")}
                                                    </option>
                                                    <option value="Weekly">
                                                        {t("meeting.formState.weekly")}
                                                    </option>
                                                </Form.Control>
                                                <FaCaretDown
                                                    style={{
                                                        position: "absolute",
                                                        right: "10px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        pointerEvents: "none",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </Form.Group>
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            {(formState?.repetition_number === 1 ||
                                formState?.repetition_frequency !== "Daily") && (
                                    <Form.Group>
                                        <Form.Label>
                                            {" "}
                                            <Form.Label className="ml-2 mb-0">
                                                {t("meeting.formState.selectDays")}
                                            </Form.Label>
                                        </Form.Label>
                                        <div className="d-flex flex-wrap">
                                            <ButtonGroup className="w-100">
                                                <div
                                                    className="days-circle d-flex flex-wrap gap-1 align-items-center w-100"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {daysOfWeek.map(renderDay)}
                                                </div>
                                            </ButtonGroup>
                                        </div>
                                    </Form.Group>
                                )}
                        </Col>
                        <Col md={6} className="mt-4">
                            <Form.Group className="create-moment-modal">
                                <div className="mb-4 form">
                                    <label className="form-label">
                                        {t("meeting.newMeeting.labels.endTime")}
                                        <small style={{ color: "red", fontSize: "15px" }}>*</small>
                                    </label>

                                    <Flatpickr
                                        value={
                                            formState.repetition_end_date
                                                ? new Date(`${formState.repetition_end_date}T00:00:00`)
                                                : null
                                        }
                                        onChange={(selectedDates) => {
                                            if (selectedDates.length > 0) {
                                                const localDate = selectedDates[0];
                                                const formattedDate =
                                                    localDate.getFullYear() +
                                                    "-" +
                                                    String(localDate.getMonth() + 1).padStart(2, "0") +
                                                    "-" +
                                                    String(localDate.getDate()).padStart(2, "0");

                                                setFormState((prevState) => ({
                                                    ...prevState,
                                                    repetition_end_date: formattedDate,
                                                }));
                                            }
                                        }}
                                        options={{
                                            locale: locale || "default",
                                            dateFormat: "d/m/Y",
                                            enableTime: false,
                                            altInput: true,
                                            altFormat: "d/m/Y",
                                            minDate: minEndDate,
                                            maxDate: maxEndDate,
                                        }}
                                        className="form-control"
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            )}
        </>
    );
};

export default RepetitionSettings;
