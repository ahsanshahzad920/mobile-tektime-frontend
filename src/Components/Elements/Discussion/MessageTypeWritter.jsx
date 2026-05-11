import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTranslation } from "react-i18next";
import { Assets_URL } from "../../Apicongfig";
import {
  FaCompress,
  FaExpand,
  FaPaperclip,
  FaTimes,
  FaPaperPlane,
  FaEdit,
} from "react-icons/fa";
import { SiChatbot } from "react-icons/si";
import {
  Space,
  Typography,
  Tooltip,
  Badge,
  Avatar,
  Card,
  Modal,
  Button,
  Mentions,
} from "antd";

const { Text } = Typography;

const MessageTypeWritter = ({
  onSendMessage,
  disabled,
  editorRef,
  isEditing,
  onCancelEdit,
  participants,
  onFileUpload,
  attachments,
  onRemoveAttachment,
  initialValue = "",
  isSending = false,
}) => {
  const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API;
  const [t] = useTranslation("global");
  const fileInputRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const editorInstanceRef = useRef(null);
  const [simpleValue, setSimpleValue] = useState("");
  const FALLBACK_IMAGE = "https://via.placeholder.com/24";
  const isMobile = window.innerWidth < 768;

  const [participantsList, setParticipantsList] = useState([]);

 const participantsRef = useRef([]);

useEffect(() => {
  const getUniqueParticipants = (p) => {
    if (!p || p.length === 0) return [];
    return p.filter(
      (part, idx, self) =>
        idx === self.findIndex((p2) =>
          p2.email ? p2.email === part.email : p2.id === part.id
        )
    );
  };
  const unique = getUniqueParticipants(participants);
  setParticipantsList(unique);
  participantsRef.current = unique; // ref bhi update karo
}, [participants]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isMobile && !isExpanded) {
      if (simpleValue.trim() || attachments.length > 0) {
        onSendMessage({ message: simpleValue });
        setSimpleValue("");
      }
      return;
    }
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      if (content.trim() || attachments.length > 0) {
        onSendMessage({ message: content });
        editorRef.current.setContent("");
        setIsExpanded(false);
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

  const renderContent = (full = false) => {
    if (isMobile && !full) {
      return (
        <div className="p-2 border-top bg-white">
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
                  <Card size="small" className="bg-light p-1">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{ height: "30px", objectFit: "cover" }}
                      />
                    ) : (
                      <Space>
                        <FaPaperclip />
                        <Text size="small" ellipsis style={{ maxWidth: 60 }}>
                          {file.name}
                        </Text>
                      </Space>
                    )}
                  </Card>
                </Badge>
              ))}
            </div>
          )}
          <div className="d-flex align-items-end gap-2">
            <Button
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

            <Mentions
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder={t("Tapez un message...")}
              value={simpleValue}
              onChange={(val) => setSimpleValue(val)}
              className="rounded-pill px-3"
              style={{ resize: "none" }}
             options={participantsList.map((p) => ({
  value: p.full_name || p.name || p.email || "",
  label: (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src={
          p.participant_image?.startsWith("http")
            ? p.participant_image
            : p.participant_image
            ? `${Assets_URL}/${p.participant_image.replace(/^\//, "")}`
            : FALLBACK_IMAGE
        }
        style={{ width: 20, height: 20, borderRadius: "50%" }}
        alt=""
      />
      <span>{p.full_name || p.name || p.email}</span>
    </div>
  ),
}))}
            />

            <Button
              shape="circle"
              icon={<FaEdit />}
              onClick={() => {
                setIsExpanded(true);
                if (simpleValue) {
                  setTimeout(() => {
                    if (editorRef.current)
                      editorRef.current.setContent(simpleValue);
                  }, 300);
                }
              }}
            />

            <Button
              type="primary"
              shape="circle"
              icon={<FaPaperPlane />}
              onClick={handleSubmit}
              loading={isSending}
              disabled={disabled}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-white ${full ? "h-100 d-flex flex-column" : "p-3 border-top shadow-sm"}`}
      >
        <div className="d-flex align-items-center justify-content-between mb-2">
          <Space>
            <SiChatbot className="text-primary" />
            <Text strong>
              {isEditing ? t("Edit Message") : t("Nouveau message")}
            </Text>
          </Space>
          <Button
            type="text"
            icon={isExpanded ? <FaCompress /> : <FaExpand />}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {attachments?.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
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
                      <Text size="small" ellipsis style={{ maxWidth: 100 }}>
                        {file.name}
                      </Text>
                    </Space>
                  )}
                </Card>
              </Badge>
            ))}
          </div>
        )}

        <div
          className={full ? "flex-grow-1" : ""}
          style={full ? { minHeight: 0 } : {}}
        >
          <Editor
            apiKey={TINYMCE_API_KEY}
            onInit={handleEditorInit}
            initialValue={initialValue}
            init={{
              height: full ? (window.innerWidth < 768 ? 200 : "100%") : 180,
              min_height: window.innerWidth < 768 ? 40 : 100,
              menubar: false,
              plugins:
                "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
              toolbar:
                window.innerWidth < 768 && !full
                  ? false
                  : window.innerWidth < 768
                    ? "bold italic | link image"
                    : "undo redo | bold italic | alignleft aligncenter alignright alignjustify | link image | help",
              statusbar: false,
             setup: (editor) => {
  editor.ui.registry.addAutocompleter("mentions", {
    ch: "@",
    minChars: 0,
    fetch: (query) => {
      const results = participantsRef.current  // ← yahan change
        .filter((p) =>
          (p.full_name || p.name || p.email)
            ?.toLowerCase()
            .includes(query.toLowerCase())
        )
        .map((p) => ({
          value: p.id.toString(),
          text: p.full_name || p.name || p.email || "Utilisateur",
          custom: `<div style="display:flex;align-items:center;gap:8px;padding:4px;">
            <img src="${
              p.participant_image?.startsWith("http")
                ? p.participant_image
                : p.participant_image
                  ? `${Assets_URL}/${p.participant_image.replace(/^\//, "")}`
                  : FALLBACK_IMAGE
            }" style="width:20px;height:20px;border-radius:50%;" />
            <span>${p.full_name || p.name || p.email}</span>
          </div>`,
        }));
      return Promise.resolve(results);
    },
    onAction: (api, rng, value) => {
      const p = participantsRef.current.find(  // ← yahan bhi
        (p) => p.id.toString() === value
      );
      editor.selection.setRng(rng);
      editor.insertContent(
        `<span class="mention" data-id="${p.id}" style="color:#1890ff;background:#e6f7ff;padding:2px 4px;border-radius:4px;">@${p.full_name || p.name || p.email}</span> `
      );
      api.hide();
    },
  });
},
              extended_valid_elements: "span[class|style|data-id]",
              content_style: `body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; font-size: ${window.innerWidth < 768 ? "12px" : "14px"}; padding: 4px; margin: 0; }`,
            }}
          />
        </div>

        <div
          className={`d-flex align-items-center justify-content-between ${window.innerWidth < 768 && !full ? "mt-1 pt-1" : "mt-auto pt-2"}`}
        >
          <Space>
            <Button
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
          </Space>
          <Space>
            {isEditing && (
              <Button
                onClick={onCancelEdit}
                danger
                size={window.innerWidth < 768 ? "small" : "middle"}
              >
                {t("Cancel")}
              </Button>
            )}
            <Button
              type="primary"
              icon={<FaPaperPlane />}
              onClick={handleSubmit}
              loading={isSending}
              disabled={disabled}
              className={window.innerWidth < 768 ? "px-2" : "px-4"}
              shape={window.innerWidth < 768 ? "circle" : "default"}
            >
              {window.innerWidth < 768
                ? ""
                : isEditing
                  ? t("Update")
                  : t("Envoyer")}
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={isExpanded ? "d-none" : ""}>{renderContent(false)}</div>

      <Modal
        open={isExpanded}
        onCancel={() => setIsExpanded(false)}
        footer={null}
        width={1000}
        centered
        destroyOnClose={false}
        bodyStyle={{ height: "70vh", padding: 0 }}
        className="editor-full-modal"
      >
        {isExpanded && renderContent(true)}
      </Modal>

      <style jsx="true">{`
        .editor-full-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 12px;
        }
        .editor-full-modal .ant-modal-close {
          top: 15px;
          right: 15px;
        }
      `}</style>
    </>
  );
};

export default MessageTypeWritter;
