import CookieService from "../../../Utils/CookieService";
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

const { TextArea } = Input;
const { Dragger } = Upload;
const animatedComponents = makeAnimated();

const AddNewMail = ({ show, onClose, onEmailAdded }) => {
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
      const res = await fetch(`${API_BASE_URL}/google-emails/send-email`, {
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
        <svg
          width={isMobile ? "28px" : "36px"}
          height={isMobile ? "28px" : "36px"}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
              fill="white"
            ></path>
            <path
              d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z"
              fill="#EA4335"
            ></path>
            <path
              d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z"
              fill="#FBBC05"
            ></path>
            <path
              d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z"
              fill="#34A853"
            ></path>
            <path
              d="M9.94811 24.0001V15.0732L9.94043 15.0669L9.94811 24.0001Z"
              fill="#C5221F"
            ></path>
            <path
              d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z"
              fill="#C5221F"
            ></path>
            <path
              d="M9.94043 8.52441V15.0671L9.94811 15.0734V8.53073L9.94043 8.52441Z"
              fill="#C5221F"
            ></path>
            <path
              d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z"
              fill="#4285F4"
            ></path>
          </g>
        </svg>
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

export default AddNewMail;
