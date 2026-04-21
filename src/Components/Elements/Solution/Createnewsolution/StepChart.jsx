import CookieService from '../../../Utils/CookieService';
import React, { createContext, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Editor } from "@tinymce/tinymce-react";
import { API_BASE_URL, Assets_URL, NODE_API } from "../../../Apicongfig";
import { useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { useTotalTime } from "../../../../context/TotalTimeContext";
import cheerio from "cheerio";
import { useTranslation } from "react-i18next";
import { Button, Modal, Spinner } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { useSteps } from "../../../../context/Step";
import { useSolutionFormContext } from "../../../../context/CreateSolutionContext";
import { getUserRoleID } from "../../../Utils/getSessionstorageItems";
import { RiFileExcel2Line, RiFolderVideoLine } from "react-icons/ri";
import * as XLSX from "xlsx";
import Spreadsheet from "react-spreadsheet";
import { read, utils } from "xlsx";

import {
  DocumentIcon,
  FileFolderIcon,
  VideoIcon,
  CameraIcon,
  LinkIcon,
  ExpandIcon,
} from "../../../Utils/MeetingFunctions";
import { CgMail } from "react-icons/cg";
import { FaRegFileAudio } from "react-icons/fa";

// Function to extract base64 image sources from HTML string
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

// Function to replace base64 image sources with cloud URLs in HTML string
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

//FrontEnd - Cloudinary
export const optimizeEditorContent = async (editorContent) => {
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

//----------------------------------------------

const StepChart = ({
  meetingId,
  show,
  closeModal,
  id,
  setId,
  meeting1,
  isDrop,
  setIsDrop,
  stepIndex,
}) => {
  const {
    formState,
    setFormState,
    handleInputBlur,
    checkId,
    getSolution,
    // solution,
    setIsUpdated,
    isUpdated,
    call,
    setCall,
    // isDuplicate,
  } = useSolutionFormContext();
  const userID = parseInt(CookieService.get("user_id"));
  const TINYMCEAPI = process.env.REACT_APP_TINYMCE_API;
  const { updateSolutionSteps } = useSteps();
  const [showStepModal, setShowStepModal] = useState(true);
  const location = window.location.href;
  const [isOpen, setIsOpen] = useState(false);
  const [StepPresentor, setStepPresentor] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const fromReport = location.includes("step-details")
    ? true
    : location.includes("meetingDetail")
      ? true
      : false;
  const [t] = useTranslation("global");
  const options = [
    { value: "Editeur", label: t("stepModal.editor"), icon: <DocumentIcon /> },
    { value: "File", label: t("stepModal.pdf"), icon: <FileFolderIcon /> },
    { value: "Video", label: t("stepModal.video"), icon: <VideoIcon /> },
    { value: "Photo", label: t("stepModal.photo"), icon: <CameraIcon /> },
    { value: "Url", label: t("stepModal.url"), icon: <LinkIcon /> },
    {
      value: "Excel",
      label: t("stepModal.excel"),
      icon: <RiFileExcel2Line className="fs-5" />,
    },
  ];
  const SpecialMeetingOptions = [
    {
      value: "Audio Report",
      label: t("stepModal.audioReport"),
      icon: <FaRegFileAudio className="fs-5" />,
    },
    {
      value: "Video Report",
      label: t("stepModal.videoReport"),
      icon: <RiFolderVideoLine className="fs-5" />,
    },
  ];
  const newsletterOption = [
    { value: "Email", label: t("stepModal.email"), icon: <CgMail /> },
  ];
  const taskOption = [
    { value: "Subtask", label: t("stepModal.subtask"), icon: <DocumentIcon /> },
  ];

  const LawOption = [
    {
      value: "Question",
      label: t("stepModal.laweditor"),
      icon: <DocumentIcon />,
    },
  ];

  const prestationOption = [
    {
      value: "Prestation",
      label: t("stepModal.prestation"),
      icon: <DocumentIcon />,
    },
  ];

  const storyOption = [
    { value: "Story", label: t("stepModal.story"), icon: <DocumentIcon /> },
  ];

  const handleSelect = (option) => {
    setModalType(option.value);
    setIsOpen(false);
    setFileName("");
    setExcelData(null);
  };
  const userId = Number(CookieService.get("user_id"));

  const [isDisabled, setIsDisabled] = useState(false);
  // const id = useParams().id;
  const [inputData, setInputData] = useState();
  // const [loading, setLoading] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  // console.log("selectedValue", selectedValue);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCount, setSelectedCount] = useState(
    inputData?.type === "Sprint" ? 0.5 : 0,
  );
  console.log("selectedCount", selectedCount);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // const [teams,setTeams] = useState()
  const stepRef = useRef();

  const [accumulatedSelectedCounts, setAccumulatedSelectedCounts] = useState(
    [],
  );
  const [storedStartTime, setStoredStartTime] = useState(null);
  const [storedStartDate, setStoredStartDate] = useState(null);
  const [storedStartDateForHour, setStoredStartDateForHour] = useState(null);
  const [totalSelectedCount, setTotalSelectedCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [countSum, setCountSum] = useState(0);
  const [modifiedFileText, setModifiedFileText] = useState();
  const [modalType, setModalType] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [validateBtnText, setValidateBtnText] = useState("Valider");
  const [assignUser, setAssignUser] = useState(null);
  const [assignTeam, setAssignTeam] = useState(null);
  const [stepOrder, setStepOrder] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [isValidate, setIsValidate] = useState(false);
  const [EditorData, setEditorData] = useState({});

  const inputDataRef = useRef(inputData);
  const [fileName, setFileName] = useState("");
  const [isUpload, setIsUpload] = useState(false);

  const [link, setLink] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");

  const [createAnother, setCreateAnother] = useState(false);
  const handleCheckboxChange = (e) => {
    setCreateAnother(e.target.checked);
  };

  const optimizeEditorContent = async (editorContent) => {
    if (!editorContent) {
      return "";
      //-------- CLOUD LOGIC ------------------------------
    }
    let optimizedEditorContent = "";
    setIsValidate(true);
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
      setIsValidate(false);

      optimizedEditorContent = editorContentWithCloudLinks;
      return optimizedEditorContent;
    }

    // // ------- CLOUD LOGIC END -------------------------
  };
  // useEffect(()=>{
  //   if(checkId){
  //     getMeeting(checkId);
  //   }
  // },[checkId])
  // Set modalType based on inputData once it is available
  // useEffect(() => {
  //   if (inputData?.type) {
  //     setModalType(
  //       inputData?.type === "Newsletter" ? "Email": modalType ? modalType: "Editeur"
  //     );
  //   }
  // }, [inputData?.type, show]);

  useEffect(() => {
    if (inputData?.type) {
      setModalType(
        inputData?.type === "Law"
          ? "Question"
          : inputData?.type === "Newsletter"
            ? "Email"
            : inputData?.type === "Special"
              ? "Audio Report"
              : inputData?.type === "Absence"
                ? "Absence CET non payable"
                : inputData?.type === "Sprint"
                  ? "Story"
                  : inputData?.type === "Task"
                    ? "Subtask"
                    : inputData?.type === "Prestation Client"
                      ? "Prestation"
                      : modalType
                        ? modalType
                        : "Editeur",
      );
    }
    setSelectedCount(inputData?.count2);
  }, [inputData?.type, show]);
  const [fileUploaded, setFileUploaded] = useState(false);

  const [disabled, setDisabled] = useState(false);
  const [excelData, setExcelData] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const solutionCreatorId = parseInt(meeting1?.solution_creator?.id);

    if (
      meeting1?.solution_privacy === "public" &&
      solutionCreatorId !== userID
    ) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setIsUpload(true);
    let allowedFileTypes = [];

    // Determine allowed file types based on modalType
    if (modalType === "File") {
      allowedFileTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
    } else if (modalType === "Video") {
      allowedFileTypes = [
        "video/mp4",
        "video/x-msvideo",
        "video/x-matroska",
        "video/mpeg",
        "video/quicktime",
      ];
    } else if (modalType === "Photo") {
      allowedFileTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
        // Add other image MIME types if needed
      ];
    } else if (modalType === "Excel") {
      allowedFileTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
    } else if (modalType === "Video Report") {
      allowedFileTypes = [
        "video/mp4",
        "video/x-msvideo",
        "video/x-matroska",
        "video/mpeg",
        "video/quicktime",
      ];
    } else if (modalType === "Audio Report") {
      allowedFileTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/x-ms-wma",
        "audio/aac",
      ];
    }

    // Check file size (6 MB = 6 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("meeting.chart.error.file"));
      setIsUpload(false);
      return;
    }
    if (file && allowedFileTypes.includes(file.type)) {
      if (file && modalType === "Excel") {
        let reader = new FileReader();

        // Wait for the file to be loaded before processing it
        reader.onload = (e) => {
          const fileData = new Uint8Array(e.target.result);
          const workbook = XLSX.read(fileData, { type: "array" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const formattedData = data.map((row, rowIndex) =>
            row.map((cell, cellIndex) => ({
              value: cell,
              readOnly: rowIndex === 0,
            })),
          );
          setExcelData(formattedData);
        };

        reader.readAsArrayBuffer(file); // Trigger file reading
      }

      // let count2;
      // let timeUnit;
      // // If the file is an audio or video file, retrieve its duration
      // if (modalType === "Video Report" || modalType === "Audio Report") {
      //   const mediaElement = document.createElement(
      //     modalType === "Audio Report" ? "audio" : "video"
      //   );
      //   mediaElement.src = URL.createObjectURL(file);

      //   mediaElement.onloadedmetadata = () => {
      //     const durationInSeconds = mediaElement.duration; // Duration in seconds
      //     let formattedDuration;

      //     if (durationInSeconds < 60) {
      //       formattedDuration = `${Math.round(durationInSeconds)} secs`; // Show seconds only
      //       count2 = Math.round(durationInSeconds); // Set count2 to total seconds
      //       setSelectedCount(count2);
      //       timeUnit = "seconds"; // Set time unit to 'sec'
      //     } else if (durationInSeconds < 3600) {
      //       // Less than 60 minutes
      //       const totalMinutes = Math.round(durationInSeconds / 60);
      //       formattedDuration = `${totalMinutes} mins`; // Show total minutes only
      //       count2 = totalMinutes; // Set count2 to total minutes
      //       setSelectedCount(count2);

      //       timeUnit = "minutes"; // Set time unit to 'min'
      //     } else {
      //       // 60 minutes or more
      //       const totalHours = Math.floor(durationInSeconds / 3600);
      //       const remainingMinutes = Math.round(
      //         (durationInSeconds % 3600) / 60
      //       );
      //       formattedDuration = `${totalHours} hour${
      //         totalHours > 1 ? "s" : ""
      //       } ${remainingMinutes > 0 ? `${remainingMinutes} mins` : ""}`.trim(); // Show hours and minutes
      //       count2 = totalHours; // Set count2 to total hours
      //       setSelectedCount(count2);
      //       timeUnit = "hours"; // Set time unit to 'hour'
      //     }

      //     console.log(
      //       `Formatted duration of the file is: ${formattedDuration}`
      //     );
      //     setFileDuration(formattedDuration); // Store the formatted duration in state
      //   };

      //   mediaElement.onerror = () => {
      //     console.error("Unable to load media file for duration calculation.");
      //   };
      // }

      // // setSelectedCount(count2);

      // console.log("count2", count2);
      // console.log("timeUnit", timeUnit);
      if (id === null) {
        setDisabled(true);
        try {
          setIsDisabled(false);

          const assignedToUser =
            user?.id ||
            inputData?.user_with_participants?.find(
              (participant) => participant.email === inputData?.user?.email,
            )?.id;
          // const updatedSteps = [...(inputData?.steps || [])];
          // const selectedStep = updatedSteps[selectedIndex];

          const filePayload = {
            title: selectedValue || "",
            count1: selectedCount || 0,
            count2: selectedCount || 0,
            time_unit:
              inputData?.type === "Action1" || inputData?.type === "Newsletter"
                ? "days"
                : inputData?.type === "Task" ||
                    inputData?.type === "Prestation Client"
                  ? "hours"
                  : inputData?.type === "Quiz"
                    ? "seconds"
                    : "minutes",
            time: selectedCount,
            editor_type:
              modalType === "File"
                ? "File"
                : modalType === "Video"
                  ? "Video"
                  : modalType === "Photo"
                    ? "Photo"
                    : modalType,
            file: file,
            editor_content: null,
            solution_id: meetingId,
            status: "active",
            url: null,
            created_by: userID,
            // _method: "put",
          };

          const formData = new FormData();
          formData.append("title", filePayload.title);
          formData.append("count1", filePayload.count1);
          formData.append("count2", filePayload.count2);
          formData.append("time", filePayload.time);
          formData.append("editor_type", filePayload.editor_type);
          formData.append("time_unit", filePayload.time_unit);
          formData.append("file", filePayload.file);
          formData.append("editor_content", filePayload.editor_content);
          formData.append("solution_id", filePayload.solution_id);
          formData.append("status", filePayload.status);
          formData.append("created_by", filePayload.created_by);
          formData.append("url", filePayload.url);
          // formData.append("_method", filePayload._method);

          const response = await axios.post(
            `${API_BASE_URL}/solution-steps`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );

          if (response.status) {
            setFileName(response.data?.data?.file);
            setIsUpload(false);
            setId(response?.data?.data?.id);
            setIsUpdate(false);
            setIsDrop(true);
            setDisabled(false);

            setFileUploaded(true); // Add this line
          }
        } catch (error) {
          console.log("error while uploading file", error);
          setIsUpload(false);
          setDisabled(false);
        }
      } else {
        try {
          setIsDisabled(false);
          setDisabled(false);

          // const updatedSteps = [...(inputData?.steps || [])];
          // const selectedStep = updatedSteps[selectedIndex];
          const assignedToUser =
            user?.id ||
            inputData?.user_with_participants?.find(
              (participant) => participant.email === inputData?.user?.email,
            )?.id;
          const filePayload = {
            title: selectedValue,
            count1: selectedCount || 0,
            count2: selectedCount || 0,
            time_unit:
              inputData?.type === "Action1" || inputData?.type === "Newsletter"
                ? "days"
                : inputData?.type === "Task" ||
                    inputData?.type === "Prestation Client"
                  ? "hours"
                  : inputData?.type === "Quiz"
                    ? "seconds"
                    : "minutes",
            time: selectedCount || 0,
            editor_type:
              modalType === "File"
                ? "File"
                : modalType === "Video"
                  ? "Video"
                  : modalType === "Photo"
                    ? "Photo"
                    : modalType,
            file: file,
            editor_content: null,
            solution_id: meetingId,
            status: "active",
            url: null,
            _method: "put",
          };

          const formData = new FormData();
          formData.append("title", filePayload.title);
          formData.append("count1", filePayload.count1);
          formData.append("count2", filePayload.count2);
          formData.append("time", filePayload.time);
          formData.append("editor_type", filePayload.editor_type);
          formData.append("time_unit", filePayload.time_unit);
          formData.append("file", filePayload.file);
          formData.append("editor_content", filePayload.editor_content);
          formData.append("solution_id", filePayload.solution_id);
          formData.append("status", filePayload.status);
          formData.append("url", filePayload.url);
          formData.append("_method", filePayload._method);

          const response = await axios.post(
            `${API_BASE_URL}/solution-steps/${id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${CookieService.get("token")}`,
              },
            },
          );

          if (response.status) {
            setFileName(response.data?.data?.file);
            setIsUpload(false);
            setId(response?.data?.data?.id);
            setIsDrop(false);

            // setIsUpdate(false);
          }
        } catch (error) {
          console.log("error while uploading file", error);
          setIsUpload(false);
        }
      }
    } else {
      alert(
        `Please select a valid file type for ${modalType}: ${allowedFileTypes.join(
          ", ",
        )}`,
      );

      setIsUpload(false);
    }
  };

  const handleMediaDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);
    setIsUpload(true);
    let allowedFileTypes = [];

    // Determine allowed file types based on modalType
    if (modalType === "Video Report") {
      allowedFileTypes = [
        "video/mp4",
        "video/x-msvideo",
        "video/x-matroska",
        "video/mpeg",
        "video/quicktime",
      ];
    } else if (modalType === "Audio Report") {
      allowedFileTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/x-ms-wma",
        "audio/aac",
      ];
    }
    // Check if the file type is allowed
    if (!allowedFileTypes.includes(file?.type)) {
      toast.error(t("meeting.chart.error.invalidFileType"));
      setIsUpload(false);
      return;
    }
    // Check file size (6 MB = 6 * 1024 * 1024 bytes)
    if (file?.size > 10 * 1024 * 1024) {
      // toast.error(t("meeting.chart.error.file"));
      toast.error(t("meeting.chart.error.file"));
      setIsUpload(false);
      return;
    }

    if (file && allowedFileTypes.includes(file.type)) {
      let count2;
      let timeUnit;
      // If the file is an audio or video file, retrieve its duration
      if (modalType === "Video Report" || modalType === "Audio Report") {
        const mediaElement = document.createElement(
          modalType === "Audio Report" ? "audio" : "video",
        );
        mediaElement.src = URL.createObjectURL(file);

        mediaElement.onloadedmetadata = async () => {
          const durationInSeconds = mediaElement.duration; // Duration in seconds
          let formattedDuration;

          if (durationInSeconds < 60) {
            formattedDuration = `${Math.round(durationInSeconds)} secs`; // Show seconds only
            count2 = Math.round(durationInSeconds); // Set count2 to total seconds
            setSelectedCount(count2);
            timeUnit = "seconds"; // Set time unit to 'sec'
          } else if (durationInSeconds < 3600) {
            // Less than 60 minutes
            const totalMinutes = Math.floor(durationInSeconds / 60); // Use floor to get full minutes
            const remainingSeconds = durationInSeconds % 60;

            if (remainingSeconds === 0) {
              // No rounding needed if it's exactly N minutes
              formattedDuration = `${totalMinutes} mins`;
              count2 = totalMinutes; // Set count2 to total minutes
            } else {
              // Round up if there are remaining seconds
              const roundedMinutes = Math.ceil(durationInSeconds / 60);
              formattedDuration = `${roundedMinutes} mins`;
              count2 = roundedMinutes; // Set count2 to rounded minutes
            }

            setSelectedCount(count2);
            timeUnit = "minutes"; // Set time unit to 'min'
          } else {
            // 60 minutes or more
            const totalHours = Math.floor(durationInSeconds / 3600);
            const remainingMinutes = Math.ceil((durationInSeconds % 3600) / 60);
            formattedDuration = `${totalHours} hour${
              totalHours > 1 ? "s" : ""
            } ${remainingMinutes > 0 ? `${remainingMinutes} mins` : ""}`.trim(); // Show hours and minutes
            count2 = totalHours; // Set count2 to total hours
            setSelectedCount(count2);
            timeUnit = "hours"; // Set time unit to 'hour'
          }

          console.log(
            `Formatted duration of the file is: ${formattedDuration}`,
          );
          setFileDuration(formattedDuration); // Store the formatted duration in state

          const currentTime = new Date();

          // User's time zone
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          // Format dates and times
          const formattedEndDate = currentTime.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            timeZone: userTimeZone,
          });
          if (id === null) {
            setDisabled(true);
            try {
              setIsDisabled(false);

              const assignedToUser =
                user?.id ||
                inputData?.user_with_participants?.find(
                  (participant) => participant.email === inputData?.user?.email,
                )?.id;
              // const updatedSteps = [...(inputData?.steps || [])];
              // const selectedStep = updatedSteps[selectedIndex];

              const filePayload = {
                title: selectedValue || "",
                count1: count2 || 0,
                count2: count2 || 0,
                time_unit:
                  inputData?.type === "Action1" ||
                  inputData?.type === "Newsletter"
                    ? "days"
                    : inputData?.type === "Task" ||
                        inputData?.type === "Prestation Client"
                      ? "hours"
                      : inputData?.type === "Quiz"
                        ? "seconds"
                        : inputData?.type === "Special"
                          ? timeUnit
                          : "minutes",
                time: count2,
                editor_type:
                  modalType === "File"
                    ? "File"
                    : modalType === "Video"
                      ? "Video"
                      : modalType === "Photo"
                        ? "Photo"
                        : modalType,
                file: file,
                editor_content: null,
                solution_id: meetingId,
                assigned_to: assignedToUser,
                // assigned_to_team: inputData?.type === "Newsletter" ? team : null,
                assigned_to_team:
                  inputData?.type === "Newsletter" ? null : null,
                status: "active",
                url: null,
                created_by: userID,
                step_status: inputData?.type === "Special" ? "completed" : null,
                end_date:
                  inputData?.type === "Special" ? formattedEndDate : null,
                // _method: "put",
              };

              const formData = new FormData();
              formData.append("title", filePayload.title);
              formData.append("count1", filePayload.count1);
              formData.append("count2", filePayload.count2);
              formData.append("time", filePayload.time);
              formData.append("editor_type", filePayload.editor_type);
              formData.append("time_unit", filePayload.time_unit);
              formData.append("file", filePayload.file);
              formData.append("editor_content", filePayload.editor_content);
              formData.append("solution_id", filePayload.solution_id);
              formData.append("status", filePayload.status);
              formData.append("step_status", filePayload.step_status);
              formData.append("end_date", filePayload.end_date);
              formData.append("assigned_to", filePayload.assigned_to);
              formData.append("assigned_to_team", filePayload.assigned_to_team);
              formData.append("created_by", filePayload.created_by);
              formData.append("url", filePayload.url);
              // formData.append("_method", filePayload._method);

              const response = await axios.post(
                `${API_BASE_URL}/solution-steps`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${CookieService.get("token")}`,
                  },
                },
              );

              if (response.status) {
                setFileName(response.data?.data?.file);
                setTimeUnit(response?.data?.data?.time_unit);
                setIsUpload(false);
                setId(response?.data?.data?.id);
                setIsUpdate(false);
                setIsDrop(true);
                setDisabled(false);

                setFileUploaded(true); // Add this line
              }
            } catch (error) {
              console.log("error while uploading file", error);
              setIsUpload(false);
              setDisabled(false);
            }
          } else {
            try {
              setIsDisabled(false);
              setDisabled(false);

              // const updatedSteps = [...(inputData?.steps || [])];
              // const selectedStep = updatedSteps[selectedIndex];
              const assignedToUser =
                user?.id ||
                inputData?.user_with_participants?.find(
                  (participant) => participant.email === inputData?.user?.email,
                )?.id;
              const filePayload = {
                title: selectedValue,
                count1: count2 || 0,
                count2: count2 || 0,
                time_unit:
                  inputData?.type === "Action1" ||
                  inputData?.type === "Newsletter"
                    ? "days"
                    : inputData?.type === "Task" ||
                        inputData?.type === "Prestation Client"
                      ? "hours"
                      : inputData?.type === "Quiz"
                        ? "seconds"
                        : inputData?.type === "Special"
                          ? timeUnit
                          : "minutes",
                time: count2,
                editor_type:
                  modalType === "File"
                    ? "File"
                    : modalType === "Video"
                      ? "Video"
                      : modalType === "Photo"
                        ? "Photo"
                        : modalType,
                file: file,
                editor_content: null,
                solution_id: meetingId,
                assigned_to: assignedToUser,
                // assigned_to_team: inputData?.type === "Newsletter" ? team : null,
                assigned_to_team:
                  inputData?.type === "Newsletter" ? null : null,
                status: "active",
                url: null,
                _method: "put",
              };

              const formData = new FormData();
              formData.append("title", filePayload.title);
              formData.append("count1", filePayload.count1);
              formData.append("count2", filePayload.count2);
              formData.append("time", filePayload.time);
              formData.append("editor_type", filePayload.editor_type);
              formData.append("time_unit", filePayload.time_unit);
              formData.append("file", filePayload.file);
              formData.append("editor_content", filePayload.editor_content);
              formData.append("solution_id", filePayload.solution_id);
              formData.append("status", filePayload.status);
              formData.append("assigned_to", filePayload.assigned_to);
              formData.append("assigned_to_team", filePayload.assigned_to_team);

              formData.append("url", filePayload.url);
              formData.append("_method", filePayload._method);

              const response = await axios.post(
                `${API_BASE_URL}/solution-steps/${id}`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${CookieService.get("token")}`,
                  },
                },
              );

              if (response.status) {
                setFileName(response.data?.data?.file);
                setTimeUnit(response?.data?.data?.time_unit);
                setIsUpload(false);
                setId(response?.data?.data?.id);
                setIsDrop(false);

                // setIsUpdate(false);
              }
            } catch (error) {
              console.log("error while uploading file", error);
              setIsUpload(false);
            }
          }
        };

        mediaElement.onerror = () => {
          console.error("Unable to load media file for duration calculation.");
        };
      }
    } else {
      alert(
        `Please select a valid file type for ${modalType}: ${allowedFileTypes.join(
          ", ",
        )}`,
      );

      setIsUpload(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept:
      modalType === "Video" || modalType === "Video Report"
        ? { "video/*": [] } // Accept all video types
        : modalType === "Photo"
          ? { "image/*": [] } // Accept all image types
          : modalType === "File"
            ? { "application/pdf": [] } // Accept PDF files
            : modalType === "Excel"
              ? {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    [],
                  "application/vnd.ms-excel": [],
                }
              : modalType === "Audio Report"
                ? { "audio/*": [] }
                : "",
    onDrop:
      modalType === "Video Report" || modalType === "Audio Report"
        ? handleMediaDrop
        : onDrop,
  });

  const [user, setUser] = useState(null);

  const handleUserSelect = (item) => {
    setUser(item);
    setStepPresentor(!StepPresentor);
    // const selectedId = Number(e.target.value);
    // // setSelectedUser(selectedId);
  };
  const [team, setTeam] = useState(null);
  const handleTeamSelect = (item) => {
    // setTeam(e.target.value);
    // const selectedId = Number(e.target.value);
    setTeam(item);
    setStepPresentor(!StepPresentor);
  };

  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const storedUser = CookieService.get("user");
    if (storedUser) {
      setCreator(JSON.parse(storedUser));
      // setUser(JSON.parse(storedUser));
    }
  }, []);
  const getMeeting1 = async () => {
    // if(!meetingId) return
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/solutions/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.status) {
        // setCreator(response?.data?.data?.user);
        const stepsData = response.data?.data?.solution_steps;
        const total = stepsData.reduce(
          (totalCount2, step) => totalCount2 + step.count2,
          0,
        );
        updateSolutionSteps(response?.data?.data?.solution_steps);
        setInputData(response?.data?.data);
      }
    } catch (error) {
      console.log("error while getting steps", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getMeeting1();
  }, [meetingId, show, isValidate]);

  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleIncrementCount = () => {
    setSelectedCount((prev) => parseInt(prev) + 1);
  };
  const handleDecrementCount = () => {
    setSelectedCount((prev) => Math.max(parseInt(prev) - 1, 0));
  };

  const deleteStepX = async () => {
    setIsUpdate(false);
    setCreateAnother(false);
    setFileUploaded(false);
    setId(null);
    setSelectedValue("");
    setUser("");
    setTeam("");
    setModifiedFileText("");
    setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
    closeModal();
    setIsValidate(false);
    setModalType("");
    setLink("");
  };

  const handleSpreadsheetChange = (newData) => {
    setExcelData(newData);
  };

  const updateExcelFile = async () => {
    try {
      setIsValidate(true);
      // Add Excel file in its original format
      // Convert JSON to a 2D array
      const sheetData = excelData.map((row) =>
        row.map((cell) => cell?.value || ""),
      );
      // Create a worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Create a workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Write workbook to binary string
      const workbookBinary = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "binary",
      });

      // Convert binary string to Blob
      const excelBlob = new Blob(
        [
          new Uint8Array(
            workbookBinary.split("").map((char) => char.charCodeAt(0)),
          ),
        ],
        {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      );

      // Create FormData
      const formData = new FormData();
      formData.append("file", new File([excelBlob], "updated_data.xlsx"));
      formData.append("solution_step_id", id);

      const response = await axios.post(
        `${API_BASE_URL}/update-excel-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response?.status) {
        setIsValidate(false);

        console.log("Updated file path:", response.data.step.file);
        return response.data.step;
      }
    } catch (error) {
      console.log("error while update excel file", error);
      setIsValidate(false);
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalizing, setFinalizing] = useState(false); // Track processing after upload

  const uploadAudioReport = async () => {
    try {
      setIsValidate(true);
      // Add Excel file in its original format
      setIsProcessing(true);
      setFinalizing(false);

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("solution_step_id", id);
      setUploadProgress(0); // Reset progress at the start
      const response = await axios.post(
        `${API_BASE_URL}/solution-speech-to-text`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            // Cap progress to 95% during upload
            setUploadProgress(Math.min(percentCompleted, 95));
          },
        },
      );
      if (response?.status) {
        setSelectedFile(null);
        setFinalizing(true);
        setIsValidate(false);
        setUploadProgress(100); // Ensure progress reaches 100% only after server responds
        setTimeout(() => {
          setUploadProgress(0); // Reset progress bar after a short delay
        }, 1000);
        // return response.data.step;
      }
    } catch (error) {
      console.log("error while update excel file", error);
      setIsValidate(false);
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
      setFinalizing(false);
      setSelectedFile(null);
      // setUploadProgress(100); // Ensure progress reaches 100% only after server responds
    }
  };

  const staticContents = {
    "Absence CET non payable": `Une absence CET non payable signifie que le salarié utilise du temps stocké sur son Compte Épargne Temps pour s’absenter, sans contrepartie financière immédiate.

📌 Concrètement, cela implique :
Le salarié pose un jour (ou une demi-journée) via le CET.

Ce jour est déduit du solde en temps du CET.

Il n’est pas rémunéré en plus : l’absence ne génère pas de paiement (ni sur le bulletin de paie, ni en prime, ni en indemnité).

Elle n’impacte pas le salaire mensuel, car c’est du temps "prépayé" par les jours précédemment épargnés.`,

    "Absence CET payable": `Une absence CET payable correspond à une journée ou période d’absence prise au titre du Compte Épargne Temps (CET), et qui donne lieu à un versement monétaire au salarié.
Autrement dit, le salarié monétise un ou plusieurs jours de CET pour les transformer en rémunération.

📌 Concrètement, cela implique :
Le salarié utilise un jour (ou plus) stocké sur son CET.

Le jour n’est pas pris en congé effectif (ou peut l’être dans certains cas).

Il est converti en argent, selon la valeur du jour (souvent basée sur le salaire journalier brut).

Ce montant apparaît sur la fiche de paie, généralement sous une ligne du type : Indemnité CET, Monétisation CET, ou CET payable.`,

    "Partial unemployment": `Le chômage partiel est un dispositif permettant à une entreprise de réduire temporairement le temps de travail de ses salariés (voire de suspendre leur activité) en cas de difficultés économiques ou conjoncturelles, tout en évitant des licenciements.

Pendant cette période, les salariés ne travaillent pas ou travaillent moins, et reçoivent une indemnité compensatoire financée partiellement ou totalement par l’État.

👷‍♂ Pour le salarié
Il ne travaille pas pendant tout ou partie de ses heures habituelles.

Il reçoit une indemnité versée par l’employeur, égale à 60 % de son salaire brut (soit environ 72 % du net).

Dans certains cas, des compléments peuvent être versés par l’entreprise pour maintenir le revenu.

🔁 Cette indemnité remplace le salaire habituel sur les heures non travaillées`,

    "Paid leave": `Les congés payés sont des jours de repos légaux rémunérés, accordés à un salarié pour compenser son temps de travail.
Ils permettent de prendre du repos tout en continuant à percevoir sa rémunération habituelle.

📌 Principe général
Acquisition : le salarié acquiert 2,5 jours ouvrables de congés payés par mois travaillé (soit 30 jours ouvrables ou 5 semaines pour une année complète).

Période de référence : généralement du 1er juin au 31 mai de l’année suivante, sauf accord d’entreprise.`,

    Recovery: `Une absence pour récupération (souvent appelée « récupération d'heures supplémentaires » ou « récupération du temps de travail ») est une période de repos accordée à un salarié en contrepartie d'un temps de travail effectué au-delà de l'horaire normal, sans paiement en heures supplémentaires.

Autrement dit : le salarié ne travaille pas, mais ce temps d'absence est justifié et payé car il compense du temps déjà travaillé.

🧩 Contexte d'application
Elle peut intervenir :

Après des heures supplémentaires non majorées compensées en temps

Après un travail exceptionnel un jour de repos (ex. salon, intervention le samedi)

Dans le cadre d'un accord d'entreprise ou d'une convention collective

📌 Caractéristiques
L'absence est justifiée, autorisée et planifiée.

Elle n'impacte pas le salaire (temps déjà "payé" par avance).

Elle doit être prise dans un délai précis après les heures effectuées (souvent sous 8 semaines).

Elle peut apparaître sur le planning ou les outils RH comme :
Absence – Récupération, Repos compensateur, Jour de récupération`,

    RTT: `Le RTT, ou Réduction du Temps de Travail, est un dispositif qui permet aux salariés de bénéficier de jours de repos supplémentaires lorsque leur temps de travail dépasse la durée légale de 35 heures par semaine, sans que cela soit considéré comme des heures supplémentaires.

🧩 Contexte
Le RTT concerne principalement :

Les cadres au forfait jours

Les salariés travaillant plus de 35 heures par semaine dans le cadre d'un accord collectif

Les entreprises ayant adopté la réduction du temps de travail tout en maintenant une durée de travail hebdomadaire au-dessus de la norme

📌 Fonctionnement
Les heures travaillées au-delà de 35 h, mais dans le cadre prévu, ne sont pas rémunérées en heures supplémentaires, mais compensées par du temps de repos.

Le nombre de jours RTT varie selon l'organisation du travail et les accords collectifs (souvent 10 à 12 jours par an).

Ces jours peuvent être posés par le salarié, ou dans certains cas, imposés par l'employeur (RTT collectif).`,

    "Corporate event": "Contenu statique pour Corporate event",
    "Skills sponsorship": "Contenu statique pour Skills sponsorship",
  };
  const validateStep = async () => {
    const solutionCreatorId = parseInt(meeting1?.solution_creator?.id);
    if (
      meeting1?.solution_privacy === "public" &&
      solutionCreatorId !== userID
    ) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }
    // Update Excel file and get the updated file path
    let updatedExcelFileUrl = null;
    let updatedAudioReport = null;
    if (modalType === "Excel") {
      try {
        updatedExcelFileUrl = await updateExcelFile();
        console.log("File updated successfully:", updatedExcelFileUrl);
      } catch (error) {
        setIsValidate(false);
        return;
      }
    } else if (modalType === "Audio Report" || modalType === "Video Report") {
      try {
        updatedAudioReport = await uploadAudioReport();
        console.log("File updated successfully:", updatedAudioReport);
      } catch (error) {
        setIsValidate(false);
        return;
      }
    }
    if (id == null) {
      const optimizedEditorContent =
        await optimizeEditorContent(modifiedFileText);
      const Steps = [...(inputData?.solution_steps || [])];
      const isUnique = Steps?.every(
        (step, index) =>
          index === selectedIndex || step?.title !== selectedValue,
      );
      if (!selectedValue?.trim()) {
        toast.error(t("messages.stepTitle"));
        setIsValidate(false);
        return;
      }

      // if (!isUnique) {
      //   toast.error(t("messages.stepNames"));
      //   setIsValidate(false);
      //   return;
      // }

      if (selectedCount === 0) {
        toast.error(t("messages.stepTime"));
        setIsValidate(false);
        return;
      }

      // if (inputData?.type === "Newsletter") {
      //   if (!team) {
      //     toast.error(t("Select any team"));
      //     setIsValidate(false);
      //     return;
      //   }
      // }
      const assignedToUser =
        user?.id ||
        inputData?.user_with_participants?.find(
          // (participant) => participant.email === inputData?.user?.email
          (participant) => participant.email === creator?.email,
        )?.id;

      const payload = {
        title: selectedValue,
        count1: selectedCount || 0,
        count2: selectedCount,
        time_unit:
          inputData?.type === "Action1" ||
          inputData?.type === "Newsletter" ||
          inputData?.type === "Absence" ||
          inputData?.type === "Sprint"
            ? "days"
            : inputData?.type === "Task" ||
                inputData?.type === "Prestation Client"
              ? "hours"
              : inputData?.type === "Quiz"
                ? "seconds"
                : inputData?.type === "Special"
                  ? timeUnit
                  : "minutes",
        time: selectedCount,

        editor_type: inputData?.type === "Newsletter" ? "Email" : modalType,
        editor_content:
          modalType === "Editeur" ||
          modalType === "Subtask" ||
          modalType === "Prestation" ||
          modalType === "Story" ||
          modalType === "Question" ||
          modalType === "Email"
            ? optimizedEditorContent || ""
            : null,
        file:
          modalType === "File"
            ? fileName
              ? fileName
              : null
            : modalType === "Excel"
              ? updatedExcelFileUrl || fileName
              : fileName,
        // assigned_to: inputData?.type === "Newsletter" ? null : assignedToUser,
        // assigned_to_team: inputData?.type === "Newsletter" ? team?.id : null,
        // assigned_to_team:
        //   inputData?.type === "Newsletter"
        //     ? inputData?.newly_created_team?.id
        //     : null,
        status: "active",
        url: modalType === "Url" ? (link ? link : null) : null,
        // video: modalType === "Video" ? (video ? video : null) : null,
        // order_no: stepOrder,
        solution_id: meetingId,
        created_by: userID,
      };
      try {
        setIsValidate(true);
        const response = await axios.post(
          `${API_BASE_URL}/solution-steps`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status) {
          setIsValidate(false);
          setId(null);
          setFileUploaded(createAnother ? true : false);
          setCall((prev) => !prev);
        }
        setSelectedValue("");
        setUser("");
        setTeam("");
        setModifiedFileText("");
        setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
        setModalType("");
        setFileName(null);
        setExcelData(null);
        setLink(null);
        setIsValidate(false);
        if (!createAnother) {
          closeModal();
        } else {
          if (inputData?.type === "Newsletter") {
            setModalType("Email");
          } else if (inputData?.type === "Special") {
            setModalType("Audio Report");
          } else if (inputData?.type === "Law") {
            setModalType("Question");
          } else if (inputData?.type === "Task") {
            setModalType("Subtask");
          } else if (inputData?.type === "Absence") {
            setModalType("Absence CET non payable");
          } else if (inputData?.type === "Task") {
            setModalType("Subtask");
          } else if (inputData?.type === "Sprint") {
            setModalType("Story");
          } else if (inputData?.type === "Prestation Client") {
            setModalType("Prestation");
          } else {
            setModalType("Editeur");
          }
        }
      } catch (error) {
        setIsValidate(false);
        console.log("error while validating step", error);
        toast.error(t(`meeting.newMeeting.${error?.response?.data?.message}`));
      }
    } else {
      try {
        const optimizedEditorContent =
          await optimizeEditorContent(modifiedFileText);
        const Steps = [...(inputData?.solution_steps || [])];
        const isUnique = Steps?.every(
          (step, index) =>
            index === selectedIndex || step?.title !== selectedValue,
        );
        //   const stepId = inputData?.steps[selectedIndex]?.id;
        //   const updatedExcelFileUrl = await updateExcelFile();
        //  const updatedFileName = updatedExcelFileUrl?.step?.file || fileName;

        if (!selectedValue?.trim()) {
          toast.error(t("messages.stepTitle"));
          setIsValidate(false);
          return;
        }
        // if (!isUnique) {
        // toast.error(t("messages.stepNames"));
        // setIsValidate(false);
        // return;
        // }
        if (selectedCount === 0) {
          toast.error(t("messages.stepTime"));
          setIsValidate(false);
          return;
        }
        const assignedToUser =
          user?.id ||
          inputData?.user_with_participants?.find(
            (participant) => participant.email === inputData?.user?.email,
          )?.id;
        const payload = {
          title: selectedValue,
          count1: selectedCount,
          count2: selectedCount,
          time_unit:
            inputData?.type === "Action1" ||
            inputData?.type === "Newsletter" ||
            inputData?.type === "Absence" ||
            inputData?.type === "Sprint"
              ? "days"
              : inputData?.type === "Task" ||
                  inputData?.type === "Prestation Client"
                ? "hours"
                : inputData?.type === "Quiz"
                  ? "seconds"
                  : inputData?.type === "Special"
                    ? timeUnit
                    : "minutes",

          time: selectedCount,
          // editor_type: modalType,
          editor_type: inputData?.type === "Newsletter" ? "Email" : modalType,
          editor_content:
            // modalType === "Editeur" ? optimizedEditorContent || "" : null,
            modalType === "Editeur" ||
            modalType === "Subtask" ||
            modalType === "Story" ||
            modalType === "Prestation" ||
            modalType === "Question" ||
            modalType === "Email"
              ? optimizedEditorContent || ""
              : null,
          file:
            modalType === "File"
              ? fileName
                ? fileName
                : null
              : modalType === "Excel"
                ? updatedExcelFileUrl || fileName
                : fileName, // assigned_to: assignedToUser,
          status: "active",
          url: modalType === "Url" ? (link ? link : null) : null,
          // order_no: stepOrder,
          solution_id: meetingId,
          _method: "put",
        };
        setIsValidate(true);
        const response = await axios.post(
          `${API_BASE_URL}/solution-steps/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status) {
          console.log("step created successfully", response.data.data);
          setId(null);
          setIsValidate(false);
          setFileUploaded(createAnother ? true : false);
          setCall((prev) => !prev);
        }
        setSelectedValue("");
        setUser("");
        setTeam("");
        setModifiedFileText("");
        setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
        setModalType("");
        setFileName(null);
        setExcelData(null);
        setLink(null);
        setIsValidate(false);
        if (!createAnother) {
          closeModal();
        } else {
          if (inputData?.type === "Newsletter") {
            setModalType("Email");
          } else if (inputData?.type === "Special") {
            setModalType("Audio Report");
          } else if (inputData?.type === "Law") {
            setModalType("Question");
          } else if (inputData?.type === "Task") {
            setModalType("Subtask");
          } else if (inputData?.type === "Absence") {
            setModalType("Absence CET non payable");
          } else if (inputData?.type === "Task") {
            setModalType("Subtask");
          } else if (inputData?.type === "Sprint") {
            setModalType("Story");
          } else if (inputData?.type === "Prestation Client") {
            setModalType("Prestation");
          } else {
            setModalType("Editeur");
          }
        }
      } catch (error) {
        console.log("error", error);
        setIsValidate(false);
        toast.error(
          t(`meeting.newMeeting.${error?.response?.data?.errors?.title[0]}`),
        );
      }
    }
  };

  const [progress, setProgress] = useState(0);
  const [isQuestionProcessing, setIsQuestionProcessing] = useState(false);
  const [questionFinalizing, setQuestionFinalizing] = useState(false); // Track processing after upload

  const validateQuestionStep = async () => {
    const solutionCreatorId = parseInt(meeting1?.solution_creator?.id);

    if (
      meeting1?.solution_privacy === "public" &&
      solutionCreatorId !== userID
    ) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }
    if (id == null) {
      setIsQuestionProcessing(true);
      setQuestionFinalizing(false);
      setProgress(0); // Reset progress at the start
      const optimizedEditorContent =
        await optimizeEditorContent(modifiedFileText);
      const Steps = [...(inputData?.steps || [])];
      const isUnique = Steps?.every(
        (step, index) =>
          index === selectedIndex || step?.title !== selectedValue,
      );
      if (!selectedValue?.trim()) {
        toast.error(t("messages.stepTitle"));
        setIsValidate(false);
        setIsQuestionProcessing(false);
        setQuestionFinalizing(false);
        return;
      }

      // if (!isUnique) {
      //   toast.error(t("messages.stepNames"));
      //   setIsValidate(false);
      //   setIsQuestionProcessing(false);
      //   setQuestionFinalizing(false);
      //   return;
      // }

      if (selectedCount === 0) {
        toast.error(t("messages.stepTime"));
        setIsValidate(false);
        setIsQuestionProcessing(false);
        setQuestionFinalizing(false);
        return;
      }

      const assignedToUser =
        user?.id ||
        inputData?.user_with_participants?.find(
          // (participant) => participant.email === inputData?.user?.email
          (participant) => participant.email === creator?.email,
        )?.id;

      const payload = {
        title: selectedValue,
        count1: selectedCount,
        count2: selectedCount,
        time_unit:
          inputData?.type === "Action1" ||
          inputData?.type === "Newsletter" ||
          inputData?.type === "Sprint" ||
          inputData?.type === "Absence"
            ? "days"
            : inputData?.type === "Task" ||
                inputData?.type === "Prestation Client"
              ? "hours"
              : inputData?.type === "Quiz"
                ? "seconds"
                : inputData?.type === "Special"
                  ? timeUnit
                  : "minutes",
        time: selectedCount,
        editor_type: inputData?.type === "Newsletter" ? "Email" : modalType,
        editor_content:
          modalType === "Editeur" ||
          modalType === "Subtask" ||
          modalType === "Prestation" ||
          modalType === "Story" ||
          modalType === "Question" ||
          modalType === "Email"
            ? optimizedEditorContent || ""
            : null,
        file: null,
        status: "active",
        url: modalType === "Url" ? (link ? link : null) : null,
        // video: modalType === "Video" ? (video ? video : null) : null,
        // order_no: stepOrder,
        solution_id: meetingId,
        created_by: userID,
      };
      try {
        setIsValidate(true);
        const response = await axios.post(
          `${API_BASE_URL}/solution-steps`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              // Cap progress to 95% during upload
              setProgress(Math.min(percentCompleted, 95));
            },
          },
        );
        if (response.status) {
          setIsValidate(false);
          setQuestionFinalizing(true);
          setProgress(100);
          setTimeout(() => {
            setProgress(0); // Reset progress bar after a short delay
          }, 1000);
          setId(null);
          setCall((prev) => !prev);
        }
      } catch (error) {
        setIsValidate(false);
        setUploadProgress(0);
        console.log("error while validating step", error);
      } finally {
        setIsQuestionProcessing(false);
        setQuestionFinalizing(false);
      }
    } else {
      try {
        const optimizedEditorContent =
          await optimizeEditorContent(modifiedFileText);
        const Steps = [...(inputData?.steps || [])];

        if (!selectedValue?.trim()) {
          toast.error(t("messages.stepTitle"));
          setIsValidate(false);
          return;
        }

        if (selectedCount === 0) {
          toast.error(t("messages.stepTime"));
          setIsValidate(false);
          return;
        }
        const assignedToUser =
          user?.id ||
          inputData?.user_with_participants?.find(
            (participant) => participant.email === inputData?.user?.email,
          )?.id;
        const payload = {
          title: selectedValue,
          count1: selectedCount || 0,
          count2: selectedCount,
          time_unit:
            inputData?.type === "Action1" ||
            inputData?.type === "Newsletter" ||
            inputData?.type === "Absence" ||
            inputData?.type === "Sprint"
              ? "days"
              : inputData?.type === "Task" ||
                  inputData?.type === "Prestation Client"
                ? "hours"
                : inputData?.type === "Quiz"
                  ? "seconds"
                  : inputData?.type === "Special"
                    ? timeUnit
                    : "minutes",

          time: selectedCount,
          // editor_type: modalType,
          editor_type: inputData?.type === "Newsletter" ? "Email" : modalType,
          editor_content:
            // modalType === "Editeur" ? optimizedEditorContent || "" : null,
            modalType === "Editeur" ||
            modalType === "Subtask" ||
            modalType === "Story" ||
            modalType === "Prestation" ||
            modalType === "Question" ||
            modalType === "Email"
              ? optimizedEditorContent || ""
              : null,
          file: null,
          status: "active",
          url: modalType === "Url" ? (link ? link : null) : null,
          // order_no: stepOrder,
          solution_id: meetingId,
          _method: "put",
        };
        setIsValidate(true);
        setIsQuestionProcessing(true);
        setQuestionFinalizing(false);
        setProgress(0); // Reset progress at the start

        const response = await axios.post(
          `${API_BASE_URL}/solution-steps/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setProgress(Math.min(percentCompleted, 95));
            },
          },
        );
        if (response.status) {
          console.log("step created successfully", response.data.data);
          setId(null);
          setIsValidate(false);
          setCall((prev) => !prev);
          setQuestionFinalizing(true);
          setProgress(100);
          setTimeout(() => {
            setProgress(0); // Reset progress bar after a short delay
          }, 1000);
        }
      } catch (error) {
        setProgress(0);
        setIsValidate(false);
      } finally {
        setIsQuestionProcessing(false);
        setQuestionFinalizing(false);
      }
    }

    setSelectedValue("");
    setUser("");
    setTeam("");
    setModifiedFileText("");
    setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
    setModalType("");
    setFileName(null);
    setExcelData(null);
    setLink(null);
    setIsValidate(false);
    if (!createAnother) {
      closeModal();
    } else {
      if (inputData?.type === "Newsletter") {
        setModalType("Email");
      } else if (inputData?.type === "Special") {
        setModalType("Audio Report");
      } else if (inputData?.type === "Law") {
        setModalType("Question");
      } else if (inputData?.type === "Task") {
        setModalType("Subtask");
      } else if (inputData?.type === "Absence") {
        setModalType("Absence CET non payable");
      } else if (inputData?.type === "Task") {
        setModalType("Subtask");
      } else if (inputData?.type === "Sprint") {
        setModalType("Story");
      } else if (inputData?.type === "Prestation Client") {
        setModalType("Prestation");
      } else {
        setModalType("Editeur");
      }
    }
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleOpenDialog = () => {
    setShowConfirmation(true);
  };
  const handleClose = () => {
    setShowConfirmation(false);
    setFileUploaded(false);
  };

  const cancelStep = () => {
    setShowConfirmation(false);
    closeModal();
    setId(null);
    setCreateAnother(false);
    setSelectedValue("");
    setUser("");
    setTeam("");
    setModifiedFileText("");
    setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
    setModalType("");
    setFileName(null);
    setExcelData(null);
    setLink(null);
    setIsValidate(false);
    setFileUploaded(false);
  };

  const [step, setStep] = useState(null);
  const [stepCreator, setStepCreator] = useState(null);
  const [stepCreatorImg, setStepCreatorImg] = useState(null);
  useEffect(() => {
    const getStep = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/solution-steps/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        if (response.status === 200) {
          const stepData = response.data?.data;
          setStep(stepData);
          setLink(stepData?.url);
          setShowPreview(true);
          setPreviewUrl(stepData?.url);
          setSelectedValue(stepData?.title);
          setStepCreator(
            stepData?.solution_step_creator?.full_name
              ? stepData?.solution_step_creator?.full_name
              : stepData?.assigned_to_name,
          );
          setStepCreatorImg(
            stepData?.solution_step_creator?.image
              ? stepData?.solution_step_creator?.image
              : stepData?.assigned_to_image || stepData?.image,
          );
          setModifiedFileText(stepData?.editor_content);
          setAssignUser(response.data?.data?.assigned_to_name);
          setSelectedCount(stepData?.count2);
          setUser(response.data?.data?.participant);
          setTeam(response.data?.data?.assigned_team);
          setTimeUnit(stepData?.time_unit);
          setFileName(stepData?.file);
          if (stepData?.editor_type === "Excel") {
            const fileResponse = await axios.get(
              Assets_URL + "/" + stepData?.file,
              {
                responseType: "arraybuffer",
              },
            );
            console.log("file response", fileResponse);

            const fileData = fileResponse.data;
            const workbook = read(fileData, { type: "buffer" });

            // Convert the first sheet to JSON
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonSheetData = utils.sheet_to_json(worksheet, { header: 1 });

            const formattedData = jsonSheetData.map((row, rowIndex) =>
              row.map((cell, cellIndex) => ({
                value: cell,
                readOnly: rowIndex === 0,
              })),
            );
            setExcelData(formattedData);
          }
          setModalType(stepData?.editor_type);

          // setFileUploaded(false)

          // setIsUpdate(true);
          if (id && !isDrop) {
            setIsUpdate(true);
            const stepTime = stepData?.step_time; // e.g., "12:22:31 PM"
            const stepDate = stepData?.start_date;
            if (stepTime) {
              const timeParts = stepTime?.split(" "); // Split by space to separate time and AM/PM
              const [hour, minute, second] = timeParts[0]?.split(":"); // Get hour and minute
              const amPm = timeParts[1]; // Extract AM/PM
              // Convert 12-hour time format to 24-hour format
              const hour24 =
                amPm === "PM" && hour !== "12"
                  ? parseInt(hour, 10) + 12
                  : amPm === "AM" && hour === "12"
                    ? "00"
                    : hour;

              // Check if the current step's time unit is 'seconds'
              const formattedTime =
                stepData?.time_unit === "seconds"
                  ? `${hour24}h${minute}m${second}` // Include seconds
                  : `${hour24}h${minute}`; // Omit seconds
              setStoredStartTime(formattedTime);
              // Reformat the date to DD/MM/YYYY
              const formattedDate = moment(stepDate, "YYYY-MM-DD").format(
                "DD/MM/YYYY",
              );
              setStoredStartDate(formattedDate);
            }
            // setFileUploaded(false)
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getStep();
    }
  }, [id]);

  const [isDeleted, setIsDeleted] = useState(false);
  const deleteStep = async () => {
    const solutionCreatorId = parseInt(meeting1?.solution_creator?.id);

    if (
      meeting1?.solution_privacy === "public" &&
      solutionCreatorId !== userID
    ) {
      toast.error(
        t(
          "You are not the creator of this solution, you cannot perform this action",
        ),
      );
      return;
    }

    // if (
    //   meeting1?.location === "Google Meet" ||
    //   meeting1?.location === "Microsoft Teams" ||
    //   meeting1?.agenda === "Google Agenda" ||
    //   meeting1?.agenda === "Outlook Agenda"
    // ) {
    //   toast.error(t("For the Agenda Creation At least one step is required"));
    //   return;
    // }
    try {
      setIsDeleted(true);

      const response = await axios.delete(
        `${API_BASE_URL}/solution-steps/${id}`,
        {
          headers: {
            Authorization: `Bearer ${CookieService.get("token")}`,
          },
        },
      );
      if (response.data) {
        toast.success(t("messages.stepDeleted"));
        const updatedSteps = inputData?.solution_steps?.filter(
          (step) => step.id !== id,
        );

        const reorderedSteps = updatedSteps.map((step, index) => ({
          ...step,
          order_no: index + 1,
        }));
        // Call the reorder API to save the new order in the database
        await axios.post(
          `${API_BASE_URL}/solution-steps/reorder`,
          {
            solution_id: inputData?.id,
            solution_steps: reorderedSteps.map((step) => ({
              id: step.id,
              order_no: step.order_no, // Pass updated order_no to API
            })),
            _method: "post",
          },
          {
            headers: {
              Authorization: `Bearer ${CookieService.get("token")}`,
            },
          },
        );
        // await getMeeting1();
        setCall((prev) => !prev);

        closeModal();
        setCreateAnother(false);
        setSelectedValue("");
        setUser("");
        setTeam("");
        setModifiedFileText("");
        setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
        setModalType("");
        setFileName(null);
        setExcelData(null);
        setLink(null);
        setIsValidate(false);
        setIsUpdate(false);
      }
    } catch (error) {
      console.log("error while deleting step", error);
      closeModal();
      setCreateAnother(false);
      setSelectedValue("");
      setUser("");
      setTeam("");
      setModifiedFileText("");
      setSelectedCount(inputData?.type === "Sprint" ? 0.5 : 0);
      setModalType("");
      setFileName(null);
      setExcelData(null);
      setLink(null);
      setIsValidate(false);
    } finally {
      setIsDeleted(false);
      setShowStepModal(false);
    }
  };

  const [error, setError] = useState("");

  const handleLinkUpload = (e) => {
    const url = e.target.value;
    setLink(url);

    if (url && !isYoutubeUrl(url)) {
      setError(t("YoutubeLink"));
    } else {
      setError(""); // Clear error if the link is valid
    }
  };

  const clearLink = () => {
    setLink("");
    setError(""); // Clear error when clearing the input
  };

  const isYoutubeUrl = (url) => {
    const regex = /(youtube\.com|youtu\.be)/;
    return regex.test(url);
  };
  const getYoutubeEmbedUrl = (url) => {
    const videoId = url.split("v=")[1] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const [teams, setTeams] = useState([]);
  console.log("teams", teams);
  useEffect(() => {
    const getTeams = async () => {
      const token = CookieService.get("token");
      try {
        setLoading(true);

        const response = await axios.get(`${API_BASE_URL}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const filterredActiveTeams = response?.data?.data?.filter(
            (team) => team.status === "active",
          );
          if (getUserRoleID() === 3) {
            // setAllTeams(response?.data?.data);
            const teams = response.data.data.filter(
              (team) => team?.enterprise?.id === response?.data?.enterprise?.id,
            );
            setTeams(teams);
          } else {
            // setAllTeams(response?.data?.data);
            const teams = response.data.data.filter(
              (team) => team?.enterprise?.id === response?.data?.enterprise?.id,
            );
            setTeams(teams);
          }
        }
      } catch (error) {
        toast.error(t(error?.response?.data?.errors[0] || error?.message));
        // console.log("error message", error);
      } finally {
        setLoading(false);
      }
    };
    getTeams();
  }, [userID, checkId]);

  return (
    <>
      {show && (
        <div id="chart-container" className="chart-content">
          <div className="modal-overlay">
            <div className="modal-content" style={{ overflow: "unset" }}>
              <div className="d-flex justify-content-end p-3">
                <button className="cross-btn" onClick={deleteStepX}>
                  <RxCross2 size={18} />
                </button>
              </div>
              <div
                className="d-flex flex-wrap"
                style={{ borderBottom: "1px solid #EAECF0" }}
              >
                <div className="col-lg-4">
                  <div className="input-field step-inputfield">
                    <input
                      className="text-left form-control"
                      type="text"
                      placeholder={t("stepModal.title")}
                      value={selectedValue}
                      onChange={handleChange1}
                      style={{ padding: "9px" }}
                      disabled={disabled}
                    />
                  </div>
                </div>
                {/* <div className="col editor-header">
                  <div className="p-0 timecard stepinfo">
                    <p>{t("meeting.newMeeting.The stage starts at")}</p>
                    {inputData?.type === "Newsletter" ? (
                      <>
                        <h6 style={{ fontSize: "14px" }}>
                          {storedStartDate === "Invalid date"
                            ? "Date à compléter"
                            : storedStartDate}
                        </h6>
                      </>
                    ) : (
                      <>
                        <h5 className="step-time">
                          {storedStartTime === "Invalid date"
                            ? "Date à compléter"
                            : storedStartTime}
                        </h5>
                      </>
                    )}
                  </div>
                </div> */}
                <div className="col editor-header">
                  <div className="p-0 timecard stepinfo">
                    {!window.location.href.includes("/meetingDetail") && (
                      <div className="p-0 timecard">
                        <p className="mb-2">
                          {t("meeting.newMeeting.Step duration")}
                        </p>
                        <div className="d-flex justify-content-start align-items-center">
                          {inputData?.type === "Sprint" ? (
                            // 🔹 Dropdown shown only for Sprint
                            <select
                              value={selectedCount}
                              onChange={(e) =>
                                setSelectedCount(parseFloat(e.target.value))
                              }
                              disabled={disabled}
                              className="form-select step-timer"
                              style={{
                                width: "80px",
                                height: "30px",
                                fontSize: "14px",
                                padding: "2px 6px",
                              }}
                            >
                              {[0.5, 1, 2, 3, 5, 8, 13, 21].map((val) => (
                                <option key={val} value={val}>
                                  {val}
                                </option>
                              ))}
                            </select>
                          ) : (
                            // 🔹 Original + / - and input field for all other types
                            <div className="d-flex align-items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="16"
                                viewBox="0 0 17 16"
                                fill="none"
                                onClick={handleDecrementCount}
                                style={{ cursor: "pointer" }}
                              >
                                <rect
                                  x="0.8"
                                  width="16"
                                  height="16"
                                  rx="4"
                                  fill="white"
                                />
                                <path
                                  d="M4.13342 8H13.4668"
                                  stroke="#8280FF"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              <input
                                type="text"
                                value={selectedCount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (/^\d*$/.test(value)) {
                                    setSelectedCount(value);
                                  }
                                }}
                                disabled={disabled}
                                className="step-timer step-time"
                                style={{
                                  width: "25px",
                                  padding: "0",
                                  outline: "none",
                                }}
                              />

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="16"
                                viewBox="0 0 17 16"
                                fill="none"
                                onClick={handleIncrementCount}
                                style={{ cursor: "pointer" }}
                              >
                                <rect
                                  x="0.6"
                                  width="16"
                                  height="16"
                                  rx="4"
                                  fill="white"
                                />
                                <path
                                  d="M8.6001 3.5V12.5M13.1001 8H4.1001"
                                  stroke="#8280FF"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}

                          {/* 🔹 Time unit label */}
                          <div className="ms-2">
                            {inputData?.type === "Action1" ||
                            inputData?.type === "Newsletter" ||
                            inputData?.type === "Strategy" ||
                            inputData?.type === "Absence" ? (
                              <span>{t("days")}</span>
                            ) : inputData?.type === "Sprint" ? (
                              <span>{t("Story point")}</span>
                            ) : inputData?.type === "Task" ||
                              inputData?.type === "Prestation Client" ? (
                              <span>{t("hour")}</span>
                            ) : inputData?.type === "Quiz" ? (
                              <span>{t("sec")}</span>
                            ) : inputData?.type === "Special" ? (
                              <span>{t(`time_unit.${timeUnit}`)}</span>
                            ) : (
                              <span>mins</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col editor-header">
                  <div className="p-0 timecard stepinfo">
                    {!window.location.href.includes("/meetingDetail") && (
                      <div
                        className="p-0 timecard "
                        style={{ marginBottom: "4px" }}
                      >
                        <p className="mb-2">
                          {t("meeting.newMeeting.Step creator")}
                        </p>
                        <div className="d-flex justify-content-start">
                          <div>
                            {inputData?.type === "Newsletter" ? (
                              <>
                                <img
                                  src={
                                    creator?.image?.startsWith("users/")
                                      ? Assets_URL + "/" + creator?.image
                                      : creator?.image
                                  }
                                  alt={creator?.full_name}
                                  style={{
                                    borderRadius: "50%",
                                    height: "30px",
                                    width: "30px",
                                    objectFit: "cover",
                                    objectPosition: "top",
                                  }}
                                />
                                <span className="ml-2 step-time">
                                  {creator?.full_name}
                                </span>
                              </>
                            ) : (
                              <>
                                <img
                                  src={
                                    id
                                      ? stepCreatorImg?.startsWith("users/")
                                        ? Assets_URL + "/" + stepCreatorImg
                                        : stepCreatorImg
                                      : creator?.image?.startsWith("users/")
                                        ? Assets_URL + "/" + creator?.image
                                        : creator?.image
                                  }
                                  alt={id ? stepCreator : creator?.full_name}
                                  style={{
                                    borderRadius: "50%",
                                    height: "30px",
                                    width: "30px",
                                    objectFit: "cover",
                                    objectPosition: "top",
                                  }}
                                />
                                <span className="ml-2 step-time">
                                  {id ? stepCreator : creator?.full_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col editor-header">
                  <div className="p-0 timecard stepinfo">
                    {!window.location.href.includes("/meetingDetail") && (
                      <div className="p-0 timecard ">
                        <p className="mb-2">
                          {t("meeting.newMeeting.Step format")}
                        </p>
                        <div className="d-flex justify-content-start">
                          <div className="Editor-custom-dropdown">
                            <div
                              className="editor-dropdown-header"
                              onClick={() => {
                                if (
                                  meeting1?.solution_privacy === "public" &&
                                  Number(meeting1?.solution_creator?.id) !==
                                    userId
                                )
                                  return;
                                setIsOpen(!isOpen);
                              }}
                            >
                              {modalType === "Editeur"
                                ? t("stepModal.editor")
                                : modalType === "File"
                                  ? t("stepModal.pdf")
                                  : modalType === "Video"
                                    ? t("stepModal.video")
                                    : modalType === "Subtask"
                                      ? t("stepModal.subtask")
                                      : modalType === "Prestation"
                                        ? t("stepModal.prestation")
                                        : modalType === "Video Report"
                                          ? t("stepModal.videoReport")
                                          : modalType === "Audio Report"
                                            ? t("stepModal.audioReport")
                                            : modalType === "Photo"
                                              ? t("stepModal.photo")
                                              : modalType === "Email"
                                                ? t("stepModal.email")
                                                : modalType === "Url"
                                                  ? t("stepModal.url")
                                                  : modalType === "Excel"
                                                    ? t("stepModal.excel")
                                                    : modalType === "Story"
                                                      ? t("stepModal.story")
                                                      : // : modalType === "PowerPoint"
                                                        // ? t("stepModal.powerpoint")
                                                        modalType === "Question"
                                                        ? t(
                                                            "stepModal.laweditor",
                                                          )
                                                        : modalType ===
                                                            "Message"
                                                          ? t(
                                                              "stepModal.message",
                                                            )
                                                          : modalType ===
                                                              "Absence CET non payable"
                                                            ? t(
                                                                "meeting.absence_step_type.absence_type_1",
                                                              )
                                                            : modalType ===
                                                                "Absence CET payable"
                                                              ? t(
                                                                  "meeting.absence_step_type.absence_type_2",
                                                                )
                                                              : modalType ===
                                                                  "Partial unemployment"
                                                                ? t(
                                                                    "meeting.absence_step_type.absence_type_3",
                                                                  )
                                                                : modalType ===
                                                                    "Paid leave"
                                                                  ? t(
                                                                      "meeting.absence_step_type.absence_type_4",
                                                                    )
                                                                  : modalType ===
                                                                      "Corporate event"
                                                                    ? t(
                                                                        "meeting.absence_step_type.absence_type_5",
                                                                      )
                                                                    : modalType ===
                                                                        "Skills sponsorship"
                                                                      ? t(
                                                                          "meeting.absence_step_type.absence_type_6",
                                                                        )
                                                                      : modalType ===
                                                                          "Recovery"
                                                                        ? t(
                                                                            "meeting.absence_step_type.absence_type_7",
                                                                          )
                                                                        : modalType ===
                                                                            "RTT"
                                                                          ? t(
                                                                              "meeting.absence_step_type.absence_type_8",
                                                                            )
                                                                          : modalType}
                              <ExpandIcon />
                            </div>
                            {isOpen && (
                              <ul className="editor-dropdown-list">
                                {inputData?.type === "Newsletter" ? (
                                  <>
                                    {newsletterOption.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : inputData?.type === "Law" ? (
                                  <>
                                    {LawOption.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : inputData?.type === "Task" ? (
                                  <>
                                    {taskOption.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : inputData?.type === "Sprint" ? (
                                  <>
                                    {storyOption.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : inputData?.type === "Prestation Client" ? (
                                  <>
                                    {prestationOption.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : inputData?.type === "Special" ? (
                                  <>
                                    {SpecialMeetingOptions.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                ) : (
                                  <>
                                    {options.map((option) => (
                                      <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => handleSelect(option)}
                                      >
                                        {option.icon} {option.label}
                                      </li>
                                    ))}
                                  </>
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="modal-body"
                style={{
                  background: "#F2F4FB",
                  height: "90vh",
                  minHeight: "90vh",
                  padding: 0,
                }}
              >
                {(isProcessing || finalizing) && (
                  <div className="progress-container">
                    <div
                      className="progress"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {(isQuestionProcessing || questionFinalizing) && (
                  <div className="progress-container">
                    <div
                      className="progress"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <div>
                  <div className="row">
                    {modalType === "Editeur" ||
                    modalType === "Subtask" ||
                    modalType === "Story" ||
                    modalType === "Prestation" ||
                    modalType === "Question" ||
                    modalType === "Email" ? (
                      <div className="col-md-12">
                        <div>
                          <Editor
                            disabled={fromReport}
                            className="editor-no-border text_editor"
                            id="text_editor"
                            apiKey={TINYMCEAPI}
                            value={modifiedFileText}
                            name="text"
                            init={{
                              statusbar: false,
                              branding: false,
                              // height: 700,
                              height: 450,
                              border: "none",
                              menubar: true,
                              language: "fr_FR",
                              // setup: (editor) => {
                              //   editor.on("init", () => {
                              //     const editorIframe = document.querySelector(
                              //       ".tox-edit-area iframe"
                              //     );
                              //     const editorContainer =
                              //       document.querySelector(".tox-tinymce");
                              //     if (editorIframe) {
                              //       editorIframe.style.border = "none";
                              //     }
                              //     if (editorContainer) {
                              //       editorContainer.style.border = "none";
                              //     }
                              //   });
                              // },
                              plugins:
                                inputData?.type === "Law"
                                  ? "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern"
                                  : "print preview paste searchreplace autolink directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern",
                              toolbar:
                                inputData?.type === "Law"
                                  ? "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat"
                                  : "formatselect | bold italic underline strikethrough | forecolor backcolor blockquote | image | link media | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | removeformat",
                              image_advtab: inputData?.type !== "Law",
                              file_picker_types:
                                inputData?.type === "Law" ? "" : "image media",
                              file_picker_callback: function (
                                callback,
                                value,
                                meta,
                              ) {
                                if (
                                  meta.filetype === "image" &&
                                  inputData?.type !== "Law"
                                ) {
                                  const input = document.createElement("input");
                                  input.setAttribute("type", "file");
                                  input.setAttribute("accept", "image/*");

                                  input.onchange = function () {
                                    const file = input.files[0];
                                    const reader = new FileReader();

                                    reader.onload = function (e) {
                                      const img = new Image();
                                      img.src = e.target.result;

                                      img.onload = function () {
                                        const canvas =
                                          document.createElement("canvas");
                                        const ctx = canvas.getContext("2d");
                                        const maxWidth = 700;
                                        const maxHeight = 394;

                                        let newWidth = img.width;
                                        let newHeight = img.height;

                                        if (img.width > maxWidth) {
                                          newWidth = maxWidth;
                                          newHeight =
                                            (img.height * maxWidth) / img.width;
                                        }

                                        if (newHeight > maxHeight) {
                                          newHeight = maxHeight;
                                          newWidth =
                                            (img.width * maxHeight) /
                                            img.height;
                                        }

                                        canvas.width = newWidth;
                                        canvas.height = newHeight;

                                        ctx.drawImage(
                                          img,
                                          0,
                                          0,
                                          newWidth,
                                          newHeight,
                                        );

                                        const resizedImageData =
                                          canvas.toDataURL(file.type);
                                        callback(resizedImageData, {
                                          alt: file.name,
                                        });
                                      };

                                      img.src = e.target.result;
                                    };

                                    reader.readAsDataURL(file);
                                  };

                                  input.click();
                                }
                              },
                              setup: (editor) => {
                                // Disable pasting images and media
                                editor.on("paste", (event) => {
                                  if (inputData?.type === "Law") {
                                    const clipboard =
                                      event.clipboardData ||
                                      window.clipboardData;
                                    const items = clipboard.items || [];
                                    for (const item of items) {
                                      if (
                                        item.type?.startsWith("image") ||
                                        item.type?.startsWith("video")
                                      ) {
                                        event.preventDefault();
                                        console.warn(
                                          "Pasting images and videos is not allowed for 'Law' type content.",
                                        );
                                        return;
                                      }
                                    }
                                  }
                                });
                              },
                            }}
                            onEditorChange={(content) => {
                              setModifiedFileText(content);
                            }}
                          />
                        </div>
                        {/* ))} */}
                        <div></div>
                      </div>
                    ) : modalType === "Absence CET non payable" ||
                      modalType === "Absence CET payable" ||
                      modalType === "Partial unemployment" ||
                      modalType === "Paid leave" ||
                      modalType === "Corporate event" ||
                      modalType === "Skills sponsorship" ||
                      modalType === "Recovery" ||
                      modalType === "RTT" ? (
                      <div className="col-md-12">
                        <div>
                          <textarea
                            style={{
                              width: "100%",
                              minHeight: "450px",
                              whiteSpace: "pre-wrap", // Preserve line breaks
                              lineHeight: "1.5", // Better readability
                              padding: "10px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              backgroundColor: "#f9f9f9",
                              // cursor: 'not-allowed' // Indicate readonly
                              outline: "none",
                            }}
                            value={staticContents[modalType] || ""}
                            readOnly
                          />
                        </div>
                        <div></div>
                      </div>
                    ) : modalType === "File" ||
                      modalType === "Video" ||
                      modalType === "Excel" ||
                      modalType === "Photo" ||
                      modalType === "Video Report" ||
                      modalType === "Audio Report" ? (
                      <>
                        <div className="col-md-12 p-4">
                          {!isUpload ? (
                            <>
                              <div
                                className={`d-flex align-items-center gap-4 ${
                                  fileName ? "" : "h-100"
                                }`}
                              >
                                <div
                                  {...getRootProps()}
                                  style={{
                                    border: "1px dashed #BAC3D4",
                                    padding: "5px 7px",
                                    width: fileName ? "auto" : "100%",
                                    borderRadius: "50px",
                                    outline: "none",
                                    margin: fileName ? "" : "0 auto",
                                    height: fileName ? "auto" : "80vh",
                                    cursor: "pointer",
                                  }}
                                >
                                  <input {...getInputProps()} />
                                  {isUpload ? (
                                    <p>Uploading...</p>
                                  ) : fileName ? (
                                    <div>Selected file: {fileName}</div>
                                  ) : (
                                    <>
                                      <p className="upload-container">
                                        <span className="upload-text">
                                          Drag and drop here to upload
                                        </span>
                                        <span className="upload-or">OR</span>
                                        <span className="browse-button">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M10.2083 2.36166C9.82496 2.29666 9.30163 2.29166 8.35829 2.29166C6.76079 2.29166 5.62496 2.29332 4.76496 2.40832C3.92163 2.52082 3.43746 2.73332 3.08496 3.08499C2.73246 3.43749 2.52079 3.92082 2.40829 4.75916C2.29329 5.61582 2.29163 6.74416 2.29163 8.33416V11.6675C2.29163 13.2558 2.29329 14.3842 2.40829 15.2408C2.52079 16.0792 2.73246 16.5625 3.08496 16.9158C3.43746 17.2675 3.92079 17.4792 4.75913 17.5917C5.61579 17.7075 6.74413 17.7083 8.33329 17.7083H11.6666C13.2558 17.7083 14.385 17.7067 15.2416 17.5917C16.0791 17.4792 16.5625 17.2675 16.915 16.915C17.2675 16.5625 17.4791 16.0792 17.5916 15.2408C17.7066 14.385 17.7083 13.2558 17.7083 11.6667V11.3025C17.7083 10.0225 17.7 9.41582 17.5633 8.95832H14.955C14.0108 8.95832 13.24 8.95832 12.63 8.87666C11.9941 8.79082 11.4425 8.60582 11.0016 8.16499C10.5608 7.72416 10.3758 7.17332 10.29 6.53582C10.2083 5.92749 10.2083 5.15582 10.2083 4.21082V2.36166ZM11.4583 3.00832V4.16666C11.4583 5.16666 11.46 5.85332 11.5291 6.36916C11.5958 6.86749 11.7158 7.11166 11.8858 7.28082C12.055 7.45082 12.2991 7.57082 12.7975 7.63749C13.3133 7.70666 14 7.70832 15 7.70832H16.6833C16.3635 7.40382 16.0385 7.10488 15.7083 6.81166L12.4091 3.84249C12.0979 3.558 11.7809 3.27988 11.4583 3.00832ZM8.47913 1.04166C9.63329 1.04166 10.3791 1.04166 11.065 1.30416C11.7508 1.56749 12.3025 2.06416 13.1566 2.83332L13.2458 2.91332L16.5441 5.88249L16.6483 5.97582C17.635 6.86332 18.2733 7.43749 18.6158 8.20749C18.9591 8.97749 18.9591 9.83582 18.9583 11.1625V11.7133C18.9583 13.245 18.9583 14.4583 18.8308 15.4075C18.6991 16.3842 18.4225 17.175 17.7991 17.7992C17.175 18.4225 16.3841 18.6992 15.4075 18.8308C14.4575 18.9583 13.245 18.9583 11.7133 18.9583H8.28663C6.75496 18.9583 5.54163 18.9583 4.59246 18.8308C3.61579 18.6992 2.82496 18.4225 2.20079 17.7992C1.57746 17.175 1.30079 16.3842 1.16913 15.4075C1.04163 14.4575 1.04163 13.245 1.04163 11.7133V8.28749C1.04163 6.75582 1.04163 5.54249 1.16913 4.59332C1.30079 3.61666 1.57746 2.82582 2.20079 2.20166C2.82579 1.57749 3.61829 1.30166 4.59913 1.16999C5.55246 1.04249 6.77163 1.04249 8.31163 1.04249H8.35829L8.47913 1.04166Z"
                                              fill="#0026B1"
                                            />
                                          </svg>
                                          Browse
                                        </span>
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                              {fileName && modalType !== "Excel" ? (
                                <div className="mt-2">
                                  <div className="pdf-preview">
                                    <iframe
                                      title="PDF Preview"
                                      src={`${Assets_URL}/${fileName}#toolbar=0&view=fitH`}
                                      width="100%"
                                      height="90vh"
                                      style={{ minHeight: "500px" }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                excelData && (
                                  <div className="pdf-preview spreadsheet-height mt-2">
                                    <Spreadsheet
                                      data={excelData}
                                      onChange={handleSpreadsheetChange}
                                    />
                                  </div>
                                )
                              )}
                              {/* {excelData && (
                                <div className="pdf-preview">
                                  <Spreadsheet
                                    data={excelData}
                                    onChange={(newData) => console.log(newData)} // Optional: Handle changes to the spreadsheet
                                  />
                                </div>
                              )} */}
                            </>
                          ) : (
                            <Spinner
                              animation="border"
                              role="status"
                              className="center-spinner"
                            ></Spinner>
                          )}
                        </div>
                      </>
                    ) : modalType === "Url" ? (
                      <>
                        <div
                          className="col-md-12"
                          style={{ backgroundColor: "white" }}
                        >
                          <div className="box mt-2" style={{ height: "70px" }}>
                            <div
                              className="link-input-container"
                              style={{ width: "95%" }}
                            >
                              {/* Left arrow outside the input field */}
                              <span className="link-input-arrow">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M5.25 11.25H20.25C20.4489 11.25 20.6397 11.329 20.7803 11.4697C20.921 11.6103 21 11.8011 21 12C21 12.1989 20.921 12.3897 20.7803 12.5303C20.6397 12.671 20.4489 12.75 20.25 12.75H5.25C5.05109 12.75 4.86032 12.671 4.71967 12.5303C4.57902 12.3897 4.5 12.1989 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25Z"
                                    fill="#181818"
                                  />
                                  <path
                                    d="M5.5605 12L11.781 18.219C11.9218 18.3598 12.0009 18.5508 12.0009 18.75C12.0009 18.9491 11.9218 19.1401 11.781 19.281C11.6402 19.4218 11.4492 19.5009 11.25 19.5009C11.0508 19.5009 10.8598 19.4218 10.719 19.281L3.969 12.531C3.89915 12.4613 3.84374 12.3785 3.80593 12.2874C3.76812 12.1963 3.74866 12.0986 3.74866 12C3.74866 11.9013 3.76812 11.8036 3.80593 11.7125C3.84374 11.6214 3.89915 11.5386 3.969 11.469L10.719 4.71897C10.8598 4.57814 11.0508 4.49902 11.25 4.49902C11.4492 4.49902 11.6402 4.57814 11.781 4.71897C11.9218 4.8598 12.0009 5.05081 12.0009 5.24997C12.0009 5.44913 11.9218 5.64014 11.781 5.78097L5.5605 12Z"
                                    fill="#181818"
                                  />
                                </svg>
                              </span>
                              <div className="link-input-inner-container">
                                <input
                                  type="text"
                                  placeholder="Enter YouTube URL"
                                  value={link}
                                  onChange={handleLinkUpload}
                                  name="url"
                                  className={error ? "error-border" : ""}
                                />
                                {link && (
                                  <span
                                    className="link-input-clear"
                                    onClick={clearLink}
                                  >
                                    ✕
                                  </span>
                                )}
                                {error && (
                                  <div
                                    style={{ color: "red", marginTop: "5px" }}
                                  >
                                    {t("YoutubeLink")}
                                  </div>
                                )}
                              </div>
                            </div>

                            {link && !error && (
                              <div className=" mt-5">
                                <iframe
                                  width="100%"
                                  height="600px"
                                  src={getYoutubeEmbedUrl(link)}
                                  title="Preview"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
              {meeting1?.solution_privacy === "public" &&
              Number(meeting1?.solution_creator?.id) !== userId ? null : (
                <div className="modal-footer-step step-chart-modal-footer align-items-center">
                  {/* Checkbox for "Create another" */}
                  {(id === null || fileUploaded) && (
                    <div className="form-check me-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="createAnotherCheckbox"
                        checked={createAnother}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="createAnotherCheckbox"
                      >
                        {t("meeting.formState.CreateAnother")}
                      </label>
                    </div>
                  )}
                  <button
                    className={`btn moment-btn`}
                    style={{ marginRight: "9px" }}
                    onClick={() => {
                      modalType === "Question"
                        ? validateQuestionStep()
                        : validateStep();
                    }}
                    disabled={isValidate}
                  >
                    {isValidate ? (
                      <Spinner
                        as="div"
                        variant="light"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        animation="border"
                        style={{
                          margin: "2px 12px",
                        }}
                      />
                    ) : isUpdate && !isDrop ? (
                      t("meeting.formState.Update")
                    ) : (
                      t("meeting.formState.Create")
                    )}
                  </button>
                  {isUpdate && !isDrop && (
                    <button
                      className={`btn moment-btn`}
                      style={{ marginRight: "9px", backgroundColor: "red" }}
                      onClick={deleteStep}
                      disabled={isDeleted}
                    >
                      {isDeleted ? (
                        <Spinner
                          as="div"
                          variant="light"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          animation="border"
                          style={{
                            margin: "2px 12px",
                          }}
                        />
                      ) : (
                        t("meeting.formState.Delete")
                      )}
                    </button>
                  )}
                  <button
                    className={`btn`}
                    style={{
                      outline: "none",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "10px",
                      fontSize: "16px",
                      color: "#0026b1",
                    }}
                    onClick={handleOpenDialog}
                  >
                    {t("meeting.formState.Cancel")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Modal
        show={showConfirmation}
        onHide={handleClose}
        dialogClassName="custom-modal-size custom-modal-border modal-dialog-centered"
      >
        <Modal.Header
          closeButton
          className="border-0"
          onClick={handleClose}
        ></Modal.Header>
        <Modal.Body className="text-center p-4">
          <h2 className="w-100 text-center fs-5 mb-4">
            {t("meeting.formState.step.Cancel Step")}
          </h2>
          {/* <p className="mb-4" style={{ color: "#92929D" }}>
            {t("meeting.formState.step.ConfirmDelete")}
          </p> */}
          <div className="d-flex justify-content-center gap-3 mb-3">
            <Button
              variant="outline-danger"
              className="px-4 py-2 confirmation-delete"
              onClick={cancelStep}
            >
              {t("meeting.formState.step.ConfirmBtn")}
            </Button>
            <Button
              variant="primary"
              className="px-4 py-2 confirmation-save"
              onClick={handleClose}
            >
              {t("meeting.formState.step.CancelBtn")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StepChart;
