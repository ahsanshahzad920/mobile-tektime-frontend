import CookieService from "../../../Utils/CookieService";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

  // Day names mapping (static, reused across functions)
  const daysMapping = useMemo(() => [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ], []);

  // Pre-compute which days of the week are active (cheap O(7) check)
  const activeDays = useMemo(() => {
    if (!meetingData?.calendly_availability) return new Set();
    return new Set(
      meetingData.calendly_availability
        .filter((d) => d.active)
        .map((d) => daysMapping.indexOf(d.day))
    );
  }, [meetingData?.calendly_availability, daysMapping]);

  // Cache for slot computations — cleared when dependencies change
  const slotCacheRef = useRef(new Map());

  // Clear cache when the data it depends on changes
  useEffect(() => {
    slotCacheRef.current.clear();
  }, [
    meetingData?.calendly_availability,
    meetingData?.calendly_non_availability,
    meetingData?.duration,
    unavailableSlots,
  ]);

  // Dynamic time slots generation — now with caching
  const generateTimeSlotsForDate = useCallback((date) => {
    if (!date || !meetingData?.calendly_availability) return [];

    // Cache key based on date string
    const cacheKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (slotCacheRef.current.has(cacheKey)) {
      return slotCacheRef.current.get(cacheKey);
    }

    const dayIndex = date.getDay();
    const dayName = daysMapping[dayIndex];

    const availability = meetingData.calendly_availability.find(
      (day) => day.day === dayName,
    );

    if (!availability || !availability.active) {
      slotCacheRef.current.set(cacheKey, []);
      return [];
    }

    const slots = [];
    let currentTime = moment(`${availability.start}`, "HH:mm");
    const endTime = moment(`${availability.end}`, "HH:mm");

    // Assuming 30 min intervals, can be made dynamic if duration is available
    const duration = meetingData?.duration
      ? parseInt(meetingData.duration)
      : 30;

    // Pre-parse non-availability ranges once (instead of per-slot)
    const parsedNonAvailability = (meetingData.calendly_non_availability || []).map((range) => {
      if (!range) return null;
      const parts = range.split(" to ");
      if (parts.length !== 2) return null;

      let startRange = moment(parts[0]);
      let endRange;
      if (parts[1].includes("-")) {
        endRange = moment(parts[1]);
      } else {
        const datePart = startRange.format("YYYY-MM-DD");
        endRange = moment(`${datePart} ${parts[1]}`);
      }
      return { startRange, endRange };
    }).filter(Boolean);

    // Pre-parse API unavailability once (instead of per-slot)
    const parsedApiUnavailability = unavailableSlots.map((slot) => ({
      apiStart: moment(slot.start_time.replace("Z", "")),
      apiEnd: moment(slot.end_time.replace("Z", "")),
    }));

    const now = moment();

    while (currentTime.isBefore(endTime)) {
      const timeString = currentTime.format("HH:mm");
      const hour = currentTime.get("hour");
      const minute = currentTime.get("minute");

      // Build slot time once for all checks
      const slotTime = moment(date).set({ hour, minute, second: 0, millisecond: 0 });

      // Check non-availability (pre-parsed ranges)
      const isUnavailable = parsedNonAvailability.some(({ startRange, endRange }) => {
        if (startRange.isSame(endRange)) {
          if (startRange.format("HH:mm") === "00:00") {
            return slotTime.isSame(startRange, "day");
          }
          return slotTime.isSame(startRange);
        }
        return slotTime.isBetween(startRange, endRange, null, "[)");
      });

      // Check non-availability (API data, pre-parsed)
      const isApiUnavailable = parsedApiUnavailability.some(({ apiStart, apiEnd }) => {
        const slotEnd = slotTime.clone().add(duration, "minutes");
        return slotTime.isBefore(apiEnd) && slotEnd.isAfter(apiStart);
      });

      // Check if slot is in the past
      if (!isUnavailable && !isApiUnavailable && slotTime.isAfter(now)) {
        slots.push(timeString);
      }

      currentTime.add(duration, "minutes");
    }

    // Cache the result
    slotCacheRef.current.set(cacheKey, slots);
    return slots;
  }, [
    meetingData?.calendly_availability,
    meetingData?.calendly_non_availability,
    meetingData?.duration,
    unavailableSlots,
    daysMapping,
  ]);

  // Memoize time slots for the selected date
  const timeSlots = useMemo(
    () => generateTimeSlotsForDate(selectedDate),
    [selectedDate, generateTimeSlotsForDate]
  );

  // Memoized date filter — fast-path rejection for inactive days
  const isDateEnabled = useCallback((date) => {
    if (!meetingData?.calendly_availability) return false;

    // 1. Quick reject: if day of week is not active at all (O(1) check)
    if (!activeDays.has(date.getDay())) {
      return false;
    }

    // 2. Check if there are any actual slots available (uses cache)
    const slots = generateTimeSlotsForDate(date);
    return slots.length > 0;
  }, [meetingData?.calendly_availability, activeDays, generateTimeSlotsForDate]);

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
