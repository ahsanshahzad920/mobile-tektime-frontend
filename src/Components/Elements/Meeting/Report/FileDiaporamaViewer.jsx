import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  File as FileIcon,
  Presentation,
  RefreshCw,
  Play,
} from "lucide-react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import ReactPlayer from "react-player";
import { Assets_URL } from "../../../Apicongfig";

/* ------------------------------------------------------------------ */
/*  Base URL — file_path is a relative storage key (e.g.                */
/*  "meeting_files/xxx.pdf"). Point this at whatever base you already   */
/*  use elsewhere in the app to resolve storage paths into full URLs.   */
/*  Adjust the env var name / value to match your actual setup.         */
/* ------------------------------------------------------------------ */
const FILE_BASE_URL = Assets_URL || "";

const resolveFileUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // already a full URL
  const base = FILE_BASE_URL.replace(/\/+$/, "");
  const rel = path.replace(/^\/+/, "");
  return base ? `${base}/${rel}` : `/${rel}`;
};

/* ------------------------------------------------------------------ */
/*  File-type detection helpers                                       */
/* ------------------------------------------------------------------ */

// Supports both shapes: { file_url / url } (already a full URL) and
// { file_path } (relative storage key that needs FILE_BASE_URL prefixed).
const getFileUrl = (file) =>
  file?.file_url || file?.url || resolveFileUrl(file?.file_path) || "";

const getFileName = (file, index) =>
  file?.name || file?.file_name || `File ${index + 1}`;

const getExt = (url) => {
  if (!url) return "";
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
};

const EXT_MAP = {
  image: ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"],
  pdf: ["pdf"],
  video: ["mp4", "webm", "mov", "avi", "mkv", "m4v"],
  audio: ["mp3", "wav", "ogg", "m4a", "aac", "flac"],
  excel: ["xls", "xlsx", "csv"],
  word: ["doc", "docx"],
  ppt: ["ppt", "pptx"],
  text: ["txt"],
};

// Mime prefixes/values reported by the backend's file_type field.
const MIME_MAP = {
  image: ["image/"],
  pdf: ["application/pdf"],
  video: ["video/"],
  audio: ["audio/"],
  excel: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml",
    "text/csv",
  ],
  word: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml",
  ],
  ppt: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml",
  ],
  text: ["text/plain"],
};

const getFileType = (file) => {
  // 1) Trust the backend-provided mime type first (most reliable)
  const mime = file?.file_type || file?.mime_type || "";
  if (mime) {
    for (const [type, prefixes] of Object.entries(MIME_MAP)) {
      if (prefixes.some((p) => mime.startsWith(p))) return type;
    }
  }
  // 2) Fall back to sniffing the file extension from the URL/path
  const ext = getExt(getFileUrl(file) || file?.file_path || "");
  for (const [type, exts] of Object.entries(EXT_MAP)) {
    if (exts.includes(ext)) return type;
  }
  return "other";
};

const TYPE_META = {
  image: { icon: ImageIcon, color: "#ea4335" },
  pdf: { icon: FileText, color: "#ea4335" },
  video: { icon: FileVideo, color: "#8e24aa" },
  audio: { icon: FileAudio, color: "#1e8e3e" },
  excel: { icon: FileSpreadsheet, color: "#1e8e3e" },
  word: { icon: FileText, color: "#1a73e8" },
  ppt: { icon: Presentation, color: "#d24726" },
  text: { icon: FileText, color: "#5f6368" },
  other: { icon: FileIcon, color: "#5f6368" },
};

/* @cyntler/react-doc-viewer handles: pdf, docx, doc, xlsx, xls, csv, txt,
   images, and video (via its own renderers). ppt/pptx isn't natively
   supported by the library, so we fall back to Google Docs Viewer
   (needs the file to be reachable via a public URL). */
const DOC_VIEWER_TYPES = ["word", "excel", "text"];

/* ------------------------------------------------------------------ */
/*  Error boundary — DocViewer / third-party renderers throw on failed */
/*  fetches (network issues, blocked by an extension, CORS, 404, etc). */
/*  Without this, one bad file crashes the whole React tree (blank     */
/*  screen). We isolate the failure to just that single card/preview.  */
/* ------------------------------------------------------------------ */
class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    const errorMsg = error?.message || error?.toString() || "";
    const errorName = error?.name || "";
    if (
      errorName === "AbortError" ||
      errorMsg.toLowerCase().includes("aborted") ||
      errorMsg.toLowerCase().includes("signal is aborted")
    ) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const errorMsg = error?.message || error?.toString() || "";
    const errorName = error?.name || "";
    if (
      errorName === "AbortError" ||
      errorMsg.toLowerCase().includes("aborted") ||
      errorMsg.toLowerCase().includes("signal is aborted")
    ) {
      return;
    }
    // eslint-disable-next-line no-console
    console.error("File preview failed to load:", error, info);
  }

  componentDidUpdate(prevProps) {
    // Allow parent to force a retry by changing resetKey
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const FileDiaporamaViewer = ({ meeting_files = [] }) => {
  console.log("meeting_files:", meeting_files);

  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  // Tracks files whose img/video/player onError fired (native elements,
  // handled separately from the DocViewer error boundary above).
  const [loadErrors, setLoadErrors] = useState({});
  // Bumping a file's retry counter remounts its preview (both the native
  // element and the DocViewer error boundary) to try loading again.
  const [retryCounts, setRetryCounts] = useState({});

  const docViewerDocs = useMemo(() => {
    return meeting_files.map((file, index) => [
      {
        uri: getFileUrl(file),
        fileName: getFileName(file, index),
      },
    ]);
  }, [meeting_files]);

  const markLoadError = (index) =>
    setLoadErrors((prev) => (prev[index] ? prev : { ...prev, [index]: true }));

  const retry = (index, e) => {
    if (e) e.stopPropagation();
    setLoadErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setRetryCounts((prev) => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
  };

  const openDiaporama = (index) => setActiveIndex(index);
  const closeDiaporama = () => setActiveIndex(null);

  const showNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % meeting_files.length);
  };

  const showPrev = (e) => {
    e.stopPropagation();
    setActiveIndex(
      (prev) => (prev - 1 + meeting_files.length) % meeting_files.length,
    );
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % meeting_files.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex(
          (prev) => (prev - 1 + meeting_files.length) % meeting_files.length,
        );
      } else if (e.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, meeting_files.length]);

  /* ------------------------------ Styles ---------------------------- */
  const styles = useMemo(
    () => ({
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "20px",
        padding: "15px 0",
      },
      card: (index) => ({
        background: "#fff",
        border: "1px solid #dadce0",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        height: "260px",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: hoveredIndex === index ? "translateY(-2px)" : "none",
        boxShadow:
          hoveredIndex === index ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
      }),
      cardHeader: {
        display: "flex",
        alignItems: "center",
        padding: "10px",
        background: "#fff",
        borderBottom: "1px solid #f1f3f4",
        gap: "8px",
      },
      fileName: {
        fontSize: "13px",
        fontWeight: 500,
        color: "#3c4043",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      cardPreview: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f3f4",
        overflow: "hidden",
        position: "relative",
      },
      previewImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
      previewIframeMuted: {
        width: "100%",
        height: "100%",
        border: "none",
        // pointerEvents: "none",
      },
      videoPlayOverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      },

      docViewerWrapThumb: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      },
      docViewerWrapFullscreen: {
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 4px 25px rgba(0,0,0,0.6)",
      },
      playerWrapFullscreen: {
        width: "100%",
        height: "100%",
        background: "#000",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 4px 25px rgba(0,0,0,0.6)",
      },
      audioFullscreenBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#1c1c1c",
        borderRadius: "12px",
        padding: "50px 40px",
      },
      fallbackContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      },
      retryBtn: {
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "#1a73e8",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        cursor: "pointer",
      },
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(20, 20, 20, 0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      },
      closeBtn: {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.5)",
        border: "none",
        color: "#fff",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2100,
      },
      navBtn: (side) => ({
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: "30px",
        background: "rgba(255, 255, 255, 0.1)",
        border: "none",
        color: "#fff",
        borderRadius: "50%",
        padding: "12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2100,
      }),
      content: {
        position: "relative",
        width: "75%",
        height: "80%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      mediaFullscreen: {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
        boxShadow: "0 4px 25px rgba(0,0,0,0.6)",
        borderRadius: "4px",
      },
      iframeFullscreen: {
        width: "100%",
        height: "100%",
        background: "#fff",
        border: "none",
        borderRadius: "4px",
        boxShadow: "0 4px 25px rgba(0,0,0,0.6)",
      },
      caption: {
        marginTop: "15px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "500",
      },
    }),
    [hoveredIndex],
  );

  const renderFailedState = (isFullscreen, index) => (
    <div style={styles.fallbackContainer}>
      <FileIcon size={isFullscreen ? 64 : 40} style={{ color: "#d93025" }} />
      <span
        style={{
          color: isFullscreen ? "#fff" : "#3c4043",
          fontSize: "12px",
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        Failed to load preview
      </span>
      <button style={styles.retryBtn} onClick={(e) => retry(index, e)}>
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  );

  /* ---------------- Preview renderer (used for both grid card & modal) --- */
  const renderPreviewContent = (file, index, isFullscreen = false) => {
    const url = getFileUrl(file);
    const name = getFileName(file, index);
    const type = getFileType(file);
    const retryKey = retryCounts[index] || 0;

    // No usable URL at all — nothing we can do, show a clear message.
    if (!url) {
      return (
        <div style={styles.fallbackContainer}>
          <FileIcon
            size={isFullscreen ? 64 : 40}
            style={{ color: "#5f6368" }}
          />
          <span
            style={{
              color: isFullscreen ? "#fff" : "#3c4043",
              fontSize: "12px",
              marginTop: "8px",
            }}
          >
            No file URL available
          </span>
        </div>
      );
    }

    // A native element (img/video/player) already reported an error.
    if (loadErrors[index]) {
      return renderFailedState(isFullscreen, index);
    }

    if (type === "image") {
      return (
        <img
          key={retryKey}
          src={url}
          alt={name}
          style={isFullscreen ? styles.mediaFullscreen : styles.previewImg}
          onError={() => markLoadError(index)}
        />
      );
    }

    if (type === "video") {
      if (isFullscreen) {
        return (
          <div style={styles.playerWrapFullscreen}>
            <ReactPlayer
              key={retryKey}
              url={url}
              width="100%"
              height="100%"
              controls
              playing={false}
              onError={() => markLoadError(index)}
            />
          </div>
        );
      }
      // Lightweight native <video> thumbnail (browser auto-shows first frame)
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <video
            key={retryKey}
            src={url}
            muted
            preload="metadata"
            playsInline
            style={styles.previewImg}
            onError={() => markLoadError(index)}
          />
          <div style={styles.videoPlayOverlay}>
            <Play
              size={22}
              color="#fff"
              fill="#fff"
              style={{ marginLeft: "2px" }}
            />
          </div>
        </div>
      );
    }

    if (type === "audio") {
      if (isFullscreen) {
        return (
          <div style={styles.audioFullscreenBox}>
            <FileAudio
              size={64}
              style={{ color: "#1e8e3e", marginBottom: 20 }}
            />
            <ReactPlayer
              key={retryKey}
              url={url}
              controls
              height={54}
              width={340}
              onError={() => markLoadError(index)}
            />
          </div>
        );
      }
      return (
        <div style={styles.fallbackContainer}>
          <FileAudio size={40} style={{ color: "#1e8e3e" }} />
        </div>
      );
    }

    if (type === "pdf") {
      // Native browser PDF renderer via iframe — doesn't depend on the
      // server's Content-Type header, unlike DocViewer's own detection.
      return (
        <PreviewErrorBoundary
          resetKey={retryKey}
          fallback={renderFailedState(isFullscreen, index)}
        >
          <iframe
            key={retryKey}
            src={`${url}#toolbar=${isFullscreen ? 1 : 0}&navpanes=0&scrollbar=${isFullscreen ? 1 : 0}`}
            title={name}
            style={
              isFullscreen ? styles.iframeFullscreen : styles.previewIframeMuted
            }
            frameBorder="0"
            onError={() => markLoadError(index)}
          />
        </PreviewErrorBoundary>
      );
    }

    if (type === "ppt") {
      // Fallback via Google Docs / Office online viewer (file must be public)
      return (
        <PreviewErrorBoundary
          resetKey={retryKey}
          fallback={renderFailedState(isFullscreen, index)}
        >
          <iframe
            key={retryKey}
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            title={name}
            style={
              isFullscreen ? styles.iframeFullscreen : styles.previewIframeMuted
            }
            frameBorder="0"
            onError={() => markLoadError(index)}
          />
        </PreviewErrorBoundary>
      );
    }

   if (DOC_VIEWER_TYPES.includes(type)) {
  // Thumbnail: don't mount a live DocViewer instance — it triggers
  // repeated fetch/abort cycles on every re-render and causes the
  // "signal is aborted without reason" crash. Show a static icon
  // instead; the real DocViewer only loads in fullscreen mode.
  if (!isFullscreen) {
    const Meta = TYPE_META[type] || TYPE_META.other;
    return (
      <div style={styles.fallbackContainer}>
        <Meta.icon size={40} style={{ color: Meta.color }} />
        <span
          style={{
            color: "#3c4043",
            fontSize: "12px",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          {name}
        </span>
      </div>
    );
  }

  const docs = docViewerDocs[index];
  return (
    <PreviewErrorBoundary
      resetKey={retryKey}
      fallback={renderFailedState(isFullscreen, index)}
    >
      <div style={styles.docViewerWrapFullscreen}>
        <DocViewer
          key={retryKey}
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ width: "100%", height: "100%" }}
          config={{
            header: {
              disableHeader: false,
              disableFileName: false,
              retainURLParams: false,
            },
            pdfZoom: { defaultZoom: 1, zoomJump: 0.2 },
            csvDelimiter: ",",
          }}
        />
      </div>
    </PreviewErrorBoundary>
  );
}

    // Unknown / unsupported type
    const Meta = TYPE_META.other;
    return (
      <div style={styles.fallbackContainer}>
        <Meta.icon
          size={isFullscreen ? 64 : 40}
          style={{ color: Meta.color }}
        />
        <span
          style={{
            color: isFullscreen ? "#fff" : "#3c4043",
            fontSize: "12px",
            marginTop: "8px",
          }}
        >
          Preview not available
        </span>
      </div>
    );
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Grid layout */}
      <div style={styles.grid}>
        {meeting_files.map((file, index) => {
          const fileName = getFileName(file, index);
          const type = getFileType(file);
          const Meta = TYPE_META[type] || TYPE_META.other;

          return (
            <div
              key={index}
              style={styles.card(index)}
              onClick={() => openDiaporama(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={styles.cardHeader}>
                <Meta.icon
                  size={16}
                  style={{ color: Meta.color, flexShrink: 0 }}
                />
                <span style={styles.fileName} title={fileName}>
                  {fileName}
                </span>
              </div>
              <div style={styles.cardPreview}>
                {renderPreviewContent(file, index, false)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Slider Overlay */}
      {activeIndex !== null && (
        <div style={styles.overlay} onClick={closeDiaporama}>
          <button
            style={styles.closeBtn}
            onClick={closeDiaporama}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <button
            style={styles.navBtn("left")}
            onClick={showPrev}
            aria-label="Previous"
          >
            <ChevronLeft size={36} />
          </button>

          <div style={styles.content} onClick={(e) => e.stopPropagation()}>
            {renderPreviewContent(
              meeting_files[activeIndex],
              activeIndex,
              true,
            )}
            <div style={styles.caption}>
              {getFileName(meeting_files[activeIndex], activeIndex)} (
              {activeIndex + 1} / {meeting_files.length})
            </div>
          </div>

          <button
            style={styles.navBtn("right")}
            onClick={showNext}
            aria-label="Next"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDiaporamaViewer;
