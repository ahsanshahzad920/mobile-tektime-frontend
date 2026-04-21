import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, ButtonGroup, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSolutionFormContext } from "../../../../../context/CreateSolutionContext";
import { toast } from "react-toastify";
import { FaCaretDown, FaRotate } from "react-icons/fa6";
import { format } from "date-fns"; // Import the format function
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { French } from "flatpickr/dist/l10n/fr.js";
import { useDraftMeetings } from "../../../../../context/DraftMeetingContext";
import moment from "moment";

function SolutionDateAndTime({ setActiveTab }) {
    const {
        formState,
        setFormState,
        handleInputBlur,
        getSolution,
        checkId,
    } = useSolutionFormContext();

    const { language } = useDraftMeetings();
    let [locale, setLocale] = useState(null);
    if (language === "en") {
        locale = undefined;
    } else {
        locale = French;
    }
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());

    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [userTime, setUserTime] = useState(null);
    const [timeDifference, setTimeDifference] = useState(null);

    const handleChange = (date) => {
        setSelectedDateTime(date);
        if (date) {
            const datePart = date[0]?.toISOString().split("T")[0];
            const timePart = date[0]?.toTimeString().split(" ")[0];
            setFormState((prevState) => ({
                ...prevState,
                date: datePart,
                start_time: timePart,
            }));
        }
    };
    const [errors, setErrors] = useState({});
    const [showRepeatSection, setShowRepeatSection] = useState(false);
    const [t] = useTranslation("global");
    const [selectedDays, setSelectedDays] = useState([]);
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

    useEffect(() => {
        if (checkId) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    await getSolution(checkId);
                } catch (error) {
                    toast.error("Error fetching solution data");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }
    }, [checkId]);

    // Create a mapping from English days to French days
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
        // Set current date as default when component mounts
        const currentDate = new Date();
        const datePart = currentDate.toISOString().split("T")[0];
        const timePart = currentDate.toTimeString().split(" ")[0];

        if (!checkId) {
            setFormState((prevState) => ({
                ...prevState,
                date: datePart,
                start_time: timePart,
            }));
            setSelectedDateTime(currentDate);
        }
    }, []);

    useEffect(() => {
        if (formState?.date) {
            const existingDateTime =
                formState?.date && formState?.start_time
                    ? new Date(`${formState?.date}T${formState?.start_time}`)
                    : selectedDateTime;
            const translatedSelectedDays =
                language === "en"
                    ? translateDaysToEnglish(formState?.selected_days || [])
                    : translateDaysToFrench(formState?.selected_days || []);

            setSelectedDays(translatedSelectedDays || []); // Sync with selectedDays state
            setSelectedDateTime(existingDateTime);
            setShowRepeatSection(formState?.repetition);
        }
    }, [formState.date, formState.start_time, formState.repetition, language]);

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

    const handleToggle = (e) => {
        const isChecked = e.target.checked;
        setFormState((prevState) => ({
            ...prevState,
            repetition: isChecked,
        }));
        setShowRepeatSection(isChecked);
    };


    // Function to get the user's current time dynamically
    const updateUserTime = () => {
        const currentTime = moment().startOf("minute"); // Normalize to minute
        setUserTime(currentTime);
    };

    // Update userTime every minute dynamically
    useEffect(() => {
        updateUserTime();
        const interval = setInterval(updateUserTime, 60000); // Update every 60 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Calculate the time difference when userTime or meeting details change
    useEffect(() => {
        if (userTime && formState?.date && formState?.start_time) {
            const meetingTime = moment(
                `${formState?.date} ${formState?.start_time}`,
                "YYYY-MM-DD HH:mm:ss"
            ).startOf("minute"); // Normalize meeting time to remove seconds

            if (meetingTime.isValid()) {
                const diff = meetingTime.diff(userTime, "minutes");
                setTimeDifference(diff);
            } else {
                console.error("Invalid meeting date or time format.");
                setTimeDifference(null); // Reset to null if invalid
            }
        }
    }, [userTime, formState]);



    useEffect(() => {
        if (
            formState.repetition_frequency === "Daily" &&
            formState.repetition_number === 1
        ) {
            const translatedDays = [
                t("meeting.formState.NameofDays.Monday"),
                t("meeting.formState.NameofDays.Tuesday"),
                t("meeting.formState.NameofDays.Wednesday"),
                t("meeting.formState.NameofDays.Thursday"),
                t("meeting.formState.NameofDays.Friday"),
                t("meeting.formState.NameofDays.Saturday"),
                t("meeting.formState.NameofDays.Sunday"),
            ];

            const allDaysInEnglish = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ];

            setSelectedDays(translatedDays);
            setFormState((prevFormState) => ({
                ...prevFormState,
                selected_days: allDaysInEnglish,
            }));
        }
    }, [
        formState.repetition_frequency,
        formState.repetition_number,
        setFormState,
    ]);

    const formatDateWithCustomTime = (date) => {
        return format(date, "dd/MM/yyyy, HH'h'mm");
    };

    const currentDate = new Date();

    // Set minDate to tomorrow
    const minEndDate = new Date();
    minEndDate.setDate(currentDate.getDate());

    // Set maxDate exactly 3 months from minDate
    const maxEndDate = new Date(minEndDate);
    maxEndDate.setMonth(minEndDate.getMonth() + 3);

    const handleSave = async () => {
        setIsLoading(true);
        const newformstate = {
            ...formState,
        };

        await handleInputBlur(newformstate);
        setActiveTab("tab4");
        setIsLoading(false);
    };


    if (isLoading) {
        return (
            <Spinner
                animation="border"
                role="status"
                className="center-spinner"
            ></Spinner>
        );
    }

    return (
        <div className="p-4 pt-3 modal-height">
            <Row>
                <Col md={12}>
                    <Form.Group className="create-moment-modal">
                        <div className="mb-4 form d-flex flex-column">
                            <label className="form-label">
                                {t("meeting.formState.dateTime")}
                                <small style={{ color: "red", fontSize: "15px" }}>*</small>
                            </label>

                            <Flatpickr
                                data-enable-time
                                value={selectedDateTime}

                                onChange={handleChange}
                                options={{
                                    locale: locale,
                                    dateFormat: "d/m/Y, H:i",
                                    time_24hr: true,
                                    defaultDate: new Date(),
                                    formatDate: (date) => formatDateWithCustomTime(date),
                                    // minDate: minDate.toDate(),
                                    maxDate: null,
                                }}
                            />
                        </div>
                    </Form.Group>
                </Col>
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
                                            // const selectedNumber = e.target.value;
                                            const selectedNumber = parseInt(e.target.value, 10); // Parse the selected value as an integer
                                            setFormState((prevState) => ({
                                                ...prevState,
                                                repetition_number: selectedNumber,
                                            }));
                                            // If the user selects a number greater than 1, clear the selected days
                                            if (selectedNumber !== 1) {
                                                setFormState((prevState) => ({
                                                    ...prevState,
                                                    selected_days: [], // Clear selected days
                                                }));
                                                setSelectedDays([]); // Clear the local state for selected days as well
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
                                            {/* <label className="form-label">
                        {t("meeting.formState.Repitition Frequency")}
                      </label> */}
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
                                                            // Select all translated days when "Weekly" is chosen
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
                                                    {/* <option value="" disabled selected>
                        {t("meeting.formState.Repitition Frequency")}
                      </option> */}
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

                                                // Format the date manually in YYYY-MM-DD (Dont use the UTC Format, timezone issue arise)
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
                                            dateFormat: "d/m/Y", // Display format as dd/mm/yyyy
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
            <div className="modal-fotter col-md-12 d-flex justify-content-end px-4 modal-save-button">
                {isLoading ? (
                    <button className={`btn moment-btn px-2 py-0`}>
                        <span
                            class="spinner-border spinner-border-sm text-white"
                            role="status"
                            aria-hidden="true"
                        ></span>
                    </button>
                ) : (
                    <button
                        className={`btn moment-btn`}
                        onClick={handleSave}
                        disabled={isLoading}
          style={{padding:'0px 10px '}}

                    >
                        &nbsp;
                        {t("Continue")}
                        <span>
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M13.4707 8.52991C13.397 8.46125 13.3379 8.37845 13.2969 8.28645C13.2559 8.19445 13.2338 8.09513 13.2321 7.99443C13.2303 7.89373 13.2488 7.7937 13.2865 7.70031C13.3243 7.60692 13.3804 7.52209 13.4516 7.45087C13.5228 7.37965 13.6077 7.32351 13.7011 7.28579C13.7945 7.24807 13.8945 7.22954 13.9952 7.23132C14.0959 7.23309 14.1952 7.25514 14.2872 7.29613C14.3792 7.33712 14.462 7.39622 14.5307 7.46991L18.5307 11.4699C18.6711 11.6105 18.75 11.8012 18.75 11.9999C18.75 12.1987 18.6711 12.3893 18.5307 12.5299L14.5307 16.5299C14.462 16.6036 14.3792 16.6627 14.2872 16.7037C14.1952 16.7447 14.0959 16.7667 13.9952 16.7685C13.8945 16.7703 13.7945 16.7518 13.7011 16.714C13.6077 16.6763 13.5228 16.6202 13.4516 16.5489C13.3804 16.4777 13.3243 16.3929 13.2865 16.2995C13.2488 16.2061 13.2303 16.1061 13.2321 16.0054C13.2338 15.9047 13.2559 15.8054 13.2969 15.7134C13.3379 15.6214 13.397 15.5386 13.4707 15.4699L16.1907 12.7499H6.50066C6.30175 12.7499 6.11098 12.6709 5.97033 12.5302C5.82968 12.3896 5.75066 12.1988 5.75066 11.9999C5.75066 11.801 5.82968 11.6102 5.97033 11.4696C6.11098 11.3289 6.30175 11.2499 6.50066 11.2499H16.1907L13.4707 8.52991Z"
                                    fill="white"
                                />
                            </svg>
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default SolutionDateAndTime;
