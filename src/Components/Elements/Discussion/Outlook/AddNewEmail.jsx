import CookieService from '../../../Utils/CookieService';
import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Upload,
  Button,
  Tag,
  message,
  Divider,
  Spin,
} from "antd";
import { HiPaperAirplane, HiInbox } from "react-icons/hi2";
import axios from "axios";
import { API_BASE_URL } from "../../../Apicongfig";
import { Editor } from "@tinymce/tinymce-react";
import CreatableSelect from "react-select/creatable"; // <-- Important
import makeAnimated from "react-select/animated";
import { useTranslation } from "react-i18next";
import { PiMicrosoftOutlookLogoFill } from "react-icons/pi";

const { TextArea } = Input;
const { Dragger } = Upload;
const animatedComponents = makeAnimated();

const AddNewEmail = ({ show, onClose, onEmailAdded }) => {
  const [t] = useTranslation("global");
  const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API;
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [recipients, setRecipients] = useState([]); // now array of { value, label }
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [options, setOptions] = useState([]); // grouped options for react-select
  const TOKEN = CookieService.get("token");

  // Load participants once when modal opens
  useEffect(() => {
    if (show && TOKEN) {
      const loadParticipants = async () => {
        setFetching(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/participants-email`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });

          const data = res.data.data || [];

          const members = data
            .filter((p) => p.type === "member")
            .map((p) => ({
              value: p.email,
              label: p.email,
              type: "member",
            }));

          const contacts = data
            .filter((p) => p.type === "contact")
            .map((p) => ({
              value: p.email,
              label: p.email,
              type: "contact",
            }));

          const groupedOptions = [];

          if (members.length > 0) {
            groupedOptions.push({
              label: "Team Members",
              options: members,
            });
          }

          if (contacts.length > 0) {
            groupedOptions.push({
              label: "Contacts",
              options: contacts,
            });
          }

          setOptions(groupedOptions);
        } catch (err) {
          message.error("Failed to load recipients");
          console.error(err);
        } finally {
          setFetching(false);
        }
      };

      loadParticipants();
    } else {
      setOptions([]);
      setRecipients([]);
    }
  }, [show, TOKEN]);

  const handleSend = async () => {
    if (!subject.trim()) return message.error("Subject is required");
    if (!messageText.trim()) return message.error("Message is required");
    if (recipients.length === 0)
      return message.error("Add at least one recipient");

    setLoading(true);
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", messageText);
    recipients.forEach((recipient) => {
      formData.append("recipients[]", recipient.value.trim());
    });
    fileList.forEach((file) =>
      formData.append("attachments[]", file.originFileObj || file),
    );

    try {
      const res = await fetch(`${API_BASE_URL}/outlook-email/send-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        message.success("Email sent successfully!");
        onEmailAdded?.();
        handleClose();
      } else {
        message.error(result.message || "Failed to send email");
      }
    } catch (err) {
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject("");
    setMessageText("");
    setRecipients([]);
    setFileList([]);
    onClose();
  };

  const uploadProps = {
    fileList,
    onRemove: (file) =>
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid)),
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    multiple: true,
  };

  // Custom styles to match Ant Design
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: 40,
      borderColor: "#d9d9d9",
      "&:hover": { borderColor: "#40a9ff" },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e6f7ff",
      border: "1px solid #91d5ff",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1890ff",
    }),
    groupHeading: (provided) => ({
      ...provided,
      color: "#1890ff",
      fontWeight: "bold",
      textTransform: "none",
      fontSize: 14,
    }),
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Modal
      open={show}
      onCancel={handleClose}
      width={isMobile ? "95%" : 960}
      footer={null}
      centered
      title={null}
      styles={{
        body: {
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          padding: isMobile ? "24px 16px" : "40px 32px",
        },
      }}
    >
      {/* Title with Platform Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: isMobile ? 24 : 32,
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <PiMicrosoftOutlookLogoFill
          size={isMobile ? 28 : 36}
          style={{ color: "#0078D4" }} // Official Outlook blue
        />
        <h2
          style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 600,
            margin: 0,
            color: "#1f1f1f",
          }}
        >
          {t("Compose_mail") || "Compose Email"}
        </h2>
      </div>

      {/* Subject */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          {t("discussion.Subject")} <span style={{ color: "#ff4d4f" }}>*</span>
        </label>
        <Input
          size="large"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Recipients - React-Select Creatable */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          {t("discussion.To")} <span style={{ color: "#ff4d4f" }}>*</span>
        </label>
        <CreatableSelect
          isMulti
          isClearable
          isLoading={fetching}
          onChange={(newValue) => setRecipients(newValue || [])}
          onCreateOption={(inputValue) => {
            const newOption = { value: inputValue, label: inputValue };
            setRecipients((prev) => [...prev, newOption]);
          }}
          options={options}
          value={recipients}
          placeholder="Type email or select from list..."
          formatCreateLabel={(inputValue) => `Add new: "${inputValue}"`}
          components={animatedComponents}
          styles={customStyles}
          className="my-select destination-select-dropdown"
          classNamePrefix="react-select"
          noOptionsMessage={() =>
            fetching ? "Loading..." : "No recipients found"
          }
        />
      </div>

      {/* Message Editor */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          {t("discussion.Message")} <span style={{ color: "#ff4d4f" }}>*</span>
        </label>
        <Editor
          apiKey={TINYMCE_API_KEY}
          value={messageText}
          onEditorChange={setMessageText}
          init={{
            height: isMobile ? 300 : 400,
            menubar: false,
            plugins:
              "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime table paste code help wordcount",
            toolbar: isMobile
              ? "undo redo | bold italic | bullist numlist | link"
              : "undo redo | formatselect | bold italic underline forecolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link table | removeformat | fullscreen preview | help",
            content_style: `
              body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; }
              .mention { background:#e6f3ff; color:#1e90ff; padding:2px 6px; border-radius:3px; }
            `,
            paste_data_images: false,
            automatic_uploads: false,
            images_upload_handler: undefined,
          }}
        />
      </div>

      {/* Attachments */}
      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          {t("discussion.Attachments")}
        </label>
        <Dragger {...uploadProps} style={{ background: "#fafafa" }}>
          <p className="ant-upload-drag-icon">
            <HiInbox
              style={{ fontSize: isMobile ? 32 : 48, color: "#1890ff" }}
            />
          </p>
          <p className="ant-upload-text">
            {isMobile
              ? "Tap to upload files"
              : t("discussion.Click or drag files to upload")}
          </p>
        </Dragger>
      </div>

      <Divider style={{ margin: "32px 0 20px" }} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          flexDirection: isMobile ? "column-reverse" : "row",
        }}
      >
        <Button size="large" onClick={handleClose} block={isMobile}>
          {t("discussion.Cancel")}
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<HiPaperAirplane />}
          loading={loading}
          onClick={handleSend}
          block={isMobile}
        >
          {t("discussion.Send Email")}
        </Button>
      </div>
    </Modal>
  );
};

export default AddNewEmail;
