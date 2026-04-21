import CookieService from '../../../../Utils/CookieService';
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, Assets_URL } from "../../../../Apicongfig";
import { useTranslation } from "react-i18next";
import { Editor } from "@tinymce/tinymce-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { toast } from "react-toastify";
import { useFormContext } from "../../../../../context/CreateMeetingContext";
import { Button, Spinner } from "react-bootstrap";
import cheerio from "cheerio";
import { useMeetings } from "../../../../../context/MeetingsContext";
import moment from "moment";
import Creatable from "react-select/creatable";
import Select from "react-select";
import { IoIosBusiness, IoIosRocket } from "react-icons/io";
import { FaBookOpen, FaBullseye, FaChalkboardTeacher } from "react-icons/fa";
import { AiOutlineAudit } from "react-icons/ai";
import { MdEventAvailable, MdOutlineSupport, MdWork } from "react-icons/md";
function extractBase64SrcFromHTML(htmlString) {
  const base64SrcArray = [];

  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue && srcValue?.startsWith("data:image")) {
      // If src is a base64 image, push it into base64SrcArray
      base64SrcArray.push(srcValue);
    }
  });

  return base64SrcArray;
}
function replaceBase64SrcWithLinks(htmlString, imageLinks) {
  // Load the HTML string into cheerio
  const $ = cheerio.load(htmlString);

  let linkIndex = 0;

  // Find all elements with 'src' attribute
  $("[src]").each((index, element) => {
    const srcValue = $(element).attr("src");

    // Check if the src starts with 'data:image'
    if (srcValue && srcValue?.startsWith("data:image")) {
      // Replace the src with the corresponding link from imageLinks
      if (imageLinks[linkIndex]) {
        $(element).attr("src", imageLinks[linkIndex]);
      }
      linkIndex++;
    }
  });

  // Return the modified HTML string
  return $.html();
}

