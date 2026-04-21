import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Image } from "react-bootstrap";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdClose,
  MdPlayArrow,
  MdPause,
  MdOutlinePhotoSizeSelectActual,
} from "react-icons/md";
import { Assets_URL } from "../../../Apicongfig";

const ReportMediaGallery = ({ stepMedias = [], fromReport = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  //   // Filter valid media files
  //   const validMedias = stepMedias?.filter(media =>
  //     media.file && (media.file_type === 'image' || media.file_type === 'video')
  //   ) || [];

  const currentMedia = stepMedias[currentMediaIndex];
  const openModal = (index) => {
    setCurrentMediaIndex(index);
    setShowModal(true);
    setIsPlaying(false);
  };

  const closeModal = () => {
    
    setShowModal(false);
    setIsPlaying(false);
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === stepMedias.length - 1 ? 0 : prev + 1
    );
    setIsPlaying(false);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? stepMedias.length - 1 : prev - 1
    );
    setIsPlaying(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;

      switch (e.key) {
        case "ArrowLeft":
          prevMedia();
          break;
        case "ArrowRight":
          nextMedia();
          break;
        case "Escape":
          closeModal();
          break;
        case " ":
          if (currentMedia?.file_type === "video") {
            e.preventDefault();
            setIsPlaying((prev) => !prev);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, currentMedia]);

  const handleVideoPlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  if (stepMedias.length === 0) {
    return null;
  }

  return (
    <>
      {/* Media Gallery Grid */}
      <div className={`media-gallery ${fromReport ? "mt-3" : ""}`}>
        <h6 className="mb-3">
          <MdOutlinePhotoSizeSelectActual className="me-2" />
          Media Gallery ({stepMedias.length})
        </h6>

        <Row className="g-2">
          {stepMedias?.map((media, index) => (
            <Col xs={6} md={4} lg={3} key={media.id || index}>
              <div
                className="media-thumbnail-wrapper position-relative"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(index);
                }}
                style={{ cursor: "pointer" }}
              >
                {media.file_type === "image" ? (
                  <Image
                    src={media.file_url}
                    alt={`Media ${index + 1}`}
                    fluid
                    className="media-thumbnail"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  />
                ) : (
                  <div
                    className="video-thumbnail position-relative"
                    style={{
                      width: "100%",
                      height: "120px",
                      borderRadius: "8px",
                      backgroundColor: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <video
                      src={media.file_url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      className="position-absolute top-50 start-50 translate-middle"
                      style={{ color: "white", fontSize: "2rem" }}
                    >
                      <MdPlayArrow />
                    </div>
                  </div>
                )}

                {/* Media type badge */}
                <div
                  className="position-absolute bottom-0 end-0 m-1"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                  }}
                >
                  {media.file_type === "image" ? "IMG" : "VID"}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Full Screen Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        className="media-fullscreen-modal"
        fullscreen
      >
        <Modal.Header
          className="border-0 position-absolute top-0 end-0 z-3"
          style={{ background: "transparent" }}
        >
          <Button
            variant="light"
            onClick={closeModal}
            className="rounded-circle"
            style={{ width: "51px", height: "51px" }}
          >
            <MdClose size={25} />
          </Button>
        </Modal.Header>

        <Modal.Body className="d-flex align-items-center justify-content-center p-0 bg-dark">
          {/* Navigation Arrows */}
          {stepMedias.length > 1 && (
            <>
              <Button
                variant="light"
                onClick={(e)=>{
                    e.stopPropagation();
                    prevMedia();
                }}
                className="position-absolute start-0 top-50 translate-middle-y rounded-circle m-3"
                style={{
                  width: "50px",
                  height: "50px",
                  opacity: 0.8,
                }}
              >
                <MdKeyboardArrowLeft size={24} />
              </Button>

              <Button
                variant="light"
                onClick={(e)=>{
                    e.stopPropagation();
                    nextMedia()
                }}
                className="position-absolute end-0 top-50 translate-middle-y rounded-circle m-3"
                style={{
                  width: "50px",
                  height: "50px",
                  opacity: 0.8,
                }}
              >
                <MdKeyboardArrowRight size={24} />
              </Button>
            </>
          )}

          {/* Media Display */}
          <div className="media-display-container text-center">
            {currentMedia?.file_type === "image" ? (
              <Image
                src={currentMedia.file_url}
                alt="Full screen media"
                style={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div className="position-relative">
                <video
                  src={currentMedia.file_url}
                  controls
                  autoPlay={isPlaying}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "90vh",
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Custom play/pause button for better UX */}
                {!isPlaying && (
                  <Button
                    variant="light"
                    className="position-absolute top-50 start-50 translate-middle rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      opacity: 0.8,
                    }}
                    onClick={handleVideoPlayPause}
                  >
                    <MdPlayArrow size={30} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Media Counter */}
          <div
            className="position-absolute bottom-0 start-50 translate-middle-x mb-3"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.9rem",
            }}
          >
            {currentMediaIndex + 1} / {stepMedias.length}
          </div>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .media-thumbnail-wrapper:hover .media-thumbnail {
          transform: scale(1.05);
        }

        .media-fullscreen-modal .modal-content {
          background: transparent;
          border: none;
        }

        .media-fullscreen-modal .modal-body {
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .media-thumbnail-wrapper {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default ReportMediaGallery;
