import CookieService from '../../../Utils/CookieService';
import axios from "axios";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../Apicongfig";
import {
  Modal,
  Form,
  Row,
  Col,
  Button,
  ListGroup,
  Dropdown,
  ProgressBar,
} from "react-bootstrap";

import { useHeaderTitle } from "../../../../context/HeaderTitleContext";
import { useTranslation } from "react-i18next";
import Moments from "./Moments";
import Participants from "./Participants";
import AddDestination from "../AddDestination";
import moment from "moment";
import { FaArrowRight, FaTh } from "react-icons/fa";
import copy from "copy-to-clipboard";
import { openLinkInNewTab } from "../../../Utils/openLinkInNewTab";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { RiEditBoxLine } from "react-icons/ri";
import { useFormContext } from "../../../../context/CreateMeetingContext";
import { useMeetings } from "../../../../context/MeetingsContext";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import ConfirmationModal from "../../../Utils/ConfirmationModal";
import ViewFilePreview from "../../Meeting/ViewFilePreview";
import BudgetMonitoring from "./BudgetMonitoring";
import StepFileTab from "./StepFileTab";
import Roadmap from "./Roadmap";
import {
  formatDate,
  formatTime,
} from "../../Meeting/GetMeeting/Helpers/functionHelper";
import { formatMissionDate } from "../../../Utils/MeetingFunctions";
import {
  FaChartGantt,
  FaList,
  FaRegCalendarDays,
  FaUsers,
  FaFolderOpen,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa6";
import ReactCalendar from "./ReactCalendar";
import { Tooltip, Select } from "antd";
import QuickMomentForm from "./QuickMomentForm";
import FacturationForm from "./FacturationForm";
import NewMeetingModal from "../../Meeting/CreateNewMeeting/NewMeetingModal";
import KanbanMissionBoard from "./KanbanMissionBoard";

const Tabs = ({ quick }) => {
  const { id } = useParams();
  const tabsRef = useRef(null);
  const {
    open,
    handleShow,
    handleCloseModal,
    setFromDestination,
    setFromDestinationName,
    callDestination,
    setFormState,
  } = useFormContext();
  const [showMomentForm, setShowMomentForm] = useState(false);
const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isSticky, setIsSticky] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [destination, setDestination] = useState();
  const [participants, setParticipants] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);

  const toggle = () => {
    setShow(true);
  };
  const handleClose = () => {
    setShow(false);
  };
  const [roadmapData, setRoadmapData] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [timeWindowOffset, setTimeWindowOffset] = useState(0);
  const [defaultAgendaView, setDefaultAgendaView] = useState("month"); // default view
  console.log("defaultAgendaView", defaultAgendaView);
  // const { startDate, endDate } = useMemo(() => {
  //   const today = new Date();
  //   // Calculate based on week offset (4 weeks per "step")
  //   const weeksOffset = timeWindowOffset * 4;

  //   // Start from current week's Monday
  //   const start = new Date(today);
  //   start.setDate(
  //     today.getDate() - ((today.getDay() + 6) % 7) + weeksOffset * 7
  //   );

  //   // Add exactly 4 weeks
  //   const end = new Date(start);
  //   end.setDate(start.getDate() + 27); // 28 days - 1

  //   return { startDate: start, endDate: end };
  // }, [timeWindowOffset]);

  const [destinationSteps, setDestinationSteps] = useState([]);
  console.log("destinationSteps", destinationSteps);
  const getDestinationStep = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/destination/${id}/steps`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response?.status === 200) {
        setDestinationSteps(response?.data?.data);
      }
    } catch (error) {
      console.log("error while fetching step", error);
    }
  };

  useEffect(() => {
    getDestinationStep();
  }, [id]);

  const parseDate = (dateString) => {
    if (!dateString) return new Date();

    // Handle ISO format (with 'T')
    if (dateString.includes("T")) {
      return new Date(dateString);
    }

    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return new Date(year, month - 1, day);
    }

    // Fallback to default Date parsing
    return new Date(dateString);
  };

  const { startDate, endDate } = useMemo(() => {
    let earliestMeetingDate = null;

    // Find the earliest meeting date from roadmapData
    if (Array.isArray(roadmapData)) {
      roadmapData?.forEach((user) => {
        (user.meetings || []).forEach((meeting) => {
          const meetingDate = parseDate(meeting.date);
          if (!earliestMeetingDate || meetingDate < earliestMeetingDate) {
            earliestMeetingDate = meetingDate;
          }
        });
      });
    }

    // If no meetings, fallback to current week
    if (!earliestMeetingDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(
        today.getDate() - today.getDay() + timeWindowOffset * 7
      );
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 27); // 4 weeks
      return { startDate: weekStart, endDate: weekEnd };
    }

    // Calculate startDate based on the earliest meeting date and offset
    const weekStart = new Date(earliestMeetingDate);
    weekStart.setDate(
      earliestMeetingDate.getDate() -
        earliestMeetingDate.getDay() +
        timeWindowOffset * 7
    );
    weekStart.setHours(0, 0, 0, 0);

    // Calculate endDate as 4 weeks from startDate
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 27); // 4 weeks

    return { startDate: weekStart, endDate: weekEnd };
  }, [roadmapData, timeWindowOffset]);

  const handleReset = useCallback(() => {
    if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
      setTimeWindowOffset(0); // No meetings, reset to current week
      return;
    }

    let earliestMeetingDate = null;
    roadmapData?.forEach((user) => {
      (user.meetings || []).forEach((meeting) => {
        const meetingDate = parseDate(meeting.date);
        if (!earliestMeetingDate || meetingDate < earliestMeetingDate) {
          earliestMeetingDate = meetingDate;
        }
      });
    });

    if (!earliestMeetingDate) {
      setTimeWindowOffset(0); // No meetings, reset to current week
      return;
    }

    // Calculate the week difference between today and the earliest meeting
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliestWeekStart = new Date(earliestMeetingDate);
    earliestWeekStart.setDate(
      earliestMeetingDate.getDate() - earliestMeetingDate.getDay()
    );
    earliestWeekStart.setHours(0, 0, 0, 0);
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - today.getDay());
    todayWeekStart.setHours(0, 0, 0, 0);

    const diffTime = todayWeekStart - earliestWeekStart;
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    setTimeWindowOffset(diffWeeks);
  }, [roadmapData]);

  const [progress, setProgress] = useState(0); // State for progress
  const [showProgress, setShowProgress] = useState(false); // State to control progress bar visibility

  const [isPrivacyModal, setIsPrivacyModal] = useState(false);
  const [visibilityMessage, setVisibilityMessage] = useState("");
  const getDestination = async () => {
    setShowProgress(true);
    setProgress(0);

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    // Start a progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-details/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;

        setDestination(data);
      }
    } catch (error) {
      console.log("error", error);

      if (error.response && error.response.status === 403) {
        setVisibilityMessage(
          error?.response?.data?.message ||
            "You don't have permission to access this resource."
        );
        setIsPrivacyModal(true);
      }
    } finally {
      setProgress(100);
      setShowProgress(false);
      clearInterval(interval);
      // setProgress(100);
      // setShowProgress(false)
    }
  };
  const [momentProgress, setMomentProgress] = useState(0); // State for progress
  const [showMomentProgress, setShowMomentProgress] = useState(false); // State to control progress bar visibility
  const getMeetingsByDestinationId = async () => {
    setShowMomentProgress(true);
    setMomentProgress(0);

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    // Start a progress simulation
    const interval = setInterval(() => {
      setMomentProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-with-meeting/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;

        setMeetings(data?.meetings);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
      setMomentProgress(100);
      setShowMomentProgress(false);
      clearInterval(interval);
      // setProgress(100);
      // setShowProgress(false)
    }
  };

  const [participantProgress, setParticipantProgress] = useState(0); // State for progress
  const [showParticipantProgress, setShowParticipantProgress] = useState(false); // State to control progress bar visibility
  const getParticipants = async () => {
    setShowParticipantProgress(true);
    setParticipantProgress(0);

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    // Start a progress simulation
    const interval = setInterval(() => {
      setParticipantProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-with-participants/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;

        const allParticipants = data?.participant;
        setParticipants(allParticipants);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
      setParticipantProgress(100);
      setShowParticipantProgress(false);
      clearInterval(interval);
      // setProgress(100);
      // setShowProgress(false)
    }
  };
  const getMilestones = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-meeting-step-decisions/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setMilestones(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [roadmapDataProgress, setRoadmapDataProgress] = useState(0);
  const getParticipantsByDestinationId = async () => {
    setLoading(true);
    setRoadmapDataProgress(0);
    // Start a progress simulation
    const interval = setInterval(() => {
      setRoadmapDataProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval); // Stop updating at 90%
          return 90; // Set to 90 before it completes
        }
        return prev + 10; // Increment progress by 10%
      });
    }, 200); // Update every 200ms

    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/destination-participants/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setRoadmapData(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
      setLoading(false);
      setRoadmapDataProgress(100);
      clearInterval(interval);
    }
  };

  const [budget, setBudget] = useState(null);
  const [initial, setInitial] = useState(0);
  const [total, setTotal] = useState(0);
  const [used, setUsed] = useState(0);
  const [missionStart, setMissionStart] = useState(null);
  const [missionEndDate, setMissionEndDate] = useState(null);

  const getBudgetCalculation = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/destination-budget-monitoring/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setInitial(data?.destination?.initial_budget);
        setTotal(data?.destination?.total_cost);
        setUsed(data?.destination?.consumed_cost);
        setMissionStart(
          formatMissionDate(data?.destination?.meeting_start_date)
        );
        setMissionEndDate(
          formatMissionDate(data?.destination?.meeting_end_date)
        );
        setBudget(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [crossoverLabel, setCrossoverLabel] = useState("");
  const [usedCrossoverLabel, setUsedCrossoverLabel] = useState("");
  const [labels, setLabels] = useState([]);
  const generateLabels = (startDate, endDate) => {
    const start = moment(startDate, "DD/MM/YYYY");
    const end = moment(endDate, "DD/MM/YYYY");
    const diffDays = end.diff(start, "days");
    const increment =
      diffDays > 180 ? 30 : diffDays > 60 ? 15 : diffDays > 30 ? 7 : 3;

    let newLabels = [];
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      newLabels.push(current.format("DD/MM/YYYY"));
      current.add(increment, "days");
      if (current.isAfter(end)) break;
    }

    if (!newLabels.includes(end.format("DD/MM/YYYY"))) {
      newLabels.push(end.format("DD/MM/YYYY"));
    }
    return newLabels;
  };

  useEffect(() => {
    if (!missionStart || !missionEndDate) return;

    setLabels(generateLabels(missionStart, missionEndDate));
  }, [missionStart, missionEndDate]);

  console.log("destination->", destination);

  // Calculate time difference and set default view based on meeting dates
  useEffect(() => {
    if (destination?.meeting_start_date && destination?.meeting_end_date) {
      const meetingStartDate = new Date(destination.meeting_start_date);
      const meetingEndDate = new Date(destination.meeting_end_date);
      const now = new Date();

      // Calculate time difference from now to meeting start date
      const timeDiffToStart = meetingStartDate.getTime() - now.getTime();
      // const daysToStart = timeDiffToStart / (1000 * 3600 * 24);
      const daysToStart = Math.ceil(timeDiffToStart / (1000 * 3600 * 24));

      const totalDurationDays =
        (meetingEndDate.getTime() - meetingStartDate.getTime()) /
        (1000 * 3600 * 24);
      // Calculate meeting duration
      const meetingDuration =
        meetingEndDate.getTime() - meetingStartDate.getTime();
      const meetingDays = meetingDuration / (1000 * 3600 * 24);

      console.log("totalDurationDays", totalDurationDays);
      // Determine default view based on proximity to meeting and meeting duration
      if (totalDurationDays < 1 || totalDurationDays === 0) {
        // Meeting starts in less than 1 day - show day view
        setDefaultAgendaView("day");
      } else if (totalDurationDays < 7) {
        // Meeting starts in less than 1 week - show week view
        setDefaultAgendaView("week");
      } else if (totalDurationDays < 30) {
        // Meeting starts in less than 1 month - show month view
        setDefaultAgendaView("month");
      } else {
        // Meeting starts in more than 1 month - show year view
        setDefaultAgendaView("agenda");
      }

      console.log(
        `Meeting starts in ${daysToStart.toFixed(
          1
        )} days, duration: ${meetingDays.toFixed(
          1
        )} days, default view: ${defaultAgendaView}`
      );
    }
  }, [destination]);
  const generateProgressiveData = (finalValue) => {
    const numericValue = Number(finalValue) || 0;
    return labels.map((_, i) => {
      const progress = i / (labels.length - 1);
      return { x: i, y: Number((numericValue * progress).toFixed(2)) };
    });
  };

  const interpolateDate = (indexFloat) => {
    const lowerIndex = Math.floor(indexFloat);
    const upperIndex = Math.ceil(indexFloat);
    if (lowerIndex < 0 || upperIndex >= labels.length) return "";
    const lowerDate = moment(labels[lowerIndex], "DD/MM/YYYY");
    const upperDate = moment(labels[upperIndex], "DD/MM/YYYY");
    const fraction = indexFloat - lowerIndex;
    const interpolated = lowerDate
      .clone()
      .add(upperDate.diff(lowerDate) * fraction, "milliseconds");
    return interpolated.format("DD/MM/YYYY");
  };
  const calculateCrossoverPoint = (progressiveData, initialValue) => {
    for (let i = 1; i < progressiveData.length; i++) {
      const prevY = progressiveData[i - 1].y;
      const currY = progressiveData[i].y;
      if (prevY <= initialValue && currY > initialValue) {
        const fraction = (initialValue - prevY) / (currY - prevY);
        const exactX = progressiveData[i - 1].x + fraction;
        const label = interpolateDate(exactX);
        return { x: exactX, y: initialValue, label };
      }
    }
    return null;
  };

  const generateUsedDataUpToToday = (finalValue) => {
    const numericValue = Number(finalValue) || 0;
    const today = moment();
    let result = [];

    let todayX = null;

    for (let i = 0; i < labels.length - 1; i++) {
      const current = moment(labels[i], "DD/MM/YYYY");
      const next = moment(labels[i + 1], "DD/MM/YYYY");

      if (today.isBetween(current, next, null, "[]")) {
        const totalDays = next.diff(current, "days");
        const daysSinceCurrent = today.diff(current, "days");
        const progressWithin = totalDays ? daysSinceCurrent / totalDays : 0;
        todayX = i + progressWithin;
        break;
      }
    }

    // If today is after last label or exactly equal
    if (todayX === null && labels.length > 0) {
      const lastIndex = labels.length - 1;
      const lastDate = moment(labels[lastIndex], "DD/MM/YYYY");
      if (today.isSameOrAfter(lastDate)) {
        todayX = lastIndex;
      }
    }

    if (todayX !== null) {
      // Build one point per label up to today index (rounded down)
      const roundedEnd = Math.floor(todayX);
      for (let i = 0; i <= roundedEnd; i++) {
        const progress = i / todayX;
        result.push({
          x: i,
          y: Number((numericValue * progress).toFixed(2)),
        });
      }

      // Add the exact interpolated today point
      if (todayX > roundedEnd) {
        result.push({
          x: Number(todayX.toFixed(2)),
          y: numericValue,
        });
      }
    }

    return result;
  };

  useEffect(() => {
    if (!labels.length || !initial || !total) return;

    const totalData = generateProgressiveData(total);
    const point = calculateCrossoverPoint(totalData, initial);

    if (point?.label) {
      setCrossoverLabel(point.label);
    } else {
      setCrossoverLabel(""); // Optional: Clear if not found
    }
  }, [budget, initial, total, missionEndDate, missionStart, labels]);
  useEffect(() => {
    if (!labels.length || !initial || !used) return;

    const totalData = generateUsedDataUpToToday(used);
    const usedPoint = calculateCrossoverPoint(totalData, initial);

    if (usedPoint?.label) {
      setUsedCrossoverLabel(usedPoint.label);
    } else {
      setUsedCrossoverLabel(""); // Optional: Clear if not found
    }
  }, [budget, initial, used, missionEndDate, missionStart, labels]);

  const refreshedParticipants = async () => {
    const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const options = { timeZone: userTimeZone };
    const timeInUserZone = new Date(
      currentTime.toLocaleString("en-US", options)
    );

    const formattedTime = formatTime(timeInUserZone);
    const formattedDate = formatDate(timeInUserZone);
    // setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-with-participants/${id}?current_time=${formattedTime}&current_date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;

        const allParticipants = data?.participant;
        setParticipants(allParticipants);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    getDestination();
    // refreshedParticipants()
  }, [id, callDestination]);

  useEffect(() => {
    // getMeetingsCalculations();
    // First tab
    getParticipantsByDestinationId();
    getMilestones();

    getBudgetCalculation();

    getMeetingsByDestinationId();
    getParticipants();
  }, [id]);

  const [activeTab, setActiveTab] = useState("Schedule monitoring");

  useEffect(() => {
    const savedTab =
      CookieService.get("missionTab") || "Schedule monitoring";
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location && location?.state && location?.state?.from === "client") {
      setActiveTab("Facturation Tab");
    }
  }, []);

  const meetingsCount = meetings?.length;
  const participantsCount = participants?.length;
  const filesCount = files?.length;

  // Determine if there is only one meeting and it is in draft
  const isSingleDraftMeeting =
    meetings?.length === 1 && meetings[0].status === "draft";

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  //Delete Destination
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/destinations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );

      // Check for successful deletion (assuming HTTP status 200)
      if (response.status === 200) {
        toast.success(t("destination.destinationDeleteMsg"));
        // getDestinations();
        navigate("/Invities");
      } else {
        // Handle other status codes (e.g., 4xx, 5xx) appropriately
        throw new Error("Échec de la suppression de la réunion");
      }
    } catch (error) {
      // Improve error handling, provide informative messages
      // toast.error(t(error.message));
      toast.error(error?.response?.data?.message || "Error deleting mission");
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setItemIdToDelete(id); // Store the ID of the item to be deleted
    setShowConfirmationModal(true); // Show confirmation modal
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    setShowConfirmationModal(false);
    if (itemIdToDelete) {
      handleDelete(itemIdToDelete);
    }
  };

  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const openModal = (file) => {
    setModalContent(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const [isFileLoading, setIsFileLoading] = useState(false);
  const getFiles = async () => {
    setIsFileLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-destination-files/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        }
      );
      if (response.status) {
        const data = response?.data?.data;
        setFiles(data);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsFileLoading(false);
    }
  };
  useEffect(() => {
    getFiles();
  }, [id]);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatDateAndTimeInUserTimezone = (dateString) => {
    const dateObj = new Date(dateString);

    // Format date in dd/mm/yyyy for user's timezone
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      timeZone: userTimeZone,
    });

    // Format time as HHhMM in user's timezone
    const formattedTimeParts = dateObj
      .toLocaleTimeString("en-GB", {
        timeZone: userTimeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .split(":");

    const formattedTime = `${formattedTimeParts[0]}h${formattedTimeParts[1]}`;

    return { formattedDate, formattedTime };
  };
  const { formattedDate, formattedTime } = formatDateAndTimeInUserTimezone(
    destination?.destination_end_date_time
  );

  const userId = parseInt(CookieService.get("user_id"));

  const rawDeadline = new Date(
    Date.parse(destination?.destination_end_date_time)
  );

  // If your meeting_end_date is in dd/mm/yyyy format (with slashes), it may parse incorrectly in some browsers.
  // Convert it safely like this:
  // Parse meeting_end_date (dd/mm/yyyy)
  const [day, month, year] = destination?.meeting_end_date?.split("/") || [];
  const rawMissionEnd = new Date(`${year}-${month}-${day}`);
  // Normalize both to remove time
  const deadline = new Date(
    rawDeadline.getFullYear(),
    rawDeadline.getMonth(),
    rawDeadline.getDate()
  );
  const missionEnd = new Date(
    rawMissionEnd.getFullYear(),
    rawMissionEnd.getMonth(),
    rawMissionEnd.getDate()
  );

  const isDeadlinePassed = missionEnd > deadline;
  // console.log("isDeadlinePassed", isDeadlinePassed);

  // Calculate days difference if passed
  let diffDays = 0;
  if (isDeadlinePassed) {
    const diffTime = missionEnd.getTime() - deadline.getTime();
    diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  const [showMoments, setShowMoments] = useState(false);

  const [view, setView] = useState("list");

  const handleToggle = (newView) => {
    setView(newView);
  };

  useEffect(() => {
    CookieService.set("missionId", id);
  }, []);

  // State
  const [workingDays, setWorkingDays] = useState([
    { day: "Monday", start_time: "09:00", end_time: "17:00" },
    { day: "Tuesday", start_time: "09:00", end_time: "17:00" },
    { day: "Wednesday", start_time: "09:00", end_time: "17:00" },
    { day: "Thursday", start_time: "09:00", end_time: "17:00" },
    { day: "Friday", start_time: "09:00", end_time: "17:00" },
  ]);
  useEffect(() => {
    if (destination) {
      if (
        destination?.user_schedule?.working_days &&
        destination?.user_schedule?.working_days.length > 0
      ) {
        setWorkingDays(
          destination?.user_schedule?.working_days.map((day) => ({
            day: day.day,
            start_time: formatTo24Hour(day.start_time),
            end_time: formatTo24Hour(day.end_time),
          }))
        );
      } else {
        // Apply default working days
        setWorkingDays([
          { day: "Monday", start_time: "09:00:00", end_time: "17:00:00" },
          { day: "Tuesday", start_time: "09:00:00", end_time: "17:00:00" },
          { day: "Wednesday", start_time: "09:00:00", end_time: "17:00:00" },
          { day: "Thursday", start_time: "09:00:00", end_time: "17:00:00" },
          { day: "Friday", start_time: "09:00:00", end_time: "17:00:00" },
        ]);
      }

      // Format non-working days to HH:mm:ss
      setNonWorkingDays(
        destination?.user_schedule?.non_working_days?.map((date) => ({
          date: date.date,
          start_time: formatTo24Hour(date.start_time),
          end_time: formatTo24Hour(date.end_time),
        })) || []
      );
    }
  }, [destination]);
  const [nonWorkingDays, setNonWorkingDays] = useState([]);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState({
    date: "",
    start_time: "00:00",
    end_time: "00:00",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handlers
  const handleWorkingDayChange = (day, isChecked) => {
    if (isChecked) {
      if (!workingDays.some((wd) => wd.day === day)) {
        setWorkingDays([
          ...workingDays,
          { day, start_time: "09:00:00", end_time: "17:00:00" },
        ]);
      }
    } else {
      setWorkingDays(workingDays.filter((wd) => wd.day !== day));
    }
  };

  const updateWorkingDayTime = (day, field, value) => {
    const updated = workingDays.map((wd) =>
      wd.day === day ? { ...wd, [field]: value } : wd
    );
    setWorkingDays(updated);
  };
  const addNonWorkingDay = () => {
    if (
      newNonWorkingDay.date &&
      newNonWorkingDay.start_time &&
      newNonWorkingDay.end_time
    ) {
      const formattedNonWorkingDay = {
        date: newNonWorkingDay.date,
        start_time: formatTo24Hour(newNonWorkingDay.start_time),
        end_time: formatTo24Hour(newNonWorkingDay.end_time),
      };
      setNonWorkingDays([...nonWorkingDays, formattedNonWorkingDay]);
      setNewNonWorkingDay({
        date: "",
        start_time: "00:00:00",
        end_time: "00:00:00",
      });
      setShowDatePicker(false);
    }
  };

  const removeNonWorkingDay = (index) => {
    const updated = [...nonWorkingDays];
    updated.splice(index, 1);
    setNonWorkingDays(updated);
  };
  const formatTo24Hour = (time) => {
    if (!time) return "00:00";

    // Remove seconds if present
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${(minutes || "00").padStart(2, "0")}`;
  };
  const handleSubmit = async () => {
    const userId = parseInt(CookieService.get("user_id"));

    // Ensure format is HH:mm:ss
    const formattedWorkingDays = workingDays.map((day) => ({
      day: day.day,
      start_time: formatTo24Hour(day.start_time),
      end_time: formatTo24Hour(day.end_time),
    }));

    const formattedNonWorkingDays = nonWorkingDays.map((date) => ({
      date: date.date,
      start_time: formatTo24Hour(date.start_time),
      end_time: formatTo24Hour(date.end_time),
    }));

    const payload = {
      destination_id: parseInt(id),
      user_id: userId,
      working_days: formattedWorkingDays,
      non_working_days: formattedNonWorkingDays,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/add-working-days-in-destination`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save working days");
      }

      toast.success(
        t("destination.destinationToMeeting.Working days saved successfully!")
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.message || "Failed to save working days");
    }
  };

  // Time formatting helper
  const formatWorkingTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: i18n.language === "en",
    });
  };

  const refresh = async () => {
    getMeetingsByDestinationId();
    // getDestinationById()
    getDestination();
    getMilestones();
    getParticipantsByDestinationId();
    getBudgetCalculation();
    getFiles();
  };
  return (
    <>
      {showProgress ? (
        <>
          <div
            className="progress-overlay"
            style={{ background: "transparent" }}
          >
            <div style={{ width: "50%" }}>
              <ProgressBar now={progress} animated />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`destination-detail-page container-fluid ${quick ? 'p-0' : ''}`}>
          {!quick && (
            <div className="title d-flex align-items-center justify-content-between">
              <div className="breadcrumb-section">
                {/* Show "Agenda /" only if meeting_need exists in user_needs array */}
                {(() => {
                  try {
                    const userJson = CookieService.get("user");
                    if (!userJson) return false;

                    const user = JSON.parse(userJson);
                    const userNeeds = user?.user_needs || user?.needs || [];

                    return (
                      Array.isArray(userNeeds) &&
                      userNeeds.some((n) => n.need === "mission_need")
                    );
                  } catch (e) {
                    console.warn("Failed to parse user or user_needs", e);
                    return false;
                  }
                })() && (
                  <div className="d-flex align-items-center flex-wrap">
                    <Link to={`/invities`} className="breadcrumb-link">
                      Roadmap
                    </Link>
                    <span className="breadcrumb-separator mx-2">/</span>
                  </div>
                )}

                {/* Client always shown */}
                <Link
                  to={{
                    pathname: `/client/${destination?.clients?.id}`,
                  }}
                  className="breadcrumb-link"
                >
                  {destination?.clients?.name || destination?.client}
                </Link>
              </div>
            </div>
          )}
          <div className="row mt-2">
            {/* Main Content */}
            <div className="col-12 col-lg-8 order-1 order-lg-1">
              <div className="destination-data p-0">
                {/* Destination Banner - Comme cover photo LinkedIn */}
                {!quick && destination?.banner && (
                  <div className="row banner-row mb-4">
                    <div className="col-12">
                      <div className="destination-banner-container">
                        <img
                          src={destination.banner}
                          alt="Mission banner"
                          className="destination-banner img-fluid"
                          style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="row first-row">
                  <div className="col-12">
                    <div className="d-flex align-items-center flex-wrap">
                      <span className="destination-name me-2 mb-1">
                        {destination?.destination_name}
                      </span>
                      <span
                        className={`badge ms-0 ms-sm-2 ${
                          destination?.status === "in_progress"
                            ? destination?.delay || destination?.budget_exceeded
                              ? "inProgress-delay"
                              : "inProgress"
                            : destination?.status === "closed"
                            ? "closed"
                            : "upcoming"
                        }`}
                      >
                        {destination?.status === "in_progress"
                          ? t("mission-badges.inProgress")
                          : destination?.status === "closed"
                          ? t("mission-badges.completed")
                          : destination?.status === "TODO"
                          ? t("mission-badges.new")
                          : t("mission-badges.upcoming")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row second-row mt-4 mt-md-5">
                  <div className="col-12">
                    {/* Destination Type */}
                    {destination?.destination_type && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mb-3">
                        <span
                          className="label-text"
                          style={{ minWidth: "200px", color: "#8590a3" }}
                        >
                          {t("destination_type")}:
                        </span>
                        <span className="fw-bold value-text">
                          {t(
                            `destinationTypes.${destination?.destination_type}`
                          )}
                        </span>
                      </div>
                    )}

                    {/* Budget */}
                    {destination?.initial_budget &&
                      destination.initial_budget !== 0 &&
                      destination.initial_budget !== "0" &&
                      destination.initial_budget !== "null" && (
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mb-3">
                          <span
                            className="label-text"
                            style={{ minWidth: "200px", color: "#8590a3" }}
                          >
                            {t("destination_budget")}:
                          </span>
                          <span className="fw-bold value-text">
                            {destination.initial_budget}{" "}
                            {destination?.currency || "USD"}
                          </span>
                        </div>
                      )}

                    {/* Date & Time */}
                    {destination?.destination_end_date_time && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mb-3">
                        <span
                          className="label-text"
                          style={{ minWidth: "200px", color: "#8590a3" }}
                        >
                          {t("destination_mission_end_date_label")}:
                        </span>
                        <span className="fw-bold value-text">
                          {formattedDate} {t("at")} {formattedTime}
                        </span>
                      </div>
                    )}

                    {/* Meeting Date Range */}
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2 mb-3">
                      <span
                        className="label-text"
                        style={{ minWidth: "200px", color: "#8590a3" }}
                      >
                        {t("destination.destinationToMeeting.Destination date")}
                        :
                      </span>
                      {!isSingleDraftMeeting &&
                        (destination?.meeting_start_date ||
                          destination?.meeting_end_date) && (
                          <span className="fw-bold value-text">
                            {formatMissionDate(destination?.meeting_start_date)}{" "}
                            - {formatMissionDate(destination?.meeting_end_date)}
                          </span>
                        )}
                    </div>

                    {/* Privacy Missions */}
                    <div className="d-flex flex-column gap-2 mb-4">
                      <span
                        className="label-text"
                        style={{ minWidth: "200px", color: "#8590a3" }}
                      >
                        {t("mission_privacy")} :
                      </span>
                      <span className="fw-bold value-text text-capitalize">
                        {destination?.mission_privacy === "enterprise"
                          ? t("mission_privacies.enterprise")
                          : destination?.mission_privacy === "team"
                          ? t("mission_privacies.team")
                          : destination?.mission_privacy === "private"
                          ? t("mission_privacies.private")
                          : destination?.mission_privacy || "-"}
                      </span>
                    </div>

                    {/* Linked Missions */}
                    {destination?.all_linked &&
                      destination.all_linked.length > 0 && (
                        <div className="d-flex flex-column gap-2 mb-4">
                          <span
                            className="label-text"
                            style={{ color: "#8590a3" }}
                          >
                            {t("linked_missions")} (
                            {destination.all_linked.length}) :
                          </span>
                          <div className="d-flex flex-wrap gap-2">
                            {destination.all_linked.map((linked) => (
                              <span
                                key={linked.id}
                                className="badge bg-light text-dark border px-3 py-2"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {linked.destination_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Ligne "Créée le [Date] par [Créateur]" */}
                  {(destination?.created_at || destination?.user?.name) && (
                    <div className="col-12">
                      <div className="d-flex flex-column gap-2 mb-3 mt-3">
                        <div
                          className="creation-info"
                          style={{
                            color: "#6c757d",
                            fontSize: "0.9rem",
                            fontStyle: "italic",
                            borderTop: "1px solid #e9ecef",
                            paddingTop: "12px",
                          }}
                        >
                          {t("created_on")}{" "}
                          {destination?.created_at
                            ? new Date(
                                destination.created_at
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "Date inconnue"}{" "}
                          {t("by")}{" "}
                          {destination?.user?.full_name ||
                            "Utilisateur inconnu"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description avec hauteur fixe et défilement */}
                  {destination?.destination_description &&
                    destination?.destination_description !== "null" && (
                      <div className="col-12">
                        <div className="d-flex flex-column gap-2 mb-2 mt-3">
                          <span
                            className="label-text"
                            style={{ color: "#8590a3" }}
                          >
                            {t("destination_desc")}:
                          </span>
                          <div className="row third-row p-0">
                            <div className="col-12">
                              <div
                                className="mb-0 pt-0 description-text"
                                style={{
                                  maxHeight: "120px",
                                  overflowY: "auto",
                                  paddingRight: "8px",
                                }}
                              >
                                {destination?.destination_description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Status Messages */}
                {destination?.status === "in_progress" && isDeadlinePassed && (
                  <p className="text-danger fw-bold status-message">
                    {t("budget.Exceeded Deadline Error")} ({diffDays}{" "}
                    {t("time_unit.da")}
                    {diffDays > 1 ? "s" : ""} {t("budget.passed")})
                  </p>
                )}

                {budget?.destination?.total_cost >
                  destination?.initial_budget &&
                  destination?.initial_budget !== 0 &&
                  destination?.initial_budget !== "0" && (
                    <p
                      className="text-danger fw-bold status-message"
                      dangerouslySetInnerHTML={{
                        __html: t("budget.Exceeded Full Message", {
                          date: crossoverLabel,
                          amount:
                            budget?.destination?.budgetMessage?.exceeded_amount,
                          currency: budget?.destination?.currency,
                        }),
                      }}
                    />
                  )}

                {budget?.destination?.consumed_cost >
                  destination?.initial_budget &&
                  destination?.initial_budget !== 0 &&
                  destination?.initial_budget !== "0" && (
                    <p
                      className="text-danger fw-bold status-message"
                      dangerouslySetInnerHTML={{
                        __html: t("budget.Consume Exceeded Full Message", {
                          date: usedCrossoverLabel,
                          amount: Math.abs(
                            parseFloat(
                              (
                                budget?.destination?.consumed_exceeded_amount ||
                                "0"
                              ).replace(/,/g, "")
                            )
                          ),
                          currency: budget?.destination?.currency,
                        }),
                      }}
                    />
                  )}
              </div>
            </div>

            {/* Image and Actions - Position fixe */}
            <div className="col-12 col-lg-4 order-2 order-lg-2">
              <div className="sticky-top" style={{ top: "20px", zIndex: 1 }}>
                <div className="d-flex flex-column align-items-center align-items-lg-end gap-3 h-100">
                  {/* Top Section: Client Logo and Dropdown */}
                  <div className="d-flex flex-column flex-lg-row align-items-center align-items-lg-center justify-content-lg-end gap-3 w-100">
                    {/* Client Logo / Open Map Button */}
                    <div className="d-flex justify-content-center justify-content-lg-end">
                      {destination?.clients?.client_logo ? (
                        <div
                          style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "4px solid #fff",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            let currentURL;
                            if (destination?.meetings?.length === 1) {
                              currentURL = `/destination/${meetings[0]?.unique_id}/${meetings[0]?.id}`;
                              copy(currentURL);
                              openLinkInNewTab(currentURL);
                            } else {
                              currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                              copy(currentURL);
                              openLinkInNewTab(currentURL);
                            }
                          }}
                        >
                          <img
                            src={destination?.clients?.client_logo}
                            alt="Client logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="destination-data text-center text-lg-end">
                          <div className="first-row">
                            <Button
                              className="btn play-btn"
                              style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.9rem",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                let currentURL;
                                if (destination?.meetings?.length === 1) {
                                  currentURL = `/destination/${meetings[0]?.unique_id}/${meetings[0]?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                } else {
                                  currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                                  copy(currentURL);
                                  openLinkInNewTab(currentURL);
                                }
                              }}
                            >
                              {t("presentation.Open the map")}
                              <FaArrowRight size={12} className="ms-2" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Dropdown */}
                    {destination?.user?.email ===
                      CookieService.get("email") && (
                      <div className="d-flex justify-content-center justify-content-lg-end">
                        <div className="destination-data">
                          <div className="d-flex align-items-center">
                            <Dropdown className="dropdown">
                              <Dropdown.Toggle
                                variant="success"
                                id="dropdown-basic"
                                className="action-dropdown-toggle"
                              >
                                <BiDotsVerticalRounded
                                  color="black"
                                  size={"25px"}
                                />
                              </Dropdown.Toggle>

                              <Dropdown.Menu className="dropdown-menu-end">
                                <Dropdown.Item
                                  onClick={() => toggle(destination)}
                                  className="d-flex align-items-center"
                                >
                                  <RiEditBoxLine
                                    size={"20px"}
                                    className="me-2"
                                  />
                                  {t("dropdown.To modify")}
                                </Dropdown.Item>

                                <Dropdown.Item
                                  onClick={(e) => handleDeleteClick(e, id)}
                                  className="d-flex align-items-center text-danger"
                                >
                                  <AiOutlineDelete
                                    size={"20px"}
                                    className="me-2"
                                  />
                                  {t("dropdown.Delete")}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Tracking Platform Button */}
                  <div className="w-100 d-flex justify-content-center justify-content-lg-end">
                    <Button
                      className="btn tracking-platform-btn"
                      variant="outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        let currentURL;
                        if (destination?.meetings?.length === 1) {
                          currentURL = `/destination/${meetings[0]?.unique_id}/${meetings[0]?.id}`;
                          copy(currentURL);
                          openLinkInNewTab(currentURL);
                        } else {
                          currentURL = `/destination/${destination?.uuid}--es/${destination?.id}`;
                          copy(currentURL);
                          openLinkInNewTab(currentURL);
                        }
                      }}
                      style={{
                        padding: "0.4rem 1rem",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        border: "1px solid #007bff",
                        borderRadius: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("destination_tracking_btn")}
                      {destination?.destination_type ||
                        t(
                          `destinationTypes.${destination?.destination_type}`
                        ) ||
                        "MISSION TYPE"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="destination-tabs-container">
            <div
              ref={tabsRef}
              className={`tabs-header ${isSticky ? "sticky" : ""}`}
            >
              {/* <h4 className="meeting-title">{t("destination.title")}</h4> */}
              <div className="row">
                <div
                  className="col-md-12 col-12 destination-tab-row"
                  style={{
                    borderBottom: "2px solid #F2F2F2",
                    padding: "0px 14px",
                  }}
                >
                  <div className="row align-items-center">
                    <div
                      className={` ${
                        activeTab === "My working days"
                          ? "col-md-12"
                          : "col-md-8"
                      } mt-3`}
                    >
                      <div className="tabs justify-content-start flex-nowrap overflow-auto">
                        {isMobile ? (
                          <Select
                            value={activeTab}
                            onChange={(value) => {
                              setActiveTab(value);
                              CookieService.set("missionTab", value);
                            }}
                            className="w-100 mb-2"
                            style={{ height: '45px' }}
                            options={[
                              { 
                                value: "Schedule monitoring", 
                                label: <><FaRegCalendarDays className="me-2" /> {t("destination.destinationToMeeting.Schedule monitoring")}</> 
                              },
                              { 
                                value: "Suivi des actions", 
                                label: <><FaList className="me-2" /> {t("Suivi des actions")}</> 
                              },
                              ...(participants?.length > 0 ? [
                                { 
                                  value: "Budget", 
                                  label: <><FaMoneyBillWave className="me-2" /> {t("destination.destinationToMeeting.budgetMonitor")}</> 
                                },
                                { 
                                  value: "Participants", 
                                  label: <><FaUsers className="me-2" /> {t("destination.destinationToMeeting.participants")}</> 
                                },
                                { 
                                  value: "Files", 
                                  label: <><FaFolderOpen className="me-2" /> {t("destination.destinationToMeeting.files")}</> 
                                }
                              ] : []),
                              { 
                                value: "Facturation Tab", 
                                label: <><FaFileInvoiceDollar className="me-2" /> {t("destination.destinationToMeeting.Facturation Tab")}</> 
                              },
                              { 
                                value: "My working days", 
                                label: <><FaClock className="me-2" /> {t("destination.destinationToMeeting.My working days")}</> 
                              }
                            ]}
                          />
                        ) : (
                          <>
                            <button
                              className={`tab ${activeTab === "Schedule monitoring" ? "active" : ""}`}
                              onClick={() => {
                                setActiveTab("Schedule monitoring");
                                CookieService.set("missionTab", "Schedule monitoring");
                              }}
                              style={{ borderRadius: "0px" }}
                            >
                              <FaRegCalendarDays className="me-2" />
                              <span className="d-none d-sm-inline">
                                {t("destination.destinationToMeeting.Schedule monitoring")}
                              </span>
                              <span className={activeTab === "Schedule monitoring" ? "future" : "draft"}>
                                {meetingsCount}
                              </span>
                            </button>

                            <button
                              className={`tab ${activeTab === "Suivi des actions" ? "active" : ""}`}
                              onClick={() => {
                                setActiveTab("Suivi des actions");
                                CookieService.set("missionTab", "Suivi des actions");
                              }}
                              style={{ borderRadius: "0px" }}
                            >
                              <FaList className="me-2" />
                              <span className="d-none d-sm-inline">{t("Suivi des actions")}</span>
                            </button>

                            {participants?.length > 0 && (
                              <>
                                <button
                                  className={`tab ${activeTab === "Budget" ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTab("Budget");
                                    CookieService.set("missionTab", "Budget");
                                  }}
                                  style={{ borderRadius: "0px" }}
                                >
                                  <FaMoneyBillWave className="me-2" />
                                  <span className="d-none d-sm-inline">
                                    {t("destination.destinationToMeeting.budgetMonitor")}
                                  </span>
                                </button>

                                <button
                                  className={`tab ${activeTab === "Participants" ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTab("Participants");
                                    CookieService.set("missionTab", "Participants");
                                  }}
                                  style={{ borderRadius: "0px" }}
                                >
                                  <FaUsers className="me-2" />
                                  <span className="d-none d-sm-inline">
                                    {t("destination.destinationToMeeting.participants")}
                                  </span>
                                  <span className={activeTab === "Participants" ? "future" : "draft"}>
                                    {participantsCount}
                                  </span>
                                </button>

                                <Tooltip
                                title={`${t(
                                  "destination.destinationToMeeting.My working days"
                                )}: ${t(
                                  `destinationTypes.${destination?.destination_type}`
                                )} ${destination?.destination_name}`}
                                placement="bottom"
                              >
                                <button
                                  className={`tab ${
                                    activeTab === "My working days"
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setActiveTab("My working days");
                                    sessionStorage.setItem(
                                      "missionTab",
                                      "My working days"
                                    );
                                  }}
                                  style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "200px", // Adjust based on your layout
                                    textAlign: "left",
                                    display: "inline-block",
                                    borderRadius: "0px",
                                  }}
                                >
                                  {t(
                                    "destination.destinationToMeeting.My working days"
                                  )}
                                  :{" "}
                                  {t(
                                    `destinationTypes.${destination?.destination_type}`
                                  )}{" "}
                                  {destination?.destination_name}
                                </button>
                              </Tooltip>

                                <button
                                  className={`tab ${activeTab === "Files" ? "active" : ""}`}
                                  onClick={() => {
                                    setActiveTab("Files");
                                    CookieService.set("missionTab", "Files");
                                  }}
                                  style={{ borderRadius: "0px" }}
                                >
                                  <FaFolderOpen className="me-2" />
                                  <span className="d-none d-sm-inline">
                                    {t("destination.destinationToMeeting.files")}
                                  </span>
                                  <span className={activeTab === "Files" ? "future" : "draft"}>
                                    {filesCount}
                                  </span>
                                </button>
                              </>
                            )}

                            <button
                              className={`tab ${activeTab === "Facturation Tab" ? "active" : ""}`}
                              onClick={() => {
                                setActiveTab("Facturation Tab");
                                CookieService.set("missionTab", "Facturation Tab");
                              }}
                              style={{ borderRadius: "0px" }}
                            >
                              <FaFileInvoiceDollar className="me-2" />
                              <span className="d-none d-sm-inline">
                                {t("destination.destinationToMeeting.Facturation Tab")}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                        </div>

                    <div
                      className={`${
                        activeTab === "My working days" ? "" : "col-md-4"
                      } mt-3`}
                    >
                      {(activeTab === "Moments" ||
                        activeTab === "Schedule monitoring") && (
                        <div className="invite-buttons mt-3 gap-2 ms-1 w-100 d-flex justify-content-end">
                       
                          <button
                            className="btn btn-primary d-flex align-items-center"
                            onClick={() => {
                              setShowMomentForm(true);
                            }}
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              outline: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                            }}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                fill="white"
                              />
                            </svg>
                            <span className="ms-2">
                              {t("addQuickMomentbtninmission_mission")}
                            </span>
                          </button>
                        </div>
                      )}
                      {activeTab === "Files" && (
                        <div className="invite-buttons mt-3 ms-1 w-100 d-flex justify-content-end">
                          <button
                            onClick={() => setShowMoments(true)}
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "24px",
                              textAlign: "left",
                              color: "#FFFFFF",
                              background: "#2C48AE",
                              border: 0,
                              outline: 0,
                              padding: "10px 16px",
                              borderRadius: "9px",
                              marginTop: "20px",
                            }}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 0.457031C15.5228 0.457031 20 4.93418 20 10.457C20 15.9798 15.5228 20.457 10 20.457C4.47715 20.457 0 15.9798 0 10.457C0 4.93418 4.47715 0.457031 10 0.457031ZM10 1.95703C5.30558 1.95703 1.5 5.76261 1.5 10.457C1.5 15.1514 5.30558 18.957 10 18.957C14.6944 18.957 18.5 15.1514 18.5 10.457C18.5 5.76261 14.6944 1.95703 10 1.95703ZM10 5.45703C10.4142 5.45703 10.75 5.79282 10.75 6.20703V9.70703H14.25C14.6642 9.70703 15 10.0428 15 10.457C15 10.8712 14.6642 11.207 14.25 11.207H10.75V14.707C10.75 15.1212 10.4142 15.457 10 15.457C9.5858 15.457 9.25 15.1212 9.25 14.707V11.207H5.75C5.33579 11.207 5 10.8712 5 10.457C5 10.0428 5.33579 9.70703 5.75 9.70703H9.25V6.20703C9.25 5.79282 9.5858 5.45703 10 5.45703Z"
                                fill="white"
                              />
                            </svg>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            {t("addFile")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content">
              {activeTab === "Moments" && (
                <div>
                  <Moments
                    meetings={meetings}
                    destination={destination}
                    isLoading={isLoading}
                    refreshedMeetings={getMeetingsByDestinationId}
                    isDeadlinePassed={isDeadlinePassed}
                    diffDays={diffDays}
                    showProgress={showMomentProgress}
                    progress={momentProgress}
                  />
                </div>
              )}
              {activeTab === "Participants" && (
                <div>
                  <Participants
                    meetings={meetings}
                    participants={participants}
                    refreshedParticipants={refreshedParticipants}
                    refreshBudget={getBudgetCalculation}
                    isLoading={isLoading}
                    activeTab={activeTab}
                    id={id}
                    progress={participantProgress}
                    showProgress={showParticipantProgress}
                  />
                </div>
              )}
              {activeTab === "Files" && (
                <div className="complete-invite">
                  <StepFileTab
                    meetings={meetings}
                    data={files}
                    openModal={openModal}
                    refreshFiles={getFiles}
                    setShowMoments={setShowMoments}
                    showMoments={showMoments}
                  />
                </div>
              )}
              {activeTab === "Budget" && (
                <div className="complete-invite">
                  <BudgetMonitoring
                    budget={budget}
                    destination={destination}
                    meetings={meetings}
                    participants={participants}
                    loggedInUserId={userId}
                    openModal={openModal}
                    activeTab={activeTab}
                  />
                </div>
              )}

              {activeTab === "Suivi des actions" && (
                <div className="invite">
                  <KanbanMissionBoard
                    data={destinationSteps}
                    users={{}}
                    meeting={destination}
                    refreshMeeting={getDestinationStep}
                  />
                </div>
              )}
              {activeTab === "Schedule monitoring" && (
                <div className="complete-invite">
                  <h4
                    className={`participant-heading-meeting d-flex align-items-center justify-content-between`}
                  >
                    {view === "graph"
                      ? `${t("time_unit.Roadmap")} `
                      : view === "list"
                      ? `${t("time_unit.Calendar")}`
                      : view === "Mlist"
                      ? t("list_view")
                      : t("card_view")}
                    <span style={{ cursor: "pointer" }}>
                      <div className="toggle-button">
                        <button
                          className={`toggle-button-option ${
                            view === "list" ? "active" : ""
                          }`}
                          onClick={() => handleToggle("list")}
                        >
                          <div className="icon-list" />
                          <FaRegCalendarDays size={18} />
                        </button>
                        <button
                          className={`toggle-button-option ${
                            view === "graph" ? "active" : ""
                          }`}
                          onClick={() => handleToggle("graph")}
                        >
                          <div className="icon-graph" />
                          <FaChartGantt size={20} />
                        </button>
                        <button
                          className={`toggle-button-option ${
                            view === "card" ? "active" : ""
                          }`}
                          onClick={() => handleToggle("card")}
                        >
                          <div className="icon-graph" />
                          <FaTh size={20} />
                        </button>
                        <button
                          className={`toggle-button-option ${
                            view === "Mlist" ? "active" : ""
                          }`}
                          onClick={() => handleToggle("Mlist")}
                        >
                          <div className="icon-graph" />
                          <FaList size={20} />
                        </button>
                      </div>
                    </span>
                  </h4>

                  <br />
                  {view === "graph" ? (
                    <>
                      {loading ? (
                        <div
                          className="progress-overlay"
                          style={{ background: "transparent" }}
                        >
                          <div style={{ width: "50%" }}>
                            <ProgressBar now={roadmapDataProgress} animated />
                          </div>
                        </div>
                      ) : (
                        <Roadmap
                          isLoading={loading}
                          data={roadmapData}
                          milestones={milestones}
                          destination={destination}
                          startDate={startDate}
                          endDate={endDate}
                          onPrevious={() =>
                            setTimeWindowOffset((prev) => prev - 1)
                          }
                          onNext={() => setTimeWindowOffset((prev) => prev + 1)}
                          onReset={handleReset}
                          meetings={meetings}
                          // participants={participants}
                          loggedInUserId={userId}
                          openModal={openModal}
                          activeTab={activeTab}
                          id={destination?.id}
                          from="tektime"
                        />
                      )}
                    </>
                  ) : view === "list" ? (
                    <ReactCalendar
                      meetings={meetings}
                      from="tektime"
                      defaultView={defaultAgendaView}
                      showProgress={showMomentProgress}
                      progress={momentProgress}
                    />
                  ) : view === "card" ? (
                    <Moments
                      meetings={meetings}
                      destination={destination}
                      isLoading={isLoading}
                      refreshedMeetings={getMeetingsByDestinationId}
                      isDeadlinePassed={isDeadlinePassed}
                      diffDays={diffDays}
                      showProgress={showMomentProgress}
                      progress={momentProgress}
                      view={view}
                    />
                  ) : (
                    <Moments
                      meetings={meetings}
                      destination={destination}
                      isLoading={isLoading}
                      refreshedMeetings={getMeetingsByDestinationId}
                      isDeadlinePassed={isDeadlinePassed}
                      diffDays={diffDays}
                      showProgress={showMomentProgress}
                      progress={momentProgress}
                      view={view}
                    />
                  )}
                </div>
              )}

              {/* {activeTab === "Schedule monitoring" && (
                <div className="complete-invite">
                  <div
                    className="tabs border-bottom mb-4"
                    style={{
                      display: "flex",
                      justifyContent: "start",
                    }}
                  >
                    <button
                      className={`tab ${
                        subActiveTab === "graph" ? "active" : ""
                      }`}
                      onClick={() => setSubActiveTab("graph")}
                    >
                      {t("time_unit.Calendar")} / {t("time_unit.Roadmap")}
                    </button>
                    <button
                      className={`tab ${
                        subActiveTab === "moments" ? "active" : ""
                      }`}
                      onClick={() => setSubActiveTab("moments")}
                    >
                      Moments
                      <span
                        className={
                          subActiveTab === "moments" ? "future" : "draft"
                        }
                      >
                       
                        {meetingsCount}
                      </span>
                    </button>
                  </div>

                  {subActiveTab !== "moments" ? (
                    <>
                      {view === "graph" ? (
                        <Roadmap
                          isLoading={loading}
                          data={roadmapData}
                          milestones={milestones}
                          destination={destination}
                          startDate={startDate}
                          endDate={endDate}
                          onPrevious={() =>
                            setTimeWindowOffset((prev) => prev - 1)
                          }
                          onNext={() => setTimeWindowOffset((prev) => prev + 1)}
                          onReset={handleReset}
                          meetings={meetings}
                          // participants={participants}
                          loggedInUserId={userId}
                          openModal={openModal}
                          activeTab={activeTab}
                          id={destination?.id}
                          from="tektime"
                        />
                      ) : (
                        <ReactCalendar
                          meetings={meetings}
                          from="tektime"
                          defaultView={defaultAgendaView}
                        />
                      )}
                    </>
                  ) : (
                    <Moments
                      meetings={meetings}
                      destination={destination}
                      isLoading={isLoading}
                      refreshedMeetings={getMeetingsByDestinationId}
                      isDeadlinePassed={isDeadlinePassed}
                      diffDays={diffDays}
                      showProgress={showMomentProgress}
                      progress={momentProgress}
                    />
                  )}
                </div>
              )} */}
              {activeTab === "My working days" && (
                <div className="p-4 bg-light rounded-3 shadow-sm">
                  {/* Time Zone Section */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      {t("destination.Time Zone")}
                    </h5>
                    <Row className="align-items-center">
                      <Col md={4}>
                        <Form.Group controlId="timeZone">
                          <Form.Label className="text-muted small mb-1">
                            {t("destination.Your Time Zone")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={
                              Intl.DateTimeFormat().resolvedOptions().timeZone
                            }
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Working Days Section */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      {t("destination.Standing Working Days")}
                    </h5>
                    <Row>
                      <Col md={2} className="text-end">
                        <Form.Label className="text-muted small mb-1">
                          {t("destination.Every")}
                        </Form.Label>
                      </Col>
                      <Col md={8}>
                        <div className="d-grid gap-2">
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ].map((day) => {
                            const localizedDay = t(
                              `destination.days.${day.toLowerCase()}`
                            );
                            const isActive = workingDays.some(
                              (wd) => wd.day === day
                            );

                            return (
                              <div
                                key={day}
                                className="d-flex align-items-center mb-2"
                              >
                                <div style={{ minWidth: "150px" }}>
                                  <Form.Check
                                    type="checkbox"
                                    id={`day-${day}`}
                                    label={localizedDay}
                                    checked={isActive}
                                    onChange={(e) =>
                                      handleWorkingDayChange(
                                        day,
                                        e.target.checked
                                      )
                                    }
                                  />
                                </div>
                                {/* {isActive && (
            <span className="text-muted small">
              {formatWorkingTime(workingDays.find(wd => wd.day === day)?.start_time || '09:00')}
              {' '}{t("destination.common.to")}{' '}
              {formatWorkingTime(workingDays.find(wd => wd.day === day)?.end_time || '17:00')}
            </span>
          )} */}
                                {isActive && (
                                  <div className="d-flex gap-2 align-items-center ms-3">
                                    <Form.Control
                                      type="time"
                                      size="sm"
                                      style={{ maxWidth: "130px" }}
                                      value={
                                        workingDays.find((wd) => wd.day === day)
                                          ?.start_time || "09:00"
                                      }
                                      onChange={(e) =>
                                        updateWorkingDayTime(
                                          day,
                                          "start_time",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <span className="text-muted small">
                                      {t("destination.common.to")}
                                    </span>
                                    <Form.Control
                                      type="time"
                                      size="sm"
                                      style={{ maxWidth: "130px" }}
                                      value={
                                        workingDays.find((wd) => wd.day === day)
                                          ?.end_time || "17:00"
                                      }
                                      onChange={(e) =>
                                        updateWorkingDayTime(
                                          day,
                                          "end_time",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Non-Working Days Section */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">
                      {t("destination.Non-Working Days")}
                    </h5>
                    <Row>
                      <Col md={2} className="text-end">
                        <Form.Label className="text-muted small mb-1">
                          {t("destination.Dates")}
                        </Form.Label>
                      </Col>
                      <Col md={8}>
                        {nonWorkingDays.length === 0 ? (
                          <p className="text-muted small">
                            {t("destination.No dates selected")}
                          </p>
                        ) : (
                          <ListGroup variant="flush">
                            {nonWorkingDays.map((date, index) => (
                              <ListGroup.Item
                                key={index}
                                className="d-flex justify-content-between align-items-center"
                              >
                                <span className="small">
                                  {date.date} - {date.start_time} to{" "}
                                  {date.end_time}
                                </span>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeNonWorkingDay(index)}
                                >
                                  {t("destination.Remove")}
                                </Button>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                        <button
                          className="btn mt-3"
                          style={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "24px",
                            textAlign: "left",
                            color: " #FFFFFF",
                            background: "#2C48AE",
                            border: 0,
                            outine: 0,
                            padding: "10px 16px",
                            borderRadius: "9px",
                            // marginTop: "1.5rem",
                          }}
                          onClick={() => setShowDatePicker(true)}
                        >
                          {t("destination.Add Date")}
                        </button>
                      </Col>
                    </Row>
                  </div>

                  {/* Date Picker Modal */}
                  <Modal
                    show={showDatePicker}
                    onHide={() => setShowDatePicker(false)}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        {t("destination.Add Non-Working Day")}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>{t("destination.Date")}</Form.Label>
                          <Form.Control
                            type="date"
                            value={newNonWorkingDay.date}
                            onChange={(e) =>
                              setNewNonWorkingDay({
                                ...newNonWorkingDay,
                                date: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                        <Row>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("destination.Start Time")}
                              </Form.Label>
                              <Form.Control
                                type="time"
                                value={newNonWorkingDay.start_time}
                                onChange={(e) =>
                                  setNewNonWorkingDay({
                                    ...newNonWorkingDay,
                                    start_time: e.target.value,
                                  })
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                {t("destination.End Time")}
                              </Form.Label>
                              <Form.Control
                                type="time"
                                value={newNonWorkingDay.end_time}
                                onChange={(e) =>
                                  setNewNonWorkingDay({
                                    ...newNonWorkingDay,
                                    end_time: e.target.value,
                                  })
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <button
                        className="btn btn-danger"
                        onClick={() => setShowDatePicker(false)}
                      >
                        {t("destination.Cancel")}
                      </button>
                      <button
                        className="btn"
                        style={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "24px",
                          textAlign: "left",
                          color: " #FFFFFF",
                          background: "#2C48AE",
                          border: 0,
                          outine: 0,
                          padding: "10px 16px",
                          borderRadius: "9px",
                          // marginTop: "1.5rem",
                        }}
                        onClick={addNonWorkingDay}
                      >
                        {t("destination.Add Date")}
                      </button>
                    </Modal.Footer>
                  </Modal>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-end mt-4">
                    <button
                      className="btn"
                      style={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "24px",
                        textAlign: "left",
                        color: " #FFFFFF",
                        background: "#2C48AE",
                        border: 0,
                        outine: 0,
                        padding: "10px 16px",
                        borderRadius: "9px",
                        // marginTop: "1.5rem",
                      }}
                      onClick={handleSubmit}
                    >
                      {t("Validate")}
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "Facturation Tab" && (
                <FacturationForm
                  destination={destination}
                  meetings={meetings}
                  participants={participants}
                  loggedInUserId={userId}
                />
              )}
            </div>
          </div>

          {isModalOpen && (
            <ViewFilePreview
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              modalContent={modalContent}
              closeModal={closeModal}
              isFileUploaded={isFileUploaded}
              setIsFileUploaded={setIsFileUploaded}
              refreshMeeting={getFiles}
            />
          )}

          {
            <AddDestination
              show={show}
              currentItem={destination}
              handleClose={handleClose}
              refreshedDestination={getDestination}
              refreshBudget={getBudgetCalculation}
            />
          }
          {showConfirmationModal && (
            <ConfirmationModal
              message={t("missiondeletemessage")}
              onConfirm={(e) => confirmDelete(e)}
              onCancel={(e) => {
                e.stopPropagation();
                setShowConfirmationModal(false);
              }}
            />
          )}

          {showMomentForm && (
            <QuickMomentForm
              show={showMomentForm}
              onClose={() => {
                setShowMomentForm(false);
                setFormState({
                  selectedOption: null,
                  title: "",
                  date: "",
                  start_time: "",
                  description: "",
                  type: "",
                  priority: "",
                  alarm: false,
                  feedback: false,
                  remainder: false,
                  notification: false,
                  autostart: false,
                  playback: "manual",
                  prise_de_notes: "Manual",
                  note_taker: false,
                  objective: "",
                  participants: [],
                  steps: [],
                  solution_tab: "use a template",
                  solution_id: null,
                  id: null,
                  repetition: false,
                  repetition_number: 1,
                  repetition_frequency: "Daily",
                  repetition_end_date: null,
                  selected_days: [],
                  teams: [],
                  moment_privacy: "participant only",
                  moment_privacy_teams: [],
                  moment_password: null,
                  location: null,
                  agenda: null,
                  address: null,
                  room_details: null,
                  phone: null,
                  share_by: null,
                  price: null,
                  max_participants_register: 0,

                  casting_tab: null,
                });
              }}
              openedFrom={"mission"}
              destination={destination}
              refresh={refresh}
            />
          )}
        </div>
        </>
      )}

      {open && (
        <NewMeetingModal
          open={open}
          closeModal={handleCloseModal}
          destination={destination}
          openedFrom="destination"
        />
      )}

      {isPrivacyModal && (
        <div className="confirmation-modal">
          <div className="confirmation-modal-content">
            <p>{visibilityMessage}</p>
            <div className="confirmation-modal-buttons">
              <button className="btn btn-danger" onClick={() => navigate(-1)}>
                {t("Ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tabs;
