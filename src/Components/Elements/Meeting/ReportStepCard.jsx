import React, { useEffect, useRef, useState } from "react";
import { Card, ProgressBar, Accordion, Image, Button, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { MdKeyboardArrowDown, MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { BsFiletypePdf } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { IoVideocamOutline, IoCopyOutline } from "react-icons/io5";
import { PiFilePdfLight } from "react-icons/pi";
import { HiUserCircle } from "react-icons/hi2";
import { RiFileExcel2Line, RiFolderVideoLine } from "react-icons/ri";
import { FaRegFileAudio } from "react-icons/fa";
import Spreadsheet from "react-spreadsheet";
import axios from "axios";
import { read, utils } from "xlsx";
import { convertTo24HourFormat, formatStepDate } from "../../Utils/MeetingFunctions";
import ReportMediaGallery from "./Report/ReportMediaGallery";
// import "./ReportStepCard.scss";

const ReportStepCard = ({ item, index, startTime, users, meeting, isTranscribing, transcriptionProgress, Assets_URL, t, isAccordion,stepMedias=[] }) => {
  const [dropdownVisible, setDropdownVisible] = useState(
    !!(item.editor_content || item.note || item.editor_type === "File" || item.editor_type === "Url"),
  );
  const dropdownRef = useRef(null);
  const pdfIframeRef = useRef(null);
  const [excelData, setExcelData] = useState(null);
  const [pdfHeight, setPdfHeight] = useState(isAccordion ? "300px" : "600px");

      const getStepMedias = () => {
    return stepMedias.filter(media => media.step_id === item.id);
  };
  const fetchExcel = async (file) => {
    try {
      const fileResponse = await axios.get(`${Assets_URL}/${file}`, {
        responseType: "arraybuffer",
      });
      const fileData = fileResponse.data;
      const workbook = read(fileData, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });
      const formattedData = jsonSheetData.map((row, rowIndex) =>
        row.map((cell) => ({
          value: cell,
          readOnly: rowIndex === 0,
        }))
      );
      setExcelData(formattedData);
    } catch (error) {
      console.error("Error fetching Excel file:", error);
    }
  };

  useEffect(() => {
    if (item.editor_type === "Excel" && item.file) {
      fetchExcel(item.file);
    }
  }, [item.file, item.editor_type]);

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
          { once: true }
        );
      }
    }
  }, [dropdownVisible]);

  useEffect(() => {
    if (item.editor_type === "File" && pdfIframeRef.current) {
      const iframe = pdfIframeRef.current;
      const adjustHeight = () => {
        // Fallback height based on screen size
        const fallbackHeight = isAccordion ? 300 : 600;
        try {
          // Attempt to access iframe content (may be restricted by cross-origin)
          const content = iframe.contentDocument || iframe.contentWindow?.document;
          if (content) {
            const pdfViewer = content.querySelector("embed") || content.querySelector("object");
            if (pdfViewer) {
              const height = pdfViewer.scrollHeight || fallbackHeight;
              setPdfHeight(`${height}px`);
            } else {
              setPdfHeight(`${fallbackHeight}px`);
            }
          } else {
            setPdfHeight(`${fallbackHeight}px`);
          }
        } catch (error) {
          console.error("Error accessing PDF iframe content:", error);
          setPdfHeight(`${fallbackHeight}px`);
        }
      };

      iframe.addEventListener("load", adjustHeight);
      return () => {
        iframe.removeEventListener("load", adjustHeight);
      };
    }
  }, [item.editor_type, isAccordion]);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const localizeTimeTakenActive = (timeTaken) => {
    if (!timeTaken) return "";
    const timeUnits = t("time_unit", { returnObjects: true });
    const timeParts = timeTaken.split(" - ");
    let days = null, hours = null, minutes = null, seconds = null;
    timeParts.forEach((part) => {
      if (part.includes("day")) days = part;
      else if (part.includes("hour")) hours = part;
      else if (part.includes("min")) minutes = part;
      else if (part.includes("sec")) seconds = part;
    });
    let result = "";
    if (days) {
      result = [days, hours].filter(Boolean).join(" - ");
    } else if (hours) {
      result = [hours, minutes].filter(Boolean).join(" - ");
    } else if (minutes) {
      result = [minutes, seconds].filter(Boolean).join(" - ");
    } else {
      result = seconds;
    }
    return result
      ? result
          .split(" ")
          .map((part) => (isNaN(part) ? timeUnits[part] || part : part))
          .join(" ")
      : "";
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return false;
    if (url.includes("youtube.com/watch")) {
      const videoUrl = new URL(url);
      const videoId = videoUrl.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return false;
  };

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


    if ((item.editor_type === "Editeur" || item.editor_type === "Subtask" || item?.editor_type === "Prestation" || item?.editor_type === "Story") && item.editor_content && item.editor_content.trim() !== "<html><head></head><body></body></html>") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = item.editor_content;
      const firstImageTag = tempDiv.querySelector("img");
      const firstImageUrl = firstImageTag ? firstImageTag.getAttribute("src") : "";
      return firstImageUrl ? (
        <Image src={firstImageUrl} style={commonStyles} alt="Step Preview" className="step-media hover-scale" />
      ) : (
        <div style={commonStyles} className="hover-scale">
          <FiEdit size={40} color="#00a8e1" />
        </div>
      );
    } else if (item.editor_type === "File") {
      return (
        <div style={commonStyles} className="hover-scale">
          <PiFilePdfLight size={40} color="#00a8e1" />
        </div>
      );
    } else if (item.editor_type === "Excel") {
      return (
        <div style={commonStyles} className="hover-scale">
          <RiFileExcel2Line size={40} color="#00a8e1" />
        </div>
      );
    } else if (item.editor_type === "Video" || item.editor_type === "Video Report") {
      return (
        <div style={commonStyles} className="hover-scale">
          <IoVideocamOutline size={40} color="#00a8e1" />
        </div>
      );
    } else if (item.editor_type === "Audio Report") {
      return (
        <div style={commonStyles} className="hover-scale">
          <FaRegFileAudio size={40} color="#00a8e1" />
        </div>
      );
    } else if (item.editor_type === "Photo") {
      return (
        <Image src={`${Assets_URL}/${item.file}`} style={commonStyles} alt="Step Photo" className="step-media hover-scale" />
      );
    } else if (item.url) {
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
    if ((item.editor_type === "Editeur" || item.editor_type === "Subtask" || item?.editor_type === "Prestation" || item?.editor_type === "Story") && item.editor_content && item.editor_content.trim() !== "<html><head></head><body></body></html>") {
      return (
        <div className="rendered-content" style={{ borderRadius: "8px", padding: "1rem" }}>
          <div dangerouslySetInnerHTML={{ __html: item.editor_content }} />
        </div>
      );
    } else if (item.file && item.editor_type === "File") {
      return (
        <div className="pdf-content">
          <Button href={`${Assets_URL}/${item.file}`} target="_blank" rel="noopener noreferrer" className="option-btn mb-3">
            {t("Download PDF")}
          </Button>
          <iframe
            ref={pdfIframeRef}
            src={`${Assets_URL}/${item.file}#toolbar=0&view=fitH`}
            width="100%"
            style={{ height: pdfHeight, borderRadius: "8px", border: "none" }}
            title="PDF Preview"
            className="step-media"
            loading="lazy"
            scrolling="no"
          />
        </div>
      );
    } else if (item.file && item.editor_type === "Excel") {
      return (
        <div className="excel-content" style={{ borderRadius: "8px", padding: "1rem" }}>
          {excelData ? (
            <Spreadsheet data={excelData} />
          ) : (
            <p className="text-muted">{t("No Excel data available")}</p>
          )}
        </div>
      );
    } else if (
      item.url &&
      (item.editor_type === "Video" || item.editor_type === "Video Report" || item.editor_type === "Url")
    ) {
      const embedUrl = getYoutubeEmbedUrl(item.url);
      return embedUrl ? (
        <iframe
          src={embedUrl}
          width="100%"
          style={{ height: isAccordion ? "200px" : "400px", borderRadius: "8px" }}
          title="Video Preview"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="step-media"
          loading="lazy"
        />
      ) : (
        <Button href={item.url} target="_blank" rel="noopener noreferrer" className="option-btn">
          {t("View Video")}
        </Button>
      );
    } else if (item.editor_type === "Photo") {
      return (
        <Image
          src={`${Assets_URL}/${item.file}`}
          alt="Step Photo"
          fluid
          className="step-media"
          style={{ maxWidth: "100%", height: "auto", borderRadius: "12px" }}
          loading="lazy"
        />
      );
    } else if (item.url) {
      return (
        <Button href={item.url} target="_blank" rel="noopener noreferrer" className="option-btn">
          {t("View Link")}
        </Button>
      );
    }
    return null;
  };

  const renderCampaignDetails = () => (
    <div className="campaign-details-grid">
      <div className="campaign-item">
        <span className="campaign-label">{t("Campaign Name")}:</span>
        <span>{item?.email_campaigns?.campaign_name}</span>
      </div>
      <div className="campaign-item">
        <span className="campaign-label">{t("Total Sendings")}:</span>
        <span>{item?.email_campaigns?.total_sendings}</span>
      </div>
      <div className="campaign-item">
        <span className="campaign-label">{t("Total Recipients")}:</span>
        <span>{item?.email_campaigns?.total_recipients}</span>
      </div>
      <div className="campaign-item">
        <span className="campaign-label">{t("Total Opens")}:</span>
        <span>{item?.email_campaigns?.total_opens}</span>
      </div>
      <div className="campaign-item">
        <span className="campaign-label">{t("Total Clicks")}:</span>
        <span>{item?.email_campaigns?.total_clicks}</span>
      </div>
      <div className="campaign-item">
        <span className="campaign-label">{t("Total Unsubscribes")}:</span>
        <span>{item?.email_campaigns?.total_unsubscribes}</span>
      </div>
    </div>
  );

  const renderCardContent = () => (
    <Card className="step-card animate__animated animate__fadeInUp shadow-sm" style={{ animationDelay: `${index * 0.2}s` }}>
      <Card.Body 
      
                  onClick={toggleDropdown}
      >
        <Row>
          {/* <Col xs={12} md={4} className="step-multimedia">
            {renderMediaPreview()}
          </Col> */}
           {!dropdownVisible && (
          <Col xs={12} md={4} className="step-multimedia">
            {renderMediaPreview()}
          </Col>
        )}
          <Col xs={12} md={dropdownVisible ? 12 : 8} className="step-details">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="step-card-heading">
                {item?.order_no}. &nbsp; {item.title}
                {/* <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>{t(`badge.${item.step_status}`)}</Tooltip>}
                > */}
                  {item.step_status === "completed" ? (
                    <span className="status-badge-completed ms-2">{t("badge.completed")}</span>
                  ) : item.step_status === "in_progress" ? (
                    <span className={meeting?.delay >= "00d:00h:01m" ? "status-badge-red ms-2" : "status-badge-inprogress ms-2"}>
                      {t("badge.inprogress")}
                    </span>
                  ) : item.step_status === "cancelled" || item.step_status === "abort" ? (
                    <span className="status-badge-red ms-2">{t("badge.cancel")}</span>
                  ) : (
                    <span className="status-badge-upcoming ms-2">{t("badge.future")}</span>
                  )}
                {/* </OverlayTrigger> */}
              </Card.Title>
              {/* <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{dropdownVisible ? t("Hide Details") : t("Show Details")}</Tooltip>}
              > */}
                <MdKeyboardArrowDown
                  size={26}
                  className="toggle-icon"
                  style={{ cursor: "pointer", transform: dropdownVisible ? "rotate(180deg)" : "rotate(0deg)" }}
                  onClick={toggleDropdown}
                />
              {/* </OverlayTrigger> */}
            </div>
            <Card.Text className="step-card-content d-flex align-items-center flex-wrap gap-2">
              <span className="d-flex align-items-center gap-2">
                {meeting?.newsletter_guide ? (
                  <>
                    {meeting?.newsletter_guide?.logo ? (
                      <img
                        height="24px"
                        width="24px"
                        style={{ borderRadius: "20px", objectFit: "cover", objectPosition: "top" }}
                        src={meeting?.newsletter_guide?.logo.startsWith('http') ? meeting?.newsletter_guide?.logo : `${Assets_URL}/${meeting?.newsletter_guide?.logo}`}
                        alt={meeting?.newsletter_guide?.name}
                      />
                    ) : (
                      <HiUserCircle size={24} />
                    )}
                    <span>{meeting?.newsletter_guide?.name}</span>
                  </>
                ) : (
                  <>
                    <img
                      height="24px"
                      width="24px"
                      style={{ borderRadius: "20px", objectFit: "cover", objectPosition: "top" }}
                      src={
                        item?.assigned_to_image?.startsWith("https") 
                          ? item?.assigned_to_image
                          : `${Assets_URL}/${item?.assigned_to_image}`
                      }
                      alt="Assignee"
                    />
                    <span>{item?.assigned_to_name || `${users?.firstName} ${users?.lastName}`}</span>
                  </>
                )}
              </span>
              <span className="d-flex align-items-center gap-2">
                <img height="16px" width="16px" src="/Assets/ion_time-outline.svg" alt="Time" />
                {item.time_unit === "days" ? (
                  <span>{formatStepDate(item?.start_date, item?.step_time, meeting?.timezone)}</span>
                ) : (
                  <span>
                    {formatStepDate(item?.start_date, item?.step_time, meeting?.timezone)} {t("at")} {convertTo24HourFormat(item?.step_time, item?.start_date, item?.time_unit, meeting?.timezone)}
                  </span>
                )}
              </span>
              <span>
             {item.time_taken === "0 sec"
  ? item.step_time || "0 sec"
  : localizeTimeTakenActive(item?.time_taken?.replace("-", "")) +
    (item?.time_taken ? " / " : " ") +
    (
      (item?.editor_type === "Story" && item?.time_unit === "days") 
        ? item.count2 + " " + (item.count2 > 1 ? "Story Points" : "Story Point")
        : item.count2 + " " + t(`time_unit.${item.time_unit}`)
    )
}
              </span>
            </Card.Text>
            {dropdownVisible && (
              <div className="dropdown-content-1 fade" ref={dropdownRef} style={{ display: "none" }}>
                <div className="dropdown-section-1" 
                >
                  {renderContent()}
                                                    <ReportMediaGallery stepMedias={getStepMedias()}  fromReport={true} />
                  
                  {isTranscribing && (
                    <div className="d-flex justify-content-center mt-3">
                      <div style={{ width: "50%" }}>
                        <ProgressBar now={transcriptionProgress} animated label={`${transcriptionProgress}%`} />
                      </div>
                    </div>
                  )}
                  {item?.note && (
                    <div className="mt-3 note-section" dangerouslySetInnerHTML={{ __html: item.note }} />
                  )}
                  {item.time_unit === "days" && item?.email_campaigns && renderCampaignDetails()}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderAccordionContent = () => (
    <Accordion.Item eventKey={index.toString()} className="accordion-item-custom">
      <Accordion.Header className="steps-header" onClick={toggleDropdown}>
        <div className="steps-header-content">
          <h5 className="mb-0">          {item?.order_no}. &nbsp; {item.title}</h5>
          <div className="steps-meta">
            <span>{t("Assignee")}: {item?.assigned_to_name || `${users?.firstName} ${users?.lastName}`}</span>
            <span>
              {t("Date")}: {formatStepDate(item?.start_date, item?.step_time, meeting?.timezone)}
              {item.time_unit !== "days" && (
                <> {t("at")} {convertTo24HourFormat(item?.step_time, item?.start_date, item?.time_unit, meeting?.timezone)}</>
              )}
            </span>
            <span>
              {t("Time Taken")}: {item.time_taken === "0 sec"
                ? item.step_time || "0 sec"
                : localizeTimeTakenActive(item?.time_taken?.replace("-", "")) +
                  (item?.time_taken ? " / " : " ") +
                 (item?.editor_type === "Story" && item?.time_unit === "days") ? (
    item.count2 + " " + (item.count2 > 1 ? "Story Points" : "Story Point")
    // or simply: item.count2 + " SP"
  ) : (
    item.count2 + " " + t(`time_unit.${item.time_unit}`)
  )}
            </span>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{t(`badge.${item.step_status}`)}</Tooltip>}
            >
              <span>
                {item.step_status === "completed" ? (
                  <span className="status-badge-completed">{t("badge.completed")}</span>
                ) : item.step_status === "in_progress" ? (
                  <span className={meeting?.delay >= "00d:00h:01m" ? "status-badge-red" : "status-badge-inprogress"}>
                    {t("badge.inprogress")}
                  </span>
                ) : item.step_status === "cancelled" || item.step_status === "abort" ? (
                  <span className="status-badge-red">{t("badge.cancel")}</span>
                ) : (
                  <span className="status-badge-upcoming">{t("badge.future")}</span>
                )}
              </span>
            </OverlayTrigger>
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body className="steps-body">
        {renderMediaPreview()}
        {renderContent()}
        {isTranscribing && (
          <div className="d-flex justify-content-center mt-3">
            <div style={{ width: "50%" }}>
              <ProgressBar now={transcriptionProgress} animated label={`${transcriptionProgress}%`} />
            </div>
          </div>
        )}
        {item?.note && (
          <div className="mt-3 note-section" dangerouslySetInnerHTML={{ __html: item.note }} />
        )}
        {item.time_unit === "days" && item?.email_campaigns && renderCampaignDetails()}
      </Accordion.Body>
    </Accordion.Item>
  );

  return isAccordion ? renderAccordionContent() : renderCardContent();
};

export default ReportStepCard;
