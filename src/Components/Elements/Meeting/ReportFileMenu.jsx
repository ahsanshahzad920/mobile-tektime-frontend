import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { IoDocumentOutline, IoVideocamOutline } from 'react-icons/io5';
import { MdOutlinePhotoSizeSelectActual } from 'react-icons/md';
import { PiFilePdfLight } from 'react-icons/pi';
import { RiFileExcel2Line } from 'react-icons/ri';
import { Tooltip } from 'antd';
import { Assets_URL } from '../../Apicongfig';

const ReportFileMenu = ({ meeting_files, openModal }) => {
  const [t] = useTranslation("global");

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '', time: '' };
    const dateObj = new Date(timestamp);
    const date = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return { date, time: `${hours}h${minutes}` };
  };

  return (
    <div className="container-fluid px-0">
      <div className="row g-3"> {/* Bootstrap responsive gap */}
        {meeting_files?.map((item, index) => {
          const { date, time } = formatDateTime(item?.created_at);

          return (
            <div key={item?.id} className="col-12">
              <Card
                className="shadow-sm border-0 step-card-meeting h-100"
                onClick={() => openModal(item)}
                style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden' }}
              >
                <Card.Body className="p-3 p-md-4 d-flex flex-column flex-md-row gap-3">
                  {/* Step Number */}
                  <div className="step-number-container flex-shrink-0 d-flex align-items-center justify-content-center">
                    <span className="step-number">
                      {index < 9 ? '0' : ''}{index + 1}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-grow-1 min-w-0"> {/* min-w-0 for text truncation */}
                    <div className="d-flex flex-column h-100">
                      {/* Meeting Title */}
                      <h6
                        className="text-muted mb-1"
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#8590a3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item?.meeting_title || 'Untitled Meeting'}
                      </h6>

                      {/* File Name + Type Badge */}
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <Tooltip title={item?.file_name} mouseEnterDelay={0.1}>
                          <h5
                            className="mb-0 fw-semibold text-truncate"
                            style={{
                              fontSize: '16px',
                              maxWidth: '100%',
                              display: 'block',
                            }}
                          >
                            {item?.file_name}
                          </h5>
                        </Tooltip>
                        <span className="status-badge-upcoming fs-6 px-2 py-1">
                          {item?.file_type?.split('/').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>

                      {/* Creator + Date + Size */}
                      <div className="d-flex flex-column gap-2 mt-auto text-muted small">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            height="20"
                            width="20"
                            className="rounded-circle"
                            src={
                              item?.creator?.image?.startsWith("http")
                                ? item?.creator?.image
                                : item?.creator?.image
                                ? `${Assets_URL}/${item?.creator?.image}`
                                : '/Assets/default-avatar.png'
                            }
                            alt="creator"
                          />
                          <span className="text-truncate" style={{ maxWidth: '150px' }}>
                            {item?.creator?.full_name || 'Unknown'}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-4 flex-wrap">
                          <div className="d-flex align-items-center gap-1">
                            <img height="14" width="14" src="/Assets/ion_time-outline.svg" alt="date" />
                            <span>{date} {t("at")} {time}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <img height="14" width="14" src="/Assets/alarm-invite.svg" alt="size" />
                            <span>{formatFileSize(item?.file_size)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Icon - Right Side */}
                  <div className="d-flex align-items-center justify-content-center flex-shrink-0">
                    <div className="file-img-container bg-light rounded p-3">
                      {item?.file_type?.includes("excel") || item?.file_type?.includes("spreadsheet") ? (
                        <RiFileExcel2Line size={40} color="#1e7e34" />
                      ) : item?.file_type === "application/pdf" ? (
                        <PiFilePdfLight size={40} color="#d32f2f" />
                      ) : item?.file_type?.includes("word") || item?.file_type?.includes("document") ? (
                        <IoDocumentOutline size={40} color="#2b579a" />
                      ) : item?.file_type?.startsWith("audio/") ? (
                        <img src="/Assets/audio-logo.png" alt="audio" height="50" />
                      ) : item?.file_type?.startsWith("video/") ? (
                        <IoVideocamOutline size={40} color="#5e35b1" />
                      ) : item?.file_type?.startsWith("image/") ? (
                        <MdOutlinePhotoSizeSelectActual size={40} color="#f9a825" />
                      ) : (
                        <IoDocumentOutline size={40} color="#607d8b" />
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportFileMenu;