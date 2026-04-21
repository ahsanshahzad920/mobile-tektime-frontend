import React, { useState, useEffect } from 'react';
import { 
  FaTrashAlt, 
  FaSpinner, 
  FaExpandAlt, 
  FaTimes,
  FaImage,
  FaVideo,
  FaPlayCircle,
  FaClock,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const MediaGallery = ({ 
  stepMedias = [], 
  onDeleteMedia, 
  deletingMediaId = null,
  fromReport = false
}) => {
  const formatFileSize = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 o';
    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  };

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedMedia) return;

      switch (e.key) {
        case 'Escape':
          setSelectedMedia(null);
          break;
        case 'ArrowLeft':
          navigateMedia('prev');
          break;
        case 'ArrowRight':
          navigateMedia('next');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia]);

  const navigateMedia = (direction) => {
    if (!selectedMedia || stepMedias.length <= 1) return;

    const currentIndex = stepMedias.findIndex(media => media.id === selectedMedia.id);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % stepMedias.length;
    } else {
      newIndex = (currentIndex - 1 + stepMedias.length) % stepMedias.length;
    }

    setSelectedMedia(stepMedias[newIndex]);
  };

  const handleDeleteClick = (e, media) => {
    e.stopPropagation();
    e.preventDefault();
    setMediaToDelete(media);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (mediaToDelete && onDeleteMedia) {
      await onDeleteMedia(mediaToDelete.id);
      setShowDeleteModal(false);
      setMediaToDelete(null);
    }
  };

  if (!stepMedias || stepMedias.length === 0) {
    return (
      <div className="text-center py-5 my-5">
        <div className="display-1 text-muted mb-3">No media</div>
        <p className="text-muted">Aucun média disponible</p>
      </div>
    );
  }

  // Agar report mode hai → simple compact grid
  if (fromReport) {
    if (!stepMedias || stepMedias.length === 0) {
      return null;
    }

    return (
      <>
        {/* Compact Grid - Report ke liye */}
        <div className="mt-4">
          <div className="row g-3">
            {stepMedias.map((media) => (
              <div key={media.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className="position-relative rounded-3 overflow-hidden shadow-sm bg-dark bg-gradient"
                  style={{
                    height: '160px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onClick={() => setSelectedMedia(media)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {media.file_type?.includes('image') ? (
                    <img
                      src={media.file_url}
                      alt={media.original_name}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <video
                      src={media.file_url}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      muted
                      loop
                      poster={media.thumbnail_url || ''}
                    />
                  )}

                  {/* Video Play Icon */}
                  {media.file_type?.includes('video') && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <FaPlayCircle size={44} className="text-white opacity-80 drop-shadow" />
                    </div>
                  )}

                  {/* Fullscreen Hint */}
                  <div className="position-absolute top-2 end-2 bg-black bg-opacity-60 rounded p-2">
                    <FaExpandAlt className="text-white" size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Fullscreen Modal with Navigation */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-[99999] flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur hover:bg-white transition-all"
              onClick={() => setSelectedMedia(null)}
            >
              <FaTimes size={28} />
            </button>

            {/* Navigation Arrows - Only show if multiple media */}
            {stepMedias.length > 1 && (
              <>
                <button
                  className="absolute left-4 z-[99999] flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur hover:bg-white transition-all transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMedia('prev');
                  }}
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-4 z-[99999] flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl backdrop-blur hover:bg-white transition-all transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMedia('next');
                  }}
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}

            {/* Counter */}
            {stepMedias.length > 1 && (
              <div className="absolute top-4 left-4 z-[99999] bg-black/70 text-white px-4 py-2 rounded-full text-lg font-semibold backdrop-blur">
                {(stepMedias.findIndex(media => media.id === selectedMedia.id) + 1)} / {stepMedias.length}
              </div>
            )}

            {/* Main Media Container */}
            <div
              className="relative w-full h-full flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.file_type?.includes('image') ? (
                <img
                  src={selectedMedia.file_url}
                  alt="Fullscreen"
                  className="max-w-full max-h-full object-contain select-none"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  draggable={false}
                />
              ) : (
                <video
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                  src={selectedMedia.file_url}
                  draggable={false}
                >
                  <source src={selectedMedia.file_url} type={selectedMedia.file_type} />
                </video>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-2">Media Gallery</h2>
          <p className="text-muted">
            {stepMedias.length} fichier{stepMedias.length > 1 ? 's' : ''} • Images & Vidéos
          </p>
        </div>
        <div className="d-flex gap-3">
          <span className="badge bg-primary-subtle text-primary px-4 py-2 rounded-pill fs-6">
            <FaImage className="me-2" />
            {stepMedias.filter(m => m.file_type?.includes('image')).length}
          </span>
          <span className="badge bg-danger-subtle text-danger px-4 py-2 rounded-pill fs-6">
            <FaVideo className="me-2" />
            {stepMedias.filter(m => m.file_type?.includes('video')).length}
          </span>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="row g-4">
        {stepMedias.map((media) => (
          <div key={media.id} className="col-xl-4 col-lg-6 col-md-6">
            {/* Main Card */}
            <div
              className="position-relative rounded-4 overflow-hidden shadow-lg bg-dark bg-gradient"
              style={{
                height: '320px',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
              }}
              onClick={() => setSelectedMedia(media)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              {/* Delete Button */}
              {!fromReport && <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDeleteClick(e, media);
                }}
                className="position-absolute top-0 end-0 btn btn-danger btn-sm rounded-pill shadow-lg m-3"
                style={{ width: '40px', height: '40px', zIndex: 10 }}
              >
                {deletingMediaId === media.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrashAlt />
                )}
              </button>}

              {/* Fullscreen Hint */}
              <div className="position-absolute top-0 start-0 m-3">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-pill p-2" style={{ zIndex: 5 }}>
                  <FaExpandAlt className="text-white" />
                </div>
              </div>

              {/* Media Content */}
              {media.file_type?.includes('image') ? (
                <img
                  src={media.file_url}
                  alt={media.original_name}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <video
                  src={media.file_url}
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                  muted
                  loop
                  poster={media.thumbnail_url || ''}
                />
              )}

              {/* Overlay Info */}
              <div
                className="position-absolute bottom-0 start-0 w-100 p-4"
                style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                }}
              >
                <h6 className="text-white fw-bold text-truncate mb-2">
                  {media.original_name || media.file_name || 'Sans nom'}
                </h6>
                <div className="d-flex align-items-center gap-3 text-white-50 small">
                  {media.file_type?.includes('image') ? <FaImage /> : <FaVideo />}
                  <span className="mx-1">•</span>
                  <span>{formatFileSize(media.file_size)}</span>
                  {media.duration && (
                    <>
                      <span className="mx-1">•</span>
                      <FaClock className="me-1" />
                      <span>{media.duration}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Play Icon for Video */}
              {media.file_type?.includes('video') && (
                <div className="position-absolute top-50 start-50 translate-middle">
                  <FaPlayCircle size={64} className="text-white opacity-75" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Fullscreen Modal with Navigation */}
      {selectedMedia && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-95 d-flex align-items-center justify-content-center"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedMedia(null)}
        >
          {/* Close Button */}
          <button
            className="position-absolute top-0 end-0 btn btn-light rounded-circle m-4 shadow-lg"
            style={{ width: '50px', height: '50px', zIndex: 99999 }}
            onClick={() => setSelectedMedia(null)}
          >
            <FaTimes size={22} />
          </button>

          {/* Navigation Arrows - Only show if multiple media */}
          {stepMedias.length > 1 && (
            <>
              <button
                className="position-absolute start-0 btn btn-light rounded-circle m-4 shadow-lg"
                style={{ width: '50px', height: '50px', zIndex: 99999 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia('prev');
                }}
              >
                <FaChevronLeft size={22} />
              </button>
              <button
                className="position-absolute end-0 btn btn-light rounded-circle m-4 shadow-lg"
                style={{ width: '50px', height: '50px', zIndex: 99999 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia('next');
                }}
              >
                <FaChevronRight size={22} />
              </button>
            </>
          )}

          {/* Counter */}
          {stepMedias.length > 1 && (
            <div className="position-absolute top-0 start-0 m-4 bg-dark text-white px-3 py-2 rounded-pill z-[99999]">
              {(stepMedias.findIndex(media => media.id === selectedMedia.id) + 1)} / {stepMedias.length}
            </div>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            {selectedMedia.file_type?.includes('image') ? (
              <img
                src={selectedMedia.file_url}
                alt="Fullscreen"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              />
            ) : (
              <video
                controls
                autoPlay
                playsInline
                className="rounded-4 shadow-lg"
                style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                src={selectedMedia.file_url}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-80 d-flex align-items-center justify-content-center" 
          style={{ zIndex: 9999 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-4 shadow-2xl p-5 text-center" 
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <FaExclamationTriangle className="text-danger" size={60} />
            <h4 className="fw-bold mt-3">Supprimer ce média ?</h4>
            <p className="text-muted mt-2">
              {mediaToDelete?.original_name || 'Ce fichier'} sera définitivement supprimé.
            </p>
            <div className="d-flex gap-3 justify-content-center mt-4">
              <button 
                className="btn btn-secondary px-4" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingMediaId === mediaToDelete?.id}
              >
                Annuler
              </button>
              <button 
                className="btn btn-danger px-5" 
                onClick={confirmDelete}
                disabled={deletingMediaId === mediaToDelete?.id}
              >
                {deletingMediaId === mediaToDelete?.id ? (
                  <>
                    <FaSpinner className="animate-spin me-2" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default MediaGallery;