const MomentDetail = ({
  setActiveTab,
  usersArray,
  selectedClientDescription,
  setSelectedClientDescription,
  clientOption,
  setClientOption,
  clientOptions,
  missionOption,
  missionOptions,
  setMissionOption,
  missionsArray,
  missionTypeOption,
  setMissionTypeOption,
  setSelectedMissionDescription,
  selectedMissionDescription,
  openedFrom,
  meeting,
}) => {
  const APIKEY = process.env.REACT_APP_TINYMCE_API;
  const {
    formState,
    setFormState,
    handleInputBlur,
    // getMeeting,
    checkId,
    isUpdated,
    isDuplicate,
    handleCloseModal,
    fromDestination,
    fromDestinationName,
    recurrentMeetingAPI,
    changePrivacy,
    changeContext,
    loading,
  } = useFormContext();

  const { getMeetings } = useMeetings();
  const [t] = useTranslation("global");
  const [objectives, setObjectives] = useState([]);
  const [options, setOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const userId = CookieService.get("user_id");
  // const [loading, setLoading] = useState(false); // Loading state
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [userTime, setUserTime] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);

  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  const missionTypeOptions = [
    { value: "Business opportunity", label: "destination.businessOppurtunity" },
    { value: "Study", label: "destination.study" },
    { value: "Audit", label: "destination.audit" },
    { value: "Project", label: "destination.project" },
    { value: "Accompagnement", label: "destination.accompagnement" },
    { value: "Event", label: "destination.event" },
    { value: "Formation", label: "destination.formation" },
    { value: "Recruitment", label: "destination.recruitment" },
    { value: "Objective", label: "destination.objective" },
    { value: "Other", label: "destination.other" },
  ];

  const getIcon = (value) => {
    const commonStyle = { marginRight: 8 };

    switch (value) {
      case "Business opportunity":
        return <IoIosBusiness size={20} style={commonStyle} />;

      case "Study":
        return <FaBookOpen size={20} style={commonStyle} />;

      case "Audit":
        return <AiOutlineAudit size={20} style={commonStyle} />;

      case "Project":
        return <IoIosRocket size={20} style={commonStyle} />;

      case "Accompagnement":
        return <MdOutlineSupport size={20} style={commonStyle} />;

      case "Event":
        return <MdEventAvailable size={20} style={commonStyle} />;

      case "Formation":
        return <FaChalkboardTeacher size={20} style={commonStyle} />;

      case "Recruitment":
        return <MdWork size={20} style={commonStyle} />;

      case "Objective":
        return <FaBullseye size={20} style={commonStyle} />;

      case "Other":
        return <span style={commonStyle}>✨</span>;

      default:
        return null;
    }
  };
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/^```markdown\s*/, "")
      .replace(/```$/, "")
      .replace(/---/g, "");
  };

  const isMarkdownContent = (text) => {
    if (!text) return false;
    // Check for explicit markers or patterns
    if (text.trim().startsWith("```markdown")) return true;
    if (text.includes("---")) return true;

    // Check for common Markdown syntax while avoiding common HTML
    const markdownPatterns = [
      /^#{1,6}\s/m, // Headers
      /^\s*[-*+]\s/m, // Unordered lists
      /^\s*\d+\.\s/m, // Ordered lists
      /\*\*[^*]+\*\*/, // Bold
      /\[[^\]]+\]\([^)]+\)/, // Links
    ];

    const hasMarkdown = markdownPatterns.some((pattern) => pattern.test(text));
    const hasHtml = /<[a-z][\s\S]*>/i.test(text);

    return hasMarkdown && !hasHtml;
  };

  const [modifiedFileText, setModifiedFileText] = useState();
  //  const handleContentOptimization = async (content) => {
  //   const optimizedEditorContent = await optimizeEditorContent(content);
  //   setFormState(prev => ({...prev, description: optimizedEditorContent}));
  // };
  const optimizeEditorContent = async (editorContent) => {
    if (!editorContent) {
      return "";
      //-------- CLOUD LOGIC ------------------------------
    }
    let optimizedEditorContent = "";
    const base64Array = extractBase64SrcFromHTML(editorContent);
    if (!base64Array.length > 0) {
      optimizedEditorContent = editorContent;
      return optimizedEditorContent;
    } else {
      const cloudinaryUploads = base64Array.map(async (base64Image) => {
        try {
          const response = await fetch(
            "https://api.cloudinary.com/v1_1/drrk2kqvy/upload",
            {
              method: "POST",
              body: JSON.stringify({
                file: base64Image,
                upload_preset: "chat-application",
              }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();

          return data.secure_url;
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return null;
        }
      });

      const uploadedImageUrls = await Promise.all(cloudinaryUploads);
      const editorContentWithCloudLinks = replaceBase64SrcWithLinks(
        editorContent,
        uploadedImageUrls,
      );

      optimizedEditorContent = editorContentWithCloudLinks;
      return optimizedEditorContent;
    }

    // // ------- CLOUD LOGIC END -------------------------
  };

  useEffect(() => {
    getObjectives();
  }, []);
  // useEffect(() => {
  //   if (checkId) {
  //     if (changePrivacy) return;

  //     getMeeting(checkId);
  //   }
  // }, [checkId]);

  const [value, setValue] = useState("");

  useEffect(() => {
    if (meeting) {
      const objectiveValue =
        fromDestination && fromDestinationName
          ? fromDestinationName
          : meeting.objective || "";

      setFormState((prevState) => ({
        ...prevState,
        objective: objectiveValue, // Always set the correct objective
        title: meeting.title || "",
        priority: meeting.priority || "",
        description: meeting.description || "",
      }));
      setModifiedFileText(meeting?.description);
      setContent(meeting?.description || "");

      setValue(objectiveValue);

      // Ensure the objective exists in dropdown options
      if (
        objectiveValue &&
        !options.some((opt) => opt.value === objectiveValue)
      ) {
        setOptions((prevOptions) => [
          ...prevOptions,
          { value: objectiveValue, label: objectiveValue },
        ]);
      }
    }
  }, [meeting, fromDestination, fromDestinationName, setFormState]);

  useEffect(() => {
    if (fromDestinationName) {
      setValue(fromDestinationName);
      setFormState((prevState) => ({
        ...prevState,
        objective: fromDestinationName,
      }));
    }
  }, []);
  const getObjectives = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-objectives/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        const objectives = response?.data?.data;
        setObjectives(objectives);
        const newOptions = objectives.map((item) => ({
          value: item,
          label: item,
        }));
        setOptions(newOptions);
      }
    } catch (error) {}
  };

  const handleEditorChange = (content) => {
    setContent(content);
    setFormState((prevState) => ({
      ...prevState,
      description: content,
    }));
  };

  const uploadToCloudinary = async (blobInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());
        formData.append("upload_preset", "chat-application"); // Replace with your upload preset
        formData.append("cloud_name", "drrk2kqvy"); // Replace with your cloud name

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/drrk2kqvy/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        resolve(data.secure_url); // Return the secure URL from Cloudinary
      } catch (error) {
        console.error("Upload error:", error);
        reject("Image upload failed: " + error.message);
      }
    });
  };

  const validateForm = () => {
    let validationErrors = {};
    let errorMessage = "";

    // if (!formState.objective) {
    //   validationErrors.objective = t("meeting.formState.destination");
    //   if (!errorMessage) errorMessage = validationErrors.objective;
    // }
    if (!formState.title) {
      validationErrors.title = t("meeting.formState.title");
      if (!errorMessage) errorMessage = validationErrors.title;
    }
    // if (!formState.priority) {
    //   validationErrors.priority = t("meeting.formState.priority");
    //   if (!errorMessage) errorMessage = validationErrors.priority;
    // }

    setErrors(validationErrors);

    if (errorMessage) {
      toast.error(errorMessage.trim());
    }

    return Object.keys(validationErrors).length === 0;
  };

  // useEffect(() => {
  //   const currentTime = moment().startOf("minute"); // Normalize to remove seconds
  //   setUserTime(currentTime);
  // }, []);

  // // Calculate the time difference when userTime or meeting details change
  // useEffect(() => {
  //   if (userTime && meeting?.date && meeting?.start_time) {
  //     const meetingTime = moment(
  //       `${meeting?.date} ${meeting?.start_time}`,
  //       "YYYY-MM-DD HH:mm:ss"
  //     ).startOf("minute"); // Normalize meeting time to remove seconds

  //     if (meetingTime.isValid()) {
  //       const diff = meetingTime.diff(userTime, "minutes");
  //       setTimeDifference(diff);
  //     } else {
  //       console.error("Invalid meeting date or time format.");
  //       setTimeDifference(null); // Reset to null if invalid
  //     }
  //   }
  // }, [userTime, meeting]);

  if (loading) {
    // Show a loading spinner while waiting for the API response
    return (
      <Spinner
        animation="border"
        role="status"
        className="center-spinner"
      ></Spinner>
    );
  }
  return (
    <>
      <div className="col-md-12 modal-height">
        <div className="create-moment-modal">
          <div className="row form">
            <div className="mb-2 col-lg-6 col-sm-12">
              <div className="step-content p-0">
                <div className="form-group">
                  <label className="form-label">
                    {t("Client")} <span className="required-asterisk">*</span>
                  </label>

                  <div>
                    {meeting?.type === "Absence" ? (
                      // Readonly Select field for Absence type
                      <Select
                        className="my-select destination-select-dropdown"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        value={{
                          value: meeting?.destination?.clients?.id,
                          label:
                            meeting?.destination?.clients?.name ||
                            t("No client assigned"),
                          data: {
                            client_logo:
                              meeting?.destination?.clients?.client_logo,
                            client_need_description:
                              meeting?.destination?.clients
                                ?.client_need_description,
                          },
                        }}
                        options={
                          meeting?.destination?.clients
                            ? [
                                {
                                  value: meeting.destination.clients.id,
                                  label: meeting.destination.clients.name,
                                  data: {
                                    client_logo:
                                      meeting.destination.clients.client_logo,
                                    client_need_description:
                                      meeting.destination.clients
                                        .client_need_description,
                                  },
                                },
                              ]
                            : []
                        }
                        isDisabled={true}
                               formatOptionLabel={(option) => (
                                 <div className="option-with-logo">
                                   {option.data?.client_logo && (
                                     <img
                                       src={
                                         option.data.client_logo.startsWith("http")
                                           ? option.data.client_logo
                                           : `${Assets_URL}/${option.data.client_logo}`
                                       }
                                       alt={option.label}
                                       className="client-logo"
                                     />
                                   )}
                                   <span>{option.label}</span>
                                 </div>
                               )}
                      />
                    ) : (
                      <Creatable
                        className="my-select destination-select-dropdown"
                        onChange={(selected) => {
                          setClientOption(selected);
                          // Find the full client object to get description
                          const selectedClient = usersArray.find(
                            (user) => user.id === selected?.value,
                          );
                          setSelectedClientDescription(
                            selectedClient?.client_need_description || null,
                          );
                          setFormState((prev) => ({
                            ...prev,
                            client_id: selected?.__isNew__
                              ? null
                              : selected?.value,
                            client: selected?.__isNew__
                              ? selected?.label
                              : null,
                          }));
                        }}
                        isDisabled={openedFrom === "destination"}
                        value={clientOption}
                        options={clientOptions}
                        isClearable
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        formatOptionLabel={(option) => (
                          <div className="option-with-logo">
                            {option.data?.client_logo && (
                              <img
                                src={
                                  option.data.client_logo.startsWith("http")
                                    ? option.data.client_logo
                                    : `${Assets_URL}/${option.data.client_logo}`
                                }
                                alt={option.label}
                                className="client-logo"
                              />
                            )}
                            <span>{option.label}</span>
                          </div>
                        )}
                      />
                    )}
                  </div>

                  {/* Display client description if it exists */}
                  {selectedClientDescription && (
                    <div className="client-description mt-2">
                      <p className="text-muted">{selectedClientDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-2 col-lg-6 col-sm-12">
              <div className="step-content p-0">
                <div className="form-group">
                  <label className="form-label">
                    {t("Mission")}
                    <span className="required-asterisk">*</span>
                  </label>

                  {meeting?.type === "Absence" ? (
                    // Readonly Select field for Absence type
                    <Select
                      className="my-select destination-select-dropdown mb-3"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      value={{
                        value: meeting?.destination?.id,
                        label:
                          meeting?.destination?.destination_name ||
                          t("No mission assigned"),
                        data: {
                          description:
                            meeting?.destination?.destination_description,
                        },
                      }}
                      options={
                        meeting?.destination
                          ? [
                              {
                                value: meeting.destination.id,
                                label: meeting.destination.destination_name,
                                data: {
                                  description:
                                    meeting.destination.destination_description,
                                },
                              },
                            ]
                          : []
                      }
                      isDisabled={true}
                    />
                  ) : (
                    <Creatable
                      className="my-select destination-select-dropdown mb-3"
                      value={missionOption}
                      onChange={(selected) => {
                        setMissionOption(selected);
                        // Find the full mission object to get description and destination_type
                        const selectedMission = missionsArray.find(
                          (mission) => mission.id === selected?.value,
                        );
                        setSelectedMissionDescription(
                          selectedMission?.description || null,
                        );

                        // Set missionTypeOption for existing missions
                        if (
                          selected &&
                          !selected.__isNew__ &&
                          selectedMission?.destination_type
                        ) {
                          const missionType = missionTypeOptions.find(
                            (type) =>
                              type.value === selectedMission.destination_type,
                          );
                          if (missionType) {
                            setMissionTypeOption({
                              value: missionType.value,
                              label: (
                                <div>
                                  {getIcon(missionType.value)}
                                  {t(missionType.label)}
                                </div>
                              ),
                            });
                          } else {
                            setMissionTypeOption(null); // Clear if no matching type found
                          }
                        } else {
                          setMissionTypeOption(null); // Clear for new missions or if no destination_type
                        }

                        setFormState((prev) => ({
                          ...prev,
                          destination_id: selected?.__isNew__
                            ? null
                            : selected?.value,
                          destination: selected?.__isNew__
                            ? selected?.label
                            : null,
                          destination_type:
                            selected &&
                            !selected.__isNew__ &&
                            selectedMission?.destination_type
                              ? selectedMission.destination_type
                              : selected?.__isNew__
                                ? prev.destination_type
                                : null,
                        }));
                      }}
                      isDisabled={openedFrom === "destination"}
                      options={missionOptions}
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}

                  {/* Mission Description */}
                  {selectedMissionDescription && (
                    <div className="description-box mt-2">
                      <p className="text-muted">{selectedMissionDescription}</p>
                    </div>
                  )}
                  {missionOption?.__isNew__ && (
                    <>
                      <label className="form-label">
                        {t("destination_type")}
                        <span className="required-asterisk">*</span>
                      </label>
                      <Select
                        className="my-select destination-select-dropdown"
                        value={missionTypeOption}
                        onChange={(selected) => {
                          setMissionTypeOption(selected);
                          setFormState((prev) => ({
                            ...prev,
                            destination_type: selected?.value,
                          }));
                        }}
                        options={missionTypeOptions.map((opt) => ({
                          ...opt,
                          label: (
                            <div>
                              {getIcon(opt.value)}
                              {t(opt.label)}
                            </div>
                          ),
                        }))}
                        isClearable
                        isSearchable
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row form">
            <div className="mb-2 col-lg-6 col-sm-12">
              <label className="form-label">
                {t("Objective")}{" "}
                <small style={{ color: "red", fontSize: "15px" }}>*</small>
              </label>
              <input
                type="text"
                required
                className="form-control"
                value={formState.title}
                onChange={(e) =>
                  setFormState((prevState) => ({
                    ...prevState,
                    title: e.target.value,
                  }))
                }
                // onBlur={handleInputBlur}
                placeholder={t("meeting.newMeeting.placeholders.objective")}
              />
            </div>
          </div>

          <div
            className="col-lg-12 form d-flex gap-2"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="mb-2 col-md-12">
              <label className="form-label">
                {t("meeting.newMeeting.labels.context")}
                {/* <small style={{ color: "red", fontSize: "15px" }}>*</small> */}
              </label>

              {isMarkdownContent(content) ? (
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "hidden",
                    minHeight: "400px",
                  }}
                >
                  <MDXEditor
                    markdown={cleanText(content)}
                    onChange={(newValue) => {
                      handleEditorChange(newValue);
                    }}
                    plugins={[
                      headingsPlugin(),
                      listsPlugin(),
                      markdownShortcutPlugin(),
                    ]}
                    contentEditableClassName="french-content-editor"
                  />
                </div>
              ) : (
                <Editor
                  apiKey={APIKEY}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  value={content}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 300,
                    menubar: true,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media table paste code help wordcount",
                      "image",
                      "imagetools",
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic underline | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | link image | \
                    code | fullscreen | help",

                    /* Cloudinary Image Handling */
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

                    /* Enable all image input methods */
                    paste_data_images: true,
                    file_picker_types: "image",

                    /* Image enhancements */
                    image_caption: true,
                    image_advtab: true,
                    image_title: true,

                    // 🟢 Enable resizing images with the mouse
                    resize_img_proportional: true, // Optional: constrain proportions
                    object_resizing: true, // or 'img' to target only images
                    image_dimensions: true, // shows width/height fields and supports inline sizing

                    image_class_list: [
                      { title: "Responsive", value: "img-responsive" },
                      { title: "Rounded", value: "img-rounded" },
                    ],

                    /* Responsive images by default */
                    content_style: `
                   
                    img.img-rounded { border-radius: 8px; }
                  `,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MomentDetail;
