import React from "react";
import { useTranslation } from "react-i18next";
import { SiChatbot } from "react-icons/si";
import { FaChevronRight } from "react-icons/fa";
import moment from "moment";

function ChatbotMoments({ meetingsData, onMomentSelect, selectedMoment }) {
  const moments = meetingsData || [];
  const [t] = useTranslation("global");

  if (!moments.length)
    return <div className="p-3 text-center text-muted">No moments found</div>;

  // WhatsApp-style date format: time for today, "Hier" for yesterday, short date otherwise
  const formatMomentDate = (dateStr) => {
    if (!dateStr) return "";
    const date = moment.utc(dateStr).local();
    const now = moment();
    if (date.isSame(now, 'day')) return date.format('HH:mm');
    if (date.isSame(now.clone().subtract(1, 'day'), 'day')) return "Hier";
    return date.format('DD/MM/YYYY');
  };

  // Function to truncate title to maximum 6 sentences
  const truncateTitle = (title) => {
    if (!title) return "";
    const sentences = title.split(/(?<=[.!?])\s+/);
    if (sentences.length <= 6) return title;
    const truncated = sentences.slice(0, 6).join(" ");
    return truncated.replace(/[.!?]+$/, "") + "...";
  };

  return (
    <>
      <style>{`
        .moments-card {
          height: 100%;
          min-height: 60vh;
          max-height: 90vh;
        }
        .moments-list {
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 8px;
          max-height: calc(90vh - 100px);
        }
        .moments-list::-webkit-scrollbar {
          width: 6px;
        }
        .moments-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .moments-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        /* Desktop Styles (Original) */
        @media (min-width: 768px) {
          .moment-item {
            border-left: 3px solid transparent;
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
            min-height: 70px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 1rem;
            background: #fff;
            border-bottom: 1px solid #eee;
          }
          .moment-item:hover {
            background-color: #f8f9fa !important;
          }
          .moment-item.selected {
            border-left-color: #0d6efd;
            background-color: #f5f8ff !important;
          }
          .moment-title {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
            max-width: 250px;
          }
          .moment-subtitle {
             font-size: 0.8rem;
             color: #6c757d;
             white-space: nowrap;
             overflow: hidden;
             text-overflow: ellipsis;
          }
          .moment-date {
             font-size: 0.75rem;
             color: #adb5bd;
             margin-top: 4px;
          }
          .moment-icon-box { display: none; }
          .mobile-chevron { display: none; }
        }

        /* Professional Mobile Styles (WhatsApp-style) */
        @media (max-width: 767px) {
          .moments-list {
            max-height: 100%;
            height: 100%;
            padding: 10px 4px 12px 0px;
            overflow-y: auto;
          }
          .moment-item {
            background: #ffffff;
            border: none;
            border-bottom: 1px solid #f0f0f0;
            border-radius: 0 !important;
            margin-bottom: 0;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .moment-item.selected {
            background-color: #f0f7ff !important;
          }
          .moment-icon-box {
            width: 54px;
            height: 54px;
            background: #e8f0fe;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            flex-shrink: 0;
            color: #0d6efd;
          }
          .moment-item .moment-title {
            font-size: 1.05rem;
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
            font-weight: 700;
          }
          .moment-item .moment-subtitle {
            font-size: 0.9rem;
            color: #666;
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
            line-height: 1.3;
          }
          .moment-date {
            font-size: 0.72rem;
            margin-left: 8px;
          }
          .badge.bg-primary {
            background: #25D366 !important;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            padding: 0;
          }
        }
      `}</style>

      <div className="card rounded-0 moments-card shadow-sm border-0">
        <div className="card-body p-0 p-md-3">
          <h5 className="mb-3 fw-bold text-dark d-none d-md-block px-3">
            Moments
          </h5>

          <div className="moments-list">
            {moments.map((meeting) => {
              const displayTitle = truncateTitle(meeting.title || "");
              const objective =
                meeting?.destination?.destination_name || "Chatbot";

              return (
                <div
                  key={meeting.id}
                  className={`moment-item ${selectedMoment?.id === meeting.id ? "selected" : ""}`}
                  onClick={() => onMomentSelect(meeting)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Icon Column (Mobile Only) */}
                  <div className="moment-icon-box">
                    <SiChatbot size={24} />
                  </div>

                  {/* Content Column */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="moment-title mb-0">{displayTitle}</h6>
                      <span className="moment-date">
                        {formatMomentDate(meeting.sent_date_time || meeting.date)}
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-end">
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="moment-subtitle mb-0">{objective}</div>
                      </div>

                      {meeting.unread_messages_count > 0 && (
                        <span className="badge rounded-pill bg-primary ms-2 shrink-0">
                          {meeting.unread_messages_count}
                        </span>
                      )}

                      <div className="mobile-chevron d-md-none ms-2">
                        <FaChevronRight size={12} color="#999" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatbotMoments;
