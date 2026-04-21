import CookieService from "../../../Utils/CookieService";
import React, { useState, useEffect } from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import { enUS } from "date-fns/locale/en-US";
import { useTranslation } from "react-i18next";
import { FaClock, FaGlobeAmericas, FaVideo } from "react-icons/fa";
import { Assets_URL, API_BASE_URL } from "../../../Apicongfig";
import moment from "moment";
import axios from "axios";

registerLocale("fr", fr);
registerLocale("en", enUS);

const CalendlyBooking = ({ meetingData, onConfirm }) => {
  const { t, i18n } = useTranslation("global");
  // Handle cases where language might be "fr-FR" or "en-US"
  const currentLanguage = (i18n.language || "fr").split("-")[0];
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  useEffect(() => {
    const fetchUnavailability = async () => {
      const userId =
        meetingData?.user?.id ||
        CookieService.get("user_id");

      if (userId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/get-user-unavailability/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );
          if (response.data && response.data.success) {
            setUnavailableSlots(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching unavailability:", error);
        }
      } else {
        console.warn(
          "CalendlyBooking - No userId found to fetch unavailability",
        );
      }
    };
    fetchUnavailability();
  }, []);

  // Dynamic time slots generation
  const generateTimeSlotsForDate = (date) => {
    if (!date || !meetingData?.calendly_availability) return [];

    // Mapping from getDay() (0=Sunday) to French day names used in API
    const daysMapping = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const dayIndex = date.getDay();
    const dayName = daysMapping[dayIndex];

    const availability = meetingData.calendly_availability.find(
      (day) => day.day === dayName,
    );

    if (!availability || !availability.active) return [];

    const slots = [];
    let currentTime = moment(`${availability.start}`, "HH:mm");
    const endTime = moment(`${availability.end}`, "HH:mm");

    // Assuming 30 min intervals, can be made dynamic if duration is available
    const duration = meetingData?.duration
      ? parseInt(meetingData.duration)
      : 30;

    while (currentTime.isBefore(endTime)) {
      const timeString = currentTime.format("HH:mm");

      // Check non-availability
      // Format: "YYYY-MM-DD HH:mm to HH:mm"
      const isUnavailable = meetingData.calendly_non_availability?.some(
        (range) => {
          if (!range) return false;

          const parts = range.split(" to ");
          if (parts.length === 2) {
            let startRange = moment(parts[0]);
            let endRange;

            if (parts[1].includes("-")) {
              endRange = moment(parts[1]);
            } else {
              // assume same day
              const datePart = startRange.format("YYYY-MM-DD");
              endRange = moment(`${datePart} ${parts[1]}`);
            }

            const slotTime = moment(date).set({
              hour: currentTime.get("hour"),
              minute: currentTime.get("minute"),
              second: 0,
            });

            // Handle blocking exact start time if start == end
            if (startRange.isSame(endRange)) {
              // Special case: 00:00 to 00:00 means the WHOLE DAY is unavailable
              if (startRange.format("HH:mm") === "00:00") {
                // If the slot is on the same day, it's unavailable
                return slotTime.isSame(startRange, "day");
              }
              return slotTime.isSame(startRange);
            }

            return slotTime.isBetween(startRange, endRange, null, "[)");
          }
          return false;
        },
      );

      // Check non-availability (API data)
      const isApiUnavailable = unavailableSlots.some((slot) => {
        // Remove 'Z' to treat the time as local
        const apiStart = moment(slot.start_time.replace("Z", ""));
        const apiEnd = moment(slot.end_time.replace("Z", ""));

        // Construct the current slot's full datetime
        // We use the date but with the hour/minute of currentTime
        const slotStart = moment(date).set({
          hour: currentTime.get("hour"),
          minute: currentTime.get("minute"),
          second: 0,
          millisecond: 0,
        });

        // Calculate slot end based on duration
        const slotEnd = slotStart.clone().add(duration, "minutes");

        const isOverlap =
          slotStart.isBefore(apiEnd) && slotEnd.isAfter(apiStart);

        return isOverlap;
      });

      // Check if slot is in the past
      const slotStartToCheck = moment(date).set({
        hour: currentTime.get("hour"),
        minute: currentTime.get("minute"),
        second: 0,
        millisecond: 0,
      });

      if (
        !isUnavailable &&
        !isApiUnavailable &&
        slotStartToCheck.isAfter(moment())
      ) {
        slots.push(timeString);
      }

      currentTime.add(duration, "minutes");
    }
    return slots;
  };

  const timeSlots = generateTimeSlotsForDate(selectedDate);

  // Filter days that are not active in the weekly schedule or have no available slots
  const isDateEnabled = (date) => {
    if (!meetingData?.calendly_availability) return false;

    // 1. Check if the day is enabled in general availability
    const daysMapping = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const dayName = daysMapping[date.getDay()];
    const dayConfig = meetingData.calendly_availability.find(
      (d) => d.day === dayName,
    );

    if (!dayConfig || !dayConfig.active) {
      return false;
    }

    // 2. Check if there are any actual slots available for this specific date
    const slots = generateTimeSlotsForDate(date);
    return slots.length > 0;
  };

  return (
    <div className="calendly-booking-container">
      <style>
        {`
                    .react-datepicker__day--disabled {
                        color: #ccc !important;
                        background-color: #f9f9f9 !important;
                        cursor: not-allowed !important;
                        opacity: 0.6;
                        pointer-events: none;
                    }
                    .react-datepicker__day--disabled:hover {
                        background-color: #f9f9f9 !important;
                    }
                `}
      </style>
      <div className="calendly-card">
        {/* Left Side: Meeting Details */}
        {/* <div className="calendly-details">
                    <div className="host-info">
                        {meetingData?.user?.image && (
                            <img
                                src={meetingData.user.image.startsWith("http") ? meetingData.user.image : `${Assets_URL}/${meetingData.user.image}`}
                                alt={meetingData.user.full_name}
                                className="host-avatar"
                            />
                        )}
                        <span className="host-name">{meetingData?.user?.full_name}</span>
                    </div>
                    <h2 className="meeting-title">{meetingData?.title || "Meeting Name"}</h2>
                    <div className="meeting-meta">
                        <div className="meta-item">
                            <FaClock className="icon" />
                            <span>{meetingData?.duration || "30"} min</span>
                        </div>
                        {meetingData?.location && (
                            <div className="meta-item">
                                <FaVideo className="icon" />
                                <span>{meetingData.location}</span>
                            </div>
                        )}
                    </div>
                    {meetingData?.description && (
                        <div className="meeting-description" dangerouslySetInnerHTML={{ __html: meetingData.description }} />
                    )}
                </div> */}

        {/* Right Side: Calendar & Time Selection */}
        <div className="calendly-picker-section">
          <h3 className="picker-title">
            {t("meeting.calendly.selectDateTime")}
          </h3>
          <div className="picker-content">
            <div className="calendar-wrapper">
              <ReactDatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null); // Reset time when date changes
                }}
                inline
                filterDate={isDateEnabled}
                calendarClassName="calendly-datepicker"
                locale={currentLanguage}
              />
            </div>

            {/* Time Slots Column (Visible when date is selected) */}
            <div
              className={`time-slots-column ${selectedDate ? "visible" : ""}`}
            >
              <div className="date-header-calendly">
                {selectedDate &&
                  selectedDate.toLocaleDateString(i18n.language || "fr", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
              </div>
              <div className="slots-list">
                {timeSlots.length > 0 ? (
                  timeSlots.map((time) => (
                    <div key={time} className="time-slot-container">
                      <button
                        className={`time-slot-btn ${selectedTime === time ? "selected" : ""}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                      {selectedTime === time && (
                        <button
                          className="confirm-btn-inline"
                          onClick={() =>
                            onConfirm && onConfirm(selectedDate, selectedTime)
                          }
                        >
                          {t("meeting.calendly.confirm")}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-slots-message">
                    {t("meeting.calendly.noSlots")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendlyBooking;
