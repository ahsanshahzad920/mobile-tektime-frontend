import CookieService from "../../../Utils/CookieService";
import React, { useEffect, useState, lazy, Suspense, useRef } from "react";
import { API_BASE_URL, Assets_URL } from "../../../Apicongfig";
import {
  Accordion,
  Button,
  Card,
  Col,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FaExpand, FaRegFileAudio } from "react-icons/fa"; // Import the FaExpand icon
import { PiFilePdfLight } from "react-icons/pi";
import { IoCopyOutline, IoVideocamOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import {
  convertCount2ToSeconds,
  convertTimeTakenToSeconds,
  formatPauseTime,
  formatStepDate,
  getTimeUnitDisplay,
} from "../../../Utils/MeetingFunctions";
import { HiUserCircle } from "react-icons/hi2";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlinePhotoSizeSelectActual,
} from "react-icons/md";
import { toast } from "react-toastify";
import { RiFileExcel2Line } from "react-icons/ri";
import Spreadsheet from "react-spreadsheet";
import { read, utils } from "xlsx";
import DOMPurify from "dompurify";
import ReportMediaGallery from "./ReportMediaGallery";

const ActiveReportStepCard = ({
  setIsModalOpen1,
  data,
  startTime,
  users,
  fromMeeting,
  meeting,
  runStep,
  reRunStep,
  isRun,
  isReOpen,
  isAccordion = false,
  index,
  stepMedias = [],
}) => {
  const [t] = useTranslation("global");
  const [excelData, setExcelData] = useState(null);
  const [inProgressStep, setInProgressStep] = useState(null);

  // Function to get media files for this specific step
  const getStepMedias = () => {
    return stepMedias.filter((media) => media.step_id === data.id);
  };
  const handleStepCardButtonClick = (item) => {
    setIsModalOpen1(true); // Update the modal open state
  };

  const convertTo24HourFormat = (time, date, type, timezone) => {
    if (!time || !date || !type) {
      return false;
    }

    const meetingTimezone = timezone || "Europe/Paris";
    const userTimezone = moment.tz.guess();

    // Convert meeting time from its original timezone to the user's timezone
    const convertedTime = moment
      .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss A", meetingTimezone)
      .tz(userTimezone);

    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    // const timeMoment = moment(time, "hh:mm:ss A");
    // return timeMoment.isValid() ? timeMoment.format("HH:mm:ss") : "";
    // Assuming time is in 'hh:mm:ss A' format (12-hour format with AM/PM)
    const timeMoment = moment(convertedTime, "hh:mm:ss A");

    // Check if the time is valid
    if (!timeMoment.isValid()) return "";

    // If the meeting type is 'Quiz', include seconds in the format
    const format = type === "seconds" ? "HH[h]mm[m]ss" : "HH[h]mm";

    // Return the time in the appropriate format
    return timeMoment.format(format);
  };

  const localizeTimeTakenActive = (timeTaken) => {
    if (!timeTaken) return "";

    // Retrieve localized time units
    const timeUnits = t("time_unit", { returnObjects: true });

    // Split the timeTaken string by " - " to separate time components
    const timeParts = timeTaken.split(" - ");

    // Initialize variables for each time component
    let days = null;
    let hours = null;
    let minutes = null;
    let seconds = null;

    // Iterate over each part and assign it to the corresponding variable
    timeParts.forEach((part) => {
      if (part.includes("day")) {
        days = part;
      } else if (part.includes("hour")) {
        hours = part;
      } else if (part.includes("min")) {
        minutes = part;
      } else if (part.includes("sec")) {
        seconds = part;
      }
    });

    // Check if days are present
    const hasDays = Boolean(days);

    // Determine what to show based on the presence of days
    let result = "";
    if (hasDays) {
      // Show days and hours if days are present
      result = [days, hours].filter(Boolean).join(" - ");
    } else if (hours) {
      // Show only hours and minutes if hours and minutes are present
      result = [hours, minutes].filter(Boolean).join(" - ");
    } else if (minutes) {
      // Show minutes only if no days or hours are present
      // result = minutes;
      result = [minutes, seconds].filter(Boolean).join(" - ");
    } else {
      result = seconds;
    }

    // Return empty string if result is undefined or empty
    if (!result) return "";

    // Localize and return the result
    return result
      .split(" ")
      .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
      .join(" ");
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) {
      return false;
    }
    if (url.includes("youtube.com/watch")) {
      const videoUrl = new URL(url);
      const videoId = videoUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      // Handle the shortened YouTube URL (youtu.be)
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return false; // Return false if it's not a valid YouTube URL
  };
  // const [dropdownVisible, setDropdownVisible] = useState(
  //   Array(data?.length).fill(true)
  // );
  const [dropdownVisible, setDropdownVisible] = useState(
    data?.step_status === "in_progress", // Only in_progress steps open by default
  );

  const dropdownRefs = useRef([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (data?.step_status === "in_progress") return;
    if (data?.step_status === "completed" || data?.step_status === null) {
      setDropdownVisible((prev) => !prev);
    }
  };

  // useEffect(() => {
  //   data?.forEach((item, index) => {
  //     const el = dropdownRefs.current[index];
  //     if (el) {
  //       if (dropdownVisible[index]) {
  //         el.style.display = "block";
  //         requestAnimationFrame(() => {
  //           el.classList.add("show");
  //         });
  //       } else {
  //         el.classList.remove("show");
  //         el.addEventListener(
  //           "transitionend",
  //           () => {
  //             el.style.display = "none";
  //           },
  //           { once: true }
  //         );
  //       }
  //     }
  //   });
  // }, [dropdownVisible, data]);

  useEffect(() => {
    const el = dropdownRef.current;
    if (el) {
      if (dropdownVisible) {
        el.style.display = "block";
        requestAnimationFrame(() => {
          el.classList.add("show");
        });
      } else {
        el.classList.remove("show");
        el.addEventListener(
          "transitionend",
          () => {
            el.style.display = "none";
          },
          { once: true },
        );
      }
    }
  }, [dropdownVisible]);
  useEffect(() => {
    const currentInProgressStep = meeting?.steps.find(
      (item) => item.step_status === "in_progress",
    );
    setInProgressStep(currentInProgressStep || null);
  }, [meeting?.steps]);

  // Fetch Excel data when inProgressStep changes
  useEffect(() => {
    const fetchExcel = async () => {
      if (inProgressStep?.editor_type === "Excel" && inProgressStep?.file) {
        try {
          const fileResponse = await axios.get(
            `${Assets_URL}/${inProgressStep.file}`,
            {
              responseType: "arraybuffer",
            },
          );

          const fileData = fileResponse.data;
          const workbook = read(fileData, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });

          const formattedData = jsonSheetData.map((row, rowIndex) =>
            row.map((cell) => ({
              value: cell,
              readOnly: rowIndex === 0,
            })),
          );

          setExcelData(formattedData);
        } catch (error) {
          console.error("Error fetching Excel file:", error);
        }
      }
    };

    if (inProgressStep) {
      fetchExcel();
    }
  }, [inProgressStep]);

  const sanitizeContent = (content) => {
    if (!content) return null;

    const sanitizedContent = DOMPurify.sanitize(content, {
      ADD_TAGS: [
        "table",
        "tr",
        "td",
        "th",
        "tbody",
        "thead",
        "tfoot",
        "caption",
        "iframe",
      ],
      ADD_ATTR: [
        "allow",
        "allowfullscreen",
        "frameborder",
        "scrolling",
        "src",
        "title",
        "style",
      ],
    });

    // Create a temporary div to hold the sanitized HTML and parse it
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = sanitizedContent;

    // Find all iframe tags within the content
    const iframes = tempDiv.querySelectorAll("iframe");

    // Replace each iframe tag with a link while preserving its surrounding structure
    iframes.forEach((iframe) => {
      const iframeSrc = iframe.getAttribute("src");

      if (iframeSrc) {
        const linkElement = document.createElement("a");
        linkElement.href = iframeSrc;
        linkElement.target = "_blank";

        // Create a more user-friendly link text (optional improvement)
        // linkElement.textContent = `Click here to view the content`;
        linkElement.textContent = iframeSrc;

        // Apply the truncation class to the link element
        linkElement.classList.add("truncated-link");
        // Replace iframe with the link while keeping it inside the parent tag (e.g., table, td)
        iframe.parentNode.replaceChild(linkElement, iframe);
      }
    });

    // Return the updated HTML as a string
    return tempDiv.innerHTML;
  };

  const [openCompletedStep, setOpenCompletedStep] = useState(null); // Track the open completed step

  const renderMediaPreview = () => {
    const commonStyles = {
      width: "100%",
      minHeight: isAccordion ? "250px" : "250px",
      height: "auto",
      objectFit: "contain",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 0.3s ease",
      backgroundColor: "#f8f9fa",
      border: "1px solid #dee2e6",
    };

    if (
      (data?.editor_type === "Editeur" || data?.editor_type === "Subtask") &&
      data?.editor_content &&
      data?.editor_content.trim() !== "<html><head></head><body></body></html>"
    ) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data?.editor_content;
      const firstImageTag = tempDiv.querySelector("img");
      const firstImageUrl = firstImageTag
        ? firstImageTag.getAttribute("src")
        : "";
      return firstImageUrl ? (
        <img
          src={firstImageUrl}
          style={commonStyles}
          alt="Step Preview"
          className="step-media hover-scale"
        />
      ) : (
        <div style={commonStyles} className="hover-scale">
          <FiEdit size={40} color="#00a8e1" />
        </div>
      );
    } else if (data?.editor_type === "File") {
      return (
        <div style={commonStyles} className="hover-scale">
          <PiFilePdfLight size={40} color="#00a8e1" />
        </div>
      );
    } else if (data?.editor_type === "Excel") {
      return (
        <div style={commonStyles} className="hover-scale">
          <RiFileExcel2Line size={40} color="#00a8e1" />
        </div>
      );
    } else if (
      data?.editor_type === "Video" ||
      data?.editor_type === "Video Report"
    ) {
      return (
        <div style={commonStyles} className="hover-scale">
          <IoVideocamOutline size={40} color="#00a8e1" />
        </div>
      );
    } else if (data?.editor_type === "Audio Report") {
      return (
        <div style={commonStyles} className="hover-scale">
          <FaRegFileAudio size={40} color="#00a8e1" />
        </div>
      );
    } else if (data?.editor_type === "Photo") {
      return (
        <img
          src={`${Assets_URL}/${data?.file}`}
          style={commonStyles}
          alt="Step Photo"
          className="step-media hover-scale"
        />
      );
    } else if (data?.url) {
      return (
        <div style={commonStyles} className="hover-scale">
          <IoCopyOutline size={40} color="#00a8e1" />
        </div>
      );
    }
    return (
      <div style={commonStyles} className="hover-scale">
        <FiEdit size={40} color="#00a8e1" />
      </div>
    );
  };

  const renderContent = () => {
    if (
      (data?.editor_type === "Editeur" ||
        data?.editor_type === "Subtask" ||
        data?.editor_type === "Email" ||
        data?.editor_type === "Story") &&
      data?.editor_content &&
      data?.editor_content.trim() !== "<html><head></head><body></body></html>"
    ) {
      return (
        <div
          className="rendered-content"
          style={{ borderRadius: "8px", padding: "1rem" }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeContent(data?.editor_content),
            }}
          />
        </div>
      );
    } else if (data?.file && data?.editor_type === "File") {
      return (
        <div className="pdf-content">
          <Button
            href={`${Assets_URL}/${data?.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="option-btn mb-3"
          >
            {t("Download PDF")}
          </Button>
          <iframe
            src={`${Assets_URL}/${data?.file}#toolbar=0&view=fitH`}
            width="100%"
            style={{
              height: isAccordion ? 300 : 600,
              borderRadius: "8px",
              border: "none",
            }}
            title="PDF Preview"
            className="step-media"
            loading="lazy"
            scrolling="no"
          />
        </div>
      );
    } else if (data?.file && data?.editor_type === "Excel") {
      return (
        <div
          className="excel-content"
          style={{ borderRadius: "8px", padding: "1rem" }}
        >
          {excelData ? (
            <Spreadsheet data={excelData} />
          ) : (
            <p className="text-muted">{t("No Excel data available")}</p>
          )}
        </div>
      );
    } else if (
      data?.url &&
      (data?.editor_type === "Video" || data?.editor_type === "Video Report" || data?.editor_type === "Url")
    ) {
      const embedUrl = getYoutubeEmbedUrl(data?.url);
      return embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          style={{
            height: isAccordion ? "200px" : "400px",
            borderRadius: "8px",
          }}
          title="Video Preview"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="step-media"
          loading="lazy"
        />
      ) : (
        <Button
          href={data?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="option-btn"
        >
          {t("View Video")}
        </Button>
      );
    } else if (data?.editor_type === "Photo") {
      return (
        <img
          src={`${Assets_URL}/${data?.file}`}
          alt="Step Photo"
          className="step-media"
          style={{ maxWidth: "100%", height: "auto", borderRadius: "12px" }}
          loading="lazy"
        />
      );
    } else if (data?.url) {
      return (
        <Button
          href={data?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="option-btn"
        >
          {t("View Link")}
        </Button>
      );
    } else if (data?.file && data?.editor_type === "Audio Report") {
      return (
        <div className="audio-content">
          <Button
            href={`${Assets_URL}/${data?.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="option-btn mb-3"
          >
            {t("Download Audio")}
          </Button>
          <audio
            controls
            src={`${Assets_URL}/${data?.file}`}
            style={{ width: "100%", borderRadius: "8px" }}
            className="step-media"
          />
        </div>
      );
    }
    return null;
  };

  const renderActionButton = () =>
    (data?.step_status === null || data?.step_status === "to_finish") &&
    meeting?.guides?.some(
      (guide) => guide?.email === CookieService.get("email"),
    ) && (
      <div className="mt-3">
        <Button
          style={{
            backgroundColor: "#0026b1",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            transition: "background-color 0.3s",
            opacity: isRun || isReOpen ? 0.4 : 1,
          }}
          onClick={() => {
            if (data?.step_status === null) {
              runStep(data);
              handleStepCardButtonClick(data);
            } else if (data?.step_status === "to_finish") {
              reRunStep(data);
              handleStepCardButtonClick(data);
            }
          }}
          disabled={isRun || isReOpen}
        >
          {data?.step_status === null ? t("startMoment") : t("ReOpen")}
        </Button>
      </div>
    );

  const renderCardContent = () => (
    <Card
      className="step-card animate__animated animate__fadeInUp shadow-sm"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <Card.Body>
        <Row>
          {/* <Col xs={12} md={4} className="step-multimedia">
            {renderMediaPreview()}
          </Col> */}
          {/* Conditionally render the media preview based on dropdownVisible */}
          {!dropdownVisible && (
            <Col xs={12} md={4} className="step-multimedia">
              {renderMediaPreview()}
            </Col>
          )}
          <Col
            xs={12}
            md={dropdownVisible ? 12 : 8}
            className="step-details"
            onClick={toggleDropdown}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="step-card-heading">
                {data?.order_no <= 9 ? `0${data?.order_no}` : data?.order_no}.
                &nbsp; {data?.title}
                {/* <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{t(`badge.${data?.step_status}`)}</Tooltip>}
                > */}
                  {data?.step_status === "completed" ? (
                    <span className="status-badge-completed ms-2">
                      {t("badge.completed")}
                    </span>
                  ) : data?.step_status === "in_progress" ? (
                    <span
                      className={
                        convertTimeTakenToSeconds(data?.time_taken) >
                        convertCount2ToSeconds(data?.count2, data?.time_unit)
                          ? "status-badge-red ms-2"
                          : "status-badge-inprogress ms-2"
                      }
                    >
                      {t("badge.inprogress")}
                    </span>
                  ) : data?.step_status === "to_finish" ? (
                    <span className="status-badge-finish ms-2">
                      {t("badge.finish")}
                    </span>
                  ) : data?.step_status === "cancelled" ? (
                    <span className="status-badge-red ms-2">
                      {t("badge.cancel")}
                    </span>
                  ) : data?.step_status === "todo" ? (
                    <span className="status-badge-green ms-2">
                      {t("badge.todo")}
                    </span>
                  ) : data?.step_status === "paused" ? (
                    <span className="status-badge-red ms-2">
                      {t("badge.paused")}
                    </span>
                  ) : (
                    <span className="status-badge-upcoming ms-2">
                      {t("badge.future")}
                    </span>
                  )}
                {/* </OverlayTrigger> */}
              </Card.Title>
              {(data?.step_status === "in_progress" ||
                data?.step_status === "completed" ||
                data.step_status === null) && (
                // <OverlayTrigger
                //   placement="top"
                //   overlay={
                //     <Tooltip>
                //       {dropdownVisible ? t("Hide Details") : t("Show Details")}
                //     </Tooltip>
                //   }
                // >
                  <MdKeyboardArrowDown
                    size={26}
                    className="toggle-icon"
                    style={{
                      cursor: "pointer",
                      transform: dropdownVisible
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                    onClick={toggleDropdown}
                  />
                // </OverlayTrigger>
              )}
            </div>
            <Card.Text className="step-card-content d-flex align-items-center flex-wrap gap-2">
              <span className="d-flex align-items-center gap-2">
                {meeting?.newsletter_guide ? (
                  <>
                    {meeting?.newsletter_guide?.logo ? (
                      <img
                        height="24px"
                        width="24px"
                        style={{
                          borderRadius: "20px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                        src={
                          meeting?.newsletter_guide?.logo.startsWith("http")
                            ? meeting?.newsletter_guide?.logo
                            : `${Assets_URL}/${meeting?.newsletter_guide?.logo}`
                        }
                        alt={meeting?.newsletter_guide?.name}
                      />
                    ) : (
                      <HiUserCircle size={24} />
                    )}
                    <span>{meeting?.newsletter_guide?.name}</span>
                  </>
                ) : (
                  <>
                    {data?.assigned_to_image ? (
                      <img
                        height="24px"
                        width="24px"
                        style={{
                          borderRadius: "20px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                        src={
                          data?.assigned_to_image?.startsWith("users/")
                            ? `${Assets_URL}/${data?.assigned_to_image}`
                            : data?.assigned_to_image
                        }
                        alt="Assignee"
                      />
                    ) : (
                      <img
                        height="24px"
                        width="24px"
                        style={{
                          borderRadius: "20px",
                          objectFit: "cover",
                          objectPosition: "top",
                        }}
                        src={
                          users?.image?.startsWith("users/")
                            ? `${Assets_URL}/${users?.image}`
                            : users?.image
                        }
                        alt="Assignee"
                      />
                    )}
                    <span>
                      {data?.assigned_to_name ||
                        `${users?.firstName} ${users?.lastName}`}
                    </span>
                  </>
                )}
              </span>
              <span className="d-flex align-items-center gap-2">
                <img
                  height="16px"
                  width="16px"
                  src="/Assets/ion_time-outline.svg"
                  alt="Time"
                />
                {data?.time_unit === "days" ? (
                  <span>
                    {formatStepDate(
                      data?.start_date,
                      data?.step_time,
                      meeting?.timezone,
                    )}
                  </span>
                ) : (
                  <span>
                    {formatStepDate(
                      data?.start_date,
                      data?.step_time,
                      meeting?.timezone,
                    )}{" "}
                    {t("at")}{" "}
                    {convertTo24HourFormat(
                      data?.step_time,
                      data?.start_date,
                      data?.time_unit,
                      meeting?.timezone,
                    )}
                  </span>
                )}
              </span>
              <span>
                {data?.step_status === null || data?.step_status === "todo"
                  ? data?.count2 +
                    " " +
                    getTimeUnitDisplay(
                      data?.count2,
                      data?.time_unit,
                      t,
                      meeting?.type, // pass meeting type
                    )
                  : data?.step_status === "to_finish"
                    ? formatPauseTime(data?.work_time, t)
                    : localizeTimeTakenActive(
                        data?.time_taken?.replace("-", ""),
                      )}
              </span>
            </Card.Text>
            {renderActionButton()}
            {dropdownVisible &&
              (data?.step_status === "completed" ||
                data?.step_status === "in_progress" ||
                data?.step_status === null) && (
                <div
                  className="dropdown-content-1 fade"
                  ref={dropdownRef}
                  style={{ display: "none" }}
                >
                  <div className="dropdown-section-1 mb-5">
                    {renderContent()}
                  </div>
                  <ReportMediaGallery
                    stepMedias={getStepMedias()}
                    fromReport={true}
                  />
                </div>
              )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderAccordionContent = () => (
    <Accordion.Item
      eventKey={index.toString()}
      className="accordion-item-custom"
    >
      <Accordion.Header className="steps-header" onClick={toggleDropdown}>
        <div className="steps-header-content">
          <h5 className="mb-0">
            {data?.order_no <= 9 ? `0${data?.order_no}` : data?.order_no}.
            &nbsp; {data?.title}
          </h5>
          <div className="steps-meta">
            <span>
              {t("Assignee")}:{" "}
              {data?.assigned_to_name ||
                `${users?.firstName} ${users?.lastName}`}
            </span>
            <span>
              {t("Date")}:{" "}
              {formatStepDate(
                data?.start_date,
                data?.step_time,
                meeting?.timezone,
              )}
              {data?.time_unit !== "days" && (
                <>
                  {" "}
                  {t("at")}{" "}
                  {convertTo24HourFormat(
                    data?.step_time,
                    data?.start_date,
                    data?.time_unit,
                    meeting?.timezone,
                  )}
                </>
              )}
            </span>
            <span>
              {t("Time Taken")}:
              {data?.step_status === null || data?.step_status === "todo"
                ? data?.count2 +
                  " " +
                  getTimeUnitDisplay(
                    data?.count2,
                    data?.time_unit,
                    t,
                    meeting?.type,
                  )
                : data?.step_status === "to_finish"
                  ? formatPauseTime(data?.work_time, t)
                  : localizeTimeTakenActive(data?.time_taken?.replace("-", ""))}
            </span>
            {/* <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t(`badge.${data?.step_status}`)}</Tooltip>}
            > */}
              <span>
                {data?.step_status === "completed" ? (
                  <span className="status-badge-completed">
                    {t("badge.completed")}
                  </span>
                ) : data?.step_status === "in_progress" ? (
                  <span
                    className={
                      convertTimeTakenToSeconds(data?.time_taken) >
                      convertCount2ToSeconds(data?.count2, data?.time_unit)
                        ? "status-badge-red"
                        : "status-badge-inprogress"
                    }
                  >
                    {t("badge.inprogress")}
                  </span>
                ) : data?.step_status === "to_finish" ? (
                  <span className="status-badge-finish">
                    {t("badge.finish")}
                  </span>
                ) : data?.step_status === "cancelled" ? (
                  <span className="status-badge-red">{t("badge.cancel")}</span>
                ) : data?.step_status === "todo" ? (
                  <span className="status-badge-green">{t("badge.todo")}</span>
                ) : data?.step_status === "paused" ? (
                  <span className="status-badge-red">{t("badge.paused")}</span>
                ) : (
                  <span className="status-badge-upcoming">
                    {t("badge.future")}
                  </span>
                )}
              </span>
            {/* </OverlayTrigger> */}
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body className="steps-body">
        {renderMediaPreview()}
        {renderContent()}
        {renderActionButton()}
      </Accordion.Body>
    </Accordion.Item>
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isAccordion ? renderAccordionContent() : renderCardContent()}
    </Suspense>
  );
};

export default ActiveReportStepCard;
