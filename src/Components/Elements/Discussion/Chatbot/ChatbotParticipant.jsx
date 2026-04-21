import React from "react";
import { Assets_URL } from "../../../Apicongfig";

function ChatbotParticipant({ selectedMoment }) {
  const participant = selectedMoment?.participants;

  if (!participant) {
    return (
      <div className="card rounded-0 h-100 border-0 shadow-sm">
        <div className="card-body text-center text-muted py-5">
          <i className="bi bi-people fs-1 mb-3"></i>
          <p className="mb-0">No participants found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .participants-card {
          height: 100%;
          min-height: 60vh;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .participants-header {
          background: transparent;
          border-bottom: 1px solid #dee2e6;
          padding: 0.75rem 1rem;
        }

        .participants-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0.75rem 1rem 0.75rem 0;
          margin: 0;
        }

        .participants-body::-webkit-scrollbar {
          width: 5px;
        }
        .participants-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .participant-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .participant-item:hover {
          background-color: #f8f9fa;
        }

        .participant-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          object-position: top;
          flex-shrink: 0;
          border: 2px solid #e9ecef;
        }

        .participant-info {
          flex: 1;
          min-width: 0;
        }

        .participant-name {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          color: #212529;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .participant-post,
        .participant-email {
          margin: 0;
          font-size: 0.8rem;
          color: #6c757d;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .participant-email {
          font-size: 0.75rem;
          color: #999;
        }

        @media (max-width: 576px) {
          .participants-card {
            height: auto;
            min-height: auto;
          }
          .participants-body {
            padding: 0.5rem 0.75rem 0.5rem 0;
          }
          .participant-avatar {
            width: 40px;
            height: 40px;
          }
          .participant-name {
            font-size: 0.9rem;
          }
          .participant-post,
          .participant-email {
            font-size: 0.75rem;
          }
          .participant-item {
            padding: 8px 10px;
            gap: 10px;
          }
        }

        @media (min-width: 768px) {
          .participants-card {
            min-height: 70vh;
          }
        }
      `}</style>

      <div className="card rounded-0 participants-card border-0 shadow-sm">
        <div className="participants-header">
          <h5 className="mb-0 fw-bold text-dark">Participant</h5>
        </div>
        <div className="participants-body">
          <div className="participant-item">
            <img
              src={
                participant.participant_image?.startsWith("http")
                  ? participant?.participant_image
                  : participant?.participant_image
                  ? `${Assets_URL}/${participant?.participant_image}`
                  : participant?.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      participant?.full_name || "User"
                    )}&background=0D8ABC&color=fff&size=48`
              }
              alt={participant?.full_name}
              className="participant-avatar"
            />
            <div className="participant-info">
              <h6 className="participant-name" title={participant?.full_name}>
                {participant?.full_name || "Unknown User"}
              </h6>
              <p className="participant-post">
                {participant?.post || participant?.role || "No role"}
              </p>
              <p className="participant-email" title={participant?.email}>
                {participant?.email || "No email"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatbotParticipant;