import React, { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";
import {
  FaCompress,
  FaExpand,
  FaPaperclip,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import { Button, Space, Typography, Badge, Card } from "antd";

const { Text } = Typography;

const isMobile = window.innerWidth <= 768;

const MessageTypeWritterReport = ({
  onSendMessage,
  disabled,
  editorRef,
  isEditing,
  onCancelEdit,
  participants,
  onFileUpload,
  attachments,
  onRemoveAttachment,
  isExpanded,
  setIsExpanded,
}) => {
  const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API;
  const [t] = useTranslation("global");
  const fileInputRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const FALLBACK_IMAGE = "https://via.placeholder.com/24";
  const participantsRef = useRef([]);

  useEffect(() => {
    const getUniqueParticipants = (p) => {
      if (!p || p.length === 0) return [];
      return p.filter(
        (part, idx, self) =>
          idx ===
          self.findIndex((p2) =>
            p2.email ? p2.email === part.email : p2.id === part.id,
          ),
      );
    };
    participantsRef.current = getUniqueParticipants(participants);
  }, [participants]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      if (content.trim() || (attachments && attachments.length > 0)) {
        onSendMessage({ message: content });
        editorRef.current.setContent("");
        if (setIsExpanded) setIsExpanded(false);
      }
    }
  };

  const uploadToCloudinary = async (blobInfo) => {
    const formData = new FormData();
    formData.append("file", blobInfo.blob(), blobInfo.filename());
    formData.append("upload_preset", "chat-application");
    formData.append("cloud_name", "drrk2kqvy");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/drrk2kqvy/image/upload`,
      { method: "POST", body: formData },
    );
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  const handleEditorInit = (evt, editor) => {
    editorInstanceRef.current = editor;
    if (editorRef) editorRef.current = editor;
  };

  const handleFileChange = (e) => {
    if (e.target?.files) onFileUpload(e);
    e.target.value = null;
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <style>{`
        .message-type-writter-report-container .tox-tinymce {
          height: ${isExpanded ? "calc(100vh - 160px)" : isMobile ? "120px" : "300px"} !important;
          min-height: unset !important;
          border-radius: 6px !important;
        }
        .message-type-writter-report-container .tox .tox-edit-area,
        .message-type-writter-report-container .tox .tox-edit-area__iframe {
          height: ${isExpanded ? "calc(100vh - 205px)" : isMobile ? "120px" : "130px"} !important;
          min-height: unset !important;
        }
      `}</style>

      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 9998,
          }}
        />
      )}

      <div
        className="message-type-writter-report-container"
        style={{
          zIndex: isExpanded ? 9999 : 1,
          backgroundColor: "#fff",
          borderRadius: isExpanded ? "16px 16px 0 0" : "12px",
          boxShadow: isExpanded
            ? "0 -8px 32px rgba(0,0,0,0.2)"
            : "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #e8e8e8",
          padding: isMobile ? "8px" : "12px",
          ...(isExpanded
            ? {
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "90vh",
                display: "flex",
                flexDirection: "column",
                padding: "16px",
                borderRadius: "16px 16px 0 0",
              }
            : {}),
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-1">
          <Text strong style={{ fontSize: isMobile ? "0.8rem" : "1rem" }}>
            {isEditing ? t("Edit Message") : t("New Message")}
          </Text>
          <Button
            type="text"
            size="small"
            icon={
              isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />
            }
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? t("Collapse") : t("Expand")}
          />
        </div>

        {/* Attachments Preview */}
        {attachments?.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-2">
            {attachments.map((file, idx) => (
              <Badge
                key={idx}
                count={
                  <Button
                    type="primary"
                    danger
                    shape="circle"
                    size="small"
                    icon={<FaTimes style={{ fontSize: "8px" }} />}
                    onClick={() => onRemoveAttachment(idx)}
                  />
                }
                offset={[-2, 2]}
              >
                <Card size="small" className="bg-light">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ height: "40px", objectFit: "cover" }}
                    />
                  ) : (
                    <Space>
                      <FaPaperclip />
                      <Text
                        ellipsis
                        style={{ maxWidth: 80, fontSize: "0.75rem" }}
                      >
                        {file.name}
                      </Text>
                    </Space>
                  )}
                </Card>
              </Badge>
            ))}
          </div>
        )}

        {/* Editor — flex-grow in expanded mode */}
        <div style={isExpanded ? { flex: 1, overflow: "hidden" } : {}}>
          <Editor
            apiKey={TINYMCE_API_KEY}
            onInit={handleEditorInit}
            initialValue=""
            init={{
              height: 100,
              menubar: false,
              plugins:
                "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
              toolbar: isMobile
                ? "bold italic"
                : "undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | help",
              statusbar: false,
              setup: (editor) => {
                editor.ui.registry.addAutocompleter("mentions", {
                  ch: "@",
                  minChars: 0,
                  fetch: (query) => {
                    const results = participantsRef.current
                      .filter((p) =>
                        p.full_name
                          ?.toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((p) => ({
                        value: p.id.toString(),
                        text: p.full_name || "Utilisateur",
                        custom: `<div style="display:flex;align-items:center;gap:8px;padding:4px;">
                          <img src="${
                            p.participant_image?.startsWith("http")
                              ? p.participant_image
                              : p.participant_image
                                ? `${Assets_URL}/${p.participant_image.replace(/^\//, "")}`
                                : FALLBACK_IMAGE
                          }" style="width:20px;height:20px;border-radius:50%;" />
                          <span>${p.full_name}</span>
                        </div>`,
                      }));
                    return Promise.resolve(results);
                  },
                  onAction: (api, rng, value) => {
                    const p = participantsRef.current.find(
                      (p) => p.id.toString() === value,
                    );
                    editor.selection.setRng(rng);
                    editor.insertContent(
                      `<span class="mention" style="color:#1890ff;background:#e6f7ff;padding:2px 4px;border-radius:4px;">@${p.full_name}</span> `,
                    );
                    api.hide();
                  },
                });
              },
              images_upload_handler: async (blob) =>
                await uploadToCloudinary(blob),
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; font-size: 14px }',
            }}
          />
        </div>

        {/* Footer Actions */}
        <div
          className="d-flex align-items-center justify-content-between mt-1 gap-2"
          style={isExpanded ? { marginTop: "12px", flexShrink: 0 } : {}}
        >
          <Space size="small">
            <Button
              size="small"
              shape="circle"
              icon={<FaPaperclip />}
              onClick={() => fileInputRef.current.click()}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              hidden
              multiple
            />
            {(!isMobile || isExpanded) && (
              <Button
                size="small"
                onClick={() => editorRef.current?.setContent("")}
              >
                {t("Clear")}
              </Button>
            )}
          </Space>

          <Space size="small">
            {isEditing && (
              <Button onClick={onCancelEdit} danger size="small">
                {t("Cancel")}
              </Button>
            )}
            <Button
              type="primary"
              icon={<FaPaperPlane />}
              onClick={handleSubmit}
              disabled={disabled}
              size="small"
            >
              {t("Send")}
            </Button>
          </Space>
        </div>
      </div>
    </>
  );
};

export default MessageTypeWritterReport;
