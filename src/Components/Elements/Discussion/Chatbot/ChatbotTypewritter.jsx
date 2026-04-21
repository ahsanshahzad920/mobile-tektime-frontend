import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useTranslation } from "react-i18next";
import { FaCompress, FaExpand, FaPaperclip, FaTimes } from "react-icons/fa";

const ChatbotTypeWritter = ({
  editorRef,
}) => {
  const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API;
  const [t] = useTranslation("global");
  const [isExpanded, setIsExpanded] = useState(false);
  const editorContainerRef = useRef(null);
  const editorInstanceRef = useRef(null);


  

  const uploadToCloudinary = async (blobInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());
        formData.append("upload_preset", "chat-application");
        formData.append("cloud_name", "drrk2kqvy");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/drrk2kqvy/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        resolve(data.secure_url);
      } catch (error) {
        console.error("Upload error:", error);
        reject("Image upload failed: " + error.message);
      }
    });
  };

  // Initialize editor
  const handleEditorInit = (evt, editor) => {
    editorInstanceRef.current = editor;
    if (editorRef) {
      editorRef.current = editor;
    }
  };


  return (
    <>
      {isExpanded && <div className="editor-overlay"></div>}
      <div
        ref={editorContainerRef}
        className={`rich-text-editor-container mt-3 ${isExpanded ? 'expanded-editor' : ''}`}
      >
        {/* <div className="d-flex justify-content-between align-items-center mb-2">
          <h6>{isEditing ? t("Edit Message") : t("New Message")}</h6>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? t("Minimize") : t("Maximize")}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
        </div> */}

      
       

        <div className="d-flex align-items-start gap-2">
       

          <div className="flex-grow-1">
            <Editor
              apiKey={TINYMCE_API_KEY}
              onInit={handleEditorInit}
              initialValue=""
              init={{
                height: isExpanded ? 450 : 200,
                menubar: false,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                  "image",
                  "imagetools",
                  "autocomplete",
                ],
                toolbar:
                  "undo redo | formatselect | " +
                  "bold italic backcolor | alignleft aligncenter " +
                  "alignright alignjustify | bullist numlist outdent indent | link image |" +
                  "removeformat | help",
 
                automatic_uploads: true,
                images_upload_handler: async (blobInfo, progress) => {
                  progress(0);
                  try {
                    const url = await uploadToCloudinary(blobInfo);
                    progress(100);
                    return url;
                  } catch (error) {
                    progress(0);
                    throw error;
                  }
                },
                paste_data_images: true,
                file_picker_types: "image",
                image_caption: true,
                image_advtab: true,
                image_title: true,
                resize_img_proportional: true,
                object_resizing: true,
                image_dimensions: true,
                image_class_list: [
                  { title: "Responsive", value: "img-responsive" },
                  { title: "Rounded", value: "img-rounded" },
                ],
              content_style: `
  body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }
  .mention {
    background-color: #e6f3ff;
    color: #1e90ff;
    padding: 2px 4px;
    border-radius: 3px;
    cursor: pointer;
  }
  .mention:hover {
    background-color: #cce6ff;
  }
  .tox-autocompleter .tox-collection__item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px !important;
  }
  .tox-autocompleter .tox-collection__item img {
    width: 24px !important;
    height: 24px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    flex-shrink: 0 !important;
  }
  .tox-autocompleter .tox-collection__item span {
    flex-grow: 1 !important;
  }
`,
              }}
            />
          </div>
        </div>

        {/* <div className="d-flex justify-content-end gap-2 mt-2">
           <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => fileInputRef.current.click()}
            disabled={disabled}
            title={t("Attach files")}
          >
            <FaPaperclip />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              multiple
            />
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => editorRef.current && editorRef.current.setContent("")}
            disabled={disabled}
          >
            {t("Clear")}
          </button>
          {isEditing && (
            <button
              className="btn btn-outline-danger"
              onClick={onCancelEdit}
              disabled={disabled}
            >
              {t("Cancel")}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            // disabled={disabled || (!editorRef.current?.getContent()?.trim())}
          >
            {isEditing ? t("Update Message") : t("Send Message")}
          </button>
        </div> */}
      </div>
    </>
  );
};

export default ChatbotTypeWritter;